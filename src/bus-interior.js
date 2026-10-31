import * as THREE from 'three';
import {BUS_ROOM,BUS_NPCS,BUS_PROPS,makeBusRoomColliders} from './bus-state.js';

// Cenário de interior em mini-hub separado, oculto até o embarque. Todos os
// colliders pertencem apenas ao capítulo: a Fazenda e a Rodoviária não mudam.
export function buildBusInterior(scene,colliders,{box,ball,cyl,sign,mat}){
  const room=new THREE.Group();scene.add(room);room.visible=false;
  const {xMin,xMax,zMin,zMax,cx,cz}=BUS_ROOM;
  const steel=mat('#283a42'),floor=mat('#46565a'),seat=mat('#85536c');
  const carpet=mat('#4d6263'),windows=mat('#94bec3'),lining=mat('#dbb999');
  const gold=mat('#e4bf72'),ink=mat('#25323a');
  // Passagem central livre; piso, teto retrátil e quatro paredes com janelas.
  box(room,xMax-xMin,.18,zMax-zMin,floor,cx,.12,cz);
  box(room,16.8,.03,2.36,carpet,cx,.24,cz);
  for(const z of [zMin,zMax]){
    box(room,xMax-xMin,1.0,.21,steel,cx,.78,z);
    box(room,xMax-xMin,1.18,.13,windows,cx,2.05,z);
    box(room,xMax-xMin,.76,.18,lining,cx,3.08,z);
    for(let x=xMin+1.75;x<xMax-.3;x+=3.3){
      box(room,.16,1.28,.26,steel,x,2.09,z);
      box(room,.16,.95,.30,gold,x,2.1,z+(z===zMin?.07:-.07));
    }
  }
  for(const x of [xMin,xMax]){
    box(room,.16,3.72,zMax-zMin,steel,x,1.9,cz);
    box(room,.18,1.13,5.6,windows,x,2.28,cz);
  }
  const roof=new THREE.Group();room.add(roof);
  box(roof,xMax-xMin, .24,zMax-zMin,steel,cx,3.92,cz);
  for(let x=xMin+2;x<xMax-1;x+=3.1){
    box(roof,1.2,.05,.24,gold,x,3.74,cz);
  }
  const busLight=new THREE.PointLight('#ffe7c1',18,25,2);
  busLight.position.set(cx,3.1,cz);room.add(busLight);
  // Fileiras de bancos e encostos curvos low poly; nenhuma malha invade o corredor.
  for(const x of [BUS_PROPS.seat.x,106.2,109.4,112.6]){
    for(const z of [BUS_PROPS.seat.z,-29.6]){
      const direction=z<cz?1:-1;
      box(room,1.76,.30,1.52,seat,x,.93,z);
      const back=box(room,.28,1.07,1.52,mat('#6c4354'),x-.68,1.51,z);
      back.rotation.z=-.07;
      box(room,.12,.55,.24,gold,x+.54,1.43,z+direction*.55);
      for(const dx of [-.62,.64])box(room,.12,.8,.12,steel,x+dx,.46,z);
      box(room,1.48,.05,.12,mat('#edc7a0'),x,1.10,z);
    }
  }
  // Bagageiro, passagens fixadas e bagagens da equipe.
  for(const z of [-36.1,-29.1]){
    box(room,15.5,.11,.43,gold,109,3.22,z);
    for(let x=102.5;x<115;x+=3.2){
      box(room,1.25,.47,.62,mat('#997b4e'),x,3.47,z);
    }
  }
  // Palco improvisado da dança, no centro do corredor e sem colisões.
  box(room,3.6,.027,2.02,mat('#9e6a73'),BUS_PROPS.stage.x,.25,BUS_PROPS.stage.z);
  for(let i=0;i<4;i++){
    const x=107.7+i*.88;
    box(room,.47,.034,.10,gold,x,.28,-31.65);
  }
  sign(room,'EXCURSÃO ESTELAR',108.6,3.38,-28.94,8.7,.55,'#6e3f69');
  sign(room,'FIGURINOS E SOM',114.1,3.43,-36.85,5.45,.52,'#584152');
  sign(room,'PRÓXIMA PARADA: SHOW!',103.7,3.40,-36.85,6.0,.52,'#4c5860');
  // Caixa de equipamentos: rótulos diferentes tornam a escolha visual verificável.
  for(const [x,color,tag,star] of [[115.95,'#994b47','FIGURINOS',false],[BUS_PROPS.case.x,'#333a42','ESTELAR',true],[117.25,'#486e59','ESPORTE',false]]){
    box(room,.59,.65,.70,mat(color),x,.64,-29.97);
    box(room,.40,.07,.09,steel,x,1.04,-29.53);
    if(star)ball(room,.13,gold,x,.77,-29.59,0);
    sign(room,tag,x,.46,-29.58,.56,.16,'#e9dcbe','#2b333a');
  }
  // Mesa de som: três conectores coloridos, fader e microfone que acende após conserto.
  const soundRack=new THREE.Group();room.add(soundRack);
  box(soundRack,1.56,1.2,1.45,steel,BUS_PROPS.rack.x,.73,BUS_PROPS.rack.z);
  box(soundRack,1.49,.10,1.28,mat('#768383'),116.55,1.38,-35.48);
  for(const [x,color] of [[116.1,'#bc4b4c'],[116.55,'#4d83d0'],[117.0,'#d9b552']]){
    const socket=cyl(soundRack,.13,.13,.06,mat(color),x,1.48,-35.70,10);
    socket.rotation.x=Math.PI/2;
  }
  const meter=box(soundRack,.86,.08,.18,mat('#aa624b'),116.55,1.55,-35.03);
  const mic=new THREE.Group();mic.position.set(BUS_PROPS.mic.x,.35,BUS_PROPS.mic.z);room.add(mic);
  cyl(mic,.065,.08,1.8,steel,0,.9,0,8);
  ball(mic,.20,mat('#434d57'),0,1.85,0,1);
  box(mic,.65,.12,.2,steel,0,.1,0);
  // Cabine do motorista: a missão de revelação aponta para esta área.
  sign(room,'MOTORISTA · DESTINO',100.55,2.82,-36.77,4.0,.43,'#4c5860');
  // NPCs da trupe: cada qual tem figura, roupa e reação distintos.
  const troupe=[];
  for(let i=0;i<BUS_NPCS.length;i++){
    const npc=BUS_NPCS[i];
    const person=new THREE.Group();person.position.set(npc.x,0,npc.z);room.add(person);
    const colors=['#9c6db4','#b99a59','#558f8d'];
    const outfit=mat(colors[i]),skin=mat(i===0?'#c99174':'#ac785e');
    const trunk=new THREE.Group();trunk.position.y=1.25;person.add(trunk);
    box(trunk,.76,.96,.52,outfit,0,.05,0);
    ball(trunk,.33,skin,0,.81,.06,1);
    for(const side of [-1,1]){
      const arm=new THREE.Group();arm.position.set(side*.5,.35,0);trunk.add(arm);
      cyl(arm,.14,.12,.73,outfit,0,-.32,0,8);
      ball(arm,.11,skin,0,-.72,.06,0);
      if(side===1)person.userData.arm=arm;
      box(person,.26,.83,.33,mat('#464650'),side*.20,.46,0);
      box(person,.33,.15,.43,mat('#33323a'),side*.20,.07,.12);
    }
    if(i===0){
      ball(trunk,.38,mat('#594654'),0,1.12,-.08,1);
      box(trunk,.89,.08,.29,gold,0,1.20,.06);
    }else if(i===1){
      box(trunk,.74,.12,.45,gold,0,1.13,0);
    }else{
      box(trunk,.84,.12,.42,mat('#344554'),0,1.09,0);
    }
    person.userData.trunk=trunk;person.userData.phase=i*2.35;
    person.rotation.y=i===1?.75:-.65;
    troupe.push(person);
  }
  // Bagagem funcional visível após a missão; foge das colisões do corredor.
  const repairedLight=ball(room,.22,mat('#ab4f4c',{emissive:'#000000'}),116.55,2.47,-35.3,1);
  const localColliders=makeBusRoomColliders();
  // v0.7.0: luzes de palco. Acendem quando a mesa de som volta a funcionar e
  // varrem o corredor durante o número musical (cones aditivos, sem sombra).
  const stage={x:109.1,z:-32.55};
  const spots=[];
  const spotGeometry=new THREE.ConeGeometry(.95,3.2,18,1,true);spotGeometry.translate(0,-1.6,0);
  ['#ff6fb5','#ffd36a','#6fd8ff'].forEach((color,i)=>{
    const pivot=new THREE.Group();pivot.position.set(stage.x-2.6+i*2.6,3.55,stage.z);room.add(pivot);
    box(pivot,.34,.26,.34,ink,0,.1,0).castShadow=false;
    const cone=new THREE.Mesh(spotGeometry,new THREE.MeshBasicMaterial({color,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
    pivot.add(cone);spots.push({pivot,cone,phase:i*2.1});
  });
  let active=false,repaired=false,dancing=false;
  return {
    room,troupe,spawn:{x:101.3,z:-32.55},
    setActive(on){
      if(active===!!on)return;
      active=!!on;room.visible=active;
      if(active)colliders.push(...localColliders);
      else for(const obj of localColliders){const ix=colliders.indexOf(obj);if(ix>=0)colliders.splice(ix,1);}
    },
    setSoundFixed(fixed){
      repaired=!!fixed;
      meter.material.color.set(repaired?'#63b882':'#aa624b');
      repairedLight.material.color.set(repaired?'#69d9ab':'#ab4f4c');
      repairedLight.material.emissive.set(repaired?'#1d7659':'#000000');
    },
    setDancing(on){dancing=!!on;},
    update(t){
      if(!active)return;
      // Câmera acompanha pelo teto vazado, impedindo que o jogador fique ocluído.
      roof.visible=false;
      for(let i=0;i<troupe.length;i++){
        const p=troupe[i],beat=t*(dancing?5.8:1.25)+p.userData.phase;
        p.userData.trunk.position.y=1.25+(dancing?Math.abs(Math.sin(beat))*.13:Math.sin(beat)*.02);
        p.userData.trunk.rotation.z=Math.sin(beat)*(dancing?.15:.024);
        p.userData.arm.rotation.x=dancing?-1.25+Math.sin(beat*1.2)*.4:-.1+Math.sin(beat)*.1;
      }
      mic.rotation.z=Math.sin(t*1.6)*.008;
      for(const s of spots){
        const target=dancing?.24:repaired?.07:0;
        s.cone.material.opacity+=(target-s.cone.material.opacity)*.08;
        const swing=dancing?.55:.18;
        s.pivot.rotation.z=Math.sin(t*(dancing?2.4:.6)+s.phase)*swing;
        s.pivot.rotation.x=Math.cos(t*(dancing?1.9:.5)+s.phase)*swing*.6;
      }
    }
  };
}
