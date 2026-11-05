// Presenter-only list and review controls, embedded in existing attendance alert card.
export function createInstructorQuickPanel({getState}){
 const parent=document.getElementById("god-attendance-alerts");
 if(!parent)return {sync(){}};
 const style=document.createElement("style");
 style.textContent=[
 '#gq{margin-top:13px;padding-top:12px;border-top:1px solid #56798a}',
 '#gq .tabs{display:flex;gap:6px}',
 '#gq .tab{flex:1;background:#15384a;border:1px solid #7597a9;color:#fff;padding:9px 4px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer}',
 '#gq .tab[aria-selected=true]{background:#f0c57f;color:#11283a}',
 '#gq .stats{font-size:12px;color:#d6e7f2;padding:10px 1px;line-height:1.6}',
 '#gq input[type=search]{display:block;width:100%;box-sizing:border-box;background:#0c2b3d;color:#fff;border:1px solid #7195a9;border-radius:8px;padding:9px;margin-bottom:8px;font-size:12px}',
 '#gq .list{max-height:300px;overflow-y:auto;overscroll-behavior:contain;display:grid;gap:6px;padding-right:2px}',
 '#gq .item{display:flex;gap:7px;justify-content:space-between;align-items:center;border:1px solid #55798e;border-radius:8px;background:#0c293c;padding:9px}',
 '#gq .person{min-width:0;flex:1;overflow-wrap:anywhere}',
 '#gq .person b{display:block;font-size:12px;color:#fff}',
 '#gq .person small{display:block;font-size:11px;color:#cbdeeb;line-height:1.5;margin-top:2px}',
 '#gq .state{flex-shrink:0;color:#f7d398;font-size:11px}',
 '#gq .state.done{color:#b7f5d4}',
 '#gq .review{flex-shrink:0;background:#f0c57f;color:#09273d;border:1px solid #ffe0ac;border-radius:7px;padding:7px;font-size:11px;font-weight:800;cursor:pointer}',
 '#gq .review:disabled{opacity:.55}',
 '#gq .help{font-size:11px;color:#cddfeb;line-height:1.5;margin-top:8px}',
 '#gq [hidden]{display:none!important}'
 ].join('\n');
 document.head.appendChild(style);
 const pane=document.createElement("div");pane.id="gq";
 pane.innerHTML=[
 '<div class="tabs" role="tablist">',
 '<button type="button" id="gqTabRoster" class="tab" role="tab" aria-selected="true">👥 전체 참석자</button>',
 '<button type="button" id="gqTabSubmit" class="tab" role="tab" aria-selected="false">📥 결과물 제출 <span id="gqPending">0</span></button>',
 '</div><div id="gqStats" class="stats" role="status">명단 연결 중…</div>',
 '<div id="gqPanelRoster" role="tabpanel"><input id="gqFindRoster" type="search" placeholder="이름·소속 검색" aria-label="참석자 검색"><div id="gqRoster" class="list"></div></div>',
 '<div id="gqPanelSubmit" role="tabpanel" hidden><input id="gqFindSubmit" type="search" placeholder="제출자·파일명 검색" aria-label="제출 검색"><div id="gqSubmit" class="list"></div><p class="help">실제 MEGA 파일을 확인한 후 ‘수신 확인’을 눌러주세요. 제출 신고만으로는 수신이 증명되지 않습니다.</p></div>'
 ].join('');
 parent.appendChild(pane);
 const $=id=>pane.querySelector('#'+id);
 let uid=null,unsub=[],roster={},submitted={},rReady=false,sReady=false,known=null,writing=new Set();
 const t=(v,n=120)=>String(v??'').trim().slice(0,n);
 const rosters=()=>Object.entries(roster).filter(([,o])=>o&&o.profile&&typeof o.profile.name==='string')
  .map(([id,o])=>({id,p:o.profile,r:submitted[id]?.report,v:submitted[id]?.review})).sort((a,b)=>Number(a.p.registeredAt||0)-Number(b.p.registeredAt||0));
 const reports=()=>Object.entries(submitted).filter(([,o])=>o&&o.report&&typeof o.report==='object')
  .map(([id,o])=>({id,r:o.report,v:o.review||{}})).sort((a,b)=>Number(b.r.at||0)-Number(a.r.at||0));
 function row(name,church,detail){
  const el=document.createElement('div');el.className='item';
  const p=document.createElement('div');p.className='person';
  const b=document.createElement('b');b.textContent=t(name,35)||'이름 없음';
  const small=document.createElement('small');small.textContent=(t(church,45)||'소속 없음')+(detail?' · '+t(detail,100):'');
  p.append(b,small);el.appendChild(p);return el;
 }
 function empty(node,message){const e=document.createElement('p');e.className='help';e.textContent=message;node.appendChild(e)}
 function render(){
  const rr=rosters(),ss=reports(),checked=ss.filter(v=>v.v.checked===true).length;
  $('gqPending').textContent=String(ss.length-checked);
  $('gqStats').textContent='등록 '+rr.length+'명 · 제출 신고 '+ss.length+'건 · 확인 '+checked+'건 · 미확인 '+(ss.length-checked)+'건';
  const rosterList=$('gqRoster'),submitList=$('gqSubmit');
  rosterList.replaceChildren();submitList.replaceChildren();
  const q=$('gqFindRoster').value.trim().toLowerCase();
  const matching=rr.filter(v=>!q||[v.p.name,v.p.church].some(x=>String(x||'').toLowerCase().includes(q)));
  if(!matching.length)empty(rosterList,rReady?'아직 등록자가 없거나 검색 결과가 없습니다.':'참석자 명단을 불러오는 중…');
  for(const v of matching){
   const item=row(v.p.name,v.p.church);
   const state=document.createElement('span');state.className='state'+(v.v?.checked===true?' done':'');
   state.textContent=v.v?.checked===true?'✓ 확인':v.r?'제출 신고':'미제출';
   item.appendChild(state);rosterList.appendChild(item);
  }
  const search=$('gqFindSubmit').value.trim().toLowerCase();
  const selection=ss.filter(v=>!search||[v.r.name,v.r.church,v.r.fileName].some(x=>String(x||'').toLowerCase().includes(search)));
  if(!selection.length)empty(submitList,sReady?'아직 제출 신고가 없거나 검색 결과가 없습니다.':'제출 현황을 불러오는 중…');
  for(const v of selection){
   const item=row(v.r.name,v.r.church,v.r.fileName);
   const button=document.createElement('button');button.type='button';button.className='review';
   const checked=v.v.checked===true;button.textContent=checked?'✓ 확인완료':'수신 확인';
   button.disabled=writing.has(v.id);
   button.onclick=()=>mark(v.id,v.r,checked,button);
   item.appendChild(button);submitList.appendChild(item);
  }
 }
 async function mark(id,report,checked,button){
  if(writing.has(id))return;
  if(!checked&&!window.confirm(t(report.name,35)+' / '+t(report.church,45)+'\nMEGA에서 해당 파일을 실제 확인하셨습니까?'))return;
  const {db,F,auth,room}=getState();
  if(!db||!F||!auth?.currentUser)return;
  writing.add(id);button.disabled=true;
  try{
   await F.set(F.ref(db,'submissions/'+room+'/'+id+'/review'),{checked:!checked,at:F.serverTimestamp()});
  }catch(e){
   $('gqStats').textContent='확인 저장 실패 · 강사 Firebase 권한을 확인하세요.';
  }finally{writing.delete(id);button.disabled=false}
 }
 function select(which){
  const a=which==='roster';
  $('gqPanelRoster').hidden=!a;$('gqPanelSubmit').hidden=a;
  $('gqTabRoster').setAttribute('aria-selected',String(a));
  $('gqTabSubmit').setAttribute('aria-selected',String(!a));
 }
 $('gqTabRoster').onclick=()=>select('roster');
 $('gqTabSubmit').onclick=()=>select('submit');
 $('gqFindRoster').oninput=render;
 $('gqFindSubmit').oninput=render;
 function stop(){
  for(const f of unsub){try{f()}catch(e){}}
  unsub=[];uid=null;roster={};submitted={};rReady=false;sReady=false;known=null;writing.clear();render();
 }
 function sync(){
  const {teacher,db,F,auth,room}=getState();
  if(!teacher)return;
  const current=auth?.currentUser?.uid;
  if(!db||!F||!current){if(uid)stop();return}
  if(uid===current&&unsub.length)return;
  stop();uid=current;$('gqStats').textContent='강사 전용 명단 연결 중…';
  unsub.push(F.onValue(F.ref(db,'attendance/'+room),snap=>{roster=snap.val()||{};rReady=true;render()},()=>{$('gqStats').textContent='참석자 명단 권한 확인 필요';}));
  unsub.push(F.onValue(F.ref(db,'submissions/'+room),snap=>{
   submitted=snap.val()||{};sReady=true;
   const ids=new Set(reports().map(v=>v.id));
   if(known&&[...ids].some(id=>!known.has(id))){
    $('gqStats').textContent='📥 새로운 실습 제출 신고가 도착했습니다.';
   }
   known=ids;render();
  },()=>{$('gqStats').textContent='제출 현황 권한 확인 필요';}));
 }
 render();
 return {sync};
}
