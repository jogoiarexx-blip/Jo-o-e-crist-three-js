# Capítulo 5 — O Deserto Não Perdoa

**Versão:** v0.6.0. **Local:** posto e mirante fictícios do deserto de Nevada.
**Fonte:** \`JOAO_E_CRIST_PROPOSTA_3D.md\`, Capítulo 5: calor, posto de estrada, placa contraditória, água, ajuda e reparo; termina com sinais de Las Vegas.
**Regra de produção:** apenas acrescentar, sem apagar a Fazenda, Rodoviária, Excursão Errada, Aeroporto e Route 66.

## Conceito de jogabilidade

A pane do final da Route 66 se transforma em um capítulo de exploração a pé e cooperação. Não basta escolher alternativas numa sequência de menus: o jogador precisa **andar pelo cenário** para encontrar abrigo, galão, bomba de água, van, mecânico, oficina, duas placas e um mirante. O galão aparece como objeto 3D na mão de João durante o transporte, sem reaparecer como coleta depois de entregue. A cena termina no mirante, com luzes da cidade surgindo no horizonte.

O capítulo mantém o humor dos dois velhinhos e não usa morte, combate, contagem regressiva punitiva ou perda de save como penalidade.

## Roteiro e objetivos

| Step | Objetivo | Personagem / experiência |
|---|---|---|
| 35 | Inspecionar a van com defeito | João descobre a pane; a van permanece estacionada |
| 36 | Procurar sombra | A dupla explora a cobertura do posto e se refresca |
| 37 | Encontrar um galão vazio | Coleta no abrigo e procura por fonte indicada de água |
| 38 | Ler sinalização da água | Crist identifica a bomba azul potável, sem usar a desativada |
| 39 | Encher o galão | João interage com a bomba escolhida |
| 40 | Transportar a água até a van | João **carrega visualmente** o galão pelo cenário até o veículo |
| 41 | Pedir ajuda ao mecânico | Zeca identifica a mangueira rachada e fornece orientação |
| 42 | Escolher a peça compatível | João resolve um desafio de reparo |
| 43 | Concluir a revisão | João só finaliza com o motor frio, seguindo o mecânico |
| 44 | Decifrar placas contraditórias | Crist confronta estrada fechada e rota atualizada para Vegas |
| 45 | Ir ao mirante | Os dois avistam luzes de Las Vegas e encerram o capítulo |
| 46 | Tela de conclusão | Gancho para **Bem-vindos a Vegas** |

## Cenário 3D

O novo hub tem coordenadas próprias, afastadas das fases anteriores (\`x = -80..-44, z = -32..12\`) e é ativado apenas no capítulo 5. O chão árido, pequenos morros e cactos criam a paisagem; a estrada interrompida conecta visualmente com a Route 66. A van está parada com capô aberto e vapor decorativo.

O **Posto Água Clara** tem área coberta, banco, galão, bomba azul identificada como água potável e bomba vermelha desativada. A **Oficina Zeca** contém bancada e ferramentas. Há duas placas distintas, uma antiga apontando para uma estrada fechada e outra indicando Vegas na direção correta. O mirante apresenta luzes distantes **como referência visual**, não como cidade já explorável.

A cobertura de sombra é translúcida para não esconder a câmera em terceira pessoa. Colisões são apenas dos elementos sólidos, não do caminho aberto; a interação com a van acontece do lado de fora do volume físico. O módulo \`src/desert-world.js\` registra e remove os próprios colliders com o capítulo, sem interferir nas fases anteriores.

## Calor e sombra

A função \`advanceDesertHeat(heat, atShade, dt)\` aumenta calor lentamente sob o sol e reduz sob a cobertura. A barra vai de 0 a 85, atualiza a etiqueta **Confortável / Quente / Muito quente** e recomenda sombra. O valor é propositalmente **não punitivo**: não tira vida, não impede a coleta e não reinicia etapas. A medição é uma mecânica de ambientação, não uma estimativa real de temperatura.

## Água e transporte

Ao encontrar o galão vazio (step 37) ele permanece no abrigo. Depois de identificar a bomba adequada (38), João o enche (39). No step 40, o objeto acompanha a posição de João em cada atualização; Crist pode ser selecionado para observar, mas **somente João entrega** o galão à van. No step 41 o objeto passa a ficar ao lado do veículo.

A mecânica simula transporte com o mesmo sistema de navegação dos personagens e não usa inventário arrastável nem física pesada. Como o step é persistido, fechar o navegador e voltar conserva a etapa de transporte.

## Desafios e NPCs

O sistema de escolhas da cidade, ônibus, aeroporto e Route 66 é reutilizado; quatro novos puzzles de três alternativas têm resposta fundamentada nas placas e nos diálogos do cenário. Erros reproduzem falas e permitem tentar novamente.

- **Rosa, dona do posto:** esclarece qual bomba está identificada.
- **Zeca, mecânico:** explica a mangueira compatível e recomenda aguardar o motor esfriar.
- **Luna, viajante:** conhece as placas contraditórias e o mirante.

Crist interpreta a sinalização. João resolve a parte prática. **Nota de segurança:** instruções narrativas de manutenção são simplificadas; não são um procedimento técnico para reparar um veículo real.

## Save e compatibilidade

A mesma chave \`joaoCrist3DSave_v1\` mantém a história, agora com **versão interna 7**:
- v1–v5 são migradas com as regras anteriores.
- v6 no antigo encerramento (35) retoma a nova fase no step 35.
- v7 persiste os steps 0–46, personagem controlado e itens já recolhidos.
- Galão, reparo e retorno à exploração são derivados do checkpoint, evitando estado inválido.
- O save do jogo 2D e dos demais projetos não é alterado.

## Arquivos

- \`src/desert-state.js\` — objetivos, NPCs, puzzles, sombra, calor, colisões e falas.
- \`src/desert-world.js\` — ambiente 3D, posto, van, galão, oficina, sinais e mirante.
- \`src/story.js\` — 11 novos objetivos e migração v7.
- \`src/world.js\` — montagem, marcadores e ativação exclusiva do deserto.
- \`src/main.js\` — transição, lógica de interação e carregamento, UI e persistência.
- \`index.html\` e \`style.css\` — HUD de calor e final atualizado.
- \`tests/desert.test.mjs\` — regressão, obstáculos, acessibilidade, puzzles, calor, saves.
- \`tests/story.test.mjs\` e demais testes — compatibilidade com os capítulos anteriores.

## Checklist

- [x] Todos os cinco capítulos preservados; 11 missões adicionais.
- [x] Abrigo de sombra, bomba de água, galão transportável, oficina e placas.
- [x] Tarefas distribuídas entre João e Crist, com diálogos.
- [x] Calor gradual, feedback na UI, sem game over.
- [x] Puzzles repetíveis, mesmo após erro.
- [x] Save v7 compatível com v1–v6.
- [x] Testes automáticos de lógica, colisão e narrativa adicionados.
- [ ] Jogar visualmente do primeiro capítulo até o mirante, PC e Android.
- [ ] Medir FPS no celular, verificar sombras, clipping, pontes e alinhamento dos objetos.
- [ ] Melhorar animação real de carregamento do galão, interação com a bomba e abertura do capô.
- [ ] Evoluir microclima, áudio de vento e fotografias sem prejudicar o desempenho.
- [ ] Substituir NPCs procedurais por GLB rigado quando houver modelos.

**Próximo capítulo do MD:** Bem-vindos a Vegas — hotel, reservas, luzes, táxi e entrar no local errado.
