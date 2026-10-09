#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — PHIẾU QUYẾT: GOM MỌI CÂU CHỜ CHỦ HỆ VỀ MỘT TỜ

       node tools/phieu-quyet.js [tệp-ra.md]

   ══ VÌ SAO CẦN, DÙ ĐÃ CÓ soat-san-sang ══

   `soat-san-sang.js` trả lời đúng câu nó sinh ra để trả lời: *còn thiếu
   chỗ nào máy soát được không*. Với 53 mục máy không đo được, nó in ra
   MỘT DÒNG duy nhất nối tên chúng bằng dấu chấm giữa — dài hơn hai
   nghìn ký tự.

   Dòng ấy đúng. Nó cũng vô dụng với người phải trả lời, vì để trả lời
   một câu thì phải biết: câu hỏi là gì · vì sao máy không quyết thay
   được · cần gì để trả lời · và trả lời rồi thì ghi vào đâu. Bốn thứ ấy
   đều CÓ SẴN trong kho, chỉ là chưa bao giờ được trình ra cùng nhau.

   **Một sự thật CÓ mà không đọc ra được thì trên thực tế là KHÔNG CÓ.**
   Đúng câu đã viết cho sổ truy vết một tấm ở 9.99.59, và nó áp vào đây
   y hệt: 53 câu hỏi nằm rải trong 33 sổ thì không ai trả lời được câu
   nào, nên sổ chờ chỉ dài ra chứ không ngắn đi — và đó chính là cách
   một sổ chờ mục.

   ══ PHIẾU NÀY KHÔNG QUYẾT THAY ══

   Không có ô "máy đề nghị" trong phiếu. Luật của kho là *máy đề xuất,
   chủ hệ quyết*, và một lời đề nghị in sẵn cạnh câu hỏi thì người đọc
   gật theo — nhất là lúc mệt, nhất là với câu khó, tức là đúng những
   câu đáng nghĩ nhất. Máy gom câu hỏi lại; nghĩ là việc của người.

   ══ CHIA HAI PHẦN, VÌ CHÚNG KHÔNG CÙNG MỘT LOẠI ══

   A · VIỆC VIẾT — mục có ô `do`, máy đếm được tiến độ. Đây KHÔNG phải
       câu hỏi: không ai phải quyết gì, chỉ là chưa ai ngồi viết. Trình
       chung với phần B thì một việc cần ba trăm giờ viết nằm cạnh một
       câu trả lời trong ba mươi giây, cùng kiểu chữ — và người đọc tin
       cả hai nặng như nhau.

   B · QUYẾT ĐỊNH — mục khai `khongDoDuoc`. Xếp theo SỔ chứ không theo
       mã: câu cùng một vùng thì trả lời một lượt được, còn xếp theo mã
       thì mỗi câu kéo người đọc sang một chuyện khác.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

const fs = require('fs');
const path = require('path');
const { cau, ten, docKhoTuEnc, docSoCho } = require('./so-cho.js');

const GOC = path.resolve(__dirname, '..');

/* Ô nào nói gì. Khai thẳng, vì tên ô ở đây không tự giải thích được và
   người đọc phiếu không phải người viết kho. */
const O = [
  ['khongDoDuoc', 'Vì sao máy không quyết thay được'],
  ['canGi', 'Cần gì để trả lời'],
  ['vi', 'Vì sao mục này tồn tại'],
  ['boi', 'Ai hỏi'],
  ['noiDien', 'Trả lời rồi thì ghi vào đâu'],
  ['lenhDung', 'Lệnh để xem hiện trạng'],
  ['mayDangLam', 'Máy đang tạm làm gì trong lúc chờ'],
  ['banGoc', 'Bản đặc tả nói gì'],
  ['toiNghieng', 'Người viết nghiêng về đâu'],
  ['thuDung', 'Thử đúng chưa'],
  ['neuLaTangSau', 'Nếu là tầng sau thì sao'],
  ['canXacNhan', 'Cần xác nhận điều gì']
];

/* ═══════════════ CỔNG CHỖ GHI ═══════════════

   Phiếu chép NGUYÊN VĂN nội dung của 30 sổ chờ nằm trong gói NGHỀ. Đó
   là nội dung nghề của Học viện, cùng loại với `kho-goc/` và bản đọc bộ
   13 tờ A0 — cả hai đã bị chặn khỏi kho mã từ lâu vì đúng một lý do:
   nội dung chưa mã hoá không lên một kho ai cũng nhân bản được.

   Nên cổng này hỏi THẲNG GIT, không tự suy từ tên tệp: `git check-ignore`
   là câu trả lời của chính công cụ sẽ quyết định. Tự suy từ tên thì đổi
   tên tệp một chút là lọt, và người đổi tên không cố ý — họ chỉ đang
   muốn hai bản phiếu để so.

   CHẶN chứ không cảnh báo: GitHub giữ lịch sử, nên lọt một lần là lọt
   vĩnh viễn, và không có lệnh nào gọi về được. */
