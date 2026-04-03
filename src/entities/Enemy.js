export class Enemy {
    constructor(config, x = 0, y = 0) {
        this.name = config.name || 'Inimigo';
        this.color = config.color || '#880000';
        this.width = config.width || 60;
        this.height = config.height || 80;
        this.x = x;
        this.y = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = config.speed || 1.8;
        this.jumpForce = config.jumpForce || -12;
        this.isGrounded = false;
        this.detectionRange = config.detectionRange || 280;
        this.maxHealth = config.maxHealth || 40;
        this.health = this.maxHealth;
        this.template = config;
        this.active = true;
    }

    update(player, physics) {
        if (!this.active) return;
        if (!player) return;

        const distanceX = player.x - this.x;
        const distance = Math.sqrt(distanceX * distanceX + (player.y - this.y) * (player.y - this.y));

        if (distance <= this.detectionRange) {
            // Persiste perseguindo o jogador
            this.velocityX = Math.sign(distanceX) * this.speed;

            // Salta caso o jogador esteja acima e esteja no chão
            if (this.isGrounded && player.y + player.height < this.y - 10) {
                this.velocityY = this.jumpForce;
                this.isGrounded = false;
            }
        } else {
            // Idle quando longe
            this.velocityX = 0;
        }

        physics.applyPhysics(this);
    }

    draw(ctx) {
        if (!this.active) return;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        const healthPct = this.maxHealth > 0 ? this.health / this.maxHealth : 0;
        ctx.fillStyle = '#FF6666';
        ctx.fillRect(this.x, this.y - 10, this.width * healthPct, 6);
        ctx.strokeStyle = '#330000';
        ctx.strokeRect(this.x, this.y - 10, this.width, 6);
    }
}