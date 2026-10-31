# QA-05 — Controle unificado, save de conclusão e consumo no menu

**Revisão:** v0.6.6, 31/10/2026. **Escopo:** correções reais da engine e testes de regressão, sem adicionar Vegas prematuramente.

## Antes/depois (verificável em código)

| Sistema | Antes v0.6.5 | Depois v0.6.6 |
|---|---|---|
| Troca pelo teclado | Restrições próprias | canSwitchHero() |
| Troca pelo touch | Restrições próprias, divergentes | canSwitchHero() |
| Troca pelo gamepad | Podia alternar durante roadRun/airportRush | canSwitchHero(), mesmo bloqueio |
| Perda de foco | Teclas limpas; stick e botões persistiam | resetMovementInput() e prevPad={} |
| Pausa segurando joystick | Stick virtual podia continuar ativo | Reset completo do movimento |
| Save no passo 46 | start() zerava step/packing e sobrescrevia progresso | Conclusão preservada; reabrir mostra fim; reinício somente por botão explícito |
| Menu inicial | Render + animateElder + world.update em loop | Sem simulação de mundo; até 10 renders/s no menu/pausa |
| Organização | Políticas de controle divergentes | src/game-state.js, funções puras testáveis |

## Correções aplicadas

1. src/game-state.js define canSwitchHero, isCompletedSave e shouldSimulateWorld.
2. src/main.js centraliza a troca em switchHero(), limpa entradas e mantém o checkpoint do deserto.
3. index.html esclarece a persistência do save e o reinício explícito.
4. README e package.json atualizados para v0.6.6.
5. tests/game-state.test.mjs cobre matriz de estados e a integração dos três comandos.

## Limites e pendências

- NÃO foram criadas novas fases. O passo 46 continua sendo a conclusão atual do deserto e ficará disponível para a futura transição a Vegas.
- NÃO há lazy loading de cenas: os seis mundos continuam instanciados no setup. CPU/GPU em menu caem em princípio, mas RAM inicial não foi otimizada.
- NÃO foi jogado no navegador nesta revisão; testes Node não provam visual WebGL, qualidade do contato dos pés nem FPS Android.

## Checklist de homologação manual

- [ ] PC: W/A/S/D, mouse, TAB e E em vários ângulos.
- [ ] Android: joystick, TROCAR, AÇÃO, pausa e recuperação após mudar app.
- [ ] Gamepad: troca bloqueada na van, bicicleta, esteira, diálogo e escolha.
- [ ] Salvar 46: fechar/reabrir e usar REVER CONCLUSÃO sem perder packing nem fase.
- [ ] Botão REINICIAR AVENTURA DO ZERO apaga apenas chaves desta edição 3D.
- [ ] Menu parado, sem simulação dos velhinhos/Pantera/mundo.
- [ ] Comparar FPS, draw calls e frame times em PC e Android reais.

## Verificação técnica

CI executa npm run check e npm test. Consultar logs do GitHub Actions antes de marcar o pacote aprovado.
