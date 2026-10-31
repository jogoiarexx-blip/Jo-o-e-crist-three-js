# AUDITORIA — Capítulos 00 a 05 de João & Crist 3D

**Data:** 30/10/2026 · **Base:** commit \`6ce1badb00689c090c0d17947804cf982cbff941\` (v0.6.0).
**Escopo:** Fazenda, Rodoviária, Excursão Errada, Aeroporto dos Perdidos, Route 66 e O Deserto Não Perdoa.
**Situação:** auditoria técnica **estática** e verificações lógicas reproduzidas durante a inspeção. **Não é certificação de jogabilidade** em navegador. Não houve partida manual completa, captura visual real, medição de FPS nem testes em dispositivo Android.

## 1. Resumo executivo

O projeto possui **47 estados de campanha** (0–46), distribuídos por seis capítulos (0–5) e tela de encerramento. Há **54 blocos de teste unitário** registrados em dez arquivos \`tests/*.test.mjs\`. O último workflow GitHub Pages disponível na data-base informou sucesso nos testes e publicação. Isso comprova testes de regras/arquivos, **não** que as seis fases foram percorridas do início ao fim.

Os principais problemas são de **integração espacial, coerência das ações narrativas e ausência de testes de gameplay reais**. Muitos objetivos existem no estado da campanha, mas alguns são resolvidos por um menu de três escolhas em um corredor, longe dos elementos 3D que deveriam representá-los.

**Decisão recomendada:** não iniciar “Bem-vindos a Vegas” até corrigir P0/P1, testar todos os capítulos com os mesmos mecanismos de controle e deixar uma versão-base estável (v0.6.x QA).

## 2. Matriz de qualidade preliminar

Pontuação **editorial/diagnóstica por leitura do código**, de 0 a 10; não é pontuação obtida em testes jogando.

| Capítulo | Estrutura narrativa | Integração espacial | Interação e jogabilidade | Nota preliminar | Diagnóstico |
|---|---:|---:|---:|---:|---|
| 00 — Fazenda | 8,0 | 6,5 | 6,5 | **7,0** | Melhor ambientação narrativa; personagens, interações e QA visual pendentes |
| 01 — Rodoviária | 6,5 | 5,5 | 5,5 | **5,8** | Boa preparação, mas escolha do portão correto contradiz embarque posterior |
| 02 — Excursão Errada | 7,0 | 4,5 | 5,0 | **5,5** | Trupe divertida; bancos, malas e mixer afastados dos gatilhos |
| 03 — Aeroporto | 6,5 | 4,0 | 4,5 | **5,0** | Cinco puzzles; gatilhos no corredor separados dos balcões |
| 04 — Route 66 | 7,0 | 3,5 | 5,0 | **5,2** | Veículo controlável, mas cerca antiga corta a estrada e direção tem cenário pouco dinâmico |
| 05 — Deserto | 7,5 | 6,5 | 5,5 | **6,5** | Boa cooperação água/sombra/reparo, ainda com animações e consequência visual limitadas |

**Nota transversal:** testes automatizados bem organizados para regras; falta CI de *integração de capítulos* e teste real de navegador/mobile. Esses números são prioridades relativas, não evidência de FPS ou estabilidade real.

## 3. Problemas com evidência de código

### P0 — Colisão e cenário da Fazenda atravessando Route 66

- \`src/farm-layout.js\`: a cerca \`south-fence\` é retângulo \`x=-40.4..13.1\`, \`z=23.75..24.25\`.
- \`src/road-world.js\`: diorama da Route 66 ocupa aproximadamente \`x=-45..-11\`, \`z=12..42\`.
- \`src/world.js\` monta cerca e Fazenda **fora de qualquer grupo de fase** e não desativa seus colliders quando ativa \`road\`. \`src/world.js#setChapter\` só alterna módulos criados depois.
- Reproduzido por cálculo usando \`isBlocked\`: **28 amostras de X** entre -40 e -13 estão bloqueadas na linha \`z=24\`.
- **Efeito:** estrada cindida por cerca da Fazenda; acesso à oficina e circulação reais prejudicados; geometria antiga pode aparecer junto ao diorama.
- **Correção:** introduzir \`baseWorld/farmWorld/cityWorld\` com visibilidade e conjunto de colisões por capítulo. As cenas anteriores continuam existindo; **não apagar nem simplificar** a Fazenda. Evitar apenas retirar fisicamente a cerca do mundo porque a Fazenda precisa dela.
- **Critério:** pathfinding e caminhada real entre todos os objetivos da Route 66, incluindo os pontos ao sul de z=24, sem atravessar ou ficar presos em cercas antigas.

### P1 — Aeroporto: gatilhos afastados dos objetos visíveis

Em \`src/airport-state.js\` os gatilhos ficam no corredor \`z=-31.5\`. Em \`src/airport-world.js\` os objetos ficam junto às paredes. Distâncias aproximadas entre centro de gatilho e **centro do objeto construído**:

| Interação | Distância | Raio do gatilho |
|---|---:|---:|
| Check-in | 5,22 | 2,30 |
| Achados e Perdidos | 5,10 | 2,40 |
| Bagagem/Farofa | 5,12 | 2,45 |
| Scanner/Inspeção | 5,00 | 2,25 |
| Painel do portão | 4,40 | 2,35 |
| Embarque | 5,10 | 2,10 |

- Esses números **não provam inacessibilidade**, mas confirmam que os centros dos objetos ficam fora das áreas de gatilho.
- **Efeito:** tarefas podem ser executadas longe do objeto descrito, reduzindo o valor de explorar o cenário; os NPCs também aparecem deslocados dos pontos principais.
- **Correção:** posicionar um *interaction anchor* de frente para cada objeto e próximo ao seu collider. Fazer o raio começar nesse âncora, não no corredor; adicionar orientação visual e verificar alcance e linha de visão. Aceitar também a leitura de etiquetas e placas por proximidade.
- **Critério:** ao se aproximar do balcão real, o botão/interação fica disponível; afastado do balcão, não fica.

### P1 — Ônibus: gatilhos não correspondem a bancos/equipamentos

Comparando \`src/bus-state.js\` com \`src/bus-interior.js\`:

| Interação | Distância ao centro do objeto | Raio atual |
|---|---:|---:|
| Sentar no banco | 3,05 | 2,25 |
| Caixa ESTELAR | ~4,11 | 2,15 |
| Mesa de som — inspeção | 3,11 | 2,15 |
| Mesa de som — reconexão | 3,11 | 2,15 |

- **Correção:** âncoras próximas aos bancos, bagageiros e mesa; animação de sentar, abrir caixa, conectar cabo; permitir conversa com artista no lugar onde está.
- **Critério:** é necessário se aproximar do objeto de verdade, com marcador colado ao chão diante dele.

### P1 — História: portão 2 correto, excursão errada depois

- \`src/city-state.js\` define a resposta correta do passo do guichê: **Portão 2, transporte ao aeroporto**.
- \`src/story.js#SCENES.routeSolved\` reforça que Crist identificou o portão correto e avisou João.
- No passo seguinte, \`SCENES.bus\`, a dupla escolhe conscientemente a excursão roxa por ser bonita.
- **Problema:** a cena é engraçada isoladamente, mas falta motivo plausível para ignorar um portão já identificado sem consequência. Não é um erro do compilador; é uma inconsistência de **causa e efeito**.
- **Correção:** manter todos os acontecimentos, mas inserir um gatilho de confusão: anúncio abafado pela bicicleta, troca de filas/letreiros, João seguindo o grupo por engano, Cris temporariamente distraído com a mala; adicionar fala de reação de Crist.
- **Critério:** quem joga entende por que o portão 2 foi perdido e por que o embarque errado é uma consequência da confusão, não uma decisão arbitrária.

### P1 — Route 66: direção representativa demais para a promessa

- \`src/road-state.js\`: dois trechos com avanço automático, direção lateral, cones/barris/caixas.
- \`src/road-world.js\`: a van fica essencialmente no mesmo trecho do diorama; as marcas da via e obstáculos se deslocam, mas não há estrada extensa com curvas reais, tráfego ou deslocamento espacial real.
- \`src/main.js#finishRoadDrive\` retorna o jogador para uma posição pré-definida da parada. **É um minijogo funcional no código**, não um percurso 3D contínuo como a apresentação sugere.
- **Correção:** manter o minijogo existente, mas evoluir para estrada modular/segmentos recicláveis, curvas suaves, cenário lateral rolando e faixas visuais mais consistentes; feedback de derrapagem/colisão por câmera e veículo.
- **Critério:** duas etapas visualmente diferentes, indicação clara de distância, sensação de movimento verificável e colisão visível com efeito, testadas em Android.

### P1 — Performance e ciclo de vida dos capítulos

- \`src/world.js#buildWorld\` cria **Fazenda, Rodoviária, interior do ônibus, Aeroporto, Route 66 e Deserto durante o mesmo setup**, embora os módulos posteriores sejam ocultos.
- A Fazenda, cidade-base e seus objetos são desenhados fora de grupos exclusivos; em \`world.update\`, Pantera, galinhas, nuvens, sol e estruturas de Fazenda continuam recebendo atualizações em capítulos distantes.
- \`src/main.js#render\` continua chamando \`world.update\` no menu de abertura.
- São **riscos concretos de trabalho desnecessário**. O impacto real em RAM, draw calls e FPS **não foi medido**.
- **Correção:** carregamento progressivo por capítulo e cache reutilizável, agrupamento de cenário/colliders, atualização apenas de NPCs e sistemas ativos, pausa da simulação no menu, métricas de frame time e pré-carregamento do próximo capítulo.
- **Critério:** nenhuma atualização de Pantera/Fazenda durante o ônibus/deserto; menu sem gameplay; benchmarks desktop e Android antes/depois.

### P2 — Inconsistência de controles por modalidade

- \`src/main.js#bindInputs\`: TAB e botão de toque **bloqueiam troca de personagem** na direção e no evento do aeroporto.
- \`src/main.js#pollGamepadActions\`: comando de troca do gamepad não verifica \`roadRun\` nem \`airportRush\` nessa mesma condição.
- **Efeito:** o jogador de gamepad pode alternar personagem enquanto ambos estão ocultos na van ou no evento.
- **Correção:** centralizar um \`canSwitchHero(gameState)\`, usado por teclado, toque e gamepad; acrescentar testes para pausa, diálogos, puzzles, correria e direção.

### P2 — Personagens, interações e recompensas pouco concretas

- \`src/characters.js\` ainda constrói modelos procedurais com roupas lisas, chapéu/boina e gestos simples. Não foram encontrados arquivos \`.glb\`, \`.gltf\` ou \`.fbx\` na árvore atual.
- A identidade visual pedida anteriormente (camisas xadrez verde/azul, careca de óculos, outro de chapéu e suspensórios) **ainda não está integralmente aplicada**. Confirmar associação nome/aparência antes de substituir modelos.
- O mirante da Route 66 (\`roadPhoto\`) avança por diálogo, **não registra uma foto**; a apresentação do ônibus é um painel de escolhas em vez de coreografia dos dois personagens; a inspeção do aeroporto e o reparo do deserto dependem sobretudo de menus.
- O calor do deserto muda um medidor sem alterar animação/diálogo contínuo ou ritmo; isso é opção de design não punitiva, não bug.
- **Correção:** animações de interação (sentar, pegar bagagem, carregar objeto, ligar máquina, foto, dançar, reparar) e um pequeno álbum de lembranças; feedback de calor com postura/gestos sem perder controle do jogador. Integrar GLBs depois, preservando placeholders até validar rig e animações.

### P2 — Save armazena fase, não posição e consequência

- \`src/main.js#writeSave\` guarda apenas \`version, step, hero, packing\`, com extras isolados para música e direção.
- A retomada reposiciona o personagem em posições **fixas por step**, não na posição em que saiu.
- Desfechos cômicos (bicicleta, colisões de estrada, erro de dança, foto, escolhas) não se tornam lembranças persistentes para capítulos seguintes.
- **Correção:** manter migração v1–v7, acrescentar localização por capítulo com validação de spawn, subcheckpoint, estados de prop e *flags* de humor/lembranças. Importar saves antigos sem quebrar as chaves atuais.

## 4. Avaliação individual — próximos ajustes

### Capítulo 00 — Fazenda
**Manter:** café, rádio, bilhete, loteria, coleta de roupas/documentos/farofa, Pantera, porteira e memórias opcionais.
**Melhorar:** caracterização dos dois protagonistas, câmera dentro de casa, leitura de item coletado no HUD, animação de interagir, conversas ambientais. Teste de uma coleta salva antes de completar a mala.

### Capítulo 01 — Rodoviária
**Manter:** praça, faixa, bicicleta, mala trocada, portão, NPCs e ônibus roxo.
**Melhorar:** percurso urbano, leitura de travessia, explicar o erro de embarque após o acerto do portão 2, posicionar NPCs nos ambientes de seus diálogos, reação visual da bicicleta.

### Capítulo 02 — Excursão Errada
**Manter:** trupe Luzia/Duda/Nico, caixa, cabo, conserto, dança e revelação.
**Melhorar:** âncoras físicas nos assentos/bagagens/mixer, animações dos artistas e dos protagonistas, apresentação com ritmo visual e som sincronizado, transição cinematográfica da Rodoviária ao interior.

### Capítulo 03 — Aeroporto
**Manter:** saguão, check-in, achados e perdidos, farofa, segurança, portão C7, esteira e embarque.
**Melhorar:** mover gatilhos dos corredores aos balcões, leitura de placas no cenário, animação ao passar no detector, cartão de embarque visual, transição do portão ao voo.

### Capítulo 04 — Route 66
**Manter:** direção em dois trechos, Mabel, Nora, Rudy, foto, revisão e pane.
**Melhorar primeiro:** remover apenas durante Route 66 a colisão da cerca da Fazenda e esconder visuais incompatíveis. Depois, cenários rolantes, velocidade, colisões, parada física na lanchonete e foto realmente registrada.

### Capítulo 05 — O Deserto Não Perdoa
**Manter:** van, sombra, água, Rosa, Zeca, Luna, mangueira, placas contraditórias, mirante e calor não punitivo.
**Melhorar:** mão de João segurando galão, leitura visual da bomba, água enchendo recipiente, peça trocada na van, motor parando de fumegar, iluminação de entardecer em contraste com luzes distantes de Vegas. Verificar percurso desimpedido do galão até a van e pista do posto.

## 5. Plano prioritário para próximas revisões

| Rodada | Prioridade | Entregas principais | Aceite |
|---|---|---|---|
| QA-01 | **P0** | Separar colisões/visibilidade por capítulo, remover conflito Fazenda × Route 66 e auditar todo spawn/target | Todos os 46 passos alcançáveis com mapa de colisão ativo e nenhuma interferência entre fases |
| QA-02 | **P1** | Âncoras e gatilhos nos objetos do ônibus/aeroporto, não no centro dos corredores | Interação surge junto ao objeto correto e não através de parede |
| QA-03 | **P1** | Arrumar transição narrativa portão 2 → excursão, sincronizar cutscenes e saves | Fluxo causa/efeito convincente sem remover diálogos ou missões existentes |
| QA-04 | **P1** | Melhorar direção Route 66, foto e animações de NPC/objetos | Duas sequências de direção distintas, foto registrada e feedback visível |
| QA-05 | **P1** | Otimização por capítulo, menu sem simulação, medir desempenho | Benchmarks em Android e desktop, com métricas reais de FPS/RAM, antes/depois |
| QA-06 | **P2** | Identidade low poly dos velhinhos, ritmo e ações físicas, gamepad unificado | Testes end-to-end e de regressão em teclado/toque/gamepad |
| QA-07 | **P2** | Saves com posição/flags e álbum de lembranças | Migrações v1–v7 comprovadas e continuação segura |
| QA-08 | **Aceite final** | Campanha 0–5 jogada na íntegra em PC e Android, com logs/capturas | Nenhum softlock; passagens, minijogos e checkpoints validados |

## 6. Matriz mínima de testes

1. **Progressão completa:** atravessar todos os estados 0–45; além dos testes unitários, usar automação real de navegador com teclado/mouse e verificar mudanças de capítulo.
2. **Reachability:** para cada capítulo, montar os colliders *realmente ativos*, achar caminho do spawn ao objetivo com busca em grade (A*/BFS) e verificar alcance e linha de visão. Incluir colisões **herdadas** da Fazenda/cidade.
3. **Saves:** iniciar de novo, sair em cada capítulo, recarregar na metade da mala, nos passos 7/11/12/17/19/25/27/29/33/35/40/45 e após créditos; verificar personagem correto, posicionamento, inventário, galão e controles.
4. **Entrada:** teclado, joystick touch, gamepad, troca de personagem e pausa em diálogo, escolhas e minijogos; controlar estados de botão no mesmo mecanismo.
5. **Desempenho:** FPS médio, frame time p95, draw calls, geometria, texturas, uso de memória e ocorrências de travamento em celular Android real. Definir alvo antes de marcar aprovado.
6. **Visual:** câmera e clipping no interior da casa, corredor do ônibus, balcões, curvas da estrada e cobertura do posto. Não declarar superado por teste lógico.

## 7. Itens que *não* estão demonstrados

- Não foi executada uma partida real no navegador e **não é possível afirmar que alguma das seis fases foi zerada**.
- O workflow de CI comprova o que seus scripts verificam; não há prova de FPS, animações fluidas, ausência de travamento, qualidade gráfica ou completude de jogo.
- Os valores numéricos de avaliação são heurísticas de priorização editorial, não testes de usuário.
- Esta auditoria **não modifica código jogável**. Serve para iniciar as rodadas QA sem introduzir novos capítulos ou perder conteúdo.

**Status de decisão:** preservar a versão 0.6.0 como base, começar por **QA-01**, seguir pelo item de maior impacto em cada “Próxima” e só avançar a Vegas depois de evidência real de jogabilidade.
