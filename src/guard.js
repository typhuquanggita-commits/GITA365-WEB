/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v7.0 — LÁ CHẮN CHẠY THẬT
   Ba lớp chạy được ngay trong trình duyệt: đóng dấu chìm theo người
   xem, chặn sao chép hàng loạt khi chưa có đồng ý, và nhận diện
   hành vi quét kho. Lớp thứ tư — đối chiếu hồ sơ và nhật ký không
   xoá được — phải đặt ở máy chủ, xem docs/BAO_MAT.md.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
(function(){
var G = window.G;
G.SECLOG = [];
G.CONSENT = false;

/* Màn hình mang tài sản chuyên môn — được canh chặt hơn */
var CANH = ['phac-do','kich-ban','mo-thuc','sach','tu-duy','ngon-tu','chan-dung-tc',
            'kiem-duyet','nguoi-dung','tang-truong','ra-soat','chuan-1000','bo-test','tinh-huong','ma-tran','ma-tran-bang','cay-tien','chan-dung-kh','phuong-phap','hoso-vip','chuyen-doi'];
G.isCanh = function(v){ return CANH.indexOf(v) >= 0; };

function ghi(loai, chiTiet, mucdo){
  var d = new Date();
  G.SECLOG.unshift({
    gio: String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+':'+String(d.getSeconds()).padStart(2,'0'),
    ai: (G.S && G.S.acc) ? G.S.acc.u : 'chưa đăng nhập',
    vai: (G.S && G.S.roleObj) ? G.S.roleObj.short : '—',
    loai: loai, chiTiet: chiTiet, mucdo: mucdo || 'Ghi nhận',
    man: (G.S && G.S.view) || '—'
  });
  if(G.SECLOG.length > 120) G.SECLOG.pop();
}
G.secLog = ghi;

/* ─── Lớp 1: đóng dấu chìm theo người xem ─── */
function watermark(){
  var el = document.getElementById('wm');
  if(!G.S || !G.S.acc || !G.isCanh(G.S.view)){ if(el) el.remove(); return; }
  if(!el){
    el = document.createElement('div');
    el.id = 'wm';
    document.body.appendChild(el);
  }
  var d = new Date();
  var t = G.S.acc.u + ' · ' + G.S.roleObj.short + ' · ' +
    String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear()+' ' +
    String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0') + ' · GITA 365';
  el.setAttribute('data-t', t);
  el.innerHTML = '';
  for(var i=0;i<12;i++){
    var s = document.createElement('span');
    s.textContent = t;
    el.appendChild(s);
  }
}
G.watermark = watermark;

/* ─── Lớp 2: chặn sao chép hàng loạt khi chưa có đồng ý ─── */
document.addEventListener('copy', function(e){
  if(!G.S || !G.S.acc) return;
  var sel = String(window.getSelection ? window.getSelection() : '');
  if(!G.isCanh(G.S.view)) return;
  if(sel.length > 600 && !G.CONSENT){
    e.preventDefault();
    ghi('Sao chép khối lớn', 'Chặn sao chép '+sel.length+' ký tự từ kho chuyên môn khi chưa có đồng ý xuất dữ liệu.', 'Đã chặn');
    G.U.toast('Đã chặn sao chép khối lớn từ kho chuyên môn. Xin đồng ý xuất dữ liệu ở mục Lá chắn dữ liệu.','err');
  } else if(sel.length > 120){
    ghi('Sao chép', 'Sao chép '+sel.length+' ký tự · đã đóng dấu người xem.', 'Ghi nhận');
  }
});

/* ─── Lớp 2b: chặn lưu trang và in ───
   Hai tầng, không phải một:
   1. Vai không có quyền xuat_pdf thì chặn in ở MỌI màn hình, không chỉ màn
      chuyên môn — khách hàng không được xuất hồ sơ ra ngoài.
   2. Vai có quyền vẫn phải qua bước xin đồng ý khi ở màn chuyên môn. */
document.addEventListener('keydown', function(e){
  if(!G.S || !G.S.acc) return;
  var k = (e.key||'').toLowerCase();
  if(!((e.ctrlKey||e.metaKey) && (k==='s' || k==='p'))) return;
  var viec = k==='s' ? 'Lưu trang' : 'In trang';

  if(!G.can('xuat_pdf')){
    e.preventDefault();
    ghi(viec, 'Vai ' + G.S.role + ' không có quyền xuat_pdf — chặn ' + (k==='s'?'lưu':'in') + ' ở mọi màn hình.', 'Đã chặn');
    G.U.toast('Tài khoản này không có quyền xuất bản in. Chỉ người của GITA 365 từ cấp quản lý mới xuất được.','err');
    return;
  }
  if(G.isCanh(G.S.view) && !G.CONSENT){
    e.preventDefault();
    ghi(viec, 'Chặn '+(k==='s'?'lưu':'in')+' màn hình chuyên môn khi chưa có đồng ý.', 'Đã chặn');
    G.U.toast('Màn hình chuyên môn cần bước xin đồng ý trước khi xuất ra ngoài.','err');
  }
});
document.addEventListener('dragstart', function(e){
  if(G.S && G.S.acc && G.isCanh(G.S.view) && !G.CONSENT){ e.preventDefault(); }
});

/* ─── Lớp 3: nhận diện hành vi quét kho ─── */
var moc = [];
G.dem = function(){
  if(!G.S || !G.S.acc || !G.isCanh(G.S.view)) return;
  var now = Date.now();
  moc.push(now);
  moc = moc.filter(function(t){ return now - t < 60000; });
  if(moc.length === 14){
    ghi('Nghi vấn quét kho', moc.length+' màn hình chuyên môn trong 60 giây — nhịp của máy quét, không phải của người đọc.', 'Cảnh báo');
    G.U.toast('Hệ thống ghi nhận nhịp mở kho bất thường. Quản trị đã được báo.','err');
  }
  if(moc.length > 26){
    ghi('Hạ nhịp truy cập', 'Vượt 26 màn hình chuyên môn trong 60 giây. Đã hạ nhịp và báo về quản trị.', 'Đã chặn');
    G.THROTTLE = now + 20000;
  }
};
G.throttled = function(){
  if(G.THROTTLE && Date.now() < G.THROTTLE){
    G.U.toast('Đang hạ nhịp truy cập kho chuyên môn. Thử lại sau ít giây.','err');
    return true;
  }
  return false;
};

/* ─── Đồng ý xuất dữ liệu ─── */
G.xinDongY = function(){
  /* Trước đây đây là công tắc ai bấm cũng bật được, kể cả phụ huynh —
     bật xong là mở luôn khoá chặn Ctrl+P và sao chép khối lớn. */
  if(!G.CONSENT && !G.can('xuat_pdf')){
    ghi('Xin đồng ý xuất dữ liệu', 'Vai ' + (G.S.role||'?') + ' không có quyền xuat_pdf — từ chối mở.', 'Đã chặn');
    G.U.toast('Tài khoản này không có quyền xuất dữ liệu. Liên hệ Admin nếu cần được cấp.','err');
    return;
  }
  G.CONSENT = !G.CONSENT;
  ghi('Đồng ý xuất dữ liệu', G.CONSENT ? 'Bật quyền xuất trong phiên này — mọi thao tác xuất đều được ghi lại.'
                                       : 'Tắt quyền xuất dữ liệu.', G.CONSENT?'Đã mở':'Đã đóng');
  G.U.toast(G.CONSENT ? 'Đã mở quyền xuất dữ liệu cho phiên này. Mọi thao tác đều để lại dấu vết.'
                      : 'Đã đóng quyền xuất dữ liệu.', G.CONSENT?'ok':'err');
  if(G.S.view==='an-toan-du-lieu') G.go('an-toan-du-lieu');
};

/* Mốc khởi tạo */
ghi('Mở phiên', 'Phiên làm việc bắt đầu · lá chắn đóng dấu chìm và chặn sao chép khối lớn đang bật.', 'Ghi nhận');
})();
