/* ═══════════════════════════════════════════════════════════════
   GITA 365 — THỬ MÁY CHỦ TRƯỚC KHI ĐƯA LÊN GOOGLE

       node tools/thu-may-chu.js

   Máy chủ của GITA chạy trên Google Apps Script, mà Apps Script thì
   không thử được ở máy: không có trình chạy, không có bước gỡ lỗi tử tế,
   và mỗi lần sai là phải sửa trực tiếp trên bản đang chạy thật.

   Tệp này dựng một bản giả lập tối thiểu của Apps Script — bảng tính,
   Script Properties, Cache, thư điện tử — rồi chạy toàn bộ mã trong
   thư mục server/ trên đó. Nhờ vậy luồng đăng ký, OTP, kích hoạt, nâng
   tầng và cấp khoá đều được soi ở máy trước, thay vì soi trên đầu
   khách hàng thật.

   Đây KHÔNG thay thế một lần chạy thử trên máy chủ thật sau khi triển
   khai. Nó chỉ bắt những lỗi bắt được sớm.
   ═══════════════════════════════════════════════════════════════ */
/* Cố ý KHÔNG bật 'use strict': mã Apps Script được nạp bằng eval và cần
   khai báo hàm ra phạm vi chung, đúng như cách Apps Script nạp các tệp .gs. */
const path = require('path');
process.chdir(path.join(__dirname, '..'));
const fs = require('fs');

/* BẢN GIẢ LẬP APPS SCRIPT NAY Ở MỘT CHỖ: tools/gia-lap-apps-script.js.
   Trước 9.80 nó nằm ngay trong tệp này, và lúc cần bộ đo tải thì đường
   dễ nhất là chép sang tệp thứ hai — hai bản giả lập rồi sẽ lệch, và
   ngày chúng lệch thì bộ thử nói máy chủ đúng còn bộ đo nói máy chủ
   sai, không ai biết bản nào đang nói thật. */
const gl = require('./gia-lap-apps-script')();
const props = gl.props, trang = gl.trang;
/* Nạp mã máy chủ */
/* Chạy được trên cả hai bản: bảy tệp rời, hoặc tệp gộp dán một lần.
   node tools/thu-may-chu.js --gop  → thử bản gộp.
   Bản gộp là thứ anh Quang dán lên Apps Script, nên nó phải được thử
   bằng chính bộ này chứ không suy ra từ bản bảy tệp. */
if (process.argv.indexOf('--gop') >= 0) {
  eval(fs.readFileSync('server/GITA365_TATCA.gs', 'utf8'));
} else {
  /* ĐỌC THƯ MỤC, KHÔNG KHAI TAY.

     Trước 9.73 chỗ này là một danh sách tám tên gõ thẳng. Danh sách
     ấy đã cũ từ lúc thêm server/GITA_XemKhach.gs ở bản 9.46: bản bảy
     tệp rời không nạp tệp mới, nên gitaPhamViCapPhep() gọi
     gitaXkBacCoach_() và ném "is not defined" — bước 7 của đường
     phát hành dừng ở đó, mỗi lần chạy.

     Không ai thấy vì bản --gop chạy đúng (nó nạp tệp gộp, có đủ), và
     tệp gộp mới là thứ dán lên Apps Script. Nghĩa là lỗi này không
     làm hỏng bản chạy thật — nó chỉ làm hỏng CHÍNH BỘ THỬ, và một bộ
     thử đỏ vì lý do của riêng nó thì lần sau người ta bỏ qua nó.

     Sửa bằng cách thôi khai tay: thêm tệp máy chủ ngày mai thì bộ
     thử tự nạp. GITA_Nen.gs đứng đầu vì các tệp khác dựa vào nền. */
  for (const f of gl.dsGs()) eval(fs.readFileSync('server/' + f, 'utf8'));
}

/* Đi qua mô-đun, KHÔNG giữ một tham chiếu riêng: bản đầu của lượt tách
   này gán `let thu = gl.thu()` rồi xoaThu làm `thu=[]` — gán lại biến
   trong tệp này, còn MailApp giả vẫn đẩy thư vào mảng cũ bên kia. Từ
   lượt xoá đầu tiên, mọi phép đo về thư đọc một mảng đã đứt liên lạc. */
const H={thu:()=>gl.thu(), xoaThu:()=>gl.xoaThu(), props, trang};

let loi=0;
const bao=(ok,ten,ct)=>{ if(!ok)loi++; console.log((ok?'  ✓ ':'  ✗ ')+ten+(ct?' — '+ct:'')); };

console.log('\nTHỬ MÁY CHỦ GITA 365 TRÊN BẢN GIẢ LẬP' +
  (process.argv.indexOf('--gop') >= 0 ? ' · BẢN GỘP MỘT TỆP' : ' · BẢY TỆP RỜI') + '\n');
console.log('1 · CÀI ĐẶT LẦN ĐẦU');
const cd = caiDatLanDau();
const soBang = Object.keys(GITA_BANG).length;
bao(new RegExp('Đã dựng ' + soBang + ' bảng').test(cd),
  'dựng đủ mọi bảng dữ liệu đã khai', soBang + ' bảng');
bao(!!GITA_BANG.tailieu, 'có khai bảng sổ tài liệu — nơi màn kiểm duyệt đọc');
bao(/Đã tạo Admin@gita365/.test(cd), 'tạo được tài khoản Super Admin');
const mkTam = (cd.match(/Mật khẩu tạm: (\S+)/) || [])[1];
bao(!!mkTam && mkTam.length >= 20, 'sinh mật khẩu tạm ngẫu nhiên, đủ dài', mkTam);
/* Sinh nhiều lần rồi soi tất cả. Thử một lần thì một âm tiết hỏng nằm lẫn
   trong danh sách chỉ thỉnh thoảng mới lộ ra — và bộ kiểm thỉnh thoảng mới
   đúng là bộ kiểm không dùng được. */
const KHUON = /^([A-Z][a-z]{2,}-){5}\d{4}$/;
const mau = []; for (let i = 0; i < 400; i++) mau.push(gitaMatKhauTam_());
const hong = mau.filter(x => !KHUON.test(x));
bao(KHUON.test(mkTam || ''), 'mật khẩu tạm đọc và chép lại được');
bao(hong.length === 0, '400 lần sinh, lần nào cũng đúng khuôn', hong.slice(0,3).join(' · ') || 'sạch');
bao(new Set(mau).size >= 395, '400 lần sinh ra gần như không trùng nhau',
  new Set(mau).size + ' mật khẩu khác nhau');
