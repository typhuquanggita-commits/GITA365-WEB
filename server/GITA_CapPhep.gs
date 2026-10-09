/**
 * ═══════════════════════════════════════════════════════════════
 * GITA 365 — MÁY CHỦ CẤP PHÉP
 * Dán vào dự án Apps Script của GITA 365 (cùng chỗ 00_Config.gs).
 *
 * Việc duy nhất của tệp này: sau khi tài khoản đăng nhập hợp lệ, trả về
 * ĐÚNG những khoá giải mã mà vai và tầng của tài khoản đó được cấp phép —
 * không hơn một khoá nào.
 *
 * Khoá lấy từ kho/khoa.json (do tools/ma-hoa-kho.js sinh ra) và được nạp
 * vào Script Properties. KHÔNG dán khoá vào mã nguồn.
 * ═══════════════════════════════════════════════════════════════
 */

/** Nạp bộ khoá một lần sau khi mã hoá kho. Dán nội dung kho/khoa.json vào. */
function napBoKhoaMotLan() {
  var khoa = {
    // "nen":   "…", "nghe": "…", "tang1": "…", …
  };
  if (!Object.keys(khoa).length) throw new Error('Chưa dán nội dung kho/khoa.json vào hàm này.');
  PropertiesService.getScriptProperties().setProperty('GITA_KHOA_KHO', JSON.stringify(khoa));
  return 'Đã nạp ' + Object.keys(khoa).length + ' khoá. Xoá nội dung khoá khỏi hàm này ngay sau khi chạy.';
}

/** Hạn dùng của một lần cấp khoá (giờ). Hết hạn thì client phải xin lại. */
var GITA_HAN_KHOA_GIO = 12;

/**
 * ═══════════════ BỐN TUYẾN ═══════════════
 * BẢN CHÉP của G.TUYEN trong src/data.tuyen.js. Apps Script không đọc
 * được tệp trong kho mã nên phải chép; bộ kiểm phát hành (mục 36) đối
 * chiếu hai bản mỗi lần chạy và dừng phát hành nếu lệch.
 *
 * Sửa ở đây thì phải sửa cả src/data.tuyen.js, và ngược lại.
 *
 * trangThai: 'chay' — đang phục vụ khách · 'chuan' — còn đang dựng chuẩn.
 * goiCu: tuyến gốc giữ nguyên tên gói cũ (nghe · tang1…tang5) để mọi
 * giấy phép đã cấp trước v7.8 vẫn dùng được.
 */
var GITA_TUYEN = [
  { ma: 'GITA365',   trangThai: 'chay',  goiCu: true },
  { ma: 'ENGWIN365', trangThai: 'chuan', goiCu: false },
  { ma: 'MATH365',   trangThai: 'chuan', goiCu: false },
  { ma: 'SAT365',    trangThai: 'chuan', goiCu: false },
  { ma: 'HSA365',    trangThai: 'chuan', goiCu: false }
];
var GITA_SO_TANG = 5;

function gitaTuyen_(ma) {
  for (var i = 0; i < GITA_TUYEN.length; i++)
    if (GITA_TUYEN[i].ma === ma) return GITA_TUYEN[i];
  return null;
}
function gitaGoiNghe_(ma) {
  var t = gitaTuyen_(ma);
  return t ? (t.goiCu ? 'nghe' : ma.toLowerCase() + '-nghe') : '';
}
/* Gói NGHỀ CAO — hồ sơ khách tầng 4-5. Xem GITA_XemKhach.gs. */
function gitaGoiNgheCao_(ma) {
  var t = gitaTuyen_(ma);
  return t ? (t.goiCu ? 'nghe-cao' : ma.toLowerCase() + '-nghe-cao') : '';
}
function gitaGoiTang_(ma, tang) {
  var t = gitaTuyen_(ma);
  if (!t || !(tang >= 1 && tang <= GITA_SO_TANG)) return '';
  return t.goiCu ? 'tang' + tang : ma.toLowerCase() + '-t' + tang;
}

/**
 * Tuyến của một tài khoản. Cột "tuyen" trong bảng tài khoản, các mã cách
 * nhau bằng dấu phẩy. Để trống nghĩa là chỉ GITA365 — nhờ vậy mọi tài
 * khoản có trước v7.8 giữ nguyên phạm vi cũ mà không phải sửa gì.
 * Chỉ tuyến ĐANG CHẠY mới được cấp: tuyến đang dựng chuẩn chưa có khoá.
 */
