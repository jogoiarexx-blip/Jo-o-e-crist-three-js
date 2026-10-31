import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 CHARACTER_ASSETS,CHARACTER_PACKED_PARTS,CHARACTER_HEIGHT,CHARACTER_HEIGHTS,CHARACTER_CLIPS,
 normalizeCharacterHeight,groundedFootCorrection,isFootContactBone,getCharacterAnimationName
} from '../src/avatar-logic.js';

test('models apontam para os dois GLBs enviados, sem inverter João e Crist',()=>{
 assert.equal(CHARACTER_ASSETS.joao,'./assets/characters/JOAO.glb');
 assert.equal(CHARACTER_ASSETS.crist,'./assets/characters/CRIST.glb');
 assert.deepEqual([...CHARACTER_PACKED_PARTS.crist],[
   './assets/characters/CRIST.glb.part1','./assets/characters/CRIST.glb.part2'
 ]);
 assert.equal(CHARACTER_HEIGHT,2.68);
 assert.deepEqual(CHARACTER_HEIGHTS,{joao:2.78,crist:2.58});
 assert.equal(normalizeCharacterHeight(2.68),1);
 assert.equal(normalizeCharacterHeight(1.8,CHARACTER_HEIGHTS.joao),2.78/1.8);
 assert.equal(normalizeCharacterHeight(2,CHARACTER_HEIGHTS.crist),2.58/2);
 assert.equal(normalizeCharacterHeight(0),1);
 assert.equal(normalizeCharacterHeight(NaN),1);
 assert.equal(normalizeCharacterHeight(100),2.68/100);
 assert.equal(normalizeCharacterHeight(.01),2.68/.01);
 assert.equal(normalizeCharacterHeight(2,NaN),1);
});

test('animações disponíveis no GLB de João: andar, correr, dançar, comemorar',()=>{
 const clips=['__idle__','Walking','Running','FunnyDancing_02','Victory_Cheer'];
 assert.equal(getCharacterAnimationName(clips,0,'',false),'__idle__');
 assert.equal(getCharacterAnimationName(clips,3.2,'',false),'Walking');
 assert.equal(getCharacterAnimationName(clips,5.25,'',false),'Running');
 assert.equal(getCharacterAnimationName(clips,0,'celebrate',false),'Victory_Cheer');
 assert.equal(getCharacterAnimationName(clips,0,'',true),'FunnyDancing_02');
 assert.equal(getCharacterAnimationName(clips,0,'dance',false),'FunnyDancing_02');
 assert.equal(getCharacterAnimationName(clips,0,'talk',false),'__idle__');
});

test('Crist usa a animação de aceno e ignora abertura de porta com root motion',()=>{
 const clips=['__idle__','Walking','Running','FunnyDancing_02','FunnyDancing_03',
   'Victory_Cheer','Wave_One_Hand','open_door_4'];
 assert.equal(getCharacterAnimationName(clips,0,'talk',false),'Wave_One_Hand');
 assert.equal(getCharacterAnimationName(clips,0,'shrug',false),'Wave_One_Hand');
 assert.equal(getCharacterAnimationName(clips,0,'reach',false),'Wave_One_Hand');
 assert.equal(getCharacterAnimationName(clips,0,'',false),'__idle__');
 assert.equal(getCharacterAnimationName(clips,0,'celebrate',false),'Victory_Cheer');
 assert.equal(getCharacterAnimationName(clips,0,'',true),'FunnyDancing_02');
 assert.equal(getCharacterAnimationName([],0,'',false),null);
});

test('código do jogo usa os GLBs no mesmo ator sem perder controles e save',()=>{
 const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
 const avatars=readFileSync(new URL('../src/avatar-glb.js',import.meta.url),'utf8');
 const characters=readFileSync(new URL('../src/characters.js',import.meta.url),'utf8');
 const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.match(main,/loadAllCharacterGlbs\(actors,/);
 assert.match(main,/createElder\('joao'\)/);
 assert.match(main,/createElder\('crist'\)/);
 assert.match(avatars,/loader\.loadAsync\(url\)/);
 assert.match(avatars,/loader\.parseAsync\(merged\.buffer,basePath\)/);
 assert.match(avatars,/new DataView\(merged\.buffer\)\.getUint32\(8,true\)/);
 assert.match(avatars,/root\.add\(mount\)/);
 assert.match(avatars,/new THREE\.Box3\(\)\.setFromObject\(mount\)/);
 assert.match(avatars,/avatarGround=/);
 assert.match(avatars,/groundedFootCorrection\(lowest,ground\.referenceY,dt\)/);
 assert.match(avatars,/avatarAnimation=makeCharacterAnimationState/);
 assert.match(avatars,/old\.visible=false/);
 assert.match(avatars,/onError\?\.\(id,error\)/);
 assert.match(characters,/updateCharacterAnimation\(root,dt\)/);
 assert.match(characters,/proceduralModel:g/);
 assert.match(index,/three\/addons\//);
});

test('pés são corrigidos gradualmente sem salto nem avanço após pausa',()=>{
 const down=groundedFootCorrection(.35,.12,1/60);
 const up=groundedFootCorrection(-.16,.12,1/60);
 assert.ok(down<0&&down>-.22);
 assert.ok(up>0&&up<.22);
 assert.equal(groundedFootCorrection(.1,.1,1/60),0);
 assert.equal(groundedFootCorrection(.5,0,0),0);
 assert.equal(groundedFootCorrection(NaN,0,1/60),0);
 assert.equal(groundedFootCorrection(0,NaN,1/60),0);
});

test('feet classifiers handle toe and ankle names',()=>{
 assert.equal(isFootContactBone('LeftToeBase'),true);
 assert.equal(isFootContactBone('mixamorigLeftFoot'),true);
 assert.equal(isFootContactBone('LeftAnkle'),true);
 assert.equal(isFootContactBone('LeftFoot_IK'),false);
 assert.equal(isFootContactBone('Hips'),false);
});
