
from pathlib import Path
from uuid import uuid4
from io import BytesIO

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from jsonschema import ValidationError
from PIL import Image, UnidentifiedImageError

from app.database import get_session
from app.models import Jugador, Posicion
from app.schemas import (
    JugadorCreate,
    JugadorUpdate,
    JugadorRead,
    CalificacionUpdate,
    validar_json_jugador
)
from app.cache import invalidar_estadisticas


router = APIRouter(
    prefix="/api/jugadores",
    tags=["Jugadores"]
)

UPLOAD_DIR = Path(__file__).resolve().parent.parent / "static" / "uploads"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def buscar_jugador(jugador_id, session):
    jugador = session.get(Jugador, jugador_id)

    if not jugador:
        raise HTTPException(
            status_code=404,
            detail="Jugador no encontrado"
        )

    return jugador


def validar_datos(datos, session, jugador_id=None):
    try:
        validar_json_jugador(datos.model_dump())
    except ValidationError as error:
        raise HTTPException(
            status_code=422,
            detail=error.message
        )

    posicion = session.get(Posicion, datos.posicion_id)

    if not posicion:
        raise HTTPException(
            status_code=404,
            detail="La posicion no existe"
        )

    existente = session.exec(
        select(Jugador).where(
            Jugador.dorsal == datos.dorsal
        )
    ).first()

    if existente and existente.id != jugador_id:
        raise HTTPException(
            status_code=409,
            detail="El dorsal ya esta registrado"
        )


def guardar_cambios(session):
    try:
        session.commit()
    except IntegrityError:
        session.rollback()

        raise HTTPException(
            status_code=409,
            detail="Conflicto con los datos registrados"
        )

    invalidar_estadisticas()


@router.get("/", response_model=list[JugadorRead])
def listar_jugadores(
    nombre: str = "",
    posicion_id: int | None = None,
    activo: bool | None = None,
    offset: int = Query(default=0, ge=0),
    limite: int = Query(default=100, ge=1, le=100),
    session: Session = Depends(get_session)
):
    consulta = select(Jugador)

    if nombre:
        consulta = consulta.where(
            Jugador.nombre.contains(nombre)
        )

    if posicion_id is not None:
        consulta = consulta.where(
            Jugador.posicion_id == posicion_id
        )

    if activo is not None:
        consulta = consulta.where(
            Jugador.activo == activo
        )

    consulta = consulta.order_by(
        Jugador.dorsal
    ).offset(offset).limit(limite)

    return session.exec(consulta).all()


@router.get("/{jugador_id}", response_model=JugadorRead)
def obtener_jugador(
    jugador_id: int,
    session: Session = Depends(get_session)
):
    return buscar_jugador(jugador_id, session)


@router.post(
    "/",
    response_model=JugadorRead,
    status_code=201
)
def crear_jugador(
    datos: JugadorCreate,
    session: Session = Depends(get_session)
):
    validar_datos(datos, session)

    jugador = Jugador(**datos.model_dump())

    session.add(jugador)

    guardar_cambios(session)

    session.refresh(jugador)

    return jugador


@router.put("/{jugador_id}", response_model=JugadorRead)
def actualizar_jugador(
    jugador_id: int,
    datos: JugadorUpdate,
    session: Session = Depends(get_session)
):
    jugador = buscar_jugador(jugador_id, session)

    validar_datos(datos, session, jugador_id)

    for campo, valor in datos.model_dump().items():
        setattr(jugador, campo, valor)

    session.add(jugador)

    guardar_cambios(session)

    session.refresh(jugador)

    return jugador


@router.delete("/{jugador_id}")
def eliminar_jugador(
    jugador_id: int,
    session: Session = Depends(get_session)
):
    jugador = buscar_jugador(jugador_id, session)

    fotografia = jugador.fotografia

    session.delete(jugador)

    guardar_cambios(session)

    if fotografia:
        archivo = UPLOAD_DIR / Path(fotografia).name
        archivo.unlink(missing_ok=True)

    return {
        "mensaje": "Jugador eliminado correctamente"
    }


@router.patch(
    "/{jugador_id}/calificacion",
    response_model=JugadorRead
)
def calificar_jugador(
    jugador_id: int,
    datos: CalificacionUpdate,
    session: Session = Depends(get_session)
):
    jugador = buscar_jugador(jugador_id, session)

    jugador.calificacion = datos.calificacion

    session.add(jugador)

    guardar_cambios(session)

    session.refresh(jugador)

    return jugador


@router.post("/{jugador_id}/fotografia")
async def subir_fotografia(
    jugador_id: int,
    archivo: UploadFile = File(...),
    session: Session = Depends(get_session)
):
    jugador = buscar_jugador(jugador_id, session)

    formatos = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ]

    if archivo.content_type not in formatos:
        raise HTTPException(
            status_code=415,
            detail="Solo se permiten imagenes JPG, PNG y WEBP"
        )

    limite = 5 * 1024 * 1024

    contenido = await archivo.read(limite + 1)

    await archivo.close()

    if len(contenido) > limite:
        raise HTTPException(
            status_code=413,
            detail="La imagen no puede superar los 5 MB"
        )

    nombre_archivo = f"{uuid4().hex}.jpg"

    destino = UPLOAD_DIR / nombre_archivo

    try:
        with Image.open(BytesIO(contenido)) as imagen:

            if imagen.format not in ["JPEG", "PNG", "WEBP"]:
                raise ValueError("Formato no permitido")

            if imagen.width * imagen.height > 20000000:
                raise ValueError("Imagen demasiado grande")

            imagen = imagen.convert("RGB")

            imagen.thumbnail((1200, 1200))

            imagen.save(
                destino,
                format="JPEG",
                quality=90
            )

    except (
        UnidentifiedImageError,
        OSError,
        ValueError,
        Image.DecompressionBombError
    ):
        destino.unlink(missing_ok=True)

        raise HTTPException(
            status_code=400,
            detail="El archivo no es una imagen valida"
        )

    fotografia_anterior = jugador.fotografia

    jugador.fotografia = f"/static/uploads/{nombre_archivo}"

    session.add(jugador)

    try:
        guardar_cambios(session)
    except Exception:
        destino.unlink(missing_ok=True)
        raise

    if fotografia_anterior:
        anterior = UPLOAD_DIR / Path(fotografia_anterior).name
        anterior.unlink(missing_ok=True)

    session.refresh(jugador)

    return {
        "mensaje": "Fotografia guardada correctamente",
        "fotografia": jugador.fotografia
    }
