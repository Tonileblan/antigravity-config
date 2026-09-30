---
name: whatsapp
description: Integración de WhatsApp Multi-Device con Baileys WebSocket para lectura continua de mensajes de grupos (@g.us), chats directos, búsqueda histórica y envío de mensajes sin navegador.
---

# 📱 WhatsApp Multi-Device & Group Reader MCP

Servidor MCP para conectar Antigravity con WhatsApp de forma directa, nativa y segura a través del protocolo oficial de sincronización multi-dispositivo de WhatsApp Web (WebSocket en segundo plano).

---

## 🛠️ Herramientas Disponibles (`whatsapp-mcp`)

1. **`whatsapp_status`**:
   - Comprueba el estado de la conexión (`connected`, `waiting_qr`, `disconnected`), usuario activo, total de chats, total de grupos registrados y cantidad de mensajes almacenados.

2. **`whatsapp_list_groups`**:
   - Lista todos los grupos en los que participas (`@g.us`), incluyendo nombre del grupo, JID, participantes, último mensaje y fecha de actualización. Permite filtrar por nombre con `search`.

3. **`whatsapp_get_group_messages`**:
   - Recupera los mensajes recientes de un grupo específico indicando el nombre del grupo o su JID. Soporta búsqueda de palabras clave dentro de las conversaciones (`search`) y límite de mensajes.

4. **`whatsapp_get_all_recent_messages`**:
   - Devuelve un feed cronológico con los últimos mensajes recibidos en todos los grupos o chats con filtro opcional de texto.

5. **`whatsapp_send_message`**:
   - Envía un mensaje de texto a un número de teléfono (`+34...`) o directamente a un grupo (`...@g.us`).

6. **`whatsapp_list_chats`**:
   - Lista todas las conversaciones recientes registradas en la base de datos local.

---

## 🔐 Vinculación Inicial (Paso Único)

Para vincular WhatsApp por primera vez:
1. Ejecutar en PowerShell:
   ```powershell
   node d:\PROYECTOS-APPs\antigravity-config\tools\whatsapp-mcp\auth.js
   ```
2. Se abrirá una página web en tu navegador con un código QR seguro.
3. Abre **WhatsApp** en tu teléfono ➔ **Ajustes / Menú** ➔ **Dispositivos vinculados** ➔ **Vincular un dispositivo**.
4. Escanea el código QR.
5. Las claves se guardan en `auth_info/` de forma permanente y la conexión se mantiene en segundo plano sin volver a requerir el QR.
