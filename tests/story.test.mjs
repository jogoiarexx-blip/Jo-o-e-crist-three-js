import test from 'node:test';
import assert from 'node:assert/strict';
import {QUESTS,SCENES,INTRO,getQuest,validateSave,PACKING_ITEMS,normalizePacking,nextPackingTarget,getPackingProgress,LOTTERY_NUMBERS,SAVE_VERSION,FINAL_STEP,canUsePackingItem} from '../src/story.js';

test('campanha ampliada: despertar, sorteio, bilhete, conversa e TODAS as cenas antigas',()=>{
  assert.equal(QUESTS.length,36);
  assert.equal(FINAL_STEP,35);
  assert.deepEqual(QUESTS.map(q=>q.id),['wake','radio','ticket','crist','suitcase','pantera','gate','cityWelcome','crossing','cityBag','cityClerk','bus','busSeat','busCrew','busCase','busInspect','busConnect','busDance','busReveal','airWelcome','airCheckin','airPassport','airFarofa','airSecurity','airGate','airRush','airBoard','roadWelcome','roadRoute','roadDrive1','roadStop','roadPhoto','roadRepair','roadDrive2','roadBreakdown','done']);
  assert.equal(getQuest(99).id,'done');
  assert.equal(getQuest(-1).id,'wake');
  assert.equal(getQuest(7).id,'cityWelcome');
  assert.equal(getQuest(8).id,'crossing');
  assert.equal(getQuest(9).id,'cityBag');
  assert.equal(getQuest(10).id,'cityClerk');
  assert.equal(getQuest(11).id,'bus');
  assert.equal(getQuest(12).id,'busSeat');
  assert.equal(getQuest(15).id,'busInspect');
  assert.equal(getQuest(17).id,'busDance');
  assert.equal(getQuest(18).id,'busReveal');
});
test('diálogos principais estão presentes',()=>{
  assert.ok(INTRO.length>=4);
  for(const key of ['wake','ticket','radio','crist','suitcase','pantera','gate','cityWelcome','bagWrong','bagSolved','routeWrong','routeSolved','bikeOK','bikeHit','bus']){
    assert.ok(Array.isArray(SCENES[key]) && SCENES[key].length>=3,key);
    for(const line of SCENES[key])assert.ok(line.length===2&&line[0]&&line[1]);
  }
});
test('saves v1/v2/v3 migram sem perder os capítulos anteriores',()=>{
  assert.equal(SAVE_VERSION,6);
  assert.deepEqual(validateSave(null),{version:6,step:0,hero:'joao',packing:[]});
  assert.equal(validateSave({version:1,step:1,hero:'crist'}).step,2);
  assert.equal(validateSave({version:1,step:2,hero:'crist'}).step,3);
  assert.equal(validateSave({version:1,step:3,packing:['documents']}).step,4);
  assert.deepEqual(validateSave({version:1,step:3,packing:['documents']}).packing,['documents']);
  assert.equal(validateSave({version:1,step:6}).step,7);
  assert.equal(validateSave({version:1,step:7}).step,9);
  assert.equal(validateSave({version:1,step:8}).step,12);
  assert.equal(validateSave({version:2,step:7}).step,7);
  assert.equal(validateSave({version:2,step:8}).step,9);
  assert.equal(validateSave({version:2,step:9}).step,12);
  assert.equal(validateSave({version:3,step:10}).step,10);
  assert.equal(validateSave({version:3,step:11}).step,11);
  assert.equal(validateSave({version:3,step:200}).step,12);
  assert.equal(validateSave({version:4,step:200}).step,19);
  assert.equal(validateSave({version:5,step:200}).step,27);
  assert.equal(validateSave({version:6,step:200}).step,35);
  assert.equal(validateSave({version:6,step:31}).step,31);
  assert.equal(validateSave({version:4,step:16}).step,16);
  assert.equal(validateSave({version:4,step:18,hero:'crist'}).hero,'crist');
  assert.equal(validateSave({version:1,step:-3}).step,0);
  assert.equal(validateSave({version:3,step:4,hero:'forged'}).hero,'joao');
  assert.equal(validateSave({version:99,step:7}).step,0);
  assert.deepEqual(validateSave({version:1,step:4,hero:'joao'}).packing,['documents','clothes','farofa']);
});
test('a mala exige documentos, roupas e farofa antes de fechar',()=>{
  assert.deepEqual(PACKING_ITEMS.map(item=>item.id),['documents','clothes','farofa']);
  assert.equal(nextPackingTarget([]),'documents');
  assert.equal(nextPackingTarget(['documents']),'clothes');
  assert.equal(nextPackingTarget(['documents','clothes']),'farofa');
  assert.equal(nextPackingTarget(['documents','clothes','farofa']),'suitcase');
  assert.equal(getPackingProgress(['documents','documents','fake'] ),1);
});
test('save aceita somente objetos válidos e preserva coleta parcial',()=>{
  const dirty=['documents','fake','documents',null,'clothes',{},'farofa'];
  assert.deepEqual(normalizePacking(dirty),['documents','clothes','farofa']);
  assert.deepEqual(validateSave({version:1,step:3,hero:'crist',packing:['documents','documents','fake']}).packing,['documents']);
  assert.deepEqual(validateSave({version:1,step:2,packing:['farofa']}).packing,['farofa']);
  assert.deepEqual(validateSave({version:1,step:0,packing:'documents'}).packing,[]);
  assert.ok(SCENES.documents.length>0&&SCENES.clothes.length>0&&SCENES.farofa.length>0);
});
test('tarefas preparatórias alternam entre Crist e João',()=>{
  assert.equal(canUsePackingItem('documents','crist'),true);
  assert.equal(canUsePackingItem('documents','joao'),false);
  assert.equal(canUsePackingItem('clothes','crist'),true);
  assert.equal(canUsePackingItem('clothes','joao'),false);
  assert.equal(canUsePackingItem('farofa','joao'),true);
  assert.equal(canUsePackingItem('farofa','crist'),false);
  assert.equal(canUsePackingItem('suitcase','joao'),true);
  assert.equal(canUsePackingItem('suitcase','crist'),false);
});

test('sorteio fictício tem seis dezenas válidas e únicas',()=>{
  assert.equal(LOTTERY_NUMBERS.length,6);
  assert.equal(new Set(LOTTERY_NUMBERS).size,6);
  assert.ok(LOTTERY_NUMBERS.every(n=>Number.isInteger(n)&&n>=1&&n<=60));
});
