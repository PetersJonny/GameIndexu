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

let tempoFlutuacao = 0;

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
      else if (
        (c === 3 && (r === -1 || r === 1)) ||
        (c === 9 && (r === -1 || r === 1)) ||
        (c === 11 && (r === -3 || r === 3))
      )
        tipo = CASAS.COMBAT;
      else if (idCounter % 9 === 0) tipo = CASAS.GACHA;
      else if (idCounter % 13 === 0) tipo = CASAS.RECOVERY;
      casas.push({ id: idCounter, c, r, x, y, tipo, proximas: [] });
      idCounter++;
    }
  }
  casas.forEach((casa) => {
    let casasNaProximaColuna = casas.filter((n) => n.c === casa.c + 1);
    casasNaProximaColuna.forEach((proxima) => {
      if (proxima.r === casa.r - 1 || proxima.r === casa.r + 1)
        casa.proximas.push(proxima.id);
    });
  });
  return casas;
}

function gerarMalhaOrganicaFase2() {
  // Novo layout estratégico: separa o caminho em "Rota de Cima" e "Rota de Baixo"
  const layoutGrid = [
    [0],            // Col 0: Início
    [-1, 1],        // Col 1: Primeira divisão
    [-2, 0, 2],     // Col 2: Expansão
    [-1, 1],        // Col 3: GARGALO DE COMBATE 1
    [0],            // Col 4: Ponto de encontro único (Cura garantida)
    [-1, 1],        // Col 5: Segunda divisão
    [-2, 2],        // Col 6: ROTAS ISOLADAS (O meio sumiu, caminhos não se cruzam!)
    [-3, -1, 1, 3], // Col 7: Expansão extrema
    [-2, 0, 2],     // Col 8: Começa a juntar
    [-1, 1],        // Col 9: GARGALO DE COMBATE 2
    [-2, 2],        // Col 10: ROTAS ISOLADAS DE NOVO
    [-3, -1, 1, 3], // Col 11: Expansão
    [-2, 0, 2],     // Col 12: Começa a juntar pro final
    [-1, 1],        // Col 13: GARGALO DE COMBATE 3 (Guarda-costas do Boss)
    [0],            // Col 14: BOSS
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
      else if (c === 14) tipo = CASAS.BOSS;
      
      // --- AS BARREIRAS DE COMBATE (Gargalos) ---
      // O jogador é forçado a escolher um dos monstros para avançar
      else if (c === 3 || c === 9 || c === 13) {
        tipo = CASAS.COMBAT;
      }
      // --- PONTO DE DESCANSO APÓS A PRIMEIRA LUTA ---
      else if (c === 4) {
        tipo = CASAS.RECOVERY;
      }
      // --- PRIMEIRA CASA GACHA FORÇADA (Rota de Baixo - Meio) ---
      else if (c === 8 && r === 2) {
        tipo = CASAS.GACHA;
      }
      // --- SEGUNDA CASA GACHA FORÇADA (Rota de Baixo - Direita) ---
      else if (c === 12 && r === 2) {
        tipo = CASAS.GACHA;
      }
      // Casas aleatórias baseadas no ID
      else if (idCounter % 7 === 0) tipo = CASAS.GACHA;
      else if (idCounter % 11 === 0) tipo = CASAS.RECOVERY;

      casas.push({ id: idCounter, c, r, x, y, tipo, proximas: [] });
      idCounter++;
    }
  }

  casas.forEach((casa) => {
    let casasNaProximaColuna = casas.filter((n) => n.c === casa.c + 1);
    casasNaProximaColuna.forEach((proxima) => {
      // A regra de conexão "r-1 ou r+1" brilha muito aqui com as rotas isoladas
      if (proxima.r === casa.r - 1 || proxima.r === casa.r + 1) {
        casa.proximas.push(proxima.id);
      }
    });
  });

  return casas;
}

