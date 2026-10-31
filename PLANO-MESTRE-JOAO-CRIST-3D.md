# JOÃO & CRIST 3D — PLANO-MESTRE DE EVOLUÇÃO E CAMPANHA COMPLETA

**Revisão documental:** 31/10/2026  
**Base auditada:** v0.6.5, commit 363b5579620568d321d288a40520b932d01e70e6  
**Escopo:** jogo Three.js deste repositório; não altera o jogo 2D original.  
**Estado:** plano de produção, NÃO implementação das novas fases.

> NORMA DE EVIDÊNCIA: "[IMPLEMENTADO]" significa que existem código, objetivos e testes; NÃO significa que uma partida visual completa foi realizada. "[PENDENTE DE QA]" requer gameplay no navegador/Android. "[PLANEJADO]" não existe como fase jogável. Metas de FPS e duração são objetivos, não medições.

---

## 1. Resumo executivo

João e Crist saem do Sítio Boa Sorte depois de ganhar na loteria, passam pela cidade, entram na excursão errada, enfrentam o aeroporto, viajam pela Route 66 e consertam a van no deserto. Hoje a campanha para quando veem Las Vegas no horizonte. Esse NÃO é o encerramento definitivo da história.

**Inventário auditado:**
- **Seis capítulos existentes:** 00 Fazenda, 01 Rodoviária, 02 Excursão Errada, 03 Aeroporto, 04 Route 66, 05 Deserto.
- **47 estados da campanha (0–46):** 0–45 são objetivos/ações; 46 é tela terminal provisória do deserto.
- **Capítulos ainda NÃO CRIADOS:** 06 Bem-vindos a Vegas, 07 A Noite na Boate, 08 O Cassino, 09 O Sonho Realizado e Retorno.
- **Conteúdo legado 2D a considerar como EXTRAS:** Clube dos Assassinos, Trono do Deus das Apostas e pescaria de Chico Fumaça; não estão implementados como capítulos 3D.
- **Técnica existente:** Three.js 0.180.0 por import map/CDN, módulos ES, personagens JOAO.glb e CRIST.glb.part1/part2, AnimationMixer, câmera em terceira pessoa, colisão 2D por retângulos, controles teclado/touch/gamepad, save local versionado, WebAudio sintético, testes Node, GitHub Actions/Pages.
- **Último CI verificado:** o commit base concluiu com sucesso o fluxo "Testar e publicar João & Crist 3D" e o Pages. Isso atesta os checks automatizados configurados, não teste visual de cada fase.

### Decisão criativa

Manter a **aventura cômica da loteria** como campanha principal. João age por impulso e improvisa; Crist observa, planeja e resolve pistas. O humor deve surgir das decisões deles e da reação dos ambientes, nunca de ridicularizar NPCs por identidade. O objetivo final é realizar um sonho e voltar para Pantera com histórias absurdas — não transformar a campanha em um jogo de combate sem preparação narrativa.

---

## 2. O que temos hoje — inventário de conteúdo e evolução

| Cap. | Etapas | Construído | Qualidade verificada | Falta para ficar pronto |
|---|---:|---|---|---|
| 00 — Fazenda | 0–6 | Casa, café, rádio, bilhete, loteria, mala com documentos/roupas/farofa, Pantera, galinhas, porteira, três lembranças opcionais | Regras de coleção, migração, colisão e caminho cobertas em testes | Animações físicas, câmera da casa, naturalidade dos GLBs e partida real ponta a ponta |
| 01 — Rodoviária | 7–11 | Praça, faixas, bicicleta, NPCs Dona Nena/Seu Tonico/Beto, bagagem 042, portões 2/3 e erro de embarque | Puzzles, NPCs, gatilhos e transição QA-03 no código | Travessia visual mais clara, reação do ciclista, fluxo real com chapéu e ônibus |
| 02 — Excursão Errada | 12–18 | Interior do ônibus, assentos, Luzia/Duda/Nico, caixas, cabos, conserto do som e quatro movimentos de ritmo | Testes de objetivos, puzzles, transição e âncoras QA-02 | Coreografia verdadeira, gesto de sentar e consertar, sensação de ônibus em movimento |
| 03 — Aeroporto | 19–26 | Terminal, check-in BS408, passaporte, farofa, raio-X, portão C7, corrida e embarque | Cinco escolhas, testes de caminho/linha de visão e eventos | Embarque/decolagem visual, inspeção animada, leitura e QA da câmera |
| 04 — Route 66 | 27–34 | Parada, Mabel/Nora/Rudy, mapa, foto por diálogo, revisão, dois trechos dirigíveis e pane | Testes de direção/progressão e isolamento da fase | Direção e paisagem convincentes, fotografia como objeto persistente, feedback de impacto |
| 05 — Deserto | 35–45 | Van, posto, abrigo de sombra, calor, galão, água, Rosa/Zeca/Luna, mangueira, placas, mirante | Testes de objetivos, água/sombra, puzzles e saves | Carregar/encaixar galão visualmente, peça/motor animados, entardecer, QA real |
| FINAL PROVISÓRIO | 46 | Tela de deserto concluído | Estado de final existe no código | Trocar pela passagem segura para capítulo 06 sem reiniciar o progresso |

