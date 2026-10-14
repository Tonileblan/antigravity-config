# 🤖 DIRECTRICES DE IMPLEMENTACIÓN DE INTELIGENCIA ARTIFICIAL (IA)


Este documento define la arquitectura técnica, seguridad, selección de modelos y manejo de respuestas para todas las funciones de IA integradas en las aplicaciones del ecosistema.


---


## 1. Arquitectura de Proveedores y Selección de Modelos


Para optimizar velocidad, costes y ventanas de contexto, se sigue la regla de **Modelo Adecuado para la Tarea**:


| Tipo de Tarea | Modelo Recomendado | Casos de Uso en las Apps |
| :--- | :--- | :--- |
| **Tareas Rápidas y Extracción de Datos** | **Google Gemini Flash** *(o GPT-4o-mini)* | Escaneo de facturas, auto-completar formularios, categorización, mapas mentales, transcripción rápida. |
| **Razonamiento Complejo y Auditoría** | **Gemini Pro / Claude 3.5 Sonnet** | Auditoría de trading, análisis de estrategias, diagnósticos avanzados de negocio, generación de código. |
| **Visión / Multimodal** | **Gemini Flash Vision** | Lectura de capturas de gráficos de trading, fotos de averías de taller, tickets de compra. |


---


## 2. Seguridad de Claves de API (API Keys)


1. **Gestión de Claves (Dos Enfoques Permitidos):**
   * **Modo BYOK (Bring Your Own Key):** El usuario introduce su propia clave (ej. Gemini o OpenAI) en la configuración de la app y se guarda en su `localStorage` o perfil cifrado de Supabase.
   * **Modo Proxy / Edge Function:** Las llamadas de backend con claves maestras se ejecutan a través de Supabase Edge Functions o endpoints seguros de API.
2. **Prohibición Crítica:** NUNCA quemar (*hardcodear*) claves de OpenAI, Google Gemini o Anthropic en el código fuente de los componentes frontend.
3. **Variables de Entorno:** Utilizar nombres estándar:
   ```env
   VITE_GOOGLE_AI_API_KEY="..."
   VITE_OPENAI_API_KEY="..."
   ```


---


## 3. Salidas Estructuradas Obligatorias (JSON Schema / Zod)


Cuando la IA deba alimentar la base de datos o la interfaz (por ejemplo, generar nodos de un mapa mental, registrar un cliente en el CRM o crear una operación de trading):


1. **Obligatorio:** Solicitar siempre la respuesta en formato **JSON estricto** mediante `response_mime_type: "application/json"` o esquemas Zod.
2. **Validación:** El código debe parsear la respuesta con un bloque `try/catch` y limpiar posibles bloques de markdown residuales (como ` ```json `).
3. **Esquema de Error Controlado:** Si la IA no puede procesar la solicitud, debe devolver un JSON con formato `{ error: string, retryable: boolean }`.


---


## 4. Experiencia de Usuario (UI/UX) para Funciones de IA


Toda funcionalidad impulsada por IA debe implementar:
1. **Estados de Carga Claros:** Botones con *Spinners* animados, esqueletos de carga (*Skeletons*) o indicadores de *"Analizando con IA..."*.
2. **Streaming en Chats/Asistentes:** En interfaces conversacionales, utilizar respuestas en tiempo real por streaming (*Server-Sent Events*) para no hacer esperar al usuario con la pantalla congelada.
3. **Cancelación de Peticiones:** Utilizar `AbortController` para permitir al usuario detener una generación en curso si cambia de pantalla.
4. **Mensajes de Error Amigables:** Si la cuota de la API se agota o hay un fallo de red, mostrar un mensaje en español comprensible (ej. *"Límite de peticiones alcanzado. Espera un momento antes de volver a intentarlo"*).


---


## 5. Estructura de Carpetas de IA en el Proyecto


Todo el código relacionado con IA debe concentrarse de forma modular:
```text
src/
  ├── lib/
  │    ├── ai/
  │    │    ├── gemini-client.ts    <-- Conexión y configuración del proveedor
  │    │    ├── prompts/            <-- Plantillas de prompts del sistema
  │    │    └── parsers.ts          <-- Validación y limpieza de respuestas JSON
  └── components/
       └── ai/                      <-- Modales, chats y botones de asistente IA
```