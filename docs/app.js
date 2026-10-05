import {initializeFilm} from './film.js?v=1';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const [data,reel,transcript,chapters]=await Promise.all(['data.json','assets/reel.json','transcript.json','chapters.json'].map(p=>fetch(p).then(r=>r.json())));

// The opening wall combines one real motivating case with five task illustrations.
const heroSection=$('.hero'), hero=$('#real-hero-video');let heroView='overview';
$('#showcase-scenes').innerHTML=data.activities.map((x,i)=>`<div class="showcase-cell showcase-task showcase-${x.image}"><video class="ambient-video" muted loop playsinline preload="none" poster="assets/${x.image}.webp" aria-label="${x.name}, native OmniGibson illustration"><source src="assets/${x.image}-loop.mp4" type="video/mp4"></video><span class="scene-tag">${x.name}</span></div>`).join('');
$('#hero-activity-line').innerHTML=data.activities.map((x,i)=>`<span><i class="activity-dot activity-${i}"></i>${x.name}</span>`).join('');
const beatLabels=['Contact','Wash','Handover','Treat','Continue'];
$('#reel-steps').innerHTML=reel.map((s,i)=>`<button class="reel-step" data-beat="${i}" aria-label="Show ${beatLabels[i].toLowerCase()} scene"><small>0${i+1}</small>${beatLabels[i]}</button>`).join('');
function updateReel(){const t=hero.currentTime;let i=reel.findIndex(s=>t>=s.start&&t<s.end);if(i<0)i=0;$$('[data-beat]').forEach((b,n)=>{b.classList.toggle('active',n===i);b.setAttribute('aria-pressed',String(n===i));b.style.setProperty('--progress',`${n<i?100:n>i?0:Math.max(0,Math.min(100,(t-reel[n].start)/(reel[n].end-reel[n].start)*100))}%`)});if(heroView==='real')$('#reel-caption').textContent=reel[i].title+'.';$('#reel-speed').textContent=reel[i].speed+'×';}
function setHeroView(view){heroView=view;heroSection.dataset.view=view;$$('.hero-view-switch button').forEach(b=>{const on=b.dataset.view===view;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on)});$('#reel-steps').hidden=view!=='real';$('#hero-activity-line').hidden=view==='real';$('#reel-speed').hidden=view!=='real';$('#hero-media-kind').textContent=view==='real'?'Real-robot motivating example':view==='tasks'?'Native OmniGibson illustrations':'Real-robot case + native simulation';if(view!=='real')$('#reel-caption').textContent=view==='tasks'?'Five activity groups, shared hygiene rules.':'A world of household decisions.';updateReel();updateMotion();}
hero.addEventListener('timeupdate',updateReel);updateReel();
$$('[data-beat]').forEach(b=>b.onclick=()=>{hero.currentTime=reel[+b.dataset.beat].start+.1;updateReel();});
$$('.hero-view-switch button').forEach(b=>b.onclick=()=>setHeroView(b.dataset.view));

// One fixed viewing area, with five native task scenes.
$('#task-stage').innerHTML=data.activities.map((x,i)=>`<div class="task-scene ${i===0?'active':''}" id="task-scene-${i}" role="tabpanel" aria-labelledby="task-${i}" ${i?'hidden':''}><video class="ambient-video" muted loop playsinline preload="none" poster="assets/${x.image}.webp" aria-label="${x.task}, native OmniGibson illustration"><source src="assets/${x.image}-loop.mp4" type="video/mp4"></video><div class="task-caption"><span>${x.count} benchmark instances in this activity group</span><h3>${x.task}</h3></div></div>`).join('');
$('#task-gallery').innerHTML=data.activities.map((x,i)=>`<button class="task-card ${i===0?'active':''}" id="task-${i}" role="tab" tabindex="${i===0?'0':'-1'}" aria-selected="${i===0}" aria-controls="task-scene-${i}" data-task="${i}"><img src="assets/${x.image}.webp" alt="" loading="lazy"><div><h3>${x.name}</h3><span>${x.count} instances</span></div></button>`).join('');
$('#area-list').textContent=data.areas.join(' / ');
function selectTask(i){$$('[data-task]').forEach((b,n)=>{b.classList.toggle('active',n===i);b.setAttribute('aria-selected',String(n===i));b.tabIndex=n===i?0:-1});$$('.task-scene').forEach((s,n)=>{s.hidden=n!==i;s.classList.toggle('active',n===i);if(n!==i)s.querySelector('video').pause()});}
$$('[data-task]').forEach((b,i)=>{b.onclick=()=>selectTask(i);b.onkeydown=e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key)){e.preventDefault();let n=e.key==='Home'?0:e.key==='End'?4:(i+(['ArrowRight','ArrowDown'].includes(e.key)?1:4))%5;selectTask(n);$('#task-'+n).focus()}}});

