# Perfil de Negocio: Primeio / MuiBici

## 1. El Negocio y el Problema
- **Marca:** Primeio / MuiBici
- **Web:** https://primeio.com/muibici
- **Qué vendemos:** Software de gestión hiper-específico para talleres de bicicletas de pago único (149€), eliminando para siempre las cuotas SaaS.
- **Cliente ideal:** El dueño de un taller de bicicletas o mecánico de trinchera, cansado del humo y las cuotas abusivas.
- **Dolor principal:** Exceso de llamadas (¿está mi bici?), fugas de facturación (olvidan apuntar piezas pequeñas), y rechazo visceral a pagar suscripciones mensuales a agencias o SaaS corporativos.

## 2. El Regalo (Lead Magnet)
- **Concepto:** "Auditor de Caos y Rentabilidad".
- **Por qué funciona:** Pone números reales a lo que están perdiendo por desorganización y cuotas mensuales. El impacto es visual: duele ver la sangría, y la cura (149€ pago único) es ridículamente rentable en comparación.

## 3. Experiencia del Usuario
- **Mecánica:** Un formulario hiper-directo de 4 campos. Nada de test infinitos.
- **El Informe:**
  1. Gráfica de "Sangría SaaS a 5 años" vs MuiBici.
  2. Puntuación de Caos del Taller (0-100).
  3. Euros ocultos perdidos al mes por micropiezas no cobradas.
  4. Plan de Acción Táctico de trinchera.

## 4. Captura del Lead y CTA
- **Datos pedidos:** Nombre y Email (obligatorios).
- **Destino del Lead:** Lista de Acumbamail.
- **Copy de captura:** "¿A qué email te envío tu Plan de Acción Táctico?"
- **Siguiente paso (CTA):** "Probar MuiBici Gratis (10 reparaciones)".
- **Destino CTA:** https://primeio.com/muibici (debe llevar trackeo de JotUrl para métricas).

## 5. Marca y Tono
- **Identidad Visual:** Oscuro, industrial, alto contraste. Colores: #111827 (fondo/primario), #4f46e5 (acento).
- **Tono de Voz:** Pragmatismo, lenguaje obrero, anti-corporate, radicalmente transparente. Sin "sinergias", sin psicología barata. De mecánico a mecánico.
- **Nombre del Asistente:** Auditor PrimeIO.

## 6. Detalles Técnicos
- **Despliegue:** Vercel
- **Dominio:** Por definir (ej: auditor.primeio.com)
- **RGPD:** Consentimiento listo (checklist aprobado).

## Tabla Resumen de Variables (JSON)
```json
{
  "modo": "propio",
  "negocio": { "nombre": "Primeio / MuiBici", "web": "https://primeio.com/muibici", "queVende": "Software de pago único", "clienteIdeal": "Mecánico de trinchera", "dolorCaptacion": "Caos, fugas de dinero, cuotas" },
  "regalo": { "concepto": "Auditor de Caos y Rentabilidad", "porQueFunciona": "Pone números a la pérdida" },
  "mecanica": ["form"],
  "informe": { "modulos": ["Gráfica SaaS", "Caos", "Fugas", "Plan"], "referenciasReales": "Comparación 39€/mes vs 149€" },
  "captura": { "campos": ["Nombre", "Email"], "destino": "acumbamail", "rgpdListo": true },
  "cta": { "tipo": "contacto", "url": "https://primeio.com/muibici" },
  "marca": { "fuente": "manual", "colores": {"primario": "#111827", "acento": "#4f46e5"}, "tono": "Pragmático, anti-corporate", "nombreAsistente": "Auditor PrimeIO" },
  "hosting": { "donde": "vercel", "dominio": "" },
  "skill": { "nombre": "mi-consultor-primeio" }
}
```
