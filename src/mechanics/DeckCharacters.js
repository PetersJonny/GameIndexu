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
            { id: 5, name: 'Fluxo Arcano', type: 'mana', cost: 0, value: 2, rarity: 'Comum', desc: 'Restaura mana rapidamente.' },
            { id: 6, name: 'Sopro de Inverno', type: 'attack', cost: 1, value: 4, rarity: 'Comum', desc: 'Um sopro congelante.' },
            { id: 7, name: 'Barreira de Espinhos', type: 'defend', cost: 2, value: 8, rarity: 'Incomum', desc: 'Cria uma proteção com espinhos.' },
            { id: 8, name: 'Golpe de Vidro', type: 'attack', cost: 1, value: 8, rarity: 'Comum', desc: 'Ataque com cacos de vidro.' },
            { id: 9, name: 'Meditação Veloz', type: 'mana', cost: 0, value: 2, rarity: 'Comum', desc: 'Restaura mana com leve meditação.' },
            { id: 10, name: 'Impacto Sísmico', type: 'attack', cost: 2, value: 9, rarity: 'Incomum', desc: 'Ataque com grande impacto.' },
            { id: 11, name: 'Prece de Sangue', type: 'heal', cost: 3, value: 12, rarity: 'Rara', desc: 'Recupera vida com sangue.' },
            { id: 12, name: 'Vingança Radiante', type: 'attack', cost: 4, value: 16, rarity: 'Rara', desc: 'Ataque carregado com vingança.' }
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
            { id: 2, name: 'Barreira de Aço', type: 'defend', cost: 2, value: 7, rarity: 'Incomum', desc: 'Aumenta a defesa instantaneamente.' },
            { id: 3, name: 'Reator Energético', type: 'mana', cost: 0, value: 4, rarity: 'Incomum', desc: 'Restaura mais mana.' },
            { id: 4, name: 'Estilhaço', type: 'attack', cost: 4, value: 8, rarity: 'Rara', desc: 'Causa dano extra enquanto perfura.' },
            { id: 5, name: 'Escudo Magnético', type: 'defend', cost: 1, value: 4, rarity: 'Comum', desc: 'Proteção que reduz dano.' },
            { id: 6, name: 'Pulso Eletromagnético', type: 'attack', cost: 1, value: 6, rarity: 'Comum', desc: 'Ataque de ondas eletromagnéticas.' },
            { id: 7, name: 'Blindagem Reforçada', type: 'defend', cost: 3, value: 10, rarity: 'Rara', desc: 'Aumenta defesa com alta blindagem' },
            { id: 8, name: 'Sobrecarga', type: 'attack', cost: 4, value: 15, rarity: 'Rara', desc: 'Ataque com uma alta carga.' },
            { id: 9, name: 'Célula de Energia', type: 'mana', cost: 0, value: 2, rarity: 'Comum', desc: 'Restaura mana rapidamente.' },
            { id: 10, name: 'Disparo de Plasma', type: 'attack', cost: 2, value: 9, rarity: 'Incomum', desc: 'Ataque concentrado de plasma.' },
            { id: 11, name: 'Reparo de Emergência', type: 'heal', cost: 2, value: 6, rarity: 'Comum', desc: 'Recupera vida com reparo.' },
            { id: 12, name: 'Lâmina de Titânio', type: 'attack', cost: 3, value: 12, rarity: 'Incomum', desc: 'Ataque com lâmina afiada.' }
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
            { id: 1, name: 'Rugido da Floresta', type: 'attack', cost: 2, value: 10, rarity: 'Incomum', desc: 'Ataque com um rugido.' },
            { id: 2, name: 'Proteção Natural', type: 'defend', cost: 1, value: 5, rarity: 'Comum', desc: 'Ganha armadura da floresta.' },
            { id: 3, name: 'Sangue Vital', type: 'heal', cost: 2, value: 7, rarity: 'Comum', desc: 'Recupera energia vital do ambiente.' },
            { id: 4, name: 'Golpe Selvagem', type: 'attack', cost: 3, value: 13, rarity: 'Incomum', desc: 'Ataque da natureza.' },
            { id: 5, name: 'Espírito da Madeira', type: 'mana', cost: 0, value: 3, rarity: 'Comum', desc: 'Restaura um pouco de mana.' },
            { id: 6, name: 'Engenharia de Selva', type: 'defend', cost: 2, value: 9, rarity: 'Incomum', desc: 'Ergue uma defesa sólida.' },
            { id: 7, name: 'Garra Mecânica', type: 'attack', cost: 1, value: 6, rarity: 'Comum', desc: 'Um ataque rápido com próteses de combate.' },
            { id: 8, name: 'Soro Botânico', type: 'heal', cost: 3, value: 10, rarity: 'Incomum', desc: 'Uma mistura de ervas que regenera feridas.' },
            { id: 9, name: 'Sintonia Animal', type: 'mana', cost: 0, value: 1, rarity: 'Comum', desc: 'Conecção com a natureza para focar.' },
            { id: 10, name: 'Dispositivo de Espinhos', type: 'attack', cost: 2, value: 8, rarity: 'Incomum', desc: 'Lança projéteis orgânicos.' },
            { id: 11, name: 'Armadura de Raízes', type: 'defend', cost: 3, value: 12, rarity: 'Rara', desc: 'Invoca a resistência das árvore para proteção.' },
            { id: 12, name: 'Sobrecarga Primal', type: 'attack', cost: 4, value: 16, rarity: 'Rara', desc: 'Libera uma explosão de energia selvagem.' }
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
            { id: 3, name: 'Corrente Azul', type: 'mana', cost: 0, value: 3, rarity: 'Comum', desc: 'Restaura energia mágica.' },
            { id: 4, name: 'Descarga Fria', type: 'attack', cost: 3, value: 10, rarity: 'Incomum', desc: 'Ataque poderoso que congela o inimigo.' },
            { id: 5, name: 'Recarga', type: 'heal', cost: 2, value: 5, rarity: 'Comum', desc: 'Regenera parte da saúde.' },
            { id: 6, name: 'Toque de Ossos', type: 'attack', cost: 1, value: 6, rarity: 'Comum', desc: 'Um toque gélido que causa dano.' },
            { id: 7, name: 'Muralha de Marfim', type: 'defend', cost: 3, value: 9, rarity: 'Incomum', desc: 'Barreira maciça feita de restos mortais.' },
            { id: 8, name: 'Foice Espectral', type: 'attack', cost: 2, value: 8, rarity: 'Incomum', desc: 'Uma lâmina que atravessa a matéria física.' },
            { id: 9, name: 'Essência Gélida', type: 'mana', cost: 0, value: 2, rarity: 'Comum', desc: 'Recupera um pouco de mana.' },
            { id: 10, name: 'Armadura Óssea', type: 'defend', cost: 1, value: 4, rarity: 'Comum', desc: 'Proteção leve com placas de ossos.' },
            { id: 11, name: 'Dreno Vital', type: 'heal', cost: 3, value: 8, rarity: 'Incomum', desc: 'Suga a vitalidade do inimigo para se recuperar.' },
            { id: 12, name: 'Explosão de Cadáver', type: 'attack', cost: 4, value: 14, rarity: 'Rara', desc: 'Detona energia necrótica.' }
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
            { id: 4, name: 'Alma da Folha', type: 'mana', cost: 0, value: 3, rarity: 'Comum', desc: 'Recupera mana com a força da floresta.' },
            { id: 5, name: 'Encontrar erva', type: 'heal', cost: 3, value: 6, rarity: 'Comum', desc: 'Procura ervas para se curar.' },
            { id: 6, name: 'Disparo Triplo', type: 'attack', cost: 3, value: 12, rarity: 'Rara', desc: 'Dispara três projéteis simultâneos.' },
            { id: 7, name: 'Camuflagem', type: 'defend', cost: 2, value: 8, rarity: 'Incomum', desc: 'Oculta-se na vegetação para se defender.' },
            { id: 8, name: 'Flecha Envenenada', type: 'attack', cost: 2, value: 9, rarity: 'Incomum', desc: 'Uma flecha banhada em toxinas letais.' },
            { id: 9, name: 'Orvalho da Floresta', type: 'mana', cost: 0, value: 2, rarity: 'Comum', desc: 'Recupera um pouco de mana.' },
            { id: 10, name: 'Pele de Escamas', type: 'defend', cost: 3, value: 11, rarity: 'Rara', desc: 'Endurece a pele com camadas de escamas.' },
            { id: 11, name: 'Bagas Silvestres', type: 'heal', cost: 2, value: 4, rarity: 'Comum', desc: 'Frutos nutritivos que recuperam energias.' },
            { id: 12, name: 'Chuva de Flechas', type: 'attack', cost: 4, value: 16, rarity: 'Rara', desc: 'Cobre o campo de batalha com fechas.' }
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
            { id: 1, name: 'Investida de Raios', type: 'attack', cost: 1, value: 6, rarity: 'Comum', desc: 'Ataque rápido com raios.' },
            { id: 2, name: 'Campo elétrico', type: 'defend', cost: 2, value: 6, rarity: 'Comum', desc: 'Escudo forjado em eletricidade.' },
            { id: 3, name: 'Sobrecarga de Elétrons', type: 'mana', cost: 0, value: 4, rarity: 'Incomum', desc: 'Restaura mana.' },
            { id: 4, name: 'Tempestade de raios', type: 'attack', cost: 3, value: 10, rarity: 'Incomum', desc: 'Ataque com múltiplos raios.' },
            { id: 5, name: 'Restauração Eletrolítica', type: 'heal', cost: 2, value: 6, rarity: 'Incomum', desc: 'Cura com energia abundante.' },
            { id: 6, name: 'Centelha Estática', type: 'attack', cost: 1, value: 7, rarity: 'Comum', desc: 'Uma pequena descarga elétrica.' },
            { id: 7, name: 'Manto de Plasma', type: 'defend', cost: 3, value: 10, rarity: 'Rara', desc: 'Uma camada de energia superaquecida.' },
            { id: 8, name: 'Chicotada Voltaica', type: 'attack', cost: 2, value: 9, rarity: 'Incomum', desc: 'Um feixe de eletricidade que chicoteia.' },
            { id: 9, name: 'Núcleo Magnético', type: 'mana', cost: 0, value: 2, rarity: 'Comum', desc: 'Estabiliza o campo magnético e recarrega as energias.' },
            { id: 10, name: 'Barreira Ionizada', type: 'defend', cost: 1, value: 4, rarity: 'Comum', desc: 'Cria uma proteção rápida.' },
            { id: 11, name: 'Reanimação Cardíaca', type: 'heal', cost: 3, value: 9, rarity: 'Incomum', desc: 'Um choque controlado para recuperação.' },
            { id: 12, name: 'Trovão do Juízo', type: 'attack', cost: 4, value: 15, rarity: 'Rara', desc: 'Convoca um raio devastador.' }
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
