import * as esbuild from 'esbuild';
import fs from 'fs';

// 1. Minify CSS & JS
await esbuild.build({
  entryPoints: ['styles/main.css', 'scripts/main.js'],
  bundle: true,
  minify: true,
  external: ['*.webp'],
  outdir: 'dist',
  entryNames: '[dir]/[name].min',
});

// 2. Transform index.html for production
const html = fs.readFileSync('index.html', 'utf8')
  .replace('styles/main.css', 'styles/main.min.css')
  .replace('scripts/main.js', 'scripts/main.min.js');

fs.writeFileSync('dist/index.html', html);

// 3. Copy static Netlify files & assets
fs.copyFileSync('_headers', 'dist/_headers');
if (fs.existsSync('assets')) {
  fs.cpSync('assets', 'dist/assets', { recursive: true });
}