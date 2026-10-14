# 🗄️ DIRECTRICES DE ARQUITECTURA DE DATOS Y SUPABASE (POSTGRESQL)


Este documento define los estándares obligatorios de base de datos para todas las aplicaciones (uso propio y comerciales), garantizando **cero colisiones de nombres**, **aislamiento total de datos**, **coste mínimo** y **facilidad de migración instantánea**.


---


## 0. Protocolo de Inicio (Pre-Flight Check)
Antes de crear cualquier tabla o esquema SQL en Supabase, el asistente debe preguntar y confirmar con el usuario:
1. ¿Es una **App de Uso Propio / Suite** (`mia_`) o una **App Comercial / Cliente** (`com_`)?
2. ¿Cuál es el **`APP_SLUG`** único asignado?


---


## 1. Clasificación y Espacio de Nombres (Namespacing)


| Tipo de Aplicación | Prefijo / Slug | Base de Datos Destino | Ejemplos |
| :--- | :--- | :--- | :--- |
| **Uso Propio / Suite** | `mia_<nombre_corto>` | Proyecto Supabase Suite Propia | `mia_crm`, `mia_mapas`, `mia_vibe` |
| **Comercial / Clientes** | `com_<nombre_corto>` | Proyecto Supabase Hub Comercial | `com_bicicletas`, `com_control` |


---


## 2. Aislamiento por Esquemas de PostgreSQL (Anti-Colisiones)


Cada aplicación debe operar en su propio **Esquema de PostgreSQL**:


### A. Creación del Esquema y Permisos
```sql
CREATE SCHEMA IF NOT EXISTS mia_crm;


GRANT USAGE ON SCHEMA mia_crm TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA mia_crm TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA mia_crm TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA mia_crm GRANT ALL ON TABLES TO anon, authenticated, service_role;
```


### B. Consumo desde el Cliente Frontend (TypeScript / React)
```typescript
import { createClient } from '@supabase/supabase-js';


export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    db: { schema: 'mia_crm' }
  }
);
```


---


## 3. Estructura Obligatoria de Tablas (DDL)


```sql
CREATE TABLE IF NOT EXISTS mia_crm.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  nombre text NOT NULL,
  email text,
  estado text NOT NULL DEFAULT 'activo'
);


CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON mia_crm.contacts(user_id);


CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_contacts_updated_at
  BEFORE UPDATE ON mia_crm.contacts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```


---


## 4. Seguridad y RLS (Row Level Security)


```sql
ALTER TABLE mia_crm.contacts ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Aislamiento por usuario en contacts" ON mia_crm.contacts
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```


---


## 5. Variables de Entorno y Credenciales
```env
VITE_SUPABASE_URL="https://tu-proyecto.supabase.co"
VITE_SUPABASE_ANON_KEY="tu-clave-anon"
```
> ⚠️ **Prohibición:** NUNCA exponer la clave `service_role` en frontend.


---


## 6. Procedimiento de Migración Futura para Apps Comerciales
```bash
pg_dump -h db.tu-proyecto.supabase.co -U postgres -d postgres -n com_bicicletas > export_bicis.sql
psql -h db.nuevo-proyecto.supabase.co -U postgres -d postgres -f export_bicis.sql
```