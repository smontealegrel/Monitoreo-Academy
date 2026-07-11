/*
 * app.js — Router + vistas de Mediastream Academy.
 * Vanilla JS, sin dependencias. Renderiza sobre #app según el hash de la URL.
 */
(function () {
  "use strict";

  var app = document.getElementById("app");
  var userChip = document.getElementById("user-chip");

  // ---------- utilidades ----------
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function el(html) {
    var t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function fmtFecha(iso) {
    try {
      var d = new Date(iso);
      return d.toLocaleDateString("es", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
    } catch (e) { return iso; }
  }

  var ICONOS = { teoria: "📘", practica: "🛠️", shadowing: "👀", ejercicio: "✍️", quiz: "🎯" };
  var TIPO_LABEL = { teoria: "Teoría", practica: "Práctica en sandbox", shadowing: "Shadowing", ejercicio: "Ejercicio aplicado" };

  // ---------- navegación ----------
  function go(hash) { location.hash = hash; }
  function setNav(name) {
    document.querySelectorAll("[data-nav]").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-nav") === name);
    });
  }
  function refreshUserChip() {
    var d = Store.get();
    if (d.user && d.user.nombre) {
      userChip.textContent = "👤 " + d.user.nombre;
      userChip.classList.remove("hidden");
    } else {
      userChip.classList.add("hidden");
    }
  }

  // ========================================================
  //  VISTA: Bienvenida / registro de nombre
  // ========================================================
  function viewWelcome() {
    setNav("home");
    app.innerHTML = "";
    var card = el(
      '<div class="card welcome">' +
        '<span class="brand-mark" style="margin:0 auto;width:44px;height:44px;font-size:20px;">▶</span>' +
        '<h1>Bienvenido/a a Mediastream Academy</h1>' +
        '<p>Programa de inducción · Área de Soporte Técnico · 15 días</p>' +
        '<div class="field">' +
          '<label>¿Cómo te llamas?</label>' +
          '<input id="nombre" type="text" placeholder="Nombre y apellido" autocomplete="off" />' +
        '</div>' +
        '<button class="btn btn-primary btn-lg" id="empezar" style="width:100%;">Comenzar mi capacitación</button>' +
        '<p style="font-size:12px;margin-top:18px;">Tu progreso se guarda en este equipo. Puedes exportarlo como respaldo desde “Mi progreso”.</p>' +
      '</div>'
    );
    app.appendChild(card);
    var input = card.querySelector("#nombre");
    input.focus();
    function submit() {
      var v = input.value.trim();
      if (!v) { input.focus(); return; }
      Store.setUser(v);
      refreshUserChip();
      go("#/");
    }
    card.querySelector("#empezar").addEventListener("click", submit);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });
  }

  // ========================================================
  //  VISTA: Roadmap (lista de días)
  // ========================================================
  async function viewHome() {
    setNav("home");
    app.innerHTML = '<div class="empty">Cargando ruta de aprendizaje…</div>';
    var curso, data = Store.get();
    try { curso = await Content.curso(); }
    catch (e) { app.innerHTML = '<div class="empty">Error al cargar el curso: ' + esc(e.message) + '</div>'; return; }

    var totalDias = curso.dias.length;
    var aprobados = curso.dias.filter(function (d) { return Store.diaAprobado(d.id); }).length;
    var pct = Math.round((aprobados / totalDias) * 100);

    var head = el(
      '<div class="course-head">' +
        '<h1>' + esc(curso.titulo) + '</h1>' +
        '<div class="sub">' + esc(curso.subtitulo || "") + '</div>' +
        '<div class="progress-bar"><span style="width:' + pct + '%"></span></div>' +
        '<div class="progress-meta">' + aprobados + ' de ' + totalDias + ' días completados · ' + pct + '%</div>' +
      '</div>'
    );
    app.innerHTML = "";
    app.appendChild(head);

    // agrupar por semana
    var semanas = {};
    curso.dias.forEach(function (d) { (semanas[d.semana] = semanas[d.semana] || []).push(d); });

    Object.keys(semanas).sort(function (a, b) { return a - b; }).forEach(function (sem) {
      var label = (curso.semanas && curso.semanas[sem]) || ("Semana " + sem);
      app.appendChild(el('<div class="week-label">Semana ' + sem + ' · ' + esc(label) + '</div>'));
      var grid = el('<div class="day-grid"></div>');
      semanas[sem].forEach(function (dia) {
        grid.appendChild(dayCard(dia, curso, data));
      });
      app.appendChild(grid);
    });

    // examen final
    var todosAprobados = aprobados === totalDias;
    app.appendChild(el('<div class="week-label">Certificación</div>'));
    app.appendChild(finalCard(todosAprobados));
  }

  function estadoDia(dia, curso) {
    // desbloqueado si es el primero o el día anterior está aprobado
    var idx = curso.dias.findIndex(function (d) { return d.id === dia.id; });
    var desbloqueado = idx === 0 || Store.diaAprobado(curso.dias[idx - 1].id);
    var aprobado = Store.diaAprobado(dia.id);
    var rec = Store.get().dias[String(dia.id)];
    var enProgreso = rec && (Object.keys(rec.bloques || {}).length > 0 || (rec.intentos || []).length > 0) && !aprobado;
    if (aprobado) return "done";
    if (!desbloqueado) return "locked";
    if (enProgreso) return "progress";
    return "available";
  }

  function dayCard(dia, curso, data) {
    var estado = estadoDia(dia, curso);
    var rec = data.dias[String(dia.id)];
    var pills = {
      done: '<span class="status-pill pill-done">Aprobado</span>',
      locked: '<span class="status-pill pill-locked">Bloqueado</span>',
      progress: '<span class="status-pill pill-progress">En progreso</span>',
      available: '<span class="status-pill pill-available">Disponible</span>'
    };
    var extra = "";
    if (estado === "done" && rec) extra = '<div class="score-badge">' + rec.mejorScore + '%</div>';
    else if (estado === "locked") extra = '<div class="lock-ico">🔒</div>';

    var clickable = estado !== "locked";
    var tag = clickable ? "a" : "div";
    var href = clickable ? ' href="#/dia/' + dia.id + '"' : "";
    var card = el(
      "<" + tag + href + ' class="day-card ' + (clickable ? "clickable" : "locked") + '">' +
        extra +
        '<div class="daynum">DÍA ' + dia.id + '</div>' +
        pills[estado] +
        '<div class="daytitle">' + esc(dia.titulo) + '</div>' +
        '<div class="daymeta">' + esc(dia.modulo || "") + '</div>' +
      "</" + tag + ">"
    );
    return card;
  }

  function finalCard(habilitado) {
    var aprobado = Store.get().examenFinal.aprobado;
    var estado = aprobado ? "done" : (habilitado ? "available" : "locked");
    var pills = {
      done: '<span class="status-pill pill-done">Certificado</span>',
      available: '<span class="status-pill pill-available">Disponible</span>',
      locked: '<span class="status-pill pill-locked">Completa los 15 días</span>'
    };
    var clickable = habilitado || aprobado;
    var tag = clickable ? "a" : "div";
    var href = clickable ? ' href="#/examen"' : "";
    return el(
      "<" + tag + href + ' class="day-card ' + (clickable ? "clickable" : "locked") + '" style="border-color:var(--lime);">' +
        (clickable ? "" : '<div class="lock-ico">🔒</div>') +
        '<div class="daynum" style="color:var(--navy)">🏆 EXAMEN FINAL</div>' +
        pills[estado] +
        '<div class="daytitle">Certificación de Soporte Técnico</div>' +
        '<div class="daymeta">Evaluación integradora de los 15 días · intentos limitados</div>' +
      "</" + tag + ">"
    );
  }

  // ========================================================
  //  VISTA: Día (bloques + checklist + quiz)
  // ========================================================
  async function viewDia(id) {
    setNav("home");
    app.innerHTML = '<div class="empty">Cargando día…</div>';
    var curso = await Content.curso();
    var dia;
    try { dia = await Content.dia(id); }
    catch (e) { app.innerHTML = '<div class="empty">Error: ' + esc(e.message) + '</div>'; return; }

    // verificar desbloqueo
    var idx = curso.dias.findIndex(function (d) { return d.id === dia.id; });
    var desbloqueado = idx === 0 || Store.diaAprobado(curso.dias[idx - 1].id);
    if (!desbloqueado) {
      app.innerHTML = '<div class="card quiz-gate"><div class="lock-big">🔒</div>' +
        '<h2>Día bloqueado</h2><p>Debes aprobar el Día ' + (dia.id - 1) + ' (quiz ≥ ' + (dia.quiz.umbral || 90) + '%) para desbloquear este día.</p>' +
        '<a class="btn btn-primary" href="#/dia/' + (dia.id - 1) + '">Ir al Día ' + (dia.id - 1) + '</a></div>';
      return;
    }

    render();

    function render() {
      var data = Store.get();
      var rec = data.dias[String(dia.id)] || { bloques: {}, evidencias: {}, intentos: [] };
      app.innerHTML = "";

      app.appendChild(el('<div class="daybar"><a class="back-link" href="#/">← Volver a la ruta</a></div>'));

      var hero = el(
        '<div class="card day-hero">' +
          '<div class="kicker">Día ' + dia.id + ' · ' + esc(dia.modulo || "") + '</div>' +
          '<h1>' + esc(dia.titulo) + '</h1>' +
          '<div class="objective"><b>🎯 Objetivo del día:</b> ' + dia.objetivo + '</div>' +
        '</div>'
      );
      app.appendChild(hero);

      // bloques (no-quiz)
      dia.bloques.forEach(function (b) {
        app.appendChild(bloqueCard(dia.id, b, rec, render));
      });

      // ¿todos los bloques requeridos completos?
      var requeridos = dia.bloques.map(function (b) { return b.id; });
      var listos = requeridos.every(function (bid) { return rec.bloques[bid]; });

      app.appendChild(quizBlock(dia, rec, listos, render));
    }
  }

  function bloqueCard(diaId, b, rec, rerender) {
    var done = !!rec.bloques[b.id];
    var card = el(
      '<div class="block">' +
        '<div class="block-head">' +
          '<div class="block-icon ic-' + b.tipo + '">' + (ICONOS[b.tipo] || "•") + '</div>' +
          '<div class="block-titles">' +
            '<div class="bt">' + esc(b.titulo) + '</div>' +
            '<div class="bm">' + (TIPO_LABEL[b.tipo] || "") + (b.duracion ? " · " + esc(b.duracion) : "") + '</div>' +
          '</div>' +
          '<div class="block-check ' + (done ? "done" : "") + '">' + (done ? "✓" : "") + '</div>' +
        '</div>' +
        '<div class="block-body collapsed">' + b.html +
          '<div class="block-actions"></div>' +
        '</div>' +
      '</div>'
    );

    var head = card.querySelector(".block-head");
    var body = card.querySelector(".block-body");
    var actions = card.querySelector(".block-actions");
    var check = card.querySelector(".block-check");

    head.addEventListener("click", function (e) {
      if (e.target === check || check.contains(e.target)) return;
      body.classList.toggle("collapsed");
    });

    // evidencia opcional
    if (b.requiereEvidencia) {
      var ev = el('<div class="evidence-note">📎 Registra tu evidencia / respuesta (queda guardada):' +
        '<input type="text" placeholder="Ej: link a captura, resultado, nota…" /></div>');
      var inp = ev.querySelector("input");
      inp.value = (rec.evidencias && rec.evidencias[b.id]) || "";
      inp.addEventListener("change", function () { Store.setEvidencia(diaId, b.id, inp.value); });
      actions.appendChild(ev);
    }

    var btn = el('<button class="btn ' + (done ? "btn-ghost" : "btn-primary") + '">' +
      (done ? "✓ Completado — desmarcar" : "Marcar como completado") + '</button>');
    btn.addEventListener("click", function () {
      Store.setBloque(diaId, b.id, !done);
      rerender();
    });
    actions.appendChild(btn);

    return card;
  }

  function quizBlock(dia, rec, listos, rerender) {
    var umbral = dia.quiz.umbral || 90;
    var nPreg = dia.quiz.preguntasAMostrar || Math.min(8, dia.quiz.banco.length);
    var aprobado = rec.aprobado;
    var mejor = rec.mejorScore || 0;
    var intentos = (rec.intentos || []).length;

    var card = el(
      '<div class="block" style="border-color:' + (aprobado ? "var(--ok)" : "var(--line)") + '">' +
        '<div class="block-head">' +
          '<div class="block-icon ic-quiz">🎯</div>' +
          '<div class="block-titles">' +
            '<div class="bt">Quiz de dominio del día</div>' +
            '<div class="bm">' + nPreg + ' preguntas · aprobación ≥ ' + umbral + '% · intentos ilimitados</div>' +
          '</div>' +
          '<div class="block-check ' + (aprobado ? "done" : "lockedmark") + '">' + (aprobado ? "✓" : (listos ? "" : "🔒")) + '</div>' +
        '</div>' +
        '<div class="block-body"></div>' +
      '</div>'
    );
    var body = card.querySelector(".block-body");

    if (!listos && !aprobado) {
      body.innerHTML = '<div class="quiz-gate"><div class="lock-big">🔒</div>' +
        '<h2>Completa primero los bloques del día</h2>' +
        '<p>Marca la teoría, la práctica, el shadowing y el ejercicio como completados para habilitar el quiz.</p></div>';
      return card;
    }

    var estadoLinea = aprobado
      ? '<div class="callout key"><span class="ct">✅ Día aprobado con ' + mejor + '%</span>Puedes repetir el quiz para repasar. Al aprobar se muestran las respuestas correctas con su explicación.</div>'
      : (intentos > 0
        ? '<div class="callout warn"><span class="ct">Aún no apruebas</span>Mejor intento: ' + mejor + '%. Necesitas ≥ ' + umbral + '%. Intentos realizados: ' + intentos + ' (ilimitados).</div>'
        : '<div class="callout tip"><span class="ct">Todo listo</span>Cuando quieras, inicia el quiz de dominio.</div>');

    body.innerHTML = estadoLinea +
      '<div class="quiz-stats">' +
        '<div class="quiz-stat"><div class="n">' + nPreg + '</div><div class="l">preguntas</div></div>' +
        '<div class="quiz-stat"><div class="n">' + umbral + '%</div><div class="l">para aprobar</div></div>' +
        '<div class="quiz-stat"><div class="n">' + mejor + '%</div><div class="l">mejor intento</div></div>' +
        '<div class="quiz-stat"><div class="n">' + intentos + '</div><div class="l">intentos</div></div>' +
      '</div>' +
      '<div class="block-actions"></div>';

    var btn = el('<button class="btn btn-primary btn-lg">' + (intentos > 0 ? "Reintentar quiz" : "Iniciar quiz") + '</button>');
    btn.addEventListener("click", function () { go("#/dia/" + dia.id + "/quiz"); });
    body.querySelector(".block-actions").appendChild(btn);
    return card;
  }

  // ========================================================
  //  VISTA: Tomar quiz (día o examen final)
  // ========================================================
  async function viewQuiz(diaId) {
    setNav("home");
    var dia = await Content.dia(diaId);
    var umbral = dia.quiz.umbral || 90;
    var nPreg = dia.quiz.preguntasAMostrar || Math.min(8, dia.quiz.banco.length);
    var preguntas = Quiz.armar(dia.quiz.banco, nPreg);
    renderQuizRunner({
      titulo: "Día " + dia.id + " · " + dia.titulo,
      volver: "#/dia/" + dia.id,
      preguntas: preguntas,
      umbral: umbral,
      rerun: function () { viewQuiz(diaId); },
      onFinish: function (res) {
        Store.registrarIntento(dia.id, {
          fecha: new Date().toISOString(), score: res.score, aprobado: res.aprobado,
          correctas: res.correctas, total: res.total, objetivosFallados: res.objetivosFallados
        });
      },
      volverLabel: "Volver al día"
    });
  }

  async function viewExamen() {
    setNav("home");
    var ex = await Content.examenFinal();
    var maxIntentos = ex.maxIntentos || 3;
    var hechos = Store.intentosFinal();
    var aprobado = Store.get().examenFinal.aprobado;

    // pantalla de intro del examen final
    app.innerHTML = "";
    app.appendChild(el('<div class="daybar"><a class="back-link" href="#/">← Volver a la ruta</a></div>'));

    if (aprobado) {
      var m = Store.get().examenFinal.mejorScore;
      app.appendChild(el('<div class="card result pass"><div style="font-size:44px">🏆</div>' +
        '<h2>¡Certificación aprobada!</h2><div class="score">' + m + '%</div>' +
        '<p>Completaste la inducción de Soporte Técnico de Mediastream. Puedes exportar tu reporte desde “Mi progreso”.</p>' +
        '<a class="btn btn-primary" href="#/progreso">Ver mi progreso</a></div>'));
      return;
    }

    if (hechos >= maxIntentos) {
      app.appendChild(el('<div class="card quiz-gate"><div class="lock-big">⛔</div>' +
        '<h2>Sin intentos disponibles</h2><p>Has usado los ' + maxIntentos + ' intentos del examen final. Contacta a tu supervisor para reactivarlo.</p></div>'));
      return;
    }

    var intro = el('<div class="card quiz-intro">' +
      '<h2>🏆 Examen Final · Certificación</h2>' +
      '<p>Evaluación integradora de los 15 días. A diferencia de los quizzes diarios, este examen tiene <b>intentos limitados</b>.</p>' +
      '<div class="quiz-stats">' +
        '<div class="quiz-stat"><div class="n">' + (ex.preguntasAMostrar || ex.banco.length) + '</div><div class="l">preguntas</div></div>' +
        '<div class="quiz-stat"><div class="n">' + (ex.umbral || 90) + '%</div><div class="l">para aprobar</div></div>' +
        '<div class="quiz-stat"><div class="n">' + (maxIntentos - hechos) + '</div><div class="l">intentos restantes</div></div>' +
      '</div>' +
      '<div class="callout warn"><span class="ct">Antes de empezar</span>Trabaja sin ayuda. Las respuestas correctas solo se mostrarán si apruebas con ≥ ' + (ex.umbral || 90) + '%.</div>' +
      '<div class="block-actions"><button class="btn btn-primary btn-lg" id="startFinal">Comenzar examen final</button></div>' +
    '</div>');
    app.appendChild(intro);
    intro.querySelector("#startFinal").addEventListener("click", function () {
      var preguntas = Quiz.armar(ex.banco, ex.preguntasAMostrar || ex.banco.length);
      renderQuizRunner({
        titulo: "Examen Final · Certificación",
        volver: "#/examen",
        preguntas: preguntas,
        umbral: ex.umbral || 90,
        esFinal: true,
        onFinish: function (res) {
          Store.registrarIntentoFinal({
            fecha: new Date().toISOString(), score: res.score, aprobado: res.aprobado,
            correctas: res.correctas, total: res.total, objetivosFallados: res.objetivosFallados
          });
        },
        volverLabel: "Volver"
      });
    });
  }

  function renderQuizRunner(cfg) {
    var respuestas = {};
    app.innerHTML = "";
    app.appendChild(el('<div class="daybar"><a class="back-link" href="' + cfg.volver + '">← Salir sin guardar</a></div>'));
    app.appendChild(el('<div class="course-head"><h1>' + esc(cfg.titulo) + '</h1><div class="sub">Responde todas las preguntas. Umbral de aprobación: ' + cfg.umbral + '%.</div></div>'));

    var form = el('<div></div>');
    cfg.preguntas.forEach(function (q, i) {
      var qc = el('<div class="card q-card" data-uid="' + q.uid + '">' +
        '<div class="q-num">PREGUNTA ' + (i + 1) + ' de ' + cfg.preguntas.length + (q.tipo === "multi" ? ' · selección múltiple' : '') + '</div>' +
        '<div class="q-text">' + esc(q.enunciado) + '</div>' +
        '<div class="opts"></div>' +
      '</div>');
      var opts = qc.querySelector(".opts");
      var inputType = q.tipo === "multi" ? "checkbox" : "radio";
      q.opciones.forEach(function (o, oi) {
        var opt = el('<label class="opt"><input type="' + inputType + '" name="q' + q.uid + '" value="' + oi + '" /><span>' + esc(o.texto) + '</span></label>');
        var input = opt.querySelector("input");
        input.addEventListener("change", function () {
          if (q.tipo === "multi") {
            respuestas[q.uid] = respuestas[q.uid] || [];
            if (input.checked) respuestas[q.uid].push(oi);
            else respuestas[q.uid] = respuestas[q.uid].filter(function (x) { return x !== oi; });
          } else {
            respuestas[q.uid] = [oi];
          }
          opts.querySelectorAll(".opt").forEach(function (l) {
            var inp = l.querySelector("input");
            l.classList.toggle("selected", inp.checked);
          });
        });
        opts.appendChild(opt);
      });
      form.appendChild(qc);
    });
    app.appendChild(form);

    var submitBar = el('<div class="toolbar"><button class="btn btn-primary btn-lg" id="entregar">Entregar respuestas</button></div>');
    app.appendChild(submitBar);

    submitBar.querySelector("#entregar").addEventListener("click", function () {
      var sinResponder = cfg.preguntas.filter(function (q) { return !respuestas[q.uid] || respuestas[q.uid].length === 0; });
      if (sinResponder.length > 0) {
        if (!confirm("Tienes " + sinResponder.length + " pregunta(s) sin responder, contarán como incorrectas. ¿Entregar de todos modos?")) return;
      }
      var res = Quiz.corregir(cfg.preguntas, respuestas, cfg.umbral);
      if (cfg.onFinish) cfg.onFinish(res);
      renderResultado(cfg, res, respuestas);
    });
  }

  function renderResultado(cfg, res, respuestas) {
    app.innerHTML = "";
    var clase = res.aprobado ? "pass" : "fail";
    var head = el('<div class="card result ' + clase + '">' +
      '<h2>' + (res.aprobado ? "¡Aprobado! 🎉" : "Aún no alcanzas el mínimo") + '</h2>' +
      '<div class="score">' + res.score + '%</div>' +
      '<p>' + res.correctas + ' de ' + res.total + ' correctas · mínimo requerido ' + cfg.umbral + '%</p>' +
    '</div>');

    if (!res.aprobado) {
      var lista = res.objetivosFallados.map(function (o) { return '<li>' + esc(o) + '</li>'; }).join("");
      head.appendChild(el(
        '<div class="failed-topics"><b>Temas a repasar</b> (no se muestran las respuestas correctas hasta aprobar):<ul>' + lista + '</ul></div>'
      ));
      app.appendChild(head);

      var acts = el('<div class="toolbar" style="justify-content:center"></div>');
      if (cfg.esFinal) {
        acts.appendChild(el('<a class="btn btn-primary" href="' + cfg.volver + '">' + esc(cfg.volverLabel || "Volver") + '</a>'));
      } else {
        var reBtn = el('<button class="btn btn-primary">Reintentar ahora</button>');
        reBtn.addEventListener("click", function () {
          if (cfg.rerun) cfg.rerun();
        });
        acts.appendChild(reBtn);
        acts.appendChild(el('<a class="btn btn-ghost" href="' + cfg.volver + '">Volver al día</a>'));
      }
      app.appendChild(acts);
      return;
    }

    // aprobado → mostrar revisión con respuestas correctas + explicación
    app.appendChild(head);
    app.appendChild(el('<div class="course-head" style="margin-top:20px"><h1>Revisión</h1><div class="sub">Respuestas correctas y explicaciones (visibles porque aprobaste).</div></div>'));
    cfg.preguntas.forEach(function (q, i) {
      var det = res.detalle.find(function (d) { return d.uid === q.uid; });
      var qc = el('<div class="card q-card"><div class="q-num">PREGUNTA ' + (i + 1) + ' · ' + (det.acierto ? '<span style="color:var(--ok)">correcta</span>' : '<span style="color:var(--bad)">incorrecta</span>') + '</div>' +
        '<div class="q-text">' + esc(q.enunciado) + '</div><div class="opts"></div></div>');
      var opts = qc.querySelector(".opts");
      q.opciones.forEach(function (o, oi) {
        var seleccionada = det.seleccion.indexOf(oi) !== -1;
        var esCorrecta = o.correcta;
        var cls = esCorrecta ? "opt correct" : (seleccionada ? "opt wrong" : "opt");
        var flag = esCorrecta ? '<span class="opt-flag ok">✓ correcta</span>' :
          (seleccionada ? '<span class="opt-flag no">✗ tu respuesta</span>' : '');
        opts.appendChild(el('<div class="' + cls + '"><span>' + esc(o.texto) + '</span>' + flag + '</div>'));
      });
      if (q.explicacion) qc.appendChild(el('<div class="q-explain"><b>Explicación:</b> ' + esc(q.explicacion) + '</div>'));
      app.appendChild(qc);
    });
    var backBtn = cfg.esFinal
      ? '<a class="btn btn-primary" href="#/">Ir a la ruta</a>'
      : '<a class="btn btn-primary" href="' + cfg.volver + '">Volver al día</a>';
    app.appendChild(el('<div class="toolbar" style="justify-content:center">' + backBtn + ' <a class="btn btn-ghost" href="#/progreso">Ver progreso</a></div>'));
  }

  // ========================================================
  //  VISTA: Progreso
  // ========================================================
  async function viewProgreso() {
    setNav("progreso");
    var curso = await Content.curso();
    var data = Store.get();
    app.innerHTML = "";
    app.appendChild(el('<div class="course-head"><h1>Mi progreso</h1><div class="sub">' + esc((data.user && data.user.nombre) || "") + ' · guardado en este equipo</div></div>'));

    var tb = el('<div class="toolbar">' +
      '<button class="btn btn-ghost" id="exportar">⬇ Exportar respaldo (.json)</button>' +
      '<button class="btn btn-ghost" id="importar">⬆ Importar respaldo</button>' +
      '<button class="btn btn-ghost" id="reset" style="color:var(--bad)">↺ Reiniciar progreso</button>' +
      '<input type="file" id="file" accept="application/json" class="hidden" />' +
    '</div>');
    app.appendChild(tb);
    tb.querySelector("#exportar").onclick = function () { Store.exportar(); };
    tb.querySelector("#importar").onclick = function () { tb.querySelector("#file").click(); };
    tb.querySelector("#file").onchange = function (e) {
      var f = e.target.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try { Store.importar(r.result); refreshUserChip(); viewProgreso(); alert("Respaldo importado."); }
        catch (err) { alert("Error: " + err.message); }
      };
      r.readAsText(f);
    };
    tb.querySelector("#reset").onclick = function () {
      if (confirm("¿Borrar TODO el progreso de este equipo? Esto no se puede deshacer.")) {
        Store.resetAll(); refreshUserChip(); go("#/");
      }
    };

    var grid = el('<div class="prog-grid"></div>');
    curso.dias.forEach(function (dia) {
      var rec = data.dias[String(dia.id)];
      var intentos = (rec && rec.intentos) || [];
      var row = el('<div class="card prog-row">' +
        '<div class="prow-head"><div class="prow-title">Día ' + dia.id + ' · ' + esc(dia.titulo) + '</div>' +
        '<div>' + (rec && rec.aprobado
          ? '<span class="badge-inline pill-done">Aprobado ' + rec.mejorScore + '%</span>'
          : (intentos.length ? '<span class="badge-inline pill-progress">Mejor ' + (rec.mejorScore||0) + '%</span>' : '<span class="badge-inline pill-locked">Sin intentos</span>')) +
        '</div></div>' +
        '<div class="attempts"></div>' +
      '</div>');
      var at = row.querySelector(".attempts");
      if (intentos.length === 0) at.innerHTML = '<span style="color:var(--muted);font-size:13px">Aún sin intentos registrados.</span>';
      intentos.forEach(function (it, i) {
        var h = Math.max(6, Math.round(it.score * 0.5));
        at.appendChild(el('<div class="att-bar ' + (it.aprobado ? "pass" : "") + '" style="height:' + h + 'px" title="Intento ' + (i+1) + ': ' + it.score + '%"><span class="att-val">' + it.score + '</span></div>'));
      });
      grid.appendChild(row);
    });
    app.appendChild(grid);

    // examen final
    var ef = data.examenFinal;
    var efRow = el('<div class="card prog-row" style="border-color:var(--lime)">' +
      '<div class="prow-head"><div class="prow-title">🏆 Examen Final</div><div>' +
      (ef.aprobado ? '<span class="badge-inline pill-done">Certificado ' + ef.mejorScore + '%</span>'
        : (ef.intentos.length ? '<span class="badge-inline pill-progress">Mejor ' + ef.mejorScore + '%</span>' : '<span class="badge-inline pill-locked">Sin intentos</span>')) +
      '</div></div><div class="attempts"></div></div>');
    var efAt = efRow.querySelector(".attempts");
    if (ef.intentos.length === 0) efAt.innerHTML = '<span style="color:var(--muted);font-size:13px">Aún sin intentos.</span>';
    ef.intentos.forEach(function (it, i) {
      var h = Math.max(6, Math.round(it.score * 0.5));
      efAt.appendChild(el('<div class="att-bar ' + (it.aprobado ? "pass" : "") + '" style="height:' + h + 'px"><span class="att-val">' + it.score + '</span></div>'));
    });
    app.appendChild(el('<div class="week-label">Certificación</div>'));
    app.appendChild(efRow);
  }

  // ========================================================
  //  Router
  // ========================================================
  function router() {
    refreshUserChip();
    var data = Store.get();
    if (!data.user) { viewWelcome(); return; }

    var hash = location.hash || "#/";
    var parts = hash.replace(/^#\//, "").split("/").filter(Boolean);

    window.scrollTo(0, 0);
    if (parts.length === 0) { viewHome(); return; }
    if (parts[0] === "dia" && parts[2] === "quiz") { viewQuiz(parseInt(parts[1], 10)); return; }
    if (parts[0] === "dia") { viewDia(parseInt(parts[1], 10)); return; }
    if (parts[0] === "progreso") { viewProgreso(); return; }
    if (parts[0] === "examen") { viewExamen(); return; }
    viewHome();
  }

  window.addEventListener("hashchange", router);
  window.addEventListener("DOMContentLoaded", router);
  if (document.readyState !== "loading") router();
})();
