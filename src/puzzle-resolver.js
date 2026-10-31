// Cadastro sem colisão de nomes entre os desafios de diferentes capítulos.
// "route" é o portão 2 da Rodoviária; "roadRoute" é a Route 66.
import {CITY_CHOICES,checkCityAnswer} from './city-state.js';
import {BUS_CHOICES,checkBusAnswer} from './bus-state.js';
import {AIRPORT_CHOICES,checkAirportAnswer} from './airport-state.js';
import {ROAD_CHOICES,checkRoadAnswer} from './road-state.js';
import {DESERT_CHOICES,checkDesertAnswer} from './desert-state.js';

const PUZZLE_GROUPS=Object.freeze([
  {chapter:'CAPÍTULO 01 · RODOVIÁRIA',choices:CITY_CHOICES,validate:checkCityAnswer},
  {chapter:'CAPÍTULO 02 · EXCURSÃO ERRADA',choices:BUS_CHOICES,validate:checkBusAnswer},
  {chapter:'CAPÍTULO 03 · AEROPORTO',choices:AIRPORT_CHOICES,validate:checkAirportAnswer},
  {chapter:'CAPÍTULO 04 · ROUTE 66',choices:ROAD_CHOICES,validate:checkRoadAnswer},
  {chapter:'CAPÍTULO 05 · DESERTO',choices:DESERT_CHOICES,validate:checkDesertAnswer}
]);
const ALIASES=Object.freeze({roadRoute:'route',roadRepair:'repair'});

export function resolvePuzzle(kind){
  if(typeof kind!=='string'||!kind)return null;
  // Usar namespace explícito nos puzzles da estrada; impede confundir
  // portão do aeroporto (route) com a estrada Route 66 (roadRoute).
  const roadAlias=Object.hasOwn(ALIASES,kind);
  const key=roadAlias?ALIASES[kind]:kind;
  const matches=PUZZLE_GROUPS.filter(group=>
    (roadAlias?group.choices===ROAD_CHOICES:kind==='route'?group.choices===CITY_CHOICES:true)&&
    Object.hasOwn(group.choices,key));
  if(matches.length!==1)return null; // nomes colidentes novos exigem namespace
  const group=matches[0],puzzle=group.choices[key];
  return {
    kind,chapter:group.chapter,puzzle,
    check:optionId=>group.validate(key,optionId)
  };
}
