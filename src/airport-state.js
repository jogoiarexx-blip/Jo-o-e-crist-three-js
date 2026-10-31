// Capítulo 3 — Aeroporto dos Perdidos. Estado isolado e testável sem WebGL.
export const AIRPORT_START=19;
export const AIRPORT_END=26;
export const AIRPORT_ROOM=Object.freeze({xMin:37,xMax:96,zMin:-40.8,zMax:-23.1,cx:66.5,cz:-31.5});
export const AIRPORT_SPAWN=Object.freeze({x:40.0,z:-31.5});
// Fonte única para as posições dos objetos e aferição dos gatilhos.
export const AIRPORT_PROPS=Object.freeze({
  panel:Object.freeze({x:43,z:-27.7}),
  checkin:Object.freeze({x:51,z:-26.3}),
  lost:Object.freeze({x:60,z:-36.6}),
  bags:Object.freeze({x:69,z:-36.6}),
  scanner:Object.freeze({x:76,z:-26.5}),
  gate:Object.freeze({x:82,z:-27.1}),
  belt:Object.freeze({x:87.3,z:-31.5}),
  board:Object.freeze({x:93,z:-26.4})
});
export const AIRPORT_QUESTS=Object.freeze([
  {id:'airWelcome',title:'Encontre o balcão de informações',hint:'Explore o saguão e procure o painel de partidas. O voo certo é o fictício BS408 para conexão internacional.'},
  {id:'airCheckin',title:'Crist: faça o check-in correto',hint:'Leia a passagem e escolha o atendimento do voo BS408, conexão para Las Vegas.'},
  {id:'airPassport',title:'Crist: recupere o passaporte de João',hint:'João colocou os documentos na pasta errada. Confira as pistas no Achados e Perdidos.'},
  {id:'airFarofa',title:'João: organize a bagagem',hint:'O pote de farofa está fora da mala. Coloque-o na bagagem para a inspeção sem causar confusão.'},
  {id:'airSecurity',title:'Passe pela inspeção',hint:'Crist deve preparar as bandejas corretamente antes de atravessar o detector.'},
  {id:'airGate',title:'Encontre o portão atualizado',hint:'O painel de voos mudou. Crist precisa ler qual portão corresponde ao BS408.'},
  {id:'airRush',title:'Alcance o embarque a tempo',hint:'A esteira rolante está prestes a terminar. Atravesse a passagem e reaja ao tropeço de João.'},
  {id:'airBoard',title:'Embarque no voo internacional',hint:'Mostre os cartões no portão certo e embarque com João e Crist juntos.'}
]);
export const AIRPORT_TARGETS=Object.freeze({
  airWelcome:Object.freeze({x:43,z:-28.95,radius:1.35,label:'Ler o painel de partidas'}),
  airCheckin:Object.freeze({x:50.5,z:-28.25,radius:1.3,label:'Atendimento no balcão B · BS408'}),
  airPassport:Object.freeze({x:60,z:-34.85,radius:1.3,label:'Pesquisar as pastas em Achados e Perdidos'}),
  airFarofa:Object.freeze({x:69,z:-34.8,radius:1.3,label:'Inspecionar mala e pote de farofa'}),
  airSecurity:Object.freeze({x:76,z:-28.4,radius:1.3,label:'Preparar bandejas junto ao scanner'}),
  airGate:Object.freeze({x:82,z:-28.6,radius:1.3,label:'Ler painel atualizado do portão C7'}),
  airRush:Object.freeze({x:87.5,z:-31.5,radius:1.65,label:'Entrar na esteira rolante'}),
  airBoard:Object.freeze({x:93,z:-28.15,radius:1.3,label:'Mostrar cartões no balcão do portão C7'})
});
export const AIRPORT_NPCS=Object.freeze([
  {id:'nina',name:'Nina, atendente',x:52.7,z:-28.5,radius:1.65,lines:[
    ['NINA','Bom dia! Se forem viajar para fora do país, confiram os dados do voo BS408.'],
    ['CRIST','Eu confiro tudo. O João lê a primeira palavra e já sai correndo.'],
    ['JOÃO','Foi uma vez só! Ou duas, se contar o ônibus.']
  ]},
  {id:'leo',name:'Léo, achados e perdidos',x:59.7,z:-34.9,radius:1.65,lines:[
    ['LÉO','Toda hora alguém esquece uma coisa. Hoje já apareceu até uma dentadura.'],
    ['JOÃO','Não era minha, eu garanto! Mas meu passaporte sumiu.'],
    ['LÉO','Olhem a pasta azul com o nome João, perto do balcão.']
  ]},
  {id:'mara',name:'Mara, inspeção',x:76,z:-28.6,radius:1.65,lines:[
    ['MARA','Moedas e chaves vão para a bandeja. Bagagem passa separada.'],
    ['CRIST','Pode deixar, senhora. Já chegamos até aqui sem perder mais nada.'],
    ['JOÃO','Só não me peça pra passar meu chapéu na máquina!']
  ]}
]);
export const AIRPORT_CHOICES=Object.freeze({
  checkin:{heading:'QUAL É O CHECK-IN?',text:'A passagem mostra voo BS408, conexão internacional para Las Vegas. Aponte o balcão que confere esse voo.',options:[
    {id:'bs408',label:'Balcão B · BS408 · conexão internacional'},
    {id:'bs210',label:'Balcão A · BS210 · viagem regional'},
    {id:'bus',label:'Terminal terrestre · Excursão Estelar'}],answer:'bs408'},
  passport:{heading:'ONDE ESTÁ O PASSAPORTE?',text:'Crist encontrou a anotação de João: “Pasta azul, nome João, dentro do balcão de Achados e Perdidos”.',options:[
    {id:'red',label:'Pasta vermelha · documentos de Duda'},
    {id:'blue',label:'Pasta azul · etiqueta JOÃO'},
    {id:'gray',label:'Pasta cinza · manuais do aeroporto'}],answer:'blue'},
  farofa:{heading:'E O POTE DE FAROFA?',text:'Os preparativos da mala incluem um pote fechado. A equipe pede que João coloque os itens para inspeção, seguindo a orientação do local.',options:[
    {id:'hide',label:'Esconder o pote debaixo do chapéu'},
    {id:'queue',label:'Deixar o pote na fila e sair andando'},
    {id:'inspect',label:'Apresentar o pote com a bagagem para inspeção'}],answer:'inspect'},
  security:{heading:'O QUE VAI PARA A BANDEJA?',text:'Crist ouve a orientação da agente: retirar chaves e moedas dos bolsos antes de passar no detector.',options:[
    {id:'keys',label:'Separar chaves e moedas na bandeja'},
    {id:'keep',label:'Deixar as moedas nos bolsos'},
    {id:'run',label:'Correr direto pelo detector'}],answer:'keys'},
  gate:{heading:'QUAL É O PORTÃO DO VOO?',text:'O painel atualizado diz BS408 · CONEXÃO INTERNACIONAL · PORTÃO C7. O aviso anterior mostrava B2.',options:[
    {id:'b2',label:'B2 · portão anterior, cancelado'},
    {id:'c7',label:'C7 · BS408 · conexão internacional'},
    {id:'d1',label:'D1 · voo regional BS210'}],answer:'c7'}
});
export const AIRPORT_SCENES=Object.freeze({
  welcome:[
    ['NARRADOR','Depois do desvio da Excursão Estelar, a trupe deixa João e Crist no aeroporto com a indicação certa.'],
    ['JOÃO','Olha, Crist! Um aeroporto de verdade. Tem mais placa que cerca na nossa fazenda!'],
    ['CRIST','Hoje a gente vai ler cada placa até o fim, combinado?'],
    ['NINA','Bom dia! Consultem o painel e façam o check-in do voo correto.']
  ],
  checkin:[
    ['NINA','Isso mesmo, voo BS408. Vocês têm conexão para seguir viagem.'],
    ['CRIST','Até que enfim uma informação que o João não inventou.'],
    ['JOÃO','Eu só estava testando outros caminhos.']
  ],
  passport:[
    ['LÉO','Aqui está a pasta azul com o passaporte do João!'],
    ['JOÃO','Uai, botei no Achados e Perdidos para não perder...'],
    ['CRIST','E conseguiu perder até o lugar onde guardou.']
  ],
  farofa:[
    ['JOÃO','Trouxe o pote pra inspeção. Não vou arrumar confusão com a comida!'],
    ['MARA','Obrigada. Agora vamos conferir a bagagem conforme as orientações daqui.'],
    ['CRIST','A farofa quase viajou mais rápido do que nós.']
  ],
  security:[
    ['MARA','Tudo certo. O detector não apitou e os pertences estão com vocês.'],
    ['JOÃO','Ainda bem! Achei que ia apitar por causa da minha dentadura.'],
    ['CRIST','Sua dentadura nem é de metal, João!']
  ],
  gate:[
    ['CRIST','O portão mudou para C7! Ainda bem que conferimos o painel.'],
    ['JOÃO','Portão C7. Anotei no chapéu. Agora não erro mais!'],
    ['NARRADOR','Um aviso anuncia o início do embarque do voo BS408.']
  ],
  rushOK:[
    ['NARRADOR','João quase tropeça na esteira, mas consegue recuperar o equilíbrio a tempo.'],
    ['CRIST','É a primeira vez que você corre pro lugar certo!'],
    ['JOÃO','Se fosse na roça, eu já tinha pulado esse obstáculo.']
  ],
  rushOops:[
    ['NARRADOR','João pisa torto na esteira e começa uma dança involuntária, até Crist segurá-lo pela camisa.'],
    ['CRIST','Você ganhou na loteria, não um curso de patinação!'],
    ['JOÃO','Mas chegamos inteiros, e isso já vale medalha.']
  ],
  board:[
    ['AGENTE','Cartões conferidos. Bem-vindos ao voo BS408!'],
    ['CRIST','Documento, mala, embarque... dessa vez conseguimos!'],
    ['JOÃO','Las Vegas, prepare-se! Eu trouxe o chapéu mais bonito da fazenda.'],
    ['NARRADOR','João e Crist entram no avião. Pela primeira vez, o sonho parece estar realmente decolando.']
  ],
  wrong:[
    ['JOÃO','Opa... acho que peguei a opção errada!'],
    ['CRIST','Confere a pista de novo. A gente não vai entrar em outro ônibus errado!'],
    ['NARRADOR','Nada foi perdido. Leia o aviso e tente novamente.']
  ]
});
export function checkAirportAnswer(kind,answer){
  const q=AIRPORT_CHOICES[kind];
  return !!q&&q.options.some(opt=>opt.id===answer)&&q.answer===answer;
}
export function findAirportNpc(pos){
  if(!pos||!Number.isFinite(pos.x)||!Number.isFinite(pos.z))return null;
  return AIRPORT_NPCS
    .map(n=>({n,d:Math.hypot(n.x-pos.x,n.z-pos.z)}))
    .filter(a=>a.d<=a.n.radius).sort((a,b)=>a.d-b.d)[0]?.n||null;
}
export function airportRushResult(reacted){return reacted?'rushOK':'rushOops';}
export function airportColliders(){
  const {xMin,xMax,zMin,zMax}=AIRPORT_ROOM;
  const c=[
    {x1:xMin-.35,x2:xMax+.35,z1:zMin-.28,z2:zMin+.28,height:5,tag:'air-wall'},
    {x1:xMin-.35,x2:xMax+.35,z1:zMax-.28,z2:zMax+.28,height:5,tag:'air-wall'},
    {x1:xMin-.28,x2:xMin+.28,z1:zMin,z2:zMax,height:5,tag:'air-wall'},
    {x1:xMax-.28,x2:xMax+.28,z1:zMin,z2:zMax,height:5,tag:'air-wall'}
  ];
  // Objetos ficam contra as paredes, corredor central livre de ponta a ponta.
  for(const [tag,x,z,w,d] of [
    ['air-checkin',51,-26.3,4,1.9],
    ['air-lost',60,-36.6,4,1.7],
    ['air-bags',69,-36.6,3.4,1.8],
    ['air-scanner',76,-26.5,3.4,1.8],
    ['air-gate-desk',93,-26.4,2.6,1.7]
  ])c.push({x1:x-w/2,x2:x+w/2,z1:z-d/2,z2:z+d/2,height:1.8,tag});
  return c;
}
