// GOD119 slide 31: download one MEGA public-file share in the attendee's browser.
// This client uses only the file-specific public URL and decryption key: NO MEGA
// account login, session, other folder listing, or server-side transfer.
const MAX_PDF_BYTES=70*1024*1024;
function validateSingleFileLink(value){
 const u=new URL(String(value||""));
 if(u.protocol!=="https:"||u.hostname!=="mega.nz"||!/^\/file\/[a-zA-Z0-9_-]+$/.test(u.pathname)||
    !/^#[a-zA-Z0-9_-]{16,}$/.test(u.hash)||u.search)throw new Error("INVALID_SINGLE_FILE_LINK");
 return u.href;
}
function withDeadline(promise,ms,label){
 let timer;
 return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(label)),ms)})])
   .finally(()=>clearTimeout(timer));
}
export async function downloadSingleMegaPdf(rawUrl,onProgress=()=>{}){
 const url=validateSingleFileLink(rawUrl);
 onProgress("신약주석 PDF 파일 정보 확인 중…");
 // Use the same MEGAJS browser API already used by GOD119 document viewer.
 const module=await withDeadline(import("https://unpkg.com/megajs@1.3.1/dist/main.browser-es.mjs"),30000,"MODULE_TIMEOUT");
 const file=module.File.fromURL(url);
 file.api.userAgent=null;
 await withDeadline(file.loadAttributes(),30000,"ATTRIBUTES_TIMEOUT");
 if(!Number.isFinite(file.size)||file.size<5||file.size>MAX_PDF_BYTES)
   throw new Error("FILE_TOO_LARGE_OR_UNKNOWN");
 if(!/\.pdf$/i.test(String(file.name||"")))
   throw new Error("NOT_PDF_FILE");
 onProgress("PDF "+(file.size/1024/1024).toFixed(1)+"MB 다운로드·암호 해제 중…");
 const data=await withDeadline(file.downloadBuffer(),180000,"DOWNLOAD_TIMEOUT");
 const bytes=data instanceof Uint8Array?data:new Uint8Array(data);
 if(bytes.length!==file.size||bytes.length>MAX_PDF_BYTES||
    bytes[0]!==37||bytes[1]!==80||bytes[2]!==68||bytes[3]!==70)
   throw new Error("PDF_VALIDATION_FAILED");
 const blobUrl=URL.createObjectURL(new Blob([bytes],{type:"application/pdf"}));
 try{
  const link=document.createElement("a");
  link.href=blobUrl;
  link.download="신약주석.pdf";
  link.style.display="none";
  document.body.appendChild(link);
  link.click();
  link.remove();
 }finally{
  // Keep object URL alive long enough for mobile browsers to finish saving.
  setTimeout(()=>URL.revokeObjectURL(blobUrl),60000);
 }
 return true;
}
