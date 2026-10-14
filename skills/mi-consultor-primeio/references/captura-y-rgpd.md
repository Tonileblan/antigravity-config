# Captura del lead + RGPD (método — cumplir siempre)

## El gate (la puerta del informe)

- Momento: DESPUÉS de recorrer los bloques y ANTES de ver el informe ("tu informe está
  listo — ¿dónde te lo enviamos?"). El visitante ya recibió valor: es un intercambio justo.
- Campos: los del perfil. Mínimo viable: nombre + email. Teléfono opcional con incentivo
  honesto ("para enviarte el detalle por WhatsApp").
- **Consentimiento**: checkbox NO premarcado + frase clara de para qué se usan los datos
  + enlace a la política de privacidad. Sin marcar → no se envía.
- Honeypot oculto contra bots.

## RGPD — mínimos innegociables (España/UE)

1. **Política de privacidad publicada** (quién trata los datos, para qué, base legal,
   cuánto tiempo, cómo ejercer derechos). Si no la tiene → la app funciona en MODO
   PRUEBA (no persiste nada) hasta que exista. Recomiéndale resolverla con su gestor o
   una herramienta legal — esta skill NO es asesoría legal.
2. Recoger SOLO lo necesario. Nada de pedir DNI/dirección "por si acaso".
3. El visitante puede usar datos falsos: no verificamos identidad, no es nuestro problema.
4. Cero PII en logs del servidor. Los datos de prueba se borran tras verificar.

## Destinos del lead (implementar el del perfil)

`/api/lead` (con toda la seguridad de la arquitectura) hace UNA de estas:

- **email** (recomendado para empezar): envía aviso via Resend al buzón del dueño con
  nombre, contacto, resumen de respuestas y el informe. `RESEND_API_KEY` en env.
- **sheets**: append a una hoja (service account de Google; credenciales en env).
- **webhook**: POST JSON al webhook de su CRM. Probar con dato marcado TEST y borrarlo.

Regla de resiliencia: si el destino falla, el visitante VE SU INFORME IGUAL (la captura
se registra como fallida en un log sin PII para recuperarla a mano). Nunca un 500 al
visitante por culpa del CRM.

## Después de capturar

En la pantalla del informe, confirmación sutil ("te lo hemos enviado también a tu
email") si aplica, y el CTA final SIEMPRE visible al terminar (calendario/WhatsApp/
contacto del perfil).
