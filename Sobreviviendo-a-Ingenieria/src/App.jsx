
import React, { useState, useEffect } from 'react';

const materias = [
    'Programación Web',
    'Métodos Numéricos',
    'Fundamentos de IA',
    'Redes de Computadoras',
    'Arquitectura de Computadoras',
    'Bases de Datos',
    'Teoría de la Computación',
    'Innovación y Tecnología',
    'Otra materia'
];

const inicial = {
    titulo: '',
    materia: materias[0],
    fecha: '',
    prioridad: 'Media'
};

export default function App() {
    const [tareas, setTareas] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('tareasIngenieria')) || [];
        } catch {
            return [];
        }
    });

    const [form, setForm] = useState(inicial);
    const [filtro, setFiltro] = useState('Todas');
    const [editando, setEditando] = useState(null);

    useEffect(() => {
        localStorage.setItem('tareasIngenieria', JSON.stringify(tareas));
    }, [tareas]);

    const terminadas = tareas.filter(t => t.completada).length;
    const pendientes = tareas.length - terminadas;
    const progreso = tareas.length
        ? Math.round(terminadas / tareas.length * 100)
        : 0;

    function guardar(e) {
        e.preventDefault();

        if (!form.titulo.trim()) return;

        if (editando !== null) {
            setTareas(tareas.map(t =>
                t.id === editando ? { ...t, ...form } : t
            ));
        } else {
            setTareas([
                ...tareas,
                {
                    ...form,
                    id: Date.now(),
                    completada: false
                }
            ]);
        }

        setForm(inicial);
        setEditando(null);
    }

    function completar(id) {
        setTareas(tareas.map(t =>
            t.id === id
                ? { ...t, completada: !t.completada }
                : t
        ));
    }

    function eliminar(id) {
        if (confirm('¿Eliminar esta tarea?')) {
            setTareas(tareas.filter(t => t.id !== id));

            if (editando === id) {
                setEditando(null);
                setForm(inicial);
            }
        }
    }

    function editar(tarea) {
        setForm({
            titulo: tarea.titulo,
            materia: tarea.materia,
            fecha: tarea.fecha,
            prioridad: tarea.prioridad
        });

        setEditando(tarea.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const visibles = tareas.filter(t =>
        filtro === 'Todas' ||
        (filtro === 'Pendientes' && !t.completada) ||
        (filtro === 'Terminadas' && t.completada)
    );

    return (
        <main className="container">
            <header>
                <span>🎓 INGENIERÍA EN COMPUTACIÓN</span>
                <h1>Sobreviviendo a Ingeniería</h1>
                <p>Un semestre más, una crisis menos.</p>
            </header>

            <section className="stats">
                <article>
                    <strong>{tareas.length}</strong>
                    <p>Tareas totales</p>
                </article>
                <article>
                    <strong>{pendientes}</strong>
                    <p>Pendientes</p>
                </article>
                <article>
                    <strong>{terminadas}</strong>
                    <p>Terminadas</p>
                </article>
            </section>

            <section className="panel">
                <div className="progress-title">
                    <h3>Progreso de tareas</h3>
                    <strong>{progreso}%</strong>
                </div>

                <div className="progress">
                    <div style={{ width: `${progreso}%` }} />
                </div>

                <p className="message">
                    {progreso === 100
                        ? '¡Sobreviviste a todas tus tareas! 🎉'
                        : 'Cada tarea terminada es una crisis menos.'}
                </p>
            </section>

            <section className="panel">
                <h2>{editando !== null ? 'Editar tarea' : 'Nueva tarea'}</h2>

                <form onSubmit={guardar}>
                    <input
                        placeholder="Nombre de la tarea"
                        value={form.titulo}
                        onChange={e => setForm({
                            ...form, titulo: e.target.value
                        })}
                        required
                    />

                    <select
                        value={form.materia}
                        onChange={e => setForm({
                            ...form, materia: e.target.value
                        })}
                    >
                        {materias.map(m =>
                            <option key={m}>{m}</option>
                        )}
                    </select>

                    <label>
                        Fecha de entrega
                        <input
                            type="date"
                            value={form.fecha}
                            onChange={e => setForm({
                                ...form, fecha: e.target.value
                            })}
                            required
                        />
                    </label>

                    <label>
                        Prioridad
                        <select
                            value={form.prioridad}
                            onChange={e => setForm({
                                ...form, prioridad: e.target.value
                            })}
                        >
                            <option>Alta</option>
                            <option>Media</option>
                            <option>Baja</option>
                        </select>
                    </label>

                    <button type="submit">
                        {editando !== null
                            ? 'Guardar cambios'
                            : '+ Agregar tarea'}
                    </button>

                    {editando !== null && (
                        <button type="button" onClick={() => {
                            setEditando(null);
                            setForm(inicial);
                        }}>
                            Cancelar
                        </button>
                    )}
                </form>
            </section>

            <section className="panel">
                <h2>Mis tareas</h2>

                <div className="filters">
                    {['Todas', 'Pendientes', 'Terminadas'].map(f => (
                        <button
                            key={f}
                            className={filtro === f ? 'active' : ''}
                            onClick={() => setFiltro(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {visibles.length === 0 && (
                    <p className="empty">No hay tareas en esta sección. ☕</p>
                )}

                {visibles.map(t => (
                    <article
                        key={t.id}
                        className={`task ${t.completada ? 'done' : ''}`}
                    >
                        <input
                            type="checkbox"
                            checked={t.completada}
                            onChange={() => completar(t.id)}
                            aria-label="Marcar tarea como completada"
                        />

                        <div className="task-info">
                            <h3>{t.titulo}</h3>
                            <p>{t.materia}</p>
                            <small>📅 {t.fecha}</small>
                        </div>

                        <span className={`priority ${t.prioridad.toLowerCase()}`}>
                            {t.prioridad}
                        </span>

                        <div className="actions">
                            <button onClick={() => editar(t)}>✏️</button>
                            <button onClick={() => eliminar(t.id)}>🗑️</button>
                        </div>
                    </article>
                ))}
            </section>

            <footer>
                <p>Hecho con React, café y estrés universitario.</p>
                <small>Luis Ricardo Delgado Sevilla | 2026</small>
            </footer>
        </main>
    );
}
