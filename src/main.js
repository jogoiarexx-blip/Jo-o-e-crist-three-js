import * as THREE from 'three';
import {buildWorld} from './world.js';
import {createRuralAudio} from './audio.js';
import {isBlocked} from './collision.js';
import {cameraRelativeMove,rotateCameraRight} from './controls.js';
import {isInsideHouse,FARM_HOUSE} from './farm-layout.js';
import {FARM_MEMORIES,nearbyMemory,normalizeMemories} from './farm-memories.js';
import {cameraRig} from './camera-logic.js';
import {createElder,animateElder,gestureElder} from './characters.js';
import {QUESTS,INTRO,SCENES,getQuest,validateSave,PACKING_ITEMS,nextPackingTarget,getPackingProgress,normalizePacking,LOTTERY_NUMBERS,canUsePackingItem,FINAL_STEP,SAVE_VERSION} from './story.js';

const el=id=>document.getElementById(id);
const ui={canvas:el('game'),loading:el('loading'),hud:el('hud'),mission:el('mission'),objective:el('objective'),
  hint:el('hint'),hero:el('hero'),distance:el('distance'),pointer:el('pointer'),prompt:el('prompt'),
  promptText:el('promptText'),toast:el('toast'),dialog:el('dialog'),speaker:el('dialogSpeaker'),
  dialogText:el('dialogText'),dialogCount:el('dialogCount'),start:el('startScreen'),
  pause:el('pauseScreen'),end:el('endScreen'),mobile:el('mobileControls'),
  event:el('eventPanel'),eventBar:el('eventBar'),debug:el('debug'),fatal:el('fatal'),fatalText:el('fatalText'),lottery:el('lotteryPanel'),lotteryButton:el('lotteryButton'),lotteryReveal:el('lotteryReveal'),soundBtn:el('soundBtn')};
