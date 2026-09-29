---
name: telegram
description: Integración de Telegram vía MCP (Model Context Protocol) utilizando Bot API oficial (grammY) para envío de mensajes, fotos, documentos y lectura de actualizaciones en tiempo real.
---

# ✈️ Telegram MCP Integration

Servidor MCP para conectar Antigravity con Telegram a través de la Bot API oficial de Telegram (`grammY`).

---

## 🛠️ Herramientas Disponibles (`telegram-mcp`)

1. **`telegram_status`**:
   - Devuelve el estado de la conexión y los datos del bot (@username, ID, nombre).

2. **`telegram_set_token`**:
   - Guarda o actualiza el Bot Token de Telegram (`123456:ABC-DEF...`) generado en `@BotFather`.

3. **`telegram_send_message`**:
   - Envía un mensaje de texto a un `chat_id` o `@nombre_canal` con soporte para Markdown/HTML.

4. **`telegram_get_updates`**:
   - Recupera los últimos mensajes y comandos recibidos por el bot.

5. **`telegram_get_chat`**:
   - Obtiene detalles e información de un chat, grupo o canal.

6. **`telegram_send_photo`**:
   - Envía imágenes mediante URL pública o ruta local a cualquier chat.

---

## 🔑 Cómo Obtener tu Bot Token (Paso a Paso)

1. Abre **Telegram** y busca el usuario oficial [**@BotFather**](https://t.me/BotFather).
2. Envía el comando `/newbot`.
3. Elige un nombre y un usuario que termine en `bot` (por ejemplo: `MiAsistenteBot`).
4. @BotFather te dará un token HTTP API como:  
   `7123456789:AAF_AbCdEfGhIjKlMnOpQrStUvWxYz`
5. Pega ese token aquí o usa `telegram_set_token(token: "...")` para guardarlo de forma permanente.
