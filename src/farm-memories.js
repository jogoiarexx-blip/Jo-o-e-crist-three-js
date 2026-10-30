// Pequenos acontecimentos opcionais. Não bloqueiam missões principais,
// não alteram a progressão e podem ser encontrados em qualquer visita à Fazenda.
export const FARM_MEMORIES=Object.freeze([
  Object.freeze({
    id:'portrait',name:'Fotografia antiga',x:-13.45,z:-15.8,radius:2.05,
    lines:Object.freeze([
      ['JOÃO','Olha essa foto, Crist. A gente era bonito, hein?'],
      ['CRIST','Eram os tempos antes de você pintar o galinheiro de roxo!'],
      ['JOÃO','Acho que esse retrato vai ficar bom em Las Vegas.']
    ])
  }),
  Object.freeze({
    id:'well',name:'Poço da sorte',x:8,z:-12,radius:2.7,
    lines:Object.freeze([
      ['CRIST','Esse poço aguentou mais verões do que nós dois juntos.'],
      ['JOÃO','Joguei uma moeda aqui e pedi sorte...'],
      ['CRIST','Era a minha moeda, João!']
    ])
  }),
  Object.freeze({
    id:'hens',name:'Galinhas curiosas',x:7,z:-17,radius:3.1,
    lines:Object.freeze([
      ['JOÃO','Minhas meninas, vocês vão tomar conta dessa fazenda!'],
      ['CRIST','Se as galinhas tomarem conta, pelo menos as contas ficam pagas.'],
      ['JOÃO','Parece que elas não querem que eu viaje!']
    ])
  })
]);
export const MEMORY_COUNT=FARM_MEMORIES.length;
const valid=new Set(FARM_MEMORIES.map(x=>x.id));
export function normalizeMemories(value){
  return Array.isArray(value)?[...new Set(value.filter(x=>typeof x==='string'&&valid.has(x)))]:[];
}
export function nearbyMemory(point,completed=[]){
  if(!point||!Number.isFinite(point.x)||!Number.isFinite(point.z))return null;
  const done=new Set(normalizeMemories(completed));
  let closest=null,dist=Infinity;
  for(const memory of FARM_MEMORIES){
    if(done.has(memory.id))continue;
    const d=Math.hypot(memory.x-point.x,memory.z-point.z);
    if(d<=memory.radius && d<dist){closest=memory;dist=d;}
  }
  return closest;
}
