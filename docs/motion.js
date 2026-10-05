const $=s=>document.querySelector(s);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let globallyPaused=document.body.classList.contains('motion-paused')||reduced.matches;
// Each narrative plays once on entry, pauses out of view, and can be replayed.
const controllers=[];
function observe(el,play,pause){const state={el,play,pause,seen:false,visible:false,running:false};controllers.push(state);return state}
const hv=[$('#history-video-1'),$('#history-video-2')],hp=$('#history-play');
let historyDone=false,swapped=false,historyToken=0;
async function playHistory(){if(historyDone)return replayHistory();hist.running=true;hp.hidden=false;hp.textContent='Pause';await Promise.all(hv.map(v=>v.play().catch(()=>{hist.running=false;hp.textContent='Play both histories'})))}
function pauseHistory(){hv.forEach(v=>{v.pause();v.playbackRate=1});hp.textContent=historyDone?'Replay histories':'Play both histories'}
function restorePlans(){const slots=[...document.querySelectorAll('.plan-slot')],cards=[...document.querySelectorAll('.saved-plan')];cards.forEach(p=>slots[+p.dataset.plan-1].prepend(p));document.querySelectorAll('.swap-verdict').forEach(p=>{p.textContent='Safe and optimal';p.classList.remove('unsafe')});swapped=false;$('#swap-button').textContent='Swap the saved plans ⇄';$('#swap-explanation').hidden=true}
async function replayHistory(){historyToken++;pauseHistory();restorePlans();historyDone=false;$('#saved-plans').hidden=true;$('#swap-button').disabled=true;document.querySelectorAll('.history-outcome').forEach(e=>e.hidden=true);hv.forEach(v=>v.currentTime=0);await playHistory()}
function finishHistory(){if(historyDone)return;historyDone=true;hist.running=false;pauseHistory();hp.hidden=true;document.querySelectorAll('.history-outcome').forEach(e=>e.hidden=false);$('#saved-plans').hidden=false;$('#swap-button').disabled=false;$('#history-beat').textContent='Same decision point, different hygiene states';$('#history-progress').style.width='100%'}
const hist=observe($('.history-explorer'),playHistory,pauseHistory);
hp.onclick=()=>{if(!hv[0].paused){hist.running=false;pauseHistory()}else playHistory()};$('#history-replay').onclick=replayHistory;
const historyActions=[[[1.2,'Touch contaminated tray'],[2.8,'Take spoon'],[3.9,'Put spoon down'],[6,'Wash left gripper'],[7.2,'Wash right gripper'],[Infinity,'Receive spoon']],[[1.2,'Touch contaminated tray'],[3.3,'Wash left gripper'],[4.9,'Take spoon'],[6,'Put spoon down'],[7.2,'Wash right gripper'],[Infinity,'Receive spoon']]];
function showHistoryAction(i,t){$('#history-action-'+(i+1)).textContent=historyActions[i].find(([end])=>t<end)[1]}
// Update labels on decoded frames, rather than waiting for the coarser timeupdate event.
hv.forEach((v,i)=>{if(v.requestVideoFrameCallback){const labelFrame=(_,frame)=>{showHistoryAction(i,frame.mediaTime);v.requestVideoFrameCallback(labelFrame)};v.requestVideoFrameCallback(labelFrame)}});
hv[0].addEventListener('timeupdate',()=>{
 const t=hv[0].currentTime,duration=hv[0].duration||10.2;
 $('#history-progress').style.width=Math.min(100,t/duration*100)+'%';
 hv.forEach((v,i)=>showHistoryAction(i,v.currentTime));
 if(!historyDone)$('#history-beat').textContent=t<1.2?'Same contaminated-tray contact':t<6?'Different contact and washing order':t<7.2?'Both wash the right gripper':'The same handover';
 // Small rate corrections preserve continuous decoding; repeated seeks caused visible stalls.
 if(hist.running&&!hv[0].ended&&!hv[1].ended&&!hv[1].seeking){const drift=hv[1].currentTime-t;hv[1].playbackRate=Math.abs(drift)>.08?(drift>0?.94:1.06):1}
});
// Do not freeze the second pane early when the first video reaches its end.
hv.forEach(v=>v.addEventListener('ended',()=>{hv.forEach(x=>x.playbackRate=1);if(hv.every(x=>x.ended))finishHistory()}));
$('#swap-button').onclick=async()=>{if(!historyDone)return;const token=++historyToken,slots=[...document.querySelectorAll('.plan-slot')],cards=[...document.querySelectorAll('.saved-plan')];const before=cards.map(c=>c.getBoundingClientRect());swapped=!swapped;cards.forEach(c=>slots[swapped?2-+c.dataset.plan:+c.dataset.plan-1].prepend(c));const animations=cards.map((c,i)=>{const r=c.getBoundingClientRect();return c.animate([{transform:`translate(${before[i].x-r.x}px,${before[i].y-r.y}px)`},{transform:'translate(0,0)'}],{duration:reduced.matches?0:850,easing:'cubic-bezier(.22,.8,.25,1)'})});$('#swap-button').disabled=true;await Promise.all(animations.map(a=>a.finished));if(token!==historyToken)return;$('#swap-button').disabled=false;const verdicts=[...document.querySelectorAll('.swap-verdict')];verdicts[0].textContent=swapped?'Unsafe: contaminated gripper contacts fruit':'Safe and optimal';verdicts[0].classList.toggle('unsafe',swapped);verdicts[1].textContent=swapped?'Safe, not optimal: +3 TU, +2 water, +1 cleaner':'Safe and optimal';$('#swap-explanation').hidden=!swapped;$('#swap-button').textContent=swapped?'Restore original plans ↶':'Swap the saved plans ⇄'};
const rv=$('#registry-video'),rp=$('#registry-play');let registryIndex=0;
const registryClips=['assets/motion/fruit.mp4?v=12','assets/motion/rule.mp4?v=12','assets/motion/event.mp4?v=12','assets/motion/wash.mp4?v=12','assets/motion/replace.mp4?v=12'];
const registryPosters=['assets/motion/fruit.jpg','assets/motion/rule.jpg','assets/motion/event.jpg','assets/motion/wash.jpg','assets/motion/replace.jpg'];
async function playRegistry(){reg.running=true;rp.hidden=false;if(rv.ended)rv.currentTime=0;rp.textContent='Pause';await rv.play().catch(()=>{reg.running=false;rp.textContent='Play illustration'})}
function pauseRegistry(){rv.pause();rp.textContent=rv.ended?'Replay illustration':'Play illustration'}
const reg=observe($('.registry-layout'),playRegistry,pauseRegistry);
rp.onclick=()=>{if(rv.paused)playRegistry();else{reg.running=false;pauseRegistry()}};$('#registry-replay').onclick=()=>{rv.currentTime=0;playRegistry()};rv.addEventListener('ended',()=>{reg.running=false;rp.hidden=true;rp.textContent='Replay illustration'});
document.addEventListener('registry-select',e=>{registryIndex=e.detail.index;pauseRegistry();rv.src=registryClips[registryIndex];rv.poster=registryPosters[registryIndex];rv.setAttribute('aria-label',e.detail.title);rv.load();if(reg.visible&&!globallyPaused)playRegistry();});
// Animate the original paper's own structure; preserve its labels and values.
document.querySelectorAll('.paper-feature').forEach(fig=>{
 const controls=fig.querySelector('.paper-controls'),steps=[...controls.querySelectorAll('[data-focus]')],bar=document.createElement('div');bar.className='figure-tour';bar.innerHTML='<button class="motion-button">Play walkthrough</button><span></span>';controls.before(bar);const button=bar.querySelector('button'),label=bar.querySelector('span');let index=0,timer=null,internal=false;
 function select(i){internal=true;steps[i].click();internal=false;label.textContent=steps[i].textContent}
 function pause(){clearTimeout(timer);timer=null;button.textContent='Play walkthrough'}
 function advance(){if(index>=steps.length){ctrl.running=false;pause();select(0);label.textContent='Full figure';index=0;button.textContent='Replay walkthrough';return}select(index++);timer=setTimeout(advance,3600)}
 function play(){ctrl.running=true;button.textContent='Pause';if(!index)index=1;advance()}
 const ctrl=observe(fig,play,pause);button.onclick=()=>{if(ctrl.running){ctrl.running=false;pause()}else play()};steps.forEach(b=>b.addEventListener('click',()=>{if(!internal){ctrl.running=false;pause();index=0;label.textContent=b.textContent}}));
});
const observer=new IntersectionObserver(entries=>{for(const e of entries){const ctrl=controllers.find(x=>x.el===e.target);ctrl.visible=e.isIntersecting;if(!ctrl.visible){ctrl.pause();continue}if(!globallyPaused&&!document.hidden&&(!ctrl.seen||ctrl.running)){ctrl.seen=true;ctrl.play()}}},{threshold:.2});controllers.forEach(c=>observer.observe(c.el));
document.addEventListener('motion-preference',e=>{globallyPaused=e.detail.paused;controllers.forEach(c=>{if(globallyPaused)c.pause();else if(c.visible&&(!c.seen||c.running)){c.seen=true;c.play()}})});
document.addEventListener('visibilitychange',()=>controllers.forEach(c=>{if(document.hidden)c.pause();else if(c.visible&&c.running&&!globallyPaused)c.play()}));
window.narrativeReady=true;
