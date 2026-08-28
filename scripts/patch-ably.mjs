import fs from 'fs';
import path from 'path';

const filesToPatch = [
  'node_modules/ably/build/ably.js',
  'node_modules/ably/build/ably.min.js',
  'node_modules/ably/build/ably-node.js',
  'node_modules/ably/build/modular/index.mjs',
];

for (const relPath of filesToPatch) {
  const fullPath = path.resolve(process.cwd(), relPath);
  if (!fs.existsSync(fullPath)) continue;

  let content = fs.readFileSync(fullPath, 'utf8');

  // Replace var __super = ... with super()
  content = content.replace(
    /constructor\s*\(([^)]*)\)\s*\{\s*var\s+__super\s*=\s*\([^)]*\)\s*=>\s*\{\s*super\([^)]*\);\s*\};/g,
    'constructor($1) { super(typeof messageOrValues === "object" ? messageOrValues?.message : messageOrValues);'
  );

  content = content.replace(/__super\(([^)]*)\);/g, '');

  fs.writeFileSync(fullPath, content, 'utf8');
  console.warn(`Successfully patched ${relPath}`);
}