function gitaTuyenCuaTK_(hoSo) {
  var tho = String((hoSo && hoSo.tuyen) || '').trim();
  /* Ô TRỐNG nghĩa là GITA365 — nhờ vậy mọi tài khoản có trước v7.8 giữ
     nguyên phạm vi cũ mà không phải điền gì thêm. */
  if (!tho) return gitaTuyen_('GITA365').trangThai === 'chay' ? ['GITA365'] : [];

  var xin = tho.split(/[,;\s]+/), ra = [], la = [];
  for (var i = 0; i < xin.length; i++) {
    var ten = String(xin[i]).toUpperCase(), t = gitaTuyen_(ten);
    if (!t) { la.push(ten); continue; }
    if (t.trangThai === 'chay' && ra.indexOf(t.ma) < 0) ra.push(t.ma);
  }

  /* Ô CÓ CHỮ nhưng không nhận ra tuyến nào thì KHÔNG rơi về GITA365. Gõ
     sai "MATH36" mà vẫn cấp GITA365 là phục vụ sai nội dung trong im
     lặng — người dùng không biết mình đang xem nhầm tuyến, và người quản
     trị không biết mình gõ sai. Trả về rỗng thì tài khoản chỉ còn gói
     nền, gặp ngay màn xin cấp phép, và lỗi được sửa trong ngày. */
  if (la.length) gitaGhiNhat_('TUYEN_LA', hoSo, la.join(' '));
  return ra;
}

/** Ghi một dòng vào nhật ký khi có thể; không có bảng thì thôi, đừng để
 *  việc ghi nhật ký làm hỏng việc cấp khoá. */
function gitaGhiNhat_(loai, hoSo, ghiChu) {
  try {
    if (typeof gitaNhatKy === 'function')
      gitaNhatKy(loai, (hoSo && hoSo.u) || '', ghiChu);
  } catch (e) { /* nhật ký hỏng không được chặn đăng nhập */ }
}

/**
 * Phạm vi cấp phép — nguồn sự thật duy nhất.
 * lv lấy từ ROLES trong 00_Config.gs: càng nhỏ càng nhiều quyền.
 * Ba chiều: VAI × TẦNG × TUYẾN.
 */
function gitaPhamViCapPhep(hoSo) {
  var ds = ['nen'];                        // mọi tài khoản đã đăng nhập
  var lv = (ROLES[hoSo.role] || { lv: 99 }).lv;
  var tuyen = gitaTuyenCuaTK_(hoSo);
  var i, j, k;

  /* Tới bậc 12 — khớp với G.PERM.nghe_chung trong ứng dụng. Lệch một bậc ở
     đây thì R12 thấy mục trong trình đơn nhưng máy chủ không cấp khoá. */
  if (lv <= 12) {                           // tư vấn, coach, quản lý, quản trị, phân tích
    for (k = 0; k < tuyen.length; k++) {
      ds.push(gitaGoiNghe_(tuyen[k]));
      /* GÓI NGHỀ CAO DỪNG SỚM HƠN — chỉ tới bậc của Coach.
         Gói NGHỀ mang hồ sơ khách tầng 1-3; gói NGHỀ CAO mang tầng 4-5,
         và chủ hệ chốt tầng 4-5 chỉ từ Coach lên tới Super Admin. Để
         chung một gói thì Giáo viên (bậc 8), Mentor (9), Chuyên gia đánh
         giá (10) và Phân tích dữ liệu (12) đều nhận đủ tên nhà, tên bố
         mẹ, tên Coach và băng KPI của tầng cao về máy mình — và lọc trên
         màn hình không gọi ngược được thứ đã gửi đi. */
      if (lv <= gitaXkBacCoach_()) ds.push(gitaGoiNgheCao_(tuyen[k]));
      for (i = 1; i <= GITA_SO_TANG; i++) ds.push(gitaGoiTang_(tuyen[k], i));
    }
    return gitaGon_(ds);
  }
  if (lv === 15) return ds;                 // CTV giới thiệu: chỉ phần nền

  // Phụ huynh và học viên: chỉ tầng đang học và các tầng đã đi qua,
  // và chỉ trong những tuyến tài khoản được cấp.
  var tang = Number(hoSo.tier || 0);
  if (!(tang >= 1)) return ds;
  for (k = 0; k < tuyen.length; k++)
    for (j = 1; j <= Math.min(GITA_SO_TANG, tang); j++)
      ds.push(gitaGoiTang_(tuyen[k], j));
  return gitaGon_(ds);
}

/** Bỏ tên rỗng và tên trùng — danh sách cấp phép không được có rác. */
function gitaGon_(ds) {
  var ra = [];
  for (var i = 0; i < ds.length; i++)
    if (ds[i] && ra.indexOf(ds[i]) < 0) ra.push(ds[i]);
  return ra;
}

