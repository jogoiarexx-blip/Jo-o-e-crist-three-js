import * as THREE from 'three';
import {buildWorld} from './world.js';
import {createRuralAudio} from './audio.js';
import {isBlocked} from './collision.js';
import {cameraRelativeMove,rotateCameraRight} from './controls.js';
import {isInsideHouse,FARM_HOUSE} from './farm-layout.js';
import {FARM_MEMORIES,nearbyMemory,normalizeMemories} from './farm-memories.js';
import {cameraRig} from './camera-logic.js';
import {cameraClearanceDistance} from './camera-occlusion.js';
import {nextChapterToPrewarm} from './chapter-prewarm.js';
import {easeVelocity,moveWithCollision,joystickYaw} from './locomotion.js';
import {CITY_CHOICES,findCityNpc,checkCityAnswer} from './city-state.js';
import {BUS_START,BUS_SPAWN,BUS_CHOICES,BUS_SCENES,RHYTHM_SEQUENCE,RHYTHM_LABELS,RHYTHM_OPTIONS,checkBusAnswer,normalizeRhythmProgress,inputRhythm,findBusNpc} from './bus-state.js';
import {AIRPORT_START,AIRPORT_SPAWN,AIRPORT_CHOICES,AIRPORT_SCENES,checkAirportAnswer,findAirportNpc,airportRushResult} from './airport-state.js';
import {ROAD_START,ROAD_CENTER,ROAD_SPAWN,ROAD_CHOICES,ROAD_SCENES,ROAD_DRIVES,checkRoadAnswer,findRoadNpc,initialRoadRun,normalizeRoadRun,advanceRoadRun,roadGrade} from './road-state.js';
import {DESERT_START,DESERT_SPAWN,DESERT_CHOICES,DESERT_SCENES,checkDesertAnswer,findDesertNpc,isDesertShade,advanceDesertHeat,desertHeatLabel,desertCarryActive} from './desert-state.js';
import {canUseObjective} from './interaction-anchors.js';
import {findChapterTransition,chapterTransitionAt,chapterEntryPosition} from './chapter-transitions.js';
import {createElder,animateElder,gestureElder} from './characters.js';
import {canSwitchHero,isCompletedSave,shouldSimulateWorld} from './game-state.js';
import {loadAllCharacterGlbs} from './avatar-glb.js';
import {QUESTS,INTRO,SCENES,getQuest,validateSave,PACKING_ITEMS,nextPackingTarget,getPackingProgress,normalizePacking,LOTTERY_NUMBERS,canUsePackingItem,FINAL_STEP,SAVE_VERSION} from './story.js';

const el=id=>document.getElementById(id);
const ui={canvas:el('game'),loading:el('loading'),hud:el('hud'),mission:el('mission'),objective:el('objective'),
  hint:el('hint'),hero:el('hero'),distance:el('distance'),pointer:el('pointer'),prompt:el('prompt'),
  promptText:el('promptText'),toast:el('toast'),dialog:el('dialog'),speaker:el('dialogSpeaker'),
  dialogText:el('dialogText'),dialogCount:el('dialogCount'),start:el('startScreen'),
  pause:el('pauseScreen'),end:el('endScreen'),mobile:el('mobileControls'),
  event:el('eventPanel'),eventBar:el('eventBar'),debug:el('debug'),fatal:el('fatal'),fatalText:el('fatalText'),lottery:el('lotteryPanel'),lotteryButton:el('lotteryButton'),lotteryReveal:el('lotteryReveal'),soundBtn:el('soundBtn'),choice:el('cityChoice'),choiceHeading:el('cityChoiceHeading'),choiceText:el('cityChoiceText'),choiceButtons:el('cityChoiceButtons'),roadHud:el('roadHud'),roadProgress:el('roadProgress'),roadHits:el('roadHits'),roadHeading:el('roadHeading'),roadDistance:el('roadDistance'),desertHud:el('desertHud'),desertHeatBar:el('desertHeatBar'),desertHeatLabel:el('desertHeatLabel')};
const SAVE_KEY='joaoCrist3DSave_v1';
const MEMORY_KEY='joaoCrist3DFarmMemories_v1';
const BUS_RHYTHM_KEY='joaoCrist3DBusRhythm_v1';
const ROAD_RUN_KEY='joaoCrist3DRoadRun_v1';
const DEBUG=new URLSearchParams(location.search).has('debug');
let renderer,scene,camera,world,actors,heroId='joao',step=0,packing=[],started=false,paused=false;
let yaw=1.12,pitch=.48,zoom=8.2,clockTime=0,lastFrame=0,toastTimer=0;
let dialogue=null,bikeEvent=null,lotteryOpen=false,lotteryStage=0,lotteryAccepted=false,prevPad={};
let choiceKind=null,choiceIndex=0,rhythmProgress=0,airportRush=null,roadRun=null,lastRoadSave=0,desertHeat=0,lastHeatWarning=0;
function readRoadRun(stage){
  try{return normalizeRoadRun(JSON.parse(localStorage.getItem(ROAD_RUN_KEY)||'null'),stage);}
  catch{return initialRoadRun(stage);}
}
function writeRoadRun(){
  if(!roadRun)return;
  try{localStorage.setItem(ROAD_RUN_KEY,JSON.stringify(roadRun));}catch{}
}
function clearRoadRun(){
  try{localStorage.removeItem(ROAD_RUN_KEY);}catch{}
}
function readRhythm(){try{return normalizeRhythmProgress(JSON.parse(localStorage.getItem(BUS_RHYTHM_KEY)||'0'));}catch{return 0;}}
function saveRhythm(){try{localStorage.setItem(BUS_RHYTHM_KEY,JSON.stringify(rhythmProgress));}catch{notify('Não foi possível salvar o progresso da dança.');}}
function puzzleDefinition(kind){
  if(kind==='rhythm')return {
    heading:'NÚMERO MUSICAL · '+(rhythmProgress+1)+' / '+RHYTHM_SEQUENCE.length,
    text:'Sequência: PALMAS, PASSO, GIRO, PALMAS. Próximo movimento: '+RHYTHM_LABELS[RHYTHM_SEQUENCE[rhythmProgress]]+'.',
    options:RHYTHM_OPTIONS
  };
  return CITY_CHOICES[kind]||BUS_CHOICES[kind]||AIRPORT_CHOICES[kind]||ROAD_CHOICES[kind]||DESERT_CHOICES[kind]||null;
}
let playerVelocity=0,frameCounter=0,fpsStart=0,fps=0,audio=null,lastIdleRender=0;
const prewarmPending=new Set();
let walking={x:0,z:0},lastStepSound=0;
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
function heroSwitchAllowed(){
  return canSwitchHero({
    started,paused,dialogue,bikeEvent,airportRush,roadRun,choiceKind,lotteryOpen,
    completed:isCompletedSave(step,FINAL_STEP)
  });
}
function switchHero(){
  if(!heroSwitchAllowed())return false;
  setHero(heroId==='joao'?'crist':'joao');
  return true;
}
function resetMovementInput(){
  held.clear();
  walking={x:0,z:0};
  stick.x=stick.y=0;
  stick.id=null;
  const thumb=el('joystickThumb');
  if(thumb)thumb.style.transform='translate(-50%,-50%)';
}
function setHero(id,quiet=false){
  if(!actors||!actors[id])return;
  heroId=id;const other=id==='joao'?'crist':'joao';
  ui.hero.textContent=id==='joao'?'JOÃO':'CRIST';
  if(!quiet){tone(460,.09);notify('Agora você controla '+ui.hero.textContent+'.');writeSave();}
  actors[other].userData.isCompanion=true;actors[id].userData.isCompanion=false;
  walking={x:0,z:0};
}
// Antecipar o próximo cenário quando o navegador estiver ocioso,
 // mantendo a transição livre da construção síncrona quando possível.
