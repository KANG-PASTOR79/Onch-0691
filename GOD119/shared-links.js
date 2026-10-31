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
.god-link-preview[hidden],.god-link-document[hidden]{display:none!important}
.god-link-document{flex:1;min-height:100px;border:1px solid #516e86;border-radius:12px;background:#10263b;display:flex;flex-direction:column;gap:6px;padding:clamp(5px,.8vw,10px);text-align:left;box-sizing:border-box;overflow:hidden}
.god-doc-status{flex-shrink:0;color:#d8e6f4;font-size:clamp(11px,1vw,14px);padding:4px 6px;line-height:1.3}
.god-doc-status[data-error="true"]{color:#ffc48b}
.god-doc-viewport{flex:1;min-height:0;overflow:auto;background:#fff;border-radius:7px;overscroll-behavior:contain;position:relative;color:#152a3d}
.god-doc-viewport>.god-doc-embedded-pdf{display:block;width:100%;height:100%;min-height:200px;border:0;background:white}
.god-doc-viewport .god-docx-pages{width:100%;min-height:100%;background:#dedede;overflow:auto}
.god-doc-viewport .god-docx-pages .docx-wrapper{background:#dcdcdc;padding:15px 5px}
.god-doc-viewport .god-doc-plaintext{margin:0;padding:15px;white-space:pre-wrap;word-break:break-word;color:#152a3d}
.god-doc-viewport .god-doc-image{display:block;max-width:100%;height:auto;margin:0 auto}
.god-doc-viewport .god-doc-fallback{padding:clamp(14px,2vw,24px);font-size:clamp(13px,1.5vw,20px);color:#17324e;line-height:1.6;white-space:normal}
.god-doc-footer{flex-shrink:0;display:flex;align-items:center;gap:9px;flex-wrap:wrap;font-size:11px;color:#d6e5f3}
.god-link-document .god-doc-title{font-size:clamp(20px,3vw,39px);font-weight:800;color:#ffe0a5}
.god-link-document .god-doc-description{font-size:clamp(12px,1.4vw,18px);color:#d6e5f3;max-width:780px;line-height:1.6}
.god-link-document a{display:inline-flex;justify-content:center;align-items:center;text-decoration:none;background:#f0bb6d;border:1px solid #ffdc9d;border-radius:11px;padding:clamp(10px,1.5vw,18px) clamp(14px,2.2vw,28px);font-size:clamp(13px,1.7vw,22px);font-weight:800;color:#12253b}
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
  <div class="god-link-preview" id="godSharedPreview"><iframe id="godSharedFrame" title="강사가 공유한 웹페이지" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe><video id="godSharedVideo" controls playsinline preload="metadata" hidden></video></div>
  <div class="god-link-document" id="godSharedDocument" hidden>
   <div class="god-doc-status" id="godSharedDocumentStatus" role="status">MEGA 목회계획서를 불러오는 중…</div>
   <div class="god-doc-viewport" id="godSharedDocumentViewport">
    <p class="god-doc-fallback">목회계획서 페이지를 여는 중입니다…</p>
   </div>
   <div class="god-doc-footer"><a id="godSharedDocumentOpen" href="#" target="_blank" rel="noopener noreferrer">↗ MEGA에서 원본 열기</a><span>PDF·Word 문서는 화면 안에서 스크롤하여 볼 수 있습니다.</span></div>
  </div>
  <div class="god-link-actions"><a id="godSharedOpen" href="#" target="_blank" rel="noopener noreferrer">↗ 새 탭에서 자료 열기</a><p>사이트가 보이지 않으면 새 탭으로 여세요. 영상은 각 기기에서 재생을 누릅니다.</p></div>
 </div>`);
 const panel=document.createElement("div");
 panel.className="god-link-presenter";panel.hidden=true;
 panel.innerHTML='<p id="godSharingStatus">참석자에게 자료 공유 중</p><button type="button" id="godSharingStop">참석자 공유 화면 닫기</button>';
 picker.insertAdjacentElement("afterend",panel);
 const el=id=>document.getElementById(id);
 let value=null,dismissed=null,initialized=false;
 let documentPreview=null,previewId=null;
 async function showDocumentPreview(rec,id){
  if(previewId===id)return;
  previewId=id;
  el("godSharedDocumentStatus").textContent="MEGA에서 실제 목회계획서 문서를 불러오는 중…";
  try{
   const mod=await import("./mega-document-viewer.js?v=slide12-inline-v1");
   if(previewId!==id)return;
   if(!documentPreview)documentPreview=mod.createMegaDocumentViewer({
    status:el("godSharedDocumentStatus"),
    viewport:el("godSharedDocumentViewport"),
    documentName:"창원온천교회 목회계획서"
   });
   documentPreview.show(rec.url,id);
  }catch(error){
   if(previewId!==id)return;
   el("godSharedDocumentStatus").textContent="문서 미리보기를 불러오지 못했습니다. 아래 MEGA 원본 열기를 이용하세요.";
  }
 }
 function resetDocumentPreview(){
  previewId=null;
  documentPreview?.reset();
 }
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
  el("godSharedDocument").hidden=true;el("godSharedPreview").hidden=false;
  resetDocumentPreview();
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
  const frame=el("godSharedFrame"),player=el("godSharedVideo");
  if(match.rec.type==="document"){
   // Each participant decrypts the original MEGA document in their own
   // browser and previews PDF/DOCX directly in this overlay. No extra tab
   // is opened on click, and Firebase only synchronizes the public URL.
   frame.removeAttribute("src");
   player.pause();player.removeAttribute("src");player.load();
   el("godSharedPreview").hidden=true;
   el("godSharedDocument").hidden=false;
   el("godSharedDocumentOpen").href=match.rec.url;
   el("godSharedOpen").textContent="↗ MEGA에서 원본 열기";
   el("godSharedHelp").textContent="MEGA 목회계획서를 이 강의실 화면에서 불러옵니다. 강사가 돌아가기를 누르면 참석자도 함께 복귀합니다.";
   el("godSharedLink").hidden=false;
   showDocumentPreview(match.rec,match.id);
   return;
  }
  el("godSharedDocument").hidden=true;
  el("godSharedPreview").hidden=false;
  resetDocumentPreview();
  el("godSharedOpen").textContent="↗ 새 탭에서 자료 열기";
  const src=target(match.rec.url);
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
