# Cómo contribuir — Mediastream Academy

Guía rápida para editar el curso en equipo sin pisarnos. Pensada para editores (no requiere ser experto en git).

---

## 1. Clonar el proyecto (solo la primera vez)

```bash
git clone https://github.com/smontealegrel/Monitoreo-Academy.git
cd Monitoreo-Academy
```

Para abrir la plataforma y verla: doble clic en `index.html` (o en `iniciar-mac.command` / `iniciar-windows.bat`). No requiere instalar nada.

---

## 2. Regla de oro (para no chocar entre editores)

**Siempre `pull` ANTES de empezar a editar, y `push` al terminar.**

```bash
git pull            # trae lo último antes de tocar nada
# ...editas...
git add -A
git commit -m "Describe tu cambio, ej: corrijo límite de grabación del Día 7"
git push
```

Si al hacer `push` te dice que el remoto tiene cambios, primero `git pull` y luego `git push`.

---

## 3. Cambios grandes → usa una rama

Para no arriesgar `main` (la versión estable que usan los nuevos ingresos):

```bash
git checkout -b mejora-quizzes-dia8     # crea y cambia a tu rama
# ...editas, commiteas...
git push -u origin mejora-quizzes-dia8  # sube tu rama
```

Luego abre un **Pull Request** en GitHub para revisar y fusionar a `main`.
Cambios pequeños y seguros (una corrección puntual) se pueden hacer directo en `main`.

---

## 4. Dónde está cada cosa

```
Monitoreo-Academy/
├── index.html                 Página principal (doble clic para abrir)
├── iniciar-mac.command        Abrir en Mac
├── iniciar-windows.bat        Abrir en Windows
├── regenerar-contenido.command  Regenera el bundle tras editar contenido (Mac)
├── construir-bundle.py        Script que genera el bundle
├── assets/                    Código de la app (no tocar salvo cambios de funcionamiento)
│   ├── app.js  store.js  quiz.js  content-loader.js  styles.css
└── contenido/                 AQUÍ SE EDITA EL CURSO
    ├── curso.json             Índice de los 15 días y semanas
    ├── dia-01.json … dia-15.json
    ├── examen-final.json
    └── contenido.js           AUTOGENERADO — no editar a mano
```

---

## 5. Editar contenido o preguntas (lo más común)

Todo el curso vive en `contenido/*.json`. Para cambiar un día, edita su `dia-NN.json`.

Estructura de un día:
```json
{
  "id": 7,
  "titulo": "…",
  "objetivo": "…",
  "bloques": [
    { "id": "b1", "tipo": "teoria|practica|shadowing|ejercicio",
      "titulo": "…", "duracion": "60 min",
      "html": "contenido en HTML",
      "requiereEvidencia": true }
  ],
  "quiz": {
    "preguntasAMostrar": 10,     // cuántas se muestran del banco
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

### ⚠️ IMPORTANTE — dos pasos al editar contenido
1. **Cuida el JSON:** comillas, comas y llaves. Si rompes el formato, la app no carga ese día.
   Puedes validar con: `python3 -c "import json;json.load(open('contenido/dia-07.json'))"`
2. **Regenera el bundle** para que la versión de doble-clic (file://) muestre los cambios:
   - Mac: doble clic en `regenerar-contenido.command`
   - O por terminal: `python3 construir-bundle.py`

   > Esto reescribe `contenido/contenido.js`. Si no lo regeneras, quien abra `index.html`
   > directamente seguirá viendo el contenido viejo. **Commitea también el `contenido.js` regenerado.**

### Reglas de las preguntas
- El **banco** debe ser mayor que `preguntasAMostrar` (recomendado ~12 para mostrar 10),
  así cada intento es distinto y no se memorizan.
- Con umbral 90% y 10 preguntas: fallar 1 = 90% (aprueba), fallar 2 = 80% (no aprueba).
- Preguntas **operativas del rol** (diagnóstico, "¿qué revisas?", "¿dónde se configura?"),
  no memorizar datos sueltos.

---

## 6. Veracidad del contenido

Algunos datos internos (límites, números, flujos) aún están **por validar** con un senior.
Ver `VALIDACION-CONTENIDO.md`. Si confirmas o corriges un dato, actualízalo en el `dia-NN.json`,
regenera el bundle y márcalo en ese checklist. **No inventes datos**: si no estás seguro, déjalo marcado para validar.

---

## 7. Nota sobre el progreso de los estudiantes

El avance de cada alumno se guarda en el navegador de **su** PC (no viaja con git).
Editar el curso y el progreso de los alumnos son cosas separadas: tus cambios al contenido
no borran el avance de nadie.
