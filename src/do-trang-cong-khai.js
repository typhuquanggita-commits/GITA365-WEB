/* ═══════════════════════════════════════════════════════════════
   GITA 365 — KHỐI "TRANG CÔNG KHAI" (đầu màn Trung tâm đo lường, R01–R03)

   Đọc cửa docDoTrang (may-chu/do-trang.js): bao nhiêu lượt ghé thăm, từ
   đâu tới, bấm nút nào, bao nhiêu người bắt đầu điền form và gửi xong.
   Chỉ có SỐ ĐẾM — máy chủ không giữ IP, cookie hay mã người xem, nên ở đây
   cũng không có gì để lần ra một người.

   Con số đọc thế nào cho đúng được NÓI RA ngay dưới bảng: "lượt ghé thăm"
   không phải "số người", và máy quét có thể đếm thêm.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
(function(){
  var U = G.U, h = U.h;
  var st = { ai:'', soNgay:30, d:null, dang:false, loi:'' };
  function coMayChu(){ return !!(G.API_CAP_PHEP && G.PHIEN_TOKEN); }
  function veLai(){ if(G.S && G.S.view === 'trung-tam-do' && G.render) G.render(); }
  var TEN_TRANG = { landing:'Trang chủ', 've-chung-toi':'Về chúng tôi', 'dich-vu':'Dịch vụ', 'bang-gia':'Bảng giá',
    'lien-he':'Liên hệ', 'cau-hoi-thuong-gap':'Câu hỏi thường gặp', khac:'Trang khác' };
  var TEN_NGUON = { 'truc-tiep':'Gõ thẳng / lưu sẵn', google:'Google', facebook:'Facebook', zalo:'Zalo',
    youtube:'YouTube', tiktok:'TikTok', 'noi-bo':'Từ trang khác của GITA', khac:'Nguồn khác' };
  var TEN_MAY = { dt:'Điện thoại', may:'Máy tính' };

  function nap(){
    var ai = String((G.S && G.S.acc && G.S.acc.u) || '');
    if(st.ai !== ai) st = { ai:ai, soNgay:30, d:null, dang:false, loi:'' };
    if(!coMayChu() || st.d || st.dang || st.loi) return;
    st.dang = true;
    G.goiMayChu('docDoTrang', { soNgay: st.soNgay }).then(function(r){
      st.dang = false;
      if(r && r.ok) st.d = r; else st.loi = (r && r.error) || 'Chưa đọc được số đo trang công khai.';
      veLai();
    });
  }
  document.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('[data-dtc]'); if(!b) return;
    var n = Number(b.getAttribute('data-dtc'));
    if(n && n !== st.soNgay){ st.soNgay = n; st.d = null; st.loi = ''; veLai(); }
  });

  function soVN(n){ return Number(n || 0).toLocaleString('vi-VN'); }
  function bang(ds, ten){
    if(!ds || !ds.length) return '<p class="tiny muted" style="margin:4px 0 0">Chưa có số liệu.</p>';
    var max = ds[0].n || 1;
    return ds.slice(0, 8).map(function(x){
      return '<div class="dtc-hang"><span class="tiny">' + h(ten[x.k] || x.k) + '</span>' +
        '<span class="dtc-vach"><i style="width:' + Math.max(3, Math.round(x.n / max * 100)) + '%"></i></span>' +
        '<b class="tiny mono">' + soVN(x.n) + '</b></div>';
    }).join('');
  }

  G.dtcKhoi = function(){
    if(!coMayChu()) return '';
    nap();
    var o = '<section class="card pad mb dtc"><div class="row" style="gap:8px;flex-wrap:wrap;align-items:center">' +
      '<b>Trang công khai · khách làm gì</b><span class="grow"></span>' +
      [7, 30, 90].map(function(n){ return '<button class="btn sm' + (st.soNgay === n ? ' pri' : '') + '" data-dtc="' + n + '">' + n + ' ngày</button>'; }).join('') +
      '</div>';
    if(st.loi) return o + '<p class="tiny" style="color:var(--gita-do);margin:8px 0 0">' + h(st.loi) + '</p></section>';
    if(!st.d) return o + '<p class="tiny muted" style="margin:8px 0 0">Đang đọc…</p></section>';
    var d = st.d, p = d.pheu || [], dau = (p[0] && p[0].n) || 0;
    o += '<div class="dtc-so">' +
      '<div><span class="tiny muted">Lượt ghé thăm</span><b>' + soVN(d.tong.phien) + '</b></div>' +
      '<div><span class="tiny muted">Lượt xem trang</span><b>' + soVN(d.tong.xem) + '</b></div>' +
      '<div><span class="tiny muted">Bấm gọi hotline</span><b>' + soVN(d.tong.goiDien) + '</b></div>' +
      '<div><span class="tiny muted">Gửi form → tỷ lệ</span><b>' + (d.tyLeChuyenDoi == null ? '—' : h(String(d.tyLeChuyenDoi).replace('.', ',')) + '%') + '</b></div>' +
      '</div>';
    o += '<div class="dtc-pheu">' + p.map(function(b){
      var pc = dau ? Math.round(b.n / dau * 100) : 0;
      return '<div class="dtc-hang"><span class="tiny">' + h(b.ten) + '</span>' +
        '<span class="dtc-vach"><i style="width:' + Math.max(3, pc) + '%"></i></span>' +
        '<b class="tiny mono">' + soVN(b.n) + (dau ? ' · ' + pc + '%' : '') + '</b></div>';
    }).join('') + '</div>';
    o += '<div class="dtc-cot">' +
      '<div><div class="tiny b mb">Trang được xem</div>' + bang(d.theoTrang, TEN_TRANG) + '</div>' +
      '<div><div class="tiny b mb">Khách tới từ đâu</div>' + bang(d.theoNguon, TEN_NGUON) + '</div>' +
      '<div><div class="tiny b mb">Loại máy</div>' + bang(d.theoMay, TEN_MAY) + '</div>' +
      '<div><div class="tiny b mb">Nút được bấm</div>' + bang(d.nutBam, {}) + '</div>' +
      '</div>';
    if(d.tong.guiFormLoi) o += '<p class="tiny" style="color:var(--warn);margin:10px 0 0">' + soVN(d.tong.guiFormLoi) + ' lượt gửi form bị báo lỗi trong kỳ — xem Hộp thông báo và hotline.</p>';
    o += '<p class="tiny muted" style="margin:10px 0 0">Chỉ đếm số, không giữ IP, cookie hay tên người xem. "Lượt ghé thăm" là số lần mở trang đầu tiên trong một phiên trình duyệt — gần với số lượt khách, không phải số người; máy quét có thể đếm thêm. Từ ngày ' + h(d.tuNgay) + '.</p>';
    return o + '</section>';
  };
})();
