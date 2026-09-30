import os
import requests
import sys
import argparse

class ProcessStreetClient:
    def __init__(self):
        self.api_key = os.getenv("PROCESS_STREET_API_KEY")
        if not self.api_key:
            raise ValueError("PROCESS_STREET_API_KEY is not set in the environment variables.")
        
        # API base (usualmente graphQL o v1 REST, usamos v1 REST para workflows)
        # La documentación oficial indica la url base.
        self.base_url = "https://public-api.process.st/api/v1.1" 
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    def request(self, method, endpoint, payload=None):
        url = f"{self.base_url}{endpoint}"
        response = requests.request(method, url, headers=self.headers, json=payload)
        
        if response.status_code in [200, 201]:
            return response.json()
        else:
            print(f"Error {response.status_code}: {response.text}")
            response.raise_for_status()

    # --- FUNCIONALIDADES ---

    def run_workflow(self, workflow_id, name=None):
        """Crea una nueva ejecución de un workflow existente (Proyecto)"""
        payload = {
            "workflowId": workflow_id
        }
        if name:
            payload["name"] = name
            
        return self.request("POST", "/workflow-runs", payload)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process Street API Client")
    parser.add_argument("action", choices=["run_workflow", "custom_request"], help="Acción a realizar")
    parser.add_argument("target", help="ID del Workflow (para run_workflow) o endpoint (para custom_request)")
    parser.add_argument("--name", help="Nombre para la nueva ejecución", default=None)
    parser.add_argument("--method", help="Método HTTP para custom_request (GET, POST)", default="GET")
    
    args = parser.parse_args()
    
    client = ProcessStreetClient()
    
    try:
        if args.action == "run_workflow":
            result = client.run_workflow(args.target, args.name)
            print(f"Éxito: {result}")
        elif args.action == "custom_request":
            result = client.request(args.method, args.target)
            print(f"Éxito: {result}")
            
    except Exception as e:
        print(f"Fallo en la ejecución: {e}")
