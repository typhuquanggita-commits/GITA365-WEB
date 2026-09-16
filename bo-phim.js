#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MỘT ĐỀ BÀI, NHIỀU KHỔ, NHIỀU CUỐN PHIM

   Chủ hệ hỏi bản xuất đa khổ: 3:4 cho sách, 9:16 cho mạng dọc, 1:1
   cho bảng tin. Có rồi, nhưng làm KHÁC bản đề xuất một chỗ căn bản.

   ══ VÌ SAO KHÔNG ĐỆM ĐEN, MÀ DỰNG LẠI ══

   Bản đề xuất dựng MỘT lần rồi
     scale=W:H:force_original_aspect_ratio=decrease,pad=W:H:...
   tức là thu nhỏ tấm cho vừa rồi ĐỆM ĐEN hai bên. Một tấm vuông đổ
   sang khổ 9:16 kiểu ấy thì hai phần năm chiều cao là dải đen, và
   chữ nhỏ đi hai phần năm — chữ đã đo vừa khung nay đọc không ra.

   Ở đây bộ vẽ DỰNG LẠI ở từng khổ. Nó không phóng to thu nhỏ một
   tấm: nó xếp lại bố cục — khổ đứng thì chữ xếp chồng và dải người
   xuống đáy, khổ ngang thì hai cột. Mỗi khổ là một tấm THẬT của khổ
   ấy, không phải một tấm khổ khác bị nhét vào.

   Đắt hơn: ba khổ là ba lượt vẽ. Nhưng lượt vẽ mất mấy giây, còn
   một dải đen thì ở lại trong cuốn phim mãi mãi.

   ══ LỜI ĐỌC DÙNG CHUNG ══

   Tấm cùng tên ở mọi khổ (tam-000-…, tam-001-…), nên MỘT thư mục
   lời đọc chạy cho cả ba cuốn. Không phải thu ba lần.

   Chạy:
     node tools/bo-phim.js <đề-bài.json> <thư mục ra> [giây/cảnh] \
          [--kho=vuong,doc,dung] [--chuyen=mo] [--loi=<thư mục>] \
          [--nhac=<tệp>] [--nen=sau]
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const { raAnhNhieu } = require('./tam-ra-anh');
const phim = require('./dung-phim');

/* Bốn khổ của kho, kèm chỗ mỗi khổ dùng để làm gì. Tên khổ đọc từ
   bộ vẽ lúc chạy chứ KHÔNG chép lại số điểm ảnh ở đây — chép là
   dựng bản thứ hai của một sự thật, và bản thứ hai thì không ai sửa
   khi bản gốc đổi. */
const KHO_DUNG = {
  rong:  'Khổ ngang — trang web, thư, trình chiếu',
  vuong: 'Khổ vuông — bảng tin, bài đăng thường',
  doc:   'Khổ dọc — sách, bản in, ghim ảnh',
  dung:  'Khổ đứng tràn màn — mạng dọc, video ngắn'
};

async function boPhim(deBai, thuMucRa, chon) {
  const o = chon || {};
  const khoList = (o.kho || 'vuong').split(',').map(function (s) {
    return s.trim(); }).filter(Boolean);
  const la = khoList.filter(function (k) { return !KHO_DUNG[k]; });
  if (la.length) throw new Error('Không có khổ "' + la.join(', ') + '". Có: ' +
    Object.keys(KHO_DUNG).join(' · ') + '.');
  if (!phim.coFfmpeg()) throw new Error('Máy này chưa có ffmpeg/ffprobe — ' +
    'phim dựng bằng chúng. Cài: apt-get install -y ffmpeg');

  fs.mkdirSync(thuMucRa, {recursive: true});
  const bo = await raAnhNhieu(deBai, khoList.map(function (k) {
    return {thuMuc: path.join(thuMucRa, 'tam-' + k),
            khoa: {kho: k, che: o.nen || null}};
  }));

  /* Một tấm rơi ở BẤT KỲ khổ nào thì dừng cả lượt. Một cuốn phim
     thiếu một cảnh trông y hệt một cuốn đủ, và ba cuốn khác nhau số
     cảnh thì càng khó thấy hơn nữa. */
  const rot = [];
  bo.forEach(function (r, i) {
    (r.hong || []).forEach(function (h) {
      rot.push(khoList[i] + ' · ' + h.id + ': ' + h.error); });
  });
  if (rot.length) throw new Error('Có tấm không vẽ được:\n  ' +
    rot.join('\n  '));

  const ra = [];
  for (let i = 0; i < khoList.length; i++) {
    const k = khoList[i];
    const tep = path.join(thuMucRa, 'phim-' + k + '.mp4');
    const r = phim.dungPhim(bo[i].thuMuc, tep, {
      giay: o.giay, chuyen: o.chuyen, loi: o.loi, nhac: o.nhac});
    ra.push(Object.assign({kho: k, tep: tep, dungDe: KHO_DUNG[k]}, r));
  }
  return ra;
}

module.exports = {boPhim, KHO_DUNG};

if (require.main === module) {
  const dv = process.argv.slice(2);
  const co = {};
  const thuong = dv.filter(function (a) {
    const m = /^--([a-z]+)=(.*)$/.exec(a);
    if (m) { co[m[1]] = m[2]; return false; }
    return true;
  });
  if (thuong.length < 2) {
    console.log('Dùng: node tools/bo-phim.js <đề-bài.json> <thư mục ra> ' +
      '[giây/cảnh] [--kho=a,b] [--chuyen=kiểu] [--loi=<thư mục>] ' +
      '[--nhac=<tệp>] [--nen=sau]');
    console.log('\nKhổ:');
    Object.keys(KHO_DUNG).forEach(function (k) {
      console.log('  ' + k.padEnd(7) + KHO_DUNG[k]); });
    console.log('\nKiểu chuyển cảnh:');
    Object.keys(phim.CHUYEN).forEach(function (k) {
      console.log('  ' + k.padEnd(9) + phim.CHUYEN[k].ten); });
    process.exit(2);
  }
  const ds = JSON.parse(fs.readFileSync(thuong[0], 'utf8'));
  boPhim(Array.isArray(ds) ? ds : [ds], thuong[1], {
    giay: thuong[2], kho: co.kho, chuyen: co.chuyen,
    loi: co.loi, nhac: co.nhac, nen: co.nen
  }).then(function (r) {
    r.forEach(function (x) {
      console.log('✓ ' + x.tep + ' · ' + x.w + '×' + x.h + ' · ' + x.soCanh +
        ' cảnh · ' + x.giay + ' giây · ' + x.kb + ' KB   ' + x.dungDe);
    });
  }).catch(function (e) {
    console.error('✗ ' + e.message);
    process.exit(1);
  });
}
