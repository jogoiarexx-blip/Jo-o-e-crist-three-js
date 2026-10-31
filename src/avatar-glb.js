import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

// Estes arquivos são fornecidos pelo criador do jogo. O fallback procedural
// só aparece se o GLB estiver ausente, corrompido ou inacessível.
import {CHARACTER_ASSETS,CHARACTER_CLIPS,normalizeCharacterHeight,getCharacterAnimationName} from './avatar-logic.js';
export {CHARACTER_ASSETS,CHARACTER_CLIPS,normalizeCharacterHeight,getCharacterAnimationName} from './avatar-logic.js';

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
  return true;
}
export async function loadCharacterGlb(root,id,loader=new GLTFLoader()){
  const url=CHARACTER_ASSETS[id];
  if(!url||!root)throw new Error('Modelo de personagem desconhecido: '+id);
  const gltf=await loader.loadAsync(url);
  const model=gltf.scene;
  if(!model)throw new Error(id+': GLB sem cena 3D');
  const box=new THREE.Box3().setFromObject(model);
  const height=box.max.y-box.min.y;
  if(!Number.isFinite(height)||height<.3)throw new Error(id+': altura inválida no GLB');
  const factor=normalizeCharacterHeight(height);
  model.scale.multiplyScalar(factor);
  model.position.y-=box.min.y*factor;
  model.name=id+'-Meshy-GLB';
  model.traverse(obj=>{
    if(obj.isMesh||obj.isSkinnedMesh){
      obj.castShadow=true;obj.receiveShadow=true;
      obj.frustumCulled=false; // SkinnedMesh moves bones outside rest-pose bounds.
    }
  });
  root.add(model);
  // Mantém um fallback enquanto a Promise não terminou, e o esconde depois
  // sem deslocar o root usado pelos controles, diálogos ou pela câmera.
  const old=root.userData.proceduralModel;
  if(old)old.visible=false;
  root.userData.avatarModel=model;
  root.userData.avatarSource=url;
  root.userData.avatarClips=gltf.animations.map(c=>c.name);
  root.userData.avatarAnimation=makeCharacterAnimationState(model,gltf.animations);
  updateCharacterAnimation(root,0);
  return {id,url,height,scale:factor,clips:root.userData.avatarClips};
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
