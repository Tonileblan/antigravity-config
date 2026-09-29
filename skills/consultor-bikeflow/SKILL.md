---
name: consultor-bikeflow
description: >
  Construye, despliega e itera el captador de leads y comparador de rentabilidad de BikeFlow
  — software CRM y gestión de taller de bicicletas. Permite a dueños de talleres calcular
  su ahorro frente a cuotas mensuales (~500€/mes), comparar frente al Top 3 de CRMs de España
  (Ciclomax, Gesio Bike, TallerGP) y acceder a la oferta Lifetime (100€ de pago único) con
  auditoría a los 30 días. Úsala para "construye mi consultor", "despliega mi app de leads",
  "modifica bikeflow", "calculadora taller bicis", "simulador ahorro bikeflow".
---

# BikeFlow Auditor — Captador de Leads y Simulador de Ahorro

Tu negocio vive en `references/perfil-negocio.md`. El método técnico vive en `references/arquitectura-app.md`, `captura-y-rgpd.md` y `calidad-y-rigor.md`.
Lee SIEMPRE el perfil antes de tocar nada.

## Modo 1 — Construir (primera vez)

1. Lee `perfil-negocio.md` + `arquitectura-app.md`. Crea el proyecto en el workspace del usuario siguiendo la arquitectura limpia:
   - Configuración completa y tipada en `lib/config.ts`.
   - Selector interactivo de cuota mensual (16 € a 900 €/mes), bicis reparadas y mecánicos.
   - Pestaña / Tabla comparativa con el Top 3 de CRMs en España (Ciclomax, Gesio Bike, TallerGP).
   - Informe modular: Tarjetas de ahorro (1, 3 y 5 años), Gráfica de curva de costes acumulada, Amortización Express y Pack de Puesta en Marcha.
   - Selector de Modo Claro / Modo Oscuro.
2. Captura del lead a triple destino (Email + Google Sheets + Telegram) con consentimiento RGPD explícito.
3. El CTA final ofrece la Compra Directa de la Licencia Lifetime (100 €) + soporte directo por WhatsApp.
4. Verifica todo en local con navegador (móvil y escritorio) antes de desplegar.
5. Deploy a Vercel (`bikeflow.vercel.app`) y verificación final en producción.

## Modo 2 — Iterar

Para cambios (textos, tarifas, comparativas, diseño o destinos): edita config y componentes, verifica en local, redespliega en Vercel y actualiza `perfil-negocio.md`.

## Reglas de esta skill

- **Transparencia y honestidad:** Rangos conservadores, disclaimers visibles y datos reales de mercado.
- **Seguridad:** Claves en variables de entorno server-side, sin PII en logs.
- **Verificación real:** Comprobar siempre el flujo funcional completo tanto en local como en producción en Vercel.
- **Pendientes actuales:**
  - Configurar pasarela de pago Stripe (100 €).
  - Conectar tokens de Telegram, Resend y Google Sheets.
