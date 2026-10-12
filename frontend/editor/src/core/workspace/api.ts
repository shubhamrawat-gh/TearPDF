export interface LibraryDocument { id:string;title:string;type:string;confidence:number;pinned:number;tags:string;opened:string;current_version:number;pages:number;bytes:number }
export interface DocumentType {name:string;color:string;keywords:string;count:number;review:number}
export interface Pipeline {id:string;name:string;steps:string}
export interface Job {id:string;status:string;progress:number;created:string;error?:string}
export interface Notice {id:string;message:string;unread:number}
export interface WatchedFolder {id:string;path:string;pipeline_id?:string;output?:string}
const base='/api/v1/workspace';
export async function api<T>(path:string,method='GET',body?:unknown):Promise<T> {
 const response=await fetch(base+path,{method,headers:body instanceof FormData?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:body instanceof FormData?body:JSON.stringify(body)});
 if(!response.ok)throw new Error((await response.text()).slice(0,400)||`Request failed: ${response.status}`);
 if(response.status===204)return undefined as T;
 const text=await response.text();return (text?JSON.parse(text):undefined) as T;
}
export function pdfUrl(id:string,version?:number) {return `${base}/documents/${encodeURIComponent(id)}/file${version?`?version=${version}`:''}`;}
