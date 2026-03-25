import { Player } from '../entities/Player.js'; //Importa a lógica do herói [cite: 6]
import { InputHandler } from './InputHandler.js'; //Importa o leitor de teclado
import { SelectionScene } from '../scenes/SelectionScene.js'; //Importa a tela de escolha [cite: 93, 96]

export class Engine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId); //Busca o canvas no HTML
        this.ctx = this.canvas.getContext('2d'); //Ativa o modo de desenho 2D
        this.selectionScene = new SelectionScene(this); //Instancia a cena de seleção [cite: 93]
        this.player = null; //O herói começa vazio até a escolha [cite: 6]
        this.input = null; //O teclado liga após a seleção
        this.selectedCharacter = null; //Armazena o herói escolhido [cite: 96]
        this.gameState = 'SELECTION'; //Começa na tela de seleção [cite: 93]
        this.canvas.width = 1280; //Largura do campo de visão
        this.canvas.height = 720; //Altura do campo de visão
        this.lastTime = 0; //Marca o tempo do frame anterior

        this.initEventListeners(); //Ativa a escuta de cliques
    }

    initEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect(); //Pega a posição do canvas na tela
            const mouseX = e.clientX - rect.left; //Calcula X real dentro do jogo
            const mouseY = e.clientY - rect.top; //Calcula Y real dentro do jogo

            if (this.gameState === 'SELECTION') {
                this.selectionScene.handleInput(mouseX, mouseY); //Envia o clique para a cena [cite: 96]
            }
        });
    }

    update(deltaTime) {
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

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); //Limpa o rastro anterior

        if (this.gameState === 'SELECTION') {
            this.selectionScene.draw(this.ctx); //Desenha os personagens e títulos [cite: 93]
        } else if (this.gameState === 'EXPLORATION') {
            this.drawExploration(); //Desenha o mundo e status [cite: 3, 14]
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