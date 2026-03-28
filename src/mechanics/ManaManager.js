export class ManaManager {
    constructor(maxMana = 18) {
        this.maxMana = maxMana; // mana máxima do jogador
        this.currentMana = 0; // mana atual disponível
        this.reset(); // inicia com mana cheia
    }

    reset() {
        this.currentMana = this.maxMana; // repõe mana ao valor máximo
    }

    canSpend(cost) {
        return cost <= this.currentMana; // verifica se há mana suficiente
    }

    spend(cost) {
        if (!this.canSpend(cost)) return false; // não gasta se for insuficiente
        this.currentMana -= cost; // reduz mana pelo custo da carta
        return true; // gasto bem-sucedido
    }

    restore(amount) {
        this.currentMana = Math.min(this.currentMana + amount, this.maxMana); // restaura mana até o máximo
    }

    refill() {
        this.currentMana = this.maxMana; // enche a mana no final do turno
    }

    get mana() {
        return this.currentMana; // valor atual de mana
    }
}
