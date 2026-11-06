import {unpackFileFingerprints} from "./submission-file-fingerprint.js?v=2";
// Instructor-only submission preview. Simple MEGA reports do not contain file hashes;
// instructors can verify MEGA uploads or attach a private individual share URL.
export function createResultPreview(){
  const storeKey="god119-private-submission-links-v2"; // Do not trust previously assigned links after cross-attendee preview bug.
  let links={};
  try{const value=JSON.parse(localStorage.getItem(storeKey)||"{}");if(value&&typeof value==="object")links=value}catch(_){}
  const css=document.createElement("style");
  css.textContent=[
    '#godResultPreview{position:fixed;inset:0;z-index:2147481000;background:#041321e8;display:flex;align-items:center;justify-content:center;padding:14px;box-sizing:border-box}',
    '#godResultPreview[hidden]{display:none!important}',
    '#godResultPreview .sheet{width:min(940px,98vw);max-height:96vh;display:flex;flex-direction:column;gap:9px;background:#102c41;color:#f5f9ff;border:2px solid #e9bf7b;border-radius:14px;padding:15px;box-shadow:0 12px 60px #000b;box-sizing:border-box}',
    '#godResultPreview .title{display:flex;justify-content:space-between;gap:12px;align-items:center}',
    '#godResultPreview .title b{font-size:19px;color:#ffe1aa}',
    '#godResultPreview button,#godResultPreview a{background:#31516b;color:#fff;border:1px solid #8daac2;border-radius:8px;padding:8px 10px;cursor:pointer;text-decoration:none;font-size:12px;font-weight:700}',
    '#godResultPreview .actions{display:flex;gap:7px;align-items:center;flex-wrap:wrap}',
    '#godResultPreview input[type=url]{flex:1;min-width:200px;padding:9px;border-radius:8px;border:1px solid #87a5b6;color:#fff;background:#071c30;font-size:12px}',
    '#godResultPreview input[type=file]{max-width:280px;font-size:12px}',
    '#godResultPreview .meta{font-size:12px;color:#d3e3ee;line-height:1.5}',
    '#godResultPreview .canvas{background:#f1f3f6;border-radius:8px;overflow:auto;max-height:62vh;min-height:240px;flex:1;position:relative}',
    '#godResultPreview .canvas iframe,#godResultPreview .canvas video{display:block;width:100%;height:53vh;min-height:230px;border:0;background:#000}',
    '#godResultPreview .canvas img{display:block;max-width:100%;height:auto;margin:0 auto}',
    '#godResultPreview .canvas pre{white-space:pre-wrap;overflow-wrap:anywhere;color:#183346;padding:18px}',
    '#godResultPreview .canvas p{color:#274056;font-size:14px;padding:15px}',
    '#godResultPreview .folder-help{font-size:12px;background:#1c4052;color:#ffe4ad;padding:10px;border-radius:8px;line-height:1.5}',
    '#godResultPreview button.primary-local{background:#ebc27c;color:#162b3b;font-weight:900;border:1px solid #ffe5b0}',
    '#godResultPreview .matches{display:flex;flex-wrap:wrap;gap:6px;max-height:155px;overflow-y:auto}',
    '#godResultPreview .matches[hidden]{display:none!important}',
    '#godResultPreview .matches button{background:#1e5262;border-color:#8fcfbd;color:#fff3cd;overflow-wrap:anywhere;max-width:100%;text-align:left;line-height:1.45}',
    '#godResultPreview .matches button[data-namematch=true]{border-color:#f6d489;background:#285c59}',
    '#godResultPreview .matchesTitle{font-weight:800;color:#ffe1a8;margin:5px 0 0}',
    '#godResultPreview .folder-help b{color:#fff2c4}',
    '#godResultPreview [hidden]{display:none!important}',
    '#godResultPreview.simple-mode .actions #grpFolder,#godResultPreview.simple-mode .actions #grpFolderRetry,#godResultPreview.simple-mode .actions label:has(#grpFile),#godResultPreview.simple-mode .actions #grpMega,#godResultPreview.simple-mode #grpFolderHelp{display:none!important}',
    '#godResultPreview.simple-mode #grpLinkRow{display:flex;align-items:stretch;gap:8px}',
    '#godResultPreview.simple-mode #grpLinkRow input{font-size:14px;min-height:45px}',
    '#godResultPreview.simple-mode #grpLinkRow button{min-height:45px;font-size:13px}',
    '#godResultPreview.simple-mode #grpLocalPick{padding:14px 16px;border-color:#aed0e1;font-size:15px}',
    '#godResultPreview.simple-mode #grpMegaInstructions{font-size:14px;line-height:1.7}',
    '@media(max-width:700px){#godResultPreview.simple-mode #grpLinkRow input{flex-basis:100%}#godResultPreview.simple-mode #grpLinkRow{flex-wrap:wrap}}',
    '#godResultPreview.simple-mode #grpSecurePick{font-size:clamp(18px,2.5vw,24px);padding:20px 15px;flex:1;line-height:1.6;min-width:260px}',
    '#godResultPreview.simple-mode #grpInfo{color:#ffe0a2;font-weight:750;font-size:15px;line-height:1.7}',
    '#godResultPreview.simple-mode #grpStatus{font-weight:700;color:#ffdfa2;font-size:14px;line-height:1.6}',
    '#godResultPreview.simple-mode .sheet{gap:15px}',
    '#godResultPreview.simple-mode .canvas{min-height:260px}',
    '#godResultPreview.simple-mode .canvas img{max-height:55vh;object-fit:contain}',
    '#godResultPreview.simple-mode .sheet > .actions,#godResultPreview.simple-mode .sheet > .folder-help,#godResultPreview.simple-mode .sheet > .meta:not(#grpInfo):not(#grpStatus),#godResultPreview.simple-mode #grpMatchesTitle,#godResultPreview.simple-mode #grpMatches{display:none!important}',
    '#godResultPreview #grpQuickActions[hidden]{display:none!important}',
    '#godResultPreview #grpQuickActions{display:flex;gap:10px;flex-wrap:wrap;align-items:center}',
    '#godResultPreview #grpQuickChoose{background:linear-gradient(105deg,#f4d691,#eeb35e);border-color:#ffe3aa;color:#182d3c;font-size:clamp(17px,2vw,21px);font-weight:850;min-height:63px;padding:14px 24px;flex:1;border-radius:12px}',
    '#godResultPreview.simple-mode .sheet{gap:15px}',
    '#godResultPreview.simple-mode .canvas{min-height:330px;max-height:69vh}',
    '#godResultPreview.simple-mode .title b{font-size:clamp(18px,2vw,23px)}',
    '#godResultPreview.simple-mode #grpStatus{color:#e3eff8;font-size:14px;line-height:1.65}',
    '#godResultPreview.simple-mode #grpInfo{color:#ffdfaa;font-size:14px;line-height:1.6}',
    '#godResultPreview #grpVerifiedFiles[hidden]{display:none!important}',
    '#godResultPreview #grpVerifiedFiles{display:flex;gap:8px;align-items:center;flex-wrap:wrap;border:1px solid #597d93;border-radius:9px;padding:10px;background:#0b2839}',
    '#godResultPreview #grpVerifiedFiles button{background:#244e60;border-color:#90b6c8;color:#f7fbff;padding:10px 12px;overflow-wrap:anywhere;max-width:100%}',
    '#godResultPreview #grpVerifiedFiles button[aria-pressed=true]{background:#e8b866;color:#142d3c;border-color:#f9deab}',
    '#godResultPreview #grpVerifiedFiles .verified-count{color:#fee3b3;font-size:12px;font-weight:750}',
    '#godResultPreview.simple-mode #grpQuickChoose{min-width:200px}',
    '#godResultPreview.simple-mode #grpVerifiedFiles{max-height:150px;overflow-y:auto}',
  ].join("\n");
  document.head.appendChild(css);
  const modal=document.createElement("div");modal.id="godResultPreview";modal.hidden=true;
  modal.innerHTML=[
    '<div class="sheet" role="dialog" aria-modal="true" aria-label="강사 전용 제출 결과물 보기">',
    '<div class="title"><b id="grpTitle">제출 결과물 보기</b><button id="grpClose" type="button">닫기 ✕</button></div>',
    '<div class="meta" id="grpInfo"></div>',
    '<div id="grpQuickActions" hidden><button id="grpQuickChoose" type="button">📂 이 참석자의 파일 선택해서 바로 보기</button></div>',
    '<div id="grpVerifiedFiles" hidden aria-label="이 참석자에게 확인된 제출 파일"></div>',
    '<div class="meta" id="grpLinkIntro">파일의 MEGA 개별 공유 링크가 있으면 아래에 입력할 수 있습니다.</div>',
    '<div class="actions"><button type="button" class="primary-local" id="grpSecurePick" hidden>↗ MEGA 보관함에서 제출물 찾기</button><button type="button" id="grpLocalPick" hidden>📂 맥북 동기화 폴더에서 파일 선택 · 바로 보기</button><button type="button" id="grpClearPicked" hidden>파일 연결 해제</button><button type="button" class="primary-local" id="grpFolder">📁 제출물 보관 폴더 연결</button><button type="button" id="grpFolderRetry">↻ 연결된 폴더에서 찾기</button></div>',
    '<div class="folder-help" id="grpMegaInstructions" hidden>MEGA 보관함에서 해당 참석자의 파일을 확인하고 <b>개별 파일의 링크 가져오기</b>를 선택하세요. 복사한 링크를 아래에 붙여넣고 “링크 연결 · 미리보기”를 누르면 GOD119에서 열기를 시도합니다. 개별 링크는 가진 사람이 접근할 수 있으니 외부에 공유하지 마세요. MEGA 제출 요청 주소는 파일 미리보기 주소가 아닙니다.</div>',
    '<div class="actions" id="grpLinkRow"><input type="url" id="grpUrl" autocomplete="off" aria-label="MEGA 개별 파일 링크" placeholder="https://mega.nz/file/...#..."><button id="grpSave" type="button">링크 연결 · 미리보기</button><button id="grpDelete" type="button">저장 링크 해제</button></div>',
    '<div class="folder-help" id="grpFolderHelp">간편 제출은 파일 식별값이 없으므로 자동 검색할 수 없습니다. 해당 참석자의 파일을 강사가 직접 확인한 뒤에만 연결합니다. 다른 참석자의 파일 목록은 보여 주지 않습니다.</div>',
    '<div class="actions"><label>개별 파일 직접 선택 <input id="grpFile" type="file" accept=".pdf,.docx,.png,.jpg,.jpeg,.webp,.gif,.txt,.md,.csv,.mp4,.webm"></label><button id="grpMega" type="button">MEGA 파일 보관함 열기 ↗</button></div>',
    '<div class="meta" id="grpStatus" role="status">선택한 파일이나 개별 공유 링크만 표시합니다.</div>',
    '<div class="matchesTitle" id="grpMatchesTitle" hidden>찾은 파일을 선택해 주세요</div>',
    '<div class="matches" id="grpMatches" hidden aria-label="제출 결과물 후보 목록"></div>',
    '<div class="canvas" id="grpCanvas"><p>해당 제출물 파일을 연결하면 여기에서 볼 수 있습니다.</p></div>',
    '<div class="meta">MEGA 원본 파일은 그대로 보관됩니다. 간편 제출은 강사가 명확하게 지정한 파일만 표시합니다. 파일 연결은 이 컴퓨터의 현재 브라우저에만 저장되며 다른 서버로 전송되지 않습니다. 내용 식별값이 없는 파일은 자동으로 제출자와 연결하지 않습니다.</div>',
    '</div>'
  ].join("");
  document.body.appendChild(modal);
  const el=id=>modal.querySelector("#"+id);
  let current=null,rev=0,objectUrl=null,remoteViewer=null;
  let directoryHandle=null,folderLookupToken=0;
  const fingerprintCache=new Map();
  const folderStore="god119-private-result-folder-v1";
  function dbConnect(){
    return new Promise((resolve,reject)=>{
      if(!("indexedDB" in window)){reject(Error("INDEXEDDB_UNAVAILABLE"));return}
      const req=indexedDB.open(folderStore,1);
      req.onupgradeneeded=()=>req.result.createObjectStore("prefs");
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error);
    });
  }
  async function getStoredFolder(){
    const db=await dbConnect();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction("prefs","readonly"),req=tx.objectStore("prefs").get("folder");
      req.onsuccess=()=>resolve(req.result||null);
      req.onerror=()=>reject(req.error);
      tx.oncomplete=()=>db.close();
      tx.onerror=()=>db.close();
    });
  }
  async function saveFolder(handle){
    const db=await dbConnect();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction("prefs","readwrite");
      tx.objectStore("prefs").put(handle,"folder");
      tx.oncomplete=()=>{db.close();resolve()};
      tx.onerror=()=>{db.close();reject(tx.error)};
    });
  }
  // Compare original MEGA filenames and parent folder names without sending them anywhere.
  const normalizeFileName=n=>String(n||"").normalize("NFC").toLowerCase().replace(/\s+/g," ").trim();
  const fileStem=n=>normalizeFileName(n).replace(/\.[^.]+$/,"");
  const allowedExt=/\.(pdf|docx|png|jpe?g|webp|gif|txt|md|csv|mp4|webm)$/i;
  function belongsToName(filename,person){
    const stem=fileStem(filename),name=normalizeFileName(person).replace(/\s+/g,"");
    if(!name||name.length<2||!allowedExt.test(filename)||!stem.startsWith(name))return false;
    const suffix=stem.slice(name.length);
    // Prevent matching a different person whose name merely starts similarly.
    return suffix===""||/^[0-9_-]/.test(suffix)||/^\s*\(/.test(suffix);
  }
  // Only presenter-confirmed FileSystemFileHandle values may be used for simplified
  // submissions. Old "chosen:" handles are intentionally ignored: they could have
  // been selected from the cross-attendee recent-file candidate list.
  const verifiedKey=key=>"verified-choice-v2:"+key;
  async function saveVerifiedFile(key,handle){
    const localDb=await dbConnect();
    try{
      await new Promise((resolve,reject)=>{
        const tx=localDb.transaction("prefs","readwrite");
        tx.objectStore("prefs").put(handle,verifiedKey(key));
        tx.oncomplete=()=>resolve();
        tx.onerror=()=>reject(tx.error);
      });
    }finally{localDb.close()}
  }
  async function getVerifiedFile(key){
    try{
      const localDb=await dbConnect();
      try{
        return await new Promise((resolve,reject)=>{
          const tx=localDb.transaction("prefs","readonly");
          const req=tx.objectStore("prefs").get(verifiedKey(key));
          req.onsuccess=()=>resolve(req.result||null);
          req.onerror=()=>reject(req.error);
        });
      }finally{localDb.close()}
    }catch(_){return null}
  }
  async function clearVerifiedFile(key){
    try{
      const localDb=await dbConnect();
      try{
        await new Promise((resolve,reject)=>{
          const tx=localDb.transaction("prefs","readwrite");
          tx.objectStore("prefs").delete(verifiedKey(key));
          tx.oncomplete=()=>resolve();
          tx.onerror=()=>reject(tx.error);
        });
      }finally{localDb.close()}
    }catch(_){}
  }
  // The file list is keyed to the authenticated participant UID, not a report
  // timestamp: a later submission must not hide earlier verified files.
  const verifiedListKey=uid=>"verified-files-v3:"+uid;
  async function readVerifiedList(uid){
    if(!uid)return [];
    try{
      const db=await dbConnect();
      try{
        const found=await new Promise((resolve,reject)=>{
          const tx=db.transaction("prefs","readonly");
          const req=tx.objectStore("prefs").get(verifiedListKey(uid));
          req.onsuccess=()=>resolve(req.result||[]);
          req.onerror=()=>reject(req.error);
        });
        return Array.isArray(found)?found.filter(x=>x&&x.handle&&x.handle.kind==="file").slice(0,40):[];
      }finally{db.close()}
    }catch(_){return []}
  }
  async function writeVerifiedList(uid,items){
    if(!uid)throw Error("MISSING_PARTICIPANT");
    const db=await dbConnect();
    try{
      await new Promise((resolve,reject)=>{
        const tx=db.transaction("prefs","readwrite");
        tx.objectStore("prefs").put(items.slice(0,40),verifiedListKey(uid));
        tx.oncomplete=()=>resolve();
        tx.onerror=()=>reject(tx.error);
      });
    }finally{db.close()}
  }
  async function addVerifiedList(uid,picks){
    const existing=await readVerifiedList(uid);
    for(const handle of picks){
      let repeated=false;
      for(const item of existing){
        try{if(typeof handle.isSameEntry==="function"&&await handle.isSameEntry(item.handle)){repeated=true;break}}catch(_){}
      }
      if(!repeated)existing.push({handle,name:handle.name,addedAt:Date.now()});
    }
    await writeVerifiedList(uid,existing);
    return existing;
  }
  // Preserve earlier *manually confirmed* v2 files even if the participant
  // submitted another report and its timestamp changed. Never migrate old
  // name/timestamp guesses or the previously unsafe "chosen:" candidates.
  async function migrateLegacyVerifiedFiles(uid){
    if(!uid)return [];
    let found=[];
    try{
      const db=await dbConnect();
      try{
        const pairs=await new Promise((resolve,reject)=>{
          const tx=db.transaction("prefs","readonly"),store=tx.objectStore("prefs");
          const kr=store.getAllKeys(),vr=store.getAll();
          let keys,values;
          kr.onsuccess=()=>{keys=kr.result;if(values)resolve({keys,values})};
          vr.onsuccess=()=>{values=vr.result;if(keys)resolve({keys,values})};
          kr.onerror=()=>reject(kr.error);vr.onerror=()=>reject(vr.error);
        });
        const prefix="verified-choice-v2:"+uid+"|";
        found=pairs.keys.map((key,i)=>({key,handle:pairs.values[i]}))
          .filter(x=>typeof x.key==="string"&&x.key.startsWith(prefix)&&x.handle?.kind==="file")
          .slice(0,40).map(x=>({handle:x.handle,name:x.handle.name,addedAt:0}));
      }finally{db.close()}
    }catch(_){return []}
    if(!found.length)return [];
    const unique=[];
    for(const item of found){
      let repeat=false;
      for(const e of unique){
        try{if(await item.handle.isSameEntry(e.handle)){repeat=true;break}}catch(_){}
      }
      if(!repeat)unique.push(item);
    }
    try{await writeVerifiedList(uid,unique)}catch(_){}
    return unique;
  }
  function renderVerifiedList(items,token,key){
    const pane=el("grpVerifiedFiles");pane.replaceChildren();
    pane.hidden=!items.length;
    if(!items.length)return;
    const count=document.createElement("span");count.className="verified-count";
    count.textContent="확인된 파일 "+items.length+"개";
    pane.append(count);
    for(const item of items){
      const button=document.createElement("button");
      button.type="button";button.textContent="📄 "+String(item.name||item.handle.name||"이름 없는 파일").slice(0,100);
      button.title="이 참석자에게 직접 연결한 파일만 열기";
      button.onclick=async()=>{
        if(token!==folderLookupToken||!current||current.key!==key)return;
        try{
          let permission=typeof item.handle.queryPermission==="function"?
            await item.handle.queryPermission({mode:"read"}):"granted";
          if(permission!=="granted"&&typeof item.handle.requestPermission==="function")
            permission=await item.handle.requestPermission({mode:"read"});
          if(permission!=="granted"){status("파일 열기 권한을 허용해 주세요. 권한이 없으면 아래 버튼으로 다시 선택할 수 있습니다.");return}
          await showFolderFile({handle:item.handle,name:item.name||item.handle.name},token,key);
          if(token!==folderLookupToken||!current||current.key!==key)return;
          for(const b of pane.querySelectorAll("button"))b.setAttribute("aria-pressed",String(b===button));
        }catch(_){status("이 파일을 다시 열 수 없습니다. MEGA 동기화 여부와 브라우저의 파일 접근 권한을 확인해 주세요.")}
      };
      button.setAttribute("aria-pressed","false");
      pane.append(button);
    }
  }
  // New submissions are linked by file bytes and size, not by user-editable names.
  // MEGA may append an upload-session ID to filenames without changing contents.
  async function findByFileContent(handle,reported,token,key,maxFiles=3000){
    const {fingerprintFile}=await import("./submission-file-fingerprint.js?v=2");
    const wanted=reported.filter(f=>f&&Number.isFinite(f.size)&&f.size>=0&&
      typeof f.hash==="string"&&/^(?:[a-f0-9]{18}|[a-f0-9]{64})$/i.test(f.hash)&&
      ["full-sha256-v1","sample-sha256-v1"].includes(f.method));
    const sizes=new Set(wanted.map(f=>f.size));
    const folders=[{handle,depth:0,path:""}],matches=[],seenFiles=new Set();
    let count=0,hashed=0,partial=false;
    while(folders.length){
      const item=folders.shift();
      for await(const entry of item.handle.values()){
        if(token!==folderLookupToken||!current||current.key!==key)
          return {matches:[],partial:false,cancelled:true,hashed};
        if(++count>maxFiles){partial=true;break}
        if(entry.kind==="directory"){
          if(item.depth<4&&folders.length<100)
            folders.push({handle:entry,depth:item.depth+1,path:item.path+"/"+entry.name});
          continue;
        }
        if(entry.kind!=="file")continue;
        let file;
        try{file=await entry.getFile()}catch(_){continue}
        if(!sizes.has(file.size))continue;
        const candidates=wanted.filter(f=>f.size===file.size);
        const modes=[...new Set(candidates.map(f=>f.method))];
        for(const mode of modes){
          const cacheKey=item.path+"/"+entry.name+"|"+file.size+"|"+file.lastModified+"|"+mode;
          let hash=fingerprintCache.get(cacheKey);
          if(!hash){
            try{hash=(await fingerprintFile(file,mode)).hash}catch(_){continue}
            fingerprintCache.set(cacheKey,hash);
            if(fingerprintCache.size>3000)fingerprintCache.delete(fingerprintCache.keys().next().value);
          }
          hashed++;
          const matchingOriginals=candidates.filter(f=>f.method===mode&&hash.startsWith(f.hash));
          if(!matchingOriginals.length)continue;
          const id=item.path+"/"+entry.name;
          if(seenFiles.has(id))continue;
          seenFiles.add(id);
          matches.push({
            handle:entry,
            name:entry.name,
            original:matchingOriginals.map(f=>f.name||"이름 없는 파일").join(", ")
          });
        }
        if(hashed%12===0&&hashed>0)
          status("MEGA 폴더에서 파일 내용 비교 중… "+hashed+"개 확인");
      }
      if(partial)break;
    }
    matches.sort((a,b)=>a.original.localeCompare(b.original,"ko",{numeric:true})||
      a.name.localeCompare(b.name,"ko",{numeric:true}));
    return {matches:matches.slice(0,80),partial,hashed};
  }
  function clearMatches(){
    const pane=el("grpMatches");pane.replaceChildren();pane.hidden=true;
    el("grpMatchesTitle").hidden=true;
  }
  async function showFolderFile(entry,token,key){
    if(token!==folderLookupToken||!current||current.key!==key)return;
    try{
      const file=await entry.handle.getFile();
      if(token!==folderLookupToken||!current||current.key!==key)return;
      if(file.size>100*1024*1024&&!/\.(mp4|webm)$/i.test(file.name)){
        status("100MB를 넘는 문서는 MEGA 폴더에서 직접 열어 주세요.");return
      }
      cleanup();renderBlob(file,file.name,rev);
      status("✓ "+entry.name+" · 선택한 파일을 이 화면에서 열었습니다.");
    }catch(e){status("파일을 열 수 없습니다. 동기화 상태와 브라우저 폴더 권한을 확인해 주세요.")}
  }
  function showMatches(entries,token,key){
    const pane=el("grpMatches");pane.replaceChildren();pane.hidden=!entries.length;
    el("grpMatchesTitle").hidden=!entries.length;
    el("grpMatchesTitle").textContent="파일 내용 식별값으로 일치한 결과물";
    for(const entry of entries){
      const button=document.createElement("button");button.type="button";
      button.textContent="📄 "+(entry.original?entry.original+" · MEGA 저장: ":"")+entry.name;
      button.title="파일 식별값이 일치한 결과물 확인";
      button.onclick=()=>showFolderFile(entry,token,key);pane.append(button);
    }
  }
  async function previewFromFolder(token,requestPermission=false){
    if(!current)return;
    const report=current.report,matchingKey=current.key;
    const contentIds=(Array.isArray(report.files)&&report.files.length?report.files:unpackFileFingerprints(report.fileName))
      .filter(f=>f&&typeof f.hash==="string"&&Number.isFinite(f.size));
    if(!contentIds.length){
      // Fail closed: no content identity means no automatic file search.
      // Names, timestamps and old saved choices do not prove ownership.
      clearMatches();
      let files=await readVerifiedList(current.uid);
      if(!files.length)files=await migrateLegacyVerifiedFiles(current.uid);
      // Read only explicitly presenter-confirmed previous file selection.
      // Old unverified search candidates ("chosen:") remain excluded.
      if(!files.length){
        const old=await getVerifiedFile(matchingKey);
        if(old&&old.kind==="file"){
          files=[{handle:old,name:old.name,addedAt:Date.now()}];
          try{await writeVerifiedList(current.uid,files)}catch(_){}
        }
      }
      if(token!==folderLookupToken||!current||current.key!==matchingKey)return;
      renderVerifiedList(files,token,matchingKey);
      el("grpQuickChoose").textContent=files.length?"➕ 이 참석자의 새 파일 추가":"📂 "+safe(report.name)+"님의 파일 선택 · 바로 보기";
      if(files.length){
        const latest=files[files.length-1];
        try{
          const permission=typeof latest.handle.queryPermission==="function"?
            await latest.handle.queryPermission({mode:"read"}):"granted";
          if(permission==="granted"){
            await showFolderFile({handle:latest.handle,name:latest.name},token,matchingKey);
            if(token!==folderLookupToken||!current||current.key!==matchingKey)return;
            const buttons=el("grpVerifiedFiles").querySelectorAll("button");
            if(buttons.length)buttons[buttons.length-1].setAttribute("aria-pressed","true");
            status("✓ 저장된 제출 파일 "+files.length+"개 · 위 파일 목록에서 다른 결과물도 바로 열 수 있습니다.");
            return;
          }
        }catch(_){}
        cleanup();
        const note=document.createElement("p");
        note.textContent="확인된 파일 "+files.length+"개가 위에 있습니다. 파일 이름을 클릭해 브라우저 접근을 허용하면 열립니다.";
        el("grpCanvas").append(note);
        status("이 참석자의 연결 파일은 그대로 보관되어 있습니다. 파일 이름을 눌러 보거나 새로운 파일을 추가해 주세요.");
        return;
      }
      cleanup();
      const p=document.createElement("p");
      p.textContent="아직 미리볼 파일이 연결되지 않았습니다. 위의 노란 버튼으로 해당 참석자의 파일을 선택하면 이곳에서 바로 확인할 수 있습니다.";
      el("grpCanvas").append(p);
      status("수신 확인 여부와 관계없이 파일을 열 수 있습니다. 처음 한 번 파일을 지정해 주세요.");
      return;
    }
    if(!directoryHandle)try{directoryHandle=await getStoredFolder()}catch(_){}
    if(token!==folderLookupToken||!current||current.key!==matchingKey)return;
    if(!directoryHandle){
      status("제출물 보관 폴더를 연결하면 결과물 보기에서 바로 확인할 수 있습니다.");
      return;
    }
    try{
      let permission=await directoryHandle.queryPermission({mode:"read"});
      if(permission!=="granted"&&requestPermission)
        permission=await directoryHandle.requestPermission({mode:"read"});
      if(permission!=="granted"){
        status("폴더 접근을 허용하려면 ‘제출물 보관 폴더 연결’을 다시 눌러 주세요.");
        return;
      }
      const fileManifest=(Array.isArray(report.files)&&report.files.length?report.files:unpackFileFingerprints(report.fileName)).filter(f=>f&&f.hash&&Number.isFinite(f.size));
      if(fileManifest.length){
        status("연결된 MEGA 폴더에서 제출 파일의 내용으로 찾는 중…");
        const {matches,partial,cancelled}=await findByFileContent(directoryHandle,fileManifest,token,matchingKey);
        if(cancelled||token!==folderLookupToken||!current||current.key!==matchingKey)return;
        showMatches(matches,token,matchingKey);
        if(!matches.length){
          status("선택한 파일과 내용이 같은 파일을 MEGA 동기화 폴더에서 찾지 못했습니다."+
            (partial?" 검색 대상 3000개 초과.":"")+
            " MEGA에서 같은 파일을 업로드했는지와 Mac 동기화 상태를 확인해 주세요.");
          return;
        }
        if(matches.length===1&&fileManifest.length===1){
          await showFolderFile(matches[0],token,matchingKey);
          status("✓ 파일 내용 일치 · "+matches[0].original+" → "+matches[0].name);
        }else{
          cleanup();
          const info=document.createElement("p");
          info.textContent="파일 내용으로 "+matches.length+"개 결과물을 찾았습니다. 위에서 열 파일을 선택해 주세요."+
            (matches.length<fileManifest.length?" 아직 동기화되지 않은 파일이 있을 수 있습니다.":"")+
            (matches.length>fileManifest.length?" 동일한 파일 내용의 중복 제출 가능성이 있습니다.":"");
          el("grpCanvas").append(info);
          status("✓ 계정별 파일 내용 식별 검색 · "+matches.length+"개 발견 / "+fileManifest.length+"개 신고. 같은 내용을 중복 제출했다면 강사 확인이 필요합니다.");
        }
        return;
      }
    }catch(e){
      if(token!==folderLookupToken)return;
      status("제출물 폴더를 읽지 못했습니다. 폴더 접근 권한과 파일명을 확인해 주세요.");
    }
  }
  el("grpFolder").onclick=async()=>{
    if(!window.showDirectoryPicker){status("이 브라우저에서는 폴더 자동 연결을 지원하지 않습니다. 최신 Chrome 또는 Edge에서 열어 주세요.");return}
    try{
      const picked=await window.showDirectoryPicker({mode:"read",id:"god119-submissions"});
      directoryHandle=picked;fingerprintCache.clear();await saveFolder(picked);
      el("grpFolderHelp").textContent="연결된 폴더: "+picked.name+" · 이 컴퓨터에서만 읽습니다. 파일은 업로드되지 않습니다.";
      await previewFromFolder(++folderLookupToken,true);
    }catch(e){if(e?.name!=="AbortError")status("폴더 연결에 실패했습니다. 브라우저 권한을 확인해 주세요.")}
  };
  el("grpFolderRetry").onclick=()=>previewFromFolder(++folderLookupToken,true);
  el("grpSecurePick").onclick=()=>{
    if(!current)return;
    window.open("https://mega.nz/fm","_blank","noopener,noreferrer");
    status("MEGA 보관함에서 이 참석자의 파일을 찾은 뒤, 개별 파일 공유 링크를 복사해 아래 입력창에 붙여넣으세요. 제출 요청 링크는 사용하지 않습니다.");
  };
  async function chooseVerifiedFile(){
    const selected=current;
    if(!selected||((Array.isArray(selected.report.files)&&selected.report.files.length?selected.report.files:unpackFileFingerprints(selected.report.fileName)).some(f=>f&&typeof f.hash==="string"&&Number.isFinite(f.size))))return;
    const token=folderLookupToken,key=selected.key,uid=selected.uid;
    if(typeof window.showOpenFilePicker!=="function"){
      status("브라우저 파일 접근이 제한되어 일반 선택창을 엽니다. 임시 미리보기는 가능하지만 다음에 다시 선택해야 할 수 있습니다.");
      el("grpFile").click();return;
    }
    try{
      const picks=await window.showOpenFilePicker({id:"god119-verified-file-v3",multiple:true});
      if(token!==folderLookupToken||!current||current.key!==key)return;
      const accepted=[];
      for(const handle of (picks||[]).slice(0,40)){
        try{
          const file=await handle.getFile();
          if(allowedExt.test(file.name)&&file.size<=100*1024*1024)accepted.push({handle,name:file.name});
        }catch(_){}
      }
      if(!accepted.length){status("지원되는 이미지·PDF 등 100MB 이하 파일을 선택해 주세요.");return}
      const who=String(selected.report.name||"참석자").slice(0,35);
      const fileNames=accepted.map(x=>x.name).join(", ").slice(0,230);
      if(!window.confirm("“"+who+"”님의 실제 제출 파일 "+accepted.length+"개가 맞습니까?\n"+fileNames+"\n다른 참석자 자료가 섞이지 않았는지 확인해 주세요."))return;
      await showFolderFile(accepted[accepted.length-1],token,key);
      if(token!==folderLookupToken||!current||current.key!==key)return;
      try{
        const files=await addVerifiedList(uid,accepted.map(x=>x.handle));
        if(token!==folderLookupToken||!current||current.key!==key)return;
        renderVerifiedList(files,token,key);
        const buttons=el("grpVerifiedFiles").querySelectorAll("button");
        if(buttons.length)buttons[buttons.length-1].setAttribute("aria-pressed","true");
        el("grpQuickChoose").textContent="➕ 이 참석자의 새 파일 추가";
        status("✓ "+who+"님 파일 "+files.length+"개 연결됨 · 위 목록에서 각 파일을 클릭해 미리볼 수 있습니다.");
      }catch(_){
        status("✓ 선택한 파일은 미리보기로 열었습니다. 브라우저 저장이 제한되어 다음에는 다시 선택해야 할 수 있습니다.");
      }
    }catch(e){if(e?.name!=="AbortError")status("선택한 파일을 열지 못했습니다. MEGA 동기화 상태와 파일 접근 권한을 확인해 주세요.")}
  }
  el("grpLocalPick").onclick=chooseVerifiedFile;
  el("grpQuickChoose").onclick=chooseVerifiedFile;
  el("grpClearPicked").onclick=async()=>{
    if(!current)return;
    const key=current.key;
    await clearVerifiedFile(key);
    if(!current||current.key!==key)return;
    el("grpClearPicked").hidden=true;
    el("grpQuickChoose").textContent="📂 이 참석자의 파일 선택해서 바로 보기";
    cleanup();clearMatches();
    const p=document.createElement("p");p.textContent="이 참석자의 파일 연결을 해제했습니다. 올바른 파일을 다시 연결해 주세요.";
    el("grpCanvas").append(p);status("연결 해제 완료");
  };

  const safe=v=>String(v??"").slice(0,160);
  const fileKey=(id,r)=>id+"|"+String(r.at||"")+"|"+String(r.fileName||"");
  function validate(url){
    try{
      const u=new URL(url.trim());
      if(u.protocol!=="https:"||!["mega.nz","www.mega.nz"].includes(u.hostname.toLowerCase())||u.username||u.password)return null;
      if(!/^\/file\/[A-Za-z0-9_-]{6,}\/?$/.test(u.pathname)||!/^#[A-Za-z0-9_-]{10,}$/.test(u.hash))return null;
      return u.href;
    }catch(_){return null}
  }
  function cleanup(){
    rev++;
    if(remoteViewer){remoteViewer.reset();remoteViewer=null}
    if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null}
    el("grpCanvas").replaceChildren();
  }
  function close(){folderLookupToken++;cleanup();clearMatches();current=null;modal.hidden=true}
  el("grpClose").onclick=close;
  modal.addEventListener("click",e=>{if(e.target===modal)close()});
  function status(message){el("grpStatus").textContent=message}
  function renderBlob(blob,name,run){
    if(run!==rev)return;
    const lower=name.toLowerCase();
    const box=el("grpCanvas");box.replaceChildren();
    if(objectUrl)URL.revokeObjectURL(objectUrl);
    objectUrl=URL.createObjectURL(blob);
    let node;
    if(/\.pdf$/i.test(lower)||blob.type==="application/pdf"){
      node=document.createElement("iframe");node.title="제출 PDF";node.src=objectUrl+"#view=FitH";
    }else if(/\.(png|jpe?g|webp|gif)$/i.test(lower)||blob.type.startsWith("image/")){
      node=document.createElement("img");node.src=objectUrl;node.alt="제출 이미지";
    }else if(/\.(mp4|webm)$/i.test(lower)||blob.type.startsWith("video/")){
      node=document.createElement("video");node.controls=true;node.playsInline=true;node.src=objectUrl;
    }else if(/\.(txt|md|csv)$/i.test(lower)||blob.type.startsWith("text/")){
      blob.text().then(t=>{if(run===rev){const pre=document.createElement("pre");pre.textContent=t.slice(0,200000);box.replaceChildren(pre)}});status("텍스트 파일 표시 완료");return;
    }else{
      node=document.createElement("p");
      node.textContent="이 문서 형식은 브라우저 안에서 바로 미리보기를 지원하지 않습니다. ";
      const download=document.createElement("a");
      download.href=objectUrl;download.download=name;
      download.textContent="📥 원본 파일 내려받아 열기";
      download.style.cssText="display:inline-block;background:#1d5b70;color:#fff;padding:9px 12px;border-radius:8px;margin-left:6px;text-decoration:none;font-weight:800";
      node.append(download);
    }
    box.appendChild(node);status("파일 표시 완료");
  }
  async function loadLink(url){
    cleanup();const run=rev;
    status("MEGA 파일 정보를 확인하는 중…");
    try{
      const mod=await import("https://unpkg.com/megajs@1.3.1/dist/main.browser-es.mjs");
      if(run!==rev)return;
      const file=mod.File.fromURL(url);file.api.userAgent=null;
      await file.loadAttributes();
      if(run!==rev)return;
      if(!Number.isFinite(file.size)||file.size>100*1024*1024)throw Error("영상 또는 파일 크기가 100MB를 초과합니다.");
      const name=file.name||current?.report.fileName||"result";
      if(/\.docx$/i.test(name)){
        const viewer=await import("./mega-document-viewer.js?v=result-preview-20261105");
        if(run!==rev)return;
        remoteViewer=viewer.createMegaDocumentViewer({status:el("grpStatus"),viewport:el("grpCanvas"),documentName:name});
        remoteViewer.show(url,current.key);return;
      }
      if(/\.(mp4|webm)$/i.test(name)){
        // Use MEGA's iframe player to avoid downloading the entire clip first.
        const u=new URL(url),id=u.pathname.split("/")[2];
        const iframe=document.createElement("iframe");
        iframe.title="제출된 동영상";iframe.allow="autoplay; fullscreen; picture-in-picture";iframe.allowFullscreen=true;
        iframe.src="https://mega.nz/embed/"+id+u.hash;
        el("grpCanvas").replaceChildren(iframe);status("MEGA 개별 영상 플레이어를 표시했습니다.");return;
      }
      const data=await file.downloadBuffer();
      if(run!==rev)return;
      const mime=/\.pdf$/i.test(name)?"application/pdf":/\.(png|jpe?g|webp|gif)$/i.test(name)?"image/png":"text/plain";
      renderBlob(new Blob([data],{type:mime}),name,run);
    }catch(e){if(run!==rev)return;status("파일을 열지 못했습니다. MEGA 링크·네트워크·파일 형식을 확인해 주세요.");const p=document.createElement("p");p.textContent="결과물 미리보기에 실패했습니다.";el("grpCanvas").replaceChildren(p)}
  }
  function open(id,report){
    folderLookupToken++;
    cleanup();clearMatches();
    const key=fileKey(id,report);current={key,report,uid:id};
    el("grpTitle").textContent=safe(report.name)+" · 제출 결과물";
    const displayFiles=Array.isArray(report.files)&&report.files.length?report.files:unpackFileFingerprints(report.fileName);
    const simple=!displayFiles.some(f=>f&&typeof f.hash==="string"&&Number.isFinite(f.size));
    el("grpInfo").textContent=displayFiles.length&&!simple?
      "신고된 제출물 "+displayFiles.length+"개 · 내용이 일치하는 파일을 검색합니다":
      simple?"제출 신고 접수 · 이 참석자의 결과물을 확인합니다.":"제출 파일 정보: "+safe(report.fileName);
    modal.classList.toggle("simple-mode",simple);
    el("grpQuickActions").hidden=!simple;
    el("grpQuickChoose").textContent="📂 "+safe(report.name)+"님의 파일 선택 · 바로 보기";
    el("grpVerifiedFiles").hidden=true;
    el("grpVerifiedFiles").replaceChildren();
    el("grpSecurePick").hidden=!simple;
    el("grpLocalPick").hidden=!simple;
    el("grpMegaInstructions").hidden=!simple;
    el("grpLinkIntro").hidden=simple;
    el("grpClearPicked").hidden=true;
    if(simple){
      el("grpSecurePick").textContent="↗ MEGA 보관함에서 "+safe(report.name)+"님의 파일 찾기";
      el("grpLocalPick").textContent="📂 맥북 동기화 폴더에서 파일 선택 · 바로 보기";
    }
    el("grpFolder").hidden=simple;
    el("grpFolderRetry").hidden=simple;
    el("grpFolderHelp").textContent=simple?
      "개인정보 보호: 다른 참석자 파일을 포함한 자동 검색은 차단되었습니다. MEGA에서 제출자와 파일을 확인한 뒤 해당 파일 하나만 연결하세요.":
      "내용 식별값이 있는 기존 제출물에 한하여 연결된 폴더에서 일치하는 파일을 찾습니다. 파일은 외부로 전송되지 않습니다.";
    el("grpFile").value="";
    el("grpUrl").value=links[key]||"";
    modal.hidden=false;
    if(!simple&&links[key]&&!displayFiles.length)loadLink(links[key]);
    else {
      const p=document.createElement("p");p.textContent=simple?
        "아직 연결된 이미지가 없습니다. 노란색 버튼으로 해당 참석자의 파일을 처음 한 번만 선택하면 여기에서 바로 미리볼 수 있습니다.":
        "연결된 보관 폴더에서 파일 식별값을 확인 중입니다.";el("grpCanvas").appendChild(p);
      status(simple?"참석자별 파일이 섞이지 않도록 최초 한 번 정확한 파일을 선택해 주세요.":"연결된 보관 폴더 검색 중…");
      previewFromFolder(folderLookupToken);
    }
  }
  el("grpSave").onclick=()=>{
    if(!current)return;
    const url=validate(el("grpUrl").value);
    if(!url){status("MEGA에서 복사한 개별 파일 링크(https://mega.nz/file/...#...)를 입력해 주세요. 파일 제출 요청이나 보관함 주소는 미리보기에 사용할 수 없습니다.");return}
    if(!window.confirm("이 링크가 “"+String(current.report.name||"해당 참석자").slice(0,35)+"”님의 실제 제출 파일이 맞습니까? 다른 참석자 자료가 섞이지 않도록 확인해 주세요."))return;
    links[current.key]=url;
    try{localStorage.setItem(storeKey,JSON.stringify(links))}catch(_){status("연결 링크를 이 브라우저에 저장하지 못했습니다. 현재는 미리보기를 시도합니다.")}
    loadLink(url);
  };
  el("grpFile").onchange=()=>{
    const file=el("grpFile").files?.[0];if(!file)return;
    if(file.size>100*1024*1024){status("100MB 이하의 파일을 선택해 주세요.");return}

    if(current&&!((Array.isArray(current.report.files)&&current.report.files.length?current.report.files:unpackFileFingerprints(current.report.fileName)).some(f=>f&&typeof f.hash==="string"&&Number.isFinite(f.size)))){
      const who=String(current.report.name||"참석자").slice(0,35);
      if(!window.confirm("“"+file.name+"” 파일이 “"+who+"”님의 제출물이 맞습니까?"))return;
    }
    cleanup();renderBlob(file,file.name,rev);
    status("직접 선택한 파일을 임시로 표시합니다. 다시 열 때 자동 연결하려면 위 ‘이 참석자의 파일 직접 연결’을 이용하세요.");
  };
  el("grpMega").onclick=()=>window.open("https://mega.nz/fm","_blank","noopener,noreferrer");
  el("grpDelete").onclick=()=>{if(!current)return;delete links[current.key];try{localStorage.setItem(storeKey,JSON.stringify(links))}catch(_){}el("grpUrl").value="";cleanup();status("저장된 개별 파일 링크를 지웠습니다.")};
  return {open};
}
