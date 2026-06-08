// Constantes de tamanho para o tabuleiro e os pisos desenhados.
const LARGURA_PISO = 110;
const ALTURA_PISO = 60;
const ESPESSURA = 15;

const CASAS = {
  NORMAL: { cor: "#ffffff" },
  GACHA: { cor: "#ffcc00" },
  RECOVERY: { cor: "#00ff88" },
  COMBAT: { cor: "#ff4444" },
  CHECKPOINT: { cor: "#4444ff" },
  BOSS: { cor: "#9900ff" },
};

// Estado interno de movimento do jogador no tabuleiro.
// Estado local de movimento do personagem, incluindo animações e escolhas de caminho.
let controleMovimento = {
  passosRestantes: 0,
  timerAndar: 0,
  esperandoEscolha: false,
  dadoAtivo: false,
  animandoPulo: false,
  puloProgresso: 0,
  casaOrigem: null,
  casaDestino: null,
};

let stateGlobal = null;
let mouseXGlobal = 0;
let mouseYGlobal = 0;

// Gera o layout da fase 1 usando um grid com colunas e offsets de linha.
// Gera o layout de casas para a fase 1 usando colunas com offsets de linha definidos.
function gerarMalhaOrganica() {
  const layoutGrid = [
    [0],
    [-1, 1],
    [-2, 2],
    [-3, -1, 1, 3],
    [-4, 0, 4],
    [-3, -1, 1, 3],
    [-4, -2, 2, 4],
    [-3, 1, 3],
    [-2, 0, 2],
    [-3, -1, 1, 3],
    [-4, 0, 4],
    [-3, -1, 3],
    [-2, 2],
    [-1, 1],
    [0],
  ];

  let casas = [];
  let idCounter = 0;

  for (let c = 0; c < layoutGrid.length; c++) {
    for (let i = 0; i < layoutGrid[c].length; i++) {
      let r = layoutGrid[c][i];

      let x = 150 + c * 115;
      let y = 540 + r * 55;

      let tipo = CASAS.NORMAL;
      if (c === 0) tipo = CASAS.CHECKPOINT;
      else if (c === 14) tipo = CASAS.BOSS;
      else if (c === 8 && r === 0) tipo = CASAS.RECOVERY;
      else if (idCounter % 9 === 0) tipo = CASAS.GACHA;
      else if (idCounter % 6 === 0) tipo = CASAS.COMBAT;
      else if (idCounter % 13 === 0) tipo = CASAS.RECOVERY;

      casas.push({ id: idCounter, c, r, x, y, tipo, proximas: [] });
      idCounter++;
    }
  }

  casas.forEach((casa) => {
    let casasNaProximaColuna = casas.filter((n) => n.c === casa.c + 1);
    casasNaProximaColuna.forEach((proxima) => {
      if (proxima.r === casa.r - 1 || proxima.r === casa.r + 1) {
        casa.proximas.push(proxima.id);
      }
    });
  });

  return casas;
}

// Gera o layout da fase 2, mantendo o estilo orgânico com nova distribuição de caminhos.
// Gera o layout de casas para a fase 2 mantendo estilo orgânico e distribuindo mais caminhos.
function gerarMalhaOrganicaFase2() {
  const layoutGrid = [
    [0],
    [-1, 1],
    [-2, 0, 2],
    [-1, 1],
    [0, 2, 4],
    [1, 3],
    [2, 4],
    [1, 3, 5],
    [2, 4],
    [1, 3, 5],
    [0, 2, 4],
    [-1, 1, 3],
    [-2, 0, 2],
    [-1, 1],
    [0],
  ];

  let casas = [];
  let idCounter = 0;

  for (let c = 0; c < layoutGrid.length; c++) {
    for (let i = 0; i < layoutGrid[c].length; i++) {
      let r = layoutGrid[c][i];

      let x = 130 + c * 120;
      let y = 520 + r * 55;

      let tipo = CASAS.NORMAL;
      if (c === 0) tipo = CASAS.CHECKPOINT;
      else if (c === layoutGrid.length - 1) tipo = CASAS.BOSS;
      else if (c === 6 && r === 4) tipo = CASAS.RECOVERY;
      else if (c === 10 && r === 0) tipo = CASAS.RECOVERY;
      else if (idCounter % 7 === 0) tipo = CASAS.GACHA;
      else if (idCounter % 5 === 0) tipo = CASAS.COMBAT;
      else if (idCounter % 11 === 0) tipo = CASAS.RECOVERY;

      casas.push({ id: idCounter, c, r, x, y, tipo, proximas: [] });
      idCounter++;
    }
  }

  casas.forEach((casa) => {
    let casasNaProximaColuna = casas.filter((n) => n.c === casa.c + 1);
    casasNaProximaColuna.forEach((proxima) => {
      if (proxima.r === casa.r - 1 || proxima.r === casa.r + 1) {
        casa.proximas.push(proxima.id);
      }
    });
  });

  return casas;
}

