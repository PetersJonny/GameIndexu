export class InputHandler {
    constructor(displayVolume) {
        this.displayVolume = displayVolume;
        this.volumeAtual = 10;
        this.volumeAnterior = 10;
        this.estaMutado = false;
    }

    configurarVolume(botaoMais, botaoMenos, botaoMutar) {
        botaoMais.addEventListener('click', () => {
            if (this.estaMutado) {
                this.desmutarManual(botaoMutar);
            }

            if (this.volumeAtual < 10) {
                this.volumeAtual++;
                this.atualizarDisplay();
            }
        });

        botaoMenos.addEventListener('click', () => {
            if (this.estaMutado) {
                this.desmutarManual(botaoMutar);
            }

            if (this.volumeAtual > 0) {
                this.volumeAtual--;
                this.atualizarDisplay();
            }
        });
    }

    configurarMute(botaoMutar) {
        botaoMutar.addEventListener('click', () => {
            this.alternarMute(botaoMutar);
        });
    }

    // Função auxiliar para os botões +/- usarem quando desmutarem o som
    desmutarManual(botaoMutar) {
        this.estaMutado = false;
        this.volumeAtual = this.volumeAnterior;
        botaoMutar.innerText = '🔊';
    }

    alternarMute(botaoMutar) {
        if (!this.estaMutado) {
            this.volumeAnterior = this.volumeAtual;
            this.volumeAtual = 0;
            this.estaMutado = true;
            botaoMutar.innerText = '🔇';
        } else {
            this.volumeAtual = this.volumeAnterior;
            this.estaMutado = false;
            botaoMutar.innerText = '🔊';
        }
        this.atualizarDisplay();
    }

    atualizarDisplay() {
        this.displayVolume.innerText = this.volumeAtual;
    }
}