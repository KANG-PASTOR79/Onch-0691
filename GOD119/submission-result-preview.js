// Instructor-only submission preview. File-request reports only contain filenames,
// so an individual file share URL or locally selected file is needed once.
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
  ].join("\n");
  document.head.appendChild(css);
  const modal=document.createElement("div");modal.id="godResultPreview";modal.hidden=true;
  modal.innerHTML=[
    '<div class="sheet" role="dialog" aria-modal="true" aria-label="강사 전용 제출 결과물 보기">',
    '<div class="title"><b id="grpTitle">제출 결과물 보기</b><button id="grpClose" type="button">닫기 ✕</button></div>',
    '<div class="meta" id="grpInfo"></div>',
    '<div class="actions"><input type="url" id="grpUrl" autocomplete="off" placeholder="https://mega.nz/file/...#..."><button id="grpSave" type="button">링크 저장 · 열기</button></div>',
    '<div class="actions"><button type="button" class="primary-local" id="grpFolder">📁 제출물 보관 폴더 연결</button><button type="button" id="grpFolderRetry">↻ 연결된 폴더에서 찾기</button></div>',
    '<div class="folder-help" id="grpFolderHelp">MEGA 파일 요청함에서 받은 제출물을 컴퓨터의 한 폴더에 모아 주세요. 그 폴더를 한 번 연결하면 이후 파일명에 맞는 결과물을 자동으로 찾아 이 창에서 바로 보여줍니다. 다른 파일은 업로드하거나 공유하지 않습니다.</div>',
    '<div class="actions"><label>개별 파일 직접 선택 <input id="grpFile" type="file" accept=".pdf,.docx,.png,.jpg,.jpeg,.webp,.gif,.txt,.md,.csv,.mp4,.webm"></label><button id="grpMega" type="button">MEGA 파일 보관함 열기 ↗</button><button id="grpDelete" type="button">저장 링크 지우기</button></div>',
    '<div class="meta" id="grpStatus" role="status">선택한 파일이나 개별 공유 링크만 표시합니다.</div>',
    '<div class="canvas" id="grpCanvas"><p>해당 제출물 파일을 연결하면 여기에서 볼 수 있습니다.</p></div>',
    '<div class="meta">MEGA 비공개 파일 요청함은 신고된 파일명만으로 접근할 수 없습니다. 연결한 로컬 폴더에 해당 파일이 있으면 자동 표시하며, 없다면 직접 파일 선택 또는 개별 파일 링크 연결을 사용할 수 있습니다. 연결 정보는 이 컴퓨터의 브라우저에만 보관합니다.</div>',
    '</div>'
  ].join("");
  document.body.appendChild(modal);
  const el=id=>modal.querySelector("#"+id);
  let current=null,rev=0,objectUrl=null,remoteViewer=null;
  let directoryHandle=null,folderLookupToken=0;
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
  const normalizeFileName=n=>String(n||"").normalize("NFC").toLowerCase().replace(/\s+/g," ").trim();
  async function findInFolder(handle,wanted,maxFiles=2500){
    const name=normalizeFileName(wanted);
    let count=0,matching=null;
    const folders=[{handle,depth:0}];
    while(folders.length){
      const item=folders.shift();
      for await(const entry of item.handle.values()){
        if(++count>maxFiles)return null;
        if(entry.kind==="file"){
          const actual=normalizeFileName(entry.name);
          if(actual===name)return entry;
          // A report may say .jpg while the uploaded image is .jpeg/.png.
          const root=n=>n.replace(/\.[^.]+$/,"");
          if(!matching&&root(actual)===root(name))matching=entry;
        }else if(entry.kind==="directory"&&item.depth<2&&folders.length<60){
          folders.push({handle:entry,depth:item.depth+1});
        }
      }
    }
    return matching;
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
      status("연결된 폴더에서 "+safe(report.fileName)+" 찾는 중…");
      const fileHandle=await findInFolder(directoryHandle,report.fileName);
      if(token!==folderLookupToken||!current||current.key!==matchingKey)return;
      if(!fileHandle){
        status("연결된 폴더에서 일치하는 파일을 찾지 못했습니다. MEGA 제출물을 해당 폴더에 내려받거나 개별 파일을 선택해 주세요.");
        return;
      }
      const file=await fileHandle.getFile();
      if(!current||token!==folderLookupToken||current.key!==matchingKey)return;
      if(file.size>100*1024*1024){status("파일이 100MB보다 큽니다. 영상 등 큰 파일은 별도 재생 또는 다운로드 후 확인해 주세요.");return}
      cleanup();
      renderBlob(file,file.name,rev);
      status("✓ 제출물 자동 확인: "+file.name+" · 연결된 보관 폴더에서 표시했습니다.");
    }catch(e){
      if(token!==folderLookupToken)return;
      status("제출물 폴더를 읽지 못했습니다. 폴더 접근 권한과 파일명을 확인해 주세요.");
    }
  }
  el("grpFolder").onclick=async()=>{
    if(!window.showDirectoryPicker){status("이 브라우저에서는 폴더 자동 연결을 지원하지 않습니다. 최신 Chrome 또는 Edge에서 열어 주세요.");return}
    try{
      const picked=await window.showDirectoryPicker({mode:"read",id:"god119-submissions"});
      directoryHandle=picked;await saveFolder(picked);
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
  function close(){folderLookupToken++;cleanup();current=null;modal.hidden=true}
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
      node=document.createElement("p");node.textContent="이 파일은 브라우저에서 바로 미리보기를 지원하지 않습니다. PDF로 변환해 열어 주세요.";
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
    cleanup();
    const key=fileKey(id,report);current={key,report};
    el("grpTitle").textContent=safe(report.name)+" · 제출 결과물";
    el("grpInfo").textContent="제출 파일: "+safe(report.fileName);
    el("grpFile").value="";
    el("grpUrl").value=links[key]||"";
    modal.hidden=false;
    if(links[key])loadLink(links[key]);
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
