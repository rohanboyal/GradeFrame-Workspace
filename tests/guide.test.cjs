const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../experience.js'),'utf8');
function boot(storage=new Map(),blocked=false){
 const nodes=new Map();
 const node=()=>({hidden:false,open:false,listeners:{},append(){},replaceChildren(){},showModal(){if(this.open)throw Error('already open');this.open=true;},close(){this.open=false;},addEventListener(type,fn){this.listeners[type]=fn;}});
 const $=id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id);};
 const localStorage={getItem(k){if(blocked)throw Error('unavailable');return storage.get(k)||null;},setItem(k,v){if(blocked)throw Error('unavailable');storage.set(k,v);}};
 vm.runInNewContext(source,{$,el:node,document:{querySelector:()=>node()},localStorage});
 return {$,storage};
}
test('first visit opens guide at step one and completing it remembers only dismissal',()=>{
 const {$,storage}=boot();assert.equal($('workspaceTour').open,true);assert.equal($('tourProgress').textContent,'STEP 1 OF 4');
 for(let i=0;i<4;i++)$('tourNext').onclick();
 assert.equal($('workspaceTour').open,false);assert.equal($('firstSteps').hidden,true);assert.deepEqual([...storage],[['gradeframe.guide.dismissed.v1','yes']]);
 assert.equal(boot(storage).$('workspaceTour').open,false);
});
test('skip remembers dismissal and Quick guide can reopen without duplicate dialogs',()=>{
 const {$,storage}=boot();$('skipTour').onclick();const next=boot(storage);assert.equal(next.$('workspaceTour').open,false);
 next.$('openTour').onclick();next.$('openTour').onclick();assert.equal(next.$('workspaceTour').open,true);assert.equal(next.$('tourProgress').textContent,'STEP 1 OF 4');
});
test('Escape remembers dismissal',()=>{
 const {$,storage}=boot();$('workspaceTour').listeners.cancel();assert.equal(boot(storage).$('workspaceTour').open,false);
});
test('blocked browser storage does not prevent guide completion',()=>{
 const {$}=boot(new Map(),true);assert.equal($('workspaceTour').open,true);$('skipTour').onclick();assert.equal($('workspaceTour').open,false);$('openTour').onclick();assert.equal($('workspaceTour').open,true);
});
