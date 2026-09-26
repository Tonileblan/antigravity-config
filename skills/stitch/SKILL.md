---
name: stitch
description: Integración de Google Stitch (stitch.withgoogle.com / Project Nemo) para generación de interfaces web y móviles con IA Gemini, protocolo MCP, prompts estructurados y sincronización de componentes.
---

# 🧵 Google Stitch (Design with AI) Integration

Google Stitch es la plataforma web de Google Labs / DeepMind para la ideación, diseño y prototipado visual de interfaces web y móviles mediante modelos Gemini.

---

## 🛠️ Herramientas Disponibles vía MCP (`stitch-mcp`)

1. **`stitch_status`**:
   - Inspecciona si Stitch (`stitch.withgoogle.com`) está abierto en Chrome, Brave, Safari o Edge, reportando pestañas y URLs activas.

2. **`stitch_open`**:
   - Abre `https://stitch.withgoogle.com` en el navegador predeterminado y enfoca la ventana.

3. **`stitch_generate_prompt`**:
   - Compila especificaciones de diseño estructuradas (Bento Grids, Arquetipos de Marca, Telemetría, Vistas Web App) y las copia al portapapeles del sistema operativo (`pbcopy` en macOS, `clip` en Windows).

4. **`stitch_capture_canvas`**:
   - Captura una imagen de alta resolución del lienzo generado en Stitch y la guarda en la carpeta de artefactos.

5. **`stitch_import_component`**:
   - Importa código JSX/HTML/React o estilos generados en Stitch y los ubica directamente en las rutas de componentes de la aplicación.

6. **`stitch_list_templates`**:
   - Catálogo de plantillas maestras prediseñadas para aplicaciones de Seguridad/SOC, Fintech, SaaS y Portales Corporativos.
