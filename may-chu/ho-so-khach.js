/* ═══════════════════════════════════════════════════════════════
   GITA 365 · CỬA VÀO MỚI — TỆP KHÁCH HÀNG CHUẨN

   ══ VÌ SAO CẦN MỘT BẢNG RIÊNG ══

   Tới bản 9.87, dữ liệu một nhà nằm rải ở bốn chỗ: tài khoản phụ huynh
   ở users, hồ sơ con ở students, ruột hồ sơ ở kho tệp, lượt đăng ký ở
   dangKyCho. Không chỗ nào trả lời được câu đơn giản nhất của người
   làm nghề:

     "Nhà này vào từ bao giờ, ai tư vấn, ai kèm, đang ở tầng mấy, đã
      đóng tới đâu, còn nợ gì."

   Câu ấy hôm nay trả lời được bằng trí nhớ của người phụ trách. Một
   trăm nhà thì trí nhớ còn đủ; mười nghìn nhà thì không.

   ══ CHỖ TRỎ, KHÔNG CHÉP LẠI ══

   Tên phụ huynh nằm ở users, tên con nằm ở students. Ở đây chỉ giữ
   chỗ trỏ. Chép lại là dựng bản thứ hai của một sự thật, và hai bản
   thì sẽ có ngày lệch nhau — lúc ấy màn hình in một tên, hợp đồng in
   một tên khác, và không ai nói được bản nào đúng.

   Cái bảng này THÊM vào là những thứ chưa ở đâu có: ai tư vấn, ai bảo
   trợ, băng màu, trạng thái hợp đồng, ngày vào — và một sổ lịch sử
   tầng, vì "nhà này lên tầng ba lúc nào, ai duyệt" là câu hỏi hằng
   tuần mà hôm nay không có chỗ nào ghi.
   ═══════════════════════════════════════════════════════════════ */

import { Kho, tokenMoi } from './nen.js';
import { dungLichThu } from './tai-chinh.js';

const BAC = {R01:1,R02:2,R03:3,R04:4,R05:5,R06:6,R07:7,R08:8,
             R09:9,R10:10,R11:11,R12:12,R13:13,R14:14,R15:15};

/* Vai đọc được tệp khách hàng. Quản lý (R01–R04), tuyến Coach
   (R05–R07) và Tư vấn (R11). KHÔNG có Giáo viên R08, Mentor R09,
   Chuyên gia đánh giá R10, Phân tích dữ liệu R12 — và không có vị trí
   nào của phòng tài chính. */
const VAI_XEM_TEP = ['R01', 'R02', 'R03', 'R04', 'R05', 'R06', 'R07', 'R11'];

const BANG = ['XANH', 'VANG', 'DO', 'XAM'];
const TRANG_THAI = ['dangHoc', 'tamDung', 'nghi', 'xong'];

/** Dựng tệp khách hàng lúc kích hoạt tài khoản. Gọi từ dang-ky.js.

    Dùng INSERT ... ON CONFLICT DO NOTHING: kích hoạt hai lần cho cùng
    một mã là chuyện chỉ xảy ra khi có lỗi khác, và lúc ấy KHÔNG được
    ghi đè tệp đang có — nó có thể đã mang tên coach, tên tư vấn và cả
    lịch sử tầng. */
export async function moTepKhach(db, {maKhachHang, uidPhuHuynh, maHocVien, boTro, tuyen}) {
  const luc = new Date().toISOString();
  await db.prepare(
    'INSERT INTO hoSoKhach (maKhachHang,uidPhuHuynh,maHocVien,tuyen,tang,band,boTro,' +
    "trangThai,vaoLuc,suaLuc) VALUES (?,?,?,?,0,'XAM',?,'dangHoc',?,?) " +
    'ON CONFLICT(maKhachHang) DO NOTHING'
  ).bind(maKhachHang, uidPhuHuynh, maHocVien || null,
    String(tuyen || 'GITA365'), String(boTro || '').trim() || null, luc, luc).run();
  return maKhachHang;
}

/* ═══════════════ ĐỌC MỘT TỆP ═══════════════

   Gộp bốn nguồn thành một bản trả về, và mỗi nguồn đi qua đúng một
   chỉ mục. Nền cũ muốn có bản này thì phải đọc cả bốn bảng. */
