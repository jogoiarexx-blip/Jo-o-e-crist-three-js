import test from 'node:test';
import assert from 'node:assert/strict';
import {QUESTS,SCENES,INTRO,getQuest,validateSave,PACKING_ITEMS,normalizePacking,nextPackingTarget,getPackingProgress} from '../src/story.js';

test('campanha tem 8 objetivos e final',()=>{
  assert.equal(QUESTS.length,9);
  assert.deepEqual(QUESTS.map(q=>q.id),['ticket','radio','crist','suitcase','pantera','gate','crossing','bus','done']);
  assert.equal(getQuest(99).id,'done');
  assert.equal(getQuest(-1).id,'ticket');
});
test('diálogos principais estão presentes',()=>{
  assert.ok(INTRO.length>=4);
  for(const key of ['ticket','radio','crist','suitcase','pantera','gate','bikeOK','bikeHit','bus']){
    assert.ok(Array.isArray(SCENES[key]) && SCENES[key].length>=3,key);
    for(const line of SCENES[key])assert.ok(line.length===2&&line[0]&&line[1]);
  }
});
test('save padrão e migração segura',()=>{
  assert.deepEqual(validateSave(null),{version:1,step:0,hero:'joao',packing:[]});
  assert.equal(validateSave({version:1,step:2,hero:'crist'}).step,2);
  assert.equal(validateSave({version:1,step:200}).step,8);
  assert.equal(validateSave({version:1,step:-3}).step,0);
  assert.equal(validateSave({version:1,step:2,hero:'forged'}).hero,'joao');
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
