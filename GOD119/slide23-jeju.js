// GOD119 slide 23: one-time MEGA link setup, then click the original right
// "행사 기획안 초안" card to preview the Jeju retreat schedule in the classroom.
// URL is shared through Firebase only; no file bytes are copied to the site.
export function createSlide23Jeju({getState,resources,getSlide,onChange,notify}){
 const teacher=getState().teacher;
 const label="제주 수련회 일정표 · MEGA 파일";
 // This rectangle matches the actual rightmost card in slide-23.webp (1920x1080).
 const rect=[66.0,22.9,25.5,69.0];
 let linkedUrl="",attached=false,overlay=null,entry=null,message=null;
 const byId=id=>document.getElementById(id);

 function normalizeMega(raw){
  if(typeof raw!=="string"||raw.length>1300)return null;
  if(!raw.trim())return "";
  try{
   const u=new URL(raw.trim());
   if(u.protocol!=="https:"||!["mega.nz","www.mega.nz"].includes(u.hostname.toLowerCase())||u.username||u.password)return null;
   const path=u.pathname.match(/^\/(file|embed)\/([A-Za-z0-9_-]{6,})\/?$/);
   if(path&&/^#[A-Za-z0-9_-]{10,}$/.test(u.hash))
    return "https://mega.nz/file/"+path[2]+u.hash;
   if(u.pathname==="/"&&/^#![A-Za-z0-9_-]{6,}![A-Za-z0-9_-]{10,}$/.test(u.hash))
    return u.href;
  }catch(e){}
  return null;
 }

 function updateResource(){
  if(linkedUrl){
   resources[23]=[{label,url:linkedUrl,rect,type:"document"}];
  }else{
   delete resources[23];
  }
  onChange();
 }
 if(teacher){
  const style=document.createElement("style");
  style.textContent=`
  #godJeju23Setup{position:absolute;inset:0;z-index:13;display:flex;align-items:center;justify-content:center;padding:clamp(7px,2vw,24px);background:#08182bf2;box-sizing:border-box}
  #godJeju23Setup[hidden]{display:none!important}
  #godJeju23Setup .god-jeju-dialog{width:min(96%,700px);max-height:94%;overflow-y:auto;background:#162e49;border:2px solid #e6b777;border-radius:17px;padding:clamp(13px,2vw,24px);box-shadow:0 15px 55px #0009;color:#f4f8ff;box-sizing:border-box}
  #godJeju23Setup h3{margin:0 0 13px;font-size:clamp(17px,2.3vw,27px);color:#f5d59f}
  #godJeju23Setup p{margin:10px 0;color:#dbe8f3;font-size:clamp(12px,1.3vw,16px);line-height:1.55}
  #godJeju23Setup input{display:block;background:#081a2d;border:1px solid #7394ac;border-radius:10px;padding:12px;width:100%;color:white;font:inherit;box-sizing:border-box}
  #godJeju23Setup .god-jeju-buttons{display:flex;gap:9px;flex-wrap:wrap;margin-top:14px}
  #godJeju23Setup button{border:1px solid #9bafc2;border-radius:10px;padding:11px 14px;font-weight:750;cursor:pointer;background:#274861;color:white}
  #godJeju23Setup button.primary{background:#f0be72;border-color:#f0be72;color:#18283f}
  #god-jeju23-hotspot{position:absolute;pointer-events:auto;cursor:pointer;border-radius:14px;border:2px solid transparent;background:transparent}
  #god-jeju23-hotspot:hover,#god-jeju23-hotspot:focus-visible{border-color:#f4ca81;background:#ffd58719;outline:2px solid #f4ca81;outline-offset:1px}
  `;
  document.head.appendChild(style);
  overlay=document.createElement("div");overlay.id="godJeju23Setup";overlay.hidden=true;
  overlay.innerHTML=`
   <div class="god-jeju-dialog" role="dialog" aria-modal="true" aria-labelledby="godJeju23Title">
    <h3 id="godJeju23Title">제주 수련회 일정표 · MEGA 연결</h3>
    <p>MEGA의 <b>제주 수련회 일정표 파일</b>에서 「링크 복사」를 누르고 아래에 붙여넣으세요. 한 번 저장하면 23번의 오른쪽 카드를 클릭하여 바로 열 수 있습니다.</p>
    <input id="godJeju23URL" type="url" autocomplete="off" aria-label="제주 수련회 일정표 MEGA 공유 링크" placeholder="https://mega.nz/file/파일ID#공유키">
    <p id="godJeju23Message" role="status">MEGA 파일의 공유 링크를 입력해 주세요. 폴더 링크는 사용할 수 없습니다.</p>
    <div class="god-jeju-buttons">
     <button type="button" id="godJeju23Save" class="primary">링크 저장하기</button>
     <button type="button" id="godJeju23Cancel">취소 · 슬라이드로 돌아가기</button>
    </div>
   </div>`;
  byId("stage").appendChild(overlay);
  entry=byId("godJeju23URL");message=byId("godJeju23Message");
  function close(){overlay.hidden=true}
  function configure(){
   if(getSlide()!==23)return false;
   entry.value=linkedUrl;
   message.textContent="제주 수련회 일정표 파일의 MEGA 공유 링크를 입력해 주세요.";
   overlay.hidden=false;entry.focus();
   return true;
  }
  byId("godJeju23Cancel").onclick=close;
  byId("godJeju23Save").onclick=async()=>{
   const url=normalizeMega(entry.value);
   if(!url){message.textContent="MEGA 개별 파일 공유 링크를 올바르게 입력해 주세요.";return}
   const {F,db,allowed,auth,room}=getState();
   if(!F||!db||!allowed||!auth?.currentUser){
    message.textContent="강사 Google 로그인과 Firebase 실시간 연결을 확인해 주세요.";return
   }
   const button=byId("godJeju23Save");
   button.disabled=true;message.textContent="제주 일정표 링크 저장 중…";
   try{
    await F.set(F.ref(db,"rooms/"+room+"/slide23JejuUrl"),url);
    linkedUrl=url;updateResource();close();
    notify("제주 일정표 링크가 등록되었습니다. 오른쪽 카드를 클릭하면 강의실에서 열립니다.");
   }catch(error){
    message.textContent="MEGA 링크를 저장하지 못했습니다. Firebase 연결과 권한을 확인해 주세요.";
   }finally{button.disabled=false}
  };
  function ready(){
   if(attached)return;
   const {F,db,room}=getState();if(!F||!db)return;
   attached=true;
   F.onValue(F.ref(db,"rooms/"+room+"/slide23JejuUrl"),snapshot=>{
    linkedUrl=normalizeMega(snapshot.val())||"";
    updateResource();
   },()=>notify("제주 일정표 연결을 읽지 못했습니다. Firebase 연결을 확인하세요."));
  }
  function onSlide(){if(getSlide()!==23&&!overlay.hidden)close()}
  return {ready,configure,onSlide,isOpen:()=>!overlay.hidden,close};
 }
 function ready(){
  if(attached)return;
  const {F,db,room}=getState();if(!F||!db)return;
  attached=true;
  F.onValue(F.ref(db,"rooms/"+room+"/slide23JejuUrl"),snapshot=>{
   linkedUrl=normalizeMega(snapshot.val())||"";
   updateResource();
  });
 }
 return {ready,onSlide(){},isOpen:()=>false};
}
