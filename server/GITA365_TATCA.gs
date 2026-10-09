/**
 * ═══════════════════════════════════════════════════════════════════════
 *  GITA 365 — MÁY CHỦ  ·  TOÀN BỘ TRONG MỘT TỆP
 *  Học viện GITA · Trương Nhật Quang · 08.5555.4688
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  Toàn bộ mã máy chủ gộp lại một chỗ, để dán MỘT LẦN thay vì từng tệp.
 *  Nội dung y hệt các tệp trong thư mục server/ của kho mã — không cắt bớt.
 *
 *  ── KHÔNG CÓ MẬT KHẨU NÀO TRONG TỆP NÀY ──
 *  Mã nguồn đi qua kho mã, qua tin nhắn, qua email, qua màn hình người khác
 *  nhìn thấy. Một mật khẩu đặt cứng trong mã là mật khẩu đã lộ từ dòng đầu
 *  tiên nó được viết ra. Nên máy chủ tự sinh mật khẩu tạm khi cài đặt, hiện
 *  một lần trong log, gửi kèm một thư, rồi KHÔNG mở kho cho tới khi mật khẩu
 *  ấy được đổi.
 *
 *  ── LÀM THEO ĐÚNG BỐN BƯỚC ──
 *
 *  1. Vào script.google.com bằng tài khoản Google của Học viện.
 *     New project → đổi tên thành GITA 365 → xoá hết nội dung Code.gs
 *     → dán TOÀN BỘ tệp này vào.
 *
 *  2. Kiểm hai dòng ngay dưới đây. Sai thì sổ dữ liệu nằm nhầm chỗ.
 *
 *  3. Chọn hàm  caiDatLanDau  → Run.
 *     Google hỏi quyền ở lần đầu: Review permissions → chọn tài khoản →
 *     Advanced → Go to GITA 365 (unsafe) → Allow.
 *     ("unsafe" chỉ nghĩa là dự án chưa qua kiểm duyệt của Google.
 *      Đây là mã của chính Học viện.)
 *
 *     Log sẽ hiện MẬT KHẨU TẠM của Admin@gita365. Chép ngay — nó không hiện
 *     lại lần thứ hai. Một bản cũng được gửi tới email hệ thống.
 *     Lỡ mất thì chạy hàm  datLaiMatKhauSuperAdmin  để sinh mật khẩu mới.
 *
 *  4. Thêm một tệp mã nữa tên GITA_NapKhoa, dán nội dung tệp bộ khoá,
 *     chọn hàm  napBoKhoaMotLan  → Run → log báo "Đã nạp N khoá"
 *     (N là số gói trong kho/khoa.json — 8 từ bản 9.47)
 *     → XOÁ tệp GITA_NapKhoa khỏi dự án ngay lập tức.
 *
 *  Rồi triển khai:
 *     Deploy → New deployment → bánh răng → Web app
 *        Execute as      : Me
 *        Who has access  : Anyone
 *     → Deploy → chép địa chỉ kết thúc bằng /exec
 *
 *  Cuối cùng, trong ứng dụng GITA 365: đăng nhập Super Admin →
 *  Quản trị trang → Nối máy chủ → dán địa chỉ → Lưu → Gọi thử.
 *
 *  Lần đăng nhập đầu, ứng dụng sẽ đưa thẳng tới màn đổi mật khẩu. Kho chỉ
 *  mở sau khi đổi xong — đây là chặn thật ở máy chủ, không phải lời nhắc.
 *
 *  Hướng dẫn đầy đủ, kể cả phần xử lý khi có trục trặc: docs/MAY_CHU.md
 * ═══════════════════════════════════════════════════════════════════════
 */


/* ═══════════════════════════════════════════════════════════════════════
   LỚP NỀN — bảng dữ liệu, phiên, băm mật khẩu, nhật ký, đăng nhập
   (nguyên văn server/GITA_Nen.gs)
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * ═══════════════════════════════════════════════════════════════
 * GITA 365 — LỚP NỀN CỦA MÁY CHỦ
 *
 * Các tệp GITA_CapPhep, GITA_MatKhau, GITA_TaiLieu, GITA_DongBo và
 * GITA_XuatSheet đều gọi tới bốn thứ: Store, readSession_, audit_ và
 * isTrue. Trước đây chúng được coi là "đã có sẵn trong dự án v6.9".
 * Nếu Học viện dựng máy chủ mới thì không có gì sẵn cả, và cả bộ đứng im.
 *
 * Tệp này dựng đủ bốn thứ đó trên MỘT bảng tính Google, để máy chủ chạy
 * được ngay từ một dự án trống. Không thuê máy, không cơ sở dữ liệu riêng,
 * dữ liệu nằm trong Drive của chính Học viện.
 *
 * ══ HAI DÒNG DUY NHẤT PHẢI SỬA ══
 * Đặt mã thư mục Drive của Học viện và địa chỉ email nhận thư hệ thống
 * ngay dưới đây. Mọi thứ còn lại chạy được mà không phải chạm vào.
 * ═══════════════════════════════════════════════════════════════
 */

var GITA_THU_MUC_DRIVE = '1pvXH45JvXXPOW9V6ObB5CR87r7gxH0fU';   /* Dữ Liệu GITA365 — sổ dữ liệu nằm ở đây */
var GITA_THU_MUC_MA    = '1jVOnIH7286glI95fC4aqfXApecxEj7Xz';   /* Mã máy chủ GITA365 — mã và hướng dẫn */
var GITA_EMAIL_HE_THONG = 'typhuquanggita@gmail.com';

/** Tên bảng tính chứa toàn bộ dữ liệu. Tự tạo trong lần chạy đầu. */
var GITA_TEN_SO = 'GITA365 — Sổ dữ liệu';

/* ═══════════════ CÁC BẢNG ═══════════════
   Mỗi bảng là một trang trong bảng tính. Cột đầu luôn là id. */
var GITA_BANG = {
  users:          ['id','username','hoTen','email','dienThoai','role','portal','studentId',
                   'pwSalt','pwHash','active','createdAt','updatedAt','deletedAt','maKhachHang','boTro',
                   'mustChangePw','pwDoiLuc'],
  students:       ['id','hoTen','lop','tinh','tier','status','kpi','phuHuynhId','coach','createdAt'],
  sessions:       ['id','uid','username','role','portal','studentId','exp','createdAt'],
  dangKyCho:      ['id','email','hoTen','dienThoai','tenCon','lop','tinh','maGioiThieu',
                   'otpSalt','otpHash','otpHan','otpSai','tokenKichHoat','tokenHan','trangThai','createdAt'],
  audit:          ['id','luc','uid','username','viec','doiTuong','chiTiet'],
  hosoApp:        ['id','uid','u','role','duLieu','moc','taoLuc','suaLuc'],
  hosoAppSaoLuu:  ['id','uid','duLieu','luc'],
  thanhToan:      ['id','maKhachHang','tier','soTien','trangThai','nguoiDuyet','luc','ghiChu',
                   'daDung','dungChoHocVien','dungLuc'],
  /* Sổ tài liệu. Trước đây bảng này KHÔNG được khai, nên Store tạo trang chỉ
     có một cột id và mọi bản ghi gửi lên biến mất không một lời báo: tệp nằm
     trên Drive nhưng màn kiểm duyệt không có gì để đọc. */
  tailieu:        ['id','ten','loai','tang','moTa','driveId','tenTep','nguoiGui','vaiGui',
                   'luc','trangThai','nguoiDuyet','lucDuyet','lyDo']
};

/* ═══════════════ BẬC VAI ═══════════════
   Giống hệt G.ROLES trong ứng dụng. Càng nhỏ càng nhiều quyền. */
var ROLES = {
  R01:{lv:1,  ten:'Super Admin',            portal:'admin'},
  R02:{lv:2,  ten:'Admin hệ thống',         portal:'admin'},
  R03:{lv:3,  ten:'Giám đốc hệ thống',      portal:'admin'},
  R04:{lv:4,  ten:'Quản lý chuyên môn',     portal:'admin'},
  R05:{lv:5,  ten:'Trưởng nhóm Coach',      portal:'coach'},
  R06:{lv:6,  ten:'Senior Coach',           portal:'coach'},
  R07:{lv:7,  ten:'Coach',                  portal:'coach'},
  R08:{lv:8,  ten:'Giáo viên',              portal:'coach'},
  R09:{lv:9,  ten:'Mentor',                 portal:'coach'},
  R10:{lv:10, ten:'Chuyên viên đánh giá',   portal:'coach'},
  R11:{lv:11, ten:'Tư vấn',                 portal:'tuvan'},
  R12:{lv:12, ten:'Chuyên viên phân tích',  portal:'admin'},
  R13:{lv:13, ten:'Phụ huynh',              portal:'ph'},
  R14:{lv:14, ten:'Học viên',               portal:'hs'},
  R15:{lv:15, ten:'Cộng tác viên',          portal:'ctv'}
};

/* ═══════════════ BẢNG TÍNH ═══════════════ */
function gitaSo_() {
  var P = PropertiesService.getScriptProperties();
  var id = P.getProperty('GITA_SO_ID');
  if (id) {
    try { return SpreadsheetApp.openById(id); } catch (e) { /* bị xoá — dựng lại */ }
  }
  var so = SpreadsheetApp.create(GITA_TEN_SO);
  P.setProperty('GITA_SO_ID', so.getId());
  try {
    DriveApp.getFolderById(GITA_THU_MUC_DRIVE).addFile(DriveApp.getFileById(so.getId()));
  } catch (e) { /* thư mục chưa đặt đúng — vẫn chạy được, sổ nằm ở Drive gốc */ }
  return so;
}

function gitaTrang_(ten) {
  var so = gitaSo_();
  var tr = so.getSheetByName(ten);
  if (!tr) {
    tr = so.insertSheet(ten);
    tr.appendRow(GITA_BANG[ten] || ['id']);
    tr.setFrozenRows(1);
    var mac = so.getSheetByName('Sheet1');
    if (mac && so.getSheets().length > 1) so.deleteSheet(mac);
  }
  return tr;
}

/** Dựng đủ mọi bảng. Chạy một lần sau khi dán mã. */
function dungSoDuLieu() {
  var them = [];
  Object.keys(GITA_BANG).forEach(function (t) {
    var tr = gitaTrang_(t);
    /* Trang đã có từ bản cũ thì BỔ SUNG cột còn thiếu. Không làm việc này
       thì mọi trường mới bị Store âm thầm bỏ đi — như cột mustChangePw:
       tài khoản vẫn tạo được, nhưng lớp chặn "mật khẩu tạm không mở kho"
       biến mất không một lời báo. */
    var can = GITA_BANG[t];
    var dang = tr.getLastRow() ? tr.getRange(1, 1, 1, tr.getLastColumn()).getValues()[0] : [];
    var thieu = can.filter(function (c) { return dang.indexOf(c) < 0; });
    if (dang.length && thieu.length) {
      tr.getRange(1, dang.length + 1, 1, thieu.length).setValues([thieu]);
      them.push(t + ': +' + thieu.join(', '));
    }
  });
  return 'Đã dựng ' + Object.keys(GITA_BANG).length + ' bảng trong "' + GITA_TEN_SO + '".' +
         (them.length ? '\n  Bổ sung cột còn thiếu — ' + them.join(' · ') : '') +
         '\n  Mở Drive để xem.';
}

/* ═══════════════ STORE ═══════════════
   Bốn hàm, đúng những gì các tệp khác gọi tới. Đọc cả trang một lần rồi
   lọc trong bộ nhớ — với quy mô vài nghìn dòng thì nhanh hơn đọc từng ô. */
/* ═══════════════ KHOÁ GHI ═══════════════

   Apps Script chạy nhiều lượt SONG SONG. Mọi thao tác gồm nhiều bước
   trên cùng một trang tính — thêm rồi hỏi số dòng, xoá nhiều dòng —
   phải là MỘT khối, không thì hai lượt cắt vào giữa nhau.

   Không lấy được khoá thì NÉM LỖI, không ghi liều. Một lượt ghi
   không xếp hàng được là một lượt ghi có thể đè lên người khác, và
   mất dữ liệu im lặng đắt hơn một thông báo lỗi rõ ràng. */
function gitaKhoaGhi_(viec) {
  var khoa = LockService.getScriptLock();
  try {
    khoa.waitLock(20000);
  } catch (e) {
    throw new Error('Máy chủ đang bận, chưa xếp được lượt ghi. Thử lại sau vài giây.');
  }
  try { return viec(); }
  finally { try { khoa.releaseLock(); } catch (e) {} }
}

var Store = (function () {
  var dem = {};   /* nhớ trong một lần chạy, không nhớ qua các lần gọi */

  function doc(bang) {
    if (dem[bang]) return dem[bang];
    var tr = gitaTrang_(bang);
    var v = tr.getDataRange().getValues();
    var cot = v.length ? v[0] : (GITA_BANG[bang] || ['id']);
    var ds = [];
    for (var i = 1; i < v.length; i++) {
      var o = {_dong: i + 1};
      for (var j = 0; j < cot.length; j++) o[cot[j]] = v[i][j];
      if (String(o.id || '').length) ds.push(o);
    }
    dem[bang] = {cot: cot, ds: ds, tr: tr};
    return dem[bang];
  }

  return {
    all: function (bang) { return doc(bang).ds.slice(); },

    find: function (bang, id) {
      var k = String(id);
      var ds = doc(bang).ds;
      for (var i = 0; i < ds.length; i++) if (String(ds[i].id) === k) return ds[i];
      return null;
    },

    /* ── THÊM DÒNG PHẢI ĐI QUA KHOÁ GHI ──

       Bản trước: appendRow rồi getLastRow. Hai lượt chạy song song —
       Apps Script chạy song song thật — thì A thêm vào dòng 100, B
       thêm vào dòng 101, rồi A gọi getLastRow và nhận 101.

       Từ lúc ấy A tin bản ghi của mình ở dòng 101. Lần update sau của
       A GHI ĐÈ lên bản ghi của B. Không lỗi, không cảnh báo — chỉ là
       một bản ghi biến mất và một bản ghi mang dữ liệu của người khác.

       Hai thao tác ấy phải là MỘT. Khoá ghi làm được đúng việc đó. */
    insert: function (bang, ban) {
      var d = doc(bang);
      var hang = d.cot.map(function (c) { return ban[c] === undefined ? '' : ban[c]; });
      return gitaKhoaGhi_(function () {
        d.tr.appendRow(hang);
        ban._dong = d.tr.getLastRow();
        d.ds.push(ban);
        return ban;
      });
    },

    /* ── XOÁ, VÀ VÌ SAO TỚI 9.79 MỚI CÓ ──

       Trước bản này Store không có phép xoá nào. Bốn bảng chỉ lớn lên
       và không bao giờ nhỏ đi: sessions, audit, dangKyCho,
       hosoAppSaoLuu. Đăng xuất chỉ đặt exp = 0 — dòng vẫn nằm đó.

       Store.doc() đọc CẢ TRANG mỗi lần chạm tới một bảng, và mọi yêu
       cầu có xác thực đều chạm bảng sessions. Một trăm người đăng
       nhập hai lượt mỗi ngày là bảy mươi ba nghìn dòng sau một năm,
       và mỗi lượt gọi máy chủ đọc lại đủ bảy mươi ba nghìn dòng ấy.

       HAI ĐIỀU BẮT BUỘC KHI XOÁ DÒNG TRONG SHEETS:
         · xoá TỪ DƯỚI LÊN, vì xoá dòng 5 làm dòng 6 thành dòng 5
         · BỎ ĐỆM sau khi xoá, vì mọi _dong bên dưới đã lệch đi
       Thiếu một trong hai là lần update kế tiếp ghi nhầm dòng. */
    xoa: function (bang, ids) {
      var d = doc(bang), tap = {};
      (Object.prototype.toString.call(ids) === '[object Array]' ? ids : [ids])
        .forEach(function (k) { tap[String(k)] = 1; });
      var dong = [];
      d.ds.forEach(function (x) { if (tap[String(x.id)]) dong.push(x._dong); });
      if (!dong.length) return 0;
      dong.sort(function (a, b) { return b - a; });
      return gitaKhoaGhi_(function () {
        for (var i = 0; i < dong.length; i++) d.tr.deleteRow(dong[i]);
        delete dem[bang];
        return dong.length;
      });
    },

    update: function (bang, id, doi) {
      var d = doc(bang);
      var cu = null, k = String(id);
      for (var i = 0; i < d.ds.length; i++) if (String(d.ds[i].id) === k) { cu = d.ds[i]; break; }
      if (!cu) return null;
      Object.keys(doi).forEach(function (c) { cu[c] = doi[c]; });
      var hang = d.cot.map(function (c) { return cu[c] === undefined ? '' : cu[c]; });
      d.tr.getRange(cu._dong, 1, 1, d.cot.length).setValues([hang]);
      return cu;
    }
  };
})();

/* ═══════════════ TIỆN ═══════════════ */
function isTrue(v) {
  if (v === true) return true;
  var s = String(v == null ? '' : v).trim().toLowerCase();
  return s === 'true' || s === '1' || s === 'x' || s === 'có' || s === 'yes';
}

function gitaMaMoi_(tien) {
  return (tien || '') + Utilities.getUuid().replace(/-/g, '').slice(0, 16).toUpperCase();
}

/* Băm mật khẩu: SHA-256 trên muối riêng từng tài khoản cộng tiêu chung.
   Tiêu chung nằm trong Script Properties, không nằm trong mã. */
function gitaTieu_() {
  var P = PropertiesService.getScriptProperties();
  var t = P.getProperty('GITA_TIEU');
  if (!t) { t = Utilities.getUuid() + Utilities.getUuid(); P.setProperty('GITA_TIEU', t); }
  return t;
}

function hashPw_(mk, muoi) {
  var b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,
    String(muoi) + '·' + String(mk) + '·' + gitaTieu_(), Utilities.Charset.UTF_8);
  return b.map(function (x) { return ('0' + (x & 0xFF).toString(16)).slice(-2); }).join('');
}

/* So sánh không rò rỉ thời gian. Với chuỗi băm thì chênh lệch nhỏ, nhưng
   đây là chỗ không có lý do gì để làm ẩu. */
function safeEqual_(a, b) {
  a = String(a || ''); b = String(b || '');
  if (a.length !== b.length) return false;
  var kh = 0;
  for (var i = 0; i < a.length; i++) kh |= (a.charCodeAt(i) ^ b.charCodeAt(i));
  return kh === 0;
}

/* ═══════════════ PHIÊN ═══════════════ */
var GITA_HAN_PHIEN_GIO = 12;

/* Trần đoán mật khẩu: sai bao nhiêu lần thì khoá, và khoá bao lâu. */
/* CacheService chỉ giữ tối đa 21.600 giây (6 giờ). Đặt 86.400 như trước là
   im lặng bị cắt xuống 6 giờ: nghỉ một buổi chiều là bộ đếm "mỗi ngày" về 0
   trong cùng ngày, và trần 20 lượt xuất, 30 tệp gửi thành vô nghĩa. */
var GITA_CACHE_NGAY = 21600;

var GITA_TRAN_DANG_NHAP_SAI = 8;
var GITA_KHOA_DANG_NHAP_GIAY = 900;      /* 15 phút */

function taoPhien_(nd) {
  var id = gitaMaMoi_('S');
  var het = Date.now() + GITA_HAN_PHIEN_GIO * 3600e3;
  Store.insert('sessions', {
    id: id, uid: nd.id, username: nd.username, role: nd.role,
    portal: nd.portal || (ROLES[nd.role] || {}).portal || '',
    studentId: nd.studentId || '', exp: het, createdAt: new Date().toISOString()
  });
  return {token: id, exp: het};
}

function readSession_(token) {
  if (!token) return null;
  var s = Store.find('sessions', token);
  if (!s) return null;
  if (Number(s.exp || 0) < Date.now()) return null;
  return {uid: s.uid, username: s.username, role: s.role,
          portal: s.portal, studentId: s.studentId, exp: Number(s.exp)};
}

function xoaPhien_(token) {
  var s = Store.find('sessions', token);
  if (s) Store.update('sessions', token, {exp: 0});
}

/**
 * Đóng MỌI phiên của một tài khoản.
 *
 * Vì sao cần: đổi mật khẩu mà chỉ đóng phiên của chính mình thì kẻ đang giữ
 * token cũ vẫn vào được tới hết mười hai giờ — đúng lúc chủ tài khoản tin là
 * mình vừa cắt được. Đổi mật khẩu phải có nghĩa là mọi thiết bị khác bị đá ra.
 */
function xoaMoiPhien_(uid, trừToken) {
  var n = 0;
  Store.all('sessions').forEach(function (s) {
    if (String(s.uid) !== String(uid)) return;
    if (trừToken && String(s.id) === String(trừToken)) return;
    if (Number(s.exp || 0) <= Date.now()) return;
    Store.update('sessions', s.id, {exp: 0});
    n++;
  });
  return n;
}

/* ═══════════════ NHẬT KÝ ═══════════════
   Chỉ thêm, không sửa, không xoá. Đây là chỗ trả lời câu "ai đã làm gì". */
function audit_(phien, viec, doiTuong, chiTiet) {
  try {
    Store.insert('audit', {
      id: gitaMaMoi_('A'), luc: new Date().toISOString(),
      uid: (phien && phien.uid) || '', username: (phien && phien.username) || '',
      viec: viec || '', doiTuong: String(doiTuong || '').slice(0, 200),
      chiTiet: String(chiTiet || '').slice(0, 500)
    });
  } catch (e) { Logger.log('audit lỗi: ' + e.message); }
}

/* ═══════════════ ĐĂNG NHẬP ═══════════════ */
function gitaDangNhap_(y) {
  var u = String(y.u || '').trim().toLowerCase();
  var mk = String(y.mk || '');
  if (!u || !mk) return {ok: false, error: 'Thiếu tên đăng nhập hoặc mật khẩu.'};

  var nd = Store.all('users').filter(function (x) {
    return String(x.username || '').toLowerCase() === u ||
           String(x.email || '').toLowerCase() === u;
  })[0];

  /* Trả lời giống nhau cho "không có tài khoản" và "sai mật khẩu" — không
     để ai dò xem email nào đã đăng ký. */
  var chung = {ok: false, error: 'Tên đăng nhập hoặc mật khẩu chưa đúng.'};

  /* ── Trần đoán mật khẩu ──
     Trước đây không chỗ nào đếm số lần sai, nên một máy có thể thử hàng
     nghìn mật khẩu liên tiếp mà không gặp cản nào. Đếm theo tên đăng nhập
     người gọi gõ vào, kể cả khi tài khoản không có thật — nếu chỉ đếm cho
     tài khoản có thật thì chính bộ đếm lại tố cáo tài khoản nào tồn tại. */
  var demKey = 'DANGNHAP_SAI_' + u;
  var cache = CacheService.getScriptCache();
  var soSai = Number(cache.get(demKey) || 0);
  if (soSai >= GITA_TRAN_DANG_NHAP_SAI) {
    audit_(null, 'DANG_NHAP_CHAN', u, 'Vượt ' + GITA_TRAN_DANG_NHAP_SAI + ' lần sai');
    return {ok: false, code: 'RATE',
      error: 'Sai quá nhiều lần. Thử lại sau ' + Math.round(GITA_KHOA_DANG_NHAP_GIAY / 60) +
             ' phút, hoặc dùng mục Quên mật khẩu.'};
  }
  function demSai() {
    cache.put(demKey, String(soSai + 1), GITA_KHOA_DANG_NHAP_GIAY);
  }

  if (!nd) { demSai(); return chung; }

  /* Tài khoản bị khoá cũng trả CÂU CHUNG — báo riêng "Tài khoản đang bị khoá"
     là nói cho người lạ biết email đó có thật, đúng thứ dòng trên vừa nói là
     phải tránh. Chỉ khi mật khẩu ĐÚNG mới nói thật lý do, vì lúc đó người
     hỏi chính là chủ tài khoản. */
  var mkDung = safeEqual_(hashPw_(mk, nd.pwSalt), nd.pwHash);
  if (!mkDung) {
    demSai();
    audit_({uid: nd.id, username: nd.username}, 'DANG_NHAP_SAI', nd.username, '');
    return chung;
  }
  if (!isTrue(nd.active) || nd.deletedAt) {
    audit_({uid: nd.id, username: nd.username}, 'DANG_NHAP_KHOA', nd.username, '');
    return {ok: false, code: 'LOCKED',
      error: 'Tài khoản đang bị khoá. Liên hệ Học viện GITA · 08.5555.4688.'};
  }
  cache.remove(demKey);   /* vào được thì xoá bộ đếm */

  var p = taoPhien_(nd);
  audit_({uid: nd.id, username: nd.username}, 'DANG_NHAP', nd.username, '');
  return {ok: true, token: p.token, hetHan: new Date(p.exp).toISOString(),
    /* Cờ này để ứng dụng đưa thẳng người dùng tới màn đổi mật khẩu.
       Máy chủ không trông chờ ứng dụng nghe lời: nó chặn cấp khoá ở phía
       mình. Cờ chỉ để người dùng biết vì sao kho chưa mở. */
    phaiDoiMk: isTrue(nd.mustChangePw),
    hoSo: {u: nd.username, ten: nd.hoTen, role: nd.role,
           portal: nd.portal || (ROLES[nd.role] || {}).portal || '',
           maKhachHang: nd.maKhachHang || ''}};
}

function gitaDangXuat_(y) {
  if (y && y.token) xoaPhien_(y.token);
  return {ok: true};
}

/* ═══════════════ TÀI KHOẢN KHỞI ĐẦU ═══════════════

   Không có mật khẩu nào nằm sẵn trong tệp này.

   Lý do: mã nguồn đi qua kho mã, qua tin nhắn, qua email, qua màn hình
   người khác nhìn thấy. Một mật khẩu đặt cứng trong mã là mật khẩu đã lộ
   kể từ dòng đầu tiên nó được viết ra.

   Thay vào đó, máy chủ tự sinh một mật khẩu ngẫu nhiên khi cài đặt, hiện
   MỘT LẦN trong log của người đang chạy hàm, và gửi kèm một thư về địa chỉ
   hệ thống. Sau đó máy chủ KHÔNG mở kho cho tài khoản ấy cho tới khi mật
   khẩu được đổi — không phải nhắc nhở, mà chặn thật. */

/* Bốn mươi âm tiết dễ đọc, dễ chép lại đúng. Không dấu để khỏi lỗi gõ, và
   mỗi âm tiết ít nhất ba chữ cái — âm tiết một chữ đọc lên nghe không ra
   tiếng, chép qua điện thoại hay sót. */
var GITA_TU_MK = ['binh','yen','nha','tam','sang','vung','ben','minh','tue',
  'kien','tri','nhan','hoa','tho','lang','xanh','bien','nui','song','gio',
  'mua','nang','trang','sao','lua','mam','than','canh','qua','hat',
  'duong','loi','cau','buoc','nhip','vong','tay','long','luc','hanh'];

/**
 * Sinh mật khẩu tạm: năm âm tiết viết hoa chữ đầu, nối bằng gạch, thêm bốn số.
 * Ví dụ: Binh-Yen-Kien-Tri-Vung-4827
 * Bốn mươi âm tiết chọn năm lần, thêm bốn chữ số: hơn một nghìn tỉ khả năng.
 * Thừa cho một mật khẩu chỉ sống tới lần đăng nhập đầu tiên, mà vẫn chép tay
 * lại được không sai.
 */
function gitaMatKhauTam_() {
  var ra = [];
  for (var i = 0; i < 5; i++) {
    var t = GITA_TU_MK[Math.floor(Math.random() * GITA_TU_MK.length)];
    ra.push(t.charAt(0).toUpperCase() + t.slice(1));
  }
  var so = '';
  for (var j = 0; j < 4; j++) so += Math.floor(Math.random() * 10);
  return ra.join('-') + '-' + so;
}

/**
 * Tạo tài khoản Super Admin. Chạy một lần, sau khi dựng sổ dữ liệu.
 * Trả về mật khẩu tạm — đây là lần duy nhất nó hiện ra.
 */
function taoTaiKhoanKhoiDau() {
  var co = Store.all('users').filter(function (x) {
    return String(x.username || '').toLowerCase() === 'admin@gita365';
  })[0];
  if (co) return 'Tài khoản Admin@gita365 đã có rồi — không tạo lại.\n' +
    'Quên mật khẩu thì chạy hàm datLaiMatKhauSuperAdmin.';

  var mkTam = gitaMatKhauTam_();
  var muoi = Utilities.getUuid();
  Store.insert('users', {
    id: gitaMaMoi_('U'), username: 'Admin@gita365', hoTen: 'Trương Nhật Quang',
    email: GITA_EMAIL_HE_THONG, dienThoai: '0855554688',
    role: 'R01', portal: 'admin', studentId: '',
    pwSalt: muoi, pwHash: hashPw_(mkTam, muoi),
    active: 'TRUE', createdAt: new Date().toISOString(), updatedAt: '', deletedAt: '',
    maKhachHang: 'GITA-0001', boTro: '',
    mustChangePw: 'TRUE', pwDoiLuc: ''
  });

  gitaGuiThuMatKhauTam_('Admin@gita365', mkTam, 'Tài khoản Super Admin vừa được tạo.');
  audit_(null, 'TAO_SUPER_ADMIN', 'Admin@gita365', 'Mật khẩu tạm sinh ngẫu nhiên, bắt buộc đổi');

  return 'Đã tạo Admin@gita365.\n' +
    '  Mật khẩu tạm: ' + mkTam + '\n' +
    '  Chép ngay — dòng này không hiện lại lần thứ hai.\n' +
    '  Một bản đã gửi tới ' + GITA_EMAIL_HE_THONG + '.\n' +
    '  Máy chủ KHÔNG mở kho cho tài khoản này cho tới khi mật khẩu được đổi.';
}

/** Đặt lại mật khẩu Super Admin khi lỡ mất. Chạy trong Apps Script, không qua mạng. */
function datLaiMatKhauSuperAdmin() {
  var nd = Store.all('users').filter(function (x) {
    return String(x.username || '').toLowerCase() === 'admin@gita365';
  })[0];
  if (!nd) return 'Chưa có tài khoản Admin@gita365. Chạy caiDatLanDau trước.';

  var mkTam = gitaMatKhauTam_();
  var muoi = Utilities.getUuid();
  Store.update('users', nd.id, {
    pwSalt: muoi, pwHash: hashPw_(mkTam, muoi),
    mustChangePw: 'TRUE', pwDoiLuc: '', updatedAt: new Date().toISOString()
  });
  gitaGuiThuMatKhauTam_('Admin@gita365', mkTam, 'Mật khẩu Super Admin vừa được đặt lại từ Apps Script.');
  audit_(null, 'DAT_LAI_SUPER_ADMIN', 'Admin@gita365', 'Đặt lại trực tiếp trong Apps Script');

  return 'Đã đặt lại mật khẩu Admin@gita365.\n' +
    '  Mật khẩu tạm: ' + mkTam + '\n' +
    '  Chép ngay. Một bản đã gửi tới ' + GITA_EMAIL_HE_THONG + '.';
}

function gitaGuiThuMatKhauTam_(u, mk, dan) {
  try {
    MailApp.sendEmail(GITA_EMAIL_HE_THONG, 'GITA 365 — mật khẩu tạm của ' + u,
      dan + '\n\n' +
      'Tên đăng nhập : ' + u + '\n' +
      'Mật khẩu tạm  : ' + mk + '\n\n' +
      'Mật khẩu này chỉ dùng cho lần đăng nhập đầu tiên. Máy chủ không mở kho\n' +
      'cho tài khoản này cho tới khi anh chị đổi sang mật khẩu của riêng mình.\n\n' +
      'Nếu không phải anh chị vừa chạy cài đặt, hãy chạy lại hàm\n' +
      'datLaiMatKhauSuperAdmin trong Apps Script ngay.\n\n' +
      'Học viện GITA · 08.5555.4688');
  } catch (e) { /* chưa cấp quyền gửi thư — mật khẩu vẫn hiện trong log */ }
}

/** Dựng cả máy chủ trong một nút bấm: sổ dữ liệu + tài khoản đầu tiên. */
function caiDatLanDau() {
  var a = dungSoDuLieu();
  var b = taoTaiKhoanKhoiDau();
  /* Kiểm quyền ngay trong lần cài đặt. Biết sớm một thư mục không ghi được
     thì hơn là biết lúc phụ huynh đầu tiên gửi tài liệu lên và tệp mất tăm. */
  var c = kiemTraQuyenDrive();
  return a + '\n\n' + b + '\n\n' + c +
    '\n\nCòn một việc: dán bộ khoá vào napBoKhoaMotLan rồi chạy hàm đó.';
}

/* ═══════════════ MẬT KHẨU ═══════════════
   Bốn hàm mà GITA_MatKhau.gs gọi tới. Trước đây chúng được coi là "đã có
   sẵn trong 02_Security.gs của v6.9". Dựng máy chủ mới thì không có gì
   sẵn cả — nên chúng nằm ở đây. */

/** Muối mới cho một lần đặt mật khẩu. */
function newSalt_() { return Utilities.getUuid(); }

/**
 * Độ mạnh mật khẩu. Trả về true nếu đạt, hoặc một câu nói rõ thiếu gì.
 * Không đòi ký tự đặc biệt cho đủ lệ: độ dài mới là thứ thật sự chặn được
 * dò mật khẩu, nên mức sàn đặt ở 10 ký tự.
 */
function checkPwStrength_(mk) {
  mk = String(mk || '');
  if (mk.length < 10) return 'Mật khẩu cần ít nhất 10 ký tự.';
  if (!/[a-zA-Z]/.test(mk)) return 'Mật khẩu cần ít nhất một chữ cái.';
  if (!/[0-9]/.test(mk))    return 'Mật khẩu cần ít nhất một chữ số.';
  if (/^(.)\1+$/.test(mk))  return 'Mật khẩu không được là một ký tự lặp lại.';

  var de = ['123456789', 'password', 'matkhau', 'qwerty', 'abc123', 'gita365', '111111'];
  var t = mk.toLowerCase();
  for (var i = 0; i < de.length; i++)
    if (t.indexOf(de[i]) >= 0) return 'Mật khẩu chứa chuỗi quá dễ đoán.';

  return true;
}

/** Đóng một phiên. Dùng sau khi đổi mật khẩu — buộc đăng nhập lại. */
function closeSession_(token) {
  if (!token) return;
  try { xoaPhien_(token); } catch (e) {}
}

/** Xoá bộ đếm đăng nhập sai. Khoá phải khớp đúng khoá gitaDangNhap_ ghi vào,
    nếu không thì hàm này chạy mà không xoá gì cả. */
function clearFail_(u) {
  try {
    var c = CacheService.getScriptCache();
    c.remove('DANGNHAP_SAI_' + String(u).toLowerCase());
  } catch (e) {}
}

/* ═══════════════ XÁC NHẬN QUYỀN VÀO DRIVE ═══════════════

   Khi bấm Allow trên màn xin quyền của Google, người ta chỉ biết mình vừa
   đồng ý điều gì đó. Không ai biết máy chủ có thật sự ghi được vào đúng
   thư mục của Học viện hay không — cho tới lúc một phụ huynh gửi tài liệu
   lên và tệp biến mất.

   Mục này trả lời trước câu đó. Nó không đọc cấu hình rồi báo "ổn". Nó
   thử thật: mở từng thư mục, tạo một tệp dấu, đọc lại, rồi xoá đi. Thư mục
   nào không vào được thì nói rõ thư mục nào và vì sao.

   Chạy được hai đường:
     · trong Apps Script — chọn hàm kiemTraQuyenDrive rồi Run
     · từ ứng dụng — màn Nối máy chủ, nút "Kiểm quyền Drive" (R01–R02) */

var GITA_THU_MUC_CAN = [
  {ma: 'GITA_THU_MUC_DRIVE',   ten: 'Dữ Liệu GITA365',
   viec: 'Sổ dữ liệu: tài khoản, học viên, phiên, nhật ký, thanh toán'},
  {ma: 'GITA_THU_MUC_TAILIEU', ten: 'Thư mục nhận tài liệu',
   viec: 'Tài liệu và ảnh đội ngũ gửi lên, minh chứng nhiệm vụ của gia đình'},
  {ma: 'GITA_THU_MUC_XUAT',    ten: 'Thư mục xuất bảng tính',
   viec: 'Google Sheet do cấp quản lý xuất ra'},
  {ma: 'GITA_THU_MUC_MA',      ten: 'Mã máy chủ GITA365',
   viec: 'Mã nguồn và hướng dẫn dựng máy chủ'}
];

function gitaIdThuMuc_(ma) {
  /* Ba hằng kia nằm ở tệp khác. Đọc qua this để không nổ khi thiếu tệp nào. */
  try {
    if (ma === 'GITA_THU_MUC_DRIVE')   return GITA_THU_MUC_DRIVE;
    if (ma === 'GITA_THU_MUC_MA')      return GITA_THU_MUC_MA;
    if (ma === 'GITA_THU_MUC_TAILIEU') return GITA_THU_MUC_TAILIEU;
    if (ma === 'GITA_THU_MUC_XUAT')    return GITA_THU_MUC_XUAT;
  } catch (e) { return ''; }
  return '';
}

