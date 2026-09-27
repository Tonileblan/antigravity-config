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
} from "@whiskeysockets/baileys";
import pino from "pino";
import path from "path";
import fs from "fs/promises";
import { execFile, exec } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";

const execPromise = promisify(exec);
const execFilePromise = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_DIR = path.join(__dirname, "auth_info");

let sock = null;
let baileysState = "disconnected";
let currentQR = null;
let userInfo = null;
let messageStore = new Map();
let chatStore = new Map();

async function checkMacWhatsApp() {
  if (process.platform !== "darwin") {
    return { installed: false, running: false };
  }
  try {
    const script = `
      tell application "System Events"
        set isRunning to (count (every process whose bundle identifier is "net.whatsapp.WhatsApp")) > 0
      end tell
      return isRunning
    `;
    const { stdout } = await execFilePromise("osascript", ["-e", script]);
    const running = stdout.trim() === "true";
    return { installed: true, running, bundleId: "net.whatsapp.WhatsApp" };
  } catch (e) {
    return { installed: false, running: false, error: e.message };
  }
}

async function sendViaMacWhatsApp(phone, message) {
  const cleanedPhone = phone.replace(/[\s\+\-\(\)]/g, "");
  const encodedText = encodeURIComponent(message);
  const waUrl = `whatsapp://send?phone=${cleanedPhone}&text=${encodedText}`;

  // Abrir WhatsApp con el chat y texto pre-cargado
  await execPromise(`open "${waUrl}"`);

  // Esperar a que WhatsApp se enfoque y pulsar Enter para enviar
  const sendScript = `
    delay 0.8
    tell application "WhatsApp" to activate
    delay 0.2
    tell application "System Events"
      keystroke return
    end tell
  `;
  await execFilePromise("osascript", ["-e", sendScript]);

  return {
    method: "macos_whatsapp_desktop",
    success: true,
    recipient: cleanedPhone,
    message,
    timestamp: new Date().toISOString(),
  };
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
      auth: state,
      browser: Browsers.macOS("Desktop"),
      syncFullHistory: false,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
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
        console.error(`[WhatsApp MCP] Baileys conectado como ${sock.user?.id}`);
      }
    });

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
      if (type === "notify" || type === "append") {
        for (const msg of messages) {
          const jid = msg.key.remoteJid;
          if (!jid) continue;

          const text =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            "";

          const sender = msg.key.fromMe ? "me" : msg.pushName || jid;
          const timestamp = msg.messageTimestamp
            ? new Date(Number(msg.messageTimestamp) * 1000).toISOString()
            : new Date().toISOString();

          if (!messageStore.has(jid)) messageStore.set(jid, []);
          const history = messageStore.get(jid);
          history.push({ id: msg.key.id, sender, fromMe: msg.key.fromMe, text, timestamp });
          if (history.length > 50) history.shift();

          chatStore.set(jid, {
            jid,
            name: msg.pushName || jid.split("@")[0],
            lastMessage: text,
            lastUpdated: timestamp,
          });
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
  let cleaned = phoneOrJid.replace(/[\s\+\-\(\)]/g, "");
  if (!cleaned.includes("@")) {
    cleaned = `${cleaned}@s.whatsapp.net`;
  }
  return cleaned;
}

const server = new Server(
  {
    name: "whatsapp-mcp",
    version: "1.1.0",
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
    description: "Devuelve el estado de la conexión de WhatsApp (tanto la app de escritorio de macOS como el servicio WebSocket en segundo plano).",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "whatsapp_send_message",
    description: "Envía un mensaje de texto por WhatsApp a un número de teléfono (utiliza WhatsApp Desktop nativo de macOS o WebSocket directamente).",
    inputSchema: {
      type: "object",
      properties: {
        phone: {
          type: "string",
          description: "Número de teléfono con prefijo de país (ejemplo: '34612345678' o '+34 612 345 678').",
        },
        message: {
          type: "string",
          description: "Texto del mensaje que deseas enviar.",
        },
      },
      required: ["phone", "message"],
    },
  },
  {
    name: "whatsapp_open_chat",
    description: "Abre el chat de un contacto o número específico en la aplicación WhatsApp Desktop de macOS.",
    inputSchema: {
      type: "object",
      properties: {
        phone: {
          type: "string",
          description: "Número de teléfono con prefijo de país.",
        },
      },
      required: ["phone"],
    },
  },
  {
    name: "whatsapp_list_chats",
    description: "Lista las conversaciones y mensajes registrados recientemente.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Cantidad máxima de chats a devolver (por defecto 20).",
        },
      },
    },
  },
  {
    name: "whatsapp_get_chat_history",
    description: "Obtiene los últimos mensajes registrados de una conversación.",
    inputSchema: {
      type: "object",
      properties: {
        phone: {
          type: "string",
          description: "Número de teléfono o JID del chat.",
        },
        limit: {
          type: "number",
          description: "Cantidad de mensajes.",
        },
      },
      required: ["phone"],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "whatsapp_status": {
        const macStatus = await checkMacWhatsApp();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  connected: macStatus.running || baileysState === "connected",
                  macOSDesktopApp: macStatus,
                  webSocketService: {
                    status: baileysState,
                    user: userInfo || null,
                  },
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "whatsapp_send_message": {
        // Intentar primero por Baileys si está conectado
        if (baileysState === "connected" && sock) {
          try {
            const jid = normalizeJid(args.phone);
            const res = await sock.sendMessage(jid, { text: args.message });
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      method: "websocket_baileys",
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
          } catch (e) {
            console.error("[WhatsApp MCP] Fallo WebSocket, usando WhatsApp Desktop fallback:", e);
          }
        }

        // Fallback nativo ultra-fiable en macOS WhatsApp Desktop
        const desktopRes = await sendViaMacWhatsApp(args.phone, args.message);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(desktopRes, null, 2),
            },
          ],
        };
      }

      case "whatsapp_open_chat": {
        const cleaned = args.phone.replace(/[\s\+\-\(\)]/g, "");
        await execPromise(`open "whatsapp://send?phone=${cleaned}"`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: `Chat con ${cleaned} abierto en WhatsApp Desktop.`,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "whatsapp_list_chats": {
        const limit = args?.limit || 20;
        const chats = Array.from(chatStore.values()).slice(0, limit);
        const macStatus = await checkMacWhatsApp();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  macOSWhatsAppRunning: macStatus.running,
                  totalLoggedChats: chats.length,
                  chats,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "whatsapp_get_chat_history": {
        const jid = normalizeJid(args.phone);
        const history = messageStore.get(jid) || [];
        const limit = args?.limit || 20;

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  jid,
                  messages: history.slice(-limit),
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
