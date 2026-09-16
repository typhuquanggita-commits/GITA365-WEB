#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — SAO LƯU HAI THỨ KHÔNG CÓ Ở CHỖ NÀO KHÁC

       node tools/sao-luu.js <thư-mục-đích>

   ══ VÌ SAO TỆP NÀY PHẢI TỒN TẠI ══

   Kho mã giữ được gần hết mọi thứ. Đúng hai thứ nó KHÔNG giữ, và cả hai
   đều nằm trong `.gitignore` một cách cố ý:

     kho/khoa.json   682 byte · 8 khoá AES-256-GCM
     kho-goc/        173 tệp · 57.496 dòng nội dung gốc

   Cả hai đều đúng khi nằm ngoài git — nội dung chưa mã hoá và khoá mật
   không được lên một kho mã ai cũng nhân bản được. Nhưng cái giá của
   quyết định ấy là: **hôm nay chúng chỉ có MỘT bản, trên MỘT cái máy.**

   ══ MẤT KHOÁ THÌ MẤT NHỮNG GÌ — ĐO CHỨ KHÔNG ĐOÁN ══

   Khoá sinh bằng `crypto.randomBytes(32)` (ma-hoa-kho.js). Số ngẫu
   nhiên thì không suy ra được từ bất cứ thứ gì. Nên mất khoá là:

     · 8 tệp kho/*.enc trong git thành chuỗi byte không mở được
     · 1.131 kho nội dung đi theo
     · mọi giấy phép đã cấp ngừng chạy ngay lập tức

   CLAUDE.md viết "bảy tệp .enc đã phát hành là bản lưu duy nhất của nội
   dung — chúng đã cứu được cả kho một lần ở bản 9.6". Câu ấy ĐÚNG, và
   nó đúng **chỉ khi còn khoá**. Vế thứ hai chưa được ghi ở đâu cho tới
   bản này, và đó là chỗ nguy hiểm nhất: một lớp bảo vệ mà người đọc tin
   nó chống được nhiều hơn thật.

   ══ VÀ .enc KHÔNG DỰNG LẠI ĐƯỢC kho-goc/ ══

   Đo thật, không suy: `.enc` gói bằng `JSON.stringify`, nên nó giữ
   DỮ LIỆU và bỏ mọi thứ khác. Bỏ **7.201 dòng chú giải** — đúng phần
   CLAUDE.md gọi là đáng giá nhất, phần nói VÌ SAO. Bỏ cả cách chia
   173 tệp.

   Nên `khoi-phuc-kho.js` có hai đường, và đường đi từ `.enc` nói thẳng
   ra nó đang trả về một cái xác không có lời giải thích. Sao lưu bằng
   tệp này là đường duy nhất giữ được cả phần hồn.

   ══ BA LUẬT CỦA TỆP NÀY ══

   1. KHÔNG BAO GIỜ ghi bản sao lưu vào trong kho mã. Một tệp sao lưu
      nằm trong thư mục kho là một tệp sẽ bị `git add -A` nuốt vào đúng
      ngày người ta vội — và lúc ấy toàn bộ khoá mật lên GitHub. Cổng
      này CHẶN, không cảnh báo.
   2. Mật khẩu KHÔNG đi qua tham số dòng lệnh. `ps aux` đọc được argv
      của mọi tiến trình đang chạy, và lịch sử shell giữ lại nó. Đọc từ
      biến môi trường hoặc gõ tay, không có đường thứ ba.
   3. Bản sao lưu TỰ KIỂM. Ghi xong là giải mã lại ngay và đối chiếu
      từng tệp. Một bản sao lưu chưa ai thử khôi phục là một bản sao lưu
      chưa tồn tại — người ta chỉ phát hiện ra điều đó vào đúng lúc cần
      nó, cùng luật với đường lùi phải được THỬ ở 9.99.77.

   ══ CHỖ TỆP NÀY KHÔNG CỨU ĐƯỢC, NÓI THẲNG ══

   Mất MẬT KHẨU thì bản sao lưu này cũng là rác, y như mất khoá. Nó đổi
   "giữ 682 byte bí mật" thành "nhớ một câu mật khẩu" — dễ hơn nhiều,
   nhưng KHÔNG phải là không thể mất.

   Nên phải có HAI đường độc lập, và đường thứ hai đã nằm sẵn trong danh
   sách triển khai:

       cd may-chu && npx wrangler secret put GITA_KHOA_KHO

   Cloudflare giữ nội dung khoa.json, và `worker.js:580` đọc đúng biến
   ấy để chạy. Một việc, hai vấn đề: khoá có bản thứ hai ngoài máy này,
   và máy chủ có khoá để chạy thật.

   Hai đường cùng hỏng một lúc thì mới mất. Một đường thì không.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

const GOC = path.resolve(__dirname, '..');
const NHAN = Buffer.from('GITASL01', 'utf8');   /* 8 byte nhận dạng */
const PHIEN_BAN = 1;

