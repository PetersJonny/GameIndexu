export class InputHandler { // Define e exporta a classe para que possa ser usada em outros arquivos do jogo
    constructor(engine, player) { // O construtor recebe o motor e o jogador para que possa modificá-lo
        this.engine = engine;
        this.player = player; // Armazena a referência do jogador dentro da classe

        // Escuta quando uma tecla é pressionada
        window.addEventListener('keydown', (e) => {
            if (this.engine.gameState !== 'EXPLORATION') return; // não responde fora da exploração

            // Se a tecla for 'A', define a velocidade horizontal para a esquerda (negativa)
            if (e.code === 'KeyA') this.player.velocityX = -this.player.speed;

            // Se a tecla for 'D', define a velocidade horizontal para a direita (positiva)
            if (e.code === 'KeyD') this.player.velocityX = this.player.speed;

            // Se a tecla for 'Espaço', chama o método de pulo do jogador
            if (e.code === 'Space') this.player.jump();
        });

        // Escuta quando uma tecla é solta
        window.addEventListener('keyup', (e) => {
            if (this.engine.gameState !== 'EXPLORATION') return;

            // Se soltar 'A' ou 'D', zera a velocidade horizontal para o jogador parar de andar
            if (e.code === 'KeyA' || e.code === 'KeyD') this.player.velocityX = 0;
        });
    }
}