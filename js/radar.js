(function () {
  "use strict";

  const STORAGE_KEY = "talmidim_radar";

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
  const elResult = document.getElementById("radar-result");
  const btnIntroContinuar = document.getElementById("radar-intro-continuar");
  const elArea = document.getElementById("radar-area");
  const elPergunta = document.getElementById("radar-pergunta-texto");
  const elProgresso = document.getElementById("radar-progresso");
  const elOpcoes = document.getElementById("radar-opcoes");
  const btnResultContinuar = document.getElementById("radar-result-continuar");

  let indiceAtual = 0;
  const respostas = [];

  function persistir() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(respostas));
  }

  function mostrar(el) {
    el.hidden = false;
  }

  function esconder(el) {
    el.hidden = true;
  }

  function renderPergunta() {
    const p = perguntas[indiceAtual];
    elArea.textContent = p.area;
    elPergunta.textContent = p.texto;
    elProgresso.textContent = "Pergunta " + (indiceAtual + 1) + " de " + perguntas.length;

    elOpcoes.innerHTML = "";
    opcoesResposta.forEach(function (op) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "radar-opcao";
      btn.textContent = op.label;
      btn.setAttribute("data-valor", String(op.valor));
      btn.addEventListener("click", function () {
        onEscolha(op.valor);
      });
      elOpcoes.appendChild(btn);
    });
  }

  function onEscolha(valor) {
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
      renderPergunta();
    } else {
      esconder(elQuiz);
      mostrar(elResult);
    }
  }

  btnIntroContinuar.addEventListener("click", function () {
    esconder(elIntro);
    mostrar(elQuiz);
    indiceAtual = 0;
    respostas.length = 0;
    persistir();
    renderPergunta();
  });

  btnResultContinuar.addEventListener("click", function () {
    window.location.href = "/";
  });

  if (perguntas.length !== 35) {
    console.warn("radar.js: esperadas 35 perguntas, encontradas " + perguntas.length);
  }
})();
