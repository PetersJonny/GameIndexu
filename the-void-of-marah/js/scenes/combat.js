// Constantes de layout para o botão de ataque / continuar.
const COMBAT_BUTTON = {
  x: 1340,
  y: 905,
  width: 400,
  height: 120,
};

let combateStateGlobal = null;
let combateMouseXGlobal = 0;
let combateMouseYGlobal = 0;

const ENEMIGOS_COMBAT = [
  { name: "Slime", hp: 8, attack: 2, defense: 1 },
  { name: "Goblin", hp: 12, attack: 4, defense: 2 },
  { name: "Orc", hp: 20, attack: 5, defense: 3 },
  { name: "Wraith", hp: 16, attack: 5, defense: 1 },
];

// Renderiza a cena de combate, inicializa a batalha se necessário e desenha HUD + botão.
function renderCombat(ctx, assets, state, mouseX, mouseY) {
  combateStateGlobal = state;
  combateMouseXGlobal = mouseX;
  combateMouseYGlobal = mouseY;

  if (!state.combat) {
    iniciarCombate(state);
  }

  desenharCenarioCombate(ctx, state);
  desenharHUDCombate(ctx, state);
  desenharBotaoAtaque(ctx, state);
}

// Cria o estado inicial da batalha a partir do estado global do jogo.
function iniciarCombate(state) {
  state.combat = turnManager.createCombatState(state);
}

// Desenha o plano de fundo do combate e os painéis de inimigo/jogador.
function desenharCenarioCombate(ctx, state) {
  ctx.fillStyle = "#a4c3f2";
  ctx.fillRect(0, 0, 1920, 1080);

  ctx.fillStyle = "#e0e6f4";
  ctx.fillRect(80, 80, 1760, 920);

  ctx.fillStyle = "#1f1f2b";
  ctx.fillRect(100, 120, 1720, 220);
  ctx.fillRect(100, 520, 1720, 220);
  ctx.fillRect(100, 820, 1720, 200);

  ctx.fillStyle = "white";
  ctx.font = "bold 34px sans-serif";
  ctx.fillText("INIMIGO", 140, 170);
  ctx.fillText("JOGADOR", 140, 570);
}

// Desenha o HUD de combate com nome, barras de vida e texto de mensagem.
function desenharHUDCombate(ctx, state) {
  const combat = state.combat;

  ctx.font = "bold 52px monospace";
  ctx.fillStyle = "white";
  ctx.fillText(`${combat.enemyName}`, 140, 230);
  ctx.fillText(state.personagemSelecionado?.toUpperCase() || "PLAYER", 140, 630);

  desenharBarraVida(ctx, 140, 260, 900, 40, combat.enemyHP, combat.enemyMaxHP, "#77dd77");
  desenharBarraVida(ctx, 140, 660, 900, 40, combat.playerHP, combat.playerMaxHP, "#66b3ff");

  ctx.font = "24px sans-serif";
  ctx.fillStyle = "white";
  ctx.fillText(`HP: ${combat.enemyHP}/${combat.enemyMaxHP}`, 140, 315);
  ctx.fillText(`HP: ${combat.playerHP}/${combat.playerMaxHP}`, 140, 715);

  ctx.font = "28px sans-serif";
  ctx.fillStyle = "#f8f4e3";
  wrapText(ctx, combat.mensagem, 140, 875, 1650, 36);
}

function desenharBarraVida(ctx, x, y, width, height, current, max, color) {
  const ratio = Math.max(0, Math.min(1, current / max));
  ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
  ctx.fillRect(x, y, width, height);

  ctx.fillStyle = color;
  ctx.fillRect(x, y, width * ratio, height);

  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, width, height);
}

