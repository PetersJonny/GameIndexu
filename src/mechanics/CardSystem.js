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
            'Clique em uma carta ou pressione 1-5 para usá-la. R para comprar, E para terminar a vez.'
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
    // Define a raridade das cartas.
    getCardRarity(card) {
        if (card && typeof card.rarity === 'string' && card.rarity.trim().length > 0) {
            return card.rarity;
        }
    }


    // Retorna a cor associada ao nível de raridade da carta para uso na UI.
    getCardRarityColor(card) {
        const rarity = this.getCardRarity(card);
        switch (rarity) {
            case 'Lendária': return '#D4AF37';
            case 'Rara': return '#3F51B5';
            case 'Incomum': return '#4CAF50';
            case 'Comum': return '#9E9E9E';
            default: return '#FFFFFF';
        }
    }

    // Texto do efeito para exibir na carta
    getCardEffectText(card) {
        if (!card || !card.type || card.value === undefined) return 'Efeito desconhecido';
        switch (card.type) {
            case 'attack':
                return `Dano: ${card.value}`;
            case 'defend':
                return `Escudo: ${card.value}`;
            case 'heal':
                return `Cura: ${card.value}`;
            case 'mana':
                return `Mana: +${card.value}`;
            default:
                return `Valor: ${card.value}`;
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
            const attackBonus = this.player.weaponBonus || 0;
            const damage = this.enemy.takeDamage(card.value + attackBonus);
            this.addMessage(`${card.name} causa ${damage} de dano.`);
            if (attackBonus > 0) {
                this.addMessage(`Bônus de arma: +${attackBonus} de ataque.`);
            }
        }
        if (card.type === 'defend') {
            const defenseBonus = this.player.defenseBonus || 0;
            const totalDefense = card.value + defenseBonus;
            this.player.addArmor(totalDefense);
            this.addMessage(`${card.name} concede ${totalDefense} de escudo.`);
            if (defenseBonus > 0) {
                this.addMessage(`Bônus de armadura: +${defenseBonus} de defesa.`);
            }
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

    // Método para comprar uma carta gastando mana
    buyCard() {
        const custoCompra = 2;

        // Não permite comprar se o duelo acabou ou não for o turno do player
        if (this.winner || !this.isPlayerTurn) return { success: false };

        // Verifica se a mão já está cheia (limite de 5)
        if (this.player.hand.length >= this.maxHandSize) {
            this.addMessage("Mão cheia! Não é possível comprar mais.");
            return { success: false };
        }

        // Verifica se tem mana suficiente (os 5 que você pediu)
        if (this.manaManager && this.manaManager.canSpend(custoCompra)) {
            this.manaManager.spend(custoCompra); // Gasta a mana
            this.drawCards(1); // Compra apenas 1 carta
            this.addMessage(`Comprou uma carta (-${custoCompra} Mana).`);

            // Se a mana zerar após a compra, passa o turno
            if (this.mana <= 0) {
                this.addMessage("Mana esgotada! Turno encerrado.");
                this.endTurn();
            }

            return { success: true };
        } else {
            this.addMessage(`Mana insuficiente! Precisa de ${custoCompra}.`);
            return { success: false };
        }
    }

    // Termina o turno do jogador e resolve o turno do inimigo.
    endTurn() {
        if (this.winner) {
            return { success: false, message: 'O duelo já terminou.' }; // Não permite terminar turno após fim do duelo
        }

        this.addMessage('Fim de turno do jogador. Vez do Inimigo!');

        setTimeout(() => {
            this.enemyAttack(); // inimigo faz seu ataque de retorno
            this.checkWinner(); // checa vitória após o ataque inimigo

            if(!this.winner) {
                this.startPlayerTurn(); // chama o início do seu novo turno 
            }

        }, 1000);

        return { success: true, message: 'Fim de turno.' };
    }

    // Restaura aleatoriamente a mana no turno
    startPlayerTurn() {
        this.isPlayerTurn = true;

        if (this.manaManager) {
            if (this.player.alwaysMaxMana) {
                this.manaManager.refill();
                this.addMessage('Relíquia ativa: mana restaurada ao máximo.');
            } else {
                const min = 2; // Minimo de mana que volta no turno
                const max = 5; // Máximo de mana que volta no turno
                const valorAleatorio = Math.floor(Math.random() * (max - min + 1)) + min; // Cria a aleatoriedade
                this.manaManager.restore(valorAleatorio); // Restaura o valor
                if (this.player.manaRegen) {
                    this.manaManager.restore(this.player.manaRegen);
                    this.addMessage(`Relíquia ativa: +${this.player.manaRegen} mana adicional.`);
                }
            }
        }

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
