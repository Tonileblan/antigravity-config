# 🛡️ Directriz Maestra #2: Seguridad, Autenticación y Route Guards

> **Ubicación Google Drive:** `Google Drive > Mi unidad > 1-Proyectos > Apps-Desarrollo > Directrices > 02_Seguridad_Autenticacion.md`  
> **Estado:** Obligatoria en el 100% de los proyectos con autenticación, login o zonas privadas  
> **Responsable Metodológico:** Toni (Antonio Javier García García)

---

## 🔒 1. Gestión de Identidad y Sesiones (Supabase Auth)
- **Motor de Autenticación:** Supabase Auth gestionado con JWT estándar.
- **Métodos Soportados:** Email con Magic Link o Contraseña segura, más integración OAuth (Google / GitHub) según necesidades del proyecto.
- **Almacenamiento de Tokens:** Almacenamiento seguro de tokens JWT con refresco transparente mediante el SDK de Supabase o cookies `HttpOnly` en arquitecturas SSR.

---

## 🛡️ 2. Protección de Rutas (Route Guards)
- **Zero Exposure en Cliente:** Ninguna vista o componente que maneje datos protegidos debe renderizarse sin comprobar previamente el estado de la sesión de Supabase Auth.
- **Implementación Estándar en React:**
  ```tsx
  export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { session, loading } = useAuth();
    if (loading) return <LoadingScreen />;
    if (!session) return <Navigate to="/login" replace />;
    return <>{children}</>;
  };
  ```

---

## 🧼 3. Validación de Entradas y Zero Trust
- **Validación Estricta:** Validar esquemas de datos con Zod o TypeScript en todas las fronteras de entrada de datos (formularios, query params, webhooks y APIs externas).
- **Protección XSS & Inyecciones:** Sanitizar rigurosamente cualquier renderizado dinámico de HTML o Markdown (`DOMPurify` o parsers seguros).
- **Cero Secretos en el Frontend:**
  - **PROHIBIDO:** Incluir `SUPABASE_SERVICE_ROLE_KEY`, tokens de OpenAI/Anthropic con facturación directa o claves maestras en el cliente (`VITE_`, `NEXT_PUBLIC_`).
  - Las operaciones que requieran privilegios de administrador deben aislarse en Edge Functions de Supabase o endpoints backend seguros.
