export class SelectionScene {
    constructor(engine) {
        this.engine = engine;//Referência ao motor
        this.characters = [
            { name: 'Íris Shadowlace', class: 'Feiticeira Demônia/Anjo', color: '#FF4500', portrait: './public/assets/sprites/cartas_select/CartaIris.png' }, //Fogo [cite: 80]
            { name: 'Atom Shadowlace', class: 'Golem de Pedra', color: '#708090' }, //Metal [cite: 81]
            { name: 'Ioruh', class: 'Druida Coruja', color: '#8B4513' }, //Madeira [cite: 82]
            { name: 'Toshy', class: 'Necromante Osteon', color: '#00BFFF' }, //Fogo Azul [cite: 83]
            { name: 'Mogli', class: 'Arqueiro Trog', color: '#228B22' }, //Folha [cite: 84]
            { name: 'Thanatá', class: 'Maga Humana', color: '#FFD700' } //Moeda [cite: 85]
        ];
        this.rectWidth = 180; //Largura do card de seleção
        this.rectHeight = 320; //Altura do card de seleção
        this.startX = 50; //Margem esquerda de 50px para o conjunto de cards
        this.startY = 200; //Posição Y inicial
        this.spacing = 20; //Espaço entre cards
        this.portraitWidth = 128; //Largura do sprite de portrait
        this.portraitHeight = 192; //Altura do sprite de portrait
        this.hoveredIndex = -1; //Índice do card em hover
        this.animationTime = 0; //Tempo para animações
        this.confirming = false; //Estado de confirmação
        this.confirmTime = 0; //Tempo da animação de confirmação

        this.irisPortrait = new Image();
        this.irisPortraitLoaded = false;
        this.irisPortrait.src = './public/assets/sprites/cartas_select/CartaIris.png';
        this.irisPortrait.onload = () => { this.irisPortraitLoaded = true; };
    }

    updateHover() {
        this.hoveredIndex = -1;
        if (this.engine.mouseX !== undefined && this.engine.mouseY !== undefined) {
            this.characters.forEach((char, index) => {
                const x = this.startX + index * (this.rectWidth + this.spacing);
                if (this.engine.mouseX >= x && this.engine.mouseX <= x + this.rectWidth &&
                    this.engine.mouseY >= this.startY && this.engine.mouseY <= this.startY + this.rectHeight) {
                    this.hoveredIndex = index;
                }
            });
        }
    }

    update(deltaTime) {
        this.animationTime += deltaTime;
        if (this.confirming) {
            this.confirmTime += deltaTime;
            if (this.confirmTime > 1000) { // 1 segundo de animação
                this.engine.gameState = 'EXPLORATION'; //Muda para o jogo
            }
        } else {
            // Atualiza hover
            this.updateHover();
        }
    } //Reservado para animações

    draw(ctx) {
        ctx.fillStyle = '#FFFFFF'; //Fundo branco [cite: 2]
        ctx.fillRect(0, 0, this.engine.canvas.width, this.engine.canvas.height); //Limpa tela
        ctx.fillStyle = '#000'; //Cor do texto
        ctx.font = '30px Arial'; //Fonte do título
        ctx.textAlign = 'center'; //Centraliza texto
        ctx.fillText('Escolha seu Destino no Vazio', this.engine.canvas.width / 2, 100); //Título [cite: 9]

        this.characters.forEach((char, index) => {
            const x = this.startX + index * (this.rectWidth + this.spacing); //Posição X do card
            const isHovered = this.hoveredIndex === index;
            const scale = isHovered ? 1.05 : 1; //Leve aumento no hover
            const scaledWidth = this.rectWidth * scale;
            const scaledHeight = this.rectHeight * scale;
            const offsetX = (this.rectWidth - scaledWidth) / 2;
            const offsetY = (this.rectHeight - scaledHeight) / 2;

            // Brilho azul marinho no hover
            if (isHovered) {
                ctx.shadowColor = '#000080';
                ctx.shadowBlur = 20;
            }

            if (char.name === 'Íris Shadowlace') {
                // Desenha o retrato de Iris no mesmo tamanho do card, sem o fundo laranja
                if (this.irisPortraitLoaded) {
                    ctx.drawImage(this.irisPortrait, x + offsetX, this.startY + offsetY, scaledWidth, scaledHeight);
                } else {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(x + offsetX, this.startY + offsetY, scaledWidth, scaledHeight);
                }
            } else {
                ctx.fillStyle = char.color; //Cor do herói
                ctx.fillRect(x + offsetX, this.startY + offsetY, scaledWidth, scaledHeight); //Desenha card
            }

            ctx.shadowColor = 'transparent'; //Reseta sombra

            // Animação simples do personagem (pulsar)
            if (isHovered) {
                const pulse = Math.sin(this.animationTime * 0.01) * 0.1 + 1;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.fillRect(x + offsetX + 10, this.startY + offsetY + 10, (scaledWidth - 20) * pulse, scaledHeight - 20);
            }

            // Descrição dinâmica
            ctx.fillStyle = '#000'; //Cor do nome
            ctx.font = '16px Arial'; //Fonte do nome
            ctx.textAlign = 'center';
            ctx.fillText(char.name, x + this.rectWidth / 2, this.startY + this.rectHeight + 40); //Nome
            ctx.font = '12px Arial';
            ctx.fillText(char.class, x + this.rectWidth / 2, this.startY + this.rectHeight + 60); //Classe
        });

        // Animação de confirmação
        if (this.confirming) {
            const alpha = Math.min(this.confirmTime / 500, 1); //Fade in
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillRect(0, 0, this.engine.canvas.width, this.engine.canvas.height);
        }
    }

    handleInput(mouseX, mouseY) {
        this.characters.forEach((char, index) => {
            const x = this.startX + index * (this.rectWidth + this.spacing); //Posição X para checar
            if (mouseX >= x && mouseX <= x + this.rectWidth &&
                mouseY >= this.startY && mouseY <= this.startY + this.rectHeight) {
                this.selectCharacter(char); //Seleciona se clicar dentro [cite: 96]
            }
        });
    }

    selectCharacter(char) {
        this.engine.selectedCharacter = char; //Salva a escolha [cite: 96]
        this.confirming = true; //Inicia animação de confirmação
        this.confirmTime = 0;
    }
}