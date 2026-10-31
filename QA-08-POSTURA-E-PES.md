# QA-08 — João e Crist: postura parados e pés no chão

**Versão:** 0.6.9 | **Data:** 31/10/2026 | **Arquivos:** `src/avatar-glb.js`, `src/avatar-logic.js`, `tests/avatars.test.mjs`.

## Diagnóstico do código anterior

1. `makeIdleClip` congelava `Walking` em uma posição temporal fixa, de forma que João ou Crist podiam permanecer com uma perna à frente ou levemente levantada.
2. Na carga do GLB, `updateCharacterAnimation(root,0)` iniciava `fadeIn(.17)` e avançava o mixer por zero segundos. A postura resultante ainda podia ser a bind pose; portanto `Box3` não media obrigatoriamente a pose real de repouso.
3. A posição vertical era recalculada pelo menor `Foot/Ankle/Toe`, comparado com a altura de referência do **osso**, e não pela geometria da **sola do sapato**. Como a articulação fica acima da sola, a referência era incapaz de garantir que o modelo não atravessasse o chão.
4. O erro vertical era limitado a ±0,22 por atualização e interpolado, inclusive quando a sola já estava abaixo do terreno, deixando penetração perceptível durante a transição entre passos.

## Alterações efetivas

- Escolha de pose parada: `neutralWalkTime` amostra **16 posições distribuídas por um ciclo** do clip `Walking`, compara as alturas e as posições dianteiras de um osso esquerdo e um direito e escolhe um quadro com apoio mais simétrico. Preserva todos os tracks de rig do GLB.
- A pose idle é aplicada **com peso 1**, sem crossfade inicial, antes de `Box3.setFromObject(mount, true)`. Assim o alinhamento na carga usa a malha já na pose de repouso e não a bind pose.
- O grupo visual recebe o ajuste absoluto para que a base dos sapatos fique em `y=0,018` em relação ao chão. Posição física do ator, controles, raio de colisão e save não são alterados.
- O delta do menor osso dos pés passa a ser calibrado contra a malha na pose real: `boneToSole`. Na caminhada, o sistema estima a sola por `lowestBoneY - boneToSole`, e não por `lowestBoneY` isoladamente.
- A correção para cima é imediata quando a sola está abaixo do solo. A descida enquanto caminha continua gradual para diminuir trepidação.
- Ao estabilizar o clip idle ou o aceno após o crossfade, o sistema recalcula os limites **precisos** do modelo e corrige a base para remover penetração residual. Se não houver ossos de pé reconhecíveis, faz medições geométricas periódicas (intervalo mínimo de 120 ms).
- Deslocamento visual total limitado a ±0,75 unidade em relação à altura inicial; evita deslocamento cumulativo do avatar.
- A correção não movimenta o collider, não muda os pontos de spawn, o caminho do companheiro, a câmera ou a versão do save.

## Comparação

| Item | v0.6.8 | v0.6.9 |
|---|---|---|
| Escolha da pose idle | Amostra fixa arbitrária da caminhada | Melhor entre 16 amostras de apoio |
| Primeiro alinhamento vertical | Possível bind pose por `fadeIn` ainda em zero | Idle já aplicado com peso total |
| Referência de contato | Altura dos ossos | Altura da sola calibrada usando geometria |
| Correção ao afundar | Gradual/clamp por frame | Imediata para cima |
| Retorno de caminhada para repouso | Sem aferição precisa final | Medição exata na pose estabilizada |
| Rig desconhecido | Sem correção após início se sem ossos | Amostragem geométrica periódica |
| Colisões/saves/escala | Existentes | Preservados |

## Testes e limites

- Os testes adicionados verificam a seleção de pose mais neutra, correção vertical imediata, suavização na descida, entradas inválidas e a integração no módulo de avatar.
- `npm run check` e `npm test` devem passar no GitHub Actions. O resultado da execução constará na ação do commit.
- **Ainda é necessário testar visualmente os dois GLBs no navegador.** A correspondência exata entre ossos e geometria depende da estrutura real de cada rig; o teste unitário não substitui vídeo da caminhada.
- Em animações de dança e comemoração não é aplicado snap vertical forçado, para preservar saltos intencionais. Se houver penetração nessas animações, será preciso tratar o contato específico de cada clip.

## Checklist visual

- [ ] João e Crist em repouso: corpo estável, postura sem passada congelada; ambos os calçados apoiados.
- [ ] Caminhar em diferentes direções, parar e repetir: nenhuma sola atravessa o piso durante idle, walk e transição.
- [ ] Alternar João/Crist parado e andando, validar mesma altura de câmera.
- [ ] Testar a Fazenda, rodoviária, ônibus, aeroporto, Route 66 e Deserto sem deslocamento vertical do collider.
- [ ] Testar touch, teclado e gamepad e saves preexistentes.
- [ ] Medir custo de alinhamento preciso, principalmente em celulares de entrada.
