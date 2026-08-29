import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const svgPath = path.join(root, 'src/app/icon.svg');
const svg = fs.readFileSync(svgPath);

function pngToIco(png, width, height) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  const dir = Buffer.alloc(16);
  dir.writeUInt8(width >= 256 ? 0 : width, 0);
  dir.writeUInt8(height >= 256 ? 0 : height, 1);
  dir.writeUInt8(0, 2);
  dir.writeUInt8(0, 3);
  dir.writeUInt16LE(1, 4);
  dir.writeUInt16LE(32, 6);
  dir.writeUInt32LE(png.length, 8);
  dir.writeUInt32LE(22, 12);

  return Buffer.concat([header, dir, png]);
}

async function renderPng(size) {
  return sharp(svg, { density: 384 }).resize(size, size).png().toBuffer();
}

const appleIcon = await renderPng(180);
const faviconPng = await renderPng(32);

fs.writeFileSync(path.join(root, 'src/app/apple-icon.png'), appleIcon);
fs.writeFileSync(path.join(root, 'public/favicon.ico'), pngToIco(faviconPng, 32, 32));
fs.copyFileSync(svgPath, path.join(root, 'public/favicon.svg'));

console.warn('Generated src/app/apple-icon.png, public/favicon.ico, and public/favicon.svg');