function gerarMalhaOrganicaFase3() {
  const layoutGrid = [
    [0],            // Col 0
    [-1, 1],        // Col 1
    [-2, 0, 2],     // Col 2
    [-3, -1, 1, 3], // Col 3
    [-4, 0, 4],     // Col 4
    [-3, -1, 1, 3], // Col 5
    [-4, -2, 2, 4], // Col 6
    [-3, 1, 3],     // Col 7
    [-2, 0, 2],     // Col 8
    [-1, 1],        // Col 9 (Os dois últimos pisos antes do boss)
    [0],            // Col 10 (Boss)
  ];
  
  let casas = [];
  let idCounter = 0;
  
  for (let c = 0; c < layoutGrid.length; c++) {
    for (let i = 0; i < layoutGrid[c].length; i++) {
      let r = layoutGrid[c][i];
      let x = 350 + c * 120;
      let y = 520 + r * 55;
      
      let tipo = CASAS.NORMAL;

      // --- LÓGICA PADRÃO DA FASE ---
      if (c === 0) tipo = CASAS.CHECKPOINT;
      else if (c === layoutGrid.length - 1) tipo = CASAS.BOSS;
      else if (c === 4 && r === 0) tipo = CASAS.RECOVERY;
      else if (idCounter % 8 === 0) tipo = CASAS.GACHA;
      else if (idCounter % 5 === 0) tipo = CASAS.COMBAT;
      else if (idCounter % 10 === 0) tipo = CASAS.RECOVERY;

      // =========================================================
      // --- CUSTOMIZAÇÕES MANUAIS DE LEVEL DESIGN ---
      // =========================================================
      
      // 1. "tirar esse monstro perto do personagem em baixo e botar la encima antes do gacha"
      if (c === 2 && r === 2) tipo = CASAS.NORMAL;  // Apaga o Vermelho de baixo
      if (c === 2 && r === -2) tipo = CASAS.COMBAT; // Coloca o Vermelho lá em cima (Rota Topo)

      // 2. "tirar vermelho e verde perto do boss..."
      if (c === 7 && r === 1) tipo = CASAS.NORMAL; // Apaga o Verde antigo
      if (c === 8 && r === 0) tipo = CASAS.NORMAL; // Apaga o Vermelho antigo
      
      // "... e botando nessa mesma ordem nos pisos da direita" (Coluna 9)
      if (c === 9 && r === -1) tipo = CASAS.COMBAT;   // Vermelho na direita superior
      if (c === 9 && r === 1) tipo = CASAS.RECOVERY;  // Verde na direita inferior

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

function getMapaFluxo(state) {
  if (state?.fase === 3) return MAPA_FLUXO_FASE3;
  return state?.fase === 2 ? MAPA_FLUXO_FASE2 : MAPA_FLUXO_FASE1;
}

function renderBoard(ctx, assets, state, mouseX, mouseY) {
  stateGlobal = state;
  mouseXGlobal = mouseX;
  mouseYGlobal = mouseY;
  const mapa = getMapaFluxo(state);
  if (assets.fundoBoard && assets.fundoBoard.complete)
    ctx.drawImage(assets.fundoBoard, 0, 0, 1920, 1080);

  tempoFlutuacao += 0.05;

  desenharConexoes(ctx, mapa);

  mapa.casas.forEach((casa) => {
    let scale = 1.0;
    if (casa.tipo === CASAS.BOSS) scale = 1.3;
    else if (casa.tipo === CASAS.RECOVERY) scale = 1.2;

    // Calcula offset de flutuação
    const offsetY = Math.sin(tempoFlutuacao + casa.id) * 5;

    desenharSombra(ctx, casa.x, casa.y + offsetY, scale);

    const ehOpcao = state.opcoesDeCaminho?.includes(casa.id);
    const dx = Math.abs(mouseX - casa.x) / (LARGURA_PISO / 2);
    const dy = Math.abs(mouseY - casa.y) / (ALTURA_PISO / 2);
    const isHover = dx + dy <= 1;

    desenharBloco(
      ctx,
      casa.x,
      casa.y + offsetY,
      ehOpcao || isHover ? "#ffffff" : casa.tipo.cor,
      ehOpcao || isHover,
      scale,
    );
  });

  processarMovimentoBoard(state, mapa);
  renderPersonagem(ctx, assets, state, mapa);
  renderHUD(ctx, state);
  if (state.cena === "jogo" && !state.emTransicao) {
    if (controleMovimento.passosRestantes <= 0 && !controleMovimento.animandoPulo) {
      // Força a limpeza de estados antigos para garantir a jogabilidade
      if (controleMovimento.dadoAtivo && !document.getElementById("dado-container")?.style.display === "block") {
        controleMovimento.dadoAtivo = false;
      }
      if (!controleMovimento.esperandoEscolha) {
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
  }
  //BUTAUM VOLUME
  const centroX = 160;
  const POS_VOLUME_Y = 70;
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
  
}

function rolarDado() {
  // --- INJEÇÃO DE SEGURANÇA: Limpa travas antigas para permitir a rolagem sempre ---
  controleMovimento.esperandoEscolha = false;
  controleMovimento.animandoPulo = false;
  controleMovimento.puloProgresso = 0;
  
  // Ativa a flag de controle do dado
  controleMovimento.dadoAtivo = true;

  const container = document.getElementById("dado-container");
  const dado = document.getElementById("dado");
  
  if (!container || !dado) {
    // Fallback caso o HTML do dado não seja encontrado: anda sem animação 3D
    console.warn("Elementos HTML do dado não foram encontrados!");
    const resultadoFallback = Math.floor(Math.random() * 6) + 1;
    controleMovimento.passosRestantes = resultadoFallback;
    controleMovimento.dadoAtivo = false;
    return;
  }

  // Configura e inicia a animação 3D do CSS
  container.style.display = "block";
  dado.classList.remove("rolando");
  void dado.offsetWidth; // Truque para resetar a animação do CSS instantaneamente
  dado.classList.add("rolando");

  const resultado = Math.floor(Math.random() * 6) + 1;

  setTimeout(() => {
    dado.classList.remove("rolando");
    switch (resultado) {
      case 1: dado.style.transform = "rotateY(0deg)"; break;
      case 6: dado.style.transform = "rotateY(180deg)"; break;
      case 3: dado.style.transform = "rotateY(-90deg)"; break;
      case 4: dado.style.transform = "rotateY(90deg)"; break;
      case 2: dado.style.transform = "rotateX(-90deg)"; break;
      case 5: dado.style.transform = "rotateX(90deg)"; break;
    }

    setTimeout(() => {
      container.style.display = "none";
      // Define os passos que o jogador vai andar baseado no resultado do dado
      controleMovimento.passosRestantes = resultado;
      controleMovimento.dadoAtivo = false;
    }, 1000);
  }, 1500);
}

function processarMovimentoBoard(state, mapa) {
  if (controleMovimento.animandoPulo) {
    controleMovimento.puloProgresso += 0.05;
    if (controleMovimento.puloProgresso >= 1) {
      controleMovimento.puloProgresso = 1;
      controleMovimento.animandoPulo = false;
      state.casaAtual = controleMovimento.casaDestino;
      controleMovimento.passosRestantes--;
      const novaCasa = mapa.casas.find((c) => c.id === state.casaAtual);
      if (novaCasa.tipo === CASAS.COMBAT || novaCasa.tipo === CASAS.BOSS)
        aplicarEfeitoDaCasa(novaCasa);
      else if (controleMovimento.passosRestantes === 0)
        aplicarEfeitoDaCasa(novaCasa);
    }
    return;
  }
  if (
    controleMovimento.passosRestantes <= 0 ||
    controleMovimento.esperandoEscolha ||
    state.emTransicao
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

function aplicarEfeitoDaCasa(casa) {
  if (casa.tipo === CASAS.GACHA) {
    if (stateGlobal) {
      stateGlobal.gacha = null;
      stateGlobal.proximaCena = "gacha";
      stateGlobal.emTransicao = true;
    }
  } else if (casa.tipo === CASAS.COMBAT) {
    if (stateGlobal) {
      stateGlobal.combatHouseType = "combat";
      
      // --- CÓDIGO NOVO: Sorteando um colecionável aleatório para a recompensa ---
      let itemSorteado = null;
      if (typeof GACHA_ITENS !== 'undefined') {
        // Filtra apenas os itens que são colecionáveis
        const colecionaveis = GACHA_ITENS.filter(i => i.tipo === "colecionavel");
        if (colecionaveis.length > 0) {
          const randomIndex = Math.floor(Math.random() * colecionaveis.length);
          // Cria uma cópia do item para não alterar a lista original
          itemSorteado = { ...colecionaveis[randomIndex] }; 
        }
      }
      
      stateGlobal.itemReward = itemSorteado; // Entrega o item sorteado pro combate
      // -------------------------------------------------------------------------

      stateGlobal.proximaCena = "combat";
      stateGlobal.emTransicao = true;
      stateGlobal.combat = null;
      stateGlobal.combatBoss = false;
    }
  } else if (casa.tipo === CASAS.BOSS) {
    if (stateGlobal) {
      stateGlobal.combatHouseType = "boss";
      stateGlobal.itemReward = null; // Opcional: Você pode colocar um drop fixo pro boss aqui depois
      stateGlobal.proximaCena = "combat";
      stateGlobal.emTransicao = true;
      stateGlobal.combat = null;
      stateGlobal.combatBoss = true;
      stateGlobal.bossTransition =
        stateGlobal.fase === 1
          ? "paraFase2"
          : stateGlobal.fase === 2
            ? "paraFase3"
            : "reiniciar";
    }
  } else if (casa.tipo === CASAS.RECOVERY) {
    if (stateGlobal && stateGlobal.stats)
      stateGlobal.stats.vida = stateGlobal.stats.vidaMax;
  }
}

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

function desenharBloco(ctx, x, y, corBase, destaque, scale = 1.0) {
  const w = LARGURA_PISO * scale;
  const h = ALTURA_PISO * scale;
  const esp = ESPESSURA * scale;
  ctx.save();
  ctx.lineJoin = "round";
  ctx.fillStyle = escurecerCor(corBase, 30);
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y);
  ctx.lineTo(x, y + h / 2);
  ctx.lineTo(x + w / 2, y);
  ctx.lineTo(x + w / 2, y + esp);
  ctx.lineTo(x, y + h / 2 + esp);
  ctx.lineTo(x - w / 2, y + esp);
  ctx.closePath();
  ctx.fill();
  const grad = ctx.createRadialGradient(x, y - h / 4, h / 4, x, y, h);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(0.5, corBase);
  grad.addColorStop(1, escurecerCor(corBase, 40));
  ctx.fillStyle = grad;
  if (destaque) {
    ctx.shadowBlur = 15;
    ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
  }
  ctx.beginPath();
  ctx.moveTo(x, y - h / 2);
  ctx.lineTo(x + w / 2, y);
  ctx.lineTo(x, y + h / 2);
  ctx.lineTo(x - w / 2, y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function renderPersonagem(ctx, assets, state, mapa) {
  const img =
    state.personagemSelecionado === "maya" ? assets.card3 : assets.card4;
  if (!img || !img.complete) return;
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
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
      const arcoY = Math.sin(p * Math.PI) * 80;
      ctx.drawImage(img, lerpX - 69, lerpY - 170 - arcoY, 130, 195);
    }
  } else {
    const casa = mapa.casas.find((c) => c.id === state.casaAtual);
    if (casa) {
      const offsetY = Math.sin(tempoFlutuacao + casa.id) * 5;
      ctx.drawImage(img, casa.x - 69, casa.y - 170 + offsetY, 130, 195);
    }
  }
  ctx.restore();
}

function renderHUD(ctx, state) {
  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
  ctx.beginPath();
  ctx.roundRect(50, 880, 480, 150, 15);
  ctx.fill();
  ctx.fillStyle = "white";
  ctx.font = "bold 36px Consolas, monospace";
  ctx.fillText(state.personagemSelecionado?.toUpperCase() || "", 80, 910);
  ctx.font = "24px Consolas, monospace";
  if (assets.iconVida && assets.iconVida.complete)
    ctx.drawImage(assets.iconVida, 80, 965, 32, 32);
  ctx.fillStyle = "#ff5555";
  ctx.fillText(`VIDA: ${state.stats.vida}/${state.stats.vidaMax}`, 120, 970);
  if (assets.iconDano && assets.iconDano.complete)
    ctx.drawImage(assets.iconDano, 290, 910, 32, 32);
  ctx.fillStyle = "#ffcc00";
  ctx.fillText(`DANO: ${state.stats.ataque}`, 330, 915);
  if (assets.iconDefesa && assets.iconDefesa.complete)
    ctx.drawImage(assets.iconDefesa, 290, 965, 32, 32);
  ctx.fillStyle = "#55ccff";
  ctx.fillText(`DEFESA: ${state.stats.defesa}`, 330, 970);
  ctx.restore();
}

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

window.addEventListener("mousedown", (event) => {
  if (!stateGlobal || stateGlobal.cena !== "jogo" || event.button !== 0) return;  

  // --- 1. Verificação do Botão de Rolar Dado principal ---
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
  
  // --- 2. Verificação da UI de Volume (Corrigido para usar mouseXGlobal) ---
  const acao = checkBoardClick(mouseXGlobal, mouseYGlobal);
  
  if (acao === "mudar_mudo") {
    if (typeof alternarMute === "function") alternarMute();
  } else if (acao === "aumentar") {
    if (stateGlobal.volume < 10) stateGlobal.volume++;
    stateGlobal.mutado = false;
  } else if (acao === "diminuir") {
    if (stateGlobal.volume > 0) stateGlobal.volume--;
    if (stateGlobal.volume === 0) stateGlobal.mutado = true;
  } else if (acao === "rolar_dado") {
    rolarDado();
    return;
  }

  // --- 3. Escolha de caminhos em bifurcações ---
  if (controleMovimento.esperandoEscolha && stateGlobal.opcoesDeCaminho) {
    const mapa = getMapaFluxo(stateGlobal);
    mapa.casas.forEach((casa) => {
      if (stateGlobal.opcoesDeCaminho && stateGlobal.opcoesDeCaminho.includes(casa.id)) {
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

function checkBoardClick(mouseX, mouseY) {
  const centroX = 160;
  const POS_VOLUME_Y = 70;

  // Verifica se o clique foi na altura correta dos botões de volume
  if (Math.abs(mouseY - (POS_VOLUME_Y - 15)) < 40) {
    // Clique no ícone de Mute
    if (
      mouseX > centroX - DISTANCIA_X_UI * 1.5 - 40 &&
      mouseX < centroX - DISTANCIA_X_UI * 1.5 + 40
    )
      return "mudar_mudo";
      
    // Clique no botão menos (-)
    if (
      mouseX > centroX - DISTANCIA_X_UI * 0.5 - 40 &&
      mouseX < centroX - DISTANCIA_X_UI * 0.5 + 40
    )
      return "diminuir";
      
    // Clique no botão mais (+)
    if (
      mouseX > centroX + DISTANCIA_X_UI * 1.5 - 40 &&
      mouseX < centroX + DISTANCIA_X_UI * 1.5 + 40
    )
      return "aumentar";
  }
  
  // Se clicou no botão do Dado (opcional, caso queira validar aqui depois)
  if (mouseX > 860 && mouseX < 1060 && mouseY > 950 && mouseY < 1010) {
      return "rolar_dado";
  }

  return null;
}

