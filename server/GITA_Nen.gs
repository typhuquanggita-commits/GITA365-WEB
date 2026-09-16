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