/** Thử một thư mục: mở được chưa, ghi được chưa, xoá lại được chưa. */
function gitaThuMotThuMuc_(id) {
  var kq = {id: id, moDuoc: false, ten: '', ghiDuoc: false, xoaDuoc: false, loi: ''};
  if (!id) { kq.loi = 'Chưa đặt mã thư mục.'; return kq; }

  var tm;
  try { tm = DriveApp.getFolderById(id); kq.ten = tm.getName(); kq.moDuoc = true; }
  catch (e) {
    kq.loi = 'Không mở được. Hoặc mã thư mục sai, hoặc tài khoản đang chạy ' +
             'Apps Script không có quyền vào thư mục này.';
    return kq;
  }

  var tep = null;
  try {
    tep = tm.createFile('GITA365_kiem_quyen_' + Date.now() + '.txt',
      'Tệp dấu do máy chủ GITA 365 tạo để kiểm quyền ghi. Xoá ngay sau khi kiểm.',
      MimeType.PLAIN_TEXT);
    kq.ghiDuoc = true;
  } catch (e) {
    kq.loi = 'Mở được nhưng KHÔNG ghi được. Tài khoản chỉ có quyền xem — ' +
             'cần quyền Người chỉnh sửa trên thư mục này.';
    return kq;
  }

  try { tep.setTrashed(true); kq.xoaDuoc = true; }
  catch (e) { kq.loi = 'Ghi được nhưng không xoá được tệp dấu. Xoá tay trong Drive.'; }

  return kq;
}

/**
 * Kiểm cả bốn thư mục. Trả về một bảng đọc được, và ghi vào nhật ký.
 * Chạy lại bất cứ lúc nào — nó không đụng vào dữ liệu, chỉ tạo rồi xoá
 * một tệp dấu trong mỗi thư mục.
 */
function kiemTraQuyenDrive() {
  var ds = [], dat = 0;
  GITA_THU_MUC_CAN.forEach(function (t) {
    var r = gitaThuMotThuMuc_(gitaIdThuMuc_(t.ma));
    r.nhan = t.ten; r.viec = t.viec; r.hang = t.ma;
    r.dat = r.moDuoc && r.ghiDuoc;
    if (r.dat) dat++;
    ds.push(r);
  });

  var ai = '';
  try { ai = Session.getEffectiveUser().getEmail(); } catch (e) { ai = '(chưa đọc được)'; }

  var dong = ['XÁC NHẬN QUYỀN VÀO DRIVE',
    'Máy chủ đang chạy dưới tài khoản: ' + ai,
    'Đạt ' + dat + '/' + ds.length + ' thư mục.', ''];

  ds.forEach(function (r) {
    dong.push((r.dat ? '  ✓ ' : '  ✗ ') + r.nhan + '  ·  ' + (r.ten || '(không mở được)'));
    dong.push('      ' + r.viec);
    dong.push('      mã ' + (r.id || '(trống)') +
      '  ·  mở ' + (r.moDuoc ? 'được' : 'KHÔNG') +
      '  ·  ghi ' + (r.ghiDuoc ? 'được' : 'KHÔNG') +
      '  ·  dọn ' + (r.xoaDuoc ? 'được' : 'KHÔNG'));
    if (r.loi) dong.push('      → ' + r.loi);
    dong.push('');
  });

  if (dat < ds.length) {
    dong.push('CÁCH SỬA');
    dong.push('  · Mã thư mục là phần sau /folders/ trong địa chỉ Drive.');
    dong.push('  · Thư mục phải thuộc chính tài khoản đang chạy Apps Script,');
    dong.push('    hoặc được chia sẻ cho tài khoản đó ở mức Người chỉnh sửa.');
    dong.push('  · Sửa xong thì chạy lại hàm này. Không cần triển khai lại.');
  } else {
    dong.push('Cả bốn thư mục đều mở được và ghi được. Tệp dấu đã dọn sạch.');
  }

  var thongDiep = dong.join('\n');
  audit_(null, 'KIEM_QUYEN_DRIVE', ai, 'Đạt ' + dat + '/' + ds.length + ' thư mục');
  Logger.log(thongDiep);
  return thongDiep;
}

/** Bản cho ứng dụng gọi qua doPost. Chỉ Super Admin và Admin hệ thống. */
function gitaKiemDrive_(y, hoSo) {
  var lv = (ROLES[hoSo.role] || {lv: 99}).lv;
  if (lv > 2) return {ok: false, error: 'Chỉ Super Admin và Admin hệ thống kiểm được quyền Drive.'};

  var ds = [], dat = 0;
  GITA_THU_MUC_CAN.forEach(function (t) {
    var r = gitaThuMotThuMuc_(gitaIdThuMuc_(t.ma));
    r.nhan = t.ten; r.viec = t.viec;
    r.dat = r.moDuoc && r.ghiDuoc;
    if (r.dat) dat++;
    ds.push(r);
  });

  var ai = '';
  try { ai = Session.getEffectiveUser().getEmail(); } catch (e) {}
  audit_(hoSo.phien, 'KIEM_QUYEN_DRIVE', ai, 'Đạt ' + dat + '/' + ds.length + ' thư mục');
  return {ok: true, taiKhoan: ai, dat: dat, tong: ds.length, thuMuc: ds};
}

/* ═══════════════ MỤC LỤC HÀM ═══════════════
   Chạy hàm này khi quên tên hàm nào làm việc gì. Không đụng vào dữ liệu. */
function mucLucHam() {
  var b = [
    ['caiDatLanDau',             'Dựng sổ dữ liệu + tạo Super Admin. Chạy MỘT LẦN đầu tiên.'],
    ['kiemTraQuyenDrive',        'Thử thật quyền vào bốn thư mục Drive. Chạy lại bất cứ lúc nào.'],
    ['napBoKhoaMotLan',          'Nạp bộ khoá mở kho. Chạy một lần, rồi xoá tệp chứa khoá.'],
    ['datLaiMatKhauSuperAdmin',  'Sinh mật khẩu tạm mới cho Admin@gita365 khi lỡ mất.'],
    ['dungSoDuLieu',             'Dựng lại các bảng còn thiếu. caiDatLanDau đã gọi sẵn.'],
    ['taoTaiKhoanKhoiDau',       'Tạo riêng tài khoản Super Admin. caiDatLanDau đã gọi sẵn.'],
    ['mucLucHam',                'Chính bảng anh chị đang đọc.']
  ];
  var ra = ['BẢNG HÀM CHẠY TAY TRONG APPS SCRIPT', ''];
  b.forEach(function (x) { ra.push('  ' + x[0] + Array(30 - x[0].length).join(' ') + x[1]); });
  ra.push('');
  ra.push('Mọi việc khác đi qua doPost — ứng dụng gọi, không chạy tay ở đây.');
  var t = ra.join('\n');
  Logger.log(t);
  return t;
}


/* ═══════════════════════════════════════════════════════════════════════
   BẢN WEB — doGet: phục vụ trang, trả gói kho, báo tình trạng
   (nguyên văn server/GITA_BanWeb.gs)
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * ═══════════════════════════════════════════════════════════════
 * GITA 365 — BẢN WEB PHỤC VỤ THẲNG TỪ APPS SCRIPT
 *
 * Bình thường bản web nằm ở một chỗ khác (GitHub Pages, hoặc gita.edu.vn)
 * và chỉ gọi về đây để xin khoá. Nhưng như vậy phải dựng thêm một chỗ nữa,
 * phải mua tên miền, và bản web nằm ngoài tay Học viện.
 *
 * Tệp này bỏ được bước đó: chính dự án Apps Script phục vụ luôn bản web.
 * Địa chỉ /exec vừa là máy chủ vừa là trang. Không thuê hosting, không tên
 * miền, không kho mã công khai — mọi thứ nằm trong Drive của Học viện.
 *
 * ── CẦN CHUẨN BỊ GÌ ──
 * Trong thư mục "Bản web GITA365" trên Drive, đặt:
 *     GITA365.html      vỏ ứng dụng, một tệp duy nhất
 *     nen.enc  nghe.enc  tang1.enc … tang5.enc      bảy gói kho
 *     mau.json          dữ liệu mẫu cho chế độ chưa cấp phép
 *
 * Bảy tệp .enc đã mã hoá AES-256-GCM. Đặt chúng ở đâu cũng được — không có
 * khoá thì chúng là một đống byte vô nghĩa. Khoá vẫn do doPost cấp, sau khi
 * đăng nhập, theo đúng vai và tầng.
 *
 * ── APPS SCRIPT CHỈ CHO MỘT doGet ──
 * Nên doGet ở đây là bộ định tuyến duy nhất của cả dự án:
 *     /exec                 → bản web
 *     /exec?viec=trangthai  → JSON tình trạng máy chủ
 *     /exec?goi=nghe        → một gói kho, dạng base64
 * ═══════════════════════════════════════════════════════════════
 */

/** Thư mục chứa bản web. Để trống thì dùng chung thư mục mã. */
var GITA_THU_MUC_WEB = '';

/** Tên tệp vỏ ứng dụng trong thư mục đó. */
var GITA_TEP_WEB = 'GITA365.html';

function gitaThuMucWeb_() {
  return GITA_THU_MUC_WEB || GITA_THU_MUC_MA;
}

/** Tìm một tệp theo tên trong thư mục bản web. Trả null nếu không có. */
function gitaTimTep_(ten) {
  var tm;
  try { tm = DriveApp.getFolderById(gitaThuMucWeb_()); } catch (e) { return null; }
  var ds = tm.getFilesByName(ten);
  return ds.hasNext() ? ds.next() : null;
}

/* ═══════════════ BỘ ĐỊNH TUYẾN ═══════════════ */
function doGet(e) {
  var t = (e && e.parameter) || {};

  if (t.viec === 'trangthai') return gitaTrangThai_();
  if (t.goi) return gitaTraGoi_(String(t.goi));
  /* ?dangnhap=1 — bỏ phiên đang nhớ và ra thẳng màn đăng nhập.
     Bản Apps Script chạy trong khung sandbox, nên gõ #dangnhap vào thanh
     địa chỉ không chạm tới được trang bên trong. Phải có đường qua máy chủ. */
  return gitaTrangWeb_(!!(t.dangnhap || t.dangxuat));
}

/* ═══════════════ TRẢ BẢN WEB ═══════════════ */
function gitaTrangWeb_(raNgoai) {
  var tep = gitaTimTep_(GITA_TEP_WEB);
  if (!tep) return HtmlService.createHtmlOutput(gitaTrangHuongDan_())
    .setTitle('GITA 365 — chưa đặt bản web');

  var html = tep.getBlob().getDataAsString('UTF-8');

  /* Nối bản web với chính máy chủ này. Hai dòng dưới đây thay cho việc phải
     sửa cau-hinh.js bằng tay: trang biết địa chỉ máy chủ, và biết lấy kho
     qua đường nào. */
  var diaChi = ScriptApp.getService().getUrl();
  var tiem = '<script>' +
    'window.G = window.G || {};' +
    'window.G.API_CAP_PHEP = ' + JSON.stringify(diaChi) + ';' +
    'window.GITA_NGUON_KHO = ' + JSON.stringify(diaChi + '?goi=') + ';' +
    'window.GITA_CUA_DANG_NHAP = ' + JSON.stringify(diaChi + '?dangnhap=1') + ';' +
    (raNgoai ? 'window.GITA_RA_NGOAI = true;' : '') +
    '</script>';

  /* Chèn ngay sau <head> nếu có, không thì lên đầu tệp. */
  var i = html.toLowerCase().indexOf('<head>');
  html = (i >= 0) ? html.slice(0, i + 6) + tiem + html.slice(i + 6) : tiem + html;

  return HtmlService.createHtmlOutput(html)
    .setTitle('GITA 365 — Hệ Sinh Thái Gia Đình Thịnh Vượng')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/* ═══════════════ TRẢ MỘT GÓI KHO ═══════════════
   Gói đã mã hoá sẵn, nên đường này không cần phiên: không có khoá thì tệp
   là một đống byte vô nghĩa. Vẫn chỉ nhận đúng bảy tên gói, để không ai
   dùng tham số này đọc tệp khác trong Drive. */
var GITA_GOI_HOP_LE = ['nen', 'nghe', 'tang1', 'tang2', 'tang3', 'tang4', 'tang5'];

function gitaTraGoi_(ten) {
  var json = function (o) {
    return ContentService.createTextOutput(JSON.stringify(o))
      .setMimeType(ContentService.MimeType.JSON);
  };

  if (ten === 'mau') {
    var tm = gitaTimTep_('mau.json');
    if (!tm) return json({ok: false, error: 'Chưa đặt mau.json trong thư mục bản web.'});
    return ContentService.createTextOutput(tm.getBlob().getDataAsString('UTF-8'))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (GITA_GOI_HOP_LE.indexOf(ten) < 0)
    return json({ok: false, error: 'Không có gói tên này.'});

  var tep = gitaTimTep_(ten + '.enc');
  if (!tep) return json({ok: false, error: 'Chưa đặt ' + ten + '.enc trong thư mục bản web.'});

  /* base64 vì ContentService chỉ trả được chữ, không trả được byte thô.
     Trình duyệt giải ngược lại trước khi đưa vào WebCrypto. */
  return json({ok: true, goi: ten, du: Utilities.base64Encode(tep.getBlob().getBytes())});
}

/* ═══════════════ TRANG KHI CHƯA ĐẶT BẢN WEB ═══════════════
   Không để trắng màn hình. Nói thẳng còn thiếu gì và lấy ở đâu. */
function gitaTrangHuongDan_() {
  var tm = '';
  try { tm = DriveApp.getFolderById(gitaThuMucWeb_()).getName(); } catch (e) { tm = '(không mở được)'; }

  var co = [], thieu = [];
  ['GITA365.html', 'mau.json'].concat(GITA_GOI_HOP_LE.map(function (g) { return g + '.enc'; }))
    .forEach(function (t) { (gitaTimTep_(t) ? co : thieu).push(t); });

  return '<!doctype html><meta charset="utf-8">' +
    '<style>body{font:15px/1.7 system-ui,sans-serif;max-width:640px;margin:48px auto;padding:0 20px;' +
    'color:#1a1a2e;background:#F6F3FC}h1{font-size:22px;color:#185AB4;margin-bottom:4px}' +
    'code{background:#fff;padding:2px 6px;border-radius:4px;font-size:13px}' +
    'li{margin:4px 0}.x{color:#BE0E16}.v{color:#0B7350}</style>' +
    '<h1>GITA 365 — máy chủ đã chạy, bản web chưa đặt</h1>' +
    '<p>Máy chủ sống và trả lời được. Còn thiếu các tệp của bản web trong thư mục ' +
    '<b>' + tm + '</b>.</p>' +
    '<h3>Đã có (' + co.length + ')</h3><ul>' +
    (co.length ? co.map(function (t) { return '<li class="v">✓ <code>' + t + '</code></li>'; }).join('')
               : '<li>chưa có tệp nào</li>') +
    '</ul><h3>Còn thiếu (' + thieu.length + ')</h3><ul>' +
    thieu.map(function (t) { return '<li class="x">✕ <code>' + t + '</code></li>'; }).join('') +
    '</ul><p>Tải cả bộ từ kho mã của Học viện, rồi kéo thả vào thư mục trên. ' +
    'Xong thì tải lại trang này.</p>' +
    '<p style="color:#666;font-size:13px">Máy chủ vẫn dùng được ngay cả khi chưa đặt bản web — ' +
    'bản web ở chỗ khác vẫn gọi về địa chỉ này xin khoá như thường.</p>';
}


/* ═══════════════════════════════════════════════════════════════════════
   CẤP PHÉP — doPost, cửa vào duy nhất, và việc cấp khoá mở kho
   (nguyên văn server/GITA_CapPhep.gs)
   ═══════════════════════════════════════════════════════════════════════ */

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


/* ═══════════════════════════════════════════════════════════════════════
   CHỨNG CỨ — ký và đóng dấu giờ máy chủ cho hồ sơ hoa hồng kèm
   (nguyên văn server/GITA_ChungCu.gs)
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * ═══════════════════════════════════════════════════════════════
 * GITA 365 — KÝ VÀ ĐÓNG DẤU GIỜ CHO CHỨNG CỨ HOA HỒNG
 * Dán vào cùng dự án Apps Script với GITA_CapPhep.gs.
 *
 * ═══ VÌ SAO PHẦN NÀY PHẢI Ở MÁY CHỦ ═══
 *
 * Bảng chứng cứ ở máy khách (src/hoa-hong-kem.js) đã tự khai hai chỗ nó
 * KHÔNG làm được, và in thẳng hai chỗ ấy ra màn:
 *
 *   · Dấu kiểm ở máy khách bắt được sửa vô ý và sửa cẩu thả. Nó KHÔNG
 *     chặn được người cố tình dựng lại cả bản ghi lẫn dấu — vì thuật
 *     toán nằm ngay trong mã trang, ai cũng đọc được.
 *   · Giờ máy khách đổi được trong ba giây. Một dấu thời gian do chính
 *     bên đi đòi tiền tự đóng thì không phải bằng chứng.
 *
 * Hai chỗ ấy chỉ đóng được ở đây, và đóng được vì đúng một lý do: KHOÁ
 * KHÔNG BAO GIỜ RỜI MÁY CHỦ. Nó nằm ở PropertiesService, không nằm
 * trong mã nguồn, không đi trong bất kỳ phản hồi nào, và không có hàm
 * nào trong tệp này trả nó ra.
 *
 * ═══ MÁY KHÁCH GIỮ BIÊN NHẬN, KHÔNG GIỮ BẢN GỐC LÀM BẰNG ═══
 *
 * Sau khi ký, máy chủ giữ bản gốc trong một trang append-only và trả về
 * BIÊN NHẬN: mã, giờ máy chủ, chữ ký. Máy khách lưu biên nhận ấy cạnh
 * bản ghi của mình.
 *
 * Nếu hai bên tranh chấp: bản của máy khách đối chiếu với bản của máy
 * chủ. Lệch một ký tự thì chữ ký không khớp, và bên nào sửa thì lộ ra.
 *
 * ═══ BA ĐIỀU TỆP NÀY TỪ CHỐI LÀM ═══
 *
 * 1. Không sửa một bản đã ký. Sai thì ghi bản ĐÍNH CHÍNH trỏ về bản cũ,
 *    và cả hai cùng ở lại trang — xoá bản sai là xoá luôn bằng chứng
 *    rằng đã từng có bản sai, đúng thứ bên đối tụng sẽ hỏi.
 * 2. Không cho người ghi tự xác nhận cho mình. Đây là chỗ chống làm giả
 *    mạnh nhất của cả hệ, mạnh hơn mọi chữ ký.
 * 3. Không trả khoá ra, không trả cả một phần khoá, không trả một thứ
 *    suy ngược ra khoá được.
 * ═══════════════════════════════════════════════════════════════
 */

/** Tên trang lưu chứng cứ. Chỉ THÊM dòng, không bao giờ sửa dòng cũ. */
var GITA_TRANG_CHUNGCU = 'ChungCu';

/** Cột của trang, theo đúng thứ tự ghi. */
var GITA_COT_CHUNGCU = ['ma', 'nhiemVu', 'ngayLam', 'loai', 'noiDung', 'nguoiGhi',
  'gioMayChu', 'chuKy', 'xacNhanBoi', 'xacNhanLuc', 'dinhChinhCho', 'uidGhi'];

/**
 * Khoá ký. Sinh một lần, giữ ở PropertiesService, KHÔNG BAO GIỜ trả ra.
 * Khác khoá của gitaTieu_(): trộn hai việc vào một khoá thì đổi khoá vì
 * một việc là làm hỏng việc kia.
 */
function gitaKhoaChungCu_() {
  var P = PropertiesService.getScriptProperties();
  var k = P.getProperty('GITA_KHOA_CHUNGCU');
  if (!k) {
    k = Utilities.getUuid() + Utilities.getUuid() + Utilities.getUuid();
    P.setProperty('GITA_KHOA_CHUNGCU', k);
  }
  return k;
}

/**
 * Chuỗi chuẩn hoá để ký. PHẢI khớp từng ký tự với bên máy khách khi hai
 * bên đối chiếu, nên thứ tự trường ở đây là một phần của hợp đồng —
 * đổi thứ tự là làm mọi chữ ký cũ hết đối chiếu được.
 */
function gitaChuanChungCu_(o, gioMayChu) {
  return [
    'nhiemVu=' + String(o.nhiemVu || ''),
    'ngayLam=' + String(o.ngayLam || ''),
    'loai=' + String(o.loai || ''),
    'noiDung=' + String(o.noiDung || ''),
    'nguoiGhi=' + String(o.nguoiGhi || ''),
    'gioMayChu=' + String(gioMayChu || '')
  ].join('\n');
}

function gitaKyChungCu_(chuoi) {
  var b = Utilities.computeHmacSha256Signature(chuoi, gitaKhoaChungCu_(), Utilities.Charset.UTF_8);
  return b.map(function (x) { return ('0' + (x & 0xFF).toString(16)).slice(-2); }).join('');
}

function gitaTrangChungCu_() {
  var so = gitaSo_();
  var tr = so.getSheetByName(GITA_TRANG_CHUNGCU);
  if (!tr) {
    tr = so.insertSheet(GITA_TRANG_CHUNGCU);
    tr.appendRow(GITA_COT_CHUNGCU);
    tr.setFrozenRows(1);
  }
  return tr;
}

function gitaTimChungCu_(tr, ma) {
  var v = tr.getDataRange().getValues();
  for (var i = 1; i < v.length; i++) if (String(v[i][0]) === String(ma)) return { hang: i + 1, d: v[i] };
  return null;
}

/**
 * fn:'kyChungCu'
 * Thân: { u, token, cc: { nhiemVu, ngayLam, loai, noiDung, dinhChinhCho? } }
 * Trả:  { ok, bienNhan: { ma, gioMayChu, chuKy } }
 *
 * nguoiGhi lấy từ PHIÊN, không lấy từ thân yêu cầu. Nhận từ thân thì
 * người ta ghi tên ai cũng được, và cả bảng chứng cứ mất nghĩa.
 */
function gitaKyChungCu_YC_(y, hoSo) {
  var cc = y.cc || {};
  var thieu = [];
  ['nhiemVu', 'ngayLam', 'loai', 'noiDung'].forEach(function (k) {
    if (!String(cc[k] || '').trim()) thieu.push(k);
  });
  if (thieu.length) return { ok: false, error: 'Thiếu trường: ' + thieu.join(', ') };
  if (String(cc.noiDung).length > 4000) return { ok: false, error: 'Nội dung quá 4000 ký tự.' };

  var tr = gitaTrangChungCu_();
  if (cc.dinhChinhCho && !gitaTimChungCu_(tr, cc.dinhChinhCho))
    return { ok: false, error: 'Không thấy bản được đính chính.' };

  var gio = new Date().toISOString();
  var o = { nhiemVu: cc.nhiemVu, ngayLam: cc.ngayLam, loai: cc.loai,
    noiDung: String(cc.noiDung).trim(), nguoiGhi: hoSo.u };
  var chuKy = gitaKyChungCu_(gitaChuanChungCu_(o, gio));
  var ma = 'CC-' + Utilities.getUuid().slice(0, 8) + '-' + chuKy.slice(0, 6);

  tr.appendRow([ma, o.nhiemVu, o.ngayLam, o.loai, o.noiDung, o.nguoiGhi,
    gio, chuKy, '', '', cc.dinhChinhCho || '', (hoSo.phien && hoSo.phien.uid) || hoSo.u]);

  audit_(hoSo.phien, 'CHUNGCU_KY', ma, o.nhiemVu);
  return { ok: true, bienNhan: { ma: ma, gioMayChu: gio, chuKy: chuKy } };
}

/**
 * fn:'xacNhanChungCu'  — nhà ĐƯỢC KÈM đối chứng.
 * Thân: { u, token, ma }
 *
 * Người ghi không tự xác nhận cho mình được. Đây là chỗ chống làm giả
 * mạnh nhất của cả hệ: một người không tự dựng được hồ sơ cho mình.
 */
function gitaXacNhanChungCu_(y, hoSo) {
  var tr = gitaTrangChungCu_();
  var t = gitaTimChungCu_(tr, y.ma);
  if (!t) return { ok: false, error: 'Không thấy bản ghi này.' };
  var nguoiGhi = String(t.d[5] || '');
  if (String(hoSo.u) === nguoiGhi)
    return { ok: false, error: 'Người ghi không tự xác nhận cho mình được.' };
  if (String(t.d[8] || '').trim())
    return { ok: false, error: 'Bản này đã được xác nhận rồi.' };
  var gio = new Date().toISOString();
  tr.getRange(t.hang, 9).setValue(hoSo.u);
  tr.getRange(t.hang, 10).setValue(gio);
  audit_(hoSo.phien, 'CHUNGCU_XACNHAN', y.ma, '');
  return { ok: true, xacNhan: { ai: hoSo.u, luc: gio } };
}

/**
 * fn:'soiChungCu' — đối chiếu một bản của máy khách với bản máy chủ.
 * Thân: { u, token, ma }
 * Trả về ĐỦ để bên thứ ba đối chiếu, và KHÔNG trả khoá.
 */
function gitaSoiChungCu_(y, hoSo) {
  var tr = gitaTrangChungCu_();
  var t = gitaTimChungCu_(tr, y.ma);
  if (!t) return { ok: false, error: 'Không thấy bản ghi này.' };
  var o = { nhiemVu: t.d[1], ngayLam: t.d[2], loai: t.d[3], noiDung: t.d[4], nguoiGhi: t.d[5] };
  var gio = String(t.d[6]);
  var lai = gitaKyChungCu_(gitaChuanChungCu_(o, gio));
  return { ok: true,
    ma: t.d[0], gioMayChu: gio, chuKy: t.d[7],
    khop: safeEqual_(lai, String(t.d[7])),
    xacNhanBoi: t.d[8] || null, xacNhanLuc: t.d[9] || null,
    dinhChinhCho: t.d[10] || null,
    /* Bản máy chủ trả về nguyên văn để bên kia tự so — không so hộ. */
    ban: o };
}


/* ═══════════════════════════════════════════════════════════════════════
   ĐĂNG KÝ — OTP, kích hoạt, mã số khách hàng, nâng tầng
   (nguyên văn server/GITA_DangKy.gs)
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * ═══════════════════════════════════════════════════════════════
 * GITA 365 — ĐĂNG KÝ · OTP · KÍCH HOẠT
 *
 * Đúng luồng anh Quang đặt:
 *   Đăng ký → điền đủ thông tin → nhận mã OTP qua email → kích link
 *   đăng nhập lại → đặt mật khẩu → đăng ký thành công → có mã số khách hàng.
 *
 * Ba chỗ chặt trong luồng này:
 *   · Mã OTP không lưu dạng đọc được. Chỉ lưu bản băm, sống 15 phút,
 *     sai năm lần là huỷ.
 *   · Không bao giờ nói cho người gửi biết email đã đăng ký hay chưa —
 *     nếu không, bất kỳ ai cũng dò được danh sách khách hàng của GITA.
 *   · Tài khoản chỉ sinh ra ở bước cuối, sau khi đặt mật khẩu. Trước đó
 *     bản ghi nằm trong bảng chờ, không phải bảng người dùng.
 * ═══════════════════════════════════════════════════════════════
 */

var GITA_OTP_PHUT     = 15;   /* mã sống bao lâu */
var GITA_OTP_SAI_TOI  = 5;    /* sai bao nhiêu lần thì huỷ */
var GITA_KICHHOAT_GIO = 24;   /* link kích hoạt sống bao lâu */
var GITA_TRAN_DK_EMAIL_GIO = 3;    /* mỗi địa chỉ email: 3 lượt đăng ký mỗi giờ */
var GITA_TRAN_DK_TONG_GIO  = 60;   /* cả hệ thống: 60 lượt mỗi giờ */

function gitaOtpMoi_() {
  var n = '';
  for (var i = 0; i < 6; i++) n += Math.floor(Math.random() * 10);
  return n;
}

function gitaChoTheoEmail_(email) {
  var e = String(email || '').trim().toLowerCase();
  return Store.all('dangKyCho').filter(function (x) {
    return String(x.email || '').toLowerCase() === e && x.trangThai !== 'xong';
  })[0] || null;
}

function gitaEmailDaCo_(email) {
  var e = String(email || '').trim().toLowerCase();
  return !!Store.all('users').filter(function (x) {
    return String(x.email || '').toLowerCase() === e && !x.deletedAt;
  })[0];
}

/* ═══════════════ BƯỚC 1 · GỬI THÔNG TIN ĐĂNG KÝ ═══════════════ */
function gitaDangKy_(y) {
  var d = y.hoSo || {};
  var email = String(d.email || '').trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
    return {ok: false, error: 'Email chưa đúng định dạng.'};
  if (!String(d.hoTen || '').trim() || !String(d.tenCon || '').trim())
    return {ok: false, error: 'Chưa điền đủ họ tên phụ huynh và tên con.'};
  var dt = String(d.dienThoai || '').replace(/[\s.\-]/g, '');
  if (!/^(0|\+84)[0-9]{9,10}$/.test(dt))
    return {ok: false, error: 'Số điện thoại chưa đúng định dạng Việt Nam.'};

  var thongBao = 'Nếu email này chưa có tài khoản, mã sáu số vừa được gửi tới ' + email +
                 '. Mã sống ' + GITA_OTP_PHUT + ' phút.';

  /* ── Trần gửi thư ──
     Đây là cửa duy nhất không cần phiên mà lại gửi email tới địa chỉ do
     người gọi tự đặt, với tên do người gọi tự viết. Không có trần thì một
     máy gửi được hàng trăm thư mang nội dung tuỳ ý, và hạn 100 thư/ngày của
     tài khoản Google cạn sạch — kéo theo OTP và mã lấy lại mật khẩu của
     khách hàng thật ngừng gửi cả ngày.

     Đếm hai lớp: theo địa chỉ nhận, và theo tổng số lượt của cả hệ thống. */
  var cache = CacheService.getScriptCache();
  var kEmail = 'DK_DEM_' + email;
  var nEmail = Number(cache.get(kEmail) || 0) + 1;
  cache.put(kEmail, String(nEmail), 3600);
  if (nEmail > GITA_TRAN_DK_EMAIL_GIO) {
    audit_(null, 'DANG_KY_CHAN', email, 'Vượt ' + GITA_TRAN_DK_EMAIL_GIO + ' lượt/giờ cho một email');
    return {ok: true, thongBao: thongBao};
  }
  var kChung = 'DK_DEM_TONG';
  var nChung = Number(cache.get(kChung) || 0) + 1;
  cache.put(kChung, String(nChung), 3600);
  if (nChung > GITA_TRAN_DK_TONG_GIO) {
    audit_(null, 'DANG_KY_CHAN_TONG', email,
      'Cả hệ thống vượt ' + GITA_TRAN_DK_TONG_GIO + ' lượt đăng ký/giờ');
    return {ok: true, thongBao: thongBao};
  }

  /* Email đã có tài khoản: dừng ở đây nhưng trả lời y hệt trường hợp thường,
     và gửi một thư nhắc rằng tài khoản đã tồn tại. Người thật vẫn biết
     phải làm gì; người dò danh sách thì không biết thêm điều gì. */
  if (gitaEmailDaCo_(email)) {
    try {
      MailApp.sendEmail(email, 'GITA 365 — email này đã có tài khoản',
        'Chào anh chị,\n\nCó một lượt đăng ký vừa dùng địa chỉ email này, nhưng email này đã ' +
        'có tài khoản GITA 365 rồi.\n\nNếu là anh chị: xin mời đăng nhập như bình thường, ' +
        'hoặc dùng mục "Quên mật khẩu" nếu không nhớ.\nNếu không phải anh chị: bỏ qua thư này, ' +
        'tài khoản vẫn an toàn.\n\nCần người thật: 08.5555.4688\nHọc viện GITA');
    } catch (e) {}
    audit_(null, 'DANG_KY_TRUNG_EMAIL', email, '');
    return {ok: true, thongBao: thongBao};
  }

  var cu = gitaChoTheoEmail_(email);
  var ma = gitaOtpMoi_();
  var muoi = Utilities.getUuid();
  var ban = {
    email: email,
    /* Cắt ngắn và bỏ ký tự xuống dòng: tên này đi vào thân thư gửi ra ngoài,
       để nguyên thì thành chỗ nhét nội dung tuỳ ý vào thư mang tên GITA. */
    hoTen: String(d.hoTen || '').replace(/[\r\n]+/g, ' ').trim().slice(0, 60),
    dienThoai: dt,
    tenCon: String(d.tenCon || '').trim(),
    lop: String(d.lop || '').trim(),
    tinh: String(d.tinh || '').trim(),
    maGioiThieu: String(d.maGioiThieu || '').trim(),
    otpSalt: muoi, otpHash: hashPw_(ma, muoi),
    otpHan: Date.now() + GITA_OTP_PHUT * 60000, otpSai: 0,
    tokenKichHoat: '', tokenHan: 0, trangThai: 'choOtp'
  };

  if (cu) Store.update('dangKyCho', cu.id, ban);
  else { ban.id = gitaMaMoi_('D'); ban.createdAt = new Date().toISOString(); Store.insert('dangKyCho', ban); }

  try {
    MailApp.sendEmail(email, 'GITA 365 — mã xác nhận đăng ký',
      'Chào ' + ban.hoTen + ',\n\nMã xác nhận của anh chị là: ' + ma + '\n\n' +
      'Mã sống ' + GITA_OTP_PHUT + ' phút. Nhập mã vào màn hình đang mở để đi tiếp.\n\n' +
      'Nếu anh chị không đăng ký, bỏ qua thư này.\n\n' +
      'Cần người thật: 08.5555.4688\nHọc viện GITA');
  } catch (e) {
    return {ok: false, error: 'Máy chủ chưa gửi được thư. Kiểm lại quyền gửi email của dự án.'};
  }

  audit_(null, 'DANG_KY_GUI_OTP', email, 'Chờ xác nhận');
  return {ok: true, thongBao: thongBao};
}

/* ═══════════════ BƯỚC 2 · GỬI LẠI MÃ ═══════════════ */
function gitaGuiLaiOtp_(y) {
  var email = String(y.email || '').trim().toLowerCase();
  var c = gitaChoTheoEmail_(email);
  var thongBao = 'Nếu email này đang chờ xác nhận, mã mới vừa được gửi.';
  if (!c) return {ok: true, thongBao: thongBao};

  var ma = gitaOtpMoi_(), muoi = Utilities.getUuid();
  Store.update('dangKyCho', c.id, {
    otpSalt: muoi, otpHash: hashPw_(ma, muoi),
    otpHan: Date.now() + GITA_OTP_PHUT * 60000, otpSai: 0
  });
  try {
    MailApp.sendEmail(email, 'GITA 365 — mã xác nhận mới',
      'Mã mới của anh chị: ' + ma + '\n\nMã cũ đã hết hiệu lực. Mã này sống ' +
      GITA_OTP_PHUT + ' phút.\n\nHọc viện GITA · 08.5555.4688');
  } catch (e) {}
  audit_(null, 'DANG_KY_GUI_LAI_OTP', email, '');
  return {ok: true, thongBao: thongBao};
}

/* ═══════════════ BƯỚC 3 · XÁC THỰC MÃ ═══════════════ */
function gitaXacThucOtp_(y) {
  var email = String(y.email || '').trim().toLowerCase();
  var ma = String(y.ma || '').replace(/\D/g, '');
  var c = gitaChoTheoEmail_(email);
  var sai = {ok: false, error: 'Mã chưa đúng hoặc đã hết hạn.'};
  if (!c || c.trangThai !== 'choOtp') return sai;

  if (Number(c.otpHan || 0) < Date.now()) return {ok: false, error: 'Mã đã hết hạn. Bấm gửi lại mã.'};
  if (Number(c.otpSai || 0) >= GITA_OTP_SAI_TOI)
    return {ok: false, error: 'Mã đã bị huỷ vì nhập sai quá nhiều lần. Bấm gửi lại mã.'};

  if (!safeEqual_(hashPw_(ma, c.otpSalt), c.otpHash)) {
    Store.update('dangKyCho', c.id, {otpSai: Number(c.otpSai || 0) + 1});
    var con = GITA_OTP_SAI_TOI - (Number(c.otpSai || 0) + 1);
    return {ok: false, error: 'Mã chưa đúng.' + (con > 0 ? ' Còn ' + con + ' lần nhập.' : ' Mã đã bị huỷ.')};
  }

  /* Đúng mã — sinh link kích hoạt, gửi qua chính email đó. Người dùng phải
     quay lại từ hòm thư, đúng như luồng anh Quang đặt: "kích link đăng nhập lại". */
  var token = gitaMaMoi_('K') + gitaMaMoi_('');
  Store.update('dangKyCho', c.id, {
    trangThai: 'choKichHoat', tokenKichHoat: token,
    tokenHan: Date.now() + GITA_KICHHOAT_GIO * 3600e3,
    otpHash: '', otpSalt: ''
  });

  var lien = gitaDiaChiUngDung_() + '#kichhoat=' + token;
  try {
    MailApp.sendEmail(email, 'GITA 365 — bước cuối để mở tài khoản',
      'Chào ' + c.hoTen + ',\n\nMã xác nhận đã đúng. Còn một bước: bấm vào đường dẫn dưới đây ' +
      'để đặt mật khẩu và mở tài khoản.\n\n' + lien + '\n\n' +
      'Đường dẫn sống ' + GITA_KICHHOAT_GIO + ' giờ.\n\nHọc viện GITA · 08.5555.4688');
  } catch (e) {
    return {ok: false, error: 'Máy chủ chưa gửi được thư kích hoạt.'};
  }

  audit_(null, 'DANG_KY_XAC_THUC_OTP', email, 'Đã gửi link kích hoạt');
  return {ok: true, thongBao: 'Mã đúng. Thư có đường dẫn đặt mật khẩu vừa được gửi tới ' + email + '.'};
}

/** Địa chỉ bản web, để dựng link kích hoạt. Đặt trong Script Properties. */
function gitaDiaChiUngDung_() {
  return PropertiesService.getScriptProperties().getProperty('GITA_DIA_CHI_WEB') ||
         'https://gita.edu.vn/';
}

/* ═══════════════ BƯỚC 4 · KÍCH HOẠT VÀ ĐẶT MẬT KHẨU ═══════════════ */
function gitaKichHoat_(y) {
  var token = String(y.token || '');
  var mk = String(y.mk || '');
  /* Dùng đúng luật mạnh yếu như chỗ đổi mật khẩu. Trước đây chỗ này chỉ đòi
     đủ 10 ký tự, nên '1234567890' mở được tài khoản mới trong khi chính mật
     khẩu ấy bị từ chối khi đổi — luật chặt ở cửa sau, hở ở cửa trước. */
  var manh = checkPwStrength_(mk);
  if (manh !== true && manh) return {ok: false, code: 'WEAK', error: String(manh)};

  var c = Store.all('dangKyCho').filter(function (x) {
    return String(x.tokenKichHoat || '') === token && x.trangThai === 'choKichHoat';
  })[0];
  if (!c) return {ok: false, error: 'Đường dẫn không còn hiệu lực. Xin đăng ký lại.'};
  if (Number(c.tokenHan || 0) < Date.now())
    return {ok: false, error: 'Đường dẫn đã hết hạn. Xin đăng ký lại.'};

  /* Mã số khách hàng: đánh số liên tục, không đoán được ai là ai từ mã.
     Phải KHOÁ: hai gia đình bấm link kích hoạt cùng lúc thì hai lần chạy
     song song cùng đọc N và cùng sinh GITA-000(N+1) — hai nhà chung một mã,
     mà việc nâng tầng lại dò phiếu thanh toán theo đúng mã đó. */
  var khoa = null;
  try {
    khoa = LockService.getScriptLock();
    khoa.waitLock(20000);
  } catch (e) {
    return {ok: false, error: 'Máy chủ đang bận. Bấm lại đường dẫn sau ít giây.'};
  }

  var maKH;
  try {
    var soHienCo = Store.all('users').filter(function (x) { return x.maKhachHang; }).length;
    maKH = 'GITA-' + ('0000' + (soHienCo + 1)).slice(-4);

  var muoi = Utilities.getUuid();
  var uid = gitaMaMoi_('U');
  var maHV = gitaMaMoi_('H');

  Store.insert('students', {
    id: maHV, hoTen: c.tenCon, lop: c.lop, tinh: c.tinh,
    tier: 0, status: 'moi', kpi: 0, phuHuynhId: uid, coach: '',
    createdAt: new Date().toISOString()
  });

  Store.insert('users', {
    id: uid, username: c.email, hoTen: c.hoTen, email: c.email, dienThoai: c.dienThoai,
    role: 'R13', portal: 'ph', studentId: maHV,
    pwSalt: muoi, pwHash: hashPw_(mk, muoi),
    active: 'TRUE', createdAt: new Date().toISOString(), updatedAt: '', deletedAt: '',
    maKhachHang: maKH, boTro: c.maGioiThieu || ''
  });

    Store.update('dangKyCho', c.id, {trangThai: 'xong', tokenKichHoat: '', tokenHan: 0});
  } finally {
    try { khoa.releaseLock(); } catch (e) {}
  }

  audit_({uid: uid, username: c.email}, 'DANG_KY_XONG', maKH,
    'Tầng 0 · chờ hoàn thành KPI và xác nhận thanh toán' +
    (c.maGioiThieu ? ' · bảo trợ ' + c.maGioiThieu : ''));

  try {
    MailApp.sendEmail(c.email, 'GITA 365 — tài khoản đã mở',
      'Chào ' + c.hoTen + ',\n\nTài khoản của gia đình đã mở.\n' +
      'Mã số khách hàng: ' + maKH + '\nTên đăng nhập: ' + c.email + '\n\n' +
      'Hiện nhà mình đang ở chặng khởi đầu. Tư vấn của GITA sẽ liên hệ trong 24 giờ tới ' +
      'để cùng nhìn lại và chọn chặng phù hợp.\n\nHọc viện GITA · 08.5555.4688');
  } catch (e) {}

  return {ok: true, maKhachHang: maKH, email: c.email};
}

/* ═══════════════ NÂNG TẦNG ═══════════════
   Luồng anh Quang đặt: hoàn thành KPI tầng → xác nhận thanh toán → check
   cả hai → nâng tầng → mở quyền tương ứng.
   Máy chủ KHÔNG tự nâng. Phải có người bậc ≤ 3 bấm, và cả hai điều kiện
   phải đúng, nếu không thì từ chối kèm lý do rõ ràng. */
function gitaNangTang_(y, hoSo) {
  var lv = (ROLES[hoSo.role] || {lv: 99}).lv;
  if (lv > 3) return {ok: false, error: 'Chỉ R01–R03 nâng tầng được.'};

  var hv = Store.find('students', String(y.maHocVien || ''));
  if (!hv) return {ok: false, error: 'Không tìm thấy hồ sơ học viên.'};

  var tangMoi = Number(y.tang || 0);
  if (!(tangMoi >= 1 && tangMoi <= 5)) return {ok: false, error: 'Tầng phải từ 1 đến 5.'};
  if (tangMoi !== Number(hv.tier || 0) + 1)
    return {ok: false, error: 'Chỉ nâng được một tầng mỗi lần, theo thứ tự.'};

  var kpi = Number(hv.kpi || 0);
  if (kpi < 80)
    return {ok: false, error: 'KPI tầng đang là ' + kpi + '%. Cửa nâng tầng là 80%.'};

  /* Mã khách hàng phải là mã của CHÍNH nhà này.
     Trước đây mã lấy thẳng từ thân yêu cầu và không đối chiếu với hồ sơ học
     viên, nên một phiếu thanh toán của nhà A mở được tầng cho con nhà B —
     chỉ cần gõ nhầm hoặc cố ý gõ mã của nhà A. */
  var ph = null;
  try { ph = Store.find('users', hv.phuHuynhId); } catch (e) { ph = null; }
  var maNha = ph && ph.maKhachHang;
  if (!maNha) return {ok: false, error: 'Hồ sơ học viên chưa gắn với tài khoản phụ huynh nào.'};
  if (String(y.maKhachHang || '') !== String(maNha))
    return {ok: false, error: 'Mã khách hàng không khớp với hồ sơ học viên này.'};

  /* Phiếu thanh toán dùng MỘT LẦN. Không đánh dấu thì cùng một phiếu mở được
     tầng cho bao nhiêu học viên cũng được. */
  var tt = Store.all('thanhToan').filter(function (x) {
    return String(x.maKhachHang) === String(maNha) &&
           Number(x.tier) === tangMoi && String(x.trangThai) === 'daXacNhan' &&
           !isTrue(x.daDung);
  })[0];
  if (!tt) return {ok: false,
    error: 'Chưa có xác nhận thanh toán còn hiệu lực cho tầng ' + tangMoi + '.'};

  Store.update('thanhToan', tt.id, {
    daDung: 'TRUE', dungChoHocVien: hv.id, dungLuc: new Date().toISOString()
  });
  Store.update('students', hv.id, {tier: tangMoi, status: 'dangHoc'});
  audit_(hoSo.phien, 'NANG_TANG', hv.id,
    'Lên tầng ' + tangMoi + ' · KPI ' + kpi + '% · phiếu ' + tt.id + ' · nhà ' + maNha);
  return {ok: true, tang: tangMoi, kpi: kpi};
}


/* ═══════════════════════════════════════════════════════════════════════
   DỌN BẢNG — luật giữ cho bốn bảng chỉ lớn lên, và bộ hẹn giờ
   (nguyên văn server/GITA_DonDep.gs)
   ═══════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v9.79 — DỌN BẢNG, VÀ VÌ SAO PHẢI CÓ

   ĐO ĐƯỢC TRƯỚC KHI VIẾT

   Bốn bảng trong hệ chỉ lớn lên và không bao giờ nhỏ đi:

     sessions        mỗi lượt đăng nhập thêm một dòng; đăng xuất chỉ
                     đặt exp = 0, dòng vẫn nằm đó
     audit           mỗi hành động một dòng, không bao giờ bớt
     dangKyCho       mỗi lượt đăng ký một dòng, kể cả lượt bỏ dở
     hosoAppSaoLuu   mỗi lần đồng bộ một bản sao lưu

   Và Store.doc() đọc CẢ TRANG mỗi lần chạm tới một bảng. Mọi yêu cầu
   có xác thực đều chạm bảng sessions.

   Một trăm người dùng, hai lượt đăng nhập mỗi ngày:

       sau 1 tháng     6.000 dòng
       sau 6 tháng    36.000 dòng
       sau 1 năm      73.000 dòng   ← đọc lại đủ chừng ấy MỖI LƯỢT GỌI

   Không phải một ngày nào đó hệ đứng hẳn. Nó chậm dần, đều đặn, và
   không ai chỉ được ra ngày nó bắt đầu chậm.

   BA LUẬT CỦA BỘ DỌN NÀY

   1. XOÁ THEO LUẬT ĐÃ KHAI, KHÔNG THEO CẢM GIÁC.
      Mỗi bảng khai rõ giữ theo cột nào, giữ bao lâu, và VÌ SAO chừng
      ấy. Đổi một con số là đổi một dòng trong GITA_HAN, không phải đi
      sửa mã.

   2. KHÔNG BAO GIỜ XOÁ THỨ CÒN HIỆU LỰC.
      Phiên chưa hết hạn, đăng ký đang chờ kích hoạt, bản sao lưu gần
      nhất — không được đụng, kể cả khi bảng đã quá to. Bảng to là
      chuyện của hiệu năng; xoá nhầm là chuyện của người dùng.

   3. NÓI RA ĐÃ XOÁ BAO NHIÊU.
      Mỗi lượt dọn ghi một dòng vào audit. Một bộ dọn chạy im lặng là
      một bộ dọn không ai kiểm được — và ngày nó xoá nhầm thì cũng
      không ai biết nó đã chạy.
   ═══════════════════════════════════════════════════════════════ */

/* Luật giữ, khai một chỗ. Mỗi mục nói đủ ba điều: giữ theo cột nào,
   giữ bao lâu, và vì sao chừng ấy chứ không phải chừng khác. */
var GITA_HAN = {
  sessions: {
    cot: 'exp', kieu: 'moc', ngay: 2, cotPhu: 'createdAt',
    vi: 'Phiên hết hạn rồi thì không ai dùng lại được nữa. Giữ thêm hai ngày ' +
        'để còn tra lại "ai đăng nhập lúc nào" khi có sự cố, rồi bỏ.',
    viCotPhu: 'ĐĂNG XUẤT đặt exp = 0, không đặt một mốc quá khứ. Luật "quá hạn ' +
        'hơn hai ngày" đọc exp = 0 thành "chưa tới hạn" và bỏ sót VĨNH VIỄN đúng ' +
        'những dòng chắc chắn đã chết. Nên dòng nào exp không dương thì tính tuổi ' +
        'theo createdAt.'
  },
  audit: {
    cot: 'luc', kieu: 'ngay', ngay: 400, tran: 50000,
    vi: 'Bốn trăm ngày phủ trọn một năm cộng một quý — đủ để đối chiếu cùng kỳ ' +
        'năm ngoái. Trần năm mươi nghìn dòng là chốt chặn thứ hai: một đợt lỗi ' +
        'lặp có thể sinh vài chục nghìn dòng trong một ngày, và luật theo NGÀY ' +
        'không chặn được chuyện ấy.'
  },
  dangKyCho: {
    cot: 'createdAt', kieu: 'ngay', ngay: 30, giuKhi: 'dangCho',
    vi: 'Đăng ký bỏ dở quá ba mươi ngày thì người ta không quay lại nữa. Lượt ' +
        'ĐANG CHỜ kích hoạt thì giữ nguyên bất kể bao lâu — người ta có thể mở ' +
        'thư cũ và bấm vào.'
  },
  hosoAppSaoLuu: {
    kieu: 'moiNguoi', giu: 10, khoaNguoi: 'uid', cot: 'luc',
    vi: 'Mười bản sao lưu gần nhất mỗi người. Sao lưu để lùi lại khi hỏng, mà ' +
        'không ai lùi quá mười bước — bản thứ mười một là dung lượng, không ' +
        'phải bảo hiểm.'
  }
};

/* Bảng nào KHÔNG được đụng tới, và vì sao. Kê ra để lần sau không ai
   hỏi "sao bảng này không dọn" rồi tự thêm luật cho nó. */
var GITA_KHONG_DON = {
  users:     'Hồ sơ người dùng. Nghỉ việc thì đánh dấu deletedAt, không xoá dòng.',
  students:  'Hồ sơ học viên — hồ sơ ca, phải giữ theo quy định lưu trữ.',
  hosoApp:   'Bản đang dùng của mỗi người. Xoá là mất dữ liệu đang chạy.',
  thanhToan: 'Chứng từ tài chính. Không xoá, không bao giờ.',
  tailieu:   'Tài liệu đã gửi cho khách — là bằng chứng đã gửi cái gì.'
};

/* ═══════════════ CHẠY ═══════════════

   Trả về một bản kê: bảng nào, xoá bao nhiêu, còn lại bao nhiêu, và
   vì sao. Gọi được bằng tay từ trình soạn Apps Script, hoặc để bộ
   hẹn giờ gọi mỗi đêm. */
function gitaDonDep(chiXem) {
  var nay = Date.now();
  var ke = [], tongXoa = 0;

  Object.keys(GITA_HAN).forEach(function (bang) {
    var l = GITA_HAN[bang], ds;
    try { ds = Store.all(bang); }
    catch (e) { ke.push({bang: bang, loi: 'không đọc được: ' + e.message}); return; }

    var boDi = [];

    if (l.kieu === 'moc') {
      /* Cột giữ một mốc thời gian tính bằng mili-giây. Quá hạn thêm
         l.ngay ngày nữa thì bỏ. */
      var han = nay - l.ngay * 86400e3;
      ds.forEach(function (x) {
        var m = Number(x[l.cot] || 0);
        if (m > 0) { if (m < han) boDi.push(x.id); return; }
        /* Mốc không dương: dòng đã bị đóng bằng tay. Tính tuổi theo
           cột phụ — xem viCotPhu. */
        if (!l.cotPhu) return;
        var t = Date.parse(x[l.cotPhu]);
        if (!isNaN(t) && t < han) boDi.push(x.id);
      });

    } else if (l.kieu === 'ngay') {
      var hanN = nay - l.ngay * 86400e3;
      ds.forEach(function (x) {
        var t = Date.parse(x[l.cot]);
        if (!isNaN(t) && t < hanN) boDi.push(x.id);
      });
      /* Trần: quá nhiều dòng thì bỏ thêm phần CŨ NHẤT cho về trần. */
      if (l.tran && ds.length - boDi.length > l.tran) {
        var conLai = ds.filter(function (x) { return boDi.indexOf(x.id) < 0; });
        conLai.sort(function (a, b) {
          return (Date.parse(a[l.cot]) || 0) - (Date.parse(b[l.cot]) || 0);
        });
        var duThua = conLai.length - l.tran;
        for (var i = 0; i < duThua; i++) boDi.push(conLai[i].id);
      }

    } else if (l.kieu === 'moiNguoi') {
      /* Giữ N bản gần nhất cho MỖI người. Gom theo khoá người, xếp
         mới trước, bỏ phần đuôi. */
      var nhom = {};
      ds.forEach(function (x) {
        var k = String(x[l.khoaNguoi] || '(không rõ)');
        (nhom[k] || (nhom[k] = [])).push(x);
      });
      Object.keys(nhom).forEach(function (k) {
        var g = nhom[k];
        g.sort(function (a, b) {
          return (Date.parse(b[l.cot]) || 0) - (Date.parse(a[l.cot]) || 0);
        });
        for (var i = l.giu; i < g.length; i++) boDi.push(g[i].id);
      });
    }

    /* Luật 2: không đụng thứ còn hiệu lực. */
    if (l.giuKhi === 'dangCho') {
      var giuLai = {};
      ds.forEach(function (x) {
        if (String(x.trangThai || '').toUpperCase().indexOf('CHO') >= 0) giuLai[String(x.id)] = 1;
      });
      boDi = boDi.filter(function (id) { return !giuLai[String(id)]; });
    }

    var so = 0;
    if (boDi.length && !chiXem) {
      try { so = Store.xoa(bang, boDi); }
      catch (e) { ke.push({bang: bang, loi: 'không xoá được: ' + e.message}); return; }
    } else if (boDi.length) {
      so = boDi.length;                    /* chỉ xem: đếm, không đụng */
    }
    tongXoa += so;
    ke.push({bang: bang, truoc: ds.length, xoa: so, con: ds.length - so, vi: l.vi});
  });

  /* Luật 3: nói ra. Ghi vào audit SAU khi dọn, để chính dòng này
     không bị lượt dọn vừa rồi cuốn đi. */
  var tom = ke.map(function (x) {
    return x.loi ? (x.bang + ': ' + x.loi) : (x.bang + ' ' + x.truoc + '→' + x.con);
  }).join(' · ');
  if (!chiXem) {
    try { audit_(null, 'DON_DEP', 'tự động', 'xoá ' + tongXoa + ' dòng · ' + tom); } catch (e) {}
  }

  return {ok: true, chiXem: !!chiXem, tongXoa: tongXoa, ke: ke,
    luc: new Date().toISOString()};
}

/* ═══════════════ HẸN GIỜ ═══════════════

   Chạy MỘT LẦN từ trình soạn Apps Script để đặt lịch dọn mỗi đêm.
   Gọi lại nhiều lần cũng không sinh ra nhiều bộ hẹn giờ trùng nhau —
   nó gỡ bộ cũ trước khi đặt bộ mới. Bộ hẹn giờ trùng là chuyện thật:
   mỗi lần bấm chạy lại là thêm một cái, và tới lúc phát hiện thì đã
   có sáu bộ cùng dọn một lúc. */
function gitaDatLichDon() {
  var da = 0;
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'gitaDonDep') { ScriptApp.deleteTrigger(t); da++; }
  });
  ScriptApp.newTrigger('gitaDonDep').timeBased().atHour(3).everyDays(1).create();
  return {ok: true, goBoCu: da,
    loi: 'Đã đặt lịch dọn mỗi ngày lúc 3 giờ sáng' + (da ? ' (gỡ ' + da + ' bộ cũ)' : '')};
}

