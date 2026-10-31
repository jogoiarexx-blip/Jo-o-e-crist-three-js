import test from 'node:test';
import assert from 'node:assert/strict';
import {cameraRelativeMove,rotateCameraRight} from '../src/controls.js';

test('A e seta esquerda andam à esquerda; D e seta direita à direita da tela',()=>{
  for(const yaw of [0,.48,1.12,Math.PI/2,Math.PI,-1.1]){
    const left=cameraRelativeMove(-1,0,yaw);
    const right=cameraRelativeMove(1,0,yaw);
    const rightOfCamera={x:-Math.cos(yaw),z:Math.sin(yaw)};
    const dot=(a,b)=>a.x*b.x+a.z*b.z;
    assert.ok(dot(right,rightOfCamera)>.999999,'D acompanha o lado direito da câmera');
    assert.ok(dot(left,rightOfCamera)<-.999999,'A acompanha o lado esquerdo da câmera');
    assert.ok(Math.abs(left.x+right.x)<1e-10);
    assert.ok(Math.abs(left.z+right.z)<1e-10);
  }
});
test('W/S mantêm frente e trás; diagonal tem velocidade normalizada',()=>{
 for(const yaw of [0,.7,1.12,Math.PI]){
   const f=cameraRelativeMove(0,1,yaw),b=cameraRelativeMove(0,-1,yaw);
   assert.ok(Math.abs(f.x-Math.sin(yaw))<1e-10);
   assert.ok(Math.abs(f.z-Math.cos(yaw))<1e-10);
   assert.ok(Math.abs(f.x+b.x)<1e-10);
   assert.ok(Math.abs(f.z+b.z)<1e-10);
   const d=cameraRelativeMove(1,1,yaw);
   assert.ok(Math.abs(Math.hypot(d.x,d.z)-1)<1e-10);
 }
 assert.deepEqual(cameraRelativeMove(0,0,1),{x:0,z:0});
 assert.deepEqual(cameraRelativeMove(NaN,NaN,0),{x:0,z:0});
});
test('mouse para a direita gira a visão para a direita',()=>{
 assert.ok(rotateCameraRight(1,20)<1);
 assert.ok(rotateCameraRight(1,-20)>1);
 assert.equal(rotateCameraRight(1,0),1);
});
