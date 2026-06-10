// Constantes de layout para o Menu de Ações (Grid 2x2)
const BTN_W = 380; 
const BTN_H = 100; 
const BTN_SPACING = 20;

const MENU_X = 750; 
const MENU_Y = 800; 

// O primeiro quadrado da esquerda em cima (Botão Soco)
const BOTAO_SOCO = {
  x: MENU_X,
  y: MENU_Y,
  width: BTN_W,
  height: BTN_H,
};

// Novo botão CONTINUAR que aparecerá no centro da tela
const BOTAO_CONTINUAR = {
  x: 760, // Centralizado no eixo X (1920/2 - 200)
  y: 490, // Centralizado no eixo Y (1080/2 - 50)
  width: 400,
  height: 100,
};

let combateStateGlobal = null;
let combateMouseXGlobal = 0;
let combateMouseYGlobal = 0;

// Renderiza a cena de combate, inicializa a batalha se necessário e desenha HUD + botões.
function renderCombat(ctx, assets, state, mouseX, mouseY) {
  combateStateGlobal = state;
  combateMouseXGlobal = mouseX;
  combateMouseYGlobal = mouseY;

  if (!state.combat) {
    iniciarCombate(state);
  }

  desenharCenarioCombate(ctx, state);
  desenharHUDCombate(ctx, state);
  desenharBotoesAcao(ctx, state); 
}

// Cria o estado inicial da batalha a partir do estado global do jogo.
function iniciarCombate(state) {
  state.combat = turnManager.createCombatState(state);
}

// Desenha o plano de fundo do combate e os "quadrados grandes" dos personagens.
function desenharCenarioCombate(ctx, state) {
  ctx.fillStyle = "#a4c3f2";
  ctx.fillRect(0, 0, 1920, 1080);

  ctx.fillStyle = "#e0e6f4";
  ctx.fillRect(50, 50, 1820, 980);

  ctx.fillStyle = "#1f1f2b";
  // Quadrado do Inimigo (Topo Direita)
  ctx.fillRect(1400, 80, 350, 350);
  
  // Quadrado do Jogador (Meio Esquerda)
  ctx.fillRect(150, 450, 350, 350);
}

// Desenha o HUD de combate com nome, defesa, barras de vida e mensagem.
function desenharHUDCombate(ctx, state) {
  const combat = state.combat;
  if (!combat) return;

  // ---- STATUS DO INIMIGO ----
  const enemyBarY = 100; 
  
  desenharBarraVida(ctx, 350, enemyBarY, 1000, 40, combat.enemyHP, combat.enemyMaxHP, "#ff4c4c");
  ctx.font = "bold 24px sans-serif";
  ctx.fillStyle = "white";
  ctx.fillText(`HP: ${combat.enemyHP}/${combat.enemyMaxHP}`, 360, enemyBarY + 28);

  ctx.fillStyle = "#1f1f2b";
  ctx.font = "bold 38px sans-serif";
  ctx.textAlign = "right"; 
  ctx.fillText(`${combat.enemyName || "Inimigo"}  |  DEFESA: ${combat.enemyDefense || 0}`, 1350, enemyBarY + 80);
  ctx.textAlign = "left"; 
  

  // ---- STATUS DO JOGADOR ----
  const playerBarY = 740;

  ctx.fillStyle = "#1f1f2b";
  ctx.font = "bold 38px sans-serif";
  const nomePlayer = state.personagemSelecionado?.toUpperCase() || "PLAYER";
  
  // Aqui está a mágica: Adicionamos o "DANO" ao lado da Defesa!
  ctx.fillText(`${nomePlayer}  |  DEFESA: ${combat.playerDefense || state.stats?.defesa || 0}  |  DANO: ${state.stats?.ataque || 0}`, 550, playerBarY - 20);
  
  desenharBarraVida(ctx, 550, playerBarY, 1000, 40, combat.playerHP, combat.playerMaxHP, "#66b3ff");
  ctx.font = "bold 24px sans-serif";
  ctx.fillStyle = "white";
  ctx.fillText(`HP: ${combat.playerHP}/${combat.playerMaxHP}`, 560, playerBarY + 28);

  // ---- CAIXA DE MENSAGEM ----
  ctx.font = "28px sans-serif";
  ctx.fillStyle = "#1f1f2b";
  // Ajuste: Aumentei o Y de 820 para 860 para descer o texto
  wrapText(ctx, combat.mensagem || "", 150, 860, 350, 36);
}

function desenharBarraVida(ctx, x, y, width, height, current, max, color) {
  if (!max || max <= 0) max = 1; 
  const ratio = Math.max(0, Math.min(1, current / max));
  
  ctx.fillStyle = "#4a4a5a";
  ctx.fillRect(x, y, width, height);

  ctx.fillStyle = color;
  ctx.fillRect(x, y, width * ratio, height);

  ctx.strokeStyle = "#1f1f2b";
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, width, height);
}

