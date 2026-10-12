import fs from 'node:fs';
import {chromium} from '../frontend/node_modules/playwright/index.mjs';
const origin=process.env.TEARPDF_URL||'http://127.0.0.1:8080';
const options={headless:true};
if(process.env.TEARPDF_CHROME)options.executablePath=process.env.TEARPDF_CHROME;
const browser=await chromium.launch(options);
const page=await browser.newPage({viewport:{width:1440,height:900}});
const requests=new Set(),errors=[];
page.on('request',r=>{if(/^https?:/.test(r.url()))requests.add(r.url());});
page.on('pageerror',e=>errors.push(e.message));
fs.mkdirSync('docs/screenshots',{recursive:true});
const shot=async(name)=>{await page.waitForTimeout(400);await page.screenshot({path:`docs/screenshots/${name}.png`});};
try{
 await page.goto(origin+'/local-workspace',{waitUntil:'networkidle'});
 const docs=await (await page.request.post(origin+'/api/v1/workspace/demo')).json();
 await page.reload({waitUntil:'networkidle'});
 await page.locator('.tp-doc').filter({hasText:docs[0].title}).first().click();
 await page.getByRole('button',{name:'Version history',exact:true}).waitFor();
 await page.locator('.tp-preview img').first().waitFor({timeout:60000});
 for(const theme of ['dark','light']){
  await page.getByRole('button',{name:'Settings',exact:true}).click();
  await page.locator('.tp-center select').first().selectOption(theme);
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:900});
   const prefix=`${theme}-`;
   await page.getByRole('button',{name:'Editor',exact:true}).click();
   if(await page.getByRole('button',{name:'All tools',exact:true}).count())await page.getByRole('button',{name:'All tools',exact:true}).click();
   await shot(`${prefix}library-${width}`);
   if(width<650)await page.getByRole('button',{name:'PDF tools',exact:true}).click();
   await page.locator('.tp-processor').getByRole('button',{name:'Compress',exact:true}).evaluate(button=>button.click());
   await page.locator('.tp-processor h2').waitFor();
   await shot(`${prefix}tool-${width}`);
   await page.getByRole('button',{name:'All tools',exact:true}).click();
   await page.getByRole('button',{name:'Automation',exact:true}).click();
   if(!await page.locator('.tp-step-number').count()){
    await page.getByRole('button',{name:'+ Rotate',exact:true}).click();
    await page.getByRole('button',{name:'+ Compress',exact:true}).click();
   }
   await shot(`${prefix}pipeline-${width}`);
   await page.getByRole('button',{name:'Settings',exact:true}).click();
   await shot(`${prefix}settings-${width}`);
   await page.locator('.tp-center').getByRole('button',{name:'Licenses',exact:true}).click();
   await page.getByRole('heading',{name:'Bundled third-party licenses'}).waitFor();
   await shot(`${prefix}licenses-${width}`);
  }
 }
 await page.setViewportSize({width:1440,height:900});
 await page.getByRole('button',{name:'Settings',exact:true}).click();
 await page.locator('.tp-center select').first().selectOption('dark');
 await page.keyboard.press('Control+k');
 await page.getByRole('dialog',{name:'Command palette'}).waitFor();
 await page.keyboard.press('Escape');
 const external=[...requests].filter(url=>new URL(url).origin!==origin);
 const report={title:await page.title(),screenshots:20,pageErrors:errors,externalRequests:external,localRequestCount:requests.size};
 fs.writeFileSync('docs/browser-verification.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));
 if(errors.length||external.length)process.exitCode=1;
}finally{await browser.close();}
