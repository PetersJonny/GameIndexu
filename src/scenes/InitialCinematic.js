export class InitialCinematic {
    constructor(engine) {
        this.engine = engine; // Referência ao motor
        this.rectWidth = 64; // Largura do card de seleção
        this.rectHeight = 96; // Altura do card de seleção

        this.animationTime = 0;
        this.animationDuration = 1500; // duração da animação em ms

        this.cardStartX = this.engine.canvas.width + 100;
        this.cardTargetX = this.engine.canvas.width / 2 - this.rectWidth / 2;
        this.cardY = this.engine.canvas.height / 2 - this.rectHeight / 2;
        this.cardX = this.cardStartX;
        this.cardAlpha = 0;
        this.cardScale = 0.6;
    }

    update(deltaTime) {
        if (this.animationTime >= this.animationDuration) return;

        this.animationTime += deltaTime;
        const t = Math.min(this.animationTime / this.animationDuration, 1);
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        this.cardX = this.cardStartX + (this.cardTargetX - this.cardStartX) * ease;
        this.cardAlpha = ease;
        this.cardScale = 0.6 + 0.4 * ease;
    }

    draw(ctx) {
        ctx.fillStyle = '#000000'; // Fundo preto
        ctx.fillRect(0, 0, this.engine.canvas.width, this.engine.canvas.height);

        const cardWidth = this.rectWidth * this.cardScale;
        const cardHeight = this.rectHeight * this.cardScale;
        const drawX = this.cardX + (this.rectWidth - cardWidth) / 2;
        const drawY = this.cardY + (this.rectHeight - cardHeight) / 2;

        ctx.save();
        ctx.globalAlpha = this.cardAlpha;
        ctx.fillStyle = '#FFFFFF'; // Cor do card de seleção
        ctx.fillRect(drawX, drawY, cardWidth, cardHeight);
        ctx.restore();
    }
}