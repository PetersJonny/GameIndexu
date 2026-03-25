export class Player {
    constructor(color) {
        this.x = 100; //Posição horizontal inicial no Vazio [cite: 3]
        this.y = 500; //Posição vertical inicial acima da plataforma
        this.width = 50; //Largura do retângulo (espaço para sua sprite futura)
        this.height = 80; //Altura do retângulo (espaço para sua sprite futura)
        this.color = color; //Cor definida pela escolha na SelectionScene

        this.velocityX = 0; //Velocidade lateral atual
        this.velocityY = 0; //Velocidade vertical (gravidade/pulo)
        this.speed = 5; //Velocidade de caminhada pelo cenário
        this.gravity = 0.5; //Força que puxa o herói para baixo constantemente
        this.jumpForce = -12; //Força do impulso para desafiar a gravidade [cite: 10]
        this.isGrounded = false; //Verifica se o herói está tocando o chão de pedra [cite: 5]
    }

    update() {
        this.velocityY += this.gravity; //Aplica a aceleração da gravidade [cite: 21]
        this.y += this.velocityY; //Atualiza a posição vertical com base na velocidade
        this.x += this.velocityX; //Atualiza a posição horizontal com base no input

        // Lógica de colisão com o chão (Plataforma de Pedra de Marah) [cite: 3]
        if (this.y + this.height > 600) {
            this.y = 600 - this.height; //Mantém o herói exatamente sobre o chão
            this.velocityY = 0; //Zera a velocidade de queda ao tocar a pedra
            this.isGrounded = true; //Permite que o herói pule novamente [cite: 22]
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