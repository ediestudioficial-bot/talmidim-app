/**
 * Radar discipular: ordem fixa Área 1 → 7, 5 perguntas cada.
 * Sem voltar, sem pular, sem escolher área — só avanço ao responder.
 */
(function () {
  "use strict";

  const STORAGE_KEY = "talmidim_radar";

  const AREA_ORDER = [
    "Intimidade",
    "Família",
    "Evangelização",
    "Compaixão",
    "Mordomia",
    "Serviço",
    "Comunhão",
  ];

  const PERGUNTAS_POR_AREA = 5;
  const NUM_AREAS = AREA_ORDER.length;

  /** Tempo para o destaque da opção antes da saída */
  const HIGHLIGHT_MS = 300;
  /** Ciclo completo: fade-out + fade-in (só opacity) */
  const TRANSITION_MS = 320;
  const FADE_OUT_MS = TRANSITION_MS / 2;
  const FADE_IN_MS = TRANSITION_MS / 2;

  const opcoesResposta = [
    { label: "Nunca aconteceu", valor: 0 },
    { label: "Aconteceu poucas vezes", valor: 1 },
    { label: "Aconteceu algumas vezes", valor: 2 },
    { label: "Fez parte da minha rotina", valor: 3 },
  ];

  /** Textos por área — a ordem do questionário é sempre AREA_ORDER × 5. */
  const TEXTO_POR_AREA = {
    Intimidade: [
      "Nos últimos 7 dias, você separou tempo real para estar com Deus em oração?",
      "Você leu a Bíblia de forma intencional esta semana?",
      "Você praticou algum tipo de jejum no último mês?",
      "Você teve momentos de silêncio e escuta de Deus recentemente?",
      "Sua vida de oração tem sido mais rotina ou encontro real?",
    ],
    Família: [
      "Você demonstrou amor ativo ao seu cônjuge ou família esta semana?",
      "Você resolveu algum conflito familiar com maturidade recentemente?",
      "Sua família sente sua presença espiritual em casa?",
      "Você orou com sua família nos últimos 7 dias?",
      "Você pediu perdão a alguém da família quando errou?",
    ],
    Evangelização: [
      "Você compartilhou sua fé com alguém fora da igreja no último mês?",
      "Você tem algum relacionamento intencional com não-cristãos?",
      "Você orou por alguém específico para conhecer Jesus recentemente?",
      "Você testemunhou da sua fé com palavras esta semana?",
      "Você convidou alguém para a igreja ou um evento cristão recentemente?",
    ],
    Compaixão: [
      "Você ajudou alguém em necessidade prática esta semana?",
      "Você perdoou alguém que te magoou recentemente?",
      "Você demonstrou misericórdia em vez de julgamento esta semana?",
      "Você se importou com alguém marginalizado ou esquecido?",
      "Você agiu com graça quando poderia ter reagido com dureza?",
    ],
    Mordomia: [
      "Você usou seu dinheiro de forma consciente e generosa esta semana?",
      "Você administrou bem seu tempo esta semana?",
      "Você está usando seus dons espirituais de forma intencional?",
      "Você cuidou do seu corpo como templo do Espírito?",
      "Você devolveu o dízimo ou ofertas à obra de Deus?",
    ],
    Serviço: [
      "Você serviu na sua igreja ou comunidade esta semana?",
      "Você usou seus talentos para o bem de outros recentemente?",
      "Você está em algum ministério ou área de serviço ativo?",
      "Você ajudou alguém sem esperar reconhecimento?",
      "Você participou de alguma ação de impacto social recentemente?",
    ],
    Comunhão: [
      "Você teve comunhão real com outros cristãos esta semana?",
      "Você tem alguém que acompanha sua vida espiritual?",
      "Você foi honesto com alguém sobre suas lutas espirituais?",
      "Você orou por outros membros da sua comunidade?",
      "Você participou de algum grupo ou célula recentemente?",
    ],
  };

  const perguntas = [];
  AREA_ORDER.forEach(function (area) {
    const textos = TEXTO_POR_AREA[area];
    if (!textos || textos.length !== PERGUNTAS_POR_AREA) {
      throw new Error(
        "radar: cada área precisa de " +
          PERGUNTAS_POR_AREA +
          " perguntas (" +
          area +
          ")."
      );
    }
    textos.forEach(function (texto) {
      perguntas.push({ area: area, texto: texto });
    });
  });

  for (let i = 0; i < perguntas.length; i++) {
    const esperada = AREA_ORDER[Math.floor(i / PERGUNTAS_POR_AREA)];
    if (perguntas[i].area !== esperada) {
      throw new Error("radar: ordem fixa quebrada no índice " + i);
    }
  }

  const elIntro = document.getElementById("radar-intro");
  const elQuiz = document.getElementById("radar-quiz");
  const btnIntroContinuar = document.getElementById("radar-intro-continuar");
  const elArea = document.getElementById("radar-area");
  const elPergunta = document.getElementById("radar-pergunta-texto");
  const elProgresso = document.getElementById("radar-progresso");
  const elOpcoes = document.getElementById("radar-opcoes");
  const elDots = document.getElementById("radar-dots");
  const elDissolve = document.getElementById("radar-quiz-dissolve");
  const elProgressFill = document.getElementById("radar-progress-fill");

  let indiceAtual = 0;
  const respostas = [];
  let quizLocked = false;

  function renderDots() {
    if (!elDots) return;
    const areaIdx = Math.floor(indiceAtual / PERGUNTAS_POR_AREA);
    const qInArea = indiceAtual % PERGUNTAS_POR_AREA;
    elDots.innerHTML = "";
    for (let a = 0; a < NUM_AREAS; a++) {
      const cluster = document.createElement("div");
      cluster.className = "radar-dot-cluster";
      for (let d = 0; d < PERGUNTAS_POR_AREA; d++) {
        const dot = document.createElement("div");
        dot.className = "radar-dot";
        if (a < areaIdx) {
          dot.classList.add("radar-dot--completed");
        } else if (a === areaIdx) {
          if (d < qInArea) dot.classList.add("radar-dot--completed");
          else if (d === qInArea) dot.classList.add("radar-dot--active");
        }
        cluster.appendChild(dot);
      }
      elDots.appendChild(cluster);
    }
  }

  function atualizarBarraProgresso() {
    if (!elProgressFill) return;
    const pct = ((indiceAtual + 1) / perguntas.length) * 100;
    elProgressFill.style.width = pct + "%";
  }

  function somasPorArea() {
    return AREA_ORDER.map(function (area) {
      return respostas
        .filter(function (r) {
          return r.area === area;
        })
        .reduce(function (s, r) {
          return s + r.valor;
        }, 0);
    });
  }

  function urlResultadoComScores() {
    const sums = somasPorArea();
    return "resultado.html?areas=" + sums.join(",");
  }

  function persistir() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(respostas));
  }

  function mostrar(el) {
    el.hidden = false;
  }

  function esconder(el) {
    el.hidden = true;
  }

  function montarBotoesOpcoes() {
    elOpcoes.innerHTML = "";
    opcoesResposta.forEach(function (op) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "radar-opcao";
      btn.setAttribute("data-valor", String(op.valor));

      const inner = document.createElement("span");
      inner.className = "radar-opcao-inner";

      const label = document.createElement("span");
      label.className = "radar-opcao-label";
      label.textContent = op.label;

      const icon = document.createElement("span");
      icon.className = "material-symbols-outlined radar-opcao-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "radio_button_unchecked";

      inner.appendChild(label);
      inner.appendChild(icon);
      btn.appendChild(inner);

      btn.addEventListener("click", function () {
        if (quizLocked) return;
        onEscolha(op.valor, btn);
      });
      elOpcoes.appendChild(btn);
    });
  }

  function atualizarTextoPergunta() {
    const p = perguntas[indiceAtual];
    elArea.textContent = p.area.toUpperCase();
    elPergunta.textContent = p.texto;
    elProgresso.textContent =
      "Pergunta " + (indiceAtual + 1) + " de " + perguntas.length;
  }

  function prepararDissolveSemAnimacao() {
    if (!elDissolve) return;
    elDissolve.classList.remove("is-fading-out", "is-fading-in");
    elDissolve.style.removeProperty("transition");
    elDissolve.style.removeProperty("opacity");
  }

  function iniciarFadeInDissolve() {
    if (!elDissolve) return;
    void elDissolve.offsetWidth;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        elDissolve.classList.add("is-fading-in");
        elDissolve.style.removeProperty("transition");
        elDissolve.style.removeProperty("opacity");
      });
    });
    window.setTimeout(function () {
      elDissolve.classList.remove("is-fading-in");
      elDissolve.style.removeProperty("transition");
      elDissolve.style.removeProperty("opacity");
    }, FADE_IN_MS);
  }

  function renderPerguntaInicial() {
    prepararDissolveSemAnimacao();
    if (elDissolve) {
      elDissolve.style.transition = "none";
      elDissolve.style.opacity = "0";
    }
    atualizarTextoPergunta();
    montarBotoesOpcoes();
    atualizarBarraProgresso();
    renderDots();
    if (elDissolve) {
      iniciarFadeInDissolve();
    }
  }

  function aplicarVisualEscolha(botaoSelecionado) {
    elOpcoes.classList.add("radar-opcoes--choice-made");
    const botoes = elOpcoes.querySelectorAll(".radar-opcao");
    botoes.forEach(function (btn) {
      if (btn === botaoSelecionado) {
        btn.classList.add("radar-opcao--selected");
        const ic = btn.querySelector(".radar-opcao-icon");
        if (ic) {
          ic.textContent = "radio_button_checked";
        }
      } else {
        btn.classList.add("radar-opcao--dimmed");
      }
    });
  }

  function onEscolha(valor, botaoEl) {
    if (quizLocked) return;
    quizLocked = true;
    elOpcoes.setAttribute("aria-busy", "true");

    aplicarVisualEscolha(botaoEl);

    window.setTimeout(function () {
      if (!elDissolve) {
        commitRespostaEAvancar(valor);
        return;
      }
      elDissolve.classList.add("is-fading-out");
      window.setTimeout(function () {
        commitRespostaEAvancar(valor);
      }, FADE_OUT_MS);
    }, HIGHLIGHT_MS);
  }

  function commitRespostaEAvancar(valor) {
    const p = perguntas[indiceAtual];
    respostas.push({
      index: indiceAtual,
      area: p.area,
      texto: p.texto,
      valor: valor,
    });
    persistir();

    indiceAtual += 1;

    if (indiceAtual < perguntas.length) {
      if (elDissolve) {
        elDissolve.style.transition = "none";
        elDissolve.style.opacity = "0";
        elDissolve.classList.remove("is-fading-out");
        atualizarTextoPergunta();
        montarBotoesOpcoes();
        atualizarBarraProgresso();
        renderDots();
        iniciarFadeInDissolve();
      } else {
        atualizarTextoPergunta();
        montarBotoesOpcoes();
        atualizarBarraProgresso();
        renderDots();
      }
      quizLocked = false;
      elOpcoes.removeAttribute("aria-busy");
    } else {
      if (elProgressFill) {
        elProgressFill.style.width = "100%";
      }
      prepararDissolveSemAnimacao();
      quizLocked = false;
      elOpcoes.removeAttribute("aria-busy");
      try {
        localStorage.setItem("talmidim_radar_done", "true");
      } catch (e) {}
      window.location.href = urlResultadoComScores();
    }
  }

  btnIntroContinuar.addEventListener("click", function () {
    esconder(elIntro);
    mostrar(elQuiz);
    indiceAtual = 0;
    respostas.length = 0;
    try {
      localStorage.removeItem("talmidim_radar_done");
    } catch (e) {}
    persistir();
    quizLocked = false;
    if (elOpcoes) {
      elOpcoes.classList.remove("radar-opcoes--choice-made");
    }
    renderPerguntaInicial();
  });

  if (perguntas.length !== 35) {
    console.warn(
      "radar.js: esperadas 35 perguntas, encontradas " + perguntas.length
    );
  }
})();
