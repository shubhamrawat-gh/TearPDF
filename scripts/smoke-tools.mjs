import fs from 'node:fs';
import {PDFDocument} from '../frontend/node_modules/@cantoo/pdf-lib/es/index.js';
const origin=process.env.TEARPDF_URL||'http://127.0.0.1:8080';
const folder='.internal/smoke';fs.mkdirSync(folder,{recursive:true});
const source=await PDFDocument.create();for(let i=0;i<3;i++){const page=source.addPage();page.drawText(`TearPDF local test page ${i+1}`);page.drawText('Fictional contact: demo@example.invalid',{x:40,y:650});}source.setCreator('TearPDF');source.setProducer('TearPDF');const pdf=await source.save();
const results=[];
async function run(name,path,params={},inputs=[['fileInput',pdf,'demo.pdf']],kind='pdf'){
 const form=new FormData();for(const [key,bytes,filename] of inputs)form.append(key,new Blob([bytes]),filename);for(const [key,value] of Object.entries(params))form.append(key,String(value));
 try{const response=await fetch(origin+path,{method:'POST',body:form,signal:AbortSignal.timeout(90000)});const bytes=new Uint8Array(await response.arrayBuffer());if(!response.ok)throw new Error(`${response.status}: ${new TextDecoder().decode(bytes).slice(0,350)}`);fs.writeFileSync(`${folder}/${name}.${kind==='pdf'?'pdf':kind}`,bytes);let details={bytes:bytes.length};if(kind==='pdf'){const document=await PDFDocument.load(bytes,{ignoreEncryption:true,updateMetadata:false});details.pages=document.getPageCount();details.producer=document.getProducer();details.creator=document.getCreator();}results.push({name,status:'passed',...details});return bytes;}catch(error){results.push({name,status:'failed',error:String(error)});return null;}
}
await run('merge','/api/v1/general/merge-pdfs',{sortType:'orderProvided',removeCertSign:true},[['fileInput',pdf,'first.pdf'],['fileInput',pdf,'second.pdf']]);
await run('split','/api/v1/general/split-pages',{pageNumbers:'1'},undefined,'zip');
await run('compress','/api/v1/misc/compress-pdf',{optimizeLevel:2,expectedOutputSize:'',linearize:false,normalize:false,grayscale:false});
await run('rotate','/api/v1/general/rotate-pdf',{angle:90});
const image=await run('pdf-to-image','/api/v1/convert/pdf/img',{imageFormat:'png',singleOrMultiple:'single',colorType:'color',dpi:72,pageNumbers:'1'},undefined,'png');
if(image)await run('image-to-pdf','/api/v1/convert/img/pdf',{fitOption:'maintainAspectRatio',colorType:'color',autoRotate:false},[['fileInput',image,'image.png']]);
await run('watermark','/api/v1/security/add-watermark',{customColor:'#d3d3d3',watermarkType:'text',watermarkText:'Fictional Demo',alphabet:'roman',fontSize:24,rotation:45,opacity:.25,widthSpacer:50,heightSpacer:50,convertPDFToImage:false});
const redacted=await run('auto-redact','/api/v1/security/auto-redact',{listOfText:'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}',useRegex:true,wholeWordSearch:false,redactColor:'#000000',customPadding:1,convertPDFToImage:false});
if(redacted){const upload=new FormData();upload.append('file',new Blob([redacted]),'Fictional redaction verification.pdf');const document=await (await fetch(origin+'/api/v1/workspace/documents',{method:'POST',body:upload})).json();const matches=await (await fetch(origin+'/api/v1/workspace/documents?q=example')).json();results.push({name:'auto-redact-search-removal',status:matches.some(d=>d.id===document.id)?'failed':'passed'});}
await run('manual-redact','/api/v1/security/redact',{pageNumbers:'',pageRedactionColor:'#000000',convertPDFToImage:false,'redactions[0].page':1,'redactions[0].x':35,'redactions[0].y':640,'redactions[0].width':400,'redactions[0].height':35,'redactions[0].color':'#000000'});
const protectedPdf=await run('password','/api/v1/security/add-password',{password:'fictional-test-password',ownerPassword:'fictional-test-owner',keyLength:256},undefined,'encrypted');
if(protectedPdf)await run('unlock-password','/api/v1/security/remove-password',{password:'fictional-test-password'},[['fileInput',protectedPdf,'protected.pdf']]);
await run('sanitize','/api/v1/security/sanitize-pdf',{removeJavaScript:true,removeEmbeddedFiles:true,removeMetadata:true,removeLinks:true,removeFonts:false});
await run('metadata','/api/v1/misc/update-metadata',{deleteAll:false,title:'Fictional local verification',creator:'TearPDF',producer:'TearPDF'});
await run('ocr','/api/v1/misc/ocr-pdf',{languages:'eng',ocrType:'skip-text',ocrRenderType:'hocr'});
const certResponse=await fetch(origin+'/api/v1/workspace/certificates/self-signed',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Fictional Demo User',password:'fictional-cert-password'})});
if(certResponse.ok){const cert=new Uint8Array(await certResponse.arrayBuffer());await run('certificate-sign','/api/v1/security/cert-sign',{certType:'PKCS12',password:'fictional-cert-password',showSignature:false,showLogo:false,name:'Fictional Demo User',reason:'Local verification',location:'Local',pageNumber:1},[['fileInput',pdf,'demo.pdf'],['p12File',cert,'identity.p12']]);}
fs.writeFileSync(`${folder}/results.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
