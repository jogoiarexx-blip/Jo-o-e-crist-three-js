# QA-11 — Guichê da Rodoviária: Portão 2 corrigido

Versão 0.6.12 · 31/10/2026

## Reprodução do defeito

O usuário enviou uma captura com o título **QUAL É O PORTÃO DA PASSAGEM?**, três respostas de portão e um cabeçalho contraditório **CAPÍTULO 04 · ROUTE 66**.

O problema estava no código de `src/main.js`:
1. `puzzleDefinition('route')` obtinha `CITY_CHOICES.route`, que tem a resposta correta **'2'**.
2. `submitCityChoice()` testava `kind in ROAD_CHOICES` ANTES de `kind in CITY_CHOICES` e, como ambos possuíam a chave `route`, chamava `checkRoadAnswer('route','2')`.
3. O puzzle da estrada responde **'66'**. Portanto, clicar no Portão 2 (ou qualquer outro) era avaliado como falso. A origem do rótulo errado era a mesma colisão de nomes.
4. Os comandos da estrada nos steps 28 e 32 abriam `roadRoute` e `roadRepair`, mas `ROAD_CHOICES` usava apenas `route` e `repair`; esses dois painéis também estavam sujeitos a falha de abertura.

## Correção

Criado `src/puzzle-resolver.js`, que unifica a seleção de pergunta, capítulo exibido e função de validação para as alternativas.

- `route`: puzzle da Rodoviária, cabeçalho correto **CAPÍTULO 01 · RODOVIÁRIA**, resposta **2**, diálogo `SCENES.routeSolved`, avanço para step **11**.
- `roadRoute`: puzzle da estrada Route 66, resposta **66**, diálogo `ROAD_SCENES.route`, avanço para step **29**.
- `roadRepair`: puzzle mecânico da Route 66, resposta **cool**, avanço para step **33**.
- Todas as outras perguntas continuam válidas, sem trocar resposta, etapa ou narrativa.
- `src/main.js` usa `resolvePuzzle(kind)` tanto para apresentar o painel quanto para validar a escolha. Elimina a divergência entre exibição e avaliação.

## Validação

- Novo teste `tests/choice-registry.test.mjs` cobre reprodução precisa do Portão 2; portões 1 e 3 devem falhar; Route 66 e revisão mecânica respondem à respectiva alternativa; os 16 desafios previstos possuem exatamente **uma** opção certa entre três; integração mantém próximos steps corretos.
- Teste local de clique em **Chromium headless**, com uma interface de guichê isolada reproduzindo as opções e a lógica: Portão 1 incorreto, Portão 2 correto com destino 11, Portão 3 incorreto, Route 66 correta com destino 29. **Este teste foi em uma reprodução local da interface, não em toda a aplicação 3D.**
- Não foi possível abrir o site externo a partir do Chromium desta sessão (restrição de rede/DNS do ambiente); portanto, **não foi realizada uma partida visual completa** com GLBs, WebGL, áudio e todas as fases.
- O GitHub Actions executa verificação de sintaxe e regressões reais do código, e a implantação ocorre no GitHub Pages quando o fluxo estiver verde.

## Checklist de homologação no site

- [ ] No guichê, conferir que o cabeçalho diz CAPÍTULO 01 · RODOVIÁRIA.
- [ ] Clicar Portão 1: resposta errada e retorno ao puzzle.
- [ ] Clicar Portão 2: resposta certa, diálogo de portão e objetivo seguinte (step 11).
- [ ] Clicar Portão 3: resposta errada e retorno ao puzzle.
- [ ] Testar Enter/Espaço/teclas 1, 2 e 3, mouse, toque e gamepad A.
- [ ] Na Route 66, puzzle da estrada aparece e aceita 66; revisão da van aceita esperar o motor esfriar.
- [ ] Confirmar saves e fases existentes, sem reinício involuntário.

**Status de publicação:** verificar o run associado à v0.6.12 no GitHub Actions.
