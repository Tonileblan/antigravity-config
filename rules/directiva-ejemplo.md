# 📋 PLANTILLA DE DIRECTIVA SOP: [NOMBRE_CLAVE_DE_LA_APP_O_MODULO]

> **ID de Directiva:** `DIR-APP-[NOMBRE_MODULO]-V1`  
> **Ámbito / Módulo:** `src/presentation/views/...` | `src/domain/usecases/...`  
> **Última Actualización:** `[AAAA-MM-DD]`  
> **Estado:** `[BORRADOR | ACTIVO | DEPRECADO]`  
> **Jerarquía:** Subordinada a las [5 Directrices Maestras de Toni](directrices/00_Directriz_Definicion_Proyecto.md) y a la [Directiva de Desarrollo SOP](rules/sop-desarrollo-app-clean-sdd.md)

---

## 🏛️ 0. Marco Normativo y Directrices Maestras Heredadas
Cualquier tarea o módulo desarrollado bajo esta directiva **debe cumplir obligatoriamente** con las 5 Directrices Maestras del ecosistema:
1. **🗄️ Supabase Multi-Esquema:** Esquema dedicado (`mia_*` propio / `com_*` cliente), RLS forzoso al 100%, columna `user_id` vinculada a `auth.users(id)`.
2. **🛡️ Seguridad & Auth:** Supabase Auth JWT, Route Guards y validación estricta Zero-Trust.
3. **🤖 IA & Streaming SSE:** Conexiones en tiempo real, prompts aislados en capa de servicio y gestión de rate limits con backoff.
4. **⚖️ RGPD & Branding:** Titular legal Antonio Javier García García (DNI 34799350M, Madrid), páginas legales y sello *"By Toni"*.
5. **📂 Control Documental:** Registro en `Registro_Proyectos_Toni.csv` y ficha técnica `INFO_PROYECTO.md`.

---

## 🎯 1. Objetivos y Alcance
*Describe qué debe lograr esta app/módulo y por qué.*
- **Objetivo Principal:** [Descripción concisa del objetivo, ej: "Módulo de gestión de cobros y facturación recurrente con sincronización Supabase"].
- **Criterio de Éxito:** [Condición exacta: "Compila sin errores TypeScript, pasa 100% de tests y feedback en DOM sin alerts"].

---

## 📥 2. Especificaciones de Entrada/Salida (I/O) y Estado

### Entradas (Inputs & Eventos)
- **Props / Parámetros de Ruta:** `[paramId: string]` - [Descripción].
- **Eventos de Usuario:** [Clicks, formularios, gestos táctiles].
- **Variables de Entorno (.env):** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

### Salidas (Outputs)
- **Renderizado UI:** Componentes en DOM accesibles y responsivos.
- **Feedback al Usuario:** Notificación flotante (*Toast*) o Modal custom.
- **Persistencia:** Mutaciones en esquema Supabase (`mia_*` / `com_*`).

---

## 🔄 3. Flujo Lógico y Clean Architecture

1. **Capa de Dominio (`src/domain/`):** Entidades puras y casos de uso de negocio en TypeScript.
2. **Capa de Datos (`src/data/`):** Repositorios Supabase, DTOs y persistencia local.
3. **Capa de Presentación (`src/presentation/`):** Componentes UI, hooks y gestión de estado reactivo.

---

## 🛠️ 4. Herramientas y Librerías Permitidas (Lista Blanca)
- **Frontend:** React, TypeScript, CSS3 Nativo, Lucide React, Vite.
- **BaaS:** Supabase JS SDK (PostgreSQL, Auth, Storage).
- **Testing:** Vitest / Jest, React Testing Library.

---

## ⚠️ 5. Restricciones, Casos Borde y Accesibilidad
- **Cero Diálogos Nativos:** Prohibido `alert()`, `confirm()` o `prompt()`. Usar siempre Toasts en el DOM.
- **Accesibilidad:** `aria-label` en controles interactivos, contraste ≥ 4.5:1, targets táctiles ≥ 48x48px.
- **Aislamiento:** La UI nunca hace llamadas directas a BD; invoca casos de uso.

---

## 🧠 6. Protocolo de Errores y Aprendizajes (Memoria Viva)

| Fecha | Error Detectado | Causa Raíz | Solución / Parche Definitivo |
| :--- | :--- | :--- | :--- |
| [DD/MM] | [Tipo de Error] | [Por qué ocurrió] | [Solución aplicada] |

> **Nota de Implementación:** Arregla el fallo primero en el código y luego añade la regla aquí para evitar regresiones.

---

## 🚀 7. Comandos de Ejecución y Test

```bash
# Desarrollo local
npm run dev

# Tests
npm run test

# Build de producción
npm run build
```

---

## 📋 8. Checklists

### Pre-Ejecución
- [ ] Variables de entorno configuradas (`.env`).
- [ ] Entidades de dominio y casos de uso definidos.

### Post-Ejecución
- [ ] Compilación exitosa (`npm run build`).
- [ ] Tests pasando al 100%.
- [ ] Feedback visual en DOM verificado.
- [ ] Directiva actualizada con nuevos aprendizajes.
