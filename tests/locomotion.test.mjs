import test from 'node:test';
import assert from 'node:assert/strict';
import {easeVelocity,moveWithCollision,joystickYaw} from '../src/locomotion.js';
import {farewellGoal,dogAction,DOG_HOME} from '../src/dog-behavior.js';
import {makeHouseColliders,makeFarmFenceColliders,FARM_HOUSE,FARM_GATE} from '../src/farm-layout.js';

test('aceleração gradual e desaceleração estável em 30/60/120 FPS',()=>{
  let v={x:0,z:0};
  for(let i=0;i<60;i++)v=easeVelocity(v,{x:3.45,z:0},1/60);
  assert.ok(v.x>3.44&&v.x<=3.45);
  const braking=easeVelocity(v,{x:0,z:0},1/60,18);
  assert.ok(braking.x<v.x&&braking.x>0);
  assert.deepEqual(easeVelocity(v,{x:0,z:0},0),v);
  const frames=[30,60,120].map(fps=>{
    let u={x:0,z:0};for(let i=0;i<fps;i++)u=easeVelocity(u,{x:3.45,z:0},1/fps);
    return u.x;
  });
  assert.ok(Math.max(...frames)-Math.min(...frames)<1e-8);
});
test('colisão considera velocidade REAL e para de animar frente à parede',()=>{
  const wall=[{x1:1,x2:2,z1:-1,z2:1,height:2}];
  const from={x:.55,z:0};
  const blocked=moveWithCollision(from,{x:5,z:0},.05,wall,.38);
  assert.equal(blocked.x,.55);
  assert.equal(blocked.speed,0);
  assert.equal(blocked.blockedX,true);
  const sliding=moveWithCollision(from,{x:5,z:3},.05,wall,.38);
  assert.equal(sliding.x,.55);
  assert.ok(sliding.z>0&&sliding.speed>0);
  assert.equal(sliding.blockedZ,false);
  assert.equal(from.z,0,'não deve alterar a posição de origem');
  assert.equal(moveWithCollision(from,{x:5,z:0},0,wall,.38).speed,0);
});
test('porta da casa permite a passagem, mas não se atravessa a lateral',()=>{
  const walls=makeHouseColliders();
  let p={x:FARM_HOUSE.doorX,z:-7.1};
  for(let i=0;i<26;i++){
    const next=moveWithCollision(p,{x:0,z:-3},.05,walls,.38);
    p={x:next.x,z:next.z};
  }
  assert.ok(p.z<-9.6,'passagem direta pelo vão da porta');
  const bad=moveWithCollision({x:-16,z:-7.9},{x:0,z:-5},.05,walls,.38);
  assert.ok(bad.z>-8.5,'fachada bloqueia passagem lateral');
});
test('porteira permanece com colisão antes de ser aberta',()=>{
  const fence=makeFarmFenceColliders();
  const middle=FARM_GATE.hingeZ+FARM_GATE.span/2;
  const start={x:FARM_GATE.x-1.0,z:middle};
  let p=start;
  for(let i=0;i<8;i++){
    const n=moveWithCollision(p,{x:3,z:0},.05,fence,.30);
    p={x:n.x,z:n.z};
  }
  assert.ok(p.x<FARM_GATE.x);
  const open=fence.filter(b=>b.tag!=='gate-leaf');
  let q=start;
  for(let i=0;i<16;i++){
    const n=moveWithCollision(q,{x:3,z:0},.05,open,.30);
    q={x:n.x,z:n.z};
  }
  assert.ok(q.x>FARM_GATE.x,'passagem liberada após abrir a porteira');
});
test('rotação do analógico direito é independente da frequência de quadros',()=>{
  const yaw30=Array.from({length:30}).reduce(y=>joystickYaw(y,.7,1/30),.5);
  const yaw120=Array.from({length:120}).reduce(y=>joystickYaw(y,.7,1/120),.5);
  assert.ok(Math.abs(yaw30-yaw120)<1e-9);
  assert.equal(joystickYaw(.5,.05,1/30),.5,'zona morta');
});
test('Pantera acompanha um pouco e depois volta, sem entrar na cidade',()=>{
  assert.deepEqual(DOG_HOME,{x:2.5,z:-3.4});
  const excited=farewellGoal({x:6.5,z:-3.4},2,10);
  assert.equal(excited.excited,true);
  assert.ok(excited.x>2.5&&excited.x<6.5);
  assert.equal(dogAction(2,true),'run');
  assert.equal(dogAction(.1,true),'greet');
  assert.equal(dogAction(2,false),'walk');
  assert.equal(dogAction(.1,false),'idle');
  assert.deepEqual(farewellGoal({x:45,z:4},2,10),{...DOG_HOME,excited:false});
  assert.deepEqual(farewellGoal({x:6.5,z:-3.4},11,10),{...DOG_HOME,excited:false});
  assert.deepEqual(farewellGoal({x:-15,z:-12},3,10),{...DOG_HOME,excited:false});
  assert.deepEqual(farewellGoal(null,3,10),{...DOG_HOME,excited:false});
});
