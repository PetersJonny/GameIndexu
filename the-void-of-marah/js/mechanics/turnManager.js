// Controla o fluxo de combate, gerando inimigos, criando o estado de batalha e processando ataques.

const TURN_STATES = {
  PLAYER: "playerTurn",
  ENEMY: "enemyTurn",
};

// Bônus randômicos ao ataque de cada turno.
const TURN_ATTACK_BONUSES = {
  player: { min: 0, max: 2 },
  enemy: { min: 0, max: 1 },
};

// Inimigos comuns da fase 1.
const ENEMIES_COMBAT = [
  { name: "Slime", hp: 8, attack: 2, defense: 0 },
  { name: "Goblin", hp: 12, attack: 4, defense: 2 },
  { name: "Orc", hp: 18, attack: 5, defense: 3 },
  { name: "Wraith", hp: 16, attack: 5, defense: 1 },
];

// Inimigos comuns da fase 2.
const ENEMIES_COMBAT_FASE2 = [
  { name: "Flame Bat", hp: 14, attack: 6, defense: 2 },
  { name: "Spectral Knight", hp: 18, attack: 6, defense: 3 },
  { name: "Viper Mage", hp: 16, attack: 7, defense: 2 },
  { name: "Iron Golem", hp: 20, attack: 7, defense: 4 },
];

// Inimigos comuns da fase 3.
const ENEMIES_COMBAT_FASE3 = [
  { name: "Crystal Serpent", hp: 20, attack: 8, defense: 3 },
  { name: "Void Stalker", hp: 22, attack: 7, defense: 4 },
  { name: "Abyssal Archer", hp: 18, attack: 9, defense: 2 },
  { name: "Chaos Wisp", hp: 24, attack: 6, defense: 3 },
];

// Bosses por fase. São usados quando state.combatBoss está ativo.
const BOSS_BY_FASE = {
  1: { name: "Shadow Lord", hp: 25, attack: 8, defense: 4 },
  2: { name: "Eclipse Queen", hp: 32, attack: 10, defense: 5 },
  3: { name: "Rei Espiral", hp: 40, attack: 12, defense: 6 },
};

// Retorna o template de inimigo apropriado para o estado atual.
function getEnemyTemplate(state) {
  if (state?.combatBoss) {
    return BOSS_BY_FASE[state.fase] || BOSS_BY_FASE[1];
  }

  let pool;
  if (state?.fase === 3) {
    pool = ENEMIES_COMBAT_FASE3;
  } else if (state?.fase === 2) {
    pool = ENEMIES_COMBAT_FASE2;
  } else {
    pool = ENEMIES_COMBAT;
  }

  const enemyData = pool[Math.floor(Math.random() * pool.length)];
  return {
    name: enemyData.name,
    hp: enemyData.hp,
    attack: enemyData.attack,
    defense: enemyData.defense,
  };
}

// Cria o estado inicial da batalha baseado no estado global do jogo.
function createCombatState(state) {
  if (!state) {
    throw new Error("turnManager.createCombatState requer um estado global válido.");
  }

  const player = new Player("Jogador", state.stats.vidaMax, state.stats.ataque, state.stats.defesa);
  player.hp = Math.max(1, Math.min(state.stats.vidaMax, state.stats.vida));

  const enemyData = getEnemyTemplate(state);
  const enemy = new Enemy(enemyData.name, enemyData.hp, enemyData.attack, enemyData.defense);

  const battle = {
    player,
    enemy,
    turn: TURN_STATES.PLAYER,
    estado: TURN_STATES.PLAYER,
    mensagem: state?.combatBoss
      ? `O ${enemy.name} apareceu! Vença o boss para concluir o desafio.`
      : `Um ${enemy.name} apareceu!`,
    finalizado: false,
    venceu: false,
    enemyName: enemy.name,
    enemyHP: enemy.hp,
    enemyMaxHP: enemy.maxHp,
    enemyAttack: enemy.attack,
    enemyDefense: enemy.defense,
    playerHP: player.hp,
    playerMaxHP: player.maxHp,
  };

  state.combatBoss = false;
  syncBattleSnapshot(battle, state);

  return battle;
}

// Sincroniza os valores de exibição entre o objeto de batalha e o estado global.
function syncBattleSnapshot(battle, state) {
  if (!battle || !battle.player || !battle.enemy) return;

  battle.enemyName = battle.enemy.name;
  battle.enemyHP = battle.enemy.hp;
  battle.enemyMaxHP = battle.enemy.maxHp;
  battle.enemyAttack = battle.enemy.attack;
  battle.enemyDefense = battle.enemy.defense;
  battle.playerHP = battle.player.hp;
  battle.playerMaxHP = battle.player.maxHp;
  battle.estado = battle.turn;

  if (state) {
    state.stats.vida = battle.player.hp;
    state.stats.vidaMax = battle.player.maxHp;
    state.stats.ataque = battle.player.attack;
    state.stats.defesa = battle.player.defense;
  }
}

// Finaliza a batalha e ajusta a mensagem caso o jogador tenha vencido ou sido derrotado.
function finalizeBattle(battle, state, venceu) {
  if (!battle) return;

  battle.finalizado = true;
  battle.venceu = venceu;
  battle.turn = TURN_STATES.PLAYER;
  battle.estado = battle.turn;
  syncBattleSnapshot(battle, state);

  if (venceu) {
    battle.mensagem = `${battle.enemy.name} foi derrotado! Toque em CONTINUAR para voltar ao tabuleiro.`;
  } else {
    battle.mensagem = `Você foi derrotado... Toque em CONTINUAR para reiniciar no início do tabuleiro.`;
  }
}

// Executa a ação do jogador e trata o contra-ataque do inimigo.
function handlePlayerAction(state) {
  const battle = state?.combat;
  if (!battle || battle.finalizado) return false;

  // --- JOGADOR ATACA ---
  // O soco dá +2 de dano fixo somado ao ataque base do jogador!
  const poderDoSoco = 2; 
  const damageDealt = battle.enemy.receiveAttack(battle.player.attackValue(poderDoSoco));
  
  battle.mensagem = `Você usou SOCO em ${battle.enemy.name} e causou ${damageDealt} de dano.`;
  syncBattleSnapshot(battle, state);

  if (!battle.enemy.isAlive) {
    finalizeBattle(battle, state, true);
    return true;
  }

  // --- INIMIGO CONTRA-ATACA ---
  // Inimigo ataca usando apenas a força base dele (+0 de bônus)
  const poderInimigo = 0;
  const enemyDamage = battle.player.receiveAttack(battle.enemy.attackValue(poderInimigo));
  
  battle.turn = TURN_STATES.ENEMY;
  battle.estado = battle.turn;
  battle.mensagem += `\n${battle.enemy.name} contra-atacou e causou ${enemyDamage} de dano.`;
  syncBattleSnapshot(battle, state);

  if (!battle.player.isAlive) {
    finalizeBattle(battle, state, false);
    return true;
  }

  battle.turn = TURN_STATES.PLAYER;
  battle.estado = battle.turn;
  syncBattleSnapshot(battle, state);

  return true;
}

// Retorna informações de batalha atuais para renderização ou lógica externa.
function getBattleInfo(state) {
  if (!state?.combat) return null;
  return state.combat;
}

window.turnManager = {
  TURN_STATES,
  createCombatState,
  syncBattleSnapshot,
  finalizeBattle,
  handlePlayerAction,
  getBattleInfo,
};
