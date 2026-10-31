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
#godSharedDismiss{background:#f0c17a;color:#10213a;font-weight:800;border-color:#ffe2ae}
#godSharedDismiss:hover,#godSharedDismiss:focus-visible{background:#ffda9e;outline:2px solid #ffe2ae;outline-offset:2px}
.god-link-actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.god-link-actions a{background:#f0c17a;color:#11213c;font-weight:700}
.god-link-overlay p{margin:0;font-size:clamp(10px,1vw,14px);color:#cbd9eb;line-height:1.5}
.god-link-preview{flex:1;min-height:100px;border:1px solid #496989;border-radius:8px;overflow:hidden;background:#182e47}
.god-link-preview iframe{display:block;width:100%;height:100%;border:0;background:white}
.god-link-preview video{display:block;width:100%;height:100%;object-fit:contain;background:#000}
.god-link-preview iframe[hidden],.god-link-preview video[hidden]{display:none!important}
.god-link-presenter{border:1px solid #506e86;padding:10px;border-radius:9px;background:#13283e;margin:10px 0}
.god-link-presenter p{color:#dbeaff;font-size:12px;margin:0 0 6px}
@media(max-width:600px){.god-link-overlay{padding:6px;gap:5px}.god-link-bar button,.god-link-actions a{padding:5px 7px;font-size:11px}}
 `;
 document.head.appendChild(style);
 stage.insertAdjacentHTML("beforeend",`
 <div id="godSharedLink" class="god-link-overlay" hidden role="region" aria-label="강사가 공유한 외부 자료">
  <div class="god-link-bar"><strong id="godSharedTitle">강사 공유 자료</strong><button id="godSharedDismiss" type="button">↩ 원래 슬라이드로 돌아가기</button></div>
  <p id="godSharedHelp">강사가 공유 중인 자료입니다.</p>
  <div class="god-link-preview"><iframe id="godSharedFrame" title="강사가 공유한 웹페이지" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe><video id="godSharedVideo" controls playsinline preload="metadata" hidden></video></div>
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
   if(["youtube.com","www.youtube.com","m.youtube.com","youtu.be","www.youtu.be","www.youtube-nocookie.com"].includes(u.hostname)){
    const id=u.hostname.includes("youtu.be")?u.pathname.split("/")[1]:(u.searchParams.get("v")||(u.pathname.startsWith("/shorts/")?u.pathname.split("/")[2]:null));
    if(id&&/^[A-Za-z0-9_-]{11}$/.test(id))return "https://www.youtube-nocookie.com/embed/"+id+"?rel=0&playsinline=1";
   }
   if(["vimeo.com","www.vimeo.com","player.vimeo.com"].includes(u.hostname)){
    const id=u.pathname.split("/").filter(Boolean).find(part=>/^\d+$/.test(part));
    if(id)return "https://player.vimeo.com/video/"+id;
   }
   if(["mega.nz","www.mega.nz"].includes(u.hostname)){
    // MEGA videos are client-side encrypted. Stream through MEGA's
    // decryption-enabled embedded player, not a direct MP4 URL.
    const path=u.pathname.match(/^\/(file|embed)\/([a-zA-Z0-9_-]{6,})\/?$/);
    if(path&&/^#[a-zA-Z0-9_-]{10,}$/.test(u.hash))
     return "https://mega.nz/embed/"+path[2]+u.hash;
    const old=u.hash.match(/^#!([a-zA-Z0-9_-]{6,})!([a-zA-Z0-9_-]{10,})$/);
    if(u.pathname==="/"&&old)return "https://mega.nz/embed/"+old[1]+"#"+old[2];
   }
  }catch(e){}
  return url;
 }
 function hide(){
  el("godSharedLink").hidden=true;
  el("godSharedFrame").removeAttribute("src");
  const player=el("godSharedVideo");
  player.pause();player.removeAttribute("src");player.load();
  player.hidden=true;el("godSharedFrame").hidden=false;
 }
 function render(){
  const {teacher,slide}=getState(),match=known(value);
  panel.hidden=!(teacher&&match&&match.slide===slide);
  if(teacher&&match)el("godSharingStatus").textContent="공유 중: "+match.rec.label;
  if(!match||match.slide!==slide||(!teacher&&dismissed===match.id)){hide();return}
  el("godSharedTitle").textContent=(teacher?"강사 자료 보기 · ":"강사가 공유한 자료 · ")+match.rec.label;
  el("godSharedOpen").href=match.rec.url;
  el("godSharedDismiss").textContent=teacher?"↩ 슬라이드로 돌아가기 · 참석자도 함께 복귀":"↩ 슬라이드로 돌아가기";
  el("godSharedHelp").textContent=teacher?
   "강사와 참석자가 같은 링크 자료를 보고 있습니다. 설명을 마치면 위의 돌아가기 버튼을 누르세요. 웹사이트 보안 정책으로 표시되지 않으면 아래에서 새 탭으로 열 수 있습니다.":
   "강사가 공유한 웹자료입니다. 웹사이트 보안상 보이지 않으면 아래의 새 탭 버튼을 이용하세요.";
  const frame=el("godSharedFrame"),player=el("godSharedVideo"),src=target(match.rec.url);
  const direct=/\.(mp4|m4v|webm)$/i.test(new URL(match.rec.url).pathname);
  if(direct){
   frame.hidden=true;
   if(frame.hasAttribute("src"))frame.removeAttribute("src");
   player.hidden=false;
   if(player.getAttribute("src")!==match.rec.url)player.src=match.rec.url;
  }else{
   if(player.hasAttribute("src")){player.pause();player.removeAttribute("src");player.load()}
   player.hidden=true;frame.hidden=false;
   if(frame.getAttribute("src")!==src)frame.src=src;
  }
  el("godSharedLink").hidden=false;
 }
 async function stopSharing(){
  const {teacher,allowed,F,db,room}=getState();
  if(!teacher||!allowed||!F||!db){notify("강사 Google 로그인을 확인해 주세요.");return}
  try{
   await F.remove(F.ref(db,"rooms/"+room+"/sharedLink"));
   // Firebase onValue closes the shared panel for lecturer and all attendees.
  }catch(e){notify("공유 종료 실패: Firebase 연결 또는 권한을 확인하세요.")}
 }
 function close(){
  if(getState().teacher){stopSharing();return}
  dismissed=known(value)?.id||null;
  hide();
 }
 el("godSharedDismiss").onclick=close;
 el("godSharingStop").onclick=stopSharing;
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
  return true;
 }
 return {ready,broadcast,onSlide:render,close,isOpen:()=>!el("godSharedLink").hidden};
}
