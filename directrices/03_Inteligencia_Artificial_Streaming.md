# 🤖 Directriz Maestra #3: Inteligencia Artificial, Streaming SSE y Agentes

> **Ubicación Google Drive:** `Google Drive > Mi unidad > 1-Proyectos > Apps-Desarrollo > Directrices > 03_Inteligencia_Artificial_Streaming.md`  
> **Estado:** Obligatoria en proyectos con integración de IA o Agentes Autónomos  
> **Responsable Metodológico:** Toni (Antonio Javier García García)

---

## ⚡ 1. Experiencia de Usuario en Streaming en Tiempo Real
- **Server-Sent Events (SSE):** Toda interacción conversacional, generación de código o asistencia con LLMs debe transmitirse mediante Streaming SSE carácter a carácter para maximizar la velocidad percibida y reducir la latencia inicial (< 400ms).
- **Feedback Visual Fluido:** Estados de carga dinámicos ("Analizando contexto...", "Orquestando agentes...", "Generando respuesta...") y cursor pulsante activo durante la generación.

---

## 🧩 2. Desacoplamiento de Prompts y Capa de Dominio
- **Aislamiento Total:** Los prompts del sistema (*System Prompts*) y metadatos de comportamiento de IA nunca deben incrustarse en los componentes visuales de React.
- **Servicio de Dominio Dedicado:** Se ubican en `src/services/aiService.ts` o `src/data/sources/` con funciones fuertemente tipadas y parametrizadas.
- **Multi-Proveedor Resiliente:** Arquitectura agnóstica para alternar transparentemente entre modelos:
  - Google Gemini (Gemini 2.0 Flash / Pro)
  - Anthropic (Claude 3.5 Sonnet)
  - OpenAI (GPT-4o / GPT-4o-mini)
  - Modelos de Ultra-Baja Latencia / Open Source (DeepSeek V3/R1, Groq Llama 3)

---

## 🔄 3. Tolerancia a Fallos y Manejo de Rate Limits
- **Reintentos Exponenciales con Jitter:** En caso de errores `429 Too Many Requests` o `503 Service Unavailable`, implementar reintentos automáticos con retroceso exponencial.
- **Fallback Automático:** Si un proveedor principal se agota o falla, conmutar opcionalmente a un proveedor secundario preconfigurado.
- **Persistencia de Sesiones:** Guardar el historial contextual de mensajes de forma compacta (resúmenes o ventanas deslizantes de tokens) en el esquema PostgreSQL del proyecto.
