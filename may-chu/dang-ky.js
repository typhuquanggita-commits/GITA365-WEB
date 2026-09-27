/* ═══════════════════════════════════════════════════════════════
   GITA 365 · CỬA VÀO MỚI — ĐĂNG KÝ, MÃ XÁC NHẬN QUA EMAIL, KÍCH HOẠT

   Ba bước, đúng luồng chủ hệ đặt:

     1. Gửi thông tin  → nhận mã sáu số qua email
     2. Nhập mã đúng   → nhận ĐƯỜNG DẪN kích hoạt qua email
     3. Bấm đường dẫn  → đặt mật khẩu, tài khoản mở

   Vì sao có tới hai lá thư chứ không một: bước 2 chứng minh người đăng
   ký ĐỌC ĐƯỢC hòm thư ấy; bước 3 bắt họ quay lại TỪ hòm thư, nên một
   người gõ nhầm địa chỉ email của người khác không thể đi hết đường.

   ══ ĐÂY LÀ CỬA DUY NHẤT KHÔNG CẦN PHIÊN MÀ LẠI GỬI THƯ ══

   Người gọi tự đặt địa chỉ nhận, tự viết họ tên đi vào thân thư. Nên
   nó cũng là cửa dễ bị lợi dụng nhất trong cả hệ, và mọi chỗ chặt ở
   dưới đều có lý do cụ thể chứ không phải cẩn thận cho có.
   ═══════════════════════════════════════════════════════════════ */

import { Kho, tokenMoi, muoiMoi, bamMoi, soSanhAnToan, mkQuaDeDoan } from './nen.js';
import { guiThu, sachChoThu, CHAN_THU } from './thu.js';
import { moTepKhach } from './ho-so-khach.js';
import { O_DONGY_BAT_BUOC } from './phap-ly-rui-ro.js';

const OTP_PHUT       = 15;   /* mã sống bao lâu */
const OTP_SAI_TOI    = 5;    /* sai bao nhiêu lần thì huỷ */
const KICHHOAT_GIO   = 24;   /* đường dẫn kích hoạt sống bao lâu */
const TRAN_EMAIL_GIO = 3;    /* mỗi địa chỉ: 3 lượt đăng ký mỗi giờ */
const TRAN_TONG_GIO  = 60;   /* cả hệ: 60 lượt mỗi giờ */

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RE_DT_VN = /^(0|\+84)[0-9]{9,10}$/;

/* ── MÃ SÁU SỐ PHẢI NGẪU NHIÊN THẬT ──

   Nền cũ sinh mã bằng Math.random(). Math.random KHÔNG phải nguồn ngẫu
   nhiên dùng cho việc bảo mật: nó chạy từ một trạng thái nội bộ, và
   người quan sát đủ số lần sinh có thể suy ra trạng thái ấy rồi đoán
   các mã tiếp theo. Với một mã chỉ có một triệu khả năng và sống mười
   lăm phút, đó không phải chuyện lý thuyết.

   crypto.getRandomValues lấy từ nguồn ngẫu nhiên của hệ. Cùng một dòng
   mã, không đắt hơn.

   Lấy dư byte rồi loại phần thừa: nếu chỉ lấy số dư cho 10 thì các chữ
   số nhỏ ra hơi nhiều hơn — lệch ít, nhưng đây là chỗ không có lý do
   gì để lệch. */
function otpMoi() {
  let n = '';
  const b = new Uint8Array(24);
  crypto.getRandomValues(b);
  for (let i = 0; i < b.length && n.length < 6; i++)
    if (b[i] < 250) n += (b[i] % 10);
  while (n.length < 6) n += '0';    /* gần như không bao giờ tới đây */
  return n;
}

/* Băm mã OTP trước khi ghi. Mã sống mười lăm phút nên không cần PBKDF2
   hai trăm nghìn vòng — nhưng cũng KHÔNG được ghi thẳng: một bản sao
   lưu cơ sở dữ liệu lọt ra là mọi mã đang chờ đều đọc được, và mỗi mã
   ấy mở một tài khoản mới mang tên người khác. */
async function bamOtp(ma, muoi, tieu) {
  const b = await crypto.subtle.digest('SHA-256',
    new TextEncoder().encode(String(muoi) + '·' + String(ma) + '·' + String(tieu)));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}

const choTheoEmail = (db, e) => db.prepare(
  "SELECT * FROM dangKyCho WHERE lower(email) = ? AND trangThai <> 'xong' LIMIT 1"
).bind(e).first();

