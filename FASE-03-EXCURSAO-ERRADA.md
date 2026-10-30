# Capítulo 2 — A Excursão Errada

**Implementação inicial:** v0.3.0 · Three.js · independente da Fazenda e da Rodoviária.
**Continuação:** a v0.4.0 acrescenta o Aeroporto dos Perdidos; detalhes em `FASE-04-AEROPORTO.md`. Nenhuma missão do ônibus foi removida.
**Direção narrativa:** \`JOAO_E_CRIST_PROPOSTA_3D.md\`, capítulo 2 e exemplo do ônibus errado.
**Regra central:** ampliar a história sem remover personagens, mapas, missões, partidas e eventos anteriores.

## Visão da fase
Depois de entrar por engano no ônibus roxo da Excursão Estelar, João e Crist descobrem que estão viajando com artistas que se preparam para um espetáculo. No lugar de uma revelação imediata, o jogador conhece a trupe, encontra lugar, ajuda a recuperar a caixa de equipamentos, resolve dois pequenos quebra-cabeças com as habilidades distintas dos protagonistas e participa de um número musical curto. A motorista revela que a excursão não segue para Las Vegas. A trupe, agradecida, promete ajudar a dupla a encontrar o transporte correto no próximo capítulo.

**Ritmo desejado:** corredor e ambientação → conversa → investigação física → cooperação João/Crist → minijogo → revelação cômica → novo objetivo de viagem. Erros são recuperáveis.

## Missões e estado de save

| Estado | Acontecimento | Mecânica / personagem |
| --- | --- | --- |
| 11 | Embarcar na Excursão Estelar (existente) | Diálogo original preservado; transição para interior |
| 12 | Procurar lugar no ônibus | Caminhar pelo corredor e interagir com assentos |
| 13 | Conhecer os artistas | Conversar com Luzia, Duda e Nico |
| 14 | Encontrar a caixa de equipamento | João procura caixa preta com estrela amarela e etiqueta ESTELAR |
| 15 | Identificar falha de som | Crist lê etiquetas e reconhece o cabo azul MIC |
| 16 | Consertar a mesa de som | João conecta o cabo na ENTRADA MIC |
| 17 | Apresentação musical | Minijogo original de quatro comandos: PALMAS → PASSO → GIRO → PALMAS |
| 18 | Revelação do engano | Entrevistar a motorista; festa e novo plano de viagem |
| 19 | Conclusão | Gancho para o Aeroporto dos Perdidos |

**Não há minijogo obrigatório de combate nem game over.** Cada puzzle permite novas tentativas com diálogos específicos. O ritmo conserva notas acertadas quando o jogador erra.

## Cenário 3D implementado
Sala de ônibus como **mini-hub independente** em \`src/bus-interior.js\`, exibida somente após o embarque. Tem corredor contínuo, duas fileiras com bancos, bagageiros, janelas, parede traseira, letreiros, passagens, palco improvisado, caixas com pistas visuais, mesa de som colorida, microfone e iluminação. A câmera aproxima e o teto interno é ocultado para manter a leitura do personagem. Todos os colliders pertencem exclusivamente ao ônibus e são instalados/desinstalados na troca de capítulo; não interferem na Fazenda e na cidade.

O espaço não representa um ônibus rodando em tempo real no asfalto, nem tenta ligar fisicamente o exterior da Rodoviária ao interior. A transição é narrativa e preserva a continuidade dos personagens. NPCs e interior são 3D procedurais temporários para evitar dependência de arquivos externos ausentes.

## Trupe de artistas
- **Luzia, cantora**: recebe os passageiros e propõe a apresentação.
- **Duda, figurinista**: cuida dos figurinos, identifica a caixa e participa das piadas.
- **Nico, técnico de som**: identifica o microfone defeituoso, explica conectores e aprova o conserto.
- **Motorista Beto**: participa da revelação de destino no fim. A narrativa desenvolve a presença do motorista já introduzido na Rodoviária.

São três NPCs físicos no corredor e um personagem em fala; há conversas opcionais e reações do elenco durante o número musical. O humor surge de João entrar no ônibus errado, nunca da identidade ou aparência dos artistas.

## Cooperação da dupla
1. **João (step 14):** achar a caixa ESTELAR entre três malas com etiquetas distintas. A interação pede João; Crist orienta se houver erro.
2. **Crist (step 15):** ler o esquema e identificar **cabo azul MIC**, evitando os circuitos de energia e luzes.
3. **João (step 16):** ligar esse cabo na entrada **MIC**, e não na saída do alto-falante.
4. **Ambos (step 17):** tocar a sequência rítmica original com quatro ações. O jogador pode alternar João/Crist sem quebrar o progresso.

**Dica contextual:** o HUD indica quem precisa resolver a etapa, sem exigir decorar informações de diálogos anteriores.

## Minijogo de ritmo
O painel de escolha já usado na Rodoviária foi expandido de forma compatível, com três opções por rodada e a ordem das quatro ações visível na tela. Ação correta gera tom original sintetizado e salva avanço parcial; ação incorreta oferece nova tentativa. Não há cronômetro punitivo. O painel oferece teclado 1/2/3, setas + Enter, toque e gamepad (Y alterna, A confirma), com bloqueio de movimento durante a escolha e pausa funcional.

Persistência parcial do ritmo em \`joaoCrist3DBusRhythm_v1\`. O checkpoint de história continua na chave 3D existente \`joaoCrist3DSave_v1\`, agora **versão interna 4**. Dados da versão 2D não são tocados.

## Compatibilidade de saves
- Saves v1/v2 são migrados pelos mapas existentes sem descartar etapas concluídas.
- Save v3 no step 11 permanece no embarque. Save v3 no step 12 (fim antigo) passa ao step 12 do novo capítulo, para continuar a viagem.
- Novos saves v4 persistem steps 0–19, personagem selecionado e coleta de itens da Fazenda.
- Reiniciar remove apenas os dados específicos do projeto 3D.

## Implementação e organização
- \`src/bus-state.js\`: estado dos objetivos, artistas, puzzles, sequência musical, colliders e funções de teste.
- \`src/bus-interior.js\`: construção do interior e controle de exibição/animação.
- \`src/story.js\`: sete novos objetivos, migração do save v4.
- \`src/world.js\`: montagem do interior, troca de colliders, marcadores e animações.
- \`src/main.js\`: troca de cena, interações, checkpoints, puzzle genérico e minijogo.
- \`index.html\`: capítulo/encerramento atualizados, mantendo HUD e botões existentes.
- \`tests/bus.test.mjs\`: capítulo completo, navegação geométrica, três puzzles, quatro notas e migração.
- \`tests/story.test.mjs\`, \`tests/city.test.mjs\`: testes de regressão das fases antigas.

## Critérios de aceite
- [x] Não remover cenas da Fazenda e da Rodoviária, incluindo bicicleta, bagagem e guichê.
- [x] Interior próprio do ônibus com corredor e bancos; colliders isolados por fase.
- [x] Três artistas com nomes, aparência procedural e diálogos.
- [x] Encontrar equipamentos e consertar som em etapas separadas para João e Crist.
- [x] Minijogo de quatro comandos recuperável, com progresso parcial preservado.
- [x] Transição do antigo encerramento para a nova fase e migração dos saves v1–v3.
- [x] Testes automatizados de narrativa, geometria, escolhas e regressões integrados ao CI.
- [ ] Jogar toda a fase no navegador PC, com tentativas erradas nos puzzles.
- [ ] Jogar no Android, avaliar câmera, FPS, acessibilidade touch e transição entre mapas.
- [ ] Trocar personagens procedurais por GLBs rigados e ajustar sincronização de expressão.
- [x] Adicionar hum discreto original de motor via WebAudio, respeitando pausa e mudo.
- [ ] Evoluir o som da trupe, vibração sutil do veículo e variações de iluminação.
- [ ] Verificar visualmente caminho dos dois velhinhos entre todos os bancos e objetos.
- [ ] Avaliar a duração real da fase e a experiência cômica com jogadores.

**Próxima etapa planejada:** Capítulo 3 — Aeroporto dos Perdidos, seguindo o MD original. Não será desenvolvido antes de validar visualmente os novos sistemas.
