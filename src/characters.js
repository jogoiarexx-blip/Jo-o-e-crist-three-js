import * as THREE from 'three';
const material=(c)=>new THREE.MeshStandardMaterial({color:c,roughness:.93,flatShading:true});
const skin=material('#c18b65'), skin2=material('#d0a17c'),shoe=material('#483b32');
function roundedBox(g,w,h,d,c,x,y,z){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),c);m.position.set(x,y,z);m.castShadow=true;g.add(m);return m;
}
function sphere(g,r,c,x,y,z){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(r,1),c);m.position.set(x,y,z);m.castShadow=true;g.add(m);return m;}
function tube(g,rt,rb,h,c,x,y,z){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,8),c);m.position.set(x,y,z);m.castShadow=true;g.add(m);return m;
}
export function createElder(id){
  const joao=id==='joao',g=new THREE.Group();
  const colors=joao?{shirt:'#e0dfba',vest:'#715443',pant:'#4e6a61',hat:'#c8a268'}:{shirt:'#8fbdc4',vest:'#51686e',pant:'#5b5051',hat:'#7e6854'};
  const root=new THREE.Group();root.name=id;root.add(g);
  const body=new THREE.Group();body.position.y=1.27;g.add(body);
  const torso=roundedBox(body,.94,1.02,.53,material(colors.vest),0,0,0);
  const belly=sphere(body,.42,material(colors.shirt),0,-.25,.25);belly.scale.set(1,.72,.58);
  roundedBox(body,.32,.86,.12,material(colors.shirt),0,-.06,.41);
  sphere(body,.16,skin,0,.54,.04);
  const head=new THREE.Group();head.position.y=.8;body.add(head);
  const face=sphere(head,.38,joao?skin:skin2,0,0,.02);face.scale.set(.98,1.05,.92);
  const nose=sphere(head,.135,joao?skin:skin2,0,-.05,.38,);nose.scale.set(.85,.85,1.2);
  const eyes=[];
  for(const x of [-.15,.15]){
    eyes.push(sphere(head,.05,material('#29221d'),x,.085,.35));
    roundedBox(head,.13,.025,.045,material('#5e5449'),x,.175,.345);
  }
  const mouth=roundedBox(head,.17,.04,.04,material('#74463a'),0,-.22,.365);
  if(joao){
    const moustache=material('#eee0c1');
    sphere(head,.128,moustache,-.12,-.17,.35).scale.set(1,.5,.6);
    sphere(head,.128,moustache,.12,-.17,.35).scale.set(1,.5,.6);
    tube(head,.58,.53,.15,material(colors.hat),0,.35,0);
    tube(head,.4,.39,.34,material('#d8bd83'),0,.56,0);
    tube(head,.42,.42,.07,material('#584635'),0,.45,0);
    for(const x of [-.29,.29])sphere(head,.15,material('#e6e0d0'),x,-.05,-.07).scale.set(.9,1.3,.55);
  } else {
    // Crist: óculos de aro quadrado, pouco cabelo grisalho e boina curta.
    const glasses=material('#312d2e');
    for(const x of [-.16,.16]){roundedBox(head,.27,.19,.04,glasses,x,.07,.365);roundedBox(head,.22,.13,.045,material('#bbd9dc'),x,.07,.4);}
    roundedBox(head,.09,.035,.04,glasses,0,.1,.38);
    sphere(head,.31,material('#b2aaa0'),0,.31,-.02).scale.set(1,.35,1);
    tube(head,.44,.41,.17,material(colors.hat),0,.41,0);
    roundedBox(head,.8,.07,.42,material('#514438'),0,.33,.18);
  }
  const arms=[],legs=[];
  for(const s of [-1,1]){
    const a=new THREE.Group();a.position.set(s*.61,.33,0);body.add(a);
    tube(a,.19,.14,.66,material(colors.shirt),0,-.31,0);
    sphere(a,.13,joao?skin:skin2,0,-.69,0);
    arms.push(a);
    const l=new THREE.Group();l.position.set(s*.23,.9,0);g.add(l);
    tube(l,.18,.18,.79,material(colors.pant),0,-.4,0);
    roundedBox(l,.37,.23,.56,shoe,0,-.83,.13);
    legs.push(l);
  }
  const shadow=new THREE.Mesh(new THREE.CircleGeometry(.6,18),new THREE.MeshBasicMaterial({color:'#172a26',transparent:true,opacity:.2,depthWrite:false}));
  shadow.rotation.x=-Math.PI/2;shadow.position.y=.018;root.add(shadow);
  root.userData={id,arms,legs,head,body,shadow,eyes,mouth,moving:0,phase:0,gesture:'',gestureTime:0};
  return root;
}
export function gestureElder(root,gesture='talk',duration=1.6){
  if(!root)return;
  root.userData.gesture=gesture;
  root.userData.gestureTime=duration;
}
export function animateElder(root,dt,speed,time){
  if(!root)return;const d=root.userData;d.phase+=dt*(speed>.1?8.4+speed*.45:2.5);
  const sway=Math.sin(d.phase)*Math.min(.57,speed*.12);
  d.legs[0].rotation.x=sway;d.legs[1].rotation.x=-sway;
  d.gestureTime=Math.max(0,d.gestureTime-dt);
  if(d.gestureTime<=0)d.gesture='';
  let left=-sway*.65,right=sway*.65;
  if(d.gesture==='talk'){
    left=-.35+Math.sin(time*8.4)*.22;
    right=-.26+Math.sin(time*7.1+1)*.2;
  }else if(d.gesture==='celebrate'){
    left=-2.0+Math.sin(time*8)*.15;
    right=-2.0-Math.sin(time*8)*.15;
  }else if(d.gesture==='shrug'){
    left=-1.05;right=-.52;
  }else if(d.gesture==='pet'){
    left=.52;right=.24;
  }
  const gain=1-Math.exp(-dt*11);
  d.arms[0].rotation.x+=(left-d.arms[0].rotation.x)*gain;
  d.arms[1].rotation.x+=(right-d.arms[1].rotation.x)*gain;
  d.body.rotation.z=Math.sin(d.phase*.52)*.025;
  d.head.rotation.y=Math.sin(time*.7+(d.id==='joao'?0:1))*.055+(d.gesture==='shrug'?.09:0);
  d.body.position.y=1.27+(speed>.2?Math.abs(Math.sin(d.phase))*.055:Math.sin(time*2.1)*.017);
  // Piscar rápido sem criar geometrias novas a cada frame.
  const blink=Math.abs(Math.sin(time*.83+(d.id==='joao'?.7:2.8)));
  const scale=blink>.993?.08:1;
  for(const eye of d.eyes)eye.scale.y=scale;
  d.mouth.scale.y=d.gesture==='talk'?(1.2+Math.abs(Math.sin(time*9))*2.2):1;
}
