#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — KHO MATRIX MANAGER

   Công cụ này quản lý ma trận liên kết nội dung giữa các kho:
     · Đọc metadata từ kho/mau.json và các gói .enc (nếu có khoá)
     · Xây dựng content matrix: mỗi tài liệu liên kết tài liệu tiếp theo
     · Kiểm tra tính toàn vẹn của chuỗi giải pháp
     · Sinh báo cáo kho thiếu/kho dư/kho lạc

   Chạy:
     node tools/kho-matrix.js liet-ke          # liệt kê tất cả các kho
     node tools/kho-matrix.js ma-tran          # xây dựng ma trận liên kết
     node tools/kho-matrix.js kiem             # kiểm tra toàn vẹn
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { webcrypto: wc } = require('crypto');

const ROOT = path.join(__dirname, '..');
const P_KHO = path.join(ROOT, 'kho');
const P_KHOA = path.join(P_KHO, 'khoa.json');
const P_MAU = path.join(P_KHO, 'mau.json');

/* ── Tiện ích ── */
function docKhoa(goi) {
  if (!fs.existsSync(P_KHOA)) return null;
  const j = JSON.parse(fs.readFileSync(P_KHOA, 'utf8'));
  const map = (j && j.khoa) ? j.khoa : j;
  const k = map[goi];
  if (!k) return null;
  return Uint8Array.from(Buffer.from(k, 'base64'));
}

async function giaiGoi(goi) {
  const raw = docKhoa(goi);
  if (!raw) return null;
  const p = path.join(P_KHO, goi + '.enc');
  if (!fs.existsSync(p)) return null;
  const b = new Uint8Array(fs.readFileSync(p));
  if (b.length < 28) return null;
  const iv = b.slice(0, 12), tag = b.slice(12, 28), ct = b.slice(28);
  const kem = new Uint8Array(ct.length + tag.length);
  kem.set(ct); kem.set(tag, ct.length);
  const key = await wc.subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt']);
  let ro;
  try { ro = new Uint8Array(await wc.subtle.decrypt({ name: 'AES-GCM', iv }, key, kem)); }
  catch (e) { return null; }
  const chu = (ro[0] === 0x1f && ro[1] === 0x8b)
    ? zlib.gunzipSync(ro).toString('utf8') : Buffer.from(ro).toString('utf8');
  try { return JSON.parse(chu); } catch (e) { return null; }
}

function keys(o) { return o && typeof o === 'object' ? Object.keys(o) : []; }

function phatHienKho(obj, prefix, found) {
  found = found || new Set();
  if (!obj || typeof obj !== 'object') return found;
  if (Array.isArray(obj)) {
    obj.forEach(v => phatHienKho(v, prefix, found));
    return found;
  }
  keys(obj).forEach(k => {
    const v = obj[k];
    if (typeof v === 'string' && /^G\.[A-Z_][A-Z0-9_]*$/.test(v)) found.add(v);
    else if (typeof k === 'string' && /^[A-Z]{2,}_[A-Z0-9_]+$/.test(k)) {
      found.add((prefix ? prefix + '.' : '') + k);
    }
    phatHienKho(v, prefix, found);
  });
  return found;
}

function goiTuTen(enc) { return enc.replace(/\.enc$/, ''); }

/* ── Lệnh LIET-KE ── */
function lenhLietKe() {
  const encFiles = fs.readdirSync(P_KHO).filter(f => f.endsWith('.enc'));
  const mau = fs.existsSync(P_MAU) ? JSON.parse(fs.readFileSync(P_MAU, 'utf8')) : {};
  const coKhoa = fs.existsSync(P_KHOA);

  console.log('=== KHO MẬT (.enc) ===');
  for (const f of encFiles.sort()) {
    const st = fs.statSync(path.join(P_KHO, f));
    const goi = goiTuTen(f);
    const khoaCo = !!docKhoa(goi);
    console.log(`  ${goi.padEnd(18)} ${String(st.size).padStart(9)} byte   ${khoaCo ? '🔑' : '❌ chưa có khoá'}`);
  }
  console.log('\n=== KHO CÔNG KHAI (mau.json) ===');
  for (const k of keys(mau).sort()) {
    const v = mau[k];
    const loai = Array.isArray(v) ? `[${v.length}]` : typeof v === 'object' ? '{obj}' : typeof v;
    console.log(`  ${k.padEnd(18)} ${loai}`);
  }
  console.log('\nTổng .enc:', encFiles.length, '· Khoá local:', coKhoa ? 'có' : 'không');
}

