import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ATMOSPHERES,atmosphereKeyFor,lerpHex,mixAtmosphere,hexToRgb} from '../src/atmosphere-profiles.js';
import {pickQuality,createResolutionGovernor,stepResolution,QUALITY_PRESETS} from '../src/quality.js';
import {scatterPoints,ringPoints,mulberry32,insideRect} from '../src/scatter.js';
import {environmentKind,cameraProfile,autoFollowYaw,dialogueShot,shakeOffset,gameplayFov,dampAngle,wrapAngle} from '../src/camera-director.js';
import {chapterAt} from '../src/chapter-layers.js';
import {desertColliders,DESERT_TARGETS} from '../src/desert-state.js';
import {isBlocked} from '../src/collision.js';

// ───── Atmosfera ─────
test('cada capitulo tem perfil de atmosfera proprio e coerente com as camadas',()=>{
  const expected={0:'farm',6:'farm',7:'city',11:'city',12:'bus',18:'bus',19:'airport',26:'airport',27:'road',34:'road',35:'desert',44:'desert',45:'dusk',46:'dusk'};
  for(const [step,key] of Object.entries(expected))assert.equal(atmosphereKeyFor(Number(step)),key,'passo '+step);
  // O perfil acompanha a troca de hub (nenhum deserto com céu de fazenda, etc.).
  const hub={farm:'outdoor',city:'outdoor',bus:'bus',airport:'airport',road:'road',desert:'desert',dusk:'desert'};
  for(let s=0;s<=46;s++)assert.equal(hub[atmosphereKeyFor(s)],chapterAt(s),'passo '+s);
  assert.equal(atmosphereKeyFor(NaN),'farm');
});
test('perfis validos: cores hex, neblina crescente, sol acima do horizonte',()=>{
  for(const [key,p] of Object.entries(ATMOSPHERES)){
    for(const c of ['zenith','horizon','ground','fog','sun','hemiSky','hemiGround'])assert.doesNotThrow(()=>hexToRgb(p[c]),key+'.'+c);
    assert.ok(p.fogNear<p.fogFar,key);
    assert.ok(p.sunDir[1]>0,key+' sol abaixo do horizonte');
    assert.ok(p.exposure>.8&&p.exposure<1.5,key);
  }
  // O pôr do sol do mirante é mais escuro que o deserto do meio-dia.
  const luma=h=>{const [r,g,b]=hexToRgb(h);return .3*r+.59*g+.11*b;};
  assert.ok(luma(ATMOSPHERES.dusk.zenith)<luma(ATMOSPHERES.desert.zenith));
});
test('mistura de atmosferas interpola cores, numeros e direcao do sol',()=>{
  assert.equal(lerpHex('#000000','#ffffff',.5),'#808080');
  assert.equal(lerpHex('#102030','#405060',0),'#102030');
  assert.equal(lerpHex('#102030','#405060',2),'#405060');
  const mid=mixAtmosphere(ATMOSPHERES.desert,ATMOSPHERES.dusk,.5);
  const between=(v,a,b)=>v>=Math.min(a,b)&&v<=Math.max(a,b);
  for(const k of ['fogNear','fogFar','sunIntensity','exposure','glow'])
    assert.ok(between(mid[k],ATMOSPHERES.desert[k],ATMOSPHERES.dusk[k]),k);
  assert.notEqual(mid.zenith,ATMOSPHERES.desert.zenith);
  assert.ok(Math.abs(Math.hypot(...mid.sunDir)-1)<1e-9,'direção normalizada');
  assert.deepEqual(mixAtmosphere(ATMOSPHERES.farm,ATMOSPHERES.city,0).fog,ATMOSPHERES.farm.fog);
});

