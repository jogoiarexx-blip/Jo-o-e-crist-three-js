import test from 'node:test';
import assert from 'node:assert/strict';
import {BUS_SPAWN,BUS_NPCS,BUS_TARGETS,BUS_PROPS,makeBusRoomColliders} from '../src/bus-state.js';
import {AIRPORT_SPAWN,AIRPORT_NPCS,AIRPORT_TARGETS,AIRPORT_PROPS,airportColliders} from '../src/airport-state.js';
import {isBlocked} from '../src/collision.js';
import {hasClearApproach,canUseObjective} from '../src/interaction-anchors.js';

const marker=p=>({point:p,radius:p.radius});
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);

test('objetivos do ônibus estão próximos dos objetos 3D, não no centro do corredor',()=>{
  const propByMission={
    busSeat:BUS_PROPS.seat,
    busCrew:BUS_NPCS[0],
    busCase:BUS_PROPS.case,
    busInspect:BUS_PROPS.mic,
    busConnect:BUS_PROPS.rack,
    busDance:BUS_PROPS.stage,
    busReveal:BUS_PROPS.driver
  };
  const colliders=makeBusRoomColliders();
  assert.equal(Object.keys(BUS_TARGETS).length,7);
  for(const [name,p] of Object.entries(BUS_TARGETS)){
    assert.equal(isBlocked(p.x,p.z,.38,0,colliders),false,name+' livre');
    assert.ok(dist(p,propByMission[name])<=2,name+' perto do objeto');
    assert.ok(p.radius<=1.8,name+' não ativa do outro lado do corredor');
    assert.equal(canUseObjective(marker(p),p,colliders,14),true,name);
  }
  assert.ok(dist(BUS_TARGETS.busCase,{x:113.2,z:-32.55})>BUS_TARGETS.busCase.radius);
  assert.equal(canUseObjective(marker(BUS_TARGETS.busCase),{x:113.2,z:-32.55},colliders,14),false);
  for(const n of BUS_NPCS)
    assert.equal(isBlocked(n.x,n.z,.38,0,colliders),false,'artista preso '+n.id);
});
test('gatilhos do aeroporto ficam ao lado de balcões, painel, scanner e esteira',()=>{
  const pair={
    airWelcome:AIRPORT_PROPS.panel,airCheckin:AIRPORT_PROPS.checkin,
    airPassport:AIRPORT_PROPS.lost,airFarofa:AIRPORT_PROPS.bags,
    airSecurity:AIRPORT_PROPS.scanner,airGate:AIRPORT_PROPS.gate,
    airRush:AIRPORT_PROPS.belt,airBoard:AIRPORT_PROPS.board
  };
  const colliders=airportColliders();
  assert.equal(Object.keys(AIRPORT_TARGETS).length,8);
  for(const [name,p] of Object.entries(AIRPORT_TARGETS)){
    assert.equal(isBlocked(p.x,p.z,.38,0,colliders),false,name);
    assert.ok(dist(p,pair[name])<=2.15,name+' objeto distante');
    assert.ok(p.radius<=1.65,name+' raio excessivo');
    assert.equal(canUseObjective(marker(p),p,colliders,21),true,name);
  }
  assert.equal(canUseObjective(marker(AIRPORT_TARGETS.airCheckin),{x:50.5,z:-31.5},colliders,20),false);
  for(const n of AIRPORT_NPCS)
    assert.equal(isBlocked(n.x,n.z,.38,0,colliders),false,'atendente preso '+n.id);
});
test('interação não atravessa banco do ônibus nem balcão do aeroporto',()=>{
  const bus=makeBusRoomColliders(),airport=airportColliders();
  const seat=marker(BUS_TARGETS.busSeat);
  assert.equal(dist(seat.point,{x:103,z:-35.1})<=seat.radius,true,'distância por si permitiria');
  assert.equal(canUseObjective(seat,{x:103,z:-35.1},bus,12),false,'banco bloqueia');
  const desk=marker(AIRPORT_TARGETS.airCheckin);
  assert.ok(dist(desk.point,{x:50.5,z:-27.1})<=desk.radius);
  assert.equal(canUseObjective(desk,{x:50.5,z:-27.1},airport,20),false,'balcão bloqueia');
  assert.equal(hasClearApproach({x:50.5,z:-29},desk.point,airport),true);
  assert.equal(canUseObjective(desk,{x:50.5,z:-29},airport,20),true);
  assert.equal(canUseObjective(desk,{x:50.5,z:-45},airport,20),false);
  assert.equal(canUseObjective(null,{x:0,z:0},airport,20),false);
});
function accessible(spawn,target,colliders,step,bounds){
  const spacing=.45,[minX,maxX,minZ,maxZ]=bounds;
  const cols=Math.floor((maxX-minX)/spacing)+1,rows=Math.floor((maxZ-minZ)/spacing)+1;
  const start=[Math.round((spawn.x-minX)/spacing),Math.round((spawn.z-minZ)/spacing)];
  const seen=new Set(),queue=[start];let head=0;
  while(head<queue.length){
    const [i,j]=queue[head++];
    if(i<0||j<0||i>=cols||j>=rows)continue;
    const key=j*cols+i;if(seen.has(key))continue;seen.add(key);
    const pos={x:minX+i*spacing,z:minZ+j*spacing};
    if(isBlocked(pos.x,pos.z,.38,0,colliders))continue;
    if(canUseObjective(marker(target),pos,colliders,step))return true;
    queue.push([i+1,j],[i-1,j],[i,j+1],[i,j-1]);
  }
  return false;
}
test('todas as 15 missões são alcançáveis andando a partir do spawn, com visibilidade',()=>{
  const stages=[
    ['ônibus',BUS_SPAWN,BUS_TARGETS,makeBusRoomColliders(),12,[99.5,118.5,-37,-28.2]],
    ['aeroporto',AIRPORT_SPAWN,AIRPORT_TARGETS,airportColliders(),21,[37,96,-40.8,-23.1]]
  ];
  for(const [name,spawn,targets,solid,step,bounds] of stages){
    for(const [id,target] of Object.entries(targets)){
      assert.equal(accessible(spawn,target,solid,step,bounds),true,name+' sem caminho para '+id);
    }
  }
});
