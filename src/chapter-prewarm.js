// Prepara capítulos FUTUROS fora da transição, durante intervalo ocioso.
// Não antecipa a Fazenda nem cria os quatro hubs no início do jogo.
export const PREWARM_MILESTONES=Object.freeze([
  Object.freeze({from:9,to:11,chapter:'bus'}),
  Object.freeze({from:16,to:18,chapter:'airport'}),
  Object.freeze({from:24,to:26,chapter:'road'}),
  Object.freeze({from:31,to:34,chapter:'desert'})
]);
export function nextChapterToPrewarm(step){
  if(!Number.isInteger(step))return null;
  return PREWARM_MILESTONES.find(m=>step>=m.from&&step<=m.to)?.chapter||null;
}
