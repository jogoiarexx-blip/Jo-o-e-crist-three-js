// Inicialização sob demanda dos hubs 3D. Não cria, destrói ou duplica módulos
// até a primeira visita; ao retornar reutiliza o mesmo objeto (e colliders).
export function createChapterCache(factories){
  if(!factories || typeof factories!=='object')throw new TypeError('Fábricas de capítulos ausentes');
  const cache=Object.create(null);
  const keys=Object.keys(factories);
  for(const id of keys)if(typeof factories[id]!=='function')throw new TypeError('Fábrica inválida: '+id);
  return {
    get(id){
      if(!Object.hasOwn(factories,id))throw new RangeError('Capítulo desconhecido: '+id);
      if(!Object.hasOwn(cache,id)){
        const created=factories[id]();
        if(!created || typeof created.setActive!=='function')throw new TypeError('Capítulo sem setActive: '+id);
        cache[id]=created;
      }
      return cache[id];
    },
    peek(id){return Object.hasOwn(cache,id)?cache[id]:null;},
    loaded(){return {...cache};},
    names(){return keys.filter(id=>Object.hasOwn(cache,id));}
  };
}
