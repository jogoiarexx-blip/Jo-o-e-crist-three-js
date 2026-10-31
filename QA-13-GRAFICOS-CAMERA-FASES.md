# QA-13 — Gráficos, câmera e polimento das fases (v0.7.0)

Revisão visual e de câmera dos capítulos 00–05, **sem alterar roteiro, missões, colisões de jogo existentes (exceto o parapeito novo do mirante) nem o formato do save (continua versão 7)**. Pacote R3 do plano-mestre (polimento das fases antigas) + parte de P1.2 (desempenho) e P1.3 (câmera).

## Diagnóstico feito antes das mudanças

Capturas em Chrome headless (SwiftShader) dos passos 0, 3, 7, 12, 19, 27, 29, 35 e 45, com `?debug=1`:

| Problema | Onde | Causa |
|---|---|---|
| Placas com texto **espelhado** ("LEBAM", "ATUOR 66", "VEGAS" invertido) | Route 66, Deserto, Rodoviária | `MeshBasicMaterial` com `DoubleSide` mostra a textura invertida pelo verso |
| Mesmo céu azul-esverdeado e mesma neblina em todos os capítulos | Todos | `scene.background`/`Fog` fixos em `world.js`; deserto e pôr do sol com céu de fazenda |
| Mapa "flutuando" no vazio; borda do chão e fim da pista visíveis | Route 66, Deserto, Aeroporto, Ônibus | Hubs pequenos (30–40 m) sem horizonte |
| Sombra serrilhada e borrada | Todos | Mapa 1024 cobrindo 72×76 m, fixa no mundo |
| Câmera alta demais (~29°), sem suavizar giro, sem seguir o herói | Todos | `lift=3.1+pitch*5` e `lookAt` direto |
| Câmera colada nas costas/no topo da cabeça ao nascer perto de parede | Ônibus, Aeroporto, Deserto (van) | Distância encurtada sem alternativa |
| "Miniatura" de prédios logo atrás do mirante no lugar de Vegas | Deserto passo 45 | 19 caixas de 0,3–1 m a 5 m do jogador |

## O que mudou

### Gráficos
- **`src/atmosphere-profiles.js` + `src/atmosphere.js`** — céu em gradiente (shader) com disco/brilho do sol e sete perfis: manhã na fazenda, meio-dia na rodoviária, fim de tarde dourado na excursão, dia claro no aeroporto, tarde na Route 66, sol a pino no deserto e **pôr do sol no mirante**. Neblina com a cor do horizonte, luz hemisférica, sol e exposição por perfil; transições contínuas fazem mistura de 2,4 s.
- **Sombra que acompanha o jogador**: frustum de ±16/20/24 m conforme a qualidade, alinhada à grade de texels (sem tremulação ao andar), `normalBias` contra acne.
- **`src/quality.js`** — perfis `low/medium/high` (celular de 4 núcleos começa em `low`), `?q=low|medium|high` força o perfil, e **resolução dinâmica**: abaixo de 45 FPS reduz a escala, acima de 57 recupera.
- **`src/scenery.js` + `src/scatter.js`** — cenografia determinística (mesma semente em qualquer aparelho), toda instanciada e sem colisores:
  - Fazenda/cidade: ~1500 tufos de capim, flores, pedras, linha de pinheiros e duas camadas de morros, pássaros planando, chão com variação de tom por vértice, árvores balançando ao vento.
  - Excursão: **paisagem passando pela janela** (gramado e asfalto com textura rolando, árvores e postes em bloco periódico) e leve vibração da câmera.
  - Aeroporto: pátio com pista, aviões estacionados, torre, hangares, estacionamento e **um avião decolando a cada 30 s**.
  - Route 66: deserto até o horizonte, **estrada contínua**, postes e vegetação que passam pela van ao dirigir, mesas em duas camadas.
  - Deserto: seixos, arbustos, mesas, arbustos secos rolando e **Las Vegas no horizonte** — silhueta na névoa de dia e janelas/néon acesos ao entardecer; vão no relevo para a linha de visão do mirante.
