import * as THREE from 'three';
import {scatterPoints,ringPoints,mulberry32} from './scatter.js';
import {lerpHex} from './atmosphere-profiles.js';
import {AIRPORT_ROOM} from './airport-state.js';
import {BUS_ROOM} from './bus-state.js';
import {ROAD_CENTER} from './road-state.js';
import {DESERT_ROOM} from './desert-state.js';

// v0.7.0 — Cenografia por capítulo: vegetação instanciada, horizonte com
// relevo, vida ambiente e paisagens em movimento. Nada aqui recebe colisão;
// os objetos ficam fora das áreas de circulação e dos pontos de missão.
const flat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.95,flatShading:true,...extra});
const dummy=new THREE.Object3D();

function instanced(parent,geometry,material,points,place){
  if(!points.length)return null;
  const mesh=new THREE.InstancedMesh(geometry,material,points.length);
  for(let i=0;i<points.length;i++){
    dummy.position.set(0,0,0);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);
    place(dummy,points[i],i);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate=true;
  mesh.computeBoundingSphere();
  parent.add(mesh);return mesh;
}
function colorize(mesh,points,palette){
  if(!mesh)return {};
  const c=new THREE.Color();
  for(let i=0;i<points.length;i++){c.set(palette[Math.floor(points[i].variant*palette.length)%palette.length]);mesh.setColorAt(i,c);}
  mesh.instanceColor.needsUpdate=true;
  return mesh;
}
// Tufo de capim: três lâminas inclinadas fundidas em uma geometria.
function tuftGeometry(){
  const parts=[];
  for(let i=0;i<3;i++){
    const g=new THREE.ConeGeometry(.07,.55,3);g.translate(0,.27,0);
    g.rotateZ((i-1)*.35);g.rotateY(i*2.1);parts.push(g);
  }
  return mergeSimple(parts);
}
// União simples de geometrias não indexadas (evita depender de addons).
function mergeSimple(list){
  const geos=list.map(g=>g.index?g.toNonIndexed():g);
  const total=geos.reduce((n,g)=>n+g.attributes.position.count,0);
  const pos=new Float32Array(total*3),nor=new Float32Array(total*3);
  let o=0;
  for(const g of geos){
    pos.set(g.attributes.position.array,o*3);
    if(g.attributes.normal)nor.set(g.attributes.normal.array,o*3);
    o+=g.attributes.position.count;
  }
  const out=new THREE.BufferGeometry();
  out.setAttribute('position',new THREE.BufferAttribute(pos,3));
  out.setAttribute('normal',new THREE.BufferAttribute(nor,3));
  out.computeVertexNormals();
  return out;
}
function canvasTexture(size,draw,repeat=1){
  const c=document.createElement('canvas');c.width=c.height=size;
  draw(c.getContext('2d'),size);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
  t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(repeat,repeat);t.anisotropy=8;
  return t;
}
function noiseFill(ctx,size,base,spots,seed){
  ctx.fillStyle=base;ctx.fillRect(0,0,size,size);
  const rand=mulberry32(seed);
  for(let i=0;i<size*size/18;i++){
    ctx.fillStyle=spots[Math.floor(rand()*spots.length)];
    const s=1+rand()*3;ctx.fillRect(rand()*size,rand()*size,s,s);
  }
}
// Relevo distante: "aerial perspective" manual, sem depender da neblina.
function distantMaterial(base,mix){
  const m=flat(base,{fog:false});m.userData.distant={base,mix};return m;
}
function hills(parent,{seed,cx,cz,radius,jitter,count,height,width,color,mix,shape='hill',arc}){
  const pts=ringPoints({seed,count,cx,cz,radius,jitter,arc});
  const geo=shape==='mesa'?new THREE.CylinderGeometry(.82,1,1,7):new THREE.IcosahedronGeometry(1,1);
  if(shape!=='mesa')geo.translate(0,0,0);
  const material=distantMaterial(color,mix);
  instanced(parent,geo,material,pts,(d,p)=>{
    const w=width*p.scale,h=height*(.55+p.variant*.8);
    d.position.set(p.x,shape==='mesa'?h/2-.5:-h*.12,p.z);
    d.scale.set(w,shape==='mesa'?h:h,w*(.6+p.variant*.5));
    d.rotation.y=p.angle;
  }).castShadow=false;
  return material;
}

