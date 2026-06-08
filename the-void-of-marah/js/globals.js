// Gerencia o salvamento e carregamento simples do progresso usando localStorage.

function salvarProgresso() {
  const dados = {
    casaAtual: state.casaAtual,
    personagem: state.personagemSelecionado,
    fase: state.fase,
    stats: state.stats,
  };

  localStorage.setItem("marah_void_save", JSON.stringify(dados));
}

function carregarProgresso() {
  const salvo = localStorage.getItem("marah_void_save");
  if (salvo) {
    const dados = JSON.parse(salvo);
    state.casaAtual = dados.casaAtual;
    state.personagemSelecionado = dados.personagem;
    state.fase = dados.fase;
    state.stats = dados.stats;
    return true;
  }

  return false;
}
