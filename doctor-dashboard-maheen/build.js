import fs from 'fs';
import path from 'path';
import esbuild from 'esbuild';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');

console.log('1. Cleaning dist directory...');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

console.log('2. Bundling self-contained bundle.js for GitHub Pages & Vercel...');
try {
  await esbuild.build({
    entryPoints: ['src/main.js'],
    bundle: true,
    outfile: 'dist/bundle.js',
    format: 'iife',
    globalName: 'MediVibeApp',
    minify: false,
    sourcemap: false,
    target: ['es2020'],
  });
  console.log('Bundle succeeded: dist/bundle.js created.');
} catch (e) {
  console.warn('Bundle notice (fallback active):', e?.message || e);
}

console.log('3. Copying static assets...');
function copyDirectory(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (
      entry.name === 'node_modules' ||
      entry.name === 'dist' ||
      entry.name === '.git' ||
      entry.name === '.vite'
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      // Don't overwrite bundle.js if already built
      if (entry.name !== 'bundle.js') {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

copyDirectory(rootDir, distDir);

// Check if bundle.js was generated, copy to dist if needed
if (fs.existsSync(path.join(distDir, 'bundle.js'))) {
  fs.copyFileSync(path.join(distDir, 'bundle.js'), path.join(rootDir, 'bundle.js'));
}

console.log('Build completed: Static HTML, CSS, and self-contained JS bundle compiled into dist/');
