/* ═══════════════════════════════════════════════════════════════
   GITA 365 — ĐIỀU PHỐI 100 TRỢ LÝ AI SIÊU CẤP  (9.99.107)

   Chủ hệ: dựng 100 trợ lý AI siêu cấp đảm nhận chi tiết mọi vai trong
   web app, hỗ trợ Bộ não thiên tài GITA365 vận hành toàn diện; Bộ não
   đứng CAO NHẤT và điều phối; sắp tới nối tuyến với các web app nhánh —
   cần điều phối mạch lạc, không xung đột; các trợ lý tự hoàn thiện theo
   chuẩn chuyên gia và TUÂN THỦ HIẾN PHÁP.

   ══ DỰNG CÁI TRẦN ĐIỀU PHỐI TRƯỚC — lần thứ sáu ══

   Sau Hiến pháp (9.99.62), trần giám sát (9.99.76), vòng tự nâng cấp
   (9.99.77), GITA Supreme (9.99.83), Studio (9.99.92). Ở đây gắt hơn:
   một trăm trợ lý cùng chạm vào một hệ mà KHÔNG có tầng điều phối thì
   hai trợ lý sẽ cùng sửa một thứ, và cái hỏng không lộ ra ở lượt sửa —
   nó lộ ra ở thứ thứ ba đọc phải hai kết quả khác nhau. Nên tầng điều
   phối (Bộ não cao nhất · khoá sở hữu chống trùng · ràng hiến pháp) phải
   có TRƯỚC khi một trợ lý nào được phép ra tay.

   ══ TRỎ, KHÔNG CHÉP — nguy nhất là bản thứ hai của HIẾN PHÁP ══

   Mọi năng lực đã có: Bộ não (BN_*), Hiến pháp 13 điều, hàng rào 10
   điểm, chín điều bất khả sửa (HP9), lớp cấp quyền AI (quyen-nang-ai
   9.99.100), vòng tự nâng cấp có cổng (9.99.77), ba chuỗi cấp phép
   (tu-hoan-thien 9.99.96–99). Một trăm trợ lý KHÔNG dựng lại cái nào —
   mỗi trợ lý TRỎ vào một CỬA THẬT đã có, và đi qua đúng cổng của cửa ấy.
   Chép hiến pháp/hàng rào vào đây là bản thứ hai của một BẢNG CẤM —
   bản nguy nhất trong mọi bản thứ hai (9.99.83): sửa một bên thì bên
   kia vẫn chặn theo luật cũ, và cả hai vẫn xanh. Mục 110 canh rằng
   DP_* KHÔNG mọc một bảng hiến pháp/hàng rào thứ hai.

   ══ CHỐNG XUNG ĐỘT = MỖI TRỢ LÝ MỘT KHOÁ SỞ HỮU DUY NHẤT ══

   Khoá sở hữu của một trợ lý LÀ cửa nó phục vụ. Hai trợ lý không sở hữu
   cùng một cửa → không có hai trợ lý cùng ra tay trên một thứ. Đây là
   phép chống xung đột đo được: mục 110 đòi 100 khoá sở hữu ĐÔI MỘT KHÁC
   NHAU, và mọi khoá là một cửa CÓ THẬT trong worker (đo hai đầu độc lập
   — luật 9.99.84). Trùng một khoá là đỏ.

   ══ ×100 LÀ LỜI KHAI/HƯỚNG, KHÔNG PHẢI CHỈ TIÊU ══

   "Nâng năng lực Bộ não lên gấp 100 lần" là một HƯỚNG, không phải một
   con số máy đo. Dựng một ô `heSoNangLuc: 100` là dựng lại đúng cái bẫy
   9.99.86 (SUP-01) đã gỡ: một con số để rồi có người chạy cho đủ. Năng
   lực thật tăng lên KHÔNG bằng một hệ số — nó tăng bằng một trăm trợ lý
   làm chi tiết dưới sự điều phối của Bộ não. Nên ×100 nằm ở DP_TRAN dạng
   LỜI KHAI (`loiKhai:true`), và mục 110 canh rằng DP_* không mang một ô
   số nào tự xưng là "năng lực".

   ══ TỰ HOÀN THIỆN ĐI QUA VÒNG ĐÃ CÓ CỔNG ══

   Trợ lý tự hoàn thiện/cập nhật theo chuẩn chuyên gia — nhưng KHÔNG bằng
   một đường nâng cấp riêng. Một hệ tự nâng cấp mà sửa được chính đường
   nâng cấp của nó là hệ không có giới hạn nào (9.99.77). Nên tự hoàn
   thiện đi THẲNG qua `deXuatNangCap` — vòng năm cửa đã có, với bảy vùng
   không tự chạm được (K1–K7). Tầng điều phối này và hiến pháp NẰM TRONG
   vùng không tự chạm ấy.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

/* Bộ não thiên tài GITA365 — vai CAO NHẤT, điều phối toàn diện. Không
   chép một luật nào của Bộ não vào đây; chỉ TRỎ tên các bảng thật để
   người đọc biết đường lần về. */
