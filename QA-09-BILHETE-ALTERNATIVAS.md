# QA-09 — Conferência do bilhete na Fazenda (v0.6.10)

## Relato
Na primeira fase, ao conferir o bilhete, o usuário relatou que as alternativas/ações não funcionavam. O fluxo 3D existente do bilhete contém dois botões sequenciais no mesmo painel (primeiro **CONFERIR RESULTADO**, depois **COMEMORAR**); as alternativas de três respostas pertencem a outros puzzles do jogo.

## Diagnóstico de código
A conclusão de `checkLottery()` fechava o painel, marcava `lotteryAccepted=true` e chamava `useTarget()` novamente. Isso significava que, mesmo após usar o marcador para abrir a conferência, concluir a missão exigia uma **segunda validação espacial** de `nearTarget()`. Se a validação falhasse, o painel fechava sem exibir os diálogos nem avançar para a etapa 3, dando impressão de que a confirmação não funcionava.

Adicionalmente, no teclado, havia dois mecanismos potencialmente concorrentes para ativar uma opção focada: o atalho global Enter/Espaço e a ativação nativa de um botão HTML.

## Correções feitas
1. `src/lottery-state.js` traz um fluxo puro e explícito: etapa 0 conferir → 1 resultado revelado → 2 conclusão.
2. `src/main.js` elimina a segunda chamada de `useTarget()` após COMEMORAR. O painel encerra, toca efeito da vitória, apresenta `SCENES.ticket` e avança diretamente para `advanceTo(3)` quando o diálogo termina.
3. A abertura valida que o jogador está realmente na missão do bilhete (passo 2), evitando estado modal inválido.
4. Os eventos Enter/Espaço sobre **botões focados dentro do painel** não são consumidos pelo atalho global; o clique nativo faz a ativação apenas uma vez.
5. Os demais capítulos, modelos GLB, colisores e saves não foram alterados.

## Testes automatizados
- `tests/lottery-flow.test.mjs`: primeira confirmação revela números; segunda finaliza; missão seguinte é falar com Crist; painel não depende de `useTarget()` para concluir; handler de botão é registrado; teclado não aciona duas vezes a alternativa focada.
- As suites anteriores de história e saves também devem permanecer passando.

## Limitações e teste manual
Sem sessão visual com o navegador real nesta alteração, não é possível garantir que o bug foi reproduzido em um dispositivo específico ou que era a única causa. Verificar:
- [ ] Iniciar nova partida, tomar café, ouvir rádio, abrir bilhete.
- [ ] Clicar **CONFERIR RESULTADO**, visualizar números; clicar **COMEMORAR**.
- [ ] Ler o diálogo, observar a missão mudar para **Conte a novidade para Crist**.
- [ ] Repetir por mouse, toque, Enter e E; testar com gamepad.
- [ ] Confirmar que alternativas dos outros puzzles (mala/portão) continuam selecionáveis.

A aprovação de CI e a publicação devem ser registradas pelo GitHub Actions.
