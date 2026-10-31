import {FARM_GATE} from './farm-layout.js';

// Os dois mapas externos já ocupam o mesmo mundo 3D. Um companheiro que
// fica distante deve ALCANÇAR o jogador andando, não reaparecer de repente.
export function canSnapDistantCompanion(distance,sameHouseSide,continuousOutdoor){
  return Number.isFinite(distance)&&distance>16&&!!sameHouseSide&&!continuousOutdoor;
}
export function companionFollowSpeed(distance,continuousOutdoor){
  if(!Number.isFinite(distance)||distance<=0)return 0;
  return Math.min(continuousOutdoor?7:4.15,distance*2.3);
}
// Guia o acompanhante pelo vão da porteira quando João/Crist estão
// em lados opostos da cerca. A função não move nenhum personagem.
export function gateFollowerWaypoint(hero,companion,gate=FARM_GATE){
  if(!hero||!companion)return null;
  if(![hero.x,companion.x,hero.z,companion.z].every(Number.isFinite))return null;
  const middle=gate.hingeZ+gate.span/2;
  if(hero.x>gate.x+1.0&&companion.x<gate.x+1.0){
    return companion.x<gate.x-1.8?
      {x:gate.x-1.0,z:middle}:{x:gate.x+1.95,z:middle};
  }
  if(hero.x<gate.x-1.0&&companion.x>gate.x-1.0){
    return companion.x>gate.x+1.8?
      {x:gate.x+1.0,z:middle}:{x:gate.x-1.95,z:middle};
  }
  return null;
}
