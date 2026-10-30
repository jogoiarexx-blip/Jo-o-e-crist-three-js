# João & Crist — A Viagem Mais Maluca do Mundo

## Documento de direção narrativa e de desenvolvimento (Three.js)

**Origem:** https://github.com/jogoiarexx-blip/As-aventuras-de-Jo-o-e-Crist  
**Data da análise:** 30/10/2026  
**Status:** proposta de evolução; **nenhuma alteração efetuada no repositório**.

## 1. Visão do jogo

Dois velhinhos que moram no interior ganham um prêmio da loteria e partem para realizar o sonho de conhecer Las Vegas. Eles imaginam férias tranquilas, mas se envolvem em ônibus errado, confusões na rodoviária, encontros improváveis, quase acidentes com bicicleta, uma boate que não era o que esperavam, problemas na estrada e um cassino onde tudo parece dar errado. O coração do jogo é a amizade entre os protagonistas e o contraste entre a simplicidade do interior e os absurdos da viagem.

**Gênero:** aventura de comédia 3D com exploração, diálogos, pequenos quebra-cabeças, perseguições e minijogos.  
**Arte:** personagens 3D low poly expressivos, ambientes PS1/PS2 estilizados com iluminação e acabamento atuais, paleta rural acolhedora contrastando com néon intenso em Vegas.  
**Câmera:** terceira pessoa levemente elevada (3/4) com suavização e enquadramentos cinematográficos contextuais, sem depender de mundo aberto gigantesco.  
**Público e tom:** humor popular, situações absurdas, momentos carinhosos; humor nasce de ações, decisões e imprevistos, não de ridicularizar identidades ou grupos.

## 2. O que o repositório já possui

Análise documental por leitura de árvore e fontes: versão `v0.9.9 16-BIT EDITION`, HTML Canvas 2D (1000×650), aproximadamente 627 arquivos na árvore em leitura recente (~72,4 MB, sem contar histórico Git), cerca de 60 módulos JavaScript em `js/`, sem arquivos `.glb` ou `.gltf` encontrados. Há **oito fases principais**: fazenda, cidade, deserto, estrada, Vegas, cassino, clube dos assassinos e trono do Deus das Apostas. Há **três bônus**: ônibus, Noite na Boate e pescaria de Chico Fumaça (com tubarão). Estão presentes controle de dois personagens, progresso/XP, checkpoints, saves em `localStorage`, gamepad/touch, PWA, gerenciador de assets por fase, minijogos e cutscenes com diálogos.

**Conflito de roteiro confirmado:** `js/story.js` abre com João e Crist como ex-lutadores convocados a torneio em Vegas de US$10 milhões, não como ganhadores da loteria indo a passeio. Essa diferença reaparece nas cutscenes e nos chefes fantásticos. É mudança de premissa, não um detalhe cosmético.

**Evidência e limitações:** `AUDITORIA-V099.md` relata 15 testes *isolados* de carregamento/renderização/diagnóstico, não uma partida real completa. Não foi possível jogar no navegador nesta análise; não se afirma FPS real, ausência de bugs visuais ou conclusão das fases. **Não converter testes simulados em comprovação de gameplay.**

Fontes importantes:
- https://github.com/jogoiarexx-blip/As-aventuras-de-Jo-o-e-Crist/blob/main/js/story.js
- https://github.com/jogoiarexx-blip/As-aventuras-de-Jo-o-e-Crist/blob/main/js/story-cutscenes.js
- https://github.com/jogoiarexx-blip/As-aventuras-de-Jo-o-e-Crist/blob/main/js/level.js
- https://github.com/jogoiarexx-blip/As-aventuras-de-Jo-o-e-Crist/blob/main/js/bus-sequence.js
- https://github.com/jogoiarexx-blip/As-aventuras-de-Jo-o-e-Crist/blob/main/js/club-sequence.js
- https://github.com/jogoiarexx-blip/As-aventuras-de-Jo-o-e-Crist/blob/main/js/fishing-bonus.js
- https://github.com/jogoiarexx-blip/As-aventuras-de-Jo-o-e-Crist/blob/main/AUDITORIA-V099.md

## 3. Personagens e dinâmica

### João
Impulsivo, orgulhoso, sociável e engenhoso. Acha que toda situação tem solução simples, mesmo quando complica tudo. **Talento jogável:** improvisar reparos, usar objetos do cenário, conversar com pessoas diretas e se arriscar em tarefas físicas de baixa complexidade.

