---
name: google-drive
description: Integración de Google Drive y Google Workspace vía MCP y API oficial para buscar, leer (Google Docs, Sheets a CSV), subir y gestionar archivos en la nube y sincronización local.
---

# 📁 Google Drive & Workspace MCP Integration

Servidor MCP y cliente oficial de Google Drive API v3 para conectar Antigravity con tu cuenta de Google Drive (`leblangarcia@gmail.com`).

Permite buscar archivos, listar carpetas, leer y exportar documentos nativos de Google (Google Docs como texto/Markdown, Google Sheets como CSV, presentaciones), subir archivos desde tu Mac y crear carpetas.

---

## 🛠️ Herramientas Disponibles (`gdrive-mcp`)

1. **`gdrive_status`**:
   - Comprueba el estado de la conexión, devuelve los datos del usuario autenticado (nombre, email) y la cuota de almacenamiento utilizada.

2. **`gdrive_search`**:
   - Busca archivos y carpetas por nombre o consulta avanzada (`name contains '...'`).
   - Parámetros: `query` (obligatorio), `folderId` (opcional), `pageSize` (opcional, por defecto 20).

3. **`gdrive_list_files`**:
   - Lista el contenido de una carpeta en Drive (por defecto `'root'` para Mi unidad).
   - Parámetros: `folderId` (opcional), `pageSize` (opcional), `orderBy` (opcional).

4. **`gdrive_read_file`**:
   - Lee el contenido de un archivo directamente:
     - **Google Docs:** Lo exporta y entrega en texto/Markdown plano.
     - **Google Sheets:** Lo exporta y entrega como CSV estructurado.
     - **Google Slides:** Lo exporta como texto plano.
     - **Archivos de texto/código (JSON, MD, TXT, CSV, TS, etc.):** Lee el contenido directamente.
     - **Archivos binarios (PDF, imágenes):** Devuelve metadatos y enlace web.
   - Parámetros: `fileId` (obligatorio).

5. **`gdrive_upload_file`**:
   - Sube cualquier archivo desde el disco local de tu Mac a Google Drive.
   - Parámetros: `localFilePath` (obligatorio), `name` (opcional), `folderId` (opcional).

6. **`gdrive_create_folder`**:
   - Crea una nueva carpeta en la unidad o subcarpeta.
   - Parámetros: `name` (obligatorio), `parentFolderId` (opcional).

---

## 🔐 Configuración y Primer Inicio (Paso Único)

El servidor MCP reside en:
`/Users/toni/Proyectos/antigravity-config/tools/gdrive-mcp`

### Paso 1: Obtener `credentials.json`
1. Entra a [Google Cloud Console - Credenciales](https://console.cloud.google.com/apis/credentials).
2. Selecciona tu proyecto de Google Cloud (o crea uno nuevo, ej. `PrimeIO-Tools`).
3. Asegúrate de tener habilitada la **Google Drive API** en [Biblioteca de APIs](https://console.cloud.google.com/apis/library/drive.googleapis.com).
4. Haz clic en **Crear credenciales** ➔ **ID de cliente de OAuth**:
   - Tipo de aplicación: **Aplicación de escritorio** (Desktop App).
   - Nombre: `Antigravity Google Drive`.
5. Descarga el archivo JSON con las credenciales y guárdalo como:
   `/Users/toni/Proyectos/antigravity-config/tools/gdrive-mcp/credentials.json`

### Paso 2: Vincular tu cuenta de Google
Ejecuta el script de autorización:
```bash
node /Users/toni/Proyectos/antigravity-config/tools/gdrive-mcp/auth.js
```
Se abrirá automáticamente tu navegador con la pantalla de inicio de sesión de Google. Concede los permisos y el token se guardará de forma permanente en `token.json`.

---

## 📂 Acceso Directo por Sistema de Archivos (Local)
Para operaciones rápidas de lectura/escritura de archivos locales ya descargados, también tienes acceso directo a la carpeta sincronizada en tu Mac:
- **Ruta:** `/Users/toni/Library/CloudStorage/GoogleDrive-leblangarcia@gmail.com/Mi unidad`
