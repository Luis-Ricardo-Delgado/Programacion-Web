// Luis Ricardo Delgado Sevilla

const inputTarea = document.getElementById("tarea");
const inputFecha = document.getElementById("fecha");
const categoria = document.getElementById("categoria");
const botonAgregar = document.getElementById("agregar");
const lista = document.getElementById("lista");
const botonModo = document.getElementById("modo");

let tareas = [];
let filtroActual = "Todas";

botonAgregar.addEventListener("click", agregarTarea);

inputTarea.addEventListener("keypress", function(evento) {
    if (evento.key === "Enter") {
        agregarTarea();
    }
});

function agregarTarea() {
    const texto = inputTarea.value.trim();
    const fecha = inputFecha.value;

    if (texto === "") {
        alert("Escribe una tarea.");
        return;
    }

    const nuevaTarea = {
        id: Date.now(),
        texto: texto,
        fecha: fecha,
        categoria: categoria.value,
        completada: false
    };

    tareas.push(nuevaTarea);

    inputTarea.value = "";
    inputFecha.value = "";

    mostrarTareas();
}

function mostrarTareas() {
    lista.innerHTML = "";

    const tareasFiltradas = tareas.filter(function(tarea) {
        return filtroActual === "Todas" || tarea.categoria === filtroActual;
    });

    if (tareasFiltradas.length === 0) {
        lista.innerHTML = "<p>No hay tareas para mostrar.</p>";
        return;
    }

    tareasFiltradas.forEach(function(tarea) {
        const elemento = document.createElement("div");

        elemento.className = "tarea";

        if (tarea.completada) {
            elemento.classList.add("completada");
        }

        if (estaVencida(tarea.fecha) && !tarea.completada) {
            elemento.classList.add("vencida");
        }

        let fechaTexto = "Sin fecha límite";

        if (tarea.fecha) {
            fechaTexto = "Fecha límite: " + tarea.fecha;
        }

        elemento.innerHTML = `
            <div>
                <h3>${tarea.texto}</h3>
                <p>${tarea.categoria} • ${fechaTexto}</p>
            </div>

            <div class="botones">
                <button class="completar">✓</button>
                <button class="editar">Editar</button>
                <button class="eliminar">Eliminar</button>
            </div>
        `;

        elemento.querySelector(".completar").addEventListener("click", function() {
            completarTarea(tarea.id);
        });

        elemento.querySelector(".editar").addEventListener("click", function() {
            editarTarea(tarea.id);
        });

        elemento.querySelector(".eliminar").addEventListener("click", function() {
            eliminarTarea(tarea.id, elemento);
        });

        lista.appendChild(elemento);
    });
}

function completarTarea(id) {
    const tarea = tareas.find(function(tarea) {
        return tarea.id === id;
    });

    tarea.completada = !tarea.completada;

    mostrarTareas();
}

function editarTarea(id) {
    const tarea = tareas.find(function(tarea) {
        return tarea.id === id;
    });

    const nuevoTexto = prompt("Edita tu tarea:", tarea.texto);

    if (nuevoTexto !== null && nuevoTexto.trim() !== "") {
        tarea.texto = nuevoTexto.trim();
        mostrarTareas();
    }
}

function eliminarTarea(id, elemento) {
    elemento.classList.add("eliminando");

    setTimeout(function() {
        tareas = tareas.filter(function(tarea) {
            return tarea.id !== id;
        });

        mostrarTareas();
    }, 400);
}

function filtrar(categoriaSeleccionada) {
    filtroActual = categoriaSeleccionada;
    mostrarTareas();
}

function estaVencida(fecha) {
    if (!fecha) {
        return false;
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const limite = new Date(fecha + "T00:00:00");

    return limite < hoy;
}

botonModo.addEventListener("click", function() {
    document.body.classList.toggle("oscuro");

    if (document.body.classList.contains("oscuro")) {
        botonModo.textContent = "☀️";
    } else {
        botonModo.textContent = "🌙";
    }
});

mostrarTareas();
