# Capítulo 1 — A Rodoviária

**Versão:** v0.2.0 — primeira implementação detalhada.
**Documento-base:** \`JOAO_E_CRIST_PROPOSTA_3D.md\`, capítulos 1 e 8.
**Política de produção:** toda a Fazenda, o incidente da bicicleta, o ônibus errado e o prólogo anterior foram preservados. Esta revisão **amplia** a cidade; não inicia ainda a excursão dentro do ônibus.

## Objetivo dramático
Transformar uma simples viagem do interior até a rodoviária em uma sequência completa, com três personagens locais, um susto físico e duas dificuldades resolvidas pela atenção de Crist. João mantém o temperamento impulsivo e acaba provocando o erro do embarque final. As falhas de puzzles geram humor, não game over.

## Missões em ordem (estado persistido)
| Step | Missão | Ponto no mapa | Mecânica | Resultado |
|---|---|---|---|---|
| 7 | Descobrir a rodoviária | Praça, calçada sul (55, 21.2) | Explorar, ler mapa, falar com Dona Nena | Reconhecer a faixa |
| 8 | Atravessar a faixa | Rua (68, 11) | Bicicleta com reação no tempo: desvio ou susto | Reação cômica; prossegue sem punição |
| 9 | Recuperar bagagem | Carrinho (83, 1) | Crist confere etiqueta 042, fita azul; 3 opções | Recupera mala; erro gera conversa e nova chance |
| 10 | Identificar portão | Guichê (74.5, -0.85) | Crist lê passagem PORTÃO 2 — AEROPORTO; 3 opções | Funcionária confirma portão |
| 11 | Embarcar no ônibus | Ônibus (93, 3) | João encontra a Excursão Estelar | Conclusão da fase com ônibus errado |
| 12 | Fim da sequência | Tela de conclusão | Repetir ou aguardar próximo capítulo | História preservada |

A fase anterior continua nos steps 0–6. Os novos passos 7–12 são incrementais e não eliminam nenhuma ação que o usuário já tinha na versão v0.1.6.

## Construção visual detalhada
- **Chegada e orientação:** praça com painel e placa de boas-vindas na **calçada sul**, do lado oposto ao terminal, para que a travessia da faixa seja uma progressão espacial lógica.
- **Rua e travessia:** duas calçadas, faixa de pedestres branca, sinalização "DEVAGAR" e incidente pré-existente de bicicleta preservado com efeitos e diálogo de recuperação.
- **Terminal:** marquise com colunas, sinal "TERMINAL BOA SORTE", guichê, quadro de portões, banco de espera e paisagismo de rua.
- **Bagagem:** carrinho com rodas, três malas distintas e rótulos impressos "024", "042", "420"; a correta tem fita azul.
- **Humanização:** carrinho de flores, canteiros, bancos e mobiliário para dar escala; iluminação diurna da cena base preservada.
- **Ônibus:** mantém a Excursão Estelar roxa, sua placa e o encerramento antigo com a trupe de artistas. Não simula o interior nesta fase.

## Personagens da cidade
1. **Dona Nena, florista:** aconselha a dupla e comenta sobre a sorte. Conversa opcional.
2. **Seu Tonico, carregador:** sugere conferir etiquetas antes de pegar malas. Conversa opcional.
3. **Motorista Beto:** apresenta a Excursão Estelar, antecipando o desfecho. Conversa opcional.
4. **Funcionária do guichê:** aparece no diálogo do puzzle do portão, com opções de recuperação; uma quarta função narrativa, sem rig dedicado nesta versão.
5. **Ciclista:** preservado da versão inicial com sucesso/falha cômicos; não bloqueia a progressão.

Todos os NPCs visíveis usam geometria procedural temporária com animação simples. A inclusão futura de GLBs rigados não deve afetar os IDs das missões.

## Duas interações com raciocínio
**Bagagem correta:** o comprovante menciona *042, alça marrom e fita azul*. Crist identifica a opção 042. Escolhas erradas reproduzem falas de Seu Tonico e permitem tentar novamente sem perda de progresso.

**Portão correto:** a passagem indica *transporte ao aeroporto, portão 2*. Crist lê avisos de três portões. A alternativa correta é a 2, mas João se distrai mais tarde com o ônibus roxo, justificando o erro do final. Não há necessidade de inventário permanente novo; os passos 9 e 10 são checkpoints persistidos.

Os desafios aceitam mouse, toque, teclado (1/2/3, setas, Enter) e gamepad (Y para alternar opção, A para escolher). Pausar congela movimento e não perde o puzzle.

## Acessibilidade e circulação
- Coordenadas centralizadas em \`src/city-state.js\`, compartilhadas entre cenário, marcadores e testes.
- Objetivos ficam próximos de calçadas e podem ser abordados fora das caixas de colisão.
- Mobiliário não ocupa o eixo da faixa; carrinho de malas e balcão têm colisão apenas no próprio volume.
- Marcadores originais da Fazenda e da bicicleta continuam funcionando.
- Balanço de ritmo: caminhada curta → diálogo → susto → investigação visual → confirmação → embarque.

## Estado, versão e compatibilidade
- Save 3D usa a **mesma chave exclusiva** \`joaoCrist3DSave_v1\` e versão interna 3.
- **Saves v1 e v2 são migrados** para steps correspondentes. Quem terminou a travessia na versão anterior retoma na bagagem; quem ainda chegava à cidade começa pela praça. O fim antigo permanece marcado como fim.
- O save original do jogo 2D não é modificado.
- A lista \`packing\` da Fazenda é mantida para saves intermediários.
- As conversas opcionais dos NPCs não bloqueiam a história nem exigem persistência adicional.

## Arquivos alterados ou adicionados
- \`src/city.js\`: cenário e NPCs da rodoviária
- \`src/city-state.js\`: posições, diálogos opcionais, puzzles e validação de respostas
- \`src/story.js\`: objetivos, narrativa, migração do save para v3
- \`src/main.js\`: transições, puzzles e controles
- \`src/world.js\`: montagem do hub, marcadores, atualização de NPCs
- \`index.html\`, \`style.css\`: painel de escolha responsivo
- \`tests/city.test.mjs\`, \`tests/story.test.mjs\`: regressões e regras

## Critérios e QA
- [x] Documentação e roteiro da próxima fase respeitados, sem remover Fazenda ou ônibus.
- [x] Três NPCs distintos, diálogos e pontos de interação.
- [x] Dois puzzles de três escolhas com respostas corretas e tentativas recuperáveis.
- [x] Colisão geométrica e alcance dos cinco marcadores checados em testes de código.
- [x] Migração de saves v1/v2 para v3 coberta por testes.
- [x] Controles de escolha por teclado, toque e gamepad implementados.
- [ ] Jogar **de verdade** da Fazenda ao ônibus no navegador desktop, incluindo erros nos dois puzzles.
- [ ] Jogar no Android, revisar teclado virtual, toque, FPS, câmera e legibilidade das placas.
- [ ] Confirmar que nenhum NPC ou carrinho atravessa ou bloqueia o personagem em um teste visual.
- [ ] Medir FPS e tempo de primeiro carregamento, sem afirmar métricas antes da medição.
- [ ] Substituir NPCs temporários por modelos GLB e revisar animações faciais/voz.
- [ ] Refinar som urbano, ambiente da rodoviária e animação de entrega da bagagem.

**Próximo capítulo após esta validação:** "A Excursão Errada", dentro do ônibus com passageiros, figurino, equipamento de som e um pequeno minijogo musical.
