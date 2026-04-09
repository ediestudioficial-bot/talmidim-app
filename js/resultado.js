(function () {
  "use strict";

  var STORAGE_KEY = "talmidim_radar";
  var AREA_ORDER = [
    "Intimidade",
    "Família",
    "Evangelização",
    "Compaixão",
    "Mordomia",
    "Serviço",
    "Comunhão",
  ];

  var canvas = document.getElementById("radar-resultado-chart");
  var listEl = document.getElementById("resultado-areas");
  var elFase1 = document.getElementById("resultado-fase1");
  var elPonte = document.getElementById("resultado-ponte");
  var btnContinuarResultados = document.getElementById("resultado-continuar-resultados");
  var btnDefinirPasso = document.getElementById("resultado-definir-passo");

  function parseRespostas() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      var arr = JSON.parse(raw);
      if (!Array.isArray(arr) || arr.length < 35) {
        return null;
      }
      return arr;
    } catch (e) {
      return null;
    }
  }

  /** Somas por área (0–15 cada), na ordem de AREA_ORDER — ex.: resultado.html?areas=10,8,12,9,11,7,14 */
  function parseAreasFromUrl() {
    try {
      var params = new URLSearchParams(window.location.search);
      var raw = params.get("areas");
      if (!raw) {
        return null;
      }
      var parts = raw.split(",").map(function (x) {
        return parseInt(String(x).trim(), 10);
      });
      if (parts.length !== AREA_ORDER.length) {
        return null;
      }
      var maxSum = 5 * 3;
      for (var i = 0; i < parts.length; i++) {
        var n = parts[i];
        if (!isFinite(n) || n < 0 || n > maxSum) {
          return null;
        }
      }
      return parts;
    } catch (e) {
      return null;
    }
  }

  function areaDataFromSums(sums) {
    var out = {};
    AREA_ORDER.forEach(function (area, i) {
      var sum = sums[i];
      var media = sum / 5;
      out[area] = {
        media: media,
        chart: (media / 3) * 100,
      };
    });
    return out;
  }

  /** Por área: média 0–3 (interpretação) e 0–100 só para o gráfico. */
  function computeAreaData(respostas) {
    var buckets = {};
    AREA_ORDER.forEach(function (a) {
      buckets[a] = [];
    });
    respostas.forEach(function (r) {
      if (r && typeof r.valor === "number" && buckets[r.area] !== undefined) {
        buckets[r.area].push(r.valor);
      }
    });
    var out = {};
    AREA_ORDER.forEach(function (area) {
      var v = buckets[area];
      var media = 0;
      if (v.length) {
        var sum = v.reduce(function (a, b) {
          return a + b;
        }, 0);
        media = sum / v.length;
      }
      out[area] = {
        media: media,
        chart: (media / 3) * 100,
      };
    });
    return out;
  }

  function interpretacaoPorMedia(media) {
    if (media <= 1) {
      return "Isso não tem feito parte da sua rotina.";
    }
    if (media < 2.3) {
      return "Isso aparece, mas ainda não sustenta sua vida.";
    }
    return "Essa área já faz parte da sua vida.";
  }

  function renderLista(areaData) {
    if (!listEl) {
      return;
    }
    listEl.innerHTML = "";
    AREA_ORDER.forEach(function (area) {
      var d = areaData[area];
      var frase = interpretacaoPorMedia(d.media);
      var pct = Math.round(d.chart * 10) / 10;
      var li = document.createElement("li");
      li.className = "resultado-area-item";
      li.innerHTML =
        '<span class="resultado-area-nome">' +
        area.toUpperCase() +
        '</span>' +
        '<p class="resultado-area-frase">' +
        frase +
        "</p>" +
        '<span class="resultado-area-hint" aria-hidden="true">' +
        pct +
        "%</span>";
      listEl.appendChild(li);
    });
  }

  function paintChart(areaData) {
    if (!canvas || typeof drawTalmidimRadarChart !== "function") {
      return;
    }
    var values = AREA_ORDER.map(function (a) {
      return areaData[a].chart;
    });
    drawTalmidimRadarChart(canvas, values, AREA_ORDER);
  }

  var urlSums = parseAreasFromUrl();
  var respostas = urlSums ? null : parseRespostas();
  if (!urlSums && !respostas) {
    window.location.replace("radar.html");
    return;
  }

  var areaData = urlSums ? areaDataFromSums(urlSums) : computeAreaData(respostas);
  renderLista(areaData);

  function onResize() {
    paintChart(areaData);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onResize);
  } else {
    onResize();
  }

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(onResize, 120);
  });

  if (btnContinuarResultados && elFase1 && elPonte) {
    btnContinuarResultados.addEventListener("click", function () {
      elFase1.hidden = true;
      elPonte.hidden = false;
      window.scrollTo(0, 0);
    });
  }

  if (btnDefinirPasso) {
    btnDefinirPasso.addEventListener("click", function () {
      window.location.href = "pdd.html";
    });
  }
})();
