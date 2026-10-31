// Pure character asset and animation rules, checked in Node without Three.js.
export const CHARACTER_ASSETS=Object.freeze({
  joao:'./assets/characters/JOAO.glb',
  crist:'./assets/characters/CRIST.glb'
});
// Um GLB muito grande também pode ser carregado como fragmentos binários.
export const CHARACTER_PACKED_PARTS=Object.freeze({
  crist:Object.freeze([
    './assets/characters/CRIST.glb.part1',
    './assets/characters/CRIST.glb.part2'
  ])
});
export const CHARACTER_HEIGHT=1.7;
export const CHARACTER_CLIPS=Object.freeze({
  idle:'__idle__',walk:'Walking',run:'Running',dance:'FunnyDancing_02',
  celebrate:'Victory_Cheer',wave:'Wave_One_Hand',door:'open_door_4'
});
export function normalizeCharacterHeight(height,target=CHARACTER_HEIGHT){
  if(!Number.isFinite(height)||height<=0)return 1;
  return Math.max(.6,Math.min(1.5,target/height));
}
export function getCharacterAnimationName(clips,moving,gesture,dancing){
  const available=new Set(clips);
  const has=name=>available.has(name);
  if(dancing&&has('FunnyDancing_02'))return 'FunnyDancing_02';
  if(gesture==='celebrate'&&has('Victory_Cheer'))return 'Victory_Cheer';
  if(gesture==='dance'&&has('FunnyDancing_02'))return 'FunnyDancing_02';
  if((gesture==='talk'||gesture==='reach'||gesture==='shrug')&&has('Wave_One_Hand'))return 'Wave_One_Hand';
  if(moving>4.05&&has('Running'))return 'Running';
  if(moving>.12&&has('Walking'))return 'Walking';
  return has('__idle__')?'__idle__':clips[0]||null;
}
