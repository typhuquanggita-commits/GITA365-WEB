/* ═══════════════════════════════════════════════════════════════
   GITA 365 — TỔNG QUAN HÔM NAY (ít chữ · KPI sống · đòn bẩy)

   Chủ hệ: trang hiện đại hơn, tinh gọn hơn, ÍT CHỮ hơn; nhân sự dễ
   theo dõi nhiệm vụ · tiến trình · KPI · và biết cập nhật giải pháp
   tối ưu cho khách. Hệ thống đòn bẩy tối tân nhất.

   Màn này KHÔNG dựng lại con số — nó ĐỌC thẳng hai cửa đã có
   (docDongChay · docKpiCayTien) và bày ra thành thẻ. Mỗi thẻ bấm mở
   đúng màn sâu. Đòn bẩy = chỉ số "kho giải pháp đã dùng × lần" — một
   giải pháp duyệt một lần phục vụ mãi, 0 token mỗi lần.

   TRỎ, KHÔNG CHÉP (HE-L1): mọi con số do máy chủ tính từ D1; màn này
   chỉ vẽ. Không ô tự khai, không số cứng.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;
  function nut(on, nd, k) { return '<button class="btn ' + (k || 'ghost') + ' sm" onclick="' + on + '">' + nd + '</button>'; }
  function so(n) { return Number(n || 0).toLocaleString('vi-VN'); }
  function tien(n) { return so(n) + ' đ'; }

  G.tqTai = function () {
    if (!G.goiMayChu || G.tqDangTai) return;
    G.tqDangTai = true;
    Promise.all([
      G.goiMayChu('docDongChay', { ngay: 30 }).catch(function () { return { ok: false }; }),
      G.goiMayChu('docKpiCayTien', {}).catch(function () { return { ok: false }; })
    ]).then(function (r) {
      G.tqDangTai = false; G.tqDC = r[0]; G.tqCT = r[1];
      if (G.S && G.S.view === 'tong-quan' && G.render) G.render();
    });
  };

  /* Một thẻ: số to · nhãn · bấm mở màn sâu. `sac`: ok · sau · do · thuong. */
  function the(v, so2, nhan, duoi, sac) {
    var mau = { ok: 'var(--ok)', sau: 'var(--gita-sau)', do: 'var(--gita-do)', thuong: 'var(--ink-2)' }[sac || 'thuong'];
    return '<button class="card tq-the" data-v="' + h(v) + '" style="text-align:left;cursor:pointer">' +
      '<div class="tq-so" style="color:' + mau + '">' + so2 + '</div>' +
      '<div class="tq-nhan">' + h(nhan) + '</div>' +
      (duoi ? '<div class="tq-duoi tiny muted">' + duoi + '</div>' : '') + '</button>';
  }

  G.VIEWS['tong-quan'] = function () {
    var dc = G.tqDC, ct = G.tqCT;
    var o = '<div class="hd"><h2>' + ic('pulse') + ' Tổng quan</h2>' +
      '<p class="sub">30 ngày qua · mọi con số tính lúc đọc từ dữ liệu thật, không ô nhập tay. ' +
      'Bấm một thẻ để mở đúng màn sâu.</p></div>';
    o += '<div class="row">' + nut('G.tqTai()', 'Làm mới') + '</div>';

    if (!dc) { if (G.goiMayChu) G.tqTai(); return o + '<div class="card mt tiny muted">Đang đọc…</div>'; }
    if (!dc.ok) return o + '<div class="card mt" style="color:var(--gita-do)">' + h(dc.error || 'Không đọc được.') + ' ' + nut('G.tqTai()', 'Thử lại') + '</div>';

    /* ── VIỆC CẦN LÀM NGAY (đòn bẩy: mở đúng chỗ đỏ) ── */
    var doBan = Object.keys(dc.ban || {}).filter(function (m) { return dc.ban[m].danhGia === 'can-nang-cap'; });
    var tenBan = {}; (G.TD_BAN || []).forEach(function (b) { tenBan[b.ma] = b.ten; });
    o += '<div class="card mt" style="border-color:' + (doBan.length ? 'var(--gita-do)' : 'var(--ok)') + '">' +
      '<b>' + (doBan.length ? ic('alert') + ' ' + doBan.length + ' việc cần xử lý' : ic('check') + ' Mọi ban đạt chuẩn') + '</b>';
    if (doBan.length) o += '<div class="row mt" style="gap:6px;flex-wrap:wrap">' + doBan.map(function (m) {
      return '<button class="btn ghost sm" data-v="truy-van-da-chieu" style="border-color:var(--gita-do);color:var(--gita-do)">' + h(m) + ' ' + h(tenBan[m] || '') + '</button>';
    }).join('') + '</div>';
    o += '</div>';

    /* ── BỐN DÒNG — mỗi dòng một hàng thẻ, ít chữ ── */
    o += '<h3 class="hvh-h">' + ic('chart') + ' Dòng chảy</h3><div class="tq-luoi">';
    o += the('truy-van-da-chieu', tien(dc.tien.rong), 'Dòng tiền ròng', 'thu ' + tien(dc.tien.thu) + ' − hoàn − hoa hồng', dc.tien.rong >= 0 ? 'ok' : 'do');
    o += the('truy-van-da-chieu', tien(dc.chiPhi.tong), 'Chi phí vận hành', 'kỳ này', 'thuong');
    o += the('truy-van-da-chieu', so(dc.giaTri.lenTang), 'Lượt lên tầng', 'giá trị khách nhận', 'ok');
    o += the('truy-van-da-chieu', so(dc.congViec.tongLuot), 'Lượt việc ghi sổ', 'trung bình ' + so(dc.congViec.trungBinhNgay) + '/ngày', 'thuong');
    o += '</div>';

    /* ── CÂY TIỀN — ba đích ── */
    if (ct && ct.ok && ct.kpi) {
      o += '<h3 class="hvh-h">' + ic('star') + ' Cây tiền</h3><div class="tq-luoi">';
      ct.kpi.forEach(function (k) {
        o += the('bo-may-tap-doan', k.giaTri + '%', k.ten, 'đích ' + k.dich + '%' + (k.dat ? '' : ' · thiếu ' + k.conThieu), k.dat ? 'ok' : 'sau');
      });
      o += '</div>';
    }

    /* ── ĐÒN BẨY — kho giải pháp & bộ não ── */
    o += '<h3 class="hvh-h">' + ic('orbit') + ' Đòn bẩy</h3><div class="tq-luoi">';
    o += the('bo-nao-da-tri', so(dc.giaTri.khoDung) + ' lần', 'Kho giải pháp đã dùng', 'duyệt một lần · phục vụ mãi · 0 token mỗi lần', 'ok');
    o += the('bo-nao-da-tri', so(dc.giaTri.tuyenXong), 'Tuyến dự án hoàn tất', 'mỗi tuyến có chốt chặn', 'thuong');
    o += the('bo-nao-da-tri', so(dc.giaTri.baiHoc), 'Bài học khách hoàn thành', 'kỳ này', 'thuong');
    o += the('bo-nao-da-tri', so(dc.giaTri.wow), 'Lượt WOW ghi sổ', 'điểm chạm có căn cứ', 'ok');
    o += '</div>';

    o += '<p class="note hvh-note">Mọi thẻ đọc từ docDongChay · docKpiCayTien (máy chủ tính từ D1). ' +
      'Muốn sâu hơn: màn <b data-v="truy-van-da-chieu">Truy vấn đa chiều</b> (bảng điểm 16 ban) · ' +
      '<b data-v="bo-may-tap-doan">Bộ máy tập đoàn</b> · <b data-v="bo-nao-da-tri">Bộ não V20</b>.</p>';
    return o;
  };
})();