function scheduleChapterPrewarm(){
  const id=nextChapterToPrewarm(step);
  if(!id||!world||prewarmPending.has(id)||world.loadedChapters().includes(id))return;
  prewarmPending.add(id);
  const build=()=>{
    prewarmPending.delete(id);
    if(!world||!started||paused||world.loadedChapters().includes(id))return;
    try{
      const t=performance.now();
      world.prepareChapter(id);
      if(DEBUG)console.info('[Cenário preparado]',id,Math.round(performance.now()-t)+'ms');
    }catch(error){console.warn('[Pré-carregamento]',id,error);}
  };
  if(typeof requestIdleCallback==='function')requestIdleCallback(build,{timeout:3500});
  else setTimeout(build,120);
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
  el('chapter').textContent=step>=DESERT_START?'CAPÍTULO 05 · O DESERTO NÃO PERDOA':step>=ROAD_START?'CAPÍTULO 04 · ROUTE 66':step>=AIRPORT_START?'CAPÍTULO 03 · AEROPORTO':step>=BUS_START?'CAPÍTULO 02 · EXCURSÃO ERRADA':step>=7?'CAPÍTULO 01 · RODOVIÁRIA':'CAPÍTULO 00 · FAZENDA';
  if(step===17)ui.hint.textContent='Faça PALMAS, PASSO, GIRO, PALMAS. Ritmo: '+rhythmProgress+'/4. Vá ao centro do corredor.';
  ui.mission.hidden=step>=FINAL_STEP;
  world.setChapter?.(step);
  // João recupera o chapéu somente ao entrar no ônibus (step 12).
  if(actors?.joao?.userData?.hat)actors.joao.userData.hat.visible=step!==11;
  world.setTarget(target);
  world.setPacked?.(packing);
  world.setSoundFixed?.(step>=17);
  world.setShowActive?.(step===17);
  for(const id of ['joao','crist'])if(actors?.[id])actors[id].userData.dance=step===17;
  world.road?.setDriving?.(!!roadRun);
  ui.desertHud.hidden=step<DESERT_START||step>=FINAL_STEP;
  world.desert?.setCarrier?.(actors?.joao?.position);
  audio?.setBusActive?.(step>=BUS_START&&step<AIRPORT_START&&!paused);
  audio?.setRoadActive?.(!!roadRun&&!paused);
  if(step>6)world.setGateOpen?.(true);
  if(step>=FINAL_STEP)ui.prompt.hidden=true;
  scheduleChapterPrewarm();
}
function advanceTo(next){
  const previous=step;
  const destination=clamp(next,0,FINAL_STEP);
  const transition=findChapterTransition(previous,destination);
  step=destination;
  if(step===17&&previous!==17){rhythmProgress=0;saveRhythm();}
  if(transition){
    const positions=chapterEntryPosition(transition,heroId);
    for(const id of ['joao','crist'])
      actors[id].position.set(positions[id].x,0,positions[id].z);
    yaw=transition.camera.yaw;
    zoom=transition.camera.zoom;
    walking={x:0,z:0};
    playerVelocity=0;
    // New chapter begins only after both elders are safely in the new hub.
    if(step===DESERT_START)desertHeat=0;
  }
  writeSave();
  updateMission();
  if(transition){
    snapCamera();
    notify(transition.message);
    showDialogue(transition.lines);
  }
  if(step===29||step===33)beginRoadDrive();
  if(step===FINAL_STEP){
    ui.end.hidden=false;ui.hud.hidden=true;ui.mobile.hidden=true;
    ui.mission.hidden=true;started=false;
  }
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
      /chapéu|volta cá|corre atrás/i.test(line[1])?'reach':
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
  return canUseObjective(m,actors[heroId].position,world.colliders,step)?m:null;
}
function useTarget(){
  if(paused||!started)return;
  if(roadRun)return;
  if(choiceKind)return;
  if(lotteryOpen){checkLottery();return;}
  if(dialogue){nextDialogue();return;}
  if(bikeEvent||airportRush){dodge();return;}
  const target=nearTarget();
  if(!target){
    const extra=step<=6?nearbyMemory(actors[heroId].position,[...memories]):null;
    if(extra){
      memories.add(extra.id);saveMemories();
      tone(480,.13,'triangle',.028);
      showDialogue(extra.lines,()=>notify('Lembrança da Fazenda: '+memories.size+'/'+FARM_MEMORIES.length+'.'));
      return;
    }
    if(step>=DESERT_START&&step<FINAL_STEP){
      const npc=findDesertNpc(actors[heroId].position);
      if(npc){showDialogue(npc.lines);return;}
      notify('Explore o posto, procure água, sombra e o mecânico.');
    }else if(step>=ROAD_START&&step<DESERT_START){
      const npc=findRoadNpc(actors[heroId].position);
      if(npc){showDialogue(npc.lines);return;}
      notify('Explore a estrada e procure a placa, a lanchonete ou a oficina.');
    }else if(step>=AIRPORT_START&&step<ROAD_START){
      const npc=findAirportNpc(actors[heroId].position);
      if(npc){showDialogue(npc.lines);return;}
      notify('Siga o marcador do aeroporto ou converse com os atendentes.');
    }else if(step>=BUS_START&&step<AIRPORT_START){
      const npc=findBusNpc(actors[heroId].position);
      if(npc){showDialogue(npc.lines);return;}
      notify('Siga o marcador do corredor ou converse com a trupe.');
    }else if(step>=7&&step<BUS_START){
      const npc=findCityNpc(actors[heroId].position);
      if(npc){showDialogue(npc.lines);return;}
      notify('Siga o marcador ou converse com os moradores da rodoviária.');
    }else notify('Siga o marcador da missão ou explore a Fazenda em busca de histórias.');
    return;
  }
  if(step===35&&heroId!=='joao'){notify('João precisa investigar a van. Use TAB ou TROCAR.');return;}
  if(step===38&&heroId!=='crist'){notify('Crist deve ler o aviso da água. Use TAB ou TROCAR.');return;}
  if(step===38){openCityChoice('desertWater');return;}
  if(step===39&&heroId!=='joao'){notify('João deve encher o galão. Use TAB ou TROCAR.');return;}
  if(step===40&&heroId!=='joao'){notify('João está levando o galão até a van. Use TAB ou TROCAR.');return;}
  if(step===42&&heroId!=='joao'){notify('João escolhe a peça da mangueira. Use TAB ou TROCAR.');return;}
  if(step===42){openCityChoice('desertHose');return;}
  if(step===43&&heroId!=='joao'){notify('João termina a revisão com o motor frio. Use TAB ou TROCAR.');return;}
  if(step===43){openCityChoice('desertCool');return;}
  if(step===44&&heroId!=='crist'){notify('Crist precisa conferir as placas. Use TAB ou TROCAR.');return;}
  if(step===44){openCityChoice('desertSigns');return;}
  if(step===28&&heroId!=='crist'){notify('Crist deve ler o mapa da estrada. Use TAB ou TROCAR.');return;}
  if(step===28){openCityChoice('roadRoute');return;}
  if(step===32&&heroId!=='joao'){notify('João precisa revisar a van com o motor frio. Use TAB ou TROCAR.');return;}
  if(step===32){openCityChoice('roadRepair');return;}
  if(step===20&&heroId!=='crist'){notify('Crist deve ler a passagem e encontrar o check-in. Use TAB/TROCAR.');return;}
  if(step===20){openCityChoice('checkin');return;}
  if(step===21&&heroId!=='crist'){notify('Crist precisa procurar o passaporte de João. Use TAB/TROCAR.');return;}
  if(step===21){openCityChoice('passport');return;}
  if(step===22&&heroId!=='joao'){notify('João deve apresentar a bagagem e a farofa. Use TAB/TROCAR.');return;}
  if(step===22){openCityChoice('farofa');return;}
  if(step===23&&heroId!=='crist'){notify('Crist organiza os objetos para o detector. Use TAB/TROCAR.');return;}
  if(step===23){openCityChoice('security');return;}
  if(step===24&&heroId!=='crist'){notify('Crist precisa confirmar o novo portão. Use TAB/TROCAR.');return;}
  if(step===24){openCityChoice('gate');return;}
  if(step===25){startAirportRush();return;}
  if(step===14&&heroId!=='joao'){notify('João precisa procurar a caixa. Use TAB ou TROCAR.');return;}
  if(step===14){openCityChoice('case');return;}
  if(step===15&&heroId!=='crist'){notify('Crist deve identificar o cabo. Use TAB ou TROCAR.');return;}
  if(step===15){openCityChoice('inspect');return;}
  if(step===16&&heroId!=='joao'){notify('João deve reconectar o cabo. Use TAB ou TROCAR.');return;}
  if(step===16){openCityChoice('connect');return;}
  if(step===17){openCityChoice('rhythm');return;}
  if(step===8){startBike();return;}
  if(step===9){
    if(heroId!=='crist'){notify('Crist precisa conferir o comprovante da mala. Use TAB ou TROCAR.');return;}
    openCityChoice('bag');return;
  }
  if(step===10){
    if(heroId!=='crist'){notify('Crist precisa ler a passagem e escolher o portão. Use TAB ou TROCAR.');return;}
    openCityChoice('route');return;
  }
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
  const scenes=[SCENES.wake,SCENES.radio,SCENES.ticket,SCENES.crist,SCENES.suitcase,SCENES.pantera,SCENES.gate,SCENES.cityWelcome,null,null,null,SCENES.bus,BUS_SCENES.seat,BUS_SCENES.crew,null,null,null,null,BUS_SCENES.reveal,AIRPORT_SCENES.welcome,null,null,null,null,null,null,AIRPORT_SCENES.board,ROAD_SCENES.welcome,null,null,ROAD_SCENES.stop,ROAD_SCENES.photo,null,null,ROAD_SCENES.breakdown,DESERT_SCENES.arrival,DESERT_SCENES.shade,DESERT_SCENES.can,null,DESERT_SCENES.fill,DESERT_SCENES.carry,DESERT_SCENES.mechanic,null,null,null,DESERT_SCENES.lookout];
  const lines=scenes[activeStep];
  if(!lines)return;
  if(activeStep===2)winSound();else tone(600,.13,'triangle',.03);
  if(activeStep===5){world.reactPantera?.(clockTime,actors[heroId].position);audio?.bark?.();}
  if(activeStep===6){world.openGate?.();tone(195,.27,'sawtooth',.023);}
  showDialogue(lines,()=>{
    if(activeStep===11)world.bike.visible=false;
    // QA-03: entrada, dupla e câmera são aplicadas somente em advanceTo.
    advanceTo(activeStep+1);
  });
}

