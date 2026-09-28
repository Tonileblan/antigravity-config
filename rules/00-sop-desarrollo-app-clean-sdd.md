# 📐 DIRECTIVA DE MÁXIMA PRIORIDAD: SOP_DESARROLLO_APP_CLEAN_SDD

*ID:* DIR-APP-2026-V1    
*Agente / Script Asociado:* `scripts/app_builder_agent.py` / `Antigravity Agent Manager`    
*Última Actualización:* 2026-09-24    
*Estado:* ACTIVO (PRIORIDAD MÁXIMA OBLIGATORIA)

---

### 1. Objetivos y Alcance

- **Objetivo Principal:** Guiar al agente autónomo de desarrollo en la concepción, maquetación, programación y validación de aplicaciones móviles y web accesibles, escalables y mantenibles, aplicando Spec-Driven Development (SDD) y Clean Architecture.  
- **Criterio de Éxito:** La aplicación compila sin advertencias ni errores, pasa el 100% de la suite de pruebas unitarias y de integración, cumple con las pautas de accesibilidad (EN 301 549 / WCAG 2.1 AA) y no utiliza diálogos nativos (`alert`, `confirm`, `prompt`), proporcionando todo el feedback de forma visual en el DOM o la interfaz.

---

### 2. Especificaciones de Entrada/Salida (I/O)

#### Entradas (Inputs)

- **Argumentos Requeridos:**    
  - `--spec`: Ruta al documento de especificación funcional en Markdown (`docs/code-documentation/business-requirements.md` o `dog-app-spec-v3.md`).  
  - `--stack`: Definición del stack tecnológico autorizado (ej. `React + CSS3 Nativo + Supabase` o `Flutter + Clean Architecture`).  
- **Variables de Entorno (`.env`):**    
  - `SUPABASE_URL`: Endpoint de la instancia de base de datos / BaaS.  
  - `SUPABASE_ANON_KEY`: Clave pública para autenticación y políticas RLS.  
- **Archivos Fuente y Reglas:**    
  - `.antigravityrules`: Reglas persistentes de arquitectura, zonas intocables y comandos permitidos.  
  - `docs/design/`: Carpeta con activos visuales, paleta de colores y mockups de referencia.

#### Salidas (Outputs)

- **Artefactos Generados:**    
  - `src/`: Código fuente organizado en tres capas estrictas (`domain/`, `data/`, `presentation/`).  
  - `tests/`: Pruebas unitarias, de integración y UI.  
  - `docs/code-documentation/architecture-overview.md`: Mapa de arquitectura actualizado.  
- **Retorno de Consola:**    
  - JSON con reporte de compilación, porcentaje de cobertura de tests y resultado del validador (`PASS` / `FAIL`).

---

### 3. Flujo Lógico (Algoritmo de Desarrollo por Pasos)

#### Paso 1: Análisis de Requisitos y Elicitación (SDD)

- Leer la especificación del proyecto (`business-requirements.md`).  
- Descomponer las historias de usuario en criterios de aceptación evaluables (`- [ ]`).  
- Si existe cualquier ambigüedad en los requisitos, detener el flujo y formular preguntas aclaratorias al usuario antes de escribir código.

#### Paso 2: Diseño de Arquitectura por Capas (Clean Architecture)

- **Capa de Dominio (`src/domain/`):** Definir entidades puras, casos de uso e interfaces de repositorio sin dependencias externas.  
- **Capa de Datos (`src/data/`):** Implementar modelos DTO, cliente BaaS (ej. Supabase SDK) y repositorios que implementen las interfaces de dominio.  
- **Capa de Presentación (`src/presentation/`):** Crear vistas/pantallas, componentes UI modulares y gestión de estado.

#### Paso 3: Construcción Incremental y TDD (Bucle Edit-Test-Fix)

- Avanzar en incrementos pequeños (una pantalla o caso de uso por iteración).  
- Escribir o verificar primero los tests unitarios correspondientes a la capa de dominio/datos.  
- Ejecutar la suite de pruebas tras cada cambio. Si un test falla, aplicar parches focalizados hasta obtener luz verde antes de continuar.

#### Paso 4: Validación de UI/UX, Accesibilidad y Feedback en el DOM

- Asegurar que todas las medidas de fuentes y espaciados utilicen `rem` con base de `10px` (`html { font-size: 62.5%; }`).  
- Verificar que no se utilicen llamadas a `alert()`, `confirm()` o `prompt()`. Todo mensaje debe ser una notificación flotante (toast) o un modal custom en el DOM/UI.  
- Comprobar etiquetas accesibles (`aria-label`, `contentDescription`), contrastes mínimos de color (4.5:1) y áreas táctiles de al menos `48x48dp`.

