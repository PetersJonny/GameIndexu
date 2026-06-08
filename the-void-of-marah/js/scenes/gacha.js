// Constantes de layout da tela de gacha, com posições e dimensões dos cards e botão.
const GACHA_CARD_WIDTH = 420;
const GACHA_CARD_HEIGHT = 520;
const GACHA_CARD_Y = 240;
const GACHA_CARD_X = [260, 830, 1400];
const GACHA_BUTTON = {
  x: 760,
  y: 900,
  width: 400,
  height: 110,
};

// Inicializa o estado do gacha se ainda não existir, sorteando três itens disponíveis.
function inicializarGacha(state) {
  if (!state.gacha) {
    state.gacha = {
      itens: window.gachaSystem.gerarItensGacha(),
      selecionado: null,
      aplicado: false,
      mensagem: "Escolha um item para receber como recompensa.",
    };
  }

  return state.gacha;
}

// Renderiza a tela de gacha com cards, seleção e botão de confirmação.
function renderGacha(ctx, state, mouseX, mouseY) {
  const gacha = inicializarGacha(state);

  ctx.fillStyle = "#1a1033";
  ctx.fillRect(0, 0, 1920, 1080);

  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.fillRect(120, 100, 1680, 860);


  // Título
  ctx.fillStyle = "#fff7d6";
  ctx.font = "bold 56px Arial";
  ctx.textAlign = "center";
  ctx.fillText("GACHA", 960, 160);

  // Mensagem centralizada acima dos cards
  ctx.fillStyle = "#f9f3d3";
  ctx.font = "28px Arial";
  ctx.textAlign = "center";
  wrapTextGacha(ctx, gacha.mensagem, 960, 220, 1200, 34);

  gacha.itens.forEach((item, index) => {
    const isSelected = gacha.selecionado === index;
    const isHover =
      mouseX >= GACHA_CARD_X[index] &&
      mouseX <= GACHA_CARD_X[index] + GACHA_CARD_WIDTH &&
      mouseY >= GACHA_CARD_Y &&
      mouseY <= GACHA_CARD_Y + GACHA_CARD_HEIGHT;

    ctx.fillStyle = isSelected ? "#2f274f" : "#24183b";
    ctx.fillRect(GACHA_CARD_X[index], GACHA_CARD_Y, GACHA_CARD_WIDTH, GACHA_CARD_HEIGHT);

    ctx.strokeStyle = isSelected ? "#ffe066" : "rgba(255,255,255,0.15)";
    ctx.lineWidth = 4;
    ctx.strokeRect(GACHA_CARD_X[index], GACHA_CARD_Y, GACHA_CARD_WIDTH, GACHA_CARD_HEIGHT);

    ctx.fillStyle = item.cor;
    ctx.font = "bold 30px Arial";
    ctx.textAlign = "left";
    ctx.fillText(item.nome, GACHA_CARD_X[index] + 30, GACHA_CARD_Y + 70);

    ctx.fillStyle = "#ffffff";
    ctx.font = "24px Arial";
    wrapTextGacha(ctx, item.descricao, GACHA_CARD_X[index] + 30, GACHA_CARD_Y + 150, GACHA_CARD_WIDTH - 60, 32);

    ctx.fillStyle = "#fff1a8";
    ctx.font = "bold 28px Arial";
    const textoBonus = item.tipo === "vida"
      ? `+${item.valor} VIDA`
      : item.tipo === "defesa"
        ? `+${item.valor} DEFESA`
        : `+${item.valor} ATAQUE`;
    ctx.fillText(textoBonus, GACHA_CARD_X[index] + 30, GACHA_CARD_Y + 430);

    if (isHover) {
      ctx.fillStyle = "rgba(255, 224, 102, 0.12)";
      ctx.fillRect(GACHA_CARD_X[index], GACHA_CARD_Y, GACHA_CARD_WIDTH, GACHA_CARD_HEIGHT);
    }
  });

  const canConfirm = gacha.selecionado !== null && !gacha.aplicado;
  const buttonHover =
    mouseX >= GACHA_BUTTON.x &&
    mouseX <= GACHA_BUTTON.x + GACHA_BUTTON.width &&
    mouseY >= GACHA_BUTTON.y &&
    mouseY <= GACHA_BUTTON.y + GACHA_BUTTON.height;

  ctx.fillStyle = canConfirm ? (buttonHover ? "#ffd34d" : "#ffbe24") : "#7f6c2b";
  ctx.fillRect(GACHA_BUTTON.x, GACHA_BUTTON.y, GACHA_BUTTON.width, GACHA_BUTTON.height);

  ctx.strokeStyle = "#1a1033";
  ctx.lineWidth = 4;
  ctx.strokeRect(GACHA_BUTTON.x, GACHA_BUTTON.y, GACHA_BUTTON.width, GACHA_BUTTON.height);

  ctx.fillStyle = "#1a1033";
  ctx.font = "bold 36px Arial";
  ctx.textAlign = "center";
  ctx.fillText(canConfirm ? "CONFIRMAR" : "ESCOLHA UM ITEM", GACHA_BUTTON.x + GACHA_BUTTON.width / 2, GACHA_BUTTON.y + 68);
}

