# 🚀 Directriz Maestra #6: Flujo Integral de Conversión y Ventas con Antigravity
## De Desconocido a Cliente (End-to-End Growth Engine)

> **Ubicación Google Drive:** `Google Drive > Mi unidad > 1-Proyectos > Apps-Desarrollo > Directrices > 06_Flujo_Conversion_EndToEnd.md`  
> **Estado:** Activo  
> **Responsable Metodológico:** Toni (Antonio Javier García García)

---

## 🗺️ 1. Diagrama de Flujo del Embudo

```mermaid
flowchart TD
    subgraph FASE_1["1. Atracción y Tráfico (No nos conocen)"]
        A1[Contenido / Redes Sociales / Ads] --> A2[JotUrl: Links Inteligentes con Retargeting & UTMs]
        MOA[Market Opportunity Analyzer: Puntos de Dolor & Nicho] -.-> A1
    end

    subgraph FASE_2["2. Captación con Valor Real (Lead Magnet con IA)"]
        A2 --> B1[Landing Page Diseñada con 'frontend-design' & 'Stitch']
        B1 --> B2[Consultor / Calculadora IA: 'forja-consultor']
        B2 --> B3[Diagnóstico / Simulación de Ahorro en Tiempo Real]
    end

    subgraph FASE_3["3. Captura y Notificación Instantánea"]
        B3 --> C1[(Supabase: Registro de Lead & Respuestas)]
        C1 --> C2[Telegram MCP: Notificación Inmediata al Equipo]
        C1 --> C3[Acumbamail: Alta en Lista & Disparo de Secuencia]
    end

    subgraph FASE_4["4. Nutrición y Conversación de Venta"]
        C3 --> D1[Email Marketing: Casos de Éxito & Demostración]
        D1 --> D2[WhatsApp MCP: Contacto Directo / Cierre 1 a 1]
        NLM[NotebookLM / Notebook MCP: Dossier & Manejo de Objeciones] -.-> D2
    end

    subgraph FASE_5["5. Cierre, Cobro y Onboarding (Compra)"]
        D2 --> E1[Pasarela de Pago / Checkout]
        E1 --> E2[(Supabase: Activación de Suscripción / RLS)]
        E2 --> E3[Process Street: Checklist Automatizado de Onboarding]
    end
```

---

## 🛠️ 2. Desglose Operativo por Fases y Herramientas

### 🎯 Fase 1: Atracción y Alcance (*"No nos conocen"*)
- **`market-opportunity-analyzer`**: Identifica nichos con alta disposición de pago y redacta ganchos basados en problemas reales y desatendidos.
- **`joturl`**: Enruta el tráfico mediante enlaces cortos con píxeles de retargeting (Meta, Google, LinkedIn) y analítica de clics para alimentar audiencias personalizadas.

---

### 💡 Fase 2: Captación con Valor Inmediato (*"Descubren la solución"*)
- **`frontend-design`**: Aplica un diseño visual sobrio, con tipografía cuidada y sin clichés de IA para transmitir confianza inmediata.
- **`stitch` / `pencil`**: Prototipado y maquetación ágil de la interfaz visual.
- **`forja-consultor` / `consultor-bikeflow`**: Ofrece un simulador/calculadora inteligente que entrega valor real (un presupuesto orientativo, un diagnóstico de madurez o un cálculo de ahorro frente a la competencia) a cambio de los datos de contacto.

---

### ⚡ Fase 3: Persistencia y Alertas Instantáneas (*"Captura del Lead"*)
- **`supabase`**: Almacena el nuevo lead, su puntuación de cualificación y las métricas calculadas en el esquema de base de datos protegido con RLS.
- **`telegram` (MCP Bot)**: Envía una alerta en tiempo real a tu canal privado para saber quién acaba de solicitar un diagnóstico.
- **`acumbamail`**: Sincroniza el lead con la lista de correo correspondiente y arranca el embudo de bienvenida.

---

### 🤝 Fase 4: Nutrición y Conversación (*"Decisión de Compra"*)
- **`acumbamail`**: Secuencia de correos automatizados con casos prácticos, desglose de la oferta y testimonios.
- **`whatsapp` (MCP)**: Canal directo para iniciar contacto consultivo personalizado por mensajería instantánea.
- **`notebooklm` / `notebook-mcp`**: Base de conocimiento sobre tus propuestas técnicas, FAQs y catálogo para responder con precisión y resolver objeciones al instante.

---

### 🚀 Fase 5: Compra y Entrega (*"Nos compran"*)
- **`supabase`**: Actualiza el estado del usuario a cliente activo y activa sus credenciales y permisos.
- **`vercel`**: Despliegue de la aplicación web y panel de usuario con alta disponibilidad.
- **`process-street`**: Dispara la ejecución del workflow de bienvenida, configuración técnica y seguimiento a 30 días para garantizar la retención.
