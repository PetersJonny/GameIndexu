
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
  slime: new Image(),
  bossShadowLord: new Image(),
  iconVida: new Image(),
  iconDefesa: new Image(),
  iconDano: new Image(),
  cardGachaAtk: new Image(),
  cardGachaDef: new Image(),
  fundoGacha: new Image(),
  musica_de_fundo: new Audio("assets/sounds/phantasticbeats-rpg-city-8381.mp3"),
  musica_de_inicial: new Audio(
    "assets/sounds/rubyzephyr-fantasy-rpg-exploration-v2-461303.mp3",
  ),
  crystalSerpent: new Image(),
  eclipseQueen: new Image(),
  reiEspiral: new Image(),
  flameBat: new Image(),
  goblin: new Image(),
  golem: new Image(),
  orc: new Image(),
  spectralKnight: new Image(),
  viperMage: new Image(),
  voidStalker: new Image(),
  wraith: new Image(),
  pocao_cura: new Image(),
  escudo: new Image(),
  lamina_rapida: new Image(),
  elixir_vigor: new Image(),
  aco_refinado: new Image(),
  fogo_das_almas: new Image(),
  boblbleble: new Image(),
  colar: new Image(),
  estrela_com_palito: new Image(),
  frigideira: new Image(),
  guitarra: new Image(),
  joker: new Image(),
  lanterna: new Image(),
  latinha: new Image(),
  olhoMagico: new Image(),
  oniguiri: new Image(),
  pesos: new Image(),
  siri: new Image(),
  tetris: new Image(),
  fundoCombat: new Image(),
  mayaCombat: new Image(),
  zeckCombat: new Image(),
  omnitrix: new Image(),
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
assets.slime.src = "assets/drawings/bosses/SlimeCombat.png";
assets.bossShadowLord.src = "assets/drawings/bosses/ShadowLordCombat.png";
assets.crystalSerpent.src = "assets/drawings/bosses/CrystalSerpentCombat.png";
assets.eclipseQueen.src = "assets/drawings/bosses/EclipseQueenCombat.png";
assets.reiEspiral.src = "";
assets.iconVida.src = "assets/pixel_art/ui/coração pixelart.png";
assets.iconDefesa.src = "assets/pixel_art/ui/escudo pixelart.png";
assets.iconDano.src = "assets/pixel_art/ui/espada pixelart.png";
assets.cardGachaAtk.src = "assets/pixel_art/gacha/cartaataque.png";
assets.cardGachaDef.src = "assets/pixel_art/gacha/Cartadefesa.png";
assets.fundoGacha.src = "assets/pixel_art/gacha/fundo_do_felipe.png";
assets.flameBat.src = "assets/drawings/bosses/FlameBatCombat.png";
assets.goblin.src = "assets/drawings/bosses/GoblinCombat.png";
assets.golem.src = "assets/drawings/bosses/GolemCombat.png";
assets.orc.src = "assets/drawings/bosses/OrcCombat.png";
assets.spectralKnight.src = "assets/drawings/bosses/SpectralKnightCombat.png";
assets.viperMage.src = "assets/drawings/bosses/ViperMageCombat.png";
assets.voidStalker.src = "assets/drawings/bosses/VoidStalkerCombat.png";
assets.wraith.src = "assets/drawings/bosses/WraithCombat.png";
assets.pocao_cura.src = "assets/pixel_art/gacha/maçã_do_amor.png"; // Usando a maçã como poção de cura
assets.escudo.src = "assets/pixel_art/gacha/escudo.png";
assets.lamina_rapida.src = "assets/pixel_art/gacha/lâmina_rápida.png";
assets.elixir_vigor.src = "assets/pixel_art/gacha/Elixir_de_Vigor.png";
assets.aco_refinado.src = "assets/pixel_art/gacha/aço_refinado.png";
assets.fogo_das_almas.src = "assets/pixel_art/gacha/fogo_das_almas.png";
assets.boblbleble.src = "assets/pixel_art/gacha/boblbleble.png";
assets.colar.src = "assets/pixel_art/gacha/colar-0001.png";
assets.estrela_com_palito.src = "assets/pixel_art/gacha/estrela_com_palito.png";
assets.frigideira.src = "assets/pixel_art/gacha/frigereda.png";
assets.guitarra.src = "assets/pixel_art/gacha/guitarra.png";
assets.joker.src = "assets/pixel_art/gacha/joker.png";
assets.lanterna.src = "assets/pixel_art/gacha/lanterna.png";
assets.latinha.src = "assets/pixel_art/gacha/latinha.png";
assets.olhoMagico.src = "assets/pixel_art/gacha/olhoMagico.png";
assets.oniguiri.src = "assets/pixel_art/gacha/oniguiri.png";
assets.pesos.src = "assets/pixel_art/gacha/pesos.png";
assets.siri.src = "assets/pixel_art/gacha/Siri.png";
assets.tetris.src = "assets/pixel_art/gacha/tetris.png";
assets.fundoCombat.src = "assets/bg/FundoCombat.png";
assets.mayaCombat.src = "assets/drawings/chars/Combat/MayaCombat.png";
assets.zeckCombat.src = "assets/drawings/chars/Combat/ZeckCombat.png";
assets.omnitrix.src = "assets/pixel_art/gacha/omnitrix.png";

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
    assets.musica_de_inicial.loop = true;
    assets.musica_de_inicial.play();
    assets.musica_de_inicial.volume = state.mutado ? 0 : state.volume / 10;
  } else if (state.cena === "cutscene") {
    renderCutscene(ctx);
  } else if (state.cena === "selecao") {
    renderSelecao(ctx, assets, mousePos.x, mousePos.y);
  } else if (state.cena === "creditos") {
    renderCreditos(ctx);
  } else if (state.cena === "jogo") {
    renderBoard(ctx, assets, state, mousePos.x, mousePos.y);
    assets.musica_de_fundo.loop = true;
    assets.musica_de_fundo.play();
    assets.musica_de_fundo.volume = state.mutado ? 0 : state.volume / 10;
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
      assets.musica_de_fundo.pause();
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
      assets.musica_de_inicial.pause();
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
