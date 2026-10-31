import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {canSwitchHero,isCompletedSave,shouldSimulateWorld} from '../src/game-state.js';
import {validateSave,FINAL_STEP,SAVE_VERSION} from '../src/story.js';

test('troca de protagonista usa mesma regra em teclado, gamepad e touch',()=>{
 const base={started:true,paused:false,dialogue:null,bikeEvent:null,airportRush:null,roadRun:null,choiceKind:null,lotteryOpen:false,completed:false};
 assert.equal(canSwitchHero(base),true);
 for(const field of ['paused','dialogue','bikeEvent','airportRush','roadRun','choiceKind','lotteryOpen','completed']){
   assert.equal(canSwitchHero({...base,[field]:true}),false,'bloquear durante '+field);
 }
 assert.equal(canSwitchHero({...base,started:false}),false);
 assert.equal(canSwitchHero(),false);
});
test('save do Deserto concluído permanece em 46',()=>{
 const done={version:SAVE_VERSION,step:FINAL_STEP,hero:'crist',packing:['documents','clothes','farofa']};
 assert.deepEqual(validateSave(done),done);
 assert.equal(isCompletedSave(validateSave(done).step,FINAL_STEP),true);
 assert.equal(isCompletedSave(45,FINAL_STEP),false);
 assert.equal(isCompletedSave(47,FINAL_STEP),false);
 assert.equal(isCompletedSave('46',FINAL_STEP),false);
});
test('mundo só é simulado durante gameplay não pausado',()=>{
 assert.equal(shouldSimulateWorld(true,false),true);
 assert.equal(shouldSimulateWorld(false,false),false);
 assert.equal(shouldSimulateWorld(true,true),false);
 assert.equal(shouldSimulateWorld(true,false,true),false);
});
test('handlers compartilham a política, fim não limpa save automaticamente',()=>{
 const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.match(main,/function heroSwitchAllowed\(\)\{/);
 assert.match(main,/function switchHero\(\)\{/);
 assert.match(main,/if\(name==='switch'\)switchHero\(\)/);
 assert.match(main,/if\(e\.code==='Tab'\)\{switchHero\(\);return;\}/);
 assert.match(main,/el\('touchSwitch'\).*switchHero\(\)/);
 assert.match(main,/if\(isCompletedSave\(step,FINAL_STEP\)\)\{/);
 assert.doesNotMatch(main,/if\(step===FINAL_STEP\)\{step=0/);
 assert.match(main,/resetMovementInput\(\)/);
 assert.match(main,/!shouldSimulateWorld\(started,paused\)/);
 assert.match(html,/REINICIAR AVENTURA DO ZERO/);
});
