# Fase B — Diagnóstico de entorno

Con el `perfil.json` confirmado, comprueba SOLO lo que ese perfil necesita. Por cada
cosa que falte: qué es, para qué sirve, gratis o de pago, y pregunta **sí/no** antes de
guiar la instalación. Nada se configura sin su "sí".

## Checklist base (todos los perfiles)

| Qué | Cómo comprobar | Si falta |
|---|---|---|
| Node 18+ y npm | `node --version` | Guiar instalación desde nodejs.org (gratis) |
| Cuenta Vercel + CLI | `vercel whoami` | Cuenta gratis en vercel.com → `npm i -g vercel` → `vercel login` |
| API key de IA propia | ¿tiene cuenta Anthropic u OpenRouter? | Explicar: es SU clave, paga céntimos por uso (~0,01-0,03 €/visitante con un modelo pequeño tipo Haiku). Recomendar OpenRouter si quiere probar varios modelos, Anthropic directo si quiere lo simple. |
| Git (recomendado) | `git --version` | Opcional pero recomendado para no perder trabajo |

## Según el perfil

- `mecanica` incluye **upload** → la misma API key sirve (los modelos pequeños ya ven
  imágenes). Avisar: analizar fotos consume algo más (sigue siendo céntimos).
- `captura.destino = email` → cuenta gratuita de **Resend** (resend.com) y verificar su
  dominio o usar el de pruebas. La clave la pega él.
- `captura.destino = sheets` → Google Cloud service account (guiar paso a paso; es
  gratis pero tiene más pasos — ofrecer empezar por email y migrar luego).
- `captura.destino = webhook` → pedir la URL del webhook de su CRM y probarla con un
  POST de prueba CON SU PERMISO (dato ficticio marcado TEST).
- `cta.tipo = calendario` y no tiene calendario → recomendar Calendly gratis; anotar
  como pendiente, no bloquea la construcción.
- `hosting.donde = subdominio` → explicar el CNAME en su DNS (se hace al final, en el
  primer deploy; no bloquea).

## Reglas de claves (innegociable)

1. Las claves las pega LA PERSONA: en `.env.local` en local, y en Settings →
   Environment Variables en Vercel. Tú le dices exactamente el nombre de la variable y
   dónde, y verificas después con una llamada de prueba.
2. `.env.local` SIEMPRE en `.gitignore`. Verifícalo antes del primer commit.
3. Si una clave aparece pegada en el chat, recomiéndale rotarla cuando termine.

## Salida de la fase

Tabla: ✅ listo / 🔧 instalado ahora / ⏳ pendiente (no bloqueante) / ⛔ bloqueante.
Añade los pendientes al perfil (`perfil.json` → `"pendientes": []`) para que la skill
hija los recuerde en cada uso.