// Gera o layout da fase 3 com uma malha semelhante às fases anteriores para manter coesão visual.
// Gera o layout de casas para a fase 3 usando o mesmo estilo orgânico das fases anteriores.
function gerarMalhaOrganicaFase3() {
  const layoutGrid = [
    [0],
    [-1, 1],
    [-2, 0, 2],
    [-3, -1, 1, 3],
    [-4, 0, 4],
    [-3, -1, 1, 3],
    [-4, -2, 2, 4],
    [-3, 1, 3],
    [-2, 0, 2],
    [-1, 1],
    [0],
  ];

  let casas = [];
  let idCounter = 0;

  for (let c = 0; c < layoutGrid.length; c++) {
    for (let i = 0; i < layoutGrid[c].length; i++) {
      let r = layoutGrid[c][i];

      let x = 140 + c * 120;
      let y = 520 + r * 55;

      let tipo = CASAS.NORMAL;
      if (c === 0) tipo = CASAS.CHECKPOINT;
      else if (c === layoutGrid.length - 1) tipo = CASAS.BOSS;
      else if (c === 7 && r === 1) tipo = CASAS.RECOVERY;
      else if (c === 4 && r === 0) tipo = CASAS.RECOVERY;
      else if (idCounter % 8 === 0) tipo = CASAS.GACHA;
      else if (idCounter % 5 === 0) tipo = CASAS.COMBAT;
      else if (idCounter % 10 === 0) tipo = CASAS.RECOVERY;

      casas.push({ id: idCounter, c, r, x, y, tipo, proximas: [] });
      idCounter++;
    }
  }

  casas.forEach((casa) => {
    let casasNaProximaColuna = casas.filter((n) => n.c === casa.c + 1);
    casasNaProximaColuna.forEach((proxima) => {
      if (proxima.r === casa.r - 1 || proxima.r === casa.r + 1) {
        casa.proximas.push(proxima.id);
      }
    });
  });

  return casas;
}

const MAPA_FLUXO_FASE1 = {
  nome: "The Void - Ruínas Flutuantes",
  casas: gerarMalhaOrganica(),
};

const MAPA_FLUXO_FASE2 = {
  nome: "The Void - Labirinto de Éclipse",
  casas: gerarMalhaOrganicaFase2(),
};

const MAPA_FLUXO_FASE3 = {
  nome: "The Void - Espiral Abissal",
  casas: gerarMalhaOrganicaFase3(),
};

// Seleciona o mapa do tabuleiro correto com base na fase atual do jogo.
// Retorna o mapa de fluxo correto com base na fase atual do jogo.
function getMapaFluxo(state) {
  if (state?.fase === 3) return MAPA_FLUXO_FASE3;
  return state?.fase === 2 ? MAPA_FLUXO_FASE2 : MAPA_FLUXO_FASE1;
}

