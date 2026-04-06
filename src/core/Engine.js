import { Player } from '../entities/Player.js'; //Importa a lógica do herói [cite: 6]
import { InputHandler } from './InputHandler.js'; //Importa o leitor de teclado
import { SelectionScene } from '../scenes/SelectionScene.js'; //Importa a tela de escolha [cite: 93, 96]
import { CombatScene } from '../scenes/CombatScene.js'; //Importa a nova cena de combate
import { InventoryScene } from '../scenes/InventoryScene.js'; //Importa a janela de inventário
import { CardSystem } from '../mechanics/CardSystem.js'; //Importa o sistema das cartas
import { createBattleCharacter } from '../mechanics/DeckCharacters.js'; //Importa os decks de cada personagem
import { createWorldEnemies, createBattleEnemy } from '../mechanics/Enemies.js'; //Importa inimigos do jogo
import { Physics } from '../utils/Physics.js'; //Importa o sistema de física
import { InitialScene } from '../scenes/InitialScene.js';

export class Engine {
    constructor(canvasId) {
        this.cardSystem = null; // Referência ao sistema de cartas ativo durante batalha
        this.battlePlayer = null; // Personagem do jogador usado na batalha de cartas
        this.battleEnemy = null; // Inimigo atual do duelo
        this.canvas = document.getElementById(canvasId); //Busca o canvas no HTML
        this.ctx = this.canvas.getContext('2d'); //Ativa o modo de desenho 2D
        this.initialScene = new InitialScene(this); //Instancia a cena inicial [cite: 93]
        this.selectionScene = new SelectionScene(this); //Instancia a cena de seleção [cite: 93]
        this.inventoryScene = new InventoryScene(this); // Instancia a janela de inventário
        this.player = null; //O herói começa vazio até a escolha [cite: 6]
        this.input = null; //O teclado liga após a seleção
        this.selectedCharacter = null; //Armazena o herói escolhido [cite: 96]
        this.battleEndTimeout = null; // Timeout usado para voltar à exploração após o fim da batalha
        this.gameState = 'INITIAL'; //Começa na tela de seleção [cite: 93]
        this.memoryFragments = 0; // Fragmentos de Memória acumulados
        this.inventory = [
            { id: 1, name: 'Varinha Flamejante', type: 'weapon', desc: '+2 em cartas attack', bonus: { attack: 2 } },
            { id: 2, name: 'Peitoral de Éter', type: 'armor', desc: '+5 HP máximo e +1 em defesa', bonus: { maxHealth: 5, defense: 1 } },
            { id: 3, name: 'Anel do Fluxo', type: 'relic', desc: '+2 Mana máxima por turno', bonus: { maxMana: 2, manaRegen: 5 } },
            { id: 4, name: 'Poção de Vida', type: 'consumable', desc: 'Recupera 10 de vida ao usar.' },
            null, null, null, null,
            null, null, null, null,
            null, null, null, null
        ];
        this.equipment = { weapon: null, armor: null, relic: null };
        this.canvas.width = 1280; //Largura do campo de visão
        this.canvas.height = 720; //Altura do campo de visão
        this.lastTime = 0; //Marca o tempo do frame anterior

        // Inicializa o sistema de física
        this.physics = new Physics(0.5);
        this.setupPlatforms();

        this.combatScene = new CombatScene(this); // Instancia cena de combate
        this.worldEnemies = createWorldEnemies(); // Gerencia inimigos no cenário externo
        this.pendingCombatEnemy = null;
        this.combatEnter = { active: false, progress: 0, duration: 600 }; // Transição de batalha

        this.initEventListeners(); //Ativa a escuta de cliques
    }

    // Configura as plataformas flutuantes
    setupPlatforms() {
        // Plataforma principal no chão
        this.physics.addPlatform(0, 600, 1280, 120);

        // Plataformas flutuantes
        this.physics.addPlatform(300, 500, 200, 20);  // Plataforma média
        this.physics.addPlatform(600, 400, 150, 20);  // Plataforma alta
        this.physics.addPlatform(900, 350, 180, 20);  // Plataforma mais alta
        this.physics.addPlatform(200, 300, 120, 20);  // Plataforma esquerda alta
        this.physics.addPlatform(1000, 250, 160, 20); // Plataforma direita muito alta
        this.physics.addPlatform(450, 200, 140, 20);  // Plataforma central alta
    }

