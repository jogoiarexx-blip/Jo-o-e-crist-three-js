import * as THREE from 'three';
import {DESERT_ROOM,DESERT_SHADE,DESERT_NPCS,desertColliders,desertCarryActive} from './desert-state.js';

// Ambiente compacto independente, ativado apenas depois do fim da Route 66.
export function buildDesert(scene,colliders,{box,ball,cyl,sign,mat}){
  const root=new THREE.Group();root.visible=false;scene.add(root);
  const sand=mat('#d1b17a'),stone=mat('#a78963'),dark=mat('#3b4345');
  const metal=mat('#65757a'),rust=mat('#9e5f43'),cream=mat('#e4d9b8');
  const pale=mat('#eee6ca'),blue=mat('#4e8eab'),red=mat('#b55e4b');
  const {xMin,xMax,zMin,zMax}=DESERT_ROOM;
  box(root,xMax-xMin,.12,zMax-zMin,sand,(xMin+xMax)/2,.07,(zMin+zMax)/2);
  // Estrada interrompida; superfícies levemente separadas para evitar z-fighting.
  box(root,8.0,.07,28,mat('#58534d'),-62.4,.16,-13.4);
  for(let z=-27;z<2;z+=3.2)box(root,.10,.03,1.45,pale,-62.4,.22,z);
  // Montanhas e rochas de baixa contagem poligonal ao redor do mapa.
  for(const [x,z,r] of [[-78,-29,4],[-53,-31,3],[-45,6,4.0],[-76,7,4.6],[-46,-9,2.5]]){
    const rock=ball(root,r,stone,x,r*.36,z,0);rock.scale.set(1.2,.72,.95);
  }
  // Paisagem árida com cactos; objetos decorativos fora da circulação.
  for(const [x,z] of [[-76,-28],[-76,-19],[-48,-27],[-49,0],[-76,3],[-57,9],[-45,11]]){
    const cactus=mat('#658965');
    cyl(root,.24,.30,1.9,cactus,x,.99,z,8);
    cyl(root,.15,.17,.75,cactus,x+.52,1.27,z,8);
    box(root,.59,.14,.14,cactus,x+.27,.87,z);
  }
  // Van quebrada: modelo estático correspondente à van da Route 66.
  const van=new THREE.Group();van.position.set(-64.15,0,-13.0);root.add(van);
  box(van,2.35,1.08,4.25,mat('#d1b98d'),0,1.03,0);
  box(van,2.22,.73,2.8,cream,0,1.94,-.35);
  for(const x of [-1.22,1.22])for(const z of [-1.39,1.35]){
    const wheel=cyl(van,.51,.51,.28,dark,x,.58,z,10);wheel.rotation.z=Math.PI/2;
  }
  box(van,2.0,.70,.10,blue,0,1.88,-1.76);
  box(van,2.0,.13,.10,rust,0,.78,2.13);
  // Tampa do motor aberta e vapor delicado; não atravessa personagens.
  const bonnet=new THREE.Group();bonnet.position.set(0,1.52,-1.57);van.add(bonnet);
  const hood=box(bonnet,2.24,.13,1.38,cream,0,.38,-.40);hood.rotation.x=.30;
  const steam=[];
  for(let i=0;i<4;i++){
    const cloud=ball(van,.19,mat('#c5d3cd',{transparent:true,opacity:.30}),-.45+i*.32,2.05,-1.67,0);
    cloud.castShadow=false;steam.push(cloud);
  }
  // Pequeno abrigo sombreado com telhado, banco e galão.
  for(const x of [-74.8,-65.8])for(const z of [-24.7,-16.4])
    cyl(root,.16,.18,3.15,metal,x,1.58,z,8);
  box(root,10.6,.22,9.45,mat('#8d6753',{transparent:true,opacity:.52,depthWrite:false}),DESERT_SHADE.x,3.22,DESERT_SHADE.z);
  box(root,7.1,.08,4.0,mat('#b19972'),-70,.20,-20);
  box(root,3.1,.19,.67,mat('#7e6248'),-68.5,.71,-23.2);
  for(const x of [-69.6,-67.3])box(root,.14,.75,.14,dark,x,.38,-23.2);
  sign(root,'SOMBRA · DESCANSE AQUI',-70,2.58,-16.13,8.8,.51,'#60523e');
  // Posto/mercearia. Construído como corpo sólido, jogador interage do lado de fora.
  box(root,11.5,3.45,4.0,mat('#a77c5c'),-73.25,1.83,-9);
  box(root,12.2,.27,4.7,mat('#bf946a'),-73.25,3.68,-9);
  sign(root,'POSTO ÁGUA CLARA',-73.25,3.15,-6.86,10.7,.71,'#4d6c67');
  sign(root,'AZUL = ÁGUA POTÁVEL',-76.3,2.12,-6.80,4.9,.48,'#536f68');
  sign(root,'VERMELHA = DESATIVADA',-70.4,2.12,-6.79,5.0,.48,'#715249');
  // Bombas identificadas visualmente, fora do caminho central.
  for(const [x,color,label] of [[-71.6,blue,'POTÁVEL'],[-70.0,red,'DESATIVADA']]){
    cyl(root,.37,.44,.95,metal,x,.49,-5.35,8);
    box(root,.59,1.22,.56,color,x,1.38,-5.35);
    sign(root,label,x,1.5,-5.05,.64,.20,'#48636a');
  }
  // Oficina de apoio, sem bloquear acesso ao mecânico.
  box(root,10,3.1,4.7,mat('#77726a'),-52.5,1.68,-21.85);
  box(root,10.6,.25,5.1,rust,-52.5,3.33,-21.85);
  sign(root,'ZECA · OFICINA',-52.5,2.78,-19.33,8.1,.59,'#5c5651');
  box(root,3.0,.88,.80,mat('#80684f'),-53.2,.58,-18.4);
  box(root,.9,.60,.54,rust,-53.6,1.36,-18.4);
  cyl(root,.37,.38,.79,mat('#8ba4ad'),-51.8,1.40,-18.4,8);
  // Placas contraditórias. Uma aponta para a rua fechada.
  for(const [x,z] of [[-56,-3],[-52,-3]]){
    cyl(root,.10,.14,2.55,dark,x,1.3,z,7);
  }
  sign(root,'VEGAS ← ESTRADA FECHADA',-56,2.74,-2.86,5.2,.66,'#87634c');
  sign(root,'LAS VEGAS → 35 MILHAS',-52,3.28,-2.84,5.3,.66,'#46634e');
  // Mirante com luzes muito distantes no horizonte, sem simular cidade já jogável.
  box(root,6.0,.12,5.2,mat('#c3a076'),-52,.15,8);
  // Placa ao lado do parapeito: não tapa a vista de Vegas.
  cyl(root,.09,.12,2.4,mat('#3b4345'),-58.2,1.2,9.6,7);
  sign(root,'MIRANTE · NEVADA',-58.2,2.55,9.6,4.4,.55,'#645640');
  // v0.7.0: a miniatura de prédios atrás do mirante foi substituída pela
  // silhueta de Las Vegas em escala real no horizonte (src/scenery.js).
  // Parapeito de madeira para enquadrar a vista sem bloquear o marcador.
  for(const x of [-55.4,-48.6])box(root,.18,1.0,.18,mat('#7b5a3e'),x,.6,10.3);
  box(root,6.9,.12,.14,mat('#8d6845'),-52,1.05,10.3);
  // Galão muda de posição por checkpoint: abrigo, bomba, mãos de João e van.
  const can=new THREE.Group();root.add(can);
  cyl(can,.35,.39,.80,mat('#6b99a7'),0,.42,0,9);
  cyl(can,.24,.24,.10,cream,0,.86,0,9);
  const handle=box(can,.38,.11,.13,dark,0,1.02,0);
  handle.rotation.z=.08;
  const carryState={step:35,joao:{x:DESERT_ROOM.xMin,z:0}};
  const npcs=[];
  for(let i=0;i<DESERT_NPCS.length;i++){
    const data=DESERT_NPCS[i],person=new THREE.Group();
    person.position.set(data.x,0,data.z);root.add(person);
    const outfit=mat(['#81745f','#a26d58','#73829c'][i]),skin=mat('#bd8b70');
    const torso=new THREE.Group();torso.position.y=1.31;person.add(torso);
    box(torso,.78,.94,.47,outfit,0,.06,0);
    ball(torso,.34,skin,0,.76,.03,1);
    for(const side of [-1,1]){
      const arm=new THREE.Group();arm.position.set(side*.5,.31,0);torso.add(arm);
      cyl(arm,.14,.13,.71,outfit,0,-.33,0,8);
      if(side===1)person.userData.arm=arm;
      box(person,.25,.82,.32,dark,side*.21,.48,0);
    }
    box(torso,.86,.12,.50,mat('#594e41'),0,1.05,0);
    person.userData.torso=torso;person.userData.phase=i*2.2;person.rotation.y=i*.5-.7;
    npcs.push(person);
  }
  const solid=desertColliders();
  let active=false;
  return {
    root,van,can,npcs,
    setActive(on){
      if(active===!!on)return;
      active=!!on;root.visible=active;
      if(active)colliders.push(...solid);
      else for(const box of solid){const ix=colliders.indexOf(box);if(ix>=0)colliders.splice(ix,1);}
    },
    setStep(step){carryState.step=step;this.setCarrier(carryState.joao);},
    setCarrier(pos){
      if(pos&&Number.isFinite(pos.x)&&Number.isFinite(pos.z))carryState.joao={x:pos.x,z:pos.z};
      const stage=carryState.step;
      can.visible=stage>=37;
      if(stage===40)can.position.set(carryState.joao.x+.28,.70,carryState.joao.z+.33);
      else if(stage>=41)can.position.set(-60.5,.05,-12.7);
      else if(stage>=39)can.position.set(-68.4,0,-4.0);
      else can.position.set(-72.0,0,-19.2);
      can.scale.setScalar(stage===40?.83:1);
    },
    update(time){
      if(!active)return;
      for(let i=0;i<npcs.length;i++){
        const p=npcs[i],t=time*1.1+p.userData.phase;
        p.userData.torso.position.y=1.31+Math.sin(t)*.012;
        p.userData.torso.rotation.z=Math.sin(t)*.025;
        p.userData.arm.rotation.x=-.18+Math.sin(t*1.4)*.12;
      }
      for(let i=0;i<steam.length;i++){
        const p=steam[i];p.position.y=2.05+((time*.31+i*.24)%1.1);p.scale.setScalar(.7+((time*.27+i*.31)%1)*.8);
        p.visible=carryState.step<43;
      }
    }
  };
}
