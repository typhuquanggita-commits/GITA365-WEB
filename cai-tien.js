/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẠY LUỒNG CẢI TIẾN

   Kho chuẩn ở kho-goc/data.cai-tien.js (CT_TRANG · CT_LOAI · CT_DIEM ·
   CT_LUAT). Tệp này là phần CHẠY: gửi, gán người trả lời, đẩy trạng thái
   theo đồng hồ, nhận hoặc từ chối, và chấm điểm.

   Vì sao phần chạy phải ở src/: tools/ma-hoa-kho.js đóng gói bằng
   JSON.stringify, và JSON.stringify bỏ hàm.

   Sổ đề xuất nằm ở G.S.caiTien, lưu xuống máy cùng sổ việc và dọn khi
   đổi người đăng nhập — đề xuất mang tên người nói và chuyện trong nhà,
   không được ở lại máy cho người sau.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;
  var NGAY = 86400000;

  G.CT_HAN_NGAY = 14;
  G.CT_LYDO_TOITHIEU = 30;

  function so() {
    if (!G.S.caiTien || typeof G.S.caiTien !== 'object') G.S.caiTien = {};
    return G.S.caiTien;
  }
  G.ctSo = so;

  function loaiCua(ma) {
    var ds = G.CT_LOAI || [];
    for (var i = 0; i < ds.length; i++) if (ds[i].ma === ma) return ds[i];
    return null;
  }
  G.ctLoai = loaiCua;

  /* ─── Trạng thái TÍNH RA, không lưu ───
     Lưu trạng thái thì phải có ai đó chạy đồng hồ để đẩy sang QUÁ HẠN.
     Tính ra thì không cần đồng hồ nào cả, và không bao giờ lệch. Cùng
     luật với bảng công việc. */
  G.ctTrangThai = function (d, luc) {
    var t = luc || Date.now();
    if (d.xongLuc) return d.ketQua === 'nhan' ? 'nhan' : 'khong';
    if (t > d.guiLuc + G.CT_HAN_NGAY * NGAY) return 'tre';
    return d.doLuc ? 'dang' : 'moi';
  };

  /* ─── Gửi một đề xuất ───
     Người trả lời được gán NGAY lúc gửi, theo loại. Không có đề xuất nào
     rơi vào khoảng không chờ ai đó nhặt lên. */
  G.CT_NOIDUNG_TOITHIEU = 40;
  G.ctGui = function (maLoai, noiDung) {
    var l = loaiCua(maLoai);
    if (!l) return { ok: false, loi: 'Chưa chọn loại đề xuất.' };
    var nd = String(noiDung || '').trim();
    if (nd.length < G.CT_NOIDUNG_TOITHIEU)
      return { ok: false, loi: 'Cần ít nhất ' + G.CT_NOIDUNG_TOITHIEU +
        ' ký tự: chỗ nào đang vướng, và anh chị nghĩ nên làm khác thế nào.' };
    var luc = Date.now();
    var id = maLoai + '|' + luc;
    so()[id] = { id: id, loai: maLoai, noiDung: nd,
      nguoiGui: (G.S.roleObj && G.S.roleObj.id) || '',
      nguoiTraLoi: l.vai, guiLuc: luc, doLuc: 0, xongLuc: 0,
      ketQua: '', lyDo: '', ngayAp: '', daDoi: '',
      lichSu: [{ luc: luc, vai: (G.S.roleObj && G.S.roleObj.id) || '', viec: 'Gửi đề xuất · chuyển tới ' + l.vai }] };
    if (G.save) G.save();
    return { ok: true, de: so()[id] };
  };

  G.ctMoRa = function (id) {
    var d = so()[id];
    if (!d || d.xongLuc || d.doLuc) return false;
    d.doLuc = Date.now();
    d.lichSu.push({ luc: d.doLuc, vai: d.nguoiTraLoi, viec: 'Đã mở ra đọc' });
    if (G.save) G.save();
    return true;
  };

  /* ─── Nhận ───
     Bắt buộc có ngày áp. Nhận mà không đặt ngày là từ chối lịch sự. */
  G.ctNhan = function (id, ngayAp) {
    var d = so()[id];
    if (!d) return { ok: false, loi: 'Không tìm thấy đề xuất.' };
    if (d.xongLuc) return { ok: false, loi: 'Đề xuất này đã đóng.' };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(ngayAp || '')))
      return { ok: false, loi: 'Phải đặt NGÀY ÁP. Nhận mà không có ngày là từ chối lịch sự, và đắt hơn từ chối thẳng vì người ta còn chờ.' };
    d.xongLuc = Date.now(); d.ketQua = 'nhan'; d.ngayAp = ngayAp;
    d.lichSu.push({ luc: d.xongLuc, vai: d.nguoiTraLoi, viec: 'Nhận · áp ngày ' + ngayAp });
    if (G.save) G.save();
    return { ok: true, de: d };
  };

  /* ─── Không nhận ───
     Bắt buộc có lý do viết ra. "Chưa phù hợp" không phải một lý do. */
  G.ctKhongNhan = function (id, lyDo) {
    var d = so()[id];
    if (!d) return { ok: false, loi: 'Không tìm thấy đề xuất.' };
    if (d.xongLuc) return { ok: false, loi: 'Đề xuất này đã đóng.' };
    var ld = String(lyDo || '').trim();
    if (ld.length < G.CT_LYDO_TOITHIEU)
      return { ok: false, loi: 'Cần lý do ít nhất ' + G.CT_LYDO_TOITHIEU +
        ' ký tự. Từ chối là chuyện bình thường; từ chối không lý do mới là hỏng.' };
    d.xongLuc = Date.now(); d.ketQua = 'khong'; d.lyDo = ld;
    d.lichSu.push({ luc: d.xongLuc, vai: d.nguoiTraLoi, viec: 'Không nhận · đã ghi lý do' });
    if (G.save) G.save();
    return { ok: true, de: d };
  };

  /* ─── Ghi lại đã đổi gì sau khi áp ─── */
  G.ctDaAp = function (id, daDoi) {
    var d = so()[id];
    if (!d || d.ketQua !== 'nhan') return { ok: false, loi: 'Chỉ ghi được cho đề xuất đã nhận.' };
    var dd = String(daDoi || '').trim();
    if (dd.length < G.CT_LYDO_TOITHIEU)
      return { ok: false, loi: 'Ghi rõ đã đổi cái gì, ít nhất ' + G.CT_LYDO_TOITHIEU + ' ký tự.' };
    d.daDoi = dd;
    d.lichSu.push({ luc: Date.now(), vai: d.nguoiTraLoi, viec: 'Đã áp · ghi lại thay đổi' });
    if (G.save) G.save();
    return { ok: true, de: d };
  };

  /* ─── Điểm của một người ───
     Điểm cho việc NÓI RA. Xem G.CT_DIEM và luật số 5. */
  G.ctDiemCua = function (vai) {
    var v = vai || (G.S.roleObj && G.S.roleObj.id);
    var D = G.CT_DIEM || { gui: 0, nhan: 0, ap: 0 };
    var s = so(), d = 0, n = 0;
    Object.keys(s).forEach(function (k) {
      var x = s[k];
      if (x.nguoiGui !== v) return;
      n++; d += D.gui;
      if (x.ketQua === 'nhan') d += D.nhan;
      if (x.daDoi) d += D.ap;
    });
    return { diem: d, so: n };
  };

  G.ctTheoTrang = function () {
    var s = so(), bo = { moi: [], dang: [], tre: [], nhan: [], khong: [] };
    Object.keys(s).forEach(function (k) { bo[G.ctTrangThai(s[k])].push(s[k]); });
    return bo;
  };

  /* Đề xuất đang chờ CHÍNH vai này trả lời */
  G.ctChoToi = function () {
    var v = (G.S.roleObj && G.S.roleObj.id) || '';
    var s = so(), ra = [];
    Object.keys(s).forEach(function (k) {
      if (s[k].nguoiTraLoi === v && !s[k].xongLuc) ra.push(s[k]);
    });
    return ra;
  };

  /* ═══════════ MÀN ═══════════ */
  G.VIEWS['cai-tien'] = function () {
    if (!G.CT_LOAI)
      return U.empty('Chưa mở được luồng cải tiến',
        'Phần này nằm trong gói nghề. Đăng nhập bằng tài khoản có phạm vi ấy để mở.');

    var bo = G.ctTheoTrang();
    var diem = G.ctDiemCua();
    var cho = G.ctChoToi();

    var o = U.ph({ eyebrow: 'CẢI TIẾN TỪ NGƯỜI LÀM', ic: 'lightning', grad: 1,
      t: 'Chỗ nào đang vướng thì nói ra ở đây',
      lead: 'Người làm trực tiếp nhìn thấy chỗ vướng sớm hơn mọi bảng báo cáo. ' +
        'Mọi đề xuất đều có người phải trả lời trong ' + G.CT_HAN_NGAY + ' ngày — ' +
        'im lặng không phải câu trả lời, và một hộp thư góp ý không ai trả lời còn tệ hơn không có hộp nào.' });

    if (cho.length) {
      o += '<div class="card mb" style="border-color:#BE0E1626">' +
        '<b class="sm" style="color:#BE0E16">' + cho.length + ' đề xuất đang chờ chính anh chị trả lời</b>' +
        '<p class="sm dim mt" style="line-height:1.8">Vai của anh chị là người nhận của những loại này. ' +
        'Trả lời được cả hai đường — nhận kèm ngày áp, hoặc không nhận kèm lý do.</p></div>';
    }

    /* Bốn cột, TRỄ đứng trước */
    var cot = [['tre', bo.tre], ['moi', bo.moi], ['dang', bo.dang],
               ['nhan', bo.nhan], ['khong', bo.khong]];
    o += '<div class="grid g2 mb">' + cot.map(function (c) {
      var t = (G.CT_TRANG || []).filter(function (x) { return x.ma === c[0]; })[0] || {};
      return '<div class="card" style="border-color:' + (t.c || '#888') + '26">' +
        '<div class="row wrap" style="gap:8px;align-items:baseline;margin-bottom:6px">' +
        '<b class="sm" style="color:' + t.c + '">' + h(t.ten || c[0]) + '</b>' +
        '<b style="margin-left:auto;font-size:21px;color:' + t.c + '">' + c[1].length + '</b></div>' +
        '<p class="tiny dim" style="line-height:1.7">' + h(t.y || '') + '</p>' +
        (c[1].length ? '<div class="mt">' + c[1].slice(0, 3).map(function (d) {
          var l = loaiCua(d.loai) || {};
          return '<div class="tiny" style="padding:5px 0;border-top:1px solid var(--gita-vien-2)">' +
            '<b>' + h(l.ten || d.loai) + '</b> · ' + h(d.noiDung.slice(0, 70)) +
            (d.noiDung.length > 70 ? '…' : '') +
            '<div class="muted">gửi bởi ' + h(d.nguoiGui) + ' · chờ ' + h(d.nguoiTraLoi) +
            (d.lyDo ? ' · lý do: ' + h(d.lyDo.slice(0, 50)) : '') +
            (d.ngayAp ? ' · áp ngày ' + h(d.ngayAp) : '') + '</div></div>';
        }).join('') + '</div>' : '') + '</div>';
    }).join('') + '</div>';

    o += U.sec('Năm loại đề xuất', 'Chia loại để biết đường gửi tới ai. Gửi nhầm tay là đề xuất chết ngay ở bước đầu.');
    o += U.tbl(['Loại', 'Ai trả lời', 'Ví dụ'],
      (G.CT_LOAI || []).map(function (l) { return [h(l.ten), h(l.vai), h(l.vd)]; }));

    o += '<div class="card mb mt"><b class="sm">Điểm của anh chị</b>' +
      '<p class="sm dim mt" style="line-height:1.8">' + diem.so + ' đề xuất đã gửi · ' +
      diem.diem + ' điểm. ' + h((G.CT_DIEM || {}).y || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' + h((G.CT_DIEM || {}).vi || '') + '</p></div>';

    o += U.sec('Sáu luật của luồng này', 'Viết ra để sau này không ai nới.');
    o += '<div class="card">' + (G.CT_LUAT || []).map(function (l) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + l.no + '. ' + h(l.t) + '</b>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(l.y) + '</p></div>';
    }).join('') + '</div>';
    return o;
  };
})();