// Renderiza o tabuleiro, incluindo fundo, conexões, casas, personagem, HUD e botão de rolar dado.
// Desenha a cena principal do tabuleiro: fundo, caminhos, casas, personagem e HUD.
function renderBoard(ctx, assets, state, mouseX, mouseY) {
  stateGlobal = state;
  mouseXGlobal = mouseX;
  mouseYGlobal = mouseY;

  const mapa = getMapaFluxo(state);

  if (assets.fundoBoard && assets.fundoBoard.complete) {
    ctx.drawImage(assets.fundoBoard, 0, 0, 1920, 1080);
  }

  desenharConexoes(ctx, mapa);

  mapa.casas.forEach((casa) => {
    let scale = 1.0;
    if (casa.tipo === CASAS.BOSS) scale = 1.3;
    else if (casa.tipo === CASAS.RECOVERY) scale = 1.2;
    desenharSombra(ctx, casa.x, casa.y, scale);
  });

  processarMovimentoBoard(state, mapa);

  mapa.casas.forEach((casa) => {
    const ehOpcao = state.opcoesDeCaminho?.includes(casa.id);
    const dx = Math.abs(mouseX - casa.x) / (LARGURA_PISO / 2);
    const dy = Math.abs(mouseY - casa.y) / (ALTURA_PISO / 2);
    const isHover = dx + dy <= 1;

    let corFinal = casa.tipo.cor;
    if (ehOpcao) corFinal = isHover ? "#ffffff" : "#aaaaaa";

    let scale = 1.0;
    if (casa.tipo === CASAS.BOSS) scale = 1.3;
    else if (casa.tipo === CASAS.RECOVERY) scale = 1.2;

    desenharBloco(ctx, casa.x, casa.y, corFinal, ehOpcao || isHover, scale);
  });

  renderPersonagem(ctx, assets, state, mapa);
  renderHUD(ctx, state);

  if (
    controleMovimento.passosRestantes === 0 &&
    !controleMovimento.esperandoEscolha &&
    !controleMovimento.dadoAtivo &&
    !controleMovimento.animandoPulo
  ) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillRect(860, 950, 200, 60);

    ctx.fillStyle = "black";
    ctx.font = "bold 24px Arial";
    ctx.fillText("ROLAR DADO", 960, 980);

    ctx.restore();
  }
}

// Inicia a rolagem do dado e bloqueia novas ações até o resultado ser definido.
function rolarDado() {
  if (
    controleMovimento.passosRestantes > 0 ||
    controleMovimento.esperandoEscolha ||
    controleMovimento.dadoAtivo ||
    controleMovimento.animandoPulo
  )
    return;

  controleMovimento.dadoAtivo = true;
  const container = document.getElementById("dado-container");
  const dado = document.getElementById("dado");

  container.style.display = "block";
  dado.classList.add("rolando");

  const resultado = Math.floor(Math.random() * 6) + 1;

  setTimeout(() => {
    dado.classList.remove("rolando");

    switch (resultado) {
      case 1:
        dado.style.transform = "rotateY(0deg)";
        break;
      case 6:
        dado.style.transform = "rotateY(180deg)";
        break;
      case 3:
        dado.style.transform = "rotateY(-90deg)";
        break;
      case 4:
        dado.style.transform = "rotateY(90deg)";
        break;
      case 2:
        dado.style.transform = "rotateX(-90deg)";
        break;
      case 5:
        dado.style.transform = "rotateX(90deg)";
        break;
    }

    setTimeout(() => {
      container.style.display = "none";
      controleMovimento.passosRestantes = resultado;
      controleMovimento.dadoAtivo = false;
    }, 1000);
  }, 1500);
}

// Atualiza o movimento do jogador no tabuleiro: anima salto, executa passos e solicita escolha quando necessário.
function processarMovimentoBoard(state, mapa) {
  if (controleMovimento.animandoPulo) {
    controleMovimento.puloProgresso += 0.05;

    if (controleMovimento.puloProgresso >= 1) {
      controleMovimento.puloProgresso = 1;
      controleMovimento.animandoPulo = false;
      state.casaAtual = controleMovimento.casaDestino;
      controleMovimento.passosRestantes--;

      if (controleMovimento.passosRestantes === 0) {
        const novaCasa = mapa.casas.find((c) => c.id === state.casaAtual);
        aplicarEfeitoDaCasa(novaCasa);
      }
    }
    return;
  }

  if (
    controleMovimento.passosRestantes <= 0 ||
    controleMovimento.esperandoEscolha
  )
    return;

  controleMovimento.timerAndar++;
  if (controleMovimento.timerAndar < 10) return;
  controleMovimento.timerAndar = 0;

  const casaAtualDados = mapa.casas.find((c) => c.id === state.casaAtual);

  if (casaAtualDados.proximas.length === 0) {
    controleMovimento.passosRestantes = 0;
    aplicarEfeitoDaCasa(casaAtualDados);
    return;
  }

  if (casaAtualDados.proximas.length === 1) {
    controleMovimento.casaOrigem = state.casaAtual;
    controleMovimento.casaDestino = casaAtualDados.proximas[0];
    controleMovimento.animandoPulo = true;
    controleMovimento.puloProgresso = 0;
  } else if (casaAtualDados.proximas.length > 1) {
    controleMovimento.esperandoEscolha = true;
    state.opcoesDeCaminho = casaAtualDados.proximas;
  }
}