// Divide texto em múltiplas linhas para ajuste dentro do card de gacha.
function wrapTextGacha(ctx, text, x, y, maxWidth, lineHeight) {
  const palavras = text.split(" ");
  let linha = "";

  for (let i = 0; i < palavras.length; i++) {
    const teste = linha + palavras[i] + " ";
    if (ctx.measureText(teste).width > maxWidth && i > 0) {
      ctx.fillText(linha, x, y);
      linha = palavras[i] + " ";
      y += lineHeight;
    } else {
      linha = teste;
    }
  }

  ctx.fillText(linha, x, y);
}

// Marca um item do gacha como selecionado e atualiza a mensagem de confirmação.
function selecionarItemGacha(index) {
  if (!state || !state.gacha || state.gacha.aplicado) return;

  state.gacha.selecionado = index;
  state.gacha.mensagem = `Você selecionou ${state.gacha.itens[index].nome}. Confirme para receber o bônus.`;
}

// Aplica o bônus do item selecionado ao estado do jogador e retorna para a cena do tabuleiro.
function confirmarGacha() {
  if (!state || !state.gacha || state.gacha.aplicado || state.gacha.selecionado === null) return;

  const itemSelecionado = state.gacha.itens[state.gacha.selecionado];
  window.gachaSystem.aplicarBonusGacha(state, itemSelecionado);

  state.gacha.aplicado = true;
  state.gacha.mensagem = `Você recebeu ${itemSelecionado.nome}! Volte ao tabuleiro para continuar.`;
  state.proximaCena = "jogo";
  state.emTransicao = true;
}

// Captura clique do mouse na tela de gacha: seleciona o card ou confirma a escolha.
window.addEventListener("mousedown", (event) => {
  if (!state || state.cena !== "gacha" || state.emTransicao || event.button !== 0) return;

  const canvas = document.getElementById("gameCanvas");
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const clickX = (event.clientX - rect.left) * (1920 / rect.width);
  const clickY = (event.clientY - rect.top) * (1080 / rect.height);

  const cardIndex = GACHA_CARD_X.findIndex((x, index) => {
    return (
      clickX >= x &&
      clickX <= x + GACHA_CARD_WIDTH &&
      clickY >= GACHA_CARD_Y &&
      clickY <= GACHA_CARD_Y + GACHA_CARD_HEIGHT
    );
  });

  if (cardIndex !== -1) {
    selecionarItemGacha(cardIndex);
    return;
  }

  if (
    clickX >= GACHA_BUTTON.x &&
    clickX <= GACHA_BUTTON.x + GACHA_BUTTON.width &&
    clickY >= GACHA_BUTTON.y &&
    clickY <= GACHA_BUTTON.y + GACHA_BUTTON.height
  ) {
    confirmarGacha();
  }
});
