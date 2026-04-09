(function () {
  "use strict";

  var AREAS = [
    "Intimidade",
    "Palavra",
    "Oração",
    "Comunhão",
    "Evangelismo",
    "Caráter",
    "Mordomia",
  ];

  var MIN_ACAO = 10;
  var STORAGE_KEY = "talmidim_pdd";

  var step1 = document.getElementById("pdd-step1");
  var step2 = document.getElementById("pdd-step2");
  var listEl = document.getElementById("pdd-areas");
  var btnStep1 = document.getElementById("pdd-btn-step1");
  var btnStep2 = document.getElementById("pdd-btn-step2");
  var inputAcao = document.getElementById("pdd-acao");
  var btnBack = document.getElementById("pdd-btn-voltar");

  var selectedArea = null;

  function trimAcao() {
    return inputAcao ? inputAcao.value.trim() : "";
  }

  function isAcaoValid() {
    return trimAcao().length >= MIN_ACAO;
  }

  function updateStep2Button() {
    if (!btnStep2) {
      return;
    }
    btnStep2.disabled = !isAcaoValid();
  }

  function renderAreas() {
    if (!listEl) {
      return;
    }
    listEl.innerHTML = "";
    AREAS.forEach(function (nome) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pdd-area-card";
      btn.setAttribute("data-area", nome);
      btn.setAttribute("aria-pressed", "false");
      btn.textContent = nome;
      btn.addEventListener("click", function () {
        listEl.querySelectorAll(".pdd-area-card").forEach(function (b) {
          b.classList.remove("is-selected");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("is-selected");
        btn.setAttribute("aria-pressed", "true");
        selectedArea = nome;
        if (btnStep1) {
          btnStep1.disabled = false;
        }
      });
      li.appendChild(btn);
      listEl.appendChild(li);
    });
  }

  if (btnStep1) {
    btnStep1.addEventListener("click", function () {
      if (!selectedArea) {
        return;
      }
      if (step1) {
        step1.hidden = true;
      }
      if (step2) {
        step2.hidden = false;
      }
      if (inputAcao) {
        inputAcao.focus();
      }
      updateStep2Button();
    });
  }

  if (inputAcao) {
    inputAcao.addEventListener("input", updateStep2Button);
  }

  if (btnBack) {
    btnBack.addEventListener("click", function () {
      if (step2) {
        step2.hidden = true;
      }
      if (step1) {
        step1.hidden = false;
      }
    });
  }

  if (btnStep2) {
    btnStep2.addEventListener("click", function () {
      if (!selectedArea || !isAcaoValid()) {
        return;
      }
      var payload = {
        area: selectedArea,
        acao: trimAcao(),
        data: new Date().toISOString(),
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (e) {
        return;
      }
      window.location.href = "mapa.html";
    });
  }

  renderAreas();
})();
