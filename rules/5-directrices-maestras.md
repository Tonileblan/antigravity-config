# 🏛️ Las 5 Directrices Maestras de Desarrollo (Ecosistema Toni)

## Ámbito de Aplicación
Esta regla rige **obligatoriamente** sobre cualquier aplicación web, móvil, backend o tarea desarrollada por Antigravity en macOS y Windows.
Cualquier tarea, script o desarrollo derivado de `Directiva-ejemplo.md` (o directivas SOP específicas) está **estrictamente subordinado** a estas 5 directrices fundamentales.

---

### 1. 🗄️ Arquitectura de Datos y Supabase (PostgreSQL)
- **Aislamiento por Esquema Dedicado:** NUNCA crear tablas en el esquema `public`.
  - Proyectos Propios / I+D: Prefijo `mia_*` (ej. `mia_bytoniproyect`, `mia_vitatrading`, `mia_academy`).
  - Proyectos Comerciales / Clientes: Prefijo `com_*` (ej. `com_bicicletas`, `com_control61`).
- **RLS Obligatorio (100% Cobertura):** Toda tabla creada debe tener activado `ALTER TABLE <schema>.<table> ENABLE ROW LEVEL SECURITY;`.
- **Identificador de Usuario:** Toda tabla con pertenencia de usuario debe incluir `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid()`.
- **Políticas CRUD:** Políticas granulares `SELECT`, `INSERT`, `UPDATE`, `DELETE` vinculadas a `auth.uid() = user_id`.
- **Migraciones SQL:** Todo cambio o esquema debe registrarse en `supabase/migrations/YYYYMMDD_init_<esquema>.sql`.

---

### 2. 🛡️ Seguridad, Autenticación y Route Guards
- **Supabase Auth:** Uso estándar de sesiones JWT con gestión de refresh tokens.
- **Route Guards:** Proteger componentes y rutas privadas (`/dashboard`, `/perfil`, `/admin`, etc.) mediante guards o middleware que impidan el renderizado sin sesión autenticada.
- **Validación Zero-Trust:** Validar todas las entradas de usuario y APIs con esquemas tipados (Zod / TypeScript).
- **Cero Secretos en el Frontend:** NUNCA exponer `service_role`, claves maestras o tokens secretos en el bundle cliente (`VITE_`, `NEXT_PUBLIC_`). Usar Edge Functions o backend para privilegios elevados.

---

### 3. 🤖 Inteligencia Artificial, Streaming SSE y Agentes
- **Streaming en Tiempo Real:** Toda interacción conversacional o generación de contenidos con LLMs debe implementarse mediante Streaming SSE (Server-Sent Events) carácter a carácter con estados de carga fluidos.
- **Desacoplamiento de Prompts:** Los prompts del sistema nunca se mezclan con componentes visuales; residen en capas de servicio dedicadas (`src/services/` o `src/data/sources/`).
- **Resiliencia & Rate Limiting:** Manejo de límites de tasa con reintentos exponenciales y posibilidad de alternar entre proveedores (Gemini, Claude, OpenAI, DeepSeek).

---

### 4. ⚖️ Privacidad, RGPD y Branding "By Toni"
- **Titular Legal Obligatorio:** En cualquier aplicación comercial, pública o que procese datos personales:
  - **Titular:** Antonio Javier García García
  - **DNI:** 34799350M
  - **Domicilio:** Madrid (España)
- **Rutas Legales:** Generar automáticamente las páginas `/privacidad`, `/aviso-legal` y `/terminos`.
- **Consentimiento:** Banner de cookies conforme a normativa AEPD.
- **Branding Oficial:** Incluir en el pie de página de toda aplicación el sello distintivo: **"By Toni"**.

---

### 5. 📂 Registro Central y Control en Google Drive
- **Registro Maestro:** Mantener actualizado el inventario en `Registro_Proyectos_Toni.csv`.
- **Ficha Técnica `INFO_PROYECTO.md`:** Generar y mantener la ficha técnica del proyecto detallando arquitectura, esquemas, cumplimiento de directrices y comandos de arranque local.
