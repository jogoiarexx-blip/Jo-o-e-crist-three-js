# QA-06 — Cenários criados sob demanda e diagnóstico de desenho

**Revisão:** v0.6.7 | **Data:** 31/10/2026 | **Tema:** consumo de recursos antes de entrar em cada capítulo.

## Problema confirmado no código

Antes, buildWorld() chamava os quatro construtores buildBusInterior(), buildAirport(), buildRoute66() e buildDesert() logo após montar o mapa-base Fazenda/Rodoviária. Essas malhas, materiais, NPCs e colisores eram alocados mesmo quando o jogador não tinha saído da Fazenda. QA-01 ocultava os ambientes e desativava colisões fora do capítulo, mas não evitava a alocação antecipada.

## Implementação v0.6.7

- Novo src/lazy-chapters.js: createChapterCache(factories), com get(id), peek(id), loaded() e names(); só chama a fábrica quando get(id) é necessário, e a mantém em cache.
- src/world.js: construtores dos quatro capítulos isolados em fábricas lazy. setChapter(step) obtém somente o capítulo requerido, aplica as camadas de colisão e mantém os demais desativados.
- Métodos world.busInterior, world.airport, world.road e world.desert passam a expor os módulos já carregados, sem provocar criação acidental por uma leitura da propriedade.
- setSoundFixed() e setShowActive() só trabalham com o ônibus depois de criado; setStep() só trabalha com o deserto depois de criado.
- world.update() só atualiza um módulo que exista (e que esteja no intervalo de seu capítulo).
- Marcadores de objetivos permanecem definidos desde o início; seus visuais e posições não são alterados, preservando missões.
- Módulos não são descartados ao sair: voltar ao ônibus, aeroporto, estrada ou deserto reutiliza as mesmas instâncias e evita duplicação de colisores.
- src/main.js: modo ?debug=1 mostra lista de hubs carregados e chamadas de desenho da GPU do último frame.
- package.json/README/index.html atualizados para v0.6.7.

## Comparativo estrutural

| Item | v0.6.6 | v0.6.7 |
|---|---|---|
| Fazenda + Rodoviária no início | Construídas | Construídas (preservadas) |
| Interior do ônibus no início | Construído oculto | Não construído |
| Aeroporto no início | Construído oculto | Não construído |
| Route 66 no início | Construída oculta | Não construída |
| Deserto no início | Construído oculto | Não construído |
| Colisores dos capítulos inativos | Desativados | Desativados; se não visitados, nem instanciados |
| Retorno ao capítulo já visitado | Reutiliza objeto construído | Reutiliza objeto criado na primeira visita |
| Número de hubs futuros criados na tela inicial | 4 de 4 | 0 de 4 |
| Medidor de hubs e draw calls | Não havia na tela de debug | Disponível no modo debug |

**Limite:** a alteração reduz antecipação de criação/alocação de objetos 3D; não prova redução percentual real de RAM, FPS ou tempo de startup sem benchmark em dispositivos. Imports JavaScript desses módulos continuam estáticos; essa fase não envolve divisão dos bundles nem carregamento remoto progressivo. Após visitar todos os capítulos, os quatro hubs permanecem em memória, como antes.

## Testes adicionados

Arquivo tests/lazy-chapters.test.mjs:
- nenhum construtor é chamado antes de visitar o hub;
- capítulo correto é montado na primeira entrada;
- revisitas não reconstroem nem duplicam colisores;
- fase outdoor volta com seus próprios colisores e sem os de outros módulos;
- fábricas inválidas geram erros previsíveis;
- integração textual verifica que src/world.js usa as fábricas e mantém métodos necessários de direção.

Os testes de capítulos, spawns, colisões, transições e saves anteriores devem continuar passando.

## QA manual que ainda falta

- [ ] Abrir na Fazenda com console e ?debug=1: aparecer apenas "fazenda/cidade" até a primeira transição.
- [ ] Entrar no ônibus (step 12) e confirmar interior, pessoas, áudio, cena e objetivos.
- [ ] Entrar no aeroporto (step 19) e confirmar os gatilhos/collision bounds.
- [ ] Retomar um save no começo da Route 66 (27), dirigir os dois trechos e validar world.road.van.
- [ ] Retomar save do Deserto (35–46), verificar galão e temperatura.
- [ ] Voltar repetidamente de um capítulo para outro no teste para assegurar que não há duplicação de paredes.
- [ ] Comparar tempo de entrada, RAM e draw calls antes/depois no mesmo aparelho PC e Android, registrando FPS médio e p95.
- [ ] Checar se a primeira visita gera engasgo perceptível e planejar pré-carregamento/prewarm progressivo se necessário.

## Próximos passos

1. Instrumentar medição real de tempo de montagem (performance.now, memória quando disponível, draw calls por capítulo).
2. Pré-carregar próximo capítulo com orçamento por frame e compilação progressiva de shaders, sem simulação escondida.
3. Revisar câmera interna, colisor dinâmico perto dos GLBs e contato dos pés com o solo em navegador real.
4. Reforçar movimentação da van, ações animadas e preservar save 46 para chegada de Vegas.
