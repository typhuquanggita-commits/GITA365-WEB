/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v8.0 — NẠP GIẤY PHÉP NGAY TRONG ỨNG DỤNG
   Trước đây khoá chỉ vào được bằng hai đường: máy chủ cấp phép, hoặc
   tiến trình chính của bản máy tính. Chưa nối máy chủ là cả Super
   Admin cũng chỉ thấy "phần này chưa mở" — không duyệt được gì.

   Nay chủ hệ thống chọn thẳng tệp giấy phép trên máy: khoá nạp vào
   BỘ NHỚ phiên làm việc, mở đúng phạm vi ghi trong giấy phép, và
   không bao giờ ghi ra đĩa. Đóng ứng dụng là mất, phải nạp lại.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var U = G.U;

/* Ai được nạp giấy phép: người của Học viện từ cấp quản lý.
   Khách hàng không nạp — họ nhận khoá qua máy chủ theo tầng đã mua. */
/* Nạp được giấy phép hay không phụ thuộc HAI điều, không phải một.

   Điều thứ nhất là vai — chỉ cấp báo cáo trở lên.

   Điều thứ hai từng bị bỏ sót và tạo ra một nút chết: bản GIỚI THIỆU một
   tệp không mang theo kho .enc nào. Nó nhúng sẵn gói mẫu và thay hẳn hàm
   nạp kho, nên nạp giấy phép vào đấy thì có khoá mà không có gì để mở —
   bấm nút, chọn tệp, và màn hình không đổi gì. Người dùng không biết
   mình vừa làm sai ở đâu, và bản thân giấy phép thì đã bị mang ra khỏi
   nơi an toàn.

   Dấu nhận biết: G.MAU_NHUNG chỉ tồn tại ở bản một tệp (xem bước 5 của
   tools/dong-goi.py). Bản web nhiều tệp và bản cài đều không có nó. */
G.laBanMotTep = function(){ return typeof G.MAU_NHUNG !== 'undefined'; };

G.napDuocGiayPhep = function(){
  if(G.laBanMotTep()) return false;
  return G.can('pro_report') || G.can('qt_trang');
};

G.kiemGiayPhep = function(gp){
  if(!gp || typeof gp !== 'object') return 'Tệp không đọc được.';
  if(!gp.khoa || typeof gp.khoa !== 'object') return 'Tệp không có bộ khoá.';
  var ds = Object.keys(gp.khoa);
  if(!ds.length) return 'Giấy phép không cấp gói nào.';
  var HOP = ['nen','nghe','tang1','tang2','tang3','tang4','tang5'];
  var la = ds.filter(function(g){ return HOP.indexOf(g) < 0; });
  if(la.length) return 'Giấy phép có gói lạ: ' + la.join(', ');
  for(var i=0;i<ds.length;i++){
    var k = gp.khoa[ds[i]];
    if(typeof k !== 'string' || k.length < 40) return 'Khoá của gói ' + ds[i] + ' không đúng dạng.';
  }
  if(gp.hetHan){
    var h = new Date(gp.hetHan);
    if(!isNaN(h) && h < new Date())
      return 'Giấy phép hết hạn ngày ' + h.toLocaleDateString('vi-VN') + '. Xin cấp lại.';
  }
  return true;
};

G.moNapGiayPhep = function(){
  if(!G.napDuocGiayPhep()){
    U.toast('Vai này không nạp được giấy phép. Khoá cấp qua máy chủ theo tầng.','err');
    return;
  }
  U.modal(
    '<h2 style="font-size:21px;font-weight:800;margin-bottom:6px">Nạp giấy phép</h2>'+
    '<p class="sm muted" style="margin-bottom:14px">Chọn tệp giấy phép Học viện cấp cho máy này. '+
    'Khoá chỉ nằm trong bộ nhớ của phiên làm việc — đóng ứng dụng là mất, không ghi ra đĩa.</p>'+
    '<label class="tiny up muted">TỆP GIẤY PHÉP (.json)</label>'+
    '<input id="gp_tep" type="file" accept=".json,application/json" class="inp blk mb">'+
    '<div id="gp_loi" class="tiny mb" style="min-height:16px;color:var(--gita-do-ink)"></div>'+
    '<button class="btn pri blk" data-act="gp-nap">Nạp và mở kho</button>'+
    '<p class="tiny muted mt">Tệp giấy phép mang khoá thật. Không gửi qua kênh công khai, '+
    'không dùng chung một tệp cho nhiều người — mỗi bản cấp là một dấu vết truy nguồn.</p>'
  );
};

G.napGiayPhep = function(){
  var loi = document.getElementById('gp_loi');
  function bao(t){ if(loi) loi.textContent = t; }
  var o = document.getElementById('gp_tep');
  var tep = o && o.files && o.files[0];
  if(!tep){ bao('Chưa chọn tệp.'); return; }
  if(tep.size > 512 * 1024){ bao('Tệp quá lớn — giấy phép thật chỉ vài KB.'); return; }

  var doc = new FileReader();
  doc.onload = function(){
    var gp;
    try{ gp = JSON.parse(String(doc.result)); }
    catch(e){ bao('Tệp không phải JSON hợp lệ.'); return; }
    var r = G.kiemGiayPhep(gp);
    if(r !== true){ bao(r); return; }

    window.GITA_KHOA = gp.khoa;
    if(G.secLog) G.secLog('Nạp giấy phép',
      (gp.soGiayPhep||'—') + ' · cấp cho ' + (gp.capCho||'—') +
      ' · gói ' + Object.keys(gp.khoa).join(' ') + ' · ' + (G.S.acc && G.S.acc.u), 'Ghi nhận');

    U.closeModal();
    U.toast('Đã nhận giấy phép ' + (gp.soGiayPhep||'') + ' — đang mở kho…','ok');
    G.napKho().then(function(){
      G.render();
      var l = document.getElementById('left'); if(l) l.innerHTML = G.leftNav ? G.leftNav() : l.innerHTML;
      U.toast('Đã mở ' + G.KHO.daNap.length + ' gói: ' + G.KHO.daNap.join(' · '), 'ok');
    });
  };
  doc.readAsText(tep);
};
})();
