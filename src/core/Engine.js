import { Player } from '../entities/Player.js'; //Importa a lógica do herói [cite: 6]
import { InputHandler } from './InputHandler.js'; //Importa o leitor de teclado
import { SelectionScene } from '../scenes/SelectionScene.js'; //Importa a tela de escolha [cite: 93, 96]
import { CardSystem } from '../mechanics/CardSystem.js'; //Importa o sistema das cartas
import { ManaManager } from '../mechanics/ManaManager.js'; //Importa o gerenciamento da mana
import { createBattleCharacter, DefaultEnemy } from '../mechanics/DeckCharacters.js'; //Importa os decks de cada personagem

export class Engine {
    constructor(canvasId) {
        this.manaManager = new ManaManager(18); //Define a quantidade de mana inicial
        this.cardSystem = null; // Referência ao sistema de cartas ativo durante batalha
        this.battlePlayer = null; // Personagem do jogador usado na batalha de cartas
        this.battleEnemy = null; // Inimigo atual do duelo
        this.canvas = document.getElementById(canvasId); //Busca o canvas no HTML
        this.ctx = this.canvas.getContext('2d'); //Ativa o modo de desenho 2D
        this.selectionScene = new SelectionScene(this); //Instancia a cena de seleção [cite: 93]
        this.player = null; //O herói começa vazio até a escolha [cite: 6]
        this.input = null; //O teclado liga após a seleção
        this.selectedCharacter = null; //Armazena o herói escolhido [cite: 96]
        this.battleEndTimeout = null; // Timeout usado para voltar à exploração após o fim da batalha
        this.gameState = 'SELECTION'; //Começa na tela de seleção [cite: 93]
        this.canvas.width = 1280; //Largura do campo de visão
        this.canvas.height = 720; //Altura do campo de visão
        this.lastTime = 0; //Marca o tempo do frame anterior

        this.initEventListeners(); //Ativa a escuta de cliques
    }