/* Xem trước KHÔNG XOÁ GÌ — đếm xem lượt dọn tới sẽ bỏ bao nhiêu.
   Có phép này thì không ai phải chạy thật để biết nó định làm gì.

   TRUYỀN CỜ VÀO, KHÔNG TRÁO Store.xoa. Bản đầu của tôi tráo hàm xoá
   bằng một hàm chỉ đếm rồi trả lại trong finally — đúng cái bẫy đã
   dính bốn lần liền ở phía máy khách (aiCoKhan, aiTrongTang,
   tlBanGhiKho, LA_KHACH). Tráo một hàm toàn cục thì chỉ cần một lỗi
   ném ra giữa chừng là phép XOÁ THẬT nằm nguyên trạng thái giả. */
function gitaXemTruocDon() { return gitaDonDep(true); }


/* ═══════════════════════════════════════════════════════════════════════
   ĐỒNG BỘ — hồ sơ và cài đặt giữa bản web và bản cài trên máy
   (nguyên văn server/GITA_DongBo.gs)
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * ═══════════════════════════════════════════════════════════════
 * GITA 365 — ĐỒNG BỘ APP ↔ WEB APP
 * Dán vào cùng dự án Apps Script với GITA_CapPhep.gs.
 *
 * App máy tính giữ dữ liệu trong máy và chạy được khi mất mạng.
 * Có mạng thì đẩy phần đã đổi lên máy chủ Admin và kéo phần mới về.
 * Xung đột giải bằng mốc thời gian từng trường, không ghi đè cả khối.
 * ═══════════════════════════════════════════════════════════════
 */

/** Trần kích thước một lần đẩy — chặn đẩy cả kho lên bằng một lệnh. */
var GITA_TRAN_DONGBO_KB = 512;

/** Những nhóm dữ liệu được phép đồng bộ. Ngoài danh sách này là từ chối. */
/* Phải khớp đúng NHOM trong src/dong-bo.js. Lệch một tên là dữ liệu đi lên
   rồi bị bỏ vào danh sách "bỏ qua" mà người dùng không thấy gì bất thường. */
var GITA_NHOM_DONGBO = ['checks', 'journal', 'vision', 'test', 'mood', 'thuvien', 'minhchung', 'bando', 'chuyen', 'nhatky', 'baithi', 'thoigian', 'sathach', 'khoahoc', 'tgdoc'];

function gitaKhoaHoSo_(uid) { return 'HOSO_' + uid; }

/**
 * Thân yêu cầu:
 *   { fn:'dongBo', u, token, tuLuc: <ISO|null>, day: { checks:{...}, journal:{...}, ... },
 *     mocTruong: { 'checks.kpi-1-0': 1787900000000, ... } }
 * Trả về:
 *   { ok, keo: {...}, mocTruong: {...}, mocMayChu: <ISO>, boQua: [] }
 */
/* Cài đặt của chủ hệ thống — bố cục, chữ hiển thị, bảng phân quyền.
   Đồng bộ theo cả cụm: ai sửa sau thì bản đó thắng. Chỉ vai bậc ≤ 2
   được ghi; vai khác chỉ NHẬN về, không đẩy lên. */
function gitaCaiDat_(y, hoSo) {
  var kho = PropertiesService.getScriptProperties();
  var cu = gitaDocCaiDat_();
  var truoc = JSON.parse(JSON.stringify(cu));   /* bản trước khi sửa, để trả lại nếu cụm quá lớn */
  var doiCum = {};                              /* cụm nào thật sự đổi — chỉ ghi lại những cụm ấy */
  var lv = (ROLES[hoSo.role] || { lv: 99 }).lv;
  var gui = y.caiDat || {}, doi = 0;

  /* Hai cụm khác luật: tư liệu Tư vấn và Coach gửi thêm cho từng nhà, và
     những lời xin đang chờ. Ghi được từ Tư vấn trở lên (bậc ≤ 11) — vì
     chính họ là người đứng giữa kho và gia đình. Gia đình chỉ đặt lời xin
     qua cụm xinthem, không bao giờ tự ghi vào cụm khothem. */
  var CUM_NGHE = ['khothem', 'xinthem', 'ca', 'tainguyen'];
  if (lv <= 11) {
    Object.keys(gui).forEach(function (k) {
      if (CUM_NGHE.indexOf(k) < 0) return;
      var v = gui[k];
      if (!v || typeof v !== 'object' || !v.du) return;
      if (Number(v.luc || 0) <= Number((cu[k] || {}).luc || 0)) return;
      cu[k] = { luc: Number(v.luc), du: v.du, boi: hoSo.u };
      doiCum[k] = 1; doi++;
    });
  } else {
    /* Gia đình và cộng tác viên: chỉ được đẩy lời XIN lên, không hơn. */
    var vx = gui.xinthem;
    if (vx && typeof vx === 'object' && vx.du &&
        Number(vx.luc || 0) > Number((cu.xinthem || {}).luc || 0)) {
      cu.xinthem = { luc: Number(vx.luc), du: vx.du, boi: hoSo.u };
      doiCum.xinthem = 1; doi++;
    }
  }

  if (lv <= 2) {
    Object.keys(gui).forEach(function (k) {
      if (['sapxep', 'noidung', 'phanquyen'].indexOf(k) < 0) return;
      var v = gui[k];
      if (!v || typeof v !== 'object' || !v.du) return;
      if (Number(v.luc || 0) <= Number((cu[k] || {}).luc || 0)) return;
      cu[k] = { luc: Number(v.luc), du: v.du, boi: hoSo.u };
      doiCum[k] = 1; doi++;
    });
  }

  if (doi) {
    /* Script Properties chỉ nhận 9 KB MỖI GIÁ TRỊ (và 500 KB cả kho). Trần
       400.000 ký tự đặt trước đây là sai gấp bốn mươi lần: vượt là Apps
       Script ném "Argument too large", cả lượt đồng bộ trả về lỗi, người
       dùng bấm lại, mỗi lần lại thêm một dòng sao lưu — mà cài đặt thì
       vĩnh viễn không lưu được.

       Cụm hồ sơ ca cộng dồn theo thời gian nên chắc chắn vượt 9 KB sớm.
       Nên mỗi cụm nay nằm ở MỘT khoá riêng, và cụm nào quá lớn thì bị từ
       chối riêng cụm đó, nói rõ lý do, không kéo đổ cả lượt đồng bộ. */
    var quaLon = [];
    Object.keys(cu).forEach(function (k) {
      if (!doiCum[k]) return;                       /* cụm không đổi thì khỏi ghi lại */
      var tho = JSON.stringify(cu[k]);
      if (tho.length > GITA_TRAN_CUM_BYTE) {
        quaLon.push(k);
        cu[k] = truoc[k];                           /* trả về bản cũ, không mất dữ liệu */
        return;
      }
      try { kho.setProperty(gitaKhoaCum_(k), tho); }
      catch (e) { quaLon.push(k); cu[k] = truoc[k]; }
    });

    ghiNhatKy_({ viec: 'DONG_BO_CAI_DAT', u: hoSo.u, role: hoSo.role,
      chiTiet: 'Cập nhật ' + doi + ' cụm' +
        (quaLon.length ? ' · TỪ CHỐI vì quá lớn: ' + quaLon.join(',') : '') });
    if (quaLon.length) cu.__quaLon = quaLon;
  }

  return gitaLocCaiDat_(cu, lv, hoSo.phien && hoSo.phien.uid);
}

/* Mỗi cụm một khoá riêng — 9 KB cho mỗi cụm thay vì 9 KB cho tất cả. */
var GITA_TRAN_CUM_BYTE = 8500;
var GITA_CUM_CAI_DAT = ['sapxep', 'noidung', 'phanquyen', 'khothem', 'xinthem', 'ca', 'tainguyen'];
function gitaKhoaCum_(k) { return 'GITA_CD_' + k; }

function gitaDocCaiDat_() {
  var kho = PropertiesService.getScriptProperties();
  var ra = {};
  GITA_CUM_CAI_DAT.forEach(function (k) {
    var t = kho.getProperty(gitaKhoaCum_(k));
    if (!t) return;
    try { ra[k] = JSON.parse(t); } catch (e) {}
  });
  /* Đọc nốt bản cũ gộp một khoá, để máy chủ đang chạy không mất cài đặt
     khi nâng cấp. Đọc xong là thôi, không ghi lại vào khoá cũ nữa. */
  try {
    var goc = JSON.parse(kho.getProperty('GITA_CAI_DAT') || '{}');
    Object.keys(goc).forEach(function (k) { if (!ra[k]) ra[k] = goc[k]; });
  } catch (e) {}
  return ra;
}

/* ══ AI ĐƯỢC NHẬN CỤM NÀO ══
   Chặn GHI thôi thì chưa đủ: trả về cả khối là gửi hồ sơ ca của mọi nhà
   xuống máy của từng phụ huynh. Hồ sơ ca có tên nhà, số điện thoại và
   nguyên văn lời gia đình kể. Nó chỉ được đi tới người trong nghề. */
function gitaLocCaiDat_(cu, lv, uid) {
  var ra = {};
  Object.keys(cu).forEach(function (k) {
    if (k === '__quaLon') { ra[k] = cu[k]; return; }

    /* Hồ sơ ca: chỉ người trong nghề. Nó mang tên nhà, số điện thoại và
       nguyên văn lời gia đình kể — không được xuống máy của nhà nào cả. */
    if (k === 'ca' && lv > 11) return;

    /* Mức dùng tài nguyên của đội ngũ: chỉ Super Admin và Admin hệ thống.
       Nó mang tên tài khoản và thói quen làm việc của từng người. */
    if (k === 'tainguyen' && lv > 2) return;

    /* Bảng phân quyền: chỉ Super Admin và Admin hệ thống */
    if (k === 'phanquyen' && lv > 2) return;

    /* Tư liệu đã gửi thêm và lời xin: gia đình PHẢI nhận được, nếu không
       thì Tư vấn bấm gửi mà nhà kia không bao giờ mở ra được. Nhưng chỉ
       nhận PHẦN CỦA MÌNH — cắt theo mã nhà trước khi trả về. */
    if (k === 'khothem' || k === 'xinthem') {
      if (lv <= 11) { ra[k] = cu[k]; return; }      /* đội ngũ: nhận cả */
      var v = cu[k];
      if (!v || !v.du) return;
      ra[k] = { luc: v.luc, boi: v.boi, du: gitaCatTheoNha_(k, v.du, uid) };
      return;
    }

    ra[k] = cu[k];
  });
  return ra;
}

/**
 * Cắt phần của một nhà ra khỏi cụm dùng chung.
 *
 * Vì sao cần: hai cụm này đồng bộ toàn cục. Trả nguyên khối cho gia đình là
 * gửi cho họ tư liệu và lời xin của mọi nhà khác — và tệ hơn, tư liệu gửi
 * cho một nhà sẽ mở khoá cho tất cả các nhà.
 */
function gitaCatTheoNha_(cum, du, uid) {
  var maNha = '';
  try {
    var nd = Store.find('users', uid);
    if (nd) maNha = String(nd.maKhachHang || nd.studentId || '');
  } catch (e) {}
  if (!maNha) return (cum === 'xinthem') ? [] : {};

  if (cum === 'xinthem') {
    if (!Array.isArray(du)) return [];
    return du.filter(function (x) { return String(x && x.nha) === maNha; });
  }

  /* khothem: khoá có dạng "<mã nhà>|<loại>·<mã tư liệu>" */
  var ra = {};
  Object.keys(du || {}).forEach(function (k) {
    if (k.indexOf(maNha + '|') === 0) ra[k] = du[k];
  });
  return ra;
}

function gitaDongBo_(y, hoSo) {
  var uid = hoSo.phien.uid;

  // 1. Kích thước
  var co = JSON.stringify(y.day || {}).length;
  if (co > GITA_TRAN_DONGBO_KB * 1024)
    return { ok: false, code: 'TOOBIG', error: 'Gói đẩy lên vượt trần ' + GITA_TRAN_DONGBO_KB + ' KB.' };

  // 2. Đọc hồ sơ đang có trên máy chủ
  var cu = null;
  try { cu = Store.find('hosoApp', uid); } catch (e) { cu = null; }
  var duLieu = {}, moc = {};
  if (cu && cu.duLieu) {
    try { duLieu = JSON.parse(cu.duLieu) || {}; } catch (e) { duLieu = {}; }
    try { moc = JSON.parse(cu.moc || '{}') || {}; } catch (e) { moc = {}; }
  }

  // 3. Gộp theo TỪNG TRƯỜNG, bên nào mới hơn thì thắng.
  //    Không ghi đè cả khối — hai máy sửa hai việc khác nhau thì giữ được cả hai.
  var day = y.day || {}, mocDay = y.mocTruong || {}, boQua = [];
  Object.keys(day).forEach(function (nhom) {
    if (GITA_NHOM_DONGBO.indexOf(nhom) < 0) { boQua.push(nhom); return; }
    var v = day[nhom];
    if (v === null || typeof v !== 'object') return;
    duLieu[nhom] = duLieu[nhom] || {};
    Object.keys(v).forEach(function (k) {
      var khoa = nhom + '.' + k;
      var tMay = Number(mocDay[khoa] || 0);
      var tChu = Number(moc[khoa] || 0);
      if (tMay >= tChu) { duLieu[nhom][k] = v[k]; moc[khoa] = tMay || Date.now(); }
      // tMay < tChu: máy chủ mới hơn, giữ nguyên và trả về ở phần keo
    });
  });

  // 4. Ghi lại, luôn giữ một bản sao lưu trước khi ghi đè
  var ban = { duLieu: JSON.stringify(duLieu), moc: JSON.stringify(moc), suaLuc: new Date().toISOString() };
  try {
    if (cu) {
      /* MỐC THỜI GIAN KHÔNG PHẢI KHOÁ. Trước 9.83 dòng này ghép
         id = uid + '-' + Date.now(). Máy tính bàn đồng bộ theo nhịp
         máy chứ không theo nhịp người, nên hai lượt rơi vào cùng một
         mi-li-giây là chuyện thường — và lúc ấy sổ có hai dòng TRÙNG
         ID.

         Bảng tính không có khoá chính nên nó không kêu; nó nhận cả
         hai. Rồi bộ dọn 9.79 gom mười bản gần nhất theo uid, gọi
         Store.xoa với danh sách id, mà xoa xoá MỌI dòng có id nằm
         trong danh sách — nên xoá bản thứ mười một là xoá luôn bản
         thứ mười đi cùng nó. Mất một bản sao lưu vì một cái tên trùng.
         Lỗi này lộ ra khi dựng nền mới, nơi id là khoá chính thật. */
      Store.insert('hosoAppSaoLuu', { id: Utilities.getUuid(), uid: uid,
        duLieu: cu.duLieu, luc: cu.suaLuc || '' });
      Store.update('hosoApp', uid, ban);
    } else {
      Store.insert('hosoApp', { id: uid, uid: uid, u: hoSo.u, role: hoSo.role,
        duLieu: ban.duLieu, moc: ban.moc, suaLuc: ban.suaLuc, taoLuc: ban.suaLuc });
    }
  } catch (e) {
    return { ok: false, error: 'Không ghi được hồ sơ: ' + e.message };
  }

  ghiNhatKy_({ viec: 'DONG_BO', u: hoSo.u, role: hoSo.role, tier: hoSo.tier,
    may: String(y.may || '').slice(0, 120), phien: hoSo.phien,
    chiTiet: Math.round(co / 1024) + ' KB · ' + Object.keys(day).join(',') +
             (boQua.length ? ' · bỏ qua: ' + boQua.join(',') : '') });

  return { ok: true, caiDat: gitaCaiDat_(y, hoSo), keo: duLieu, mocTruong: moc, mocMayChu: ban.suaLuc, boQua: boQua };
}

/**
 * Kiểm bản mới của ứng dụng và của kho — app hỏi mỗi lần mở và mỗi 6 giờ.
 * Thân: { fn:'kiemBanMoi', banApp:'7.5.0' }
 */
function gitaKiemBanMoi_(y) {
  var P = PropertiesService.getScriptProperties();
  return {
    ok: true,
    banMoiNhat: P.getProperty('GITA_BAN_MOI_NHAT') || '',
    tai: P.getProperty('GITA_LINK_TAI') || '',
    bacBuoc: P.getProperty('GITA_BAN_BAT_BUOC') || '',
    khoBam: JSON.parse(P.getProperty('GITA_KHO_BAM') || '{}'),
    banApp: String(y.banApp || '')
  };
}


/* ═══════════════════════════════════════════════════════════════════════
   MẬT KHẨU — đổi, quên, đặt lại bằng mã
   (nguyên văn server/GITA_MatKhau.gs)
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * ═══════════════════════════════════════════════════════════════
 * GITA 365 — ĐỔI MẬT KHẨU VÀ LẤY LẠI MẬT KHẨU QUA EMAIL
 * Dán vào cùng dự án Apps Script với GITA_CapPhep.gs.
 *
 * Dùng đúng lớp băm sẵn có của v6.9: hashPw_, newSalt_, safeEqual_,
 * checkPwStrength_ trong 02_Security.gs. Không tự nghĩ ra cách băm mới.
 * ═══════════════════════════════════════════════════════════════
 */

