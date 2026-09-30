---
name: acumbamail
description: Integración global para añadir suscriptores a listas de Acumbamail y gestionar la API de email marketing.
---

# Acumbamail Skill

Esta skill proporciona las herramientas para interactuar con la API de Acumbamail en cualquier proyecto en el que estés trabajando.

## Uso

Siempre que el usuario solicite captar un lead, registrar un correo electrónico o hacer una integración con Acumbamail, debes utilizar el script de Python proporcionado en esta skill.

### Añadir Suscriptor a una Lista

Puedes usar el script `scripts/add_subscriber.py` para dar de alta a un usuario.

**Entradas Requeridas:**
1. `list_id` (ID de la lista destino, ej. 780762 para Audaprompts-Members)
2. `email` (El correo a suscribir)
3. `first_name` (Opcional)
4. `last_name` (Opcional)

**Ejemplo de Comando:**
```bash
python ~/.gemini/config/skills/acumbamail/scripts/add_subscriber.py 780762 test@example.com "Juan"
```

### Pre-requisitos
El entorno donde se ejecute debe tener la variable de entorno `ACUMBAMAIL_TOKEN` configurada. Si no lo está en el entorno local del proyecto, solicítala al usuario o extráela del `.env` del proyecto activo.

## Extensibilidad
Si en el futuro se requieren nuevos endpoints (como creación de campañas, obtener reportes, etc.), el agente debe añadir un nuevo script en la carpeta `scripts/` de esta skill y actualizar este archivo `SKILL.md` con las instrucciones de uso.
