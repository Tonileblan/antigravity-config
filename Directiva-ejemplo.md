# 📋 DIRECTIVA DE TAREA (SOP): [NOMBRE_CLAVE_DE_LA_TAREA]

> **ID de Tarea:** `SOP-[ID_UNICO_O_FECHA]`  
> **Script / Módulo Asociado:** `scripts/[nombre_del_script].py` (o `src/services/[servicio].ts`)  
> **Última Actualización:** `[FECHA_ACTUAL]`  
> **Estado:** `[BORRADOR / ACTIVO / DEPRECADO]`  
> **Jerarquía:** Subordinada a las [5 Directrices Maestras de Toni](directrices/00_Directriz_Definicion_Proyecto.md)

---

## 🏛️ 0. Marco Normativo y Directrices Maestras Heredadas
Cualquier tarea o módulo desarrollado bajo esta directiva **debe cumplir obligatoriamente** con las 5 Directrices Maestras del ecosistema:
1. **🗄️ Supabase Multi-Esquema:** Esquema dedicado (`mia_*` propio / `com_*` cliente), RLS forzoso al 100%, columna `user_id` vinculada a `auth.users(id)`.
2. **🛡️ Seguridad & Auth:** Supabase Auth JWT, Route Guards y validación estricta Zero-Trust.
3. **🤖 IA & Streaming SSE:** Conexiones en tiempo real, prompts aislados en capa de servicio y gestión de rate limits con backoff.
4. **⚖️ RGPD & Branding:** Titular legal Antonio Javier García García (DNI 34799350M, Madrid), páginas legales y sello *"By Toni"*.
5. **📂 Control Documental:** Registro en `Registro_Proyectos_Toni.csv` y ficha técnica `INFO_PROYECTO.md`.

---

## 🎯 1. Objetivos y Alcance
*Describe aquí QUÉ debe lograr esta tarea y POR QUÉ.*
- **Objetivo Principal:** [Descripción concisa de la meta final, ej: "Extraer datos de la API y normalizarlos a formato compatible con Supabase"].
- **Criterio de Éxito:** [Condición exacta para considerar la tarea completada, ej: "El script devuelve exitosamente los datos y se registra en base de datos sin errores"].

---

## 📥 2. Especificaciones de Entrada/Salida (I/O)
*Define estrictamente los tipos de datos para garantizar determinismo.*

### Entradas (Inputs)
- **Argumentos Requeridos:**
  - `[nombre_arg]`: `[Tipo de dato]` - `[Descripción]`.
- **Variables de Entorno (.env):**
  - `[NOMBRE_VAR]`: `[Descripción del secreto/token necesario]`.
- **Archivos Fuente:**
  - `[ruta/al/archivo]`: `[Descripción]`.

### Salidas (Outputs)
- **Artefactos Generados:**
  - `[ruta/de/salida]`: `[Formato y descripción del contenido]`.
- **Retorno de Consola / API:** `[Qué debe retornar: JSON, Path o Status Code de éxito]`.

---

## 🔄 3. Flujo Lógico (Algoritmo Determinista)
*Describe la lógica paso a paso para que cualquier script o agente pueda replicar el proceso.*

1. **Inicialización:** [Ej: Validar dependencias, cargar variables de entorno y verificar carpetas de salida].
2. **Adquisición / Conexión:** [Ej: Conectar al servicio / API con reintentos exponenciales].
3. **Procesamiento & Validación:** [Ej: Normalizar datos con esquema Zod / tipado estricto].
4. **Persistencia:** [Ej: Guardar en esquema dedicado de Supabase o generar archivo de salida].
5. **Limpieza & Notificación:** [Ej: Cerrar conexiones y emitir log estructurado].

---

## 🛠️ 4. Herramientas y Librerías Permitidas
*Lista blanca de dependencias y servicios.*
- **Librerías / SDKs:** `[nombres de paquetes aprobados]`.
- **APIs / Servicios Externos:** `[Nombre y versión del endpoint]`.

---

## ⚠️ 5. Restricciones y Casos Borde (Edge Cases)
*Condiciones conocidas que podrían romper el flujo estándar y cómo manejarlas.*

### Limitaciones Conocidas
- **Límites de Cuota / Rate Limits:** [Ej: Máximo X llamadas por minuto -> aplicar delay].
- **Manejo de Nulos / Formatos Inesperados:** [Ej: Sanitizar strings y proveer valores fallback].
- **Concurrencia:** [Ej: No ejecutar en paralelo si muta el mismo recurso].

### Validaciones Requeridas
- [ ] Validación de inputs antes de ejecutar.
- [ ] Comprobación de conectividad y variables de entorno.
- [ ] Verificación de integridad de los datos de salida.

---

## 🧠 6. Protocolo de Aprendizajes y Memoria Viva (Self-Correction)
*CRÍTICO: Esta sección se actualiza automáticamente tras resolver cualquier fallo o caso borde inesperado para evitar regresiones futuras.*

| Fecha | Error Detectado | Causa Raíz | Solución / Parche Aplicado | Prevención Futura |
| :--- | :--- | :--- | :--- | :--- |
| `[DD/MM/AAAA]` | `[Tipo de Error / Excepción]` | `[Por qué ocurrió]` | `[Cómo se resolvió el bug]` | `[Regla técnica a seguir]` |

> **Nota de Implementación:** Si encuentras un nuevo error, **primero** arréglalo en el código, y **luego** documenta la solución en esta tabla.

---

## 💻 7. Ejemplos de Invocación y Uso
*Comandos reproducibles para ejecutar el script o módulo.*

```bash
# Ejecución estándar en desarrollo
npm run task:ejecutar -- --param="valor"
# o en Python:
python scripts/[nombre_del_script].py --input "valor"
```

---

## ✅ 8. Checklist de Pre-Ejecución y Post-Ejecución

### Pre-Ejecución
- [ ] Variables de entorno configuradas en `.env.local`
- [ ] Dependencias instaladas
- [ ] Archivos de entrada disponibles y validados
- [ ] Esquema de Supabase y políticas RLS verificadas

### Post-Ejecución
- [ ] Salidas y artefactos generados correctamente
- [ ] Logs revisados sin errores ni warnings críticos
- [ ] Resultados validados contra el criterio de éxito
- [ ] Tabla de Memoria Viva actualizada (si se descubrió un nuevo caso borde)
