import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createMotionPlayer} from '../src/player.js';

function fixture({reduced=false, supported=true}={}) {
  const window = new EventTarget();
  const document = new EventTarget();
  const preference = Object.assign(new EventTarget(),{matches:reduced});
  const attributes = new Map();
  const classes = new Set();
  const observers = [];
  const animation = name => ({animationName:name,currentTime:0,playbackRate:1,playState:'paused',pause(){this.playState='paused';},play(){this.playState='running';},cancel(){this.playState='idle';}});
  const animations = [animation('mvl-clock'),animation('mvl-shot'),animation('mvl-cut')];
  const element = () => Object.assign(new EventTarget(),{hidden:true,value:'0',textContent:'',style:{setProperty(){}},setAttribute(key,value){this[key]=value;}});
  const controls=element(), toggle=element(), restart=element(), seek=element(), time=element(), speed=element();
  let inView;
  let attributeChange;
  Object.assign(window,{
    location:{origin:'http://localhost:8092'},parent:{},matchMedia:()=>preference,
    requestAnimationFrame:()=>1,cancelAnimationFrame(){},
    IntersectionObserver:class {constructor(fn){inView=fn;observers.push(this);}observe(){}disconnect(){this.disconnected=true;}},
    MutationObserver:class {constructor(fn){attributeChange=fn;observers.push(this);}observe(){}disconnect(){this.disconnected=true;}}
  });
  Object.assign(document,{defaultView:window,hidden:false,documentElement:{getAttribute:key=>attributes.get(key)}});
  const stage = supported ? {getAnimations:()=>animations} : {};
  const selectors = {'[data-motion-stage]':stage,'[data-motion-controls]':controls,'[data-motion-toggle]':toggle,'[data-motion-restart]':restart,'[data-motion-seek]':seek,'[data-motion-time]':time,'[data-motion-speed]':speed};
  const root = {ownerDocument:document,dataset:{duration:'30'},querySelector:selector=>selectors[selector],classList:{add:(...names)=>names.forEach(name=>classes.add(name)),remove:(...names)=>names.forEach(name=>classes.delete(name)),toggle(name,on){if(on)classes.add(name);else classes.delete(name);}}};
  return {root,window,document,preference,animations,controls,toggle,restart,seek,time,speed,classes,observers,
    visible(value){inView([{isIntersecting:value}]);},
    attribute(value){if(value)attributes.set('data-a11y-reduce-motion','true');else attributes.delete('data-a11y-reduce-motion');attributeChange();},
    message(origin,source,data){const event=new Event('message');Object.assign(event,{origin,source,data});window.dispatchEvent(event);}
  };
}

test('viewport pause/resume preserves explicit user pause',()=>{
  const f=fixture(); const player=createMotionPlayer(f.root);
  assert.equal(player.playing,false);
  f.visible(true); assert.equal(player.playing,true);
  f.toggle.dispatchEvent(new Event('click')); assert.equal(player.playing,false);
  f.visible(false); f.visible(true); assert.equal(player.playing,false);
  assert.equal(f.toggle['aria-label'],'Play animation');
  player.play(); assert.equal(player.playing,true);
  f.document.hidden=true; f.document.dispatchEvent(new Event('visibilitychange')); assert.equal(player.playing,false);
  f.document.hidden=false; f.document.dispatchEvent(new Event('visibilitychange')); assert.equal(player.playing,true);
  player.destroy();
});

test('seeking synchronizes every CSS animation, clamps endpoints, and replay resets time',()=>{
  const f=fixture(); const player=createMotionPlayer(f.root);
  player.pause(); player.seek(12.5);
  assert.ok(f.animations.every(animation=>animation.currentTime===12500));
  assert.equal(player.currentTime,12.5);
  assert.equal(f.time.textContent,'0:12 / 0:30');
  player.seek(-2); assert.equal(player.currentTime,0);
  player.seek(100); assert.ok(player.currentTime<30 && player.currentTime>29.9);
  player.seek(NaN); assert.ok(player.currentTime>29.9);
  f.visible(true); f.restart.dispatchEvent(new Event('click'));
  assert.equal(player.currentTime,0); assert.equal(player.playing,true);
  f.seek.value='8.2'; f.seek.dispatchEvent(new Event('input')); assert.equal(player.currentTime,8.2);
  player.destroy();
});

test('OS and host reduced motion keep playback stopped even after an explicit play request',()=>{
  const f=fixture({reduced:true}); const player=createMotionPlayer(f.root);
  f.visible(true); player.play();
  assert.equal(player.playing,false); assert.equal(f.controls.hidden,true); assert.ok(f.classes.has('is-reduced'));
  f.preference.matches=false; f.preference.dispatchEvent(new Event('change'));
  assert.equal(player.playing,true); assert.equal(f.controls.hidden,false);
  f.attribute(true); assert.equal(player.playing,false); assert.equal(f.controls.hidden,true);
  player.pause(); f.attribute(false); assert.equal(player.playing,false);
  player.destroy();
});

test('scrubbing temporarily pauses and speed changes preserve the selected frame',()=>{
  const f=fixture(); const player=createMotionPlayer(f.root); f.visible(true);
  f.seek.dispatchEvent(new Event('pointerdown')); assert.equal(player.playing,false);
  f.seek.value='16'; f.seek.dispatchEvent(new Event('input'));
  f.window.dispatchEvent(new Event('pointerup')); assert.equal(player.playing,true);
  f.speed.value='1.5'; f.speed.dispatchEvent(new Event('change'));
  assert.ok(f.animations.every(animation=>animation.playbackRate===1.5 && animation.currentTime===16000));
  f.speed.value='0'; f.speed.dispatchEvent(new Event('change'));
  assert.ok(f.animations.every(animation=>animation.playbackRate===1.5));
  player.destroy();
});

test('iframe suspension accepts only the same-origin parent and retains manual pause',()=>{
  const f=fixture(); const player=createMotionPlayer(f.root); f.visible(true);
  const message={type:'css-motion:visibility',visible:false};
  f.message('https://other.example',f.window.parent,message); assert.equal(player.playing,true);
  f.message(f.window.location.origin,{},message); assert.equal(player.playing,true);
  f.message(f.window.location.origin,f.window.parent,message); assert.equal(player.playing,false);
  player.pause();
  f.message(f.window.location.origin,f.window.parent,{...message,visible:true}); assert.equal(player.playing,false);
  player.destroy();
});

test('instances are independent, initialization is idempotent, destroy cleans up',()=>{
  const a=fixture(),b=fixture(); const first=createMotionPlayer(a.root),second=createMotionPlayer(b.root);
  assert.equal(createMotionPlayer(a.root),first);
  a.visible(true); b.visible(true); first.pause(); assert.equal(second.playing,true);
  first.seek(7); assert.equal(second.currentTime,0);
  first.destroy(); first.destroy();
  assert.equal(a.root.motionPlayer,undefined); assert.equal(a.controls.hidden,true);
  assert.equal(a.classes.has('is-ready'),false); assert.ok(a.observers.every(observer=>observer.disconnected));
  assert.ok(a.animations.every(animation=>animation.playState==='idle'));
  second.destroy();
});

test('unsupported animation API preserves the static fallback; invalid durations fail clearly',()=>{
  const fallback=fixture({supported:false}); assert.equal(createMotionPlayer(fallback.root),null);
  assert.equal(fallback.classes.has('is-ready'),false); assert.equal(fallback.controls.hidden,true);
  const invalid=fixture(); invalid.root.dataset.duration='Infinity';
  assert.throws(()=>createMotionPlayer(invalid.root),TypeError);
});