### Crist
Observador, irônico, metódico, mas também curioso. Prevê os problemas; frequentemente é arrastado para eles. **Talento jogável:** interpretar pistas, ler placas/documentos, perceber pequenos detalhes, resolver situações com conversa e montar planos.

### Pantera
A cachorra da fazenda, ligação afetiva com a casa. Participa do prólogo e epílogo; referências e saudades dela aparecem durante a viagem.

### Chico Fumaça
Conhecido do interior. Missão opcional no açude, orientação e uma despedida cômica. A antiga luta com tubarão pode ser reimaginada como história exagerada que Chico conta ou bônus fantasioso desbloqueável.

### Personagens secundários recorrentes
- **Motorista de excursão**: vende a promessa de viagem tranquila e provoca mal-entendidos práticos.
- **Artistas da excursão**: grupo diverso de artistas e performers que, por engano, recebe João e Crist em seu ônibus; tornam-se aliados, com humor situado no erro dos protagonistas e não nas identidades dos artistas.
- **Ciclista apressado**: causa um quase acidente e desencadeia uma curta perseguição pela bagagem perdida.
- **Recepcionista do hotel**: contraponto paciente às perguntas dos dois.
- **Victor Blackjack**: manter o nome do jogo atual, mas reescrever como promotor turístico/trapaceiro de cassino que tenta explorar a fama acidental dos dois; conspiração exagerada opcional, não premissa básica.

## 4. Estrutura da campanha

**Modelo:** campanha linear de 8–10 capítulos com hubs 3D compactos, objetivos claros e algumas escolhas de diálogo que mudam consequências locais, sem gerar milhares de ramificações. Pode ser uma viagem com passagens de tempo (dias), mas o jogador não precisa dirigir cada quilômetro.

| Capítulo | Situação | Jogabilidade principal | Gancho narrativo |
|---|---|---|---|
| 0. O Bilhete Premiado | Fazenda e notícia do prêmio | explorar casa, verificar bilhete, recolher documentos, fazer malas, conversar com Pantera | João reserva a viagem por impulso |
| 1. A Rodoviária | Confusão na cidade, bagagem trocada, bicicleta quase atinge os dois | exploração, atravessar rua com timing, recuperar mala, diálogos | embarque no ônibus errado |
| 2. A Excursão Errada | Ônibus de uma trupe de artistas | encontrar lugar, pequenas tarefas, conversar, ajudar no som/figurino, minijogo musical | tornam-se amigos e descobrem o engano |
| 3. Aeroporto dos Perdidos | Correria para alcançar voo internacional | localizar portão, solucionar perda de documentos, corrida cômica sem combate obrigatório | finalmente embarcam para os EUA |
| 4. Route 66 | Viagem em ônibus turístico, desvios e imprevistos | minijogo de estrada adaptado do bônus atual; câmera externa ou de motorista | veículo quebra no deserto |
| 5. O Deserto Não Perdoa | Calor, posto de estrada, placa contraditória | exploração compacta, conserto de veículo, carregar água e achar ajuda | sinais de Vegas no horizonte |
| 6. Bem-vindos a Vegas | Hotel e avenida cheia de luzes | hub de exploração, fotos, táxi, confusões com reservas e malas | entram no local errado |
| 7. A Noite na Boate | Boate LGBTQ+ com apresentação e concurso de dança | diálogo, ritmo, dança em dupla, improviso na pista, humor de situações | conhecem alguém que aponta o cassino certo |
| 8. O Cassino | Falsas vantagens VIP, Victor Blackjack, prêmio ameaçado | investigação leve, puzzles, máquina e roleta **fictícias sem aposta com dinheiro real**, fuga/perseguição curta | desmascarar golpe de Victor |
| 9. O Sonho Realizado | Vegas e retorno ao interior | explorar livremente, fotografar pontos marcantes, final baseado nas escolhas | reencontro com Pantera |

**Realismo de deslocamento:** usar ônibus até cidade/rodoviária, voo para os EUA e excursão na Route 66. Se o objetivo é uma comédia surreal, os personagens podem até achar que chegaram de ônibus direto do Brasil à Route 66 — mas isso precisa virar uma piada *assumida* no roteiro para não parecer erro.

