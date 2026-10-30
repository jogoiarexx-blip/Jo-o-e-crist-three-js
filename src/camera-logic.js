// Perfil da câmera para evitar esconder o herói atrás da parede da casa.
export function cameraRig(inside,zoom,pitch){
  const z=Number.isFinite(zoom)?Math.max(3,Math.min(13,zoom)):8.2;
  const p=Number.isFinite(pitch)?Math.max(.1,Math.min(1.1,pitch)):.48;
  return inside
    ? {distance:Math.min(z,5.45),lift:1.65+p*2.2,ahead:.95,minDistance:1.15}
    : {distance:z,lift:3.1+p*5,ahead:1.8,minDistance:2.3};
}
