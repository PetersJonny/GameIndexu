// Constantes de layout para o Menu de Ações (Grid 2x2)
const BTN_W = 380; 
const BTN_H = 100; 
const BTN_SPACING = 20;

// Botões na DIREITA (Embaixo da barra de vida do jogador)
const MENU_X = 970; 
const MENU_Y = 720; 

// Novo botão CONTINUAR que aparecerá no centro da tela
const BOTAO_CONTINUAR = {
  x: 760, 
  y: 490, 
  width: 400,
  height: 100,
};

let combateStateGlobal = null;
let combateMouseXGlobal = 0;
let combateMouseYGlobal = 0;

// Renderiza a cena de combate, inicializa a batalha se necessário e draws HUD + botões.
function renderCombat(ctx, assets, state, mouseX, mouseY) {
  combateStateGlobal = state;
  combateMouseXGlobal = mouseX;
  combateMouseYGlobal = mouseY;

  if (!state.combat) {
    iniciarCombate(state);
  }

  desenharCenarioCombate(ctx, assets, state);
  desenharJogador(ctx, assets, state);
  desenharHUDCombate(ctx, assets, state); // <--- CORRIGIDO: Passando assets aqui
  desenharBotoesAcao(ctx, state); 
  desenharInimigos(ctx, assets, state);   // <--- CORRIGIDO: Passando assets aqui
}

function desenharInimigos(ctx, assets, state) { // <--- CORRIGIDO: Recebendo assets
  const combat = state.combat;
  if (!combat) return;

  // Diminuímos o X para 1350 para puxar ele mais para a esquerda
  const enemyX = 1350; 
  const enemyY = 20;   
  const enemyW = 350;
  const enemyH = 350;

  let imgInimigo = null;

  switch (combat.enemyName) {
    case "Slime": imgInimigo = assets.slime; break;
    case "Goblin": imgInimigo = assets.goblin; break;
    case "Orc": imgInimigo = assets.orc; break;
    case "Wraith": imgInimigo = assets.wraith; break;
    case "Flame Bat": imgInimigo = assets.flameBat; break;
    case "Spectral Knight": imgInimigo = assets.spectralKnight; break;
    case "Viper Mage": imgInimigo = assets.viperMage; break;
    case "Golem": imgInimigo = assets.golem; break;
    case "Crystal Serpent": imgInimigo = assets.crystalSerpent; break;
    case "Void Stalker": imgInimigo = assets.voidStalker; break;
    case "Shadow Lord": imgInimigo = assets.bossShadowLord; break;
    case "Eclipse Queen": imgInimigo = assets.eclipseQueen; break;
    case "Marah": imgInimigo = assets.reiEspiral; break;
    default: imgInimigo = null;
  }

  if (imgInimigo && imgInimigo.complete && imgInimigo.src !== window.location.href) {
    ctx.drawImage(imgInimigo, enemyX, enemyY, enemyW, enemyH);
  } else {
    ctx.fillStyle = "#57606f";
    ctx.fillRect(enemyX, enemyY, enemyW, enemyH);
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px Consolas, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Sem Sprite", enemyX + enemyW / 2, enemyY + enemyH / 2);
    
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }
}

function iniciarCombate(state) {
  if (typeof turnManager !== 'undefined') {
    state.combat = turnManager.createCombatState(state);
  } else {
    state.combat = {
      enemyName: state.combatHouseType === "boss" ? "Shadow Lord" : "Slime",
      enemyHP: 30, enemyMaxHP: 30, enemyDefense: 2,
      playerHP: state.stats.vida, playerMaxHP: state.stats.vidaMax, playerDefense: state.stats.defesa,
      mensagem: "A batalha começou! Escolha seu ataque.", finalizado: false, venceu: false
    };
  }
  
  if (!state.ataques || state.ataques.length === 0) {
    state.ataques = ["soco"];
  }
}

