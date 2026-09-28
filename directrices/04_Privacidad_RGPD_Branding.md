# ⚖️ Directriz Maestra #4: Privacidad, RGPD y Branding "By Toni"

> **Ubicación Google Drive:** `Google Drive > Mi unidad > 1-Proyectos > Apps-Desarrollo > Directrices > 04_Privacidad_RGPD_Branding.md`  
> **Estado:** Obligatoria en el 100% de las aplicaciones web, móviles o herramientas públicas  
> **Responsable Metodológico:** Toni (Antonio Javier García García)

---

## 🏛️ 1. Datos Identificativos del Titular Legal
En todas las aplicaciones que procesen datos de usuarios, formulen cookies o requieran aviso legal bajo normativa española y europea (RGPD / LOPD-GDD):
- **Titular del Tratamiento y Responsable:** **Antonio Javier García García**
- **Documento Nacional de Identidad (DNI):** **34799350M**
- **Domicilio Legal:** Madrid (España)
- **Contacto Legal:** Correo del proyecto o `contacto@bytoni.dev`

---

## 📄 2. Rutas Legales Obligatorias Pregeneradas
Toda aplicación web de producción debe incluir 3 rutas accesibles desde el pie de página:
1. `/privacidad`: Política de Privacidad detallando base jurídica, fines del tratamiento y derechos ARCO.
2. `/aviso-legal`: Aviso Legal con datos identificativos del titular y régimen de responsabilidad.
3. `/terminos`: Términos y Condiciones de Uso, derechos de propiedad intelectual y limitaciones del servicio.

---

## 🍪 3. Consentimiento de Cookies y LocalStorage
- Banner no intrusivo pero visible que permita al usuario aceptar o rechazar cookies no esenciales (analítica, personalización) conforme a la guía de la AEPD.
- Cumplimiento de derechos ARCO: Acceso, Rectificación, Cancelación y Oposición mediante mecanismo sencillo.

---

## ✨ 4. Sello de Autoría y Branding "By Toni"
- Todo pie de página (*Footer*) de las aplicaciones desarrolladas dentro de la suite debe incluir el distintivo oficial:
  ```html
  <footer className="...">
    <span>© 2026 Antonio Javier García García. Todos los derechos reservados.</span>
    <span className="badge-by-toni">Desarrollado con excelencia · By Toni</span>
  </footer>
  ```
