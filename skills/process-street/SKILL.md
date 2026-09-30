---
name: process-street
description: Integración global con Process Street para iniciar automatizaciones, checklists y ejecuciones de workflows (proyectos).
---

# Process Street Skill

Esta skill permite a los agentes interactuar con [Process Street](https://process.st/) para crear nuevas ejecuciones (Workflow Runs) a partir de tus plantillas maestras. Es ideal para automatizar tareas repetitivas, como el onboarding de nuevos clientes, revisiones de código o check-lists de marketing.

## Funcionalidades Soportadas (Script Central)

El script `scripts/process_street_client.py` actúa como cliente de la API de Process Street.

### Ejemplos de uso

1. **Crear una nueva ejecución (Proyecto / Workflow Run):**
   ```bash
   python ~/.gemini/config/skills/process-street/scripts/process_street_client.py run_workflow "ID_DE_TU_PLANTILLA" "Nombre del Nuevo Proyecto"
   ```

2. **Llamadas genéricas a otros endpoints (Listar workflows, ver tareas):**
   ```bash
   python ~/.gemini/config/skills/process-street/scripts/process_street_client.py custom_request "GET" "/workflows"
   ```

## Configuración
Requiere que la clave de API esté configurada en el entorno o en el `.env` del proyecto local:
*   `PROCESS_STREET_API_KEY`: API Key (Ej. api_uLB5...)

## Flujo de Trabajo Ideal
1. **El usuario (Tú)** diseñas la plantilla maestra a mano en la interfaz de Process Street.
2. Usas esta Skill para consultar tus plantillas existentes y sacar el ID de la plantilla.
3. Cuando hay un nuevo evento (ej. "Ha entrado un cliente"), el agente lanza un `run_workflow` con ese ID para **crear el proyecto**.
