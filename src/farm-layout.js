// Coordenadas compartilhadas entre cenário, objetivos, câmera e testes.
// Sistema de eixos: +X = direção da cidade; +Z = frente da casa.
export const FARM_HOUSE=Object.freeze({
  cx:-15,cz:-13,halfWidth:7.5,halfDepth:4.5,
  doorX:-12,doorZ:-8.5,doorHalfWidth:1.4,
  interiorMinX:-22.1,interiorMaxX:-7.9,
  interiorMinZ:-17.15,interiorMaxZ:-8.85
});
export const FARM_GATE=Object.freeze({
  x:12.8,hingeZ:2.7,span:4.7,
  approachX:10.6,approachZ:5.0
});
export const FARM_OBJECTS=Object.freeze({
  documents:Object.freeze({x:-18.2,z:-11.6}),
  suitcase:Object.freeze({x:-12.1,z:-14.55}),
  ticket:Object.freeze({x:-4.6,z:2.3}),
  radio:Object.freeze({x:-10.5,z:1}),
  gate:Object.freeze({x:FARM_GATE.approachX,z:FARM_GATE.approachZ})
});
export function isInsideHouse(x,z){
  return Number.isFinite(x)&&Number.isFinite(z)&&
    x>FARM_HOUSE.interiorMinX&&x<FARM_HOUSE.interiorMaxX&&
    z>FARM_HOUSE.interiorMinZ&&z<FARM_HOUSE.interiorMaxZ;
}
// A porta é uma abertura REAL na parede frontal, sem collider invisível.
export function makeHouseColliders(){
  const x0=FARM_HOUSE.cx-FARM_HOUSE.halfWidth;
  const x1=FARM_HOUSE.cx+FARM_HOUSE.halfWidth;
  const z0=FARM_HOUSE.cz-FARM_HOUSE.halfDepth;
  const z1=FARM_HOUSE.cz+FARM_HOUSE.halfDepth;
  const left=FARM_HOUSE.doorX-FARM_HOUSE.doorHalfWidth;
  const right=FARM_HOUSE.doorX+FARM_HOUSE.doorHalfWidth;
  return [
    {x1:x0-.22,x2:x1+.22,z1:z0-.23,z2:z0+.23,height:5.5,tag:'house-back'},
    {x1:x0-.22,x2:x0+.22,z1:z0,z2:z1,height:5.5,tag:'house-left'},
    {x1:x1-.22,x2:x1+.22,z1:z0,z2:z1,height:5.5,tag:'house-right'},
    {x1:x0,x2:left,z1:z1-.23,z2:z1+.23,height:5.5,tag:'house-front-left'},
    {x1:right,x2:x1,z1:z1-.23,z2:z1+.23,height:5.5,tag:'house-front-right'}
  ];
}
// Cerca perimetral contínua, com passagem central através da porteira.
// Estes colliders são temporários para o protótipo, usando a mesma API de colisões.
export function makeFarmFenceColliders(){
  const x=FARM_GATE.x;
  const a=FARM_GATE.hingeZ,b=a+FARM_GATE.span;
  return [
    {x1:-40.4,x2:x+.3,z1:-25.25,z2:-24.75,height:1.9,tag:'north-fence'},
    {x1:-40.4,x2:x+.3,z1:23.75,z2:24.25,height:1.9,tag:'south-fence'},
    {x1:x-.21,x2:x+.21,z1:-25,z2:a-.12,height:1.9,tag:'gate-left-fence'},
    {x1:x-.21,x2:x+.21,z1:b+.12,z2:24,height:1.9,tag:'gate-right-fence'},
    {x1:x-.23,x2:x+.23,z1:a-.06,z2:b+.06,height:2.15,tag:'gate-leaf'}
  ];
}
export function gateCanOpen(step){return step>=5;}
