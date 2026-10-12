import fs from 'node:fs';
import path from 'node:path';
import {parse,stringify} from 'smol-toml';
import {I18N_PROJECTS,findUnusedKeys} from '../src/core/i18n/translationAudit.ts';
const {unused}=findUnusedKeys(I18N_PROJECTS[0]);
const directory=path.resolve(import.meta.dirname,'../public/locales');
for(const locale of fs.readdirSync(directory)){
 const file=path.join(directory,locale,'translation.toml');
 if(!fs.existsSync(file))continue;
 const data=parse(fs.readFileSync(file,'utf8'));
 for(const key of unused){const parts=key.split('.');let parent:Record<string,any>=data;for(const part of parts.slice(0,-1)){parent=parent?.[part];if(!parent)break;}if(parent)delete parent[parts.at(-1)!];}
 fs.writeFileSync(file,stringify(data));
}
process.stdout.write(`Removed ${unused.length} obsolete keys across all bundled locales.\n`);
