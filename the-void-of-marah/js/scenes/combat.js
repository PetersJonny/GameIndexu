// Constantes de layout para o Menu de Ações (Grid 2x2)
const BTN_W = 380; 
const BTN_H = 100; 
const BTN_SPACING = 20;

// Botões na DIREITA (Embaixo da barra de vida do jogador)
// 970 centraliza perfeitamente com a borda direita da caixa do inimigo
const MENU_X = 970; 
const MENU_Y = 720; 

// O primeiro quadrado da esquerda em cima (Botão Soco)
const BOTAO_SOCO = {
  x: MENU_X,
  y: MENU_Y,
  width: BTN_W,
  height: BTN_H,
};

// Novo botão CONTINUAR que aparecerá no centro da tela
const BOTAO_CONTINUAR = {
  x: 760, // Centralizado no eixo X
  y: 490, // Centralizado no eixo Y
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
  // Quadrado do Inimigo
  ctx.fillRect(1250, 80, 350, 350);
  
  // Quadrado do Jogador (Movido bem mais para a direita, seguindo a sua seta vermelha!)
  ctx.fillRect(450, 400, 350, 350);
}

// Desenha o HUD de combate com nome, defesa, barras de vida e mensagem.
function desenharHUDCombate(ctx, state) {
  const combat = state.combat;
  if (!combat) return;

  ctx.imageSmoothingEnabled = false;

  // ==========================================
  // ---- STATUS DO INIMIGO (ESQUERDA DA CAIXA)
  // ==========================================
  const enemyBarW = 780;
  // Agora a barra termina cravada no 1200, que é a nova posição da caixa do inimigo
  const enemyStartX = 1200 - enemyBarW; 
  const enemyTextoY = 105;
  const enemyBarY = 120; 

  ctx.fillStyle = "#1f1f2b";
  ctx.font = "bold 38px Consolas, monospace";

  // Nome do Inimigo (Ancorado na Esquerda)
  ctx.textAlign = "left"; 
  const textoNomeInimigo = combat.enemyName || "Inimigo";
  ctx.fillText(textoNomeInimigo, enemyStartX, enemyTextoY);

  // Defesa do Inimigo (Ancorado na Direita)
  ctx.textAlign = "right";
  const textoDefesaInimigo = `DEFESA: ${combat.enemyDefense || 0}`;
  ctx.fillText(textoDefesaInimigo, enemyStartX + enemyBarW, enemyTextoY);
  
  // Ícone Defesa Inimigo
  const wDefEnemy = ctx.measureText(textoDefesaInimigo).width;
  if (assets.iconDefesa && assets.iconDefesa.complete) {
    ctx.drawImage(assets.iconDefesa, enemyStartX + enemyBarW - wDefEnemy - 45, enemyTextoY - 32, 32, 32);
  }
  
  // Separador Central (Inimigo)
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fillText("|", enemyStartX + (enemyBarW / 2), enemyTextoY);

  // Barra de Vida do Inimigo
  ctx.textAlign = "left"; // Restaura o alinhamento
  desenharBarraVida(ctx, enemyStartX, enemyBarY, enemyBarW, 40, combat.enemyHP, combat.enemyMaxHP, "#ff4c4c");
  
  if (assets.iconVida && assets.iconVida.complete) {
    ctx.drawImage(assets.iconVida, enemyStartX + 10, enemyBarY + 4, 32, 32);
  }
  ctx.font = "bold 24px Consolas, monospace";
  ctx.fillStyle = "white";
  ctx.fillText(`HP: ${combat.enemyHP}/${combat.enemyMaxHP}`, enemyStartX + 50, enemyBarY + 28);


  // ==========================================
  // ---- STATUS DO JOGADOR (DIREITA) ---------
  // ==========================================
  const playerStartX = MENU_X; // 970 (Sincronizado com os botões)
  const playerBarW = 780; // Largura exata de 2 botões + espaçamento
  const playerTextoY = 645; 
  const playerBarY = 660; 

  ctx.fillStyle = "#1f1f2b";
  ctx.font = "bold 38px Consolas, monospace";
  
  const nomePlayer = state.personagemSelecionado?.toUpperCase() || "PLAYER";
  const strDefesa = `DEFESA: ${combat.playerDefense || state.stats?.defesa || 0}`;
  const strDano = `DANO: ${state.stats?.ataque || 0}`;
  
  // 1. Nome do Jogador (Ancorado na Esquerda da Barra)
  ctx.textAlign = "left";
  ctx.fillText(nomePlayer, playerStartX, playerTextoY);

  // 2. Dano do Jogador (Ancorado na Direita da Barra)
  ctx.textAlign = "right";
  ctx.fillText(strDano, playerStartX + playerBarW, playerTextoY);
  const wDano = ctx.measureText(strDano).width;
  if (assets.iconDano && assets.iconDano.complete) {
    ctx.drawImage(assets.iconDano, playerStartX + playerBarW - wDano - 45, playerTextoY - 32, 32, 32);
  }

  // 3. Defesa do Jogador (Ancorado no Centro da Barra)
  ctx.textAlign = "center";
  const centerPlayerX = playerStartX + (playerBarW / 2);
  ctx.fillText(strDefesa, centerPlayerX, playerTextoY);
  const wDefPlayer = ctx.measureText(strDefesa).width;
  if (assets.iconDefesa && assets.iconDefesa.complete) {
    ctx.drawImage(assets.iconDefesa, centerPlayerX - (wDefPlayer / 2) - 45, playerTextoY - 32, 32, 32);
  }

  // 4. Separadores de estilo
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fillText("|", playerStartX + (playerBarW * 0.28), playerTextoY);
  ctx.fillText("|", playerStartX + (playerBarW * 0.72), playerTextoY);

  // 5. Barra de Vida do Jogador
  ctx.textAlign = "left"; // Restaura
  desenharBarraVida(ctx, playerStartX, playerBarY, playerBarW, 40, combat.playerHP, combat.playerMaxHP, "#66b3ff");
  
  if (assets.iconVida && assets.iconVida.complete) {
    ctx.drawImage(assets.iconVida, playerStartX + 10, playerBarY + 4, 32, 32);
  }
  ctx.font = "bold 24px Consolas, monospace";
  ctx.fillStyle = "white";
  ctx.fillText(`HP: ${combat.playerHP}/${combat.playerMaxHP}`, playerStartX + 50, playerBarY + 28);


  // ==========================================
  // ---- LOG DE BATALHA (EMBAIXO DO JOGADOR) -
  // ==========================================
  ctx.font = "28px Consolas, monospace";
  ctx.fillStyle = "#1f1f2b";
  // O texto fica na esquerda (150), exatamente embaixo do quadrado do personagem
  wrapText(ctx, combat.mensagem || "", 150, 800, 750, 36);


  // ---- ITEM RECEBIDO AO VENCER O COMBATE ----
  if (combat.finalizado && combat.venceu && combat.itemRecebido) {
    const item = combat.itemRecebido;

    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
    ctx.strokeStyle = "#ff7a59";
    ctx.lineWidth = 4;

    const itemCardX = 710;
    const itemCardY = 220;
    const itemCardW = 500;
    const itemCardH = 170;

    ctx.fillRect(itemCardX, itemCardY, itemCardW, itemCardH);
    ctx.strokeRect(itemCardX, itemCardY, itemCardW, itemCardH);

    ctx.fillStyle = "#1f1f2b";
    ctx.font = "bold 28px Consolas, monospace"; 
    ctx.fillText("Item recebido", itemCardX + 30, itemCardY + 40);

    ctx.font = "bold 24px Consolas, monospace";
    ctx.fillText(item.nome || "Item exemplo", itemCardX + 30, itemCardY + 82);

    ctx.font = "18px Consolas, monospace";
    ctx.fillText(item.descricao || "Espaço para trocar depois.", itemCardX + 30, itemCardY + 118, itemCardW - 70);

    ctx.fillStyle = "#f4f4f7";
    ctx.fillRect(itemCardX + 330, itemCardY + 30, 130, 100);
    ctx.strokeStyle = "#1f1f2b";
    ctx.strokeRect(itemCardX + 330, itemCardY + 30, 130, 100);

    ctx.fillStyle = "#1f1f2b";
    ctx.font = "bold 20px Consolas, monospace";
    ctx.textAlign = "center";
    ctx.fillText("PNG", itemCardX + 395, itemCardY + 72);
    ctx.fillText("aqui", itemCardX + 395, itemCardY + 102);
    ctx.restore();

    ctx.textAlign = "left";
  }
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

  // Garante que o player tenha uma lista de ataques (padrão é só o soco)
  if (!state.ataques) state.ataques = ["soco"];

  // Mapeamos as posições físicas do Grid 2x2 na tela
  const posicoesGrid = [
    { x: MENU_X, y: MENU_Y },
    { x: MENU_X + BTN_W + BTN_SPACING, y: MENU_Y },
    { x: MENU_X, y: MENU_Y + BTN_H + BTN_SPACING },
    { x: MENU_X + BTN_W + BTN_SPACING, y: MENU_Y + BTN_H + BTN_SPACING }
  ];

  const botoes = [];

  // Criamos os 4 botões na hora, lendo o que o jogador tem guardado no state.ataques
  for (let i = 0; i < 4; i++) {
    if (i < state.ataques.length) {
      const atk = ATAQUES_JOGO[state.ataques[i]];
      botoes.push({
        id: atk.id,
        texto: atk.nome,
        subtexto: `DANO: ${atk.dano}`,
        x: posicoesGrid[i].x,
        y: posicoesGrid[i].y,
        ativo: !combat.finalizado
      });
    } else {
      botoes.push({
        id: `vazio${i}`,
        texto: "---",
        subtexto: null,
        x: posicoesGrid[i].x,
        y: posicoesGrid[i].y,
        ativo: false
      });
    }
  }

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
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (btn.subtexto) {
      ctx.font = "bold 32px sans-serif"; 
      ctx.fillText(btn.texto, btn.x + BTN_W / 2, btn.y + BTN_H / 2 - 12);
      
      ctx.font = "bold 20px sans-serif"; 
      ctx.fillText(btn.subtexto, btn.x + BTN_W / 2, btn.y + BTN_H / 2 + 18);
    } else {
      ctx.font = "bold 32px sans-serif"; 
      ctx.fillText(btn.texto, btn.x + BTN_W / 2, btn.y + BTN_H / 2);
    }
  });

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
function executarAtaque(state, ataqueEscolhido) {
  if(turnManager) turnManager.handlePlayerAction(state, ataqueEscolhido);
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
    if (!combateStateGlobal.ataques) combateStateGlobal.ataques = ["soco"];
    
    // Mesmas posições do grid
    const posicoesGrid = [
      { x: MENU_X, y: MENU_Y },
      { x: MENU_X + BTN_W + BTN_SPACING, y: MENU_Y },
      { x: MENU_X, y: MENU_Y + BTN_H + BTN_SPACING },
      { x: MENU_X + BTN_W + BTN_SPACING, y: MENU_Y + BTN_H + BTN_SPACING }
    ];

    // Checa a colisão apenas nos blocos que contêm ataques
    for (let i = 0; i < combateStateGlobal.ataques.length; i++) {
      let pos = posicoesGrid[i];
      if (
        clickX >= pos.x &&
        clickX <= pos.x + BTN_W &&
        clickY >= pos.y &&
        clickY <= pos.y + BTN_H
      ) {
        // Encontrou! Puxa o ataque do dicionário e manda executar
        const ataqueEscolhido = ATAQUES_JOGO[combateStateGlobal.ataques[i]];
        executarAtaque(combateStateGlobal, ataqueEscolhido);
        break;
      }
    }
  }
});