var GITA_HAN_MA_PHUT   = 15;   // mã lấy lại mật khẩu sống bao lâu
var GITA_TRAN_QUEN_GIO = 5;    // số lần xin mã tối đa mỗi giờ cho một tài khoản

function gitaMaSauSo_() {
  var b = '';
  for (var i = 0; i < 6; i++) b += Math.floor(Math.random() * 10);
  return b;
}
function gitaKhoaMa_(u) { return 'PWRESET_' + String(u).toLowerCase(); }

/* ═══════════ 1. ĐỔI MẬT KHẨU — khi đã đăng nhập ═══════════ */
function gitaDoiMatKhau_(y, hoSo) {
  var cu = String(y.cu || ''), moi = String(y.moi || '');
  if (!cu || !moi) return { ok: false, error: 'Thiếu mật khẩu cũ hoặc mật khẩu mới.' };

  var nd = Store.find('users', hoSo.phien.uid);
  if (!nd) return { ok: false, code: 'AUTH', error: 'Không tìm thấy tài khoản.' };

  // Mật khẩu cũ phải đúng
  if (!safeEqual_(hashPw_(cu, nd.pwSalt), nd.pwHash)) {
    ghiNhatKy_({ viec: 'DOI_MK_SAI', u: hoSo.u, role: hoSo.role, phien: hoSo.phien,
      chiTiet: 'Nhập sai mật khẩu cũ' });
    return { ok: false, code: 'WRONG', error: 'Mật khẩu hiện tại không đúng.' };
  }
  if (cu === moi) return { ok: false, error: 'Mật khẩu mới phải khác mật khẩu cũ.' };

  var manh = checkPwStrength_(moi);
  if (manh !== true && manh) return { ok: false, code: 'WEAK', error: String(manh) };

  var muoi = newSalt_();
  Store.update('users', nd.id, {
    pwSalt: muoi, pwHash: hashPw_(moi, muoi),
    mustChangePw: false, pwDoiLuc: new Date().toISOString()
  });

  // Đổi mật khẩu là đóng mọi phiên khác — người lạ đang dùng token cũ bị đá ra
  /* Đá MỌI phiên, không chỉ phiên đang gọi. Đổi mật khẩu mà thiết bị khác
     vẫn vào được thì việc đổi gần như vô nghĩa. */
  try { xoaMoiPhien_(nd.id); } catch (e) { try { closeSession_(y.token); } catch (e2) {} }

  ghiNhatKy_({ viec: 'DOI_MK', u: hoSo.u, role: hoSo.role, phien: hoSo.phien,
    chiTiet: 'Đổi mật khẩu thành công, đã đóng phiên' });
  try {
    MailApp.sendEmail(nd.email || nd.username, 'GITA 365 — mật khẩu đã được đổi',
      'Chào ' + (nd.hoTen || 'anh chị') + ',\n\n' +
      'Mật khẩu tài khoản ' + nd.username + ' vừa được đổi lúc ' +
      Utilities.formatDate(new Date(), 'GMT+7', 'HH:mm dd/MM/yyyy') + '.\n\n' +
      'Nếu không phải anh chị đổi, báo ngay cho Học viện GITA theo số 08.5555.4688.\n\n' +
      'Học viện GITA');
  } catch (e) { /* không gửi được thư thì việc đổi vẫn xong */ }

  return { ok: true, thongBao: 'Đã đổi mật khẩu. Hãy đăng nhập lại bằng mật khẩu mới.' };
}

/* ═══════════ 2. QUÊN MẬT KHẨU — gửi mã sáu số qua email ═══════════ */
function gitaQuenMatKhau_(y) {
  var u = String(y.u || '').trim().toLowerCase();
  if (!u) return { ok: false, error: 'Thiếu tên đăng nhập.' };

  // Trả lời GIỐNG NHAU dù tài khoản có thật hay không — không để dò tài khoản
  var traLoi = { ok: true, thongBao: 'Nếu tài khoản có thật, mã lấy lại mật khẩu đã được gửi tới email đăng ký. Mã sống ' + GITA_HAN_MA_PHUT + ' phút.' };

  var kho = CacheService.getScriptCache();
  var kDem = 'PWRESET_DEM_' + u;
  var soLan = Number(kho.get(kDem) || 0) + 1;
  kho.put(kDem, String(soLan), 3600);
  if (soLan > GITA_TRAN_QUEN_GIO) {
    ghiNhatKy_({ viec: 'QUEN_MK_CHAN', u: u, chiTiet: 'Vượt trần ' + GITA_TRAN_QUEN_GIO + ' lần/giờ' });
    return traLoi;
  }

  /* Nhận CẢ tên đăng nhập LẪN địa chỉ email — giống hệt lúc đăng nhập.
     Người quên mật khẩu thường cũng không nhớ chính xác tên đăng nhập; bắt
     họ nhớ đúng một trong hai là dựng thêm một cánh cửa khoá nữa ngay lúc
     họ đang bí. */
  var nd = null;
  try {
    nd = Store.all('users').filter(function (x) {
      return String(x.username || '').toLowerCase() === u ||
             String(x.email || '').toLowerCase() === u;
    })[0];
  } catch (e) { nd = null; }
  if (!nd || !isTrue(nd.active) || nd.deletedAt) return traLoi;

  var email = nd.email || nd.username;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return traLoi;

  /* Khoá lưu mã đi theo TÊN ĐĂNG NHẬP thật, không theo chuỗi người dùng gõ.
     Nếu không, xin mã bằng email rồi đặt lại bằng tên đăng nhập sẽ không khớp. */
  var uThat = String(nd.username || '').toLowerCase();

  var ma = gitaMaSauSo_();
  var muoi = newSalt_();
  kho.put(gitaKhoaMa_(uThat), JSON.stringify({
    hash: hashPw_(ma, muoi), salt: muoi, uid: nd.id,
    het: Date.now() + GITA_HAN_MA_PHUT * 60000, sai: 0
  }), GITA_HAN_MA_PHUT * 60);

  try {
    MailApp.sendEmail(email, 'GITA 365 — mã lấy lại mật khẩu',
      'Chào ' + (nd.hoTen || 'anh chị') + ',\n\n' +
      'Mã lấy lại mật khẩu của tài khoản ' + nd.username + ' là:\n\n' +
      '        ' + ma + '\n\n' +
      'Mã sống ' + GITA_HAN_MA_PHUT + ' phút và chỉ dùng được một lần.\n\n' +
      'Nếu không phải anh chị yêu cầu, bỏ qua thư này — mật khẩu cũ vẫn nguyên. ' +
      'Nếu nhận nhiều thư như thế này, báo cho Học viện GITA theo số 08.5555.4688.\n\n' +
      'Học viện GITA');
  } catch (e) {
    ghiNhatKy_({ viec: 'QUEN_MK_LOI', u: u, chiTiet: 'Không gửi được thư: ' + e.message });
    return traLoi;
  }

  ghiNhatKy_({ viec: 'QUEN_MK', u: u, chiTiet: 'Đã gửi mã tới ' + email.replace(/^(.{2}).*(@.*)$/, '$1***$2') });
  return traLoi;
}

/* ═══════════ 3. ĐẶT LẠI MẬT KHẨU BẰNG MÃ ═══════════ */
function gitaDatLaiMatKhau_(y) {
  var u = String(y.u || '').trim().toLowerCase();
  var ma = String(y.ma || '').trim();
  var moi = String(y.moi || '');
  if (!u || !ma || !moi) return { ok: false, error: 'Thiếu tên đăng nhập, mã hoặc mật khẩu mới.' };

  /* Người dùng có thể xin mã bằng email rồi đặt lại bằng tên đăng nhập, hoặc
     ngược lại. Quy cả hai về đúng một tài khoản trước khi tìm mã. */
  var ndTim = null;
  try {
    ndTim = Store.all('users').filter(function (x) {
      return String(x.username || '').toLowerCase() === u ||
             String(x.email || '').toLowerCase() === u;
    })[0];
  } catch (e) { ndTim = null; }
  if (ndTim) u = String(ndTim.username || '').toLowerCase();

  var kho = CacheService.getScriptCache();
  var raw = kho.get(gitaKhoaMa_(u));
  if (!raw) return { ok: false, code: 'EXPIRED', error: 'Mã đã hết hạn hoặc chưa được cấp. Xin mã mới.' };

  var g = JSON.parse(raw);
  if (g.het < Date.now()) { kho.remove(gitaKhoaMa_(u)); return { ok: false, code: 'EXPIRED', error: 'Mã đã hết hạn. Xin mã mới.' }; }

  if (!safeEqual_(hashPw_(ma, g.salt), g.hash)) {
    g.sai = (g.sai || 0) + 1;
    if (g.sai >= 5) {
      kho.remove(gitaKhoaMa_(u));
      ghiNhatKy_({ viec: 'DAT_LAI_MK_CHAN', u: u, chiTiet: 'Sai mã 5 lần — huỷ mã' });
      return { ok: false, code: 'LOCKED', error: 'Sai mã năm lần. Mã đã bị huỷ, xin mã mới.' };
    }
    kho.put(gitaKhoaMa_(u), JSON.stringify(g), Math.max(60, Math.round((g.het - Date.now()) / 1000)));
    return { ok: false, code: 'WRONG', error: 'Mã không đúng. Còn ' + (5 - g.sai) + ' lần thử.' };
  }

  var manh = checkPwStrength_(moi);
  if (manh !== true && manh) return { ok: false, code: 'WEAK', error: String(manh) };

  var nd = Store.find('users', g.uid);
  if (!nd) return { ok: false, error: 'Không tìm thấy tài khoản.' };

  var muoi = newSalt_();
  Store.update('users', nd.id, {
    pwSalt: muoi, pwHash: hashPw_(moi, muoi),
    mustChangePw: false, pwDoiLuc: new Date().toISOString()
  });
  kho.remove(gitaKhoaMa_(u));
  try { clearFail_(u); } catch (e) {}
  /* Người phải dùng tới "quên mật khẩu" thường là người vừa bị mất quyền
     kiểm soát tài khoản. Đá mọi phiên đang mở là việc bắt buộc ở đây. */
  var soPhien = 0;
  try { soPhien = xoaMoiPhien_(nd.id); } catch (e) {}

  ghiNhatKy_({ viec: 'DAT_LAI_MK', u: u, role: nd.role,
    chiTiet: 'Đặt lại mật khẩu bằng mã email · đóng ' + soPhien + ' phiên đang mở' });
  try {
    MailApp.sendEmail(nd.email || nd.username, 'GITA 365 — mật khẩu đã được đặt lại',
      'Mật khẩu tài khoản ' + nd.username + ' vừa được đặt lại lúc ' +
      Utilities.formatDate(new Date(), 'GMT+7', 'HH:mm dd/MM/yyyy') + '.\n\n' +
      'Nếu không phải anh chị làm, báo ngay cho Học viện GITA theo số 08.5555.4688.\n\nHọc viện GITA');
  } catch (e) {}

  return { ok: true, thongBao: 'Đã đặt lại mật khẩu. Đăng nhập bằng mật khẩu mới.' };
}


/* ═══════════════════════════════════════════════════════════════════════
   SỔ CỘNG ĐỒNG — bốn sổ đếm của bảng tin và hộp thư chuyện
   (nguyên văn server/GITA_SoCongDong.gs)
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * ═══════════════════════════════════════════════════════════════
 * GITA 365 — SỔ ĐẾM CỘNG ĐỒNG VÀ HỘP THƯ CHUYỆN
 * Dán vào cùng dự án Apps Script với GITA_CapPhep.gs.
 *
 * ═══ TỆP NÀY TRẢ LỜI CHO BỐN CHỖ TRỐNG ĐÃ TỰ KHAI ═══
 *
 * Bốn nguồn trong G.TIN_NGUON tự khai `co: false` kèm chỗ thiếu của mình.
 * Đây là chỗ lấp, và lấp theo đúng bốn câu ấy:
 *
 *   N-XONG   "Chưa có sổ đếm ở máy chủ."          → ghiTinCongDong
 *   N-TANG   "Phải gộp đủ lớn."                    → ngưỡng ở docTinCongDong
 *   N-KEM    "Chưa có sổ cặp nhà kèm ở máy chủ."   → ghiTinCongDong loại N-KEM
 *   N-CHUYEN "Chưa có chỗ nhận chuyện gửi về."     → guiChuyen
 *
 * ═══ GIỮ SỐ, KHÔNG GIỮ HÀNG ═══
 *
 * Trang sổ đếm có đúng một dòng cho mỗi (loại · tầng), và dòng ấy chỉ có
 * một con số. KHÔNG có dòng nào cho mỗi nhà.
 *
 * Vì sao: giữ hàng thì sáu tháng sau ai đọc được bảng tính cũng đọc được
 * nhà nào xong tầng nào ngày nào. Cái bảng ấy sẽ có người xin, và lúc ấy
 * từ chối đã muộn — nó đã tồn tại rồi.
 *
 * ═══ CHẶN ĐẾM HAI LẦN MÀ KHÔNG BIẾT LÀ AI ═══
 *
 * Vẫn phải biết "người này báo rồi", nếu không thì bấm mười lần là mười
 * nhà. Cách làm: một DẤU MỘT CHIỀU băm từ tài khoản cộng khoá máy chủ.
 *
 *   · Có dấu thì biết đã báo rồi → không cộng nữa.
 *   · Không có khoá thì không lần ngược ra tài khoản nào. Khoá nằm ở
 *     PropertiesService, không nằm trong mã, và không hàm nào ở đây trả
 *     nó ra — kể cả một phần.
 *   · Trang dấu KHÔNG ghi giờ. Ghi giờ là ghép được với nhật ký đăng nhập
 *     để suy ra ai, và thế thì cả lớp băm thành vô nghĩa.
 *
 * ═══ NGƯỠNG GỘP: MỘT CHỖ QUYẾT, MỌI CHỖ HỎI ═══
 *
 * Số nhỏ chỉ mặt được từng nhà mà không cần tên: "2 nhà đang ở tầng năm"
 * là đã gần như nêu tên. Nên dưới ngưỡng thì KHÔNG trả con số ra — trả
 * tên mục vào danh sách `duoiNguong` để màn nói "chưa gộp đủ để hiện".
 *
 * Câu ấy khác hẳn "chưa có sổ đếm": một câu nói hệ CHƯA LÀM, câu kia nói
 * hệ ĐÃ LÀM và đang giữ kín cho người ta.
 *
 * Ngưỡng chỉ được quyết ở ĐÂY, vì chỉ ở đây nó chặn được thật. Máy khách
 * không gõ lại số này và không gửi nó lên — nhận từ thân yêu cầu thì ai
 * cũng đặt được thành 1. Máy khách in con số `nguong` mà máy chủ trả về.
 *
 * ═══ MÁY GIỮ HỘP THƯ, NGƯỜI CHỌN CHUYỆN ═══
 *
 * guiChuyen soi được sáu tiêu chí có ĐỦ CỘT hay chưa. Nó không đọc được
 * một chuyện hay hay dở, nên nó không bao giờ tự đặt trạng thái 'da-chon'.
 * Người của Học viện đổi cột ấy bằng tay trong bảng tính. Không giao cho
 * ai thì hộp thư đầy mà bảng tin không có gì đăng — và như thế là đúng.
 * ═══════════════════════════════════════════════════════════════
 */

/** Ngưỡng gộp mặc định. Chủ hệ đổi bằng thuộc tính GITA_NGUONG_GOP. */
var GITA_NGUONG_GOP_MAC_DINH = 10;

var GITA_TRANG_SODEM  = 'SoCongDong';
var GITA_TRANG_DAUBAO = 'DauDaBao';
var GITA_TRANG_CHUYEN = 'HopThuChuyen';

var GITA_COT_SODEM  = ['muc', 'loai', 'tang', 'so'];
/* Không có cột giờ. Xem phần đầu tệp: giờ là chỗ lần ngược ra người. */
var GITA_COT_DAUBAO = ['dau', 'loai', 'tang'];
var GITA_COT_CHUYEN = ['ma', 'loai', 'tang', 'noiDung',
  'tc1', 'tc2', 'tc3', 'tc4', 'tc5', 'tc6',
  'trangThai', 'nguoiGui', 'nhanLuc', 'nguoiChon', 'chonLuc'];

/** Ba loại được cộng vào sổ đếm. Đúng ba mã của G.TIN_NGUON. */
var GITA_LOAI_DEM = ['N-XONG', 'N-TANG', 'N-KEM'];

/**
 * Khoá băm dấu. Riêng một khoá cho việc này — trộn với khoá chứng cứ thì
 * đổi khoá vì một việc là làm hỏng việc kia.
 */
function gitaKhoaSoCongDong_() {
  var P = PropertiesService.getScriptProperties();
  var k = P.getProperty('GITA_KHOA_SOCONGDONG');
  if (!k) {
    k = Utilities.getUuid() + Utilities.getUuid() + Utilities.getUuid();
    P.setProperty('GITA_KHOA_SOCONGDONG', k);
  }
  return k;
}

function gitaNguongGop_() {
  var v = Number(PropertiesService.getScriptProperties().getProperty('GITA_NGUONG_GOP'));
  return (v && v > 0) ? v : GITA_NGUONG_GOP_MAC_DINH;
}

function gitaTrangCD_(ten, cot) {
  var so = gitaSo_();
  var tr = so.getSheetByName(ten);
  if (!tr) {
    tr = so.insertSheet(ten);
    tr.appendRow(cot);
    tr.setFrozenRows(1);
  }
  return tr;
}

/**
 * Dấu một chiều. Băm tài khoản cộng khoá máy chủ.
 *
 * N-TANG băm KHÔNG kèm tầng: một nhà ở đúng một tầng tại một lúc, nên khi
 * nhà ấy báo tầng mới thì phải trừ ở tầng cũ, và muốn trừ thì phải nhận ra
 * đúng cái dấu cũ. Hai loại kia thì mỗi tầng là một việc xong riêng, nên
 * kèm tầng vào dấu để một nhà đếm được một lần ở MỖI tầng.
 */
function gitaDauBao_(u, loai, tang) {
  var chuoi = String(u).toLowerCase() + '|' + loai + (loai === 'N-TANG' ? '' : '|' + tang);
  var b = Utilities.computeHmacSha256Signature(chuoi, gitaKhoaSoCongDong_(), Utilities.Charset.UTF_8);
  return b.map(function (x) { return ('0' + (x & 0xFF).toString(16)).slice(-2); }).join('');
}

function gitaMucDem_(loai, tang) { return loai + ':' + tang; }

/** Cộng (hoặc trừ) một vào ô đếm. Không tụt xuống dưới 0. */
function gitaCongO_(loai, tang, buoc) {
  var tr = gitaTrangCD_(GITA_TRANG_SODEM, GITA_COT_SODEM);
  var muc = gitaMucDem_(loai, tang);
  var v = tr.getDataRange().getValues();
  for (var i = 1; i < v.length; i++) {
    if (String(v[i][0]) === muc) {
      var m = Math.max(0, (Number(v[i][3]) || 0) + buoc);
      tr.getRange(i + 1, 4).setValue(m);
      return m;
    }
  }
  var dau = Math.max(0, buoc);
  tr.appendRow([muc, loai, tang, dau]);
  return dau;
}

/**
 * fn:'ghiTinCongDong'
 * Thân: { u, token, bao: { loai, tang, dongY } }
 * Trả:  { ok, daGhi: true|false, viSao? }
 *
 * `dongY` phải là true trong CHÍNH yêu cầu này. Máy khách chỉ gửi khi nhà
 * ấy đã bật công tắc chia sẻ, nhưng máy chủ không tin điều đó — nó đòi
 * lời đồng ý đi kèm mỗi lần báo, và ghi việc ấy vào nhật ký.
 *
 * Vì sao đòi cho bằng được: một con số gom lén thì tới ngày có người hỏi
 * "lấy ở đâu ra" là hết đường trả lời, và lúc ấy mất luôn cả những con số
 * đã xin phép tử tế.
 */
function gitaGhiTinCongDong_(y, hoSo) {
  var b = y.bao || {};
  var loai = String(b.loai || '');
  var tang = String(b.tang || '');
  if (GITA_LOAI_DEM.indexOf(loai) < 0) return { ok: false, error: 'Loại báo không hợp lệ.' };
  if (!/^T[1-5]$/.test(tang)) return { ok: false, error: 'Tầng không hợp lệ.' };
  if (b.dongY !== true)
    return { ok: false, error: 'Chưa có lời đồng ý chia sẻ của nhà mình.' };

  var dau = gitaDauBao_(hoSo.u, loai, tang);
  var trD = gitaTrangCD_(GITA_TRANG_DAUBAO, GITA_COT_DAUBAO);
  var v = trD.getDataRange().getValues();
  for (var i = 1; i < v.length; i++) {
    if (safeEqual_(String(v[i][0]), dau)) {
      /* Đã báo rồi. Với N-TANG, báo tầng khác nghĩa là nhà ấy đã lên tầng:
         trừ ở tầng cũ, cộng ở tầng mới, và sửa dòng dấu. Sổ đếm N-TANG nói
         "đang ở", nên cộng dồn mà không trừ là nói sai. */
      if (loai === 'N-TANG' && String(v[i][2]) !== tang) {
        gitaCongO_(loai, String(v[i][2]), -1);
        gitaCongO_(loai, tang, 1);
        trD.getRange(i + 1, 3).setValue(tang);
        audit_(hoSo.phien, 'CONGDONG_CHUYEN_TANG', loai, tang);
        return { ok: true, daGhi: true };
      }
      return { ok: true, daGhi: false, viSao: 'Nhà mình đã báo mục này rồi.' };
    }
  }

  gitaCongO_(loai, tang, 1);
  trD.appendRow([dau, loai, tang]);
  audit_(hoSo.phien, 'CONGDONG_GHI', loai, tang);
  return { ok: true, daGhi: true };
}

/**
 * fn:'docTinCongDong'
 * Thân: { u, token }
 * Trả:  { ok, nguong, so: {...}, duoiNguong: [...], chuyenDaChon }
 *
 * `so` chỉ chứa những mục ĐẠT ngưỡng. Mục chưa đạt đi vào `duoiNguong`
 * dưới dạng TÊN MỤC, không kèm con số — kèm số là ngưỡng thành vô nghĩa.
 */
function gitaDocTinCongDong_(y, hoSo) {
  var nguong = gitaNguongGop_();
  var tr = gitaTrangCD_(GITA_TRANG_SODEM, GITA_COT_SODEM);
  var v = tr.getDataRange().getValues();
  var so = {}, duoi = [];
  for (var i = 1; i < v.length; i++) {
    var muc = String(v[i][0]); var n = Number(v[i][3]) || 0;
    if (n >= nguong) so[muc] = n; else duoi.push(muc);
  }

  /* Chuyện đã chọn thì đã công khai, nên không cần ngưỡng: đếm chuyện,
     không đếm nhà. */
  var trC = gitaTrangCD_(GITA_TRANG_CHUYEN, GITA_COT_CHUYEN);
  var c = trC.getDataRange().getValues(); var daChon = 0;
  for (var j = 1; j < c.length; j++) if (String(c[j][10]) === 'da-chon') daChon++;

  return { ok: true, nguong: nguong, so: so, duoiNguong: duoi, chuyenDaChon: daChon };
}

/**
 * fn:'guiChuyen'
 * Thân: { u, token, chuyen: { tang, noiDung, tc1..tc6 } }
 * Trả:  { ok, ma, trangThai:'cho-doc' }
 *
 * tc1..tc6 là sáu tiêu chí ở G.TIN_TIEUCHI. Máy đòi ĐỦ SÁU — qua năm trên
 * sáu vẫn là trượt. Nó soi cột có hay không, KHÔNG soi chuyện hay hay dở.
 *
 * Trạng thái ra là 'cho-doc' và chỉ có thể là 'cho-doc'. Không có đường
 * nào trong tệp này đặt được 'da-chon' — người của Học viện đổi bằng tay.
 */
function gitaGuiChuyen_(y, hoSo) {
  var c = y.chuyen || {};
  var tang = String(c.tang || '');
  if (!/^T[1-5]$/.test(tang)) return { ok: false, error: 'Tầng không hợp lệ.' };
  var nd = String(c.noiDung || '').trim();
  if (!nd) return { ok: false, error: 'Chưa có nội dung chuyện.' };
  if (nd.length > 8000) return { ok: false, error: 'Nội dung quá 8000 ký tự.' };

  var thieu = [];
  for (var k = 1; k <= 6; k++) if (c['tc' + k] !== true) thieu.push(k);
  if (thieu.length)
    return { ok: false, error: 'Chưa đủ tiêu chí: ' + thieu.join(', ') +
      '. Đủ sáu mới nhận — tiêu chí 6 là lời đồng ý bằng chữ, không bỏ qua được.' };

  var trC = gitaTrangCD_(GITA_TRANG_CHUYEN, GITA_COT_CHUYEN);
  var ma = 'CH-' + Utilities.getUuid().slice(0, 8);
  trC.appendRow([ma, 'N-CHUYEN', tang, nd,
    true, true, true, true, true, true,
    'cho-doc', hoSo.u, new Date().toISOString(), '', '']);
  audit_(hoSo.phien, 'CHUYEN_GUI', ma, tang);
  return { ok: true, ma: ma, trangThai: 'cho-doc' };
}


/* ═══════════════════════════════════════════════════════════════════════
   TÀI LIỆU — nhận tài liệu và minh chứng, kiểm duyệt
   (nguyên văn server/GITA_TaiLieu.gs)
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * ═══════════════════════════════════════════════════════════════
 * GITA 365 — NHẬN TÀI LIỆU VÀ MINH CHỨNG TỪ ỨNG DỤNG
 * Dán vào cùng dự án Apps Script với GITA_CapPhep.gs.
 *
 * Mọi vị trí đều gửi được tệp lên. Tệp vào thư mục Drive của Học viện,
 * mỗi loại một thư mục con, và sổ tài liệu ghi lại ai gửi cái gì lúc nào.
 * Chỉ Super Admin và Admin hệ thống duyệt.
 * ═══════════════════════════════════════════════════════════════
 */

/* Thư mục gốc nhận tài liệu đội ngũ gửi lên. Đổi ID ở đây nếu chuyển chỗ. */
var GITA_THU_MUC_TAILIEU = '1pvXH45JvXXPOW9V6ObB5CR87r7gxH0fU';

var GITA_TL_CO_TOI_DA   = 25 * 1024 * 1024;  /* 25 MB mỗi tệp */
var GITA_TL_TRAN_NGAY   = 30;                /* mỗi tài khoản gửi tối đa 30 tệp/ngày */

/* Chỉ nhận đúng những kiểu tệp dùng được. Không nhận tệp chạy được. */
var GITA_TL_DUOI_CHO_PHEP = [
  'pdf','doc','docx','ppt','pptx','xls','xlsx','png','jpg','jpeg','webp','txt','csv'
];

function gitaDuoiTep_(ten) {
  var p = String(ten || '').split('.');
  return p.length > 1 ? p.pop().toLowerCase() : '';
}

function gitaThuMucCon_(goc, ten) {
  var it = goc.getFoldersByName(ten);
  return it.hasNext() ? it.next() : goc.createFolder(ten);
}

function gitaDemGuiNgay_(u) {
  var kho = CacheService.getScriptCache();
  var k = 'TLGUI_' + String(u).toLowerCase() + '_' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd');
  var n = Number(kho.get(k) || 0) + 1;
  kho.put(k, String(n), GITA_CACHE_NGAY);
  return n;
}

/**
 * Nhận một tệp. Thân yêu cầu:
 * {"fn":"napTaiLieu","u":"…","token":"…","ban":{…},"dulieu":"<base64>"}
 */
function gitaNapTaiLieu_(y, hoSo) {
  var ban = y.ban || {};
  var ten = String(ban.ten || '').trim();
  var tenTep = String(ban.tenTep || '').trim();
  if (!ten || !tenTep) return { ok: false, error: 'Thiếu tên tài liệu hoặc tên tệp.' };

  var duoi = gitaDuoiTep_(tenTep);
  if (GITA_TL_DUOI_CHO_PHEP.indexOf(duoi) < 0)
    return { ok: false, error: 'Không nhận tệp đuôi .' + duoi + '. Chỉ nhận tài liệu và ảnh.' };

  var soLan = gitaDemGuiNgay_(hoSo.u);
  if (soLan > GITA_TL_TRAN_NGAY) {
    ghiNhatKy_({ viec: 'GUI_TL_CHAN', u: hoSo.u, role: hoSo.role,
      chiTiet: 'Vượt trần ' + GITA_TL_TRAN_NGAY + ' tệp/ngày' });
    return { ok: false, code: 'RATE', error: 'Đã gửi quá ' + GITA_TL_TRAN_NGAY + ' tệp hôm nay. Thử lại ngày mai.' };
  }

  var thoBase64 = String(y.dulieu || '');
  if (!thoBase64) return { ok: false, error: 'Tệp rỗng.' };

  var byte;
  try { byte = Utilities.base64Decode(thoBase64); }
  catch (e) { return { ok: false, error: 'Tệp gửi lên không đọc được.' }; }
  if (byte.length > GITA_TL_CO_TOI_DA)
    return { ok: false, error: 'Tệp lớn hơn 25 MB.' };

  var goc = DriveApp.getFolderById(GITA_THU_MUC_TAILIEU);
  var thuMuc = gitaThuMucCon_(gitaThuMucCon_(goc, 'TAI-LIEU-DOI-NGU'),
    String(ban.loai || 'khac'));

  /* Tên tệp mang sẵn mã, người gửi và ngày — nhìn tên là truy được nguồn */
  var tenLuu = (ban.id || 'TL') + '__' + String(hoSo.u).split('@')[0] + '__' +
    Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd') + '__' + tenTep;

  var blob = Utilities.newBlob(byte, ban.kieuTep || MimeType.PLAIN_TEXT, tenLuu);
  var tep = thuMuc.createFile(blob);
  tep.setDescription(
    'Mã: ' + (ban.id || '') + '\n' +
    'Tên: ' + ten + '\n' +
    'Loại: ' + (ban.loai || '') + ' · Tầng: ' + (ban.tang || 'chung') + '\n' +
    'Người gửi: ' + hoSo.u + ' (' + hoSo.role + ')\n' +
    'Mô tả: ' + String(ban.moTa || '') + '\n' +
    'Trạng thái: CHỜ DUYỆT — chỉ vào kho sau khi Super Admin hoặc Admin duyệt.');

  /* Ghi vào sổ tài liệu để màn kiểm duyệt đọc được.
     Mã tài liệu ĐI VÀO CỘT id — Store tìm theo id, nên đặt ở cột khác thì
     sau này không ai tìm lại được bản ghi để duyệt.
     Không nuốt lỗi ở đây: tệp đã nằm trên Drive mà sổ không ghi được thì
     người gửi phải biết, nếu không tài liệu treo lơ lửng không ai duyệt. */
  var maTL = String(ban.id || '') || ('TL-' + Date.now().toString(36).toUpperCase());
  try {
    Store.insert('tailieu', {
      id: maTL, ten: ten, loai: ban.loai || '', tang: ban.tang || 0,
      moTa: String(ban.moTa || ''), driveId: tep.getId(), tenTep: tenTep,
      nguoiGui: hoSo.u, vaiGui: hoSo.role, luc: new Date().toISOString(),
      trangThai: 'cho-duyet', nguoiDuyet: '', lucDuyet: '', lyDo: ''
    });
  } catch (e) {
    ghiNhatKy_({ viec: 'GUI_TL_LOI', u: hoSo.u, role: hoSo.role,
      chiTiet: maTL + ' · tệp đã lên Drive nhưng không ghi được sổ: ' + e.message });
    return { ok: false, driveId: tep.getId(),
      error: 'Tệp đã lưu lên Drive nhưng máy chủ chưa ghi được vào sổ kiểm duyệt. ' +
             'Báo cho Admin hệ thống kèm mã ' + maTL + '.' };
  }

  ghiNhatKy_({ viec: 'GUI_TL', u: hoSo.u, role: hoSo.role,
    chiTiet: (ban.id || '') + ' · ' + ten + ' · ' + Math.round(byte.length / 1024) + ' KB' });

  return { ok: true, driveId: tep.getId(),
    thongBao: 'Đã lưu tệp vào Drive của Học viện. Tài liệu đang chờ kiểm duyệt.' };
}

/**
 * Quyết định của người kiểm duyệt. CHỈ vai bậc ≤ 2.
 * {"fn":"duyetTaiLieu","u":"…","token":"…","ma":"TL-…","viec":"duyet|sua|tuchoi","lyDo":"…"}
 */
function gitaDuyetTaiLieu_(y, hoSo) {
  var lv = (ROLES[hoSo.role] || { lv: 99 }).lv;
  if (lv > 2) {
    ghiNhatKy_({ viec: 'DUYET_TL_CHAN', u: hoSo.u, role: hoSo.role,
      chiTiet: 'Vai bậc ' + lv + ' không được kiểm duyệt tài liệu' });
    return { ok: false, code: 'PERM',
      error: 'Chỉ Super Admin và Admin hệ thống được kiểm duyệt tài liệu.' };
  }
  var viec = String(y.viec || '');
  if (['duyet', 'sua', 'tuchoi'].indexOf(viec) < 0)
    return { ok: false, error: 'Việc không hợp lệ.' };
  var lyDo = String(y.lyDo || '').trim();
  if (viec !== 'duyet' && lyDo.length < 8)
    return { ok: false, error: 'Phải ghi rõ lý do hoặc điều cần bổ sung.' };

  var tt = viec === 'duyet' ? 'da-duyet' : viec === 'sua' ? 'yeu-cau-sua' : 'tu-choi';
  var ma = String(y.ma || '');

  /* Store.find nhận một MÃ, không nhận đối tượng. Truyền {ma:…} vào đây thì
     nó so với chuỗi "[object Object]" và luôn không tìm thấy — nên trước đây
     hàm này trả về ok cho ứng dụng mà không đổi gì ở đâu cả: Admin tưởng đã
     duyệt, tài liệu vẫn nằm nguyên trạng thái chờ. */
  var b = null;
  try { b = Store.find('tailieu', ma); } catch (e) { b = null; }
  if (!b) return { ok: false, code: 'NOTFOUND',
    error: 'Không tìm thấy tài liệu mã ' + ma + ' trong sổ.' };

  try {
    Store.update('tailieu', b.id, {
      trangThai: tt, nguoiDuyet: hoSo.u, lucDuyet: new Date().toISOString(), lyDo: lyDo
    });
  } catch (e) {
    return { ok: false, error: 'Không ghi được quyết định: ' + e.message };
  }

  ghiNhatKy_({ viec: 'DUYET_TL', u: hoSo.u, role: hoSo.role,
    chiTiet: ma + ' → ' + tt + (lyDo ? ' · ' + lyDo : '') });
  return { ok: true, ma: ma, trangThai: tt, thongBao: 'Đã ghi quyết định.' };
}


/* ═══════════════════════════════════════════════════════════════════════
   TÌNH HUỐNG CHO GIA ĐÌNH — nạp theo phiên, cắt theo tầng; và bảng KPI cho Chuyên gia đánh giá
   (nguyên văn server/GITA_TinhHuongKhach.gs)
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * ═══════════════════════════════════════════════════════════════
 * GITA 365 — PHỤC VỤ TÌNH HUỐNG CHO GIA ĐÌNH, VÀ BẢNG KPI CHO ĐÁNH GIÁ
 * Dán cùng dự án Apps Script, kèm GITA_TinhHuongKhach_DuLieu.gs.
 *
 * ═══ HAI CHỖ HỞ TỆP NÀY ĐÓNG LẠI ═══
 *
 * 1. Chuỗi năm vòng dựng ở bản 9.49 chạy trên kho tình huống. Kho ấy là
 *    TÀI SẢN NGHỀ nên không xuống máy gia đình — chuỗi chạy cho Tư vấn,
 *    im lặng cho gia đình. Đúng nhóm cần nó nhất thì không có.
 *
 *    Bản 9.51 sửa lời hứa 30% cho đúng mẫu số. Đúng, nhưng chưa triệt
 *    để: gia đình vẫn không có chuỗi.
 *
 * 2. Bản 9.51 cấp cho Chuyên gia đánh giá quyền xem mục 'kpi' ở cả năm
 *    tầng — rồi không có cửa nào phục vụ KPI. Một quyền không có cửa là
 *    một quyền không dùng được, và nó nằm đó cho tới ngày ai đó mở một
 *    cửa khác rồi quên kiểm mục.
 *
 * ═══ VÌ SAO ĐI ĐƯỜNG MÁY CHỦ, KHÔNG ĐI ĐƯỜNG GÓI ═══
 *
 * Một gói đã cấp thì không gọi ngược về được. Gỡ quyền hôm nay không
 * xoá được bản sao nằm trong máy người ta từ hôm qua.
 *
 * Đường này thì thu hồi được: máy gia đình nhận theo PHIÊN, giữ trong
 * bộ nhớ, không ghi xuống đĩa. Ngừng phục vụ là phiên sau không còn.
 * Và mỗi lượt nạp là một dòng nhật ký — ngày có một bản rò ra ngoài thì
 * trả lời được câu "ai đã lấy", mà câu ấy chỉ trả lời được nếu hôm nay
 * đã ghi.
 *
 * ═══ CẮT Ở ĐÂY, KHÔNG CẮT Ở MÀN ═══
 *
 * Máy chủ chỉ trả TẦNG NHÀ ẤY ĐANG Ở TRỞ XUỐNG. Trả cả năm tầng rồi để
 * máy khách lọc là gửi đi thứ nhà ấy chưa tới lượt — và mở công cụ nhà
 * phát triển là đọc được hết. Kho này đã mắc đúng lỗi ấy bốn lần.
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * fn:'napTinhHuongKhach'
 * Thân: { u, token }
 * Trả:  { ok, tang, so, tinhHuong: [...] }
 *
 * Không nhận tầng từ thân yêu cầu. Tầng đọc từ HỒ SƠ trong phiên — nhận
 * từ thân thì gõ số 5 là mở cả năm tầng.
 */
