/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v8.2 — NỐI MÁY CHỦ
   Câu hỏi anh Quang đặt ra: "máy chủ được nhắc tới trong web app là gì,
   và làm cách nào để tôi kết nối được?" Màn này trả lời bằng thao tác,
   không bằng tài liệu.

   Máy chủ của GITA 365 là một dự án Google Apps Script chạy trên tài
   khoản Google của Học viện. Nó không phải máy chủ thuê, không có phí
   hàng tháng, và dữ liệu nằm trong Drive của chính Học viện. Việc của
   nó gồm bốn phần: cấp khoá mở kho theo vai, giữ sổ tài khoản và mật
   khẩu, nhận tài liệu gửi lên, và đồng bộ cài đặt giữa web với bản cài
   trên máy tính.

   Trước khi nối, ứng dụng chạy ở CHẾ ĐỘ MẪU: xem được toàn bộ giao diện
   và phần giới thiệu, kho chuyên môn vẫn khoá. Nối xong là mở theo đúng
   vai và tầng của từng tài khoản.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var U = G.U, h = U.h, ic = U.ic;
G.VIEWS = G.VIEWS || {};

var KHO = 'gita365_may_chu';

G.diaChiMayChu = function(){
  try{ return localStorage.getItem(KHO) || ''; }catch(e){ return ''; }
};

G.datMayChu = function(url){
  url = String(url || '').trim();
  if(!url){
    try{ localStorage.removeItem(KHO); }catch(e){}
    G.API_CAP_PHEP = '';
    return {ok:true, xoa:true};
  }
  if(!/^https:\/\/script\.google\.com\/.*\/exec$/.test(url))
    return {ok:false, ly:'Địa chỉ phải là đường dẫn triển khai của Apps Script, '+
      'bắt đầu bằng https://script.google.com/ và kết thúc bằng /exec.'};
  try{ localStorage.setItem(KHO, url); }catch(e){ return {ok:false, ly:'Trình duyệt không cho ghi.'}; }
  G.API_CAP_PHEP = url;
  return {ok:true};
};

/* Gọi thử: doGet của máy chủ trả về tên và số khoá đã nạp, không trả khoá nào. */
G.thuMayChu = function(){
  var url = G.API_CAP_PHEP;
  if(!url) return Promise.resolve({ok:false, ly:'Chưa có địa chỉ máy chủ.'});
  return fetch(url, {method:'GET'})
    .then(function(r){ return r.json(); })
    .then(function(d){
      if(!d || !d.ok) return {ok:false, ly:'Máy chủ trả về nội dung không đọc được.'};
      return {ok:true, ten:d.ten || '', soKhoa:Number(d.daNapKhoa) || 0, luc:d.luc || ''};
    })
    .catch(function(e){
      return {ok:false, ly:'Không gọi được máy chủ: ' + (e && e.message || e) +
        '. Kiểm lại phần "Ai có quyền truy cập" đã đặt là Anyone chưa.'};
    });
};

/* Xác nhận quyền vào Drive. Máy chủ thử thật: mở từng thư mục, tạo một tệp
   dấu, xoá đi. Bấm Allow trên màn xin quyền của Google chỉ là bước đầu —
   nó không nói được máy chủ có ghi đúng thư mục của Học viện hay không. */
/* ═══════════════ MỘT CỬA GỌI MÁY CHỦ ═══════════════

   Tới bản 9.99 mỗi màn tự viết fetch của mình: app.js, bang-tin.js,
   dong-bo.js, mat-khau.js — bốn chỗ, bốn cách bắt lỗi, bốn câu báo
   khác nhau cho cùng một sự cố.

   Bốn bản của một việc thì sẽ có ngày lệch: một chỗ gắn token, chỗ kia
   quên; một chỗ đọc d.error, chỗ kia đọc d.ly. Người dùng gặp cùng một
   lỗi mạng ở hai màn và nhận hai câu khác nhau.

   Cửa này gom lại một chỗ. Nó KHÔNG ném ra bao giờ — trả về
   {ok:false, error} — vì màn hình gọi nó trong lúc vẽ, và một lượt ném
   ở đó là trắng cả màn.

   Bốn chỗ cũ chưa chuyển sang: chúng đang chạy đúng, và đổi cả bốn
   trong một lượt là bốn chỗ có thể hỏng cùng lúc mà không phép đo nào
   phủ hết. Chuyển dần khi có việc chạm vào từng chỗ. */
