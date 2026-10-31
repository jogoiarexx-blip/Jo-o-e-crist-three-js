import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {LOTTERY_STAGE,nextLotteryStage,lotteryStageLabel} from '../src/lottery-state.js';
import {SCENES,getQuest,validateSave,SAVE_VERSION} from '../src/story.js';

test('bilhete: primeira confirmação mostra números e segunda conclui',()=>{
  assert.equal(LOTTERY_STAGE.CHECK,0);
  assert.equal(nextLotteryStage(LOTTERY_STAGE.CHECK),LOTTERY_STAGE.REVEALED);
  assert.equal(nextLotteryStage(LOTTERY_STAGE.REVEALED),LOTTERY_STAGE.DONE);
  assert.equal(nextLotteryStage(LOTTERY_STAGE.DONE),LOTTERY_STAGE.DONE);
  assert.equal(lotteryStageLabel(LOTTERY_STAGE.CHECK),'CONFERIR RESULTADO');
  assert.equal(lotteryStageLabel(LOTTERY_STAGE.REVEALED),'COMEMORAR');
});
test('conclusão da Fazenda avança da missão bilhete para conversar com Crist',()=>{
  assert.equal(getQuest(2).id,'ticket');
  assert.equal(getQuest(3).id,'crist');
  assert.ok(SCENES.ticket.length>=3);
  const prior=validateSave({version:SAVE_VERSION,step:2,hero:'crist',packing:[]});
  assert.equal(prior.step,2);
  assert.equal(validateSave({...prior,step:3}).step,3);
});
test('a confirmação é ligada diretamente ao diálogo e progressão, sem segundo alvo no cenário',()=>{
  const code=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
  const start=code.indexOf('function checkLottery(){');
  const end=code.indexOf('function startAirportRush(){',start);
  assert.ok(start>=0&&end>start);
  const impl=code.slice(start,end);
  assert.match(impl,/nextLotteryStage\(lotteryStage\)/);
  assert.match(impl,/lotteryAccepted=true/);
  assert.match(impl,/showDialogue\(SCENES\.ticket,\(\)=>advanceTo\(3\)\)/);
  assert.doesNotMatch(impl,/useTarget\(\)/);
  assert.match(code,/ui\.lotteryButton\.addEventListener\('click',checkLottery\)/);
});
test('botão com foco não ativa alternativa duas vezes via Enter ou Espaço',()=>{
  const code=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
  assert.match(code,/nativeButton=e\.target\?\.closest\?\.\('button'\)/);
  assert.match(code,/nativeActivation&&\(choiceKind\|\|lotteryOpen\)/);
  assert.match(code,/btn\.addEventListener\('click',\(\)=>submitCityChoice\(option\.id\)\)/);
});
