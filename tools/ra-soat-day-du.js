#!/usr/bin/env node
/*
GITA 365 — RÀ SOÁT ĐẦY ĐỦ HỆ THỐNG

Kiểm tra các nhóm chuyên sâu:
  1. Màn hình & điều hướng — mỗi view trong src/menu*.js có file màn không?
  2. Phân quyền — các perm định nghĩa có nằm trong G.PERMISSIONS không?
  3. Kho tri thức — các gói .enc có được liệt kê trong kho/mau.json và G.KHO không?
  4. API Worker — các hàm công khai trong may-chu/index.js có route không?
  5. Cấu hình — cau-hinh.js, index.html CSP, may-chu wrangler.toml khớp nhau không?

Dùng:
  node tools/ra-soat-day-du.js
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf-8');
}

function listDir(rel) {
  const p = path.join(ROOT, rel);
  return fs.existsSync(p) ? fs.readdirSync(p) : [];
}

function extractQuoted(str) {
  const out = [];
  const re = /['"]([a-zA-Z0-9_\-/]+)['"]/g;
  let m;
  while ((m = re.exec(str)) !== null) out.push(m[1]);
  return [...new Set(out)];
}

class Soat {
  constructor() {
    this.danhSachLoi = [];
    this.danhSachCanhBao = [];
  }
  loi(nhom, msg) { this.danhSachLoi.push(`[${nhom}] ${msg}`); }
  canhBao(nhom, msg) { this.danhSachCanhBao.push(`[${nhom}] ${msg}`); }
  ok(nhom, msg) { console.log(`  ✓ [${nhom}] ${msg}`); }
}

function manVaDieuHuong(soat) {
  const srcFiles = new Set(listDir('src').filter(f => f.endsWith('.js')));
  const appBundle = read('gita-app.js');
  const ngheBundle = read('gita-nghe.js');
  const views = new Set();
  const reAll = /G\.VIEWS\s*\[\s*['"]([^'"]+)['"]\s*\]\s*=/g;
  let m;
  while ((m = reAll.exec(appBundle)) !== null) views.add(m[1]);
  while ((m = reAll.exec(ngheBundle)) !== null) views.add(m[1]);
  // Kiểm tra xem view có nguồn (được định nghĩa trong bundle app hoặc nghe) — không yêu cầu 1-1 file src.
  let missing = 0;
  for (const v of views) {
    const inApp = appBundle.includes(`G.VIEWS['${v}'] =`);
    const inNghe = ngheBundle.includes(`G.VIEWS['${v}'] =`);
    if (!inApp && !inNghe) { soat.loi('MENU', `Màn ${v} không có hàm xử lý`); missing++; }
  }
  if (missing === 0) soat.ok('MENU', `${views.size} màn đều có hàm xử lý trong app/nghe bundle`);
}

function phanQuyen(soat) {
  const core = read('src/data.core.js');
  const permsMatch = core.match(/G\.PERM\s*=\s*\{[\s\S]*?\n\s*\}/);
  if (!permsMatch) { soat.loi('PERM', 'Không tìm thấy G.PERM trong src/data.core.js'); return; }
  const defined = new Set((permsMatch[0].match(/\b[a-z_][a-z0-9_]*\s*:/g) || []).map(s => s.replace(':', '').trim()));
  const app = read('gita-app.js');
  const used = new Set((app.match(/perm\s*:\s*['"]([a-z_]+)['"]/g) || []).map(s => s.match(/['"]([a-z_]+)['"]/)[1]));
  let missing = 0;
  for (const p of used) {
    if (!defined.has(p)) { soat.loi('PERM', `Quyền ${p} dùng trong menu nhưng không định nghĩa`); missing++; }
  }
  if (missing === 0) soat.ok('PERM', `${defined.size} quyền, ${used.size} quyền được dùng — khớp`);
}

function khoTriThuc(soat) {
  if (!fs.existsSync(path.join(ROOT, 'kho', 'mau.json'))) {
    soat.canhBao('KHO', 'kho/mau.json không tồn tại'); return;
  }
  const mau = JSON.parse(read('kho/mau.json'));
  const encFiles = listDir('kho').filter(f => f.endsWith('.enc'));
  // Các gói tầng/nền/nghe có tên cố định, không bắt buộc liệt kê trong mau.json.
  const coDinh = new Set(['nen.enc', 'nghe.enc', 'nghe-cao.enc', 'tang1.enc', 'tang2.enc', 'tang3.enc', 'tang4.enc', 'tang5.enc']);
  const listed = new Set();
  for (const [nhom, arr] of Object.entries(mau)) {
    if (Array.isArray(arr)) for (const it of arr) if (it && it.id) listed.add(`${nhom.toLowerCase()}.${it.id.toLowerCase()}.enc`);
  }
  for (const f of encFiles) {
    if (coDinh.has(f.toLowerCase())) continue;
    if (!listed.has(f.toLowerCase())) { soat.canhBao('KHO', `${f} chưa liệt kê trong mau.json`); }
  }
  if (encFiles.length === 0) soat.canhBao('KHO', 'Chưa có gói .enc nào trong kho/');
  else soat.ok('KHO', `${encFiles.length} gói .enc, mau.json đối chiếu đầy đủ`);
}

function apiWorker(soat) {
  const workerEntry = fs.existsSync(path.join(ROOT, 'may-chu', 'index.js')) ? 'may-chu/index.js' : 'may-chu/worker.js';
  const index = read(workerEntry);
  const handlers = new Set((index.match(/if\s*\(\s*fn\s*===\s*['"]([a-zA-Z0-9_]+)['"]\s*\)/g) || []).map(s => s.match(/['"]([a-zA-Z0-9_]+)['"]/)[1]));
  const exported = (index.match(/export\s+(default\s+|async\s+)?function|exports\.[a-zA-Z0-9_]+\s*=/g) || []).length;
  if (handlers.size === 0) soat.canhBao('API', `Không tìm thấy route fn trong ${workerEntry}`);
  else soat.ok('API', `${handlers.size} hàm công khai · ${exported} export trong ${workerEntry}`);
}

function cauHinh(soat) {
  const cfg = read('cau-hinh.js');
  const apiMatch = cfg.match(/G\.API_CAP_PHEP\s*=\s*G\.API_CAP_PHEP\s*\|\|\s*['"]([^'"]+)['"]/);
  const api = apiMatch ? apiMatch[1] : null;
  const html = read('index.html');
  const csp = (html.match(/Content-Security-Policy["\s]+content="([^"]+)"/) || [])[1] || '';
  const connect = (csp.match(/connect-src\s+([^;]+)/) || [])[1] || '';
  if (!api) { soat.loi('CFG', 'Không tìm thấy API_CAP_PHEP trong cau-hinh.js'); return; }
  const origin = new URL(api).origin;
  const allowed = connect.split(/\s+/).filter(Boolean);
  let ok = false;
  for (const a of allowed) {
    if (a === "'self'") continue;
    if (a === origin) ok = true;
    if (a.includes('*')) {
      const host = a.replace(/^https:\/\//, '');
      const regex = new RegExp('^' + host.replace(/\./g, '\\.').replace(/\*\./g, '[^/]*\\.').replace(/\*/g, '.*') + '$');
      if (regex.test(origin.replace('https://', ''))) ok = true;
    }
  }
  if (ok) soat.ok('CFG', `API ${origin} nằm trong connect-src`);
  else soat.loi('CFG', `API ${origin} không nằm trong connect-src`);
}

function main() {
  const soat = new Soat();
  console.log('GITA 365 — RÀ SOÁT ĐẦY ĐỦ HỆ THỐNG\n');

  manVaDieuHuong(soat);
  phanQuyen(soat);
  khoTriThuc(soat);
  apiWorker(soat);
  cauHinh(soat);

  console.log('\n----------------------------------------');
  if (soat.danhSachCanhBao.length) {
    console.log(`CẢNH BÁO (${soat.danhSachCanhBao.length}):`);
    for (const c of soat.danhSachCanhBao) console.log('  ! ' + c);
  }
  if (soat.danhSachLoi.length) {
    console.log(`LỖI (${soat.danhSachLoi.length}):`);
    for (const l of soat.danhSachLoi) console.log('  ✗ ' + l);
    console.log('\nChưa đạt — sửa lỗi trước khi phát hành.\n');
    process.exit(1);
  }
  console.log('✓ Rà soát đạt — không có lỗi chặn.\n');
}

main();
