import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = process.cwd();
const projectUrl = (process.env.VERCEL_PROJECT_PRODUCTION_URL || '').toLowerCase();
const isAdminProject = projectUrl.includes('admin');
const appDir = isAdminProject ? 'admin-panel' : 'frontend';
const appPath = path.join(rootDir, appDir);
const appDist = path.join(appPath, 'dist');
const rootDist = path.join(rootDir, 'dist');

console.log(`[build-vercel] project=${projectUrl || 'local'} app=${appDir}`);

execSync('npm run build', {
  cwd: appPath,
  stdio: 'inherit',
  shell: true,
});

if (!fs.existsSync(appDist)) {
  throw new Error(`Expected build output not found: ${appDist}`);
}

fs.rmSync(rootDist, { recursive: true, force: true });
fs.mkdirSync(rootDist, { recursive: true });
fs.cpSync(appDist, rootDist, { recursive: true });

console.log(`[build-vercel] copied ${appDir}/dist -> dist`);
