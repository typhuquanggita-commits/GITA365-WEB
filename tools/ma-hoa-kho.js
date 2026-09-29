#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÃ HOÁ / GIẢI MÃ KHO  (khôi phục 9.99.238)

   Mã hoá nội dung một gói thành kho/<gói>.enc, hoặc giải mã ngược lại.
   Khoá đọc từ kho/khoa.json (bản đồ .khoa). Định dạng .enc khớp ĐÚNG
   cách máy khách giải mã (src/kho-khoa.js):

        [ IV 12 byte ][ tag GCM 16 byte ][ bản mã ]
        ruột = JSON, nén gzip trước khi mã hoá (máy khách tự nhận:
        gzip mở đầu 0x1f 0x8b, JSON mở đầu '{').
        AES-256-GCM, khoá = base64 → 32 byte.

   Dùng:
     node tools/ma-hoa-kho.js ma   <gói> <ruột.json>   # mã hoá → kho/<gói>.enc
     node tools/ma-hoa-kho.js giai <gói> [ra.json]     # giải mã (mặc định in ra)
     node tools/ma-hoa-kho.js khoa-moi                 # in một khoá AES-256 mới

   Ví dụ phát khoá + dựng nội dung cho một gói mới:
     1) node tools/ma-hoa-kho.js khoa-moi   → dán vào kho/khoa.json (.khoa.<gói>)
     2) node tools/ma-hoa-kho.js ma <gói> noi-dung.json
     3) nạp lại secret: cat kho/khoa.json | npx wrangler secret put GITA_KHOA_KHO
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { webcrypto: wc } = require('crypto');

const ROOT = path.join(__dirname, '..');
const P_KHOA = path.join(ROOT, 'kho', 'khoa.json');

function docKhoa(goi) {
  if (!fs.existsSync(P_KHOA))
    throw new Error('Thiếu kho/khoa.json — không có bộ khoá để mã hoá/giải mã.');
  const j = JSON.parse(fs.readFileSync(P_KHOA, 'utf8'));
  const map = (j && j.khoa) ? j.khoa : j;   // chấp nhận cả {khoa:{…}} lẫn {…}
  const k = map[goi];
  if (!k) throw new Error('Không có khoá cho gói "' + goi + '" trong kho/khoa.json.');
  return Uint8Array.from(Buffer.from(k, 'base64'));
}

async function ma(goi, ruotFile) {
  const raw = docKhoa(goi);
  const json = fs.readFileSync(path.join(ROOT, ruotFile));   // ruột JSON (byte)
  JSON.parse(json.toString('utf8'));                          // kiểm JSON hợp lệ
  const nen = zlib.gzipSync(json, { level: 9 });
  const iv = wc.getRandomValues(new Uint8Array(12));
  const key = await wc.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt']);
  const out = new Uint8Array(await wc.subtle.encrypt({ name: 'AES-GCM', iv }, key, nen));
  const tag = out.slice(out.length - 16), ct = out.slice(0, out.length - 16);
  const file = new Uint8Array(28 + ct.length);
  file.set(iv, 0); file.set(tag, 12); file.set(ct, 28);
  const ra = path.join(ROOT, 'kho', goi + '.enc');
  fs.writeFileSync(ra, Buffer.from(file));
  console.log('✓ ' + path.relative(ROOT, ra) + ' · ' + file.length + ' byte');
}

async function giai(goi, raFile) {
  const raw = docKhoa(goi);
  const b = new Uint8Array(fs.readFileSync(path.join(ROOT, 'kho', goi + '.enc')));
  const iv = b.slice(0, 12), tag = b.slice(12, 28), maB = b.slice(28);
  const kem = new Uint8Array(maB.length + tag.length); kem.set(maB); kem.set(tag, maB.length);
  const key = await wc.subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt']);
  const ro = new Uint8Array(await wc.subtle.decrypt({ name: 'AES-GCM', iv }, key, kem));
  const chu = (ro[0] === 0x1f && ro[1] === 0x8b)
    ? zlib.gunzipSync(ro).toString('utf8') : Buffer.from(ro).toString('utf8');
  JSON.parse(chu); // kiểm
  if (raFile) { fs.writeFileSync(path.join(ROOT, raFile), chu); console.log('✓ giải mã → ' + raFile); }
  else process.stdout.write(chu);
}

(async function () {
  const [lenh, goi, tep] = process.argv.slice(2);
  try {
    if (lenh === 'ma' && goi && tep) await ma(goi, tep);
    else if (lenh === 'giai' && goi) await giai(goi, tep);
    else if (lenh === 'khoa-moi')
      console.log(Buffer.from(wc.getRandomValues(new Uint8Array(32))).toString('base64'));
    else { console.error('Dùng: ma <gói> <ruột.json> | giai <gói> [ra.json] | khoa-moi'); process.exit(1); }
  } catch (e) { console.error('✗ ' + e.message); process.exit(1); }
})();