G.DP_BONAO = {
  capCaoNhat: true,
  dieuPhoi: true,
  troVao: ['BN_HIENPHAP', 'BN_RAO10', 'HP9_BATKHASUA', 'BN_VUNG', 'BN_GHE'],
  vi: 'Bộ não thiên tài GITA365 đứng trên mọi trợ lý và điều phối toàn diện. Mọi ' +
    'việc một trợ lý làm ra ngoài đều đi qua hiến pháp và hàng rào của Bộ não trước — ' +
    'không trợ lý nào vượt qua.'
};

/* Bảy luật của tầng điều phối. Mỗi luật một câu VÌ SAO; luật ×100 mang
   dấu `loiKhai` để không ai đọc nó thành một chỉ tiêu. */
G.DP_TRAN = [
  { ma: 'DP1', ten: 'Bộ não cao nhất, điều phối toàn diện',
    vi: 'Không trợ lý nào ghi đè quyết định của Bộ não. Xung đột giữa hai miền thì Bộ ' +
      'não phân xử — một hệ trăm tác nhân mà không có một đầu điều phối thì nó tự xé mình.' },
  { ma: 'DP2', ten: 'Mỗi trợ lý một khoá sở hữu DUY NHẤT',
    vi: 'Khoá sở hữu là cửa trợ lý phục vụ. Hai trợ lý không cùng một cửa nên không bao ' +
      'giờ hai trợ lý cùng ra tay trên một thứ. Đây là phép chống xung đột đo được.' },
  { ma: 'DP3', ten: 'Mọi trợ lý TUÂN THỦ HIẾN PHÁP',
    vi: 'Trợ lý đi qua đúng cổng của cửa nó phục vụ — Điều 13 (ẩn danh khi ra ngoài), ' +
      'cấp quyền AI, chuỗi ba chữ ký khi soạn nội dung ra khách. Không có cổng thứ hai.' },
  { ma: 'DP4', ten: 'Tự hoàn thiện ĐI QUA vòng đã có cổng',
    vi: 'Trợ lý cải tiến theo chuẩn chuyên gia bằng cách đề xuất qua deXuatNangCap — vòng ' +
      'năm cửa với bảy vùng không tự chạm. Tầng điều phối và hiến pháp nằm trong vùng ấy.' },
  { ma: 'DP5', ten: '×100 là HƯỚNG, không phải chỉ tiêu', loiKhai: true,
    vi: 'Nâng năng lực Bộ não lên gấp trăm lần là một hướng, không phải một con số để rồi ' +
      'có người chạy cho đủ. Năng lực tăng bằng một trăm trợ lý làm chi tiết dưới điều phối ' +
      'của Bộ não — không bằng một hệ số ghi trong kho.' },
  { ma: 'DP6', ten: 'Trợ lý KHÔNG tự bật',
    vi: 'Mỗi năng lực trợ lý tắt mặc định; chỉ Super Admin cấp qua lớp quyền AI (9.99.100). ' +
      'Một trợ lý tự bật là một hệ tự mở rộng quyền của chính nó.' },
  { ma: 'DP7', ten: 'Nối tuyến/web app nhánh KHÔNG trùng khoá',
    vi: 'Khi nối các tuyến với web app nhánh, mỗi tuyến khai trợ lý sở hữu; điều phối xuyên ' +
      'app dùng CHUNG một không gian khoá sở hữu, nên hai app không cùng ra tay trên một thứ.' }
];

