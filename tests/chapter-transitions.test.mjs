import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  CHAPTER_TRANSITIONS,findChapterTransition,chapterTransitionAt,chapterEntryPosition
} from '../src/chapter-transitions.js';
import {chapterAt} from '../src/chapter-layers.js';
import {QUESTS,SCENES,SAVE_VERSION,FINAL_STEP,validateSave} from '../src/story.js';
import {BUS_SCENES,makeBusRoomColliders} from '../src/bus-state.js';
import {airportColliders} from '../src/airport-state.js';
import {makeRoadColliders} from '../src/road-state.js';
import {desertColliders} from '../src/desert-state.js';
import {isBlocked} from '../src/collision.js';

test('cinco pontes entre as seis fases, sem criar ou remover objetivos',()=>{
  assert.equal(SAVE_VERSION,7);assert.equal(FINAL_STEP,46);
  assert.equal(QUESTS.length,47);
  assert.deepEqual(CHAPTER_TRANSITIONS.map(t=>[t.from,t.to]),[
    [6,7],[11,12],[18,19],[26,27],[34,35]
  ]);
  assert.equal(new Set(CHAPTER_TRANSITIONS.map(t=>t.to)).size,5);
  for(const t of CHAPTER_TRANSITIONS){
    assert.equal(findChapterTransition(t.from,t.to),t);
    assert.equal(chapterTransitionAt(t.to),t);
    // Fazenda e Rodoviária compartilham o mesmo mapa externo.
    if(t.to===7)assert.equal(chapterAt(t.from),chapterAt(t.to));
    else assert.notEqual(chapterAt(t.from),chapterAt(t.to));
    assert.ok(t.message.length>20);
    assert.ok(t.lines.length>=3);
    assert.ok(t.lines.every(line=>line.length===2&&line[0]&&line[1]));
    assert.ok(Number.isFinite(t.spawn.x)&&Number.isFinite(t.spawn.z));
    assert.ok(Number.isFinite(t.camera.yaw)&&t.camera.zoom>0);
  }
  assert.equal(findChapterTransition(10,11),null);
  assert.equal(findChapterTransition(6,8),null);
  assert.equal(chapterTransitionAt(8),null);
  assert.equal(chapterTransitionAt(29),null);
  assert.equal(chapterEntryPosition(null,'joao'),null);
  assert.equal(chapterEntryPosition(CHAPTER_TRANSITIONS[0],'unknown'),null);
});

test('os dois velhinhos ficam juntos, com posições independentes do herói ativo',()=>{
  for(const t of CHAPTER_TRANSITIONS){
    const joao=chapterEntryPosition(t,'joao');
    const crist=chapterEntryPosition(t,'crist');
    assert.deepEqual(joao.joao,t.spawn);
    assert.deepEqual(crist.crist,t.spawn);
    assert.deepEqual(joao.crist,crist.joao);
    assert.ok(Math.hypot(joao.crist.x-joao.joao.x,joao.crist.z-joao.joao.z)>=.6);
    assert.ok(Math.hypot(joao.crist.x-joao.joao.x,joao.crist.z-joao.joao.z)<2.2);
  }
});

test('entrada de cada fase ocorre em área não bloqueada e preserva caminho',()=>{
  const collisions=new Map([
    [12,makeBusRoomColliders()],
    [19,airportColliders()],
    [27,makeRoadColliders()],
    [35,desertColliders()]
  ]);
  for(const t of CHAPTER_TRANSITIONS){
    const solids=collisions.get(t.to)||[];
    for(const hero of ['joao','crist']){
      const pos=chapterEntryPosition(t,hero);
      for(const id of ['joao','crist'])
        assert.equal(isBlocked(pos[id].x,pos[id].z,.38,0,solids),false,
          'spawn '+t.to+' / '+hero+' / '+id);
    }
  }
});

test('o acerto do portão 2 provoca uma confusão visível com a fila do portão 3',()=>{
  const route=SCENES.routeSolved.map(l=>l[1]).join(' ').toLowerCase();
  const wrongBus=SCENES.bus.map(l=>l[1]).join(' ').toLowerCase();
  const inside=BUS_SCENES.reveal.map(l=>l[1]).join(' ').toLowerCase();
  assert.match(route,/portão 2|portão dois/);
  assert.match(route,/chapéu/);
  assert.match(route,/alto-falante|chamada/);
  assert.match(wrongBus,/portão 3/);
  assert.match(wrongBus,/chapéu/);
  assert.match(wrongBus,/portas se fecham/);
  assert.match(wrongBus,/portão 2/);
  assert.match(inside,/festival estelar/);
  assert.match(inside,/aeroporto/);
  assert.match(inside,/chapéu/);
  assert.ok(SCENES.bus.length>6);
});

test('narrador conecta voo, van turística e pane à mesma aventura',()=>{
  const airport=CHAPTER_TRANSITIONS.find(t=>t.to===19).lines.map(l=>l[1]).join(' ');
  const road=CHAPTER_TRANSITIONS.find(t=>t.to===27).lines.map(l=>l[1]).join(' ');
  const desert=CHAPTER_TRANSITIONS.find(t=>t.to===35).lines.map(l=>l[1]).join(' ');
  assert.match(airport,/espetáculo/);
  assert.match(road,/conexão/);
  assert.match(road,/Estados Unidos/);
  assert.match(desert,/mesma van/);
  assert.match(desert,/posto/);
});

test('o runtime utiliza uma fonte única para transição e retomada, sem reset dos saves',()=>{
  const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
  assert.match(main,/findChapterTransition\(previous,destination\)/);
  assert.match(main,/chapterEntryPosition\(transition,heroId\)/);
  assert.match(main,/chapterTransitionAt\(step\)/);
  assert.match(main,/chapterEntryPosition\(chapterEntry,data.hero\)/);
  assert.match(main,/showDialogue\(transition.lines\)/);
  // Abrir a porteira (step 6) continua legítimo; só o teleporte manual foi retirado.
  assert.match(main,/if\(activeStep===6\)\{world\.openGate/);
  assert.doesNotMatch(main,/actors\[heroId\]\.position\.set\(49,0,21\)/);
  for(const [version,step,want] of [[1,8,12],[2,9,12],[3,12,12],[4,19,19],[5,27,27],[6,35,35],[7,11,11],[7,12,12],[7,18,18],[7,19,19],[7,26,26],[7,27,27],[7,34,34],[7,35,35],[7,46,46]])
    assert.equal(validateSave({version,step}).step,want);
});

test('QA-03 mostra chapéu voando e placas dos dois portões sem remover o bus original',()=>{
  const world=readFileSync(new URL('../src/world.js',import.meta.url),'utf8');
  const characters=readFileSync(new URL('../src/characters.js',import.meta.url),'utf8');
  const city=readFileSync(new URL('../src/city.js',import.meta.url),'utf8');
  assert.match(world,/windHat\.visible=step===11/);
  assert.match(world,/Chapéu voando · Portão 3/);
  assert.match(world,/SHOW ESTELAR/);
  assert.match(characters,/hat:joao\?g\.userData\.hat:null/);
  assert.match(characters,/d\.gesture==='reach'/);
  assert.match(city,/PORTÃO 2 · AEROPORTO/);
  assert.match(city,/PORTÃO 3 · EXCURSÃO ESTELAR/);
  const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
  assert.match(main,/hat\.visible=step!==11/);
});
