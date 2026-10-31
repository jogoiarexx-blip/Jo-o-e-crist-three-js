// Avalia a linha de visão do foco ao centro da câmera. A distância segura
// também pode ser MENOR que o minDistance do perfil: aproximar é melhor
// do que colocar a câmera do outro lado da parede.
export function cameraClearanceDistance(focus,yaw,ideal,lift,isBlocked,{steps=32,radius=.17,buffer=.10}={}){
  if(!focus||!Number.isFinite(focus.x)||!Number.isFinite(focus.z)||
     !Number.isFinite(focus.y)||!Number.isFinite(yaw)||
     !Number.isFinite(ideal)||ideal<=0||!Number.isFinite(lift)||
     typeof isBlocked!=='function')return 0.3;
  const total=Math.max(8,Math.min(96,Math.floor(steps)||32));
  const sin=Math.sin(yaw),cos=Math.cos(yaw);
  for(let i=1;i<=total;i++){
    const fraction=i/total;
    const dx=ideal*fraction;
    const x=focus.x-sin*dx,z=focus.z-cos*dx,y=focus.y+lift*fraction;
    if(isBlocked(x,z,radius,y)){
      return Math.max(.22,Math.min(ideal,ideal*(i-1)/total-buffer));
    }
  }
  return ideal;
}
