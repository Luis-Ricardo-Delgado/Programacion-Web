
from fastapi import APIRouter, Depends, Response
from sqlmodel import Session, select

from app.database import get_session
from app.models import Jugador, Posicion
from app.cache import (
    obtener_cache,
    guardar_cache,
    redis_disponible
)


router = APIRouter(
    prefix="/api/estadisticas",
    tags=["Estadisticas"]
)


@router.get("/")
def estadisticas_generales(
    response: Response,
    session: Session = Depends(get_session)
):
    clave = "chivas:estadisticas"

    cache = obtener_cache(clave)

    if cache is not None:
        response.headers["X-Cache"] = "HIT"
        return cache

    jugadores = session.exec(
        select(Jugador)
    ).all()

    posiciones = session.exec(
        select(Posicion)
    ).all()

    total = len(jugadores)

    resultado = {
        "total_jugadores": total,

        "jugadores_activos": sum(
            1 for j in jugadores if j.activo
        ),

        "total_posiciones": len(posiciones),

        "total_goles": sum(
            j.goles for j in jugadores
        ),

        "total_asistencias": sum(
            j.asistencias for j in jugadores
        ),

        "promedio_edad": round(
            sum(j.edad for j in jugadores) / total,
            2
        ) if total else 0,

        "promedio_calificacion": round(
            sum(j.calificacion for j in jugadores) / total,
            2
        ) if total else 0,

        "jugadores_por_posicion": [
            {
                "posicion": posicion.nombre,
                "cantidad": sum(
                    1 for j in jugadores
                    if j.posicion_id == posicion.id
                )
            }
            for posicion in posiciones
        ]
    }

    guardar_cache(clave, resultado)

    response.headers["X-Cache"] = "MISS"

    return resultado


@router.get("/ranking")
def ranking_jugadores(
    response: Response,
    session: Session = Depends(get_session)
):
    clave = "chivas:ranking"

    cache = obtener_cache(clave)

    if cache is not None:
        response.headers["X-Cache"] = "HIT"
        return cache

    jugadores = session.exec(
        select(Jugador).order_by(
            Jugador.calificacion.desc(),
            Jugador.goles.desc(),
            Jugador.asistencias.desc(),
            Jugador.id
        ).limit(10)
    ).all()

    ranking = [
        {
            "puesto": indice + 1,
            "id": jugador.id,
            "nombre": jugador.nombre,
            "dorsal": jugador.dorsal,
            "calificacion": jugador.calificacion,
            "goles": jugador.goles,
            "asistencias": jugador.asistencias,
            "fotografia": jugador.fotografia
        }
        for indice, jugador in enumerate(jugadores)
    ]

    guardar_cache(clave, ranking)

    response.headers["X-Cache"] = "MISS"

    return ranking


@router.get("/goleadores")
def goleadores(
    session: Session = Depends(get_session)
):
    jugadores = session.exec(
        select(Jugador).order_by(
            Jugador.goles.desc(),
            Jugador.id
        ).limit(5)
    ).all()

    return [
        {
            "nombre": jugador.nombre,
            "dorsal": jugador.dorsal,
            "goles": jugador.goles
        }
        for jugador in jugadores
    ]


@router.get("/asistencias")
def mejores_asistencias(
    session: Session = Depends(get_session)
):
    jugadores = session.exec(
        select(Jugador).order_by(
            Jugador.asistencias.desc(),
            Jugador.id
        ).limit(5)
    ).all()

    return [
        {
            "nombre": jugador.nombre,
            "dorsal": jugador.dorsal,
            "asistencias": jugador.asistencias
        }
        for jugador in jugadores
    ]


@router.get("/redis")
def estado_redis():
    disponible = redis_disponible()

    return {
        "servicio": "Redis",
        "conectado": disponible,
        "estado": "Activo" if disponible else "Desconectado",
        "duracion_cache_segundos": 300
    }
