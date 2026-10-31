import * as THREE from 'three';
import {CITY_NPCS,CITY_TARGETS} from './city-state.js';

// Construção independente da Rodoviária. O construtor reutiliza os materiais,
// meshes simples e helpers da Fazenda sem criar dependências no loop de jogo.
export function buildCityDistrict(scene,colliders,{box,ball,cyl,sign,mat}){
  const pavement=mat('#c8c1a7'),border=mat('#aaa18a'),ink=mat('#354443');
  const awning=mat('#527b79'),warm=mat('#d0a168'),glass=mat('#7ea7ad');
  // Calçada contínua até a rodoviária; a rua continua larga para o ciclista.
  box(scene,66,.16,5.25,pavement,79,.12,1.0);
  box(scene,48,.16,4.35,pavement,72,.12,20.25);
  box(scene,66,.20,.14,border,79,.22,3.65);
  box(scene,48,.08,2.0,mat('#aa9676'),83,.10,-2.35);
  // Faixa branca atravessando a via de leste para oeste? O jogador atravessa
  // perpendicularmente ao eixo Z, perto do aviso de trânsito.
  const white=mat('#e8e7d9');
  for(let z=5.1;z<=16.7;z+=2.05){
    box(scene,4.2,.025,1.0,white,68,.106,z);
  }
  // Placas ao lado da faixa, deixando livres os eixos de circulação.
  for(const z of [3.85,18.8]){
    cyl(scene,.13,.16,3.5,ink,65,1.75,z,7);
    sign(scene,'DEVAGAR',65,3.7,z,2.15,.53,'#ccae53','#28352e');
  }
  // Espaço principal da rodoviária: marquise, colunas e letreiros de portões.
  box(scene,24,.26,5.4,awning,83,4.55,-1.9);
  for(const x of [71.5,83,94.5])for(const z of [-4.45,.6]){
    cyl(scene,.18,.22,4.4,ink,x,2.2,z,9);
  }
  sign(scene,'TERMINAL BOA SORTE',82.8,4.76,.92,12.7,.87,'#345454');
  for(const [x,text] of [[74.5,'GUICHÊ'],[86.5,'BAGAGENS'],[94.2,'PORTÃO 3']]){
    sign(scene,text,x,3.48,-1.45,4.0,.52,'#415e5e');
  }
  sign(scene,'PORTÃO 2 · AEROPORTO',75.4,2.79,-3.06,6.2,.49,'#344f46');
  // Dois portões distintos: o jogador acertou o 2; João corre ao 3 atrás do chapéu.
  sign(scene,'PORTÃO 3 · EXCURSÃO ESTELAR',95,2.94,-3.07,8.2,.48,'#594668');
  sign(scene,'AGUARDE A CHAMADA · PORTÃO 2',76.4,2.10,-3.05,6.6,.37,'#466456');
  // Balcão de informações diante da fachada, com um expositor e corredor livre.
  box(scene,3.3,1.0,1.1,mat('#715942'),74.5,.58,-2.35);
  box(scene,3.52,.11,1.3,mat('#bba17d'),74.5,1.13,-2.35);
  box(scene,.7,.65,.12,glass,74.5,1.58,-2.3);
  colliders.push({x1:72.68,x2:76.32,z1:-3.03,z2:-1.67,height:1.75,tag:'terminal-desk'});
  // Carrinho de bagagens e três malas diferentes, com pistas visuais.
  const cart=new THREE.Group();cart.position.set(83,.05,-.25);scene.add(cart);
  box(cart,4.0,.18,1.65,ink,0,.56,0);
  for(const x of [-1.55,1.55])for(const z of [-.55,.55]){
    const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.27,.27,.18,10),mat('#252c30'));
    wheel.rotation.x=Math.PI/2;wheel.position.set(x,.32,z);cart.add(wheel);
  }
  for(const [x,color,tag,ribbon] of [
    [-1.27,'#ad664c','024','#bd5549'],
    [0,'#996d44','042','#497eab'],
    [1.25,'#4e727c','420','#7d8a83']
  ]){
    box(cart,.85,1.03,.58,mat(color),x,1.18,0);
    box(cart,.62,.12,.10,ink,x,1.78,0);
    box(cart,.20,.10,.33,mat(ribbon),x,1.3,.34);
    sign(cart,tag,x,1.28,.40,.55,.32,'#f0e4cf','#323b39');
  }
  colliders.push({x1:80.75,x2:85.25,z1:-1.2,z2:.9,height:1.85,tag:'baggage-cart'});
  // Quadro de horários e mapa da cidade, legíveis durante a exploração.
  box(scene,3.55,2.6,.24,ink,55,1.52,19.8);
  sign(scene,'PRAÇA CENTRAL',55,2.35,19.97,3.05,.55,'#4a6358');
  sign(scene,'RODOVIÁRIA  →',55,1.50,19.98,3.05,.62,'#4a6358');
  sign(scene,'BOAS-VINDAS',55,.79,19.98,2.75,.40,'#4a6358');
  colliders.push({x1:53.08,x2:56.92,z1:19.54,z2:20.03,height:2.95,tag:'city-guide'});
  // Quiosque e carrinho da florista, fora dos caminhos do jogador.
  box(scene,2.2,.15,1.4,mat('#806850'),63.9,1.0,-.7);
  for(const x of [63,64.8])for(const z of [-1.27,-.14]){
    box(scene,.12,1,.12,ink,x,.5,z);
  }
  for(let i=0;i<5;i++){
    const x=63.1+i*.37;
    cyl(scene,.10,.16,.50,mat('#789c74'),x,1.32,-.70,7);
    ball(scene,.22,mat(i%2?'#e3b57e':'#ca6f75'),x,1.69,-.70,1);
  }
  colliders.push({x1:62.63,x2:65.18,z1:-1.55,z2:.12,height:1.15,tag:'florist-cart'});
  // Bancos, lixeiras e canteiros para trazer escala humana.
  for(const [x,z] of [[58,1.2],[90,-.15]]){
    box(scene,2.7,.17,.55,mat('#7c5c43'),x,.78,z);
    box(scene,2.7,.63,.13,mat('#7c5c43'),x,1.20,z-.25);
    for(const dx of [-1.1,1.1])box(scene,.14,.72,.14,ink,x+dx,.38,z);
    colliders.push({x1:x-1.42,x2:x+1.42,z1:z-.43,z2:z+.37,height:1.45,tag:'city-bench'});
  }
  for(const [x,z] of [[61,3.2],[99,-1.2],[108,2.5]]){
    const pot=mat('#9f745d');
    cyl(scene,.50,.62,.72,pot,x,.37,z,8);
    cyl(scene,.39,.39,.06,mat('#655340'),x,.75,z,8);
    const foliage=mat('#50744f');
    for(let k=0;k<3;k++)ball(scene,.54,foliage,x+Math.cos(k*2.1)*.22,1.33+(.1*k),z+Math.sin(k*2.1)*.22,0);
    colliders.push({x1:x-.64,x2:x+.64,z1:z-.64,z2:z+.64,height:1.8,tag:'city-planter'});
  }
  // Três NPCs com roupas e silhuetas distintas, num custo geométrico contido.
  const npcs=[];
  for(const spec of CITY_NPCS){
    const g=new THREE.Group();g.position.set(spec.x,0,spec.z);scene.add(g);
    const isFlorist=spec.id==='florista',isPorter=spec.id==='carregador';
    const shirt=mat(isFlorist?'#8d566e':isPorter?'#a18a55':'#51778b');
    const pants=mat(isFlorist?'#5c604f':isPorter?'#4c5551':'#3f4249');
    const skin=mat(isFlorist?'#c98b69':'#b98260');
    const gbody=new THREE.Group();gbody.position.y=1.4;g.add(gbody);
    box(gbody,.78,.98,.45,shirt,0,0,0);
    ball(gbody,.34,skin,0,.73,.06,1);
    box(gbody,.17,.12,.12,mat('#362d2b'),0,.65,.37);
    for(const side of [-1,1]){
      const arm=new THREE.Group();arm.position.set(side*.52,.34,0);gbody.add(arm);
      cyl(arm,.13,.12,.75,shirt,0,-.35,0,8);
      ball(arm,.11,skin,0,-.78,.03,0);
      box(g,.25,.83,.30,pants,side*.19,.52,0);
      box(g,.33,.17,.45,mat('#3d3937'),side*.19,.12,.10);
      if(side===1)g.userData.arm=arm;
    }
    if(isFlorist){
      cyl(gbody,.42,.39,.14,mat('#6b634a'),0,1.07,0,8);
      box(gbody,.85,.065,.55,mat('#a88a60'),0,1.00,.13);
    }else if(isPorter){
      box(gbody,.77,.21,.49,mat('#82755d'),0,1.06,.02);
      box(gbody,.38,.30,.22,mat('#c0b294'),0,1.16,.11);
    }else{
      box(gbody,.82,.20,.60,mat('#374857'),0,1.10,.04);
      box(gbody,.64,.13,.18,mat('#dfc184'),0,-.14,.28);
    }
    g.userData.body=gbody;g.userData.phase=npcs.length*2.3;g.rotation.y=isFlorist?-.45:Math.PI*.82;
    npcs.push(g);
  }
  return {
    npcs,
    update(t){
      for(let i=0;i<npcs.length;i++){
        const n=npcs[i],w=t*.9+n.userData.phase;
        n.userData.body.position.y=1.4+Math.sin(w)*.018;
        n.userData.body.rotation.z=Math.sin(w*.66)*.021;
        n.userData.arm.rotation.x=-.18+Math.sin(w*1.3)*.14;
      }
    }
  };
}
