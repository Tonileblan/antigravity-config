import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { GoogleGenAI } from "@google/genai";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const server = new Server(
  {
    name: "notebook-mcp",
    version: "2.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Helper para leer todas las fuentes de un proyecto
async function readSources(projectPath) {
  const sourcesDir = path.join(projectPath, "docs", "fuentes_notebook");
  let sourcesContent = "";
  try {
    const files = await fs.readdir(sourcesDir);
    for (const file of files) {
      const filePath = path.join(sourcesDir, file);
      const content = await fs.readFile(filePath, "utf-8");
      sourcesContent += `\n\n--- DOCUMENTO: ${file} ---\n${content}`;
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  return sourcesContent;
}

// Configuración del SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "add_source",
        description: "Añade un texto o contenido como fuente al Libro del proyecto.",
        inputSchema: {
          type: "object",
          properties: {
            projectPath: { type: "string" },
            fileName: { type: "string" },
            content: { type: "string" }
          },
          required: ["projectPath", "fileName", "content"],
        },
      },
      {
        name: "list_sources",
        description: "Lista las fuentes actuales en el Libro del proyecto.",
        inputSchema: {
          type: "object",
          properties: {
            projectPath: { type: "string" }
          },
          required: ["projectPath"],
        },
      },
      {
        name: "ask_notebook",
        description: "Hace una pregunta sobre las fuentes, aislando a la IA de conocimiento externo.",
        inputSchema: {
          type: "object",
          properties: {
            projectPath: { type: "string" },
            question: { type: "string" }
          },
          required: ["projectPath", "question"],
        },
      },
      {
        name: "generate_formatted_report",
        description: "Genera un informe maquetado (Markdown) basado ESTRICTAMENTE en las fuentes (PRD, análisis, resumen, etc).",
        inputSchema: {
          type: "object",
          properties: {
            projectPath: { type: "string" },
            reportType: { type: "string", description: "Ej: 'PRD', 'Resumen Ejecutivo', 'Plan de Acción'" },
            formatInstructions: { type: "string" }
          },
          required: ["projectPath", "reportType", "formatInstructions"],
        },
      },
      {
        name: "extract_structured_data",
        description: "Extrae datos específicos de las fuentes y los devuelve en formato JSON.",
        inputSchema: {
          type: "object",
          properties: {
            projectPath: { type: "string" },
            dataToExtract: { type: "string", description: "Qué datos sacar. Ej: 'lista de casos de uso', 'métricas clave'" }
          },
          required: ["projectPath", "dataToExtract"],
        },
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const projectPath = args.projectPath;
  const sourcesDir = path.join(projectPath, "docs", "fuentes_notebook");

  if (name === "add_source") {
    await fs.mkdir(sourcesDir, { recursive: true });
    await fs.writeFile(path.join(sourcesDir, args.fileName), args.content, "utf-8");
    return { content: [{ type: "text", text: `Fuente ${args.fileName} añadida correctamente.` }] };
  }

  if (name === "list_sources") {
    try {
      const files = await fs.readdir(sourcesDir);
      return { content: [{ type: "text", text: files.join("\n") || "No hay fuentes." }] };
    } catch {
      return { content: [{ type: "text", text: "La carpeta de fuentes no existe aún." }] };
    }
  }

  // Común para todas las llamadas a Gemini
  const context = await readSources(projectPath);
  if (!context) {
    return { content: [{ type: "text", text: "Error: No hay fuentes cargadas en el proyecto. Añade fuentes primero." }] };
  }

  const systemInstruction = `Eres un asistente de investigación estricto. 
Tu única fuente de verdad son los DOCUMENTOS proporcionados a continuación. 
NUNCA uses conocimiento externo. NUNCA te inventes datos. 
Si la respuesta no está en los documentos, di explícitamente: "La información no se encuentra en las fuentes proporcionadas".
--- DOCUMENTOS BASE ---
${context}`;

  if (name === "ask_notebook") {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: args.question,
      config: { systemInstruction }
    });
    return { content: [{ type: "text", text: response.text }] };
  }

  if (name === "generate_formatted_report") {
    const prompt = `Genera un informe maquetado en formato Markdown de tipo: ${args.reportType}.
Instrucciones de formato: ${args.formatInstructions}
RECUERDA: Basado SOLO en los documentos base proporcionados en tu instrucción del sistema.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: prompt,
      config: { systemInstruction }
    });
    return { content: [{ type: "text", text: response.text }] };
  }

  if (name === "extract_structured_data") {
    const prompt = `Extrae la siguiente información: ${args.dataToExtract}.
Devuelve la respuesta ÚNICAMENTE en formato JSON válido, sin bloques de código Markdown ni texto adicional.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: prompt,
      config: { 
        systemInstruction,
        responseMimeType: "application/json"
      }
    });
    return { content: [{ type: "text", text: response.text }] };
  }

  throw new Error("Herramienta no encontrada");
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Notebook MCP Server running on stdio");
}

run().catch(console.error);
