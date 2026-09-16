#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — KHO LƯU TRỮ: ĐỌC CÁI ĐÃ CÓ, KHÔNG DỰNG CÁI THỨ HAI

       node tools/kho-luu.js                      liệt kê mọi bản lưu
       node tools/kho-luu.js --mat                soi nội dung ĐÃ MẤT
       node tools/kho-luu.js --doi <KHO>          đời một kho qua các bản
       node tools/kho-luu.js --lay <KHO> <bản>    lấy một kho ở một bản ra
       node tools/kho-luu.js --sua <KHO>          dựng lại kho từ bản đầy nhất
       node tools/kho-luu.js --soi                khoá còn mở được bao nhiêu bản lưu

   ══ KHO LƯU TRỮ ĐÃ TỒN TẠI, VÀ KHÔNG AI ĐỌC ĐƯỢC NÓ ══

   Đo trước khi dựng: khoá hôm nay mở được **197 trên 201** bản `.enc`
   đã đẩy. `ma-hoa-kho.js` giữ nguyên khoá cũ mỗi lượt đóng gói — chính
   dòng "Giữ nguyên 8 khoá cũ — giấy phép đã cấp vẫn dùng được" — nên
   mọi bản từ khi bộ khoá này được chốt đều mở được bằng đúng 682 byte.

   Bốn bản không mở được đều ngày 28/08/2026, dựng TRƯỚC lúc chốt khoá.
   Đó là lịch sử, không phải hỏng — và phải nói ra con số thật chứ không
   nói "tất cả". Lượt đo đầu của tôi lấy mẫu một danh sách xếp NGƯỢC
   thời gian nên tưởng bản thứ 150 là bản cũ nhất, và tôi đã nói "cả 201
   bản" khi sự thật là 197. Một con số tròn trịa hơn sự thật thì người
   đọc tin kho lưu trữ sâu hơn thật.

   Nghĩa là: **git CỘNG khoá đã là một kho lưu trữ có phiên bản, 197 bản
   lưu đọc được, nằm sẵn trên GitHub.** Thứ thiếu chưa bao giờ là chỗ
   lưu — thứ thiếu là một cái cửa để đọc nó.

   Dựng thêm một kho lưu trữ thứ hai ở đây là dựng bản thứ hai của một
   sự thật, và bản thứ hai thì lệch đi trong im lặng. Nên tệp này KHÔNG
   lưu gì cả. Nó chỉ đọc.

   ══ NÓ TRẢ LỜI ĐƯỢC BA CÂU MÀ TRƯỚC NAY KHÔNG AI TRẢ LỜI ĐƯỢC ══

   `soi-doi-kho.js` so bản vừa đóng với **lần commit gần nhất**. Câu nó
   trả lời được là "lượt sửa VỪA RỒI có làm mất gì không". Ba câu nó
   không trả lời được, và đây là chỗ nguy hiểm:

     · Một kho mất nội dung ở bản 9.40 rồi nằm im tới nay — soi-doi-kho
       XANH ở mọi lượt chạy kể từ đó, vì mỗi lượt chỉ so với lượt trước.
     · Một kho đã đầy rồi vơi đi dần qua mười lăm bản, mỗi bản một ít.
     · "Bản nào của kho ấy là bản đầy nhất, và lấy nó ra bằng cách nào."

   **Một mất mát đi qua được một lượt so sánh thì nó đi qua được mọi
   lượt sau** — vì từ lượt sau nó là hiện trạng.

   ══ VÀ ĐÂY LÀ ĐƯỜNG SỬA, KHÔNG CHỈ ĐƯỜNG XEM ══

   `--lay` và `--sua` lấy một kho ở một bản cũ ra thành tệp JSON đọc
   được, để người ta vá lại phần đã mất. Máy KHÔNG tự vá vào `kho-goc/`:
   một kho ở bản cũ có thể đã bị cố ý cắt bớt, và máy không phân biệt
   được "mất" với "bỏ" — chỉ người viết kho mới biết. Máy tìm ra chỗ
   ngờ, đưa vật liệu tận tay, rồi dừng.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { moGoi } = require('./so-cho.js');

