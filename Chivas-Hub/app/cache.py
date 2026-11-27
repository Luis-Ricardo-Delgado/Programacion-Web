
import os
import json
import redis

REDIS_URL = os.getenv(
    "REDIS_URL",
    "redis://localhost:6379/0"
)

CACHE_TTL = 300

redis_client = redis.Redis.from_url(
    REDIS_URL,
    decode_responses=True,
    socket_connect_timeout=2,
    socket_timeout=2
)


def redis_disponible():
    try:
        return redis_client.ping()
    except redis.RedisError:
        return False


def obtener_cache(clave):
    try:
        datos = redis_client.get(clave)

        if datos is not None:
            return json.loads(datos)

        return None

    except (redis.RedisError, ValueError):
        return None


def guardar_cache(clave, datos, tiempo=CACHE_TTL):
    try:
        redis_client.setex(
            clave,
            tiempo,
            json.dumps(datos, ensure_ascii=False)
        )

        return True

    except redis.RedisError:
        return False


def eliminar_cache(clave):
    try:
        redis_client.delete(clave)
        return True

    except redis.RedisError:
        return False


def invalidar_estadisticas():
    try:
        redis_client.delete(
            "chivas:ranking",
            "chivas:estadisticas"
        )

        return True

    except redis.RedisError:
        return False
