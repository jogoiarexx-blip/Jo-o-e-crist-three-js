import * as THREE from 'three';
import {ROAD_CENTER,ROAD_NPCS,ROAD_DRIVES,ROAD_TARGETS,ROAD_START} from './road-state.js';

// Diorama da Route 66: veículo controlável em faixa virtual, obstáculos dinâmicos
// e uma pequena área explorável com lanchonete, mirante e oficina.
export function buildRoute66(scene,colliders,{box,ball,cyl,sign,mat}){
  const group=new THREE.Group();group.visible=false;scene.add(group);
  const asphalt=mat('#4b4846'),sand=mat('#c9ac74'),desert=mat('#d6b87e'),paint=mat('#e8d1a1');
  const dark=mat('#353b3c'),white=mat('#e6e4d9'),red=mat('#bc5c45');
  const cx=ROAD_CENTER.x,cz=ROAD_CENTER.z;
  box(group,34,.12,30,desert,cx,.07,cz);
  box(group,11.2,.07,30,asphalt,cx,.17,cz);
  for(const x of [cx-5.55,cx+5.55])box(group,.12,.03,30,white,x,.23,cz);
  const laneStripes=[];
  for(const x of [cx-1.35,cx+1.35])for(let z=13;z<43;z+=4){
    const line=box(group,.10,.03,1.6,paint,x,.245,z);
    line.castShadow=false;laneStripes.push({mesh:line,baseZ:z});
  }
  // Curvas sugeridas por montes no horizonte; nunca ocupam a pista.
  for(const [x,z,r] of [[-43,16,3.3],[-42,40,2.5],[-11,15,2.4],[-12,39,3.1]]){
    const hill=ball(group,r,mat('#aa8967'),x,r*.34,z,1);
    hill.scale.set(1.5,.65,.8);
  }
  for(const [x,z] of [[-41,15],[-41,22],[-13,20],[-14,39],[-41,43]]){
    const cactus=mat('#64845c');
    cyl(group,.20,.24,2.0,cactus,x,1.0,z,8);
    cyl(group,.14,.15,.80,cactus,x+.44,1.34,z,8);
    cyl(group,.14,.15,.60,cactus,x-.44,1.15,z,8);
    box(group,.55,.13,.14,cactus,x+.30,.90,z);
    box(group,.55,.13,.14,cactus,x-.30,1.06,z);
  }
  // Posto da parada e lanchonete na lateral da pista.
  const diner=mat('#8f6550'),cream=mat('#ecd7a4');
  box(group,5.3,3.1,3.9,diner,-39,1.65,39);
  box(group,6.0,.26,4.35,red,-39,3.34,39);
  sign(group,'CAFÉ DA MABEL',-39,3.72,36.67,5.5,.64,'#77493e');
  box(group,2.0,1.8,.12,mat('#93b9ba'),-40.2,1.65,36.98);
  box(group,1.25,1.85,.12,mat('#655648'),-37.7,1.27,36.94);
  box(group,2.5,.24,1.05,mat('#987453'),-37,.74,31.9);
  for(const x of [-37.9,-36.1])box(group,.13,.77,.12,dark,x,.4,31.9);
  sign(group,'ROUTE 66',-35,2.85,35.65,3.2,.82,'#314b4b');
  sign(group,'MIRANTE 2 KM',-31,2.84,36.5,3.6,.63,'#3f5346');
  sign(group,'NEVADA →',-27,3.55,35.9,3.7,.62,'#61503f');
  // Mirante: espaço para foto, placa e banco, sem cercar o marcador.
  box(group,5.1,.20,3.65,mat('#baa27c'),-19,.12,37);
  sign(group,'FOTO · ROUTE 66',-19,3.06,39.1,5.1,.72,'#31575d');
  box(group,2.5,.17,.70,mat('#917253'),-21.5,.75,37.9);
  for(const x of [-22.4,-20.6])box(group,.13,.68,.14,dark,x,.41,37.9);
  // Oficina de estrada: bancada, caixa de ferramentas e galão de água.
  box(group,4.8,2.7,3.4,mat('#6f7776'),-17.5,1.43,18.5);
  box(group,5.4,.26,3.9,red,-17.5,2.83,18.5);
  sign(group,'OFICINA RUDY',-17.5,3.18,20.66,4.7,.62,'#4c6264');
  box(group,3.0,.83,1.15,mat('#76614c'),-18,.57,21);
  box(group,.90,.62,.52,mat('#aa5551'),-19.05,1.31,21.2);
  cyl(group,.36,.37,.85,mat('#789bb0'),-16.85,1.14,21.15,10);
  for(const [x,z] of [[-37,33],[-20,38],[-18,20]]){
    cyl(group,.24,.25,.95,mat('#a57c50'),x,.48,z,8);
    ball(group,.35,mat('#c6a467'),x,.98,z,0);
  }
  // Veículo low poly com rodas girando e suspensão. Fica na pista ao dirigir.
  const van=new THREE.Group();van.position.set(cx,0,cz);group.add(van);
  const body=mat('#d0b68b'),roof=mat('#dcd1b0'),glazing=mat('#688d9c');
  box(van,2.22,1.15,4.35,body,0,1.10,0);
  box(van,2.15,.74,2.95,roof,0,1.99,-.30);
  box(van,1.89,.72,.11,glazing,0,1.90,-1.85);
  box(van,1.89,.69,.11,glazing,0,1.89,1.20);
  for(const side of [-1,1]){
    box(van,.10,.64,2.45,glazing,side*1.085,1.92,-.3);
    box(van,.27,.24,.32,dark,side*1.15,1.60,-1.55);
    box(van,.35,.15,.18,mat('#fff1be'),side*.78,1.10,-2.22);
  }
  const wheels=[];
  for(const x of [-1.16,1.16])for(const z of [-1.43,1.42]){
    const w=cyl(van,.51,.51,.27,dark,x,.59,z,11);
    w.rotation.z=Math.PI/2;wheels.push(w);
    const hub=cyl(van,.23,.23,.285,mat('#aeb9b7'),x+(x<0?-.015:.015),.59,z,10);
    hub.rotation.z=Math.PI/2;
  }
  box(van,1.45,.10,.12,mat('#e2b66b'),0,2.40,-.35);
  box(van,1.90,.12,.18,mat('#a0443d'),0,.68,2.18);
  // Obstáculos representados por barril, cone e caixa; coordenadas de estrada
  // vêm exclusivamente das regras de jogo do road-state.
  const hazards=new Map();
  for(const stage of [29,33]){
    const items=[];
    for(const [i,h] of ROAD_DRIVES[stage].hazards.entries()){
      const obj=new THREE.Group();group.add(obj);
      if(h.type==='cone'){
        cyl(obj,.08,.39,.74,mat('#e1904a'),0,.39,0,7);
        box(obj,.78,.09,.78,dark,0,.05,0);
      }else if(h.type==='barrel'){
        cyl(obj,.42,.42,.92,mat('#c16f4a'),0,.50,0,10);
        for(const y of [.25,.75])cyl(obj,.44,.44,.075,mat('#eee1ca'),0,y,0,10);
      }else{
        box(obj,.93,.76,.94,mat('#987654'),0,.42,0);
        box(obj,1.0,.09,.18,mat('#c6ae83'),0,.56,0);
      }
      items.push({obj,h});
      obj.visible=false;
    }
    hazards.set(stage,items);
  }
  const routeColliders=[
    {x1:-41.75,x2:-36.25,z1:36.9,z2:41.2,height:3.5,tag:'road-diner'},
    {x1:-20.2,x2:-14.8,z1:16.45,z2:20.55,height:3.2,tag:'road-garage'},
    {x1:-19.65,x2:-16.35,z1:20.35,z2:21.65,height:1.6,tag:'road-workbench'},
    {x1:-23,x2:-20,z1:37.4,z2:38.7,height:1.3,tag:'road-bench'}
  ];
  const people=[];
  for(let i=0;i<ROAD_NPCS.length;i++){
    const data=ROAD_NPCS[i],g=new THREE.Group();
    g.position.set(data.x,0,data.z);group.add(g);
    const torso=new THREE.Group();torso.position.y=1.30;g.add(torso);
    const shirt=mat(['#a66c59','#657f80','#846987'][i]),skin=mat('#bf9376');
    box(torso,.72,.92,.50,shirt,0,.03,0);
    ball(torso,.34,skin,0,.77,0,1);
    for(const side of [-1,1]){
      const arm=new THREE.Group();arm.position.set(side*.47,.31,0);torso.add(arm);
      cyl(arm,.14,.13,.73,shirt,0,-.32,0,8);
      if(side===1)g.userData.arm=arm;
      box(g,.23,.78,.30,dark,side*.21,.47,0);
    }
    box(torso,.72,.15,.49,mat('#665241'),0,1.08,0);
    g.userData.torso=torso;g.userData.phase=i*2.2;people.push(g);
  }
  let active=false,driving=false;
  const roadGroup={group,van,people,
    setActive(on){
      if(active===!!on)return;
      active=!!on;group.visible=active;
      if(active)colliders.push(...routeColliders);
      else for(const solid of routeColliders){const ix=colliders.indexOf(solid);if(ix>=0)colliders.splice(ix,1);}
    },
    setDriving(value){
      driving=!!value;
      for(const list of hazards.values())for(const {obj} of list)obj.visible=false;
      van.visible=true;
    },
    setDrive(run){
      if(!run||!ROAD_DRIVES[run.stage])return;
      van.position.x=cx+run.offset;
      van.rotation.z=-run.offset*.035;
      van.rotation.y=-run.offset*.020;
      for(const [stage,items] of hazards){
        for(const {obj,h} of items){
          const distance=h.at-run.progress;
          obj.visible=active&&driving&&stage===run.stage&&distance>-13&&distance<115;
          obj.position.set(cx+h.lane*2.27,0,cz-distance*.115);
        }
      }
      for(const line of laneStripes){
        const delta=((line.baseZ+run.progress*.07-12)%30+30)%30;
        line.mesh.position.z=12+delta;
      }
      for(const w of wheels)w.rotation.x=-run.progress*.22;
    },
    update(t,step){
      if(!active)return;
      for(let i=0;i<people.length;i++){
        const n=people[i],v=t*1.3+n.userData.phase;
        n.userData.torso.position.y=1.30+Math.sin(v)*.015;
        n.userData.torso.rotation.z=Math.sin(v)*.03;
        n.userData.arm.rotation.x=-.16+Math.sin(v)*.12;
      }
      if(!driving){van.position.x=cx;van.rotation.set(0,0,0);}
    },
    isDriving(){return driving;}
  };
  return roadGroup;
}