const emailDaCo = async (db, e) => !!(await db.prepare(
  'SELECT id FROM users WHERE lower(email) = ? AND (deletedAt IS NULL OR deletedAt = \'\') LIMIT 1'
).bind(e).first());

/* ═══════════════ BƯỚC 1 · GỬI THÔNG TIN ĐĂNG KÝ ═══════════════ */
export async function dangKy(y, env, db) {
  const d = y.hoSo || {};
  const email = String(d.email || '').trim().toLowerCase();

  if (!RE_EMAIL.test(email)) return {ok: false, error: 'Email chưa đúng định dạng.'};
  if (!String(d.hoTen || '').trim() || !String(d.tenCon || '').trim())
    return {ok: false, error: 'Chưa điền đủ họ tên phụ huynh và tên con.'};
  const dt = String(d.dienThoai || '').replace(/[\s.\-]/g, '');
  if (!RE_DT_VN.test(dt)) return {ok: false, error: 'Số điện thoại chưa đúng định dạng Việt Nam.'};

  /* ══ LUẬT 91 · HAI Ô ĐỒNG Ý BẮT BUỘC — CHẶN Ở MÁY CHỦ (9.99.118) ══
     Frontend đã kiểm hai ô đồng ý, nhưng client-side là gợi ý chứ không phải
     cổng: một lượt gọi thẳng dangKy (không qua màn) bỏ qua nó, và tới 9.99.117
     máy chủ KHÔNG đòi, KHÔNG lưu — nên lúc tranh chấp không chứng minh được
     nhà đã đồng ý. Nay máy chủ đòi hai ô bắt buộc, và kichHoat GHI chúng vào
     dongYDuLieu. Ô con (duLieuCon) tuỳ, đã có cổng riêng ở điểm tạo dữ liệu
     con (9.99.70), nên không đòi ở đây. Khoá form mang tiền tố `dy`; giá trị
     `o` chuẩn (không tiền tố) ghi ở kichHoat. */
  if (!d.dyDieuKhoan) return {ok: false, code: 'THIEUDONGY',
    error: 'Cần đồng ý điều khoản sử dụng của Học viện GITA.'};
  if (!d.dyDuLieuGiaDinh) return {ok: false, code: 'THIEUDONGY',
    error: 'Cần đồng ý để GITA lưu và dùng thông tin của gia đình cho việc học.'};

  /* MỘT CÂU TRẢ LỜI DUY NHẤT CHO MỌI NGÃ.

     Email đã có tài khoản, email chưa có, hay vừa bị chặn vì gửi quá
     nhiều — cả ba trả về đúng câu này. Khác nhau một chữ là dò được
     email nào đã đăng ký với Học viện, và danh sách ấy tự nó đã là dữ
     liệu của khách hàng. */
  const thongBao = 'Nếu email này chưa có tài khoản, mã sáu số vừa được gửi tới ' +
    email + '. Mã sống ' + OTP_PHUT + ' phút.';

  /* ── Trần gửi thư, đếm HAI LỚP ──
     Theo địa chỉ nhận: chặn người dội thư vào một hòm thư cụ thể.
     Theo tổng cả hệ: chặn người rải mỗi địa chỉ vài lượt để lách lớp
     thứ nhất — mà đó mới là cách một máy gửi hàng nghìn thư mang tên
     GITA đi khắp nơi. */
  if (await Kho.demNhip(db, 'dangKyEmail·' + email, 3600) > TRAN_EMAIL_GIO) {
    await Kho.ghiNhatKy(db, {viec: 'DANG_KY_CHAN', doiTuong: email,
      chiTiet: 'Vượt ' + TRAN_EMAIL_GIO + ' lượt/giờ cho một email'});
    return {ok: true, thongBao};
  }
  if (await Kho.demNhip(db, 'dangKyTong', 3600) > TRAN_TONG_GIO) {
    await Kho.ghiNhatKy(db, {viec: 'DANG_KY_CHAN_TONG', doiTuong: email,
      chiTiet: 'Cả hệ vượt ' + TRAN_TONG_GIO + ' lượt đăng ký/giờ'});
    return {ok: true, thongBao};
  }

  /* Email đã có tài khoản: dừng ở đây nhưng trả lời y hệt, và gửi một
     thư nhắc. Người thật vẫn biết phải làm gì; người dò danh sách thì
     không biết thêm điều gì. */
  if (await emailDaCo(db, email)) {
    await guiThu(env, {den: email, tieuDe: 'GITA 365 — email này đã có tài khoản',
      than: 'Chào anh chị,\n\nCó một lượt đăng ký vừa dùng địa chỉ email này, nhưng ' +
        'email này đã có tài khoản GITA 365 rồi.\n\nNếu là anh chị: xin mời đăng nhập ' +
        'như bình thường, hoặc dùng mục "Quên mật khẩu" nếu không nhớ.\nNếu không phải ' +
        'anh chị: bỏ qua thư này, tài khoản vẫn an toàn.' + CHAN_THU});
    await Kho.ghiNhatKy(db, {viec: 'DANG_KY_TRUNG_EMAIL', doiTuong: email});
    return {ok: true, thongBao};
  }

  const ma = otpMoi(), muoi = muoiMoi();
  const hoTen = sachChoThu(d.hoTen, 60);   /* xem luật 1 ở may-chu/thu.js */
  const ban = {
    email, hoTen, dienThoai: dt,
    tenCon: sachChoThu(d.tenCon, 60),
    lop: sachChoThu(d.lop, 30),
    tinh: sachChoThu(d.tinh, 40),
    maGioiThieu: sachChoThu(d.maGioiThieu, 30),
    otpSalt: muoi, otpHash: await bamOtp(ma, muoi, env.GITA_TIEU),
    otpHan: Date.now() + OTP_PHUT * 60000, otpSai: 0,
    trangThai: 'choOtp'
  };

  const cu = await choTheoEmail(db, email);
  if (cu) {
    await db.prepare(
      'UPDATE dangKyCho SET hoTen=?,dienThoai=?,tenCon=?,lop=?,tinh=?,maGioiThieu=?,' +
      'otpSalt=?,otpHash=?,otpHan=?,otpSai=0,tokenKichHoat=NULL,tokenHan=0,trangThai=? WHERE id=?'
    ).bind(ban.hoTen, ban.dienThoai, ban.tenCon, ban.lop, ban.tinh, ban.maGioiThieu,
      ban.otpSalt, ban.otpHash, ban.otpHan, ban.trangThai, cu.id).run();
  } else {
    await db.prepare(
      'INSERT INTO dangKyCho (id,email,hoTen,dienThoai,tenCon,lop,tinh,maGioiThieu,' +
      'otpSalt,otpHash,otpHan,otpSai,trangThai,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,0,?,?)'
    ).bind(tokenMoi().slice(0, 24), ban.email, ban.hoTen, ban.dienThoai, ban.tenCon,
      ban.lop, ban.tinh, ban.maGioiThieu, ban.otpSalt, ban.otpHash, ban.otpHan,
      ban.trangThai, new Date().toISOString()).run();
  }

  /* batBuoc: thư này KHÔNG gửi được thì việc chính mất nghĩa. Báo "đã
     gửi mã" trong khi thư không đi là để người ta ngồi đợi một thứ
     không bao giờ tới. */
  try {
    await guiThu(env, {den: email, batBuoc: true,
      tieuDe: 'GITA 365 — mã xác nhận đăng ký',
      than: 'Chào ' + hoTen + ',\n\nMã xác nhận của anh chị là: ' + ma + '\n\n' +
        'Mã sống ' + OTP_PHUT + ' phút. Nhập mã vào màn hình đang mở để đi tiếp.\n\n' +
        'Nếu anh chị không đăng ký, bỏ qua thư này.' + CHAN_THU});
  } catch (e) {
    console.error('DANG_KY_THU_HONG', String(e && e.message || e));
    return {ok: false, error: 'Máy chủ chưa gửi được thư. Thử lại sau ít phút, ' +
      'hoặc gọi 08.5555.4688.'};
  }

  await Kho.ghiNhatKy(db, {viec: 'DANG_KY_GUI_OTP', doiTuong: email, chiTiet: 'Chờ xác nhận'});
  return {ok: true, thongBao};
}

