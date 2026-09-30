#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
  makeCacheableSignalKeyStore,
} from "@whiskeysockets/baileys";
import pino from "pino";
import path from "path";
import fs from "fs/promises";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { execFile, exec } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";

const execPromise = promisify(exec);
const execFilePromise = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_DIR = path.join(__dirname, "auth_info");
const DB_FILE = path.join(AUTH_DIR, "messages_db.json");

let sock = null;
let baileysState = "disconnected";
let currentQR = null;
let userInfo = null;

// Map: jid -> Array<{ id, sender, senderJid, fromMe, text, timestamp, isGroup, groupName }>
let messageStore = new Map();
// Map: jid -> { jid, name, isGroup, participantCount, lastMessage, lastUpdated }
let chatStore = new Map();

// Cargar almacenamiento persistente local si existe
function loadPersistedData() {
  try {
    if (existsSync(DB_FILE)) {
      const raw = readFileSync(DB_FILE, "utf-8");
      const data = JSON.parse(raw);
      if (data.chats && Array.isArray(data.chats)) {
        for (const chat of data.chats) {
          chatStore.set(chat.jid, chat);
        }
      }
      if (data.messages && typeof data.messages === "object") {
        for (const [jid, msgs] of Object.entries(data.messages)) {
          messageStore.set(jid, msgs);
        }
      }
    }
  } catch (err) {
    console.error("[WhatsApp MCP] Error al cargar DB local:", err.message);
  }
}

let saveTimeout = null;
function persistDataDebounced() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    try {
      await fs.mkdir(AUTH_DIR, { recursive: true });
      const messagesObj = {};
      for (const [jid, msgs] of messageStore.entries()) {
        messagesObj[jid] = msgs.slice(-100); // Guardar hasta los últimos 100 mensajes por chat
      }
      const payload = {
        lastSaved: new Date().toISOString(),
        chats: Array.from(chatStore.values()),
        messages: messagesObj,
      };
      await fs.writeFile(DB_FILE, JSON.stringify(payload, null, 2), "utf-8");
    } catch (e) {
      console.error("[WhatsApp MCP] Error guardando DB:", e.message);
    }
  }, 1000);
}

loadPersistedData();

async function syncAllGroups() {
  if (!sock || baileysState !== "connected") return;
  try {
    const groups = await sock.groupFetchAllParticipating();
    for (const [jid, group] of Object.entries(groups)) {
      const existing = chatStore.get(jid) || {};
      chatStore.set(jid, {
        jid,
        name: group.subject || existing.name || "Grupo sin nombre",
        isGroup: true,
        participantCount: group.participants?.length || 0,
        creation: group.creation ? new Date(group.creation * 1000).toISOString() : null,
        desc: group.desc || "",
        lastMessage: existing.lastMessage || "",
        lastUpdated: existing.lastUpdated || new Date().toISOString(),
      });
    }
    persistDataDebounced();
  } catch (err) {
    console.error("[WhatsApp MCP] Error al sincronizar grupos:", err.message);
  }
}

