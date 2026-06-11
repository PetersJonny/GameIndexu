// Ponto de entrada principal: inicializa canvas, estado global e faz o loop do jogo.

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Resolução nativa do jogo (1080p)
canvas.width = 1920;
canvas.height = 1080;

let mousePos = { x: 0, y: 0 };

/**
 * Estado Global do Jogo
 */
let state = {
  cena: "menu",
  volume: 10,
  volumeAntesDeMutar: 10,
  mutado: false,

  transicao: 0,
  emTransicao: false,
  proximaCena: "",

  personagemSelecionado: null,
  casaAtual: 0,
  fase: 1,
  bossTransition: null,
  gacha: null,
  itensRecebidos: [],
  itemReward: null,
  combatHouseType: null,

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
 */
const assets = {
  fundo: new Image(),
  fundoSelecao: new Image(),
  fundoBoard: new Image(),
  btnStart: new Image(),
  btnCreditos: new Image(),
  card1: new Image(),
  card2: new Image(),
  card3: new Image(),
  card4: new Image(),
  iconVida: new Image(),
  iconDefesa: new Image(),
  iconDano: new Image(),
  cardGachaAtk: new Image(),
  cardGachaDef: new Image(),
  fundoGacha: new Image(),
};

assets.fundo.src = "assets/drawings/titleScreenUI/background/TelaInicial.png";
assets.fundoSelecao.src =
  "assets/drawings/selectScreenUI/background/FundoSelecao.png";
assets.fundoBoard.src = "assets/bg/FundoBoard.png";
assets.btnStart.src = "assets/drawings/titleScreenUI/buttons/btn_start.png";
assets.btnCreditos.src =
  "assets/drawings/titleScreenUI/buttons/btn_creditos.png";
assets.card1.src =
  "assets/drawings/selectScreenUI/selectCard/MayaSelectCard.png";
assets.card2.src =
  "assets/drawings/selectScreenUI/selectCard/ZeckSelectCard.png";
assets.card3.src = "assets/drawings/chars/MayaChibiTab.png";
assets.card4.src = "assets/drawings/chars/ZeckChibiTab.png";
assets.iconVida.src = "assets/pixel_art/ui/coração pixelart.png";
assets.iconDefesa.src = "assets/pixel_art/ui/escudo pixelart.png";
assets.iconDano.src = "assets/pixel_art/ui/espada pixelart.png";
assets.cardGachaAtk.src = "assets/pixel_art/gacha/cartaataque.png";
assets.cardGachaDef.src = "assets/pixel_art/gacha/Cartadefesa.png";
assets.fundoGacha.src = "assets/pixel_art/gacha/fundo_do_felipe.png";



// Inicializa o módulo de cutscenes
inicializarCutscenes();

/**
 * Loop Principal do Jogo
 */
function loop() {
  ctx.clearRect(0, 0, 1920, 1080);
  ctx.imageSmoothingEnabled = false;

  // Renderização por Cena
  if (state.cena === "menu") {
    renderMenu(ctx, assets, state, mousePos.x, mousePos.y);
  } else if (state.cena === "cutscene") {
    renderCutscene(ctx);
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

  gerenciarTransicao();
  requestAnimationFrame(loop);
}

/**
 * Gerenciamento de Transição
 */
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

  if (state.transicao > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${state.transicao})`;
    ctx.fillRect(0, 0, 1920, 1080);
  }
}

/**
 * Eventos
 */
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mousePos.x = (e.clientX - rect.left) * (1920 / rect.width);
  mousePos.y = (e.clientY - rect.top) * (1080 / rect.height);
});

canvas.addEventListener("mousedown", (e) => {
  if (state.emTransicao) return;

  if (state.cena === "menu") {
    const acao = checkMenuClick(mousePos.x, mousePos.y, assets);
    if (acao === "iniciar") {
      state.proximaCena = "cutscene";
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
  } else if (state.cena === "cutscene") {
    const acao = checkCutsceneClick();
    if (acao === "proxima_cena") {
      state.proximaCena = "selecao";
      state.emTransicao = true;
    }
  } else if (state.cena === "selecao") {
    const escolha = checkSelecaoClick(mousePos.x, mousePos.y);
    if (escolha) {
      state.personagemSelecionado = escolha;
      state.proximaCena = "jogo";
      state.emTransicao = true;
    }
  }
});

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

assets.fundo.onload = () => {
  loop();
};