// ───────────────────────── Fazenda e cidade ─────────────────────────
function buildOutdoor(root,{avoid,circles,density}){
  const g=new THREE.Group();g.name='Cenografia · Fazenda/Rodoviária';root.add(g);
  // Chão além do mapa jogável, para o horizonte não terminar em "borda".
  const far=new THREE.Mesh(new THREE.CircleGeometry(420,40),flat('#86a75c'));
  far.rotation.x=-Math.PI/2;far.position.set(40,-.06,4);far.receiveShadow=false;g.add(far);
  const area={x1:-66,x2:142,z1:-52,z2:60};
  const tufts=scatterPoints({seed:11,count:Math.round(1500*density),area,avoid,circles,margin:.35});
  colorize(instanced(g,tuftGeometry(),flat('#ffffff'),tufts,(d,p)=>{
    d.position.set(p.x,0,p.z);d.rotation.y=p.rotation;d.scale.setScalar(.75+p.scale*.6);
  }),tufts,['#6d9a45','#7fae4f','#93b85a','#5f8a43']);
  const blooms=scatterPoints({seed:23,count:Math.round(260*density),area,avoid,circles,margin:.35});
  colorize(instanced(g,new THREE.IcosahedronGeometry(.09,0),flat('#ffffff',{emissive:'#222'}),blooms,(d,p)=>{
    d.position.set(p.x,.3+p.scale*.15,p.z);
  }),blooms,['#f3d86b','#f6f1e2','#c99be0','#f0a36a']);
  const rocks=scatterPoints({seed:37,count:Math.round(90*density),area,avoid,circles,margin:.6});
  colorize(instanced(g,new THREE.DodecahedronGeometry(.32,0),flat('#ffffff'),rocks,(d,p)=>{
    d.position.set(p.x,.05,p.z);d.rotation.set(p.rotation,p.rotation*2,0);d.scale.set(p.scale*1.4,p.scale*.7,p.scale);
  }),rocks,['#a6a191','#8f8a7c','#b9b3a1']).castShadow=true;
  // Linha de árvores e morros ao fundo, em camadas de cor.
  const forest=ringPoints({seed:5,count:Math.round(120*Math.max(.5,density)),cx:40,cz:4,radius:118,jitter:14});
  const pine=new THREE.ConeGeometry(2.2,7,6);pine.translate(0,3.5,0);
  const forestMat=distantMaterial('#4c7044',.25);
  instanced(g,pine,forestMat,forest,(d,p)=>{d.position.set(p.x,0,p.z);d.scale.setScalar(.8+p.scale*.8);});
  const near=hills(g,{seed:3,cx:40,cz:4,radius:175,jitter:20,count:22,height:26,width:34,color:'#6f9152',mix:.42});
  const back=hills(g,{seed:9,cx:40,cz:4,radius:265,jitter:25,count:18,height:55,width:62,color:'#7f9a83',mix:.68});
  // Bandos de pássaros planando sobre a fazenda.
  const birds=[];
  const wing=new THREE.BufferGeometry();
  wing.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,-.55,.12,-.18,0,0,.25, 0,0,0,0,0,.25,.55,.12,-.18],3));
  wing.computeVertexNormals();
  const birdMat=new THREE.MeshBasicMaterial({color:'#2f3a3a',side:THREE.DoubleSide});
  for(let f=0;f<2;f++)for(let i=0;i<5;i++){
    const b=new THREE.Mesh(wing,birdMat);b.userData={flock:f,slot:i};b.scale.setScalar(1.3);g.add(b);birds.push(b);
  }
  return {group:g,distant:[forestMat,near,back],update(t){
    for(const b of birds){
      const {flock,slot}=b.userData,a=t*(flock?.07:.09)+flock*2.4;
      const cx=flock?-5:30,cz=flock?-10:12,r=flock?34:48;
      const lag=slot*.035,off=(slot%2?1:-1)*Math.ceil(slot/2)*1.6;
      b.position.set(cx+Math.sin(a-lag)*r+Math.cos(a)*off,22+flock*5+Math.sin(t*.7+slot)*.6,cz+Math.cos(a-lag)*r-Math.sin(a)*off);
      b.rotation.y=a+Math.PI*(flock?.5:.5);
      b.scale.y=1.3*(.35+Math.abs(Math.sin(t*6+slot)))*1;
    }
  }};
}

