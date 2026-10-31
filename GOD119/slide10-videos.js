// GOD119 slide 10: presenter-managed web video URLs, synced to all attendees.
// Video bytes remain on their provider (e.g. unlisted YouTube); Firebase stores only URLs.
export function createSlide10Videos({getState,resources,onChange,notify}){
 const teacher=getState().teacher;
 const labels=["삼손중창단 행사 홍보영상","주일설교요약영상"];
 const fallback=()=>labels.map(label=>({label:label+".mp4",local:true}));
 const $=id=>document.getElementById(id);
 let attached=false,initialized=false,stop=null,activeUrls=["",""];
 const normalize=value=>{
  if(typeof value!=="string"||value.length>1500)return null;
  const raw=value.trim();if(!raw)return "";
  try{
   const u=new URL(raw);
   if(u.protocol!=="https:"||u.username||u.password)return null;
   const hostname=u.hostname.toLowerCase();
   const videoHosts=["youtube.com","www.youtube.com","m.youtube.com","music.youtube.com","youtu.be","www.youtu.be","www.youtube-nocookie.com","vimeo.com","www.vimeo.com","player.vimeo.com"];
   const directVideo=/\.(mp4|webm|m4v)$/i.test(u.pathname);
   if(!videoHosts.includes(hostname)&&!directVideo)return null;
   if(videoHosts.some(h=>h.includes("youtube"))&&hostname.includes("youtube")){
    const id=u.searchParams.get("v")||u.pathname.split("/").filter(Boolean).at(-1);
    if(!id||!/^[\w-]{11}$/.test(id))return null;
   }
   if(hostname.includes("youtu.be")&&!/^[\w-]{11}$/.test(u.pathname.slice(1).split("/")[0]))return null;
   if(hostname.includes("vimeo.com")&&!/\/\d+/.test(u.pathname))return null;
   return u.href;
  }catch(e){return null}
 };
 function reflect(){
  resources[10]=labels.map((label,i)=>activeUrls[i]?{label,url:activeUrls[i]}:{label:label+".mp4",local:true});
  if(teacher){
   for(let i=0;i<2;i++){
    const input=$("godVideo10URL"+i);
    if(input&&document.activeElement!==input)input.value=activeUrls[i];
   }
   const status=$("godVideo10Status");
   if(status)status.textContent=activeUrls.every(Boolean)?
    "영상 2개 연결됨. 10번 슬라이드 아래의 영상 보기 버튼을 눌러 확인하세요.":
    "연결된 영상 "+activeUrls.filter(Boolean).length+"/2개 · 등록되지 않은 영상은 재생할 수 없습니다.";
  }
  onChange();
 }
 if(teacher){
  const card=document.createElement("div");
  card.className="card";card.id="godVideo10Panel";
  card.innerHTML=`
   <h3>10번 · 강의 영상 연결</h3>
   <p class="muted">원본 PPT의 컴퓨터 파일 링크는 웹에서 재생되지 않습니다. 공개 또는 일부 공개 유튜브 영상 주소나 직접 재생 가능한 MP4 주소를 등록하세요.</p>
   <label for="godVideo10URL0" style="display:block;margin:12px 0 6px">① 삼손중창단 행사 홍보영상</label>
   <input id="godVideo10URL0" type="url" inputmode="url" placeholder="https://www.youtube.com/watch?v=..." autocomplete="off">
   <label for="godVideo10URL1" style="display:block;margin:12px 0 6px">② 주일설교요약영상</label>
   <input id="godVideo10URL1" type="url" inputmode="url" placeholder="https://youtu.be/..." autocomplete="off">
   <button type="button" class="primary" id="godVideo10Save" style="width:100%;margin-top:12px">영상 링크 저장하고 참석자에게 연결</button>
   <p class="muted" id="godVideo10Status" role="status" aria-live="polite">강사 로그인 후 영상 주소를 저장할 수 있습니다.</p>
   <p class="muted">영상 URL만 저장됩니다. 파일은 자동 업로드되지 않습니다. 비공개 유튜브 영상은 참석자가 시청할 수 없습니다.</p>`;
  const aside=$("instructor");const first=aside.querySelector(".card");
  first?.insertAdjacentElement("afterend",card);
  $("godVideo10Save").onclick=async()=>{
   const {F,db,auth,room,allowed}=getState();
   if(!F||!db||!allowed||!auth?.currentUser){
    $("godVideo10Status").textContent="강사 Google 로그인 및 Firebase 연결을 확인하세요.";return;
   }
   const urls=labels.map((_,i)=>normalize($("godVideo10URL"+i).value));
   if(urls.some(v=>v===null)){
    $("godVideo10Status").textContent="올바른 영상 주소가 아닙니다. 유튜브, Vimeo 또는 직접 MP4/WebM 링크를 입력하세요.";return;
   }
   const button=$("godVideo10Save");button.disabled=true;
   $("godVideo10Status").textContent="영상 연결 주소를 저장하고 있습니다…";
   try{
    await F.set(F.ref(db,"rooms/"+room+"/slide10Videos"),{a:urls[0]||"",b:urls[1]||""});
    $("godVideo10Status").textContent="저장 완료! 강사·참석자 화면에서 10번 슬라이드의 링크를 사용할 수 있습니다.";
   }catch(e){
    $("godVideo10Status").textContent="저장 실패. Firebase 강사 권한을 확인해 주세요.";
   }finally{button.disabled=false}
  };
 }
 function ready(){
  if(attached)return;
  const {F,db,room}=getState();if(!F||!db)return;
  attached=true;
  stop=F.onValue(F.ref(db,"rooms/"+room+"/slide10Videos"),snapshot=>{
   const value=snapshot.val()||{};
   activeUrls=[normalize(value.a)||"",normalize(value.b)||""];
   initialized=true;reflect();
  },()=>{if(teacher&&$("godVideo10Status"))$("godVideo10Status").textContent="영상 목록을 읽을 수 없습니다. Firebase 설정을 확인해 주세요."});
 }
 reflect();
 return {ready,refresh:reflect};
}
