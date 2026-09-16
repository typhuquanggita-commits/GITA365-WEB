/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v7.5 — ĐỔI MẬT KHẨU & LẤY LẠI MẬT KHẨU QUA EMAIL
   Việc kiểm và băm nằm ở máy chủ (02_Security.gs). Phía này chỉ
   dựng ô nhập, kiểm sơ bộ cho đỡ mất một vòng gọi, và hiển thị
   kết quả. Không bao giờ giữ mật khẩu trong bộ nhớ quá một lệnh.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

/* Kiểm sơ bộ — máy chủ vẫn kiểm lại bằng checkPwStrength_ của v6.9 */
G.kiemMatKhau = function(mk){
  mk = String(mk || '');
  if(mk.length < 10) return 'Mật khẩu cần ít nhất mười ký tự.';
  if(!/[a-z]/.test(mk)) return 'Cần ít nhất một chữ thường.';
  if(!/[A-Z]/.test(mk)) return 'Cần ít nhất một chữ hoa.';
  if(!/[0-9]/.test(mk)) return 'Cần ít nhất một chữ số.';
  if(!/[^A-Za-z0-9]/.test(mk)) return 'Cần ít nhất một ký tự đặc biệt.';
  if(/^(?:gita|123|abc|password|matkhau)/i.test(mk)) return 'Mật khẩu bắt đầu bằng chuỗi quá dễ đoán.';
  return true;
};

function goi(than){
  if(!G.API_CAP_PHEP) return Promise.reject(new Error('Chưa nối máy chủ. Bản mẫu không đổi được mật khẩu.'));
  return fetch(G.API_CAP_PHEP, {
    method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'},
    body: JSON.stringify(than)
  }).then(function(r){ return r.json(); })
    .then(function(d){ if(!d || !d.ok) throw new Error(d && d.error || 'Máy chủ từ chối'); return d; });
}

/* ─── Đổi mật khẩu khi đã đăng nhập ─── */
G.moDoiMatKhau = function(){
  var U = G.U, h = U.h;
  U.modal(
    '<h2 style="font-size:21px;font-weight:800;margin-bottom:6px">Đổi mật khẩu</h2>'+
    '<p class="sm muted" style="margin-bottom:14px">Đổi xong hệ thống đóng phiên hiện tại — đăng nhập lại bằng mật khẩu mới.</p>'+
    '<label class="tiny up muted">MẬT KHẨU HIỆN TẠI</label>'+
    '<input id="mkCu" type="password" autocomplete="current-password" class="inp blk mb">'+
    '<label class="tiny up muted">MẬT KHẨU MỚI</label>'+
    '<input id="mkMoi" type="password" autocomplete="new-password" class="inp blk">'+
    '<p id="mkGoi" class="tiny muted" style="margin:6px 0 12px">Ít nhất mười ký tự, có chữ hoa, chữ thường, chữ số và ký tự đặc biệt.</p>'+
    '<label class="tiny up muted">NHẬP LẠI MẬT KHẨU MỚI</label>'+
    '<input id="mkLai" type="password" autocomplete="new-password" class="inp blk mb">'+
    '<div id="mkLoi" class="tiny mb" style="color:#BE0E16"></div>'+
    '<button class="btn pri blk" data-act="doi-mk">Đổi mật khẩu</button>'
  );
  var o = document.getElementById('mkMoi');
  if(o) o.addEventListener('input', function(){
    var r = G.kiemMatKhau(o.value), g = document.getElementById('mkGoi');
    if(!g) return;
    if(r === true){ g.textContent = 'Mật khẩu đạt chuẩn.'; g.style.color = '#0B7350'; }
    else { g.textContent = r; g.style.color = 'var(--ink-3)'; }
  });
};

G.doiMatKhau = function(){
  var loi = document.getElementById('mkLoi');
  var cu = (document.getElementById('mkCu')||{}).value || '';
  var moi = (document.getElementById('mkMoi')||{}).value || '';
  var lai = (document.getElementById('mkLai')||{}).value || '';
  function bao(t){ if(loi) loi.textContent = t; }
  if(!cu || !moi){ bao('Nhập đủ mật khẩu hiện tại và mật khẩu mới.'); return; }
  if(moi !== lai){ bao('Hai lần nhập mật khẩu mới không khớp.'); return; }
  var r = G.kiemMatKhau(moi);
  if(r !== true){ bao(r); return; }
  if(moi === cu){ bao('Mật khẩu mới phải khác mật khẩu cũ.'); return; }
  bao('Đang đổi…');
  goi({ fn:'doiMatKhau', u:G.S.acc && G.S.acc.u, token:G.PHIEN_TOKEN||'', cu:cu, moi:moi })
    .then(function(d){
      G.U.closeModal();
      G.U.toast(d.thongBao || 'Đã đổi mật khẩu. Đăng nhập lại.','ok');
      setTimeout(function(){ if(G.dangXuat) G.dangXuat(); }, 1500);
    })
    .catch(function(e){ bao(e.message); });
};

