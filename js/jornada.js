(function () {
  "use strict";

  var KEY_PDD = "talmidim_pdd";
  var KEY_JORNADA = "talmidim_jornada";
  var KEY_MAPA_INTRO_VISTA = "talmidim_mapa_intro_vista";
  var KEY_MAPA_FLOW = "talmidim_mapa_flow_v1";
  var DATA_URL = "../js/jornada-dias.json";
  var MIN_ENTRADAS_JSON = 147;

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

  function loadEstacaoAtual() {
    try {
      var raw = localStorage.getItem(KEY_MAPA_FLOW);
      if (!raw) {
        return 1;
      }
      var o = JSON.parse(raw);
      var e = parseInt(o.estacao, 10);
      if (e >= 1 && e <= 7) {
        return e;
      }
    } catch (e) {}
    return 1;
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

  function diasDaEstacao(arr, estacao) {
    return arr
      .filter(function (item) {
        return (
          item &&
          typeof item.dia === "number" &&
          parseInt(item.estacao, 10) === estacao
        );
      })
      .sort(function (a, b) {
        return a.dia - b.dia;
      });
  }

  function firstDiaGlobal(diasEstacao) {
    return diasEstacao.length ? diasEstacao[0].dia : 1;
  }

  function lastDiaGlobal(diasEstacao) {
    return diasEstacao.length
      ? diasEstacao[diasEstacao.length - 1].dia
      : 1;
  }

  function globalToLocal(diasEstacao, globalDia) {
    for (var i = 0; i < diasEstacao.length; i++) {
      if (diasEstacao[i].dia === globalDia) {
        return i + 1;
      }
    }
    return null;
  }

  function nextGlobalDia(diasEstacao, currentGlobalDia) {
    for (var i = 0; i < diasEstacao.length - 1; i++) {
      if (diasEstacao[i].dia === currentGlobalDia) {
        return diasEstacao[i + 1].dia;
      }
    }
    return lastDiaGlobal(diasEstacao) + 1;
  }

  function clampConcluidos(concluidos, diasEstacao) {
    var valid = {};
    diasEstacao.forEach(function (it) {
      valid[it.dia] = true;
    });
    var uniq = [];
    (concluidos || []).forEach(function (n) {
      var d = parseInt(n, 10);
      if (valid[d] && uniq.indexOf(d) < 0) {
        uniq.push(d);
      }
    });
    return uniq;
  }

  function loadState(diasEstacao, estacaoAtual) {
    var first = firstDiaGlobal(diasEstacao);
    var last = lastDiaGlobal(diasEstacao);
    var def = {
      estacao: estacaoAtual,
      diaAtual: first,
      concluidos: [],
    };
    if (!diasEstacao.length) {
      return def;
    }
    try {
      var raw = localStorage.getItem(KEY_JORNADA);
      if (!raw) {
        return def;
      }
      var s = JSON.parse(raw);
      if (!s || typeof s.diaAtual !== "number" || !Array.isArray(s.concluidos)) {
        return def;
      }
      if (typeof s.estacao !== "number" || s.estacao !== estacaoAtual) {
        return def;
      }
      var concluidos = clampConcluidos(s.concluidos, diasEstacao);
      var diaAtual = Math.floor(s.diaAtual);
      var validGlobal = {};
      diasEstacao.forEach(function (it) {
        validGlobal[it.dia] = true;
      });
      if (diaAtual === last + 1) {
        return { estacao: estacaoAtual, diaAtual: diaAtual, concluidos: concluidos };
      }
      if (!validGlobal[diaAtual]) {
        diaAtual = first;
      }
      while (concluidos.indexOf(diaAtual) >= 0 && diaAtual <= last) {
        diaAtual = nextGlobalDia(diasEstacao, diaAtual);
      }
      if (diaAtual > last) {
        return {
          estacao: estacaoAtual,
          diaAtual: last + 1,
          concluidos: concluidos,
        };
      }
      return { estacao: estacaoAtual, diaAtual: diaAtual, concluidos: concluidos };
    } catch (e) {
      return def;
    }
  }

  function saveState(s, firstDia) {
    try {
      var prevHadProgress = false;
      var rawPrev = localStorage.getItem(KEY_JORNADA);
      if (rawPrev) {
        try {
          var prev = JSON.parse(rawPrev);
          if (prev && typeof prev.diaAtual === "number") {
            if (
              prev.diaAtual > firstDia ||
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
        s.diaAtual === firstDia &&
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

  function appendDayRow(localDia, kind) {
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
    txt.textContent = "Dia " + localDia + suffix;
    li.appendChild(ico);
    li.appendChild(txt);
    elMapa.appendChild(li);
  }

  function renderMapa(state, diasEstacao) {
    if (!elMapa) {
      return;
    }
    elMapa.innerHTML = "";
    var N = diasEstacao.length;
    var lastG = lastDiaGlobal(diasEstacao);
    if (state.diaAtual > lastG) {
      if (elMapaWrap) {
        elMapaWrap.hidden = true;
      }
      return;
    }
    if (elMapaWrap) {
      elMapaWrap.hidden = false;
    }
    var curLocal = globalToLocal(diasEstacao, state.diaAtual);
    if (curLocal == null) {
      curLocal = 1;
    }
    var lastLocal = curLocal > 1 ? curLocal - 1 : null;
    var nextLocal = curLocal < N ? curLocal + 1 : null;
    if (lastLocal) {
      appendDayRow(lastLocal, "done");
    }
    appendDayRow(curLocal, "current");
    if (nextLocal) {
      appendDayRow(nextLocal, "locked");
    }
  }

  function renderDia(diasPorNumero, state, diasEstacao) {
    if (!elHoje || !elConcluido) {
      return;
    }
    var N = diasEstacao.length;
    var lastG = lastDiaGlobal(diasEstacao);
    if (state.diaAtual > lastG) {
      elHoje.hidden = true;
      elConcluido.hidden = false;
      if (btnCompletar) {
        btnCompletar.disabled = true;
      }
      return;
    }
    elConcluido.hidden = true;
    elHoje.hidden = false;
    var globalDia = state.diaAtual;
    var pack = diasPorNumero[globalDia];
    if (!pack) {
      return;
    }
    var localDia = globalToLocal(diasEstacao, globalDia);
    if (localDia == null) {
      localDia = 1;
    }
    elDiaLabel.textContent = "Dia " + localDia + " de " + N;
    elConfronto.textContent = pack.confronto;
    elDirecao.textContent = pack.direcao;
    elAcao.textContent = pack.acao;
    if (btnCompletar) {
      btnCompletar.disabled = state.concluidos.indexOf(globalDia) >= 0;
    }
  }

  var pdd = loadPdd();
  if (!pdd) {
    redirectRadar();
    return;
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
      if (!Array.isArray(arr) || arr.length < MIN_ENTRADAS_JSON) {
        throw new Error("dados");
      }
      var estacaoAtual = loadEstacaoAtual();
      var diasEstacao = diasDaEstacao(arr, estacaoAtual);
      if (!diasEstacao.length) {
        throw new Error("estacao");
      }
      var firstDia = firstDiaGlobal(diasEstacao);
      var state = loadState(diasEstacao, estacaoAtual);
      if (!localStorage.getItem(KEY_JORNADA)) {
        saveState(state, firstDia);
      }
      var map = {};
      arr.forEach(function (item) {
        if (item && typeof item.dia === "number") {
          map[item.dia] = item;
        }
      });
      var diasPorNumero = map;

      function refresh() {
        renderDia(diasPorNumero, state, diasEstacao);
        renderMapa(state, diasEstacao);
      }

      refresh();

      if (btnCompletar) {
        btnCompletar.addEventListener("click", function () {
          var lastG = lastDiaGlobal(diasEstacao);
          if (state.diaAtual > lastG) {
            return;
          }
          var hoje = state.diaAtual;
          if (state.concluidos.indexOf(hoje) >= 0) {
            return;
          }
          state.concluidos.push(hoje);
          state.diaAtual = nextGlobalDia(diasEstacao, hoje);
          saveState(state, firstDia);
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
