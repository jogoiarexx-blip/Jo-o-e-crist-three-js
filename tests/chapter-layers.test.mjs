import test from 'node:test';
import assert from 'node:assert/strict';
import {chapterAt,setColliderLayer,applyChapterLayers} from '../src/chapter-layers.js';
import {isBlocked,canReachInteraction} from '../src/collision.js';
import {makeFarmFenceColliders,makeHouseColliders,FARM_GATE} from '../src/farm-layout.js';
import {makeRoadColliders,ROAD_TARGETS,ROAD_SPAWN} from '../src/road-state.js';
import {BUS_TARGETS,BUS_SPAWN,makeBusRoomColliders} from '../src/bus-state.js';
import {AIRPORT_TARGETS,AIRPORT_SPAWN,airportColliders} from '../src/airport-state.js';
import {DESERT_TARGETS,DESERT_SPAWN,desertColliders} from '../src/desert-state.js';
import {CITY_TARGETS} from '../src/city-state.js';

function fakeModule(colliders,rectangles){
  let active=false;const module={visible:false,
    setActive(on){
      if(active===!!on)return;
      active=!!on;module.visible=active;
      setColliderLayer(colliders,rectangles,active);
    }
  };return module;
}
function setup(){
  const base=makeFarmFenceColliders().concat(makeHouseColliders());
  const active=[...base];
  const visible={visible:true};
  const worlds={
    bus:fakeModule(active,makeBusRoomColliders()),
    airport:fakeModule(active,airportColliders()),
    road:fakeModule(active,makeRoadColliders()),
    desert:fakeModule(active,desertColliders())
  };
  return {active,base,visible,worlds,apply(step){return applyChapterLayers(step,visible,active,base,worlds);}};
}
test('troca exclusiva de capítulos sem duplicar colliders ao atualizar HUD',()=>{
  const v=setup();
  const boundaries=[[0,'outdoor'],[6,'outdoor'],[7,'outdoor'],[11,'outdoor'],
    [12,'bus'],[18,'bus'],[19,'airport'],[26,'airport'],[27,'road'],[34,'road'],
    [35,'desert'],[45,'desert'],[46,'desert'],[0,'outdoor'],[27,'road'],[11,'outdoor']];
  for(const [step,expected] of boundaries){
    assert.equal(chapterAt(step),expected);
    assert.equal(v.apply(step),expected);
    assert.equal(v.visible.visible,expected==='outdoor');
    assert.equal(v.worlds.bus.visible,expected==='bus');
    assert.equal(v.worlds.airport.visible,expected==='airport');
    assert.equal(v.worlds.road.visible,expected==='road');
    assert.equal(v.worlds.desert.visible,expected==='desert');
    const length=v.active.length;
    for(let i=0;i<3;i++)v.apply(step);
    assert.equal(v.active.length,length,'setChapter repetido '+step);
    assert.equal(new Set(v.active).size,v.active.length,'sem colisão duplicada');
    for(const old of v.base)assert.equal(v.active.includes(old),expected==='outdoor','base presente apenas no mundo original');
  }
});
test('barreira antiga da Fazenda não atravessa a Route 66 e volta na Fazenda',()=>{
  const v=setup();
  assert.equal(isBlocked(-28,24,.38,0,v.active),true,'a cerca pertence à Fazenda');
  v.apply(27);
  assert.equal(isBlocked(-28,24,.38,0,v.active),false,'a antiga cerca não bloqueia a estrada');
  assert.equal(isBlocked(-18.5,19,.38,0,v.active),true,'a oficina nova ainda tem colisão');
  v.apply(12);
  assert.equal(isBlocked(-28,24,.38,0,v.active),false,'a cerca não entra no ônibus');
  v.apply(0);
  assert.equal(isBlocked(-28,24,.38,0,v.active),true,'cerca original preservada');
});
test('porteira aberta não reaparece ao voltar de outro capítulo',()=>{
  const v=setup();
  const leaf=v.base.find(x=>x.tag==='gate-leaf');
  assert.ok(leaf);
  // Simulate openGate removing the collider from both lists.
  v.base.splice(v.base.indexOf(leaf),1);
  setColliderLayer(v.active,[leaf],false);
  v.apply(19);v.apply(0);
  const middle=FARM_GATE.hingeZ+FARM_GATE.span/2;
  assert.equal(v.active.includes(leaf),false);
  assert.equal(isBlocked(FARM_GATE.x,middle,.32,0,v.active),false);
});
function reachable(start,target,rectangles,bounds,spacing=.5){
  // AStar/BFS grid. Goal is an interactive circle, NOT the center of a solid object.
  const [xMin,xMax,zMin,zMax]=bounds;
  const columns=Math.floor((xMax-xMin)/spacing)+1;
  const rows=Math.floor((zMax-zMin)/spacing)+1;
  const at=(xi,zi)=>({x:xMin+xi*spacing,z:zMin+zi*spacing});
  const origin=[Math.round((start.x-xMin)/spacing),Math.round((start.z-zMin)/spacing)];
  const q=[origin],seen=new Set(),key=(x,z)=>z*columns+x;
  let head=0;
  while(head<q.length){
    const [xi,zi]=q[head++];
    if(xi<0||zi<0||xi>=columns||zi>=rows)continue;
    const id=key(xi,zi);if(seen.has(id))continue;seen.add(id);
    const p=at(xi,zi);
    if(isBlocked(p.x,p.z,.38,0,rectangles))continue;
    if(canReachInteraction(target,p,target.radius))return true;
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
      if(xi+dx>=0&&zi+dz>=0&&xi+dx<columns&&zi+dz<rows)
        q.push([xi+dx,zi+dz]);
    }
  }
  return false;
}
test('bus, aeroporto, Route 66 e deserto têm rotas desde spawn até cada interação',()=>{
  const cases=[
    ['bus',BUS_SPAWN,BUS_TARGETS,[99.5,118.5,-37,-28.2]],
    ['airport',AIRPORT_SPAWN,AIRPORT_TARGETS,[37,96,-40.8,-23.1]],
    ['road',ROAD_SPAWN,ROAD_TARGETS,[-45,-12,12,42.5]],
    ['desert',DESERT_SPAWN,DESERT_TARGETS,[-81,-44,-32,12]]
  ];
  for(const [chapter,spawn,targets,bounds] of cases){
    const v=setup();v.apply({bus:12,airport:19,road:27,desert:35}[chapter]);
    assert.equal(isBlocked(spawn.x,spawn.z,.38,0,v.active),false,chapter+' spawn');
    for(const [id,p]of Object.entries(targets))
      assert.equal(reachable(spawn,p,v.active,bounds),true,chapter+' inaccessible '+id);
  }
});
test('Fazenda não perde suas paredes e a Rodoviária continua no capítulo outdoor',()=>{
  const v=setup();v.apply(7);
  assert.equal(v.visible.visible,true);
  const wall=makeHouseColliders()[0];
  assert.ok(v.active.some(r=>r.tag===wall.tag));
  assert.ok(Object.keys(CITY_TARGETS).length>=5);
  assert.equal(isBlocked(-28,24,.38,0,v.active),true);
});
