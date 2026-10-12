import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import {viteStaticCopy} from 'vite-plugin-static-copy';
import {iconSvgr} from './scripts/icons/svgrOptions.mts';
import path from 'node:path';
const project=path.resolve(import.meta.dirname,'tsconfig.core.vite.json');
const proxy={'/api':{target:'http://127.0.0.1:8080',changeOrigin:true},'/v1/api-docs':{target:'http://127.0.0.1:8080',changeOrigin:true}};
export default defineConfig({
 root:import.meta.dirname,
 define:{__DEV_WORKTREE_LABEL__:JSON.stringify('')},
 resolve:{dedupe:['react','react-dom']},
 plugins:[iconSvgr(),react(),tsconfigPaths({projects:[project]}),viteStaticCopy({targets:[{src:'../node_modules/pdfjs-dist/cmaps/*',dest:'pdfjs/cmaps'},{src:'../node_modules/pdfjs-dist/standard_fonts/*',dest:'pdfjs/standard_fonts'},{src:'../../app/core/src/main/resources/static/fonts/*.ttf',dest:'fonts'}]})],
 worker:{plugins:()=>[tsconfigPaths({projects:[project]})]},
 server:{host:'127.0.0.1',port:5173,strictPort:true,proxy},
 preview:{host:'127.0.0.1',port:5173,strictPort:true,proxy},
 build:{target:'esnext',reportCompressedSize:false,chunkSizeWarningLimit:1500}
});
