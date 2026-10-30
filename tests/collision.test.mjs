import test from 'node:test';
import assert from 'node:assert/strict';
import {isBlocked,canReachInteraction} from '../src/collision.js';
test('mesa bloqueia o personagem mas não impede interagir pela borda',()=>{
  const table={x1:-5.95,x2:-3.25,z1:1.6,z2:3,height:1.2};
  assert.equal(isBlocked(-4.6,2.3,.38,0,[table]),true);
  assert.equal(isBlocked(-4.6,5.1,.38,0,[table]),false);
  assert.equal(canReachInteraction({x:-4.6,z:2.3},{x:-4.6,z:5.1},3.1),true);
});
test('câmera sobre obstáculo baixo mas não atravessa parede alta',()=>{
  const table={x1:-6,x2:-3,z1:1,z2:3,height:1.2};
  assert.equal(isBlocked(-4.2,2,.18,2,[table]),false);
  assert.equal(isBlocked(-4.2,2,.18,1,[table]),true);
  assert.equal(isBlocked(-12,-10,.18,7,[{x1:-22,x2:-7,z1:-17,z2:-8,height:9.5}]),true);
});
test('limites do mundo e coordenadas inválidas',()=>{
  assert.equal(isBlocked(-49,0),true);
  assert.equal(isBlocked(0,47),true);
  assert.equal(isBlocked(Number.NaN,0),true);
  assert.equal(isBlocked(0,0),false);
});
