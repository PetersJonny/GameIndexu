import { CardSystem } from './CardSystem.js';
import { ManaManager } from './ManaManager.js';

export class DeckCharacter {
    constructor(name, color, maxHealth = 30) {
        this.name = name; // Nome do personagem para exibir e mapear cartas
        this.color = color; // Cor associada ao personagem
        this.maxHealth = maxHealth; // Vida máxima do personagem
        this.health = maxHealth; // Vida atual
        this.manaManager = new ManaManager(this.name); // Gerenciador de mana específico do personagem
        this.armor = 0; // Armadura usada para bloquear dano
        this.deck = []; // Baralho principal de cartas
        this.discardPile = []; // Pilha de cartas descartadas
        this.hand = []; // Cartas na mão do jogador
    }

    createDeck() {//cria o deck vazio
        return [];
    }
    //reseta os valores para cada inicio de combate
    resetCombat(maxHandSize = 5) {
        this.deck = this.createDeck(); // recria o deck na preparação para um novo duelo
        this.shuffle(this.deck); // embaralha o deck criado
        this.discardPile = []; // limpa o descarte do combate anterior
        this.hand = []; // limpa a mão antes de comprar a nova mão inicial
        this.health = this.maxHealth; // restaura vida completa para o início do combate
        this.manaManager.reset(); // restaura mana completa para o início do combate
        this.armor = 0; // zera armadura no começo do duelo
        this.drawCards(maxHandSize); // compra as cartas iniciais do jogador
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    assignCardRarities() {
        this.deck = this.deck.map((card) => ({
            ...card,
            rarity: CardSystem.calculateCardRarity(card, this.maxHealth)
        }));
    }
    //Compra de cartas
    drawCards(count, maxHandSize = 5) {
        const messages = [];
        while (count > 0 && this.hand.length < maxHandSize) {
            if (this.deck.length === 0) {
                if (this.discardPile.length === 0) break; // não há cartas para comprar
                this.deck = [...this.discardPile]; // move o descarte de volta para o deck
                this.discardPile = [];
                this.shuffle(this.deck); // embaralha o descarte antes de continuar
                messages.push('O descarte foi embaralhado de volta ao deck.');
            }

            this.hand.push(this.deck.shift()); // adiciona a carta do topo à mão
            count -= 1;
        }
        return messages; // retorna mensagens para que o sistema de combate as exiba
    }
    //Contagem de dano
    takeDamage(amount) {
        const damage = Math.max(amount - this.armor, 0); // reduz dano pela armadura
        this.armor = Math.max(this.armor - amount, 0); // consome armadura proporcionalmente
        this.health -= damage;
        return damage; // retorna o dano efetivo sofrido
    }
    //Adiciona o valor de armadura
    addArmor(value) {
        this.armor += value; // aumenta a armadura atual do personagem
    }
    //Contabiliza a cura
    heal(value) {
        this.health = Math.min(this.health + value, this.maxHealth); // cura sem ultrapassar o máximo
    }
    //Verifica se o player está vivo
    get isAlive() {
        return this.health > 0; // true enquanto o personagem ainda tiver vida
    }

    // Métodos para gerenciamento de mana
    canSpendMana(cost) {
        return this.manaManager.canSpend(cost);
    }

    spendMana(cost) {
        return this.manaManager.spend(cost);
    }

    restoreMana(amount) {
        this.manaManager.restore(amount);
    }

    get currentMana() {
        return this.manaManager.mana;
    }

    get maxMana() {
        return this.manaManager.maxMana;
    }
}

// Deck do personagem Íris Shadowlace com vida, cor e cartas específicas
export class ÍrisShadowlace extends DeckCharacter {
    constructor(color) {
        super('Íris Shadowlace', color, 28);
    }

    createDeck() {
        return [
            { id: 1, name: 'Lamina de Fogo', type: 'attack', cost: 1, value: 6, rarity: 'Comum', desc: 'Ataque rápido com lâmina flamejante.' },
            { id: 2, name: 'Sombra Curativa', type: 'heal', cost: 2, value: 7, rarity: 'Incomum', desc: 'Recupera parte da sua vida.' },
            { id: 3, name: 'Escudo Etéreo', type: 'defend', cost: 1, value: 5, rarity: 'Comum', desc: 'Ganha proteção mágica.' },
            { id: 4, name: 'Chama Crescente', type: 'attack', cost: 3, value: 11, rarity: 'Rara', desc: 'Dano maior para desafiar inimigos.' },
            { id: 5, name: 'Fluxo Arcano', type: 'mana', cost: 0, value: 3, rarity: 'Incomum', desc: 'Restaura mana rapidamente.' }
        ];
    }
}
//deck e status do Atom
export class AtomShadowlace extends DeckCharacter {
    constructor(color) {
        super('Atom Shadowlace', color, 32);
    }

    createDeck() {
        return [
            { id: 1, name: 'Impacto Metálico', type: 'attack', cost: 1, value: 5, rarity: 'Comum', desc: 'Ataque concentrado de metal.' },
            { id: 2, name: 'Barreira de Aço', type: 'defend', cost: 2, value: 7, rarity: 'Comum', desc: 'Aumenta a defesa instantaneamente.' },
            { id: 3, name: 'Reator Energético', type: 'mana', cost: 0, value: 4, rarity: 'Incomum', desc: 'Restaura mais mana.' },
            { id: 4, name: 'Estilhaço', type: 'attack', cost: 4, value: 8, rarity: 'Rara', desc: 'Causa dano extra enquanto perfura.' },
            { id: 5, name: 'Escudo Magnético', type: 'defend', cost: 1, value: 4, rarity: 'Incomum', desc: 'Proteção que reduz dano.' }
        ];
    }
}
//deck e status de Ioruh
export class Ioruh extends DeckCharacter {
    constructor(color) {
        super('Ioruh', color, 34);
    }

