(function () {
  "use strict";

  const STORAGE_KEY = "talmidim_radar";

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

  const perguntas = [
    { area: "Intimidade", texto: "Nos últimos 7 dias, você separou tempo real para estar com Deus em oração?" },
    { area: "Intimidade", texto: "Nos últimos 7 dias, você leu a Bíblia com atenção ou apenas abriu?" },
    { area: "Intimidade", texto: "Nos últimos 7 dias, você sentiu sede de buscar a presença de Deus?" },
    { area: "Intimidade", texto: "Nos últimos 7 dias, você confessou pecados e buscou um coração limpo?" },
    { area: "Intimidade", texto: "Nos últimos 7 dias, a gratidão a Deus foi parte do seu dia a dia?" },
    { area: "Palavra", texto: "Nos últimos 7 dias, você meditou no que leu nas Escrituras além do momento da leitura?" },
    { area: "Palavra", texto: "Nos últimos 7 dias, a Palavra orientou alguma decisão sua?" },
    { area: "Palavra", texto: "Nos últimos 7 dias, você memorizou ou revisitou um versículo com intenção?" },
    { area: "Palavra", texto: "Nos últimos 7 dias, você estudou a Bíblia (não só leitura devocional rápida)?" },
    { area: "Palavra", texto: "Nos últimos 7 dias, você compartilhou algo que aprendeu da Palavra com alguém?" },
    { area: "Oração", texto: "Nos últimos 7 dias, você orou por outras pessoas pelo nome?" },
    { area: "Oração", texto: "Nos últimos 7 dias, você esperou em Deus antes de agir por impulso?" },
    { area: "Oração", texto: "Nos últimos 7 dias, houve momentos em que sua oração incluiu louvor e escuta, não só pedidos?" },
    { area: "Oração", texto: "Nos últimos 7 dias, você buscou a vontade de Deus em algo concreto da sua vida?" },
    { area: "Oração", texto: "Nos últimos 7 dias, você intercedeu por uma situação que não depende só de você?" },
    { area: "Comunhão", texto: "Nos últimos 7 dias, você participou da vida da igreja (culto, célula ou encontro)?" },
    { area: "Comunhão", texto: "Nos últimos 7 dias, você investiu em construir ou restaurar um relacionamento fraterno?" },
    { area: "Comunhão", texto: "Nos últimos 7 dias, você perdoou ou pediu perdão a alguém da fé?" },
    { area: "Comunhão", texto: "Nos últimos 7 dias, você serviu alguém da comunidade sem buscar reconhecimento?" },
    { area: "Comunhão", texto: "Nos últimos 7 dias, você evitou fofoca ou julgamento sobre irmãos?" },
    { area: "Evangelismo", texto: "Nos últimos 7 dias, você orou por pessoas que não conhecem a Cristo?" },
    { area: "Evangelismo", texto: "Nos últimos 7 dias, você teve uma conversa sobre fé com alguém fora da igreja?" },
    { area: "Evangelismo", texto: "Nos últimos 7 dias, você deu testemunho (com palavra ou atitude) de Jesus?" },
    { area: "Evangelismo", texto: "Nos últimos 7 dias, você se importou de verdade com quem está longe de Deus?" },
    { area: "Evangelismo", texto: "Nos últimos 7 dias, você deu um passo prático para cumprir a Grande Comissão?" },
    { area: "Caráter", texto: "Nos últimos 7 dias, você resistiu à tentação recorrendo à graça (oração, Palavra ou fuga)?" },
    { area: "Caráter", texto: "Nos últimos 7 dias, sua integridade foi provada (dinheiro, verdade ou compromissos)?" },
    { area: "Caráter", texto: "Nos últimos 7 dias, você guardou os olhos e o coração do que desvia?" },
    { area: "Caráter", texto: "Nos últimos 7 dias, você foi paciente e manso em situação difícil?" },
    { area: "Caráter", texto: "Nos últimos 7 dias, você priorizou obediência a Deus em detrimento do próprio conforto?" },
    { area: "Mordomia", texto: "Nos últimos 7 dias, você administrou tempo e recursos com consciência de que são de Deus?" },
    { area: "Mordomia", texto: "Nos últimos 7 dias, você usou seus dons para edificar o Corpo de Cristo?" },
    { area: "Mordomia", texto: "Nos últimos 7 dias, você cumpriu com responsabilidades que assumiu no serviço cristão?" },
    { area: "Mordomia", texto: "Nos últimos 7 dias, você descansou tempo suficiente sem culpa indevida (como oferta a Deus)?" },
    { area: "Mordomia", texto: "Nos últimos 7 dias, você alinhou planos futuros à direção de Deus em oração?" },
  ];

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

  const TOTAL_SEGMENTS = 5;

  let indiceAtual = 0;
  const respostas = [];
  let quizLocked = false;

  function renderDots() {
    if (!elDots) return;
    const n = TOTAL_SEGMENTS;
    const step = perguntas.length / n;
    const active = Math.min(n - 1, Math.floor(indiceAtual / step));
    elDots.innerHTML = "";
    for (let i = 0; i < n; i++) {
      const dot = document.createElement("div");
      dot.className = "radar-dot" + (i === active ? " radar-dot--active" : "");
      elDots.appendChild(dot);
    }
  }

  function atualizarBarraProgresso() {
    if (!elProgressFill) return;
    const pct = ((indiceAtual + 1) / perguntas.length) * 100;
    elProgressFill.style.width = pct + "%";
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

  /**
   * Conteúdo já está invisível (opacity 0). Dispara fade-in em 2 rAF.
   */
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

  /**
   * Primeira pergunta: começa invisível e entra com fade-in (sem trocar texto com opacity > 0).
   */
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
      window.location.href = "radar-pausa.html";
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
    console.warn("radar.js: esperadas 35 perguntas, encontradas " + perguntas.length);
  }
})();
