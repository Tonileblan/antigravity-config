import os
import requests
import sys
import argparse

class JotUrlClient:
    def __init__(self):
        self.api_key = os.getenv("JOTURL_API_KEY")
        if not self.api_key:
            raise ValueError("JOTURL_API_KEY is not set in the environment variables.")
        
        # URL base estándar (Nota: Ajustar si JotUrl usa un subdominio específico de API v3/v1)
        self.base_url = "https://api.joturl.com/v1" 
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

    # --- FUNCIONALIDADES ESPECÍFICAS ---

    def create_link(self, destination_url, alias=None):
        """Crea un enlace corto usando el endpoint de JotUrl"""
        # Nota: El domain_id y project_id se obtienen de la prueba exitosa
        # Idealmente, podrían parametrizarse si cambian en el futuro.
        domain_id = "eab2032b7461b2b356ba6ac9f048203c"
        project_id = "de3c944d57b433eb8940e60061db908f"
        
        url = f"https://joturl.com/a/i1/urls/shorten"
        params = {
            "domain_id": domain_id,
            "project_id": project_id,
            "long_url": destination_url
        }
        if alias:
            params["alias"] = alias
            
        response = requests.post(url, headers=self.headers, params=params, data="")
        
        if response.status_code in [200, 201]:
            return response.json()
        else:
            print(f"Error {response.status_code}: {response.text}")
            response.raise_for_status()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="JotUrl API Client")
    parser.add_argument("action", choices=["create_link", "custom_request"], help="Acción a realizar")
    parser.add_argument("target", help="URL de destino (para create_link) o endpoint (para custom_request)")
    parser.add_argument("--alias", help="Alias personalizado para el enlace corto", default=None)
    parser.add_argument("--method", help="Método HTTP para custom_request (GET, POST)", default="GET")
    
    args = parser.parse_args()
    
    client = JotUrlClient()
    
    try:
        if args.action == "create_link":
            result = client.create_link(args.target, args.alias)
            print(f"Éxito: {result}")
        elif args.action == "custom_request":
            result = client.request(args.method, args.target)
            print(f"Éxito: {result}")
            
    except Exception as e:
        print(f"Fallo en la ejecución: {e}")