// Desenha a malha 2x2 com os ataques (Soco no Topo-Esquerda) e o botão CONTINUAR no centro se a batalha acabar
function desenharBotoesAcao(ctx, state) {
  const combat = state.combat;
  if (!combat) return;

  // Os 4 botões de baixo. O Soco fica inativo (!ativo) se o combate finalizar.
  const botoes = [
    { id: "soco", texto: "SOCO", x: MENU_X, y: MENU_Y, ativo: !combat.finalizado },
    { id: "vazio1", texto: "---", x: MENU_X + BTN_W + BTN_SPACING, y: MENU_Y, ativo: false },
    { id: "vazio2", texto: "---", x: MENU_X, y: MENU_Y + BTN_H + BTN_SPACING, ativo: false },
    { id: "vazio3", texto: "---", x: MENU_X + BTN_W + BTN_SPACING, y: MENU_Y + BTN_H + BTN_SPACING, ativo: false }
  ];

  botoes.forEach(btn => {
    const isHover = btn.ativo &&
      combateMouseXGlobal >= btn.x &&
      combateMouseXGlobal <= btn.x + BTN_W &&
      combateMouseYGlobal >= btn.y &&
      combateMouseYGlobal <= btn.y + BTN_H;

    ctx.fillStyle = !btn.ativo ? "#999" : (isHover ? "#ffcc33" : "#ffbb00");
    ctx.fillRect(btn.x, btn.y, BTN_W, BTN_H);

    ctx.strokeStyle = "#1f1f2b";
    ctx.lineWidth = 4;
    ctx.strokeRect(btn.x, btn.y, BTN_W, BTN_H);

    ctx.fillStyle = "#1f1f2b";
    ctx.font = "bold 32px sans-serif"; 
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(btn.texto, btn.x + BTN_W / 2, btn.y + BTN_H / 2);
  });

  // ---- DESENHA O BOTÃO CONTINUAR NO CENTRO SE A LUTA ACABOU ----
  if (combat.finalizado) {
    const btnCont = BOTAO_CONTINUAR;
    const hoverCont = 
      combateMouseXGlobal >= btnCont.x &&
      combateMouseXGlobal <= btnCont.x + btnCont.width &&
      combateMouseYGlobal >= btnCont.y &&
      combateMouseYGlobal <= btnCont.y + btnCont.height;

    ctx.fillStyle = hoverCont ? "#ffcc33" : "#ffbb00";
    ctx.fillRect(btnCont.x, btnCont.y, btnCont.width, btnCont.height);

    ctx.strokeStyle = "#1f1f2b";
    ctx.lineWidth = 4;
    ctx.strokeRect(btnCont.x, btnCont.y, btnCont.width, btnCont.height);

    ctx.fillStyle = "#1f1f2b";
    ctx.font = "bold 40px sans-serif"; 
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("CONTINUAR", btnCont.x + btnCont.width / 2, btnCont.y + btnCont.height / 2);
  }

  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
}

// Chama a lógica do turno do jogador para executar o ataque.
function executarAtaque(state) {
  if(turnManager) turnManager.handlePlayerAction(state);
}

// Finaliza a batalha e atualiza o estado com vitória ou derrota.
function finalizarCombate(state, venceu) {
  if(turnManager) turnManager.finalizeBattle(state.combat, state, venceu);
}

// Após o combate, decide o próximo passo.
function continuarDepoisDoCombate(state) {
  const combat = state.combat;
  if (!combat || !combat.finalizado) return;

  if (combat.venceu) {
    // Se for Boss, passa de fase e zera o movimento
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
    // Se for um Inimigo Comum, apenas reseta a flag de boss e NÃO ZERA OS PASSOS.
    else {
      state.bossTransition = null;
    }
    
    state.proximaCena = "jogo";
  } else {
    // Se perdeu, zera tudo e volta pro começo do tabuleiro
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
    state.bossTransition = null;
    state.proximaCena = "jogo";
  }
  state.emTransicao = true;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  if (!text) return; 

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
  if (!combat) return;

  // Se o combate acabou, verifica o clique NO BOTÃO DO CENTRO (CONTINUAR)
  if (combat.finalizado) {
    if (
      clickX >= BOTAO_CONTINUAR.x &&
      clickX <= BOTAO_CONTINUAR.x + BOTAO_CONTINUAR.width &&
      clickY >= BOTAO_CONTINUAR.y &&
      clickY <= BOTAO_CONTINUAR.y + BOTAO_CONTINUAR.height
    ) {
      continuarDepoisDoCombate(combateStateGlobal);
    }
  } 
  // Se o combate ainda está acontecendo, verifica o clique NO BOTÃO DE SOCO
  else {
    if (
      clickX >= BOTAO_SOCO.x &&
      clickX <= BOTAO_SOCO.x + BOTAO_SOCO.width &&
      clickY >= BOTAO_SOCO.y &&
      clickY <= BOTAO_SOCO.y + BOTAO_SOCO.height
    ) {
      executarAtaque(combateStateGlobal);
    }
  }
});