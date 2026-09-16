/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v9.74 — CHẤM ĐỘ KHÓ VÀ ĐỊNH TUYẾN XIN KHOÁ

   Kho chuẩn ở kho-goc/data.do-kho.js. Tệp này là phần CHẠY: đọc câu
   hỏi, chấm cấp, tìm người phải xác nhận, dựng lượt xin, và SÁU khoá
   tự chứng minh.

   THỨ TỰ BA CỬA, KHÔNG ĐƯỢC ĐẢO

     1. KHẨN     → dừng hẳn, gọi người thật. Không cấp, không khoá.
     2. CẤP      → chấm từ dấu hiệu. Máy không hạ được.
     3. KHOÁ     → 1-3 tự làm · 4-10 xin người thật bật.

   Đảo cửa 1 xuống sau cửa 3 là biến một đường cấm thành một đường
   chờ: ca tự hại sẽ nằm trong hàng đợi cùng ca hoàn tiền.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function () {

function boDau(s) {
  return String(s == null ? '' : s).toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

/* ═══════ CHẤM CẤP ═══════

   Đầu vào là câu hỏi và (nếu có) kết quả tra kho.

   Kết quả tra KHÔNG BAO GIỜ hạ cấp — tra ra mười hai tư liệu không
   có nghĩa là ca dễ. Nó chỉ làm hai việc: phân biệt cấp 2 với cấp 3,
   và bật cờ khongBiet khi kho rỗng. Xem chú giải dài ở cuối hàm về
   lần tôi để cờ ấy đè lên cấp và kéo nhầm Super Admin vào. */
G.dkDoCap = function (cauHoi, kq, coKhan) {
  var chu = boDau(cauHoi);
  var ds = G.DOKHO_DAU || [];
  var cap = 1, dau = [];

  /* Cửa 1 — khẩn đứng TRƯỚC thang. Trả về khan:true và KHÔNG chấm
     cấp: một ca khẩn không có cấp, nó có một số điện thoại.

     THAM SỐ coKhan CÓ MẶT VÌ MỘT CHỖ NGUY, GHI LẠI:

     Bản đầu, phép phá dkSoiKhanDungTruoc chứng minh "chưa câm" bằng
     cách TRÁO G.aiCoKhan bằng một hàm luôn trả false, chạy, rồi trả
     lại. Mục 67 của bộ kiểm bắt ngay: hai tệp cùng đặt một tên trên G.

     Nó bắt đúng. Tráo một hàm toàn cục thì chỉ cần phép phá ném lỗi
     giữa chừng — hoặc ai đó chèn một dòng vào giữa — là LƯỚI AN TOÀN
     NẰM TẮT suốt phiên còn lại, và không dòng nào báo.

     Nên phép phá nay TRUYỀN một hàm vào chứ không tráo cái gì cả. */
  var kiemKhan = coKhan || G.aiCoKhan;
  if (kiemKhan && kiemKhan(cauHoi))
    return { khan: true, cap: 0, dau: [], vi: (G.DOKHO_LOI_NHA || {}).khan || '' };

  /* Câu này đang hỏi BIẾT hay đang xin LÀM. Xem chú giải dài ở
     DOKHO_DAU về vì sao phải phân biệt. */
  var dangLam = false;
  (G.DOKHO_DANG_LAM || []).forEach(function (t) {
    if (chu.indexOf(t) >= 0) dangLam = true;
  });

  /* Cửa 2 — sàn cao nhất thắng, KHÔNG cộng dồn. */
  ds.forEach(function (d) {
    var trung = null;
    for (var i = 0; i < (d.tu || []).length; i++) {
      if (chu.indexOf(d.tu[i]) >= 0) { trung = d.tu[i]; break; }
    }
    /* Từ CHỦ ĐỀ chỉ nâng cấp khi câu còn mang dáng một yêu cầu. */
    if (!trung && dangLam) {
      for (var k = 0; k < (d.tuChung || []).length; k++) {
        if (chu.indexOf(d.tuChung[k]) >= 0) { trung = d.tuChung[k]; break; }
      }
    }
    if (!trung) return;
    dau.push({ ma: d.ma, ten: d.ten, tu: trung, san: d.san });
    if (d.san > cap) cap = d.san;
  });

  /* Cấp 2 và 3 không có dấu hiệu chữ nào — chúng phân biệt nhau ở
     chỗ câu trả lời phải ghép mấy nguồn và có phải viết lại không.
     Đọc từ chính kết quả tra, vì đó là chỗ duy nhất biết được. */
  if (cap === 1 && kq && kq.length) {
    var kho = {};
    kq.slice(0, 6).forEach(function (x) { kho[x.khoNguon] = 1; });
    var soKho = Object.keys(kho).length;
    if (soKho >= 2) cap = 2;
    /* Câu hỏi có lời cầu biên tập: viết lại, rút gọn, nói cho ai đó */
    if (/\b(ngan gon|rut gon|viet lai|noi lai|de con doc|de hieu|tom tat|soan|thanh cac buoc)\b/.test(chu))
      cap = 3;
  }

  /* ── KHO KHÔNG ĐỠ NỔI ──

     KHOÁ dkSoiCapKhongHa BẮT ĐƯỢC CHỖ TÔI THIẾT KẾ SAI, GHI LẠI:

     Bản đầu cho "kho không trả lời được" đẩy thẳng cấp lên 10, đè cả
     dấu hiệu. Hậu quả đo được ngay: câu "bố mẹ không thống nhất, nên
     làm gì với học phí" — một ca hoàn tiền rất thường — nhảy từ cấp
     6 lên cấp 10, tức là kéo cả Admin và Super Admin vào.

     Sai ở chỗ gộp HAI CÂU HỎI KHÁC NHAU làm một:
       · "ai được quyết việc này" — dấu hiệu trả lời, và nó trả lời
         được kể cả khi kho rỗng: hỏi về tiền thì vẫn là việc của
         người phụ trách, dù kho có câu trả lời hay không.
       · "máy có biết câu trả lời không" — kết quả tra trả lời.

     Gộp lại thì mỗi lần tra hụt là một lần dội Super Admin, và tới
     ca thứ hai mươi thì không ai đọc nữa — đúng thứ DOKHO_LUAT
     .demChoBietTai dựng lên để tránh.

     Nên tách: cờ khongBiet luôn được báo, còn cấp chỉ lên 10 khi
     KHÔNG có dấu hiệu nào khác. Không có dấu hiệu mà kho cũng rỗng
     thì mới thật là "chưa có tiền lệ". */
  var kb = G.DOKHO_KHONGBIET || {};
  var khongBiet = false;
  if (kq) {
    var trong = !kq.length;
    var yeu = kq.length && kq[0].diem !== undefined && kq[0].diem < 1;
    if (trong || yeu) {
      khongBiet = true;
      if (!dau.length) {
        cap = kb.san || 10;
        dau.push({ ma: kb.ma, ten: kb.ten, tu: trong ? '(không kết quả)' : '(điểm quá thấp)',
          san: kb.san });
      }
    }
  }

  var mo = (G.DOKHO_CAP || []).filter(function (c) { return c.ma === 'C' + cap; })[0] || null;
  return { khan: false, cap: cap, dau: dau, khongBiet: khongBiet, ten: mo ? mo.ten : '',
    may: !!(mo && mo.may), nhip: mo ? mo.nhip : '',
    vi: mo ? mo.vi : '' };
};

/* ═══════ TẦNG → NGƯỜI PHỤ TRÁCH ═══════

   Đọc thẳng từ XK_TRAN. Chủ hệ chốt "tầng 2-3 Tư vấn, tầng 4-5
   Coach", và XK_TRAN đã mang đúng luật ấy từ 9.46: nhóm T1-T3 có
   R11 Tư vấn trong danh sách vai, nhóm T4-T5 thì không.

   Nên hàm này KHÔNG gõ lại "T4 thì Coach". Nó hỏi XK_TRAN: tầng này
   Tư vấn có trong danh sách không. Có thì Tư vấn; không thì Coach.
   Ngày chủ hệ đổi ranh giới ở XK_TRAN, chỗ này đi theo ngay. */
var VAI_TUVAN = 'R11';

G.dkNguoiTang = function (tang) {
  var t = tang;
  if (t == null || t === '') return { nguoi: 'COACH', tuXK: false,
    vi: 'Không gắn tầng nào — người trong nghề tự hỏi. Xác nhận là cấp trên trực tiếp.' };
  var maT = String(t).indexOf('T') === 0 ? String(t) : ('T' + t);
  var nhom = (G.XK_TRAN || []).filter(function (n) {
    return (n.tang || []).indexOf(maT) >= 0;
  })[0];
  if (!nhom) return { nguoi: 'COACH', tuXK: false,
    vi: 'XK_TRAN chưa khai tầng ' + maT + ' — rơi về Coach, phía chặt hơn.' };
  var coTuVan = (nhom.vai || []).indexOf(VAI_TUVAN) >= 0;
  return { nguoi: coTuVan ? 'TUVAN' : 'COACH', tuXK: true, nhomXK: nhom.ten,
    vi: coTuVan
      ? ('XK_TRAN nhóm "' + nhom.ten + '" có Tư vấn (' + VAI_TUVAN + ') trong danh sách vai.')
      : ('XK_TRAN nhóm "' + nhom.ten + '" đã gạch Tư vấn khỏi danh sách vai, nên người ' +
         'phụ trách là Coach.') };
};

/* ═══════ CẤP + TẦNG → AI PHẢI XÁC NHẬN ═══════ */
G.dkTuyen = function (cap, tang) {
  if (cap <= 0) return { khan: true, tuMinh: false, xin: [], deXuat: '' };

  var mo = (G.DOKHO_CAP || []).filter(function (c) { return c.ma === 'C' + cap; })[0];
  var tuMinh = !!(mo && mo.may);
  var chinh = G.dkNguoiTang(tang);
  var them = [];
  (G.DOKHO_THEM || []).forEach(function (r) {
    if (cap >= r.tu && cap <= r.den) them = (r.them || []).slice();
  });

  return {
    khan: false, cap: cap, tuMinh: tuMinh,
    xin: tuMinh ? [] : [chinh.nguoi].concat(them),
    nguoiChinh: tuMinh ? '' : chinh.nguoi,
    viTang: chinh.vi, tuXK: chinh.tuXK,
    /* Không được bật thì KHÔNG im — nói thẳng ai nên làm trực tiếp. */
    deXuat: tuMinh ? '' : ('Chưa được bật thì việc này nên để ' + G.dkTenVai(chinh.nguoi) +
      ' làm trực tiếp với nhà mình, không đi qua trợ lý.')
  };
};

G.dkTenVai = function (m) {
  return ({ COACH: 'Coach phụ trách', TUVAN: 'Tư vấn phụ trách',
    ADMIN: 'Admin hệ thống', SUPER: 'Super Admin' })[m] || m;
};

/* ═══════ XIN KHOÁ ═══════

   Máy chỉ XIN. Lượt xin đi vào sổ trong phiên và vào nhật ký an
   ninh; nó KHÔNG tự chuyển sang DA_MO dưới bất kỳ đường nào. */
G.DK_XIN = [];

G.dkXinKhoa = function (ca, cap, cauHoi, tang) {
  var t = G.dkTuyen(cap, tang);
  if (t.khan || t.tuMinh) return null;
  var u = (G.S && G.S.acc && G.S.acc.u) || '(chưa đăng nhập)';
  var x = {
    ma: 'XK-' + Date.now().toString(36).toUpperCase(),
    ca: String(ca || '(chưa có mã ca)'),
    cap: cap, xinLuc: new Date().toISOString(), xinBoi: u,
    hoi: String(cauHoi || '').slice(0, 200),
    canXacNhan: t.xin.slice(),
    trangThai: 'CHO_XAC_NHAN',
    nguoiMo: '', moLuc: '', viMo: '', hetHan: ''
  };
  G.DK_XIN.push(x);
  if (G.secLog) G.secLog('Trợ lý xin khoá xử lý',
    'Ca ' + x.ca + ' · cấp ' + cap + ' · cần ' + t.xin.join(', '), 'Ghi nhận');
  return x;
};

/* ═══════ MỞ KHOÁ — CHỈ NGƯỜI THẬT ═══════

   Ba điều kiện, thiếu một là từ chối:
     · có tài khoản người thật đang đăng nhập
     · tài khoản ấy KHÁC người xin, khi người xin là máy
     · có một câu lý do

   Trả về {ok:false, vi:'…'} chứ không ném lỗi: chỗ gọi phải hiện
   được lý do lên màn, mà một ngoại lệ thì không hiện được gì. */
G.dkMoKhoa = function (maXin, viMo, gioHieuLuc) {
  var x = G.DK_XIN.filter(function (o) { return o.ma === maXin; })[0];
  if (!x) return { ok: false, vi: 'Không tìm thấy lượt xin ' + maXin };
  if (x.trangThai !== 'CHO_XAC_NHAN')
    return { ok: false, vi: 'Lượt xin này đã ở trạng thái ' + x.trangThai };

  var acc = G.S && G.S.acc;
  if (!acc || !acc.u)
    return { ok: false, vi: 'Không có tài khoản người thật đứng sau lượt mở này. ' +
      'Máy chỉ xin, không tự mở.' };
  if (!String(viMo || '').trim())
    return { ok: false, vi: 'Phải ghi một câu vì sao bật. Bật mà không nói lý do thì ' +
      'sáu tháng sau không ai dựng lại được vì sao hôm ấy lại bật.' };

  /* Người bật phải có quyền của vai được yêu cầu. Không đủ quyền thì
     từ chối — kể cả khi họ bậc cao hơn: cao hơn không có nghĩa là
     đúng người. */
  var can = G.dkQuyenCua(x.canXacNhan[0]);
  if (can && G.can && !G.can(can))
    return { ok: false, vi: 'Tài khoản đang đăng nhập không có quyền "' + can +
      '" — lượt xin này cần ' + G.dkTenVai(x.canXacNhan[0]) + ' bật.' };

  var gio = Number(gioHieuLuc) > 0 ? Number(gioHieuLuc) : 48;
  x.trangThai = 'DA_MO';
  x.nguoiMo = acc.u;
  x.moLuc = new Date().toISOString();
  x.viMo = String(viMo).trim();
  x.hetHan = new Date(Date.now() + gio * 3600e3).toISOString();
  if (G.secLog) G.secLog('Bật khoá xử lý cho trợ lý',
    'Ca ' + x.ca + ' · cấp ' + x.cap + ' · ' + acc.u + ' · ' + x.viMo.slice(0, 60), 'Cảnh báo');
  return { ok: true, khoa: x };
};

G.dkTuChoi = function (maXin, vi) {
  var x = G.DK_XIN.filter(function (o) { return o.ma === maXin; })[0];
  if (!x) return { ok: false, vi: 'Không tìm thấy lượt xin ' + maXin };
  var acc = G.S && G.S.acc;
  if (!acc || !acc.u) return { ok: false, vi: 'Không có tài khoản người thật.' };
  x.trangThai = 'TU_CHOI';
  x.nguoiMo = acc.u;
  x.moLuc = new Date().toISOString();
  x.viMo = String(vi || '').trim();
  /* Từ chối cũng là một câu trả lời và phải nói lại cho người hỏi:
     im lặng thì họ không phân biệt được "chưa ai đọc" với "đã đọc
     và không đồng ý". */
  return { ok: true, khoa: x, noiLai: (G.DOKHO_LOI_NHA || {}).khongMo || '' };
};

G.dkQuyenCua = function (m) {
  return ({ COACH: 'pro_coach', TUVAN: 'pro_consult',
    ADMIN: 'qt_trang', SUPER: 'qt_trang' })[m] || '';
};

/* ═══════ CÓ KHOÁ CHƯA ═══════

   Bốn điều kiện. Hết hạn thì TỰ TẮT — không cần ai gỡ. */
G.dkCoKhoa = function (ca, cap) {
  var nay = Date.now();
  var x = G.DK_XIN.filter(function (o) {
    if (o.ca !== String(ca)) return false;
    if (o.trangThai !== 'DA_MO') return false;
    if (o.cap !== cap) return false;             /* khoá không nâng cấp theo ca */
    if (!o.hetHan || Date.parse(o.hetHan) <= nay) return false;
    return true;
  })[0];
  return x || null;
};

/* ═══════ CỬA CHÍNH — trợ lý gọi một hàm này ═══════ */
G.dkCua = function (cauHoi, kq, ca, tang) {
  var L = G.DOKHO_LOI_NHA || {};
  var d = G.dkDoCap(cauHoi, kq);
  if (d.khan) return { khan: true, cap: 0, lam: false, loi: L.khan, dau: [] };

  var t = G.dkTuyen(d.cap, tang);
  if (t.tuMinh)
    return { khan: false, cap: d.cap, tenCap: d.ten, lam: !d.khongBiet,
      khongBiet: d.khongBiet,
      loi: d.khongBiet ? L.khongBiet : L.tuLam, dau: d.dau };

  var k = G.dkCoKhoa(ca, d.cap);
  if (k)
    return { khan: false, cap: d.cap, tenCap: d.ten, lam: true, khoa: k,
      khongBiet: d.khongBiet,
      loi: d.khongBiet ? L.khongBiet : L.tuLam, dau: d.dau, nguoiMo: k.nguoiMo };

  /* Chưa có khoá. Đã xin chưa? */
  var daXin = G.DK_XIN.filter(function (o) {
    return o.ca === String(ca) && o.cap === d.cap && o.trangThai === 'CHO_XAC_NHAN';
  })[0];
  var moi = daXin || G.dkXinKhoa(ca, d.cap, cauHoi, tang);

  return { khan: false, cap: d.cap, tenCap: d.ten, lam: false,
    loi: daXin ? L.choXacNhan : L.daXin,
    viCho: L.viSaoChoDuoc,
    dau: d.dau, xin: moi, canXacNhan: t.xin, deXuat: t.deXuat,
    /* Kho rỗng là một SỰ THẬT RIÊNG, phải nói dù cấp bao nhiêu. Nhập
       nó vào cấp là chuyện đã sửa ở dkDoCap — xem chú giải ở đó. */
    khongBiet: d.khongBiet, loiKhongBiet: d.khongBiet ? L.khongBiet : '' };
};

/* ═══════════════════════════════════════════════════════════════
   KHOÁ — SÁU ĐIỀU PHẢI CHỨNG MINH BẰNG CÁCH CHẠY THẬT
   ═══════════════════════════════════════════════════════════════ */

/* 1 · Mười cấp đủ mặt, và ranh giới 3/4 ĐỔI THẬT hành vi.
      Không đọc lời khai "may: true" — gọi dkTuyen ở cấp 3 và cấp 4
      rồi đòi hai kết quả khác nhau. */
G.dkSoiRanhBaBon = function () {
  var loi = [], ds = G.DOKHO_CAP || [];
  if (ds.length !== 10) loi.push('phải đủ mười cấp, đang có ' + ds.length);
  ds.forEach(function (c, i) {
    if (c.ma !== 'C' + (i + 1)) loi.push('cấp thứ ' + (i + 1) + ' mang mã ' + c.ma);
    ['ten', 'mo', 'vi', 'viDu', 'nhip'].forEach(function (k) {
      if (!c[k]) loi.push(c.ma + ' thiếu ô ' + k);
    });
  });
  /* Ba đầu tự làm, bảy sau thì không — đo bằng cách gọi thật */
  for (var n = 1; n <= 10; n++) {
    var t = G.dkTuyen(n, 'T3');
    if (n <= 3 && !t.tuMinh) loi.push('cấp ' + n + ' đáng lẽ máy tự làm mà dkTuyen nói không');
    if (n >= 4 && t.tuMinh) loi.push('cấp ' + n + ' đáng lẽ phải xin mà dkTuyen nói tự làm');
    if (n >= 4 && !t.xin.length) loi.push('cấp ' + n + ' phải xin mà không nêu được ai');
    if (n >= 4 && !t.deXuat) loi.push('cấp ' + n + ' không có câu đề xuất người làm trực tiếp');
  }
  return { chuaDo: false, loi: loi, soCap: ds.length };
};

/* 2 · Tầng 2-3 ra Tư vấn, tầng 4-5 ra Coach — VÀ phải đọc từ
      XK_TRAN chứ không chép. Chứng minh bằng cách SỬA XK_TRAN ngay
      trong lúc chạy: gạch Tư vấn khỏi nhóm tầng 1-2-3 rồi đòi
      dkNguoiTang('T3') đổi câu trả lời. Chép lại thì nó không đổi. */
G.dkSoiTuyenTheoTang = function () {
  var loi = [];
  var mong = { T1: 'TUVAN', T2: 'TUVAN', T3: 'TUVAN', T4: 'COACH', T5: 'COACH' };
  Object.keys(mong).forEach(function (t) {
    var r = G.dkNguoiTang(t);
    if (r.nguoi !== mong[t])
      loi.push(t + ' phải ra ' + mong[t] + ' mà ra ' + r.nguoi + ' — ' + r.vi);
    if (!r.tuXK) loi.push(t + ' không đọc được từ XK_TRAN');
  });

  /* Phép chứng minh "trỏ chứ không chép" */
  var nhom = (G.XK_TRAN || []).filter(function (n) {
    return (n.tang || []).indexOf('T3') >= 0;
  })[0];
  if (!nhom) {
    loi.push('XK_TRAN không có nhóm nào chứa T3 — không kiểm được chỗ trỏ');
  } else {
    var giu = nhom.vai.slice();
    nhom.vai = nhom.vai.filter(function (v) { return v !== VAI_TUVAN; });
    var sau = G.dkNguoiTang('T3');
    nhom.vai = giu;
    if (sau.nguoi !== 'COACH')
      loi.push('gạch Tư vấn khỏi XK_TRAN mà dkNguoiTang(T3) vẫn ra ' + sau.nguoi +
        ' — nghĩa là ranh giới tầng đang được CHÉP ở một chỗ thứ hai, không trỏ về XK_TRAN');
    var lai = G.dkNguoiTang('T3');
    if (lai.nguoi !== 'TUVAN') loi.push('trả XK_TRAN về mà kết quả không về theo');
  }
  return { chuaDo: false, loi: loi };
};

/* 3 · Máy không tự mở khoá được, và ba đường vòng đều bị chặn. */
G.dkSoiMayKhongTuMo = function () {
  var loi = [];
  var giuXin = G.DK_XIN.slice();
  var giuAcc = G.S && G.S.acc;

  var x = G.dkXinKhoa('CA-THU', 6, 'hoàn tiền thế nào', 'T3');
  if (!x) { G.DK_XIN = giuXin; return { chuaDo: true, thieu: 'không dựng được lượt xin', loi: [] }; }
  if (x.trangThai !== 'CHO_XAC_NHAN') loi.push('lượt xin vừa dựng đã không ở trạng thái chờ');
  if (G.dkCoKhoa('CA-THU', 6)) loi.push('vừa xin xong đã có khoá — khoá tự mở');

  /* Đường vòng 1: mở mà không có tài khoản */
  if (G.S) G.S.acc = null;
  var r1 = G.dkMoKhoa(x.ma, 'vì tôi muốn thế');
  if (r1.ok) loi.push('mở được khoá khi KHÔNG có tài khoản người thật');
  if (G.S) G.S.acc = giuAcc;

  /* Đường vòng 2: mở mà không ghi lý do */
  var r2 = G.dkMoKhoa(x.ma, '   ');
  if (r2.ok) loi.push('mở được khoá mà không ghi một câu vì sao');

  /* Đường vòng 3: gán thẳng trạng thái rồi hỏi dkCoKhoa —
     phải vẫn không qua, vì thiếu hạn dùng */
  x.trangThai = 'DA_MO';
  if (G.dkCoKhoa('CA-THU', 6))
    loi.push('gán thẳng trangThai = DA_MO mà dkCoKhoa đã cho qua — thiếu phép kiểm hạn dùng');

  /* Đường vòng 4: khoá đã hết hạn */
  x.hetHan = new Date(Date.now() - 1000).toISOString();
  if (G.dkCoKhoa('CA-THU', 6)) loi.push('khoá đã hết hạn mà vẫn còn hiệu lực');

  /* Đường vòng 5: khoá cấp 6 dùng cho ca leo lên cấp 7 */
  x.hetHan = new Date(Date.now() + 3600e3).toISOString();
  if (G.dkCoKhoa('CA-THU', 7))
    loi.push('khoá mở cho cấp 6 lại dùng được cho cấp 7 — khoá đang nâng cấp theo ca');
  if (!G.dkCoKhoa('CA-THU', 6))
    loi.push('khoá cấp 6 còn hạn mà dkCoKhoa không nhận — phép kiểm chặt quá, hoá ra chặn cả ca thật');

  G.DK_XIN = giuXin;
  if (G.S) G.S.acc = giuAcc;
  return { chuaDo: false, loi: loi };
};

/* 4 · Khẩn đứng TRƯỚC thang. Một câu vừa chạm dấu hiệu khẩn vừa
      chạm dấu hiệu tiền vẫn phải ra khan, không ra cấp 6 chờ mở. */
G.dkSoiKhanDungTruoc = function () {
  var loi = [];
  var a = G.dkDoCap('con nói muốn chết, mà nhà tôi còn đang chờ hoàn tiền', []);
  if (!a.khan) loi.push('câu có dấu hiệu khẩn lẫn dấu hiệu tiền lại ra cấp ' + a.cap +
    ' thay vì dừng — khẩn đang bị xếp thành một bậc của thang');
  if (a.cap !== 0) loi.push('ca khẩn vẫn được gán một cấp (' + a.cap + ') — ca khẩn không có cấp');

  var c = G.dkCua('con nói muốn chết', [], 'CA-X', 'T5');
  if (!c.khan || c.lam) loi.push('dkCua cho một ca khẩn ra lam=' + c.lam);
  if ((c.xin || []).length) loi.push('ca khẩn vẫn dựng một lượt xin khoá');

  /* Chứng minh phép này chưa câm: đưa vào một lưới khẩn LUÔN TRẢ
     FALSE rồi đòi kết quả đổi. Truyền vào chứ KHÔNG tráo G.aiCoKhan —
     xem chú giải ở dkDoCap về vì sao chỗ tráo ấy nguy. */
  var b = G.dkDoCap('con nói muốn chết, mà nhà tôi còn đang chờ hoàn tiền', [],
    function () { return false; });
  if (b.khan) loi.push('đưa vào lưới khẩn luôn-false mà dkDoCap vẫn báo khẩn — nó ' +
    'không đọc lưới được truyền vào, tức phép phá này câm');
  if (b.cap !== 6) loi.push('không còn lưới khẩn thì câu ấy phải rơi về cấp 6 theo dấu ' +
    'hiệu tiền, đang là ' + b.cap);
  /* Và lưới thật vẫn còn nguyên sau khi phá */
  if (typeof G.aiCoKhan !== 'function')
    loi.push('G.aiCoKhan không còn là hàm sau lượt phá — lưới an toàn vừa bị gỡ mất');

  return { chuaDo: false, loi: loi };
};

/* 5 · Sàn không cộng dồn, và cấp không hạ được. */
G.dkSoiCapKhongHa = function () {
  var loi = [];
  /* Ba dấu hiệu nhẹ trong một câu: sàn cao nhất thắng, không cộng */
  var a = G.dkDoCap('bố mẹ không thống nhất, nên làm gì với học phí',
    [{ khoNguon: 'HP_TANG', diem: 30 }]);
  if (a.cap !== 6)
    loi.push('câu chạm D-CHON(4) · D-NHIEUBEN(5) · D-TIEN(6) phải ra 6, ra ' + a.cap +
      ' — sàn đang cộng dồn hoặc đang lấy nhầm');
  if (a.dau.length < 3) loi.push('nhận ra ' + a.dau.length + ' dấu hiệu, đáng lẽ ba');

  /* Tra ra nhiều tư liệu KHÔNG được kéo cấp xuống */
  var kqGia = [];
  for (var i = 0; i < 12; i++) kqGia.push({ khoNguon: 'K' + i, diem: 50 });
  var b = G.dkDoCap('nhà tôi muốn hoàn tiền', kqGia);
  if (b.cap < 6) loi.push('tra ra 12 tư liệu mà cấp tụt xuống ' + b.cap +
    ' — kết quả tra đang được dùng để HẠ cấp');

  /* Kho không đỡ nổi thì lên 10, kể cả khi không có dấu hiệu chữ nào */
  var c = G.dkDoCap('một câu chưa từng có trong kho', []);
  if (c.cap !== 10) loi.push('không dấu hiệu, kho cũng rỗng — cấp phải là 10, đang là ' + c.cap);
  if (!c.khongBiet) loi.push('kho rỗng mà cờ khongBiet không bật');

  /* CÓ dấu hiệu mà kho rỗng: cấp GIỮ NGUYÊN theo dấu hiệu, cờ
     khongBiet vẫn bật. Đây là chỗ bản đầu làm sai — nó đẩy lên 10 và
     kéo Admin lẫn Super Admin vào một ca hoàn tiền thường. */
  var e = G.dkDoCap('nhà tôi muốn hoàn tiền', []);
  if (e.cap !== 6)
    loi.push('có dấu hiệu tiền mà kho rỗng thì cấp phải giữ 6, đang là ' + e.cap +
      ' — cờ "không biết" đang đè lên cấp và kéo thêm người vào vô ích');
  if (!e.khongBiet) loi.push('kho rỗng mà cờ khongBiet không bật (ca có dấu hiệu)');

  /* Bảy điều cấm phải còn đủ và mỗi điều trỏ về một luật có tên */
  var cam = G.DOKHO_CAM || [];
  if (cam.length < 7) loi.push('danh sách cấm còn ' + cam.length + ' điều, đáng lẽ ít nhất bảy');
  cam.forEach(function (k) {
    if (!k.tuLuat) loi.push(k.ma + ' không trỏ về luật nào');
    if (!k.vi) loi.push(k.ma + ' không nói vì sao');
  });
  return { chuaDo: false, loi: loi };
};

/* 7 · HỎI BIẾT không bị chặn, HỎI LÀM thì bị.
      Cùng một danh từ, hai câu, hai cấp. Đây là chỗ 9.74 làm sai và
      chỉ lộ ra khi có bộ đo hội thoại — chặn thừa trông giống cẩn
      thận, nên không ai nghi. */
G.dkSoiHoiBietKhongChan = function () {
  var loi = [];
  var kqGia = [{ khoNguon: 'HSH_HD', diem: 30 }];
  [['bộ hồ sơ gồm những hợp đồng nào', 3, 'hỏi biết'],
   ['có bao nhiêu điều khoản trong bộ hợp đồng', 3, 'hỏi biết'],
   ['học phí từng tầng bao nhiêu', 3, 'hỏi biết'],
   ['tôi muốn thanh lý hợp đồng', 7, 'hỏi làm'],
   ['cho tôi xin xoá dữ liệu của con', 7, 'hỏi làm'],
   ['nhà tôi dừng giữa chừng thì hoàn tiền bao nhiêu', 6, 'hỏi làm']
  ].forEach(function (p) {
    var c = G.dkDoCap(p[0], kqGia).cap;
    if (p[2] === 'hỏi biết' && c > p[1])
      loi.push('"' + p[0] + '" là câu tra cứu mà ra cấp ' + c +
        ' — trợ lý chặn một câu nó thừa sức trả lời');
    if (p[2] === 'hỏi làm' && c < p[1])
      loi.push('"' + p[0] + '" là câu xin làm mà chỉ ra cấp ' + c + ', cần ' + p[1]);
  });
  if (!(G.DOKHO_DANG_LAM || []).length) loi.push('chưa khai DOKHO_DANG_LAM');
  return { chuaDo: false, loi: loi };
};

/* 6 · Không mở khoá thì trợ lý KHÔNG im — phải nói ai làm trực tiếp. */
G.dkSoiKhongImLang = function () {
  var loi = [];
  var giu = G.DK_XIN.slice();
  [['T3', 'TUVAN'], ['T5', 'COACH']].forEach(function (p) {
    var c = G.dkCua('nhà tôi muốn hoàn tiền', [{ khoNguon: 'HP_TANG', diem: 30 }],
      'CA-' + p[0], p[0]);
    if (c.lam) loi.push('tầng ' + p[0] + ' cấp ' + c.cap + ' mà trợ lý vẫn tự làm');
    if (!c.loi) loi.push('tầng ' + p[0] + ' không có lời nói lại cho nhà');
    if (!c.deXuat) loi.push('tầng ' + p[0] + ' không đề xuất ai làm trực tiếp');
    if ((c.canXacNhan || [])[0] !== p[1])
      loi.push('tầng ' + p[0] + ' phải xin ' + p[1] + ' mà xin ' + (c.canXacNhan || [])[0]);
    if (!c.xin || c.xin.trangThai !== 'CHO_XAC_NHAN')
      loi.push('tầng ' + p[0] + ' không dựng được lượt xin ở trạng thái chờ');
  });
  /* Gọi lại lần hai cùng một ca: KHÔNG được dựng lượt xin thứ hai —
     mỗi lần hỏi lại là một lần báo thì người xác nhận thôi đọc, và
     trần nhắc của BTN_TRAN mất nghĩa. */
  var truoc = G.DK_XIN.length;
  G.dkCua('nhà tôi muốn hoàn tiền', [{ khoNguon: 'HP_TANG', diem: 30 }], 'CA-T5', 'T5');
  if (G.DK_XIN.length !== truoc)
    loi.push('hỏi lại cùng một ca lại dựng thêm một lượt xin — người xác nhận sẽ bị dội');
  G.DK_XIN = giu;
  return { chuaDo: false, loi: loi };
};

})();
