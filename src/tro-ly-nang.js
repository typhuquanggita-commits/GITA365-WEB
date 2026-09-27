/* ═══════════════════════════════════════════════════════════════
   GITA 365 · 9.99.185 — NÂNG NĂNG LỰC Ô CHAT
   Chủ hệ: câu trả lời phải như đang chat theo kịch bản, KHÔNG đổ liền
   loạt thư mục/tệp; ghi rõ vai (Chuyên viên tư vấn · Coach · Giáo viên ·
   Trợ lý riêng · Trợ lý nghiệp vụ cho nhân sự); nhớ khách và cuộc thoại;
   gắn chuyên gia ngôn ngữ + nhà khoa học số liệu cùng phân tích.

   Module này KHÔNG dựng lại bộ chat — nó TRỎ vào bộ đã có (G.aiTraLoi,
   G.kbChuoi ở tro-ly-chat.js) và GẮN THÊM bốn thứ vào một lượt trả lời:
     · d.vai      — vai đang trả lời (persona), theo vai + chặng
     · d.phanAnh  — câu "hiểu ý" của chuyên gia ngôn ngữ
     · d.toan     — phân tích số liệu của nhà khoa học toán (có trình bước)
     · d.nhoNhac  — nhắc lại điều đã nhớ về nhà mình

   Trí nhớ nằm trong localStorage của CHÍNH máy khách, khoá theo tài
   khoản. KHÔNG rời máy — đúng Điều 13. Không mạng, không tải xuống.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function () {
  /* Bỏ dấu — cục bộ theo đúng mẫu kho (mỗi tệp một bản nhỏ, không gắn G). */
  function boDau(s) {
    return String(s || '').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  }

  /* ─────────── 1) VAI ĐANG TRẢ LỜI (persona) ───────────
     Ghi rõ ai đang nói với khách. Chọn theo VAI của phiên, và với phụ
     huynh thì theo CHẶNG: đi sâu rồi thì có Coach đồng hành, chưa thì
     Chuyên viên tư vấn. Nhân sự GITA nhận Trợ lý nghiệp vụ. */
  G.tlVai = function () {
    var khach = !!(G.LA_KHACH && G.LA_KHACH());
    var role = (G.S && G.S.role) || '';
    if (!khach) {
      return { ten: 'Trợ lý nghiệp vụ GITA', vaiMa: 'nghiepVu',
               moTa: 'hỗ trợ nhân sự — tra thẳng phác đồ, kịch bản, mô thức, tình huống' };
    }
    if (role === 'R14')
      return { ten: 'Giáo viên hướng dẫn', vaiMa: 'giaoVien',
               moTa: 'đi cùng em từng bước học' };
    if (role === 'R15')
      return { ten: 'Trợ lý riêng', vaiMa: 'troLyRieng',
               moTa: 'đồng hành cùng đại sứ' };
    /* Phụ huynh: Coach nếu đã đi sâu (T3+), còn lại Chuyên viên tư vấn. */
    var t = null;
    try { var f = G.myFamily && G.myFamily(); t = f && G.tierOf ? G.tierOf(f.tier) : null; } catch (e) {}
    var sau = t && /^T[345]$/.test(t.code || '');
    return sau
      ? { ten: 'Coach đồng hành', vaiMa: 'coach', moTa: 'đi cùng nhà mình suốt chặng' }
      : { ten: 'Chuyên viên tư vấn', vaiMa: 'tuVan', moTa: 'lắng nghe và dẫn đường cho nhà mình' };
  };

  /* ─────────── 2) CHUYÊN GIA NGÔN NGỮ ───────────
     Đọc Ý ĐỊNH của câu và một câu "hiểu ý" ngắn. Dò theo CỤM nhiều âm
     tiết (an toàn với dấu — \b không khớp chữ có dấu, luật đã ghi trong
     CLAUDE.md). Không dịch sang thuật ngữ, giữ giọng nhà mình. */
  var Y_HOICACH = ['lam sao', 'the nao', 'cach nao', 'bat dau tu dau', 'phai lam gi', 'nen lam gi'];
  var Y_HOIGIA  = ['bao nhieu tien', 'hoc phi', 'chi phi', 'gia bao nhieu', 'gia ca'];
  var Y_HOILUC  = ['khi nao', 'bao lau', 'may ngay', 'bao gio', 'con bao nhieu ngay'];
  var Y_LO      = ['lo lang', 'cang thang', 'met moi', 'bat luc', 'khong biet phai', 'stress', 'roi tri', 'buc'];
  function coCum(low, ds) { for (var i = 0; i < ds.length; i++) if (low.indexOf(ds[i]) >= 0) return true; return false; }

  G.tlNgonNgu = function (cau) {
    var low = boDau(cau);
    var yDinh = 'ke';                                  /* mặc định: đang kể một chuyện */
    if (coCum(low, Y_HOIGIA)) yDinh = 'hoiGia';
    else if (coCum(low, Y_HOILUC)) yDinh = 'hoiLuc';
    else if (coCum(low, Y_HOICACH)) yDinh = 'hoiCach';
    var lo = coCum(low, Y_LO);
    /* Câu "hiểu ý" chỉ nói khi đang KỂ một chuyện có cảm xúc — đỡ trùng
       với "bắt nhịp" của chuỗi, và không chèn vào câu hỏi thẳng. */
    var phanAnh = '';
    if (lo) phanAnh = 'Em nghe rồi — chuyện này đang làm nhà mình mệt. Mình đi từng bước một, không vội.';
    return { yDinh: yDinh, lo: lo, phanAnh: phanAnh };
  };

  /* ─────────── 3) NHÀ KHOA HỌC SỐ LIỆU ───────────
     Chỉ tính trên CON SỐ CÓ TRONG CÂU, trình rõ từng bước, KHÔNG bịa số.
     Không dùng eval — tự đọc số và phép. Hiểu "triệu/tr", "nghìn/k",
     dấu chấm ngăn nghìn, dấu phẩy thập phân. */
  function docSo(t) {
    var out = [], re = /(\d[\d.,]*)\s*(triệu|trieu|tr|nghìn|nghin|ngàn|ngan|k|%)?/gi, m;
    while ((m = re.exec(t))) {
      var raw = m[1], unit = boDau(m[2] || '');
      if (!/\d/.test(raw)) continue;
      var num = raw.replace(/\./g, '').replace(',', '.');
      var v = parseFloat(num); if (isNaN(v)) continue;
      if (unit === 'trieu' || unit === 'tr') v *= 1e6;
      else if (unit === 'nghin' || unit === 'ngan' || unit === 'k') v *= 1e3;
      out.push({ raw: (m[0] || '').trim(), val: v, pc: unit === '%' });
    }
    return out;
  }
  function fmt(n) {
    try { return new Intl.NumberFormat('vi-VN').format(Math.round(n * 100) / 100); }
    catch (e) { return String(n); }
  }
  function soGan(cau, tu) {
    var re = new RegExp('(\\d[\\d.,]*)\\s*' + tu, 'i'), m = re.exec(boDau(cau));
    if (!m) return null;
    var v = parseFloat(m[1].replace(/\./g, '').replace(',', '.'));
    return isNaN(v) ? null : v;
  }

  G.tlToan = function (cau) {
    var low = boDau(cau);
    var so = docSo(cau);
    var pc = so.filter(function (s) { return s.pc; });
    var th = so.filter(function (s) { return !s.pc; });
    /* Phần trăm của một số */
    if (pc.length && th.length) {
      var base = Math.max.apply(null, th.map(function (s) { return s.val; }));
      var p = pc[0].val, kq = base * p / 100;
      return { co: true, tieuDe: 'Tính phần trăm',
               cach: fmt(base) + ' × ' + fmt(p) + '%', ketQua: fmt(kq) };
    }
    /* Chia đều / mỗi tháng */
    if (/(chia|moi thang|mot thang|hang thang|trong\s+\d+\s+thang|\/)/.test(low) && th.length) {
      var thang = soGan(cau, 'thang');
      var tong = Math.max.apply(null, th.map(function (s) { return s.val; }));
      var chia = thang;
      if (!chia && th.length >= 2) {
        var nho = th.slice().sort(function (a, b) { return a.val - b.val; })[0];
        chia = nho.val;
      }
      if (tong && chia && chia !== tong) {
        var kqc = tong / chia;
        return { co: true, tieuDe: 'Chia đều',
                 cach: fmt(tong) + ' ÷ ' + fmt(chia),
                 ketQua: fmt(kqc) + (/thang/.test(low) ? ' / tháng' : '') };
      }
    }
    /* Cộng tổng */
    if (/(tong|cong|gop)/.test(low) && th.length >= 2) {
      var s2 = th.reduce(function (a, b) { return a + b.val; }, 0);
      return { co: true, tieuDe: 'Cộng tổng',
               cach: th.map(function (x) { return fmt(x.val); }).join(' + '),
               ketQua: fmt(s2) };
    }
    return { co: false };
  };

  /* ─────────── 4) TRÍ NHỚ (trên máy khách, Điều 13) ─────────── */
  function khoaNho() {
    var a = (G.S && G.S.acc) || {};
    var id = a.uid || a.u || a.ten || 'khach';
    return 'gita365_tl_nho_' + boDau(String(id)).replace(/[^a-z0-9]+/g, '');
  }
  var STOP = ['con', 'cua', 'cho', 'nha', 'minh', 'khong', 'duoc', 'la', 'thi', 'ma',
    'va', 'voi', 'nhu', 'the', 'nao', 'gi', 'sao', 'toi', 'em', 'anh', 'chi', 'bi',
    'dang', 'da', 'se', 'rat', 'qua', 'lam', 'hay', 'co', 'mot', 'cac', 'nhung'];
  function chuDe(cau) {
    var tu = boDau(cau).replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)
      .filter(function (w) { return w.length >= 3 && STOP.indexOf(w) < 0; });
    return tu.slice(0, 3).join(' ');
  }
  G.tlNhoDoc = function () {
    try { return JSON.parse(localStorage.getItem(khoaNho()) || '{}') || {}; }
    catch (e) { return {}; }
  };
  G.tlNhoGhi = function (cau) {
    try {
      var n = G.tlNhoDoc();
      n.ten = (G.S && G.S.acc && G.S.acc.ten) || n.ten || '';
      n.soLuot = (n.soLuot || 0) + 1;
      var cd = chuDe(cau);
      if (cd) {
        n.chuDe = n.chuDe || [];
        /* Giữ TÓM chủ đề gần đây, không cộng dồn vô hạn — một dòng là một
           lượt đọc, không phải một ô tổng ghi đè (luật kho). */
        n.chuDe.unshift({ c: cd, luc: Date.now() });
        n.chuDe = n.chuDe.slice(0, 8);
      }
      n.capNhat = Date.now();
      localStorage.setItem(khoaNho(), JSON.stringify(n));
    } catch (e) {}
  };
  /* Câu nhắc ở lời chào — chỉ khi là người quay lại và có chủ đề cũ. */
  G.tlChaoNho = function () {
    if (!(G.LA_KHACH && G.LA_KHACH())) return '';
    var n = G.tlNhoDoc();
    if (!n || !n.soLuot || !(n.chuDe && n.chuDe.length)) return '';
    return ' Lần trước nhà mình có nhắc tới "' + n.chuDe[0].c + '" — mình nói tiếp chỗ đó nhé.';
  };

  /* ─────────── ORCHESTRATOR: gắn vào một lượt trả lời ───────────
     Gọi từ G.chatHoi sau khi đã dựng d. Không đụng bộ tra kho — chỉ THÊM.
     Đường khẩn (d.khan) KHÔNG gắn gì: đó là đường chuyển người thật, để
     trống cho sạch. */
  G.tlPhanTich = function (cau, d) {
    if (!d || d.khan) { if (!(d && d.khan)) G.tlNhoGhi(cau); return d; }
    d.vai = G.tlVai();
    var ng = G.tlNgonNgu(cau);
    /* Chỉ nói câu "hiểu ý" khi KHÔNG có chuỗi vòng dẫn (tránh trùng với
       'bắt nhịp' của chuỗi). */
    if (ng.phanAnh && !d.chuoi) d.phanAnh = ng.phanAnh;
    var t = G.tlToan(cau);
    if (t.co) d.toan = t;
    var nhac = G.tlChaoNho ? '' : '';   /* nhắc để ở lời chào, không lặp ở đây */
    G.tlNhoGhi(cau);
    return d;
  };
})();
