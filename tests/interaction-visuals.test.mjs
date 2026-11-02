import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {suitcaseView,roadPhotoView,desertRepairView,physicalActionAt,SUITCASE_ITEMS}
  from '../src/interaction-visual-state.js';
import {QUESTS,SAVE_VERSION,validateSave} from '../src/story.js';

const file=path=>readFileSync(new URL(path,import.meta.url),'utf8');

test('a mala abre no step 4, recebe 3 itens em sequência e fecha a partir do 5',()=>{
 assert.deepEqual(SUITCASE_ITEMS,['documents','clothes','farofa']);
 let packed=[];
 assert.equal(suitcaseView(4,packed).open,true);
 assert.deepEqual(suitcaseView(4,packed).stored,[]);
 for(const id of SUITCASE_ITEMS){
   packed.push(id);
   assert.deepEqual(suitcaseView(4,packed).stored,packed);
   assert.equal(suitcaseView(4,packed).lidAngle,-1.08);
 }
 assert.equal(suitcaseView(5,packed).closed,true);
 assert.equal(suitcaseView(5,packed).lidAngle,0);
 assert.deepEqual(suitcaseView(5,[]).stored,SUITCASE_ITEMS,'save além do step 4 tem tudo guardado');
 assert.equal(suitcaseView(4,null).stored.length,0);
});

test('fotografia do mirante aparece no step 31 e permanece revelada nos saves 32–34',()=>{
 assert.equal(roadPhotoView(30).cameraVisible,false);
 assert.equal(roadPhotoView(31).cameraVisible,true);
 assert.equal(roadPhotoView(31).developed,false);
 for(const step of [32,33,34]){
   assert.equal(roadPhotoView(step).developed,true);
   assert.equal(validateSave({version:SAVE_VERSION,step}).step,step);
 }
 assert.equal(roadPhotoView(35).cameraVisible,false);
 assert.equal(physicalActionAt(31,QUESTS[31].id),'photo');
});

test('galão, mangueira e capô mudam por checkpoint mesmo após carregar save',()=>{
 const state=step=>desertRepairView(step);
 assert.equal(state(35).hoodOpen,true);
 assert.equal(state(37).canVisible,true);
 assert.equal(state(39).filled,false);
 assert.equal(state(40).carrying,true);
 assert.equal(state(40).filled,true);
 assert.equal(state(41).delivered,true);
 assert.equal(state(42).hoseInstalled,false);
 assert.equal(state(43).hoseInstalled,true);
 assert.equal(state(44).hoodOpen,false);
 assert.equal(state(44).steam,false);
 assert.equal(state(44).repaired,true);
 for(let step=35;step<=46;step++)
   assert.equal(validateSave({version:SAVE_VERSION,step}).step,step);
});

test('ações no momento do uso são explícitas e não confundem missões vizinhas',()=>{
 assert.equal(physicalActionAt(4,'documents'),null);
 assert.equal(physicalActionAt(4,'suitcase'),'close-suitcase');
 assert.equal(physicalActionAt(31,'roadPhoto'),'photo');
 assert.equal(physicalActionAt(39,'desertPump'),'fill');
 assert.equal(physicalActionAt(40,'desertCarry'),'deliver');
 assert.equal(physicalActionAt(42,'desertHose'),null);
 assert.equal(physicalActionAt(30,'roadPhoto'),null);
});

test('malha da Fazenda mostra mala animada e objetos acondicionados',()=>{
 const world=file('../src/world.js');
 assert.match(world,/suitcaseLid\.rotation\.x\+=/);
 assert.match(world,/suitcaseContents\[id\]=item/);
 assert.match(world,/suitcasePacked=Array\.isArray\(ids\)/);
 assert.match(world,/const visual=suitcaseView\(suitcaseStep,suitcasePacked\)/);
});

test('fotografia é acionada pela interação e aparece no save seguinte',()=>{
 const road=file('../src/road-world.js'),main=file('../src/main.js');
 assert.match(road,/takePhoto\(time\)/);
 assert.match(road,/photoCard\.visible=photoTaken/);
 assert.match(road,/shutter\.visible=t<flashUntil/);
 assert.match(main,/world\.road\?\.takePhoto\?\.\(clockTime\)/);
 assert.match(main,/world\.road\?\.setPhotoTaken\?\.\(roadPhotoView\(step\)\.developed\)/);
});

test('o Deserto liga galão cheio, vapor, mangueira e fechamento do capô aos passos',()=>{
 const desert=file('../src/desert-world.js'),main=file('../src/main.js');
 assert.match(desert,/waterGauge\.visible=visual\.filled/);
 assert.match(desert,/installedHose\.visible=visual\.hoseInstalled/);
 assert.match(desert,/repairLamp\.visible=visual\.repaired/);
 assert.match(desert,/bonnet\.rotation\.x\+=/);
 assert.match(desert,/p\.visible=visual\.steam/);
 assert.match(main,/world\.desert\?\.playAction\?\.\('fill',clockTime\)/);
 assert.match(main,/kind==='desertHose'\|\|kind==='desertCool'/);
});
