# Capítulo 3 — Aeroporto dos Perdidos

**Versão:** v0.4.0 · Three.js · novo mini-hub jogável.
**Continuação v0.5.0:** a Route 66 foi acrescentada em `FASE-05-ROUTE66.md`. O Aeroporto permanece integralmente no jogo.
**Documento-mestre:** `JOAO_E_CRIST_PROPOSTA_3D.md`, capítulo 3.
**Regra:** adicionar oito missões sem apagar Fazanda, Rodoviária, Excursão Errada, saves ou o jogo 2D.

## Direção da fase

Após ajudar a trupe Estelar, João e Crist recebem uma carona ao aeroporto. O jogador precisa interpretar sua passagem, achar o documento perdido, preparar a bagagem, passar pela inspeção e reagir a uma confusão na esteira rolante. O aeroporto é fictício: **Aeroporto Boa Sorte**, voo **BS408**, conexão internacional e portão **C7**. As ações não pretendem representar regras oficiais de qualquer aeroporto.

A comédia nasce de João improvisar, Crist conferir pistas, e da cumplicidade entre ambos. Erros oferecem comentários engraçados e podem ser corrigidos sem reiniciar a etapa.

## Progressão completa

| Step | Missão | Interação | Protagonista |
|---|---|---|---|
| 19 | Chegar ao aeroporto | Explorar e consultar painel de partidas | Ambos |
| 20 | Check-in | Identificar balcão B, voo BS408 | Crist |
| 21 | Passaporte perdido | Recuperar pasta azul JOÃO | Crist |
| 22 | Bagagem e farofa | Apresentar pote e mala para inspeção | João |
| 23 | Detector de segurança | Separar moedas e chaves na bandeja | Crist |
| 24 | Mudança de portão | Ler atualização BS408 → C7 | Crist |
| 25 | Correria na esteira | Reflexo para evitar tropeço; ambos os resultados avançam | Ambos |
| 26 | Embarque | Apresentar cartões de embarque e entrar no avião | Ambos |
| 27 | Encerramento | Cena final e gancho da próxima viagem | — |

**Transição:** o step 18 da excursão continua encerrando normalmente. Ao terminar os diálogos, os personagens são deslocados para o aeroporto e os colliders do ônibus são removidos. O aeroporto é ativado somente no step 19. Salvar após o embarque mantém a continuação.

## Geometria e navegação

O aeroporto está isolado na área `x=37..96`, `z=-40.8..-23.1`, dentro dos limites da engine atual. A geometria 3D temporária usa paredes envidraçadas, piso quadriculado, marquise, balcões, lixeiras, bancos, scanner, painel de voos, portão C7 e silhueta estática de aeronave. O teto fica invisível para a câmera acompanhar os dois velhinhos.

O corredor central em `z=-31.5` permanece livre dos colliders da sala. O novo módulo alterna visibilidade e seus colliders com o ônibus para evitar conflitos. Cenário exterior do jogo original não é modificado.

## Investigação e cooperação

**Crist** confere o balcão, descobre em qual pasta está o passaporte, separa objetos pessoais para inspeção e verifica a alteração do portão no painel. **João** organiza o pote de farofa, gerando diálogos sobre o que colocou na bagagem.

Cada painel usa três alternativas claramente legíveis, teclado 1/2/3, setas/Enter, mouse, toque e gamepad A/Y. Selecionar a opção errada não altera o checkpoint e abre diálogo de recuperação.

## Correria

Em `airRush`, a esteira rolante apresenta um evento breve. Pressionar Espaço, Ação, Esquivar ou o controle antes do término recupera o equilíbrio de João; não reagir gera uma pequena sequência de tropeço, sem machucados ou game over. Ambos avançam ao portão de embarque. Pausar congela o tempo do evento.

## Personagens locais

- **Nina, atendente:** informa número do voo e ajuda no check-in.
- **Léo, Achados e Perdidos:** identifica a pasta azul do João.
- **Mara, agente de inspeção:** explica bandejas e segurança.

São NPCs procedurais independentes que não bloqueiam o corredor. Suas conversas são opcionais.

## Implementação

- `src/airport-state.js`: oito objetivos, coordenadas, NPCs, cinco puzzles, diálogos, colisões, resultado do evento.
- `src/airport-world.js`: terminal e props 3D, atualização opcional dos NPCs, geometria e ativação por capítulo.
- `src/story.js`: inclusão das missões, saves versão 5.
- `src/world.js`: rota de renderização e colisões exclusivas para aeroporto.
- `src/main.js`: transição, diálogos, puzzle de escolha, reflexo de esteira e checkpoints.
- `tests/airport.test.mjs`: missões, corredor desobstruído, respostas, reflexo e retrocompatibilidade.
- `tests/story.test.mjs`, `tests/city.test.mjs`, `tests/bus.test.mjs`: regressão das fases anteriores.

## Preservação dos saves

`joaoCrist3DSave_v1` continua sendo a única chave do progresso da aventura. A versão interna passa para **v5**. Um save v4 no antigo encerramento (19) começa no aeroporto (19), sem repetir o ônibus. Saves v1, v2 e v3 seguem sendo migrados com as regras anteriores. A edição 2D permanece intocada.

## Checklist técnico

- [x] Oito novos objetivos, progressão coerente e diferenças entre João/Crist.
- [x] Terminal com objetos e sinalização de pistas.
- [x] NPCs opcionais, cinco escolhas recuperáveis e reflexo sem game over.
- [x] Capítulos 0–2 e suas interações preservados no código.
- [x] Colisores exclusivos, sem expandir a área global do mapa.
- [x] Retrocompatibilidade da versão de save e testes de código.
- [ ] Partida visual completa no navegador, da Fazenda ao embarque.
- [ ] Teste Android, GPU/frame pacing, câmera, toque, gamepad e áudio.
- [ ] Substituição gradual de NPCs por GLBs rigados.
- [ ] Animação real de passagem pelo raio-X, embarque e avião decolando.
- [ ] Perícia visual para verificar placas, sombras, z-fighting e sobreposição de NPCs.

**Próximo capítulo:** Route 66, conforme MD original. Avançar somente depois de verificar a jogabilidade real do Aeroporto.
