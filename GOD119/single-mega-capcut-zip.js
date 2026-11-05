// GOD119 slide 55: download a CapCut-only ZIP from a single public MEGA file URL.
// No MEGA account login or folder access. The attendee stays on the lecture page.
const LIMIT=250*1024*1024;
function singleMegaFile(input){
 const u=new URL(String(input||"").trim());
 if(u.protocol!=="https:"||u.hostname!=="mega.nz"||!/^\/file\/[a-zA-Z0-9_-]+$/.test(u.pathname)||!/^#[a-zA-Z0-9_-]{16,}$/.test(u.hash)||u.search)
  throw new Error("INVALID_INDIVIDUAL_FILE_URL");
 return u.href;
}
function deadline(p,ms,label){let timer;return Promise.race([p,new Promise((_,reject)=>timer=setTimeout(()=>reject(new Error(label)),ms))]).finally(()=>clearTimeout(timer))}
export async function downloadSingleMegaCapcutZip(raw,onProgress=()=>{}){
 const url=singleMegaFile(raw);
 onProgress("캡컷 실습자료 ZIP 정보를 확인하고 있습니다…");
 const {File}=await deadline(import("https://unpkg.com/megajs@1.3.1/dist/main.browser-es.mjs"),30000,"MEGA_MODULE_TIMEOUT");
 const file=File.fromURL(url);file.api.userAgent=null;
 await deadline(file.loadAttributes(),30000,"MEGA_INFO_TIMEOUT");
 const name=String(file.name||"");
 if(!/\.zip$/i.test(name))throw new Error("NOT_ZIP");
 if(!Number.isSafeInteger(file.size)||file.size<22||file.size>LIMIT)throw new Error("ZIP_SIZE_LIMIT");
 onProgress("캡컷 자료 "+(file.size/1024/1024).toFixed(1)+"MB 다운로드·암호 해제 중…");
 const result=await deadline(file.downloadBuffer(),240000,"ZIP_DOWNLOAD_TIMEOUT");
 const bytes=result instanceof Uint8Array?result:new Uint8Array(result);
 if(bytes.byteLength!==file.size||bytes.byteLength>LIMIT||bytes[0]!==0x50||bytes[1]!==0x4b||
   !([3,5,7].includes(bytes[2]))||!([4,6,8].includes(bytes[3])))throw new Error("INVALID_ZIP");
 const blobUrl=URL.createObjectURL(new Blob([bytes],{type:"application/zip"}));
 const anchor=document.createElement("a");
 anchor.href=blobUrl;anchor.download="캡컷_세미나_실습자료.zip";anchor.hidden=true;
 document.body.appendChild(anchor);
 try{anchor.click()}finally{anchor.remove();setTimeout(()=>URL.revokeObjectURL(blobUrl),60000)}
 return true;
}
