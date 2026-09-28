# 🚀 Antigravity Config & Skills Sync (Mac & Windows)

Repositorio centralizado para mantener **100% sincronizados** tus entornos de **Google Antigravity** en **macOS** y **Windows** con la misma cuenta de Google:

- 🏛️ **5 Directrices Maestras de Toni** (`directrices/` y `rules/5-directrices-maestras.md`): Normas inviolables de Supabase multi-esquema, Auth, IA/Streaming, RGPD titular Antonio Javier García García y control Drive.
- 📋 **Plantilla SOP y Memoria Viva** (`Directiva-ejemplo.md`): Estructura estándar para tareas y módulos subordinados a las directrices maestras.
- 🎨 **Skills**: `pencil-dev`, `stitch`, `ui-ux-expert`, `mobile-ui-ux-expert`, `accidental-data-loss-prevention`.
- 🔌 **Servidores MCP Multiplataforma**: `stitch-mcp` (compatible nativo con macOS y Windows).
- ⚙️ **Configuraciones Globales**: `mcp_config.json`, plantillas y scripts de instalación automáticos.

---

## 🏛️ Las 5 Directrices Maestras Heredadas

Cualquier proyecto web, app o script desarrollado en Antigravity aplica automáticamente:
1. **🗄️ Supabase Multi-Esquema:** Aislamiento estricto (`mia_*` suite propia / `com_*` clientes), RLS al 100% y `user_id UUID REFERENCES auth.users(id)`.
2. **🛡️ Seguridad & Auth:** Supabase Auth (JWT), Route Guards y validación estricta Zero-Trust.
3. **🤖 IA & Streaming SSE:** Conexiones en tiempo real, prompts aislados en capa de servicios y manejo de rate limits.
4. **⚖️ RGPD & Branding:** Titular legal **Antonio Javier García García** (DNI **34799350M**, Madrid), páginas `/privacidad`, `/aviso-legal`, `/terminos` y sello **"By Toni"**.
5. **📂 Control Documental:** Registro en `Registro_Proyectos_Toni.csv` y ficha técnica `INFO_PROYECTO.md`.

---

## 💻 1. Instalación en tu PC con Windows (1 solo comando)

Abre **PowerShell** en tu PC con Windows y ejecuta:

```powershell
# 1. Clona el repositorio en tu carpeta de proyectos
cd C:\Proyectos
git clone https://github.com/Tonileblan/antigravity-config.git
cd antigravity-config

# 2. Ejecuta el script de instalación
.\install.ps1
```

> **¿Qué hace `install.ps1` en Windows?**
> 1. Crea la estructura `%USERPROFILE%\.gemini\config\`.
> 2. Copia todas las directrices, reglas y skills al directorio global de Antigravity.
> 3. Configura automáticamente `mcp_config.json` con las rutas correctas de Windows y `node`.
> 4. Instala las dependencias del servidor MCP de Stitch.

---

## 🍎 2. Instalación en macOS

En tu Mac:

```bash
cd ~/Proyectos/antigravity-config
./install.sh
```

---

## 🔄 3. ¿Cómo sincronizar cuando añadas una nueva Directriz, Skill o cambio?

### Si creas una skill o directriz en macOS:
```bash
./sync.sh "Añadida nueva directriz maestra"
```
*En tu PC con Windows, solo abre PowerShell y haz:*
```powershell
git pull
.\install.ps1
```

### Si creas una skill o directriz en Windows:
```powershell
.\sync.ps1 "Añadida nueva regla de diseño"
```
*En tu Mac, solo abre el terminal y haz:*
```bash
git pull
./install.sh
```
