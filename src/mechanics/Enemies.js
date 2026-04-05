import { Enemy } from '../entities/Enemy.js';
import { DeckCharacter } from './DeckCharacters.js';
import { ManaManager } from './ManaManager.js';

export const ENEMY_DEFINITIONS = {
    'Goblin Vigarista': {
        name: 'Goblin Vigarista',
        rank: 'minor',
        rewardRange: [3, 3],
        color: '#8B0000',
        maxHealth: 30,
        maxMana: 16,
        speed: 1.6,
        jumpForce: -10,
        detectionRange: 300,
        cards: [
            { id: 1, name: 'Golpe Sujo', type: 'attack', cost: 1, value: 5, rarity: 'Comum', desc: 'Inflige danos rápidos.' },
            { id: 2, name: 'Ataque Surpresa', type: 'attack', cost: 2, value: 7, rarity: 'Incomum', desc: 'Dano extra por elemento surpresa.' },
            { id: 3, name: 'Reflexo Rápido', type: 'defend', cost: 1, value: 4, rarity: 'Comum', desc: 'Aumenta defesa momentânea.' },
            { id: 4, name: 'Roubada de Mana', type: 'mana', cost: 0, value: 3, rarity: 'Incomum', desc: 'Recupera mana lentamente.' },
            { id: 5, name: 'Pílula de Fuga', type: 'heal', cost: 2, value: 6, rarity: 'Rara', desc: 'Recupera vida para continuar lutando.' }
        ]
    },
    'Orc Guardião': {
        name: 'Orc Guardião',
        rank: 'major',
        rewardRange: [4, 8],
        color: '#556B2F',
        maxHealth: 45,
        maxMana: 10,
        speed: 1.3,
        jumpForce: -10,
        detectionRange: 260,
        cards: [
            { id: 1, name: 'Investida Brutal', type: 'attack', cost: 1, value: 8, rarity: 'Comum', desc: 'Ataque poderoso e pesado.' },
            { id: 2, name: 'Guarda Inabalável', type: 'defend', cost: 2, value: 8, rarity: 'Incomum', desc: 'Escudo aumenta bastante.' },
            { id: 3, name: 'Bênção da Tribo', type: 'heal', cost: 2, value: 5, rarity: 'Incomum', desc: 'Cura parte da vida.' },
            { id: 4, name: 'Ritual de Fúria', type: 'mana', cost: 0, value: 2, rarity: 'Comum', desc: 'Recupera mana para jogar mais cartas.' }
        ]
    }
};

export function createWorldEnemies(physics) {
    return [
        new Enemy(ENEMY_DEFINITIONS['Goblin Vigarista'], 860, 520),
        new Enemy(ENEMY_DEFINITIONS['Orc Guardião'], 520, 420)
    ];
}

export function createBattleEnemy(definition) {
    if (!definition) return new DeckCharacter('Inimigo', '#880000', 35);

    const enemy = new DeckCharacter(definition.name, definition.color, definition.maxHealth || 35);
    enemy.manaManager = new ManaManager(definition.name, definition.maxMana || 12);
    enemy.rank = definition.rank || 'minor';
    enemy.rewardRange = definition.rewardRange || [3, 3];
    enemy.createDeck = function () {
        // Copia das cartas para evitar mutação global
        return definition.cards.map(c => ({ ...c }));
    };
    return enemy;
}