/* ══ MIỀN → CỬA THẬT. Mỗi cửa là một trợ lý; khoá sở hữu = cửa ấy. ══
   Đây là NGUỒN của một trăm trợ lý. `profile` quyết cổng phải qua:
     tien   — tiền: qua thang duyệt chi/giá (R01–R03)
     con    — dữ liệu gia đình/trẻ: Điều 13 + nhật ký lượt đọc
     ngoai  — ra ngoài hệ: Điều 13 + ẩn danh trước khi rời hệ
     duyet3 — soạn nội dung ra khách: chuỗi ba chữ ký
     chung  — chỉ Bộ não + cấp quyền AI */
var DP_SPEC = [
  ['TC_THU', 'Kế toán thu', 'tien', ['ghiPhieuThu', 'duyetPhieuThu', 'congNo', 'doiSoat']],
  ['TC_CHI', 'Kế toán chi', 'tien', ['ghiChi', 'duyetChi', 'soChi', 'xemThangDuyetChi']],
  ['TC_NH', 'Ngân hàng', 'tien', ['nhapGiaoDichTay', 'doiChieuNganHang', 'khopGiaoDich']],
  ['TC_LUONG', 'Lương', 'tien', ['datHeSoLuong', 'bangLuong', 'chotLuong']],
  ['TC_HOAN', 'Hoàn & hoa hồng', 'tien', ['deXuatHoan', 'duyetHoan', 'traHoaHong']],
  ['TC_THUE', 'Thuế & chốt sổ', 'tien', ['chotTuan', 'soatChot', 'baoCaoKeToan', 'boSoKhaiThue']],
  ['TC_QUYEN', 'Quyền tài chính', 'chung', ['capQuyenTaiChinh', 'dsQuyenTaiChinh']],
  ['KH_XEM', 'Quyền xem khách', 'chung', ['capQuyenXem', 'soiQuyenXem', 'xemKhachCao']],
  ['KH_CC', 'Chứng cứ', 'chung', ['kyChungCu', 'xacNhanChungCu', 'soiChungCu']],
  ['KH_HS', 'Hồ sơ khách', 'con', ['xemTepKhach', 'suaTepKhach', 'dsTepKhach', 'nangTang']],
  ['TG', 'Trợ lý hình ảnh', 'ngoai', ['deXuatThiGiac', 'banMoiThiGiac', 'chamThiGiac',
    'khoThiGiac', 'xuatTamThiGiac', 'dangTamThiGiac', 'goTamThiGiac', 'doPheuThiGiac', 'docGopY']],
  ['BN', 'Bộ não & ẩn danh', 'ngoai', ['soatBoNao', 'soatAnDanh', 'guiDeBaiRaNgoai', 'ghiLuatThuongHieu']],
  ['P1', 'Phân hệ 1 · Vùng Mạnh', 'con', ['lapTheVungManh', 'docTheVungManh', 'loTrinhTuThe', 'soatVungManh']],
  ['P2', 'Phân hệ 2 · Coach khách', 'duyet3', ['traLoiCoach', 'soatBanTra']],
  ['P3', 'Phân hệ 3 · Nội dung tiếp thị', 'duyet3', ['soatTiepThi', 'soatBayNhanh']],
  ['P4', 'Phân hệ 4 · Vận hành chăm sóc', 'con', ['lapSongSinh', 'docSongSinh', 'ghiCham', 'doSoCham']],
  ['P5', 'Phân hệ 5 · Tài chính CEO', 'tien', ['bayConSoCEO', 'soatLuatTaiChinh', 'chamKpiTaiChinh']],
  ['P6', 'Phân hệ 6 · Con người ba cửa', 'chung', ['docBaCua', 'ghiCua', 'lapBaCua', 'soatBaiTuan']],
  ['P7', 'Phân hệ 7 · Pháp lý rủi ro', 'con', ['docTuanThu', 'ghiDongY', 'docDongY', 'yeuCauXoaDuLieu', 'docVungLuatSu']],
  ['CEO', 'Hệ điều hành CEO', 'chung', ['docBangDieuKhien', 'banTinSang', 'chonBaNhaNgauNhien', 'soiQuyetDinh', 'ghiQuyetDinh', 'chuanBiVang']],
  ['PR', 'Bộ prompt bốn vai', 'chung', ['ghiLuotPrompt', 'docVongChay']],
  ['GIA', 'Bảng giá', 'tien', ['docBangGia', 'doiGia', 'soDoiGia']],
  ['NHA', 'Giao diện & nhà', 'con', ['docLuatGiaoDien', 'docHomNay', 'batCheDoBao', 'ghiGhimCon', 'chiaSeCoAnhCon']],
  ['GS', 'Trần giám sát', 'chung', ['capLenhGiamSat', 'thuLenhGiamSat', 'docLenhGiamSat', 'soatSoDen', 'docTranGiamSat']],
  ['CH', 'Cứu hệ', 'chung', ['soatCuuHe']],
  ['THT', 'Tự hoàn thiện', 'duyet3', ['ghiPhatSinh', 'soanBanNhap', 'duyetCap', 'nhapKho']],
  ['NC', 'Tự nâng cấp', 'chung', ['deXuatNangCap']],
  ['ND', 'Nội dung nghề', 'duyet3', ['soatNoiDung', 'xuatChuanNghe']],
  ['ST', 'Studio video', 'ngoai', ['ghiHoChieuVideo']]
];

