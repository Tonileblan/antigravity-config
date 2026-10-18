#!/usr/bin/env python3
"""
HARPA AI Remote-Control Browser Client
Permite controlar tu nodo de navegador de HARPA AI vía REST API (Grid).
Capacidades: ping, scrape, serp (Google search), prompt, command.
"""

import os
import sys
import json
import argparse
import urllib.request
import urllib.error
from pathlib import Path

HARPA_GRID_URL = "https://api.harpa.ai/api/v1/grid"
DEFAULT_ENV_PATH = Path("/Users/toni/Proyectos/PrimeIO/.env")


def load_credentials():
    api_key = os.environ.get("HARPA_API_KEY")
    node_id = os.environ.get("HARPA_NODE_ID")

    if not api_key and DEFAULT_ENV_PATH.exists():
        with open(DEFAULT_ENV_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("HARPA_API_KEY="):
                    api_key = line.split("=", 1)[1].strip()
                elif line.startswith("HARPA_NODE_ID="):
                    node_id = line.split("=", 1)[1].strip()

    if not api_key:
        sys.stderr.write("Error: HARPA_API_KEY no encontrada en entorno ni en /Users/toni/Proyectos/PrimeIO/.env\n")
        sys.exit(1)

    return api_key, node_id


def call_harpa(payload: dict, api_key: str, timeout: int = 300) -> dict:
    req = urllib.request.Request(
        HARPA_GRID_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "Antigravity-Agent/1.0",
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="ignore")
        sys.stderr.write(f"HTTP Error {e.code}: {err_body}\n")
        sys.exit(1)
    except urllib.error.URLError as e:
        sys.stderr.write(f"Network Error: {e.reason}\n")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Cliente CLI para HARPA AI Grid")
    subparsers = parser.add_subparsers(dest="action", required=True)

    # ping
    subparsers.add_parser("ping", help="Comprueba si el nodo de navegador está activo")

    # scrape
    scrape_p = subparsers.add_parser("scrape", help="Extrae contenido de una URL usando tu navegador")
    scrape_p.add_argument("url", help="URL a scrapear")
    scrape_p.add_argument("--json", action="store_true", help="Salida en JSON crudo")

    # serp
    serp_p = subparsers.add_parser("serp", help="Ejecuta una búsqueda SERP en Google y extrae resultados")
    serp_p.add_argument("query", help="Término de búsqueda")
    serp_p.add_argument("--json", action="store_true", help="Salida en JSON crudo")

    # prompt
    prompt_p = subparsers.add_parser("prompt", help="Envía un prompt al modelo de IA activo en HARPA")
    prompt_p.add_argument("text", help="Texto del prompt")

    args = parser.parse_args()
    api_key, node_id = load_credentials()

    payload = {"action": args.action}
    if node_id:
        payload["node"] = node_id

    if args.action == "ping":
        res = call_harpa(payload, api_key)
        results = res.get("results", [{}])[0]
        pong = results.get("pong", False)
        node = results.get("nodeId", "unknown")
        if pong:
            print(f"✅ HARPA AI conectado exitosamente. Nodo activo: {node}")
        else:
            print(f"⚠️ Respuesta inesperada: {json.dumps(res, indent=2)}")

    elif args.action == "scrape":
        payload["url"] = args.url
        res = call_harpa(payload, api_key)
        if args.json:
            print(json.dumps(res, indent=2, ensure_ascii=False))
        else:
            results = res.get("results", [{}])[0]
            print(f"--- SCRAPE: {results.get('title', 'Sin título')} ---")
            print(f"URL: {results.get('url')}")
            print(f"Descripción: {results.get('description', '')}\n")
            print(results.get("markdown", ""))

    elif args.action == "serp":
        payload["query"] = args.query
        res = call_harpa(payload, api_key)
        if args.json:
            print(json.dumps(res, indent=2, ensure_ascii=False))
        else:
            results = res.get("results", [{}])[0]
            links = results.get("links", [])
            print(f"Encontrados {len(links)} resultados para '{args.query}':\n")
            for idx, item in enumerate(links, 1):
                print(f"[{idx}] {item.get('title')}")
                print(f"    URL: {item.get('url')}")
                print(f"    {item.get('description')}\n")

    elif args.action == "prompt":
        payload["prompt"] = args.text
        res = call_harpa(payload, api_key)
        results = res.get("results", [{}])[0]
        print(results.get("result", ""))


if __name__ == "__main__":
    main()
