# Capítulo 4 — Route 66

**Implementação:** v0.5.0 · Three.js · nova fase acrescentada após o Aeroporto dos Perdidos.
**Base narrativa:** `JOAO_E_CRIST_PROPOSTA_3D.md`, capítulos 4 e 5.
**Política de preservação:** todos os episódios, puzzles, diálogos, personagens e saves da Fazenda, Rodoviária, Excursão Errada e Aeroporto permanecem.

## História e objetivo

Depois de chegar aos Estados Unidos, João e Crist embarcam em uma van turística e seguem pela Route 66. Crist deseja aproveitar os mirantes; João quer dirigir, fotografar todas as placas e reencontrar Las Vegas. A viagem alterna direção real do veículo em minijogo, exploração de paradas, uma fotografia da dupla, uma revisão preventiva e uma pane em meio ao deserto.

A van não viaja fisicamente por milhares de quilômetros no mapa 3D. Dois trechos representativos usam uma pista que se desloca visualmente, obstáculos com posições calculadas pela progressão e uma câmera atrás do veículo. Entre eles, a pequena área de estrada é explorável a pé. Isso mantém o jogo leve para web/mobile e permite evoluções posteriores.

## Etapas jogáveis

| Step | Objetivo | Mecânica |
|---|---|---|
| 27 | Conhecer a Route 66 | Explorar mapa e placa na beira da estrada; conversar com Mabel |
| 28 | Crist identifica a rota panorâmica | Escolher Route 66 após ler o mapa; erro recuperável |
| 29 | Dirigir o primeiro trecho | A/D, setas, analógico ou joystick do celular; evitar 7 obstáculos |
| 30 | Parar na lanchonete de Mabel | Conversa cômica e descanso |
| 31 | Tirar foto com João e Crist | Interação no mirante com Nora; diálogo sobre Pantera |
| 32 | João revisa o motor | Esperar o motor esfriar antes de conferir a água do radiador |
| 33 | Dirigir pelos desvios do deserto | Segundo trecho com 8 obstáculos, curvas e velocidade maior |
| 34 | Investigar a pane | Motor falha; dupla prepara plano para pedir ajuda no deserto |
| 35 | Conclusão | Gancho para O Deserto Não Perdoa |

As fases originais 0–3 correspondem aos estados 0–26 e **não foram encurtadas**.

## Condução em tempo real

`src/road-state.js` contém duas sequências de distância virtual. O veículo avança automaticamente, mas o jogador controla seu deslocamento lateral de até 2,75 metros dentro da pista. O desvio usa `dt` limitado a 50 ms por quadro para manter comportamento razoavelmente estável; a detecção de colisões não exige física de corpos rígidos.

A função `advanceRoadRun` avalia cada obstáculo uma vez ao ultrapassar sua distância. As faixas são -1, 0 e 1; cones, barris e caixas aparecem nas posições respectivas, animados pelo progresso no trecho. Choques provocam som e mensagem, porém **não causam game over nem apagam o avanço**.

Os dois trajetos incluem:
- Câmera terceira pessoa seguindo a van com amortecimento;
- Carroceria low poly, teto, vidros, pneus e luzes;
- Faixas de asfalto, linha lateral, marcas rodoviárias e obstáculos animados;
- Montanhas, cactos, placas, lanchonete, mirante e oficina;
- Barra de distância e número de obstáculos tocados na tela;
- Comandos: teclado A/D ou setas, controle de toque e analógico de gamepad.

As etapas de direção começam após concluir os puzzles anteriores. Durante a direção, os velhinhos ficam temporariamente ocultos, retornando às posições corretas da parada ao concluir o trecho.

## Exploração entre trajetos

**Mabel:** administra a lanchonete e oferece histórias de estrada e café.
**Nora:** fotógrafa do mirante, registra os dois viajantes e os faz lembrar de Pantera.
**Rudy:** mecânico da oficina, ensina a revisar o radiador somente com motor frio.

O mapa tem objetos decorativos próprios e colliders separados para lanchonete, oficina, bancada e banco. Os marcadores dos objetivos ficam acessíveis de fora desses colliders.

**Crist** escolhe a rota panorâmica. **João** participa da revisão. Puzzles mostram três opções; errar retorna ao diálogo com possibilidade de nova tentativa.

## Salvamento e compatibilidade

A versão do save principal evolui de 5 para **6**, usando a mesma chave `joaoCrist3DSave_v1`.
- Saves v1–v4 continuam migrando exatamente como nas revisões anteriores.
- Save v5 no step 27 (antigo fim do Aeroporto) inicia o primeiro objetivo da Route 66.
- Saves v6 persistem steps 0–35 e os itens da Fazenda.
- Progresso do volante é salvo separadamente em `joaoCrist3DRoadRun_v1` a cada aproximadamente 1,6 s, e ao pausar.
- Reiniciar limpa apenas chaves do jogo 3D, mantendo a edição 2D.

Ao finalizar cada trecho de direção, a chave de progresso parcial é limpa, o jogador retorna ao controle de João/Crist a pé e avança ao próximo objetivo por diálogo.

## Arquivos

- `src/road-state.js`: objetivos, personagens, puzzles, progressão de direção e avaliações.
- `src/road-world.js`: diorama, van, estrada e obstáculos renderizados.
- `src/story.js`: oito novos steps, migração save v6.
- `src/world.js`: ativação da fase e marcadores.
- `src/main.js`: modo direção, câmera, HUD, controles, salvamento, retorno à exploração.
- `index.html`, `style.css`: HUD responsivo de condução.
- `tests/road.test.mjs`: direção, colisões, checkpoints, roteiros e regressões.
- `tests/story.test.mjs`, `tests/airport.test.mjs`, `tests/bus.test.mjs`, `tests/city.test.mjs`: compatibilidade com capítulos anteriores.

## Critérios de aceitação

- [x] Duas sequências dirigíveis; obstáculos e colisões com penalidade apenas cômica.
- [x] Três NPCs de estrada com falas.
- [x] Rota de Crist e revisão de João, com puzzles recuperáveis.
- [x] Cena de foto e cena final de pane.
- [x] Continuidade de todas as missões anteriores.
- [x] Save v6 e progresso parcial de direção.
- [x] Testes automatizados de lógica e regressão.
- [ ] Jogar integralmente no navegador desktop, incluindo choque/desvio e transições.
- [ ] Testar controles de direção em Android, FPS, desempenho e câmera.
- [ ] Verificar visualmente sinalização, sobreposição de objetos e posicionamento dos NPCs.
- [ ] Evoluir som de motor e suspensão, direção com aceleração manual e curvas visíveis no horizonte.
- [ ] Introduzir GLBs rigados de NPCs e veículos mais detalhados.

**Próximo capítulo previsto:** O Deserto Não Perdoa — explorar posto, encontrar água e reparar o veículo para avistar Las Vegas.
