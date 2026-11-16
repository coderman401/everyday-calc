// After the build: make unknown addresses answer with a real 404.
// Firebase Hosting serves /404.html with status 404 for any path that is not a file. The app's
// client-side shell (index.csr.html) boots there and shows its "not here" page, so a mistyped
// address is a true 404 for search engines instead of a home page served as a 200.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const out = 'dist/calculators/browser';
if (!existsSync(`${out}/index.csr.html`)) {
  console.error(`post-build: ${out}/index.csr.html is missing, so no 404 page was made. Did the build run?`);
  process.exit(1);
}
const shell = readFileSync(`${out}/index.csr.html`, 'utf8');
const notFound = shell.replace('</head>', '<meta name="robots" content="noindex, follow"></head>');
writeFileSync(`${out}/404.html`, notFound);
console.log('post-build: wrote 404.html');
