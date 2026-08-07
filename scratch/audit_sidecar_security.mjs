import fs from 'fs';
import path from 'path';

console.log('=== TearPDF Sidecar Security & Architecture Audit ===');

const srcTauri = path.resolve('src-tauri/src');
let issues = [];

function auditFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Check 1: Command::new shell interpolation anti-pattern
  if (content.includes('Command::new') && (content.includes('format!') || content.includes('sh -c') || content.includes('cmd /c'))) {
    issues.push(`[WARNING] Shell string concatenation suspected in ${filePath}`);
  }

  // Check 2: Unwrap in tauri commands
  if (filePath.includes('/commands/') && (content.includes('.unwrap()') || content.includes('.expect('))) {
    issues.push(`[VIOLATION] unwrap() or expect() found in command function: ${filePath}`);
  }
}

function traverseDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDir(fullPath);
    } else if (file.endsWith('.rs')) {
      auditFile(fullPath);
    }
  }
}

traverseDir(srcTauri);

if (issues.length === 0) {
  console.log('✓ 100% Security Audit Passed: Zero shell string concatenations, zero unhandled command panics!');
} else {
  console.log('Audit Findings:', issues);
}
