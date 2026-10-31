# QA-10 — Porteira sem teletransporte: Fazenda → Rodoviária

Versão 0.6.11 · 31/10/2026

## Problema confirmado

A transição narrativa 6→7 usava chapterEntryPosition() para colocar os dois personagens diretamente na praça (x=49, z=21), apesar de Fazenda e Rodoviária serem a mesma cena exterior. O acompanhamento também reposicionava subitamente o outro personagem se a distância ultrapassasse 16 unidades.

## Correções

- A transição 6→7 foi marcada como continuous:true. advanceTo preserva coordenadas e câmera originais nesta transição; continua salvando a etapa 7, acionando o objetivo e exibindo o diálogo. As mudanças entre capítulos realmente separados continuam com seus spawns.
- A descrição da transição deixa de sugerir chegada de ônibus e orienta caminhar pela estrada até a praça.
- A porta física ainda requer abrir a porteira no passo 6: o collider gate-leaf só é removido pelo sistema original openGate().
- A trilha visual liga o vão da porteira à área da cidade, sem criar novos obstáculos.
- Acompanhante no mapa externo deixa de executar teleport de resgate por distância: aumenta a velocidade até um limite de 7 unidades/s e usa ponto de passagem central da porteira quando a dupla está em lados diferentes da cerca.
- Ao continuar save da etapa 7, o spawn fica logo depois da porteira (15.8, 5.05), não no centro da cidade. Não há alteração da versão do save, dos objetivos seguintes nem do transporte legítimo entre ônibus/aeroporto/Route 66/deserto.

## Testes automatizados

tests/outdoor-continuity.test.mjs cobre: transição contínua, posição de retomada próxima da porteira, ausência de reposicionamento forçado, collider fechado/aberto, passagem no corredor até o alvo da cidade e orientação do companheiro nos dois sentidos. Os testes de colisões e transições anteriores também continuam ativos.

## Teste manual pendente

- [ ] Concluir a despedida de Pantera e abrir a porteira com João/Crist.
- [ ] Finalizar o diálogo e observar que os dois permanecem em frente à porteira sem salto de câmera.
- [ ] Atravessar o vão com ambos, caminhar até a praça e alcançar o painel de informações.
- [ ] Caminhar/correr longe do acompanhante; conferir que ele persegue pelo caminho, sem aparecer por teletransporte.
- [ ] Fechar e reabrir um save na etapa 7; conferir que reinicia próximo à porteira e não pula a caminhada até a praça.
- [ ] Confirmar que os capítulos de ônibus, aeroporto e estrada ainda têm a troca de cenário necessária.

Não foi feita execução visual completa por navegador. Os testes do GitHub Actions e a publicação devem ser verificados pela execução associada ao commit.