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

### Pre-requisitos y Credenciales Globales (PrimeIO OS)
El token de Acumbamail principal de Toni (`ACUMBAMAIL_TOKEN=5102f52223ac45918c8959d4c2921038`) reside de forma segura en el archivo `/Users/toni/Proyectos/PrimeIO/.env`. Cuando un nuevo proyecto (ej. Muibici o un nuevo SaaS) necesite crear listas o enviar leads a Acumbamail, el agente debe usar este token maestro.

### Arquitectura Web/SaaS (Vercel Serverless)
**IMPORTANTE:** Nunca se debe llamar a la API de Acumbamail directamente desde el Frontend (React/Vite/Browser) para evitar exponer el token maestro.
Para cualquier proyecto web o SaaS desplegado en Vercel, debes seguir esta arquitectura:

1. **Crear Lista (Agent Side):** Utiliza la API de Acumbamail (`POST https://acumbamail.com/api/1/createList/`) con `curl` para crear la lista (requiere `auth_token`, `name`, `from_name`, `sender_email`). Extrae el `list_id` de la respuesta.
2. **Serverless Endpoint:** Crea un archivo `api/acumbamail-subscribe.ts` en la raíz del proyecto para exponer una ruta segura de Vercel Functions.
3. **Inyectar Variables en Vercel:** Ejecuta los siguientes comandos para inyectar el token en el proyecto de Vercel del usuario:
   - `npx vercel env add ACUMBAMAIL_TOKEN production` (Y pásale el token maestro).
   - Haz lo mismo para `preview` y `development`.
4. **Desplegar:** Al hacer `vercel --prod`, la función Serverless quedará activa y el Frontend podrá hacer un `POST` a `/api/acumbamail-subscribe` enviando solo el `email`.

## Extensibilidad
Si en el futuro se requieren nuevos endpoints (como creación de campañas, obtener reportes, etc.), el agente debe añadir un nuevo script en la carpeta `scripts/` de esta skill y actualizar este archivo `SKILL.md` con las instrucciones de uso.
