# PROMPT MAESTRO: INICIALIZACIÓN AUTÓNOMA DE PROYECTO


Actúa como un Lead Software Architect Agent. Dado que tienes acceso al sistema de archivos y terminal de este Mac, tu objetivo es inicializar la estructura completa de este proyecto siguiendo Spec-Driven Development (SDD) y Clean Architecture de forma autónoma.


Ejecuta los siguientes pasos secuencialmente:


---


### PASO 1: Crear el archivo de reglas `.antigravityrules`
Crea el archivo `.antigravityrules` en la raíz del espacio de trabajo con el siguiente contenido:


# .antigravityrules - Reglas Persistentes del Proyecto


## 1. Arquitectura y Estructura
- Sigue Clean Architecture adaptada al stack del proyecto:
  - `src/domain/`: Lógica pura de negocio, entidades e interfaces (sin dependencias externas).
  - `src/data/`: Implementación de repositorios, DTOs y fuentes de datos (APIs/DB).
  - `src/presentation/`: Componentes de interfaz (UI), pantallas y gestión de estado.
  - `tests/`: Pruebas unitarias e integración aisladas por capas.
- Toda la documentación viva del sistema se ubica en `docs/code-documentation/`.


## 2. Flujo de Trabajo y Calidad
- Trabaja mediante Spec-Driven Development (SDD): Consulta siempre los requisitos en `docs/code-documentation/business-requirements.md`.
- Construye en incrementos pequeños: tras modificar cada archivo, ejecuta el test o validación correspondiente.
- No des por completada una tarea sin verificar que no hay errores de sintaxis, tipos o linter.


## 3. Zonas Protegidas y Seguridad
- NO modifiques credenciales, variables de entorno (.env), esquemas de DB ni flujos sensibles de pago o autenticación sin aprobación previa.


---


### PASO 2: Crear el kit de documentación viva (`docs/code-documentation/`)
Crea la carpeta `docs/code-documentation/` y genera estos tres archivos base:


1. `docs/code-documentation/architecture-overview.md`:
   Describe la separación de responsabilidades por capas (domain, data, presentation), el flujo de datos unidireccional y las reglas de inyección de dependencias.


2. `docs/code-documentation/testing-guidelines.md`:
   Define la estrategia de pruebas por capas (cobertura objetivo, comandos para ejecutar linter y suite de tests locales con salidas compactas).


3. `docs/code-documentation/business-requirements.md`:
   Crea la plantilla PRD inicial para registrar las historias de usuario y criterios de aceptación testables (`- [ ] Criterio`).


---


### PASO 3: Crear la estructura de carpetas de código fuente
Crea en el sistema de archivos los siguientes directorios:
- `src/domain/entities/`
- `src/domain/repositories/`
- `src/data/models/`
- `src/data/datasources/`
- `src/data/repositories/`
- `src/presentation/components/` (o `widgets/` si es móvil)
- `src/presentation/views/` (o `screens/`)
- `src/presentation/state/`
- `tests/unit/`
- `tests/integration/`


---


### PASO 4: Configuración inicial y Test de Humo
1. Detecta la tecnología del entorno o inicializa el manifiesto base de paquetes (`package.json`, etc.).
2. Crea un test de humo de ejemplo (`smoke_test`) en `tests/unit/` y ejecútalo para confirmar que la suite de pruebas responde correctamente.


---


### PASO 5: Plan de Ejecución y Confirmación
1. Registra el inventario de archivos generados en `.antigravity/plans/01-scaffolding.md`.
2. Muestra en la consola un resumen en árbol de la estructura creada y solicita mi confirmación explícita antes de comenzar a escribir lógica de negocio.