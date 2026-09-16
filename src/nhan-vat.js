/* ═══════════════════════════════════════════════════════════════
   GITA 365 — NHÂN VẬT CỦA TÔI  (9.99.106 · CD-01)

   Chủ hệ: khách tự chọn nhân vật 3D hợp với ảnh đại diện khi hoàn thiện
   hồ sơ.

   ══ DỰNG TẠI CHỖ, KHÔNG GỬI ẢNH RA NGOÀI — Điều 13 ══

   Gửi ảnh khách (nhất là học viên <18) sang một dịch vụ dựng avatar đặt
   ngoài lãnh thổ là XỬ LÝ DỮ LIỆU XUYÊN BIÊN GIỚI — phạm Điều 13 (bất
   khả sửa). Nên nhân vật ở đây do KHÁCH TỰ CHỌN từ các phần dựng sẵn
   (tông da · kiểu tóc · màu tóc · trang phục · kính). Ảnh KHÔNG rời máy;
   thứ lưu lại chỉ là mấy con số chỉ mục — không phải dữ liệu nhận dạng.

   Lưu ở localStorage của máy đang dùng (một thói quen hiển thị, không
   phải hồ sơ), bọc try/catch vì chế độ riêng tư có thể chặn. Đồng bộ
   theo tài khoản là lớp sau (CD-04) — cần một cửa máy chủ và một bảng.

   `G.nvVe(doc)` trả về HÌNH nhân vật (chuỗi SVG, hộp 64×96) để cả màn
   này lẫn Con đường cùng vẽ MỘT nhân vật — một nguồn, không hai bản.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

/* Các phần dựng sẵn. Trang phục lấy màu thương hiệu (token); da/tóc là
   màu minh hoạ (không phải ba mã vàng bị cấm). */
G.NV = {
  da:     ['#F1C9A5', '#E8B98D', '#D8A06E', '#B87A4B', '#8D5524'],
  tocMau: ['#2B2B2B', '#4A3524', '#6B4A2E', '#8A6A3F', '#9AA0A6'],
  toc:    ['Ngắn', 'Dài', 'Buộc', 'Xoăn'],
  ao:     ['var(--t1)', 'var(--t2)', 'var(--t3)', 'var(--t4)', 'var(--t5)', 'var(--gita-do)'],
  kinh:   ['Không kính', 'Có kính']
};

G.nvMac = function () { return { da: 1, tocMau: 0, toc: 0, ao: 0, kinh: 0 }; };

/* Đọc/ghi lựa chọn — localStorage, bọc try/catch (chế độ riêng tư ném). */
G.nvDoc = null;
G.nvTai = function () {
  if (G.nvDoc) return G.nvDoc;
  var d = null;
  try { d = JSON.parse(localStorage.getItem('gita_nhanvat') || 'null'); } catch (e) {}
  G.nvDoc = d && typeof d === 'object' ? d : G.nvMac();
  return G.nvDoc;
};
G.nvLuu = function (doc) {
  G.nvDoc = doc;
  try { localStorage.setItem('gita_nhanvat', JSON.stringify(doc)); } catch (e) {}
  /* CD-04 · đẩy lên tài khoản để đi cùng khách qua mọi máy. localStorage
     vẫn là bản ở máy (chạy cả khi offline / bản .exe); máy chủ chỉ thêm
     đường đồng bộ. Bắn-rồi-quên: lỗi mạng KHÔNG làm hỏng lượt chọn. Đây
     KHÔNG phải `fetch(` — nó đi qua G.goiMayChu, cùng cổng mọi cửa khác. */
  if (typeof G.goiMayChu === 'function') {
    try { G.goiMayChu('luuNhanVat', doc).catch(function () {}); } catch (e) {}
  }
};

/* CD-04 · kéo nhân vật của tài khoản về (một lần mỗi phiên). Có thì
   dùng bản tài khoản; chưa có thì giữ bản máy. Đồng bộ chỉ mấy chỉ mục,
   không ảnh (Điều 13). */
