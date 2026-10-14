---
name: mi-consultor-primeio
description: >
  Construye, despliega e itera Auditor de Caos y Rentabilidad — el captador de leads con IA de
  Primeio / MuiBici: Auditor de Caos y Rentabilidad (SaaS vs Propiedad) para dueño de taller de bicicletas / mecánico de trinchera, que entrega un informe
  de valor y convierte visitantes en leads con destino acumbamail y CTA a
  contacto. Úsala para "construye mi consultor", "despliega mi app de leads",
  "cambia [textos/colores/módulos] de mi consultor", "compara mi cuota", "audita mi mostrador".
---

# Auditor de Caos y Rentabilidad — captador de leads de Primeio / MuiBici

Tu negocio vive en `references/perfil-negocio.md`. El método vive en
`references/arquitectura-app.md`, `captura-y-rgpd.md` y `calidad-cero-humo.md`.
Lee SIEMPRE el perfil antes de tocar nada.

## Modo 1 — Construir (primera vez)

1. Lee `perfil-negocio.md` + `arquitectura-app.md`. Crea el proyecto en
   `/Users/toni/Proyectos/Auditor-PrimeIO` (Next.js App Router + Tailwind) siguiendo la arquitectura AL PIE
   DE LA LETRA: config del negocio en un archivo, bloques formulario de 4 campos, informe con
   Gráfica de Sangría SaaS a 5 años, Puntuación de Caos, Dinero oculto perdido, Plan Táctico, seguridad completa (sesión, rate limit, validación, sin PII en logs).
2. La captura del lead va a acumbamail según `captura-y-rgpd.md`.
   ⚠️ Si `rgpdListo` es false: construye con la captura en MODO PRUEBA (no persiste) y
   recuerda el bloqueante en cada sesión hasta que esté la política de privacidad.
3. El CTA final lleva a https://primeio.com/muibici (trackeado vía JotUrl).
4. Verifica TODO en local con el navegador (flujo completo + móvil) y pasa el checklist
   de `calidad-cero-humo.md` antes de enseñar nada.
5. Deploy: guía a la persona para poner SU API key en Vercel (nunca la tecleas tú),
   `vercel --prod`, verifica el flujo EN PRODUCCIÓN, y configura el dominio
   (por definir) si toca.

## Modo 2 — Iterar

Para cambios (textos, colores, módulos, preguntas, destino del lead): edita config y
componentes, verifica en local el tramo afectado, redespliega, verifica en producción.
Actualiza `perfil-negocio.md` si el cambio es de negocio (que no se desactualice).

## Reglas de esta skill

- Cero humo (Ej: calcula la fuga real de no apuntar terminales a 1€): rangos, disclaimers, datos reales u marcados EJEMPLO.
- Las claves las pone Toni, nunca la skill.
- Nada se da por terminado sin verificarlo funcionando (local Y producción).
- Pendientes actuales: Crear enlace exacto en JotUrl, elegir subdominio final — recuérdalos al empezar cada sesión.
