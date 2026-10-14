---
name: ollama
description: LLM local vía Ollama en localhost:11434. Inferencia privada y gratuita con qwen2.5-coder:14b en Apple M1 Pro 16GB. Ideal para código TypeScript/React/SQL y datos sensibles.
---

# 🤖 Ollama Local LLM Skill

Servidor Ollama corriendo en **localhost:11434** con el modelo **qwen2.5-coder:14b** optimizado para Apple Silicon (M1 Pro 16GB).

## 🛠️ Usos Principales

1. **Inferencia de código** (TypeScript, React, SQL, Python) sin coste de API
2. **Procesamiento de datos privados** de clientes sin enviar nada a la nube
3. **Revisión de código** offline y análisis de arquitectura
4. **Apoyo al agente** cuando no hay cuota de API disponible

## 🚀 Comandos Directos

### Generar código / respuesta simple
```bash
curl -s http://localhost:11434/api/generate \
  -d '{"model":"qwen2.5-coder:14b","prompt":"TU PROMPT","stream":false}' \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['response'])"
```

### Chat con historial (OpenAI-compatible)
```bash
curl -s http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen2.5-coder:14b",
    "messages": [{"role":"user","content":"TU MENSAJE"}]
  }' | python3 -c "import json,sys; print(json.load(sys.stdin)['choices'][0]['message']['content'])"
```

### Ver modelos instalados
```bash
ollama list
```

### Arrancar servidor (si no está corriendo)
```bash
open -a Ollama
# o desde terminal:
OLLAMA_HOST=0.0.0.0 ollama serve
```

## 📋 Modelos Instalados

| Modelo | Tamaño | Especialidad | Default |
|---|---|---|---|
| `qwen2.5-coder:14b` | 9.0 GB | Código TypeScript/React/SQL — más potente | ✅ **DEFAULT** |
| `qwen2.5-coder:7b` | 4.7 GB | Código rápido, bajo consumo | — |
| `deepseek-r1:14b` | 9.0 GB | Razonamiento avanzado, chain-of-thought | — |

## ⚙️ Configuración

- **Host:** localhost:11434
- **API compatible:** OpenAI (usa `v1/chat/completions`)
- **Hardware:** Apple M1 Pro · 16GB RAM unificada · Metal 4
- **Inicio automático:** Abre Ollama.app desde el Dock

## 💡 Casos de uso en proyectos activos

- **Bicicletas-Puertanueva:** Revisar SQL de migraciones sin enviar datos a la nube
- **Flow-Girl:** Analizar lógica de dominio y casos de uso offline
- **Antigravity:** Apoyo cuando se agota la cuota de Gemini/Claude
