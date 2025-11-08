import fs from 'fs';
import path from 'path';
import strip from 'strip-comments';

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const targets = [
  path.join(repoRoot, 'backend', 'src'),
  path.join(repoRoot, 'frontend', 'src')
];
const exts = new Set(['.js', '.jsx', '.ts', '.tsx']);

let filesProcessed = 0;
let filesChanged = 0;

const shouldSkip = (p) => {
  const bn = path.basename(p);
  return bn === 'node_modules' || bn === 'dist' || bn === 'build' || bn === '.git' || bn === 'public';
};

const walk = (dir) => {
  let entries = [];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (shouldSkip(p)) continue;
    if (e.isDirectory()) {
      walk(p);
    } else {
      const ext = path.extname(p).toLowerCase();
      if (!exts.has(ext)) continue;
      let src = '';
      try { src = fs.readFileSync(p, 'utf8'); } catch { continue; }
      filesProcessed++;
      const out = strip(src, { preserveNewlines: true });
      if (out !== src) {
        try { fs.writeFileSync(p, out, 'utf8'); filesChanged++; } catch {}
      }
    }
  }
};

for (const t of targets) walk(t);

console.log(JSON.stringify({ filesProcessed, filesChanged }));
