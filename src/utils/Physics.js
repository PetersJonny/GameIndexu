export class Physics {
    constructor(gravity = 0.5) {
        this.gravity = gravity; // Força da gravidade
        this.platforms = []; // Array de plataformas
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

    // Método para desenhar plataformas (útil para debug)
    drawPlatforms(ctx) {
        ctx.fillStyle = '#8B4513'; // Cor marrom para plataformas
        for (const platform of this.platforms) {
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

            // Borda para melhor visualização
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 2;
            ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
        }
        ctx.lineWidth = 1; // Restaura largura da linha
    }
}