**Nota:** a primeira auditoria de capítulos deu notas preliminares de 7,0 / 5,8 / 5,5 / 5,0 / 5,2 / 6,5, mas foi escrita antes de QA-01, QA-02, QA-03 e dos GLBs v0.6.5. NÃO reutilizar tais notas como avaliação atual sem nova medição e teste visual.

### Melhorias já incorporadas no histórico que NÃO devemos perder

1. Isolamento visual e de colisores por capítulo (QA-01).
2. Âncoras físicas e linha de visão para interações no ônibus/aeroporto (QA-02).
3. Causa e efeito dos embarques errados, diálogos e spawns de cinco transições (QA-03).
4. Substituição dos protagonistas procedurais por GLBs reais, com fallback se o carregamento falhar.
5. Normalização das alturas de João para 2,78 e Crist para 2,58 unidades, controle lateral A/D revisado e alinhamento inicial dos pés (v0.6.5).
6. Persistência de itens da Fazenda, progresso do ritmo, direção da van e migração de saves v1–v7.
7. Ausência de game over punitivo nos minijogos; erros produzem reação cômica e nova tentativa.

---

## 3. Diagnóstico transversal — correções do game inteiro

Os itens abaixo têm prioridade de engenharia. A classificação diz respeito ao risco de continuar adicionando fases, não à gravidade estética.

### P0 — Bloqueadores antes de construir Vegas

**P0.1 — Validar de verdade os personagens 3D.**  
Arquivos: src/avatar-glb.js, src/avatar-logic.js, src/characters.js, src/main.js, tests/avatars.test.mjs.
- Verificar João/Crist em idle, caminhada, corrida, dança, comemoração, troca de personagem, frente/costas, sombras e portas.
- Registrar nome dos ossos Foot/Ankle dos dois GLBs; se ausentes, a compensação dinâmica de pés não entra em ação. Medir sola, contato, altura da cabeça e sliding.
- Verificar malha real em portas: colisão atual usa raio padrão 0,38, não cápsula derivada da largura do avatar.
- Impedir root motion de mover rig independentemente da colisão; preservar animação original e fallback.
- **Aceite:** sem afundar/flutuar visivelmente, sem pés deslizando de modo grave, sem atraves­sar paredes; 30/60/120 FPS com deslocamento coerente. Registrar vídeo/foto, não só teste unitário.

**P0.2 — Controles unificados e QA de estado.**  
Arquivos: src/controls.js, src/locomotion.js, src/main.js, testes de controles.
- Confirmar WASD, setas, analógico esquerdo e joystick mobile nos mesmos eixos de câmera em oito orientações; W deve avançar na direção do olhar e D mover para direita da tela.
- Confirmar arrasto do mouse e analógico direito sem inversões; permitir "inverter câmera" como opção de acessibilidade, se necessário.
- Corrigir diferença comprovada: pollGamepadActions permite alternar personagem durante roadRun/airportRush em condições que teclado e touch proíbem. Criar função única canSwitchHero(state).
- Resetar eixo/teclas após perda de foco, troca de cena, pausa, morte do contexto WebGL e diálogos.
- **Aceite:** nenhum input fantasma, nenhum personagem trocado em minijogo bloqueado; botão de AÇÃO da interface e E/gamepad fazem a mesma coisa.

**P0.3 — Transição segura do final atual para a campanha nova.**  
Arquivos: src/story.js, src/chapter-transitions.js, src/chapter-layers.js, src/main.js, src/world.js, testes de saves.
- FINAL_STEP=46, getQuest() e advanceTo() atualmente limitam a progressão ao deserto. start() reinicia a aventura ao abrir save que esteja em 46.
- NÃO basta aumentar FINAL_STEP: chapterAt(step>=35), HUD, world.update(), NPCs, função de spawn e cenas escolheriam indevidamente "desert" para Vegas.
- Migrar o save interno de v7 para v8, manter a chave do save 3D separada do 2D, tratar step 46 como "deserto concluído" e disponibilizar transição explícita 46 -> novo capítulo.
- Definir novos IDs estáveis de missões e separar metadados capítulo/objetivo do número cru de etapa; prever migrações posteriores.
- **Aceite:** usuário que finalizou o Deserto continua em Vegas; usuário com save intermediário da mala, ônibus, aeroporto ou direção continua onde estava, sem softlock.

**P0.4 — Completar QA real dos capítulos existentes.**
- Fazer uma partida do step 0 ao 46 com erros e acertos em TODOS os puzzles, incluindo mudança de João/Crist, porta, porteira, Pantera, música, raio-X, direção e reparo.
- Recarregar em pelo menos 0, 4 (0/1/2/3 itens), 7, 11, 12, 17 (ritmo parcial), 19, 25, 27, 29, 33, 35, 40 e 46; validar posição segura e objetivos.
- Testar desktop mouse/teclado, touch pequeno, Android intermediário e gamepad; gravar capturas/logs com o commit sob teste.
- **Aceite:** sequência completa sem travamento; cada checkpoint retomável e cada objetivo realmente alcançável.

