// Pantera é uma companhia opcional: corre para se despedir, acompanha alguns
// passos dentro do quintal e depois volta ao seu lugar. Nunca segue até a cidade.
export const DOG_HOME=Object.freeze({x:2.5,z:-3.4});
export function farewellGoal(hero,time,excitedUntil,home=DOG_HOME){
  if(!hero||!Number.isFinite(hero.x)||!Number.isFinite(hero.z)||!(time<excitedUntil))
    return {x:home.x,z:home.z,excited:false};
  const dist=Math.hypot(hero.x-home.x,hero.z-home.z);
  const inYard=hero.x>=-5&&hero.x<=11&&hero.z>=-11&&hero.z<=8;
  if(!inYard||dist>11)return {x:home.x,z:home.z,excited:false};
  const dx=hero.x-home.x,dz=hero.z-home.z;
  const scale=dist>1.25?Math.max(0,(dist-1.25)/dist):0;
  return {x:home.x+dx*scale,z:home.z+dz*scale,excited:true};
}
export function dogAction(distanceToGoal,excited){
  if(distanceToGoal>.35)return excited?'run':'walk';
  return excited?'greet':'idle';
}