G.goiMayChu = function(fn, than){
  if(!G.API_CAP_PHEP)
    return Promise.resolve({ok:false, error:'Chưa nối máy chủ. Vào Quản trị trang → Nối máy chủ.'});
  var body = Object.assign({}, than || {}, {
    fn: fn,
    u: (G.S && G.S.acc && G.S.acc.u) || '',
    token: G.PHIEN_TOKEN || ''
  });
  return fetch(G.API_CAP_PHEP, {
    method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'},
    body: JSON.stringify(body)
  }).then(function(r){ return r.json(); })
    .then(function(d){
      if(!d) return {ok:false, error:'Máy chủ trả về nội dung không đọc được.'};
      /* Phiên hết hạn nói RÕ là hết hạn, không lẫn vào "không có quyền":
         hai câu ấy dẫn tới hai việc khác nhau — đăng nhập lại, hay đi
         xin quyền. */
      if(!d.ok && d.code === 'AUTH')
        return {ok:false, code:'AUTH', error:'Phiên đã hết hạn. Đăng nhập lại rồi thử lại.'};
      return d;
    })
    .catch(function(e){
      return {ok:false, error:'Không gọi được máy chủ: ' + doanViSao(e)};
    });
};

/* ══ MỘT LƯỢT BỊ CSP CHẶN TRÔNG Y HỆT MỘT LƯỢT MẤT MẠNG ══

   Trình duyệt cố ý không nói ra lượt nào bị Content-Security-Policy
   chặn: cả hai đều ném đúng một câu "Failed to fetch". Đó là quyết định
   đúng của trình duyệt — nói ra là để trang dò được chính sách của nó —
   nhưng với người đang triển khai thì nó là một chỗ hỏng IM LẶNG, và
   kho này có một luật riêng về chỗ hỏng im lặng.

   Chỗ này hỏng thật được: `cau-hinh.js` và `connect-src` của
   `index.html` là HAI chỗ phải khớp nhau, và `soat-san-sang.js` đã canh
   phía tĩnh. Nhưng người dán địa chỉ lúc nửa đêm thì không chạy bộ
   soát — họ bấm "Thử nối", thấy "Failed to fetch", rồi đi tìm ở phía
   máy chủ suốt một tiếng trong khi máy chủ vẫn đang chạy đúng.

   Nên KHÔNG kết luận, chỉ NÊU: máy không phân biệt được hai nguyên nhân
   ấy, và nói chắc một cái là dẫn người ta đi sai đường đúng lúc đang
   vội — cùng luật với `khoi-phuc-kho.js` khi AES-GCM báo sai. Nó chỉ
   nói thêm cái mà người kia chưa biết: địa chỉ này KHÁC gốc với trang,
   nên có một chỗ thứ hai phải khai. */
function doanViSao(e){
  var loi = (e && e.message) || String(e);
  var laMang = /failed to fetch|networkerror|load failed/i.test(loi);
  if(!laMang) return loi;

  var gocTrang = '', gocMayChu = '';
  try { gocTrang = location.origin; } catch(_e){}
  try { gocMayChu = new URL(G.API_CAP_PHEP, location.href).origin; } catch(_e){}

  if(gocMayChu && gocTrang && gocMayChu !== gocTrang){
    return loi + '. Địa chỉ máy chủ (' + gocMayChu + ') KHÁC gốc với trang (' +
      gocTrang + '), nên có hai nguyên nhân và trình duyệt không phân biệt được: ' +
      'mất mạng, hoặc CSP chưa khai origin ấy. Kiểm chỗ thứ hai: connect-src ' +
      'trong index.html phải có đúng "' + gocMayChu + '". Chạy ' +
      'node tools/soat-san-sang.js để máy đối chiếu hai chỗ ấy.';
  }
  return loi + '. Máy chủ cùng gốc với trang nên CSP không phải nguyên nhân — ' +
    'nhiều khả năng là mất mạng hoặc máy chủ chưa chạy.';
}

G.kiemQuyenDrive = function(){
  if(!G.API_CAP_PHEP) return Promise.resolve({ok:false, ly:'Chưa nối máy chủ.'});
  return fetch(G.API_CAP_PHEP, {
    method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'},
    body: JSON.stringify({fn:'kiemDrive', u:(G.S.acc && G.S.acc.u) || '',
      token: G.PHIEN_TOKEN || ''})
  }).then(function(r){ return r.json(); })
    .then(function(d){
      if(!d || !d.ok) return {ok:false, ly:(d && d.error) || 'Máy chủ không trả lời.'};
      return d;
    })
    .catch(function(e){ return {ok:false, ly:'Không gọi được máy chủ: ' + (e && e.message || e)}; });
};

