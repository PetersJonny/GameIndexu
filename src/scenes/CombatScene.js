export class CombatScene {
    constructor(engine) {
        this.engine = engine;
        this.cardSystem = null;
        this.transition = {
            active: false,
            progress: 0,
            duration: 800
        };
        this.victoryEffect = {
            active: false,
            progress: 0,
            duration: 1200,
            reward: 0
        };
        this.defeatEffect = {
            active: false,
            progress: 0,
            duration: 1200
        };
        this.onBattleEnd = null;
        this.endSequenceStarted = false;
    }

    start(cardSystem) {
        this.cardSystem = cardSystem;
        this.cardSystem.resetCombat(); // Garante 5 cartas iniciais
        this.transition.active = true;
        this.transition.progress = 0;
        this.victoryEffect.active = false;
        this.victoryEffect.progress = 0;
        this.defeatEffect.active = false;
        this.defeatEffect.progress = 0;
        this.endSequenceStarted = false;
    }

    update(deltaTime) {
        if (!this.cardSystem) return;

        if (this.transition.active) {
            this.transition.progress += deltaTime;
            if (this.transition.progress >= this.transition.duration) {
                this.transition.active = false;
                this.transition.progress = this.transition.duration;
            }
        }

        if (this.cardSystem.isBattleOver() && !this.endSequenceStarted) {
            this.endSequenceStarted = true;
            if (this.cardSystem.winner === 'player') {
                this.startVictoryEffect();
            } else if (this.cardSystem.winner === 'enemy') {
                this.startDefeatEffect();
            }
        }

        if (this.victoryEffect.active) {
            this.victoryEffect.progress += deltaTime;
            if (this.victoryEffect.progress >= this.victoryEffect.duration) {
                this.victoryEffect.active = false;
                if (typeof this.onBattleEnd === 'function') {
                    this.onBattleEnd({ winner: 'player', reward: this.victoryEffect.reward });
                }
            }
        }

        if (this.defeatEffect.active) {
            this.defeatEffect.progress += deltaTime;
            if (this.defeatEffect.progress >= this.defeatEffect.duration) {
                this.defeatEffect.active = false;
                if (typeof this.onBattleEnd === 'function') {
                    this.onBattleEnd({ winner: 'enemy' });
                }
            }
        }
    }

    startVictoryEffect() {
        const rewardRange = this.cardSystem.enemy.rewardRange || [3, 3];
        const minReward = rewardRange[0];
        const maxReward = rewardRange[1];
        this.victoryEffect.reward = minReward === maxReward
            ? minReward
            : Math.floor(Math.random() * (maxReward - minReward + 1)) + minReward;
        this.victoryEffect.active = true;
        this.victoryEffect.progress = 0;
    }

    startDefeatEffect() {
        this.defeatEffect.active = true;
        this.defeatEffect.progress = 0;
    }

    draw(ctx) {
        if (!this.cardSystem) return;

        // Tela de combate escurecida durante a transição
        if (this.transition.active) {
            const alpha = Math.min(this.transition.progress / this.transition.duration, 1);
            ctx.save();
            ctx.fillStyle = `rgba(0, 0, 0, ${0.6 * alpha})`;
            ctx.fillRect(0, 0, this.engine.canvas.width, this.engine.canvas.height);
            ctx.restore();
        }

        // Fundo de batalha estático
        ctx.fillStyle = '#11111A';
        ctx.fillRect(0, 0, this.engine.canvas.width, this.engine.canvas.height);

        const cs = this.cardSystem;

        // Topo: Inimigo
        const topBarHeight = 100;
        ctx.fillStyle = '#2C1F2F';
        ctx.fillRect(0, 0, this.engine.canvas.width, topBarHeight);

        ctx.fillStyle = '#FF6666';
        const enemyHealthPct = cs.enemyMaxHealth > 0 ? cs.enemyHealth / cs.enemyMaxHealth : 0;
        ctx.fillRect(240, 30, 600 * enemyHealthPct, 20);
        ctx.strokeStyle = '#700000';
        ctx.strokeRect(240, 30, 600, 20);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '20px Arial';
        ctx.fillText(cs.enemy ? cs.enemy.name : 'Inimigo', 40, 30);
        ctx.fillText(`HP: ${cs.enemyHealth} / ${cs.enemyMaxHealth}`, 240, 58);

        // Esquerda: Jogador
        ctx.fillStyle = '#223322';
        ctx.fillRect(0, topBarHeight, 260, 190);

        // Vida
        ctx.fillStyle = '#22CC22';
        const playerHealthPct = cs.playerMaxHealth > 0 ? cs.playerHealth / cs.playerMaxHealth : 0;
        ctx.fillRect(20, topBarHeight + 20, 220 * playerHealthPct, 24);
        ctx.strokeStyle = '#114411';
        ctx.strokeRect(20, topBarHeight + 20, 220, 24);

        // Mana
        ctx.fillStyle = '#3EE5E5';
        const manaPct = cs.maxMana > 0 ? cs.mana / cs.maxMana : 0;
        ctx.fillRect(20, topBarHeight + 60, 220 * manaPct, 24);
        ctx.strokeStyle = '#0E6060';
        ctx.strokeRect(20, topBarHeight + 60, 220, 24);

        // Escudo
        ctx.fillStyle = '#4DA6FF';
        const armorPct = cs.playerMaxHealth > 0 ? cs.playerArmor / cs.playerMaxHealth : 0;
        ctx.fillRect(20, topBarHeight + 100, 220 * Math.min(armorPct, 1), 24);
        ctx.strokeStyle = '#003F7F';
        ctx.strokeRect(20, topBarHeight + 100, 220, 24);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '16px Arial';
        ctx.fillText(`Vida: ${cs.playerHealth} / ${cs.playerMaxHealth}`, 20, topBarHeight + 18);
        ctx.fillText(`Mana: ${cs.mana} / ${cs.maxMana}`, 20, topBarHeight + 58);
        ctx.fillText(`Escudo: ${cs.playerArmor}`, 20, topBarHeight + 98);

        const battleOver = this.victoryEffect.active || this.defeatEffect.active;

        if (!battleOver) {
            // Área de cartas no rodapé
            const footerTop = 480;
            ctx.fillStyle = '#222731';
            ctx.fillRect(0, footerTop, this.engine.canvas.width, this.engine.canvas.height - footerTop);

            const cardWidth = 220;
            const cardHeight = 180;
            const cardGap = 20;
            const cardStartX = 40;
            const cardY = footerTop + 20;

            cs.hand.forEach((card, index) => {
                const x = cardStartX + index * (cardWidth + cardGap);
                const borderColor = cs.getCardRarityColor(card) || '#FFFFFF';

                ctx.fillStyle = '#3A3A4F';
                ctx.fillRect(x, cardY, cardWidth, cardHeight);
                ctx.strokeStyle = borderColor;
                ctx.lineWidth = 3;
                ctx.strokeRect(x, cardY, cardWidth, cardHeight);

                ctx.fillStyle = '#FFFFFF';
                ctx.font = '18px Arial';
                ctx.fillText(card.name, x + 10, cardY + 28);
                ctx.font = '16px Arial';
                ctx.fillText(`Custo: ${card.cost}`, x + 10, cardY + 58);

                let effectDesc = '';
                switch (card.type) {
                    case 'attack':
                        effectDesc = `Dano: ${card.value}`;
                        break;
                    case 'defend':
                        effectDesc = `Defesa: ${card.value}`;
                        break;
                    case 'heal':
                        effectDesc = `Cura: ${card.value}`;
                        break;
                    case 'mana':
                        effectDesc = `Mana recuperada: ${card.value}`;
                        break;
                    default:
                        effectDesc = `Valor: ${card.value}`;
                }

                ctx.fillText(effectDesc, x + 10, cardY + 90);
                ctx.fillText(card.desc, x + 10, cardY + 120, cardWidth - 20);
            });

            // Log central
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(320, topBarHeight + 20, 560, 180);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '16px Arial';
            ctx.fillText('Log de combate:', 330, topBarHeight + 42);

            cs.messages.forEach((message, i) => {
                ctx.fillText(message, 330, topBarHeight + 70 + i * 24);
            });

            // Instruções
            ctx.fillStyle = '#CCCCCC';
            ctx.font = '14px Arial';
            ctx.fillText('Clique ou use 1-5: jogar carta | R: comprar | E: terminar turno', 380, this.engine.canvas.height - 20);
        }

        if (this.victoryEffect.active) {
            const alpha = Math.min(this.victoryEffect.progress / this.victoryEffect.duration, 1);
            ctx.fillStyle = `rgba(230, 230, 230, ${0.9 * alpha})`;
            ctx.fillRect(0, 0, this.engine.canvas.width, this.engine.canvas.height);
            ctx.fillStyle = '#4A4A4A';
            ctx.font = '28px Arial';
            ctx.fillText('O inimigo se dissolve em poeira cinzenta...', 240, 280);
            ctx.font = '24px Arial';
            ctx.fillText(`+${this.victoryEffect.reward} Fragmentos de Memória`, 240, 340);
        }

        if (this.defeatEffect.active) {
            const alpha = Math.min(this.defeatEffect.progress / this.defeatEffect.duration, 1);
            ctx.fillStyle = `rgba(50, 0, 0, ${0.9 * alpha})`;
            ctx.fillRect(0, 0, this.engine.canvas.width, this.engine.canvas.height);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '32px Arial';
            ctx.fillText('Você foi derrotado...', 420, 280);
            ctx.font = '22px Arial';
            ctx.fillText('Reiniciando encontro para uma nova estratégia...', 230, 340);
        }

        // Mensagem se batalha acabou
        if (cs.isBattleOver() && !battleOver) {
            const status = cs.winner === 'player' ? 'Você venceu!' : 'Você foi derrotado...';
            ctx.font = '32px Arial';
            ctx.fillStyle = '#FFD700';
            ctx.fillText(status, 420, 420);
        }
    }
}