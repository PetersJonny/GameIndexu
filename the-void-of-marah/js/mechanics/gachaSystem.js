// Define os itens que podem ser sorteados na recompensa gacha e aplica seus efeitos ao jogador.

const ATAQUES_JOGO = {
  soco: { id: "soco", nome: "SOCO", dano: 2 },
  chute_forte: { id: "chute_forte", nome: "CHUTE FORTE", dano: 4 }
};

const GACHA_ITENS = [
  {
    nome: "Poção de Cura",
    tipo: "vida",
    valor: 3,
    descricao: "Recupera 3 pontos de vida máxima e cura imediatamente o mesmo valor.",
    cor: "#8cffb6",
    imgId: "pocao_cura" 
  },
  {
    nome: "Escudo do Guardião",
    tipo: "defesa",
    valor: 2,
    descricao: "Aumenta a defesa em 2 pontos, reduzindo o dano recebido.",
    cor: "#8cc8ff",
    imgId: "escudo" 
  },
  {
    nome: "Lâmina Rápida",
    tipo: "ataque",
    valor: 2,
    descricao: "Aumenta o dano em 1 ponto para o próximo combate.",
    cor: "#ffd56b",
    imgId: "lamina_rapida" 
  },
  {
    nome: "Elixir de Vigor",
    tipo: "vida",
    valor: 5,
    descricao: "Aumenta a vida máxima em 5 pontos e restaura a vida atual.",
    cor: "#7dffb8",
    imgId: "elixir_vigor" 
  },
  {
    nome: "Aço Refinado",
    tipo: "defesa",
    valor: 3,
    descricao: "Fortifica o personagem com +3 de defesa permanente.",
    cor: "#9ed4ff",
    imgId: "aco_refinado" 
  },
  {
    nome: "Foco de Cerimônia", 
    tipo: "ataque",
    valor: 3,
    descricao: "Foca a força do personagem em +2 de ataque permanente.",
    cor: "#ffe285",
    imgId: "fogo_das_almas" // <--- Imagem nova adicionada aqui!
  },
  {
    nome: "Bobblehead",
    tipo: "colecionavel",
    valor: 0,
    descricao: "Um boneco cabeçudo muito curioso. Apenas colecionável.",
    cor: "#ffffff",
    imgId: "boblbleble"
  },
  {
    nome: "Colar Misterioso",
    tipo: "colecionavel",
    valor: 0,
    descricao: "Um colar antigo encontrado nas ruínas. Um belo adorno.",
    cor: "#ffffff",
    imgId: "colar"
  },
  {
    nome: "Estrela com Palito",
    tipo: "colecionavel",
    valor: 0,
    descricao: "Parece um adereço de fantasia. Brilha no escuro.",
    cor: "#ffffff",
    imgId: "estrela_com_palito"
  },
  {
    nome: "Frigideira Velha",
    tipo: "colecionavel",
    valor: 0,
    descricao: "Útil para fazer um lanche, mas inútil em batalha.",
    cor: "#ffffff",
    imgId: "frigideira"
  },
  {
    nome: "Guitarra Quebrada",
    tipo: "colecionavel",
    valor: 0,
    descricao: "Falta uma corda, mas ainda tem muito estilo.",
    cor: "#ffffff",
    imgId: "guitarra"
  },
  {
    nome: "Carta Joker",
    tipo: "colecionavel",
    valor: 0,
    descricao: "O curinga do baralho. Quem sabe traga sorte?",
    cor: "#ffffff",
    imgId: "joker"
  },
  {
    nome: "Lanterna Apagada",
    tipo: "colecionavel",
    valor: 0,
    descricao: "Sem pilhas. Serve apenas como peso de papel.",
    cor: "#ffffff",
    imgId: "lanterna"
  },
  {
    nome: "Latinha Vazia",
    tipo: "colecionavel",
    valor: 0,
    descricao: "Alguém já tomou o refrigerante. Lixo de uns, tesouro de outros.",
    cor: "#ffffff",
    imgId: "latinha"
  },
  {
    nome: "Olho Mágico",
    tipo: "colecionavel",
    valor: 0,
    descricao: "Um cristal que parece te observar de volta.",
    cor: "#ffffff",
    imgId: "olhoMagico"
  },
  {
    nome: "Oniguiri Frio",
    tipo: "colecionavel",
    valor: 0,
    descricao: "Um lanche de arroz tradicional. Já está meio duro.",
    cor: "#ffffff",
    imgId: "oniguiri"
  },
  {
    nome: "Pesos de Treino",
    tipo: "colecionavel",
    valor: 0,
    descricao: "Pesados demais para usar durante uma luta de verdade.",
    cor: "#ffffff",
    imgId: "pesos"
  },
  {
    nome: "Siri de Estimação",
    tipo: "colecionavel",
    valor: 0,
    descricao: "Ele faz 'snip snip' com as garras. Muito simpático.",
    cor: "#ffffff",
    imgId: "siri"
  },
  {
    nome: "Tetris",
    tipo: "colecionavel",
    valor: 0,
    descricao: "Uma peça quadrada que não encaixa em lugar nenhum.",
    cor: "#ffffff",
    imgId: "tetris"
  }
];

