/* ═══════════════════════════════════════════════════════════════
   GITA 365 · CỬA VÀO MỚI — NỐI SỔ KẾ TOÁN VỚI TÀI KHOẢN NGÂN HÀNG
                             VÀ THÔNG BÁO TRONG HỆ

   Chủ hệ thống chốt bản 9.98: "Liên kết hệ thống kế toán với tài khoản
   ngân hàng và email thông báo, đồng thời có thông báo lên hệ thống
   giám đốc, Super Admin."

   ══ VÌ SAO ĐÂY LÀ LỚP KIỂM SOÁT KHÁC HẲN MỌI LỚP TRƯỚC ══

   Tới bản 9.97, mọi con số thu đều do NGƯỜI TRONG HỆ nói ra: một người
   ghi phiếu, một người khác duyệt. Hai lớp ấy chặn được nhầm lẫn, và
   chặn được một người làm sai một mình.

   Nhưng chúng KHÔNG chặn được hai người cùng nói một câu không đúng —
   vì cả hai đều ở trong hệ, và hệ chỉ biết những gì người trong hệ kể
   cho nó.

   Sao kê ngân hàng là thứ DUY NHẤT trong cả kiến trúc này đứng NGOÀI.
   Ngân hàng không biết Học viện muốn sổ trông thế nào, và không ai
   trong Học viện sửa được lời của nó. Đối chiếu với nó là phép kiểm
   duy nhất mà người bên trong không tự viết ra được.

   Đó là chỗ câu "kiểm soát 100% dòng chảy tài chính" đi từ mong muốn
   thành đo được.

   ══ HAI ĐƯỜNG VÀO, MỘT CÁI CỬA ══

     webhook  — ngân hàng hoặc cổng thanh toán đẩy sang, có khoá riêng
     nhập tay — người của phòng tài chính gõ lại từ sao kê

   Đường nhập tay KHÔNG phải đường tạm. Nhiều ngân hàng Việt Nam không
   có webhook, và một hệ chỉ chạy được khi có webhook là một hệ không
   chạy được ở phần lớn nơi nó cần chạy. Nhưng dòng nhập tay ghi rõ
   NGUỒN và AI NHẬP, vì lời của người trong hệ thì không còn là lời của
   người ngoài — và bản đối chiếu phải nói được sự khác nhau ấy.

   ══ KHÔNG BAO GIỜ SỬA MỘT DÒNG ĐÃ NHẬN ══

   Dòng ngân hàng đưa sang là lời của người ngoài. Sửa nó là bỏ mất
   chính cái làm nó có giá trị. Khớp hay chưa khớp ghi ở cột riêng.
   ═══════════════════════════════════════════════════════════════ */

import { Kho, tokenMoi, soSanhAnToan } from './nen.js';
import { dungKy } from './bao-cao.js';
import { quyenCua, oDauTien } from './chi-tieu.js';
import { mayDangTin } from './tin-tai-chinh.js';

const BAC = {R01:1,R02:2,R03:3,R04:4,R05:5,R06:6,R07:7,R08:8,
             R09:9,R10:10,R11:11,R12:12,R13:13,R14:14,R15:15};

const dinhDang = n => Number(n).toLocaleString('vi-VN') + 'đ';

/* ═══════════════════════════════════════════════════════════════
   THÔNG BÁO TRONG HỆ

   Thư điện tử đi ra NGOÀI — qua nhà gửi thư, qua Google, nằm lại trong
   hộp thư và bản sao lưu của họ. Thông báo trong hệ ở LẠI TRONG hệ,
   dưới khoá của Học viện.

   Hai đường, hai việc: thư để biết khi không mở máy; thông báo trong
   hệ để làm việc, và để chở được những thứ không được phép rời hệ.
   ═══════════════════════════════════════════════════════════════ */

const MUC_DO = ['tin', 'canXem', 'gap'];

export async function ghiThongBao(db, {denVai, denAi, loai, mucDo, tieuDe,
                                       than, doiTuong}) {
  const id = 'TB-' + tokenMoi().slice(0, 14);
  await db.prepare(
    'INSERT INTO thongBao (id,denVai,denAi,loai,mucDo,tieuDe,than,doiTuong,luc) ' +
    'VALUES (?,?,?,?,?,?,?,?,?)'
  ).bind(id, denVai || null, denAi || null, loai,
    MUC_DO.indexOf(mucDo) >= 0 ? mucDo : 'tin',
    String(tieuDe).slice(0, 200), String(than).slice(0, 2000),
    doiTuong || null, new Date().toISOString()).run();
  return id;
}

