// Luis Ricardo Delgado Sevilla

let numeroSecreto = Math.floor(Math.random() * 100) + 1;
let intentos = 10;
let numerosProbados = [];
let juegoTerminado = false;

function comprobarNumero() {
    const entrada = document.getElementById("numero");
    const numero = Number(entrada.value);
    const mensaje = document.getElementById("mensaje");

    if (juegoTerminado) {
        mensaje.textContent = "El juego terminó. Presiona Volver a jugar.";
        return;
    }

    if (entrada.value === "" || numero < 1 || numero > 100) {
        mensaje.textContent = "Ingresa un número válido entre 1 y 100.";
        return;
    }

    intentos--;
    numerosProbados.push(numero);

    document.getElementById("intentos").textContent = intentos;
    document.getElementById("probados").textContent = numerosProbados.join(", ");

    if (numero === numeroSecreto) {
        mensaje.textContent = "🎉 ¡Correcto! Adivinaste el número " + numeroSecreto + ".";
        juegoTerminado = true;
    } else if (intentos === 0) {
        mensaje.textContent = "Se acabaron los intentos. El número era " + numeroSecreto + ".";
        juegoTerminado = true;
    } else if (numero < numeroSecreto) {
        mensaje.textContent = "Te quedaste corto. Intenta con un número más alto.";
    } else {
        mensaje.textContent = "Te pasaste. Intenta con un número más bajo.";
    }

    entrada.value = "";
    entrada.focus();
}

function reiniciarJuego() {
    numeroSecreto = Math.floor(Math.random() * 100) + 1;
    intentos = 10;
    numerosProbados = [];
    juegoTerminado = false;

    document.getElementById("numero").value = "";
    document.getElementById("intentos").textContent = "10";
    document.getElementById("probados").textContent = "-";
    document.getElementById("mensaje").textContent =
        "Ingresa un número y comienza a jugar.";
}
