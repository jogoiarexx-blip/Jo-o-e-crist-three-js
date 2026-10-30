import * as THREE from 'three';
import {AIRPORT_ROOM,AIRPORT_NPCS,airportColliders} from './airport-state.js';

// Hub 3: geometria isolada, apenas ativada em gameplay a partir do aeroporto.
// Coordenadas negativas em Z o afastam dos prédios e da Rodoviária existentes.
export function buildAirport(scene,colliders,{box,ball,cyl,sign,mat}){
  const group=new THREE.Group();scene.add(group);group.visible=false;
  const {xMin,xMax,zMin,zMax,cx,cz}=AIRPORT_ROOM;
  const cream=mat('#d9d4c9'),tile=mat('#acbbb7'),ink=mat('#344b55');
  const steel=mat('#71888e'),glass=mat('#a7cbd0'),blue=mat('#376878');
  const gold=mat('#f0c476'),red=mat('#be7965'),green=mat('#57998b');
  box(group,xMax-xMin,.22,zMax-zMin,tile,cx,.10,cz);
  for(let x=39;x<=95;x+=3.6){
    const line=box(group,.045,.01,zMax-zMin-.7,cream,x,.23,cz);
    line.castShadow=false;
  }
  for(let z=-39;z<=-24;z+=3){
    const line=box(group,xMax-xMin-.6,.01,.05,cream,cx,.23,z);
    line.castShadow=false;
  }
  // Estrutura: pano de vidro, pilares, teto retrátil para câmera de jogo.
  for(const z of [zMin,zMax]){
    box(group,xMax-xMin,1.10,.30,ink,cx,.68,z);
    box(group,xMax-xMin,2.05,.19,glass,cx,2.20,z);
    box(group,xMax-xMin,.72,.28,cream,cx,3.64,z);
    for(let x=xMin+2;x<xMax-1;x+=5.5){
      box(group,.22,3.65,.43,steel,x,1.93,z);
    }
  }
  for(const x of [xMin,xMax]){
    box(group,.28,4.2,zMax-zMin,cream,x,2.05,cz);
    box(group,.30,1.30,7.5,glass,x,2.18,cz);
  }
  const roof=new THREE.Group();group.add(roof);
  box(roof,xMax-xMin,.24,zMax-zMin,cream,cx,4.32,cz);
  for(let x=xMin+3;x<xMax-2;x+=7)box(roof,3.5,.07,.35,mat('#f5eccc'),x,4.09,cz);
  roof.visible=false;
  const ambience=new THREE.PointLight('#fff2d7',13,58,2);ambience.position.set(cx,3.65,cz);group.add(ambience);
  sign(group,'AEROPORTO BOA SORTE',51,3.70,-23.25,17,.78,'#315b6a');
  sign(group,'PARTIDAS / DEPARTURES',66.5,3.70,-23.25,15,.72,'#315b6a');
  sign(group,'PORTÕES C / GATES C',88.3,3.70,-23.25,14,.74,'#315b6a');
  // Painel de voos e orientação na entrada.
  box(group,3.7,2.35,.16,ink,43,1.75,-27.7);
  sign(group,'PAINEL DE VOOS',43,2.50,-27.58,3.32,.51,'#314d51');
  sign(group,'BS408 · VEGAS VIA CONEXÃO',43,1.83,-27.58,3.45,.40,'#314d51');
  sign(group,'BS210 · REGIONAL',43,1.27,-27.58,3.45,.36,'#314d51');
  // Balcão check-in com placas; o corredor principal z=-31.5 fica livre.
  box(group,4,1.0,1.85,blue,51,.66,-26.3);
  box(group,4.25,.12,1.95,cream,51,1.22,-26.3);
  sign(group,'B · BS408',51,2.66,-25.6,3.6,.61,'#496874');
  sign(group,'CONEXÃO INTERNACIONAL',51,2.08,-25.6,3.75,.42,'#496874');
  // Café e poucos assentos de aeroporto, contra as paredes, sem bloquear o corredor.
  for(const [x,z] of [[43,-36.4],[57,-26.2],[87,-36.5]]){
    box(group,2.8,.22,.65,mat('#637d80'),x,.79,z);
    box(group,2.8,.58,.16,blue,x,1.18,z-.23);
    for(const side of [-1,1])box(group,.12,.75,.12,steel,x+side*1.18,.43,z);
  }
  // Achados e perdidos, três pastas com cores diferentes e objetos visíveis.
  box(group,4,1.12,1.67,mat('#81725a'),60,.75,-36.6);
  box(group,4.20,.10,1.84,cream,60,1.34,-36.6);
  sign(group,'ACHADOS E PERDIDOS',60,2.83,-37.20,4.4,.57,'#56605a');
  for(const [x,col,label] of [[59,'#b95555','DUDA'],[60,'#427dba','JOÃO'],[61,'#8b8e95','MANUAL']]){
    const file=box(group,.59,.07,.55,mat(col),x,1.48,-36.6);file.rotation.y=.15;
    sign(group,label,x,1.54,-36.27,.57,.18,'#efe8d7','#303e41');
  }
  // Ponto de despacho: pote de farofa, mala marrom e leitor de etiquetas.
  box(group,3.4,1.05,1.75,mat('#626b74'),69,.65,-36.6);
  box(group,3.65,.10,1.90,cream,69,1.22,-36.6);
  const bag=box(group,1.4,.90,.65,mat('#88644a'),68.6,1.75,-36.5);
  box(group,.32,.12,.56,ink,68.6,2.25,-36.5);
  cyl(group,.28,.30,.64,mat('#c8a567'),70,1.60,-36.5,10);
  sign(group,'INSPEÇÃO DE BAGAGENS',69,2.80,-37.23,5.5,.56,'#496874');
  // Scanner com arco metálico, bandejas e esteira física.
  box(group,3.4,1.02,1.75,steel,76,.67,-26.5);
  box(group,3.48,.10,1.95,cream,76,1.23,-26.5);
  box(group,3.5,.17,.32,ink,76,1.34,-25.9);
  for(const x of [74.8,77.2])box(group,.19,2.75,.35,blue,x,1.66,-29.55);
  box(group,2.58,.20,.37,blue,76,3.05,-29.55);
  for(const x of [75.2,76.8])box(group,.60,.09,.55,mat('#c9c8ba'),x,1.39,-26.2);
  sign(group,'RETIRE MOEDAS E CHAVES',76,2.65,-25.5,5.5,.45,'#46616c');
  // Painel de mudança do portão com informação visível para quem investiga.
  box(group,4.25,2.4,.15,ink,82,2.03,-27.1);
  sign(group,'PORTÕES ATUALIZADOS',82,2.71,-26.98,4.0,.53,'#3e6473');
  sign(group,'BS408 → C7',82,1.93,-26.98,4.0,.64,'#3e6473');
  sign(group,'B2 → CANCELADO',82,1.18,-26.98,4.0,.46,'#3e6473');
  // Esteira rolante: superfície animável; o QTE decorre do tropeço de João.
  const belt=box(group,6.25,.16,2.18,mat('#6f8c8e'),87.3,.33,cz);
  const beltStripes=[];
  for(let i=0;i<7;i++){
    const line=box(group,.065,.018,2.01,gold,84.8+i*.82,.43,cz);
    beltStripes.push(line);
  }
  for(const z of [cz-1.25,cz+1.25]){
    box(group,6.45,.09,.14,ink,87.3,.97,z);
    for(const x of [84.6,87.3,90])cyl(group,.065,.08,1.25,steel,x,.60,z,7);
  }
  sign(group,'PORTÃO C7',92.9,3.0,-26.15,4.1,.74,'#315b6a');
  // Balcão final e portão de acesso.
  box(group,2.6,1.02,1.72,blue,93,.64,-26.4);
  box(group,2.75,.10,1.85,cream,93,1.19,-26.4);
  for(const z of [-34.5,-28.7]){
    cyl(group,.10,.13,1.35,steel,94,.80,z,8);
  }
  box(group,1.6,.13,.55,gold,94,1.44,-28.8);
  // Silhueta estática do avião pela janela, sem carregamento de GLB pesado.
  const plane=new THREE.Group();plane.position.set(91,1.7,-21.3);group.add(plane);
  const fuselage=box(plane,4.7,.46,.65,mat('#f4f1e9'),0,0,0);
  const wing=box(plane,1.35,.11,3.8,mat('#e3e2df'),.36,-.03,0);
  const tail=box(plane,.60,1.30,.13,blue,-1.75,.52,0);
  wing.castShadow=false;fuselage.castShadow=false;tail.castShadow=false;
  // NPCs em posição lateral, fora da passagem z=-31.5.
  const people=[];
  for(let i=0;i<AIRPORT_NPCS.length;i++){
    const npc=AIRPORT_NPCS[i],g=new THREE.Group();g.position.set(npc.x,0,npc.z);group.add(g);
    const uniform=mat(['#52788a','#96785c','#557a7e'][i]),skin=mat(['#c18c6e','#a8775c','#cb9676'][i]);
    const trunk=new THREE.Group();trunk.position.y=1.32;g.add(trunk);
    box(trunk,.74,.93,.47,uniform,0,.04,0);
    ball(trunk,.32,skin,0,.78,.03,1);
    for(const side of [-1,1]){
      const arm=new THREE.Group();arm.position.set(side*.48,.35,0);trunk.add(arm);
      cyl(arm,.125,.12,.72,uniform,0,-.33,0,8);
      if(side===1)g.userData.arm=arm;
      box(g,.24,.83,.29,ink,side*.18,.45,0);
    }
    box(trunk,.73,.12,.37,ink,0,1.04,0);
    g.userData.trunk=trunk;g.userData.phase=i*2;
    g.rotation.y=i===1?2.7:.6;
    people.push(g);
  }
  const local=airportColliders();
  let active=false;
  return {
    group,people,
    setActive(on){
      if(active===!!on)return;
      active=!!on;group.visible=active;
      if(active)colliders.push(...local);
      else for(const box of local){const at=colliders.indexOf(box);if(at>=0)colliders.splice(at,1);}
    },
    update(t){
      if(!active)return;
      for(let i=0;i<people.length;i++){
        const n=people[i],p=t*1.2+n.userData.phase;
        n.userData.trunk.rotation.z=Math.sin(p)*.028;
        n.userData.trunk.position.y=1.32+Math.sin(p)*.014;
        n.userData.arm.rotation.x=-.22+Math.sin(p*1.4)*.14;
      }
      for(let i=0;i<beltStripes.length;i++)
        beltStripes[i].position.x=84.8+((i*.82+t*.75)%5.7);
    }
  };
}
