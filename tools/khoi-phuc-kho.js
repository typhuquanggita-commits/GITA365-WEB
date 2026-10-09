#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — KHÔI PHỤC, HAI ĐƯỜNG VÀ CHÚNG KHÔNG NGANG NHAU

       node tools/khoi-phuc-kho.js <tệp.gita> [thư-mục-ra]   ← đường ĐỦ
       node tools/khoi-phuc-kho.js --tu-enc [thư-mục-ra]     ← đường CỤT

   ══ VÌ SAO PHẢI CÓ TỆP NÀY, KHÔNG PHẢI MỘT DÒNG TRONG TÀI LIỆU ══

   Bản 9.6 đã cứu cả kho một lần bằng cách giải mã bảy gói `.enc` rồi
   dựng lại `kho-goc/`. Cách làm ấy sống trong TRÍ NHỚ của một phiên làm
   việc và trong vài câu ở CLAUDE.md.

   Một đường cứu chỉ nằm ở dạng chữ là một đường chưa ai đi thử. Lúc cần
   nó là lúc đang hoảng, và lúc hoảng thì không ai ngồi viết lại một bộ
   giải mã từ đầu. Cùng luật với ô "lùi lại thế nào" phải được THỬ ở cửa
   4 chứ không chỉ được VIẾT ở cửa 1 (9.99.77).

   ══ HAI ĐƯỜNG KHÁC HẲN NHAU, VÀ MÀN HÌNH PHẢI NÓI RA ══

   ĐƯỜNG 1 · từ tệp .gita  → ĐỦ
     Trả lại đúng 173 tệp nguồn, đúng từng byte, kèm 7.201 dòng chú giải
     và kèm kho/khoa.json. Sau lệnh này kho chạy lại được ngay.

   ĐƯỜNG 2 · từ kho/*.enc  → CỤT
     Chỉ có khi CÒN kho/khoa.json. Trả lại 1.131 kho DỮ LIỆU và
     KHÔNG trả lại:
       · 7.201 dòng chú giải — phần nói VÌ SAO, phần đáng giá nhất
       · cách chia 173 tệp
       · mọi hàm (JSON.stringify bỏ hàm — luật số 1 của kho nội dung)

     Đường này dựng ra một tệp DUY NHẤT, cố ý đặt tên `.KHOI-PHUC.js`
     và cố ý KHÔNG ghi đè `kho-goc/`. Nó là vật liệu để người ta dựng
     lại bằng tay, không phải một bản `kho-goc/` chạy được.

   Trộn hai đường vào một câu "đã khôi phục xong" là chỗ nguy hiểm nhất
   của cả tệp: người ta đọc thấy xong, đóng máy, và sáu tháng sau mở ra
   thì kho không còn một dòng nào nói vì sao nó được viết như thế.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

const GOC = path.resolve(__dirname, '..');
const { giaiMa } = require('./sao-luu.js');

/* ═══════════════ ĐỌC MẬT KHẨU ═══════════════
   Cùng luật với sao-luu.js: không bao giờ qua argv. */
function docMatKhau() {
  if (process.env.GITA_MAT_KHAU_SAO_LUU) return process.env.GITA_MAT_KHAU_SAO_LUU;
  if (!process.stdin.isTTY) {
    throw new Error(
      'Chưa có mật khẩu. Đặt biến môi trường rồi chạy lại:\n\n' +
      '    read -rs GITA_MAT_KHAU_SAO_LUU && export GITA_MAT_KHAU_SAO_LUU\n\n' +
      '  KHÔNG truyền mật khẩu qua tham số: ps aux đọc được argv.');
  }
  process.stdout.write('Mật khẩu sao lưu (không hiện chữ): ');
  const tat = fs.openSync('/dev/tty', 'rs');
  let mk = '';
  try {
    const buf = Buffer.alloc(1);
    for (;;) {
      const n = fs.readSync(tat, buf, 0, 1, null);
      if (n === 0) break;
      const c = buf.toString('utf8');
      if (c === '\n' || c === '\r') break;
      mk += c;
    }
  } finally { fs.closeSync(tat); }
  process.stdout.write('\n');
  return mk;
}

