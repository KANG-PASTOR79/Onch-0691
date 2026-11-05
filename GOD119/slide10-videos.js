// GOD119 slide 10: click each original video thumbnail to play its MEGA file.
// There is NO persistent lecturer sidebar configuration panel.
// The two lecturer-provided MEGA share links are pre-connected; no setup is needed.
// File links (including their decryption keys) are audience-visible via Firebase.
export function createSlide10Videos({getState,resources,onChange,notify,getSlide,openShared}){
 const teacher=getState().teacher;
 const $=id=>document.getElementById(id);
 const names=["삼손중창단 행사 홍보영상","주일설교요약영상"];
 const rects=[[6.2,26.8,42.6,63.8],[50.8,26.8,42.6,63.8]];
 // These are the two exact MEGA file links supplied by the lecturer on 2026-10-31.
 // Firebase's new published path can override them if the lecturer later edits links.
 const DEFAULT_URLS=["https://mega.nz/file/6qxwCIRZ#hjUnv-AjIvEGEq7yZuuf0zLcM4d4SVJgqVyycZsmdrg","https://mega.nz/file/uqZRHLgA#8AXm5RoZ_QK0uy2VNp1MiKHr5iJt371ERC2n6JV3gGU"];
 let urls=[...DEFAULT_URLS],attached=false,received=false,selected=0;
 let seminarFolder="";
 function validSeminarFolder(value){
  if(typeof value!=="string"||value.length>1300)return null;
  try{
   const u=new URL(value.trim());
   if(u.protocol!=="https:"||!["mega.nz","www.mega.nz"].includes(u.hostname.toLowerCase())||u.username||u.password)return null;
   // An individual shared folder link, not an account dashboard or an invitation with edit permissions.
   if(/^\/folder\/[a-zA-Z0-9_-]{6,}\/??$/.test(u.pathname)&&/^#[a-zA-Z0-9_-]{10,}$/.test(u.hash))
    return u.href;
   if(u.pathname==="/"&&/^#F![a-zA-Z0-9_-]{6,}![a-zA-Z0-9_-]{10,}$/.test(u.hash))
    return u.href;
  }catch(_){}
  return null;
 }
 let layer=null,entry=null,message=null,player=null,objectURL=null;

 function normalized(raw){
  if(typeof raw!=="string"||raw.length>1300)return null;
  const text=raw.trim();if(!text)return "";
  try{
   const u=new URL(text);
   if(u.protocol!=="https:"||u.username||u.password)return null;
   const isMega=["mega.nz","www.mega.nz"].includes(u.hostname.toLowerCase());
   const m=isMega?u.pathname.match(/^\/(file|embed)\/([a-zA-Z0-9_-]{6,})\/?$/):null;
   if(m&&/^#[a-zA-Z0-9_-]{10,}$/.test(u.hash))
    return "https://mega.nz/file/"+m[2]+u.hash;
   if(isMega&&u.pathname==="/"&&/^#![a-zA-Z0-9_-]{6,}![a-zA-Z0-9_-]{10,}$/.test(u.hash))return u.href;
   // YouTube's unlisted links work inside GOD119 on phones that cannot preview MEGA.
   if(["youtube.com","www.youtube.com","m.youtube.com","youtu.be","www.youtu.be","www.youtube-nocookie.com"].includes(u.hostname.toLowerCase())){
    const id=u.hostname.toLowerCase().includes("youtu.be")?u.pathname.split("/")[1]:(u.searchParams.get("v")||u.pathname.match(/^\/(?:shorts|embed)\/([\w-]{11})/)?.[1]);
    if(id&&/^[a-zA-Z0-9_-]{11}$/.test(id))return "https://www.youtube.com/watch?v="+id;
   }
   // Direct HTTPS video URLs must be an actual video endpoint; no account links.
   if(!isMega&&/^\/[^?#]+\.(?:mp4|m4v|webm)$/i.test(u.pathname)&&!u.hash)
    return u.href;
  }catch(e){}
  return null;
 }
 function refresh(){
  resources[10]=names.map((name,i)=>urls[i]?
   {label:name+" · 영상",url:urls[i],rect:rects[i]}:
   {label:name+".mp4",local:true});
  if(seminarFolder)resources[10].push({label:"제일신목회세미나 · 공유 자료실",url:seminarFolder,type:"seminarFolder"});
  onChange();
 }
 if(teacher){
  const setupBar=document.createElement("div");
  setupBar.id="godVideo10Settings";
  setupBar.hidden=true;
  setupBar.style.cssText="margin-top:12px;padding:10px;border:1px solid #5a83a5;border-radius:10px;background:#102b42";
  setupBar.innerHTML='<strong style="color:#ffe1a0">10번 영상 주소 변경</strong><p style="font-size:12px">기기별 재생 문제가 있으면 모바일 호환 영상 링크로 교체할 수 있습니다.</p><div style="display:flex;gap:8px"><button id="godVideo10ConfigureA" type="button">왼쪽 영상</button><button id="godVideo10ConfigureB" type="button">오른쪽 영상</button></div><div style="margin-top:12px;border-top:1px solid #547388;padding-top:10px"><label for="god119SeminarFolder">제일신목회세미나 · 자료실 공유 링크 (선택)</label><input id="god119SeminarFolder" type="url" placeholder="https://mega.nz/folder/...#..." style="width:100%;padding:9px;background:#06172b;color:white;box-sizing:border-box"><button id="god119SaveFolder" type="button" style="margin-top:6px">읽기용 폴더 링크 저장</button><p id="god119FolderStatus" style="font-size:11px;color:#cde5ed">MEGA 전체 계정 주소가 아닌 폴더의 ‘링크 복사’를 사용하세요.</p></div>';
  $("slideSelect").insertAdjacentElement("afterend",setupBar);
  const css=document.createElement("style");
  css.textContent=`
  #godVideo10Setup{position:absolute;inset:0;z-index:12;background:#08182bf5;display:flex;justify-content:center;align-items:center;padding:clamp(10px,2vw,28px);box-sizing:border-box}
  #godVideo10Setup[hidden]{display:none!important}
  #godVideo10Setup .video-setup-card{width:min(92%,650px);max-height:92%;overflow-y:auto;background:#152e46;border:2px solid #d4a95d;box-shadow:0 18px 40px #000a;border-radius:16px;padding:clamp(14px,2vw,25px);box-sizing:border-box;color:#f4f8ff}
  #godVideo10Setup h3{font-size:clamp(16px,2.2vw,26px);margin:0 0 10px;color:#ffe1a0}
  #godVideo10Setup p{color:#cadaeb;font-size:clamp(11px,1.2vw,15px);line-height:1.55;margin:8px 0}
  #godVideo10Setup input[type=url]{display:block;background:#071a2e;border:1px solid #7a96ab;border-radius:9px;color:#fff;padding:12px;width:100%;box-sizing:border-box;font:inherit}
  #godVideo10Setup .actions{display:flex;gap:9px;flex-wrap:wrap;margin:12px 0 5px}
  #godVideo10Setup button{padding:10px 13px;border:1px solid #9cbeda;border-radius:9px;background:#294962;color:#fff;font-weight:750;cursor:pointer}
  #godVideo10Setup .primary{background:#f0bd70;color:#112238;border-color:#f7d597}
  #godVideo10Setup video{width:100%;max-height:55vh;background:#000;border-radius:8px}
  #godVideo10Setup .play-area[hidden],#godVideo10Setup .entry-area[hidden]{display:none!important}
  #godVideo10Setup input[type=file]{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
  @media(max-width:620px){#godVideo10Setup{padding:6px}#godVideo10Setup .video-setup-card{width:100%;padding:10px}}
  `;
  document.head.appendChild(css);
  layer=document.createElement("div");layer.id="godVideo10Setup";layer.hidden=true;
  layer.innerHTML=`
  <div class="video-setup-card" role="dialog" aria-modal="true" aria-labelledby="godVideo10Heading">
   <h3 id="godVideo10Heading">영상 연결</h3>
   <div id="godVideo10Entry" class="entry-area">
    <p>현재 MEGA 공유 링크가 연결되어 있습니다. 아이폰에서도 GOD119 안에서 재생하려면 재생 권한이 있는 YouTube 미등록 공개 영상 주소나 직접 재생 가능한 HTTPS MP4 주소로 교체하세요.</p>
    <input id="godVideo10URL" type="url" autocomplete="off" placeholder="YouTube 미등록 공개 주소 · HTTPS MP4 주소 · MEGA 공유주소" aria-label="영상 재생 주소">
    <p id="godVideo10Message" role="status">YouTube 미등록 공개 링크, HTTPS MP4 주소 또는 기존 MEGA 개별 파일 링크를 입력하세요.</p>
    <div class="actions"><button type="button" class="primary" id="godVideo10Save">링크 저장하고 영상 열기</button><button type="button" id="godVideo10Cancel">취소</button></div>
    <details><summary style="cursor:pointer;color:#ffe0a2">인터넷 연결 없이 노트북 MP4로만 재생하기</summary>
     <p>참석자에게 전송되지는 않으며 강사 노트북에서만 재생됩니다.</p>
     <input id="godVideo10LocalFile" type="file" accept=".mp4,.m4v,.mov,.webm,video/*">
     <button type="button" id="godVideo10LocalPick">노트북에서 MP4 선택</button>
    </details>
   </div>
   <div id="godVideo10Playing" class="play-area" hidden>
    <video id="godVideo10LocalPlayer" controls playsinline preload="metadata"></video>
    <p>이 파일은 강사 노트북에서만 재생됩니다.</p>
    <button type="button" id="godVideo10PlayingBack">↩ 10번 슬라이드로 돌아가기</button>
   </div>
  </div>`;
  $("stage").appendChild(layer);
  entry=$("godVideo10URL");message=$("godVideo10Message");player=$("godVideo10LocalPlayer");
  function close(){
   if(player){player.pause();player.removeAttribute("src");player.load()}
   if(objectURL){URL.revokeObjectURL(objectURL);objectURL=null}
   layer.hidden=true;$("godVideo10Playing").hidden=true;$("godVideo10Entry").hidden=false;
  }
  function configure(i){
   if(i!==0&&i!==1)return false;
   selected=i;
   $("godVideo10Heading").textContent=names[i]+" · 영상 연결";
   entry.value=urls[i]||"";
   message.textContent=urls[i]?"연결된 영상 주소를 변경할 수 있습니다.":"모바일 재생 가능한 YouTube 영상 링크나 HTTPS MP4 주소를 붙여넣으세요.";
   $("godVideo10Entry").hidden=false;$("godVideo10Playing").hidden=true;
   layer.hidden=false;
   entry.focus();
   return true;
  }
  $("god119SaveFolder").onclick=async()=>{
   const input=$("god119SeminarFolder");
   const next=validSeminarFolder(input.value);
   if(!next){$("god119FolderStatus").textContent="MEGA에서 제일신목회세미나 폴더만 선택한 뒤 ‘링크 복사’로 얻은 폴더 URL을 입력하세요. mega.nz/fm 주소는 사용할 수 없습니다.";return}
   const {F,db,auth,allowed,room}=getState();
   if(!F||!db||!allowed||!auth?.currentUser){$("god119FolderStatus").textContent="강사 로그인 후 저장할 수 있습니다.";return}
   try{
    await F.update(F.ref(db,"rooms/"+room+"/slide10VideosPublished"),{folder:next});
    seminarFolder=next;refresh();
    $("god119FolderStatus").textContent="세미나 폴더 링크를 저장했습니다. 해당 폴더 안의 자료만 링크를 아는 참석자에게 공개됩니다.";
   }catch(e){$("god119FolderStatus").textContent="저장하지 못했습니다. 강사 Firebase 권한을 확인하세요."}
  };
  $("godVideo10ConfigureA").onclick=()=>configure(0);
  $("godVideo10ConfigureB").onclick=()=>configure(1);
  $("godVideo10Cancel").onclick=close;
  $("godVideo10PlayingBack").onclick=close;
  $("godVideo10Save").onclick=async()=>{
   const next=normalized(entry.value);
   if(next===null){message.textContent="YouTube 영상 링크, HTTPS MP4 주소 또는 MEGA 개별 파일 링크만 사용할 수 있습니다.";return}
   const {F,db,auth,allowed,room}=getState();
   if(!F||!db||!allowed||!auth?.currentUser){
    message.textContent="먼저 강사 Google 로그인과 실시간 연결을 확인해 주세요.";return;
   }
   const button=$("godVideo10Save");button.disabled=true;
   message.textContent="영상 주소 저장 중…";
   try{
    // Update one link only; never erase the other linked video.
    await F.update(F.ref(db,"rooms/"+room+"/slide10VideosPublished"),{[selected===0?"a":"b"]:next});
    urls[selected]=next;refresh();
    close();
    if(next){
     const rec=resources[10][selected];
     openShared(rec,10);
    }else notify("영상 연결을 해제했습니다. 재생하려면 다시 링크를 등록하세요.");
   }catch(e){message.textContent="링크를 저장하지 못했습니다. 강사 권한과 Firebase 상태를 확인하세요."}
   finally{button.disabled=false}
  };
  $("godVideo10LocalPick").onclick=()=>$("godVideo10LocalFile").click();
  $("godVideo10LocalFile").onchange=e=>{
   const file=e.target.files?.[0];
   if(!file)return;
   if(!(file.type.startsWith("video/")||/\.(mp4|webm|m4v|mov)$/i.test(file.name))){
    message.textContent="MP4 등 영상 파일을 선택해 주세요.";return
   }
   if(objectURL)URL.revokeObjectURL(objectURL);
   objectURL=URL.createObjectURL(file);
   $("godVideo10Heading").textContent=file.name;
   $("godVideo10Entry").hidden=true;$("godVideo10Playing").hidden=false;
   player.src=objectURL;player.play().catch(()=>{});
  };
  player.onerror=()=>notify("브라우저가 영상을 재생하지 못했습니다. MP4(H.264/AAC)를 확인하세요.");
  refresh();
  function play(i){
   if(i!==0&&i!==1||getSlide()!==10)return false;
   if(urls[i])return !!openShared(resources[10][i],10);
   return configure(i);
  }
  function ready(){
   if(attached)return;
   const {F,db,room}=getState();if(!F||!db)return;
   attached=true;
   F.onValue(F.ref(db,"rooms/"+room+"/slide10VideosPublished"),snapshot=>{
    const data=snapshot.val()||{};
    urls=[normalized(data.a)||DEFAULT_URLS[0],normalized(data.b)||DEFAULT_URLS[1]];
    seminarFolder=validSeminarFolder(data.folder)||"";
    $("god119SeminarFolder").value=seminarFolder;
    received=true;refresh();
   },()=>notify("MEGA 영상 링크를 읽지 못했습니다. Firebase 권한을 확인해 주세요."));
  }
  function onSlide(){setupBar.hidden=getSlide()!==10;if(getSlide()!==10&&!layer.hidden)close()}
  return {ready,play,configure,close,isOpen:()=>!layer.hidden,onSlide};
 }
 function ready(){
  if(attached)return;
  const {F,db,room}=getState();if(!F||!db)return;
  attached=true;
  F.onValue(F.ref(db,"rooms/"+room+"/slide10VideosPublished"),snapshot=>{
   const data=snapshot.val()||{};
   urls=[normalized(data.a)||DEFAULT_URLS[0],normalized(data.b)||DEFAULT_URLS[1]];
   seminarFolder=validSeminarFolder(data.folder)||"";
   received=true;refresh();
  });
 }
 refresh();
 return {ready,onSlide(){},isOpen:()=>false,play:()=>false,configure:()=>false};
}
