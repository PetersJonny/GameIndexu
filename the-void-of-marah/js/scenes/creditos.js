// Configurações globais para fácil ajuste
const CONFIG = {
  width: 1920,
  height: 1080,
  colors: {
    bg: "#050510",
    accent: "#00d4ff", // Azul Ciano
    primary: "#bc13fe", // Roxo Magenta
    text: "#ffffff",
  },
};

// Variáveis de controle do efeito de fundo
let matriculas = [];

// Inicializa a "chuva" de caracteres
function initBackgroundEffect() {
  const columns = Math.floor(CONFIG.width / 20);
  for (let i = 0; i < columns; i++) {
    matriculas[i] = {
      x: i * 20,
      y: Math.random() * CONFIG.height,
      speed: 2 + Math.random() * 3,
      chars: "01$#@%&*µ¶Ω".split(""),
    };
  }
}

// Desenha o fundo com efeito tecnológico
function drawBackground(ctx) {
  ctx.fillStyle = CONFIG.colors.bg;
  ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

  ctx.fillStyle = CONFIG.colors.primary + "22";
  ctx.font = "15px monospace";
  ctx.textAlign = "left";

  matriculas.forEach((drop) => {
    const char = drop.chars[Math.floor(Math.random() * drop.chars.length)];
    ctx.fillText(char, drop.x, drop.y);
    drop.y += drop.speed;
    if (drop.y > CONFIG.height) drop.y = -20;
  });
}

// Função principal de renderização
function renderCreditos(ctx) {
  // Inicializa o fundo na primeira vez
  if (matriculas.length === 0) initBackgroundEffect();

  drawBackground(ctx);

  // Centralização vertical
  const centroY = 300;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  // Título com degradê
  ctx.font = 'bold 90px "Montserrat", sans-serif';
  const grad = ctx.createLinearGradient(0, 0, CONFIG.width, 0);
  grad.addColorStop(0, CONFIG.colors.accent);
  grad.addColorStop(1, CONFIG.colors.primary);

  ctx.shadowColor = CONFIG.colors.primary;
  ctx.shadowBlur = 20;
  ctx.fillStyle = grad;
  ctx.fillText("CRÉDITOS", CONFIG.width / 2, centroY);

  // Dados dos créditos
  ctx.shadowBlur = 0;
  const linhas = [
    { cat: "ARTE GERAL", nomes: "Ágatha Ariell, Rhawan Henrique" },
    {
      cat: "PROGRAMAÇÃO",
      nomes: "Pedro Júlio, Gabriel Haddad, Thawan Campos, Felipe Eduardo",
    },
  ];

  let offset = centroY + 150;
  linhas.forEach((item) => {
    // Categoria
    ctx.fillStyle = CONFIG.colors.accent;
    ctx.font = 'bold 32px "Roboto Mono", monospace';
    ctx.fillText(item.cat, CONFIG.width / 2, offset);

    // Nomes
    ctx.fillStyle = CONFIG.colors.text;
    ctx.font = '25px "Roboto Mono", monospace';
    ctx.fillText(item.nomes, CONFIG.width / 2, offset + 50);
    offset += 140;
  });

  // Botão "ESC"
  ctx.strokeStyle = CONFIG.colors.primary;
  ctx.lineWidth = 3;
  ctx.strokeRect(CONFIG.width / 2 - 250, 850, 500, 60);
  ctx.fillStyle = CONFIG.colors.text;
  ctx.font = '22px "Roboto Mono", monospace';
  ctx.fillText("PRESSIONE [ESC] PARA VOLTAR AO MENU", CONFIG.width / 2, 868);
}

// Evento de teclado
window.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const currentState = window.state;
  if (
    !currentState ||
    currentState.cena !== "creditos" ||
    currentState.emTransicao
  )
    return;

  event.preventDefault();
  currentState.proximaCena = "menu";
  currentState.emTransicao = true;
});
