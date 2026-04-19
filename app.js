/* ethers CDN fallback — if local ethers.min.js failed to load, fetch from CDN (replaces inline onerror on the script tag) */
if(typeof ethers==='undefined'){
  const _eth=document.createElement('script');
  _eth.src='https://cdnjs.cloudflare.com/ajax/libs/ethers/6.15.0/ethers.umd.min.js';
  document.head.appendChild(_eth);
}

const CFG={
  50312:{umi:'0x91Ee1c6C191dc6440B8058d99d2Fa94B8691adff',hub:'0x9FFeEd29C8f3A568e7042e43c35b447C096461AE',exp:'https://shannon-explorer.somnia.network'},
  5031:{umi:'0xfa9c15D8B508968fCDbdB9F495C8A493C19d7351',hub:'0x0000000000000000000000000000000000000000',exp:'https://explorer.somnia.network'}
};

const AU=['function setProfile(string,string,string,string)','function getProfile(address) view returns (tuple(string nickname,string avatarUrl,string bio,string socialUrl,uint256 createdAt,uint256 updatedAt,bool exists))','function hasProfile(address) view returns (bool)','function getNickname(address) view returns (string)'];

const AH=['function sayGM(string) payable','function play(bool,uint256) payable','function claimReward(uint256)','function claimOwnerFee(uint256)','function claimOwnerFeeBatch(uint256[])','function resolveRound(uint256)','function finalizeRankings(uint256)','function expireUnclaimed(uint256)','function registerReferrer(address)','function currentDay() view returns (uint256)','function currentWeek() view returns (uint256)','function roundTimeLeft() view returns (uint256)','function totalGMs() view returns (uint256)','function owner() view returns (address)','function getRoundInfo(uint256) view returns (uint256,uint256,uint256,bool,bool,uint256,bool)','function getPlayerView(address) view returns (tuple(uint256 xp,uint256 level,uint256 gmStreak,uint256 battleStreak,uint256 battleWins,uint256 battleGames,bool gmToday,bool playedToday,bool todaySide,uint128 todayWeight,uint128 todayBP,uint16 todayRank,uint256 weekXPVal,uint256 weekBattleVal,uint256 monthGlory,uint256 top150Streak,uint256 referralCount,address referredBy))','function getPendingReward(address,uint256) view returns (uint256,bool,uint16,bool)','function getXPLeaderboard(uint256) view returns (address[],uint256[])','function getGloryLeaderboard(uint256) view returns (address[],uint256[])','function getRecentGMs() view returns (tuple(address sender,uint256 timestamp,string message)[],uint256)','function getPoolInfo() view returns (uint256,uint256,uint256)'];

let pv,sg,um,hb,ad,ch,ti,localLeft=0,isOwnerAccount=false;
const $=id=>document.getElementById(id);