#### Paso 5: Persistencia, Seguridad (RLS) y Publicación

- Configurar políticas de Row Level Security (RLS) en el backend (Supabase/PostgreSQL) para asegurar el aislamiento multiusuario (`auth.uid() = user_id`).  
- Registrar el resumen de la iteración y confirmar la compilación.

---

### 4. Herramientas y Librerías (Lista Blanca)

- **Frontend Core:** React, HTML5 Semántico, CSS3 Nativo (Flexbox, CSS Grid Layout).  
- **Estilos y Dimensionamiento:** CSS Variables en `:root`, unidades `rem` base 10px.  
- **Backend & BaaS:** Supabase JS SDK (Auth, Database PostgreSQL, Storage).  
- **Testing & Calidad:** Vitest / Jest, Testing Library, ESLint / Linter oficial.

---

### 5. Restricciones y Casos Borde (Edge Cases)

#### Limitaciones Conocidas

- **Aislamiento de Estado:** Las vistas de la capa de presentación no deben realizar llamadas directas a APIs o SDKs de base de datos; deben hacerlo siempre a través de los casos de uso.  
- **Anidamiento de Selectores:** Evitar sentencias de control anidadas profundas o estilos CSS sobrecargados; priorizar legibilidad y simplicidad.

#### Errores Comunes y Soluciones (Anti-patrones)

- **Error:** Uso de `alert()` o `prompt()` nativo para solicitar datos o mostrar errores.    
  - **Solución:** Implementar un componente de notificación visual en React/DOM con soporte para lector de pantalla (`aria-live="polite"`).  
- **Error:** Contexto de chat demasiado largo que provoca alucinaciones o degradación de arquitectura.    
  - **Solución:** Aplicar el protocolo de contexto corto (reiniciar sesión de chat, cargar solo los archivos con `@` e indicar el objetivo concreto).

#### Validaciones Requeridas

- Validación de campos obligatorios en formularios con mensajes de error explícitos en el DOM.  
- Comprobación de conectividad y gestión de tiempos de espera (network timeouts).

---

### 6. Protocolo de Errores y Aprendizajes (Memoria Viva)

| Fecha | Error Detectado | Causa Raíz | Solución/Parche Aplicado |  
| :--- | :--- | :--- | :--- |  
| 24/09 | Importación de librería externa de UI no autorizada | Violación de la regla de cero dependencias externas | Eliminación del paquete y refactorización a CSS3 nativo con Flexbox/Grid |  
| 24/09 | Fallo de lectura por pantalla en botón gráfico | Falta de atributo `aria-label` / `contentDescription` | Añadido etiquetado semántico obligatorio en todos los componentes interactivos |  
| 24/09 | Mutación accidental de datos entre usuarios | Faltaban políticas de Row Level Security (RLS) | Configurado RLS en Supabase forzando `auth.uid() = user_id` |

> **Nota de Implementación:** Si encuentras un nuevo error durante la ejecución, corrígelo en el código y documenta inmediatamente el caso en esta tabla para prevenir regresiones futuras.

---

### 7. Ejemplos de Uso

```bash
# Invocación de creación de andamiaje y verificación  
python scripts/app_builder_agent.py --spec docs/code-documentation/business-requirements.md --action scaffold

# Ejecución de pruebas unitarias y validación de tipos  
npm run test:unit  
npm run type-check

# Ejecución de validación de accesibilidad y linter  
npm run lint
```

---

### 8. Checklist de Pre-Ejecución

- [ ] Archivo `.antigravityrules` presente en la raíz del proyecto.  
- [ ] Especificación funcional (`business-requirements.md` / PRD) redactada y validada.  
- [ ] Variables de entorno configuradas (`SUPABASE_URL`, `SUPABASE_ANON_KEY`).  
- [ ] Estructura de tres capas (`src/domain/`, `src/data/`, `src/presentation/`) inicializada.

---

### 9. Checklist Post-Ejecución

- [ ] Cobertura de pruebas unitarias aprobada (>80% en Dominio y Datos).  
- [ ] Cero advertencias de linter y compilación exitosa.  
- [ ] Feedback visual en el DOM comprobado (sin `alert`, `confirm` ni `prompt`).  
- [ ] Accesibilidad verificada (foco visible, contraste, etiquetas semánticas).  
- [ ] Políticas RLS en Supabase activadas y verificadas.  
- [ ] Directiva actualizada con nuevos aprendizajes si hubo incidencias.
