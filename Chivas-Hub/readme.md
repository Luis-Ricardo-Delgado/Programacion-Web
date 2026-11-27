
# 🔴⚪ Chivas Hub | 1906

## Descripción del proyecto

Chivas Hub es una aplicación web desarrollada para administrar
los jugadores del Club Deportivo Guadalajara.

El sistema permite registrar, consultar, modificar y eliminar
jugadores y posiciones, además de almacenar fotografías,
calificaciones y estadísticas individuales.

El proyecto utiliza FastAPI para desarrollar una API REST,
SQLite para almacenar información y Redis para optimizar
las consultas de estadísticas mediante almacenamiento en caché.

## Autor

- Luis Ricardo Delgado Sevilla
- Ingeniería en Computación
- Programación Web

## Funcionalidades

- CRUD completo de jugadores.
- CRUD completo de posiciones.
- Relación entre jugadores y posiciones.
- Registro de goles, asistencias y partidos.
- Calificación de jugadores del 0 al 10.
- Subida de fotografías.
- Búsqueda de jugadores por nombre.
- Filtros por posición y estado.
- Ranking de los mejores jugadores.
- Estadísticas generales de la plantilla.
- Validación de datos con Pydantic y JSON Schema.
- Manejo de errores HTTP.
- Almacenamiento en caché mediante Redis.
- Documentación automática con Swagger.
- Pruebas automatizadas con Pytest.
- Interfaz adaptable a computadoras y celulares.

## Tecnologías utilizadas

| Tecnología | Función |
|------------|---------|
| Python | Lenguaje principal |
| FastAPI | Desarrollo de la API REST |
| SQLite | Base de datos |
| SQLModel | Modelos y consultas |
| Pydantic | Validación de datos |
| JSON Schema | Validación de estructuras JSON |
| Redis | Almacenamiento en caché |
| Docker | Ejecución del servicio Redis |
| Pillow | Procesamiento de imágenes |
| HTML | Estructura de la interfaz |
| CSS | Diseño visual |
| JavaScript | Comunicación con la API |
| Pytest | Pruebas automatizadas |
| Swagger | Documentación de endpoints |

## Estructura del proyecto

    Chivas-Hub/
    ├── app/
    │   ├── __init__.py
    │   ├── main.py
    │   ├── database.py
    │   ├── models.py
    │   ├── schemas.py
    │   ├── cache.py
    │   ├── routers/
    │   │   ├── __init__.py
    │   │   ├── jugadores.py
    │   │   ├── posiciones.py
    │   │   └── estadisticas.py
    │   └── static/
    │       ├── index.html
    │       ├── style.css
    │       └── script.js
    ├── tests/
    │   └── test_api.py
    ├── requirements.txt
    ├── docker-compose.yml
    ├── .gitignore
    └── README.md

## Requisitos de instalación