const GOC = path.resolve(__dirname, '..');
/* Chỉ vẽ dòng tiến độ khi đầu ra là MÀN HÌNH THẬT. Ký tự \r không xoá
   được gì khi đầu ra là một ống hay một tệp — nó chỉ là một ký tự nữa —
   nên ba mươi lăm dòng tiến độ dính liền nhau thành một khối, và kết
   quả thật nằm lẫn ở cuối. */
function tienDo(s) { if (process.stdout.isTTY) process.stdout.write(s); }
function xoaTienDo() { tienDo('\r' + ' '.repeat(52) + '\r'); }

const GOI = ['nen', 'nghe', 'nghe-cao', 'tang1', 'tang2', 'tang3', 'tang4', 'tang5'];

function git(lenh, nhiPhan) {
  /* stderr về 'ignore': một bản cũ không có đủ tám gói là chuyện BÌNH
     THƯỜNG — gói `nghe-cao` mới có từ 9.9x — và git kêu 'fatal: path
     exists on disk but not in <commit>' cho mỗi lượt hỏi. Để nó chảy ra
     màn thì mười bảy dòng 'fatal' đỏ lòm nằm chen giữa dòng tiến độ, và
     người đọc tưởng bộ soi đang hỏng trong khi nó đang chạy đúng.
     Thiếu gói đã được xử đúng ở docBan(): bỏ qua, không tính là mất. */
  return execSync('git -C ' + JSON.stringify(GOC) + ' ' + lenh,
    { encoding: nhiPhan ? null : 'utf8', maxBuffer: 1 << 28,
      stdio: ['ignore', 'pipe', 'ignore'] });
}

function docKhoa() {
  try {
    return JSON.parse(fs.readFileSync(path.join(GOC, 'kho', 'khoa.json'), 'utf8')).khoa;
  } catch {
    console.error('\n  ✗ Không có kho/khoa.json.\n');
    console.error('    Kho lưu trữ NẰM TRONG GIT — 201 bản lưu, đã đẩy lên GitHub.');
    console.error('    Nhưng mọi bản đều mã hoá AES-256-GCM, và 682 byte khoá ấy là');
    console.error('    thứ duy nhất mở được chúng. Không có khoá thì 201 bản lưu kia');
    console.error('    là 201 chuỗi byte.\n');
    console.error('    Khôi phục khoá: node tools/khoi-phuc-kho.js <tệp.gita>\n');
    process.exit(2);
  }
}

/* ── DANH SÁCH BẢN LƯU ──
   Một "bản lưu" là một commit có đụng vào kho/*.enc. Đọc số bản GITA từ
   chính commit ấy chứ không đoán theo thứ tự: thứ tự commit là thứ tự
   GHI, còn số bản là thứ người đọc sổ đi tìm. */
function danhSachBan() {
  /* Đóng nháy quanh --format: dấu | không đóng nháy thì shell hiểu nó là
     ống dẫn, và git chỉ nhận được "%H" rồi shell đi tìm lệnh tên "%h".
     Bắt được ngay lượt chạy đầu. */
  const dong = git('log "--format=%H%x09%h%x09%ad%x09%s" --date=short -- kho/')
    .trim().split('\n');
  return dong.filter(Boolean).map(d => {
    const [H, h, ngay, ...tieuDe] = d.split('\t');
    const td = tieuDe.join('\t');
    const m = /v(\d+\.\d+(?:\.\d+)*)/.exec(td);
    return { H, h, ngay, ban: m ? m[1] : '', tieuDe: td };
  }).reverse();   /* cũ → mới, vì đời một kho phải đọc xuôi thời gian */
}

function demBanGhi(v) {
  if (Array.isArray(v)) return v.length;
  if (v && typeof v === 'object') return Object.keys(v).length;
  return v == null ? 0 : 1;
}