    createDeck() {
        return [
            { id: 1, name: 'Rugido da Floresta', type: 'attack', cost: 4, value: 8, rarity: 'Rara', desc: 'Ajuda a ferir o inimigo com força bruta.' },
            { id: 2, name: 'Proteção Natural', type: 'defend', cost: 1, value: 6, rarity: 'Comum', desc: 'Ganha armadura da floresta.' },
            { id: 3, name: 'Sangue Vital', type: 'heal', cost: 2, value: 6, rarity: 'Comum', desc: 'Recupera energia vital do ambiente.' },
            { id: 4, name: 'Golpe Selvagem', type: 'attack', cost: 3, value: 6, rarity: 'Comum', desc: 'Golpe forte que pode superar escudos.' },
            { id: 5, name: 'Espírito da Madeira', type: 'mana', cost: 0, value: 2, rarity: 'Incomum', desc: 'Restaura um pouco de mana.' }
        ];
    }
}
//deck e status do Toshy
export class Toshy extends DeckCharacter {
    constructor(color) {
        super('Toshy', color, 30);
    }

    createDeck() {
        return [
            { id: 1, name: 'Lança de Gelo', type: 'attack', cost: 1, value: 5, rarity: 'Comum', desc: 'Ataque rápido e preciso.' },
            { id: 2, name: 'Placa Densa', type: 'defend', cost: 2, value: 6, rarity: 'Comum', desc: 'Cria uma defesa firme.' },
            { id: 3, name: 'Corrente Azul', type: 'mana', cost: 0, value: 3, rarity: 'Incomum', desc: 'Restaura energia mágica.' },
            { id: 4, name: 'Descarga Fria', type: 'attack', cost: 3, value: 10, rarity: 'Rara', desc: 'Ataque poderoso que congela o inimigo.' },
            { id: 5, name: 'Recarga', type: 'heal', cost: 2, value: 5, rarity: 'Incomum', desc: 'Regenera parte da saúde.' }
        ];
    }
}
//deck e status do Mogli
export class Mogli extends DeckCharacter {
    constructor(color) {
        super('Mogli', color, 30);
    }

    createDeck() {
        return [
            { id: 1, name: 'Flechada', type: 'attack', cost: 1, value: 7, rarity: 'Comum', desc: 'Atira uma flecha no inimigo.' },
            { id: 2, name: 'Mordida', type: 'attack', cost: 2, value: 4, rarity: 'Comum', desc: 'Morde o inimigo com ferocidade.' },
            { id: 3, name: 'Pulo Ágil', type: 'defend', cost: 1, value: 5, rarity: 'Comum', desc: 'Desvia e ganha escudo rápido.' },
            { id: 4, name: 'Alma da Folha', type: 'mana', cost: 0, value: 3, rarity: 'Incomum', desc: 'Recupera mana com a força da floresta.' },
            { id: 5, name: 'Encontrar erva', type: 'heal', cost: 3, value: 6, rarity: 'Rara', desc: 'Procura ervas para se curar.' }
        ];
    }
}
//deck e status da Thanatá
export class Thanatá extends DeckCharacter {
    constructor(color) {
        super('Thanatá', color, 32);
    }

    createDeck() {
        return [
            { id: 1, name: 'Investida Dourada', type: 'attack', cost: 1, value: 6, rarity: 'Comum', desc: 'Ataque rápido que brilha como ouro.' },
            { id: 2, name: 'Barreira de Moedas', type: 'defend', cost: 2, value: 6, rarity: 'Comum', desc: 'Escudo forjado em riquezas.' },
            { id: 3, name: 'Tesouro Arcano', type: 'mana', cost: 0, value: 4, rarity: 'Incomum', desc: 'Restaura mana com poder monetário.' },
            { id: 4, name: 'Golpe Valioso', type: 'attack', cost: 3, value: 10, rarity: 'Rara', desc: 'Ataque forte com preço alto.' },
            { id: 5, name: 'Vitalidade da Fortuna', type: 'heal', cost: 2, value: 6, rarity: 'Incomum', desc: 'Cura com energia abundante.' }
        ];
    }
}
//deck e status do Inimigo
export class DefaultEnemy extends DeckCharacter {
    constructor() {
        super('Inimigo', '#880000', 35);
    }

    createDeck() {
        return [
            { id: 1, name: 'Investida Sombria', type: 'attack', cost: 1, value: 6, rarity: 'Comum', desc: 'Ataque básico do inimigo.' },
            { id: 2, name: 'Escudo Sutil', type: 'defend', cost: 0, value: 4, rarity: 'Comum', desc: 'Aumenta um pouco de armadura.' },
            { id: 3, name: 'Fúria do Inimigo', type: 'attack', cost: 2, value: 9, rarity: 'Incomum', desc: 'Ataque mais forte do adversário.' }
        ];
    }
}

export function createBattleCharacter(name, color) { // Retorna o personagem de duelo correto com base no nome escolhido
    switch (name) {
        case 'Íris Shadowlace': return new ÍrisShadowlace(color);
        case 'Atom Shadowlace': return new AtomShadowlace(color);
        case 'Ioruh': return new Ioruh(color);
        case 'Toshy': return new Toshy(color);
        case 'Mogli': return new Mogli(color);
        case 'Thanatá': return new Thanatá(color);
        default: return new DeckCharacter(name, color, 30); // Cria personagem genérico se o nome não for reconhecido
    }
}