/** Báo lên Giám đốc VÀ Super Admin cùng một lúc — chốt của chủ hệ.

    Hai dòng riêng chứ không một dòng gửi cho "cấp trên": mỗi người đọc
    và đánh dấu đã đọc độc lập, nên một người đọc rồi không làm người
    kia thôi thấy. Gộp một dòng là dựng ra chuyện người này tưởng người
    kia đã xử lý. */
export async function baoLenCapCao(db, tin) {
  const a = await ghiThongBao(db, {...tin, denVai: 'R03'});
  const b = await ghiThongBao(db, {...tin, denVai: 'R01'});
  return [a, b];
}

export async function hopThongBao(y, env, db, hoSo) {
  const chuaDoc = y.chuaDoc !== false;
  const r = await db.prepare(
    'SELECT * FROM thongBao WHERE (denVai = ? OR denAi = ?) ' +
    (chuaDoc ? 'AND docLuc IS NULL ' : '') +
    'ORDER BY luc DESC LIMIT 200'
  ).bind(hoSo.role, hoSo.u).all();
  const ds = r.results || [];
  return {ok: true, so: ds.length,
    soGap: ds.filter(x => x.mucDo === 'gap' && !x.docLuc).length,
    ds: ds.map(x => ({id: x.id, loai: x.loai, mucDo: x.mucDo, tieuDe: x.tieuDe,
      than: x.than, doiTuong: x.doiTuong || undefined, luc: x.luc,
      daDoc: !!x.docLuc}))};
}

export async function danhDauDaDoc(y, env, db, hoSo) {
  const r = await db.prepare(
    'UPDATE thongBao SET docLuc = ?, docBoi = ? ' +
    'WHERE id = ? AND (denVai = ? OR denAi = ?) AND docLuc IS NULL'
  ).bind(new Date().toISOString(), hoSo.u, String(y.id || ''), hoSo.role, hoSo.u).run();
  const n = (r && r.meta && r.meta.changes) || 0;
  return n ? {ok: true} : {ok: false, error: 'Không có thông báo ấy đang chờ bạn đọc.'};
}

/* ═══════════════════════════════════════════════════════════════
   NHẬN MỘT GIAO DỊCH TỪ NGÂN HÀNG

   ══ CỬA NÀY KHÔNG DÙNG PHIÊN ĐĂNG NHẬP ══

   Ngân hàng không đăng nhập được vào hệ. Nên cửa này xác thực bằng một
   KHOÁ RIÊNG, và khoá ấy chỉ mở đúng một việc: đẩy một dòng sao kê vào.
   Nó không mở được bất kỳ cửa nào khác.

   So khoá bằng soSanhAnToan chứ không bằng dấu bằng: phép so thường
   dừng ở ký tự đầu tiên khác nhau, nên thời gian nó chạy nói ra khoá
   đúng dài bao nhiêu và giống tới đâu.
   ═══════════════════════════════════════════════════════════════ */