const registryViews=[
 {img:'fruit',title:'A clear service goal',text:'Place fruit on a plate. Preserve the functional roles of the robot, tools, and objects.'},
 {img:'contact',title:'Track what each surface touches',text:'Contact can transfer risk. Treating a gripper does not automatically treat the spoon.'},
 {img:'receive',title:'New contact enters the history',text:'Once observed, a new contact contributes to state reconstruction at the decision point.'},
 {img:'wash',title:'Wash the contact part',text:'Empty gripper required. Only the designated target is treated. The spoon is tracked separately.'},
 {img:'replace',title:'Priorities decide between safe choices',text:'Washing saves spare inserts. Replacement saves water. The preferred safe choice follows the user’s priority order.'}
];
const registries=$$('.registry-list details');function registryView(i){const v=registryViews[i],box=$('.registry-visual');document.dispatchEvent(new CustomEvent('registry-select',{detail:{index:i,title:v.title}}));box.querySelector('.mini-label').textContent=registries[i].querySelector('summary').textContent.trim().replace(/^0[1-5]\s*/,'');box.querySelector('h3').textContent=v.title;box.querySelector('p').textContent=v.text}
registries.forEach((d,i)=>d.addEventListener('toggle',()=>{if(d.open){registries.forEach(o=>{if(o!==d)o.open=false});registryView(i)}}));registryView(0);
function priority(name){$$('[data-priority]').forEach(b=>{const on=b.dataset.priority===name;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on)});$$('.cost-table tbody tr').forEach(row=>{row.classList.toggle('preferred',row.dataset.action===(name==='spares'?'wash':'replace'));[...row.querySelectorAll('td')].forEach((td,i)=>td.classList.toggle('emphasis',i===(name==='spares'?3:1)))});$('#priority-verdict').textContent='Preferred treatment: '+(name==='spares'?'Wash':'Replace');document.dispatchEvent(new CustomEvent('priority-select',{detail:{name}}))}
$$('[data-priority]').forEach(b=>b.onclick=()=>priority(b.dataset.priority));priority('spares');

let resultMode='overall',subset=0;
function renderChart(){const rs=data.main.map(r=>({name:r.name,values:resultMode==='overall'?[r.sr,r.osr]:resultMode==='difficulty'?r.difficulty[['easy','moderate','hard'][subset]]:r.activity.slice(subset*2,subset*2+2)}));
 $('#result-bars').innerHTML=rs.map(r=>`<div class="result-row ${r.name==='Hygiene-NSP'?'featured':''}"><div class="planner-name">${r.name}</div><div class="dual-bars" aria-label="${r.name}: SR ${r.values[0]} percent, OSR ${r.values[1]} percent"><div class="bar sr" style="width:${r.values[0]}%"><span>${r.values[0].toFixed(1)}</span></div><div class="bar osr" style="width:${r.values[1]}%"><span>${r.values[1].toFixed(1)}</span></div></div></div>`).join('');
 $('#chart-title').textContent=resultMode==='overall'?'Overall resolution, 624 instances':resultMode==='difficulty'?['Easy tasks','Moderate tasks','Hard tasks'][subset]:data.activities[subset].name;
 $('#chart-insight').textContent=resultMode==='overall'?'Hygiene-NSP achieves the highest overall SR and OSR in this evaluation.':resultMode==='difficulty'?'Every evaluated planner scores lower from easy to moderate to hard.':'Activity groups reveal different strengths. Gemini has the highest SR and OSR in cleaning and laundry.';
 $$('[data-result]').forEach(b=>{const on=b.dataset.result===resultMode;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on)});
}
function filters(){const names=resultMode==='overall'?[]:resultMode==='difficulty'?['Easy','Moderate','Hard']:data.activities.map(x=>x.name);$('#result-filters').innerHTML=names.map((n,i)=>`<button data-subset="${i}" class="${i===subset?'active':''}" aria-pressed="${i===subset}">${n}</button>`).join('');$$('[data-subset]').forEach(b=>b.onclick=()=>{subset=+b.dataset.subset;filters();renderChart()})}
$$('[data-result]').forEach(b=>b.onclick=()=>{resultMode=b.dataset.result;subset=0;filters();renderChart()});renderChart();
$('#swap-table').innerHTML='<caption class="sr-only">Saved-output history-swap evaluation by planner</caption><thead><tr><th>Planner</th><th>Safe + optimal before</th><th>Retained after</th><th>Newly safe + optimal</th><th>Irrelevant unchanged</th></tr></thead><tbody>'+data.swap.rows.map(r=>`<tr><th>${r.name}</th><td>${r.both_before}</td><td>${r.both_retained}</td><td>${r.both_new}</td><td>${r.irrelevant_unchanged} / ${r.irrelevant_evaluations}</td></tr>`).join('')+'</tbody>';
$('#event-table').innerHTML='<caption class="sr-only">Contact-event SR and OSR in percent</caption><thead><tr><th>Planner</th><th>Relevant SR / OSR</th><th>Irrelevant SR / OSR</th></tr></thead><tbody>'+data.events.map(r=>`<tr><th>${r.name}</th><td>${r.relevant.join(' / ')}</td><td>${r.irrelevant.join(' / ')}</td></tr>`).join('')+'</tbody>';

