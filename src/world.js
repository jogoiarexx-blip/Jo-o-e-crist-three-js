import * as THREE from 'three';

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
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
  const plane=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:t,transparent:false,side:THREE.DoubleSide}));
  plane.position.set(x,y,z);parent.add(plane);return plane;
}
function house(scene,colliders){
  const h=new THREE.Group();h.position.set(-15,0,-13);scene.add(h);
  box(h,15,5.3,9,cream,0,2.65,0);
  const roof=new THREE.Mesh(new THREE.ConeGeometry(10.6,4.1,4),mat('#9c4a37'));roof.rotation.y=Math.PI/4;roof.scale.z=.75;roof.position.y=7.25;roof.castShadow=true;h.add(roof);
  box(h,2.0,3.25,.17,mat('#6c4932'),3,1.64,4.57);
  for(const x of [-4.8,-.5]){box(h,2.7,2.05,.22,mat('#d7d6c1'),x,3.1,4.56);box(h,2.5,1.9,.24,mat('#668d99'),x,3.1,4.68);
    box(h,.16,2.1,.2,cream,x,3.1,4.79);box(h,2.7,.15,.2,cream,x,3.1,4.8);}
  box(h,17,.32,5,wood,0,.26,7.2);
  for(const x of [-7,7])for(const z of [4.8,9.5])cyl(h,.19,.24,3.1,wood,x,1.7,z);
  box(h,17,.22,5.2,mat('#8b6b48'),0,3.24,7.2);
  sign(h,'SÍTIO BOA SORTE',0,5.0,4.65,5.6,.73,'#67412b');
  colliders.push({x1:-22.6,x2:-7.4,z1:-17.6,z2:-8.2,height:9.5});
}
function barn(scene,colliders){
  const g=new THREE.Group();g.position.set(-30,0,-15);scene.add(g);
  box(g,12,6,9,red,0,3,0);const r=box(g,12.8,.55,11,mat('#634a3d'),0,7.1,0);r.rotation.z=.22;
  box(g,4.2,4.8,.2,wood,0,2.4,4.6);sign(g,'GALPÃO',0,5.4,4.8,4,1,'#614934');
  colliders.push({x1:-36.4,x2:-23.6,z1:-19.5,z2:-10.3,height:8});
}
function tree(scene,x,z,k=0,scale=1){
  const group=new THREE.Group();group.position.set(x,0,z);group.scale.setScalar(scale);scene.add(group);
  cyl(group,.23,.37,3.4,mat('#6e4f36'),0,1.7,0,7);
  const foliage=leaf[k%leaf.length];
  ball(group,2.0,foliage,0,4.15,0,1);
  ball(group,1.55,foliage,1.1,3.55,.35,1);
  ball(group,1.45,foliage,-1.0,3.55,.4,1);
  return group;
}
function fence(scene,x1,x2,z){
  const len=x2-x1;box(scene,len,.13,.15,wood,(x1+x2)/2,.85,z);
  box(scene,len,.13,.15,wood,(x1+x2)/2,1.38,z);
  for(let x=x1;x<=x2;x+=3.2)box(scene,.2,1.85,.24,wood,x,.92,z);
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
  sign(bus,'VEGAS?',-3.8,4.55,0,4.5,.68,'#473343');
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
  const fur=mat('#5d4230'),light=mat('#a98257');
  const body=ball(g,.64,fur,0,.7,0,1);body.scale.set(1.2,.7,.67);
  const head=ball(g,.46,fur,0,1.03,.55,1);
  ball(g,.18,mat('#2b2423'),0,.9,.97,0);
  for(const x of [-.3,.3]){ball(g,.12,'#131212',x,1.15,.89,0);const ear=ball(g,.24,fur,x,1.42,.46,0);ear.scale.y=1.4;}
  for(const x of [-.5,.5])for(const z of [-.33,.32])cyl(g,.13,.13,.65,light,x,.35,z,6);
  const tail=cyl(g,.13,.09,.65,fur,0,.94,-.8);tail.rotation.x=1.0;
  g.userData.tail=tail;return g;
}
function farmDetails(scene,colliders){
  const hay=mat('#c4a55c'),stone=mat('#a5a496'),soil=mat('#8e734f');
  // Poço rústico com água, telhado e manivela.
  const well=new THREE.Group();well.position.set(17,0,-13);scene.add(well);
  cyl(well,1.28,1.34,.95,stone,0,.49,0,11);
  cyl(well,.95,.95,.08,mat('#547f86'),0,.96,0,11);
  for(const x of [-1.2,1.2])box(well,.18,3,.18,wood,x,1.64,0);
  const roof=box(well,3.7,.23,2.7,mat('#826041'),0,3.12,0);roof.rotation.z=-.09;
  cyl(well,.15,.15,2.8,wood,0,2.2,0,7).rotation.z=Math.PI/2;
  box(well,.4,.5,.4,mat('#77583f'),.2,1.43,0);
  colliders.push({x1:15.6,x2:18.4,z1:-14.4,z2:-11.6,height:3.4});

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

export function buildWorld(scene){
  scene.background=new THREE.Color('#9ec6be');
  scene.fog=new THREE.Fog('#9ec6be',45,140);
  const hemi=new THREE.HemisphereLight('#f7eacf','#738b63',2.05);scene.add(hemi);
  const sun=new THREE.DirectionalLight('#fff2d7',2.65);sun.position.set(-23,40,18);
  sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-36;sun.shadow.camera.right=36;sun.shadow.camera.top=38;sun.shadow.camera.bottom=-38;sun.shadow.camera.near=1;sun.shadow.camera.far=110;
  sun.shadow.bias=-.00015;scene.add(sun);scene.add(sun.target);
  const ground=box(scene,215,.23,115,grass,38,-.14,4);ground.castShadow=false;
  box(scene,180,.12,13,roadMat,40,.015,11);
  for(let x=-45;x<129;x+=8)box(scene,3.1,.025,.15,yellow,x,.096,11);
  box(scene,180,.06,.13,mat('#f4e4c8'),40,.104,4.2);
  box(scene,180,.06,.13,mat('#f4e4c8'),40,.104,17.8);
  box(scene,17,.08,2.9,dirt,-10,.11,1.6);
  box(scene,13,.09,2.2,dirt,3,.12,4);
  box(scene,16,.12,3.7,mat('#9fa4a0'),78,.1,3.9);
  box(scene,29,.12,3.4,mat('#a8a9a2'),91,.1,1.0);
  const colliders=[];
  house(scene,colliders);barn(scene,colliders);fence(scene,-40,11,-25);fence(scene,-40,-8,24);
  const chickens=farmDetails(scene,colliders);
  colliders.push({x1:-40.4,x2:11.2,z1:-25.25,z2:-24.75,height:1.9});
  colliders.push({x1:-40.4,x2:-8.0,z1:23.75,z2:24.25,height:1.9});
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
  // Farm props, all targets remain visible but glow only when active.
  const table=box(scene,2.6,.18,1.3,wood,-4.6,1.03,2.3);
  colliders.push({x1:-5.95,x2:-3.25,z1:1.6,z2:3.0,height:1.2});
  for(const x of [-5.55,-3.65])for(const z of [1.85,2.75])box(scene,.13,1,.13,wood,x,.52,z);
  const ticket=box(scene,.8,.02,.42,mat('#f8df97'),-4.6,1.16,2.3);
  const radio=box(scene,1.25,.72,.55,dark,-10.5,.95,1.0);
  box(scene,.52,.3,.09,mat('#bb9d6e'),-10.5,1.05,1.3);
  cyl(scene,.05,.05,.62,dark,-10.1,1.57,1.0,6);
  const suitcase=box(scene,1.24,.72,.64,mat('#a36b42'),-12.5,.42,3.6);
  colliders.push({x1:-13.4,x2:-11.9,z1:3.13,z2:4.1,height:.85});
  box(scene,.55,.17,.15,mat('#d9c4a4'),-12.5,.89,3.6);
  box(scene,.8,.6,.52,mat('#845837'),-13.3,.31,3.9);
  box(scene,2.1,1,.85,mat('#bc946d'),4.5,.53,-9);
  // Fazenda — os itens precisam ser realmente encontrados e guardados.
  // São malhas procedurais temporárias, substituíveis por GLBs posteriormente.
  const packingProps={};
  const documents=new THREE.Group();documents.position.set(-6.0,0,.7);scene.add(documents);
  box(documents,.95,.55,.75,mat('#806243'),0,.31,0);
  box(documents,.68,.045,.47,mat('#f9edcf'),0,.65,0);
  box(documents,.52,.04,.36,mat('#d7b15b'),0,.71,0);
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

  const gateA=box(scene,.22,1.9,.28,wood,11,.95,5);
  const gateB=box(scene,.22,1.9,.28,wood,13,.95,5);
  box(scene,2,.12,.2,wood,12,.6,5);box(scene,2,.12,.2,wood,12,1.2,5);
  const markers={};
  const addMarker=(id,x,z,label,radius=3)=>{
    const holder=new THREE.Group();holder.position.set(x,0,z);scene.add(holder);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.85,.065,6,32),new THREE.MeshBasicMaterial({color:'#ffd877',transparent:true,opacity:.85,depthWrite:false}));
    ring.rotation.x=Math.PI/2;ring.position.y=.07;holder.add(ring);
    const beacon=new THREE.Mesh(new THREE.OctahedronGeometry(.27,0),new THREE.MeshBasicMaterial({color:'#fff0a5'}));beacon.position.y=2.35;holder.add(beacon);
    holder.visible=false;markers[id]={id,point:new THREE.Vector3(x,0,z),radius,label,holder,ring,beacon};
  };
  addMarker('ticket',-4.6,2.3,'Conferir bilhete',3.1);
  addMarker('radio',-10.5,1,'Ligar o rádio',2.6);
  addMarker('crist',1.5,0,'Conversar com Crist',3.2);
  addMarker('documents',-6.0,.7,'Guardar documentos',2.3);
  addMarker('clothes',-1.5,-5.5,'Pegar roupas',2.3);
  addMarker('farofa',6.1,-7.9,'Guardar a farofa',2.3);
  addMarker('suitcase',-12.5,3.6,'Fechar as malas',3.1);
  addMarker('pantera',2.5,-3.4,'Falar com Pantera',3.1);
  addMarker('gate',12,5,'Sair da fazenda',4);
  addMarker('crossing',68,11,'Atravessar a rua',6);
  addMarker('bus',93,3,'Entrar no ônibus',5);
  const clouds=[];
  for(let i=0;i<12;i++){
    const g=new THREE.Group();g.position.set(-50+i*18,20+i%4*3,-48-(i%3)*9);
    for(const d of [[0,0,0],[2,0,.1],[-2,0,0],[0,1.2,.4]]){
      const p=ball(g,2.7,mat('#e1efe8',{transparent:true,opacity:.86}),d[0],d[1],d[2],0);
      p.castShadow=false;
    }scene.add(g);clouds.push(g);
  }
  let panteraExcitedUntil=0;
  return {markers,colliders,bus,bike,pantera,clouds,sun,radio,ticket,suitcase,packingProps,chickens,
    setTarget(id){for(const o of Object.values(markers))o.holder.visible=o.id===id;},
    setPacked(ids){
      const done=new Set(Array.isArray(ids)?ids:[]);
      for(const [id,object] of Object.entries(packingProps))object.visible=!done.has(id);
    },
    reactPantera(time){panteraExcitedUntil=time+5;},
    update(time,target){for(const o of Object.values(markers))if(o.holder.visible){o.beacon.position.y=2.3+Math.sin(time*2.3)*.25;o.ring.rotation.z=time*.25;}
      pantera.userData.tail.rotation.z=Math.sin(time*(time<panteraExcitedUntil?18:7))*(time<panteraExcitedUntil?.75:.35);
      chickens.forEach((hen,i)=>{hen.position.y=Math.sin(time*3.3+i)*.022;hen.rotation.x=Math.sin(time*2.5+i)*.05;});
      bus.rotation.z=Math.sin(time*2)*.0015;
      for(let i=0;i<clouds.length;i++)clouds[i].position.x+=.0002*(i%3+1);
      sun.position.set(target.x-23,40,target.z+18);sun.target.position.set(target.x,0,target.z);sun.target.updateMatrixWorld();
    }
  };
}
