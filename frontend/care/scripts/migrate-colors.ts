import fs from 'fs';
import path from 'path';

function processFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Backgrounds
  content = content.replace(/bg-slate-100/g, 'bg-accent');
  content = content.replace(/bg-slate-200/g, 'bg-accent/50');
  content = content.replace(/hover:bg-slate-50/g, 'hover:bg-accent');
  content = content.replace(/hover:bg-slate-100/g, 'hover:bg-accent');
  content = content.replace(/bg-white/g, 'bg-card');
  content = content.replace(/bg-slate-50/g, 'bg-background');
  
  // Text colors
  content = content.replace(/text-slate-900/g, 'text-foreground');
  content = content.replace(/text-slate-800/g, 'text-foreground');
  content = content.replace(/text-slate-700/g, 'text-card-foreground');
  content = content.replace(/text-slate-600/g, 'text-muted-foreground');
  content = content.replace(/text-slate-500/g, 'text-muted-foreground');
  content = content.replace(/text-slate-400/g, 'text-muted-foreground');
  
  // Borders
  content = content.replace(/border-slate-100/g, 'border-border\\/50');
  content = content.replace(/border-slate-200/g, 'border-border');
  content = content.replace(/border-slate-300/g, 'border-border');
  
  // Divides
  content = content.replace(/divide-slate-100/g, 'divide-border\\/50');
  content = content.replace(/divide-slate-200/g, 'divide-border');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function processDirectory(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

processDirectory('./src/app/admin');
// Also process the Navbar
processFile('./src/components/layout/Navbar.tsx');
processFile('./src/app/(auth)/login/page.tsx');