// Retorna três itens aleatórios diferentes a partir da lista de gacha.
function sortearItensGacha(state) {
  // O jogador começa só com soco se não tiver nada salvo
  let ataquesDoPlayer = (state && state.ataques) ? state.ataques : ["soco"];
  
  const copias = GACHA_ITENS.filter(item => {
    // Se for um ataque, verifica se o jogador JÁ TEM. Se tiver, remove da caixa de sorteio!
    if (item.tipo === "novo_ataque") {
      return !ataquesDoPlayer.includes(item.ataqueId);
    }
    return true; // Outros itens (poção, defesa) podem vir sempre
  });

  const itens = [];
  while (copias.length > 0 && itens.length < 3) {
    const index = Math.floor(Math.random() * copias.length);
    itens.push(copias.splice(index, 1)[0]);
  }
  return itens;
}

// Aplica o bônus do item gacha ao estado do jogador.
function aplicarBonusGacha(state, item) {
  if (!state || !state.stats || !item) return;

  if (item.tipo === "vida") {
    state.stats.vidaMax = Math.max(1, state.stats.vidaMax + item.valor);
    state.stats.vida = Math.min(state.stats.vidaMax, state.stats.vida + item.valor);
  } else if (item.tipo === "defesa") {
    state.stats.defesa += item.valor;
  } else if (item.tipo === "ataque") {
    state.stats.ataque += item.valor;
  } 
  // --- ENSINANDO O JOGO A GUARDAR O NOVO ATAQUE ---
  else if (item.tipo === "novo_ataque") {
    if (!state.ataques) state.ataques = ["soco"];
    
    // Se ele ainda tem espaço (máximo 4) e não tem o golpe, adiciona!
    if (state.ataques.length < 4 && !state.ataques.includes(item.ataqueId)) {
      state.ataques.push(item.ataqueId);
    }
  }
}

window.gachaSystem = {
  GACHA_ITENS,
  gerarItensGacha: sortearItensGacha,
  aplicarBonusGacha,
};

// Constantes de layout da tela de gacha, com posições e dimensões dos cards e botão.
const GACHA_CARD_WIDTH = 420;
const GACHA_CARD_HEIGHT = 560; // Aumentei um pouco a altura para caber a imagem confortavelmente
const GACHA_CARD_Y = 220;
const GACHA_CARD_X = [180, 750, 1320];
const GACHA_BUTTON = {
  x: 750,
  y: 830,
  width: 400,
  height: 110,
};

// Inicializa o estado do gacha se ainda não existir, sorteando três itens disponíveis.
function inicializarGacha(state) {
  if (!state.gacha) {
    state.gacha = {
      itens: window.gachaSystem.gerarItensGacha(state), 
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
  wrapTextGacha(ctx, gacha.mensagem, 960, 210, 1200, 34);

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

    // NOME DO ITEM
    ctx.fillStyle = item.cor;
    ctx.font = "bold 30px Arial";
    ctx.textAlign = "left";
    ctx.fillText(item.nome, GACHA_CARD_X[index] + 30, GACHA_CARD_Y + 60);

    // DESCRIÇÃO DO ITEM
    ctx.fillStyle = "#ffffff";
    ctx.font = "22px Arial"; // Fonte levemente diminuída
    wrapTextGacha(ctx, item.descricao, GACHA_CARD_X[index] + 30, GACHA_CARD_Y + 120, GACHA_CARD_WIDTH - 60, 28);

    // IMAGEM DO ITEM (Centro do Card)
    if (item.imgId && typeof assets !== "undefined" && assets[item.imgId] && assets[item.imgId].complete) {
      const imgSize = 140; // Tamanho do ícone do item
      const imgX = GACHA_CARD_X[index] + (GACHA_CARD_WIDTH / 2) - (imgSize / 2);
      const imgY = GACHA_CARD_Y + 280; // Posicionado abaixo da descrição
      
      // Efeito de brilho ao redor da imagem se estiver selecionado
      if (isSelected) {
         ctx.save();
         ctx.shadowColor = item.cor;
         ctx.shadowBlur = 20;
         ctx.drawImage(assets[item.imgId], imgX, imgY, imgSize, imgSize);
         ctx.restore();
      } else {
         ctx.drawImage(assets[item.imgId], imgX, imgY, imgSize, imgSize);
      }
    }

    // BÔNUS DO ITEM (Rodapé do Card)
    ctx.fillStyle = "#fff1a8";
    ctx.font = "bold 28px Arial";
    const textoBonus = item.tipo === "vida"
      ? `+${item.valor} VIDA`
      : item.tipo === "defesa"
        ? `+${item.valor} DEFESA`
        : `+${item.valor} ATAQUE`;
    ctx.fillText(textoBonus, GACHA_CARD_X[index] + 30, GACHA_CARD_Y + 500);

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