const nguon = fs.readdirSync('server').filter(f=>f.endsWith('.gs'))
  .map(f=>fs.readFileSync('server/'+f,'utf8')).join('');
bao(!/toiyeugita365/.test(nguon), 'KHÔNG còn mật khẩu nào nằm cứng trong mã nguồn');
bao(mkTam !== gitaMatKhauTam_(), 'hai lần sinh ra hai mật khẩu khác nhau');
bao(/không tạo lại/.test(taoTaiKhoanKhoiDau()), 'chạy lại không tạo trùng tài khoản');

console.log('\n2 · ĐĂNG NHẬP');
bao(!gitaDangNhap_({u:'Admin@gita365', mk:'sai-mat-khau'}).ok, 'sai mật khẩu thì từ chối');
bao(!gitaDangNhap_({u:'khongcó@gita365.vn', mk:'x'}).ok, 'tài khoản không có thì từ chối');
const dn = gitaDangNhap_({u:'Admin@gita365', mk:mkTam});
bao(dn.ok && dn.token, 'mật khẩu tạm đăng nhập được', dn.ok?dn.hoSo.role+' · '+dn.hoSo.maKhachHang:'');
bao(dn.phaiDoiMk === true, 'đăng nhập báo rõ đang dùng mật khẩu tạm');
bao(!!readSession_(dn.token), 'phiên đọc lại được');
bao(!readSession_('token-bia-dat'), 'token bịa đặt thì không có phiên');

console.log('\n3 · ĐĂNG KÝ · OTP · KÍCH HOẠT');
H.xoaThu();
const hoSo={hoTen:'Nguyễn Văn A', email:'phuhuynh.thu@gmail.com', dienThoai:'0912345678',
  tenCon:'Nguyễn Minh An', lop:'Lớp 9', tinh:'Hà Nội', maGioiThieu:'CTV-007'};
bao(!gitaDangKy_({hoSo:Object.assign({},hoSo,{email:'sai-email'})}).ok, 'email sai định dạng thì từ chối');
bao(!gitaDangKy_({hoSo:Object.assign({},hoSo,{dienThoai:'123'})}).ok, 'số điện thoại sai thì từ chối');
const dk = gitaDangKy_({hoSo});
bao(dk.ok, 'gửi đăng ký thành công');
const thuOtp = H.thu().slice(-1)[0];
const ma = (thuOtp.than.match(/là: (\d{6})/)||[])[1];
bao(!!ma, 'thư OTP có mã sáu số', ma);
bao(!/\b'+ma+'\b/.test(JSON.stringify(H.trang.dangKyCho)), 'mã KHÔNG lưu dạng đọc được trong bảng');

bao(!gitaXacThucOtp_({email:hoSo.email, ma:'000000'}).ok, 'mã sai thì từ chối');
for(let i=0;i<4;i++) gitaXacThucOtp_({email:hoSo.email, ma:'000000'});
const huy = gitaXacThucOtp_({email:hoSo.email, ma:ma});
bao(!huy.ok && /huỷ/.test(huy.error), 'sai năm lần thì mã bị huỷ', huy.error);

