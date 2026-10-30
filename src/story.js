export const QUESTS=[
  {id:'ticket',title:'Encontre o bilhete da loteria',hint:'João deixou o bilhete na mesa, perto da varanda.'},
  {id:'radio',title:'Confira o resultado no rádio',hint:'Sintonize a estação e confira os números sorteados.'},
  {id:'crist',title:'Conte a novidade para Crist',hint:'Fale com seu companheiro de aventuras.'},
  {id:'suitcase',title:'Arrume as malas',hint:'Reúna as duas malas que estão na varanda.'},
  {id:'pantera',title:'Despeça-se de Pantera',hint:'Uma boa aventura merece uma despedida.'},
  {id:'gate',title:'Saia da fazenda',hint:'Passe pela porteira e siga até a rodoviária.'},
  {id:'crossing',title:'Atravesse a rua com cuidado',hint:'Siga pela cidade. Aqui até bicicleta assusta!'},
  {id:'bus',title:'Embarque na excursão para Vegas',hint:'O ônibus roxo está estacionado ao lado da rodoviária.'},
  {id:'done',title:'Prólogo concluído!',hint:'A viagem acabou de começar...'}
];
export const INTRO=[
  ['NARRADOR','No interior, onde o café é forte e as notícias chegam pelo rádio, dois amigos vivem tranquilamente na fazenda.'],
  ['CRIST','Ô João! Cadê aquele bilhete da loteria que você comprou?'],
  ['JOÃO','Tá bem guardadinho... só não lembro onde!'],
  ['CRIST','Se a gente ganhar, você promete não arrumar confusão?'],
  ['JOÃO','Prometo tentar.']
];
export const SCENES={
  ticket:[
    ['JOÃO','Achei! Sabia que tinha colocado esse bilhete num lugar seguro.'],
    ['CRIST','Debaixo do sol, em cima da mesa? Segurança de primeira...'],
    ['NARRADOR','Agora falta descobrir se os números bateram.']
  ],
  radio:[
    ['RÁDIO','Atenção! O bilhete premiado da loteria de hoje contém os números...'],
    ['JOÃO','É ESSE! CRIST! A GENTE GANHOU!'],
    ['CRIST','Ganhou mesmo? Me dá isso aqui!'],
    ['NARRADOR','Depois de conferir três vezes, não havia dúvida. Eles tinham ficado milionários.'],
    ['JOÃO','Já sei o que vamos fazer: LAS VEGAS!'],
    ['CRIST','Eu devia ter desconfiado que vinha alguma coisa...']
  ],
  crist:[
    ['CRIST','João, você nunca nem entrou num avião!'],
    ['JOÃO','Mas eu já andei de charrete. É quase a mesma coisa, só que mais alto.'],
    ['CRIST','Pelo amor de Deus, pelo menos arruma uma mala decente.'],
    ['JOÃO','Vegas que nos aguarde!']
  ],
  suitcase:[
    ['JOÃO','Chapéu, roupa de domingo, sabonete e a farofa para viagem!'],
    ['CRIST','Farofa no avião, João?'],
    ['JOÃO','A gente não pode depender da comida dos outros!'],
    ['NARRADOR','As malas estão prontas. Pelo menos eles acham que estão.']
  ],
  pantera:[
    ['JOÃO','Pantera, cuida da fazenda enquanto nós vamos conhecer o mundo.'],
    ['CRIST','Se ela pudesse falar, mandava a gente ficar em casa.'],
    ['JOÃO','Vou te trazer uma lembrancinha de Vegas, menina!'],
    ['NARRADOR','Pantera abana o rabo, sem imaginar a confusão que vem pela frente.']
  ],
  gate:[
    ['NARRADOR','Os dois seguem para a cidade, levando uma mala, um bilhete e uma confiança que provavelmente não deveriam ter.'],
    ['CRIST','Você sabe qual é o ônibus certo?'],
    ['JOÃO','Se tiver escrito Vegas, é nele que eu entro.'],
    ['CRIST','Não era bem isso que eu queria ouvir...']
  ],
  bikeOK:[
    ['CICLISTA','Foi mal, senhor! Não vi vocês atravessando!'],
    ['CRIST','João! A gente mal saiu de casa e já quase virou manchete!'],
    ['JOÃO','Por pouco não fui conhecer Las Vegas com auréola!']
  ],
  bikeHit:[
    ['NARRADOR','Uma bicicleta passa raspando. João tropeça, mas Crist consegue segurá-lo pela camisa.'],
    ['CRIST','Você ganhou na loteria, não ganhou imunidade a bicicleta!'],
    ['JOÃO','Ainda bem que meu chapéu continua inteiro.']
  ],
  bus:[
    ['JOÃO','Olha lá, Crist! Tá escrito EXCURSÃO ESTELAR. Vegas deve ser logo ali!'],
    ['CRIST','João... esse ônibus está cheio de roupa brilhante.'],
    ['ARTISTA','Entrem, meus amores! Vamos fazer um espetáculo inesquecível!'],
    ['JOÃO','Viu? Até recepção chique nós temos!'],
    ['CRIST','Eu tenho um péssimo pressentimento...'],
    ['NARRADOR','E assim João e Crist embarcam no ônibus errado. O destino? Uma grande aventura.']
  ]
};
export function getQuest(step){return QUESTS[Math.min(QUESTS.length-1,Math.max(0,step|0))];}
export function validateSave(raw){
  if(!raw||typeof raw!=='object'||raw.version!==1)return {version:1,step:0,hero:'joao'};
  return {version:1,step:Math.max(0,Math.min(8,Number(raw.step)||0)),hero:raw.hero==='crist'?'crist':'joao'};
}
