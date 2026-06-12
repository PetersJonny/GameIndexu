// js/scenes/cutscene.js

const configCutscene = {
  imagensSrc: [
    "assets/drawings/cutscenes/CutsceneInicial.png",
    "assets/drawings/cutscenes/CutsceneInicial2.png",
    "assets/drawings/cutscenes/PrimeiraCutscene.png",
    "assets/drawings/cutscenes/Primeira1.5Cutscene.png",
    "assets/drawings/cutscenes/SegundaCutscene.png",
    "assets/drawings/cutscenes/TerceiraCutscene.png",
    "assets/drawings/cutscenes/QuartaCutscene.png",
    "assets/drawings/cutscenes/Quarta1.5Cutscene.png",
    "assets/drawings/cutscenes/QuintaCutscene.png",
    "assets/drawings/cutscenes/SextaCutscene.png",
    "assets/drawings/cutscenes/SétimaCutscene.png",
    "assets/drawings/cutscenes/OitavaCutscene.png",
    "assets/drawings/cutscenes/NonaCutscene.png",
    "assets/drawings/cutscenes/DecimaCutscene.png",
    "assets/drawings/cutscenes/DecimaPrimeiraCutscene.png",
    "assets/drawings/cutscenes/DecimaSegundaCutscene.png",
    "assets/drawings/cutscenes/DecimaTerceiraCutscene.png",
    "assets/drawings/cutscenes/DecimaQuartaCutscene.png",
    "assets/drawings/cutscenes/DecimaQuintaCutscene.png",
    "assets/drawings/cutscenes/DecimaSextaCutscene.png",
    "assets/drawings/cutscenes/DecimaSetimaCutscene.png",
    "assets/drawings/cutscenes/DecimaOitavaCutscene.png",
    "assets/drawings/cutscenes/DecimaNonaCutscene.png",
    "assets/drawings/cutscenes/VigesimaCutscene.png",
    "assets/drawings/cutscenes/CutsceneTutorial.png",
  ],
  cenaDestinoFinal: "selecao",
};

let estadoCutscene = {
  imagens: [],
  indiceAtual: 0,
  carregadas: false,
  opacidade: 0, // Nova variável para o fade
  fadeVelocidade: 0.02, // Ajuste aqui: quanto menor, mais lento o fade
  larguraNativa: 1920,
  alturaNativa: 1080,

  // Variáveis para o efeito de piscar do texto de indicação
  textoOpacidade: 0,
  textoDirecaoFade: 1,
  textoVelocidade: 0.03,
};

function inicializarCutscenes() {
  let carregadasCounter = 0;
  configCutscene.imagensSrc.forEach((src, index) => {
    const img = new Image();
    img.src = src;

    img.onerror = () => {
      console.error("Erro ao carregar a imagem em: " + src);
    };

    img.onload = () => {
      carregadasCounter++;
      if (carregadasCounter === configCutscene.imagensSrc.length) {
        estadoCutscene.carregadas = true;
      }
    };
    estadoCutscene.imagens[index] = img;
  });
}

function renderCutscene(ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, estadoCutscene.larguraNativa, estadoCutscene.alturaNativa);

  if (!estadoCutscene.carregadas) return;

  // Lógica do Fade-in da Imagem
  if (estadoCutscene.opacidade < 1) {
    estadoCutscene.opacidade += estadoCutscene.fadeVelocidade;
  }

  const imgAtual = estadoCutscene.imagens[estadoCutscene.indiceAtual];

  if (imgAtual && imgAtual.complete) {
    ctx.save();
    ctx.globalAlpha = estadoCutscene.opacidade; // Aplica a transparência
    ctx.drawImage(
      imgAtual,
      0,
      0,
      estadoCutscene.larguraNativa,
      estadoCutscene.alturaNativa,
    );
    ctx.restore();
  }

  // --- Nova seção: Indicador de Clique ---
  // Só exibe o texto após a imagem terminar de aparecer (fade-in concluído)
  if (estadoCutscene.opacidade >= 1) {
    // Lógica do efeito "Pulse/Piscar" para o texto
    estadoCutscene.textoOpacidade +=
      estadoCutscene.textoVelocidade * estadoCutscene.textoDirecaoFade;

    if (estadoCutscene.textoOpacidade >= 1) {
      estadoCutscene.textoOpacidade = 1;
      estadoCutscene.textoDirecaoFade = -1; // Começa a sumir
    } else if (estadoCutscene.textoOpacidade <= 0.2) {
      // Não some 100% para manter legível
      estadoCutscene.textoOpacidade = 0.2;
      estadoCutscene.textoDirecaoFade = 1; // Começa a aparecer
    }

    ctx.save();
    ctx.globalAlpha = estadoCutscene.textoOpacidade;
    ctx.fillStyle = "white";
    ctx.font = "24px sans-serif"; // Ajuste a fonte se tiver uma customizada no seu jogo
    ctx.textAlign = "right";

    // Posiciona o texto a 50px de distância das bordas inferior e direita
    const posX = estadoCutscene.larguraNativa - 50;
    const posY = estadoCutscene.alturaNativa - 50;

    ctx.fillText("Clique para avançar...", posX, posY);
    ctx.restore();
  }
}

function checkCutsceneClick() {
  // Se ainda estiver em fade, ignorar clique ou pular o fade
  if (estadoCutscene.opacidade < 1) {
    estadoCutscene.opacidade = 1; // Pula o fade para 100% se clicar rápido
    return null;
  }

  estadoCutscene.indiceAtual++;

  if (estadoCutscene.indiceAtual >= estadoCutscene.imagens.length) {
    estadoCutscene.indiceAtual = 0;
    estadoCutscene.opacidade = 0;
    estadoCutscene.textoOpacidade = 0; // Reseta o texto
    return "proxima_cena";
  }

  estadoCutscene.opacidade = 0; // Reseta opacidade para o fade da próxima imagem
  estadoCutscene.textoOpacidade = 0; // Reseta o texto para a próxima tela
  return null;
}