**Uso do conteúdo antigo:** o clube dos assassinos e o Deus das Apostas podem ser sonho, episódio secreto, DLC cômica ou um modo Arcade 16-bit separado. Assim o jogador de comédia não é obrigado a lutar contra deuses para realizar o sonho da loteria.

## 5. Exemplo de direção de uma missão

**Missão: O ônibus errado (15–25 minutos).**
1. Na rodoviária, Crist pede para João conferir a placa, mas João avista um ônibus com luzes de Vegas e entra apressado.
2. O jogador explora o ônibus em 3D, conversa com passageiros, procura a passagem correta e descobre que é uma excursão de artistas a caminho de uma apresentação.
3. Em vez de expulsá-los, o grupo aceita ajudá-los se João e Crist encontrarem uma mala de equipamentos perdida. O jogador alterna protagonistas e usa habilidades diferentes.
4. Um pequeno problema de som exige que Crist identifique cabos e João os conecte sob tempo leve.
5. O grupo agradece com uma dança coletiva. Escolher colaborar gera aliados que podem reaparecer na boate em Vegas.
6. Cutscene curta: João admite que leu só a palavra “Vegas” na placa; Crist responde: “Eu sabia que tava faltando o resto da frase.”

Regras de design: sem longas caixas de texto passivas; cada diálogo prepara uma ação, e cada ação produz uma consequência engraçada. Falhar gera uma reação e alternativa de recuperação, em vez de interromper a história.

## 6. Loop jogável e sistemas

**Loop de 3–6 minutos:** chegar a um lugar → descobrir uma confusão → investigar personagens/objetos → resolver com João ou Crist → assistir reação curta → desbloquear próximo trecho. Intercalar com corrida/perseguição, dança, direção, conserto e desafios de tempo.

**Mecânicas prioritárias:**
1. Alternar João/Crist por tecla, botão ou touch; o outro é companheiro IA simples que acompanha, espera, evita paredes e participa de interações previstas.
2. Interações contextuais com objetos e pessoas (um único botão Ação), indicador visual discreto.
3. Inventário de itens narrativos: bilhete, documentos, passagem, mala, mapa, câmera, chave de hotel; combinações limitadas.
4. Diálogo curto com 2–3 opções e consequências locais; não criar árvore de diálogo gigantesca.
5. Indicadores simples de **Paciência** e **Confusão** (substituem XP/vida no modo história); mudanças afetam reações dos NPCs, mas nunca impedem a história permanentemente.
6. Minijogos não repetitivos; um novo tipo de ação deve ensinar regras em menos de 30 segundos.
7. Checkpoint ao entrar em cada trecho e antes de minijogos; save local versionado, mantendo o save 2D separado.
8. Cooperação opcional local em fase posterior; o modo solo deve ser o principal e completo.

**Evitar:** combate em todas as cenas, ondas longas de inimigos, fetch quests repetidas, mapa enorme vazio, humor ofensivo sobre identidades, diálogos de muitos minutos sem controle.

## 7. Produção 3D e tecnologia

Recomendo **Three.js + Vite**, módulos ES, assets **GLB/glTF** carregados por `GLTFLoader`, `AnimationMixer` para rig e animações, colisão estática simples no protótipo e física apenas quando necessária, estados de capítulo isolados. Hospedagem estática via GitHub Pages é viável, desde que o caminho de base dos assets seja corretamente configurado.

Arquitetura de pastas sugerida, sem alterar a versão 2D da raiz inicialmente:

```text
/                            # jogo original 2D permanece íntegro
/3d/
  index.html
  package.json
  vite.config.js
  src/
    main.js
    core/Game.js
    core/SceneRouter.js
    core/AssetManager.js
    core/SaveManager.js
    characters/JoaoController.js
    characters/CristController.js
    characters/CompanionAI.js
    systems/InteractionSystem.js
    systems/DialogueSystem.js
    systems/QuestSystem.js
    systems/CameraDirector.js
    systems/AudioDirector.js
    chapters/00_Fazenda.js
    chapters/01_Rodoviaria.js
    minigames/BicycleNearMiss.js
    minigames/BusRide.js
    minigames/DanceBattle.js
  public/assets/
    models/characters/
    models/props/
    worlds/fazenda/
    worlds/rodoviaria/
    audio/
    ui/
```