/* ═══════════════ ĐƯỜNG 1 · TỪ TỆP .gita ═══════════════ */
function tuGoi(tepGoi, raThuMuc, deLen) {
  const buf = fs.readFileSync(tepGoi);
  const bam = crypto.createHash('sha256').update(buf).digest('hex');
  const mk = docMatKhau();

  let than;
  try {
    than = JSON.parse(zlib.gunzipSync(giaiMa(buf, mk)).toString('utf8'));
  } catch (e) {
    /* GCM báo sai thì KHÔNG đoán hộ là do đâu. Hai nguyên nhân khác hẳn
       nhau — sai mật khẩu, và tệp bị sửa — nên nói cả hai và để người
       đọc biết đường nào cũng phải kiểm. Đoán một cái là dẫn họ đi sai
       đường đúng vào lúc đang vội. */
    throw new Error(
      'KHÔNG MỞ ĐƯỢC. Hai nguyên nhân, và chúng khác hẳn nhau:\n\n' +
      '  1. Sai mật khẩu — gõ lại.\n' +
      '  2. Tệp đã bị sửa hoặc chép dở dang — AES-GCM xác thực, nên một\n' +
      '     byte lệch là nó BÁO chứ không trả về rác trông giống dữ liệu.\n' +
      '     Đối chiếu với biên nhận:  sha256sum ' + path.basename(tepGoi) + '\n' +
      '     Tệp này đang là: ' + bam + '\n\n' +
      '  (' + e.message + ')');
  }

  console.log('\n  BẢN SAO LƯU MỞ ĐƯỢC');
  console.log('    tạo lúc : ' + than.taoLuc);
  console.log('    bản GITA: ' + than.banGita + ' · commit ' + than.commit);
  console.log('    gồm     : ' + than.soTep + ' tệp · ' + Math.round(than.soByte / 1024) + ' KB\n');

  const ra = path.resolve(raThuMuc || GOC);

  /* ── CỔNG GHI ĐÈ ──
     Khôi phục vào một kho ĐANG CÓ nội dung là chỗ mất dữ liệu thật: bản
     sao lưu cũ hơn đè lên công việc mới hơn, và không có git để lùi vì
     kho-goc/ nằm trong .gitignore — đúng cái vòng luẩn quẩn tạo ra cả
     tệp này. Nên CHẶN, và bắt người ta gõ thêm một cờ. */
  const cho = [];
  for (const t of Object.keys(than.tep)) {
    const d = path.join(ra, t);
    if (fs.existsSync(d) && fs.readFileSync(d, 'utf8') !== than.tep[t]) cho.push(t);
  }
  if (cho.length && !deLen) {
    console.log('  ✗ DỪNG — ' + cho.length + ' tệp ở đích đang KHÁC bản sao lưu.\n');
    cho.slice(0, 8).forEach(t => console.log('      ' + t));
    if (cho.length > 8) console.log('      … và ' + (cho.length - 8) + ' tệp nữa');
    console.log('\n  kho-goc/ nằm trong .gitignore nên KHÔNG CÓ GIT ĐỂ LÙI. Ghi đè ở');
    console.log('  đây là mất hẳn phần mới hơn, và đó đúng là chuyện tệp này sinh ra');
    console.log('  để chống.\n');
    console.log('  Muốn xem trước thì khôi phục ra chỗ khác rồi tự so:');
    console.log('    node tools/khoi-phuc-kho.js ' + path.basename(tepGoi) + ' /tmp/xem-thu\n');
    console.log('  Chắc chắn muốn đè thì gõ thêm:  --de-len\n');
    process.exit(1);
  }

  let ghi = 0;
  for (const [t, noi] of Object.entries(than.tep)) {
    const d = path.join(ra, t);
    fs.mkdirSync(path.dirname(d), { recursive: true });
    /* khoa.json là bí mật — 0600 chứ không 0644. */
    fs.writeFileSync(d, noi, { mode: t.endsWith('khoa.json') ? 0o600 : 0o644 });
    ghi++;
  }

  console.log('  ✓ ĐÃ KHÔI PHỤC ĐỦ — ' + ghi + ' tệp vào ' + ra);
  console.log('    gồm cả chú giải và cả kho/khoa.json.\n');
  console.log('  Ba việc kiểm lại, theo đúng thứ tự:');
  console.log('    node tools/ma-hoa-kho.js      # đóng lại kho từ nguồn vừa khôi phục');
  console.log('    node tools/soi-doi-kho.js     # PHẢI ra 0 đổi, 0 biến mất');
  console.log('    xvfb-run -a node tools/kiem-tra.js --im\n');
  console.log('  soi-doi-kho báo "0 đổi · 0 biến mất" là bằng chứng bản sao lưu khớp');
  console.log('  với 8 gói .enc đang nằm trong git — hai nguồn độc lập cùng nói một điều.\n');
}

