import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ROAD_DRIVES,ROAD_HANDLING,initialRoadRun,normalizeRoadRun,advanceRoadRun} from '../src/road-state.js';

test('cruzeiro automático continua sem acelerar; W acelera e S freia progressivamente',()=>{
 for(const stage of [29,33]){
  const base=ROAD_DRIVES[stage].speed;
  const start=initialRoadRun(stage);
  assert.equal(start.speed,base);
  assert.equal(advanceRoadRun(start,0,.016).state.speed,base);
  let gas=start,brake=start;
  for(let i=0;i<55;i++){
    gas=advanceRoadRun(gas,0,1/60,1).state;
    brake=advanceRoadRun(brake,0,1/60,-1).state;
  }
  assert.ok(gas.speed>base*1.26&&gas.speed<=base*ROAD_HANDLING.boostRatio);
  assert.ok(brake.speed<base*.4&&brake.speed>=base*.3);
  assert.ok(gas.progress>start.progress);
  assert.ok(brake.progress>start.progress,'freio não pode gerar softlock');
  const released=advanceRoadRun(brake,0,1/60,0).state;
  assert.ok(released.speed>brake.speed,'freio solto recupera cruzeiro');
  const slow=advanceRoadRun(gas,0,1/60,-1).state;
  assert.ok(slow.speed<gas.speed);
 }
});
test('direção responde gradualmente e volta a zero sem deslocar carro sozinho',()=>{
 let run=initialRoadRun(29);
 const first=advanceRoadRun(run,1,1/60).state;
 assert.ok(first.lateralVelocity>0&&first.lateralVelocity<ROAD_HANDLING.steerSpeed);
 assert.ok(first.offset>0&&first.offset<.1);
 let steered=first;
 for(let i=0;i<90;i++)steered=advanceRoadRun(steered,1,1/60).state;
 assert.equal(steered.offset,ROAD_HANDLING.lateralLimit);
 assert.equal(steered.lateralVelocity,0,'para junto à margem sem atravessar');
 let back=advanceRoadRun(steered,-1,1/60).state;
 assert.ok(back.offset<steered.offset);
 const newRun=advanceRoadRun(initialRoadRun(29),0,1/60).state;
 assert.equal(newRun.offset,0);
 assert.equal(newRun.lateralVelocity,0);
});
test('física consistente para 30 e 60 fps, dt pausado e entradas inválidas',()=>{
 const start=initialRoadRun(29);
 const simulate=dt=>{
   let state=start;
   for(let i=0;i<Math.round(1/dt);i++)state=advanceRoadRun(state,.45,dt,.4).state;
   return state;
 };
 const a=simulate(1/30),b=simulate(1/60);
 assert.ok(Math.abs(a.progress-b.progress)<.06,'progresso quase idêntico');
 assert.ok(Math.abs(a.offset-b.offset)<.12,'direção quase idêntica');
 assert.ok(Math.abs(a.speed-b.speed)<.02);
 const zero=advanceRoadRun(start,1,0,1).state;
 assert.deepEqual(zero,start,'nenhuma alteração com dt zero');
 const invalid=advanceRoadRun(start,NaN,NaN,NaN).state;
 assert.deepEqual(invalid,start);
});
test('saves antigos e estados corrompidos são normalizados sem alterar fase',()=>{
 for(const stage of [29,33]){
  const def=ROAD_DRIVES[stage];
  const legacy={stage,progress:83,offset:-1.25,hits:1,passed:1};
  const migrated=normalizeRoadRun(legacy,stage);
  assert.equal(migrated.speed,def.speed);
  assert.equal(migrated.lateralVelocity,0);
  assert.equal(migrated.progress,83);
  assert.equal(migrated.offset,-1.25);
  assert.equal(migrated.hits,1);
  const junk=normalizeRoadRun({...legacy,speed:Infinity,lateralVelocity:999},stage);
  assert.equal(junk.speed,def.speed);
  assert.equal(junk.lateralVelocity,ROAD_HANDLING.steerSpeed);
 }
});
test('colisão desacelera, contabiliza uma vez por obstáculo e não encerra a fase',()=>{
 for(const stage of [29,33]){
  const def=ROAD_DRIVES[stage],first=def.hazards[0];
  const at=initialRoadRun(stage);
  const run={...at,progress:first.at-.15,offset:first.lane*2.27};
  const result=advanceRoadRun(run,0,.04);
  assert.ok(result.hit);
  assert.equal(result.state.hits,1);
  assert.equal(result.state.passed,1);
  assert.ok(result.state.speed<def.speed);
  const repeated=advanceRoadRun(result.state,0,.04);
  assert.equal(repeated.state.hits,1,'obstáculo cruzado não conta de novo');
  assert.ok(repeated.state.speed>result.state.speed,'motor recupera a velocidade');
  const safe=advanceRoadRun({...run,offset:first.lane===1?-2.7:2.7},0,.04);
  assert.equal(safe.state.hits,0);
 }
});
test('HUD, input, câmera e cenário usam a mesma velocidade e inclinação',()=>{
 const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
 const roadWorld=readFileSync(new URL('../src/road-world.js',import.meta.url),'utf8');
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.match(main,/advanceRoadRun\(roadRun,input\.x,dt,input\.y\)/);
 assert.match(main,/roadRun\.speed\*3\.6/);
 assert.match(main,/roadRun\.speed\/ROAD_DRIVES\[roadRun\.stage\]\.speed/);
 assert.match(html,/id="roadSpeed"/);
 assert.match(roadWorld,/lateralVelocity/);
 assert.match(roadWorld,/for\(const prop of roadside\)/);
 assert.match(roadWorld,/group\.visible=active&&driving/);
});
