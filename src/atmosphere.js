import * as THREE from 'three';
import {ATMOSPHERES,atmosphereKeyFor,mixAtmosphere} from './atmosphere-profiles.js';

// v0.7.0 — Céu em gradiente com brilho do sol, neblina da cor do horizonte e
// sombra que acompanha o jogador com resolução constante e sem tremulação.
const SKY_VERTEX=`
varying vec3 vDir;
void main(){
  vDir=normalize(position);
  vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.0);
  gl_Position=p.xyww;
}`;
const SKY_FRAGMENT=`
uniform vec3 zenith;uniform vec3 horizon;uniform vec3 groundColor;
uniform vec3 sunDir;uniform vec3 sunColor;uniform float glow;
varying vec3 vDir;
void main(){
  vec3 d=normalize(vDir);
  float h=d.y;
  vec3 sky=mix(horizon,zenith,pow(clamp(h,0.0,1.0),.55));
  // Faixa clara logo acima do horizonte dá profundidade ao fundo.
  sky=mix(sky,horizon*1.06,exp(-max(h,0.0)*18.0)*.35);
  vec3 col=h<0.0?mix(horizon,groundColor,clamp(-h*5.0,0.0,1.0)):sky;
  float s=max(dot(d,normalize(sunDir)),0.0);
  col+=sunColor*(pow(s,600.0)*1.6+pow(s,24.0)*.32*glow+pow(s,4.0)*.10*glow);
  gl_FragColor=vec4(col,1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export function createAtmosphere(scene,{hemi,sun,renderer,quality}){
  const uniforms={
    zenith:{value:new THREE.Color()},horizon:{value:new THREE.Color()},groundColor:{value:new THREE.Color()},
    sunDir:{value:new THREE.Vector3(0,1,0)},sunColor:{value:new THREE.Color()},glow:{value:.5}
  };
  const sky=new THREE.Mesh(new THREE.SphereGeometry(400,32,16),
    new THREE.ShaderMaterial({uniforms,vertexShader:SKY_VERTEX,fragmentShader:SKY_FRAGMENT,side:THREE.BackSide,depthWrite:false,fog:false}));
  sky.name='Céu dinâmico';sky.frustumCulled=false;sky.renderOrder=-10;
  scene.add(sky);
  scene.background=null;
  const range=quality?.shadowRange??22;
  sun.shadow.mapSize.set(quality?.shadowMap??1024,quality?.shadowMap??1024);
  Object.assign(sun.shadow.camera,{left:-range,right:range,top:range,bottom:-range,near:1,far:140});
  sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.normalBias=.035;sun.shadow.bias=-.0004;
  const texel=(range*2)/sun.shadow.mapSize.x;
  let key=atmosphereKeyFor(0),from=ATMOSPHERES[key],to=from,t=1,current={...from};
  const sunDir=new THREE.Vector3();
  function apply(p){
    uniforms.zenith.value.set(p.zenith);uniforms.horizon.value.set(p.horizon);
    uniforms.groundColor.value.set(p.ground);uniforms.sunColor.value.set(p.sun);uniforms.glow.value=p.glow;
    sunDir.set(...p.sunDir).normalize();uniforms.sunDir.value.copy(sunDir);
    if(!scene.fog)scene.fog=new THREE.Fog(p.fog,p.fogNear,p.fogFar);
    scene.fog.color.set(p.fog);scene.fog.near=p.fogNear;scene.fog.far=p.fogFar;
    hemi.color.set(p.hemiSky);hemi.groundColor.set(p.hemiGround);hemi.intensity=p.hemiIntensity;
    sun.color.set(p.sun);sun.intensity=p.sunIntensity;
    if(renderer)renderer.toneMappingExposure=p.exposure;
  }
  apply(current);
  return {
    sky,
    get key(){return key;},
    get current(){return current;},
    // Troca imediata (carregar save) ou mistura suave (passagem de capítulo).
    setStep(step,immediate=false){
      const next=atmosphereKeyFor(step);
      if(next===key&&!immediate)return;
      key=next;from={...current};to=ATMOSPHERES[next];t=immediate?1:0;
      if(immediate){current={...to};apply(current);}
    },
    update(dt,focus,cameraPosition){
      if(t<1){
        t=Math.min(1,t+dt/2.4);
        const eased=t*t*(3-2*t);
        current=mixAtmosphere(from,to,eased);apply(current);
      }
      if(cameraPosition)sky.position.copy(cameraPosition);
      if(focus){
        // Alinhar o alvo à grade de texels evita "serrilhado andando" nas sombras.
        const fx=Math.round(focus.x/texel)*texel,fz=Math.round(focus.z/texel)*texel;
        sun.target.position.set(fx,0,fz);
        sun.position.set(fx+sunDir.x*70,Math.max(8,sunDir.y*70),fz+sunDir.z*70);
        sun.target.updateMatrixWorld();
      }
    }
  };
}
