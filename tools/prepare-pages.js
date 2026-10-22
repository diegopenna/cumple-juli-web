// GitHub Pages sirve 404.html para rutas como /cumple-juli-web/Ale.
// Regenerar después de editar index.html: node tools/prepare-pages.js
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
fs.writeFileSync(path.join(root, '404.html'), html.replace('<head>', '<head>\n  <base href="/cumple-juli-web/">'));
console.log('404.html actualizado para invitaciones con código en la ruta.');
