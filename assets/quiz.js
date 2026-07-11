/*
 * quiz.js — Motor de evaluación (mastery learning).
 * - Saca N preguntas al azar del banco y baraja el orden de las opciones.
 * - Soporta: opción única (single), verdadero/falso (boolean), selección múltiple (multi).
 * - Umbral configurable (por defecto 90%).
 * - Calcula objetivos fallados para dar retroalimentación SIN revelar respuestas.
 */
(function () {
  "use strict";

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* Construye un intento a partir de un banco de preguntas. */
  function armar(banco, cantidad) {
    var seleccion = shuffle(banco).slice(0, Math.min(cantidad, banco.length));
    return seleccion.map(function (q, idx) {
      // Barajamos opciones manteniendo el índice correcto.
      var opciones = q.opciones.map(function (texto, i) {
        return { texto: texto, correcta: (q.correctas || []).indexOf(i) !== -1 };
      });
      return {
        uid: idx,
        enunciado: q.enunciado,
        tipo: q.tipo || (q.correctas && q.correctas.length > 1 ? "multi" : "single"),
        objetivo: q.objetivo || "General",
        explicacion: q.explicacion || "",
        opciones: shuffle(opciones)
      };
    });
  }

  /* Corrige. respuestas = { uid: [indicesSeleccionados] } */
  function corregir(preguntas, respuestas, umbral) {
    umbral = umbral || 90;
    var total = preguntas.length;
    var correctas = 0;
    var objetivosFallados = {};
    var detalle = [];

    preguntas.forEach(function (q) {
      var sel = (respuestas[q.uid] || []).slice().sort();
      var correctasIdx = [];
      q.opciones.forEach(function (o, i) { if (o.correcta) correctasIdx.push(i); });
      correctasIdx.sort();

      var acierto = sel.length === correctasIdx.length &&
        sel.every(function (v, i) { return v === correctasIdx[i]; });

      if (acierto) correctas++;
      else objetivosFallados[q.objetivo] = true;

      detalle.push({ uid: q.uid, acierto: acierto, seleccion: sel, correctas: correctasIdx });
    });

    var score = total === 0 ? 0 : Math.round((correctas / total) * 100);
    return {
      total: total,
      correctas: correctas,
      score: score,
      aprobado: score >= umbral,
      objetivosFallados: Object.keys(objetivosFallados),
      detalle: detalle
    };
  }

  window.Quiz = { armar: armar, corregir: corregir, shuffle: shuffle };
})();
