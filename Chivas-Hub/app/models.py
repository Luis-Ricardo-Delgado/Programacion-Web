
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class Posicion(SQLModel, table=True):
    id: Optional[int] = Field(
        default=None,
        primary_key=True
    )

    nombre: str = Field(
        index=True,
        unique=True,
        max_length=50
    )

    descripcion: str = Field(
        default="",
        max_length=300
    )

    jugadores: List["Jugador"] = Relationship(
        back_populates="posicion"
    )


class Jugador(SQLModel, table=True):
    id: Optional[int] = Field(
        default=None,
        primary_key=True
    )

    nombre: str = Field(
        index=True,
        max_length=100
    )

    dorsal: int = Field(
        ge=1,
        le=99,
        unique=True
    )

    edad: int = Field(
        ge=15,
        le=50
    )

    nacionalidad: str = Field(
        default="Mexicana",
        max_length=60
    )

    goles: int = Field(
        default=0,
        ge=0
    )

    asistencias: int = Field(
        default=0,
        ge=0
    )

    partidos: int = Field(
        default=0,
        ge=0
    )

    calificacion: float = Field(
        default=0,
        ge=0,
        le=10
    )

    fotografia: Optional[str] = Field(
        default=None
    )

    activo: bool = Field(
        default=True
    )

    posicion_id: int = Field(
        foreign_key="posicion.id",
        index=True
    )

    posicion: Optional[Posicion] = Relationship(
        back_populates="jugadores"
    )
