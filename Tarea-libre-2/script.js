
const buscador = document.getElementById("buscador");
const categoria = document.getElementById("categoria");
const contador = document.getElementById("contador");
const sinResultados = document.getElementById("sinResultados");
const modo = document.getElementById("modo");
const formulario = document.getElementById("formJuego");
const listaJuegos = document.getElementById("listaJuegos");

function filtrarJuegos() {
    const texto = buscador.value.toLowerCase();
    const filtroCategoria = categoria.value;
    const juegos = document.querySelectorAll(".juego");
    let visibles = 0;

    juegos.forEach(juego => {
        const nombre = juego.dataset.nombre.toLowerCase();
        const tipo = juego.dataset.categoria;
        const coincideNombre = nombre.includes(texto);
        const coincideCategoria = filtroCategoria === "todos" || tipo === filtroCategoria;

        if (coincideNombre && coincideCategoria) {
            juego.style.display = "block";
            visibles++;
        } else {
            juego.style.display = "none";
        }
    });

    contador.textContent = visibles + " juegos encontrados";
    sinResultados.style.display = visibles === 0 ? "block" : "none";
}

buscador.addEventListener("input", filtrarJuegos);
categoria.addEventListener("change", filtrarJuegos);

document.addEventListener("click", function(evento) {
    if (evento.target.classList.contains("favorito")) {
        evento.target.classList.toggle("activo");
        evento.target.textContent = evento.target.classList.contains("activo")
            ? "♥ En favoritos"
            : "♡ Agregar a favoritos";
    }
});

modo.addEventListener("click", function() {
    document.body.classList.toggle("oscuro");
    modo.textContent = document.body.classList.contains("oscuro") ? "☀️" : "🌙";
});

formulario.addEventListener("submit", function(evento) {
    evento.preventDefault();

    const nombre = document.getElementById("nombreJuego").value;
    const tipo = document.getElementById("categoriaJuego").value;
    const descripcion = document.getElementById("descripcionJuego").value;
    const tarjeta = document.createElement("article");

    tarjeta.className = "juego";
    tarjeta.dataset.nombre = nombre;
    tarjeta.dataset.categoria = tipo;
    tarjeta.innerHTML = `
        <div class="icono">🎮</div>
        <span class="categoria">${tipo}</span>
        <h3>${nombre}</h3>
        <p>${descripcion}</p>
        <button class="favorito">♡ Agregar a favoritos</button>
    `;

    listaJuegos.appendChild(tarjeta);
    formulario.reset();
    filtrarJuegos();
});

filtrarJuegos();