// ───── Qualidade ─────
test('perfil grafico: override, celular e desktop',()=>{
  assert.equal(pickQuality({override:'low'}).id,'low');
  assert.equal(pickQuality({override:'ultra',mobile:false,cores:8}).id,'high');
  assert.equal(pickQuality({mobile:true,cores:4}).id,'low');
  assert.equal(pickQuality({mobile:true,cores:8}).id,'medium');
  assert.equal(pickQuality({mobile:false,cores:8}).id,'high');
  for(const p of Object.values(QUALITY_PRESETS))assert.ok(p.minPixelRatio<=p.maxPixelRatio);
});
test('resolucao dinamica reduz abaixo de 45 FPS e recupera acima de 57',()=>{
  let s=createResolutionGovernor(QUALITY_PRESETS.high,2);
  assert.equal(s.ratio,1.8);
  for(let i=0;i<70;i++)s=stepResolution(s,1/30).state;     // ~2,3 s a 30 FPS
  assert.ok(s.ratio<1.8,'baixou');
  const low=s.ratio;
  for(let i=0;i<10;i++)for(let k=0;k<130;k++)s=stepResolution(s,1/60.5).state;
  assert.ok(s.ratio>low,'recuperou');
  assert.ok(s.ratio<=1.8);
  // Nunca abaixo do mínimo, mesmo com FPS muito baixo.
  for(let i=0;i<400;i++)s=stepResolution(s,1/8).state;
  assert.equal(s.ratio,QUALITY_PRESETS.high.minPixelRatio);
  // Quadros enormes (aba em segundo plano) são descartados.
  const r=stepResolution(s,3);
  assert.equal(r.changed,false);
});

// ───── Cenografia ─────
test('distribuicao deterministica nunca invade estradas, colisores ou missoes',()=>{
  const avoid=[{x1:-5,x2:5,z1:-50,z2:50}],circles=[{x:20,z:0,r:3}];
  const a=scatterPoints({seed:3,count:300,area:{x1:-40,x2:40,z1:-40,z2:40},avoid,circles,margin:.5});
  const b=scatterPoints({seed:3,count:300,area:{x1:-40,x2:40,z1:-40,z2:40},avoid,circles,margin:.5});
  assert.deepEqual(a,b,'mesma semente, mesmo cenário');
  assert.ok(a.length>200);
  for(const p of a){
    assert.equal(avoid.some(r=>insideRect(p.x,p.z,r,.5)),false);
    assert.ok(Math.hypot(p.x-20,p.z)>=3.5);
  }
  const spaced=scatterPoints({seed:9,count:40,area:{x1:0,x2:30,z1:0,z2:30},spacing:2});
  for(let i=0;i<spaced.length;i++)for(let j=i+1;j<spaced.length;j++)
    assert.ok(Math.hypot(spaced[i].x-spaced[j].x,spaced[i].z-spaced[j].z)>=2);
  assert.throws(()=>scatterPoints({area:{x1:0,x2:0,z1:0,z2:1}}));
  const r=mulberry32(1);for(let i=0;i<100;i++){const v=r();assert.ok(v>=0&&v<1);}
});
test('anel de horizonte respeita raio e o vao de visao para Vegas',()=>{
  const ring=ringPoints({seed:87,count:16,cx:-62,cz:-10,radius:150,jitter:25,arc:[.62,Math.PI*2-.62]});
  for(const p of ring){
    const d=Math.hypot(p.x+62,p.z+10);
    assert.ok(d>=125-1e-9&&d<=175+1e-9);
    assert.ok(p.angle>.62&&p.angle<Math.PI*2-.62,'nada na direção +z do mirante');
  }
});
test('parapeito do mirante nao bloqueia o objetivo final do deserto',()=>{
  const lookout=DESERT_TARGETS.desertLookout,c=desertColliders();
  assert.ok(c.some(r=>r.tag==='desert-lookout-rail'));
  assert.equal(isBlocked(lookout.x,lookout.z,.38,0,c),false);
  assert.equal(isBlocked(lookout.x,lookout.z+1.6,.38,0,c),false,'há espaço até o parapeito');
  assert.equal(isBlocked(lookout.x,10.3,.38,0,c),true,'parapeito é sólido');
});

