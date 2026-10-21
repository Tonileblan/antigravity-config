#!/usr/bin/env node

/**
 * PrimeMind MCP Server
 * Model Context Protocol Server with Real-Time Live Bridge for Mindmaps and Visual Sales Funnels
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import http from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execPromise = promisify(exec);
const PORT = 3055;
const isMac = process.platform === 'darwin';
const isWindows = process.platform === 'win32';

// Estado de clientes del navegador conectados
let connectedClients = new Set();
let latestClientState = null;
const pendingRequests = new Map();

// Configuración de Supabase para persistencia cruzada (App <-> Web)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xbdyapccxxhynujkhubp.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiZHlhcGNjeHhoeW51amtodWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NjI2MzIsImV4cCI6MjEwNzAzODYzMn0.0zs93Lj3mPnuNRV-mAI3WNfbXcyBD6OPBMkVq1i5VB0';

let cachedProjects = [];

async function saveProjectToSupabase(project) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/primemind_projects`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify({
        id: project.id,
        name: project.name || project.title,
        type: project.type,
        funnel_data: project.funnelData || null,
        mindmap_data: project.mindmapData || null,
        created_at: project.createdAt || Date.now(),
        updated_at: project.updatedAt || Date.now(),
      }),
    });
    const saved = await res.json();
    return saved;
  } catch (err) {
    console.warn('[PrimeMind MCP] Advertencia al persistir en Supabase:', err.message);
    return null;
  }
}

async function fetchProjectsFromSupabase() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/primemind_projects?select=*&order=updated_at.desc`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    });
    const rows = await res.json();
    if (Array.isArray(rows)) {
      cachedProjects = rows;
      return rows;
    }
  } catch (err) {
    console.warn('[PrimeMind MCP] Advertencia al leer proyectos de Supabase:', err.message);
  }
  return cachedProjects;
}

// 1. Iniciar Servidor HTTP y WebSocket del Puente Local
const httpServer = http.createServer(async (req, res) => {
  // Configurar CORS para permitir comunicación desde localhost y Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/health' || req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'OK',
        connectedClients: connectedClients.size,
        latestState: latestClientState,
      })
    );
    return;
  }

  if (req.url === '/api/projects') {
    const projects = await fetchProjectsFromSupabase();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(projects));
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

wss.on('connection', (ws) => {
  connectedClients.add(ws);

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.data?.type === 'CLIENT_READY') {
        latestClientState = msg.data;
      }

      // Si es respuesta a un comando pendiente
      if (msg.id && pendingRequests.has(msg.id)) {
        const { resolve } = pendingRequests.get(msg.id);
        pendingRequests.delete(msg.id);
        resolve(msg);
      }
    } catch (err) {
      // Ignorar mensajes mal formateados
    }
  });

  ws.on('close', () => {
    connectedClients.delete(ws);
    if (connectedClients.size === 0) {
      latestClientState = null;
    }
  });

  ws.on('error', () => {
    connectedClients.delete(ws);
  });
});

httpServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    // Puerto ocupado por otra instancia del puente, continuar en modo cliente
  }
});

httpServer.listen(PORT, '127.0.0.1', () => {
  // Silencioso para no ensuciar stdio del protocolo MCP
});

/**
 * Envía un comando a la pestaña activa de PrimeMind y espera la respuesta
 */