function gitaNapTinhHuongKhach_(y, hoSo) {
  var tang = Number(hoSo.tier || 0);
  if (!(tang >= 1))
    return { ok: false, code: 'NOTIER',
      error: 'Tài khoản chưa gắn với tầng nào. Chưa có tầng thì chưa có phần tư liệu nào.' };
  if (tang > GITA_SO_TANG) tang = GITA_SO_TANG;

  if (typeof GITA_TH_KHACH === 'undefined')
    return { ok: false, error: 'Máy chủ chưa nạp bản chiếu tình huống. ' +
      'Dán GITA_TinhHuongKhach_DuLieu.gs vào dự án.' };

  /* Tầng đang ở VÀ mọi tầng đã đi qua — nền của nhà ấy nằm ở các tầng
     dưới, cắt đi là cắt mất phần họ đã trả tiền và đã đi qua. */
  var ra = [];
  for (var t = 1; t <= tang; t++) {
    var ds = GITA_TH_KHACH['T' + t] || [];
    for (var i = 0; i < ds.length; i++) ra.push(ds[i]);
  }

  audit_(hoSo.phien, 'TINHHUONG_KHACH_NAP', 'T' + tang, ra.length + ' tình huống');
  return { ok: true, tang: tang, so: ra.length, tinhHuong: ra };
}

/**
 * fn:'xemKpiKhach' — BẢNG KPI, và chỉ bảng KPI.
 * Thân: { u, token }
 *
 * Cửa dành cho Chuyên gia đánh giá: bản 9.51 cấp cho vai ấy mục 'kpi' ở
 * cả năm tầng nhưng chưa có cửa nào phục vụ. Cửa này qua ĐÚNG cổng mục
 * 'kpi' — vai nào không có mục ấy thì không vào được, kể cả vai có mục
 * 'hoso' rộng hơn: ba mục là ba cổng riêng, không phải ba nhãn trên
 * cùng một cổng.
 *
 * Trả về ĐÚNG cột KPI. Không kèm tên bố mẹ, không kèm ghi chú, không
 * kèm chuỗi nhiệm vụ — đọc chuỗi nhiệm vụ là đọc nhật ký của một nhà,
 * và đó là chỗ vai này bị chặn có chủ ý.
 */
function gitaXemKpiKhach_(y, hoSo) {
  if (gitaXkMucCuaVai_(hoSo.role).indexOf('kpi') < 0) {
    audit_(hoSo.phien, 'XEMKPI_TUCHOI', hoSo.role, 'ngoài mục kpi');
    return { ok: false, code: 'NOPERM',
      error: 'Vai này không xem được bảng KPI. Chỉ xem được: ' +
        gitaXkMucCuaVai_(hoSo.role).join(', ') + '.' };
  }

  /* Trần TẦNG vẫn đứng: mục mở không có nghĩa là mọi tầng đều mở. */
  var duocTang = gitaXkTranCuaVai_(hoSo.role);
  if (!duocTang.length) {
    audit_(hoSo.phien, 'XEMKPI_TUCHOI', hoSo.role, 'ngoài trần tầng');
    return { ok: false, code: 'NOPERM', error: 'Vai này không nằm trong trần vai nào.' };
  }

  var q = gitaSoiQuyenXem_(y, hoSo);
  if (!q.coGiayPhep) {
    audit_(hoSo.phien, 'XEMKPI_TUCHOI', hoSo.role, 'chưa có giấy phép');
    return { ok: false, code: 'NOPERM',
      error: 'Chưa được Super Admin cấp quyền xem. Trần vai mới là ĐỦ ĐIỀU KIỆN.' };
  }

  var ds = [];
  try {
    ds = Store.all('students').filter(function (s) {
      return q.tang.indexOf('T' + Number(s.tier || 0)) >= 0 && !s.deletedAt;
    }).map(function (s) {
      /* ĐÚNG CỘT KPI. Chọn cột ở đây chứ không trả cả bản ghi rồi để máy
         khách bỏ bớt — trả cả bản ghi là gửi đi tên bố mẹ cho một vai
         chỉ được xem con số. */
      return { id: s.id, tier: s.tier, kpi: s.kpi, band: s.band,
        capNhat: s.updatedAt || s.capNhat || null };
    });
  } catch (e) { return { ok: false, error: 'Chưa đọc được sổ học viên.' }; }

  audit_(hoSo.phien, 'XEMKPI', q.tang.join(','), ds.length + ' hồ sơ KPI');
  return { ok: true, muc: 'kpi', tang: q.tang, so: ds.length, kpi: ds };
}


/* ═══════════════════════════════════════════════════════════════════════
   BẢN CHIẾU TÌNH HUỐNG — máy sinh, dựng lại bằng tools/xuat-tinh-huong-khach.js
   (nguyên văn server/GITA_TinhHuongKhach_DuLieu.gs)
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * ═══════════════════════════════════════════════════════════════
 * GITA 365 — BẢN CHIẾU TÌNH HUỐNG CHO GIA ĐÌNH
 * TỆP NÀY DO MÁY SINH RA — KHÔNG SỬA TAY.
 * Dựng lại bằng: node tools/xuat-tinh-huong-khach.js
 *
 * Chỉ 75 tình huống — đúng 30% mỗi tầng, và
 * chỉ những trường gia đình cần. Phần còn lại của kho tình huống KHÔNG
 * có trong tệp này và không có đường nào tới máy gia đình.
 *
 * Sửa tay thì lần chạy công cụ sau đè mất, và tệ hơn: bản trên máy chủ
 * lệch với kho gốc mà không ai đối chiếu được.
 * ═══════════════════════════════════════════════════════════════
 */

