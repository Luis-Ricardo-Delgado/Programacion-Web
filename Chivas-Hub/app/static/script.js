
const API = "/api";

const $ = (id) => document.getElementById(id);

let jugadores = [];
let posiciones = [];
let temporizador;
let consultaActual = 0;

function escapar(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caracter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caracter]);
}

async function solicitar(ruta, opciones = {}) {
    const respuesta = await fetch(`${API}${ruta}`, opciones);

    if (!respuesta.ok) {
        const error = await respuesta.json().catch(() => ({}));

        let mensaje = error.detail || "Error en la solicitud";

        if (Array.isArray(mensaje)) {
            mensaje = mensaje.map(e => e.msg).join(", ");
        }

        throw new Error(mensaje);
    }

    const datos = respuesta.status === 204
        ? null
        : await respuesta.json();

    return {
        datos,
        cache: respuesta.headers.get("X-Cache")
    };
}

function notificar(mensaje, error = false) {
    const elemento = $("notificacion");

    elemento.textContent = mensaje;

    elemento.className = error
        ? "visible error"
        : "visible";

    clearTimeout(temporizador);

    temporizador = setTimeout(() => {
        elemento.className = "";
    }, 4500);
}

function opcionesJSON(metodo, datos) {
    return {
        method: metodo,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
    };
}

async function cargarPosiciones() {
    const respuesta = await solicitar("/posiciones/");

    posiciones = respuesta.datos;

    const filtroAnterior = $("filtroPosicion").value;

    const opciones = posiciones.map(p => `
        <option value="${p.id}">
            ${escapar(p.nombre)}
        </option>
    `).join("");

    $("filtroPosicion").innerHTML = `
        <option value="">Todas las posiciones</option>
        ${opciones}
    `;

    $("filtroPosicion").value = filtroAnterior;

    $("posicionId").innerHTML = opciones;

    $("listaPosiciones").innerHTML = posiciones.length
        ? posiciones.map(p => `
            <tr>
                <td>${p.id}</td>
                <td><strong>${escapar(p.nombre)}</strong></td>
                <td>${escapar(p.descripcion)}</td>
                <td>
                    <button class="btn secondary"
                        onclick="editarPosicion(${p.id})">
                        Editar
                    </button>

                    <button class="btn danger"
                        onclick="eliminarPosicion(${p.id})">
                        Eliminar
                    </button>
                </td>
            </tr>
        `).join("")
        : `<tr>
            <td colspan="4">No hay posiciones registradas.</td>
           </tr>`;
}

async function cargarJugadores() {
    const consulta = ++consultaActual;

    const parametros = new URLSearchParams();

    const nombre = $("buscarJugador").value.trim();
    const posicion = $("filtroPosicion").value;
    const activo = $("filtroActivo").value;

    if (nombre) parametros.set("nombre", nombre);
    if (posicion) parametros.set("posicion_id", posicion);
    if (activo !== "") parametros.set("activo", activo);

    const respuesta = await solicitar(
        `/jugadores/?${parametros.toString()}`
    );

    if (consulta !== consultaActual) return;

    jugadores = respuesta.datos;

    mostrarJugadores();
}

function mostrarJugadores() {
    if (!jugadores.length) {
        $("listaJugadores").innerHTML = `
            <div class="empty">
                <h3>No hay jugadores disponibles</h3>
                <p>Registra un jugador o modifica los filtros.</p>
            </div>
        `;

        return;
    }

    $("listaJugadores").innerHTML = jugadores.map(j => {
        const posicion = posiciones.find(
            p => p.id === j.posicion_id
        );

        const fotografia = j.fotografia &&
            /^\/static\/uploads\/[a-f0-9]+\.jpg$/.test(j.fotografia)
            ? `<img src="${escapar(j.fotografia)}"
                    alt="${escapar(j.nombre)}">`
            : `<div class="player-placeholder">⚽</div>`;

        return `
            <article class="player-card">

                <div class="player-image">

                    ${fotografia}

                    <span class="dorsal">
                        ${j.dorsal}
                    </span>

                    <span class="player-status
                        ${j.activo ? "" : "inactive"}">

                        ${j.activo ? "Activo" : "Inactivo"}

                    </span>

                </div>

                <div class="player-content">

                    <h3>${escapar(j.nombre)}</h3>

                    <span class="player-position">
                        ${escapar(posicion?.nombre || "Sin posición")}
                    </span>

                    <p class="player-meta">
                        ${j.edad} años ·
                        ${escapar(j.nacionalidad)}
                    </p>

                    <div class="player-stats">

                        <div>
                            <strong>${j.partidos}</strong>
                            <small>Partidos</small>
                        </div>

                        <div>
                            <strong>${j.goles}</strong>
                            <small>Goles</small>
                        </div>

                        <div>
                            <strong>${j.asistencias}</strong>
                            <small>Asistencias</small>
                        </div>

                    </div>

                    <div class="player-rating">
                        ⭐ ${Number(j.calificacion).toFixed(1)} / 10
                    </div>

                    <div class="player-actions">

                        <button class="btn secondary"
                            onclick="editarJugador(${j.id})">
                            Editar
                        </button>

                        <button class="btn primary"
                            onclick="calificarJugador(${j.id})">
                            Calificar
                        </button>

                        <button class="btn danger"
                            onclick="eliminarJugador(${j.id})">
                            Eliminar
                        </button>

                    </div>

                </div>

            </article>
        `;
    }).join("");
}

