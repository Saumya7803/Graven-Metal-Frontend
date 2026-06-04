import fs from 'fs';
import path from 'path';

const distDir = path.join(process.cwd(), 'dist');
const indexFile = path.join(distDir, 'index.html');
const fallbackFile = path.join(distDir, '404.html');

if (!fs.existsSync(indexFile)) {
  throw new Error(`Missing build output: ${indexFile}`);
}

fs.copyFileSync(indexFile, fallbackFile);

