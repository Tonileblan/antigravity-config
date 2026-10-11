#!/usr/bin/env python3
"""
n8n Client - PrimeIO OS
Cliente oficial para interactuar con la API pública de n8n v1.
Soporta listar flujos, obtener detalles, activar/desactivar, consultar ejecuciones y llamadas genéricas.
"""

import sys
import os
import json
import urllib.request
import urllib.error
from pathlib import Path

def load_credentials():
    base_url = os.environ.get("N8N_BASE_URL")
    api_key = os.environ.get("N8N_API_KEY")

    if not base_url or not api_key:
        env_paths = [
            Path("/Users/toni/Proyectos/PrimeIO/.env"),
            Path.home() / ".gemini" / "config" / ".env",
            Path(".env")
        ]
        for env_path in env_paths:
            if env_path.exists():
                try:
                    with open(env_path, "r", encoding="utf-8") as f:
                        for line in f:
                            line = line.strip()
                            if line.startswith("N8N_BASE_URL="):
                                base_url = base_url or line.split("=", 1)[1].strip().strip('"').strip("'")
                            elif line.startswith("N8N_API_KEY="):
                                api_key = api_key or line.split("=", 1)[1].strip().strip('"').strip("'")
                except Exception:
                    pass

    base_url = base_url or "https://n8n.primeio.es"
    if not api_key:
        print(json.dumps({"error": "N8N_API_KEY no encontrada en entorno ni en .env"}))
        sys.exit(1)

    return base_url.rstrip("/"), api_key

def api_request(endpoint, method="GET", data=None):
    base_url, api_key = load_credentials()
    url = f"{base_url}/api/v1{endpoint}"
    
    headers = {
        "X-N8N-API-KEY": api_key,
        "Accept": "application/json"
    }
    
    payload = None
    if data is not None:
        headers["Content-Type"] = "application/json"
        payload = json.dumps(data).encode("utf-8")

    req = urllib.request.Request(url, data=payload, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            if res_body:
                return json.loads(res_body)
            return {"status": "success", "code": response.status}
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        try:
            return {"error": json.loads(err_msg), "status_code": e.code}
        except Exception:
            return {"error": err_msg, "status_code": e.code}
    except Exception as e:
        return {"error": str(e)}

def main():
    if len(sys.argv) < 2:
        print("Uso: python n8n_client.py <comando> [argumentos...]")
        print("Comandos disponibles:")
        print("  list_workflows [limit]          - Listar workflows")
        print("  get_workflow <id>               - Obtener workflow por ID")
        print("  activate_workflow <id>          - Activar un workflow")
        print("  deactivate_workflow <id>        - Desactivar un workflow")
        print("  list_executions [workflow_id]   - Listar ejecuciones")
        print("  get_execution <id>              - Obtener detalle de una ejecución")
        print("  custom_request <METHOD> <path> [json_payload] - Petición genérica")
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == "list_workflows":
        limit = sys.argv[2] if len(sys.argv) > 2 else "100"
        res = api_request(f"/workflows?limit={limit}")
        print(json.dumps(res, indent=2, ensure_ascii=False))

    elif cmd == "get_workflow":
        if len(sys.argv) < 3:
            print(json.dumps({"error": "Falta el ID del workflow"}))
            sys.exit(1)
        wf_id = sys.argv[2]
        res = api_request(f"/workflows/{wf_id}")
        print(json.dumps(res, indent=2, ensure_ascii=False))

    elif cmd == "activate_workflow":
        if len(sys.argv) < 3:
            print(json.dumps({"error": "Falta el ID del workflow"}))
            sys.exit(1)
        wf_id = sys.argv[2]
        res = api_request(f"/workflows/{wf_id}/activate", method="POST")
        print(json.dumps(res, indent=2, ensure_ascii=False))

    elif cmd == "deactivate_workflow":
        if len(sys.argv) < 3:
            print(json.dumps({"error": "Falta el ID del workflow"}))
            sys.exit(1)
        wf_id = sys.argv[2]
        res = api_request(f"/workflows/{wf_id}/deactivate", method="POST")
        print(json.dumps(res, indent=2, ensure_ascii=False))

    elif cmd == "list_executions":
        wf_id = sys.argv[2] if len(sys.argv) > 2 else None
        endpoint = f"/executions?workflowId={wf_id}&limit=20" if wf_id else "/executions?limit=20"
        res = api_request(endpoint)
        print(json.dumps(res, indent=2, ensure_ascii=False))

    elif cmd == "get_execution":
        if len(sys.argv) < 3:
            print(json.dumps({"error": "Falta el ID de la ejecución"}))
            sys.exit(1)
        exec_id = sys.argv[2]
        res = api_request(f"/executions/{exec_id}")
        print(json.dumps(res, indent=2, ensure_ascii=False))

    elif cmd == "custom_request":
        if len(sys.argv) < 4:
            print(json.dumps({"error": "Uso: custom_request <METHOD> <path> [json_payload]"}))
            sys.exit(1)
        method = sys.argv[2].upper()
        path = sys.argv[3]
        payload = None
        if len(sys.argv) > 4:
            try:
                payload = json.loads(sys.argv[4])
            except Exception as e:
                print(json.dumps({"error": f"Payload JSON inválido: {e}"}))
                sys.exit(1)
        res = api_request(path, method=method, data=payload)
        print(json.dumps(res, indent=2, ensure_ascii=False))

    else:
        print(json.dumps({"error": f"Comando desconocido: {cmd}"}))
        sys.exit(1)

if __name__ == "__main__":
    main()
