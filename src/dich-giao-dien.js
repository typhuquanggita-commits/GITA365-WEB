/* ═══════════════════════════════════════════════════════════════
   GITA 365 — BỘ DỊCH GIAO DIỆN (một từ điển, một lượt quét)

   Chủ hệ 10/10: chọn tiếng Anh thì chỉ vài chữ đổi, phần còn lại vẫn
   tiếng Việt và không nhất quán. Nguyên nhân đo được: hơn 33.000 đoạn
   chữ viết thẳng trong mã của từng màn, còn cơ chế dịch cũ (G.L · G.tx ·
   NAV_EN) chỉ phủ khung ứng dụng và cột trái.

   Sửa từng màn một cho gọi G.L là ba trăm tệp và sẽ sót. Nên dịch ở
   ĐÚNG MỘT CHỖ: sau khi màn đã vẽ xong, quét các nút chữ và các thuộc
   tính người dùng đọc được (placeholder · aria-label · title · alt), tra
   một từ điển duy nhất G.TU_DIEN_EN (src/tu-dien-en*.js), thay tại chỗ.
   Màn viết sau cũng tự được dịch, miễn chữ của nó có trong từ điển.

   ══ BỐN LUẬT ══
   1. Tra NGUYÊN CẢ ĐOẠN, không thay từng chữ. Thay từng chữ ra một câu
      nửa Việt nửa Anh — tệ hơn để nguyên tiếng Việt.
   2. Con số không nằm trong khoá: "Đã làm 2/3 tối" tra bằng
      "Đã làm {n}/{n} tối", rồi trả số về đúng thứ tự.
   3. Chữ người dùng gõ không bị dịch: nó đi qua U.h() nên không bao giờ
      trùng nguyên văn một khoá — và khối nào cần chắc chắn thì gắn
      data-khong-dich.
   4. Đo được: tools/trich-chu-viet.js dùng ĐÚNG hàm khoá này để tính độ
      phủ; CI không cho độ phủ tụt dưới mốc tools/i18n-moc.json.

   Nội dung kho (bảy gói mã hoá) hiện chỉ có tiếng Việt — đó là việc dịch
   kho, không phải việc của tệp này.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.TU_DIEN_EN = G.TU_DIEN_EN || {};
(function () {
  var CO_DAU = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/;
  var SO = /\d+(?:[.,]\d+)*/g;
  var BO_QUA = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, CODE: 1, PRE: 1, NOSCRIPT: 1 };
  var THUOC_TINH = ['placeholder', 'aria-label', 'title', 'alt'];
  var chuan = null, soKhoa = -1;

  function khoa(s) { return String(s).replace(/\s+/g, ' ').trim().replace(SO, '{n}'); }
  G.khoaDich = khoa;

  /* Từ điển chuẩn hoá một lần, dựng lại khi có thêm tệp từ điển nạp sau. */
  function tuDien() {
    var ks = Object.keys(G.TU_DIEN_EN);
    if (chuan && ks.length === soKhoa) return chuan;
    chuan = {}; soKhoa = ks.length;
    ks.forEach(function (k) { chuan[khoa(k)] = G.TU_DIEN_EN[k]; });
    return chuan;
  }

  G.dichChuoi = function (s) {
    if (!s || !CO_DAU.test(s)) return s;
    var en = tuDien()[khoa(s)];
    if (en === undefined) return s;
    var so = String(s).match(SO) || [], i = 0;
    var ra = String(en).replace(/\{n\}/g, function () { return so[i] !== undefined ? so[i++] : ''; });
    /* Giữ khoảng trắng hai đầu: nút chữ hay đứng sát một thẻ khác. */
    var dau = /^\s*/.exec(s)[0], cuoi = /\s*$/.exec(s)[0];
    return dau + ra + cuoi;
  };

  function boQua(el) {
    for (var n = el; n && n.nodeType === 1; n = n.parentNode) {
      if (BO_QUA[n.tagName]) return true;
      if (n.hasAttribute && n.hasAttribute('data-khong-dich')) return true;
      if (n.isContentEditable) return true;
    }
    return false;
  }

  /* Nhớ bản gốc của mọi chỗ đã thay, để quay về tiếng Việt được. Phần
     vẽ lại mỗi màn thì tự về tiếng Việt khi vẽ lại; phần đứng yên trong
     index.html (hộp thoại · ô tìm · nút cỡ chữ) thì không ai vẽ lại, nên
     không nhớ thì đổi về tiếng Việt mà mấy chỗ ấy vẫn nằm tiếng Anh. */
  var daDoi = [];
  function nho(nut, thuocTinh, goc) {
    if (daDoi.length > 4000) daDoi = daDoi.filter(function (x) { return x[0].isConnected; });
    daDoi.push([nut, thuocTinh, goc]);
  }
  function thayChu(t) { var en = G.dichChuoi(t.nodeValue); if (en !== t.nodeValue) { nho(t, null, t.nodeValue); t.nodeValue = en; } }

  G.traLaiTiengViet = function () {
    daDoi.forEach(function (x) {
      if (!x[0].isConnected) return;
      if (x[1]) x[0].setAttribute(x[1], x[2]); else x[0].nodeValue = x[2];
    });
    daDoi = [];
  };

  G.dichDom = function (goc) {
    if (G.LANG !== 'en' || !goc || !document.createTreeWalker) return;
    var w = document.createTreeWalker(goc, NodeFilter.SHOW_TEXT, null), n, ds = [];
    while ((n = w.nextNode())) if (CO_DAU.test(n.nodeValue) && !boQua(n.parentNode)) ds.push(n);
    ds.forEach(thayChu);
    /* Tính cả CHÍNH thẻ gốc: querySelectorAll chỉ trả con cháu, nên một
       nút được thêm nguyên chiếc (nút lùi · thanh dưới) mang aria-label
       tiếng Việt mà không ai dịch — đo được ở 71/71 màn trước khi vá. */
    var els = goc.querySelectorAll ? [goc].concat([].slice.call(goc.querySelectorAll('[placeholder],[aria-label],[title],[alt]'))) : [];
    for (var i = 0; i < els.length; i++) dichThuocTinh(els[i]);
  };

  function dichThuocTinh(el) {
    if (!el || el.nodeType !== 1 || !el.getAttribute || boQua(el)) return;
    THUOC_TINH.forEach(function (a) {
      var v = el.getAttribute(a);
      if (v && CO_DAU.test(v)) { var en = G.dichChuoi(v); if (en !== v) { nho(el, a, v); el.setAttribute(a, en); } }
    });
  }

  /* Phần dựng SAU lượt vẽ (khối nạp từ máy chủ, hộp báo, cột trái vẽ lại)
     cũng phải được dịch — một người quan sát nút được thêm vào thân trang.
     Không nghe characterData: thay chữ tại chỗ là characterData, nên lượt
     dịch không tự kích chính nó. */
  var cho = false, hangDoi = [];
  function xuLy() {
    cho = false;
    var ds = hangDoi; hangDoi = [];
    ds.forEach(function (n) {
      if (n.nodeType === 1) G.dichDom(n);
      else if (n.nodeType === 3 && n.parentNode && !boQua(n.parentNode)) thayChu(n);
    });
  }
  if (window.MutationObserver) {
    new MutationObserver(function (ms) {
      if (G.LANG !== 'en') return;
      ms.forEach(function (m) {
        if (m.type === 'attributes') { hangDoi.push(m.target); return; }
        for (var i = 0; i < m.addedNodes.length; i++) hangDoi.push(m.addedNodes[i]);
      });
      if (!cho) { cho = true; (window.requestAnimationFrame || setTimeout)(xuLy); }
      /* Nghe cả bốn thuộc tính: nút lùi/tới đổi title·aria-label bằng
         setAttribute sau mỗi lượt vẽ, không thêm nút nào. Lượt dịch tự ghi
         lại thuộc tính cũng kích một lượt nữa, nhưng bản tiếng Anh không có
         dấu nên dichChuoi trả nguyên — không thành vòng lặp. */
    }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: THUOC_TINH });
  }
})();
