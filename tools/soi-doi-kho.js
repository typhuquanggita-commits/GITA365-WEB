#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — SOI THAY ĐỔI CỦA KHO SO VỚI BẢN ĐÃ PHÁT HÀNH

       node tools/soi-doi-kho.js

   Vì sao cần tệp này. kho-goc/ nằm trong .gitignore — đó là chủ ý, vì
   nội dung gốc chưa mã hoá không được lên kho mã. Nhưng cái giá là:
   sửa nhầm kho-goc thì KHÔNG CÓ GIT ĐỂ LÙI, và cũng không có diff để
   nhìn trước khi đóng gói.

   Chuyện đã xảy ra thật ở bản 9.5.1: một phép tách câu tự động chạy
   trên toàn bộ kho-goc, đổi 18.672 chỗ, và không ai thấy gì cho tới
   khi bộ kiểm đỏ. Phần cứu được là nhờ kho/*.enc đã phát hành nằm
   TRONG git — bảy gói mã hoá ấy là bản lưu duy nhất của nội dung.

   Nên tệp này làm đúng một việc: giải mã bảy gói ở lần commit gần nhất,
   giải mã bảy gói vừa đóng, rồi nói thẳng kho nào đổi, đổi bao nhiêu
   bản ghi, và bản ghi nào biến mất. Chạy nó TRƯỚC khi đẩy là thấy được
   sức công phá của việc mình vừa làm.

   Không có kho/khoa.json thì bỏ qua — máy dựng bản công khai không giữ
   khoá, và đó là đúng.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
/* ── Ruột của một gói sau khi giải mã ──
   Từ bản 9.9 ruột được NÉN trước rồi mới mã hoá, nên sau khi giải mã có
   thể là gzip. Nhận ra bằng hai byte đầu: JSON luôn mở bằng '{' (0x7B),
   gzip luôn mở bằng 0x1F 0x8B — không bao giờ trùng, nên gói cũ chưa nén
   vẫn đọc được y như trước. */
const zlibGoi = require('zlib');
function ruotGoi(ro) {
  const b = Buffer.isBuffer(ro) ? ro : Buffer.from(ro);
  return JSON.parse((b[0] === 0x1f && b[1] === 0x8b ? zlibGoi.gunzipSync(b) : b).toString('utf8'));
}

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const { daTienSangDaChot } = require('./so-cho');

const GOC = path.join(__dirname, '..');

function mo(khoaB64, buf) {
  const de = crypto.createDecipheriv('aes-256-gcm', Buffer.from(khoaB64, 'base64'), buf.subarray(0, 12));
  de.setAuthTag(buf.subarray(12, 28));
  return ruotGoi(Buffer.concat([de.update(buf.subarray(28)), de.final()]));
}

let khoa;
try {
  khoa = JSON.parse(fs.readFileSync(path.join(GOC, 'kho', 'khoa.json'), 'utf8')).khoa;
} catch (e) {
  console.log('Không có kho/khoa.json — bỏ qua phép soi này.');
  process.exit(0);
}

/* Đếm bản ghi của một kho, dù nó là mảng hay object */
function dem(v) {
  if (Array.isArray(v)) return v.length;
  if (v && typeof v === 'object') return Object.keys(v).length;
  return v === undefined ? 0 : 1;
}
function maCua(x) { return (x && (x.ma || x.id || x.code)) || null; }

/* Gộp bảy gói phải NỐI mảng, không gán đè — ứng dụng nối, nên phép so
   cũng phải nối. Gán đè thì một kho trải năm gói chỉ còn phần của gói
   cuối, và tệp này sẽ hô "mất tám trăm bản ghi" ở chỗ không mất gì. */
function gop(dich, nguon) {
  Object.keys(nguon).forEach(k => {
    if (Array.isArray(dich[k]) && Array.isArray(nguon[k])) dich[k] = dich[k].concat(nguon[k]);
    else dich[k] = nguon[k];
  });
}
const CU = {}, NAY = {};
/* MỘT GÓI MỚI KHÔNG PHẢI LÀ "CHƯA CÓ BẢN CŨ".
   Bản đầu viết `catch { coCu = false }` cho MỌI gói, nên thêm một gói thứ
   tám là cả phép so tắt ngóm và in ra "đây là lần đóng gói đầu" — đúng
   vào lúc cần nó nhất, vì thêm gói bao giờ cũng đi kèm việc CẮT nội dung
   ra khỏi gói cũ, và cắt nhầm thì mất hẳn.
   Nay đếm: gói nào có bản cũ thì so gói ấy, gói nào chưa có thì ghi tên
   ra. Chỉ khi KHÔNG gói nào có bản cũ mới là lần đóng gói đầu. */
const goiMoi = [];
let soCoCu = 0;
for (const g of Object.keys(khoa)) {
  const tep = path.join(GOC, 'kho', g + '.enc');
  if (fs.existsSync(tep)) gop(NAY, mo(khoa[g], fs.readFileSync(tep)));
  try {
    gop(CU, mo(khoa[g], execSync('git show HEAD:kho/' + g + '.enc',
      { cwd: GOC, maxBuffer: 1 << 30, encoding: 'buffer' })));
    soCoCu++;
  } catch (e) { goiMoi.push(g); }
}
if (!soCoCu) {
  console.log('Chưa có bản đã phát hành trong git để so — đây là lần đóng gói đầu.');
  process.exit(0);
}
if (goiMoi.length)
  console.log('  GÓI MỚI CHƯA TỪNG PHÁT HÀNH: ' + goiMoi.join(' · ') +
    '\n  (nội dung của chúng vẫn được tính vào phép so bên dưới)\n');

