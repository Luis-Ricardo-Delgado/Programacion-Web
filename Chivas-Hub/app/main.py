
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.database import crear_db
from app.routers import jugadores, posiciones, estadisticas

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
UPLOAD_DIR = STATIC_DIR / "uploads"

STATIC_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    crear_db()
    yield


app = FastAPI(
    title="Chivas Hub API",
    description="API para administrar jugadores, posiciones y estadísticas de las Chivas de Guadalajara.",
    version="1.0.0",
    lifespan=lifespan,
    contact={
        "name": "Luis Ricardo Delgado Sevilla"
    }
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(jugadores.router)
app.include_router(posiciones.router)
app.include_router(estadisticas.router)

app.mount(
    "/static",
    StaticFiles(directory=str(STATIC_DIR)),
    name="static"
)


@app.get("/", include_in_schema=False)
def inicio():
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/api")
def informacion():
    return {
        "nombre": "Chivas Hub",
        "version": "1.0.0",
        "estado": "Activo",
        "documentacion": "/docs",
        "autor": "Luis Ricardo Delgado Sevilla"
    }


@app.get("/health", tags=["Sistema"])
def health():
    return {
        "status": "ok",
        "servicio": "Chivas Hub"
    }


@app.exception_handler(500)
async def error_interno(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Error interno del servidor",
            "mensaje": "No fue posible completar la solicitud."
        }
    )
