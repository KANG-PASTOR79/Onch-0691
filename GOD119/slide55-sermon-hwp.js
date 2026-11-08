// GOD119 slide 56 — one public MEGA sermon HWP/HWPX file, shared to all
// instructor and attendee screens. No private MEGA account or file bytes
// are stored in Firebase: only an intentionally shared individual file URL.
export function createSlide55SermonHwp({getState,getSlide,notify}){
 const teacher=getState().teacher;
 const roomKey="slide55SampleSermonHwpUrl";
 let currentUrl="",unsubscribe=null,corner=null,downloadBtn=null,settingBtn=null,progress=null,externalLink=null;
 let config=null,configInput=null,configStatus=null,downloading=false;
 let inlinePanel=null,inlineInput=null,inlineSaveBtn=null,inlineDownloadBtn=null,inlineStatus=null,inlineAltLink=null;
 const allowedURL=raw=>{
  if(typeof raw!=="string"||raw.length>1500)return null;
  try{
   const u=new URL(raw.trim());
   if(u.protocol!=="https:"||!["mega.nz","www.mega.nz"].includes(u.hostname.toLowerCase())||
      !/^\/file\/[A-Za-z0-9_-]{6,}\/?$/.test(u.pathname)||u.search||
      !/^#[A-Za-z0-9_-]{16,}$/.test(u.hash)||u.username||u.password)return null;
   const id=u.pathname.split("/")[2];
   return "https://mega.nz/file/"+id+u.hash;
  }catch(_){return null}
 };
 const style=document.createElement("style");
 style.textContent=[
  "#godSlide55Sermon{position:absolute;left:5.5%;top:78.4%;width:66%;min-height:13%;z-index:6;pointer-events:auto;box-sizing:border-box;display:flex;align-items:center;gap:clamp(5px,.7vw,12px);padding:clamp(7px,1vw,15px);border:2px solid #f6cb7c;border-radius:12px;background:linear-gradient(120deg,#09243ff5,#214958f2);color:#fff;box-shadow:0 8px 22px #0008}",
  "#godSlide55Sermon .god-hwp-label{flex:1;min-width:0;font-size:clamp(11px,1.2vw,19px);font-weight:800;line-height:1.35}",
  "#godSlide55Sermon .god-hwp-label small{display:block;color:#b9d7df;font-size:clamp(9px,.72vw,13px);font-weight:500}",
  "#godSlide55Sermon button{pointer-events:auto;min-width:0;border:1px solid #ffe5af;border-radius:9px;background:#f4cb83;color:#102f40;padding:clamp(6px,.7vw,11px) clamp(8px,.85vw,15px);font-size:clamp(11px,1vw,18px);font-weight:900;cursor:pointer;white-space:nowrap}",
  "#godSlide55Sermon button:disabled{opacity:.6;cursor:not-allowed}",
  "#godSlide55Sermon .god-hwp-config{background:#2d5066;color:#fff;border-color:#8caec2;font-size:clamp(9px,.78vw,14px)}",
  "#godSlide55Sermon .god-hwp-open{position:static!important;display:inline-flex!important;border:0!important;background:none!important;font-size:clamp(9px,.8vw,14px);color:#e1f4ff;white-space:nowrap}",
  "#godSermon55Inline{display:flex;flex-direction:column;gap:10px;box-sizing:border-box;margin:13px 0 15px;padding:16px 18px;border:2px solid #ebbd6d;border-radius:12px;background:linear-gradient(120deg,#152b45,#1b4355);color:#f7fafc;box-shadow:0 8px 22px #0004}",
  "#godSermon55Inline strong{display:block;font-size:18px;color:#ffe0a1}",
  "#godSermon55Inline .god-sermon-instructions{font-size:14px;line-height:1.6;color:#dcebf4}",
  "#godSermon55Inline .god-sermon-controls{display:flex;gap:9px;align-items:center;flex-wrap:wrap}",
  "#godSermon55Inline input{flex:1;min-width:220px;box-sizing:border-box;min-height:43px;border:1px solid #94b4c9;border-radius:8px;background:#092238;color:#fff;font-size:14px;padding:9px 12px}",
  "#godSermon55Inline button{min-height:43px;border-radius:8px;border:1px solid #ffd995;padding:9px 14px;cursor:pointer;background:#f2c77f;color:#1a2d3b;font-weight:850;font-size:14px}",
  "#godSermon55Inline button:disabled{opacity:.5;cursor:not-allowed}",
  "#godSermon55Inline a{display:inline-flex!important;position:static!important;text-decoration:none;border:1px solid #8fb4c8;padding:10px 13px;margin:0;color:#e2f5ff;background:#23495f;border-radius:8px;font-size:13px;font-weight:700}",
  "#godSermon55Inline [role=status]{font-size:13px;color:#ffe0a1;line-height:1.5}",
  "#godSlide55HwpConfig[hidden]{display:none!important}",
  "#godSlide55HwpConfig{position:absolute;inset:0;z-index:25;background:#071427ed;display:flex;align-items:center;justify-content:center;box-sizing:border-box;padding:3%}",
  "#godSlide55HwpConfig .god-hwp-dialog{background:#142e49;border:2px solid #e9bf77;border-radius:15px;width:min(92%,760px);color:#f4f9ff;padding:clamp(14px,2vw,30px);box-shadow:0 17px 45px #0009}",
  "#godSlide55HwpConfig h3{margin:0 0 12px;color:#ffe0a3;font-size:clamp(18px,2vw,27px)}",
  "#godSlide55HwpConfig p{font-size:clamp(12px,1.25vw,16px);line-height:1.6}",
  "#godSlide55HwpConfig input{width:100%;box-sizing:border-box;padding:12px;border-radius:8px;background:#071c2d;color:white;border:1px solid #87abc0;font-size:clamp(13px,1.2vw,17px)}",
  "#godSlide55HwpConfig .god-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:15px}",
  "#godSlide55HwpConfig button{padding:10px 16px;border:1px solid #92afbf;border-radius:8px;background:#31546a;color:white;font-weight:800;cursor:pointer}",
  "#godSlide55HwpConfig button.primary{background:#f0be70;color:#12283a;border-color:#fbe0b0}",
  "#godSlide55HwpConfig button:disabled{opacity:.5}",
  "@media(max-width:650px){#godSlide55Sermon{left:4%;width:72%;top:77%;min-height:17%;padding:5px;gap:4px;flex-wrap:wrap}#godSlide55Sermon .god-hwp-label{flex-basis:100%}#godSlide55Sermon .god-hwp-label small{display:none}#godSlide55Sermon button{font-size:10px}}"
 ].join("\n");
 document.head.appendChild(style);
 const stage=document.getElementById("stage");
 if(teacher){
  config=document.createElement("div");config.id="godSlide55HwpConfig";config.hidden=true;
  config.innerHTML='<div class="god-hwp-dialog" role="dialog" aria-modal="true" aria-labelledby="godSermon55Title">'+
   '<h3 id="godSermon55Title">56번 · 샘플 설교 한글파일 연결</h3>'+
   '<p>MEGA 보관함에서 참석자에게 제공할 <b>.hwp 또는 .hwpx 파일 하나</b>를 선택하고 <b>개별 파일 공유 링크</b>를 복사해 붙여넣으세요. 파일 제출 요청 링크나 폴더 주소는 사용할 수 없습니다.</p>'+
   '<input type="url" id="godSermon55URL" aria-label="샘플 설교 한글파일 MEGA 공유 주소" autocomplete="off" placeholder="https://mega.nz/file/파일ID#복호화키">'+
   '<p id="godSermon55SaveStatus" role="status">저장된 링크는 참석자에게도 공개됩니다. 개인정보나 비공개 목회 기록이 없는 샘플 설교만 등록하세요.</p>'+
   '<div class="god-actions"><button id="godSermon55Save" class="primary" type="button">저장 · 참석자에게 공유</button>'+
   '<button id="godSermon55Cancel" type="button">취소</button></div></div>';
  stage.appendChild(config);
  configInput=config.querySelector("#godSermon55URL");
  configStatus=config.querySelector("#godSermon55SaveStatus");
  config.querySelector("#godSermon55Cancel").onclick=()=>{config.hidden=true};
  config.querySelector("#godSermon55Save").onclick=async()=>{
   const value=allowedURL(configInput.value);
   if(!value){configStatus.textContent="MEGA 개별 파일 공유 주소를 입력해 주세요. https://mega.nz/file/…#… 형식이어야 합니다.";return}
   const {F,db,auth,room,allowed}=getState();
   if(!allowed||!F||!db||!auth?.currentUser){configStatus.textContent="강사 Google 로그인과 Firebase 연결을 먼저 확인해 주세요.";return}
   if(!window.confirm("이 MEGA 공유 링크를 모든 참석자에게 공개하시겠습니까?\n한글 샘플 설교문에 개인정보가 없는지 확인해 주세요."))return;
   const btn=config.querySelector("#godSermon55Save");btn.disabled=true;
   configStatus.textContent="참석자에게 공유할 링크를 저장 중입니다…";
   try{
    await F.set(F.ref(db,"rooms/"+room+"/"+roomKey),value);
    currentUrl=value;config.hidden=true;update();
    if(inlineStatus)inlineStatus.textContent="✓ 연결 성공 · 강사와 참석자 모두 다운로드할 수 있습니다.";
    notify("56번 샘플 설교 한글파일 링크가 강사·참석자 화면에 연결되었습니다.");
   }catch(e){configStatus.textContent="저장하지 못했습니다. Firebase 강사 로그인과 쓰기 권한을 확인하세요.";if(inlineStatus)inlineStatus.textContent=configStatus.textContent}
   finally{btn.disabled=false}
  };
 }
 function setStatus(message){if(progress)progress.textContent=message;if(inlineStatus)inlineStatus.textContent=message}
 function update(){
  if(!corner)return;
  if(downloadBtn){
   downloadBtn.disabled=!currentUrl||downloading;
   downloadBtn.textContent=downloading?"내려받는 중…":currentUrl?"⬇ 한글파일 다운로드":"⬇ 자료 준비 중";
   downloadBtn.title=currentUrl?"샘플 설교 HWP/HWPX를 GOD119에서 바로 내려받습니다.":"강사가 MEGA 샘플 설교 주소를 연결하면 활성화됩니다.";
  }
  if(settingBtn)settingBtn.textContent=currentUrl?"⚙ 링크 변경":"🔗 MEGA 링크 연결";
  if(inlineDownloadBtn){inlineDownloadBtn.disabled=!currentUrl||downloading;inlineDownloadBtn.textContent=downloading?"내려받는 중…":currentUrl?"⬇ 샘플 설교 한글파일 다운로드":"⬇ 강사 링크 등록 후 다운로드";}
  if(inlineAltLink){inlineAltLink.hidden=!currentUrl;if(currentUrl)inlineAltLink.href=currentUrl;}
  if(inlineSaveBtn)inlineSaveBtn.textContent=currentUrl?"링크 변경 · 참석자에게 공유":"링크 저장 · 참석자에게 공유";
  if(externalLink){
   externalLink.hidden=!currentUrl;
   if(currentUrl)externalLink.href=currentUrl;
  }
 }
 function mount(hotspots,links){
  if(getSlide()!==56)return;
  corner=document.createElement("div");corner.id="godSlide55Sermon";corner.setAttribute("aria-label","샘플 설교 한글파일 다운로드");
  const title=document.createElement("div");title.className="god-hwp-label";
  title.textContent="📄 실습용 샘플 설교 한글파일";
  const note=document.createElement("small");note.textContent="56번 · 설교 쇼츠 제작 실습 자료 (HWP/HWPX)";
  title.appendChild(note);
  downloadBtn=document.createElement("button");downloadBtn.type="button";
  downloadBtn.onclick=download;
  corner.append(title,downloadBtn);
  if(teacher){
   settingBtn=document.createElement("button");settingBtn.type="button";settingBtn.className="god-hwp-config";
   settingBtn.onclick=()=>{
    if(getSlide()!==56||!config)return;
    configInput.value=currentUrl;
    configStatus.textContent=currentUrl?"기존 링크가 연결되어 있습니다. 다른 파일을 공유하려면 주소를 변경하세요.":"MEGA의 샘플 설교 HWP/HWPX 파일에 대한 개별 공유 링크를 붙여넣으세요.";
    config.hidden=false;configInput.focus();
   };
   corner.appendChild(settingBtn);
  }else settingBtn=null;
  // When CDN/browser download is blocked, attendees can still download via
  // the exact same single-file public share in MEGA.
  externalLink=document.createElement("a");externalLink.className="god-hwp-open";
  externalLink.target="_blank";externalLink.rel="noopener noreferrer";externalLink.textContent="MEGA에서 받기 ↗";
  externalLink.title="MEGA 개별 파일 화면에서 직접 내려받기";
  corner.appendChild(externalLink);
  hotspots.appendChild(corner);
  progress=document.createElement("div");progress.id="godSermon55Progress";
  progress.style.cssText="position:absolute;left:5.5%;top:93%;width:68%;font-size:clamp(10px,.8vw,14px);color:#ffe0a9;z-index:6;pointer-events:none;";
  progress.setAttribute("role","status");progress.setAttribute("aria-live","polite");
  hotspots.appendChild(progress);
  // Permanent inline resource card outside the 16:9 image keeps the
  // configuration and download controls visible at normal desktop zoom.
  // The stage hotspot above remains an additional shortcut.
  inlinePanel=document.createElement("section");inlinePanel.id="godSermon55Inline";
  inlinePanel.setAttribute("aria-label","56번 샘플 설교 한글파일 다운로드 및 공유");
  const heading=document.createElement("strong");
  heading.textContent="📄 56번 · 실습용 샘플 설교 한글파일 다운로드";
  const intro=document.createElement("div");intro.className="god-sermon-instructions";
  intro.textContent=teacher?
    "강사 설정: MEGA 보관함에서 HWP/HWPX 개별 파일의 공유 주소를 아래에 붙여넣고 저장하세요. 참석자 화면에도 같은 다운로드 버튼이 생깁니다.":
    "강사가 등록한 샘플 설교 HWP/HWPX 파일을 내려받아 설교 쇼츠 실습에 이용하세요.";
  const controls=document.createElement("div");controls.className="god-sermon-controls";
  if(teacher){
   inlineInput=document.createElement("input");inlineInput.type="url";
   inlineInput.placeholder="https://mega.nz/file/파일ID#복호화키";
   inlineInput.setAttribute("aria-label","MEGA 샘플 설교 한글파일 개별 공유 주소 붙여넣기");
   inlineInput.autocomplete="off";
   inlineInput.value=currentUrl;
   inlineSaveBtn=document.createElement("button");inlineSaveBtn.type="button";
   inlineSaveBtn.onclick=()=>{
    if(!config||!configInput)return;
    const raw=inlineInput.value.trim();
    if(!allowedURL(raw)){
     inlineStatus.textContent="MEGA 개별 파일의 전체 공유 주소를 입력하세요. 폴더 링크나 파일 제출 요청 주소는 사용할 수 없습니다.";
     inlineInput.focus();return;
    }
    configInput.value=raw;
    // The original presenter-only validated save logic, confirmation prompt,
    // and Firebase write are reused; no second storage location is introduced.
    config.hidden=false;
    config.querySelector("#godSermon55Save").click();
   };
   controls.append(inlineInput,inlineSaveBtn);
  }
  inlineDownloadBtn=document.createElement("button");inlineDownloadBtn.type="button";
  inlineDownloadBtn.onclick=download;controls.appendChild(inlineDownloadBtn);
  inlineAltLink=document.createElement("a");inlineAltLink.target="_blank";
  inlineAltLink.rel="noopener noreferrer";inlineAltLink.textContent="MEGA 파일 화면에서 받기 ↗";
  controls.appendChild(inlineAltLink);
  inlineStatus=document.createElement("div");inlineStatus.setAttribute("role","status");
  inlineStatus.setAttribute("aria-live","polite");
  inlineStatus.textContent=currentUrl?"✓ 공유 주소 연결됨 · 다운로드 가능":"MEGA 샘플 설교 주소가 아직 연결되지 않았습니다.";
  inlinePanel.append(heading,intro,controls,inlineStatus);
  links.appendChild(inlinePanel);
  update();
 }
 async function download(){
  if(!currentUrl||downloading)return;
  downloading=true;update();
  const url=currentUrl;
  try{
   setStatus("MEGA에서 한글파일 정보를 확인합니다…");
   const {File}=await limit(import("https://unpkg.com/megajs@1.3.1/dist/main.browser-es.mjs"),30000,"MODULE_TIMEOUT");
   const file=File.fromURL(url);file.api.userAgent=null;
   await limit(file.loadAttributes(),35000,"METADATA_TIMEOUT");
   const name=String(file.name||"").trim();
   if(!/\.(hwp|hwpx)$/i.test(name))throw Error("NOT_HWP");
   const size=Number(file.size);
   if(!Number.isSafeInteger(size)||size<8||size>80*1024*1024)throw Error("SIZE_LIMIT");
   setStatus(name+" · 내려받는 중…");
   const buffer=await limit(file.downloadBuffer(),180000,"DOWNLOAD_TIMEOUT");
   const bytes=buffer instanceof Uint8Array?buffer:new Uint8Array(buffer);
   if(bytes.length!==size)throw Error("INCOMPLETE");
   const isHwp=/\.hwp$/i.test(name);
   if(isHwp&&!(bytes[0]===0xd0&&bytes[1]===0xcf&&bytes[2]===0x11&&bytes[3]===0xe0))throw Error("INVALID_HWP");
   if(!isHwp&&!(bytes[0]===0x50&&bytes[1]===0x4b))throw Error("INVALID_HWPX");
   const safeName=name.replace(/[/\\:*?"<>|\u0000-\u001f]/g,"_").slice(0,180)||"샘플설교.hwp";
   const type=isHwp?"application/x-hwp":"application/zip";
   const blob=URL.createObjectURL(new Blob([bytes],{type}));
   const a=document.createElement("a");a.href=blob;a.download=safeName;a.style.display="none";
   document.body.appendChild(a);a.click();a.remove();
   setTimeout(()=>URL.revokeObjectURL(blob),60000);
   setStatus("✓ "+safeName+" · 다운로드를 시작했습니다. 다운로드 폴더를 확인하세요.");
  }catch(e){
   const code=String(e?.message||e);
   setStatus(code==="NOT_HWP"?"연결된 자료가 HWP/HWPX 파일이 아닙니다. 강사에게 파일 확인을 요청하세요.":
    "자동 다운로드가 되지 않았습니다. 오른쪽 ‘MEGA에서 받기’를 이용해 주세요.");
  }finally{downloading=false;update()}
 }
 function limit(p,ms,code){
  let timer;
  return Promise.race([p,new Promise((_,reject)=>timer=setTimeout(()=>reject(Error(code)),ms))])
   .finally(()=>clearTimeout(timer));
 }
 function ready(){
  if(unsubscribe)return;
  const {F,db,room}=getState();
  if(!F||!db)return;
  unsubscribe=F.onValue(F.ref(db,"rooms/"+room+"/"+roomKey),snap=>{
   currentUrl=allowedURL(snap.val())||"";update();if(inlineStatus)inlineStatus.textContent=currentUrl?"✓ MEGA 샘플 설교 공유 링크 연결 완료":"아직 MEGA 샘플 설교 공유 링크가 없습니다.";
  },()=>{
   setStatus("샘플 설교 파일 링크를 읽지 못했습니다. 강의실 연결을 확인하세요.");
  });
 }
 function onSlide(){if(getSlide()!==56&&config)config.hidden=true}
 return {mount,ready,onSlide};
}