export async function nganHangBao(y, env, db) {
  const khoa = String(env.GITA_KHOA_NGANHANG || '');
  if (!khoa) return {ok: false, error: 'Máy chủ chưa được nạp khoá ngân hàng.'};
  if (!soSanhAnToan(String(y.khoa || ''), khoa))
    return {ok: false, code: 'AUTH', error: 'Khoá không đúng.'};

  const g = y.giaoDich || {};
  const stk = String(g.soTaiKhoan || '').trim();
  const ma = String(g.maGiaoDich || '').trim();
  const tien = Number(g.soTien || 0);
  const huong = String(g.huong || '').trim();

  if (!stk || !ma) return {ok: false, error: 'Thiếu số tài khoản hoặc mã giao dịch.'};
  if (!(tien > 0)) return {ok: false, error: 'Số tiền phải lớn hơn 0.'};
  if (huong !== 'vao' && huong !== 'ra')
    return {ok: false, error: 'Hướng phải là vao hoặc ra.'};

  const luc = String(g.luc || '').trim() || new Date().toISOString();
  if (isNaN(new Date(luc).getTime()))
    return {ok: false, error: 'Mốc giao dịch không đọc được.'};

  const id = 'NH-' + tokenMoi().slice(0, 14);
  try {
    await db.prepare(
      'INSERT INTO giaoDichNganHang (id,soTaiKhoan,maGiaoDich,huong,soTien,noiDung,' +
      "luc,nhanLuc,nguon) VALUES (?,?,?,?,?,?,?,?,'webhook')"
    ).bind(id, stk, ma, huong, tien,
      String(g.noiDung || '').slice(0, 500) || null, luc,
      new Date().toISOString()).run();
  } catch (e) {
    /* GỬI LẠI CÙNG MỘT GIAO DỊCH LÀ CHUYỆN THƯỜNG — webhook thử lại,
       nổ hai lần, mạng đứt giữa chừng. Trả về ok để ngân hàng thôi thử
       lại, nhưng nói rõ đã có rồi: báo lỗi ở đây thì ngân hàng thử mãi,
       còn ghi thêm một dòng thì sổ có một khoản tiền chưa từng có. */
    if (/giaoDichNganHang/.test(String(e && e.message || e)))
      return {ok: true, daCo: true, vi: 'Giao dịch này đã nhận trước đó.'};
    throw e;
  }

  /* Tự tìm phiếu thu khớp ngay lúc nhận. Khớp được thì sổ và ngân hàng
     đứng cạnh nhau từ đầu; không khớp thì nó nằm trong danh sách chờ,
     và danh sách ấy chính là bản đối chiếu. */
  const khop = huong === 'vao' ? await tuKhopPhieuThu(db, {id, ma, tien, luc}) : null;
  if (huong === 'vao' && !khop)
    await baoTienChuaCoPhieu(db, {id, ma, tien, luc, noiDung: g.noiDung});

  return {ok: true, id, daKhop: !!khop, idPhieuThu: khop || undefined};
}

/** Nhập tay một dòng sao kê. Người của phòng tài chính, đầu THU. */
export async function nhapGiaoDichTay(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  const q = await quyenCua(db, hoSo.u);
  if (lv > 3 && !oDauTien(q, 'thu'))
    return {ok: false, code: 'NOPERM',
      error: 'Nhập sao kê cần vai R01–R03, hoặc vị trí Kế toán thu / Kế toán trưởng.'};

  const g = y.giaoDich || {};
  const stk = String(g.soTaiKhoan || '').trim();
  const ma = String(g.maGiaoDich || '').trim();
  const tien = Number(g.soTien || 0);
  const huong = String(g.huong || '').trim();
  if (!stk || !ma) return {ok: false, error: 'Thiếu số tài khoản hoặc mã giao dịch.'};
  if (!(tien > 0)) return {ok: false, error: 'Số tiền phải lớn hơn 0.'};
  if (huong !== 'vao' && huong !== 'ra')
    return {ok: false, error: 'Hướng phải là vao hoặc ra.'};

  const luc = String(g.luc || '').trim() || new Date().toISOString();
  const id = 'NH-' + tokenMoi().slice(0, 14);
  try {
    await db.prepare(
      'INSERT INTO giaoDichNganHang (id,soTaiKhoan,maGiaoDich,huong,soTien,noiDung,' +
      "luc,nhanLuc,nguon,nguoiNhap) VALUES (?,?,?,?,?,?,?,?,'nhapTay',?)"
    ).bind(id, stk, ma, huong, tien,
      String(g.noiDung || '').slice(0, 500) || null, luc,
      new Date().toISOString(), hoSo.u).run();
  } catch (e) {
    if (/giaoDichNganHang/.test(String(e && e.message || e)))
      return {ok: false, code: 'DACO', error: 'Giao dịch này đã có trong sổ.'};
    throw e;
  }

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'NGANHANG_NHAPTAY',
    doiTuong: id, chiTiet: huong + ' · ' + dinhDang(tien) + ' · ' + ma});
  const khop = huong === 'vao' ? await tuKhopPhieuThu(db, {id, ma, tien, luc}) : null;
  if (huong === 'vao' && !khop)
    await baoTienChuaCoPhieu(db, {id, ma, tien, luc, noiDung: g.noiDung});
  return {ok: true, id, daKhop: !!khop, idPhieuThu: khop || undefined};
}

