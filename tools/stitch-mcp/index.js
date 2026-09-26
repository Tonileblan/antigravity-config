#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { execFile, exec } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const execPromise = promisify(exec);
const execFilePromise = promisify(execFile);

const isWindows = process.platform === "win32";
const isMac = process.platform === "darwin";

const server = new Server(
  {
    name: "stitch-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const TOOLS = [
  {
    name: "stitch_status",
    description: "Checks if Google Stitch (stitch.withgoogle.com) is open in the active browser, returning window and tab status.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "stitch_open",
    description: "Opens https://stitch.withgoogle.com in the default browser and brings it to foreground.",
    inputSchema: {
      type: "object",
      properties: {
        browser: {
          type: "string",
          description: "Optional browser name (e.g. 'chrome', 'brave', 'edge', 'safari').",
        },
      },
    },
  },
  {
    name: "stitch_generate_prompt",
    description: "Generates a structured, high-fidelity UI design prompt tailored for Google Stitch (Gemini AI UI engine) and copies it to clipboard.",
    inputSchema: {
      type: "object",
      properties: {
        appName: {
          type: "string",
          description: "Name of the application/project (e.g. 'Control 61')",
        },
        appType: {
          type: "string",
          description: "Type of app (e.g. 'Security & SOC SaaS', 'E-commerce')",
        },
        theme: {
          type: "string",
          description: "Visual aesthetic and color theme",
        },
        screens: {
          type: "array",
          items: { type: "string" },
          description: "List of screens/pages to describe",
        },
        copyToClipboard: {
          type: "boolean",
          description: "If true, copies to OS clipboard. Defaults to true.",
        },
      },
      required: ["appName", "screens"],
    },
  },
  {
    name: "stitch_capture_canvas",
    description: "Takes a screenshot of the Stitch design canvas or active window.",
    inputSchema: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description: "Optional destination file path (PNG).",
        },
      },
    },
  },
  {
    name: "stitch_import_component",
    description: "Imports exported HTML/React/Tailwind component code from Stitch and saves it to a designated file.",
    inputSchema: {
      type: "object",
      properties: {
        targetFile: {
          type: "string",
          description: "Destination file path relative to workspace or absolute.",
        },
        codeContent: {
          type: "string",
          description: "The exported JSX/HTML/React code from Stitch.",
        },
        description: {
          type: "string",
          description: "Brief description of the component.",
        },
      },
      required: ["targetFile", "codeContent"],
    },
  },
  {
    name: "stitch_list_templates",
    description: "Lists built-in UI design prompt templates for Google Stitch.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

async function copyToOsClipboard(text) {
  if (isMac) {
    const proc = exec("pbcopy");
    proc.stdin.write(text);
    proc.stdin.end();
  } else if (isWindows) {
    const proc = exec("clip");
    proc.stdin.write(text);
    proc.stdin.end();
  } else {
    // Linux xclip fallback
    try {
      const proc = exec("xclip -selection clipboard");
      proc.stdin.write(text);
      proc.stdin.end();
    } catch {}
  }
}

async function checkBrowserStatus() {
  if (isMac) {
    const script = `
      tell application "System Events"
        set activeApps to name of every process whose background only is false
        return activeApps
      end tell
    `;
    try {
      const { stdout } = await execFilePromise("osascript", ["-e", script]);
      return { platform: "macOS", activeApps: stdout.trim().split(", ") };
    } catch (e) {
      return { platform: "macOS", error: e.message };
    }
  } else if (isWindows) {
    try {
      const { stdout } = await execPromise(
        `powershell -Command "Get-Process | Where-Object { $_.MainWindowTitle -ne '' } | Select-Object -Property ProcessName, MainWindowTitle | ConvertTo-Json"`
      );
      return { platform: "Windows", openWindows: JSON.parse(stdout || "[]") };
    } catch (e) {
      return { platform: "Windows", error: e.message };
    }
  }
  return { platform: process.platform, status: "active" };
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "stitch_status": {
        const status = await checkBrowserStatus();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(status, null, 2),
            },
          ],
        };
      }

      case "stitch_open": {
        const url = "https://stitch.withgoogle.com";
        if (isMac) {
          await execPromise(`open "${url}"`);
        } else if (isWindows) {
          await execPromise(`start "" "${url}"`);
        } else {
          await execPromise(`xdg-open "${url}"`);
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: true, message: `Opened ${url}` },
                null,
                2
              ),
            },
          ],
        };
      }

      case "stitch_generate_prompt": {
        const { appName, appType, theme, screens, copyToClipboard } = args;

        const formattedScreens = screens
          .map((s, i) => `   ${i + 1}. **${s}**: Detailed, interactive layout with production-grade components, realistic data, high typography hierarchy, and state badges.`)
          .join("\n");

        const prompt = `# PROJECT: ${appName}
## AESTHETIC & THEME:
- App Type: ${appType || "Modern Web Application & Operations Suite"}
- Visual System: ${theme || "Dark Mode, High-Contrast Badges, Crisp Typography"}
- Design Principles: Bento grid modular cards, micro-interactions, responsive flex/grid layouts.

## SCREENS TO GENERATE:
${formattedScreens}

## ASSETS & COMPLIANCE:
- Official accreditation badges and status indicators
- 24/7 Live telemetry ticker bar
- Dark glassmorphic navigation header
- Complete footer with legal certifications and emergency contact.`;

        if (copyToClipboard !== false) {
          await copyToOsClipboard(prompt);
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  copiedToClipboard: copyToClipboard !== false,
                  promptLength: prompt.length,
                  prompt,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "stitch_capture_canvas": {
        const targetPath =
          args?.filePath ||
          path.join(os.tmpdir(), `stitch_canvas_${Date.now()}.png`);
        await fs.mkdir(path.dirname(targetPath), { recursive: true });

        if (isMac) {
          await execPromise(`/usr/sbin/screencapture -x "${targetPath}"`);
        } else if (isWindows) {
          const psScript = `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$Screen = [System.Windows.Forms.Screen]::PrimaryScreen
$Bitmap = New-Object System.Drawing.Bitmap $Screen.Bounds.Width, $Screen.Bounds.Height
$Graphics = [System.Drawing.Graphics]::FromImage($Bitmap)
$Graphics.CopyFromScreen($Screen.Bounds.X, $Screen.Bounds.Y, 0, 0, $Bitmap.Size)
$Bitmap.Save("${targetPath.replace(/\\/g, "\\\\")}")
$Graphics.Dispose()
$Bitmap.Dispose()
          `;
          await execPromise(`powershell -Command "${psScript.replace(/\n/g, " ")}"`);
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  filePath: targetPath,
                  message: `Canvas screenshot saved to ${targetPath}`,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "stitch_import_component": {
        const { targetFile, codeContent, description } = args;
        const resolvedPath = path.isAbsolute(targetFile)
          ? targetFile
          : path.resolve(process.cwd(), targetFile);

        await fs.mkdir(path.dirname(resolvedPath), { recursive: true });
        await fs.writeFile(resolvedPath, codeContent, "utf8");

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  savedPath: resolvedPath,
                  description: description || "Component imported from Stitch",
                  bytesWritten: Buffer.byteLength(codeContent),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "stitch_list_templates": {
        const templates = [
          {
            id: "security-soc",
            name: "Security & SOC Telemetry Hub",
            description: "Industrial dark mode with real-time sensor radar, 24/7 emergency dispatch, and Grado 3 matrix.",
          },
          {
            id: "executive-c-level",
            name: "Platinum Executive Corporate Defense",
            description: "Clean titanium theme with compliance SLA tables, national infrastructure map, and VIP concierge.",
          },
          {
            id: "saas-analytics",
            name: "AI Vision & Video Analytics Studio",
            description: "Modern Bento grid with live RTSP stream bounding boxes, confidence scores, and multi-camera switcher.",
          },
        ];

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: true, templates }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Error executing ${name}: ${error.message}`,
        },
      ],
    };
  }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

run().catch((err) => {
  console.error("Fatal error running Stitch MCP server:", err);
  process.exit(1);
});
