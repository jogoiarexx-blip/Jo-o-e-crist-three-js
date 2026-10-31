# João & Crist — A Viagem Mais Maluca do Mundo (3D)

**Protótipo jogável (v0.6.2 — QA-02: interações físicas alinhadas nos capítulos 02 e 03).** Dois velhinhos do interior ganham na loteria e partem rumo a Las Vegas. Este repositório é a versão independente em **Three.js**; a edição 16-bit original permanece no outro repositório.

## Jogar

https://jogoiarexx-blip.github.io/Jo-o-e-crist-three-js/

**PC:** WASD/setas movem, mouse arrastado gira a câmera, roda do mouse aproxima, E/Enter interage/avança diálogos, TAB troca João/Crist, espaço esquiva da bicicleta, Shift corre, Esc pausa.

**Celular:** analógico à esquerda, botões AÇÃO / TROCAR / ESQUIVAR, arrastar a tela gira a câmera.

**Gamepad:** analógico esquerdo move, direito gira a câmera, A interage, B esquiva, Y troca personagem, Start pausa (diálogos e bicicleta estão acessíveis por teclado/touch; integração completa do gamepad seguirá).

## QA-02 — Objetos realmente interativos (v0.6.2)

Segunda revisão da auditoria, **sem adicionar capítulos, remover tarefas ou reiniciar saves**.

- Reposicionadas as sete missões da Excursão Estelar: assento próximo à janela, artistas, caixa ESTELAR, microfone, mesa de som, palco e cabine do motorista.
- Reposicionadas as oito missões do Aeroporto Boa Sorte: painel, check-in, Achados e Perdidos, mala/farofa, scanner, painel C7, esteira e balcão de embarque.
- O marcador agora fica em **um ponto transitável diante do objeto visual**, e não no corredor distante. Raio de interação reduzido para 1,25–1,8 unidades no ônibus e 1,3–1,65 no aeroporto.
- Interações nesses dois capítulos verificam alcance e **linha de visão entre o personagem e o marcador**. A mesma função controla o aviso na tela e o botão AÇÃO/E, evitando discrepâncias e interação através de paredes.
- Corrigida a posição de Luzia, Duda, Nico, Nina, Léo e Mara para que não se sobreponham aos colliders dos assentos e balcões.
- `BUS_PROPS` e `AIRPORT_PROPS` registram posições reais de bancos/equipamentos e parte do cenário passa a reutilizar essas referências, diminuindo divergência futura.
- Testes `interaction-anchors.test.mjs`: **15 missões acessíveis por navegação em grade com linha de visão**, NPCs livres de colisão e tentativas inválidas através de equipamentos.
- Mantidos os 47 estados da aventura e save principal na versão interna 7, incluindo compatibilidade com saves das versões anteriores.
- [Relatório técnico QA-02](QA-02-ANCORAS-INTERACAO.md) e [auditoria dos capítulos](AUDITORIA-CAPITULOS-00-05.md).

**Pendente:** jogar no navegador com câmera real, personagem e controle mobile para validar legibilidade e animações; testes de geometria não substituem essas verificações.

## QA-01 — Colisões e isolamento entre capítulos (v0.6.1)

Primeira rodada de correções estruturais após a auditoria dos capítulos 00–05, **sem adicionar uma fase ou remover o conteúdo existente**.

- Os objetos visuais da Fazenda/Rodoviária são mantidos em um único grupo `outdoorRoot`, visível nos capítulos 00–01, e oculto em Excursão/Aeroporto/Route 66/Deserto.
- As colisões originais agora saem do mundo ativo junto com esse grupo, voltando somente quando os capítulos 00–01 forem ativados. Corrigido o conflito da cerca da Fazenda que atravessava a Route 66 na linha z=24.
- Interior do ônibus, aeroporto, Route 66 e deserto mantêm colisões próprias e exclusivas; trocar de missão não duplica colliders.
- Porteira aberta permanece aberta mesmo quando o capítulo original é reativado.
- A Route 66 usa a mesma lista de colisores em renderização e testes, reduzindo divergência.
- Animações de Pantera, galinhas, nuvens e outros objetos da Fazenda são suspensas quando o capítulo original não está ativo.
- **Novos testes de caminho em grade:** todos os marcadores da Excursão, Aeroporto, Route 66 e Deserto devem ser alcançáveis partindo do início do respectivo capítulo.
- A versão de save **permanece 7**, compatível com os saves anteriores. Não há nova missão.
- O isolamento de visibilidade reduz desenhos desnecessários, porém os ambientes ainda são alocados no carregamento inicial. A auditoria de FPS real e carregamento progressivo fica para QA-05.
- [Relatório completo de implementação e critérios](QA-01-ISOLAMENTO-CAPITULOS.md). [Auditoria original](AUDITORIA-CAPITULOS-00-05.md).