/* ═══════════════ BƯỚC 2 · GỬI LẠI MÃ ═══════════════ */
export async function guiLaiOtp(y, env, db) {
  const email = String(y.email || '').trim().toLowerCase();
  const thongBao = 'Nếu email này đang chờ xác nhận, mã mới vừa được gửi.';
  if (!RE_EMAIL.test(email)) return {ok: true, thongBao};

  /* Chặn nhịp ở đây nữa: không có thì "gửi lại mã" thành một nút dội
     thư không giới hạn, và lớp trần ở bước 1 coi như không có. */
  if (await Kho.demNhip(db, 'dangKyEmail·' + email, 3600) > TRAN_EMAIL_GIO)
    return {ok: true, thongBao};

  const c = await choTheoEmail(db, email);
  if (!c || c.trangThai !== 'choOtp') return {ok: true, thongBao};

  const ma = otpMoi(), muoi = muoiMoi();
  await db.prepare('UPDATE dangKyCho SET otpSalt=?,otpHash=?,otpHan=?,otpSai=0 WHERE id=?')
    .bind(muoi, await bamOtp(ma, muoi, env.GITA_TIEU),
      Date.now() + OTP_PHUT * 60000, c.id).run();

  await guiThu(env, {den: email, tieuDe: 'GITA 365 — mã xác nhận mới',
    than: 'Mã mới của anh chị: ' + ma + '\n\nMã cũ đã hết hiệu lực. Mã này sống ' +
      OTP_PHUT + ' phút.' + CHAN_THU});
  await Kho.ghiNhatKy(db, {viec: 'DANG_KY_GUI_LAI_OTP', doiTuong: email});
  return {ok: true, thongBao};
}