    initEventListeners() {
        // Movimento do mouse: rastreia posição para hover
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });

        // Clique do mouse no canvas: usado para selecionar personagem ou clicar em cartas
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect(); //Pega a posição do canvas na tela
            const mouseX = e.clientX - rect.left; //Calcula X real dentro do jogo
            const mouseY = e.clientY - rect.top; //Calcula Y real dentro do jogo

            if (this.gameState === 'INITIAL') {
                this.initialScene.handleInput(mouseX, mouseY); //Envia o clique para a cena inicial
            } else if (this.gameState === 'SELECTION') {
                this.selectionScene.handleInput(mouseX, mouseY); //Envia o clique para a cena [cite: 96]
            } else if (this.gameState === 'BATTLE') {
                this.handleCardClick(mouseX, mouseY); //Processa clique nas cartas durante batalha
            } else if (this.gameState === 'INVENTORY') {
                this.inventoryScene.handleInput(mouseX, mouseY);
            }
        });

        // Teclas pressionadas: dispara ações de batalha, abre inventário ou inicia batalha em exploração
        window.addEventListener('keydown', (e) => {

            if (keysToBlock.includes(e.code)) {
                e.preventDefault(); // Impede a tela de "pular" ou mexer
            if (this.gameState === 'EXPLORATION' && e.code === 'KeyI') {
                this.openInventory();
                return;
            }

            if (this.gameState === 'INVENTORY' && e.code === 'Escape') {
                this.closeInventory();
                return;
            }

            if (this.gameState === 'BATTLE') {
                this.handleBattleInput(e); // Durante a batalha, processa comandos de cartas
            }
        });
    }

    handleCardClick(mouseX, mouseY) {
        // Dimensões das cartas conforme definidas em CombatScene.draw()
        const cardWidth = 220;
        const cardHeight = 180;
        const gap = 20;
        const startX = 40;
        const startY = 500;

        // Verifica se o clique está dentro da área das cartas (entre startY e startY + cardHeight)
        if (mouseY < startY || mouseY > startY + cardHeight) {
            return; // Clique fora da área das cartas
        }

        // Calcula qual carta foi clicada
        if (this.cardSystem && this.cardSystem.hand) {
            for (let index = 0; index < this.cardSystem.hand.length; index++) {
                const cardX = startX + index * (cardWidth + gap);
                const cardEndX = cardX + cardWidth;

                // Verifica se o clique está dentro dos limites da carta
                if (mouseX >= cardX && mouseX <= cardEndX) {
                    // Encontrou a carta clicada, tenta jogá-la
                    const result = this.cardSystem.playCard(index);
                    if (!result.success) {
                        this.cardSystem.addMessage(result.message); // Mensagem de erro
                    }
                    return;
                }
            }
        }
    }

    update(deltaTime) {
        // Atualiza a lógica do jogo dependendo do estado atual
         if (this.gameState === 'INITIAL') {
            this.initialScene.update(deltaTime);
        } else if (this.gameState === 'SELECTION') {
            this.selectionScene.update(deltaTime); //Atualiza lógica da seleção [cite: 93]
        } else if (this.gameState === 'EXPLORATION') {
            if (!this.player) {
                this.player = new Player(this.selectedCharacter.color, this.physics); //Cria o herói com sua cor e física
                this.input = new InputHandler(this, this.player);//Ativa os comandos
            }
            this.player.update(); //Processa gravidade e movimento [cite: 10, 22]

            // Atualiza inimigos e busca colisões com o player
            for (const enemy of this.worldEnemies) {
                if (!enemy.active) continue;
                enemy.update(this.player, this.physics);

                if (this.physics.checkCollision(this.player, enemy) && !this.combatEnter.active) {
                    this.pendingCombatEnemy = enemy;
                    this.combatEnter.active = true;
                    this.combatEnter.progress = 0;
                }
            }

            if (this.combatEnter.active) {
                this.combatEnter.progress += deltaTime;
                if (this.combatEnter.progress >= this.combatEnter.duration) {
                    this.combatEnter.active = false;
                    this.startBattle();
                }
            }
        } else if (this.gameState === 'BATTLE') {
            this.combatScene.update(deltaTime);
        } else if (this.gameState === 'INVENTORY') {
            // inventário permanece estático enquanto aberto
        }
    }

    startBattle() {
        // Limpa qualquer retorno pendente para evitar múltiplos timeouts
        if (this.battleEndTimeout) {
            clearTimeout(this.battleEndTimeout);
            this.battleEndTimeout = null;
        }

        // Cria as entidades de combate com o deck correto para o personagem escolhido
        this.battlePlayer = createBattleCharacter(this.selectedCharacter.name, this.selectedCharacter.color);

        const template = this.pendingCombatEnemy ? this.pendingCombatEnemy.template : null;
        this.battleEnemy = createBattleEnemy(template);
        this.applyEquipmentToBattlePlayer(this.battlePlayer);
        this.cardSystem = new CardSystem(this.battlePlayer, this.battleEnemy, this.battlePlayer.manaManager);

        this.gameState = 'BATTLE'; // Entra no estado de batalha
        this.combatScene.start(this.cardSystem); // Inicia cena de batalha com animação e baralhos
        this.combatScene.onBattleEnd = this.handleBattleEnd.bind(this);
    }

    handleBattleEnd(result) {
        if (result.winner === 'player') {
            this.memoryFragments += typeof result.reward === 'number' ? result.reward : 0;
            this.scheduleReturnToExploration();
        } else if (result.winner === 'enemy') {
            this.resetAfterDefeat();
        }
    }

    openInventory() {
        this.gameState = 'INVENTORY';
    }

    closeInventory() {
        this.gameState = 'EXPLORATION';
    }

    applyEquipmentToBattlePlayer(player) {
        const equip = this.equipment;
        if (!player) return;

        player.weaponBonus = equip.weapon?.bonus?.attack || 0;
        player.defenseBonus = equip.armor?.bonus?.defense || 0;
        player.maxHealth += equip.armor?.bonus?.maxHealth || 0;
        player.manaManager.maxMana += equip.relic?.bonus?.maxMana || 0;
        player.alwaysMaxMana = Boolean(equip.relic?.bonus?.alwaysMaxMana);
        player.manaRegen = equip.relic?.bonus?.manaRegen || 0;
    }

    handleBattleInput(e) {
        // Jogar uma carta ao pressionar teclas numéricas 1-5
        if (e.code.startsWith('Digit')) {
            const slotIndex = Number(e.key) - 1;
            if (!Number.isNaN(slotIndex)) {
                const result = this.cardSystem.playCard(slotIndex);
                if (!result.success) {
                    this.cardSystem.addMessage(result.message); // Mensagem de erro (mana insuficiente, carta inválida, etc.)
                }
            }
        }

        // Comprar cartas
        if (e.code === 'KeyR') {
            this.cardSystem.buyCard();
        }

        // Finalizar turno e permitir reação do inimigo
        if (e.code === 'KeyE') {
            this.cardSystem.endTurn();
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); //Limpa o rastro anterior
        
        if (this.gameState === 'INITIAL') {
            this.initialScene.draw(this.ctx);
        } else if (this.gameState === 'SELECTION') {
            this.drawSelection();
        } else if (this.gameState === 'EXPLORATION') {
            this.drawExploration();
        } else if (this.gameState === 'BATTLE') {
            this.combatScene.draw(this.ctx);
        } else if (this.gameState === 'INVENTORY') {
            this.inventoryScene.draw(this.ctx);
        }
    }

    drawSelection() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); //Limpa o rastro anterior

        if (this.gameState === 'INITIAL') {
            this.initialScene.draw(this.ctx);
        } else if (this.gameState === 'SELECTION') {
            this.drawSelection();
        } else if (this.gameState === 'EXPLORATION') {
            this.drawExploration();
        } else if (this.gameState === 'BATTLE') {
            this.combatScene.draw(this.ctx);
        }
    }

    drawSelection() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); //Limpa o rastro anterior

        if (this.gameState === 'SELECTION') {
            this.selectionScene.draw(this.ctx);
        } else if (this.gameState === 'EXPLORATION') {
            this.drawExploration();

            // Transição de combate: zoom dramático + dark overlay
            if (this.combatEnter.active) {
                const p = Math.min(this.combatEnter.progress / this.combatEnter.duration, 1);
                const alpha = 0.3 + 0.5 * p;
                this.ctx.fillStyle = `rgba(0,0,0,${alpha})`;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

                const zoom = 1 + 0.2 * p;
                const focusX = this.player && this.pendingCombatEnemy
                    ? (this.player.x + this.pendingCombatEnemy.x) / 2
                    : this.canvas.width / 2;
                const focusY = this.player && this.pendingCombatEnemy
                    ? (this.player.y + this.pendingCombatEnemy.y) / 2
                    : this.canvas.height / 2;

                this.ctx.save();
                this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
                this.ctx.scale(zoom, zoom);
                this.ctx.translate(-focusX, -focusY);
                this.drawExploration(); // redesenha com zoom focado
                this.ctx.restore();
            }
        } else if (this.gameState === 'BATTLE') {
            this.combatScene.draw(this.ctx);
        } else if (this.gameState === 'INVENTORY') {
            this.inventoryScene.draw(this.ctx);
        }
    }

    drawExploration() {
        this.ctx.fillStyle = '#FFFFFF'; //Fundo do Silêncio Branco [cite: 2]
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); //Pinta o fundo [cite: 3]

        // Desenha as plataformas
        this.physics.drawPlatforms(this.ctx);

        // Desenha inimigos de exploração
        for (const enemy of this.worldEnemies) {
            if (enemy.active) {
                enemy.draw(this.ctx);
            }
        }

        if (this.player) this.player.draw(this.ctx); //Desenha o herói atual [cite: 6]

        this.ctx.fillStyle = 'black'; //Cor das letras
        this.ctx.textAlign = 'left'; //Alinhamento à esquerda
        this.ctx.font = 'bold 20px Arial'; //Fonte do status
        this.ctx.fillText(`Herói: ${this.selectedCharacter.name}`, 20, 40); //Nome do herói [cite: 6]
        this.ctx.fillText(`Setor: Caminho de Vidro e Ossos`, 20, 70); //Localização [cite: 12]
        this.ctx.fillText(`Fragmentos: ${this.memoryFragments}`, 20, 100);
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Pressione I para abrir o inventário.', 20, 130);

        if (this.combatEnter.active) {
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.65)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.fillText('Iniciando batalha!', this.canvas.width / 2 - 250, 180);
        }
    }

    scheduleReturnToExploration() {
        // Aguarda um momento após o fim da batalha antes de retornar ao modo exploração
        if (this.battleEndTimeout) {
            clearTimeout(this.battleEndTimeout);
        }
        this.battleEndTimeout = setTimeout(() => {
            if (this.cardSystem && this.cardSystem.winner === 'player' && this.pendingCombatEnemy) {
                this.pendingCombatEnemy.active = false; // Inimigo foi derrotado
            }
            this.pendingCombatEnemy = null;
            this.gameState = 'EXPLORATION'; // Volta ao mundo de exploração
            this.battleEndTimeout = null;
        }, 1200);
    }

    resetAfterDefeat() {
        if (this.player) {
            this.player.x = 100;
            this.player.y = 500;
            this.player.velocityX = 0;
            this.player.velocityY = 0;
        }

        if (this.cardSystem) {
            this.cardSystem.resetCombat();
        }

        if (this.combatScene) {
            this.combatScene.start(this.cardSystem);
            this.combatScene.onBattleEnd = this.handleBattleEnd.bind(this);
        }
    }

    async init() { this.start(); } //Inicia o loop

    start() { requestAnimationFrame(this.loop.bind(this)); } //Inicia animação

    loop(timestamp) {
        const deltaTime = timestamp - this.lastTime; //Mede o tempo
        this.lastTime = timestamp; //Atualiza tempo
        this.update(deltaTime); //Lógica
        this.draw(); //Desenho
        requestAnimationFrame(this.loop.bind(this)); //Próximo frame
    }
}