export class SelectionScene {
    constructor(engine) {
        this.engine = engine;//Referência ao motor
        this.characters = [
            { name: 'Íris Shadowlace', color: '#FF4500' }, //Fogo [cite: 80]
            { name: 'Atom Shadowlace', color: '#708090' }, //Metal [cite: 81]
            { name: 'Ioruh', color: '#8B4513' }, //Madeira [cite: 82]
            { name: 'Toshy', color: '#00BFFF' }, //Fogo Azul [cite: 83]
            { name: 'Mogli', color: '#228B22' }, //Folha [cite: 84]
            { name: 'Thanatá', color: '#FFD700' } //Moeda [cite: 85]
        ];
        this.rectWidth = 150; //Largura do card
        this.rectHeight = 250; //Altura do card
        this.startY = 200; //Posição Y inicial
        this.spacing = 40; //Espaço entre cards
    }

    update() { } //Reservado para animações

    draw(ctx) {
        ctx.fillStyle = '#FFFFFF'; //Fundo branco [cite: 2]
        ctx.fillRect(0, 0, this.engine.canvas.width, this.engine.canvas.height); //Limpa tela
        ctx.fillStyle = '#000'; //Cor do texto
        ctx.font = '30px Arial'; //Fonte do título
        ctx.textAlign = 'center'; //Centraliza texto
        ctx.fillText('Escolha seu Destino no Vazio', this.engine.canvas.width / 2, 100); //Título [cite: 9]

        this.characters.forEach((char, index) => {
            const x = 100 + index * (this.rectWidth + this.spacing); //Posição X do card
            ctx.fillStyle = char.color; //Cor do herói
            ctx.fillRect(x, this.startY, this.rectWidth, this.rectHeight); //Desenha card
            ctx.fillStyle = '#000'; //Cor do nome
            ctx.font = '16px Arial'; //Fonte do nome
            ctx.fillText(char.name, x + this.rectWidth / 2, this.startY + this.rectHeight + 30); //Nome [cite: 6]
        });
    }

    handleInput(mouseX, mouseY) {
        this.characters.forEach((char, index) => {
            const x = 100 + index * (this.rectWidth + this.spacing); //Posição X para checar
            if (mouseX >= x && mouseX <= x + this.rectWidth &&
                mouseY >= this.startY && mouseY <= this.startY + this.rectHeight) {
                this.selectCharacter(char); //Seleciona se clicar dentro [cite: 96]
            }
        });
    }

    selectCharacter(char) {
        this.engine.selectedCharacter = char; //Salva a escolha [cite: 96]
        this.engine.gameState = 'EXPLORATION'; //Muda para o jogo [cite: 13]
    }
}