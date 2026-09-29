# Plantilla de la skill hija

Rellena `{{...}}` con el perfil. Lo que está entre `<!-- si ... -->` solo va si aplica.

---

```markdown
---
name: mi-consultor-{{slug}}
description: >
  Construye, despliega e itera {{nombreHerramienta}} — el captador de leads con IA de
  {{negocio.nombre}}: {{regalo.concepto}} para {{clienteIdeal}}, que entrega un informe
  de valor y convierte visitantes en leads con destino {{captura.destino}} y CTA a
  {{cta.tipo}}. Úsala para "construye mi consultor", "despliega mi app de leads",
  "cambia [textos/colores/módulos] de mi consultor", {{disparadoresDelSector}}
  <!-- si agencia --> o para "nueva demo para [cliente]" (modo agencia). <!-- /si -->
---

# {{nombreHerramienta}} — captador de leads de {{negocio.nombre}}

Tu negocio vive en `references/perfil-negocio.md`. El método vive en
`references/arquitectura-app.md`, `captura-y-rgpd.md` y `calidad-cero-humo.md`.
Lee SIEMPRE el perfil antes de tocar nada.

## Modo 1 — Construir (primera vez)

1. Lee `perfil-negocio.md` + `arquitectura-app.md`. Crea el proyecto en
   `{{rutaProyecto}}` (Next.js App Router + Tailwind) siguiendo la arquitectura AL PIE
   DE LA LETRA: config del negocio en un archivo, bloques {{mecanica}}, informe con
   {{modulos}}, seguridad completa (sesión, rate limit, validación, sin PII en logs).
2. La captura del lead va a {{captura.destino}} según `captura-y-rgpd.md`.
   ⚠️ Si `rgpdListo` es false: construye con la captura en MODO PRUEBA (no persiste) y
   recuerda el bloqueante en cada sesión hasta que esté la política de privacidad.
3. El CTA final lleva a {{cta.url}}.
4. Verifica TODO en local con el navegador (flujo completo + móvil) y pasa el checklist
   de `calidad-cero-humo.md` antes de enseñar nada.
5. Deploy: guía a la persona para poner SU API key en Vercel (nunca la tecleas tú),
   `vercel --prod`, verifica el flujo EN PRODUCCIÓN, y configura el dominio
   {{hosting.dominio}} si toca.

## Modo 2 — Iterar

Para cambios (textos, colores, módulos, preguntas, destino del lead): edita config y
componentes, verifica en local el tramo afectado, redespliega, verifica en producción.
Actualiza `perfil-negocio.md` si el cambio es de negocio (que no se desactualice).

<!-- si agencia -->
## Modo 3 — Nueva demo para un cliente (agencia)

"Nueva demo para [empresa]" → sigue `references/modo-agencia.md`: mini-entrevista del
cliente (su web, su servicio, su punto de conversión), clona su marca, construye la
variante DEMO (captura simulada, caducidad, mockup "así se vería en tu web", doble CTA)
y prepara el email de presentación EN BORRADOR. Al cerrar la venta: pasar de demo a
producción (captura real + RGPD del cliente + su dominio).
<!-- /si -->

## Reglas de esta skill

- Cero humo ({{ejemploDelSector}}): rangos, disclaimers, datos reales u marcados EJEMPLO.
- Las claves las pone {{nombrePersona}}, nunca la skill.
- Nada se da por terminado sin verificarlo funcionando (local Y producción).
- Pendientes actuales: {{pendientes}} — recuérdalos al empezar cada sesión.
```