/* ═══════════════ BƯỚC 3 · XÁC THỰC MÃ ═══════════════ */
export async function xacThucOtp(y, env, db) {
  const email = String(y.email || '').trim().toLowerCase();
  const ma = String(y.ma || '').replace(/\D/g, '');
  const sai = {ok: false, error: 'Mã chưa đúng hoặc đã hết hạn.'};

  const c = await choTheoEmail(db, email);
  if (!c || c.trangThai !== 'choOtp') return sai;
  if (Number(c.otpHan || 0) < Date.now())
    return {ok: false, error: 'Mã đã hết hạn. Bấm gửi lại mã.'};
  if (Number(c.otpSai || 0) >= OTP_SAI_TOI)
    return {ok: false, error: 'Mã đã bị huỷ vì nhập sai quá nhiều lần. Bấm gửi lại mã.'};

  if (!soSanhAnToan(await bamOtp(ma, c.otpSalt, env.GITA_TIEU), c.otpHash)) {
    await db.prepare('UPDATE dangKyCho SET otpSai = otpSai + 1 WHERE id = ?').bind(c.id).run();
    const con = OTP_SAI_TOI - (Number(c.otpSai || 0) + 1);
    return {ok: false, error: 'Mã chưa đúng.' +
      (con > 0 ? ' Còn ' + con + ' lần nhập.' : ' Mã đã bị huỷ.')};
  }

  /* Đúng mã — sinh đường dẫn kích hoạt, gửi qua CHÍNH email đó. Người
     đăng ký phải quay lại từ hòm thư: đó là chỗ chứng minh họ đọc được
     hòm thư ấy, chứ không chỉ gõ đúng một địa chỉ.

     XOÁ luôn bản băm mã cũ. Giữ lại một bí mật đã dùng xong là giữ một
     thứ chỉ có thể mất, không thể được gì. */
  const token = tokenMoi();
  await db.prepare(
    "UPDATE dangKyCho SET trangThai='choKichHoat',tokenKichHoat=?,tokenHan=?," +
    "otpHash='',otpSalt='' WHERE id=?"
  ).bind(token, Date.now() + KICHHOAT_GIO * 3600e3, c.id).run();

  const lien = (env.GITA_DIA_CHI_WEB || 'https://gita.edu.vn') + '#kichhoat=' + token;
  try {
    await guiThu(env, {den: email, batBuoc: true,
      tieuDe: 'GITA 365 — bước cuối để mở tài khoản',
      than: 'Chào ' + c.hoTen + ',\n\nMã xác nhận đã đúng. Còn một bước: bấm vào đường ' +
        'dẫn dưới đây để đặt mật khẩu và mở tài khoản.\n\n' + lien + '\n\n' +
        'Đường dẫn sống ' + KICHHOAT_GIO + ' giờ.' + CHAN_THU});
  } catch (e) {
    console.error('KICHHOAT_THU_HONG', String(e && e.message || e));
    return {ok: false, error: 'Máy chủ chưa gửi được thư kích hoạt. Thử lại sau ít phút.'};
  }

  await Kho.ghiNhatKy(db, {viec: 'DANG_KY_XAC_THUC_OTP', doiTuong: email,
    chiTiet: 'Đã gửi đường dẫn kích hoạt'});
  return {ok: true, thongBao: 'Mã đúng. Thư có đường dẫn đặt mật khẩu vừa được gửi tới ' +
    email + '.'};
}

