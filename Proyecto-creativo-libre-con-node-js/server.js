// Luis Ricardo Delgado Sevilla

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, "data", "sessions.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function leerSesiones() {
    try {
        const datos = fs.readFileSync(DATA_FILE, "utf8");
        return JSON.parse(datos);
    } catch (error) {
        return [];
    }
}

function guardarSesiones(sesiones) {
    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(sesiones, null, 2)
    );
}

app.get("/api/sessions", (req, res) => {
    res.json(leerSesiones());
});

app.post("/api/sessions", (req, res) => {

    const {
        subject,
        minutes,
        energy,
        notes
    } = req.body;

    if (!subject || !minutes || minutes < 1) {

        return res.status(400).json({
            error: "Datos incompletos."
        });

    }

    const sesiones = leerSesiones();

    const nuevaSesion = {
        id: Date.now(),
        subject: subject.trim(),
        minutes: Number(minutes),
        energy: Number(energy) || 3,
        notes: (notes || "").trim(),
        date: new Date().toISOString()
    };

    sesiones.unshift(nuevaSesion);

    guardarSesiones(sesiones);

    res.status(201).json(nuevaSesion);
});

app.delete("/api/sessions/:id", (req, res) => {

    const id = Number(req.params.id);

    const sesiones = leerSesiones();

    const nuevasSesiones =
        sesiones.filter(
            sesion => sesion.id !== id
        );

    if (nuevasSesiones.length === sesiones.length) {

        return res.status(404).json({
            error: "Sesión no encontrada."
        });

    }

    guardarSesiones(nuevasSesiones);

    res.json({
        message: "Sesión eliminada."
    });
});

app.get("/api/summary", (req, res) => {

    const sesiones = leerSesiones();

    const totalMinutes =
        sesiones.reduce(
            (total, sesion) =>
                total + sesion.minutes,
            0
        );

    const totalSessions = sesiones.length;

    const materias = {};

    sesiones.forEach(sesion => {

        materias[sesion.subject] =
            (materias[sesion.subject] || 0)
            + sesion.minutes;

    });

    let topSubject = "Sin datos";
    let topMinutes = 0;

    Object.entries(materias)
        .forEach(([materia, minutos]) => {

            if (minutos > topMinutes) {

                topSubject = materia;
                topMinutes = minutos;

            }

        });

    const averageEnergy =
        totalSessions
            ? (
                sesiones.reduce(
                    (total, sesion) =>
                        total + sesion.energy,
                    0
                ) / totalSessions
              ).toFixed(1)
            : "0";

    let recommendation =
        "Registra tu primera sesión para recibir una recomendación.";

    if (totalSessions > 0) {

        if (averageEnergy < 2.5) {

            recommendation =
                "Tu energía promedio es baja. Prueba sesiones más cortas con descansos frecuentes.";

        } else if (totalMinutes >= 180) {

            recommendation =
                "Llevas un buen ritmo. Intenta alternar materias para mantener variedad.";

        } else {

            recommendation =
                "Vas construyendo constancia. Intenta completar sesiones de al menos 25 minutos.";

        }

    }

    res.json({
        totalMinutes,
        totalSessions,
        topSubject,
        topMinutes,
        averageEnergy,
        recommendation,
        subjectTotals: materias
    });
});

app.listen(PORT, () => {

    console.log(
        `FocusForge ejecutándose en http://localhost:${PORT}`
    );

});
