import * as THREE from 'three';
import {farewellGoal,dogAction} from './dog-behavior.js';
import {moveWithCollision} from './locomotion.js';
import {CITY_TARGETS} from './city-state.js';
import {buildCityDistrict} from './city.js';
import {buildBusInterior} from './bus-interior.js';
import {BUS_TARGETS} from './bus-state.js';
import {AIRPORT_START,AIRPORT_TARGETS} from './airport-state.js';
import {buildAirport} from './airport-world.js';
import {ROAD_START,ROAD_TARGETS} from './road-state.js';
import {buildRoute66} from './road-world.js';
import {DESERT_START,DESERT_TARGETS} from './desert-state.js';
import {buildDesert} from './desert-world.js';
import {applyChapterLayers,chapterAt} from './chapter-layers.js';
import {createChapterCache} from './lazy-chapters.js';
import {BUS_START} from './bus-state.js';
import {FARM_HOUSE,FARM_GATE,FARM_OBJECTS,isInsideHouse,makeHouseColliders,makeFarmFenceColliders} from './farm-layout.js';
import {createAtmosphere} from './atmosphere.js';
import {buildScenery,hideLegacyRoadStripes} from './scenery.js';
import {desertColliders} from './desert-state.js';
import {mulberry32} from './scatter.js';

const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:0.96,flatShading:true,...extra});
const grass=mat('#8bad61'), dirt=mat('#bda57a'), roadMat=mat('#494b47'), wood=mat('#8a5c3b');
const cream=mat('#ead3a3'), dark=mat('#253535'), red=mat('#a7463c');
const yellow=mat('#e9be5c'), leaf=[mat('#527b49'),mat('#678b46'),mat('#49705a')];
const cylinder=new THREE.CylinderGeometry(1,1,1,7);
function box(parent,w,h,d,color,x=0,y=0,z=0){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof color==='string'?mat(color):color);
  m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}