**Limitação:** testes geométricos e automáticos não equivalem a uma partida visual completa no navegador ou a uma homologação no Android.

## Capítulo 5 — O Deserto Não Perdoa (v0.6.0)

Depois da pane na Route 66, a aventura continua em uma área compacta do deserto de Nevada. A implementação **preserva todos os capítulos anteriores**.

- Explorar o deserto: van avariada, abrigo de sombra, posto Água Clara, bombas identificadas, oficina, placas contraditórias e mirante de Vegas.
- **11 novas missões**, incluindo procurar água, carregar um galão com João até a van, conseguir a peça com Zeca e consertar o veículo.
- Crist lê a sinalização da bomba potável e interpreta as placas da estrada; João cuida da água e do reparo.
- **Quatro desafios de observação**, com alternativas erradas recuperáveis e diálogos originais.
- Três NPCs opcionais: Zeca (mecânico), Rosa (dona do posto) e Luna (viajante).
- **Calor dinâmico sem game over**: aumenta no sol, diminui na sombra; indicador visual acessível no HUD.
- Galão 3D aparece nos locais adequados e acompanha João durante o transporte.
- A van reparada e as luzes no horizonte criam o gancho para **Bem-vindos a Vegas**.
- Saves v1–v6 continuam reconhecidos; o encerramento antigo da Route 66 é a primeira etapa do Deserto.
- [MD e checklist do Deserto](FASE-06-DESERTO.md).
- Testes automatizados de progressão, segurança das interações e saves. **QA visual desktop e Android ainda pendente.**

## Capítulo 4 — Route 66 (v0.5.0)

A campanha continua depois do Aeroporto, preservando todas as cenas e saves anteriores.

- **Condução jogável em duas etapas:** van turística low poly em terceira pessoa, direção lateral por A/D, setas, analógico ou joystick do celular; o veículo segue em frente e o jogador desvia de cones, barris e caixas.
- A direção considera tempo real (`dt`), com colisões e limites laterais. Bater provoca reação cômica e não causa game over.
- **Paradas exploráveis:** lanchonete da Mabel, mirante da Nora, oficina do Rudy, placas de estrada, montanhas e cactos.
- **Cooperação:** Crist lê a rota panorâmica; João revisa o radiador com o motor frio.
- Progresso parcial da direção salvo a intervalos curtos, para retomar o trecho.
- A pane no deserto cria o gancho para o Capítulo 5.
- Saves v1 a v5 migram para v6. O encerramento antigo do aeroporto abre a Route 66.
- [MD detalhado e QA da Route 66](FASE-05-ROUTE66.md).
- Validação visual de gameplay em navegador e Android ainda pendente.

## Capítulo 3 — Aeroporto dos Perdidos (v0.4.0)

A ampliação autorizada pelo usuário acrescenta **oito objetivos de aeroporto** mantendo intactos a Fazenda, a Rodoviária, a Excursão Errada, as interações e o progresso anterior:

- Saguão separado com painéis, check-in, Achados e Perdidos, despacho de bagagens, detector, painel de portão, esteira rolante e acesso ao avião.
- Crist lê os dados do voo BS408, recupera o passaporte, prepara a inspeção e identifica o novo portão C7.
- João lida com a farofa e com as confusões da bagagem.
- Cinco pequenos desafios com pistas no cenário, três alternativas por vez, respostas recuperáveis sem game over.
- Correria curta com reação de desvio no teclado, toque e gamepad; falhar gera tropeço cômico e a história continua.
- Três atendentes opcionais (Nina, Léo e Mara) e novo encerramento com embarque.
- Saves das versões 1–4 migrados para 5; o fim anterior inicia o aeroporto, sem repetir o ônibus.
- Colisões do aeroporto ativadas somente no Capítulo 3, separadas das do ônibus.
- [MD do aeroporto, testes e pendências](FASE-04-AEROPORTO.md).

