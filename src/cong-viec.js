/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẤM CÔNG VIỆC VÀ KPI

   Kho chuẩn nằm ở kho-goc/data.cong-viec.js (CV_MUC · CV_TRANG ·
   CV_LUAT · CV_HANG · CV_KH_NGAY · CV_KH_TANG). Tệp này là phần CHẠY:
   nhận việc, đẩy trạng thái, luân chuyển, chốt ngày, và tính KPI.

   Vì sao phần chạy phải ở src/ chứ không ở kho: tools/ma-hoa-kho.js
   đóng gói bằng JSON.stringify, và JSON.stringify bỏ hàm. Hàm nằm trong
   kho thì tới lúc mở gói chỉ còn undefined.

   BA LUẬT TỰ ĐẶT, VIẾT RA ĐỂ SAU KHÔNG AI NỚI:

   1. Không có bằng chứng thì không đóng được việc. cvXong() từ chối
      chuỗi rỗng và từ chối chuỗi dưới 20 ký tự. Một hệ KPI chấm bằng
      lời khai là một hệ trả lương cho lời khai.
   2. Đồng hồ hạn chạy từ lúc NHẬN, không từ lúc bắt đầu. Nhận rồi để
      đấy vẫn hết hạn — nếu tính từ lúc bắt đầu thì cách tối ưu KPI là
      không bao giờ bấm "bắt đầu".
   3. Ngày không có việc đến hạn thì KPI ngày ấy là "không tính", không
      phải 0%. Đưa 0% vào trung bình tháng là phạt người ta vì hệ thống
      không giao việc cho họ.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function () {
  var NGAY = 86400000;

  /* ─── Sổ việc ─── */
  function so() {
    if (!G.S.viec || typeof G.S.viec !== 'object') G.S.viec = {};
    return G.S.viec;
  }
  G.cvSo = so;

  function ngayCua(ts) {
    var d = new Date(ts);
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  function thangCua(ts) { return ngayCua(ts).slice(0, 7); }
  G.cvNgay = ngayCua;
  G.cvThang = thangCua;

  /* ── Danh mục đầu việc nằm ở HAI kho, cố ý ──
     G.CV_MUC (đội ngũ R01–R12) đi trong gói NGHỀ; G.CV_MUC_DS (cộng tác
     viên R15) đi trong gói NỀN. Chia như thế thì một tài khoản gia đình
     không nhận về máy đầu việc nội bộ của Học viện — xem lời giải thích
     đầy đủ ở kho-goc/data.cong-viec.js.

     Mọi chỗ trong ứng dụng hỏi danh mục đều đi qua hàm này, không đọc
     thẳng G.CV_MUC. Đọc thẳng là chỗ dễ quên một kho nhất. */
  function danhMuc() {
    return (G.CV_MUC || []).concat(G.CV_MUC_DS || []);
  }
  G.cvDanhMuc = danhMuc;

  function mucCua(ma) {
    var ds = danhMuc();
    for (var i = 0; i < ds.length; i++) if (ds[i].ma === ma) return ds[i];
    return null;
  }
  G.cvMuc = mucCua;

  function nhipCua(ma) {
    var ds = G.TG_NHIEMVU || [];
    for (var i = 0; i < ds.length; i++) if (ds[i].ma === ma) return ds[i];
    return null;
  }

  /* Vai đang đăng nhập có đầu việc trong danh mục không.
     Cột trái hỏi hàm này trước khi hiện "Bảng công việc" và "Danh mục
     đầu việc" — hai màn ấy chỉ có nghĩa với người CÓ việc được giao.
     Gia đình không có việc ai giao; họ có nhịp phải giữ, và nhịp nằm ở
     màn "Nhịp của nhà mình" cùng màn việc hôm nay. */
  G.cvVaiCoDauViec = function () {
    return G.cvMucCuaToi().length > 0;
  };

  /* Đầu việc của vai đang đăng nhập */
  G.cvMucCuaToi = function (vai) {
    var v = vai || (G.S.roleObj && G.S.roleObj.id);
    if (!v) return [];
    return danhMuc().filter(function (m) { return m.vai.indexOf(v) >= 0; });
  };

  /* ─── Nhận việc ───
     Một mã đầu việc chỉ được có MỘT bản ghi đang mở. Nhận lại một việc
     đang mở là tạo ra hai bản ghi cùng hạn, và KPI sẽ đếm mẫu số hai
     lần cho cùng một việc. */
  G.cvDangMo = function (ma) {
    var s = so();
    for (var k in s) if (s[k].ma === ma && !s[k].xongLuc) return s[k];
    return null;
  };

  G.cvNhan = function (ma, giaoTu) {
    var m = mucCua(ma);
    if (!m) return { ok: false, loi: 'Không có đầu việc mang mã ' + ma + ' trong danh mục.' };
    /* Chỉ nhận được đầu việc GẮN CHO VỊ TRÍ MÌNH, trừ khi là bàn giao.
       Màn hình vốn chỉ bày việc của vai đang đăng nhập, nên đường thường
       không chạm tới chỗ này. Nhưng gọi thẳng G.cvNhan trong công cụ nhà
       phát triển thì nhận được việc của vai khác, và KPI cộng thêm điểm
       của một việc mình không được giao. Điều kiện chặn ở đây, nơi bản
       ghi thật sự sinh ra, chứ không chặn ở nút bấm. */
    var vai = (G.S.roleObj && G.S.roleObj.id) || '';
    if (!giaoTu && m.vai.indexOf(vai) < 0)
      return { ok: false, loi: 'Đầu việc này không gắn cho vị trí đang đăng nhập.' };
    if (G.cvDangMo(ma)) return { ok: false, loi: 'Việc này đang mở rồi. Đóng bản ghi cũ trước khi nhận lại.' };
    var n = nhipCua(m.nhip);
    var luc = Date.now();
    var id = ma + '|' + luc;
    var v = {
      id: id, ma: ma, nguoi: (G.S.roleObj && G.S.roleObj.id) || '',
      nhanLuc: luc, hanLuc: luc + (n ? n.han : 24) * 3600000,
      batDauLuc: 0, xongLuc: 0, bangChung: '',
      giaoTu: giaoTu || '', chotNgay: '',
      lichSu: [{ luc: luc, vai: (G.S.roleObj && G.S.roleObj.id) || '', viec: giaoTu ? ('Nhận bàn giao từ ' + giaoTu) : 'Tự nhận từ danh mục' }]
    };
    so()[id] = v;
    if (G.save) G.save();
    if (G.danhDau) G.danhDau('checks', 'cv-' + id);
    return { ok: true, viec: v };
  };

  G.cvBatDau = function (id) {
    var v = so()[id];
    if (!v || v.xongLuc) return false;
    if (v.batDauLuc) return true;
    v.batDauLuc = Date.now();
    v.lichSu.push({ luc: v.batDauLuc, vai: v.nguoi, viec: 'Bắt đầu làm' });
    if (G.save) G.save();
    return true;
  };

  /* ─── Luân chuyển ───
     Việc rời tay người này sang tay người khác. Bản ghi KHÔNG nhân đôi:
     vẫn một việc, đổi người giữ, và lịch sử ghi lại đường đi. Nhờ vậy
     câu "việc này đang ở tay ai" luôn trả lời được. */
  G.cvChuyen = function (id, vaiMoi, ghiChu) {
    var v = so()[id];
    if (!v || v.xongLuc) return { ok: false, loi: 'Việc đã đóng hoặc không tồn tại.' };
    if (!vaiMoi) return { ok: false, loi: 'Phải nói rõ chuyển cho vị trí nào.' };
    if (vaiMoi === v.nguoi) return { ok: false, loi: 'Đang ở tay vị trí đó rồi.' };
    var cu = v.nguoi;
    v.nguoi = vaiMoi;
    v.giaoTu = cu;
    v.batDauLuc = 0;                      /* người mới nhận thì việc về trạng thái MỚI */
    v.lichSu.push({ luc: Date.now(), vai: vaiMoi, tu: cu,
      viec: 'Chuyển từ ' + cu + ' sang ' + vaiMoi + (ghiChu ? ' — ' + ghiChu : '') });
    if (G.save) G.save();
    return { ok: true, viec: v };
  };

  /* ─── Đóng việc ───
     Bằng chứng là điều kiện, không phải trường tuỳ chọn. Hai mươi ký tự
     là ngưỡng thấp nhất còn nói được một câu có nội dung; dưới đó thường
     là "ok", "xong rồi", "đã làm". */
  G.CV_BANGCHUNG_TOITHIEU = 20;
  G.cvXong = function (id, bangChung) {
    var v = so()[id];
    if (!v) return { ok: false, loi: 'Không tìm thấy việc.' };
    if (v.xongLuc) return { ok: false, loi: 'Việc này đã đóng.' };
    var bc = String(bangChung || '').trim();
    if (bc.length < G.CV_BANGCHUNG_TOITHIEU)
      return { ok: false, loi: 'Cần bằng chứng đóng việc, ít nhất ' + G.CV_BANGCHUNG_TOITHIEU +
        ' ký tự. Đóng việc bằng lời khai thì KPI không còn nghĩa gì.' };
    v.xongLuc = Date.now();
    v.bangChung = bc;
    v.lichSu.push({ luc: v.xongLuc, vai: v.nguoi, viec: 'Đóng việc kèm bằng chứng' });
    if (G.save) G.save();
    return { ok: true, viec: v };
  };

  /* ─── Trạng thái tính ra, không lưu ───
     Lưu trạng thái thì phải có ai đó chạy đồng hồ để đẩy việc sang TRỄ.
     Tính ra thì không cần đồng hồ nào cả, và không bao giờ lệch. */
  G.cvTrangThai = function (v, luc) {
    var t = luc || Date.now();
    if (v.xongLuc) return 'xong';
    if (t > v.hanLuc) return 'tre';
    return v.batDauLuc ? 'dang' : 'moi';
  };

  G.cvViecCuaToi = function (vai) {
    var v = vai || (G.S.roleObj && G.S.roleObj.id), s = so(), ra = [];
    for (var k in s) if (s[k].nguoi === v) ra.push(s[k]);
    ra.sort(function (a, b) { return a.hanLuc - b.hanLuc; });
    return ra;
  };

  G.cvTheoTrang = function (vai) {
    var ra = { moi: [], dang: [], xong: [], tre: [] };
    G.cvViecCuaToi(vai).forEach(function (v) { ra[G.cvTrangThai(v)].push(v); });
    return ra;
  };

  /* ═══════════ KPI NGÀY ═══════════
     Mẫu số  = điểm của việc CÓ HẠN rơi vào ngày ấy
     Tử số   = điểm của việc đã đóng có bằng chứng, tính vào ngày ĐÓNG
     Trừ     = theo G.TG_PHAT cho việc quá hạn trong ngày ấy */
  function truTre(m) {
    /* Đọc mức phạt từ bảng đã có, không viết lại thang phạt lần thứ hai. */
    if (m.nhip === 'NV-THANG') return 10;
    if (m.nhip === 'NV-CHAM') return 10;
    if (m.nhip === 'NV-TUAN') return 5;
    return 3;
  }
  G.cvTruTre = truTre;

  /* Một ngày được chấm bằng ĐÚNG những việc có hạn rơi vào ngày ấy.
     Tử số là phần trong số đó đã đóng — đóng sớm hay đóng muộn đều tính
     vào ngày ĐẾN HẠN, không tính vào ngày bấm nút.

     Bản đầu tiên tính tử số theo ngày ĐÓNG, và nó sai ngay ở ca đầu:
     nhận một việc hạn 24 giờ rồi đóng luôn trong ngày thì hạn rơi vào
     NGÀY MAI — mẫu số hôm nay bằng 0, tử số bằng 10, và công thức trả
     về 100% trên một mẫu số rỗng. Ngày càng làm sớm thì KPI càng đẹp mà
     không có việc nào đến hạn để đo. Đó là một cái thang để leo, không
     phải một phép đo.

     Tính theo ngày đến hạn thì tử số luôn nằm trong mẫu số, tỉ lệ luôn
     ở giữa 0 và 100, và làm sớm được thưởng bằng cách KHÔNG BỊ TRỄ chứ
     không bằng cách thổi phồng một ngày khác. */
  G.cvKpiNgay = function (ngay, vai) {
    var d = ngay || ngayCua(Date.now());
    var ds = G.cvViecCuaToi(vai);
    var mauSo = 0, tuSo = 0, tru = 0, chiTiet = [];
    ds.forEach(function (v) {
      var m = mucCua(v.ma);
      if (!m || ngayCua(v.hanLuc) !== d) return;
      mauSo += m.diem;
      if (v.xongLuc) {
        tuSo += m.diem;
        chiTiet.push({ ma: v.ma, ten: m.ten, loai: 'xong', so: m.diem,
          muon: v.xongLuc > v.hanLuc });
      }
      /* Trễ: đóng sau hạn, hoặc chưa đóng mà hạn đã qua */
      var tre = v.xongLuc ? (v.xongLuc > v.hanLuc) : (Date.now() > v.hanLuc);
      if (tre) {
        tru += truTre(m);
        chiTiet.push({ ma: v.ma, ten: m.ten, loai: 'tre', so: -truTre(m) });
      }
    });
    if (!mauSo)
      return { ngay: d, tinh: false, pt: null, mauSo: 0, tuSo: 0, tru: 0, chiTiet: [] };
    var pt = Math.round((tuSo / mauSo) * 100);
    pt = Math.max(0, Math.min(100, pt - tru));
    return { ngay: d, tinh: true, pt: pt, mauSo: mauSo, tuSo: tuSo, tru: tru, chiTiet: chiTiet };
  };

  /* ═══════════ HỒ SƠ KPI CỦA CẤP ═══════════
     Cùng công thức cho mọi cấp; chỉ đơn vị đo và sàn dữ liệu đổi theo
     nhịp việc của cấp ấy. Xem lý do đầy đủ ở kho-goc/data.cong-viec.js. */
  G.CV_SAN_NGAY_THANG = 10;      /* dự phòng khi chưa nạp được hồ sơ cấp */
  G.cvCapCuaToi = function (vai) {
    var v = vai || (G.S.roleObj && G.S.roleObj.id);
    var ds = G.CV_KPI_CAP || [];
    for (var i = 0; i < ds.length; i++) if (ds[i].vai.indexOf(v) >= 0) return ds[i];
    return null;
  };

  /* Số lần đo mà danh mục của một cấp sinh ra trong một tháng. Dùng để
     bộ kiểm đối chiếu với sàn: sàn cao hơn con số này là một cái sàn
     không ai bước qua được, và cấp ấy vĩnh viễn không có KPI. */
  G.cvLanDoMotThang = function (vai) {
    var han = {};
    (G.TG_NHIEMVU || []).forEach(function (x) { han[x.ma] = x.han; });
    var ms = G.cvMucCuaToi(vai);
    var cap = G.cvCapCuaToi(vai);
    if (cap && cap.donVi === 'việc')
      return ms.reduce(function (a, m) { return a + Math.min(30, 720 / (han[m.nhip] || 24)); }, 0);
    /* Đơn vị NGÀY: nhiều việc cùng rơi vào một ngày chỉ tính một ngày */
    var lan = ms.reduce(function (a, m) { return a + Math.min(30, 720 / (han[m.nhip] || 24)); }, 0);
    return Math.min(30, lan);
  };

  /* ═══════════ KPI THÁNG ═══════════
     Trung bình các ngày CÓ TÍNH. Dưới sàn của CẤP thì không ra số. */
  G.cvKpiThang = function (thang, vai) {
    var th = thang || thangCua(Date.now());
    var ds = G.cvViecCuaToi(vai), ngays = {};
    /* Ngày được tính là ngày CÓ VIỆC ĐẾN HẠN, khớp với cvKpiNgay. Đếm
       thêm ngày đóng thì sinh ra những ngày mẫu số rỗng, và chúng lọt
       vào trung bình tháng dưới dạng "không tính" — làm số ngày trông
       nhiều hơn thực tế. */
    ds.forEach(function (v) {
      if (thangCua(v.hanLuc) === th) ngays[ngayCua(v.hanLuc)] = 1;
    });
    var ds2 = Object.keys(ngays).sort().map(function (d) { return G.cvKpiNgay(d, vai); })
      .filter(function (x) { return x.tinh; });
    var cap = G.cvCapCuaToi(vai);
    var san = cap ? cap.san : G.CV_SAN_NGAY_THANG;
    /* Cấp quyết định đếm theo SỐ VIỆC đến hạn, không theo số ngày: việc
       của họ tính bằng tuần và tháng, mỗi tháng chỉ sinh ra năm sáu lần
       đo. Đếm theo ngày thì họ không bao giờ chạm sàn nào cả. */
    var soDo = (cap && cap.donVi === 'việc')
      ? ds.filter(function (v) { return thangCua(v.hanLuc) === th; }).length
      : ds2.length;
    if (soDo < san)
      return { thang: th, du: false, soNgay: ds2.length, soDo: soDo, san: san,
        cap: cap, pt: null, hang: null, ngay: ds2 };
    var pt = Math.round(ds2.reduce(function (a, x) { return a + x.pt; }, 0) / ds2.length);
    return { thang: th, du: true, soNgay: ds2.length, soDo: soDo, san: san, cap: cap,
      pt: pt, hang: G.cvHang(pt), ngay: ds2 };
  };

  G.cvHang = function (pt) {
    var ds = (G.CV_HANG || []).slice().sort(function (a, b) { return b.min - a.min; });
    for (var i = 0; i < ds.length; i++) if (pt >= ds[i].min) return ds[i];
    return ds[ds.length - 1] || null;
  };

  /* ═══════════ TRÁCH NHIỆM LIÊN ĐỚI ═══════════
     Việc có cột `chuyen` thì người giao giữ 40%, người nhận 60%. Đọc từ
     lịch sử luân chuyển của chính bản ghi, không từ một bảng riêng —
     bảng riêng thì hai chỗ sẽ lệch nhau sau vài tháng. */
  G.CV_PHAN_GIAO = 0.4;
  G.cvLienDoi = function (vai) {
    var v = vai || (G.S.roleObj && G.S.roleObj.id), s = so(), ra = [];
    for (var k in s) {
      var x = s[k];
      if (x.nguoi === v) continue;                 /* việc của chính mình đã tính ở phần chính */
      var quaTay = (x.lichSu || []).some(function (l) { return l.vai === v || l.tu === v; });
      if (!quaTay) continue;
      var m = mucCua(x.ma);
      if (!m || !m.lienDoi) continue;
      var tt = G.cvTrangThai(x);
      ra.push({
        ma: x.ma, id: x.id, ten: m.ten, dangO: x.nguoi, trang: tt, luat: m.lienDoi,
        so: tt === 'xong' ? Math.round(m.diem * G.CV_PHAN_GIAO)
          : tt === 'tre' ? -Math.round(truTre(m) * G.CV_PHAN_GIAO) : 0
      });
    }
    return ra;
  };

  /* ═══════════ CHỐT NGÀY ═══════════
     Chốt rồi thì không sửa được nữa. Sửa được thì KPI không còn nghĩa. */
  G.cvDaChot = function (ngay) {
    G.S.chotNgay = G.S.chotNgay || {};
    return !!G.S.chotNgay[ngay || ngayCua(Date.now())];
  };
  G.cvChotNgay = function (ngay) {
    var d = ngay || ngayCua(Date.now());
    if (G.cvDaChot(d)) return { ok: false, loi: 'Ngày này đã chốt rồi.' };
    var k = G.cvKpiNgay(d);
    if (!k.tinh) return { ok: false, loi: 'Ngày này không có việc nào đến hạn — không có gì để chốt, và cũng không tính vào KPI tháng.' };
    G.S.chotNgay = G.S.chotNgay || {};
    G.S.chotNgay[d] = { pt: k.pt, tuSo: k.tuSo, mauSo: k.mauSo, tru: k.tru, luc: Date.now() };
    if (G.save) G.save();
    if (G.secLog) G.secLog('Chốt KPI ngày', d + ' · ' + k.pt + '%', 'Ghi nhận');
    return { ok: true, kpi: k };
  };

  /* ═══════════ KPI KHÁCH HÀNG ═══════════
     Khác đội ngũ: gia đình không có việc được giao, họ có NHỊP phải giữ.
     Mọi phần đều đọc từ dấu vết gia đình tự ghi trong máy này — đúng câu
     màn "Phạm vi của tôi" vẫn hứa: không ai khai hộ. */
  G.khKpiNgay = function () {
    var ds = G.CV_KH_NGAY || [], tong = 0, dat = 0, chiTiet = [];
    var j = G.S.journal || {}, coNhatKy = Object.keys(j).some(function (k) {
      var v = j[k]; return typeof v === 'string' ? v.trim().length > 2 : !!v;
    });
    var viecHN = (G.TODAY || {})[G.myPortal ? G.myPortal() : 'ph'] || [];
    var xongHN = viecHN.length > 0 && viecHN.every(function (_, i) { return G.S.checks['t' + i]; });
    var coVongNhac = Object.keys(G.S.checks || {}).some(function (k) { return k.indexOf('vn-') === 0; });
    var coDocTuLieu = !!(G.S.thoigian && Object.keys(G.S.thoigian).length);
    var coNguoiLon = !!(G.S.nhatky && Object.keys(G.S.nhatky).some(function (k) {
      return String((G.S.nhatky[k] || {}).noi || G.S.nhatky[k] || '').trim().length > 10;
    }));
    var bang = { 'KH-1': coNhatKy, 'KH-2': xongHN, 'KH-3': coVongNhac,
                 'KH-4': coDocTuLieu, 'KH-5': coNguoiLon };
    /* MÙA ĐỜI đổi MẪU SỐ, không đổi cách chấm. Nhà đang mùa đông thì chỉ
       còn một nhịp được hỏi tới, nên ghi được một dòng là đạt đủ — và con
       số ấy nói thật chứ không phải nói cho vui. Chưa khai mùa thì hàm
       trả về đủ năm nhịp và mọi thứ y như trước. */
    var giu = G.ttNhipCanGiu ? G.ttNhipCanGiu() : null;
    if (giu && giu.length) ds = ds.filter(function (x) { return giu.indexOf(x.ma) >= 0; });
    ds.forEach(function (x) {
      tong += x.diem;
      var ok = !!bang[x.ma];
      if (ok) dat += x.diem;
      chiTiet.push({ ma: x.ma, ten: x.ten, diem: x.diem, dat: ok, dieu: x.dat });
    });
    return { pt: tong ? Math.round(dat / tong * 100) : 0, dat: dat, tong: tong, chiTiet: chiTiet };
  };

  /* KPI TẦNG = 60% nhịp ngày + 40% tiêu chí mốc đã đạt.
     Nhịp ngày đọc từ sổ chốt; chưa đủ 14 ngày thì không ra số. */
  G.CV_SAN_NGAY_TANG = 14;
  G.khKpiTang = function () {
    var chot = G.S.chotKhNgay || {};
    var ds = Object.keys(chot).map(function (d) { return chot[d].pt; });
    var K = G.KPI100, S = G.S.checks || {}, mocPt = 0;
    if (K && K.diem && K.diem[0]) {
      var d0 = K.diem[0];
      var that = d0.tc.filter(function (t) { return !/^\s*\[.*\]\s*$/.test(String(t || '')); });
      var n = d0.tc.filter(function (t, i) {
        return !/^\s*\[.*\]\s*$/.test(String(t || '')) && S['kpi-' + d0.no + '-' + i];
      }).length;
      mocPt = that.length ? Math.round(n / that.length * 100) : 0;
    }
    if (ds.length < G.CV_SAN_NGAY_TANG)
      return { du: false, soNgay: ds.length, san: G.CV_SAN_NGAY_TANG, mocPt: mocPt, pt: null, nguong: null };
    var nhipPt = Math.round(ds.reduce(function (a, x) { return a + x; }, 0) / ds.length);
    var pt = Math.round(nhipPt * 0.6 + mocPt * 0.4);
    var ng = ((G.CV_KH_TANG || {}).nguong || []).slice().sort(function (a, b) { return b.min - a.min; });
    var hop = null;
    for (var i = 0; i < ng.length; i++) if (pt >= ng[i].min) { hop = ng[i]; break; }
    return { du: true, soNgay: ds.length, nhipPt: nhipPt, mocPt: mocPt, pt: pt, nguong: hop };
  };

  G.khChotNgay = function () {
    var d = ngayCua(Date.now());
    G.S.chotKhNgay = G.S.chotKhNgay || {};
    if (G.S.chotKhNgay[d]) return { ok: false, loi: 'Hôm nay đã chốt rồi.' };
    var k = G.khKpiNgay();
    /* Ghi luôn NHỮNG NHỊP NÀO đạt hôm nay, không chỉ ghi tổng điểm.
       Không có cột này thì hmNhanhHeo() không biết nhánh nào lâu không có
       dấu, và cả cơ chế "nhìn thấy điều đang mất trước khi mất hẳn" chỉ
       còn là một câu nói. Sổ chốt cũ không có cột này thì hàm ấy trả về
       "chưa có dấu để so" chứ KHÔNG kết luận là héo — suy đoán từ chỗ
       thiếu dữ liệu thì sớm muộn cũng báo héo cho một nhà đang đều. */
    G.S.chotKhNgay[d] = { pt: k.pt, dat: k.dat, tong: k.tong, luc: Date.now(),
      ma: k.chiTiet.filter(function (x) { return x.dat; }).map(function (x) { return x.ma; }) };
    if (G.save) G.save();
    return { ok: true, kpi: k };
  };
})();
