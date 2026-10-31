// GOD119 slide 10: honor the two ORIGINAL local-file PowerPoint hyperlinks.
// Browsers cannot silently access computer files; presenter grants one-time access
// using a file picker. Object URLs stay on the presenter's device, never Firebase.
export function createSlide10Videos({getState,resources,onChange,notify,getSlide}){
 const teacher=getState().teacher;
 const labels=["삼손중창단 행사 홍보영상","주일설교요약영상"];
 const $=id=>document.getElementById(id);
 const files=[null,null], objectURLs=[null,null];
 let playing=-1;
 // Do not replace these with cloud links; these are the original local media.
 resources[10]=labels.map(label=>({label:label+".mp4",local:true}));
 if(!teacher) return {ready(){},onSlide(){},isOpen:()=>false,play(){return false}};
 const css=document.createElement("style");
 css.textContent=`
 #godLocalVideoModal{position:absolute;inset:0;z-index:11;display:flex;flex-direction:column;
  gap:8px;background:#0a1729f8;color:#f4f8ff;padding:clamp(7px,1.3vw,16px)}
 #godLocalVideoModal[hidden]{display:none!important}
 #godLocalVideoModal .god-video-head{display:flex;align-items:center;gap:9px;flex-wrap:wrap}
 #godLocalVideoModal .god-video-head strong{flex:1;font-size:clamp(13px,1.8vw,23px);line-height:1.3}
 #godLocalVideoModal button{border:1px solid #edc584;border-radius:10px;padding:9px 13px;cursor:pointer;
  font-weight:750;background:#f3be67;color:#13233b}
 #godLocalVideoPlayer{width:100%;height:100%;min-height:0;object-fit:contain;background:#000;border-radius:9px}
 #godLocalVideoModal p{margin:0;font-size:clamp(11px,1vw,14px);color:#c6d5e9}
 .god-local-select{padding:9px 10px;border-radius:9px;background:#1b3952;border:1px solid #55728b;
  color:#fff;cursor:pointer;font:inherit;font-size:13px;margin:6px 0;width:100%}
 .god-local-select:focus-visible{outline:2px solid #f4bd6a}
 .god-local-status{font-size:12px;line-height:1.65;color:#d9e6f4;word-break:break-word}
 #godLocalVideoPanel input[type=file]{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
 `;
 document.head.appendChild(css);
 const stage=$("stage");
 const modal=document.createElement("div");modal.id="godLocalVideoModal";modal.hidden=true;
 modal.innerHTML=`
 <div class="god-video-head">
   <strong id="godLocalVideoHeading">노트북 영상 재생</strong>
   <button id="godLocalVideoBack" type="button">↩ 10번 슬라이드로 돌아가기</button>
 </div>
 <video id="godLocalVideoPlayer" controls playsinline preload="metadata"></video>
 <p id="godLocalVideoHelp">노트북에서 선택한 영상입니다. 이 기기에서만 재생됩니다.</p>`;
 stage.appendChild(modal);
 const panel=document.createElement("div");panel.id="godLocalVideoPanel";panel.className="card";
 panel.innerHTML=`
 <h3>10번 · 노트북 영상 연결</h3>
 <p class="muted">원본 PPT와 같은 두 개의 MP4 파일입니다. 웹브라우저 보안상 파일을 처음 한 번 선택해야 합니다. 유튜브 업로드는 필요 없습니다.</p>
 <div>
 <strong>① 삼손중창단 행사 홍보영상</strong>
 <input type="file" id="godLocalFile0" accept=".mp4,.m4v,.mov,.webm,video/*">
 <button id="godLocalPick0" type="button" class="god-local-select">컴퓨터에서 첫 번째 영상 선택</button>
 <div id="godLocalStatus0" class="god-local-status">아직 파일을 선택하지 않았습니다.</div>
 </div>
 <div style="margin-top:14px">
 <strong>② 주일설교요약영상</strong>
 <input type="file" id="godLocalFile1" accept=".mp4,.m4v,.mov,.webm,video/*">
 <button id="godLocalPick1" type="button" class="god-local-select">컴퓨터에서 두 번째 영상 선택</button>
 <div id="godLocalStatus1" class="god-local-status">아직 파일을 선택하지 않았습니다.</div>
 </div>
 <p class="muted" style="margin-top:13px">연결 후 10번 슬라이드 아래의 ▶ 영상 보기 버튼을 누르면 화면 안에서 재생됩니다. 새로고침 시 보안상 파일을 다시 선택해야 합니다.</p>
 <p class="muted">중요: 컴퓨터 파일을 직접 재생하는 방식은 강사 기기 전용입니다. 참석자 기기에서도 재생하려면 영상 파일을 온라인에 별도로 제공해야 합니다.</p>`;
 $("instructor").firstElementChild.insertAdjacentElement("afterend",panel);
 const player=$("godLocalVideoPlayer");
 function close(){
  player.pause();player.removeAttribute("src");player.load();
  modal.hidden=true;playing=-1;
 }
 function pick(i){const input=$("godLocalFile"+i);if(!input)return false;input.click();return true}
 function play(i){
  if(i!==0&&i!==1)return false;
  if(!files[i])return pick(i);
  if(getSlide()!==10){notify("10번 슬라이드에서 영상을 재생해 주세요.");return false}
  player.pause();player.src=objectURLs[i];player.load();
  $("godLocalVideoHeading").textContent=labels[i];
  $("godLocalVideoHelp").textContent="선택한 파일: "+files[i].name+" · 강사 노트북에서만 재생 중";
  playing=i;modal.hidden=false;
  player.play().catch(()=>{
   $("godLocalVideoHelp").textContent="영상 중앙의 재생(▶) 버튼을 눌러 주세요. 지원되지 않는 코덱이면 MP4(H.264/AAC) 파일을 사용하세요.";
  });
  return true;
 }
 function choose(i,input){
  const f=input.files?.[0];if(!f)return;
  if(!(f.type.startsWith("video/")||/\.(mp4|m4v|mov|webm)$/i.test(f.name))){
   $("godLocalStatus"+i).textContent="동영상 파일을 선택해 주세요 (MP4 권장).";return
  }
  if(objectURLs[i])URL.revokeObjectURL(objectURLs[i]);
  objectURLs[i]=URL.createObjectURL(f);files[i]=f;
  $("godLocalStatus"+i).textContent="✓ 연결됨: "+f.name+" · 이 브라우저에서만 사용";
  if(playing===i)close();
  onChange();
  if(getSlide()===10)play(i);
 }
 for(let i=0;i<2;i++){
  $("godLocalPick"+i).onclick=()=>pick(i);
  $("godLocalFile"+i).addEventListener("change",event=>choose(i,event.target));
 }
 $("godLocalVideoBack").onclick=close;
 player.addEventListener("error",()=>{
  $("godLocalVideoHelp").textContent="이 동영상 형식을 브라우저가 재생하지 못했습니다. MP4(H.264/AAC) 형식으로 변환해 주세요.";
 });
 // This is intentionally not a Firebase broadcast; blob: URLs work only on
 // the computer that selected them. Never send file bytes to Realtime Database.
 return {ready(){},onSlide(){if(getSlide()!==10&&!modal.hidden)close()},
  isOpen:()=>!modal.hidden,play,close,isReady:i=>!!files[i]};
}
