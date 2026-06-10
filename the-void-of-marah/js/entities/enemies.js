class Enemy {
  constructor(name, hp, attack, defense) {
    this.name = typeof name === "string" && name.length ? name : "Enemy";
    this.maxHp = Math.max(1, hp);
    this.hp = this.maxHp;
    this.attack = Math.max(0, attack);
    this.defense = Math.max(0, defense);
  }

  get isAlive() {
    return this.hp > 0;
  }

  get hpRatio() {
    return this.maxHp === 0 ? 0 : this.hp / this.maxHp;
  }

  takeDamage(amount) {
    const damage = Math.max(1, Math.round(amount));
    this.hp = Math.max(0, this.hp - damage);
    return damage;
  }

  receiveAttack(attackValue) {
    return this.takeDamage(attackValue - this.defense);
  }

  heal(amount) {
    const healed = Math.max(0, Math.round(amount));
    this.hp = Math.min(this.maxHp, this.hp + healed);
    return healed;
  }

  attackValue(danoHabilidade = 0) {
    return this.attack + danoHabilidade;
  }

  attack(target, danoHabilidade = 0) {
    return target.receiveAttack(this.attackValue(danoHabilidade));
  }

  resetHp() {
    this.hp = this.maxHp;
  }
}