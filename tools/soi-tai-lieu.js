#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — SOI KHO TÀI LIỆU ĐẶC TẢ  (9.99.88)

   VÌ SAO CÓ TỆP NÀY

   Mười tám bản vừa rồi dựng theo các bản đặc tả của chủ hệ, và câu
   "bản nào đã dựng, dựng tới đâu, phần nào chưa" nằm rải trong chú
   giải CLAUDE.md. Mỗi phiên làm việc phải dò lại từ đầu — và dò lại
   là khoản tốn lớn nhất mà không ai nhìn thấy.

   Tệp này KHÔNG lưu gì cả, cùng lối `kho-luu.js` (9.99.79): nó chỉ
   ĐỌC. Nguồn sự thật là ba chỗ đã có —

     · `G.TAILIEU_SPEC`   lời khai: tệp nào, đã dựng ở bản nào
     · `may-chu/` `src/`  cửa và màn CÓ THẬT trên đĩa
     · bản chép tệp đặc tả, nếu phiên này có

   và nó đối chiếu ba chỗ ấy với nhau.

   ══ VÌ SAO PHẢI ĐỐI CHIẾU, KHÔNG CHỈ IN RA ══

   Luật 9.99.84: *một phép đo so hai ô do cùng một người gõ trong cùng
   một lượt thì nó không phải phép đo chéo.* Nên lời khai của
   `TAILIEU_SPEC` phải được đối chiếu với thứ đến từ CHỖ KHÁC — kho
   `G.*` có thật, màn có thật trong `G.NAV`, cửa có thật trong
   `may-chu/`. Một sổ tự khai "đã dựng" mà không ai đối chiếu thì nó
   cũ đi lặng lẽ, đúng như cột `conHan` (9.99.63).

   ══ VÌ SAO ĐẾM BẰNG MÁY, KHÔNG ĐỌC BẰNG MẮT ══

   Bản 9.99.83 khai "45/100 phần" kèm chữ *"đếm bằng máy trên chính
   tệp"* — và câu ấy không đúng: con số suy từ một lượt đọc 7% tệp.
   Đọc đủ rồi đếm thật thì ra 59. Một lời khai tự xưng là phép đo thì
   tệ hơn im, vì nó khoá luôn đường ngờ.

   Nên ở đây: tệp nào CÓ MẶT trên đĩa thì máy đếm lại; tệp nào không
   có thì nói thẳng là KHÔNG ĐO ĐƯỢC LƯỢT NÀY, không lấy lời khai cũ
   trình ra như một con số vừa đo.

   Dùng:
     node tools/soi-tai-lieu.js            bảng tổng
     node tools/soi-tai-lieu.js --thieu    chỉ in chỗ chưa dựng
     node tools/soi-tai-lieu.js --muc <t>  mục lục một tệp đặc tả
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');

const GOC = path.join(__dirname, '..');
const CO_MAU = process.stdout.isTTY;
const d = (s) => CO_MAU ? '[2m' + s + '[0m' : s;
const b = (s) => CO_MAU ? '[1m' + s + '[0m' : s;
const do_ = (s) => CO_MAU ? '[31m' + s + '[0m' : s;
const xanh = (s) => CO_MAU ? '[32m' + s + '[0m' : s;

/* ── Nạp kho gốc để đọc G.TAILIEU_SPEC ──
   Đọc THẲNG kho-goc/, không đọc bản .enc: kho-goc là bản gốc, và nếu
   nó không có thì nói ra chứ không im. */
function napKho() {
  const G = {};
  global.G = G; global.window = { G: G };
  const tm = path.join(GOC, 'kho-goc');
  if (!fs.existsSync(tm)) return null;
  for (const t of fs.readdirSync(tm).filter(x => /\.js$/.test(x)).sort()) {
    try { eval(fs.readFileSync(path.join(tm, t), 'utf8')); } catch (e) { /* bỏ qua tệp lỗi */ }
  }
  /* G.NAV KHÔNG nằm trong kho-goc/ — nó ở src/data.core.js. Bản đầu của
     hàm này quên chỗ ấy, nên MỌI màn đều báo thiếu và công cụ báo đỏ
     bảy bản đang khai đúng. Một phép đo bắt oan thì lần sau người ta
     tắt nó đi (9.99.79). */
  try { eval(fs.readFileSync(path.join(GOC, 'src', 'data.core.js'), 'utf8')); } catch (e) {}
  return G;
}

/* ── Ba đầu ĐỘC LẬP để đối chiếu lời khai của sổ ──
   Không cái nào đọc TAILIEU_SPEC, nên chúng không thể trôi cùng nó. */
function cuaThat() {
  const tm = path.join(GOC, 'may-chu');
  const ra = new Set();
  if (!fs.existsSync(tm)) return ra;
  for (const t of fs.readdirSync(tm).filter(x => /\.js$/.test(x))) {
    const ma = fs.readFileSync(path.join(tm, t), 'utf8');
    for (const m of ma.matchAll(/export\s+(?:async\s+)?function\s+([A-Za-z0-9_$]+)/g))
      ra.add(m[1]);
  }
  return ra;
}

function manThat(G) {
  const ra = new Set();
  (G.NAV || []).forEach(g => (g.items || []).forEach(it => it.v && ra.add(it.v)));
  return ra;
}

function tepSrcThat() {
  const tm = path.join(GOC, 'src');
  return new Set(fs.existsSync(tm) ? fs.readdirSync(tm) : []);
}

/* ── Đếm phần của một bản đặc tả, NẾU bản chép còn trên đĩa ──
   Trả về null khi không có tệp — và chỗ gọi phải in "không đo được
   lượt này", không được lấy lời khai cũ thay vào. */
