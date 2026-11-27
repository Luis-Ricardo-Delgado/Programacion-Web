
<script setup>
import { ref, computed, watch } from "vue";
import GameCard from "./components/GameCard.vue";

const juegos = ref([
    {
        id: 1,
        nombre: "Dying Light",
        imagen: "https://cdn.cloudflare.steamstatic.com/steam/apps/239140/library_600x900.jpg",
        descripcion: "Sobrevive en una ciudad infestada de zombis utilizando parkour y combate cuerpo a cuerpo.",
        plataformas: ["PC", "Xbox", "PlayStation"],
        lanzamiento: 2015
    },
    {
        id: 2,
        nombre: "Dead Island 2",
        imagen: "https://cdn.cloudflare.steamstatic.com/steam/apps/934700/library_600x900.jpg",
        descripcion: "Enfrenta hordas de zombis en las calles de Los Ángeles.",
        plataformas: ["PC", "Xbox", "PlayStation"],
        lanzamiento: 2023
    },
    {
        id: 3,
        nombre: "Resident Evil 2",
        imagen: "https://cdn.cloudflare.steamstatic.com/steam/apps/883710/library_600x900.jpg",
        descripcion: "Escapa de Raccoon City mientras descubres los secretos de Umbrella.",
        plataformas: ["PC", "Xbox", "PlayStation"],
        lanzamiento: 2019
    },
    {
        id: 4,
        nombre: "The Walking Dead",
        imagen: "https://cdn.cloudflare.steamstatic.com/steam/apps/1449690/library_600x900.jpg",
        descripcion: "Acompaña a Clementine en una historia donde tus decisiones cambian el destino de los supervivientes.",
        plataformas: ["PC", "Xbox", "PlayStation"],
        lanzamiento: 2019
    },
    {
        id: 5,
        nombre: "Left 4 Dead 2",
        imagen: "https://cdn.cloudflare.steamstatic.com/steam/apps/550/library_600x900.jpg",
        descripcion: "Combate junto a otros supervivientes contra hordas de infectados.",
        plataformas: ["PC", "Xbox"],
        lanzamiento: 2009
    },
    {
        id: 6,
        nombre: "State of Decay 2",
        imagen: "https://cdn.cloudflare.steamstatic.com/steam/apps/495420/library_600x900.jpg",
        descripcion: "Construye una comunidad y administra tus recursos durante el apocalipsis.",
        plataformas: ["PC", "Xbox"],
        lanzamiento: 2018
    },
    {
        id: 7,
        nombre: "Project Zomboid",
        imagen: "https://cdn.cloudflare.steamstatic.com/steam/apps/108600/library_600x900.jpg",
        descripcion: "Explora un mundo abierto donde cada decisión puede significar tu muerte.",
        plataformas: ["PC"],
        lanzamiento: 2013
    },
    {
        id: 8,
        nombre: "Days Gone",
        imagen: "https://cdn.cloudflare.steamstatic.com/steam/apps/1259420/library_600x900.jpg",
        descripcion: "Recorre un mundo devastado enfrentando enormes hordas de infectados.",
        plataformas: ["PC", "PlayStation"],
        lanzamiento: 2019
    },
    {
        id: 9,
        nombre: "7 Days to Die",
        imagen: "https://cdn.cloudflare.steamstatic.com/steam/apps/251570/library_600x900.jpg",
        descripcion: "Recolecta recursos, construye refugios y prepárate para sobrevivir a las hordas.",
        plataformas: ["PC", "Xbox", "PlayStation"],
        lanzamiento: 2024
    }
]);

function cargar(clave, valor) {
    try {
        return JSON.parse(localStorage.getItem(clave)) ?? valor;
    } catch {
        return valor;
    }
}

const busqueda = ref("");
const plataforma = ref("Todas");
const filtroEstado = ref("Todos");
const soloFavoritos = ref(false);

const favoritos = ref(cargar("zz-favoritos", []));
const estados = ref(cargar("zz-estados", {}));
const calificaciones = ref(cargar("zz-calificaciones", {}));

watch(favoritos, valor => {
    localStorage.setItem("zz-favoritos", JSON.stringify(valor));
}, { deep: true });

watch(estados, valor => {
    localStorage.setItem("zz-estados", JSON.stringify(valor));
}, { deep: true });

watch(calificaciones, valor => {
    localStorage.setItem("zz-calificaciones", JSON.stringify(valor));
}, { deep: true });

const juegosFiltrados = computed(() => {
    return juegos.value.filter(juego => {
        const coincideNombre = juego.nombre
            .toLowerCase()
            .includes(busqueda.value.toLowerCase());

        const coincidePlataforma =
            plataforma.value === "Todas" ||
            juego.plataformas.includes(plataforma.value);

        const coincideFavorito =
            !soloFavoritos.value ||
            favoritos.value.includes(juego.id);

        const coincideEstado =
            filtroEstado.value === "Todos" ||
            (estados.value[juego.id] || "Pendiente") === filtroEstado.value;

        return coincideNombre &&
            coincidePlataforma &&
            coincideFavorito &&
            coincideEstado;
    });
});

