---
name: pencil-dev
description: Integración de Pencil (pen.dev) para diseño visual mediante IA, manipulación de archivos .pen, protocolo MCP e importación/exportación de UI a código React/Tailwind.
---

# 🎨 Pencil (pen.dev) - AI Design Canvas & MCP Integration

Pencil (**pen.dev**) es un lienzo de diseño visual "Design-as-Code" que permite a los agentes de IA (Antigravity, Claude, Gemini) leer, crear y editar diseños de interfaz guardados en formato `.pen`.

---

## 🛠️ 1. Comandos Principales de la CLI

El CLI oficial `@pen.dev/cli` está disponible vía npm (`npm install -g @pencil-dev/cli` o `pen` / `pencil`).

### 🚀 Crear un nuevo diseño desde cero
```bash
pen --out diseño.pen --prompt "Crea un dashboard financiero con Dark Glassmorphism, gráficos y tarjetas de balance" --agent gemini
```

### ✏️ Modificar un diseño existente
```bash
pen --in diseño.pen --out diseño_v2.pen --prompt "Añade una barra de navegación superior con avatar y buscador" --agent gemini
```

### 🖼️ Exportar el diseño a imagen o PDF
```bash
pen --in diseño.pen --out diseño.pen --export ./preview.png --export-type png --export-scale 2
```

### ⚡ Modo Interactivo MCP (Live Canvas Shell)
```bash
pen interactive -i diseño.pen -o diseño_actualizado.pen
```

---

## 🔌 2. Herramientas del Servidor MCP de Pencil

Cuando se ejecuta en modo interactivo o conectado a la app de escritorio, expone las siguientes herramientas:

1. **`browser`**:
   - `load-page`: Carga una URL real en el navegador integrado.
   - `import-to-canvas`: Convierte cualquier web real o componente en capas editables de Pencil en el canvas.
   - `return-screenshot`: Toma una captura del componente o página para inspección visual.
   - `return-element`: Extrae el DOM y estilos calculados de un elemento específico.

2. **`get_app_state`**:
   - Devuelve la selección actual, nodos del canvas y estado de la aplicación.

3. **`get_style`**:
   - Carga arquetipos de diseño, paletas de colores y estilos tipográficos.

4. **`execute`**:
   - Ejecuta código JavaScript para insertar, mover, modificar o eliminar nodos en el árbol del documento `.pen`.

5. **`read_skill`**:
   - Lee la especificación del esquema `.pen` y guías de arquitectura de UI.

---

## 📁 3. El Formato `.pen` (Design as Code)
Los archivos `.pen` son estructuras JSON versionables por Git que definen:
- **Frames & Layouts:** `layout: "vertical" | "horizontal" | "grid"`.
- **Componentes Reutilizables:** `reusable: true`, `type: "ref"`.
- **Tokens de Color & Tipografía:** Valores compatibles con Tailwind CSS y Clean Architecture.