/* A11y: wrap decorative leading glyphs on headings so SRs don't read them */
(function stripGlyphHeadings(){
  const re=/^(\s*[^\w\s(]+)(\s+)(.+)/;
  document.querySelectorAll('.ch').forEach(el=>{
    if(el.dataset.a11yDone||el.children.length>0)return;
    const t=el.textContent,m=t.match(re);
    if(m){el.textContent='';const s=document.createElement('span');s.setAttribute('aria-hidden','true');s.textContent=m[1];el.appendChild(s);el.appendChild(document.createTextNode(m[2]+m[3]));el.dataset.a11yDone='1';}
  });
  /* Emoji-led buttons: strip to hidden span so label remains readable */
  document.querySelectorAll('button').forEach(b=>{
    if(b.dataset.a11yDone||b.children.length>0||!b.textContent)return;
    const m=b.textContent.match(re);
    if(m){b.textContent='';const s=document.createElement('span');s.setAttribute('aria-hidden','true');s.textContent=m[1];b.appendChild(s);b.appendChild(document.createTextNode(m[2]+m[3]));b.dataset.a11yDone='1';}
  });
})();

/* ===== Welcome / Onboarding Modal ===== */
const WM_KEY='wowSeen_v2';
const WM_STEPS=[
  {
    icon:'<svg viewBox="0 0 96 96" fill="none" aria-hidden="true"><circle cx="48" cy="48" r="18" stroke="currentColor" stroke-width="2.5" fill="currentColor" fill-opacity=".15"/><circle cx="48" cy="48" r="11" fill="currentColor" fill-opacity=".4"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="48" y1="6" x2="48" y2="18"/><line x1="48" y1="78" x2="48" y2="90"/><line x1="6" y1="48" x2="18" y2="48"/><line x1="78" y1="48" x2="90" y2="48"/><line x1="18" y1="18" x2="26" y2="26"/><line x1="70" y1="70" x2="78" y2="78"/><line x1="78" y1="18" x2="70" y2="26"/><line x1="26" y1="70" x2="18" y2="78"/></g></svg>',
    title:'The Morning Ritual',
    lore:'"Every sunrise, warriors whisper to the arena."',
    body:'Your first act each day is the Ritual — whisper \'GM\' and offer 1 STT to the Treasury. The ritual forges your streak, unlocks battle, and writes your name into today\'s chronicle.'
  },
  {
    icon:'<svg viewBox="0 0 96 96" fill="none" aria-hidden="true"><g stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"><path d="M72 16 L76 20 L44 52 L40 48 Z" fill="currentColor" fill-opacity=".2"/><line x1="38" y1="54" x2="32" y2="60"/><line x1="26" y1="66" x2="20" y2="72"/><path d="M20 72 L14 78" stroke-width="3"/></g><g stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"><path d="M48 40 L28 46 V56 C28 68 36 76 48 82 C60 76 68 68 68 56 V46 Z" fill="currentColor" fill-opacity=".18"/><path d="M38 58 L46 64 L58 52" stroke-width="2.5" stroke-linecap="round"/></g></svg>',
    title:'Choose Your Side',
    lore:'"Some strike for glory. Some stand for the realm."',
    body:'Every day brings a battle. Pledge to Attack or Protect, and boost with 1 extra STT for more Battle Power. The winning side shares the Treasury — ranked by strength, streak, and fate.'
  },
  {
    icon:'<svg viewBox="0 0 96 96" fill="none" aria-hidden="true"><g stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"><path d="M20 38 L30 22 L40 34 L48 16 L56 34 L66 22 L76 38 L76 54 L20 54 Z" fill="currentColor" fill-opacity=".2"/><line x1="30" y1="22" x2="30" y2="18" stroke-linecap="round"/><line x1="48" y1="16" x2="48" y2="10" stroke-linecap="round"/><line x1="66" y1="22" x2="66" y2="18" stroke-linecap="round"/><circle cx="30" cy="16" r="2" fill="currentColor"/><circle cx="48" cy="8" r="2.5" fill="currentColor"/><circle cx="66" cy="16" r="2" fill="currentColor"/><rect x="20" y="54" width="56" height="8"/><rect x="28" y="62" width="40" height="20" fill="currentColor" fill-opacity=".1"/><circle cx="48" cy="72" r="4" stroke-width="2" fill="currentColor" fill-opacity=".4"/></g></svg>',
    title:'Claim Your Spoils',
    lore:'"The treasury opens for those who prove themselves."',
    body:'Top-150 warriors by Battle Power share 90% of the daily Treasury. Claim within 24 hours, or it rolls into tomorrow\'s pool. Reach the top and your name ascends the Chronicles.'
  }
];
let _wmStep=0;
function wmOpen(force){
  if(!force && localStorage.getItem(WM_KEY))return;
  _wmStep=0;wmRender();
  const b=$('wmBackdrop');b.hidden=false;
  document.body.style.overflow='hidden';
  setTimeout(()=>$('wmNext').focus(),60);
  document.addEventListener('keydown',wmKey);
  b.addEventListener('click',wmBackdropClick);
}
function wmClose(){
  const b=$('wmBackdrop');b.hidden=true;
  document.body.style.overflow='';
  localStorage.setItem(WM_KEY,'1');
  document.removeEventListener('keydown',wmKey);
  b.removeEventListener('click',wmBackdropClick);
  showNextHint();
}
function wmBackdropClick(e){if(e.target===$('wmBackdrop'))wmClose();}
function wmStep(dir){
  const next=_wmStep+dir;
  if(next>=WM_STEPS.length){wmClose();return;}
  if(next<0)return;
  _wmStep=next;wmRender();
}
function wmRender(){
  const s=WM_STEPS[_wmStep];
  const hero=$('wmHero');
  hero.innerHTML='<div class="wm-icon">'+s.icon+'</div>'
    +'<h2 class="wm-step-title" id="wmStepTitle">'+s.title+'</h2>'
    +'<p class="wm-step-lore" id="wmStepLore">'+s.lore+'</p>'
    +'<p class="wm-step-body">'+s.body+'</p>';
  document.querySelectorAll('.wm-dot').forEach((d,i)=>d.classList.toggle('a',i===_wmStep));
  $('wmPrev').style.visibility=_wmStep===0?'hidden':'visible';
  const nx=$('wmNext');
  if(_wmStep===WM_STEPS.length-1){nx.textContent='Begin Your Saga';nx.classList.add('final');}
  else{nx.textContent='Next';nx.classList.remove('final');}
}
function wmKey(e){
  if(e.key==='Escape'){e.preventDefault();wmClose();return;}
  if(e.key==='ArrowLeft'&&_wmStep>0){e.preventDefault();wmStep(-1);return;}
  if(e.key==='ArrowRight'){e.preventDefault();wmStep(1);return;}
  if(e.key==='Tab'){
    /* Focus trap */
    const f=[...$('wmModal').querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(x=>!x.disabled&&x.offsetParent!==null);
    if(!f.length)return;
    const first=f[0],last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
}
function showNextHint(){
  const tab=document.querySelector('.tab[data-t="gm"]');
  if(!tab||tab.dataset.hintShown)return;
  tab.dataset.hintShown='1';
  tab.setAttribute('data-hint','Next: Perform the Morning Ritual');
  tab.classList.add('tab-pulse');
  setTimeout(()=>{tab.classList.remove('tab-pulse');tab.removeAttribute('data-hint');},12000);
}

function activateTab(tab,{focus=false}={}){
  if(!tab||tab.getAttribute('aria-selected')==='true')return;
  document.querySelectorAll('.tab').forEach(x=>{
    x.classList.remove('a');x.setAttribute('aria-selected','false');x.setAttribute('tabindex','-1');
  });
  document.querySelectorAll('.pnl').forEach(x=>x.classList.remove('a'));
  tab.classList.add('a');tab.setAttribute('aria-selected','true');tab.setAttribute('tabindex','0');
  const panel=$('t-'+tab.dataset.t);if(panel)panel.classList.add('a');
  if(focus)tab.focus();
}
document.querySelectorAll('.tab').forEach(t=>{
  t.addEventListener('click',function(){activateTab(this);});
});
document.querySelector('[role="tablist"]').addEventListener('keydown',function(e){
  const keys=['ArrowLeft','ArrowRight','Home','End'];
  if(!keys.includes(e.key))return;
  const tabs=[...document.querySelectorAll('.tab')].filter(t=>t.offsetParent!==null);
  const cur=document.activeElement;const i=tabs.indexOf(cur);if(i<0)return;
  e.preventDefault();
  let next=i;
  if(e.key==='ArrowRight')next=(i+1)%tabs.length;
  else if(e.key==='ArrowLeft')next=(i-1+tabs.length)%tabs.length;
  else if(e.key==='Home')next=0;
  else if(e.key==='End')next=tabs.length-1;
  activateTab(tabs[next],{focus:true});
});

function uB(s){
  const v=$(s==='A'?'slA':'slD').value;
  $('bv'+s).textContent=v==='0'?'Normal':'Boosted';
  $('bc'+s).textContent=v==='0'?'Free':'1 STT';
}

function initRef(){
  try{
    const url=new URL(window.location.href);
    const ref=url.searchParams.get('ref');
    if(ref&&/^0x[a-fA-F0-9]{40}$/.test(ref)){
      localStorage.setItem('refBy',ref);
    }
  }catch(e){}
}

function setupMyRef(){
  if(!ad)return;
  const base=window.location.origin+window.location.pathname;
  const link=base+'?ref='+ad;
  if($('refLink'))$('refLink').value=link;
  if($('refLink2'))$('refLink2').value=link;
  if(hb){
    hb.getPlayerView(ad).then(v=>{
      const cnt=v.referralCount.toString();
      const gl=(Number(v.referralCount)*20).toString();
      if($('refCount'))$('refCount').textContent=cnt;
      if($('refGlory'))$('refGlory').textContent=gl;
      if($('refCount2'))$('refCount2').textContent=cnt;
      if($('refGlory2'))$('refGlory2').textContent=gl;
    }).catch(()=>{});
  }
}

function copyRef2(){
  const input=$('refLink2');
  input.select();input.setSelectionRange(0,999);
  try{
    navigator.clipboard.writeText(input.value);
    $('refSt2').textContent='✓ Copied! Share with warriors.';
    $('refSt2').style.color='var(--green)';
  }catch(e){
    $('refSt2').textContent='Link selected — press Ctrl+C';
    $('refSt2').style.color='var(--pink-light)';
  }
}

function copyRef(){
  const input=$('refLink');
  input.select();input.setSelectionRange(0,999);
  try{
    navigator.clipboard.writeText(input.value);
    $('refSt').textContent='✓ Copied! Share with warriors.';
    $('refSt').style.color='var(--green)';
  }catch(e){
    $('refSt').textContent='Link selected — press Ctrl+C';
    $('refSt').style.color='var(--pink-light)';
  }
}

async function W(){
  if(!window.ethereum){alert('Install MetaMask to enter the realm');return;}
  try{
    pv=new ethers.BrowserProvider(window.ethereum);
    await pv.send('eth_requestAccounts',[]);
    sg=await pv.getSigner();
    ad=await sg.getAddress();
    ch=Number((await pv.getNetwork()).chainId);
    const c=CFG[ch];
    if(!c){alert('Switch to Somnia (50312 or 5031)');return;}
    um=new ethers.Contract(c.umi,AU,sg);
    if(c.hub&&c.hub!=='0x0000000000000000000000000000000000000000'){
      hb=new ethers.Contract(c.hub,AH,sg);
      try{
        const ownAddr=await hb.owner();
        isOwnerAccount=ownAddr.toLowerCase()===ad.toLowerCase();
        if(isOwnerAccount)$('ownerTab').style.display='block';
      }catch(e){}
    }
    $('cB').textContent=ad.slice(0,6)+'...'+ad.slice(-4);
    $('cB').classList.add('on');
    $('hN').textContent=ch===5031?'Mainnet':'Testnet';
    $('CS').style.display='none';
    $('fBtn').disabled=false;
    buildContractsGrid();
    checkProfile();
  }catch(e){console.error(e);alert('Failed to connect wallet. Check MetaMask and network.');}
}

function buildContractsGrid(){
  const g=$('contractsGrid');let html='';
  for(const[chainId,c] of Object.entries(CFG)){
    const netName=chainId==='5031'?'Mainnet':'Testnet';
    html+='<div class="contract-card"><div class="cc-label"><span class="cc-dot live"></span>UMI Passport · '+netName+'</div><div class="cc-addr">'+c.umi+'</div><a class="cc-link" href="'+c.exp+'/address/'+c.umi+'" target="_blank" rel="noopener noreferrer">View on Explorer →</a></div>';
    if(c.hub&&c.hub!=='0x0000000000000000000000000000000000000000'){
      html+='<div class="contract-card"><div class="cc-label"><span class="cc-dot live"></span>GameHub · '+netName+'</div><div class="cc-addr">'+c.hub+'</div><a class="cc-link" href="'+c.exp+'/address/'+c.hub+'" target="_blank" rel="noopener noreferrer">View on Explorer →</a></div>';
    }else{
      html+='<div class="contract-card" style="opacity:.5"><div class="cc-label"><span class="cc-dot" style="background:var(--text-faint)"></span>GameHub · '+netName+'</div><div class="cc-addr" style="opacity:.4">Coming soon</div></div>';
    }
  }
  g.innerHTML=html;
}

async function checkProfile(){
  try{
    const p=await um.getProfile(ad);
    if(p.exists){
      $('onboard').style.display='none';
      $('AP').style.display='block';
      $('fBtn').disabled=false;
      LA();
      setTimeout(()=>wmOpen(),350);
    }else{
      $('onboard').style.display='block';
      $('AP').style.display='none';
    }
  }catch(e){
    $('onboard').style.display='block';
    $('AP').style.display='none';
  }
}

async function OB(){
  const n=$('obN').value.trim(),a=$('obA').value.trim(),b=$('obB').value.trim(),s=$('obS').value.trim();
  if(!n){$('obSt').textContent='A warrior needs a name!';$('obSt').className='fs er';return;}
  const bt=$('obBtn');bt.disabled=true;bt.textContent='Forging...';$('obSt').textContent='Awaiting signature...';$('obSt').className='fs';
  try{
    const tx=await um.setProfile(n,a,b,s);
    bt.textContent='Confirming...';
    await tx.wait();
    $('obSt').textContent='Passport forged ✓';
    try{
      const refBy=localStorage.getItem('refBy');
      if(refBy&&refBy.toLowerCase()!==ad.toLowerCase()&&hb){
        $('obSt').textContent='Binding your fate...';
        const refTx=await hb.registerReferrer(refBy);
        await refTx.wait();
        $('obSt').textContent='Fate bound to your patron ✓';
        localStorage.removeItem('refBy');
      }
    }catch(refErr){console.log('Referral skipped');}
    bt.textContent='Create Passport & Enter';bt.disabled=false;
    checkProfile();
  }catch(e){
    $('obSt').textContent=e.reason||'The forge rejected this';
    $('obSt').className='fs er';
    bt.textContent='Create Passport & Enter';bt.disabled=false;
  }
}

async function LA(){LP();if(hb){LG();LGM();LR();ST();setupMyRef();}}

async function LP(){
  try{
    const p=await um.getProfile(ad);
    if(p.exists){
      $('PC').style.display='block';$('FT').textContent='◈ Refine Your Identity';
      $('PN').textContent=p.nickname;$('PA').textContent=ad;$('PB').textContent=p.bio||'';
      $('N').value=p.nickname;$('A').value=p.avatarUrl;$('B').value=p.bio||'';$('S').value=p.socialUrl||'';
      if(p.avatarUrl){
        try{
          const u=new URL(p.avatarUrl);
          if(u.protocol==='https:'||u.protocol==='http:'){
            const av=$('AV');av.textContent='';
            const img=document.createElement('img');
            img.alt='Warrior avatar';
            img.addEventListener('error',()=>{
              av.textContent='';
              const d=document.createElement('div');
              d.className='avp';d.setAttribute('aria-hidden','true');d.textContent='◈';
              av.appendChild(d);
            });
            img.src=u.href;
            av.appendChild(img);
          }
        }catch(e){}
      }
      $('PCr').textContent=new Date(Number(p.createdAt)*1000).toLocaleDateString();
      $('PUp').textContent=new Date(Number(p.updatedAt)*1000).toLocaleDateString();
      if(p.socialUrl){
        try{
          const su=new URL(p.socialUrl);
          if(su.protocol==='https:'||su.protocol==='http:'){
            $('PL2').style.display='inline-flex';
            $('PL2').href=su.href;
            $('PLT').textContent='Visit';
          }
        }catch(e){}
      }
    }
  }catch(e){}
}

async function SV(){
  const n=$('N').value.trim(),a=$('A').value.trim(),b=$('B').value.trim(),s=$('S').value.trim();
  if(!n){$('St').textContent='Name required!';$('St').className='fs er';return;}
  const bt=$('fBtn');bt.disabled=true;bt.textContent='Refining...';$('St').textContent='Signing...';$('St').className='fs';
  try{
    const tx=await um.setProfile(n,a,b,s);
    await tx.wait();
    $('St').textContent='Identity refined ✓';bt.textContent='Save Passport';bt.disabled=false;LP();
  }catch(e){
    $('St').textContent=e.reason||'Failed';$('St').className='fs er';
    bt.textContent='Save Passport';bt.disabled=false;
  }
}

async function LG(){
  if(!hb)return;
  try{
    const day=Number(await hb.currentDay()),week=Number(await hb.currentWeek());
    const ri=await hb.getRoundInfo(day);
    const totalPlayers=Number(ri[0]),dailyPool=ri[2];
    $('fogTotal').textContent=totalPlayers+' Warrior'+(totalPlayers===1?'':'s');
    $('pDay').innerHTML=ethers.formatEther(dailyPool)+'<span class="unit">STT</span>';

    const v=await hb.getPlayerView(ad);
    $('xXP').textContent=v.xp.toString();$('xLv').textContent=v.level.toString();
    $('xGS').textContent=v.gmStreak.toString();$('xBS').textContent=v.battleStreak.toString();
    $('xW').textContent=v.battleWins.toString();$('xGl').textContent=v.monthGlory.toString();
    $('hXP').textContent=v.xp.toString();$('hLv').textContent='Lv '+v.level;$('hGl').textContent=v.monthGlory.toString();
    $('hGmS').textContent=v.gmStreak.toString()+'🔥';
    $('gXP').textContent=v.xp.toString();
    $('gLv').textContent=v.level.toString();
    $('gStrk').textContent=v.gmStreak.toString();
    $('atkLv').textContent='Lv '+v.level;$('defLv').textContent='Lv '+v.level;

    const xpInLv=Number(v.xp)%100;
    $('xpBar').style.width=xpInLv+'%';
    $('xpProg').textContent=xpInLv+'/100 XP';

    $('qGMi').textContent=v.gmToday?'✅':'⬜';
    $('qBi').textContent=v.playedToday?'✅':'⬜';
    $('qAi').textContent=(v.gmToday&&v.playedToday)?'🌟':'⬜';
    if(v.gmToday)$('qGM').style.borderColor='rgba(125,216,168,.3)';
    if(v.playedToday)$('qBattle').style.borderColor='rgba(125,216,168,.3)';
    if(v.gmToday&&v.playedToday)$('qAll').style.borderColor='rgba(255,200,160,.4)';

    const bS=$('btnS'),bP=$('btnP');
    bS.classList.remove('off');bP.classList.remove('off');bS.disabled=false;bP.disabled=false;
    $('slA').disabled=false;$('slD').disabled=false;
    if(!v.gmToday&&!v.playedToday){
      bS.disabled=true;bP.disabled=true;bS.classList.add('off');bP.classList.add('off');
      $('slA').disabled=true;$('slD').disabled=true;$('gmLock').style.display='block';
    }else{$('gmLock').style.display='none';}
    if(v.playedToday){
      bS.disabled=true;bP.disabled=true;bS.classList.add('off');bP.classList.add('off');
      $('slA').disabled=true;$('slD').disabled=true;
      const bSlbl=bS.querySelector('.bf-lbl'),bPlbl=bP.querySelector('.bf-lbl');
      if(v.todaySide){bSlbl.textContent='Your Choice — Attack';bPlbl.textContent='Stand & Protect';}
      else{bSlbl.textContent='Strike to Steal';bPlbl.textContent='Your Choice — Protect';}
      $('gSt').textContent='Your fate is sealed for today';$('gmLock').style.display='none';
    }
    if(v.gmToday){$('gBtn').disabled=true;$('gSs').textContent='Ritual complete ✓';}

    if(day>0){
      try{
        const[rew,can,rank,exp]=await hb.getPendingReward(ad,day-1);
        if(can&&Number(rew)>0){
          $('clB').style.display='flex';
          $('clB').classList.add('cb-active');
          $('clA').textContent=ethers.formatEther(rew)+' STT';
          $('clRank').textContent='Rank #'+rank.toString()+' / Top-150';
          $('pYou').textContent=ethers.formatEther(rew)+' STT';
          $('pYou').closest('.pool').classList.add('has-reward');
        }else if(exp){$('pYou').textContent='Expired';$('pYou').closest('.pool').classList.remove('has-reward');}
        else{$('pYou').textContent='—';$('pYou').closest('.pool').classList.remove('has-reward');}
      }catch(e){}
      try{
        const yi=await hb.getRoundInfo(day-1);
        if(yi[3]){
          $('YD').style.display='flex';
          const yw=yi[4];
          $('YR').textContent=(yw?'🔥 Steal':'🛡️ Protect')+' Prevailed';
          $('YR').className='yr '+(yw?'ylo':'yw');
          const ban=$('ydayBanner');ban.style.display='block';
          ban.classList.remove('yb-shown');void ban.offsetWidth;ban.classList.add('yb-shown');
          const[rew2,can2,rank2]=await hb.getPendingReward(ad,day-1).catch(()=>[0,false,0,false]);
          if(can2&&Number(rew2)>0){
            ban.style.borderColor='rgba(125,216,168,.4)';
            ban.style.background='linear-gradient(90deg,rgba(125,216,168,.08),transparent)';
            $('ydBanText').style.color='var(--green)';
            $('ydBanText').textContent='🎉 Victory! Rank #'+rank2+' — '+ethers.formatEther(rew2)+' STT awaits';
            $('ydBanSub').textContent='Claim your spoils before they return to the vault';
            $('ydBanSub').style.color='var(--green)';
          }else{
            ban.style.borderColor='rgba(255,200,220,.25)';
            ban.style.background='linear-gradient(90deg,rgba(255,200,220,.04),transparent)';
            $('ydBanText').style.color='var(--pink-light)';
            $('ydBanText').textContent=(yw?'🔥 Steal':'🛡️ Protect')+' prevailed yesterday';
            $('ydBanSub').textContent='';
          }
        }
      }catch(e){}
    }

    try{const[xa,xp]=await hb.getXPLeaderboard(week);rL('LBx',xa,xp,'XP');}catch(e){}
    try{const month=Math.floor(day/30);const[ga,gp]=await hb.getGloryLeaderboard(month);rL('LBg',ga,gp,'Glory');}catch(e){}

    if(isOwnerAccount){
      try{
        const pi=await hb.getPoolInfo();
        $('ownToday').textContent=ethers.formatEther(pi[1])+' STT';
        $('ownRoll').textContent=ethers.formatEther(pi[2])+' STT';
        const cd=Number(await hb.currentDay());
        $('ownCurDay').textContent=cd;
        $('ownYDay').textContent=cd-1;
      }catch(e){}
    }
    ['pDay','pYou','LBx','LBg'].forEach(id=>{const el=$(id);if(el){el.classList.remove('skel','skel-block');el.removeAttribute('aria-busy');}});
  }catch(e){console.error('LG:',e);['pDay','pYou','LBx','LBg'].forEach(id=>{const el=$(id);if(el){el.classList.remove('skel','skel-block');el.removeAttribute('aria-busy');}});}
}

async function LR(){
  if(!hb)return;
  try{
    const day=Number(await hb.currentDay());
    if(day===0)return;
    const yday=day-1;
    const ri=await hb.getRoundInfo(yday);
    const sc=Number(ri[0]),pc=Number(ri[1]),res=ri[3],won=ri[4],fin=ri[6];
    if(!res||sc===0){
      $('rwResult').textContent='No battle yesterday';
      $('rwNone').style.display='block';return;
    }
    $('rwResult').textContent=(won?'🔥 Steal Prevailed':'🛡️ Protect Prevailed');
    $('rwResult').style.color=won?'var(--pink-light)':'var(--purple-light)';
    $('rwDetail').textContent='Stealers: '+sc+' · Protectors: '+pc+(fin?' · Rankings finalized':' · Awaiting finalization');
    setTimeout(()=>showBattleReveal(won,sc,pc),600);

    const[rew,can,rank,exp]=await hb.getPendingReward(ad,yday);
    if(can&&Number(rew)>0){
      $('rwStatus').style.display='block';$('rwNone').style.display='none';
      $('rwRank').textContent='Rank #'+rank;
      $('rwRank').style.color=rank<=3?'var(--gold)':rank<=10?'var(--pink-light)':rank<=30?'var(--purple-light)':'var(--text)';
      const tier=rank===1?'🏆 Sovereign Champion':rank===2?'🥈 Second of the Bold':rank===3?'🥉 Bronzed Warrior':rank<=10?'⚡ Elite Guard':rank<=30?'💎 Master of Arcane':rank<=70?'🔷 Proven Duelist':'🎖 Chronicled Warrior';
      $('rwTier').textContent=tier;
      $('rwTier').style.color=rank<=3?'var(--gold)':'var(--text-dim)';
      $('rwAmount').textContent=ethers.formatEther(rew)+' STT';
      $('rwClaimBtn').disabled=false;
    }else if(exp){
      $('rwStatus').style.display='block';$('rwNone').style.display='none';
      $('rwRank').textContent='Expired';$('rwRank').style.color='var(--red)';
      $('rwTier').textContent='The claim window has closed';
      $('rwAmount').textContent='0 STT';
      $('rwClaimBtn').disabled=true;$('rwClaimBtn').textContent='Expired';
    }else{
      $('rwStatus').style.display='none';$('rwNone').style.display='block';
      $('rwNoneText').textContent='You stood with the vanquished (+2 XP) or did not enter';
    }
  }catch(e){console.error('LR:',e);}
}

function celebrateClaim(amount,sub){
  const ov=$('claimBurst');if(!ov)return;
  $('cbAmount').textContent=amount?('+'+amount+' STT'):'';
  $('cbSub').textContent=sub||'Glory is yours';
  const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pBox=$('cbParticles');pBox.innerHTML='';
  if(!reduced){
    for(let i=0;i<14;i++){
      const p=document.createElement('span');
      const ang=(Math.PI*2)*(i/14)+(Math.random()*0.5-0.25);
      const dist=110+Math.random()*70;
      p.style.setProperty('--tx',(Math.cos(ang)*dist).toFixed(1)+'px');
      p.style.setProperty('--ty',(Math.sin(ang)*dist).toFixed(1)+'px');
      p.style.animationDelay=(Math.random()*0.12).toFixed(2)+'s';
      pBox.appendChild(p);
    }
  }
  ov.hidden=false;
  setTimeout(()=>ov.classList.add('dismiss'),900);
  const close=()=>{ov.hidden=true;ov.classList.remove('dismiss');pBox.innerHTML='';ov.removeEventListener('click',close);};
  ov.addEventListener('click',close);
  setTimeout(close,reduced?1400:2400);
}

async function rwClaim(){
  const btn=$('rwClaimBtn');btn.disabled=true;btn.textContent='Claiming...';
  $('rwClaimSt').textContent='Signing transaction...';$('rwClaimSt').style.color='var(--green)';
  try{
    const day=Number(await hb.currentDay())-1;
    const amtTxt=($('rwAmount').textContent||'').replace(/[^\d.]/g,'');
    const tx=await hb.claimReward(day);
    $('rwClaimSt').textContent='Confirming...';
    await tx.wait();
    btn.textContent='✓ Claimed';
    $('rwClaimSt').textContent='Spoils claimed! Glory is yours';
    $('rwAmount').textContent='Claimed ✓';LG();LR();
    celebrateClaim(amtTxt,'Spoils secured');
  }catch(e){
    $('rwClaimSt').textContent=e.reason||'Failed';
    $('rwClaimSt').style.color='var(--red)';
    btn.disabled=false;btn.textContent='🏆 Claim Your Prize';
  }
}

async function CR(){
  try{
    const day=Number(await hb.currentDay())-1;
    const btn=$('clBtn');btn.disabled=true;btn.textContent='Claiming...';
    try{
      const ri=await hb.getRoundInfo(day);
      if(!ri[6]){btn.textContent='Finalizing...';const ftx=await hb.finalizeRankings(day);await ftx.wait();}
    }catch(e){}
    btn.textContent='Claiming...';
    const amtEl=document.querySelector('#clB .rw-amount, #clB strong');
    const amtTxt=amtEl?(amtEl.textContent||'').replace(/[^\d.]/g,''):'';
    const tx=await hb.claimReward(day);
    await tx.wait();
    btn.textContent='✓ Claimed';
    $('clB').style.display='none';LG();
    celebrateClaim(amtTxt,'Spoils secured');
  }catch(e){
    console.error('Claim:',e);
    alert('Claim failed. Try again or check your wallet.');
    $('clBtn').disabled=false;$('clBtn').textContent='Claim Reward';
  }
}

async function GM(){
  const b=$('gBtn'),m=$('gMsg').value.trim();
  b.disabled=true;GSt('Sending offering...',0);
  try{
    const tx=await hb.sayGM(m,{value:ethers.parseEther('1')});
    GSt('Confirming...',0);
    await tx.wait();
    GSt('Ritual complete! Battle unlocked ✓',0);
    $('gMsg').value='';
    await LGM();await LG();
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('a'));
    document.querySelectorAll('.pnl').forEach(x=>x.classList.remove('a'));
    document.querySelector('[data-t=game]').classList.add('a');$('t-game').classList.add('a');
  }catch(e){GSt(e.reason||'Failed',1);b.disabled=false;}
}

function GSt(t,e){$('gSs').textContent=t;$('gSs').style.color=e?'var(--red)':'var(--green)';}

function playCommitCeremony(isAtk){
  const ov=$('commitCeremony');if(!ov)return;
  const atkIco=$('ccSigilAtk'),defIco=$('ccSigilDef');
  ov.classList.remove('atk','def');
  ov.classList.add(isAtk?'atk':'def');
  atkIco.style.display=isAtk?'':'none';
  defIco.style.display=isAtk?'none':'';
  $('ccLabel').textContent=isAtk?'Strike Committed':'Stand Taken';
  ov.hidden=false;
  setTimeout(()=>{ov.hidden=true;},900);
}

async function PL(s){
  const bS=$('btnS'),bP=$('btnP');if(bS.disabled)return;
  bS.disabled=true;bP.disabled=true;
  playCommitCeremony(s);
  const boost=parseInt($(s?'slA':'slD').value);
  const cost=ethers.parseEther((boost*1).toFixed(0));
  $('gSt').textContent='Entering arena...';$('gSt').style.color='var(--green)';
  try{
    const tx=await hb.play(s,boost,{value:cost});
    await tx.wait();
    $('gSt').textContent='Your choice is sealed ✓';LG();
  }catch(e){
    $('gSt').textContent=e.reason||'Failed';$('gSt').style.color='var(--red)';
    bS.disabled=false;bP.disabled=false;
  }
}

function showBattleReveal(won,sc,pc){
  try{
    const day=new Date().toISOString().slice(0,10);
    const key='battleRevealSeen_'+day;
    if(localStorage.getItem(key))return;
    localStorage.setItem(key,'1');
  }catch(e){}
  const ov=$('battleReveal');if(!ov)return;
  ov.classList.remove('won-atk','won-def');
  ov.classList.add(won?'won-atk':'won-def');
  $('brResult').textContent=won?'Steal Prevailed':'Protect Prevailed';
  $('brSub').textContent='Stealers: '+sc+' · Protectors: '+pc;
  ov.hidden=false;
  const close=()=>{ov.hidden=true;ov.removeEventListener('click',close);document.removeEventListener('keydown',esc);};
  const esc=(e)=>{if(e.key==='Escape'||e.key==='Enter'||e.key===' ')close();};
  ov.addEventListener('click',close);
  document.addEventListener('keydown',esc);
  setTimeout(close,4200);
}

function rL(id,addrs,vals,lbl){
  const el=$(id);
  if(!addrs||!addrs.length){el.innerHTML='<div class="lbe">The arena awaits its champions</div>';return;}
  const rows=addrs.map((a,i)=>({a,v:Number(vals[i])})).sort((x,y)=>y.v-x.v).slice(0,50);
  el.innerHTML=rows.map((r,i)=>{
    const cls=i===0?'top1':i===1?'top2':i===2?'top3':'';
    const emoji=i===0?'🏆':i===1?'🥈':i===2?'🥉':'';
    return '<div class="lbr '+cls+'"><div class="lbn">'+(emoji||'#'+(i+1))+'</div><div class="lbaddr">'+r.a.slice(0,6)+'...'+r.a.slice(-4)+'</div><div class="lbval">'+r.v+' '+lbl+'</div></div>';
  }).join('');
  rows.forEach(async(r,i)=>{
    try{
      const n=await um.getNickname(r.a);
      if(n){
        const cells=el.querySelectorAll('.lbr .lbaddr');
        if(cells[i])cells[i].textContent=n;
      }
    }catch(e){}
  });
}

async function LGM(){
  try{
    const rec=await hb.getRecentGMs();
    const ent=rec[0],cnt=Number(rec[1]);
    if(!cnt){$('gFd').innerHTML='<div class="lbe">The chronicle begins with you</div>';return;}
    const sorted=[];
    for(let i=0;i<cnt;i++)if(ent[i].sender!=='0x0000000000000000000000000000000000000000')sorted.push(ent[i]);
    sorted.sort((a,b)=>Number(b.timestamp)-Number(a.timestamp));
    const fd=$('gFd');
    fd.innerHTML=sorted.map(e=>'<div class="ge"><div class="gd2"></div><div class="gc"><div class="gt"><span class="ga">'+e.sender.slice(0,6)+'...'+e.sender.slice(-4)+'</span><span class="gtm">'+TA(Number(e.timestamp))+'</span></div><div class="gms2">'+ES(e.message||'GM ☀️')+'</div></div></div>').join('');
    sorted.forEach(async(e,i)=>{
      try{
        const n=await um.getNickname(e.sender);
        if(n){
          const t=fd.querySelectorAll('.gt');
          if(t[i]){
            const s=document.createElement('span');
            s.className='gn2';s.textContent=n;t[i].prepend(s);
          }
        }
      }catch(er){}
    });
  }catch(e){console.error('GM:',e);}
}

function TA(ts){
  const d=Date.now()/1000-ts;
  if(d<60)return 'moments ago';
  if(d<3600)return Math.floor(d/60)+'m ago';
  if(d<86400)return Math.floor(d/3600)+'h ago';
  return Math.floor(d/86400)+'d ago';
}

function ST(){
  if(ti)clearInterval(ti);
  hb.roundTimeLeft().then(l=>{
    localLeft=Number(l);
    const u=()=>{
      if(localLeft<0)localLeft=0;
      const h=Math.floor(localLeft/3600),m=Math.floor((localLeft%3600)/60),s=localLeft%60;
      const tm=$('gT');
      tm.textContent=String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
      const ring=document.querySelector('.bc-timer-ring');
      if(localLeft<=300&&localLeft>0){
        $('snWarn').style.display='block';
        $('snWarn').textContent='🔒 Gates closing — '+m+':'+String(s).padStart(2,'0');
        $('snWarn').style.color='var(--red)';
        tm.style.color='var(--red)';
        if(ring){ring.classList.remove('mode-warn');ring.classList.add('mode-final');}
      }else if(localLeft<=3600){
        $('snWarn').style.display='block';
        $('snWarn').textContent='⚡ Final hour — Choose now!';
        $('snWarn').style.color='var(--gold)';
        tm.style.color='var(--gold)';
        if(ring){ring.classList.remove('mode-final');ring.classList.add('mode-warn');}
      }else{
        $('snWarn').style.display='none';
        tm.style.color='#fff';
        if(ring){ring.classList.remove('mode-warn','mode-final');}
      }
      localLeft--;
    };
    u();ti=setInterval(u,1000);
  });
}

async function OWclaimToday(){try{$('ownSt').textContent='Claiming today...';$('ownSt').style.color='var(--green)';const today=Number(await hb.currentDay());const tx=await hb.claimOwnerFee(today);await tx.wait();$('ownSt').textContent='Today claimed ✓';LG();}catch(e){$('ownSt').textContent=e.reason||'No tribute today';$('ownSt').style.color='var(--red)';}}
async function OWclaimYesterday(){try{$('ownSt').textContent='Claiming yesterday...';$('ownSt').style.color='var(--green)';const today=Number(await hb.currentDay());const tx=await hb.claimOwnerFee(today-1);await tx.wait();$('ownSt').textContent='Yesterday claimed ✓';LG();}catch(e){$('ownSt').textContent=e.reason||'Nothing to claim';$('ownSt').style.color='var(--red)';}}
async function OWfinYesterday(){try{$('ownSt').textContent='Finalizing...';$('ownSt').style.color='var(--green)';const today=Number(await hb.currentDay());const tx=await hb.finalizeRankings(today-1);await tx.wait();$('ownSt').textContent='Finalized ✓';LG();}catch(e){$('ownSt').textContent=e.reason||'Failed';$('ownSt').style.color='var(--red)';}}
async function OWbatch(){try{$('ownSt').textContent='Claiming last 7 days...';$('ownSt').style.color='var(--green)';const today=Number(await hb.currentDay());for(let i=1;i<=7;i++){try{await(await hb.claimOwnerFee(today-i)).wait();}catch(e){}}$('ownSt').textContent='Batch done ✓';LG();}catch(e){$('ownSt').textContent=e.reason||'Failed';$('ownSt').style.color='var(--red)';}}
async function OWtestResolve(){try{
  $('ownSt').textContent='Step 1/3: Resolving...';$('ownSt').style.color='var(--purple-light)';
  const today=Number(await hb.currentDay());
  try{await(await hb.resolveRound(today-1)).wait();$('ownSt').textContent='Step 1 ✓';}catch(e){$('ownSt').textContent='Step 1: Already done';}
  $('ownSt').textContent='Step 2/3: Finalizing...';
  try{await(await hb.finalizeRankings(today-1)).wait();$('ownSt').textContent='Step 2 ✓';}catch(e){$('ownSt').textContent='Step 2: Already done';}
  $('ownSt').textContent='Step 3/3: Reloading...';
  await LG();await LGM();await LR();
  $('ownSt').textContent='✓ Complete! Winners can now claim.';$('ownSt').style.color='var(--green)';
}catch(e){$('ownSt').textContent=e.reason||'Failed';$('ownSt').style.color='var(--red)';}}

function ES(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML;}

async function shareWin(){
  try{
    const day=Number(await hb.currentDay())-1;
    const v=await hb.getPlayerView(ad);
    const[rew,can,rank,exp]=await hb.getPendingReward(ad,day).catch(()=>[0,false,0,false]);
    const streak=Number(v.gmStreak);
    let text='';
    if(can&&Number(rew)>0){
      const amount=ethers.formatEther(rew);
      const tierEmoji=rank===1?'🏆':rank===2?'🥈':rank===3?'🥉':rank<=10?'⚡':rank<=30?'💎':'🎖';
      text='⚔ Victory in Steal or Protect! '+tierEmoji+' Ranked #'+rank+' and claimed '+amount+' STT on @SomniaNetwork daily battlefield! Who will dare face me tomorrow?';
    }else if(streak>=7){
      text='🔥 '+streak+'-day streak in Steal or Protect on @SomniaNetwork. The morning ritual never breaks. Daily blockchain battles, real prizes.';
    }else if(v.battleWins>0){
      text='⚔ '+v.battleWins+' battles won in Steal or Protect on @SomniaNetwork. Choose: Steal or Protect. Every sunrise, new glory.';
    }else{
      text='⚔ Entered the arena of Steal or Protect on @SomniaNetwork. Daily blockchain battles, Top-150 share the treasury. Join the Chronicles!';
    }
    const url='https://angellsomniac.github.io/Somnia-umi-passport/';
    window.open('https://x.com/intent/tweet?text='+encodeURIComponent(text)+'&url='+encodeURIComponent(url),'_blank');
  }catch(e){
    const text='⚔ Playing Steal or Protect on @SomniaNetwork daily battlefield!';
    const url='https://angellsomniac.github.io/Somnia-umi-passport/';
    window.open('https://x.com/intent/tweet?text='+encodeURIComponent(text)+'&url='+encodeURIComponent(url),'_blank');
  }
}

if(window.ethereum){
  window.ethereum.on('accountsChanged',()=>location.reload());
  window.ethereum.on('chainChanged',()=>location.reload());
}

initRef();

/* Event delegation for [data-action] buttons (replaces inline onclick) */
document.addEventListener('click',(e)=>{
  const el=e.target.closest('[data-action]');
  if(!el)return;
  const a=el.dataset.action,arg=el.dataset.arg;
  switch(a){
    case 'wm-close':wmClose();break;
    case 'wm-step':wmStep(parseInt(arg,10));break;
    case 'wallet':W();break;
    case 'onboard':OB();break;
    case 'play':PL(arg==='atk');break;
    case 'claim-reward':CR();break;
    case 'share':shareWin();break;
    case 'ritual':GM();break;
    case 'copy-ref':copyRef();break;
    case 'copy-ref2':copyRef2();break;
    case 'save-profile':SV();break;
    case 'rw-claim':rwClaim();break;
    case 'ow-today':OWclaimToday();break;
    case 'ow-yesterday':OWclaimYesterday();break;
    case 'ow-batch':OWbatch();break;
    case 'ow-finalize':OWfinYesterday();break;
    case 'ow-resolve':OWtestResolve();break;
  }
});

/* Boost sliders (replaces inline oninput) */
const _slA=$('slA');if(_slA)_slA.addEventListener('input',()=>uB('A'));
const _slD=$('slD');if(_slD)_slD.addEventListener('input',()=>uB('D'));

/* Image fallback on load error (replaces inline onerror) */
document.querySelectorAll('img[data-fallback]').forEach(img=>{
  img.addEventListener('error',()=>{
    img.style.display='none';
    const n=img.nextElementSibling;
    if(n)n.style.display='flex';
  });
});

function startNftCountdown(){
  const upd=()=>{
    const now=new Date();
    const y=now.getUTCFullYear(),m=now.getUTCMonth();
    const endOfMonth=new Date(Date.UTC(y,m+1,1,0,0,0));
    const diff=Math.max(0,Math.floor((endOfMonth-Date.now())/1000));
    const d=Math.floor(diff/86400),h=Math.floor((diff%86400)/3600),mi=Math.floor((diff%3600)/60),s=diff%60;
    if($('nftD'))$('nftD').textContent=String(d).padStart(2,'0');
    if($('nftH'))$('nftH').textContent=String(h).padStart(2,'0');
    if($('nftM'))$('nftM').textContent=String(mi).padStart(2,'0');
    if($('nftS'))$('nftS').textContent=String(s).padStart(2,'0');
  };
  upd();setInterval(upd,1000);
}
startNftCountdown();

// Try to load custom logo.png if it exists
(function(){
  const img=new Image();
  img.onload=function(){
    const brand=document.getElementById('brandLogo');
    if(brand){brand.innerHTML='<img src="logo.png" alt="Steal or Protect emblem" style="width:100%;height:100%;object-fit:cover;border-radius:50%">';}
  };
  img.onerror=function(){};
  img.src='logo.png';
})();

// Chain-reaction grid: generate cells with staggered delays for infecting-light wave
(function initGridCells(){
  const host=document.querySelector('.grid-cells');
  if(!host){console.warn('[grid-cells] host not found');return;}
  const CELL=60,PERIOD=9,STEP=0.14;
  let rT=0;
  function build(){
    const cols=Math.ceil(window.innerWidth/CELL);
    const rows=Math.ceil(window.innerHeight/CELL);
    host.style.gridTemplateColumns='repeat('+cols+','+CELL+'px)';
    host.style.gridTemplateRows='repeat('+rows+','+CELL+'px)';
    const frag=document.createDocumentFragment();
    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        const d=document.createElement('div');
        d.className='gc';
        const base=((r+c)*STEP+Math.random()*0.4)%PERIOD;
        d.style.setProperty('--d','-'+base.toFixed(2)+'s');
        const rnd=Math.random();
        let h;
        if(rnd<0.55)h=310+Math.random()*30;
        else if(rnd<0.9)h=270+Math.random()*20;
        else h=35+Math.random()*10;
        d.style.setProperty('--h',h.toFixed(0));
        frag.appendChild(d);
      }
    }
    host.textContent='';
    host.appendChild(frag);
  }
  build();
  window.addEventListener('resize',()=>{
    clearTimeout(rT);
    rT=setTimeout(build,250);
  });
})();

// Living warrior: 3D tilt follows cursor, smooth reset on leave
(function initLiveWarriors(){
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const MAX=6;
  document.querySelectorAll('.w-img-live').forEach(el=>{
    let raf=0,rect=null;
    function refresh(){rect=el.getBoundingClientRect();}
    function onMove(e){
      if(!rect)refresh();
      const x=(e.clientX-rect.left)/rect.width-0.5;
      const y=(e.clientY-rect.top)/rect.height-0.5;
      const rx=(-y*MAX).toFixed(2);
      const ry=(x*MAX).toFixed(2);
      if(raf)cancelAnimationFrame(raf);
      raf=requestAnimationFrame(()=>{
        el.style.transform='perspective(800px) rotateX('+rx+'deg) rotateY('+ry+'deg)';
      });
    }
    function onLeave(){
      if(raf)cancelAnimationFrame(raf);
      el.style.transform='perspective(800px) rotateX(0deg) rotateY(0deg)';
    }
    el.addEventListener('mouseenter',refresh);
    el.addEventListener('mousemove',onMove);
    el.addEventListener('mouseleave',onLeave);
    window.addEventListener('scroll',refresh,{passive:true});
    window.addEventListener('resize',refresh);
  });
})();
