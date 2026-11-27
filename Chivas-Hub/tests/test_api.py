
import pytest

from io import BytesIO
from PIL import Image
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import get_session
from app.routers import jugadores, posiciones, estadisticas


@pytest.fixture
def cliente(monkeypatch, tmp_path):

    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )

    SQLModel.metadata.create_all(engine)

    def session_pruebas():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_session] = session_pruebas

    monkeypatch.setattr(
        jugadores,
        "invalidar_estadisticas",
        lambda: True
    )

    monkeypatch.setattr(
        posiciones,
        "invalidar_estadisticas",
        lambda: True
    )

    monkeypatch.setattr(
        estadisticas,
        "obtener_cache",
        lambda clave: None
    )

    monkeypatch.setattr(
        estadisticas,
        "guardar_cache",
        lambda clave, datos: True
    )

    monkeypatch.setattr(
        jugadores,
        "UPLOAD_DIR",
        tmp_path
    )

    try:
        with TestClient(app) as client:
            yield client
    finally:
        app.dependency_overrides.clear()
        engine.dispose()


@pytest.fixture
def posicion(cliente):

    respuesta = cliente.post(
        "/api/posiciones/",
        json={
            "nombre": "Delantero",
            "descripcion": "Jugador ofensivo"
        }
    )

    assert respuesta.status_code == 201

    return respuesta.json()


@pytest.fixture
def datos_jugador(posicion):

    return {
        "nombre": "Jugador de prueba",
        "dorsal": 14,
        "edad": 25,
        "nacionalidad": "Mexicana",
        "posicion_id": posicion["id"],
        "goles": 10,
        "asistencias": 5,
        "partidos": 20,
        "calificacion": 8.5,
        "activo": True
    }


@pytest.fixture
def jugador(cliente, datos_jugador):

    respuesta = cliente.post(
        "/api/jugadores/",
        json=datos_jugador
    )

    assert respuesta.status_code == 201

    return respuesta.json()


def test_estado_api(cliente):

    respuesta = cliente.get("/health")

    assert respuesta.status_code == 200
    assert respuesta.json()["status"] == "ok"


def test_documentacion(cliente):

    respuesta = cliente.get("/docs")

    assert respuesta.status_code == 200


def test_crear_posicion(posicion):

    assert posicion["nombre"] == "Delantero"
    assert posicion["id"] > 0


def test_listar_posiciones(cliente, posicion):

    respuesta = cliente.get("/api/posiciones/")

    assert respuesta.status_code == 200
    assert len(respuesta.json()) == 1


def test_obtener_posicion(cliente, posicion):

    respuesta = cliente.get(
        f"/api/posiciones/{posicion['id']}"
    )

    assert respuesta.status_code == 200
    assert respuesta.json()["nombre"] == "Delantero"


def test_actualizar_posicion(cliente, posicion):

    respuesta = cliente.put(
        f"/api/posiciones/{posicion['id']}",
        json={
            "nombre": "Defensa",
            "descripcion": "Jugador defensivo"
        }
    )

    assert respuesta.status_code == 200
    assert respuesta.json()["nombre"] == "Defensa"


def test_eliminar_posicion(cliente, posicion):

    respuesta = cliente.delete(
        f"/api/posiciones/{posicion['id']}"
    )

    assert respuesta.status_code == 200

    consulta = cliente.get(
        f"/api/posiciones/{posicion['id']}"
    )

    assert consulta.status_code == 404


def test_posicion_duplicada(cliente, posicion):

    respuesta = cliente.post(
        "/api/posiciones/",
        json={
            "nombre": "Delantero",
            "descripcion": "Duplicado"
        }
    )

    assert respuesta.status_code == 409


def test_crear_jugador(jugador):

    assert jugador["nombre"] == "Jugador de prueba"
    assert jugador["dorsal"] == 14
    assert jugador["calificacion"] == 8.5


def test_listar_jugadores(cliente, jugador):

    respuesta = cliente.get("/api/jugadores/")

    assert respuesta.status_code == 200
    assert len(respuesta.json()) == 1


def test_obtener_jugador(cliente, jugador):

    respuesta = cliente.get(
        f"/api/jugadores/{jugador['id']}"
    )

    assert respuesta.status_code == 200
    assert respuesta.json()["id"] == jugador["id"]


def test_actualizar_jugador(
    cliente,
    jugador,
    datos_jugador
):

    datos_jugador["goles"] = 15

    respuesta = cliente.put(
        f"/api/jugadores/{jugador['id']}",
        json=datos_jugador
    )

    assert respuesta.status_code == 200
    assert respuesta.json()["goles"] == 15


def test_eliminar_jugador(cliente, jugador):

    respuesta = cliente.delete(
        f"/api/jugadores/{jugador['id']}"
    )

    assert respuesta.status_code == 200

    consulta = cliente.get(
        f"/api/jugadores/{jugador['id']}"
    )

    assert consulta.status_code == 404


