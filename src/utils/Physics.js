export class Physics {
    constructor(gravity = 0.5) {
        this.gravity = gravity; // Força da gravidade
        this.platforms = []; // Array de plataformas

        // CARREGAMENTO DAS TEXTURAS DA FLORESTA
        // 1. Textura do Chão Principal
        this.groundImage = new Image();
        this.groundImage.src = './assets/sprites/texture/chao_floresta.png';
        this.groundPattern = null; // Vai guardar o carimbo de repetição

        // 2. Textura das Plataformas Flutuantes
        this.platformImage = new Image();
        this.platformImage.src = './assets/sprites/texture/plataforma_floresta.png';
        this.platformPattern = null;
    }

    // Adiciona uma plataforma ao sistema de física
    addPlatform(x, y, width, height) {
        this.platforms.push({
            x: x,
            y: y,
            width: width,
            height: height
        });
    }

    // Remove todas as plataformas
    clearPlatforms() {
        this.platforms = [];
    }

    // Verifica colisão entre dois retângulos
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y;
    }

    // Aplica física a um objeto (como o player)
    applyPhysics(entity) {
        // Aplica gravidade
        entity.velocityY += this.gravity;

        // Atualiza posição baseada na velocidade
        entity.x += entity.velocityX;
        entity.y += entity.velocityY;

        // Verifica colisões com plataformas
        entity.isGrounded = false;

        for (const platform of this.platforms) {
            // Verifica se há colisão
            if (this.checkCollision(entity, platform)) {
                // Colisão detectada - determina de qual direção veio

                // Calcula as sobreposições em cada direção
                const overlapX = Math.min(
                    entity.x + entity.width - platform.x,  // Sobreposição direita
                    platform.x + platform.width - entity.x   // Sobreposição esquerda
                );

                const overlapY = Math.min(
                    entity.y + entity.height - platform.y,  // Sobreposição inferior
                    platform.y + platform.height - entity.y   // Sobreposição superior
                );

                // Resolve a colisão na direção com menor sobreposição
                if (overlapX < overlapY) {
                    // Colisão horizontal
                    if (entity.x < platform.x) {
                        // Vindo da esquerda
                        entity.x = platform.x - entity.width;
                    } else {
                        // Vindo da direita
                        entity.x = platform.x + platform.width;
                    }
                    entity.velocityX = 0; // Para movimento lateral
                } else {
                    // Colisão vertical
                    if (entity.y < platform.y) {
                        // Vindo de cima (aterrissando na plataforma)
                        entity.y = platform.y - entity.height;
                        entity.velocityY = 0;
                        entity.isGrounded = true;
                    } else {
                        // Vindo de baixo (batendo a cabeça)
                        entity.y = platform.y + platform.height;
                        entity.velocityY = 0;
                    }
                }
            }
        }

        // Limites da tela (evita sair dos lados)
        if (entity.x < 0) {
            entity.x = 0;
            entity.velocityX = 0;
        }
        if (entity.x + entity.width > 1280) {
            entity.x = 1280 - entity.width;
            entity.velocityX = 0;
        }

        // Limite inferior (chão do jogo)
        if (entity.y + entity.height > 720) {
            entity.y = 720 - entity.height;
            entity.velocityY = 0;
            entity.isGrounded = true;
        }
    }

    // Método para desenhar plataformas com texturas
    drawPlatforms(ctx) {
        // Gera os padrões de repetição se as imagens já tiverem carregado
        if (this.groundImage.complete && this.groundImage.width > 0 && !this.groundPattern) {
            this.groundPattern = ctx.createPattern(this.groundImage, 'repeat');
        }
        if (this.platformImage.complete && this.platformImage.width > 0 && !this.platformPattern) {
            this.platformPattern = ctx.createPattern(this.platformImage, 'repeat');
        }

        for (const platform of this.platforms) {
            ctx.save(); // Salva a posição original da tela

            // Move o "pincel" para a quina exata da plataforma.
            // Isso garante que a grama da textura fique sempre no topo!
            ctx.translate(platform.x, platform.y);

            // Se a plataforma for alta (120px de altura), é o chão principal
            const isGround = platform.height >= 100;

            if (isGround && this.groundPattern) {
                ctx.fillStyle = this.groundPattern;
            } else if (!isGround && this.platformPattern) {
                ctx.fillStyle = this.platformPattern;
            } else {
                ctx.fillStyle = '#8B4513'; // Cor provisória caso a imagem demore a carregar
            }

            // Desenha o retângulo (agora a partir do 0,0 porque usamos o translate)
            ctx.fillRect(0, 0, platform.width, platform.height);

            // Borda opcional mais escura para dar um acabamento nas pontas
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.lineWidth = 2;
            ctx.strokeRect(0, 0, platform.width, platform.height);

            ctx.restore(); // Devolve o pincel para o lugar normal
        }
    }
}