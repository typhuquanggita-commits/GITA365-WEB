/* ═══════════════════════════════════════════════════════════════
   GITA 365 — KHUNG DỮ LIỆU & MA TRẬN QUYỀN (V50·168 · R01–R02)

   Chủ hệ: "Các phần tài chính và CRM cho hiển thị khung bảng để tôi có thể
   kiểm tra cấu trúc". Bốn thẻ:
     CRM · Tài chính   khung từng bảng D1 (cột · kiểu · ràng buộc · chú thích)
                       và ai đọc / ai ghi — sinh từ may-chu/csdl.sql bằng
                       tools/dung-khung-du-lieu.js (CI canh khớp lược đồ).
                       Chỉ cấu trúc, không một dòng dữ liệu.
     Ma trận           15 vai × 15 màn chính: nghiệp vụ · khu khách hàng ·
                       màn của khách — đọc thẳng từ src/v50-man.js.
     Luồng dữ liệu     khách làm gì → ghi vào bảng nào → màn nhân sự nào đọc.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic;
  var VIEW = 'khung-du-lieu';
  var st = { tab:'crm', mo:'' };

  var LUONG = [
    ['Gia đình tick việc hôm nay, nhiệm vụ, nhịp sống', 'Nhà mình hôm nay', 'nhipXong', 'Đo lường toàn diện khách hàng · Trung tâm đo lường (co4) · Chiến lược V20'],
    ['Gia đình gửi sổ đo, chấm NPS / CSAT', 'Hành trình & tiến bộ · Dịch vụ', 'suKienKH · danhGiaKH · hoSoThang', 'Đo lường toàn diện khách hàng · Trung tâm đo lường (kh3, kh4)'],
    ['Gia đình dùng dịch vụ tự phục vụ bằng credit', 'Dịch vụ & tài khoản (Ví)', 'soCredit · viCredit', 'Credit (Tài chính) · Trung tâm đo lường'],
    ['Coach ghi một buổi coach', 'Hệ điều hành Coach', 'soCredit → soCham (tự động)', 'CRM: dòng thời gian, chạm cuối, KPI · Coach: đèn xanh / vàng / đỏ'],
    ['Coach / Tư vấn ghi lượt chạm (nhắn · gọi · WOW)', 'Hệ điều hành Coach', 'soCham', 'CRM · Điều phối & giám sát · Trung tâm đo lường (co1, co2)'],
    ['Tư vấn ghi phiếu thu; kế toán duyệt', 'Khách hàng & CRM · Tài chính', 'phieuThu → kyThu · nạp soCredit', 'Gia đình: thanh toán, công nợ, ví · Tài chính · Trung tâm (tc1, tc4)'],
    ['Đổi tầng cho một nhà (cổng KPI + thanh toán)', 'Điều hành · Tài chính', 'hoSoKhach.tang · nguoiHocTang · kyThu', 'Gia đình: phần mở theo tầng · lộ trình cá nhân hoá · lịch thu'],
    ['Super Admin cấp quyền', 'Tài khoản & quyền', 'quyenCRM · quyenTaiChinh · quyenT5Pro · quyenNoiDung', 'Đăng nhập trả mức quyền → cột trái nhân sự mở thêm màn tương ứng']
  ];

  function bangKhung(ds){
    return ds.map(function(b){
      var mo = st.mo === b.ten;
      return '<div class="card mb kdl-bang"><button class="kdl-dau" data-kdl="mo" data-v2="' + h(b.ten) + '" aria-expanded="' + mo + '">' +
        '<span class="mono"><b>' + h(b.ten) + '</b></span><span class="sm muted">' + h(b.mo) + '</span><span class="tiny muted">' + b.cot.filter(function(c){ return c[0] !== '(ràng buộc)'; }).length + ' cột ' + (mo ? '▴' : '▾') + '</span></button>' +
        '<div class="kdl-quyen tiny"><span><b>Ai đọc:</b> ' + h(b.doc) + '</span><span><b>Ai ghi:</b> ' + h(b.ghi) + '</span></div>' +
        (mo ? '<div class="v50-bang mt" role="table" aria-label="Cột của bảng ' + h(b.ten) + '">' +
          '<div class="v50-hang v50-hang-dau kdl-hang" role="row"><span>Cột</span><span>Kiểu</span><span>Ràng buộc</span><span>Ý nghĩa</span></div>' +
          b.cot.map(function(c){ return '<div class="v50-hang kdl-hang" role="row"><span class="mono">' + h(c[0]) + '</span><span class="mono tiny">' + h(c[1]) + '</span><span class="mono tiny">' + h(c[2]) + '</span><span class="tiny">' + h(c[3]) + '</span></div>'; }).join('') +
        '</div>' : '') + '</div>';
    }).join('');
  }

  function maTran(){
    var M = G.V50M; if(!M) return '';
    var VAI = ['R01','R02','R03','R04','R05','R06','R07','R08','R09','R10','R11','R12','R13','R14','R15','khach-la'];
    var ten = function(id){ if(id === 'khach-la') return 'Khách lạ'; var r = G.roleById ? G.roleById(id) : null; return r ? r.short || r.n : id; };
    var o = '<p class="sm muted mb">● màn nghiệp vụ của vai · ◐ khu vực khách hàng (nhân sự xem theo quyền) · ◎ màn của chính khách · — không có. Quyền Super Admin cấp thêm (CRM, ban tài chính, T5-PRO, ký nội dung) mở phần tương ứng bên trong các màn này.</p>';
    o += '<div class="kdl-cuon"><table class="kdl-mt"><thead><tr><th>Màn chính</th>' + VAI.map(function(v){ return '<th>' + h(ten(v)) + '</th>'; }).join('') + '</tr></thead><tbody>';
    M.HUB.forEach(function(hb){
      o += '<tr><th>' + h(hb.ten) + ' <small class="muted">' + hb.phan.length + '</small></th>' + VAI.map(function(v){
        var ns = M.hubVai(v).indexOf(hb.id) >= 0, kh = (M.VAI_KHACH[v] || []).indexOf(hb.id) >= 0;
        var k = ns ? (M.laKhach(v) ? '◎' : '●') : kh ? '◐' : '—';
        return '<td class="kdl-o' + (k === '—' ? ' muted' : '') + '">' + k + '</td>';
      }).join('') + '</tr>';
    });
    o += '<tr><th>Tổng màn hiển thị</th>' + VAI.map(function(v){ return '<td class="kdl-o"><b>' + M.hubTatCa(v).length + '</b></td>'; }).join('') + '</tr>';
    return o + '</tbody></table></div>';
  }

  function luong(){
    return '<div class="v50-bang" role="table" aria-label="Luồng dữ liệu khách và nhân sự">' +
      '<div class="v50-hang v50-hang-dau kdl-luong" role="row"><span>Việc xảy ra</span><span>Ở màn</span><span>Ghi vào bảng</span><span>Màn nhân sự đọc</span></div>' +
      LUONG.map(function(x){ return '<div class="v50-hang kdl-luong" role="row"><span>' + h(x[0]) + '</span><span class="tiny">' + h(x[1]) + '</span><span class="mono tiny">' + h(x[2]) + '</span><span class="tiny">' + h(x[3]) + '</span></div>'; }).join('') +
      '</div><p class="tiny muted mt">Mọi luồng chạy ngầm qua một cơ sở dữ liệu duy nhất (D1) ở máy chủ: khách và nhân sự nhìn cùng một số, mỗi bên qua cổng quyền của mình.</p>';
  }

  G.VIEWS[VIEW] = function(){
    if(!(G.can && G.can('qt_trang'))) return U.lockCard('Khung dữ liệu dành cho Admin hệ thống và Super Admin.');
    var K = G.KHUNG_DL || { crm:[], taiChinh:[] };
    var o = U.ph({ eyebrow:'V50·168 · CẤU TRÚC HỆ', ic:'grid', grad:1, t:'Khung dữ liệu & ma trận quyền',
      lead:'Khung bảng CRM và Tài chính để soát cấu trúc (chỉ cột, không dữ liệu), ma trận vai × màn chính, và luồng dữ liệu nối khách với nhân sự.' });
    var TAB = [['crm','CRM · ' + K.crm.length + ' bảng','heart'], ['tc','Tài chính · ' + K.taiChinh.length + ' bảng','list'], ['mt','Ma trận vai × màn','grid'], ['luong','Luồng dữ liệu','orbit']];
    o += '<div class="co-tabs" role="tablist">' + TAB.map(function(t){ return '<button class="co-tab' + (st.tab === t[0] ? ' on' : '') + '" role="tab" data-kdl="tab" data-v2="' + t[0] + '">' + ic(t[2],'w-3 h-3') + h(t[1]) + '</button>'; }).join('') + '</div>';
    if(st.tab === 'crm') o += bangKhung(K.crm);
    else if(st.tab === 'tc') o += bangKhung(K.taiChinh);
    else if(st.tab === 'mt') o += maTran();
    else o += luong();
    return o;
  };

  document.addEventListener('click', function(e){
    var el = e.target.closest && e.target.closest('[data-kdl]'); if(!el) return;
    var a = el.getAttribute('data-kdl'), v = el.getAttribute('data-v2') || '';
    if(a === 'tab'){ st.tab = v; st.mo = ''; }
    else if(a === 'mo') st.mo = st.mo === v ? '' : v;
    if(G.render && G.S && G.S.view === VIEW) G.render();
  });
})();
