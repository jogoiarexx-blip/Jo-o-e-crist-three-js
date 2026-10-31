// Fluxo determinístico para a conferência do bilhete na Fazenda.
// 0 = resultado ainda oculto; 1 = números conferidos; 2 = finalizado.
// O avanço de 1 para 2 não precisa de uma segunda colisão no cenário.
export const LOTTERY_STAGE=Object.freeze({CHECK:0,REVEALED:1,DONE:2});
export function nextLotteryStage(stage){
  if(stage===LOTTERY_STAGE.CHECK)return LOTTERY_STAGE.REVEALED;
  if(stage===LOTTERY_STAGE.REVEALED)return LOTTERY_STAGE.DONE;
  return LOTTERY_STAGE.DONE;
}
export function lotteryStageLabel(stage){
  return stage===LOTTERY_STAGE.REVEALED?'COMEMORAR':'CONFERIR RESULTADO';
}
