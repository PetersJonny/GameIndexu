# 🧭 Arquitetura do Projeto

Este documento descreve a organização das pastas e a responsabilidade de cada módulo no desenvolvimento do Jogo. O objetivo é manter o código modular, facilitando a manutenção e a expansão do enredo.

## 📂 Estrutura de Diretórios

### 1. src/ (Lógica do Jogo)

Contém todo o código funcional em JavaScript Vanilla (ES6+), organizado para separar o motor das regras de negócio.

* **core/**: O "cérebro" do sistema.
  * `Engine.js`: Gerencia o Game Loop (Update/Draw) e o estado global.
  * `InputHandler.js`: Captura comandos de teclado (plataforma) e cliques nas cartas.
* **entities/**: Modelagem dos habitantes de Marah.
  * `Player.js`: Lógica dos personagens como Íris, Atom, Ioruh e etc.
  * `Enemy.js`: Comportamento do Guardião do Selo de Cera e do Colecionador de Nomes (Além dos próximos inimigos).
* **mechanics/**: Regras específicas do mundo.
  * `CardSystem.js`: Gerencia o baralho, compra de cartas e raridades.
  * `ManaManager.js`: Controle dos 18 pontos de mana iniciais e custos.
  * `PuzzleLogic.js`: Lógica de alinhamento das engrenagens de Tenebra e outros puzzles futuros.
* **scenes/**: Gerenciamento de contextos visuais.
  * `ExplorationScene.js`: O modo plataforma no Vazio e na Torre.
  * `BattleScene.js`: A arena de combate por turnos com zoom dramático que combinamos.
  * `HubScene.js`: O ambiente de descanso na Taverna.
* **utils/**: Funções utilitárias.
  * `AssetLoader.js`: Carregamento assíncrono das spritesheets feitas à mão.
  * `Physics.js`: Cálculos de gravidade, saltos e colisões.

### 2. public/assets/ (Recursos Estáticos)

Pasta gerenciada pelo Vite para arquivos que não mudam logicamente.

* **backgrounds/**: Cenários como por exemplo as nuvens e o jardim de cristais.
* **sprites/**: Animações dos personagens e monstros.
* **icons/**: Arte das Cartas de Marfim, Memória, Identidade e etc.

### 3. docs/ (Documentação e Enredo)

Repositório de conhecimento sobre o desenvolvimento e a história.

* **lore/**: Contém o enredo, diálogos da Estela e descrições do mundo.
* **technical/**: Manuais de arquitetura (este arquivo) e guias de código.

## 🛠️ Fluxo de Transição

O jogo inicia em `ExplorationScene`. Ao colidir com um Boss, o `SceneManager` executa um zoom dramático e altera o estado para `BattleScene`, onde o `CardSystem` assume o controle da interface. Após a vitória, o jogador retorna ao mapa ou progride para o próximo setor.
