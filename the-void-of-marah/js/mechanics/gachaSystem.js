// Define os itens que podem ser sorteados na recompensa gacha e aplica seus efeitos ao jogador.

const GACHA_ITENS = [
  {
    nome: "Poção de Cura",
    tipo: "vida",
    valor: 3,
    descricao: "Recupera 3 pontos de vida máxima e cura imediatamente o mesmo valor.",
    cor: "#8cffb6",
  },
  {
    nome: "Escudo do Guardião",
    tipo: "defesa",
    valor: 2,
    descricao: "Aumenta a defesa em 2 pontos, reduzindo o dano recebido.",
    cor: "#8cc8ff",
  },
  {
    nome: "Lâmina Rápida",
    tipo: "ataque",
    valor: 1,
    descricao: "Aumenta o dano em 1 ponto para o próximo combate.",
    cor: "#ffd56b",
  },
  {
    nome: "Elixir de Vigor",
    tipo: "vida",
    valor: 5,
    descricao: "Aumenta a vida máxima em 5 pontos e restaura a vida atual.",
    cor: "#7dffb8",
  },
  {
    nome: "Aço Refinado",
    tipo: "defesa",
    valor: 3,
    descricao: "Fortifica o personagem com +3 de defesa permanente.",
    cor: "#9ed4ff",
  },
  {
    nome: "Foco de Cerimânia",
    tipo: "ataque",
    valor: 2,
    descricao: "Foco a força do personagem em +2 de ataque permanente.",
    cor: "#ffe285",
  },
];

// Retorna três itens aleatórios diferentes a partir da lista de gacha.
function sortearItensGacha() {
  const copias = [...GACHA_ITENS];
  const itens = [];

  while (copias.length > 0 && itens.length < 3) {
    const index = Math.floor(Math.random() * copias.length);
    itens.push(copias.splice(index, 1)[0]);
  }

  return itens;
}

// Aplica o bônus do item gacha ao estado do jogador.
function aplicarBonusGacha(state, item) {
  if (!state || !state.stats || !item) {
    return;
  }

  if (item.tipo === "vida") {
    state.stats.vidaMax = Math.max(1, state.stats.vidaMax + item.valor);
    state.stats.vida = Math.min(state.stats.vidaMax, state.stats.vida + item.valor);
  } else if (item.tipo === "defesa") {
    state.stats.defesa += item.valor;
  } else if (item.tipo === "ataque") {
    state.stats.ataque += item.valor;
  }
}

// Exposição pública para o sistema de gacha.
window.gachaSystem = {
  GACHA_ITENS,
  gerarItensGacha: sortearItensGacha,
  aplicarBonusGacha,
};
