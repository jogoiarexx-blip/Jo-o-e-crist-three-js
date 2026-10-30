import test from 'node:test';
import assert from 'node:assert/strict';
import {AIRPORT_START,AIRPORT_END,AIRPORT_ROOM,AIRPORT_SPAWN,AIRPORT_TARGETS,AIRPORT_QUESTS,AIRPORT_NPCS,AIRPORT_CHOICES,AIRPORT_SCENES,airportColliders,checkAirportAnswer,findAirportNpc,airportRushResult} from '../src/airport-state.js';
import {QUESTS,SAVE_VERSION,FINAL_STEP,getQuest,validateSave} from '../src/story.js';
import {isBlocked} from '../src/collision.js';

test('capítulos anteriores preservados, aeroporto adiciona 8 missões',()=>{
  assert.equal(AIRPORT_START,19);assert.equal(AIRPORT_END,26);
  assert.equal(SAVE_VERSION,5);assert.equal(FINAL_STEP,27);
  assert.deepEqual(QUESTS.slice(0,12).map(x=>x.id),['wake','radio','ticket','crist','suitcase','pantera','gate','cityWelcome','crossing','cityBag','cityClerk','bus']);
  assert.deepEqual(QUESTS.slice(12,19).map(x=>x.id),['busSeat','busCrew','busCase','busInspect','busConnect','busDance','busReveal']);
  assert.deepEqual(AIRPORT_QUESTS.map(x=>x.id),['airWelcome','airCheckin','airPassport','airFarofa','airSecurity','airGate','airRush','airBoard']);
  assert.equal(getQuest(27).id,'done');
});
test('corredor do aeroporto livre e objetivos fisicamente alcançáveis',()=>{
  const c=airportColliders();
  assert.equal(c.length,9);
  assert.equal(isBlocked(AIRPORT_SPAWN.x,AIRPORT_SPAWN.z,.38,0,c),false);
  for(const x of [AIRPORT_ROOM.xMin,AIRPORT_ROOM.xMax])assert.ok(isBlocked(x,AIRPORT_ROOM.cz,.38,0,c));
  for(const z of [AIRPORT_ROOM.zMin,AIRPORT_ROOM.zMax])assert.ok(isBlocked(AIRPORT_ROOM.cx,z,.38,0,c));
  for(let x=39;x<94;x+=.5)assert.equal(isBlocked(x,AIRPORT_ROOM.cz,.38,0,c),false,'corredor '+x);
  assert.equal(Object.keys(AIRPORT_TARGETS).length,8);
  for(const [id,p] of Object.entries(AIRPORT_TARGETS))assert.equal(isBlocked(p.x,p.z,.38,0,c),false,id);
});
test('cinco puzzles com uma opção correta e falha recuperável',()=>{
  assert.equal(Object.keys(AIRPORT_CHOICES).length,5);
  for(const [key,p] of Object.entries(AIRPORT_CHOICES)){
    assert.equal(p.options.length,3,key);
    assert.equal(p.options.filter(o=>checkAirportAnswer(key,o.id)).length,1,key);
  }
  for(const [kind,id] of [['checkin','bs408'],['passport','blue'],['farofa','inspect'],['security','keys'],['gate','c7']])
    assert.equal(checkAirportAnswer(kind,id),true);
  assert.equal(checkAirportAnswer('gate','b2'),false);
  assert.equal(checkAirportAnswer('fake','blue'),false);
});
test('correria sem game over, cenas e NPCs opcionais completos',()=>{
  assert.equal(airportRushResult(true),'rushOK');
  assert.equal(airportRushResult(false),'rushOops');
  for(const key of ['welcome','checkin','passport','farofa','security','gate','rushOK','rushOops','board','wrong']){
    assert.ok(AIRPORT_SCENES[key].length>=3,key);
    assert.ok(AIRPORT_SCENES[key].every(l=>l.length===2&&l[0]&&l[1]),key);
  }
  assert.equal(AIRPORT_NPCS.length,3);
  for(const n of AIRPORT_NPCS)assert.equal(findAirportNpc({x:n.x,z:n.z}).id,n.id);
  assert.equal(findAirportNpc(null),null);
});
test('saves v1 a v5 compatíveis com retomada da excursão e aeroporto',()=>{
  for(const [version,step,expected] of [[1,8,12],[2,9,12],[3,12,12],[4,18,18],[4,19,19],[5,23,23],[5,27,27]]){
    assert.equal(validateSave({version,step}).step,expected);
  }
  assert.equal(validateSave({version:88,step:20}).step,0);
});
