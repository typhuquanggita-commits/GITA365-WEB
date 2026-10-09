/* ═══════════════════════════════════════════════════════════════
   GITA 365 — ĐO TẢI MÁY CHỦ

       node tools/do-tai-may-chu.js

   CÂU HỎI NÀY ĐÁNG ĐO, KHÔNG ĐÁNG ĐOÁN

   Chủ hệ đặt mức: mười vạn tài khoản phải chạy tốt, và thiết kế theo
   mức đầy là năm mươi vạn. Câu trả lời "chắc là được" hay "chắc là
   không" đều vô dụng như nhau — cái cần là con số, và con số phải đo
   được ở máy này chứ không đợi tới lúc có mười vạn người thật.

   ĐO CÁI GÌ, VÀ VÌ SAO KHÔNG ĐO GIÂY

   Ở máy này, một lượt getValues là một phép sao mảng — vài mi-li-giây,
   và con số ấy KHÔNG nói gì về Sheets thật. Nên bộ đo này không đo
   giây. Nó đếm đúng thứ Sheets tính tiền:

     · SỐ Ô ĐỌC cho một lượt gọi
     · SỐ LƯỢT GỌI API bảng tính
     · SỐ Ô mà mỗi bảng chiếm trong sổ

   Ba con số ấy đo ở máy ra bao nhiêu thì trên máy chủ thật cũng đúng
   bấy nhiêu — chúng là tính chất của MÃ, không phải của máy.

   ĐO THẬT TỚI ĐÂU, SUY RA TỪ ĐÂU

   Dựng năm mươi vạn dòng giả trong bộ nhớ Node là chín triệu ô, gần
   một gigabyte — bộ đo sẽ chết vì hết bộ nhớ trước khi đo xong, mà
   cái chết ấy nói về Node chứ không nói về Sheets.

   Nên: ĐO THẬT ở ba mức nhỏ, chứng minh chi phí đi THẲNG theo số tài
   khoản, rồi mới nhân lên. Chỗ nào là đo, chỗ nào là nhân — bộ đo nói
   rõ từng chỗ, vì một con số suy ra mà trình bày như con số đo được
   là cách nói dối khó cãi nhất.
   ═══════════════════════════════════════════════════════════════ */
const path = require('path');
process.chdir(path.join(__dirname, '..'));
const fs = require('fs');

const gl = require('./gia-lap-apps-script')();
for (const f of gl.dsGs()) eval(fs.readFileSync('server/' + f, 'utf8'));

/* ═══════════════ TRẦN CỨNG CỦA NỀN TẢNG ═══════════════

   Những con số này là của Google, không phải của GITA. Chép vào đây
   kèm nguồn để lần sau không ai phải đi tra lại, và để lúc Google đổi
   thì sửa đúng một chỗ.

   Con số nào là ƯỚC thì khai thẳng là ước. Trộn số chắc với số ước mà
   không đánh dấu là cách làm cho cả bản báo cáo mất giá trị: người đọc
   không biết dòng nào tin được. */
const TRAN = {
  oMotSo: {
    gia: 10000000,
    ten: 'Ô trong MỘT bảng tính',
    nguon: 'Google Sheets — giới hạn cứng 10 triệu ô mỗi bảng tính',
    chac: true
  },
  kyTuMotO: {
    gia: 50000,
    ten: 'Ký tự trong MỘT ô',
    nguon: 'Google Sheets — 50.000 ký tự mỗi ô',
    chac: true
  },
  chayCungLuc: {
    gia: 30,
    ten: 'Lượt chạy ĐỒNG THỜI của một dự án Apps Script',
    nguon: 'Apps Script — 30 lượt chạy đồng thời',
    chac: true
  },
  giayMotLuot: {
    gia: 360,
    ten: 'Giây cho MỘT lượt chạy',
    nguon: 'Apps Script — 6 phút mỗi lượt chạy',
    chac: true
  },
  /* Con số ƯỚC duy nhất trong bảng này, và mọi câu về THỜI GIAN đều
     dựa vào nó. Không đo được ở máy — phải chạy trên máy chủ thật một
     lần rồi sửa lại đúng chỗ này. */
  oMotGiay: {
    gia: 200000,
    ten: 'Ô đọc được trong MỘT giây (ước)',
    nguon: 'ƯỚC LƯỢNG — chưa đo trên máy chủ thật. Xem mục 5.',
    chac: false
  }
};

