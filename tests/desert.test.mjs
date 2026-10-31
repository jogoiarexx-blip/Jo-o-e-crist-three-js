import test from 'node:test';
import assert from 'node:assert/strict';
import {
 DESERT_START,DESERT_LAST,DESERT_ROOM,DESERT_SPAWN,DESERT_SHADE,
 DESERT_QUESTS,DESERT_TARGETS,DESERT_CHOICES,DESERT_NPCS,DESERT_SCENES,
 checkDesertAnswer,findDesertNpc,isDesertShade,advanceDesertHeat,desertHeatLabel,
 desertColliders,desertCarryActive
} from '../src/desert-state.js';
import {QUESTS,FINAL_STEP,SAVE_VERSION,getQuest,validateSave} from '../src/story.js';
import {isBlocked,canReachInteraction} from '../src/collision.js';

test('capítulo 5 preserva os cinco capítulos e acrescenta 11 objetivos',()=>{
 assert.equal(DESERT_START,35);assert.equal(DESERT_LAST,45);
 assert.equal(FINAL_STEP,46);assert.equal(SAVE_VERSION,7);
 assert.equal(QUESTS.length,47);
 assert.deepEqual(QUESTS.slice(0,7).map(q=>q.id),['wake','radio','ticket','crist','suitcase','pantera','gate']);
 assert.deepEqual(QUESTS.slice(7,12).map(q=>q.id),['cityWelcome','crossing','cityBag','cityClerk','bus']);
 assert.deepEqual(QUESTS.slice(12,19).map(q=>q.id),['busSeat','busCrew','busCase','busInspect','busConnect','busDance','busReveal']);
 assert.deepEqual(QUESTS.slice(19,27).map(q=>q.id),['airWelcome','airCheckin','airPassport','airFarofa','airSecurity','airGate','airRush','airBoard']);
 assert.deepEqual(QUESTS.slice(27,35).map(q=>q.id),['roadWelcome','roadRoute','roadDrive1','roadStop','roadPhoto','roadRepair','roadDrive2','roadBreakdown']);
 assert.deepEqual(DESERT_QUESTS.map(q=>q.id),['desertVan','desertShade','desertCan','desertWaterSign','desertPump','desertCarry','desertMechanic','desertHose','desertCool','desertSigns','desertLookout']);
 assert.equal(getQuest(46).id,'done');
});
test('sólidos do posto não impedem 11 interações nem caminho do galão',()=>{
 const c=desertColliders();
 assert.equal(c.length,5);
 assert.ok(DESERT_SPAWN.x>DESERT_ROOM.xMin&&DESERT_SPAWN.x<DESERT_ROOM.xMax);
 assert.equal(isBlocked(DESERT_SPAWN.x,DESERT_SPAWN.z,.38,0,c),false,'spawn');
 const points={
   desertVan:{x:-60.35,z:-13},desertShade:{x:-70,z:-20},
   desertCan:{x:-72,z:-19.2},desertWaterSign:{x:-76.3,z:-5.5},
   desertPump:{x:-68.3,z:-4},desertCarry:{x:-60.35,z:-13},
   desertMechanic:{x:-52,z:-15},desertHose:{x:-60.35,z:-13},
   desertCool:{x:-60.35,z:-13},desertSigns:{x:-54,z:-3},
   desertLookout:{x:-52,z:8}
 };
 for(const [id,p] of Object.entries(DESERT_TARGETS)){
   const a=points[id];
   assert.ok(p.radius>=3&&p.radius<=3.5,id);
   assert.equal(isBlocked(a.x,a.z,.38,0,c),false,id+' collider');
   assert.equal(canReachInteraction(p,a,p.radius),true,id+' alcance');
 }
 // O veículo é sólido: primeiro rodeie a frente da van e depois chegue pela lateral.
 const path=[[-68.3,-4],[-59.7,-6.0],[-60.35,-13]];
 for(let p=0;p<path.length-1;p++){
   for(let i=0;i<=20;i++){
     const t=i/20,x=path[p][0]+(path[p+1][0]-path[p][0])*t;
     const z=path[p][1]+(path[p+1][1]-path[p][1])*t;
     assert.equal(isBlocked(x,z,.38,0,c),false,'trajeto do galão '+p+'/'+i);
   }
 }
});
test('calor diminui sob a cobertura, limitado e sem game over',()=>{
 assert.ok(isDesertShade(DESERT_SHADE.x,DESERT_SHADE.z));
 assert.equal(isDesertShade(0,0),false);
 let heat=0;
 for(let i=0;i<1200;i++)heat=advanceDesertHeat(heat,false,1/60);
 assert.ok(heat>20&&heat<26);
 const before=heat;
 for(let i=0;i<1200;i++)heat=advanceDesertHeat(heat,true,1/60);
 assert.ok(heat<before&&heat>=0);
 assert.equal(advanceDesertHeat(85,false,.05),85);
 assert.equal(advanceDesertHeat(-20,true,1),0);
 assert.equal(desertHeatLabel(5),'CONFORTÁVEL');
 assert.equal(desertHeatLabel(40),'QUENTE');
 assert.ok(desertHeatLabel(80).includes('SOMBRA'));
});
test('quatro puzzles de observação sem penalidade irreversível',()=>{
 assert.equal(Object.keys(DESERT_CHOICES).length,4);
 for(const [key,q] of Object.entries(DESERT_CHOICES)){
   assert.equal(q.options.length,3,key);
   assert.equal(new Set(q.options.map(o=>o.id)).size,3,key);
   assert.equal(q.options.filter(o=>checkDesertAnswer(key,o.id)).length,1,key);
 }
 for(const [kind,id] of [['desertWater','blue'],['desertHose','hose'],['desertCool','cold'],['desertSigns','new']])
   assert.equal(checkDesertAnswer(kind,id),true);
 assert.equal(checkDesertAnswer('desertCool','hot'),false);
 assert.equal(checkDesertAnswer('desertSigns','old'),false);
 assert.equal(checkDesertAnswer('unknown','blue'),false);
});
test('galão aparece como carga somente ao atravessar o deserto',()=>{
 assert.equal(desertCarryActive(39),false);
 assert.equal(desertCarryActive(40),true);
 assert.equal(desertCarryActive(41),false);
});
test('três NPCs e diálogos válidos',()=>{
 assert.equal(DESERT_NPCS.length,3);
 for(const npc of DESERT_NPCS){
   assert.ok(npc.lines.length>=3,npc.id);
   assert.equal(findDesertNpc({x:npc.x,z:npc.z})?.id,npc.id);
 }
 assert.equal(findDesertNpc(null),null);
 for(const key of ['arrival','shade','can','water','fill','carry','mechanic','hose','cool','signs','lookout','wrong'])
   assert.ok(DESERT_SCENES[key]?.length>=3,key);
});
test('saves antigos migram sem refazer a Route 66',()=>{
 for(const [version,step,want] of [[1,8,12],[2,9,12],[3,12,12],[4,19,19],[5,27,27],[6,34,34],[6,35,35],[7,40,40],[7,45,45],[7,46,46],[7,999,46]])
   assert.equal(validateSave({version,step}).step,want,'save version '+version+' step '+step);
});
