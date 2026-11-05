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
  ].join("\n");
  document.head.appendChild(css);
  const modal=document.createElement("div");modal.id="godResultPreview";modal.hidden=true;
  modal.innerHTML=[
    '<div class="sheet" role="dialog" aria-modal="true" aria-label="강사 전용 제출 결과물 보기">',
    '<div class="title"><b id="grpTitle">제출 결과물 보기</b><button id="grpClose" type="button">닫기 ✕</button></div>',
    '<div class="meta" id="grpInfo"></div>',
    '<div class="actions"><input type="url" id="grpUrl" autocomplete="off" placeholder="https://mega.nz/file/...#..."><button id="grpSave" type="button">링크 저장 · 열기</button></div>',
    '<div class="actions"><label>내 컴퓨터 파일 선택 <input id="grpFile" type="file" accept=".pdf,.docx,.png,.jpg,.jpeg,.webp,.gif,.txt,.md,.csv,.mp4,.webm"></label><button id="grpMega" type="button">MEGA 파일 보관함 열기 ↗</button><button id="grpDelete" type="button">저장 링크 지우기</button></div>',
    '<div class="meta" id="grpStatus" role="status">선택한 파일이나 개별 공유 링크만 표시합니다.</div>',
    '<div class="canvas" id="grpCanvas"><p>해당 제출물 파일을 연결하면 여기에서 볼 수 있습니다.</p></div>',
    '<div class="meta">참석자가 올린 파일은 MEGA의 비공개 파일 요청함에 있으므로, 신고된 파일명만으로 자동 열 수 없습니다. 개별 파일 링크는 이 브라우저에만 저장하고 Firebase나 공개 사이트에 올리지 않습니다.</div>',
    '</div>'
  ].join("");
  document.body.appendChild(modal);
  const el=id=>modal.querySelector("#"+id);
  let current=null,rev=0,objectUrl=null,remoteViewer=null;
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
  function close(){cleanup();current=null;modal.hidden=true}
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
    cleanup();
    const key=fileKey(id,report);current={key,report};
    el("grpTitle").textContent=safe(report.name)+" · 제출 결과물";
    el("grpInfo").textContent=safe(report.church)+" · "+safe(report.fileName);
    el("grpFile").value="";
    el("grpUrl").value=links[key]||"";
    modal.hidden=false;
    if(links[key])loadLink(links[key]);
    else {const p=document.createElement("p");p.textContent="파일을 선택하거나 MEGA에서 해당 제출물의 개별 공유 링크를 복사해 입력해 주세요.";el("grpCanvas").appendChild(p);status("최초 한 번 파일 연결이 필요합니다.")}
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