let loi = 0, canh = 0;
const bao = (ok, ten, ct) => {
  if (!ok) loi++;
  console.log((ok ? '  ✓ ' : '  ✗ ') + ten + (ct ? ' — ' + ct : ''));
};
const noi = (ten, ct) => console.log('  · ' + ten + (ct ? ' — ' + ct : ''));
const canhBao = (ten, ct) => { canh++; console.log('  ⚠ ' + ten + (ct ? ' — ' + ct : '')); };
const so = n => Number(n).toLocaleString('vi-VN');

console.log('\nĐO TẢI MÁY CHỦ GITA 365\n');

/* ═══════════════════════════════════════════════════════════════
   1 · MỖI BẢNG CHIẾM BAO NHIÊU Ô

   Thuần số học từ GITA_BANG: số cột × số dòng. Không cần chạy gì.
   Đây là chỗ trần 10 triệu ô ập vào, và nó ập vào TRƯỚC mọi chuyện
   tốc độ — hết ô thì không ghi thêm được dòng nào nữa, chấm hết.
   ═══════════════════════════════════════════════════════════════ */
console.log('1 · MỘT SỔ CHỨA ĐƯỢC BAO NHIÊU TÀI KHOẢN');

/* Mỗi bảng sinh ra bao nhiêu DÒNG cho một tài khoản. Khai ra đây kèm
   lý do, vì đây là chỗ dễ đoán bừa nhất. */
const DONG_MOI_TK = {
  users:    { dong: 1,   vi: 'mỗi tài khoản một dòng' },
  students: { dong: 0.6, vi: 'chỉ tài khoản phụ huynh/học viên có hồ sơ học viên' },
  sessions: { dong: 4,   vi: 'hai lượt đăng nhập mỗi ngày, giữ hai ngày (GITA_HAN)' },
  hosoApp:  { dong: 1,   vi: 'mỗi người một bản hồ sơ đang dùng' },
  hosoAppSaoLuu: { dong: 10, vi: 'giữ mười bản sao lưu mỗi người (GITA_HAN)' },
  audit:    { dong: 0,   vi: 'chặn bằng TRẦN DÒNG, không theo số tài khoản — tính riêng' },
  dangKyCho:{ dong: 0.1, vi: 'lượt đăng ký bỏ dở còn trong hạn 30 ngày' },
  thanhToan:{ dong: 1.5, vi: 'mỗi lượt nâng tầng một chứng từ' },
  tailieu:  { dong: 0,   vi: 'do Học viện gửi lên, không theo số tài khoản' }
};

let oMotTk = 0;
const keBang = [];
Object.keys(GITA_BANG).forEach(function (b) {
  const cot = GITA_BANG[b].length;
  const d = (DONG_MOI_TK[b] || {dong: 0, vi: 'chưa khai — tính bằng 0'});
  const o = cot * d.dong;
  oMotTk += o;
  keBang.push({bang: b, cot: cot, dong: d.dong, o: o, vi: d.vi});
});
keBang.sort((a, b) => b.o - a.o);
keBang.forEach(x => noi(
  x.bang.padEnd(15) + String(x.cot).padStart(2) + ' cột × ' +
  String(x.dong).padStart(4) + ' dòng = ' + String(Math.round(x.o)).padStart(4) + ' ô/tài khoản',
  x.vi));

/* audit chặn bằng trần dòng nên nó là một hằng số, không nhân theo người. */
const O_AUDIT = GITA_BANG.audit.length * 50000;
noi('audit (trần 50.000 dòng)'.padEnd(15) + ' = ' + so(O_AUDIT) + ' ô, không đổi theo số tài khoản');

const tkVuaSo = Math.floor((TRAN.oMotSo.gia - O_AUDIT) / oMotTk);
console.log('');
noi('mỗi tài khoản chiếm ' + Math.round(oMotTk) + ' ô trong sổ');
bao(tkVuaSo >= 500000,
  'MỘT sổ chứa nổi 500.000 tài khoản (mức đầy chủ hệ đặt)',
  'chứa được ' + so(tkVuaSo) + ' — trần Sheets là ' + so(TRAN.oMotSo.gia) + ' ô/sổ');
bao(tkVuaSo >= 100000,
  'MỘT sổ chứa nổi 100.000 tài khoản (mức phải chạy tốt)',
  'chứa được ' + so(tkVuaSo));

