import {unpackFileFingerprints} from "./submission-file-fingerprint.js?v=2";
// Instructor-only submission preview. Simple MEGA reports do not contain file hashes;
// instructors can verify MEGA uploads or attach a private individual share URL.
export function createResultPreview(){
  const storeKey="god119-private-submission-links-v1";
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
  ].join("\n");
  document.head.appendChild(css);
  const modal=document.createElement("div");modal.id="godResultPreview";modal.hidden=true;
  modal.innerHTML=[
    '<div class="sheet" role="dialog" aria-modal="true" aria-label="강사 전용 제출 결과물 보기">',
    '<div class="title"><b id="grpTitle">제출 결과물 보기</b><button id="grpClose" type="button">닫기 ✕</button></div>',
    '<div class="meta" id="grpInfo"></div>',
    '<div class="actions"><input type="url" id="grpUrl" autocomplete="off" placeholder="https://mega.nz/file/...#..."><button id="grpSave" type="button">링크 저장 · 열기</button></div>',
    '<div class="actions"><button type="button" class="primary-local" id="grpFolder">📁 제출물 보관 폴더 연결</button><button type="button" id="grpFolderRetry">↻ 연결된 폴더에서 찾기</button></div>',
    '<div class="folder-help" id="grpFolderHelp">MEGA 데스크톱 동기화 폴더를 연결하세요. 간편 제출은 <b>이름이 포함된 파일 또는 최근 업로드한 이미지 후보</b>를 찾아 보여 줍니다. 올바른 파일을 클릭하면 이 브라우저에서 다음에도 열 수 있습니다. 폴더 파일은 외부로 전송되지 않습니다.</div>',
    '<div class="actions"><label>개별 파일 직접 선택 <input id="grpFile" type="file" accept=".pdf,.docx,.png,.jpg,.jpeg,.webp,.gif,.txt,.md,.csv,.mp4,.webm"></label><button id="grpMega" type="button">MEGA 파일 보관함 열기 ↗</button><button id="grpDelete" type="button">저장 링크 지우기</button></div>',
    '<div class="meta" id="grpStatus" role="status">선택한 파일이나 개별 공유 링크만 표시합니다.</div>',
    '<div class="matchesTitle" id="grpMatchesTitle" hidden>찾은 파일을 선택해 주세요</div>',
    '<div class="matches" id="grpMatches" hidden aria-label="제출 결과물 후보 목록"></div>',
    '<div class="canvas" id="grpCanvas"><p>해당 제출물 파일을 연결하면 여기에서 볼 수 있습니다.</p></div>',
    '<div class="meta">파일은 기존 MEGA 무료 보관함에 저장됩니다. 내용 식별값이 있는 제출물은 참석자 계정과 자동 연결됩니다. 간편 제출은 MEGA에서 직접 확인해 주세요. 검색과 미리보기는 이 컴퓨터 안에서만 진행됩니다. 파일 내용이 완전히 같은 중복 제출은 구분이 필요할 수 있습니다.</div>',
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
  async function findInFolder(handle,wanted,person,maxFiles=2500){
    const wantedName=normalizeFileName(wanted),wantedStem=fileStem(wanted);
    const matches=[],folders=[{handle,depth:0}];
    let count=0,exact=null;
    while(folders.length){
      const item=folders.shift();
      for await(const entry of item.handle.values()){
        if(++count>maxFiles)break;
        if(entry.kind==="file"){
          const actual=normalizeFileName(entry.name);
          if(actual===wantedName)exact={handle:entry,name:entry.name};
          if(actual===wantedName||fileStem(actual)===wantedStem||belongsToName(entry.name,person))
            matches.push({handle:entry,name:entry.name,exact:actual===wantedName,stem:fileStem(actual)===wantedStem});
        }else if(entry.kind==="directory"&&item.depth<3&&folders.length<80){
          folders.push({handle:entry,depth:item.depth+1});
        }
      }
      if(count>maxFiles)break;
    }
    matches.sort((a,b)=>Number(b.exact)-Number(a.exact)||Number(b.stem)-Number(a.stem)||a.name.localeCompare(b.name,"ko",{numeric:true}));
    return {matches:matches.slice(0,80),exact,partial:count>maxFiles};
  }
  // When filenames were not sent with a simple MEGA report, use local folder
  // name/path and file timestamps as *suggestions*, not proof of ownership.
  async function findSimpleCandidates(handle,person,at,token,key,maxFiles=2500){
    const name=normalizeFileName(person).replace(/\s+/g,"");
    const directories=[{handle,depth:0,path:""}],items=[];
    let scanned=0,partial=false,dirs=0;
    while(directories.length){
      const parent=directories.shift();
      for await(const entry of parent.handle.values()){
        if(token!==folderLookupToken||!current||current.key!==key)
          return {cancelled:true,items:[],named:[],partial:false,scanned};
        if(++scanned>maxFiles){partial=true;break}
        const relative=parent.path?parent.path+"/"+entry.name:entry.name;
        if(entry.kind==="directory"){
          if(parent.depth<5&&dirs<100){directories.push({handle:entry,depth:parent.depth+1,path:relative});dirs++}
          continue;
        }
        if(entry.kind!=="file"||!allowedExt.test(entry.name))continue;
        try{
          const file=await entry.getFile();
          const inName=name.length>=2&&normalizeFileName(relative).replace(/\s+/g,"").includes(name);
          items.push({handle:entry,name:entry.name,relative,modified:Number(file.lastModified)||0,
            nameMatch:inName,exact:false});
        }catch(_){}
        if(scanned%100===0)status("연결된 MEGA 폴더에서 파일 찾는 중… "+scanned+"개 확인");
      }
      if(partial)break;
    }
    const target=Number(at)||Date.now(),now=Date.now();
    const byTime=(a,b)=>Math.abs(a.modified-target)-Math.abs(b.modified-target);
    const named=items.filter(f=>f.nameMatch).sort(byTime);
    const recent=items.filter(f=>!f.nameMatch)
      .sort((a,b)=>b.modified-a.modified);
    // Show named items first. Offer recent filenames if MEGA omitted participant names.
    const selected=named.slice(0,30);
    const available=recent.filter(f=>f.modified>=now-14*24*60*60*1000);
    const fallbacks=(available.length?available:recent).slice(0,named.length?8:25);
    selected.push(...fallbacks);
    return {items:selected,named,partial,scanned,cancelled:false};
  }
  async function saveChosenFile(key,handle){
    try{
      const db=await dbConnect();
      await new Promise((resolve,reject)=>{
        const tx=db.transaction("prefs","readwrite");
        tx.objectStore("prefs").put(handle,"chosen:"+key);
        tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
      });
      db.close();
    }catch(_){} // Local preference only: preview still works without persistent storage.
  }
  async function getChosenFile(key){
    try{
      const db=await dbConnect();
      const h=await new Promise((resolve,reject)=>{
        const tx=db.transaction("prefs","readonly");
        const req=tx.objectStore("prefs").get("chosen:"+key);
        req.onsuccess=()=>resolve(req.result||null);
        req.onerror=()=>reject(req.error);
      });
      db.close();return h;
    }catch(_){return null}
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
  async function showFolderFile(entry,token,key,remember=false){
    if(token!==folderLookupToken||!current||current.key!==key)return;
    try{
      const file=await entry.handle.getFile();
      if(token!==folderLookupToken||!current||current.key!==key)return;
      if(file.size>100*1024*1024&&!/\.(mp4|webm)$/i.test(file.name)){
        status("100MB를 넘는 문서는 MEGA 폴더에서 직접 열어 주세요.");return
      }
      cleanup();renderBlob(file,file.name,rev);
      if(remember)saveChosenFile(key,entry.handle);
      status("✓ "+entry.name+" · 이 컴퓨터에서 이미지/문서를 열었습니다."+
        (remember?" 다음부터 이 제출 기록에 연결된 파일로 열립니다.":""));
    }catch(e){status("파일을 열 수 없습니다. 동기화 상태와 브라우저 폴더 권한을 확인해 주세요.")}
  }
  function showMatches(entries,token,key,simple=false){
    const pane=el("grpMatches");pane.replaceChildren();pane.hidden=!entries.length;
    el("grpMatchesTitle").hidden=!entries.length;
    el("grpMatchesTitle").textContent=simple?
      "아래에서 실제 제출된 파일을 선택하세요 (파일명·날짜는 후보 기준입니다)":
      "찾은 제출 결과물";
    for(const entry of entries){
      const button=document.createElement("button");button.type="button";
      button.dataset.namematch=String(!!entry.nameMatch);
      const prefix=/\.(png|jpe?g|webp|gif)$/i.test(entry.name)?"🖼 ":"📄 ";
      const label=simple?(entry.relative||entry.name):(
        entry.original?entry.original+" · MEGA 저장: "+entry.name:entry.name);
      button.textContent=prefix+label+(simple&&entry.nameMatch?" · 이름 일치":"");
      button.title="선택한 파일을 이 제출자에게 연결하고 미리보기";
      button.onclick=()=>showFolderFile(entry,token,key,simple);
      pane.append(button);
    }
  }
  async function previewFromFolder(token,requestPermission=false){
    if(!current)return;
    const report=current.report,matchingKey=current.key;
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
      const isSimple=report.fileName==="MEGA 업로드 완료 (간편 제출)";
      if(isSimple){
        // An explicitly picked file is tied only to this participant/report in IndexedDB.
        const saved=await getChosenFile(matchingKey);
        if(token!==folderLookupToken||!current||current.key!==matchingKey)return;
        if(saved){
          try{
            await saved.getFile();
            await showFolderFile({handle:saved,name:saved.name},token,matchingKey);
            return;
          }catch(_){}
        }
        status("간편 제출: MEGA 동기화 폴더에서 이름과 최근 파일을 찾는 중…");
        const result=await findSimpleCandidates(directoryHandle,report.name,report.at,token,matchingKey);
        if(result.cancelled||token!==folderLookupToken||!current||current.key!==matchingKey)return;
        showMatches(result.items,token,matchingKey,true);
        if(!result.items.length){
          status("폴더에서 미리보기 가능한 파일을 찾지 못했습니다. MEGA 데스크톱 동기화 상태와 선택한 폴더를 확인해 주세요.");
          return;
        }
        if(result.named.length===1){
          await showFolderFile(result.named[0],token,matchingKey);
          status("제출자 이름과 일치하는 파일 1개를 표시했습니다. 실제 제출 파일인지 확인해 주세요.");
        }else{
          cleanup();
          const p=document.createElement("p");
          p.textContent=result.named.length?
            "이름이 포함된 파일 "+result.named.length+"개와 최근 파일을 찾았습니다. 위에서 해당 이미지를 선택해 주세요.":
            "제출자 이름이 포함된 파일을 찾지 못했습니다. 위에 표시된 최근 이미지/파일 후보에서 실제 제출물을 선택해 주세요.";
          el("grpCanvas").append(p);
          status("✓ 파일 후보 "+result.items.length+"개 발견 · 파일을 클릭하면 여기에서 미리보기로 표시됩니다."+
            (result.partial?" 폴더 일부만 검색했습니다.":""));
        }
        return;
      }
      status("기존 제출 기록의 파일명으로 "+safe(report.fileName)+" 찾는 중…");
      const {matches,exact,partial}=await findInFolder(directoryHandle,report.fileName,report.name);
      if(token!==folderLookupToken||!current||current.key!==matchingKey)return;
      showMatches(matches,token,matchingKey);
      if(!matches.length){
        status((isSimple?"간편 제출은 파일 내용 식별값이 없습니다. MEGA에서 제출자 이름과 제출 시간을 직접 확인해 주세요. ":"신고 파일명 또는 제출자 이름으로 일치하는 파일을 찾지 못했습니다. ")+
          (partial?" 검색 파일이 2500개를 넘었습니다.":"")+" 실제 파일명을 확인해 주세요.");
        return;
      }
      if(exact){
        await showFolderFile(exact,token,matchingKey);
        if(matches.length>1)status("정확히 일치하는 파일을 열었습니다. 이름으로 찾은 나머지 결과물도 위에서 선택할 수 있습니다.");
      }else if(matches.length===1){
        await showFolderFile(matches[0],token,matchingKey);
      }else{
        cleanup();const p=document.createElement("p");
        p.textContent="제출자 이름으로 "+matches.length+"개 파일을 찾았습니다. 위의 파일명 중 올바른 결과물을 선택해 주세요.";
        el("grpCanvas").append(p);
        status("이름으로 결과물 "+matches.length+"개 발견 · 다른 파일을 잘못 열지 않도록 직접 선택해 주세요.");
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
    const key=fileKey(id,report);current={key,report};
    el("grpTitle").textContent=safe(report.name)+" · 제출 결과물";
    const displayFiles=Array.isArray(report.files)&&report.files.length?report.files:unpackFileFingerprints(report.fileName);
    el("grpInfo").textContent=displayFiles.length?
      "제출 파일 "+displayFiles.length+"개 · 참석자 계정에 연결된 파일을 내용으로 검색합니다":
      report.fileName==="MEGA 업로드 완료 (간편 제출)"?
       "간편 제출 · 파일 내용 식별값 없음 · 연결된 MEGA 폴더에서 이미지 후보를 찾습니다":
       "기존 제출 파일명: "+safe(report.fileName);
    el("grpFile").value="";
    el("grpUrl").value=links[key]||"";
    modal.hidden=false;
    if(links[key]&&!displayFiles.length)loadLink(links[key]);
    else {
      const p=document.createElement("p");p.textContent="연결된 제출물 폴더에서 파일을 확인하고 있습니다. 폴더가 연결되지 않았다면 위에서 선택해 주세요.";el("grpCanvas").appendChild(p);
      status("연결된 보관 폴더 자동 검색 중…");
      previewFromFolder(folderLookupToken);
    }
  }
  el("grpSave").onclick=()=>{
    if(!current)return;
    const url=validate(el("grpUrl").value);
    if(!url){status("MEGA 개별 파일 공유 링크(mega.nz/file/...#...)를 입력해 주세요. 계정/폴더 주소는 허용하지 않습니다.");return}
    links[current.key]=url;
    try{localStorage.setItem(storeKey,JSON.stringify(links))}catch(_){status("링크 저장은 차단되었지만 지금 파일은 열 수 있습니다.")}
    loadLink(url);
  };
  el("grpFile").onchange=()=>{
    const file=el("grpFile").files?.[0];if(!file)return;
    if(file.size>100*1024*1024){status("100MB 이하의 파일을 선택해 주세요.");return}
    cleanup();renderBlob(file,file.name,rev);
  };
  el("grpMega").onclick=()=>window.open("https://mega.nz/fm","_blank","noopener,noreferrer");
  el("grpDelete").onclick=()=>{if(!current)return;delete links[current.key];try{localStorage.setItem(storeKey,JSON.stringify(links))}catch(_){}el("grpUrl").value="";cleanup();status("저장된 개별 파일 링크를 지웠습니다.")};
  return {open};
}
