---
name: n8n
description: Integración global con el motor de automatizaciones n8n de PrimeIO OS para gestionar flujos, activar/desactivar workflows, consultar ejecuciones y disparar tareas.
---

# n8n Skill - PrimeIO OS

Esta skill permite al agente interactuar con la instancia oficial de n8n de PrimeIO (`https://n8n.primeio.es`) a través de la API pública oficial v1.

## Configuración y Credenciales

Las credenciales están centralizadas en:
- `N8N_BASE_URL`: `https://n8n.primeio.es`
- `N8N_API_KEY`: Clave API configurada en `/Users/toni/Proyectos/PrimeIO/.env`

El script cliente carga automáticamente estas variables sin necesidad de pasarlas en cada comando.

## Capacidades y Comandos Disponibles

El cliente está disponible en `scripts/n8n_client.py`:

### 1. Listar Workflows
```bash
python ~/.gemini/config/skills/n8n/scripts/n8n_client.py list_workflows [limit]
```

### 2. Obtener Detalle de un Workflow
```bash
python ~/.gemini/config/skills/n8n/scripts/n8n_client.py get_workflow <WORKFLOW_ID>
```

### 3. Activar o Desactivar un Workflow
```bash
python ~/.gemini/config/skills/n8n/scripts/n8n_client.py activate_workflow <WORKFLOW_ID>
python ~/.gemini/config/skills/n8n/scripts/n8n_client.py deactivate_workflow <WORKFLOW_ID>
```

### 4. Consultar Ejecuciones
```bash
# Listar últimas 20 ejecuciones globales:
python ~/.gemini/config/skills/n8n/scripts/n8n_client.py list_executions

# Listar ejecuciones de un workflow específico:
python ~/.gemini/config/skills/n8n/scripts/n8n_client.py list_executions <WORKFLOW_ID>

# Ver detalle de una ejecución:
python ~/.gemini/config/skills/n8n/scripts/n8n_client.py get_execution <EXECUTION_ID>
```

### 5. Peticiones Personalizadas (Custom Request)
Para interactuar con cualquier endpoint de la API v1 de n8n:
```bash
python ~/.gemini/config/skills/n8n/scripts/n8n_client.py custom_request GET /workflows
python ~/.gemini/config/skills/n8n/scripts/n8n_client.py custom_request POST /workflows '{"name": "Nuevo flujo", "nodes": []}'
```

## Disparo de Webhooks de n8n
Para disparar un webhook de un flujo activo en n8n:
```bash
curl -X POST https://n8n.primeio.es/webhook/<path-del-webhook> -H "Content-Type: application/json" -d '{"param": "valor"}'
```