### P1 — Jogabilidade, apresentação e infraestrutura

**P1.1 — Fazer as ações acontecerem no mundo, não só em caixas de texto.**
- Substituir progressivamente interações "apertar E -> diálogo -> próximo step" por estado curto de objeto: aproximar, orientar, executar gesto, alterar prop, feedback visual/sonoro, concluir.
- Prioridades: pegar e fechar mala; recuperar chapéu; sentar no ônibus; reconectar cabo; escanear mala; fotografar Route 66; abrir capô, transportar galão e trocar mangueira.
- Criar InteractionAction com enter/perform/finish/cancel, animações fallback e bloqueio temporário de controles; todo gesto deve ter timeout e recuperação para não causar softlock.
- O mundo tem de lembrar pelo menos foto, chapéu, galão e marcos cômicos.

**P1.2 — Desempenho por capítulo, carregamento e shaders.**  
Arquivos: src/world.js, src/*-world.js, src/avatar-glb.js, src/main.js.
- buildWorld() instancia TODOS os seis hubs antes de iniciar a partida; invisibilidade por capítulo não elimina carga de CPU/RAM e criação de geometria.
- O menu inicial ainda chama animateElder() e world.update() mesmo sem partida iniciada (render em src/main.js). Parar a simulação do mundo no menu.
- Reestruturar em loadChapter()/activateChapter()/deactivateChapter()/disposeChapter() com cache e previsibilidade de recursos. Nunca destruir o hub ativo durante save ou diálogo.
- Pré-carregar o próximo hub e compilar shaders de materiais críticos em lotes durante tela de transição com progresso; texturas e GLBs só quando necessários.
- Reutilizar geometrias/materiais, instanciar itens repetidos, usar LOD de vegetação/props e resolução dinâmica no celular. Não aplicar culling agressivo a SkinnedMesh sem atualizar bounds.
- Medir primeiro carregamento, draw calls, triângulos, GPU/frame time p95, RAM, quedas de FPS e WebGL context lost. **Metas propostas, não medidas:** 60 FPS desktop razoável e 30 FPS Android intermediário sem picos graves, com perfil de qualidade.
- **Aceite:** tempo e memória demonstravelmente menores que o baseline em dois dispositivos, sem fases desaparecendo.

**P1.3 — Câmera e colisão.**
- CameraRig adaptativo para casa, corredor do ônibus, aeroporto, hotel e boate; raycast da câmera para evitar parede/teto; aproximação e opacidade transitória quando obstáculo cobre João/Crist.
- Colisões atuais são retângulos XZ e limites globais (src/collision.js). Extrair limites por capítulo e aplicar colisão separada de câmera, personagem e NPCs.
- Em hubs novos, carregar spawn, navmesh simplificada/waypoints, colisores e áreas interativas da mesma definição de dados; testes A*/BFS a partir de posições reais.
- Identificar interações que ainda não exigem linha de visão: canUseObjective() só ativa a restrição adicional nos steps 12–26; ampliar de modo testado para os outros capítulos.

**P1.4 — NPCs e cooperação entre João/Crist.**
- Hoje a IA do companheiro basicamente segue o jogador, evita obstáculos simples e é teleportada quando fica muito longe. Evoluir com estados follow, wait, approach, interact, react.
- João: improviso, ferramentas e ações físicas simples. Crist: leitura, pistas, organização e conversa.
- Criar ações conjuntas, por exemplo segurar a escada enquanto o outro sobe, carregar mala grande, cruzar porta, conduzir dança de dupla e investigar cassino.
- Retarget de animação para GLBs futuros de NPCs, com budget/LOD por distância. Acrescentar reações pontuais em vez de diálogos repetitivos.
- Manter modo solo completo; coop local é expansão opcional, não bloqueador.

**P1.5 — Áudio, sensação de mundo e feedback.**
- O áudio atual é majoritariamente WebAudio sintético (tons, passos, latidos/pássaros e hum de motor). Faltam trilha original por ambiente, sons de interação posicionais e mixagem fina.
- Criar buses separados para música, ambiente, falas/efeitos e UI, controle de volume e pausa real dos loops.
- Campo: natureza/rádio; rodoviária: público/ônibus; excursão: motor e música original sincronizada; aeroporto: chamadas fictícias; Route 66: pneu/motor/vento; deserto: vento e oficina; Vegas: trânsito/néon/música original.
- Preferir músicas e efeitos originais ou ativos com licença compatível, documentando autoria e atribuições.

**P1.6 — Saves e replay.**
- Save atual registra essencialmente version, step, hero e packing; ritmo/roadRun/memórias são chaves separadas.
- Planejar estado serializável versionado: chapterId, questId, hero, safeSpawn, inventory, flags de objetos, flags de diálogo, fotos, lembranças, episódio e subcheckpoint.
- Validar importação/restauração para não nascer dentro de collider; oferecer selecionar capítulo concluído e rever cutscenes.
- Exportar/importar save JSON local com validação e backup automático antes de migração.