function desenharBotoesAcao(ctx, state) {
  const combat = state.combat;
  if (!combat) return;

  if (!state.ataques || state.ataques.length === 0) {
    state.ataques = ["soco"];
  }

  const posicoesGrid = [
    { x: MENU_X, y: MENU_Y },
    { x: MENU_X + BTN_W + BTN_SPACING, y: MENU_Y },
    { x: MENU_X, y: MENU_Y + BTN_H + BTN_SPACING },
    { x: MENU_X + BTN_W + BTN_SPACING, y: MENU_Y + BTN_H + BTN_SPACING }
  ];

  const botoes = [];

  for (let i = 0; i < 4; i++) {
    if (i < state.ataques.length) {
      const nomeChaveAtk = state.ataques[i];
      const atk = (typeof ATAQUES_JOGO !== 'undefined' && ATAQUES_JOGO[nomeChaveAtk]) 
                  ? ATAQUES_JOGO[nomeChaveAtk] 
                  : { id: nomeChaveAtk, nome: nomeChaveAtk.toUpperCase(), dano: state.stats?.ataque || 10 };

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

function desenharCenarioCombate(ctx, state) {
  ctx.fillStyle = "#a4c3f2";
  ctx.fillRect(0, 0, 1920, 1080);

  ctx.fillStyle = "#e0e6f4";
  ctx.fillRect(50, 50, 1820, 980);

  // Quadrado base/chão para o Jogador ficar em cima
  ctx.fillStyle = "#c8d6e5"; 
  ctx.fillRect(450, 400, 350, 350);
}

function desenharJogador(ctx, assets, state) {
  // Posição e tamanho sincronizados com a área designada ao jogador (X: 450, Y: 400)
  const playerX = 450;
  const playerY = 400;
  const playerW = 350;
  const playerH = 350;

  let imgJogador = null;

  // Verifica qual string de id foi salva no state.personagemSelecionado (ex: "maya" ou "zeck")
  // e mapeia para os assets de Chibi carregados no main.js (card3 e card4)
  const idPersonagem = state.personagemSelecionado?.toLowerCase();

  if (idPersonagem === "maya") {
    imgJogador = assets.card3; // MayaChibiTab.png
  } else if (idPersonagem === "zeck") {
    imgJogador = assets.card4; // ZeckChibiTab.png
  }

  if (imgJogador && imgJogador.complete && imgJogador.src !== window.location.href) {
    
    // Mantém a proporção matemática com a nova altura gigante
    playerW = imgJogador.width * (playerH / imgJogador.height);
    
    // Trava o centro do personagem no mesmo eixo X de antes (pixel 625)
    playerX = 625 - (playerW / 2);

    // Liga a suavização de alta qualidade
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    
    ctx.drawImage(imgJogador, playerX, playerY, playerW, playerH);
    
    ctx.restore();

  } else {
    // Fallback visual caso o asset não esteja pronto ou não combine com as strings acima
    ctx.fillStyle = "#341f97";
    ctx.fillRect(playerX + 50, playerY + 50, playerW - 100, playerH - 100);
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px Consolas, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Carregando Herói...", playerX + playerW / 2, playerY + playerH / 2);
    
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }
}

function desenharHUDCombate(ctx, assets, state) { // <--- CORRIGIDO: Recebendo assets
  const combat = state.combat;
  if (!combat) return;

  ctx.imageSmoothingEnabled = false;

  // STATUS DO INIMIGO
  const enemyBarW = 780;
  const enemyStartX = 1200 - enemyBarW; 
  const enemyTextoY = 105;
  const enemyBarY = 120; 

  ctx.fillStyle = "#1f1f2b";
  ctx.font = "bold 38px Consolas, monospace";

  ctx.textAlign = "left"; 
  ctx.fillText(combat.enemyName || "Inimigo", enemyStartX, enemyTextoY);

  ctx.textAlign = "right";
  const textoDefesaInimigo = `DEFESA: ${combat.enemyDefense || 0}`;
  ctx.fillText(textoDefesaInimigo, enemyStartX + enemyBarW, enemyTextoY);
  
  const wEnemyDef = ctx.measureText(textoDefesaInimigo).width;
  if (assets && assets.iconDefesa && assets.iconDefesa.complete) {
    ctx.drawImage(assets.iconDefesa, enemyStartX + enemyBarW - wEnemyDef - 45, enemyTextoY - 32, 32, 32);
  }
  
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fillText("|", enemyStartX + (enemyBarW / 2), enemyTextoY);

  ctx.textAlign = "left"; 
  desenharBarraVida(ctx, enemyStartX, enemyBarY, enemyBarW, 40, combat.enemyHP, combat.enemyMaxHP, "#ff4c4c");
  
  if (assets && assets.iconVida && assets.iconVida.complete) {
    ctx.drawImage(assets.iconVida, enemyStartX + 10, enemyBarY + 4, 32, 32);
  }
  ctx.font = "bold 24px Consolas, monospace";
  ctx.fillStyle = "white";
  ctx.fillText(`HP: ${combat.enemyHP}/${combat.enemyMaxHP}`, enemyStartX + 50, enemyBarY + 28);

  // STATUS DO JOGADOR
  const playerStartX = MENU_X; 
  const playerBarW = 780; 
  const playerTextoY = 645; 
  const playerBarY = 660; 

  ctx.fillStyle = "#1f1f2b";
  ctx.font = "bold 38px Consolas, monospace";
  
  const nomePlayer = state.personagemSelecionado?.toUpperCase() || "PLAYER";
  const strDefesa = `DEFESA: ${combat.playerDefense || state.stats?.defesa || 0}`;
  const strDano = `DANO: ${state.stats?.ataque || 0}`;
  
  ctx.textAlign = "left";
  ctx.fillText(nomePlayer, playerStartX, playerTextoY);

  ctx.textAlign = "right";
  ctx.fillText(strDano, playerStartX + playerBarW, playerTextoY);
  const wDano = ctx.measureText(strDano).width;
  if (assets && assets.iconDano && assets.iconDano.complete) {
    ctx.drawImage(assets.iconDano, playerStartX + playerBarW - wDano - 45, playerTextoY - 32, 32, 32);
  }

  ctx.textAlign = "center";
  const centerPlayerX = playerStartX + (playerBarW / 2);
  ctx.fillText(strDefesa, centerPlayerX, playerTextoY);
  const wDefPlayer = ctx.measureText(strDefesa).width;
  if (assets && assets.iconDefesa && assets.iconDefesa.complete) {
    ctx.drawImage(assets.iconDefesa, centerPlayerX - (wDefPlayer / 2) - 45, playerTextoY - 32, 32, 32);
  }

  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fillText("|", playerStartX + (playerBarW * 0.28), playerTextoY);
  ctx.fillText("|", playerStartX + (playerBarW * 0.72), playerTextoY);

  ctx.textAlign = "left"; 
  desenharBarraVida(ctx, playerStartX, playerBarY, playerBarW, 40, combat.playerHP, combat.playerMaxHP, "#66b3ff");
  
  if (assets && assets.iconVida && assets.iconVida.complete) {
    ctx.drawImage(assets.iconVida, playerStartX + 10, playerBarY + 4, 32, 32);
  }
  ctx.font = "bold 24px Consolas, monospace";
  ctx.fillStyle = "white";
  ctx.fillText(`HP: ${combat.playerHP}/${combat.playerMaxHP}`, playerStartX + 50, playerBarY + 28);

  // LOG DE BATALHA
  ctx.font = "28px Consolas, monospace";
  ctx.fillStyle = "#1f1f2b";
  wrapText(ctx, combat.mensagem || "", 150, 800, 750, 36);

  // ITEM RECEBIDO
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
    // Usando o wrapText e limitando a largura (maxWidth) para 280 pixels,
    // assim o texto quebra de linha antes de encostar na caixa da imagem (X + 330)
    wrapText(ctx, item.descricao || "Espaço para trocar depois.", itemCardX + 30, itemCardY + 118, 280, 22);

    ctx.fillStyle = "#f4f4f7";
    ctx.fillRect(itemCardX + 330, itemCardY + 30, 130, 100);
    ctx.strokeStyle = "#1f1f2b";
    ctx.strokeRect(itemCardX + 330, itemCardY + 30, 130, 100);

    // Tenta buscar a imagem do item usando a propriedade imgId definida no array GACHA_ITENS
    const imgItem = assets[item.imgId];
    
    // Se a imagem existir e já estiver carregada, desenha na tela
    if (imgItem && imgItem.complete && imgItem.src !== window.location.href) {
        // Desenha a imagem ocupando o espaço da caixa cinza (130x100)
        // Se a pixel art ficar esticada, você pode ajustar as dimensões aqui.
        ctx.drawImage(imgItem, itemCardX + 330, itemCardY + 30, 130, 100);
    } else {
        // Fallback caso a imagem não carregue
        ctx.fillStyle = "#1f1f2b";
        ctx.font = "bold 20px Consolas, monospace";
        ctx.textAlign = "center";
        ctx.fillText("Sem", itemCardX + 395, itemCardY + 72);
        ctx.fillText("Img", itemCardX + 395, itemCardY + 102);
    }
    
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

function executarAtaque(state, ataqueEscolhido) {
  if (typeof turnManager !== 'undefined') {
    turnManager.handlePlayerAction(state, ataqueEscolhido);
  } else {
    const combat = state.combat;
    const danoReal = Math.max(1, ataqueEscolhido.dano - combat.enemyDefense);
    combat.enemyHP = Math.max(0, combat.enemyHP - danoReal);
    combat.mensagem = `Você usou ${ataqueEscolhido.nome} e causou ${danoReal} de dano!`;
    
    if (combat.enemyHP <= 0) {
      combat.finalizado = true;
      combat.venceu = true;
      combat.mensagem = "Vitória! O inimigo caiu.";
    }
  }
}

function finalizarCombate(state, venceu) {
  if (typeof turnManager !== 'undefined' && turnManager.finalizeBattle) {
    turnManager.finalizeBattle(state.combat, state, venceu);
  }
}

function continuarDepoisDoCombate(state) {
  const combat = state.combat;
  if (!combat || !combat.finalizado) return;

  if (typeof controleMovimento !== 'undefined') {
    controleMovimento.esperandoEscolha = false;
    controleMovimento.animandoPulo = false;
    controleMovimento.puloProgresso = 0;
    
    if (combat.venceu && !state.bossTransition && controleMovimento.passosRestantes > 0) {
      controleMovimento.dadoAtivo = false;
    } else {
      controleMovimento.passosRestantes = 0;
      controleMovimento.dadoAtivo = false;
    }
  }

  if (combat.venceu) {
    if (state.bossTransition === "paraFase2") {
      state.fase = 2;
      state.casaAtual = 0;
      state.opcoesDeCaminho = [];
      state.bossTransition = null;
    } else if (state.bossTransition === "paraFase3") {
      state.fase = 3;
      state.casaAtual = 0;
      state.opcoesDeCaminho = [];
      state.bossTransition = null;
    } else if (state.bossTransition === "reiniciar") {
      state.casaAtual = 0;
      state.fase = 1;
      state.opcoesDeCaminho = [];
      state.bossTransition = null;
    }
  } else {
    state.stats.vida = state.stats.vidaMax;
    state.casaAtual = 0;
    state.opcoesDeCaminho = [];
    state.bossTransition = null;
    if (typeof controleMovimento !== 'undefined') {
      controleMovimento.passosRestantes = 0;
    }
  }

  state.combat = null; 
  state.proximaCena = "jogo";
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

// Interação externa de cliques gerenciada via main.js
function processarCliqueCombate(state, clickX, clickY) {
  const combat = state.combat;
  if (!combat) return;

  if (combat.finalizado) {
    if (
      clickX >= BOTAO_CONTINUAR.x &&
      clickX <= BOTAO_CONTINUAR.x + BOTAO_CONTINUAR.width &&
      clickY >= BOTAO_CONTINUAR.y &&
      clickY <= BOTAO_CONTINUAR.y + BOTAO_CONTINUAR.height
    ) {
      continuarDepoisDoCombate(state);
    }
  } else {
    if (!state.ataques || state.ataques.length === 0) {
      state.ataques = ["soco"];
    }
    
    const posicoesGrid = [
      { x: MENU_X, y: MENU_Y },
      { x: MENU_X + BTN_W + BTN_SPACING, y: MENU_Y },
      { x: MENU_X, y: MENU_Y + BTN_H + BTN_SPACING },
      { x: MENU_X + BTN_W + BTN_SPACING, y: MENU_Y + BTN_H + BTN_SPACING }
    ];

    for (let i = 0; i < state.ataques.length; i++) {
      let pos = posicoesGrid[i];
      if (
        clickX >= pos.x &&
        clickX <= pos.x + BTN_W &&
        clickY >= pos.y &&
        clickY <= pos.y + BTN_H
      ) {
        const nomeChave = state.ataques[i];
        
        let ataqueEscolhido;
        if (typeof ATAQUES_JOGO !== 'undefined' && ATAQUES_JOGO[nomeChave]) {
          ataqueEscolhido = ATAQUES_JOGO[nomeChave];
        } else {
          ataqueEscolhido = { id: nomeChave, nome: nomeChave.toUpperCase(), dano: state.stats?.ataque || 10 };
        }

        executarAtaque(state, ataqueEscolhido);
        break;
      }
    }
  }
}