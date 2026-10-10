#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — TRÍCH CHỮ TIẾNG VIỆT & ĐO ĐỘ PHỦ TIẾNG ANH

   Chủ hệ 10/10: bấm tiếng Anh thì chỉ vài chữ đổi, phần còn lại vẫn
   tiếng Việt và không nhất quán. Không đo thì không biết đang thiếu bao
   nhiêu — và một con số "đã dịch 100%" không ai đo lại là một lời khai.

   Công cụ này đọc THẲNG mã nguồn src/*.js, nhặt mọi chuỗi có chữ tiếng
   Việt, rồi đối chiếu với từ điển G.TU_DIEN_EN (src/tu-dien-en*.js) theo
   ĐÚNG cách bộ dịch giao diện tra (src/dich-giao-dien.js): gọt khoảng
   trắng, con số thay bằng {n}.

     node tools/trich-chu-viet.js                 bảng độ phủ theo nhóm tệp
     node tools/trich-chu-viet.js --thieu <tệp>   các chuỗi CHƯA dịch của một tệp
     node tools/trich-chu-viet.js --kiem          kiểm mốc: độ phủ nhóm ưu tiên
                                                  không được tụt dưới tools/i18n-moc.json

   Chỉ đếm chuỗi người dùng NHÌN THẤY được: bỏ chú giải, bỏ chuỗi chỉ là
   mã (không có chữ cái tiếng Việt), bỏ chuỗi quá ngắn chỉ là dấu nối.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const MOC = path.join(__dirname, 'i18n-moc.json');

/* Nhóm ưu tiên: thứ khách và người lạ nhìn thấy đầu tiên. Mốc độ phủ canh
   nhóm này trước; nhóm nghề dịch dần theo đợt. */
const UU_TIEN = ['app.js', 'ui.js', 'i18n.js', 'cua-truoc.js', 'kim-chi-nam.js', 'dang-ky.js', 'mat-khau.js', 'loi-khach.js'];

const CO_DAU = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/;

/* Khoá tra: đúng cách src/dich-giao-dien.js chuẩn hoá — hai bên phải
   cùng một hàm, nếu không công cụ báo "đã dịch" mà màn vẫn tiếng Việt. */
function khoa(s) {
  return String(s).replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;|&#\d+;/g, ' ')
    .replace(/\s+/g, ' ').trim().replace(/\d+(?:[.,]\d+)*/g, '{n}');
}

function boChuGiai(ma) {
  return ma.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"\\])\/\/[^\n]*/g, '$1');
}

/* Nhặt chuỗi '…' và "…" (không nhặt template literal — mã ES5). Mỗi chuỗi
   có thẻ HTML thì tách thành các đoạn chữ giữa thẻ, vì đó là các nút chữ
   bộ dịch sẽ gặp trên màn. */
function trich(ma) {
  const ra = [];
  const re = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"/g;
  let m;
  while ((m = re.exec(ma))) {
    const s = (m[1] !== undefined ? m[1] : m[2]).replace(/\\'/g, "'").replace(/\\"/g, '"');
    if (!CO_DAU.test(s)) continue;
    s.split(/<[^>]*>/).forEach(doan => {
      const k = khoa(doan);
      if (k.length >= 2 && CO_DAU.test(k)) ra.push(k);
    });
  }
  return ra;
}

function napTuDien() {
  const ctx = { window: {} }; ctx.window.window = ctx.window; ctx.G = ctx.window.G = {};
  vm.createContext(ctx);
  fs.readdirSync(SRC).filter(f => /^tu-dien-en.*\.js$/.test(f)).sort().forEach(f => {
    vm.runInContext(fs.readFileSync(path.join(SRC, f), 'utf8'), ctx, { filename: f });
  });
  const td = ctx.window.G.TU_DIEN_EN || {};
  const out = {};
  Object.keys(td).forEach(k => { out[khoa(k)] = td[k]; });
  return out;
}

function doTep(f, td) {
  const ds = [...new Set(trich(boChuGiai(fs.readFileSync(path.join(SRC, f), 'utf8'))))];
  const co = ds.filter(k => td[k] !== undefined);
  return { tep: f, tong: ds.length, da: co.length, thieu: ds.filter(k => td[k] === undefined) };
}

function main() {
  const arg = process.argv.slice(2);
  const td = napTuDien();
  const tep = fs.readdirSync(SRC).filter(f => f.endsWith('.js') && !/^tu-dien-en/.test(f) && f !== 'data-khung.js').sort();
  if (arg[0] === '--thieu') {
    const r = doTep(arg[1], td);
    r.thieu.forEach(k => console.log(k));
    console.error('\n' + r.thieu.length + ' chuỗi chưa dịch / ' + r.tong);
    return;
  }
  const kq = tep.map(f => doTep(f, td));
  const nhom = ds => ds.reduce((a, r) => ({ tong: a.tong + r.tong, da: a.da + r.da }), { tong: 0, da: 0 });
  const ut = nhom(kq.filter(r => UU_TIEN.includes(r.tep)));
  const all = nhom(kq);
  const pt = x => x.tong ? Math.round(1000 * x.da / x.tong) / 10 : 100;
  if (arg[0] === '--kiem') {
    const moc = fs.existsSync(MOC) ? JSON.parse(fs.readFileSync(MOC, 'utf8')) : { uuTien: 0, tatCa: 0 };
    const loi = [];
    if (pt(ut) < moc.uuTien) loi.push('nhóm ưu tiên ' + pt(ut) + '% < mốc ' + moc.uuTien + '%');
    if (pt(all) < moc.tatCa) loi.push('toàn bộ ' + pt(all) + '% < mốc ' + moc.tatCa + '%');
    console.log('Độ phủ tiếng Anh — nhóm ưu tiên ' + pt(ut) + '% (' + ut.da + '/' + ut.tong + ') · toàn bộ ' + pt(all) + '% (' + all.da + '/' + all.tong + ')');
    if (loi.length) { console.log('✗ TỤT MỐC: ' + loi.join(' · ')); process.exit(1); }
    console.log('✓ không tụt mốc');
    return;
  }
  console.log('Nhóm ưu tiên: ' + pt(ut) + '% (' + ut.da + '/' + ut.tong + ')   Toàn bộ: ' + pt(all) + '% (' + all.da + '/' + all.tong + ')\n');
  kq.filter(r => r.tong).sort((a, b) => (b.tong - b.da) - (a.tong - a.da)).slice(0, 40).forEach(r =>
    console.log(String(r.tong - r.da).padStart(6) + ' thiếu · ' + String(pt(r)).padStart(5) + '% · ' + r.tep));
}

if (require.main === module) main();
module.exports = { khoa, trich, napTuDien };
