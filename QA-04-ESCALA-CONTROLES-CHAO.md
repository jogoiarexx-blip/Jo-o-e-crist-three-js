# QA-04 — Escala, controles e chão (v0.6.5)

## Problemas encontrados no código
- Os GLBs eram normalizados para 1,70 unidade, contra aproximadamente 2,8 (João com chapéu) e 2,6 (Crist com boina) dos personagens procedurais anteriores.
- A/D usava o vetor oposto à direita visível da câmera; afeta teclado, setas, controle analógico e touch.
- A limitação artificial do fator de escala em [0,6; 1,5] impedia normalização correta de GLBs de outras unidades.
- O ajuste inicial dos pés usava a bind-pose antes da seleção de Idle; o clipe podia fazer o avatar parecer flutuar.

## Alterações
1. Modelos originais conservados, João com 2,78 e Crist com 2,58 unidades de altura total.
2. Grupo visual pai independente do rig que aplica escala uniforme e aproxima a sola do solo na pose exibida, sem alterar posição do ator, colisor, missões ou saves.
3. Compensação vertical amortecida usando Foot/Ankle mais baixo durante Idle/Walking/Running. Danças e comemorações preservam movimentos verticais.
4. A/D, joystick, teclado e setas usam a mesma base ortonormal da câmera; mouse e analógico direito giram no sentido de vista esperado.
5. Testes automatizados para seis direções de câmera, normalização diagonal, proporções e matemática de compensação dos pés.

## Checklist visual pendente em navegador real
- Comparar escala de João e Crist nas fases fazenda, cidade, excursão, aeroporto, estrada e deserto.
- Testar parado, caminhada, corrida, canto de parede, passagem de portas, câmera orbitando, controles mobile e troca de protagonistas.
- Confirmar que salvamentos e fases anteriores continuam disponíveis, sem regressão.
- Conferir logs de quantidade de ossos Foot/Ankle detectados para cada GLB. A ancoragem inicial funciona mesmo sem esses nomes; a compensação em tempo real requer ossos de pé identificáveis.

Os testes em Node verificam a matemática e a integração textual, mas não substituem uma validação visual WebGL.