// Desenha o botão que o jogador usa para atacar ou continuar após o fim da batalha.
function desenharBotaoAtaque(ctx, state) {
  const combat = state.combat;
  const isHover =
    combateMouseXGlobal >= COMBAT_BUTTON.x &&
    combateMouseXGlobal <= COMBAT_BUTTON.x + COMBAT_BUTTON.width &&
    combateMouseYGlobal >= COMBAT_BUTTON.y &&
    combateMouseYGlobal <= COMBAT_BUTTON.y + COMBAT_BUTTON.height;

  ctx.fillStyle = combat.finalizado ? "#666" : isHover ? "#ffcc33" : "#ffbb00";
  ctx.fillRect(COMBAT_BUTTON.x, COMBAT_BUTTON.y, COMBAT_BUTTON.width, COMBAT_BUTTON.height);

  ctx.strokeStyle = "#000";
  ctx.lineWidth = 4;
  ctx.strokeRect(COMBAT_BUTTON.x, COMBAT_BUTTON.y, COMBAT_BUTTON.width, COMBAT_BUTTON.height);

  ctx.fillStyle = "#1f1f2b";
  ctx.font = "bold 46px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    combat.finalizado ? "CONTINUAR" : "ATACAR",
    COMBAT_BUTTON.x + COMBAT_BUTTON.width / 2,
    COMBAT_BUTTON.y + COMBAT_BUTTON.height / 2 + 16,
  );
  ctx.textAlign = "start";
}

// Chama a lógica do turno do jogador para executar o ataque.
function executarAtaque(state) {
  turnManager.handlePlayerAction(state);
}

// Finaliza a batalha e atualiza o estado com vitória ou derrota.
function finalizarCombate(state, venceu) {
  turnManager.finalizeBattle(state.combat, state, venceu);
}

// Após o combate, decide o próximo passo: seguir ao tabuleiro, avançar de fase ou reiniciar.
function continuarDepoisDoCombate(state) {
  const combat = state.combat;
  if (!combat || !combat.finalizado) return;

  if (combat.venceu) {
    if (state.bossTransition === "paraFase2") {
      state.fase = 2;
      state.casaAtual = 0;
      state.opcoesDeCaminho = [];
      controleMovimento.passosRestantes = 0;
      controleMovimento.esperandoEscolha = false;
      controleMovimento.dadoAtivo = false;
      controleMovimento.animandoPulo = false;
      controleMovimento.puloProgresso = 0;
      controleMovimento.casaOrigem = null;
      controleMovimento.casaDestino = null;
      state.bossTransition = null;
    } else if (state.bossTransition === "paraFase3") {
      state.fase = 3;
      state.casaAtual = 0;
      state.opcoesDeCaminho = [];
      controleMovimento.passosRestantes = 0;
      controleMovimento.esperandoEscolha = false;
      controleMovimento.dadoAtivo = false;
      controleMovimento.animandoPulo = false;
      controleMovimento.puloProgresso = 0;
      controleMovimento.casaOrigem = null;
      controleMovimento.casaDestino = null;
      state.bossTransition = null;
    } else if (state.bossTransition === "reiniciar") {
      state.casaAtual = 0;
      state.opcoesDeCaminho = [];
      controleMovimento.passosRestantes = 0;
      controleMovimento.esperandoEscolha = false;
      controleMovimento.dadoAtivo = false;
      controleMovimento.animandoPulo = false;
      controleMovimento.puloProgresso = 0;
      controleMovimento.casaOrigem = null;
      controleMovimento.casaDestino = null;
      state.bossTransition = null;
    }
    state.proximaCena = "jogo";
  } else {
    // Reset game on defeat: restore HP and return to board start
    state.stats.vida = state.stats.vidaMax;
    state.casaAtual = 0;
    state.opcoesDeCaminho = [];
    controleMovimento.passosRestantes = 0;
    controleMovimento.esperandoEscolha = false;
    controleMovimento.dadoAtivo = false;
    controleMovimento.animandoPulo = false;
    controleMovimento.puloProgresso = 0;
    controleMovimento.casaOrigem = null;
    controleMovimento.casaDestino = null;
    state.proximaCena = "jogo";
  }
  state.emTransicao = true;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

window.addEventListener("mousedown", (event) => {
  if (!combateStateGlobal || combateStateGlobal.cena !== "combat" || event.button !== 0) return;

  const canvas = document.getElementById("gameCanvas");
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const clickX = (event.clientX - rect.left) * (1920 / rect.width);
  const clickY = (event.clientY - rect.top) * (1080 / rect.height);

  const combat = combateStateGlobal.combat;

  if (
    clickX >= COMBAT_BUTTON.x &&
    clickX <= COMBAT_BUTTON.x + COMBAT_BUTTON.width &&
    clickY >= COMBAT_BUTTON.y &&
    clickY <= COMBAT_BUTTON.y + COMBAT_BUTTON.height
  ) {
    if (!combat || combat.finalizado) {
      continuarDepoisDoCombate(combateStateGlobal);
    } else {
      executarAtaque(combateStateGlobal);
    }
  }
});
