// GOD119: content-based file identity. Never uploads files or file contents.
const encoder=new TextEncoder();
const toHex=bytes=>Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,"0")).join("");
export async function fingerprintFile(file,method=null){
  if(!file||!Number.isFinite(file.size)||file.size<0)throw Error("INVALID_FILE");
  if(!crypto?.subtle)throw Error("SECURE_CONTEXT_REQUIRED");
  const mode=method||(file.size<=32*1024*1024?"full-sha256-v1":"sample-sha256-v1");
  let data;
  if(mode==="full-sha256-v1"){
    if(file.size>256*1024*1024)throw Error("FULL_HASH_FILE_TOO_LARGE");
    data=await file.arrayBuffer();
  }else if(mode==="sample-sha256-v1"){
    // Bounded-memory deterministic fingerprint for videos / large files.
    // Sample at five uniformly spaced positions, plus total byte length.
    // It is a matching aid, not a cryptographic proof of full-file integrity.
    const size=file.size,n=512*1024;
    const offsets=[0,Math.max(0,Math.floor(size/4)-Math.floor(n/2)),Math.max(0,Math.floor(size/2)-Math.floor(n/2)),Math.max(0,Math.floor(size*3/4)-Math.floor(n/2)),Math.max(0,size-n)];
    const parts=[encoder.encode("GOD119-SAMPLED-V1:"+String(size)+":")];
    for(const offset of offsets){const a=await file.slice(offset,Math.min(size,offset+n)).arrayBuffer();parts.push(new Uint8Array(a))}
    const length=parts.reduce((sum,x)=>sum+x.length,0),buf=new Uint8Array(length);
    let pos=0;for(const p of parts){buf.set(p,pos);pos+=p.length}
    data=buf;
  }else throw Error("UNKNOWN_FINGERPRINT_METHOD");
  const digest=await crypto.subtle.digest("SHA-256",data);
  return {method:mode,hash:toHex(digest)};
}

export function packFileFingerprints(files){
  if(!Array.isArray(files)||!files.length||files.length>5)throw Error("MAX_FIVE_FILES_PER_REPORT");
  const parts=files.map(f=>{
    const size=Number(f.size),method=f.method==="full-sha256-v1"?"f":f.method==="sample-sha256-v1"?"s":null;
    if(!Number.isSafeInteger(size)||size<0||size>250*1024*1024||
       !method||!(/^[a-f0-9]{64}$/i.test(String(f.hash||""))))throw Error("INVALID_FILE_MANIFEST");
    return size.toString(36)+method+String(f.hash).slice(0,18).toLowerCase();
  });
  const output="G119v2:"+parts.join(".");
  if(output.length>140)throw Error("FILE_MANIFEST_TOO_LONG");
  return output;
}
export function unpackFileFingerprints(packed){
  const raw=String(packed||"");
  if(!raw.startsWith("G119v2:"))return [];
  const parts=raw.slice(7).split(".");
  if(!parts.length||parts.length>5)return [];
  const result=[];
  for(let i=0;i<parts.length;i++){
    const m=/^([0-9a-z]+)([fs])([a-f0-9]{18})$/.exec(parts[i]);
    if(!m)return [];
    const size=parseInt(m[1],36);
    if(!Number.isSafeInteger(size)||size<0||size>250*1024*1024)return [];
    result.push({name:"결과물 "+(i+1),size,method:m[2]==="f"?"full-sha256-v1":"sample-sha256-v1",hash:m[3]});
  }
  return result;
}