/* ─── Quên mật khẩu — xin mã sáu số qua email ─── */
G.moQuenMatKhau = function(){
  var U = G.U;
  U.modal(
    '<h2 style="font-size:21px;font-weight:800;margin-bottom:6px">Lấy lại mật khẩu</h2>'+
    '<p class="sm muted" style="margin-bottom:14px">Nhập email hoặc tên đăng nhập. Hệ thống gửi mã sáu số '+
      'tới email đã đăng ký. Mã sống mười lăm phút và chỉ dùng được một lần.</p>'+
    '<label class="tiny up muted">EMAIL HOẶC TÊN ĐĂNG NHẬP</label>'+
    /* type="text" chứ không phải "email": tài khoản Admin@gita365 không có dấu
       chấm sau @, trình duyệt sẽ chặn ngay trước khi gửi đi. */
    '<input id="qmU" type="text" autocomplete="username" class="inp blk mb" placeholder="ten@gita365.vn">'+
    '<div id="qmB1"><button class="btn pri blk" data-act="xin-ma">Gửi mã về email</button></div>'+
    '<div id="qmB2" style="display:none">'+
      '<label class="tiny up muted">MÃ SÁU SỐ TRONG EMAIL</label>'+
      '<input id="qmMa" inputmode="numeric" maxlength="6" class="inp blk mb" placeholder="000000">'+
      '<label class="tiny up muted">MẬT KHẨU MỚI</label>'+
      '<input id="qmMoi" type="password" autocomplete="new-password" class="inp blk mb">'+
      '<label class="tiny up muted">NHẬP LẠI MẬT KHẨU MỚI</label>'+
      '<input id="qmLai" type="password" autocomplete="new-password" class="inp blk mb">'+
      '<button class="btn pri blk" data-act="dat-lai-mk">Đặt lại mật khẩu</button>'+
    '</div>'+
    '<div id="qmLoi" class="tiny mt" style="color:#BE0E16"></div>'
  );
};

G.xinMa = function(){
  var loi = document.getElementById('qmLoi');
  var u = ((document.getElementById('qmU')||{}).value || '').trim();
  function bao(t, c){ if(loi){ loi.textContent = t; loi.style.color = c || '#BE0E16'; } }
  /* Nhận cả địa chỉ email lẫn tên đăng nhập — máy chủ tra được cả hai.
     Ép đúng dạng email ở đây thì tài khoản Admin@gita365 không xin mã được,
     vì sau dấu @ không có dấu chấm. */
  if(u.length < 4){ bao('Nhập email hoặc tên đăng nhập của anh chị.'); return; }
  bao('Đang gửi…','var(--ink-3)');
  goi({ fn:'quenMatKhau', u:u })
    .then(function(d){
      bao(d.thongBao || 'Đã gửi mã nếu tài khoản có thật.','#0B7350');
      var b1 = document.getElementById('qmB1'), b2 = document.getElementById('qmB2');
      if(b1) b1.style.display = 'none';
      if(b2) b2.style.display = 'block';
    })
    .catch(function(e){ bao(e.message); });
};

G.datLaiMatKhau = function(){
  var loi = document.getElementById('qmLoi');
  var u = ((document.getElementById('qmU')||{}).value || '').trim();
  var ma = ((document.getElementById('qmMa')||{}).value || '').trim();
  var moi = (document.getElementById('qmMoi')||{}).value || '';
  var lai = (document.getElementById('qmLai')||{}).value || '';
  function bao(t, c){ if(loi){ loi.textContent = t; loi.style.color = c || '#BE0E16'; } }
  if(!/^\d{6}$/.test(ma)){ bao('Mã gồm đúng sáu chữ số.'); return; }
  if(moi !== lai){ bao('Hai lần nhập mật khẩu mới không khớp.'); return; }
  var r = G.kiemMatKhau(moi);
  if(r !== true){ bao(r); return; }
  bao('Đang đặt lại…','var(--ink-3)');
  goi({ fn:'datLaiMatKhau', u:u, ma:ma, moi:moi })
    .then(function(d){
      G.U.closeModal();
      G.U.toast(d.thongBao || 'Đã đặt lại mật khẩu. Đăng nhập bằng mật khẩu mới.','ok');
    })
    .catch(function(e){ bao(e.message); });
};
