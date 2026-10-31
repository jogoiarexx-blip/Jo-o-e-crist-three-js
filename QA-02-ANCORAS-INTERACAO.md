# QA-02 — Âncoras físicas de interação no ônibus e aeroporto

**Versão:** v0.6.2  
**Base:** v0.6.1 QA-01 · **Capítulos:** 02 (Excursão Errada) e 03 (Aeroporto dos Perdidos).  
**Princípio:** todas as missões e diálogos são preservados; somente locais, alcance e regras de acionamento foram corrigidos.

## 1. Problema reproduzido

Os marcadores dos puzzles estavam posicionados no centro do corredor, mesmo quando o objeto correspondente ficava encostado à parede do ônibus ou aeroporto. Era possível resolver tarefas longe de uma mala, banco ou balcão, e em certas posições bastava estar dentro do raio para interagir através de objetos.

### Comparativo antes/depois

As distâncias referem-se ao centro do objeto 3D visível, não ao limite da malha.

| Interação | Antes | Depois | Comportamento |
|---|---:|---:|---|
| Ônibus: assento | 3,05 | 1,55 | Ponto livre na lateral do assento |
| Ônibus: caixa ESTELAR | ~4,31 | ~1,54 | Jogador aproxima-se do bagageiro |
| Ônibus: microfone | 1,25 | ~0,29 | Inspeção junto ao microfone |
| Ônibus: mesa de som | ~3,11 | ~1,45 | Conexão junto ao equipamento |
| Ônibus: palco | ~0,40 | ~0,05 | Movimento no palco |
| Aeroporto: painel | 3,80 | 1,25 | Leitura diante do painel |
| Aeroporto: check-in | ~5,22 | ~2,01 | Interação em frente ao balcão |
| Aeroporto: passaporte | 5,10 | 1,75 | Conferência junto às pastas |
| Aeroporto: bagagem | ~5,12 | 1,80 | Farofa diante da mala |
| Aeroporto: inspeção | 5,00 | 1,90 | Bandejas e scanner |
| Aeroporto: portão C7 | 4,40 | 1,50 | Leitura do painel atualizado |
| Aeroporto: embarque | 5,10 | 1,75 | Cartões perto do guichê |

Os objetos possuem colisores sólidos. Por isso, o **ponto de acionamento fica diante da superfície**, não dentro do objeto. A distância do gatilho ao centro visual é propositalmente maior que o raio em alguns balcões.

## 2. Mudanças implementadas

- `src/bus-state.js`: reposicionados os sete marcadores, com raio entre 1,25 e 1,8; adicionadas coordenadas centrais de `BUS_PROPS`; três artistas reposicionados em áreas transitáveis.
- `src/bus-interior.js`: partes do ambiente passam a usar `BUS_PROPS`; identificação da cabine acrescentada.
- `src/airport-state.js`: reposicionados oito marcadores, raio entre 1,3 e 1,65; dados centrais de `AIRPORT_PROPS`; três NPCs de atendimento reposicionados.
- `src/airport-world.js`: principais objetos 3D reaproveitam as coordenadas `AIRPORT_PROPS`.
- `src/interaction-anchors.js`: regra pura `canUseObjective` valida distância ao marcador e, para steps 12–26, amostra o caminho em incrementos de aproximadamente 16 cm contra os colliders ativos; bloqueia acionamentos através de bancos e balcões.
- `src/main.js`: o indicador de **AÇÃO** e `nearTarget()` utilizam a mesma regra. A área de ativação visual coincide com a área de ativação real.
- `tests/interaction-anchors.test.mjs`: valida posição, acesso, distância, NPCs, linha de visão e busca de caminho a partir dos dois spawns.

## 3. Critérios e testes

- [x] Os sete marcadores do ônibus encontram-se junto aos elementos narrados.
- [x] Os oito marcadores do aeroporto encontram-se diante dos objetos correspondentes.
- [x] Os seis NPCs estão em posições livres de colisão.
- [x] O antigo ponto no centro do corredor não libera o puzzle do check-in ou da caixa ESTELAR.
- [x] Tentar acionar através do banco ou do balcão não satisfaz a regra.
- [x] Todos os 15 objetivos são alcançáveis desde o spawn do capítulo com colliders ativos e linha de visão.
- [x] Não alterados os 47 estados narrativos, progressão, personagens selecionados ou migração do save 7.
- [ ] Validar visualmente as âncoras e os marcadores na tela em PC.
- [ ] Testar toque, gamepad e câmera no interior estreito do ônibus e na região das filas.
- [ ] Animar o gesto real ao sentar, abrir uma caixa, passar documento e reconectar cabo.

## 4. Limitações conhecidas e próximas correções

Este ajuste corrige a **localização de gatilhos e coerência espacial**, não introduz novas animações. As escolhas continuam sendo feitas no painel de alternativas após o jogador se aproximar do objeto. A regra de linha de visão emprega volumes AABB 2D, e não raycast na geometria renderizada; pode exigir refinamento após teste visual.

A sequência da história que leva ao ônibus errado ainda precisa ser revisada na **QA-03**. Não avançar a cidade de Vegas antes da validação das fases anteriores.

**QA validada:** inspeção estática de código e testes automatizados. A execução integral em navegador/Android ainda não foi homologada.
