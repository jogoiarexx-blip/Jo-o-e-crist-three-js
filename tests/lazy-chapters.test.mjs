import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createChapterCache} from '../src/lazy-chapters.js';
import {chapterAt,applyChapterLayers,setColliderLayer} from '../src/chapter-layers.js';

function sceneFactory(id,colliders,counters){
 const collider={tag:'qa-'+id};
 return ()=>{
   counters[id]=(counters[id]??0)+1;
   const module={id,visible:false,
     setActive(on){
       if(module.visible===!!on)return;
       module.visible=!!on;
       setColliderLayer(colliders,[collider],module.visible);
     }
   };
   return module;
 };
}
test('nenhum hub é construído no menu nem na Fazenda',()=>{
 const active=[],builds={};
 const factories=Object.fromEntries(['bus','airport','road','desert'].map(id=>[id,sceneFactory(id,active,builds)]));
 const cache=createChapterCache(factories);
 assert.deepEqual(cache.names(),[]);
 assert.deepEqual(cache.loaded(),{});
 assert.equal(cache.peek('road'),null);
 assert.deepEqual(builds,{});
});
test('só materializa o capítulo visitado; reutiliza o mesmo hub ao voltar',()=>{
 const colliders=[],original=[{tag:'fazenda'}],outdoor={visible:true},builds={};
 const cache=createChapterCache(Object.fromEntries(['bus','airport','road','desert'].map(id=>[id,sceneFactory(id,colliders,builds)])));
 const enter=step=>{
   const id=chapterAt(step);
   if(id!=='outdoor')cache.get(id);
   applyChapterLayers(step,outdoor,colliders,original,cache.loaded());
 };
 enter(0);assert.deepEqual(cache.names(),[]);assert.ok(colliders.includes(original[0]));
 enter(12);assert.deepEqual(cache.names(),['bus']);assert.equal(outdoor.visible,false);
 assert.equal(builds.bus,1);assert.equal(cache.peek('road'),null);
 const first=cache.peek('bus');
 enter(18);enter(18);assert.equal(builds.bus,1);
 enter(19);assert.deepEqual(cache.names(),['bus','airport']);assert.equal(first.visible,false);
 enter(27);assert.deepEqual(cache.names(),['bus','airport','road']);
 enter(35);assert.deepEqual(cache.names(),['bus','airport','road','desert']);
 assert.equal(colliders.length,1,'somente deserto ativo');
 enter(7);assert.equal(outdoor.visible,true);
 assert.equal(colliders.length,1,'somente collider da Fazenda após retorno');
 enter(12);assert.equal(cache.peek('bus'),first);
 assert.equal(builds.bus,1);assert.equal(colliders.length,1);
 assert.equal(new Set(colliders).size,colliders.length);
 assert.deepEqual(builds,{bus:1,airport:1,road:1,desert:1});
});
test('get invalido não cria objetos ou não guarda objeto incompleto',()=>{
 const cache=createChapterCache({road:()=>({setActive(){}})});
 assert.throws(()=>cache.get('nope'),RangeError);
 assert.equal(cache.peek('nope'),null);
 assert.throws(()=>createChapterCache({bus:null}),TypeError);
 assert.throws(()=>createChapterCache(null),TypeError);
 const bad=createChapterCache({bus:()=>({})});
 assert.throws(()=>bad.get('bus'),TypeError);
 assert.deepEqual(bad.names(),[]);
});
test('código do mundo adia builders e usa métodos disponíveis apenas após montar',()=>{
 const world=readFileSync(new URL('../src/world.js',import.meta.url),'utf8');
 const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
 for(const id of ['bus','airport','road','desert'])assert.match(world,new RegExp(id+':\\(\\)=>build'));
 assert.match(world,/chapterCache\.get\(active\)/);
 assert.match(world,/chapterCache\.loaded\(\)/);
 assert.match(world,/loadedChapters\(\)/);
 assert.match(world,/chapterCache\.peek\('bus'\)\?\.setSoundFixed/);
 assert.match(world,/chapterCache\.peek\('desert'\)\?\.setStep/);
 assert.match(main,/world\.road\.setDrive\(roadRun\)/,'controle de direção preservado');
});