/* Đọc TOÀN BỘ kho ở một bản. Gói nào thiếu ở bản ấy thì bỏ qua — bản
   đầu chưa có đủ tám gói, và coi thiếu-gói là mất-nội-dung thì mọi bản
   cũ đều báo mất hàng loạt. */
function docBan(khoa, H) {
  const kho = {};
  for (const g of GOI) {
    let buf;
    try { buf = git('show ' + H + ':kho/' + g + '.enc', true); } catch { continue; }
    if (!buf || !buf.length) continue;
    let d;
    try { d = moGoi(khoa[g], buf); } catch { continue; }
    for (const [k, v] of Object.entries(d)) {
      /* NỐI, không GÁN ĐÈ — kho cắt theo bản ghi nằm ở hai gói cùng tên. */
      if (Array.isArray(v) && Array.isArray(kho[k])) kho[k] = kho[k].concat(v);
      else if (kho[k] && typeof kho[k] === 'object' && v && typeof v === 'object' &&
               !Array.isArray(v) && !Array.isArray(kho[k])) kho[k] = Object.assign({}, kho[k], v);
      else kho[k] = v;
    }
  }
  return kho;
}

/* ═══════════════ LIỆT KÊ ═══════════════ */
function lietKe() {
  const ban = danhSachBan();
  console.log('\n  KHO LƯU TRỮ — ' + ban.length + ' bản lưu, nằm trong git\n');
  console.log('  Không có kho thứ hai. Mỗi bản là một commit có đụng kho/*.enc,');
  console.log('  và ma-hoa-kho.js giữ nguyên khoá cũ mỗi lượt đóng gói — nên mọi bản');
  console.log('  từ khi bộ khoá này được chốt đều còn mở được.');
  console.log('');
  console.log('  KHÔNG phải bản nào cũng mở được, và con số thật đáng nói hơn một câu');
  console.log('  tròn trịa: chạy --soi để biết hôm nay còn đọc được bao nhiêu.\n');
  const dau = ban[0], cuoi = ban[ban.length - 1];
  console.log('    bản đầu : ' + dau.ngay + '  ' + dau.h + '  ' + (dau.ban || '(không rõ số bản)'));
  console.log('    bản cuối: ' + cuoi.ngay + '  ' + cuoi.h + '  ' + (cuoi.ban || ''));
  console.log('\n  Mười bản gần nhất:\n');
  ban.slice(-10).reverse().forEach(b =>
    console.log('    ' + b.ngay + '  ' + b.h + '  ' + (b.ban || '—').padEnd(9) +
      b.tieuDe.slice(0, 58)));
  console.log('\n  Soi nội dung đã mất : node tools/kho-luu.js --mat');
  console.log('  Khoá còn mở được gì: node tools/kho-luu.js --soi\n');
}

/* ═══════════════ SOI NỘI DUNG ĐÃ MẤT ═══════════════

   Với mỗi kho: tìm bản ĐẦY NHẤT từng có, rồi so với hôm nay. Vơi đi mà
   không đầy lại là chỗ đáng ngờ.

   KHÔNG kết luận là hỏng. Kho cắt bớt có chủ ý trông y hệt kho bị mất,
   và máy không phân biệt được — chỉ người viết kho mới biết. Nên máy
   nêu chỗ ngờ kèm ĐƯỜNG LẤY LẠI, rồi dừng. Cùng luật với `soatChuyenChang`
   (9.99.71): máy nói đủ rồi dừng. */