const ten = [...new Set(Object.keys(CU).concat(Object.keys(NAY)))].sort();
const doi = [], mat = [], them = [], hut = [], chuyen = [];

/* Mọi mã bản ghi đang có mặt ở BẤT KỲ kho nào của bản vừa đóng. Tách một
   kho làm hai cho đúng phạm vi cấp phép làm kho cũ hụt bản ghi mà không
   mất chữ nào — hỏi "mã này còn ở đâu không" mới phân biệt được chuyển
   kho với mất nội dung. */
const maToanKho = new Set();
Object.keys(NAY).forEach(k => {
  if (Array.isArray(NAY[k])) NAY[k].forEach(x => { const m = maCua(x); if (m) maToanKho.add(m); });
});
ten.forEach(k => {
  const a = CU[k], b = NAY[k];
  if (a !== undefined && b === undefined) { mat.push(k); return; }
  if (a === undefined && b !== undefined) { them.push(k + ' (' + dem(b) + ')'); return; }
  if (JSON.stringify(a) === JSON.stringify(b)) return;
  const na = dem(a), nb = dem(b);
  doi.push({ k, na, nb });
  const coMa = Array.isArray(a) && Array.isArray(b) && a.length && maCua(a[0]);
  const roiKho = coMa ? a.map(maCua).filter(m => m && b.map(maCua).indexOf(m) < 0) : [];
  const sangKhoKhac = roiKho.length && roiKho.every(m => maToanKho.has(m));
  /* Sổ chờ vơi đi vì mục được TIỄN sang `X_DACHOT` là chuyện ĐÚNG
     (luật 9.99.61). Phép trừ ấy sống ở `tools/so-cho.js` và cả
     `kho-luu.js` lẫn tệp này cùng TRỎ vào — chép sang là dựng bản thứ
     hai của một sự thật, và bản trôi thì không ai thấy vì bản kia vẫn
     đúng.

     Vì sao vế này phải có ở ĐÂY, không chỉ ở `kho-luu.js`: tệp này là
     bộ soi chạy TRƯỚC MỖI LƯỢT ĐẨY, tức là bộ báo động chính. Phá thử
     (bỏ ô `ma` khỏi mục đã tiễn, rồi tắt phép trừ này) cho ra đúng hai
     dòng đỏ oan: "QA_CHOCHU 1 → 0" và "QA_CHOCHU mất mã: WOW-01" —
     trong khi WOW-01 nằm nguyên trong QA_DACHOT. Một phép kiểm báo mất
     nhầm thì lần sau người ta tắt nó đi, đúng vào lúc có chỗ mất thật.

     Vế `sangKhoKhac` ở trên KHÔNG thay được vế này: nó lần theo mã bản
     ghi, mà mấy sổ chờ không đánh mã thì câu hỏi chính là định danh. */
  const tien = (nb < na) ? daTienSangDaChot(k, na - nb, NAY, dem) : null;
  if (sangKhoKhac) chuyen.push(k + ' ' + na + ' → ' + nb + ' (' + roiKho.join(' ') + ' sang kho khác)');
  else if (tien) chuyen.push(k + ' ' + na + ' → ' + nb + ' (' + (na - nb) +
    ' mục đã trả lời, tiễn sang ' + tien.chot + ' — gỡ khỏi sổ chờ, không xoá)');
  else if (nb < na) hut.push(k + ' ' + na + ' → ' + nb);
  /* Bản ghi biến mất theo mã — đây là dấu hiệu hỏng rõ nhất. Mã còn ở
     kho khác thì là chuyển kho, không phải mất. */
  if (coMa && !tien) {
    const bay = a.map(maCua).filter(m => m && !maToanKho.has(m));
    if (bay.length) hut.push(k + ' mất mã: ' + bay.slice(0, 5).join(' ') + (bay.length > 5 ? ' …' : ''));
  }
});

console.log('\n─────────── KHO ĐỔI GÌ SO VỚI BẢN ĐÃ PHÁT HÀNH ───────────');
console.log('  tổng kho: ' + ten.length + ' · đổi nội dung: ' + doi.length +
  ' · thêm mới: ' + them.length + ' · biến mất: ' + mat.length);
if (them.length) console.log('\n  KHO MỚI\n    ' + them.join('\n    '));
if (mat.length)  console.log('\n  ⚠ KHO BIẾN MẤT\n    ' + mat.join('\n    '));
if (doi.length) {
  console.log('\n  KHO ĐỔI NỘI DUNG');
  doi.forEach(d => console.log('    ' + d.k.padEnd(20) +
    (d.na === d.nb ? d.na + ' bản ghi, đổi nội dung' : d.na + ' → ' + d.nb + ' bản ghi')));
}
if (chuyen.length) {
  console.log('\n  BẢN GHI CHUYỂN KHO — hụt ở kho cũ nhưng không mất chữ nào');
  chuyen.forEach(x => console.log('    ' + x));
}
if (hut.length) {
  console.log('\n  ⚠⚠ CHỖ CẦN NHÌN KỸ — có thứ ÍT ĐI hoặc BIẾN MẤT');
  hut.forEach(x => console.log('    ' + x));
  console.log('\n  Nội dung ít đi hầu như luôn là hỏng, không phải sửa.');
  console.log('  Nếu đúng là chủ ý thì bỏ qua; nếu không thì DỪNG, đừng đẩy.');
}
if (!doi.length && !mat.length && !them.length)
  console.log('\n  Không kho nào đổi. Gói vừa đóng giống hệt bản đã phát hành.');
console.log('');
process.exit(0);
