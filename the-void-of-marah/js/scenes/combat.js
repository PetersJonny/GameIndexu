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

  desenharCenarioCombate(ctx, state, assets);
  desenharHUDCombate(ctx, state, assets);
  desenharBotoesAcao(ctx, state);
}

// Cria o estado inicial da batalha a partir do estado global do jogo.
function iniciarCombate(state) {
  state.combat = turnManager.createCombatState(state);
}

// Desenha o plano de fundo do combate e os "quadrados grandes" dos personagens.
function desenharCenarioCombate(ctx, state, assets) {
  ctx.fillStyle = "#a4c3f2";
  ctx.fillRect(0, 0, 1920, 1080);

  ctx.fillStyle = "#e0e6f4";
  ctx.fillRect(50, 50, 1820, 980);

  // Mapeamento de imagens dos inimigos
  const IMAGEM_INIMIGOS = {
    "Slime": assets.slime,
    "Shadow Lord": assets.bossShadowLord,
  };

  ctx.fillStyle = "#1f1f2b";
  // Quadrado do Inimigo (Topo Direita)
  ctx.fillRect(1400, 80, 350, 350);

  // Desenha a imagem do monstro se existir
  if (state.combat && state.combat.enemyName) {
    const img = IMAGEM_INIMIGOS[state.combat.enemyName];
    if (img && img.complete) {
      ctx.drawImage(img, 1425, 105, 300, 300);
    }
  }

  // Quadrado do Jogador (Meio Esquerda)
  ctx.fillRect(150, 450, 350, 350);
}

