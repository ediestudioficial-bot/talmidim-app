const fs = require("fs");
const path = require("path");

const themes = [
  "Intimidade com Deus",
  "a Palavra",
  "a oração",
  "a comunhão",
  "o evangelho",
  "o caráter",
  "a mordomia",
];

const intros = [
  "Hoje a pergunta é direta:",
  "O que fica quando ninguém olha?",
  "Sua rotina grita o que sua boca esconde:",
  "Deus não pede discurso; pede verdade:",
  "O Evangelho não é teoria; é formato de vida:",
  "Onde você está confortável demais?",
  "A fé sem prática é lembrança, não vida:",
];

/** Direções: comandos diretos, sem "tente / procure / busque". */
const dirs = [
  "Pare de justificar. Faça uma escolha concreta hoje e cumpra até o fim.",
  "Decida obedecer antes de sentir. Um passo real vale mais que dez intenções.",
  "Humilhe-se diante de Deus e aja. Ele não molda quem só planeja.",
  "Some os dias, não os discursos. O que você fará com as próximas horas?",
  "Corte o que alimenta a carne. Alimente o que alimenta o Espírito — hoje.",
  "A graça salva; a disciplina ordena. Submeta o corpo e a agenda ao Senhor.",
  "Carregue a cruz hoje: negação de si, não performance para plateia.",
];

/**
 * Ações: específicas, com tempo, em linhas curtas (use \n).
 * Formato: imperativo + tempo explícito.
 */