G.nvDaDongBo = false;
G.nvDongBoVe = function () {
  if (G.nvDaDongBo || typeof G.goiMayChu !== 'function') return;
  G.nvDaDongBo = true;
  try {
    G.goiMayChu('docNhanVat', {}).then(function (r) {
      if (r && r.ok && r.chuaCo === false && r.doc) {
        G.nvDoc = r.doc;
        try { localStorage.setItem('gita_nhanvat', JSON.stringify(r.doc)); } catch (e) {}
        if (G.S && G.S.view === 'nhan-vat' && G.render) G.render();
      }
    }).catch(function () {});
  } catch (e) {}
};

/* Kẹp một chỉ mục vào trong khoảng của phần ấy. */
function kep(khoa, i) {
  var n = (G.NV[khoa] || []).length || 1;
  i = i | 0; return ((i % n) + n) % n;
}

/* HÌNH nhân vật — hộp 64×96, gốc trên-trái. Trả CHUỖI SVG các nét, để
   người gọi tự bọc <svg>/<g> và co giãn. Một nguồn duy nhất. */
G.nvVe = function (doc) {
  var d = doc || G.nvTai();
  var da = G.NV.da[kep('da', d.da)];
  var tc = G.NV.tocMau[kep('tocMau', d.tocMau)];
  var ao = G.NV.ao[kep('ao', d.ao)];
  var kieu = kep('toc', d.toc);
  var kinh = kep('kinh', d.kinh) === 1;
  var s = '';

  /* bóng chân */
  s += '<ellipse cx="32" cy="92" rx="18" ry="4" fill="var(--phu-3)"/>';
  /* thân + tay */
  s += '<rect x="14" y="54" width="36" height="40" rx="15" fill="' + ao + '"/>';
  s += '<rect x="9" y="58" width="9" height="24" rx="4.5" fill="' + ao + '"/>';
  s += '<rect x="46" y="58" width="9" height="24" rx="4.5" fill="' + ao + '"/>';
  /* cổ + đầu */
  s += '<rect x="27" y="46" width="10" height="10" rx="4" fill="' + da + '"/>';
  s += '<circle cx="32" cy="30" r="17" fill="' + da + '"/>';
  /* tóc theo kiểu */
  if (kieu === 0) {                         /* ngắn */
    s += '<path d="M15 30 Q15 12 32 12 Q49 12 49 30 Q49 21 32 21 Q15 21 15 30Z" fill="' + tc + '"/>';
  } else if (kieu === 1) {                  /* dài */
    s += '<path d="M14 34 Q13 12 32 12 Q51 12 50 34 L50 30 Q50 20 32 20 Q14 20 14 30Z" fill="' + tc + '"/>';
    s += '<rect x="13" y="28" width="6" height="20" rx="3" fill="' + tc + '"/>';
    s += '<rect x="45" y="28" width="6" height="20" rx="3" fill="' + tc + '"/>';
  } else if (kieu === 2) {                  /* buộc */
    s += '<path d="M15 30 Q15 12 32 12 Q49 12 49 30 Q49 21 32 21 Q15 21 15 30Z" fill="' + tc + '"/>';
    s += '<circle cx="50" cy="24" r="6" fill="' + tc + '"/>';
  } else {                                  /* xoăn */
    s += '<path d="M16 30 Q16 14 32 13 Q48 14 48 30 Q48 22 32 22 Q16 22 16 30Z" fill="' + tc + '"/>';
    s += '<circle cx="18" cy="18" r="6" fill="' + tc + '"/><circle cx="32" cy="14" r="7" fill="' + tc + '"/>' +
      '<circle cx="46" cy="18" r="6" fill="' + tc + '"/>';
  }
  /* mắt + miệng */
  s += '<circle cx="26" cy="31" r="1.8" fill="#22303f"/><circle cx="38" cy="31" r="1.8" fill="#22303f"/>';
  s += '<path d="M28 37 Q32 40 36 37" fill="none" stroke="#22303f" stroke-width="1.6" stroke-linecap="round"/>';
  /* kính */
  if (kinh) {
    s += '<g fill="none" stroke="#22303f" stroke-width="1.6">' +
      '<circle cx="26" cy="31" r="4"/><circle cx="38" cy="31" r="4"/>' +
      '<path d="M30 31 h4"/></g>';
  }
  return s;
};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  function veLai() {
    if (!G.S || G.S.view !== 'nhan-vat') return;
    if (typeof document === 'undefined' || !document.getElementById('main')) return;
    G.render && G.render();
  }

  /* Đổi một phần: xoay vòng tới lựa chọn kế tiếp rồi lưu. */
  G.nvDoi = function (khoa, buoc) {
    var d = G.nvTai();
    d[khoa] = kep(khoa, (d[khoa] | 0) + (buoc || 1));
    G.nvLuu(d);
    veLai();
  };

  function hangChon(khoa, nhan) {
    var d = G.nvTai();
    var ds = G.NV[khoa] || [];
    var giaTri = ds[kep(khoa, d[khoa])];
    /* với màu thì hiện ô màu, với chữ thì hiện chữ */
    var laMau = /^#|^var\(/.test(String(giaTri));
    var hienGiua = laMau
      ? '<span class="nv-mau" style="background:' + giaTri + '"></span>'
      : '<b>' + h(String(giaTri)) + '</b>';
    return '<div class="nv-hang">' +
      '<span class="nv-nhan">' + h(nhan) + '</span>' +
      '<div class="nv-chon">' +
      '<button class="nv-mui" aria-label="' + h(nhan) + ' — lựa chọn trước" ' +
      'onclick="G.nvDoi(\'' + khoa + '\',-1)">' + ic('arrow') + '</button>' +
      '<span class="nv-giua">' + hienGiua + '</span>' +
      '<button class="nv-mui nv-mui-phai" aria-label="' + h(nhan) + ' — lựa chọn kế tiếp" ' +
      'onclick="G.nvDoi(\'' + khoa + '\',1)">' + ic('arrow') + '</button>' +
      '</div></div>';
  }

  G.VIEWS['nhan-vat'] = function () {
    G.nvDongBoVe();   /* CD-04 · kéo bản tài khoản về (một lần/phiên) */
    var o = '<div class="hd"><h2>' + ic('users') + ' Nhân vật của tôi</h2>' +
      '<p class="sub">Tự chọn nhân vật đại diện cho mình trên Con đường nhiệm vụ. ' +
      'Chọn tại chỗ — <b>ảnh của bạn không rời máy</b>, hệ chỉ nhớ mấy lựa chọn để ' +
      'vẽ lại nhân vật.</p></div>';

    o += '<div class="nv-khung">';
    /* preview lớn */
    o += '<div class="nv-xem"><svg viewBox="0 0 64 96" width="150" height="225" ' +
      'role="img" aria-label="Nhân vật của tôi">' + G.nvVe() + '</svg></div>';
    /* các phần chọn */
    o += '<div class="nv-bang">' +
      hangChon('da', 'Tông da') +
      hangChon('toc', 'Kiểu tóc') +
      hangChon('tocMau', 'Màu tóc') +
      hangChon('ao', 'Trang phục') +
      hangChon('kinh', 'Kính') +
      '</div>';
    o += '</div>';

    o += '<div class="row wrap" style="gap:10px;margin-top:14px">' +
      '<button class="btn pri" data-v="con-duong">' + ic('compass') +
      ' Đưa nhân vật ra Con đường</button></div>';

    o += '<p class="note" style="margin-top:12px">Nhân vật <b>đồng bộ theo tài khoản</b> — ' +
      'đi cùng bạn qua mọi máy. Hệ chỉ lưu mấy chỉ mục (tông da · tóc · trang phục), ' +
      '<b>không ảnh, không tên</b>; ảnh của bạn không rời máy (Điều 13).</p>';

    return o;
  };
})();
