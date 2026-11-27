
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError

from app.database import get_session
from app.models import Posicion, Jugador
from app.schemas import PosicionCreate, PosicionRead
from app.cache import invalidar_estadisticas


router = APIRouter(
    prefix="/api/posiciones",
    tags=["Posiciones"]
)


def buscar_posicion(posicion_id, session):
    posicion = session.get(Posicion, posicion_id)

    if not posicion:
        raise HTTPException(
            status_code=404,
            detail="Posicion no encontrada"
        )

    return posicion


def validar_nombre(nombre, session, posicion_id=None):
    existente = session.exec(
        select(Posicion).where(
            Posicion.nombre == nombre
        )
    ).first()

    if existente and existente.id != posicion_id:
        raise HTTPException(
            status_code=409,
            detail="La posicion ya existe"
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


@router.get("/", response_model=list[PosicionRead])
def listar_posiciones(
    session: Session = Depends(get_session)
):
    consulta = select(Posicion).order_by(Posicion.id)

    return session.exec(consulta).all()


@router.get("/{posicion_id}", response_model=PosicionRead)
def obtener_posicion(
    posicion_id: int,
    session: Session = Depends(get_session)
):
    return buscar_posicion(posicion_id, session)


@router.post(
    "/",
    response_model=PosicionRead,
    status_code=201
)
def crear_posicion(
    datos: PosicionCreate,
    session: Session = Depends(get_session)
):
    validar_nombre(datos.nombre, session)

    posicion = Posicion(**datos.model_dump())

    session.add(posicion)

    guardar_cambios(session)

    session.refresh(posicion)

    return posicion


@router.put(
    "/{posicion_id}",
    response_model=PosicionRead
)
def actualizar_posicion(
    posicion_id: int,
    datos: PosicionCreate,
    session: Session = Depends(get_session)
):
    posicion = buscar_posicion(posicion_id, session)

    validar_nombre(
        datos.nombre,
        session,
        posicion_id
    )

    posicion.nombre = datos.nombre
    posicion.descripcion = datos.descripcion

    session.add(posicion)

    guardar_cambios(session)

    session.refresh(posicion)

    return posicion


@router.delete("/{posicion_id}")
def eliminar_posicion(
    posicion_id: int,
    session: Session = Depends(get_session)
):
    posicion = buscar_posicion(posicion_id, session)

    jugador = session.exec(
        select(Jugador).where(
            Jugador.posicion_id == posicion_id
        )
    ).first()

    if jugador:
        raise HTTPException(
            status_code=409,
            detail="No se puede eliminar una posicion con jugadores registrados"
        )

    session.delete(posicion)

    guardar_cambios(session)

    return {
        "mensaje": "Posicion eliminada correctamente"
    }