function ball(parent,r,color,x,y,z,segments=9){
  const m=new THREE.Mesh(new THREE.IcosahedronGeometry(r,1),typeof color==='string'?mat(color):color);
  m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;
}
function cyl(parent,rTop,rBot,h,color,x,y,z,sides=9){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(rTop,rBot,h,sides),typeof color==='string'?mat(color):color);
  m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;
}
function sign(parent,text,x,y,z,width=4,height=1,bg='#283c3b',fg='#fff1cf'){
  const c=document.createElement('canvas');c.width=512;c.height=128;
  const cx=c.getContext('2d');cx.fillStyle=bg;cx.fillRect(0,0,512,128);
  cx.lineWidth=9;cx.strokeStyle='#cfa86e';cx.strokeRect(8,8,496,112);
  cx.fillStyle=fg;cx.font='bold 56px sans-serif';cx.textAlign='center';cx.textBaseline='middle';cx.fillText(text,256,65,475);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;
  // v0.7.0: antes, DoubleSide mostrava o texto espelhado (ex.: "LEBAM")
  // quando a placa era vista por trás.
  // Um único desenho: a face de trás espelha a coordenada U no shader.
  const material=new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide});
  material.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',
      '#ifdef USE_MAP\n  diffuseColor *= texture2D( map, gl_FrontFacing ? vMapUv : vec2( 1.0 - vMapUv.x, vMapUv.y ) );\n#endif');
  };
  material.customProgramCacheKey=()=>'sign-two-sided';
  const plane=new THREE.Mesh(new THREE.PlaneGeometry(width,height),material);
  plane.position.set(x,y,z);parent.add(plane);return plane;
}
function house(scene,colliders){
  const h=new THREE.Group();h.position.set(FARM_HOUSE.cx,0,FARM_HOUSE.cz);scene.add(h);
  const exterior=cream,roofMat=mat('#a45538'),interior=mat('#eed8ad');
  // Quatro paredes separadas: a entrada é um vão real, não uma textura sobre bloco sólido.
  box(h,15,5.3,.28,exterior,0,2.65,-4.5);
  for(const x of [-7.5,7.5])box(h,.28,5.3,9,exterior,x,2.65,0);
  box(h,9.1,5.3,.28,exterior,-2.95,2.65,4.5);
  box(h,3.1,5.3,.28,exterior,5.95,2.65,4.5);
  box(h,2.8,1.95,.28,exterior,3,4.33,4.5); // lintel acima da porta
  box(h,14.5,.2,8.5,mat('#966944'),0,.12,0);
  // Piso de tábuas: leitura clara de ambiente interno no estilo PS2.
  for(let z=-3.75;z<4;z+=.73)box(h,14.35,.02,.035,mat('#785133'),0,.237,z);
  box(h,4.8,.025,3.0,mat('#ab8055'),2.3,.248,1.5);
  box(h,1.4,.10,2.2,mat('#ae8657'),3,.12,4.75); // soleira
  const roofGroup=new THREE.Group();h.add(roofGroup);
  const roof=new THREE.Mesh(new THREE.ConeGeometry(10.6,4.1,4),roofMat);
  roof.rotation.y=Math.PI/4;roof.scale.z=.75;roof.position.y=7.25;roof.castShadow=true;roofGroup.add(roof);
  for(const x of [-4.8,-.5]){
    box(h,2.7,2.05,.2,mat('#e0d8bb'),x,3.1,4.7);
    box(h,2.47,1.85,.23,mat('#6c909b'),x,3.1,4.83);
    box(h,.13,1.9,.23,interior,x,3.1,4.97);
    box(h,2.5,.13,.23,interior,x,3.1,4.98);
  }
  // Batentes e porta aberta: a passagem livre fica na lateral direita da fachada.
  const frame=mat('#754f32');
  box(h,.23,3.4,.42,frame,1.6,1.7,4.57);
  box(h,.23,3.4,.42,frame,4.4,1.7,4.57);
  box(h,3.0,.24,.42,frame,3,3.42,4.57);
  const doorPivot=new THREE.Group();doorPivot.position.set(1.68,0,4.54);h.add(doorPivot);
  doorPivot.rotation.y=-1.35;
  box(doorPivot,2.5,3.15,.15,mat('#946541'),1.25,1.58,0);
  for(const x of [.43,2.05])box(doorPivot,.12,2.78,.19,mat('#66432c'),x,1.6,0);
  ball(doorPivot,.085,mat('#d5a953'),2.15,1.56,.13,1);
  sign(h,'CASA DE JOÃO E CRIST',-1.1,5.2,4.75,7.3,.55,'#6f4831');
  // Varanda com corredor livre até a porta.
  box(h,17,.28,5,wood,0,.20,7.2);
  for(const x of [-7,7])for(const z of [4.8,9.5])cyl(h,.19,.24,3.1,wood,x,1.7,z);
  const awning=box(h,17,.22,5.2,mat('#8b6b48'),0,3.24,7.2);roofGroup.add(awning);
  // Interior: mesa de documentos à esquerda, mala e armário do lado direito.
  const drawer=mat('#815635');
  box(h,2.2,.18,1.25,drawer,-3.2,1.08,1.4);
  for(const x of [-4,-2.4])for(const z of [.95,1.85])box(h,.13,1,.13,drawer,x,.57,z);
  box(h,2.1,3.2,1.05,mat('#876b4a'),4.95,1.83,-2.85); // guarda-roupa
  box(h,.055,2.75,.09,mat('#674f36'),4.95,1.6,-2.29);
  box(h,2.6,.55,3.1,mat('#74533f'),-4.8,.41,-2.3); // cama
  box(h,2.4,.17,2.75,mat('#d9bd8e'),-4.8,.77,-2.3);
  box(h,2.1,.14,.67,mat('#f7e8cf'),-4.8,.94,-3.2);
  box(h,1.7,1.1,.4,mat('#835f43'),-4.8,.88,-4);
  // Retrato antigo opcional dos moradores: não é exigido para continuar.
  const photoFrame=mat('#785331'),sepia=mat('#bfa87d');
  box(h,2.05,1.48,.12,photoFrame,1.55,2.66,-4.27);
  box(h,1.78,1.22,.13,sepia,1.55,2.66,-4.16);
  for(const x of [1.14,1.91]){
    ball(h,.26,mat('#c69570'),x,2.89,-4.045,1);
    box(h,.55,.42,.17,mat(x<1.5?'#53694c':'#7a6043'),x,2.39,-4.045);
  }
  sign(h,'OS DOIS NA ROÇA',1.55,2.08,-4.00,1.66,.23,'#664b32');
  // Interior de roça: calendário, fogão de ferro, livros e utensílios.
  sign(h,'SEGUNDA-FEIRA',-5.7,2.5,4.44,2.05,.48,'#82633e');
  sign(h,'06:45',-.85,3.2,-4.18,1.30,.43,'#66503b');
  cyl(h,.24,.32,.36,mat('#8d9990'),1.05,.44,2.25,9);
  const iron=mat('#444746'),stoveBody=mat('#7e7a6a');
  box(h,1.55,1.04,.95,stoveBody,6.05,.68,1.15);
  box(h,1.65,.10,1.05,iron,6.05,1.25,1.15);
  for(const bx of [5.58,6.48]){
    cyl(h,.24,.24,.035,iron,bx,1.32,1.15,10);
    cyl(h,.075,.09,.13,mat('#d1b18b'),bx,1.42,1.15,8);
  }
  box(h,.73,.13,.15,mat('#d5c4a7'),6.05,.79,1.66);
  // Prateleira encostada à parede de fundo, sem interromper a circulação.
  for(const yy of [1.1,1.84,2.6]){
    box(h,2.6,.11,.42,drawer,-.7,yy,-4.03);
  }
  for(let i=0;i<8;i++){
    const colors=['#76613f','#8f5744','#7a8e73','#bd9977'];
    box(h,.21,.51,.29,mat(colors[i%4]),-1.78+i*.31,2.16,-4.01);
  }
  box(h,1.12,.65,.07,mat('#e7d9bb'),-2.6,3.02,4.7);
  box(h,1.12,.65,.07,mat('#e7d9bb'),-4.8,3.02,4.7);
  const interiorLight=new THREE.PointLight('#fce2ad',13,17,2);
  interiorLight.position.set(0,4,0);h.add(interiorLight);
  // Obstáculos com faces físicas correspondentes às paredes (não bloqueia o chão todo).
  colliders.push(...makeHouseColliders());
  colliders.push({x1:-19.45,x2:-16.95,z1:-12.25,z2:-10.95,height:1.26,tag:'document-desk'});
  colliders.push({x1:-21.25,x2:-18.3,z1:-17.15,z2:-13.55,height:1.1,tag:'bed'});
  colliders.push({x1:-11.2,x2:-9.4,z1:-16.5,z2:-15.1,height:3.4,tag:'wardrobe'});
  colliders.push({x1:-12.55,x2:-11.65,z1:-15.05,z2:-14.05,height:.7,tag:'inside-suitcase'});
  colliders.push({x1:-9.85,x2:-8.15,z1:-12.4,z2:-11.3,height:1.3,tag:'kitchen-stove'});
  return {
    setInteriorActive(inside){roofGroup.visible=!inside;}
  };
}
function barn(scene,colliders){
  const g=new THREE.Group();g.position.set(-30,0,-15);scene.add(g);
  box(g,12,6,9,red,0,3,0);const r=box(g,12.8,.55,11,mat('#634a3d'),0,7.1,0);r.rotation.z=.22;
  box(g,4.2,4.8,.2,wood,0,2.4,4.6);sign(g,'GALPÃO',0,5.4,4.8,4,1,'#614934');
  colliders.push({x1:-36.4,x2:-23.6,z1:-19.5,z2:-10.3,height:8});
}
const swayingTrees=[];
function tree(scene,x,z,k=0,scale=1){
  const group=new THREE.Group();group.position.set(x,0,z);group.scale.setScalar(scale);scene.add(group);
  group.userData.sway=x*.37+z*.21;swayingTrees.push(group);
  cyl(group,.23,.37,3.4,mat('#6e4f36'),0,1.7,0,7);
  const foliage=leaf[k%leaf.length];
  ball(group,2.0,foliage,0,4.15,0,1);
  ball(group,1.55,foliage,1.1,3.55,.35,1);
  ball(group,1.45,foliage,-1.0,3.55,.4,1);
  return group;
}
function fence(scene,x1,x2,z){
  const len=x2-x1;
  for(const y of [.78,1.4])box(scene,len,.15,.16,wood,(x1+x2)/2,y,z);
  for(let x=x1;x<=x2+.1;x+=3.2)box(scene,.23,1.9,.27,wood,x,.95,z);
}
function fenceAlongZ(scene,x,z1,z2){
  if(z2<=z1)return;
  const span=z2-z1;
  for(const y of [.77,1.4])box(scene,.17,.14,span,wood,x,y,(z1+z2)/2);
  for(let z=z1;z<=z2;z+=2.9)box(scene,.25,1.9,.27,wood,x,.95,z);
  box(scene,.25,1.9,.27,wood,x,.95,z2);
}
function farmGate(scene){
  const x=FARM_GATE.x,z=FARM_GATE.hingeZ,span=FARM_GATE.span;
  const frame=mat('#755037'),slats=mat('#a67545'),metal=mat('#444540');
  const hinge=new THREE.Group();hinge.position.set(x,0,z);scene.add(hinge);
  // Postes fazem parte da cerca, e não ficam soltos no meio do mapa.
  for(const zz of [z,z+span]){
    box(scene,.63,2.85,.64,frame,x,1.4,zz);
    const cap=box(scene,.79,.18,.81,slats,x,2.9,zz);cap.castShadow=true;
    for(const yy of [.72,1.78])cyl(scene,.12,.12,.2,metal,x+.40,yy,zz,7).rotation.z=Math.PI/2;
  }
  // Folha da porteira: montantes, travessas e escora diagonal.
  for(const dz of [.25,span-.25])box(hinge,.19,1.8,.19,slats,0,1.16,dz);
  for(const yy of [.61,1.25,1.88])box(hinge,.2,.17,span-.43,slats,0,yy,span/2);
  const brace=box(hinge,.21,.19,Math.hypot(span-.8,1.25),slats,0,1.25,span/2);
  brace.rotation.x=-Math.atan2(1.25,span-.8);
  for(let dz=.77;dz<span-.32;dz+=.72)box(hinge,.12,1.4,.15,slats,0,1.2,dz);
  box(hinge,.26,.16,.46,metal,.13,1.45,span-.18);
  const gateColliders=makeFarmFenceColliders();
  return {hinge,colliders:gateColliders};
}
function flowers(scene,x,z,color='#f8df88'){
  for(let i=0;i<5;i++){
    const a=i*2.4,xx=x+Math.sin(a)*.8,zz=z+Math.cos(a)*.7;
    cyl(scene,.025,.035,.5,'#4d844d',xx,.26,zz,5);
    ball(scene,.13,color,xx,.58,zz,0);
  }
}
function townBuilding(scene,colliders,x,z,w,d,c,name){
  const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
  const front=z+Math.sign(z)*(-d/2); // used only for decor on near (front) face
  box(g,w,6.1,d,mat(c),0,3.05,0);box(g,w+1,.4,d+1,mat('#704f43'),0,6.35,0);
  const face=z<0?d/2+.08:-d/2-.08;
  box(g,2.5,3.1,.2,mat('#4e5246'),0,1.55,face);
  for(const xx of [-w*.3,w*.3])box(g,2.15,1.8,.25,mat('#9ac2c3'),xx,4.2,face);
  sign(g,name,0,6.85,face,Math.max(3.5,w*.75),.72,'#37433d');
  colliders.push({x1:x-w/2-.2,x2:x+w/2+.2,z1:z-d/2-.2,z2:z+d/2+.2,height:6.8});
}
function makeBus(scene){
  const bus=new THREE.Group();bus.position.set(101,0,6);scene.add(bus);
  box(bus,12.2,3.3,4.1,mat('#ad52a3'),0,2.05,0);
  box(bus,11.5,.55,4.2,mat('#e9a9cf'),0,3.96,0);
  box(bus,2.4,2.4,.12,mat('#c5e8ef'),-4.0,2.15,2.12);
  for(const x of [-1.3,1.1,3.5])box(bus,1.7,1.2,.12,mat('#9bd3d9'),x,2.75,2.12);
  for(const x of [-4.2,3.9])for(const z of [-2.0,2.0]){
    const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.8,.8,.3,12),mat('#202222'));
    wheel.rotation.x=Math.PI/2;wheel.position.set(x,.75,z);bus.add(wheel);
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(.31,.31,.31,10),mat('#bfc5b6'));hub.rotation.x=Math.PI/2;hub.position.set(x,.75,z+(z>0?.18:-.18));bus.add(hub);
  }
  box(bus,1.7,2.6,.12,mat('#dfc99e'),-4.65,1.82,2.21);
  sign(bus,'EXCURSÃO ESTELAR',1.5,3.75,2.15,5.9,.59,'#502b58');
  sign(bus,'SHOW ESTELAR',-3.8,4.55,0,4.5,.68,'#473343');
  box(bus,.17,.18,4.2,mat('#eee4b6'),6.15,1.8,0);
  return bus;
}
function makeBike(scene){
  const g=new THREE.Group();g.position.set(68,0,-18);scene.add(g);
  const metal=mat('#dfb253'),rubber=mat('#232323'),shirt=mat('#ce5e47');
  for(const z of [-.95,.95]){
    const w=new THREE.Mesh(new THREE.TorusGeometry(.65,.11,7,14),rubber);
    w.rotation.y=Math.PI/2;w.position.set(0,.78,z);g.add(w);
  }
  const rod=(ax,ay,az,bx,by,bz)=>{
    const len=Math.hypot(bx-ax,by-ay,bz-az);const m=cyl(g,.07,.07,len,metal,(ax+bx)/2,(ay+by)/2,(az+bz)/2,6);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(bx-ax,by-ay,bz-az).normalize());
  };
  rod(0,.78,-.95,0,1.6,0);rod(0,1.6,0,0,.78,.95);rod(0,.78,.95,0,.78,-.95);
  rod(0,1.6,0,0,1.5,-.75);rod(0,1.5,-.75,0,.78,-.95);
  box(g,.85,.1,.3,dark,0,1.72,0);rod(-.43,1.8,-.85,.43,1.8,-.85);
  // Cyclist's bent body and cap
  ball(g,.34,shirt,0,2.18,.15,1);ball(g,.24,'#bc8a68',0,2.56,-.1,1);
  box(g,.56,.13,.5,mat('#354d58'),0,2.83,-.1);
  g.visible=false;return g;
}
function dog(scene){
  const g=new THREE.Group();g.position.set(2.5,0,-3.4);scene.add(g);
  const fur=mat('#5d4230'),light=mat('#a98257'),collar=mat('#a84035');
  const torso=new THREE.Group();torso.position.y=.72;g.add(torso);
  const body=ball(torso,.64,fur,0,0,0,1);body.scale.set(1.16,.73,.75);
  const headPivot=new THREE.Group();headPivot.position.set(0,.36,.55);torso.add(headPivot);
  ball(headPivot,.45,fur,0,0,0,1);
  ball(headPivot,.17,mat('#272224'),0,-.11,.45,0);
  for(const x of [-.26,.26]){
    ball(headPivot,.083,mat('#151617'),x,.12,.37,0);
    const ear=ball(headPivot,.22,fur,x,.38,-.07,0);
    ear.scale.set(.7,1.5,.8);
  }
  const band=box(headPivot,.73,.12,.40,collar,0,-.30,-.04);band.rotation.z=.06;
  const tag=ball(headPivot,.075,mat('#e3bf72'),0,-.36,.27,1);
  const legs=[];
  for(const x of [-.43,.43])for(const z of [-.36,.34]){
    const p=new THREE.Group();p.position.set(x,.52,z);g.add(p);
    cyl(p,.13,.14,.58,light,0,-.22,0,6);
    ball(p,.16,light,0,-.49,.10,0);
    legs.push(p);
  }
  const tail=new THREE.Group();tail.position.set(0,.90,-.58);g.add(tail);
  const tailMesh=cyl(tail,.13,.08,.62,fur,0,.16,-.22,8);tailMesh.rotation.x=-.75;
  g.userData={tail,legs,torso,headPivot,phase:0,moving:0,home:{x:2.5,z:-3.4}};
  return g;
}
function farmDetails(scene,colliders){
  const hay=mat('#c4a55c'),stone=mat('#a5a496'),soil=mat('#8e734f');
  // Poço rústico com água, telhado e manivela.
  const well=new THREE.Group();well.position.set(8,0,-12);scene.add(well);
  cyl(well,1.28,1.34,.95,stone,0,.49,0,11);
  cyl(well,.95,.95,.08,mat('#547f86'),0,.96,0,11);
  for(const x of [-1.2,1.2])box(well,.18,3,.18,wood,x,1.64,0);
  const roof=box(well,3.7,.23,2.7,mat('#826041'),0,3.12,0);roof.rotation.z=-.09;
  cyl(well,.15,.15,2.8,wood,0,2.2,0,7).rotation.z=Math.PI/2;
  box(well,.4,.5,.4,mat('#77583f'),.2,1.43,0);
  colliders.push({x1:6.6,x2:9.4,z1:-13.4,z2:-10.6,height:3.4});

  // Fardos e canteiro enriquecem a fazenda sem atrapalhar os objetivos.
  for(const [x,z,rot] of [[-34,2,.14],[-36,3,-.11],[-33.8,3.4,0]]){
    const bale=box(scene,1.75,.95,1.08,hay,x,.5,z);bale.rotation.y=rot;
    colliders.push({x1:x-.95,x2:x+.95,z1:z-.6,z2:z+.6,height:1.1});
  }
  // O rádio fica sobre uma mesinha em vez de flutuar.
  box(scene,1.8,.14,1.1,wood,-10.5,.52,1);
  for(const x of [-11.2,-9.8])for(const z of [.6,1.4])box(scene,.14,.47,.14,wood,x,.24,z);
  colliders.push({x1:-11.5,x2:-9.5,z1:.4,z2:1.6,height:1.1});
  box(scene,9,.08,4.5,soil,-17,.09,19);
  const geometry=new THREE.ConeGeometry(.23,.7,5);
  const patch=new THREE.InstancedMesh(geometry,mat('#58834b'),32);
  const dummy=new THREE.Object3D();
  for(let i=0;i<32;i++){
    const row=Math.floor(i/8),col=i%8;
    dummy.position.set(-20.8+col*1.1,.49,17.55+row*.92);
    dummy.rotation.y=(i%4)*.6;dummy.updateMatrix();patch.setMatrixAt(i,dummy.matrix);
  }
  patch.instanceMatrix.needsUpdate=true;scene.add(patch);
  for(const z of [16.6,21.3])box(scene,9,.24,.16,wood,-17,.38,z);
  // Três galinhas procedurais animadas.
  const chickens=[];
  for(const [x,z,heading] of [[3,-15,.5],[7,-17,-.6],[10,-14,1.4]]){
    const hen=new THREE.Group();hen.position.set(x,0,z);hen.rotation.y=heading;scene.add(hen);
    const feathers=mat('#e5d6ba'),beak=mat('#cf623b');
    const body=ball(hen,.48,feathers,0,.67,0,1);body.scale.z=1.2;
    ball(hen,.25,feathers,0,1.02,.35,1);
    ball(hen,.095,beak,0,.94,.64,0);
    for(const side of [-.22,.22]){
      cyl(hen,.045,.055,.35,mat('#b78b55'),side,.2,.05,6);
      ball(hen,.055,mat('#332c26'),side*.73,1.09,.52,0);
    }
    const crest=ball(hen,.14,beak,0,1.29,.29,0);crest.scale.y=.6;
    chickens.push(hen);
  }
  return chickens;
}

