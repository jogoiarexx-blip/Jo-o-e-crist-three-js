import test from 'node:test';
import assert from 'node:assert/strict';
import {BUS_START,BUS_END,BUS_ROOM,BUS_SPAWN,BUS_QUESTS,BUS_TARGETS,BUS_NPCS,BUS_CHOICES,BUS_SCENES,RHYTHM_SEQUENCE,checkBusAnswer,normalizeRhythmProgress,inputRhythm,findBusNpc,isInsideBus,makeBusRoomColliders} from '../src/bus-state.js';
import {QUESTS,getQuest,validateSave,SAVE_VERSION,FINAL_STEP} from '../src/story.js';
import {isBlocked,canReachInteraction} from '../src/collision.js';

test('capítulo 2 soma sete etapas, sem remover Fazenda, Rodoviária ou bicicleta',()=>{
  assert.equal(BUS_START,12);assert.equal(BUS_END,18);
  assert.equal(SAVE_VERSION,6);assert.equal(FINAL_STEP,35);assert.equal(QUESTS.length,36);
  assert.deepEqual(QUESTS.slice(0,12).map(q=>q.id),[
    'wake','radio','ticket','crist','suitcase','pantera','gate','cityWelcome','crossing','cityBag','cityClerk','bus'
  ]);
  assert.deepEqual(BUS_QUESTS.map(q=>q.id),['busSeat','busCrew','busCase','busInspect','busConnect','busDance','busReveal']);
  assert.equal(getQuest(19).id,'airWelcome');
});
test('salão do ônibus é fechado, corredor livre e alvos alcançáveis',()=>{
  const solids=makeBusRoomColliders();
  assert.ok(solids.length>=14);
  assert.ok(isInsideBus(BUS_SPAWN.x,BUS_SPAWN.z));
  assert.equal(isBlocked(BUS_SPAWN.x,BUS_SPAWN.z,.38,0,solids),false);
  for(const [x,z] of [[BUS_ROOM.xMin,BUS_ROOM.cz],[BUS_ROOM.xMax,BUS_ROOM.cz],[BUS_ROOM.cx,BUS_ROOM.zMin],[BUS_ROOM.cx,BUS_ROOM.zMax]]){
    assert.equal(isBlocked(x,z,.38,0,solids),true);
  }
  for(let x=101.1;x<116;x+=.65)
    assert.equal(isBlocked(x,BUS_ROOM.cz,.38,0,solids),false,'corredor x='+x.toFixed(1));
  assert.equal(Object.keys(BUS_TARGETS).length,7);
  for(const [id,p] of Object.entries(BUS_TARGETS)){
    assert.ok(isInsideBus(p.x,p.z),id);
    assert.equal(isBlocked(p.x,p.z,.38,0,solids),false,id);
    assert.ok(canReachInteraction(p,{x:p.x,z:p.z},p.radius),id);
  }
});
test('três escolhas de bagagem, investigação e conexão funcionam sem punição',()=>{
  for(const [kind,p] of Object.entries(BUS_CHOICES)){
    assert.equal(p.options.length,3,kind);
    assert.equal(new Set(p.options.map(o=>o.id)).size,3,kind);
    assert.equal(p.options.filter(o=>checkBusAnswer(kind,o.id)).length,1,kind);
  }
  assert.ok(checkBusAnswer('case','star'));
  assert.ok(checkBusAnswer('inspect','blue'));
  assert.ok(checkBusAnswer('connect','mic'));
  assert.equal(checkBusAnswer('connect','speaker'),false);
  assert.equal(checkBusAnswer('unknown','blue'),false);
});
test('minijogo de quatro passos recuperável e avanço parcial normalizado',()=>{
  assert.deepEqual(RHYTHM_SEQUENCE,['clap','step','turn','clap']);
  assert.equal(normalizeRhythmProgress(2),2);
  assert.equal(normalizeRhythmProgress('2'),2);
  assert.equal(normalizeRhythmProgress(-1),0);
  assert.equal(normalizeRhythmProgress(4),0);
  let progress=0;
  assert.deepEqual(inputRhythm(0,'step'),{correct:false,progress:0,complete:false});
  for(const [i,next] of RHYTHM_SEQUENCE.entries()){
    const state=inputRhythm(progress,next);
    assert.equal(state.correct,true);assert.equal(state.progress,i+1);
    assert.equal(state.complete,i===3);progress=state.progress;
  }
});
test('três artistas com diálogos e missões completas',()=>{
  assert.equal(BUS_NPCS.length,3);
  for(const npc of BUS_NPCS){
    assert.ok(npc.lines.length>=3,npc.id);
    assert.equal(findBusNpc({x:npc.x,z:npc.z}).id,npc.id);
  }
  assert.equal(findBusNpc({x:500,z:500}),null);
  assert.equal(findBusNpc(null),null);
  for(const key of ['seat','crew','caseWrong','case','inspectWrong','inspect','connectWrong','connect','dance','reveal'])
    assert.ok(BUS_SCENES[key]?.length>=2,key);
});
test('migração v1/v2/v3 mantém progresso e abre novo capítulo v4',()=>{
  assert.equal(validateSave({version:1,step:8}).step,12);
  assert.equal(validateSave({version:2,step:9}).step,12);
  assert.equal(validateSave({version:3,step:11}).step,11);
  assert.equal(validateSave({version:3,step:12}).step,12);
  assert.equal(validateSave({version:4,step:15}).step,15);
  assert.equal(validateSave({version:4,step:18,hero:'crist'}).hero,'crist');
});
