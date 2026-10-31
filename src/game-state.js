// Regras puras compartilhadas pelos comandos de teclado, toque e gamepad.
// Nenhum evento de minijogo pode trocar protagonistas ou alterar a campanha.
export function canSwitchHero(state={}){
  return !!state.started && !state.paused && !state.dialogue &&
    !state.bikeEvent && !state.airportRush && !state.roadRun &&
    !state.choiceKind && !state.lotteryOpen && !state.completed;
}
// O estado 46 é conclusão persistida. Reabrir não pode reiniciar automaticamente.
export function isCompletedSave(step,finalStep){
  return Number.isInteger(step) && Number.isInteger(finalStep) && step===finalStep;
}
// Menus e pausa não devem atualizar objetos, NPCs ou animações do mundo.
export function shouldSimulateWorld(started,paused,completed=false){
  return !!started && !paused && !completed;
}