G.VIEWS['noi-may-chu'] = function(){
  var url = G.API_CAP_PHEP || '';
  var noi = !!url;

  var o = U.ph({eyebrow:'QUẢN TRỊ TRANG', ic:'orbit', grad:1,
    t:'Nối máy chủ',
    lead:'Máy chủ của GITA 365 là một dự án Google Apps Script chạy trên tài khoản Google '+
         'của Học viện. Không thuê máy, không phí hàng tháng, dữ liệu nằm trong Drive của mình.'});

  o += '<div class="card mt2" style="border-color:'+(noi?'var(--ok)':'var(--gita-do)')+'">'+
    '<div class="row" style="gap:10px;align-items:center">'+
      ic(noi?'check':'lock','w-5 h-5')+
      '<b>'+(noi ? 'Đang nối máy chủ' : 'Đang chạy ở chế độ mẫu — chưa nối máy chủ')+'</b></div>'+
    '<p class="sm dim mt" style="line-height:1.7">'+
      (noi ? 'Kho mở theo đúng vai và tầng của từng tài khoản. Đăng ký, đổi mật khẩu, '+
             'gửi tài liệu và đồng bộ đều đi qua máy chủ này.'
           : 'Xem được toàn bộ giao diện và phần giới thiệu. Kho chuyên môn vẫn khoá, '+
             'đăng ký và đổi mật khẩu chưa chạy thật.')+'</p>'+
    '<div class="row mt2" style="gap:9px;flex-wrap:wrap">'+
      '<input id="mcUrl" value="'+h(url)+'" placeholder="https://script.google.com/macros/s/…/exec" '+
        'style="flex:1;min-width:280px;background:var(--surface);border:1px solid var(--line);'+
        'border-radius:99px;padding:11px 18px;font-size:12.5px;outline:none;color:var(--ink)" '+
        'class="mono" autocomplete="off">'+
      '<button class="btn pri" data-act="mc-luu">'+ic('check','w-4 h-4')+'Lưu địa chỉ</button>'+
      '<button class="btn ghost" data-act="mc-thu">'+ic('pulse','w-4 h-4')+'Gọi thử</button>'+
      (noi ? '<button class="btn ghost" data-act="mc-drive">'+ic('vault','w-4 h-4')+'Kiểm quyền Drive</button>' : '')+
      (noi ? '<button class="btn ghost" data-act="mc-bo">'+ic('x','w-4 h-4')+'Bỏ nối</button>' : '')+
    '</div>'+
    '<div id="mcDrive" class="mt"></div>'+
    '<div id="mcKq" class="mt"></div>'+
    (G.KHO && G.KHO.lyDoTuChoi ?
      '<div class="card pad-sm mt" style="border-color:var(--gita-do)">'+
        '<b class="sm" style="color:var(--gita-do-ink)">'+ic('lock','w-3 h-3')+
        ' Máy chủ đang từ chối cấp khoá</b>'+
        '<p class="sm mt">'+h(G.KHO.lyDoTuChoi)+'</p>'+
        (G.KHO.maTuChoi === 'MUSTCHANGE' ?
          '<button class="btn pri sm mt" data-act="doi-mk-mo">'+ic('lock','w-3 h-3')+
          'Đổi mật khẩu ngay</button>' : '')+
      '</div>' : '')+
    '<p class="tiny muted mt">Địa chỉ này ghi vào máy đang dùng. Máy khác phải dán lại — '+
      'cố tình như vậy, để địa chỉ máy chủ không đi kèm bản phát hành.</p>'+
  '</div>';

  o += U.sec('SÁU BƯỚC DỰNG MÁY CHỦ','Làm một lần, khoảng hai mươi phút');
  o += '<div class="card">'+U.list([
    'Vào script.google.com bằng tài khoản Google của Học viện, tạo dự án mới, đặt tên GITA 365.',
    'Tạo sáu tệp mã và dán nội dung từ thư mục server/ trong kho mã: GITA_Nen.gs, GITA_CapPhep.gs, '+
      'GITA_DangKy.gs, GITA_MatKhau.gs, GITA_TaiLieu.gs, GITA_DongBo.gs, GITA_XuatSheet.gs.',
    'Mở GITA_Nen.gs, sửa hai dòng đầu: mã thư mục Drive của Học viện và địa chỉ email nhận thư hệ thống.',
    'Mở GITA_CapPhep.gs, dán nội dung tệp kho/khoa.json vào hàm napBoKhoaMotLan rồi chạy hàm đó một lần. '+
      'Chạy xong thì xoá nội dung khoá khỏi hàm và lưu lại.',
    'Bấm Deploy → New deployment → Web app. Execute as: Me. Who has access: Anyone. Bấm Deploy và chép '+
      'địa chỉ kết thúc bằng /exec.',
    'Dán địa chỉ đó vào ô bên trên, bấm Lưu, rồi bấm Gọi thử. Thấy số khoá đã nạp là xong.'
  ])+'</div>';

  o += U.sec('MÁY CHỦ NÀY LÀM BỐN VIỆC','Không hơn — mọi thứ khác chạy trong máy người dùng');
  o += '<div class="row wrap" style="gap:12px">'+
    [['Cấp khoá mở kho','Sau khi đăng nhập, trả đúng những gói mà vai và tầng của tài khoản được cấp phép. '+
      'Khoá có hạn 12 giờ và mỗi tài khoản chỉ xin được 12 lần mỗi giờ.'],
     ['Giữ sổ tài khoản','Đăng ký, gửi mã OTP qua email, kích hoạt, đổi và lấy lại mật khẩu.'],
     ['Nhận tài liệu gửi lên','Tài liệu và ảnh từ mọi vị trí, cùng minh chứng nhiệm vụ của gia đình, '+
      'lưu vào Drive của Học viện. Không nhận tệp chạy được.'],
     ['Đồng bộ cài đặt','Bố cục thư mục, chữ hiển thị, bảng phân quyền và phần tư liệu đã gửi thêm cho '+
      'từng nhà — để bản web và bản cài trên máy tính nhìn giống nhau.']]
    .map(function(x){
      return '<div class="card" style="flex:1;min-width:250px;border-color:var(--gita-vien-1)">'+
        '<b class="sm" style="color:var(--gita-ink)">'+h(x[0])+'</b>'+
        '<p class="sm dim mt" style="line-height:1.65">'+h(x[1])+'</p></div>';
    }).join('')+'</div>';

  o += U.sec('QUYỀN VÀO DRIVE CỦA HỌC VIỆN','Máy chủ đụng vào bốn thư mục — không thư mục nào ngoài bốn cái này');
  o += U.tbl(['Thư mục','Máy chủ làm gì ở đó'], [
    ['<b class="sm">Dữ Liệu GITA365</b><div class="tiny muted mono">1pvXH45JvXXPOW9V6ObB5CR87r7gxH0fU</div>',
     '<span class="sm">Giữ sổ dữ liệu: tài khoản, hồ sơ học viên, phiên đăng nhập, nhật ký, thanh toán.</span>'],
    ['<b class="sm">Nhận tài liệu</b><div class="tiny muted">cùng thư mục trên</div>',
     '<span class="sm">Tài liệu và ảnh đội ngũ gửi lên, minh chứng nhiệm vụ của gia đình.</span>'],
    ['<b class="sm">Xuất bảng tính</b><div class="tiny muted">cùng thư mục trên</div>',
     '<span class="sm">Google Sheet do cấp quản lý xuất ra. Không xuất Excel, không xuất CSV.</span>'],
    ['<b class="sm">Mã máy chủ GITA365</b><div class="tiny muted mono">1jVOnIH7286glI95fC4aqfXApecxEj7Xz</div>',
     '<span class="sm">Mã nguồn và hướng dẫn dựng máy chủ.</span>']
  ]);
  o += '<p class="tiny muted mt" style="line-height:1.6">Bấm <b>Kiểm quyền Drive</b> ở trên để máy chủ '+
    'thử thật: mở từng thư mục, tạo một tệp dấu, đọc lại, rồi xoá đi. Bấm Allow trên màn xin quyền của '+
    'Google mới là bước đầu — nó không nói được máy chủ có ghi đúng thư mục của Học viện hay không.</p>';

  o += '<div class="card mt2"><div class="up mb" style="color:var(--gita-do-ink)">'+
    ic('shield','w-4 h-4')+' BỘ KHOÁ</div>'+
    '<p class="sm" style="line-height:1.7">Tệp <span class="mono">kho/khoa.json</span> là chìa của toàn '+
    'bộ kho. Nó nằm trong .gitignore và không bao giờ được đưa lên kho mã hay gửi qua tin nhắn. '+
    'Chỗ duy nhất nó được dán vào là Script Properties của máy chủ, một lần, rồi xoá khỏi mã.</p></div>';

  return o;
};