// ───────────────────────── Excursão (ônibus em movimento) ─────────────────────────
function buildBusOutside(root,{density}){
  const g=new THREE.Group();g.name='Paisagem da janela · Excursão';g.visible=false;root.add(g);
  const {cx,cz}=BUS_ROOM;
  const grassTex=canvasTexture(128,(c,s)=>noiseFill(c,s,'#7d9a4e',['#6d8a44','#8aa85a','#97a85e','#6f8f4a'],3),70);
  const grass=new THREE.Mesh(new THREE.PlaneGeometry(700,700),flat('#ffffff',{map:grassTex,flatShading:false}));
  grass.rotation.x=-Math.PI/2;grass.position.set(cx,-.35,cz);g.add(grass);
  const roadTex=canvasTexture(64,(c,s)=>{noiseFill(c,s,'#4d4d4a',['#454542','#565652','#5c5b56'],8);
    c.fillStyle='#e9d9a4';c.fillRect(0,s*.47,s*.5,s*.06);},1);
  roadTex.repeat.set(70,1);
  const road=new THREE.Mesh(new THREE.PlaneGeometry(700,14),flat('#ffffff',{map:roadTex,flatShading:false}));
  road.rotation.x=-Math.PI/2;road.position.set(cx,-.3,cz-1);g.add(road);
  // Objetos à beira da estrada repetidos a cada 120 m: a rolagem é contínua.
  const tile=new THREE.Group();g.add(tile);
  const P=120,rand=mulberry32(77),trees=[],posts=[],bushes=[];
  for(let k=-3;k<=3;k++){
    for(let i=0;i<10;i++){
      const side=rand()<.5?-1:1,x=cx+k*P+rand()*P,z=cz+side*(14+rand()*55);
      (rand()<.75?trees:bushes).push({x,z,scale:.8+rand()*.7,variant:rand()});
    }
    for(let x=0;x<P;x+=20)posts.push({x:cx+k*P+x,z:cz+9.5,scale:1,variant:0});
  }
  const trunk=new THREE.CylinderGeometry(.25,.35,3,6);trunk.translate(0,1.5,0);
  const crown=new THREE.IcosahedronGeometry(2.2,0);crown.translate(0,4.4,0);
  instanced(tile,trunk,flat('#6b4c34'),trees,(d,p)=>{d.position.set(p.x,-.3,p.z);d.scale.setScalar(p.scale);});
  colorize(instanced(tile,crown,flat('#ffffff'),trees,(d,p)=>{d.position.set(p.x,-.3,p.z);d.scale.setScalar(p.scale);}),trees,['#4f7a45','#5f8b45','#6e9447']);
  colorize(instanced(tile,new THREE.IcosahedronGeometry(1.3,0),flat('#ffffff'),bushes,(d,p)=>{d.position.set(p.x,.2,p.z);d.scale.set(p.scale*1.4,p.scale*.8,p.scale);}),bushes,['#6d8f47','#7b9a4d']);
  const pole=new THREE.CylinderGeometry(.13,.16,6.5,6);pole.translate(0,3,0);
  instanced(tile,pole,flat('#6c5640'),posts,(d,p)=>{d.position.set(p.x,-.3,p.z);});
  const distant=[
    hills(g,{seed:41,cx,cz,radius:150,jitter:20,count:20,height:22,width:30,color:'#6d7f4f',mix:.45}),
    hills(g,{seed:43,cx,cz,radius:240,jitter:30,count:16,height:48,width:60,color:'#8a7f8f',mix:.62})
  ];
  const speed=16;
  return {group:g,distant,update(t){
    const shift=(t*speed)%P;
    tile.position.x=shift;
    grassTex.offset.x=(t*speed/10)%1;
    roadTex.offset.x=(t*speed/10)%1;
  }};
}

