// O olhar da câmera é (sin(yaw), cos(yaw)), a direita da tela (-cos(yaw), sin(yaw)).
// A/D, setas e joystick usam a mesma base ortogonal, em qualquer ângulo.
export function cameraRelativeMove(right,forward,yaw){
  const x=Number.isFinite(right)?right:0;
  const y=Number.isFinite(forward)?forward:0;
  const len=Math.hypot(x,y);
  if(len<1e-6)return {x:0,z:0};
  const k=Math.min(1,1/len);
  return {
    x:(-Math.cos(yaw)*x+Math.sin(yaw)*y)*k,
    z:(Math.sin(yaw)*x+Math.cos(yaw)*y)*k
  };
}
export function rotateCameraRight(yaw,dragRight,sensitivity=.0052){
  return yaw-dragRight*sensitivity;
}
