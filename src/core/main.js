import { InputHandler } from './InputHandler.js';

function init() {
    const btnMais = document.getElementById('btn_mais');
    const btnMenos = document.getElementById('btn_menos');
    const display = document.getElementById('display_volume');
    const btnMute = document.getElementById('btn_mute');

    const input = new InputHandler(display);

    input.configurarVolume(btnMais, btnMenos, btnMute);
    input.configurarMute(btnMute);
}

window.addEventListener('load', init);