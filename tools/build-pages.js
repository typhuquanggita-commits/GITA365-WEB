#!/usr/bin/env node
/*
 GITA 365 — dựng thư mục public cho Cloudflare Pages Git Integration.
 Chỉ chép tài sản cần cho web app; mã máy chủ, công cụ và khoá không bao
 giờ nằm trong output này.
*/
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, '_site');

function cp(from, to) {
  fs.cpSync(path.join(ROOT, from), path.join(OUT, to), { recursive: true });
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

for (const name of fs.readdirSync(ROOT)) {
  if (name.endsWith('.html')) cp(name, name);
}
for (const name of [
  'gita-app.js', 'gita-nghe.js', 'cau-hinh.js', 'sw.js',
  'manifest.webmanifest', '_headers', '_redirects', 'robots.txt', 'sitemap.xml'
]) cp(name, name);
cp('assets', 'assets');
cp('kho', 'kho');
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

for (const name of ['index.html', 'gita-app.js', 'gita-nghe.js']) {
  if (!fs.statSync(path.join(OUT, name)).size) throw new Error('Missing public file: ' + name);
}
for (const name of ['may-chu', 'tools', 'kho-goc', 'kho/khoa.json']) {
  if (fs.existsSync(path.join(OUT, name))) throw new Error('Private path leaked into Pages output: ' + name);
}

console.log('Prepared Cloudflare Pages artifact: ' +
  fs.readdirSync(OUT, { recursive: true }).length + ' entries');
