// GOD119: decrypt a public MEGA document *in each visitor's browser* and
// preview its actual pages inside the existing slide overlay.
// Nothing is uploaded, decrypted or persisted to our GitHub/Firebase server.
// Supports PDF, DOCX, and raster images. HWP and other office formats require PDF.
export function createMegaDocumentViewer({status,viewport,documentName}){
 let sequence=0,blobUrl=null,currentId=null;
 const sizeLimit=45*1024*1024;
 function setStatus(message,isError=false){
  status.textContent=message;
  status.setAttribute("role","status");
  status.dataset.error=isError?"true":"false";
 }
 function reset(){
  sequence++;
  currentId=null;
  viewport.replaceChildren();
  if(blobUrl){URL.revokeObjectURL(blobUrl);blobUrl=null}
  setStatus("");
 }
 function appendMessage(text){
  const p=document.createElement("p");
  p.className="god-doc-fallback";
  p.textContent=text;
  viewport.replaceChildren(p);
 }
 async function script(url,globalName){
  if(window[globalName])return;
  await new Promise((resolve,reject)=>{
   const el=document.createElement("script");
   el.src=url;el.async=true;el.crossOrigin="anonymous";
   el.onload=resolve;el.onerror=()=>reject(new Error("미리보기 모듈을 불러오지 못했습니다."));
   document.head.append(el);
  });
  if(!window[globalName])throw new Error("문서 미리보기 모듈을 시작하지 못했습니다.");
 }
 async function show(url,id){
  if(currentId===id)return;
  reset();
  currentId=id;
  const turn=sequence;
  setStatus("MEGA에서 목회계획서 파일 정보를 확인하고 있습니다…");
  appendMessage("문서 내용을 불러오는 중입니다. 파일 크기에 따라 시간이 걸릴 수 있습니다.");
  try{
   // Official MEGAJS browser entry from https://mega.js.org/
   const {File}=await import("https://unpkg.com/megajs@1.3.2/dist/main.browser-es.mjs");
   if(turn!==sequence)return;
   const file=File.fromURL(url);
   file.api.userAgent=null;
   await file.loadAttributes();
   if(turn!==sequence)return;
   const name=String(file.name||documentName||"문서");
   if(file.size>sizeLimit)throw new Error("이 파일은 45MB보다 커서 강의실 내부 미리보기를 제한했습니다.");
   setStatus(name+" · MEGA에서 파일을 암호 해제하며 불러오고 있습니다…");
   const buffer=await file.downloadBuffer();
   if(turn!==sequence)return;
   const bytes=buffer instanceof Uint8Array?buffer:new Uint8Array(buffer);
   if(bytes.byteLength>sizeLimit)throw new Error("파일 크기가 미리보기 허용 범위를 초과합니다.");
   const low=name.toLowerCase();
   const pdf=/\.pdf$/i.test(low)||(bytes[0]===37&&bytes[1]===80&&bytes[2]===68&&bytes[3]===70);
   const docx=/\.docx$/i.test(low);
   const image=/\.(png|jpe?g|webp|gif)$/i.test(low);
   const text=/\.(txt|md|csv)$/i.test(low);
   if(pdf){
    blobUrl=URL.createObjectURL(new Blob([bytes],{type:"application/pdf"}));
    const frame=document.createElement("iframe");
    frame.title="MEGA 목회계획서 문서 미리보기";
    frame.className="god-doc-embedded-pdf";
    frame.src=blobUrl+"#view=FitH";
    viewport.replaceChildren(frame);
    setStatus(name+" · 실제 PDF 문서를 GOD119 화면 안에 표시합니다.");
   }else if(docx){
    setStatus(name+" · Word 문서 페이지를 화면에 표시하는 중…");
    await script("https://unpkg.com/jszip@3.10.1/dist/jszip.min.js","JSZip");
    if(turn!==sequence)return;
    await script("https://unpkg.com/docx-preview@0.3.7/dist/docx-preview.min.js","docx");
    if(turn!==sequence)return;
    const container=document.createElement("div");
    container.className="god-docx-pages";
    viewport.replaceChildren(container);
    await window.docx.renderAsync(bytes,container,null,{breakPages:true,ignoreFonts:false,inWrapper:true});
    if(turn!==sequence)return;
    setStatus(name+" · 실제 Word 문서 내용을 GOD119 화면 안에 표시합니다.");
   }else if(image){
    const mimetype=/\.png$/i.test(low)?"image/png":/\.gif$/i.test(low)?"image/gif":/\.webp$/i.test(low)?"image/webp":"image/jpeg";
    blobUrl=URL.createObjectURL(new Blob([bytes],{type:mimetype}));
    const img=document.createElement("img");
    img.className="god-doc-image";img.alt=name;img.src=blobUrl;
    viewport.replaceChildren(img);
    setStatus(name+" · 이미지 미리보기");
   }else if(text){
    const pre=document.createElement("pre");pre.className="god-doc-plaintext";
    pre.textContent=new TextDecoder("utf-8").decode(bytes);
    viewport.replaceChildren(pre);
    setStatus(name+" · 문서 텍스트 미리보기");
   }else{
    setStatus(name+" · 이 파일 형식은 웹 강의실에서 직접 미리보기를 지원하지 않습니다.",true);
    appendMessage("한글(HWP)·PPT 등 다른 형식이라면 원본 문서를 PDF로 저장한 뒤 MEGA에 올리고 새 링크를 연결하면 강의실 안에서 페이지를 볼 수 있습니다. 아래 MEGA 파일 열기 버튼은 계속 사용할 수 있습니다.");
   }
  }catch(error){
   if(turn!==sequence)return;
   setStatus("문서를 강의실 안에 표시하지 못했습니다.",true);
   appendMessage("MEGA 다운로드·브라우저 보안·파일 형식 또는 네트워크 문제일 수 있습니다. 아래 ‘MEGA에서 파일 열기’ 버튼은 사용할 수 있습니다. 파일이 PDF인지 확인하거나 PDF 사본을 연결해 보세요.");
  }
 }
 return {show,reset};
}