/* ═══════════════════════════════════════════════════════════════
   2 · MỘT LƯỢT GỌI ĐỌC BAO NHIÊU Ô — ĐO THẬT

   Store.doc() đọc CẢ TRANG rồi nhớ lại trong MỘT lần chạy. Nghĩa là
   chi phí một lượt gọi đi thẳng theo số dòng của những bảng nó chạm.

   Đo ở ba mức để chứng minh nó THẲNG, chứ không phải đo một mức rồi
   tin rằng nó thẳng.
   ═══════════════════════════════════════════════════════════════ */
console.log('\n2 · MỘT LƯỢT GỌI CÓ XÁC THỰC ĐỌC BAO NHIÊU Ô');

const cd = caiDatLanDau();
const mkTam = (cd.match(/Mật khẩu tạm: (\S+)/) || [])[1];

/* Thêm dòng THẲNG vào bảng giả, không đi qua luồng đăng ký thật: ở đây
   tôi cần một bảng ĐÔNG DÒNG để đo chi phí đọc, không cần một hồ sơ
   đúng nghiệp vụ. Đi qua luồng thật thì mỗi tài khoản tốn một lượt gửi
   thư và một vòng OTP — mười nghìn tài khoản là mười nghìn vòng, và
   phép đo sẽ đo chính luồng đăng ký thay vì đo chi phí đọc. */
function themDongGia(bang, n, dung) {
  const cot = GITA_BANG[bang];
  const t = gl.trang[bang];
  for (let i = 0; i < n; i++) {
    const ban = dung(i);
    t.push(cot.map(c => (ban[c] === undefined ? '' : ban[c])));
  }
}

/* ── MỘT LƯỢT GỌI PHẢI BẮT ĐẦU BẰNG MỘT LẦN CHẠY MỚI ──

   Store giữ một bộ nhớ đệm `dem` sống trong MỘT lần chạy: chạm bảng
   lần đầu thì đọc cả trang, những lần sau trong cùng lượt lấy lại từ
   bộ nhớ. Trên Apps Script điều đó đúng — mỗi yêu cầu là một lần chạy
   riêng, bộ đệm sinh ra rồi mất theo.

   Ở Node thì lần chạy KHÔNG kết thúc. Bản đầu của bộ đo này gọi thẳng
   kiemTraPhien_ ba lượt liền và đo được 0 ô ở cả ba mức — vì lượt đầu
   đã nạp đủ vào đệm và hai lượt sau không chạm bảng lần nào nữa.

   Số 0 ấy trông như một tin mừng. Nó là một cái thước gãy: nếu tôi tin
   nó thì bản báo cáo này sẽ nói với chủ hệ rằng máy chủ đọc không tốn
   gì, ở đúng cái mục dựng ra để cảnh báo điều ngược lại.

   Nạp lại GITA_Nen.gs là dựng lại Store với đệm rỗng, đúng như Apps
   Script bắt đầu một lượt chạy. Bảng tính giả nằm ngoài, nên dữ liệu
   ở lại — chỉ vòng đời của một lượt chạy được dựng lại. */
const MA_NEN = fs.readFileSync('server/GITA_Nen.gs', 'utf8');

/* VÀ eval PHẢI NẰM Ở PHẠM VI NÀY, KHÔNG BỌC ĐƯỢC TRONG MỘT HÀM.

   Bản thứ hai của tôi gói nó thành `function luotChayMoi(){ eval(MA_NEN); }`
   cho gọn. eval không bật 'use strict' khai biến ra phạm vi ĐANG GỌI —
   tức là vào trong luotChayMoi, rồi mất theo khi hàm trả về. Store ở
   ngoài vẫn là Store cũ với đệm còn ấm, và bộ đo lại ra 0 ô, lần thứ
   hai, vì một lý do khác hẳn lần đầu.

   Nên vòng đo nằm thẳng ở đây, dạng for chứ không dạng forEach: thân
   forEach cũng là một hàm, và cái bẫy sẽ lặp lại y hệt. */

const dn = gitaDangNhap_({u: 'Admin@gita365', mk: mkTam});
if (!dn.ok) { console.error('  ✗ Không đăng nhập được — bộ đo dừng.'); process.exit(1); }

