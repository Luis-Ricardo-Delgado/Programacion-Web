
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator
from jsonschema import validate


class PosicionCreate(BaseModel):
    nombre: str = Field(min_length=3, max_length=50)
    descripcion: str = Field(default="", max_length=300)

    @field_validator("nombre")
    @classmethod
    def validar_nombre(cls, valor):
        valor = valor.strip()

        if len(valor) < 3:
            raise ValueError("La posicion debe tener al menos 3 caracteres")

        return valor


class PosicionRead(PosicionCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int


class JugadorCreate(BaseModel):
    nombre: str = Field(min_length=3, max_length=100)
    dorsal: int = Field(ge=1, le=99)
    edad: int = Field(ge=15, le=50)
    nacionalidad: str = Field(default="Mexicana", max_length=60)
    goles: int = Field(default=0, ge=0)
    asistencias: int = Field(default=0, ge=0)
    partidos: int = Field(default=0, ge=0)
    calificacion: float = Field(default=0, ge=0, le=10)
    activo: bool = True
    posicion_id: int = Field(gt=0)

    @field_validator("nombre")
    @classmethod
    def validar_nombre(cls, valor):
        valor = valor.strip()

        if len(valor) < 3:
            raise ValueError("El nombre debe tener al menos 3 caracteres")

        if not all(c.isalpha() or c in " .'-" for c in valor):
            raise ValueError("El nombre contiene caracteres no permitidos")

        return valor


class JugadorUpdate(JugadorCreate):
    pass


class JugadorRead(JugadorCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    fotografia: Optional[str] = None


class CalificacionUpdate(BaseModel):
    calificacion: float = Field(ge=0, le=10)


JUGADOR_JSON_SCHEMA = {
    "type": "object",
    "properties": {
        "nombre": {
            "type": "string",
            "minLength": 3,
            "maxLength": 100
        },
        "dorsal": {
            "type": "integer",
            "minimum": 1,
            "maximum": 99
        },
        "edad": {
            "type": "integer",
            "minimum": 15,
            "maximum": 50
        },
        "nacionalidad": {
            "type": "string",
            "maxLength": 60
        },
        "goles": {
            "type": "integer",
            "minimum": 0
        },
        "asistencias": {
            "type": "integer",
            "minimum": 0
        },
        "partidos": {
            "type": "integer",
            "minimum": 0
        },
        "calificacion": {
            "type": "number",
            "minimum": 0,
            "maximum": 10
        },
        "activo": {
            "type": "boolean"
        },
        "posicion_id": {
            "type": "integer",
            "minimum": 1
        }
    },
    "required": [
        "nombre",
        "dorsal",
        "edad",
        "posicion_id"
    ],
    "additionalProperties": False
}


def validar_json_jugador(datos):
    validate(
        instance=datos,
        schema=JUGADOR_JSON_SCHEMA
    )

    return datos