/* ═══════════════ BƯỚC 4 · KÍCH HOẠT ═══════════════ */
export async function kichHoat(y, env, db) {
  const token = String(y.token || '');
  const mk = String(y.mk || '');

  const c = token ? await db.prepare(
    "SELECT * FROM dangKyCho WHERE tokenKichHoat = ? AND trangThai = 'choKichHoat' LIMIT 1"
  ).bind(token).first() : null;
  if (!c) return {ok: false, error: 'Đường dẫn không còn hiệu lực. Xin đăng ký lại.'};
  if (Number(c.tokenHan || 0) < Date.now())
    return {ok: false, error: 'Đường dẫn đã hết hạn. Xin đăng ký lại.'};

  /* CÙNG MỘT LUẬT MẠNH YẾU VỚI CHỖ ĐỔI MẬT KHẨU — xem chú giải ở
     mkQuaDeDoan trong nen.js. Nền cũ để cửa này chỉ đòi mười ký tự,
     nên '1234567890' mở được một tài khoản mới. */
  const che = mkQuaDeDoan(mk, {username: c.email});
  if (che) return {ok: false, code: 'WEAK', error: che};

  const uid = 'U' + tokenMoi().slice(0, 18);
  const maHV = 'H' + tokenMoi().slice(0, 18);
  const luc = new Date().toISOString();
  const muoi = muoiMoi();

  await db.prepare(
    'INSERT INTO students (id,hoTen,lop,tinh,tier,status,kpi,phuHuynhId,coach,createdAt) ' +
    "VALUES (?,?,?,?,0,'moi',0,?,'',?)"
  ).bind(maHV, c.tenCon, c.lop, c.tinh, uid, luc).run();

  /* Ghi tài khoản, và nếu mã số đụng thì XIN MÃ KHÁC RỒI THỬ LẠI.

     Bộ đếm đã lo chuyện không trùng, nhưng chỉ mục duy nhất là lớp chặn
     THẬT, và nó đúng ở cả những trường hợp bộ đếm chưa biết — ví dụ
     ngày chuyển dữ liệu từ Sheets sang mà quên đặt bộ đếm vượt qua mã
     cao nhất đang có. Lúc ấy lượt đăng ký đầu tiên đụng ngay.

     Ba lượt là đủ: nếu ba mã liên tiếp đều đụng thì có chuyện khác hẳn
     đang xảy ra, và lúc ấy ném ra để người ta đi tìm, đừng thử mãi. */
  const bam = await bamMoi(mk, muoi, env.GITA_TIEU);
  let maKH = '';
  for (let lan = 1; ; lan++) {
    maKH = await maKhachHangMoi(db);
    try {
      await db.prepare(
        'INSERT INTO users (id,username,hoTen,email,dienThoai,role,portal,studentId,' +
        "pwSalt,pwHash,active,createdAt,maKhachHang,boTro,mustChangePw) " +
        "VALUES (?,?,?,?,?,'R13','ph',?,?,?,1,?,?,?,0)"
      ).bind(uid, c.email, c.hoTen, c.email, c.dienThoai, maHV,
        muoi, bam, luc, maKH, c.maGioiThieu || '').run();
      break;
    } catch (e) {
      if (lan >= 3 || !/maKhachHang/.test(String(e && e.message || e))) throw e;
    }
  }

  /* ══ GHI ĐỒNG Ý LÚC ĐĂNG KÝ (9.99.118) ══
     Hai ô bắt buộc đã bị dangKy chặn ở máy chủ, nên tài khoản tới được đây
     là tài khoản ĐÃ đồng ý. Ghi thành dòng dongYDuLieu cho maNha=maKH — cùng
     bảng, cùng luật với cổng ký/rút đồng ý (9.99.70), nên docDongY đọc lại
     được và lúc tranh chấp có dòng "hôm ấy nhà này đã đồng ý". Đóng dấu
     dangKyCho 'xong' CÙNG batch: nguyên tử, hoặc cả hai hoặc không gì. */
  const dyLuc = new Date().toISOString();
  await db.batch([
    ...O_DONGY_BAT_BUOC.map(o => db.prepare(
      'INSERT INTO dongYDuLieu (id,maNha,o,viec,boiAi,vaiBoiAi,ghiLuc) VALUES (?,?,?,?,?,?,?)')
      .bind('DY-' + tokenMoi().slice(0, 16), maKH, o, 'dongY', c.email, 'R13', dyLuc)),
    db.prepare("UPDATE dangKyCho SET trangThai='xong',tokenKichHoat=NULL,tokenHan=0 WHERE id=?")
      .bind(c.id)
  ]);

  /* TỆP KHÁCH HÀNG MỞ NGAY LÚC NÀY, không đợi lượt nâng tầng đầu tiên.
     Mở muộn thì có một quãng nhà đã tồn tại mà sổ khách chưa có tên —
     và đó đúng là quãng Tư vấn cần tra cứu nhất. */
  await moTepKhach(db, {maKhachHang: maKH, uidPhuHuynh: uid,
    maHocVien: maHV, boTro: c.maGioiThieu});

  await Kho.ghiNhatKy(db, {uid, username: c.email, viec: 'DANG_KY_XONG', doiTuong: maKH,
    chiTiet: 'Tầng 0 · chờ hoàn thành KPI và xác nhận thanh toán' +
      (c.maGioiThieu ? ' · bảo trợ ' + c.maGioiThieu : '')});

  await guiThu(env, {den: c.email, tieuDe: 'GITA 365 — tài khoản đã mở',
    than: 'Chào ' + c.hoTen + ',\n\nTài khoản của gia đình đã mở.\n' +
      'Mã số khách hàng: ' + maKH + '\nTên đăng nhập: ' + c.email + '\n\n' +
      'Hiện nhà mình đang ở chặng khởi đầu. Tư vấn của GITA sẽ liên hệ trong 24 giờ ' +
      'tới để cùng nhìn lại và chọn chặng phù hợp.' + CHAN_THU});

  return {ok: true, maKhachHang: maKH, email: c.email};
}

