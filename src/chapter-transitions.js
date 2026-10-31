// QA-03 — transições narrativas e posicionamento entre capítulos.
// Dados puros: uma única fonte para spawn, câmera e contexto de cada viagem.
export const CHAPTER_TRANSITIONS=Object.freeze([
  Object.freeze({
    from:6,to:7,chapter:'RODOVIÁRIA',continuous:true,spawn:Object.freeze({x:15.8,z:5.05}),
    companionOffset:Object.freeze({x:-1.3,z:-.5}),camera:Object.freeze({yaw:1.12,zoom:8.2}),
    message:'Porteira aberta! Siga pelo caminho até a praça da cidade.',
    lines:Object.freeze([
      ['NARRADOR','A porteira está aberta. A estrada continua até a praça; João e Crist podem seguir a pé, sem sair deste mapa.'],
      ['JOÃO','Olha, Crist! Já dá pra ver as casas da cidade lá adiante. Vamos andando!'],
      ['CRIST','Siga pela estrada até o painel da praça. Depois procuramos a rodoviária com calma.']
    ])
  }),
  Object.freeze({
    from:11,to:12,chapter:'EXCURSÃO ERRADA',spawn:Object.freeze({x:101.3,z:-32.55}),
    companionOffset:Object.freeze({x:.85,z:-1.2}),camera:Object.freeze({yaw:1.4,zoom:6.4}),
    message:'Portas fechadas! A excursão já está em movimento.',
    lines:Object.freeze([
      ['NARRADOR','O motorista fecha a porta enquanto João recupera o chapéu e Crist tenta explicar a confusão. O ônibus já saiu.'],
      ['CRIST','João, o transporte do aeroporto era no portão DOIS. Como nós viemos parar no TRÊS?'],
      ['JOÃO','Eu só queria meu chapéu! Agora precisamos descobrir para onde essa turma está indo.']
    ])
  }),
  Object.freeze({
    from:18,to:19,chapter:'AEROPORTO',spawn:Object.freeze({x:40,z:-31.5}),
    companionOffset:Object.freeze({x:.8,z:-1.2}),camera:Object.freeze({yaw:1.45,zoom:7.2}),
    message:'A trupe deixou João e Crist no aeroporto.',
    lines:Object.freeze([
      ['NARRADOR','Depois do espetáculo, Beto desvia da rota e deixa os novos amigos diante do aeroporto, com tempo para o embarque.'],
      ['LUZIA','Boa viagem! E, João, leia a placa inteira antes de subir no próximo transporte!'],
      ['CRIST','Agora vamos conferir os documentos e o voo. Sem atalhos nem excursões surpresa.']
    ])
  }),
  Object.freeze({
    from:26,to:27,chapter:'ROUTE 66',spawn:Object.freeze({x:-34,z:32}),
    companionOffset:Object.freeze({x:.95,z:-1.2}),camera:Object.freeze({yaw:1.25,zoom:8}),
    message:'Após a conexão aérea, a dupla começa a viagem pela Route 66.',
    lines:Object.freeze([
      ['NARRADOR','Depois do voo e de uma conexão, os dois finalmente chegam aos Estados Unidos. Uma van turística os leva à histórica Route 66.'],
      ['JOÃO','Crist! Desta vez o transporte certo tem quatro rodas e não tem figurino brilhante!'],
      ['CRIST','Antes de dirigir, vamos conferir o mapa. Vegas ainda fica mais adiante.']
    ])
  }),
  Object.freeze({
    from:34,to:35,chapter:'DESERTO',spawn:Object.freeze({x:-60.6,z:-13.7}),
    companionOffset:Object.freeze({x:.9,z:1}),camera:Object.freeze({yaw:1.18,zoom:7.3}),
    message:'A van parou no deserto! Inspecione o motor e procure sombra.',
    lines:Object.freeze([
      ['NARRADOR','A mesma van da Route 66 perde força e encosta no acostamento, diante de um pequeno posto isolado.'],
      ['JOÃO','Eu sabia que tinha esquecido alguma coisa... só não esperava que fosse a van funcionando!'],
      ['CRIST','Primeiro sombra e água. Depois procuramos alguém para consertar o motor.']
    ])
  })
]);
export function findChapterTransition(from,to){
  if(!Number.isInteger(from)||!Number.isInteger(to))return null;
  return CHAPTER_TRANSITIONS.find(t=>t.from===from&&t.to===to)||null;
}
export function chapterTransitionAt(step){
  return Number.isInteger(step)?CHAPTER_TRANSITIONS.find(t=>t.to===step)||null:null;
}
export function chapterEntryPosition(transition,activeHero){
  if(!transition||!['joao','crist'].includes(activeHero))return null;
  const {x,z}=transition.spawn,{x:dx,z:dz}=transition.companionOffset;
  return {
    joao:activeHero==='joao'?{x,z}:{x:x+dx,z:z+dz},
    crist:activeHero==='crist'?{x,z}:{x:x+dx,z:z+dz}
  };
}
