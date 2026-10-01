#!/usr/bin/env node
/**
 * Ollama MCP Server
 * Expone el LLM local (Ollama) al agente Antigravity vía Model Context Protocol.
 * Modelos disponibles: deepseek-r1:14b, qwen2.5-coder:7b
 * Host: http://localhost:11434
 */

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "deepseek-r1:14b";

// ── MCP Protocol helpers ──────────────────────────────────────────────────────

function sendResponse(id, result) {
  const msg = JSON.stringify({ jsonrpc: "2.0", id, result });
  process.stdout.write(`Content-Length: ${Buffer.byteLength(msg)}\r\n\r\n${msg}`);
}

function sendError(id, code, message) {
  const msg = JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } });
  process.stdout.write(`Content-Length: ${Buffer.byteLength(msg)}\r\n\r\n${msg}`);
}

// ── Ollama API helpers ────────────────────────────────────────────────────────

async function ollamaChat({ model = DEFAULT_MODEL, messages, temperature = 0.7 }) {
  const res = await fetch(`${OLLAMA_HOST}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, temperature, stream: false }),
  });
  if (!res.ok) throw new Error(`Ollama error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function ollamaGenerate({ model = DEFAULT_MODEL, prompt, temperature = 0.7 }) {
  const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, temperature, stream: false }),
  });
  if (!res.ok) throw new Error(`Ollama error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.response ?? "";
}

async function listModels() {
  const res = await fetch(`${OLLAMA_HOST}/api/tags`);
  if (!res.ok) throw new Error(`Ollama error ${res.status}`);
  const data = await res.json();
  return (data.models ?? []).map((m) => ({
    name: m.name,
    size_gb: (m.size / 1e9).toFixed(1),
    modified: m.modified_at,
  }));
}

// ── Tool definitions ──────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: "ollama_chat",
    description: "Envía mensajes al LLM local (Ollama) y obtiene respuesta. Ideal para razonamiento, revisión de código y datos privados sin enviar nada a la nube.",
    inputSchema: {
      type: "object",
      properties: {
        messages: {
          type: "array",
          description: "Array de mensajes con rol user/assistant/system.",
          items: {
            type: "object",
            properties: {
              role: { type: "string", enum: ["user", "assistant", "system"] },
              content: { type: "string" },
            },
            required: ["role", "content"],
          },
        },
        model: {
          type: "string",
          description: "Modelo a usar. Por defecto: deepseek-r1:14b. También: qwen2.5-coder:7b",
          default: "deepseek-r1:14b",
        },
        temperature: {
          type: "number",
          description: "Temperatura 0.0-1.0. Por defecto: 0.7",
          default: 0.7,
        },
      },
      required: ["messages"],
    },
  },
  {
    name: "ollama_generate",
    description: "Completa un prompt con el LLM local. Útil para código, SQL o texto corto.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "El prompt a completar." },
        model: { type: "string", description: "Modelo. Por defecto: deepseek-r1:14b.", default: "deepseek-r1:14b" },
        temperature: { type: "number", description: "Temperatura 0.0-1.0.", default: 0.7 },
      },
      required: ["prompt"],
    },
  },
  {
    name: "ollama_list_models",
    description: "Lista los modelos de Ollama instalados con su tamaño.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "ollama_status",
    description: "Comprueba si el servidor Ollama está activo.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
];

// ── Message handler ───────────────────────────────────────────────────────────

async function handleRequest(req) {
  const { id, method, params } = req;

  if (method === "initialize") {
    return sendResponse(id, {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: { name: "ollama-mcp", version: "1.0.0" },
    });
  }

  if (method === "tools/list") {
    return sendResponse(id, { tools: TOOLS });
  }

  if (method === "tools/call") {
    const { name, arguments: args } = params;
    try {
      let content;
      if (name === "ollama_chat") {
        const text = await ollamaChat(args);
        content = [{ type: "text", text }];
      } else if (name === "ollama_generate") {
        const text = await ollamaGenerate(args);
        content = [{ type: "text", text }];
      } else if (name === "ollama_list_models") {
        const models = await listModels();
        content = [{ type: "text", text: JSON.stringify(models, null, 2) }];
      } else if (name === "ollama_status") {
        try {
          const res = await fetch(`${OLLAMA_HOST}/api/tags`);
          const data = await res.json();
          const count = data.models?.length ?? 0;
          content = [{ type: "text", text: `Ollama activo en ${OLLAMA_HOST} — ${count} modelo(s) cargados.` }];
        } catch {
          content = [{ type: "text", text: `Ollama NO accesible en ${OLLAMA_HOST}. Arranca con: open -a Ollama` }];
        }
      } else {
        return sendError(id, -32601, `Tool not found: ${name}`);
      }
      return sendResponse(id, { content });
    } catch (err) {
      return sendError(id, -32000, `Tool error: ${err.message}`);
    }
  }

  if (method === "notifications/initialized") return;
  sendError(id, -32601, `Method not found: ${method}`);
}

// ── Stdio transport ───────────────────────────────────────────────────────────

let buffer = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  buffer += chunk;
  while (true) {
    const headerEnd = buffer.indexOf("\r\n\r\n");
    if (headerEnd === -1) break;
    const header = buffer.slice(0, headerEnd);
    const lenMatch = header.match(/Content-Length:\s*(\d+)/i);
    if (!lenMatch) { buffer = buffer.slice(headerEnd + 4); break; }
    const len = parseInt(lenMatch[1], 10);
    const start = headerEnd + 4;
    if (buffer.length < start + len) break;
    const body = buffer.slice(start, start + len);
    buffer = buffer.slice(start + len);
    try {
      const req = JSON.parse(body);
      handleRequest(req).catch((err) => {
        if (req.id != null) sendError(req.id, -32000, err.message);
      });
    } catch {
      sendError(null, -32700, "Parse error");
    }
  }
});

process.stdin.on("end", () => process.exit(0));
process.stderr.write(`[ollama-mcp] Servidor iniciado. Host: ${OLLAMA_HOST} | Modelo: ${DEFAULT_MODEL}\n`);