const acoesPorDia = [
  `Pare.
Fique em silêncio 3 minutos sem tela.
Ore em voz baixa: "Senhor, estou aqui."`,
  `Abra a Bíblia.
Leia 8 versículos em voz alta, uma vez.
Anote num papel uma frase que te confrontou.`,
  `Pare.
Ore 10 minutos seguidos por três pessoas pelo nome — sem intercalar redes.`,
  `Ligue ou escreva para um irmão em Cristo.
Conversa real: 15 minutos mínimo.
Sem fofoca, sem julgar terceiros.`,
  `Decida.
Hoje você contará a alguém fora da igreja uma frase sobre o que Cristo mudou em você.
Faça antes das 21h.`,
  `Pare onde você está.
Confesse um pecado concreto a Deus em voz baixa, 5 minutos.
Não minimize; nomeie.`,
  `Liste no papel três usos do seu tempo hoje.
Corte um que rouba de Deus ou do próximo.
Cumpra o corte.`,
  `Desligue notificações 25 minutos.
Leia um capítulo da Bíblia em voz baixa, inteiro.
Escreva três linhas: o que Deus disse.`,
  `Ore 12 minutos em um só lugar, em pé ou ajoelhado.
Sem música, sem podcast.
Só você e Deus.`,
  `Sirva alguém: tarefa física concreta (lavar louça, carregar algo, buscar alguém).
40 minutos máximo para cumprir.
Não poste, não conte para ganhar aplauso.`,
  `Escreva num cartão um versículo.
Leia em voz alta 5 vezes ao longo do dia, em horários que você marcou.`,
  `Pare.
Perdoe uma pessoa pelo nome — em oração 7 minutos.
Se precisar, peça perdão a alguém hoje, pessoalmente ou por mensagem sincera.`,
  `Ore 15 minutos pela salvação de duas pessoas — nome sobrenome ou apelido claro.
Sem desviar para outros assuntos.`,
  `Vá sem celular para um cômodo.
Leia o Sermão da Montanha (Mateus 5–7) em blocos de 10 minutos até terminar hoje.`,
  `Decida não mentir hoje — nem "brincadeira" nem omissão que engana.
Se errar, corrija na hora.`,
  `Doe algo seu (tempo ou recurso) sem ser perguntado: uma ação visível em até 2 horas.`,
  `Pare toda entretenimento após 22h.
Ore 10 minutos antes de dormir só em gratidão e confissão.`,
  `Escolha um versículo.
Memorize: 20 repetições em voz alta, espalhadas pelo dia.`,
  `Encontre um irmão face a face ou vídeo ao vivo 20 minutos.
Pergunte: "Como posso orar por você?" — ore na hora.`,
  `Ore em línguas ou em silêncio profundo 10 minutos — o que for sua prática — sem multitarefa.`,
  `Convide alguém para café ou caminhada 30 minutos.
Fale de Jesus uma vez com clareza, sem pressão teatral.`,
  `Pare.
Jejuje uma refeição hoje — água permitida — e ore 15 minutos nesse intervalo.`,
  `Leia um salmo inteiro em voz alta três vezes no mesmo dia (manhã, tarde, noite).`,
  `Escreva sua decisão do PDD num papel.
Cumpra hoje um passo mínimo dela em 20 minutos focados.`,
  `Ore 8 minutos só pelos líderes da sua igreja — nomes concretos.`,
  `Silêncio 5 minutos.
Depois ore 10 minutos intercedendo por um país ou cidade que você escolheu antes de começar.`,
  `Leia a última ceia e a crucificação (ex.: João 13–19) em 45 minutos sem pausa de rede social.`,
  `Confesse a Deus um hábito de caráter que você tolerou.
Escolha um substituto santo e faça uma vez hoje.`,
  `Não abra redes sociais até 12h.
Ore 5 minutos ao acordar e 5 ao meio-dia — só gratidão.`,
  `Faça uma tarefa que vem adiando há mais de uma semana relacionada à sua fé ou família — hoje, antes do jantar.`,
  `Ore 20 minutos em um só tema: santidade no pensamento.
Toda imaginação que subir, entregue — sem se distrair para lista de afazeres.`,
  `Dê testemunho verbal a uma pessoa: 2 minutos máximo, verdadeiro, sem exagero espiritual.`,
  `Pare.
Escreva três mentiras que você conta para si.
Queime ou rasgue o papel depois de confessar a Deus em voz alta.`,
  `Leia Provérbios capítulo do dia do mês (ou cap. 1 se não couber).
Sublinhe um versículo e pratique antes de dormir.`,
  `Ore caminhando 15 minutos ao ar livre.
Sem fone, sem podcast.`,
  `Escolha um inimigo ou alguém que te irrita.
Ore por ele 10 minutos — bênçãos específicas, não ironia.`,
  `Desligue a TV e o streaming hoje inteiro.
Troque por 30 minutos de leitura bíblica ou livro cristão sério.`,
  `Visite ou ligue para alguém doente, idoso ou sozinho.
Conversa mínima 15 minutos.`,
  `Pare.
Liste o que você gastou ontém (tempo e dinheiro).
Peça a Deus perdão por um item e mude hoje.`,
  `Ore 10 minutos ajoelhado (ou de pé se joelhos não der) — só adoração, zero pedido.`,
  `Escreva uma carta a Deus: uma página, à mão, em 20 minutos.
Guarde ou guarde no coração — mas termine.`,
  `Evite reclamar em voz alta hoje.
Cada vez que vier reclamação, ore 1 minuto em silêncio no lugar.`,
  `Leia Romanos 8 em uma sessão de 35 minutos.
Anote um versículo que manda parar de ter medo.`,
  `Ore 12 minutos pelos seus pais ou figuras que os substituem — nome por nome.`,
  `Faça um jejum de redes 24 horas a partir de agora.
Ore 5 minutos cada vez que sentir vontade de abrir o app.`,
  `Sirva na igreja ou comunidade: tarefa concreta com hora marcada (não "algum dia").`,
  `Pare.
Ore 15 minutos pedindo: "Mostra-me um pecado que eu estou chamando de personalidade."`,
  `Leia o livro de Tiago inteiro hoje, em até duas sessões.
Marque uma ordem de Tiago e cumpra hoje.`,
  `Ore 10 minutos agradecendo só pelo que você não merece.`,
  `Revise sua decisão do PDD.
Faça hoje a ação completa que você descreveu — sem encurtar, sem adiar para amanhã.`,
];

const dias = [];
for (let i = 1; i <= 47; i++) {
  const t = themes[(i - 1) % 7];
  const intro = intros[(i - 1) % intros.length];
  const dir = dirs[(i - 1) % dirs.length];
  const onde = intro.trim().endsWith("?") ? " Onde " : " onde ";
  const acao = acoesPorDia[i - 1] || acoesPorDia[(i - 1) % acoesPorDia.length];
  dias.push({
    dia: i,
    confronto: `${intro}${onde}${t} está real — ou só no discurso?`,
    direcao: `Foco de hoje: ${t}. ${dir}`,
    acao: `${acao}\n\nFaça sua decisão do PDD aparecer nesta prática — sem atalhos.`,
  });
}

const out = path.join(__dirname, "..", "js", "jornada-dias.json");
fs.writeFileSync(out, JSON.stringify(dias, null, 0), "utf8");
console.log("Wrote", out, dias.length);