/* scrypt: N=2^15 là mức nặng đủ để một máy để bàn mất ~100ms mỗi lần
   thử, tức là một lượt dò từ điển triệu mật khẩu mất nhiều ngày. Đặt
   thấp hơn thì mật khẩu ngắn của người dùng thật không còn được bảo vệ
   bởi gì cả — và mật khẩu người ta đặt thì luôn ngắn hơn ta tưởng. */
const SCRYPT = { N: 32768, r: 8, p: 1, maxmem: 80 * 1024 * 1024 };

const MAT_KHAU_TOI_THIEU = 12;

/* ═══════════════ THỨ ĐƯỢC SAO LƯU ═══════════════

   Khai thẳng, không quét bừa cả thư mục gốc. Quét bừa thì một hôm có ai
   để tệp riêng vào kho là nó đi vào bản sao lưu mà không ai biết — và
   bản sao lưu thì được mang đi chỗ khác. */
const PHAN = [
  { ten: 'kho/khoa.json', batBuoc: true,
    vi: 'BỘ KHOÁ. Mất nó thì 8 tệp .enc trong git thành rác không mở được, ' +
      'và 201 bản lưu trong lịch sử git cũng không mở được nốt.' },

  { ten: 'kho-goc', thuMuc: true, duoi: ['.js'], batBuoc: true,
    vi: 'Nội dung gốc kèm 7.201 dòng chú giải — phần .enc KHÔNG giữ.' },

  /* ── HAI PHẦN THÊM Ở 9.99.79, TÌM RA BẰNG CÁCH ĐẾM NGƯỢC ──

     Cách tìm: liệt kê mọi tệp trong thư mục làm việc, trừ đi thứ có
     trong git, trừ đi thứ đã có trong danh sách này. Phần còn lại là
     thứ mất là mất hẳn mà chưa ai biết.

     Ra 977 MB, và gần hết là thứ DỰNG LẠI ĐƯỢC — `desktop/dist/`,
     `ban-xem-thu.html`, 157 bản giới thiệu, 19 ảnh chụp màn. Đúng hai
     chỗ không dựng lại được, và cả hai đều nhỏ: */

  { ten: 'giay-phep', thuMuc: true, batBuoc: false,
    vi: 'SỔ GIẤY PHÉP ĐÃ CẤP — số giấy phép · cấp cho ai · cấp lúc nào · ' +
      'dấu truy nguồn. Sinh lại được một giấy phép MỚI, nhưng không sinh lại ' +
      'được BẢN GHI đã cấp: ngày cấp và dấu truy nguồn của tờ cũ thì đã đi ' +
      'theo tờ ấy ra ngoài rồi. Và GITA_KHOA_KHO.txt ở đây là bản khoá thứ hai.' },

  { ten: 'tools/ban-ve.json', batBuoc: false,
    vi: 'BẢN ĐỌC BỘ 13 TỜ A0. Chú giải của .gitignore nói "dựng lại bằng ' +
      'doc-ban-ve.py <PDF>" — nhưng tệp PDF ấy KHÔNG nằm trong kho. Dựng lại ' +
      'được chỉ khi chủ hệ còn giữ PDF gốc, nên trên thực tế 48 KB này cũng ' +
      'là thứ mất là mất hẳn.' }
];

