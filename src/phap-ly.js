/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẠY LỚP PHÁP LÝ

   Kho chuẩn ở kho-goc/data.phap-ly.js. Ba hàm làm việc thật:

   1. plSoiQuyen() — mỗi quyền của gia đình phải trỏ vào một CƠ CHẾ CÓ
      THẬT. Quyền không có cơ chế là quyền trang trí, và quyền trang trí
      còn tệ hơn không có quyền: nó làm người ta tin mình được bảo vệ.

   2. plQuyenNgu() — luật hiếm ai dám viết: năm nào một quyền có KHÔNG
      lần dùng thì đó là năm BÁO ĐỘNG. Hàm nhận sổ đếm và trả về những
      quyền đang ngủ. Không có sổ đếm thì nó nói thẳng là chưa đo được,
      chứ không trả về "mọi thứ ổn".

   3. plTranNguoiKem() — điều khoản lao động ĐỌC TRẦN, không ghi số.
      Đây là lần thứ BA trong kho này một tỉ lệ được viết cứng ở chỗ
      khác với trần đã ép: Phần VII viết một trên mười, Phần XI lại viết
      một trên mười. Trần là NĂM. Lần này điều khoản không ghi số nữa.

   VÌ SAO CÓ plChoChu()

   Bản gốc đề nghị cấp phép mở miễn phí mô hình và mở mã nguồn lõi. Chủ
   hệ đã nói bốn lần rằng đây là tài sản của Học viện và không ai được
   dùng khi chưa có sự đồng ý. Hai điều ấy không cùng đúng.

   Tôi không tự quyết. Giữ nguyên trạng thái đóng, và đưa câu hỏi lên
   màn hình mỗi lần mở — vì mở một quyền thì không thu lại được, còn
   đóng thì mở lúc nào cũng được.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h;

  /* ─── Quyền nào chưa trỏ vào cơ chế có thật ─── */
  G.plSoiQuyen = function () {
    var co = G.PL_CO || [];
    return (G.PL_QUYEN || []).filter(function (q) {
      if (!q.la || !q.demBang || !q.co || G[q.co] === undefined) return true;
      /* Cơ chế phải nói đủ bốn thứ: làm thế nào · ai trả lời · trong bao
         lâu · không được thì đi đâu. Thiếu một là quyền chỉ có tên. */
      var c = co.filter(function (x) { return x.ma === q.ma; })[0];
      return !c || !c.lam || !c.ai || !c.han || !c.khong;
    }).map(function (q) { return q.ma + '→' + (q.co || 'trống'); });
  };

  /* ─── Quyền nào đang ngủ ───
     `dem` là sổ đếm số lần dùng trong năm, dạng { Q1: 3, Q2: 0, ... }.
     Không có sổ thì trả `chuaDo`, KHÔNG trả "mọi thứ ổn" — im lặng về
     một quyền đang ngủ y hệt như quyền ấy không tồn tại. */
  G.plQuyenNgu = function (dem) {
    var ds = G.PL_QUYEN || [];
    if (!dem || typeof dem !== 'object')
      return { chuaDo: true, thieu: 'Sổ đếm số lần dùng từng quyền trong năm.' };
    var ngu = ds.filter(function (q) { return !(Number(dem[q.ma]) > 0); });
    return { chuaDo: false, ngu: ngu.map(function (q) { return q.ma; }),
      dat: ngu.length === 0, so: ds.length };
  };

  /* ─── Trần của điều khoản lao động ───
     Đọc trần đã ép, KHÔNG ghi số. Ba tài liệu khác nhau đã viết một
     trên mười; trần thật là năm. Điều khoản ghi số cứng thì có ngày nó
     cho phép đúng cái mà trần cấm. */
  G.plTranNguoiKem = function () {
    var tran = G.ddTranCua ? G.ddTranCua('DH') : 0;
    if (!tran) return null;
    return { tran: tran,
      dieuKhoan: 'Người kèm có quyền TỪ CHỐI nhận thêm khi đã giữ đủ ' + tran +
        ' nhà, và việc từ chối ấy không bị coi là không hoàn thành công việc.' };
  };

  G.plSoiHopDongTran = function () {
    var t = G.plTranNguoiKem();
    if (!t) return [];
    /* Hợp đồng khai `theoTran` thì KHÔNG được ghi con số nào trong cột
       bắt buộc — ghi số là đã tự tách khỏi trần. */
    return (G.PL_HOPDONG || []).filter(function (hd) {
      return hd.theoTran && /\b(mười|10)\b/.test(String(hd.batBuoc));
    }).map(function (hd) { return hd.ma + ':ghi số cứng'; });
  };

  /* ─── Mười hai điều: đúng MỘT điều không sửa được ───
     Và mỗi điều phải nói mình dịch từ nguyên tắc nào — điều không có
     gốc là điều sẽ bị bỏ sau năm mươi năm với lý do "dọn văn bản cũ". */
  G.plSoiDieu = function () {
    var ds = G.PL_DIEU || [], loi = [];
    if (ds.length !== 12) loi.push('số điều=' + ds.length);
    var khongSua = ds.filter(function (d) { return d.khongSua; });
    if (khongSua.length !== 1) loi.push('không-sửa-được=' + khongSua.length);
    else if (khongSua[0].so !== 12) loi.push('điều không sửa là ' + khongSua[0].so);
    ds.forEach(function (d) {
      if (!d.cung || !d.y) loi.push('điều ' + d.so + ':thiếu cột');
      if (!d.goc || G[d.goc] === undefined) loi.push('điều ' + d.so + '→' + (d.goc || 'không gốc'));
    });
    return loi;
  };

  /* ─── Bảy loại hợp đồng, mỗi loại đủ ba cột ───
     Thiếu `cam` là hợp đồng chỉ nói được làm gì mà không nói KHÔNG được
     làm gì — và cột cấm mới là cột giữ được lời hứa lúc có lợi ích. */
  G.plSoiHopDong = function () {
    return (G.PL_HOPDONG || []).filter(function (hd) {
      return !hd.batBuoc || !hd.cam || !hd.vi;
    }).map(function (hd) { return hd.ma; });
  };

  /* ─── Bốn bậc, và KHÔNG có bậc năm ───
     Bậc năm tên "làm đi rồi chờ sửa luật" là bậc mà mọi tổ chức đều
     phát minh ra vào đúng lúc nó cần nhất. Nên phải khai trước là
     không có. */
  G.plSoiBac4 = function () {
    var ds = G.PL_BAC4 || [], l = G.PL_BAC4_LUAT || {}, loi = [];
    if (ds.length !== 4) loi.push('số bậc=' + ds.length);
    if (l.khongCoBac5 !== true) loi.push('chưa khai không có bậc 5');
    if (!ds.every(function (b, i) { return b.bac === i + 1 && b.lam; })) loi.push('bậc lệch');
    return loi;
  };

  G.plChoChu = function () { return (G.PL_CHOCHU || []).slice(); };

  /* ═══════════ MÀN: BẢY QUYỀN CỦA NHÀ MÌNH ═══════════
     Một màn, hai tầng sâu. Bảy quyền đi gói NỀN vì bản gốc nói rõ: in ở
     chỗ gia đình NHÌN THẤY được, không giấu trong điều khoản. */
  /* Quyền ĐỌC (9.99.120): gọi cửa xuatDuLieuNha qua G.goiMayChu — KHÔNG
     fetch thẳng, cùng cổng mọi cửa khác — rồi hiện tóm tắt + lịch sử đồng ý
     TẠI CHỖ. Mọi ô đi qua h() trước khi ghép vào HTML. Cha mẹ bỏ trống maNha
     thì máy chủ lấy nhà của phiên; không mở được nhà người khác. */
  G.plXuatDuLieu = function () {
    var el = document.getElementById('pl-xuat');
    if (!el) return;
    if (typeof G.goiMayChu !== 'function') {
      el.innerHTML = '<p class="tiny dim">Chưa nối máy chủ — phần này cần bản có nối máy chủ cấp phép.</p>';
      return;
    }
    el.innerHTML = '<p class="tiny dim">Đang đọc dữ liệu nhà mình…</p>';
    G.goiMayChu('xuatDuLieuNha', {}).then(function (r) {
      if (!r || !r.ok) {
        el.innerHTML = '<p class="tiny" style="color:var(--gita-do,#BE0E16)">' +
          h((r && r.error) || 'Không đọc được dữ liệu.') + '</p>';
        return;
      }
      var d = r.duLieu || {};
      var muc = [['Tài khoản', (d.taiKhoan || []).length], ['Con', (d.con || []).length],
        ['Thẻ vùng mạnh', (d.theVungManh || []).length], ['Hồ sơ song sinh', (d.hoSoSongSinh || []).length],
        ['Sổ chăm', (d.soCham || []).length], ['Lịch sử đồng ý', (d.dongY || []).length],
        ['Yêu cầu xoá', (d.yeuCauXoa || []).length], ['Phiếu thu', (d.phieuThu || []).length],
        ['Hoàn tiền', (d.hoanTien || []).length]];
      var html = '<div class="card"><b class="sm">Dữ liệu GITA đang giữ về nhà mình</b>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(r.vi || '') + '</p>';
      html += U.tbl(['Loại dữ liệu', 'Số bản ghi'],
        muc.map(function (m) { return [h(m[0]), String(m[1])]; }));
      if ((d.dongY || []).length) {
        html += '<p class="tiny mt"><b>Lịch sử đồng ý:</b></p>' +
          d.dongY.map(function (x) {
            return '<div class="tiny dim" style="line-height:1.7">' + h(x.o) + ' · ' +
              h(x.viec) + ' · ' + h(String(x.ghiLuc || '').slice(0, 10)) + '</div>';
          }).join('');
      }
      html += '<p class="tiny dim mt" style="line-height:1.7">Xuất lúc ' +
        h(String(r.xuatLuc || '').slice(0, 19).replace('T', ' ')) +
        ' · lượt đọc này đã vào nhật ký.</p></div>';
      el.innerHTML = html;
    }).catch(function () {
      el.innerHTML = '<p class="tiny" style="color:var(--gita-do,#BE0E16)">Lỗi mạng khi đọc dữ liệu.</p>';
    });
  };

  G.VIEWS['phap-ly'] = function () {
    if (!G.PL_QUYEN)
      return U.empty('Chưa mở được phần này', 'Phần này nằm trong gói nền. Đăng nhập lại để nạp.');

    var q = G.plSoiQuyen();
    var o = U.ph({ eyebrow: 'BẢY QUYỀN CỦA NHÀ MÌNH', ic: 'shield', grad: 1,
      t: 'Quyền không có cơ chế là quyền trang trí',
      lead: 'Bảy điều dưới đây không nằm trong điều khoản nào cả — chúng ở đây, chỗ nhà mình nhìn thấy. ' +
        'Mỗi quyền kèm tên cơ chế đang giữ nó, để nhà mình đòi được khi nó bị phá.' });

    o += '<div class="card mb" style="border-color:' + (q.length ? '#BE0E16' : '#0B7350') + '3e">' +
      (G.PL_QUYEN || []).map(function (x) {
        var ok = G[x.co] !== undefined;
        return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b>' + (ok ? '✓' : '✗') + ' ' + h(x.t) + '</b>' +
          '<p class="sm mt" style="line-height:1.8">' + h(x.la) + '</p>' +
          (function () {
            var c = (G.PL_CO || []).filter(function (y) { return y.ma === x.ma; })[0];
            if (!c) return '<div class="tiny muted">giữ bằng ' + h(x.co) + '</div></div>';
            return '<div class="tiny mt" style="line-height:1.7"><b>Làm thế nào:</b> ' + h(c.lam) + '</div>' +
              '<div class="tiny" style="line-height:1.7"><b>Ai trả lời:</b> ' + h(c.ai) +
              ' · <b>trong</b> ' + h(c.han) + '</div>' +
              '<div class="tiny dim" style="line-height:1.7">' + h(c.khong) + '</div></div>';
          })();
      }).join('') + '</div>';
    o += '<p class="tiny dim mb" style="line-height:1.7"><b>' + h((G.PL_QUYEN_LUAT || {}).khongThuHep || '') +
      '</b> ' + h((G.PL_QUYEN_LUAT || {}).khongAiDung || '') + ' ' + h((G.PL_QUYEN_LUAT || {}).vi || '') + '</p>';

    /* ── Quyền ĐỌC làm THẬT: xuất dữ liệu nhà mình tại chỗ (9.99.120) ──
       "Đọc" là một trong bảy quyền ở trên; trước 9.99.120 nó chỉ là một dòng
       chữ. Nút này gọi cửa xuatDuLieuNha (cổng nhaCuaMinh + ghi nhật ký) và
       hiện kết quả TẠI CHỖ — không tải tệp, nên không đụng luật cấm khách tải. */
    o += U.sec('Đọc dữ liệu nhà mình',
      'Luật 91 cho nhà mình quyền đọc toàn bộ dữ liệu GITA đang giữ về gia đình. ' +
      'Bấm để xem tại chỗ — mật khẩu và bí mật hệ thống không nằm trong đây, và mỗi lượt đọc vào nhật ký.');
    o += '<button class="btn" onclick="G.plXuatDuLieu()">Đọc dữ liệu nhà mình</button>';
    o += '<div id="pl-xuat" class="mt"></div>';

    /* ── Phần của nghề ── */
    if (!G.PL_DIEU) return o;

    /* Ba câu chờ chủ hệ để LÊN ĐẦU. Xếp xuống cuối là cách chúng chìm. */
    var cho = G.plChoChu();
    if (cho.length) {
      o += U.sec('Chờ chủ hệ quyết — ' + cho.length + ' câu',
        ((G.PL_CHOCHU_LUAT || {}).camTuQuyet || ''));
      o += '<div class="card mb" style="border-color:#B4720F3e">' + cho.map(function (c) {
        return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b class="sm">' + h(c.t) + '</b>' +
          '<p class="tiny mt" style="line-height:1.7"><b>Tài liệu đề nghị:</b> ' + h(c.banGoc) + '</p>' +
          '<p class="tiny mt" style="line-height:1.7"><b>Lệnh đứng của chủ hệ:</b> ' + h(c.lenhDung) + '</p>' +
          '<p class="tiny dim mt" style="line-height:1.7">' + h(c.vi) + '</p>' +
          '<p class="tiny mt" style="line-height:1.7;color:#B4720F"><b>Cần gì:</b> ' + h(c.canGi) + '</p></div>';
      }).join('') +
        '<p class="tiny dim mt" style="line-height:1.7">' + h((G.PL_CHOCHU_LUAT || {}).vi || '') + '</p></div>';
    }

    o += U.sec('Năm luật chuyển ngữ', 'Dịch từ điều mình TIN sang điều mình CAM KẾT.');
    o += '<div class="card mb">' + (G.PL_CHUYENNGU || []).map(function (l) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + l.no + '. ' + h(l.t) + '</b>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(l.y) + '</p></div>';
    }).join('') + '</div>';

    o += U.sec('Ba tầng kho, bản pháp lý', '');
    o += U.tbl(['Tầng', 'Là gì', 'Cơ sở xử lý', 'Giữ bao lâu', 'Quyền kèm theo', 'Ai xem được'],
      (G.PL_KHO || []).map(function (k) {
        return [h(k.ma + ' · ' + k.ten), h(k.la), h(k.coSo), h(k.giu), h(k.quyen), h(k.aiXem)];
      }));
    o += '<p class="tiny dim mb" style="line-height:1.7">' + h((G.PL_KHO_LUAT || {}).khacDiChuc || '') + '</p>';

    o += U.sec('Năm cam kết kỹ thuật có giá trị pháp lý', '');
    o += U.tbl(['Mã', 'Cam kết', 'Nghĩa là', 'Làm thật thế nào'],
      (G.PL_CAMKET || []).map(function (c) { return [h(c.ma), h(c.t), h(c.them), h(c.that)]; }));

    var dieuLoi = G.plSoiDieu();
    o += U.sec('Mười hai điều hiến pháp bản pháp lý',
      'Mỗi điều nói rõ mình dịch từ nguyên tắc nào — điều không có gốc là điều sẽ bị bỏ sau năm mươi năm với lý do dọn văn bản cũ.' +
      (dieuLoi.length ? ' LỆCH: ' + (dieuLoi.join(' ')) : ''));
    o += U.tbl(['Điều', 'Tên', 'Cứng hay mềm', 'Dịch từ', 'Nội dung'],
      (G.PL_DIEU || []).map(function (d) {
        return [String(d.so), h(d.t), h(d.cung), h(d.goc), h(d.y)];
      }));
    var d12 = (G.PL_DIEU || []).filter(function (d) { return d.khongSua; })[0];
    if (d12)
      o += '<div class="card mb" style="border-color:#BE0E163e">' +
        '<span class="tiny up" style="color:#BE0E16">ĐIỀU ' + d12.so + ' — KHÔNG SỬA ĐƯỢC BẰNG BẤT KỲ CƠ CHẾ NÀO</span>' +
        '<p class="mt" style="line-height:1.9"><b>' + h(d12.y) + '</b></p>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(d12.viCanDieuNay || '') + '</p></div>';

    var pn = G.PL_PHAPNHAN || {};
    o += U.sec('Pháp nhân hai tầng', (pn.viHaiTang || ''));
    o += U.tbl(['Tầng', 'Từ năm', 'Giữ gì', 'Hội đồng', 'Điều lệ'],
      (pn.tang || []).map(function (t) {
        return [h(t.ten), String(t.tuNam), h(t.giu), h(t.hoiDong), h(t.dieuLe)];
      }));
    o += '<p class="tiny dim mb" style="line-height:1.7"><b>Bất biến qua mọi biến thể luật:</b> ' +
      h((pn.batBien || []).join(' · ')) + '</p>';

    var tran = G.plTranNguoiKem();
    o += U.sec('Bảy loại hợp đồng',
      'Cột CẤM là cột giữ được lời hứa lúc có lợi ích — hợp đồng chỉ nói được làm gì thì không giữ được gì.');
    if (tran)
      o += '<div class="card mb" style="border-color:#0B73502e">' +
        '<span class="tiny up" style="color:#0B7350">ĐIỀU KHOẢN LAO ĐỘNG ĐỌC TRẦN, KHÔNG GHI SỐ</span>' +
        '<p class="sm mt" style="line-height:1.8">' + h(tran.dieuKhoan) + '</p>' +
        '<p class="tiny dim mt" style="line-height:1.7">Ba tài liệu đã viết tỉ lệ một trên mười. Trần thật là ' +
        tran.tran + '. Điều khoản ghi số cứng thì có ngày nó cho phép đúng cái mà trần cấm.</p></div>';
    o += U.tbl(['Mã', 'Loại', 'Bắt buộc có', 'Cấm', 'Vì sao'],
      (G.PL_HOPDONG || []).map(function (hd) {
        return [h(hd.ma), h(hd.ten), h(hd.batBuoc), h(hd.cam), h(hd.vi)];
      }));

    var xd = G.PL_XUNGDOT || {};
    o += U.sec('Sổ xung đột lợi ích', (xd.vi || ''));
    o += '<div class="card mb">' +
      '<p class="sm" style="line-height:1.8"><b>Ai khai:</b> ' + h(xd.aiKhai || '') + '</p>' +
      '<p class="sm mt" style="line-height:1.8"><b>Khai gì:</b> ' + h(xd.khaiGi || '') + '</p>' +
      '<p class="sm mt" style="line-height:1.8"><b>Khi nào:</b> ' + h(xd.khiNao || '') + '</p>' +
      '<p class="sm mt" style="line-height:1.8"><b>Lần một:</b> ' + h(xd.lan1 || '') + '</p>' +
      '<p class="sm mt" style="line-height:1.8"><b>Lần hai:</b> ' + h(xd.lan2 || '') + '</p>' +
      '<p class="mt" style="line-height:1.9;color:#BE0E16"><b>' + h(xd.cot || '') + '</b></p></div>';
    o += U.tbl(['Tình huống biên', 'Xử thế nào'],
      (xd.bien || []).map(function (b) { return [h(b.khi), h(b.xu)]; }));

    var b4 = G.plSoiBac4();
    o += U.sec('Khi luật nhà nước va với năm điều nền',
      ((G.PL_BAC4_LUAT || {}).cot || '') + (b4.length ? ' LỆCH: ' + (b4.join(' ')) : ''));
    o += (G.PL_BAC4 || []).map(function (b) {
      return '<div class="card mb" style="border-color:' + b.c + '2e">' +
        '<span class="tiny up" style="color:' + b.c + '">BẬC ' + b.bac + ' · ' + h(b.ten) + '</span>' +
        '<p class="sm mt" style="line-height:1.8">' + h(b.lam) + '</p>' +
        (b.y ? '<p class="tiny dim mt" style="line-height:1.7">' + h(b.y) + '</p>' : '') + '</div>';
    }).join('');
    o += '<p class="tiny dim mb" style="line-height:1.7">' + h((G.PL_BAC4_LUAT || {}).vi || '') + '</p>';

    var tc = G.PL_TRANHCHAP || {};
    o += U.sec('Ba bậc giải quyết tranh chấp', '');
    o += U.tbl(['Bậc', 'Tên', 'Hạn', 'Làm gì'],
      (tc.bac || []).map(function (b) { return [String(b.so), h(b.ten), h(b.han), h(b.lam) + (b.y ? ' ' + h(b.y) : '')]; }));
    o += '<div class="card mb" style="border-color:#BE0E162e">' + (tc.batBien || []).map(function (b) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(b.t) + '</b>' +
        '<p class="sm mt" style="line-height:1.8">' + h(b.them) + '</p>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(b.vi) + '</p></div>';
    }).join('') + '</div>';

    o += U.sec('Bảng kiểm pháp lý trước Ngày Gieo',
      'Bổ sung cho tám điều kiện mở cửa đã có — kia là sẵn sàng vận hành, đây là sẵn sàng pháp lý.');
    o += U.tbl(['#', 'Việc', 'Vì sao'],
      (G.PL_KIEM90 || []).map(function (k) { return [String(k.so), h(k.t), h(k.vi || '—')]; }));

    o += U.sec('Bốn nghĩa vụ định kỳ sau Ngày Gieo', '');
    o += U.tbl(['Nhịp', 'Việc', 'Ai làm', 'Đi đâu', 'Ghi chú'],
      (G.PL_DINHKY || []).map(function (d) {
        return [h(d.nhip), h(d.viec), h(d.ai), h(d.den), h(d.baoDong || d.cam || '—')];
      }));

    o += U.sec('Sáu luật của lớp pháp lý', '');
    o += '<div class="card">' + (G.PL_LUAT || []).map(function (l) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + l.no + '. ' + h(l.t) + '</b>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(l.y) + '</p></div>';
    }).join('') + '</div>';
    return o;
  };
})();
