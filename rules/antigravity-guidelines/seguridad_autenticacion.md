# 🛡️SEGURIDAD Y AUTENTICACIÓN DE USUARIOS


Este documento define los estándares obligatorios de seguridad, control de acceso, gestión de sesiones y protección de datos para todas las aplicaciones con registro o inicio de sesión (Supabase Auth).


---


## 1. Principio de Aislamiento Total (Row Level Security - RLS)


Ningún usuario debe tener la capacidad técnica de leer, editar o borrar datos de otro usuario:


1. **RLS Obligatorio en el 100% de las Tablas:**
   Toda tabla creada debe activar RLS de forma inmediata:
   ```sql
   ALTER TABLE <schema_o_prefijo>.<tabla> ENABLE ROW LEVEL SECURITY;
   ```
2. **Vinculación a `auth.uid()`:**
   Las políticas deben verificar siempre que el ID del usuario autenticado coincida con el propietario del registro:
   ```sql
   CREATE POLICY "Aislamiento por usuario" ON <schema_o_prefijo>.<tabla>
     FOR ALL TO authenticated
     USING (auth.uid() = user_id)
     WITH CHECK (auth.uid() = user_id);
   ```


---


## 2. Gestión de Roles Segura (RBAC - Role-Based Access Control)


Los roles de usuario (como `admin`, `supervisor`, `cliente` o `mecanico`) **NUNCA deben guardarse en sitios manipulables por el usuario**:


1. **Prohibición Crítica:** NUNCA almacenar roles en `user_metadata` (el usuario puede modificarse a sí mismo a `admin` desde la consola del navegador con `supabase.auth.updateUser()`).
2. **Tabla de Roles Aislada:**
   Los roles deben almacenarse en una tabla de base de datos protegida a la que solo el sistema tenga acceso:
   ```sql
   CREATE TABLE public.user_roles (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     role text NOT NULL CHECK (role IN ('admin', 'supervisor', 'user')),
     UNIQUE (user_id, role)
   );


   ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;


   -- Solo lectura para el propio usuario o administradores
   CREATE POLICY "Lectura de roles propios" ON public.user_roles
     FOR SELECT TO authenticated
     USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
   ```
3. **Función de Verificación Segura (`SECURITY DEFINER`):**
   ```sql
   CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
   RETURNS boolean
   LANGUAGE sql STABLE SECURITY DEFINER
   SET search_path = public
   AS $$
     SELECT EXISTS (
       SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
     );
   $$;
   ```


---


## 3. Trigger Automático de Registro (`handle_new_user`)


Cuando un usuario se registra mediante Email o Google OAuth, la base de datos debe inicializar su perfil de forma atómica y segura mediante un Trigger en PostgreSQL:


```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Crear perfil público
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;


  -- 2. Asignar rol por defecto 'user' (NUNCA admin)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;


  RETURN NEW;
END;
$$;


-- Vincular trigger al registro de Supabase Auth
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```


---


## 4. Protección de Rutas y Sesiones en Frontend (React / Vite)


1. **Rutas Protegidas Obligatorias:**
   Toda pantalla que requiera autenticación debe envolverse en un componente de protección (`ProtectedRoute` o layout `_authenticated`):
   * Si la sesión es nula o está cargando, redirigir a `/auth` o `/login`.
   * Si el usuario no tiene el rol necesario, mostrar pantalla de `403 No Autorizado`.
2. **Listener de Sesión (`onAuthStateChange`):**
   El estado de autenticación debe escuchar activamente los cambios de token:
   ```typescript
   supabase.auth.onAuthStateChange((event, session) => {
     if (event === 'SIGNED_OUT' || !session) {
       // Limpiar estados en memoria y redirigir a login
     }
   });
   ```


---


## 5. Reglas de Validación de Entrada y Privacidad


1. **Validación de Formularios (Zod / Schemas):**
   * Contraseñas con un mínimo de 8 caracteres.
   * Validación estricta de emails para evitar inyecciones.
2. **Sanitización de Datos (Prevención XSS):**
   * No renderizar contenido generado por usuarios con `dangerouslySetInnerHTML`.
3. **Protección de Secretos:**
   * Archivo `.env` y `.env.local` incluidos obligatoriamente en `.gitignore`.
   * NUNCA utilizar la clave `service_role` en el cliente.