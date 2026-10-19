import fs from 'fs';
import path from 'path';
import http from 'http';
import url from 'url';
import { exec } from 'child_process';
import { google } from 'googleapis';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');

const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
];

async function main() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error('\n❌ No se encontró el archivo credentials.json.');
    console.error(`👉 Coloca tu archivo 'credentials.json' descargado de Google Cloud Console en:\n   ${CREDENTIALS_PATH}\n`);
    console.error('Instrucciones rápidas:');
    console.error('1. Ve a https://console.cloud.google.com/apis/credentials');
    console.error('2. Crea un proyecto (o selecciona uno existente).');
    console.error('3. Habilita la "Google Drive API" en https://console.cloud.google.com/apis/library/drive.googleapis.com');
    console.error('4. En "Credenciales" -> "Crear credenciales" -> "ID de cliente de OAuth".');
    console.error('   - Tipo de aplicación: "Aplicación de escritorio" (Desktop App)');
    console.error('5. Descarga el JSON, renómbralo a "credentials.json" y colócalo en esta carpeta.');
    process.exit(1);
  }

  const rawCreds = fs.readFileSync(CREDENTIALS_PATH, 'utf-8');
  const creds = JSON.parse(rawCreds);
  const config = creds.installed || creds.web;

  if (!config) {
    console.error('❌ Formato de credentials.json inválido. Debe contener "installed" o "web".');
    process.exit(1);
  }

  const { client_id, client_secret } = config;
  const PORT = 3000;
  const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    REDIRECT_URI
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  });

  const server = http.createServer(async (req, res) => {
    try {
      if (req.url.startsWith('/oauth2callback')) {
        const parsedUrl = url.parse(req.url, true);
        const code = parsedUrl.query.code;

        if (code) {
          const { tokens } = await oauth2Client.getToken(code);
          oauth2Client.setCredentials(tokens);
          fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));

          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <html>
              <body style="font-family: system-ui, sans-serif; text-align: center; padding: 50px; background: #0f172a; color: #f8fafc;">
                <h1 style="color: #38bdf8;">✅ Autenticación con Google Drive Exitosa</h1>
                <p>Las credenciales se han guardado correctamente en <code>token.json</code>.</p>
                <p style="color: #94a3b8;">Ya puedes cerrar esta ventana y regresar a Antigravity.</p>
              </body>
            </html>
          `);

          console.log('\n✅ Autenticación completada con éxito.');
          console.log(`📁 Token guardado en: ${TOKEN_PATH}`);

          server.close(() => {
            process.exit(0);
          });
        }
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Error de autenticación: ${err.message}`);
      console.error('❌ Error al obtener token:', err);
    }
  });

  server.listen(PORT, () => {
    console.log('\n🔗 Abriendo navegador para autorizar Google Drive...');
    console.log(`URL de autorización: ${authUrl}\n`);

    // Abrir en macOS
    exec(`open "${authUrl}"`, (err) => {
      if (err) {
        console.log('👉 Por favor abre manualmente la URL anterior en tu navegador.');
      }
    });
  });
}

main().catch(console.error);