**Status dos testes:** sintaxe, roteiro, colisões, respostas e saves verificáveis automaticamente. Não substituem uma partida completa em desktop e Android.

## Capítulo 2 — A Excursão Errada (v0.3.0)

Conforme o [documento de direção narrativa](JOAO_E_CRIST_PROPOSTA_3D.md), **a Excursão Errada foi ampliada sem remover nenhuma missão anterior**.

- Interior de ônibus jogável: corredor, fileiras de bancos, teto ocultável, bagageiros, três caixas com etiquetas, mesa de som, microfone e espaço para apresentação.
- Três artistas low poly e interativos: Luzia (cantora), Duda (figurinista), Nico (som); motorista Beto aparece na história final.
- Som ambiente original e leve de motor, interrompido na pausa e desligado pelo controle geral de áudio.
- Encontrar lugar, conhecer a trupe e recuperar a caixa preta com estrela amarela.
- Crist identifica o cabo azul; João o conecta na entrada MIC.
- Minijogo musical de **quatro ações originais** (palmas, passo, giro, palmas); erros recuperáveis, sem cronômetro punitivo.
- Controles de escolha por teclado, toque e gamepad; progresso parcial de ritmo salvo.
- Descoberta do ônibus errado, revelação do destino e gancho para Aeroporto dos Perdidos.
- Saves v1, v2 e v3 migram para v4. Quem encerrou a Rodoviária pode continuar diretamente no ônibus.
- Novo documento de implementação e QA: [FASE-03-EXCURSAO-ERRADA.md](FASE-03-EXCURSAO-ERRADA.md).
- Testes automatizados incluem geometria do interior, objetivos, respostas e continuidade dos saves. **Teste manual em navegador/Android ainda pendente.**

## Capítulo 1 — A Rodoviária (v0.2.0)
Esta revisão, autorizada pelo usuário após a Fazenda, amplia **sem retirar** as cenas anteriores:
- Mapa da praça e sinalização do terminal; faixa de pedestres na cidade.
- Manutenção do quase acidente de bicicleta, com falha recuperável.
- Mala trocada e desafio de etiqueta: **Crist** identifica 042, fita azul.
- Guichê e desafio de embarque: **Crist** confere PORTÃO 2, transporte ao aeroporto.
- Dona Nena (florista), Seu Tonico (carregador) e motorista Beto, com diálogos opcionais e personagens procedurais 3D.
- Ônibus roxo, entrada na Excursão Estelar e encerramento cômico preservados.
- Salvamento da versão 3 com migração de saves anteriores; interface responsiva dos puzzles para teclado, toque e gamepad.
- Documento específico: [FASE-02-RODOVIARIA.md](FASE-02-RODOVIARIA.md).

**Importante:** testes de código e lógica não substituem jogar no navegador. QA desktop e Android permanece pendente.

## O que já é jogável

1. Fazenda 3D low poly, casa, galpão, pomar, cerca, Pantera, estrada e cidade com rodoviária e ônibus.
2. João e Crist 3D procedurais com caminhada, braços/pernas animados, câmera em terceira pessoa e alternância por TAB.
3. Companheiro que acompanha o protagonista e desvia dos edifícios estáticos.
4. Roteiro da **loteria**, bilhete, rádio, conversa, **preparação real das malas (documentos, roupas e farofa)**, despedida de Pantera, porteira, rua e quase atropelamento de bicicleta.
5. Embarque no ônibus errado, encerramento do prólogo e gancho para o capítulo da excursão.
6. Conferência visual do bilhete e resultado de loteria fictícia; cantos de pássaros procedurais e botão de som. Saves locais isolados da edição 2D (chave joaoCrist3DSave_v1), incluindo os itens já guardados na mala; pausa, touch, gamepad básico e modo de diagnóstico ?debug=1.
7. Publicação estática via GitHub Pages e workflow automatizado.