function soiMat(sau) {
  const khoa = docKhoa();
  const ban = danhSachBan();
  const buoc = Math.max(1, Math.ceil(ban.length / (sau || ban.length)));
  const chon = ban.filter((_, i) => i % buoc === 0);
  if (chon[chon.length - 1] !== ban[ban.length - 1]) chon.push(ban[ban.length - 1]);

  console.log('\n  SOI NỘI DUNG ĐÃ MẤT — đọc ' + chon.length + '/' + ban.length + ' bản lưu\n');

  const dinh = {};     /* kho → { so, ban } bản đầy nhất từng thấy */
  const nay = {};
  let i = 0;
  for (const b of chon) {
    i++;
    tienDo('\r    đang đọc ' + i + '/' + chon.length + ' · ' + b.h + '   ');
    const kho = docBan(khoa, b.H);
    for (const [k, v] of Object.entries(kho)) {
      const n = demBanGhi(v);
      if (!dinh[k] || n > dinh[k].so) dinh[k] = { so: n, ban: b };
    }
    if (b === chon[chon.length - 1]) Object.assign(nay, kho);
  }
  xoaTienDo();

  /* ── VƠI ĐI CÓ CHỦ Ý THÌ KHÔNG PHẢI MẤT ──

     Sổ `X_CHOCHU` vơi đi là chuyện ĐÚNG: 9.99.61 chốt rằng mục đã trả
     lời thì TIỄN sang `X_DACHOT` — gỡ khỏi sổ chờ, KHÔNG xoá, vì câu
     trả lời kèm lý do là thứ đáng giữ nhất.

     Lượt chạy đầu của bộ soi này nêu đúng ba sổ ấy: BLV 5→3 · TV 2→1 ·
     BV 3→2. Cộng với `_DACHOT` thì ra 5 · 2 · 3 — khớp chính xác đỉnh
     lịch sử, không mất chữ nào.

     Nên phép đo phải TRỪ phần đã tiễn đi. Một phép đo nêu ba chỗ đúng
     luật là một phép đo có ba dòng nhiễu, và ba dòng nhiễu thì lần sau
     người ta lướt qua cả bảng — đúng lúc có dòng thật. */
  const voi = [];
  const bienMat = [];
  const daTien = [];
  for (const [k, d] of Object.entries(dinh)) {
    const gio = k in nay ? demBanGhi(nay[k]) : null;
    if (gio === null) { bienMat.push({ kho: k, ...d }); continue; }
    if (gio >= d.so) continue;
    const chot = /_CHOCHU$/.test(k) ? k.replace(/_CHOCHU$/, '_DACHOT') : null;
    const soChot = chot && chot in nay ? demBanGhi(nay[chot]) : 0;
    if (chot && gio + soChot >= d.so) {
      daTien.push({ kho: k, dinh: d.so, gio, chot, soChot });
      continue;
    }
    voi.push({ kho: k, dinh: d.so, gio, ban: d.ban, chot, soChot });
  }
  voi.sort((a, b) => (b.dinh - b.gio) - (a.dinh - a.gio));

  console.log('  Đã soi ' + Object.keys(dinh).length + ' kho qua ' + chon.length + ' bản lưu.\n');

  if (bienMat.length) {
    console.log('  ── ' + bienMat.length + ' KHO TỪNG CÓ MÀ NAY KHÔNG CÒN ──\n');
    bienMat.slice(0, 25).forEach(x =>
      console.log('    ' + x.kho.padEnd(24) + String(x.so).padStart(6) +
        ' bản ghi ở ' + (x.ban.ban || x.ban.h) + ' (' + x.ban.ngay + ')'));
    if (bienMat.length > 25) console.log('    … và ' + (bienMat.length - 25) + ' kho nữa');
    console.log('');
  }

  if (voi.length) {
    console.log('  ── ' + voi.length + ' KHO NAY ÍT HƠN LÚC ĐẦY NHẤT ──\n');
    voi.slice(0, 30).forEach(x =>
      console.log('    ' + x.kho.padEnd(24) +
        String(x.dinh).padStart(6) + ' → ' + String(x.gio).padStart(6) +
        '   (−' + (x.dinh - x.gio) + ')  đầy nhất ở ' + (x.ban.ban || x.ban.h)));
    if (voi.length > 30) console.log('    … và ' + (voi.length - 30) + ' kho nữa');
    console.log('');
  }

  if (daTien.length) {
    console.log('  ── ' + daTien.length + ' SỔ CHỜ VƠI ĐI ĐÚNG LUẬT, KHÔNG PHẢI MẤT ──\n');
    daTien.forEach(x =>
      console.log('    ' + x.kho.padEnd(24) + String(x.dinh).padStart(3) + ' → ' +
        String(x.gio).padStart(3) + ' + ' + x.soChot + ' ở ' + x.chot +
        '  = ' + (x.gio + x.soChot) + '  ✓ khớp đỉnh'));
    console.log('\n    Mục đã trả lời được TIỄN sang _DACHOT — gỡ khỏi sổ chờ, KHÔNG xoá');
    console.log('    (luật 9.99.61). Câu trả lời kèm lý do là thứ đáng giữ nhất.\n');
  }

  if (!voi.length && !bienMat.length) {
    console.log('  ✓ KHÔNG NỘI DUNG NÀO MẤT — mọi kho hôm nay đều đầy bằng hoặc hơn');
    console.log('    bản đầy nhất từng có' +
      (daTien.length ? ', trừ ' + daTien.length + ' sổ chờ vơi đi đúng luật ở trên' : '') + '.\n');
    return;
  }

  console.log('  ── MÁY KHÔNG KẾT LUẬN CHỖ NÀO LÀ HỎNG ──\n');
  console.log('  Một kho bị cắt bớt CÓ CHỦ Ý trông y hệt một kho bị mất, và máy không');
  console.log('  phân biệt được — chỉ người viết kho mới biết. Nên máy nêu chỗ ngờ rồi');
  console.log('  dừng, kèm đường lấy vật liệu ra:\n');
  const vd = (voi[0] || bienMat[0]);
  console.log('    node tools/kho-luu.js --doi ' + vd.kho);
  console.log('    node tools/kho-luu.js --sua ' + vd.kho + '\n');
}

