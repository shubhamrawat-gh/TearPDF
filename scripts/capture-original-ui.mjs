import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from '../frontend/node_modules/playwright/index.mjs';
const origin=process.env.TEARPDF_URL||'http://127.0.0.1:8080';
const browser=await chromium.launch({headless:true,...(process.env.TEARPDF_CHROME?{executablePath:process.env.TEARPDF_CHROME}:{})});
const page=await browser.newPage({viewport:{width:1440,height:900}});
page.setDefaultTimeout(60000);
const requests=new Set(),errors=[],checks=[],screenshots=[];
page.on('request',r=>{if(/^https?:/.test(r.url()))requests.add(r.url());});
page.on('pageerror',e=>errors.push(e.message));
const shot=async name=>{await page.mouse.move(0,0);await page.waitForTimeout(700);const path=`docs/screenshots/original-${name}.png`;await page.screenshot({path});if(!screenshots.includes(path))screenshots.push(path);};
const go=async path=>{await page.goto(origin+path,{waitUntil:'networkidle'});};
try {
 await go('/');
 await page.getByRole('button',{name:'Editor',exact:true}).waitFor();
 assert.match(await page.title(),/TearPDF/);
 const response=await page.request.post(origin+'/api/v1/workspace/demo');assert.equal(response.status(),200);
 const [doc]=await response.json();const pdf=await page.request.get(origin+`/api/v1/workspace/documents/${doc.id}/file`);assert.equal(pdf.status(),200);
 await page.locator('input[type=file]').first().setInputFiles({name:doc.title,mimeType:'application/pdf',buffer:await pdf.body()});
 await page.getByText('Page Editor',{exact:true}).waitFor();await page.waitForTimeout(2500);checks.push('Upload PDF into original viewer');
 await shot('dark-editor-1440');
 await page.getByText('Compress',{exact:true}).first().click();await page.getByText('Compression Method',{exact:true}).waitFor();await shot('dark-tool-1440');
 const processed=page.waitForResponse(r=>r.url().includes('/compress-pdf')&&r.request().method()==='POST');
 await page.getByRole('button',{name:'Compress',exact:true}).click();assert.equal((await processed).status(),200);checks.push('Compress through original tool options');
 await page.waitForTimeout(2000);
 await page.getByTestId('my-files-button').click();await page.getByText('Recents',{exact:true}).click();await page.getByText(doc.title,{exact:true}).first().waitFor();await shot('dark-files-1440');checks.push('Original file manager lists imported documents in Recents');
 await page.getByRole('button',{name:'Editor',exact:true}).click();await page.getByRole('button',{name:'Reader',exact:true}).click();await shot('dark-reader-1440');checks.push('Original reader');
 await page.getByRole('button',{name:'Editor',exact:true}).click();await page.keyboard.press('Control+k');await page.waitForTimeout(400);await shot('dark-search-1440');await page.keyboard.press('Escape');checks.push('Original command search');
 for(const theme of ['dark','light']) {
  await go('/settings/general');await page.getByRole('button',{name:'Appearance',exact:true}).waitFor();
  await page.getByText(theme==='dark'?'Dark':'Light',{exact:true}).click();
  for(const width of [1440,390]) {
   await page.setViewportSize({width,height:900});
   await shot(`${theme}-settings-${width}`);
   await go('/settings/licenses');await page.getByRole('heading',{name:'Bundled third-party licenses'}).waitFor();await shot(`${theme}-licenses-${width}`);
   await go('/');await page.getByText('Page Editor',{exact:true}).waitFor();await page.waitForTimeout(1000);
   if(width<650){await shot(`${theme}-tools-${width}`);await page.getByText('Workspace',{exact:true}).click();}
   await shot(`${theme}-editor-${width}`);
   await go('/settings/general');await page.getByRole('button',{name:'Appearance',exact:true}).waitFor();
  }
 }
 checks.push('Settings, licenses and editor at desktop/narrow sizes in both themes');
 await page.setViewportSize({width:1440,height:900});await go('/');
 await page.getByRole('button',{name:'Local library and automation',exact:true}).click();await page.locator('.tp-doc').first().waitFor();assert.ok((await page.locator('.tp-doc').count())>0);checks.push('Existing SQLite library remains accessible');
 await page.getByRole('button',{name:'Automation',exact:true}).click();await shot('local-automation-1440');
 await page.getByRole('link',{name:'Return to TearPDF editor'}).click();await page.getByRole('button',{name:'Editor',exact:true}).waitFor();checks.push('Return from local workspace to original interface');
 await go('/settings/general');await page.getByRole('button',{name:'Appearance',exact:true}).waitFor();await page.getByText('Dark',{exact:true}).click();
 const external=[...requests].filter(url=>new URL(url).origin!==origin);
 const report={title:await page.title(),checks,screenshots,pageErrors:errors,externalRequests:external,localRequestCount:requests.size};
 fs.writeFileSync('docs/original-ui-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
} finally {await browser.close();}