async function initBaileys() {
  try {
    await fs.mkdir(AUTH_DIR, { recursive: true });
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion();

    baileysState = "connecting";

    sock = makeWASocket({
      version,
      logger: pino({ level: "silent" }),
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
      },
      browser: Browsers.ubuntu("Chrome"),
      syncFullHistory: false,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        currentQR = qr;
        baileysState = "waiting_qr";
      }

      if (connection === "close") {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        baileysState = "disconnected";
        if (shouldReconnect) {
          setTimeout(initBaileys, 5000);
        }
      } else if (connection === "open") {
        baileysState = "connected";
        currentQR = null;
        userInfo = sock.user;
        console.error(`[WhatsApp MCP] Baileys conectado exitosamente como ${sock.user?.id}`);
        // Sincronizar metadatos de todos los grupos
        setTimeout(syncAllGroups, 2000);
      }
    });

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
      if (type === "notify" || type === "append") {
        for (const msg of messages) {
          const jid = msg.key.remoteJid;
          if (!jid) continue;

          const isGroup = jid.endsWith("@g.us");
          const text =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.videoMessage?.caption ||
            (msg.message?.audioMessage ? "[Audio/Nota de voz]" : "") ||
            (msg.message?.documentMessage ? `[Documento: ${msg.message.documentMessage.fileName || 'archivo'}]` : "") ||
            (msg.message?.imageMessage ? "[Imagen]" : "") ||
            "";

          const senderName = msg.pushName || (msg.key.fromMe ? "Yo" : "Desconocido");
          const senderJid = msg.key.participant || (msg.key.fromMe ? "Yo" : jid);
          const timestamp = msg.messageTimestamp
            ? new Date(Number(msg.messageTimestamp) * 1000).toISOString()
            : new Date().toISOString();

          let groupName = null;
          if (isGroup) {
            const cachedGroup = chatStore.get(jid);
            groupName = cachedGroup?.name || "Grupo de WhatsApp";
          }

          if (!messageStore.has(jid)) messageStore.set(jid, []);
          const history = messageStore.get(jid);
          history.push({
            id: msg.key.id,
            sender: senderName,
            senderJid,
            fromMe: Boolean(msg.key.fromMe),
            text,
            timestamp,
            isGroup,
            groupName,
          });

          if (history.length > 200) history.shift();

          const existingChat = chatStore.get(jid) || {};
          chatStore.set(jid, {
            jid,
            name: isGroup ? (existingChat.name || "Grupo") : (msg.pushName || existingChat.name || jid.split("@")[0]),
            isGroup,
            participantCount: existingChat.participantCount || (isGroup ? 0 : 1),
            lastMessage: text,
            lastSender: senderName,
            lastUpdated: timestamp,
          });

          persistDataDebounced();
        }
      }
    });
  } catch (err) {
    console.error("[WhatsApp MCP] Error al inicializar Baileys:", err);
    baileysState = "disconnected";
  }
}

// Iniciar Baileys en segundo plano
initBaileys();

function normalizeJid(phoneOrJid) {
  let cleaned = phoneOrJid.trim().replace(/[\s\+\-\(\)]/g, "");
  if (cleaned.endsWith("@g.us") || cleaned.endsWith("@s.whatsapp.net")) {
    return cleaned;
  }
  return `${cleaned}@s.whatsapp.net`;
}

const server = new Server(
  {
    name: "whatsapp-mcp",
    version: "2.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const TOOLS = [
  {
    name: "whatsapp_status",
    description: "Devuelve el estado de la conexión de WhatsApp Multi-Device (conectado, desconectado, esperando QR, usuario y conteo de chats/grupos).",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "whatsapp_list_groups",
    description: "Lista todos los grupos de WhatsApp en los que participas, con su JID, nombre/asunto, cantidad de participantes, último mensaje y fecha.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Límite máximo de grupos a devolver (por defecto 50).",
        },
        search: {
          type: "string",
          description: "Filtro de búsqueda por nombre de grupo (opcional).",
        },
      },
    },
  },
  {
    name: "whatsapp_get_group_messages",
    description: "Obtiene los mensajes registrados de un grupo de WhatsApp específico buscando por su nombre o su JID (@g.us). Permite filtrar por texto.",
    inputSchema: {
      type: "object",
      properties: {
        groupNameOrJid: {
          type: "string",
          description: "Nombre del grupo (ej: 'Trabajo', 'Familia', 'Comunidad') o JID directo (ej: '1203630...@g.us').",
        },
        limit: {
          type: "number",
          description: "Cantidad de mensajes recientes a devolver (por defecto 30).",
        },
        search: {
          type: "string",
          description: "Palabra o frase para filtrar mensajes dentro del grupo.",
        },
      },
      required: ["groupNameOrJid"],
    },
  },
  {
    name: "whatsapp_get_all_recent_messages",
    description: "Devuelve los mensajes más recientes registrados en todos los grupos y chats en orden cronológico.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Número total de mensajes a devolver (por defecto 40).",
        },
        onlyGroups: {
          type: "boolean",
          description: "Si es true, solo devuelve mensajes provenientes de grupos.",
        },
        search: {
          type: "string",
          description: "Filtro para buscar una palabra o tema en todos los mensajes.",
        },
      },
    },
  },
  {
    name: "whatsapp_send_message",
    description: "Envía un mensaje de texto a un número de teléfono individual o a un grupo de WhatsApp.",
    inputSchema: {
      type: "object",
      properties: {
        recipient: {
          type: "string",
          description: "Número de teléfono con prefijo (ej: '+34612345678') o JID de grupo ('120363...@g.us').",
        },
        message: {
          type: "string",
          description: "Texto del mensaje que deseas enviar.",
        },
      },
      required: ["recipient", "message"],
    },
  },
  {
    name: "whatsapp_list_chats",
    description: "Lista todas las conversaciones (individuales y grupos) registradas en la base de datos.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Cantidad máxima de chats a devolver (por defecto 30).",
        },
      },
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

