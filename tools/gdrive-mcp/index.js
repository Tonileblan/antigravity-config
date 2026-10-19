#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { google } from "googleapis";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CREDENTIALS_PATH = path.join(__dirname, "credentials.json");
const TOKEN_PATH = path.join(__dirname, "token.json");

let driveClient = null;
let authClient = null;

function getAuthClient() {
  if (authClient) return authClient;

  if (!fs.existsSync(CREDENTIALS_PATH) || !fs.existsSync(TOKEN_PATH)) {
    return null;
  }

  try {
    const rawCreds = fs.readFileSync(CREDENTIALS_PATH, "utf-8");
    const creds = JSON.parse(rawCreds);
    const config = creds.installed || creds.web;

    if (!config) return null;

    const { client_id, client_secret } = config;
    const oauth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      "http://localhost:3000/oauth2callback"
    );

    const rawToken = fs.readFileSync(TOKEN_PATH, "utf-8");
    const tokens = JSON.parse(rawToken);
    oauth2Client.setCredentials(tokens);

    oauth2Client.on("tokens", (newTokens) => {
      try {
        const merged = { ...tokens, ...newTokens };
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(merged, null, 2));
      } catch (e) {
        console.error("Error al actualizar token.json:", e);
      }
    });

    authClient = oauth2Client;
    driveClient = google.drive({ version: "v3", auth: oauth2Client });
    return authClient;
  } catch (err) {
    console.error("Error al cargar credenciales de Google Drive:", err);
    return null;
  }
}

function getDrive() {
  getAuthClient();
  return driveClient;
}

