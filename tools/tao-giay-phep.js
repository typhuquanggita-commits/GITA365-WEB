#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — TẠO GIẤY PHÉP MÁY TÍNH / BẢN MỘT TỆP

   Dùng:
     node tools/tao-giay-phep.js "Tên người dùng" [số-tháng]

   Sinh một tệp .json chứa bộ khoá được cấp. Tệp này KHÔNG đưa lên
   GitHub; nó chỉ giao cho người được cấp để nạp vào ứng dụng.

   Yêu cầu: kho/khoa.json phải tồn tại.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const P_KHOA = path.join(ROOT, 'kho', 'khoa.json');
const P_GIAY_PHEP = path.join(ROOT, 'giay-phep');

function ngayHetHan(thang) {
  const d = new Date();
  d.setMonth(d.getMonth() + (Number(thang) || 24));
  return d.toISOString().slice(0, 10);
}

function main() {
  if (!fs.existsSync(P_KHOA)) {
    console.error('✗ Thiếu kho/khoa.json — không thể tạo giấy phép.');
    process.exit(1);
  }

  const ten = process.argv[2];
  const thang = Number(process.argv[3]) || 24;
  if (!ten || ten.length < 2) {
    console.error('Dùng: node tools/tao-giay-phep.js "Tên người dùng" [số-tháng]');
    process.exit(1);
  }

  const khoa = JSON.parse(fs.readFileSync(P_KHOA, 'utf8'));
  const map = (khoa && khoa.khoa) ? khoa.khoa : khoa;
  if (!map || typeof map !== 'object' || !Object.keys(map).length) {
    console.error('✗ kho/khoa.json không có bộ khoá hợp lệ.');
    process.exit(1);
  }

  const so = 'GP-' + crypto.randomUUID().slice(0, 8).toUpperCase();
  const gp = {
    soGiayPhep: so,
    capCho: ten.trim(),
    taoLuc: new Date().toISOString(),
    hetHan: ngayHetHan(thang) + 'T23:59:59.000Z',
    khoa: map
  };

  if (!fs.existsSync(P_GIAY_PHEP)) fs.mkdirSync(P_GIAY_PHEP, { recursive: true });
  const out = path.join(P_GIAY_PHEP, so + '.json');
  fs.writeFileSync(out, JSON.stringify(gp, null, 2));
  console.log('✓ Đã tạo giấy phép', so);
  console.log('  Cấp cho :', gp.capCho);
  console.log('  Hết hạn :', gp.hetHan);
  console.log('  File    :', path.relative(ROOT, out));
  console.log('  Gói     :', Object.keys(map).join(', '));
}

main();