document.addEventListener('click', function(e){
  var b = e.target.closest && e.target.closest('[data-act]');
  if(!b) return;
  var a = b.getAttribute('data-act');
  var kq = document.getElementById('mcKq');

  if(a === 'mc-luu'){
    var i = document.getElementById('mcUrl');
    var r = G.datMayChu(i ? i.value : '');
    U.toast(r.ok ? 'Đã lưu địa chỉ máy chủ trên máy này.' : r.ly, r.ok ? 'ok' : 'err');
    if(r.ok) G.render && G.render();
  }
  else if(a === 'mc-bo'){
    G.datMayChu('');
    U.toast('Đã bỏ nối. Ứng dụng quay về chế độ mẫu.','ok');
    G.render && G.render();
  }
  else if(a === 'mc-drive'){
    var kd = document.getElementById('mcDrive');
    if(kd) kd.innerHTML = '<p class="sm dim">Đang thử quyền trên từng thư mục…</p>';
    G.kiemQuyenDrive().then(function(d){
      if(!kd) return;
      if(!d.ok){
        kd.innerHTML = '<div class="card pad-sm" style="border-color:var(--gita-do)">'+
          '<b class="sm" style="color:var(--gita-do-ink)">'+ic('x','w-4 h-4')+' Chưa kiểm được</b>'+
          '<p class="sm mt">'+h(d.ly)+'</p></div>';
        return;
      }
      var du = d.dat === d.tong;
      kd.innerHTML = '<div class="card pad-sm" style="border-color:'+(du?'var(--ok)':'var(--gita-do)')+'">'+
        '<b class="sm" style="color:'+(du?'var(--ok)':'var(--gita-do-ink)')+'">'+
          ic(du?'check':'lock','w-4 h-4')+' Đạt '+d.dat+'/'+d.tong+' thư mục</b>'+
        '<p class="tiny muted mt">Máy chủ đang chạy dưới tài khoản '+h(d.taiKhoan || '—')+'</p>'+
        U.tbl(['Thư mục','Mở','Ghi','Dọn',''], d.thuMuc.map(function(t){
          return ['<b class="sm">'+h(t.nhan)+'</b>'+
                    '<div class="tiny muted">'+h(t.ten || '(không mở được)')+'</div>',
            t.moDuoc ? '<span style="color:var(--ok)">✓</span>' : '<span style="color:var(--gita-do)">✕</span>',
            t.ghiDuoc ? '<span style="color:var(--ok)">✓</span>' : '<span style="color:var(--gita-do)">✕</span>',
            t.xoaDuoc ? '<span style="color:var(--ok)">✓</span>' : '<span class="muted">—</span>',
            t.loi ? '<span class="tiny" style="color:var(--gita-do-ink)">'+h(t.loi)+'</span>' : ''];
        }))+
        (du ? '<p class="tiny muted mt">Tệp dấu đã dọn sạch, không để lại rác trong Drive.</p>'
            : '<p class="tiny mt" style="color:var(--gita-do-ink)">Mã thư mục là phần sau /folders/ trong địa chỉ Drive. '+
              'Thư mục phải thuộc chính tài khoản chạy Apps Script, hoặc được chia sẻ ở mức Người chỉnh sửa.</p>')+
      '</div>';
    });
  }
  else if(a === 'mc-thu'){
    if(kq) kq.innerHTML = '<p class="sm dim">Đang gọi máy chủ…</p>';
    G.thuMayChu().then(function(r){
      if(!kq) return;
      kq.innerHTML = r.ok
        ? '<div class="card pad-sm" style="border-color:var(--ok)">'+
            '<b class="sm" style="color:var(--ok)">'+ic('check','w-4 h-4')+' Máy chủ trả lời</b>'+
            '<p class="sm mt">'+h(r.ten)+' · đã nạp <b>'+r.soKhoa+'</b> khoá'+
            (r.soKhoa ? '' : ' — chưa chạy hàm napBoKhoaMotLan, kho sẽ vẫn khoá')+'</p></div>'
        : '<div class="card pad-sm" style="border-color:var(--gita-do)">'+
            '<b class="sm" style="color:var(--gita-do-ink)">'+ic('x','w-4 h-4')+' Chưa gọi được</b>'+
            '<p class="sm mt">'+h(r.ly)+'</p></div>';
    });
  }
});

})();