function soatChoGhi(ra) {
  const trongKho = ra === GOC || ra.startsWith(GOC + path.sep);
  if (!trongKho) return;
  let biChan = false;
  try {
    require('child_process').execSync(
      'git -C ' + JSON.stringify(GOC) + ' check-ignore -q ' + JSON.stringify(ra),
      { stdio: 'ignore' });
    biChan = true;
  } catch { biChan = false; }
  if (biChan) return;
  throw new Error(
    'KHÔNG ghi phiếu vào một đường git đang theo dõi: ' + ra + '\n\n' +
    '  Phiếu chép nguyên văn nội dung 30 sổ chờ nằm trong gói NGHỀ — nội dung\n' +
    '  nghề của Học viện, cùng loại với kho-goc/. Lọt lên GitHub một lần là lọt\n' +
    '  vĩnh viễn, vì GitHub giữ lịch sử.\n\n' +
    '  Hai đường đi:\n' +
    '    · thêm đường ấy vào .gitignore, hoặc\n' +
    '    · ghi ra ngoài kho:  node tools/phieu-quyet.js ~/phieu-quyet.md');
}

function doanVan(s, rong) {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  if (!t) return [];
  const tu = t.split(' ');
  const ra = [];
  let d = '';
  for (const w of tu) {
    if ((d + ' ' + w).trim().length > rong) { ra.push(d.trim()); d = w; }
    else d = (d + ' ' + w).trim();
  }
  if (d) ra.push(d);
  return ra;
}

