/*
 * store.js — Persistencia local (por PC / navegador).
 * Guarda: usuario, progreso por día, bloques completados, historial de intentos.
 * Todo vive en localStorage → sobrevive a cerrar el navegador y reiniciar el PC.
 * No hay servidor central: cada PC tiene su propia copia. Se puede exportar/importar.
 */
(function () {
  "use strict";

  var KEY = "mdstrm_academy_v1";

  function nowISO() { return new Date().toISOString(); }

  function blank() {
    return {
      version: 1,
      user: null,            // { nombre, iniciadoEn }
      dias: {},              // { "1": { bloques: {id:true}, evidencias:{}, intentos:[], mejorScore, aprobado } }
      examenFinal: {         // examen integrador final
        intentos: [],
        mejorScore: 0,
        aprobado: false
      },
      actualizadoEn: null
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return blank();
      var data = JSON.parse(raw);
      if (!data || typeof data !== "object") return blank();
      // merge defensivo con estructura por defecto
      var b = blank();
      data.user = data.user || b.user;
      data.dias = data.dias || b.dias;
      data.examenFinal = data.examenFinal || b.examenFinal;
      return data;
    } catch (e) {
      console.warn("No se pudo leer el progreso, empezando limpio.", e);
      return blank();
    }
  }

  function save(data) {
    data.actualizadoEn = nowISO();
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      alert("No se pudo guardar el progreso localmente. ¿El almacenamiento del navegador está lleno o bloqueado?");
      console.error(e);
    }
    return data;
  }

  function dayRecord(data, diaId) {
    var k = String(diaId);
    if (!data.dias[k]) {
      data.dias[k] = { bloques: {}, evidencias: {}, intentos: [], mejorScore: 0, aprobado: false };
    }
    return data.dias[k];
  }

  var Store = {
    KEY: KEY,

    get: load,

    setUser: function (nombre) {
      var d = load();
      d.user = { nombre: nombre, iniciadoEn: nowISO() };
      return save(d);
    },

    resetAll: function () {
      localStorage.removeItem(KEY);
      return blank();
    },

    // -------- Bloques (checklist del día) --------
    setBloque: function (diaId, bloqueId, done) {
      var d = load();
      var rec = dayRecord(d, diaId);
      if (done) rec.bloques[bloqueId] = true;
      else delete rec.bloques[bloqueId];
      return save(d);
    },

    setEvidencia: function (diaId, bloqueId, texto) {
      var d = load();
      var rec = dayRecord(d, diaId);
      rec.evidencias[bloqueId] = texto;
      return save(d);
    },

    bloquesCompletos: function (diaId, idsRequeridos) {
      var d = load();
      var rec = dayRecord(d, diaId);
      return idsRequeridos.every(function (id) { return !!rec.bloques[id]; });
    },

    // -------- Intentos de quiz --------
    registrarIntento: function (diaId, intento) {
      // intento: { fecha, score, aprobado, correctas, total, objetivosFallados[] }
      var d = load();
      var rec = dayRecord(d, diaId);
      rec.intentos.push(intento);
      if (intento.score > rec.mejorScore) rec.mejorScore = intento.score;
      if (intento.aprobado) rec.aprobado = true;
      return save(d);
    },

    registrarIntentoFinal: function (intento) {
      var d = load();
      d.examenFinal.intentos.push(intento);
      if (intento.score > d.examenFinal.mejorScore) d.examenFinal.mejorScore = intento.score;
      if (intento.aprobado) d.examenFinal.aprobado = true;
      return save(d);
    },

    // -------- Consultas de estado --------
    diaAprobado: function (diaId) {
      var d = load();
      var rec = d.dias[String(diaId)];
      return !!(rec && rec.aprobado);
    },

    intentosFinal: function () {
      return load().examenFinal.intentos.length;
    },

    // -------- Exportar / importar (respaldo) --------
    exportar: function () {
      var d = load();
      var blob = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      var nombre = (d.user && d.user.nombre ? d.user.nombre.replace(/\s+/g, "_") : "progreso");
      a.href = url;
      a.download = "mediastream_academy_" + nombre + ".json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    importar: function (fileText) {
      var data = JSON.parse(fileText);
      if (!data || !data.dias) throw new Error("Archivo de respaldo inválido.");
      save(data);
      return data;
    }
  };

  window.Store = Store;
})();
