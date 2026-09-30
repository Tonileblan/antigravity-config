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
import { existsSync, readFileSync } from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_DIR = path.join(__dirname, "auth_info");
const PENDING_FILE = path.join(AUTH_DIR, "pending_batch_messages.json");
const TELEGRAM_CONFIG_PATH = path.join(__dirname, "..", "telegram-mcp", "config.json");

// Configuración de lotes
const BATCH_THRESHOLD = 20;
const TARGET_GROUP_JID = "120363401253024491@g.us"; // I Future Trader Academy 🦁

let telegramToken = "8116749609:AAGjVbFCrN3FObvP7XGyAa2CDHbeB9AVK9Y";
let telegramChatId = "2040004034";

try {
  if (existsSync(TELEGRAM_CONFIG_PATH)) {
    const tConfig = JSON.parse(readFileSync(TELEGRAM_CONFIG_PATH, "utf8"));
    if (tConfig.botToken) telegramToken = tConfig.botToken;
    if (tConfig.defaultChatId) telegramChatId = tConfig.defaultChatId;
  }
} catch (e) {}

// Cargar mensajes pendientes
let pendingMessages = [];
if (existsSync(PENDING_FILE)) {
  try {
    pendingMessages = JSON.parse(readFileSync(PENDING_FILE, "utf8"));
  } catch (e) {
    pendingMessages = [];
  }
}

async function savePending() {
  try {
    await fs.writeFile(PENDING_FILE, JSON.stringify(pendingMessages, null, 2), "utf8");
  } catch (e) {
    console.error("[Monitor] Error guardando pendientes:", e.message);
  }
}

async function sendTelegramNotification(text) {
  try {
    const encoded = encodeURIComponent(text);
    const url = `https://api.telegram.org/bot${telegramToken}/sendMessage?chat_id=${telegramChatId}&parse_mode=HTML&text=${encoded}`;
    const res = await fetch(url);
    const json = await res.json();
    return json.ok;
  } catch (err) {
    console.error("[Monitor] Error enviando a Telegram:", err.message);
    return false;
  }
}

function generateDigest(messages) {
  const count = messages.length;
  const senders = new Set(messages.map((m) => m.sender));
  const startTime = new Date(messages[0].timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const endTime = new Date(messages[messages.length - 1].timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  let text = `🦁 <b>[RESUMEN IFT ACADEMY - LOTE DE ${count} MENSAJES]</b> 📊\n\n`;
  text += `⏱ <b>Período:</b> ${startTime} ➔ ${endTime}\n`;
  text += `👥 <b>Participantes activos:</b> ${senders.size} miembros (${Array.from(senders).slice(0, 4).join(", ")}${senders.size > 4 ? "..." : ""})\n\n`;
  text += `📝 <b>Extracto de las Conversaciones Clave:</b>\n`;

  // Muestra de los puntos más relevantes
  const sample = messages.slice(-10);
  for (const m of sample) {
    const cleanText = m.text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const preview = cleanText.length > 90 ? cleanText.substring(0, 90) + "..." : cleanText;
    text += `• <b>${m.sender}:</b> ${preview}\n`;
  }

  text += `\n💡 <i>El monitor sigue activo. Recibirás el próximo resumen cuando se alcancen otros 20 mensajes.</i>`;
  return text;
}

async function processBatchIfReady() {
  if (pendingMessages.length >= BATCH_THRESHOLD) {
    console.log(`[Monitor] Se ha alcanzado el umbral de ${pendingMessages.length} mensajes. Generando resumen...`);
    const batchToSend = [...pendingMessages];
    const digestText = generateDigest(batchToSend);

    const ok = await sendTelegramNotification(digestText);
    if (ok) {
      console.log("[Monitor] Resumen enviado con éxito a Telegram!");
      pendingMessages = [];
      await savePending();
    } else {
      console.error("[Monitor] Fallo al enviar a Telegram, se mantendrán en cola.");
    }
  } else {
    console.log(`[Monitor] Mensajes acumulados en lote: ${pendingMessages.length}/${BATCH_THRESHOLD}`);
  }
}

async function startMonitor() {
  console.log(`🚀 Iniciando Daemon de Monitoreo WhatsApp (Umbral: cada ${BATCH_THRESHOLD} mensajes)...`);

  await fs.mkdir(AUTH_DIR, { recursive: true });
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
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
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "open") {
      console.log("🟢 [Monitor] Conectado a WhatsApp en segundo plano. Escuchando mensajes de IFT...");
    } else if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`🔴 [Monitor] Conexión cerrada (${statusCode}). Reintentando: ${shouldReconnect}`);
      if (shouldReconnect) {
        setTimeout(startMonitor, 4000);
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type === "notify" || type === "append") {
      for (const msg of messages) {
        const jid = msg.key.remoteJid;

        // Filtrar mensajes del grupo IFT Academy o grupos clave
        if (jid === TARGET_GROUP_JID) {
          const text =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            "";

          if (!text.trim()) continue;

          const sender = msg.pushName || (msg.key.fromMe ? "Yo" : "Miembro");
          const timestamp = msg.messageTimestamp
            ? new Date(Number(msg.messageTimestamp) * 1000).toISOString()
            : new Date().toISOString();

          console.log(`📩 [IFT] ${sender}: ${text.substring(0, 50)}...`);

          pendingMessages.push({
            id: msg.key.id,
            sender,
            text,
            timestamp,
          });

          await savePending();
          await processBatchIfReady();
        }
      }
    }
  });
}

startMonitor();