/* ═══════════════ ĐỌC MẬT KHẨU ═══════════════

   Không nhận qua argv. `ps aux` đọc được argv của mọi tiến trình đang
   chạy trên máy, kể cả của người dùng khác trên máy nhiều người, và
   shell còn ghi lại vào lịch sử. Một mật khẩu đi qua argv là một mật
   khẩu đã lộ, chỉ là chưa ai nhặt. */
function docMatKhau() {
  const tuMoiTruong = process.env.GITA_MAT_KHAU_SAO_LUU;
  if (tuMoiTruong) return { mk: tuMoiTruong, nguon: 'biến môi trường' };

  if (!process.stdin.isTTY) {
    throw new Error(
      'Chưa có mật khẩu. Đặt biến môi trường rồi chạy lại:\n\n' +
      '    read -rs GITA_MAT_KHAU_SAO_LUU && export GITA_MAT_KHAU_SAO_LUU\n' +
      '    node tools/sao-luu.js <thư-mục-đích>\n\n' +
      '  `read -rs` không hiện chữ lên màn và không vào lịch sử shell.\n' +
      '  KHÔNG truyền mật khẩu qua tham số dòng lệnh: ps aux đọc được.');
  }

  /* Gõ tay: tắt tiếng vọng để mật khẩu không hiện lên màn — người ngồi
     cạnh đọc được, và ảnh chụp màn hình thì giữ mãi. */
  const fsSync = require('fs');
  process.stdout.write('Mật khẩu sao lưu (không hiện chữ): ');
  const tat = fsSync.openSync('/dev/tty', 'rs');
  let mk = '';
  try {
    const buf = Buffer.alloc(1);
    for (;;) {
      const n = fsSync.readSync(tat, buf, 0, 1, null);
      if (n === 0) break;
      const c = buf.toString('utf8');
      if (c === '\n' || c === '\r') break;
      mk += c;
    }
  } finally { fsSync.closeSync(tat); }
  process.stdout.write('\n');
  return { mk, nguon: 'gõ tay' };
}

/* ═══════════════ CỔNG CHỖ GHI ═══════════════

   CHẶN, không cảnh báo. Một lời cảnh báo thì người ta đọc, thấy hợp lý
   với lần này, rồi vẫn ghi — cùng cái bẫy đã ghi ở cổng ADN (9.99.56).
   Và hậu quả ở đây không sửa lại được: một tệp mang toàn bộ khoá mật
   lọt vào `git add -A` là khoá đã lên GitHub, và GitHub giữ lịch sử. */
function soatChoGhi(dich) {
  const d = path.resolve(dich);
  const trongKho = d === GOC || d.startsWith(GOC + path.sep);
  if (trongKho) {
    throw new Error(
      'KHÔNG ghi bản sao lưu vào trong kho mã: ' + d + '\n\n' +
      '  Tệp sao lưu mang TOÀN BỘ khoá mật. Để nó trong thư mục kho là\n' +
      '  để sẵn cho `git add -A` nuốt vào đúng ngày người ta vội — và\n' +
      '  GitHub thì giữ lịch sử, đẩy nhầm một lần là phải đổi cả bộ khoá\n' +
      '  rồi cấp lại giấy phép cho toàn bộ người đang dùng.\n\n' +
      '  Chọn một chỗ NGOÀI kho, và tốt nhất là ngoài cả máy này:\n' +
      '    node tools/sao-luu.js ~/sao-luu-gita\n' +
      '    node tools/sao-luu.js /media/usb-cua-toi');
  }
  return d;
}

