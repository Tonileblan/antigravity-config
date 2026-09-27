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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_DIR = path.join(__dirname, 'auth_info');
const QR_HTML_PATH = path.join(__dirname, 'qr.html');

let browserOpened = false;

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
      background: #f0f2f5;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      color: #111b21;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      text-align: center;
      max-width: 440px;
      width: 90%;
    }
    .badge {
      display: inline-block;
      background: #25D366;
      color: white;
      font-weight: 700;
      font-size: 13px;
      padding: 6px 14px;
      border-radius: 20px;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 24px;
      margin: 0 0 8px 0;
    }
    p {
      color: #667781;
      font-size: 14px;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .qr-frame {
      background: white;
      padding: 16px;
      border-radius: 16px;
      border: 2px solid #e9edef;
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
      background: #f8fafc;
      padding: 16px 20px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      font-size: 13px;
      color: #334155;
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
    <div class="badge">WHATSAPP MCP SERVER</div>
    <h1>Vincular Dispositivo</h1>
    <p>${statusText}</p>
    
    <div class="qr-frame">
      <img src="${qrDataUrl}" alt="Código QR WhatsApp" />
    </div>

    <div class="steps">
      <ol>
        <li>Abre <strong>WhatsApp</strong> en tu móvil.</li>
        <li>Toca <strong>Ajustes / Configuración</strong> ➔ <strong>Dispositivos vinculados</strong>.</li>
        <li>Selecciona <strong>Vincular un dispositivo</strong> y apunta tu cámara a este código.</li>
      </ol>
    </div>
  </div>
</body>
</html>`;

  await fs.writeFile(QR_HTML_PATH, html, 'utf8');

  if (!browserOpened) {
    browserOpened = true;
    exec(`open "${QR_HTML_PATH}"`);
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
      background: #f0f2f5;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      text-align: center;
      max-width: 440px;
    }
    .icon { font-size: 60px; margin-bottom: 16px; }
    h1 { color: #059669; margin-bottom: 8px; }
    p { color: #64748b; font-size: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">✅</div>
    <h1>¡WhatsApp Conectado!</h1>
    <p>Dispositivo vinculado correctamente: <strong>${user?.id || 'OK'}</strong></p>
    <p>Ya puedes cerrar esta pestaña. Tu servidor MCP de WhatsApp está listo para enviar y recibir mensajes.</p>
  </div>
</body>
</html>`;
  await fs.writeFile(QR_HTML_PATH, html, 'utf8');
}

async function connectToWhatsApp() {
  console.log('📱 Iniciando vinculación WhatsApp MCP con firma oficial macOS...');

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
      console.log('⚡️ Nuevo QR generado con firma macOS Desktop.');
      const qrDataUrl = await QRCode.toDataURL(qr, { margin: 2, scale: 10 });
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
      console.log('✅ ¡WHATSAPP CONECTADO EXITOSAMENTE!');
      console.log(`ID Usuario: ${sock.user?.id || 'OK'}`);
      await writeSuccessHtml(sock.user);
      setTimeout(() => process.exit(0), 3000);
    }
  });
}

connectToWhatsApp();
