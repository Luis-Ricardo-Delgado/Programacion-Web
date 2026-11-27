// Luis Ricardo Delgado Sevilla

const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const usuarios = new Map();

io.on("connection", (socket) => {

    socket.on("join", (nombre) => {
        if (typeof nombre !== "string") return;
        nombre = nombre.trim().slice(0, 25);

        if (!nombre || usuarios.has(socket.id)) return;

        usuarios.set(socket.id, nombre);

        io.emit("notification", `${nombre} se unió a ChivaChat 🐐`);
        io.emit("users", usuarios.size);
    });

    socket.on("message", (mensaje) => {
        if (!usuarios.has(socket.id)) return;
        if (typeof mensaje !== "string") return;

        mensaje = mensaje.trim().slice(0, 1000);

        if (!mensaje) return;

        io.emit("message", {
            id: socket.id,
            nombre: usuarios.get(socket.id),
            mensaje: mensaje,
            hora: new Date().toISOString()
        });

        socket.broadcast.emit("stopTyping", socket.id);
    });

    socket.on("typing", () => {
        if (!usuarios.has(socket.id)) return;

        socket.broadcast.emit("typing", {
            id: socket.id,
            nombre: usuarios.get(socket.id)
        });
    });

    socket.on("stopTyping", () => {
        socket.broadcast.emit("stopTyping", socket.id);
    });

    socket.on("disconnect", () => {
        const nombre = usuarios.get(socket.id);

        if (nombre) {
            usuarios.delete(socket.id);
            io.emit("notification", `${nombre} salió de ChivaChat`);
            io.emit("users", usuarios.size);
            io.emit("stopTyping", socket.id);
        }
    });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
    console.log(`ChivaChat funcionando en el puerto ${PORT}`);
});
