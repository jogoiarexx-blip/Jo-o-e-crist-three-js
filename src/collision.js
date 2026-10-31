// Colisão 2D com altura para câmeras: nenhuma dependência do navegador ou WebGL.
export function isBlocked(x,z,radius=0.38,height=0,rectangles=[]){
  if(!Number.isFinite(x)||!Number.isFinite(z))return true;
  // O deserto fica a oeste do mapa original. Apenas seus colliders ativos
  // ampliam o limite; as fases anteriores preservam exatamente -48..129.
  const west=rectangles.some(rect=>String(rect.tag||'').startsWith('desert-'))?-82:-48;
  if(x-radius<west||x+radius>129||z-radius<-43||z+radius>46)return true;
  for(const box of rectangles){
    if(height>(box.height??6.65))continue;
    if(x+radius>box.x1&&x-radius<box.x2&&z+radius>box.z1&&z-radius<box.z2)return true;
  }
  return false;
}
export function canReachInteraction(point,position,radius){
  if(!point||!position)return false;
  return Math.hypot(point.x-position.x,point.z-position.z)<=radius;
}
