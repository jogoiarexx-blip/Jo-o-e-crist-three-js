# QA-07 — Preparação do próximo capítulo, câmera e pés dos avatares

**Revisão:** v0.6.8 (31/10/2026). Base: v0.6.7. Mudanças de código e testes, sem novas fases.

## Auditoria inicial

Na v0.6.7 os hubs posteriores eram construídos sob demanda em world.setChapter(), no MESMO frame da transição de fase. Isso reduziu trabalho no primeiro carregamento, mas um pico de CPU podia ocorrer quando o ônibus, aeroporto, Route 66 ou deserto fossem criados na primeira visita.

A câmera anterior amostrava 16 pontos na linha até a posição desejada; quando encontrava parede, ainda impunha a distância mínima do perfil, mesmo quando havia parede entre personagem e essa distância mínima. Assim uma câmera podia ficar atrás do sólido. Os rigs dos GLBs reconheciam Foot e Ankle, mas não o osso Toe presente em várias nomenclaturas de esqueleto.

## O que mudou

| Sistema | Antes (v0.6.7) | Depois (v0.6.8) |
|---|---|---|
| Hub futuro | Primeiro construído no step de entrada | Construído durante oportunidade ociosa em objetivos anteriores, quando possível |
| Fazenda na abertura | Somente mapa base | Igual; não monta os quatro hubs sem o jogador avançar |
| Cache de hubs | Instâncias reutilizadas | Instâncias continuam reutilizadas; prewarm usa o mesmo cache |
| Colisores do prewarm | Não aplicável | Nenhum colisor de hub novo é ativado antes da transição |
| Obstrução da câmera | 16 amostras, distância mínima forçada | 32 amostras e distância segura menor que o mínimo quando necessário |
| Contato do pé | Foot / Ankle | Foot / Ankle / Toe; continua ignorando IK/targets |
| Saves | Versão interna 7 | Versão interna 7, sem resets |

### Agenda de preparação antecipada

- **Etapas 9–11:** preparar interior do ônibus antes da entrada no estado 12.
- **Etapas 16–18:** preparar aeroporto antes do estado 19.
- **Etapas 24–26:** preparar Route 66 antes do estado 27.
- **Etapas 31–34:** preparar deserto antes do estado 35.

A chamada usa requestIdleCallback com timeout onde disponível; o fallback é setTimeout. A montagem permanece síncrona no momento da execução do callback. Ela é deslocada de um frame de transição para um momento anterior, **não dividida em várias parcelas de CPU**. Se o callback não acontecer antes da transição, world.setChapter() ainda garante o ambiente correto. Se o usuário entrar por save no começo da fase, o mapa é criado normalmente. A técnica não garante ausência de travadinhas.

### Câmera

- Novo src/camera-occlusion.js expõe cameraClearanceDistance(), função pura testável.
- Raio XY/altura varia entre foco e câmera; a primeira colisão define um recuo seguro com margem.
- Se houver parede a menos de 1.15 unidades, a câmera pode aproximar-se a 0.22 unidade ao invés de ficar atrás do obstáculo.
- Recuperação suave para a distância normal é mantida; ao aproximar-se de uma obstrução, recuo é imediato.
- Os perfis de zoom e os comandos existentes não foram alterados.

### Pés

- Novo isFootContactBone() inclui nomes com Foot, Ankle e Toe.
- Alvos IK, controladores, helpers e poles são excluídos.
- A correção temporal e suave da altura usa os ossos encontrados sem mover os colisores, saves ou câmeras do personagem.
- Não foi provado que os dois GLBs específicos contenham esses nomes nem foi avaliado o pé visualmente em movimento. Se o rig não tiver nenhum osso compatível, só o alinhamento da pose inicial fica ativo.

## Testes novos

- tests/prewarm-camera.test.mjs: matriz completa 0–46 para agenda dos hubs; câmera livre, parede perto, orientação e entradas inválidas; integração dos hooks.
- tests/avatars.test.mjs: reconhecimento de Foot, Toe, Ankle e exclusão de IK/ossos não relacionados.
- Testes anteriores de camadas, colisão, narrativa, migração, carregamento e input devem permanecer verdes.

## Testes visuais e de desempenho ainda necessários

- [ ] Comparar frame time p95 e p99 na entrada do ônibus, aeroporto, estrada e deserto, antes/depois, no mesmo PC e Android.
- [ ] Observar se a primeira preparação na fase anterior causa pico perceptível e mover/splitar trabalho se necessário.
- [ ] Medir tempo de compilação de shaders na primeira renderização após prewarm; a compilação GPU não é explicitamente feita nessa revisão.
- [ ] Testar câmera em todas as direções dentro da casa, corredor do ônibus e aeroporto, inclusive com paredes a menos de 1.15 unidades.
- [ ] Jogo inteiro com João e Crist em idle, walking, running e dança; observar contato do pé, skate, clipping e sapatos.
- [ ] Confirmar nenhuma alteração de saves existentes e reinício explícito só no botão próprio.

**Status:** mudanças implementadas no código; testes automatizados podem ser verificados no GitHub Actions. Não afirmar que foi jogado no navegador, que o FPS melhorou por uma porcentagem medida ou que o GLB está perfeitamente alinhado sem vídeo de QA.
