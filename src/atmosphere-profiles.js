// v0.7.0 — Atmosfera por capítulo (lógica pura, testável sem WebGL).
// Cada capítulo ganha luz, céu, neblina e exposição próprios; trocar de capítulo
// mistura os perfis em vez de cortar a iluminação de uma vez.
export const ATMOSPHERES=Object.freeze({
  // Manhã na roça: céu limpo, horizonte quente, sol baixo vindo do leste.
  farm:Object.freeze({zenith:'#5f9fd6',horizon:'#f4dcae',ground:'#93a86d',fog:'#d8dfc4',fogNear:42,fogFar:165,
    sun:'#ffe4b8',sunIntensity:2.75,sunDir:Object.freeze([-.52,.62,.36]),hemiSky:'#f5ead0',hemiGround:'#6f8a5c',hemiIntensity:1.85,exposure:1.12,glow:.55}),
  // Meio-dia na praça da rodoviária: luz mais branca e neutra.
  city:Object.freeze({zenith:'#4f95d4',horizon:'#e7e7d6',ground:'#a2a58b',fog:'#d5dfd8',fogNear:45,fogFar:170,
    sun:'#fff3dd',sunIntensity:2.9,sunDir:Object.freeze([-.35,.82,.30]),hemiSky:'#f2f2e6',hemiGround:'#7d8a6c',hemiIntensity:1.95,exposure:1.1,glow:.35}),
  // Excursão: fim de tarde dourado entrando pelas janelas do ônibus.
  bus:Object.freeze({zenith:'#3f5c93',horizon:'#f3a66a',ground:'#6b7451',fog:'#e1a77a',fogNear:30,fogFar:140,
    sun:'#ffb978',sunIntensity:2.2,sunDir:Object.freeze([.70,.32,-.62]),hemiSky:'#ffd9b0',hemiGround:'#4e4a52',hemiIntensity:1.55,exposure:1.08,glow:.9}),
  // Aeroporto: dia claro e frio, vidro e piso brilhante.
  airport:Object.freeze({zenith:'#5ea6de',horizon:'#e3eef0',ground:'#8f9a98',fog:'#d6e4e8',fogNear:55,fogFar:220,
    sun:'#f6f8ff',sunIntensity:2.6,sunDir:Object.freeze([-.25,.85,.45]),hemiSky:'#eef4f7',hemiGround:'#7f8c8c',hemiIntensity:2.0,exposure:1.06,glow:.25}),
  // Route 66: tarde dourada americana, horizonte largo.
  road:Object.freeze({zenith:'#4e8fcc',horizon:'#f7cf96',ground:'#c9a56c',fog:'#ecd2a3',fogNear:55,fogFar:230,
    sun:'#ffd9a2',sunIntensity:2.9,sunDir:Object.freeze([.55,.48,-.68]),hemiSky:'#fde7c4',hemiGround:'#9a7a52',hemiIntensity:1.75,exposure:1.1,glow:.75}),
  // Deserto: sol a pino, ar quente e claro.
  desert:Object.freeze({zenith:'#5c9fd8',horizon:'#f6dfb0',ground:'#d7b580',fog:'#f0dcb2',fogNear:50,fogFar:210,
    sun:'#fff0cf',sunIntensity:3.15,sunDir:Object.freeze([-.2,.9,.38]),hemiSky:'#fff1d8',hemiGround:'#b08a5a',hemiIntensity:1.9,exposure:1.08,glow:.45}),
  // Mirante: pôr do sol e o brilho de Las Vegas no horizonte.
  dusk:Object.freeze({zenith:'#26305e',horizon:'#f29a62',ground:'#6e4b3f',fog:'#b98272',fogNear:45,fogFar:210,
    sun:'#ffb07a',sunIntensity:1.85,sunDir:Object.freeze([.12,.15,.98]),hemiSky:'#d6b0c0',hemiGround:'#4a3c44',hemiIntensity:1.35,exposure:1.15,glow:1.0})
});

// Capítulo → perfil. Mantém as mesmas fronteiras de etapa de chapter-layers.js.
export function atmosphereKeyFor(step){
  const n=Number.isFinite(step)?Math.floor(step):0;
  if(n>=45)return 'dusk';
  if(n>=35)return 'desert';
  if(n>=27)return 'road';
  if(n>=19)return 'airport';
  if(n>=12)return 'bus';
  if(n>=7)return 'city';
  return 'farm';
}

const HEX=/^#[0-9a-f]{6}$/i;
export function hexToRgb(hex){
  if(typeof hex!=='string'||!HEX.test(hex))throw new TypeError('Cor inválida: '+hex);
  const n=parseInt(hex.slice(1),16);
  return [(n>>16)&255,(n>>8)&255,n&255];
}
export function rgbToHex([r,g,b]){
  const c=v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0');
  return '#'+c(r)+c(g)+c(b);
}
export function lerpHex(a,b,t){
  const k=Math.max(0,Math.min(1,Number.isFinite(t)?t:0));
  const A=hexToRgb(a),B=hexToRgb(b);
  return rgbToHex([A[0]+(B[0]-A[0])*k,A[1]+(B[1]-A[1])*k,A[2]+(B[2]-A[2])*k]);
}
// Interpolação completa de dois perfis (cores, números e direção do sol).
export function mixAtmosphere(a,b,t){
  const k=Math.max(0,Math.min(1,Number.isFinite(t)?t:0));
  const out={};
  for(const key of Object.keys(a)){
    const va=a[key],vb=b[key];
    if(typeof va==='string')out[key]=lerpHex(va,vb,k);
    else if(Array.isArray(va)){
      const v=va.map((x,i)=>x+(vb[i]-x)*k),len=Math.hypot(...v)||1;
      out[key]=v.map(x=>x/len);
    }else out[key]=va+(vb-va)*k;
  }
  return out;
}