// Pause off-screen media and respect reduced-motion preferences.
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let ambientPaused=reduced.matches;const visibleVideos=new Set();
function updateMotion(){document.body.classList.toggle('motion-paused',ambientPaused);document.dispatchEvent(new CustomEvent('motion-preference',{detail:{paused:ambientPaused}}));const b=$('#motion-toggle');b.setAttribute('aria-pressed',ambientPaused);b.setAttribute('aria-label',ambientPaused?'Resume ambient motion':'Pause ambient motion');b.innerHTML=ambientPaused?'▶ <span>Play motion</span>':'Ⅱ <span>Pause motion</span>';$$('.ambient-video').forEach(v=>{if(!ambientPaused&&visibleVideos.has(v)&&!document.hidden&&!(v.closest('.showcase-task')&&heroView==='real')&&!(v===hero&&heroView==='tasks'))v.play().catch(()=>{});else v.pause()})}
const observer=new IntersectionObserver(es=>{es.forEach(({target,isIntersecting})=>{if(isIntersecting)visibleVideos.add(target);else visibleVideos.delete(target)});updateMotion()},{threshold:.08});$$('.ambient-video').forEach(v=>observer.observe(v));$('#motion-toggle').onclick=()=>{ambientPaused=!ambientPaused;updateMotion()};reduced.addEventListener('change',()=>{ambientPaused=reduced.matches;updateMotion()});document.addEventListener('visibilitychange',updateMotion);updateMotion();

$('#transcript').innerHTML=transcript.map(s=>`<h3>${s.title}</h3>${s.lines.map(l=>`<p>${l}</p>`).join('')}`).join('');
$('#chapter-links').innerHTML=chapters.map(c=>`<button data-time="${c.start}"><span>${c.stamp}</span>${c.label}</button>`).join('');initializeFilm(chapters);
const header=$('.site-header'),navLinks=$$('[data-section-nav]'),sections=navLinks.map(a=>document.getElementById(a.dataset.sectionNav));let tick=false;
function scrollUpdate(){header.classList.toggle('scrolled',scrollY>heroSection.offsetHeight-80);let current=null;sections.forEach(s=>{if(s.getBoundingClientRect().top<150)current=s.id});if($('#film').getBoundingClientRect().top<150)current=null;navLinks.forEach(a=>{const on=a.dataset.sectionNav===current;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});tick=false}
addEventListener('scroll',()=>{if(!tick){tick=true;requestAnimationFrame(scrollUpdate)}},{passive:true});addEventListener('resize',scrollUpdate);scrollUpdate();
window.siteReady=true;

$$('.mobile-nav a').forEach(a=>a.addEventListener('click',()=>{$('.mobile-nav').open=false}));document.addEventListener('keydown',e=>{if(e.key==='Escape')$('.mobile-nav').open=false});