**Ainda não incluído:** personagens GLB com rig, animações Motion Capture, áudio musical, interiores completos, boate jogável, Las Vegas completa, colisão avançada, coop local, tradução, QA em Android real. As atuais figuras procedurais são placeholders de produção, **não** ativos definitivos.

## Arquitetura

- index.html e style.css: camada visual e controles.
- src/world.js: cenário 3D e pontos de interação.
- src/characters.js: personagens low poly e animações temporárias.
- src/story.js: roteiro e objetivos.
- src/main.js: estado do jogo, câmera, IA acompanhante, diálogo, input, colisões e save.
- tests/story.test.mjs: testes isolados de narrativa/saves.
- JOAO_E_CRIST_PROPOSTA_3D.md: direção narrativa completa do projeto.

A versão inicial usa uma import map para three@0.180.0 do jsDelivr. Não é necessário compilar para GitHub Pages; a primeira visita requer acesso à CDN. Para trabalhar localmente, sirva os arquivos por HTTP com python -m http.server 8080, depois abra http://localhost:8080. Abrir index.html diretamente pelo sistema de arquivos não é suportado.

## Testes

npm test verifica o roteiro e a validação de saves. npm run check verifica a sintaxe JavaScript. Estes são **testes de código**, não equivalem a jogar a campanha em um navegador Android/desktop.

## GitHub Pages

O workflow publica o conteúdo da raiz quando houver push na branch main. Se este for o primeiro uso do Pages no repositório, é necessário habilitar **Settings → Pages → Build and deployment → Source: GitHub Actions**. A execução pode ser acompanhada na aba Actions.

## Desenvolvimento fase a fase
A prioridade atual, por solicitação explícita, é **Capítulo 1 — A Rodoviária**. A Fazenda foi preservada sem remoções e suas pendências de QA visual seguem registradas. Desenvolveremos o novo capítulo com validação de objetivos, diálogos, colisões, controles e saves, mantendo a sequência completa. Leia [FASE-02-RODOVIARIA.md](FASE-02-RODOVIARIA.md).

### Evolução 0.1.2: mais conteúdo só na Fazenda
- Cena visual da loteria: conferir as seis dezenas do bilhete, revelar o resultado, comemorar.
- Áudio rural original sintetizado por WebAudio, ativável/desativável, sem autoplay e sem arquivos pesados.
- Fazenda com poço, galinhas animadas, canteiro instanciado, fardos e apoio para o rádio.
- Câmera agora leva em conta a altura dos obstáculos e aproxima antes de atravessar construções.
- Colisão para cercas, mesa, poço e mala; testes automatizados de movimento e altura.
- Fase 2 e seguintes **sem ampliação**.
- **Não foi realizado teste gráfico manual em celular ou navegador nesta rodada.**

### Evolução 0.1.1: preparação da viagem
- Documentos, roupa e farofa são objetos reais do cenário; cada um tem uma interação contextual e um pequeno diálogo.
- O jogador só pode fechar a mala quando os três itens foram guardados.
- Os objetos coletados desaparecem do mundo, e o progresso fica salvo.
- Saves anteriores à atualização são aceitos: se a fase da mala já passou, os três itens são considerados guardados.
- Pantera ganha reação visual ao se despedir dos amigos.
- Testes unitários adicionais exercitam sequência dos objetos e migração de saves.
- Nenhuma nova fase foi incluída.

### Evolução 0.1.3 — lógica espacial da Fazenda
- A casa foi convertida em ambiente **acessível**: paredes com abertura real, porta aberta, chão de madeira, cama, escrivaninha, armário e teto que some da câmera quando o herói entra.
- Documentos sobre a escrivaninha **dentro da casa**; mala no quarto, com pontos de interação e alcance compatíveis com os móveis.
- Porteira de madeira reconstruída na cerca perimetral: montantes, três travessas, escora diagonal, dobradiças e abertura animada ao interagir.
- Colisão de paredes substituída por cinco segmentos com passagem frontal livre; a porteira tem colisão enquanto fechada e a remove ao abrir.
- Arrastar a câmera ou usar analógico direito agora gira o olhar no mesmo sentido do comando; A/D e os analógicos seguem os lados da câmera. Testes de movimento, acessibilidade, entrada e porteira.
- Companheiro reagrupa quando alguém cruza de fora para dentro da casa sem atravessar paredes.
- **A rodoviária e o ônibus não foram modificados.** Ainda pendente verificar gameplay real no navegador, animações e desempenho.

