// Luis Ricardo Delgado Sevilla

const socket = io();

const login = document.getElementById("login");
const chat = document.getElementById("chat");
const loginForm = document.getElementById("loginForm");
const username = document.getElementById("username");
const currentUser = document.getElementById("currentUser");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const messages = document.getElementById("messages");
const users = document.getElementById("users");
const typing = document.getElementById("typing");

let nombre = "";
let typingTimer;
const escribiendo = new Map();

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    nombre = username.value.trim();

    if (!nombre) return;

    socket.emit("join", nombre);

    currentUser.textContent = "Conectado como: " + nombre;

    login.hidden = true;
    login.style.display = "none";

    chat.hidden = false;
    chat.style.removeProperty("display");

    messageInput.focus();
});

socket.on("connect", () => {
    if (nombre) {
        socket.emit("join", nombre);
    }
});

messageForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const mensaje = messageInput.value.trim();

    if (!mensaje || !socket.connected) return;

    socket.emit("message", mensaje);
    socket.emit("stopTyping");

    clearTimeout(typingTimer);

    messageInput.value = "";
    messageInput.focus();
});

socket.on("message", (data) => {
    const div = document.createElement("div");

    const propio = data.id === socket.id;

    div.className = propio
        ? "message own"
        : "message other";

    div.style.background = propio ? "#d71920" : "#243858";
    div.style.padding = "12px 16px";
    div.style.borderRadius = "12px";
    div.style.margin = propio
        ? "10px 0 10px auto"
        : "10px auto 10px 0";

    div.style.width = "fit-content";
    div.style.maxWidth = "80%";
    div.style.overflowWrap = "anywhere";

    const autor = document.createElement("strong");
    autor.textContent = propio ? "Tú" : data.nombre;

    const texto = document.createElement("p");
    texto.textContent = data.mensaje;
    texto.style.margin = "6px 0";

    const hora = document.createElement("small");
    hora.textContent = new Date(data.hora).toLocaleTimeString(
        "es-MX",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

    div.appendChild(autor);
    div.appendChild(texto);
    div.appendChild(hora);

    messages.appendChild(div);

    messages.scrollTop = messages.scrollHeight;
});

socket.on("notification", (texto) => {
    const div = document.createElement("div");

    div.className = "notification";
    div.textContent = texto;

    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
});

socket.on("users", (cantidad) => {
    users.textContent = cantidad === 1
        ? "1 conectado"
        : cantidad + " conectados";
});

messageInput.addEventListener("input", () => {
    clearTimeout(typingTimer);

    if (!socket.connected) return;

    if (!messageInput.value.trim()) {
        socket.emit("stopTyping");
        return;
    }

    socket.emit("typing");

    typingTimer = setTimeout(() => {
        socket.emit("stopTyping");
    }, 1200);
});

function actualizarTyping() {
    const nombres = Array.from(escribiendo.values());

    typing.textContent = nombres.length
        ? nombres.join(", ") + " escribiendo..."
        : "";
}

socket.on("typing", (data) => {
    escribiendo.set(data.id, data.nombre);
    actualizarTyping();
});

socket.on("stopTyping", (id) => {
    escribiendo.delete(id);
    actualizarTyping();
});

socket.on("disconnect", () => {
    users.textContent = "Reconectando...";
    escribiendo.clear();
    actualizarTyping();
});