/* ═══════════════ ĐỜI MỘT KHO ═══════════════ */
function doi(ten, sau) {
  const khoa = docKhoa();
  const ban = danhSachBan();
  const buoc = Math.max(1, Math.ceil(ban.length / (sau || ban.length)));
  const chon = ban.filter((_, i) => i % buoc === 0);
  if (chon[chon.length - 1] !== ban[ban.length - 1]) chon.push(ban[ban.length - 1]);

  console.log('\n  ĐỜI CỦA KHO ' + ten + ' — đọc ' + chon.length + '/' + ban.length + ' bản lưu\n');
  let truoc = null, i = 0;
  const dong = [];
  for (const b of chon) {
    i++;
    tienDo('\r    đang đọc ' + i + '/' + chon.length + '   ');
    const kho = docBan(khoa, b.H);
    const n = (ten in kho) ? demBanGhi(kho[ten]) : null;
    /* In MỌI chỗ đổi, và chỉ chỗ đổi: in hết thì 201 dòng gần như giống
       nhau, và chỗ tụt nằm lẫn trong đó. */
    if (n !== truoc) { dong.push({ b, n, truoc }); truoc = n; }
  }
  xoaTienDo();

  if (!dong.length) { console.log('    Không có kho tên ' + ten + ' ở bản lưu nào.\n'); return; }
  dong.forEach(d => {
    const mui = d.truoc === null ? '  (xuất hiện)'
      : d.n === null ? '  ← BIẾN MẤT'
      : d.n < d.truoc ? '  ← VƠI ĐI ' + (d.truoc - d.n)
      : '  (+' + (d.n - d.truoc) + ')';
    console.log('    ' + d.b.ngay + '  ' + (d.b.ban || d.b.h).padEnd(10) +
      String(d.n === null ? '—' : d.n).padStart(6) + ' bản ghi' + mui);
  });
  const dinh = dong.reduce((a, d) => (d.n !== null && d.n > (a ? a.n : -1)) ? d : a, null);
  if (dinh) console.log('\n    Đầy nhất: ' + dinh.n + ' bản ghi ở ' +
    (dinh.b.ban || dinh.b.h) + ' (' + dinh.b.ngay + ')');
  console.log('\n    Lấy bản ấy ra: node tools/kho-luu.js --lay ' + ten + ' ' +
    (dinh ? dinh.b.h : chon[0].h) + '\n');
}

