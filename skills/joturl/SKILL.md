---
name: joturl
description: Integración global integral con JotUrl para gestionar enlaces cortos, deep links, retargeting y métricas.
---

# JotUrl Skill

Esta skill te da acceso a las herramientas de [JotUrl](https://joturl.com/), permitiéndote automatizar la creación y seguimiento de enlaces, deep links y píxeles de retargeting para estrategias de marketing avanzadas.

## Funcionalidades Soportadas (Script Central)

El script `scripts/joturl_client.py` actúa como un wrapper genérico y extensible de la API de JotUrl. Dado que JotUrl tiene cientos de endpoints, esta herramienta está diseñada para escalar bajo demanda.

### Ejemplos de uso (Llamadas comunes)

1. **Acortar una URL simple:**
   ```bash
   python ~/.gemini/config/skills/joturl/scripts/joturl_client.py create_link "https://mi-destino.com"
   ```

2. **Acortar una URL con UTMs y Alias personalizado:**
   ```bash
   python ~/.gemini/config/skills/joturl/scripts/joturl_client.py create_link "https://mi-destino.com?utm_source=agente" --alias "mi-campana"
   ```

3. **Llamadas genéricas a otros endpoints (Flexible):**
   ```bash
   # Hacer peticiones a cualquier endpoint usando el cliente genérico
   python ~/.gemini/config/skills/joturl/scripts/joturl_client.py custom_request "GET" "/api/v1/projects"
   ```

## Configuración y Pre-requisitos

Para funcionar, el entorno o el `.env` del proyecto debe tener configurada tu clave de API:
*   `JOTURL_API_KEY`: Clave de acceso a la API (se genera en tu dashboard de JotUrl).

## Ampliando la Skill

Si un usuario te pide una función de JotUrl que no esté pre-programada (ej. configurar un WhatsApp Link, un código QR dinámico, o un píxel específico):
1. Pídele al usuario que te pase el JSON de la petición o el endpoint exacto (está en su API Lab de JotUrl).
2. Añade el método correspondiente a la clase `JotUrlClient` dentro de `scripts/joturl_client.py`.
3. Documenta el nuevo uso en este archivo `SKILL.md`.