**P1.7 — UI e acessibilidade.**
- Objetivo atual, direção do próximo ponto e ação devem ser claros sem excesso de HUD; botão AÇÃO muda de legenda conforme alvo.
- Legenda de conversa, fala seguinte, tamanho de texto, alto contraste, remapeamento, sensibilidade/inversão da câmera e modo toque canhoto.
- Confirmar layout em 16:9, 19.5:9 e paisagem baixa; respeitar safe-area; testar foco e fechamento de modais.
- O texto da README ainda anuncia v0.6.4 e tem uma seção antiga dizendo que GLBs não foram incluídos: atualizar a documentação para v0.6.5, sem confundir progresso antigo com situação atual.

### P2 — Melhorias opcionais

- Álbum de fotos, cartas e lembranças e conversa final adaptada às escolhas.
- Ciclo dia/entardecer/noite por capítulo, não simulação global cara.
- Mais animações faciais, pequenos movimentos de cabelo e tecidos com limite de custo.
- Modo foto leve, colecionáveis cômicos e objetivos secundários úteis, sem encher o minimapa.
- Coop local, conquistas e localização de idioma, somente depois do jogo solo estar completo.

---

## 4. Polimento capítulo por capítulo (00 a 05)

### 00 — O Bilhete Premiado / Fazenda
**Preservar:** despertar dentro da casa, café, rádio, bilhete, números 03/11/18/27/42/56, Crist, três objetos da mala, Pantera, porteira e memórias.
**Melhorar:** câmera do interior sem tetos atravessando, expressão da vitória, pegar documentos e roupas com gesto, João segurando a farofa, mala abrindo/fechando, reação física da Pantera e o último olhar para a fazenda.
**Evento visual desejado:** conferir o bilhete com os números no papel, depois comemoração dos dois.
**Aceite:** jogo iniciado do zero, três itens persistem após recarregar e os dois passam pela porteira real sem atravessar a cerca.

### 01 — A Rodoviária
**Preservar:** praça, Dona Nena, Seu Tonico, Beto, bicicleta, etiquetas 024/042/420, portão 2 certo e chapéu levando ao portão 3 errado.
**Melhorar:** placas grandes e legíveis, sinal de pedestre/tempo de travessia leve, animação de quase-acidente e recuperação, mala física que se pega e leva, chapéu voando/aparente recuperação antes de o ônibus partir.
**Aceite:** o jogador entende POR QUE entrou no ônibus errado apesar de ter identificado o portão certo; nenhum NPC/veículo bloqueia o percurso.

### 02 — A Excursão Errada
**Preservar:** Luzia, Duda, Nico, Beto, assentos, caixa certa, cabo azul MIC e sequência PALMAS/PASSO/GIRO/PALMAS.
**Melhorar:** passos no corredor, sentar de fato, luzes e vibração discreta do ônibus, apresentação de dança animada com áudio em sincronia, sucesso visual no microfone/reconexão.
**Aceite:** os dois se movem sem clipar assentos, executam a coreografia e regressam à posição de exploração sem saltos.

### 03 — Aeroporto dos Perdidos
**Preservar:** voo BS408, pasta azul, farofa, bandejas, raio-X, mudança para C7 e correria recuperável.
**Melhorar:** objetos movendo entre balcões, papel de passagem visível, farofa embalada, detecção leve no raio-X, anúncio do portão atualizado, escada/passarela e breve tomada de avião decolando.
**Aceite:** interações sempre diante dos objetos e o embarque parece uma ação física, não apenas mudança instantânea de cenário.

### 04 — Route 66
**Preservar:** Mabel, Rudy, Nora, dois trechos de direção, avaliação não punitiva, parada, foto, revisão e pane.
**Melhorar:** estrada com curvas e variação de cenário, faixas de direção legíveis, pneus/volante/feedback, distância real entre obstáculos, câmera responsiva, reações da dupla e parada da van. Hoje a van avança automaticamente e o controle apenas muda deslocamento lateral.
**Aceite:** jogador pode enxergar antecipadamente e evitar obstáculos; dois trechos têm identidade própria; foto cria item no álbum, não só um diálogo.

### 05 — O Deserto Não Perdoa
**Preservar:** Rosa, Zeca, Luna, sombra, água, transporte do galão, mangueira, segurança com motor frio, placas contraditórias, mirante.
**Melhorar:** água aparecendo no galão, mãos realmente segurando recipiente, van com capô levantado/fumaça que desaparece, reparo animado e passagem de luz de tarde para néon distante.
**Aceite:** completar sem ficar preso com galão, trocar de personagem apenas onde permitido, ver a van voltar a funcionar e receber opção de continuar para Vegas.

---

## 5. Fases ainda NÃO criadas — roteiro e design executável

### CAPÍTULO 06 — BEM-VINDOS A VEGAS [PLANEJADO]

**Função dramática:** pela primeira vez, o sonho parece real. Os dois chegam com a van, mas a cidade imensa os deixa desorientados. João se encanta com tudo; Crist tenta garantir hotel e bagagem.

**Ambiente:** chegada pela rodovia, boulevard estilizado (2–3 quadras densas e reutilizáveis, não cidade gigante vazia), hotel com lobby e quarto visitável, praça de fotos, táxi, pedestres e trânsito com LOD. Luzes néon de noite e reflexos econômicos: emissive + bloom opcional, não dezenas de point lights.

