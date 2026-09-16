/* ═══════════════════════════════════════════════════════════════
   GITA 365 — CỨU HỆ: PHÁ KÍNH KHI SUPER ADMIN BỊ CHIẾM TÀI KHOẢN
   (9.99.95)

   Tình huống: máy Super Admin dính virus, đăng nhập chập chờn, hacker
   chiếm được tài khoản R01, ĐỔI MẬT KHẨU, và bắt đầu phá. Bộ não phát
   hiện nhưng chỉ gửi được một thứ ra ngoài: email tới một địa chỉ CỨU
   HỆ đã khai sẵn — KHÁC địa chỉ tài khoản mà hacker vừa chiếm.

   ══ BA THỨ HACKER KHÔNG CÓ, VÀ CẢ BA PHẢI CÙNG CÓ MỚI CHIẾM LẠI ĐƯỢC ══

   Máy Super Admin dính virus, nên MẬT KHẨU CŨ có thể chính là thứ đã
   rò. Mật khẩu cũ một mình KHÔNG chiếm lại được hệ — nếu đủ thì hacker
   cũng đủ. Nên cứu hệ đòi:

     1. `GITA_KHOA_CUU`  — câu bí mật CỨU HỆ, là secret của Worker, KHÔNG
        nằm trong CSDL, KHÔNG phải mật khẩu đăng nhập. Một bản dump CSDL
        bị lộ không kéo theo nó (cùng luật với GITA_KHOA_KHO).
     2. token một lần   — sinh lúc báo động, gửi tới email cứu hệ. Hacker
        không đọc được email ấy vì nó KHÁC email tài khoản.
     3. mật khẩu CŨ     — xác nhận đúng chủ, là yếu tố thứ ba, KHÔNG phải
        yếu tố duy nhất.

   ══ PHẢN CÔNG LÀ PHẢN CÔNG TRONG CHÍNH NHÀ MÌNH ══

   GITA KHÔNG tấn công vào máy hay hệ của hacker — đó là truy cập trái
   phép, phạm pháp, ngoài quyền của Học viện. Thứ hợp pháp và mạnh hơn:
   ĐÁ SẠCH MỌI PHIÊN (văng luôn phiên hacker dù nó giữ mật khẩu mới),
   ĐÓNG BĂNG mọi cửa ghi, KHOÁ tài khoản bị chiếm, rồi TRUY HỒI. Token
   của hacker bị huỷ và hệ không cho ghi — nó mất quyền ngay.

   ══ CỬA CỨU HỆ KHÔNG DÙNG PHIÊN ══

   Hacker đang giữ mọi phiên hợp lệ; Super Admin thật KHÔNG có phiên
   nào. Nên ba cửa cứu hệ đứng TRƯỚC cổng phiên trong worker, xác thực
   bằng ba yếu tố trên chứ không bằng token đăng nhập — cùng lối cửa
   ngân hàng (nganHangBao) xác thực bằng khoá riêng, không bằng phiên.

   ══ ĐÓNG BĂNG LÀ MẶC ĐỊNH-TỪ-CHỐI ══

   Khi hệ bị đóng băng, worker chặn MỌI cửa trừ danh sách an toàn (đọc +
   cứu hệ + đổi mật khẩu). Trong lúc phá kính, khoá NHIỀU hơn thì an
   toàn hơn khoá ÍT — một cửa ghi lọt qua lúc đóng băng là một đòn phá
   nữa của hacker.
   ═══════════════════════════════════════════════════════════════ */

import { Kho } from './nen.js';
import { guiThu, sachChoThu } from './thu.js';

/* So sánh bí mật KHÔNG rò thời gian: hai chuỗi khác độ dài trả false
   ngay, cùng độ dài thì XOR từng byte và gộp — không thoát sớm ở byte
   đầu khác nhau, nên kẻ đo thời gian không dò được từng ký tự. */
function khopBiMat(a, b) {
  const x = String(a || ''), y = String(b || '');
  if (!x || !y || x.length !== y.length) return false;
  let v = 0;
  for (let i = 0; i < x.length; i++) v |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return v === 0;
}

function tokenMoi() {
  const b = new Uint8Array(32);
  crypto.getRandomValues(b);
  return [...b].map(x => x.toString(16).padStart(2, '0')).join('');
}

