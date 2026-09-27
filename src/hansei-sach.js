/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẠY LỚP TỰ SOI

   Kho chuẩn ở kho-goc/data.hansei-sach.js. Tệp này có ba hàm làm việc
   thật, và một hàm nói thật.

   1. hnSoiQuyet() — LUẬT LỚN NHẤT CỦA BẢN NÀY.

      Mọi quyết định tự động của hệ được xếp vào một trong ba loại, và
      mỗi loại có một luật khác nhau:

        mở rộng giúp đỡ  → máy làm TRƯỚC, người xác nhận sau
        thu hẹp quyền    → người quyết trước, LUÔN LUÔN
        chặn chính tổ chức → máy chặn thẳng, không có cửa xin

      Hàm này bắt ba chỗ sai: quyết định thu hẹp mà máy chốt được ·
      quyết định mở rộng mà lại chờ người · quyết định chặn tổ chức mà
      có cửa xin.

      Trước bảng này, hệ có một luật tuyệt đối "con người là quyết định
      cuối cùng". Luật ấy va thẳng vào chuông đỏ — nơi có những giây mà
      chờ người xác nhận là quá lâu. Một luật tuyệt đối không phân loại
      rủi ro thì nó sẽ bị phá ở đúng chỗ nó cần nhất, và lần phá đầu
      tiên sẽ được gọi là ngoại lệ hợp lý.

   2. hnCanXinLai() — im lặng là TIẾP TỤC.

      Thay đổi mở rộng quyền thì im lặng là đủ. Thay đổi thu hẹp quyền
      thì hỏi lại và chờ gật. Cùng một trục với hàm trên: mở rộng làm
      trước, thu hẹp chờ người. Một luật, hai chỗ dùng.

   3. hnSoiSLA() — khoá hình dạng một cuốn sổ CHƯA RA ĐỜI.

      Bản 9.19 khai cổng in đang chờ sổ giờ bấm–giờ chạm. Sổ ấy chưa có.
      Đây là lúc duy nhất khoá được hình dạng nó mà không tốn gì: ghi
      theo LẦN BẤM, không ghi theo NGƯỜI TRỰC.

      Khoá sau khi sổ ra đời thì trong đó đã có sẵn một cột tên người,
      và không ai chịu xoá một cột đã có số.

   4. hnSoiApVao() — hàm nói thật.

      Mỗi mâu thuẫn khai ra phải RƠI XUỐNG một chỗ chạy thật. Một cái
      sửa không rơi vào đâu là một lời thú nhận, không phải một cái sửa
      — và thú nhận làm người ta nhẹ lòng, thứ nguy hiểm nhất sau khi
      biết mình sai.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h;

  /* Một cái tên trỏ vào chỗ chạy thật: hàm, hoặc kho, hoặc 'KHO.MA' */
  function coThat(ten) {
    if (!ten) return false;
    var p = String(ten).split('.');
    if (typeof G[p[0]] === 'function') return true;
    if (G[p[0]] === undefined) return false;
    if (p.length === 1) return true;
    var ds = G[p[0]];
    if (!Array.isArray(ds)) return ds[p[1]] !== undefined;
    return ds.some(function (x) { return x.ma === p[1] || String(x.so) === p[1]; });
  }

  /* ═══════════ BA LOẠI QUYẾT ĐỊNH ═══════════ */
  G.HN_LOAI = ['moRong', 'thuHep', 'chanHe'];

  G.hnSoiQuyet = function () {
    var ds = G.HN_QUYET || [], loi = [];
    if (!ds.length) return ['chưa có bảng quyết định'];
    ds.forEach(function (q) {
      if (G.HN_LOAI.indexOf(q.loai) < 0) { loi.push(q.ma + ':loại lạ'); return; }
      /* Quyết định không trỏ được vào chỗ chạy thật là một dòng bảng,
         không phải một quyết định. */
      if (!coThat(q.noi)) loi.push(q.ma + '→' + (q.noi || 'trống') + ':không có thật');
      if (!q.viec || !q.vi) loi.push(q.ma + ':thiếu cột');

      if (q.loai === 'thuHep') {
        /* Chỗ sai nguy hiểm nhất: máy chốt một việc thu hẹp quyền. */
        if (q.mayLamTruoc === true) loi.push(q.ma + ':THU HẸP mà máy làm trước');
        if (!q.nguoiChot) loi.push(q.ma + ':thu hẹp mà không nói ai chốt');
      } else if (q.loai === 'moRong') {
        /* Mở rộng mà chờ người là mở rộng sẽ tới muộn. */
        if (q.mayLamTruoc !== true) loi.push(q.ma + ':MỞ RỘNG mà chờ người');
        if (!q.nguoiXacNhanSau) loi.push(q.ma + ':mở rộng mà không ai xác nhận sau');
      } else {
        /* Chặn tổ chức mà có cửa xin thì cửa ấy sẽ mở vào đúng lúc gấp. */
        if (q.khongCuaXin !== true) loi.push(q.ma + ':chặn hệ mà còn cửa xin');
        if (q.mayLamTruoc !== true) loi.push(q.ma + ':chặn hệ mà chờ người');
      }
    });
    return loi;
  };

  G.hnQuyetTheoLoai = function (loai) {
    return (G.HN_QUYET || []).filter(function (q) { return q.loai === loai; });
  };

  /* ═══════════ IM LẶNG LÀ TIẾP TỤC ═══════════
     `thayDoi` là { thuHepQuyen: true|false }. Thiếu khoá ấy thì hàm nói
     CHƯA PHÂN LOẠI ĐƯỢC, không nói "im lặng là đủ" — đoán nhầm về phía
     dễ là đúng cách một quyền bị thu hẹp trong im lặng. */
  G.hnCanXinLai = function (thayDoi) {
    if (!thayDoi || typeof thayDoi.thuHepQuyen !== 'boolean')
      return { chuaPhanLoai: true,
        y: 'Chưa khai thay đổi này có thu hẹp quyền nào không. Chưa phân loại thì chưa gửi.' };
    if (thayDoi.thuHepQuyen)
      return { canGat: true,
        y: 'Thay đổi này thu hẹp một quyền. Hỏi lại và CHỜ GẬT. Nhà nào không gật thì giữ nguyên điều kiện cũ cho nhà ấy.' };
    return { canGat: false,
      y: 'Thay đổi này không thu hẹp quyền nào. Im lặng là tiếp tục — không ai phải trả lời để giữ thứ mình đang có.' };
  };

  /* Không kho nào được đòi xác nhận lại một cách vơ đũa. Và mỗi lần in
     lại của cuốn sổ tay phải khai mình có thu hẹp quyền nào không. */
  G.hnSoiXinLaiDongY = function () {
    var loi = [];
    (G.SG_INLAI || []).forEach(function (x) {
      if (typeof x.thuHepQuyen !== 'boolean')
        loi.push('SG_INLAI lần ' + x.lan + ':chưa khai có thu hẹp quyền không');
      else if (x.thuHepQuyen && !x.daXinLai)
        loi.push('SG_INLAI lần ' + x.lan + ':thu hẹp quyền mà chưa xin lại đồng ý');
    });
    return loi;
  };

  /* ═══════════ SỔ GIỜ CHUÔNG — KHOÁ TRƯỚC KHI CÓ ═══════════ */
  G.hnSoiSLA = function () {
    var s = G.HN_SLA || {}, loi = [];
    if (s.camGhiTheoNguoi !== true) loi.push('chưa cấm ghi theo người');
    if (!s.ghiTheo || !/LẦN BẤM/i.test(s.ghiTheo)) loi.push('chưa chốt ghi theo lần bấm');
    if (!s.camODau || !s.dungDeLamGi) loi.push('thiếu cột');
    if (!coThat(s.noi)) loi.push('không trỏ về luật chuông đã có');
    /* Và luật gốc phải còn nguyên: chuông không được thành chỉ số. */
    if ((G.GL_ANDON_LUAT || {}).khongThanhChiSo !== true)
      loi.push('luật gốc "chuông không thành chỉ số" đã mất');
    /* Sổ chưa có thì phải khai là chưa có — khai có mà không có thì
       cổng in tưởng đã xong. */
    if (s.chuaCo !== true && !G.SLA_CHUONG) loi.push('khai đã có mà không thấy sổ');
    return loi;
  };

  /* ═══════════ MÂU THUẪN PHẢI RƠI XUỐNG CHỖ THẬT ═══════════ */
  G.hnSoiApVao = function () {
    var ds = G.HN_MAUTHUAN || [], loi = [];
    if (ds.length !== 9) loi.push('số mâu thuẫn=' + ds.length);
    ds.forEach(function (m) {
      if (!m.loi || !m.viSaoMac) loi.push(m.so + ':thiếu cột');
      if (m.chuaSua) {
        if (!m.thieu) loi.push(m.so + ':khai chưa sửa mà không nói thiếu gì');
        if (m.apVao) loi.push(m.so + ':vừa chưa sửa vừa có chỗ áp');
        return;
      }
      if (!coThat(m.apVao)) loi.push(m.so + '→' + (m.apVao || 'không rơi vào đâu'));
    });
    return loi;
  };

  G.hnSoiYeu = function () {
    return (G.HN_YEU || []).filter(function (y) {
      return !y.vi || !y.khongSuaDuoc || !y.dayThuaKe;
    }).map(function (y) { return y.ma + ':thiếu dây thừa kế'; });
  };

  G.hnSoiTuPhat = function () {
    var ds = G.HN_TUPHAT || [], loi = [];
    if (ds.length !== 5) loi.push('số tự phạt=' + ds.length);
    ds.forEach(function (t) { if (!t.pha || !t.gia) loi.push(t.so + ':phạt không có giá'); });
    return loi;
  };

  /* Câu để ngỏ nào là câu NẶNG thì phải nói rõ hẹp hơn ở đâu và vì sao
     chưa trả lời được. Câu nặng khai chung chung là câu sẽ chìm. */
  G.hnSoiNgo = function () {
    var ds = G.HN_NGO || [], loi = [];
    if (ds.length !== 5) loi.push('số câu ngỏ=' + ds.length);
    ds.filter(function (n) { return n.nang; }).forEach(function (n) {
      if (!n.hepHon || !n.chuaTraLoi) loi.push(n.so + ':câu nặng khai thiếu');
    });
    return loi;
  };

  G.hnChoChu = function () {
    return (G.HN_CHOCHU || []).filter(function (c) {
      return c.t && c.banGoc && c.lenhDung && c.canGi;
    });
  };

  /* ═══════════ MÀN HÌNH ═══════════
     Năm câu để ngỏ ở gói NỀN và lên ĐẦU màn — bản gốc chốt in chúng ở
     đầu sách, không phải phụ lục. Câu để ngỏ xếp xuống cuối là câu
     chìm, và câu chìm thì năm sau không ai nhắc lại. */
  G.VIEWS['hansei-sach'] = function () {
    if (!G.HN_NGO)
      return U.empty('Chưa mở được phần này', 'Phần này nằm trong gói nền. Đăng nhập lại để nạp.');

    var o = U.ph({ eyebrow: 'HỆ NÀY ĐANG NỢ GÌ', ic: 'shield', grad: 1,
      t: 'Năm câu hệ chưa trả lời được',
      lead: 'In ở đầu, không giấu ở cuối. Câu để ngỏ xếp xuống cuối là câu chìm, ' +
        'và câu chìm thì năm sau không ai nhắc lại.' });

    o += G.kaKhung ? G.kaKhung('hansei-sach', 'dau') : '';

    o += '<div class="card mb" style="border-color:#B4720F3e">' + (G.HN_NGO || []).map(function (n) {
      return '<div style="padding:10px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + n.so + '. ' + h(n.hoi) + '</b>' +
        (n.hepHon ? '<p class="tiny mt" style="line-height:1.7"><b>Hẹp hơn:</b> ' + h(n.hepHon) + '</p>' : '') +
        (n.chuaTraLoi ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F"><b>Chưa trả lời được:</b> ' +
          h(n.chuaTraLoi) + '</p>' : '') +
        (n.khongDungBua ? '<p class="tiny dim mt" style="line-height:1.7">' + h(n.khongDungBua) + '</p>' : '') +
        '</div>';
    }).join('') +
      '<p class="tiny dim mt" style="line-height:1.7"><b>' + h((G.HN_NGO_LUAT || {}).inODau || '') +
      '</b> ' + h((G.HN_NGO_LUAT || {}).vi || '') + '</p></div>';

    /* ── Phần của nghề ── */
    if (!G.HN_QUYET) return o;

    var cho = G.hnChoChu();
    if (cho.length) {
      o += U.sec('Chờ chủ hệ quyết — ' + cho.length + ' câu',
        ((G.HN_CHOCHU_LUAT || {}).camTuQuyet || ''));
      o += '<div class="card mb" style="border-color:#B4720F3e">' + cho.map(function (c) {
        return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b class="sm">' + h(c.t) + '</b>' +
          '<p class="tiny mt" style="line-height:1.7"><b>Tài liệu đề nghị:</b> ' + h(c.banGoc) + '</p>' +
          '<p class="tiny mt" style="line-height:1.7"><b>Đang giữ:</b> ' + h(c.lenhDung) + '</p>' +
          '<p class="tiny dim mt" style="line-height:1.7">' + h(c.vi) + '</p>' +
          '<p class="tiny mt" style="line-height:1.7;color:#B4720F"><b>Cần gì:</b> ' + h(c.canGi) + '</p></div>';
      }).join('') + '</div>';
    }

    var ql = G.HN_QUYET_LUAT || {}, soi = G.hnSoiQuyet();
    o += U.sec('Ba loại quyết định tự động' + (soi.length ? ' — LỆCH: ' + (soi.join(' ')) : ''),
      (ql.cot || ''));
    o += '<div class="card mb" style="border-color:#0B73503e">' +
      '<p class="sm" style="line-height:1.8"><b>Mở rộng:</b> ' + h(ql.moRong || '') + '</p>' +
      '<p class="sm mt" style="line-height:1.8"><b>Thu hẹp:</b> ' + h(ql.thuHep || '') + '</p>' +
      '<p class="sm mt" style="line-height:1.8"><b>Chặn tổ chức:</b> ' + h(ql.chanHe || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.7"><b>Chỗ tôi làm khác bản gốc:</b> ' + h(ql.toiThem || '') + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(ql.vi || '') + '</p></div>';
    o += U.tbl(['Mã', 'Quyết định', 'Loại', 'Chạy ở đâu', 'Máy làm trước', 'Ai chốt / xác nhận', 'Vì sao'],
      (G.HN_QUYET || []).map(function (q) {
        return [h(q.ma), h(q.viec),
          q.loai === 'moRong' ? 'mở rộng' : q.loai === 'thuHep' ? 'THU HẸP' : 'chặn hệ',
          h(q.noi), q.mayLamTruoc ? 'có' : 'KHÔNG',
          h(q.nguoiChot || q.nguoiXacNhanSau || (q.khongCuaXin ? 'không có cửa xin' : '—')),
          h(q.vi)];
      }));

    var dy = G.HN_DONGY || {};
    o += U.sec('Im lặng là tiếp tục', (dy.cot || ''));
    o += '<div class="card mb">' +
      '<p class="sm" style="line-height:1.8"><b>Mở rộng quyền:</b> ' + h(dy.moRong || '') + '</p>' +
      '<p class="sm mt" style="line-height:1.8"><b>Thu hẹp quyền:</b> ' + h(dy.thuHep || '') + '</p>' +
      '<p class="mt" style="line-height:1.9"><b>' + h(dy.ganhONguoiNao || '') + '</b></p>' +
      '<p class="tiny dim mt" style="line-height:1.7"><b>Bản gốc từng sai:</b> ' + h(dy.banGocSai || '') + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(dy.vi || '') + '</p></div>';

    var sla = G.HN_SLA || {};
    o += U.sec('Sổ giờ chuông — khoá hình dạng trước khi nó ra đời',
      'Cổng in của bản trước đang chờ đúng cuốn sổ này. Nó chưa có, và đây là lúc duy nhất khoá được hình dạng nó mà không tốn gì.');
    o += '<div class="card mb" style="border-color:#BE0E163e">' +
      '<p class="sm" style="line-height:1.8"><b>Ghi theo:</b> ' + h(sla.ghiTheo || '') + '</p>' +
      '<p class="sm mt" style="line-height:1.8"><b>Cấm xuất hiện ở đâu:</b> ' + h(sla.camODau || '') + '</p>' +
      '<p class="sm mt" style="line-height:1.8"><b>Dùng để làm gì:</b> ' + h(sla.dungDeLamGi || '') + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(sla.vi || '') + '</p></div>';

    var ma = G.hnSoiApVao();
    o += U.sec('Chín mâu thuẫn bộ sách tự tìm ra' + (ma.length ? ' — LỆCH: ' + (ma.join(' ')) : ''),
      'Mỗi cái sửa phải RƠI XUỐNG một chỗ chạy thật. Sửa không rơi vào đâu là một lời thú nhận, và thú nhận làm người ta nhẹ lòng — thứ nguy hiểm nhất sau khi biết mình sai.');
    o += U.tbl(['#', 'Mâu thuẫn', 'Lỗi là gì', 'Vì sao mắc', 'Rơi xuống đâu'],
      (G.HN_MAUTHUAN || []).map(function (m) {
        return [String(m.so) + (m.lonNhat ? ' ★' : ''), h(m.t), h(m.loi), h(m.viSaoMac),
          m.chuaSua ? 'CHƯA SỬA — thiếu: ' + h(m.thieu) : h(m.apVao)];
      }));

    o += U.sec('Năm chỗ bộ sách tự phạm luật của chính nó', 'Mọi cấm phải có giá. Bộ sách không miễn cho mình.');
    o += U.tbl(['#', 'Phạm gì', 'Phá luật nào', 'Giá phải trả'],
      (G.HN_TUPHAT || []).map(function (t) { return [String(t.so), h(t.phamGi), h(t.pha), h(t.gia)]; }));

    o += U.sec('Bốn điểm yếu không sửa được — và ai gánh tiếp',
      'Một điểm yếu khai ra mà không nói ai gánh là một lời than, không phải một món nợ.');
    o += U.tbl(['Mã', 'Điểm yếu', 'Vì sao', 'Không sửa được vì', 'Dây thừa kế'],
      (G.HN_YEU || []).map(function (y) {
        return [h(y.ma), h(y.t), h(y.vi), h(y.khongSuaDuoc), h(y.dayThuaKe)];
      }));

    var tc = G.HN_TUCAM_THEM || {};
    o += U.sec('Một cụm từ cấm được ba tài liệu độc lập cùng chỉ ra', '');
    o += '<div class="card mb">' +
      '<p class="sm" style="line-height:1.8"><b>Thêm:</b> "' + h(tc.them || '') + '" · ' + h(tc.daCo || '') + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(tc.vi || '') + '</p>' +
      (tc.daGop ? '<p class="tiny mt" style="line-height:1.7;color:#0B7350"><b>Đã gộp:</b> ' +
        h(tc.doTruocKhiGop || '') + '</p>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(tc.vi2 || '') + '</p>' : '') + '</div>';

    o += U.sec('Sáu luật của chính lớp tự soi', '');
    o += '<div class="card">' + (G.HN_LUAT || []).map(function (l) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + l.no + '. ' + h(l.t) + '</b>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(l.y) + '</p></div>';
    }).join('') + '</div>';
    return o;
  };
})();