/* ═══════════════ LẤY MỘT KHO Ở MỘT BẢN ═══════════════ */
function lay(ten, banH, raDuong) {
  const khoa = docKhoa();
  const ban = danhSachBan();
  const b = ban.find(x => x.h === banH || x.H === banH || x.ban === banH);
  if (!b) { console.error('\n  ✗ Không có bản lưu nào tên "' + banH + '".\n'); process.exit(1); }
  const kho = docBan(khoa, b.H);
  if (!(ten in kho)) {
    console.error('\n  ✗ Bản ' + (b.ban || b.h) + ' không có kho ' + ten + '.\n');
    process.exit(1);
  }
  const ra = path.resolve(raDuong ||
    path.join(GOC, '..', ten + '-' + (b.ban || b.h) + '.json'));
  if (ra === GOC || ra.startsWith(GOC + path.sep)) {
    console.error('\n  ✗ KHÔNG ghi vào trong kho mã: ' + ra);
    console.error('    Tệp này là nội dung chưa mã hoá của Học viện, cùng loại với');
    console.error('    kho-goc/. Chọn một chỗ ngoài kho.\n');
    process.exit(1);
  }
  fs.writeFileSync(ra, JSON.stringify(kho[ten], null, 2) + '\n', { mode: 0o600 });
  console.log('\n  ✓ ĐÃ LẤY ' + ten + ' Ở BẢN ' + (b.ban || b.h) + ' (' + b.ngay + ')');
  console.log('    ' + demBanGhi(kho[ten]) + ' bản ghi → ' + ra + '\n');
  console.log('  Máy KHÔNG tự vá vào kho-goc/. Một kho ở bản cũ có thể đã bị cắt bớt');
  console.log('  có chủ ý, và máy không phân biệt được "mất" với "bỏ". Đọc tệp trên,');
  console.log('  so bằng mắt, rồi tự quyết phần nào vá lại.\n');
}

/* ═══════════════ SỬA: LẤY BẢN ĐẦY NHẤT ═══════════════ */
function sua(ten, sau) {
  const khoa = docKhoa();
  const ban = danhSachBan();
  const buoc = Math.max(1, Math.ceil(ban.length / (sau || ban.length)));
  const chon = ban.filter((_, i) => i % buoc === 0);
  if (chon[chon.length - 1] !== ban[ban.length - 1]) chon.push(ban[ban.length - 1]);

  console.log('\n  TÌM BẢN ĐẦY NHẤT CỦA ' + ten + ' — đọc ' + chon.length + ' bản lưu\n');
  let dinh = null, i = 0;
  for (const b of chon) {
    i++;
    tienDo('\r    đang đọc ' + i + '/' + chon.length + '   ');
    const kho = docBan(khoa, b.H);
    if (!(ten in kho)) continue;
    const n = demBanGhi(kho[ten]);
    if (!dinh || n > dinh.so) dinh = { so: n, b };
  }
  xoaTienDo();
  if (!dinh) { console.error('  ✗ Không có kho tên ' + ten + ' ở bản lưu nào.\n'); process.exit(1); }
  console.log('    Đầy nhất: ' + dinh.so + ' bản ghi ở ' + (dinh.b.ban || dinh.b.h) +
    ' (' + dinh.b.ngay + ')\n');
  lay(ten, dinh.b.h);
}


/* ═══════════════ SOI: KHOÁ CÒN MỞ ĐƯỢC BAO NHIÊU BẢN LƯU ═══════════════

   Câu hỏi không ai từng hỏi, và nó là câu quyết định kho lưu trữ này còn
   là kho lưu trữ hay đã thành 201 chuỗi byte.

   `ma-hoa-kho.js --doi-khoa` sinh bộ khoá mới. Dòng cảnh báo của nó nói
   đúng phần trước mắt — "mọi giấy phép đã cấp sẽ hết hiệu lực" — và
   KHÔNG nói phần nặng hơn: **mọi bản lưu trong lịch sử git cũng khoá
   lại vĩnh viễn.** Bản mới vẫn mở được, mọi bộ kiểm khác vẫn xanh, nên
   không ai biết cho tới lúc cần lấy lại một thứ đã mất.

   Đo thật, 9.99.79: 197/201 mở được. Bốn bản không mở được đều ngày
   28/08/2026, dựng TRƯỚC khi bộ khoá hôm nay được chốt — đó không phải
   hỏng, đó là lịch sử, và phép đo phải biết phân biệt hai chuyện ấy. */