/* ═══════════════ GOM ═══════════════ */
function gom() {
  const tep = {};
  const thieu = [];
  const vang = [];

  for (const p of PHAN) {
    if (p.thuMuc) {
      const thu = path.join(GOC, p.ten);
      if (!fs.existsSync(thu)) {
        (p.batBuoc ? thieu : vang).push(p.ten + '/'); continue;
      }
      /* `duoi` vắng mặt nghĩa là LẤY HẾT — `giay-phep/` có .json · .txt ·
         .gs · .md lẫn nhau, và lọc theo một đuôi thì ba loại kia im lặng
         rơi ra khỏi bản sao lưu. Vắng mặt là không áp dụng, đúng luật ô
         của kho. */
      const duoi = p.duoi;
      const ds = fs.readdirSync(thu, { withFileTypes: true })
        .filter(e => e.isFile())
        .map(e => e.name)
        .filter(t => !duoi || duoi.some(x => t.endsWith(x)))
        .sort();
      if (!ds.length) { (p.batBuoc ? thieu : vang).push(p.ten + '/ (rỗng)'); continue; }
      for (const t of ds) tep[p.ten + '/' + t] = fs.readFileSync(path.join(thu, t), 'utf8');
    } else {
      const f = path.join(GOC, p.ten);
      if (!fs.existsSync(f)) { (p.batBuoc ? thieu : vang).push(p.ten); continue; }
      tep[p.ten] = fs.readFileSync(f, 'utf8');
    }
  }

  /* ── VẮNG MẶT PHẢI NÓI RA ──
     Phần KHÔNG bắt buộc vắng mặt thì vẫn sao lưu được, nhưng im lặng bỏ
     qua nó là dựng đúng cái bẫy tệp này sinh ra để chống: một bản sao
     lưu thiếu trông y hệt một bản đủ, và người ta chỉ biết nó thiếu vào
     đúng ngày phải dùng nó. */
  gom.vang = vang;

  /* Thiếu một phần BẮT BUỘC thì DỪNG, không ghi một bản sao lưu thiếu.
     Một bản sao lưu thiếu trông y hệt một bản đủ — cùng tên, cùng chỗ,
     mở ra vẫn có nội dung — và người ta chỉ biết nó thiếu vào đúng ngày
     phải dùng nó. */
  if (thieu.length) {
    throw new Error(
      'THIẾU PHẦN BẮT BUỘC, không ghi bản sao lưu nào: ' + thieu.join(' · ') + '\n\n' +
      '  Một bản sao lưu thiếu trông y hệt một bản đủ, và người ta chỉ\n' +
      '  biết nó thiếu vào đúng ngày phải dùng nó.');
  }
  return tep;
}

/* ═══════════════ MÃ HOÁ ═══════════════

   Phong bì:  NHAN(8) · ver(1) · muoi(16) · iv(12) · tag(16) · ruột

   GCM chứ không CBC: GCM XÁC THỰC. Một byte bị sửa — đĩa hỏng, sao chép
   dở dang, ai đó nghịch — thì lúc giải mã nó BÁO, chứ không trả về rác
   trông giống dữ liệu. Với một bản sao lưu thì đó là khác biệt giữa
   "biết là hỏng" và "khôi phục một cái kho đã hỏng rồi phát hành nó". */
function maHoa(ruot, mk) {
  const muoi = crypto.randomBytes(16);
  const khoa = crypto.scryptSync(mk, muoi, 32, SCRYPT);
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', khoa, iv);
  const ma = Buffer.concat([c.update(ruot), c.final()]);
  return Buffer.concat([NHAN, Buffer.from([PHIEN_BAN]), muoi, iv, c.getAuthTag(), ma]);
}

