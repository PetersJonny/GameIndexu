import { AssetLoader } from '../utils/AssetLoader.js'; //Importa o carregador de desenhos
import { Player } from '../entities/Player.js'; //Importa a lógica da Íris/Atom
import { InputHandler } from './InputHandler.js'; //Importa o leitor de teclado

export class Engine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId); //Busca o canvas no HTML
        this.ctx = this.canvas.getContext('2d'); //Ativa o modo de desenho 2D
        this.loader = new AssetLoader(); //Cria a instância do carregador
        this.player = new Player(); //Cria o herói na plataforma inicial [cite: 3]
        this.input = new InputHandler(this.player); //Conecta o teclado ao herói
        this.lastTime = 0; //Armazena o tempo do último quadro
        this.gameState = 'EXPLORATION'; //Define o estado inicial como exploração [cite: 10]
        this.canvas.width = 1280; //Define a largura da tela de Marah
        this.canvas.height = 720; //Define a altura da tela de Marah
    }

    async init() {
        // Espaço reservado para as spritesheets feitas à mão futuramente
        // await this.loader.loadImage('player_sprite', '/assets/sprites/hero.png'); //Carregará a arte
        this.start();//Inicia o loop do jogo
    }

    start() {
        requestAnimationFrame(this.loop.bind(this)); //Chama o próximo quadro de animação
    }

    loop(timestamp) {
        const deltaTime = timestamp - this.lastTime; //Calcula a diferença de tempo
        this.lastTime = timestamp; //Atualiza o tempo atual
        this.update(deltaTime); //Processa a lógica (gravidade, movimento)
        this.draw(); //Desenha tudo na tela
        requestAnimationFrame(this.loop.bind(this)); //Mantém o jogo rodando a 60 FPS
    }

    update(deltaTime) {
        if (this.gameState === 'EXPLORATION') {
            this.player.update(); //Atualiza a física do herói no Vazio [cite: 13]
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); //Limpa a tela anterior
        this.ctx.fillStyle = '#FFFFFF'; //Define a cor do "Silêncio Branco" [cite: 2]
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); //Pinta o fundo de branco

        // Desenha o chão da plataforma de pedra [cite: 3]
        this.ctx.fillStyle = '#444444'; //Cor cinza para a pedra
        this.ctx.fillRect(0, 600, this.canvas.width, 120); //Desenha a plataforma base

        this.player.draw(this.ctx); //Desenha o herói (atualmente um retângulo azul)

        this.ctx.fillStyle = 'black'; //Cor do texto de debug
        this.ctx.fillText(`Estado: ${this.gameState}`, 20, 30); //Mostra se estamos explorando ou lutando
    }
}