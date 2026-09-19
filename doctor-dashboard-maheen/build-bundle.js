import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

console.log('Bundling app into dist/bundle.js...');

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
    external: []
  });
  console.log('Bundle created successfully in dist/bundle.js');
} catch (err) {
  console.error('Bundle failed:', err);
  process.exit(1);
}
