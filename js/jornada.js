(function () {
  "use strict";

  var KEY_PDD = "talmidim_pdd";
  var KEY_JORNADA = "talmidim_jornada";
  var KEY_MAPA_INTRO_VISTA = "talmidim_mapa_intro_vista";
  var TOTAL_DIAS = 47;
  var DATA_URL = "../js/jornada-dias.json";

  var elPdd = document.getElementById("jornada-pdd");
  var elHoje = document.getElementById("jornada-hoje");
  var elConcluido = document.getElementById("jornada-concluido");
  var elDiaLabel = document.getElementById("jornada-dia-label");
  var elConfronto = document.getElementById("jornada-confronto");
  var elDirecao = document.getElementById("jornada-direcao");
  var elAcao = document.getElementById("jornada-acao");
  var btnCompletar = document.getElementById("jornada-completar");
  var btnContinuarVivendo = document.getElementById("jornada-continuar-vivendo");
  var elMapa = document.getElementById("jornada-mapa");
  var elMapaWrap = document.getElementById("jornada-mapa-wrap");

  function redirectRadar() {
    window.location.replace("radar.html");
  }

  function loadPdd() {
    try {
      var raw = localStorage.getItem(KEY_PDD);
      if (!raw) {
        return null;
      }
      var o = JSON.parse(raw);
      if (!o || typeof o.area !== "string" || typeof o.acao !== "string") {
        return null;
      }
      return o;
    } catch (e) {
      return null;
    }
  }

  function defaultState() {
    return { diaAtual: 1, concluidos: [] };
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(KEY_JORNADA);
      if (!raw) {
        return defaultState();
      }
      var s = JSON.parse(raw);
      if (!s || typeof s.diaAtual !== "number" || !Array.isArray(s.concluidos)) {
        return defaultState();
      }
      var concluidos = s.concluidos
        .map(function (n) {
          return parseInt(n, 10);
        })
        .filter(function (n) {
          return n >= 1 && n <= TOTAL_DIAS;
        });
      var uniq = [];
      concluidos.forEach(function (n) {
        if (uniq.indexOf(n) < 0) {
          uniq.push(n);
        }
      });
      var diaAtual = Math.max(1, Math.min(TOTAL_DIAS + 1, Math.floor(s.diaAtual)));
      return { diaAtual: diaAtual, concluidos: uniq };
    } catch (e) {
      return defaultState();
    }
  }

  function saveState(s) {
    try {
      var prevHadProgress = false;
      var rawPrev = localStorage.getItem(KEY_JORNADA);
      if (rawPrev) {
        try {
          var prev = JSON.parse(rawPrev);
          if (prev && typeof prev.diaAtual === "number") {
            if (
              prev.diaAtual > 1 ||
              (Array.isArray(prev.concluidos) && prev.concluidos.length > 0)
            ) {
              prevHadProgress = true;
            }
          }
        } catch (e2) {}
      }
      localStorage.setItem(KEY_JORNADA, JSON.stringify(s));
      if (
        prevHadProgress &&
        s.diaAtual === 1 &&
        (!s.concluidos || s.concluidos.length === 0)
      ) {
        localStorage.removeItem(KEY_MAPA_INTRO_VISTA);
      }
    } catch (e) {}
  }

  function renderPdd(pdd) {
    if (!elPdd || !pdd) {
      return;
    }
    elPdd.hidden = false;
    elPdd.classList.add("jornada-decisao-topo");
    elPdd.textContent =
      "Você decidiu viver: " + pdd.area + "\n\nPrática: " + pdd.acao;
  }

  function appendDayRow(d, kind) {
    if (!elMapa) {
      return;
    }
    var li = document.createElement("li");
    li.className = "jornada-mapa-item";
    if (kind === "done") {
      li.classList.add("jornada-mapa-item--done");
    }
    if (kind === "current") {
      li.classList.add("jornada-mapa-item--current");
    }
    if (kind === "locked") {
      li.classList.add("jornada-mapa-item--locked");
    }
    var ico = document.createElement("span");
    ico.className = "jornada-mapa-ico";
    ico.setAttribute("aria-hidden", "true");
    if (kind === "done") {
      ico.textContent = "✓";
    } else if (kind === "current") {
      ico.textContent = "●";
    } else {
      ico.textContent = "○";
    }
    var txt = document.createElement("span");
    var suffix =
      kind === "current" ? " (hoje)" : kind === "done" ? " (feito)" : " (bloqueado)";
    txt.textContent = "Dia " + d + suffix;
    li.appendChild(ico);
    li.appendChild(txt);
    elMapa.appendChild(li);
  }

  /** Só último dia feito, dia atual e próximo bloqueado — o resto fica oculto. */
  function renderMapa(state) {
    if (!elMapa) {
      return;
    }
    elMapa.innerHTML = "";
    if (state.diaAtual > TOTAL_DIAS) {
      if (elMapaWrap) {
        elMapaWrap.hidden = true;
      }
      return;
    }
    if (elMapaWrap) {
      elMapaWrap.hidden = false;
    }
    var cur = state.diaAtual;
    var last = cur > 1 ? cur - 1 : null;
    var next = cur < TOTAL_DIAS ? cur + 1 : null;
    if (last) {
      appendDayRow(last, "done");
    }
    appendDayRow(cur, "current");
    if (next) {
      appendDayRow(next, "locked");
    }
  }

  function renderDia(diasPorNumero, state) {
    if (!elHoje || !elConcluido) {
      return;
    }
    if (state.diaAtual > TOTAL_DIAS) {
      elHoje.hidden = true;
      elConcluido.hidden = false;
      if (btnCompletar) {
        btnCompletar.disabled = true;
      }
      return;
    }
    elConcluido.hidden = true;
    elHoje.hidden = false;
    var dia = state.diaAtual;
    var pack = diasPorNumero[dia];
    if (!pack) {
      return;
    }
    elDiaLabel.textContent = "Dia " + dia + " de " + TOTAL_DIAS;
    elConfronto.textContent = pack.confronto;
    elDirecao.textContent = pack.direcao;
    elAcao.textContent = pack.acao;
    if (btnCompletar) {
      btnCompletar.disabled = state.concluidos.indexOf(dia) >= 0;
    }
  }

  var pdd = loadPdd();
  if (!pdd) {
    redirectRadar();
    return;
  }

  var state = loadState();
  if (!localStorage.getItem(KEY_JORNADA)) {
    saveState(state);
  }

  renderPdd(pdd);

  fetch(DATA_URL)
    .then(function (r) {
      if (!r.ok) {
        throw new Error("fetch");
      }
      return r.json();
    })
    .then(function (arr) {
      if (!Array.isArray(arr) || arr.length < TOTAL_DIAS) {
        throw new Error("dados");
      }
      var map = {};
      arr.forEach(function (item) {
        if (item && typeof item.dia === "number") {
          map[item.dia] = item;
        }
      });
      var diasPorNumero = map;

      function refresh() {
        renderDia(diasPorNumero, state);
        renderMapa(state);
      }

      refresh();

      if (btnCompletar) {
        btnCompletar.addEventListener("click", function () {
          if (state.diaAtual > TOTAL_DIAS) {
            return;
          }
          var hoje = state.diaAtual;
          if (state.concluidos.indexOf(hoje) >= 0) {
            return;
          }
          state.concluidos.push(hoje);
          state.diaAtual = hoje + 1;
          saveState(state);
          window.location.href = "mapa.html";
        });
      }

      if (btnContinuarVivendo) {
        btnContinuarVivendo.addEventListener("click", function () {
          window.location.href = "mapa.html";
        });
      }
    })
    .catch(function () {
      window.location.replace("mapa.html");
    });
})();