**NPCs:** Maya recepcionista, Sam motorista, turista fotógrafo, artista da excursão como cameo se a missão 02 foi completada.

**Missões planejadas (IDs, NÃO números finais de step):**
1. vegas_arrive — atravessar o portal de entrada e estacionar a van reparada; câmera panorâmica breve.
2. vegas_map — Crist compara mapa/hotel e identifica o destino certo entre placas parecidas.
3. vegas_photo — João pede foto no boulevard; disparar câmera e guardar primeira foto de Vegas no álbum.
4. vegas_bag — recuperar mala enviada ao hotel com etiqueta trocada; busca visual e entrega física.
5. vegas_checkin — fazer check-in com reserva; puzzle de nomes/quarto, com tentativas recuperáveis.
6. vegas_lift — encontrar elevador certo e ajudar o parceiro a levar a mala até o quarto.
7. vegas_room — explorar o quarto, interagir com janela e vista da cidade; bilhete do show.
8. vegas_taxi — escolher transporte e ir à apresentação noturna, com erro cômico de destino.
9. vegas_wrongdoor — descobrir que a entrada não é o show que imaginaram; gancho para boate.

**Mecânicas inéditas:** câmera de foto e álbum persistente, mala portátil de curta duração, táxi como transição interativa, NPCs reativos e mapa compacto por setores.
**Cenas marcantes:** reação ao primeiro néon; João tentando pagar no hotel com o bilhete da loteria em vez de documento; Crist recuperando a situação.
**Critérios de aceite:** trajeto deserto -> Vegas coerente; lobby/rua/quarto carregados sem travar; 9 missões alcançáveis e salváveis; visual noturno 30 FPS-alvo mobile sob medição; nenhum modelo ou NPC aparece atravessando carro ou elevador.

### CAPÍTULO 07 — A NOITE NA BOATE [PLANEJADO]

**Função dramática:** os protagonistas descobrem que o evento anunciado não é o que imaginaram, mas a trupe da excursão os acolhe. A confusão vira amizade e espetáculo. Humor vem do engano e da inexperiência da dupla, nunca da identidade LGBTQ+ dos frequentadores.

**Ambiente:** entrada/segurança, lounge, pista compacta, palco, camarim e saída; neons e fumaça opcionais com presets de qualidade.
**NPCs:** Luzia, Duda e Nico retornam, DJ Sol, anfitrião do concurso; todos com rotinas simples e animações expressivas.

**Missões:**
1. club_entry — mostrar convite e descobrir a reserva de nome trocado.
2. club_meet — reencontrar a trupe; diálogo que reconhece o favor prestado na excursão.
3. club_costume — João e Crist improvisam figurino sem perder roupas/corpo originais.
4. club_sound — Crist encontra problema de áudio e sincroniza canal correto (nova variação, não repetir puzzle do ônibus igual).
5. club_rehearsal — aprender passos com demonstração visual e batida original.
6. club_duo — minijogo de dança dos dois com feedback animado de tempo e combos simples.
7. club_encore — apresentação coletiva, falhas engraçadas recuperáveis e reação da plateia.
8. club_clue — receber pista sobre o cassino e possível armadilha de Victor Blackjack.
9. club_exit — sair juntos e voltar ao boulevard noturno.

**Mecânicas inéditas:** máquina de estados de dança, janelas de timing de 3 dificuldades, sincronização de AnimationMixer com áudio, coreografia em dupla e câmera de palco.
**Critérios de aceite:** combo e ritmo jogáveis sem depender só de opções de texto; nenhum bug de troca de personagem, pausa, perda de foco ou áudio acelerado; a dança é divertida tanto acertando como errando; história avança mesmo com avaliação baixa.

### CAPÍTULO 08 — O CASSINO E VICTOR BLACKJACK [PLANEJADO]

**Função dramática:** Victor tenta explorar os turistas e tomar o controle de uma promoção falsa ligada ao prêmio da loteria. Crist desconfia; João quase cai na conversa. O jogador investiga e expõe o golpe.

**Ambiente:** entrada do cassino, salão de máquinas cenográficas, mesa demonstrativa de roleta **fictícia**, lounge VIP, bastidores e sala de administração. Sem sistema de dinheiro real ou integração de apostas; toda participação é jogo narrativo com fichas fictícias não adquiríveis.

**NPCs:** Victor Blackjack, segurança, atendente, recepcionista VIP e turistas; possíveis cameos da trupe.
**Missões:**
1. casino_arrive — entrar e conhecer regras fictícias do local.
2. casino_promo — comparar proposta "VIP" com informação da recepção.
3. casino_ticket — impedir uso indevido da documentação do prêmio; guardar bilhete/recibo em inventário.
4. casino_camera — usar foto do álbum para reconhecer a pessoa que trocou uma etiqueta.
5. casino_clues — Crist junta três pistas visuais em áreas distintas.
6. casino_demo — minijogo demonstrativo de máquina/roleta com resultado inteiramente ficcional, sem perda monetária e sem aposta real.
7. casino_backstage — João improvisa distração física enquanto Crist acessa o registro falso.
8. casino_chase — perseguição cômica curta com obstáculos, sem combate obrigatório nem softlock.
9. casino_expose — confrontar Victor com as evidências; NPCs reagem e golpe cai.
10. casino_leave — os dois saem com o prêmio e a viagem preservados.

