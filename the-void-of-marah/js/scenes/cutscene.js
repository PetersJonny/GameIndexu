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
};

function inicializarCutscenes() {
  let carregadasCounter = 0;
  configCutscene.imagensSrc.forEach((src, index) => {
    const img = new Image();
    img.src = src;
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

  // Lógica do Fade-in
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
    return "proxima_cena";
  }

  estadoCutscene.opacidade = 0; // Reseta opacidade para o fade da próxima imagem
  return null;
}
