# 📂 DIRECTRICES DE REGISTRO Y CONTROL EN GOOGLE DRIVE


Este protocolo define la sincronización obligatoria de cada proyecto con el espacio de almacenamiento y control en Google Drive.


---


## 1. Ubicación Central en Drive
Todo el registro y almacenamiento de activos se gestiona dentro de la ruta sincronizada en el Mac:
`~/Library/CloudStorage/GoogleDrive-leblangarcia@gmail.com/Mi unidad/1-Proyectos/Apps-Desarrollo/`


---


## 2. Archivo Maestro de Seguimiento
El archivo principal de control de todas las aplicaciones es:
📄 **`Registro_Proyectos_Toni.csv`** *(o Hoja de Google Sheets vinculada)*


### Columnas Obligatorias del Registro:
1. **Proyecto:** Nombre legible de la aplicación (ej. `Bicicletas-Puertanueva`).
2. **Slug / Código:** Identificador único (`com_bicicletas`, `mia_crm`, etc.).
3. **Tipo:** Categoría (`Comercial` o `Uso Propio`).
4. **Estado:** Fase actual (`Idea`, `En Desarrollo`, `En Producción`, `Pausado`).
5. **Base de Datos:** Proyecto y esquema Supabase (`com_bicicletas`, `mia_crm`).
6. **GitHub:** Enlaces a los repositorios de GitHub (Netlify / Lovable).
7. **URL / Producción:** Enlaces a la web en vivo o vista previa.
8. **Stack Técnico:** Frameworks y librerías utilizadas.
9. **Notas / Descripción:** Resumen breve del propósito de la app.
10. **Última Actualización:** Fecha del último cambio registrado (`DD/MM/AAAA`).


---


## 3. Creación de Carpetas por Proyecto
Cada vez que se inicie o registre una aplicación nueva, el asistente debe:
1. **Crear una carpeta dedicada para el proyecto:**
   `.../Apps-Desarrollo/<Nombre-Proyecto>/`
2. **Inicializar una ficha técnica:**
   Crear dentro de la carpeta el archivo `INFO_PROYECTO.md` con los datos principales, enlaces y descripción.
3. **Uso de la carpeta:** Servirá para almacenar documentación, capturas, requisitos, recursos gráficos, hojas de clientes y notas del proyecto.


---


## 4. Cuándo debe Actualizar el Asistente este Registro
El asistente debe actualizar automáticamente la fila del proyecto en el archivo maestro de Drive cuando:
* Se inicie o cree un nuevo proyecto.
* Se configure o migre un nuevo esquema/tabla en Supabase.
* Se cree o conecte un nuevo repositorio de GitHub / Lovable.
* Se despliegue o actualice una URL en producción (Netlify / Vercel / Lovable).
* Cambie el estado o la arquitectura técnica de la aplicación.