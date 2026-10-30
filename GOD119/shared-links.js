// External slide hyperlinks become synchronized attendee presentations.
// Only links present in the lecture's slideResources are accepted.
export function createSharedLinks({getState,resources,notify}){
 const stage=document.getElementById("stage");
 const picker=document.getElementById("slideSelect");
 const style=document.createElement("style");
 style.textContent=`
.god-link-overlay{position:absolute;inset:0;z-index:8;background:#09192bf8;color:#f2f7ff;display:flex;flex-direction:column;gap:9px;padding:clamp(8px,1.2vw,15px);box-sizing:border-box}
.god-link-overlay[hidden],.god-link-presenter[hidden]{display:none!important}
.god-link-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.god-link-bar strong{flex:1;font-size:clamp(13px,2vw,22px)}
.god-link-bar button,.god-link-actions a,.god-link-presenter button{background:#274765;border:1px solid #7291b2;border-radius:8px;padding:8px 12px;color:white;text-decoration:none;font-size:clamp(11px,1vw,14px);cursor:pointer}
.god-link-actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.god-link-actions a{background:#f0c17a;color:#11213c;font-weight:700}
.god-link-overlay p{margin:0;font-size:clamp(10px,1vw,14px);color:#cbd9eb;line-height:1.5}
.god-link-preview{flex:1;min-height:100px;border:1px solid #496989;border-radius:8px;overflow:hidden;background:#182e47}
.god-link-preview iframe{display:block;width:100%;height:100%;border:0;background:white}
.god-link-presenter{border:1px solid #506e86;padding:10px;border-radius:9px;background:#13283e;margin:10px 0}
.god-link-presenter p{color:#dbeaff;font-size:12px;margin:0 0 6px}
@media(max-width:600px){.god-link-overlay{padding:6px;gap:5px}.god-link-bar button,.god-link-actions a{padding:5px 7px;font-size:11px}}
 `;
 document.head.appendChild(style);
 stage.insertAdjacentHTML("beforeend",`
 <div id="godSharedLink" class="god-link-overlay" hidden role="region" aria-label="강사가 공유한 외부 자료">
  <div class="god-link-bar"><strong id="godSharedTitle">강사 공유 자료</strong><button id="godSharedDismiss" type="button">✕ 슬라이드로 돌아가기</button></div>
  <p id="godSharedHelp">강사가 공유 중인 자료입니다.</p>
  <div class="god-link-preview"><iframe id="godSharedFrame" title="강사가 공유한 웹페이지" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>
  <div class="god-link-actions"><a id="godSharedOpen" href="#" target="_blank" rel="noopener noreferrer">↗ 새 탭에서 자료 열기</a><p>사이트가 보이지 않으면 새 탭으로 여세요. 영상은 각 기기에서 재생을 누릅니다.</p></div>
 </div>`);
 const panel=document.createElement("div");
 panel.className="god-link-presenter";panel.hidden=true;
 panel.innerHTML='<p id="godSharingStatus">참석자에게 자료 공유 중</p><button type="button" id="godSharingStop">참석자 공유 화면 닫기</button>';
 picker.insertAdjacentElement("afterend",panel);
 const el=id=>document.getElementById(id);
 let value=null,dismissed=null,initialized=false;
 function known(data){
  if(!data||!Number.isInteger(data.slide)||!Number.isFinite(data.at)||typeof data.url!=="string")return null;
  const rec=(resources[data.slide]||[]).find(x=>!x.local&&x.url===data.url);
  return rec?{rec,slide:data.slide,id:data.slide+"-"+data.at+"-"+data.url}:null;
 }
 function target(url){
  try{const u=new URL(url);
   if(["youtube.com","www.youtube.com","m.youtube.com","youtu.be","www.youtu.be"].includes(u.hostname)){
    const id=u.hostname.includes("youtu.be")?u.pathname.split("/")[1]:(u.searchParams.get("v")||(u.pathname.startsWith("/shorts/")?u.pathname.split("/")[2]:null));
    if(id&&/^[A-Za-z0-9_-]{11}$/.test(id))return "https://www.youtube-nocookie.com/embed/"+id+"?rel=0&playsinline=1";
   }
  }catch(e){}
  return url;
 }
 function hide(){
  el("godSharedLink").hidden=true;
  el("godSharedFrame").removeAttribute("src");
 }
 function render(){
  const {teacher,slide}=getState(),match=known(value);
  if(teacher){
   panel.hidden=!(match&&match.slide===slide);
   if(match)el("godSharingStatus").textContent="공유 중: "+match.rec.label;
   hide();return;
  }
  panel.hidden=true;
  if(!match||match.slide!==slide||dismissed===match.id){hide();return}
  el("godSharedTitle").textContent="강사가 공유한 자료 · "+match.rec.label;
  el("godSharedOpen").href=match.rec.url;
  el("godSharedHelp").textContent="강사가 연 자료가 참석자 화면에도 표시됩니다. 웹사이트 보안상 안 보이면 아래 링크를 사용하세요.";
  const frame=el("godSharedFrame"),src=target(match.rec.url);
  if(frame.getAttribute("src")!==src)frame.src=src;
  el("godSharedLink").hidden=false;
 }
 el("godSharedDismiss").onclick=()=>{dismissed=known(value)?.id||null;hide()};
 el("godSharingStop").onclick=async()=>{
  const {teacher,allowed,F,db,room}=getState();
  if(!teacher||!allowed||!F||!db)return;
  try{await F.remove(F.ref(db,"rooms/"+room+"/sharedLink"))}
  catch(e){notify("공유 종료 실패: Firebase 연결을 확인하세요.")}
 };
 function ready(){
  if(initialized)return;
  const {F,db,room}=getState();if(!F||!db)return;
  initialized=true;
  F.onValue(F.ref(db,"rooms/"+room+"/sharedLink"),snap=>{
   const next=snap.val()||null;
   if(known(next)?.id!==known(value)?.id)dismissed=null;
   value=next;render();
  },()=>{value=null;render()});
 }
 function broadcast(rec,page){
  const {teacher,allowed,F,db,room}=getState();
  if(!teacher||!allowed||!F||!db||rec.local)return;
  if(!(resources[page]||[]).some(x=>!x.local&&x.url===rec.url))return;
  F.set(F.ref(db,"rooms/"+room+"/sharedLink"),{slide:page,url:rec.url,at:Date.now()})
   .catch(()=>notify("링크 공유에 실패했습니다. Firebase 연결을 확인하세요."));
 }
 return {ready,broadcast,onSlide:render};
}