/* ── TỰ KHỚP: CHỈ KHỚP KHI CHẮC, KHÔNG ĐOÁN ──

   Khớp bằng MÃ THAM CHIẾU trước — đó là chỗ duy nhất chắc chắn, vì
   người ghi phiếu chép đúng mã giao dịch ngân hàng.

   Nếu không có mã thì KHÔNG tự khớp theo số tiền. Hai nhà cùng đóng
   500.000đ trong một ngày là chuyện thường, và khớp nhầm hai khoản ấy
   là ghi tiền của nhà này vào nợ của nhà kia — một cái sai không ai
   nhìn ra vì tổng vẫn đúng.

   Người khớp tay thì thấy được cả hai dòng và biết mình đang chọn gì;
   máy khớp theo số tiền thì không. */
/* ── TIỀN VÀO MÀ KHÔNG KHỚP ĐƯỢC PHIẾU NÀO → LÊN BẢNG TIN ──

   Bản đối chiếu đã nêu chỗ này rồi, nhưng bản đối chiếu là thứ người ta
   MỞ RA XEM. Một nhà đã trả tiền mà sổ ghi họ còn nợ thì mỗi ngày chờ
   là một ngày họ nhận giấy nhắc nợ sai — nên nó phải TỰ ĐI TÌM người,
   chứ không nằm đợi ai đó nhớ mở bản đối chiếu.

   Mức CAM chứ không ĐỎ: tiền đã nằm trong tài khoản học viện, không mất
   đi đâu. Cái mất là lòng khách, và cái ấy mất theo ngày chứ không theo
   giờ. Để ĐỎ ở đây thì mỗi tháng vài chục tin đỏ, và ĐỎ hết nghĩa. */
async function baoTienChuaCoPhieu(db, {id, ma, tien, luc, noiDung}) {
  return await mayDangTin(db, {
    mucDo: 'cam', loai: 'NH_TIEN_KHONG_PHIEU', dau: 'thu', doiTuong: id,
    tieuDe: 'Tiền vào ' + dinhDang(tien) + ' chưa khớp được phiếu thu nào',
    than: [
      'Ngân hàng báo có một khoản tiền vào mà sổ không tìm ra phiếu thu nào khớp.',
      '',
      'Mã giao dịch : ' + (ma || '(không có)'),
      'Số tiền      : ' + dinhDang(tien),
      'Lúc          : ' + luc,
      'Nội dung     : ' + (noiDung || '(trống)'),
      '',
      'Nhà nào đó có thể đang bị ghi là còn nợ trong khi họ đã trả. Tìm phiếu thu',
      'tương ứng rồi khớp tay ở mục Đối chiếu — máy KHÔNG tự khớp theo số tiền,',
      'vì hai nhà cùng đóng một số tiền trong một ngày là chuyện thường.'
    ].join('\n')});
}

async function tuKhopPhieuThu(db, {id, ma, tien}) {
  if (!ma) return null;
  const pt = await db.prepare(
    "SELECT id FROM phieuThu WHERE maThamChieu = ? AND trangThai <> 'huy' " +
    'AND id NOT IN (SELECT idPhieuThu FROM giaoDichNganHang WHERE idPhieuThu IS NOT NULL) ' +
    'AND soTien = ? LIMIT 1'
  ).bind(ma, tien).first();
  if (!pt) return null;
  await db.prepare(
    'UPDATE giaoDichNganHang SET idPhieuThu = ?, khopLuc = ?, khopBoi = ? WHERE id = ?'
  ).bind(pt.id, new Date().toISOString(), 'may', id).run();
  return pt.id;
}

/* ═══════════════════════════════════════════════════════════════
   ĐỐI CHIẾU NGÂN HÀNG — HAI PHÍA, HAI CÂU CHUYỆN KHÁC NHAU

   Bản này KHÔNG trả về một con số "khớp/không khớp". Nó trả về hai
   danh sách, và hai danh sách ấy nói hai chuyện khác hẳn nhau:

     TIỀN VÀO NGÂN HÀNG MÀ KHÔNG CÓ PHIẾU
       — Học viện đã nhận tiền mà sổ không biết. Nhà nào đó đang bị ghi
         là còn nợ trong khi họ đã trả. Đây là chỗ mất lòng khách.

     PHIẾU MÀ KHÔNG CÓ TIỀN VÀO NGÂN HÀNG
       — sổ nói đã thu mà tài khoản không thấy. Có thể là tiền mặt chưa
         nộp, có thể là một phiếu ghi nhầm, và có thể là một phiếu
         không có thật. Đây là chỗ mất tiền.

   Gộp hai cái vào một con số lệch là bỏ mất đúng phần nói cho người
   đọc biết phải đi làm gì.
   ═══════════════════════════════════════════════════════════════ */
