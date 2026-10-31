// GOD119 slide 10: preferred MEGA shared video files; optional local laptop fallback.
// Only file-link URLs (which include their decryption keys) are saved to Firebase.
// No MP4 bytes, local file paths, MEGA credentials, or accounts are stored.
export function createSlide10Videos({getState,resources,onChange,notify,getSlide}){
 const teacher=getState().teacher;
 const $=id=>document.getElementById(id);
 const names=["삼손중창단 행사 홍보영상","주일설교요약영상"];
 const rects=[[6.2,26.8,42.6,63.8],[50.8,26.8,42.6,63.8]];
 let attached=false,remoteUrls=["",""];
 const localFiles=[null,null],objectURLs=[null,null];
 let playing=-1,modal=null,player=null;
 function normalizeMega(value){
  if(typeof value!=="string"||value.length>1300)return null;
  if(!value.trim())return "";
  try{
   const url=new URL(value.trim());
   if(url.protocol!=="https:"||!["mega.nz","www.mega.nz"].includes(url.hostname.toLowerCase())||url.username||url.password)return null;
   const pathname=url.pathname;
   const regular=pathname.match(/^\/(file|embed)\/([a-zA-Z0-9_-]{6,})\/?$/);
   if(regular){
    if(!/^#[a-zA-Z0-9_-]{10,}$/.test(url.hash))return null;
    return "https://mega.nz/file/"+regular[2]+url.hash;
   }
   // Accept the classic MEGA shared-file shape, but not folder links.
   if(pathname==="/"&&/^#![a-zA-Z0-9_-]{6,}![a-zA-Z0-9_-]{10,}$/.test(url.hash))return url.href;
  }catch(e){}
  return null;
 }
 function reflect(){
  // All viewers see the exact same two media choices and hotspot positions.
  resources[10]=names.map((name,i)=>remoteUrls[i]?
    {label:name+" · MEGA 영상 보기",url:remoteUrls[i],rect:rects[i]}:
    {label:name+".mp4",local:true});
  if(teacher){
   for(let i=0;i<2;i++){
    const input=$("godMega10URL"+i);
    if(input&&input!==document.activeElement)input.value=remoteUrls[i];
   }
   const status=$("godMega10Status");
   if(status)status.textContent="MEGA 연결 "+remoteUrls.filter(Boolean).length+"/2개 · "+
      (remoteUrls.some(Boolean)?"10번 슬라이드 사진을 클릭해 영상을 확인하세요.":"아직 MEGA 영상 링크를 등록하지 않았습니다.");
  }
  onChange();
 }
 if(teacher){
  const css=document.createElement("style");
  css.textContent=`
 #godLocalVideoModal{position:absolute;inset:0;z-index:11;display:flex;flex-direction:column;gap:8px;background:#0a1729f8;color:#f4f8ff;padding:clamp(7px,1.3vw,16px)}
 #godLocalVideoModal[hidden]{display:none!important}
 #godLocalVideoModal .god-video-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
 #godLocalVideoModal .god-video-head strong{flex:1;font-size:clamp(13px,1.8vw,23px)}
 #godLocalVideoModal button{border:1px solid #edc584;border-radius:10px;padding:9px 13px;cursor:pointer;font-weight:750;background:#f3be67;color:#13233b}
 #godLocalVideoPlayer{width:100%;height:100%;min-height:0;object-fit:contain;background:#000;border-radius:9px}
 #godLocalVideoModal p{margin:0;font-size:12px;color:#c6d5e9}
 .god-local-select{padding:9px 10px;border-radius:9px;background:#1b3952;border:1px solid #55728b;color:#fff;cursor:pointer;font:inherit;font-size:13px;margin:6px 0;width:100%}
 .god-local-status{font-size:12px;line-height:1.6;color:#d9e6f4;word-break:break-word}
 #godLocalVideoPanel input[type=file]{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
 #godMegaPanel input{width:100%;padding:12px;border-radius:9px;border:1px solid #55728b;background:#0b2237;color:#edf7ff;font:inherit}
 #godMegaPanel label{display:block;margin:13px 0 7px;font-weight:750}
 #godMegaPanel details{margin-top:15px;border-top:1px solid #55728b;padding-top:12px}
 #godMegaPanel summary{cursor:pointer;color:#f2ce8b;font-weight:750}
 `;
  document.head.appendChild(css);
  modal=document.createElement("div");modal.id="godLocalVideoModal";modal.hidden=true;
  modal.innerHTML=`
   <div class="god-video-head"><strong id="godLocalVideoHeading">노트북 영상 재생</strong><button id="godLocalVideoBack" type="button">↩ 10번 슬라이드로 돌아가기</button></div>
   <video id="godLocalVideoPlayer" controls playsinline preload="metadata"></video>
   <p id="godLocalVideoHelp">강사 노트북에서만 재생되는 파일입니다.</p>`;
  $("stage").appendChild(modal);
  player=$("godLocalVideoPlayer");
  const panel=document.createElement("div");panel.id="godMegaPanel";panel.className="card";
  panel.innerHTML=`
   <h3>10번 · MEGA 영상 연결</h3>
   <p class="muted">MEGA에 영상 두 개를 업로드한 후, 각 파일의 <b>공유 링크</b>를 아래에 붙여넣으세요. 폴더 링크가 아닌 영상 파일의 링크여야 합니다.</p>
   <label for="godMega10URL0">① 삼손중창단 행사 홍보영상</label>
   <input id="godMega10URL0" type="url" placeholder="https://mega.nz/file/영상ID#공유키" autocomplete="off">
   <label for="godMega10URL1">② 주일설교요약영상</label>
   <input id="godMega10URL1" type="url" placeholder="https://mega.nz/file/영상ID#공유키" autocomplete="off">
   <button type="button" id="godMega10Save" class="primary" style="width:100%;margin-top:14px">MEGA 영상 링크 저장 · 참석자와 공유</button>
   <p class="muted" id="godMega10Status" role="status" aria-live="polite">강사 로그인 후 저장할 수 있습니다.</p>
   <p class="muted">링크를 아는 참석자도 영상을 볼 수 있습니다. 개인 정보가 포함된 영상은 주의하세요. 영상은 자동 재생되지 않을 수 있습니다.</p>
   <details><summary>노트북에 있는 원본 MP4 직접 재생 (예비 기능)</summary>
    <p class="muted">인터넷이 원활하지 않을 때 강사 노트북에서만 재생합니다. 참석자에게는 전송되지 않습니다.</p>
    <div><strong>① 삼손중창단 행사 홍보영상</strong>
      <input type="file" id="godLocalFile0" accept=".mp4,.m4v,.mov,.webm,video/*">
      <button id="godLocalPick0" type="button" class="god-local-select">노트북에서 영상 선택·재생</button>
      <div id="godLocalStatus0" class="god-local-status">파일 선택 전</div></div>
    <div style="margin-top:12px"><strong>② 주일설교요약영상</strong>
      <input type="file" id="godLocalFile1" accept=".mp4,.m4v,.mov,.webm,video/*">
      <button id="godLocalPick1" type="button" class="god-local-select">노트북에서 영상 선택·재생</button>
      <div id="godLocalStatus1" class="god-local-status">파일 선택 전</div></div>
   </details>`;
  $("instructor").firstElementChild.insertAdjacentElement("afterend",panel);
  $("godMega10Save").onclick=async()=>{
   const {F,db,allowed,auth,room}=getState();
   if(!F||!db||!allowed||!auth?.currentUser){
    $("godMega10Status").textContent="강사 Google 로그인과 Firebase 연결을 확인하세요.";return;
   }
   const urls=names.map((_,i)=>normalizeMega($("godMega10URL"+i).value));
   if(urls.some(x=>x===null)){
    $("godMega10Status").textContent="올바른 MEGA 영상 파일 공유 주소가 아닙니다. 영상 파일의 「링크 복사」에서 https://mega.nz/file/...#... 주소를 넣으세요.";
    return;
   }
   const button=$("godMega10Save");button.disabled=true;
   $("godMega10Status").textContent="MEGA 링크 저장 중…";
   try{
    await F.set(F.ref(db,"rooms/"+room+"/slide10Videos"),{a:urls[0],b:urls[1]});
    $("godMega10Status").textContent="저장 완료! 10번 슬라이드의 사진을 클릭하면 강사·참석자에게 MEGA 재생창이 나타납니다.";
   }catch(e){
    $("godMega10Status").textContent="링크 저장 실패. 강사 권한이나 Firebase 연결을 확인하세요.";
   }finally{button.disabled=false}
  };
  function closeLocal(){
   player.pause();player.removeAttribute("src");player.load();
   modal.hidden=true;playing=-1;
  }
  function localPlay(i){
   if(i!==0&&i!==1)return false;
   if(!localFiles[i]){$("godLocalFile"+i).click();return true}
   if(getSlide()!==10){notify("10번 슬라이드로 이동해 주세요.");return false}
   player.pause();player.src=objectURLs[i];player.load();
   $("godLocalVideoHeading").textContent=names[i];
   $("godLocalVideoHelp").textContent="노트북 원본: "+localFiles[i].name+" · 강사 화면에서만 재생";
   playing=i;modal.hidden=false;
   player.play().catch(()=>$("godLocalVideoHelp").textContent="재생 버튼을 눌러주세요. 지원되지 않는 경우 MP4(H.264/AAC)를 사용하세요.");
   return true;
  }
  for(let i=0;i<2;i++){
   $("godLocalPick"+i).onclick=()=>localPlay(i);
   $("godLocalFile"+i).addEventListener("change",event=>{
    const file=event.target.files?.[0];if(!file)return;
    if(!(file.type.startsWith("video/")||/\.(mp4|m4v|mov|webm)$/i.test(file.name))){
     $("godLocalStatus"+i).textContent="동영상 파일을 선택해 주세요.";return;
    }
    if(objectURLs[i])URL.revokeObjectURL(objectURLs[i]);
    objectURLs[i]=URL.createObjectURL(file);localFiles[i]=file;
    $("godLocalStatus"+i).textContent="✓ 연결됨: "+file.name;
    if(playing===i)closeLocal();
    if(getSlide()===10)localPlay(i);
   });
  }
  $("godLocalVideoBack").onclick=closeLocal;
  player.addEventListener("error",()=>{
   $("godLocalVideoHelp").textContent="동영상 코덱을 재생할 수 없습니다. MP4(H.264/AAC)를 사용하세요.";
  });
  function onSlide(){if(getSlide()!==10&&!modal.hidden)closeLocal()}
  function isOpen(){return !modal.hidden}
  function close(){closeLocal()}
  function play(i){return localPlay(i)}
  function ready(){
   if(attached)return;
   const {F,db,room}=getState();if(!F||!db)return;
   attached=true;
   F.onValue(F.ref(db,"rooms/"+room+"/slide10Videos"),snapshot=>{
    const value=snapshot.val()||{};
    remoteUrls=[normalizeMega(value.a)||"",normalizeMega(value.b)||""];
    reflect();
   },()=>$("godMega10Status").textContent="MEGA 링크 정보를 읽지 못했습니다. Firebase를 확인해 주세요.");
  }
  reflect();
  return {ready,onSlide,isOpen,close,play};
 }
 function ready(){
  if(attached)return;
  const {F,db,room}=getState();if(!F||!db)return;
  attached=true;
  F.onValue(F.ref(db,"rooms/"+room+"/slide10Videos"),snapshot=>{
   const value=snapshot.val()||{};
   remoteUrls=[normalizeMega(value.a)||"",normalizeMega(value.b)||""];
   reflect();
  });
 }
 reflect();
 return {ready,onSlide(){},isOpen:()=>false,play:()=>false};
}