// Executa o evento vinculado à casa atual: gacha, combate, boss ou recuperação.
function aplicarEfeitoDaCasa(casa) {
  if (casa.tipo === CASAS.GACHA) {
    if (stateGlobal) {
      stateGlobal.gacha = null;
      stateGlobal.proximaCena = "gacha";
      stateGlobal.emTransicao = true;
    }
  } else if (casa.tipo === CASAS.COMBAT) {
    if (stateGlobal) {
      stateGlobal.proximaCena = "combat";
      stateGlobal.emTransicao = true;
      stateGlobal.combat = null; // força reinicializar o combate na próxima cena
      stateGlobal.combatBoss = false;
    }
  } else if (casa.tipo === CASAS.BOSS) {
    if (stateGlobal) {
      stateGlobal.proximaCena = "combat";
      stateGlobal.emTransicao = true;
      stateGlobal.combat = null;
      stateGlobal.combatBoss = true;
      if (stateGlobal.fase === 1) {
        stateGlobal.bossTransition = "paraFase2";
      } else if (stateGlobal.fase === 2) {
        stateGlobal.bossTransition = "paraFase3";
      } else {
        stateGlobal.bossTransition = "reiniciar";
      }
    }
  } else if (casa.tipo === CASAS.RECOVERY) {
    if (stateGlobal && stateGlobal.stats) {
      stateGlobal.stats.vida = stateGlobal.stats.vidaMax;
    }
  }
}

// Desenha linhas tracejadas entre casas conectadas para mostrar os caminhos possíveis.
function desenharConexoes(ctx, mapa) {
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 5;
  ctx.setLineDash([10, 10]);

  mapa.casas.forEach((casa) => {
    casa.proximas.forEach((proximaId) => {
      const destino = mapa.casas.find((c) => c.id === proximaId);
      if (destino) {
        ctx.beginPath();
        ctx.moveTo(casa.x, casa.y);
        ctx.lineTo(destino.x, destino.y);
        ctx.stroke();
      }
    });
  });
  ctx.restore();
}

