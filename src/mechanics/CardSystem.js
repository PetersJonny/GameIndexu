export class CardSystem { // Gerencia a lógica de combate com cartas entre jogador e inimigo
    constructor(player, enemy, manaManager) {
        this.maxHandSize = 5; // tamanho máximo da mão
        this.player = player; // personagem jogador
        this.enemy = enemy; // personagem inimigo
        this.manaManager = manaManager; // gerencia mana separadamente
        this.resetCombat(); // inicia o combate com deck e mão prontos
    }

    resetCombat() {
        if (!this.player || !this.enemy) return; // Não faz nada sem personagem ou inimigo definido

        this.player.resetCombat(this.maxHandSize); // Prepara o baralho do jogador
        this.enemy.resetCombat(this.maxHandSize); // Prepara o baralho do inimigo

        if (this.manaManager) {
            this.manaManager.reset(); // recarrega mana no início do duelo
        }

        this.isPlayerTurn = true; // turno do jogador começa ativo
        this.winner = null; // duelo ainda não tem vencedor
        //Mensagem do começo da bataha
        this.messages = [
            'Bem-vindo ao duelo de cartas!',
            'Pressione 1-5 para usar cartas, R para comprar, E para terminar a vez.',
            'B para iniciar outro duelo quando terminar.'
        ];

        this.drawCards(this.maxHandSize); // compra cartas iniciais
    }
    //Randomiza as cartas
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    drawCards(count) {
        if (!this.player) return; // Não compra sem jogador definido
        const messages = this.player.drawCards(count, this.maxHandSize); // Compra cartas do deck do jogador
        messages.forEach((message) => this.addMessage(message)); // Adiciona mensagens de reshuffle ou compra
    }
    //Define a raridade das cartas
    getCardRarity(card) {
        return CardSystem.calculateCardRarity(
            card,
            this.player ? this.player.maxHealth : 30,
            this.manaManager ? this.manaManager.maxMana : 18
        );
    }

    static calculateCardRarity(card, maxHealth = 30, maxMana = 18) {
        // Valida se o objeto de carta existe e tem os atributos numéricos necessários.
        if (!card || typeof card.cost !== 'number' || typeof card.value !== 'number') {
            return 'Desconhecida'; // requer dados válidos para calcular raridade
        }

        const costScore = Math.min(Math.max(card.cost / 5, 0), 1); // custo é proporcional até 5
        const valueScore = Math.min(Math.max(card.value / 12, 0), 1); // valor é proporcional até 12
        const typeScore = CardSystem.getCardTypeScore(card.type); // valor do tipo da carta
        const lifeScore = Math.min(Math.max(maxHealth / 40, 0), 1); // vida do personagem influencia raridade
        const manaScore = Math.min(Math.max(maxMana / 24, 0), 1); // mana máxima também afeta a força percebida

        const balanceScore = (costScore + valueScore + typeScore + lifeScore + manaScore) / 5; // média simples dos fatores

        if (balanceScore >= 0.85) return 'Mítica';
        if (balanceScore >= 0.7) return 'Lendária';
        if (balanceScore >= 0.55) return 'Rara';
        if (balanceScore >= 0.4) return 'Incomum';
        return 'Comum';
    }

    // Dado o tipo da carta, retorna um multiplicador de valor para o cálculo de raridade.
    static getCardTypeScore(type) {
        const normalizedType = typeof type === 'string' ? type.toLowerCase() : '';
        switch (normalizedType) {
            case 'attack': return 1.0; // ataques têm maior impacto direto
            case 'heal': return 0.95; // cura mantém o jogador vivo
            case 'defend': return 0.9; // defesa reduz dano futuro
            case 'mana': return 0.85; // mana é útil, mas menos diretamente ofensiva
            default: return 0.75; // tipos desconhecidos recebem um valor neutro
        }
    }

    // Retorna a cor associada ao nível de raridade da carta para uso na UI.
    getCardRarityColor(card) {
        const rarity = this.getCardRarity(card);
        switch (rarity) {
            case 'Mítica': return '#df1515';
            case 'Lendária': return '#D4AF37';
            case 'Rara': return '#3F51B5';
            case 'Incomum': return '#4CAF50';
            case 'Comum': return '#9E9E9E';
            default: return '#FFFFFF';
        }
    }

    // Executa a jogada de uma carta retirando-a da mão e aplicando seu efeito.
    playCard(slotIndex) {
        if (this.winner) {
            return { success: false, message: 'O duelo já terminou.' }; // não permite ações após o fim
        }

        if (!this.player || slotIndex < 0 || slotIndex >= this.player.hand.length) {
            return { success: false, message: 'Carta inválida.' }; // índice inválido
        }

        const card = this.player.hand[slotIndex];
        if (!this.manaManager || !this.manaManager.canSpend(card.cost)) {
            return { success: false, message: `Mana insuficiente para ${card.name}.` }; // mana insuficiente
        }

        this.manaManager.spend(card.cost); // gasta mana
        this.player.hand.splice(slotIndex, 1); // remove cartão da mão
        this.player.discardPile.push(card); // envia para descarte

        // Executa efeito da carta de acordo com seu tipo
        if (card.type === 'attack') {
            const damage = this.enemy.takeDamage(card.value);
            this.addMessage(`${card.name} causa ${damage} de dano.`);
        }
        if (card.type === 'defend') {
            this.player.addArmor(card.value);
            this.addMessage(`${card.name} concede ${card.value} de escudo.`);
        }
        if (card.type === 'heal') {
            this.player.heal(card.value);
            this.addMessage(`${card.name} recupera ${card.value} de vida.`);
        }
        if (card.type === 'mana') {
            this.manaManager.restore(card.value);
            this.addMessage(`${card.name} recupera ${card.value} de mana.`);
        }

        this.checkWinner(); // verifica se houve vitória ou derrota após a jogada
        return { success: true, message: `${card.name} jogada.` };
    }

    // Termina o turno do jogador e resolve o turno do inimigo.
    endTurn() {
        if (this.winner) {
            return { success: false, message: 'O duelo já terminou.' }; // Não permite terminar turno após fim do duelo
        }

        this.addMessage('Fim de turno do jogador. Vez do Inimigo!');
        this.enemyAttack(); // inimigo faz seu ataque de retorno

        if (this.manaManager) {
            this.manaManager.refill(); // recarrega mana para o próximo turno
        }

        this.drawCards(this.maxHandSize - this.player.hand.length); // completa a mão do jogador
        this.checkWinner(); // checa vitória após o ataque inimigo
        return { success: true, message: 'Fim de turno.' };
    }

    enemyAttack() {
        const baseDamage = 8; // dano padrão do inimigo
        const damage = this.player.takeDamage(baseDamage); // aplica dano considerando armadura
        this.addMessage(`Inimigo ataca e causa ${damage} de dano.`);
    }

    checkWinner() {
        if (this.enemy.health <= 0) {
            this.enemy.health = 0; // Evita vida negativa
            this.winner = 'player'; // Jogador vence
            this.addMessage('Vitória! O inimigo foi derrotado.');
        }
        if (this.player.health <= 0) {
            this.player.health = 0; // Evita vida negativa
            this.winner = 'enemy'; // Inimigo vence
            this.addMessage('Você foi derrotado... Fim do duelo.');
        }
    }

    addMessage(message) {
        this.messages.unshift(message); // adiciona mensagem no início da lista
        if (this.messages.length > 5) {
            this.messages.length = 5; // mantém apenas as 5 mensagens mais recentes
        }
    }

    // Getters de acesso para facilitar a leitura de estado do combate.
    get mana() {
        return this.manaManager ? this.manaManager.mana : 0;
    }

    get maxMana() {
        return this.manaManager ? this.manaManager.maxMana : 0;
    }

    get deck() {
        return this.player ? this.player.deck : [];
    }

    get discardPile() {
        return this.player ? this.player.discardPile : [];
    }

    get hand() {
        return this.player ? this.player.hand : [];
    }

    get playerHealth() {
        return this.player ? this.player.health : 0;
    }

    get playerMaxHealth() {
        return this.player ? this.player.maxHealth : 0;
    }

    get playerArmor() {
        return this.player ? this.player.armor : 0;
    }

    get enemyHealth() {
        return this.enemy ? this.enemy.health : 0;
    }

    get enemyMaxHealth() {
        return this.enemy ? this.enemy.maxHealth : 0;
    }

    get enemyArmor() {
        return this.enemy ? this.enemy.armor : 0;
    }

    isBattleOver() {
        return Boolean(this.winner); // true se já houver vencedor
    }
}
