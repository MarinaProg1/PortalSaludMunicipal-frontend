# Portal de Salud Municipal - Frontend

Aplicación web para administrar turnos y agendas de un centro de salud municipal. Reúne en una sola interfaz las tareas de administración, recepción, atención médica y autogestión de pacientes.

## Objetivo del sistema

El portal organiza el recorrido de atención: el personal configura profesionales y horarios, asigna turnos, y los médicos pueden revisar sus pacientes, registrar atenciones y consultar información clínica. Cada paciente también cuenta con un espacio propio para gestionar sus turnos y datos personales.

## Módulos funcionales

### 1. Acceso y permisos

- Inicio de sesión y cierre de sesión.
- La sesión se mantiene mediante un token de autenticación.
- El menú y las rutas disponibles dependen del rol: **ADMIN**, **RECEPCIONISTA**, **MEDICO** o **PACIENTE**.
- Algunas rutas requieren autenticación y otras verifican que el usuario tenga un rol autorizado.
- Si la cuenta debe actualizar su contraseña, el sistema dirige al usuario al cambio de contraseña.

### 2. Gestión de turnos

Es el módulo central para organizar la atención médica. Incluye:

- **Todos los turnos:** consulta y administración de turnos activos, con búsqueda y acciones disponibles según el rol.
- **Turnos del día:** vista de la agenda correspondiente a la fecha actual.
- **Búsqueda por fecha:** consulta de los turnos de un día elegido.
- **Turnos históricos pendientes:** revisión de turnos anteriores que todavía figuran pendientes de atención o cancelación.
- **Asignación de turnos:** selección de especialidad, profesional, fecha y horario disponible; luego se completa el registro del turno.
- **Detalle y edición:** consulta de la información del turno y actualización de sus datos.
- **Reprogramación:** bandeja de turnos afectados por modificaciones o excepciones en la agenda.

Los listados usan paginación del servidor. Por defecto muestran 10 resultados por página y permiten elegir 10, 20 o 50.

### 3. Agendas y disponibilidad

Permite consultar los horarios de atención agrupados por profesional. Desde la agenda se puede explorar la disponibilidad mensual y los horarios libres para una fecha. El personal autorizado puede configurar los bloques de atención de cada médico.

### 4. Excepciones de agenda

Registra situaciones que modifican la disponibilidad habitual de un profesional, como días no laborables, licencias o cambios de horario. Los turnos afectados pueden consultarse en la bandeja de reprogramación.

### 5. Pacientes

El personal administrativo puede registrar y actualizar pacientes; los usuarios autorizados pueden consultar su ficha. El listado permite buscar pacientes y consultar datos de contacto y obra social. La ficha reúne información relacionada con la atención del paciente.

### 6. Médicos

Incluye el listado de profesionales, sus datos de contacto y matrícula, especialidades y estado. El personal autorizado puede registrar, editar, consultar o desactivar profesionales.

### 7. Especialidades

Administra el catálogo de especialidades disponibles en el centro de salud. Las especialidades se utilizan, entre otras cosas, para filtrar profesionales al asignar un turno.

### 8. Obras sociales

Mantiene el catálogo de obras sociales y sus datos de contacto. Esta información puede asociarse a la ficha del paciente y consultarse durante la gestión administrativa.

### 9. Atención médica y consultas

El médico puede abrir la atención asociada a un turno, revisar los datos del paciente y registrar la consulta. También existe un listado de consultas médicas para revisar las atenciones registradas.

### 10. Historial médico

Permite consultar y mantener la información clínica del paciente, como grupo sanguíneo, alergias, medicación actual, enfermedades crónicas y observaciones. El historial complementa los datos de las consultas y la ficha del paciente.

### 11. Portal del paciente

El paciente dispone de un espacio privado para:

- Consultar sus próximos turnos y su historial.
- Ver el detalle de un turno.
- Iniciar la solicitud de un nuevo turno a partir de la disponibilidad publicada.
- Consultar y actualizar los datos de su perfil.

## Recorrido general para una presentación

1. Iniciar sesión y mostrar cómo el rol define la pantalla inicial y las opciones disponibles.
2. Desde el módulo de turnos, revisar la agenda del día o buscar turnos por fecha.
3. Mostrar cómo se seleccionan especialidad, médico y horario para asignar un turno.
4. Desde el rol médico, abrir la bandeja de pacientes y acceder a una atención o al historial clínico.
5. Desde el portal del paciente, consultar turnos y revisar los datos del perfil.
6. Mostrar cómo una excepción de agenda puede generar turnos que requieren reprogramación.

## Organización del frontend

- `src/routes`: rutas de la aplicación y restricciones de acceso.
- `src/context`: estado compartido de autenticación y usuario.
- `src/components`: pantallas y componentes, organizados por módulo funcional.
- `src/services`: comunicación con los servicios de la API.
- `src/config/axios.ts`: configuración del cliente HTTP y envío del token.
- `src/constants`: menús por rol y componentes reutilizables de interfaz.
- `src/utils`: funciones auxiliares compartidas.

## Tecnologías

- React y TypeScript.
- Vite para desarrollo y compilación.
- React Router para navegación.
- Axios para comunicación con la API.
- Bootstrap y React Icons para la interfaz.

## Ejecución local

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Crear un archivo `.env` basado en `.env.example` y configurar la URL del backend:

   ```env
   VITE_API_URL=http://localhost:3000
   ```

3. Iniciar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

Comandos adicionales:

```bash
npm run build
npm run lint
```

## Despliegue en Render

El frontend se publica como un **Static Site**. El archivo `render.yaml` ya configura
la compilación, la carpeta `dist`, la variable de entorno de la API y la regla de
rewrite necesaria para que React Router funcione al abrir o recargar rutas internas.

1. Subir estos cambios a la rama que se vaya a desplegar en GitHub.
2. En Render, elegir **New +** → **Blueprint** y conectar el repositorio.
3. Seleccionar la rama y confirmar la creación del servicio definido en `render.yaml`.
   Si Render pide `VITE_API_URL`, ingresar la URL pública base del backend (por
   ejemplo, `https://mi-api.onrender.com`; agregar el prefijo `/api` solo si el
   backend lo requiere).
4. Esperar a que termine el primer deploy y abrir la URL `onrender.com` que muestra
   el servicio.

`VITE_API_URL` se incorpora durante la compilación: si cambia, actualizarla en
**Environment** y volver a desplegar. No poner secretos en variables `VITE_*`, ya
que quedan visibles para quienes cargan la aplicación. El backend debe estar
desplegado por separado, aceptar solicitudes desde el dominio del frontend mediante
CORS y usar HTTPS. Si el `package.json` está en una subcarpeta del repositorio
conectado, configurar esa carpeta como **Root Directory** del servicio en Render.