export async function xemTepKhach(y, env, db, hoSo) {
  const nha = String(y.maKhachHang || '').trim();
  if (!nha) return {ok: false, error: 'Thiếu mã khách hàng.'};

  const lv = BAC[hoSo.role] || 99;
  const hs = await db.prepare('SELECT * FROM hoSoKhach WHERE maKhachHang = ?')
    .bind(nha).first();
  if (!hs) return {ok: false, error: 'Không tìm thấy tệp khách hàng này.'};

  /* AI ĐỌC ĐƯỢC TỆP NÀY — DANH SÁCH TRẮNG, KHÔNG PHẢI BẬC THANG.

     Tệp này mang tên nhà, tên con, TÊN PHỤ HUYNH và tình hình tiền nong.
     Gửi nhầm một tệp là gửi trọn cả bốn thứ ấy.

     ══ CHỖ NÀY TỪNG THỦNG, VÀ THỦNG ĐÚNG KIỂU ĐÃ ĐƯỢC CẢNH BÁO ══

     Tới bản 9.97 cổng này viết là `lv > 11`. Chú giải ngay trên nó thì
     nói "Giáo viên và các vai ngoài danh sách thì không" — nhưng
     Giáo viên là lv 8, Mentor lv 9, Chuyên gia đánh giá lv 10. Cả ba
     ĐỀU DƯỚI 11, nên cả ba đọc được mọi tệp khách hàng. Mã nói ngược
     lại chính chú giải của nó.

     Đây đúng lớp lỗi mà mục 72 của bộ kiểm đã ghi lại từ bản 9.46:
     "Bậc là một cái thang, luật này là một danh sách có lỗ thủng."
     Luật quyền xem hồ sơ khách ở quyen-xem.js đã dùng danh sách trắng
     vì đúng lý do ấy; tệp khách hàng dựng sau, ở 9.89, và tôi viết nó
     bằng bậc thang.

     Nay khai thẳng từng vai. Vai nào không có tên là không xem được,
     kể cả vai chưa tồn tại hôm nay — kê danh sách cấm thì mỗi vai mới
     sinh ra là mặc định nhìn thấy, và cái mặc định ấy không ai nhớ đi
     sửa.

     PHÒNG TÀI CHÍNH KHÔNG CÓ TÊN Ở ĐÂY, và đó là chủ ý: một kế toán ở
     đó để giữ tiền, không phải để đọc hồ sơ gia đình. Vị trí tài chính
     mở đúng những cửa tiền và không mở thêm một cửa dữ liệu khách nào. */
  if (VAI_XEM_TEP.indexOf(hoSo.role) < 0) {
    const nd = await Kho.nguoiTheoId(db, hoSo.uid);
    if (!nd || String(nd.maKhachHang || '') !== nha) {
      await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u,
        viec: 'TEPKHACH_TUCHOI', doiTuong: nha, chiTiet: hoSo.role});
      return {ok: false, code: 'NOPERM', error: 'Chỉ xem được tệp của chính nhà mình.'};
    }
  }

  const ph = await Kho.nguoiTheoId(db, hs.uidPhuHuynh);
  const hv = hs.maHocVien
    ? await db.prepare('SELECT * FROM students WHERE id = ?').bind(hs.maHocVien).first()
    : null;
  const ls = await db.prepare(
    'SELECT * FROM lichSuTang WHERE maKhachHang = ? ORDER BY luc DESC LIMIT 20'
  ).bind(nha).all();

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'TEPKHACH_XEM',
    doiTuong: nha});

  return {ok: true, tep: {
    maKhachHang: hs.maKhachHang, tuyen: hs.tuyen, tang: hs.tang,
    band: hs.band, coach: hs.coach, tuVan: hs.tuVan, boTro: hs.boTro,
    trangThai: hs.trangThai, vaoLuc: hs.vaoLuc, ghiChu: hs.ghiChu,
    /* Trỏ, không chép — xem chú giải đầu tệp. */
    phuHuynh: ph ? {hoTen: ph.hoTen, email: ph.email, dienThoai: ph.dienThoai} : null,
    hocVien: hv ? {id: hv.id, hoTen: hv.hoTen, lop: hv.lop, tinh: hv.tinh,
      tang: hv.tier, kpi: hv.kpi} : null,
    lichSuTang: (ls.results || [])
  }};
}