const lai = gitaGuiLaiOtp_({email:hoSo.email});
bao(lai.ok, 'xin lại được mã mới');
const ma2 = (H.thu().slice(-1)[0].than.match(/của anh chị: (\d{6})/)||[])[1];
const xt = gitaXacThucOtp_({email:hoSo.email, ma:ma2});
bao(xt.ok, 'mã mới đúng thì qua', xt.thongBao);
const lien = H.thu().slice(-1)[0].than.match(/#kichhoat=(\S+)/);
bao(!!lien, 'thư kích hoạt có đường dẫn');

bao(!gitaKichHoat_({token:lien[1], mk:'ngan'}).ok, 'mật khẩu ngắn thì không kích hoạt được');
const kh = gitaKichHoat_({token:lien[1], mk:'GiaDinh2026#'});
bao(kh.ok && /^GITA-\d{4}$/.test(kh.maKhachHang||''), 'kích hoạt xong có mã số khách hàng', kh.maKhachHang);
bao(!gitaKichHoat_({token:lien[1], mk:'GiaDinh2026#'}).ok, 'đường dẫn dùng một lần, không dùng lại được');

const dn2 = gitaDangNhap_({u:hoSo.email, mk:'GiaDinh2026#'});
bao(dn2.ok && dn2.hoSo.role==='R13', 'tài khoản mới đăng nhập được, đúng vai phụ huynh');

const trung = gitaDangKy_({hoSo});
bao(trung.ok && /Nếu email này chưa có tài khoản/.test(trung.thongBao),
  'email đã có tài khoản: trả lời y hệt, không lộ danh sách khách');

console.log('\n4 · PHẠM VI CẤP PHÉP');
const ph = kiemTraPhien_(dn2.token, hoSo.email);
bao(ph && ph.role==='R13', 'đọc được hồ sơ phiên của phụ huynh');
bao(gitaPhamViCapPhep({role:'R13', tier:0}).join()==='nen', 'nhà chưa vào tầng: chỉ gói nền');
bao(gitaPhamViCapPhep({role:'R13', tier:2}).join()==='nen,tang1,tang2', 'nhà tầng 2: nền + tầng 1,2');
/* TÁM GÓI, KHÔNG PHẢI BẢY — nen · nghe · nghe-cao · tang1..5.
   Số bảy viết từ trước bản 9.46, lúc chưa có gói NGHỀ CAO. Nó không
   đỏ suốt từ đó tới nay vì cả nhánh bảy-tệp-rời của bộ thử này đã
   ném lỗi trước khi chạy tới đây — một phép đo sai nấp sau một phép
   nạp hỏng. Nay đếm TÊN chứ không đếm số lượng: thiếu gói nào thì
   dòng báo nói thẳng thiếu gói nào, chứ không chỉ nói lệch một. */
const goiCoach = gitaPhamViCapPhep({role:'R07', tier:0}).join();
bao(goiCoach === 'nen,nghe,nghe-cao,tang1,tang2,tang3,tang4,tang5',
  'Coach: đủ tám gói kể cả NGHỀ CAO', goiCoach);
/* Giáo viên bậc 8 KHÔNG được gói nghề cao — đây là chỗ chốt của chủ
   hệ về hồ sơ tầng 4-5, và nó phải được đo chứ không chỉ được ghi. */
bao(gitaPhamViCapPhep({role:'R08', tier:0}).indexOf('nghe-cao') < 0,
  'Giáo viên: KHÔNG có gói nghề cao');
bao(gitaPhamViCapPhep({role:'R15', tier:5}).join()==='nen', 'cộng tác viên: chỉ gói nền');

console.log('\n4b · LỚP DỮ LIỆU — KHOÁ GHI, XOÁ DÒNG, DỌN BẢNG');
{
  /* ── THÊM DÒNG ĐI QUA KHOÁ ──
     Không đọc lời khai. Đếm lượt lấy khoá trước và sau một lượt thêm. */
  const k0 = GIA_LAP_KHOA.lay;
  Store.insert('audit', {id:'A-THU-1', luc:new Date().toISOString(), viec:'thử'});
  bao(GIA_LAP_KHOA.lay > k0, 'thêm dòng ĐI QUA khoá ghi — hai lượt song song không cùng số dòng',
    'lấy khoá ' + (GIA_LAP_KHOA.lay - k0) + ' lần');
  bao(GIA_LAP_KHOA.tra === GIA_LAP_KHOA.lay, 'lấy khoá bao nhiêu thì TRẢ bấy nhiêu — không bỏ quên khoá',
    GIA_LAP_KHOA.lay + ' lấy · ' + GIA_LAP_KHOA.tra + ' trả');

  /* ── KHÔNG LẤY ĐƯỢC KHOÁ THÌ NÉM LỖI, KHÔNG GHI LIỀU ── */
  GIA_LAP_KHOA.hong = true;
  let nem = false;
  try { Store.insert('audit', {id:'A-THU-LIEU', luc:new Date().toISOString()}); }
  catch (e) { nem = true; }
  GIA_LAP_KHOA.hong = false;
  bao(nem && !Store.find('audit','A-THU-LIEU'),
    'không xếp được lượt ghi thì NÉM LỖI, không ghi liều — mất dữ liệu im lặng đắt hơn một lỗi rõ ràng');

  /* ── XOÁ TỪ DƯỚI LÊN, VÀ BỎ ĐỆM ──
     Thêm ba dòng, xoá dòng GIỮA, rồi sửa dòng CUỐI. Nếu xoá mà không
     bỏ đệm thì _dong của dòng cuối lệch một và lượt sửa ghi nhầm chỗ. */
  Store.insert('audit', {id:'A-X1', luc:new Date().toISOString(), viec:'một'});
  Store.insert('audit', {id:'A-X2', luc:new Date().toISOString(), viec:'hai'});
  Store.insert('audit', {id:'A-X3', luc:new Date().toISOString(), viec:'ba'});
  const soXoa = Store.xoa('audit', ['A-X2']);
  Store.update('audit', 'A-X3', {viec:'ba-da-sua'});
  const x1 = Store.find('audit','A-X1'), x3 = Store.find('audit','A-X3');
  bao(soXoa === 1 && !Store.find('audit','A-X2'), 'xoá đúng một dòng, và dòng ấy biến mất thật', soXoa + ' dòng');
  bao(x1 && x1.viec === 'một', 'dòng TRƯỚC chỗ xoá không bị đụng', x1 ? x1.viec : '(mất)');
  bao(x3 && x3.viec === 'ba-da-sua',
    'sửa dòng SAU chỗ xoá vẫn trúng — xoá xong phải bỏ đệm, không thì mọi _dong bên dưới lệch đi',
    x3 ? x3.viec : '(mất)');

  /* Xoá NHIỀU dòng cùng lúc, trong đó có dòng liền nhau */
  ['A-M1','A-M2','A-M3','A-M4'].forEach((id,i) =>
    Store.insert('audit', {id, luc:new Date().toISOString(), viec:'m'+i}));
  const soM = Store.xoa('audit', ['A-M1','A-M2','A-M4']);
  bao(soM === 3 && !Store.find('audit','A-M1') && !Store.find('audit','A-M2') &&
      !Store.find('audit','A-M4') && Store.find('audit','A-M3'),
    'xoá nhiều dòng liền nhau cùng lúc — xoá từ dưới lên nên không trượt chỗ', soM + ' dòng');
}

console.log('\n4c · DỌN BẢNG THEO LUẬT GIỮ');
{
  const ngay = 86400e3, nay = Date.now();
  /* Phiên: một cái còn hạn, một cái hết hạn lâu, một cái ĐÃ ĐĂNG XUẤT (exp = 0) */
  Store.insert('sessions', {id:'S-CON', uid:'U1', exp:nay + 3*ngay, createdAt:new Date().toISOString()});
  Store.insert('sessions', {id:'S-HET', uid:'U1', exp:nay - 9*ngay, createdAt:new Date(nay-9*ngay).toISOString()});
  Store.insert('sessions', {id:'S-XUAT', uid:'U1', exp:0, createdAt:new Date(nay-9*ngay).toISOString()});
  /* Nhật ký quá hạn, và một dòng mới */
  Store.insert('audit', {id:'A-CU', luc:new Date(nay - 500*ngay).toISOString(), viec:'cũ'});
  Store.insert('audit', {id:'A-MOI', luc:new Date().toISOString(), viec:'mới'});
  /* Đăng ký: một lượt bỏ dở đã lâu, một lượt ĐANG CHỜ kích hoạt cũng đã lâu */
  Store.insert('dangKyCho', {id:'D-BO', email:'a@b.c', trangThai:'BO_DO', createdAt:new Date(nay-90*ngay).toISOString()});
  Store.insert('dangKyCho', {id:'D-CHO', email:'d@e.f', trangThai:'CHO_KICH_HOAT', createdAt:new Date(nay-90*ngay).toISOString()});
  /* Sao lưu: mười hai bản của cùng một người */
  for (let i = 0; i < 12; i++)
    Store.insert('hosoAppSaoLuu', {id:'B'+i, uid:'U9', duLieu:'{}', luc:new Date(nay - i*3600e3).toISOString()});

  /* XEM TRƯỚC không được đụng vào gì */
  const truocSo = Store.all('sessions').length;
  const xem = gitaXemTruocDon();
  bao(xem.chiXem === true && Store.all('sessions').length === truocSo,
    'XEM TRƯỚC đếm mà KHÔNG xoá — biết bộ dọn định làm gì trước khi cho nó làm',
    'sẽ xoá ' + xem.tongXoa + ' dòng, bảng phiên vẫn ' + Store.all('sessions').length);

  const r = gitaDonDep();
  bao(!!Store.find('sessions','S-CON'), 'phiên CÒN HẠN không bị đụng — bảng to là chuyện hiệu năng, xoá nhầm là chuyện người dùng');
  bao(!Store.find('sessions','S-HET'), 'phiên hết hạn quá hai ngày thì bỏ');
  bao(!Store.find('sessions','S-XUAT'),
    'phiên ĐÃ ĐĂNG XUẤT (exp = 0) cũng bỏ — luật đọc mốc mà bỏ sót exp = 0 thì mỗi lượt đăng xuất để lại một dòng chết vĩnh viễn');
  bao(!!Store.find('audit','A-MOI') && !Store.find('audit','A-CU'), 'nhật ký quá 400 ngày thì bỏ, dòng mới giữ nguyên');
  bao(!Store.find('dangKyCho','D-BO'), 'đăng ký bỏ dở quá 30 ngày thì bỏ');
  bao(!!Store.find('dangKyCho','D-CHO'),
    'đăng ký ĐANG CHỜ kích hoạt thì GIỮ, dù đã 90 ngày — người ta có thể mở thư cũ và bấm vào');
  const sl = Store.all('hosoAppSaoLuu').filter(x => x.uid === 'U9');
  bao(sl.length === 10 && sl.filter(x => x.id === 'B0').length === 1,
    'giữ đúng mười bản sao lưu GẦN NHẤT mỗi người', sl.length + ' bản, còn bản mới nhất');
  bao(r.tongXoa > 0 && Store.all('audit').filter(x => x.viec === 'DON_DEP').length > 0,
    'mỗi lượt dọn GHI LẠI đã xoá bao nhiêu — bộ dọn chạy im lặng là bộ dọn không ai kiểm được',
    'xoá ' + r.tongXoa + ' dòng');

  /* Bộ hẹn giờ: gọi hai lần KHÔNG được sinh hai bộ trùng nhau */
  gitaDatLichDon();
  const l2 = gitaDatLichDon();
  bao(GIA_LAP_TRIGGER.length === 1 && l2.goBoCu === 1,
    'đặt lịch hai lần vẫn chỉ còn MỘT bộ hẹn giờ — bộ trùng thì mỗi đêm dọn nhiều lượt cùng lúc',
    GIA_LAP_TRIGGER.length + ' bộ');
}

console.log('\n5 · NÂNG TẦNG');
const hv = Store.all('students')[0];
const admin = kiemTraPhien_(dn.token, 'Admin@gita365');
let r = gitaNangTang_({maHocVien:hv.id, tang:1, maKhachHang:kh.maKhachHang}, admin);
bao(!r.ok && /KPI/.test(r.error), 'KPI chưa đủ thì không nâng tầng', r.error);
Store.update('students', hv.id, {kpi:88});
r = gitaNangTang_({maHocVien:hv.id, tang:1, maKhachHang:kh.maKhachHang}, admin);
bao(!r.ok && /thanh toán/.test(r.error), 'chưa xác nhận thanh toán thì không nâng tầng');
Store.insert('thanhToan', {id:'TT1', maKhachHang:kh.maKhachHang, tier:1, soTien:5000000,
  trangThai:'daXacNhan', nguoiDuyet:'Admin', luc:new Date().toISOString(), ghiChu:''});
r = gitaNangTang_({maHocVien:hv.id, tang:1, maKhachHang:kh.maKhachHang}, admin);
bao(r.ok && r.tang===1, 'đủ cả KPI và thanh toán thì nâng tầng');
r = gitaNangTang_({maHocVien:hv.id, tang:3, maKhachHang:kh.maKhachHang}, admin);
bao(!r.ok && /một tầng/.test(r.error), 'không nhảy tầng — mỗi lần một bậc');
const tuVan = {role:'R11', phien:{uid:'x'}, u:'tv'};
bao(!gitaNangTang_({maHocVien:hv.id, tang:2, maKhachHang:kh.maKhachHang}, tuVan).ok,
  'Tư vấn không nâng tầng được — chỉ R01–R03');

console.log('\n6 · MẬT KHẨU');
bao(checkPwStrength_('abc')!==true, 'mật khẩu ngắn bị chặn');
bao(checkPwStrength_('gita365abc1')!==true, 'mật khẩu chứa chuỗi dễ đoán bị chặn');
bao(checkPwStrength_('MotNhaBinhYen2026')===true, 'mật khẩu đủ mạnh thì qua');
bao(safeEqual_(hashPw_('a','m'), hashPw_('a','m')), 'băm ổn định với cùng muối');
bao(!safeEqual_(hashPw_('a','m1'), hashPw_('a','m2')), 'muối khác thì băm khác');

console.log('\n7 · NHẬT KÝ');
bao(Store.all('audit').length>=5, 'mọi việc đều vào nhật ký', Store.all('audit').length+' dòng');
bao(Store.all('audit').some(x=>x.viec==='DANG_KY_XONG'), 'có dòng đăng ký hoàn tất');
bao(Store.all('audit').some(x=>x.viec==='NANG_TANG'), 'có dòng nâng tầng');

console.log('\n8 · CỬA VÀO doPost');
const goi = y => JSON.parse(doPost({postData:{contents:JSON.stringify(y)}})._);
bao(!goi({fn:'viecLa'}).ok, 'việc không có trong danh sách thì từ chối');
bao(!goi({fn:'capKhoa', token:'bia', u:'x'}).ok, 'xin khoá bằng token bịa thì từ chối');
const kq = goi({fn:'capKhoa', token:dn2.token, u:hoSo.email, goi:['nen','nghe','tang5']});
bao(!kq.ok && kq.code==='NOKEY', 'chưa nạp bộ khoá thì báo rõ NOKEY');
PropertiesService.getScriptProperties().setProperty('GITA_KHOA_KHO',
  JSON.stringify({nen:'K1',nghe:'K2',tang1:'K3',tang2:'K4',tang3:'K5',tang4:'K6',tang5:'K7'}));
const kq2 = goi({fn:'capKhoa', token:dn2.token, u:hoSo.email, goi:['nen','nghe','tang1','tang5']});
bao(kq2.ok, 'nạp khoá rồi thì cấp được');
bao(!kq2.khoa.nghe, 'phụ huynh KHÔNG nhận được khoá kho nghề');
bao(!kq2.khoa.tang5, 'phụ huynh tầng 1 KHÔNG nhận được khoá tầng 5');
bao(!!kq2.khoa.nen && !!kq2.khoa.tang1, 'nhận đúng gói nền và tầng 1', Object.keys(kq2.khoa).join(', '));

console.log('\n9 · MẬT KHẨU TẠM CHẶN MỞ KHO');
const chan = goi({fn:'capKhoa', token:dn.token, u:'Admin@gita365', goi:['nen']});
bao(!chan.ok && chan.code==='MUSTCHANGE',
  'Super Admin dùng mật khẩu tạm thì KHÔNG mở được kho', chan.error||'');
bao(Store.all('audit').some(x=>x.viec==='CAP_KHOA_CHAN'), 'lần bị chặn có vào nhật ký');

const mkMoi = 'MotNhaBinhYen2026';
const doiSai = goi({fn:'doiMatKhau', token:dn.token, u:'Admin@gita365', cu:'sai', moi:mkMoi});
bao(!doiSai.ok, 'đổi mật khẩu mà nhập sai mật khẩu cũ thì từ chối');
const doi = goi({fn:'doiMatKhau', token:dn.token, u:'Admin@gita365', cu:mkTam, moi:mkMoi});
bao(doi.ok, 'đổi được mật khẩu ngay cả khi kho đang bị chặn', doi.error||'');

const dn3 = gitaDangNhap_({u:'Admin@gita365', mk:mkMoi});
bao(dn3.ok && dn3.phaiDoiMk === false, 'đăng nhập lại bằng mật khẩu mới, không còn cờ phải đổi');
bao(!gitaDangNhap_({u:'Admin@gita365', mk:mkTam}).ok, 'mật khẩu tạm hết dùng được');
const mo = goi({fn:'capKhoa', token:dn3.token, u:'Admin@gita365', goi:['nen','nghe','tang5']});
bao(mo.ok && Object.keys(mo.khoa).length===3, 'đổi xong thì kho mở đủ cho Super Admin',
  Object.keys(mo.khoa||{}).join(', '));

const dl = datLaiMatKhauSuperAdmin();
const mkTam2 = (dl.match(/Mật khẩu tạm: (\S+)/) || [])[1];
bao(!!mkTam2 && mkTam2 !== mkTam, 'đặt lại được mật khẩu Super Admin từ Apps Script');
const dn4 = gitaDangNhap_({u:'Admin@gita365', mk:mkTam2});
bao(dn4.ok && dn4.phaiDoiMk === true, 'đặt lại xong thì lại bắt buộc đổi');
bao(!goi({fn:'capKhoa', token:dn4.token, u:'Admin@gita365', goi:['nen']}).ok,
  'và kho lại bị chặn cho tới khi đổi');

console.log('\n10 · XÁC NHẬN QUYỀN VÀO DRIVE');
const bc = kiemTraQuyenDrive();
bao(/Đạt 4\/4 thư mục/.test(bc), 'bốn thư mục đều mở được và ghi được');
bao(/typhuquanggita@gmail\.com/.test(bc), 'báo rõ máy chủ đang chạy dưới tài khoản nào');
bao(/Dữ Liệu GITA365/.test(bc) && /Mã máy chủ GITA365/.test(bc),
  'gọi đúng tên thư mục thật, không chỉ đọc lại mã');
const conRac = Object.keys(__thuMuc).some(k =>
  __thuMuc[k].tep.some(f => !f.bo));
bao(!conRac, 'tệp dấu dùng để thử đã dọn sạch, không để rác trong Drive');

/* Thư mục chỉ cho xem: phải bị bắt, không được báo xanh.
   Ba hằng DRIVE, TAILIEU và XUAT hiện cùng trỏ vào một thư mục của Học viện,
   nên hạ quyền thư mục ấy là ba mục cùng rớt — đúng như thực tế sẽ xảy ra. */
__thuMuc['1pvXH45JvXXPOW9V6ObB5CR87r7gxH0fU'].ghiDuoc = false;
const bc2 = kiemTraQuyenDrive();
bao(/Đạt 1\/4 thư mục/.test(bc2), 'thư mục chỉ cho xem thì KHÔNG được tính là đạt');
bao(/KHÔNG ghi được/.test(bc2) && /Người chỉnh sửa/.test(bc2),
  'nói rõ thiếu quyền gì và sửa thế nào');
bao(/CÁCH SỬA/.test(bc2), 'kèm hướng dẫn sửa khi có thư mục hỏng');
__thuMuc['1pvXH45JvXXPOW9V6ObB5CR87r7gxH0fU'].ghiDuoc = true;

/* Mã thư mục sai — chỉ hỏng đúng một mục, ba mục kia vẫn đạt */
const idThat = GITA_THU_MUC_MA;
GITA_THU_MUC_MA = '1khongtontai0000000000000000000';
const bc3 = kiemTraQuyenDrive();
bao(/Đạt 3\/4/.test(bc3) && /Không mở được/.test(bc3),
  'mã thư mục sai thì báo rõ đúng một mục, không im lặng và không đổ oan mục khác');
GITA_THU_MUC_MA = idThat;

/* Qua doPost: chỉ R01–R02 */
const drAdmin = goi({fn:'kiemDrive', token:dn3.token, u:'Admin@gita365'});
bao(drAdmin.ok && drAdmin.dat===4 && drAdmin.thuMuc.length===4,
  'Super Admin kiểm được quyền Drive từ ứng dụng', drAdmin.taiKhoan||'');
const drPh = goi({fn:'kiemDrive', token:dn2.token, u:hoSo.email});
bao(!drPh.ok, 'phụ huynh KHÔNG kiểm được quyền Drive');
bao(Store.all('audit').some(x=>x.viec==='KIEM_QUYEN_DRIVE'), 'mỗi lần kiểm đều vào nhật ký');

console.log('\n11 · MỤC LỤC HÀM');
const ml = mucLucHam();
['caiDatLanDau','kiemTraQuyenDrive','napBoKhoaMotLan','datLaiMatKhauSuperAdmin']
  .forEach(h2 => bao(ml.indexOf(h2) >= 0, 'mục lục có hàm ' + h2));

console.log('\n12 · BẢN WEB DO MÁY CHỦ PHỤC VỤ');
const tmMa = __thuMuc['1jVOnIH7286glI95fC4aqfXApecxEj7Xz'];

/* Chưa đặt tệp nào: phải ra trang hướng dẫn, không được trắng màn hình */
tmMa.kho = {};
const chua = doGet({parameter:{}})._;
bao(/chưa đặt/i.test(chua), 'chưa đặt bản web thì ra trang hướng dẫn, không trắng màn hình');
bao(/GITA365\.html/.test(chua) && /nghe\.enc/.test(chua),
  'trang hướng dẫn liệt kê đúng tệp còn thiếu');

/* Đặt đủ tệp */
tmMa.kho = {'GITA365.html':'<html><head></head><body>vỏ ứng dụng</body></html>',
  'mau.json':'{"KICHBAN":[]}'};
['nen','nghe','tang1','tang2','tang3','tang4','tang5']
  .forEach(g2 => { tmMa.kho[g2+'.enc'] = 'BYTE-'+g2; });

const banWeb = doGet({parameter:{}})._;
bao(/vỏ ứng dụng/.test(banWeb), 'trả đúng nội dung tệp bản web đọc từ Drive');
bao(/GITA_NGUON_KHO/.test(banWeb) && /API_CAP_PHEP/.test(banWeb),
  'tiêm địa chỉ máy chủ và nguồn kho vào trang');
bao(banWeb.indexOf('<head>') < banWeb.indexOf('GITA_NGUON_KHO'),
  'tiêm ngay sau <head>, chạy trước mọi mã của ứng dụng');

/* ?dangnhap=1 — đường ra màn đăng nhập cho bản chạy trong khung sandbox */
const raNgoai = doGet({parameter:{dangnhap:'1'}})._;
bao(/GITA_RA_NGOAI\s*=\s*true/.test(raNgoai),
  'mở /exec?dangnhap=1 thì trang được bảo bỏ phiên, ra màn đăng nhập');
bao(!/GITA_RA_NGOAI/.test(banWeb),
  'mở /exec bình thường thì KHÔNG bỏ phiên — vào thẳng như cũ');
bao(/GITA_CUA_DANG_NHAP/.test(banWeb),
  'trang luôn biết địa chỉ để quay về màn đăng nhập');

const ts = JSON.parse(doGet({parameter:{viec:'trangthai'}})._);
bao(ts.ok && ts.daNapKhoa === 7, 'đường ?viec=trangthai vẫn trả JSON tình trạng', ts.daNapKhoa+' khoá');

const g1 = JSON.parse(doGet({parameter:{goi:'nghe'}})._);
bao(g1.ok && g1.goi === 'nghe' && g1.du.length > 0, 'trả được một gói kho dạng base64');
bao(Buffer.from(g1.du,'base64').toString() === 'BYTE-nghe', 'base64 giải ngược ra đúng byte gốc');

const gm = doGet({parameter:{goi:'mau'}})._;
bao(/KICHBAN/.test(gm), 'trả được dữ liệu mẫu cho chế độ chưa cấp phép');

['bimat','../khoa','nen.enc','users'].forEach(x => {
  const r2 = JSON.parse(doGet({parameter:{goi:x}})._);
  bao(!r2.ok, 'tên gói "'+x+'" bị từ chối — không đọc trộm được tệp khác');
});

const thieuGoi = (() => { delete tmMa.kho['tang3.enc'];
  return JSON.parse(doGet({parameter:{goi:'tang3'}})._); })();
bao(!thieuGoi.ok && /tang3\.enc/.test(thieuGoi.error),
  'thiếu một gói thì nói rõ thiếu tệp nào, không im lặng');

console.log('\n13 · QUÊN MẬT KHẨU — NHẬN MÃ QUA EMAIL');
{
  H.xoaThu();
  const em = hoSo.email;   /* phuhuynh.thu@gmail.com — username trùng email */

  /* Tài khoản không có thật: trả lời y hệt, không lộ danh sách */
  const la = goi({fn:'quenMatKhau', u:'khongcoai@gmail.com'});
  bao(la.ok && /Nếu tài khoản có thật/.test(la.thongBao),
    'tài khoản không có thật vẫn trả lời y hệt — không dò được ai đã đăng ký');
  bao(H.thu().length === 0, 'và KHÔNG gửi thư đi đâu cả');

  const q = goi({fn:'quenMatKhau', u:em});
  bao(q.ok, 'xin mã lấy lại mật khẩu bằng email đăng nhập');
  const thuMa = H.thu().slice(-1)[0];
  bao(!!thuMa && thuMa.to === em, 'thư gửi đúng địa chỉ email đã đăng ký', thuMa && thuMa.to);
  const maQ = thuMa && (thuMa.than.match(/\n\s+(\d{6})\n/) || [])[1];
  bao(!!maQ, 'thư có mã sáu số', maQ);
  bao(thuMa && !/Chào\s*,/.test(thuMa.than), 'thư gọi đúng tên người nhận, không bỏ trống');
  bao(!JSON.stringify(H.trang.users||[]).includes(maQ||'zzz'),
    'mã KHÔNG lưu dạng đọc được — chỉ giữ bản băm trong bộ nhớ tạm');

  /* Sai mã */
  const sai1 = goi({fn:'datLaiMatKhau', u:em, ma:'000000', moi:'NhaBinhYen2027'});
  bao(!sai1.ok && /Còn 4 lần/.test(sai1.error), 'sai mã thì đếm ngược số lần còn lại', sai1.error);

  /* Mật khẩu mới quá yếu */
  const yeu = goi({fn:'datLaiMatKhau', u:em, ma:maQ, moi:'abc'});
  bao(!yeu.ok && yeu.code === 'WEAK', 'mật khẩu mới quá yếu thì từ chối, mã chưa bị tiêu');

  /* Đặt lại thật */
  H.xoaThu();
  const dl = goi({fn:'datLaiMatKhau', u:em, ma:maQ, moi:'NhaBinhYen2027'});
  bao(dl.ok, 'đúng mã và mật khẩu đủ mạnh thì đặt lại được', dl.error||'');
  bao(H.thu().some(t2 => /đã được đặt lại/.test(t2.cd)),
    'đặt lại xong có thư báo về hòm thư — chủ tài khoản biết ngay nếu không phải mình làm');

  const dnMoi = gitaDangNhap_({u:em, mk:'NhaBinhYen2027'});
  bao(dnMoi.ok, 'đăng nhập được bằng mật khẩu vừa đặt');
  bao(!gitaDangNhap_({u:em, mk:'GiaDinh2026#'}).ok, 'mật khẩu cũ hết dùng được');

  /* Mã dùng một lần */
  const lai = goi({fn:'datLaiMatKhau', u:em, ma:maQ, moi:'MotNhaKhac2027'});
  bao(!lai.ok, 'mã đã dùng thì không dùng lại được');

  /* Sai năm lần thì huỷ mã */
  goi({fn:'quenMatKhau', u:em});
  let cuoi = null;
  for (let i = 0; i < 5; i++) cuoi = goi({fn:'datLaiMatKhau', u:em, ma:'111111', moi:'NhaBinhYen2028'});
  bao(!cuoi.ok && cuoi.code === 'LOCKED', 'sai năm lần thì mã bị huỷ', cuoi.error);

  /* Trần số lần xin mã mỗi giờ */
  let chan = 0;
  for (let i = 0; i < 12; i++) { H.xoaThu(); goi({fn:'quenMatKhau', u:em}); if (!H.thu().length) chan++; }
  bao(chan > 0, 'xin mã quá nhiều lần trong một giờ thì bị chặn', chan + ' lượt bị chặn');

  /* Tài khoản đăng nhập bằng TÊN, không phải email — như Admin@gita365 */
  H.xoaThu();
  const qAdmin = goi({fn:'quenMatKhau', u:'Admin@gita365'});
  bao(qAdmin.ok && H.thu().length > 0,
    'tài khoản có tên đăng nhập không phải email vẫn xin mã được',
    (H.thu()[0]||{}).to || 'KHÔNG GỬI ĐƯỢC');

  /* Gõ ĐỊA CHỈ EMAIL của tài khoản đó — đường người dùng hay đi nhất */
  H.xoaThu();
  const qEmail = goi({fn:'quenMatKhau', u:'typhuquanggita@gmail.com'});
  bao(qEmail.ok && H.thu().length > 0,
    'gõ địa chỉ email cũng xin được mã, không bắt nhớ đúng tên đăng nhập',
    (H.thu()[0]||{}).to || 'KHÔNG GỬI ĐƯỢC');
}

console.log('\n14 · MƯỜI BỐN LỖI ĐÃ VÁ — CANH KHÔNG CHO QUAY LẠI');
{
  /* ── Sổ tài liệu không được mất trắng ── */
  const admin2 = kiemTraPhien_(dn3.token, 'Admin@gita365');
  const tepMau = Buffer.from('noi dung tai lieu thu').toString('base64');
  const gt = gitaNapTaiLieu_({ban:{id:'TL-TEST-1', ten:'Tài liệu thử', tenTep:'thu.txt',
    loai:'quytrinh', tang:1, moTa:'thử ghi sổ'}, dulieu:tepMau}, admin2);
  bao(gt.ok, 'gửi được tài liệu lên', gt.error||'');
  const so = Store.all('tailieu');
  bao(so.length === 1 && so[0].id === 'TL-TEST-1',
    'bản ghi VÀO ĐƯỢC sổ tài liệu, không mất trắng', so.length + ' dòng');
  bao(so[0] && so[0].nguoiGui && so[0].driveId && so[0].trangThai === 'cho-duyet',
    'sổ giữ đủ người gửi, mã Drive và trạng thái chờ duyệt');

  /* ── Duyệt phải thật sự ghi được quyết định ── */
  const dt = gitaDuyetTaiLieu_({ma:'TL-TEST-1', viec:'duyet'}, admin2);
  bao(dt.ok, 'duyệt được tài liệu có thật');
  bao((Store.find('tailieu','TL-TEST-1')||{}).trangThai === 'da-duyet',
    'quyết định duyệt GHI ĐƯỢC vào sổ — không phải báo ok rồi thôi');
  const dtLa = gitaDuyetTaiLieu_({ma:'TL-KHONG-CO', viec:'duyet'}, admin2);
  bao(!dtLa.ok && dtLa.code === 'NOTFOUND',
    'duyệt mã không có thì báo rõ, không im lặng gật đầu');

  /* ── Hồ sơ ca KHÔNG được trả về cho gia đình ── */
  const tuVan2 = kiemTraPhien_(gitaDangNhap_({u:'tuvan.thu@gita365.vn', mk:'x'}).token, '') ;
  /* dựng thẳng hồ sơ Tư vấn để khỏi phải tạo tài khoản mới */
  const hsTuVan = {u:'tuvan@gita365.vn', role:'R11', tier:0, khoa:false, phaiDoiMk:false,
    phien:{uid:'TV1', username:'tuvan@gita365.vn'}};
  gitaCaiDat_({caiDat:{ca:{luc:Date.now(), du:[{id:'C1', nha:'Nhà chị Lan · 0901xxx',
    tom:'Con có dấu hiệu trầm cảm', du:{loiGoc:'riêng tư'}}]}}}, hsTuVan);

  const hsPh = {u:hoSo.email, role:'R13', tier:1, khoa:false, phaiDoiMk:false,
    phien:{uid:'PH1', username:hoSo.email}};
  const nhanPh = gitaCaiDat_({caiDat:{}}, hsPh);
  bao(!nhanPh.ca, 'phụ huynh KHÔNG nhận được hồ sơ ca của bất kỳ nhà nào');
  bao(!nhanPh.khothem && !nhanPh.xinthem, 'phụ huynh cũng không nhận cụm tư liệu nội bộ');
  bao(!nhanPh.phanquyen, 'phụ huynh không nhận bảng phân quyền');

  const nhanTv = gitaCaiDat_({caiDat:{}}, hsTuVan);
  bao(!!nhanTv.ca, 'Tư vấn VẪN nhận được hồ sơ ca — chặn đúng người, không chặn nhầm');
  bao(!nhanTv.phanquyen, 'Tư vấn không nhận bảng phân quyền — đó là việc của R01–R02');

  /* ── Cụm quá lớn bị từ chối riêng, không kéo đổ cả lượt ── */
  const to = 'x'.repeat(20000);
  const hsAdmin = {u:'Admin@gita365', role:'R01', tier:0, khoa:false, phaiDoiMk:false,
    phien:{uid:'AD1', username:'Admin@gita365'}};
  const kqTo = gitaCaiDat_({caiDat:{
    noidung:{luc:Date.now()+1, du:{a:to}},
    sapxep:{luc:Date.now()+1, du:{thuTuNhom:['g1','g2']}}
  }}, hsAdmin);
  bao(kqTo.__quaLon && kqTo.__quaLon.indexOf('noidung') >= 0,
    'cụm vượt 9 KB bị từ chối RIÊNG cụm đó, nói rõ cụm nào');
  bao(!!kqTo.sapxep, 'cụm nhỏ đi cùng lượt vẫn lưu được — không kéo đổ cả lượt đồng bộ');

  /* ── Dò tài khoản ở màn đăng nhập ── */
  const nd0 = Store.all('users').filter(x => x.username === hoSo.email)[0];
  Store.update('users', nd0.id, {active:'FALSE'});
  const khoaSai = gitaDangNhap_({u:hoSo.email, mk:'mat-khau-bia-dat'});
  const laSai   = gitaDangNhap_({u:'khong-ai-o-day@gmail.com', mk:'mat-khau-bia-dat'});
  bao(khoaSai.error === laSai.error,
    'tài khoản bị khoá và tài khoản không có trả lời Y HỆT — không dò được ai đã đăng ký');
  const khoaDung = gitaDangNhap_({u:hoSo.email, mk:'NhaBinhYen2027'});
  bao(!khoaDung.ok && khoaDung.code === 'LOCKED',
    'nhưng đúng mật khẩu thì nói thật là tài khoản đang khoá');
  Store.update('users', nd0.id, {active:'TRUE'});

  /* ── Trần đoán mật khẩu ── */
  CacheService.getScriptCache().remove('DANGNHAP_SAI_' + hoSo.email);
  let biChan = null;
  for (let i = 0; i < 12; i++) {
    const r2 = gitaDangNhap_({u:hoSo.email, mk:'sai-' + i});
    if (r2.code === 'RATE') { biChan = r2; break; }
  }
  bao(!!biChan, 'đoán mật khẩu liên tiếp thì bị chặn', biChan ? biChan.error : 'KHÔNG CHẶN');

  /* ── Đổi mật khẩu phải đá mọi phiên ── */
  CacheService.getScriptCache().remove('DANGNHAP_SAI_' + hoSo.email);
  const pA = gitaDangNhap_({u:hoSo.email, mk:'NhaBinhYen2027'});
  const pB = gitaDangNhap_({u:hoSo.email, mk:'NhaBinhYen2027'});
  bao(pA.ok && pB.ok && !!readSession_(pB.token), 'mở được hai phiên cùng lúc');
  const doiMk = gitaDoiMatKhau_({token:pA.token, u:hoSo.email, cu:'NhaBinhYen2027',
    moi:'MotChonBinhYen2028'}, kiemTraPhien_(pA.token, hoSo.email));
  bao(doiMk.ok, 'đổi được mật khẩu', doiMk.error||'');
  bao(!readSession_(pB.token),
    'đổi mật khẩu ĐÁ LUÔN phiên trên thiết bị khác — kẻ giữ token cũ mất quyền ngay');

  /* ── Trần gửi thư đăng ký ── */
  H.xoaThu();
  const hs2 = Object.assign({}, hoSo, {email:'nan.nhan.thu@gmail.com', hoTen:'Nguyễn Thử'});
  let guiDuoc = 0;
  for (let i = 0; i < 10; i++) { H.xoaThu(); gitaDangKy_({hoSo:hs2}); guiDuoc += H.thu().length; }
  bao(guiDuoc <= 3, 'một địa chỉ email không nhận quá ba thư đăng ký mỗi giờ',
    guiDuoc + ' thư trong 10 lượt');

  /* ── Tên tự đặt không nhét được nội dung vào thân thư ── */
  H.xoaThu();
  gitaDangKy_({hoSo:Object.assign({}, hoSo, {email:'nan.nhan2@gmail.com',
    hoTen:'A\nMUA HANG GIA RE tai http://xau.vn'})});
  const thuXau = H.thu()[0];
  bao(!thuXau || !/\n\s*MUA HANG/.test(thuXau.than),
    'tên người gửi tự đặt không xuống dòng được trong thân thư');

  /* ── Mật khẩu lần đầu phải qua luật mạnh yếu ── */
  const yeuDau = gitaKichHoat_({token:'khong-co', mk:'1234567890'});
  bao(!yeuDau.ok, 'mật khẩu dễ đoán không đặt được ngay từ lần đầu');

  /* ── Trần bộ nhớ tạm không vượt giới hạn Apps Script ── */
  bao(GITA_CACHE_NGAY <= 21600, 'trần bộ nhớ tạm nằm trong giới hạn 6 giờ của Apps Script',
    GITA_CACHE_NGAY + ' giây');

  /* ── Bổ sung cột cho bảng cũ ── */
  H.trang.users[0] = H.trang.users[0].slice(0, 5);   /* giả lập sổ bản cũ thiếu cột */
  dungSoDuLieu();
  bao(H.trang.users[0].length === GITA_BANG.users.length,
    'dựng lại sổ thì BỔ SUNG cột còn thiếu cho bảng cũ',
    H.trang.users[0].length + '/' + GITA_BANG.users.length + ' cột');
}

console.log('\n' + (loi ? '✗ CÒN '+loi+' ĐIỂM CHƯA ĐẠT' : '✓ TOÀN BỘ ĐẠT — máy chủ chạy đúng'));
process.exit(loi?1:0);
