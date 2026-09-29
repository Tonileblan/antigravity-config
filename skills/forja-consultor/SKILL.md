---
name: forja-consultor
description: >
  META-SKILL que crea TU propia fábrica de consultores/calculadoras con IA para captar
  leads. Te hace una entrevista sobre tu negocio (o el de tus clientes, si eres agencia):
  qué vendes, qué regalo de valor puedes dar, cómo capturas el lead y a dónde lo mandas;
  y te genera una skill propia tipo "/mi-consultor" que construye y despliega una app web
  completa EN TU CUENTA (tu Vercel, tus claves): el visitante recibe valor real (una
  tasación, un presupuesto orientativo, un diagnóstico) y tú recibes el lead. Úsala cuando
  alguien diga "forja mi consultor", "/forja-consultor", "quiero mi lead magnet con IA",
  "crea mi calculadora inteligente", "monta mi captador de leads", o acabe de instalar
  este paquete y quiera empezar. NO construye la app directamente — eso lo hará la skill
  que ESTA genera.
---

# /forja-consultor — Crea TU captador de leads con IA (meta-skill)

Esta skill **no construye tu app**. Crea **otra skill** — tu fábrica personal — a tu medida.

La idea: hay un **método probado** para captar leads entregando valor por adelantado:
el visitante usa una herramienta útil de verdad (tasador, calculadora, diagnóstico…),
recibe un informe honesto que le sube el nivel de consciencia, deja sus datos para
desbloquearlo, y termina justo donde tú quieres (tu calendario, tu WhatsApp, tu
formulario). Ese método —la arquitectura, la seguridad, la calidad "cero humo"— se
comparte tal cual. Pero el **negocio** (qué regalas, a quién, con qué marca, a dónde va
el lead) lo decides TÚ en una entrevista. Dos personas con esta misma meta-skill sacan
herramientas **distintas** que no se parecen en nada.

> **Regla de oro:** comparto el MÉTODO, tú construyes el NEGOCIO. Nunca embebas en la
> skill generada el negocio, la marca o las rutas de nadie más (tampoco las del autor de
> este paquete). Todo lo específico SIEMPRE sale de la entrevista.

## Qué necesita la persona (resumen honesto antes de empezar)

- **Imprescindible:** `node`/`npm`, una cuenta **gratuita** de Vercel, y una **API key de
  IA propia** (Anthropic o OpenRouter). El uso cuesta céntimos: con un modelo pequeño
  (Haiku), cada visitante que completa la experiencia cuesta ~0,01-0,03 €.
- **Recomendado:** una web propia (aunque sea básica) de donde sacar colores/logo, y un
  calendario de citas (Calendly, GHL, lo que uses) para el CTA final.
- **Si capturas leads DE VERDAD:** política de privacidad publicada y consentimiento
  RGPD. La skill generada lo exige — sin esto no se lanza (ver `assets/motor-refs/captura-y-rgpd.md`).

La Fase B comprueba qué hay y solo propone configurar lo que TU caso necesita. Nada de
pago se activa sin tu "sí".

---

## Flujo (4 fases, en orden)

### FASE A — ENTREVISTA · `references/01-entrevista.md`
Haz la entrevista completa (9 bloques). **Un bloque cada vez**, en lenguaje claro y con
ejemplos del sector de la persona. La primera pregunta decide el camino: ¿es para TU
negocio, o eres agencia/freelance y quieres crear estas herramientas para TUS clientes?
Al terminar, **resume el perfil en una tabla** y pide confirmación. Guarda el resultado
como `perfil.json` (esquema en `01-entrevista.md`).

> No pases a la Fase B sin el `perfil.json` confirmado. La entrevista define qué
> dependencias hacen falta y qué modo (propio/agencia) lleva la skill generada.

### FASE B — DIAGNÓSTICO DE ENTORNO · `references/02-diagnostico-entorno.md`
Con el perfil en mano, comprueba qué está instalado y qué falta para ESE perfil (node,
Vercel CLI + login, API key de IA, y las cuentas del destino del lead). Por cada cosa que
falte: explica para qué sirve, si es gratis o de pago, y **pregunta sí/no**. Las claves
las pega siempre LA PERSONA en su `.env.local` o en su panel de Vercel — la skill guía,
nunca las teclea por ella.

### FASE C — GENERAR LA SKILL · `references/03-generacion.md` + `references/04-plantilla-skill-hija.md`
Construye la skill hija `mi-consultor-<su-marca>/`:
- **Copia el MÉTODO tal cual** desde `assets/motor-refs/` (arquitectura, captura+RGPD,
  calidad cero humo — y `modo-agencia.md` solo si eligió agencia).
- **Genera el NEGOCIO desde el perfil:** SKILL.md propio + `perfil-negocio.md` con su
  concepto, su marca, sus textos, su destino del lead y su CTA.
- **Neutraliza**: cero referencias al autor del paquete, a esta meta-skill o a negocios
  de terceros.
- Instálala en `~/.claude/skills/` y dile cómo activarla.

### FASE D — ESTRENO
- Smoke test: la skill hija se lee, el perfil está completo, el entorno pasa el diagnóstico.
- Ofrece construir **su primera versión** ahí mismo con la skill nueva (app v1 en local),
  o dejarle una chuleta de uso para cuando quiera.
- Recuérdale lo que dejó pendiente (dominio propio, política de privacidad, calendario).

---

## Reglas que no se negocian

- **Método sí, negocio no.** Lo específico siempre sale de la entrevista.
- **Cero humo.** La herramienta generada entrega valor honesto: estimaciones con rango y
  disclaimer, datos de mercado reales o marcados como ejemplo, nada de promesas infladas.
  Si el dueño del negocio no diría "esto lo firmo", no se publica.
- **Opt-in para todo lo que cueste.** La API de IA se explica con su coste real
  (céntimos); nada de pago sin "sí" explícito.
- **Las claves las pone el humano.** Ni esta skill ni la hija teclean claves de nadie:
  guían dónde pegarlas (.env.local / panel de Vercel) y verifican que funcionan.
- **RGPD en serio si la captura es real:** consentimiento explícito + política de
  privacidad publicada + no guardar más de lo necesario. Sin esto, la skill hija se para.
- **La skill generada es autocontenida:** sus references viven en su carpeta; no depende
  de esta meta-skill ni de recursos del autor.
- **Verificación real antes de dar nada por hecho:** la skill hija recorre la app entera
  (flujo completo, también en móvil) en local Y en producción antes de declararla lista.
- **Lenguaje claro:** la persona puede ser vibe-coder no técnico. Ejemplos siempre.
