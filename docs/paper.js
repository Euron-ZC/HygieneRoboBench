// Focus keeps the original labels, arrows, colors, and values intact.
const regions={
 fig1:{history:[.003,.126,.344,.862],event:[.349,.126,.248,.862],continuation:[.603,.126,.395,.862]},
 fig2:{sources:[.002,.005,.294,.99],registries:[.307,.763,.69,.23],builder:[.307,.005,.508,.755],verification:[.819,.005,.178,.755]}
};
document.querySelectorAll('.paper-feature').forEach(fig=>{
 const viewport=fig.querySelector('.paper-viewport'),focus=fig.querySelector('.paper-focus-outline');
 fig.querySelectorAll('[data-focus]').forEach(button=>button.addEventListener('click',()=>{
  fig.querySelectorAll('[data-focus]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});
  const r=regions[fig.dataset.paper][button.dataset.focus];viewport.classList.toggle('focused',!!r);
  if(r){[focus.style.left,focus.style.top,focus.style.width,focus.style.height]=r.map(x=>`${x*100}%`)}
 }));
});
const dialog=document.querySelector('#paper-dialog'),im=document.querySelector('#paper-dialog-image');
const names={fig1:'Contact history and safe continuation',fig2:'Dataset construction',fig3:'Dataset composition'};
document.querySelectorAll('.figure-open').forEach(button=>button.addEventListener('click',()=>{
 const n=button.dataset.figure;dialog.dataset.figure=n;im.src=`assets/paper/${n}.webp`;im.alt=names[n];document.querySelector('#paper-dialog-title').textContent=names[n];
 dialog.showModal();document.body.classList.add('paper-open');
}));
document.querySelector('#paper-dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
dialog.addEventListener('close',()=>document.body.classList.remove('paper-open'));
