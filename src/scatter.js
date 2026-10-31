// v0.7.0 — Distribuição determinística de vegetação e pedras (lógica pura).
// A mesma semente gera sempre o mesmo cenário em PC e celular, e nenhum item
// pode cair sobre estradas, prédios, colisores ou pontos de missão.
export function mulberry32(seed){
  let a=(Number.isFinite(seed)?seed:1)>>>0;
  return function(){
    a=(a+0x6D2B79F5)>>>0;
    let t=a;
    t=Math.imul(t^(t>>>15),t|1);
    t^=t+Math.imul(t^(t>>>7),t|61);
    return ((t^(t>>>14))>>>0)/4294967296;
  };
}
export function insideRect(x,z,r,margin=0){
  return x>=r.x1-margin&&x<=r.x2+margin&&z>=r.z1-margin&&z<=r.z2+margin;
}
// area {x1,x2,z1,z2}; avoid: retângulos {x1,x2,z1,z2}; circles: {x,z,r}.
export function scatterPoints({seed=1,count=100,area,avoid=[],circles=[],margin=.4,spacing=0,maxTries=null}={}){
  if(!area||!(area.x2>area.x1)||!(area.z2>area.z1))throw new TypeError('Área de distribuição inválida');
  const rand=mulberry32(seed),points=[];
  const tries=maxTries??count*12;
  for(let i=0;i<tries&&points.length<count;i++){
    const x=area.x1+rand()*(area.x2-area.x1),z=area.z1+rand()*(area.z2-area.z1);
    const scale=.7+rand()*.6,rotation=rand()*Math.PI*2,variant=rand();
    if(avoid.some(r=>insideRect(x,z,r,margin)))continue;
    if(circles.some(c=>Math.hypot(x-c.x,z-c.z)<c.r+margin))continue;
    if(spacing>0&&points.some(p=>Math.hypot(p.x-x,p.z-z)<spacing))continue;
    points.push({x,z,scale,rotation,variant});
  }
  return points;
}
// Anel distante (montanhas, mesas, linhas de árvores) ao redor de um centro.
export function ringPoints({seed=7,count=24,cx=0,cz=0,radius=120,jitter=18,arc=[0,Math.PI*2]}={}){
  const rand=mulberry32(seed),points=[];
  const [a0,a1]=arc,span=a1-a0;
  for(let i=0;i<count;i++){
    const a=a0+span*(i+rand()*.8)/count;
    const r=radius+(rand()-.5)*2*jitter;
    points.push({x:cx+Math.sin(a)*r,z:cz+Math.cos(a)*r,angle:a,scale:.7+rand()*.7,variant:rand()});
  }
  return points;
}
