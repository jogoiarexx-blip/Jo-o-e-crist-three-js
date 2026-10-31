// QA-02 — interações próximas aos objetos 3D, sem acionar através de sólidos.
// Não depende de WebGL: reutilizado pelo jogo e pelos testes automatizados.
import {isBlocked} from './collision.js';

export function hasClearApproach(from,to,colliders,clearance=.04){
  if(!from||!to||!Number.isFinite(from.x)||!Number.isFinite(from.z)||
    !Number.isFinite(to.x)||!Number.isFinite(to.z))return false;
  const dist=Math.hypot(to.x-from.x,to.z-from.z);
  if(!dist)return !isBlocked(from.x,from.z,clearance,0,colliders);
  const slices=Math.ceil(dist/.16);
  // Interior dos segmentos, sem amostrar dentro da parede por arredondamento.
  for(let i=0;i<=slices;i++){
    const t=i/slices;
    const x=from.x+(to.x-from.x)*t,z=from.z+(to.z-from.z)*t;
    if(isBlocked(x,z,clearance,0,colliders))return false;
  }
  return true;
}

export function canUseObjective(marker,character,colliders,step){
  if(!marker||!marker.point||!character)return false;
  const p=marker.point;
  if(!Number.isFinite(p.x)||!Number.isFinite(p.z)||
     !Number.isFinite(character.x)||!Number.isFinite(character.z)||
     !Number.isFinite(marker.radius)||marker.radius<=0)return false;
  const distance=Math.hypot(character.x-p.x,character.z-p.z);
  if(distance>marker.radius)return false;
  // Só a excursão e o aeroporto precisam da restrição extra de linha de vista.
  // As missões de outras áreas continuam com o comportamento já existente.
  return step>=12&&step<=26?hasClearApproach(character,p,colliders):true;
}
