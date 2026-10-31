// Controle independente de renderização: um único capítulo recebe
// geometria/colisões, sem remover o conteúdo de fases anteriores do projeto.
export function chapterAt(step){
  const n=Number.isFinite(step)?Math.floor(step):0;
  if(n>=35)return 'desert';
  if(n>=27)return 'road';
  if(n>=19)return 'airport';
  if(n>=12)return 'bus';
  return 'outdoor';
}

export function setColliderLayer(colliders,layer,enabled){
  if(!Array.isArray(colliders)||!Array.isArray(layer))throw new TypeError('Camadas inválidas');
  if(enabled){
    for(const rectangle of layer)if(!colliders.includes(rectangle))colliders.push(rectangle);
  }else{
    const unwanted=new Set(layer);
    for(let i=colliders.length-1;i>=0;i--)if(unwanted.has(colliders[i]))colliders.splice(i,1);
  }
  return colliders;
}

export function applyChapterLayers(step,outdoor,colliders,outdoorColliders,modules){
  const active=chapterAt(step);
  outdoor.visible=active==='outdoor';
  // First disable the old layer, then activate exactly one separate hub.
  setColliderLayer(colliders,outdoorColliders,active==='outdoor');
  for(const [id,world] of Object.entries(modules))world.setActive(id===active);
  return active;
}