**Mecânicas inéditas:** investigação com evidências físicas, inventário narrativo, NPCs que lembram da denúncia, perseguição curta com checkpoints e desfecho baseado nas pistas reunidas.
**Critérios de aceite:** nenhuma monetização/aposta real; provas são coletáveis e persistentes; erros não apagam progresso; a fuga e o confronto dão feedback visual, não só diálogo.

### CAPÍTULO 09 — O SONHO REALIZADO E O RETORNO [PLANEJADO]

**Função dramática:** depois de tanta confusão, João e Crist finalmente desfrutam da cidade. Voltam para casa mais amigos do que nunca, revendo o que viveram.

**Ambientes:** boulevard revisitado e mirante, último dia no hotel, transição de voo/estrada em montagem curta, Fazenda ao entardecer.
**Missões:**
1. finale_boulevard — passeio livre e última foto, sem marcador invasivo.
2. finale_memories — álbum reúne momentos da Fazenda, excursão, estrada, boate e cassino.
3. finale_gift — escolher lembrança para Pantera, com consequências cômicas locais.
4. finale_pack — arrumar de novo a mala, referenciando o prólogo.
5. finale_farewell — despedida dos novos amigos; reações conforme favores feitos.
6. finale_trip — montagem curta da viagem de volta.
7. finale_farm — entrar na Fazenda já conhecida; mostrar alterações pequenas, como pôr do sol.
8. finale_pantera — reencontro animado com Pantera e diálogo final.
9. finale_credits — créditos completos, álbum, replay/seleção de capítulos e opção de novo jogo sem apagar o save antigo.

**Mecânicas inéditas:** álbum/replay, epílogo responsivo a flags, reencontro da cachorra e créditos encerrando efetivamente a campanha.
**Critérios de aceite:** é possível ir do despertar ao reencontro com Pantera, salvar, fechar e reabrir os créditos, rever capítulos sem perder conquistas e retornar ao menu sem travamentos.

### Conteúdo herdado do 2D — como aproveitar sem descaracterizar a campanha

**NÃO IMPLEMENTADO NO 3D ATUAL.** A proposta antiga cita, na versão 2D, fases como Clube dos Assassinos e Trono do Deus das Apostas, e bônus como pescaria com Chico Fumaça e Noite na Boate. Este plano adapta a boate ao Capítulo 07 e propõe:
- **Bônus Chico Fumaça / Pescaria:** minicenário do açude desbloqueável na Fazenda; pescaria simples e conto exagerado sobre tubarão.
- **Episódio secreto: Clube dos Assassinos:** sonho absurdo de João depois do cassino ou modo Arcade isolado, com humor e ação não letal, sem ser obrigatório para terminar a história.
- **Episódio secreto: Trono do Deus das Apostas:** fantasia surreal no sonho, ou modo arcade 16-bit separado, com chefe cômico e regras próprias, nunca confundido com o cassino realista da campanha.
- **Extras pós-jogo:** reencenar música da excursão, revisitar lanchonete/boate, modo foto e medalhas de travessias; sem monetização.

**Decisão a preservar:** a premissa do jogo 2D encontrada na documentação (ex-lutadores rumo a torneio) difere da premissa da loteria no 3D. Não copiar eventos, chefes ou combates do 2D automaticamente sem adaptá-los ao arco de João/Crist.

---

## 6. Arquitetura para suportar os capítulos 06–09

### 6.1. Estrutura sugerida, sem refazer todo o projeto

- src/campaign/chapters.js — catálogo {id, ordem, título, spawn, camera, ambientação, quais módulos carregar}.
- src/campaign/quests.js — objetivos por ID estável, ator requerido, alvo, ação e próximo ID.
- src/campaign/state.js — runState e migradores v1–v8+.
- src/campaign/transitions.js — travel montage, pré-carregamento, checkpoint e foco de câmera.
- src/systems/interactions.js — aproximação -> gesto -> efeito -> avanço, com timeout/fallback.
- src/systems/input.js — políticas unificadas para mouse, touch, teclado e gamepad.
- src/systems/camera.js — presets, oclusão e interpolação.
- src/systems/animation.js — mixer, retarget/fallback, pé no solo e eventos de animação.
- src/systems/audio.js — mixers por canal, fontes posicionais e pausa.
- src/worlds/vegas.js, club.js, casino.js, finale.js — geometria/GLBs, colisores, NPCs e markers.
- src/data/vegas-quests.js, club-quests.js, casino-quests.js, finale-quests.js — missões e cenas em dados.
- tests/campaign-integration.test.mjs — migração, ordem, transições, gamepad e não regressão.
- tests/e2e/ — Playwright em navegador headless/WebGL de software para fluxos; Android real continua necessário.

**Estratégia segura:** extrair módulos aos poucos sem mudar os IDs 0–46 nem a experiência atual. Testar cada extração. Os arquivos atuais src/main.js e src/world.js permanecem até a migração ser comprovada; não fazer reescrita total de uma vez.

