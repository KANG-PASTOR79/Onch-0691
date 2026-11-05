// GOD119 slide 10: client-side playback of public MEGA shared files.
// No MEGA account/session credential is used. The file decryption key is
// already part of that single public file URL. No other account files exposed.
export function createMegaVideoViewer({host,video,status,button}){
 let epoch=0,active=null,objectUrl=null,loading=false,stream=null;
 const LIMIT=100*1024*1024,STALLED_MS=25000,TOTAL_MS=120000;
 function setStatus(message,isError=false){status.textContent=message;status.dataset.error=isError?"true":"false";}
 function stopStream(){
  const old=stream;stream=null;
  if(old&&typeof old.destroy==="function"){try{old.destroy()}catch(_){}}
 }
 function clearMedia(){
  video.pause();video.removeAttribute("src");video.load();video.hidden=true;
  if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null}
 }
 function reset(){
  epoch++;active=null;loading=false;stopStream();clearMedia();
  button.hidden=false;button.disabled=false;button.textContent="▶ 영상 재생 준비";
  setStatus("영상을 보려면 재생 준비 버튼을 누르세요. 이 기기에서 영상만 다운로드·암호 해제합니다.");
  host.hidden=true;
 }
 function fetchWithProgress(file,job){
  return new Promise((resolve,reject)=>{
   let chunks=[],received=0,done=false,stalledTimer,totalTimer;
   const readable=file.download({maxConnections:2});
   stream=readable;
   function cleanup(){
    clearTimeout(stalledTimer);clearTimeout(totalTimer);
    readable.removeListener?.("progress",onProgress);
    readable.removeListener?.("data",onData);
    readable.removeListener?.("end",onEnd);
    readable.removeListener?.("error",onError);
   }
   function fail(err){
    if(done)return;done=true;cleanup();
    if(stream===readable)stream=null;
    try{readable.destroy?.()}catch(_){}
    reject(err instanceof Error?err:new Error(String(err)));
   }
   function finish(bytes){
    if(done)return;done=true;cleanup();
    if(stream===readable)stream=null;
    resolve(bytes);
   }
   function renewStall(){
    clearTimeout(stalledTimer);
    stalledTimer=setTimeout(()=>fail(new Error("STALLED")),STALLED_MS);
   }
   function progressText(value){
    if(done||epoch!==job)return;
    const pct=Math.min(99,Math.floor(value/(file.size||1)*100));
    setStatus("영상 준비 중: "+pct+"% · "+(value/1024/1024).toFixed(1)+"MB / "+(file.size/1024/1024).toFixed(1)+"MB (MEGA 다운로드·암호 해제)");
   }
   function onProgress(p){
    if(Number.isFinite(p?.bytesLoaded)&&p.bytesLoaded>received)progressText(p.bytesLoaded);
    renewStall();
   }
   function onData(data){
    const part=data instanceof Uint8Array?data:new Uint8Array(data);
    received+=part.byteLength;
    if(received>LIMIT){fail(new Error("TOO_LARGE"));return}
    chunks.push(part);
    progressText(received);
    renewStall();
   }
   function onEnd(){
    if(received!==file.size){fail(new Error("INCOMPLETE"));return}
    const output=new Uint8Array(received);let offset=0;
    for(const part of chunks){output.set(part,offset);offset+=part.byteLength}
    chunks=[];
    finish(output);
   }
   function onError(err){fail(err)}
   readable.on("progress",onProgress);
   readable.on("data",onData);
   readable.on("end",onEnd);
   readable.on("error",onError);
   renewStall();
   totalTimer=setTimeout(()=>fail(new Error("TOTAL_TIMEOUT")),TOTAL_MS);
  });
 }
 async function load(){
  if(!active||loading)return;
  loading=true;const job=epoch,url=active;
  button.disabled=true;button.textContent="영상 준비 중…";
  setStatus("MEGA 영상 정보를 확인하는 중입니다…");
  try{
   const mod=await Promise.race([
    import("https://unpkg.com/megajs@1.3.1/dist/main.browser-es.mjs"),
    new Promise((_,reject)=>setTimeout(()=>reject(new Error("MODULE_TIMEOUT")),20000))
   ]);
   if(job!==epoch)return;
   const file=mod.File.fromURL(url);
   file.api.userAgent=null;
   await Promise.race([
    file.loadAttributes(),
    new Promise((_,reject)=>setTimeout(()=>reject(new Error("INFO_TIMEOUT")),20000))
   ]);
   if(job!==epoch)return;
   if(!Number.isFinite(file.size)||file.size<=0||file.size>LIMIT)
    throw new Error("SIZE_INVALID");
   setStatus("영상 "+(file.size/1024/1024).toFixed(1)+"MB 다운로드 준비 중…");
   const bytes=await fetchWithProgress(file,job);
   if(job!==epoch)return;
   const blob=new Blob([bytes],{type:"video/mp4"});
   objectUrl=URL.createObjectURL(blob);
   video.src=objectUrl;video.hidden=false;button.hidden=true;
   setStatus("영상 준비 완료 · 재생 버튼을 누르세요.");
   try{await video.play()}catch(_){/* phones usually need a play tap */}
  }catch(err){
   if(job!==epoch)return;
   const code=err?.message||"";
   const reason=code==="STALLED"?"25초 동안 영상 데이터가 들어오지 않았습니다.":
    code==="TOTAL_TIMEOUT"?"영상 전송이 2분 안에 끝나지 않았습니다.":
    code==="MODULE_TIMEOUT"?"영상 모듈 연결 시간이 초과되었습니다.":
    code==="INFO_TIMEOUT"?"MEGA 파일 정보 응답이 지연되었습니다.":
    code==="INCOMPLETE"?"영상 데이터가 일부만 도착했습니다.":
    code==="SIZE_INVALID"?"이 영상의 크기를 확인할 수 없거나 100MB 제한을 넘었습니다.":
    "MEGA 영상 다운로드 또는 브라우저 연결에 문제가 생겼습니다.";
   setStatus(reason+" ‘다시 시도’를 누르세요. 계속 실패하면 강사에게 모바일 호환 영상 링크로 변경을 요청해 주세요.",true);
   button.hidden=false;button.disabled=false;button.textContent="↻ 다시 시도";
  }finally{
   if(job===epoch)loading=false;
  }
 }
 button.addEventListener("click",load);
 video.addEventListener("error",()=>{if(!video.hidden)setStatus("영상 파일을 받았지만 이 기기에서 재생할 수 없습니다. MP4 H.264/AAC 형식으로 변환이 필요할 수 있습니다.",true)});
 function show(url,id){
  if(active===url&&host.dataset.videoId===id){host.hidden=false;return}
  reset();active=url;host.dataset.videoId=id;host.hidden=false;
 }
 return {show,reset};
}
