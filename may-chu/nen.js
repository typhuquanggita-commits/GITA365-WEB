/* ═══════════════════════════════════════════════════════════════
   GITA 365 · CỬA VÀO MỚI — LỚP NỀN

   Chạy trên Cloudflare Workers. Cùng mã ấy chạy được ở Node 22 vì cả
   hai đều có crypto.subtle và fetch sẵn — nên bộ thử ở
   tools/thu-worker.js gọi ĐÚNG những hàm này, không gọi một bản dựng
   lại gần giống.

   ── VÌ SAO RỜI APPS SCRIPT, KHÔNG CHỈ RỜI SHEETS ──

   Đo ở tools/do-tai-may-chu.js: trần 10 triệu ô của Sheets chặn ở
   79.033 tài khoản, nhưng trần 30 LƯỢT CHẠY ĐỒNG THỜI của Apps Script
   còn chặn sớm hơn — ở 100.000 tài khoản, giờ cao điểm cần khoảng
   1.250 lượt. Đổi kho dữ liệu mà giữ cửa vào Apps Script thì gỡ được
   trần thứ nhất và giữ nguyên trần thứ hai.

   ── BA THỨ KHÔNG BAO GIỜ NẰM TRONG CƠ SỞ DỮ LIỆU ──

   Tiêu băm mật khẩu, bộ khoá mở kho, và khoá ký chứng cứ. Cả ba nằm
   trong secret của Worker. Lý do không phải là gọn: một bản sao lưu cơ
   sở dữ liệu bị lộ mà kéo theo cả tiêu băm thì lớp băm mất hết tác
   dụng, còn kéo theo bộ khoá kho thì mất luôn toàn bộ tài sản nội dung
   của Học viện.
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════════ BĂM MẬT KHẨU ═══════════════

   NỀN CŨ BĂM MỘT VÒNG SHA-256. Ở quy mô một trăm người thì chuyện ấy
   đáng bàn; ở quy mô mười vạn người thì nó là một lỗ hổng thật: một
   máy chơi game thử được hàng tỉ mã SHA-256 mỗi giây, nên cả bảng mật
   khẩu bị lộ là cả bảng bị mở trong vài giờ. Tiêu (pepper) có đỡ,
   nhưng chỉ đỡ chừng nào tiêu không lộ cùng bảng.

   PBKDF2 chậm đi hàng trăm nghìn lần MỘT CÁCH CÓ CHỦ Ý. Người dùng
   thật chờ thêm vài chục mi-li-giây một lần đăng nhập; kẻ dò phải trả
   đúng cái giá ấy cho từng lượt đoán.

   KHÔNG BẮT AI ĐẶT LẠI MẬT KHẨU. Bản băm cũ vẫn kiểm được, và ngay
   lần đăng nhập đúng kế tiếp thì bản băm ấy được thay bằng bản mới —
   đổi lặng lẽ, không ai phải làm gì. Bắt mười vạn người đặt lại mật
   khẩu để nâng một lớp kỹ thuật là chuyển cái giá của mình sang cho
   họ, và một phần trong số ấy sẽ không quay lại. */

const VONG = 210000;   /* Khuyến nghị của OWASP cho PBKDF2-SHA256 */

function hex(buf) {
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Băm kiểu MỚI. Trả về chuỗi tự mô tả: pbkdf2$<số vòng>$<hex>.
    Ghi số vòng vào chính chuỗi băm để ngày nâng số vòng lên thì bản cũ
    vẫn kiểm được — không ghi thì đổi số vòng là mọi người mất mật khẩu
    cùng một lúc. */
export async function bamMoi(mk, muoi, tieu) {
  const kh = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(String(mk) + '·' + String(tieu)),
    'PBKDF2', false, ['deriveBits']);
  const bit = await crypto.subtle.deriveBits(
    {name: 'PBKDF2', salt: new TextEncoder().encode(String(muoi)),
     iterations: VONG, hash: 'SHA-256'}, kh, 256);
  return 'pbkdf2$' + VONG + '$' + hex(bit);
}

/** Băm kiểu CŨ — y hệt hashPw_ của server/GITA_Nen.gs, từng ký tự.
    Chỉ dùng để KIỂM bản băm cũ, không bao giờ dùng để ghi mới. */
export async function bamCu(mk, muoi, tieu) {
  const b = await crypto.subtle.digest('SHA-256',
    new TextEncoder().encode(String(muoi) + '·' + String(mk) + '·' + String(tieu)));
  return hex(b);
}

