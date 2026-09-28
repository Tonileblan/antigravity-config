# 🗄️ Directriz Maestra #1: Arquitectura de Datos y Supabase Multi-Esquema (PostgreSQL)

> **Ubicación Google Drive:** `Google Drive > Mi unidad > 1-Proyectos > Apps-Desarrollo > Directrices > 01_Arquitectura_Supabase.md`  
> **Estado:** Obligatoria en el 100% de los proyectos con persistencia o base de datos  
> **Responsable Metodológico:** Toni (Antonio Javier García García)

---

## 🎯 1. Principio Fundamental de Aislamiento Lógico
Todo desarrollo dentro del ecosistema de Toni que requiera almacenamiento relacional utilizará la instancia centralizada de Supabase PostgreSQL, estructurada mediante **esquemas lógicos aislados** para prevenir colisiones entre aplicaciones y garantizar multi-tenancy seguro:

1. **Suite Propia (I+D Toni / Proyectos Internos):** Prefijo obligatorio `mia_` (ej. `mia_bytoniproyect`, `mia_vitatrading`, `mia_flowmind`, `mia_academy`).
2. **Proyectos Comerciales (Clientes / Negocios):** Prefijo obligatorio `com_` (ej. `com_bicicletas`, `com_clinicadental`, `com_control61`).
3. **Prohibición Estricta:** Queda terminantemente prohibido alojar tablas del proyecto en el esquema `public`.

```sql
-- Creación estándar del esquema del proyecto
CREATE SCHEMA IF NOT EXISTS mia_nombreproyecto;
GRANT USAGE ON SCHEMA mia_nombreproyecto TO anon, authenticated, service_role;
```

---

## 🛡️ 2. Reglas de Row Level Security (RLS) Obligatorio
- **100% de Cobertura:** Toda tabla creada debe tener RLS habilitado sin excepción:
  ```sql
  ALTER TABLE mia_nombreproyecto.tareas ENABLE ROW LEVEL SECURITY;
  ```
- **Identificador de Usuario Estándar:** Toda tabla vinculada a un usuario debe incluir:
  ```sql
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid()
  ```
- **Políticas CRUD Estándar:**
  ```sql
  -- Permitir lectura solo a registros propios
  CREATE POLICY "Users can view own records" ON mia_nombreproyecto.tareas
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

  -- Permitir inserción asociando el user_id autenticado
  CREATE POLICY "Users can insert own records" ON mia_nombreproyecto.tareas
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

  -- Permitir actualización solo de registros propios
  CREATE POLICY "Users can update own records" ON mia_nombreproyecto.tareas
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

  -- Permitir eliminación solo de registros propios
  CREATE POLICY "Users can delete own records" ON mia_nombreproyecto.tareas
    FOR DELETE TO authenticated USING (auth.uid() = user_id);
  ```

---

## ⚡ 3. Indexación y Rendimiento
- Generar índices B-Tree en todas las claves foráneas (`user_id`, `project_id`, `parent_id`) para evitar Sequential Scans en tablas con RLS.
  ```sql
  CREATE INDEX IF NOT EXISTS idx_tareas_user_id ON mia_nombreproyecto.tareas (user_id);
  CREATE INDEX IF NOT EXISTS idx_tareas_created_at ON mia_nombreproyecto.tareas (created_at DESC);
  ```

---

## 📜 4. Estándar de Migraciones y Versionado
- Todo proyecto debe mantener sus scripts de inicialización en `supabase/migrations/`.
- Nomenclatura obligatoria: `YYYYMMDD_init_<esquema>.sql` (ej. `20260927_init_com_control61.sql`).
