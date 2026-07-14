/*
 * content-loader.js — Entrega el contenido del curso a la app.
 *
 * Dos modos, transparentes para la app:
 *  1) BUNDLE (cero instalación): si existe window.__MDSTRM_CONTENT (cargado por
 *     contenido/contenido.js), se usa directamente. Permite abrir index.html con
 *     doble clic (file://) SIN servidor, Python ni Node.
 *  2) FETCH: si no hay bundle, se cargan los .json por red (cuando se sirve por
 *     un servidor local). Útil para editar contenido sin regenerar el bundle.
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

  function bundle() { return window.__MDSTRM_CONTENT || null; }

  var Content = {
    curso: async function () {
      var b = bundle();
      if (b) return b.curso;
      return getJSON("contenido/curso.json");
    },
    dia: async function (id) {
      var b = bundle();
      if (b) {
        var d = b.dias[String(id)];
        if (!d) throw new Error("Día " + id + " no encontrado en el contenido.");
        return d;
      }
      var n = String(id).padStart(2, "0");
      return getJSON("contenido/dia-" + n + ".json");
    },
    examenFinal: async function () {
      var b = bundle();
      if (b) return b.examenFinal;
      return getJSON("contenido/examen-final.json");
    }
  };

  window.Content = Content;
})();