/* ═══════════════ SỬA MỘT TỆP ═══════════════

   Chỉ sửa được những trường của CHÍNH tệp này — coach, tư vấn, băng,
   trạng thái, ghi chú. TẦNG KHÔNG SỬA ĐƯỢC Ở ĐÂY: tầng đổi qua đường
   nangTang, nơi có cổng KPI và cổng thanh toán. Cho sửa tầng ở đây là
   dựng một cửa sau đi vòng qua cả hai cổng ấy. */
const SUA_DUOC = ['coach', 'tuVan', 'band', 'trangThai', 'ghiChu'];

export async function suaTepKhach(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 7) return {ok: false, error: 'Từ Coach trở lên mới sửa được tệp khách hàng.'};

  const nha = String(y.maKhachHang || '').trim();
  const hs = await db.prepare('SELECT * FROM hoSoKhach WHERE maKhachHang = ?')
    .bind(nha).first();
  if (!hs) return {ok: false, error: 'Không tìm thấy tệp khách hàng này.'};

  const sua = y.sua || {};
  const cot = [], gt = [], doi = [];
  for (const k of SUA_DUOC) {
    if (sua[k] === undefined) continue;
    let v = sua[k] === null ? null : String(sua[k]).slice(0, 500);
    if (k === 'band' && v && BANG.indexOf(v) < 0)
      return {ok: false, error: 'Băng phải là một trong: ' + BANG.join(', ') + '.'};
    if (k === 'trangThai' && v && TRANG_THAI.indexOf(v) < 0)
      return {ok: false, error: 'Trạng thái phải là một trong: ' + TRANG_THAI.join(', ') + '.'};
    cot.push(k + ' = ?'); gt.push(v);
    doi.push(k + ': ' + (hs[k] == null ? '(trống)' : hs[k]) + ' → ' + (v == null ? '(trống)' : v));
  }
  if (!cot.length) return {ok: false, error: 'Không có trường nào để sửa.'};

  /* Trường nào KHÔNG sửa được thì nói ra, đừng lặng lẽ bỏ qua: người
     bấm nút tưởng đã sửa xong và đi tiếp. */
  const chan = Object.keys(sua).filter(k => SUA_DUOC.indexOf(k) < 0);

  await db.prepare('UPDATE hoSoKhach SET ' + cot.join(', ') + ', suaLuc = ? WHERE maKhachHang = ?')
    .bind(...gt, new Date().toISOString(), nha).run();

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'TEPKHACH_SUA',
    doiTuong: nha, chiTiet: doi.join(' · ')});
  return {ok: true, daSua: cot.length,
    khongSuaDuoc: chan.length ? chan : undefined,
    vi: chan.length ? 'Tầng đổi qua đường nâng tầng, nơi có cổng KPI và cổng thanh toán.'
                    : undefined};
}

/* ═══════════════ DANH SÁCH TỆP THEO NGƯỜI PHỤ TRÁCH ═══════════════ */
export async function dsTepKhach(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (VAI_XEM_TEP.indexOf(hoSo.role) < 0) return {ok: false, code: 'NOPERM',
    error: 'Vai này không xem được danh sách khách hàng.'};

  /* Coach và Tư vấn thấy nhà CỦA MÌNH; từ R04 trở lên thấy cả hệ.
     Không có lớp này thì mỗi Coach đọc được sổ khách của mọi Coach. */
  const cuaMinh = lv >= 5;
  const loc = [], gt = [];
  if (cuaMinh) { loc.push('(coach = ? OR tuVan = ?)'); gt.push(hoSo.u, hoSo.u); }
  if (y.tang != null) { loc.push('tang = ?'); gt.push(Number(y.tang)); }
  if (y.trangThai) { loc.push('trangThai = ?'); gt.push(String(y.trangThai)); }

  const r = await db.prepare(
    'SELECT maKhachHang, tang, band, coach, tuVan, trangThai, vaoLuc FROM hoSoKhach' +
    (loc.length ? ' WHERE ' + loc.join(' AND ') : '') +
    ' ORDER BY vaoLuc DESC LIMIT 500'
  ).bind(...gt).all();

  return {ok: true, so: (r.results || []).length, ds: r.results || [],
    phamVi: cuaMinh ? 'nhà của chính mình' : 'cả hệ'};
}