/** So sánh không rò rỉ thời gian. Chuỗi băm thì chênh lệch nhỏ, nhưng
    đây là chỗ không có lý do gì để làm ẩu. */
export function soSanhAnToan(a, b) {
  a = String(a || ''); b = String(b || '');
  if (a.length !== b.length) return false;
  let kh = 0;
  for (let i = 0; i < a.length; i++) kh |= (a.charCodeAt(i) ^ b.charCodeAt(i));
  return kh === 0;
}

/** Kiểm mật khẩu, nhận cả hai kiểu băm.
    Trả {dung, canNangCap} — canNangCap nghĩa là bản băm còn kiểu cũ và
    người gọi NÊN ghi đè bằng bản mới ngay trong lượt đăng nhập này. */
export async function kiemMatKhau(nd, mk, tieu) {
  const luu = String(nd && nd.pwHash || '');
  const muoi = String(nd && nd.pwSalt || '');
  if (!luu) return {dung: false, canNangCap: false};
  if (luu.startsWith('pbkdf2$')) {
    const phan = luu.split('$');
    const vong = Number(phan[1]) || VONG;
    const kh = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(String(mk) + '·' + String(tieu)),
      'PBKDF2', false, ['deriveBits']);
    const bit = await crypto.subtle.deriveBits(
      {name: 'PBKDF2', salt: new TextEncoder().encode(muoi),
       iterations: vong, hash: 'SHA-256'}, kh, 256);
    /* Nâng cả khi số vòng cũ hơn mức hiện hành — cùng một lối lặng lẽ. */
    return {dung: soSanhAnToan(hex(bit), phan[2]), canNangCap: vong < VONG};
  }
  return {dung: soSanhAnToan(await bamCu(mk, muoi, tieu), luu), canNangCap: true};
}

export function muoiMoi() {
  return hex(crypto.getRandomValues(new Uint8Array(16)));
}

/** Token phiên. 32 byte ngẫu nhiên thật — KHÔNG phải UUID ghép chuỗi.
    Nền cũ dùng Utilities.getUuid(); UUID v4 có 122 bit ngẫu nhiên nên
    vẫn đủ, nhưng nó là định danh chứ không phải bí mật, và trộn hai
    vai ấy là thói quen dẫn tới chỗ khác sai. */
export function tokenMoi() {
  return hex(crypto.getRandomValues(new Uint8Array(32)));
}

/* ═══════════════ LỚP DỮ LIỆU ═══════════════

   Mỏng có chủ ý. Mỗi hàm là MỘT câu lệnh đi qua đúng một chỉ mục đã
   khai ở may-chu/csdl.sql; không có hàm nào đọc cả bảng, và đó là toàn
   bộ lý do lượt chuyển nền này tồn tại.

   Chữ ký giống D1: db.prepare(sql).bind(...).first() / .all() / .run().
   Bộ thử dựng đúng chữ ký ấy trên node:sqlite. */

