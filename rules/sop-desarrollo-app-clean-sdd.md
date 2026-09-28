# 📐 DIRECTIVA SOP: DESARROLLO DE APPS, WEB Y MÓDULOS (CLEAN ARCHITECTURE & SDD)

**ID:** DIR-SOP-APP-WEB-V1  
**Ámbito:** Rige sobre todo desarrollo de aplicaciones web, móviles, PWA, frontend, backend y módulos en el workspace.  
**Estado:** ACTIVO (Obligatorio en todo el ecosistema)  
**Stack Autorizado:** TypeScript + React / Vite / Next.js + CSS3 / Tailwind + Supabase PostgreSQL + Vercel  

---

## 1. Objetivos y Criterios de Éxito
- **Objetivo Principal:** Garantizar el desarrollo de aplicaciones y módulos accesibles, modulares, reactivos y escalables aplicando *Spec-Driven Development* (SDD) y *Clean Architecture*.
- **Criterios de Éxito Innegociables:**
  - Compilación limpia en TypeScript (`npm run build` sin errores ni advertencias).
  - Cobertura de tests unitarios e integración en capas de Dominio y Datos (`npm test`).
  - Cumplimiento de accesibilidad WCAG 2.1 AA / EN 301 549 (contraste ≥ 4.5:1, targets táctiles ≥ 48x48px, etiquetas `aria-label`).
  - **Cero Diálogos Nativos:** Prohibido el uso de `window.alert()`, `window.confirm()` o `window.prompt()`. Todo feedback debe ser visual, reactivo y accesible en el DOM (Toasts, Modales).

---

## 2. Especificaciones de Entrada/Salida (I/O) y Estado

### Entradas (Inputs & Eventos)
- **Parámetros de Ruta & Props:** Tipado estricto en TypeScript sin uso de `any`.
- **Eventos de Usuario:** Clicks, formularios, drag-and-drop, gestos táctiles.
- **Variables de Entorno (`.env` / `.env.local`):**
  - `VITE_SUPABASE_URL` / `SUPABASE_URL`: Endpoint de la instancia Supabase.
  - `VITE_SUPABASE_ANON_KEY` / `SUPABASE_ANON_KEY`: Clave pública para autenticación y políticas RLS.

### Salidas (Outputs & Efectos Secundarios)
- **Renderizado UI / DOM:** Componentes modulares, responsivos con CSS3 / variables `:root` / base 10px `rem` (`html { font-size: 62.5%; }`).
- **Feedback Visual:** Notificaciones flotantes (*Toast* con `aria-live="polite"`) o modales custom en el DOM.
- **Persistencia de Datos:** Mutaciones en esquema dedicado de Supabase (`mia_*` propio / `com_*` comercial) o almacenamiento local-first (IndexedDB / LocalStorage).

---

## 3. Flujo Lógico y Arquitectura por Capas (*Clean Architecture*)

### 3.1. Capa de Dominio (`src/domain/`)
- **Entidades Puras:** Modelos e interfaces TypeScript sin dependencias de frameworks ni SDKs externos.
- **Casos de Uso (*Use Cases*):** Lógica de negocio y reglas de validación independientes.
- **Interfaces de Repositorio:** Contratos que definen las operaciones de persistencia.

### 3.2. Capa de Datos (`src/data/`)
- **DTOs y Mappers:** Transformación de datos entre base de datos / APIs y entidades de dominio.
- **Implementación de Repositorios:** Clientes Supabase SDK, APIs REST y almacenamiento local.
- **Políticas de Seguridad (RLS):** Forzar siempre aislamiento multiusuario (`auth.uid() = user_id`).

### 3.3. Capa de Presentación (`src/presentation/`)
- **Gestión de Estado Reactivo:** Hooks personalizados, Zustand, Context API o TanStack Query.
- **Componentes UI y Vistas:** Modularidad, micro-animaciones, diseño fluido y separación estricta de la lógica de negocio (la UI solo invoca casos de uso, nunca consultas directas a BD).

---

## 4. Herramientas y Librerías (Lista Blanca)
- **Frontend Core:** React, TypeScript, HTML5 Semántico, CSS3 Nativo (Flexbox/Grid), Vite / Next.js.
- **Iconos & Estilos:** Lucide React, CSS Variables, Tailwind CSS (si se requiere expresamente).
- **Backend & BaaS:** Supabase JS SDK (Auth, Database PostgreSQL, Storage).
- **Testing & Calidad:** Vitest / Jest, React Testing Library, ESLint, TypeScript Compiler (`tsc`).

---

## 5. Restricciones, Casos Borde y Accesibilidad

### Reglas Innegociables
1. **Aislamiento de Estado:** Las vistas de la capa de presentación no deben realizar llamadas SQL directas ni interactuar directamente con SDKs de base de datos sin pasar por los casos de uso / repositorios.
2. **Cero `alert()` / `confirm()`:** Cualquier mensaje de error, confirmación o advertencia debe mostrarse mediante Toast visual o Modal interactivo en el DOM.
3. **Ergonomía Móvil y Touch:**
   - Botones y elementos interactivos con área mínima de `48x48px`.
   - Dimensiones tipográficas y espaciados basados en `rem` (base 10px).
   - Tipografía moderna (Inter, Outfit, Roboto) evitando fuentes por defecto del navegador.
4. **Resiliencia de Red:** Gestión de estados de carga (*skeletons* / *spinners*), reintentos con backoff exponencial y soporte offline.

---

## 6. Protocolo de Errores y Memoria Viva (Auto-aprendizaje)
*Cada error detectado durante el desarrollo debe corregirse en el código y registrarse en esta tabla para evitar regresiones.*

| Fecha | Error Detectado | Causa Raíz | Solución / Parche Definitivo |
| :--- | :--- | :--- | :--- |
| [DD/MM] | Importación de librería externa no autorizada | Violación de lista blanca | Refactorizado a CSS3 nativo y componentes puros |
| [DD/MM] | Fallo de lectura por pantalla en botón gráfico | Falta de atributo `aria-label` | Añadido etiquetado semántico obligatorio |
| [DD/MM] | Mutación accidental de datos entre usuarios | Faltaban políticas RLS | Configurado RLS en Supabase forzando `auth.uid() = user_id` |

---

## 7. Comandos Estándar de Verificación

```bash
# Desarrollo local
npm run dev

# Ejecución de tests unitarios y de integración
npm run test

# Comprobación estricta de tipos TypeScript
npm run type-check

# Compilación de producción
npm run build

# Verificación de linter y estilos
npm run lint
```

---

## 8. Checklist de Pre-Ejecución
- [ ] Variables de entorno configuradas (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- [ ] Entidades de dominio y casos de uso definidos en TypeScript.
- [ ] Esquema dedicado de base de datos configurado (`mia_*` o `com_*`).

---

## 9. Checklist Post-Ejecución
- [ ] Cero errores de compilación (`npm run build` exitoso).
- [ ] Cobertura de tests unitarios aprobada.
- [ ] Feedback visual interactivo en el DOM verificado (sin `alert`, `confirm` ni `prompt`).
- [ ] Accesibilidad comprobada (foco visible, contraste ≥ 4.5:1, etiquetas semánticas).
- [ ] Políticas RLS en Supabase activadas y verificadas.
- [ ] Directiva actualizada con nuevos aprendizajes si hubo incidencias.
