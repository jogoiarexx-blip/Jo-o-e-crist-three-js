import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

// Estes arquivos são fornecidos pelo criador do jogo. O fallback procedural
// só aparece se o GLB estiver ausente, corrompido ou inacessível.
import {CHARACTER_ASSETS,CHARACTER_PACKED_PARTS,CHARACTER_CLIPS,CHARACTER_HEIGHTS,normalizeCharacterHeight,groundedFootCorrection,getCharacterAnimationName} from './avatar-logic.js';
export {CHARACTER_ASSETS,CHARACTER_CLIPS,CHARACTER_HEIGHTS,normalizeCharacterHeight,getCharacterAnimationName} from './avatar-logic.js';

function makeIdleClip(walk){
  // Ambos os Meshy GLBs têm Walking, mas nenhum possui Idle.
  // Congela uma pose de caminhada para não manter o personagem em T-pose.
  if(!walk)return null;
  const sample=Math.min(.22,Math.max(0,walk.duration*.35));
  const tracks=walk.tracks.map(track=>{
    const pose=Array.from(track.createInterpolant().evaluate(sample));
    return new track.constructor(track.name,[0,1],[...pose,...pose]);
  });
  return new THREE.AnimationClip(CHARACTER_CLIPS.idle,1,tracks);
}
export function makeCharacterAnimationState(model,clips){
  const mixer=new THREE.AnimationMixer(model);
  const all=[...clips];
  const idle=makeIdleClip(clips.find(c=>c.name==='Walking'));
  if(idle)all.push(idle);
  const actions={};
  for(const clip of all){
    const action=mixer.clipAction(clip);
    action.setLoop(THREE.LoopRepeat,Infinity);
    actions[clip.name]=action;
  }
  return {mixer,actions,current:null,playing:null};
}
export function updateCharacterAnimation(root,dt){
  const data=root.userData,animation=data.avatarAnimation;
  if(!animation)return false;
  const names=Object.keys(animation.actions);
  const requested=getCharacterAnimationName(names,data.moving||0,data.gesture||'',!!data.dance);
  if(requested&&requested!==animation.current){
    const old=animation.actions[animation.current];
    const next=animation.actions[requested];
    if(old)old.fadeOut(.17);
    next.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(.17).play();
    animation.current=requested;
  }
  const playing=animation.actions[animation.current];
  if(playing){
    // A animação de caminhada não controla a posição do ator: o movimento
    // continua vindo do sistema de colisões e companhia original.
    if(animation.current==='Walking')playing.setEffectiveTimeScale(Math.max(.72,Math.min(1.2,(data.moving||0)/3.45)));
    else if(animation.current==='Running')playing.setEffectiveTimeScale(Math.max(.8,Math.min(1.15,(data.moving||0)/5.25)));
  }
  animation.mixer.update(Math.min(Math.max(dt,0),.05));
  // Um tornozelo fica em apoio ao caminhar: compensar a altura do rig
  // no grupo visual sem mover o colisor, a câmera ou o save do personagem.
  const ground=data.avatarGround;
  if(ground?.feet.length &&
     [CHARACTER_CLIPS.idle,CHARACTER_CLIPS.walk,CHARACTER_CLIPS.run].includes(animation.current)){
    root.updateMatrixWorld(true);
    let lowest=Infinity;
    for(const bone of ground.feet){
      bone.getWorldPosition(ground.temp);
      lowest=Math.min(lowest,ground.temp.y);
    }
    if(Number.isFinite(lowest))
      ground.mount.position.y+=groundedFootCorrection(lowest,ground.referenceY,dt);
  }
  return true;
}
export async function loadCharacterGlb(root,id,loader=new GLTFLoader()){
  const url=CHARACTER_ASSETS[id];
  if(!url||!root)throw new Error('Modelo de personagem desconhecido: '+id);
  // Crist foi dividido em 2 blobs verificados byte a byte para caber no
  // transporte de arquivos do GitHub. O GLB original é remontado na memória,
  // sem perdas na malha, texturas, rig ou animações.
  const parts=CHARACTER_PACKED_PARTS[id]||null;
  let gltf;
  if(parts){
    const blocks=await Promise.all(parts.map(async part=>{
      const response=await fetch(part);
      if(!response.ok)throw new Error('Arquivo GLB ausente: '+part+' ('+response.status+')');
      return new Uint8Array(await response.arrayBuffer());
    }));
    const total=blocks.reduce((n,block)=>n+block.byteLength,0);
    const merged=new Uint8Array(total);
    let at=0;
    for(const block of blocks){merged.set(block,at);at+=block.byteLength;}
    // Este é um arquivo GLB completo na memória, não um novo formato de modelo.
    if(total<20||String.fromCharCode(...merged.subarray(0,4))!=='glTF')
      throw new Error(id+': fragmentos GLB inválidos');
    const expectedLength=new DataView(merged.buffer).getUint32(8,true);
    if(expectedLength!==total)throw new Error(id+': GLB incompleto ('+total+' / '+expectedLength+')');
    const basePath=new URL('./assets/characters/',document.baseURI).href;
    gltf=await loader.parseAsync(merged.buffer,basePath);
  }else{
    gltf=await loader.loadAsync(url);
  }
  const model=gltf.scene;
  if(!model)throw new Error(id+': GLB sem cena 3D');
  const box=new THREE.Box3().setFromObject(model);
  const height=box.max.y-box.min.y;
  if(!Number.isFinite(height)||height<.3)throw new Error(id+': altura inválida no GLB');
  const targetHeight=CHARACTER_HEIGHTS[id];
  const factor=normalizeCharacterHeight(height,targetHeight);
  // Transformações de escala/solo fora do GLB preservam rig e root motion.
  const mount=new THREE.Group();
  mount.name=id+'-AvatarGroundAnchor';
  mount.scale.setScalar(factor);
  mount.add(model);
  model.name=id+'-Meshy-GLB';
  model.traverse(obj=>{
    if(obj.isMesh||obj.isSkinnedMesh){
      obj.castShadow=true;obj.receiveShadow=true;
      obj.frustumCulled=false; // SkinnedMesh moves bones outside rest-pose bounds.
    }
  });
  root.add(mount);
  root.userData.avatarModel=model;
  root.userData.avatarMount=mount;
  root.userData.avatarSource=parts||url;
  root.userData.avatarClips=gltf.animations.map(c=>c.name);
  root.userData.avatarAnimation=makeCharacterAnimationState(model,gltf.animations);
  updateCharacterAnimation(root,0);
  // Alinha a pose idle efetiva, em vez da bind-pose antes da animação.
  const posedBounds=new THREE.Box3().setFromObject(mount);
  if(Number.isFinite(posedBounds.min.y))mount.position.y-=posedBounds.min.y;
  const feet=[];
  model.traverse(node=>{
    if(node.isBone&&/(foot|ankle)/i.test(node.name)&&!/(ik|target|pole|ctrl)/i.test(node.name))
      feet.push(node);
  });
  mount.updateMatrixWorld(true);
  const temp=new THREE.Vector3();
  const referenceY=feet.reduce((low,bone)=>{
    bone.getWorldPosition(temp);
    return Math.min(low,temp.y);
  },Infinity);
  root.userData.avatarGround={
    mount,feet,temp,referenceY:Number.isFinite(referenceY)?referenceY:0
  };
  // Não trocar o root do ator: a aventura, missões e saves permanecem iguais.
  const old=root.userData.proceduralModel;
  if(old)old.visible=false;
  return {id,url:parts||url,height,targetHeight,scale:factor,footBones:feet.length,clips:root.userData.avatarClips};
}
export async function loadAllCharacterGlbs(actors,{onLoaded,onError}={}){
  const loader=new GLTFLoader();
  return Promise.all(Object.entries(CHARACTER_ASSETS).map(async([id])=>{
    try{
      const result=await loadCharacterGlb(actors[id],id,loader);
      onLoaded?.(result);
      return result;
    }catch(error){
      // A indisponibilidade de um asset jamais interrompe uma partida/salvamento.
      onError?.(id,error);
      return {id,fallback:true,error:String(error?.message||error)};
    }
  }));
}
