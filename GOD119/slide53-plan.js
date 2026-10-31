// GOD119 slide 53: lecturer connects the final ministry-plan DOCX MEGA share
// link once; thereafter the document icon opens a synced in-classroom viewer.
// The different historical slide-12 ministry plan URL is NOT reused.
export function createSlide53Plan({getState,resources,getSlide,onChange,openShared,notify}){
 const teacher=getState().teacher;
 const $=id=>document.getElementById(id);
 const title="목회계획서 실습 결과물 · MEGA DOCX";
 const iconRect=[42.8,36.8,13.8,27.7];
 let currentUrl="",connected=false,dialog=null,input=null,status=null;
 const keyPath="slide53PlanUrl";
 function safeMega(value){
  if(typeof value!=="string"||value.length>1500)return null;
  const v=value.trim();
  if(!v)return "";
  try{
   const u=new URL(v);
   if(u.protocol!=="https:"||!["mega.nz","www.mega.nz"].includes(u.hostname.toLowerCase())||u.username||u.password)return null;
   const m=u.pathname.match(/^\/(file|embed)\/([\w-]{6,})\/?$/);
   if(m&&/^#[\w-]{10,}$/.test(u.hash))return "https://mega.nz/file/"+m[2]+u.hash;
   if(u.pathname==="/"&&/^#![\w-]{6,}![\w-]{10,}$/.test(u.hash))return u.href;
  }catch(_){}
  return null;
 }
 function reflect(){
  resources[53]=currentUrl?
   [{label:title,url:currentUrl,rect:iconRect,type:"document"}]:
   [{label:"목회계획서 샘플제작 결과물.docx",local:true}];
  onChange();
 }
 if(!teacher){
  function ready(){
   if(connected)return;
   const {F,db,room}=getState();if(!F||!db)return;
   connected=true;
   F.onValue(F.ref(db,"rooms/"+room+"/"+keyPath),snapshot=>{
    currentUrl=safeMega(snapshot.val())||"";
    reflect();
   },()=>{});
  }
  return {ready,onSlide(){},isOpen:()=>false};
 }
 const css=document.createElement("style");
 css.textContent=`
 #godSlide53Setup{position:absolute;inset:0;z-index:14;background:#08172af4;
 display:flex;align-items:center;justify-content:center;padding:clamp(9px,2vw,24px);box-sizing:border-box}
 #godSlide53Setup[hidden]{display:none!important}
 #godSlide53Setup .god-setup-card{width:min(95%,730px);max-height:94%;overflow:auto;
 background:#142e49;border:2px solid #eab774;border-radius:16px;
 box-shadow:0 18px 55px #0009;padding:clamp(15px,2.1vw,28px);color:#f4f9ff}
 #godSlide53Setup h3{margin:0 0 12px;color:#ffdaa0;font-size:clamp(17px,2.5vw,26px)}
 #godSlide53Setup p{margin:10px 0;color:#d0e1ef;font-size:clamp(12px,1.4vw,16px);line-height:1.55}
 #godSlide53Setup input{background:#071d32;border:1px solid #7796b2;border-radius:10px;
 color:white;font:inherit;padding:12px;box-sizing:border-box;width:100%}
 #godSlide53Setup .actions{display:flex;gap:9px;margin-top:14px;flex-wrap:wrap}
 #godSlide53Setup button{cursor:pointer;border:1px solid #89a5be;color:white;background:#27455c;
 border-radius:9px;padding:10px 16px;font-weight:800}
 #godSlide53Setup button.primary{background:#f0bb6a;border-color:#f8d7a0;color:#162b44}
 #godSlide53Setup button:disabled{opacity:.5}
 `;
 document.head.appendChild(css);
 dialog=document.createElement("div");dialog.id="godSlide53Setup";dialog.hidden=true;
 dialog.innerHTML=`
  <div class="god-setup-card" role="dialog" aria-modal="true" aria-labelledby="godSlide53Title">
   <h3 id="godSlide53Title">53번 · 목회계획서 결과물 MEGA 연결</h3>
   <p>MEGA에서 <b>실습 결과물 목회계획서 DOCX</b> 파일의 <b>공유 링크</b>를 복사해 붙여넣으세요. 12번의 다른 목회계획서 링크와는 별도로 연결합니다.</p>
   <input id="godSlide53URL" type="url" autocomplete="off"
     placeholder="https://mega.nz/file/파일ID#복호화키"
     aria-label="53번 목회계획서 결과물 MEGA 공유 링크">
   <p role="status" id="godSlide53Status">이 주소는 강의실 참석자에게도 공유됩니다. 공개해도 되는 파일만 등록하세요.</p>
   <div class="actions">
    <button class="primary" type="button" id="godSlide53Save">연결 저장하고 문서 열기</button>
    <button type="button" id="godSlide53Cancel">취소 · 53번으로 돌아가기</button>
   </div>
  </div>`;
 $("stage").appendChild(dialog);input=$("godSlide53URL");status=$("godSlide53Status");
 function close(){dialog.hidden=true}
 function configure(){
  if(getSlide()!==53)return false;
  input.value=currentUrl;
  status.textContent=currentUrl?"이미 연결된 DOCX 공유 주소입니다. 변경할 경우에만 수정해 주세요.":
    "MEGA 목회계획서 실습 결과물 파일의 공유 링크를 입력해 주세요.";
  dialog.hidden=false;input.focus();return true;
 }
 $("godSlide53Cancel").onclick=close;
 $("godSlide53Save").onclick=async()=>{
  const value=safeMega(input.value);
  if(!value){status.textContent="MEGA의 개별 문서 파일 공유 링크를 입력해 주세요. 폴더 링크는 사용할 수 없습니다.";return}
  const {F,db,auth,room,allowed}=getState();
  if(!F||!db||!auth?.currentUser||!allowed){
   status.textContent="강사 Google 로그인 및 Firebase 연결을 확인해 주세요.";return;
  }
  const button=$("godSlide53Save");button.disabled=true;
  status.textContent="DOCX 파일 링크 저장 중…";
  try{
   await F.set(F.ref(db,"rooms/"+room+"/"+keyPath),value);
   currentUrl=value;reflect();close();
   const rec=resources[53][0];
   // The same MEGA document opens in the teacher's and attendees' in-slide viewer.
   if(!openShared(rec,53))notify("연결은 저장되었습니다. DOCX 그림을 다시 클릭해 주세요.");
  }catch(e){
   status.textContent="연결 저장 실패: 강사 권한 또는 Firebase 연결을 확인해 주세요.";
  }finally{button.disabled=false}
 };
 function ready(){
  if(connected)return;
  const {F,db,room}=getState();if(!F||!db)return;
  connected=true;
  F.onValue(F.ref(db,"rooms/"+room+"/"+keyPath),snapshot=>{
   currentUrl=safeMega(snapshot.val())||"";
   reflect();
  },()=>notify("53번 DOCX 링크를 읽지 못했습니다. Firebase 연결을 확인해 주세요."));
 }
 function onSlide(){if(getSlide()!==53&&!dialog.hidden)close()}
 return {ready,onSlide,configure,close,isOpen:()=>!dialog.hidden};
}
