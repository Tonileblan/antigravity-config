import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers
} from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

import qrcodeTerminal from 'qrcode-terminal';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_DIR = path.join(__dirname, 'auth_info');
const QR_HTML_PATH = path.join(__dirname, 'qr.html');
const QR_PNG_PATH = path.join(__dirname, 'qr.png');

let browserOpened = false;

function openFileInBrowser(filePath) {
  if (process.platform === 'win32') {
    exec(`cmd.exe /c start "" "${filePath}"`);
  } else if (process.platform === 'darwin') {
    exec(`open "${filePath}"`);
  } else {
    exec(`xdg-open "${filePath}"`);
  }
}

async function writeHtmlQR(qrDataUrl, statusText = 'Escanea el código QR con WhatsApp') {
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vincular WhatsApp MCP</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0b141a;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      color: #e9edef;
    }
    .container {
      background: #111b21;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      text-align: center;
      max-width: 440px;
      width: 90%;
      border: 1px solid #222e35;
    }
    .badge {
      display: inline-block;
      background: #00a884;
      color: white;
      font-weight: 700;
      font-size: 13px;
      padding: 6px 14px;
      border-radius: 20px;
      margin-bottom: 16px;
      letter-spacing: 0.5px;
    }
    h1 {
      font-size: 24px;
      margin: 0 0 8px 0;
      color: #e9edef;
    }
    p {
      color: #8696a0;
      font-size: 14px;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .qr-frame {
      background: white;
      padding: 16px;
      border-radius: 16px;
      display: inline-block;
      margin-bottom: 20px;
    }
    .qr-frame img {
      width: 280px;
      height: 280px;
      display: block;
    }
    .steps {
      text-align: left;
      background: #202c33;
      padding: 16px 20px;
      border-radius: 12px;
      font-size: 13px;
      color: #d1d7db;
    }
    .steps ol {
      margin: 0;
      padding-left: 20px;
    }
    .steps li {
      margin-bottom: 6px;
    }
    .steps li:last-child {
      margin-bottom: 0;
    }
  </style>
  <script>
    setTimeout(() => { location.reload(); }, 12000);
  </script>
</head>
<body>
  <div class="container">
    <div class="badge">WHATSAPP MCP & GROUPS</div>
    <h1>Vincular WhatsApp</h1>
    <p>${statusText}</p>
    
    <div class="qr-frame">
      <img src="${qrDataUrl}" alt="Código QR WhatsApp" />
    </div>

    <div class="steps">
      <ol>
        <li>Abre <strong>WhatsApp</strong> en tu móvil.</li>
        <li>Toca <strong>Ajustes / Menú</strong> ➔ <strong>Dispositivos vinculados</strong>.</li>
        <li>Selecciona <strong>Vincular un dispositivo</strong> y apunta al código QR.</li>
      </ol>
    </div>
  </div>
</body>
</html>`;

  await fs.writeFile(QR_HTML_PATH, html, 'utf8');

  if (!browserOpened) {
    browserOpened = true;
    openFileInBrowser(QR_HTML_PATH);
  }
}

async function writeSuccessHtml(user) {
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>WhatsApp Conectado</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0b141a;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      color: #e9edef;
    }
    .container {
      background: #111b21;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      text-align: center;
      max-width: 440px;
      border: 1px solid #222e35;
    }
    .icon { font-size: 60px; margin-bottom: 16px; }
    h1 { color: #00a884; margin-bottom: 8px; }
    p { color: #8696a0; font-size: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">✅</div>
    <h1>¡WhatsApp Conectado!</h1>
    <p>Dispositivo vinculado correctamente: <strong>${user?.id || 'OK'}</strong></p>
    <p>Tu servidor de WhatsApp está 100% activo en segundo plano para leer grupos y mensajes.</p>
  </div>
</body>
</html>`;
  await fs.writeFile(QR_HTML_PATH, html, 'utf8');
}

async function connectToWhatsApp() {
  console.log('📱 Iniciando vinculación WhatsApp Multi-Device...');

  await fs.mkdir(AUTH_DIR, { recursive: true });
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`Usando versión Baileys WA: ${version.join('.')} (latest: ${isLatest})`);

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: state,
    browser: Browsers.macOS('Desktop'),
    syncFullHistory: false,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 60000
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n=================== ESCANEA ESTE CÓDIGO QR EN TU WHATSAPP ===================\n');
      qrcodeTerminal.generate(qr, { small: true });
      console.log('\n===============================================================================\n');

      const qrDataUrl = await QRCode.toDataURL(qr, { margin: 2, scale: 10 });
      await QRCode.toFile(QR_PNG_PATH, qr, { margin: 2, scale: 10 });
      await writeHtmlQR(qrDataUrl);
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`Conexión cerrada (${statusCode}). ¿Reintentar? ${shouldReconnect}`);
      if (shouldReconnect) {
        setTimeout(connectToWhatsApp, 3000);
      }
    } else if (connection === 'open') {
      console.log('✅ ¡WHATSAPP VINCULADO Y CONECTADO EXITOSAMENTE!');
      console.log(`ID Usuario: ${sock.user?.id || 'OK'}`);
      await writeSuccessHtml(sock.user);
      setTimeout(() => process.exit(0), 3000);
    }
  });
}

connectToWhatsApp();