/* Cổng phải qua theo profile. Mọi trợ lý bắt đầu bằng Bộ não + cấp
   quyền AI, rồi cộng cổng riêng của loại việc. */
var DP_GATE = {
  tien: ['thangDuyet'],
  con: ['Điều13', 'nhatKyDoc'],
  ngoai: ['Điều13', 'anDanh'],
  duyet3: ['baChuKy'],
  chung: []
};

/* MỘT TRĂM TRỢ LÝ — sinh từ DP_SPEC lúc tải. Mỗi cửa một trợ lý, khoá
   sở hữu = cửa. Không giữ một bản danh sách thứ hai; đổi DP_SPEC là cả
   roster đổi theo, và mục 110 đối chiếu mọi khoá với worker thật. */
G.DP_TRO_LY = (function () {
  var out = [], n = 0;
  DP_SPEC.forEach(function (d) {
    var extra = DP_GATE[d[2]] || [];
    d[3].forEach(function (cua) {
      n++;
      out.push({
        ma: 'TL' + ('000' + n).slice(-3),
        mien: d[0],
        phucVu: cua,
        khoaSoHuu: cua,
        qua: ['boNao', 'aiCoQuyen'].concat(extra),
        tuHoanThien: true,
        vaiCap: 'duoiBoNao'
      });
    });
  });
  return out;
})();

/* Danh sách miền (để màn nhóm và mục 110 đối chiếu). */
G.DP_MIEN = DP_SPEC.map(function (d) {
  return { ma: d[0], ten: d[1], profile: d[2], so: d[3].length };
});