export async function doiChieuNganHang(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  const q = await quyenCua(db, hoSo.u);
  if (lv > 3 && !oDauTien(q, 'thu'))
    return {ok: false, code: 'NOPERM',
      error: 'Đối chiếu ngân hàng cần vai R01–R03, hoặc vị trí Kế toán thu / ' +
             'Kế toán trưởng.'};

  const k = dungKy(String(y.loai || 'thang'),
    String(y.moc || new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10)));
  if (!k) return {ok: false, error: 'Kỳ đối chiếu không hợp lệ.'};

  const vaoChuaKhop = await db.prepare(
    "SELECT id, maGiaoDich, soTien, noiDung, luc, nguon FROM giaoDichNganHang " +
    "WHERE huong = 'vao' AND idPhieuThu IS NULL AND luc >= ? AND luc <= ? " +
    'ORDER BY luc LIMIT 200'
  ).bind(k.tuLuc, k.denLuc).all();

  /* Chỉ soi phiếu CHUYỂN KHOẢN: tiền mặt và thẻ không đi qua tài khoản
     này nên không có gì để đối chiếu, và kê chúng vào đây là làm ngập
     bản đối chiếu bằng những dòng không bao giờ khớp được. */
  const phieuChuaKhop = await db.prepare(
    "SELECT p.id, p.maKhachHang, p.soTien, p.maThamChieu, p.ghiLuc, p.trangThai " +
    'FROM phieuThu p WHERE p.hinhThuc = ' + "'chuyenKhoan' " +
    "AND p.trangThai <> 'huy' AND p.ghiLuc >= ? AND p.ghiLuc <= ? " +
    'AND p.id NOT IN (SELECT idPhieuThu FROM giaoDichNganHang ' +
    '  WHERE idPhieuThu IS NOT NULL) ORDER BY p.ghiLuc LIMIT 200'
  ).bind(k.tuLuc, k.denLuc).all();

  const tong = await db.prepare(
    'SELECT COUNT(*) so, COALESCE(SUM(soTien),0) tien, ' +
    '  SUM(CASE WHEN idPhieuThu IS NOT NULL THEN 1 ELSE 0 END) daKhop, ' +
    "  SUM(CASE WHEN nguon = 'nhapTay' THEN 1 ELSE 0 END) nhapTay " +
    "FROM giaoDichNganHang WHERE huong = 'vao' AND luc >= ? AND luc <= ?"
  ).bind(k.tuLuc, k.denLuc).first();

  /* ── CHIỀU RA · TIỀN RỜI HỆ CŨNG PHẢI CÓ MỎ NEO NGOÀI (9.99.112) ──
     Bản đầu chỉ soi huong='vao'. Ở chiều RA — nơi tiền thật đi mất — không
     neo ngoài nào: một khoản chi/hoàn/hoa hồng bịa (đủ chữ ký hai người
     thông đồng) vào sổ mà KHÔNG BAO GIỜ bị đối chiếu với một dòng tiền ra
     thật của ngân hàng. Cột idChiPhi đã có sẵn trong lược đồ nhưng chưa
     cửa nào soi. Nay nêu HAI phía tiền ra (PH-2 tổ thanh tra vòng đời).
     Giữ `khop` = chiều VÀO như cũ để không đổi nghĩa với nơi gọi; chiều RA
     báo riêng qua `khopRa`. (Cửa gán khopChi là việc tiếp — xem sổ chờ.) */
  const raChuaKhop = await db.prepare(
    "SELECT id, maGiaoDich, soTien, noiDung, luc, nguon FROM giaoDichNganHang " +
    "WHERE huong = 'ra' AND idChiPhi IS NULL AND luc >= ? AND luc <= ? " +
    'ORDER BY luc LIMIT 200'
  ).bind(k.tuLuc, k.denLuc).all();
  /* substr HAI PHÍA (9.99.113) — bản 9.99.112 so `ngayChi` (ISO đầy đủ)
     với bound đã cắt còn ngày: `'2026-09-30T08:00' <= '2026-09-30'` là
     FALSE, nên MỌI khoản chi ngày cuối kỳ bị rớt, và ngày đầu kỳ trước
     lọt sang. Một khoản chi bịa đề ngày cuối tháng né đúng cửa này. Cắt
     cả hai vế về ngày để so đối xứng, đúng bất kể ngayChi là ngày-trần
     hay ISO đầy đủ. Tổ thanh tra tài chính đợt 3. */
  /* BA KÊNH TIỀN RA, KHÔNG CHỈ chiPhi (9.99.114) — tổ thanh tra $500M:
     bản 9.99.112 chỉ union chiPhi, nên một khoản HOÀN hay HOA HỒNG bịa
     (một chữ ký, không qua thang nấc) KHÔNG BAO GIỜ hiện trong
     chiKhongCoTienRa — vô hình với đúng phép kiểm mà người bên trong không
     tự viết ra được. Nay union cả ba: chiPhi(daDuyet) · hoanTien(daDuyet) ·
     hoaHongTra(daTra). Tất cả neo ngoài qua idChiPhi (id duy nhất, dùng
     chung cho mọi kênh ra). Khớp chi-side là việc tiếp (sổ chờ), nên tới
     lúc có cửa khớp thì mọi khoản ra hiện ở đây — đúng trạng thái thật, và
     nhất quán với chiPhi vốn cũng chưa có cửa khớp. */
  const NOTIN = 'AND id NOT IN (SELECT idChiPhi FROM giaoDichNganHang WHERE idChiPhi IS NOT NULL)';
  const chiChuaKhop = await db.prepare(
    "SELECT id, khoanMuc, soTien, substr(ngayChi,1,10) ngay, 'chiPhi' loai FROM chiPhi " +
    "WHERE trangThai = 'daDuyet' AND substr(ngayChi,1,10) >= substr(?,1,10) " +
    "AND substr(ngayChi,1,10) <= substr(?,1,10) " + NOTIN +
    " UNION ALL " +
    "SELECT id, 'hoàn tiền' khoanMuc, soTien, substr(duyetLuc,1,10) ngay, 'hoanTien' loai FROM hoanTien " +
    "WHERE trangThai = 'daDuyet' AND substr(duyetLuc,1,10) >= substr(?,1,10) " +
    "AND substr(duyetLuc,1,10) <= substr(?,1,10) " + NOTIN +
    " UNION ALL " +
    "SELECT id, 'hoa hồng' khoanMuc, soTien, substr(traLuc,1,10) ngay, 'hoaHongTra' loai FROM hoaHongTra " +
    "WHERE trangThai = 'daTra' AND substr(traLuc,1,10) >= substr(?,1,10) " +
    "AND substr(traLuc,1,10) <= substr(?,1,10) " + NOTIN +
    ' ORDER BY ngay LIMIT 200'
  ).bind(k.tuLuc, k.denLuc, k.tuLuc, k.denLuc, k.tuLuc, k.denLuc).all();
  const tienRa = (raChuaKhop.results || []).map(x => ({
    id: x.id, maGiaoDich: x.maGiaoDich, soTien: Number(x.soTien),
    noiDung: x.noiDung || undefined, luc: x.luc, nguon: x.nguon}));
  const chiRa = (chiChuaKhop.results || []).map(x => ({
    id: x.id, khoanMuc: x.khoanMuc, soTien: Number(x.soTien),
    ngayChi: x.ngay, loai: x.loai}));

  const vao = (vaoChuaKhop.results || []).map(x => ({
    id: x.id, maGiaoDich: x.maGiaoDich, soTien: Number(x.soTien),
    noiDung: x.noiDung || undefined, luc: x.luc, nguon: x.nguon}));
  const phieu = (phieuChuaKhop.results || []).map(x => ({
    id: x.id, maKhachHang: x.maKhachHang, soTien: Number(x.soTien),
    maThamChieu: x.maThamChieu || undefined, ghiLuc: x.ghiLuc,
    trangThai: x.trangThai}));

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'NGANHANG_DOICHIEU',
    doiTuong: k.ky, chiTiet: vao.length + ' tiền vào chưa có phiếu · ' +
      phieu.length + ' phiếu chưa có tiền vào'});

  return {ok: true, ky: k.ky, loai: k.loai, tuNgay: k.tuNgay, denNgay: k.denNgay,
    tongTienVao: {so: Number(tong.so), tien: Number(tong.tien),
      daKhop: Number(tong.daKhop), tuNhapTay: Number(tong.nhapTay)},
    khop: vao.length === 0 && phieu.length === 0,

    tienVaoKhongCoPhieu: {
      so: vao.length, tien: vao.reduce((a, x) => a + x.soTien, 0), ds: vao,
      vi: 'Học viện ĐÃ NHẬN tiền mà sổ không biết. Nhà nào đó đang bị ghi là còn ' +
          'nợ trong khi họ đã trả — đây là chỗ mất lòng khách.'},

    phieuKhongCoTienVao: {
      so: phieu.length, tien: phieu.reduce((a, x) => a + x.soTien, 0), ds: phieu,
      vi: 'Sổ nói ĐÃ THU mà tài khoản không thấy. Có thể là phiếu ghi nhầm, và có ' +
          'thể là một phiếu không có thật — đây là chỗ mất tiền.'},

    khopRa: tienRa.length === 0 && chiRa.length === 0,
    tienRaKhongCoChungTu: {
      so: tienRa.length, tien: tienRa.reduce((a, x) => a + x.soTien, 0), ds: tienRa,
      vi: 'Tài khoản ĐÃ CHI mà sổ không có chứng từ — một dòng tiền ra thật không ai ' +
          'giải trình được.'},
    chiKhongCoTienRa: {
      so: chiRa.length, tien: chiRa.reduce((a, x) => a + x.soTien, 0), ds: chiRa,
      vi: 'Sổ nói ĐÃ CHI mà tài khoản không thấy tiền ra — có thể là chi ghi nhầm, ' +
          'và có thể là một khoản chi bịa của hai người thông đồng. Đây là chỗ mất ' +
          'tiền mà bản đối chiếu cũ HOÀN TOÀN không thấy vì chỉ soi chiều vào.'},

    vi: 'Sao kê ngân hàng là thứ DUY NHẤT trong hệ này đứng NGOÀI. Hai lớp người ' +
        'ghi và người duyệt chặn được một người làm sai một mình, nhưng không chặn ' +
        'được hai người cùng nói một câu không đúng — vì cả hai đều ở trong hệ. ' +
        'Chỉ ngân hàng không biết Học viện muốn sổ trông thế nào.'};
}

