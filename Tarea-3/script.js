// Luis Ricardo Delgado Sevilla

const textoTarea = document.getElementById("textoTarea");
const fechaTarea = document.getElementById("fechaTarea");
const categoriaTarea = document.getElementById("categoriaTarea");

const botonAgregar = document.getElementById("agregarTarea");
const botonModo = document.getElementById("botonModo");

const listaTareas = document.getElementById("listaTareas");
const listaProximas = document.getElementById("listaProximas");

const contador = document.getElementById("contador");
const totalTareas = document.getElementById("totalTareas");
const totalProximas = document.getElementById("totalProximas");

let tareas = JSON.parse(localStorage.getItem("listaTareasLuis")) || [];
let filtroActual = "Todas";


function guardarTareas() {
    localStorage.setItem(
        "listaTareasLuis",
        JSON.stringify(tareas)
    );
}


function agregarTarea() {

    const texto = textoTarea.value.trim();
    const fecha = fechaTarea.value;
    const categoria = categoriaTarea.value;

    if (texto === "") {
        alert("Primero escribe una tarea.");
        textoTarea.focus();
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

    textoTarea.focus();

    mostrarTareas();
}


function mostrarTareas() {

    listaTareas.innerHTML = "";

    let tareasFiltradas = tareas;

    if (filtroActual !== "Todas") {

        tareasFiltradas = tareas.filter(
            tarea => tarea.categoria === filtroActual
        );
    }


    actualizarContadores();


    if (tareasFiltradas.length === 0) {

        listaTareas.innerHTML = `
            <div class="vacio">
                <strong>No hay tareas aquí.</strong>
                <br>
                Agrega una nueva tarea para comenzar.
            </div>
        `;

        mostrarProximas();
        return;
    }


    tareasFiltradas.forEach(tarea => {

        const tarjeta = document.createElement("div");

        tarjeta.className = "tarea";

        let fechaMostrar = "Sin fecha límite";

        if (tarea.fecha !== "") {
            fechaMostrar = formatearFecha(tarea.fecha);
        }


        tarjeta.innerHTML = `
            <div class="tarea-info">

                <h3>${escaparHTML(tarea.texto)}</h3>

                <div class="detalles-tarea">

                    <span class="fecha">
                        📅 ${fechaMostrar}
                    </span>

                    <span class="categoria ${tarea.categoria}">
                        ${tarea.categoria}
                    </span>

                </div>

            </div>

            <div class="acciones">

                <button
                    class="editar"
                    onclick="editarTarea(${tarea.id})">
                    ✏️ Editar
                </button>

                <button
                    class="eliminar"
                    onclick="eliminarTarea(${tarea.id}, this)">
                    🗑️ Eliminar
                </button>

            </div>
        `;

        listaTareas.appendChild(tarjeta);
    });


    mostrarProximas();
}


function editarTarea(id) {

    const tarea = tareas.find(
        tarea => tarea.id === id
    );

    if (!tarea) {
        return;
    }


    const nuevoTexto = prompt(
        "Edita el texto de la tarea:",
        tarea.texto
    );


    if (nuevoTexto === null) {
        return;
    }


    if (nuevoTexto.trim() === "") {
        alert("La tarea no puede estar vacía.");
        return;
    }


    tarea.texto = nuevoTexto.trim();

    guardarTareas();

    mostrarTareas();
}


function eliminarTarea(id, boton) {

    const tarjeta = boton.closest(".tarea");

    tarjeta.classList.add("eliminando");


    setTimeout(() => {

        tareas = tareas.filter(
            tarea => tarea.id !== id
        );

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


            const fecha = new Date(
                tarea.fecha + "T00:00:00"
            );

            const diferencia = fecha - hoy;

            const dias =
                diferencia / (1000 * 60 * 60 * 24);


            return dias >= 0 && dias <= 3;

        })
        .sort((a, b) => {

            return new Date(a.fecha) - new Date(b.fecha);

        });


    totalProximas.textContent = proximas.length;


    if (proximas.length === 0) {

        listaProximas.innerHTML = `
            <div class="vacio">
                No tienes tareas que venzan en los próximos 3 días.
            </div>
        `;

        return;
    }


    proximas.forEach(tarea => {

        const elemento = document.createElement("div");

        elemento.className = "proxima";


        elemento.innerHTML = `
            <strong>
                ⏰ ${escaparHTML(tarea.texto)}
            </strong>

            <p>
                Vence el ${formatearFecha(tarea.fecha)}
                · ${tarea.categoria}
            </p>
        `;


        listaProximas.appendChild(elemento);
    });
}


function actualizarContadores() {

    const cantidad = tareas.length;

    totalTareas.textContent = cantidad;

    contador.textContent =
        cantidad === 1
            ? "1 tarea"
            : cantidad + " tareas";
}


function formatearFecha(fecha) {

    const partes = fecha.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


function escaparHTML(texto) {

    const elemento = document.createElement("div");

    elemento.textContent = texto;

    return elemento.innerHTML;
}


document
    .querySelectorAll(".filtro")
    .forEach(boton => {

        boton.addEventListener("click", function() {

            document
                .querySelectorAll(".filtro")
                .forEach(b => {

                    b.classList.remove("activo");

                });


            this.classList.add("activo");

            filtroActual =
                this.dataset.filtro;


            mostrarTareas();
        });

    });


botonModo.addEventListener("click", function() {

    document.body.classList.toggle("oscuro");

    const modoOscuro =
        document.body.classList.contains("oscuro");


    botonModo.textContent =
        modoOscuro ? "☀️" : "🌙";


    localStorage.setItem(
        "modoOscuroLuis",
        modoOscuro
    );

});


botonAgregar.addEventListener(
    "click",
    agregarTarea
);


textoTarea.addEventListener(
    "keydown",
    function(evento) {

        if (evento.key === "Enter") {
            agregarTarea();
        }

    }
);


const modoGuardado =
    localStorage.getItem("modoOscuroLuis");


if (modoGuardado === "true") {

    document.body.classList.add("oscuro");

    botonModo.textContent = "☀️";
}


mostrarTareas();