function chay() {
  let kho;
  try { kho = docKhoTuEnc(); }
  catch (e) {
    console.error('\n  ✗ Không đọc được kho: ' + e.message);
    console.error('    Phiếu này cần kho/khoa.json để giải mã các gói.\n');
    process.exit(2);
  }

  const so = docSoCho(kho);
  const viec = [];   /* A · có ô `do` — máy đếm được tiến độ */
  const quyet = [];  /* B · khai `khongDoDuoc` — chờ người quyết */
  const la = [];     /* mục không khai đường nào — mục 77 của bộ kiểm bắt */

  for (const s of so) {
    for (const m of s.muc) {
      const d = { so: s.so, m };
      if (m.do) viec.push(d);
      else if (m.khongDoDuoc) quyet.push(d);
      else la.push(d);
    }
  }

  const d = [];
  const p = x => d.push(x);

  p('# GITA 365 — PHIẾU QUYẾT');
  p('');
  p('Dựng lúc ' + new Date().toISOString().slice(0, 16).replace('T', ' ') +
    ' · bản ' + (( /version:\s*'([^']+)'/.exec(
      fs.readFileSync(path.join(GOC, 'src', 'data.core.js'), 'utf8')) || [])[1] || '?'));
  p('');
  p('Đọc thẳng từ ' + so.length + ' sổ chờ trong kho đã mã hoá. Không có bản thứ hai:');
  p('sửa kho là phiếu đổi theo, và phiếu này không bao giờ cũ hơn kho.');
  p('');
  p('| | Số mục |');
  p('|---|---|');
  p('| **A · Việc viết** — không ai phải quyết gì, chỉ là chưa ai ngồi viết | ' + viec.length + ' |');
  p('| **B · Quyết định** — máy không quyết thay được | ' + quyet.length + ' |');
  if (la.length) p('| ⚠ Chưa khai đường đo — bộ kiểm mục 77 bắt đỏ | ' + la.length + ' |');
  p('| **Tổng** | ' + (viec.length + quyet.length + la.length) + ' |');
  p('');
  p('Hai phần KHÔNG trộn vào nhau. Một việc cần ba trăm giờ viết đặt cạnh một câu');
  p('trả lời trong ba mươi giây, cùng kiểu chữ, thì người đọc tin cả hai nặng như nhau.');
  p('');
  p('Phiếu này **không có ô "máy đề nghị"**. Luật của kho là *máy đề xuất, chủ hệ');
  p('quyết*, và một lời đề nghị in sẵn cạnh câu hỏi thì người đọc gật theo — nhất là');
  p('lúc mệt, nhất là với câu khó, tức là đúng những câu đáng nghĩ nhất.');
  p('');
  p('---');
  p('');

  /* ── A ── */
  p('## A · VIỆC VIẾT — ' + viec.length + ' mục');
  p('');
  p('Máy đếm được tiến độ của những mục này, nên chúng không phải câu hỏi.');
  p('Chạy `node tools/soat-san-sang.js` để thấy con số hôm nay.');
  p('');
  for (const x of viec) {
    p('- **' + ten(x.m) + '** — ' + (cau(x.m) || '(không có câu)'));
    if (x.m.noiDien) doanVan('Điền tại: ' + x.m.noiDien, 92).forEach(l => p('  ' + l));
  }
  p('');
  p('---');
  p('');

  /* ── B ── */
  p('## B · QUYẾT ĐỊNH — ' + quyet.length + ' mục');
  p('');
  p('Xếp theo **sổ**, không theo mã: câu cùng một vùng thì trả lời một lượt được,');
  p('còn xếp theo mã thì mỗi câu kéo người đọc sang một chuyện khác.');
  p('');

  const theoSo = {};
  quyet.forEach(x => (theoSo[x.so] = theoSo[x.so] || []).push(x.m));

  for (const s of Object.keys(theoSo).sort()) {
    p('### ' + s + ' — ' + theoSo[s].length + ' câu');
    p('');
    for (const m of theoSo[s]) {
      p('#### ' + ten(m));
      p('');
      if (m.ma && cau(m)) { p('> ' + cau(m)); p(''); }
      for (const [o, nhanO] of O) {
        if (!m[o]) continue;
        p('**' + nhanO + '** — ' + String(m[o]).replace(/\s+/g, ' ').trim());
        p('');
      }
      /* Mục không khai chỗ ghi thì NÓI RA. Luật của kho: một mục chờ
         không có chỗ ghi thì nó không phải mục chờ, nó là một lời than
         — và ND-04 đã đứng yên ba bản đúng vì thế. Với mục quyết định
         thì chỗ ghi mặc định là ô `daChot` trên chính nó (kiểu đo thứ
         năm, 9.99.61): một câu hỏi mang sẵn câu trả lời trong ô của nó
         thì nó đã xong. */
      if (!m.noiDien) {
        p('**Trả lời rồi thì ghi vào đâu** — mục này chưa khai `noiDien`. ' +
          'Chỗ ghi mặc định là ô `daChot` ngay trên chính mục, trong `' + s + '` ' +
          '(kiểu đo thứ năm, 9.99.61): viết câu trả lời kèm lý do vào đó, rồi ' +
          'chuyển mục sang sổ `' + s.replace(/_CHOCHU$/, '_DACHOT') + '` — gỡ khỏi ' +
          'sổ chờ, **không xoá**: câu trả lời kèm lý do là thứ đáng giữ nhất.');
        p('');
      }
      p('---');
      p('');
    }
  }

  if (la.length) {
    p('## ⚠ CHƯA KHAI ĐƯỜNG ĐO — ' + la.length + ' mục');
    p('');
    p('Mục không khai `do` cũng không khai `khongDoDuoc` thì bộ soát không tự đóng');
    p('được nó khi nó xong, và nó nằm lại mãi. Bộ kiểm mục 77 bắt đỏ chỗ này.');
    p('');
    la.forEach(x => p('- ' + x.so + ' · ' + ten(x.m)));
    p('');
  }

  const ra = path.resolve(process.argv[2] || path.join(GOC, 'PHIEU-QUYET.md'));
  soatChoGhi(ra);
  fs.writeFileSync(ra, d.join('\n') + '\n', { mode: 0o600 });

  console.log('\n  ✓ ĐÃ DỰNG PHIẾU QUYẾT\n');
  console.log('    ' + ra);
  console.log('    ' + so.length + ' sổ · ' + (viec.length + quyet.length + la.length) + ' mục');
  console.log('      A · việc viết   : ' + String(viec.length).padStart(3) +
    '  (không ai phải quyết gì, chỉ là chưa ai ngồi viết)');
  console.log('      B · quyết định  : ' + String(quyet.length).padStart(3) +
    '  (máy không quyết thay được)');
  if (la.length) console.log('      ⚠ chưa khai đo : ' + String(la.length).padStart(3) +
    '  (bộ kiểm mục 77 bắt đỏ)');
  console.log('');
}

if (require.main === module) {
  try { chay(); }
  catch (e) { console.error('\n  ✗ ' + e.message + '\n'); process.exit(1); }
}
module.exports = { chay };
