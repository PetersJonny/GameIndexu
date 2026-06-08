// Ponto de entrada principal: inicializa canvas, estado global e faz o loop do jogo.

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Resolução nativa do jogo (1080p)
canvas.width = 1920;
canvas.height = 1080;

let mousePos = { x: 0, y: 0 };

/**
 * Estado Global do Jogo
 * Gerencia a cena atual, dados do jogador e progresso.
 */
let state = {
  cena: "menu",
  volume: 10,
  volumeAntesDeMutar: 10,
  mutado: false,

  // Controle de Transição (Fade)
  transicao: 0,
  emTransicao: false,
  proximaCena: "",

  // Dados do Personagem e Progressão
  personagemSelecionado: null, // "maya" ou "zeck"
  casaAtual: 0, // Índice da casa no tabuleiro (0-31)
  fase: 1,
  bossTransition: null,
  gacha: null,

  stats: {
    vida: 10,
    vidaMax: 10,
    defesa: 5,
    ataque: 3,
  },
};

window.state = state;

/**
 * Carregamento de Assets
 * Organizado conforme a arquitetura de pastas definida.
 */
const assets = {
  // Telas de Fundo
  fundo: new Image(),
  fundoSelecao: new Image(),
  fundoBoard: new Image(),

  // Elementos de UI (Desenhos)
  btnStart: new Image(),
  btnCreditos: new Image(),

  // Personagens (Cards e Chibis)
  card1: new Image(),
  card2: new Image(),
};

// Definição dos caminhos dos arquivos
assets.fundo.src = "assets/drawings/TitleScreenUI/background/TelaInicial.png";
assets.fundoSelecao.src =
  "assets/drawings/selectScreenUI/background/FundoSelecao.png";
assets.fundoBoard.src = "assets/bg/FundoBoard.png";
assets.btnStart.src = "assets/drawings/TitleScreenUI/buttons/btn_start.png";
assets.btnCreditos.src =
  "assets/drawings/TitleScreenUI/buttons/btn_creditos.png";
assets.card1.src =
  "assets/drawings/selectScreenUI/selectCard/MayaSelectCard.png";
assets.card2.src =
  "assets/drawings/selectScreenUI/selectCard/ZeckSelectCard.png";

/**
 * Loop Principal do Jogo
 */
function loop() {
  // Limpeza de tela e configurações de renderização
  ctx.clearRect(0, 0, 1920, 1080);
  ctx.imageSmoothingEnabled = false; // Preserva a nitidez de artes pixeladas

  // Máquina de Estados: Renderização por Cena
  if (state.cena === "menu") {
    renderMenu(ctx, assets, state, mousePos.x, mousePos.y);
  } else if (state.cena === "selecao") {
    renderSelecao(ctx, assets, mousePos.x, mousePos.y);
  } else if (state.cena === "creditos") {
    renderCreditos(ctx);
  } else if (state.cena === "jogo") {
    renderBoard(ctx, assets, state, mousePos.x, mousePos.y);
  } else if (state.cena === "combat") {
    renderCombat(ctx, assets, state, mousePos.x, mousePos.y);
  } else if (state.cena === "gacha") {
    renderGacha(ctx, state, mousePos.x, mousePos.y);
  }

  // Processamento do Sistema de Transição
  gerenciarTransicao();

  requestAnimationFrame(loop);
}

/**
 * Gerencia o efeito de fade-in e fade-out entre as cenas
 */
// Controla o fade entre cenas quando o jogo muda de estado.
function gerenciarTransicao() {
  if (state.emTransicao) {
    state.transicao += 0.05;
    if (state.transicao >= 1) {
      state.cena = state.proximaCena;
      state.emTransicao = false;
    }
  } else if (state.transicao > 0) {
    state.transicao -= 0.05;
  }

  // Desenha a sobreposição de transição
  if (state.transicao > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${state.transicao})`;
    ctx.fillRect(0, 0, 1920, 1080);
  }
}

/**
 * Eventos de Entrada (Mouse)
 */
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  // Ajusta a coordenada do mouse proporcionalmente ao tamanho do canvas na tela
  mousePos.x = (e.clientX - rect.left) * (1920 / rect.width);
  mousePos.y = (e.clientY - rect.top) * (1080 / rect.height);
});

// Captura cliques do mouse para menus, seleção de personagem e ajustes de volume.
canvas.addEventListener("mousedown", (e) => {
  if (state.emTransicao) return;

  // Cliques na Cena de Menu
  if (state.cena === "menu") {
    const acao = checkMenuClick(mousePos.x, mousePos.y, assets);
    if (acao === "iniciar") {
      state.proximaCena = "selecao";
      state.emTransicao = true;
    } else if (acao === "creditos") {
      state.proximaCena = "creditos";
      state.emTransicao = true;
    } else if (acao === "mudar_mudo") {
      alternarMute();
    } else if (acao === "aumentar") {
      if (state.volume < 10) state.volume++;
      state.mutado = false;
    } else if (acao === "diminuir") {
      if (state.volume > 0) state.volume--;
      if (state.volume === 0) state.mutado = true;
    }
  }
  // Cliques na Cena de Seleção
  else if (state.cena === "selecao") {
    const escolha = checkSelecaoClick(mousePos.x, mousePos.y);
    if (escolha) {
      state.personagemSelecionado = escolha;
      state.proximaCena = "jogo";
      state.emTransicao = true;
    }
  }
});

/**
 * Lógica de Volume
 */
function alternarMute() {
  if (!state.mutado) {
    state.volumeAntesDeMutar = state.volume;
    state.volume = 0;
    state.mutado = true;
  } else {
    state.volume = state.volumeAntesDeMutar;
    state.mutado = false;
  }
}

// Inicia o jogo assim que o primeiro asset fundamental carregar
assets.fundo.onload = () => {
  loop();
};