export const Kho = {
  async phien(db, token) {
    if (!token) return null;
    return await db.prepare('SELECT * FROM sessions WHERE id = ?').bind(token).first();
  },

  async nguoiTheoId(db, id) {
    return await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
  },

  /* Đăng nhập nhận tên đăng nhập HOẶC email, cả hai hạ chữ thường.
     Phải hạ ở đây y như chỉ mục đã hạ — xem luật 2 ở đầu csdl.sql. */
  async nguoiTheoTen(db, u) {
    const t = String(u || '').trim().toLowerCase();
    if (!t) return null;
    return await db.prepare(
      'SELECT * FROM users WHERE lower(username) = ? OR lower(email) = ? LIMIT 1'
    ).bind(t, t).first();
  },

  /* ═══ ĐỊNH DANH CHÍNH TẮC — một cửa cho mọi phép "có phải cùng người" ═══

     Một chuỗi định danh người dùng gõ vào có BA hình: id · tên đăng nhập ·
     email. Mọi cổng chống-tự-ký cũ so chuỗi THÔ ấy với MỘT hình (thường là
     username), trong khi bộ tra chấp nhận CẢ BA — nên gửi id (hoặc email)
     của chính mình thì lọt qua cổng mà vẫn là cùng một người. Lỗ ấy tìm ra
     ở soiLuatNangCap (tự soi luật chính đề xuất của mình) và capLenhGiamSat
     (tự cấp lệnh giám sát) — 9.99.112.

     layUid quy MỌI hình về đúng một khoá: users.id. So hai bên bằng id thì
     không hình nào lách được. Trả null khi không tra được — nơi gọi tự
     quyết "không xác minh được thì ĐÓNG" (cùng bài học cổng NGANGCAP
     9.99.76: một cổng không xác minh được phải đóng, không mở). */
  async layUid(db, raw) {
    const s = String(raw || '').trim();
    if (!s) return null;
    let nd = await this.nguoiTheoId(db, s);
    if (!nd) nd = await this.nguoiTheoTen(db, s);
    return nd ? nd.id : null;
  },

  /* True khi hai định danh (mỗi cái có thể là id/tên/email) là CÙNG một
     người. Chưa tra được một bên → trả một object {khong:true} để nơi gọi
     phân biệt "khác người" với "không xác minh được". */
  async cungNguoi(db, a, b) {
    const ua = await this.layUid(db, a);
    const ub = await this.layUid(db, b);
    if (!ua || !ub) return { biet: false, ket: false };
    return { biet: true, ket: ua === ub };
  },

  async hocVienCuaCha(db, uid) {
    return await db.prepare(
      'SELECT * FROM students WHERE phuHuynhId = ? AND deletedAt IS NULL LIMIT 1'
    ).bind(uid).first();
  },

  async moPhien(db, nd, hanGio) {
    const token = tokenMoi();
    await db.prepare(
      'INSERT INTO sessions (id,uid,username,role,portal,studentId,exp,createdAt) ' +
      'VALUES (?,?,?,?,?,?,?,?)'
    ).bind(token, nd.id, nd.username, nd.role, nd.portal, nd.studentId || null,
      Date.now() + hanGio * 3600e3, new Date().toISOString()).run();
    return token;
  },

  /* ĐÓNG PHIÊN LÀ XOÁ DÒNG, KHÔNG PHẢI ĐẶT exp = 0.

     Nền cũ đặt exp = 0 vì Store không có phép xoá nào — dòng chết nằm
     lại vĩnh viễn, và chính chuyện ấy đẻ ra cả bộ dọn ở bản 9.79 cùng
     một luật riêng để nhận ra dòng exp = 0 là dòng đã chết. Ở đây xoá
     được thì xoá; bộ dọn nhẹ đi đúng một luật. */
  async dongPhien(db, token) {
    await db.prepare('DELETE FROM sessions WHERE id = ?').bind(token).run();
  },

  /** Đá mọi phiên khác của cùng người — dùng khi đổi mật khẩu. Kẻ đang
      giữ token cũ mất quyền NGAY, không đợi phiên hết hạn. */
  async daPhienKhac(db, uid, truToken) {
    const r = await db.prepare('DELETE FROM sessions WHERE uid = ? AND id <> ?')
      .bind(uid, truToken || '').run();
    return (r && r.meta && r.meta.changes) || 0;
  },

  async ghiNhatKy(db, ban) {
    await db.prepare(
      'INSERT INTO audit (id,luc,uid,username,viec,doiTuong,chiTiet) VALUES (?,?,?,?,?,?,?)'
    ).bind(tokenMoi().slice(0, 24), new Date().toISOString(),
      ban.uid || '', ban.username || '', ban.viec || '',
      ban.doiTuong || '', ban.chiTiet || '').run();
  },

  /* ── CHẶN NHỊP ──

     Đếm trong cơ sở dữ liệu, không đếm trong bộ nhớ của từng máy chủ.
     Worker chạy ở hàng trăm nơi cùng lúc; đếm trong bộ nhớ thì mỗi nơi
     đếm một sổ, và kẻ đoán mật khẩu chỉ cần rải đều các lượt thử là
     không sổ nào thấy đủ số.

     Một câu lệnh làm cả ba việc — thêm mới, cộng thêm, và đặt lại khi
     đã quá hạn. Tách thành đọc rồi ghi là mở ra đúng cái khe mà hai
     lượt chạy cùng lúc chui qua được. */
  async demNhip(db, khoa, giay) {
    const nay = Date.now(), han = nay + giay * 1000;
    await db.prepare(
      'INSERT INTO chanNhip (khoa, dem, hetHan) VALUES (?, 1, ?) ' +
      'ON CONFLICT(khoa) DO UPDATE SET ' +
      '  dem    = CASE WHEN chanNhip.hetHan < ? THEN 1   ELSE chanNhip.dem + 1 END, ' +
      '  hetHan = CASE WHEN chanNhip.hetHan < ? THEN ?   ELSE chanNhip.hetHan  END'
    ).bind(khoa, han, nay, nay, han).run();
    const r = await db.prepare('SELECT dem FROM chanNhip WHERE khoa = ?').bind(khoa).first();
    return (r && r.dem) || 0;
  },

  async xoaNhip(db, khoa) {
    await db.prepare('DELETE FROM chanNhip WHERE khoa = ?').bind(khoa).run();
  }
};