var GITA_TH_KHACH = {"T1":[{"stt":1,"tang":"T1","nhom":"A. NHÓM TỰ GIÁC – TỰ QUẢN VIỆC HỌC","key":"TQ01 – Tự khởi động","th":"Con không tự giác, phải nhắc mới học","mo":"Đến giờ học con vẫn ngồi xem điện thoại hoặc đi lại trong nhà. Bố mẹ nhắc lần một, lần hai, lần ba mới thấy con mở sách. Khi đã ngồi vào bàn thì phần lớn bài vẫn làm xong. Cuối tuần cả nhà nhớ lại thì chỉ nhớ đã to tiếng mấy lần, không ai nói được hôm nào con tự vào bàn.","pt":"Chưa được kết luận “lười”. Cần kiểm tra: con có biết việc không; có tự chọn giờ không; mức trì hoãn; ảnh hưởng thiết bị; mức phụ thuộc lời nhắc; khả năng tập trung sau khi bắt đầu. Nếu “biết việc + học được nhưng không tự bắt đầu”, điểm nghẽn ưu tiên nằm ở khâu kích hoạt hành động.","chot":"Chỗ dễ chẩn sai nhất là gộp học được với tự bắt đầu được làm một. Ca này con học được; cái hỏng nằm ở khâu kích hoạt. Lời nhắc của bố mẹ chữa được tối nay và che mất đúng chỗ cần đo.","gp":"HV chọn một phiên học/ngày; tự xác định giờ – môn – việc đầu tiên; tạo tín hiệu tự nhắc; chuẩn bị môi trường; PH giảm dần nhắc trực tiếp; hệ thống ghi giờ dự kiến, giờ thực tế, số lời nhắc và phản tư.","kpi":"≥5/7 ngày tự bắt đầu; lời nhắc PH giảm ≥50%; độ trễ có xu hướng giảm; HV tự ghi dữ liệu ≥6/7 ngày.","dich":"Có đủ bảy dòng số liệu do con tự ghi, đọc ra được độ trễ trung bình tính bằng phút và tổng số lời nhắc trong tuần. Gia đình chỉ được ít nhất một điều kiện lặp lại trước những ngày con vào bàn muộn nhất."},{"stt":2,"tang":"T1","nhom":"A. NHÓM TỰ GIÁC – TỰ QUẢN VIỆC HỌC","key":"TQ02 – Từ biết sang làm","th":"Con biết việc nhưng không tự bắt tay vào làm","mo":"Hỏi thì con nói đúng tên bài, đúng trang, đúng hạn nộp. Nói xong con vẫn đứng dậy đi uống nước, mở tủ lạnh, quay lại bàn rồi lại cầm điện thoại. Khoảng cách từ lúc con nói ra việc phải làm đến lúc bút chạm giấy thường kéo dài mười lăm đến bốn mươi phút.","pt":"Đây là khoảng cách biết – làm. Cần xem việc có quá lớn không, bước đầu có rõ không, con sợ khó hay chỉ thiếu tín hiệu bắt đầu.","chot":"Dễ chẩn thành thiếu trách nhiệm rồi giảng thêm một lượt nữa. Nhưng con đã biết việc; chỗ hỏng là bước đầu tiên chưa nhỏ tới mức bắt tay vào được ngay. Giảng dài chỉ kéo dài thêm khoảng trống giữa biết và làm.","gp":"Chia nhiệm vụ thành bước mở đầu ≤5–10 phút; dùng câu hỏi “việc đầu tiên là gì?”; PH không giảng dài; hệ thống chỉ yêu cầu hành động đầu tiên.","kpi":"≥5/7 ngày bắt đầu trong ≤10 phút; ≥80% nhiệm vụ xác định được bước đầu tiên trước khi làm.","dich":"Bảy dòng ghi đủ, đo được khoảng trống biết – làm bằng phút cho từng ngày. Phân biệt được ngày con không viết nổi bước đầu tiên với ngày viết được mà vẫn không bắt đầu; hai loại ngày này cần hai hướng xử khác nhau."},{"stt":3,"tang":"T1","nhom":"A. NHÓM TỰ GIÁC – TỰ QUẢN VIỆC HỌC","key":"TQ03 – Học độc lập","th":"Con chỉ học khi có người ngồi cạnh","mo":"Bố mẹ ngồi cạnh thì con làm liên tục. Người lớn đứng dậy đi lấy nước, con dừng bút, nhìn ra cửa hoặc lật vở sang trang khác. Có buổi con gọi với ra hỏi một câu mà con vốn tự trả lời được. Số câu hoàn thành khi có người và khi không có người chênh nhau rõ.","pt":"Có thể là phụ thuộc giám sát, thiếu cấu trúc tự theo dõi, chưa tự tin hoặc chưa biết duy trì tập trung. Không nên cắt hỗ trợ đột ngột.","chot":"Dễ chẩn thành con nhõng nhẽo rồi cắt hỗ trợ một lần cho dứt. Cắt đột ngột thường làm rơi cả phần con vốn làm được. Cần tách xem con phụ thuộc vào sự có mặt, vào việc được hỏi, hay vào chỗ dựa lúc gặp câu khó.","gp":"Chọn phiên 20–30 phút; PH hỗ trợ chuẩn bị rồi rời đi; HV tự báo cáo đầu phiên – cuối phiên; tăng dần thời gian độc lập.","kpi":"≥5/7 phiên không có người ngồi cạnh; hoàn thành ≥70% nhiệm vụ; số lần gọi PH hỗ trợ giảm.","dich":"Có số liệu bảy buổi cho thấy con dừng bút bao lâu sau mỗi lần người lớn rời chỗ. Phân loại được các lần gọi thành hỏi kiến thức thật và gọi để giữ người, với ít nhất năm lần đã ghi rõ."},{"stt":4,"tang":"T1","nhom":"A. NHÓM TỰ GIÁC – TỰ QUẢN VIỆC HỌC","key":"TQ04 – Tự lập kế hoạch","th":"Con luôn chờ bố mẹ lập lịch và giao việc","mo":"Buổi tối con ngồi vào bàn rồi hỏi hôm nay học gì trước. Nếu không ai trả lời, con mở quyển gần tay nhất hoặc làm lại bài đã xong. Lịch học dán trên tường do bố mẹ viết; con không sửa, không thêm, cũng không hỏi vì sao xếp như vậy.","pt":"Có thể không phải thiếu năng lực mà do thiếu cơ hội luyện quyết định. Nếu PH tiếp tục làm thay, tự quản khó phát triển.","chot":"Dễ chẩn thành con thụ động. Nhưng nhiều năm qua con chưa có lần nào được quyết rồi chịu hậu quả của chính quyết định ấy. Thiếu cơ hội tập quyết định khác hẳn thiếu năng lực quyết định, và bảy ngày này để phân biệt hai thứ.","gp":"HV mỗi ngày chọn tối đa 3 việc; xác định thứ tự và thời gian; PH chỉ hỏi tính khả thi, không lập thay.","kpi":"≥5/7 ngày có kế hoạch do HV tự tạo; hoàn thành ≥70%; ít nhất 1 lần tự điều chỉnh kế hoạch.","dich":"Bảy danh sách do con tự viết, không có chữ nào của người lớn trong đó. Đọc được quy luật xếp thứ tự của con và tỷ lệ hoàn thành của việc thứ nhất so với việc thứ ba."},{"stt":5,"tang":"T1","nhom":"A. NHÓM TỰ GIÁC – TỰ QUẢN VIỆC HỌC","key":"TQ05 – Tự kiểm","th":"Con không tự kiểm tra sau khi làm","mo":"Làm xong câu cuối là con gấp vở, cất bút. Bài trả lại có lỗi thiếu đơn vị, thiếu dấu, chép sai số từ đề. Khi bố mẹ chỉ vào chỗ sai, con nhìn hai giây rồi sửa đúng ngay. Trong nhiều tháng qua chưa buổi nào con đọc lại bài của mình trước khi gấp vở.","pt":"Thiếu bước tự kiểm khiến con phụ thuộc người lớn và khó hình thành trách nhiệm chất lượng.","chot":"Dễ chẩn thành cẩu thả rồi nhắc cẩn thận hơn. Nhắc cẩn thận không tạo thêm một thao tác nào trong quy trình. Ca này thiếu hẳn một bước: việc đọc lại chưa từng tồn tại, chứ không phải có mà làm qua loa.","gp":"Dùng bảng kiểm 3–5 mục phù hợp môn; dành 3 phút cuối phiên để kiểm; HV đánh dấu lỗi tự phát hiện.","kpi":"≥5/7 nhiệm vụ có tự kiểm; tự phát hiện lỗi ≥3 ngày; lỗi cẩu thả giảm.","dich":"Có bảng bảy ngày phân lỗi thành ba nhóm, đếm được bao nhiêu lỗi thuộc nhóm biết mà vẫn sai. Con đọc bảng và tự gọi tên được loại lỗi lặp nhiều nhất của mình mà không cần người lớn kết luận hộ."},{"stt":6,"tang":"T1","nhom":"B. NHÓM TRÌ HOÃN – QUẢN LÝ THỜI GIAN","key":"TG01 – Phá trì hoãn","th":"Con luôn nói “lát nữa”","mo":"Gọi con học, con trả lời lát nữa mà không rời khỏi việc đang làm. Câu đó lặp lại hai đến ba lần trong một tối. Có hôm con vào bàn sau ba mươi phút, có hôm sau hai tiếng. Câu này xuất hiện dày hơn vào những tối có môn con hay bỏ dở.","pt":"Cần xác định “lát nữa” xuất hiện khi nào: việc khó, nhàm chán, đang giải trí, chưa rõ bước đầu hay sợ làm sai.","chot":"Dễ gộp mọi lần nói lát nữa vào cùng một nguyên nhân. Thực tế lát nữa trước một bài khó và lát nữa lúc đang xem dở một tập phim là hai chuyện khác hẳn. Chưa tách được bối cảnh thì mọi cách xử đều là đoán.","gp":"Quy tắc bắt đầu 5 phút; chỉ yêu cầu bước mở đầu; cuối ngày ghi “điều gì khiến con muốn trì hoãn?”.","kpi":"≥5/7 ngày khởi động đúng khoảng; thời gian trì hoãn giảm ≥30%; HV chỉ ra ≥2 tác nhân trì hoãn.","dich":"Có ít nhất mười dòng ghi đủ bốn thông tin và tính được độ trễ trung bình. Gia đình chỉ ra được ít nhất hai bối cảnh mà câu lát nữa xuất hiện nhiều hơn hẳn phần còn lại của tuần."},{"stt":7,"tang":"T1","nhom":"B. NHÓM TRÌ HOÃN – QUẢN LÝ THỜI GIAN","key":"TG02 – Mốc học ổn định","th":"Có thời gian nhưng luôn học rất muộn","mo":"Chiều con về nhà lúc bốn giờ, buổi tối không có lớp thêm, nhưng sách chỉ mở sau chín rưỡi hoặc mười giờ. Quãng từ chiều đến tối trôi qua bằng ăn, tắm, xem, nói chuyện, nằm. Bài xong lúc gần nửa đêm và sáng hôm sau con dậy chậm.","pt":"Điểm nghẽn có thể là tâm lý “còn nhiều thời gian”, thiết bị, thiếu mốc chuyển trạng thái hoặc lịch chưa thực tế.","chot":"Dễ chẩn thành lười rồi đặt giờ học sớm hơn. Nhưng khung giờ trống buổi chiều đang bị dùng cho việc gì thì chưa ai trong nhà ghi lại. Không có bức tranh giờ thật thì lịch mới đặt ra cũng sẽ trôi đúng như lịch cũ.","gp":"Chọn cửa sổ bắt đầu phù hợp; có nghi thức 5 phút trước học; không bắt đầu hoạt động giải trí dài sát mốc.","kpi":"≥5/7 ngày bắt đầu trong ±15 phút; số ngày học sau 22h giảm ≥50%.","dich":"Bảy ngày có đủ dòng khối thời gian, cộng được tổng số giờ trống từ lúc về nhà đến lúc bắt đầu học. Xác định được một khối lặp lại từ năm ngày trở lên và biết giờ lên giường trung bình của tuần."},{"stt":8,"tang":"T1","nhom":"B. NHÓM TRÌ HOÃN – QUẢN LÝ THỜI GIAN","key":"TG03 – Nhìn thấy thời gian","th":"Con luôn nói “không có thời gian”","mo":"Hỏi vì sao chưa làm bài, con trả lời không có thời gian. Lịch của con thật sự có lớp thêm và học ở trường cả ngày. Nhưng khi cả nhà ngồi liệt kê thử thì không ai nói được tối thứ ba hay chiều chủ nhật vừa rồi đã đi đâu mất.","pt":"Cần dữ liệu trước khi tư vấn. Có thể lịch thực sự quá tải hoặc có nhiều thời gian bị phân mảnh.","chot":"Dễ rơi vào một trong hai cực: tin ngay là con quá tải, hoặc bác luôn là con viện cớ. Cả hai đều là kết luận trước dữ liệu. Câu không có thời gian còn có thể đúng theo nghĩa thời gian bị vụn thành nhiều mảnh ngắn không dùng được.","gp":"Ghi các khối hoạt động chính; phân loại bắt buộc – học – nghỉ – thiết bị – lãng phí – di chuyển.","kpi":"Ghi ≥6/7 ngày; phát hiện ≥2 khoảng có thể tối ưu; đề xuất 1 thay đổi thực tế.","dich":"Có nhật ký sáu trên bảy ngày do con tự ghi. Cộng được tổng số giờ mỗi loại trong tuần và chỉ ra ít nhất hai khoảng có thể dùng khác đi mà không phải bỏ lớp nào."},{"stt":9,"tang":"T1","nhom":"B. NHÓM TRÌ HOÃN – QUẢN LÝ THỜI GIAN","key":"TG04 – Kế hoạch thực tế","th":"Con lập kế hoạch nhưng không bao giờ theo được","mo":"Đầu tuần con viết kế hoạch kín trang, có giờ cho từng môn. Đến thứ tư kế hoạch không còn được mở ra. Việc của thứ hai bị đẩy sang thứ ba rồi dồn sang cuối tuần. Tuần sau con viết một bản kế hoạch mới với đúng khối lượng như cũ.","pt":"Có thể kế hoạch quá tham, thiếu thời gian đệm, không tính năng lượng, hoặc chỉ lập mà không review.","chot":"Dễ chẩn thành thiếu kỷ luật. Nhưng kế hoạch ấy có thể chưa bao giờ chạy nổi với quỹ giờ thật của con. Chỗ cần nhìn là khoảng lệch giữa số việc đã hẹn và số việc làm nổi trong một ngày bình thường, không phải mức ý chí.","gp":"Giảm còn 3 việc chính; có thời gian đệm; cuối ngày đối chiếu dự kiến – thực tế.","kpi":"≥5/7 ngày hoàn thành ≥70%; số việc chuyển ngày giảm; HV tự điều chỉnh ít nhất 2 lần.","dich":"Đọc được tỷ lệ việc hẹn so với việc xong theo từng ngày, kèm danh sách những việc bị đẩy nhiều lần. Con nói ra được con số trung bình việc mình thật sự làm nổi trong một ngày thường."},{"stt":10,"tang":"T1","nhom":"B. NHÓM TRÌ HOÃN – QUẢN LÝ THỜI GIAN","key":"TG05 – Ưu tiên việc quan trọng","th":"Có nhiều việc nhưng không biết ưu tiên","mo":"Buổi tối con làm ngay việc đầu tiên nhìn thấy hoặc việc bạn vừa nhắn hỏi. Bài kiểm tra sau ba hôm chưa được động tới, trong khi bài chép và bài dễ đã xong sớm. Hỏi tối nay việc nào quan trọng nhất, con kể ra sáu việc và không chọn được cái nào.","pt":"Điểm nghẽn ở quyết định chứ chưa chắc ở chăm chỉ.","chot":"Dễ chẩn thành lười. Ca này con làm rất nhiều việc, chỗ hỏng nằm ở khâu chọn. Đếm số việc con làm sẽ không thấy vấn đề; chỉ khi xếp việc theo mức hệ quả mới thấy công sức đang đổ vào nhóm ít hệ quả nhất.","gp":"Dùng 3 mức: cần làm hôm nay – nên làm – có thể để sau; khóa “việc số 1”.","kpi":"≥5/7 ngày xác định đúng việc số 1; hoàn thành việc số 1 ≥5 ngày.","dich":"Có bảy danh sách kèm số phút và bảy việc được khoanh. Tính ra được tỷ lệ phần trăm thời gian con dành cho nhóm việc mà chính con nhận là quan trọng nhất."},{"stt":11,"tang":"T1","nhom":"C. NHÓM TẬP TRUNG – THIẾT BỊ SỐ","key":"TT01 – Phiên tập trung","th":"Ngồi học lâu nhưng hiệu quả thấp","mo":"Con ngồi ở bàn ba tiếng. Kết thúc buổi, vở có hai bài giải dở và một trang chép đề. Trong ba tiếng đó con đứng lên vài lần, đổi môn giữa chừng, đi tìm tài liệu, hỏi lại đề bài. Cả nhà nhớ là con học nhiều nhưng không ai nói được con đã làm xong cái gì.","pt":"Cần phân biệt thời gian hiện diện với thời gian học thực. Theo dõi số gián đoạn, chất lượng đầu ra và mức khó nhiệm vụ.","chot":"Dễ nhầm thời gian ngồi với thời gian học. Bài toán ở đây không phải tăng giờ mà tìm chỗ rò trong giờ đã có. Thêm giờ cho một buổi vốn đang rò chỉ nhân lên đúng tỷ lệ rò ấy và làm cả nhà mệt thêm.","gp":"Một phiên 20–30 phút; một nhiệm vụ; chuẩn bị đủ tài liệu; ghi số lần gián đoạn và sản phẩm.","kpi":"≥5/7 phiên hoàn thành; ≤2 gián đoạn/phiên; đầu ra rõ.","dich":"Bảy buổi có đủ hai con số: giờ ngồi và đầu ra đếm được. Nhìn ra ít nhất hai buổi ngồi lâu mà đầu ra thấp, và biết trong hai buổi đó con đã rời việc bao nhiêu lần."},{"stt":12,"tang":"T1","nhom":"C. NHÓM TẬP TRUNG – THIẾT BỊ SỐ","key":"TT02 – Quản nhiễu số","th":"Liên tục kiểm tra điện thoại","mo":"Điện thoại nằm úp cạnh vở. Trong một buổi học con lật máy lên vài lần, có lần chỉ nhìn màn hình khoá rồi úp xuống, có lần mở ứng dụng và mất mấy phút. Khi bị hỏi, con nói chỉ xem giờ. Sau mỗi lần như vậy con đọc lại đoạn đang làm dở.","pt":"Chưa đủ cơ sở gọi nghiện. Cần kiểm tra yếu tố kích hoạt: thông báo, thói quen, buồn chán, sợ bỏ lỡ.","chot":"Dễ nhảy sang kết luận nghiện rồi tịch thu máy. Tịch thu làm mất luôn dữ liệu về thứ đang kích hoạt hành vi. Cần tách ba loại: có thông báo kêu, tay tự đưa ra theo thói quen, và mở máy đúng lúc gặp câu khó.","gp":"Tắt thông báo; thiết bị ngoài tầm tay; quy định mốc kiểm tra; HV tự thực hiện, PH không tịch thu.","kpi":"≥5/7 phiên không mở ứng dụng ngoài nhiệm vụ; số lần gián đoạn giảm ≥50%.","dich":"Có bảy ngày số vạch do con tự ghi cùng bảng phân loại lý do. Xác định được lý do chiếm phần lớn và khung giờ nào trong buổi học có nhiều vạch nhất."},{"stt":13,"tang":"T1","nhom":"C. NHÓM TẬP TRUNG – THIẾT BỊ SỐ","key":"TT03 – Một việc một lúc","th":"Vừa học vừa xem video/nghe nội dung giải trí","mo":"Máy tính mở một tab bài học và một tab video, tai nghe luôn có tiếng. Con nói nghe như vậy dễ vào bài hơn. Bài vẫn xong, nhưng thời gian làm một bài tương tự dài hơn hẳn những hôm không có tiếng, và hôm sau con nhớ lại nội dung rất mờ.","pt":"Không cần tranh luận. Cho HV so sánh thời gian, lỗi, mức nhớ giữa hai điều kiện.","chot":"Dễ sa vào tranh luận đúng sai với con, mà tranh luận kiểu đó thường không đi tới đâu. Ca này không cần thuyết phục, cần một phép so cùng loại bài do chính con làm và chính con đọc kết quả.","gp":"Thực hiện các cặp phiên có nhiễu/không nhiễu cùng mức nhiệm vụ.","kpi":"≥3 cặp so sánh; có dữ liệu thời gian, lỗi, khả năng nhớ; HV tự đưa ra lựa chọn môi trường.","dich":"Có ít nhất ba cặp lượt bài đủ ba số liệu. Con tự đọc ra chênh lệch về thời gian, số câu sai hoặc mức nhớ giữa hai điều kiện, thay vì nghe người lớn kết luận hộ."},{"stt":14,"tang":"T1","nhom":"C. NHÓM TẬP TRUNG – THIẾT BỊ SỐ","key":"TT04 – Duy trì chú ý","th":"Ngồi được 5–10 phút là đứng lên","mo":"Con vào bàn, làm được vài dòng rồi đứng dậy đi lấy nước, tìm thước, hỏi mẹ một câu, vào nhà vệ sinh. Chu kỳ đó lặp lại suốt buổi. Mỗi lần rời bàn kéo dài vài phút, và khi quay lại con thường đọc lại đoạn cũ từ đầu.","pt":"Có thể do phiên quá dài, nhiệm vụ quá khó, môi trường chưa chuẩn bị hoặc khả năng duy trì chú ý còn hạn chế.","chot":"Dễ chẩn thành không tập trung nói chung. Nhưng rời bàn vì thiếu cái thước và rời bàn ngay khi gặp câu khó là hai chuyện khác hẳn nhau. Chưa ghi lý do rời bàn thì chưa biết mình đang xử cái gì.","gp":"Bắt đầu 15–20 phút; chuẩn bị mọi thứ; lý do rời bàn phải được ghi.","kpi":"≥5/7 phiên đủ thời lượng; số lần rời vị trí giảm; chất lượng đầu ra ổn.","dich":"Có số lần rời bàn theo từng buổi trong bảy ngày cùng danh sách lý do đã phân loại. Chỉ ra được một lý do lặp từ ba lần trở lên và biết nó thường rơi vào phút thứ mấy của buổi."},{"stt":15,"tang":"T1","nhom":"C. NHÓM TẬP TRUNG – THIẾT BỊ SỐ","key":"TT05 – Chuyển trạng thái","th":"Khó dừng trò chơi để chuyển sang học","mo":"Đến giờ đã hẹn, con nói còn một ván nữa. Ván đó kéo dài thêm hai mươi đến bốn mươi phút. Khi rời máy, con còn ngồi thừ, mở lại điện thoại, đi vòng quanh nhà rồi mới vào bàn. Quãng giữa lúc tắt máy và lúc mở sách thường dài hơn cả phần con dự tính.","pt":"Điểm nghẽn là chuyển trạng thái. Nếu chỉ nói “tự giác lên” thường không hiệu quả.","chot":"Dễ quy vào ham chơi rồi cắt giờ chơi. Chỗ hỏng thật nằm ở đoạn chuyển trạng thái: con dừng được nhưng chưa vào được việc mới. Chỉ cắt giờ chơi mà không nhìn đoạn chuyển thì đoạn ấy vẫn dài y nguyên.","gp":"Báo trước mốc dừng; không bắt đầu nội dung dài sát giờ; có 5–10 phút chuyển tiếp; việc học đầu tiên phải rõ.","kpi":"≥5/7 ngày dừng giải trí trong ±10 phút; bắt đầu học ≤10 phút sau mốc chuyển.","dich":"Bảy tối có đủ bốn mốc giờ. Tách được hai độ trễ thành hai con số riêng biệt và biết đoạn nào đang ăn nhiều phút hơn của gia đình mỗi tối."}],"T2":[{"stt":1,"tang":"T2","nhom":"NHÓM 1. TỰ QUẢN – KHẢ NĂNG THỰC THI","key":"Ổn định tự khởi động","th":"Tầng 1 tự bắt đầu được nhưng sang tuần mới lại phụ thuộc nhắc","mo":"Trong bảy ngày thử thách con tự vào bàn phần lớn các buổi. Hết tuần, sổ ghi bỏ trống, và tối thứ ba tuần sau bố mẹ lại phải nhắc ba lần. Con nói tuần trước làm được vì có bảng ghi và có người theo dõi; không có bảng thì con không nhớ tới giờ học.","pt":"Cho thấy hành vi mới có thể xuất hiện nhưng chưa trở thành cấu trúc ổn định. Cần xác định con phụ thuộc vào hứng thú, hệ thống nhắc hay môi trường.","chot":"Dễ mừng vội vì tuần đầu chạy tốt rồi kết luận con đã tự giác. Điều tuần đầu chứng minh chỉ là hành vi ấy xuất hiện được, chưa phải nó tự đứng. Câu hỏi đã đổi: không còn là con có làm được không, mà là con giữ nó bằng cơ chế nào khi hết chương trình.","gp":"Đo 7 ngày đường cơ sở; chuẩn hóa tín hiệu bắt đầu; giảm nhắc hệ thống; tuần cuối chuyển sang tự lập tín hiệu.","kpi":"≥16/21 ngày tự bắt đầu; 7 ngày cuối ≥6/7; PH nhắc ≤1 lần/ngày; ít nhất 2 lần tự phục hồi sau trượt.","dich":"Ba tuần có đủ bảng ba cột và ba lần so cuối tuần. Cột ai kích hoạt chuyển dần về phía con tự, và trong bảy ngày cuối có ít nhất một lần con trượt rồi tự quay lại vào hôm sau mà không cần ai nhắc."},{"stt":2,"tang":"T2","nhom":"NHÓM 1. TỰ QUẢN – KHẢ NĂNG THỰC THI","key":"Tự quản đa nhiệm vụ","th":"Con có thể tự học nhưng chỉ ở môn mình thích","mo":"Môn con thích, con tự mở sách, ngồi lâu, làm hết bài. Môn khó, con để cuối buổi, làm được vài câu rồi dừng, hoặc chờ có người nhắc mới bắt đầu. Trong một tuần, số buổi con tự vào bàn với môn thích nhiều gấp mấy lần môn khó.","pt":"Đây không còn là vấn đề tự giác chung mà liên quan tới mức hấp dẫn nhiệm vụ, khả năng chịu khó và chiến lược tiếp cận môn khó.","chot":"Dễ kết luận con đã tự giác rồi, chỉ còn ghét mỗi một môn. Nhưng tự quản chỉ đứng vững khi nó chạy được cả với việc không hấp dẫn. Chỗ cần đo là cách con vào bài của môn khó, chứ không phải mức yêu ghét môn ấy.","gp":"So sánh môn thích – trung tính – khó; thiết kế cách bắt đầu khác nhau; chuyển chiến lược giữa môn.","kpi":"Mỗi nhóm môn đạt ≥70% kế hoạch; chênh lệch tỷ lệ bắt đầu giữa môn thích và môn khó giảm ≥30%.","dich":"Ba tuần dữ liệu tách theo ba nhóm môn. Khoảng cách độ trễ giữa nhóm thích và nhóm khó thu hẹp so với tuần một, và trong tuần cuối cả ba nhóm đều đạt phần lớn kế hoạch đã đặt."},{"stt":3,"tang":"T2","nhom":"NHÓM 1. TỰ QUẢN – KHẢ NĂNG THỰC THI","key":"Điều chỉnh kế hoạch","th":"Con làm tốt khi lịch ổn định nhưng vỡ ngay khi có việc phát sinh","mo":"Tuần bình thường con chạy đủ kế hoạch. Có một buổi họp lớp đột xuất, một hôm ốm hoặc một chuyến đi, thì cả tuần đó không còn việc nào được làm. Con không dời việc sang ngày khác mà bỏ luôn, và phải mất vài ngày mới quay lại nếp cũ.","pt":"Con có khả năng thực thi nhưng chưa có năng lực điều chỉnh.","chot":"Dễ khen con có kỷ luật rồi lo lắng về tính linh hoạt như một nét tính cách. Thực ra con có năng lực thực thi nhưng chưa có quy trình điều chỉnh: khi kế hoạch vỡ, con không biết bước tiếp theo là gì nên dừng hẳn.","gp":"Dạy quy trình: dừng – đánh giá – bỏ bớt – ưu tiên – lập lại; tạo các tình huống thay đổi có chủ đích.","kpi":"≥80% tình huống phát sinh được điều chỉnh trong ngày; số ngày “vỡ toàn bộ” ≤3/21.","dich":"Ba tuần có nhật ký phát sinh đầy đủ và số ngày vỡ toàn bộ giảm so với tuần một. Trong tuần ba, phần lớn tình huống phát sinh đều có một dòng dời việc được viết ngay trong ngày chứ không để sang hôm sau."},{"stt":4,"tang":"T2","nhom":"NHÓM 1. TỰ QUẢN – KHẢ NĂNG THỰC THI","key":"Giảm phụ thuộc giám sát","th":"Con hoàn thành việc nhưng vẫn cần bố mẹ kiểm soát liên tục","mo":"Bài con làm đủ và đúng hạn. Nhưng bố mẹ vẫn hỏi giữa buổi, xem vở mỗi tối, nhắn tin hỏi khi đi vắng. Nếu một hôm không ai hỏi, con vẫn làm nhưng bố mẹ nói không yên tâm. Con không tự đưa bằng chứng, chỉ đưa khi bị hỏi tới.","pt":"Điểm nghẽn chuyển từ hành vi học viên sang cơ chế quan hệ và niềm tin.","chot":"Dễ nhìn đây là vấn đề của con trong khi hành vi của con đã đạt. Điểm nghẽn đã chuyển sang cơ chế quan hệ: người lớn chưa có cách nào để biết mà không phải kiểm. Chỗ cần đổi là ai đưa bằng chứng và đưa vào lúc nào.","gp":"Xây bậc hỗ trợ 4 mức; PH chỉ review theo mốc; HV tự cung cấp bằng chứng thay vì bị kiểm tra.","kpi":"Mức giám sát giảm ≥2 bậc; HV duy trì ≥80% nhiệm vụ; PH kiểm tra ngoài mốc ≤20%.","dich":"Ba tuần có số lần kiểm tra đếm được, giảm rõ qua từng tuần, trong khi tỷ lệ việc hoàn thành không giảm theo. Tuần ba có đủ các mốc review và con là người đưa bằng chứng ở phần lớn các mốc đó."},{"stt":5,"tang":"T2","nhom":"NHÓM 1. TỰ QUẢN – KHẢ NĂNG THỰC THI","key":"Tự quản tuần","th":"Con biết tự quản từng ngày nhưng chưa biết tự quản cả tuần","mo":"Mỗi tối con làm xong việc của hôm đó. Nhưng bài kiểm tra thứ sáu thì tới thứ năm con mới biết phải ôn. Bài thuyết trình giao trước hai tuần được làm vào đêm cuối. Con không có chỗ nào nhìn thấy cả tuần một lượt.","pt":"Năng lực tự quản còn ở cấp vi mô.","chot":"Dễ khen con đã tự quản tốt rồi dừng ở đó. Nhưng tự quản mới ở cấp một ngày; cấp tuần đòi một năng lực khác là nhìn trước hạn rồi đặt việc lùi lại. Chỗ hỏng không phải kỷ luật hằng ngày mà là tầm nhìn xa hơn hai mươi bốn giờ.","gp":"Chủ nhật lập bản đồ tuần; mỗi ngày cập nhật; giữa tuần điều chỉnh; cuối tuần phản tư.","kpi":"3/3 tuần có kế hoạch; ≥80% hạn quan trọng được chủ động chuẩn bị; ít nhất 2 lần tự điều chỉnh tuần.","dich":"Ba tuần có bản ghi khoảng cách giữa ngày biết hạn và ngày bắt đầu làm. Số việc làm vào đêm cuối giảm qua các tuần, và tuần ba có bản đồ tuần cùng lần rà giữa tuần được thực hiện đúng lịch."},{"stt":6,"tang":"T2","nhom":"NHÓM 2. LẬP KẾ HOẠCH – QUẢN LÝ THỜI GIAN – HIỆU SUẤT","key":"Ước lượng thời gian","th":"Con thường xuyên ước lượng sai thời gian làm bài","mo":"Con nói bài này mười lăm phút là xong, thực tế mất một tiếng. Vì tính sai nên lịch tối luôn dồn và việc cuối cùng bị đẩy sang hôm sau. Khi được hỏi vì sao lệch, con nói tại hôm nay bài khó hơn mọi khi, và câu đó lặp lại gần như mỗi tối.","pt":"Khả năng lập kế hoạch yếu vì thiếu dữ liệu thời gian thực.","chot":"Dễ chẩn thành con chủ quan. Nhưng ước lượng là kỹ năng dựa trên dữ liệu quá khứ, mà con chưa từng có bộ dữ liệu ấy. Chưa đo đủ số lần thì lời khuyên hãy dự trù thêm thời gian cũng không có căn cứ nào để cộng vào.","gp":"Ghi dự kiến – thực tế – độ lệch theo loại nhiệm vụ; điều chỉnh hệ số cá nhân.","kpi":"≥30 nhiệm vụ được đo; độ lệch trung bình giảm ≥30%; tuần 3 ≥70% nhiệm vụ lệch không quá 20%.","dich":"Có ít nhất ba mươi nhiệm vụ được đo đủ ba số. Độ lệch trung bình của tuần ba nhỏ hơn tuần một, và con nói ra được hệ số riêng của mình cho từng loại nhiệm vụ."},{"stt":7,"tang":"T2","nhom":"NHÓM 2. LẬP KẾ HOẠCH – QUẢN LÝ THỜI GIAN – HIỆU SUẤT","key":"Kế hoạch vừa sức","th":"Kế hoạch luôn quá tải","mo":"Kế hoạch mỗi ngày có tám đến mười đầu việc. Đến tối con làm được bốn hoặc năm việc thì hết giờ. Phần còn lại chuyển sang hôm sau, cộng dồn với việc của hôm sau. Con vẫn viết kế hoạch mới với số lượng như cũ và tối nào cũng kết thúc bằng cảm giác chưa xong.","pt":"Có thể do không biết giới hạn năng lượng, thời gian hoặc nhu cầu nghỉ.","chot":"Dễ đọc thành con không đủ chăm. Nhưng kế hoạch ấy chưa bao giờ chạy nổi trong quỹ giờ thật, nên mỗi tối đều kết thúc bằng một thất bại đã được lập trình sẵn từ lúc viết. Cần biết sức chứa thật của một ngày trước khi nói tới kỷ luật.","gp":"Xác định sức chứa ngày; phân loại bắt buộc – quan trọng – tùy chọn; giữ thời gian dự phòng.","kpi":"≥16/21 ngày hoàn thành ≥80% việc chính; số ngày phải chuyển \\>50% nhiệm vụ giảm rõ.","dich":"Có con số sức chứa thật của một ngày, tính từ dữ liệu tuần một. Tuần ba phần lớn các ngày hoàn thành gần hết kế hoạch, và số ngày phải chuyển quá nửa số việc sang hôm sau giảm rõ so với tuần một."},{"stt":8,"tang":"T2","nhom":"NHÓM 2. LẬP KẾ HOẠCH – QUẢN LÝ THỜI GIAN – HIỆU SUẤT","key":"Việc đòn bẩy","th":"Con làm nhiều việc nhưng việc quan trọng vẫn không tiến triển","mo":"Cuối ngày con báo đã làm rất nhiều: chép bài, soạn vở, làm bài dễ, trả lời tin nhắn nhóm. Bài luận nộp tuần sau và phần ôn môn đang yếu vẫn ở nguyên chỗ cũ. Danh sách việc luôn được gạch gần hết nhưng thứ quan trọng nhất chưa từng bị gạch.","pt":"Hiệu suất cao giả tạo do ưu tiên việc dễ và nhanh.","chot":"Dễ nhìn thấy con bận rồi kết luận con đang cố gắng. Số việc hoàn thành cao che mất việc chưa hề tiến. Chỗ cần nhìn không phải tổng số việc mà là mỗi ngày có bao nhiêu phút rơi vào đúng việc tạo ra thay đổi.","gp":"Mỗi ngày xác định 1 việc tạo tác động lớn nhất; thực hiện trước nhóm việc nhỏ nếu có thể.","kpi":"≥16 ngày hoàn thành việc đòn bẩy; có minh chứng tiến bộ tại mục tiêu chính.","dich":"Ba tuần có tổng số phút dành cho việc đòn bẩy, tăng dần qua các tuần. Mục tiêu chính có bằng chứng tiến được nhìn thấy: số trang, số phần đã xong, hoặc điểm bài tự kiểm trước và sau."},{"stt":9,"tang":"T2","nhom":"NHÓM 2. LẬP KẾ HOẠCH – QUẢN LÝ THỜI GIAN – HIỆU SUẤT","key":"Chu kỳ ôn tập","th":"Con thường xuyên học dồn trước kiểm tra","mo":"Trước kiểm tra hai ngày, con học liên tục tới khuya. Các tuần trước đó môn ấy gần như không được mở. Điểm có thể vẫn được nhưng sau kỳ thi con quên nhanh, và tuần kế tiếp lại lặp đúng chu kỳ đó với một môn khác.","pt":"Cần xem thói quen phân bổ ôn, khả năng theo dõi tiến độ và cơ chế áp lực.","chot":"Dễ chấp nhận vì điểm vẫn ổn và coi đó là phong cách học của con. Nhưng học dồn mua điểm bằng phần nhớ dài hạn, và chu kỳ này sẽ vỡ khi số môn cùng thi tăng lên. Chỗ cần đổi là khoảng cách giữa lần tiếp xúc đầu tiên với ngày thi.","gp":"Chọn 1–2 môn; chia nội dung 3 tuần; có kiểm tra ngắn định kỳ.","kpi":"≥80% nội dung được tiếp xúc trước 3 ngày cuối; điểm tự kiểm tăng; thời gian ôn đêm sát thi giảm.","dich":"Ba tuần có biểu đồ số phút theo ngày cho môn đã chọn, phân bố đều hơn so với tuần một. Phần lớn nội dung được chạm tới trước ba ngày cuối, và điểm bài tự kiểm cuối tuần ba cao hơn bài đầu tiên."},{"stt":10,"tang":"T2","nhom":"NHÓM 2. LẬP KẾ HOẠCH – QUẢN LÝ THỜI GIAN – HIỆU SUẤT","key":"Cân bằng tải","th":"Con bận học nhưng vẫn không có thời gian nghỉ","mo":"Lịch con kín từ sáng tới tối, có lớp thêm gần như mọi ngày. Con nói mệt nhưng vẫn ngồi vào bàn. Bữa ăn bị rút ngắn, không có buổi nào vận động, giờ ngủ lùi dần. Cuối tuần con nằm cả ngày rồi tối lại làm bài tới khuya.","pt":"Không mặc định “cần cố hơn”. Cần kiểm tra tải thực tế và chất lượng phục hồi.","chot":"Dễ đọc thành con cần cố hơn nữa hoặc cần sắp xếp giỏi hơn. Nhưng khi tải đã vượt sức phục hồi thì thêm kỹ thuật quản lý thời gian chỉ nén chặt hơn. Cần đo tải thật và chất lượng nghỉ trước khi bàn tới hiệu suất.","gp":"Đo tải học – nghỉ – vận động – ngủ; loại việc giá trị thấp; thiết kế khoảng phục hồi.","kpi":"Có ≥6 ngày/tuần đạt lịch cân bằng đã thống nhất; mức năng lượng tự đánh giá tăng; nhiệm vụ chính không giảm chất lượng.","dich":"Ba tuần có đủ bốn con số theo ngày. Giờ ngủ và số phút vận động của tuần ba tăng so với tuần một trong khi khối lượng việc chính không giảm, và gia đình chỉ ra được hoạt động đã cắt cùng phần thời gian thu lại được."},{"stt":11,"tang":"T2","nhom":"NHÓM 3. TẬP TRUNG – THIẾT BỊ SỐ – KHẢ NĂNG LÀM VIỆC SÂU","key":"Sức bền tập trung","th":"Tập trung được phiên ngắn nhưng không kéo dài được","mo":"Con làm liên tục được khoảng hai mươi phút, sau đó bắt đầu đứng lên, đổi việc, mở điện thoại. Với bài ngắn thì đủ, nhưng bài luận hoặc đề dài thì con không đi hết được, phải chia thành nhiều lần cách nhau và mỗi lần lại đọc lại từ đầu.","pt":"Năng lực duy trì chưa đủ cho nhiệm vụ học thuật dài.","chot":"Dễ ép ngồi lâu hơn bằng ý chí hoặc bằng đồng hồ đếm ngược. Sức bền chú ý nâng được nhưng phải nâng theo nấc và phải có mốc gốc. Nhảy thẳng lên bốn mươi phút thường làm con hỏng rồi tự kết luận mình không tập trung được.","gp":"Tuần 1 đo 20–25 phút; tuần 2 nâng 30–35; tuần 3 40–45 tùy tuổi.","kpi":"≥16 phiên đạt chuẩn; số gián đoạn/30 phút giảm; tuần 3 đạt thời lượng đích ≥5/7 ngày.","dich":"Ba tuần có thời lượng phiên trung bình và số gián đoạn tính trên ba mươi phút. Thời lượng tuần ba dài hơn tuần một và số gián đoạn trên cùng khoảng thời gian giảm, với phần lớn ngày trong tuần cuối đạt mức đã đặt."},{"stt":12,"tang":"T2","nhom":"NHÓM 3. TẬP TRUNG – THIẾT BỊ SỐ – KHẢ NĂNG LÀM VIỆC SÂU","key":"Tự quản thiết bị số","th":"Không dùng điện thoại khi học nhưng mất nhiều thời gian ngoài giờ học","mo":"Trong buổi học con để máy ở phòng khác và không mở. Nhưng sau khi học xong, con dùng máy liên tục tới khuya. Sáng dậy con mở máy trước khi ra khỏi giường. Con không nói được hôm qua mình đã dùng bao nhiêu giờ và cho việc gì.","pt":"Vấn đề đã chuyển từ nhiễu trong học sang quản trị toàn bộ hành vi số.","chot":"Dễ hài lòng vì giờ học đã sạch nhiễu rồi bỏ qua phần còn lại. Vấn đề đã chuyển từ nhiễu trong buổi học sang quản trị toàn bộ thời gian số, và nó ăn vào giờ ngủ chứ không ăn vào giờ học. Cắt máy thẳng tay thường tạo ra giấu giếm chứ không tạo ra tự quản.","gp":"Ghi thời lượng và mục đích; thiết kế khung sử dụng; thay một phần bằng hoạt động khác.","kpi":"Thời gian sử dụng không chủ đích giảm ≥25–30%; ≥5 ngày/tuần tuân thủ khung; HV tự điều chỉnh.","dich":"Ba tuần có tổng thời gian dùng máy và tỷ lệ phần trôi theo, giảm dần qua các tuần. Tuần ba phần lớn các ngày tuân thủ giờ đóng máy do chính con đặt, và giờ đi ngủ sớm hơn so với tuần một."},{"stt":13,"tang":"T2","nhom":"NHÓM 3. TẬP TRUNG – THIẾT BỊ SỐ – KHẢ NĂNG LÀM VIỆC SÂU","key":"Một phiên – một mục tiêu","th":"Con liên tục chuyển qua lại giữa các nhiệm vụ","mo":"Trong một buổi con mở ba môn. Làm Toán mười phút thì nhớ ra bài Văn chưa xong nên chuyển sang Văn, rồi lại quay về Toán. Cuối buổi cả ba môn đều làm dở. Mỗi lần quay lại con phải đọc lại đoạn cũ mới tiếp được.","pt":"Có thể do né khó, FOMO nhiệm vụ hoặc thiếu khả năng khóa một mục tiêu.","chot":"Dễ gọi chung là mất tập trung. Nhưng ở đây hành vi rất cụ thể: con chuyển việc đúng vào lúc gặp chỗ khó, hoặc đúng lúc nhớ ra một việc khác. Chưa tách được hai động cơ đó thì không biết đang xử né khó hay xử trí nhớ vụn.","gp":"Mỗi phiên khóa một đầu ra; ghi lại “ý muốn chuyển việc” nhưng không chuyển ngay.","kpi":"≥80% phiên giữ một nhiệm vụ; số lần chuyển việc giảm ≥50%.","dich":"Ba tuần có số lần chuyển việc theo ngày cùng bảng lý do đã phân loại. Số lần chuyển giữa chừng giảm rõ so với tuần một, và phần lớn phiên trong tuần cuối kết thúc bằng một đầu ra hoàn chỉnh thay vì ba việc dở."},{"stt":14,"tang":"T2","nhom":"NHÓM 3. TẬP TRUNG – THIẾT BỊ SỐ – KHẢ NĂNG LÀM VIỆC SÂU","key":"Hồ sơ môi trường tập trung","th":"Tập trung tốt ở nhà nhưng kém ở lớp hoặc ngược lại","mo":"Ở một nơi con làm liên tục và xong bài; ở nơi kia con nhìn ra cửa sổ, nói chuyện, hoặc chép của bạn. Kết quả bài làm giữa hai nơi chênh nhau rõ với cùng dạng bài. Cả nhà chưa ghi lại hai nơi ấy khác nhau ở những chỗ nào.","pt":"Đây là dữ liệu cho thấy môi trường tác động lớn. Cần so sánh tiếng ồn, chỗ ngồi, nhiệm vụ, tương tác, cảm giác an toàn.","chot":"Dễ kết luận con lười ở một trong hai nơi. Nhưng chênh lệch giữa hai bối cảnh chính là dữ liệu quý nhất của ca này: nó cho thấy tập trung của con đang phụ thuộc mạnh vào điều kiện bên ngoài, mà điều kiện thì sửa được còn tính cách thì không.","gp":"Theo dõi nhiều bối cảnh; chấm tập trung; tìm yếu tố tăng/giảm; thử điều chỉnh khả thi.","kpi":"≥15 lượt dữ liệu đa bối cảnh; xác định ≥3 yếu tố hỗ trợ và ≥3 yếu tố gây nhiễu.","dich":"Có ít nhất mười lăm lượt dữ liệu trải trên các bối cảnh khác nhau. Xác định được ba yếu tố làm con tập trung tốt hơn và ba yếu tố gây nhiễu, và có ít nhất một thay đổi đã thử rồi giữ lại hoặc trả về theo dữ liệu."},{"stt":15,"tang":"T2","nhom":"NHÓM 3. TẬP TRUNG – THIẾT BỊ SỐ – KHẢ NĂNG LÀM VIỆC SÂU","key":"Khôi phục tập trung","th":"Con tập trung được nhưng rất khó quay lại sau khi bị gián đoạn","mo":"Đang làm bài, có người gọi hoặc có tin nhắn thì con dừng lại. Sau khi việc kia xong, con không quay về bàn ngay mà làm việc khác thêm hai mươi tới ba mươi phút. Khi ngồi lại, con đọc lại từ đầu vì không nhớ mình đang dở ở chỗ nào.","pt":"Năng lực phục hồi tập trung yếu.","chot":"Dễ dồn sức vào việc chống gián đoạn, trong khi gián đoạn thì không loại hết được. Chỗ hỏng nằm ở đoạn quay lại: con chưa để lại dấu vết nào cho chính mình trước khi rời việc, nên mỗi lần trở về đều phải bắt đầu lại từ đầu.","gp":"Trước khi rời việc, ghi điểm dừng và bước tiếp theo; khi quay lại dùng nghi thức 2 phút.","kpi":"≥80% lần gián đoạn quay lại trong ≤10 phút; số nhiệm vụ bỏ dở giảm.","dich":"Ba tuần có số lần gián đoạn kèm hai khoảng thời gian đo được. Thời gian quay lại đúng việc ở tuần ba ngắn hơn tuần một, và phần lớn lần rời bàn trong tuần cuối đều có dòng ghi chỗ dừng."}],"T3":[{"stt":1,"tang":"T3","nhom":"NHÓM 1 – TỰ QUẢN VÀ KỶ LUẬT CÁ NHÂN","key":"T3-TQ01 – Tự khởi động bền vững","th":"Con tự bắt đầu được nhưng chưa ổn định dài hạn","mo":"Có tuần con vào bàn đúng giờ cả bảy ngày, không ai gọi. Tuần sau đó, sau một đợt kiểm tra hoặc một kỳ nghỉ, giờ vào bàn lùi dần rồi bố mẹ lại phải gọi hai ba lần. Chuỗi đứt rồi nối lại, nối được vài ngày thì đứt tiếp. Cả nhà không nói được đứt vào lúc nào và vì sao.","pt":"Năng lực đã xuất hiện nhưng chưa đủ bền. Cần chuyển từ hành vi có hỗ trợ sang thói quen tự vận hành.","chot":"Dễ chẩn thành con hết cố gắng, nên nhà tăng nhắc trở lại. Thật ra hành vi đã có, cái chưa có là khả năng nối lại chuỗi sau ngày trượt. Đo sai chỗ này thì mọi lời nhắc thêm chỉ che mất số liệu về việc con tự quay lại được hay không.","gp":"Chuẩn hóa giờ bắt đầu, nghi thức đầu phiên, môi trường, tín hiệu nội tại; giảm dần nhắc của PH và hệ thống; theo dõi độ trễ và khả năng quay lại.","kpi":"≥80% ngày tự bắt đầu; 30 ngày cuối ≥85%; PH nhắc trực tiếp ≤10% số ngày; trượt không quá 2 ngày liên tiếp.","dich":"Ba mươi ngày cuối, cột người khởi động ghi tên con ở phần lớn số ngày, và mỗi lần trượt đều có ngày quay lại ghi trong vòng một hai ngày. Con nói được giờ nào là giờ vào bàn của mình mà không cần mở lịch ra xem."},{"stt":2,"tang":"T3","nhom":"NHÓM 1 – TỰ QUẢN VÀ KỶ LUẬT CÁ NHÂN","key":"T3-TQ02 – Thực thi kế hoạch","th":"Con có kế hoạch nhưng khả năng thực thi còn yếu","mo":"Đầu tuần con viết ra kế hoạch, chữ rõ, việc đầy đủ. Đến thứ tư một nửa số việc chưa động tới, cuối tuần bản kế hoạch không được mở lại. Tuần sau con viết một bản mới, dài tương đương, không nhắc gì đến những việc còn tồn của tuần trước.","pt":"Điểm nghẽn nằm ở thực thi: nhiệm vụ quá lớn, ước lượng sai, ưu tiên kém hoặc thiếu review.","chot":"Dễ chẩn thành con thiếu kỷ luật, nên nhà bắt viết kế hoạch kỹ hơn. Nghẽn nằm ở khâu giữa: việc ghi trên giấy quá to so với một buổi tối, và không có ai đọc lại bản cũ. Viết đẹp thêm không sửa được điều đó.","gp":"Mỗi tuần lập kế hoạch, giữa tuần kiểm tra, cuối tuần review; phân tích nguyên nhân việc không hoàn thành và điều chỉnh khối lượng.","kpi":"≥80% tuần có kế hoạch; tỷ lệ hoàn thành việc quan trọng ≥75%; độ lệch dự kiến–thực tế giảm ≥30%.","dich":"Bản kế hoạch tuần được mở lại và đánh dấu ở phần lớn số tuần, việc tồn được chuyển sang tuần sau chứ không biến mất, và con tự chỉ ra được lý do trượt hay gặp nhất của mình bằng số lần đã ghi."},{"stt":3,"tang":"T3","nhom":"NHÓM 1 – TỰ QUẢN VÀ KỶ LUẬT CÁ NHÂN","key":"T3-TQ03 – Tự quản linh hoạt","th":"Con tự quản tốt khi thuận lợi nhưng mất kiểm soát khi lịch thay đổi","mo":"Tuần nào lịch chạy đúng như dự tính thì con làm gần đủ việc. Chỉ cần một buổi học thêm dời giờ, một chuyến đi hoặc một hôm ốm, cả tuần đó gần như không có việc nào hoàn thành, kể cả những việc không liên quan gì đến chỗ bị dời.","pt":"Năng lực tự quản chưa có tính thích nghi.","chot":"Dễ chẩn thành con dễ nản. Thật ra con chưa có thao tác xếp lại lịch khi lịch vỡ: không biết giữ việc nào, bỏ việc nào. Ép con làm cho đủ như cũ chỉ làm tuần vỡ dài thêm.","gp":"Luyện quy trình điều chỉnh: đánh giá tải → giữ việc cốt lõi → bỏ/hoãn việc thấp → lập lại lịch → phục hồi.","kpi":"≥80% tình huống phát sinh có điều chỉnh trong 24h; số tuần vỡ hoàn toàn ≤2/12; việc cốt lõi duy trì ≥75%.","dich":"Phần lớn sự cố lịch được xếp lại trong vòng một ngày, việc cốt lõi vẫn chạy trong tuần có biến động, và số tuần vỡ trắng ở chặng cuối thấp hơn rõ so với chặng đầu."},{"stt":4,"tang":"T3","nhom":"NHÓM 1 – TỰ QUẢN VÀ KỶ LUẬT CÁ NHÂN","key":"T3-TQ04 – Chuyển giao tự chủ","th":"Con phụ thuộc nhiều vào hệ thống theo dõi","mo":"Khi ứng dụng báo, con làm ngay. Tuần thử tắt thông báo, con quên hai ba nhiệm vụ, rồi nói không thấy báo nên không biết. Con chưa từng tự mở ứng dụng ra xem hôm nay có gì nếu không có tiếng chuông.","pt":"Công cụ đang thay thế năng lực nội tại.","chot":"Dễ nhầm thành con đã tự quản vì các chỉ số trên hệ thống đều đẹp. Chỉ số đẹp ấy là của hệ thống, không phải của con. Chỗ cần đo là con còn làm được gì khi hệ thống im.","gp":"Giảm dần thông báo; HV tự tạo công cụ; có tuần “không hệ thống”; review bằng dữ liệu cuối tuần.","kpi":"30 ngày cuối ≥80% nhiệm vụ tự vận hành; số tín hiệu từ hệ thống giảm ≥60%; hiệu suất không giảm quá 10%.","dich":"Vào những ngày không hệ thống, số nhiệm vụ hoàn thành gần bằng ngày có nhắc, và con tự dựng được danh sách việc hôm sau mà không cần mở ứng dụng."},{"stt":5,"tang":"T3","nhom":"NHÓM 1 – TỰ QUẢN VÀ KỶ LUẬT CÁ NHÂN","key":"T3-TQ05 – Trách nhiệm cá nhân","th":"Con chưa tự chịu trách nhiệm với hậu quả của quyết định","mo":"Con quên nộp bài, mất điểm, rồi giải thích rằng cô không nhắc hoặc bạn không báo. Bố mẹ là người nhắn cho giáo viên, xin nộp bù, tìm lại tài liệu. Sau khi việc được gỡ xong, con không thay đổi gì trong cách làm và tình huống ấy lặp lại trong tháng.","pt":"Cần phát triển trách nhiệm ở mức cao hơn: lựa chọn – hậu quả – điều chỉnh.","chot":"Dễ chẩn thành con vô trách nhiệm rồi phạt. Chỗ đang thiếu là bước con nhìn lại lựa chọn của mình và tự làm phần khắc phục. Người lớn gỡ hộ nhanh gọn chính là thứ giữ cho vòng lặp này chạy tiếp.","gp":"Mỗi sự cố dùng mẫu: tôi chọn gì – chuyện gì xảy ra – phần của tôi – việc tôi làm tiếp.","kpi":"≥80% sự cố có phương án khắc phục; giảm lý do không kèm hành động; PH ít phải giải quyết hậu quả thay.","dich":"Phần lớn sự cố có ghi việc làm tiếp và việc đó được con làm thật, số lần bố mẹ đứng ra giải quyết thay giảm rõ, và những sự cố lặp nguyên dạng ít dần về cuối chu kỳ."},{"stt":6,"tang":"T3","nhom":"NHÓM 2 – QUẢN LÝ THỜI GIAN VÀ HIỆU SUẤT","key":"T3-TG01 – Quản tải cá nhân","th":"Con thường xuyên quá tải vì nhận quá nhiều việc","mo":"Con nhận thêm việc lớp, việc câu lạc bộ, việc nhóm, mỗi lần đều nói được. Đến cuối tuần con ngồi đến khuya để trả nợ bài, sáng dậy muộn, và bỏ những việc đã hứa với chính mình. Trong tuần con nói mệt nhưng vẫn nhận việc mới vào ngày hôm sau.","pt":"Khả năng nói “không” và xác định giới hạn tải chưa tốt.","chot":"Dễ chẩn thành con ham hoạt động. Cái con chưa có là một con số về sức chứa để lấy đó mà từ chối; cắt việc sau khi đã quá tải thì không học được cách nói không lúc được hỏi. Mệt kéo dài kèm mất ngủ hoặc sụt ăn là ranh giới cần chuyên gia, không phải chuyện xếp lịch.","gp":"Xác định sức chứa tuần; giới hạn nhiệm vụ; có thời gian đệm và hồi phục.","kpi":"≥80% tuần không vượt tải đã xác định; tỷ lệ hoàn thành việc quan trọng ≥80%; mức mệt tự đánh giá giảm.","dich":"Phần lớn số tuần nằm trong trần giờ đã chốt, mỗi lần nhận việc mới đều có tên một việc bị bỏ ra ghi kèm, và số buổi học bù sau nửa đêm giảm rõ so với hai tuần đo đầu."},{"stt":7,"tang":"T3","nhom":"NHÓM 2 – QUẢN LÝ THỜI GIAN VÀ HIỆU SUẤT","key":"T3-TG02 – Thời gian đòn bẩy","th":"Con bận nhưng mục tiêu dài hạn không tiến triển","mo":"Sổ của con ngày nào cũng kín việc và việc nào cũng được đánh dấu xong. Nhưng mục tiêu con đặt từ đầu học kỳ, hỏi lại sau hai tháng thì vẫn ở nguyên chỗ cũ: chưa có sản phẩm, chưa có bài đo, chưa có bước nào rõ. Các việc đã xong đều là việc gấp và đến từ người khác.","pt":"Thiếu năng lực ưu tiên việc đòn bẩy.","chot":"Dễ khen là con chăm rồi để nguyên. Chỗ hỏng là việc đòn bẩy không bao giờ được xếp trước, nên luôn bị việc gấp ăn hết chỗ. Thêm giờ học không sửa được, chỉ đổi thứ tự mới sửa được.","gp":"Mỗi tuần chọn 2–3 việc tạo tác động lớn; đưa vào lịch trước việc thứ yếu.","kpi":"≥75% việc đòn bẩy hoàn thành đúng tuần; có tiến bộ đo được ở 1–2 mục tiêu chính.","dich":"Phần lớn số tuần có ít nhất một việc đòn bẩy hoàn thành đúng khung đã đặt, và sau mỗi tháng con chỉ ra được một bước tiến cụ thể của mục tiêu dài hạn bằng sản phẩm hoặc kết quả đo, không phải bằng cảm giác bận."},{"stt":8,"tang":"T3","nhom":"NHÓM 2 – QUẢN LÝ THỜI GIAN VÀ HIỆU SUẤT","key":"T3-TG03 – Ước lượng thực tế","th":"Con thường đánh giá sai khối lượng việc","mo":"Con nói bài này mười lăm phút là xong, rồi ngồi hơn một tiếng. Kế hoạch tối nào cũng xếp năm sáu việc, thực tế làm được hai. Con không ngạc nhiên vì chuyện này nhưng lần sau vẫn ước lượng đúng như cũ.","pt":"Cần xây năng lực ước lượng dựa trên dữ liệu 90 ngày.","chot":"Dễ chẩn thành con làm chậm rồi ép tăng tốc. Cái sai nằm ở khâu dự đoán, không ở khâu làm. Chưa có dữ liệu về tốc độ thật của chính mình thì mọi bản kế hoạch đều là kế hoạch của một người khác.","gp":"Theo dõi loại nhiệm vụ, dự kiến, thực tế, sai số; tạo hệ số cá nhân.","kpi":"Sai số ước lượng trung bình giảm ≥40%; ≥75% nhiệm vụ trong biên ±20%.","dich":"Chênh lệch giữa dự kiến và thực tế ở tháng cuối nhỏ hơn rõ so với tháng đầu, con nói được hệ số của ít nhất ba loại nhiệm vụ mình hay gặp, và bản kế hoạch tối không còn xếp nhiều việc hơn số việc thường làm xong."},{"stt":9,"tang":"T3","nhom":"NHÓM 2 – QUẢN LÝ THỜI GIAN VÀ HIỆU SUẤT","key":"T3-TG04 – Chu kỳ ôn bền vững","th":"Con thường xuyên học dồn trước thi","mo":"Trước kỳ kiểm tra hai ngày, con thức khuya học liền mạch nhiều giờ, làm bài xong thì bỏ hẳn môn đó vài tuần. Hỏi lại nội dung đã thi cách đó một tháng, con nhớ được rất ít, dù lúc thi điểm không thấp.","pt":"Cần chuyển ôn cách quãng thành cấu trúc dài hạn.","chot":"Dễ chẩn thành con không chịu học hằng ngày. Thật ra cách học dồn vẫn cho điểm nên nó tự nuôi chính nó. Chỗ phải đo là mức nhớ sau vài tuần, chứ đo bằng điểm bài thi thì kết luận sẽ ngược.","gp":"Mỗi môn có lịch ôn lặp; cuối tuần tự kiểm; điều chỉnh theo mức nhớ.","kpi":"≥80% nội dung được ôn trước kỳ kiểm tra; số phiên học sát đêm thi giảm ≥50%; mức nhớ sau 7 ngày tăng.","dich":"Phần lớn nội dung trọng tâm có đủ ba lần ôn đúng hẹn, số buổi học sát ngày thi giảm rõ, và số ý con nhớ được trước khi mở vở ở mốc ba tuần tăng lên so với đầu chu kỳ."},{"stt":10,"tang":"T3","nhom":"NHÓM 2 – QUẢN LÝ THỜI GIAN VÀ HIỆU SUẤT","key":"T3-TG05 – Quản trị năng lượng","th":"Con chưa biết cân bằng học – nghỉ – vận động","mo":"Con học liền mạch từ tối đến khuya, không rời bàn, không vận động. Sáng dậy muộn, buổi chiều ngủ gật trong giờ, tối lại học bù. Cuối tuần con ngủ rất nhiều rồi tuần sau lặp lại đúng vòng ấy. Con nói buổi tối là lúc duy nhất học được.","pt":"Thiếu kỹ năng quản lý năng lượng và nhịp sinh hoạt.","chot":"Dễ chẩn thành con chưa chăm đủ nên cần thêm giờ. Thực ra giờ học đang bị đổi bằng giờ ngủ, và chất lượng từng giờ đang giảm dần mà không ai đo. Nếu con mệt kéo dài, mất ngủ, hoặc thay đổi rõ về ăn uống và tâm trạng thì đây là ranh giới cần bác sĩ hoặc chuyên gia, đừng xử bằng lịch sinh hoạt.","gp":"Thiết kế chu kỳ học – nghỉ – vận động – ngủ; theo dõi năng lượng từng khung giờ.","kpi":"≥5 ngày/tuần có nhịp sinh hoạt đạt chuẩn cá nhân; chất lượng học không giảm; mức mệt cuối ngày giảm.","dich":"Giờ đi ngủ ổn định lại trong một khoảng hẹp ở phần lớn số ngày, có mốc vận động lặp đều trong tuần, và con chỉ đúng được khung giờ tỉnh táo nhất của mình bằng dữ liệu trong bảng chứ không bằng phỏng đoán."},{"stt":11,"tang":"T3","nhom":"NHÓM 3 – TẬP TRUNG VÀ LÀM VIỆC SÂU","key":"T3-TT01 – Sức bền tập trung","th":"Con tập trung được ngắn nhưng chưa đủ cho nhiệm vụ khó","mo":"Với bài quen, con ngồi liền hai mươi tới ba mươi phút không rời chỗ. Gặp bài dài hoặc dạng chưa từng làm, con đứng dậy trong khoảng mười phút đầu, đi uống nước, quay lại, rồi chuyển sang môn dễ hơn. Bài khó ấy sang hôm sau vẫn còn nguyên trên bàn.","pt":"Cần nâng sức bền tập trung có kiểm soát.","chot":"Dễ chẩn thành con mất tập trung nói chung, rồi cấm điện thoại thêm. Nhìn kỹ thì sức bền của con vẫn đủ cho bài quen; chỗ đứt xảy ra đúng lúc bài trở nên khó. Đây là chuyện nâng dần độ khó, không phải chuyện dẹp nhiễu.","gp":"Tăng phiên theo từng giai đoạn; xen nghỉ hợp lý; theo dõi chất lượng đầu ra.","kpi":"30 ngày cuối đạt thời lượng mục tiêu ≥80% phiên; số gián đoạn giảm ≥40%.","dich":"Ở chặng cuối con giữ trọn phiên khó ở thời lượng đã nâng trong phần lớn số buổi, số lần rời chỗ giữa phiên giảm rõ so với chặng đầu, và bài khó không còn tồn sang hôm sau như thói quen cũ."},{"stt":12,"tang":"T3","nhom":"NHÓM 3 – TẬP TRUNG VÀ LÀM VIỆC SÂU","key":"T3-TT02 – Tự quản số","th":"Con bị thiết bị số chi phối ngoài giờ học","mo":"Trong giờ học con giữ được máy ở ngoài. Nhưng sau bữa tối và trước khi ngủ, con cầm điện thoại liên tục, không mở với mục đích rõ, lướt tới khi bị gọi mới dừng. Sáng hôm sau con dậy muộn và nói tối qua chỉ định xem một chút.","pt":"Cần xây năng lực tự quản thiết bị ở mức đời sống.","chot":"Dễ chẩn thành con nghiện máy rồi thu máy. Thu xong thì trong giờ học vốn đã ổn không thay đổi gì, còn phần ngoài giờ chỉ chuyển sang giấu. Chỗ cần dựng là con tự phân loại được lần dùng nào có mục đích, lần nào không.","gp":"Phân loại dùng học – giao tiếp – giải trí; đặt khung; có ngày giảm số; tự review.","kpi":"Thời gian dùng không chủ đích giảm ≥30%; ≥80% ngày tuân thủ khung; không ảnh hưởng KPI học.","dich":"Cột thời gian dùng không có mục đích giảm rõ so với hai tuần đầu, phần lớn số ngày giữ đúng khung máy nghỉ, và kết quả học không tụt trong khi giờ dùng máy giảm."},{"stt":13,"tang":"T3","nhom":"NHÓM 3 – TẬP TRUNG VÀ LÀM VIỆC SÂU","key":"T3-TT03 – Một việc đến điểm dừng","th":"Con dễ chuyển việc và bỏ dở","mo":"Con mở vở Toán, làm hai bài, nhớ ra chưa soạn Văn, chuyển sang Văn, viết nửa trang thì đi tìm tài liệu môn khác. Cuối buổi trên bàn có bốn thứ đang dở và không có thứ nào xong. Hỏi tối nay con làm được gì, con kể ra bốn môn.","pt":"Thiếu năng lực đóng phiên và giữ một mục tiêu.","chot":"Dễ khen là con biết nhiều việc rồi bỏ qua. Cái đang thiếu là thao tác đóng một việc trước khi mở việc kế. Ý nghĩ chuyển việc sẽ luôn xuất hiện, nên phải có chỗ để nó không kéo tay con ra khỏi việc đang làm.","gp":"Mỗi phiên có một đầu ra; ghi ý định chuyển việc nhưng xử lý sau.","kpi":"≥80% phiên giữ một nhiệm vụ; số việc bỏ dở giảm ≥50%.","dich":"Phần lớn phiên học kết thúc với đúng một đầu ra hoàn thành, số dòng trên giấy để dành giảm dần theo tháng, và trên bàn cuối buổi không còn nhiều việc mở dở cùng lúc như trước."},{"stt":14,"tang":"T3","nhom":"NHÓM 3 – TẬP TRUNG VÀ LÀM VIỆC SÂU","key":"T3-TT04 – Tập trung thích nghi","th":"Tập trung phụ thuộc mạnh vào môi trường","mo":"Ở bàn quen trong phòng riêng, con làm việc trơn tru. Ngồi ở thư viện, ở nhà người thân hay ở bàn ăn, con than ồn, đổi chỗ vài lần rồi cất sách. Những buổi học ngoài nhà gần như không có đầu ra nào.","pt":"Cần mở rộng phạm vi thích nghi.","chot":"Dễ chẩn thành con cần một chỗ học lý tưởng rồi cả nhà dồn sức giữ chỗ ấy. Càng giữ thì vùng học được của con càng hẹp. Chỗ cần luyện là bộ cách xoay xở khi môi trường không như ý.","gp":"Luyện tại 2–3 bối cảnh có mức nhiễu khác nhau; dùng chiến lược cá nhân.","kpi":"≥70% phiên ở môi trường không lý tưởng vẫn đạt chuẩn đầu ra.","dich":"Phần lớn phiên học ngoài chỗ quen vẫn ra được đầu ra đã đặt, và con kể tên được ít nhất hai cách xoay xở của riêng mình cùng bối cảnh mà mỗi cách đó dùng được, dựa trên bảng đã ghi."},{"stt":15,"tang":"T3","nhom":"NHÓM 3 – TẬP TRUNG VÀ LÀM VIỆC SÂU","key":"T3-TT05 – Tái nhập nhiệm vụ","th":"Bị gián đoạn là rất khó quay lại việc","mo":"Đang làm bài, có người gọi hoặc có tin nhắn, con dừng. Sau đó con mất phần lớn buổi tối để quay lại: mở lại vở, đọc lại từ đầu, rồi bỏ luôn bài đó. Có hôm chỉ một lần bị gọi ra ăn cơm là cả phiên học sau bữa không diễn ra.","pt":"Khả năng phục hồi chú ý chưa thành kỹ năng.","chot":"Dễ chẩn thành nhà nhiều tiếng ồn nên phải dẹp gián đoạn. Gián đoạn thì không dẹp hết được. Chỗ hỏng nằm ở lúc quay lại: con không biết mình đang dừng ở đâu nên phải khởi động lại từ đầu.","gp":"Trước khi dừng ghi điểm dừng; sau gián đoạn dùng nghi thức 2–3 phút.","kpi":"≥80% gián đoạn quay lại ≤10 phút; việc bỏ dở giảm ≥40%.","dich":"Phần lớn lần gián đoạn con ngồi lại và làm tiếp trong khoảng mười phút, số phút quay lại trung bình ở tháng cuối thấp hơn tháng đầu, và số bài bỏ dở vì bị ngắt giữa chừng giảm rõ."}],"T4":[{"stt":1,"tang":"T4","nhom":"NHÓM 1. TỰ QUẢN – TỰ CHỦ – KỶ LUẬT DÀI HẠN","key":"T4-TQ01 – Tự vận hành bền vững","th":"Con đã tự giác hơn nhưng chưa duy trì ổn định cả năm","mo":"Trong các tháng học bình thường, con tự vào bàn, tự chạy lịch, bố mẹ gần như không phải hỏi. Nhưng sau mỗi kỳ thi, mỗi đợt nghỉ dài hoặc mỗi lần đổi thời khóa biểu, con bỏ nếp vài tuần và bố mẹ lại phải nhắc từng ngày để dựng lại.","pt":"Năng lực đã có nhưng chưa đủ sức chịu biến động dài hạn.","chot":"Dễ chẩn thành con vẫn cần nhắc, rồi giữ nguyên mức nhắc quanh năm. Số liệu của các tháng bình thường đã cho thấy năng lực có. Chỗ chưa có là khả năng dựng lại hệ thống sau các điểm gãy đã biết trước trong năm.","gp":"C1: ổn định giờ, kế hoạch, nếp học. C2: tự theo dõi và tự kiểm. C3: luyện điều chỉnh khi lịch biến động. C4: vận hành với hỗ trợ tối thiểu.","kpi":"≥80% tuần duy trì hệ thống; ≥85% nhiệm vụ trọng tâm hoàn thành; PH nhắc trực tiếp giảm ≥70%; sau trượt quay lại ≤48h.","dich":"Sau mỗi mốc gãy đã khoanh, con quay lại hệ thống trong vòng một hai ngày theo đúng trang kế hoạch đã viết trước, số lần bố mẹ nhắc trực tiếp cả năm giảm rõ so với chu kỳ đầu, và các nhiệm vụ trọng tâm vẫn hoàn thành ở mức cũ."},{"stt":2,"tang":"T4","nhom":"NHÓM 1. TỰ QUẢN – TỰ CHỦ – KỶ LUẬT DÀI HẠN","key":"T4-TQ02 – Quản trị chu kỳ","th":"Con quản từng ngày được nhưng chưa quản được cả tháng/học kỳ","mo":"Việc của hôm nay và của tuần này con làm gọn. Nhưng bài dự án nộp cuối tháng, kỳ kiểm tra giữa kỳ hay hồ sơ đăng ký hạn cuối học kỳ thì con nhớ ra vào phút chót. Trong nhà không có chỗ nào ghi các mốc lớn của cả học kỳ.","pt":"Tự quản cần nâng từ cấp ngày → tuần → tháng → học kỳ.","chot":"Dễ chẩn thành con hay quên rồi bố mẹ tự nhận việc nhắc mốc. Nhắc hộ giữ nguyên chỗ hỏng. Điều con chưa có là tầm nhìn dài hơn một tuần, và tầm nhìn đó chỉ dựng được bằng thao tác lập kế hoạch tháng lặp đủ nhiều lần.","gp":"C1 quản ngày; C2 quản tuần; C3 quản tháng; C4 tự quản học kỳ và các mốc lớn.","kpi":"12/12 tháng có kế hoạch; ≥80% mốc lớn được chuẩn bị trước; ≥75% mục tiêu tháng hoàn thành.","dich":"Đủ mười hai bản kế hoạch tháng do con viết và có dấu soát giữa tháng, phần lớn mốc lớn được bắt tay chuẩn bị trước hạn chứ không vào phút chót, và số lần bố mẹ phải nhắc mốc giảm rõ theo các chu kỳ."},{"stt":3,"tang":"T4","nhom":"NHÓM 1. TỰ QUẢN – TỰ CHỦ – KỶ LUẬT DÀI HẠN","key":"T4-TQ03 – Chuyển quyền điều khiển","th":"Con thực hiện tốt nhưng vẫn cần hệ thống nhắc nhiều","mo":"Việc gì được nhắc thì con làm đúng và làm tốt. Nhưng lời nhắc đang đến từ nhiều nguồn cùng lúc: ứng dụng, bố mẹ, bạn cùng lớp. Những ngày không có nguồn nào nhắc, con thường nhớ ra vào cuối buổi tối hoặc bỏ luôn.","pt":"Đây là tín hiệu khả năng tự khởi tạo chưa hoàn toàn chuyển giao.","chot":"Dễ nhìn tỷ lệ hoàn thành cao mà kết luận con đã tự quản. Tỷ lệ ấy là của hệ nhắc. Chỗ phải kiểm là con có tự tạo được tín hiệu cho chính mình không, và bài kiểm ấy chỉ chạy khi tín hiệu ngoài giảm thật.","gp":"C1 dùng hỗ trợ cao; C2 HV tự tạo nhắc; C3 giảm thông báo; C4 có các giai đoạn tự vận hành hoàn toàn.","kpi":"Thông báo ngoài giảm ≥60%; 90 ngày cuối ≥85% hành vi giữ được dù giảm nhắc.","dich":"Số tín hiệu nhắc từ bên ngoài giảm mạnh qua bốn chu kỳ trong khi tỷ lệ hoàn thành nhiệm vụ giữ nguyên, và ở các tuần chạy không nhắc của chu kỳ cuối con vẫn hoàn thành phần lớn việc đã định."},{"stt":4,"tang":"T4","nhom":"NHÓM 1. TỰ QUẢN – TỰ CHỦ – KỶ LUẬT DÀI HẠN","key":"T4-TQ04 – Ra quyết định cá nhân","th":"Con chưa biết tự đưa ra quyết định khi có nhiều lựa chọn","mo":"Khi phải chọn giữa hai lớp học thêm, hai môn tự chọn hay hai cách phân bổ buổi tối, con hỏi bố mẹ chọn giúp rồi làm theo. Con không nêu tiêu chí nào của riêng mình. Sau khi việc đã chọn hóa ra không hợp, con nói tại bố mẹ bảo thế.","pt":"Đây là tầng cao hơn của tự quản: ra quyết định và chịu hệ quả.","chot":"Dễ chẩn thành con còn nhỏ chưa quyết được rồi tiếp tục quyết thay. Quyết thay thì con không bao giờ luyện được thao tác cân nhắc, và cũng không có cách nào chịu hệ quả để mà học. Phải giao quyền quyết theo bậc và giao kèm phần chịu hệ quả.","gp":"C1 học tiêu chí lựa chọn; C2 ra quyết định nhỏ; C3 quyết định liên quan thời gian/ưu tiên; C4 tham gia quyết định mục tiêu học kỳ.","kpi":"≥80% quyết định cá nhân có lý do; giảm số việc PH quyết định thay; có review hậu quả sau các quyết định lớn.","dich":"Phần lớn quyết định trong sổ có ghi tiêu chí đã dùng, các quyết định lớn đều có dòng hệ quả viết sau, và số việc bố mẹ quyết thay giảm rõ qua bốn chu kỳ mà kết quả học không tụt."},{"stt":5,"tang":"T4","nhom":"NHÓM 1. TỰ QUẢN – TỰ CHỦ – KỶ LUẬT DÀI HẠN","key":"T4-TQ05 – Nền tối thiểu","th":"Con làm tốt khi mọi thứ thuận lợi nhưng dễ mất hệ thống khi áp lực tăng","mo":"Trong quãng học bình thường, con giữ đủ nếp học, ngủ và ghi sổ. Vào tuần có ba bài kiểm tra dồn hoặc có việc gia đình, con bỏ tất cả cùng lúc và làm mỗi việc gấp nhất. Sau đợt đó, nếp cũ phải mất một thời gian mới dựng lại được.","pt":"Cần huấn luyện năng lực “giữ nền tối thiểu”.","chot":"Dễ chẩn thành con chưa chịu được áp lực rồi tăng tải để rèn. Chỗ hỏng thật là con chưa tách được hành vi nào bỏ được, hành vi nào bỏ là sập cả hệ. Không có danh sách nền thì lúc gấp con sẽ bỏ theo thứ tự ngẫu nhiên.","gp":"C1 xác định 3 hành vi nền; C2 luyện duy trì khi bận; C3 mô phỏng cao điểm; C4 tự điều chỉnh tải.","kpi":"≥85% tuần giữ được ≥2/3 hành vi nền; không có chuỗi mất hệ thống \\>5 ngày.","dich":"Ở phần lớn số tuần, kể cả tuần tải nặng, con giữ được ít nhất hai trong ba hành vi nền, không xuất hiện chuỗi mất hệ thống kéo dài nhiều ngày liền, và con gọi tên được hành vi hay rơi trước của mình."},{"stt":6,"tang":"T4","nhom":"NHÓM 2. QUẢN LÝ THỜI GIAN – HIỆU SUẤT – NĂNG LƯỢNG","key":"T4-HS01 – Hiệu suất thực","th":"Con bận cả năm nhưng kết quả chưa tương xứng","mo":"Lịch của con kín từ sáng tới tối: học chính, học thêm, câu lạc bộ, việc lớp. Con hiếm khi rảnh. Nhưng nhìn cả học kỳ thì các chỉ số quan trọng của con gần như không đổi, và những việc đẩy được kết quả lên thì luôn bị đẩy xuống cuối danh sách.","pt":"Cần phân biệt hoạt động với hiệu quả.","chot":"Dễ khen là con bận rộn có ích rồi để nguyên. Bận là một trạng thái, không phải một kết quả. Chỗ phải làm là tách danh sách việc ra theo mức đóng góp, và việc đó không làm được nếu chưa đo thời gian thật đang chảy đi đâu.","gp":"C1 đo thời gian; C2 xác định việc đòn bẩy; C3 bảo vệ thời gian sâu; C4 tối ưu tỷ lệ đầu tư/kết quả.","kpi":"≥75% việc đòn bẩy hoàn thành; thời gian hoạt động giá trị thấp giảm ≥25%; kết quả đích cải thiện.","dich":"Tỷ lệ thời gian cho nhóm việc giá trị thấp giảm rõ so với hai tuần đo đầu năm, phần lớn việc đòn bẩy hoàn thành trong khung đã đặt, và các chỉ số đích của năm cải thiện dù tổng giờ bận không tăng."},{"stt":7,"tang":"T4","nhom":"NHÓM 2. QUẢN LÝ THỜI GIAN – HIỆU SUẤT – NĂNG LƯỢNG","key":"T4-HS02 – Phân bổ tải","th":"Con chưa biết phân bổ sức cho cả học kỳ","mo":"Đầu học kỳ con học nhẹ, giữa kỳ vẫn nhẹ, tới ba tuần cuối thì học liên tục cả ngày để kịp bài, dự án và ôn thi cùng lúc. Kết thúc học kỳ con mệt rã, và học kỳ sau lặp lại đúng hình dạng ấy.","pt":"Thiếu khả năng phân bố tải dài hạn.","chot":"Dễ chẩn thành con chểnh mảng ở đầu kỳ. Thật ra đầu kỳ chưa có gì gấp nên không có tín hiệu nào bảo con phải làm. Chỗ cần dựng là bản đồ tải của cả học kỳ, để phần việc được kéo về trước khi nó trở nên gấp.","gp":"C1 đo tải; C2 lập bản đồ tháng; C3 dự báo cao điểm; C4 tự điều phối nguồn lực.","kpi":"≥80% kỳ kiểm tra/dự án được chuẩn bị trước; thời gian học dồn giảm ≥50%.","dich":"Đường giờ học trải đều hơn qua các tuần trong kỳ thay vì dồn vào cuối, phần lớn kỳ kiểm tra và dự án có việc chuẩn bị bắt đầu từ trước các tuần cao điểm, và số buổi học dồn sát hạn giảm rõ so với học kỳ đầu năm."},{"stt":8,"tang":"T4","nhom":"NHÓM 2. QUẢN LÝ THỜI GIAN – HIỆU SUẤT – NĂNG LƯỢNG","key":"T4-HS03 – Hiệu suất bền","th":"Con thường học quá sức rồi kiệt năng lượng","mo":"Có những đợt con học rất nhiều giờ liền trong nhiều ngày, bỏ ngủ và bỏ bữa. Hết đợt, con nằm nhiều ngày gần như không học được gì, kể cả những việc nhẹ. Năm học của con là chuỗi các đợt dốc sức xen kẽ các quãng trắng.","pt":"Hệ thống hiện phụ thuộc “nước rút”.","chot":"Dễ khen các đợt dốc sức là chăm rồi bỏ qua các quãng trắng. Hai thứ đó là một cơ chế: mỗi lần dốc sức tạo ra một quãng trắng sau đó. Nếu con có dấu hiệu kiệt sức, mất ngủ kéo dài, hay mất hết hứng thú thì đây là ranh giới cần bác sĩ hoặc chuyên gia, không phải chỗ để chỉnh lịch.","gp":"C1 theo dõi năng lượng; C2 tối ưu giờ học; C3 cân bằng giai đoạn thi; C4 tự thiết kế nhịp cá nhân.","kpi":"Mức năng lượng tuần ổn định; ≥80% tuần không vượt tải; giấc ngủ/nghỉ không bị hy sinh thường xuyên.","dich":"Số giờ ngủ ổn định trong một khoảng hẹp ở phần lớn số ngày kể cả mùa thi, phần lớn tuần không vượt trần giờ đã đặt, và các quãng trắng sau đợt dốc sức ngắn lại rõ so với chu kỳ đầu."},{"stt":9,"tang":"T4","nhom":"NHÓM 2. QUẢN LÝ THỜI GIAN – HIỆU SUẤT – NĂNG LƯỢNG","key":"T4-HS04 – Quản danh mục hoạt động","th":"Con có quá nhiều hoạt động ngoài học tập","mo":"Con tham gia nhiều nhóm và câu lạc bộ cùng lúc, mỗi nơi nhận một vai. Nhiều buổi chiều tối con chạy giữa các hoạt động. Đến cuối năm, con không có sản phẩm hoàn chỉnh nào từ bất kỳ hoạt động nào, và các buổi tự học bị cắt xén liên tục.","pt":"Vấn đề không chỉ quản giờ mà là quản danh mục hoạt động.","chot":"Dễ chẩn thành con phải bỏ hết hoạt động để tập trung học. Cắt sạch cũng sai như giữ hết. Đây là chuyện chọn danh mục: giữ ít hoạt động và đi sâu, chứ không phải chuyện quản giờ trong ngày.","gp":"C1 liệt kê và đánh giá; C2 giảm hoạt động giá trị thấp; C3 đầu tư sâu 1–2 hoạt động; C4 review lợi ích phát triển.","kpi":"Giảm quá tải; ≥70% thời gian ngoài học dành cho hoạt động có mục tiêu; có ≥1 hoạt động tạo sản phẩm/minh chứng.","dich":"Số hoạt động ngoài giờ học giảm còn ít và phần lớn thời gian ngoài giờ học dồn vào các hoạt động đã chọn, có ít nhất một sản phẩm hoàn chỉnh ra đời từ các hoạt động ấy, và các buổi tự học không còn bị cắt xén thường xuyên."},{"stt":10,"tang":"T4","nhom":"NHÓM 2. QUẢN LÝ THỜI GIAN – HIỆU SUẤT – NĂNG LƯỢNG","key":"T4-HS05 – Quản trị kỳ vọng","th":"Con thường xuyên đặt mục tiêu vượt sức","mo":"Đầu mỗi chu kỳ con đặt mục tiêu rất cao, ví dụ tăng nhiều bậc điểm trong một tháng hoặc đọc số sách vượt xa nhịp hiện tại. Được vài tuần thì mục tiêu bị bỏ, không nhắc lại. Chu kỳ sau con lại đặt một mục tiêu cao tương đương.","pt":"Tư duy mục tiêu chưa tính khả năng và nguồn lực.","chot":"Dễ khen là con có tham vọng rồi để nguyên. Vòng đặt cao rồi bỏ lặp nhiều lần dạy con rằng mục tiêu không phải thứ để thực hiện. Chỗ thiếu là số đo nền: chưa biết nhịp hiện tại thì không đặt được mức khả thi.","gp":"C1 thiết lập đường cơ sở; C2 đặt mục tiêu theo dữ liệu; C3 điều chỉnh sau checkpoint; C4 tự xác lập chuẩn mới.","kpi":"≥75% mục tiêu chu kỳ đạt hoặc có tiến bộ rõ; giảm mục tiêu bị bỏ do không thực tế.","dich":"Cả bốn mục tiêu chu kỳ đều có phép tính từ nhịp nền viết kèm, phần lớn đạt hoặc có tiến bộ đo được, và số mục tiêu bị bỏ giữa chừng vì đặt quá xa giảm rõ so với chu kỳ đầu năm."},{"stt":11,"tang":"T4","nhom":"NHÓM 3. LÀM CHỦ PHƯƠNG PHÁP HỌC VÀ NĂNG LỰC TỰ HỌC","key":"T4-NL01 – Hệ học cá nhân","th":"Con biết nhiều phương pháp nhưng chưa có “hệ học” của riêng mình","mo":"Con dùng thành thạo vài kỹ thuật học và dùng chúng đều đặn. Nhưng với mọi môn con vẫn dùng cùng một cách, và khi cách ấy không ăn với một môn thì con tăng thời gian chứ không đổi cách. Con chưa từng viết ra cách học của mình cho ai đọc.","pt":"Tầng 4 cần chuyển từ sử dụng kỹ thuật sang làm chủ chiến lược học.","chot":"Dễ tưởng đã ổn vì con có kỹ thuật và có kỷ luật. Nhưng dùng thành thạo một bộ kỹ thuật khác với biết chọn kỹ thuật theo loại nhiệm vụ. Ở tầng này, đích không phải thêm kỹ thuật mà là con tự sửa được bộ của mình.","gp":"C1 xác định bộ phương pháp; C2 thử đa môn; C3 tự lựa chọn; C4 tự tối ưu.","kpi":"≥80% phiên học có phương pháp phù hợp; HV giải thích được vì sao dùng; điểm tự kiểm tăng.","dich":"Cẩm nang tồn tại thành văn bản và đã qua ít nhất ba lần sửa dựa trên dữ liệu, phần lớn phiên học có ghi phương pháp và lý do chọn, và con giải thích được vì sao một phương pháp không dùng cho một môn cụ thể."},{"stt":12,"tang":"T4","nhom":"NHÓM 3. LÀM CHỦ PHƯƠNG PHÁP HỌC VÀ NĂNG LỰC TỰ HỌC","key":"T4-NL02 – Làm chủ kiến thức","th":"Con vẫn học theo kiểu hoàn thành bài hơn là làm chủ kiến thức","mo":"Bài tập giao về con làm hết và nộp đúng hạn. Nhưng khi gặp câu hỏi diễn đạt khác đi hoặc bài vận dụng vào tình huống mới, con lúng túng. Sau khi nộp bài, con không quay lại nội dung đó nữa và vài tuần sau nhớ rất ít.","pt":"Cần chuyển mục tiêu từ “xong bài” sang “đạt chuẩn hiểu”.","chot":"Dễ nhìn tỷ lệ nộp bài đầy đủ mà kết luận con học tốt. Mục tiêu con đang đuổi là xong bài, và con đang đạt mục tiêu ấy. Đổi kết quả thì phải đổi chuẩn xong: xong là dùng được, không phải là đã nộp.","gp":"C1 tự truy hồi; C2 hệ thống hóa; C3 vận dụng; C4 tổng hợp liên môn/chủ đề.","kpi":"≥80% nội dung trọng tâm có tự kiểm; mức nhớ dài hạn tăng; bài vận dụng cải thiện.","dich":"Phần lớn nội dung trọng tâm đủ ba dấu trong bảng, số ý con nhớ lại được sau vài tuần tăng so với chu kỳ đầu, và điểm ở các bài vận dụng cải thiện trong khi tỷ lệ nộp bài giữ nguyên."},{"stt":13,"tang":"T4","nhom":"NHÓM 3. LÀM CHỦ PHƯƠNG PHÁP HỌC VÀ NĂNG LỰC TỰ HỌC","key":"T4-NL03 – Thiết kế chiến lược học","th":"Con chưa tự thiết kế được chiến lược học cho môn mới","mo":"Với các môn quen, con biết mình phải làm gì. Gặp môn mới hoặc dạng nhiệm vụ chưa từng làm, ví dụ một môn thực hành hay một bài nghiên cứu nhỏ, con chờ giáo viên hướng dẫn từng bước và không bắt đầu nếu chưa có mẫu.","pt":"Tự học trưởng thành phải có khả năng tự thiết kế cách học.","chot":"Dễ chẩn thành con thiếu nền môn mới rồi cho học thêm môn đó. Cái con thiếu không phải nội dung mà là thao tác đọc yêu cầu của một môn rồi tự dựng cách học. Thao tác đó chỉ hình thành khi con phải làm lại nó nhiều lần trên các loại nhiệm vụ khác nhau.","gp":"C1 phân tích yêu cầu môn; C2 chọn chiến lược; C3 thử–đo–sửa; C4 tự thiết kế hoàn chỉnh.","kpi":"≥4 chiến lược hoàn chỉnh; ≥75% tạo kết quả tốt hơn đường cơ sở.","dich":"Có đủ bốn bản chiến lược hoàn chỉnh và mỗi bản đều có ít nhất một lần sửa giữa chu kỳ bằng số đo, phần lớn cho kết quả tốt hơn đường cơ sở của môn đó, và con nêu được các bước chung mình dùng khi gặp môn mới."},{"stt":14,"tang":"T4","nhom":"NHÓM 3. LÀM CHỦ PHƯƠNG PHÁP HỌC VÀ NĂNG LỰC TỰ HỌC","key":"T4-NL04 – Tự nghiên cứu","th":"Con thiếu khả năng tự nghiên cứu ngoài sách giáo khoa","mo":"Con làm rất tốt phần được giao và dừng đúng ở đó. Khi tò mò về một điều gì, con hỏi rồi nhận câu trả lời, không tự đi tìm. Con chưa từng tự đọc một nguồn ngoài sách giáo khoa cho tới hết, và không phân biệt được nguồn đáng tin với nguồn không.","pt":"Đây là giới hạn khi hướng tới học sinh phát triển cao.","chot":"Dễ khen con ngoan và bám sát chương trình. Với đích của tầng này, dừng ở phần được giao chính là trần. Cái thiếu là chuỗi thao tác đặt câu hỏi, tìm nguồn, tổng hợp và ra sản phẩm, chứ không phải thiếu chăm chỉ.","gp":"C1 kỹ năng đặt câu hỏi; C2 tìm nguồn; C3 tổng hợp; C4 sản phẩm nghiên cứu nhỏ.","kpi":"≥4 sản phẩm nghiên cứu nhỏ; sử dụng nguồn có chọn lọc; có phản tư về độ tin cậy.","dich":"Có đủ bốn sản phẩm nghiên cứu nhỏ với danh sách nguồn đi kèm, mỗi sản phẩm có đoạn tự đánh giá độ tin cậy của nguồn, và sổ câu hỏi được con ghi đều qua các chu kỳ chứ không chỉ ở chu kỳ đầu."},{"stt":15,"tang":"T4","nhom":"NHÓM 3. LÀM CHỦ PHƯƠNG PHÁP HỌC VÀ NĂNG LỰC TỰ HỌC","key":"T4-NL05 – Tự hiểu cách mình học","th":"Con học tốt nhưng chưa biết “học cách học”","mo":"Kết quả học của con tốt. Nhưng khi được hỏi vì sao hôm nay học vào, hôm khác thì không, con không trả lời được ngoài câu do hôm nay có hứng. Con không biết mình học tốt nhất vào lúc nào, ở đâu, sau việc gì.","pt":"Thiếu năng lực siêu nhận thức.","chot":"Dễ bỏ qua ca này vì điểm đang đẹp. Nhưng kết quả đang dựa vào điều kiện thuận lợi con chưa nhận ra, nên khi điều kiện đổi con không biết chỉnh gì. Đích ở đây là con đọc được cơ chế học của chính mình, không phải nâng điểm.","gp":"C1 đo; C2 so sánh; C3 điều chỉnh; C4 viết “cẩm nang học của tôi”.","kpi":"Có dữ liệu đủ 4 chu kỳ; HV nêu được ≥5 điều kiện giúp mình học tốt và ≥5 rào cản.","dich":"Bảng năm cột có dữ liệu đủ bốn chu kỳ, con nêu được ít nhất năm điều kiện giúp mình học tốt và năm rào cản kèm bằng chứng từ bảng, và con chỉnh được ít nhất một điều kiện rồi đo thấy khác biệt."}],"T5":[{"stt":1,"tang":"T5","nhom":"NHÓM 1 – TẦM NHÌN – MỤC TIÊU – BẢN SẮC GIA ĐÌNH","key":"C1 xây tầm nhìn; C2 chuyển thành hành vi; C3 dự án chung; C4 nghiệm thu dấu ấn năm.","th":"Gia đình sống cùng nhau nhưng chưa có hướng phát triển chung","mo":"Hỏi từng người trong nhà năm nay nhà mình đang đi về đâu thì ra mấy câu trả lời khác nhau, có người nói không biết. Lịch của bố, lịch của mẹ, lịch học của con nằm ở ba nơi, không ai nhìn thấy lịch của người kia. Bữa cơm nói chuyện trong ngày, không có chỗ nào cả nhà cùng nói tới một việc kéo dài hơn một tuần.","pt":"Không cần ép mọi người cùng mục tiêu; cần một tầm nhìn đủ rộng để các mục tiêu riêng cùng tồn tại.","chot":"Dễ chẩn thành nhà thiếu gắn kết rồi kê thêm hoạt động chung. Nhưng nhà này không thiếu thời gian bên nhau, thiếu một câu chung để các mục tiêu riêng đứng chung vào. Kê thêm hoạt động mà không có câu chung thì mỗi hoạt động lại thành một việc phải xếp lịch.","gp":"365 ngày cùng một hướng","kpi":"Gia đình có “la bàn chung”.","dich":"Có một câu tầm nhìn viết ra giấy, hỏi riêng từng người thì mọi người đọc lại cùng một nội dung. Mỗi thành viên chỉ được vị trí mục tiêu riêng của mình trong câu đó. Trong chu kỳ, câu đó được đem ra dùng ít nhất hai lần để quyết một việc thật."},{"stt":2,"tang":"T5","nhom":"NHÓM 1 – TẦM NHÌN – MỤC TIÊU – BẢN SẮC GIA ĐÌNH","key":"C1 nghe tiếng nói từng người; C2 tìm vùng chung; C3 giao quyền; C4 mỗi người tự trình bày dấu ấn của mình.","th":"PH có tầm nhìn nhưng con không cảm thấy đó là của mình","mo":"Trên tường có bảng tầm nhìn do bố mẹ viết, chữ đẹp, treo từ đầu năm. Hỏi con đọc lại thì con đọc đúng chữ nhưng không thêm được câu nào. Khi bàn việc của năm, con ngồi cùng bàn, trả lời khi được hỏi, không đề xuất. Có việc con làm đủ nhưng gọi là việc mẹ giao, không gọi là việc của nhà.","pt":"Tầm nhìn chỉ có sức mạnh khi mọi thành viên được tham gia.","chot":"Dễ tưởng con chưa hiểu nên cần giải thích lại. Chỗ hỏng không nằm ở hiểu mà ở quyền viết: bảng đã đóng khung trước khi con kịp góp chữ. Giải thích thêm chỉ làm con thuộc bài hơn, không làm con thấy phần của mình nằm ở đâu trong đó.","gp":"Gia đình tôi – tiếng nói của tôi","kpi":"Mỗi người cảm thấy mình thuộc về tầm nhìn gia đình.","dich":"Con đọc lại tầm nhìn bằng chữ của con và chỉ ra được ít nhất một dòng do chính con viết, dòng đó còn nguyên trên bảng. Trong buổi ghép, con nói trước người lớn. Người lớn kể được một chỗ mình đã bỏ ý của mình để giữ ý của con."},{"stt":3,"tang":"T5","nhom":"NHÓM 1 – TẦM NHÌN – MỤC TIÊU – BẢN SẮC GIA ĐÌNH","key":"Mỗi chu kỳ chọn tối đa 2–3 ưu tiên gia đình.","th":"Gia đình có nhiều mục tiêu nhưng không biết ưu tiên","mo":"Trong sổ gia đình có hơn mười đầu việc đang mở cùng lúc: học thêm, thể thao, tiếng Anh, chuyến đi, sửa nhà, quỹ tiết kiệm. Mỗi buổi ngồi lại đều thêm việc mới, hiếm khi gạch việc cũ. Hỏi tuần này việc nào quan trọng nhất thì mỗi người kể ra một việc khác. Việc bị bỏ dở không ai tuyên bố bỏ, chỉ lặng lẽ không nhắc nữa.","pt":"Không thể tối ưu tất cả cùng lúc.","chot":"Dễ chẩn thành nhà thiếu kỷ luật thực thi rồi dựng thêm bảng theo dõi. Nhưng bảng nào cũng vỡ khi tổng việc vượt quỹ giờ có thật. Việc phải làm trước là tuyên bố hoãn thành lời và có ghi — thứ mà nhà này chưa từng làm bao giờ.","gp":"4 chu kỳ – 4 bước trưởng thành","kpi":"Gia đình tập trung và giảm quá tải.","dich":"Nhà có đúng ba ưu tiên cho chu kỳ và một danh sách hoãn ghi rõ tháng rà lại. Hỏi riêng bất kỳ ai trong nhà cũng nói đúng ba ưu tiên đó. Hết chu kỳ, không việc nào trong danh sách hoãn quay lại chạy mà cả nhà không biết."},{"stt":4,"tang":"T5","nhom":"NHÓM 1 – TẦM NHÌN – MỤC TIÊU – BẢN SẮC GIA ĐÌNH","key":"C1 xây 8 miền; C2 cân bằng; C3 trải nghiệm; C4 hồ sơ trưởng thành.","th":"Mục tiêu gia đình chỉ xoay quanh thành tích của con","mo":"Nội dung buổi ngồi lại hàng tuần gần như chỉ có điểm số, bài kiểm tra và lịch học thêm. Người lớn kể chuyện của mình bằng một câu rồi quay lại hỏi con. Trong sổ gia đình, mục sức khoẻ, quan hệ và tài chính bỏ trống nhiều tuần. Tuần con đạt điểm cao thì cả nhà vui rõ; tuần con bình thường thì buổi ngồi lại ngắn hơn hẳn.","pt":"Hạnh phúc gia đình cần đa chiều.","chot":"Dễ nhầm thành gia đình quá kỳ vọng rồi khuyên hạ chuẩn. Hạ chuẩn không sửa được gốc: gốc là cả nhà chỉ có một thước đo, nên bỏ thước đó xuống thì không còn gì để nhìn nhau. Việc cần làm là thêm thước, không phải hạ thước đang có.","gp":"365 ngày lớn lên toàn diện","kpi":"Mở rộng định nghĩa thành công.","dich":"Bảng tám miền có ít nhất sáu miền đang chạy một việc thật, mỗi miền có cách nhìn thấy. Trong bốn buổi ngồi lại gần nhất, không buổi nào chỉ nói về điểm số, và người lớn đều có báo phần miền của mình."},{"stt":5,"tang":"T5","nhom":"NHÓM 1 – TẦM NHÌN – MỤC TIÊU – BẢN SẮC GIA ĐÌNH","key":"C1 xác định; C2 xây năng lực; C3 thực thi; C4 hoàn thành và ghi dấu.","th":"Gia đình muốn tạo một “kỳ tích” nhưng chưa định nghĩa rõ","mo":"Cả nhà nói về một năm bứt phá nhưng không ai viết ra được nó là cái gì. Trong sổ chỉ có tính từ: mạnh hơn, tốt hơn, khác đi. Không có ngày hoàn thành, không có người phụ trách, không có thứ để cầm lên xem lúc kết thúc. Khi hỏi nếu làm xong thì ta sẽ nhìn thấy cái gì, mỗi người tả một hình ảnh khác nhau.","pt":"“Kỳ tích” phải là mục tiêu chung có ý nghĩa, không phải khẩu hiệu.","chot":"Dễ tưởng gia đình chưa đủ quyết tâm nên cần hô hào thêm. Ngược lại: quyết tâm đang thừa và chính nó tạo áp lực, vì không có đích thì không bao giờ tới nơi. Chỗ phải sửa là chuyển câu khẩu hiệu thành một sản phẩm cầm được, có ngày và có tên người chịu trách nhiệm.","gp":"Dự án Kỳ tích 365","kpi":"Tạo một thành tựu chung có ý nghĩa do gia đình tự lựa chọn.","dich":"Mục tiêu được viết thành một câu có sản phẩm cầm được và có ngày hoàn thành, kèm ba mốc kiểm và tên người chịu trách nhiệm từng phần. Cả nhà nói được vì sao chọn cái này chứ không phải cái khác. Đã đi qua ít nhất một mốc và có ghi lại."},{"stt":6,"tang":"T5","nhom":"NHÓM 2 – KẾT NỐI – GIAO TIẾP – HẠNH PHÚC GIA ĐÌNH","key":"C1 thiết lập 10 phút kết nối; C2 nghe sâu; C3 trao đổi khó; C4 duy trì tự nhiên.","th":"Các thành viên ở gần nhưng ít thực sự nói chuyện","mo":"Câu nói giữa các thành viên trong ngày phần lớn là hỏi việc: ăn chưa, học chưa, mấy giờ về, đóng tiền chưa. Buổi tối mỗi người ở một phòng, cửa khép. Cuối tuần cả nhà ở nhà cùng nhau nhưng không có khoảng nào ngồi cùng một chỗ quá mười lăm phút mà không có màn hình bật. Hỏi con hôm nay có gì thì con trả lời bình thường.","pt":"Kết nối cần thời gian có chất lượng.","chot":"Dễ chẩn thành nhà thiếu thời gian rồi khuyên dành thời gian cho nhau. Nhà này có thời gian ở cạnh nhau, thứ thiếu là một khung có mốc mở và mốc đóng. Không có khung thì mọi cuộc nói chuyện đều trượt về hỏi việc trong vòng ba câu.","gp":"365 cuộc trò chuyện đáng nhớ","kpi":"Tăng cảm giác được hiểu và thuộc về.","dich":"Trong tháng có ít nhất mười hai bữa cơm không thiết bị, có ghi. Sổ cho thấy không ai vắng tiếng suốt cả tháng. Con kể ra được một chuyện con đã nói trong bữa cơm mà trước đây con giữ lại cho riêng mình."},{"stt":7,"tang":"T5","nhom":"NHÓM 2 – KẾT NỐI – GIAO TIẾP – HẠNH PHÚC GIA ĐÌNH","key":"C1 giảm hỏi dồn; C2 luyện phản ánh; C3 đối thoại chủ đề khó; C4 con chủ động chia sẻ.","th":"Cha mẹ nói nhiều nhưng con ít chia sẻ","mo":"Trong một buổi nói chuyện gia đình, đếm được người lớn nói phần lớn thời gian, con trả lời bằng câu ngắn. Con bắt đầu kể thì người lớn chen vào bổ sung hoặc chỉnh chi tiết. Sau vài lần bị chen, con ngừng kể và nói thôi không có gì. Chuyện ở trường con kể cho bạn, nhà biết sau cùng và thường là qua người khác.","pt":"Muốn con nói, người lớn phải trở thành nơi đủ an toàn để nói.","chot":"Dễ chẩn thành con tuổi này khép lại, chuyện bình thường. Nhưng chỗ đóng không nằm ở tuổi mà ở phản ứng của người lớn ba giây sau khi con nói. Nếu con kể ra điều nặng — bị bắt nạt, bị đe doạ, tự làm đau mình — đây là chỗ chuyển cho người có nghề tâm lý, không phải chỗ luyện kỹ năng nghe.","gp":"90 ngày cha mẹ nghe nhiều hơn nói rồi duy trì cả năm.","kpi":"Xây nền tin cậy giao tiếp.","dich":"Đếm trong bốn buổi gần nhất, thời gian con nói chiếm từ một nửa trở lên. Sổ của người lớn có con số cụ thể số lần định cắt lời mà đã dừng, và con số đó giảm qua các tuần. Con chủ động mở chuyện ít nhất một lần mà không ai hỏi."},{"stt":8,"tang":"T5","nhom":"NHÓM 2 – KẾT NỐI – GIAO TIẾP – HẠNH PHÚC GIA ĐÌNH","key":"C1 quy tắc tranh luận; C2 luyện dừng; C3 giải quyết vấn đề thật; C4 tự điều hòa.","th":"Gia đình hay tranh luận thành xung đột","mo":"Bất đồng trong nhà thường đi qua ba nấc trong vài phút: nói to hơn, nhắc chuyện cũ, rồi có người bỏ đi hoặc dập cửa. Sau đó cả nhà im vài ngày, không ai nhắc lại, việc gây bất đồng vẫn nguyên. Có thành viên đã học cách không nêu ý kiến để tránh nấc thứ hai. Trẻ nhỏ rời phòng khi người lớn bắt đầu lớn tiếng.","pt":"Chuyển từ người–đối–người sang cả nhà–đối–diện–vấn đề.","chot":"Dễ nhầm thành nhà thiếu kỹ năng giao tiếp rồi dạy cách nói cho lịch sự. Chỗ hỏng thật là không có đường quay lại: cãi xong thì hết, không nghi thức nào nối lại. Nếu trong nhà đã có xô đẩy, đe doạ hay có người sợ về nhà, dừng phần huấn luyện và chuyển cho chuyên gia.","gp":"365 ngày không xúc phạm khi bất đồng","kpi":"Gia đình bất đồng mà không làm tổn thương nhau.","dich":"Nhà có quy ước xử lý bất đồng viết ra và đã dùng thật ít nhất hai lần, có ghi ngày. Khoảng cách từ lúc cãi tới lúc ngồi lại nằm trong vòng một ngày. Sau tranh luận, mỗi bên nói lại đúng quan điểm bên kia trước khi nói quan điểm của mình."},{"stt":9,"tang":"T5","nhom":"NHÓM 2 – KẾT NỐI – GIAO TIẾP – HẠNH PHÚC GIA ĐÌNH","key":"C1 ghi nhận hằng ngày; C2 biết ơn; C3 ghi nhận đóng góp; C4 nghi thức tri ân cuối năm.","th":"Gia đình ít thể hiện sự ghi nhận với nhau","mo":"Trong tuần, số lần một người trong nhà nói ra điều tốt vừa thấy ở người khác gần bằng không, trong khi lỗi được nhắc ngay khi vừa xảy ra. Việc làm đúng được coi là đương nhiên: cơm nấu xong không ai nói gì, bài làm đủ không ai nhắc. Người lớn cũng không nghe ai ghi nhận mình. Khi được khen, con hỏi lại mẹ cần gì ạ.","pt":"Văn hóa thiếu ghi nhận làm suy giảm động lực và kết nối.","chot":"Dễ trượt sang khen nhiều cho vui nhà. Khen chung chung hỏng nhanh hơn cả im lặng, vì trẻ phân biệt được lời khen rỗng. Chỗ phải chỉnh là ghi nhận có mô tả hành vi cụ thể và có tên người, và người lớn cũng phải nằm trong diện được ghi nhận chứ không chỉ đứng ghi nhận người khác.","gp":"365 lời ghi nhận thật","kpi":"Tạo khí hậu tích cực nhưng không tâng bốc.","dich":"Trong bảy ngày liên tiếp, bảng có đủ dòng cho mọi ô, kể cả ô của người lớn. Mỗi dòng có việc cụ thể và ngày, không có dòng nào chỉ là tính từ. Con viết được ghi nhận cho người lớn, không phải chỉ nhận về."},{"stt":10,"tang":"T5","nhom":"NHÓM 2 – KẾT NỐI – GIAO TIẾP – HẠNH PHÚC GIA ĐÌNH","key":"Mỗi chu kỳ có hoạt động gia đình, trải nghiệm mới và một chuyến/hoạt động đặc biệt.","th":"Gia đình thiếu những khoảng thời gian vui vẻ chung","mo":"Lịch cả nhà trong tháng gồm học, làm, đưa đón, việc nhà. Hoạt động chung chỉ xuất hiện vào dịp lễ hoặc khi có khách. Khi được hỏi lần gần nhất cả nhà cùng cười to là khi nào, mọi người phải nghĩ khá lâu rồi kể lại một chuyện của năm trước. Ý tưởng đi chơi thường dừng ở câu để rảnh đã, và tuần nào cũng chưa rảnh.","pt":"Hạnh phúc phải được thiết kế chứ không chỉ chờ “rảnh”.","chot":"Dễ chẩn thành nhà quá bận rồi khuyên tranh thủ. Chỗ hỏng nằm ở chỗ vui chung chưa bao giờ được xếp vào lịch như một cuộc hẹn có giờ. Việc không có giờ thì luôn thua việc có giờ, mà học tập thì lúc nào cũng có giờ.","gp":"52 tuần – 52 khoảnh khắc gia đình","kpi":"Tạo ký ức tích cực và tăng gắn kết.","dich":"Trong tháng có ít nhất bốn buổi chơi chung đã diễn ra đúng giờ đã hẹn, không gắn với dịp lễ và không gắn với việc học. Sổ ghi rõ ai chọn từng buổi, và mỗi người trong nhà đã tới lượt chọn ít nhất một lần."},{"stt":11,"tang":"T5","nhom":"NHÓM 3 – NỘI QUY – TRÁCH NHIỆM – TỰ CHỦ","key":"C1 chọn 7–10 nguyên tắc; C2 vận hành; C3 điều chỉnh; C4 thành văn hóa.","th":"Nhà có nhiều luật nhưng ít người tuân thủ","mo":"Trong nhà có hơn mười quy định, phần lớn do người lớn tuyên bố lúc đang bực, không viết ra chỗ nào. Vi phạm có khi bị phạt, có khi bỏ qua, tuỳ hôm và tuỳ tâm trạng. Hỏi con kể tên các luật của nhà thì con kể được ba, trong đó hai cái đã bỏ từ lâu. Không luật nào áp dụng cho người lớn.","pt":"Ít luật nhưng nhất quán tốt hơn nhiều luật.","chot":"Dễ nghĩ là con không tôn trọng luật rồi siết chặt thêm. Nhưng luật không được giữ vì chính người ra luật cũng không nhớ hết. Chỗ phải sửa là cắt số lượng và gắn hệ quả cố định, không phải tăng hình phạt cho những luật vốn đã không ai nhớ.","gp":"365 ngày giữ lời chung","kpi":"Tạo cấu trúc rõ mà không độc đoán.","dich":"Hiến chương còn tối đa bảy điều, có chữ của cả nhà, người lớn nằm trong ít nhất ba điều. Trong ba mươi ngày, hệ quả được thực hiện đúng như đã viết ở phần lớn các lần vi phạm. Hỏi con kể tên các điều thì con kể đủ, không sót."},{"stt":12,"tang":"T5","nhom":"NHÓM 3 – NỘI QUY – TRÁCH NHIỆM – TỰ CHỦ","key":"C1 việc cá nhân; C2 việc gia đình; C3 trách nhiệm dự án; C4 tự nhận việc.","th":"Con bị yêu cầu trách nhiệm nhưng cha mẹ thường làm thay","mo":"Việc đã giao cho con nhưng khi con làm chậm hoặc làm chưa đạt, người lớn làm nốt trong im lặng. Cặp sách được soạn lại sau khi con soạn, bát con rửa được rửa lại. Con biết điều đó và dần làm qua loa vì có người dọn phía sau. Khi được nhắc là phải tự chịu trách nhiệm, con trả lời rằng đằng nào mẹ cũng làm lại.","pt":"Muốn con tự chủ phải trả việc về cho con.","chot":"Dễ chẩn là con lười. Nhưng hành vi làm qua loa ở đây là phản ứng hợp lý với một hệ có người dọn phía sau. Chỗ khó không nằm ở con mà ở người lớn: phải chịu để việc hỏng thật một lần và chịu nhìn hậu quả — đó mới là phần đang được huấn luyện.","gp":"365 ngày việc của ai người đó làm","kpi":"Tăng năng lực tự lập.","dich":"Con giữ trọn ít nhất ba việc mà không ai kiểm và không ai làm hộ, trong đó có một việc nhà thật sự phụ thuộc. Sổ của người lớn có con số lần định làm thay mà đã dừng, và có ít nhất một lần việc hỏng thật mà người lớn không nhúng tay."},{"stt":13,"tang":"T5","nhom":"NHÓM 3 – NỘI QUY – TRÁCH NHIỆM – TỰ CHỦ","key":"Mỗi sự cố dùng 3 câu: chuyện gì – phần của tôi – sửa thế nào.","th":"Trong nhà hay đổ lỗi khi xảy ra vấn đề","mo":"Khi có sự cố trong nhà — đồ vỡ, quên việc, trễ giờ — câu đầu tiên thường là ai làm. Cuộc nói chuyện đi tiếp bằng những câu chứng minh không phải mình, và thường kết thúc mà việc vẫn chưa được sửa. Trẻ trong nhà đã học cách trả lời trước khi bị hỏi. Có thành viên chọn giấu lỗi nhỏ vì thấy nói ra tốn hơn.","pt":"Văn hóa trách nhiệm phải thay văn hóa đổ lỗi.","chot":"Dễ nhầm thành trẻ không trung thực rồi tập trung dạy nhận lỗi. Nhưng giấu lỗi ở đây là cách tránh một phiên xử. Chỗ phải đổi là câu hỏi đầu tiên của người lớn: chừng nào câu đầu vẫn là tại ai thì mọi bài giảng về trung thực đều vô hiệu.","gp":"365 ngày không dừng ở câu “tại ai”","kpi":"Gia đình trở thành hệ học hỏi.","dich":"Với mỗi sự cố trong tháng, sổ có ghi việc và cách sửa, không ghi tên người gây ra. Câu đầu tiên khi có sự cố là câu hỏi về việc, không phải câu hỏi về người. Có ít nhất một lần người lớn tự nhận phần của mình trước."},{"stt":14,"tang":"T5","nhom":"NHÓM 3 – NỘI QUY – TRÁCH NHIỆM – TỰ CHỦ","key":"C1 đồng thuận PH; C2 thử; C3 xử lý ngoại lệ; C4 con tham gia review.","th":"Cha mẹ không thống nhất nguyên tắc","mo":"Con xin phép một người bị từ chối thì hỏi người kia và được đồng ý. Hai người lớn trả lời khác nhau về giờ ngủ, thời gian dùng máy và tiền tiêu vặt. Bất đồng đó thường được nói ra trước mặt con, có khi thành tranh cãi ngay lúc đó. Con đã biết hôm nào nên hỏi ai và hỏi vào lúc nào thì dễ được đồng ý hơn.","pt":"Trẻ khó tự điều chỉnh trong môi trường không nhất quán.","chot":"Dễ chẩn thành con lươn lẹo. Việc con chọn người dễ hơn là hành vi hợp lý với một hệ có hai đáp án. Chỗ phải xử là thoả thuận giữa hai người lớn, làm riêng và xong trước khi nói với con — và đây thường chạm vào bất đồng cũ giữa hai người, không phải chuyện nuôi dạy.","gp":"4 chu kỳ nhất quán gia đình","kpi":"Tăng công bằng và dự đoán được.","dich":"Hỏi riêng hai người lớn năm nguyên tắc chính thì hai bản trả lời khớp nhau. Con không còn chọn người dễ hơn để xin phép. Ngoại lệ nào cũng được hai người thống nhất trước, không quyết tại chỗ trước mặt con."},{"stt":15,"tang":"T5","nhom":"NHÓM 3 – NỘI QUY – TRÁCH NHIỆM – TỰ CHỦ","key":"Trách nhiệm tăng dần theo tuổi và năng lực.","th":"Con chưa có đóng góp thực sự vào việc nhà","mo":"Toàn bộ việc nấu, giặt, dọn do người lớn làm hoặc do người giúp việc. Việc giao cho con là những việc mà nếu con không làm thì không ai bị ảnh hưởng: dọn phòng riêng, cất đồ chơi của mình. Con không biết trong nhà ai lo khoản gì. Khi được nhờ, con làm nếu tiện, từ chối nếu đang bận, và không ai coi đó là vấn đề.","pt":"Công việc nhà là môi trường rèn trách nhiệm rất tốt.","chot":"Dễ nghĩ là con còn nhỏ, để lớn rồi làm. Nhưng thứ đang thiếu không phải kỹ năng làm việc nhà mà là trải nghiệm việc của mình có người phụ thuộc vào. Việc tượng trưng không tạo được trải nghiệm đó, dù có làm bao nhiêu lần đi nữa.","gp":"365 ngày mỗi người một phần việc","kpi":"Hình thành ý thức “tôi thuộc về nên tôi đóng góp”.","dich":"Con giữ ít nhất hai việc nhà cố định có giờ, mà nếu bỏ thì có người trong nhà chịu ảnh hưởng thật. Con nói được ai chịu ảnh hưởng nếu mình bỏ. Trong tháng, số lần người lớn làm thay việc đó bằng không hoặc gần bằng không."}]};