// ───── Câmera ─────
test('perfil de camera por ambiente: corredor do onibus mais baixo e aberto',()=>{
  assert.equal(environmentKind(0,true),'house');
  assert.equal(environmentKind(3,false),'outdoor');
  assert.equal(environmentKind(12,false),'bus');
  assert.equal(environmentKind(20,false),'airport');
  assert.equal(environmentKind(30,false),'outdoor');
  const out=cameraProfile('outdoor',8.2,.36),bus=cameraProfile('bus',8.2,.36),house=cameraProfile('house',8.2,.36);
  assert.ok(bus.distance<out.distance&&bus.lift<out.lift&&bus.fov>out.fov);
  assert.ok(house.distance<=5.2);
  assert.equal(cameraProfile('outdoor',99,9).distance,13);
  assert.ok(Number.isFinite(cameraProfile('?',NaN,NaN).lift));
});
test('acompanhamento automatico so atua andando para a frente sem input de camera',()=>{
  const base={speed:3.4,inputX:0,inputY:1,sinceManual:5,dt:1/60,strength:.85};
  const moved=autoFollowYaw(0,.8,base);
  assert.ok(moved>0&&moved<.8,'gira suavemente rumo às costas do herói');
  assert.equal(autoFollowYaw(0,.8,{...base,sinceManual:.5}),0,'respeita o comando manual');
  assert.equal(autoFollowYaw(0,.8,{...base,speed:.2}),0,'parado não gira');
  assert.equal(autoFollowYaw(0,.8,{...base,inputY:-1}),0,'andar para a câmera não gira');
  assert.equal(autoFollowYaw(0,2.6,base),0,'não vira de costas de uma vez');
  assert.equal(autoFollowYaw(0,.8,{...base,enabled:false}),0,'opção desligada');
  const strafe=autoFollowYaw(0,.8,{...base,inputX:1});
  assert.ok(strafe<moved,'movimento lateral reduz o giro');
  // Independente de FPS: 60 passos de 1/60 ≈ 30 passos de 1/30.
  let a=0,b=0;
  for(let i=0;i<60;i++)a=autoFollowYaw(a,.8,{...base,dt:1/60});
  for(let i=0;i<30;i++)b=autoFollowYaw(b,.8,{...base,dt:1/30});
  assert.ok(Math.abs(a-b)<1e-9);
});
test('plano de dialogo enquadra os dois personagens pelo lado da camera atual',()=>{
  const a={x:0,z:0},b={x:2,z:0};
  const shot=dialogueShot(a,b,0);
  assert.deepEqual(shot.focus,{x:1,z:0});
  // A linha entre eles é o eixo X; a câmera fica do lado de -z (yaw ~0) com leve três quartos.
  assert.ok(Math.abs(wrapAngle(shot.yaw))<.6);
  const other=dialogueShot(a,b,Math.PI);
  assert.ok(Math.abs(wrapAngle(other.yaw-Math.PI))<.6);
  assert.ok(dialogueShot(a,b,0,'bus').distance<shot.distance);
  assert.equal(dialogueShot(a,{x:20,z:0},0),null,'longe demais: mantém a câmera de jogo');
  assert.equal(dialogueShot(a,{x:NaN,z:0},0),null);
});
test('tremor, lente e suavizacao angular sao limitados',()=>{
  assert.deepEqual(shakeOffset(1,0),{x:0,y:0,z:0});
  for(let t=0;t<5;t+=.13){const s=shakeOffset(t,5);assert.ok(Math.abs(s.x)<=.36&&Math.abs(s.y)<=.27);}
  assert.equal(gameplayFov(58,0),58);
  assert.equal(gameplayFov(58,5.25),63);
  assert.ok(Math.abs(dampAngle(3.1,-3.1,1,50)-(-3.1+2*Math.PI))<1e-6||Math.abs(wrapAngle(dampAngle(3.1,-3.1,1,50)+3.1))<1e-6,'pelo caminho curto');
  assert.equal(dampAngle(1,2,0,5),1);
});
test('integracao: placas legiveis dos dois lados, ceu, sombra e opcoes de camera',()=>{
  const world=readFileSync(new URL('../src/world.js',import.meta.url),'utf8');
  const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.match(world,/gl_FrontFacing \? vMapUv : vec2\( 1\.0 - vMapUv\.x, vMapUv\.y \)/);
  assert.match(world,/createAtmosphere\(scene,\{hemi,sun,renderer,quality\}\)/);
  assert.match(world,/buildScenery\(scene,/);
  assert.match(main,/autoFollowYaw\(yaw,hero\.rotation\.y/);
  assert.match(main,/roomLimit\(kind,focus,cam\.yaw,cam\.dist\)/);
  assert.match(main,/cameraRelativeMove\(input\.x,input\.y,cam\.yaw\)/,'movimento segue a câmera exibida');
  assert.match(html,/id="autoCamBtn"/);
  assert.match(html,/id="invertYBtn"/);
});