**Arte e animação necessárias no primeiro protótipo:**
- João e Crist: idle, caminhada, caminhada rápida, conversa, surpresa, tropeço, pegar objeto, carregar mala, acenar, sentar; dança depois.
- Pantera: idle, andar, correr, abanar rabo.
- Ambiente: casa rural, quintal, cercas, árvores, estrada, rodoviária pequena, ônibus, malas, bicicletas, NPCs.
- Efeitos: poeira leve, balões de fala, expressões faciais simples, animação corporal exagerada e reações sonoras.

**Metas propostas (não medições realizadas):** 30 FPS estáveis no Android intermediário em qualidade baixa e 60 FPS em desktops adequados; LOD para árvores e NPCs, carregamento por capítulo, texturas compactadas, culling, instancing onde útil, densidade de NPCs por distância, efeitos gráficos escaláveis e evitar modelos Meshy excessivamente pesados. Testar em aparelhos reais, não apenas benchmarks sintéticos.

Fonte técnica: https://threejs.org/manual/pages/installation.html ; https://threejs.org/manual/pages/loading-3d-models.html ; https://threejs.org/manual/pages/animation-system.html

## 8. Vertical slice (primeiro trecho jogável)

**Objetivo:** entregar os primeiros 15–20 minutos do capítulo 0 e início do capítulo 1, como demonstração do jogo final; não fazer um mapa de Vegas antes de validar os controles e o humor.

Fluxo: acordar na fazenda → descobrir o prêmio na TV/rádio → conferir bilhete → falar com Crist → juntar malas e documentos → despedir-se de Pantera → transição de viagem → explorar pequena rodoviária → quase atropelamento por bicicleta → ônibus errado → tela de continuação.

**Critérios de aceite:**
- 1 jogador controla João ou Crist e alterna sem perda de estado.
- Companheiro segue com distância natural, não atravessa objetos e retorna de forma segura se ficar preso.
- Pelo menos 3 NPCs com falas reativas, 5 objetos interativos, 2 puzzles simples e uma cena de humor físico.
- Personagens com rig/GLB e ao menos 7 animações consistentes; sem braços invertidos ou deslizamento evidente.
- Controle teclado, gamepad e touch; câmera não atravessa cenário; pausa congela simulação; save e load funcionam.
- FPS monitorado de verdade no desktop e Android; checklist de testes registrado.
- Jogo 2D atual permanece funcional, sem sobrescrever `index.html`, `sw.js` ou a chave de save original.

## 9. Ordem de evolução

1. **Roteiro e personagens:** reescrever premissa da loteria, perfil da dupla, abertura e arco de Vegas; decidir final emocional.
2. **Prototipagem de controle:** câmera, GLBs dos dois velhinhos, rig, movimento, colisões e troca de personagem.
3. **Vertical slice:** fazenda + rodoviária, diálogo, inventário, quase acidente de bicicleta.
4. **Ônibus errado:** NPCs, interações e humor de situação; adaptar o sistema de ônibus existente só conceitualmente, não copiar código Canvas para Three.js.
5. **Viagem e minijogos:** aeroporto, Route 66, deserto, condução, carregamento por área e saves.
6. **Vegas:** ambiente compacto detalhado, hotel, boate, cassino e reações dos NPCs.
7. **Polimento:** áudio, locuções curtas originais, câmera cinematográfica, animações e finais.
8. **QA:** capítulos completos, controles em celular/PC, estabilidade, LOD, performance, qualidade narrativa e publicar somente após testes do build 3D.

## 10. Decisões importantes

- Preservar o jogo 2D como **edição Arcade**.
- Construir o **3D como outra experiência**, com a loteria no centro da trama.
- Usar **hubs pequenos** e episódios, não um mundo aberto Brasil–Vegas.
- Fazer a dupla atuar como dupla: o sistema mais importante é a relação João–Crist, não o combate.
- Tratar o ônibus de artistas e a boate como encontros de personagens, com humor vindo da confusão dos protagonistas.
- Manter Victor Blackjack como antagonista humano e reservar os chefões sobrenaturais para bônus/sonhos, se desejado.
- **Primeiro protótipo:** fazenda até rodoviária, para comprovar que a história funciona em 3D.

**Tese final:** “Dois homens simples realizam um sonho enorme; cada problema gera mais uma história inacreditável para contar quando voltarem para casa.”
