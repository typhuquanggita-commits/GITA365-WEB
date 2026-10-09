#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MỘT CHỖ DUY NHẤT BIẾT CÁCH ĐỌC MỘT MỤC CHỜ

   ══ VÌ SAO TÁCH RA THÀNH MÔ-ĐUN ══

   Câu hỏi của một mục chờ nằm ở BA tên ô khác nhau, vì 33 sổ chờ được
   dựng ở 33 thời điểm: sổ này gọi là `t` (35 mục), sổ kia `viec` (16),
   sổ nữa `hoi` (13). Và không phải sổ nào cũng có ô `ma` — BLV · BV ·
   CS · SV · T5P dựng theo lối "hỏi rồi ghi câu trả lời ngay cạnh".

   Chuyện này đã cắn một lần ở 9.99.63: `soat-san-sang.js` có HAI chỗ
   đọc tên viết tay, mỗi chỗ biết một nửa danh sách, nên phần nhắc in ra
   "CC-TEN · undefined" cho ba mục và ba dòng trống cho mấy mục không
   đánh mã. Lần ấy gom về một hàm — nhưng gom vào một biến CỤC BỘ trong
   chính tệp ấy.

   Nên lần này, khi `phieu-quyet.js` cần đúng ba hàm đó, nó đứng trước
   đúng hai lựa chọn: chép sang, hoặc tách ra. Chép sang là dựng bản thứ
   hai của một sự thật lần thứ BA — và bản thứ hai thì mục trong im
   lặng, vì bản thứ nhất vẫn đúng.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

const GOC = path.resolve(__dirname, '..');

/* ── ĐỌC TÊN MỘT MỤC ──
   Thứ tự `viec → hoi → t → o` giữ nguyên như bản ở soat-san-sang.js.
   Đổi thứ tự là đổi câu in ra của những mục mang nhiều hơn một ô. */
function cau(x) {
  return String((x && (x.viec || x.hoi || x.t || x.o)) || '')
    .replace(/\s+/g, ' ').trim();
}
function cauGon(x, tran) { return cau(x).slice(0, tran || 70); }
function ten(x) { return (x && x.ma) || cauGon(x) || '(mục không tên)'; }
function nhan(x) {
  if (!x) return '(mục không tên)';
  return x.ma ? (cauGon(x) ? x.ma + ' · ' + cauGon(x) : x.ma) : (cauGon(x) || '(mục không tên)');
}

/* ── ĐỌC MỌI SỔ CHỜ TỪ GÓI ĐÃ MÃ HOÁ ──

   Đọc thẳng từ `kho/*.enc` chứ không mở trình duyệt. Hai lý do:

     · Rẻ hơn nhiều — không dựng trang, không đăng nhập, không chờ gói.
     · Và quan trọng hơn: đọc được kể cả khi bản web đang hỏng. Một bộ
       nhắc việc chỉ chạy được lúc mọi thứ đang tốt là một bộ nhắc việc
       im lặng đúng lúc cần nó nhất.

   Nhặt theo HÌNH TÊN `*_CHOCHU`, không theo danh sách khai tay — một sổ
   mới là nó tự có mặt. Bỏ `*_CHOCHU_LUAT`: đó là luật của sổ, không
   phải mục chờ. Bỏ `*_DACHOT`: đã trả lời rồi, giữ lại để đọc chứ không
   còn chờ ai. */
function moGoi(khoaB64, buf) {
  const de = crypto.createDecipheriv('aes-256-gcm', Buffer.from(khoaB64, 'base64'), buf.subarray(0, 12));
  de.setAuthTag(buf.subarray(12, 28));
  const r = Buffer.concat([de.update(buf.subarray(28)), de.final()]);
  return JSON.parse((r[0] === 0x1f && r[1] === 0x8b ? zlib.gunzipSync(r) : r).toString('utf8'));
}

function docKhoTuEnc() {
  const khoa = JSON.parse(fs.readFileSync(path.join(GOC, 'kho', 'khoa.json'), 'utf8')).khoa;
  const G = {};
  for (const g of Object.keys(khoa)) {
    const f = path.join(GOC, 'kho', g + '.enc');
    if (!fs.existsSync(f)) continue;
    const d = moGoi(khoa[g], fs.readFileSync(f));
    for (const [k, v] of Object.entries(d)) {
      /* NỐI, không GÁN ĐÈ — kho cắt theo bản ghi nằm ở hai gói cùng
         tên (luật G.KHO_TRAI_RA). Gán đè thì gói nạp sau nuốt nửa kia,
         đúng lỗi đã xảy ra với TEST750 ở bản 9.6. */
      if (Array.isArray(v) && Array.isArray(G[k])) G[k] = G[k].concat(v);
      else if (G[k] && typeof G[k] === 'object' && v && typeof v === 'object' &&
               !Array.isArray(v) && !Array.isArray(G[k])) G[k] = Object.assign({}, G[k], v);
      else G[k] = v;
    }
  }
  return G;
}

function docSoCho(G) {
  const kho = G || docKhoTuEnc();
  return Object.keys(kho)
    .filter(k => /_CHOCHU$/.test(k))
    .sort()
    .map(s => ({ so: s, muc: Array.isArray(kho[s]) ? kho[s] : [] }))
    .filter(s => s.muc.length);
}


/* ══════════════════════════════════════════════════════════════════
   VƠI ĐI CÓ CHỦ Ý THÌ KHÔNG PHẢI MẤT
   ------------------------------------------------------------------
   Sổ `X_CHOCHU` vơi đi là chuyện ĐÚNG: 9.99.61 chốt rằng mục đã trả
   lời thì TIỄN sang `X_DACHOT` — gỡ khỏi sổ chờ, KHÔNG xoá, vì câu
   trả lời kèm lý do là thứ đáng giữ nhất.

   Phép trừ này dựng ở `kho-luu.js` (9.99.79) và sống ở đó MỘT MÌNH.
   Tới 9.99.81 nó vấp đúng chỗ nó sinh ra để vá: `soi-doi-kho.js` —
   bộ soi chạy TRƯỚC MỖI LƯỢT ĐẨY, tức là bộ báo động chính — không
   biết phép trừ ấy, nên nó báo "QA_CHOCHU mất mã WOW-01" trong khi
   WOW-01 nằm nguyên trong QA_DACHOT.

   Một phép kiểm báo mất nhầm thì lần sau người ta tắt nó đi. Nên nó
   ở đây, và cả hai bộ soi cùng TRỎ vào — chép sang là dựng bản thứ
   hai của một sự thật, và bản trôi đi thì không ai thấy vì bản kia
   vẫn đúng.

   `dem` là hàm đếm bản ghi do bên gọi đưa vào: hai bộ soi đếm trên
   hai hình dữ liệu khác nhau (một bên là kho đã mở, một bên là bản
   ghi đọc từ .enc), và ép chung một cách đếm là bắt một trong hai
   phải dựng lại dữ liệu cho vừa hàm này.
   ══════════════════════════════════════════════════════════════════ */
function daTienSangDaChot(ten, thieu, kho, dem) {
  if (!/_CHOCHU$/.test(ten)) return null;
  const chot = ten.replace(/_CHOCHU$/, '_DACHOT');
  if (!(chot in kho)) return null;
  const soChot = dem(kho[chot]);
  if (soChot < thieu) return null;
  return { chot, soChot };
}

module.exports = { cau, cauGon, ten, nhan, docKhoTuEnc, docSoCho, moGoi, daTienSangDaChot };
