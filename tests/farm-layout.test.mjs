import test from 'node:test';
import assert from 'node:assert/strict';
import {isBlocked,canReachInteraction} from '../src/collision.js';
import {FARM_HOUSE,FARM_GATE,FARM_OBJECTS,isInsideHouse,makeHouseColliders,makeFarmFenceColliders,gateCanOpen} from '../src/farm-layout.js';
import {cameraRelativeMove,rotateCameraRight} from '../src/controls.js';

test('a casa tem paredes reais, mas a entrada frontal é transponível',()=>{
  const walls=makeHouseColliders();
  assert.equal(walls.length,5);
  assert.equal(isBlocked(FARM_HOUSE.doorX,FARM_HOUSE.doorZ,.34,0,walls),false,'a porta não pode ser um collider invisível');
  assert.equal(isBlocked(-16,FARM_HOUSE.doorZ,.34,0,walls),true,'o trecho de fachada deve ser sólido');
  assert.equal(isBlocked(-22.5,-13,.34,0,walls),true);
  assert.equal(isInsideHouse(-12,-10),true);
  assert.equal(isInsideHouse(-12,-6.5),false);
  for(let z=-6.6;z>=-10.2;z-=.2){
    assert.equal(isBlocked(FARM_HOUSE.doorX,z,.34,0,walls),false,'o corredor da porta deve ser livre em z='+z.toFixed(2));
  }
});
test('documentos e mala ficam dentro de casa e acessíveis pelas bordas',()=>{
  assert.ok(isInsideHouse(FARM_OBJECTS.documents.x,FARM_OBJECTS.documents.z));
  assert.ok(isInsideHouse(FARM_OBJECTS.suitcase.x,FARM_OBJECTS.suitcase.z));
  const furniture=[
    {x1:-19.45,x2:-16.95,z1:-12.25,z2:-10.95,height:1.26},
    {x1:-12.55,x2:-11.65,z1:-15.05,z2:-14.05,height:.7}
  ];
  const deskApproach={x:-16.08,z:-11.6};
  const suitcaseApproach={x:-12.1,z:-12.5};
  const walls=makeHouseColliders().concat(furniture);
  assert.equal(isBlocked(deskApproach.x,deskApproach.z,.38,0,walls),false);
  assert.equal(isBlocked(suitcaseApproach.x,suitcaseApproach.z,.38,0,walls),false);
  assert.ok(canReachInteraction(FARM_OBJECTS.documents,deskApproach,2.2));
  assert.ok(canReachInteraction(FARM_OBJECTS.suitcase,suitcaseApproach,2.25));
});
test('porteira conecta trechos de cerca e só libera a passagem ao abrir',()=>{
  const fence=makeFarmFenceColliders();
  assert.equal(fence.length,5);
  const leaf=fence.find(w=>w.tag==='gate-leaf');
  assert.ok(leaf);
  const middleZ=FARM_GATE.hingeZ+FARM_GATE.span/2;
  assert.equal(isBlocked(FARM_GATE.x,middleZ,.34,0,fence),true);
  const openFence=fence.filter(part=>part.tag!=='gate-leaf');
  assert.equal(isBlocked(FARM_GATE.x,middleZ,.34,0,openFence),false);
  assert.equal(isBlocked(FARM_GATE.x,FARM_GATE.hingeZ-2,.34,0,openFence),true);
  assert.equal(isBlocked(FARM_GATE.x,FARM_GATE.hingeZ+FARM_GATE.span+2,.34,0,openFence),true);
  assert.equal(gateCanOpen(4),false);
  assert.equal(gateCanOpen(5),true);
});
test('lados W,A,S,D e joystick são previsíveis na orientação da câmera',()=>{
  const eps=1e-8;
  const close=(a,b)=>assert.ok(Math.abs(a-b)<eps, a+' != '+b);
  close(cameraRelativeMove(1,0,0).x,-1); // D/analógico direito -> direita visual
  close(cameraRelativeMove(-1,0,0).x,1); // A -> esquerda visual
  close(cameraRelativeMove(0,1,0).z,1); // W -> frente
  close(cameraRelativeMove(0,-1,0).z,-1); // S -> trás
  close(cameraRelativeMove(0,1,Math.PI/2).x,1); // girou à direita: W segue direita do mundo
  close(cameraRelativeMove(1,0,Math.PI/2).z,1); // D ainda à direita da tela
  assert.ok(rotateCameraRight(0,50)<0,'arrastar à direita deve virar visão para a direita');
  assert.equal(cameraRelativeMove(0,0,1.5).x,0);
  close(Math.hypot(...Object.values(cameraRelativeMove(3,4,1))),1);
});
