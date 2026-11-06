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
