import {BUS_QUESTS} from './bus-state.js';

export const QUESTS=[
  {id:'wake',title:'Acorde e explore a casa',hint:'Use WASD, setas ou o analógico para caminhar até o café. Arraste a tela para olhar.'},
  {id:'radio',title:'Ouça o sorteio no rádio',hint:'O rádio está perto da varanda. Ouça o anúncio das dezenas premiadas.'},
  {id:'ticket',title:'Encontre e confira o bilhete',hint:'João deixou o bilhete na mesa da varanda. Compare com os números anunciados.'},
  {id:'crist',title:'Conte a novidade para Crist',hint:'Fale com seu companheiro de aventuras.'},
  {id:'suitcase',title:'Arrume as malas',hint:'Entre na casa, pegue os documentos na escrivaninha, separe as roupas e a farofa; depois feche a mala no quarto.'},
  {id:'pantera',title:'Despeça-se de Pantera',hint:'Uma boa aventura merece uma despedida.'},
  {id:'gate',title:'Abra a porteira da fazenda',hint:'Siga a cerca até a porteira de madeira, perto da estrada. Abra-a antes de sair.'},
  {id:'cityWelcome',title:'Conheça a praça e encontre a rodoviária',hint:'Na praça, leia o painel de informações e encontre a rodoviária. Você também pode conversar com moradores.'},
  {id:'crossing',title:'Atravesse a faixa com cuidado',hint:'Vá à faixa de pedestres perto da rodoviária. Cuidado com o ciclista apressado!'},
  {id:'cityBag',title:'Recupere a mala certa',hint:'A bagagem foi parar no carrinho do carregador. Troque para Crist e compare a etiqueta do comprovante.'},
  {id:'cityClerk',title:'Confira o portão das passagens',hint:'Com Crist, examine as passagens no guichê e encontre o portão correto para o aeroporto.'},
  {id:'bus',title:'Encontre João e embarque na excursão',hint:'O ônibus roxo está no terminal. João quer entrar antes de ouvir o aviso completo.'},
  ...BUS_QUESTS,
  {id:'done',title:'Excursão Errada concluída!',hint:'A amizade dos novos companheiros levará João e Crist ao próximo capítulo.'}
];
// Resultado inteiramente fictício, usado só no roteiro.
export const LOTTERY_NUMBERS=Object.freeze([3,11,18,27,42,56]);
export const INTRO=[
  ['NARRADOR','Ainda está bem cedinho no Sítio Boa Sorte. João acorda com o galo e o cheiro de café.'],
  ['JOÃO','Ai, minhas costas! Sonhei que estava em Las Vegas... com um burro jogando cartas.'],
  ['CRIST','Acorda, João! O café está pronto. E não vale ficar na cama o dia inteiro!'],
  ['NARRADOR','Caminhe pela casa usando WASD, setas ou o analógico. Arraste a tela para girar a câmera.']
];
export const SCENES={
  wake:[
    ['JOÃO','Hum! Café quentinho. Agora o dia pode começar.'],
    ['CRIST','O rádio vai anunciar o sorteio. Vai lá ouvir antes que eu esqueça os números!'],
    ['NARRADOR','A porta da casa está aberta. Explore o quintal e encontre o rádio.']
  ],
  ticket:[
    ['JOÃO','Achei! O bilhete estava na mesa esse tempo todo!'],
    ['CRIST','Debaixo do sol? João, isso é sua ideia de cofre?'],
    ['NARRADOR','Os números conferidos são os mesmos que o rádio anunciou.'],
    ['JOÃO','CRIST! A GENTE GANHOU!']
  ],
  radio:[
    ['RÁDIO','Bom dia! O sorteio de hoje saiu: 03, 11, 18, 27, 42 e 56!'],
    ['JOÃO','Uai... eu conheço esses números de algum lugar.'],
    ['CRIST','Você disse isso do aniversário da galinha. Procure o bilhete e confira!']
  ],
  crist:[
    ['CRIST','Conferi três vezes. Não tem engano, João: nós ficamos ricos!'],
    ['JOÃO','Agora vamos conhecer Las Vegas! Luzes, hotéis, shows e um monte de coisa que nunca vimos!'],
    ['CRIST','João, você nunca nem entrou num avião!'],
    ['JOÃO','Mas já andei de charrete. É quase a mesma coisa, só que mais alto!'],
    ['CRIST','Se vamos mesmo, arruma uma mala decente. Eu cuido dos documentos e das roupas.'],
    ['JOÃO','E eu cuido da farofa! Vegas que nos aguarde!']
  ],
  documents:[['CRIST','Documentos conferidos! João, dessa vez a gente não perde nada.'],['JOÃO','Eu só perdi documento umas três vezes...']],
  clothes:[['CRIST','Separei duas mudas de roupa. João, isso aqui não é desfile de moda!']],
  farofa:[['JOÃO','Pronto, a farofa tá garantida. Não confio em comida de avião!'],['CRIST','Se implicarem no aeroporto, você explica.']],
  suitcase:[
    ['JOÃO','Mala fechada aqui dentro de casa! Chapéu, roupa de domingo e a farofa pra viagem!'],
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
    ['JOÃO','Crist, segura aí que eu vou abrir essa porteira!'],
    ['NARRADOR','A porteira range, as dobradiças giram e o caminho até a cidade fica livre.'],
    ['NARRADOR','Os dois seguem para a cidade, levando uma mala, um bilhete e uma confiança que provavelmente não deveriam ter.'],
    ['CRIST','Você sabe qual é o ônibus certo?'],
    ['JOÃO','Se tiver escrito Vegas, é nele que eu entro.'],
    ['CRIST','Não era bem isso que eu queria ouvir...']
  ],
  cityWelcome:[
    ['NARRADOR','O ônibus da fazenda ficou para trás. João e Crist finalmente chegam à cidade, onde tudo parece acontecer depressa.'],
    ['JOÃO','Olha esse mundaréu de lojas! Nem parece que estamos a poucos quilômetros de casa!'],
    ['CRIST','Primeiro a rodoviária. Depois a gente se perde com calma.'],
    ['DONA NENA','Bom dia, viajantes! A rodoviária fica depois da faixa de pedestres. Atenção com as bicicletas!']
  ],
  bagWrong:[
    ['CRIST','Essa não é a nossa! A etiqueta não bate com o comprovante.'],
    ['JOÃO','Se fosse a mala com a sanfona, pelo menos eu aprendia uma música!'],
    ['SEU TONICO','Olhem com calma: o número certo tem zero, quatro e dois, nessa ordem.']
  ],
  bagSolved:[
    ['CRIST','Etiqueta 042, fita azul. Agora sim: a mala é nossa!'],
    ['SEU TONICO','Ainda bem. A última pessoa levou minha caixa de ferramentas achando que era bagagem.'],
    ['JOÃO','Nossa roupa está aqui! E a farofa, que é mais importante!']
  ],
  routeWrong:[
    ['FUNCIONÁRIA','Esse portão não combina com a passagem de vocês. Leiam o destino, não só o número!'],
    ['CRIST','João, se você conseguir escolher sozinho, vamos parar numa apresentação de teatro.'],
    ['JOÃO','Teatro? Eu até que danço bem, desde que não precise subir num palco!']
  ],
  routeSolved:[
    ['FUNCIONÁRIA','Muito bem! O transporte ao aeroporto sai do portão 2. Esperem pelo anúncio.'],
    ['CRIST','Ouviu, João? PORTÃO DOIS. Não é qualquer ônibus com luzes piscando!'],
    ['JOÃO','Uai, mas aquela excursão roxa está tão bonita...']
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
    ['JOÃO','Olha lá, Crist! Tá escrito EXCURSÃO ESTELAR. Dizem que tem espetáculo e tudo!'],
    ['CRIST','João... esse ônibus está cheio de roupa brilhante.'],
    ['ARTISTA','Entrem, meus amores! Vamos fazer um espetáculo inesquecível!'],
    ['JOÃO','Viu? Até recepção chique nós temos!'],
    ['CRIST','Eu tenho um péssimo pressentimento...'],
    ['NARRADOR','E assim João e Crist embarcam no ônibus errado. O destino? Uma grande aventura.']
  ]
};
// Os objetos da Fazenda são colecionáveis narrativos, não itens compráveis.
export const PACKING_ITEMS=Object.freeze([
  {id:'documents',name:'Documentos',hero:'crist',hint:'Use TAB/TROCAR para controlar Crist e confira os documentos na escrivaninha da casa.'},
  {id:'clothes',name:'Roupas',hero:'crist',hint:'Com Crist, encontre a roupa dobrada perto do varal.'},
  {id:'farofa',name:'Farofa',hero:'joao',hint:'Com João, procure o pote de farofa perto do depósito.'}
]);
const validPackingIds=new Set(PACKING_ITEMS.map(item=>item.id));
export function normalizePacking(value){
  if(!Array.isArray(value))return [];
  return [...new Set(value.filter(id=>typeof id==='string'&&validPackingIds.has(id)))];
}
export function nextPackingTarget(value){
  const done=new Set(normalizePacking(value));
  return PACKING_ITEMS.find(item=>!done.has(item.id))?.id||'suitcase';
}
export const SAVE_VERSION=4;
export const FINAL_STEP=19;
export function getPackingProgress(value){return normalizePacking(value).length;}
export function canUsePackingItem(id,hero){
  if(id==='suitcase')return hero==='joao';
  return PACKING_ITEMS.some(item=>item.id===id&&item.hero===hero);
}
export function getQuest(step){
  return QUESTS[Math.min(FINAL_STEP,Math.max(0,Number.isFinite(Number(step))?Math.floor(Number(step)):0))];
}
// v4 apenas acrescenta o interior da excursão. A mesma chave do save 3D
// permanece; os passos v1/v2/v3 são migrados sem perder itens já coletados.
export function validateSave(raw){
  const fallback={version:SAVE_VERSION,step:0,hero:'joao',packing:[]};
  if(!raw||typeof raw!=='object'||![1,2,3,SAVE_VERSION].includes(raw.version))return fallback;
  const value=Number(raw.step),index=Number.isFinite(value)?Math.floor(value):0;
  let step;
  if(raw.version===1){
    const v2=[0,2,3,4,5,6,7,8,9][Math.max(0,Math.min(8,index))];
    const v3=[0,1,2,3,4,5,6,7,9,12][v2];
    step=v3===12?12:v3;
  }else if(raw.version===2){
    const v3=[0,1,2,3,4,5,6,7,9,12][Math.max(0,Math.min(9,index))];
    step=v3===12?12:v3;
  }else if(raw.version===3){
    // O encerramento antigo (12) vira a entrada para o novo ônibus jogável.
    step=Math.max(0,Math.min(12,index));
  }else step=Math.max(0,Math.min(FINAL_STEP,index));
  const hero=raw.hero==='crist'?'crist':'joao';
  const packing=step>4?PACKING_ITEMS.map(item=>item.id):normalizePacking(raw.packing);
  return {version:SAVE_VERSION,step,hero,packing};
}
