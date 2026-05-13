const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Resolução nativa do jogo
canvas.width = 1920;
canvas.height = 1080;

let mousePos = { x: 0, y: 0 };

let state = {
  cena: "menu",
  volume: 10,
  volumeAntesDeMutar: 10,
  mutado: false,
  transicao: 0,
  emTransicao: false,
  proximaCena: "",
  personagemSelecionado: null, // Aqui será guardado "maya" ou "zeck"
};

const assets = {
  fundo: new Image(),
  fundoSelecao: new Image(),
  btnStart: new Image(),
  btnCreditos: new Image(),
  card1: new Image(),
  card2: new Image(),
};

// Caminhos dos Assets
assets.fundo.src = "assets/drawings/TitleScreenUI/background/TelaInicial.png";
assets.fundoSelecao.src =
  "assets/drawings/selectScreenUI/background/FundoSelecao.png";
assets.btnStart.src = "assets/drawings/TitleScreenUI/buttons/btn_start.png";
assets.btnCreditos.src =
  "assets/drawings/TitleScreenUI/buttons/btn_creditos.png";
assets.card1.src =
  "assets/drawings/selectScreenUI/selectCard/MayaSelectCard.png";
assets.card2.src =
  "assets/drawings/selectScreenUI/selectCard/ZeckSelectCard.png";

function loop() {
  // Limpa a tela
  ctx.clearRect(0, 0, 1920, 1080);
  ctx.imageSmoothingEnabled = false; // Mantém o estilo pixel art/limpo se necessário

  // Máquina de Estados de Cenas
  if (state.cena === "menu") {
    renderMenu(ctx, assets, state, mousePos.x, mousePos.y);
  } else if (state.cena === "selecao") {
    renderSelecao(ctx, assets, mousePos.x, mousePos.y);
  } else if (state.cena === "creditos") {
    renderCreditos(ctx);
  } else if (state.cena === "jogo") {
    // Aqui vamos puxar a função do tabuleiro/jogo principal
    // Exemplo: renderBoard(ctx, state);
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText(
      `Jogo Iniciado com: ${state.personagemSelecionado}`,
      1920 / 2,
      1080 / 2,
    );
  }

  // Sistema de Transição (Fade Out/In)
  if (state.emTransicao) {
    state.transicao += 0.05;
    if (state.transicao >= 1) {
      state.cena = state.proximaCena;
      state.emTransicao = false;
    }
  } else if (state.transicao > 0) {
    state.transicao -= 0.05;
  }

  // Desenha o retângulo de transição (Flash branco ou preto)
  if (state.transicao > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${state.transicao})`;
    ctx.fillRect(0, 0, 1920, 1080);
  }

  requestAnimationFrame(loop);
}

// Cálculo da posição do mouse ajustado para o redimensionamento do Canvas
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mousePos.x = (e.clientX - rect.left) * (1920 / rect.width);
  mousePos.y = (e.clientY - rect.top) * (1080 / rect.height);
});

canvas.addEventListener("mousedown", (e) => {
  if (state.emTransicao) return;

  // Lógica de cliques no Menu
  if (state.cena === "menu") {
    const acao = checkMenuClick(mousePos.x, mousePos.y, assets);
    if (acao === "iniciar") {
      state.proximaCena = "selecao";
      state.emTransicao = true;
    } else if (acao === "creditos") {
      state.proximaCena = "creditos";
      state.emTransicao = true;
    } else if (acao === "mudar_mudo") {
      manusearVolume();
    } else if (acao === "aumentar") {
      if (state.volume < 10) state.volume++;
      state.mutado = false;
    } else if (acao === "diminuir") {
      if (state.volume > 0) state.volume--;
      if (state.volume === 0) state.mutado = true;
    }
  }

  // Lógica de cliques na Seleção de Personagem
  else if (state.cena === "selecao") {
    const escolha = checkSelecaoClick(mousePos.x, mousePos.y);
    if (escolha) {
      state.personagemSelecionado = escolha; // Salva "maya" ou "zeck"
      state.proximaCena = "jogo"; // Define o destino como a tela de board/jogo
      state.emTransicao = true;
    }
  }
});

// Função auxiliar para o mute
function manusearVolume() {
  if (!state.mutado) {
    state.volumeAntesDeMutar = state.volume;
    state.volume = 0;
    state.mutado = true;
  } else {
    state.volume = state.volumeAntesDeMutar;
    state.mutado = false;
  }
}

// Inicia o loop quando a imagem principal carregar
assets.fundo.onload = () => loop();
