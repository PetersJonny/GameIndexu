export class Player {
    constructor(color, physics) {
        this.x = 100; //Posição horizontal inicial no Vazio [cite: 3]
        this.y = 500; //Posição vertical inicial acima da plataforma
        this.width = 50; //Largura do retângulo (espaço para sua sprite futura)
        this.height = 80; //Altura do retângulo (espaço para sua sprite futura)
        this.color = color; //Cor definida pela escolha na SelectionScene

        this.velocityX = 0; //Velocidade lateral atual
        this.velocityY = 0; //Velocidade vertical (gravidade/pulo)
        this.speed = 5; //Velocidade de caminhada pelo cenário
        this.jumpForce = -12; //Força do impulso para desafiar a gravidade [cite: 10]
        this.isGrounded = false; //Verifica se o herói está tocando o chão de pedra [cite: 5]

        this.physics = physics; // Sistema de física
    }

    update() {
        // Aplica física usando o sistema Physics.js
        if (this.physics) {
            this.physics.applyPhysics(this);
        } else {
            // Fallback para física básica se não houver sistema de física
            this.velocityY += 0.5; // Gravidade básica
            this.y += this.velocityY;
            this.x += this.velocityX;

            // Colisão básica com o chão
            if (this.y + this.height > 600) {
                this.y = 600 - this.height;
                this.velocityY = 0;
                this.isGrounded = true;
            }
        }
    }

    draw(ctx) {
        // Desenha o retângulo colorido representando o doidão escolhido [cite: 80-85]
        ctx.fillStyle = this.color; //Define a cor (Fogo, Metal, Madeira, etc)
        ctx.fillRect(this.x, this.y, this.width, this.height); //Pinta o personagem na tela

        // Espaço reservado para o desenho feito à mão futuramente
        // ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    }

    jump() {
        if (this.isGrounded) {
            this.velocityY = this.jumpForce; //Aplica o impulso para cima
            this.isGrounded = false; //O herói agora está no ar [cite: 10]
        }
    }
}