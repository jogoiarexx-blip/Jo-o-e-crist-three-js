import test from 'node:test';
import assert from 'node:assert/strict';
import {CITY_TARGETS,CITY_NPCS,CITY_CHOICES,checkCityAnswer,findCityNpc} from '../src/city-state.js';
import {QUESTS,getQuest,validateSave,FINAL_STEP} from '../src/story.js';
import {isBlocked,canReachInteraction} from '../src/collision.js';

test('Capítulo 1 preserva o ciclista e ônibus, adicionando praça, bagagem e guichê',()=>{
  assert.deepEqual(QUESTS.slice(7,12).map(q=>q.id),[
    'cityWelcome','crossing','cityBag','cityClerk','bus'
  ]);
  assert.equal(FINAL_STEP,19);
  for(let s=7;s<=11;s++)assert.ok(getQuest(s).hint);
});
test('três NPCs distintos com diálogos opcionais acessíveis',()=>{
  assert.equal(CITY_NPCS.length,3);
  assert.equal(new Set(CITY_NPCS.map(x=>x.id)).size,3);
  for(const npc of CITY_NPCS){
    assert.ok(npc.lines.length>=3);
    assert.equal(findCityNpc({x:npc.x,z:npc.z}).id,npc.id);
    assert.equal(findCityNpc({x:npc.x+100,z:npc.z}),null);
  }
  assert.equal(findCityNpc(null),null);
  assert.equal(findCityNpc({x:NaN,z:3}),null);
});
test('os dois desafios têm pistas, opções únicas, resposta válida e falha recuperável',()=>{
  for(const [id,data] of Object.entries(CITY_CHOICES)){
    assert.ok(data.heading&&data.text);
    assert.equal(data.options.length,3);
    assert.equal(new Set(data.options.map(x=>x.id)).size,3);
    assert.equal(checkCityAnswer(id,data.answer),true);
    assert.equal(data.options.filter(x=>checkCityAnswer(id,x.id)).length,1);
    assert.ok(data.options.some(x=>!checkCityAnswer(id,x.id)));
  }
  assert.equal(checkCityAnswer('not-a-puzzle','042'),false);
  assert.equal(checkCityAnswer('bag','fake'),false);
  assert.equal(checkCityAnswer('route','042'),false);
  assert.equal(checkCityAnswer('bag','024'),false);
  assert.equal(checkCityAnswer('route','1'),false);
});
test('objetivos e NPCs ficam dentro dos limites da cena, alcançáveis sem encostar em barreiras',()=>{
  for(const [id,p] of Object.entries(CITY_TARGETS)){
    assert.ok(p.radius>=2.6&&p.radius<=6,id);
    assert.ok(p.x>48&&p.x<115&&p.z>-5&&p.z<23,id);
    assert.equal(isBlocked(p.x,p.z,.38,0,[]),false,id);
  }
  const blockers=[
    {x1:53.08,x2:56.92,z1:19.54,z2:20.03,height:2.95},
    {x1:80.75,x2:85.25,z1:-1.2,z2:.9,height:1.85},
    {x1:72.68,x2:76.32,z1:-3.03,z2:-1.67,height:1.75},
    {x1:62.63,x2:65.18,z1:-1.55,z2:.12,height:1.15}
  ];
  const approaches={
    cityWelcome:{x:55,z:21.2},
    crossing:{x:68,z:11},
    cityBag:{x:83,z:1.6},
    cityClerk:{x:74.5,z:.7},
    bus:{x:93,z:3}
  };
  for(const [id,p] of Object.entries(CITY_TARGETS)){
    const at=approaches[id];
    assert.equal(isBlocked(at.x,at.z,.38,0,blockers),false,id+' collider');
    assert.equal(canReachInteraction(p,at,p.radius),true,id+' range');
  }
});
test('saves intermediários não repetem o quase atropelamento já realizado',()=>{
  assert.equal(validateSave({version:2,step:8}).step,9);
  assert.equal(validateSave({version:3,step:8}).step,8);
  assert.equal(validateSave({version:3,step:9,hero:'crist'}).hero,'crist');
  assert.equal(validateSave({version:3,step:11}).step,11);
});
