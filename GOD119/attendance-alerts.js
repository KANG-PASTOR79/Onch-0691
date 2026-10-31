// Lecturer-only registration alerts. Reads the existing private attendance path.
// Existing attendees on initial load are counted but never announced as new.
export function createAttendanceAlerts({getState}){
 const initial=getState();
 if(!initial.teacher)return {sync(){}};

 const style=document.createElement("style");
 style.textContent=`
 #god-attendance-alerts{border:2px solid #d9a95c;background:linear-gradient(140deg,#1b334b,#153e44);box-shadow:0 0 0 1px #efbd6a38}
 #god-attendance-alerts h3{color:#ffe2a3;margin:0 0 9px}
 .god-attendance-stats{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
 .god-attendance-number{font-size:32px;line-height:1.1;color:#ffe7b2;font-weight:850;font-variant-numeric:tabular-nums}
 .god-attendance-status{font-size:12px;color:#d1dfe9;line-height:1.55;margin:9px 0}
 .god-attendance-recent{padding:10px;border:1px solid #537485;border-radius:9px;background:#0e2936;margin-top:10px}
 .god-attendance-recent[hidden]{display:none!important}
 .god-attendance-recent strong{display:block;color:#ffe2a3;font-size:13px;margin-bottom:6px}
 .god-attendance-recent ul{list-style:none;margin:0;padding:0;display:grid;gap:6px}
 .god-attendance-recent li{font-size:12px;line-height:1.4;color:#eff6fc;word-break:break-word}
 .god-attendance-toggle{margin-top:8px;background:#284d65;border:1px solid #6a899e;border-radius:9px;color:#fff;padding:9px 12px;cursor:pointer;font-size:12px}
 #god-attendance-popup{position:fixed;top:76px;right:22px;width:min(420px,calc(100vw - 30px));z-index:2147482000;
   border:3px solid #ffc772;border-radius:19px;background:linear-gradient(145deg,#14293f,#174d50);color:#fff;
   box-shadow:0 18px 55px #0009,0 0 0 6px #eeb96833;padding:19px 18px 17px;box-sizing:border-box;animation:god-attendance-appear .4s ease both}
 #god-attendance-popup[hidden]{display:none!important}
 #god-attendance-popup .god-alert-row{display:flex;align-items:center;justify-content:space-between;gap:8px}
 #god-attendance-popup .god-alert-heading{font-size:clamp(17px,2.5vw,24px);color:#ffe3ad;font-weight:850}
 #god-attendance-popup .god-alert-close{border:1px solid #9ab8c0;background:#244c60;border-radius:9px;color:#fff;font-size:13px;cursor:pointer;padding:7px 10px}
 #god-attendance-popup .god-alert-name{font-size:clamp(19px,3.5vw,28px);font-weight:850;margin:15px 0 4px;word-break:break-word}
 #god-attendance-popup .god-alert-church{font-size:clamp(14px,2vw,18px);color:#d6f1ed;word-break:break-word}
 #god-attendance-popup .god-alert-foot{margin-top:12px;font-size:12px;color:#e7d3a8}
 @keyframes god-attendance-appear{from{transform:translateY(-16px) scale(.96);opacity:.25}to{transform:translateY(0) scale(1);opacity:1}}
 @media(prefers-reduced-motion:reduce){#god-attendance-popup{animation:none}}
 @media(max-width:650px){#god-attendance-popup{top:65px;right:10px;padding:13px}}
 `;
 document.head.appendChild(style);

 const sidebar=document.getElementById("instructor");
 const panel=document.createElement("div");
 panel.className="card";panel.id="god-attendance-alerts";
 panel.innerHTML=`
 <h3>🔔 실시간 참석자 등록 알림</h3>
 <div class="god-attendance-stats">
  <div><div class="god-attendance-number" id="godAttendanceTotal">—</div><div class="muted">현재 등록 인원</div></div>
  <div><div class="god-attendance-number" id="godAttendanceNew">0</div><div class="muted">강사 접속 후 신규 등록</div></div>
 </div>
 <p class="god-attendance-status" id="godAttendanceStatus" role="status">Google 로그인 후 실시간 출석 등록을 확인합니다.</p>
 <div class="god-attendance-recent" id="godAttendanceRecent" hidden>
  <strong>최근 새로 등록한 참석자</strong><ul id="godAttendanceRecentList"></ul>
 </div>
 <button type="button" class="god-attendance-toggle" id="godAttendanceSound">🔕 알림음 꺼짐 · 클릭해 켜기</button>`;
 sidebar.firstElementChild.insertAdjacentElement("afterend",panel);

 const toast=document.createElement("div");toast.id="god-attendance-popup";toast.hidden=true;
 toast.setAttribute("role","status");toast.setAttribute("aria-live","polite");
 toast.innerHTML=`
 <div class="god-alert-row"><strong class="god-alert-heading">🎉 새로운 참석자 등록!</strong><button class="god-alert-close" id="godAttendanceDismiss" type="button">확인 ✕</button></div>
 <div class="god-alert-name" id="godAttendanceName"></div>
 <div class="god-alert-church" id="godAttendanceChurch"></div>
 <div class="god-alert-foot" id="godAttendanceToastFoot">GOD119 · 실시간 출석 등록</div>`;
 document.body.appendChild(toast);
 const el=id=>document.getElementById(id);
 const originalTitle=document.title;
 let unsubscribe=null,activeUid=null,initialized=false,knownIds=new Set(),total=0;
 let newlyRegistered=0,alerts=[],queue=[],currentAlert=null,timer=null,soundEnabled=false;
 function placeToast(){
  const full=document.fullscreenElement;
  const host=full&&full.id==="stage"?full:document.body;
  if(toast.parentNode!==host)host.appendChild(toast);
  if(currentAlert)renderToast(currentAlert);
 }
 document.addEventListener("fullscreenchange",placeToast);
 function beep(){
  if(!soundEnabled)return;
  try{
   const Ctx=window.AudioContext||window.webkitAudioContext;
   if(!Ctx)return;
   const ctx=new Ctx();
   const oscillator=ctx.createOscillator(),gain=ctx.createGain();
   oscillator.type="sine";oscillator.frequency.value=740;
   gain.gain.setValueAtTime(.0001,ctx.currentTime);
   gain.gain.exponentialRampToValueAtTime(.11,ctx.currentTime+.04);
   gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.45);
   oscillator.connect(gain);gain.connect(ctx.destination);
   oscillator.start();oscillator.stop(ctx.currentTime+.45);
   oscillator.onended=()=>ctx.close();
  }catch(e){}
 }
 el("godAttendanceSound").onclick=()=>{
  soundEnabled=!soundEnabled;
  el("godAttendanceSound").textContent=soundEnabled?"🔔 알림음 켜짐 · 클릭해 끄기":"🔕 알림음 꺼짐 · 클릭해 켜기";
  if(soundEnabled)beep();
 };
 function renderToast(info){
  const fullscreen=document.fullscreenElement?.id==="stage";
  // A fullscreen stage may be projected publicly: never disclose names there.
  el("godAttendanceName").textContent=fullscreen?"새 참석자 1명이 입장했습니다":info.name+" 님";
  el("godAttendanceChurch").textContent=fullscreen?"강사 화면에서 등록 정보를 확인하세요":info.church+" · 출석 등록 완료";
  el("godAttendanceToastFoot").textContent="GOD119 · 등록 인원 "+total+"명";
 }
 function done(){
  if(timer){clearTimeout(timer);timer=null}
  currentAlert=null;toast.hidden=true;
  if(queue.length)setTimeout(showNext,180);
  else document.title=originalTitle;
 }
 el("godAttendanceDismiss").onclick=done;
 function showNext(){
  if(currentAlert||!queue.length)return;
  currentAlert=queue.shift();
  renderToast(currentAlert);placeToast();toast.hidden=false;
  document.title="🔔 참석자 신규 등록 · GOD119";
  beep();timer=setTimeout(done,9500);
 }
 function appendRecent(info){
  alerts.unshift(info);if(alerts.length>6)alerts.length=6;
  const list=el("godAttendanceRecentList");list.replaceChildren();
  for(const item of alerts){
   const li=document.createElement("li");
   li.textContent="✓ "+item.name+" · "+item.church;
   list.appendChild(li);
  }
  el("godAttendanceRecent").hidden=!alerts.length;
 }
 function announce(profile){
  const name=String(profile?.name||"참석자").trim().slice(0,35);
  const church=String(profile?.church||"소속 미입력").trim().slice(0,45);
  const info={name,church};
  newlyRegistered++;
  el("godAttendanceNew").textContent=String(newlyRegistered);
  el("godAttendanceStatus").textContent=name+" 님의 출석 등록이 완료되었습니다.";
  appendRecent(info);
  queue.push(info);
  if(!currentAlert)showNext();
 }
 function stop(){
  if(unsubscribe){unsubscribe();unsubscribe=null}
  activeUid=null;initialized=false;knownIds=new Set();
  if(timer){clearTimeout(timer);timer=null}
  queue=[];currentAlert=null;toast.hidden=true;
  document.title=originalTitle;
 }
 function sync(){
  const state=getState();
  if(!state.teacher)return;
  const {db,F,auth,room}=state;
  const uid=auth?.currentUser?.uid;
  if(!F||!db||!uid){
   stop();
   el("godAttendanceStatus").textContent="강사 Google 로그인 후 신규 출석 알림을 시작합니다.";
   return;
  }
  if(unsubscribe&&uid===activeUid)return;
  stop();
  activeUid=uid;
  el("godAttendanceStatus").textContent="출석 등록 현황을 연결하고 있습니다…";
  unsubscribe=F.onValue(F.ref(db,"attendance/"+room),snapshot=>{
   const all=snapshot.val()||{};
   const rows=Object.entries(all).filter(([id,row])=>row&&row.profile&&typeof row.profile.name==="string"&&typeof row.profile.church==="string");
   total=rows.length;
   el("godAttendanceTotal").textContent=String(total);
   const nextIds=new Set(rows.map(([id])=>id));
   if(!initialized){
    // The initial Firebase snapshot is baseline only, not a stream of arrivals.
    knownIds=nextIds;initialized=true;
    el("godAttendanceStatus").textContent="실시간 연결됨 · 새 참석자가 등록하면 알림이 나타납니다.";
    return;
   }
   for(const [id,row] of rows){
    if(!knownIds.has(id))announce(row.profile);
   }
   knownIds=nextIds;
  },error=>{
   el("godAttendanceStatus").textContent="출석 알림을 읽을 수 없습니다. 강사 Google 로그인과 Firebase 출석 규칙을 확인해 주세요.";
  });
 }
 return {sync};
}
