import os
import requests
import sys

def add_subscriber(email, first_name=None, last_name=None, list_id=None):
    """
    Adds a new subscriber to an Acumbamail list.
    """
    token = os.getenv("ACUMBAMAIL_TOKEN")
    if not token:
        raise ValueError("ACUMBAMAIL_TOKEN is not set in the environment variables.")

    if not list_id:
        raise ValueError("list_id must be provided.")

    base_url = "https://acumbamail.com/api/1"
    url = f"{base_url}/addSubscriber/"
    
    data = {
        "auth_token": token,
        "list_id": list_id,
        "subscriber": {
            "email": email
        }
    }
    
    if first_name:
        data["subscriber"]["nombre"] = first_name
    if last_name:
        data["subscriber"]["apellidos"] = last_name

    response = requests.post(url, json=data)
    
    if response.status_code == 200:
        return response.json()
    else:
        response.raise_for_status()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python add_subscriber.py <list_id> <email> [first_name] [last_name]")
        sys.exit(1)
        
    list_id = sys.argv[1]
    email = sys.argv[2]
    first_name = sys.argv[3] if len(sys.argv) > 3 else None
    last_name = sys.argv[4] if len(sys.argv) > 4 else None
    
    try:
        result = add_subscriber(email, first_name, last_name, list_id)
        print(f"Success! Response: {result}")
    except Exception as e:
        print(f"Error adding subscriber: {e}")
