// Capítulo 2 — A Excursão Errada. Dados e colisões sem WebGL.
export const BUS_START=12;
export const BUS_END=18;
export const BUS_ROOM=Object.freeze({cx:109,cz:-32.6,xMin:99.5,xMax:118.5,zMin:-37,zMax:-28.2});
export const BUS_SPAWN=Object.freeze({x:101.3,z:-32.55});
// Coordenadas dos props reais: também utilizadas pelo construtor do cenário.
export const BUS_PROPS=Object.freeze({
  seat:Object.freeze({x:103,z:-35.6}),
  case:Object.freeze({x:116.65,z:-29.97}),
  rack:Object.freeze({x:116.55,z:-35.48}),
  mic:Object.freeze({x:115.5,z:-33.8}),
  stage:Object.freeze({x:109.1,z:-32.5}),
  driver:Object.freeze({x:100.5,z:-32.55})
});
export const BUS_QUESTS=Object.freeze([
  {id:'busSeat',title:'Encontre os lugares da excursão',hint:'Entre pelo corredor, conheça o ônibus e encontre dois assentos livres.'},
  {id:'busCrew',title:'Conheça a trupe de artistas',hint:'Converse com a equipe e descubra por que todos estão vestidos para um espetáculo.'},
  {id:'busCase',title:'Recupere a caixa de equipamento',hint:'Com João, encontre a caixa correta da trupe no compartimento de bagagens.'},
  {id:'busInspect',title:'Crist: identifique o cabo do microfone',hint:'Troque para Crist e descubra qual cabo está causando o problema de áudio.'},
  {id:'busConnect',title:'João: conserte o som da excursão',hint:'Agora use João para conectar o cabo certo na mesa de som.'},
  {id:'busDance',title:'Participe do número musical',hint:'Siga a sequência de quatro movimentos na ordem indicada. Pode tentar quantas vezes quiser.'},
  {id:'busReveal',title:'Descubra a verdadeira excursão',hint:'Volte à frente do ônibus e converse com a motorista para descobrir o engano.'}
]);
export const BUS_TARGETS=Object.freeze({
  busSeat:Object.freeze({x:103,z:-34.05,radius:1.3,label:'Sentar no banco próximo à janela'}),
  busCrew:Object.freeze({x:107.5,z:-32.35,radius:1.55,label:'Conhecer os artistas no corredor'}),
  busCase:Object.freeze({x:116.5,z:-31.5,radius:1.25,label:'Examinar a caixa ESTELAR no bagageiro'}),
  busInspect:Object.freeze({x:115.35,z:-33.55,radius:1.25,label:'Examinar microfone e cabos da mesa'}),
  busConnect:Object.freeze({x:116.3,z:-34.05,radius:1.25,label:'Ligar o cabo na mesa de som'}),
  busDance:Object.freeze({x:109.1,z:-32.55,radius:1.8,label:'Subir ao palco improvisado'}),
  busReveal:Object.freeze({x:101,z:-32.55,radius:1.5,label:'Conferir destino junto à cabine do motorista'})
});
export const BUS_NPCS=Object.freeze([
  Object.freeze({id:'luzia',name:'Luzia, cantora',x:107.55,z:-31.75,radius:1.65,
    lines:[['LUZIA','Se vocês ouviram o ensaio, sejam bem-vindos! Estamos preparando o show.'],
      ['JOÃO','Eu só sei cantar modinha de viola.'],
      ['LUZIA','Perfeito! Só não entre um compasso antes de todo mundo.']]}),
  Object.freeze({id:'duda',name:'Duda, figurinista',x:110.6,z:-33.6,radius:1.65,
    lines:[['DUDA','A roupa brilhante é pro espetáculo. Querem experimentar uma capa?'],
      ['CRIST','Obrigado! Já estamos viajando com roupa que cabe na mala.'],
      ['DUDA','Então segura essa fita, que ela não para de desenrolar!']]}),
  Object.freeze({id:'nico',name:'Nico, técnico de som',x:114.85,z:-34.1,radius:1.65,
    lines:[['NICO','Meu microfone ficou mudo depois que mexeram nos cabos.'],
      ['JOÃO','Eu entendo de rádio da roça. Deve ser parecido.'],
      ['NICO','É parecido até alguém ligar o microfone na saída da caixa!']]})
]);
export const BUS_CHOICES=Object.freeze({
  case:Object.freeze({heading:'QUAL É A CAIXA DA TRUPE?',
    text:'João procura a caixa de equipamentos de som: preta, estrela amarela e etiqueta ESTELAR. Há três bagagens parecidas.',
    options:Object.freeze([
      {id:'red',label:'Caixa vermelha · etiqueta figurinos'},
      {id:'star',label:'Caixa preta · estrela amarela ESTELAR'},
      {id:'green',label:'Caixa verde · equipamento esportivo'}]),
    answer:'star'}),
  inspect:Object.freeze({heading:'QUAL CABO ESTÁ SOLTO?',
    text:'Crist lê no painel: o microfone usa o cabo AZUL identificado MIC. O cabo vermelho é da energia e o amarelo alimenta as luzes.',
    options:Object.freeze([
      {id:'red',label:'Vermelho · energia'},
      {id:'blue',label:'Azul · microfone MIC'},
      {id:'yellow',label:'Amarelo · luzes de palco'}]),
    answer:'blue'}),
  connect:Object.freeze({heading:'EM QUAL ENTRADA LIGAR?',
    text:'João segura o cabo azul identificado MIC, encontrado por Crist. Escolha a entrada correta da mesa de som.',
    options:Object.freeze([
      {id:'speaker',label:'SAÍDA · alto-falante'},
      {id:'mic',label:'ENTRADA · microfone MIC'},
      {id:'power',label:'ENERGIA · alimentação'}]),
    answer:'mic'})
});
export const BUS_SCENES=Object.freeze({
  seat:[
    ['JOÃO','Olha o tamanho desse ônibus! Tem até luz no teto!'],
    ['CRIST','João, esse banco está reservado para figurinos. Vamos procurar um lugar de verdade.'],
    ['LUZIA','Podem ficar por aqui! Vocês são convidados da nossa apresentação.'],
    ['JOÃO','Eita, nem chegamos em Vegas e já somos VIP!']
  ],
  crew:[
    ['LUZIA','Meu nome é Luzia. A gente viaja com shows, figurinos e música.'],
    ['DUDA','Sou Duda, cuido das roupas. Só não me perguntem como cabem 40 capas em duas malas!'],
    ['NICO','E eu sou Nico. O som da trupe anda falhando.'],
    ['CRIST','João, acho que essa não é a viagem que estava na nossa passagem.'],
    ['JOÃO','Mas olha que pessoal simpático! Podemos dar uma força.']
  ],
  caseWrong:[
    ['DUDA','Essa caixa é de figurino, não é do som! Mas combina com o seu chapéu.'],
    ['JOÃO','Crist, nossa missão está ficando mais complicada do que fazer mala em casa.'],
    ['NICO','Procurem uma estrela amarela e a etiqueta ESTELAR.']
  ],
  case:[
    ['JOÃO','Achei a caixa! Tem estrela e tudo, deve ser da turma!'],
    ['DUDA','Essa é a nossa. A outra tinha só lantejoula e penas!'],
    ['NICO','Ótimo, faltava mesmo esse estojo. Agora preciso descobrir por que o microfone está mudo.']
  ],
  inspectWrong:[
    ['CRIST','Não. Precisamos ler as etiquetas; não quero desconectar as luzes do palco.'],
    ['NICO','O microfone costuma usar a entrada marcada MIC.']
  ],
  inspect:[
    ['CRIST','Está aqui: o cabo azul do microfone ficou solto.'],
    ['NICO','Bem visto! João pode conectar esse cabo na entrada MIC.'],
    ['JOÃO','Pode deixar. Minha especialidade é consertar coisas sem sobrar parafuso.']
  ],
  connectWrong:[
    ['NICO','Não essa entrada! Assim a gente fica sem alto-falante ou sem luz.'],
    ['JOÃO','Uai, tinha mais tomada do que formiga perto de açúcar.'],
    ['CRIST','A que diz MIC, João. Letra M, letra I, letra C.']
  ],
  connect:[
    ['NICO','UM, DOIS... SOM! Vocês salvaram o nosso ensaio!'],
    ['LUZIA','Então agora ninguém escapa: vamos fazer um número musical!'],
    ['JOÃO','Eu danço forró, quadrilha e até a dança da galinha.'],
    ['CRIST','Só não pisa no meu pé, pelo amor de Deus.']
  ],
  dance:[
    ['LUZIA','Palmas, passo, giro e palmas! Muito bem!'],
    ['DUDA','João tem presença de palco. Crist tem... muita coragem de acompanhar.'],
    ['CRIST','Eu sobrevivi a uma bicicleta hoje. Isso aqui é moleza!'],
    ['NARRADOR','A trupe improvisa uma pequena festa. Agora todos conhecem os dois viajantes.']
  ],
  reveal:[
    ['CRIST','Agora me diga uma coisa, motorista: qual é o destino dessa excursão?'],
    ['BETO','O festival Estelar, na cidade vizinha! Vamos apresentar nosso espetáculo.'],
    ['JOÃO','Cidade vizinha? Mas eu achei que essa era a excursão para Las Vegas!'],
    ['LUZIA','Las Vegas? Vocês entraram no ônibus errado!'],
    ['JOÃO','Eu li só a palavra Estelar e já pensei nas luzes de Vegas...'],
    ['CRIST','Eu sabia que estava faltando ler o resto da placa.'],
    ['BETO','Não se preocupem. A gente ajuda vocês a achar o transporte certo.'],
    ['NARRADOR','A confusão vira amizade. A viagem continua com mais uma história para contar.']
  ]
});
export const RHYTHM_SEQUENCE=Object.freeze(['clap','step','turn','clap']);
export const RHYTHM_LABELS=Object.freeze({clap:'Palmas',step:'Passo',turn:'Giro'});
export const RHYTHM_OPTIONS=Object.freeze([
  Object.freeze({id:'clap',label:'Palmas'}),
  Object.freeze({id:'step',label:'Passo para o lado'}),
  Object.freeze({id:'turn',label:'Giro'})
]);
export function checkBusAnswer(kind,id){
  const q=BUS_CHOICES[kind];
  return !!q&&q.options.some(o=>o.id===id)&&q.answer===id;
}
export function normalizeRhythmProgress(value){
  const n=Number(value);return Number.isInteger(n)&&n>=0&&n<RHYTHM_SEQUENCE.length?n:0;
}
export function inputRhythm(progress,choice){
  const index=normalizeRhythmProgress(progress);
  const correct=RHYTHM_SEQUENCE[index]===choice;
  return {correct,progress:correct?index+1:index,complete:correct&&index+1===RHYTHM_SEQUENCE.length};
}
export function findBusNpc(point){
  if(!point||!Number.isFinite(point.x)||!Number.isFinite(point.z))return null;
  let closest=null,distance=Infinity;
  for(const n of BUS_NPCS){
    const d=Math.hypot(n.x-point.x,n.z-point.z);
    if(d<=n.radius&&d<distance){closest=n;distance=d;}
  }
  return closest;
}
export function isInsideBus(x,z){
  return Number.isFinite(x)&&Number.isFinite(z)&&
    x>BUS_ROOM.xMin+.28&&x<BUS_ROOM.xMax-.28&&
    z>BUS_ROOM.zMin+.28&&z<BUS_ROOM.zMax-.28;
}
export function makeBusRoomColliders(){
  const {xMin,xMax,zMin,zMax}=BUS_ROOM;
  const wall=.24;
  const all=[
    {x1:xMin-wall,x2:xMax+wall,z1:zMin-wall,z2:zMin+wall,height:4.5,tag:'bus-wall-l'},
    {x1:xMin-wall,x2:xMax+wall,z1:zMax-wall,z2:zMax+wall,height:4.5,tag:'bus-wall-r'},
    {x1:xMin-wall,x2:xMin+wall,z1:zMin,z2:zMax,height:4.5,tag:'bus-wall-front'},
    {x1:xMax-wall,x2:xMax+wall,z1:zMin,z2:zMax,height:4.5,tag:'bus-wall-rear'}
  ];
  // Duas fileiras de bancos deixam o corredor central completamente livre.
  for(const x of [103,106.2,109.4,112.6])
    for(const z of [-35.6,-29.6])
      all.push({x1:x-.89,x2:x+.89,z1:z-.82,z2:z+.82,height:1.42,tag:'bus-seat'});
  all.push({x1:115.85,x2:117.4,z1:-36.25,z2:-34.7,height:1.6,tag:'bus-audio-rack'});
  all.push({x1:115.85,x2:117.4,z1:-30.85,z2:-29.4,height:1.3,tag:'bus-cases'});
  return all;
}
