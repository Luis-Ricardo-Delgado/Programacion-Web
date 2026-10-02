// Luis Ricardo Delgado Sevilla

const formulario =
    document.getElementById(
        "sessionForm"
    );

const listaSesiones =
    document.getElementById(
        "sessionsList"
    );

const botonActualizar =
    document.getElementById(
        "refreshButton"
    );

const botonTema =
    document.getElementById(
        "themeButton"
    );

const totalMinutos =
    document.getElementById(
        "totalMinutes"
    );

const totalSesiones =
    document.getElementById(
        "totalSessions"
    );

const materiaPrincipal =
    document.getElementById(
        "topSubject"
    );

const energiaPromedio =
    document.getElementById(
        "averageEnergy"
    );

const recomendacion =
    document.getElementById(
        "recommendation"
    );

const barrasMaterias =
    document.getElementById(
        "subjectBars"
    );


async function cargarTodo() {

    await Promise.all([
        cargarSesiones(),
        cargarResumen()
    ]);

}


async function cargarSesiones() {

    const respuesta =
        await fetch(
            "/api/sessions"
        );

    const sesiones =
        await respuesta.json();

    listaSesiones.innerHTML = "";

    if (sesiones.length === 0) {

        listaSesiones.innerHTML = `
            <div class="empty">
                Aún no hay sesiones registradas.
            </div>
        `;

        return;
    }


    sesiones.forEach(sesion => {

        const tarjeta =
            document.createElement(
                "article"
            );

        tarjeta.className =
            "session-card";

        const fecha =
            new Date(
                sesion.date
            ).toLocaleString(
                "es-MX"
            );


        tarjeta.innerHTML = `
            <div>

                <h3>
                    ${escaparTexto(
                        sesion.subject
                    )}
                </h3>

                <div class="session-meta">

                    <span>
                        ⏱️ ${sesion.minutes} min
                    </span>

                    <span>
                        🔋 Energía
                        ${sesion.energy}/5
                    </span>

                    <span>
                        📅 ${fecha}
                    </span>

                </div>

                ${
                    sesion.notes
                        ? `
                        <p class="session-notes">
                            ${escaparTexto(
                                sesion.notes
                            )}
                        </p>
                        `
                        : ""
                }

            </div>

            <button
                class="delete-button"
                data-id="${sesion.id}"
            >
                Eliminar
            </button>
        `;


        listaSesiones
            .appendChild(
                tarjeta
            );

    });


    document
        .querySelectorAll(
            ".delete-button"
        )
        .forEach(boton => {

            boton.addEventListener(
                "click",
                async () => {

                    const id =
                        boton.dataset.id;

                    await fetch(
                        `/api/sessions/${id}`,
                        {
                            method: "DELETE"
                        }
                    );

                    cargarTodo();

                }
            );

        });

}


async function cargarResumen() {

    const respuesta =
        await fetch(
            "/api/summary"
        );

    const datos =
        await respuesta.json();


    totalMinutos.textContent =
        `${datos.totalMinutes} min`;

    totalSesiones.textContent =
        datos.totalSessions;

    materiaPrincipal.textContent =
        datos.topSubject;

    energiaPromedio.textContent =
        `${datos.averageEnergy}/5`;

    recomendacion.textContent =
        datos.recommendation;


    mostrarBarras(
        datos.subjectTotals,
        datos.totalMinutes
    );

}


function mostrarBarras(
    materias,
    total
) {

    barrasMaterias.innerHTML = "";

    const registros =
        Object.entries(materias);

    if (registros.length === 0) {

        barrasMaterias.innerHTML = `
            <div class="empty">
                Sin datos todavía.
            </div>
        `;

        return;
    }


    registros
        .sort(
            (a, b) =>
                b[1] - a[1]
        )
        .forEach(
            ([materia, minutos]) => {

                const porcentaje =
                    total
                        ? Math.round(
                            (
                                minutos /
                                total
                            ) * 100
                          )
                        : 0;


                const fila =
                    document.createElement(
                        "div"
                    );

                fila.className =
                    "subject-row";


                fila.innerHTML = `
                    <div
                        class="subject-row-top"
                    >

                        <span>
                            ${escaparTexto(
                                materia
                            )}
                        </span>

                        <span>
                            ${minutos} min ·
                            ${porcentaje}%
                        </span>

                    </div>

                    <div class="bar-track">

                        <div
                            class="bar-fill"
                            style="width:${porcentaje}%"
                        ></div>

                    </div>
                `;


                barrasMaterias
                    .appendChild(
                        fila
                    );

            }
        );

}


formulario.addEventListener(
    "submit",
    async evento => {

        evento.preventDefault();


        const datos = {

            subject:
                document
                    .getElementById(
                        "subject"
                    )
                    .value,

            minutes:
                Number(
                    document
                        .getElementById(
                            "minutes"
                        )
                        .value
                ),

            energy:
                Number(
                    document
                        .getElementById(
                            "energy"
                        )
                        .value
                ),

            notes:
                document
                    .getElementById(
                        "notes"
                    )
                    .value

        };


        const respuesta =
            await fetch(
                "/api/sessions",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            datos
                        )
                }
            );


        if (!respuesta.ok) {

            alert(
                "No se pudo guardar la sesión."
            );

            return;
        }


        formulario.reset();

        document
            .getElementById(
                "minutes"
            )
            .value = 25;

        document
            .getElementById(
                "energy"
            )
            .value = 3;


        cargarTodo();

    }
);


botonActualizar.addEventListener(
    "click",
    cargarTodo
);


botonTema.addEventListener(
    "click",
    () => {

        document.body
            .classList
            .toggle("dark");


        const oscuro =
            document.body
                .classList
                .contains("dark");


        botonTema.textContent =
            oscuro
                ? "☀️"
                : "🌙";


        localStorage.setItem(
            "focusforgeTheme",
            oscuro
                ? "dark"
                : "light"
        );

    }
);


if (
    localStorage.getItem(
        "focusforgeTheme"
    ) === "dark"
) {

    document.body
        .classList
        .add("dark");

    botonTema.textContent =
        "☀️";
}


function escaparTexto(texto) {

    const elemento =
        document.createElement(
            "div"
        );

    elemento.textContent =
        texto;

    return elemento.innerHTML;

}


cargarTodo();
