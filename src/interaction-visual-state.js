export const SUITCASE_ITEMS=Object.freeze(['documents','clothes','farofa']);
export function suitcaseView(step,packed=[]){const ids=new Set(Array.isArray(packed)?packed:[]);return {open:step===4,stored:step>4?[...SUITCASE_ITEMS]:SUITCASE_ITEMS.filter(id=>ids.has(id)),closed:step>4,lidAngle:step===4?-1.08:0};}
export function roadPhotoView(step){return {cameraVisible:step>=31&&step<=34,developed:step>=32&&step<=34};}
export function desertRepairView(step){return {canVisible:step>=37,filled:step>=40,carrying:step===40,delivered:step>=41,hoseInstalled:step>=43,hoodOpen:step>=35&&step<=43,steam:step>=35&&step<44,repaired:step>=44};}
export function physicalActionAt(step,target){if(step===4&&target==='suitcase')return 'close-suitcase';if(step===31&&target==='roadPhoto')return 'photo';if(step===39&&target==='desertFill')return 'fill';if(step===40&&target==='desertCarry')return 'deliver';return null;}