- Python 3.11 o superior.
- Git.
- Docker Desktop para ejecutar Redis.
- Navegador web.

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Luis-Ricardo-Delgado/Programacion-Web.git
```

### 2. Entrar a la carpeta del proyecto

```bash
cd Programacion-Web/Chivas-Hub
```

### 3. Crear un entorno virtual

```bash
python -m venv venv
```

### 4. Activar el entorno virtual

Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Windows CMD:

```cmd
venv\Scripts\activate.bat
```

Linux o macOS:

```bash
source venv/bin/activate
```

### 5. Instalar las dependencias

```bash
python -m pip install -r requirements.txt
```

### 6. Iniciar Redis

```bash
docker compose up -d
```

### 7. Ejecutar la aplicación

```bash
python -m uvicorn app.main:app --reload
```

## Acceso a la aplicación

- Aplicación web: http://127.0.0.1:8000
- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc
- Estado del servidor: http://127.0.0.1:8000/health
- Información de la API: http://127.0.0.1:8000/api

## Uso de la aplicación

Al iniciar la aplicación, la base de datos se crea
automáticamente.

Primero se deben registrar las posiciones de los jugadores,
por ejemplo:

- Portero.
- Defensa.
- Mediocampista.
- Delantero.

Después se pueden registrar los jugadores, seleccionar su
posición, agregar fotografías y administrar sus estadísticas.

## Endpoints de jugadores

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/jugadores/ | Listar jugadores |
| GET | /api/jugadores/{id} | Consultar jugador |
| POST | /api/jugadores/ | Registrar jugador |
| PUT | /api/jugadores/{id} | Actualizar jugador |
| DELETE | /api/jugadores/{id} | Eliminar jugador |
| PATCH | /api/jugadores/{id}/calificacion | Calificar jugador |
| POST | /api/jugadores/{id}/fotografia | Subir fotografía |

## Endpoints de posiciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/posiciones/ | Listar posiciones |
| GET | /api/posiciones/{id} | Consultar posición |
| POST | /api/posiciones/ | Registrar posición |
| PUT | /api/posiciones/{id} | Actualizar posición |
| DELETE | /api/posiciones/{id} | Eliminar posición |

## Endpoints de estadísticas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/estadisticas/ | Estadísticas generales |
| GET | /api/estadisticas/ranking | Ranking de jugadores |
| GET | /api/estadisticas/goleadores | Mejores goleadores |
| GET | /api/estadisticas/asistencias | Mejores asistentes |
| GET | /api/estadisticas/redis | Estado de Redis |

## Ejemplo de registro de una posición

```json
{
    "nombre": "Delantero",
    "descripcion": "Jugador encargado de atacar y marcar goles"
}
```

## Ejemplo de registro de un jugador

El identificador de la posición debe existir previamente.

Los siguientes datos son ilustrativos.

```json
{
    "nombre": "Javier Hernandez",
    "dorsal": 14,
    "edad": 38,
    "nacionalidad": "Mexicana",
    "posicion_id": 1,
    "goles": 10,
    "asistencias": 5,
    "partidos": 20,
    "calificacion": 8.5,
    "activo": true
}
```

## Base de datos

El sistema utiliza SQLite y SQLModel para almacenar
la información de manera persistente.

La base de datos cuenta con dos entidades principales:

### Posicion

- ID.
- Nombre.
- Descripción.

### Jugador

- ID.
- Nombre.
- Dorsal.
- Edad.
- Nacionalidad.
- Goles.
- Asistencias.
- Partidos.
- Calificación.
- Fotografía.
- Estado.
- ID de posición.

La relación entre ambas entidades es de uno a muchos,
ya que una posición puede tener varios jugadores asociados,
pero cada jugador pertenece a una posición.

## Validación de datos

Se utilizan Pydantic y JSON Schema para comprobar
la estructura y los valores de los datos procesados.

Algunas de las validaciones implementadas son:

- Dorsales entre 1 y 99.
- Dorsales únicos.
- Edad entre 15 y 50 años.
- Calificaciones entre 0 y 10.
- Goles y asistencias no negativos.
- Posiciones existentes.
- Nombres con caracteres válidos.
- Fotografías de máximo 5 MB.

## Manejo de errores HTTP

| Código | Significado |
|--------|-------------|
| 200 | Solicitud exitosa |
| 201 | Recurso creado |
| 400 | Archivo o solicitud inválida |
| 404 | Recurso no encontrado |
| 409 | Conflicto con los datos |
| 413 | Archivo demasiado grande |
| 415 | Formato de archivo no permitido |
| 422 | Error de validación |
| 500 | Error interno del servidor |

## Implementación de Redis

Redis permite almacenar temporalmente los resultados
de las estadísticas generales y el ranking de jugadores.

El tiempo de almacenamiento en caché es de 300 segundos.

Se utilizan las siguientes claves:

- chivas:estadisticas
- chivas:ranking

La caché se invalida cuando se registran, modifican
o eliminan jugadores y posiciones.

Los encabezados HTTP permiten identificar el origen
de los resultados:

- X-Cache: HIT
- X-Cache: MISS

Si Redis no está disponible, la aplicación puede
continuar consultando directamente la base de datos.

## Subida de fotografías

El sistema permite cargar imágenes en los siguientes formatos:

- JPG.
- PNG.
- WEBP.

Las fotografías tienen un límite de 5 MB y son procesadas
mediante Pillow para convertirlas a formato JPEG.

Los archivos se almacenan localmente en:

    app/static/uploads/

## Pruebas automatizadas

El proyecto incluye 30 pruebas automatizadas con Pytest.

Para ejecutarlas:

```bash
python -m pytest -v
```

Las pruebas incluyen:

- Creación, consulta, modificación y eliminación de jugadores.
- Creación, consulta, modificación y eliminación de posiciones.
- Validaciones de datos.
- Manejo de errores HTTP.
- Protección de relaciones.
- Subida de fotografías.
- Estadísticas y rankings.
- Comportamiento de la caché.

Se utiliza una base de datos en memoria para las operaciones
de prueba y se simula el comportamiento de Redis.

## Documentación

FastAPI genera automáticamente la documentación de la API
mediante Swagger UI y ReDoc.

Esto permite consultar y probar los endpoints directamente
desde el navegador.

## Conclusión

Con este proyecto pude aplicar los conocimientos adquiridos
durante el curso de Programación Web, desarrollando una
aplicación que integra una API REST, una base de datos,
validaciones, almacenamiento en caché y una interfaz gráfica.

Decidí realizar el proyecto con temática de las Chivas
porque es un equipo que me gusta y me pareció interesante
combinar mi afición por el fútbol con la programación.

## Aviso

Chivas Hub es un proyecto académico independiente y no
representa una aplicación oficial del Club Deportivo Guadalajara.

---

🔴⚪ De visitante o de local, siempre vamos a estar.

Desarrollado por Luis Ricardo Delgado Sevilla.
