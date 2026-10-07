/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÀN BỘ NÃO VẬN HÀNH V50 (R01–R03)
   Đọc thẳng máy chủ (may-chu/bo-nao-van-hanh.js): phân hệ nào đang chạy,
   chạy theo chế độ nào, nhịp gần nhất làm được gì. Super Admin có hai nút:
   "Chạy thử" (đi đủ bước, chỉ đọc) và "Chạy thật một lượt".
   Không có máy chủ thì nói thẳng — không vẽ số giả cho một bảng giám sát.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic;
  var st = { ai:'', d:null, dang:false, loi:'', chay:null, dangChay:false };
  function coMayChu(){ return !!(G.API_CAP_PHEP && G.PHIEN_TOKEN); }
  function laR01(){ return !!(G.S && G.S.role === 'R01'); }
  function veLai(){ if(G.S && G.S.view === 'bo-nao-van-hanh' && G.render) G.render(); }
  function gio(s){ try { var d = new Date(s); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ' · ' + d.getDate() + '/' + (d.getMonth() + 1); } catch(e){ return s; } }
  var TT = { ok:['ổn','var(--ok)'], canhBao:['cảnh báo','var(--warn)'], loi:['lỗi','var(--gita-do)'] };
  var KIEU = { nhip:'Nhịp mỗi giờ', khachMoi:'Khách mới', tay:'Chạy tay', thu:'Chạy thử' };

  function nap(){
    var ai = String((G.S && G.S.acc && G.S.acc.u) || '');
    if(st.ai !== ai) st = { ai:ai, d:null, dang:false, loi:'', chay:null, dangChay:false };
    if(!coMayChu() || st.d || st.dang) return;
    st.dang = true;
    G.goiMayChu('docBoNao', {}).then(function(r){
      st.dang = false;
      if(r && r.ok) st.d = r; else st.loi = (r && r.error) || 'Chưa đọc được bộ não.';
      veLai();
    });
  }
  G.boNaoChay = function(that){
    if(st.dangChay) return;
    st.dangChay = true; veLai();
    G.goiMayChu('chayThuBoNao', { that: !!that }).then(function(r){
      st.dangChay = false; st.chay = r; st.d = null;   /* đọc lại lịch sử */
      if(!(r && r.ok)) U.toast((r && r.error) || 'Chưa chạy được.', 'err');
      else U.toast(that ? 'Đã chạy một lượt thật.' : 'Đã chạy thử — không ghi gì.', 'ok');
      veLai();
    });
  };

  function phanHe(ds){
    return '<div class="bn-phanhe">' + ds.map(function(p){
      return '<div class="card bn-ph' + (p.bat ? '' : ' bn-tat') + '"><div class="bn-ph-dau"><b>' + h(p.ten) + '</b>' +
        '<span class="bn-pill" style="--bp:' + (p.bat ? 'var(--ok)' : 'var(--ink-4)') + '">' + (p.bat ? 'đang chạy' : 'tắt') + '</span></div>' +
        '<p class="tiny" style="margin:4px 0 0">' + h(p.cheDo) + '</p>' + (p.moTa ? '<p class="tiny muted" style="margin:4px 0 0">' + h(p.moTa) + '</p>' : '') + '</div>';
    }).join('') + '</div>';
  }
  function buoc(kq){
    return '<div class="bn-buoc">' + (kq.buoc || []).map(function(b){
      var t = TT[b.tt] || TT.ok, so = [];
      if(b.ma === 'PHAN_CONG') so.push(b.so + ' nhà chưa có Tư vấn' + (kq.that ? ' · đã giao ' + (b.daGan || 0) : ' · sẽ giao ' + (b.seGan || 0)) + (b.thieu ? ' · thiếu Tư vấn ' + b.thieu : ''));
      if(b.ma === 'DEN_CHAM') so.push('xanh ' + b.xanh + ' · vàng ' + b.vang + ' · đỏ ' + b.do + (kq.that ? ' · đưa lên đầu ' + (b.duaLen || 0) : ''));
      if(b.ma === 'HEN_CRM') so.push(b.tong + ' hẹn quá hạn' + (b.theoNguoi && b.theoNguoi.length ? ' · ' + b.theoNguoi.slice(0, 4).map(function(x){ return x.ai + ' ' + x.n; }).join(', ') : ''));
      if(b.ma === 'CONG_NO') so.push((b.so || 0) + ' kỳ quá hạn · ' + U.bdGon(b.tongConNo || 0) + ' đ · chưa ai nhắc ' + (b.chuaAiNhac || 0));
      if(b.ma === 'KHO_CHO_DUYET') so.push((b.so || 0) + ' bản nháp chờ ba chữ ký');
      if(b.ma === 'BAO_DONG') so.push(b.soNgo ? b.soNgo + ' tài khoản đáng ngờ' : 'không có dấu hiệu' + (b.mailCuu ? '' : ' · chưa nạp email cứu hệ'));
      if(b.ma === 'AGENT') so.push(!b.so ? 'không có tuyến tự chạy nào đang dở' : kq.that ? (b.daChay || 0) + '/' + b.so + ' tuyến chạy tiếp một chặng' : b.so + ' tuyến sẽ chạy tiếp' );
      if(b.ma === 'CHUP_DO') so.push(b.daChup ? 'đã chụp' : b.seChup ? 'sẽ chụp' : 'hôm nay đã có');
      return '<div class="bn-b" style="--bt:' + t[1] + '"><span class="bn-pill" style="--bp:' + t[1] + '">' + t[0] + '</span><div><b>' + h(b.ten) + '</b>' +
        '<p class="tiny muted" style="margin:2px 0 0">' + h(so.join(' ') || '') + (b.ghiChu ? ' — ' + h(b.ghiChu) : '') + (b.loi ? ' — ' + h(b.loi) : '') + '</p></div></div>';
    }).join('') + '</div>';
  }
  function lichSu(ds){
    if(!ds.length) return '<p class="tiny muted">Chưa có nhịp nào được ghi. Ca làm việc đầu tiên bắt đầu ở phút 0 của giờ kế tiếp sau khi triển khai.</p>';
    return '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Lúc</th><th>Loại</th><th>Kết quả</th></tr></thead><tbody>' + ds.slice(0, 24).map(function(x){
      var kq0 = x.kieu === 'nhip' && x.lan != null ? 'lượt ' + (x.lan + 1) + '/6 · ' : '';
      var kq = x.kieu === 'khachMoi' ? (x.maKH + ' → ' + ((x.phanCong && x.phanCong.tuVan) || (x.phanCong && x.phanCong.ket) || '')) :
        x.tom ? (kq0 + x.tom.canhBao + ' cảnh báo · ' + x.tom.loi + ' lỗi · ' + (x.ms || 0) + ' ms') : '';
      return '<tr><td class="mono tiny">' + h(gio(x.luc)) + '</td><td>' + h(KIEU[x.kieu] || x.kieu) + (x.that ? '' : ' <span class="tiny muted">(không ghi)</span>') + '</td><td class="tiny">' + h(kq) + '</td></tr>';
    }).join('') + '</tbody></table></div>';
  }

  document.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('[data-bn]'); if(!b || b.disabled) return;
    G.boNaoChay(b.getAttribute('data-bn') === 'that');
  });

  G.VIEWS['bo-nao-van-hanh'] = function(){
    nap();
    var o = '<header class="ph"><div class="eyebrow">V50 · vận hành 24/7</div><h1>Bộ não vận hành</h1>' +
      '<p class="lead">Làm 30 phút · nghỉ 30 phút, lặp liên tục 24/7 (sáu lượt ở phút 0–25 mỗi giờ). Mỗi lượt bộ não tự giao Tư vấn cho nhà mới, đưa nhà lâu không ai chạm lên đầu danh sách gọi, đếm hẹn và công nợ quá hạn, soát báo động, chạy tiếp đội Agent, chụp số đo. Có khách kích hoạt tài khoản là chạy ngay. Nội dung cho khách và mã nguồn vẫn đi qua chữ ký của người.</p></header>';
    if(!coMayChu())
      return o + '<div class="card pad"><b>Bảng này đọc thẳng máy chủ.</b><p class="tiny muted" style="margin:6px 0 0">Đăng nhập bản có máy chủ (gita365.pages.dev) để thấy phân hệ đang chạy và nhịp gần nhất. Bản thử không có số để hiện — bảng giám sát không vẽ số giả.</p></div>';
    if(laR01())
      o += '<div class="card pad mb bn-nut"><div><b>Chạy bộ não bằng tay</b><p class="tiny muted" style="margin:2px 0 0">Chạy thử đi đủ các bước và chỉ đọc; chạy thật làm đúng việc của một nhịp.</p></div>' +
        '<div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn" data-bn="thu"' + (st.dangChay ? ' disabled' : '') + '>' + ic('pulse', 'w-4 h-4') + 'Chạy thử (không ghi)</button>' +
        '<button class="btn pri" data-bn="that"' + (st.dangChay ? ' disabled' : '') + '>' + ic('arrow', 'w-4 h-4') + 'Chạy thật một lượt</button></div></div>';
    if(st.dangChay) o += '<div class="card pad mb"><p class="tiny">Bộ não đang chạy…</p></div>';
    if(st.chay && st.chay.ok)
      o += '<section class="card pad mb"><div class="tc-khoi-dau"><b>' + (st.chay.that ? 'Lượt vừa chạy thật' : 'Lượt vừa chạy thử — chưa ghi gì') + '</b><span class="tiny muted">' + h(gio(st.chay.luc)) + ' · ' + (st.chay.ms || 0) + ' ms</span></div>' + buoc(st.chay) + '</section>';
    if(st.loi) return o + '<div class="card pad"><p class="tiny" style="color:var(--gita-do)">' + h(st.loi) + '</p></div>';
    if(!st.d) return o + '<div class="card pad"><p class="tiny muted">Đang đọc bộ não…</p></div>';
    o += '<section class="mb"><h2 class="h2">Phân hệ</h2>' + phanHe(st.d.phanHe || []) + '</section>';
    o += '<section class="card pad mb"><div class="tc-khoi-dau"><b>Nhịp gần đây</b><span class="tiny muted">' + (st.d.nhipCuoi ? 'nhịp mỗi giờ gần nhất: ' + h(gio(st.d.nhipCuoi)) : 'chưa có nhịp mỗi giờ') + '</span></div>' + lichSu(st.d.lanChay || []) + '</section>';
    return o;
  };
})();