### Evolução 0.1.6 — movimentação real, Pantera e interior rural
- Aceleração e frenagem suaves **independentes dos FPS**, com deslocamento calculado após colisões e animação proporcional à velocidade real: não andar no lugar quando encostado em uma parede.
- Seguidor João/Crist usa **ponto intermediário na porta** para entrar e sair da casa, em vez de ser reposicionado através da parede. Teleporte de recuperação limitado a situações distantes e no mesmo ambiente.
- Analógico direito da câmera corrigido para usar tempo real (`dt`), mantendo velocidade equivalente a 30/60/120 FPS.
- Sons originais sintetizados de **passos sobre madeira ou terra** e dois latidos breves; respeitam configuração de áudio e não adicionam arquivos externos.
- **Pantera** ganhou pernas articuladas, coleira, cabeça expressiva, movimento na despedida, acompanhamento curto e retorno ao local inicial; marcador de interação acompanha sua posição.
- Casa ganhou fogão de ferro, queimadores, prateleira de livros, relógio e detalhes de parede, com colisão simples correspondente ao fogão.
- Testes unitários reproduzem movimento bloqueado, deslizamento, passagem da porta, abertura da porteira, taxa de giro do gamepad e limites da despedida de Pantera.
- Nenhuma cena ou etapa foi removida: fazenda, bicicleta, cidade, rodoviária e ônibus continuam.
- **Validação visual em computador e telefone permanece pendente**: CI testa sintaxe e regras, não a experiência completa em navegador.

### Evolução 0.1.5 — polimento sem cortar fases
- **Câmera adaptativa dentro da casa:** aproxima e baixa a perspectiva, verifica paredes em 16 amostras no trajeto e mantém o comportamento exterior quando o jogador sai.
- **Gestos e expressões provisórios em João e Crist:** braços reagem a fala, comemoração, dúvida e despedida; olhos piscam e boca abre durante diálogos.
- **Três lembranças opcionais na Fazenda:** retrato antigo da dupla dentro da casa, poço e galinhas com conversas engraçadas. Não bloqueiam nenhuma missão e são salvas separadamente.
- **Poço recolocado dentro do perímetro rural** para ficar acessível antes da saída.
- Testes novos para aproximação de câmera, conteúdo opcional e persistência/validação das lembranças. Os testes não substituem sessão no navegador real.
- Preservados todos os objetivos anteriores e a continuação da cidade, bicicleta, rodoviária e ônibus.

### Evolução 0.1.4 — ampliação, sem cortes
- Começo inédito: João acorda **dentro da casa**, pode aprender a andar e interagir com o café.
- Sequência ajustada: ouvir os números pelo rádio, **depois** procurar o bilhete na varanda e comparar visualmente as dezenas.
- Conversa ampliada entre João e Crist: os dois confirmam a notícia e decidem ir a Las Vegas.
- Preparativos com papéis distintos: **Crist** confere documentos e separa roupas, **João** cuida da farofa e fecha a mala. Troca com TAB/TROCAR/Y.
- Despedida de Pantera e porteira continuam; a saída conclui a história da Fazenda.
- **Todo o conteúdo já existente continua jogável:** chegada à cidade, quase atropelamento da bicicleta, rodoviária e ônibus errado. São a continuação do prólogo, não foram retirados.
- Saves v1 são migrados para v2, mantendo posição na narrativa e itens guardados. Agora há testes também de colisões e layouts na execução automática.
- Ainda necessário: jogar integralmente em navegador desktop e Android para homologar a cena.

## Próximas prioridades

**Validar em jogo O Deserto Não Perdoa**, incluindo sombra, coleta e transporte de água, câmera, colisões da oficina e legibilidade das placas no Android. A próxima fase será Bem-vindos a Vegas, preservando o conteúdo anterior.
