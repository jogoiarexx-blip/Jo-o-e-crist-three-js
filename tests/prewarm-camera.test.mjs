import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {nextChapterToPrewarm,PREWARM_MILESTONES} from '../src/chapter-prewarm.js';
import {cameraClearanceDistance} from '../src/camera-occlusion.js';

test('aquecer o proximo hub somente perto da transicao, nao na Fazenda inicial',()=>{
 const expected=new Map([[9,'bus'],[10,'bus'],[11,'bus'],
   [16,'airport'],[17,'airport'],[18,'airport'],
   [24,'road'],[25,'road'],[26,'road'],
   [31,'desert'],[32,'desert'],[33,'desert'],[34,'desert']]);
 for(let step=0;step<=46;step++)assert.equal(nextChapterToPrewarm(step),expected.get(step)||null,'step '+step);
 assert.equal(nextChapterToPrewarm(8.7),null);
 assert.equal(nextChapterToPrewarm(NaN),null);
 assert.equal(new Set(PREWARM_MILESTONES.map(m=>m.chapter)).size,4);
});

test('camera pode manter distancia externa com trajeto livre',()=>{
 const f={x:0,y:1.35,z:0};
 assert.equal(cameraClearanceDistance(f,0,8,4,()=>false),8);
 assert.equal(cameraClearanceDistance(f,Math.PI/2,3,2,()=>false),3);
});

test('camera para antes da parede em vez de impor minDistance e atravessa-la',()=>{
 const focus={x:0,y:1.35,z:0};
 const wall=(x,z,r)=>z-r<=-1.8;
 const d=cameraClearanceDistance(focus,0,8,2,wall);
 assert.ok(d>0.22&&d<1.65,'camera deve ficar entre heroi e parede: '+d);
 assert.equal(wall(0,-d,.17),false,'camera fora da parede');
});

test('oclusao e dependente da direcao da camera e respeita o raio',()=>{
 const focus={x:0,y:1.35,z:0};
 const wall=(x,z,r)=>x-r< -2.1;
 const dLeft=cameraClearanceDistance(focus,Math.PI/2,7,2,wall);
 const dFront=cameraClearanceDistance(focus,0,7,2,wall);
 assert.ok(dLeft<3&&dLeft>.22);
 assert.equal(dFront,7);
});

test('entrada invalida nao causa NaN nem looping',()=>{
 assert.equal(cameraClearanceDistance(null,0,8,1,()=>false),.3);
 assert.equal(cameraClearanceDistance({x:0,y:0,z:0},NaN,8,1,()=>false),.3);
 assert.equal(cameraClearanceDistance({x:0,y:0,z:0},0,8,1,null),.3);
 assert.equal(cameraClearanceDistance({x:0,y:0,z:0},0,8,1,()=>false,{steps:0}),8);
});

test('integracao agenda construcao fora da transicao e preserva cache',()=>{
 const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
 const world=readFileSync(new URL('../src/world.js',import.meta.url),'utf8');
 assert.match(main,/requestIdleCallback\(build,\{timeout:3500\}\)/);
 assert.match(main,/scheduleChapterPrewarm\(\)/);
 assert.match(main,/cameraClearanceDistance\(focus,yaw,profile\.distance,profile\.lift,blocked\)/);
 assert.match(world,/prepareChapter\(id\)\{return chapterCache\.get\(id\);\}/);
 assert.match(world,/chapterCache\.get\(active\)/);
});