/* ═══════════════ ĐƯỜNG 2 · TỪ kho/*.enc ═══════════════ */
function ruotGoi(ro) {
  const b = Buffer.isBuffer(ro) ? ro : Buffer.from(ro);
  return JSON.parse((b[0] === 0x1f && b[1] === 0x8b ? zlib.gunzipSync(b) : b).toString('utf8'));
}

function moGoi(khoaB64, buf) {
  const de = crypto.createDecipheriv('aes-256-gcm', Buffer.from(khoaB64, 'base64'), buf.subarray(0, 12));
  de.setAuthTag(buf.subarray(12, 28));
  return ruotGoi(Buffer.concat([de.update(buf.subarray(28)), de.final()]));
}

function tuEnc(raThuMuc) {
  let khoa;
  try {
    khoa = JSON.parse(fs.readFileSync(path.join(GOC, 'kho', 'khoa.json'), 'utf8')).khoa;
  } catch {
    console.error('\n  ✗ KHÔNG CÓ kho/khoa.json — ĐƯỜNG NÀY CŨNG TẮC.\n');
    console.error('    8 tệp kho/*.enc trong git là chuỗi AES-256-GCM. Khoá sinh bằng');
    console.error('    crypto.randomBytes(32) nên KHÔNG suy ra được từ bất cứ thứ gì —');
    console.error('    không từ nội dung, không từ mật khẩu, không từ gì cả.\n');
    console.error('    Còn đúng hai chỗ có thể còn khoá:');
    console.error('      · một tệp .gita đã sao lưu  → dùng đường 1');
    console.error('      · bí mật GITA_KHOA_KHO trên Cloudflare:');
    console.error('        npx wrangler secret list   (xem có không — KHÔNG đọc lại được giá trị)\n');
    console.error('    Wrangler KHÔNG cho đọc lại giá trị một bí mật đã nạp. Nên nếu chỗ');
    console.error('    duy nhất còn khoá là Cloudflare thì phải lấy nó ra từ chính Worker');
    console.error('    đang chạy, trước khi làm bất cứ việc gì khác.\n');
    process.exit(1);
  }

  const ra = path.resolve(raThuMuc || path.join(GOC, 'kho-goc-KHOI-PHUC'));
  fs.mkdirSync(ra, { recursive: true });

  const tat = {};
  let soGoi = 0;
  for (const g of Object.keys(khoa)) {
    const f = path.join(GOC, 'kho', g + '.enc');
    if (!fs.existsSync(f)) continue;
    const d = moGoi(khoa[g], fs.readFileSync(f));
    /* NỐI, không GÁN ĐÈ: kho cắt theo bản ghi nằm ở hai gói cùng một
       tên (luật G.KHO_TRAI_RA). Gán đè thì gói nạp sau nuốt nửa kia, và
       đó đúng là lỗi đã xảy ra thật với TEST750 ở bản 9.6 — gộp bảy gói
       bằng Object.assign nên gói cuối đè hết, 25 bộ còn 5. */
    for (const [ten, gt] of Object.entries(d)) {
      if (Array.isArray(gt) && Array.isArray(tat[ten])) tat[ten] = tat[ten].concat(gt);
      else if (tat[ten] && typeof tat[ten] === 'object' && gt && typeof gt === 'object' &&
               !Array.isArray(gt)) tat[ten] = Object.assign({}, tat[ten], gt);
      else tat[ten] = gt;
    }
    soGoi++;
  }

  const soKho = Object.keys(tat).length;
  const dau = [
    '/* ═══════════════════════════════════════════════════════════════',
    '   GITA 365 — KHO DỰNG LẠI TỪ kho/*.enc',
    '   Dựng lúc ' + new Date().toISOString(),
    '',
    '   ĐÂY KHÔNG PHẢI MỘT BẢN kho-goc/ ĐẦY ĐỦ.',
    '',
    '   Nó là ' + soKho + ' kho DỮ LIỆU giải ra từ ' + soGoi + ' gói đã mã hoá. Thứ nó',
    '   KHÔNG có, vì JSON.stringify không giữ:',
    '',
    '     · toàn bộ chú giải — phần nói VÌ SAO, phần đáng giá nhất',
    '     · cách chia 173 tệp nguồn',
    '     · mọi hàm (luật số 1 của kho nội dung)',
    '',
    '   Dùng nó làm VẬT LIỆU để dựng lại bằng tay, đừng dùng thẳng. Nạp',
    '   thẳng tệp này thì kho chạy được, và đó chính là cái bẫy: nó chạy',
    '   được nên không ai đi dựng lại phần chú giải, rồi sáu tháng sau',
    '   không còn dòng nào nói vì sao kho được viết như thế.',
    '   ═══════════════════════════════════════════════════════════════ */',
    "'use strict';",
    'var G = window.G || {}; window.G = G;',
    ''
  ].join('\n');

  const than = Object.keys(tat).sort()
    .map(k => 'G.' + k + ' = ' + JSON.stringify(tat[k], null, 2) + ';').join('\n\n');

  const duong = path.join(ra, 'data.KHOI-PHUC.js');
  fs.writeFileSync(duong, dau + '\n' + than + '\n');

  console.log('\n  ✓ ĐÃ DỰNG LẠI PHẦN DỮ LIỆU — ' + soKho + ' kho từ ' + soGoi + ' gói');
  console.log('    ' + duong + '\n');
  console.log('  ✗ VÀ ĐÂY LÀ PHẦN KHÔNG DỰNG LẠI ĐƯỢC:\n');
  console.log('      · toàn bộ chú giải — phần nói VÌ SAO');
  console.log('      · cách chia 173 tệp nguồn');
  console.log('      · mọi hàm trong kho\n');
  console.log('  Đường này là đường CỤT, và nó cụt ở đúng chỗ đắt nhất. Đường đủ là');
  console.log('  một tệp .gita:  node tools/sao-luu.js <thư-mục-ngoài-kho>\n');
}

/* ═══════════════ CHẠY ═══════════════ */
function chay() {
  const dau = process.argv[2];
  if (!dau) {
    console.log('\n  node tools/khoi-phuc-kho.js <tệp.gita> [thư-mục-ra] [--de-len]');
    console.log('      → ĐỦ: 173 tệp nguồn + chú giải + kho/khoa.json\n');
    console.log('  node tools/khoi-phuc-kho.js --tu-enc [thư-mục-ra]');
    console.log('      → CỤT: chỉ dữ liệu, mất chú giải. Cần kho/khoa.json còn sống.\n');
    process.exit(2);
  }
  if (dau === '--tu-enc') return tuEnc(process.argv[3]);
  if (!fs.existsSync(dau)) throw new Error('Không có tệp: ' + dau);
  return tuGoi(dau, process.argv[3], process.argv.includes('--de-len'));
}

module.exports = { tuGoi, tuEnc, moGoi };

if (require.main === module) {
  try { chay(); }
  catch (e) { console.error('\n  ✗ ' + e.message + '\n'); process.exit(1); }
}
