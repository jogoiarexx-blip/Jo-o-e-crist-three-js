// Movimento consistente com os eixos da câmera.
// W e analógico para cima seguem a direção da câmera;
// A / analógico à esquerda movem sempre para a esquerda da tela.
export function cameraRelativeMove(right,forward,yaw){
  const x=Number.isFinite(right)?right:0;
  const y=Number.isFinite(forward)?forward:0;
  const len=Math.hypot(x,y);
  if(len<1e-6)return {x:0,z:0};
  const k=Math.min(1,1/len);
  return {
    x:(Math.cos(yaw)*x+Math.sin(yaw)*y)*k,
    z:(-Math.sin(yaw)*x+Math.cos(yaw)*y)*k
  };
}
export function rotateCameraRight(yaw,dragRight,sensitivity=.0052){
  return yaw+dragRight*sensitivity;
}
