// Áudio rural procedural criado pelo WebAudio, sem música protegida e sem autoplay.
export function createRuralAudio(){
  const AudioEngine=globalThis.AudioContext||globalThis.webkitAudioContext;
  let ctx=null,master=null,enabled=true,elapsed=0,chirpCount=0,busActive=false,busGain=null,busOsc=null;
  function resume(){
    if(!AudioEngine)return false;
    try{
      if(!ctx){ctx=new AudioEngine();master=ctx.createGain();master.gain.value=enabled?.65:0;master.connect(ctx.destination);if(busActive)setBusActive(true);}
      if(ctx.state==='suspended')ctx.resume().catch(()=>{});
      return true;
    }catch{return false;}
  }
  function setBusActive(value){
    busActive=!!value;
    if(!ctx)return;
    if(busActive&&!busGain){
      busGain=ctx.createGain();busGain.gain.value=.0001;
      const lowpass=ctx.createBiquadFilter();lowpass.type='lowpass';lowpass.frequency.value=105;
      busOsc=ctx.createOscillator();busOsc.type='sawtooth';busOsc.frequency.value=44;
      busOsc.connect(lowpass).connect(busGain).connect(master);busOsc.start();
    }
    if(busGain){
      busGain.gain.cancelScheduledValues(ctx.currentTime);
      busGain.gain.setTargetAtTime(busActive?.017:.0001,ctx.currentTime,.24);
    }
  }
  function play(frequency,duration=.13,type='sine',volume=.035){
    if(!enabled||!ctx||ctx.state!=='running')return;
    const start=ctx.currentTime,osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.type=type;osc.frequency.setValueAtTime(frequency,start);
    const dur=Math.max(.04,Math.min(1.3,duration));
    gain.gain.setValueAtTime(.0001,start);
    gain.gain.exponentialRampToValueAtTime(Math.max(.001,volume),start+.018);
    gain.gain.exponentialRampToValueAtTime(.0001,start+dur);
    osc.connect(gain).connect(master);osc.start(start);osc.stop(start+dur+.02);
  }
  function footstep(wood=false){
    if(!enabled||!ctx||ctx.state!=='running')return;
    // Passadas discretas, sintetizadas sem carregar arquivos de áudio.
    const start=ctx.currentTime,osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.type='triangle';osc.frequency.setValueAtTime(wood?135:93,start);
    osc.frequency.exponentialRampToValueAtTime(wood?74:51,start+.085);
    gain.gain.setValueAtTime(.0001,start);
    gain.gain.exponentialRampToValueAtTime(wood?.012:.009,start+.01);
    gain.gain.exponentialRampToValueAtTime(.0001,start+.105);
    osc.connect(gain).connect(master);osc.start(start);osc.stop(start+.12);
  }
  function bark(){
    if(!enabled||!ctx||ctx.state!=='running')return;
    for(let i=0;i<2;i++){
      const at=ctx.currentTime+i*.19;
      const osc=ctx.createOscillator(),gain=ctx.createGain(),filter=ctx.createBiquadFilter();
      filter.type='lowpass';filter.frequency.value=900;
      osc.type='sawtooth';osc.frequency.setValueAtTime(240,at);
      osc.frequency.exponentialRampToValueAtTime(i===0?112:128,at+.135);
      gain.gain.setValueAtTime(.0001,at);
      gain.gain.exponentialRampToValueAtTime(.027,at+.013);
      gain.gain.exponentialRampToValueAtTime(.0001,at+.15);
      osc.connect(filter).connect(gain).connect(master);
      osc.start(at);osc.stop(at+.16);
    }
  }
  function bird(){
    if(!ctx||!enabled||ctx.state!=='running')return;
    const t=ctx.currentTime,notes=[920,1080,840,1150],start=notes[chirpCount++%notes.length];
    for(let k=0;k<2;k++){
      const osc=ctx.createOscillator(),gain=ctx.createGain(),at=t+k*.19;
      osc.type='sine';
      osc.frequency.setValueAtTime(start+k*95,at);
      osc.frequency.exponentialRampToValueAtTime(start*1.3+k*90,at+.11);
      gain.gain.setValueAtTime(.0001,at);
      gain.gain.exponentialRampToValueAtTime(.022,at+.025);
      gain.gain.exponentialRampToValueAtTime(.0001,at+.19);
      osc.connect(gain).connect(master);osc.start(at);osc.stop(at+.2);
    }
  }
  return {
    resume,play,footstep,bark,setBusActive,
    update(dt){
      if(!enabled||!ctx||ctx.state!=='running')return;
      elapsed+=Math.max(0,Math.min(.1,dt));
      if(!busActive&&elapsed>=7.5){elapsed-=7.5;bird();}
    },
    setEnabled(value){
      enabled=!!value;
      if(master&&ctx){master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setTargetAtTime(enabled?.65:0,ctx.currentTime,.035);}
      if(enabled)resume();
    },
    close(){if(ctx){busOsc?.stop();ctx.close().catch(()=>{});ctx=null;master=null;busGain=null;busOsc=null;}}
  };
}
