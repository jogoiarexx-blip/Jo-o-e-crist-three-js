import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ROAD_START,ROAD_END,ROAD_CENTER,ROAD_QUESTS,ROAD_TARGETS,ROAD_NPCS,
  ROAD_CHOICES,ROAD_SCENES,ROAD_DRIVES,
  initialRoadRun,normalizeRoadRun,advanceRoadRun,roadGrade,checkRoadAnswer,findRoadNpc
} from '../src/road-state.js';
import {QUESTS,SAVE_VERSION,FINAL_STEP,validateSave,getQuest} from '../src/story.js';
import {isBlocked} from '../src/collision.js';

test('Route 66 adiciona oito etapas sem apagar nenhum capítulo anterior',()=>{
  assert.equal(ROAD_START,27);assert.equal(ROAD_END,34);
  assert.equal(SAVE_VERSION,6);assert.equal(FINAL_STEP,35);
  assert.equal(QUESTS.length,36);
  assert.deepEqual(QUESTS.slice(0,7).map(x=>x.id),
    ['wake','radio','ticket','crist','suitcase','pantera','gate']);
  assert.deepEqual(QUESTS.slice(7,12).map(x=>x.id),
    ['cityWelcome','crossing','cityBag','cityClerk','bus']);
  assert.deepEqual(QUESTS.slice(12,19).map(x=>x.id),
    ['busSeat','busCrew','busCase','busInspect','busConnect','busDance','busReveal']);
  assert.deepEqual(QUESTS.slice(19,27).map(x=>x.id),
    ['airWelcome','airCheckin','airPassport','airFarofa','airSecurity','airGate','airRush','airBoard']);
  assert.deepEqual(ROAD_QUESTS.map(x=>x.id),
    ['roadWelcome','roadRoute','roadDrive1','roadStop','roadPhoto','roadRepair','roadDrive2','roadBreakdown']);
  assert.equal(getQuest(35).id,'done');
});
test('mapa da estrada mantém alvos dentro dos limites da engine e todos com diálogos',()=>{
  assert.ok(ROAD_CENTER.x>-48&&ROAD_CENTER.z<46);
  for(const [id,p] of Object.entries(ROAD_TARGETS)){
    assert.ok(p.radius>=3&&p.radius<=4);
    assert.equal(isBlocked(p.x,p.z,.38,0,[]),false,id);
  }
  for(const key of ['welcome','route','drive1','drive2','stop','photo','repair','breakdown','wrong']){
    assert.ok(ROAD_SCENES[key]?.length>=3,key);
  }
});
test('Crist decide rota e João revisa radiador com motor frio',()=>{
  assert.ok(checkRoadAnswer('route','66'));
  assert.ok(checkRoadAnswer('repair','cool'));
  assert.equal(checkRoadAnswer('route','closed'),false);
  assert.equal(checkRoadAnswer('repair','hot'),false);
  assert.equal(checkRoadAnswer('unknown','66'),false);
  for(const [id,q] of Object.entries(ROAD_CHOICES)){
    assert.equal(q.options.length,3,id);
    assert.equal(q.options.filter(o=>checkRoadAnswer(id,o.id)).length,1,id);
    assert.ok(q.text.length>35);
  }
});
test('Mabel, Rudy e Nora são personagens opcionais e distintos',()=>{
  assert.equal(ROAD_NPCS.length,3);
  assert.equal(new Set(ROAD_NPCS.map(n=>n.id)).size,3);
  for(const n of ROAD_NPCS){
    assert.ok(n.lines.length>=3);
    assert.equal(findRoadNpc({x:n.x,z:n.z})?.id,n.id);
  }
  assert.equal(findRoadNpc(null),null);
  assert.equal(findRoadNpc({x:NaN,z:1}),null);
  assert.equal(findRoadNpc({x:0,z:0}),null);
});
test('direção usa dt, desvia e identifica obstáculos corretamente',()=>{
  for(const stage of [29,33]){
    const def=ROAD_DRIVES[stage];
    assert.ok(def.hazards.length>=7);
    const fresh=initialRoadRun(stage);
    assert.equal(fresh.progress,0);
    assert.equal(fresh.hits,0);
    assert.equal(fresh.passed,0);
    const turn=advanceRoadRun(fresh,1,1/60);
    assert.ok(turn.state.offset>0);
    assert.ok(turn.state.progress>0);
    assert.equal(turn.completed,false);
    assert.equal(advanceRoadRun(fresh,0,0).state.progress,0);
    assert.equal(advanceRoadRun(fresh,0,-1).state.progress,0);
    assert.equal(advanceRoadRun(fresh,0,NaN).state.progress,0);
    // Após chegar ao primeiro obstáculo na mesma faixa, deve contar um choque.
    const h=def.hazards[0];
    const direct=advanceRoadRun({...fresh,progress:h.at-.08},0,.04);
    assert.equal(direct.state.passed,1);
    assert.equal(direct.state.hits,h.lane===0?1:0);
    // Direção lateral impede colisão com objeto na faixa central.
    const safe=advanceRoadRun({...fresh,progress:h.at-.08,offset:(h.lane===-1?2.7:-2.7)},0,.04);
    assert.equal(safe.state.hits,0);
    assert.equal(safe.state.passed,1);
    // Estado salvo é normalizado e impede injeção de propriedades externas.
    const restored=normalizeRoadRun({...fresh,progress:40,offset:999,hits:2,passed:1},stage);
    assert.equal(restored.offset,2.75);
    assert.equal(restored.progress,40);
    assert.deepEqual(normalizeRoadRun({stage:111,progress:9},stage),fresh);
    const end=advanceRoadRun({...fresh,progress:def.length-.05,passed:def.hazards.length},0,.05);
    assert.equal(end.completed,true);
    assert.equal(end.state.progress,def.length);
  }
});
test('avaliação é lúdica, sem game over e independente de quantas batidas',()=>{
  assert.equal(roadGrade(0),'PERFEITO');
  assert.equal(roadGrade(1),'BOM PASSEIO');
  assert.equal(roadGrade(2),'BOM PASSEIO');
  assert.equal(roadGrade(5),'CHEGARAM INTEIROS');
});
test('saves antigos migram e conclusão do aeroporto inicia a estrada',()=>{
  for(const [version,step,expected] of [[1,8,12],[2,9,12],[3,12,12],[4,19,19],[5,26,26],[5,27,27],[6,27,27],[6,29,29],[6,33,33],[6,35,35]]){
    assert.equal(validateSave({version,step}).step,expected,'save '+version+'/'+step);
  }
  assert.equal(validateSave({version:6,step:100}).step,35);
});
