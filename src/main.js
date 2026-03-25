import { Engine } from './core/Engine.js'; //Importa o motor

// Garante que o DOM está pronto antes de iniciar
window.addEventListener('load', () => {
    const game = new Engine('gameCanvas'); //Instancia o jogo
    game.init().catch(err => console.error("Erro no Vazio:", err)); //Inicia
});