    initEventListeners() {
        // Clique do mouse no canvas: usado apenas para selecionar personagem na tela inicial
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect(); //Pega a posição do canvas na tela
            const mouseX = e.clientX - rect.left; //Calcula X real dentro do jogo
            const mouseY = e.clientY - rect.top; //Calcula Y real dentro do jogo

            if (this.gameState === 'SELECTION') {
                this.selectionScene.handleInput(mouseX, mouseY); //Envia o clique para a cena [cite: 96]
            }
        });

        // Teclas pressionadas: dispara ações de batalha ou inicia batalha em exploração
        window.addEventListener('keydown', (e) => {
            if (this.gameState === 'EXPLORATION' && e.code === 'KeyB') {
                this.startBattle(); // No mundo, B inicia um duelo
            }

            if (this.gameState === 'BATTLE') {
                this.handleBattleInput(e); // Durante a batalha, processa comandos de cartas
            }
        });
    }

    update(deltaTime) {
        // Atualiza a lógica do jogo dependendo do estado atual
        if (this.gameState === 'SELECTION') {
            this.selectionScene.update(); //Atualiza lógica da seleção [cite: 93]
        } else if (this.gameState === 'EXPLORATION') {
            if (!this.player) {
                this.player = new Player(this.selectedCharacter.color); //Cria o herói com sua cor
                this.input = new InputHandler(this.player);//Ativa os comandos
            }
            this.player.update(); //Processa gravidade e movimento [cite: 10, 22]
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
        this.battleEnemy = new DefaultEnemy();
        this.cardSystem = new CardSystem(this.battlePlayer, this.battleEnemy, this.manaManager);

        this.gameState = 'BATTLE'; // Entra no estado de batalha
        this.cardSystem.resetCombat(); // Prepara decks, mão e mana para o duelo
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

        // Comprar cartas para completar a mão
        if (e.code === 'KeyR') {
            this.cardSystem.drawCards(this.cardSystem.maxHandSize - this.cardSystem.hand.length);
            this.cardSystem.addMessage('Compra cartas para fortalecer sua mão.');
        }

        // Finalizar turno e permitir reação do inimigo
        if (e.code === 'KeyE') {
            this.cardSystem.endTurn();
        }

        // Se o duelo terminou, agenda retorno para exploração
        if (this.cardSystem.isBattleOver()) {
            this.cardSystem.addMessage('Duelo terminado.');
            this.scheduleReturnToExploration();
        }

        // Reiniciar duelo se pressionar B após o fim da batalha
        if (e.code === 'KeyB' && this.cardSystem.isBattleOver()) {
            this.startBattle();
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); //Limpa o rastro anterior

        if (this.gameState === 'SELECTION') {
            this.selectionScene.draw(this.ctx); //Desenha os personagens e títulos [cite: 93]
        } else if (this.gameState === 'EXPLORATION') {
            this.drawExploration(); //Desenha o mundo e status [cite: 3, 14]
        } else if (this.gameState === 'BATTLE') {
            this.drawBattle(); // Renderiza a interface de batalha de cartas
        }
    }

    drawExploration() {
        this.ctx.fillStyle = '#FFFFFF'; //Fundo do Silêncio Branco [cite: 2]
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); //Pinta o fundo [cite: 3]
        this.ctx.fillStyle = '#444444'; //Cor da plataforma de pedra [cite: 3]
        this.ctx.fillRect(0, 600, this.canvas.width, 120); //Desenha o chão [cite: 10]

        if (this.player) this.player.draw(this.ctx); //Desenha o herói atual [cite: 6]

        this.ctx.fillStyle = 'black'; //Cor das letras
        this.ctx.textAlign = 'left'; //Alinhamento à esquerda
        this.ctx.font = 'bold 20px Arial'; //Fonte do status
        this.ctx.fillText(`Herói: ${this.selectedCharacter.name}`, 20, 40); //Nome do herói [cite: 6]
        this.ctx.fillText(`Setor: Caminho de Vidro e Ossos`, 20, 70); //Localização [cite: 12]
        this.ctx.fillText('Pressione B para começar um duelo de cartas.', 20, 110);
    }

    scheduleReturnToExploration() {
        // Aguarda um momento após o fim da batalha antes de retornar ao modo exploração
        if (this.battleEndTimeout) {
            clearTimeout(this.battleEndTimeout);
        }
        this.battleEndTimeout = setTimeout(() => {
            this.gameState = 'EXPLORATION'; // Volta ao mundo de exploração
            this.battleEndTimeout = null;
        }, 1200);
    }

    drawBattle() {
        const cs = this.cardSystem; // Atalho para acesso rápido aos dados da batalha

        // Fundo da tela de batalha
        this.ctx.fillStyle = '#11111A';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Painel de status do jogador (vida, escudo, mana)
        this.ctx.fillStyle = '#222';
        this.ctx.fillRect(40, 40, 600, 140);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '22px Arial';
        this.ctx.fillText(`Vida Jogador: ${cs.playerHealth}/${cs.playerMaxHealth}`, 60, 75);
        this.ctx.fillText(`Escudo: ${cs.playerArmor}`, 60, 105);
        this.ctx.fillText(`Mana: ${cs.mana}/${cs.maxMana}`, 60, 135);

        // Exibe o status do inimigo no mesmo painel
        this.ctx.fillText(`Vida Inimigo: ${cs.enemyHealth}/${cs.enemyMaxHealth}`, 400, 75);
        this.ctx.fillText(`Escudo: ${cs.enemyArmor}`, 400, 105);

        // Área da mão do jogador
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(40, 220, 1200, 260);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Sua mão de cartas', 60, 255);

        const cardWidth = 220;
        const cardHeight = 180;
        const gap = 20;
        cs.hand.forEach((card, index) => {
            // Posiciona cada carta horizontalmente com espaçamento e sua cor por raridade
            const x = 60 + index * (cardWidth + gap);
            const y = 280;
            const rarityColor = cs.getCardRarityColor(card);
            const rarityLabel = cs.getCardRarity(card);
            this.ctx.fillStyle = '#2A2A3F';
            this.ctx.fillRect(x, y, cardWidth, cardHeight);
            this.ctx.strokeStyle = rarityColor;
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(x, y, cardWidth, cardHeight);
            this.ctx.lineWidth = 1;
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '18px Arial';
            this.ctx.fillText(`${index + 1}. ${card.name}`, x + 10, y + 30);
            this.ctx.font = '16px Arial';
            this.ctx.fillText(`Custo: ${card.cost}`, x + 10, y + 60);
            this.ctx.fillText(card.desc, x + 10, y + 90, cardWidth - 20);
            this.ctx.fillStyle = rarityColor;
            this.ctx.fillText(`Raridade: ${rarityLabel}`, x + 10, y + 160);
        });

        // Painel inferior com deck, descarte e comandos de teclado
        this.ctx.fillStyle = '#222';
        this.ctx.fillRect(40, 520, 1200, 140);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '18px Arial';
        this.ctx.fillText(`Deck: ${cs.deck.length} cartas | Descarte: ${cs.discardPile.length} cartas`, 60, 555);
        this.ctx.fillText('Teclas: 1-5 = jogar carta | R = comprar até 5 cartas | E = terminar turno | B = reiniciar', 60, 585);

        // Mensagens de combate exibidas no canto inferior
        this.ctx.fillStyle = '#0F0';
        this.ctx.font = '16px Arial';
        cs.messages.forEach((message, index) => {
            this.ctx.fillText(message, 60, 620 + index * 22);
        });

        // Exibe o resultado final se o duelo acabou
        if (cs.isBattleOver()) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = '28px Arial';
            const status = cs.winner === 'player' ? 'Você venceu!' : 'Você perdeu...';
            this.ctx.fillText(status, 60, 700);
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