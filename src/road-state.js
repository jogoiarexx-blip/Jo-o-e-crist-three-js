// Capítulo 4 — Route 66. Lógica pura para direção, checkpoints, diálogos e testes.
export const ROAD_START=27;
export const ROAD_END=34;
export const ROAD_CENTER=Object.freeze({x:-28,z:27});
export const ROAD_SPAWN=Object.freeze({x:-34,z:32});
export const ROAD_QUESTS=Object.freeze([
  {id:'roadWelcome',title:'Conheça a Route 66',hint:'O voo com conexão terminou. Explore a parada turística e veja o mapa de estrada.'},
  {id:'roadRoute',title:'Crist: encontre a rota panorâmica',hint:'Leia as placas antes de sair. A Route 66 atravessa pequenas cidades e regiões desérticas.'},
  {id:'roadDrive1',title:'Dirija pelo primeiro trecho',hint:'Entre na van turística. Use A/D, SETAS ou analógico para desviar dos obstáculos. Não há game over.'},
  {id:'roadStop',title:'Descanse na lanchonete da estrada',hint:'Na parada, converse com a atendente e conheça mais histórias da viagem.'},
  {id:'roadPhoto',title:'Tire uma foto com os dois velhinhos',hint:'Encontre o mirante da Route 66 e registre a aventura dos dois.'},
  {id:'roadRepair',title:'João: faça uma revisão no veículo',hint:'Antes da próxima curva, João precisa conferir o radiador e o nível de água.'},
  {id:'roadDrive2',title:'Encare os desvios do deserto',hint:'Dirija a van e desvie dos objetos na estrada. Seguir bem reduz as confusões; errar não bloqueia a fase.'},
  {id:'roadBreakdown',title:'Descubra por que a van parou',hint:'O motor falhou. Inspecione o veículo e prepare o plano de sobrevivência para o próximo capítulo.'}
]);
export const ROAD_TARGETS=Object.freeze({
  roadWelcome:{x:-35,z:34,radius:3.0,label:'Ler placa Route 66'},
  roadRoute:{x:-31,z:34,radius:3.2,label:'Examinar mapa da estrada'},
  roadDrive1:{x:-28,z:29,radius:4.0,label:'Entrar na van e dirigir'},
  roadStop:{x:-37,z:28,radius:3.2,label:'Conversar na lanchonete'},
  roadPhoto:{x:-19,z:34,radius:3.3,label:'Fotografar a paisagem'},
  roadRepair:{x:-18,z:23,radius:3.2,label:'Revisar a van'},
  roadDrive2:{x:-28,z:29,radius:4.0,label:'Voltar à estrada'},
  roadBreakdown:{x:-18,z:23,radius:3.2,label:'Investigar a pane'}
});
export const ROAD_NPCS=Object.freeze([
  {id:'mabel',name:'Mabel, dona da lanchonete',x:-37,z:33,radius:2.8,lines:[
    ['MABEL','Bem-vindos à beira da Route 66! Por aqui todo viajante tem uma história.'],
    ['JOÃO','A nossa já tem ônibus errado e farofa no aeroporto.'],
    ['MABEL','Então vocês vão precisar de um café bem forte!']]},
  {id:'rudy',name:'Rudy, mecânico',x:-18,z:20,radius:2.8,lines:[
    ['RUDY','No deserto, água e revisão são mais importantes que pressa.'],
    ['CRIST','Eu avisei, João. Não adianta conversar com o motor.'],
    ['JOÃO','Mas ele responde quando a gente gira a chave!']]},
  {id:'nora',name:'Nora, fotógrafa',x:-20,z:38,radius:2.7,lines:[
    ['NORA','O melhor souvenir é uma fotografia. A luz daqui fica linda de tarde!'],
    ['JOÃO','Crist, fica do lado bom da minha cara.'],
    ['CRIST','Você só tem um lado bom, e eu ainda estou procurando.']]}
]);
export const ROAD_CHOICES=Object.freeze({
  route:{heading:'QUAL ESTRADA SEGUIR?',
    text:'No mapa, a rota turística marcada ROUTE 66 passa pelos mirantes. A rodovia expressa leva direto a uma cidade sem paradas.',
    options:[{id:'66',label:'Route 66 · estrada panorâmica e mirantes'},
      {id:'fast',label:'Via expressa · sem paradas turísticas'},
      {id:'closed',label:'Estrada fechada · obras'}],answer:'66'},
  repair:{heading:'O QUE VERIFICAR NA VAN?',
    text:'Rudy avisou que a viagem cruza uma região quente. João encontra um aviso: verificar água do radiador somente com o motor frio.',
    options:[{id:'hot',label:'Abrir a tampa do radiador com motor quente'},
      {id:'cool',label:'Esperar esfriar e verificar o nível de água'},
      {id:'tape',label:'Colar fita no painel e seguir viagem'}],answer:'cool'}
});
export const ROAD_SCENES=Object.freeze({
  welcome:[['NARRADOR','Depois da conexão aérea, João e Crist seguem com um pequeno grupo em uma van turística pela Route 66.'],
    ['JOÃO','Agora sim! Estrada americana, céu grande e o chapéu protegido do vento!'],
    ['CRIST','Se o João escolher o caminho desta vez, acabamos no Canadá. Vamos ver o mapa.'],
    ['MABEL','Bem-vindos! A Route 66 tem histórias em cada parada. Levem água e atenção.']],
  route:[['CRIST','É esse caminho. Rota panorâmica, placas históricas e um mirante no meio do trajeto.'],
    ['JOÃO','Aí sim! Eu quero tirar foto até de placa enferrujada.'],
    ['NARRADOR','A pequena van turística segue pela estrada, entre montanhas e cactos.']],
  wrong:[['JOÃO','Essa opção parecia boa na primeira olhada.'],
    ['CRIST','Ainda bem que aqui a gente pode conferir antes de fazer besteira.'],
    ['NARRADOR','Observe a pista e tente novamente.']],
  drive1:[['NARRADOR','A primeira parte da estrada termina sem maiores problemas.'],
    ['JOÃO','Olha só, Crist! Até que eu levo jeito com volante!'],
    ['CRIST','Você quase colecionou três cones e um barril. Vamos fazer uma parada.']],
  drive2:[['NARRADOR','O vento aumenta e os desvios no asfalto exigem atenção.'],
    ['JOÃO','Acho que o volante da van está mais nervoso do que eu!'],
    ['CRIST','Continua olhando pra estrada, não pras placas de hambúrguer!']],
  stop:[['MABEL','Dois cafés, água e um pedaço de torta. Viajante com pressa não aproveita a paisagem.'],
    ['JOÃO','Tem farofa? Não, deixa... já prometi descansar da farofa por um dia.'],
    ['CRIST','Essa é a notícia mais surpreendente da viagem inteira!']],
  photo:[['NORA','Fiquem juntinhos. Assim! Agora um sorriso para guardar na memória!'],
    ['JOÃO','Vamos mandar a foto pra Pantera quando voltarmos.'],
    ['CRIST','Ela vai querer saber quando a gente para de se perder.'],
    ['NARRADOR','Uma fotografia guarda o sonho dos dois: cruzar a estrada até chegar a Las Vegas.']],
  repair:[['RUDY','Boa decisão. Verificar a água com o motor frio evita grandes problemas.'],
    ['JOÃO','Aprendi na fazenda: máquina pede cuidado, não grito.'],
    ['CRIST','É a primeira vez que escuto essa frase de você!']],
  breakdown:[['NARRADOR','O motor engasga, a van perde força e para numa curva deserta.'],
    ['JOÃO','Uai... acabou o combustível ou ela cansou de ouvir nossas conversas?'],
    ['CRIST','A revisão ajudou, mas alguma peça está falhando. Vamos procurar ajuda.'],
    ['JOÃO','Ao menos temos água, documentos e uma foto bonita pra provar que estivemos aqui.'],
    ['NARRADOR','O sol começa a baixar. Ao longe, um posto de estrada pode ser a próxima esperança.']]
});
export function checkRoadAnswer(kind,value){
  const puzzle=ROAD_CHOICES[kind];
  return !!puzzle&&puzzle.options.some(o=>o.id===value)&&puzzle.answer===value;
}
export function findRoadNpc(position){
  if(!position||!Number.isFinite(position.x)||!Number.isFinite(position.z))return null;
  let best=null,dist=Infinity;
  for(const npc of ROAD_NPCS){const d=Math.hypot(position.x-npc.x,position.z-npc.z);if(d<=npc.radius&&d<dist){best=npc;dist=d;}}
  return best;
}
export const ROAD_DRIVES=Object.freeze({
  29:{length:295,speed:11.5,hazards:[
    {at:40,lane:0,type:'cone'},{at:76,lane:-1,type:'barrel'},
    {at:112,lane:1,type:'crate'},{at:150,lane:0,type:'cone'},
    {at:193,lane:1,type:'barrel'},{at:228,lane:-1,type:'crate'},
    {at:269,lane:0,type:'cone'}]},
  33:{length:345,speed:12.5,hazards:[
    {at:33,lane:1,type:'barrel'},{at:68,lane:0,type:'crate'},
    {at:106,lane:-1,type:'cone'},{at:146,lane:1,type:'barrel'},
    {at:182,lane:0,type:'crate'},{at:222,lane:-1,type:'barrel'},
    {at:267,lane:1,type:'cone'},{at:310,lane:0,type:'crate'}]}
});
const clamp=(v,low,high)=>Math.max(low,Math.min(high,v));
export function initialRoadRun(stage){
  if(!ROAD_DRIVES[stage])return null;
  return {stage,progress:0,offset:0,hits:0,passed:0};
}
export function normalizeRoadRun(data,stage){
  const def=ROAD_DRIVES[stage],fresh=initialRoadRun(stage);
  if(!def||!data||data.stage!==stage)return fresh;
  return {
    stage,
    progress:Number.isFinite(data.progress)?clamp(data.progress,0,def.length-.001):0,
    offset:Number.isFinite(data.offset)?clamp(data.offset,-2.75,2.75):0,
    hits:Number.isInteger(data.hits)?clamp(data.hits,0,def.hazards.length):0,
    passed:Number.isInteger(data.passed)?clamp(data.passed,0,def.hazards.length):0
  };
}
export function advanceRoadRun(current,steer,dt){
  const def=ROAD_DRIVES[current?.stage];
  if(!def)return {state:null,completed:false,hit:null};
  const run=normalizeRoadRun(current,current.stage);
  const t=clamp(Number.isFinite(dt)?dt:0,0,.05);
  const direction=clamp(Number.isFinite(steer)?steer:0,-1,1);
  const offset=clamp(run.offset+direction*t*5.7,-2.75,2.75);
  const speed=def.speed; // forward auto drive: only steering needs attention
  const progress=clamp(run.progress+speed*t,0,def.length);
  let passed=run.passed,hits=run.hits,hit=null;
  while(passed<def.hazards.length && progress>=def.hazards[passed].at){
    const hazard=def.hazards[passed];
    if(Math.abs(offset-hazard.lane*2.27)<.98){hits++;hit=hazard;}
    passed++;
  }
  return {state:{stage:run.stage,progress,offset,hits,passed},completed:progress>=def.length,hit};
}
export function roadGrade(hits){
  if(hits===0)return 'PERFEITO';
  if(hits<=2)return 'BOM PASSEIO';
  return 'CHEGARAM INTEIROS';
}
