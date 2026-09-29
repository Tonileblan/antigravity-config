# Modo agencia — crear estas herramientas para TUS clientes

Solo para perfiles `modo: agencia`. Dos variantes de la misma app: **DEMO** (para vender
el proyecto) y **PRODUCCIÓN** (cuando el cliente compra).

## El movimiento comercial

No vendas "una web con IA". Envía al prospecto una **demo funcional con SU marca** que
haga algo que su web hoy no hace: entregar valor a su cliente final antes de pedirle
nada. Que la pruebe como si fuera su propio cliente. La demo no vende el proyecto —
**vende la reunión**.

## Variante DEMO (estanca — así se enseña sin riesgo)

Misma app, con estos cambios sobre la arquitectura base:

1. **Marca del prospecto**: extrae de su web colores, logo, tipografías y tono (pídele
   la URL de su página de servicio, no solo la home). El tema de la demo espeja el
   claro/oscuro de su web para que el logo encaje.
2. **Marco narrativo**: barra superior discreta "Demo preparada por {{tu agencia}} para
   [Empresa]" · intro personalizada ("[Nombre], esto es lo que tus clientes vivirían en
   tu web") · al final, panel "Esto es lo que acaba de pasar" (lead capturado + informe
   entregado + disponible 24/7) con TU CTA de venta → tu calendario.
3. **Captura SIMULADA**: el gate se ve idéntico pero NO persiste nada; al enviar muestra
   "✓ Aquí este lead entraría en tu CRM" con los datos en pantalla. Cero RGPD que
   gestionar en demos. Nada se guarda.
4. **Doble CTA**: el del CLIENTE FINAL (botón que redirige al punto de conversión real
   del prospecto — su contacto/formulario — o un calendario simulado con "✓ Cita
   confirmada, así de fácil lo tendría tu cliente") + el TUYO de venta en el panel final.
5. **Caducidad** (~30 días, pantalla "esta demo ha caducado" con tu CTA) + `noindex`.
6. **Mockup**: captura de pantalla de su web real con la burbuja del widget superpuesta,
   bajo el título "Así se vería en tu web". Es lo que hace decir "lo quiero".

## Flujo por cliente (mini-entrevista → demo → email)

1. Pide: URL del prospecto (página del servicio), qué vende, nombre del contacto si lo
   hay, y su punto de conversión actual (contacto/formulario/teléfono).
2. Investiga los dolores del NICHO en reseñas y foros reales (nunca inventados) y elige
   el regalo de valor que ataque el dolor nº1, embudando a su servicio.
3. Construye la demo (variante estanca), verifícala E2E y despliégala a una URL propia
   por cliente.
4. Prepara el **email de presentación EN BORRADOR** (dolor detectado → qué hace la demo
   → pruébala → agenda reunión). Se envía A MANO, siempre revisado — nunca automático.

## Al cerrar la venta → PRODUCCIÓN

Quitar marco de demo, caducidad y simulaciones · activar captura REAL (destino del
cliente + su política de privacidad — RGPD del cliente, no tuyo) · su dominio · abrir
`robots` · entregar con el checklist cero-humo firmado por el cliente (las cifras de
referencia las valida ÉL).
