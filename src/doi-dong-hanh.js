/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẠY LỚP ÉP CỦA ĐỘI ĐỒNG HÀNH

   Kho chuẩn ở kho-goc/data.doi-dong-hanh.js. Tệp này là phần CHẠY, và
   phần chạy quan trọng nhất là ddNhanThem() — hàm TỪ CHỐI.

   VÌ SAO PHẢI CÓ MỘT HÀM TỪ CHỐI

   G.TT_DONGHANH đã viết "kèm tối đa ba nhà" từ bản 9.12. Nhưng một con
   số nằm trong lời thì sáu tháng sau không ai nhớ, và ai cũng giữ tám
   nhà vì "đang thiếu người". Trần mà không có hàm chặn thì không phải
   trần — là một lời nhắc.

   Nên ddNhanThem() trả về `ok:false` kèm câu nói thẳng, và màn hình
   giao việc gọi nó TRƯỚC khi giao. Chặn ở chỗ giao, không chặn ở chỗ
   nhớ.

   MỘT MÁY QUÉT, HAI CHỖ DÙNG

   ddSoiNgonTu() gọi G.hmQuetTuCam() — cùng máy quét với lời hỏi hằng
   ngày. Dựng máy quét thứ hai thì rồi sẽ có ngày hai máy lệch nhau, và
   lúc ấy chuẩn ngôn từ có hai bản, tức là không có bản nào.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h;

  G.ddCap = function (ma) {
    var ds = G.DD_CAP || [];
    for (var i = 0; i < ds.length; i++) if (ds[i].ma === ma) return ds[i];
    return null;
  };

  /* ─── Trần quan hệ ───
     Trả về số tối đa, hoặc 0 khi máy này không có kho ép (vai của gia
     đình). Không có kho thì KHÔNG được đoán một con số — đoán ra 5 rồi
     một ngày ai đó tin con số đoán ấy là luật. */
  G.ddTranCua = function (ma) {
    var c = G.ddCap(ma);
    return c ? c.tran : 0;
  };

  /* ─── Giao thêm một nhà: được hay không ───
     Gọi TRƯỚC khi giao. Thiếu người thì nhận CHẬM lại, không giao dày
     lên — tốc độ của rừng là tốc độ nuôi được người. */
  G.ddNhanThem = function (ma, dangGiu, thieuNguoi) {
    var c = G.ddCap(ma);
    if (!c) return { ok: false, loi: 'Không có cấp nào mang mã ấy.' };
    var giu = Math.max(0, Number(dangGiu) || 0);
    if (giu >= c.tran)
      return { ok: false, tran: c.tran, dangGiu: giu,
        loi: c.ten + ' đang giữ ' + giu + ' ' + c.tranLa + ', đã chạm trần ' + c.tran + '. ' +
          c.viSaoTran + (thieuNguoi ? ' ' + (G.DD_TRAN_LUAT || {}).thieuNguoi : '') };
    return { ok: true, tran: c.tran, dangGiu: giu, con: c.tran - giu };
  };

  /* ─── Chín phần mười có cộng đúng không ───
     Ba số cộng phải bằng một trăm, và phần dạy phải bằng KHÔNG. Sai một
     trong hai thì chuẩn đã bị nới, và nới rồi thì không ai đo lại. */
  G.ddSoi9010 = function () {
    var q = G.DD_9010;
    if (!q) return ['thiếu DD_9010'];
    var loi = [];
    var tong = (q.hoi || 0) + (q.keChuyenMinh || 0) + (q.day || 0);
    if (tong !== 100) loi.push('tổng=' + tong);
    if (q.day !== 0) loi.push('dạy=' + q.day);
    if (q.hoi < 90) loi.push('hỏi=' + q.hoi);
    return loi;
  };

  /* ─── Ba cấp có nối vào thang đã có không ───
     `maTT` phải trỏ vào một mã có thật trong G.TT_DONGHANH. Hai thang
     song song thì sẽ có ngày lệch nhau, và lúc ấy không ai biết tin
     cái nào. */
  G.ddNoiThang = function () {
    var co = (G.TT_DONGHANH || []).map(function (d) { return d.ma; });
    if (!co.length) return [];      /* chưa nạp gói nghề thì không kết luận */
    return (G.DD_CAP || []).filter(function (c) { return co.indexOf(c.maTT) < 0; })
      .map(function (c) { return c.ma + '→' + c.maTT; });
  };

  /* ─── Những câu THẬT SỰ nói với gia đình trong sổ tay ───
     Cột `sai` và cột `xau` KHÔNG vào đây. Chúng là ví dụ để đối chiếu;
     quét chúng vào thì phép kiểm đỏ vĩnh viễn, và rồi ai đó sẽ tắt
     phép kiểm — đó là cách một chuẩn chết. */
  G.ddLoiNoiVoiNha = function () {
    var ds = [];
    (G.DD_TINHHUONG || []).forEach(function (x) { ds.push(['DD_TINHHUONG.' + x.so, x.dung]); });
    (G.DD_THAY || []).forEach(function (x, i) { ds.push(['DD_THAY.' + i, x.tot]); });
    (G.DD_HOI || []).forEach(function (n) {
      (n.mau || []).forEach(function (m, i) { ds.push(['DD_HOI.' + n.nhom + '.' + i, m]); });
    });
    (G.DD_HUA || []).forEach(function (x) { ds.push(['DD_HUA.' + x.ma, x.t]); });
    return ds;
  };

  G.ddSoiNgonTu = function () {
    return G.hmQuetTuCam ? G.hmQuetTuCam(G.ddLoiNoiVoiNha()) : [];
  };

  /* ─── Tình huống nào chưa đủ hai vế ───
     Mỗi tình huống phải có một câu SAI và một câu ĐÚNG khác nhau thật.
     Câu sai giống câu đúng thì bài học ấy không dạy được gì. */
  G.ddSoiTinhHuong = function () {
    return (G.DD_TINHHUONG || []).filter(function (x) {
      return !x.khi || !x.sai || !x.dung || !x.vi ||
        String(x.sai).trim() === String(x.dung).trim();
    }).map(function (x) { return 'TH' + x.so; });
  };

  /* ═══════════ MÀN: NGƯỜI ĐI CÙNG NHÀ MÌNH ═══════════
     Một màn, hai tầng sâu. Gia đình có G.DD_HUA nên đọc được LỜI HỨA —
     lời hứa không kiểm được thì không phải lời hứa. Phần sổ tay chỉ
     dựng ra khi máy CÓ G.DD_TINHHUONG, tức là vai có gói nghề. Đó là
     cách chặn thật; ẩn bằng câu lệnh if thì mở công cụ nhà phát triển
     là đọc được. */
  G.VIEWS['doi-dong-hanh'] = function () {
    if (!G.DD_HUA)
      return U.empty('Chưa mở được phần người đi cùng', 'Phần này nằm trong gói nền. Đăng nhập lại để nạp.');

    var o = U.ph({ eyebrow: 'NGƯỜI ĐI CÙNG NHÀ MÌNH', ic: 'heart', grad: 1,
      t: 'Người đi cùng không dạy cây lớn — họ chưa quên cảm giác của hạt',
      lead: 'Người đi cùng nhà mình được chọn từ gia đình đã đi qua đoạn đường nhà mình đang đứng. ' +
        'Không phải chuyên gia. Chuyên gia nói đúng, nhưng đúng chưa từng làm ai kiên trì.' });

    o += U.sec('Năm điều họ hứa với nhà mình',
      'Đây là những điều nhà mình có quyền đòi. Một lời hứa không kiểm được thì không phải lời hứa.');
    o += '<div class="card mb">' + (G.DD_HUA || []).map(function (x) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(x.t) + '</b>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(x.y) + '</p></div>';
    }).join('') + '</div>';

    /* ── Phần của nghề ── */
    if (!G.DD_CAP) return o;

    o += U.sec('Trần quan hệ — con số, không phải lời khuyên',
      ((G.DD_TRAN_LUAT || {}).luat || ''));
    o += U.tbl(['Cấp', 'Trần', 'Vào từ đâu', 'Vì sao trần này', 'Cấm sai', 'Hậu quả'],
      (G.DD_CAP || []).map(function (c) {
        return [h(c.ten), h(c.tran + ' ' + c.tranLa), h(c.vaoTu), h(c.viSaoTran), h(c.camSai), h(c.hauQua)];
      }));
    o += '<p class="tiny dim mb" style="line-height:1.7">' + h((G.DD_TRAN_LUAT || {}).vi || '') + ' ' +
      h((G.DD_TRAN_LUAT || {}).thieuNguoi || '') + '</p>';

    var q = G.DD_9010 || {};
    o += U.sec('Chín phần mười', (q.vi || ''));
    o += '<div class="card mb"><div class="row wrap" style="gap:16px">' +
      '<b style="color:#0B7350">Hỏi ' + q.hoi + '%</b>' +
      '<b style="color:#B4720F">Kể chuyện của chính mình ' + q.keChuyenMinh + '%</b>' +
      '<b style="color:#BE0E16">Dạy ' + q.day + '%</b></div>' +
      '<p class="tiny dim mt" style="line-height:1.7"><b>Đo bằng:</b> ' + h(q.doBang || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.7">' + h(q.lech1 || '') + ' ' + h(q.lech2 || '') + '</p></div>';

    var hl = G.DD_HATLAI || {};
    o += '<div class="card mb" style="border-color:#0B73503e">' +
      '<span class="tiny up" style="color:#0B7350">ĐIỀU KIỆN VÀO NGHỀ · ' + h(hl.ten || '') + ' · ' + (hl.gio || 0) + ' GIỜ</span>' +
      '<p class="sm mt" style="line-height:1.8">' + h(hl.lam || '') + '</p>' +
      '<p class="sm mt" style="line-height:1.8"><b>Xong khi:</b> ' + h(hl.xong || '') + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(hl.vi || '') + ' ' + h(hl.camBo || '') + '</p></div>';

    o += U.sec('Mười hai dạng câu hỏi', 'Ba nhóm. Mỗi nhóm có một câu tuyệt đối không được đổi thành.');
    o += (G.DD_HOI || []).map(function (n) {
      return '<div class="card mb">' +
        '<b class="sm">' + h(n.ten) + '</b>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(n.y) + '</p>' +
        '<div class="mt">' + (n.mau || []).map(function (m) {
          return '<div class="sm" style="padding:5px 0;line-height:1.7">· ' + h(m) + '</div>';
        }).join('') + '</div>' +
        '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>Không bao giờ đổi thành:</b> ' + h(n.camDoi) + '</p></div>';
    }).join('');

    o += U.sec('Hai mươi tình huống — câu giết hạt và câu nuôi hạt',
      'Cột bên trái là câu cố ý để lại, để đối chiếu. Đọc xong rồi thì quên câu bên trái, nhớ câu bên phải.');
    o += U.tbl(['Khi nào', 'Câu giết hạt', 'Câu nuôi hạt', 'Vì sao'],
      (G.DD_TINHHUONG || []).map(function (x) {
        return [h(x.khi), h(x.sai), h(x.dung), h(x.vi)];
      }));

    o += U.sec('Thay lời', '');
    o += U.tbl(['Thay vì nói', 'Hãy nói'],
      (G.DD_THAY || []).map(function (x) { return [h(x.xau), h(x.tot)]; }));

    o += U.sec('Bảng chấm của chính người kèm',
      'Điểm được lắng nghe nặng nhất, và nó là chỉ số duy nhất người kèm không ra lệnh được.');
    o += U.tbl(['Chỉ số', 'Trọng số', 'Đo bằng', 'Vì sao không làm đẹp bằng tay được'],
      (G.DD_KPI || []).map(function (k) {
        return [h(k.ten), Math.round(k.trong * 100) + '%', h(k.doBang), h(k.khongLamDep)];
      }));

    o += U.sec('Bảy luật của đội đồng hành', '');
    o += '<div class="card">' + (G.DD_LUAT || []).map(function (l) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + l.no + '. ' + h(l.t) + '</b>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(l.y) + '</p></div>';
    }).join('') + '</div>';
    return o;
  };
})();