### 6.2. Regras para novos mundos e mapas

1. Um capítulo carrega apenas seu cenário e colisores; descarregar ou congelar os anteriores sem destruir progressos persistentes.
2. A posição de qualquer spawn e interação vem de uma fonte única compartilhada por renderização e testes.
3. Cada ação tem ponto de aproximação validado; nada interage através de paredes, balcão ou NPC.
4. Evitar Vegas procedural gigante logo no começo: fazer duas quadras densas, hotel e vias conectadas, depois ampliar com LOD.
5. Pedestres/veículos devem parar, contornar e reagir a eventos, sem virar apenas decoração que atravessa o jogador.
6. Ciclo de vida de GPU explícito para geometrias, texturas, materiais, targets e áudios; cache com orçamento de RAM.
7. Material/GLB novo deve ter licença, tamanho, quantidade de polígonos, animações, custo em GPU e fallback documentados.
8. Cada novo capítulo deve ter pelo menos uma mecânica realmente nova e uma grande consequência visual.

### 6.3. Migração de save — roteiro técnico obrigatório

- Guardar backup do JSON v7 antes da migração.
- Estabelecer capítulo/objetivo estáveis e checkpoint de entrada.
- Preservar todos os progressos 0–45. Converter step 46 "deserto concluído" em estado retomável com botão para iniciar Vegas, nunca reset automático.
- Verificar a ausência de colisão no ponto de spawn, especialmente no interior do ônibus e do hotel.
- Persistir álbum/lembranças de modo limitado e validar dados corrompidos.
- Retomar após queda de energia, pausa, fechamento de aba e WebGL context lost.
- Manter a edição 2D e chaves de outros jogos intocadas.

---

## 7. Priorização de trabalho — ordem das revisões

| Pacote | Prioridade | Trabalho | Entrega verificável |
|---|---|---|---|
| R1 — QA base | P0 | Jogar 00–05 no PC/Android, medir bugs, verificar GLBs/pés e controles | Relatório reproduzível, vídeos e testes de regressão |
| R2 — Infraestrutura | P0 | Corrigir policy de gamepad, save 46, capítulo/quest IDs, spawns e limites por capítulo | Todos os saves v1–v7 migrando; nenhum reset |
| R3 — Polimento antigo | P1 | Ações físicas nos seis capítulos, câmera, Route 66 e som | Fases 00–05 com feedback visual, não só diálogo |
| R4 — Carregamento | P1 | Lazy-load por fase, cache, pre-warm, pausa no menu, perf HUD | Baseline e comparação FPS/RAM antes/depois |
| R5 — Vegas | P0 conteúdo | Capítulo 06 completo + transição do Deserto | Boulevard/hotel jogáveis, 9 objetivos, save |
| R6 — Boate | P1 conteúdo | Capítulo 07, reencontro da trupe, dança de dupla | Minijogo ritmado e cenas acessíveis |
| R7 — Cassino | P1 conteúdo | Capítulo 08, Victor, pistas e perseguição | Investigação/coletáveis e confronto completos |
| R8 — Final | P1 conteúdo | Capítulo 09, álbum, regresso e Pantera | Créditos e jogo zerável do início ao fim |
| R9 — Certificação | P0 lançamento | Replay end-to-end, Android, browsers, performance e a11y | Release com relatório de testes reais |
| R10 — Extras | P2 | Chico Fumaça, sonhos arcade e replays | Só após a campanha principal aprovada |

**Não abrir R5 com R1/R2 quebrados:** isso acumularia novas fases sobre a mesma dívida de controles, saves e carregamento.

---

## 8. Matriz mínima de testes e critérios de aprovação

### Testes automatizados
- node --check e node --test sem falhas no CI.
- Simular ações e transições em cada missão do 00 ao final, incluindo escolha errada e recuperação.
- BFS/A* de todos os spawns até alvos COM o conjunto real de colisores do capítulo ativo.
- Validar linha de visão, raio de interação e ausência de gatilhos dentro de paredes.
- Input com yaw em 0, 45, 90, 135, 180, 225, 270, 315 graus, e também gamepad/toque.
- Pausa/foco/câmera durante minijogos, diálogo, eventos de bicicleta e aeroporto e direção.
- Validar migrações de save v1, v2, v3, v4, v5, v6, v7 e futuro v8.
- Corrida e colisões em 30/60/120 FPS com tolerâncias declaradas.
- Validar que o mapa desativado não mantém colisão nem NPCs ativos.

### Testes obrigatórios em navegador real
- PC Chrome/Edge/Firefox e Android Chrome: entrar e jogar etapas sem atalhos.
- Personagens GLB carregam corretamente e nunca "encolhem", perdem textura, giro ou sombra ao trocar personagem.
- Corrigir flicker, z-fighting, objetos flutuando, clipping, som preso e input invertido onde ocorrer.
- Testar menu, tela de loading, mensagens longas, texto pequeno, giro da câmera e uso do celular na horizontal.
- Perder a conexão durante carregamento da CDN ou GLB: jogo deve exibir mensagem clara, oferecer retomada e fallback quando possível.
- Testar save/continue/restart sem apagar save do 2D.
- Medir FPS médio, frame time p95, tempo de início, RAM, draw calls, triângulos, falhas de shader/contexto.
- Registrar dispositivo, resolução, modo de energia, navegador, commit, passos de reprodução e capturas; comparar antes/depois.