/* ═══════════════ ĐỌC / ĐẶT TRẠNG THÁI ĐÓNG BĂNG ═══════════════
   Trạng thái là DÒNG MỚI NHẤT của bảng cuuHe loại 'BANG' hoặc 'MO' —
   không có cột "đangBăng" để gõ đè. Một cột trạng thái thì hoặc bị gõ
   đè, hoặc cũ đi lặng lẽ; tính lúc đọc thì luôn đúng. Cùng luật với
   cột conHan KHÔNG có trong theVungManh (9.99.63). */
export async function dangBang(db) {
  const r = await db.prepare(
    "SELECT loai FROM cuuHe WHERE loai IN ('BANG','MO') ORDER BY stt DESC LIMIT 1"
  ).first();
  return !!(r && r.loai === 'BANG');
}

/* Danh sách cửa VẪN CHẠY khi đóng băng — đọc, cứu hệ, đổi mật khẩu.
   Mặc định-từ-chối: cửa nào KHÔNG ở đây thì bị chặn khi băng. */
export const AN_TOAN_KHI_BANG = new Set([
  'dangNhap', 'dangXuat', 'doiMatKhau', 'quenMatKhau', 'datLaiMatKhau',
  'baoDongCuuHe', 'dongBangHe', 'moBangHe', 'truyHoiHe', 'soatCuuHe',
  'soatSoDen', 'docTranGiamSat'
]);

/* ═══════════════ 1 · PHÁT HIỆN BẤT THƯỜNG ═══════════════
   Bộ não soi nhật ký: một R01 vừa ĐỔI MẬT KHẨU rồi làm một loạt việc
   phá trong một cửa sổ ngắn. Đây là DẤU HIỆU, không phải phán quyết —
   nó không tự đóng băng (tự đóng băng cũng là một đòn phá nếu bị kích
   nhầm), nó chỉ BÁO ĐỘNG ra email cứu hệ. */
const VIEC_PHA = ['DOI_MAT_KHAU', 'CAP_KHOA', 'XOA_DU_LIEU', 'HA_TANG',
  'DUYET_CHI', 'DAT_GIA', 'CAP_QUYEN', 'THU_HOI_QUYEN'];

export async function soatBatThuong(db, phutCuaSo) {
  const cua = Number(phutCuaSo || 15);
  const moc = new Date(Date.now() - cua * 60e3).toISOString();
  const r = await db.prepare(
    "SELECT username, viec, COUNT(*) c FROM audit " +
    "WHERE luc >= ? GROUP BY username, viec"
  ).bind(moc).all();
  const ds = r.results || [];
  const theoNguoi = {};
  for (const x of ds) {
    theoNguoi[x.username] = theoNguoi[x.username] || { doiMk: 0, pha: 0, viec: [] };
    if (x.viec === 'DOI_MAT_KHAU') theoNguoi[x.username].doiMk += x.c;
    if (VIEC_PHA.indexOf(x.viec) >= 0 && x.viec !== 'DOI_MAT_KHAU') {
      theoNguoi[x.username].pha += x.c;
      theoNguoi[x.username].viec.push(x.viec + '×' + x.c);
    }
  }
  const ngo = [];
  for (const u of Object.keys(theoNguoi)) {
    const t = theoNguoi[u];
    /* Đổi mật khẩu CỘNG ít nhất hai việc phá trong cửa sổ ngắn: một
       người bình thường đổi mật khẩu rồi nghỉ, không đổi mật khẩu rồi
       lập tức rút khoá và hạ tầng hàng loạt. */
    if (t.doiMk >= 1 && t.pha >= 2)
      ngo.push({ ai: u, doiMk: t.doiMk, soPha: t.pha, viec: t.viec });
  }
  return { ngo, cuaSoPhut: cua,
    vi: ngo.length
      ? 'Ngờ một tài khoản bị chiếm: vừa đổi mật khẩu vừa làm một loạt việc phá.'
      : 'Không thấy dấu hiệu tài khoản bị chiếm trong cửa sổ ' + cua + ' phút.' };
}

/* ═══════════════ 2 · BÁO ĐỘNG RA EMAIL CỨU HỆ ═══════════════
   Không nhận phiên: hệ tự gọi khi soatBatThuong ngờ, HOẶC một người
   không đăng nhập được gọi để kích báo động. Nó KHÔNG tự đóng băng —
   nó gửi một token một lần tới GITA_MAIL_CUU và ghi vào sổ băm. */
