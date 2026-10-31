# QA-12 — Direção e apresentação da van na Route 66 (v0.6.13)

Data: 31/10/2026. Base: v0.6.12.

## Auditoria inicial

Os dois trechos jogáveis (etapas 29 e 33) avançavam sempre à mesma velocidade; o jogador controlava somente a posição lateral e o veículo saltava lateralmente sem aceleração da guinada. A posição do obstáculo era conferida somente no final do frame, mesmo se o carro tivesse mudado de faixa durante o cruzamento. Na cena, a paisagem era quase estática, o modelo inclinava conforme a **posição** na faixa em vez da velocidade de virar e o HUD não informava a velocidade.

## Implementação da revisão

### Controles e movimento

| Ação | Antes | v0.6.13 |
|---|---|---|
| Soltar W/S | avanço fixo | cruzeiro automático mantido para acessibilidade |
| W / ↑ / analógico para cima | movimento da câmera/personagem, não alterava direção da van | aceleração gradual até 132% do cruzeiro |
| S / ↓ / analógico para baixo | não alterava velocidade | frenagem gradual até 38% do cruzeiro, sem parar totalmente |
| A/D / ←→ / analógico horizontal | deslocamento lateral instantâneo | velocidade lateral com resposta progressiva e amortecimento |
| Obstáculo atingido | apenas conta batida | conta batida e reduz temporariamente a velocidade, seguida de recuperação |
| Finalização | conclui com qualquer avaliação, sem game over | mantida |

A integração é baseada em dt com resposta exponencial, mantendo um limite de 50 ms por passo de simulação. A posição lateral é limitada a ±2,75 unidades, mantendo a van na pista.

### Colisões

Para cada obstáculo atravessado, a posição horizontal é interpolada no instante em que o carro atinge sua distância longitudinal, em vez de usar a coordenada ao final do frame. Obstáculos são marcados como passados e não voltam a contar após o primeiro contato. A contagem permanece não punitiva.

### Apresentação 3D

- O HUD de direção mostra velocidade aproximada em km/h, distância restante, progresso e total de obstáculos. O valor em km/h é escala de jogo, não telemetria física de um veículo real.
- A câmera segue o eixo lateral da van suavemente, com enquadramento um pouco mais aberto ao acelerar.
- O modelo inclina e aponta nas curvas proporcionalmente à velocidade lateral, com balanço leve na suspensão.
- Grupos low poly de cactos e pedras deslocam-se nas margens da estrada para reforçar a sensação de passagem, sem criar obstáculos de colisão adicionais.
- Os grupos são reutilizados, sem alocação de novas malhas a cada frame.
- O teclado, gamepad e joystick touch usam o mesmo fluxo de controles do jogo.

### Compatibilidade

- Os saves internos permanecem na versão 7.
- Arquivos antigos de direção contendo somente stage/progress/offset/hits/passed ganham campos speed e lateralVelocity com valores iniciais de cruzeiro e zero.
- O reinício, pausa e retomada continuam com persistência do progresso; desafios Route 66 (roadRoute e roadRepair) preservados.
- O mapa da Fazenda, os personagens GLB e os capítulos anteriores não são modificados.

## Testes automatizados adicionados

Arquivo `tests/road-handling.test.mjs`:
- aceleração, cruzeiro automático, frenagem não bloqueante, recuperação;
- volante gradual, limites das faixas e amortecimento;
- invariância aproximada entre 30 e 60 FPS;
- nenhuma movimentação com dt=0 e entradas inválidas;
- migração de estados antigos/corrompidos da van;
- impacto desacelera, é contado uma vez, não bloqueia fase;
- ligação entre HUD, input, câmera e objetos gráficos de margem.

Testes anteriores `tests/road.test.mjs` continuam cobrindo as duas etapas dirigíveis, posição dos obstáculos, fim de percurso, colisão e avaliação.

## Limitações e QA manual

- Não implementa direção livre sobre uma malha de rodovia longa. Os dois trechos continuam sendo uma faixa virtual de desvio, agora com controles de velocidade e inércia melhorados.
- Paisagem lateral é cíclica; em uma próxima etapa poderá ser substituída por segmentos de estrada com curvas reais, LOD e cenários com variedade.
- O efeito visual e a sensação dos controles **não foram validados em uma partida real por navegador** nesta revisão. Os testes Node validam a simulação e o uso dos dados; não medem FPS/consumo de memória de um dispositivo real.

Checklist para validação no jogo:
- [ ] Trecho 1 (step 29): começar sem pressionar nada, confirmar avanço automático.
- [ ] W acelera, S reduz velocidade, A/D/analógico altera faixa gradualmente.
- [ ] Soltar comandos mantém o cruzeiro, sem ficar preso ou acumular movimento após pausa.
- [ ] Câmera acompanha; cactos/pedras passam ao lado sem bloquear a pista.
- [ ] Obstáculo na mesma faixa aumenta contagem e reduz momentaneamente velocidade; desvio evita contato.
- [ ] Trecho 2 (step 33): completar com sucesso e retornar aos objetivos seguintes.
- [ ] Em save antigo da Route 66, retomar direção e concluir sem reset.
- [ ] Celular, controle Xbox/PlayStation, teclado e resolução pequena.