def test_jugador_inexistente(cliente):

    respuesta = cliente.get(
        "/api/jugadores/9999"
    )

    assert respuesta.status_code == 404


def test_dorsal_duplicado(
    cliente,
    jugador,
    datos_jugador
):

    datos_jugador["nombre"] = "Otro jugador"

    respuesta = cliente.post(
        "/api/jugadores/",
        json=datos_jugador
    )

    assert respuesta.status_code == 409


def test_edad_invalida(cliente, datos_jugador):

    datos_jugador["edad"] = 10

    respuesta = cliente.post(
        "/api/jugadores/",
        json=datos_jugador
    )

    assert respuesta.status_code == 422


def test_nombre_invalido(cliente, datos_jugador):

    datos_jugador["nombre"] = "Jugador123"

    respuesta = cliente.post(
        "/api/jugadores/",
        json=datos_jugador
    )

    assert respuesta.status_code == 422


def test_posicion_inexistente(cliente, datos_jugador):

    datos_jugador["posicion_id"] = 9999

    respuesta = cliente.post(
        "/api/jugadores/",
        json=datos_jugador
    )

    assert respuesta.status_code == 404


def test_calificar_jugador(cliente, jugador):

    respuesta = cliente.patch(
        f"/api/jugadores/{jugador['id']}/calificacion",
        json={"calificacion": 9.5}
    )

    assert respuesta.status_code == 200
    assert respuesta.json()["calificacion"] == 9.5


def test_calificacion_invalida(cliente, jugador):

    respuesta = cliente.patch(
        f"/api/jugadores/{jugador['id']}/calificacion",
        json={"calificacion": 15}
    )

    assert respuesta.status_code == 422


def test_buscar_jugador(cliente, jugador):

    respuesta = cliente.get(
        "/api/jugadores/",
        params={"nombre": "prueba"}
    )

    assert respuesta.status_code == 200
    assert len(respuesta.json()) == 1


def test_filtrar_posicion(cliente, jugador, posicion):

    respuesta = cliente.get(
        "/api/jugadores/",
        params={"posicion_id": posicion["id"]}
    )

    assert respuesta.status_code == 200
    assert len(respuesta.json()) == 1


def test_proteger_posicion(cliente, jugador, posicion):

    respuesta = cliente.delete(
        f"/api/posiciones/{posicion['id']}"
    )

    assert respuesta.status_code == 409


def test_estadisticas(cliente, jugador):

    respuesta = cliente.get(
        "/api/estadisticas/"
    )

    assert respuesta.status_code == 200

    datos = respuesta.json()

    assert datos["total_jugadores"] == 1
    assert datos["total_goles"] == 10
    assert datos["total_asistencias"] == 5


def test_ranking(cliente, jugador):

    respuesta = cliente.get(
        "/api/estadisticas/ranking"
    )

    assert respuesta.status_code == 200
    assert respuesta.json()[0]["puesto"] == 1
    assert respuesta.json()[0]["id"] == jugador["id"]


def test_goleadores(cliente, jugador):

    respuesta = cliente.get(
        "/api/estadisticas/goleadores"
    )

    assert respuesta.status_code == 200
    assert respuesta.json()[0]["goles"] == 10


def test_asistencias(cliente, jugador):

    respuesta = cliente.get(
        "/api/estadisticas/asistencias"
    )

    assert respuesta.status_code == 200
    assert respuesta.json()[0]["asistencias"] == 5


def test_subir_fotografia(cliente, jugador):

    archivo = BytesIO()

    imagen = Image.new(
        "RGB",
        (100, 100),
        color="red"
    )

    imagen.save(archivo, format="JPEG")

    archivo.seek(0)

    respuesta = cliente.post(
        f"/api/jugadores/{jugador['id']}/fotografia",
        files={
            "archivo": (
                "jugador.jpg",
                archivo,
                "image/jpeg"
            )
        }
    )

    assert respuesta.status_code == 200
    assert respuesta.json()["fotografia"].endswith(".jpg")


def test_archivo_invalido(cliente, jugador):

    respuesta = cliente.post(
        f"/api/jugadores/{jugador['id']}/fotografia",
        files={
            "archivo": (
                "archivo.txt",
                b"Archivo de prueba",
                "text/plain"
            )
        }
    )

    assert respuesta.status_code == 415


def test_cache_hit(cliente, monkeypatch):

    datos_cache = {
        "total_jugadores": 5,
        "total_goles": 20
    }

    monkeypatch.setattr(
        estadisticas,
        "obtener_cache",
        lambda clave: datos_cache
    )

    respuesta = cliente.get(
        "/api/estadisticas/"
    )

    assert respuesta.status_code == 200
    assert respuesta.headers["X-Cache"] == "HIT"
    assert respuesta.json() == datos_cache
