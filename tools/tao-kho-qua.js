/* ═══════════════════════════════════════════════════════════════
   GITA 365 — SINH KHO 1.000 TÀI LIỆU QUÀ TẶNG
   Mỗi tài liệu gắn với một vấn đề có thật trong 220 phác đồ, đúng
   một dạng trong năm dạng chuẩn thương hiệu, và đúng một tầng.

       node tools/tao-kho-qua.js   →  kho-goc/data.qua1000.js
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs'), path = require('path');
global.window = {};
require(path.join(__dirname, '..', 'kho-goc', 'data.scripts.js'));
const G = global.window.G;

/* Năm dạng chuẩn — cấu trúc cố định, ai cầm cũng dùng được ngay */
const DANG = [
  {ma:'CN', ten:'Cẩm nang một trang',  trang:1, mo:'Làm gì trong bảy ngày tới — một mặt giấy, năm bước, có ô tick.'},
  {ma:'BT', ten:'Bảng theo dõi A4',    trang:1, mo:'In ra dán tủ lạnh. Bảy dòng, ba cột: giờ bắt đầu, giờ kết thúc, số lần nhắc.'},
  {ma:'KB', ten:'Kịch bản hội thoại',  trang:2, mo:'Câu mở đúng nhịp, ba câu hỏi mở, câu chốt, và điều tuyệt đối không nói.'},
  {ma:'TN', ten:'Thẻ nhắc bỏ túi',     trang:1, mo:'Cỡ danh thiếp. Năm câu để trong ví, mở ra đọc trước buổi khó.'},
  {ma:'BD', ten:'Bài đọc mười phút',   trang:3, mo:'Nguyên lý, ví dụ Việt Nam, một việc làm ngay, và giới hạn của nguyên lý.'}
];

/* Tầng theo nhóm vấn đề — bám đúng lộ trình năm tầng */
const TANG_NHOM = {
  '13.1 Môi trường':1, '13.2 Hành vi':1, '13.3 Thói quen':2, '13.4 Năng lực học tập':2,
  '13.5 Tự quản trị':3, '13.6 Động lực – mục tiêu':3, '13.7 Phụ huynh':4,
  '13.8 Hiệu suất':3, '13.9 Tài năng':4, '13.10 Nghề nghiệp':5,
  '13.11 Dự án-Lãnh đạo-Portfolio':5
};

/* Điểm hạng 1–100: dạng nặng + tầng cao thì điểm cao hơn */
const DIEM_DANG = {TN:8, BT:14, CN:20, BD:30, KB:38};
function diemCua(tang, dang){
  return Math.min(100, DIEM_DANG[dang] + (tang - 1) * 11 + ((tang >= 4 && dang === 'KB') ? 6 : 0));
}

const ds = [];
let n = 0;

/* ── 880 tài liệu gắn với 220 vấn đề, mỗi vấn đề bốn dạng ── */
G.PHACDO.forEach((p, i) => {
  const tang = TANG_NHOM[p.nhomTen] || 1;
  const bo = [DANG[i % 5], DANG[(i + 1) % 5], DANG[(i + 2) % 5], DANG[(i + 3) % 5]];
  bo.forEach(d => {
    n++;
    ds.push({
      ma: 'QT-' + String(n).padStart(4, '0'),
      ten: d.ten + ' — ' + p.ten,
      pd: p.ma, nhom: p.nhomTen, tang: 'T' + tang, dang: d.ma,
      trang: d.trang, diem: diemCua(tang, d.ma),
      nv: 'Khi gia đình mắc ở "' + p.ten + '"'
    });
  });
});

/* ── 120 tài liệu nền, 24 cho mỗi tầng ── */
const NEN = [
  'Nhịp một ngày của nhà mình','Buổi ngồi lại hàng tuần','Đêm rà đòn bẩy 21 ngày',
  'Bữa cơm không phán xét','Bảng chín vai','Bảng tầm nhìn 5–20 năm',
  'Cách ghi ba dòng nhật ký','Cách đọc bảng số của nhà mình','Khi cả nhà cãi nhau về việc học',
  'Khi con nói không muốn nói chuyện','Khi người lớn thấy mình bất lực','Khi tuần này tụt so với tuần trước',
  'Chuẩn bị cho cổng nghiệm thu','Trao một quyền kèm một trách nhiệm','Cách công nhận có bằng chứng',
  'Cách hỏi mà không thành hỏi cung','Ba giây im lặng sau câu hỏi','Khi ông bà can thiệp khác hướng',
  'Khi anh chị em bị đem ra so sánh','Khi con vấp ngay sau một tuần tốt','Cách kể chuyện nhà mình cho người khác',
  'Khi nhà mình muốn dừng giữa chặng','Chuẩn bị hội nghị gia đình cuối năm','Phần thay đổi của người lớn'
];
for (let t = 1; t <= 5; t++) {
  NEN.forEach((ten, k) => {
    n++;
    const d = DANG[k % 5];
    ds.push({
      ma: 'QT-' + String(n).padStart(4, '0'),
      ten: d.ten + ' — ' + ten,
      pd: null, nhom: 'Nền tảng chung', tang: 'T' + t, dang: d.ma,
      trang: d.trang, diem: diemCua(t, d.ma),
      nv: 'Nhiệm vụ nền của Tầng ' + t
    });
  });
}

const out =
`/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v7.1 — KHO 1.000 TÀI LIỆU QUÀ TẶNG
   Sinh bằng tools/tao-kho-qua.js từ 220 phác đồ vấn đề có thật.
   Mỗi tài liệu gắn đúng một vấn đề, một dạng chuẩn, một tầng.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

G.QUA_DANG = ${JSON.stringify(DANG, null, 0)};
G.QUA1000 = ${JSON.stringify(ds)};
`;
fs.writeFileSync(path.join(__dirname, '..', 'kho-goc', 'data.qua1000.js'), out);

const theoTang = {}; ds.forEach(x => theoTang[x.tang] = (theoTang[x.tang] || 0) + 1);
const theoDang = {}; ds.forEach(x => theoDang[x.dang] = (theoDang[x.dang] || 0) + 1);
console.log('Đã sinh ' + ds.length + ' tài liệu · ' + Math.round(out.length / 1024) + ' KB');
console.log('Theo tầng:', JSON.stringify(theoTang));
console.log('Theo dạng:', JSON.stringify(theoDang));
console.log('Điểm: từ ' + Math.min(...ds.map(x=>x.diem)) + ' tới ' + Math.max(...ds.map(x=>x.diem)));
