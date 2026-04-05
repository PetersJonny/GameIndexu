import { AssetLoader } from '../utils/AssetLoader.js';

export class InitialScene {
    constructor(engine) {
        this.engine = engine; // Referência ao motor
        this.animationTime = 0; // Tempo para animações
        this.rectWidth = 250; // Largura do botão
        this.rectHeight = 70; // Altura do botão
        this.confirming = false; // Estado de confirmação
        this.confirmTime = 0; // Tempo da animação de confirmação
        this.characters = [
            { name: 'Start', color: ' #bf00ff' }
        ];
        this.hoveredIndex = -1; // Índice do botão em hover
        this.assetLoader = new AssetLoader();
        this.assetLoader.loadImage('background', 'assets/sprites/fundo.png')
            .then(() => console.log('Imagem de fundo carregada'))
            .catch(err => console.error('Erro ao carregar imagem:', err));
    }

    // Atualiza o estado da cena
    updateHover() {
        this.hoveredIndex = -1;
        if (this.engine.mouseX !== undefined && this.engine.mouseY !== undefined) {
            const x = (this.engine.canvas.width - this.rectWidth) / 2;
            const y = (this.engine.canvas.height - this.rectHeight) / 2;
            if (this.engine.mouseX >= x && this.engine.mouseX <= x + this.rectWidth &&
                this.engine.mouseY >= y && this.engine.mouseY <= y + this.rectHeight) {
                this.hoveredIndex = 0;
            }
        }
    }

    // Atualiza o estado da cena, incluindo animações e lógica de confirmação
    update(deltaTime) {
        this.animationTime += deltaTime;
        if (this.confirming) {
            this.confirmTime += deltaTime;
            if (this.confirmTime > 1000) { // 1 segundo de animação
                this.engine.gameState = 'SELECTION'; // Muda para seleção
            }
        } else {
            this.updateHover();
        }
    }

    draw(ctx) {
        // Desenha o fundo primeiro
        const bg = this.assetLoader.get('background');
        if (bg) {
            ctx.drawImage(bg, 0, 0, this.engine.canvas.width, this.engine.canvas.height);
        } else {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, this.engine.canvas.width, this.engine.canvas.height);
        }

        ctx.fillStyle = '#FFF'; // Cor do texto
        ctx.font = '30px Arial'; // Fonte do título
        ctx.textAlign = 'center'; // Centraliza texto
        ctx.fillText('Vazio de Marah', this.engine.canvas.width / 2, 100);

        // Desenha o botão no centro
        const x = (this.engine.canvas.width - this.rectWidth) / 2;
        const y = (this.engine.canvas.height - this.rectHeight) / 2;
        const button = this.characters?.[0] ?? { name: 'Start', color: '#FFFFFF' };
        const isHovered = this.hoveredIndex === 0;
        const scale = isHovered ? 1.05 : 1;
        const scaledWidth = this.rectWidth * scale;
        const scaledHeight = this.rectHeight * scale;
        const offsetX = (this.rectWidth - scaledWidth) / 2;
        const offsetY = (this.rectHeight - scaledHeight) / 2;

        if (isHovered) {
            ctx.shadowColor = '#000080';
            ctx.shadowBlur = 20;
        }

        ctx.fillStyle = button.color;
        ctx.fillRect(x + offsetX, y + offsetY, scaledWidth, scaledHeight);
        ctx.shadowColor = 'transparent';

        ctx.fillStyle = '#000';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(button.name, x + this.rectWidth / 2, y + this.rectHeight / 2 + 8);
    }

    selectButon() {
        this.confirming = true; // Inicia animação de confirmação
        this.confirmTime = 0;
    }

    handleInput(mouseX, mouseY) {
        const x = (this.engine.canvas.width - this.rectWidth) / 2;
        const y = (this.engine.canvas.height - this.rectHeight) / 2;
        if (mouseX >= x && mouseX <= x + this.rectWidth && mouseY >= y && mouseY <= y + this.rectHeight) {
            this.selectButon();
        }
    }
}
