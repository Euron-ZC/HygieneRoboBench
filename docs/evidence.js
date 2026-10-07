import {setPoster,loadCover} from './media.js?v=1';
// These are illustrations of fixed benchmark definitions, not a live solver.
const clips=[...document.querySelectorAll('.inline-clip')];
let paused=document.body.classList.contains('motion-paused')||matchMedia('(prefers-reduced-motion: reduce)').matches;
const states=new Map(clips.map(v=>[v,{visible:false,started:false,resume:false}]));
const play=v=>v.play().catch(()=>{});
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{const v=e.target,s=states.get(v);s.visible=e.isIntersecting;if(!s.visible){s.resume=!v.paused&&!v.ended;v.pause()}else if(!paused&&!document.hidden&&(!s.started||s.resume)){s.started=true;s.resume=false;play(v)}}),{threshold:.35});
clips.forEach(v=>observer.observe(v));
document.querySelectorAll('[data-replay-clip]').forEach(b=>b.onclick=()=>{const v=document.getElementById(b.dataset.replayClip);v.currentTime=0;states.get(v).started=true;play(v)});
document.addEventListener('motion-preference',e=>{paused=e.detail.paused;clips.forEach(v=>{const s=states.get(v);if(paused){s.resume=!v.paused&&!v.ended;v.pause()}else if(s.visible&&(!s.started||s.resume)){s.started=true;s.resume=false;play(v)}})});
document.addEventListener('visibilitychange',()=>clips.forEach(v=>{const s=states.get(v);if(document.hidden){if(!v.paused&&!v.ended)s.resume=true;v.pause()}else if(s.visible&&!paused&&s.resume){s.resume=false;play(v)}}));
const pv=document.getElementById('priority-video');
document.addEventListener('priority-select',e=>{const kind=e.detail.name==='water'?'replace':'wash';if(pv.dataset.kind===kind)return;pv.dataset.kind=kind;pv.src=`assets/motion/${kind}.mp4`;setPoster(pv,`assets/motion/${kind}.jpg`);pv.setAttribute('aria-label',kind==='wash'?'Preferred treatment illustration: washing':'Preferred treatment illustration: contact-part replacement');pv.load();const s=states.get(pv);s.started=false;if(s.visible&&!paused&&!document.hidden){s.started=true;play(pv)}});
pv.dataset.kind='wash';
const handoverDialog=document.getElementById('real-handover-dialog');
const handoverVideo=document.getElementById('real-handover-video');
document.getElementById('real-handover-open').onclick=()=>{handoverDialog.showModal();loadCover(handoverVideo);handoverVideo.currentTime=0;play(handoverVideo)};
document.getElementById('real-handover-close').onclick=()=>handoverDialog.close();
handoverDialog.addEventListener('close',()=>handoverVideo.pause());
