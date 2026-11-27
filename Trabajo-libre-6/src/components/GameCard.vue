
<script setup>
defineProps({
    juego: {
        type: Object,
        required: true
    },
    favorito: Boolean,
    estado: String,
    calificacion: Number
});

const emit = defineEmits([
    "favorito",
    "estado",
    "calificar"
]);

function imagenError(event) {
    event.target.onerror = null;
    event.target.src = "https://placehold.co/600x900/151b15/a3c74a?text=ZombieZone";
}
</script>

<template>
    <article class="game-card">

        <div class="game-image">

            <img
                :src="juego.imagen"
                :alt="juego.nombre"
                loading="lazy"
                @error="imagenError"
            >

            <button
                class="favorite-btn"
                :class="{ active: favorito }"
                :title="favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'"
                :aria-pressed="favorito"
                @click="emit('favorito')"
            >
                {{ favorito ? '♥' : '♡' }}
            </button>

            <span class="game-year">
                {{ juego.lanzamiento }}
            </span>

        </div>

        <div class="game-content">

            <h3>{{ juego.nombre }}</h3>

            <p class="game-description">
                {{ juego.descripcion }}
            </p>

            <div class="platforms">

                <span
                    v-for="plataforma in juego.plataformas"
                    :key="plataforma"
                    class="platform-tag"
                >
                    {{ plataforma }}
                </span>

            </div>

            <div class="game-controls">

                <label :for="'estado-' + juego.id">
                    Estado del videojuego
                </label>

                <select
                    :id="'estado-' + juego.id"
                    :value="estado"
                    @change="emit('estado', $event.target.value)"
                >
                    <option value="Pendiente">
                        ⏳ Pendiente
                    </option>

                    <option value="Jugando">
                        🎮 Jugando
                    </option>

                    <option value="Completado">
                        🏆 Completado
                    </option>
                </select>

                <label>
                    Tu calificación: {{ calificacion }}/5
                </label>

                <div class="rating">

                    <button
                        v-for="estrella in 5"
                        :key="estrella"
                        class="star"
                        :class="{ active: estrella <= calificacion }"
                        :aria-label="'Calificar con ' + estrella + ' estrellas'"
                        @click="emit('calificar', estrella)"
                    >
                        ★
                    </button>

                </div>

            </div>

        </div>

    </article>
</template>
