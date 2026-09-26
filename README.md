# 🚀 Antigravity Config & Skills Sync (Mac & Windows)

Repositorio centralizado para mantener **100% sincronizados** tus entornos de **Google Antigravity** en **macOS** y **Windows** con la misma cuenta de Google:

- 🎨 **Skills**: `pencil-dev`, `stitch`, `ui-ux-expert`, `mobile-ui-ux-expert`, `accidental-data-loss-prevention`.
- 🔌 **Servidores MCP Multiplataforma**: `stitch-mcp` (compatible nativo con macOS y Windows).
- ⚙️ **Configuraciones Globales**: `mcp_config.json`, plantillas y scripts de instalación automáticos.

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
> 2. Copia todas las skills personalizadas a tu directorio global de Antigravity.
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

## 🔄 3. ¿Cómo sincronizar cuando añadas una nueva Skill o cambio?

### Si creas una skill en macOS:
```bash
./sync.sh "Añadida nueva skill para analítica de datos"
```
*En tu PC con Windows, solo abre PowerShell y haz:*
```powershell
git pull
.\install.ps1
```

### Si creas una skill en Windows:
```powershell
.\sync.ps1 "Añadida nueva regla de diseño"
```
*En tu Mac, solo abre el terminal y haz:*
```bash
git pull
./install.sh
```