// ───────────────────────── Aeroporto (pátio e decolagens) ─────────────────────────
function airplane(color='#f4f3ee',accent='#3b7891'){
  const p=new THREE.Group();
  const body=flat(color),blue=flat(accent),dark=flat('#2d3a40'),glass=flat('#9fc6d4');
  const fus=new THREE.Mesh(new THREE.CylinderGeometry(1.45,1.45,26,12),body);fus.rotation.z=Math.PI/2;p.add(fus);
  const nose=new THREE.Mesh(new THREE.SphereGeometry(1.45,12,8,0,Math.PI*2,0,Math.PI/2),body);nose.rotation.z=-Math.PI/2;nose.position.x=13;nose.scale.y=1.6;p.add(nose);
  const tailCone=new THREE.Mesh(new THREE.ConeGeometry(1.45,6,12),body);tailCone.rotation.z=Math.PI/2;tailCone.position.x=-16;p.add(tailCone);
  const stripe=new THREE.Mesh(new THREE.BoxGeometry(26,.32,2.98),blue);stripe.position.y=.15;p.add(stripe);
  const windows=new THREE.Mesh(new THREE.BoxGeometry(20,.28,2.96),glass);windows.position.set(-.5,.65,0);p.add(windows);
  const wing=new THREE.Mesh(new THREE.BoxGeometry(5,.28,30),body);wing.position.set(-1,-.6,0);wing.rotation.y=0;p.add(wing);
  for(const z of [-6.5,6.5]){
    const eng=new THREE.Mesh(new THREE.CylinderGeometry(.75,.65,3.2,10),dark);eng.rotation.z=Math.PI/2;eng.position.set(.4,-1.35,z);p.add(eng);
  }
  const fin=new THREE.Mesh(new THREE.BoxGeometry(4,5,.3),blue);fin.position.set(-16,3,0);fin.rotation.z=-.35;p.add(fin);
  const stab=new THREE.Mesh(new THREE.BoxGeometry(3,.22,10),body);stab.position.set(-17,.6,0);p.add(stab);
  const cockpit=new THREE.Mesh(new THREE.BoxGeometry(1.4,.45,1.9),dark);cockpit.position.set(13.2,.9,0);p.add(cockpit);
  p.traverse(o=>{if(o.isMesh){o.castShadow=true;}});
  return p;
}
function buildAirportOutside(root,{density}){
  const g=new THREE.Group();g.name='Pátio · Aeroporto';g.visible=false;root.add(g);
  const {cx,cz,zMin,zMax}=AIRPORT_ROOM;
  const tarmacTex=canvasTexture(128,(c,s)=>noiseFill(c,s,'#6f7372',['#676b6a','#777b79','#7d817f'],15),60);
  const tarmac=new THREE.Mesh(new THREE.PlaneGeometry(800,800),flat('#ffffff',{map:tarmacTex,flatShading:false}));
  tarmac.rotation.x=-Math.PI/2;tarmac.position.set(cx,-.02,cz);tarmac.receiveShadow=true;g.add(tarmac);
  const grass=flat('#8faa63');
  for(const z of [zMin-38,zMin-82]){
    const strip=new THREE.Mesh(new THREE.PlaneGeometry(800,22),grass);strip.rotation.x=-Math.PI/2;strip.position.set(cx,.0,z);g.add(strip);
  }
  // Pista com faixas centrais e cabeceira.
  const runwayZ=zMin-60;
  const runway=new THREE.Mesh(new THREE.PlaneGeometry(700,26),flat('#4f5352'));
  runway.rotation.x=-Math.PI/2;runway.position.set(cx,.03,runwayZ);g.add(runway);
  const dashes=[];for(let x=-300;x<=300;x+=14)dashes.push({x:cx+x,z:runwayZ,scale:1,variant:0});
  instanced(g,new THREE.BoxGeometry(7,.02,.6),flat('#f1efe6'),dashes,(d,p)=>{d.position.set(p.x,.05,p.z);});
  // Faixa amarela de taxiamento até a frente do terminal.
  const taxi=new THREE.Mesh(new THREE.PlaneGeometry(400,.4),flat('#e2b54a'));taxi.rotation.x=-Math.PI/2;taxi.position.set(cx,.02,zMin-14);g.add(taxi);
  // Aviões estacionados no pátio, de frente para o vidro.
  const parked=[];
  for(const [x,color] of [[cx-20,'#f2f1ec'],[cx+18,'#f6efe1']]){
    const pl=airplane(color,color==='#f2f1ec'?'#3b7891':'#c0613f');pl.position.set(x,3.1,zMin-17);pl.rotation.y=-Math.PI/2;g.add(pl);parked.push(pl);
  }
  // Torre de controle e hangares ao fundo.
  const tower=new THREE.Group();tower.position.set(cx+48,0,zMin-34);g.add(tower);
  const towerMat=flat('#d7d3c8');
  const shaft=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.9,20,8),towerMat);shaft.position.y=10;tower.add(shaft);
  const cab=new THREE.Mesh(new THREE.CylinderGeometry(3.6,2.8,3,8),flat('#5c8fa0'));cab.position.y=21.5;tower.add(cab);
  const capTop=new THREE.Mesh(new THREE.CylinderGeometry(3.9,3.9,.5,8),towerMat);capTop.position.y=23.2;tower.add(capTop);
  for(const x of [-40,-10,20]){
    const hangar=new THREE.Mesh(new THREE.CylinderGeometry(9,9,24,10,1,false,0,Math.PI),flat('#a6aaa4'));
    hangar.rotation.z=Math.PI/2;hangar.rotation.y=Math.PI/2;hangar.position.set(cx+x,0,zMin-100);g.add(hangar);
  }
  // Lado da cidade (vidro norte): estacionamento e prédios distantes.
  const lot=new THREE.Mesh(new THREE.PlaneGeometry(800,60),flat('#5d6262'));lot.rotation.x=-Math.PI/2;lot.position.set(cx,.01,zMax+32);g.add(lot);
  const cars=scatterPoints({seed:61,count:Math.round(36*density),area:{x1:cx-60,x2:cx+60,z1:zMax+8,z2:zMax+40},spacing:4});
  colorize(instanced(g,new THREE.BoxGeometry(3.6,1.3,1.8),flat('#ffffff'),cars,(d,p)=>{d.position.set(p.x,.65,p.z);d.rotation.y=Math.round(p.variant*2)*Math.PI;}),cars,['#b24a3d','#3c6e8f','#e8e3d4','#3b3f42','#d7a640']);
  const skyline=ringPoints({seed:63,count:26,cx,cz,radius:190,jitter:25,arc:[-1.2,1.2]});
  const cityMat=distantMaterial('#8094a0',.5);
  instanced(g,new THREE.BoxGeometry(1,1,1),cityMat,skyline,(d,p)=>{const h=18+p.variant*45;d.position.set(p.x,h/2,p.z);d.scale.set(10+p.scale*8,h,10+p.scale*6);d.rotation.y=p.angle;});
  const distant=[cityMat,hills(g,{seed:65,cx,cz,radius:260,jitter:30,count:18,height:40,width:70,color:'#7c9aa0',mix:.6})];
  // Decolagem de 30 em 30 s pela pista paralela ao terminal.
  const jet=airplane('#fbfaf6','#c23e3e');g.add(jet);
  const cycle=30;
  return {group:g,distant,update(t){
    const k=(t%cycle)/cycle;
    // Taxi/aceleração → rotação → subida.
    const x=cx-260+Math.pow(k,1.7)*560;
    const lift=Math.max(0,(x-(cx+10))/170);
    jet.position.set(x,3.1+lift*lift*40,runwayZ);
    jet.rotation.set(0,0,Math.min(.22,lift*.6));
    jet.visible=k<.98;
  }};
}

