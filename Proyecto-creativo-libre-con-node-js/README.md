## Proyecto Creativo Libre con Node.js

Proyecto realizado por Luis Ricardo Delgado Sevilla.

## Descripción

FocusForge es una aplicación web desarrollada con Node.js para registrar sesiones de estudio y visualizar el progreso del usuario.

La idea del proyecto es poder conocer cuánto tiempo se dedica a cada materia y llevar un registro de las sesiones realizadas.

## Funciones

- Registrar sesiones de estudio.
- Registrar materia.
- Registrar duración de la sesión.
- Registrar nivel de energía.
- Agregar notas.
- Eliminar sesiones.
- Mostrar historial.
- Calcular tiempo total.
- Mostrar número total de sesiones.
- Detectar la materia con mayor tiempo acumulado.
- Calcular energía promedio.
- Mostrar distribución por materia.
- Generar recomendaciones.
- Cambiar entre modo claro y oscuro.

## Tecnologías utilizadas

- Node.js
- Express
- HTML
- CSS
- JavaScript
- API REST
- JSON

## Ejecución

Primero instalar Node.js.

Después abrir la terminal dentro de la carpeta del proyecto y ejecutar:

npm install

Después ejecutar:

npm start

Finalmente abrir:

http://localhost:3000

## Decisiones del proyecto

Elegí realizar una aplicación relacionada con el estudio porque es algo que puedo utilizar como estudiante.

Node.js se utiliza como servidor principal y permite registrar, consultar y eliminar las sesiones mediante una API.

También agregué estadísticas para hacer el proyecto más completo y no dejarlo solamente como un formulario.

## Desafíos

Uno de los principales retos fue hacer que los datos registrados se actualizaran automáticamente en las estadísticas.

Para solucionarlo, la aplicación vuelve a consultar la información del servidor después de agregar o eliminar una sesión.

También se trabajó en un diseño responsive para que pueda utilizarse en computadora o celular.

## Autor

Luis Ricardo Delgado Sevilla
