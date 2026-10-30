import test from 'node:test';
import assert from 'node:assert/strict';
import {FARM_MEMORIES,normalizeMemories,nearbyMemory,MEMORY_COUNT} from '../src/farm-memories.js';
import {cameraRig} from '../src/camera-logic.js';
import {FARM_HOUSE,isInsideHouse} from '../src/farm-layout.js';

test('lembranças são opcionais e exigem proximidade real',()=>{
  assert.equal(MEMORY_COUNT,3);
  const ids=FARM_MEMORIES.map(x=>x.id);
  assert.equal(new Set(ids).size,ids.length);
  assert.deepEqual(ids,['portrait','well','hens']);
  assert.equal(nearbyMemory({x:-13.45,z:-15.8}).id,'portrait');
  assert.equal(nearbyMemory({x:8,z:-12}).id,'well');
  assert.equal(nearbyMemory({x:7,z:-17}).id,'hens');
  assert.equal(nearbyMemory({x:100,z:100}),null);
  assert.equal(nearbyMemory({x:NaN,z:3}),null);
  assert.equal(nearbyMemory(null),null);
});
test('memórias já vistas não reaparecem; valores inválidos são ignorados',()=>{
  assert.deepEqual(normalizeMemories(['well','well','fake',null,'hens']),['well','hens']);
  assert.deepEqual(normalizeMemories('well'),[]);
  assert.equal(nearbyMemory({x:8,z:-12},['well']),null);
  assert.equal(nearbyMemory({x:7,z:-17},['hens']),null);
  assert.equal(nearbyMemory({x:-13.45,z:-15.8},['well']).id,'portrait');
});
test('fotografia dentro da casa e poço/galinhas na área rural',()=>{
  assert.equal(isInsideHouse(-13.45,-15.8),true);
  assert.equal(isInsideHouse(8,-12),false);
  assert.equal(isInsideHouse(7,-17),false);
});
test('câmera dentro da casa é mais curta, porém preserva a perspectiva externa',()=>{
  const inside=cameraRig(true,8.2,.48),outside=cameraRig(false,8.2,.48);
  assert.ok(inside.distance<outside.distance);
  assert.ok(inside.lift<outside.lift);
  assert.ok(inside.distance<=5.45);
  assert.ok(inside.minDistance<outside.minDistance);
  assert.equal(outside.distance,8.2);
  assert.equal(cameraRig(true,2,.4).distance,3);
  for(const params of [[true,NaN,NaN],[false,Infinity,-10]]){
    const result=cameraRig(...params);
    assert.ok(Number.isFinite(result.distance));
    assert.ok(Number.isFinite(result.lift));
  }
});