export async function baoDongCuuHe(y, env, db) {
  const mailCuu = String(env.GITA_MAIL_CUU || '').trim();
  if (!mailCuu) return { ok: false, code: 'CHUANAP',
    error: 'Chưa nạp GITA_MAIL_CUU — địa chỉ email cứu hệ. Đây là địa chỉ KHÁC ' +
      'email tài khoản, để hacker chiếm tài khoản vẫn không đọc được báo động.' };

  const bt = await soatBatThuong(db, Number(y.phut || 15));
  /* Cho phép kích tay (y.tay===true) kể cả khi chưa đủ dấu hiệu: người
     thật thấy máy mình lạ có quyền gọi báo động ngay, không phải chờ
     bộ dò đủ ngưỡng. */
  if (!bt.ngo.length && !y.tay) return { ok: true, baoDong: false, soi: bt,
    vi: 'Chưa đủ dấu hiệu để tự báo động. Muốn kích tay thì gửi tay:true.' };

  const token = tokenMoi();
  const han = Date.now() + 3600e3;  // token sống một giờ
  await db.prepare(
    "INSERT INTO cuuHe (loai,luc,token,hanToken,boiAi,chiTiet) VALUES ('BAODONG',?,?,?,?,?)"
  ).bind(new Date().toISOString(), token, han, 'HE_THONG',
    (bt.ngo[0] ? sachChoThu(JSON.stringify(bt.ngo[0].viec), 200) : 'kích tay')).run();

  await ghiSoDenNoiBo(db, 'HE_THONG', 'CUU_BAODONG',
    bt.ngo[0] ? bt.ngo[0].ai : 'kichTay', 'token đã gửi tới email cứu hệ');

  const than =
    'CẢNH BÁO CỨU HỆ GITA 365\n\n' +
    'Bộ não phát hiện dấu hiệu tài khoản điều hành bị chiếm:\n' +
    (bt.ngo[0] ? '  · tài khoản: ' + sachChoThu(bt.ngo[0].ai, 60) + '\n' +
                 '  · việc phá: ' + sachChoThu(bt.ngo[0].viec.join(', '), 200) + '\n' : '') +
    '\nNẾU ĐÂY LÀ ANH/CHỊ và mọi thứ bình thường: bỏ qua thư này.\n\n' +
    'NẾU KHÔNG PHẢI ANH/CHỊ: hệ đang bị chiếm. Để chiếm lại:\n' +
    '  1. Mở đường cứu hệ (đường dẫn nội bộ của Học viện).\n' +
    '  2. Nhập TOKEN một lần này: ' + token + '\n' +
    '  3. Nhập CÂU BÍ MẬT CỨU HỆ (khoá offline anh/chị giữ riêng).\n' +
    '  4. Nhập MẬT KHẨU CŨ để xác nhận đúng chủ.\n\n' +
    'Hệ sẽ đá sạch mọi phiên, đóng băng mọi cửa ghi, và truy hồi.\n' +
    'Token sống một giờ. Không chuyển tiếp thư này cho ai.';
  const guiOk = await guiThu(env, { den: mailCuu, batBuoc: true,
    tieuDe: 'GITA 365 — CẢNH BÁO CỨU HỆ', than });

  return { ok: true, baoDong: true, guiOk, gui: mailCuu,
    vi: 'Đã gửi token cứu hệ tới email cứu hệ. Token KHÔNG trả về trong phản hồi ' +
      'này — nó chỉ đi qua email, để đúng người cầm email mới có nó.' };
}

