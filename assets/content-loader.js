/*
 * content-loader.js — Carga el contenido del curso desde /contenido (archivos JSON).
 * Editar contenido/preguntas = editar esos JSON, sin tocar el código de la app.
 */
(function () {
  "use strict";

  var cache = {};

  async function getJSON(path) {
    if (cache[path]) return cache[path];
    var res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo cargar " + path + " (HTTP " + res.status + ")");
    var data = await res.json();
    cache[path] = data;
    return data;
  }

  var Content = {
    curso: function () { return getJSON("contenido/curso.json"); },
    dia: function (id) {
      var n = String(id).padStart(2, "0");
      return getJSON("contenido/dia-" + n + ".json");
    },
    examenFinal: function () { return getJSON("contenido/examen-final.json"); }
  };

  window.Content = Content;
})();