function nuevoJugador() {
    if (!posiciones.length) {
        notificar("Primero debes registrar una posición.", true);

        nuevaPosicion();

        return;
    }

    $("formJugador").reset();
    $("jugadorId").value = "";
    $("tituloJugador").textContent = "Registrar jugador";

    $("modalJugador").showModal();
}

async function editarJugador(id) {
    try {
        const respuesta = await solicitar(`/jugadores/${id}`);

        const j = respuesta.datos;

        $("formJugador").reset();

        $("jugadorId").value = j.id;
        $("nombre").value = j.nombre;
        $("dorsal").value = j.dorsal;
        $("edad").value = j.edad;
        $("nacionalidad").value = j.nacionalidad;
        $("posicionId").value = j.posicion_id;
        $("partidos").value = j.partidos;
        $("goles").value = j.goles;
        $("asistencias").value = j.asistencias;
        $("calificacion").value = j.calificacion;
        $("activo").value = String(j.activo);

        $("tituloJugador").textContent = "Editar jugador";

        $("modalJugador").showModal();

    } catch (error) {
        notificar(error.message, true);
    }
}

$("formJugador").addEventListener("submit", async evento => {
    evento.preventDefault();

    const boton = evento.target.querySelector('[type="submit"]');

    boton.disabled = true;

    try {
        const id = $("jugadorId").value;

        const datos = {
            nombre: $("nombre").value.trim(),
            dorsal: Number($("dorsal").value),
            edad: Number($("edad").value),
            nacionalidad: $("nacionalidad").value.trim(),
            posicion_id: Number($("posicionId").value),
            partidos: Number($("partidos").value),
            goles: Number($("goles").value),
            asistencias: Number($("asistencias").value),
            calificacion: Number($("calificacion").value),
            activo: $("activo").value === "true"
        };

        const archivo = $("fotografia").files[0];

        if (archivo && archivo.size > 5 * 1024 * 1024) {
            throw new Error("La fotografía supera los 5 MB.");
        }

        const respuesta = await solicitar(
            id ? `/jugadores/${id}` : "/jugadores/",
            opcionesJSON(id ? "PUT" : "POST", datos)
        );

        $("jugadorId").value = respuesta.datos.id;

        if (archivo) {
            const formulario = new FormData();

            formulario.append("archivo", archivo);

            try {
                await solicitar(
                    `/jugadores/${respuesta.datos.id}/fotografia`,
                    {
                        method: "POST",
                        body: formulario
                    }
                );
            } catch (error) {
                notificar(
                    "Jugador guardado, pero la foto falló: " +
                    error.message,
                    true
                );

                await cargarTodo();

                return;
            }
        }

        $("modalJugador").close();

        notificar(
            id
                ? "Jugador actualizado correctamente"
                : "Jugador registrado correctamente"
        );

        await cargarTodo();

    } catch (error) {
        notificar(error.message, true);
    } finally {
        boton.disabled = false;
    }
});

async function eliminarJugador(id) {
    if (!confirm("¿Seguro que deseas eliminar este jugador?")) {
        return;
    }

    try {
        await solicitar(`/jugadores/${id}`, {
            method: "DELETE"
        });

        notificar("Jugador eliminado correctamente");

        await cargarTodo();

    } catch (error) {
        notificar(error.message, true);
    }
}

async function calificarJugador(id) {
    const jugador = jugadores.find(j => j.id === id);

    const valor = prompt(
        "Ingresa una calificación del 0 al 10:",
        jugador?.calificacion ?? 0
    );

    if (valor === null) return;

    const calificacion = Number(valor);

    if (
        valor.trim() === "" ||
        !Number.isFinite(calificacion) ||
        calificacion < 0 ||
        calificacion > 10
    ) {
        notificar("La calificación debe ser entre 0 y 10.", true);

        return;
    }

    try {
        await solicitar(
            `/jugadores/${id}/calificacion`,
            opcionesJSON("PATCH", { calificacion })
        );

        notificar("Calificación actualizada");

        await cargarTodo();

    } catch (error) {
        notificar(error.message, true);
    }
}

function nuevaPosicion() {
    $("formPosicion").reset();

    $("editarPosicionId").value = "";

    $("tituloPosicion").textContent = "Nueva posición";

    $("modalPosicion").showModal();
}

function editarPosicion(id) {
    const posicion = posiciones.find(p => p.id === id);

    if (!posicion) return;

    $("editarPosicionId").value = posicion.id;
    $("nombrePosicion").value = posicion.nombre;
    $("descripcionPosicion").value = posicion.descripcion;

    $("tituloPosicion").textContent = "Editar posición";

    $("modalPosicion").showModal();
}

