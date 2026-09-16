/* ═══════════════════════════════════════════════════════════════
   GITA 365 — CỔNG XEM HỒ SƠ KHÁCH HÀNG

   Kho chuẩn ở kho-goc/data.xem-khach.js.

   MỘT CÁI CỔNG, KHÔNG PHẢI MƯỜI CHỖ NHỚ

   Mọi câu hỏi "vai này có xem được nhà kia không" đi qua xkDuocXem().
   Có một cổng thì chỉ phải canh một chỗ; không cổng thì mỗi màn mới là
   một lần phải NHỚ tự hỏi, và trí nhớ là thứ hỏng đầu tiên.

   CỔNG NÀY KHÔNG PHẢI LÁ CHẮN

   Nói thẳng ngay đây để không ai nhầm: đây là lớp GIAO DIỆN. Nó giấu
   những gì máy này không được xem, và nó KHÔNG chặn được ai mở công cụ
   nhà phát triển. Lá chắn thật nằm ở hai chỗ khác:

     · Hồ sơ mẫu tầng 4-5 sang gói NGHỀ CAO, và gói ấy chỉ cấp tới bậc
       của Coach. Không cấp thì máy ấy không có khoá, không có khoá thì
       không lọc gì cũng không đọc được.
     · Hồ sơ khách hàng THẬT không nằm trong gói nào: nó đi qua máy chủ,
       máy chủ kiểm giấy phép trước khi trả, và ghi sổ mỗi lượt trả.

   HAI THỨ ẤY KHÁC NHAU, VÀ KHÁC Ở CHỖ THU HỒI

   Một gói đã cấp thì không gọi ngược về được — gỡ giấy phép hôm nay
   không xoá được bản sao nằm trong máy người ta từ hôm qua. Nên gói chỉ
   gánh được luật TRẦN VAI ("ai được phép"), không gánh được luật GIẤY
   PHÉP THU HỒI ĐƯỢC ("hôm nay có còn được không"). Luật thứ hai chỉ
   sống được ở một lượt hỏi, nên hồ sơ thật đi đường ấy.

   Kho này đã ba lần mắc đúng lỗi lọc-trên-màn: KICHBAN ở 8.9, CV_MUC ở
   9.7, và 17 kho nghề ở 9.8. Lần thứ tư suýt xảy ra ở chính chỗ này —
   FAMILIES nằm trong gói NGHỀ, mà gói NGHỀ cấp tới bậc 12.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function () {

  /* ═══════════ TRẦN VAI THEO TẦNG CỦA KHÁCH ═══════════
     Nhận cả 'T3' lẫn số 3: hai dạng ấy đi lẫn nhau khắp kho — FAMILIES
     khai tier là SỐ, còn HT_TANG khai ma là CHUỖI — và gõ nhầm dạng thì
     không đỏ, chỉ lặng lẽ không khớp dòng nào rồi trả về "không được
     xem". Một cái cổng luôn đóng vì lý do sai là cổng hỏng. */
  function maTang(t) {
    if (t == null || t === '') return '';
    return /^T[1-5]$/.test(String(t)) ? String(t) : 'T' + t;
  }

  /* Bậc của Coach — đọc từ G.ROLES, không gõ con số. Đây là bậc thấp
     nhất còn được xem tầng 4-5, và nó cũng quyết định gói NGHỀ CAO được
     xin hay không. Gõ tay số 7 thì đổi bảng vai một hôm là hai chỗ lệch,
     và chỗ lệch ấy im lặng. */
  G.xkBacCoach = function () {
    var c = (G.ROLES || []).filter(function (x) { return x.id === 'R07'; })[0];
    return c ? c.lv : 7;
  };

  G.xkTran = function (tangKhach) {
    var t = maTang(tangKhach);
    if (!t) return null;
    return (G.XK_TRAN || []).filter(function (x) {
      return (x.tang || []).indexOf(t) >= 0;
    })[0] || null;
  };

  /* Vai này có nằm trong trần của tầng kia không. Chỉ trả lời câu ĐỦ
     ĐIỀU KIỆN — chưa nói tới giấy phép. */
  G.xkDuTranVai = function (vai, tangKhach) {
    var d = G.xkTran(tangKhach);
    if (!d) return { ok: false, y: 'Chưa khai trần vai cho tầng này.' };
    if ((d.vai || []).indexOf(vai) >= 0) return { ok: true, dong: d };
    /* Nói rõ vì sao bị chặn khi vai ấy đã bị gạch tên có chủ ý — khác
       hẳn "vai này chưa được nhắc tới". */
    var cam = (G.XK_CAM || []).filter(function (c) { return c.vai === vai; })[0];
    return { ok: false, dong: d, biGachTen: !!cam, vi: cam ? cam.vi : undefined,
      y: cam
        ? 'Vai này đã bị gạch tên khỏi mọi tầng.'
        : 'Vai này không có tên trong danh sách được xem tầng ' + maTang(tangKhach).slice(1) + '.' };
  };

  /* ═══════════ CỔNG THẬT — HAI LỚP ═══════════
     Lớp một: đủ điều kiện. Lớp hai: có giấy phép còn hiệu lực.
     Thiếu lớp nào cũng là không xem được, nhưng HAI CÂU TRẢ LỜI KHÁC
     NHAU — "vai anh không được phép" và "vai anh được phép nhưng chưa
     ai cấp quyền" dẫn tới hai việc khác nhau cho người đọc. Gộp lại là
     đẩy người ta đi hỏi nhầm chỗ. */
  /* Vai này xem được những MỤC nào. Không khai ở XK_VAI_MUC thì đủ ba —
     bắt mọi vai chép lại đủ ba mục là mời người ta chép cho xong, và một
     bảng toàn dòng chép là một bảng không ai đọc. */
  G.xkMucCuaVai = function (vai) {
    var d = (G.XK_VAI_MUC || []).filter(function (x) { return x.vai === vai; })[0];
    if (d) return (d.muc || []).slice();
    return (G.XK_MUC || []).map(function (m) { return m.ma; });
  };

  G.xkDuocXem = function (vai, tangKhach, muc) {
    var tran = G.xkDuTranVai(vai, tangKhach);
    if (!tran.ok) return { ok: false, thieuTran: true, y: tran.y, vi: tran.vi,
      biGachTen: tran.biGachTen === true };
    /* Chiều thứ BA. Đứng SAU trần tầng vì bảng mục chỉ hẹp lại, không mở
       rộng: vai không có tên trong XK_TRAN thì khai bao nhiêu mục cũng
       vẫn không xem được. */
    if (muc) {
      var duoc = G.xkMucCuaVai(vai);
      if (duoc.indexOf(muc) < 0) {
        var m = (G.XK_MUC || []).filter(function (x) { return x.ma === muc; })[0];
        var dm = (G.XK_VAI_MUC || []).filter(function (x) { return x.vai === vai; })[0];
        return { ok: false, thieuMuc: true, muc: muc, mucDuoc: duoc,
          vi: dm && dm.vi,
          y: 'Vai này không xem được mục "' + ((m && m.ten) || muc) + '". Chỉ xem được: ' +
            duoc.join(', ') + '.' };
      }
    }
    if ((G.XK_LUAT || {}).phaiCoGiayPhep !== true) return { ok: true, dong: tran.dong };
    var gp = G.xkGiayPhep(tangKhach);
    if (!gp.co) return { ok: false, thieuGiayPhep: true, dong: tran.dong,
      y: gp.y, xinODau: (G.XK_GIAYPHEP || {}).aiCap };
    return { ok: true, dong: tran.dong, giayPhep: gp };
  };

  /* ═══════════ GIẤY PHÉP ═══════════
     Máy chủ giữ sổ giấy phép. Máy này giữ đúng câu trả lời gần nhất, và
     giữ trong BỘ NHỚ thôi — không lưu xuống máy.

     Vì sao không lưu: một giấy phép đã thu hồi mà còn nằm trong máy thì
     người bị thu vẫn mở được hồ sơ chừng nào chưa tải lại trang, và
     "chừng nào chưa tải lại trang" có thể là mấy ngày. Thu hồi phải có
     hiệu lực ngay, nên câu trả lời phải hỏi lại chứ không nhớ. */
  G.XK_PHEP = null;

  G.xkGiayPhep = function (tangKhach) {
    if (!G.XK_PHEP) return { co: false, chuaHoi: true,
      y: 'Chưa hỏi được máy chủ về giấy phép. Chưa hỏi được thì chưa mở.' };
    var t = maTang(tangKhach);
    var ds = (G.XK_PHEP.tang || []);
    if (ds.indexOf(t) < 0) return { co: false,
      y: 'Chưa có giấy phép cho tầng ' + t.slice(1) + '.' };
    /* Hết hạn thì tự tắt, không chờ ai nhớ ra đi gỡ. Máy chủ cũng kiểm
       lại — đây chỉ là để màn nói đúng trước khi hỏi. */
    if (G.XK_PHEP.hetHan && new Date(G.XK_PHEP.hetHan) <= new Date())
      return { co: false, hetHan: G.XK_PHEP.hetHan,
        y: 'Giấy phép đã hết hạn ngày ' + String(G.XK_PHEP.hetHan).slice(0, 10) + '.' };
    return { co: true, tang: ds, hetHan: G.XK_PHEP.hetHan || null,
      nguoiCap: G.XK_PHEP.nguoiCap || null, lyDo: G.XK_PHEP.lyDo || null };
  };

  G.xkHoiPhep = function () {
    if (typeof G.tinGoiMayChu !== 'function')
      return Promise.resolve({ ok: false, ly: 'Chưa có đường gọi máy chủ.' });
    return G.tinGoiMayChu('soiQuyenXem').then(function (d) {
      G.XK_PHEP = d && d.ok ? { tang: d.tang || [], hetHan: d.hetHan || null,
        nguoiCap: d.nguoiCap || null, lyDo: d.lyDo || null } : null;
      return d;
    });
  };

  /* ═══════════ HỒ SƠ TẦNG CAO — HỎI MÁY CHỦ, KHÔNG ĐỌC KHO ═══════════
     Kho trên máy chỉ còn tầng một tới ba. Tầng bốn và năm phải hỏi, và
     lượt hỏi ấy được máy chủ ghi sổ. Không mạng thì không có — nói
     thẳng thế, đừng trả về mảng rỗng: mảng rỗng đọc thành "không nhà
     nào ở tầng bốn", mà sự thật là "chưa hỏi được". */
  G.xkNhaCao = function () {
    if (typeof G.tinGoiMayChu !== 'function')
      return Promise.resolve({ ok: false, ly: 'Chưa có đường gọi máy chủ.' });
    return G.tinGoiMayChu('xemKhachCao');
  };

  /* Lọc danh sách nhà trên máy theo cổng. Đây là lớp GIAO DIỆN — nó cho
     màn hình khỏi vẽ ra thứ tài khoản này không được xem. Nó KHÔNG phải
     chỗ giữ dữ liệu; chỗ ấy là gói kho và máy chủ. */
  G.xkLocNha = function (ds, vai) {
    vai = vai || (G.S && G.S.role);
    return (ds || []).filter(function (f) {
      return G.xkDuTranVai(vai, f.tier).ok === true;
    });
  };

  /* Ba mục được xem, lấy từ kho — không gõ lại tên mục ở màn nào. */
  G.xkMuc = function () { return (G.XK_MUC || []).slice(); };

})();