// ───────────────────────── Route 66 ─────────────────────────
function buildRoadScenery(root,{density}){
  const g=new THREE.Group();g.name='Horizonte · Route 66';g.visible=false;root.add(g);
  const {x:cx,z:cz}=ROAD_CENTER;
  const sandTex=canvasTexture(128,(c,s)=>noiseFill(c,s,'#d4b47b',['#c9a46c','#dcbf88','#cfae74','#bf9a62'],21),90);
  const sand=new THREE.Mesh(new THREE.PlaneGeometry(900,900),flat('#ffffff',{map:sandTex,flatShading:false}));
  sand.rotation.x=-Math.PI/2;sand.position.set(cx,.0,cz);sand.receiveShadow=true;g.add(sand);
  // A estrada continua até o horizonte nos dois sentidos.
  const asphalt=new THREE.Mesh(new THREE.PlaneGeometry(11.2,900),flat('#4b4846'));
  asphalt.rotation.x=-Math.PI/2;asphalt.position.set(cx,.16,cz);asphalt.receiveShadow=true;g.add(asphalt);
  for(const dx of [-5.55,5.55]){
    const edge=new THREE.Mesh(new THREE.PlaneGeometry(.12,900),flat('#e6e4d9'));edge.rotation.x=-Math.PI/2;edge.position.set(cx+dx,.165,cz);g.add(edge);
  }
  // Tudo o que "passa" pela van fica em um bloco periódico de 64 m.
  const moving=new THREE.Group();g.add(moving);
  const P=64,dashes=[],poles=[],scrub=[],rand=mulberry32(91);
  for(let z=-448;z<=448;z+=4)for(const dx of [-1.35,1.35])dashes.push({x:cx+dx,z,scale:1,variant:0});
  for(let z=-448;z<=448;z+=16)poles.push({x:cx+15.5,z,scale:1,variant:0});
  const tile=[];
  for(let i=0;i<Math.round(46*density);i++){
    const side=rand()<.5?-1:1,dx=side*(18+rand()*80);
    tile.push({dx,dz:rand()*P,scale:.6+rand()*.9,variant:rand()});
  }
  for(let k=-7;k<=7;k++)for(const p of tile)scrub.push({x:cx+p.dx,z:cz+k*P+p.dz,scale:p.scale,variant:p.variant});
  instanced(moving,new THREE.BoxGeometry(.1,.03,1.6),flat('#e8d1a1'),dashes,(d,p)=>{d.position.set(p.x,.245,p.z);}).castShadow=false;
  const pole=new THREE.CylinderGeometry(.12,.15,7,6);pole.translate(0,3.5,0);
  instanced(moving,pole,flat('#6a5440'),poles,(d,p)=>{d.position.set(p.x,0,p.z);});
  const arm=new THREE.BoxGeometry(.14,.14,2.4);arm.translate(0,6.6,0);
  instanced(moving,arm,flat('#6a5440'),poles,(d,p)=>{d.position.set(p.x,0,p.z);d.rotation.y=Math.PI/2;});
  const bush=new THREE.IcosahedronGeometry(.8,0);
  colorize(instanced(moving,bush,flat('#ffffff'),scrub.filter(s=>s.variant<.7),(d,p)=>{d.position.set(p.x,.25,p.z);d.scale.set(p.scale*1.3,p.scale*.7,p.scale);}),scrub.filter(s=>s.variant<.7),['#8b8a55','#7e7d4d','#9a8f5c']);
  const cactusPts=scrub.filter(s=>s.variant>=.7);
  const cactus=new THREE.CylinderGeometry(.28,.34,3,7);cactus.translate(0,1.5,0);
  instanced(moving,cactus,flat('#5f835a'),cactusPts,(d,p)=>{d.position.set(p.x,0,p.z);d.scale.setScalar(p.scale);});
  const mesas=[
    hills(g,{seed:71,cx,cz,radius:170,jitter:25,count:18,height:28,width:34,color:'#b77c55',mix:.42,shape:'mesa'}),
    hills(g,{seed:73,cx,cz,radius:280,jitter:30,count:16,height:52,width:56,color:'#a77e72',mix:.65,shape:'mesa'})
  ];
  let progress=0;
  return {group:g,distant:mesas,setProgress(p){if(Number.isFinite(p))progress=p;},update(){
    moving.position.z=((progress*.115)%P+P)%P;
  }};
}
// Retira as faixas antigas (30 m) da Route 66: agora a faixa contínua é instanciada.
export function hideLegacyRoadStripes(roadGroup){
  roadGroup?.group?.traverse(o=>{if(o.isMesh&&o.geometry?.parameters&&o.geometry.parameters.width===.10&&o.geometry.parameters.depth===1.6)o.visible=false;});
}