async function ensureConnected(maxWaitMs = 6000) {
  if (baileysState === "connected") return true;
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    if (baileysState === "connected") return true;
    await new Promise((r) => setTimeout(r, 200));
  }
  return baileysState === "connected";
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Esperar a que la conexión esté lista si está conectando
  await ensureConnected(4000);

  try {
    switch (name) {
      case "whatsapp_status": {
        const groupsCount = Array.from(chatStore.values()).filter((c) => c.isGroup).length;
        const totalMessages = Array.from(messageStore.values()).reduce((acc, m) => acc + m.length, 0);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  connected: baileysState === "connected",
                  status: baileysState,
                  user: userInfo || null,
                  totalChats: chatStore.size,
                  totalGroups: groupsCount,
                  totalStoredMessages: totalMessages,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "whatsapp_list_groups": {
        const search = (args?.search || "").toLowerCase();
        let groups = Array.from(chatStore.values()).filter((c) => c.isGroup);

        if (search) {
          groups = groups.filter((g) => (g.name || "").toLowerCase().includes(search));
        }

        // Ordenar por última actividad
        groups.sort((a, b) => new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0));
        const limit = args?.limit || 50;

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  totalGroupsFound: groups.length,
                  groups: groups.slice(0, limit),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "whatsapp_get_group_messages": {
        const query = (args?.groupNameOrJid || "").trim();
        const search = (args?.search || "").toLowerCase();
        const limit = args?.limit || 30;

        // Buscar JID del grupo directamente o por coincidencia de nombre
        let targetJid = null;
        let matchedGroup = null;

        if (query.endsWith("@g.us")) {
          targetJid = query;
          matchedGroup = chatStore.get(targetJid);
        } else {
          const lowerQuery = query.toLowerCase();
          for (const [jid, chat] of chatStore.entries()) {
            if (chat.isGroup && (chat.name || "").toLowerCase().includes(lowerQuery)) {
              targetJid = jid;
              matchedGroup = chat;
              break;
            }
          }
        }

        if (!targetJid) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: false,
                    error: `No se encontró ningún grupo que coincida con '${query}'. Usa whatsapp_list_groups para ver los grupos disponibles.`,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        let messages = messageStore.get(targetJid) || [];
        if (search) {
          messages = messages.filter((m) => (m.text || "").toLowerCase().includes(search) || (m.sender || "").toLowerCase().includes(search));
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  groupJid: targetJid,
                  groupName: matchedGroup?.name || "Grupo",
                  totalMessagesCount: messages.length,
                  messages: messages.slice(-limit),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "whatsapp_get_all_recent_messages": {
        const limit = args?.limit || 40;
        const onlyGroups = args?.onlyGroups !== false; // true por defecto
        const search = (args?.search || "").toLowerCase();

        let allMsgs = [];
        for (const [jid, msgs] of messageStore.entries()) {
          for (const m of msgs) {
            if (onlyGroups && !m.isGroup) continue;
            if (search && !((m.text || "").toLowerCase().includes(search) || (m.sender || "").toLowerCase().includes(search) || (m.groupName || "").toLowerCase().includes(search))) {
              continue;
            }
            allMsgs.push({ ...m, jid });
          }
        }

        allMsgs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  totalFiltered: allMsgs.length,
                  messages: allMsgs.slice(-limit),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "whatsapp_send_message": {
        if (baileysState !== "connected" || !sock) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: "WhatsApp no está conectado. Primero vincula tu cuenta ejecutando auth.js.",
              },
            ],
          };
        }

        const jid = normalizeJid(args.recipient);
        const res = await sock.sendMessage(jid, { text: args.message });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  messageId: res?.key?.id,
                  recipient: jid,
                  message: args.message,
                  timestamp: new Date().toISOString(),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "whatsapp_list_chats": {
        const limit = args?.limit || 30;
        const chats = Array.from(chatStore.values())
          .sort((a, b) => new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0))
          .slice(0, limit);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  totalChats: chats.length,
                  chats,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Error en ${name}: ${error.message}`,
        },
      ],
    };
  }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

run().catch((err) => {
  console.error("Fatal error running WhatsApp MCP server:", err);
  process.exit(1);
});
