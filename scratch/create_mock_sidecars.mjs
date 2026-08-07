import fs from 'fs';
import path from 'path';

const sidecarsDir = path.resolve('src-tauri/sidecars');
if (!fs.existsSync(sidecarsDir)) {
  fs.mkdirSync(sidecarsDir, { recursive: true });
}

// Create placeholder sidecar manifest files
fs.writeFileSync(path.join(sidecarsDir, 'gs-x86_64-pc-windows-msvc.exe'), 'MOCK_GS_SIDECAR_BINARY');
fs.writeFileSync(path.join(sidecarsDir, 'qpdf-x86_64-pc-windows-msvc.exe'), 'MOCK_QPDF_SIDECAR_BINARY');
fs.writeFileSync(path.join(sidecarsDir, 'gswin64c.exe'), 'MOCK_GS_EXE');
fs.writeFileSync(path.join(sidecarsDir, 'qpdf.exe'), 'MOCK_QPDF_EXE');

console.log('Successfully initialized src-tauri/sidecars/ directory with sidecar manifests.');
