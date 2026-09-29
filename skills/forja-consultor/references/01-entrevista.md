# Fase A — La entrevista (9 bloques)

Un bloque cada vez. Lenguaje claro, ejemplos del SU sector, y en cada decisión ofrece
2-3 opciones con una recomendación. Si una respuesta ya salió antes en la conversación,
no la repitas: confírmala.

## Bloque 1 — El modo

> "¿Esto es para captar clientes para TU negocio, o eres agencia/freelance y quieres
> crear estas herramientas para TUS clientes?"

- **`propio`** → el resto de la entrevista habla de su negocio.
- **`agencia`** → la entrevista habla de su NEGOCIO DE AGENCIA (su marca, su calendario
  para el CTA de venta) y la skill hija incluirá el playbook de `modo-agencia.md`:
  crear una herramienta POR CLIENTE, primero como demo de venta y luego en producción.
  Aclárale: la entrevista define su fábrica; los datos de cada cliente se dan al usarla.

## Bloque 2 — El negocio

- ¿Qué vendes exactamente y a quién? (una frase)
- ¿Tienes web? URL. (De ahí sacaremos colores, logo y tono en el diagnóstico.)
- ¿Qué pasa hoy con los visitantes de tu web? ¿Por qué crees que no te dejan sus datos
  o no te compran?
- ¿Qué es para ti un lead que vale oro? (ej: "que agende llamada", "que pida presupuesto")

## Bloque 3 — El regalo de valor (el corazón)

Explícale el principio: **el regalo resuelve tan bien el primer 20% del problema de su
cliente que el 80% restante es su servicio.** Tiene que ser algo que el visitante quiera
AHORA y que puedas entregar al instante con IA.

Propón 2-3 conceptos ADAPTADOS a lo que contó en el Bloque 2, con ejemplos del patrón:
- Tasación/valoración orientativa (joyería, inmobiliaria, coches, arte…)
- Presupuesto/coste estimado (reformas, dentistas, abogados, seguros…)
- Diagnóstico con puntuación y plan (clínicas, consultores, gimnasios, marketing…)
- Simulación "cómo quedaría" (peluquería, estética, decoración…)
- Comparativa "lo que pagas hoy vs lo que podrías" (energía, gestorías, telecos…)

Rúbrica para elegir (puntúa mentalmente 1-5): ¿lo quiere YA el cliente final? ¿conecta
directo con el servicio? ¿se puede estimar honestamente con los datos que puede dar? ¿el
resultado da conversación de venta?

## Bloque 4 — La mecánica (cómo lo usa el visitante)

En cristiano, sin jerga. Se pueden combinar:
- **Chat entrevistador**: un asistente le hace 5-7 preguntas (bueno para diagnósticos).
- **Formulario/calculadora**: campos concretos (peso, m², edad…) — rápido y directo.
- **Subir fotos**: la IA mira las fotos (tasaciones, presupuestos de reformas, estética).
- **Quiz**: preguntas cerradas con puntuación (tests de madurez/preparación).

Recomienda la combinación mínima que entregue el valor del Bloque 3. Menos pasos = más
leads.

## Bloque 5 — El informe (lo que recibe)

¿Qué módulos tendrá el resultado? Elegir 3-5:
- Estimación con **rango** (nunca cifra cerrada) · métricas destacadas · gráfica de
  contexto (histórico/comparativa, con datos reales o marcados EJEMPLO) · puntuación
  0-100 · recomendaciones/quick wins · antes/después · párrafo "siguiente paso".

Regla cero humo: rangos conservadores + disclaimer visible. Pregúntale qué cifras de
referencia REALES de su sector puede aportar él (precios, baremos) para hornearlas.

## Bloque 6 — La captura del lead

- ¿Qué pides para desbloquear el informe? (Recomendado: nombre + email obligatorios,
  teléfono opcional "para enviarte el detalle por WhatsApp".)
- ¿A dónde va el lead? Elegir UNO para la v1:
  - **Email de aviso** a su buzón (lo más simple; via Resend, gratis para empezar)
  - **Google Sheets** (lista viva)
  - **Webhook a su CRM** (si ya usa uno y sabe su URL de webhook)
- ⚠️ RGPD: si la captura es real, necesita política de privacidad publicada y checkbox
  de consentimiento. ¿La tiene? Si no, anótalo como bloqueante del lanzamiento (la app
  se puede construir y probar igual). Detalle en `captura-y-rgpd.md`.

## Bloque 7 — El CTA final (a dónde mandas al visitante)

Después del informe, ¿qué quieres que haga?
- Agendar en su **calendario real** (Calendly/GHL/otro — pide la URL)
- Escribir por **WhatsApp** (pide el número y el mensaje precargado)
- Llamar / ir a su **página de contacto** (pide la URL)

## Bloque 8 — Marca y voz

- Colores y logo: ¿los sacamos de tu web (recomendado) o me los das tú?
- Tono: ¿cercano, premium, técnico, divertido? Una frase que suene a ti.
- Nombre del asistente/herramienta (ej: "Aura", "Calculadora X", "Tu diagnóstico Y").

## Bloque 9 — Dónde vive y datos técnicos

- ¿Subdominio propio (ej. `tasador.tunegocio.com` — recomendado), ruta nueva, o de
  momento la URL de Vercel?
- ¿Tienes cuenta de Vercel? ¿API key de IA propia (Anthropic u OpenRouter)? (Si no, se
  resuelve en la Fase B.)
- Nombre de tu skill: `/mi-consultor` o con su marca (ej. `/consultor-acme`).

## Cierre — perfil.json

Resume TODO en una tabla, pide confirmación, y guarda `perfil.json` en la carpeta de
trabajo con este esquema:

```json
{
  "modo": "propio | agencia",
  "negocio": { "nombre": "", "web": "", "queVende": "", "clienteIdeal": "", "dolorCaptacion": "" },
  "regalo": { "concepto": "", "porQueFunciona": "" },
  "mecanica": ["form", "upload", "chat", "quiz"],
  "informe": { "modulos": [], "referenciasReales": "" },
  "captura": { "campos": [], "destino": "email | sheets | webhook", "rgpdListo": false },
  "cta": { "tipo": "calendario | whatsapp | contacto", "url": "" },
  "marca": { "fuente": "web | manual", "colores": {}, "tono": "", "nombreAsistente": "" },
  "hosting": { "donde": "subdominio | ruta | vercel", "dominio": "" },
  "skill": { "nombre": "" }
}
```
