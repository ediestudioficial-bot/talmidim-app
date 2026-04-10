(function () {
  "use strict";

  var TOTAL = 47;
  var KEY_JORNADA = "talmidim_jornada";
  var KEY_PDD = "talmidim_pdd";
  var LEAVE_MS = 400;
  var PEREGRINO_PATH = "../assets/peregrino-";
  /** Meia troca de pose: fade out + fade in = 600 ms */
  var POSE_HALF_MS = 300;

  /** Sete estações — posições % sobre a arte do mapa */
  var ESTACOES = [
    { left: 14, top: 58 },
    { left: 26, top: 50 },
    { left: 38, top: 54 },
    { left: 50, top: 46 },
    { left: 60, top: 52 },
    { left: 72, top: 44 },
    { left: 84, top: 38 },
  ];

  var peregrinoAvatar = null;
  var peregrinoImg = null;

  function loadState() {
    try {
      var raw = localStorage.getItem(KEY_JORNADA);
      if (!raw) {
        return { diaAtual: 1, concluidos: [] };
      }
      var s = JSON.parse(raw);
      if (!s || typeof s.diaAtual !== "number" || !Array.isArray(s.concluidos)) {
        return { diaAtual: 1, concluidos: [] };
      }
      var diaAtual = Math.max(1, Math.min(TOTAL + 1, Math.floor(s.diaAtual)));
      return { diaAtual: diaAtual, concluidos: s.concluidos || [] };
    } catch (e) {
      return { diaAtual: 1, concluidos: [] };
    }
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

  /** Estação atual (1–7) a partir do dia */
  function estacaoAtual(diaAtual) {
    if (diaAtual > TOTAL) {
      return 7;
    }
    return Math.min(7, Math.max(1, Math.ceil((diaAtual / TOTAL) * 7)));
  }

  /**
   * Troca a pose do Peregrino: fade out → novo src → fade in (600 ms no total).
   * @param {string} poseName — sufixo do ficheiro (ex.: "back", "walk-right")
   * @param {function=} onDone
   */
  function changePose(poseName, onDone) {
    if (!peregrinoAvatar || !peregrinoImg) {
      if (typeof onDone === "function") {
        onDone();
      }
      return;
    }
    peregrinoAvatar.style.transition =
      "opacity " + POSE_HALF_MS / 1000 + "s ease, transform 0.6s ease";
    peregrinoAvatar.style.opacity = "0";
    window.setTimeout(function () {
      peregrinoImg.src = PEREGRINO_PATH + poseName + ".png";
      peregrinoImg.alt = "";
      void peregrinoImg.offsetWidth;
      peregrinoAvatar.style.opacity = "1";
      window.setTimeout(function () {
        peregrinoAvatar.style.transition = "";
        if (typeof onDone === "function") {
          onDone();
        }
      }, POSE_HALF_MS);
    }, POSE_HALF_MS);
  }

  window.changePose = changePose;

  function irJornada() {
    document.body.classList.remove("mapa-ready");
    document.body.classList.add("mapa-leave");
    window.setTimeout(function () {
      window.location.href = "jornada.html";
    }, LEAVE_MS);
  }

  function onContinuarJornada() {
    changePose("walk-right", function () {
      window.setTimeout(function () {
        changePose("back", function () {
          window.setTimeout(irJornada, 250);
        });
      }, 2000);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var markersEl = document.getElementById("mapa-markers");
    var badgeEl = document.getElementById("mapa-badge");
    var ctxEl = document.getElementById("mapa-ctx");
    var ctaEl = document.getElementById("mapa-cta");

    peregrinoAvatar = document.getElementById("peregrino-avatar");
    peregrinoImg = document.getElementById("peregrino-img");
    if (peregrinoImg) {
      peregrinoImg.src = PEREGRINO_PATH + "back.png";
      peregrinoImg.alt = "";
    }
    if (peregrinoAvatar) {
      peregrinoAvatar.style.opacity = "1";
    }

    if (!markersEl || !badgeEl || !ctaEl) {
      document.body.classList.add("mapa-ready");
      return;
    }

    var state = loadState();
    var diaAtual = state.diaAtual;
    var pdd = loadPdd();
    var cur = estacaoAtual(diaAtual);

    var diaMostra = diaAtual > TOTAL ? TOTAL : diaAtual;
    badgeEl.textContent = "Dia " + diaMostra + " de " + TOTAL;

    if (ctxEl && pdd) {
      ctxEl.hidden = false;
      ctxEl.innerHTML =
        '<p class="mapa-ctx-line">' +
        escapeHtml(pdd.area) +
        "</p>" +
        '<p class="mapa-ctx-line mapa-ctx-line--acao">' +
        escapeHtml(pdd.acao) +
        "</p>";
    } else if (ctxEl) {
      ctxEl.hidden = true;
      ctxEl.innerHTML = "";
    }

    ctaEl.addEventListener("click", onContinuarJornada);

    ESTACOES.forEach(function (pos, i) {
      var n = i + 1;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mapa-marker";
      btn.style.left = pos.left + "%";
      btn.style.top = pos.top + "%";
      btn.setAttribute("aria-label", "Estação " + n + " de 7");

      if (n < cur) {
        btn.classList.add("mapa-marker--feita");
        btn.disabled = true;
        btn.setAttribute("aria-label", "Estação " + n + " — percorrida");
      } else if (n === cur && diaAtual <= TOTAL) {
        btn.classList.add("mapa-marker--desbloqueada");
        btn.addEventListener("click", irJornada);
      } else if (n === cur && diaAtual > TOTAL) {
        btn.classList.add("mapa-marker--desbloqueada");
        btn.disabled = true;
      } else {
        btn.classList.add("mapa-marker--bloqueada");
        btn.disabled = true;
        btn.setAttribute("aria-label", "Estação " + n + " — ainda não alcançada");
      }
      markersEl.appendChild(btn);
    });

    document.body.classList.add("mapa-ready");
  });

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }
})();
