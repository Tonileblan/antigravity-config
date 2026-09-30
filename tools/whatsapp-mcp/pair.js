import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';
import pino from 'pino';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_DIR = path.join(__dirname, 'auth_info');

const rawPhone = process.argv[2] || '34641554413';
let phoneNumber = rawPhone.replace(/[^0-9]/g, '');
if (phoneNumber.length === 9 && phoneNumber.startsWith('6')) {
  phoneNumber = '34' + phoneNumber;
}

const logger = pino({ level: 'silent' });

async function pairWithPhone() {
  console.log(`\n📱 Preparando vinculación oficial con número: +${phoneNumber} ...`);

  await fs.mkdir(AUTH_DIR, { recursive: true });
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger)
    },
    browser: Browsers.ubuntu('Chrome'),
    syncFullHistory: false,
    markOnlineOnConnect: false
  });

  sock.ev.on('creds.update', saveCreds);

  let codeRequested = false;

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (!sock.authState.creds.registered && !codeRequested) {
      codeRequested = true;
      setTimeout(async () => {
        try {
          const code = await sock.requestPairingCode(phoneNumber);
          console.log(`\n=================================================================`);
          console.log(`🔑 TU CÓDIGO DE VINCULACIÓN EN WHATSAPP ES:  ${code}`);
          console.log(`=================================================================\n`);
          console.log(`Pasos en tu teléfono:`);
          console.log(`1. Abre WhatsApp en tu móvil.`);
          console.log(`2. Ajustes / Menú ➔ Dispositivos vinculados ➔ Vincular un dispositivo.`);
          console.log(`3. Toca abajo: "Vincular con el número de teléfono".`);
          console.log(`4. Introduce este código: ${code}\n`);
        } catch (err) {
          console.error('❌ Error solicitando código:', err.message);
        }
      }, 3000);
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`[WA] Conexión cerrada (${statusCode || 'desc'}). Reintentando: ${shouldReconnect}`);
      if (shouldReconnect) {
        setTimeout(pairWithPhone, 3000);
      }
    } else if (connection === 'open') {
      console.log('\n=================================================================');
      console.log('✅ ¡WHATSAPP VINCULADO Y CONECTADO CON ÉXITO!');
      console.log(`Usuario: ${sock.user?.id || sock.user?.name || 'Conectado'}`);
      console.log('=================================================================\n');
      setTimeout(() => process.exit(0), 4000);
    }
  });
}

pairWithPhone();
