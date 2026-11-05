// GOD119 slide 10: play MEGA shared MP4 without navigating out of the seminar.
// Decrypts only on a participant's explicit click. Playback requires a browser-
// compatible codec (typically H.264 video / AAC audio). No upload to our server.
export function createMegaVideoViewer({host,video,status,button}){
 let epoch=0,active=null,objectUrl=null,loading=false;
 const LIMIT=100*1024*1024;
 function setStatus(message,isError=false){status.textContent=message;status.dataset.error=isError?"true":"false";}
 function clearMedia(){
  video.pause();
  video.removeAttribute("src");video.load();video.hidden=true;
  if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null;}
 }
 function reset(){
  epoch++;active=null;loading=false;clearMedia();
  button.hidden=false;button.disabled=false;
  setStatus("영상을 보려면 아래 재생 준비 버튼을 누르세요. 파일을 기기에서 암호 해제한 뒤 표시합니다.");
  host.hidden=true;
 }
 async function load(){
  if(!active||loading)return;
  loading=true;const job=epoch, url=active;
  button.disabled=true;setStatus("MEGA에서 영상을 가져올 준비 중입니다…");
  try{
   const {File}=await import("https://unpkg.com/megajs@1.3.1/dist/main.browser-es.mjs");
   if(job!==epoch)return;
   const file=File.fromURL(url);
   file.api.userAgent=null;
   await file.loadAttributes();
   if(job!==epoch)return;
   if(!Number.isFinite(file.size)||file.size<=0||file.size>LIMIT)
    throw new Error("영상이 100MB보다 크거나 크기를 확인할 수 없습니다.");
   setStatus("영상 "+(file.size/1024/1024).toFixed(1)+"MB를 다운로드·암호 해제 중입니다. Wi-Fi에서 이용해 주세요.");
   const buffer=await file.downloadBuffer();
   if(job!==epoch)return;
   const bytes=buffer instanceof Uint8Array?buffer:new Uint8Array(buffer);
   if(bytes.length>LIMIT)throw new Error("영상 용량 제한을 초과했습니다.");
   const blob=new Blob([bytes],{type:"video/mp4"});
   objectUrl=URL.createObjectURL(blob);
   video.src=objectUrl;video.hidden=false;
   button.hidden=true;
   setStatus("영상 준비 완료 · 재생 버튼을 누르세요.");
   try{await video.play()}catch(_){/* iOS requires a subsequent user play gesture */}
  }catch(err){
   if(job!==epoch)return;
   setStatus("이 기기에서 영상을 불러오지 못했습니다. 네트워크·영상 형식 또는 MEGA 접근 문제일 수 있습니다. 강사에게 모바일 재생 가능한 영상 링크를 요청해 주세요.",true);
   button.disabled=false;button.textContent="다시 시도";
  }finally{if(job===epoch)loading=false;}
 }
 button.addEventListener("click",load);
 video.addEventListener("error",()=>{if(!video.hidden)setStatus("영상 파일은 가져왔지만 이 기기에서 재생할 수 없습니다. H.264/AAC MP4로 변환이 필요할 수 있습니다.",true);});
 function show(url,id){
  if(active===url&&host.dataset.videoId===id){host.hidden=false;return;}
  reset();active=url;host.dataset.videoId=id;host.hidden=false;
  button.textContent="▶ 영상 재생 준비";
 }
 return {show,reset};
}
