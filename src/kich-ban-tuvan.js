/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẠY BỘ KỊCH BẢN TƯ VẤN

   Kho chuẩn ở kho-goc/data.kich-ban-tuvan.js.

   TỆP NÀY LÀM MỘT VIỆC KHÁC HẲN CÁC TỆP TRỢ LÝ KHÁC: NÓ CHẶN

   Bản 9.49 dựng G.kbMoiVuotTang() — khớp một tình huống tầng trên thì
   nói "có phần đầy đủ hơn ở tầng bốn" kèm giá. Lúc ấy đúng với lời đặt.

   Chủ hệ chốt lại ngày 3.9.2026: KHÔNG khuyến khích vượt tầng. Chỉ nói
   phí khi nhà ấy ĐÃ HOÀN TẤT tầng đang đi và KPI từ 80% trở lên.

   Nên lời mời kia nay phải đi qua cổng dưới đây. Không xoá nó — một nhà
   đã hoàn tất tầng và KPI tốt thì vẫn cần biết đường đi tiếp; chỉ là nó
   không còn tự bật ra giữa chặng nữa.

   HAI ĐIỀU KIỆN, KHÔNG PHẢI MỘT

     · Hoàn tất mà KPI thấp = đi hết NGÀY chứ chưa đi hết CHẶNG. Mời lên
       là mời một nhà chưa vững đi tiếp.
     · KPI cao mà chưa hoàn tất = đang đi tốt. Cắt ngang một nhà đang đi
       tốt là việc tệ nhất trong nghề này.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function () {

  function boDau(s) {
    return String(s || '').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /* ═══════════ CỔNG PHÍ ═══════════
     Trả về một OBJECT chứ không phải true/false: ba trạng thái dẫn tới
     ba câu khác nhau trên màn, và gộp chúng lại là nói sai hai trên ba.

       chuaVao     → mời vào Tầng 1, và Tầng 1 miễn phí. Không phải bán.
       dangDi      → IM LẶNG về tầng trên. Không giá, không mời.
       xong        → được nói, một lần, sau khi đã ghi nhận cái đã làm được. */
  G.tvCongPhi = function (nha) {
    var C = G.KBTV_CONG_PHI || {};
    nha = nha || {};

    var tang = Number(nha.tang != null ? nha.tang :
      (G.S && G.S.acc && G.S.acc.tang));
    if (!(tang >= 1)) return { trangThai: 'chuaVao', noiPhi: false,
      moiTang: (C.chuaVaoTang || {}).duocMoi || 'T1',
      mienPhi: true,
      y: 'Chưa vào tầng nào. Mời vào Tầng 1 — không mất tiền, nên đây là mở cửa chứ không ' +
         'phải bán. Không rải bảng giá năm tầng ra.' };

    /* Hai điều kiện, và chúng phải cùng đúng. Ngưỡng đọc từ KPI_XIN_THEM,
       không gõ lại: hai bản thì sẽ có ngày lệch, và lệch ở đúng con số
       quyết định lúc nào được nói tiền. */
    var nguong = G.KPI_XIN_THEM;
    var kpi = Number(nha.kpi != null ? nha.kpi :
      (typeof G.kpiCuaToi === 'function' ? G.kpiCuaToi() : NaN));
    var xong = nha.hoanTat === true;

    if (nguong == null)
      return { trangThai: 'dangDi', noiPhi: false, chuaDocDuocNguong: true,
        y: 'Chưa đọc được ngưỡng KPI. Chưa đọc được thì KHÔNG nói phí — thiếu dữ kiện thì ' +
           'đóng, không mở.' };

    if (!xong || !(kpi >= nguong)) {
      var thieu = [];
      if (!xong) thieu.push('chưa hoàn tất chặng đang đi');
      if (!(kpi >= nguong)) thieu.push('KPI ' + (kpi >= 0 ? Math.round(kpi) + '%' : 'chưa đo được') +
        ', cần từ ' + nguong + '%');
      return { trangThai: 'dangDi', noiPhi: false, tang: tang, kpi: kpi, nguong: nguong,
        thieu: thieu,
        y: 'Nhà mình đang giữa chặng. Em trả lời bằng tư liệu của tầng ' + tang +
           ', và không nói gì về tầng trên — nói lúc này là mời bỏ dở chặng đang đi.' };
    }

    return { trangThai: 'xong', noiPhi: true, tang: tang, kpi: kpi, nguong: nguong,
      tangKe: tang < 5 ? tang + 1 : null,
      ghiNhanTruoc: true,
      y: 'Đã hoàn tất chặng và KPI ' + Math.round(kpi) + '% — trên ngưỡng ' + nguong +
         '%. Nói cái nhà mình đã làm được TRƯỚC, rồi mới nói tầng sau mở ra gì. Giá đứng ' +
         'cuối, một dòng. Nói một lần, không thúc.' };
  };

  /* Kịch bản khớp câu người kể. Ánh xạ chương → tầng để biết chuyện này
     thuộc phạm vi nào — nhưng KHÔNG dùng nó để báo giá. */
  G.tvKichBan = function (cau) {
    var c = boDau(cau), tot = null, cao = 0;
    (G.KBTV_KB || []).forEach(function (k) {
      var chu = boDau(k.ten).split(' ').filter(function (x) { return x.length >= 4; });
      var n = 0;
      chu.forEach(function (w) { if (c.indexOf(w) >= 0) n++; });
      (k.hoi || []).forEach(function (h) {
        var hh = boDau(h).split(' ').filter(function (x) { return x.length >= 5; });
        var m = hh.filter(function (w) { return c.indexOf(w) >= 0; }).length;
        if (m >= 2) n += 1;
      });
      if (n > cao) { cao = n; tot = k; }
    });
    if (!tot || cao < 2) return null;
    var ch = (G.KBTV_CHUONG || []).filter(function (x) { return x.no === tot.chuong; })[0];
    return { ma: tot.ma, ten: tot.ten, tang: tot.tang, hoi: tot.hoi,
      chuong: ch ? ch.ten : null,
      /* Nói rõ: khớp một kịch bản KHÔNG phải một lời khuyên đổi tầng. */
      khongPhaiLoiMoi: true };
  };

  /* Soi văn phong. Gộp câu cấm của giọng chung với câu cấm riêng của bộ
     tư vấn, và cả cách gọi người — "khách hàng" lọt vào là hỏng chuẩn. */
  G.tvSoiVanPhong = function (loi) {
    var c = ' ' + boDau(loi) + ' ', ra = [], daCo = {};
    var V = G.KBTV_VANPHONG || {};
    /* Khớp theo RANH GIỚI TỪ, không theo chuỗi con. "ca" nằm trong "case",
       "khách" nằm trong "khách hàng" — soi bằng indexOf thì một câu bị
       báo bốn lỗi cho cùng một chữ, và người sửa không biết sửa cái nào.
       Báo thừa cũng là báo sai, chỉ theo hướng ngược lại. */
    function co(t) {
      var k = ' ' + boDau(t) + ' ';
      return c.indexOf(k) >= 0;
    }
    /* Cụm dài xét trước: bắt được "khách hàng" thì thôi báo "khách". */
    (V.camGoi || []).slice().sort(function (a, b) { return b.length - a.length; })
      .forEach(function (t) {
        if (!co(t)) return;
        var tu = boDau(t);
        for (var k in daCo) if (k.indexOf(tu) >= 0) return;   /* đã báo cụm dài hơn */
        daCo[tu] = 1;
        ra.push({ cau: t, loai: 'cách gọi', vi: V.viCamGoi });
      });
    (V.camNoiThem || []).forEach(function (x) {
      if (co(x.cau)) ra.push({ cau: x.cau, loai: 'câu cấm', vi: x.vi });
    });
    if (typeof G.gnSoiCam === 'function')
      G.gnSoiCam(loi).forEach(function (x) {
        ra.push({ cau: x.cau, loai: 'câu cấm', vi: x.vi });
      });
    return ra;
  };

})();
