# 📐 Directriz de Definición de Proyecto y Briefing Ágil (By Toni)

> **Ubicación Google Drive:** `Google Drive > Mi unidad > 1-Proyectos > Apps-Desarrollo > Directriz-Definicion-Proyecto.md`  
> **Estado:** Obligatoria en la fase de conceptualización y arranque de cualquier nuevo desarrollo

Esta directriz establece el protocolo simplificado para inicializar cualquier nuevo proyecto de software dentro del ecosistema de Toni.

Al basarse en las **5 Directrices Maestras**, elimina la duplicidad y las preguntas redundantes sobre aspectos técnicos fijos (RGPD, arquitectura multi-esquema en Supabase, branding o registro central), permitiendo definir un nuevo proyecto en pocos minutos.

---

## 🔗 1. Las 5 Directrices Maestras Heredadas

Cualquier proyecto inicializado en el ecosistema hereda y aplica de forma **100% automática** las siguientes normas:

| # | Directriz Maestra | Aspectos Estandarizados (Automáticos - No se piden en el briefing) |
|---|---|---|
| **1** | **🗄️ Arquitectura de Datos y Supabase** | Esquema PostgreSQL aislado (`mia_*` para suite propia, `com_*` para clientes), RLS (Row Level Security) estricto y clave foránea `user_id` vinculada a `auth.users(id)`. |
| **2** | **🛡️ Seguridad y Autenticación** | Supabase Auth (JWT), protección de rutas mediante Middleware/Guards y jerarquía estándar de perfiles. |
| **3** | **🤖 Implementación de IA** | Streaming en tiempo real vía Server-Sent Events (SSE), ejecución segura de modelos en Edge Functions / Backend y protección total de API Keys. |
| **4** | **⚖️ Privacidad, RGPD y Branding** | Titular legal obligatorio (**Antonio Javier García García**, DNI **34799350M**, Madrid), páginas legales automáticas (`/privacidad`, `/aviso-legal`, `/terminos`), cookies y sello **"By Toni"** en el footer. |
| **5** | **📂 Registro y Control en Google Drive** | Registro automático en `Apps-Desarrollo/Registro_Proyectos_Toni.csv` y creación de carpeta de documentación `Apps-Desarrollo/<App>/INFO_PROYECTO.md`. |

---

## ⚡ 2. Prompt Maestro de Inicialización Rápida

Copia y completa este bloque para inicializar cualquier proyecto en Antigravity en un solo paso:

```text
Inicializa un nuevo proyecto aplicando las 5 Directrices Maestras de Drive con la siguiente configuración:

- Nombre: [Nombre del Proyecto]
- Slug: [com_nombre / mia_nombre]
- Categoría: [Suite Toni (Propio / I+D) | Comercial / Clientes | Prototipo Rápido / Demo]
- Estado: [Idea / Planificación | En Desarrollo | Prototipo / MVP]
- Tagline: [Resumen en 1 frase de propuesta de valor]
- Problema Principal: [Descripción breve del dolor que soluciona]
- Público Objetivo: [A quién va dirigido]
- Funcionalidades Core:
  1. [Funcionalidad 1]
  2. [Funcionalidad 2]
  3. [Funcionalidad 3]
- Base de Datos: [Sí - Supabase PostgreSQL (Esquema Aislado) | No - Sin Base de Datos]
- Autenticación: [Sí - Supabase Auth (Email / Magic Link) | Sí - OAuth | No - Acceso Libre]
- Roles: [Admin + Usuario Estándar | Admin + Profesional + Cliente | No Aplica]
- Integración IA: [No Requiere IA | Asistente Conversacional / Chatbot | Análisis de Datos | RAG / Búsqueda Semántica]
- Proveedor IA: [No Aplica | OpenAI (GPT-4o) | Anthropic (Claude 3.5) | Google Gemini | Groq / Llama 3]
- Modelo de Negocio: [Gratuito | Suscripción SaaS (Stripe) | Pago Único | Freemium]
- Frontend: React 19 + TypeScript + Vite
- Estilo UI: Tailwind CSS + Glassmorphism Dark
```
