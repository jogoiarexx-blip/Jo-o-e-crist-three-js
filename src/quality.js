// v0.7.0 — Perfil gráfico e resolução dinâmica (lógica pura).
export const QUALITY_PRESETS=Object.freeze({
  low:Object.freeze({id:'low',shadowMap:1024,shadowRange:16,maxPixelRatio:1.0,minPixelRatio:.6,antialias:false,scenery:.45,shadows:true}),
  medium:Object.freeze({id:'medium',shadowMap:1024,shadowRange:20,maxPixelRatio:1.35,minPixelRatio:.75,antialias:false,scenery:.75,shadows:true}),
  high:Object.freeze({id:'high',shadowMap:2048,shadowRange:24,maxPixelRatio:1.8,minPixelRatio:1.0,antialias:true,scenery:1,shadows:true})
});

// Escolhe o perfil inicial: ?q=low|medium|high tem prioridade; celular começa em
// médio (ou baixo em aparelhos com poucos núcleos); desktop começa em alto.
export function pickQuality({mobile=false,cores=4,override=null}={}){
  if(override&&Object.hasOwn(QUALITY_PRESETS,override))return QUALITY_PRESETS[override];
  if(mobile)return Number.isFinite(cores)&&cores<=4?QUALITY_PRESETS.low:QUALITY_PRESETS.medium;
  return Number.isFinite(cores)&&cores<=2?QUALITY_PRESETS.medium:QUALITY_PRESETS.high;
}

// Resolução dinâmica: mede a média de FPS em janelas de ~2 s; reduz a escala
// quando o jogo fica abaixo de 45 FPS e recupera aos poucos acima de 57.
export function createResolutionGovernor(preset,devicePixelRatio=1){
  const dpr=Number.isFinite(devicePixelRatio)&&devicePixelRatio>0?devicePixelRatio:1;
  const max=Math.min(dpr,preset.maxPixelRatio);
  const min=Math.min(max,preset.minPixelRatio);
  return {ratio:max,min,max,frames:0,time:0};
}
export function stepResolution(state,dt,{window=2,low=45,high=57,down=.85,up=1.06}={}){
  if(!state||!Number.isFinite(dt)||dt<=0)return {state,changed:false};
  // Quadros muito longos (aba em segundo plano, carregamento) não contam.
  if(dt>.25)return {state:{...state,frames:0,time:0},changed:false};
  const frames=state.frames+1,time=state.time+dt;
  if(time<window)return {state:{...state,frames,time},changed:false};
  const fps=frames/time;
  let ratio=state.ratio;
  if(fps<low)ratio=Math.max(state.min,ratio*down);
  else if(fps>high)ratio=Math.min(state.max,ratio*up);
  ratio=Math.round(ratio*100)/100;
  return {state:{...state,ratio,frames:0,time:0,fps},changed:ratio!==state.ratio};
}