/* ═══════════════════════════════════════════════════════════════════════
   QUYỀN XEM KHÁCH — trần vai theo tầng, giấy phép Super Admin, sổ lượt xem
   (nguyên văn server/GITA_XemKhach.gs)
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * ═══════════════════════════════════════════════════════════════
 * GITA 365 — AI ĐƯỢC XEM HỒ SƠ KHÁCH HÀNG
 * Dán vào cùng dự án Apps Script với GITA_CapPhep.gs.
 *
 * ═══ VÌ SAO PHẦN NÀY PHẢI Ở MÁY CHỦ ═══
 *
 * Luật chủ hệ chốt có hai vế, và cả hai đều không thi hành được ở máy
 * khách:
 *
 *   · "Tầng 4-5 chỉ từ Coach lên tới Super Admin" — lọc trên màn hình
 *     không chặn được ai mở công cụ nhà phát triển. Chặn thật là KHÔNG
 *     GỬI, và chỗ quyết định gửi hay không nằm ở đây.
 *   · "Super Admin cấp quyền mới được xem" — một giấy phép thu hồi
 *     được thì phải hỏi lại mỗi lượt. Bản sao đã nằm trong máy người ta
 *     thì không gọi ngược về được, dù có gỡ giấy phép.
 *
 * ═══ TRẦN VAI: NGƯỜI CẤP CAO NHẤT CŨNG KHÔNG PHÁ ĐƯỢC ═══
 *
 * Super Admin cấp được quyền, nhưng không cấp VƯỢT TRẦN. Cấp cho Giáo
 * viên là từ chối, kể cả khi người bấm nút là chính Super Admin.
 *
 * Trần mà người cao nhất phá được thì nó không phải trần, nó là một lời
 * khuyên — và một lời khuyên thì tới ngày bận việc sẽ có người bỏ qua.
 *
 * ═══ MỖI LƯỢT XEM MỘT DÒNG SỔ ═══
 *
 * Không phải để rình người của mình. Để ngày một hồ sơ rò ra ngoài thì
 * trả lời được câu "ai đã mở nó" — và câu ấy chỉ trả lời được nếu hôm
 * nay đã ghi. Ghi sau khi mất thì không ghi được nữa.
 * ═══════════════════════════════════════════════════════════════
 */

