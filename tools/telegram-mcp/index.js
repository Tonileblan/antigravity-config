#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Bot, InputFile } from "grammy";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_PATH = path.join(__dirname, "config.json");

let botToken = process.env.TELEGRAM_BOT_TOKEN || "";
let botInstance = null;
let botInfo = null;

async function loadToken() {
  if (botToken) return botToken;
  try {
    const data = await fs.readFile(CONFIG_PATH, "utf8");
    const json = JSON.parse(data);
    if (json.botToken) {
      botToken = json.botToken;
    }
  } catch {}
  return botToken;
}

async function getBot() {
  const token = await loadToken();
  if (!token) return null;
  if (!botInstance) {
    botInstance = new Bot(token);
    try {
      botInfo = await botInstance.api.getMe();
      console.error(`[Telegram MCP] Bot autenticado: @${botInfo.username} (${botInfo.first_name})`);
    } catch (e) {
      console.error(`[Telegram MCP] Error al validar bot token: ${e.message}`);
      botInstance = null;
      botInfo = null;
    }
  }
  return botInstance;
}

const server = new Server(
  {
    name: "telegram-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const TOOLS = [
  {
    name: "telegram_status",
    description: "Comprueba el estado de la conexión con el Bot de Telegram y devuelve la información del bot (@username, ID, nombre).",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "telegram_set_token",
    description: "Guarda o actualiza el Bot Token de Telegram proporcionado por @BotFather.",
    inputSchema: {
      type: "object",
      properties: {
        token: {
          type: "string",
          description: "El token HTTP API del bot (ejemplo: '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ').",
        },
      },
      required: ["token"],
    },
  },
  {
    name: "telegram_send_message",
    description: "Envía un mensaje de texto a un chat, usuario o canal de Telegram.",
    inputSchema: {
      type: "object",
      properties: {
        chatId: {
          type: "string",
          description: "ID del chat (número entero o cadena) o @username del canal/grupo público (ej. '@micana' o '123456789').",
        },
        text: {
          type: "string",
          description: "Texto del mensaje que deseas enviar (soporta Markdown o HTML).",
        },
        parseMode: {
          type: "string",
          enum: ["Markdown", "HTML", "MarkdownV2"],
          description: "Modo de formateo del texto. Opcional.",
        },
      },
      required: ["chatId", "text"],
    },
  },
  {
    name: "telegram_get_updates",
    description: "Obtiene los últimos mensajes y actualizaciones recibidas por el bot de Telegram.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Cantidad máxima de actualizaciones a recuperar (1 a 100, por defecto 20).",
        },
      },
    },
  },
  {
    name: "telegram_get_chat",
    description: "Obtiene información detallada sobre un chat, usuario, grupo o canal de Telegram.",
    inputSchema: {
      type: "object",
      properties: {
        chatId: {
          type: "string",
          description: "ID del chat o @username.",
        },
      },
      required: ["chatId"],
    },
  },
  {
    name: "telegram_send_photo",
    description: "Envía una imagen a un chat de Telegram mediante URL o ruta local.",
    inputSchema: {
      type: "object",
      properties: {
        chatId: {
          type: "string",
          description: "ID del chat o @username.",
        },
        photo: {
          type: "string",
          description: "URL pública de la imagen o ruta absoluta en el sistema de archivos.",
        },
        caption: {
          type: "string",
          description: "Texto de pie de foto opcional.",
        },
      },
      required: ["chatId", "photo"],
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
      case "telegram_set_token": {
        const token = args.token.trim();
        const testBot = new Bot(token);
        const me = await testBot.api.getMe();

        botToken = token;
        botInstance = testBot;
        botInfo = me;

        await fs.writeFile(CONFIG_PATH, JSON.stringify({ botToken: token }, null, 2), "utf8");

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: `Bot @${me.username} (${me.first_name}) configurado y guardado correctamente.`,
                  bot: me,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "telegram_status": {
        const bot = await getBot();
        if (!bot || !botInfo) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    connected: false,
                    message: "No hay ningún Bot Token de Telegram configurado o el token es inválido.",
                    instructions:
                      "1. Abre Telegram y escribe a @BotFather\n2. Ejecuta /newbot para crear tu bot y obtener el token.\n3. Pega el token o usa la herramienta 'telegram_set_token'.",
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  connected: true,
                  bot: botInfo,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "telegram_send_message": {
        const bot = await getBot();
        if (!bot) {
          throw new Error("Bot no configurado. Proporciona primero el token con 'telegram_set_token'.");
        }

        const options = {};
        if (args.parseMode) options.parse_mode = args.parseMode;

        const sent = await bot.api.sendMessage(args.chatId, args.text, options);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  messageId: sent.message_id,
                  chat: sent.chat,
                  date: new Date(sent.date * 1000).toISOString(),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "telegram_get_updates": {
        const bot = await getBot();
        if (!bot) {
          throw new Error("Bot no configurado.");
        }

        const limit = args?.limit || 20;
        const updates = await bot.api.getUpdates({ limit });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  count: updates.length,
                  updates: updates.map((u) => ({
                    updateId: u.update_id,
                    message: u.message
                      ? {
                          messageId: u.message.message_id,
                          from: u.message.from,
                          chat: u.message.chat,
                          text: u.message.text,
                          date: new Date(u.message.date * 1000).toISOString(),
                        }
                      : null,
                    channelPost: u.channel_post
                      ? {
                          messageId: u.channel_post.message_id,
                          chat: u.channel_post.chat,
                          text: u.channel_post.text,
                          date: new Date(u.channel_post.date * 1000).toISOString(),
                        }
                      : null,
                  })),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "telegram_get_chat": {
        const bot = await getBot();
        if (!bot) throw new Error("Bot no configurado.");

        const chat = await bot.api.getChat(args.chatId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: true, chat }, null, 2),
            },
          ],
        };
      }

      case "telegram_send_photo": {
        const bot = await getBot();
        if (!bot) throw new Error("Bot no configurado.");

        let photoPayload = args.photo;
        if (!args.photo.startsWith("http://") && !args.photo.startsWith("https://")) {
          photoPayload = new InputFile(args.photo);
        }

        const sent = await bot.api.sendPhoto(args.chatId, photoPayload, {
          caption: args.caption,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  messageId: sent.message_id,
                  chat: sent.chat,
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
  console.error("Fatal error running Telegram MCP server:", err);
  process.exit(1);
});
