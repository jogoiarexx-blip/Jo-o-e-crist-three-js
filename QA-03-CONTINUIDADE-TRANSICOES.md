# QA-03 — Continuidade narrativa e transições de capítulos

**Revisão:** v0.6.3 · **Base:** v0.6.2 · **Capítulos preservados:** Fazenda, Rodoviária, Excursão Errada, Aeroporto, Route 66, Deserto.
**Objetivo:** corrigir causa/efeito entre fases e eliminar duplicação de lógica de transição sem criar novos capítulos ou invalidar saves.

## Diagnóstico anterior

1. Em `src/story.js`, Crist acertava o portão **2** do traslado ao aeroporto e, logo depois, os dois escolhiam o ônibus da Excursão Estelar por parecer bonito. O acerto do puzzle ficava narrativamente sem efeito.
2. As entradas de capítulo estavam duplicadas em blocos de `advanceTo`; o avanço 6→7 ainda teleportava os personagens manualmente dentro do final do diálogo, separado das outras entradas.
3. A Excursão terminava com uma revelação que supunha que a dupla desconhecia o engano, apesar da conversa anterior.
4. Aeroporto → Route 66 pulava o trajeto aéreo em uma frase genérica, sem explicar claramente a conexão e a chegada aos EUA.
5. O chapéu que provoca a confusão não se desprendia de João no cenário.

## Alterações implementadas

### Sequência da Rodoviária corrigida

O jogador continua identificando o **portão 2** com Crist, sem mudar a resposta do desafio. Após a conferência, anúncios de dois embarques se sobrepõem ao aviso e uma rajada de vento leva o chapéu de João até a fila do **portão 3**.

João corre para recuperá-lo, entra no ônibus roxo só para buscá-lo, Crist sobe atrás de João para trazê-lo de volta e o motorista fecha a porta no tumulto. O ônibus parte. Isso explica **por que Crist acompanha João mesmo sabendo qual é o portão correto**.

A sinalização do cenário separa visualmente PORTÃO 2 · AEROPORTO e PORTÃO 3 · EXCURSÃO ESTELAR. O antigo letreiro "VEGAS?" do ônibus foi trocado por "SHOW ESTELAR", deixando claro que o erro decorre da correria, não de uma informação falsa. O desfecho dentro do ônibus passa a revelar a **cidade do festival**, não a existência do engano já conhecido.

### Chapéu em cena

O chapéu de João é agrupado em `src/characters.js` e pode ser ocultado sem alterar rosto, roupa, rig ou outras poses. `src/world.js` desenha uma cópia procedural pequena do chapéu voando perto do portão 3 apenas na missão 11; ela integra o grupo visual exterior e some quando o ônibus é ativado. `src/main.js` esconde o chapéu original nesse checkpoint e o restaura no passo 12. A animação de João ganhou gesto de **alcançar o chapéu** nos diálogos relacionados.

**Limite visual:** é um efeito procedural simples, não uma simulação física de vento com trajetória até o interior do veículo.

### Cinco passagens com fonte única

`src/chapter-transitions.js` associa cada par de estados anterior/próximo a dados únicos:

| Passagem | Step | Efeito narrativo |
|---|---|---|
| Fazenda → Rodoviária | 6→7 | Chegada à cidade depois do ônibus do sítio |
| Rodoviária → Excursão | 11→12 | Portas fecham com João e Crist no ônibus errado |
| Excursão → Aeroporto | 18→19 | Beto leva os novos amigos ao aeroporto |
| Aeroporto → Route 66 | 26→27 | Voo, conexão e chegada aos Estados Unidos |
| Route 66 → Deserto | 34→35 | A mesma van avaria e encosta perto do posto |

Cada passagem informa **spawn, posição relativa do acompanhante, câmera, aviso curto e fala de transição**. Em `advanceTo`, o reposicionamento ocorre antes de atualizar missão e salvar; o retorno por save usa o mesmo cadastro de posicionamento no início de cada capítulo.

A retomada de saves já no meio das fases usa as posições anteriores de cada missão. Os saves v1–v7 mantêm seus índices e a campanha continua com **47 estados** e **seis capítulos**.

## Testes

`tests/chapter-transitions.test.mjs` verifica a lista completa das cinco passagens, sua correspondência com limites de capítulo, as duas possibilidades de herói, a distância entre companheiros, spawns não bloqueados no ônibus/aeroporto/Route 66/deserto e a consistência de roteiro/placas. Também checa a integração do módulo no loop do jogo, sem adicionar novos objetivos e sem alterar migrações anteriores.

**Ainda pendente:** jogar as seis fases do início ao fim em navegador; validar gestos e chapéu visualmente, especialmente em smartphone; avaliar a duração e legibilidade das cenas, áudio e câmera. Os testes automatizados de código não demonstram isso.

## Próxima prioridade da auditoria

**QA-04:** evoluir a direção da Route 66 de minijogo lateral para percurso visual convincente, melhorar colisões e criar fotografia persistente dos dois velhinhos no mirante. Não começar Vegas antes de consolidar as fases existentes.