const completados = computed(() =>
    juegos.value.filter(j => estados.value[j.id] === "Completado").length
);

const jugando = computed(() =>
    juegos.value.filter(j => estados.value[j.id] === "Jugando").length
);

const progreso = computed(() =>
    Math.round(completados.value / juegos.value.length * 100)
);

function cambiarFavorito(id) {
    if (favoritos.value.includes(id)) {
        favoritos.value = favoritos.value.filter(f => f !== id);
    } else {
        favoritos.value.push(id);
    }
}

function cambiarEstado(id, estado) {
    estados.value[id] = estado;
}

function calificar(id, valor) {
    calificaciones.value[id] = valor;
}

function limpiarFiltros() {
    busqueda.value = "";
    plataforma.value = "Todas";
    filtroEstado.value = "Todos";
    soloFavoritos.value = false;
}
</script>

<template>
    <header class="navbar">
        <div class="brand">
            ☣ ZOMBIE<span>ZONE</span>
        </div>
        <span class="nav-label">SURVIVAL DATABASE</span>
    </header>

    <section class="hero">
        <span class="eyebrow">☣ ALERTA DE INFECCIÓN</span>
        <h1>EL APOCALIPSIS<br><span>HA COMENZADO</span></h1>
        <p>
            Explora los mejores videojuegos de zombis,
            registra tu progreso y demuestra que eres
            un verdadero superviviente.
        </p>
        <a href="#catalogo" class="hero-button">
            Explorar videojuegos →
        </a>
    </section>

    <main class="container">

        <section class="stats">
            <div class="stat">
                <span>🎮</span>
                <strong>{{ juegos.length }}</strong>
                <p>Videojuegos</p>
            </div>

            <div class="stat">
                <span>❤️</span>
                <strong>{{ favoritos.length }}</strong>
                <p>Favoritos</p>
            </div>

            <div class="stat">
                <span>🧟</span>
                <strong>{{ jugando }}</strong>
                <p>Jugando</p>
            </div>

            <div class="stat">
                <span>🏆</span>
                <strong>{{ completados }}</strong>
                <p>Completados</p>
            </div>
        </section>

        <section class="progress-section">
            <div class="progress-header">
                <h3>Tu progreso de supervivencia</h3>
                <strong>{{ progreso }}%</strong>
            </div>

            <div class="progress-track">
                <div class="progress-fill"
                    :style="{ width: progreso + '%' }">
                </div>
            </div>
        </section>

        <section id="catalogo">

            <div class="section-title">
                <span class="eyebrow">ARCHIVOS CLASIFICADOS</span>
                <h2>Catálogo de videojuegos</h2>
                <p>Selecciona tu próxima aventura.</p>
            </div>

            <div class="filters">
                <input
                    v-model="busqueda"
                    placeholder="🔍 Buscar videojuego..."
                >

                <select v-model="plataforma">
                    <option>Todas</option>
                    <option>PC</option>
                    <option>Xbox</option>
                    <option>PlayStation</option>
                </select>

                <select v-model="filtroEstado">
                    <option>Todos</option>
                    <option>Pendiente</option>
                    <option>Jugando</option>
                    <option>Completado</option>
                </select>

                <button
                    :class="{ active: soloFavoritos }"
                    @click="soloFavoritos = !soloFavoritos">
                    ♥ Favoritos
                </button>

                <button @click="limpiarFiltros">
                    Limpiar
                </button>
            </div>

            <p class="results">
                {{ juegosFiltrados.length }} videojuegos encontrados
            </p>

            <div class="games-grid">
                <GameCard
                    v-for="juego in juegosFiltrados"
                    :key="juego.id"
                    :juego="juego"
                    :favorito="favoritos.includes(juego.id)"
                    :estado="estados[juego.id] || 'Pendiente'"
                    :calificacion="calificaciones[juego.id] || 0"
                    @favorito="cambiarFavorito(juego.id)"
                    @estado="cambiarEstado(juego.id, $event)"
                    @calificar="calificar(juego.id, $event)"
                />
            </div>

            <div v-if="juegosFiltrados.length === 0"
                class="empty">
                <h2>☣ No se encontraron videojuegos</h2>
                <p>Intenta cambiar los filtros de búsqueda.</p>
                <button @click="limpiarFiltros">
                    Mostrar todos
                </button>
            </div>

        </section>
    </main>

    <footer class="footer">
        <h2>☣ ZOMBIEZONE</h2>
        <p>El mundo terminó. Tu aventura apenas comienza.</p>
        <small>
            Desarrollado por Luis Ricardo Delgado Sevilla
            | Vue.js
        </small>
    </footer>
</template>