const MUC = [100, 1000, 10000];
const doDuoc = [];
let daCo = 0;
for (const n of MUC) {
  const them = n - daCo;
  themDongGia('users', them, i => ({
    id: 'U-' + (daCo + i), username: 'nguoi' + (daCo + i) + '@gita365.vn',
    hoTen: 'Người thử ' + (daCo + i), email: 'nguoi' + (daCo + i) + '@gita365.vn',
    role: 'R13', portal: 'ph', active: true, createdAt: new Date().toISOString()
  }));
  themDongGia('sessions', them * 4, i => ({
    id: 'S-' + (daCo + i), uid: 'U-' + (daCo + i),
    username: 'nguoi' + (daCo + i) + '@gita365.vn', role: 'R13', portal: 'ph',
    exp: Date.now() + 3600e3, createdAt: new Date().toISOString()
  }));
  themDongGia('students', Math.round(them * 0.6), i => ({
    id: 'HV-' + (daCo + i), hoTen: 'Học viên ' + (daCo + i), tier: 1,
    phuHuynhId: 'U-' + (daCo + i), createdAt: new Date().toISOString()
  }));
  daCo = n;
  eval(MA_NEN);                 /* dựng lại Store với đệm rỗng — một lượt chạy mới */
  gl.demLai();
  kiemTraPhien_(dn.token, '');
  doDuoc.push({tk: n, o: gl.dem.oDoc, goi: gl.dem.goi});
  noi(so(n).padStart(7) + ' tài khoản → một lượt gọi đọc ' + so(gl.dem.oDoc).padStart(9) + ' ô',
    gl.dem.goi + ' lượt gọi API · đọc cả trang ' + gl.dem.docCaTrang + ' lần');
}

/* Có THẲNG không? So ô-trên-mỗi-tài-khoản giữa ba mức. Thẳng thì tỉ
   lệ ấy gần như không đổi, và lúc ấy phép nhân lên mới có cơ sở. */
const tyLe = doDuoc.map(x => x.o / x.tk);
const lech = (Math.max.apply(null, tyLe) - Math.min.apply(null, tyLe)) / Math.max.apply(null, tyLe);
bao(lech < 0.1,
  'chi phí đọc đi THẲNG theo số tài khoản — nên phép nhân lên ở dưới có cơ sở',
  'ô mỗi tài khoản: ' + tyLe.map(x => x.toFixed(1)).join(' · ') +
  ' (lệch ' + Math.round(lech * 100) + '%)');

const oMoiTkMotLuot = tyLe[tyLe.length - 1];

/* ═══════════════════════════════════════════════════════════════
   3 · NHÂN LÊN TỚI MỨC CHỦ HỆ ĐẶT

   Từ đây là SUY RA, không phải đo. Cơ sở là phép đo "thẳng" ở trên.
   ═══════════════════════════════════════════════════════════════ */
console.log('\n3 · SUY RA Ở MỨC 100.000 VÀ 500.000 TÀI KHOẢN  (nhân lên, không phải đo)');

[100000, 500000].forEach(function (n) {
  const o = Math.round(oMoiTkMotLuot * n);
  const giay = o / TRAN.oMotGiay.gia;
  noi(so(n) + ' tài khoản → MỘT lượt gọi đọc ' + so(o) + ' ô',
    'ước ' + giay.toFixed(1) + ' giây, trần một lượt chạy là ' + TRAN.giayMotLuot.gia + ' giây');
});

/* Phép so KHÔNG dựa vào con số ước: một lượt gọi đòi đọc nhiều ô hơn
   sức chứa của cả cuốn sổ thì nó sai bất kể máy chủ nhanh cỡ nào. */
const oMot500k = Math.round(oMoiTkMotLuot * 500000);
bao(oMot500k <= TRAN.oMotSo.gia,
  'ở 500.000 tài khoản, MỘT lượt gọi đọc ít hơn sức chứa của cả cuốn sổ',
  so(oMot500k) + ' ô mỗi lượt gọi, sổ chứa tối đa ' + so(TRAN.oMotSo.gia) + ' ô');

/* Người dùng bỏ đi trước khi máy trả lời. Ba giây là mốc thường dùng
   cho một lượt gọi nền; đặt ở đây để thấy nó tuột từ chỗ nào. */
const GIAY_CHIU_DUOC = 3;
const tkTrongNguong = Math.floor(GIAY_CHIU_DUOC * TRAN.oMotGiay.gia / oMoiTkMotLuot);
bao(tkTrongNguong >= 100000,
  'ở 100.000 tài khoản, một lượt gọi vẫn trả lời trong 3 giây',
  'chỉ giữ được tới khoảng ' + so(tkTrongNguong) + ' tài khoản (dựa trên con số ƯỚC ở mục 5)');

/* Bao nhiêu tài khoản thì một lượt gọi chạm trần 6 phút? */
const tkChamGio = Math.floor(TRAN.giayMotLuot.gia * TRAN.oMotGiay.gia / oMoiTkMotLuot);
noi('một lượt gọi chạm trần 6 phút ở khoảng ' + so(tkChamGio) + ' tài khoản',
  'con số này dựa trên ' + TRAN.oMotGiay.ten.toLowerCase() + ' — ƯỚC, xem mục 5');

