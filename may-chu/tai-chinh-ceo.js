/* ═══════════════════════════════════════════════════════════════
   GITA 365 — PHÂN HỆ 5: TÀI CHÍNH, PHẦN CHẠY Ở MÁY CHỦ

   Bản chép của G.TC_* — bộ kiểm mục 84 đối chiếu từng ô với kho.

   ══ CHỖ NÀY TRỎ, KHÔNG CHÉP ══

   Luật 4 — "mọi khoản chi trên một mức đều cần chủ hệ duyệt" — đã
   chạy từ 9.92 ở `chi-tieu.js`, và thang sáu mốc chốt ở 9.97. Mô-đun
   này KHÔNG khai một ngưỡng tiền nào của riêng nó: nó gọi thẳng
   `thangDuyetChi()`. Mục 84 đọc mã nguồn để canh đúng chỗ ấy — một
   bản thứ hai của ngưỡng tiền thì hai bản lệch nhau, và một khoản chi
   lọt qua mà không ai biết.

   ══ VÀ MỘT CHỖ PHẢI TÍNH CHO ĐÚNG, KHÔNG CHO ĐẸP ══

   Số tháng sống được tính trên TIỀN CỦA HỌC VIỆN — tiền mặt trừ phần
   học phí đã thu mà chưa giao dịch vụ. Tính trên tổng tiền mặt thì nó
   nói dối theo đúng hướng nguy hiểm nhất: dài ra đúng lúc thu được
   nhiều tiền trả trước, tức là đúng lúc nghĩa vụ giao dịch vụ nặng
   nhất.
   ═══════════════════════════════════════════════════════════════ */

import { thangDuyetChi } from './chi-tieu.js';

/* ═══════════════ BẢN CHÉP CỦA KHO ═══════════════ */

export const BAY7 = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'];
export const DO_DUOC = ['S1', 'S2', 'S3', 'S7'];
export const DU_TUOI = ['S4', 'S6'];
export const UC_TINH = ['S5'];

export const NGUONG_THANG_SONG = 3;
export const NGUONG_O_LAI = 60;
export const LAN_LTV = 3;
export const TUOI_O_LAI_NGAY = 90;
export const TUOI_LTV_NGAY = 365;

export const LUAT4 = ['L1', 'L2', 'L3', 'L4'];
export const KICH_BAN = ['KB_TOT', 'KB_THUONG', 'KB_XAU'];

/* Khoản mục bị Luật 2 chặn. Một tên, lấy đúng tên khoản mục đã có ở
   danh sách trắng của `chi-tieu.js` — không dựng một tên mới. */
export const MUC_QUANG_CAO = 'tiepThi';

/* Màn hình khoá ở `fin_view` — câu trả lời SẴN CÓ cho "ai xem tài
   chính", dùng lại chứ không dựng câu thứ hai. Cổng máy chủ hẹp hơn
   một bậc: R01–R03, theo luật "tài chính CHỈ R01–R03" đã chốt ở 9.97.

   Hai con số khác nhau là CỐ Ý, và cái hẹp hơn nằm ở máy chủ — đúng
   chiều an toàn. Màn hình chỉ quyết mục nào hiện trong cột trái; thứ
   quyết ai đọc được con số là cổng này. */
function duocVaoTC(hoSo) {
  return /^R(0[1-3])$/.test(String((hoSo || {}).role || ''));
}

/* ═══════════════ MỘT TỶ LỆ PHẢI NÓI CỠ MẪU ═══════════════

   Mẫu bằng không thì KHÔNG trả về tỷ lệ, kể cả 0. Số 0 đọc ra là
   "không ai ở lại"; không trả về đọc ra là "chưa đo được" — hai câu
   khác hẳn nhau. Cùng luật với ba bậc lời khai của phễu thị giác. */
