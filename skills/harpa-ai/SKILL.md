---
name: harpa-ai
description: Integración global con HARPA AI Grid para control remoto del navegador, scraping sin bloqueos antibot, extracción SERP de Google y automatización asistida por IA.
---

# HARPA AI Skill (Remote-Control Browser Grid)

Esta skill proporciona integración completa con **HARPA AI Grid REST API** a través de la extensión de navegador de Toni. Permite ejecutar scraping de páginas complejas (con sesión activa, Cloudflare o logins), extraer resultados de búsqueda de Google (SERP), enviar prompts y automatizar navegación web.

---

## Credenciales y Configuración (PrimeIO OS)

Las credenciales residen en `/Users/toni/Proyectos/PrimeIO/.env`:
```env
HARPA_API_KEY=hrp-3iOX-WMkLZLurp1ExrGuLyEPJQLt7QHir1UJwpFlgCPjXL4NcaXhRp69WWyOOuJCVQg1TzvBARa57vzgAGDco
HARPA_NODE_ID=vx4e
```

Endpoint oficial:
`POST https://api.harpa.ai/api/v1/grid`
Cabecera: `Authorization: Bearer $HARPA_API_KEY`

---

## Uso desde CLI / Scripts

El script ejecutor principal se encuentra en:
`~/.gemini/config/skills/harpa-ai/scripts/harpa_client.py`

### 1. Comprobar Conexión (Ping)
Comprueba si el navegador de Toni está abierto y escuchando peticiones:
```bash
python ~/.gemini/config/skills/harpa-ai/scripts/harpa_client.py ping
```

### 2. Scrapear una Web con Navegador Real
Descarga el contenido completo, metadatos y Markdown de cualquier URL navegando con la IP y sesión del usuario:
```bash
python ~/.gemini/config/skills/harpa-ai/scripts/harpa_client.py scrape "https://ejemplo.com"
```
Para obtener el JSON completo estructurado:
```bash
python ~/.gemini/config/skills/harpa-ai/scripts/harpa_client.py scrape "https://ejemplo.com" --json
```

### 3. Extraer Resultados de Google (SERP)
Extrae los primeros resultados de búsqueda de Google (título, URL y snippet) en segundos:
```bash
python ~/.gemini/config/skills/harpa-ai/scripts/harpa_client.py serp "talleres bicicletas sevilla"
```

### 4. Enviar Prompt a la IA de Harpa
Ejecuta un prompt utilizando el modelo de IA configurado en la extensión de Harpa:
```bash
python ~/.gemini/config/skills/harpa-ai/scripts/harpa_client.py prompt "Resume las ventajas de una e-bike"
```

---

## Casos de Uso Principales

1. **Lead Generation para BikeFlow / MuiBici:**
   - Extraer listas de talleres de bicicletas desde Google o directorios locales.
   - Visitar webs de competidores y extraer emails, teléfonos y enlaces de WhatsApp sin sufrir bloqueos de Cloudflare.
2. **Monitorización de Precios y Competencia:**
   - Comprobar páginas de precios de competidores (Ciclomax, Gesio Bike, TallerGP) y procesar las variaciones.
3. **Flujos con n8n y Supabase:**
   - Los datos extraídos por el cliente se pueden pasar a n8n o insertar directamente en Supabase para nutrir el CRM de PrimeIO.
