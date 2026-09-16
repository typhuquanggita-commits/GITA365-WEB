/**
 * ═══════════════════════════════════════════════════════════════
 * GITA 365 — PHỤC VỤ TÌNH HUỐNG CHO GIA ĐÌNH, VÀ BẢNG KPI CHO ĐÁNH GIÁ
 * Dán cùng dự án Apps Script, kèm GITA_TinhHuongKhach_DuLieu.gs.
 *
 * ═══ HAI CHỖ HỞ TỆP NÀY ĐÓNG LẠI ═══
 *
 * 1. Chuỗi năm vòng dựng ở bản 9.49 chạy trên kho tình huống. Kho ấy là
 *    TÀI SẢN NGHỀ nên không xuống máy gia đình — chuỗi chạy cho Tư vấn,
 *    im lặng cho gia đình. Đúng nhóm cần nó nhất thì không có.
 *
 *    Bản 9.51 sửa lời hứa 30% cho đúng mẫu số. Đúng, nhưng chưa triệt
 *    để: gia đình vẫn không có chuỗi.
 *
 * 2. Bản 9.51 cấp cho Chuyên gia đánh giá quyền xem mục 'kpi' ở cả năm
 *    tầng — rồi không có cửa nào phục vụ KPI. Một quyền không có cửa là
 *    một quyền không dùng được, và nó nằm đó cho tới ngày ai đó mở một
 *    cửa khác rồi quên kiểm mục.
 *
 * ═══ VÌ SAO ĐI ĐƯỜNG MÁY CHỦ, KHÔNG ĐI ĐƯỜNG GÓI ═══
 *
 * Một gói đã cấp thì không gọi ngược về được. Gỡ quyền hôm nay không
 * xoá được bản sao nằm trong máy người ta từ hôm qua.
 *
 * Đường này thì thu hồi được: máy gia đình nhận theo PHIÊN, giữ trong
 * bộ nhớ, không ghi xuống đĩa. Ngừng phục vụ là phiên sau không còn.
 * Và mỗi lượt nạp là một dòng nhật ký — ngày có một bản rò ra ngoài thì
 * trả lời được câu "ai đã lấy", mà câu ấy chỉ trả lời được nếu hôm nay
 * đã ghi.
 *
 * ═══ CẮT Ở ĐÂY, KHÔNG CẮT Ở MÀN ═══
 *
 * Máy chủ chỉ trả TẦNG NHÀ ẤY ĐANG Ở TRỞ XUỐNG. Trả cả năm tầng rồi để
 * máy khách lọc là gửi đi thứ nhà ấy chưa tới lượt — và mở công cụ nhà
 * phát triển là đọc được hết. Kho này đã mắc đúng lỗi ấy bốn lần.
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * fn:'napTinhHuongKhach'
 * Thân: { u, token }
 * Trả:  { ok, tang, so, tinhHuong: [...] }
 *
 * Không nhận tầng từ thân yêu cầu. Tầng đọc từ HỒ SƠ trong phiên — nhận
 * từ thân thì gõ số 5 là mở cả năm tầng.
 */
function gitaNapTinhHuongKhach_(y, hoSo) {
  var tang = Number(hoSo.tier || 0);
  if (!(tang >= 1))
    return { ok: false, code: 'NOTIER',
      error: 'Tài khoản chưa gắn với tầng nào. Chưa có tầng thì chưa có phần tư liệu nào.' };
  if (tang > GITA_SO_TANG) tang = GITA_SO_TANG;

  if (typeof GITA_TH_KHACH === 'undefined')
    return { ok: false, error: 'Máy chủ chưa nạp bản chiếu tình huống. ' +
      'Dán GITA_TinhHuongKhach_DuLieu.gs vào dự án.' };

  /* Tầng đang ở VÀ mọi tầng đã đi qua — nền của nhà ấy nằm ở các tầng
     dưới, cắt đi là cắt mất phần họ đã trả tiền và đã đi qua. */
  var ra = [];
  for (var t = 1; t <= tang; t++) {
    var ds = GITA_TH_KHACH['T' + t] || [];
    for (var i = 0; i < ds.length; i++) ra.push(ds[i]);
  }

  audit_(hoSo.phien, 'TINHHUONG_KHACH_NAP', 'T' + tang, ra.length + ' tình huống');
  return { ok: true, tang: tang, so: ra.length, tinhHuong: ra };
}

/**
 * fn:'xemKpiKhach' — BẢNG KPI, và chỉ bảng KPI.
 * Thân: { u, token }
 *
 * Cửa dành cho Chuyên gia đánh giá: bản 9.51 cấp cho vai ấy mục 'kpi' ở
 * cả năm tầng nhưng chưa có cửa nào phục vụ. Cửa này qua ĐÚNG cổng mục
 * 'kpi' — vai nào không có mục ấy thì không vào được, kể cả vai có mục
 * 'hoso' rộng hơn: ba mục là ba cổng riêng, không phải ba nhãn trên
 * cùng một cổng.
 *
 * Trả về ĐÚNG cột KPI. Không kèm tên bố mẹ, không kèm ghi chú, không
 * kèm chuỗi nhiệm vụ — đọc chuỗi nhiệm vụ là đọc nhật ký của một nhà,
 * và đó là chỗ vai này bị chặn có chủ ý.
 */
function gitaXemKpiKhach_(y, hoSo) {
  if (gitaXkMucCuaVai_(hoSo.role).indexOf('kpi') < 0) {
    audit_(hoSo.phien, 'XEMKPI_TUCHOI', hoSo.role, 'ngoài mục kpi');
    return { ok: false, code: 'NOPERM',
      error: 'Vai này không xem được bảng KPI. Chỉ xem được: ' +
        gitaXkMucCuaVai_(hoSo.role).join(', ') + '.' };
  }

  /* Trần TẦNG vẫn đứng: mục mở không có nghĩa là mọi tầng đều mở. */
  var duocTang = gitaXkTranCuaVai_(hoSo.role);
  if (!duocTang.length) {
    audit_(hoSo.phien, 'XEMKPI_TUCHOI', hoSo.role, 'ngoài trần tầng');
    return { ok: false, code: 'NOPERM', error: 'Vai này không nằm trong trần vai nào.' };
  }

  var q = gitaSoiQuyenXem_(y, hoSo);
  if (!q.coGiayPhep) {
    audit_(hoSo.phien, 'XEMKPI_TUCHOI', hoSo.role, 'chưa có giấy phép');
    return { ok: false, code: 'NOPERM',
      error: 'Chưa được Super Admin cấp quyền xem. Trần vai mới là ĐỦ ĐIỀU KIỆN.' };
  }

  var ds = [];
  try {
    ds = Store.all('students').filter(function (s) {
      return q.tang.indexOf('T' + Number(s.tier || 0)) >= 0 && !s.deletedAt;
    }).map(function (s) {
      /* ĐÚNG CỘT KPI. Chọn cột ở đây chứ không trả cả bản ghi rồi để máy
         khách bỏ bớt — trả cả bản ghi là gửi đi tên bố mẹ cho một vai
         chỉ được xem con số. */
      return { id: s.id, tier: s.tier, kpi: s.kpi, band: s.band,
        capNhat: s.updatedAt || s.capNhat || null };
    });
  } catch (e) { return { ok: false, error: 'Chưa đọc được sổ học viên.' }; }

  audit_(hoSo.phien, 'XEMKPI', q.tang.join(','), ds.length + ' hồ sơ KPI');
  return { ok: true, muc: 'kpi', tang: q.tang, so: ds.length, kpi: ds };
}