function demPhan(duong, mau) {
  if (!duong || !fs.existsSync(duong)) return null;
  const s = fs.readFileSync(duong, 'utf8');
  const re = new RegExp(mau || 'PHẦN\\s+([A-G])\\.(\\d+)', 'g');
  const thay = new Set();
  for (const m of s.matchAll(re)) thay.add(m.slice(1).join('.'));
  return { so: thay.size, coChu: s.length, dong: s.split('\n').length };
}

function inBang(ds, cua, man, srcs) {
  const W = [22, 30, 9, 9];
  const hang = (a) => '  ' + a.map((x, i) =>
    String(x).length > W[i] ? String(x).slice(0, W[i] - 1) + '…'
      : String(x).padEnd(W[i])).join(' ');

  console.log('\n' + b('KHO TÀI LIỆU ĐẶC TẢ — ' + ds.length + ' bản'));
  console.log(d(hang(['Bản đặc tả', 'Dựng ở bản nào', 'Kho', 'Trỏ đúng'])));

  let hong = 0, chuaDung = 0;
  for (const t of ds) {
    /* Đối chiếu ĐẦU HAI: mọi thứ sổ khai là "đã dựng" phải CÓ THẬT. */
    const lac = [];
    (t.kho || []).forEach(k => { if (!(k in global.G)) lac.push('kho ' + k); });
    (t.man || []).forEach(m => { if (!man.has(m)) lac.push('màn ' + m); });
    (t.cua || []).forEach(c => { if (!cua.has(c)) lac.push('cửa ' + c); });
    (t.tep || []).forEach(f => { if (!srcs.has(f)) lac.push('tệp ' + f); });
    if (lac.length) hong++;
    if (!t.dungO) chuaDung++;

    console.log(hang([
      t.ten,
      t.dungO || do_('CHƯA DỰNG'),
      (t.kho || []).length || '—',
      lac.length ? do_('✗ ' + lac.length) : xanh('✓')
    ]));
    if (lac.length) console.log(d('      → ' + lac.join(' · ')));
  }
  return { hong, chuaDung };
}

function main() {
  const cv = process.argv.slice(2);
  const G = napKho();
  if (!G) {
    console.log(do_('\n  Không có kho-goc/ — không đọc được sổ đặc tả.'));
    console.log(d('  kho-goc/ nằm trong .gitignore. Khôi phục bằng:'));
    console.log(d('    node tools/khoi-phuc-kho.js <tệp.gita>'));
    process.exit(1);
  }

  const ds = G.TAILIEU_SPEC || [];
  if (!ds.length) {
    console.log(do_('\n  G.TAILIEU_SPEC rỗng — chưa ai khai bản đặc tả nào.'));
    process.exit(1);
  }

  const cua = cuaThat(), man = manThat(G), srcs = tepSrcThat();

  if (cv[0] === '--muc') {
    const t = ds.filter(x => (x.ma === cv[1] || x.ten.includes(cv[1] || '')))[0];
    if (!t) { console.log(do_('  Không có bản đặc tả nào khớp "' + cv[1] + '"')); return; }
    const dm = demPhan(t.banChep, t.mauPhan);
    if (!dm) {
      /* KHÔNG rơi về lời khai. Một con số cũ in ra ở chỗ người ta đang
         hỏi "đếm lại đi" thì nó được đọc như một con số vừa đếm. */
      console.log(do_('\n  KHÔNG ĐO ĐƯỢC LƯỢT NÀY') + ' — không có bản chép của ' + b(t.ten));
      console.log(d('  Sổ khai: ' + (t.demKhai || '—') + ' (lời khai ngày ' +
        (t.demNgay || '?') + ', KHÔNG phải phép đo lượt này)'));
      console.log(d('  Bản gốc ở Drive: ' + (t.drive || '—')));
      return;
    }
    console.log('\n' + b(t.ten) + d('  ' + dm.coChu.toLocaleString('vi') +
      ' ký tự · ' + dm.dong.toLocaleString('vi') + ' dòng'));
    console.log('  Đếm được lượt này: ' + b(dm.so) + ' phần' +
      (t.demKhai ? d('   (sổ khai ' + t.demKhai + ')') : ''));
    if (t.demKhai && dm.so !== t.demKhai)
      console.log(do_('  ✗ LỆCH LỜI KHAI — sổ ghi ' + t.demKhai + ', đếm ra ' + dm.so));
    return;
  }

  const r = inBang(cv[0] === '--thieu' ? ds.filter(t => !t.dungO) : ds, cua, man, srcs);

  console.log('');
  console.log('  ' + b(ds.length) + ' bản đặc tả · ' +
    b(ds.length - r.chuaDung) + ' đã dựng · ' +
    (r.chuaDung ? do_(r.chuaDung + ' chưa dựng') : xanh('0 chưa dựng')));
  if (r.hong) console.log('  ' + do_(r.hong + ' bản trỏ vào thứ KHÔNG CÓ THẬT') +
    d(' — lời khai đã trôi khỏi mã'));

  /* Bản chép tệp đặc tả là bản TẠM của phiên. Nói ra mỗi lượt chạy,
     không giấu: mất phiên là mất, và bản gốc chỉ còn ở Drive. */
  const coChep = ds.filter(t => t.banChep && fs.existsSync(t.banChep)).length;
  console.log('  ' + coChep + '/' + ds.length + ' bản có bản chép trên đĩa phiên này' +
    d(' — bản chép là TẠM, bản gốc ở Drive của chủ hệ'));
  console.log('');
}

main();
