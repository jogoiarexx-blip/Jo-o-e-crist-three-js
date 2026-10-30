// Capítulo 1 — A Rodoviária. Dados sem dependência de WebGL, para testes de
// progressão, pontos de interação, puzzles e NPCs.
export const CITY_TARGETS=Object.freeze({
  cityWelcome:Object.freeze({x:55.0,z:21.2,radius:3.2,label:'Pedir informações na praça'}),
  crossing:Object.freeze({x:68,z:11,radius:6,label:'Atravessar na faixa'}),
  cityBag:Object.freeze({x:83.0,z:1.0,radius:2.9,label:'Identificar a mala no carrinho'}),
  cityClerk:Object.freeze({x:74.5,z:-.85,radius:3,label:'Conferir as passagens no guichê'}),
  bus:Object.freeze({x:93,z:3,radius:5,label:'Entrar no ônibus da excursão'})
});
export const CITY_NPCS=Object.freeze([
  Object.freeze({
    id:'florista',name:'Dona Nena',x:64,z:1.8,radius:2.6,
    lines:Object.freeze([
      ['DONA NENA','Uma flor para dar sorte na viagem? Ou para pedir desculpa depois?'],
      ['JOÃO','Nós ganhamos na loteria, minha senhora! Vamos conhecer Las Vegas!'],
      ['DONA NENA','Então levem juízo, que dinheiro sozinho não sabe o caminho.']
    ])
  }),
  Object.freeze({
    id:'carregador',name:'Seu Tonico',x:85.7,z:1.7,radius:2.7,
    lines:Object.freeze([
      ['SEU TONICO','Mala parecida com essa eu vejo dez por dia. Olhem a etiqueta antes de pegar.'],
      ['CRIST','Ótimo conselho. João, não vá trazendo uma sanfona em vez da nossa roupa!'],
      ['SEU TONICO','Já aconteceu. Duas vezes.']
    ])
  }),
  Object.freeze({
    id:'motorista',name:'Motorista Beto',x:94.2,z:1.45,radius:2.9,
    lines:Object.freeze([
      ['BETO','Excursão Estelar! Apresentação garantida e muita purpurina na estrada!'],
      ['JOÃO','E tem lugar para dois rapazes que nunca saíram do interior?'],
      ['BETO','Aqui cabe todo mundo. Só não me peçam pra cantar junto!']
    ])
  })
]);
export const CITY_CHOICES=Object.freeze({
  bag:Object.freeze({
    heading:'QUAL É A MALA CERTA?',
    text:'Crist encontra o comprovante: etiqueta 042, alça marrom e uma fita azul. Escolha a mala que combina.',
    options:Object.freeze([
      Object.freeze({id:'024',label:'Mala 024 · fita vermelha'}),
      Object.freeze({id:'042',label:'Mala 042 · fita azul'}),
      Object.freeze({id:'420',label:'Mala 420 · sem etiqueta'})
    ]),
    answer:'042'
  }),
  route:Object.freeze({
    heading:'QUAL É O PORTÃO DA PASSAGEM?',
    text:'Crist lê no bilhete: TRANSPORTE AO AEROPORTO, PORTÃO 2. Compare com os avisos do terminal.',
    options:Object.freeze([
      Object.freeze({id:'1',label:'Portão 1 · viagem para Serra Azul'}),
      Object.freeze({id:'2',label:'Portão 2 · transporte ao aeroporto'}),
      Object.freeze({id:'3',label:'Portão 3 · Excursão Estelar'})
    ]),
    answer:'2'
  })
});
export function checkCityAnswer(puzzleId,optionId){
  const puzzle=CITY_CHOICES[puzzleId];
  return !!puzzle&&puzzle.options.some(o=>o.id===optionId)&&puzzle.answer===optionId;
}
export function findCityNpc(point){
  if(!point||!Number.isFinite(point.x)||!Number.isFinite(point.z))return null;
  let best=null,dist=Infinity;
  for(const npc of CITY_NPCS){
    const d=Math.hypot(point.x-npc.x,point.z-npc.z);
    if(d<=npc.radius&&d<dist){best=npc;dist=d;}
  }
  return best;
}
