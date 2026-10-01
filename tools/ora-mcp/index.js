#!/usr/bin/env node
/**
 * Ora.pm MCP Server para Antigravity
 * Base URL: https://api.ora.pm
 * Auth: Bearer token (OAuth2)
 */

const readline = require('readline');
const https = require('https');
const fs = require('fs');
const path = require('path');

const CREDENTIALS_FILE = path.join(__dirname, 'credentials.json');
const ORA_API_BASE = 'api.ora.pm';

function loadCredentials() {
  if (fs.existsSync(CREDENTIALS_FILE)) {
    return JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
  }
  return {};
}

function saveCredentials(data) {
  fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(data, null, 2));
}

function oraRequest(method, reqPath, body = null) {
  const creds = loadCredentials();
  const token = creds.access_token || process.env.ORA_ACCESS_TOKEN;
  if (!token) throw new Error('No hay access_token. Usa ora_set_token primero.');

  return new Promise((resolve, reject) => {
    const options = {
      hostname: ORA_API_BASE,
      path: reqPath,
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
    const bodyStr = body ? JSON.stringify(body) : null;
    if (bodyStr) options.headers['Content-Length'] = Buffer.byteLength(bodyStr);

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { resolve({ raw: data }); }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

const tools = [
  {
    name: 'ora_set_token',
    description: 'Guarda el access_token y refresh_token de Ora de forma persistente.',
    inputSchema: {
      type: 'object',
      properties: {
        access_token: { type: 'string', description: 'Bearer access token de Ora' },
        refresh_token: { type: 'string', description: 'Refresh token (opcional)' },
      },
      required: ['access_token'],
    },
  },
  {
    name: 'ora_status',
    description: 'Verifica el estado de conexion con Ora.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'ora_get_organizations',
    description: 'Lista todas las organizaciones del usuario en Ora.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'ora_get_projects',
    description: 'Lista proyectos de una organizacion.',
    inputSchema: {
      type: 'object',
      properties: {
        organization_id: { type: 'number', description: 'ID de la organizacion' },
      },
      required: ['organization_id'],
    },
  },
  {
    name: 'ora_get_lists',
    description: 'Lista las columnas/listas de un proyecto.',
    inputSchema: {
      type: 'object',
      properties: { project_id: { type: 'number' } },
      required: ['project_id'],
    },
  },
  {
    name: 'ora_get_tasks',
    description: 'Lista tareas de una lista dentro de un proyecto.',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: { type: 'number' },
        list_id: { type: 'number' },
      },
      required: ['project_id', 'list_id'],
    },
  },
  {
    name: 'ora_create_task',
    description: 'Crea una nueva tarea en Ora.',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: { type: 'number' },
        list_id: { type: 'number' },
        name: { type: 'string', description: 'Nombre de la tarea' },
        description: { type: 'string' },
        priority: { type: 'number', description: '0=ninguna 1=baja 2=media 3=alta 4=urgente' },
      },
      required: ['project_id', 'list_id', 'name'],
    },
  },
  {
    name: 'ora_get_members',
    description: 'Lista miembros de una organizacion.',
    inputSchema: {
      type: 'object',
      properties: { organization_id: { type: 'number' } },
      required: ['organization_id'],
    },
  },
];

async function callTool(name, args) {
  if (name === 'ora_set_token') {
    saveCredentials({ access_token: args.access_token, refresh_token: args.refresh_token || null });
    return { success: true, message: 'Credenciales de Ora guardadas.' };
  }
  if (name === 'ora_status') {
    const c = loadCredentials();
    return { connected: !!c.access_token, token_preview: c.access_token ? c.access_token.substring(0, 12) + '...' : null, has_refresh_token: !!c.refresh_token };
  }
  if (name === 'ora_get_organizations') return await oraRequest('GET', '/organizations');
  if (name === 'ora_get_projects') return await oraRequest('GET', `/organizations/${args.organization_id}/projects`);
  if (name === 'ora_get_lists') return await oraRequest('GET', `/projects/${args.project_id}/lists`);
  if (name === 'ora_get_tasks') return await oraRequest('GET', `/projects/${args.project_id}/lists/${args.list_id}/tasks`);
  if (name === 'ora_get_members') return await oraRequest('GET', `/organizations/${args.organization_id}/members`);
  if (name === 'ora_create_task') {
    const body = { name: args.name };
    if (args.description) body.description = args.description;
    if (args.priority !== undefined) body.priority = args.priority;
    return await oraRequest('POST', `/projects/${args.project_id}/lists/${args.list_id}/tasks`, body);
  }
  throw new Error(`Herramienta desconocida: ${name}`);
}

const rl = readline.createInterface({ input: process.stdin });
const send = (obj) => process.stdout.write(JSON.stringify(obj) + '\n');

rl.on('line', async (line) => {
  let msg;
  try { msg = JSON.parse(line); } catch { return; }
  if (msg.method === 'initialize') {
    send({ jsonrpc: '2.0', id: msg.id, result: { protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'ora-mcp', version: '1.0.0' } } });
  } else if (msg.method === 'tools/list') {
    send({ jsonrpc: '2.0', id: msg.id, result: { tools } });
  } else if (msg.method === 'tools/call') {
    try {
      const result = await callTool(msg.params.name, msg.params.arguments || {});
      send({ jsonrpc: '2.0', id: msg.id, result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] } });
    } catch (err) {
      send({ jsonrpc: '2.0', id: msg.id, result: { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true } });
    }
  } else if (msg.id) {
    send({ jsonrpc: '2.0', id: msg.id, error: { code: -32601, message: 'Method not found' } });
  }
});
