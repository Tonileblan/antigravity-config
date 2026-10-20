---
name: primemind
description: Integración de PrimeMind vía Model Context Protocol (MCP) y Live Bridge en tiempo real para diseño autónomo de embudos de venta (Funnels) y mapas mentales jerárquicos (Mindmaps estilo XMind).
---

# 🧠 PrimeMind (Mindmaps & Sales Funnels AI Bridge)

PrimeMind es la suite de diseño visual y estructuración conceptual para mapas mentales de alta fidelidad y arquitecturas de embudos de venta (*Sales Funnels*).

Mediante el servidor MCP **`primemind`** y su puente WebSocket bidireccional en tiempo real (`ws://127.0.0.1:3055`), cualquier agente IA puede interactuar en vivo con el lienzo del usuario: crear diagramas, añadir pasos, conectar flujos, inspeccionar nodos y cargar plantillas probadas mientras el usuario ve los cambios dibujarse en su pantalla.

---

## 🛠️ Herramientas Disponibles vía MCP (`primemind`)

### 1. Control del Entorno y Estado
- **`primemind_status`**: Comprueba si PrimeMind está abierto en el navegador, cuántas pestañas están conectadas y qué proyecto/modo está activo.
- **`primemind_open`**: Abre PrimeMind en el navegador por defecto (`http://localhost:5173` o `https://primemind.vercel.app`) y vincula la sesión.
- **`primemind_set_mode`**: Alterna el espacio de trabajo entre `'funnel'` (Embudos de Venta) y `'mindmap'` (Mapa Mental).
- **`primemind_get_active_project`**: Obtiene el JSON completo del diagrama actual para que la IA pueda auditarlo, analizarlo y razonar sobre él.

### 2. Generación y Edición de Embudos de Venta (Funnels)
- **`primemind_create_funnel`**: Genera un embudo completo desde cero a partir de una lista de pasos (`nodes`) y conexiones (`connections`).
  - *Tipos autorizados de pasos:*
    - **Tráfico:** `meta_ads`, `google_ads`, `youtube_ads`, `tiktok_ads`, `email_campaign`, `organic_social`, `affiliate_traffic`.
    - **Páginas:** `optin_page`, `sales_page`, `vsl_page`, `webinar_room`, `checkout_page`, `thank_you_page`, `tripwire_page`, `upsell_page`.
    - **Acciones / Conversiones:** `lead_captured`, `purchase_completed`, `call_booked`, `call_closed`.
- **`primemind_add_funnel_node`**: Añade un paso individual en coordenadas $(x, y)$ con título, notas y URL, con opción de autoconectarlo desde un paso anterior.
- **`primemind_connect_funnel_nodes`**: Traza una flecha direccional de flujo entre `sourceId` y `targetId`.
- **`primemind_update_funnel_node`**: Modifica título, URL, notas de copy o dimensiones de un paso.
- **`primemind_delete_funnel_node`**: Elimina un paso y limpia sus conexiones.
- **`primemind_load_template`**: Carga una arquitectura probada (`webinar_canonical`, `lander_vsl_sequence`, `saas_growth_onboarding`, `high_ticket_vsl_booking`, `lead_magnet_tripwire`, `ecommerce_flash_upsell`, `saas_freemium_plg`).

### 3. Generación y Edición de Mapas Mentales (Mindmaps)
- **`primemind_create_mindmap`**: Genera un mapa mental jerárquico a partir de un tema central y un árbol anidado de subtemas y colores.
- **`primemind_add_mindmap_topic`**: Añade una nueva idea o rama hija a cualquier nodo existente.

---

## 💡 Flujo de Trabajo Recomendado para el Agente

1. **Si el usuario pide crear un embudo:**
   - Analiza el objetivo comercial (captación de leads, venta directa e-commerce, llamada high-ticket, webinar).
   - Estructura los pasos clave: Fuente de tráfico ➔ Página de captura/VSL ➔ Checkout ➔ Página de gracias + Secuencia de emails.
   - Invoca `primemind_create_funnel` pasando la lista de nodos y conexiones. PrimeMind calculará la disposición visual y dibujará el embudo en pantalla en tiempo real con sus ilustraciones vectoriales.

2. **Si el usuario pide estructurar ideas o planificar un proyecto:**
   - Descompón el tema en 3-5 áreas principales y 2-4 subtemas por área.
   - Invoca `primemind_create_mindmap` con estructura `mindmap-radial` o `logic-right`.
