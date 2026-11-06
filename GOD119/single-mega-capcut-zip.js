// GOD119 slide 55: a CapCut-only ZIP is decrypted from ONE MEGA public file
// link in the attendee's browser. MEGA account/folder views never open.
// Chrome/Edge desktop write large files directly to disk without loading the
// entire archive in memory. Smaller files can use a memory-based fallback.
const BUFFER_LIMIT=250*1024*1024;
const STREAM_LIMIT=2*1024*1024*1024;
const MB=1024*1024;
function singleMegaFile(input){
 const u=new URL(String(input||"").trim());
 if(u.protocol!=="https:"||u.hostname!=="mega.nz"||
    !/^\/file\/[a-zA-Z0-9_-]+$/.test(u.pathname)||
    !/^#[a-zA-Z0-9_-]{16,}$/.test(u.hash)||u.search)
   throw new Error("INVALID_INDIVIDUAL_FILE_URL");
 return u.href;
}
function deadline(p,ms,label){
 let timer;
 return Promise.race([p,new Promise((_,reject)=>timer=setTimeout(()=>reject(new Error(label)),ms))])
  .finally(()=>clearTimeout(timer));
}
function formatMB(bytes){return (bytes/MB).toFixed(1)+"MB"}
function validZipMagic(bytes){
 return bytes.length>=4&&bytes[0]===0x50&&bytes[1]===0x4b&&
   ((bytes[2]===3&&bytes[3]===4)||(bytes[2]===5&&bytes[3]===6)||
    (bytes[2]===7&&bytes[3]===8));
}
function streamToWritable(file,writable,size,onProgress){
 return new Promise((resolve,reject)=>{
  const input=file.download({maxConnections:2});
  let received=0,done=false,first=true;
  let idleTimer,totalTimer;
  function cleanup(){
   clearTimeout(idleTimer);clearTimeout(totalTimer);
   input.removeListener?.("data",onData);
   input.removeListener?.("end",onEnd);
   input.removeListener?.("error",onError);
  }
  function fail(error){
   if(done)return;
   done=true;cleanup();
   try{input.destroy?.()}catch(_){}
   reject(error instanceof Error?error:new Error(String(error)));
  }
  function restartIdle(){
   clearTimeout(idleTimer);
   idleTimer=setTimeout(()=>fail(new Error("ZIP_STALLED")),60000);
  }
  async function onData(chunk){
   if(done)return;
   input.pause?.();
   try{
    const bytes=chunk instanceof Uint8Array?chunk:new Uint8Array(chunk);
    if(first){first=false;if(!validZipMagic(bytes))throw new Error("INVALID_ZIP")}
    received+=bytes.length;
    if(received>size||received>STREAM_LIMIT)throw new Error("ZIP_SIZE_LIMIT");
    await writable.write(bytes);
    onProgress("캡컷 ZIP 저장 중 "+formatMB(received)+" / "+formatMB(size)+
       " ("+Math.floor(received/size*100)+"%)");
    restartIdle();
    if(!done)input.resume?.();
   }catch(e){fail(e)}
  }
  function onEnd(){
   if(done)return;
   if(received!==size){fail(new Error("ZIP_INCOMPLETE"));return}
   done=true;cleanup();resolve();
  }
  function onError(e){fail(e)}
  input.on("data",onData);input.on("end",onEnd);input.on("error",onError);
  restartIdle();
  totalTimer=setTimeout(()=>fail(new Error("ZIP_DOWNLOAD_TIMEOUT")),15*60000);
 });
}
export async function downloadSingleMegaCapcutZip(raw,onProgress=()=>{}){
 const url=singleMegaFile(raw);
 // The picker MUST be invoked during the original user click, before await:
 // browsers disallow delayed pickers outside user activation.
 let fileHandle=null;
 if(typeof window.showSaveFilePicker==="function"){
  try{
   fileHandle=await window.showSaveFilePicker({
    suggestedName:"캡컷_세미나_실습자료.zip",
    types:[{description:"ZIP 압축파일",accept:{"application/zip":[".zip"]}}]
   });
  }catch(e){
   if(e?.name==="AbortError")throw new Error("DOWNLOAD_CANCELLED");
   // If the browser blocks the picker, keep small-file fallback below.
   onProgress("직접 저장 권한을 사용할 수 없어 일반 다운로드를 확인합니다…");
  }
 }
 onProgress("MEGA에서 캡컷 ZIP 파일 정보 확인 중…");
 const {File}=await deadline(import("https://unpkg.com/megajs@1.3.1/dist/main.browser-es.mjs"),30000,"MEGA_MODULE_TIMEOUT");
 const file=File.fromURL(url);file.api.userAgent=null;
 await deadline(file.loadAttributes(),30000,"MEGA_INFO_TIMEOUT");
 const name=String(file.name||"");
 if(!/\.zip$/i.test(name))throw new Error("NOT_ZIP");
 const size=Number(file.size);
 if(!Number.isSafeInteger(size)||size<22)throw new Error("ZIP_SIZE_UNKNOWN");
 if(size>STREAM_LIMIT)throw new Error("ZIP_TOO_LARGE");
 if(fileHandle){
  const writable=await fileHandle.createWritable();
  let committed=false;
  try{
   onProgress("캡컷 ZIP "+formatMB(size)+" · 컴퓨터에 직접 저장합니다…");
   await streamToWritable(file,writable,size,onProgress);
   await writable.close();committed=true;
  }finally{
   if(!committed)try{await writable.abort()}catch(_){}
  }
  onProgress("✓ "+formatMB(size)+" 저장 완료 · 선택한 폴더를 확인하세요.");
  return true;
 }
 if(size>BUFFER_LIMIT)throw new Error("STREAM_SAVE_UNSUPPORTED");
 onProgress("캡컷 ZIP "+formatMB(size)+" 다운로드·암호 해제 중…");
 const data=await deadline(file.downloadBuffer(),6*60000,"ZIP_DOWNLOAD_TIMEOUT");
 const bytes=data instanceof Uint8Array?data:new Uint8Array(data);
 if(bytes.length!==size||!validZipMagic(bytes))throw new Error("INVALID_ZIP");
 const blobUrl=URL.createObjectURL(new Blob([bytes],{type:"application/zip"}));
 try{
  const anchor=document.createElement("a");
  anchor.href=blobUrl;anchor.download="캡컷_세미나_실습자료.zip";
  anchor.hidden=true;document.body.append(anchor);
  anchor.click();anchor.remove();
 }finally{setTimeout(()=>URL.revokeObjectURL(blobUrl),60000)}
 onProgress("✓ ZIP 다운로드 요청 완료 · 브라우저의 다운로드 목록을 확인하세요.");
 return true;
}
