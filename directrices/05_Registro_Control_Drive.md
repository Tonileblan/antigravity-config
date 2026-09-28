# 📂 Directriz Maestra #5: Registro Central y Control Documental en Google Drive

> **Ubicación Google Drive:** `Google Drive > Mi unidad > 1-Proyectos > Apps-Desarrollo > Directrices > 05_Registro_Control_Drive.md`  
> **Estado:** Obligatoria al inicializar, documentar y desplegar cualquier proyecto  
> **Responsable Metodológico:** Toni (Antonio Javier García García)

---

## 🗂️ 1. Estructura Jerárquica de Carpetas en Google Drive
La organización central de proyectos en la nube sigue la estructura unificada:
```text
Google Drive
 └── Mi unidad
      └── 1-Proyectos
           └── Apps-Desarrollo
                ├── Registro_Proyectos_Toni.csv
                ├── Plantilla_Definicion_Proyecto_Toni.xlsx
                ├── Directriz-Definicion-Proyecto.md
                ├── Directrices/
                └── [Nombre-Proyecto]/
                     ├── INFO_PROYECTO.md
                     ├── Briefing/
                     └── Documentacion/
```

---

## 📊 2. Registro Maestro en `Registro_Proyectos_Toni.csv`
Cada nuevo proyecto debe registrarse en el archivo CSV maestro con los siguientes campos:
```csv
ID,Nombre,Slug,Categoria,Estado,TipoApp,EsquemaSupabase,URL_Produccion,Repositorio,FechaCreacion
```

---

## 📝 3. Ficha Técnica Obligatoria `INFO_PROYECTO.md`
Todo proyecto en su raíz local y en su carpeta de Drive debe contener una ficha técnica `INFO_PROYECTO.md` que detalle:
1. **Ficha Resumen:** Nombre, Slug, Tagline, Categoría, Estado.
2. **Propuesta de Valor & Problema:** Público objetivo y dolores que soluciona.
3. **Arquitectura Técnica:** Frontend, UI Styling, Backend, Base de Datos (esquema PostgreSQL), Modelo IA.
4. **Tabla de Cumplimiento de las 5 Directrices Maestras:**
   - 🗄️ Supabase: Esquema dedicado y RLS.
   - 🛡️ Auth: Supabase Auth y Route Guards.
   - 🤖 IA: Streaming SSE y proveedor.
   - ⚖️ RGPD: Titularidad legal y rutas `/privacidad`, `/aviso-legal`, `/terminos`.
   - 📂 Drive: Registro en CSV y ficha técnica.
5. **Guía de Arranque Rápido:** Comandos de instalación, entorno y ejecución local (`npm run dev`).