const server = new Server(
  {
    name: "gdrive-mcp",
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
    name: "gdrive_status",
    description: "Comprueba el estado de la conexión con Google Drive y devuelve la información del usuario autenticado y cuota de almacenamiento.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "gdrive_search",
    description: "Busca archivos y carpetas en Google Drive por nombre, palabra clave o consulta avanzada.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Término de búsqueda o nombre del archivo.",
        },
        folderId: {
          type: "string",
          description: "ID de la carpeta en la que buscar (opcional).",
        },
        pageSize: {
          type: "number",
          description: "Cantidad máxima de resultados (por defecto 20).",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "gdrive_list_files",
    description: "Lista archivos y subcarpetas dentro de una carpeta específica de Google Drive.",
    inputSchema: {
      type: "object",
      properties: {
        folderId: {
          type: "string",
          description: "ID de la carpeta (por defecto 'root' para la raíz de Mi unidad).",
        },
        pageSize: {
          type: "number",
          description: "Cantidad máxima de archivos a listar (por defecto 25).",
        },
        orderBy: {
          type: "string",
          description: "Criterio de ordenación (por defecto 'modifiedTime desc').",
        },
      },
    },
  },
  {
    name: "gdrive_read_file",
    description: "Lee y exporta el contenido de un archivo de Google Drive. Convierte automáticamente Google Docs a texto/Markdown, Google Sheets a CSV, o lee archivos de texto/código.",
    inputSchema: {
      type: "object",
      properties: {
        fileId: {
          type: "string",
          description: "ID del archivo en Google Drive.",
        },
      },
      required: ["fileId"],
    },
  },
  {
    name: "gdrive_upload_file",
    description: "Sube un archivo desde el disco local a una carpeta de Google Drive.",
    inputSchema: {
      type: "object",
      properties: {
        localFilePath: {
          type: "string",
          description: "Ruta absoluta del archivo local a subir.",
        },
        name: {
          type: "string",
          description: "Nombre con el que se guardará en Drive (opcional, por defecto el nombre del archivo local).",
        },
        folderId: {
          type: "string",
          description: "ID de la carpeta destino en Drive (opcional, por defecto 'root').",
        },
      },
      required: ["localFilePath"],
    },
  },
  {
    name: "gdrive_create_folder",
    description: "Crea una nueva carpeta en Google Drive.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Nombre de la carpeta a crear.",
        },
        parentFolderId: {
          type: "string",
          description: "ID de la carpeta padre (opcional, por defecto 'root').",
        },
      },
      required: ["name"],
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
      case "gdrive_status": {
        const drive = getDrive();
        if (!drive) {
          const hasCreds = fs.existsSync(CREDENTIALS_PATH);
          const hasToken = fs.existsSync(TOKEN_PATH);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    connected: false,
                    hasCredentialsFile: hasCreds,
                    hasTokenFile: hasToken,
                    message: !hasCreds
                      ? "Falta el archivo credentials.json en tools/gdrive-mcp. Descárgalo de Google Cloud Console."
                      : "Falta ejecutar la autenticación. Ejecuta: node tools/gdrive-mcp/auth.js",
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        const res = await drive.about.get({
          fields: "user, storageQuota",
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  connected: true,
                  user: res.data.user,
                  storageQuota: {
                    limit: res.data.storageQuota?.limit
                      ? `${(parseInt(res.data.storageQuota.limit) / (1024 ** 3)).toFixed(2)} GB`
                      : "Ilimitado",
                    usage: res.data.storageQuota?.usage
                      ? `${(parseInt(res.data.storageQuota.usage) / (1024 ** 3)).toFixed(2)} GB`
                      : "Desconocido",
                  },
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "gdrive_search": {
        const drive = getDrive();
        if (!drive) throw new Error("Google Drive no autenticado. Ejecuta 'node auth.js'.");

        const qParts = [`trashed = false`];
        if (args.folderId) {
          qParts.push(`'${args.folderId}' in parents`);
        }
        if (args.query) {
          const sanitized = args.query.replace(/'/g, "\\'");
          qParts.push(`name contains '${sanitized}'`);
        }

        const res = await drive.files.list({
          q: qParts.join(" and "),
          pageSize: args.pageSize || 20,
          fields: "files(id, name, mimeType, webViewLink, size, modifiedTime, parents)",
          orderBy: "modifiedTime desc",
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  count: res.data.files?.length || 0,
                  files: res.data.files || [],
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "gdrive_list_files": {
        const drive = getDrive();
        if (!drive) throw new Error("Google Drive no autenticado. Ejecuta 'node auth.js'.");

        const folder = args.folderId || "root";
        const q = `'${folder}' in parents and trashed = false`;

        const res = await drive.files.list({
          q,
          pageSize: args.pageSize || 25,
          fields: "files(id, name, mimeType, webViewLink, size, modifiedTime)",
          orderBy: args.orderBy || "modifiedTime desc",
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  folderId: folder,
                  count: res.data.files?.length || 0,
                  files: res.data.files || [],
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "gdrive_read_file": {
        const drive = getDrive();
        if (!drive) throw new Error("Google Drive no autenticado. Ejecuta 'node auth.js'.");

        // 1. Obtener metadatos
        const meta = await drive.files.get({
          fileId: args.fileId,
          fields: "id, name, mimeType, webViewLink, size, modifiedTime",
        });

        const mime = meta.data.mimeType;

        // 2. Si es Google Doc -> exportar como text/plain
        if (mime === "application/vnd.google-apps.document") {
          const res = await drive.files.export(
            { fileId: args.fileId, mimeType: "text/plain" },
            { responseType: "text" }
          );
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    meta: meta.data,
                    format: "text/plain",
                    content: res.data,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        // 3. Si es Google Sheet -> exportar como text/csv
        if (mime === "application/vnd.google-apps.spreadsheet") {
          const res = await drive.files.export(
            { fileId: args.fileId, mimeType: "text/csv" },
            { responseType: "text" }
          );
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    meta: meta.data,
                    format: "text/csv",
                    content: res.data,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        // 4. Si es Google Slides -> exportar como text/plain
        if (mime === "application/vnd.google-apps.presentation") {
          const res = await drive.files.export(
            { fileId: args.fileId, mimeType: "text/plain" },
            { responseType: "text" }
          );
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    meta: meta.data,
                    format: "text/plain",
                    content: res.data,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        // 5. Archivos de texto descargables (JSON, MD, TXT, CSV, Código)
        if (
          mime.startsWith("text/") ||
          mime.includes("json") ||
          mime.includes("javascript") ||
          mime.includes("typescript") ||
          mime.includes("csv") ||
          mime.includes("xml")
        ) {
          const res = await drive.files.get(
            { fileId: args.fileId, alt: "media" },
            { responseType: "text" }
          );
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    meta: meta.data,
                    format: mime,
                    content: res.data,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        // 6. Archivos binarios (PDF, imágenes, etc.)
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  meta: meta.data,
                  message: `El archivo es binario (${mime}). Puedes descargarlo o abrirlo en: ${meta.data.webViewLink}`,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "gdrive_upload_file": {
        const drive = getDrive();
        if (!drive) throw new Error("Google Drive no autenticado. Ejecuta 'node auth.js'.");

        const localPath = path.resolve(args.localFilePath);
        if (!fs.existsSync(localPath)) {
          throw new Error(`El archivo local no existe: ${localPath}`);
        }

        const fileName = args.name || path.basename(localPath);
        const folder = args.folderId || "root";

        const fileMetadata = {
          name: fileName,
          parents: [folder],
        };

        const media = {
          body: fs.createReadStream(localPath),
        };

        const res = await drive.files.create({
          requestBody: fileMetadata,
          media: media,
          fields: "id, name, webViewLink, mimeType",
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: `Archivo '${fileName}' subido exitosamente a Google Drive.`,
                  file: res.data,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "gdrive_create_folder": {
        const drive = getDrive();
        if (!drive) throw new Error("Google Drive no autenticado. Ejecuta 'node auth.js'.");

        const parent = args.parentFolderId || "root";
        const fileMetadata = {
          name: args.name,
          mimeType: "application/vnd.google-apps.folder",
          parents: [parent],
        };

        const res = await drive.files.create({
          requestBody: fileMetadata,
          fields: "id, name, webViewLink",
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: `Carpeta '${args.name}' creada exitosamente.`,
                  folder: res.data,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      default:
        throw new Error(`Herramienta desconocida: ${name}`);
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
  console.error("Error fatal ejecutando Google Drive MCP server:", err);
  process.exit(1);
});