const SAVE_KEY='joaoCrist3DSave_v1';
const MEMORY_KEY='joaoCrist3DFarmMemories_v1';
const DEBUG=new URLSearchParams(location.search).has('debug');
let renderer,scene,camera,world,actors,heroId='joao',step=0,packing=[],started=false,paused=false;
let yaw=1.12,pitch=.48,zoom=8.2,clockTime=0,lastFrame=0,toastTimer=0;
let dialogue=null,bikeEvent=null,lotteryOpen=false,lotteryStage=0,lotteryAccepted=false,prevPad={};
let playerVelocity=0,frameCounter=0,fpsStart=0,fps=0,audio=null;
const SOUND_KEY='joaoCrist3DSound_v1';
let soundEnabled=true;
try{soundEnabled=localStorage.getItem(SOUND_KEY)!=='off';}catch{}
const held=new Set(),stick={x:0,y:0,id:null};
let memories=new Set();
function readMemories(){
  try{return new Set(normalizeMemories(JSON.parse(localStorage.getItem(MEMORY_KEY)||'[]')));}
  catch{return new Set();}
}
function saveMemories(){
  try{localStorage.setItem(MEMORY_KEY,JSON.stringify([...memories]));}
  catch{notify('O navegador não conseguiu salvar as lembranças opcionais.');}
}
const clamp=(a,min,max)=>Math.max(min,Math.min(max,a));
const smooth=(current,target,dt,k)=>current+(target-current)*(1-Math.exp(-k*dt));
const tempForward=new THREE.Vector3(),tempMove=new THREE.Vector3();
const mobile=matchMedia('(pointer:coarse)').matches;
function readSave(){
  try{return validateSave(JSON.parse(localStorage.getItem(SAVE_KEY)||'null'));}
  catch{return validateSave(null);}
}
function writeSave(){
  try{localStorage.setItem(SAVE_KEY,JSON.stringify({version:SAVE_VERSION,step,hero:heroId,packing:normalizePacking(packing)}));}
  catch{notify('O navegador está bloqueando o salvamento local.');}
}
function notify(text){
  ui.toast.textContent=text;ui.toast.hidden=false;toastTimer=3.4;
}
function createAudio(){if(!audio)audio=createRuralAudio();audio.resume();audio.setEnabled(soundEnabled);}
function toggleSound(){
  soundEnabled=!soundEnabled;audio?.setEnabled(soundEnabled);
  ui.soundBtn.textContent=soundEnabled?'♪':'×';
  ui.soundBtn.setAttribute('aria-label',soundEnabled?'Desativar som':'Ativar som');
  ui.soundBtn.setAttribute('aria-pressed',String(soundEnabled));
  try{localStorage.setItem(SOUND_KEY,soundEnabled?'on':'off');}catch{}
}
function tone(freq=440,duration=.14,type='sine',volume=.04){audio?.play(freq,duration,type,volume);}
function winSound(){tone(392,.16,'triangle');setTimeout(()=>tone(494,.2,'triangle'),110);setTimeout(()=>tone(659,.4,'triangle'),230);}
function setHero(id,quiet=false){
  if(!actors||!actors[id])return;
  heroId=id;const other=id==='joao'?'crist':'joao';
  ui.hero.textContent=id==='joao'?'JOÃO':'CRIST';
  if(!quiet){tone(460,.09);notify('Agora você controla '+ui.hero.textContent+'.');writeSave();}
  actors[other].userData.isCompanion=true;actors[id].userData.isCompanion=false;
}
function activeTargetId(){
  return step===4?nextPackingTarget(packing):getQuest(step).id;
}
function updateMission(){
  const q=getQuest(step),target=activeTargetId();
  ui.objective.textContent=q.title;
  ui.hint.textContent=q.hint;
  if(step===4){
    const item=PACKING_ITEMS.find(candidate=>candidate.id===target);
    ui.objective.textContent='Arrume as malas — '+getPackingProgress(packing)+'/3';
    ui.hint.textContent=item?item.hint:'Itens reunidos! Troque para João e volte à mala dentro da casa.';
  }
  el('chapter').textContent=step>=7?'CAPÍTULO 02 · RODOVIÁRIA':'CAPÍTULO 01 · FAZENDA';
  ui.mission.hidden=step>=FINAL_STEP;
  world.setTarget(target);
  world.setPacked?.(packing);
  if(step>6)world.setGateOpen?.(true);
  if(step>=FINAL_STEP)ui.prompt.hidden=true;
}
function advanceTo(next){
  step=clamp(next,0,FINAL_STEP);writeSave();updateMission();
  if(step===FINAL_STEP){ui.end.hidden=false;ui.hud.hidden=true;ui.mobile.hidden=true;ui.mission.hidden=true;started=false;}
}
function showDialogue(lines,onFinish){
  if(!lines||!lines.length){onFinish?.();return;}
  dialogue={lines,index:0,finish:onFinish};ui.dialog.hidden=false;ui.prompt.hidden=true;
  displayDialogueLine();
}
function displayDialogueLine(){
  if(!dialogue)return;
  const line=dialogue.lines[dialogue.index];ui.speaker.textContent=line[0];ui.dialogText.textContent=line[1];
  ui.dialogCount.textContent=(dialogue.index+1)+' / '+dialogue.lines.length;tone(315,.065,'sine',.017);
  const who=line[0]==='JOÃO'?'joao':line[0]==='CRIST'?'crist':null;
  if(who&&actors?.[who]){
    const mood=/ganh|Vegas|consegu|rica|pr[oô]mio|viajante/i.test(line[1])?'celebrate':
      /Pantera|menina|lembran[cç]a/i.test(line[1])?'pet':
      /ué|uai|calma|como assim|pera[ií]/i.test(line[1])?'shrug':'talk';
    gestureElder(actors[who],mood,2.5);
  }
}
function nextDialogue(){
  if(!dialogue||paused)return;
  dialogue.index++;
  if(dialogue.index<dialogue.lines.length)displayDialogueLine();
  else{const cb=dialogue.finish;dialogue=null;ui.dialog.hidden=true;cb?.();}
}
function nearTarget(){
  if(!world||!actors||step>=FINAL_STEP)return null;
  const m=world.markers[activeTargetId()];if(!m)return null;
  return Math.hypot(actors[heroId].position.x-m.point.x,actors[heroId].position.z-m.point.z)<=m.radius?m:null;
}
function useTarget(){
  if(paused||!started)return;
  if(lotteryOpen){checkLottery();return;}
  if(dialogue){nextDialogue();return;}
  if(bikeEvent){dodge();return;}
  const target=nearTarget();
  if(!target){
    const extra=step<=6?nearbyMemory(actors[heroId].position,[...memories]):null;
    if(extra){
      memories.add(extra.id);saveMemories();
      tone(480,.13,'triangle',.028);
      showDialogue(extra.lines,()=>notify('Lembrança da Fazenda: '+memories.size+'/'+FARM_MEMORIES.length+'.'));
      return;
    }
    notify('Siga o marcador da missão ou explore a Fazenda em busca de histórias.');
    return;
  }
  if(step===7){startBike();return;}
  if(step===2&&!lotteryAccepted){openLottery();return;}
  if(step===4&&!canUsePackingItem(target.id,heroId)){
    const expected=target.id==='suitcase'?'JOÃO':target.id==='documents'||target.id==='clothes'?'CRIST':'JOÃO';
    notify('Essa tarefa é de '+expected+'. Use TAB ou TROCAR para alternar.');
    tone(220,.12,'triangle',.02);
    return;
  }
  if(step===4&&target.id!=='suitcase'){
    if(!packing.includes(target.id)){
      packing.push(target.id);
      world.setPacked?.(packing);
      writeSave();
      updateMission();
      tone(580,.14,'triangle',.033);
      const item=PACKING_ITEMS.find(entry=>entry.id===target.id);
      notify((item?.name||'Item')+' guardado! '+getPackingProgress(packing)+'/3');
      showDialogue(SCENES[target.id]);
    }
    return;
  }
  const activeStep=step;
  const scenes=[SCENES.wake,SCENES.radio,SCENES.ticket,SCENES.crist,SCENES.suitcase,SCENES.pantera,SCENES.gate,null,SCENES.bus];
  const lines=scenes[activeStep];
  if(!lines)return;
  if(activeStep===2)winSound();else tone(600,.13,'triangle',.03);
  if(activeStep===5){world.reactPantera?.(clockTime);tone(330,.12,'sawtooth',.027);}
  if(activeStep===6){world.openGate?.();tone(195,.27,'sawtooth',.023);}
  showDialogue(lines,()=>{
    if(activeStep===6){
      // Preserva a cidade e a viagem da versão anterior, depois de concluir a Fazenda.
      actors[heroId].position.set(49,0,9);
      const other=heroId==='joao'?'crist':'joao';
      actors[other].position.set(47,0,12);
      snapCamera();notify('Fase 1 concluída! Agora vocês seguem à rodoviária.');
    } else if(activeStep===8){
      world.bike.visible=false;
    }
    advanceTo(activeStep+1);
  });
}
function openLottery(){
  if(lotteryOpen||dialogue||paused)return;
  lotteryOpen=true;lotteryStage=0;
  ui.lottery.hidden=false;ui.lotteryReveal.hidden=true;
  ui.lotteryButton.textContent='CONFERIR RESULTADO';
  ui.prompt.hidden=true;ui.mobile.hidden=true;
  tone(420,.12,'triangle',.026);ui.lotteryButton.focus();
}
function checkLottery(){
  if(!lotteryOpen||paused)return;
  if(lotteryStage===0){
    lotteryStage=1;ui.lotteryReveal.hidden=false;
    ui.lotteryButton.textContent='COMEMORAR';
    tone(600,.19,'triangle',.045);ui.lotteryButton.focus();return;
  }
  lotteryOpen=false;ui.lottery.hidden=true;
  ui.mobile.hidden=paused||!mobile;lotteryAccepted=true;
  useTarget();
}
function startBike(){
  if(bikeEvent||dialogue)return;
  bikeEvent={time:0,length:2.5,evaded:false,ended:false};
  world.bike.visible=true;world.bike.position.set(68,0,-18);
  ui.event.hidden=false;ui.prompt.hidden=true;
  tone(900,.15,'square',.045);tone(1000,.19,'square',.02);
}
function dodge(){
  if(!bikeEvent||bikeEvent.ended)return;
  bikeEvent.evaded=true;finishBike();
}
function finishBike(){
  if(!bikeEvent||bikeEvent.ended)return;
  const good=bikeEvent.evaded;
  bikeEvent.ended=true;bikeEvent=null;ui.event.hidden=true;
  if(good){tone(700,.1,'triangle');notify('UFA! Desviou por pouco!');}
  else {tone(165,.35,'sawtooth',.04);notify('Quase virou notícia no jornal!');}
  showDialogue(good?SCENES.bikeOK:SCENES.bikeHit,()=>{world.bike.visible=false;advanceTo(8);});
}
function togglePause(){
  if(!started||ui.end.hidden===false)return;
  paused=!paused;ui.pause.hidden=!paused;ui.mobile.hidden=paused||!mobile;
  ui.prompt.hidden=true;
  if(paused)held.clear();
}
function restart(){
  try{localStorage.removeItem(SAVE_KEY);localStorage.removeItem(MEMORY_KEY);}catch{}
  location.reload();
}
function pollGamepadActions(){
  const pad=navigator.getGamepads?.()[0];if(!pad)return;
  const bindings=[[0,'act'],[1,'dodge'],[3,'switch'],[9,'pause']];
  for(const [i,name] of bindings){
    const down=!!pad.buttons[i]?.pressed;
    if(down&&!prevPad[name]){
      if(name==='pause')togglePause();
      else if(!paused){
        if(name==='act')useTarget();
        if(name==='dodge')dodge();
        if(name==='switch'&&!dialogue&&!bikeEvent)setHero(heroId==='joao'?'crist':'joao');
      }
    }
    prevPad[name]=down;
  }
}
function getInput(){
  let mx=0,my=0;
  if(held.has('KeyA')||held.has('ArrowLeft'))mx--;
  if(held.has('KeyD')||held.has('ArrowRight'))mx++;
  if(held.has('KeyW')||held.has('ArrowUp'))my++;
  if(held.has('KeyS')||held.has('ArrowDown'))my--;
  mx+=stick.x;my-=stick.y;
  const pad=navigator.getGamepads?.()[0];
  if(pad){
    if(Math.abs(pad.axes[0]||0)>.18)mx+=pad.axes[0];
    if(Math.abs(pad.axes[1]||0)>.18)my-=pad.axes[1];
    if(Math.abs(pad.axes[2]||0)>.20)yaw=rotateCameraRight(yaw,pad.axes[2]*5.4);
    if(Math.abs(pad.axes[3]||0)>.20)pitch=clamp(pitch+pad.axes[3]*.012,.1,1.1);
  }
  const len=Math.hypot(mx,my);
  if(len>1){mx/=len;my/=len;}
  return {x:mx,y:my,run:held.has('ShiftLeft')||held.has('ShiftRight')};
}
function blocked(x,z,r=.38,height=0){
  return isBlocked(x,z,r,height,world.colliders);
}
function move(entity,vx,vz,dt){
  const nx=entity.position.x+vx*dt,nz=entity.position.z+vz*dt;
  if(!blocked(nx,entity.position.z))entity.position.x=nx;
  if(!blocked(entity.position.x,nz))entity.position.z=nz;
}
function updateCompanion(dt){
  const me=actors[heroId],other=actors[heroId==='joao'?'crist':'joao'];
  const meInside=isInsideHouse(me.position.x,me.position.z);
  const companionInside=isInsideHouse(other.position.x,other.position.z);
  // Reagrupa na passagem, sem teletransportar durante a travessia próxima à porta.
  if(meInside!==companionInside){
    const px=FARM_HOUSE.doorX+(meInside?-.32:.36);
    const pz=FARM_HOUSE.doorZ+(meInside?-1.8:1.75);
    if(Math.hypot(me.position.x-px,me.position.z-pz)>2.7){
      other.position.set(px,0,pz);other.userData.moving=0;
    }
  }
  const dir=tempForward.set(Math.sin(me.rotation.y),0,Math.cos(me.rotation.y));
  const tx=me.position.x-dir.x*1.7+dir.z*.8;
  const tz=me.position.z-dir.z*1.7-dir.x*.8;
  const dx=tx-other.position.x,dz=tz-other.position.z,dist=Math.hypot(dx,dz);
  if(dist>15){other.position.set(tx,0,tz);other.userData.moving=0;return;}
  if(dist>.9){
    const s=Math.min(dist*2,4.2);
    move(other,dx/dist*s,dz/dist*s,dt);
    other.rotation.y=smoothAngle(other.rotation.y,Math.atan2(dx,dz),dt,5.5);
    other.userData.moving=s;
  }else other.userData.moving=0;
}
function smoothAngle(a,b,dt,k){
  const d=Math.atan2(Math.sin(b-a),Math.cos(b-a));
  return a+d*(1-Math.exp(-k*dt));
}
function snapCamera(){updateCamera(.016,true);}
function updateCamera(dt,immediate=false){
  const p=actors[heroId].position;
  const inside=isInsideHouse(p.x,p.z);
  const profile=cameraRig(inside,zoom,pitch);
  const forward=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));
  let dist=profile.distance;
  const focus=p.clone().add(new THREE.Vector3(0,1.35,0));
  // O teto desaparece no interior; encurtar a distância quando a câmera alcança uma parede.
  for(let i=1;i<=16;i++){
    const u=i/16;
    const cx=focus.x-forward.x*profile.distance*u;
    const cz=focus.z-forward.z*profile.distance*u;
    const cy=focus.y+profile.lift*u;
    if(blocked(cx,cz,.16,cy)){
      dist=Math.min(dist,Math.max(profile.minDistance,profile.distance*(i-1)/16));
      break;
    }
  }
  const wanted=focus.clone().addScaledVector(forward,-dist);
  wanted.y+=profile.lift;
  const look=focus.clone().addScaledVector(forward,profile.ahead);
  const close=dist<profile.distance-.01;
  camera.position.lerp(wanted,(immediate||close)?1:1-Math.exp(-dt*(inside?7.5:5.8)));
  camera.lookAt(look);
}
function update(dt){
  clockTime+=dt;
  if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)ui.toast.hidden=true;}
  if(!started)return;
  pollGamepadActions();
  if(paused)return;
  if(step<=6)audio?.update(dt);
  if(!dialogue&&!bikeEvent&&!lotteryOpen){
    const input=getInput();
    const heading=cameraRelativeMove(input.x,input.y,yaw);
    tempMove.set(heading.x,0,heading.z);
    const len=tempMove.length();
    if(len>.001){
      tempMove.multiplyScalar(1/Math.max(1,len));
      const speed=input.run?5.5:3.65;
      move(actors[heroId],tempMove.x*speed,tempMove.z*speed,dt);
      actors[heroId].rotation.y=smoothAngle(actors[heroId].rotation.y,Math.atan2(tempMove.x,tempMove.z),dt,11);
      playerVelocity=speed;
    }else playerVelocity=0;
    actors[heroId].userData.moving=playerVelocity;
    updateCompanion(dt);
  }else{actors[heroId].userData.moving=0;updateCompanion(dt);}
  for(const id of ['joao','crist'])animateElder(actors[id],dt,actors[id].userData.moving,clockTime);
  world.update(clockTime,actors[heroId].position);
  if(step===3){
    const other=actors[heroId==='joao'?'crist':'joao'];
    world.markers.crist.point.copy(other.position);
    world.markers.crist.holder.position.x=other.position.x;
    world.markers.crist.holder.position.z=other.position.z;
  }
  if(bikeEvent){
    bikeEvent.time+=dt;
    const t=bikeEvent.time/bikeEvent.length;
    world.bike.position.z=-18+t*38;
    world.bike.rotation.y=Math.sin(t*18)*.03;
    ui.eventBar.style.transform='scaleX('+clamp(1-t,0,1)+')';
    if(t>=1)finishBike();
  }else if(!dialogue&&!lotteryOpen){
    if(step===7&&nearTarget())startBike();
  }
  const marker=world.markers[activeTargetId()];
  if(marker&&step<FINAL_STEP){
    const pos=actors[heroId].position,distance=Math.hypot(pos.x-marker.point.x,pos.z-marker.point.z);
    ui.distance.textContent=Math.ceil(distance)+' METROS';
    const look=Math.atan2(marker.point.x-pos.x,marker.point.z-pos.z)-yaw;
    ui.pointer.style.transform='rotate('+(-look*180/Math.PI)+'deg)';
    const close=distance<=marker.radius;
    const extra=step<=6&&!close?nearbyMemory(pos,[...memories]):null;
    ui.prompt.hidden=(!close&&!extra)||!!dialogue||!!bikeEvent||lotteryOpen;
    ui.promptText.textContent=close?(step===7?'Atravesse com cuidado':marker.label):
      extra?'Conhecer: '+extra.name:'Interagir';
  }else ui.prompt.hidden=true;
  updateCamera(dt);
}
function render(now){
  requestAnimationFrame(render);
  const elapsed=lastFrame?Math.min(.05,(now-lastFrame)/1000):.016;lastFrame=now;
  update(elapsed);
  if(!started&&!paused&&world){clockTime+=elapsed;for(const id of ['joao','crist'])animateElder(actors[id],elapsed,0,clockTime);world.update(clockTime,actors[heroId].position);}
  renderer?.render(scene,camera);
  if(DEBUG){
    frameCounter++;
    if(now-fpsStart>1000){fps=frameCounter*1000/(now-fpsStart||1);fpsStart=now;frameCounter=0;}
    ui.debug.textContent='FPS: '+Math.round(fps)+' | PASSO: '+step+' | x:'+Math.round(actors[heroId].position.x)+' z:'+Math.round(actors[heroId].position.z);
  }
}
function start(){
  if(started)return;
  createAudio();el('startBtn').blur();
  const data=readSave();step=data.step;packing=normalizePacking(data.packing);
  memories=readMemories();
  if(step===FINAL_STEP){step=0;packing=[];writeSave();}
  const spawn=step===0?{x:-15.5,z:-14.65}:
    step===1?{x:-12,z:-10.5}:
    step===2?{x:-7.5,z:2.5}:
    step===4?{x:-12.2,z:-6.2}:
    step<=6?{x:-1.5,z:5}:
    step===7?{x:49,z:9}:{x:77,z:11};
  actors.joao.position.set(spawn.x,0,spawn.z);
  actors.crist.position.set(spawn.x+1.3,0,spawn.z+0.5);
  setHero(data.hero,true);started=true;paused=false;
  ui.start.hidden=true;ui.loading.hidden=true;ui.hud.hidden=false;ui.mobile.hidden=!mobile;
  updateMission();snapCamera();
  if(step===0)showDialogue(INTRO,()=>notify('Caminhe até o café dentro da casa para começar o dia.'));
  else notify('Progresso recuperado: '+getQuest(step).title);
  ui.soundBtn.textContent=soundEnabled?'♪':'×';
  ui.soundBtn.setAttribute('aria-label',soundEnabled?'Desativar som':'Ativar som');
  ui.soundBtn.setAttribute('aria-pressed',String(soundEnabled));
}
function bindInputs(){
  const actionKeys=new Set(['Space','Tab','ArrowUp','ArrowDown','ArrowLeft','ArrowRight']);
  window.addEventListener('keydown',e=>{
    if(actionKeys.has(e.code)||(lotteryOpen&&e.code==='Enter'))e.preventDefault();
    held.add(e.code);
    if(e.repeat)return;
    if(e.code==='Escape'){togglePause();return;}
    if(!started||paused)return;
    if(e.code==='Tab'&&!dialogue&&!bikeEvent){setHero(heroId==='joao'?'crist':'joao');return;}
    if(e.code==='KeyE'||e.code==='Enter'){useTarget();return;}
    if(e.code==='Space'){dodge();}
  });
  window.addEventListener('keyup',e=>held.delete(e.code));
  window.addEventListener('blur',()=>{held.clear();stick.x=stick.y=0;if(started&&!paused)togglePause();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){held.clear();stick.x=stick.y=0;if(started&&!paused)togglePause();}});
  ui.dialog.addEventListener('click',()=>{if(!paused)nextDialogue();});
  el('startBtn').addEventListener('click',start);
  ui.soundBtn.addEventListener('click',toggleSound);
  ui.lotteryButton.addEventListener('click',checkLottery);
  el('pauseBtn').addEventListener('click',togglePause);
  el('resumeBtn').addEventListener('click',togglePause);
  el('restartBtn').addEventListener('click',restart);
  el('replayBtn').addEventListener('click',restart);
  el('touchAction').addEventListener('pointerdown',e=>{e.preventDefault();useTarget();});
  el('touchSwitch').addEventListener('pointerdown',e=>{e.preventDefault();if(started&&!dialogue&&!bikeEvent)setHero(heroId==='joao'?'crist':'joao');});
  el('touchDodge').addEventListener('pointerdown',e=>{e.preventDefault();dodge();});
  let cameraPointer=null,lastX=0,lastY=0;
  ui.canvas.addEventListener('pointerdown',e=>{if(!started||paused||dialogue||lotteryOpen)return;cameraPointer=e.pointerId;lastX=e.clientX;lastY=e.clientY;ui.canvas.setPointerCapture(e.pointerId);});
  ui.canvas.addEventListener('pointermove',e=>{
    if(e.pointerId!==cameraPointer)return;
    const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;
    yaw=rotateCameraRight(yaw,dx);pitch=clamp(pitch+dy*.004,.1,1.1);
  });
  const resetCameraPointer=e=>{if(e.pointerId===cameraPointer)cameraPointer=null;};
  ui.canvas.addEventListener('pointerup',resetCameraPointer);
  ui.canvas.addEventListener('pointercancel',resetCameraPointer);
  ui.canvas.addEventListener('wheel',e=>{zoom=clamp(zoom+Math.sign(e.deltaY)*.8,5.2,12);e.preventDefault();},{passive:false});
  const pad=el('joystick'),thumb=el('joystickThumb');
  const padMove=e=>{
    if(stick.id!==e.pointerId)return;
    const r=pad.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
    let dx=e.clientX-cx,dy=e.clientY-cy;
    const max=r.width*.36,l=Math.hypot(dx,dy);
    if(l>max){dx=dx/l*max;dy=dy/l*max;}
    stick.x=dx/max;stick.y=dy/max;
    thumb.style.transform='translate(calc(-50% + '+dx+'px),calc(-50% + '+dy+'px))';
    e.preventDefault();
  };
  pad.addEventListener('pointerdown',e=>{if(stick.id!==null)return;stick.id=e.pointerId;pad.setPointerCapture(e.pointerId);padMove(e);});
  pad.addEventListener('pointermove',padMove);
  const padEnd=e=>{if(stick.id!==e.pointerId)return;stick.id=null;stick.x=stick.y=0;thumb.style.transform='translate(-50%,-50%)';};
  pad.addEventListener('pointerup',padEnd);pad.addEventListener('pointercancel',padEnd);
  window.addEventListener('resize',onResize);
}
function onResize(){
  if(!renderer||!camera)return;
  const w=window.innerWidth,h=window.innerHeight;
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
}
function fatal(error){
  console.error('[João & Crist 3D]',error);
  ui.loading.hidden=true;ui.start.hidden=true;
  ui.fatal.hidden=false;ui.fatalText.textContent=String(error?.message||error);
}
function setup(){
  renderer=new THREE.WebGLRenderer({canvas:ui.canvas,antialias:!mobile,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile?1.3:1.8));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.16;
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(64,innerWidth/innerHeight,.1,240);
  world=buildWorld(scene);
  actors={joao:createElder('joao'),crist:createElder('crist')};
  actors.joao.position.set(-1.5,0,5);actors.crist.position.set(1.5,0,3);
  actors.joao.rotation.y=actors.crist.rotation.y=1.1;
  scene.add(actors.joao,actors.crist);
  for(const id of ['lotteryTicket','lotteryResult']){
    const target=el(id);
    for(const n of LOTTERY_NUMBERS){
      const token=document.createElement('span');
      token.textContent=String(n).padStart(2,'0');target.appendChild(token);
    }
  }
  setHero('joao',true);world.setTarget('wake');
  onResize();bindInputs();snapCamera();
  ui.loading.hidden=true;ui.debug.hidden=!DEBUG;
  ui.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();fatal(new Error('O contexto WebGL foi perdido. Recarregue a página para continuar.'));});
  requestAnimationFrame(render);
}
try{setup();}catch(err){fatal(err);}
