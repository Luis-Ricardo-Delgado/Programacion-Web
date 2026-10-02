// Luis Ricardo Delgado Sevilla

const nombreTarea = document.getElementById("nombreTarea");
const fechaTarea = document.getElementById("fechaTarea");
const categoriaTarea = document.getElementById("categoriaTarea");

const botonAgregar = document.getElementById("agregarTarea");
const listaTareas = document.getElementById("listaTareas");
const proximasTareas = document.getElementById("proximasTareas");

const contador = document.getElementById("contador");
const modoOscuro = document.getElementById("modoOscuro");

let tareas = [];
let categoriaSeleccionada = "Todas";


botonAgregar.addEventListener("click", agregarTarea);


function agregarTarea() {

    const nombre = nombreTarea.value.trim();

    if (nombre === "") {
        alert("Escribe una tarea.");
        return;
    }

    const tarea = {
        id: Date.now(),
        nombre: nombre,
        fecha: fechaTarea.value,
        categoria: categoriaTarea.value
    };

    tareas.push(tarea);

    nombreTarea.value = "";
    fechaTarea.value = "";

    mostrarTareas();
}


function mostrarTareas() {

    listaTareas.innerHTML = "";

    const filtradas = tareas.filter(tarea => {

        if (categoriaSeleccionada === "Todas") {
            return true;
        }

        return tarea.categoria === categoriaSeleccionada;
    });


    contador.textContent =
        tareas.length === 1
        ? "1 tarea"
        : tareas.length + " tareas";


    if (filtradas.length === 0) {

        listaTareas.innerHTML =
            `<div class="vacio">
                No hay tareas en esta categoría.
            </div>`;

    } else {

        filtradas.forEach(tarea => {

            const elemento = document.createElement("div");

            elemento.className = "tarea";

            elemento.innerHTML = `
                <div class="tarea-info">

                    <h3>${tarea.nombre}</h3>

                    <p>
                        Fecha límite:
                        ${
                            tarea.fecha
                            ? convertirFecha(tarea.fecha)
                            : "Sin fecha"
                        }
                    </p>

                    <span class="categoria ${tarea.categoria}">
                        ${tarea.categoria}
                    </span>

                </div>

                <div class="botones">

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
    }

    mostrarProximas();
}


function editarTarea(id) {

    const tarea = tareas.find(t => t.id === id);

    const nuevoNombre = prompt(
        "Editar tarea:",
        tarea.nombre
    );

    if (nuevoNombre === null) {
        return;
    }

    if (nuevoNombre.trim() === "") {
        alert("La tarea no puede quedar vacía.");
        return;
    }

    tarea.nombre = nuevoNombre.trim();

    mostrarTareas();
}


function eliminarTarea(id, boton) {

    const elemento = boton.closest(".tarea");

    elemento.classList.add("eliminando");

    setTimeout(() => {

        tareas = tareas.filter(tarea => tarea.id !== id);

        mostrarTareas();

    }, 400);
}


function mostrarProximas() {

    proximasTareas.innerHTML = "";

    const hoy = new Date();

    hoy.setHours(0, 0, 0, 0);

    const proximas = tareas.filter(tarea => {

        if (tarea.fecha === "") {
            return false;
        }

        const fecha = new Date(
            tarea.fecha + "T00:00:00"
        );

        const diferencia = fecha - hoy;

        const dias =
            diferencia / (1000 * 60 * 60 * 24);

        return dias >= 0 && dias <= 3;
    });


    if (proximas.length === 0) {

        proximasTareas.innerHTML =
            `<div class="vacio">
                No hay tareas próximas a vencer.
            </div>`;

        return;
    }


    proximas.forEach(tarea => {

        const elemento = document.createElement("div");

        elemento.className = "proxima";

        elemento.innerHTML = `
            <strong>${tarea.nombre}</strong>
            <br>
            Vence: ${convertirFecha(tarea.fecha)}
        `;

        proximasTareas.appendChild(elemento);
    });
}


function convertirFecha(fecha) {

    const partes = fecha.split("-");

    return partes[2] + "/" +
           partes[1] + "/" +
           partes[0];
}


document.querySelectorAll(".filtro").forEach(boton => {

    boton.addEventListener("click", function() {

        document.querySelectorAll(".filtro")
            .forEach(b => b.classList.remove("activo"));

        this.classList.add("activo");

        categoriaSeleccionada =
            this.dataset.categoria;

        mostrarTareas();
    });
});


modoOscuro.addEventListener("click", function() {

    document.body.classList.toggle("oscuro");

    if (document.body.classList.contains("oscuro")) {

        modoOscuro.textContent = "☀️";

    } else {

        modoOscuro.textContent = "🌙";

    }
});


nombreTarea.addEventListener("keydown", function(evento) {

    if (evento.key === "Enter") {
        agregarTarea();
    }

});


mostrarTareas();