export function tyLe(tren, mau, chuaDuTuoi) {
  if (!mau) return { mau: 0, chuaDuTuoi: chuaDuTuoi || 0,
    vi: 'Chưa đo được — mẫu bằng không. KHÔNG trả về 0%, vì số 0 đọc ra là "không ' +
      'ai", còn không trả về đọc ra là "máy chưa biết".' };
  return { pt: Math.round(tren * 1000 / mau) / 10, tren, mau,
    chuaDuTuoi: chuaDuTuoi || 0 };
}

/* ═══════════════ BẢY CON SỐ CEO ═══════════════ */
export async function bayConSoCEO(y, env, db, hoSo) {
  if (!duocVaoTC(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Bảy con số CEO mở cho R01–R03.' };

  const bayGio = (y || {}).bayGio || new Date().toISOString();
  const nay = Date.parse(bayGio);
  /* THÁNG THEO GIỜ VIỆT NAM (9.99.114) — Workers chạy UTC; bao-cao.js dựng
     mọi mốc theo LECH_VN. S3 cũ lấy substr(UTC,1,7) nên ở mép tháng lệch
     bảy tiếng: một khoản trả 06:00 sáng 1/9 giờ VN (= 23:00 31/8 UTC) rơi
     nhầm tháng Tám — CEO và sổ kế toán trình HAI con số doanh thu khác nhau
     cho cùng dữ liệu. Tính tháng đích theo giờ VN, và group ghiLuc cũng
     theo giờ VN (datetime(ghiLuc,'+7 hours')). */
  const thang = new Date(nay + 7 * 3600e3).toISOString().slice(0, 7);

  /* ── S1 · TIỀN MẶT, TÁCH LÀM HAI ── */
  const vao = await db.prepare(
    "SELECT COALESCE(SUM(soTien),0) t FROM phieuThu WHERE trangThai = 'daDuyet'")
    .bind().first();
  const ra = await db.prepare(
    "SELECT COALESCE(SUM(soTien),0) t FROM chiPhi WHERE trangThai = 'daDuyet'")
    .bind().first();
  /* TIỀN RA còn có HOÀN và HOA HỒNG — hai dòng tiền rời hệ mà bản đầu
     KHÔNG trừ vào S1 (chỉ trừ chiPhi). Đường lương đã nối vào chiPhi,
     hoàn/hoa hồng thì bị bỏ quên → S1 tiền mặt và S2 số-tháng-sống thổi
     lên, và cổng runway (L1) đáng lẽ chặn tăng chi thì không kích. Tổ
     thanh tra vòng đời tái hiện: 100tr vào − 30tr hoàn − 5tr hoa hồng mà
     S1 vẫn báo 100tr. Nay trừ cả hai. Lỗ 9.99.112 (PH-1). */
  const raHoan = await db.prepare(
    "SELECT COALESCE(SUM(soTien),0) t FROM hoanTien WHERE trangThai = 'daDuyet'")
    .bind().first();
  const raHH = await db.prepare(
    "SELECT COALESCE(SUM(soTien),0) t FROM hoaHongTra WHERE trangThai = 'daTra'")
    .bind().first();
  const tienMat = Number((vao || {}).t || 0) - Number((ra || {}).t || 0)
    - Number((raHoan || {}).t || 0) - Number((raHH || {}).t || 0);

  /* Phần CHƯA GIAO: học phí của nhà chưa đủ 365 ngày, tính theo phần
     ngày còn lại. Đây là NGHĨA VỤ, không phải tiền của Học viện. */
  /* boTro PHẢI có trong SELECT — S7 (:191) đọc n.boTro để đếm nhà được
     giới thiệu. Bản cũ quên cột này nên n.boTro luôn undefined và S7 khai
     0% mọi lúc: một phép đo hỏng đọc ra như một 0% thật, tệ hơn không có
     (luật không-gộp-đo-với-khai). Tổ thanh tra tài chính đợt 3. */
  const nha = await db.prepare(
    'SELECT maKhachHang, vaoLuc, trangThai, boTro FROM hoSoKhach').bind().all();
  const dsNha = (nha.results || nha || []);

  let chuaGiao = 0;
  for (const n of dsNha) {
    const v = Date.parse(n.vaoLuc || '');
    if (!v) continue;
    const ngay = Math.floor((nay - v) / 86400000);
    if (ngay >= TUOI_LTV_NGAY) continue;
    const thu = await db.prepare(
      "SELECT COALESCE(SUM(soTien),0) t FROM phieuThu" +
      " WHERE maKhachHang = ? AND trangThai = 'daDuyet'").bind(n.maKhachHang).first();
    const conLai = (TUOI_LTV_NGAY - Math.max(ngay, 0)) / TUOI_LTV_NGAY;
    chuaGiao += Number((thu || {}).t || 0) * conLai;
  }
  chuaGiao = Math.round(chuaGiao);
  const tienHocVien = tienMat - chuaGiao;

  /* ── S3 · DOANH THU THÁNG ── */
  const dtThang = await db.prepare(
    "SELECT COALESCE(SUM(soTien),0) t FROM phieuThu" +
    " WHERE trangThai = 'daDuyet' AND substr(datetime(ghiLuc,'+7 hours'),1,7) = ?")
    .bind(thang).first();

  /* ── CHI PHÍ MỘT THÁNG ──
     Cách tính là một câu chủ hệ chưa chốt (TC-01). Máy lấy trung bình
     ba tháng gần nhất và NÓI RA rằng đây là một giả định, không im
     lặng chọn hộ — con số quan trọng nhất của cả bảng không được mang
     một giả định mà không ai quyết định. */
  const moc3 = String(bayGio).slice(0, 10);
  const chi3 = await db.prepare(
    "SELECT COALESCE(SUM(soTien),0) t FROM chiPhi WHERE trangThai = 'daDuyet'" +
    " AND ngayChi >= date(?, '-3 months')").bind(moc3).first();
  /* Hoàn/hoa hồng ba tháng cũng là tiền ra hằng tháng — vào cả nhịp chi
     để S2 (số tháng sống) không dài ra giả tạo. Cùng lỗ PH-1 (9.99.112). */
  const hoan3 = await db.prepare(
    "SELECT COALESCE(SUM(soTien),0) t FROM hoanTien WHERE trangThai = 'daDuyet'" +
    " AND substr(duyetLuc,1,10) >= date(?, '-3 months')").bind(moc3).first();
  const hh3 = await db.prepare(
    "SELECT COALESCE(SUM(soTien),0) t FROM hoaHongTra WHERE trangThai = 'daTra'" +
    " AND substr(traLuc,1,10) >= date(?, '-3 months')").bind(moc3).first();
  const chiThang = Math.round((Number((chi3 || {}).t || 0)
    + Number((hoan3 || {}).t || 0) + Number((hh3 || {}).t || 0)) / 3);

  /* ── S2 · SỐ THÁNG SỐNG ĐƯỢC ── */
  const thangSong = chiThang > 0
    ? Math.round(tienHocVien * 10 / chiThang) / 10
    : undefined;

  /* ── S4 · CHI PHÍ CÓ MỘT KHÁCH MỚI ── */
  const nhaMoi = dsNha.filter(n => {
    const v = Date.parse(n.vaoLuc || '');
    return v && (nay - v) <= 90 * 86400000;
  }).length;
  const chiTiepThi = await db.prepare(
    "SELECT COALESCE(SUM(soTien),0) t FROM chiPhi WHERE trangThai = 'daDuyet'" +
    " AND khoanMuc = ? AND ngayChi >= date(?, '-3 months')")
    .bind(MUC_QUANG_CAO, String(bayGio).slice(0, 10)).first();
  /* Kỳ chưa có nhà mới nào thì KHÔNG chia. Chia cho không là một con
     số vô hạn trình ra như một sự thật. */
  const cpKhach = nhaMoi > 0
    ? Math.round(Number((chiTiepThi || {}).t || 0) / nhaMoi)
    : undefined;

  /* ── S6 · TỶ LỆ Ở LẠI 90 NGÀY, CHỈ TRÊN MẪU ĐỦ TUỔI ── */
  let duTuoi90 = 0, oLai90 = 0, chuaDu90 = 0;
  dsNha.forEach(n => {
    const v = Date.parse(n.vaoLuc || '');
    if (!v) return;
    if ((nay - v) < TUOI_O_LAI_NGAY * 86400000) { chuaDu90++; return; }
    duTuoi90++;
    if (['dangHoc', 'xong'].indexOf(n.trangThai) >= 0) oLai90++;
  });
  const oLai = tyLe(oLai90, duTuoi90, chuaDu90);

  /* ── S5 · GIÁ TRỊ 365 NGÀY — ƯỚC TÍNH CHO TỚI KHI CÓ LỚP ĐỦ TUỔI ── */
  const duTuoi365 = dsNha.filter(n => {
    const v = Date.parse(n.vaoLuc || '');
    return v && (nay - v) >= TUOI_LTV_NGAY * 86400000;
  });
  const ltv = { coMau: duTuoi365.length, laUocTinh: duTuoi365.length === 0,
    vi: duTuoi365.length === 0
      ? 'CHƯA CÓ nhà nào đủ 365 ngày, nên đây là một PHÉP CHIẾU chứ không phải một ' +
        'phép đo — và phép chiếu luôn đẹp hơn sự thật, vì nhà rời đi sớm chưa kịp ' +
        'rời đi.'
      : 'Đo trên ' + duTuoi365.length + ' nhà đã đủ 365 ngày.' };

  /* ── S7 · TỶ LỆ TỰ GIỚI THIỆU ── */
  const coBoTro = dsNha.filter(n => n.boTro && String(n.boTro).trim()).length;
  const tuGioiThieu = tyLe(coBoTro, dsNha.length, 0);

  return { ok: true, thang,
    /* HAI NGĂN riêng. Gộp thành một bảng bảy dòng cùng kiểu chữ thì
       người đọc tin cả bảy như nhau, mà hai con số bị tin nhầm nhiều
       nhất lại đúng là hai con số dùng để quyết định tiêu tiền. */
    doDuoc: {
      S1_tienMat: tienMat,
      S1_chuaGiao: chuaGiao,
      S1_tienHocVien: tienHocVien,
      S2_thangSong: thangSong,
      S3_doanhThuThang: Math.round(Number((dtThang || {}).t || 0)),
      S7_tuGioiThieu: tuGioiThieu
    },
    duTuoi: { S4_chiPhiKhachMoi: cpKhach, S4_soNhaMoi: nhaMoi, S6_oLai90: oLai },
    ucTinh: { S5_giaTri365: ltv },
    chiThang,
    /* Giả định NÓI RA, không im. */
    giaDinh: 'Chi phí một tháng = trung bình ba tháng gần nhất. Cách tính này là ' +
      'mục TC-01 đang chờ chủ hệ chốt — lấy trung bình ba tháng, hay mức kế hoạch, ' +
      'hay mức sàn khi đã cắt hết, ba cách ra ba con số khác nhau.',
    vi: 'Số tháng sống được tính trên TIỀN CỦA HỌC VIỆN (' + tienHocVien +
      '), không trên tổng tiền mặt (' + tienMat + '). Tính trên tổng thì nó dài ra ' +
      'đúng lúc thu được nhiều tiền trả trước — tức là đúng lúc nghĩa vụ giao dịch ' +
      'vụ nặng nhất.' };
}

/* ═══════════════ BA CỔNG CỦA BỐN LUẬT ═══════════════

   Luật 4 KHÔNG dựng lại ở đây — nó gọi thẳng thang duyệt chi đã có. */
export async function soatLuatTaiChinh(y, env, db, hoSo) {
  if (!duocVaoTC(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Cổng luật tài chính mở cho R01–R03.' };

  const s = await bayConSoCEO(y, env, db, hoSo);
  if (!s.ok) return s;

  const x = y || {};
  const muc = String(x.khoanMuc || '').trim();
  const tien = Number(x.soTien) || 0;

  const pham = [];

  /* L1 — số tháng sống được dưới 3 thì chặn MỌI đề nghị tăng chi. */
  const ts = s.doDuoc.S2_thangSong;
  if (ts !== undefined && ts < NGUONG_THANG_SONG) {
    pham.push({ ma: 'L1', soThang: ts,
      vi: 'Số tháng sống được còn ' + ts + ', dưới ngưỡng ' + NGUONG_THANG_SONG +
        '. Cắt chi phí TRƯỚC khi tăng doanh thu — tăng doanh thu mất ba tháng mới ' +
        'thấy tiền, cắt chi phí thấy ngay tháng sau.',
      mayKhongLam: 'Máy KHÔNG chọn cắt cái gì. Cắt một khoản đào tạo khác hẳn cắt ' +
        'một khoản mặt bằng, và chỉ người đọc sổ mới biết khoản nào đang nuôi cái gì.' });
  }

  /* L2 — tỷ lệ ở lại dưới 60% thì chặn riêng khoản quảng cáo. */
  const ol = s.duTuoi.S6_oLai90;
  if (muc === MUC_QUANG_CAO && ol.pt !== undefined && ol.pt < NGUONG_O_LAI) {
    pham.push({ ma: 'L2', oLai: ol.pt, mau: ol.mau,
      vi: 'Tỷ lệ ở lại 90 ngày mới ' + ol.pt + '% trên ' + ol.mau + ' nhà đủ tuổi, ' +
        'dưới ngưỡng ' + NGUONG_O_LAI + '%. Đổ tiền vào một cái xô thủng là cách ' +
        'phá sản nhanh nhất trong ngành giáo dục — và nó phá sản CÓ VẺ THÀNH CÔNG: ' +
        'số nhà mới tăng đều, chỉ có số nhà ở lại là không tăng.' });
  }

  /* L3 — tiền của Học viện âm là đang tiêu tiền của khách. */
  if (s.doDuoc.S1_tienHocVien < 0) {
    pham.push({ ma: 'L3', thieu: s.doDuoc.S1_tienHocVien,
      vi: 'Tiền của Học viện đang ÂM ' + (-s.doDuoc.S1_tienHocVien) + '. Nghĩa là ' +
        'chi phí đang được bù bằng học phí đã thu mà chưa giao dịch vụ — vay của ' +
        'chính khách hàng mình, với lãi suất bằng nghĩa vụ phải giao trong phần ' +
        'còn lại của năm.' });
  }

  /* L4 — TRỎ, không chép. Ngưỡng và thang nằm ở chi-tieu.js. */
  const thang = thangDuyetChi();

  return { ok: true, dat: pham.length === 0, pham,
    thangDuyetChi: thang,
    vi: pham.length
      ? 'Chặn ' + pham.length + ' chỗ. Ba luật đầu có răng ở đây; luật thứ tư đã ' +
        'chạy ở thang duyệt chi từ 9.92 và chỗ này chỉ TRỎ.'
      : 'Không phạm luật nào trong bốn luật tài chính.' };
}

/* ═══════════════ ĐANG Ở KỊCH BẢN NÀO ═══════════════

   Máy NÓI, không tự chuyển. Chuyển sang kịch bản xấu có hệ quả với
   người đang làm — cắt tiếp thị, dừng thù lao ngoài lương — và nó
   phải có một cái tên ký bên dưới (mục chờ TC-02). */
export async function dangOKichBan(y, env, db, hoSo) {
  if (!duocVaoTC(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Cổng kịch bản mở cho R01–R03.' };
  const s = await bayConSoCEO(y, env, db, hoSo);
  if (!s.ok) return s;

  const ts = s.doDuoc.S2_thangSong;
  const xau = ts !== undefined && ts < NGUONG_THANG_SONG;

  return { ok: true,
    dauHieu: xau ? 'KB_XAU' : 'KB_THUONG',
    soThangSong: ts,
    mayKhongChuyen: true,
    vi: 'Máy NÓI dấu hiệu đang trỏ về kịch bản nào, và DỪNG ở đó. Chuyển kịch bản ' +
      'là một quyết định có hệ quả với người đang làm, nên nó phải có một cái tên ' +
      'ký bên dưới — mục chờ TC-02.' };
}
