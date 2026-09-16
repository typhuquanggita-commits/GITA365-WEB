/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÀN QUYỀN NĂNG AI  (9.99.100)

   Super Admin cấp/thu hồi mười quyền năng AI. Răng nằm ở MÁY CHỦ
   (may-chu/quyen-nang-ai.js): mỗi quyền năng TẮT mặc định, chỉ R01 bật;
   chức năng có cửa mà chưa bật thì AI gọi vào bị từ chối. Màn chỉ hiện
   trạng thái và nút bật/thu — mọi cổng chặn ở cửa máy chủ.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  var NGAN = [
    {ma: 'quyen', ten: 'Mười quyền năng', ic: 'shield'},
    {ma: 'luat',  ten: 'Sáu luật', ic: 'lock'},
    {ma: 'cho',   ten: 'Sổ chờ', ic: 'list'}
  ];
  G.qnNgan = G.qnNgan || 'quyen';
  G.qnSo = G.qnSo || null;

  function veLai() {
    if (!G.S || G.S.view !== 'quyen-nang-ai') return;
    if (typeof document === 'undefined' || !document.getElementById('main')) return;
    G.render && G.render();
  }
  G.qnMoNgan = function (ma) { G.qnNgan = ma; veLai(); };

  G.qnTaiSo = function () {
    if (!G.goiMayChu) return;
    G.goiMayChu('soatQuyenAI', {}).then(function (x) { G.qnSo = x; veLai(); })
      .catch(function (e) { G.qnSo = {ok: false, error: e && e.message}; veLai(); });
  };

  G.qnBat = function (ma) {
    if (!G.goiMayChu) return;
    var ghiChu = (typeof prompt === 'function') ? prompt('Vì sao bật quyền năng ' + ma + '?') : 'bật';
    if (!ghiChu) return;
    G.goiMayChu('capQuyenAI', {quyen: ma, pham: 'he', ghiChu: ghiChu}).then(function (x) {
      if (x && x.ok) { G.qnSo = null; veLai(); }
      else U.toast((x && x.error) || 'Không bật được.', 'err');
    });
  };
  G.qnThu = function (ma) {
    if (!G.goiMayChu) return;
    var ghiChu = (typeof prompt === 'function') ? prompt('Vì sao thu hồi quyền năng ' + ma + '?') : 'thu';
    if (!ghiChu) return;
    G.goiMayChu('thuHoiQuyenAI', {quyen: ma, pham: 'he', ghiChu: ghiChu}).then(function (x) {
      if (x && x.ok) { G.qnSo = null; veLai(); }
      else U.toast((x && x.error) || 'Không thu được.', 'err');
    });
  };

  function trangThai(ma) {
    var so = G.qnSo;
    if (!so || !so.ok || !so.quyen) return null;
    return so.quyen.filter(function (q) { return q.ma === ma; })[0] || null;
  }

  function veQuyen() {
    var o = U.sec('Mười quyền năng AI — Super Admin bật',
      'Mỗi quyền năng TẮT mặc định. Chức năng có cửa mà chưa bật thì AI gọi vào bị từ chối. ' +
      'Chức năng SOẠN đi qua chuỗi cấp phép ba cấp; chức năng ĐỌC thì nêu, không kết luận.');
    o += U.tbl(['Mã', 'Chức năng', 'Kiểu', 'Cửa', 'Trạng thái', ''],
      (G.AI_QUYEN || []).map(function (q) {
        var tt = trangThai(q.ma);
        var trang = !q.cua ? '<em>chưa có cửa</em>'
          : (tt && tt.batHe) ? '<b>ĐANG BẬT</b>' : 'tắt';
        var nut = !q.cua ? h(q.chuaCoCua || '')
          : (tt && tt.batHe)
            ? '<button class="btn" onclick="G.qnThu(\'' + q.ma + '\')">Thu hồi</button>'
            : '<button class="btn btn-chinh" onclick="G.qnBat(\'' + q.ma + '\')">Bật</button>';
        return [h(q.ma), h(q.ten), h(q.kieu), q.cua ? '<code>' + h(q.cua) + '</code>' : '—', trang, nut];
      }));
    if (!G.qnSo) o += '<p class="note"><button class="btn" onclick="G.qnTaiSo()">Tải trạng thái từ máy chủ</button></p>';
    else if (G.qnSo.nhac) o += '<p class="note">' + h(G.qnSo.nhac) + '</p>';
    return o;
  }

  function veLuat() {
    var lu = G.AI_QUYEN_LUAT || {};
    var hang = [
      ['Tắt mặc định', lu.tatMacDinh],
      ['Chỉ Super Admin bật', lu.chiSuperAdminBat],
      ['Bật tính lúc đọc', lu.batTinhLucDoc],
      ['Làm việc qua cổng đã có', lu.lamViecQuaCongDaCo],
      ['Đọc thì nêu, không kết luận', lu.docThiNeuKhongKetLuan],
      ['Cửa chưa có thì khai ra', lu.cuaChuaCoThiKhaiRa]
    ].filter(function (r) { return r[1]; });
    var o = U.sec('Sáu luật của quyền năng AI', '');
    o += U.tbl(['Luật', 'Nội dung'], hang.map(function (r) { return [h(r[0]), h(r[1])]; }));
    return o;
  }

  function veCho() {
    var o = U.sec('Sổ chờ chủ hệ', '');
    o += U.tbl(['Mã', 'Việc', 'Hỏi gì'],
      (G.AI_QUYEN_CHOCHU || []).map(function (c) { return [h(c.ma), h(c.t), h(c.hoi)]; }));
    return o;
  }

  G.VIEWS['quyen-nang-ai'] = function () {
    var o = '<div class="hd"><h2>' + ic('shield') + ' Quyền năng AI · Super Admin cấp</h2>' +
      '<p class="sub">Super Admin bật/thu mười chức năng cho AI xử lý công việc. Mỗi chức năng tắt ' +
      'mặc định; chức năng làm việc có hệ quả thì đi qua đúng cổng đã có — máy đề xuất, người quyết.</p></div>';

    if (!(G.AI_QUYEN || []).length) {
      return o + U.empty('Quyền năng AI thuộc gói nghề',
        'Màn này là công cụ quản trị của Học viện: nó bật/thu quyền cho AI xử lý công việc. Việc ' +
        'cấp quyền là của Super Admin, nên với vai này màn không có gì để dựng.');
    }

    o += '<div class="tabs">' + NGAN.map(function (n) {
      return '<button class="tab' + (G.qnNgan === n.ma ? ' on' : '') + '" onclick="G.qnMoNgan(\'' +
        n.ma + '\')">' + ic(n.ic) + ' ' + h(n.ten) + '</button>';
    }).join('') + '</div>';

    if (G.qnNgan === 'quyen') o += veQuyen();
    else if (G.qnNgan === 'luat') o += veLuat();
    else o += veCho();

    if (!G.qnSo) setTimeout(function () { G.qnTaiSo(); }, 0);
    return o;
  };
})();
