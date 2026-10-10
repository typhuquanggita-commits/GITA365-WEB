/* ═══════════════════════════════════════════════════════════════
   NGOẠI LỆ CÓ TÊN · LƯU PHIM RA MÁY (N4 · chủ hệ chốt 10/10/2026)

   Luật nền vẫn đứng: khách hàng không tải bất cứ dữ liệu nào ra máy.
   Xưởng phim là chỗ DUY NHẤT được lưu tệp ra máy, và chỉ qua hàm này.

   Ba cổng, theo thứ tự:
   1. Máy khách (G.LA_MAY_KHACH) và tài khoản bị khoá chép
      (G.BI_KHOA_CHEP) — không lưu, kể cả Super Admin ngồi máy khách.
   2. Quyền qt_trang (R01–R02) — đúng quyền mở màn Xưởng phim.
   3. Cửa máy chủ `ghiLuuPhim` ghi sổ lượt lưu. Cửa từ chối hoặc không
      gọi được thì KHÔNG lưu: một ngoại lệ không để lại dấu là một đường
      tải tệp đội lốt ngoại lệ. Máy chủ đọc vai từ phiên, nên gọi thẳng
      hàm này trong bảng điều khiển cũng không vượt được.

   Đường lưu: hộp "Lưu thành" của hệ điều hành nếu có. Hộp ấy cần cú bấm
   của người dùng, nên tệp sinh ra SAU một lượt ghi dài (cắt nhịp, bàn
   dựng) sẽ bị trình duyệt từ chối mở hộp — lúc ấy lùi về thẻ tải xuống.
   Thẻ tải xuống và địa chỉ blob CHỈ được sinh ở tệp này; phép thử
   tools/thu-xuong-phim.mjs đỏ nếu chúng mọc ở tệp nào khác trong xưởng.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function () {
  var LOAI = ['phim', 'khung', 'phuDe', 'prompt', 'cauHinh'];

  G.LUU_PHIM_LUAT = {
    quyen: 'qt_trang',
    cua: 'ghiLuuPhim',
    vi: 'Lưu tệp ra máy chỉ có ở Xưởng phim, chỉ cho Super Admin và Admin hệ thống, và mỗi lượt lưu đều vào sổ.'
  };

  function bao(t, k) { if (G.U && G.U.toast) G.U.toast(t, k || 'err'); }

  /* Cổng 1 + 2 — chạy ĐỒNG BỘ để còn kịp mở hộp lưu trong cú bấm */
  G.duocLuuPhim = function (imLang) {
    var ly = '';
    if (G.LA_MAY_KHACH || (G.BI_KHOA_CHEP && G.BI_KHOA_CHEP())) ly = 'Tài khoản/máy này chỉ được dùng, không được lưu tệp ra máy.';
    else if (!(G.can && G.can('qt_trang'))) ly = 'Lưu phim ra máy chỉ dành cho Super Admin và Admin hệ thống.';
    if (ly && !imLang) bao(ly);
    return !ly;
  };

  /* Cổng 3 — ghi sổ trước khi ghi tệp */
  G.ghiSoLuuPhim = function (ten, loai, co) {
    if (!G.goiMayChu) return Promise.reject(new Error('Chưa nối máy chủ — không ghi được sổ lượt lưu.'));
    return G.goiMayChu('ghiLuuPhim', {ten: String(ten || ''), loai: loai, co: co || 0, man: (G.S && G.S.view) || ''})
      .then(function (x) {
        if (!x || !x.ok) throw new Error((x && (x.vi || x.error)) || 'Máy chủ không ghi sổ lượt lưu.');
        return true;
      });
  };

  function taiQuaThe(du, ten) {
    var a = document.createElement('a'), ou = URL.createObjectURL(du);
    a.href = ou; a.download = ten; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(ou); a.remove(); }, 4000);
  }

  /* Lưu một tệp đã có sẵn trong bộ nhớ. Trả Promise<boolean>. */
  G.luuTepPhim = function (du, ten, mo, duoi, loai) {
    if (LOAI.indexOf(loai) < 0) loai = 'phim';
    if (!G.duocLuuPhim()) return Promise.resolve(false);
    var co = (du && du.size) || 0;
    function quaThe() {
      return G.ghiSoLuuPhim(ten, loai, co).then(function () { taiQuaThe(du, ten); bao('Đã lưu ' + ten, 'ok'); return true; });
    }
    var chuoi;
    if (window.showSaveFilePicker) {
      var kieu = {}; kieu[mo] = [duoi];
      chuoi = window.showSaveFilePicker({suggestedName: ten, types: [{description: duoi, accept: kieu}]})
        .then(function (fh) {
          return fh.createWritable().then(function (w) {
            return G.ghiSoLuuPhim(ten, loai, co)
              .then(function () { return w.write(du).then(function () { return w.close(); }); },
                function (e) { try { w.abort(); } catch (e2) {} throw e; });
          });
        })
        .then(function () { bao('Đã lưu ' + ten, 'ok'); return true; }, function (e) {
          if (e && e.name === 'AbortError') return false;
          /* Hết cú bấm (tệp sinh sau một lượt ghi dài) → lùi về thẻ tải */
          if (e && (e.name === 'SecurityError' || e.name === 'NotAllowedError')) return quaThe();
          throw e;
        });
    } else chuoi = quaThe();
    return chuoi.catch(function (e) { bao('Không lưu được: ' + ((e && e.message) || e)); return false; });
  };

  /* Hỏi chỗ lưu cho một lượt ghi THẲNG xuống đĩa (phim dài): ghi sổ ngay
     sau khi chọn chỗ, trước byte đầu tiên. Từ chối → không trả tay cầm. */
  G.moNoiLuuPhim = function (ten, mo, duoi) {
    if (!G.duocLuuPhim()) return Promise.reject(new Error('KHONG_LUU'));
    if (!window.showSaveFilePicker) return Promise.reject(new Error('KHONG_HOP'));
    var kieu = {}; kieu[mo] = [duoi];
    return window.showSaveFilePicker({suggestedName: ten, types: [{description: 'Phim', accept: kieu}]})
      .then(function (fh) { return G.ghiSoLuuPhim(ten, 'phim', 0).then(function () { return fh; }); });
  };
})();
