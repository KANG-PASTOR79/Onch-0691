// Individual participant feedback alert, shown only inside the attendee lecture view.
// Reads ONLY submissions/<room>/<current authenticated uid> and never the roster.
// Browser notifications are deliberately not requested; no personal text leaves the page.
export function createAttendeeFeedbackNotification({getState}){
 const css=document.createElement("style");
 css.textContent=[
  "#godFeedbackBell{position:fixed;right:18px;bottom:18px;z-index:2147480100;padding:12px 15px;border-radius:22px;border:2px solid #ffcf87;background:#153951;color:#ffe8b6;box-shadow:0 8px 35px #0008;font-weight:850;font-size:14px;cursor:pointer}",
  "#godFeedbackBell[hidden],#godFeedbackOverlay[hidden]{display:none!important}",
  "#godFeedbackOverlay{position:fixed;inset:0;z-index:2147480200;background:#061422dd;display:flex;align-items:center;justify-content:center;padding:16px}",
  "#godFeedbackOverlay .feedback-card{width:min(570px,98vw);max-height:85vh;overflow:auto;background:#122f46;border:3px solid #f5c57d;border-radius:18px;padding:23px;color:#f5f9fc;box-shadow:0 14px 45px #000b}",
  "#godFeedbackOverlay h2{margin:0 0 12px;color:#ffe4ae;font-size:24px}",
  "#godFeedbackOverlay .feedback-kind{color:#9fe7d0;font-size:14px;font-weight:750}",
  "#godFeedbackOverlay .feedback-message{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.8;font-size:18px;background:#092238;padding:17px;border-radius:10px;margin:14px 0}",
  "#godFeedbackOverlay .feedback-actions{display:flex;gap:9px;flex-wrap:wrap}",
  "#godFeedbackOverlay button,#godFeedbackOverlay a{font-weight:800;font-size:14px;padding:11px 16px;border-radius:9px;border:1px solid #8db4ca;color:white;background:#2d5874;text-decoration:none;cursor:pointer}",
  "#godFeedbackOverlay .feedback-actions .primary{background:#f2c578;border-color:#ffe3a7;color:#132b3e}",
  "#godFeedbackOverlay .feedback-help{margin-top:15px;font-size:12px;color:#cfdfec;line-height:1.6}"
 ].join("\n");
 document.head.append(css);
 const bell=document.createElement("button");bell.id="godFeedbackBell";bell.type="button";bell.hidden=true;
 bell.textContent="💬 강사 개인 피드백 확인";document.body.append(bell);
 const overlay=document.createElement("div");overlay.id="godFeedbackOverlay";overlay.hidden=true;
 const card=document.createElement("section");card.className="feedback-card";
 card.setAttribute("role","dialog");card.setAttribute("aria-modal","true");card.setAttribute("aria-labelledby","godFeedbackHeading");
 const heading=document.createElement("h2");heading.id="godFeedbackHeading";heading.textContent="💬 강사님 피드백 도착";
 const kind=document.createElement("div");kind.className="feedback-kind";
 const message=document.createElement("div");message.className="feedback-message";
 const buttons=document.createElement("div");buttons.className="feedback-actions";
 const dismiss=document.createElement("button");dismiss.type="button";dismiss.className="primary";dismiss.textContent="확인했습니다";
 const openSubmission=document.createElement("a");openSubmission.href="./submit.html";openSubmission.textContent="제출 화면에서 확인";
 const help=document.createElement("p");help.className="feedback-help";
 help.textContent="본 메시지는 현재 로그인한 제출자 계정에서만 보입니다. 제출했던 기기·브라우저를 사용해야 동일한 익명 계정으로 확인할 수 있습니다.";
 buttons.append(dismiss,openSubmission);card.append(heading,kind,message,buttons,help);
 overlay.append(card);document.body.append(overlay);
 let stop=null,activeUid=null,current=null,lastDisplayed=null;
 const kinds={received:"✓ 제출 확인 완료",revise:"✎ 보완 요청",praise:"★ 수고하셨습니다"};
 function memoryKey(uid){return "god119-feedback-seen-v1:"+uid}
 function identity(feedback){return String(feedback.at||"")+"|"+String(feedback.kind||"")+"|"+String(feedback.message||"")+"|"+String(feedback.fileName||"")}
 function acknowledge(){
  if(current&&activeUid)try{localStorage.setItem(memoryKey(activeUid),identity(current))}catch(_){}
  overlay.hidden=true;
  if(current)bell.hidden=false;
 }
 dismiss.onclick=acknowledge;
 bell.onclick=()=>{if(current){overlay.hidden=false;bell.hidden=true}};
 function reset(){
  if(stop){try{stop()}catch(_){}stop=null}
  activeUid=null;current=null;lastDisplayed=null;overlay.hidden=true;bell.hidden=true;
 }
 function sync(user){
  const {teacher,F,db,room}=getState();
  if(teacher||!user||!F||!db){reset();return}
  if(activeUid===user.uid&&stop)return;
  reset();activeUid=user.uid;
  stop=F.onValue(F.ref(db,"submissions/"+room+"/"+user.uid),snapshot=>{
   if(activeUid!==user.uid)return;
   const record=snapshot.val(),fb=record?.feedback;
   if(!record?.report||!fb||typeof fb.message!=="string"||!fb.message.trim()||
      !Object.hasOwn(kinds,fb.kind)||fb.fileName!==record.report.fileName){
    current=null;overlay.hidden=true;bell.hidden=true;return;
   }
   const fingerprint=identity(fb);
   if(fingerprint===lastDisplayed)return;
   current=fb;lastDisplayed=fingerprint;
   kind.textContent=kinds[fb.kind];
   message.textContent=fb.message.slice(0,400);
   let seen="";
   try{seen=localStorage.getItem(memoryKey(activeUid))||""}catch(_){}
   if(fingerprint!==seen){overlay.hidden=false;bell.hidden=true}
   else{overlay.hidden=true;bell.hidden=false}
  },error=>{
    // An attendee never gets access to anyone else's information.
    overlay.hidden=true;bell.hidden=true;
    console.warn("Private feedback read unavailable:",String(error?.code||""));
  });
 }
 // The browser hides ordinary page overlays during fullscreen presentation.
 // Move only this participant's feedback UI into the fullscreen subtree.
 function alignFullscreen(){
  const container=document.fullscreenElement||document.body;
  if(bell.parentNode!==container)container.append(bell);
  if(overlay.parentNode!==container)container.append(overlay);
 }
 document.addEventListener("fullscreenchange",alignFullscreen);
 return {sync,reset};
}