// Desenha sombra por baixo do piso para criar sensação de profundidade.
function desenharSombra(ctx, x, y, scale = 1.0) {
  const w = LARGURA_PISO * scale;
  const h = ALTURA_PISO * scale;
  const dropDist = 45;

  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = 15;
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";

  ctx.beginPath();
  ctx.moveTo(x, y + dropDist - h / 2);
  ctx.lineTo(x + w / 2, y + dropDist);
  ctx.lineTo(x, y + dropDist + h / 2);
  ctx.lineTo(x - w / 2, y + dropDist);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// Desenha cada bloco do tabuleiro com perspectiva e brilho, alterando o estilo se estiver em destaque.
function desenharBloco(ctx, x, y, corBase, destaque, scale = 1.0) {
  const w = LARGURA_PISO * scale;
  const h = ALTURA_PISO * scale;
  const esp = ESPESSURA * scale;

  ctx.save();
  ctx.lineJoin = "round";

  ctx.fillStyle = escurecerCor(corBase, 50);
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y);
  ctx.lineTo(x, y + h / 2);
  ctx.lineTo(x + w / 2, y);
  ctx.lineTo(x + w / 2, y + esp);
  ctx.lineTo(x, y + h / 2 + esp);
  ctx.lineTo(x - w / 2, y + esp);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = corBase;
  if (destaque) {
    ctx.shadowBlur = 20;
    ctx.shadowColor = "white";
  }
  ctx.beginPath();
  ctx.moveTo(x, y - h / 2);
  ctx.lineTo(x + w / 2, y);
  ctx.lineTo(x, y + h / 2);
  ctx.lineTo(x - w / 2, y);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

// Desenha o personagem na casa atual ou no arco de salto durante a animação.
function renderPersonagem(ctx, assets, state, mapa) {
  const img =
    state.personagemSelecionado === "maya" ? assets.card1 : assets.card2;
  if (!img || !img.complete) return;

  if (controleMovimento.animandoPulo) {
    const casaOrigem = mapa.casas.find(
      (c) => c.id === controleMovimento.casaOrigem,
    );
    const casaDestino = mapa.casas.find(
      (c) => c.id === controleMovimento.casaDestino,
    );

    if (casaOrigem && casaDestino) {
      const p = controleMovimento.puloProgresso;

      const lerpX = casaOrigem.x + (casaDestino.x - casaOrigem.x) * p;
      const lerpY = casaOrigem.y + (casaDestino.y - casaOrigem.y) * p;

      const alturaPulo = 80;
      const arcoY = Math.sin(p * Math.PI) * alturaPulo;

      ctx.drawImage(img, lerpX - 55, lerpY - 160 - arcoY, 110, 160);
    }
  } else {
    const casa = mapa.casas.find((c) => c.id === state.casaAtual);
    if (casa) {
      ctx.drawImage(img, casa.x - 55, casa.y - 160, 110, 160);
    }
  }
}

// Mostra dados do jogador como nome, vida e defesa no painel inferior.
function renderHUD(ctx, state) {
  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
  ctx.fillRect(50, 880, 480, 150);

  ctx.fillStyle = "white";
  ctx.font = "bold 36px sans-serif";
  ctx.fillText(state.personagemSelecionado?.toUpperCase() || "", 80, 910);

  ctx.font = "24px sans-serif";

  ctx.fillStyle = "#ff5555";
  ctx.fillText(`❤ VIDA: ${state.stats.vida}/${state.stats.vidaMax}`, 80, 970);

  ctx.fillStyle = "#55ccff";
  ctx.fillText(`🛡 DEFESA: ${state.stats.defesa}`, 280, 970);

  ctx.restore();
}

// Gera uma variação mais escura de uma cor hexadecimal para criar sombras e bordas.
function escurecerCor(hex, amt) {
  let num = parseInt(hex.slice(1), 16),
    r = (num >> 16) - amt,
    g = ((num >> 8) & 0x00ff) - amt,
    b = (num & 0x0000ff) - amt;
  return (
    "#" +
    (
      0x1000000 +
      (r < 0 ? 0 : r) * 0x10000 +
      (g < 0 ? 0 : g) * 0x100 +
      (b < 0 ? 0 : b)
    )
      .toString(16)
      .slice(1)
  );
}

window.addEventListener("mousedown", () => {
  if (!stateGlobal || stateGlobal.cena !== "jogo") return;

  if (
    controleMovimento.passosRestantes === 0 &&
    !controleMovimento.esperandoEscolha &&
    !controleMovimento.dadoAtivo &&
    !controleMovimento.animandoPulo
  ) {
    if (
      mouseXGlobal >= 860 &&
      mouseXGlobal <= 1060 &&
      mouseYGlobal >= 950 &&
      mouseYGlobal <= 1010
    ) {
      rolarDado();
      return;
    }
  }

  if (controleMovimento.esperandoEscolha && stateGlobal.opcoesDeCaminho) {
    const mapa = getMapaFluxo(stateGlobal);
    mapa.casas.forEach((casa) => {
      if (stateGlobal.opcoesDeCaminho.includes(casa.id)) {
        const dx = Math.abs(mouseXGlobal - casa.x) / (LARGURA_PISO / 2);
        const dy = Math.abs(mouseYGlobal - casa.y) / (ALTURA_PISO / 2);

        if (dx + dy <= 1) {
          controleMovimento.casaOrigem = stateGlobal.casaAtual;
          controleMovimento.casaDestino = casa.id;
          controleMovimento.animandoPulo = true;
          controleMovimento.puloProgresso = 0;

          controleMovimento.esperandoEscolha = false;
          stateGlobal.opcoesDeCaminho = null;
        }
      }
    });
  }
});