/* ═══════════════ CHỐNG XIN KHOÁ HÀNG LOẠT ═══════════════
   Một tài khoản hợp lệ vẫn có thể bị dùng để rút khoá liên tục từ nhiều
   máy. Mỗi tài khoản chỉ được cấp khoá một số lần giới hạn trong mỗi giờ. */
var GITA_TRAN_XIN_KHOA_GIO = 12;

function gitaDemXinKhoa_(u) {
  var kho = CacheService.getScriptCache();
  var k = 'CAPKHOA_' + String(u).toLowerCase();
  var n = Number(kho.get(k) || 0) + 1;
  kho.put(k, String(n), 3600);
  return n;
}

/**
 * Điểm vào của client. Gọi bằng POST tới URL triển khai của Web App.
 * Thân yêu cầu: {"fn":"capKhoa","u":"…","token":"…","goi":[…],"may":"…"}
 */
function doPost(e) {
  var ra = function (o) {
    return ContentService.createTextOutput(JSON.stringify(o))
      .setMimeType(ContentService.MimeType.JSON);
  };
  try {
    var y = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    /* ── Những việc KHÔNG cần phiên ──
       Đăng nhập, đăng ký và lấy lại mật khẩu đều xảy ra TRƯỚC khi có phiên,
       nên không thể đòi phiên ở đây. Mỗi hàm tự lo phần chặt của mình:
       đếm số lần sai, băm mã, và không bao giờ tiết lộ email nào đã đăng ký. */
    if (y.fn === 'dangNhap')      return ra(gitaDangNhap_(y));
    if (y.fn === 'dangXuat')      return ra(gitaDangXuat_(y));
    if (y.fn === 'quenMatKhau')   return ra(gitaQuenMatKhau_(y));
    if (y.fn === 'datLaiMatKhau') return ra(gitaDatLaiMatKhau_(y));
    if (y.fn === 'kiemBanMoi')    return ra(gitaKiemBanMoi_(y));
    if (y.fn === 'dangKy')        return ra(gitaDangKy_(y));
    if (y.fn === 'guiLaiOtp')     return ra(gitaGuiLaiOtp_(y));
    if (y.fn === 'xacThucOtp')    return ra(gitaXacThucOtp_(y));
    if (y.fn === 'kichHoat')      return ra(gitaKichHoat_(y));

    var VIEC = ['capKhoa', 'xuatSheet', 'dongBo', 'doiMatKhau', 'napTaiLieu', 'duyetTaiLieu',
                'nangTang', 'kiemDrive',
                /* Ba việc của chứng cứ hoa hồng — xem GITA_ChungCu.gs.
                   Chúng ở đây chứ không ở nhánh không-cần-phiên vì
                   nguoiGhi lấy từ PHIÊN: nhận tên từ thân yêu cầu thì
                   người ta ghi tên ai cũng được, và cả bảng chứng cứ
                   mất nghĩa ngay. */
                'kyChungCu', 'xacNhanChungCu', 'soiChungCu',
                /* Ba việc của sổ đếm cộng đồng — xem GITA_SoCongDong.gs.
                   Cũng phải có phiên: dấu chặn đếm hai lần băm từ TÀI
                   KHOẢN trong phiên. Nhận tên từ thân yêu cầu thì gõ tên
                   khác là đếm thêm được một nhà, và cả sổ thành số bịa. */
                'ghiTinCongDong', 'docTinCongDong', 'guiChuyen',
                /* Bốn việc của quyền xem hồ sơ khách — xem GITA_XemKhach.gs.
                   Phải có phiên vì cả bốn đều đọc VAI từ phiên: nhận vai
                   từ thân yêu cầu thì ai gõ 'R01' cũng thành Super Admin. */
                'capQuyenXem', 'thuHoiQuyenXem', 'soiQuyenXem', 'xemKhachCao',
                /* Hai cửa của bản 9.53 — xem GITA_TinhHuongKhach.gs.
                   napTinhHuongKhach đọc TẦNG từ hồ sơ trong phiên, không
                   nhận từ thân yêu cầu: nhận từ thân thì gõ số 5 là mở cả
                   năm tầng. xemKpiKhach qua đúng cổng mục 'kpi'. */
                'napTinhHuongKhach', 'xemKpiKhach'];
    if (VIEC.indexOf(y.fn) < 0) return ra({ ok: false, error: 'Yêu cầu không hợp lệ.' });

    // 1. Xác thực phiên — dùng đúng lớp bảo mật sẵn có của hệ thống
    var hoSo = kiemTraPhien_(y.token, y.u);
    if (!hoSo) return ra({ ok: false, code: 'AUTH', error: 'Phiên không hợp lệ hoặc đã hết hạn.' });
    if (hoSo.khoa) return ra({ ok: false, code: 'LOCKED', error: 'Tài khoản đang bị khoá.' });

    /* ── Ba việc cần phiên hợp lệ, xử lý ở tệp riêng ── */
    if (y.fn === 'xuatSheet')   return ra(gitaXuatSheet_(y, hoSo));
    if (y.fn === 'dongBo')      return ra(gitaDongBo_(y, hoSo));
    if (y.fn === 'doiMatKhau')  return ra(gitaDoiMatKhau_(y, hoSo));
    if (y.fn === 'napTaiLieu')  return ra(gitaNapTaiLieu_(y, hoSo));
    if (y.fn === 'duyetTaiLieu')return ra(gitaDuyetTaiLieu_(y, hoSo));
    if (y.fn === 'nangTang')    return ra(gitaNangTang_(y, hoSo));
    if (y.fn === 'kiemDrive')   return ra(gitaKiemDrive_(y, hoSo));
    if (y.fn === 'kyChungCu')      return ra(gitaKyChungCu_YC_(y, hoSo));
    if (y.fn === 'xacNhanChungCu') return ra(gitaXacNhanChungCu_(y, hoSo));
    if (y.fn === 'soiChungCu')     return ra(gitaSoiChungCu_(y, hoSo));
    if (y.fn === 'ghiTinCongDong') return ra(gitaGhiTinCongDong_(y, hoSo));
    if (y.fn === 'docTinCongDong') return ra(gitaDocTinCongDong_(y, hoSo));
    if (y.fn === 'guiChuyen')      return ra(gitaGuiChuyen_(y, hoSo));
    if (y.fn === 'capQuyenXem')    return ra(gitaCapQuyenXem_(y, hoSo));
    if (y.fn === 'thuHoiQuyenXem') return ra(gitaThuHoiQuyenXem_(y, hoSo));
    if (y.fn === 'soiQuyenXem')    return ra(gitaSoiQuyenXem_(y, hoSo));
    if (y.fn === 'xemKhachCao')    return ra(gitaXemKhachCao_(y, hoSo));
    if (y.fn === 'napTinhHuongKhach') return ra(gitaNapTinhHuongKhach_(y, hoSo));
    if (y.fn === 'xemKpiKhach')       return ra(gitaXemKpiKhach_(y, hoSo));

    // 2. Mật khẩu tạm chưa đổi thì không mở kho
    if (hoSo.phaiDoiMk) {
      ghiNhatKy_({ viec: 'CAP_KHOA_CHAN', u: hoSo.u, role: hoSo.role, tier: hoSo.tier,
        goi: '', may: String(y.may || '').slice(0, 120), phien: hoSo.phien,
        chiTiet: 'Mật khẩu tạm chưa đổi' });
      return ra({ ok: false, code: 'MUSTCHANGE',
        error: 'Tài khoản đang dùng mật khẩu tạm do máy sinh ra. ' +
               'Đổi sang mật khẩu của riêng anh chị rồi kho mới mở.' });
    }

    // 3. Chặn rút khoá hàng loạt
    var soLan = gitaDemXinKhoa_(hoSo.u);
    if (soLan > GITA_TRAN_XIN_KHOA_GIO) {
      ghiNhatKy_({ viec: 'CAP_KHOA_CHAN', u: hoSo.u, role: hoSo.role, tier: hoSo.tier,
        goi: '', may: String(y.may || '').slice(0, 120), phien: hoSo.phien,
        chiTiet: 'Vượt trần ' + GITA_TRAN_XIN_KHOA_GIO + ' lượt/giờ — lượt thứ ' + soLan });
      return ra({ ok: false, code: 'RATE', error: 'Xin khoá quá nhiều lần trong một giờ. Thử lại sau.' });
    }

    // 4. Tính phạm vi được cấp, giao nhau với danh sách client xin
    var duocCap = gitaPhamViCapPhep(hoSo);
    var xin = Array.isArray(y.goi) ? y.goi : duocCap;
    var cap = duocCap.filter(function (g) { return xin.indexOf(g) >= 0; });

    // 5. Lấy khoá và chỉ trả đúng phần được cấp
    var kho = JSON.parse(PropertiesService.getScriptProperties().getProperty('GITA_KHOA_KHO') || '{}');
    if (!Object.keys(kho).length) return ra({ ok: false, code: 'NOKEY', error: 'Máy chủ chưa được nạp bộ khoá.' });
    var traVe = {};
    cap.forEach(function (g) { if (kho[g]) traVe[g] = kho[g]; });

    // 6. Ghi nhật ký — ai, lúc nào, mở gói nào, trên máy nào
    ghiNhatKy_({
      viec: 'CAP_KHOA', u: hoSo.u, role: hoSo.role, tier: hoSo.tier,
      goi: cap.join(','), may: String(y.may || '').slice(0, 120),
      phien: hoSo.phien, ip: (e && e.parameter && e.parameter.ip) || ''
    });

    return ra({
      ok: true,
      khoa: traVe,
      hetHan: new Date(Date.now() + GITA_HAN_KHOA_GIO * 3600e3).toISOString(),
      phamVi: cap
    });
  } catch (err) {
    return ra({ ok: false, error: String(err && err.message || err) });
  }
}

