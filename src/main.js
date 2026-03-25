import { Engine } from './core/Engine.js'; //Importa o motor principal do jogo

// Espera o navegador carregar todo o HTML antes de iniciar
window.addEventListener('load', () => {
    const game = new Engine('gameCanvas'); //Cria a instância usando o ID correto
    game.init().catch(err => { //Tenta inicializar o despertar no vazio [cite: 1]
        console.error("Erro ao iniciar Marah:", err); //Exibe erro caso falhe
    });
});