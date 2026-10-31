// Capítulo 5 — O Deserto Não Perdoa: dados sem dependência de renderização.
// Termina na visão das luzes de Vegas, sem antecipar o hub do Capítulo 6.
export const DESERT_START=35;
export const DESERT_LAST=45;
export const DESERT_SPAWN=Object.freeze({x:-60.6,z:-13.7});
export const DESERT_ROOM=Object.freeze({xMin:-80,xMax:-44,zMin:-32,zMax:12});
export const DESERT_SHADE=Object.freeze({x:-70,z:-20,radius:5.4});
export const DESERT_TARGETS=Object.freeze({
  desertVan:{x:-63,z:-13,radius:3.2,label:'Inspecionar a van quebrada'},
  desertShade:{x:-70,z:-20,radius:3.5,label:'Procurar sombra no abrigo'},
  desertCan:{x:-72,z:-19.2,radius:3.0,label:'Encontrar galão vazio'},
  desertWaterSign:{x:-76.3,z:-5.5,radius:3.2,label:'Ler aviso da água'},
  desertPump:{x:-68.3,z:-4,radius:3.0,label:'Encher o galão na bomba'},
  desertCarry:{x:-63,z:-13,radius:3.2,label:'Levar água até a van'},
  desertMechanic:{x:-52,z:-15,radius:3.3,label:'Pedir ajuda ao mecânico'},
  desertHose:{x:-63,z:-13,radius:3.2,label:'Substituir a mangueira danificada'},
  desertCool:{x:-63,z:-13,radius:3.2,label:'Conferir a refrigeração com motor frio'},
  desertSigns:{x:-54,z:-3,radius:3.0,label:'Decifrar as placas da estrada'},
  desertLookout:{x:-52,z:8,radius:3.2,label:'Avistar as luzes de Las Vegas'}
});
export const DESERT_QUESTS=Object.freeze([
  {id:'desertVan',title:'Investigue a pane no deserto',hint:'João deve conferir o motor da van parada para entender a falha.'},
  {id:'desertShade',title:'Proteja-se do calor',hint:'Encontre a sombra do abrigo. O calor diminui na sombra e nunca causa game over.'},
  {id:'desertCan',title:'Encontre um recipiente para água',hint:'Procure o galão vazio perto do abrigo.'},
  {id:'desertWaterSign',title:'Crist: descubra onde há água',hint:'Leia o aviso do posto e evite a bomba fora de serviço.'},
  {id:'desertPump',title:'João: encha o galão',hint:'Siga até a bomba de água do posto. João precisa preparar o galão.'},
  {id:'desertCarry',title:'Leve o galão até a van',hint:'João carrega o galão cheio. Atravesse o posto a pé e volte à van.'},
  {id:'desertMechanic',title:'Peça ajuda ao mecânico',hint:'Converse com Zeca na oficina para descobrir qual peça substituir.'},
  {id:'desertHose',title:'João: conserte a mangueira',hint:'Escolha a mangueira correta para a refrigeração da van.'},
  {id:'desertCool',title:'Finalize o reparo com segurança',hint:'Com João, aguarde o motor esfriar e confira o sistema antes de seguir.'},
  {id:'desertSigns',title:'Crist: decifre as placas contraditórias',hint:'Compare a placa do posto com o mapa atualizado para descobrir o caminho.'},
  {id:'desertLookout',title:'Encontre as luzes no horizonte',hint:'Caminhe até o mirante: Las Vegas pode estar mais perto do que parece.'}
]);
export const DESERT_NPCS=Object.freeze([
  {id:'zeca',name:'Zeca, mecânico',x:-50,z:-15,radius:3.0,
    lines:[['ZECA','O motor parou? Primeiro deixem esfriar e procurem a mangueira rachada.'],
      ['JOÃO','Eu achei que ele só tinha cansado de ouvir nossa conversa.'],
      ['ZECA','Se a água estiver baixa, não abram radiador quente. Aqui eu ajudo com a peça.']]},
  {id:'rosa',name:'Rosa, dona do posto',x:-73,z:-8,radius:2.9,
    lines:[['ROSA','A bomba de água potável fica ao lado da cobertura. A vermelha está desativada.'],
      ['CRIST','Boa informação. João costuma achar que cor vermelha significa sorte.'],
      ['ROSA','Aqui significa: NÃO USE ESSA BOMBA!']]},
  {id:'luna',name:'Luna, viajante',x:-54,z:4,radius:3.0,
    lines:[['LUNA','O deserto parece vazio, mas à noite dá para ver o brilho das cidades.'],
      ['JOÃO','A gente está procurando Las Vegas desde a fazenda.'],
      ['LUNA','Então sigam a placa mais nova. A antiga aponta para uma estrada fechada.']]}
]);
export const DESERT_CHOICES=Object.freeze({
  desertWater:{heading:'ONDE ENCONTRAR ÁGUA?',
    text:'O aviso diz: BOMBA AZUL — ÁGUA POTÁVEL. BOMBA VERMELHA — DESATIVADA. Crist deve observar a placa antes de buscar água.',
    options:[{id:'blue',label:'Bomba azul · água potável indicada pelo posto'},
      {id:'red',label:'Bomba vermelha · fora de serviço'},
      {id:'ditch',label:'Poça próxima à estrada, sem indicação'}],answer:'blue'},
  desertHose:{heading:'QUAL PEÇA O ZECA RECOMENDOU?',
    text:'A oficina separou as peças: mangueira de refrigeração compatível, cabo do som e fita decorativa. João precisa selecionar a peça certa.',
    options:[{id:'cable',label:'Cabo azul do microfone'},
      {id:'hose',label:'Mangueira de refrigeração compatível'},
      {id:'tape',label:'Fita da decoração da van'}],answer:'hose'},
  desertCool:{heading:'COMO TERMINAR A REVISÃO?',
    text:'Zeca explicou que só se deve verificar o sistema de arrefecimento quando o motor estiver frio. O galão já foi levado para a van.',
    options:[{id:'hot',label:'Abrir a tampa enquanto o motor ainda está quente'},
      {id:'cold',label:'Esperar esfriar e seguir as instruções do mecânico'},
      {id:'ignore',label:'Ignorar a peça rachada e acelerar'}],answer:'cold'},
  desertSigns:{heading:'QUAL PLACA INDICA O CAMINHO?',
    text:'Placa velha: VEGAS ← (ESTRADA FECHADA). Placa nova: LAS VEGAS → 35 MILHAS. Crist precisa ler as duas informações.',
    options:[{id:'old',label:'Seguir a placa velha pela estrada fechada'},
      {id:'new',label:'Seguir a placa nova: Vegas à direita'},
      {id:'circle',label:'Voltar ao aeroporto e embarcar novamente'}],answer:'new'}
});
export const DESERT_SCENES=Object.freeze({
  arrival:[
    ['NARRADOR','A van para numa estrada deserta. O vento levanta poeira enquanto o motor emite seu último soluço.'],
    ['JOÃO','Acho que a van decidiu fazer turismo sem a gente.'],
    ['CRIST','Antes de qualquer coisa, vamos descobrir o defeito e procurar sombra.'],
    ['JOÃO','Ainda bem que o chapéu veio comigo!']
  ],
  shade:[
    ['NARRADOR','Sob a cobertura do pequeno posto, os dois recuperam o fôlego.'],
    ['CRIST','Água, sombra e calma. A gente só resolve a pane sem ficar torrando no sol.'],
    ['JOÃO','Eu estava quase virando um torresmo com suspensório!']
  ],
  can:[
    ['JOÃO','Olha esse galão. Está vazio, mas parece que vai servir.'],
    ['CRIST','Não é pra sair pegando água em qualquer lugar. Primeiro lemos a placa do posto.'],
    ['JOÃO','Tá bom, tá bom. Desta vez você lê e eu carrego.']
  ],
  water:[
    ['CRIST','A bomba azul está identificada como potável. A vermelha está desligada.'],
    ['ROSA','Isso mesmo. Vocês podem encher o galão no ponto indicado.'],
    ['JOÃO','Hoje eu aprendi que a placa é mais útil do que a minha intuição.']
  ],
  fill:[
    ['JOÃO','Enchi o galão! Agora o caminho de volta parece que ficou mais longo.'],
    ['CRIST','Segura com cuidado. Vou ficar de olho no trajeto.'],
    ['NARRADOR','João levanta o recipiente com as duas mãos e segue para a van.']
  ],
  carry:[
    ['JOÃO','Pronto, chegamos. Ainda não derramei uma gota!'],
    ['CRIST','Já é uma vitória. Agora precisamos da peça para reparar a mangueira.'],
    ['NARRADOR','Uma pequena oficina aberta ao lado do posto pode ajudar.']
  ],
  mechanic:[
    ['ZECA','A mangueira de refrigeração rachou. Eu tenho uma peça compatível.'],
    ['JOÃO','Nós cuidamos da instalação. O senhor confere se está tudo certo?'],
    ['ZECA','É assim que se faz. Só mexam no sistema com o motor frio.']
  ],
  hose:[
    ['ZECA','Boa escolha, essa é a peça certa.'],
    ['JOÃO','Apertou, encaixou, ficou bonito!'],
    ['CRIST','E o motor já esfriou. Falta uma revisão final antes de rodar.']
  ],
  cool:[
    ['ZECA','Motor frio, revisão concluída. Agora podem seguir até o próximo povoado.'],
    ['JOÃO','Esse carro conhece mais oficinas do que nós conhecemos hotéis.'],
    ['CRIST','Agora falta descobrir onde fica Las Vegas.']
  ],
  signs:[
    ['CRIST','A placa antiga aponta para uma estrada fechada. A nova diz Vegas, trinta e cinco milhas à direita!'],
    ['JOÃO','Eu ia seguir a seta grande sem ler as letras pequenas...'],
    ['LUNA','Ainda bem que vocês conferiram. O mirante mostra as luzes no horizonte.']
  ],
  lookout:[
    ['NARRADOR','No alto do mirante, pontos de luz começam a aparecer além das montanhas.'],
    ['JOÃO','Crist, olha aquilo! Parece que o céu caiu e virou uma cidade!'],
    ['CRIST','Las Vegas. A gente quase não acredita.'],
    ['JOÃO','Quando chegarmos, a primeira coisa que vou fazer é tirar uma foto. A segunda é dormir!'],
    ['CRIST','A primeira vai ser escolher o hotel CERTO. Não quero mais uma excursão surpresa.'],
    ['NARRADOR','Com a van reparada e um novo caminho no mapa, o sonho está cada vez mais perto.']
  ],
  wrong:[
    ['JOÃO','Essa opção parecia tão boa...'],
    ['CRIST','Vamos ler a pista de novo. Já aprendemos a não confiar no primeiro palpite.'],
    ['NARRADOR','Nada foi perdido. Observe as informações e tente novamente.']
  ]
});
export function checkDesertAnswer(kind,id){
  const p=DESERT_CHOICES[kind];return !!p&&p.options.some(o=>o.id===id)&&p.answer===id;
}
export function findDesertNpc(point){
  if(!point||!Number.isFinite(point.x)||!Number.isFinite(point.z))return null;
  let best=null,bestDistance=Infinity;
  for(const npc of DESERT_NPCS){
    const dist=Math.hypot(point.x-npc.x,point.z-npc.z);
    if(dist<=npc.radius&&dist<bestDistance){best=npc;bestDistance=dist;}
  }
  return best;
}
export function isDesertShade(x,z){
  return Number.isFinite(x)&&Number.isFinite(z)&&Math.hypot(x-DESERT_SHADE.x,z-DESERT_SHADE.z)<=DESERT_SHADE.radius;
}
export function advanceDesertHeat(heat,atShade,dt){
  const safe=Number.isFinite(heat)?Math.max(0,Math.min(85,heat)):0;
  const t=Number.isFinite(dt)?Math.max(0,Math.min(.05,dt)):0;
  return Math.max(0,Math.min(85,safe+(atShade?-4.1:1.25)*t));
}
export function desertHeatLabel(heat){
  if(heat<22)return 'CONFORTÁVEL';
  if(heat<58)return 'QUENTE';
  return 'MUITO QUENTE · PROCURE SOMBRA';
}
export function desertColliders(){
  // Somente elementos sólidos. Os pontos de missão ficam de fora das caixas,
  // e o caminho entre a bomba e a van é propositalmente aberto.
  return [
    {x1:-79.0,x2:-67.5,z1:-11.0,z2:-7.0,height:4.2,tag:'desert-station'},
    {x1:-57.5,x2:-47.5,z1:-24.2,z2:-19.5,height:4.3,tag:'desert-workshop'},
    {x1:-72.8,x2:-69.2,z1:-6.5,z2:-4.2,height:1.4,tag:'desert-pumps'},
    {x1:-70.0,x2:-67.0,z1:-24.4,z2:-22.4,height:1.15,tag:'desert-bench'},
    {x1:-66.3,x2:-61.9,z1:-15.0,z2:-11.0,height:2.35,tag:'desert-van'}
  ];
}
export function desertCarryActive(step){return step===40;}