/* ═══════════════ GHI MỘT LƯỢT ĐỔI TẦNG ═══════════════

   Gọi từ nangTang. Ghi vào lịch sử VÀ cập nhật tệp, và dựng luôn lịch
   thu của tầng mới — ba việc ấy đi cùng nhau, vì một nhà lên tầng mà
   không có lịch thu là một nhà học không có ai đòi tiền.

   ══ MỞ TỆP TRƯỚC KHI GHI, NẾU NHÀ NÀY CHƯA CÓ TỆP ══

   Tệp khách hàng mở lúc kích hoạt tài khoản (dang-ky.js). Nhưng tài
   khoản có TRƯỚC bảng này thì không đi qua đường ấy — mọi nhà chuyển
   từ nền Sheets sang đều có mã khách hàng mà không có tệp.

   Nâng tầng cho một nhà như thế thì UPDATE hoSoKhach đổi 0 dòng và
   lặng lẽ trôi qua, còn dungLichThu vẫn dựng đủ kỳ. Kết quả: công nợ
   treo cho một mã không tra được — đúng chỗ lệch DS-2 mà phép đối soát
   nêu ra. Phép đối soát bắt được nó ngay lần chạy đầu, ở dữ liệu thử.

   moTepKhach dùng ON CONFLICT DO NOTHING nên gọi thừa là vô hại; gọi
   thiếu thì mất dấu một nhà. */
export async function ghiDoiTang(db, {maKhachHang, tuTang, denTang, kpi, boi, lyDo,
                                     uidPhuHuynh, maHocVien}) {
  /* ══ L02 · KHÔNG TỤT CẤP ══  (9.99.74)

     Luật giao diện số 2 của MỤC C: *không mã nào giảm cấp hiện tại, kể
     cả sau mười hai tháng không hoạt động.*

     Tới 9.99.73 cổng ấy nằm ở `nangTang` — nó đòi `tangMoi === tier+1`.
     Nhưng HÀM NÀY nhận `denTang` tự do, và hôm nay nó chỉ có đúng một
     người gọi. Người gọi thứ hai viết sau — một lượt nhập liệu hàng
     loạt, một lượt sửa nhầm tay — hạ tầng một nhà mà không gì chặn, và
     lịch thu dựng lại theo tầng thấp hơn.

     Đặt cổng ở CHỖ GHI, không ở chỗ gọi: cổng ở chỗ gọi thì nó chỉ bảo
     vệ đúng người gọi ấy. Cùng cái bẫy đã ghi ở cổng ADN (9.99.56) và
     cổng ba cửa (9.99.69).

     Vì sao luật gắt đến thế: tụt cấp là lấy lại thứ người ta đã làm
     được. Một gia đình nghỉ ba tháng vì ốm đau, quay lại thấy mình mất
     sạch, thì họ không quay lại lần thứ hai. */
  if (tuTang != null && Number(denTang) < Number(tuTang)) {
    const e = new Error('Không hạ tầng được: nhà ' + maKhachHang + ' đang ở tầng ' +
      tuTang + ', lượt ghi này đòi xuống tầng ' + denTang + '. Luật L02 của bản ' +
      'đặc tả giao diện: không mã nào giảm cấp hiện tại, kể cả sau mười hai tháng ' +
      'không hoạt động. Tụt cấp là lấy lại thứ người ta đã làm được.');
    e.code = 'HATANG';
    throw e;
  }

  const luc = new Date().toISOString();

  if (uidPhuHuynh) {
    await moTepKhach(db, {maKhachHang, uidPhuHuynh, maHocVien});
  } else {
    const co = await db.prepare('SELECT 1 FROM hoSoKhach WHERE maKhachHang = ?')
      .bind(maKhachHang).first();
    if (!co) throw new Error('Nhà ' + maKhachHang + ' chưa có tệp khách hàng, ' +
      'và lượt đổi tầng này không mang theo uidPhuHuynh để mở tệp.');
  }

  await db.prepare(
    'INSERT INTO lichSuTang (id,maKhachHang,tuTang,denTang,kpi,boi,luc,lyDo) ' +
    'VALUES (?,?,?,?,?,?,?,?)'
  ).bind('LS-' + tokenMoi().slice(0, 14), maKhachHang, tuTang, denTang,
    kpi == null ? null : Number(kpi), boi || null, luc, lyDo || null).run();

  await db.prepare('UPDATE hoSoKhach SET tang = ?, suaLuc = ? WHERE maKhachHang = ?')
    .bind(denTang, luc, maKhachHang).run();

  return await dungLichThu(db, maKhachHang, denTang, luc);
}