/* ═══════════════════════════════════════════════════════════════
   4 · ĐỒNG THỜI — CHỖ TẮC TRƯỚC CẢ CHỖ CHẬM

   Apps Script cho một dự án chạy 30 lượt CÙNG LÚC. Đây là trần cứng,
   không nới được bằng cách viết mã khéo hơn.

   Và từ 9.79 mọi lượt THÊM DÒNG đi qua MỘT khoá ghi chung cho cả dự
   án. Khoá ấy chữa được chuyện ghi đè bản ghi của nhau, nhưng nó xếp
   MỌI lượt ghi vào một hàng — kể cả ghi vào hai bảng chẳng liên quan
   gì tới nhau.
   ═══════════════════════════════════════════════════════════════ */
console.log('\n4 · CHẠY ĐỒNG THỜI');

/* Bao nhiêu người dùng đồng thời thì đụng trần 30 lượt chạy? Giả định
   khai thẳng: 1% số tài khoản đang mở máy vào giờ cao điểm, mỗi người
   một lượt gọi mỗi 20 giây. */
const PHAN_TRAM_CAO_DIEM = 0.01, GIAY_MOI_LUOT = 20;
function luotCungLuc(tk, giayMotLuot) {
  return tk * PHAN_TRAM_CAO_DIEM / GIAY_MOI_LUOT * giayMotLuot;
}
[100000, 500000].forEach(function (n) {
  const giay = oMoiTkMotLuot * n / TRAN.oMotGiay.gia;
  const cung = luotCungLuc(n, giay);
  noi(so(n) + ' tài khoản → khoảng ' + Math.round(cung) + ' lượt chạy đồng thời ở giờ cao điểm',
    'trần là ' + TRAN.chayCungLuc.gia + ' — giả định 1% đang dùng, mỗi người một lượt gọi mỗi 20 giây');
});
bao(luotCungLuc(100000, oMoiTkMotLuot * 100000 / TRAN.oMotGiay.gia) <= TRAN.chayCungLuc.gia,
  'ở 100.000 tài khoản, số lượt chạy đồng thời nằm trong trần 30 của Apps Script',
  'trần 30 là trần CỨNG — không nới được bằng cách viết mã khéo hơn');

/* Khoá ghi chung: đếm xem nó thật sự xếp hàng mọi lượt ghi chưa. */
const truocKhoa = global.GIA_LAP_KHOA.lay;
Store.insert('audit', {id: 'A-DO-TAI', luc: new Date().toISOString(), viec: 'DO_TAI'});
bao(global.GIA_LAP_KHOA.lay === truocKhoa + 1,
  'mọi lượt thêm dòng đi qua khoá ghi — chặn được chuyện hai lượt ghi đè nhau',
  'nhưng khoá là MỘT cho cả dự án: hai bảng không liên quan vẫn phải xếp cùng hàng');

/* ═══════════════════════════════════════════════════════════════
   5 · CHỖ BỘ ĐO NÀY KHÔNG BIẾT

   Một bản báo cáo không khai chỗ mình mù thì người đọc sẽ tin cả
   những dòng đáng lẽ phải nghi.
   ═══════════════════════════════════════════════════════════════ */
console.log('\n5 · CHỖ BỘ ĐO NÀY KHÔNG BIẾT');
Object.keys(TRAN).forEach(function (k) {
  if (TRAN[k].chac) return;
  canhBao(TRAN[k].ten + ' = ' + so(TRAN[k].gia), TRAN[k].nguon);
});
noi('mọi câu về GIÂY ở mục 3 và 4 đều dựa vào con số ước ấy',
  'câu về Ô và về TRẦN 10 TRIỆU Ô thì không — chúng là số học, đúng không cần đo');
noi('bộ đo chạy trên bản giả lập, không chạm Sheets thật',
  'nó đếm ĐÚNG số ô mã nguồn đòi đọc — đó là tính chất của mã, không của máy');

console.log('');
if (loi) {
  console.log('✗ ' + loi + ' chỗ KHÔNG ĐẠT mức chủ hệ đặt · ' + canh + ' chỗ còn phải đo trên máy thật');
  process.exit(1);
}
console.log('✓ đạt mức chủ hệ đặt · ' + canh + ' chỗ còn phải đo trên máy thật');
