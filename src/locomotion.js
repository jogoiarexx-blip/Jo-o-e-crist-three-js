import {isBlocked} from './collision.js';

// Aceleração estável entre 30, 60 e 120 FPS; sem deslocamento após uma pausa.
export function easeVelocity(previous,desired,dt,responsiveness=11){
  const t=Math.max(0,Math.min(.05,Number.isFinite(dt)?dt:0));
  const a=1-Math.exp(-t*responsiveness);
  return {x:previous.x+(desired.x-previous.x)*a,z:previous.z+(desired.z-previous.z)*a};
}

// Deslizar pelas paredes, devolver velocidade REAL para a animação, sem passos no lugar.
export function moveWithCollision(position,velocity,dt,colliders=[],radius=.38){
  const t=Math.max(0,Math.min(.05,Number.isFinite(dt)?dt:0));
  const ox=position.x,oz=position.z;
  if(!Number.isFinite(ox)||!Number.isFinite(oz)||!Number.isFinite(velocity.x)||!Number.isFinite(velocity.z)||t===0)
    return {x:ox,z:oz,dx:0,dz:0,speed:0,blockedX:false,blockedZ:false};
  const goalX=ox+velocity.x*t,goalZ=oz+velocity.z*t;
  const blockedX=isBlocked(goalX,oz,radius,0,colliders);
  const x=blockedX?ox:goalX;
  const blockedZ=isBlocked(x,goalZ,radius,0,colliders);
  const z=blockedZ?oz:goalZ;
  return {x,z,dx:x-ox,dz:z-oz,speed:Math.hypot(x-ox,z-oz)/t,blockedX,blockedZ};
}

// Analógico direito deve girar a câmera à mesma velocidade real, independentemente do FPS.
export function joystickYaw(yaw,axis,dt,turnSpeed=1.72){
  const v=Math.abs(axis)>.18?axis:0;
  const t=Math.max(0,Math.min(.05,Number.isFinite(dt)?dt:0));
  return yaw+v*turnSpeed*t;
}