/* ═══════════════ KIỂM PHIÊN ═══════════════

   Ba câu lệnh, mỗi câu đi qua một chỉ mục. Nền cũ làm đúng việc này
   bằng cách đọc CẢ ba bảng — 50 ô × số tài khoản mỗi lượt gọi. */
export async function kiemPhien(db, token, u) {
  const p = await Kho.phien(db, token);
  if (!p) return null;
  if (Number(p.exp || 0) < Date.now()) return null;
  /* Tên máy khách gửi lên phải khớp phiên — chặn dùng token của người khác. */
  if (u && String(u).toLowerCase() !== String(p.username || '').toLowerCase()) return null;

  const hoSo = {u: p.username, role: p.role, tier: 0, khoa: false,
    phaiDoiMk: false, uid: p.uid, token: token};

  const nd = await Kho.nguoiTheoId(db, p.uid);
  if (!nd || !Number(nd.active) || nd.deletedAt) { hoSo.khoa = true; return hoSo; }

  /* Mật khẩu tạm chưa đổi: vẫn đăng nhập và đổi mật khẩu được, nhưng
     KHÔNG mở được kho — mật khẩu do máy sinh ra và đã đi qua log, qua
     email, nên không được phép là chìa mở tài sản của Học viện. */
  if (Number(nd.mustChangePw)) hoSo.phaiDoiMk = true;
  if (nd.role !== p.role) hoSo.role = nd.role;   /* vai đổi sau khi mở phiên */
  /* maKhachHang trong PHIÊN (9.99.114) — để cửa dữ liệu-con áp phân quyền
     CẤP-VẬT: một phụ huynh chỉ thao tác được trên gia đình CỦA MÌNH. Trước
     đây chỉ có ở đáp ứng đăng nhập, không có ở phiên, nên cửa ghiDongY/
     docDongY/yeuCauXoaDuLieu nhận maNha từ thân yêu cầu mà không đối chiếu
     — IDOR, tổ thanh tra $500M chứng minh bằng CHẠY THẬT. */
  hoSo.maKhachHang = nd.maKhachHang || '';
  hoSo.portal = nd.portal || hoSo.portal;

  const hv = await Kho.hocVienCuaCha(db, p.uid);
  if (hv) { hoSo.tier = Number(hv.tier || 0); hoSo.studentId = hv.id; }
  return hoSo;
}

/* ═══════════════ MẬT KHẨU MẠNH YẾU — MỘT LUẬT, MỘT CHỖ ═══════════════

   Luật này phải nằm ở ĐÚNG MỘT CHỖ. Nền cũ có hai bản: cửa đổi mật khẩu
   gọi checkPwStrength_, còn cửa kích hoạt tài khoản mới chỉ đòi đủ mười
   ký tự — nên '1234567890' MỞ ĐƯỢC một tài khoản mới trong khi chính
   chuỗi ấy bị từ chối lúc đổi. Chặt ở cửa sau, hở ở cửa trước, và cửa
   trước mới là chỗ người lạ đi vào.

/* Mật khẩu dễ đoán thì chặn NGAY LẦN ĐẦU, không đợi tới lúc bị dò.
   Danh sách ngắn có chủ ý: nó chặn những chuỗi người ta gõ khi muốn cho
   xong, không cố làm thay việc của một bộ đo độ mạnh. */
const DE_DOAN = ['123456', '12345678', 'password', 'matkhau', 'qwerty',
  'gita365', 'abc123', '111111', '000000', 'admin'];
export function mkQuaDeDoan(mk, nd) {
  if (mk.length < 10) return 'Mật khẩu phải từ 10 ký tự trở lên.';
  const t = mk.toLowerCase();
  if (DE_DOAN.some(x => t.includes(x))) return 'Mật khẩu này quá dễ đoán. Chọn chuỗi khác.';
  const ten = String(nd.username || '').toLowerCase().split('@')[0];
  if (ten && ten.length >= 4 && t.includes(ten))
    return 'Mật khẩu không được chứa tên đăng nhập.';
  return '';
}
