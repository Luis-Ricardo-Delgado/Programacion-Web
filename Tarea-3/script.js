// Luis Ricardo Delgado Sevilla

const textoTarea = document.getElementById("textoTarea");
const fechaTarea = document.getElementById("fechaTarea");
const categoriaTarea = document.getElementById("categoriaTarea");

const botonAgregar = document.getElementById("agregarTarea");
const listaTareas = document.getElementById("listaTareas");
const listaProximas = document.getElementById("listaProximas");
const contador = document.getElementById("contador");
const botonModo = document.getElementById("modo");

let tareas = JSON.parse(localStorage.getItem("tareas")) || [];
let filtroActual = "Todas";


function guardarTareas() {
    localStorage.setItem("tareas", JSON.stringify(tareas));
}


function agregarTarea() {

    const texto = textoTarea.value.trim();
    const fecha = fechaTarea.value;
    const categoria = categoriaTarea.value;

    if (texto === "") {
        alert("Escribe una tarea antes de agregarla.");
        return;
    }

    const nuevaTarea = {
        id: Date.now(),
        texto: texto,
        fecha: fecha,
        categoria: categoria
    };

    tareas.push(nuevaTarea);

    guardarTareas();

    textoTarea.value = "";
    fechaTarea.value = "";

    mostrarTareas();
}


function mostrarTareas() {

    listaTareas.innerHTML = "";

    const filtradas = tareas.filter(tarea => {

        if (filtroActual === "Todas") {
            return true;
        }

        return tarea.categoria === filtroActual;
    });


    contador.textContent =
        tareas.length === 1
            ? "1 tarea"
            : tareas.length + " tareas";


    if (filtradas.length === 0) {

        listaTareas.innerHTML = `
            <div class="vacia">
                No hay tareas en esta categoría.
            </div>
        `;

        mostrarProximas();
        return;
    }


    filtradas.forEach(tarea => {

        const elemento = document.createElement("div");
        elemento.className = "tarea";

        const claseCategoria = tarea.categoria.toLowerCase();

        elemento.innerHTML = `
            <div class="tarea-info">

                <h3>${tarea.texto}</h3>

                <p>
                    📅 ${
                        tarea.fecha
                            ? formatearFecha(tarea.fecha)
                            : "Sin fecha límite"
                    }
                </p>

                <span class="etiqueta ${claseCategoria}">
                    ${tarea.categoria}
                </span>

            </div>

            <div class="acciones">

                <button
                    class="editar"
                    onclick="editarTarea(${tarea.id})">
                    Editar
                </button>

                <button
                    class="eliminar"
                    onclick="eliminarTarea(${tarea.id}, this)">
                    Eliminar
                </button>

            </div>
        `;

        listaTareas.appendChild(elemento);
    });

    mostrarProximas();
}


function editarTarea(id) {

    const tarea = tareas.find(t => t.id === id);

    if (!tarea) {
        return;
    }

    const nuevoTexto = prompt(
        "Edita el nombre de la tarea:",
        tarea.texto
    );

    if (nuevoTexto === null) {
        return;
    }

    if (nuevoTexto.trim() === "") {
        alert("La tarea no puede quedar vacía.");
        return;
    }

    tarea.texto = nuevoTexto.trim();

    guardarTareas();
    mostrarTareas();
}


function eliminarTarea(id, boton) {

    const elemento = boton.closest(".tarea");

    elemento.classList.add("eliminando");

    setTimeout(() => {

        tareas = tareas.filter(tarea => tarea.id !== id);

        guardarTareas();
        mostrarTareas();

    }, 350);
}


function mostrarProximas() {

    listaProximas.innerHTML = "";

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const proximas = tareas
        .filter(tarea => {

            if (!tarea.fecha) {
                return false;
            }

            const fecha = new Date(tarea.fecha + "T00:00:00");

            const diferencia = fecha - hoy;

            const dias =
                diferencia / (1000 * 60 * 60 * 24);

            return dias >= 0 && dias <= 3;
        })
        .sort((a, b) => {
            return new Date(a.fecha) - new Date(b.fecha);
        });


    if (proximas.length === 0) {

        listaProximas.innerHTML = `
            <div class="vacia">
                No hay tareas próximas a vencer.
            </div>
        `;

        return;
    }


    proximas.forEach(tarea => {

        const elemento = document.createElement("div");
        elemento.className = "proxima";

        elemento.innerHTML = `
            <strong>${tarea.texto}</strong>
            <br>
            Vence: ${formatearFecha(tarea.fecha)}
        `;

        listaProximas.appendChild(elemento);
    });
}


function formatearFecha(fecha) {

    const partes = fecha.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


document.querySelectorAll(".filtro").forEach(boton => {

    boton.addEventListener("click", () => {

        document.querySelectorAll(".filtro")
            .forEach(b => b.classList.remove("activo"));

        boton.classList.add("activo");

        filtroActual = boton.dataset.filtro;

        mostrarTareas();
    });
});


botonModo.addEventListener("click", () => {

    document.body.classList.toggle("oscuro");

    const oscuro =
        document.body.classList.contains("oscuro");

    botonModo.textContent =
        oscuro ? "☀️" : "🌙";

    localStorage.setItem(
        "modoOscuro",
        oscuro
    );
});


if (localStorage.getItem("modoOscuro") === "true") {

    document.body.classList.add("oscuro");
    botonModo.textContent = "☀️";
}


botonAgregar.addEventListener("click", agregarTarea);


textoTarea.addEventListener("keydown", event => {

    if (event.key === "Enter") {
        agregarTarea();
    }
});


mostrarTareas();
