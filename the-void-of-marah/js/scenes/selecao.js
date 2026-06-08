// Renderiza a tela de seleção de personagem com dois cards interativos.

// Configurações dos Cards
const CARD_W = 650;
const CARD_H = 700;
const DISTANCIA_ENTRE_CARDS = 80;
const POS_Y_CARDS = 280;
const ESCALA_HOVER = 1.05; // Aumento de 5%

/**
 * Renderiza a tela de seleção completa
 */
function renderSelecao(ctx, assets, mouseX, mouseY) {
  const centroX = 1920 / 2;

  // 1. Fundo
  if (assets.fundoSelecao.complete && assets.fundoSelecao.naturalWidth !== 0) {
    ctx.drawImage(assets.fundoSelecao, 0, 0, 1920, 1080);
  } else {
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, 1920, 1080);
  }

  // 2. Título
  ctx.fillStyle = "white";
  ctx.font = "bold 60px Arial";
  ctx.textAlign = "center";
  ctx.shadowBlur = 10;
  ctx.shadowColor = "black";
  ctx.fillText("Selecione seu Viajante", centroX, 200);
  ctx.shadowBlur = 0; // Reseta sombra para não afetar os cards

  // 3. Posicionamento dos Cards
  const xCard1 = centroX - CARD_W - DISTANCIA_ENTRE_CARDS / 2;
  const xCard2 = centroX + DISTANCIA_ENTRE_CARDS / 2;

  // 4. Renderização Individual
  renderCard(ctx, assets.card1, xCard1, POS_Y_CARDS, mouseX, mouseY);
  renderCard(ctx, assets.card2, xCard2, POS_Y_CARDS, mouseX, mouseY);
}

/**
 * Renderiza cada card individualmente com efeito de zoom
 */
function renderCard(ctx, img, x, y, mouseX, mouseY) {
  if (!img.complete || img.naturalWidth === 0) {
    ctx.fillStyle = "gray";
    ctx.fillRect(x, y, CARD_W, CARD_H);
    return;
  }

  // Detecta se o mouse está sobre o card
  const isHover =
    mouseX >= x && mouseX <= x + CARD_W && mouseY >= y && mouseY <= y + CARD_H;

  // Define escala e cálculos de centralização
  const escala = isHover ? ESCALA_HOVER : 1.0;
  const larguraFinal = CARD_W * escala;
  const alturaFinal = CARD_H * escala;
  const offsetX = (larguraFinal - CARD_W) / 2;
  const offsetY = (alturaFinal - CARD_H) / 2;

  ctx.save();

  if (isHover) {
    ctx.shadowBlur = 30;
    ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
  }

  ctx.drawImage(img, x - offsetX, y - offsetY, larguraFinal, alturaFinal);

  ctx.restore();
}

/**
 * Checa qual card foi clicado e retorna o ID do personagem
 */
function checkSelecaoClick(mouseX, mouseY) {
  const centroX = 1920 / 2;
  const xCard1 = centroX - CARD_W - DISTANCIA_ENTRE_CARDS / 2;
  const xCard2 = centroX + DISTANCIA_ENTRE_CARDS / 2;

  // Colisão Card 1 (Maya)
  if (
    mouseX >= xCard1 &&
    mouseX <= xCard1 + CARD_W &&
    mouseY >= POS_Y_CARDS &&
    mouseY <= POS_Y_CARDS + CARD_H
  ) {
    console.log("Maya selecionada!");
    return "maya";
  }

  // Colisão Card 2 (Zeck)
  if (
    mouseX >= xCard2 &&
    mouseX <= xCard2 + CARD_W &&
    mouseY >= POS_Y_CARDS &&
    mouseY <= POS_Y_CARDS + CARD_H
  ) {
    console.log("Zeck selecionado!");
    return "zeck";
  }

  return null; // Clicou fora dos cards
}
