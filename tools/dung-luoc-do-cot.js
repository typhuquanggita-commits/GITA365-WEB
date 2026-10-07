#!/usr/bin/env node
/* GITA 365 — DỰNG BẢN ĐỒ CỘT CHO MÁY CHỦ TỰ VÁ LƯỢC ĐỒ (V50·168)

   csdl.sql chỉ có CREATE TABLE IF NOT EXISTS: chạy lại trên một D1 đã có bảng
   thì cột THÊM SAU (vd users.phongBan, offboardedAt…) không bao giờ tới. Công
   cụ này rút mọi bảng · cột từ csdl.sql ra may-chu/luoc-do-cot.js; máy chủ
   (va-luoc-do.js) so với PRAGMA table_info và ALTER TABLE ADD COLUMN cột thiếu.

   Dùng:  node tools/dung-luoc-do-cot.js          → ghi may-chu/luoc-do-cot.js
          node tools/dung-luoc-do-cot.js --kiem   → CI: báo lệch nếu csdl.sql đổi */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SQL = fs.readFileSync(path.join(ROOT, 'may-chu/csdl.sql'), 'utf8');
const RA = path.join(ROOT, 'may-chu/luoc-do-cot.js');

function boChuThich(s) { return s.split('\n').map(l => { const k = l.indexOf('--'); return k >= 0 ? l.slice(0, k) : l; }).join('\n'); }
function tach(s) { let d = 0, o = [], cu = ''; for (const c of s) { if (c === '(') d++; if (c === ')') d--; if (c === ',' && d === 0) { o.push(cu); cu = ''; } else cu += c; } if (cu.trim()) o.push(cu); return o; }
const goc = boChuThich(SQL);
const bang = {};
const re = /CREATE TABLE IF NOT EXISTS\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
let m;
while ((m = re.exec(goc))) {
  let i = m.index + m[0].length, d = 1, j = i;
  while (j < goc.length && d > 0) { if (goc[j] === '(') d++; else if (goc[j] === ')') d--; j++; }
  const cot = [];
  for (let p of tach(goc.slice(i, j - 1))) {
    p = p.replace(/\s+/g, ' ').trim(); if (!p) continue;
    if (/^(PRIMARY KEY|UNIQUE|FOREIGN KEY|CHECK|CONSTRAINT)\b/i.test(p)) continue;
    const mm = p.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*(.*)$/); if (!mm) continue;
    cot.push([mm[1], mm[2]]);
  }
  if (!bang[m[1]]) bang[m[1]] = cot;
}
const noiDung = '/* TỆP DỰNG RA — đừng sửa tay. Nguồn: may-chu/csdl.sql + tools/dung-luoc-do-cot.js\n' +
  '   Bản đồ bảng → [cột, khai báo] cho va-luoc-do.js tự thêm cột còn thiếu. */\n' +
  'export const LUOC_DO_COT = ' + JSON.stringify(bang) + ';\n';
if (process.argv.includes('--kiem')) {
  const cu = fs.existsSync(RA) ? fs.readFileSync(RA, 'utf8') : '';
  if (cu !== noiDung) { console.error('✗ may-chu/luoc-do-cot.js lệch csdl.sql — chạy: node tools/dung-luoc-do-cot.js'); process.exit(1); }
  console.log('✓ Bản đồ cột khớp csdl.sql: ' + Object.keys(bang).length + ' bảng');
} else {
  fs.writeFileSync(RA, noiDung);
  console.log('✓ Đã dựng may-chu/luoc-do-cot.js: ' + Object.keys(bang).length + ' bảng · ' + Object.values(bang).reduce((a, c) => a + c.length, 0) + ' cột');
}