- **Placas legíveis dos dois lados** com um único desenho (o shader espelha a coordenada U no verso).
- Marcador de objetivo com coluna de luz e pulso no chão; ambos somem em diálogos e escolhas.
- Excursão: três luzes de palco que acendem com o som consertado e varrem o corredor no número musical.

### Câmera (`src/camera-director.js`)
- Yaw/pitch/zoom do jogador viram **alvo**; a câmera exibida suaviza tudo de forma independente de FPS. WASD segue a câmera exibida.
- Perfis por ambiente: exterior (mais baixa, ~18°), casa, **corredor do ônibus** (baixa, lente 70°) e aeroporto.
- **Acompanhamento automático** por trás do herói quando ele anda para a frente e o jogador não mexe na câmera há 1,6 s; movimento lateral reduz o efeito (não orbita) e andar em direção à câmera não a vira.
- **Plano de diálogo**: enquadra João e Crist em três quartos, mais baixo e fechado.
- **Plano de abertura** ao carregar/entrar em capítulo: começa alto e girado e desce em ~2,6 s sem travar os controles.
- **Passa por cima de obstáculos baixos** (van, bancos, balcões, paredes sem teto) testando trajetórias elevadas, em vez de colar nas costas; nos interiores sem teto ela **não sai da sala**.
- Mirante (passo 45): a câmera vira para Las Vegas ao se aproximar.
- Route 66: lente abre com a velocidade, horizonte inclina levemente com a direção, tremor ao bater e descida de grua ao começar a dirigir.
- Tremor curto na bicicleta e no tropeço do aeroporto.
- **C** (ou R3 no gamepad) centraliza a câmera atrás do personagem.
- Pausa: **CÂMERA AUTOMÁTICA** liga/desliga e **EIXO VERTICAL** normal/invertido (salvos no navegador).

### Fases
- Deserto: parapeito do mirante (com colisor `desert-lookout-rail`), placa movida para a lateral e a miniatura substituída por Vegas em escala.
- Route 66: faixas antigas de 30 m substituídas por faixa instanciada contínua.

## Testes

- `npm test`: **127 testes, todos passando** (114 anteriores + 13 novos em `tests/visual-camera.test.mjs`).
- Dois testes antigos que liam o texto de `main.js` foram atualizados para o novo formato mantendo a mesma intenção (corte só em transições não contínuas; câmera usa a checagem de folga). O teste do deserto passou a esperar 6 sólidos (+ parapeito).
- Novos testes: perfis de atmosfera alinhados às camadas de capítulo, mistura de perfis, presets/resolução dinâmica, distribuição sem invadir estradas/colisores/missões, vão de visão para Vegas, parapeito sem bloquear o objetivo final, perfis de câmera, acompanhamento automático (inclusive independência de FPS), plano de diálogo, limites de tremor/lente e integração.
- Capturas automáticas antes/depois dos passos 0, 3, 7, 17, 22, 27, 29, 35 e 45, mais diálogo, caminhada com W+D, pausa e celular em paisagem — **sem erros de página**.

## Limitações

- As capturas foram feitas em renderização por software (1–2 FPS). **FPS real em desktop e Android ainda precisa ser medido**; a resolução dinâmica e o preset `low` existem para isso.
- Draw calls: Fazenda 545 → ~570, ônibus 82 → ~175 (paisagem da janela, luzes de palco), demais capítulos entre 80 e 105. Toda a vegetação é instanciada; ainda não há fusão de geometria estática dos cenários antigos.
- O acompanhamento automático pode ser desligado na pausa caso algum jogador prefira câmera totalmente manual.
- Parâmetros de QA: `?debug=1&nointro` pula o plano de abertura; `?debug=1&at=x,z` posiciona a dupla.
