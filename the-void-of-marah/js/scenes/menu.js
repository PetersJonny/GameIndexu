// Renderiza a tela de menu principal com botões de iniciar, créditos e controle de volume.

// Ajustes finos de posição (em pixels dentro dos 1920x1080)
const POS_START_Y = 680; // Posição vertical do Start
const POS_CREDITOS_Y = 820; // Posição vertical dos Créditos
const POS_VOLUME_Y = 580; // Posição vertical do Volume (logo acima do Start)
const DISTANCIA_X_UI = 85; // Espaçamento entre os ícones de volume

function renderMenu(ctx, assets, state, mouseX, mouseY) {
  const centroX = 1920 / 2;

  // 1. Fundo
  ctx.drawImage(assets.fundo, 0, 0, 1920, 1080);

  // 2. UI de Volume
  ctx.fillStyle = "white";
  ctx.font = "bold 45px Arial";
  ctx.textAlign = "center";
  let icone = state.mutado || state.volume === 0 ? "🔇" : "🔊";

  ctx.fillText(icone, centroX - DISTANCIA_X_UI * 1.5, POS_VOLUME_Y);
  ctx.fillText("-", centroX - DISTANCIA_X_UI * 0.5, POS_VOLUME_Y);
  ctx.fillText(
    state.volume.toString(),
    centroX + DISTANCIA_X_UI * 0.5,
    POS_VOLUME_Y,
  );
  ctx.fillText("+", centroX + DISTANCIA_X_UI * 1.5, POS_VOLUME_Y);

  // 3. Botão Start com Animação
  renderBotao(ctx, assets.btnStart, centroX, POS_START_Y, mouseX, mouseY);

  // 4. Botão Créditos com Animação
  renderBotao(ctx, assets.btnCreditos, centroX, POS_CREDITOS_Y, mouseX, mouseY);
}

// Função auxiliar para desenhar botões com efeito de hover
function renderBotao(ctx, img, x, y, mouseX, mouseY) {
  const isHover =
    mouseX >= x - img.width / 2 &&
    mouseX <= x + img.width / 2 &&
    mouseY >= y - img.height / 2 &&
    mouseY <= y + img.height / 2;

  const scale = isHover ? 1.1 : 1.0;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  ctx.restore();
}

function checkMenuClick(mouseX, mouseY, assets) {
  const centroX = 1920 / 2;

  // Clique no Start
  const s = assets.btnStart;
  if (
    mouseX > centroX - s.width / 2 &&
    mouseX < centroX + s.width / 2 &&
    mouseY > POS_START_Y - s.height / 2 &&
    mouseY < POS_START_Y + s.height / 2
  )
    return "iniciar";

  // Clique nos Créditos
  const c = assets.btnCreditos;
  if (
    mouseX > centroX - c.width / 2 &&
    mouseX < centroX + c.width / 2 &&
    mouseY > POS_CREDITOS_Y - c.height / 2 &&
    mouseY < POS_CREDITOS_Y + c.height / 2
  )
    return "creditos";

  // Cliques no Volume (Hitboxes Dinâmicas)
  if (Math.abs(mouseY - (POS_VOLUME_Y - 15)) < 40) {
    if (
      mouseX > centroX - DISTANCIA_X_UI * 1.5 - 40 &&
      mouseX < centroX - DISTANCIA_X_UI * 1.5 + 40
    )
      return "mudar_mudo";
    if (
      mouseX > centroX - DISTANCIA_X_UI * 0.5 - 40 &&
      mouseX < centroX - DISTANCIA_X_UI * 0.5 + 40
    )
      return "diminuir";
    if (
      mouseX > centroX + DISTANCIA_X_UI * 1.5 - 40 &&
      mouseX < centroX + DISTANCIA_X_UI * 1.5 + 40
    )
      return "aumentar";
  }

  return null;
}