/* Luật chống xung đột — nói THẲNG cái nó làm được và cái không. */
G.DP_XUNGDOT = [
  { ma: 'XD1', ten: 'Khoá sở hữu đôi một khác nhau',
    vi: 'Một cửa chỉ một trợ lý sở hữu. Điều phối tra khoá sở hữu để tìm đúng trợ lý; ' +
      'không có chỗ cho hai trợ lý cùng nhận một việc.' },
  { ma: 'XD2', ten: 'Miền chồng lấn thì Bộ não phân xử',
    vi: 'Khi một việc chạm hai miền, điều phối KHÔNG tự chọn — nó đưa lên Bộ não. Tự chọn ' +
      'là một tầng điều phối lặng lẽ mở rộng quyền của chính nó.' },
  { ma: 'XD3', ten: 'Điều phối KHÔNG bỏ qua cổng',
    vi: 'Điều phối chỉ tìm đúng trợ lý và dẫn tới đúng cửa; cửa ấy vẫn tự kiểm cổng của nó. ' +
      'Một cửa điều phối bỏ qua cổng là một cửa hậu cho cả trăm trợ lý.' }
];

/* Sẵn sàng nối tuyến với web app nhánh — chưa nối, khai để không ai
   tưởng đã nối. */
G.DP_TUYEN = [
  { ma: 'TU1', ten: 'Không gian khoá sở hữu dùng chung',
    vi: 'Khi thêm một web app nhánh, trợ lý của nó khai khoá sở hữu vào CÙNG không gian — ' +
      'nên một cửa vẫn chỉ một trợ lý, dù ở app nào.' },
  { ma: 'TU2', ten: 'Bộ não điều phối xuyên app',
    vi: 'Bộ não GITA365 là đầu điều phối chung; app nhánh không có Bộ não thứ hai. Một bộ ' +
      'não thứ hai là một hiến pháp thứ hai — bản nguy nhất trong mọi bản thứ hai.' }
];

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  function nhomMien(ma) {
    return (G.DP_TRO_LY || []).filter(function (t) { return t.mien === ma; });
  }

  /* Nhãn cổng cho người đọc — đọc từ chính ô `qua`, không bịa. */
  var TEN_QUA = {
    boNao: 'Bộ não', aiCoQuyen: 'Cấp quyền AI', thangDuyet: 'Thang duyệt chi',
    'Điều13': 'Điều 13', nhatKyDoc: 'Nhật ký đọc', anDanh: 'Ẩn danh', baChuKy: 'Ba chữ ký'
  };
  function veQua(qua) {
    return (qua || []).map(function (g) {
      return '<span class="dp-cong">' + h(TEN_QUA[g] || g) + '</span>';
    }).join('');
  }

  /* Nối một CỬA (doiTuong trong sổ) về đúng Agent sở hữu — join roster ở
     MÁY KHÁCH, không chép roster sang máy chủ (một nguồn). */
  function tenAgent(cua) {
    var t = (G.DP_TRO_LY || []).filter(function (x) { return x.khoaSoHuu === cua; })[0];
    if (!t) return null;
    var m = (G.DP_MIEN || []).filter(function (x) { return x.ma === t.mien; })[0];
    return { ma: t.ma, mien: m ? m.ten : t.mien };
  }
  /* Loader cho ngăn Giám sát Agent — chỉ R01–R02 gọi được (máy chủ gác). */
  G.dpTaiGiamSat = function () {
    if (!G.goiMayChu) { G.dpGiamSat = { ok: false, error: 'Chưa nối máy chủ.' }; G.render && G.render(); return; }
    G.goiMayChu('soatHoatDongAgent', {}).then(function (x) {
      G.dpGiamSat = x;
      if (G.S && G.S.view === 'dieu-phoi') G.render && G.render();
    });
  };

  G.VIEWS['dieu-phoi'] = function () {
    var tl = G.DP_TRO_LY || [], mien = G.DP_MIEN || [];
    var o = '<div class="hd"><h2>' + ic('orbit') + ' Điều phối trợ lý AI</h2>' +
      '<p class="sub"><b>Bộ não thiên tài GITA365</b> đứng cao nhất và điều phối toàn diện; ' +
      '<b>' + tl.length + ' trợ lý AI siêu cấp</b> đảm nhận chi tiết từng vai, mỗi trợ lý một ' +
      '<b>khoá sở hữu</b> riêng nên không bao giờ xung đột. Trợ lý tự hoàn thiện qua vòng nâng ' +
      'cấp có cổng, và tuân thủ hiến pháp.</p></div>';

    /* ══ BẢNG ĐIỀU HÀNH BỘ NÃO — số thật từ roster, dòng chảy tự sửa lỗi ══
       80% hình. Con số ở đây ĐO TỪ chính danh sách trợ lý và luật trần
       (thật, không minh hoạ). Dòng chảy là CƠ CHẾ thật: bộ não SOẠN bản vá
       rồi đẩy qua cổng, KHÔNG tự áp lên mã đang chạy. */
    var congBo = {}; tl.forEach(function(t){ (t.qua||[]).forEach(function(g){ congBo[g]=1; }); });
    o += U.bdSoHang([
      {k:'Trợ lý siêu cấp', v:String(tl.length), c:'var(--gita)', d:'mỗi trợ lý một cửa thật'},
      {k:'Miền phụ trách', v:String(mien.length), c:'var(--gita-sau)'},
      {k:'Loại cổng bảo vệ', v:String(Object.keys(congBo).length), c:'var(--ok)', d:'Điều 13 · cấp quyền · ba chữ ký…'},
      {k:'Luật trần điều phối', v:String((G.DP_TRAN||[]).length), c:'var(--gita-sang)'},
      {k:'Cửa duyệt tự nâng cấp', v:'5', c:'var(--gold-2)', d:'vòng có cổng · bảy vùng không chạm'},
      {k:'Bộ não tự áp mã?', v:'KHÔNG', c:'var(--gita-do)', d:'chỉ đề xuất — người ký & bộ kiểm quyết'}
    ]);

    o += '<h3 class="dp-h">' + ic('compass') + ' Dòng chảy TỰ SỬA LỖI có kiểm soát — theo lệnh Super Admin</h3>';
    o += U.bdDong([
      {ten:'1 · Lệnh Super Admin', mau:'var(--gita-do)', o:[{t:'Giao việc · đặt ưu tiên'},{t:'Cấp quyền AI',p:'màn Quyền năng AI'}]},
      {ten:'2 · Bộ não phân công', mau:'var(--gita-sau)', o:[{t:'Chọn trợ lý theo khoá sở hữu'},{t:'Miền chồng lấn → Bộ não phân xử'}]},
      {ten:'3 · Trợ lý phát hiện', mau:'var(--gita)', o:[{t:'Soi lỗi ở cửa mình giữ'},{t:'Nêu vấn đề · gốc rễ'}]},
      {ten:'4 · Soạn bản vá', mau:'var(--gita-sang)', o:[{t:'Soạn NHÁP cách sửa'},{t:'KHÔNG áp lên mã đang chạy'}]},
      {ten:'5 · Cổng duyệt', mau:'var(--gold-2)', o:[{t:'deXuatNangCap · 5 cửa'},{t:'Bảy vùng cấm không chạm'},{t:'Người ký ≠ người đề xuất'}]},
      {ten:'6 · Phát hành', mau:'var(--ok)', o:[{t:'Bộ kiểm chạy · xanh mới ra'},{t:'Ghi nhật ký ai · lúc nào'}]}
    ], {chu:'Vì sao KHÔNG cho bộ não tự viết và tự phát hành mã của chính nó: một hệ tự sửa được đường sửa của nó là một hệ không còn giới hạn nào (hiến pháp kho 9.99.77). Nên nó SOẠN và ĐỀ XUẤT; mỗi thay đổi qua năm cửa có người ký và bộ kiểm — đó mới là "tự sửa lỗi" bền, không phải một AI tự ý đổi mã.'});

    o += '<div class="grid g2">'+
      '<div>'+U.sec('TRỢ LÝ THEO MIỀN','Mỗi miền một nhóm cửa — phân công không chồng lấn')+
        U.bdVong(mien.map(function(m){ return {ten:m.ten, gia:m.so}; }), {giua:String(tl.length),duoi:'trợ lý'})+'</div>'+
      '<div>'+U.sec('TỐI ƯU & ĐỔI MỚI','Đo bằng việc đi qua cổng, không bằng một con số tự khai')+
        '<div class="bd-box"><div class="row" style="gap:16px;flex-wrap:wrap;justify-content:center">'+
        U.ring(100,'var(--ok)','hướng')+
        '<div style="flex:1;min-width:180px"><p class="tiny muted" style="line-height:1.7">'+
        h('"Đổi mới sáng tạo 100%" là HƯỚNG đi, không phải một con số để chạy cho đủ. '+
          'Kho cấm biến khát vọng thành chỉ tiêu bị nuôi (luật camDatChiTieu). Đổi mới thật đo bằng '+
          'số đề xuất ĐI QUA được năm cửa và làm bộ kiểm vẫn xanh — mỗi bước có người ký.')+
        '</p></div></div></div></div>'+
      '</div>';

    /* ── NGĂN 1 · BỘ NÃO CAO NHẤT ── */
    var bn = G.DP_BONAO || {};
    o += '<div class="dp-nao">' +
      '<span class="dp-nao-av">' +
      (typeof G.troLyVe === 'function' ? G.troLyVe(64) : ic('spark')) + '</span>' +
      '<div class="dp-nao-noi">' +
      '<b>' + ic('crown') + ' Bộ não thiên tài GITA365 — vai cao nhất</b>' +
      '<p>' + h(bn.vi || '') + '</p>' +
      '<p class="dp-tro">Trỏ vào: ' +
      (bn.troVao || []).map(function (x) { return '<code>' + h(x) + '</code>'; }).join(' · ') +
      '</p></div></div>';

    /* ── NGĂN 2 · BẢY LUẬT TRẦN ── */
    o += '<h3 class="dp-h">' + ic('shield') + ' Bảy luật của tầng điều phối</h3>';
    o += '<div class="dp-luat">';
    (G.DP_TRAN || []).forEach(function (l) {
      o += '<div class="dp-luat-o' + (l.loiKhai ? ' dp-loikhai' : '') + '">' +
        '<b>' + h(l.ma) + ' · ' + h(l.ten) + (l.loiKhai ? ' <span class="dp-nhan">lời khai</span>' : '') +
        '</b><p>' + h(l.vi) + '</p></div>';
    });
    o += '</div>';

    /* ── NGĂN 3 · MỘT TRĂM TRỢ LÝ THEO MIỀN ── */
    o += '<h3 class="dp-h">' + ic('users') + ' ' + tl.length + ' trợ lý siêu cấp · ' +
      mien.length + ' miền</h3>';
    o += '<p class="note dp-note">Mỗi trợ lý phục vụ MỘT cửa thật đã có (khoá sở hữu = cửa), ' +
      'đi qua đúng cổng của cửa ấy. Không dựng cửa rỗng, không chép luật.</p>';
    o += '<div class="dp-mien">';
    mien.forEach(function (m) {
      var ds = nhomMien(m.ma);
      o += '<div class="dp-mien-o">' +
        '<div class="dp-mien-dau"><b>' + h(m.ten) + '</b>' +
        '<span class="dp-so">' + ds.length + '</span></div>' +
        '<div class="dp-tl">';
      ds.forEach(function (t) {
        o += '<div class="dp-tl-o">' +
          '<span class="dp-tl-ma">' + h(t.ma) + '</span>' +
          '<code class="dp-tl-cua">' + h(t.phucVu) + '</code>' +
          '<span class="dp-tl-qua">' + veQua(t.qua) + '</span>' +
          '</div>';
      });
      o += '</div></div>';
    });
    o += '</div>';

    /* ── NGĂN 4 · CHỐNG XUNG ĐỘT · NỐI TUYẾN ── */
    o += '<h3 class="dp-h">' + ic('compass') + ' Điều phối mạch lạc — chống xung đột</h3>';
    o += '<div class="dp-luat">';
    (G.DP_XUNGDOT || []).concat(G.DP_TUYEN || []).forEach(function (l) {
      o += '<div class="dp-luat-o"><b>' + h(l.ma) + ' · ' + h(l.ten) + '</b>' +
        '<p>' + h(l.vi) + '</p></div>';
    });
    o += '</div>';

    o += '<p class="note dp-note">Tự hoàn thiện của mọi trợ lý đi qua ' +
      '<b data-v="tu-nang-cap">vòng tự nâng cấp</b> có cổng; cấp quyền cho trợ lý ở ' +
      '<b data-v="quyen-nang-ai">màn Quyền năng AI</b>. Bộ não ở ' +
      '<b data-v="bo-nao">màn Bộ não GITA 365</b>.</p>';

    /* ── NGĂN 5 · GIÁM SÁT AGENT — mắt của Thanh tra & Super Admin (V10) ──
       Chỉ R01–R02 thấy. Đọc hoạt động Agent THẬT từ sổ, nối cửa về đúng
       Agent. Đây là chỗ "giám sát chặt chẽ" thành thật: ai làm gì, ở cửa
       nào, lúc nào — không phải một lời hứa giám sát. */
    if (G.can && G.can('sys_audit')) {
      o += '<h3 class="dp-h">' + ic('eye') + ' Giám sát hoạt động Agent — Super Admin & Thanh tra</h3>';
      o += '<p class="note dp-note">Mọi lượt Bộ não điều phối Agent và mọi lượt Agent tự hoàn ' +
        'thiện đều vào sổ. Đây là MẮT của thanh tra: ai làm, ở cửa nào, lúc nào — kiểm soát của Super Admin.</p>';
      var gs = G.dpGiamSat;
      if (!gs) { setTimeout(function () { G.dpTaiGiamSat(); }, 0);
        o += '<p class="note">Đang đọc hoạt động Agent…</p>'; }
      else if (!gs.ok)
        o += '<div class="card"><p class="sm muted">' + h(gs.error || 'Cần nối máy chủ để xem hoạt động Agent.') + '</p></div>';
      else {
        o += '<div class="crm-kpis">';
        o += '<div class="crm-kpi" style="border-left:3px solid var(--gita)"><div class="crm-kpi-nhan">Lượt hoạt động Agent</div>' +
          '<div class="crm-kpi-so">' + h(String(gs.tong)) + '</div></div>';
        (gs.theoLoai || []).forEach(function (l) {
          o += '<div class="crm-kpi"><div class="crm-kpi-nhan">' + h(l.viec) + '</div>' +
            '<div class="crm-kpi-so">' + h(String(l.n)) + '</div></div>';
        });
        o += '</div>';
        o += U.tbl(['Giờ', 'Agent', 'Cửa', 'Việc', 'Do ai', 'Chi tiết'], (gs.ds || []).map(function (a) {
          var t = tenAgent(a.cua);
          return ['<span class="mono tiny">' + h(String(a.luc || '').slice(0, 19).replace('T', ' ')) + '</span>',
            t ? '<b class="sm">' + h(t.ma) + '</b><br><span class="tiny muted">' + h(t.mien) + '</span>'
              : '<span class="tiny muted">—</span>',
            '<code class="tiny">' + h(a.cua || '—') + '</code>',
            '<span class="tiny">' + h(a.viec) + '</span>',
            '<span class="tiny">' + h(a.boiAi || '—') + '</span>',
            '<span class="tiny">' + h(a.chiTiet || '') + '</span>'];
        }));
        if (!(gs.ds || []).length) o += '<p class="note">Chưa có hoạt động Agent nào trong sổ.</p>';
      }
    }

    return o;
  };
})();
