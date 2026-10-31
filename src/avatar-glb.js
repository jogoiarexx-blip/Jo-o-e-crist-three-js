import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

// Estes arquivos são fornecidos pelo criador do jogo. O fallback procedural
// só aparece se o GLB estiver ausente, corrompido ou inacessível.
import {CHARACTER_ASSETS,CHARACTER_PACKED_PARTS,CHARACTER_CLIPS,CHARACTER_HEIGHTS,normalizeCharacterHeight,groundedFootCorrection,isFootContactBone,getCharacterAnimationName,selectNeutralIdleSample,soleGroundCorrection} from './avatar-logic.js';
export {CHARACTER_ASSETS,CHARACTER_CLIPS,CHARACTER_HEIGHTS,normalizeCharacterHeight,getCharacterAnimationName} from './avatar-logic.js';

function findSupportFoot(model,side){
  const found=[];
  model.traverse(obj=>{
    if(!obj.isBone||!isFootContactBone(obj.name))return;
    if(side==='left' && /left|(?:^|[_.:-])l(?:[_.:-]|$)|lfoot|ltoe|lankle/i.test(obj.name))found.push(obj);
    if(side==='right' && /right|(?:^|[_.:-])r(?:[_.:-]|$)|rfoot|rtoe|rankle/i.test(obj.name))found.push(obj);
  });
  // Preferir o osso do pé aos dedos/tornozelo para comparar a mesma
  // articulação dos dois lados durante a escolha da pose em repouso.
  return found.find(b=>/foot/i.test(b.name))||found[0]||null;
}
function neutralWalkTime(model,walk){
  const fallback=Math.min(.22,Math.max(0,walk.duration*.35));
  const left=findSupportFoot(model,'left'),right=findSupportFoot(model,'right');
  if(!left||!right||!Number.isFinite(walk.duration)||walk.duration<=0)return fallback;
  const original=[];
  model.traverse(obj=>original.push([obj,obj.position.clone(),obj.quaternion.clone(),obj.scale.clone()]));
  const mixer=new THREE.AnimationMixer(model),action=mixer.clipAction(walk);
  const a=new THREE.Vector3(),b=new THREE.Vector3(),samples=[];
  try{
    action.play();
    for(let i=0;i<16;i++){
      const time=walk.duration*(i+.5)/16;
      mixer.setTime(time);
      model.updateMatrixWorld(true);
      left.getWorldPosition(a);right.getWorldPosition(b);
      samples.push({time,left:{y:a.y,z:a.z},right:{y:b.y,z:b.z}});
    }
  }finally{
    action.stop();
    for(const [obj,pos,quat,scale] of original){
      obj.position.copy(pos);obj.quaternion.copy(quat);obj.scale.copy(scale);
    }
    model.updateMatrixWorld(true);
  }
  return selectNeutralIdleSample(samples,fallback);
}
function makeIdleClip(walk,model){
  // Evitar congelar uma perna levantada numa amostra arbitrária do Walking.
  if(!walk)return null;
  const sample=neutralWalkTime(model,walk);
  const tracks=walk.tracks.map(track=>{
    const pose=Array.from(track.createInterpolant().evaluate(sample));
    return new track.constructor(track.name,[0,1],[...pose,...pose]);
  });
  return new THREE.AnimationClip(CHARACTER_CLIPS.idle,1,tracks);
}
export function makeCharacterAnimationState(model,clips){
  const mixer=new THREE.AnimationMixer(model);
  const all=[...clips];
  const idle=makeIdleClip(clips.find(c=>c.name==='Walking'),model);
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
  const ground=data.avatarGround;
  if(ground){
    const idle=animation.current===CHARACTER_CLIPS.idle;
    const standing=idle||animation.current===CHARACTER_CLIPS.wave;
    const locomotion=standing||[CHARACTER_CLIPS.walk,CHARACTER_CLIPS.run].includes(animation.current);
    if(locomotion){
      if(ground.lastClip!==animation.current){
        ground.lastClip=animation.current;
        ground.clipAge=0;
        ground.idleMeasured=false;
      }
      ground.clipAge+=Math.max(0,dt);
      root.updateMatrixWorld(true);
      // A altura do osso não coincide com a SOLA: descontar a altura
      // da articulação calibrada contra o menor ponto da malha na pose idle.
      let lowest=Infinity;
      for(const bone of ground.feet){
        bone.getWorldPosition(ground.temp);
        lowest=Math.min(lowest,ground.temp.y);
      }
      if(Number.isFinite(lowest)){
        const soleY=lowest-ground.boneToSole;
        ground.mount.position.y+=soleGroundCorrection(
          soleY,root.position.y+.018,dt,standing&&ground.clipAge>.2
        );
      }
      // Medição geométrica da sola na pose estabilizada; resolve os casos
      // em que o rig usa tornozelos muito acima do sapato.
      // Durante o movimento, evitar medir todos os vértices a cada frame.
      const exactIdle=standing&&!ground.idleMeasured&&ground.clipAge>=.23;
      const noFootSample=!ground.feet.length&&(ground.clipAge-ground.lastBoundAge>=.12);
      if(exactIdle||noFootSample){
        const bounds=ground.bounds.setFromObject(ground.mount,true);
        if(Number.isFinite(bounds.min.y)){
          const correction=root.position.y+.018-bounds.min.y;
          ground.mount.position.y+=standing?correction:Math.max(0,correction);
        }
        ground.idleMeasured=exactIdle||ground.idleMeasured;
        ground.lastBoundAge=ground.clipAge;
      }
      // Impede deriva vertical após sucessivas animações/transições,
      // mas deixa espaço para a movimentação dos joelhos na caminhada.
      ground.mount.position.y=THREE.MathUtils.clamp(
        ground.mount.position.y,ground.baseY-.75,ground.baseY+.75
      );
    }
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
  const animation=root.userData.avatarAnimation;
  // update(dt=0) com fadeIn(.17) não aplica a pose! Iniciar idle
  // imediatamente, com peso 1, ANTES de medir sola e altura real.
  const first=animation.actions[CHARACTER_CLIPS.idle]||
    animation.actions[Object.keys(animation.actions)[0]];
  if(first){
    first.reset().setEffectiveWeight(1).play();
    animation.current=Object.keys(animation.actions).find(k=>animation.actions[k]===first);
    animation.mixer.update(0);
  }
  root.updateMatrixWorld(true);
  const posedBounds=new THREE.Box3().setFromObject(mount,true);
  if(Number.isFinite(posedBounds.min.y))
    mount.position.y+=root.position.y+.018-posedBounds.min.y;
  const feet=[];
  model.traverse(node=>{
    if(node.isBone&&isFootContactBone(node.name))
      feet.push(node);
  });
  root.updateMatrixWorld(true);
  const temp=new THREE.Vector3();
  const lowest=feet.reduce((low,bone)=>{
    bone.getWorldPosition(temp);
    return Math.min(low,temp.y);
  },Infinity);
  root.userData.avatarGround={
    mount,feet,temp,bounds:new THREE.Box3(),
    boneToSole:Number.isFinite(lowest)?lowest-(root.position.y+.018):0,
    baseY:mount.position.y,clipAge:0,lastBoundAge:0,
    idleMeasured:false,lastClip:animation.current
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
