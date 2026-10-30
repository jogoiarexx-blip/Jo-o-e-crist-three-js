# Fase 01 — A Fazenda: plano de acabamento
**Estado da construção:** v0.1.2 — ambientação e confiabilidade da Fazenda; **não considerada finalizada**.

## Premissa
João e Crist são dois amigos idosos que moram no interior. Após achar o bilhete e ouvir o resultado no rádio, eles descobrem que ficaram ricos e começam a preparar uma viagem para conhecer Las Vegas.

## Missões de abertura que devem estar jogáveis
1. Explorar o quintal e encontrar o bilhete físico.
2. Interagir com o rádio para conferir o prêmio.
3. Contar a novidade para Crist.
4. Preparar as malas: localizar **documentos, roupas e farofa** em três pontos diferentes; completar coleta e retornar às malas.
5. Despedir-se de Pantera, que reage à interação.
6. Chegar à porteira. A partida seguinte deve preservar o progresso.

## Entregue nesta revisão
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

## Pendente antes de marcar a Fazenda como pronta
- [ ] Abrir o jogo em navegador de desktop e Android, jogar desde o início até a porteira sem usar atalhos.
- [ ] Conferir que todos os marcadores ficam acessíveis sem atravessar paredes, cercas ou objetos.
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