// Gramado com variação de tom por vértice: quebra o verde chapado sem textura.
function farmGround(scene){
  const geometry=new THREE.PlaneGeometry(215,115,86,46);geometry.rotateX(-Math.PI/2);
  const colors=[],c=new THREE.Color(),a=new THREE.Color('#7fa457'),b=new THREE.Color('#9bb866'),d=new THREE.Color('#a99a68');
  const pos=geometry.attributes.position,rand=mulberry32(2026);
  for(let i=0;i<pos.count;i++){
    const x=pos.getX(i),z=pos.getZ(i);
    const n=.5+.25*Math.sin(x*.11+z*.07)+.15*Math.sin(x*.31-z*.23)+.1*(rand()-.5);
    c.copy(a).lerp(b,Math.max(0,Math.min(1,n)));
    // Terra batida perto das trilhas da fazenda.
    if(n<.28)c.lerp(d,.35);
    colors.push(c.r,c.g,c.b);
  }
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  const ground=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:false}));
  ground.position.set(38,-.025,4);ground.receiveShadow=true;scene.add(ground);
  return ground;
}
export function buildWorld(scene,{renderer=null,quality=null}={}){
  swayingTrees.length=0;
  const hemi=new THREE.HemisphereLight('#f7eacf','#738b63',2.05);scene.add(hemi);
  const sun=new THREE.DirectionalLight('#fff2d7',2.65);sun.position.set(-23,40,18);
  sun.castShadow=quality?.shadows!==false;
  scene.add(sun);scene.add(sun.target);
  const atmosphere=createAtmosphere(scene,{hemi,sun,renderer,quality});
  // Keep base outdoor meshes separate from all new indoor/chapter hubs.
  const baseVisualStart=scene.children.length;
  farmGround(scene);
  box(scene,180,.12,13,roadMat,40,.015,11);
  for(let x=-45;x<129;x+=8)box(scene,3.1,.025,.15,yellow,x,.096,11);
  box(scene,180,.06,.13,mat('#f4e4c8'),40,.104,4.2);
  box(scene,180,.06,.13,mat('#f4e4c8'),40,.104,17.8);
  box(scene,17,.08,2.9,dirt,-10,.11,1.6);
  box(scene,13,.09,2.2,dirt,3,.12,4);
  // Trilha contínua da porteira até a praça: toda a área usa o mesmo mundo.
  // Faixas rasas apenas visuais; nenhuma parede ou collider novo no percurso.
  box(scene,33,.07,2.7,dirt,29.4,.13,5.0);
  box(scene,13,.07,2.45,dirt,51,.13,5.0);
  const footpath=mat('#b9b09a');
  box(scene,3.1,.07,14.2,footpath,51,.13,12.0);
  box(scene,6.5,.07,2.7,footpath,53.4,.13,19.2);
  sign(scene,'CAMINHO PARA A CIDADE',25.5,2.7,8.2,7.5,.75,'#436044');
  box(scene,16,.12,3.7,mat('#9fa4a0'),78,.1,3.9);
  box(scene,29,.12,3.4,mat('#a8a9a2'),91,.1,1.0);
  const colliders=[];
  const farmhouse=house(scene,colliders);
  barn(scene,colliders);
  fence(scene,-40,FARM_GATE.x,-25);
  fence(scene,-40,FARM_GATE.x,24);
  fenceAlongZ(scene,FARM_GATE.x,-25,FARM_GATE.hingeZ);
  fenceAlongZ(scene,FARM_GATE.x,FARM_GATE.hingeZ+FARM_GATE.span,24);
  const gate=farmGate(scene);colliders.push(...gate.colliders);
  const chickens=farmDetails(scene,colliders);
  for(let i=0;i<20;i++)box(scene,1.6,.1,5,mat(i%2?'#8d9f51':'#7c954b'),-40+i*1.6,.08,-33);
  const gtree=[[6,-19],[16,-14],[21,26],[8,29],[-26,18],[-39,12],[-12,22],[37,-20],[43,27],[48,28],[53,28],[66,30],[82,28],[100,25],[118,-13],[121,28],[108,-26],[0,-34],[28,-29],[36,35],[7,38],[-33,-37]];
  gtree.forEach((t,i)=>tree(scene,t[0],t[1],i,.85+(i%4)*.16));
  flowers(scene,-4,-6);flowers(scene,-2,6);flowers(scene,8,-7);flowers(scene,-20,5);
  // Water tower, village signs and low poly skyline
  cyl(scene,2.5,2.5,3.6,mat('#9ba98e'),28,6.5,-18,10);
  for(const x of [25,31])for(const z of [-20,-16])cyl(scene,.18,.18,5,wood,x,2.5,z);
  sign(scene,'BEM-VINDOS À CIDADE',46,3.0,1.5,10,1.1,'#3d5d43');
  for(const [x,z,w,d,c,name] of [
    [56,-9,12,12,'#c3a179','MERCADINHO'],
    [75,-9,14,11,'#cfb57a','RODOVIÁRIA'],
    [92,-10,12,10,'#a8c0b0','LANCHONETE'],
    [57,29,12,11,'#ad8a73','OFICINA'],
    [78,29,13,10,'#d0c5a8','FARMÁCIA']
  ])townBuilding(scene,colliders,x,z,w,d,c,name);
  for(const x of [47,70,94,111]){
    cyl(scene,.15,.22,5,mat('#686c60'),x,2.5,2);
    ball(scene,.38,'#f0dba2',x,5.2,2,1);
  }
  // Bench in town
  box(scene,3.2,.19,.7,wood,78,.74,1.5);for(const x of [77,79])box(scene,.15,.76,.2,dark,x,.38,1.5);
  const bus=makeBus(scene);const pantera=dog(scene);const bike=makeBike(scene);
  // Capítulo 1: cidade e rodoviária enriquecidas, mantendo os prédios antigos.
  const city=buildCityDistrict(scene,colliders,{box,ball,cyl,sign,mat});
  // Pequeno efeito visual do chapéu: fica no portão 3 enquanto João tenta recuperá-lo.
  const windHat=new THREE.Group();windHat.name='Chapéu voando · Portão 3';scene.add(windHat);
  cyl(windHat,.58,.54,.13,mat('#c8a268'),0,.13,0,12);
  cyl(windHat,.40,.38,.34,mat('#d8bd83'),0,.37,0,12);
  cyl(windHat,.42,.42,.075,mat('#584635'),0,.30,0,12);
  windHat.visible=false;
  const originalOutdoorNodes=scene.children.slice(baseVisualStart);
  // Apenas a Fazenda/Rodoviária são montadas no início. Outros capítulos
  // materializam cenário, NPCs, geometrias e colisores quando visitados.
  const chapterCache=createChapterCache({
    bus:()=>buildBusInterior(scene,colliders,{box,ball,cyl,sign,mat}),
    airport:()=>buildAirport(scene,colliders,{box,ball,cyl,sign,mat}),
    road:()=>buildRoute66(scene,colliders,{box,ball,cyl,sign,mat}),
    desert:()=>buildDesert(scene,colliders,{box,ball,cyl,sign,mat})
  });
  const extraOutdoorStart=scene.children.length;
  // Fase 1 ampliada: café da manhã jogável dentro da casa, sem mexer no restante do mundo.
  const coffeeTable=box(scene,1.35,.16,1.05,wood,-15.5,.87,-11.25);
  for(const x of [-16.0,-15.0])for(const z of [-11.65,-10.85])
    box(scene,.12,.80,.12,wood,x,.40,z);
  const cup=cyl(scene,.19,.16,.34,mat('#e6eee2'),-15.5,1.14,-11.25,10);
  const coffee=cyl(scene,.145,.145,.02,mat('#513324'),-15.5,1.32,-11.25,10);
  colliders.push({x1:-16.22,x2:-14.78,z1:-11.85,z2:-10.65,height:1.0,tag:'coffee-table'});
  // Farm props, all targets remain visible but glow only when active.
  const table=box(scene,2.6,.18,1.3,wood,-4.6,1.03,2.3);
  colliders.push({x1:-5.95,x2:-3.25,z1:1.6,z2:3.0,height:1.2});
  for(const x of [-5.55,-3.65])for(const z of [1.85,2.75])box(scene,.13,1,.13,wood,x,.52,z);
  const ticket=box(scene,.8,.02,.42,mat('#f8df97'),-4.6,1.16,2.3);
  const radio=box(scene,1.25,.72,.55,dark,-10.5,.95,1.0);
  box(scene,.52,.3,.09,mat('#bb9d6e'),-10.5,1.05,1.3);
  cyl(scene,.05,.05,.62,dark,-10.1,1.57,1.0,6);
  // Mala agora fica no quarto dentro da casa, não ao lado do rádio.
  const suitcase=new THREE.Group();
  suitcase.position.set(FARM_OBJECTS.suitcase.x,0,FARM_OBJECTS.suitcase.z);
  scene.add(suitcase);
  box(suitcase,.88,.56,.85,mat('#a36b42'),0,.52,0);
  box(suitcase,.56,.09,.12,mat('#d9c4a4'),0,.87,.04);
  box(scene,2.1,1,.85,mat('#bc946d'),4.5,.53,-9);
  // Fazenda — os itens precisam ser realmente encontrados e guardados.
  // São malhas procedurais temporárias, substituíveis por GLBs posteriormente.
  const packingProps={};
  const documents=new THREE.Group();
  documents.position.set(FARM_OBJECTS.documents.x,0,FARM_OBJECTS.documents.z);
  scene.add(documents);
  box(documents,.76,.05,.57,mat('#f9edcf'),0,1.20,0);
  box(documents,.54,.025,.34,mat('#d7b15b'),0,1.24,0);
  packingProps.documents=documents;

  const clothes=new THREE.Group();clothes.position.set(-1.5,0,-5.5);scene.add(clothes);
  box(clothes,1.25,.43,.82,wood,0,.23,0);
  box(clothes,1.02,.20,.69,mat('#75999f'),0,.55,0);
  box(clothes,.79,.16,.48,mat('#ecd6b7'),0,.73,0);
  packingProps.clothes=clothes;

  const farofa=new THREE.Group();farofa.position.set(6.1,0,-7.9);scene.add(farofa);
  cyl(farofa,.35,.39,.78,mat('#cfb87d'),0,.42,0,9);
  cyl(farofa,.43,.43,.11,mat('#80683f'),0,.87,0,9);
  box(farofa,.48,.25,.055,mat('#f3e5b7'),0,.42,.39);
  packingProps.farofa=farofa;

  const markers={};
  const markerBeamGeometry=new THREE.CylinderGeometry(.22,.55,6.4,16,1,true);
  const markerBeamMaterial=new THREE.MeshBasicMaterial({color:'#ffe9a8',transparent:true,opacity:.16,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false});
  const markerPulseGeometry=new THREE.RingGeometry(.92,1.02,40);
  const addMarker=(id,x,z,label,radius=3)=>{
    const holder=new THREE.Group();holder.position.set(x,0,z);scene.add(holder);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.85,.065,6,32),new THREE.MeshBasicMaterial({color:'#ffd877',transparent:true,opacity:.85,depthWrite:false}));
    ring.rotation.x=Math.PI/2;ring.position.y=.07;holder.add(ring);
    const beacon=new THREE.Mesh(new THREE.OctahedronGeometry(.27,0),new THREE.MeshBasicMaterial({color:'#fff0a5'}));beacon.position.y=2.35;holder.add(beacon);
    // Coluna de luz suave: o objetivo continua visível de longe e atrás de objetos baixos.
    const beam=new THREE.Mesh(markerBeamGeometry,markerBeamMaterial);beam.position.y=3.2;holder.add(beam);
    const pulse=new THREE.Mesh(markerPulseGeometry,new THREE.MeshBasicMaterial({color:'#ffe08a',transparent:true,opacity:.6,depthWrite:false}));
    pulse.rotation.x=-Math.PI/2;pulse.position.y=.06;holder.add(pulse);
    holder.visible=false;markers[id]={id,point:new THREE.Vector3(x,0,z),radius,label,holder,ring,beacon,beam,pulse};
  };
  addMarker('wake',-15.5,-11.25,'Tomar café e começar o dia',2.25);
  addMarker('ticket',-4.6,2.3,'Encontrar bilhete da loteria',3.1);
  addMarker('radio',-10.5,1,'Ligar o rádio',2.6);
  addMarker('crist',1.5,0,'Conversar com Crist',3.2);
  addMarker('documents',FARM_OBJECTS.documents.x,FARM_OBJECTS.documents.z,'Pegar documentos na casa',2.2);
  addMarker('clothes',-1.5,-5.5,'Pegar roupas',2.3);
  addMarker('farofa',6.1,-7.9,'Guardar a farofa',2.3);
  addMarker('suitcase',FARM_OBJECTS.suitcase.x,FARM_OBJECTS.suitcase.z,'Fechar mala no quarto',2.25);
  addMarker('pantera',2.5,-3.4,'Falar com Pantera',3.1);
  addMarker('gate',FARM_OBJECTS.gate.x,FARM_OBJECTS.gate.z,'Abrir porteira da fazenda',3.0);
  for(const id of ['cityWelcome','crossing','cityBag','cityClerk','bus']){
    const p=CITY_TARGETS[id];addMarker(id,p.x,p.z,p.label,p.radius);
  }
  for(const [id,p] of Object.entries(BUS_TARGETS))addMarker(id,p.x,p.z,p.label,p.radius);
  for(const [id,p] of Object.entries(AIRPORT_TARGETS))addMarker(id,p.x,p.z,p.label,p.radius);
  for(const [id,p] of Object.entries(ROAD_TARGETS))addMarker(id,p.x,p.z,p.label,p.radius);
  for(const [id,p] of Object.entries(DESERT_TARGETS))addMarker(id,p.x,p.z,p.label,p.radius);
  const clouds=[];
  for(let i=0;i<12;i++){
    const g=new THREE.Group();g.position.set(-50+i*18,20+i%4*3,-48-(i%3)*9);
    for(const d of [[0,0,0],[2,0,.1],[-2,0,0],[0,1.2,.4]]){
      const p=ball(g,2.7,mat('#e1efe8',{transparent:true,opacity:.86}),d[0],d[1],d[2],0);
      p.castShadow=false;
    }scene.add(g);clouds.push(g);
  }
  // Original Fazenda+Rodoviária and late farm props are now one visibility layer.
  // Markers stay directly on the scene so objectives in all hubs remain visible.
  // Collect by object identity, not position or arbitrary scene traversal.
  const objectiveHolders=new Set(Object.values(markers).map(m=>m.holder));
  const lateOutdoorNodes=scene.children.slice(extraOutdoorStart).filter(node=>!objectiveHolders.has(node));
  const outdoorRoot=new THREE.Group();outdoorRoot.name='Capítulos 00–01 · Fazenda e Rodoviária';
  outdoorRoot.add(...originalOutdoorNodes,...lateOutdoorNodes);scene.add(outdoorRoot);
  // Hubs posteriores ainda não existem; colliders ativos são apenas do outdoor.
  const originalColliders=colliders.slice();
  // v0.7.0: vegetação, horizonte e vida ambiente sem colisores novos.
  const markerCircles=Object.values(markers).map(m=>({x:m.point.x,z:m.point.z,r:1.6}));
  const outdoorAvoid=[...originalColliders,
    {x1:-50,x2:132,z1:4.0,z2:18.0},        // rodovia
    {x1:-19,x2:-1,z1:.1,z2:3.1},{x1:-3.5,x2:9.5,z1:2.8,z2:5.2}, // trilhas da fazenda
    {x1:12,x2:58,z1:3.5,z2:6.5},{x1:49,x2:57,z1:4.5,z2:21},     // caminho para a cidade
    {x1:FARM_HOUSE.cx-8.5,x2:FARM_HOUSE.cx+8.5,z1:FARM_HOUSE.cz-5,z2:FARM_HOUSE.cz+10}, // casa e varanda
    {x1:44,x2:122,z1:-17,z2:24},           // praça e calçadas da cidade
    {x1:-22,x2:-12,z1:16,z2:22},{x1:-40,x2:-8,z1:-34,z2:-31.5}, // canteiro e plantação
    {x1:24,x2:32,z1:-21,z2:-15}             // caixa d'água
  ];
  const desertAvoid=[...desertColliders(),{x1:-67,x2:-58,z1:-60,z2:40},{x1:-58,x2:-46,z1:5,z2:11.5},{x1:-60,x2:-49,z1:-26,z2:-17}];
  const density=quality?.scenery??1;
  const scenery=buildScenery(scene,{outdoorRoot,outdoorAvoid,outdoorCircles:markerCircles,desertAvoid,desertCircles:markerCircles,density});
  let nightLevel=0,legacyStripesHidden=false;
  let panteraExcitedUntil=0,gateOpened=false,lastDogTime=0;
  return {markers,colliders,originalColliders,outdoorRoot,bus,bike,city,pantera,clouds,sun,radio,ticket,suitcase,packingProps,chickens,atmosphere,scenery,
    get busInterior(){return chapterCache.peek('bus');},
    get airport(){return chapterCache.peek('airport');},
    get road(){return chapterCache.peek('road');},
    get desert(){return chapterCache.peek('desert');},
    loadedChapters(){return chapterCache.names();},
    // Criar somente o hub solicitado, oculto e sem colisão ativa.
    // A futura passagem do capítulo usará a mesma instância em cache.
    prepareChapter(id){return chapterCache.get(id);},
    openGate(){
      if(gateOpened)return;
      gateOpened=true;
      const index=colliders.findIndex(c=>c.tag==='gate-leaf');
      if(index>=0)colliders.splice(index,1);
      // Prevent the already opened gate being restored on chapter transitions.
      const inBase=originalColliders.findIndex(c=>c.tag==='gate-leaf');
      if(inBase>=0)originalColliders.splice(inBase,1);
    },
    setGateOpen(isOpen){
      if(isOpen){this.openGate();gate.hinge.rotation.y=Math.PI*.5;}
    },
    isInsideHouse,
    setChapter(step){
      const active=chapterAt(step);
      if(active!=='outdoor')chapterCache.get(active);
      // Só os hubs efetivamente criados participam da ativação/desativação.
      applyChapterLayers(step,outdoorRoot,colliders,originalColliders,chapterCache.loaded());
      scenery.setChapter(active);
      atmosphere.setStep(step);
      if(!legacyStripesHidden&&chapterCache.peek('road')){hideLegacyRoadStripes(chapterCache.peek('road'));legacyStripesHidden=true;}
      windHat.visible=step===11;
      chapterCache.peek('desert')?.setStep(step);
    },
    setSoundFixed(fixed){chapterCache.peek('bus')?.setSoundFixed(fixed);},
    setShowActive(on){chapterCache.peek('bus')?.setDancing(on);},

    setTarget(id){for(const o of Object.values(markers))o.holder.visible=o.id===id;},
    // Em conversas e escolhas a coluna de luz some para não cobrir os rostos.
    setMarkersMuted(muted){markerBeamMaterial.visible=!muted;for(const o of Object.values(markers))o.pulse.visible=!muted;},
    setPacked(ids){
      const done=new Set(Array.isArray(ids)?ids:[]);
      for(const [id,object] of Object.entries(packingProps))object.visible=!done.has(id);
    },
    reactPantera(time){panteraExcitedUntil=time+8.5;},
    update(time,target,step=0,dt=.016){
      if(step<BUS_START){
        farmhouse.setInteriorActive(isInsideHouse(target.x,target.z));
        gate.hinge.rotation.y+=((gateOpened?Math.PI*.5:0)-gate.hinge.rotation.y)*.1;
      }
      for(const o of Object.values(markers))if(o.holder.visible){o.beacon.position.y=2.3+Math.sin(time*2.3)*.25;o.ring.rotation.z=time*.25;}
      // Reação da Pantera: aproxima-se com passos visíveis, acompanha brevemente
      // a despedida e volta para casa; nunca invade a rodoviária.
      if(step<BUS_START){
      const goal=farewellGoal(target,time,panteraExcitedUntil);
      const dx=goal.x-pantera.position.x,dz=goal.z-pantera.position.z;
      const distance=Math.hypot(dx,dz);
      const action=dogAction(distance,goal.excited);
      const speed=action==='run'?2.6:action==='walk'?1.45:0;
      if(speed&&distance>.01){
        const movement=moveWithCollision(pantera.position,
          {x:dx/distance*speed,z:dz/distance*speed},dt,colliders,.30);
        pantera.position.x=movement.x;pantera.position.z=movement.z;
        pantera.userData.moving=movement.speed;
        if(movement.speed>.08){
          const heading=Math.atan2(movement.dx,movement.dz);
          const angle=Math.atan2(Math.sin(heading-pantera.rotation.y),Math.cos(heading-pantera.rotation.y));
          pantera.rotation.y+=angle*(1-Math.exp(-Math.min(.05,dt)*5));
        }
      }else pantera.userData.moving=0;
      pantera.userData.phase+=Math.min(.05,dt)*(pantera.userData.moving>0.15?11:2);
      const gait=Math.sin(pantera.userData.phase)*Math.min(.42,pantera.userData.moving*.22);
      for(let i=0;i<pantera.userData.legs.length;i++){
        pantera.userData.legs[i].rotation.x=(i===0||i===3?gait:-gait);
      }
      pantera.userData.torso.position.y=.72+(pantera.userData.moving>.15?Math.abs(Math.sin(pantera.userData.phase))*.035:Math.sin(time*2)*.012);
      pantera.userData.tail.rotation.y=Math.sin(time*(goal.excited?17:6))*(goal.excited?.85:.35);
      pantera.userData.headPivot.rotation.z=Math.sin(time*3.2)*(goal.excited?.13:.04);
      markers.pantera.point.set(pantera.position.x,0,pantera.position.z);
      markers.pantera.holder.position.x=pantera.position.x;
      markers.pantera.holder.position.z=pantera.position.z;
      chickens.forEach((hen,i)=>{hen.position.y=Math.sin(time*3.3+i)*.022;hen.rotation.x=Math.sin(time*2.5+i)*.05;});
      }
      if(step>=7&&step<=11)city.update(time);
      if(step>=12&&step<AIRPORT_START)chapterCache.peek('bus')?.update(time);
      if(step>=AIRPORT_START&&step<ROAD_START)chapterCache.peek('airport')?.update(time);
      if(step>=ROAD_START&&step<DESERT_START)chapterCache.peek('road')?.update(time,step);
      if(step>=DESERT_START)chapterCache.peek('desert')?.update(time);
      if(step===11){
        windHat.position.set(94.0+Math.sin(time*2.3)*.68,1.35+Math.abs(Math.sin(time*3.0))*.48,2.7+Math.cos(time*1.4)*.43);
        windHat.rotation.y=time*2.2;
        windHat.rotation.z=Math.sin(time*2.6)*.22;
      }
      if(step<BUS_START){
        bus.rotation.z=Math.sin(time*2)*.0015;
        for(let i=0;i<clouds.length;i++)clouds[i].position.x+=.0002*(i%3+1);
      }
      // Vento leve nas copas; amplitude pequena para não parecer tempestade.
      if(step<BUS_START)for(const t of swayingTrees){t.rotation.z=Math.sin(time*.9+t.userData.sway)*.018;t.rotation.x=Math.sin(time*.7+t.userData.sway*1.3)*.012;}
      for(const o of Object.values(markers))if(o.holder.visible){
        const k=(time*.8)%1;o.pulse.scale.setScalar(1+k*1.6);o.pulse.material.opacity=.55*(1-k);
      }
      const road=chapterCache.peek('road');
      if(road&&Number.isFinite(road.progress))scenery.road.setProgress(road.progress);
      nightLevel+=((step>=45?1:0)-nightLevel)*Math.min(1,dt*.6);
      scenery.desert.setNight(nightLevel);
      scenery.update(time,dt);
    },
    // Chamado após a câmera: céu centrado nela e sombra seguindo o jogador.
    updateAtmosphere(dt,focus,cameraPosition){
      atmosphere.update(dt,focus,cameraPosition);
      scenery.tint(atmosphere.current);
    }
  };
}
