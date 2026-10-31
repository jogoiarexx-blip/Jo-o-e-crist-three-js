import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHAPTER_TRANSITIONS,findChapterTransition,chapterEntryPosition} from '../src/chapter-transitions.js';
import {FARM_GATE,FARM_OBJECTS,makeFarmFenceColliders} from '../src/farm-layout.js';
import {CITY_TARGETS} from '../src/city-state.js';
import {canReachInteraction,isBlocked} from '../src/collision.js';
import {canSnapDistantCompanion,companionFollowSpeed,gateFollowerWaypoint} from '../src/outdoor-continuity.js';
import {getQuest} from '../src/story.js';

test('porteira e rodoviaria seguem no mesmo mapa sem teleportar no avanço 6 para 7',()=>{
  const t=findChapterTransition(6,7);
  assert.equal(t,CHAPTER_TRANSITIONS[0]);
  assert.equal(t.continuous,true);
  assert.ok(t.spawn.x>FARM_GATE.x&&t.spawn.x<CITY_TARGETS.cityWelcome.x-25);
  assert.ok(t.lines.every(line=>!line[1].includes('ônibus do sítio')));
  assert.ok(getQuest(7).hint.includes('mesmo mapa'));
  for(const hero of ['joao','crist']){
    const entry=chapterEntryPosition(t,hero);
    assert.ok(entry.joao.x>FARM_GATE.x);
    assert.ok(entry.crist.x>FARM_GATE.x);
  }
  const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
  assert.match(main,/if\(!transition\.continuous\)\{/);
  assert.match(main,/if\(!transition\.continuous\)snapCamera\(\)/);
  assert.match(main,/canSnapDistantCompanion\(dist,meInside===companionInside,continuousOutdoor\)/);
  assert.doesNotMatch(main,/actors\[heroId\]\.position\.set\(49,0,21\)/);
});

test('porteira libera um caminho continuo para a cidade, sem colisao no percurso',()=>{
  const closed=makeFarmFenceColliders();
  const open=closed.filter(c=>c.tag!=='gate-leaf');
  const mid=FARM_GATE.hingeZ+FARM_GATE.span/2;
  assert.equal(isBlocked(FARM_GATE.x,mid,.38,0,closed),true);
  assert.equal(isBlocked(FARM_GATE.x,mid,.38,0,open),false);
  const path=[
    {x:FARM_OBJECTS.gate.x,z:FARM_OBJECTS.gate.z},
    {x:FARM_GATE.x+2.4,z:mid},
    {x:47.5,z:5},
    {x:51,z:5},
    {x:51,z:21.2},
    {x:52.4,z:21.2}
  ];
  for(let i=0;i<path.length-1;i++){
    const a=path[i],b=path[i+1];
    const n=Math.ceil(Math.hypot(a.x-b.x,a.z-b.z)/.25);
    for(let k=0;k<=n;k++){
      const u=k/n,x=a.x+(b.x-a.x)*u,z=a.z+(b.z-a.z)*u;
      assert.equal(isBlocked(x,z,.38,0,open),false,'passagem livre '+i+': '+x+','+z);
    }
  }
  assert.equal(canReachInteraction(CITY_TARGETS.cityWelcome,path.at(-1),CITY_TARGETS.cityWelcome.radius),true);
});

test('companheiro atravessa porteira pela abertura em ambos os sentidos',()=>{
  const mid=FARM_GATE.hingeZ+FARM_GATE.span/2;
  const right={x:40,z:19},left={x:8,z:0};
  assert.deepEqual(gateFollowerWaypoint(right,left),{x:FARM_GATE.x-1,z:mid});
  assert.deepEqual(gateFollowerWaypoint(right,{x:12,z:mid}),{x:FARM_GATE.x+1.95,z:mid});
  assert.deepEqual(gateFollowerWaypoint(right,{x:FARM_GATE.x-1.4,z:mid}),{x:FARM_GATE.x+1.95,z:mid},'não parar a 50 cm da porteira');
  assert.deepEqual(gateFollowerWaypoint(left,right),{x:FARM_GATE.x+1,z:mid});
  assert.deepEqual(gateFollowerWaypoint(left,{x:13.3,z:mid}),{x:FARM_GATE.x-1.95,z:mid});
  assert.equal(gateFollowerWaypoint({x:9,z:5},{x:10,z:5}),null);
  assert.equal(gateFollowerWaypoint(null,left),null);
});

test('no mapa exterior, distancia grande aumenta passo do companheiro sem teleporte',()=>{
  for(const distance of [0,17,40]){
    assert.equal(canSnapDistantCompanion(distance,true,true),false);
    assert.ok(companionFollowSpeed(distance,true)<=7);
  }
  assert.equal(canSnapDistantCompanion(18,true,false),true);
  assert.equal(canSnapDistantCompanion(18,false,false),false);
  assert.equal(companionFollowSpeed(20,true),7);
  assert.equal(companionFollowSpeed(2,true),4.6);
});

test('trilha para cidade fica no mundo externo sem colisores adicionados',()=>{
  const source=readFileSync(new URL('../src/world.js',import.meta.url),'utf8');
  assert.match(source,/Trilha cont[ií]nua da porteira at[eé] a pra[cç]a/);
  assert.match(source,/CAMINHO PARA A CIDADE/);
  const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
  assert.match(main,/if\(step>6\)world\.setGateOpen\?\.\(true\)/);
});
