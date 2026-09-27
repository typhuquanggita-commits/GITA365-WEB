/* ═══════════════════════════════════════════════════════════════
   GITA 365 — ASSESSMENT TẦNG 1 · màn nghề · 9.99.224

   TRỎ, KHÔNG CHÉP: đọc bộ chẩn đoán chuyên gia Tầng 1 từ G.AS_* (kho mã
   hoá, nguồn "Bộ hồ sơ khách hàng - Assessment Tầng 1"). Công cụ của Tư
   vấn/Assessor: đọc hồ sơ → chấm 6 miền → theo ĐÚNG thứ tự 10 bước → giao
   thử 7 ngày. KHÔNG kết luận sâu khi DCI thấp. Không bịa 30 câu (nguồn
   chưa trích sạch — nói ra, không đưa dữ liệu méo).
   GÓI NGHỀ (pro_consult).
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  G.VIEWS['assessment'] = function () {
    if (!G.can || !G.can('pro_consult')) return U.lockCard ? U.lockCard() : U.empty('Cần gói nghề', 'Màn này khoá ở quyền nghề.');
    var MIEN = G.AS_MIEN, BUOC = G.AS_BUOC || [], CS = G.AS_CHAMSOC, PH = G.AS_PHANHOI;
    if (!MIEN) return U.empty('Assessment nằm trong gói nghề', 'Đăng nhập vai nghề để nạp bộ chẩn đoán (G.AS_*), rồi mở lại.');

    var o = U.ph({ eyebrow: 'HỒ SƠ & CHẨN ĐOÁN BAN ĐẦU · TẦNG 1', ic: 'check', grad: 1,
      t: 'Assessment Tầng 1',
      lead: 'Bộ chẩn đoán chuyên gia cho lượt gặp đầu: chấm điểm sáu miền (ánh xạ G-I-T-A), đọc theo đúng thứ tự bắt buộc, và chỉ kết luận sâu khi dữ liệu đủ tin cậy. Công cụ của Tư vấn và Chuyên gia đánh giá.' });

    o += U.bdSoHang([
      {k:'Miền chấm điểm', v:String(MIEN.dong.length), c:'var(--gita)', d:'D1–D6 → G·I·T·A'},
      {k:'Bước phân tích bắt buộc', v:String(BUOC.length), c:'var(--gita-sau)', d:'theo đúng thứ tự'},
      {k:'Ngưỡng tin cậy', v:'DCI', c:'var(--warn)', d:'<60 → chưa kết luận sâu'}
    ]);

    o += U.sec('SÁU MIỀN CHẤM ĐIỂM', 'Mỗi miền 5 câu · điểm miền = (thô − 5) ÷ 20 × 100. Ánh xạ đúng khung G-I-T-A.');
    o += '<div class="card">' + U.tbl(MIEN.cot, MIEN.dong.map(function (r) { return r.map(function (c) { return h(c); }); })) + '</div>';

    o += U.sec('QUY TRÌNH PHÂN TÍCH — THỨ TỰ BẮT BUỘC', 'Không nhìn tổng điểm trước. Đọc cấu hình, không đọc điểm lẻ. Chỉ quyết hướng sau 7 ngày dữ liệu.');
    o += '<div class="card"><ol class="as-buoc">' + BUOC.map(function (b) {
      return '<li><b>Bước ' + b.so + '.</b> ' + h(b.y) + '</li>';
    }).join('') + '</ol></div>';

    if (CS) { o += U.sec('ĐỊNH HƯỚNG CHĂM SÓC THEO NHÓM VẤN ĐỀ', ''); o += '<div class="card pad-sm"><p class="ktl-tl-val">' + h(CS) + '</p></div>'; }
    if (PH) { o += U.sec('CÔNG THỨC PHẢN HỒI GITA', ''); o += '<div class="card pad-sm"><p class="ktl-tl-val">' + h(PH) + '</p></div>'; }

    o += '<div class="card pad-sm mt" style="border-color:var(--warn)">' + ic('shield', 'w-4 h-4') +
      ' <b class="sm">Ba lằn ranh của Tầng 1:</b> <span class="tiny muted">không dán nhãn (dữ liệu, không kết luận vội) · DCI &lt; 60 thì bổ sung dữ liệu trước khi kết luận · điểm thấp nhất KHÔNG mặc định là điểm cần xử lý trước — chọn điểm ĐÒN BẨY. 30 câu hỏi gốc nằm ở nguồn dạng bảng trộn, chưa trích sạch nên chưa đưa vào (không đưa dữ liệu méo).</span></div>';

    return o;
  };
})();
