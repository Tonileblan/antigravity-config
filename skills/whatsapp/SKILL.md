---
name: whatsapp
description: Integración de WhatsApp vía MCP (Model Context Protocol) utilizando Baileys WebSocket multi-device para envío y lectura de mensajes, gestión de contactos e historial de chats.
---

# 📱 WhatsApp MCP Integration

Servidor MCP para conectar Antigravity con WhatsApp de forma directa y segura a través del protocolo oficial de sincronización multi-dispositivo de WhatsApp Web.

---

## 🛠️ Herramientas Disponibles (`whatsapp-mcp`)

1. **`whatsapp_status`**:
   - Comprueba el estado de la conexión (`connected`, `waiting_qr`, `disconnected`) y los datos del dispositivo vinculado.

2. **`whatsapp_get_qr`**:
   - Devuelve la cadena o estado del código QR actual cuando se requiere vincular una nueva sesión.

3. **`whatsapp_send_message`**:
   - Envía mensajes de texto a números de teléfono con prefijo internacional (`+34612345678` o `34612345678`) o JIDs de grupos.

4. **`whatsapp_list_chats`**:
   - Lista las conversaciones recientes, remitentes, últimos mensajes y fechas.

5. **`whatsapp_get_chat_history`**:
   - Recupera el historial reciente de mensajes de un chat o contacto concreto.

---

## 🔐 Vinculación de Sesión (Paso Único)

Para vincular WhatsApp por primera vez:
1. Ejecutar en el terminal: `node /Users/toni/Proyectos/antigravity-config/tools/whatsapp-mcp/auth.js`
2. Abrir WhatsApp en el móvil -> **Ajustes / Configuración** -> **Dispositivos vinculados** -> **Vincular un dispositivo**.
3. Escanear el código QR mostrado en la terminal.
4. Las credenciales se guardan de forma local en `auth_info` de forma permanente.
