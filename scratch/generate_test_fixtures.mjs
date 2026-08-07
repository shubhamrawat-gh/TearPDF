import fs from 'fs';
import path from 'path';

const testDir = path.resolve('test-files');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

// 1. Tiny PNG (16x16 transparent PNG byte stream)
const tinyPngBase64 = "iVBORw0KGgoAAAANSU5EUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYSURBVDhPY2AYBaNgFIyCUTAECDAAAAOAAAH/9D5PAAAAAElFTkSuQmCC";
fs.writeFileSync(path.join(testDir, 'tiny.png'), Buffer.from(tinyPngBase64, 'base64'));

// 2. Corrupt PDF (Header + truncated content)
const corruptPdf = `%PDF-1.7
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kinds /TruncatedMidStream`;
fs.writeFileSync(path.join(testDir, 'corrupt.pdf'), corruptPdf);

// 3. Text-only PDF (Valid minimal PDF structure)
const textOnlyPdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 44 >> stream
BT /F1 24 Tf 100 700 Td (TearPDF Test File) Tj ET
endstream endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000338 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
407
%%EOF`;
fs.writeFileSync(path.join(testDir, 'text-only.pdf'), textOnlyPdf);

// 4. Rotated PDF (Valid minimal PDF with /Rotate 90 tag)
const rotatedPdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Rotate 90 /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 44 >> stream
BT /F1 24 Tf 100 700 Td (Rotated 90 Deg) Tj ET
endstream endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000255 00000 n 
0000000349 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
418
%%EOF`;
fs.writeFileSync(path.join(testDir, 'rotated.pdf'), rotatedPdf);

// 5. Password PDF (Encrypted placeholder signature)
const passwordPdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R /Encrypt 6 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >> endobj
6 0 obj << /Filter /Standard /V 2 /R 3 /O (encrypted_owner_key) /U (encrypted_user_key) /P -4 >> endobj
xref
0 4
0000000000 65535 f 
0000000009 00000 n 
0000000070 00000 n 
0000000127 00000 n 
trailer << /Size 4 /Root 1 0 R >>
startxref
200
%%EOF`;
fs.writeFileSync(path.join(testDir, 'password.pdf'), passwordPdf);

console.log('Successfully generated test-files fixtures: tiny.png, corrupt.pdf, text-only.pdf, rotated.pdf, password.pdf');
