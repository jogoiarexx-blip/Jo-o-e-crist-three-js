# João & Crist — A Viagem Mais Maluca do Mundo (3D)

**Primeiro protótipo jogável (v0.1.0).** Dois velhinhos do interior ganham na loteria e partem rumo a Las Vegas. Este repositório é a versão independente em **Three.js**; a edição 16-bit original permanece no outro repositório.

## Jogar

https://jogoiarexx-blip.github.io/Jo-o-e-crist-three-js/

**PC:** WASD/setas movem, mouse arrastado gira a câmera, roda do mouse aproxima, E/Enter interage/avança diálogos, TAB troca João/Crist, espaço esquiva da bicicleta, Shift corre, Esc pausa.

**Celular:** analógico à esquerda, botões AÇÃO / TROCAR / ESQUIVAR, arrastar a tela gira a câmera.

**Gamepad:** analógico esquerdo move, direito gira a câmera, A interage, B esquiva, Y troca personagem, Start pausa (diálogos e bicicleta estão acessíveis por teclado/touch; integração completa do gamepad seguirá).

## O que já é jogável

1. Fazenda 3D low poly, casa, galpão, pomar, cerca, Pantera, estrada e cidade com rodoviária e ônibus.
2. João e Crist 3D procedurais com caminhada, braços/pernas animados, câmera em terceira pessoa e alternância por TAB.
3. Companheiro que acompanha o protagonista e desvia dos edifícios estáticos.
4. Roteiro da **loteria**, bilhete, rádio, conversa, malas, despedida, porteira, rua e minijogo de quase atropelamento de bicicleta.
5. Embarque no ônibus errado, encerramento do prólogo e gancho para o capítulo da excursão.
6. Saves locais isolados da edição 2D (chave joaoCrist3DSave_v1); pausa, touch, gamepad básico e modo de diagnóstico ?debug=1.
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

## Próximas prioridades

Substituir os personagens procedurais pelos modelos GLB rigados (idle/walk/run/talk); adicionar ponte GLB sem quebrar o placeholder; ampliar a rodoviária, implementando o ônibus de artistas, sua tripulação e o primeiro desafio dentro do veículo; testar mobile, melhorar câmera/colisões e inserir trilha sonora original.
