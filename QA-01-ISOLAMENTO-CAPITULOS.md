# QA-01 — Isolamento espacial e validação de navegação

**Revisão:** v0.6.1 · **Alvo:** 00 Fazenda; 01 Rodoviária; 02 Excursão Errada; 03 Aeroporto; 04 Route 66; 05 Deserto.  
**Base:** auditoria `AUDITORIA-CAPITULOS-00-05.md`. **Mudanças:** apenas infraestrutura, integração espacial e testes, sem cortar cenas, NPCs, tarefas ou saves.

## Problema reproduzido

Os cenários do sítio e da Rodoviária eram adicionados diretamente à cena principal, e seus colisores permaneciam ativos quando o jogo mudava para o ônibus, aeroporto, Route 66 ou deserto. O caso mais grave era a cerca da Fazenda: `south-fence` ocupa `x=-40.4..13.1` e `z=23.75..24.25`. Ela atravessava a nova área da Route 66. Na auditoria, a linha da cerca bloqueou 28 pontos de amostragem entre x=-40 e -13; durante a Route 66, essa cerca não deveria existir.

## Correção aplicada

1. `src/world.js` passa a capturar os objetos originais (chão, casa, cerca, árvores, cidade, ônibus externo, ciclista, Pantera, galinhas, adereços e nuvens) em `outdoorRoot`. Os marcadores globais continuam fora desse grupo para servir a todos os capítulos.
2. `src/chapter-layers.js` define qual grupo está ativo pelo estado da campanha: **0–11 outdoor**, **12–18 bus**, **19–26 airport**, **27–34 road**, **35+ desert**.
3. O conjunto de colisores originais é registrado por **referência de objeto**, sem filtros aproximados por coordenadas ou nomes. Ao desativar o mundo original, somente seus retângulos são removidos do array ativo; ao voltar, retornam uma única vez.
4. O próprio capítulo ativa/desativa os seus colisores internos; o controlador exige **um único capítulo ativo**. Os grupos são ocultados quando não usados, sem apagar meshes nem objetos antigos.
5. Quando a porteira da Fazenda se abre, seu collider também é removido do registro original para que não reapareça caso o capítulo seja reativado.
6. Pantera, galinhas, nuvens e a animação do ônibus externo deixam de ser atualizados fora dos capítulos 00–01. O relógio/sol e marcadores continuam funcionando.
7. A definição dos quatro colisores da Route 66 foi transferida para `src/road-state.js` em `makeRoadColliders()`. O ambiente 3D e os testes usam o mesmo conjunto.

## Comparativo de código

| Sistema | Antes v0.6.0 | Depois v0.6.1 |
|---|---|---|
| Colisão antiga na Route 66 | Cerca em z=24 atravessava a área | Cerca removida do conjunto ativo apenas na fase 04 |
| Visibilidade da Fazenda/Rodoviária em hubs | Objetos originais sempre no mundo | Grupo original invisível nas fases 02–05 |
| Camadas de colisão | Elementos originais e módulos misturados | Apenas colisores do capítulo atual |
| Troca de capítulo | Módulos independentes sem desligar mundo original | Controlador exclusivo e idempotente |
| Retorno à Fazenda | Possibilidade de restaurar porteira bloqueada | Porteira aberta preserva sua remoção de collider |
| Colisões da Route 66 | Definidas só no construtor 3D | Mesma função pura no jogo e nos testes |
| Simulação dos objetos originais | Continuava fora da Fazenda | Atualização limitada aos capítulos 00–01 |
| Saves | Versão interna 7 | **Mantida versão 7**, nenhum reset |

## Testes adicionados

`tests/chapter-layers.test.mjs` verifica:

- Entrada e saída de todos os capítulos, incluindo bordas 11→12, 18→19, 26→27, 34→35, final 46 e retorno aos capítulos anteriores.
- Visibilidade exclusiva, não duplicação dos colliders em chamadas repetidas e restauração dos colisores da Fazenda no capítulo original.
- Cercas e paredes preservadas na Fazenda, excluídas da Route 66; oficina da Route 66 continua com colisão.
- Comportamento da porteira aberta quando o jogador volta ao sítio.
- Busca em grade de 0,5 m com `isBlocked()` e `canReachInteraction()` para confirmar **rotas de cada spawn** a todos os 34 marcadores de ônibus (7), aeroporto (8), Route 66 (8) e deserto (11), com as camadas de colisão próprias de cada capítulo.

**Nota:** a busca em grade confirma acesso à área circular do objetivo, não valida colisão pixel-perfect, animação, visual de câmera, controle de gamepad, obstáculos dinâmicos nem execução em WebGL.

## Estado restante — não confundir com resolução

- **QA-02:** âncoras das interações do ônibus e aeroporto ainda estão afastadas dos objetos; precisam ser alinhadas aos balcões e equipamentos 3D.
- **QA-03:** a passagem do guichê correto para o ônibus errado precisa de causa narrativa mais convincente.
- **QA-04:** condução Route 66 e a fotografia precisam de refinamento.
- **QA-05:** carregamento ainda constrói todos os hubs antecipadamente; é necessário medir o desempenho em dispositivos reais e considerar lazy loading/LOD.
- **QA-06–08:** animações dos protagonistas, controles e campanha completa em navegador/Android.

**Não há evidência de partida integral manual.** Testes automatizados, mesmo aprovados, não certificam gameplay sem softlocks visuais. A próxima rodada recomendada é **QA-02 — âncoras físicas de interação no ônibus e aeroporto**.