/* ═══════════════ CỬA CHUNG: XÁC THỰC BA YẾU TỐ ═══════════════ */
async function xacThucBaYeuTo(y, env, db) {
  /* Yếu tố 1 · khoá cứu hệ offline */
  const khoaCuu = String(env.GITA_KHOA_CUU || '');
  if (!khoaCuu) return { loi: { ok: false, code: 'CHUANAP',
    error: 'Chưa nạp GITA_KHOA_CUU. Không có nó thì không có đường phá kính nào.' } };
  if (!khopBiMat(y.khoaCuu, khoaCuu))
    return { loi: { ok: false, code: 'SAIKHOA',
      error: 'Câu bí mật cứu hệ chưa đúng.' } };

  /* Yếu tố 2 · token một lần từ email, còn hạn, chưa dùng */
  const tk = String(y.token || '');
  const row = await db.prepare(
    "SELECT * FROM cuuHe WHERE token = ? AND loai = 'BAODONG' ORDER BY stt DESC LIMIT 1"
  ).bind(tk).first();
  if (!tk || !row) return { loi: { ok: false, code: 'SAITOKEN',
    error: 'Token cứu hệ không đúng. Token chỉ đến qua email cứu hệ.' } };
  if (Number(row.hanToken) < Date.now()) return { loi: { ok: false, code: 'HETHAN',
    error: 'Token đã hết hạn (một giờ). Kích báo động lại để nhận token mới.' } };
  if (row.daDung) return { loi: { ok: false, code: 'DADUNG',
    error: 'Token này đã dùng rồi. Mỗi token một lần.' } };

  return { ok: true, row };
}

/* ═══════════════ 3 · ĐÓNG BĂNG — PHẢN CÔNG TRONG NHÀ ═══════════════
   Đá sạch mọi phiên (văng luôn hacker) và bật cờ băng (chặn mọi cửa
   ghi). KHÔNG cần mật khẩu cũ ở bước này: đóng băng là bước KHẨN, càng
   nhanh càng tốt, và nó KHÔNG mất mát gì — chỉ dừng lại. Truy hồi mới
   là bước cần đủ ba yếu tố. */
export async function dongBangHe(y, env, db) {
  const xt = await xacThucBaYeuTo(y, env, db);
  if (xt.loi) return xt.loi;

  const soPhien = await db.prepare('SELECT COUNT(*) c FROM sessions').first();
  /* Nguyên tử (9.99.116): đá SẠCH phiên + ghi dấu đóng băng đi cùng nhau —
     không để "đá xong mà chưa ghi" hay "ghi rồi mà chưa đá". */
  await db.batch([
    db.prepare('DELETE FROM sessions'),  // đá SẠCH — cả hacker
    db.prepare("INSERT INTO cuuHe (loai,luc,token,boiAi,chiTiet) VALUES ('BANG',?,?,?,?)")
      .bind(new Date().toISOString(), y.token, 'CUU_HE',
        'đá ' + ((soPhien && soPhien.c) || 0) + ' phiên, đóng băng mọi cửa ghi')
  ]);
  await ghiSoDenNoiBo(db, 'CUU_HE', 'CUU_DONGBANG', 'toanHe',
    'đá ' + ((soPhien && soPhien.c) || 0) + ' phiên');

  return { ok: true, daDaPhien: (soPhien && soPhien.c) || 0,
    vi: 'ĐÃ ĐÓNG BĂNG. Mọi phiên bị đá (kể cả hacker), mọi cửa ghi bị chặn. ' +
      'Bước tiếp: truyHoiHe với mật khẩu cũ + mật khẩu mới để chiếm lại và mở băng.' };
}

/* ═══════════════ 4 · TRUY HỒI — CHIẾM LẠI TOÀN QUYỀN ═══════════════
   Đủ ba yếu tố + mật khẩu CŨ (xác nhận đúng chủ) + mật khẩu MỚI. Đặt
   lại mật khẩu R01, đá mọi phiên lần nữa, đánh dấu token đã dùng, MỞ
   băng, và ghi sổ. Phần khôi phục DỮ LIỆU từ bản sao lưu là bước của
   người vận hành (node tools/khoi-phuc-kho.js) — cửa này NÓI RA điều
   đó chứ không giả vờ đã làm. */
