// v0.7.0 — Diretor de câmera (lógica pura, sem THREE): perfis por ambiente,
// acompanhamento automático por trás do herói, enquadramento de diálogo e
// tremor. main.js aplica estes valores ao PerspectiveCamera.
import {BUS_START} from './bus-state.js';
import {AIRPORT_START} from './airport-state.js';
import {ROAD_START} from './road-state.js';

const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export const wrapAngle=a=>Math.atan2(Math.sin(a),Math.cos(a));
// Aproximação exponencial independente de FPS para ângulos.
export function dampAngle(current,target,dt,rate){
  if(!Number.isFinite(current))return target;
  if(!Number.isFinite(target)||!Number.isFinite(dt)||dt<=0)return current;
  return current+wrapAngle(target-current)*(1-Math.exp(-rate*dt));
}
export function damp(current,target,dt,rate){
  if(!Number.isFinite(current))return target;
  if(!Number.isFinite(target)||!Number.isFinite(dt)||dt<=0)return current;
  return current+(target-current)*(1-Math.exp(-rate*dt));
}

export function environmentKind(step,insideHouse=false){
  const n=Number.isFinite(step)?step:0;
  if(n>=BUS_START&&n<AIRPORT_START)return 'bus';
  if(n>=AIRPORT_START&&n<ROAD_START)return 'airport';
  if(insideHouse)return 'house';
  return 'outdoor';
}
// distance: recuo; lift: altura acima do foco; ahead: olhar à frente;
// fov: abertura; follow: força do acompanhamento automático.
export function cameraProfile(kind,zoom,pitch){
  const z=Number.isFinite(zoom)?clamp(zoom,3,13):8.2;
  const p=Number.isFinite(pitch)?clamp(pitch,.05,1.1):.36;
  switch(kind){
    case 'house':return {kind,distance:Math.min(z,5.2),lift:1.15+p*1.9,ahead:.9,fov:66,follow:.8,focusHeight:1.4};
    // Corredor estreito: câmera baixa, ombro do herói, lente mais aberta.
    case 'bus':return {kind,distance:Math.min(z,4.6),lift:.85+p*1.35,ahead:1.3,fov:70,follow:1.15,focusHeight:1.45};
    case 'airport':return {kind,distance:Math.min(z,7.2),lift:1.3+p*3.1,ahead:1.6,fov:62,follow:.9,focusHeight:1.4};
    default:return {kind:'outdoor',distance:z,lift:1.5+p*4.6,ahead:1.8,fov:58,follow:.85,focusHeight:1.35};
  }
}
// Gira a câmera para trás do herói apenas quando o jogador anda para a frente
// e não mexeu na câmera recentemente. Movimento lateral reduz o efeito,
// evitando que segurar A/D faça a câmera "orbitar" sem fim.
export function autoFollowYaw(cameraYaw,heroHeading,{speed=0,inputX=0,inputY=0,sinceManual=99,dt=0,strength=.85,enabled=true}={}){
  if(!enabled||!Number.isFinite(heroHeading)||!(dt>0))return cameraYaw;
  if(sinceManual<1.6||speed<.9||inputY<.25)return cameraYaw;
  const lateral=clamp(Math.abs(inputX),0,1);
  const rate=strength*clamp(speed/5,0,1.1)*(1-lateral*.85);
  // Não vira mais que ~100° de uma vez: andar em direção à câmera não a inverte.
  if(Math.abs(wrapAngle(heroHeading-cameraYaw))>1.75)return cameraYaw;
  return dampAngle(cameraYaw,heroHeading,dt,rate);
}
// Plano de conversa: câmera perpendicular à linha entre os dois personagens,
// do lado mais próximo da câmera atual, um pouco mais baixa e fechada.
export function dialogueShot(a,b,currentYaw,kind='outdoor'){
  if(!a||!b||![a.x,a.z,b.x,b.z].every(Number.isFinite))return null;
  const dx=b.x-a.x,dz=b.z-a.z,separation=Math.hypot(dx,dz);
  if(separation<.3||separation>7)return null;
  const line=Math.atan2(dx,dz);
  const options=[line+Math.PI/2,line-Math.PI/2];
  const yaw=Math.abs(wrapAngle(options[0]-currentYaw))<=Math.abs(wrapAngle(options[1]-currentYaw))?options[0]:options[1];
  // Leve rotação para não ficar perfeitamente de perfil (plano "três quartos").
  const tilt=.32*Math.sign(wrapAngle(currentYaw-yaw)||1);
  const tight=kind==='bus'||kind==='house';
  return {
    yaw:wrapAngle(yaw+tilt),
    focus:{x:(a.x+b.x)/2,z:(a.z+b.z)/2},
    distance:clamp((tight?2.9:3.6)+separation*.62,tight?2.9:3.6,tight?4.4:6.4),
    lift:tight?.55:.8,focusHeight:1.55,ahead:0,fov:tight?58:48
  };
}
// Tremor procedural suave (soma de senos); amount 0..1.
export function shakeOffset(time,amount){
  const a=clamp(Number.isFinite(amount)?amount:0,0,1)*.22;
  if(a===0||!Number.isFinite(time))return {x:0,y:0,z:0};
  return {
    x:(Math.sin(time*37.1)+Math.sin(time*23.7)*.6)*a,
    y:(Math.sin(time*41.3+1.7)+Math.sin(time*19.1)*.5)*a*.8,
    z:(Math.sin(time*29.9+.4))*a*.6
  };
}
// Lente: corrida abre alguns graus para transmitir velocidade.
export function gameplayFov(baseFov,speed){
  const s=Number.isFinite(speed)?speed:0;
  // Caminhada (3,45) mantém a lente; corrida (5,25) abre 5°.
  return baseFov+clamp((s-3.45)/1.8,0,1)*5;
}
