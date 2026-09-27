/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÀN VÒNG TỰ HOÀN THIỆN  (9.99.96)

   Theo tình huống 5: kho rỗng lúc tư vấn → Bộ não soạn từ dữ liệu đã
   có → cấp phép ba cấp → 入库. Màn này của người NHÀ (R01–R12) để soi
   sổ phát sinh, bản nháp chờ duyệt, và tự đo cái răng.

   Răng nằm ở MÁY CHỦ (may-chu/tu-hoan-thien.js), không ở màn. Màn chỉ
   hiện trạng thái; mọi cổng chặn ở cửa máy chủ — một bản nháp chưa đủ
   ba chữ ký thì nhapKho từ chối, dù màn có nút gì.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  var NGAN = [
    {ma: 'phatsinh', ten: 'Sổ phát sinh', ic: 'list'},
    {ma: 'nhap',     ten: 'Bản nháp chờ duyệt', ic: 'edit'},
    {ma: 'rb',       ten: 'Cẩm nang ứng phó', ic: 'shield'},
    {ma: 'giamsat',  ten: 'Giám sát chia sẻ', ic: 'eye'},
    {ma: 'luat',     ten: 'Luật', ic: 'shield'},
    {ma: 'khong',    ten: 'Chỗ không làm', ic: 'lock'}
  ];

  G.thtNgan = G.thtNgan || 'phatsinh';
  G.thtSo = G.thtSo || null;

  function veLai() {
    if (!G.S || G.S.view !== 'tu-hoan-thien') return;
    if (typeof document === 'undefined' || !document.getElementById('main')) return;
    G.render && G.render();
  }
  G.thtMoNgan = function (ma) { G.thtNgan = ma; veLai(); };

  G.thtTaiSo = function () {
    if (!G.goiMayChu) return;
    G.goiMayChu('soatTuHoanThien', {}).then(function (x) {
      G.thtSo = x; veLai();
    }).catch(function (e) {
      G.thtSo = {ok: false, error: e && e.message}; veLai();
    });
  };

  function tenLoai(ma) {
    var d = (G.THT_PHATSINH_LOAI || []).filter(function (x) { return x.ma === ma; })[0];
    return d ? d.ten : ma;
  }
  function chuoiKho() {
    return { kho: G.THT_CAP || [], camNang: G.THT_CAMNANG || [], ungPho: G.THT_UNGPHO || [] };
  }
  function moiCap() {
    var ra = [], ch = chuoiKho();
    Object.keys(ch).forEach(function (k) { (ch[k] || []).forEach(function (c) { ra.push(c); }); });
    return ra;
  }
  function tenCap(ma) {
    var d = moiCap().filter(function (x) { return x.ma === ma; })[0];
    return d ? d.ten : ma;
  }

  /* ── NGĂN 1 · SỔ PHÁT SINH ── */
  function vePhatSinh() {
    var o = U.sec('Sổ phát sinh — ghi NGAY',
      'Mỗi lỗ gặp lúc tư vấn (kho rỗng · phản hồi xấu · câu hỏi ngoài kịch bản · dữ liệu ' +
      'khách khai giả) vào sổ ngay. Cái đáng ngờ nhất là những phát sinh bị bỏ đi không ghi.');
    o += U.tbl(['Mã', 'Loại', 'Vì sao ghi'],
      (G.THT_PHATSINH_LOAI || []).map(function (l) {
        return [h(l.ma), h(l.ten), h(l.vi)];
      }));
    var so = G.thtSo;
    if (so && so.ok && so.phatSinh) {
      if (so.phatSinh.length) {
        o += U.sec('Đã ghi trong sổ', '');
        o += U.tbl(['Loại', 'Số lượt'],
          so.phatSinh.map(function (r) { return [h(tenLoai(r.loai)), String(r.n)]; }));
      } else {
        o += '<p class="note">Sổ phát sinh chưa có dòng nào.</p>';
      }
    } else {
      o += '<p class="note"><button class="btn" onclick="G.thtTaiSo()">Tải sổ từ máy chủ</button></p>';
    }
    return o;
  }

  /* ── NGĂN 2 · BẢN NHÁP CHỜ DUYỆT ── */
  function veNhap() {
    var o = U.sec('Bản nháp chờ đủ ba chữ ký',
      'Máy SOẠN từ dữ liệu đã có, ghi vào staging. Đủ ba cấp hay chưa tính LÚC ĐỌC từ sổ ' +
      'chữ ký — không cột "đãDuyệt". Chỉ khi đủ ba chữ ký của ba người khác nhau thì Super ' +
      'Admin mới 入库.');
    var ch = chuoiKho();
    Object.keys(ch).forEach(function (k) {
      var ten = k === 'kho' ? 'Chuỗi LẤP KHO (kho rỗng)'
        : k === 'camNang' ? 'Chuỗi CẨM NANG (gỡ ca khó)'
        : 'Chuỗi ỨNG PHÓ (đối thủ · quá tải · gửi sai)';
      o += U.sec(ten, '');
      o += U.tbl(['Thứ', 'Cấp', 'Vai ký', 'Việc'],
        (ch[k] || []).map(function (c) {
          return [String(c.thu), h(c.ten), '<code>' + h(c.vai) + '</code>', h(c.lam)];
        }));
    });
    var so = G.thtSo;
    if (so && so.ok && so.nhap) {
      if (so.nhap.length) {
        o += U.tbl(['Loại', 'Kho', 'Tiêu đề', 'Người soạn', 'Đã ký', 'Còn thiếu', 'Trạng thái'],
          so.nhap.map(function (n) {
            var da = (n.daKy || []).map(tenCap).join(', ') || '—';
            var thieu = (n.thieu || []).map(tenCap).join(', ') || '—';
            var tt = n.trangThai === 'daNhap'
              ? '<b>đã 入库</b>' : (n.du ? 'đủ — chờ Super Admin 入库' : 'chờ duyệt');
            return [h(n.loaiDuyet || 'kho'), h(n.tenKho), h(n.tieuDe), h(n.aiSoan), h(da), h(thieu), tt];
          }));
      } else {
        o += '<p class="note">Chưa có bản nháp nào.</p>';
      }
      if (so.khongGopSo) o += '<p class="note">' + h(so.khongGopSo) + '</p>';
    } else {
      o += '<p class="note"><button class="btn" onclick="G.thtTaiSo()">Tải sổ từ máy chủ</button></p>';
    }
    return o;
  }

  /* ── NGĂN · CẨM NANG ỨNG PHÓ ── */
  function veRB() {
    var o = U.sec('Cẩm nang ứng phó — viết trước (tình huống 7)',
      'Đối thủ chơi xấu, quá tải, gửi nhầm: mỗi tờ viết TRƯỚC vì lúc chuyện xảy ra không ai ngồi ' +
      'nghĩ ra quy trình. Mọi ứng phó qua kênh HỢP PHÁP — không phản công trái phép, không bôi ' +
      'nhọ đối thủ, sự cố nói thật với khách. Phương án cho một sự cố cụ thể vẫn đi qua chuỗi ' +
      'ứng phó (Ban vận hành → Giám đốc → Super Admin).');
    o += U.tbl(['Mã', 'Tình huống', 'Các bước', 'Ai', 'Trong bao lâu', 'KHÔNG làm'],
      (G.THT_RB || []).map(function (r) {
        return [h(r.ma), h(r.tinhHuong), h(r.buoc), h(r.ai), h(r.trongBaoLau), h(r.khongLam)];
      }));
    return o;
  }

  /* ── NGĂN · GIÁM SÁT CHIA SẺ TÀI KHOẢN ── */
  function veGiamSat() {
    var lu = G.THT_GIAMSAT_LUAT || {};
    var o = U.sec('Mười cách giám sát chia sẻ tài khoản (tình huống 10)',
      'Chủ hệ đòi ít nhất mười cách rồi TỔNG HỢP. Không một dấu hiệu nào tự kết luận — một gia ' +
      'đình dùng chung một máy là bình thường. Máy báo động, người quyết; không khoá tự động.');
    o += U.tbl(['Mã', 'Cách', 'Đo gì', 'Ai đo'],
      (G.THT_GIAMSAT || []).map(function (g) {
        return [h(g.ma), h(g.cach), h(g.do), g.loai === 'mayDo' ? 'máy' : 'người'];
      }));
    var hang = [
      ['Tổng hợp, không một dấu hiệu', lu.tongHopKhongMotDauHieu],
      ['Không khoá tự động', lu.khongKhoaTuDong],
      ['Có trần, không rình', lu.coTranKhongRinh]
    ].filter(function (r) { return r[1]; });
    o += U.tbl(['Luật', 'Nội dung'], hang.map(function (r) { return [h(r[0]), h(r[1])]; }));
    return o;
  }

  /* ── NGĂN · LUẬT ── */
  function veLuat() {
    var lu = G.THT_LUAT || {};
    var hang = [
      ['Máy soạn, không nhập', lu.maySoanKhongNhap],
      ['Đủ tính lúc đọc', lu.duTinhLucDoc],
      ['Ba người khác nhau', lu.baNguoiKhacNhau],
      ['Kho rỗng nói thật', lu.khoRongNoiThat],
      ['Nháp không phục vụ', lu.nhapKhongPhucVu],
      ['Chưa cấp thì chờ', lu.chuaCapThiCho],
      ['Ghi ngay', lu.ghiNgay]
    ].filter(function (r) { return r[1]; });
    var o = U.sec('Bảy luật của vòng tự hoàn thiện', '');
    o += U.tbl(['Luật', 'Nội dung'], hang.map(function (r) { return [h(r[0]), h(r[1])]; }));
    return o;
  }

  /* ── NGĂN 4 · CHỖ KHÔNG LÀM ── */
  function veKhong() {
    var o = U.sec('Chỗ cố ý không làm, và vì sao',
      'Bốn chỗ đúng là tình huống 5 chạm tới: vượt cấp không phí, dữ liệu giả thành kết luận, ' +
      'tự 入库 cho khách khỏi chờ, và dựng một câu nghe hợp lý cho câu ngoài kịch bản.');
    o += U.tbl(['Mã', 'Không làm gì', 'Vì sao'],
      (G.THT_KHONG_LAM || []).map(function (k) {
        return [h(k.ma), h(k.doi), h(k.vi)];
      }));
    var cho = G.THT_CHOCHU || [];
    if (cho.length) {
      o += U.sec('Sổ chờ chủ hệ', '');
      o += U.tbl(['Mã', 'Việc', 'Hỏi gì'],
        cho.map(function (c) { return [h(c.ma), h(c.t), h(c.hoi)]; }));
    }
    return o;
  }

  G.VIEWS['tu-hoan-thien'] = function () {
    var o = '<div class="hd"><h2>' + ic('spark') + ' Vòng tự hoàn thiện · lấp kho có cấp phép</h2>' +
      '<p class="sub">Kho rỗng lúc tư vấn thì Bộ não SOẠN từ dữ liệu đã có, nhưng đưa vào kho ' +
      'phục vụ khách (入库) phải qua Bộ phận sản phẩm → Giám đốc → Super Admin. Sự chậm là có ' +
      'thật, và được nói thẳng với khách — không giấu, không bịa.</p></div>';

    /* Vai không có gói nghề thì kho THT không nạp — một chỗ chặn TRƯỚC
       mọi ngăn (bài học 9.99.63). */
    if (!(G.THT_CAP || []).length) {
      return o + U.empty('Vòng tự hoàn thiện thuộc gói nghề',
        'Màn này là công cụ vận hành của Học viện: nó điều phối việc Bộ não soạn nội dung lấp ' +
        'kho rỗng và chuỗi cấp phép ba cấp trước khi nội dung ra phục vụ khách. Gia đình không ' +
        'điều phối việc ấy, nên với vai này màn không có gì để dựng. Ba cấp cấp phép, bảy luật ' +
        'và bốn loại phát sinh đều nằm trong gói nghề.');
    }

    o += '<div class="tabs">' + NGAN.map(function (n) {
      return '<button class="tab' + (G.thtNgan === n.ma ? ' on' : '') + '" onclick="G.thtMoNgan(\'' +
        n.ma + '\')">' + ic(n.ic) + ' ' + h(n.ten) + '</button>';
    }).join('') + '</div>';

    if (G.thtNgan === 'phatsinh') o += vePhatSinh();
    else if (G.thtNgan === 'nhap') o += veNhap();
    else if (G.thtNgan === 'rb') o += veRB();
    else if (G.thtNgan === 'giamsat') o += veGiamSat();
    else if (G.thtNgan === 'luat') o += veLuat();
    else o += veKhong();

    if (!G.thtSo) setTimeout(function () { G.thtTaiSo(); }, 0);
    return o;
  };
})();