function soi() {
  const khoa = docKhoa();
  const ban = danhSachBan();
  console.log('\n  KHOÁ HÔM NAY CÒN MỞ ĐƯỢC BAO NHIÊU BẢN LƯU\n');
  let mo = 0; const khong = [];
  let i = 0;
  for (const b of ban) {
    i++;
    tienDo('\r    đang thử ' + i + '/' + ban.length + '   ');
    let ok = false;
    for (const g of GOI) {
      let buf;
      try { buf = git('show ' + b.H + ':kho/' + g + '.enc', true); } catch { continue; }
      try { moGoi(khoa[g], buf); ok = true; break; } catch { /* thử gói sau */ }
    }
    if (ok) mo++; else khong.push(b);
  }
  xoaTienDo();
  const ti = Math.round(mo / ban.length * 100);
  console.log('    tổng bản lưu : ' + ban.length);
  console.log('    mở được      : ' + mo + '  (' + ti + '%)');
  console.log('    không mở được: ' + khong.length + '\n');
  if (khong.length) {
    khong.forEach(b => console.log('      ' + b.ngay + '  ' + b.h + '  ' +
      b.tieuDe.slice(0, 54)));
    const dauMo = ban.find(b => khong.indexOf(b) < 0);
    console.log('\n    Bản cũ nhất còn mở được: ' + dauMo.ngay + '  ' + dauMo.h +
      '  ' + (dauMo.ban || ''));
    console.log('');
  }
  if (ti >= 95) {
    console.log('  ✓ KHO LƯU TRỮ CÒN ĐỌC ĐƯỢC — ' + ti + '% bản lưu mở được bằng khoá');
    console.log('    hôm nay. Phần không mở được nằm ở ĐẦU lịch sử, dựng trước khi bộ');
    console.log('    khoá này được chốt — đó là lịch sử, không phải hỏng.\n');
  } else {
    console.log('  ✗ KHO LƯU TRỮ ĐÃ MẤT PHẦN LỚN — chỉ còn ' + ti + '% mở được.');
    console.log('    Dấu hiệu của một lượt đổi khoá. Bộ khoá CŨ là thứ duy nhất mở lại');
    console.log('    được phần kia, và nó chỉ còn trong một bản sao lưu .gita cũ.\n');
  }
  process.exit(ti >= 95 ? 0 : 1);
}

/* ═══════════════ CHẠY ═══════════════ */
function chay() {
  const a = process.argv.slice(2);
  const iSau = a.indexOf('--sau');
  const sau = iSau >= 0 ? Number(a[iSau + 1]) : 0;
  if (a[0] === '--soi') return soi();
  if (a[0] === '--mat') return soiMat(sau);
  if (a[0] === '--doi') {
    if (!a[1]) { console.error('\n  Thiếu tên kho: --doi <KHO>\n'); process.exit(2); }
    return doi(a[1], sau);
  }
  if (a[0] === '--lay') {
    if (!a[1] || !a[2]) { console.error('\n  Dùng: --lay <KHO> <bản> [tệp-ra]\n'); process.exit(2); }
    return lay(a[1], a[2], a[3]);
  }
  if (a[0] === '--sua') {
    if (!a[1]) { console.error('\n  Thiếu tên kho: --sua <KHO>\n'); process.exit(2); }
    return sua(a[1], sau);
  }
  return lietKe();
}

module.exports = { danhSachBan, docBan, demBanGhi };

if (require.main === module) {
  try { chay(); }
  catch (e) { console.error('\n  ✗ ' + e.message + '\n'); process.exit(1); }
}