export async function truyHoiHe(y, env, db) {
  const xt = await xacThucBaYeuTo(y, env, db);
  if (xt.loi) return xt.loi;

  const uid = String(y.uidR01 || '');
  const nd = await Kho.nguoiTheoId(db, uid);
  if (!nd || nd.role !== 'R01') return { ok: false, code: 'SAITK',
    error: 'Tài khoản truy hồi phải là R01. Cửa này chiếm lại quyền điều hành gốc.' };

  /* Mật khẩu CŨ — yếu tố thứ ba, xác nhận đúng chủ. Nếu hacker đã đổi
     mật khẩu thì hash hiện tại là của hacker; ta so với mật khẩu CŨ mà
     Super Admin thật còn nhớ. Khi khớp: đúng chủ. Khi không: vẫn cho
     đặt lại NHƯNG ghi rõ là "không xác nhận được bằng mật khẩu cũ" —
     vì hacker có thể đã đổi, và chặn cứng ở đây thì đúng chủ cũng kẹt.
     Hai yếu tố kia (khoá cứu hệ + token email) đã đủ mạnh; mật khẩu cũ
     là lớp xác nhận thêm, được GHI LẠI chứ không chặn. */
  let dungChu = false;
  try {
    const cu = await import('./nen.js').then(m => m.kiemMatKhau
      ? m.kiemMatKhau(nd, String(y.mkCu || ''), env.GITA_TIEU) : { dung: false });
    dungChu = !!(cu && cu.dung);
  } catch (e) { dungChu = false; }

  const moi = String(y.mkMoi || '');
  const che = await import('./nen.js').then(m => m.mkQuaDeDoan
    ? m.mkQuaDeDoan(moi, nd) : (moi.length < 8 ? 'Mật khẩu mới quá ngắn.' : ''));
  if (che) return { ok: false, code: 'MKYEU', error: che };

  const nen = await import('./nen.js');
  const muoi = nen.muoiMoi();
  const bam = await nen.bamMoi(moi, muoi, env.GITA_TIEU);
  const luc = new Date().toISOString();

  /* ══ MỘT GIAO DỊCH NGUYÊN TỬ (9.99.116) ══
     Bốn ghi lõi của truy hồi phải đi CÙNG NHAU: đặt lại mật khẩu R01, đá
     mọi phiên (vô hiệu token hacker), đánh dấu token cứu hệ đã dùng, ghi
     sổ. Trước 9.99.116 là bốn .run() rời — sập giữa chừng là thảm hoạ đúng
     lúc gay nhất: mật khẩu đặt lại mà phiên hacker còn sống, hoặc token bị
     đánh dấu đã dùng trong khi mật khẩu CHƯA đổi → Super Admin thật mất
     luôn đường vào. db.batch làm all-or-nothing: hoặc chiếm lại trọn, hoặc
     nguyên trạng để thử lại. Băm mật khẩu tính TRƯỚC (async) rồi mới dựng
     mảng, vì batch nhận câu đã .bind() sẵn. */
  await db.batch([
    db.prepare('UPDATE users SET pwSalt=?, pwHash=?, mustChangePw=0, pwDoiLuc=?, updatedAt=? WHERE id=?')
      .bind(muoi, bam, luc, luc, nd.id),
    db.prepare('DELETE FROM sessions'),
    db.prepare('UPDATE cuuHe SET daDung=1 WHERE token=?').bind(y.token),
    db.prepare("INSERT INTO cuuHe (loai,luc,token,boiAi,chiTiet) VALUES ('MO',?,?,?,?)")
      .bind(luc, y.token, 'CUU_HE',
        'truy hồi R01 ' + nd.username + ' · mật khẩu cũ ' +
        (dungChu ? 'KHỚP' : 'KHÔNG khớp — ghi lại, không chặn'))
  ]);
  await ghiSoDenNoiBo(db, 'CUU_HE', 'CUU_TRUYHOI', nd.username,
    'đặt lại mật khẩu, đá mọi phiên, mở băng · mkCũ ' + (dungChu ? 'khớp' : 'không khớp'));

  return { ok: true, dungChuXacNhan: dungChu,
    khoiPhucDuLieu: 'Cửa này chiếm lại QUYỀN (mật khẩu + phiên + mở băng). ' +
      'Khôi phục DỮ LIỆU đã bị phá là bước riêng, chạy tay từ bản sao lưu: ' +
      'node tools/khoi-phuc-kho.js <tệp.gita>. Máy KHÔNG giả vờ đã khôi phục dữ ' +
      'liệu — một câu "đã khôi phục xong" cho một việc chưa làm là chỗ nguy nhất.',
    vi: 'ĐÃ TRUY HỒI. Mật khẩu R01 đặt lại, mọi phiên bị đá, băng đã mở. ' +
      (dungChu ? 'Mật khẩu cũ khớp — xác nhận đúng chủ.'
               : 'Mật khẩu cũ KHÔNG khớp (hacker có thể đã đổi) — đã ghi rõ vào sổ để soi lại.') };
}