async function sendCommandToBrowser(action, payload = {}, timeoutMs = 6000) {
  // Si no hay cliente conectado, intentamos abrir la app y esperar brevemente
  if (connectedClients.size === 0) {
    try {
      await openPrimeMindInBrowser();
      // Esperar hasta 2.5s a que la pestaña abra y se conecte
      for (let i = 0; i < 10; i++) {
        await new Promise((r) => setTimeout(r, 250));
        if (connectedClients.size > 0) break;
      }
    } catch {}
  }

  const activeWs = Array.from(connectedClients)[0];
  if (!activeWs || activeWs.readyState !== WebSocket.OPEN) {
    throw new Error(
      'PrimeMind no está abierto o conectado en el navegador. Abre https://primemind.vercel.app o ejecuta primemind_open para vincular la sesión en vivo.'
    );
  }

  const reqId = `mcp-req-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const message = {
    id: reqId,
    action,
    payload,
  };

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pendingRequests.delete(reqId);
      reject(new Error(`Tiempo de espera agotado (${timeoutMs}ms) esperando respuesta de PrimeMind.`));
    }, timeoutMs);

    pendingRequests.set(reqId, {
      resolve: (result) => {
        clearTimeout(timer);
        if (result.success) {
          resolve(result.data);
        } else {
          reject(new Error(result.error || 'Error desconocido al ejecutar comando en PrimeMind'));
        }
      },
      reject,
    });

    activeWs.send(JSON.stringify(message));
  });
}

/**
 * Abre PrimeMind en el navegador por defecto
 */
async function openPrimeMindInBrowser(url = 'https://primemind.vercel.app') {
  if (isMac) {
    await execPromise(`open "${url}"`);
  } else if (isWindows) {
    await execPromise(`start "" "${url}"`);
  } else {
    await execPromise(`xdg-open "${url}"`);
  }
}

// 2. Configurar el Servidor MCP
const server = new Server(
  {
    name: 'primemind-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const TOOLS = [
  {
    name: 'primemind_status',
    description: 'Comprueba el estado de la conexión en vivo con PrimeMind en el navegador (si está abierto, modo activo, cantidad de nodos y título del proyecto).',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'primemind_open',
    description: 'Abre PrimeMind en el navegador predeterminado (por defecto https://primemind.vercel.app o localhost) y trae la ventana al frente.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'URL a abrir (opcional, por defecto https://primemind.vercel.app o http://localhost:5173).',
        },
      },
    },
  },
  {
    name: 'primemind_set_mode',
    description: 'Alterna el espacio de trabajo de PrimeMind entre "funnel" (Embudos de Venta) y "mindmap" (Mapa Mental estilo XMind).',
    inputSchema: {
      type: 'object',
      properties: {
        mode: {
          type: 'string',
          enum: ['funnel', 'mindmap'],
          description: 'Espacio de trabajo a activar.',
        },
      },
      required: ['mode'],
    },
  },
  {
    name: 'primemind_create_funnel',
    description: 'Crea un embudo de ventas completo desde cero en el lienzo, con sus pasos (fuentes de tráfico, páginas web, checkouts, emails) y conexiones de flujo.',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Título del embudo (ej: "Embudo High-Ticket Asesoría", "Lanzamiento Webinar").',
        },
        nodes: {
          type: 'array',
          description: 'Lista ordenada de pasos del embudo.',
          items: {
            type: 'object',
            properties: {
              typeId: {
                type: 'string',
                description: 'Identificador del elemento. Opciones recomendadas: meta_ads, google_ads, youtube_ads, tiktok_ads, email_campaign, optin_page, sales_page, vsl_page, webinar_room, checkout_page, thank_you_page, lead_captured, purchase_completed, call_booked, call_closed.',
              },
              title: {
                type: 'string',
                description: 'Nombre descriptivo del paso (ej: "Facebook Ad Frío", "Página de Registro", "VSL 15 min", "Checkout 97€").',
              },
              x: {
                type: 'number',
                description: 'Coordenada horizontal X en píxeles (opcional, layout automático si se omite).',
              },
              y: {
                type: 'number',
                description: 'Coordenada vertical Y en píxeles (opcional).',
              },
              url: {
                type: 'string',
                description: 'URL de destino asociada al paso (ej: "/registro", "https://tudominio.com/checkout").',
              },
              notes: {
                type: 'string',
                description: 'Notas estratégicas o directrices de copywriting para este paso.',
              },
            },
            required: ['typeId', 'title'],
          },
        },
        connections: {
          type: 'array',
          description: 'Conexiones/flechas de flujo entre pasos. Si se omite, los pasos se encadenan automáticamente de izquierda a derecha.',
          items: {
            type: 'object',
            properties: {
              sourceIndex: {
                type: 'number',
                description: 'Índice (0-based) del paso origen en la lista de nodos.',
              },
              targetIndex: {
                type: 'number',
                description: 'Índice (0-based) del paso destino en la lista de nodos.',
              },
              sourceTitle: {
                type: 'string',
                description: 'O bien el título exacto del paso origen.',
              },
              targetTitle: {
                type: 'string',
                description: 'O bien el título exacto del paso destino.',
              },
            },
          },
        },
      },
      required: ['nodes'],
    },
  },
  {
    name: 'primemind_add_funnel_node',
    description: 'Añade un paso individual al embudo actualmente abierto en el lienzo, con opción de conectarlo desde un paso existente.',
    inputSchema: {
      type: 'object',
      properties: {
        typeId: {
          type: 'string',
          description: 'Tipo de elemento (ej: meta_ads, optin_page, sales_page, vsl_page, checkout_page, purchase_completed, etc.).',
        },
        title: {
          type: 'string',
          description: 'Título del paso.',
        },
        x: {
          type: 'number',
          description: 'Coordenada X (opcional, se sitúa a la derecha del último nodo).',
        },
        y: {
          type: 'number',
          description: 'Coordenada Y (opcional).',
        },
        url: {
          type: 'string',
          description: 'Enlace o URL de la página.',
        },
        notes: {
          type: 'string',
          description: 'Notas estratégicas o instrucciones de copy.',
        },
        connectFromId: {
          type: 'string',
          description: 'ID del nodo origen del cual trazar una flecha automática hacia este nuevo paso (opcional).',
        },
      },
      required: ['typeId'],
    },
  },
  {
    name: 'primemind_connect_funnel_nodes',
    description: 'Traza una flecha direccional de flujo de tráfico entre dos pasos existentes del embudo.',
    inputSchema: {
      type: 'object',
      properties: {
        sourceId: {
          type: 'string',
          description: 'ID del paso origen.',
        },
        targetId: {
          type: 'string',
          description: 'ID del paso destino.',
        },
      },
      required: ['sourceId', 'targetId'],
    },
  },
  {
    name: 'primemind_update_funnel_node',
    description: 'Actualiza el título, URL, notas o dimensiones de un paso del embudo.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID del paso a modificar.',
        },
        title: {
          type: 'string',
          description: 'Nuevo título.',
        },
        url: {
          type: 'string',
          description: 'Nueva URL o slug.',
        },
        notes: {
          type: 'string',
          description: 'Nuevas notas de estrategia o copy.',
        },
        width: {
          type: 'number',
          description: 'Ancho en píxeles.',
        },
        height: {
          type: 'number',
          description: 'Alto en píxeles.',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'primemind_delete_funnel_node',
    description: 'Elimina un paso del embudo y todas sus conexiones asociadas.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID del paso a eliminar.',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'primemind_load_template',
    description: 'Carga una plantilla oficial de embudo de alta conversión probada (webinar_canonical, lander_vsl_sequence, saas_growth_onboarding, high_ticket_vsl_booking, lead_magnet_tripwire, ecommerce_flash_upsell, saas_freemium_plg).',
    inputSchema: {
      type: 'object',
      properties: {
        templateId: {
          type: 'string',
          description: 'Identificador de la plantilla.',
        },
      },
      required: ['templateId'],
    },
  },
  {
    name: 'primemind_create_mindmap',
    description: 'Crea un mapa mental completo jerárquico desde un tema central con subtemas y ramas estructuradas.',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Título general del mapa mental.',
        },
        rootTitle: {
          type: 'string',
          description: 'Texto del nodo central.',
        },
        structure: {
          type: 'string',
          enum: ['mindmap-radial', 'logic-right', 'org-down', 'fishbone-left', 'timeline-h'],
          description: 'Estructura visual (por defecto: mindmap-radial).',
        },
        themeId: {
          type: 'string',
          description: 'Tema de colores (ej: theme-business-blue, theme-emerald-growth, theme-cyber-purple).',
        },
        topics: {
          type: 'array',
          description: 'Ramas principales con subtemas anidados recursivamente.',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              color: { type: 'string' },
              notes: { type: 'string' },
              children: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    children: { type: 'array' },
                  },
                },
              },
            },
            required: ['title'],
          },
        },
      },
      required: ['title'],
    },
  },
  {
    name: 'primemind_add_mindmap_topic',
    description: 'Añade una idea o subtema a un nodo existente del mapa mental.',
    inputSchema: {
      type: 'object',
      properties: {
        parentId: {
          type: 'string',
          description: 'ID del nodo padre al que añadir la idea (si se omite, se añade a la raíz).',
        },
        title: {
          type: 'string',
          description: 'Texto del nuevo subtema.',
        },
      },
      required: ['title'],
    },
  },
  {
    name: 'primemind_get_active_project',
    description: 'Obtiene toda la estructura JSON completa del proyecto actualmente abierto en el lienzo para que la IA pueda leerlo y analizarlo.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

// Registrar el listado de herramientas
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

// Manejador central de ejecución de herramientas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'primemind_status': {
        const isConnected = connectedClients.size > 0;
        let details = null;

        if (isConnected) {
          try {
            details = await sendCommandToBrowser('GET_STATE', {}, 1500);
          } catch {}
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  status: isConnected ? 'CONNECTED' : 'STANDBY',
                  bridgePort: PORT,
                  connectedTabs: connectedClients.size,
                  activeMode: details?.activeMode || latestClientState?.activeMode || 'unknown',
                  activeFunnel: details?.funnel
                    ? {
                        title: details.funnel.title,
                        nodesCount: details.funnel.nodes?.length || 0,
                        connectionsCount: details.funnel.connections?.length || 0,
                      }
                    : null,
                  activeMindmap: details?.mindmap
                    ? {
                        title: details.mindmap.title,
                        rootTopic: details.mindmap.rootTopic?.title,
                      }
                    : null,
                  message: isConnected
                    ? '⚡ PrimeMind está conectado en vivo al puente MCP. Puedes enviar comandos en tiempo real.'
                    : 'PrimeMind no tiene pestañas abiertas en el navegador. Usa primemind_open para abrir la app.',
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'primemind_open': {
        const targetUrl = args?.url || 'https://primemind.vercel.app';
        await openPrimeMindInBrowser(targetUrl);
        return {
          content: [
            {
              type: 'text',
              text: `🚀 PrimeMind abierto en el navegador (${targetUrl}). La conexión en vivo se establecerá automáticamente.`,
            },
          ],
        };
      }

      case 'primemind_set_mode': {
        const result = await sendCommandToBrowser('SET_MODE', { mode: args.mode });
        return {
          content: [
            {
              type: 'text',
              text: `✅ Espacio de trabajo cambiado con éxito a modo: "${args.mode}".`,
            },
          ],
        };
      }

      case 'primemind_create_funnel': {
        const title = args?.title || 'Nuevo Embudo IA';
        const rawNodes = args?.nodes || [];
        const rawConns = args?.connections || [];
        const projectId = `funnel-ai-${Date.now()}`;

        // Construir modelo del proyecto de embudo
        const nodes = rawNodes.map((item, idx) => {
          const generatedId = `fn-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`;
          return {
            id: item.id || generatedId,
            typeId: item.typeId || 'optin_page',
            category: item.category || 'page',
            title: item.title || 'Paso',
            x: item.x ?? (80 + idx * 260),
            y: item.y ?? 220,
            width: item.width || 112,
            height: item.height || 116,
            url: item.url,
            notes: item.notes,
            metrics: { visitors: 0, conversions: 0, conversionRate: 100, revenue: 0 },
          };
        });

        const connections = rawConns.map((c, cIdx) => ({
          id: `conn-ai-${cIdx}-${Date.now()}`,
          sourceId: c.sourceId,
          targetId: c.targetId,
          conversionRate: 100,
          visitors: 0,
        }));

        if (connections.length === 0 && nodes.length > 1 && !rawConns.length) {
          for (let i = 0; i < nodes.length - 1; i++) {
            connections.push({
              id: `conn-chain-${i}-${Date.now()}`,
              sourceId: nodes[i].id,
              targetId: nodes[i + 1].id,
              conversionRate: 100,
              visitors: 0,
            });
          }
        }

        const funnelData = {
          id: projectId,
          title,
          activeLayer: 'mapping',
          forecastConfig: { totalAdSpend: 0, averageCpc: 0.5, currency: '€' },
          updatedAt: new Date().toISOString(),
          nodes,
          connections,
        };

        // 1. Guardar de forma garantizada e inmediata en Supabase (Nube)
        await saveProjectToSupabase({
          id: projectId,
          name: title,
          type: 'funnel',
          funnelData,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        // 2. Si hay navegador conectado, despachar en vivo por WebSocket a 60fps
        if (connectedClients.size > 0) {
          try {
            await sendCommandToBrowser('CREATE_FUNNEL', args, 2500);
          } catch (e) {
            console.warn('[PrimeMind MCP] Advertencia al despachar por WS:', e.message);
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: `🎯 Embudo "${title}" creado y guardado con éxito en PrimeMind (Nube Supabase + Local) con ${nodes.length} pasos y ${connections.length} flujos de conexión.\nEstá disponible y sincronizado en la web (https://primemind.vercel.app).\n\nNodos:\n${nodes.map((n) => `• [${n.typeId}] ${n.title} (id: ${n.id})`).join('\n')}`,
            },
          ],
        };
      }

      case 'primemind_add_funnel_node': {
        const result = await sendCommandToBrowser('ADD_FUNNEL_NODE', args);
        return {
          content: [
            {
              type: 'text',
              text: `✅ Paso "${result.title}" (id: ${result.nodeId}) añadido al embudo en posición (${result.x}, ${result.y}).${result.connectedFrom ? ` Conectado desde ${result.connectedFrom}.` : ''}`,
            },
          ],
        };
      }

      case 'primemind_connect_funnel_nodes': {
        const result = await sendCommandToBrowser('CONNECT_FUNNEL_NODES', args);
        return {
          content: [
            {
              type: 'text',
              text: `🔗 Conexión de flujo trazada exitosamente: ${result.sourceId} ➔ ${result.targetId}.`,
            },
          ],
        };
      }

      case 'primemind_update_funnel_node': {
        const result = await sendCommandToBrowser('UPDATE_FUNNEL_NODE', args);
        return {
          content: [
            {
              type: 'text',
              text: `✏️ Paso ${result.nodeId} actualizado correctamente en PrimeMind.`,
            },
          ],
        };
      }

      case 'primemind_delete_funnel_node': {
        await sendCommandToBrowser('DELETE_FUNNEL_NODE', args);
        return {
          content: [
            {
              type: 'text',
              text: `🗑️ Paso ${args.id} eliminado del embudo.`,
            },
          ],
        };
      }

      case 'primemind_load_template': {
        const result = await sendCommandToBrowser('LOAD_FUNNEL_TEMPLATE', args);
        return {
          content: [
            {
              type: 'text',
              text: `📦 Plantilla de embudo "${result.templateId}" cargada con éxito en el lienzo de PrimeMind.`,
            },
          ],
        };
      }

      case 'primemind_create_mindmap': {
        const result = await sendCommandToBrowser('CREATE_MINDMAP', args);
        return {
          content: [
            {
              type: 'text',
              text: `🧠 Mapa mental "${result.title}" creado con éxito en PrimeMind (ID: ${result.sheetId}, Nodo raíz: ${result.rootTopicId}).`,
            },
          ],
        };
      }

      case 'primemind_add_mindmap_topic': {
        const result = await sendCommandToBrowser('ADD_MINDMAP_TOPIC', args);
        return {
          content: [
            {
              type: 'text',
              text: `🌿 Subtema "${result.title}" añadido con éxito al nodo ${result.parentId}.`,
            },
          ],
        };
      }

      case 'primemind_get_active_project': {
        const result = await sendCommandToBrowser('GET_STATE', {});
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        return {
          content: [{ type: 'text', text: `Herramienta desconocida: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error al ejecutar ${name}: ${error.message || String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// 3. Conectar el servidor MCP vía stdio
const transport = new StdioServerTransport();
await server.connect(transport);