### Definition of Done de cada capítulo
1. Missões, diálogos, objetos e NPCs estão efetivamente no cenário e têm consequência visível.
2. O personagem chega ao alvo sem atravessar sólidos nem ficar preso.
3. Erro de puzzle recupera; uma tarefa nunca exige reiniciar toda campanha.
4. Os dois personagens, teclado, toque, controle e pausa funcionam nas partes apropriadas.
5. O capítulo salva, recarrega, transita e preserva capítulos anteriores.
6. Áudio, animações, câmera e UI são testados em browser real.
7. Performance medida e documentada; se não atingiu meta, entregar perfil de qualidade inferior ou backlog claro.
8. CI verde E teste visual/manual registrado; "testes unitários passaram" isoladamente não fecha a fase.

---

## 9. Riscos, dependências e escolhas de produção

| Risco | Efeito | Mitigação |
|---|---|---|
| Acrescentar step 47 sem mexer em FINAL_STEP e chapterAt | Vegas não abre ou herda Deserto | Primeiro R2: registry de capítulos e migrador de save |
| All worlds instantiated at boot | Crescimento de RAM/carga inicial com Vegas | Lazy-load por capítulo e orçamento de assets |
| GLBs com nomes de ossos desconhecidos | Compensação dos pés falha silenciosamente | Inspecionar rig e testar vídeo idle/walk/run |
| Colisão simples XZ e tamanho visual alterado | Cabeça/ombro clipando portas/mesas | Colisor calibrado por avatar e passagem testada |
| Ações baseadas só em diálogos | Fases parecem questionários | Eventos 3D com animação/prop e consequências |
| Gamepad difere do teclado/touch | Softlocks ou troca indevida durante evento | Política de estado de input centralizada |
| Vegas gigante antes de medir FPS | Telas vazias, travadas e custo alto de produção | Hub compacto, LOD, NPCs reutilizáveis |
| Saves antigos e progresso do deserto | Usuário perde a campanha | Backup e testes de migração v1–v8 |
| Identidade do 2D e narrativa 3D diferentes | História sem coerência | Capítulos 06–09 canônicos; fantasia 2D como extras |
| Dependência de CDN e downloads GLB | Primeiro load falha/offline | Estratégia de assets locais/cache, erros e fallback |

### Não fazer
- Não substituir os GLBs atuais por personagens genéricos sem necessidade.
- Não apagar fases, diálogos, colecionáveis e minijogos existentes.
- Não declarar "jogo zerado" usando somente testes unitários ou caminhos sintéticos.
- Não adicionar dez quarteirões vazios só para chamar de mapa grande.
- Não aumentar brilho/neons às custas de FPS sem oferecer ajustes.
- Não forçar combate nem apostas monetárias como núcleo da comédia.

---

## 10. Ordem prática da PRÓXIMA implementação

**Primeira tarefa recomendada: R1 + início de R2.** Entregar diagnóstico de gameplay real e aplicar a política única de troca de personagem, corrigindo o estado de gamepad em roadRun/airportRush. Em seguida preparar compatibilidade do final provisório (46) e arquitetura da próxima transição para Vegas. Paralelamente, escolher ativos base do Capítulo 06: hotel, boulevard, táxi, pedestres, recepção e primeira vista noturna.

**Marco 1 (estabilidade):** seis capítulos existentes jogáveis de ponta a ponta sem bugs críticos.  
**Marco 2 (conteúdo):** Vegas/hotel realmente jogáveis, e não apenas um plano ou imagem.  
**Marco 3 (campanha):** boate e cassino com mecânicas próprias.  
**Marco 4 (produto completo):** volta à Fazenda, Pantera, créditos e replay.

---

## 11. Fontes e trilha de auditoria

**Código atual:** src/main.js, src/world.js, src/story.js, src/characters.js, src/avatar-glb.js, src/avatar-logic.js, src/camera-logic.js, src/controls.js, src/locomotion.js, src/collision.js, src/chapter-layers.js, src/chapter-transitions.js, src/interaction-anchors.js, src/audio.js, src/*-state.js, src/*-world.js, index.html, style.css, package.json e tests/*.test.mjs.

**Documentos do projeto:** README.md, JOAO_E_CRIST_PROPOSTA_3D.md, FASE-01-FAZENDA.md a FASE-06-DESERTO.md, AUDITORIA-CAPITULOS-00-05.md, QA-01-ISOLAMENTO-CAPITULOS.md, QA-02-ANCORAS-INTERACAO.md, QA-03-CONTINUIDADE-TRANSICOES.md e QA-04-ESCALA-CONTROLES-CHAO.md.

**Limite desta revisão:** leitura estática de fontes e documentação + verificação do CI existente, sem execução visual/interativa com mouse ou Android. Nenhuma nova fase foi codificada por este MD; o documento define o backlog, a ordem e os testes de aceite.
