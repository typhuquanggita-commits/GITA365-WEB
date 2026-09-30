#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — KHO MANAGER

   Công cụ quản lý kho nội dung: biên soạn, liên kết, mã hóa.
   Tất cả thao tác trên kho mật đều yêu cầu kho/khoa.json.

   Lệnh:
     node tools/kho-manager.js them-yt <goi-dich.enc> [--xuat-ra <file>]
        Ghép bộ 8 prompt YouTube vào gói nghề hiện có.
     node tools/kho-manager.js tao-goi <ten-goi> <noi-dung.json>
        Tạo gói mới từ JSON và mã hóa.
     node tools/kho-manager.js lien-ket <goi> <ma-nut> <den-goi> <den-ma>
        Thêm liên kết trong content matrix.
     node tools/kho-manager.js thong-ke
        Thống kê kích thước, số khối, liên kết.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { webcrypto: wc } = require('crypto');

const ROOT = path.join(__dirname, '..');
const P_KHO = path.join(ROOT, 'kho');
const P_KHOA = path.join(P_KHO, 'khoa.json');
const P_YT = path.join(ROOT, 'tools', 'youtube-prompts.json');

function docKhoa(goi) {
  if (!fs.existsSync(P_KHOA))
    throw new Error('Thiếu kho/khoa.json');
  const j = JSON.parse(fs.readFileSync(P_KHOA, 'utf8'));
  const map = (j && j.khoa) ? j.khoa : j;
  const k = map[goi];
  if (!k) throw new Error('Không có khoá cho gói "' + goi + '"');
  return Uint8Array.from(Buffer.from(k, 'base64'));
}

function themKhoa(goi, base64Key) {
  const j = fs.existsSync(P_KHOA) ? JSON.parse(fs.readFileSync(P_KHOA, 'utf8')) : { khoa: {} };
  if (!j.khoa) j.khoa = j;
  if (!j.khoa) j.khoa = {};
  j.khoa[goi] = base64Key;
  fs.writeFileSync(P_KHOA, JSON.stringify(j, null, 2));
  console.log('✓ Đã thêm khoá cho gói', goi);
}

async function maHoa(goi, duongDanNguon) {
  const raw = docKhoa(goi);
  const json = fs.readFileSync(duongDanNguon);
  JSON.parse(json.toString('utf8'));
  const nen = zlib.gzipSync(json, { level: 9 });
  const iv = wc.getRandomValues(new Uint8Array(12));
  const key = await wc.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt']);
  const out = new Uint8Array(await wc.subtle.encrypt({ name: 'AES-GCM', iv }, key, nen));
  const tag = out.slice(out.length - 16), ct = out.slice(0, out.length - 16);
  const file = new Uint8Array(28 + ct.length);
  file.set(iv, 0); file.set(tag, 12); file.set(ct, 28);
  const ra = path.join(P_KHO, goi + '.enc');
  fs.writeFileSync(ra, Buffer.from(file));
  console.log('✓ Mã hóa', goi, '→', path.relative(ROOT, ra), file.length, 'byte');
}

async function giaiMa(goi) {
  const raw = docKhoa(goi);
  const b = new Uint8Array(fs.readFileSync(path.join(P_KHO, goi + '.enc')));
  const iv = b.slice(0, 12), tag = b.slice(12, 28), ct = b.slice(28);
  const kem = new Uint8Array(ct.length + tag.length); kem.set(ct); kem.set(tag, ct.length);
  const key = await wc.subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt']);
  const ro = new Uint8Array(await wc.subtle.decrypt({ name: 'AES-GCM', iv }, key, kem));
  const chu = (ro[0] === 0x1f && ro[1] === 0x8b)
    ? zlib.gunzipSync(ro).toString('utf8') : Buffer.from(ro).toString('utf8');
  return JSON.parse(chu);
}

async function lenhThemYT() {
  const goi = process.argv[3];
  if (!goi) { console.error('Thiếu tên gói đích. Ví dụ: nghe'); process.exit(1); }
  const yt = JSON.parse(fs.readFileSync(P_YT, 'utf8'));
  const data = await giaiMa(goi);
  data.BP_YT_VAI4 = yt.BP_YT_VAI4;
  data.BP_YT_KHOI = yt.BP_YT_KHOI;
  data.BP_YT_VONG = yt.BP_YT_VONG;
  data.BP_YT_NOI = yt.BP_YT_NOI;
  data.BP_YT_LUAT = yt.BP_YT_LUAT;
  const tmp = path.join(ROOT, 'tmp-' + goi + '.json');
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  await maHoa(goi, tmp);
  fs.unlinkSync(tmp);
  console.log('✓ Đã ghép bộ prompt YouTube vào', goi + '.enc');
}

async function lenhTaoGoi() {
  const goi = process.argv[3];
  const nguon = process.argv[4];
  if (!goi || !nguon) { console.error('Dùng: tao-goi <ten-goi> <noi-dung.json>'); process.exit(1); }
  if (!fs.existsSync(P_KHOA) || !docKhoa(goi)) {
    const k = Buffer.from(wc.getRandomValues(new Uint8Array(32))).toString('base64');
    themKhoa(goi, k);
  }
  await maHoa(goi, path.resolve(nguon));
}

async function lenhThongKe() {
  const encFiles = fs.readdirSync(P_KHO).filter(f => f.endsWith('.enc'));
  let tongByte = 0;
  console.log('=== THỐNG KÊ KHO ===');
  for (const f of encFiles.sort()) {
    const st = fs.statSync(path.join(P_KHO, f));
    tongByte += st.size;
    const goi = f.replace(/\.enc$/, '');
    let soKhoi = '?';
    try {
      const data = await giaiMa(goi);
      soKhoi = Object.keys(data).length;
    } catch (e) { soKhoi = '—'; }
    console.log(`  ${goi.padEnd(18)} ${String(st.size).padStart(9)} byte · ${soKhoi} khối`);
  }
  console.log(`Tổng: ${tongByte} byte (${(tongByte / 1024 / 1024).toFixed(2)} MB)`);
}

/* ── Main ── */
(async function () {
  const lenh = process.argv[2];
  try {
    if (lenh === 'them-yt') await lenhThemYT();
    else if (lenh === 'tao-goi') await lenhTaoGoi();
    else if (lenh === 'thong-ke') await lenhThongKe();
    else {
      console.error('Dùng: them-yt <goi> | tao-goi <ten> <json> | thong-ke');
      process.exit(1);
    }
  } catch (e) {
    console.error('✗', e.message);
    process.exit(1);
  }
})();