/** Khớp tay một dòng ngân hàng với một phiếu thu. */
export async function khopGiaoDich(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  const q = await quyenCua(db, hoSo.u);
  if (lv > 3 && !oDauTien(q, 'thu'))
    return {ok: false, code: 'NOPERM', error: 'Khớp giao dịch cần đầu THU của phòng tài chính.'};

  const gd = await db.prepare('SELECT * FROM giaoDichNganHang WHERE id = ?')
    .bind(String(y.id || '')).first();
  if (!gd) return {ok: false, error: 'Không tìm thấy giao dịch ngân hàng này.'};
  if (gd.idPhieuThu) return {ok: false, error: 'Giao dịch này đã khớp với một phiếu rồi.'};

  const pt = await db.prepare('SELECT * FROM phieuThu WHERE id = ?')
    .bind(String(y.idPhieuThu || '')).first();
  if (!pt) return {ok: false, error: 'Không tìm thấy phiếu thu này.'};

  /* SỐ TIỀN PHẢI BẰNG NHAU. Cho khớp hai số khác nhau là mở đúng cái
     cửa mà phép đối chiếu sinh ra để đóng: một khoản 500.000đ khớp với
     một phiếu 5.000.000đ thì cả hai biến khỏi danh sách chờ, và chênh
     lệch bốn triệu rưỡi không còn dòng nào mang nó. */
  if (Number(gd.soTien) !== Number(pt.soTien))
    return {ok: false, code: 'LECHTIEN',
      error: 'Ngân hàng ghi ' + dinhDang(gd.soTien) + ' còn phiếu ghi ' +
        dinhDang(pt.soTien) + '. Hai số phải bằng nhau; lệch thì tách phiếu trước.'};

  const r = await db.prepare(
    'UPDATE giaoDichNganHang SET idPhieuThu = ?, khopLuc = ?, khopBoi = ? ' +
    'WHERE id = ? AND idPhieuThu IS NULL'
  ).bind(pt.id, new Date().toISOString(), hoSo.u, gd.id).run();
  if (!((r && r.meta && r.meta.changes) || 0))
    return {ok: false, error: 'Giao dịch này vừa được khớp bởi một lượt khác.'};

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'NGANHANG_KHOP',
    doiTuong: gd.id, chiTiet: 'với phiếu ' + pt.id + ' · ' + dinhDang(gd.soTien)});
  return {ok: true, idPhieuThu: pt.id};
}