/* ── MÃ SỐ KHÁCH HÀNG: MỘT CÂU LỆNH, KHÔNG KHOÁ ──

   Nền cũ đếm  count(*) users có maKhachHang  rồi cộng một, và phải quây
   cả đoạn ấy trong LockService vì hai nhà bấm đường dẫn cùng lúc thì cả
   hai cùng đọc N và cùng sinh GITA-000(N+1) — hai nhà chung một mã, mà
   việc nâng tầng lại dò phiếu thanh toán theo đúng mã đó.

   Khoá chữa được, nhưng nó xếp mọi lượt kích hoạt vào một hàng, và ở
   mức mười vạn tài khoản thì cái hàng ấy là chỗ tắc.

   Một bộ đếm cộng thêm trong MỘT câu lệnh thì không cần khoá: cơ sở dữ
   liệu tự bảo đảm hai lượt chạy cùng lúc nhận hai số khác nhau. Và
   RETURNING trả về ngay con số vừa cộng, nên không có khe giữa cộng và
   đọc.

   Thêm một lớp chặn nữa ở tầng dữ liệu: ix_users_makh là chỉ mục DUY
   NHẤT, nên kể cả bộ đếm có sai thì hai nhà cùng mã vẫn không ghi được
   — hỏng ồn ào chứ không hỏng im lặng. */
async function maKhachHangMoi(db) {
  /* LẦN ĐẦU THÌ ĐẶT BỘ ĐẾM VƯỢT QUA MÃ CAO NHẤT ĐANG CÓ.

     Đây không phải chuyện lý thuyết: ngày chuyển dữ liệu từ Sheets sang,
     bảng users đã có sẵn mã tới GITA-0137 chẳng hạn, mà một bộ đếm mới
     tinh thì bắt đầu từ 1 — lượt đăng ký đầu tiên sinh GITA-0001 và đụng
     ngay tài khoản đã có. Bộ thử bắt đúng chuyện này ở lượt chạy đầu.

     Câu lệnh quét cả bảng users, nhưng CHỈ MỘT LẦN trong đời cơ sở dữ
     liệu: từ lượt thứ hai trở đi nhánh ON CONFLICT chạy, và nhánh ấy chỉ
     cộng thêm một. */
  const r = await db.prepare(
    "INSERT INTO soDem (khoa, gia, suaLuc) VALUES ('maKhachHang', " +
    "  (SELECT COALESCE(MAX(CAST(substr(maKhachHang, 6) AS INTEGER)), 0) + 1 " +
    "     FROM users WHERE maKhachHang LIKE 'GITA-%'), ?) " +
    'ON CONFLICT(khoa) DO UPDATE SET gia = soDem.gia + 1, suaLuc = excluded.suaLuc ' +
    'RETURNING gia'
  ).bind(new Date().toISOString()).first();
  const n = Number(r && r.gia) || 1;
  return 'GITA-' + ('0000' + n).slice(-4);
}
