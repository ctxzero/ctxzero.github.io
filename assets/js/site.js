(function(){
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE=matchMedia('(hover: hover) and (pointer: fine)').matches;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ── toast + clipboard ── */
const toast=$('#toast'); let toastT;
function say(msg){ toast.textContent=msg; toast.classList.add('on'); clearTimeout(toastT); toastT=setTimeout(()=>toast.classList.remove('on'),2200); }
async function copy(text,label){
  try{ await navigator.clipboard.writeText(text); }
  catch(_){ const ta=document.createElement('textarea'); ta.value=text; ta.style.cssText='position:fixed;opacity:0'; document.body.appendChild(ta); ta.select(); try{document.execCommand('copy');}catch(e){} ta.remove(); }
  say((label||'Copied')+' copied: '+text);
}

/* ── nav ── */
const nav=$('#nav'), navLinks=$$('#navLinks a'), spySecs=navLinks.map(a=>$(a.getAttribute('href'))).filter(Boolean);
let q=false;
function onScroll(){ if(q) return; q=true; requestAnimationFrame(()=>{
  const y=document.documentElement.scrollTop; nav.classList.toggle('solid',y>40);
  const probe=y+innerHeight*.35; let cur=-1; spySecs.forEach((s,i)=>{ if(s.offsetTop<=probe) cur=i; });
  navLinks.forEach((a,i)=>a.classList.toggle('on',i===cur)); q=false; }); }
addEventListener('scroll',onScroll,{passive:true}); onScroll();
const burger=$('#burger'), mmenu=$('#mmenu');
function setMenu(o){ document.body.classList.toggle('menu',o); burger.setAttribute('aria-expanded',String(o)); burger.setAttribute('aria-label',o?'Close menu':'Open menu'); }
burger.addEventListener('click',()=>setMenu(!document.body.classList.contains('menu')));
mmenu.addEventListener('click',e=>{ if(e.target.closest('a')) setMenu(false); });
matchMedia('(min-width:981px)').addEventListener('change',e=>{ if(e.matches) setMenu(false); });

/* ── page torch + contact headline light ── */
(function(){
  if(!FINE||RM) return;
  const torch=$('#torch'), big=$('#contactTitle .lit'), bigWrap=$('#contactTitle');
  let x=innerWidth/2, y=innerHeight/2, tx=x, ty=y, raf=0;
  addEventListener('pointermove',e=>{ tx=e.clientX; ty=e.clientY; torch.classList.add('on'); if(!raf) raf=requestAnimationFrame(tick); },{passive:true});
  document.documentElement.addEventListener('mouseleave',()=>torch.classList.remove('on'));
  function tick(){
    x+=(tx-x)*.18; y+=(ty-y)*.18;
    torch.style.setProperty('--tx',x+'px'); torch.style.setProperty('--ty',y+'px');
    const r=bigWrap.getBoundingClientRect();
    if(r.bottom>-200&&r.top<innerHeight+200){ big.style.setProperty('--cx',(x-r.left)+'px'); big.style.setProperty('--cy',(y-r.top)+'px'); }
    raf=(Math.abs(tx-x)+Math.abs(ty-y)>.5)?requestAnimationFrame(tick):0;
  }
})();

/* ── one-shot visibility ── */
const ioH=new Map();
const io=new IntersectionObserver((es,o)=>{ es.forEach(e=>{ if(!e.isIntersecting) return; e.target.classList.add('in'); o.unobserve(e.target); const h=ioH.get(e.target); if(h) h(e.target); }); },{threshold:.2,rootMargin:'0px 0px -6% 0px'});
$$('.io').forEach(el=>io.observe(el));
const onSeen=(el,fn)=>{ if(el) ioH.set(el,fn); };

/* ── counters ── */
function runCount(el){
  const to=parseInt(el.dataset.count,10); if(!isFinite(to)) return;
  const t=el.querySelector('span')||el;
  if(RM||to<1){ t.textContent=String(to); return; }
  const dur=1200, t0=performance.now();
  (function step(now){ const p=Math.min((now-t0)/dur,1); t.textContent=String(Math.round(to*(1-Math.pow(1-p,3)))); if(p<1) requestAnimationFrame(step); })(t0);
}
onSeen($('#stats'),el=>el.querySelectorAll('[data-count]').forEach(runCount));

/* ── advisory tilt + PoC status by date ── */
(function(){
  if(Date.now()>=Date.UTC(2026,9,30)){ const s=$('#pocStep'); s.classList.remove('wait'); s.classList.add('done'); $('#pocTxt').textContent='Released on WPScan, 30 October 2026'; }
  const adv=$('#adv1'); if(!adv||RM||!FINE) return;
  let raf=0, tx=0, ty=0;
  adv.addEventListener('pointermove',e=>{ const r=adv.getBoundingClientRect(), px=(e.clientX-r.left)/r.width, py=(e.clientY-r.top)/r.height;
    tx=(px-.5)*7; ty=(.5-py)*5; adv.style.setProperty('--gx',(px*100).toFixed(1)+'%'); adv.style.setProperty('--gy',(py*100).toFixed(1)+'%');
    if(!raf) raf=requestAnimationFrame(()=>{ adv.style.setProperty('--ry',tx.toFixed(2)+'deg'); adv.style.setProperty('--rx',ty.toFixed(2)+'deg'); raf=0; });
    adv.classList.add('tilting'); });
  adv.addEventListener('pointerleave',()=>{ adv.classList.remove('tilting'); adv.style.setProperty('--rx','0deg'); adv.style.setProperty('--ry','0deg'); });
})();

/* ── capability accordion ── */
$$('.acc-b').forEach(b=>b.addEventListener('click',()=>{
  const item=b.closest('.acc-i'), open=!item.classList.contains('open');
  item.classList.toggle('open',open); b.setAttribute('aria-expanded',String(open));
  $('#'+b.getAttribute('aria-controls')).inert=!open;
}));
$$('.acc-p').forEach(p=>{ p.inert=!p.closest('.acc-i').classList.contains('open'); });

/* ── terminal type-out ── */
onSeen($('#term'),term=>{ const lines=[...term.querySelectorAll('.ln')];
  if(RM){ lines.forEach(l=>l.classList.add('sh')); return; }
  lines.forEach((l,i)=>setTimeout(()=>l.classList.add('sh'),i===0?0:420+i*70)); });

/* ── clock + contact ── */
(function(){ const c=$('#clock'); const tick=()=>{ c.textContent=new Date().toISOString().slice(11,19)+' UTC'; }; tick(); setInterval(tick,1000); })();
$('#discordBtn').addEventListener('click',()=>copy('ctxzero','Discord name'));
(function(){ const btn=$('#mailBtn'), sub=$('#mailSub'), MAIL=['ctxzero.pentest','gmail.com'].join('@'); let shown=false;
  btn.addEventListener('click',()=>{ if(!shown){ sub.textContent=MAIL; shown=true; const m=$('#mailTo'); m.href='mailto:'+MAIL; m.hidden=false; say('Click again to copy the address'); } else copy(MAIL,'E-mail'); }); })();

/* ══════════════════════════════════════════════════════════
   HERO: flashlight over recon output
   The field is filled with the kind of output an engagement
   produces (hosts, ports, paths, AD edges, hashes). It sits
   almost black; the pointer is a torch that makes it legible,
   and the secrets in it light up white.
   ══════════════════════════════════════════════════════════ */
(function(){
  const hero=$('#hero'), base=$('#fBase'), lit=$('#fLit'), ring=$('#ring');
  const WORDS=['www.corp.local','dev.corp.local','vpn.corp.local','git.corp.local','backup.corp.local','mail.corp.local','admin','svc_backup','svc_sql','svc_web','j.keller','a.novak','m.berg',
    '445/tcp open microsoft-ds','88/tcp open kerberos-sec','389/tcp open ldap','5985/tcp open wsman','80/tcp open http nginx 1.18.0','22/tcp open ssh OpenSSH 8.9p1','3306/tcp open mysql',
    '/admin [302]','/backup.zip [200]','/.git/HEAD [200]','/api/v1/users [200]','/uploads [301]','/wp-admin/ [302]','/server-status [403]',
    'GenericAll','WriteDACL','DCSync','ESC1','ESC8','AS-REP roastable','Kerberoastable','SeImpersonatePrivilege','ForceChangePassword','HasSession','AdminTo','MemberOf'];
  const SECRETS=['svc_backup:Backup2024!','krbtgt:aad3b435b51404ee','CORP\\Administrator','root@db01','id_rsa','flag{recon_to_root}','password=Winter2026!','token=eyJhbGciOi','NT:31d6cfe0d16ae931','Domain Admins'];
  const rnd=a=>a[(Math.random()*a.length)|0];
  const hex=n=>{ let s=''; while(s.length<n) s+=Math.floor(Math.random()*16).toString(16); return s.slice(0,n); };
  function build(){
    const cols=Math.ceil(innerWidth/7.2)+4, rows=Math.ceil(hero.offsetHeight/19.4)+2;
    let b='', l='';
    for(let r=0;r<rows;r++){
      let lb='', ll='';
      while(lb.length<cols){
        const roll=Math.random();
        const tok=roll<.05?rnd(SECRETS):roll<.55?rnd(WORDS):hex(8+((Math.random()*24)|0));
        lb+=tok+'   '; const e=esc(tok); ll+=(SECRETS.includes(tok)?'<b>'+e+'</b>':e)+'   ';
      }
      b+=lb.slice(0,cols)+'\n'; l+=ll+'\n';
    }
    base.textContent=b; lit.innerHTML=l;
  }
  build();
  /* rebuild on width changes only: mobile URL-bar show/hide fires resize on every scroll */
  let rt, lastW=innerWidth; addEventListener('resize',()=>{ if(innerWidth===lastW) return; lastW=innerWidth; clearTimeout(rt); rt=setTimeout(build,250); },{passive:true});
  if(RM){ lit.style.setProperty('--x','72%'); lit.style.setProperty('--y','38%'); return; }
  requestAnimationFrame(()=>lit.classList.add('lit-on'));
  let x=innerWidth*.72, y=innerHeight*.38, tx=x, ty=y, auto=!FINE, alive=false, visible=true, t0=performance.now();
  hero.addEventListener('pointermove',e=>{ if(e.pointerType!=='mouse') return; const r=hero.getBoundingClientRect(); tx=e.clientX-r.left; ty=e.clientY-r.top; auto=false; },{passive:true});
  hero.addEventListener('pointerleave',()=>{ auto=true; t0=performance.now()-((Math.asin(Math.max(-1,Math.min(1,(x/hero.offsetWidth-.62)/.24)))/.45)*1000||0); });
  function frame(now){
    if(!alive) return;
    if(auto){ const t=(now-t0)/1000; tx=hero.offsetWidth*(.62+.24*Math.sin(t*.45)); ty=hero.offsetHeight*(.4+.18*Math.sin(t*.7)); }
    x+=(tx-x)*.12; y+=(ty-y)*.12;
    lit.style.setProperty('--x',x.toFixed(1)+'px'); lit.style.setProperty('--y',y.toFixed(1)+'px');
    ring.style.setProperty('--px',x.toFixed(1)+'px'); ring.style.setProperty('--py',y.toFixed(1)+'px');
    requestAnimationFrame(frame);
  }
  const start=()=>{ if(alive) return; alive=true; requestAnimationFrame(frame); }, stop=()=>{ alive=false; };
  new IntersectionObserver(es=>{ visible=es[0].isIntersecting; visible&&!document.hidden?start():stop(); }).observe(hero);
  document.addEventListener('visibilitychange',()=>{ document.hidden?stop():(visible&&start()); });
})();

/* ══════════════════════════════════════════════════════════
   WRITEUPS (live from github.com/ctxzero/writeups)
   ══════════════════════════════════════════════════════════ */
const GH_USER='ctxzero', REPO='writeups', BRANCH='main', LIST_PATH='HackTheBox/Machines';
const EXCLUDE=['cap','gettingstarted','readme'];
const API=p=>`https://api.github.com/repos/${GH_USER}/${REPO}/contents/${p}?ref=${BRANCH}`;
const RAW=`https://raw.githubusercontent.com/${GH_USER}/${REPO}/${BRANCH}/`;
/* self-hosted, loaded only when a writeup is opened. Version is in the file name: bump both together. */
const LIBS=['assets/js/vendor/marked-18.2.0.umd.js','assets/js/vendor/purify-3.4.17.min.js','assets/js/vendor/highlight-11.12.0.min.js'];
/* the listing is cached per tab for 10 minutes: the unauthenticated GitHub API allows 60 requests an hour per IP */
const CACHE_KEY='ctx0.wu.v1', CACHE_TTL=6e5;
function cacheGet(maxAge){ try{ const c=JSON.parse(sessionStorage.getItem(CACHE_KEY)); if(c&&Array.isArray(c.items)&&Date.now()-c.t<maxAge) return c.items; }catch(_){} return null; }
function cacheSet(items){ try{ sessionStorage.setItem(CACHE_KEY,JSON.stringify({t:Date.now(),items:items.map(f=>({name:f.name,path:f.path,type:f.type,html_url:f.html_url,size:f.size}))})); }catch(_){} }
const RANK={easy:1,medium:2,hard:3,insane:4};
const OS_ICON={
  windows:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 5.5 10.2 4.5v7.1H3V5.5Zm8.4-1.2L21 3v8.6h-9.6V4.3ZM3 12.9h7.2V20L3 18.9v-6Zm8.4 0H21V21l-9.6-1.3v-6.8Z"/></svg>',
  linux:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c2.3 0 3.6 1.9 3.5 4.3-.1 1.6.4 2.4 1.2 3.6 1 1.5 1.8 2.9 1.8 5 0 2.4-1.2 4.1-2.6 5-.5.3-1 .2-1.2-.3-.6-1.1-1.5-1.6-2.7-1.6s-2.1.5-2.7 1.6c-.2.5-.7.6-1.2.3-1.4-.9-2.6-2.6-2.6-5 0-2.1.8-3.5 1.8-5 .8-1.2 1.3-2 1.2-3.6C8.4 3.9 9.7 2 12 2Zm-1.4 4.1c-.4 0-.7.4-.7.9s.3.9.7.9.7-.4.7-.9-.3-.9-.7-.9Zm2.8 0c-.4 0-.7.4-.7.9s.3.9.7.9.7-.4.7-.9-.3-.9-.7-.9Z"/></svg>'
};
const GO='<svg class="go" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"/></svg>';
const wuList=$('#wuList'), filtersEl=$('#filters'), wuCount=$('#wuCount');
let entries=[], filter={t:'all',v:''};
const slugify=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function parseEntry(f){
  const base=f.name.replace(/\.md$/i,'');
  const m=base.match(/^\s*(easy|medium|hard|insane)\s*[-–]\s*([a-z]+)\s*[-–]\s*(.+)$/i);
  const machine=m?m[3].trim():base.replace(/[-_]+/g,' ').trim();
  const mins=f.size?Math.max(2,Math.round(f.size/5/210)):0;
  return {name:f.name,path:f.path,type:f.type,url:f.html_url,size:f.size||0,mins,diff:m?m[1].toLowerCase():'',os:m?m[2].toLowerCase():'',machine,slug:slugify(machine)};
}
function rowHTML(e){
  const n=RANK[e.diff]||0;
  const lvl=`<span class="lvl"><i>${[1,2,3,4].map(k=>`<s${k<=n?' class="on"':''}></s>`).join('')}</i>${esc(e.diff||'HTB')}</span>`;
  const os=`<span class="os">${e.os?(OS_ICON[e.os]||'')+esc(e.os):''}</span>`;
  return `<a class="wr" href="#note/${esc(e.slug)}" data-slug="${esc(e.slug)}"><span class="nm">${esc(e.machine)}</span><span class="meta">${lvl}${os}<span class="rt">${e.mins?e.mins+' min read':'Full writeup'}</span></span>${GO}</a>`;
}
function render(){
  const list=entries.filter(e=>filter.t==='all'||(filter.t==='diff'&&e.diff===filter.v)||(filter.t==='os'&&e.os===filter.v));
  wuList.innerHTML=list.length?list.map(rowHTML).join(''):'<p class="wu-msg">No writeups match this filter. Choose All to see every machine.</p>';
}
function buildFilters(){
  const diffs=[...new Set(entries.map(e=>e.diff).filter(Boolean))].sort((a,b)=>RANK[a]-RANK[b]);
  const oses=[...new Set(entries.map(e=>e.os).filter(Boolean))];
  const chip=(t,v,label,n)=>`<button class="filt${filter.t===t&&filter.v===v?' on':''}" data-t="${t}" data-v="${esc(v)}" type="button" aria-pressed="${filter.t===t&&filter.v===v}">${esc(label)}<small>${n}</small></button>`;
  let h=chip('all','','All',entries.length);
  diffs.forEach(d=>{ h+=chip('diff',d,d,entries.filter(e=>e.diff===d).length); });
  if(oses.length>1) oses.forEach(o=>{ h+=chip('os',o,o,entries.filter(e=>e.os===o).length); });
  filtersEl.innerHTML=h;
}
filtersEl.addEventListener('click',e=>{ const b=e.target.closest('.filt'); if(!b) return; filter={t:b.dataset.t,v:b.dataset.v}; buildFilters(); render(); });
async function loadList(){
  try{
    let items=cacheGet(CACHE_TTL);
    if(!items){
      try{
        const res=await fetch(API(LIST_PATH),{headers:{'Accept':'application/vnd.github+json'}});
        if(!res.ok) throw new Error('HTTP '+res.status);
        items=await res.json(); if(!Array.isArray(items)) throw new Error('unexpected response');
        cacheSet(items);
      }catch(err){ items=cacheGet(Infinity); if(!items) throw err; }
    }
    entries=items.filter(f=>f.type==='dir'||/\.md$/i.test(f.name))
      .filter(f=>!EXCLUDE.includes(f.name.replace(/\.md$/i,'').replace(/[-_\s]+/g,'').toLowerCase()))
      .map(parseEntry).sort((a,b)=>(RANK[a.diff]||9)-(RANK[b.diff]||9)||a.machine.localeCompare(b.machine));
    if(!entries.length){ wuList.innerHTML='<p class="wu-msg">No writeups published yet.</p>'; wuCount.textContent='0 machines'; return; }
    buildFilters(); render();
    wuCount.textContent=entries.length+' machines, live from GitHub';
    const st=$('#statWu'); st.dataset.count=entries.length; if($('#stats').classList.contains('in')) runCount(st);
    openFromHash();
  }catch(err){
    wuList.innerHTML='<p class="wu-msg">The GitHub API didn\'t respond'+(String(err).includes('403')?' (rate limit reached)':'')+'. Read the writeups directly at <a class="link" href="https://github.com/'+GH_USER+'/'+REPO+'/tree/'+BRANCH+'/'+LIST_PATH+'" target="_blank" rel="noopener">github.com/'+GH_USER+'/writeups</a>.</p>';
    wuCount.textContent='Offline';
  }
}
wuList.addEventListener('click',e=>{ const c=e.target.closest('.wr'); if(!c) return; if(e.metaKey||e.ctrlKey||e.shiftKey||e.button!==0) return; e.preventDefault(); const en=entries.find(x=>x.slug===c.dataset.slug); if(en) pushNote(en); });

/* ── reader ── */
const reader=$('#reader'), rTitle=$('#rTitle'), rBody=$('#rBody'), rGh=$('#rGh'), rDiff=$('#rDiff'), rToc=$('#rToc'), rBar=$('.r-bar');
let libsP=null, lastFocus=null, pushed=0, current=null;
function loadLibs(){ if(libsP) return libsP;
  libsP=Promise.all(LIBS.map(src=>new Promise((res,rej)=>{ const s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=()=>rej(new Error('could not load '+src.split('/').slice(-1)[0])); document.head.appendChild(s); })));
  libsP.catch(()=>{ libsP=null; }); return libsP; }
function setInertBg(on){ ['#top','#nav','#mmenu'].forEach(sel=>{ const el=$(sel); if(!el) return; if(on){el.setAttribute('inert','');el.setAttribute('aria-hidden','true');}else{el.removeAttribute('inert');el.removeAttribute('aria-hidden');} }); }
function showReader(){ lastFocus=document.activeElement; reader.classList.add('open'); reader.setAttribute('aria-hidden','false'); document.body.classList.add('lock'); setInertBg(true); reader.scrollTop=0; $('#rClose').focus({preventScroll:true}); }
function hideReader(){ if(!reader.classList.contains('open')) return; reader.classList.remove('open'); reader.setAttribute('aria-hidden','true'); document.body.classList.remove('lock'); setInertBg(false); current=null; if(lastFocus&&lastFocus.focus) lastFocus.focus({preventScroll:true}); }
function pushNote(en){ pushed++; history.pushState({note:en.slug},'','#note/'+en.slug); openNote(en); }
function openFromHash(){ const m=location.hash.match(/^#note\/(.+)$/); if(!m){ hideReader(); return; } const en=entries.find(x=>x.slug===decodeURIComponent(m[1])); if(en) openNote(en); else hideReader(); }
addEventListener('popstate',openFromHash);
function closeNote(){ if(pushed>0){ pushed--; history.back(); } else { history.replaceState({},'','#writeups'); hideReader(); } }
$('#rClose').addEventListener('click',closeNote);
addEventListener('keydown',e=>{
  if(e.key==='Escape'&&document.body.classList.contains('menu')){ setMenu(false); return; }
  if(!reader.classList.contains('open')) return;
  if(e.key==='Escape'){ closeNote(); return; }
  if(e.key==='Tab'){ const f=[...reader.querySelectorAll('a[href],button,[tabindex]:not([tabindex="-1"])')].filter(el=>el.offsetParent!==null); if(!f.length) return;
    const first=f[0], last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){ e.preventDefault(); last.focus(); } else if(!e.shiftKey&&document.activeElement===last){ e.preventDefault(); first.focus(); } }
});
$('#rLink').addEventListener('click',()=>copy(location.origin+location.pathname+'#note/'+(current?current.slug:''),'Link'));
reader.addEventListener('scroll',()=>{ rBar.style.setProperty('--rp',(reader.scrollTop/Math.max(1,reader.scrollHeight-reader.clientHeight)*100).toFixed(2)+'%'); },{passive:true});
async function resolveMd(en){
  if(en.type==='file') return en.path;
  const res=await fetch(API(en.path)); if(!res.ok) throw new Error('HTTP '+res.status);
  const items=await res.json(); if(!Array.isArray(items)) throw new Error('unexpected response');
  const mds=items.filter(f=>f.type==='file'&&/\.md$/i.test(f.name));
  const pick=mds.find(f=>f.name.toLowerCase()===en.name.toLowerCase()+'.md')||mds.find(f=>f.name.toLowerCase()==='readme.md')||mds[0];
  if(!pick) throw new Error('no markdown file found'); return pick.path;
}
function buildToc(){
  const hs=[...rBody.querySelectorAll('h2,h3')]; if(hs.length<3){ rToc.innerHTML=''; return; }
  let h='<div class="h">Contents</div>';
  hs.forEach((el,i)=>{ const id='h-'+i+'-'+slugify(el.textContent).slice(0,40); el.id=id; h+=`<a href="#${id}" class="${el.tagName==='H3'?'lv3':''}">${esc(el.textContent)}</a>`; });
  rToc.innerHTML=h; const links=[...rToc.querySelectorAll('a')];
  const tio=new IntersectionObserver(es=>{ es.forEach(e=>{ if(e.isIntersecting) links.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id)); }); },{root:reader,rootMargin:'-12% 0px -78% 0px'});
  hs.forEach(el=>tio.observe(el));
  rToc.onclick=e=>{ const a=e.target.closest('a'); if(!a) return; e.preventDefault(); const t=rBody.querySelector(a.getAttribute('href')); if(!t) return;
    reader.scrollTo({top:t.getBoundingClientRect().top-reader.getBoundingClientRect().top+reader.scrollTop-76,behavior:RM?'auto':'smooth'}); };
}
function decorateCode(){ rBody.querySelectorAll('pre').forEach(pre=>{ const b=document.createElement('button'); b.className='cpbtn'; b.type='button'; b.textContent='Copy';
  b.addEventListener('click',()=>{ const c=pre.querySelector('code'); copy((c||pre).innerText,'Code'); b.textContent='Copied'; setTimeout(()=>b.textContent='Copy',1600); }); pre.appendChild(b); }); }
async function openNote(en){
  current=en; showReader(); rTitle.textContent=en.machine; rDiff.textContent=en.diff||'HTB';
  rGh.href=en.url||'#'; rToc.innerHTML=''; rBody.innerHTML='<p class="r-load">Loading writeup…</p>'; rBar.style.setProperty('--rp','0%');
  try{
    await loadLibs(); const mdPath=await resolveMd(en); const baseDir=mdPath.split('/').slice(0,-1).join('/');
    const res=await fetch(RAW+encodeURI(mdPath)); if(!res.ok) throw new Error('HTTP '+res.status);
    const md=await res.text(); if(current!==en) return;
    rBody.innerHTML=DOMPurify.sanitize(marked.parse(md,{gfm:true,breaks:false}),{ADD_ATTR:['target','rel']});
    rBody.querySelectorAll('img').forEach(img=>{ const s=img.getAttribute('src')||''; if(s&&!/^(https?:|data:)/i.test(s)) img.src=RAW+encodeURI((baseDir?baseDir+'/':'')+s.replace(/^\.?\//,'')); img.loading='lazy'; img.decoding='async'; });
    rBody.querySelectorAll('a[href^="http"]').forEach(a=>{ a.target='_blank'; a.rel='noopener noreferrer'; });
    if(window.hljs) rBody.querySelectorAll('pre code').forEach(b=>{ try{hljs.highlightElement(b);}catch(_){} });
    decorateCode(); buildToc(); reader.scrollTop=0;
  }catch(err){ rBody.innerHTML='<p class="r-load">This writeup didn\'t load ('+esc(err.message||'unknown error')+'). <a class="link" href="'+esc(en.url||'#')+'" target="_blank" rel="noopener">Open it on GitHub</a> instead.</p>'; }
}
loadList();

/* ── for whoever opens devtools ── */
const A='color:#fafafa;font-family:monospace;font-size:12px', D='color:#8c8c8c;font-family:monospace;font-size:12px';
console.log('%c\n  ctxzero\n  recon to root.\n',A);
console.log('%c  you opened devtools. obviously.\n  try: ctx0.whoami()  ctx0.cve()  ctx0.flag()',D);
window.ctx0={
  whoami(){ console.log('%c  ctxzero, Luis Schlegel. penetration tester and security researcher, Europe.\n  web, network, active directory. CPTS, CWES, eJPT, CTI101, CLLMSE.\n  open to opportunities: ctxzero.pentest@gmail.com',A); return '​'; },
  cve(){ console.log('%c  CVE-2026-106933  Blaze Demo Importer <= 1.0.16\n  author+ stored XSS via SVG upload, CVSS 6.8\n  https://wpscan.com/vulnerability/4f85834c-30e4-451f-9616-70dc8eaf9c41/',A); return '​'; },
  flag(){ console.log('%c  CTX0{y0u_n33d_th3_r1ght_l1ght}',A); console.log('%c  the hero field hides a flag. go find it with the torch.',D); return '​'; },
  hire(){ location.hash='#contact'; return 'see you in the inbox.'; }
};
})();