/** Kiểm tra máy chủ còn sống và đã nạp khoá chưa. Không trả khoá nào.
    Apps Script chỉ cho phép MỘT hàm doGet trong cả dự án, nên hàm này không
    còn tên doGet nữa — bộ định tuyến trong GITA_BanWeb.gs gọi nó. */
function gitaTrangThai_() {
  var kho = {};
  try { kho = JSON.parse(PropertiesService.getScriptProperties().getProperty('GITA_KHOA_KHO') || '{}'); } catch (e) {}
  return ContentService.createTextOutput(JSON.stringify({
    ok: true, ten: 'GITA 365 — máy chủ cấp phép',
    daNapKhoa: Object.keys(kho).length, luc: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/* ───────────────────────────────────────────────────────────────
   Hai hàm dưới nối vào lớp sẵn có của hệ thống v6.9.
   Đã nối thật — không còn là chỗ trống.
   ─────────────────────────────────────────────────────────────── */

/**
 * Trả về hồ sơ {u, role, tier, khoa, phien} nếu phiên hợp lệ, ngược lại null.
 *
 * Nối vào 02_Security.gs:
 *   readSession_(token) → {uid, username, role, portal, studentId, exp}
 *   Store.find('users', uid)      → kiểm tài khoản còn hoạt động
 *   Store.find('students', id)    → lấy tầng đang học
 */
function kiemTraPhien_(token, u) {
  var s = readSession_(token);
  if (!s) return null;

  // Tên đăng nhập client gửi lên phải khớp phiên — chặn dùng token của người khác
  if (u && String(u).toLowerCase() !== String(s.username || '').toLowerCase()) return null;

  var hoSo = { u: s.username, role: s.role, tier: 0, khoa: false, phaiDoiMk: false, phien: s };

  // Tài khoản có còn hoạt động không
  var nd = null;
  try { nd = Store.find('users', s.uid); } catch (e) { nd = null; }
  if (!nd || !isTrue(nd.active) || nd.deletedAt) { hoSo.khoa = true; return hoSo; }

  /* Mật khẩu tạm chưa đổi. Tài khoản vẫn đăng nhập và đổi mật khẩu được,
     nhưng KHÔNG mở được kho — mật khẩu do máy sinh ra và đi qua log, qua
     email, nên không được phép là chìa mở tài sản của Học viện. */
  if (isTrue(nd.mustChangePw)) hoSo.phaiDoiMk = true;
  if (nd.role !== s.role) { hoSo.role = nd.role; }   // vai đổi sau khi mở phiên

  // Tầng đang học — lấy từ hồ sơ học viên gắn với tài khoản
  var maHV = nd.studentId || s.studentId || '';
  if (maHV) {
    var hv = null;
    try { hv = Store.find('students', maHV); } catch (e) { hv = null; }
    if (hv) {
      if (String(hv.status || '').toLowerCase() === 'locked') { hoSo.khoa = true; return hoSo; }
      hoSo.tier = Number(hv.tier) || 0;
    }
  }
  return hoSo;
}

/** Ghi một dòng nhật ký chỉ thêm, không sửa, không xoá. */
function ghiNhatKy_(muc) {
  try {
    audit_(muc.phien || null, muc.viec || 'CAP_KHOA',
      muc.goi || '',
      'tang=' + (muc.tier || 0) + ' · may=' + (muc.may || '') +
      (muc.ip ? ' · ip=' + muc.ip : '') +
      (muc.chiTiet ? ' · ' + muc.chiTiet : ''));
  } catch (e) {
    Logger.log(JSON.stringify(muc));
  }
}
