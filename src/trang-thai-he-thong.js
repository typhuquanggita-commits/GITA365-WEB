/* Bảng vận hành một màn: chỉ hiện sự thật đo được, không tự sửa hay tự deploy. */
'use strict';
var G = window.G || {}; window.G = G;
(function(){
  var U = G.U, h = U.h, ic = U.ic, KHO = 'gita365_lich_su_trang_thai';
  G.VIEWS = G.VIEWS || {};

  function role(){ return String((G.S && G.S.acc && G.S.acc.role) || ''); }
  function allowed(){ return role() === 'R01' || role() === 'R02'; }
  function read(){
    try { var x = JSON.parse(localStorage.getItem(KHO) || '[]'); return Array.isArray(x) ? x.slice(0, 12) : []; }
    catch(e){ return []; }
  }
  function save(x){
    try { localStorage.setItem(KHO, JSON.stringify([x].concat(read()).slice(0, 12))); } catch(e){}
  }
  function state(ok, stop){
    return stop ? {t:'Dừng an toàn', c:'var(--gita-do)', i:'lock'} :
      ok ? {t:'Bình thường', c:'var(--ok)', i:'check'} :
      {t:'Cần xử lý', c:'var(--warn)', i:'alert'};
  }
  function card(x){
    var s = state(x.ok, x.stop);
    return '<div class="card" style="flex:1;min-width:240px;border-color:'+s.c+'">'+
      '<div class="row" style="gap:8px"><span style="color:'+s.c+'">'+ic(s.i,'w-4 h-4')+'</span><b>'+h(x.name)+'</b></div>'+
      '<p class="sm mt" style="color:'+s.c+'"><b>'+s.t+'</b></p>'+
      '<p class="sm dim mt">'+h(x.detail)+'</p>'+
      (x.action ? '<button class="btn ghost sm mt" data-act="tt-'+h(x.action)+'">'+h(x.label || 'Xem một bước tiếp theo')+'</button>' : '')+
      '</div>';
  }
  function go(view){ if(G.go) G.go(view); else if(G.S){ G.S.view=view; G.render(); } }
  function renderResult(r){
    var box = document.getElementById('ttKq');
    if(!box) return;
    var workerOk = !!(r && r.ok && r.khoaSanSang && r.csdlSanSang && r.soKhoa > 0);
    var now = new Date().toLocaleString('vi-VN');
    save({luc:now, ketQua:workerOk ? 'Bình thường' : 'Cần xử lý'});
    var rows = [
      {name:'Web GITA365', ok:navigator.onLine, detail:navigator.onLine ? 'Thiết bị đang có kết nối mạng.' : 'Thiết bị đang ngoại tuyến; chỉ dùng phần đã có trên máy.', action:'network', label:'Hướng dẫn kết nối'},
      {name:'Worker & dữ liệu', ok:workerOk, stop:!!(r && r.ok && !r.csdlSanSang),
       detail:workerOk ? 'Worker trả lời, D1 sẵn sàng và bộ khóa đã nạp.' : (r && r.ok ? 'Worker trả lời nhưng D1 hoặc bộ khóa chưa sẵn sàng.' : 'Chưa gọi được Worker.'),
       action:'server', label:'Hướng dẫn xử lý'},
      {name:'Sao lưu & khôi phục', ok:false, detail:'Không tự suy đoán tình trạng sao lưu. Chỉ đánh dấu bình thường sau khi người phụ trách diễn tập khôi phục.', action:'backup', label:'Mở SOP sao lưu'},
      {name:'Video riêng tư', ok:false, detail:'Render chỉ chạy trên máy nội bộ với Docker và dữ liệu được cấp quyền; không gửi media khách lên dịch vụ render ngoài.', action:'video', label:'Mở SOP video'},
      {name:'Sổ điều hành', ok:true, detail:'Ghi sự cố, phát hành và cải tiến có chủ việc, duyệt, bằng chứng và đường lùi.', action:'operations', label:'Mở sổ điều hành'}
    ];
    box.innerHTML = '<div class="row wrap" style="gap:12px">'+rows.map(card).join('')+'</div>'+
      '<div class="card mt2"><b class="sm">'+ic('shield','w-4 h-4')+' Việc tiếp theo</b><p class="sm dim mt">'+
      (workerOk ? 'Kiểm tra bản sao lưu/khôi phục theo lịch; hệ không tự tạo xác nhận thay con người.' :
      'Không phát hành Worker hoặc sửa dữ liệu. Mở hướng dẫn Worker, xử lý từng bước, rồi bấm kiểm tra lại.')+
      '</p></div>';
  }
  G.kiemTrangThaiHeThong = function(){
    var box = document.getElementById('ttKq');
    if(box) box.innerHTML = '<p class="sm dim">Đang kiểm tra Worker, dữ liệu và bộ khóa…</p>';
    if(!G.thuMayChu) return renderResult(null);
    G.thuMayChu().then(renderResult);
  };
  G.VIEWS['trang-thai-he-thong'] = function(){
    if(!allowed()) return U.lockCard('Bảng vận hành chỉ dành cho Super Admin và Admin hệ thống.');
    var hist = read();
    var o = U.ph({eyebrow:'VẬN HÀNH NỘI BỘ · R01 – R02',ic:'pulse',grad:1,
      t:'Trạng thái hệ thống',lead:'Một màn kiểm tra đơn giản: chỉ ba trạng thái, không log kỹ thuật và không tự thay đổi dữ liệu hay phát hành.'});
    o += '<div class="card"><button class="btn pri" data-act="tt-check">'+ic('pulse','w-4 h-4')+'Kiểm tra ngay</button>'+
      '<p class="sm dim mt">Bình thường = tín hiệu đo được đạt. Cần xử lý = làm đúng một bước được hướng dẫn. Dừng an toàn = không phát hành hoặc thay đổi dữ liệu.</p></div>'+
      '<div id="ttKq" class="mt2"><p class="sm dim">Chưa kiểm tra trong phiên này.</p></div>'+
      '<div class="card mt2"><b class="sm">Lịch sử kiểm tra trên thiết bị này</b><p class="tiny muted mt">Chỉ để nhắc việc, không thay thế nhật ký máy chủ hoặc chứng cứ sao lưu.</p>'+
      (hist.length ? '<ul class="sm mt">'+hist.map(function(x){ return '<li>'+h(x.luc)+' · '+h(x.ketQua)+'</li>'; }).join('')+'</ul>' : '<p class="sm dim mt">Chưa có lượt kiểm tra.</p>')+'</div>'+
      '<div class="card mt2"><b class="sm">Giới hạn vận hành trung thực</b><p class="sm dim mt">GITA365 tự chủ tối đa nhưng vẫn cần Cloudflare cho web/API và người phụ trách cho backup, migration, quyền, duyệt nội dung và rollback. Hệ không cam kết “100%” hoặc tự chữa dữ liệu.</p></div>';
    return o;
  };
  document.addEventListener('click', function(e){
    var b=e.target.closest && e.target.closest('[data-act]'); if(!b) return;
    var a=b.getAttribute('data-act');
    if(a==='tt-check') G.kiemTrangThaiHeThong();
    if(a==='tt-server') go('noi-may-chu');
    if(a==='tt-video') go('studio');
    if(a==='tt-operations') go('so-dieu-hanh');
    if(a==='tt-network') U.toast('Kiểm tra Wi‑Fi/4G, rồi bấm “Kiểm tra ngay” lại. Không thay đổi dữ liệu khi đang mất mạng.','err');
    if(a==='tt-backup') U.toast('Mở docs/TRIEN_KHAI_WEB.md: làm backup/rollback có người xác nhận trước Worker deploy.','ok');
  });
})();