// Desenha o HUD de combate com nome, defesa, barras de vida e mensagem.
function desenharHUDCombate(ctx, state, assets) {
  const combat = state.combat;
  if (!combat) return;

  ctx.imageSmoothingEnabled = false;

  // ---- STATUS DO INIMIGO ----
  const enemyBarY = 100;
  desenharBarraVida(
    ctx,
    350,
    enemyBarY,
    1000,
    40,
    combat.enemyHP,
    combat.enemyMaxHP,
    "#ff4c4c",
  );

  if (assets.iconVida && assets.iconVida.complete) {
    ctx.drawImage(assets.iconVida, 360, enemyBarY + 4, 32, 32);
  }
  ctx.font = "bold 24px sans-serif";
  ctx.fillStyle = "white";
  ctx.fillText(
    `HP: ${combat.enemyHP}/${combat.enemyMaxHP}`,
    400,
    enemyBarY + 28,
  );

  ctx.fillStyle = "#1f1f2b";
  ctx.font = "bold 38px sans-serif";
  ctx.textAlign = "right";

  const textoDefesaInimigo = `DEFESA: ${combat.enemyDefense || 0}`;
  ctx.fillText(textoDefesaInimigo, 1350, enemyBarY + 80);

  const larguraDefesaInimigo = ctx.measureText(textoDefesaInimigo).width;

  if (assets.iconDefesa && assets.iconDefesa.complete) {
    ctx.drawImage(
      assets.iconDefesa,
      1350 - larguraDefesaInimigo - 45,
      enemyBarY + 50,
      32,
      32,
    );
  }

  ctx.fillText(
    combat.enemyName || "Inimigo",
    1350 - larguraDefesaInimigo - 65,
    enemyBarY + 80,
  );

  ctx.textAlign = "left";

  // ---- STATUS DO JOGADOR ----
  const playerBarY = 740;
  const textoY = playerBarY - 20;
  const iconeY = playerBarY - 48;

  ctx.fillStyle = "#1f1f2b";
  ctx.font = "bold 38px sans-serif";
  const nomePlayer = state.personagemSelecionado?.toUpperCase() || "PLAYER";

  ctx.fillText(nomePlayer, 550, textoY);

  if (assets.iconDefesa && assets.iconDefesa.complete) {
    ctx.drawImage(assets.iconDefesa, 730, iconeY, 32, 32);
  }
  ctx.fillText(
    `DEFESA: ${combat.playerDefense || state.stats?.defesa || 0}`,
    770,
    textoY,
  );

  if (assets.iconDano && assets.iconDano.complete) {
    ctx.drawImage(assets.iconDano, 1000, iconeY, 32, 32);
  }
  ctx.fillText(`DANO: ${state.stats?.ataque || 0}`, 1040, textoY);

  desenharBarraVida(
    ctx,
    550,
    playerBarY,
    1000,
    40,
    combat.playerHP,
    combat.playerMaxHP,
    "#66b3ff",
  );

  if (assets.iconVida && assets.iconVida.complete) {
    ctx.drawImage(assets.iconVida, 560, playerBarY + 4, 32, 32);
  }
  ctx.font = "bold 24px sans-serif";
  ctx.fillStyle = "white";
  ctx.fillText(
    `HP: ${combat.playerHP}/${combat.playerMaxHP}`,
    600,
    playerBarY + 28,
  );

  ctx.font = "28px sans-serif";
  ctx.fillStyle = "#1f1f2b";
  wrapText(ctx, combat.mensagem || "", 150, 860, 350, 36);

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
    ctx.font = "bold 28px sans-serif";
    ctx.fillText("Item recebido", itemCardX + 30, itemCardY + 40);
    ctx.font = "bold 24px sans-serif";
    ctx.fillText(item.nome || "Item exemplo", itemCardX + 30, itemCardY + 82);
    ctx.font = "18px sans-serif";
    ctx.fillText(
      item.descricao || "Espaço para trocar depois.",
      itemCardX + 30,
      itemCardY + 118,
      itemCardW - 70,
    );
    ctx.fillStyle = "#f4f4f7";
    ctx.fillRect(itemCardX + 330, itemCardY + 30, 130, 100);
    ctx.strokeRect(itemCardX + 330, itemCardY + 30, 130, 100);
    ctx.fillStyle = "#1f1f2b";
    ctx.textAlign = "center";
    ctx.fillText("PNG", itemCardX + 395, itemCardY + 72);
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

function desenharBotoesAcao(ctx, state) {
  const combat = state.combat;
  if (!combat) return;
  if (!state.ataques) state.ataques = ["soco"];
  const posicoesGrid = [
    { x: MENU_X, y: MENU_Y },
    { x: MENU_X + BTN_W + BTN_SPACING, y: MENU_Y },
    { x: MENU_X, y: MENU_Y + BTN_H + BTN_SPACING },
    { x: MENU_X + BTN_W + BTN_SPACING, y: MENU_Y + BTN_H + BTN_SPACING },
  ];
  const botoes = [];
  for (let i = 0; i < 4; i++) {
    if (i < state.ataques.length) {
      const atk = ATAQUES_JOGO[state.ataques[i]];
      botoes.push({
        id: atk.id,
        texto: atk.nome,
        subtexto: `DANO: ${atk.dano}`,
        x: posicoesGrid[i].x,
        y: posicoesGrid[i].y,
        ativo: !combat.finalizado,
      });
    } else {
      botoes.push({
        id: `vazio${i}`,
        texto: "---",
        subtexto: null,
        x: posicoesGrid[i].x,
        y: posicoesGrid[i].y,
        ativo: false,
      });
    }
  }
  botoes.forEach((btn) => {
    const isHover =
      btn.ativo &&
      combateMouseXGlobal >= btn.x &&
      combateMouseXGlobal <= btn.x + BTN_W &&
      combateMouseYGlobal >= btn.y &&
      combateMouseYGlobal <= btn.y + BTN_H;
    ctx.fillStyle = !btn.ativo ? "#999" : isHover ? "#ffcc33" : "#ffbb00";
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
    ctx.fillText(
      "CONTINUAR",
      btnCont.x + btnCont.width / 2,
      btnCont.y + btnCont.height / 2,
    );
  }
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
}

function executarAtaque(state, ataqueEscolhido) {
  if (turnManager) turnManager.handlePlayerAction(state, ataqueEscolhido);
}

function finalizarCombate(state, venceu) {
  if (turnManager) turnManager.finalizeBattle(state.combat, state, venceu);
}

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
    } else {
      state.bossTransition = null;
    }
    state.proximaCena = "jogo";
  } else {
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
  if (
    !combateStateGlobal ||
    combateStateGlobal.cena !== "combat" ||
    event.button !== 0
  )
    return;
  const canvas = document.getElementById("gameCanvas");
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const clickX = (event.clientX - rect.left) * (1920 / rect.width);
  const clickY = (event.clientY - rect.top) * (1080 / rect.height);
  const combat = combateStateGlobal.combat;
  if (!combat) return;
  if (combat.finalizado) {
    if (
      clickX >= BOTAO_CONTINUAR.x &&
      clickX <= BOTAO_CONTINUAR.x + BOTAO_CONTINUAR.width &&
      clickY >= BOTAO_CONTINUAR.y &&
      clickY <= BOTAO_CONTINUAR.y + BOTAO_CONTINUAR.height
    ) {
      continuarDepoisDoCombate(combateStateGlobal);
    }
  } else {
    if (!combateStateGlobal.ataques) combateStateGlobal.ataques = ["soco"];
    const posicoesGrid = [
      { x: MENU_X, y: MENU_Y },
      { x: MENU_X + BTN_W + BTN_SPACING, y: MENU_Y },
      { x: MENU_X, y: MENU_Y + BTN_H + BTN_SPACING },
      { x: MENU_X + BTN_W + BTN_SPACING, y: MENU_Y + BTN_H + BTN_SPACING },
    ];
    for (let i = 0; i < combateStateGlobal.ataques.length; i++) {
      let pos = posicoesGrid[i];
      if (
        clickX >= pos.x &&
        clickX <= pos.x + BTN_W &&
        clickY >= pos.y &&
        clickY <= pos.y + BTN_H
      ) {
        const ataqueEscolhido = ATAQUES_JOGO[combateStateGlobal.ataques[i]];
        executarAtaque(combateStateGlobal, ataqueEscolhido);
        break;
      }
    }
  }
});