// ───────────────────────── Deserto e o brilho de Vegas ─────────────────────────
function buildDesertScenery(root,{avoid,circles,density}){
  const g=new THREE.Group();g.name='Horizonte · Deserto de Nevada';g.visible=false;root.add(g);
  const {xMin,xMax,zMin,zMax}=DESERT_ROOM,cx=(xMin+xMax)/2,cz=(zMin+zMax)/2;
  const sandTex=canvasTexture(128,(c,s)=>noiseFill(c,s,'#d6b67f',['#cbaa72','#dec48e','#d1b079','#c49f68'],27),90);
  const sand=new THREE.Mesh(new THREE.PlaneGeometry(900,900),flat('#ffffff',{map:sandTex,flatShading:false}));
  sand.rotation.x=-Math.PI/2;sand.position.set(cx,0,cz);sand.receiveShadow=true;g.add(sand);
  const road=new THREE.Mesh(new THREE.PlaneGeometry(8,900),flat('#58534d'));road.rotation.x=-Math.PI/2;road.position.set(-62.4,.09,cz);g.add(road);
  const area={x1:xMin-30,x2:xMax+30,z1:zMin-30,z2:zMax+30};
  const pebbles=scatterPoints({seed:83,count:Math.round(420*density),area,avoid,circles,margin:.3});
  colorize(instanced(g,new THREE.DodecahedronGeometry(.16,0),flat('#ffffff'),pebbles,(d,p)=>{d.position.set(p.x,.12,p.z);d.rotation.set(p.rotation,p.rotation,0);d.scale.set(p.scale*1.6,p.scale*.6,p.scale);}),pebbles,['#a68a64','#b69a72','#8f7b62']);
  const scrubPts=scatterPoints({seed:85,count:Math.round(120*density),area,avoid,circles,margin:.6,spacing:1.2});
  colorize(instanced(g,new THREE.IcosahedronGeometry(.45,0),flat('#ffffff'),scrubPts,(d,p)=>{d.position.set(p.x,.2,p.z);d.scale.set(p.scale*1.4,p.scale*.7,p.scale*1.2);}),scrubPts,['#8b8a55','#9b915e','#7a7b4b']);
  const mesas=[
    // Vão no relevo ao norte (+z): a linha de visão do mirante até Vegas fica livre.
    hills(g,{seed:87,cx,cz,radius:150,jitter:25,count:16,height:26,width:36,color:'#b8794f',mix:.38,shape:'mesa',arc:[.62,Math.PI*2-.62]}),
    hills(g,{seed:89,cx,cz,radius:260,jitter:30,count:14,height:48,width:60,color:'#a87a70',mix:.62,shape:'mesa',arc:[.5,Math.PI*2-.5]})
  ];
  // Las Vegas no horizonte, ao norte do mirante: silhuetas de dia, néon ao entardecer.
  const vegas=new THREE.Group();vegas.position.set(-52,0,265);vegas.scale.setScalar(1.15);g.add(vegas);
  const towerMat=distantMaterial('#5d5868',.5);towerMat.userData.custom=true;
  const windowTex=canvasTexture(64,(c,s)=>{
    c.fillStyle='#000';c.fillRect(0,0,s,s);const r=mulberry32(5);
    for(let y=2;y<s;y+=5)for(let x=2;x<s;x+=4)if(r()<.55){c.fillStyle=r()<.8?'#ffd78a':'#9fe8ff';c.fillRect(x,y,2,3);}
  },1);
  const windowMat=new THREE.MeshBasicMaterial({map:windowTex,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});
  const windowFaces=[];
  const neonMats=['#ff4fa0','#ffd34f','#4fe3ff','#b26bff'].map(c=>new THREE.MeshBasicMaterial({color:c,fog:false,transparent:true,opacity:0}));
  const rand=mulberry32(97);
  for(let i=0;i<22;i++){
    const x=(i-11)*5.8+rand()*3,h=10+rand()*34+(Math.abs(i-11)<4?18:0),w=3.5+rand()*3;
    const t=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),towerMat);t.position.set(x,h/2,rand()*14);vegas.add(t);
    windowFaces.push({x,z:t.position.z-w/2-.05,w,h});
    const band=new THREE.Mesh(new THREE.BoxGeometry(w+.2,.6,w+.2),neonMats[i%neonMats.length]);band.position.set(x,h*(.55+rand()*.4),t.position.z);vegas.add(band);
  }
  instanced(vegas,new THREE.PlaneGeometry(1,1),windowMat,windowFaces,(d,p)=>{
    d.position.set(p.x,p.h/2,p.z);d.rotation.y=Math.PI;d.scale.set(p.w*.9,p.h*.92,1);
  });
  // Pirâmide e torre com antena, marcos imediatamente reconhecíveis à noite.
  const pyramid=new THREE.Mesh(new THREE.ConeGeometry(14,20,4),towerMat);pyramid.position.set(52,10,6);pyramid.rotation.y=Math.PI/4;vegas.add(pyramid);
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(.6,1.6,160,8,1,true),new THREE.MeshBasicMaterial({color:'#fff6c8',transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
  beam.position.set(52,100,6);vegas.add(beam);
  const needle=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.8,70,8),towerMat);needle.position.set(-48,35,4);vegas.add(needle);
  const pod=new THREE.Mesh(new THREE.CylinderGeometry(5,3.5,5,10),neonMats[2]);pod.position.set(-48,66,4);vegas.add(pod);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(1,24,12,0,Math.PI*2,0,Math.PI/2),new THREE.MeshBasicMaterial({color:'#ff9d5c',transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.BackSide}));
  glow.scale.set(150,50,60);glow.position.set(0,0,10);vegas.add(glow);
  // Arbustos secos rolando com o vento.
  const weeds=[];
  for(let i=0;i<3;i++){
    const w=new THREE.Mesh(new THREE.IcosahedronGeometry(.45,1),flat('#a98a57',{wireframe:true}));
    w.userData={lane:zMin+8+i*13,phase:i*9.7,speed:3.2+i*.7};g.add(w);weeds.push(w);
  }
  let night=0;
  return {group:g,distant:[...mesas,towerMat],setNight(v){night=Math.max(0,Math.min(1,v));},update(t,dt=.016){
    // De dia: silhueta na névoa quente. À noite: prédios escuros e janelas acesas.
    const hazy=towerMat.userData.tinted||'#9a8f95';
    towerMat.color.set(lerpHex(hazy,'#2a2836',night*.85));
    windowMat.opacity=night*.95;
    for(const m of neonMats)m.opacity=night*(.75+.25*Math.sin(t*3+m.id));
    beam.material.opacity=night*.22;glow.material.opacity=night*.35;
    for(const w of weeds){
      const span=xMax-xMin+60,u=((t*w.userData.speed+w.userData.phase*10)%span);
      w.position.set(xMin-30+u,.45+Math.abs(Math.sin(t*4+w.userData.phase))*.35,w.userData.lane+Math.sin(t*.6+w.userData.phase)*2);
      w.rotation.z=-u/.45;
    }
  }};
}

