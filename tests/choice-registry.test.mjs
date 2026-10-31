import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolvePuzzle} from '../src/puzzle-resolver.js';
import {CITY_CHOICES} from '../src/city-state.js';
import {ROAD_CHOICES} from '../src/road-state.js';
import {getQuest,SCENES} from '../src/story.js';

test('REPRODUÇÃO: no guichê o Portão 2 é válido (e não a alternativa da Route 66)',()=>{
  assert.equal(getQuest(10).id,'cityClerk');
  const selected=resolvePuzzle('route');
  assert.ok(selected,'resolução do puzzle do guichê');
  assert.equal(selected.puzzle,CITY_CHOICES.route);
  assert.equal(selected.chapter,'CAPÍTULO 01 · RODOVIÁRIA');
  assert.equal(selected.puzzle.heading,'QUAL É O PORTÃO DA PASSAGEM?');
  assert.deepEqual(selected.puzzle.options.map(o=>o.id),['1','2','3']);
  assert.equal(selected.check('1'),false);
  assert.equal(selected.check('2'),true,'alternativa 2 desbloqueia a história');
  assert.equal(selected.check('3'),false);
  assert.ok(SCENES.routeSolved.length>0);
});

test('Route 66: seleção de estrada usa roadRoute separado do portão do guichê',()=>{
  assert.equal(getQuest(28).id,'roadRoute');
  const road=resolvePuzzle('roadRoute');
  assert.ok(road,'puzzle da estrada não pode ficar ausente');
  assert.equal(road.puzzle,ROAD_CHOICES.route);
  assert.equal(road.chapter,'CAPÍTULO 04 · ROUTE 66');
  assert.equal(road.check('66'),true);
  assert.equal(road.check('2'),false);
  assert.deepEqual(road.puzzle.options.map(o=>o.id),['66','fast','closed']);
  const repair=resolvePuzzle('roadRepair');
  assert.equal(repair.puzzle,ROAD_CHOICES.repair);
  assert.equal(repair.check('cool'),true);
  assert.equal(repair.check('hot'),false);
  assert.equal(getQuest(32).id,'roadRepair');
});

test('todos os 16 desafios e suas alternativas possuem uma única resposta válida',()=>{
  const types=['bag','route','case','inspect','connect','checkin','passport',
    'farofa','security','gate','roadRoute','roadRepair','desertWater',
    'desertHose','desertCool','desertSigns'];
  for(const kind of types){
    const resolved=resolvePuzzle(kind);
    assert.ok(resolved,'opções registradas: '+kind);
    assert.equal(resolved.puzzle.options.length,3,kind);
    assert.equal(resolved.puzzle.options.filter(o=>resolved.check(o.id)).length,1,kind);
    assert.equal(resolved.check('invalid'),false,kind);
  }
  assert.equal(resolvePuzzle('unknown'),null);
  assert.equal(resolvePuzzle(''),null);
});

test('abertura, rótulo e clique usam a mesma resolução: sem colisão de validadores',()=>{
  const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
  assert.match(main,/return resolvePuzzle\(kind\)\?\.puzzle\|\|null/);
  assert.match(main,/const resolved=resolvePuzzle\(kind\)/);
  assert.match(main,/resolved\.chapter/);
  assert.match(main,/const correct=resolvePuzzle\(kind\)\?\.check\(optionId\)===true/);
  assert.match(main,/btn\.addEventListener\('click',\(\)=>submitCityChoice\(option\.id\)\)/);
  assert.match(main,/route:\{lines:SCENES\.routeSolved,next:11\}/);
  assert.match(main,/roadRoute:\{lines:ROAD_SCENES\.route,next:29\}/);
});
