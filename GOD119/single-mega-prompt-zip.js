// Download exactly one explicitly shared MEGA ZIP in the visitor's browser.
// This module does not access a MEGA account, folders, or Firebase private data.
const MAX_BUFFER_BYTES=150*1024*1024;
function validate(raw){
 const u=new URL(String(raw||"").trim());
 if(u.protocol!=="https:"||u.hostname!=="mega.nz"||
  !/^\/file\/[A-Za-z0-9_-]{6,}$/.test(u.pathname)||
  !/^#[A-Za-z0-9_-]{16,}$/.test(u.hash)||u.search||u.username||u.password)
  throw Error("INVALID_MEGA_FILE_LINK");
 return u.href;
}
function deadline(promise,ms,code){
 let timer;
 return Promise.race([
  promise,
  new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(code)),ms)})
 ]).finally(()=>clearTimeout(timer));
}
function cleanName(value){
 const name=String(value||"").replace(/[\\/:*?"<>|\u0000-\u001f]/g,"_").slice(0,180);
 return name&&/\.zip$/i.test(name)?name:"AI_목회자세미나_프롬프트.zip";
}
export async function downloadPromptZip(rawUrl,onProgress=()=>{}){
 const url=validate(rawUrl);
 onProgress("MEGA 압축파일의 정보를 확인하고 있습니다…");
 const {File}=await deadline(import("https://unpkg.com/megajs@1.3.1/dist/main.browser-es.mjs"),30000,"MODULE_TIMEOUT");
 const file=File.fromURL(url);
 file.api.userAgent=null;
 await deadline(file.loadAttributes(),30000,"INFO_TIMEOUT");
 const bytesExpected=Number(file.size);
 if(!/\.zip$/i.test(String(file.name||"")))throw Error("NOT_ZIP_FILE");
 if(!Number.isSafeInteger(bytesExpected)||bytesExpected<22||bytesExpected>MAX_BUFFER_BYTES)
  throw Error("FILE_SIZE_UNSUPPORTED");
 onProgress("ZIP "+(bytesExpected/1048576).toFixed(1)+"MB 다운로드 중…");
 const result=await deadline(file.downloadBuffer(),180000,"ZIP_DOWNLOAD_TIMEOUT");
 const data=result instanceof Uint8Array?result:new Uint8Array(result);
 if(data.length!==bytesExpected||data[0]!==0x50||data[1]!==0x4b||
  !([3,5,7].includes(data[2])&&[4,6,8].includes(data[3])))
  throw Error("ZIP_VALIDATION_FAILED");
 const blobUrl=URL.createObjectURL(new Blob([data],{type:"application/zip"}));
 try{
  const link=document.createElement("a");
  link.href=blobUrl;
  link.download=cleanName(file.name);
  link.hidden=true;
  document.body.appendChild(link);
  link.click();link.remove();
 }finally{setTimeout(()=>URL.revokeObjectURL(blobUrl),60000)}
 onProgress("✓ 압축파일 다운로드를 요청했습니다. 다운로드 폴더를 확인해 주세요.");
 return true;
}