/* ── Lệnh MA-TRAN ── */
async function lenhMaTran() {
  const encFiles = fs.readdirSync(P_KHO).filter(f => f.endsWith('.enc')).map(goiTuTen);
  const mau = fs.existsSync(P_MAU) ? JSON.parse(fs.readFileSync(P_MAU, 'utf8')) : {};
  const matrix = {};

  /* Nút gốc công khai */
  for (const k of keys(mau)) matrix['mau:' + k] = { nguon: 'mau.json', kieu: 'public', lienKet: [] };

  /* Nút từ các gói mật */
  for (const goi of encFiles) {
    const data = await giaiGoi(goi);
    if (!data) {
      matrix['enc:' + goi] = { nguon: goi + '.enc', kieu: 'encrypted', moDuoc: false, lienKet: [] };
      continue;
    }
    const found = phatHienKho(data, 'G');
    for (const ref of found) matrix['enc:' + goi + ':' + ref] = { nguon: goi + '.enc', kieu: 'encrypted', moDuoc: true, lienKet: [] };
  }

  /* Liên kết đơn giản: public → enc, enc → enc theo quy tắc phân hệ */
  const publicNames = keys(mau);
  for (const pub of publicNames) {
    const encTarget = goiTuTen(encFiles.find(f => f.startsWith('nen')) || 'nen');
    matrix['mau:' + pub].lienKet.push({ den: 'enc:' + encTarget, loai: 'nền' });
  }

  /* enc:nen liên kết nghe */
  if (matrix['enc:nen']) matrix['enc:nen'].lienKet.push({ den: 'enc:nghe', loai: 'chuyên môn' });
  if (matrix['enc:nghe']) {
    for (let i = 1; i <= 5; i++) matrix['enc:nghe'].lienKet.push({ den: 'enc:tang' + i, loai: 'tầng ' + i });
    matrix['enc:nghe'].lienKet.push({ den: 'enc:nghe-cao', loai: 'nâng cao' });
  }

  console.log('=== MA TRẬN NỘI DUNG ===');
  for (const id of Object.keys(matrix).sort()) {
    const n = matrix[id];
    console.log(`\n${id}`);
    console.log(`  nguồn: ${n.nguon} · ${n.kieu}${n.moDuoc === false ? ' · chưa mở được' : ''}`);
    for (const lk of n.lienKet) console.log(`  → ${lk.den} (${lk.loai})`);
  }
}

/* ── Lệnh KIEM ── */
async function lenhKiem() {
  const encFiles = fs.readdirSync(P_KHO).filter(f => f.endsWith('.enc')).map(goiTuTen);
  let loi = 0;
  console.log('=== KIỂM TRA TOÀN VẸN KHO ===');
  for (const goi of encFiles) {
    const data = await giaiGoi(goi);
    if (!data) {
      const khoa = docKhoa(goi);
      console.log(`  ✗ ${goi}.enc không mở được${khoa ? ' (khoá có sẵn)' : ' (thiếu khoá)'}`);
      loi++;
    } else {
      const k = keys(data).length;
      console.log(`  ✓ ${goi}.enc mở được · ${k} khoá đầu cấp 1`);
    }
  }
  if (!fs.existsSync(P_MAU)) { console.log('  ✗ Thiếu kho/mau.json'); loi++; }
  else console.log('  ✓ kho/mau.json tồn tại');
  process.exit(loi ? 1 : 0);
}

/* ── Main ── */
(async function () {
  const lenh = process.argv[2];
  if (lenh === 'liet-ke') { lenhLietKe(); return; }
  if (lenh === 'ma-tran') { await lenhMaTran(); return; }
  if (lenh === 'kiem') { await lenhKiem(); return; }
  console.error('Dùng: liet-ke | ma-tran | kiem');
  process.exit(1);
})();
