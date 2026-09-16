/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÀN BIÊN SOẠN NỘI DUNG

   Chỗ người viết ngồi làm việc, và chỗ chủ hệ ĐỌC KIỂM TRA.

   ══ MÀN NÀY KHÔNG VIẾT HỘ, VÀ NÓI THẲNG RA NGAY DÒNG ĐẦU ══

   Nó dựng khuôn, ĐO, và giữ cổng. Người mở ra mà tưởng máy sắp viết hộ
   một bài học thì họ thất vọng ở giây thứ ba — cùng lý do màn Kiến trúc
   sư Thị giác nói trước rằng nó không vẽ ảnh.

   ══ NĂM NGĂN, VÀ THỨ TỰ LÀ MỘT QUYẾT ĐỊNH ══

     soạn     — khuôn hai mươi bốn khối, máy đo NGAY khi gõ
     thang    — bài này đang ở cổng nào, ai đã ký, chữ ký nào còn hiệu lực
     kho bài  — mọi bài, và bài nào đang treo quá hạn ở một cổng
     hiến pháp— tra cứu: khối, thang điểm, luật cấm, bảng thay lời
     quyền ký — ai ký được cổng nào (chỉ R01–R02 mở được ngăn này)

   SOẠN đứng đầu vì đó là việc hằng ngày. HIẾN PHÁP không đứng đầu dù nó
   là bộ não: người ta mở tra cứu khi có một câu hỏi cụ thể.

   ══ PHÉP ĐO Ở MÀN HÌNH KHÔNG PHẢI LÀ CỔNG ══

   Máy chủ mới là chỗ chặn. Phép đo chạy ở đây chỉ để người viết thấy
   NGAY chỗ thiếu thay vì phải nộp lên rồi chờ — và nó đọc thẳng
   G.KN_KHOI, G.KN_RONG, G.KN_LOI_THAY trong kho, tức là đọc BẢN GỐC,
   không đọc một bản chép thứ ba.

   Đó là chỗ khác nhau giữa hai bản chép trong hệ này: máy chủ buộc phải
   giữ bản chép vì nó không đọc được kho đã mã hoá, và bộ kiểm mục 77
   đối chiếu bản chép ấy từng ô. Màn hình thì đọc được kho, nên nó không
   được phép có bản chép nào.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  var NGAN = [
    {ma: 'soan',     ten: 'Soạn',      ic: 'plus'},
    {ma: 'buoi',     ten: 'Đọc buổi',  ic: 'users'},
    {ma: 'thang',    ten: 'Thang',     ic: 'shield'},
    {ma: 'kho',      ten: 'Kho bài',   ic: 'vault'},
    {ma: 'toanhe',   ten: 'Đọc toàn hệ', ic: 'search'},
    {ma: 'miendich', ten: 'Miễn dịch',   ic: 'shield'},
    {ma: 'tudien',   ten: 'Từ điển',     ic: 'quote'},
    {ma: 'chuannghe',ten: 'Chuẩn nghề',   ic: 'crown'},
    {ma: 'hienphap', ten: 'Hiến pháp', ic: 'book'},
    {ma: 'chochu',   ten: 'Chờ chủ hệ', ic: 'clock'},
    {ma: 'quyen',    ten: 'Quyền ký',  ic: 'lock'}
  ];

  G.bsNgan = G.bsNgan || 'soan';
  G.bsD = G.bsD || {chu: '', tieuDe: '', tang: 'T1', id: '', khuon: 'BAIHOC', doiTuong: 'noiBo'};

  /* Màu của từng bậc — lấy từ biến CSS, không gõ mã màu. Biến CSS đã
     tính sẵn cả nền sáng lẫn nền tối; một mã hex thì đúng ở một nền và
     chìm ở nền kia, và người dùng nền tối không báo lỗi ấy bao giờ. */
  var MAU_BAC = {
    nhap: 'var(--ink-3)', may: 'var(--teal)', bienTap: 'var(--warn)',
    chuyenMon: 'var(--warn)', giuChuan: 'var(--warn)', chuHe: 'var(--gita)',
    phatHanh: 'var(--ok)', tuChoi: 'var(--bad)'
  };

  function vai() { return ((G.S && G.S.acc && G.S.acc.role) || ''); }
  function laChuHe() { return vai() === 'R01'; }
  function capQuyenDuoc() { return vai() === 'R01' || vai() === 'R02'; }
  function tenBac(ma) {
    var t = (G.KN_TRANGTHAI || []).filter(function (x) { return x.ma === ma; })[0];
    return t ? t.ten : ma;
  }
  function veLai() {
    if (!G.S || G.S.view !== 'bien-soan-noi-dung') return;
    if (typeof document === 'undefined' || !document.getElementById('main')) return;
    G.render && G.render();
  }
  function oGiaTri(id) {
    var el = typeof document !== 'undefined' && document.getElementById(id);
    return el ? String(el.value || '') : '';
  }

  function thanhNgan() {
    return '<div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:18px">' +
      NGAN.filter(function (n) { return n.ma !== 'quyen' || capQuyenDuoc(); })
        .map(function (n) {
          var on = G.bsNgan === n.ma;
          return '<button class="btn' + (on ? ' primary' : '') + '" ' +
            'onclick="G.bsMoNgan(\'' + n.ma + '\')" style="gap:7px">' +
            ic(n.ic) + h(n.ten) + '</button>';
        }).join('') + '</div>';
  }
  G.bsMoNgan = function (ma) { G.bsNgan = ma; veLai(); };

  /* ═══════════ PHÉP ĐO CHẠY Ở MÁY KHÁCH ═══════════

     Đọc thẳng bản gốc trong kho. Cùng ba phép đo mà máy chủ chạy — dò
     theo TỪ chứ không theo chuỗi con, vì bỏ dấu xong thì "hư" thành
     "hu", và "hu" nằm trong "chưa", "chuẩn", "thứ". Bản đầu của bộ dò ở
     máy chủ mắc đúng lỗi ấy và báo mười ba câu dán nhãn trên một bài
     sạch; chép lại lỗi ấy sang đây là chép cả lỗi. */
  function boDau(s) {
    return String(s || '').toLowerCase().normalize('NFD')
      .replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  }
  function reTu(cum) {
    var goc = boDau(cum).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    try {
      return new RegExp('(?<![\\p{L}\\p{N}])' + goc + '(?![\\p{L}\\p{N}])', 'u');
    } catch (e) {
      /* Trình duyệt cũ không có lookbehind. Lùi về ranh giới thô còn hơn
         tắt hẳn phép đo — nhưng KHÔNG im lặng lùi về chuỗi con, vì chuỗi
         con báo sai và báo sai thì người ta thôi đọc cả danh sách. */
      return new RegExp('(^|[^\\wÀ-ỹ])' + goc + '([^\\wÀ-ỹ]|$)', 'i');
    }
  }
  /* ══ MÀN DẠY KHÔNG PHẢI MÀN PHẠM ══

     Lượt quét đầu bắt "lười" ở màn Chuẩn ngôn ngữ sáu vai — đúng cái
     màn dạy người ta ĐỪNG nói "lười". Và bắt luôn ở chính màn này, vì
     ngăn Hiến pháp bày cả bảng thay lời ra.

     Nếu để nguyên thì báo cáo đầy những dòng đúng, và một báo cáo đầy
     dòng đúng thì lần thứ tư người ta thôi đọc cả báo cáo.

     Cách phân biệt phải là CẤU TRÚC, không phải một danh sách màn gõ
     tay — danh sách gõ tay thì mục nào thêm sau không ai nhớ. Dấu hiệu
     cấu trúc: một dòng vừa chứa câu CẤM vừa chứa câu NÓI THAY của
     chính nó là một dòng của cái BẢNG, không phải một câu văn. Không
     ai vừa mắng vừa kèm sẵn câu sửa trong cùng một dòng. */
  function doBang(chu, bang, lay) {
    var dong = String(chu || '').split('\n'), bat = [];
    dong.forEach(function (d, i) {
      var t = boDau(d);
      bang.forEach(function (hang) {
        var c = lay(hang);
        if (!reTu(c.cau).test(t)) return;
        var moc = boDau(String(c.thay || '').slice(0, 24)).trim();
        var laBang = moc.length >= 8 && t.indexOf(moc) >= 0;
        bat.push({dong: i + 1, bat: c.cau, thay: c.thay, vi: c.vi, laBang: laBang});
      });
    });
    return bat;
  }
  function locBang(ds) {
    return (ds || []).filter(function (x) { return !x.laBang; });
  }

  var RE_MO = /^[ \t]*([KPCS]\d{2})[ \t]*\|(.*)$/;

  /* Danh sách khối của khuôn đang chọn. Khuôn BÀI HỌC trỏ về G.KN_KHOI —
     nó là khuôn gốc và khai riêng; ba khuôn kia khai khối inline trong
     G.KN_KHUON. Đọc từ kho cả hai chỗ, không chép. */
  function dsKhoiCua(maKhuon) {
    var k = (G.KN_KHUON || []).filter(function (x) {
      return x.ma === String(maKhuon || 'BAIHOC').toUpperCase(); })[0];
    if (!k) return G.KN_KHOI || [];
    return k.khoi && k.khoi.length ? k.khoi : (G.KN_KHOI || []);
  }
  function docKhoi(chu, maKhuon) {
    var maKhoi = dsKhoiCua(maKhuon).map(function (k) { return k.ma; });
    var dong = String(chu || '').split('\n');
    var thoi = {}, dang = null, gom = [];
    function chot() {
      if (dang) { thoi[dang] = gom.join('\n').trim(); }
      dang = null; gom = [];
    }
    dong.forEach(function (d) {
      var m = d.match(RE_MO);
      if (!m) { if (dang) gom.push(d); return; }
      chot();
      if (maKhoi.indexOf(m[1]) < 0) return;
      dang = m[1]; gom = [];
    });
    chot();
    var co = {}, trong = [];
    maKhoi.forEach(function (ma) {
      if (!Object.prototype.hasOwnProperty.call(thoi, ma)) return;
      if (thoi[ma].length >= 8) co[ma] = thoi[ma]; else trong.push(ma);
    });
    return {khoi: co, thieu: maKhoi.filter(function (m) { return !co[m]; }), trong: trong};
  }

  function soatDoi(co, maKhuon) {
    var pham = [], ds = dsKhoiCua(maKhuon);
    ds.forEach(function (k) {
      if (!k.doi || !co[k.ma]) return;
      k.doi.forEach(function (can) {
        if (co[can]) return;
        var t = ds.filter(function (x) { return x.ma === can; })[0];
        pham.push({khoi: k.ma, ten: k.ten, can: can, tenCan: t ? t.ten : can});
      });
    });
    return pham;
  }

  /** Toàn bộ phép đo của một bài, chạy tại chỗ. */
  G.bsSoat = function (chu, maKhuon, maDoiTuong) {
    maKhuon = String(maKhuon || 'BAIHOC').toUpperCase();
    maDoiTuong = String(maDoiTuong || 'noiBo') === 'khach' ? 'khach' : 'noiBo';
    var doc = docKhoi(chu, maKhuon);
    var rong = doBang(chu, G.KN_RONG || [], function (r) {
      return {cau: r.cau, thay: r.thay};
    });
    var loi = doBang(chu, G.KN_LOI_THAY || [], function (l) {
      return {cau: l.dung, thay: l.thay, vi: l.vi};
    });
    var nhan = (G.KN_NGUON || []).filter(function (n) {
      return String(chu || '').indexOf(n.nhan) >= 0;
    });
    /* Mười điều kiện hoàn thành là thang đo NGƯỜI HỌC — chỉ có nghĩa với
       khuôn BÀI HỌC. Một quy trình vận hành không có "người học", và đo
       nó bằng thang ấy là đo sai loại. */
    var xong = [];
    if (maKhuon === 'BAIHOC')
      (G.KN_XONG || []).forEach(function (x) {
        var can = (G.KN_KHOI || []).filter(function (k) {
          return (k.xong || []).indexOf(x.ma) >= 0;
        }).map(function (k) { return k.ma; });
        var thieu = can.filter(function (m) { return !doc.khoi[m]; });
        xong.push({ma: x.ma, dieu: x.dieu, dat: thieu.length === 0, thieu: thieu});
      });
    return {doc: doc, khuon: maKhuon, doi: soatDoi(doc.khoi, maKhuon),
      rong: rong, loi: loi, cg: G.bsChuyenGia(chu), vr: G.bsVirus(chu),
      nhan: nhan, xong: xong,
      /* Đúng hai điều kiện máy chủ dùng để CHẶN ở cổng 1. Khai lại ở đây
         thì người viết biết trước mình sẽ bị chặn hay không, thay vì nộp
         lên rồi mới biết. */
      quaCong1: doc.thieu.length === 0 && soatDoi(doc.khoi, maKhuon).length === 0 &&
                loi.length === 0};
  };

  /* ═══════════ BỘ ĐỌC TOÀN HỆ ═══════════

     Chốt của chủ hệ bản 9.99.44: "nâng cấp năng lực đọc toàn bộ Web App."

     ══ VÌ SAO NÓ PHẢI CHẠY Ở MÁY KHÁCH ══

     Màn hình LÀ mã máy khách. Máy chủ không có gì để đọc — nó chỉ giữ
     tài khoản và sổ sách. Cùng lý do đã buộc "đọc màn" của Kiến trúc sư
     Thị giác chạy ở đây.

     Và nó dựng màn THẬT ra chữ rồi đọc, không đọc một bản chép tay:
     người ta gõ lại nội dung màn hình thì thiếu chỗ nào không ai biết.

     ══ NÓ ĐO GÌ, VÀ KHÔNG ĐO GÌ ══

     Đo: câu phán xét · câu rỗng · câu nghiệp dư · câu dài. Bốn thứ đếm
     được và chỉ ra được đúng màn nào.

     KHÔNG đo: màn có đủ hai mươi bốn khối không. Khuôn ấy là khuôn của
     một BÀI HỌC; một màn bảng lương hay một màn danh bạ không phải bài
     học, và bắt chúng đủ hai mươi bốn khối là đo sai loại. Bộ đọc này
     chỉ soi NGÔN NGỮ — thứ mọi màn đều có. */
  function chuThuanTuMan(v) {
    /* ĐẶT G.S.view TRƯỚC KHI DỰNG.
       Bản đầu tôi gọi thẳng G.VIEWS[v]() mà không đặt, và 49 trong 133
       màn ném lỗi — bộ đọc lặng lẽ bỏ qua chúng và báo "84 màn sạch".
       Một bộ đọc bỏ sót một phần ba hệ mà vẫn kết luận SẠCH thì tệ hơn
       không có bộ đọc: nó dựng một sự yên tâm không có gì đỡ.
       Nhiều màn đọc G.S.view để biết mình đang mở ngăn nào. */
    var giu = G.S && G.S.view;
    try {
      if (G.S) G.S.view = v;
      var html = (G.VIEWS && G.VIEWS[v]) ? G.VIEWS[v]() : '';
      if (String(html).length < 40) return '';
      return String(html)
        .replace(/<style[\s\S]*?<\/style>/g, ' ')
        .replace(/<script[\s\S]*?<\/script>/g, ' ')
        /* Giữ ranh giới dòng: đổi thẻ khối thành xuống dòng trước khi
           bóc thẻ. Không giữ thì cả màn thành MỘT dòng, và mọi phép đo
           báo "dòng 1" — chỉ đúng chỗ mà không chỉ được chỗ nào. */
        /* MỘT HÀNG BẢNG LÀ MỘT DÒNG: đóng ô thì chỉ ngăn cách, đóng
           HÀNG mới xuống dòng. Bản đầu tôi cho </td> xuống dòng, và
           bộ lọc "dòng của bảng" không bao giờ kích hoạt được — câu
           cấm nằm ở ô này, câu nói thay nằm ở ô kia, hai dòng khác
           nhau. Sửa chỗ bóc thẻ, không nới bộ lọc. */
        .replace(/<\/(td|th)>/g, ' · ')
        .replace(/<\/(p|div|li|tr|h[1-6])>/g, '\n')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&[a-z]+;/g, ' ')
        .replace(/[ \t]+/g, ' ').replace(/\n{2,}/g, '\n').trim();
    } catch (e) { return {loi: String((e && e.message) || e)}; }
    finally { if (G.S) G.S.view = giu; }
  }

  /* ══ BỘ DÒ PHẢI TỰ CHỨNG MINH CHƯA CÂM ══

     Lượt quét đầu báo 0 dòng bị bắt trên 84 màn. Con số ấy đọc ra là
     "ngôn ngữ toàn hệ đã sạch", mà nó CŨNG đọc ra là "bộ dò đang hỏng"
     — và hai cách đọc ấy nhìn giống hệt nhau.

     Nên mỗi lượt quét chạy kèm một câu BẨN đã biết, qua đúng đường mà
     màn thật đi. Bắt được thì con số 0 kia là một kết quả; không bắt
     được thì nó là một lỗi, và bộ đọc phải nói ra chứ không im. */
  var CAU_THU = 'Con lười quá, phải cố gắng hơn. Hãy cố gắng lên, ' +
    'thành công sẽ đến. Em phải làm, ai cũng biết mà.';
  function boDoConSong() {
    var loi = doBang(CAU_THU, G.KN_LOI_THAY || [], function (l) {
      return {cau: l.dung, thay: l.thay, vi: l.vi}; });
    var rong = doBang(CAU_THU, G.KN_RONG || [], function (r) {
      return {cau: r.cau, thay: r.thay}; });
    var cg = G.bsChuyenGia(CAU_THU);
    return {loi: loi.length, rong: rong.length, cg: cg.length,
      song: loi.length >= 2 && rong.length >= 2 && cg.length >= 2};
  }

  /** Dò từ điển KL08 theo PHẠM VI người đọc.

      Bảng cấm→thay của bản đặc tả viết cho LỜI NÓI VỚI KHÁCH. Áp thẳng
      lên văn nội bộ thì "thất bại", "áp lực" bắt hàng nghìn dòng — đúng
      lỗi 314-dòng của bản 9.99.44. Nên lớp `khach` chỉ dò khi bài viết
      cho khách, và lớp `nhac` KHÔNG dò bao giờ: "sai" và "vấn đề" quá
      thường, dò thì báo sai nhiều hơn báo đúng. */
  G.bsKL = function (chu, doiTuong) {
    var choKhach = String(doiTuong || 'noiBo') === 'khach';
    var bang = (G.KL_THAY || []).filter(function (x) {
      return x.pham === 'moi' || (x.pham === 'khach' && choKhach);
    });
    return doBang(chu, bang, function (x) {
      return {cau: x.cam, thay: x.thay, vi: x.boiCanh};
    }).map(function (x) {
      return {dong: x.dong, bat: x.bat, thay: x.thay, boiCanh: x.vi};
    });
  };

  /** Nội dung này có NUÔI chủng virus nào không — phần máy đo được bằng
      CHỮ. Mười tám dấu hiệu kia đọc từ hành vi trong ứng dụng, và kho
      chưa thu loại dữ liệu ấy. */
  G.bsVirus = function (chu) {
    var bat = [];
    (G.MD_VIRUS || []).forEach(function (v) {
      if (!v.tuNgu || !v.tuNgu.length) return;
      doBang(chu, v.tuNgu.map(function (c) { return {cau: c}; }), function (x) {
        return {cau: x.cau};
      }).forEach(function (x) {
        bat.push({dong: x.dong, bat: x.bat, ma: v.ma, ten: v.ten});
      });
    });
    return bat;
  };

  /** Dò câu nghiệp dư — CẢNH BÁO, không chặn. */
  G.bsChuyenGia = function (chu) {
    return doBang(chu, G.KN_CAM_CHUYENGIA || [], function (c) {
      return {cau: c.cau, thay: c.loi, vi: c.vi};
    }).map(function (x) {
      return {dong: x.dong, bat: x.bat, loi: x.thay, vi: x.vi};
    });
  };

  /** Đọc mọi màn của Web App và đo ngôn ngữ. */
  G.bsDocToanHe = function () {
    var man = [];
    (G.NAV || []).forEach(function (nh) {
      (nh.items || []).forEach(function (x) {
        if (x && x.v && x.t && G.VIEWS[x.v] && man.indexOf(x.v) < 0)
          man.push({v: x.v, t: x.t});
      });
    });
    var kq = [], hong = [], tongChu = 0, soDongBang = 0;
    man.forEach(function (m) {
      var chu = chuThuanTuMan(m.v);
      if (chu && chu.loi) { hong.push({v: m.v, t: m.t, loi: chu.loi}); return; }
      if (!chu || chu.length < 40) { hong.push({v: m.v, t: m.t, loi: 'màn dựng ra gần như không có chữ'}); return; }
      tongChu += chu.length;
      var loi = locBang(doBang(chu, G.KN_LOI_THAY || [], function (l) {
        return {cau: l.dung, thay: l.thay, vi: l.vi};
      }));
      var rong = locBang(doBang(chu, G.KN_RONG || [], function (r) {
        return {cau: r.cau, thay: r.thay};
      }));
      var cg = locBang(G.bsChuyenGia(chu));
      if (loi.length || rong.length || cg.length)
        kq.push({v: m.v, t: m.t, chu: chu.length,
          loi: loi, rong: rong, cg: cg,
          nang: loi.length * 3 + rong.length * 2 + cg.length});
      soDongBang += (doBang(chu, G.KN_LOI_THAY || [], function (l) {
        return {cau: l.dung, thay: l.thay}; }).filter(function (x) { return x.laBang; }).length);
    });
    kq.sort(function (a, b) { return b.nang - a.nang; });
    G.bsD.toanHe = {soMan: man.length, soDo: man.length - hong.length,
      tongChu: tongChu, sach: man.length - hong.length - kq.length,
      hong: hong, ds: kq, tuThu: boDoConSong(), dongBang: soDongBang,
      luc: new Date().toLocaleString('vi-VN')};
    veLai();
  };

  function nganToanHe() {
    var o = '<div class="card"><b>Máy dựng từng màn ra chữ rồi đọc</b>' +
      '<p class="sm muted mt">Màn hình LÀ mã máy khách, nên bộ đọc chạy ở đây — ' +
      'máy chủ không có gì để đọc. Nó dựng màn THẬT rồi bóc thẻ, không đọc một ' +
      'bản chép tay: gõ lại nội dung màn hình thì thiếu chỗ nào không ai biết.</p>' +
      '<p class="sm muted mt">Nó soi <b>ngôn ngữ</b>, không soi cấu trúc: câu phán ' +
      'xét · câu rỗng · câu nghiệp dư. Khuôn hai mươi bốn khối là khuôn của một ' +
      'BÀI HỌC — một màn bảng lương không phải bài học, và bắt nó đủ hai mươi bốn ' +
      'khối là đo sai loại.</p>' +
      '<div class="row mt" style="gap:10px">' +
      '<button class="btn primary" onclick="G.bsDocToanHe()" style="gap:6px">' +
        ic('search') + 'Đọc toàn bộ Web App</button></div></div>';

    var t = G.bsD.toanHe;
    if (!t) return o + canhBao('Chưa chạy lượt nào. Bấm nút ở trên — mất chừng ' +
      'vài giây, và nó chạy hoàn toàn trong máy này.', 'var(--ink-3)');

    /* ── PHỦ ĐƯỢC BAO NHIÊU ĐỨNG TRƯỚC ĐO ĐƯỢC GÌ ──
       Bản đầu tôi để ô "màn sạch" lên trước, và lượt quét đầu in ra "84
       màn sạch" trong khi 49 màn không hề được đọc. Câu ấy đúng từng
       chữ và sai toàn bộ: nó dựng một sự yên tâm phủ lên đúng phần
       chưa ai nhìn. Nay số PHỦ đứng trước, và dưới 90% thì máy nói
       thẳng là con số sạch chưa đọc được. */
    var pt = t.soMan ? Math.round(t.soDo / t.soMan * 100) : 0;
    o += U.sec('Kết quả', t.luc + ' · phủ ' + pt + '% số màn · ' +
      t.tongChu.toLocaleString('vi-VN') + ' ký tự');
    o += '<div class="grid3">' +
      the('Phủ được', pt + '%', t.soDo + '/' + t.soMan + ' màn',
        pt >= 90 ? 'var(--ok)' : 'var(--bad)') +
      the('Màn có chỗ nhắc', String(t.ds.length), 'trong phần đọc được',
        t.ds.length ? 'var(--warn)' : 'var(--ok)') +
      the('Màn sạch', String(t.sach), 'trong phần đọc được',
        'var(--ink-2)') +
      '</div>';

    if (pt < 90)
      o += canhBao('Mới phủ ' + pt + '% số màn, nên con số "màn sạch" ở trên CHƯA ' +
        'đọc được như một kết luận về cả hệ. Bộ đọc chỉ dựng được màn mà kho của ' +
        'tài khoản này đã mở — đăng nhập bằng tài khoản có đủ gói rồi quét lại. ' +
        'Đây là giới hạn cố ý: bộ đọc không được nhìn xa hơn giấy phép của người ' +
        'đang dùng nó.', 'var(--bad)');

    if (t.dongBang)
      o += canhBao('Đã bỏ qua ' + t.dongBang + ' dòng là DÒNG CỦA BẢNG, không phải ' +
        'câu văn: một dòng vừa chứa câu cấm vừa chứa câu nói thay của chính nó là ' +
        'một hàng trong bảng thay lời đang được bày ra. Màn dạy không phải màn ' +
        'phạm. Phân biệt bằng CẤU TRÚC chứ không bằng một danh sách màn gõ tay — ' +
        'danh sách gõ tay thì màn thêm sau không ai nhớ.', 'var(--ink-3)');

    if (t.hong.length) {
      o += U.sec('Màn không đọc được', t.hong.length + ' màn');
      o += U.tbl(['Màn', 'Vì sao'], t.hong.slice(0, 60).map(function (x) {
        return [h(x.t) + '<div class="sm muted">' + h(x.v) + '</div>',
          '<span class="sm" style="color:var(--bad)">' + h(x.loi) + '</span>'];
      }));
    }

    /* Phép tự thử ĐỨNG TRƯỚC kết quả, không đứng sau: người đọc phải
       biết bộ dò còn sống trước khi đọc con số nó đưa ra. */
    var ts = t.tuThu || {};
    o += canhBao(ts.song
      ? 'Bộ dò còn sống: một câu bẩn đã biết cho ra ' + ts.loi + ' phán xét, ' +
        ts.rong + ' rỗng, ' + ts.cg + ' nghiệp dư — chạy qua đúng đường mà màn ' +
        'thật đi. Con số dưới đây vì thế là một KẾT QUẢ, không phải một bộ dò câm.'
      : 'BỘ DÒ ĐANG CÂM. Một câu bẩn đã biết chỉ cho ra ' + ts.loi + '/' +
        ts.rong + '/' + ts.cg + ' — đáng lẽ phải bắt được cả ba. Mọi con số dưới ' +
        'đây KHÔNG đọc được, kể cả con số 0.',
      ts.song ? 'var(--ok)' : 'var(--bad)');

    if (!t.ds.length)
      return o + '<div class="card"><p class="sm muted">Không màn nào có dòng bị ' +
        'bắt. Với bộ dò đã tự chứng minh còn sống ở trên, đây là một kết quả — ' +
        'nhưng nó vẫn chỉ nói được rằng ba bảng dò không tìm thấy thứ CHÚNG CÓ. ' +
        'Bảng còn thiếu dòng nào thì lượt quét không biết. Mục ND-02 trong sổ chờ ' +
        'ghi đúng chỗ ấy.</p></div>';

    var dx = daXem();
    var moi = t.ds.filter(function (m) { return dx[m.v] !== m.nang; });
    var cu = t.ds.length - moi.length;

    o += canhBao('Máy dò TỪ VỰNG, nên nó KHÔNG phân biệt được một câu DÙNG từ ' +
      'cấm với một câu NHẮC ĐẾN nó. Màn dạy "đừng nói con lười" sẽ bị bắt đúng ở ' +
      'chữ "lười" — và không có dấu hiệu hình thức nào tách hai thứ ấy ra. Đây là ' +
      'giới hạn thật của bộ dò, không phải chỗ chưa tối ưu. Nên: máy chỉ ra, ' +
      'người quyết, và người đánh dấu ĐÃ XEM để lượt sau chỉ hiện chỗ MỚI.',
      'var(--ink-3)');

    o += U.sec('Màn nào nhắc gì',
      moi.length + ' màn chưa xem' + (cu ? ' · ' + cu + ' màn đã đánh dấu' : '') +
      ' · nặng = 3×phán xét + 2×rỗng + 1×nghiệp dư');
    if (cu)
      o += '<div class="row mb" style="gap:10px"><button class="btn" ' +
        'onclick="G.bsXoaDau()">Bỏ hết dấu đã xem</button>' +
        '<span class="sm muted" style="align-self:center">Dấu lưu trên máy này ' +
        'thôi — nó là ghi chú làm việc, không phải quyết định của Học viện.</span></div>';
    o += U.tbl(['Màn', 'Phán xét', 'Rỗng', 'Nghiệp dư', 'Nặng', ''],
      (moi.length ? moi : t.ds).map(function (m) {
        var xong = dx[m.v] === m.nang;
        return ['<a href="#" onclick="G.bsMoMan(\'' + h(m.v) + '\');return false">' +
            h(m.t) + '</a><div class="sm muted">' + h(m.v) + '</div>',
          m.loi.length ? '<b style="color:var(--bad)">' + m.loi.length + '</b>' : '—',
          m.rong.length ? '<b style="color:var(--warn)">' + m.rong.length + '</b>' : '—',
          m.cg.length ? String(m.cg.length) : '—',
          '<b>' + m.nang + '</b>',
          '<button class="btn" onclick="G.bsDanhDau(\'' + h(m.v) + '\',' + m.nang + ')">' +
            (xong ? 'bỏ dấu' : 'đã xem') + '</button>'];
      }));
    if (!moi.length && t.ds.length)
      o += '<div class="card"><p class="sm muted">Mọi màn đang có chỗ nhắc đều đã ' +
        'được đánh dấu là đã xem — bảng trên hiện lại cả danh sách để tra. Màn nào ' +
        'sửa rồi mà chỗ nhắc đổi thì dấu tự mất, vì dấu neo vào MỨC NẶNG chứ không ' +
        'neo vào tên màn.</p></div>';

    var mo = G.bsD.moMan && t.ds.filter(function (x) { return x.v === G.bsD.moMan; })[0];
    if (mo) {
      o += U.sec('Chi tiết · ' + mo.t, mo.v);
      if (mo.loi.length)
        o += U.tbl(['Dòng', 'Câu phán xét', 'Nói thay', 'Vì sao'], mo.loi.map(function (l) {
          return ['<b>' + l.dong + '</b>',
            '<span style="color:var(--bad)">' + h(l.bat) + '</span>',
            '<span style="color:var(--ok)">' + h(l.thay || '') + '</span>',
            '<span class="sm muted">' + h(l.vi || '') + '</span>'];
        }));
      if (mo.rong.length)
        o += U.tbl(['Dòng', 'Câu rỗng', 'Đáng lẽ nằm ở đó'], mo.rong.map(function (r) {
          return ['<b>' + r.dong + '</b>', h(r.bat), '<span class="sm">' + h(r.thay || '') + '</span>'];
        }));
      if (mo.cg.length)
        o += U.tbl(['Dòng', 'Câu nghiệp dư', 'Loại', 'Vì sao'], mo.cg.map(function (c) {
          return ['<b>' + c.dong + '</b>', h(c.bat),
            '<span class="chip">' + h(c.loi || '') + '</span>',
            '<span class="sm muted">' + h(c.vi || '') + '</span>'];
        }));
      o += '<div class="card"><p class="sm muted">Ba bảng trên đọc từ kho, và ' +
        'chúng bắt được thứ chúng CÓ. Một dòng bị bắt không đương nhiên là một ' +
        'dòng sai — "chỉ cần" trong một câu hướng dẫn kỹ thuật là đúng chỗ. Máy ' +
        'chỉ ra, người quyết.</p></div>';
    }
    return o;
  }
  G.bsMoMan = function (v) { G.bsD.moMan = v; veLai(); };

  /* ══ BỘ DÒ TỪ VỰNG KHÔNG PHÂN BIỆT ĐƯỢC "DÙNG" VỚI "NHẮC ĐẾN" ══

     Lượt quét thật cho thấy gần hết chỗ còn lại là màn ĐANG DẠY chính
     luật ấy: "Cháu lười là nhãn; con không lười là gỡ nhãn" ở màn Chuẩn
     ngôn ngữ, "Từ phải tránh: kém · dốt · con nhà người ta" ở màn Tầng
     3–4, "trường rỗng nghĩa là đáng lẽ phải có giá trị" ở sổ tay admin
     — câu cuối còn không nói về người, nó nói về một ô dữ liệu.

     Tôi đã thử hai lớp lọc cấu trúc và cả hai đều hụt: một dòng bảng
     thì cắt được, còn một câu văn nhắc tới từ cấm thì không có dấu hiệu
     hình thức nào tách khỏi một câu văn DÙNG từ cấm. Đây là giới hạn
     thật của bộ dò từ vựng, không phải một chỗ chưa tối ưu.

     Nên thay vì đoán tiếp, máy để người ĐÁNH DẤU ĐÃ XEM. Lượt sau chỉ
     hiện chỗ MỚI. Một báo cáo lặp lại y nguyên bảy mươi sáu dòng mỗi
     tuần thì tới tuần thứ ba không ai mở nữa; một báo cáo chỉ hiện chỗ
     mới thì mở được mãi.

     Dấu ấy lưu trên MÁY NÀY thôi (localStorage) — nó là ghi chú làm
     việc của một người, không phải một quyết định của Học viện. Quyết
     định thì đi qua thang năm cổng. */
  var KHOA_DAXEM = 'gita_bs_daxem';
  function daXem() {
    try { return JSON.parse(localStorage.getItem(KHOA_DAXEM) || '{}'); }
    catch (e) { return {}; }
  }
  function ghiDaXem(o) {
    try { localStorage.setItem(KHOA_DAXEM, JSON.stringify(o)); } catch (e) {}
  }
  G.bsDanhDau = function (v, nang) {
    var o = daXem();
    if (o[v] === nang) delete o[v]; else o[v] = nang;
    ghiDaXem(o); veLai();
  };
  G.bsXoaDau = function () { ghiDaXem({}); veLai(); };

  /* ═══════════ NGĂN · ĐỌC MỘT BUỔI LÀM VIỆC ═══════════

     Đọc chạy ở MÁY CHỦ, khác bộ đọc toàn hệ. Lý do: một bản ghi buổi tư
     vấn là dữ liệu của một nhà thật, và mọi lượt chạm vào nó phải để
     lại dòng nhật ký. Bộ đọc toàn hệ đọc chính màn hình — không có dữ
     liệu của ai trong đó. */
  function nganBuoi() {
    var o = '<div class="card"><b>Máy ĐẾM. Nó không chấm người.</b>' +
      '<p class="sm muted mt">Ba thứ đếm được: buổi đi qua nhịp nào · lượt nào ' +
      'của người làm nghề rơi vào bảng thay lời · cuối buổi có cam kết đo được ' +
      'không. Máy KHÔNG kết luận buổi ấy tốt hay không — một buổi đủ sáu nhịp vẫn ' +
      'có thể hỏng, và một buổi thiếu nhịp CÔNG NHẬN vẫn có thể đúng: có ca chỉ ' +
      'cần nghe.</p>' +
      '<p class="sm muted mt">Ngôn từ chỉ soi lượt của NGƯỜI LÀM NGHỀ. Soi lượt ' +
      'của khách là chấm khách — họ đang kể chuyện nhà mình, và họ có quyền dùng ' +
      'đúng những từ mà nghề này học cách không dùng.</p></div>';

    o += U.sec('Sáu nhịp', 'Neo vào G.KICHBAN_AI đã có — không dựng thang nhịp thứ hai');
    o += U.tbl(['Nhịp', 'Làm gì'], (G.KN_NHIP || []).map(function (n) {
      return ['<b>' + h(n.ma) + ' ' + h(n.ten) + '</b>', '<span class="sm">' + h(n.lam) + '</span>'];
    }));

    o += U.sec('Dán bản ghi buổi', 'Mỗi dòng một lượt, dạng "Coach: …" / "Khách: …"');
    o += '<div class="card">' +
      '<textarea id="bsBuoi" class="inp" rows="12" spellcheck="false" ' +
        'style="font-family:ui-monospace,monospace;font-size:13px;line-height:1.6" ' +
        'placeholder="Coach: Trước khi bắt đầu, anh chị muốn ra về với điều gì rõ nhất?&#10;Khách: ..."' +
        '>' + h(G.bsD.buoiChu || '') + '</textarea>' +
      '<div class="row mt" style="gap:10px;flex-wrap:wrap">' +
      (G.API_CAP_PHEP
        ? '<button class="btn primary" onclick="G.bsDocBuoi()" style="gap:6px">' +
          ic('search') + 'Đọc buổi này</button>'
        : '<span class="sm muted">Chưa nối máy chủ nên chưa đọc được. Bộ đọc buổi ' +
          'chạy ở MÁY CHỦ chứ không ở đây: một bản ghi buổi tư vấn là dữ liệu của ' +
          'một nhà thật, và mọi lượt chạm vào nó phải để lại dòng nhật ký.</span>') +
      '<button class="btn" onclick="G.bsBuoiMau()">Chèn buổi mẫu</button>' +
      '</div></div>';

    var b = G.bsD.buoi;
    if (!b) return o;
    if (!b.ok) return o + canhBao(b.vi || b.error || 'Không đọc được.', 'var(--bad)');

    o += U.sec('Kết quả', b.soLuot + ' lượt · ' + b.luotNghe + ' của người làm nghề · ' +
      b.luotKhach + ' của khách');
    var datLuat = (b.luat || []).filter(function (x) { return x.dat; }).length;
    o += '<div class="grid3">' +
      the('Nhịp đi qua', (6 - ((b.thieuNhip || []).length)) + '/6',
        (b.thieuNhip || []).length ? 'thiếu ' + b.thieuNhip.join(', ') : 'đủ sáu',
        (b.thieuNhip || []).length ? 'var(--warn)' : 'var(--ok)') +
      the('Ba luật', datLuat + '/3', 'buổi chưa xong nếu thiếu',
        datLuat === 3 ? 'var(--ok)' : 'var(--bad)') +
      the('Ngôn từ', String((b.loi || []).length),
        'câu phán xét của người làm nghề',
        (b.loi || []).length ? 'var(--bad)' : 'var(--ok)') +
      '</div>';

    o += U.sec('Ba luật của một buổi', 'Đây KHÔNG phải "buổi tốt" — chúng là "buổi chưa xong"');
    o += '<div class="card">' + (b.luat || []).map(function (l) {
      var kl = (G.KN_HOITHOAI_LUAT || []).filter(function (x) { return x.ma === l.ma; })[0] || {};
      return '<div style="padding:8px 0;border-bottom:1px solid var(--line)">' +
        '<div class="row" style="gap:9px;align-items:flex-start">' +
        '<span style="color:' + (l.dat ? 'var(--ok)' : 'var(--bad)') + ';flex:none">' +
          ic(l.dat ? 'check' : 'x', 'w-4 h-4') + '</span>' +
        '<div><b>' + h(l.ma) + '</b> — ' + h(l.luat) +
        '<div class="sm" style="margin-top:3px;color:' +
          (l.dat ? 'var(--ink-3)' : 'var(--bad)') + '">' + h(l.vi) + '</div>' +
        (kl.vi ? '<div class="sm muted" style="margin-top:3px">' + h(kl.vi) + '</div>' : '') +
        '</div></div></div>';
    }).join('') + '</div>';

    o += U.sec('Buổi đi qua nhịp nào');
    o += U.tbl(['Nhịp', 'Số lượt', 'Lượt đầu', 'Nhận bằng'], (b.nhip || []).map(function (n) {
      return ['<b>' + h(n.ma) + ' ' + h(n.ten) + '</b>',
        n.lan ? '<b style="color:var(--ok)">' + n.lan + '</b>'
              : '<span style="color:var(--bad)">0</span>',
        n.luotDau ? String(n.luotDau) : '—',
        n.theo === 'dauHieu' ? '<span class="chip" style="color:var(--ok)">câu chữ</span>'
          : n.theo === 'hinhThuc' ? '<span class="chip" style="color:var(--warn)">hình thức câu</span>'
          : '—'];
    }));
    o += '<div class="card"><p class="sm muted">Hai lớp nhận nhịp, và máy nói rõ ' +
      'lớp nào bắt được. <b>Câu chữ</b> dò theo bảng cụm từ — chắc, nhưng người ' +
      'nói cùng ý bằng câu khác thì không thấy. <b>Hình thức câu</b> đọc dạng ' +
      'câu (hỏi + có mốc thời gian → đang thu sự việc; hỏi + có "hoặc" → đang mở ' +
      'hướng) — phủ rộng hơn nhưng ĐOÁN nhiều hơn. Gộp hai lớp vào một con số là ' +
      'làm phần đoán trông như phần đo, nên chúng đứng riêng.</p></div>';

    if ((b.loi || []).length) {
      o += U.sec('Câu phán xét trong lượt của người làm nghề');
      o += U.tbl(['Lượt', 'Bắt được', 'Nói thay', 'Vì sao'], b.loi.map(function (l) {
        return ['<b>' + l.luot + '</b>',
          '<span style="color:var(--bad)">' + h(l.bat) + '</span>',
          '<span style="color:var(--ok)">' + h(l.thay || '') + '</span>',
          '<span class="sm muted">' + h(l.vi || '') + '</span>'];
      }));
    }
    if ((b.chuyenGia || []).length) {
      o += U.sec('Câu nghiệp dư', 'Cảnh báo, không chặn');
      o += U.tbl(['Lượt', 'Bắt được', 'Loại'], b.chuyenGia.map(function (c) {
        return ['<b>' + c.luot + '</b>', h(c.bat),
          '<span class="chip">' + h(c.loi || '') + '</span>'];
      }));
    }
    return o;
  }
  G.bsDocBuoi = function () {
    G.bsD.buoiChu = oGiaTri('bsBuoi');
    goi('docBuoi', {chu: G.bsD.buoiChu}).then(function (r) {
      G.bsD.buoi = r; veLai();
    });
  };
  G.bsBuoiMau = function () {
    G.bsD.buoiChu = [
      'Coach: Trước khi bắt đầu — khi kết thúc buổi này, anh chị muốn ra về với điều gì rõ nhất?',
      'Khách: Tôi muốn biết vì sao con cứ phải nhắc mới học.',
      'Coach: Kể cho mình một tình huống cụ thể gần nhất — hôm nào, đang làm gì?',
      'Khách: Tối thứ ba, 19h45, con ném vở khi tôi nhắc bài tập. Tuần này 3 lần rồi.',
      'Coach: Em thấy anh chị vẫn ngồi lại được với con sau mỗi lần như thế — cái đó không dễ.',
      'Coach: Để mình nghe lại — phần nào là điều anh chị chứng kiến, phần nào là suy đoán?',
      'Khách: Chứng kiến là con ném vở. Suy đoán là con lười.',
      'Coach: Giờ anh chị đang có mấy hướng, kể cả hướng chưa làm gì?',
      'Khách: Chắc để con tự chọn giờ học, hoặc cứ nhắc như cũ.',
      'Coach: Trong 24 giờ tới, việc nhỏ nhất anh chị chọn thử là gì, và đo bằng gì?',
      'Khách: Tối nay không nhắc, và ghi lại số lần con tự mở sách.',
      'Coach: Cuối tuần mình gặp lại, anh chị trả lời bằng đúng con số ghi được nhé.'
    ].join('\n');
    G.bsD.buoi = null; veLai();
  };

  /* ═══════════ NGĂN · TỪ ĐIỂN KL08 ═══════════

     Theo tài liệu 3/20 của chủ hệ. Chỗ đáng đọc nhất của ngăn này là
     cột PHẠM VI: nó nói cụm nào sai ở mọi chỗ, cụm nào chỉ sai khi
     đang nói với khách, và cụm nào máy CỐ Ý không dò. */
  var TEN_PHAM = {moi: 'mọi bài', khach: 'chỉ bài cho khách', nhac: 'máy KHÔNG dò'};
  var MAU_PHAM = {moi: 'var(--bad)', khach: 'var(--warn)', nhac: 'var(--ink-4)'};

  function nganTuDien() {
    var o = '<div class="card"><b>' + h(G.KL_MA_VB || '') + ' — tám lớp từ vựng</b>' +
      '<p class="sm muted mt">Nguyên tắc nền của bản đặc tả: <i>"Từ ngữ không chỉ ' +
      'mô tả — từ ngữ tạo hành trình. Một từ sai có thể đóng cánh cửa; một từ ' +
      'đúng có thể mở cả một mùa gió mới."</i></p>' +
      '<p class="sm muted mt">Cột <b>phạm vi</b> là chỗ tôi thêm, và nó là chỗ ' +
      'quan trọng nhất: bảng cấm→thay viết cho LỜI NÓI VỚI KHÁCH. Áp thẳng lên ' +
      'văn nội bộ thì "thất bại", "áp lực", "sai" bắt hàng nghìn dòng — đúng lỗi ' +
      '314 dòng của bản 9.99.44, và ba trăm dòng báo đúng thì lần thứ tư không ' +
      'ai đọc cả báo cáo.</p></div>';

    o += U.sec('Tám lớp KL01–KL08', 'Cột cuối nói máy canh được lớp ấy tới đâu');
    o += U.tbl(['Lớp', 'Tên', 'Nội dung', 'Máy canh'],
      (G.KL_LOP || []).map(function (l) {
        return ['<b>' + h(l.ma) + '</b>', h(l.ten),
          '<span class="sm">' + h(l.noiDung) + '</span>',
          l.mayCanh ? '<span class="sm" style="color:var(--ok)">' + h(l.mayCanh) + '</span>'
            : '<span class="sm" style="color:var(--ink-4)">chưa canh — ' +
              h(l.vi || '') + '</span>'];
      }));

    var dem = {moi: 0, khach: 0, nhac: 0};
    (G.KL_THAY || []).forEach(function (k) { dem[k.pham] = (dem[k.pham] || 0) + 1; });
    o += U.sec('Bảng cấm → thay',
      dem.moi + ' cụm dò ở mọi bài · ' + dem.khach + ' chỉ bài cho khách · ' +
      dem.nhac + ' máy cố ý KHÔNG dò');
    o += U.tbl(['Đừng nói', 'Nói thay', 'Phạm vi', 'Bối cảnh dùng', 'Vì sao'],
      (G.KL_THAY || []).map(function (k) {
        return ['<span style="color:var(--bad)">' + h(k.cam) + '</span>',
          '<span style="color:var(--ok)">' + h(k.thay) + '</span>',
          '<span class="chip" style="color:' + (MAU_PHAM[k.pham] || '') + '">' +
            h(TEN_PHAM[k.pham] || k.pham) + '</span>',
          '<span class="sm">' + h(k.boiCanh || '') + '</span>',
          '<span class="sm muted">' + h(k.vi || '') + '</span>'];
      }));

    var nk = G.KL_NGANKHO || {};
    var tongCo = (nk.khoi || []).reduce(function (a, x) { return a + x.daCo; }, 0);
    var tongCan = (nk.khoi || []).reduce(function (a, x) { return a + x.soCau; }, 0);
    o += U.sec('Ngân khố một nghìn câu', tongCo + '/' + tongCan + ' câu đang có');
    o += canhBao('Bản đặc tả nêu CÔNG THỨC và trích vài câu mẫu, không có đủ ' +
      'một nghìn câu. Sinh ' + (tongCan - tongCo) + ' câu cho đủ số là bịa nội ' +
      'dung chuyên môn của Học viện — đúng thứ luật gốc cấm. Và đây không phải ' +
      'việc của mã: mỗi câu là một lời Học viện nói với một nhà, nên nó phải đi ' +
      'qua thang năm cổng như mọi nội dung khác. Mục KL-02.', 'var(--bad)');
    o += '<div class="card"><p class="sm muted"><b>Công thức:</b> ' +
      h(nk.congThuc || '') + '</p></div>';
    o += U.tbl(['Khối', 'Nội dung', 'Cấu trúc', 'Cần', 'Đang có'],
      (nk.khoi || []).map(function (x) {
        return ['<b>' + h(x.ma) + '</b>', h(x.ten), h(x.cauTruc), String(x.soCau),
          x.daCo ? '<b>' + x.daCo + '</b>'
                 : '<span style="color:var(--bad)">0</span>'];
      }));
    if ((nk.moMan || []).length) {
      o += U.sec('Bảy câu mở màn bản đặc tả trích ra', 'Chép nguyên, không sửa chữ');
      o += '<div class="card">' + U.list(nk.moMan) + '</div>';
    }

    o += U.sec('Ba nhóm người đọc', 'Neo vào G.KN_NGUOIDOC — không dựng bảng thứ hai');
    o += U.tbl(['Mã', 'Nhóm', 'Neo về'], (G.KL_NHOM || []).map(function (n) {
      return ['<b>' + h(n.ma) + '</b>', h(n.ten),
        '<span class="sm muted">' + h(n.neo) + '</span>'];
    }));

    o += U.sec('Chỗ máy dừng lại');
    o += '<div class="card">' + (G.KL_CHOCHU || []).map(function (c) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--line)">' +
        '<b>' + h(c.ma) + '</b> — ' + h(c.viec) +
        '<div class="sm muted" style="margin-top:4px">' + h(c.vi) + '</div></div>';
    }).join('') + '</div>';
    return o;
  }

  /* ═══════════ NGĂN · BỘ MIỄN DỊCH ═══════════

     Theo bản đặc tả phần 3 của chủ hệ: 66 điểm gãy · 13 lỗi chặn phát
     hành · 18 chủng virus.

     Ngăn này ĐỐI CHIẾU, không hứa. Phần lớn mười ba lỗi chặn nằm NGOÀI
     bộ nội dung — đăng ký, ảnh trẻ em, tải Coach, hạ tầng — nên nó nói
     thẳng cái nó không giữ, thay vì ghi "đã xử lý" cho đủ bảng. */
  var MAU_MUC = {chan: 'var(--ok)', motPhan: 'var(--warn)', chua: 'var(--bad)'};
  var TEN_MUC = {chan: 'đã chặn', motPhan: 'mới một phần', chua: 'chưa có gì'};

  function nganMienDich() {
    var o = '<div class="card"><b>Bảng này ĐỐI CHIẾU, không hứa</b>' +
      '<p class="sm muted mt">Bản đặc tả phần 3 khai 66 điểm gãy tám nhóm, ' +
      'trong đó <b>13 lỗi CHẶN PHÁT HÀNH</b>, và 18 chủng virus. Phần lớn mười ' +
      'ba lỗi ấy nằm NGOÀI bộ nội dung — đăng ký, ảnh trẻ em, tải Coach, hạ ' +
      'tầng, truyền thông. Nên chỗ này nói thẳng cái nó KHÔNG giữ, thay vì ghi ' +
      '"đã xử lý" cho đủ bảng: một bảng an toàn ghi 100% mà không ai kiểm được ' +
      'là một lời trấn an, và lời trấn an là thứ nguy hiểm nhất trong một bảng ' +
      'an toàn.</p></div>';

    o += U.sec('Tám nhóm điểm gãy',
      'Cột "đã khai" nói bản đặc tả tôi đọc được mô tả từng mã tới đâu');
    var tongMa = 0, tongKhai = 0;
    (G.MD_NHOM || []).forEach(function (n) { tongMa += n.soMa; tongKhai += n.daKhai; });
    o += U.tbl(['Nhóm', 'Tên', 'Số mã', 'Đã khai', 'Vì sao nhóm này quan trọng'],
      (G.MD_NHOM || []).map(function (n) {
        return ['<b>' + h(n.ma) + '</b>', h(n.ten), String(n.soMa),
          n.daKhai ? '<b>' + n.daKhai + '</b>'
                   : '<span style="color:var(--bad)">0</span>',
          '<span class="sm muted">' + h(n.vi) + '</span>'];
      }));
    o += canhBao('Đã khai ' + tongKhai + '/' + tongMa + ' mã. Tôi KHÔNG bịa ' +
      (tongMa - tongKhai) + ' dòng còn lại cho đủ số: một bảng có dòng bịa thì ' +
      'cả bảng mất tin, và người đọc không phân biệt được dòng nào thật. Chủ hệ ' +
      'gửi bản GITA-AUDIT-V1.0 thì tôi chép nốt — mục MD-01.', 'var(--ink-3)');

    var md = G.bsD.mienDich;
    if (G.API_CAP_PHEP && !md && !G.bsD.dangNapMD) {
      G.bsD.dangNapMD = true;
      goi('soatMienDich', {}).then(function (r) {
        G.bsD.mienDich = r; G.bsD.dangNapMD = false; veLai();
      });
    }

    o += U.sec('Mười ba lỗi chặn phát hành',
      md && md.ok ? md.dem.chan + ' đã chặn · ' + md.dem.motPhan +
        ' một phần · ' + md.dem.chua + ' chưa có gì' : 'kho khai · máy đối chiếu');
    o += U.tbl(['Mã', 'Lỗi', 'Chặn ở đâu', 'Kho đang có', 'Máy đối chiếu'],
      (G.MD_CHAN || []).map(function (c) {
        var d = md && md.ok && md.bang ? md.bang[c.ma] : null;
        return ['<b>' + h(c.ma) + '</b>', h(c.ten),
          '<span class="chip">' + h(c.chanODau) + '</span>',
          c.neo ? '<span class="sm muted">' + h(c.neo) + '</span>'
                : '<span class="sm" style="color:var(--bad)">chưa có gì để trỏ</span>',
          d ? '<b style="color:' + (MAU_MUC[d.muc] || 'var(--ink-3)') + '">' +
              h(TEN_MUC[d.muc] || d.muc) + '</b><div class="sm muted">' +
              h(d.vi) + '</div>'
            : '<span class="sm muted">' +
              (G.API_CAP_PHEP ? 'dang doc...' : 'cần máy chủ để đối chiếu') + '</span>'];
      }));

    o += U.sec('Mười tám chủng virus',
      'Hai cột, hai thứ rất khác nhau — và máy mới canh được một cột');
    o += '<div class="card"><p class="sm muted"><b>Dấu hiệu</b> đọc từ HÀNH VI ' +
      'trong ứng dụng: mở app lúc nào, dừng ở màn nào bao lâu, tích xong trong ' +
      'mấy giây. Kho này chưa thu loại dữ liệu ấy — và thu nó là một quyết định ' +
      'về quyền riêng tư, không phải một việc kỹ thuật: nó đo NGƯỜI DÙNG chứ ' +
      'không đo nội dung (mục MD-02).<br><b>Từ ngữ</b> đọc từ CHỮ trong nội dung ' +
      'Học viện viết ra — cái này đo được ngay, và nó là phần bộ nội dung chịu ' +
      'trách nhiệm.</p></div>';
    o += U.tbl(['Mã', 'Chủng', 'Dấu hiệu hành vi', 'Vắc-xin', 'Máy canh được chữ'],
      (G.MD_VIRUS || []).map(function (v) {
        return ['<b>' + h(v.ma) + '</b>', h(v.ten),
          '<span class="sm muted">' + h(v.dauHieu) + '</span>',
          '<span class="sm">' + h(v.vacXin) + '</span>',
          (v.tuNgu && v.tuNgu.length)
            ? '<span style="color:var(--ok)">' + h(v.tuNgu.join(' · ')) + '</span>'
            : '<span class="sm" style="color:var(--ink-4)">chưa canh được</span>'];
      }));

    var coNuoi = (G.MD_VIRUS || []).filter(function (v) { return v.nuoiBoi; });
    if (coNuoi.length) {
      o += U.sec('Nội dung của chính Học viện nuôi chủng nào',
        'Virus không chỉ đến từ ngoài');
      o += U.tbl(['Chủng', 'Bị nuôi bởi'], coNuoi.map(function (v) {
        return ['<b>' + h(v.ma) + '</b> ' + h(v.ten),
          '<span class="sm">' + h(v.nuoiBoi) + '</span>'];
      }));
    }

    o += U.sec('Chỗ máy dừng lại');
    o += '<div class="card">' + (G.MD_CHOCHU || []).map(function (c) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--line)">' +
        '<b>' + h(c.ma) + '</b> — ' + h(c.viec) +
        '<div class="sm muted" style="margin-top:4px">' + h(c.vi) + '</div></div>';
    }).join('') + '</div>';
    return o;
  }

  /* ═══════════ NGĂN · CHUẨN NGHỀ ═══════════ */
  /* ── Ô CHỐT TRÍCH · ND-04 ──
     Chỉ Super Admin thấy ô này. Ngưỡng KHÁC với cửa xuất (R01–R02) có
     chủ ý: lấy một bản trích là việc vận hành, còn nói "câu này được
     phép dẫn ra ngoài, dẫn theo nguồn này" là một lời khai chỉ chủ hệ
     đứng tên được. */
  function oChotTrich(ma, daChot) {
    var id = 'ct-' + ma;
    return '<div style="padding:10px 0;border-top:1px solid var(--line)">' +
      '<div class="sm" style="font-weight:600;margin-bottom:6px">' +
      (daChot ? 'Chốt lại' : 'Chốt lượt đầu') + ' — sổ chỉ thêm, không sửa dòng cũ' +
      '</div>' +
      '<input id="' + id + '-nguon" class="inp" placeholder="Nguồn thật để dẫn — ' +
        'bỏ trống nếu chốt là KHÔNG được trích" value="' +
        h((daChot && daChot.nguon) || '') + '">' +
      '<input id="' + id + '-lydo" class="inp mt" placeholder="Vì sao chốt như vậy ' +
        '(ít nhất 10 chữ)">' +
      '<div class="row mt" style="gap:8px;flex-wrap:wrap">' +
      '<button class="btn primary" onclick="G.bsChotTrich(\'' + h(ma) + '\',true)">' +
        ic('check') + 'Được trích</button>' +
      '<button class="btn" onclick="G.bsChotTrich(\'' + h(ma) + '\',false)">' +
        ic('x') + 'Không được trích</button>' +
      '</div></div>';
  }

  G.bsChotTrich = function (ma, duoc) {
    var nguon = oGiaTri('ct-' + ma + '-nguon').trim();
    var lyDo = oGiaTri('ct-' + ma + '-lydo').trim();
    if (lyDo.length < 10) {
      U.toast('Lượt chốt phải nói vì sao, ít nhất 10 chữ.', 'err'); return;
    }
    if (duoc && nguon.length < 10) {
      U.toast('Chốt được trích thì phải có nguồn thật. Chốt xong mà cửa vẫn ' +
        'chặn thì lượt chốt ấy không làm được gì.', 'err');
      return;
    }
    goi('chotTrichNghe', {ma: ma, trichDuoc: duoc, nguon: nguon, lyDo: lyDo})
      .then(function (r) {
        if (r && r.ok) G.bsChot = undefined;   /* nạp lại từ sổ, không tự đoán */
        bao(r, (r && r.vi) || 'Đã chốt.');
        veLai();
      });
  };

  function nganChuanNghe() {
    var o = '<div class="card"><b>Năm lĩnh vực, và ba mức chắc chắn khác nhau</b>' +
      '<p class="sm muted mt">Ô <b>Nghề đòi</b> là chuẩn hành nghề có sẵn NGOÀI ' +
      'Học viện — chép phần cốt vào để máy có thứ mà đo, và nó CHƯA phải nội dung ' +
      'đã duyệt của GITA. Dùng để đối chiếu thì được; đưa vào một ấn phẩm thì phải ' +
      'dẫn nguồn thật. Hai ô còn lại neo vào kho đã duyệt.</p>' +
      '<p class="sm muted mt">Từ bản 9.99.46 mục <b>ND-04</b> không còn là một ' +
      'dòng nhắc: cửa xuất chuẩn nghề CHẶN mọi mục chưa chốt được trích và chưa ' +
      'ghi nguồn. Máy KHÔNG tự điền: đó là lời khai của Học viện về nguồn gốc ' +
      'một câu chữ, và một lời khai máy tự viết thì không ai chịu trách nhiệm ' +
      'được.</p>' +
      '<p class="sm muted mt">Và từ bản <b>9.99.49</b> lượt chốt ấy có CHỖ GHI. ' +
      'Trước đó quyết định phải sửa thẳng vào kho gốc rồi phát hành lại — nên ba ' +
      'bản liền không mục nào được chốt, trong khi sổ chờ vẫn ghi "đang chờ chủ ' +
      'hệ". Nay chủ hệ bấm chốt ngay ở đây, máy chủ ghi vào sổ chỉ-thêm, và cửa ' +
      'xuất đọc SỔ ẤY chứ không đọc lượt gọi của máy khách.</p></div>';

    if (G.bsChot === undefined) {
      G.bsChot = null;
      goi('dsChotTrich', {}).then(function (r) {
        G.bsChot = (r && r.ok && r.ds) || {};
        veLai();
      });
    }
    var soChot = G.bsChot || {};

    (G.KN_CHUAN_NGHE || []).forEach(function (c) {
      var ch = soChot[c.ma];
      o += U.sec(c.ma + ' · ' + c.linhVuc, c.neo || '');
      o += '<div class="card">' +
        '<div class="row mb" style="gap:8px;flex-wrap:wrap">' +
        (!ch
          ? '<span class="chip" style="color:var(--bad)">CHƯA chốt · không trích ra ngoài được</span>'
          : (ch.trichDuoc
            ? '<span class="chip" style="color:var(--ok)">trích ra ngoài ĐƯỢC</span>' +
              '<span class="sm muted" style="align-self:center">nguồn: ' +
                h(ch.nguon || '(chưa ghi)') + '</span>'
            : '<span class="chip" style="color:var(--bad)">đã chốt: KHÔNG được trích</span>')) +
        (ch ? '<span class="sm muted" style="align-self:center">' +
          h(ch.boiAi + ' · ' + String(ch.chotLuc || '').slice(0, 10)) + '</span>' : '') +
        '</div>' +
        (ch ? '<p class="sm muted">Lý do đã ghi: ' + h(ch.lyDo || '') + '</p>' : '') +
        (laChuHe() ? oChotTrich(c.ma, ch) : '') +
        '<div style="padding:7px 0"><span class="chip" style="color:var(--ink-3)">' +
          'NGHỀ ĐÒI · nguồn ngoài</span>' +
        '<div style="margin-top:6px;font-size:14.5px;line-height:1.6">' + h(c.ngheDoi) + '</div></div>' +
        '<div style="padding:7px 0;border-top:1px solid var(--line)">' +
          '<span class="chip" style="color:var(--ok)">GITA THÊM</span>' +
        '<div style="margin-top:6px;font-size:14.5px;line-height:1.6">' + h(c.gitaThem) + '</div></div>' +
        '<div style="padding:7px 0;border-top:1px solid var(--line)">' +
          '<span class="chip" style="color:var(--bad)">GITA CẤM</span>' +
        '<div style="margin-top:6px;font-size:14.5px;line-height:1.6">' + h(c.gitaCam) + '</div></div>' +
        '</div>';
    });

    o += U.sec('Năm khung câu của người làm nghề',
      'Neo vào sáu nhịp N1→N6 đã có — không dựng thang nhịp thứ hai');
    o += U.tbl(['Mã', 'Khung', 'Nhịp', 'Mẫu câu', 'Vì sao'],
      (G.KN_KHUNG_CAU || []).map(function (k) {
        return ['<b>' + h(k.ma) + '</b>', h(k.ten),
          '<span class="chip">' + h(k.nhip) + '</span>',
          '<code style="font-size:13px">' + h(k.mau) + '</code>',
          '<span class="sm muted">' + h(k.vi) + '</span>'];
      }));

    o += U.sec('Mười hai câu chuyên gia không nói',
      'CẢNH BÁO, không chặn — phần lớn có chỗ dùng đúng');
    o += U.tbl(['Câu', 'Loại lỗi', 'Nói thay', 'Vì sao'],
      (G.KN_CAM_CHUYENGIA || []).map(function (c) {
        return ['<span style="color:var(--warn)">' + h(c.cau) + '</span>',
          '<span class="chip">' + h(c.loi) + '</span>',
          '<span style="color:var(--ok)">' + h(c.thay) + '</span>',
          '<span class="sm muted">' + h(c.vi || '') + '</span>'];
      }));
    return o;
  }

  /* ═══════════ NGĂN · CHỜ CHỦ HỆ ═══════════

     Ngăn này KHÔNG có bảng riêng. Nó gọi G.ccDocSo() — đúng bộ đo mà
     tools/soat-san-sang.js gọi mỗi lần phát hành. Hai chỗ, một phép đo,
     nên con số ở màn hình và con số lúc phát hành không bao giờ lệch.

     Thứ tự hiện ra có chủ ý: việc CỦA NGƯỜI LÀM lên trước (mục khai sai
     đường đo, mục đã xong mà quên gỡ), rồi mới tới việc của chủ hệ. Xếp
     ngược lại thì chủ hệ đọc một danh sách có lẫn việc không phải của
     mình, và lần thứ ba thì thôi đọc. */
  function nganChoChu() {
    if (!G.ccDocSo) {
      return '<div class="card"><b>Chưa nạp được bộ đo sổ chờ</b>' +
        '<p class="sm muted mt">Thiếu src/cho-chu-he.js.</p></div>';
    }
    var d = G.ccDocSo(), t = G.ccTomTat(d);

    var o = '<div class="card"><b>' + t.tong + ' việc chờ người, trong ' + t.so +
      ' sổ</b>' +
      '<p class="sm muted mt">Đây là những việc <b>không chờ mã</b>. Máy đã làm ' +
      'hết phần của máy ở từng mục, và dừng lại đúng chỗ cần một quyết định của ' +
      'người. Mỗi mục nói rõ <b>điền ở đâu</b> — một dòng nhắc không nói chỗ điền ' +
      'thì người đọc phải đi hỏi, và thường là không hỏi.</p>' +
      '<div class="row mt" style="gap:8px;flex-wrap:wrap">' +
      U.chip(t.chua + ' còn chờ · đo được', 'var(--warn)') +
      U.chip(t.khongDo + ' máy không đo được', 'var(--ink-3)') +
      U.chip(t.chuaKhai + ' sổ cũ chưa khai cách đo', 'var(--ink-3)') +
      (t.xong ? U.chip(t.xong + ' ĐÃ XONG mà chưa gỡ', 'var(--bad)') : '') +
      (t.hong ? U.chip(t.hong + ' khai sai đường đo', 'var(--bad)') : '') +
      '</div></div>';

    var loi = [];
    d.forEach(function (s) {
      s.muc.forEach(function (m) {
        if (m.ket.trang === 'hong' || m.ket.trang === 'xong') loi.push({s: s.so, m: m});
      });
    });
    if (loi.length) {
      o += U.sec('Việc của người làm, không phải của chủ hệ',
        'Bộ soát sẵn sàng tính những dòng này là CHỖ THIẾU, nên chúng chặn phát hành');
      o += loi.map(function (x) {
        return '<div class="card" style="border-color:var(--bad)">' +
          '<b>' + h(x.m.muc.ma || x.s) + '</b> · ' + h(x.m.muc.viec || '') +
          '<p class="sm mt" style="color:var(--bad)">' +
          (x.m.ket.trang === 'xong'
            ? 'Đo được ' + h(x.m.ket.so) + ' — việc đã xong mà mục vẫn nằm trong ' +
              h(x.s) + '. Gỡ dòng ấy khỏi kho rồi đóng gói lại.'
            : h(x.m.ket.vi || '')) + '</p></div>';
      }).join('');
    }

    d.forEach(function (s) {
      var conCho = s.muc.filter(function (m) { return m.ket.trang !== 'xong' && m.ket.trang !== 'hong'; });
      if (!conCho.length) return;
      o += U.sec(s.so, conCho.length + ' mục');
      o += conCho.map(function (m) {
        var k = m.ket, mu = m.muc;
        var nhan = k.trang === 'chua'
          ? U.chip(k.so + ' · ' + k.con, 'var(--warn)')
          : (k.trang === 'khongDo'
            ? U.chip('máy không đo được', 'var(--ink-3)')
            : U.chip('chưa khai cách đo', 'var(--ink-3)'));
        return '<div class="card">' +
          '<div class="row mb" style="gap:8px;flex-wrap:wrap">' +
          (mu.ma ? '<b>' + h(mu.ma) + '</b>' : '') + nhan + '</div>' +
          (mu.viec ? '<div style="font-size:15px;font-weight:600">' + h(mu.viec) + '</div>' : '') +
          '<p class="sm muted mt" style="line-height:1.65">' + h(mu.vi || mu.hoi || '') + '</p>' +
          (mu.noiDien
            ? '<p class="sm mt" style="color:var(--teal)">Điền tại: ' + h(mu.noiDien) + '</p>'
            : '') +
          (k.trang === 'khongDo'
            ? '<p class="sm muted mt">Vì sao máy không đo được: ' + h(k.vi) + '</p>'
            : '') +
          (k.ten && k.ten.length
            ? '<p class="sm muted mt">Còn thiếu: ' + h(k.ten.slice(0, 12).join(' · ')) +
              (k.ten.length > 12 ? ' …' : '') + '</p>'
            : '') +
          '</div>';
      }).join('');
    });
    return o;
  }

  /* ═══════════ NGĂN 1 · SOẠN ═══════════ */
  function nganSoan() {
    var d = G.bsD;
    var s = G.bsSoat(d.chu, d.khuon, d.doiTuong);
    var soKhoi = dsKhoiCua(d.khuon).length;
    var duKhoi = soKhoi - s.doc.thieu.length;

    var khDang = (G.KN_KHUON || []).filter(function (k) {
      return k.ma === d.khuon; })[0] || {};
    var o = '<div class="card"><b>Máy dựng khuôn và ĐO. Nó không viết hộ.</b>' +
      '<p class="sm muted mt"><b>' + h(khDang.ten || '') + '</b> — ' +
      h(khDang.lam || '') + (khDang.vi ? ' ' + h(khDang.vi) : '') + '</p>' +
      '<p class="sm muted mt">Bốn khuôn, mỗi khuôn một danh sách khối riêng. Một ' +
      'quy trình vận hành nhét vào khuôn bài học thì phải điền "Chìa khoá kim ' +
      'cương" cho một cái quy trình, và người viết sẽ điền cho có — khuôn sai ' +
      'loại tệ hơn không khuôn.</p>' +
      '<p class="sm muted mt">' +
      'Máy đếm được khối nào có, khối nào đòi khối nào mà không có, dòng nào ' +
      'rỗng, dòng nào phán xét — và nó chỉ ra ĐÚNG SỐ DÒNG. Nội dung chuyên môn ' +
      'là việc của người viết: máy không tự nghĩ ra một câu nào (luật gốc ' +
      '<i>không suy diễn</i>).</p>' +
      '<p class="sm muted mt">Phép đo ở màn này chạy tại chỗ để anh thấy ngay, ' +
      'nhưng nó KHÔNG phải cổng — máy chủ mới là chỗ chặn. Nó đọc thẳng bản gốc ' +
      'trong kho, không đọc một bản chép.</p></div>';

    /* ── Ô nhập ── */
    o += U.sec('Bài đang soạn');
    o += '<div class="card">' +
      '<div class="row" style="gap:10px;flex-wrap:wrap">' +
      '<input id="bsTieuDe" class="inp grow" placeholder="Tiêu đề bài" ' +
        'value="' + h(d.tieuDe) + '" oninput="G.bsGhi()">' +
      '<select id="bsKhuon" class="inp" style="max-width:200px" onchange="G.bsDoiKhuon()">' +
      (G.KN_KHUON || []).map(function (k) {
        return '<option value="' + h(k.ma) + '"' + (d.khuon === k.ma ? ' selected' : '') +
          '>' + h(k.ten) + '</option>';
      }).join('') + '</select>' +
      '<select id="bsDoiTuong" class="inp" style="max-width:190px" onchange="G.bsDoiKhuon()">' +
      '<option value="noiBo"' + (d.doiTuong === 'noiBo' ? ' selected' : '') +
        '>Viết cho NỘI BỘ</option>' +
      '<option value="khach"' + (d.doiTuong === 'khach' ? ' selected' : '') +
        '>Viết cho KHÁCH</option></select>' +
      '<select id="bsTang" class="inp" style="max-width:120px" onchange="G.bsGhi()">' +
      ['T1', 'T2', 'T3', 'T4', 'T5'].map(function (t) {
        return '<option value="' + t + '"' + (d.tang === t ? ' selected' : '') + '>' + t + '</option>';
      }).join('') + '</select>' +
      '<button class="btn" onclick="G.bsMau()" style="gap:6px">' + ic('plus') + 'Chèn khuôn trống</button>' +
      '<button class="btn" onclick="G.bsViDu()" style="gap:6px">' + ic('book') + 'Chèn bài mẫu</button>' +
      '</div>' +
      '<textarea id="bsChu" class="inp mt" rows="16" spellcheck="false" ' +
        'style="font-family:ui-monospace,monospace;font-size:13px;line-height:1.6" ' +
        'placeholder="Mỗi khối mở bằng một dòng dạng  K01 |  rồi viết ở các dòng dưới." ' +
        'oninput="G.bsGhi()">' + h(d.chu) + '</textarea>' +
      '</div>';

    /* ── Kết quả đo ── */
    o += U.sec('Máy đo được gì', duKhoi + '/' + soKhoi + ' khối · ' +
      s.rong.length + ' câu rỗng · ' + s.loi.length + ' câu phán xét · ' +
      s.cg.length + ' câu nghiệp dư');

    o += '<div class="grid3">' +
      the('Khối', duKhoi + '/' + soKhoi,
        s.doc.thieu.length ? 'thiếu ' + s.doc.thieu.join(', ') : 'đủ',
        s.doc.thieu.length ? 'var(--bad)' : 'var(--ok)') +
      the('Câu phán xét', String(s.loi.length),
        s.loi.length ? 'chặn ở cổng 1' : 'sạch',
        s.loi.length ? 'var(--bad)' : 'var(--ok)') +
      the('Cổng 1', s.quaCong1 ? 'QUA' : 'CHẶN',
        s.quaCong1 ? 'nộp được' : 'sửa rồi nộp',
        s.quaCong1 ? 'var(--ok)' : 'var(--bad)') +
      '</div>';

    if (s.doc.trong.length)
      o += canhBao('Dấu mở khối có mà ruột để trống: ' + s.doc.trong.join(', ') +
        '. Máy đếm CHỮ chứ không đếm dấu mở — gõ đủ hai mươi bốn dấu mà bỏ ' +
        'trống ruột thì vẫn tính là thiếu.', 'var(--warn)');

    if (s.doi.length)
      o += canhBao('Khối đòi khối: ' + s.doi.map(function (p) {
        return p.khoi + ' ' + p.ten + ' → thiếu ' + p.can + ' ' + p.tenCan;
      }).join(' · ') + '. Đây là chỗ chín trong mười luật chống nội dung rỗng ' +
        'thành phép đo: "bài tập không có sản phẩm" là câu ai cũng gật, còn ' +
        'K14 đòi K15 thì máy chỉ ra được.', 'var(--bad)');

    if (s.loi.length) {
      o += U.sec('Câu phán xét — cổng 1 chặn', 'Mỗi dòng kèm câu NÓI THAY và vì sao');
      o += U.tbl(['Dòng', 'Bắt được', 'Nói thay', 'Vì sao'], s.loi.map(function (l) {
        return ['<b>' + l.dong + '</b>', h(l.bat),
          '<span style="color:var(--ok)">' + h(l.thay || '') + '</span>',
          '<span class="sm muted">' + h(l.vi || '') + '</span>'];
      }));
    }
    if (s.kl && s.kl.length) {
      o += U.sec('Lệch từ điển KL08 — cảnh báo, không chặn',
        d.doiTuong === 'khach'
          ? 'Bài viết CHO KHÁCH nên dò cả lớp `khach`'
          : 'Bài NỘI BỘ nên chỉ dò lớp `moi` — chọn "Viết cho KHÁCH" để dò đủ');
      o += U.tbl(['Dòng', 'Cụm cấm', 'Nói thay', 'Bối cảnh'], s.kl.map(function (k) {
        return ['<b>' + k.dong + '</b>',
          '<span style="color:var(--warn)">' + h(k.bat) + '</span>',
          '<span style="color:var(--ok)">' + h(k.thay) + '</span>',
          '<span class="sm muted">' + h(k.boiCanh || '') + '</span>'];
      }));
    }
    if (s.vr && s.vr.length) {
      o += U.sec('Chỗ NUÔI chủng virus — cảnh báo, không chặn',
        'Virus không chỉ đến từ ngoài: nội dung của chính Học viện nuôi được chúng');
      o += U.tbl(['Dòng', 'Bắt được', 'Chủng'], s.vr.map(function (v) {
        return ['<b>' + v.dong + '</b>',
          '<span style="color:var(--warn)">' + h(v.bat) + '</span>',
          '<b>' + h(v.ma) + '</b> ' + h(v.ten)];
      }));
    }
    if (s.cg.length) {
      o += U.sec('Câu nghiệp dư — CẢNH BÁO, không chặn',
        'Phần lớn những câu này có chỗ dùng đúng; máy chỉ ra, người quyết');
      o += U.tbl(['Dòng', 'Bắt được', 'Loại lỗi', 'Vì sao'], s.cg.map(function (c) {
        return ['<b>' + c.dong + '</b>',
          '<span style="color:var(--warn)">' + h(c.bat) + '</span>',
          '<span class="chip">' + h(c.loi || '') + '</span>',
          '<span class="sm muted">' + h(c.vi || '') + '</span>'];
      }));
    }
    if (s.rong.length) {
      o += U.sec('Câu rỗng', 'Không sai — chỉ không mang thông tin nào');
      o += U.tbl(['Dòng', 'Bắt được', 'Đáng lẽ nằm ở đó'], s.rong.map(function (r) {
        return ['<b>' + r.dong + '</b>', h(r.bat),
          '<span class="sm">' + h(r.thay || '') + '</span>'];
      }));
    }
    if (!s.nhan.length && String(d.chu || '').trim().length > 40)
      o += canhBao('Không dòng nào mang nhãn nguồn. Bốn nhãn: ' +
        (G.KN_NGUON || []).map(function (n) { return n.nhan; }).join(' · ') +
        '. Đây là phép đo YẾU — nó đếm bài có nhãn nào không, chứ không biết ' +
        'câu nào đáng lẽ phải có nhãn.', 'var(--warn)');

    if (d.khuon !== 'BAIHOC') {
      var bangK = (G.KN_DIEM_KHUON || {})[d.khuon] || [];
      var tranK = bangK.reduce(function (a, q) {
        return a + (q.ai === 'may' ? q.trong : (q.tranMay || 0)); }, 0);
      o += canhBao('Khuôn ' + h(khDang.ten || '') + ' có THANG RIÊNG. Máy chấm ' +
        tranK + '/100; phần còn lại đo thứ chỉ người đọc mới thấy, và máy bỏ ' +
        'trống chứ không đoán. Mười điều kiện hoàn thành KHÔNG áp ở đây — thang ' +
        'ấy đo NGƯỜI HỌC, mà một quy trình vận hành không có người học.',
        'var(--ink-3)');
      o += U.sec('Thang một trăm của khuôn ' + h(khDang.ten || ''),
        'Chiều nào có PHÉP ĐO thì máy đo lặp lại được; chiều nào không thì người chấm');
      o += U.tbl(['Chiều', 'Ai chấm', 'Trần máy', 'Câu hỏi', 'Máy đo bằng'],
        bangK.map(function (q) {
          var mau = q.ai === 'may' ? 'var(--ok)' : q.ai === 'ca' ? 'var(--warn)' : 'var(--ink-3)';
          var tenAi = q.ai === 'may' ? 'máy' : q.ai === 'ca' ? 'máy + người' : 'người';
          return ['<b>' + h(q.ma) + '</b> ' + h(q.ten),
            '<span style="color:' + mau + '">' + h(tenAi) + '</span>',
            String(q.ai === 'may' ? q.trong : (q.tranMay || 0)) + '/' + q.trong,
            '<span class="sm muted">' + h(q.hoi || '') + '</span>',
            q.phep ? '<code style="font-size:12px">' +
              h(q.phep.map(function (x) { return x[0]; }).join(' · ')) + '</code>'
              : '<span class="sm muted">—</span>'];
        }));
      return o + nopKhoi(d, s);
    }

    /* ── Mười điều kiện hoàn thành ── */
    o += U.sec('Mười điều kiện hoàn thành',
      'Thang đo NGƯỜI HỌC — tính riêng, không cộng vào điểm');
    o += '<div class="card">' + s.xong.map(function (x) {
      return '<div class="row" style="gap:9px;padding:5px 0;align-items:flex-start">' +
        '<span style="color:' + (x.dat ? 'var(--ok)' : 'var(--ink-4)') + ';flex:none">' +
        ic(x.dat ? 'check' : 'dot', 'w-4 h-4') + '</span>' +
        '<span style="font-size:14px' + (x.dat ? '' : ';color:var(--ink-3)') + '">' +
        '<b>' + h(x.ma) + '</b> · ' + h(x.dieu) +
        (x.dat ? '' : ' <span class="sm muted">— thiếu ' + h(x.thieu.join(', ')) + '</span>') +
        '</span></div>';
    }).join('') + '</div>';

    /* ── Chấm: máy 60, người 40 ── */
    o += U.sec('Thang một trăm', 'Máy chấm sáu chiều. Bốn chiều còn lại máy KHÔNG đoán.');
    o += '<div class="card"><p class="sm muted">Máy chấm được <b>60/100</b>. Bốn ' +
      'chiều — chiều sâu, cá nhân hoá, dùng lại được, và phần có giá trị của chìa ' +
      'khoá kim cương — không có dữ liệu nào để đo, nên máy BỎ TRỐNG chứ không ' +
      'đoán, và nó không cộng ra tổng khi còn ô trống. Cộng ra một con số trong ' +
      'lúc bốn ô còn trống là dựng một con số trông như đã xong.</p>' +
      U.tbl(['Chiều', 'Ai chấm', 'Trần máy', 'Câu hỏi'],
        (G.KN_DIEM || []).map(function (q) {
          var mau = q.ai === 'may' ? 'var(--ok)' : q.ai === 'ca' ? 'var(--warn)' : 'var(--ink-3)';
          var tenAi = q.ai === 'may' ? 'máy' : q.ai === 'ca' ? 'máy + người' : 'người';
          return ['<b>' + h(q.ma) + '</b> ' + h(q.ten),
            '<span style="color:' + mau + '">' + h(tenAi) + '</span>',
            String(q.ai === 'may' ? q.trong : (q.tranMay || 0)) + '/' + q.trong,
            '<span class="sm muted">' + h(q.hoi || '') + '</span>'];
        })) + '</div>';

    return o + nopKhoi(d, s);
  }

  function nopKhoi(d, s) {
    var o = U.sec('Nộp vào thang năm cổng');
    o += '<div class="card">' +
      (G.API_CAP_PHEP
        ? '<div class="row" style="gap:10px;flex-wrap:wrap">' +
          '<button class="btn primary" onclick="G.bsNap()" style="gap:6px">' +
            ic('check') + 'Lưu bản nháp lên máy chủ</button>' +
          '<button class="btn" onclick="G.bsNop()" style="gap:6px"' +
            (s.quaCong1 ? '' : ' disabled title="Máy đang chặn — sửa rồi nộp"') + '>' +
            ic('arrow') + 'Nộp qua cổng 1</button>' +
          (d.id ? '<span class="chip">mã bài ' + h(d.id) + '</span>' : '') +
          '</div>' +
          '<p class="sm muted mt">Nạp và nộp là hai việc khác nhau. Gộp chúng thì ' +
          'không ai sửa được bản nháp của mình. Và sửa nội dung sau khi đã có chữ ' +
          'ký thì MỌI chữ ký cũ hết hiệu lực, bài về bản nháp — luật L4.</p>'
        : '<p class="sm muted">Chưa nối máy chủ, nên chưa nộp được. Phép đo ở trên ' +
          'vẫn chạy đủ: nó chạy trong máy này và đọc thẳng kho.<br>' +
          'Nối ở <b>Quản trị trang → Nối máy chủ</b>.</p>') +
      '</div>';
    return o;
  }

  function the(ten, so, phu, mau) {
    return '<div class="card"><div class="sm muted">' + h(ten) + '</div>' +
      '<div style="font-size:26px;font-weight:700;color:' + mau + ';margin-top:4px">' +
      h(so) + '</div><div class="sm muted">' + h(phu) + '</div></div>';
  }
  function canhBao(chu, mau) {
    return '<div class="card mt" style="border-color:' + mau + '40">' +
      '<div class="row" style="gap:9px;align-items:flex-start">' +
      '<span style="color:' + mau + ';flex:none">' + ic('shield', 'w-4 h-4') + '</span>' +
      '<span style="font-size:14px;line-height:1.55">' + h(chu) + '</span></div></div>';
  }

  /* ── Ghi ô nhập vào bộ nhớ tạm, không gọi render (gõ mà vẽ lại thì
       mất chỗ con trỏ). Chỉ vẽ lại khi người dùng ngừng gõ. ── */
  var hen = null;
  G.bsGhi = function () {
    G.bsD.chu = oGiaTri('bsChu');
    G.bsD.tieuDe = oGiaTri('bsTieuDe');
    G.bsD.tang = oGiaTri('bsTang') || 'T1';
    G.bsD.khuon = oGiaTri('bsKhuon') || G.bsD.khuon || 'BAIHOC';
    G.bsD.doiTuong = oGiaTri('bsDoiTuong') || G.bsD.doiTuong || 'noiBo';
    if (hen) clearTimeout(hen);
    hen = setTimeout(function () {
      /* Giữ chỗ con trỏ qua lượt vẽ lại: không giữ thì gõ tới chữ thứ
         hai mươi là con trỏ nhảy về đầu ô, và không ai gõ tiếp được. */
      var el = document.getElementById('bsChu');
      var vt = el ? el.selectionStart : null;
      veLai();
      var el2 = document.getElementById('bsChu');
      if (el2 && vt !== null) { el2.focus(); el2.setSelectionRange(vt, vt); }
    }, 450);
  };

  G.bsDoiKhuon = function () {
    G.bsD.khuon = oGiaTri('bsKhuon') || 'BAIHOC';
    G.bsD.doiTuong = oGiaTri('bsDoiTuong') || 'noiBo';
    veLai();
  };

  G.bsMau = function () {
    G.bsD.chu = dsKhoiCua(G.bsD.khuon).map(function (k) {
      return k.ma + ' | ' + k.ten + '\n' + (k.hoi ? '' : '') + '\n';
    }).join('');
    veLai();
  };

  /* Bài mẫu ĐỦ hai mươi bốn khối. Nó ở đây chứ không ở trong kho vì nó
     là một VÍ DỤ VỀ KHUÔN, không phải nội dung của Học viện — nội dung
     đã duyệt nằm trong kho và đi qua thang năm cổng. */
  G.bsViDu = function () {
    G.bsD.khuon = 'BAIHOC';
    G.bsD.tieuDe = 'Bảy ngày nhìn cho đúng';
    G.bsD.tang = 'T1';
    G.bsD.chu = [
      'K01 | Tên bài', 'Bảy ngày nhìn cho đúng — chưa sửa gì cả.',
      'K02 | Chìa khoá kim cương',
      'Đừng đo việc học bằng số giờ ngồi bàn. Đo bằng thứ tạo ra được.',
      'K03 | Mục tiêu', 'Ghi được ba dòng mỗi tối, đủ năm trong bảy tối.',
      'K04 | Vì sao quan trọng', 'Không ghi thì tuần sau cả nhà cãi nhau bằng trí nhớ.',
      'K05 | Vấn đề thật', 'Tối nào cũng nhắc học. Nhắc xong vẫn thế.',
      'K06 | Insight', '[KHO GITA] Nhắc nhiều làm việc học thành việc của bố mẹ.',
      'K07 | Bản chất', 'Người nhắc đang giữ trách nhiệm thay người học.',
      'K08 | Khung tư duy', 'Bốn trụ G–I–T–A, đọc theo thứ tự, không nhảy cóc.',
      'K09 | Ví dụ', 'Nhà A: 19h30 mở sách, 19h45 cầm điện thoại. Bảy tối như một.',
      'K10 | Ca thật', 'Nhà B chạy bảy tối. Tối thứ tư quên, và vẫn ghi là quên.',
      'K11 | Sai lầm thường gặp', 'Ghi kèm nhận xét. Ghi kèm nhận xét là đang chấm.',
      'K12 | Công cụ', 'Bảng ba dòng: giờ bắt đầu, việc, chỗ dừng.',
      'K13 | Hướng dẫn dùng', 'Điền sau bữa tối, mất chừng hai phút.',
      'K14 | Bài tập', 'Ghi đủ bảy tối, không bỏ tối nào.',
      'K15 | Sản phẩm đầu ra', 'Một bảng bảy dòng, có chữ của chính học viên.',
      'K16 | KPI', 'Mốc nền: 0 tối. Đích: 5 trên 7 tối có đủ ba dòng.',
      'K17 | Bảng theo dõi', 'Treo ở chỗ cả nhà đi qua mỗi ngày.',
      'K18 | Phản tư', 'Tối nào dễ ghi nhất? Vì sao tối ấy dễ hơn sáu tối kia?',
      'K19 | Câu hỏi coach', 'Điều gì làm tối thứ tư khác sáu tối còn lại?',
      'K20 | Việc 24 giờ', 'Tối nay ghi 3 dòng, không thêm một nhận xét nào.',
      'K21 | Việc 7 ngày', 'Lặp 7 tối liền. Ghi cả tối quên.',
      'K22 | Tiêu chí đạt chuẩn', 'Đủ 5 trên 7 tối, và không dòng nào có nhận xét.',
      'K23 | Điều đọng lại', 'Nhìn trước, sửa sau. Ghi cả cái quên.',
      'K24 | Thử thách', 'Tuần tới học viên tự ghi, người lớn không nhắc một lần nào.'
    ].join('\n');
    veLai();
  };

  /* ═══════════ CỬA MÁY CHỦ ═══════════ */
  function goi(fn, than) {
    if (!G.goiMayChu)
      return Promise.resolve({ok: false, error: 'Chưa nối máy chủ.'});
    return G.goiMayChu(fn, than || {});
  }
  function bao(d, cauXong) {
    if (d && d.ok) { U.toast(cauXong || 'Xong.', 'ok'); return true; }
    U.toast((d && (d.vi || d.error)) || 'Không gọi được máy chủ.', 'err');
    return false;
  }

  G.bsNap = function () {
    var d = G.bsD;
    goi('napBai', {id: d.id || undefined, tieuDe: d.tieuDe, chu: d.chu,
      tang: d.tang, khuon: d.khuon, doiTuong: d.doiTuong})
      .then(function (r) {
        if (r && r.ok) { G.bsD.id = r.id; G.bsD.thang = null; }
        bao(r, 'Đã lưu bản nháp · ' + ((r && r.id) || ''));
        /* U.toast chỉ có hai kiểu: 'ok' và 'err'. Truyền 'warn' thì nó rơi
           vào nhánh mặc định và vẽ dấu TÍCH lên một câu cảnh báo — người đọc
           thấy dấu tích trước khi đọc chữ, và họ đọc ra là "xong rồi". */
        if (r && r.vi) U.toast(r.vi, 'err');
        veLai();
      });
  };
  G.bsNop = function () {
    if (!G.bsD.id) { U.toast('Lưu bản nháp trước đã.', 'err'); return; }
    goi('nopBai', {id: G.bsD.id}).then(function (r) {
      if (r && r.ok) { G.bsNgan = 'thang'; G.bsD.thang = null; }
      bao(r, 'Qua cổng 1. Còn bốn cổng người.');
      veLai();
    });
  };
  G.bsKy = function (viec) {
    if (!G.bsD.id) return;
    var lyDo = '';
    if (viec === 'tuChoi') {
      lyDo = String(window.prompt('Từ chối thì phải nói vì sao (ít nhất 10 chữ):') || '');
      if (lyDo.trim().length < 10) {
        U.toast('Chưa đủ lý do. Không nói thì người viết sửa mò rồi nộp lại y hệt.', 'err');
        return;
      }
    }
    goi('kyBai', {id: G.bsD.id, viec: viec, lyDo: lyDo}).then(function (r) {
      G.bsD.thang = null;
      bao(r, (r && r.vi) || 'Đã ghi.');
      veLai();
    });
  };
  G.bsXemThang = function (id) {
    G.bsD.id = id; G.bsD.thang = null; G.bsNgan = 'thang'; veLai();
  };

  /* ═══════════ NGĂN 2 · THANG NĂM CỔNG ═══════════ */
  function nganThang() {
    var d = G.bsD;
    var o = '<div class="card"><b>Năm cổng, và không cổng nào bỏ qua được</b>' +
      '<p class="sm muted mt">Máy chặn ở cổng 1 bằng SỐ. Bốn cổng còn lại là người ' +
      'ký, và <b>một người ký nhiều nhất MỘT cổng</b> trên một bài — nếu không thì ' +
      'một người ký được cả bốn, thang năm cổng thành một chữ ký, mà sổ vẫn đủ năm ' +
      'dòng nên không ai đọc ra.</p></div>';

    o += U.sec('Năm cổng');
    o += U.tbl(['Cổng', 'Ai ký', 'Kiểm cái gì', 'Chặn ở đâu'],
      (G.KN_CONG || []).map(function (c) {
        return ['<b>' + h(c.ma) + '</b> ' + h(c.ten),
          '<span class="chip">' + h(c.ai) + '</span>',
          '<span class="sm">' + h(c.kiem) + '</span>',
          '<span class="sm muted">' + h(c.chan) + '</span>'];
      }));

    o += U.sec('Năm luật cứng');
    o += '<div class="card">' + (G.KN_LUAT_THANG || []).map(function (l) {
      return '<div style="padding:7px 0;border-bottom:1px solid var(--line)">' +
        '<b>' + h(l.ma) + '</b> — ' + h(l.luat) +
        '<div class="sm muted" style="margin-top:3px">' + h(l.vi || '') + '</div></div>';
    }).join('') + '</div>';

    if (!d.id)
      return o + canhBao('Chưa chọn bài nào. Mở ngăn KHO BÀI rồi bấm một bài, ' +
        'hoặc lưu bản nháp ở ngăn SOẠN.', 'var(--ink-3)');

    if (!d.thang) {
      if (G.API_CAP_PHEP && !d.dangNapThang) {
        d.dangNapThang = true;
        goi('soKyBai', {id: d.id}).then(function (r) {
          G.bsD.thang = r; G.bsD.dangNapThang = false; veLai();
        });
      }
      return o + '<div class="card mt"><p class="sm muted">' +
        (G.API_CAP_PHEP ? 'Đang đọc sổ ký của bài ' + h(d.id) + '…'
          : 'Chưa nối máy chủ nên không đọc được sổ ký. Bảng năm cổng và năm ' +
            'luật ở trên đọc từ kho, nên vẫn xem được.') + '</p></div>';
    }
    var t = d.thang;
    if (!t.ok) return o + canhBao((t.vi || t.error || 'Không đọc được sổ ký.'), 'var(--bad)');

    o += U.sec('Bài ' + t.id, t.tieuDe);
    o += '<div class="grid3">' +
      the('Đang ở', tenBac(t.trangThai), 'cổng hiện tại', MAU_BAC[t.trangThai] || 'var(--ink-3)') +
      the('Đã ký', String((t.nguoiDaKy || []).length), 'chữ ký còn hiệu lực', 'var(--ok)') +
      the('Vân tay', String(t.vanTay || '').slice(0, 8), 'bản đang nằm trong sổ', 'var(--ink-2)') +
      '</div>';

    if (t.canhBao) o += canhBao(t.canhBao, 'var(--bad)');

    o += U.sec('Sổ ký', 'Chỉ thêm — không sửa, không xoá một dòng nào');
    o += U.tbl(['Cổng', 'Việc', 'Ai', 'Vai lúc ký', 'Ghi chú', 'Còn hiệu lực'],
      (t.so || []).map(function (k) {
        return ['<b>' + h(k.cong) + '</b>',
          '<span style="color:' + (k.viec === 'ky' ? 'var(--ok)' : 'var(--bad)') + '">' +
            h(k.viec === 'ky' ? 'ký' : 'từ chối') + '</span>',
          h(k.boiAi), h(k.vaiLuc),
          '<span class="sm muted">' + h(k.ghiChu || '') + '</span>',
          k.conHieuLuc ? '<span style="color:var(--ok)">còn</span>'
                       : '<span style="color:var(--bad)">HẾT</span>'];
      }));

    var laCong = ['bienTap', 'chuyenMon', 'giuChuan', 'chuHe']
      .indexOf(t.trangThai) >= 0;
    if (laCong)
      o += '<div class="card mt"><div class="row" style="gap:10px;flex-wrap:wrap">' +
        '<button class="btn primary" onclick="G.bsKy(\'ky\')" style="gap:6px">' +
          ic('check') + 'Ký cổng ' + h(bacRaCong(t.trangThai)) + '</button>' +
        '<button class="btn" onclick="G.bsKy(\'tuChoi\')" style="gap:6px">' +
          ic('x') + 'Từ chối, kèm lý do</button>' +
        '</div><p class="sm muted mt">Máy sẽ chặn nếu anh là người viết bài này ' +
        '(luật L2), hoặc đã ký một cổng khác của chính bài này (luật L3), hoặc ' +
        'chưa có quyền ký cổng ấy.</p></div>';
    return o;
  }
  function bacRaCong(bac) {
    return {may: 'C1', bienTap: 'C2', chuyenMon: 'C3', giuChuan: 'C4', chuHe: 'C5'}[bac] || '';
  }

  /* ═══════════ NGĂN 3 · KHO BÀI ═══════════ */
  function nganKho() {
    var o = '<div class="card"><b>Mọi bài, và bài nào đang treo</b>' +
      '<p class="sm muted mt">Đồng hồ treo đo từ lúc bài VÀO CỔNG, không đo từ ' +
      'lúc viết: một bài nằm ba ngày ở cổng 2 rồi qua nhanh bốn cổng sau thì chỗ ' +
      'tắc là cổng 2, mà đo từ lúc viết thì không thấy. Quá hạn KHÔNG chặn bài — ' +
      'chặn một bài vì người duyệt bận là phạt nhầm người.</p></div>';

    if (!G.API_CAP_PHEP)
      return o + canhBao('Chưa nối máy chủ nên chưa đọc được kho bài. ' +
        'Nối ở Quản trị trang → Nối máy chủ.', 'var(--ink-3)');

    if (!G.bsD.treo && !G.bsD.dangNapTreo) {
      G.bsD.dangNapTreo = true;
      goi('baiTreo', {}).then(function (r) {
        G.bsD.treo = r; G.bsD.dangNapTreo = false; veLai();
      });
      return o + '<div class="card mt"><p class="sm muted">Đang đọc…</p></div>';
    }
    var t = G.bsD.treo || {};
    o += U.sec('Đồng hồ treo', (t.soTreo || 0) + ' bài quá hạn ở một cổng');
    if (!t.treo || !t.treo.length)
      o += '<div class="card"><p class="sm muted">' + h(t.vi || 'Không cổng nào quá hạn.') +
        '</p></div>';
    else
      o += U.tbl(['Bài', 'Cổng', 'Đã chờ', 'Hạn'], t.treo.map(function (b) {
        return ['<a href="#" onclick="G.bsXemThang(\'' + h(b.id) + '\');return false">' +
            h(b.tieuDe) + '</a>',
          '<b>' + h(b.cong) + '</b>',
          '<span style="color:var(--bad)">' + h(String(b.choGio)) + ' giờ</span>',
          h(String(b.hanGio)) + ' giờ'];
      }));

    o += U.sec('Mở một bài theo mã');
    o += '<div class="card"><div class="row" style="gap:10px">' +
      '<input id="bsMoId" class="inp grow" placeholder="Mã bài, ví dụ BND-…" ' +
        'value="' + h(G.bsD.id || '') + '">' +
      '<button class="btn" onclick="G.bsXemThang(document.getElementById(\'bsMoId\').value.trim())">' +
        'Xem thang</button></div></div>';
    return o;
  }

  /* ═══════════ NGĂN 4 · HIẾN PHÁP ═══════════ */
  function nganHienPhap() {
    var o = '<div class="card"><b>Hiến pháp Nội dung ' + h(G.KN_MA_VB || '') + '</b>' +
      '<p class="sm muted mt">' + h((G.KN_LUAT_GOC || {}).cot || '') + '</p>' +
      '<p class="sm muted mt"><i>' + h((G.KN_LUAT_GOC || {}).vi || '') + '</i></p>' +
      '</div>';

    o += U.sec('Hai mươi bốn khối', 'Mỗi khối phải TRẢ LỜI một câu — không có câu hỏi thì người viết điền cho có');
    o += U.tbl(['Mã', 'Khối', 'Phải trả lời câu gì', 'Đòi khối'],
      (G.KN_KHOI || []).map(function (k) {
        return ['<b>' + h(k.ma) + '</b>', h(k.ten),
          '<span class="sm">' + h(k.hoi || '') + '</span>',
          k.doi ? '<span class="chip">' + h(k.doi.join(' · ')) + '</span>' : '—'];
      }));

    o += U.sec('Mười luật chống nội dung rỗng', 'Ô "đo" nói máy bắt nó bằng cách nào — luật không có ô ấy là luật máy KHÔNG bắt được');
    o += U.tbl(['Mã', 'Luật', 'Máy đo bằng', 'Vì sao'],
      (G.KN_CAM || []).map(function (c) {
        var doTen = {khoi: 'khối thiếu', chu: 'dấu hiệu chữ', dai: 'độ dài câu'}[c.do];
        return ['<b>' + h(c.ma) + '</b>', h(c.luat),
          doTen ? '<span style="color:var(--ok)">' + h(doTen) + '</span>'
                : '<span style="color:var(--ink-4)">người đọc bắt</span>',
          '<span class="sm muted">' + h(c.vi || '') + '</span>'];
      }));

    o += U.sec('Bảng thay lời', 'Luật gốc: ĐỪNG SỬA CON NGƯỜI TRƯỚC KHI KIỂM HỆ THỐNG');
    o += U.tbl(['Đừng nói', 'Nói thay', 'Vì sao'],
      (G.KN_LOI_THAY || []).map(function (l) {
        return ['<span style="color:var(--bad)">' + h(l.dung) + '</span>',
          '<span style="color:var(--ok)">' + h(l.thay) + '</span>',
          '<span class="sm muted">' + h(l.vi) + '</span>'];
      }));

    o += U.sec('Bảng câu rỗng', 'Không sai — chỉ không mang thông tin nào, nên người viết không tự thấy');
    o += U.tbl(['Câu', 'Đáng lẽ nằm ở đó'],
      (G.KN_RONG || []).map(function (r) {
        return [h(r.cau), '<span class="sm">' + h(r.thay) + '</span>'];
      }));

    o += U.sec('Bốn nhãn nguồn', 'Bốn nhãn cố định thì máy đếm được — "luôn nêu nguồn" thì không');
    o += U.tbl(['Nhãn', 'Nghĩa'], (G.KN_NGUON || []).map(function (n) {
      return ['<b>' + h(n.nhan) + '</b>', h(n.nghia)];
    }));

    o += U.sec('Tám chế độ', 'Chế độ nào ĐÒI khối nào — chế độ không đòi gì thì chỉ là một cái tên');
    o += U.tbl(['Mã', 'Chế độ', 'Làm gì', 'Đòi khối'],
      (G.KN_CHE || []).map(function (c) {
        return ['<b>' + h(c.ma) + '</b>', h(c.ten), '<span class="sm">' + h(c.lam) + '</span>',
          (c.doi && c.doi.length) ? '<span class="chip">' + h(c.doi.join(' · ')) + '</span>' : '—'];
      }));

    o += U.sec('Ba phiên bản theo người đọc');
    o += '<div class="card">' + (G.KN_NGUOIDOC || []).map(function (n) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--line)">' +
        '<b>' + h(n.ten) + '</b> — ' + h((n.hoi || []).join('  ·  ')) +
        (n.cam ? '<div class="sm" style="color:var(--bad);margin-top:5px">' +
          ic('shield', 'w-3 h-3') + ' ' + h(n.cam) + '</div>' : '') +
        '</div>';
    }).join('') + '</div>';

    o += U.sec('Chỗ máy dừng lại', 'Việc còn chờ chủ hệ, không phải chờ mã');
    o += '<div class="card">' + (G.KN_CHOCHU || []).map(function (c) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--line)">' +
        '<b>' + h(c.ma) + '</b> — ' + h(c.viec) +
        '<div class="sm muted" style="margin-top:4px">' + h(c.vi) + '</div></div>';
    }).join('') + '</div>';
    return o;
  }

  /* ═══════════ NGĂN 5 · QUYỀN KÝ ═══════════ */
  function nganQuyen() {
    var o = '<div class="card"><b>Quyền ký là một TRỤC RIÊNG, không phải một vai mới</b>' +
      '<p class="sm muted mt">Bản đặc tả đề nghị năm vai mới. Học viện đã có thang ' +
      'R01–R15 đang chạy, và dựng thang thứ hai là dựng hai sự thật về ai được làm ' +
      'gì. Nên ba quyền ký cấp bằng cờ <code>quyenNoiDung</code> — y như ' +
      '<code>quyenTaiChinh</code> của phòng tài chính bản 9.97. Chỉ R01–R02 cấp ' +
      'được, và không ai tự cấp cho mình.</p></div>';

    if (!G.API_CAP_PHEP)
      return o + canhBao('Chưa nối máy chủ nên chưa đọc được danh sách quyền ký.',
        'var(--ink-3)');

    if (!G.bsD.quyen && !G.bsD.dangNapQuyen) {
      G.bsD.dangNapQuyen = true;
      goi('dsQuyenNoiDung', {}).then(function (r) {
        G.bsD.quyen = r; G.bsD.dangNapQuyen = false; veLai();
      });
      return o + '<div class="card mt"><p class="sm muted">Đang đọc…</p></div>';
    }
    var q = G.bsD.quyen || {};

    if (q.congThieuNguoi && q.congThieuNguoi.length)
      o += canhBao('Chưa ai giữ quyền: ' + q.congThieuNguoi.join(', ') +
        '. Bài sẽ ĐỨNG ở cổng ấy — và máy nói thẳng là đứng vì THIẾU NGƯỜI chứ ' +
        'không phải vì bài sai. Luật L3 làm chỗ này tốn thật: một bài đi trọn ' +
        'thang cần BỐN người khác nhau, và người viết không nằm trong bốn người ấy.',
        'var(--bad)');

    o += U.sec('Ai đang giữ quyền ký', (q.ds || []).length + ' người');
    o += (q.ds && q.ds.length)
      ? U.tbl(['Tài khoản', 'Quyền', 'Cổng', 'Vì sao cấp', 'Ai cấp'],
          q.ds.map(function (x) {
            var c = (G.KN_QUYEN || []).filter(function (k) { return k.ma === x.chucNang; })[0];
            return [h(x.username), '<b>' + h(x.chucNang) + '</b>',
              '<span class="chip">' + h(c ? c.cong : '') + '</span>',
              '<span class="sm muted">' + h(x.lyDo) + '</span>', h(x.boiAi)];
          }))
      : '<div class="card"><p class="sm muted">Chưa cấp cho ai.</p></div>';

    o += U.sec('Cấp quyền ký');
    o += '<div class="card"><div class="row" style="gap:10px;flex-wrap:wrap">' +
      '<input id="bsQTen" class="inp grow" placeholder="Tài khoản (email đăng nhập)">' +
      '<select id="bsQChuc" class="inp" style="max-width:180px">' +
      (G.KN_QUYEN || []).map(function (k) {
        return '<option value="' + h(k.ma) + '">' + h(k.ten) + ' · ' + h(k.cong) + '</option>';
      }).join('') + '</select></div>' +
      '<input id="bsQLyDo" class="inp mt" placeholder="Vì sao cấp — ít nhất 10 chữ">' +
      '<div class="row mt" style="gap:10px">' +
      '<button class="btn primary" onclick="G.bsCapQuyen()">Cấp</button>' +
      '<button class="btn" onclick="G.bsThuQuyen()">Thu hồi</button></div>' +
      '<p class="sm muted mt">Cấp quyền phải nói vì sao. Một quyền không lý do thì ' +
      'sáu tháng sau không ai dám thu hồi, vì không ai biết vì sao nó có ở đó.</p>' +
      '</div>';
    return o;
  }
  G.bsCapQuyen = function () {
    goi('capQuyenNoiDung', {username: oGiaTri('bsQTen').trim(),
      chucNang: oGiaTri('bsQChuc'), lyDo: oGiaTri('bsQLyDo').trim()})
      .then(function (r) { G.bsD.quyen = null; bao(r, 'Đã cấp quyền ký.'); veLai(); });
  };
  G.bsThuQuyen = function () {
    goi('thuHoiQuyenNoiDung', {username: oGiaTri('bsQTen').trim(),
      chucNang: oGiaTri('bsQChuc')})
      .then(function (r) { G.bsD.quyen = null; bao(r, 'Đã thu hồi.'); veLai(); });
  };

  /* ═══════════ MÀN ═══════════ */
  G.VIEWS['bien-soan-noi-dung'] = function () {
    /* Kho nạp SAU khi đăng nhập, nên KHÔNG đọc G.KN_* ở lúc tệp vừa tải.
       Đọc ở đây, mỗi lượt vẽ. Thiếu kho thì nói ra chứ không vẽ một màn
       trống rỗng để người dùng tự đoán. */
    if (!(G.KN_KHOI || []).length)
      return U.ph({eyebrow: 'Kiến trúc sư Nội dung', ic: 'book',
        t: 'Biên soạn nội dung', grad: 1}) +
        canhBao('Chưa nạp được kho nội dung. Kho đi theo quyền: cổng này ở gói ' +
          'NGHỀ, nên tài khoản phải có gói nghề. Đăng nhập lại bằng tài khoản của ' +
          'Học viện, hoặc kiểm ở màn Kho tổng.', 'var(--warn)');

    var o = U.ph({eyebrow: 'Kiến trúc sư Nội dung', ic: 'book',
      t: 'Biên soạn nội dung', grad: 1,
      lead: 'Khuôn hai mươi bốn khối · máy đo chứ không viết hộ · năm cổng có người ký'});
    o += thanhNgan();
    if (G.bsNgan === 'soan')     return o + nganSoan();
    if (G.bsNgan === 'thang')    return o + nganThang();
    if (G.bsNgan === 'kho')      return o + nganKho();
    if (G.bsNgan === 'buoi')     return o + nganBuoi();
    if (G.bsNgan === 'toanhe')   return o + nganToanHe();
    if (G.bsNgan === 'miendich') return o + nganMienDich();
    if (G.bsNgan === 'tudien')   return o + nganTuDien();
    if (G.bsNgan === 'chuannghe')return o + nganChuanNghe();
    if (G.bsNgan === 'hienphap') return o + nganHienPhap();
    if (G.bsNgan === 'chochu')   return o + nganChoChu();
    if (G.bsNgan === 'quyen' && capQuyenDuoc()) return o + nganQuyen();
    return o + nganSoan();
  };
})();