export function buildScenery(scene,{outdoorRoot,outdoorAvoid=[],outdoorCircles=[],desertAvoid=[],desertCircles=[],density=1}){
  const outdoor=buildOutdoor(outdoorRoot,{avoid:outdoorAvoid,circles:outdoorCircles,density});
  const holder=new THREE.Group();holder.name='Cenografia dos capítulos';scene.add(holder);
  const bus=buildBusOutside(holder,{density});
  const airport=buildAirportOutside(holder,{density});
  const road=buildRoadScenery(holder,{density});
  const desert=buildDesertScenery(holder,{avoid:desertAvoid,circles:desertCircles,density});
  const byChapter={bus,airport,road,desert};
  const distant=[...outdoor.distant,...bus.distant,...airport.distant,...road.distant,...desert.distant];
  let active='outdoor',lastHorizon='';
  return {
    road,desert,
    setChapter(id){
      active=id;
      for(const [key,part] of Object.entries(byChapter))part.group.visible=key===id;
    },
    // Relevo distante assume a cor do horizonte do perfil atual.
    tint(atmosphere){
      const key=atmosphere.horizon+atmosphere.fog;
      if(key===lastHorizon)return;lastHorizon=key;
      const target=lerpHex(atmosphere.horizon,atmosphere.fog,.5);
      for(const m of distant){
        const d=m.userData.distant;if(!d)continue;
        m.userData.tinted=lerpHex(d.base,target,d.mix);
        if(!m.userData.custom)m.color.set(m.userData.tinted);
      }
    },
    update(t,dt){
      if(active==='outdoor')outdoor.update(t);
      else byChapter[active]?.update(t,dt);
    }
  };
}
