import {describe,it,expect,vi,afterEach} from 'vitest';
import {api,pdfUrl} from './api';
afterEach(()=>vi.unstubAllGlobals());
describe('workspace API',()=>{
 it('propagates server errors instead of reporting success',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response('Import failed',{status:400})));await expect(api('/documents')).rejects.toThrow('Import failed');});
 it('keeps multipart boundaries under browser control',async()=>{const fetch=vi.fn().mockResolvedValue(new Response('{"id":"local"}'));vi.stubGlobal('fetch',fetch);const body=new FormData();body.append('file',new Blob(['test']));await api('/documents','POST',body);expect(fetch).toHaveBeenCalledWith('/api/v1/workspace/documents',expect.objectContaining({body,headers:{}}));});
 it('encodes document identities',()=>{expect(pdfUrl('a/b',3)).toBe('/api/v1/workspace/documents/a%2Fb/file?version=3');});
});