$("formPosicion").addEventListener("submit", async evento => {
    evento.preventDefault();

    const boton = evento.target.querySelector('[type="submit"]');

    boton.disabled = true;

    try {
        const id = $("editarPosicionId").value;

        const datos = {
            nombre: $("nombrePosicion").value.trim(),
            descripcion: $("descripcionPosicion").value.trim()
        };

        await solicitar(
            id ? `/posiciones/${id}` : "/posiciones/",
            opcionesJSON(id ? "PUT" : "POST", datos)
        );

        $("modalPosicion").close();

        notificar("Posición guardada correctamente");

        await cargarTodo();

    } catch (error) {
        notificar(error.message, true);
    } finally {
        boton.disabled = false;
    }
});

async function eliminarPosicion(id) {
    if (!confirm("¿Seguro que deseas eliminar esta posición?")) {
        return;
    }

    try {
        await solicitar(`/posiciones/${id}`, {
            method: "DELETE"
        });

        notificar("Posición eliminada correctamente");

        await cargarTodo();

    } catch (error) {
        notificar(error.message, true);
    }
}

async function cargarEstadisticas() {
    const respuesta = await solicitar("/estadisticas/");

    const datos = respuesta.datos;

    $("totalJugadores").textContent = datos.total_jugadores;

    $("totalGoles").textContent = datos.total_goles;

    $("totalAsistencias").textContent = datos.total_asistencias;

    $("promedioCalificacion").textContent =
        Number(datos.promedio_calificacion).toFixed(1);
}

async function cargarRanking() {
    const respuesta = await solicitar("/estadisticas/ranking");

    const ranking = respuesta.datos;

    $("cacheStatus").textContent = respuesta.cache === "HIT"
        ? "Redis: CACHE HIT · Datos recuperados de la caché."
        : "CACHE MISS · Datos consultados desde la base de datos.";

    $("listaRanking").innerHTML = ranking.length
        ? ranking.map(j => `
            <tr>
                <td>
                    ${j.puesto === 1 ? "🥇" :
                      j.puesto === 2 ? "🥈" :
                      j.puesto === 3 ? "🥉" : j.puesto}
                </td>

                <td><strong>${escapar(j.nombre)}</strong></td>
                <td>${j.dorsal}</td>
                <td>${j.goles}</td>
                <td>${j.asistencias}</td>
                <td>⭐ ${Number(j.calificacion).toFixed(1)}</td>
            </tr>
        `).join("")
        : `<tr>
            <td colspan="6">Todavía no hay jugadores registrados.</td>
           </tr>`;
}

async function cargarLideres() {
    const [goleadores, asistencias] = await Promise.all([
        solicitar("/estadisticas/goleadores"),
        solicitar("/estadisticas/asistencias")
    ]);

    $("listaGoleadores").innerHTML = goleadores.datos.length
        ? goleadores.datos.map((j, i) => `
            <div class="leader-item">
                <span>${i + 1}. ${escapar(j.nombre)}</span>
                <strong>${j.goles} goles</strong>
            </div>
        `).join("")
        : "<p>No hay registros disponibles.</p>";

    $("listaAsistencias").innerHTML = asistencias.datos.length
        ? asistencias.datos.map((j, i) => `
            <div class="leader-item">
                <span>${i + 1}. ${escapar(j.nombre)}</span>
                <strong>${j.asistencias} asistencias</strong>
            </div>
        `).join("")
        : "<p>No hay registros disponibles.</p>";
}

async function comprobarRedis() {
    const elemento = $("redisStatus");

    try {
        const respuesta = await solicitar("/estadisticas/redis");

        const conectado = respuesta.datos.conectado;

        elemento.textContent = conectado
            ? "● Redis conectado"
            : "● Redis desconectado";

        elemento.className = conectado
            ? "online"
            : "offline";

    } catch {
        elemento.textContent = "● Servicio no disponible";

        elemento.className = "offline";
    }
}

async function cargarTodo() {
    try {
        await cargarPosiciones();

        await Promise.all([
            cargarJugadores(),
            cargarEstadisticas(),
            cargarRanking(),
            cargarLideres(),
            comprobarRedis()
        ]);

    } catch (error) {
        notificar(error.message, true);
    }
}

$("nuevoJugador").addEventListener("click", nuevoJugador);

$("nuevaPosicion").addEventListener("click", nuevaPosicion);

$("actualizarRanking").addEventListener("click", async () => {
    try {
        await cargarRanking();
        await comprobarRedis();

        notificar("Ranking actualizado");

    } catch (error) {
        notificar(error.message, true);
    }
});

let tiempoBusqueda;

$("buscarJugador").addEventListener("input", () => {
    clearTimeout(tiempoBusqueda);

    tiempoBusqueda = setTimeout(() => {
        cargarJugadores().catch(
            error => notificar(error.message, true)
        );
    }, 300);
});

$("filtroPosicion").addEventListener("change", () => {
    cargarJugadores().catch(
        error => notificar(error.message, true)
    );
});

$("filtroActivo").addEventListener("change", () => {
    cargarJugadores().catch(
        error => notificar(error.message, true)
    );
});

document.querySelectorAll("[data-close]").forEach(boton => {
    boton.addEventListener("click", () => {
        $(boton.dataset.close).close();
    });
});

cargarTodo();