function beginRoadDrive(){
  if(step!==29&&step!==33)return;
  roadRun=readRoadRun(step)||initialRoadRun(step);
  if(!roadRun)return;
  world.road.setDriving(true);
  world.road.setDrive(roadRun);
  world.setTarget(null);
  audio?.setRoadActive?.(true);
  actors.joao.visible=false;actors.crist.visible=false;
  ui.roadHud.hidden=false;ui.prompt.hidden=true;
  ui.roadHeading.textContent=step===29?'ROUTE 66 · TRECHO 1':'ROUTE 66 · DESVIOS DO DESERTO';
  lastRoadSave=clockTime;
  updateRoadHud();
  notify('Dirija com A/D, SETAS, analógico ou controle de toque. Desvie dos obstáculos!');
  snapCamera();
}
function updateRoadHud(){
  if(!roadRun)return;
  const total=ROAD_DRIVES[roadRun.stage].length;
  ui.roadProgress.style.transform='scaleX('+clamp(roadRun.progress/total,0,1)+')';
  ui.roadHits.textContent=roadRun.hits+' ENCONTROS COM OBSTÁCULOS';
  ui.roadDistance.textContent=Math.ceil(total-roadRun.progress)+' m RESTANTES';
}
function finishRoadDrive(){
  if(!roadRun)return;
  const finished=roadRun;
  roadRun=null;clearRoadRun();
  audio?.setRoadActive?.(false);
  ui.roadHud.hidden=true;
  world.road.setDriving(false);
  actors.joao.visible=true;actors.crist.visible=true;
  const destination=finished.stage===29?{x:-35,z:30}:{x:-20,z:25};
  actors[heroId].position.set(destination.x,0,destination.z);
  const other=heroId==='joao'?'crist':'joao';
  actors[other].position.set(destination.x+.8,0,destination.z-1.15);
  walking={x:0,z:0};
  notify('Trecho concluído: '+roadGrade(finished.hits)+'.');
  const lines=finished.stage===29?ROAD_SCENES.drive1:ROAD_SCENES.drive2;
  showDialogue(lines,()=>advanceTo(finished.stage+1));
  snapCamera();
}
function updateRoadDrive(dt){
  const steer=getInput(dt).x;
  const result=advanceRoadRun(roadRun,steer,dt);
  if(!result.state)return;
  roadRun=result.state;
  world.road.setDrive(roadRun);
  updateRoadHud();
  if(result.hit){
    tone(172,.13,'sawtooth',.029);
    notify('Cuidado! O obstáculo balançou a van. Dá para continuar!');
  }
  if(clockTime-lastRoadSave>1.6){writeRoadRun();lastRoadSave=clockTime;}
  if(result.completed)finishRoadDrive();
}
function openCityChoice(kind){
  const puzzle=puzzleDefinition(kind);
  if(!puzzle||dialogue||lotteryOpen||choiceKind||paused)return;
  choiceKind=kind;choiceIndex=0;
  ui.choice.querySelector('.eyebrow').textContent=kind in DESERT_CHOICES?'CAPÍTULO 05 · DESERTO':kind in ROAD_CHOICES?'CAPÍTULO 04 · ROUTE 66':kind==='rhythm'?'CAPÍTULO 02 · APRESENTAÇÃO':kind in AIRPORT_CHOICES?'CAPÍTULO 03 · AEROPORTO':kind in BUS_CHOICES?'CAPÍTULO 02 · EXCURSÃO ERRADA':'CAPÍTULO 01 · RODOVIÁRIA';
  ui.choiceHeading.textContent=puzzle.heading;
  ui.choiceText.textContent=puzzle.text;
  ui.choiceButtons.replaceChildren();
  for(let i=0;i<puzzle.options.length;i++){
    const option=puzzle.options[i],btn=document.createElement('button');
    btn.type='button';btn.className='city-choice-button';
    btn.textContent=(i+1)+'. '+option.label;
    btn.addEventListener('click',()=>submitCityChoice(option.id));
    ui.choiceButtons.appendChild(btn);
  }
  ui.choice.hidden=false;ui.mobile.hidden=true;ui.prompt.hidden=true;
  focusCityChoice(0);
}
function focusCityChoice(index){
  if(!choiceKind)return;
  const items=[...ui.choiceButtons.children];
  if(!items.length)return;
  choiceIndex=(index+items.length)%items.length;
  items.forEach((button,i)=>button.setAttribute('aria-selected',String(i===choiceIndex)));
  items[choiceIndex].focus();
}
function submitCityChoice(optionId){
  if(paused||!started||!choiceKind)return;
  const kind=choiceKind;
  if(kind==='rhythm'){
    const result=inputRhythm(rhythmProgress,optionId);
    if(!result.correct){
      tone(180,.16,'square',.025);
      notify('Quase! Próximo movimento: '+RHYTHM_LABELS[RHYTHM_SEQUENCE[rhythmProgress]]+'. Tente outra vez.');
      return;
    }
    rhythmProgress=result.progress;
    tone([392,494,587,784][result.progress-1],.17,'triangle',.035);
    if(result.complete){
      choiceKind=null;ui.choice.hidden=true;ui.mobile.hidden=paused||!mobile;
      try{localStorage.removeItem(BUS_RHYTHM_KEY);}catch{}
      rhythmProgress=0;showDialogue(BUS_SCENES.dance,()=>advanceTo(18));
    }else{
      saveRhythm();
      const puzzle=puzzleDefinition('rhythm');
      ui.choiceHeading.textContent=puzzle.heading;ui.choiceText.textContent=puzzle.text;
      ui.hint.textContent='Acertou! '+rhythmProgress+'/4. Próximo movimento: '+RHYTHM_LABELS[RHYTHM_SEQUENCE[rhythmProgress]];
    }
    return;
  }
  const correct=kind in DESERT_CHOICES?checkDesertAnswer(kind,optionId):kind in ROAD_CHOICES?checkRoadAnswer(kind,optionId):kind in CITY_CHOICES?checkCityAnswer(kind,optionId):kind in BUS_CHOICES?checkBusAnswer(kind,optionId):checkAirportAnswer(kind,optionId);
  choiceKind=null;ui.choice.hidden=true;ui.mobile.hidden=paused||!mobile;
  if(correct){
    tone(640,.2,'triangle',.033);
    const completed={
      bag:{lines:SCENES.bagSolved,next:10},route:{lines:SCENES.routeSolved,next:11},
      case:{lines:BUS_SCENES.case,next:15},inspect:{lines:BUS_SCENES.inspect,next:16},
      connect:{lines:BUS_SCENES.connect,next:17},
      checkin:{lines:AIRPORT_SCENES.checkin,next:21},passport:{lines:AIRPORT_SCENES.passport,next:22},
      farofa:{lines:AIRPORT_SCENES.farofa,next:23},security:{lines:AIRPORT_SCENES.security,next:24},
      gate:{lines:AIRPORT_SCENES.gate,next:25},roadRoute:{lines:ROAD_SCENES.route,next:29},roadRepair:{lines:ROAD_SCENES.repair,next:33},
      desertWater:{lines:DESERT_SCENES.water,next:39},
      desertHose:{lines:DESERT_SCENES.hose,next:43},
      desertCool:{lines:DESERT_SCENES.cool,next:44},
      desertSigns:{lines:DESERT_SCENES.signs,next:45}
    };
    const event=completed[kind];
    if(event)showDialogue(event.lines,()=>advanceTo(event.next));
  }else{
    tone(194,.15,'square',.022);
    const wrong={bag:SCENES.bagWrong,route:SCENES.routeWrong,case:BUS_SCENES.caseWrong,
      inspect:BUS_SCENES.inspectWrong,connect:BUS_SCENES.connectWrong,
      checkin:AIRPORT_SCENES.wrong,passport:AIRPORT_SCENES.wrong,farofa:AIRPORT_SCENES.wrong,
      security:AIRPORT_SCENES.wrong,gate:AIRPORT_SCENES.wrong,roadRoute:ROAD_SCENES.wrong,roadRepair:ROAD_SCENES.wrong,desertWater:DESERT_SCENES.wrong,desertHose:DESERT_SCENES.wrong,desertCool:DESERT_SCENES.wrong,desertSigns:DESERT_SCENES.wrong};
    if(wrong[kind])showDialogue(wrong[kind]);
  }
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
function startAirportRush(){
  if(airportRush||paused||dialogue)return;
  airportRush={time:0,length:4.1,reacted:false};
  ui.event.querySelector('.event-label').textContent='AEROPORTO · ESTEIRA ROLANTE';
  ui.event.querySelector('.event-title').textContent='CUIDADO, JOÃO!';
  ui.event.querySelector('.event-sub').textContent='Pressione ESPAÇO / ESQUIVAR / AÇÃO antes que ele tropece!';
  ui.eventBar.style.transform='scaleX(1)';
  ui.event.hidden=false;ui.prompt.hidden=true;
  tone(750,.14,'square',.032);
}
function finishAirportRush(reacted){
  if(!airportRush)return;
  airportRush=null;ui.event.hidden=true;
  const key=airportRushResult(reacted);
  tone(reacted?710:220,.22,'triangle',.032);
  showDialogue(AIRPORT_SCENES[key],()=>advanceTo(26));
}
function startBike(){
  if(bikeEvent||dialogue)return;
  bikeEvent={time:0,length:2.5,evaded:false,ended:false};
  world.bike.visible=true;world.bike.position.set(68,0,-18);
  ui.event.querySelector('.event-label').textContent='CUIDADO!';
  ui.event.querySelector('.event-title').textContent='UMA BICICLETA!';
  ui.event.querySelector('.event-sub').textContent='Pressione ESPAÇO ou o botão ESQUIVAR!';
  ui.event.hidden=false;ui.prompt.hidden=true;
  tone(900,.15,'square',.045);tone(1000,.19,'square',.02);
}
function dodge(){
  if(airportRush){finishAirportRush(true);return;}
  if(!bikeEvent||bikeEvent.ended)return;
  bikeEvent.evaded=true;finishBike();
}
function finishBike(){
  if(!bikeEvent||bikeEvent.ended)return;
  const good=bikeEvent.evaded;
  bikeEvent.ended=true;bikeEvent=null;ui.event.hidden=true;
  if(good){tone(700,.1,'triangle');notify('UFA! Desviou por pouco!');}
  else {tone(165,.35,'sawtooth',.04);notify('Quase virou notícia no jornal!');}
  showDialogue(good?SCENES.bikeOK:SCENES.bikeHit,()=>{world.bike.visible=false;advanceTo(9);});
}
function togglePause(){
  if(!started||ui.end.hidden===false)return;
  paused=!paused;ui.pause.hidden=!paused;ui.mobile.hidden=paused||!!choiceKind||lotteryOpen||!mobile;
  audio?.setBusActive?.(step>=BUS_START&&step<AIRPORT_START&&!paused);
  audio?.setRoadActive?.(!!roadRun&&!paused);
  ui.prompt.hidden=true;
  if(paused){resetMovementInput();if(roadRun)writeRoadRun();}
  else scheduleChapterPrewarm();
}
function restart(){
  try{localStorage.removeItem(SAVE_KEY);localStorage.removeItem(MEMORY_KEY);localStorage.removeItem(BUS_RHYTHM_KEY);localStorage.removeItem(ROAD_RUN_KEY);}catch{}
  location.reload();
}
function pollGamepadActions(){
  const pad=navigator.getGamepads?.()[0];
  if(!pad){prevPad={};return;}
  const bindings=[[0,'act'],[1,'dodge'],[3,'switch'],[9,'pause']];
  for(const [i,name] of bindings){
    const down=!!pad.buttons[i]?.pressed;
    if(down&&!prevPad[name]){
      if(name==='pause')togglePause();
      else if(!paused&&choiceKind){
        if(name==='act')submitCityChoice(puzzleDefinition(choiceKind).options[choiceIndex].id);
        if(name==='switch')focusCityChoice(choiceIndex+1);
      }
      else if(!paused){
        if(name==='act')useTarget();
        if(name==='dodge')dodge();
        if(name==='switch')switchHero();
      }
    }
    prevPad[name]=down;
  }
}
function getInput(dt){
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
    if(Math.abs(pad.axes[2]||0)>.20)yaw=joystickYaw(yaw,pad.axes[2],dt);
    if(Math.abs(pad.axes[3]||0)>.20)pitch=clamp(pitch+pad.axes[3]*dt*.72,.1,1.1);
  }
  const len=Math.hypot(mx,my);
  if(len>1){mx/=len;my/=len;}
  return {x:mx,y:my,run:held.has('ShiftLeft')||held.has('ShiftRight')};
}
function blocked(x,z,r=.38,height=0){
  return isBlocked(x,z,r,height,world.colliders);
}
function move(entity,vx,vz,dt){
  const m=moveWithCollision(entity.position,{x:vx,z:vz},dt,world.colliders);
  entity.position.x=m.x;entity.position.z=m.z;
  return m;
}
function updateCompanion(dt){
  const me=actors[heroId],other=actors[heroId==='joao'?'crist':'joao'];
  const meInside=isInsideHouse(me.position.x,me.position.z);
  const companionInside=isInsideHouse(other.position.x,other.position.z);
  const forward=tempForward.set(Math.sin(me.rotation.y),0,Math.cos(me.rotation.y));
  let tx=me.position.x-forward.x*1.7+forward.z*.8;
  let tz=me.position.z-forward.z*1.7-forward.x*.8;
  if(meInside!==companionInside){
    // Passar primeiro pela lateral correta da porta, depois atravessar o vão.
    const nearDoorX=FARM_HOUSE.doorX;
    const nearDoorZ=companionInside?-9.42:-7.55;
    const doorwayDist=Math.hypot(other.position.x-nearDoorX,other.position.z-nearDoorZ);
    tx=nearDoorX;
    tz=doorwayDist>.68?nearDoorZ:(companionInside?-7.46:-9.55);
  }
  const dx=tx-other.position.x,dz=tz-other.position.z,dist=Math.hypot(dx,dz);
  if(dist>16&&meInside===companionInside&&!blocked(tx,tz,.38)){
    other.position.set(tx,0,tz);other.userData.moving=0;return;
  }
  if(dist>.78){
    const desiredSpeed=Math.min(4.15,dist*2.3);
    const movement=move(other,dx/dist*desiredSpeed,dz/dist*desiredSpeed,dt);
    other.userData.moving=movement.speed;
    if(movement.speed>.035){
      other.rotation.y=smoothAngle(other.rotation.y,Math.atan2(movement.dx,movement.dz),dt,6.5);
    }
  }else other.userData.moving=0;
}
function smoothAngle(a,b,dt,k){
  const d=Math.atan2(Math.sin(b-a),Math.cos(b-a));
  return a+d*(1-Math.exp(-k*dt));
}
function snapCamera(){updateCamera(.016,true);}
function updateCamera(dt,immediate=false){
  const p=actors[heroId].position;
  if(roadRun){
    const vehicle=world.road.van.position;
    const desired=new THREE.Vector3(vehicle.x,5.2,vehicle.z+9.3);
    camera.position.lerp(desired,immediate?1:1-Math.exp(-dt*4.5));
    camera.lookAt(vehicle.x,1.1,vehicle.z-5.5);
    return;
  }
  const inside=isInsideHouse(p.x,p.z)||(step>=BUS_START&&step<ROAD_START);
  const profile=cameraRig(inside,zoom,pitch);
  const forward=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));
  const focus=p.clone().add(new THREE.Vector3(0,1.35,0));
  // Não impor distância mínima se houver uma parede mais perto que ela.
  const dist=cameraClearanceDistance(focus,yaw,profile.distance,profile.lift,blocked);
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
  if(step<=6||(step>=BUS_START&&step<AIRPORT_START))audio?.update(dt);
  if(step>=DESERT_START&&step<FINAL_STEP){
    const pos=actors[heroId].position;
    const shade=isDesertShade(pos.x,pos.z);
    desertHeat=advanceDesertHeat(desertHeat,shade,dt);
    ui.desertHeatBar.style.transform='scaleX('+(desertHeat/85)+')';
    ui.desertHeatLabel.textContent=(shade?'SOMBRA · ':'SOL · ')+desertHeatLabel(desertHeat);
    if(desertHeat>65&&clockTime-lastHeatWarning>17){
      notify('Calor forte! A cobertura do posto oferece sombra para descansar.');
      lastHeatWarning=clockTime;
    }
    world.desert?.setCarrier?.(actors.joao.position);
  }
  if(roadRun){
    updateRoadDrive(dt);
    playerVelocity=0;
    actors[heroId].userData.moving=0;
    actors[heroId==='joao'?'crist':'joao'].userData.moving=0;
  }else if(!dialogue&&!bikeEvent&&!airportRush&&!lotteryOpen&&!choiceKind){
    const input=getInput(dt);
    const heading=cameraRelativeMove(input.x,input.y,yaw);
    const targetSpeed=input.run?5.25:3.45;
    const desired={x:heading.x*targetSpeed,z:heading.z*targetSpeed};
    walking=easeVelocity(walking,desired,dt,input.x||input.y?12:18);
    const movement=move(actors[heroId],walking.x,walking.z,dt);
    if(movement.blockedX)walking.x=0;
    if(movement.blockedZ)walking.z=0;
    playerVelocity=movement.speed;
    if(playerVelocity>.12){
      actors[heroId].rotation.y=smoothAngle(actors[heroId].rotation.y,Math.atan2(movement.dx,movement.dz),dt,11);
      const interval=input.run?.30:.44;
      if(clockTime-lastStepSound>interval){
        lastStepSound=clockTime;
        audio?.footstep?.(step>=BUS_START||isInsideHouse(actors[heroId].position.x,actors[heroId].position.z));
      }
    }
    actors[heroId].userData.moving=playerVelocity;
    updateCompanion(dt);
  }else{
    walking={x:0,z:0};playerVelocity=0;
    actors[heroId].userData.moving=0;
    updateCompanion(dt);
  }
  for(const id of ['joao','crist'])animateElder(actors[id],dt,actors[id].userData.moving,clockTime);
  world.update(clockTime,actors[heroId].position,step,dt);
  if(step===3){
    const other=actors[heroId==='joao'?'crist':'joao'];
    world.markers.crist.point.copy(other.position);
    world.markers.crist.holder.position.x=other.position.x;
    world.markers.crist.holder.position.z=other.position.z;
  }
  if(airportRush){
    airportRush.time+=dt;
    ui.eventBar.style.transform='scaleX('+clamp(1-airportRush.time/airportRush.length,0,1)+')';
    if(airportRush.time>=airportRush.length)finishAirportRush(false);
  }
  if(bikeEvent){
    bikeEvent.time+=dt;
    const t=bikeEvent.time/bikeEvent.length;
    world.bike.position.z=-18+t*38;
    world.bike.rotation.y=Math.sin(t*18)*.03;
    ui.eventBar.style.transform='scaleX('+clamp(1-t,0,1)+')';
    if(t>=1)finishBike();
  }else if(!dialogue&&!lotteryOpen){
    if(step===8&&nearTarget())startBike();
  }
  const marker=world.markers[activeTargetId()];
  if(marker&&step<FINAL_STEP){
    const pos=actors[heroId].position,distance=Math.hypot(pos.x-marker.point.x,pos.z-marker.point.z);
    ui.distance.textContent=Math.ceil(distance)+' METROS';
    const look=Math.atan2(marker.point.x-pos.x,marker.point.z-pos.z)-yaw;
    ui.pointer.style.transform='rotate('+(-look*180/Math.PI)+'deg)';
    const close=canUseObjective(marker,pos,world.colliders,step);
    const extra=step<=6&&!close?nearbyMemory(pos,[...memories]):null;
    const cityNpc=step>=7&&step<BUS_START&&!close?findCityNpc(pos):null;
    const busNpc=step>=BUS_START&&step<AIRPORT_START&&!close?findBusNpc(pos):null;
    const airportNpc=step>=AIRPORT_START&&step<ROAD_START&&!close?findAirportNpc(pos):null;
    const roadNpc=step>=ROAD_START&&step<DESERT_START&&!close?findRoadNpc(pos):null;
    const desertNpc=step>=DESERT_START&&!close?findDesertNpc(pos):null;
    ui.prompt.hidden=(!close&&!extra&&!cityNpc&&!busNpc&&!airportNpc&&!roadNpc&&!desertNpc)||!!dialogue||!!bikeEvent||!!airportRush||lotteryOpen||!!choiceKind||!!roadRun;
    ui.promptText.textContent=close?(step===8?'Atravesse com cuidado':marker.label):
      extra?'Conhecer: '+extra.name:cityNpc?'Conversar: '+cityNpc.name:busNpc?'Conversar: '+busNpc.name:airportNpc?'Conversar: '+airportNpc.name:roadNpc?'Conversar: '+roadNpc.name:desertNpc?'Conversar: '+desertNpc.name:'Interagir';
  }else ui.prompt.hidden=true;
  updateCamera(dt);
}
function render(now){
  requestAnimationFrame(render);
  const elapsed=lastFrame?Math.min(.05,(now-lastFrame)/1000):.016;lastFrame=now;
  update(elapsed);
  // Sem partida ou pausado: nenhuma simulação e até 10 desenhos/s para poupar GPU.
  // Mantém um desenho ocasional para atualizar a tela, inclusive após carregar GLB.
  if(!shouldSimulateWorld(started,paused) && now-lastIdleRender<100)return;
  if(!shouldSimulateWorld(started,paused))lastIdleRender=now;
  renderer?.render(scene,camera);
  if(DEBUG){
    frameCounter++;
    if(now-fpsStart>1000){fps=frameCounter*1000/(now-fpsStart||1);fpsStart=now;frameCounter=0;}
    const loaded=world.loadedChapters().join(',')||'fazenda/cidade';
    ui.debug.textContent='FPS: '+Math.round(fps)+' | PASSO: '+step+' | x:'+Math.round(actors[heroId].position.x)+' z:'+Math.round(actors[heroId].position.z)+' | Hubs: '+loaded+' | Draw calls: '+renderer.info.render.calls;
  }
}
function start(){
  if(started)return;
  createAudio();el('startBtn').blur();
  const data=readSave();step=data.step;packing=normalizePacking(data.packing);
  memories=readMemories();rhythmProgress=step===17?readRhythm():0;
  // A conclusão atual do Deserto é um checkpoint, não autorização para apagar o save.
  // O reinício completo só é realizado pelo botão explícito JOGAR NOVAMENTE.
  const chapterEntry=chapterTransitionAt(step);
  const spawn=chapterEntry?.spawn||(step===0?{x:-15.5,z:-14.65}:
    step===1?{x:-12,z:-10.5}:
    step===2?{x:-7.5,z:2.5}:
    step===4?{x:-12.2,z:-6.2}:
    step<=6?{x:-1.5,z:5}:
    step===7?{x:49,z:21}:
    step===8?{x:62,z:19.2}:
    step===9?{x:79,z:2.7}:
    step===10?{x:71,z:2.0}:
    step===11?{x:91,z:2.5}:
    step>=DESERT_START?(step===35?{x:DESERT_SPAWN.x,z:DESERT_SPAWN.z}:step===36?{x:-68,z:-17.8}:step===37?{x:-72,z:-19.2}:step===38?{x:-76.3,z:-5.5}:step===39?{x:-68.3,z:-4.0}:step===40?{x:-68,z:-4.0}:step===41?{x:-52,z:-15}:step>=44?{x:-54,z:-4}:{x:-60.1,z:-13}):
    step>=ROAD_START?(step===30?{x:-35,z:30}:step===31?{x:-22,z:34}:step===32?{x:-20,z:25}:step===34?{x:-20,z:25}:{x:ROAD_SPAWN.x,z:ROAD_SPAWN.z}):
    step>=AIRPORT_START?{x:AIRPORT_SPAWN.x,z:AIRPORT_SPAWN.z}:{x:BUS_SPAWN.x,z:BUS_SPAWN.z});
  actors.joao.position.set(spawn.x,0,spawn.z);
  actors.crist.position.set(spawn.x+(step>=BUS_START?.85:1.3),0,spawn.z+(step>=BUS_START?-1.2:.5));
  if(chapterEntry){
    const positions=chapterEntryPosition(chapterEntry,data.hero);
    for(const id of ['joao','crist'])
      actors[id].position.set(positions[id].x,0,positions[id].z);
  }
  setHero(data.hero,true);started=true;paused=false;
  if(chapterEntry){yaw=chapterEntry.camera.yaw;zoom=chapterEntry.camera.zoom;}
  else if(step>=DESERT_START){yaw=1.18;zoom=7.3;}
  else if(step>=ROAD_START){yaw=1.25;zoom=8.0;}
  else if(step>=AIRPORT_START){yaw=1.45;zoom=7.2;}
  else if(step>=BUS_START){yaw=1.4;zoom=6.4;}
  walking={x:0,z:0};
  ui.start.hidden=true;ui.loading.hidden=true;ui.hud.hidden=false;ui.mobile.hidden=!mobile;
  updateMission();if(step===29||step===33)beginRoadDrive();snapCamera();
  if(isCompletedSave(step,FINAL_STEP)){
    ui.end.hidden=false;
    ui.hud.hidden=true;ui.mobile.hidden=true;ui.mission.hidden=true;ui.prompt.hidden=true;
    started=false;
    return;
  }
  if(step===0)showDialogue(INTRO,()=>notify('Caminhe até o café dentro da casa para começar o dia.'));
  else if(step===7)notify('Bem-vindos à cidade! Procure o painel de informações da praça.');
  else if(step===BUS_START)notify('Vocês estão dentro da Excursão Estelar. Encontre um lugar no corredor.');
  else if(step===AIRPORT_START)notify('Aeroporto Boa Sorte: confiram o painel e sigam até o check-in.');
  else if(step===ROAD_START)notify('Route 66: procure a placa da estrada e o mapa.');
  else if(step===DESERT_START)notify('O Deserto Não Perdoa: a van precisa de conserto.');
  else notify('Progresso recuperado: '+getQuest(step).title);
  ui.soundBtn.textContent=soundEnabled?'♪':'×';
  ui.soundBtn.setAttribute('aria-label',soundEnabled?'Desativar som':'Ativar som');
  ui.soundBtn.setAttribute('aria-pressed',String(soundEnabled));
}
function bindInputs(){
  const actionKeys=new Set(['Space','Tab','ArrowUp','ArrowDown','ArrowLeft','ArrowRight']);
  window.addEventListener('keydown',e=>{
    if(actionKeys.has(e.code)||(lotteryOpen&&e.code==='Enter')||(choiceKind&&['Enter','KeyE','Digit1','Digit2','Digit3'].includes(e.code)))e.preventDefault();
    held.add(e.code);
    if(e.repeat)return;
    if(e.code==='Escape'){togglePause();return;}
    if(choiceKind&&!paused){
      const numbers={Digit1:0,Digit2:1,Digit3:2};
      if(Object.hasOwn(numbers,e.code)){
        submitCityChoice(puzzleDefinition(choiceKind).options[numbers[e.code]].id);return;
      }
      if(e.code==='ArrowRight'||e.code==='ArrowDown'||e.code==='Tab'){focusCityChoice(choiceIndex+1);return;}
      if(e.code==='ArrowLeft'||e.code==='ArrowUp'){focusCityChoice(choiceIndex-1);return;}
      if(e.code==='KeyE'||e.code==='Enter'||e.code==='Space'){submitCityChoice(puzzleDefinition(choiceKind).options[choiceIndex].id);return;}
      return;
    }
    if(!started||paused)return;
    if(e.code==='Tab'){switchHero();return;}
    if(e.code==='KeyE'||e.code==='Enter'){useTarget();return;}
    if(e.code==='Space'){dodge();}
  });
  window.addEventListener('keyup',e=>held.delete(e.code));
  window.addEventListener('blur',()=>{resetMovementInput();prevPad={};if(started&&!paused)togglePause();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){resetMovementInput();prevPad={};if(started&&!paused)togglePause();}});
  ui.dialog.addEventListener('click',()=>{if(!paused)nextDialogue();});
  el('startBtn').addEventListener('click',start);
  ui.soundBtn.addEventListener('click',toggleSound);
  ui.lotteryButton.addEventListener('click',checkLottery);
  el('pauseBtn').addEventListener('click',togglePause);
  el('resumeBtn').addEventListener('click',togglePause);
  el('restartBtn').addEventListener('click',restart);
  el('replayBtn').addEventListener('click',restart);
  el('touchAction').addEventListener('pointerdown',e=>{e.preventDefault();useTarget();});
  el('touchSwitch').addEventListener('pointerdown',e=>{e.preventDefault();switchHero();});
  el('touchDodge').addEventListener('pointerdown',e=>{e.preventDefault();dodge();});
  let cameraPointer=null,lastX=0,lastY=0;
  ui.canvas.addEventListener('pointerdown',e=>{if(!started||paused||dialogue||lotteryOpen||roadRun)return;cameraPointer=e.pointerId;lastX=e.clientX;lastY=e.clientY;ui.canvas.setPointerCapture(e.pointerId);});
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
  // GLBs carregam de forma assíncrona e substituem os placeholders in-place:
  // o estado, a posição, o raio de colisão e a câmera continuam no mesmo root.
  loadAllCharacterGlbs(actors,{
    onLoaded:result=>console.info('[Avatares GLB]',result.id,result.clips.join(', ')),
    onError:(id,error)=>console.warn('[Avatares GLB] '+id+' indisponível; fallback procedural mantido:',error)
  });
  for(const id of ['lotteryTicket','lotteryResult']){
    const target=el(id);
    for(const n of LOTTERY_NUMBERS){
      const token=document.createElement('span');
      token.textContent=String(n).padStart(2,'0');target.appendChild(token);
    }
  }
  setHero('joao',true);world.setTarget('wake');
  const savedProgress=readSave();
  el('startBtn').textContent=isCompletedSave(savedProgress.step,FINAL_STEP)?'REVER CONCLUSÃO DO DESERTO':
    savedProgress.step>0?'CONTINUAR A AVENTURA':'COMEÇAR A AVENTURA';
  onResize();bindInputs();snapCamera();
  ui.loading.hidden=true;ui.debug.hidden=!DEBUG;
  ui.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();fatal(new Error('O contexto WebGL foi perdido. Recarregue a página para continuar.'));});
  requestAnimationFrame(render);
}
try{setup();}catch(err){fatal(err);}
