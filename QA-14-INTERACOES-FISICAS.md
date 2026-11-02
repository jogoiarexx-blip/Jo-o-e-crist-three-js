# QA-14 — Ações físicas em Fazenda, Route 66 e Deserto

**Revisão:** v0.7.1 · base v0.7.0 · 2 de novembro de 2026.

## Escopo e motivo

O jogo possui diálogos e condições de progressão funcionalmente completos em seis capítulos, mas algumas missões apenas mudavam o texto e os marcadores, sem um sinal visual claro da ação. Esta revisão acrescenta objetos e animação procedurais para atividades já presentes no roteiro, preservando a lógica de objetivos.

## Comparativo por subsistema

| Sistema | Antes | Depois |
|---|---|---|
| Malas, fase 00 | Itens coletados desapareciam; mala rígida | Tampa com dobradiça e abertura suave, documentos/roupas/farofa aparecem dentro; tampa fecha depois da missão |
| Fotografar, fase 04 | Apenas diálogo no mirante | Câmera 3D, flash temporário, fotografia/cartão 3D produzido e preservado no step seguinte |
| Galão, fase 05 | Mudava de posição (abrigo, bomba, perto de João, van) | Além da posição, medidor externo mostra água, fluxo visual na bomba durante o enchimento |
| Motor no deserto | Capô sempre aberto, vapor desaparecia ao mudar step | Tampa abre durante diagnóstico, peça/mangueira instalada visível, luz de revisão e fechamento gradual do capô após reparo |
| Saves | Versão interna 7 | Mesma versão; objetos refletem step e packing ao retomar |

### Fluxos de ação

- Step 4: mostrar três itens recolhidos dentro da mala enquanto a tampa permanece levantada. O fechamento acontece quando o último diálogo termina e o step avança para 5.
- Step 31: ao ativar o objetivo de fotografia, iniciar o gesto do personagem, acionar flash e revelar um cartão de foto no cenário. No step 32–34, a foto aparece sem precisar repetir a ação após carregar save.
- Step 39: ao ativar o enchimento, iniciar um fluxo visual de água na bomba. No step 40, o galão cheio acompanha João; a partir do step 41, ele fica entregue na van.
- Step 42: somente a alternativa correta de mangueira produz a peça visível, inclusive antes de terminar o diálogo. Step 43 mantém a peça; a partir do step 44 a revisão está concluída, a tampa fecha e o vapor não é emitido.
- Interações incorretas dos puzzles não acionam o reparo.
- O estado vem de `src/interaction-visual-state.js`, sem atualizar o formato do save.

### Performance e acessibilidade

- As geometrias leves são criadas apenas no respectivo hub. O sistema de criação sob demanda dos capítulos permanece.
- Animações usam os mesmos loops já existentes, sem vídeos, arquivos externos, observadores ou temporizadores adicionais.
- A conclusão das missões continua ocorrendo pelas interações normais, mesmo sem observar o efeito visual.
- A foto é um objeto estilizado gerado no Three.js, **não uma captura da tela nem arquivo de imagem salvo**. O galão usa medidor de água estilizado, não simulação volumétrica de fluido.
- O capô é geometria simples; reparo e gestos não constituem IK de mãos ou uma animação de oficina detalhada.

### Verificação e pendências

`tests/interaction-visuals.test.mjs` valida os checkpoints, a visibilidade dos objetos, a escolha de ações, a ligação do código e a recuperação de progressos antigos. A suíte existente de saves, colisões e capítulos deve continuar passando no GitHub Actions.

**Ainda não certificado visualmente em uma partida real:** alinhamento das mãos de GLBs na mala/galão, localização do flash, fotografia ao lado do mirante, capô e mangueira vistos de todas as câmeras, desempenho em aparelhos fracos. Testar in-game antes de afirmar que tudo está perfeito.

Próximo passo: animações de pegar/colocar com IK ou clips específicos, suporte visual de segurar a mala com as duas mãos, objetos interativos do ônibus e aeroporto, e certificado de playthrough completo 0–46.