function giaiMa(buf, mk) {
  if (buf.length < 53 || !buf.subarray(0, 8).equals(NHAN))
    throw new Error('Không phải tệp sao lưu GITA (thiếu nhãn nhận dạng).');
  const ver = buf[8];
  if (ver !== PHIEN_BAN) throw new Error('Phiên bản tệp sao lưu lạ: ' + ver);
  const muoi = buf.subarray(9, 25);
  const iv = buf.subarray(25, 37);
  const tag = buf.subarray(37, 53);
  const khoa = crypto.scryptSync(mk, muoi, 32, SCRYPT);
  const de = crypto.createDecipheriv('aes-256-gcm', khoa, iv);
  de.setAuthTag(tag);
  return Buffer.concat([de.update(buf.subarray(53)), de.final()]);
}

/* ═══════════════ CHẠY ═══════════════ */
function chay() {
  const dich = process.argv[2];
  if (!dich) {
    console.log('\n  node tools/sao-luu.js <thư-mục-đích>\n');
    console.log('  Sao lưu HAI thứ không có ở chỗ nào khác:');
    PHAN.forEach(p => console.log('    · ' + p.ten + (p.thuMuc ? '/' : '') + ' — ' + p.vi));
    console.log('\n  Mật khẩu đọc từ biến GITA_MAT_KHAU_SAO_LUU, hoặc gõ tay.');
    console.log('  KHÔNG truyền qua tham số: ps aux đọc được argv.\n');
    process.exit(2);
  }

  const thuMucRa = soatChoGhi(dich);
  const tep = gom();
  const { mk, nguon } = docMatKhau();

  if (!mk || mk.length < MAT_KHAU_TOI_THIEU) {
    throw new Error('Mật khẩu phải từ ' + MAT_KHAU_TOI_THIEU + ' ký tự. ' +
      'Bản sao lưu này mang toàn bộ khoá của Học viện — mật khẩu ngắn ở đây ' +
      'là cái khoá cửa duy nhất, và nó đang khoá tất cả.');
  }

  const soTep = Object.keys(tep).length;
  const soByte = Object.values(tep).reduce((a, s) => a + Buffer.byteLength(s, 'utf8'), 0);

  const than = {
    taoLuc: new Date().toISOString(),
    banGita: doiBanGita(),
    commit: docCommit(),
    soTep, soByte,
    tep
  };

  const ro = zlib.gzipSync(Buffer.from(JSON.stringify(than), 'utf8'), { level: 9 });
  const goi = maHoa(ro, mk);

  fs.mkdirSync(thuMucRa, { recursive: true, mode: 0o700 });
  const ten = 'gita-sao-luu-' + new Date().toISOString().slice(0, 19).replace(/[:T]/g, '') + '.gita';
  const duong = path.join(thuMucRa, ten);

  /* 0600: chỉ chủ tệp đọc được. Trên máy nhiều người, mặc định 0644 là
     mọi tài khoản trên máy đọc được tệp mang toàn bộ khoá. */
  fs.writeFileSync(duong, goi, { mode: 0o600 });

  /* ── TỰ KIỂM NGAY ──
     Giải mã lại chính tệp VỪA GHI TỪ ĐĨA (không dùng lại biến trong bộ
     nhớ) rồi đối chiếu từng tệp. Đọc lại từ đĩa mới bắt được lỗi ghi
     dở dang, đĩa đầy, hay quyền ghi hỏng. */
  const doc = fs.readFileSync(duong);
  const lai = JSON.parse(zlib.gunzipSync(giaiMa(doc, mk)).toString('utf8'));
  const lech = [];
  for (const [t, noi] of Object.entries(tep)) {
    if (lai.tep[t] !== noi) lech.push(t);
  }
  for (const t of Object.keys(lai.tep)) if (!(t in tep)) lech.push(t + ' (thừa)');
  if (lech.length) {
    fs.unlinkSync(duong);
    throw new Error('BẢN SAO LƯU KHÔNG KHỚP ở ' + lech.length + ' tệp — đã XOÁ tệp vừa ghi. ' +
      'Lệch: ' + lech.slice(0, 5).join(' · '));
  }

  const bam = crypto.createHash('sha256').update(doc).digest('hex');

  /* Biên nhận KHÔNG chứa bí mật nào — không mật khẩu, không khoá, không
     nội dung. Nó để đối chiếu về sau rằng tệp còn nguyên vẹn. */
  const bienNhan = [
    'GITA 365 — BIÊN NHẬN SAO LƯU',
    '',
    'Tệp      : ' + ten,
    'Tạo lúc  : ' + than.taoLuc,
    'Bản GITA : ' + than.banGita,
    'Commit   : ' + than.commit,
    'Số tệp   : ' + soTep,
    'Cỡ gốc   : ' + Math.round(soByte / 1024) + ' KB',
    'Cỡ tệp   : ' + Math.round(doc.length / 1024) + ' KB',
    'SHA-256  : ' + bam,
    ((gom.vang || []).length ? 'VẮNG MẶT : ' + gom.vang.join(' · ') : 'Đầy đủ   : có cả bốn phần'),
    '',
    'Biên nhận này KHÔNG chứa mật khẩu, khoá, hay nội dung nào.',
    'Kiểm tệp còn nguyên: sha256sum ' + ten,
    'Khôi phục          : node tools/khoi-phuc-kho.js ' + ten + ' <thư-mục-ra>',
    '',
    'MẤT MẬT KHẨU thì tệp này là rác, y như mất khoá. Nên phải có đường',
    'thứ hai, độc lập:  cd may-chu && npx wrangler secret put GITA_KHOA_KHO'
  ].join('\n');
  fs.writeFileSync(duong.replace(/\.gita$/, '.bien-nhan.txt'), bienNhan + '\n', { mode: 0o600 });

  console.log('\n  ✓ ĐÃ SAO LƯU VÀ TỰ KIỂM XONG\n');
  console.log('    tệp     : ' + duong);
  console.log('    gồm     : ' + soTep + ' tệp · ' + Math.round(soByte / 1024) + ' KB gốc → ' +
    Math.round(doc.length / 1024) + ' KB đã nén và mã hoá');
  console.log('    sha256  : ' + bam.slice(0, 32) + '…');
  console.log('    mật khẩu: đọc từ ' + nguon + ' · AES-256-GCM · scrypt N=' + SCRYPT.N);
  console.log('    tự kiểm : giải mã lại từ đĩa, ' + soTep + '/' + soTep + ' tệp khớp từng byte');
  if ((gom.vang || []).length) {
    console.log('');
    console.log('  ⚠ VẮNG MẶT, ĐÃ SAO LƯU MÀ KHÔNG CÓ: ' + gom.vang.join(' · '));
    console.log('    Không chặn — hai phần ấy không bắt buộc. Nhưng nói ra, vì một bản');
    console.log('    sao lưu thiếu trông y hệt một bản đủ, và người ta chỉ biết nó thiếu');
    console.log('    vào đúng ngày phải dùng nó.');
  }
  console.log('');
  console.log('  CÒN MỘT VIỆC NỮA, và nó KHÔNG thay thế được bản sao lưu này:\n');
  console.log('    cd may-chu && npx wrangler secret put GITA_KHOA_KHO\n');
  console.log('  Mất mật khẩu thì tệp vừa ghi là rác. Hai đường độc lập thì mới an toàn:');
  console.log('  tệp này giữ CẢ chú giải; Cloudflare giữ khoá để máy chủ chạy được.\n');
}

function doiBanGita() {
  try {
    const s = fs.readFileSync(path.join(GOC, 'src', 'data.core.js'), 'utf8');
    const m = /version:\s*'([^']+)'/.exec(s);
    return m ? m[1] : '?';
  } catch { return '?'; }
}

function docCommit() {
  try {
    return require('child_process')
      .execSync('git -C ' + JSON.stringify(GOC) + ' rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch { return '(không có git)'; }
}

module.exports = { maHoa, giaiMa, gom, soatChoGhi, NHAN, PHIEN_BAN, SCRYPT, PHAN };

if (require.main === module) {
  try { chay(); }
  catch (e) { console.error('\n  ✗ ' + e.message + '\n'); process.exit(1); }
}
