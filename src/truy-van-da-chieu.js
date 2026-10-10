/* ═══════════════════════════════════════════════════════════════
   GITA 365 — TRUY VẤN ĐA CHIỀU · BỐN DÒNG CHẢY · BẢNG ĐIỂM 16 BAN

   Màn đọc cửa docDongChay (may-chu/dong-chay.js). Tên ban lấy từ
   G.TD_BAN (bo-may-tap-doan.js) — KHÔNG chép lại tên ban ở đây.

   "Các phòng ban bắt buộc nâng cấp, làm chuẩn" được hiện thực bằng
   bảng điểm: tín hiệu xấu vượt ngưỡng khai ở máy chủ thì ban ấy ĐỎ.
   Hệ thống lộ sáng con số — việc nâng cấp là của người (AT5).
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;
  function nut(on, nd, k) { return '<button class="btn ' + (k || 'ghost') + ' sm" onclick="' + on + '">' + nd + '</button>'; }
  /* null = máy chủ không đo được chỉ số ấy (bảng chưa có trên D1 này…).
     Hiện "chưa đo được", không hiện 0 — một số thiếu đọc ra như số 0 là
     một lời nói dối mang dấu hệ thống. */
  var CHUA = 'chưa đo được';
  function tien(n) { return n === null || n === undefined ? CHUA : Number(n).toLocaleString('vi-VN') + ' đ'; }
  function soO(n, duoi) { return n === null || n === undefined ? CHUA : n + (duoi || ''); }

  G.dcNgay = G.dcNgay || 30;
  G.dcTai = function (ngay) {
    if (ngay) G.dcNgay = ngay;
    if (!G.goiMayChu || G.dcDangTai) return;
    G.dcDangTai = true;
    G.goiMayChu('docDongChay', { ngay: G.dcNgay }).then(function (x) {
      G.dcDangTai = false; G.dc = x || { ok: false, error: 'Không có phản hồi.' };
      if (G.S && G.S.view === 'truy-van-da-chieu' && G.render) G.render();
    });
  };

  function theDong(ten, ic2, cacSo) {
    return '<div class="hvh-tru-o"><div class="hvh-tru-dau"><b>' + ic(ic2, 'w-4 h-4') + ' ' + h(ten) + '</b></div>' +
      cacSo.map(function (s) {
        return '<p class="hvh-meta">' + h(s[0]) + ': <b>' + h(s[1]) + '</b>' + (s[2] ? ' <span class="tiny muted">' + h(s[2]) + '</span>' : '') + '</p>';
      }).join('') + '</div>';
  }

  G.VIEWS['truy-van-da-chieu'] = function () {
    var d = G.dc;
    var o = '<div class="hd"><h2>' + ic('chart') + ' Truy vấn đa chiều — bốn dòng chảy & bảng điểm 16 ban</h2>' +
      '<p class="sub">Dòng tiền · dòng chi phí · dòng giá trị · dòng công việc — tính lúc đọc từ D1, không ô nhập tay. ' +
      'Ban nào có tín hiệu xấu vượt ngưỡng thì <b style="color:var(--gita-do)">đỏ — cần nâng cấp</b>.</p></div>';
    o += '<div class="row mt" style="gap:6px">' + [7, 30, 90, 365].map(function (n) {
      return '<button class="btn ' + (G.dcNgay === n ? 'pri' : 'ghost') + ' sm" onclick="G.dcTai(' + n + ')">' + n + ' ngày</button>';
    }).join('') + nut('G.dcTai()', 'Tải lại') + '</div>';

    if (!d) { if (G.goiMayChu) G.dcTai(); return o + '<div class="card mt tiny muted">Đang đọc từ máy chủ…</div>'; }
    if (!d.ok) return o + '<div class="card mt" style="color:var(--gita-do)">' + h(d.error || 'Không đọc được.') + '</div>';

    /* ── BỐN DÒNG CHẢY ── */
    o += '<h3 class="hvh-h">' + ic('chart') + ' Bốn dòng chảy · ' + d.ngay + ' ngày qua</h3><div class="hvh-tru">';
    o += theDong('Dòng tiền', 'chart', [
      ['Thu đã duyệt', tien(d.tien.thu)], ['Hoàn tiền', tien(d.tien.hoan)], ['Hoa hồng đã trả', tien(d.tien.hoaHong)],
      ['Dòng tiền ròng', tien(d.tien.rong), 'thu − hoàn − hoa hồng']]);
    o += theDong('Dòng chi phí', 'grid', [
      ['Chi phí vận hành', tien(d.chiPhi.tong)],
      ['Khoản lớn nhất', (d.chiPhi.top[0] ? d.chiPhi.top[0].khoanMuc + ' · ' + tien(d.chiPhi.top[0].n) : '—')],
      ['Lương kỳ gần nhất', d.chiPhi.luong ? tien(d.chiPhi.luong.n) + ' · ' + d.chiPhi.luong.soNguoi + ' người · kỳ ' + d.chiPhi.luong.ky : 'chưa có'],
      ['Token AI', d.chiPhi.aiToken === null ? CHUA : (d.chiPhi.aiToken || []).map(function (x) { return x.ncc + ' ' + Number(x.n).toLocaleString('vi-VN'); }).join(' · ') || '0', 'token, không phải tiền']]);
    o += theDong('Dòng giá trị khách nhận', 'spark', [
      ['Bài học hoàn thành', soO(d.giaTri.baiHoc)], ['Lượt WOW ghi sổ', soO(d.giaTri.wow)],
      ['Lượt lên tầng', soO(d.giaTri.lenTang)], ['Kho giải pháp đã dùng', soO(d.giaTri.khoDung, ' lần'), '0 token mỗi lần'],
      ['Tuyến dự án hoàn tất', soO(d.giaTri.tuyenXong)]]);
    o += theDong('Dòng công việc', 'pulse', [
      ['Tổng lượt ghi sổ', soO(d.congViec.tongLuot)], ['Trung bình/ngày', soO(d.congViec.trungBinhNgay)],
      ['Việc nhiều nhất', d.congViec.top[0] ? d.congViec.top[0].viec + ' · ' + d.congViec.top[0].n + ' lượt' : '—']]);
    o += '</div>';
    if (d.chuaDo && d.chuaDo.length)
      o += '<div class="card mt tiny" style="color:var(--gita-do-ink)"><b>' + d.chuaDo.length + ' chỉ số chưa đo được trên máy chủ này:</b> ' +
        h(d.chuaDo.join(' · ')) + '. Phần còn lại vẫn đúng. Bảng còn thiếu trên D1 được dựng bằng lệnh <span class="mono">npx wrangler d1 execute gita365 --file=csdl.sql --remote</span> (docs/TRIEN_KHAI_WEB.md).</div>';

    if (d.tien.theoThang && d.tien.theoThang.length)
      o += '<div class="card mt"><b>Thu theo tháng (6 kỳ gần nhất)</b><table class="tbl sm mt"><tr><th>Tháng</th><th>Thu đã duyệt</th></tr>' +
        d.tien.theoThang.map(function (r) { return '<tr><td class="mono">' + h(r.thang) + '</td><td>' + tien(r.n) + '</td></tr>'; }).join('') + '</table></div>';

    /* ── BẢNG ĐIỂM 16 BAN ── */
    var tenBan = {}; (G.TD_BAN || []).forEach(function (b) { tenBan[b.ma] = b.ten; });
    var soDo = Object.keys(d.ban || {}).filter(function (m) { return d.ban[m].danhGia === 'can-nang-cap'; }).length;
    o += '<h3 class="hvh-h">' + ic('shield') + ' Bảng điểm 16 ban — ' +
      (soDo ? '<span style="color:var(--gita-do)">' + soDo + ' ban cần nâng cấp</span>' : '<span style="color:var(--ok)">mọi ban đạt chuẩn</span>') + '</h3>';
    o += '<table class="tbl sm"><tr><th>Ban</th><th>Đánh giá</th><th>Chỉ số · ngưỡng</th></tr>' +
      Object.keys(d.ban || {}).map(function (ma) {
        var b = d.ban[ma];
        var chip = b.danhGia === 'can-nang-cap' ? '<span class="chip" style="color:var(--gita-do)">CẦN NÂNG CẤP</span>' :
          b.danhGia === 'chuan' ? '<span class="chip" style="color:var(--ok)">đạt chuẩn</span>' :
          '<span class="chip">chưa đo được</span>';
        return '<tr><td><b>' + h(ma) + '</b> ' + h(tenBan[ma] || '') + '</td><td>' + chip + '</td><td class="tiny">' +
          b.chiSo.map(function (c) {
            return '<div' + (c.xau ? ' style="color:var(--gita-do);font-weight:600"' : '') + '>' + h(c.ten) + ': ' +
              (c.giaTri === null ? '—' : h(String(c.giaTri)) + (c.donVi || '')) + ' <span class="muted">(ngưỡng ' + h(c.nguong) + ')</span></div>';
          }).join('') + '</td></tr>';
      }).join('') + '</table>';
    o += '<div class="card mt">' + (d.gioiHan || []).map(function (g) {
      return '<div class="tiny muted"><b>Giới hạn:</b> ' + h(g) + '</div>'; }).join('') + '</div>';
    return o;
  };
})();
