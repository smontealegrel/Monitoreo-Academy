# Mediastream Academy — Plataforma de inducción de Soporte Técnico

Plataforma de aprendizaje local para nuevos ingresos del área de Soporte. Programa de **15 días**,
paginado día a día, con **quizzes de dominio** (metodología *mastery learning*) y un **examen final**.

---

## Cómo iniciarla (CERO INSTALACIÓN)

No requiere instalar nada (ni Python, ni Node, ni servidor). Cada nuevo ingreso:

1. Copia la carpeta `mediastream-academy` a su PC (por ZIP, carpeta de red o USB).
2. La abre con **doble clic**:
   - **Windows:** doble clic en `iniciar-windows.bat` (o directamente en `index.html`).
   - **Mac:** doble clic en `iniciar-mac.command` (o clic derecho en `index.html` → Abrir con → navegador).
     - Si Mac bloquea el `.command` la 1ª vez: clic derecho → **Abrir** → **Abrir**.
3. Se abre la plataforma en el navegador. Escribe tu nombre y empieza.

> Funciona abriendo `index.html` como archivo local (file://). El contenido va empaquetado
> en `contenido/contenido.js`, por eso no necesita servidor.

**Importante — el progreso se guarda en el navegador de ESE PC.** Cada persona en su equipo
tiene su propio avance. Recomendación: que cada uno use **el mismo navegador** siempre (Chrome/Edge)
y no borre datos de navegación. Como respaldo, en "Mi progreso" pueden **Exportar** su avance a un archivo.

---

## Cómo funciona para el estudiante

1. Escribe su **nombre** al entrar (se guarda en ese equipo).
2. Ve la **ruta de 15 días**. Solo el Día 1 está disponible al inicio.
3. Cada día tiene una **jornada de 8 horas** con bloques:
   - 📘 Teoría (en la plataforma)
   - 🛠️ Práctica en sandbox
   - 👀 Shadowing
   - ✍️ Ejercicio aplicado
   - 🎯 **Quiz de dominio**
4. Debe **marcar como completados** los bloques para habilitar el quiz.
5. El **quiz** tiene:
   - Preguntas al azar del banco (barajadas en cada intento).
   - Aprobación mínima **90 %**.
   - **Intentos ilimitados**.
   - Si no aprueba: solo ve **qué temas repasar**, nunca las respuestas correctas.
   - Si aprueba: se muestran las respuestas correctas con su explicación.
6. Aprobar el quiz **desbloquea el día siguiente**.
7. Al completar los 15 días se habilita el **Examen Final** (integrador, **3 intentos**).
8. En **Mi progreso** puede ver el historial de intentos, exportar un respaldo (.json) e importarlo.

---

## Estructura de archivos

```
mediastream-academy/
├── index.html                 Página principal
├── iniciar-mac.command        Lanzador Mac
├── iniciar-windows.bat        Lanzador Windows
├── assets/
│   ├── styles.css             Diseño
│   ├── store.js               Guardado local (localStorage)
│   ├── content-loader.js      Carga del contenido
│   ├── quiz.js                Motor de evaluación
│   └── app.js                 Router y vistas
└── contenido/
    ├── curso.json             Índice de los 15 días y semanas
    ├── dia-01.json … dia-15.json
    └── examen-final.json
```

---

## Cómo editar el contenido o las preguntas (sin tocar código)

Todo el contenido vive en `contenido/*.json`. Para cambiar un día, edita su archivo `dia-NN.json`.

Estructura de un día:
```json
{
  "id": 1,
  "titulo": "…",
  "objetivo": "…",
  "bloques": [
    { "id": "b1", "tipo": "teoria|practica|shadowing|ejercicio",
      "titulo": "…", "duracion": "60 min",
      "html": "contenido en HTML",
      "requiereEvidencia": true }
  ],
  "quiz": {
    "preguntasAMostrar": 8,      // cuántas se muestran de las del banco
    "umbral": 90,                // % mínimo para aprobar
    "banco": [
      { "enunciado": "…",
        "tipo": "single|multi",  // single = una respuesta; multi = varias
        "opciones": ["a","b","c","d"],
        "correctas": [0],         // índices correctos (0 = primera opción)
        "objetivo": "tema",       // se muestra como 'tema a repasar' si falla
        "explicacion": "…" }      // se muestra al aprobar
    ]
  }
}
```

**Regla de cantidad de preguntas:** el banco debe ser mayor que `preguntasAMostrar`
(recomendado ~1.5×) para que cada intento sea distinto y no se memoricen posiciones.

**Tras editar los JSON**, regenera el bundle para que la versión de doble-clic (file://) muestre
los cambios: doble clic en **`regenerar-contenido.command`** (Mac) o ejecuta `python3 construir-bundle.py`.
Esto reescribe `contenido/contenido.js`. Luego vuelve a compartir la carpeta.

> Los `dia-NN.json` son la fuente de edición. `contenido/contenido.js` es un archivo **autogenerado**
> (no lo edites a mano). El flujo es: editar JSON → regenerar bundle → distribuir.

---

## Notas importantes

- **Datos por equipo:** el progreso se guarda en el navegador de cada PC (localStorage). No hay
  servidor central. Cada estudiante usa su propio equipo. El botón **Exportar respaldo** en
  "Mi progreso" permite guardar/entregar el avance como archivo `.json`.
- **Seguridad:** el contenido de este curso **no incluye credenciales reales de clientes**. El manual
  original tenía IPs y contraseñas de clientes (Megamedia, Win Sports, etc.); aquí se enseña el
  *concepto* de acceso remoto y el uso del gestor de contraseñas, nunca las credenciales.
- **Reiniciar progreso:** botón en "Mi progreso" (borra todo lo del equipo, no se puede deshacer).
```
