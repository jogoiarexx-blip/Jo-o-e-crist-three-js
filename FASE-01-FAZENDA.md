# Fase 01 — A Fazenda: plano de acabamento
**Estado da construção:** v0.1.5 — câmera interna, gestos, descobertas extras; cidade e ônibus preservados; **não considerada finalizada**.

## Premissa
João e Crist são dois amigos idosos que moram no interior. Após achar o bilhete e ouvir o resultado no rádio, eles descobrem que ficaram ricos e começam a preparar uma viagem para conhecer Las Vegas.

## Missões de abertura que devem estar jogáveis
1. **Acordar dentro da casa e aprender os controles** caminhando até o café.
2. **Ouvir as dezenas no rádio** e descobrir que talvez tenham ganhado.
3. **Encontrar o bilhete na varanda e conferir visualmente** o resultado anunciado.
4. **Conversar com Crist**, confirmar o prêmio e decidir a viagem a Las Vegas.
5. **Preparar as malas**: Crist confere documentos e organiza roupas, João pega a farofa e fecha a mala.
6. **Despedir-se de Pantera**, que reage à interação.
7. **Sair pela porteira**, concluindo a Fazenda. A continuação que já existia permanece: cidade, bicicleta, rodoviária e ônibus.

## Polimento 0.1.5
- [x] Câmera mais próxima e baixa ao explorar o interior, preservando zoom externo.
- [x] Animações de fala, comemoração, dúvida, despedida e piscar dos olhos em modelos temporários.
- [x] Três histórias opcionais: retrato dos dois, poço da sorte, galinhas. Progresso separado, sem impactar saves principais.
- [x] Poço deslocado para dentro do sítio.
- [x] Testes unitários das histórias extras e da câmera interior.
- [ ] Testar performance e visual do movimento de câmera em navegadores móveis reais.
- [ ] Jogar desde o despertar até o ônibus com as novas interações.

## Ampliação 0.1.4
- [x] Adicionado despertar jogável dentro da casa com café e orientação de câmera/movimento.
- [x] Rádio anuncia dezenas antes de João encontrar o bilhete.
- [x] Conferência visual do bilhete preservada; diálogos de decisão sobre Las Vegas expandidos.
- [x] Personagens dividem tarefas de viagem, com troca obrigatória em interações específicas.
- [x] Despedida, porteira, cidade, bicicleta, rodoviária e ônibus **mantidos**.
- [x] Migrar saves para versão 2, preservando capítulos existentes e itens coletados.
- [x] Executar testes de história, geometria e controles no CI.
- [ ] Validar no navegador a sequência completa até o ônibus e em Android real.

## Entregue nas revisões anteriores
- [x] Objetos coletáveis 3D com marcadores contextuais e diálogos individuais.
- [x] Progresso de coleta 0/3 → 3/3 e mala bloqueada enquanto faltam itens.
- [x] Persistência de itens coletados em save v1; recuperação de saves legados que já concluíram a mala.
- [x] Reação animada da Pantera na despedida.
- [x] Novos testes automatizados de ordem, validação e migração de saves.
- [x] Apresentação visual dos seis números do bilhete e conferência antes de comemorar o sorteio fictício.
- [x] Pássaros com síntese WebAudio, com opção para desligar o som.
- [x] Galinhas, poço, horta, fardos e rádio apoiado em mesa para tornar a Fazenda menos vazia.
- [x] Colisões por altura de obstáculos, sem atravessar cercas ou a mesa; testes unitários das regras.
- [x] **Nenhuma expansão da rodoviária, ônibus ou Vegas.**
- [x] Entrada real na casa: substituído collider único por paredes segmentadas, com corredor de porta.
- [x] Mesa de documentos e mala reposicionadas **dentro da casa**, com acessibilidade testada por geometria.
- [x] Câmera retira visualmente o telhado no interior para permitir exploração e coleta.
- [x] Porteira de madeira conectada à cerca com escora diagonal, dobradiças, giro animado e remoção da colisão ao abrir.
- [x] Alinhamento dos controles de esquerda/direita e arrasto de câmera, coberto por testes.

## Pendente antes de marcar a Fazenda como pronta
- [ ] Abrir o jogo em navegador de desktop e Android, jogar desde o início até a porteira sem usar atalhos.
- [x] Testes geométricos de porta, aproximação da mesa e mala e passagem pela porteira.
- [ ] Conferir visualmente no navegador que todos os marcadores ficam acessíveis sem atravessar paredes, cercas ou objetos.
- [ ] Conferir câmera perto da varanda, do galpão, de Pantera e da saída.
- [ ] Testar controles teclado, toque, gamepad e pausa durante os diálogos.
- [ ] Recarregar a página após coletar apenas 1 item e depois 2 itens: confirmar que não reaparecem.
- [ ] Melhorar os modelos dos personagens; substituir os provisórios por GLBs com rig quando houver assets apropriados.
- [ ] Adicionar expressões faciais/gestos; trabalhar caracterização e ritmo dos diálogos.
- [x] Adicionar pássaros sintetizados e alternância de som ligado/desligado (sem controle de volume contínuo ainda).
- [ ] Música ambiente rural original e controle gradual de volume.
- [x] Fazer a conferência da loteria ser mais visual e clara que apenas um diálogo.
- [ ] Validar o fluxo visual e navegação por teclado/toque da conferência.
- [ ] Medir FPS e frame times em hardware real e corrigir eventuais travamentos.
- [ ] Obter avaliação da narrativa e da diversão da Fazenda antes de avançar.

## Regra de produção
**Não iniciar a Fase 2 de fato antes de encerrar as pendências críticas da Fase 1.** A cidade e o ônibus presentes na v0.1.0 continuam como protótipos para evitar perder trabalho; não contam como fases prontas.

## Verificações técnicas
Testes automáticos validam sintaxe, lógica da lista de itens, save e progressão. Não representam execução gráfica no navegador. Registrar achados com captura e passos de reprodução quando houver teste manual.