/** Trần vai — PHẢI khớp từng chữ với G.XK_TRAN trong kho.
 *  Khai lại ở đây không phải vì thích: máy chủ không đọc được kho đã mã
 *  hoá, nên đây là bản DUY NHẤT có hiệu lực. Bản trong kho là bản để
 *  màn hình giải thích cho người đọc; bản này là bản chặn. Bộ kiểm đối
 *  chiếu hai bản mỗi lần chạy, nên lệch một vai là đỏ ngay. */
var GITA_XK_TRAN = [
  { tang: ['T1', 'T2', 'T3'], vai: ['R01', 'R02', 'R03', 'R04', 'R05', 'R06', 'R07', 'R09', 'R10', 'R11'] },
  { tang: ['T4', 'T5'],       vai: ['R01', 'R02', 'R03', 'R04', 'R05', 'R06', 'R07', 'R10'] }
];

/** Chiều thứ BA — vai nào xem được mục nào. Vai không có tên ở đây thì
 *  xem đủ ba mục. PHẢI khớp từng chữ với G.XK_VAI_MUC trong kho; bộ kiểm
 *  đối chiếu hai bản mỗi lần chạy. */
var GITA_XK_VAI_MUC = { R10: ['kpi'] };
var GITA_XK_MUC = ['kpi', 'nhiemvu', 'hoso'];

function gitaXkMucCuaVai_(vai) {
  return GITA_XK_VAI_MUC[String(vai)] || GITA_XK_MUC;
}

/** Bậc của Coach — bậc thấp nhất còn được cấp gói NGHỀ CAO và xem tầng
 *  4-5. Đọc từ ROLES trong 00_Config.gs, không gõ con số: đổi bậc của
 *  Coach trong bảng vai thì chỗ này đổi theo. */
function gitaXkBacCoach_() {
  return (ROLES['R07'] || { lv: 7 }).lv;
}

/** Chỉ vai này cấp được quyền xem. */
var GITA_XK_AI_CAP = 'R01';

var GITA_TRANG_QUYENXEM = 'QuyenXemKhach';
var GITA_COT_QUYENXEM = ['id', 'nguoiDuocCap', 'vai', 'tangDuocXem', 'nguoiCap',
  'capLuc', 'hetHan', 'thuHoiLuc', 'thuHoiBoi', 'lyDo'];

function gitaTrangQuyenXem_() {
  var so = gitaSo_();
  var tr = so.getSheetByName(GITA_TRANG_QUYENXEM);
  if (!tr) {
    tr = so.insertSheet(GITA_TRANG_QUYENXEM);
    tr.appendRow(GITA_COT_QUYENXEM);
    tr.setFrozenRows(1);
  }
  return tr;
}

function gitaXkMaTang_(t) {
  t = String(t == null ? '' : t);
  return /^T[1-5]$/.test(t) ? t : (/^[1-5]$/.test(t) ? 'T' + t : '');
}

/** Vai này có nằm trong trần của tầng kia không. Nguồn sự thật của cả tệp. */
function gitaXkDuTran_(vai, tang) {
  var t = gitaXkMaTang_(tang);
  if (!t) return false;
  for (var i = 0; i < GITA_XK_TRAN.length; i++)
    if (GITA_XK_TRAN[i].tang.indexOf(t) >= 0)
      return GITA_XK_TRAN[i].vai.indexOf(String(vai)) >= 0;
  return false;
}

/** Những tầng một vai ĐỦ ĐIỀU KIỆN xem. Chưa nói tới giấy phép. */
function gitaXkTranCuaVai_(vai) {
  var ra = [];
  for (var i = 0; i < GITA_XK_TRAN.length; i++)
    for (var j = 0; j < GITA_XK_TRAN[i].tang.length; j++)
      if (GITA_XK_TRAN[i].vai.indexOf(String(vai)) >= 0) ra.push(GITA_XK_TRAN[i].tang[j]);
  return ra;
}

/**
 * Giấy phép còn hiệu lực của một tài khoản.
 * Hết hạn thì TỰ TẮT — không chờ ai nhớ ra đi gỡ. Một quyền chỉ mất khi
 * có người chủ động gỡ là một quyền sẽ ở lại mãi.
 */
function gitaXkPhepCua_(u) {
  var tr = gitaTrangQuyenXem_();
  var v = tr.getDataRange().getValues();
  var bay = new Date();
  for (var i = v.length - 1; i >= 1; i--) {
    if (String(v[i][1]).toLowerCase() !== String(u).toLowerCase()) continue;
    if (String(v[i][7] || '').trim()) continue;                 // đã thu hồi
    if (v[i][6] && new Date(v[i][6]) <= bay) continue;          // đã hết hạn
    return { hang: i + 1, nguoiDuocCap: v[i][1], vai: v[i][2],
      tang: String(v[i][3] || '').split(',').filter(Boolean),
      nguoiCap: v[i][4], capLuc: v[i][5], hetHan: v[i][6] || null, lyDo: v[i][9] || '' };
  }
  return null;
}

/**
 * fn:'capQuyenXem' — Super Admin cấp quyền xem.
 * Thân: { u, token, cap: { nguoiDuocCap, vai, tang:['T4','T5'], hetHan, lyDo } }
 *
 * Ba lớp từ chối, và mỗi lớp nói một câu khác nhau vì chúng dẫn tới ba
 * việc khác nhau cho người bấm nút.
 */
function gitaCapQuyenXem_(y, hoSo) {
  if (String(hoSo.role) !== GITA_XK_AI_CAP)
    return { ok: false, error: 'Chỉ Super Admin cấp được quyền xem hồ sơ khách hàng.' };
  var c = y.cap || {};
  var ai = String(c.nguoiDuocCap || '').trim().toLowerCase();
  var vai = String(c.vai || '').trim();
  var lyDo = String(c.lyDo || '').trim();
  if (!ai || !vai) return { ok: false, error: 'Thiếu tài khoản hoặc vai được cấp.' };
  if (!lyDo) return { ok: false, error: 'Chưa nói vì sao cấp. Không cấp quyền mà không có lý do.' };

  var xin = (Array.isArray(c.tang) ? c.tang : []).map(gitaXkMaTang_).filter(Boolean);
  if (!xin.length) return { ok: false, error: 'Chưa chọn tầng nào.' };

  /* TRẦN CHẶN THẬT, kể cả với Super Admin. Đây là chỗ luật này khác một
     lời khuyên. */
  var vuot = xin.filter(function (t) { return !gitaXkDuTran_(vai, t); });
  if (vuot.length)
    return { ok: false, vuotTran: vuot,
      error: 'Vai ' + vai + ' không được phép xem tầng ' +
        vuot.map(function (t) { return t.slice(1); }).join(', ') +
        '. Trần vai không cấp vượt được, kể cả bởi Super Admin.' };

  /* Hết hạn là bắt buộc: giấy phép không hạn thì hôm giao là giao mãi. */
  if (!c.hetHan) return { ok: false, error: 'Chưa đặt ngày hết hạn cho giấy phép.' };
  var han = new Date(c.hetHan);
  if (isNaN(han.getTime()) || han <= new Date())
    return { ok: false, error: 'Ngày hết hạn phải là một ngày trong tương lai.' };

  var cu = gitaXkPhepCua_(ai);
  if (cu) return { ok: false, error: 'Tài khoản này đang có giấy phép còn hiệu lực. ' +
    'Thu hồi bản cũ trước khi cấp bản mới — hai giấy phép cùng lúc thì không ai biết bản nào đang chạy.' };

  var tr = gitaTrangQuyenXem_();
  var gio = new Date().toISOString();
  var id = 'QX-' + Utilities.getUuid().slice(0, 8);
  tr.appendRow([id, ai, vai, xin.join(','), hoSo.u, gio, han.toISOString(), '', '', lyDo]);
  audit_(hoSo.phien, 'QUYENXEM_CAP', ai, vai + ' · ' + xin.join(',') + ' · ' + lyDo);
  return { ok: true, id: id, nguoiDuocCap: ai, tang: xin, hetHan: han.toISOString() };
}

/**
 * fn:'thuHoiQuyenXem'
 * Thân: { u, token, nguoiDuocCap }
 * Thu hồi KHÔNG xoá dòng — đánh dấu. Xoá là xoá luôn bằng chứng đã từng
 * cấp, đúng thứ cần trả lời khi có chuyện.
 */
function gitaThuHoiQuyenXem_(y, hoSo) {
  if (String(hoSo.role) !== GITA_XK_AI_CAP)
    return { ok: false, error: 'Chỉ Super Admin thu hồi được quyền xem.' };
  var p = gitaXkPhepCua_(String(y.nguoiDuocCap || ''));
  if (!p) return { ok: false, error: 'Tài khoản này không có giấy phép nào đang hiệu lực.' };
  var tr = gitaTrangQuyenXem_();
  var gio = new Date().toISOString();
  tr.getRange(p.hang, 8).setValue(gio);
  tr.getRange(p.hang, 9).setValue(hoSo.u);
  audit_(hoSo.phien, 'QUYENXEM_THUHOI', y.nguoiDuocCap, p.tang.join(','));
  return { ok: true, thuHoiLuc: gio };
}

/**
 * fn:'soiQuyenXem' — tài khoản tự hỏi mình đang được xem tầng nào.
 * Trả về CẢ trần lẫn giấy phép, vì hai câu "vai anh không được phép" và
 * "vai anh được phép nhưng chưa ai cấp quyền" dẫn tới hai việc khác nhau.
 */
function gitaSoiQuyenXem_(y, hoSo) {
  var tran = gitaXkTranCuaVai_(hoSo.role);
  var p = gitaXkPhepCua_(hoSo.u);
  var mucDuoc = gitaXkMucCuaVai_(hoSo.role);
  if (!p) return { ok: true, tang: [], tranVai: tran, muc: mucDuoc, coGiayPhep: false };
  /* Trần đọc lại lúc DÙNG, không tin cột đã ghi: vai của một người đổi
     được sau khi giấy phép đã cấp, và lúc ấy giấy phép cũ vẫn nằm đó. */
  var con = p.tang.filter(function (t) { return gitaXkDuTran_(hoSo.role, t); });
  return { ok: true, tang: con, tranVai: tran, muc: mucDuoc, coGiayPhep: true,
    hetHan: p.hetHan, nguoiCap: p.nguoiCap, lyDo: p.lyDo,
    tutTheoVai: con.length < p.tang.length };
}

/**
 * fn:'xemKhachCao' — trả hồ sơ khách hàng tầng 4-5.
 * Đây là dữ liệu KHÔNG nằm trong gói nào gửi về máy, nên đây là cửa duy
 * nhất, và mỗi lượt qua cửa là một dòng sổ.
 */
function gitaXemKhachCao_(y, hoSo) {
  /* Trả về HỒ SƠ, nên phải qua cổng mục 'hoso'. Chuyên gia đánh giá đủ
     trần tầng 4-5 nhưng chỉ được mục kpi — đủ tầng mà không đủ mục thì
     vẫn là không. */
  if (gitaXkMucCuaVai_(hoSo.role).indexOf('hoso') < 0) {
    audit_(hoSo.phien, 'XEMKHACH_TUCHOI', hoSo.role, 'ngoài mục hoso');
    return { ok: false, code: 'NOPERM',
      error: 'Vai này không xem được hồ sơ khách hàng. Chỉ xem được: ' +
        gitaXkMucCuaVai_(hoSo.role).join(', ') + '.' };
  }
  var q = gitaSoiQuyenXem_(y, hoSo);
  var cao = q.tang.filter(function (t) { return t === 'T4' || t === 'T5'; });
  if (!cao.length) {
    audit_(hoSo.phien, 'XEMKHACH_TUCHOI', hoSo.role, q.coGiayPhep ? 'ngoài trần' : 'chưa có giấy phép');
    return { ok: false, code: 'NOPERM',
      error: q.coGiayPhep
        ? 'Giấy phép của tài khoản này không gồm tầng 4-5.'
        : 'Chưa được Super Admin cấp quyền xem hồ sơ khách hàng.' };
  }
  var ds = [];
  try {
    ds = Store.all('students').filter(function (s) {
      var t = 'T' + Number(s.tier || 0);
      return cao.indexOf(t) >= 0 && !s.deletedAt;
    });
  } catch (e) { return { ok: false, error: 'Chưa đọc được sổ học viên.' }; }

  audit_(hoSo.phien, 'XEMKHACH_CAO', cao.join(','), ds.length + ' hồ sơ');
  return { ok: true, tang: cao, so: ds.length, nha: ds };
}


/* ═══════════════════════════════════════════════════════════════════════
   XUẤT SHEET — đẩy bảng tính về thư mục Drive của Học viện
   (nguyên văn server/GITA_XuatSheet.gs)
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * ═══════════════════════════════════════════════════════════════
 * GITA 365 — XUẤT BẢNG TÍNH VỀ DRIVE CỦA ADMIN
 * Dán vào cùng dự án Apps Script với GITA_CapPhep.gs.
 *
 * Dữ liệu KHÔNG đi qua máy người dùng. Máy chủ tạo Google Sheet
 * thẳng trong thư mục Drive của Admin rồi trả về đường dẫn.
 * Không có tệp nào nằm lại trong thư mục Tải về của ai cả.
 * ═══════════════════════════════════════════════════════════════
 */

/** Thư mục Drive nhận mọi bảng tính xuất ra. */
var GITA_THU_MUC_XUAT = '1pvXH45JvXXPOW9V6ObB5CR87r7gxH0fU';

/** Trần số dòng mỗi lần xuất — chặn rút cả kho bằng một lệnh. */
var GITA_TRAN_DONG_XUAT = 5000;

/** Trần số lần xuất mỗi tài khoản mỗi ngày. */
var GITA_TRAN_XUAT_NGAY = 20;

function gitaDemXuat_(u) {
  var kho = CacheService.getScriptCache();
  var k = 'XUATSHEET_' + String(u).toLowerCase() + '_' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd');
  var n = Number(kho.get(k) || 0) + 1;
  kho.put(k, String(n), GITA_CACHE_NGAY);
  return n;
}

/**
 * Tạo một Google Sheet trong thư mục Admin.
 * Gọi từ doPost khi fn === 'xuatSheet'.
 */
function gitaXuatSheet_(y, hoSo) {
  // 1. Quyền: chỉ vai có xuat_sheet. lv lấy từ ROLES trong 00_Config.gs.
  var lv = (ROLES[hoSo.role] || { lv: 99 }).lv;
  if (lv > 4) return { ok: false, code: 'PERM', error: 'Vai này không có quyền xuất bảng tính.' };

  // 2. Dữ liệu phải hợp lệ và trong trần
  var cot = Array.isArray(y.cot) ? y.cot : null;
  var dong = Array.isArray(y.dong) ? y.dong : null;
  if (!cot || !cot.length || !dong) return { ok: false, error: 'Thiếu dữ liệu bảng.' };
  if (dong.length > GITA_TRAN_DONG_XUAT)
    return { ok: false, code: 'TOOBIG', error: 'Vượt trần ' + GITA_TRAN_DONG_XUAT + ' dòng một lần xuất.' };

  var soLan = gitaDemXuat_(hoSo.u);
  if (soLan > GITA_TRAN_XUAT_NGAY)
    return { ok: false, code: 'RATE', error: 'Vượt trần ' + GITA_TRAN_XUAT_NGAY + ' lần xuất một ngày.' };

  // 3. Tạo bảng tính trong đúng thư mục
  var thuMuc = DriveApp.getFolderById(GITA_THU_MUC_XUAT);
  var maBan = String(y.maBan || '').slice(0, 40) || 'GITA-' + new Date().getTime();
  var ten = maBan + ' · ' + String(y.ten || 'Bảng dữ liệu').slice(0, 80);

  /* Dựng lưới đủ chỗ ngay từ đầu.
     SpreadsheetApp.create(ten) cho ra trang mặc định 1.000 dòng × 26 cột,
     trong khi trần xuất là 5.000 dòng — xuất từ 1.000 dòng trở lên là
     getRange ném "Those rows are out of bounds" và người dùng chỉ nhận được
     một câu báo lỗi chung chung. */
  var soDongCan = dong.length + 1;
  var soCotCan  = Math.max(cot.length, 1);
  var ss = SpreadsheetApp.create(ten, Math.max(soDongCan, 20), Math.max(soCotCan, 5));
  var sh = ss.getActiveSheet();
  sh.setName(String(y.ten || 'Dữ liệu').slice(0, 90));

  // Ngăn công thức: mọi ô ghi dưới dạng chuỗi, ô bắt đầu bằng = + - @ được thêm dấu nháy
  var an = function (v) {
    var t = (v === null || v === undefined) ? '' : String(v);
    return /^[=+\-@\t\r]/.test(t) ? "'" + t : t;
  };
  var bang = [cot.map(an)].concat(dong.map(function (r) { return (r || []).map(an); }));
  sh.getRange(1, 1, bang.length, cot.length).setValues(
    bang.map(function (r) {
      var d = r.slice(0, cot.length);
      while (d.length < cot.length) d.push('');
      return d;
    })
  );
  sh.getRange(1, 1, 1, cot.length).setFontWeight('bold').setBackground('#F5B942');
  sh.setFrozenRows(1);
  sh.autoResizeColumns(1, cot.length);

  // Trang thứ hai: dấu vết xuất — ai, lúc nào, từ máy nào
  var v = ss.insertSheet('Dấu vết');
  v.getRange(1, 1, 7, 2).setValues([
    ['Mã bản', maBan],
    ['Loại dữ liệu', String(y.loai || '')],
    ['Người xuất', hoSo.u],
    ['Vai', hoSo.role + ' — ' + ((ROLES[hoSo.role] || {}).ten || '')],
    ['Lúc xuất', Utilities.formatDate(new Date(), 'GMT+7', 'dd/MM/yyyy HH:mm:ss')],
    ['Số dòng', dong.length],
    ['Ghi chú', 'Tài sản của Học viện GITA. Bản này được ghi vào nhật ký và truy nguồn được theo mã bản.']
  ]);
  v.getRange(1, 1, 7, 1).setFontWeight('bold');
  v.autoResizeColumns(1, 2);

  // 4. Chuyển vào thư mục Admin, gỡ khỏi thư mục gốc của tài khoản chạy script
  var tep = DriveApp.getFileById(ss.getId());
  thuMuc.addFile(tep);
  try { DriveApp.getRootFolder().removeFile(tep); } catch (e) { /* đã ở đúng chỗ */ }
  // Không chia sẻ cho ai — Admin tự phân phối từ Drive
  try { tep.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE); } catch (e) {}

  ghiNhatKy_({
    viec: 'XUAT_SHEET', u: hoSo.u, role: hoSo.role, tier: hoSo.tier,
    goi: String(y.loai || ''), may: String(y.may || '').slice(0, 120), phien: hoSo.phien,
    chiTiet: maBan + ' · ' + dong.length + ' dòng · ' + ss.getId()
  });

  return { ok: true, url: ss.getUrl(), id: ss.getId(), maBan: maBan, soDong: dong.length };
}