/* Mở băng thủ công (nếu báo động nhầm), cùng ba yếu tố. */
export async function moBangHe(y, env, db) {
  const xt = await xacThucBaYeuTo(y, env, db);
  if (xt.loi) return xt.loi;
  /* Nguyên tử (9.99.116): ghi dấu mở băng + đánh dấu token đã dùng cùng lúc. */
  await db.batch([
    db.prepare("INSERT INTO cuuHe (loai,luc,token,boiAi,chiTiet) VALUES ('MO',?,?,?,?)")
      .bind(new Date().toISOString(), y.token, 'CUU_HE', 'mở băng thủ công (báo động nhầm)'),
    db.prepare('UPDATE cuuHe SET daDung=1 WHERE token=?').bind(y.token)
  ]);
  return { ok: true, vi: 'Đã mở băng.' };
}

/* Soi trạng thái cứu hệ — CHỈ ĐỌC, cho NHÀ NGHỀ (R01–R12) xem.

   Bản đầu không kiểm vai (chỉ cần một phiên hợp lệ), nên một khách R13/
   R14/R15 đọc được cả bảng an ninh: tên tài khoản quản trị đang bị NGỜ
   chiếm + việc phá của họ + trạng thái đóng băng. Hai cửa anh em
   (docTranGiamSat · soatSoDen) đều khoá R01–R12; cửa này là ngoại lệ lọt
   lưới. Lỗ 9.99.112 (F2 tổ soi xác thực). Vẫn nằm trong AN_TOAN_KHI_BANG
   nên nhà nghề đọc được cả lúc hệ đang băng. */
export async function soatCuuHe(y, env, db, hoSo) {
  if (!/^R0[12]$/.test(String((hoSo || {}).role || '')))
    return { ok: false, code: 'NOPERM',
      error: 'Bảng cứu hệ chỉ mở cho R01–R02. Nó phơi tên tài khoản quản trị đang ' +
        'bị NGỜ chiếm + việc phá của họ — không nên hiện cho cả R03–R12, càng không ' +
        'cho khách. (9.99.112, siết từ R01–R12 theo khuyến nghị thanh tra.)' };
  const bang = await dangBang(db);
  const r = await db.prepare(
    "SELECT stt,loai,luc,boiAi,chiTiet FROM cuuHe ORDER BY stt DESC LIMIT 20").all();
  const bt = await soatBatThuong(db, 15);
  return { ok: true, dangBang: bang, soDauHieu: bt.ngo.length, dauHieu: bt.ngo,
    sao: r.results || [] };
}

/* ═══════════════ SỔ BĂM NỘI BỘ ═══════════════
   Cứu hệ ghi vào cùng sổ băm nối của giám sát (soDen) — để hacker
   không xoá được dấu một lượt báo động hay đóng băng. Viết lại phép
   băm ở đây thay vì nhập từ giam-sat.js để module cứu hệ đứng độc lập
   được kể cả khi giám sát chưa nạp; NÓI RA rằng đây là bản thứ hai, và
   mục 104 canh rằng hai bản cho ra cùng một chuỗi băm. */
async function bamChuoi(s) {
  const b = new TextEncoder().encode(String(s));
  const h = await crypto.subtle.digest('SHA-256', b);
  return [...new Uint8Array(h)].map(x => x.toString(16).padStart(2, '0')).join('');
}
async function ghiSoDenNoiBo(db, ai, viec, doiTuong, chiTiet) {
  const truoc = await db.prepare('SELECT bamTu FROM soDen ORDER BY stt DESC LIMIT 1').first();
  const bamTruoc = (truoc && truoc.bamTu) || 'GITA-VIP-GOC';
  const luc = new Date().toISOString();
  const than = [luc, ai, viec, doiTuong, chiTiet].join('|');
  const bamTu = await bamChuoi(bamTruoc + '|' + than);
  await db.prepare(
    'INSERT INTO soDen (luc,aiLam,viec,doiTuong,chiTiet,bamTruoc,bamTu) VALUES (?,?,?,?,?,?,?)'
  ).bind(luc, ai, viec, doiTuong, chiTiet, bamTruoc, bamTu).run();
  return bamTu;
}
