import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const TEXT_EXTENSIONS = new Set(['.js', '.css', '.html', '.svg', '.json', '.xml', '.txt']);
const MIN_SIZE_BYTES = 1024;

function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(fullPath);
      continue;
    }
    yield fullPath;
  }
}

function compressFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!TEXT_EXTENSIONS.has(ext)) return;

  const source = fs.readFileSync(filePath);
  if (source.length < MIN_SIZE_BYTES) return;

  const gz = zlib.gzipSync(source, { level: 9 });
  const br = zlib.brotliCompressSync(source, {
    params: {
      [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
      [zlib.constants.BROTLI_PARAM_SIZE_HINT]: source.length,
    },
  });

  fs.writeFileSync(`${filePath}.gz`, gz);
  fs.writeFileSync(`${filePath}.br`, br);
}

if (!fs.existsSync(DIST_DIR)) {
  console.error('dist directory not found. Run frontend build first.');
  process.exit(1);
}

for (const filePath of walk(DIST_DIR)) {
  compressFile(filePath);
}

console.log('Asset compression complete (.gz + .br).');
