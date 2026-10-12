import {useState} from 'react';
import {api} from './api';
export default function FolderRun({id,say,refresh}:{id:string;say:(text:string)=>void;refresh:()=>Promise<void>}){
 const [path,setPath]=useState(''),[output,setOutput]=useState(''),[busy,setBusy]=useState(false);
 return <details><summary>Run on a local folder</summary><form onSubmit={async e=>{e.preventDefault();setBusy(true);try{const result=await api<{jobs:string[]}>(`/pipelines/${id}/folder`,'POST',{path,output});say(`${result.jobs.length} PDF jobs queued`);await refresh();}catch(e){say(String(e));}finally{setBusy(false);}}}><label>Input folder<input className="tp-input" required value={path} onChange={e=>setPath(e.target.value)}/></label><label>Output folder<input className="tp-input" value={output} onChange={e=>setOutput(e.target.value)}/></label><button className="tp-secondary" disabled={busy}>Run folder</button></form></details>;
}
