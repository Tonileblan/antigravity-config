# ⚖️ PRIVACIDAD, PROTECCIÓN DE DATOS (RGPD / LOPDGDD) Y BRANDING


Este documento define la **generación automática obligatoria** de páginas legales, datos del responsable, derechos del usuario y firma de autoría para todas las aplicaciones del ecosistema.


---


## 0. Automatización Obligatoria de Páginas Legales y Footer (Por Defecto)


Al crear o inicializar cualquier aplicación web, el asistente **DEBE generar automáticamente y sin esperar a que el usuario lo solicite:**


1. **Las 3 Rutas y Páginas Legales:**
   * `/privacidad` (`PrivacyPolicy.tsx` o `routes/privacidad.tsx`)
   * `/aviso-legal` (`LegalNotice.tsx` o `routes/aviso-legal.tsx`)
   * `/terminos` (`Terms.tsx` o `routes/terminos.tsx`)
2. **El Pie de Página (Footer) Completo:**
   * Enlaces visibles a las 3 páginas legales.
   * La firma obligatoria de autoría: **`By Toni`** *(o `Desarrollado con ❤️ by Toni`)*.


---


## 1. Datos Legales del Responsable y Protocolo de Inclusión


### Datos Oficiales del Titular:
* **Titular / Responsable:** Antonio Javier García García
* **DNI / NIF:** 34799350M
* **Domicilio:** Calle Pintor Antonio Saura 14, Sanchinarro, 28050 Madrid (Madrid, España)
* **Email de Contacto Legal:** `leblangarcia@gmail.com`


### ❓ Pregunta Previa de Confirmación:
Al inicializar el proyecto, el asistente solo preguntará:
> *"¿Inserto en las páginas legales tus datos (Antonio Javier García García, DNI 34799350M, Madrid) o dejo marcadores genéricos `[NOMBRE_TITULAR / CIF / DIRECCION]` para un cliente final?"*
*(Y acto seguido genera las páginas con la opción elegida).*


---


## 2. Consentimiento Explícito en el Registro (Consent Tracking)


Todo formulario de registro de usuario (Sign Up) debe incluir por defecto:


1. **Casilla de Verificación Desmarcada:**
   * `[ ] He leído y acepto la Política de Privacidad y los Términos de Servicio.`
   * Botón de registro bloqueado hasta marcar la casilla.
2. **Registro de Consentimiento en Base de Datos:**
   ```sql
   ALTER TABLE public.profiles
     ADD COLUMN IF NOT EXISTS privacy_accepted_at timestamptz,
     ADD COLUMN IF NOT EXISTS privacy_version text DEFAULT '1.0';
   ```


---


## 3. Implementación Técnica de los Derechos del Usuario (ARCO-POL)


Toda app con login debe incluir en los ajustes de perfil:


### A. Derecho de Supresión / Al Olvido (Eliminación Total de Cuenta)
```sql
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Borra el usuario de auth.users (desencadena cascada ON DELETE CASCADE en todas las tablas)
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
```


### B. Derecho a la Portabilidad (Descarga de Datos)
* Botón funcional: **`"Exportar todos mis datos (.JSON / .CSV)"`** que descargue toda la información vinculada a su `user_id`.


### C. Derecho de Rectificación y Acceso
* Posibilidad de editar nombre, email y preferencias en cualquier momento.


---


## 4. Política de Cookies y Rastreadores


1. **Cookies Técnicas/Esenciales (Supabase Auth):**
   * Permitidas por defecto sin necesidad de banner bloqueante.
2. **Cookies de Analítica o Publicidad:**
   * Si se integran herramientas de rastreo (Google Analytics, Pixels), es obligatorio incluir un banner que bloquee su carga hasta que el usuario pulse *"Aceptar"*.


---


## 5. Seguridad de Datos y Minimización


1. **Minimización:** Solo solicitar los datos estrictamente necesarios para el funcionamiento del servicio.
2. **Cero Datos Bancarios en BD:** Pagos delegados 100% en pasarelas externas seguras (Stripe / Redsys). NUNCA guardar números de tarjeta en Supabase.
3. **Cifrado y Región:**
   * 100% del tráfico web forzado bajo **HTTPS / TLS 1.3**.
   * Servidores de base de datos preferentemente ubicados en la Unión Europea (`eu-central-1` Fráncfort).