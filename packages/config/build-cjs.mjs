// Generate CJS version of the package
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read the ESM output
const esmContent = readFileSync(resolve(__dirname, 'dist/index.js'), 'utf-8');

// Rewrite imports as requires for CJS
let cjs = esmContent
  .replace(/import\s+(\*\s+as\s+)?(\w+)\s+from\s+['"]([^'"]+)['"]/g, (_, star, name, source) => {
    if (star) return `const ${name} = require('${source}');`;
    return `const ${name} = require('${source}');`;
  })
  // Handle re-exports: export { ... } from './...'
  .replace(/export\s+{\s*([^}]+)\s*}\s+from\s+['"]([^'"]+)['"]\s*;?\s*$/gm, (_, exports, source) => {
    return `const { ${exports} } = require('${source}');\nmodule.exports = { ${exports} };`;
  })
  .replace(/export\s+{\s*([^}]+)\s*}/g, (_, exports) => {
    return `module.exports = { ${exports} };`;
  })
  .replace(/export\s+default\s+(\w+)/g, 'module.exports = $1;')
  .replace(/export\s+(async\s+)?function\s+(\w+)/g, (_, asyncKw, name) => {
    return `${asyncKw || ''}function ${name} {`;
  })
  .replace(/export\s+(const|let|var)\s+(\w+)/g, (_, kind, name) => {
    return `${kind} ${name};`;
  });

// Add CJS wrapper
cjs = `'use strict';\n\n${cjs}`;

writeFileSync(resolve(__dirname, 'dist/index.cjs'), cjs, 'utf-8');
console.log('✅ CJS build written to dist/index.cjs');
