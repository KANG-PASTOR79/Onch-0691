// Presenter-only list and review controls, embedded in existing attendance alert card.
export function createInstructorQuickPanel({getState}){
 const parent=document.getElementById("god-attendance-alerts");
 if(!parent)return {sync(){}};
 const style=document.createElement("style");
 style.textContent=[
 '#gq{margin-top:13px;padding-top:12px;border-top:1px solid #56798a}',
 '#gq .tabs{display:flex;gap:6px}',
 '#gq .tab{flex:1;background:#15384a;border:1px solid #7597a9;color:#fff;padding:9px 4px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer}',
 '#gq .tab[aria-expanded=true]{background:#f0c57f;color:#11283a}',
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
 '#gq .result-view{flex-shrink:0;background:#244b65;color:#fff;border:1px solid #86a6bd;border-radius:7px;padding:7px;font-size:11px;font-weight:800;cursor:pointer}',
 '#gq .submission-buttons{flex-shrink:0;display:flex;flex-wrap:wrap;justify-content:flex-end;gap:5px}',
 '#gq .help{font-size:11px;color:#cddfeb;line-height:1.5;margin-top:8px}',
 '#gq .new-report{background:#fde0a0;color:#13283b;font-size:12px;font-weight:850;border-radius:8px;padding:9px;margin:9px 0}',
 '#gq .feedback-action{background:#255c57;color:#f4fff8;border:1px solid #7ed0b1;border-radius:7px;padding:7px;font-size:11px;font-weight:800;cursor:pointer}',
 '#gqFeedbackBox{position:fixed;inset:0;background:#061525e8;z-index:2147480500;display:grid;place-items:center;padding:12px}',
 '#gqFeedbackBox .dialog{width:min(650px,96vw);background:#15334a;color:#f4f8fb;border:2px solid #efc67c;border-radius:15px;padding:20px;display:grid;gap:11px;box-shadow:0 12px 60px #0009}',
 '#gqFeedbackBox textarea{width:100%;min-height:110px;resize:vertical;border-radius:8px;background:#081e30;border:1px solid #9cb1c4;color:#fff;font:14px system-ui;padding:10px}',
 '#gqFeedbackBox select{width:100%;background:#081e30;color:white;border:1px solid #9cb1c4;padding:10px;border-radius:8px}',
 '#gqFeedbackBox .buttons{display:flex;gap:9px;flex-wrap:wrap}',
 '#gqFeedbackBox button{background:#365c77;color:white;border:1px solid #97adbf;padding:10px;border-radius:8px;font-weight:800;cursor:pointer}',
 '#gqFeedbackBox button.send{background:#efc77b;color:#16283a}',
 '#gqFeedbackBox .note{font-size:12px;color:#d6e7ed;line-height:1.5}',
 '#gq [hidden]{display:none!important}'
 ].join('\n');
 document.head.appendChild(style);
 const pane=document.createElement("div");pane.id="gq";
 pane.innerHTML=[
 '<div class="tabs" role="group" aria-label="강사 전용 명단 열람">',
 '<button type="button" id="gqTabRoster" class="tab" aria-expanded="false" aria-controls="gqPanelRoster">👥 전체 참석자 열람 ▾</button>',
 '<button type="button" id="gqTabSubmit" class="tab" aria-expanded="false" aria-controls="gqPanelSubmit">📥 결과물 제출 현황 <span id="gqPending">0</span> ▾</button>',
 '</div><div id="gqNewReport" class="new-report" role="status" hidden>📥 새로운 실습 결과물이 제출되었습니다. 제출 탭에서 확인하세요.</div><div id="gqStats" class="stats" role="status">명단 연결 중…</div>',
 '<div id="gqPanelRoster" role="region" aria-label="전체 참석자 명단" hidden><input id="gqFindRoster" type="search" placeholder="이름·소속 검색" aria-label="참석자 검색"><div id="gqRoster" class="list"></div></div>',
 '<div id="gqPanelSubmit" role="region" aria-label="제출 결과물 명단" hidden><input id="gqFindSubmit" type="search" placeholder="제출자·파일명 검색" aria-label="제출 검색"><div id="gqSubmit" class="list"></div><p class="help">실제 MEGA 파일을 확인한 후 ‘수신 확인’을 눌러주세요. 제출 신고만으로는 수신이 증명되지 않습니다.</p></div>'
 ].join('');
 parent.appendChild(pane);
 const feedbackModal=document.createElement('div');feedbackModal.id='gqFeedbackBox';feedbackModal.hidden=true;
 feedbackModal.innerHTML='<div class="dialog" role="dialog" aria-modal="true" aria-label="제출자 개별 피드백"><strong id="gqFbTitle">제출자 피드백</strong><div class="note" id="gqFbFilename"></div><label>결과 선택<select id="gqFbKind"><option value="received">✓ 제출 확인 완료</option><option value="revise">✎ 보완 요청</option><option value="praise">★ 잘하셨습니다</option></select></label><label>개인 피드백 메시지<textarea id="gqFbMessage" maxlength="400" placeholder="예: 영상 구성이 좋습니다. 자막을 조금 더 크게 조정해 주세요."></textarea></label><div class="note">실제 제출 파일을 확인한 뒤 보내 주세요. 이 메시지는 해당 제출자의 로그인 계정에만 전달됩니다. 다른 참석자는 볼 수 없습니다.</div><div class="buttons"><button id="gqFbSend" class="send" type="button">피드백 전송</button><button id="gqFbCancel" type="button">취소</button></div><div class="note" role="status" id="gqFbStatus"></div></div>';
 document.body.appendChild(feedbackModal);
 const fb=id=>feedbackModal.querySelector('#'+id);
 let feedbackTarget=null;
 function closeFeedback(){feedbackModal.hidden=true;feedbackTarget=null}
 fb('gqFbCancel').onclick=closeFeedback;
 function composeFeedback(id,report,feedback){
   feedbackTarget={id,report};
   fb('gqFbTitle').textContent=String(report.name||'참석자').slice(0,35)+'님께 피드백 보내기';
   fb('gqFbFilename').textContent='교회: '+String(report.church||'').slice(0,45)+' · 신고된 파일: '+String(report.fileName||'').slice(0,140);
   fb('gqFbKind').value=['received','revise','praise'].includes(feedback?.kind)?feedback.kind:'received';
   fb('gqFbMessage').value=String(feedback?.message||'').slice(0,400);
   fb('gqFbStatus').textContent='이름·교회와 실제 파일을 대조한 후 전송해 주세요.';
   feedbackModal.hidden=false;
 }
 fb('gqFbSend').onclick=async()=>{
   const target=feedbackTarget,{db,F,auth,room}=getState();
   if(!target||!db||!F||!auth?.currentUser)return;
   const message=fb('gqFbMessage').value.trim(),kind=fb('gqFbKind').value;
   if(!message||message.length>400){fb('gqFbStatus').textContent='피드백 메시지를 1~400자로 작성해 주세요.';return}
   if(!window.confirm(target.report.name+' / '+target.report.church+'\n실제 제출 파일과 제출자 이름을 확인하고 이 사람에게 피드백을 보내시겠습니까?'))return;
   const sendButton=fb('gqFbSend');sendButton.disabled=true;
   try{
     const path='submissions/'+room+'/'+target.id+'/feedback';
     await F.set(F.ref(db,path),{kind,message,at:F.serverTimestamp(),fileName:String(target.report.fileName||'').slice(0,140)});
     fb('gqFbStatus').textContent='피드백을 전송했습니다. 해당 참석자가 GOD119에 접속하면 개인 알림으로 표시됩니다.';
     closeFeedback();
   }catch(e){fb('gqFbStatus').textContent='전송이 거부되었습니다. Firebase 데이터베이스의 feedback 보안 규칙을 확인해 주세요.'}
   finally{sendButton.disabled=false}
 };
 const $=id=>pane.querySelector('#'+id);
 let uid=null,unsub=[],roster={},submitted={},rReady=false,sReady=false,known=null,writing=new Set();
 let viewerPromise=null;
 function showResult(id,report){
  if(!viewerPromise)viewerPromise=import("./submission-result-preview.js?v=local-folder-autoview-20261106")
   .then(mod=>mod.createResultPreview())
   .catch(error=>{viewerPromise=null;throw error});
  viewerPromise.then(v=>v.open(id,report))
   .catch(()=>{$('gqStats').textContent='결과물 열람창을 불러오지 못했습니다. 새로고침해 주세요.'});
 }
 const t=(v,n=120)=>String(v??'').trim().slice(0,n);
 const rosters=()=>Object.entries(roster).filter(([,o])=>o&&o.profile&&typeof o.profile.name==='string')
  .map(([id,o])=>({id,p:o.profile,r:submitted[id]?.report,v:submitted[id]?.review})).sort((a,b)=>Number(a.p.registeredAt||0)-Number(b.p.registeredAt||0));
 const reports=()=>Object.entries(submitted).filter(([,o])=>o&&o.report&&typeof o.report==='object')
  .map(([id,o])=>({id,r:o.report,v:o.review||{},feedback:o.feedback||null})).sort((a,b)=>Number(b.r.at||0)-Number(a.r.at||0));
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
   const actions=document.createElement('div');actions.className='submission-buttons';
   const view=document.createElement('button');view.type='button';view.className='result-view';
   view.textContent='📄 결과물 보기';view.title='파일을 선택하거나 개별 MEGA 파일 링크를 연결하여 미리 봅니다.';
   view.onclick=()=>showResult(v.id,v.r);
   const button=document.createElement('button');button.type='button';button.className='review';
   const checked=v.v.checked===true;button.textContent=checked?'✓ 확인완료':'수신 확인';
   button.disabled=writing.has(v.id);
   button.onclick=()=>mark(v.id,v.r,checked,button);
   const sendFeedback=document.createElement('button');sendFeedback.type='button';sendFeedback.className='feedback-action';
   sendFeedback.textContent=v.feedback?'💬 피드백 수정':'💬 피드백 보내기';
   sendFeedback.onclick=()=>composeFeedback(v.id,v.r,v.feedback);
   actions.append(view,button,sendFeedback);item.appendChild(actions);submitList.appendChild(item);
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
 let opened=null;
 function select(which){
  // Accordion: both lists remain hidden until the presenter explicitly opens one.
  opened=opened===which?null:which;
  const showRoster=opened==='roster',showSubmit=opened==='submit';
  $('gqPanelRoster').hidden=!showRoster;
  $('gqPanelSubmit').hidden=!showSubmit;
  $('gqTabRoster').setAttribute('aria-expanded',String(showRoster));
  $('gqTabSubmit').setAttribute('aria-expanded',String(showSubmit));
  $('gqTabRoster').textContent=showRoster?'👥 전체 참석자 닫기 ▴':'👥 전체 참석자 열람 ▾';
  // Keep the live count in the button while changing the disclosure label.
  const button=$('gqTabSubmit');
  button.replaceChildren(document.createTextNode(showSubmit?'📥 결과물 닫기 ':'📥 결과물 제출 현황 '));
  const badge=document.createElement('span');badge.id='gqPending';badge.textContent=String(reports().length-reports().filter(v=>v.v.checked===true).length);
  button.appendChild(badge);
  button.appendChild(document.createTextNode(showSubmit?' ▴':' ▾'));
  if(showSubmit)$('gqNewReport').hidden=true;
 }
 $('gqTabRoster').onclick=()=>select('roster');
 $('gqTabSubmit').onclick=()=>select('submit');
 $('gqFindRoster').oninput=render;
 $('gqFindSubmit').oninput=render;
 function stop(){
  for(const f of unsub){try{f()}catch(e){}}
  unsub=[];uid=null;roster={};submitted={};rReady=false;sReady=false;known=null;writing.clear();$('gqNewReport').hidden=true;render();
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
    $('gqNewReport').hidden=false;
   }
   known=ids;render();
  },()=>{$('gqStats').textContent='제출 현황 권한 확인 필요';}));
 }
 render();
 return {sync};
}
