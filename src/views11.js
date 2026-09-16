/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v7.6 — BẢNG PHÂN QUYỀN · PHẠM VI CỦA TÔI
   Hai màn hình sinh ra từ hai câu hỏi thật:
     · Super Admin và Admin lấy gì để phân quyền cho từng vị trí?
     · Khách hàng lấy gì để biết mình đang mở tới đâu, còn gì chưa mở?
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
(function(){
var U = G.U, h = U.h, ic = U.ic;

/* ═══════════════ 1 · BẢNG PHÂN QUYỀN ═══════════════ */

/* Ba trạng thái một ô có thể ở:
     'bac'  — theo bậc của vai, không ai đụng vào
     'cho'  — cấp thêm ngoài bậc
     'cam'  — thu lại dù bậc có cho                                        */
G.oQuyen = function(vaiId, perm){
  var ov = G.PHANQUYEN[vaiId];
  if(ov && ov.cam.indexOf(perm) >= 0) return 'cam';
  if(ov && ov.cho.indexOf(perm) >= 0) return 'cho';
  return 'bac';
};

/* Người đang đăng nhập có được sửa ô này không.
   Bốn luật, kiểm theo đúng thứ tự — luật nào chặn thì dừng ở đó. */
G.suaDuocO = function(vaiId, perm){
  var toi = G.S.roleObj;
  if(!toi || !G.can('sys_manage_user')) return 'Vai này không có quyền quản trị người dùng.';
  var dich = G.roleById(vaiId);
  if(!dich) return 'Không có vai này.';
  if(dich.lv < toi.lv) return 'Không sửa được quyền của vai cao hơn mình (' + dich.n + ').';
  if(dich.id === toi.id && perm === 'sys_manage_user')
    return 'Không tự thu quyền quản trị của chính mình — thu xong sẽ không ai mở lại được.';
  if(!G.can(perm)) return 'Không cấp được quyền mà chính mình không có (' + (G.PERM_TEN[perm]||perm) + ').';
  return true;
};

G.doiO = function(vaiId, perm){
  var duoc = G.suaDuocO(vaiId, perm);
  if(duoc !== true){ U.toast(duoc, 'err'); return; }
  if(!G.PHANQUYEN[vaiId]) G.PHANQUYEN[vaiId] = {cho:[], cam:[]};
  var ov = G.PHANQUYEN[vaiId];
  function bo(a, x){ var i = a.indexOf(x); if(i>=0) a.splice(i,1); }
  var truoc = G.vaiCo(vaiId, perm), tt = G.oQuyen(vaiId, perm);

  /* Vòng: theo bậc → cho → cấm → theo bậc */
  if(tt === 'bac'){ bo(ov.cam, perm); ov.cho.push(perm); }
  else if(tt === 'cho'){ bo(ov.cho, perm); ov.cam.push(perm); }
  else { bo(ov.cam, perm); bo(ov.cho, perm); }

  G.luuPhanQuyen();
  var sau = G.vaiCo(vaiId, perm);
  if(G.secLog) G.secLog('Đổi phân quyền',
    vaiId + ' · ' + perm + ' · ' + (truoc?'có':'không') + ' → ' + (sau?'có':'không') +
    ' · người sửa ' + (G.S.acc && G.S.acc.u), 'Ghi nhận');
  G.render();
};

G.datLaiPhanQuyen = function(){
  if(!G.can('sys_manage_user')){ U.toast('Vai này không có quyền.','err'); return; }
  G.PHANQUYEN = {};
  Object.keys(G.PHANQUYEN_GOC||{}).forEach(function(k){
    G.PHANQUYEN[k] = {cho:G.PHANQUYEN_GOC[k].cho.slice(), cam:G.PHANQUYEN_GOC[k].cam.slice()};
  });
  G.luuPhanQuyen();
  if(G.secLog) G.secLog('Đặt lại phân quyền','Về mặc định gốc · ' + (G.S.acc && G.S.acc.u),'Ghi nhận');
  U.toast('Đã trả bảng phân quyền về mặc định gốc.','ok');
  G.render();
};

G.VIEWS['phan-quyen'] = function(){
  if(!G.can('sys_manage_user'))
    return U.lockCard('Bảng phân quyền chỉ mở cho Super Admin và Admin hệ thống. '+
      'Đây là chỗ quyết định mọi vai khác nhìn thấy gì, nên không mở rộng hơn.');

  var toi = G.S.roleObj;
  var VAI = G.ROLES.slice().sort(function(a,b){ return a.lv - b.lv; });

  var o = U.ph({eyebrow:'QUẢN TRỊ · CHỈ R01 – R02', ic:'lock', grad:1,
    t:'Bảng phân quyền theo vị trí',
    lead:'Mỗi ô là một câu trả lời: vị trí này có được làm việc này không. '+
      'Bấm vào ô để đổi. Bậc của vai là nền mặc định; anh chị cấp thêm hoặc thu lại ngay trên bảng.'});

  /* Ba luật đọc bảng */
  o += '<div class="pq-chugiai">'+
    '<span><i class="pq-ic bac">'+ic('check','w-3 h-3')+'</i> theo bậc — mặc định của vai</span>'+
    '<span><i class="pq-ic cho">'+ic('plus','w-3 h-3')+'</i> cấp thêm ngoài bậc</span>'+
    '<span><i class="pq-ic cam">'+ic('x','w-3 h-3')+'</i> đã thu lại</span>'+
    '<span><i class="pq-ic khong"></i> bậc không cho, chưa cấp thêm</span></div>';

  o += '<div class="card pad-sm mb" style="border-color:var(--gita-vien-1)">'+
    '<p class="sm" style="line-height:1.7;color:var(--ink-2)">'+
    '<b>Bốn điều bảng này không cho làm:</b> không sửa quyền của vai cao hơn mình; '+
    'không cấp quyền mà chính mình không có; không tự thu quyền quản trị của chính mình; '+
    'và mọi lần đổi đều vào nhật ký hệ thống kèm tên người sửa.</p></div>';

  /* Bảng lớn: hàng = quyền, cột = vai */
  G.PERM_NHOM.forEach(function(nh){
    o += U.sec(nh.t, nh.ds.length + ' quyền');
    var cols = ['Quyền'].concat(VAI.map(function(r){ return r.short; }));
    var rows = nh.ds.map(function(perm){
      var oCells = VAI.map(function(r){
        var tt = G.oQuyen(r.id, perm), co = G.vaiCo(r.id, perm);
        var cls = co ? (tt==='cho' ? 'cho' : 'bac') : (tt==='cam' ? 'cam' : 'khong');
        var suaDuoc = G.suaDuocO(r.id, perm) === true;
        var nhan = cls==='bac'?'có theo bậc':cls==='cho'?'được cấp thêm':cls==='cam'?'đã thu lại':'không có';
        return '<button class="pq-o '+cls+(suaDuoc?'':' cung')+'" '+
          (suaDuoc?'data-pq="'+h(r.id)+'|'+h(perm)+'"':'disabled')+
          ' title="'+h(r.n+' — '+(G.PERM_TEN[perm]||perm)+' — '+nhan+(suaDuoc?'':' (không sửa được)'))+'">'+
          (cls==='bac'?ic('check','w-3 h-3'):cls==='cho'?ic('plus','w-3 h-3'):cls==='cam'?ic('x','w-3 h-3'):'')+
          '</button>';
      });
      return ['<div class="pq-ten"><b>'+h(G.PERM_TEN[perm]||perm)+'</b>'+
        '<span class="mono tiny muted">'+h(perm)+' · bậc ≤ '+G.PERM[perm]+'</span></div>'].concat(oCells);
    });
    o += '<div class="pq-bang">' + U.tbl(cols, rows) + '</div>';
  });

  /* Tổng kết từng vai — để thấy ngay vai nào rộng vai nào hẹp */
  o += U.sec('TỔNG KẾT TỪNG VỊ TRÍ','Số quyền đang có và số màn hình mở được');
  var tongPerm = Object.keys(G.PERM).length;
  o += U.tbl(['Vị trí','Bậc','Quyền','Màn hình mở','Sửa bởi bảng'], VAI.map(function(r){
    var nQ = G.demQuyen(r.id);
    var nM = 0; G.NAV.forEach(function(g){ g.items.forEach(function(it){
      if(!it.perm || G.vaiCo(r.id, it.perm)) nM++; }); });
    var ov = G.PHANQUYEN[r.id] || {cho:[],cam:[]};
    var sua = (ov.cho.length? '+'+ov.cho.length+' cấp thêm ' : '') + (ov.cam.length? '−'+ov.cam.length+' thu lại' : '');
    return [U.chip(r.n, r.c),
      '<span class="mono sm">'+r.lv+'</span>',
      '<b>'+nQ+'</b><span class="muted sm"> / '+tongPerm+'</span>',
      '<b>'+nM+'</b><span class="muted sm"> / '+G.tongManHinh()+'</span>',
      sua ? '<span class="sm" style="color:var(--gold-ink)">'+h(sua)+'</span>' : '<span class="sm muted">theo bậc</span>'];
  }));

  o += '<div class="row mt2" style="gap:10px;flex-wrap:wrap">'+
    '<button class="btn ghost sm" data-act="pq-dat-lai">'+ic('orbit','w-4 h-4')+'Trả về mặc định gốc</button>'+
    '<button class="btn ghost sm" data-v="tang-quyen">Xem tầng quyền truy cập</button>'+
    '<button class="btn ghost sm" data-v="nhat-ky-ht">Nhật ký hệ thống</button></div>';

  o += '<p class="tiny muted mt">Bảng lưu trong máy này và đồng bộ lên máy chủ ở lần đồng bộ kế tiếp. '+
    'Người dùng đang đăng nhập sẽ thấy phạm vi mới ở lần đăng nhập sau.</p>';
  return o;
};

G.tongManHinh = function(){
  var n = 0; G.NAV.forEach(function(g){ n += g.items.length; }); return n;
};

/* ═══════════════ 2 · PHẠM VI CỦA TÔI ═══════════════
   Trả lời đúng ba câu khách hàng hay hỏi: tôi đang mở tới đâu, cái gì
   chưa mở, và mở nó bằng cách nào. Không né, không nói vòng. */

G.VIEWS['pham-vi'] = function(){
  var r = G.S.roleObj || {}, T = G.TIERS || [];
  var nha = G.myFamily ? G.myFamily() : null;
  var tangDang = nha && nha.tier ? Number(nha.tier) : 0;
  var khach = r.lv >= 13;

  var mo = [], khoa = [];
  G.NAV.forEach(function(g){
    g.items.forEach(function(it){
      var duoc = !it.perm || G.can(it.perm);
      (duoc ? mo : khoa).push({g:g, it:it});
    });
  });

  var o = U.ph({eyebrow:'PHẠM VI CỦA TÔI', ic:'compass', grad:1,
    t:'Mình đang mở tới đâu',
    lead: khach
      ? 'Trang này nói thẳng: tài khoản của anh chị mở được những gì hôm nay, phần nào chưa mở, và mở nó bằng cách nào.'
      : 'Phạm vi của vai ' + (r.n||'') + ': mở được gì, còn gì thuộc vai khác.'});

  /* Ba con số đầu tiên */
  o += '<div class="pv-lo">'+
    '<div class="pv-th"><b>'+mo.length+'</b><span>MÀN HÌNH ĐANG MỞ</span></div>'+
    '<div class="pv-th"><b>'+khoa.length+'</b><span>CHƯA MỞ</span></div>'+
    '<div class="pv-th"><b>'+G.demQuyen(r)+'</b><span>QUYỀN ĐANG CÓ</span></div>'+
    '<div class="pv-th"><b>'+((G.KHO&&G.KHO.daNap.length)||0)+'</b><span>GÓI NỘI DUNG ĐÃ MỞ</span></div>'+
    '</div>';

  /* Trạng thái kho — nói rõ đang ở chế độ nào */
  if(G.KHO && G.KHO.cheDoMau){
    o += '<div class="card mt2" style="border-color:rgba(245,158,11,.42);background:rgba(245,158,11,.07)">'+
      '<div class="row mb"><span style="color:var(--warn)">'+ic('shield','w-4 h-4')+'</span>'+
      '<b>Đang ở chế độ mẫu — chưa nối máy chủ cấp phép</b></div>'+
      '<p class="sm" style="line-height:1.75;color:var(--ink-2)">Ứng dụng đang chạy với gói nội dung công khai: '+
      'lộ trình năm tầng, chuỗi trải nghiệm, cách ghi nhận, nhận diện thương hiệu, một bài test rút gọn và '+
      'phần minh hoạ của kho nghề. Toàn bộ kịch bản chuyên môn, phác đồ, mô thức và hệ VIP vẫn khoá.</p>'+
      '<p class="sm muted mt">Nối máy chủ cấp phép rồi đăng nhập lại là mở đủ theo vai và tầng.</p></div>';
  } else if(G.KHO){
    o += '<div class="card mt2" style="border-color:rgba(16,185,129,.4)">'+
      '<div class="row mb"><span style="color:var(--ok)">'+ic('check','w-4 h-4')+'</span>'+
      '<b>Đã mở kho theo phạm vi được cấp</b></div>'+
      '<p class="sm dim">Gói đang mở: <b class="mono">'+h(G.KHO.daNap.join(' · ')||'—')+'</b>'+
      (G.KHO.hanKhoa ? ' · hạn tới '+h(G.KHO.hanKhoa) : '')+'</p></div>';
  }

  /* Với khách hàng: năm tầng, tầng nào mở tầng nào chưa */
  if(khach && T.length){
    o += U.sec('NĂM TẦNG — TẦNG NÀO ĐÃ MỞ','Tầng mở dần theo KPI đã đạt và khoản đã thanh toán');
    o += '<div class="pv-tang">'+ T.map(function(t){
      var trang = t.id <= tangDang ? 'mo' : (t.id === tangDang+1 ? 'ke' : 'chua');
      return '<div class="pv-t '+trang+'" style="--tc:'+t.c+'">'+
        '<div class="pv-t-h"><b>'+h(t.code)+'</b><span>'+h(t.name)+'</span></div>'+
        '<div class="pv-t-tt">'+ (trang==='mo' ? ic('check','w-3 h-3')+' đã mở'
            : trang==='ke' ? ic('arrow','w-3 h-3')+' tầng kế tiếp' : ic('lock','w-3 h-3')+' chưa mở') +'</div>'+
        '<p class="pv-t-m">'+h(t.days+' ngày · '+t.q)+'</p></div>';
    }).join('') + '</div>';

    var ke = T[tangDang] || null;
    o += '<div class="card mt2" style="border-color:var(--gita-vien-1)">'+
      '<div class="up mb" style="color:var(--gold-ink)">MỞ TẦNG TIẾP THEO BẰNG CÁCH NÀO</div>'+
      (ke ? '<p class="sm" style="line-height:1.75;color:var(--ink-2)">Tầng kế tiếp là <b>'+h(ke.code+' · '+ke.name)+'</b>. '+
              'Hai điều kiện, phải đủ cả hai:</p>'+
            U.list([
              'Hoàn thành KPI của tầng đang học — hệ thống đếm từ chính dữ liệu anh chị đã ghi, không ai khai hộ.',
              'Xác nhận thanh toán thành công — kế toán đối chiếu sao kê rồi mới ghi nhận.'
            ])+
            '<p class="sm muted mt">Đủ KPI mà chưa thanh toán thì giữ nguyên tầng và hiện rõ đang chờ. '+
            'Đã thanh toán mà chưa đủ KPI thì tiền được ghi nhận, dùng cho lần duyệt sau. '+
            'Mỗi lần chỉ lên đúng một tầng.</p>'
          : '<p class="sm dim">Nhà mình đã đi hết năm tầng.</p>')+
      '<div class="row mt" style="gap:9px;flex-wrap:wrap">'+
        '<button class="btn ghost sm" data-v="kpi-100">Xem KPI của mình</button>'+
        '<button class="btn ghost sm" data-v="lo-trinh">Xem lộ trình năm tầng</button></div></div>';
  }

  /* Cái gì chưa mở, và vì sao — nhóm theo lý do, không đổ một đống */
  if(khoa.length){
    o += U.sec('PHẦN CHƯA MỞ — VÀ LÝ DO', khoa.length + ' màn hình');
    var theoQuyen = {};
    khoa.forEach(function(x){ (theoQuyen[x.it.perm] = theoQuyen[x.it.perm] || []).push(x.it); });
    o += U.tbl(['Nhóm nội dung','Mở cho ai','Số màn','Gồm những gì'],
      Object.keys(theoQuyen).map(function(perm){
        var ds = theoQuyen[perm];
        var bac = G.PERM[perm];
        var aiMo = G.ROLES.filter(function(x){ return G.vaiCo(x.id, perm); })
          .sort(function(a,b){return a.lv-b.lv;});
        var ten = aiMo.length ? aiMo[aiMo.length-1].n + ' trở lên' : 'chưa vai nào';
        return ['<b>'+h(G.PERM_TEN[perm]||perm)+'</b>',
          '<span class="sm">'+h(ten)+'</span>',
          '<b>'+ds.length+'</b>',
          '<span class="sm muted">'+h(G.dsHet(ds,4).map(function(i){return G.iname(i);}).join(' · ') +
            (ds.length>4 ? ' …' : ''))+'</span>'];
      }));
    o += '<p class="tiny muted mt">Đây không phải lỗi. Mỗi vai chỉ mở phần thuộc việc của vai đó — '+
      'đó là cách GITA giữ hồ sơ của từng gia đình không rơi sang tay người không phụ trách.</p>';
  }

  /* Đang mở những gì */
  o += U.sec('ĐANG MỞ', mo.length + ' màn hình');
  o += '<div class="pv-mo">'+ G.NAV.map(function(g){
    var ds = g.items.filter(function(it){ return !it.perm || G.can(it.perm); });
    if(!ds.length) return '';
    return '<div class="pv-nh"><div class="pv-nh-h" style="color:'+g.c+'">'+ic(g.ic,'w-4 h-4')+
      '<b>'+h(G.gname(g))+'</b><span class="muted">'+ds.length+'</span></div>'+
      '<div class="pv-nh-b">'+ ds.map(function(it){
        return '<button class="pv-i" data-v="'+h(it.v)+'">'+h(G.iname(it))+'</button>';
      }).join('') +'</div></div>';
  }).join('') +'</div>';

  return o;
};
})();

/* ═══════════════════════════════════════════════════════════════
   THƯ MỤC QUẢN TRỊ TRANG — hai màn còn lại
   Cấp tài khoản cho vị trí từ Tư vấn trở lên, và vòng đời một
   tài khoản: khoá, mở lại, xoá. Chỉ R01 và R02 vào được.
   ═══════════════════════════════════════════════════════════════ */
(function(){
var U = G.U, h = U.h, ic = U.ic;

function chanCua(){
  return U.lockCard('Thư mục Quản trị trang chỉ mở cho Super Admin và Admin hệ thống. '+
    'Đây là nơi quyết định ai vào được hệ thống, nên không mở rộng hơn hai vị trí đó.');
}

/* Vị trí được phép cấp: từ Tư vấn (R11) trở lên, và không cao hơn người đang cấp. */
G.vaiCapDuoc = function(){
  var toi = G.S.roleObj; if(!toi) return [];
  return G.ROLES.filter(function(r){ return r.lv >= toi.lv && r.lv <= 11; });
};

/* Mật khẩu ban đầu: 16 ký tự, sinh bằng crypto của trình duyệt.
   Hiện đúng một lần rồi thôi — không lưu bản thô ở đâu cả. */
G.matKhauBanDau = function(){
  var B = 'ABCDEFGHJKLMNPQRSTUVWXYZ', b = 'abcdefghijkmnopqrstuvwxyz', s = '23456789', d = '!@#$%^&*?';
  var tap = B + b + s + d, ra = [], m = new Uint32Array(16);
  (window.crypto || window.msCrypto).getRandomValues(m);
  ra.push(B[m[0] % B.length], b[m[1] % b.length], s[m[2] % s.length], d[m[3] % d.length]);
  for (var i = 4; i < 16; i++) ra.push(tap[m[i] % tap.length]);
  for (var j = ra.length - 1; j > 0; j--){ var k = m[j] % (j + 1), t = ra[j]; ra[j] = ra[k]; ra[k] = t; }
  return ra.join('');
};

G.VIEWS['cap-tai-khoan'] = function(){
  if(!G.can('qt_trang')) return chanCua();
  var duoc = G.vaiCapDuoc();
  var o = U.ph({eyebrow:'QUẢN TRỊ TRANG · CHỈ R01 – R02', ic:'plus', grad:1,
    t:'Mở tài khoản mới',
    lead:'Cấp tên đăng nhập và mật khẩu ban đầu cho các vị trí từ Tư vấn trở lên. '+
      'Khách hàng tự đăng ký ở Cổng vào; cộng tác viên nhận mã liên kết — không cấp ở đây.'});

  o += '<div class="card"><div class="up mb" style="color:var(--ink-4)">THÔNG TIN NGƯỜI NHẬN</div>'+
    '<div class="ct-luoi">'+
      '<div><label class="tiny up muted">HỌ VÀ TÊN</label>'+
        '<input id="ct_ten" class="inp blk" placeholder="Nguyễn Văn A"></div>'+
      '<div><label class="tiny up muted">EMAIL CÔNG VIỆC</label>'+
        '<input id="ct_email" type="email" class="inp blk" placeholder="ten@gita365.vn"></div>'+
      '<div><label class="tiny up muted">VỊ TRÍ</label>'+
        '<select id="ct_vai" class="inp blk">'+
          duoc.map(function(r){ return '<option value="'+h(r.id)+'">'+h(r.id+' · '+r.n)+'</option>'; }).join('')+
        '</select></div>'+
      '<div><label class="tiny up muted">KHU VỰC / NHÓM PHỤ TRÁCH</label>'+
        '<input id="ct_nha" class="inp blk" placeholder="Nhóm Coach miền Bắc"></div>'+
    '</div>'+
    '<div id="ct_loi" class="tiny mt" style="color:#BE0E16;min-height:16px"></div>'+
    '<button class="btn pri mt" data-act="ct-cap">'+ic('plus','w-4 h-4')+'Sinh tài khoản và mật khẩu ban đầu</button>'+
    '</div>';

  o += '<div class="card mt2" style="border-color:var(--gita-vien-1)">'+
    '<div class="up mb" style="color:var(--gold-ink)">BỐN LUẬT KHI CẤP</div>'+
    U.list([
      'Không cấp được vị trí cao hơn chính mình — danh sách trên chỉ hiện vai từ bậc của anh chị trở xuống.',
      'Không cấp cho vị trí thấp hơn Tư vấn. Phụ huynh và học viên tự đăng ký, cộng tác viên nhận mã liên kết.',
      'Mật khẩu ban đầu hiện đúng MỘT lần. Gửi cho người nhận bằng kênh khác với kênh gửi tên đăng nhập.',
      'Người nhận buộc đổi mật khẩu ở lần đăng nhập đầu; chưa đổi thì không đi tiếp được màn nào.'
    ])+'</div>';

  o += U.sec('VỊ TRÍ CẤP ĐƯỢC', duoc.length + ' / 15 vị trí');
  o += U.tbl(['Vị trí','Bậc','Sẽ thấy','Cổng vào'], duoc.map(function(r){
    var nM = 0, tong = 0;
    G.NAV.forEach(function(g){ g.items.forEach(function(it){
      tong++; if(!it.perm || G.vaiCo(r.id, it.perm)) nM++; }); });
    return [U.chip(r.n, r.c), '<span class="mono sm">'+r.lv+'</span>',
      '<b>'+nM+'</b><span class="muted sm"> / '+tong+' màn · '+Math.round(nM*100/tong)+'%</span>',
      '<span class="sm muted">'+h((G.PORTALS[r.portal]||{}).n || '—')+'</span>'];
  }));
  return o;
};

G.capTaiKhoan = function(){
  var loi = document.getElementById('ct_loi');
  function bao(t){ if(loi) loi.textContent = t; }
  if(!G.can('qt_trang')){ bao('Vai này không có quyền quản trị trang.'); return; }
  var ten = (document.getElementById('ct_ten')||{}).value || '';
  var em  = (document.getElementById('ct_email')||{}).value || '';
  var vai = (document.getElementById('ct_vai')||{}).value || '';
  var nha = (document.getElementById('ct_nha')||{}).value || '';
  ten = ten.trim(); em = em.trim().toLowerCase();
  if(ten.length < 3){ bao('Chưa điền họ tên.'); return; }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)){ bao('Email chưa đúng định dạng.'); return; }
  var r = G.roleById(vai);
  if(!r){ bao('Chưa chọn vị trí.'); return; }
  if(r.lv < (G.S.roleObj||{}).lv){ bao('Không cấp được vị trí cao hơn chính mình.'); return; }
  if(r.lv > 11){ bao('Chỉ cấp cho vị trí từ Tư vấn trở lên. Khách hàng tự đăng ký ở Cổng vào.'); return; }

  var mk = G.matKhauBanDau();
  if(G.secLog) G.secLog('Cấp tài khoản',
    em + ' · ' + vai + ' · ' + (nha||'—') + ' · người cấp ' + (G.S.acc && G.S.acc.u), 'Ghi nhận');

  U.modal(
    '<div class="center" style="color:var(--gold-ink)">'+ic('check','w-8 h-8')+'</div>'+
    '<h2 style="font-size:21px;font-weight:800;margin:8px 0 4px;text-align:center">Đã sinh tài khoản</h2>'+
    '<p class="sm muted center" style="margin-bottom:14px">Mật khẩu dưới đây hiện đúng một lần. Đóng cửa sổ là không xem lại được.</p>'+
    U.tbl(['Mục','Giá trị'], [
      ['Họ tên', '<b>'+h(ten)+'</b>'],
      ['Tên đăng nhập', '<span class="mono sm">'+h(em)+'</span>'],
      ['Vị trí', U.chip(r.n, r.c)],
      ['Khu vực', '<span class="sm">'+h(nha||'—')+'</span>'],
      ['Mật khẩu ban đầu', '<span class="mono" style="font-size:16px;color:var(--gold-ink);font-weight:800">'+h(mk)+'</span>']
    ])+
    '<div class="card pad-sm mt" style="border-color:rgba(248,113,113,.4)">'+
    '<p class="tiny" style="line-height:1.65;color:var(--ink-2)"><b>Gửi mật khẩu bằng kênh KHÁC</b> với kênh gửi tên đăng nhập. '+
    'Người nhận buộc đổi ở lần đăng nhập đầu. Bản thô của mật khẩu không được lưu ở đâu — kể cả nhật ký.</p></div>'+
    (G.API_CAP_PHEP ? '' :
      '<p class="tiny muted mt center">Bản mẫu chưa nối máy chủ nên tài khoản này chưa được ghi vào sổ người dùng.</p>')+
    '<button class="btn pri blk mt" data-act="dong-modal">Tôi đã chép lại</button>'
  );
};

/* ─── Khoá · mở lại · xoá ─── */
var LYDO_KHOA = [
  'KPI dưới 30% sau 90 ngày — theo luật vòng đời tài khoản',
  'Không hoạt động 180 ngày',
  'Nghi ngờ chia sẻ tài khoản cho người ngoài',
  'Người dùng nghỉ việc hoặc chuyển vị trí',
  'Gia đình tạm dừng chương trình',
  'Yêu cầu của chính người dùng'
];

G.VIEWS['khoa-tai-khoan'] = function(){
  if(!G.can('qt_trang')) return chanCua();
  var o = U.ph({eyebrow:'QUẢN TRỊ TRANG · CHỈ R01 – R02', ic:'lock', grad:1,
    t:'Khoá · mở lại · xoá tài khoản',
    lead:'Ba việc khác nhau, hậu quả khác nhau. Khoá thì gỡ lại được; xoá thì không.'});

  o += '<div class="ktk-ba">'+
    '<div class="ktk-o" style="--kc:#BE0E16"><div class="ktk-h">'+ic('lock','w-4 h-4')+'<b>KHOÁ</b></div>'+
      '<p class="sm">Người dùng không đăng nhập được nữa. Dữ liệu giữ nguyên, hồ sơ gia đình không mất gì. '+
      'Mở lại lúc nào cũng được.</p><div class="ktk-ai">R01 · R02 làm được</div></div>'+
    '<div class="ktk-o" style="--kc:#0B7350"><div class="ktk-h">'+ic('check','w-4 h-4')+'<b>MỞ LẠI</b></div>'+
      '<p class="sm">Trả tài khoản về hoạt động. Phải có người xem xét và ghi lý do — không tự động mở.</p>'+
      '<div class="ktk-ai">R01 · R02 làm được</div></div>'+
    '<div class="ktk-o" style="--kc:#BE0E16"><div class="ktk-h">'+ic('x','w-4 h-4')+'<b>XOÁ</b></div>'+
      '<p class="sm">Gỡ hẳn khỏi hệ thống. <b>Không hoàn lại được.</b> Chỉ Super Admin, và phải gõ đúng '+
      'tên đăng nhập để xác nhận.</p><div class="ktk-ai">CHỈ R01</div></div>'+
    '</div>';

  o += '<div class="card mt2"><div class="up mb" style="color:var(--ink-4)">THAO TÁC TRÊN MỘT TÀI KHOẢN</div>'+
    '<div class="ct-luoi">'+
      '<div><label class="tiny up muted">TÊN ĐĂNG NHẬP</label>'+
        '<input id="kt_u" class="inp blk" placeholder="ten@gita365.vn"></div>'+
      '<div><label class="tiny up muted">VIỆC CẦN LÀM</label>'+
        '<select id="kt_viec" class="inp blk">'+
          '<option value="khoa">Khoá tài khoản</option>'+
          '<option value="mo">Mở lại tài khoản</option>'+
          (G.S.role === 'R01' ? '<option value="xoa">Xoá vĩnh viễn</option>' : '')+
        '</select></div>'+
      '<div style="grid-column:1/-1"><label class="tiny up muted">LÝ DO — bắt buộc, vào nhật ký</label>'+
        '<select id="kt_lydo" class="inp blk">'+
          LYDO_KHOA.map(function(x){ return '<option>'+h(x)+'</option>'; }).join('')+
        '</select></div>'+
    '</div>'+
    '<div id="kt_loi" class="tiny mt" style="color:#BE0E16;min-height:16px"></div>'+
    '<button class="btn pri mt" data-act="kt-lam">Thực hiện</button></div>';

  if(G.S.role !== 'R01')
    o += '<p class="tiny muted mt">Vai Admin hệ thống khoá và mở lại được, nhưng không xoá được tài khoản nào. '+
      'Xoá là việc của Super Admin.</p>';
  return o;
};

G.lamViecTaiKhoan = function(){
  var loi = document.getElementById('kt_loi');
  function bao(t){ if(loi) loi.textContent = t; }
  if(!G.can('qt_trang')){ bao('Vai này không có quyền quản trị trang.'); return; }
  var u = ((document.getElementById('kt_u')||{}).value || '').trim().toLowerCase();
  var viec = (document.getElementById('kt_viec')||{}).value || '';
  var lydo = (document.getElementById('kt_lydo')||{}).value || '';
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(u)){ bao('Nhập đúng tên đăng nhập dạng email.'); return; }
  if(viec === 'xoa' && G.S.role !== 'R01'){ bao('Chỉ Super Admin xoá được tài khoản.'); return; }
  if(u === (G.S.acc && G.S.acc.u)){ bao('Không tự khoá hoặc xoá chính tài khoản mình đang dùng.'); return; }

  if(viec === 'xoa'){
    U.modal('<h2 style="font-size:21px;font-weight:800;margin-bottom:6px;color:#BE0E16">Xoá vĩnh viễn</h2>'+
      '<p class="sm" style="line-height:1.7;color:var(--ink-2);margin-bottom:12px">Sắp xoá hẳn <b class="mono">'+h(u)+'</b>. '+
      'Việc này <b>không hoàn lại được</b>. Gõ lại đúng tên đăng nhập để xác nhận.</p>'+
      '<input id="kt_xn" class="inp blk mb" placeholder="'+h(u)+'" autocomplete="off">'+
      '<div id="kt_xnloi" class="tiny mb" style="color:#BE0E16;min-height:16px"></div>'+
      '<button class="btn pri blk" data-act="kt-xoa-that" data-u="'+h(u)+'" data-l="'+h(lydo)+'">Tôi hiểu — xoá</button>');
    return;
  }
  if(G.secLog) G.secLog(viec === 'khoa' ? 'Khoá tài khoản' : 'Mở lại tài khoản',
    u + ' · lý do: ' + lydo + ' · người làm ' + (G.S.acc && G.S.acc.u), 'Ghi nhận');
  U.toast((viec === 'khoa' ? 'Đã ghi lệnh khoá ' : 'Đã ghi lệnh mở lại ') + u +
    (G.API_CAP_PHEP ? '.' : ' — bản mẫu chưa nối máy chủ nên chưa gửi đi.'), 'ok');
  bao('');
};

G.xoaTaiKhoanThat = function(el){
  var u = el.getAttribute('data-u'), lydo = el.getAttribute('data-l');
  var go = ((document.getElementById('kt_xn')||{}).value || '').trim().toLowerCase();
  var loi = document.getElementById('kt_xnloi');
  if(go !== u){ if(loi) loi.textContent = 'Tên đăng nhập gõ lại chưa khớp.'; return; }
  if(G.secLog) G.secLog('XOÁ tài khoản', u + ' · lý do: ' + lydo + ' · người xoá ' + (G.S.acc && G.S.acc.u), 'Cảnh báo');
  U.closeModal();
  U.toast('Đã ghi lệnh xoá ' + u + (G.API_CAP_PHEP ? '.' : ' — bản mẫu chưa nối máy chủ nên chưa gửi đi.'), 'ok');
};
})();

/* ═══════════════════════════════════════════════════════════════
   HỆ NHẬN DIỆN THƯƠNG HIỆU GITA — màn hình chuẩn
   Mở cho mọi người trong hệ: ai cũng cần biết dùng logo và màu
   thế nào cho đúng. Phần sửa vẫn chỉ Super Admin.
   ═══════════════════════════════════════════════════════════════ */
(function(){
var U = G.U, h = U.h, ic = U.ic;

G.VIEWS['nhan-dien'] = function(){
  var N = G.NHAN_DIEN;
  if(!N) return U.empty('Chưa nạp được bộ nhận diện','Bộ nhận diện nằm trong gói nền.');

  var o = U.ph({eyebrow:'BỘ NHẬN DIỆN THƯƠNG HIỆU', ic:'star', grad:1,
    t:'Hệ nhận diện GITA', lead:N.goc});

  /* Logo */
  o += U.sec('1 · LOGO','Bản dựng vector nằm trong ứng dụng — mọi nơi đều gọi từ một chỗ');
  o += '<div class="nd-logo"><div class="nd-logo-o">'+ (G.logoGita ? G.logoGita() : '') +'</div>'+
    '<div class="nd-logo-p"><div class="nd-dau">'+ (G.dauGita ? G.dauGita() : '') +'</div>'+
    '<div class="tiny muted" style="text-align:center;margin-top:8px">Dấu vuông</div></div></div>';
  o += U.tbl(['Bản dựng','Dùng ở đâu','Cỡ nhỏ nhất'], N.logo.banDung.map(function(b){
    return ['<b>'+h(b.ten)+'</b>','<span class="sm">'+h(b.dung)+'</span>',
      '<span class="mono sm">'+h(b.toiThieu)+'</span>'];
  }));
  o += '<div class="card mt2"><div class="up mb" style="color:var(--ink-4)">CẤU TẠO</div>'+
    U.list(N.logo.cauTao)+
    '<div class="up mb mt2" style="color:var(--ink-4)">KHOẢNG THỞ</div>'+
    '<p class="sm" style="line-height:1.7;color:var(--ink-2)">'+h(N.logo.khoangTho)+'</p></div>';
  o += '<div class="card mt2" style="border-color:var(--gita-vien-1)">'+
    '<div class="up mb" style="color:var(--gita-do-ink)">'+ic('x','w-4 h-4')+' NĂM ĐIỀU KHÔNG ĐƯỢC LÀM VỚI LOGO</div>'+
    U.list(N.logo.cam, 'var(--gita-do)')+'</div>';

  /* Màu */
  o += U.sec('2 · MÀU','Ba màu thương hiệu và năm màu tầng');
  o += '<div class="nd-mau">'+ N.mau.chinh.map(function(m){
    return '<div class="nd-o" style="--mc:'+m.hex+'">'+
      '<div class="nd-o-mau"></div>'+
      '<div class="nd-o-tx"><b>'+h(m.ten)+'</b>'+
        '<span class="mono">'+h(m.hex)+'</span>'+
        '<span class="mono tiny muted">'+h(m.ma)+'</span>'+
        '<p>'+h(m.vai)+'</p></div></div>';
  }).join('') +'</div>';

  o += '<div class="nd-tang mt2">'+ N.mau.tang.map(function(t){
    return '<div class="nd-t" style="--mc:'+t.hex+'"><span class="nd-t-o"></span>'+
      '<div><b>'+h(t.ten)+'</b><span class="mono">'+h(t.hex)+'</span></div></div>';
  }).join('') +'</div>';
  o += '<p class="sm mt" style="line-height:1.7;color:var(--ink-2)">'+h(N.mau.yNghia)+'</p>';
  o += '<div class="card mt2"><div class="up mb" style="color:var(--ink-4)">LUẬT DÙNG MÀU</div>'+
    U.list(N.mau.luat)+'</div>';

  /* Chữ */
  o += U.sec('3 · CHỮ','Hai bộ chữ, nhúng sẵn trong ứng dụng');
  o += U.tbl(['Bộ chữ','Dùng làm gì'], [
    ['<b style="font-family:var(--font)">'+h(N.chu.chinh.ten)+'</b>','<span class="sm">'+h(N.chu.chinh.vai)+'</span>'],
    ['<b style="font-family:var(--serif);font-size:18px">'+h(N.chu.nhanManh.ten)+'</b>','<span class="sm">'+h(N.chu.nhanManh.vai)+'</span>']
  ]);
  o += '<div class="card mt"><div class="up mb" style="color:var(--ink-4)">LUẬT DÙNG CHỮ</div>'+U.list(N.chu.luat)+'</div>';

  /* Tài liệu */
  o += U.sec('4 · ÁP VÀO TÀI LIỆU','Mỗi tài liệu phát hành đều phải đủ năm phần');
  o += '<div class="row wrap" style="gap:12px;align-items:stretch">'+
    '<div class="card" style="flex:1;min-width:260px;border-color:var(--gita-vien-1)">'+
      '<div class="up mb" style="color:var(--gita-ink)">'+ic('check','w-4 h-4')+' BẮT BUỘC CÓ</div>'+
      U.list(N.taiLieu.batBuoc)+'</div>'+
    '<div class="card" style="flex:1;min-width:260px">'+
      '<div class="up mb" style="color:var(--gita-do-ink)">'+ic('x','w-4 h-4')+' KHÔNG ĐƯỢC</div>'+
      U.list(N.taiLieu.cam, 'var(--gita-do)')+'</div></div>';

  /* Quy trình */
  o += U.sec('5 · ÁP VÀO QUY TRÌNH','Màu đi theo việc, không đi theo sở thích');
  o += U.tbl(['Chặng','Màu dùng','Vì sao'], N.quyTrinh.map(function(q){
    var hex = q.m.indexOf('--') === 0
      ? getComputedStyle(document.documentElement).getPropertyValue(q.m).trim() : '';
    return ['<b>'+h(q.b)+'</b>',
      hex ? '<span class="nd-cham" style="--mc:'+hex+'"></span><span class="mono sm">'+h(q.m)+'</span>'
          : '<span class="sm muted">'+h(q.m)+'</span>',
      '<span class="sm">'+h(q.mo)+'</span>'];
  }));

  return o;
};
})();

/* ═══════════════════════════════════════════════════════════════
   BỘ NHẬN DIỆN NGÔN TỪ — màn hình chuẩn
   Song sinh với bộ nhận diện hình ảnh. Mở cho đội ngũ từ Tư vấn
   trở lên, vì đây là công cụ nghề: viết cho khách hàng đọc.
   ═══════════════════════════════════════════════════════════════ */
(function(){
var U = G.U, h = U.h, ic = U.ic;

G.VIEWS['nhan-dien-loi'] = function(){
  var N = G.NHAN_DIEN_LOI;
  if(!N) return U.empty('Chưa nạp được bộ nhận diện ngôn từ','Phần này nằm trong gói nền.');

  var o = U.ph({eyebrow:'BỘ NHẬN DIỆN NGÔN TỪ', ic:'book', grad:1,
    t:'GITA nói như thế nào', lead:N.cot});

  /* Hai hệ ngôn ngữ */
  o += U.sec('1 · HAI HỆ NGÔN NGỮ','Cùng một màn hình, hai cách gọi tên — máy tự đổi theo người đăng nhập');
  o += '<div class="row wrap" style="gap:12px;align-items:stretch">'+
    N.haiHe.map(function(x){
      return '<div class="card" style="flex:1;min-width:280px;border-color:'+
        (x.id==='nha'?'var(--gita-vien-1)':'var(--line)')+'">'+
        '<div class="up mb" style="color:'+(x.id==='nha'?'var(--gita-ink)':'var(--ink-4)')+'">'+h(x.ten)+'</div>'+
        '<div class="tiny muted mb">'+h(x.ai)+'</div>'+
        '<p class="sm" style="line-height:1.7;color:var(--ink-2)">'+h(x.cot)+'</p>'+
        '<div class="tiny up muted" style="margin:12px 0 6px">DÙNG</div>'+
        '<div class="row wrap" style="gap:6px">'+ x.dung.map(function(t){
          return '<span class="chip" style="border-color:var(--gita-vien-1);color:var(--gita-ink)">'+h(t)+'</span>'; }).join('') +'</div>'+
        '<div class="tiny up muted" style="margin:12px 0 6px">TRÁNH</div>'+
        '<div class="row wrap" style="gap:6px">'+ x.tranh.map(function(t){
          return '<span class="chip" style="border-color:var(--line);color:var(--ink-4);text-decoration:line-through">'+h(t)+'</span>'; }).join('') +'</div>'+
        '</div>';
    }).join('') +'</div>';

  /* Sáu nhịp */
  o += U.sec('2 · SÁU NHỊP','Xương sống của mọi cuộc nói chuyện, từ tin nhắn tới buổi coaching');
  o += U.tbl(['Nhịp','Làm gì'], N.sauNhip.map(function(n){
    return ['<b style="color:var(--gita-ink)">'+h(n.ma)+' · '+h(n.ten)+'</b>',
      '<span class="sm">'+h(n.lam)+'</span>'];
  }));

  /* Dấu hiệu câu do máy viết */
  o += U.sec('3 · MƯỜI DẤU HIỆU CÂU DO MÁY VIẾT','Bộ soi trước khi phát hành bất cứ câu nào ra ngoài');
  o += '<div class="card pad-sm mb" style="border-color:var(--gita-vien-1)">'+
    '<p class="sm" style="line-height:1.7;color:var(--ink-2)">Câu nào dính từ <b>hai dấu hiệu trở lên</b> thì viết lại. '+
    'Không phải vì máy viết là sai, mà vì gia đình đọc ra ngay — và cái họ đọc ra là mình không thật sự ngồi cạnh họ.</p></div>';
  o += U.tbl(['Dấu hiệu','Vì sao phải sửa'], N.dauHieuMay.map(function(d, i){
    return ['<div class="pq-ten"><b>'+(i+1)+' · '+h(d.d)+'</b></div>',
      '<span class="sm">'+h(d.v)+'</span>'];
  }));

  /* Mười hai cặp */
  o += U.sec('4 · NÓI THẾ NÀY, KHÔNG NÓI THẾ KIA', N.thayVi.length + ' cặp — chép thẳng mà dùng');
  o += '<div class="lt-cap">'+ N.thayVi.map(function(c){
    return '<div class="lt-o">'+
      '<div class="lt-khong">'+ic('x','w-3 h-3')+'<span>'+h(c.khong)+'</span></div>'+
      '<div class="lt-nen">'+ic('check','w-3 h-3')+'<span>'+h(c.nen)+'</span></div></div>';
  }).join('') +'</div>';

  /* Xưng hô */
  o += U.sec('5 · CÁCH XƯNG HÔ','Gọi sai một chữ là mất khoảng cách đúng');
  o += U.tbl(['Nói với ai','Gọi họ','Tự xưng','Ghi chú'], N.xungHo.map(function(x){
    return ['<b>'+h(x.voi)+'</b>','<span class="mono sm" style="color:var(--gita-ink)">'+h(x.he)+'</span>',
      '<span class="mono sm">'+h(x.minh)+'</span>','<span class="sm muted">'+h(x.ghi)+'</span>'];
  }));

  /* Ranh giới */
  o += U.sec('6 · SÁU RANH GIỚI NGÔN TỪ','Không thương lượng, kể cả khi khách hàng yêu cầu');
  o += '<div class="card" style="border-color:var(--gita-vien-1)">'+
    '<div class="up mb" style="color:var(--gita-do-ink)">'+ic('shield','w-4 h-4')+' KHÔNG BAO GIỜ</div>'+
    U.list(N.ranhGioi, 'var(--gita-do)')+'</div>';

  return o;
};
})();

/* ═══════════════════════════════════════════════════════════════
   TÀI LIỆU GỐC HỌC VIỆN — năm bộ Word đã biên soạn vào kho
   Sinh từ tools/bien-soan. Xem được dàn ý và mọi bảng dữ liệu.
   ═══════════════════════════════════════════════════════════════ */
(function(){
var U = G.U, h = U.h, ic = U.ic;

G.VIEWS['tai-lieu-goc'] = function(){
  /* Hai nguồn, một màn hình: năm tệp Word gốc và mười tài liệu trên Drive. */
  var D = (G.TAILIEU_GOC || []).concat(
    (G.TAILIEU_DRIVE || []).map(function(x){
      return {ma:x.ma, ten:x.ten, mo:x.mo, soChu:x.soChu, danY:x.danY,
              bang:(x.bang||[]).map(function(b){ return {muc:'', cot:b.cot, hang:b.hang}; }),
              doan:x.doan || []};
    }));
  if(!D.length) return U.empty('Chưa mở được tài liệu gốc',
    'Năm bộ tài liệu gốc nằm trong kho nghề. Đăng nhập bằng vai được cấp để mở.');

  var chon = G.S.tlgChon || D[0].ma;
  var t = D.filter(function(x){ return x.ma === chon; })[0] || D[0];
  var tongBang = D.reduce(function(a,x){ return a + x.bang.length; }, 0);
  var tongHang = D.reduce(function(a,x){ return a + x.bang.reduce(function(b,y){ return b + y.hang.length; },0); }, 0);

  var o = U.ph({eyebrow:'TÀI LIỆU GỐC HỌC VIỆN', ic:'vault', grad:1,
    t:'Năm bộ tài liệu nền',
    lead:'Biên soạn thẳng từ tệp Word gốc của Học viện — giữ nguyên chữ, không viết lại. '+
      'Sửa tài liệu gốc rồi biên soạn lại thì kho tự cập nhật.'});

  o += '<div class="pv-lo">'+
    '<div class="pv-th"><b>'+D.length+'</b><span>BỘ TÀI LIỆU</span></div>'+
    '<div class="pv-th"><b>'+tongBang+'</b><span>BẢNG DỮ LIỆU</span></div>'+
    '<div class="pv-th"><b>'+tongHang.toLocaleString('vi-VN')+'</b><span>DÒNG DỮ LIỆU</span></div>'+
    '<div class="pv-th"><b>'+D.reduce(function(a,x){return a+(x.doan||[]).length;},0).toLocaleString('vi-VN')+
      '</b><span>ĐOẠN ĐÃ VÀO KHO</span></div></div>';

  /* ── Nói thật về khoảng cách giữa tệp gốc và kho ──
     Màn này từng công bố tổng "CHỮ GỐC" đếm theo tệp nguồn. Nhưng năm
     bộ tài liệu Word (TG-01…TG-05) vào kho chỉ có dàn ý và bảng, không
     có đoạn văn nào — nguồn .doc đã không còn để rút lại. Công bố số
     chữ của tệp nguồn trong khi kho không giữ chữ ấy là để người đọc
     tin mình đọc được thứ không có. */
  var coRuot = D.filter(function(x){ return (x.doan||[]).length; });
  var khongRuot = D.filter(function(x){ return !(x.doan||[]).length; });
  if(khongRuot.length){
    o += '<div class="card mt2" style="border-color:var(--alert)">'+
      '<div class="tiny up mb" style="color:var(--alert)">'+khongRuot.length+
        ' BỘ CHỈ CÓ DÀN Ý VÀ BẢNG, CHƯA CÓ ĐOẠN VĂN</div>'+
      '<p class="sm" style="line-height:1.75">'+
      h(khongRuot.map(function(x){ return x.ma + ' ' + x.ten; }).join(' · '))+'</p>'+
      '<p class="sm muted mt" style="line-height:1.7">Năm tệp Word gốc được biên soạn vào kho ở bản '+
      'trước chỉ lấy dàn ý và bảng dữ liệu; bộ rút chữ khi ấy không rút đoạn văn. Muốn có ruột thì '+
      'phải đưa lại năm tệp .doc gốc rồi chạy <span class="mono">tools/bien-soan/tao-kho.py</span>. '+
      'Con số ở trên đếm ĐOẠN ĐÃ VÀO KHO, không đếm chữ trong tệp nguồn — để không ai tưởng mình '+
      'đọc được thứ kho chưa giữ.</p></div>';
  }

  o += '<div class="row wrap mt2" style="gap:8px">'+ D.map(function(x){
    return '<button class="btn '+(x.ma===chon?'pri':'ghost')+' sm" data-tlg="'+h(x.ma)+'">'+
      h(x.ten)+'<span class="muted"> · '+x.bang.length+'</span></button>';
  }).join('') +'</div>';

  o += '<div class="card mt2"><div class="row mb">'+
    '<span style="color:var(--gita-ink)">'+ic('book','w-4 h-4')+'</span>'+
    '<b>'+h(t.ten)+'</b><span class="chip" style="margin-left:auto">'+h(t.ma)+'</span></div>'+
    '<p class="sm" style="line-height:1.7;color:var(--ink-2)">'+h(t.mo)+'</p>'+
    '<p class="tiny muted mt">'+t.danY.length+' mục dàn ý · '+t.bang.length+' bảng · '+
      t.bang.reduce(function(a,b){return a+b.hang.length;},0)+' dòng · '+
      ((t.doan||[]).length
        ? '<b style="color:var(--ok)">'+t.doan.length.toLocaleString('vi-VN')+' đoạn văn</b>'
        : '<b style="color:var(--alert)">chưa có đoạn văn</b>')+
      ' · tệp nguồn '+t.soChu.toLocaleString('vi-VN')+' chữ</p></div>';

  if(t.danY.length){
    o += U.sec('DÀN Ý', t.danY.length + ' mục');
    o += '<div class="tlg-dan">'+ t.danY.map(function(m){
      return '<div class="tlg-m c'+m.c+'">'+h(m.t)+'</div>';
    }).join('') +'</div>';
  }

  if(t.doan && t.doan.length){
    /* ── Đọc được HẾT, không dừng ở sáu mươi đoạn ──
       Bản trước hiện 60 đoạn rồi ghi "còn N đoạn, tra bằng Trợ lý GITA".
       Đo ra thì cả kho có 3.611 đoạn: người đọc với tới được 60 mỗi bộ,
       phần còn lại chỉ tra được nếu đoán đúng từ khoá. Tài liệu gốc của
       Học viện mà phải đoán từ khoá mới đọc được thì coi như chưa có.

       Nay mở dần theo lô 80 đoạn, bấm là ra tiếp, tới hết. */
    var soHien = G.S.tlgDoan || 80;
    var hetDoan = soHien >= t.doan.length;
    o += U.sec('NỘI DUNG', t.doan.length.toLocaleString('vi-VN') + ' đoạn — giữ nguyên văn, không viết lại');
    o += '<div class="tlg-doan">'+ t.doan.slice(0, soHien).map(function(d){
      return '<p>'+h(d)+'</p>'; }).join('') +'</div>';
    o += '<div class="center mt2">'+
      (hetDoan
        ? '<p class="tiny muted">Đã hết ' + t.doan.length.toLocaleString('vi-VN') + ' đoạn của bộ này.</p>'
        : '<button class="btn" data-tlgdoan="1">Đọc tiếp 80 đoạn</button>' +
          '<p class="tiny muted mt">Đang đọc ' + soHien.toLocaleString('vi-VN') + ' / ' +
          t.doan.length.toLocaleString('vi-VN') + ' đoạn</p>') +
      '</div>';
  }
  /* ── Bảng cũng mở dần, y như đoạn văn ──
     Đoạn văn đã mở theo lô 80 từ bản trước; BẢNG thì bị bỏ sót và dựng
     hết một lượt. Đo trên máy điện thoại phổ thông (CPU chậm sáu lần):

       TG-05  44 bảng · 862 hàng · 5.257 ô  →  12.384 nút DOM  →  3.136 ms

     Ba giây đứng hình sau một cú bấm. Máy làm việc thì nhanh nên chỗ
     này không bao giờ lộ ra — nó chỉ lộ khi đo trên máy yếu.

     Không bảng nào tự nó to (bảng lớn nhất 30 hàng); cái nhiều là SỐ
     BẢNG. Nên chặn theo bảng, không chặn theo hàng — cắt giữa một bảng
     thì người đọc mất mạch, còn cắt giữa hai bảng thì không. */
  if(t.bang.length){
    var soBang = G.S.tlgBang || 8;
    var hetBang = soBang >= t.bang.length;
    o += U.sec('BẢNG DỮ LIỆU', t.bang.length + ' bảng · ' +
      t.bang.reduce(function(a,b){ return a + b.hang.length; }, 0) + ' dòng');
    t.bang.slice(0, soBang).forEach(function(b, i){
      o += '<div class="tlg-b">'+
        '<div class="tlg-b-h">'+ic('chart','w-3 h-3')+
          '<b>'+h(b.muc || ('Bảng ' + (i+1)))+'</b>'+
          '<span>'+b.hang.length+' dòng</span></div>'+
        /* Mỗi ô trước đây bọc thêm <span class="sm">. Nhưng .tbl đã là
           14,5px và .sm cũng 14,5px — cái span không đổi gì trên màn,
           chỉ nhân đôi số nút. Bỏ đi là bớt một nửa số nút của phần ô.
           U.tbl KHÔNG thoát ô, nên h() phải giữ. */
        U.tbl(b.cot, b.hang.map(function(r){
          return r.map(function(o2){ return h(o2); });
        }))+
      '</div>';
    });
    o += '<div class="center mt2">'+
      (hetBang
        ? '<p class="tiny muted">Đã hết ' + t.bang.length + ' bảng của bộ này.</p>'
        : '<button class="btn" data-tlgbang="1">Xem tiếp 8 bảng</button>' +
          '<p class="tiny muted mt">Đang xem ' + soBang + ' / ' + t.bang.length + ' bảng</p>') +
      '</div>';
  }
  return o;
};

document.addEventListener('click', function(e){
  var a = e.target.closest && e.target.closest('[data-tlg]');
  /* Đổi bộ thì trả CẢ HAI mốc mở dần về đầu. Quên trả mốc bảng thì bộ
     sau mở ra ở đúng chỗ bộ trước đang xem — và người đọc tưởng bộ mới
     thiếu mất mấy bảng đầu. */
  if(a){ G.S.tlgChon = a.getAttribute('data-tlg'); G.S.tlgDoan = 80; G.S.tlgBang = 8; G.render(); }
  var b2 = e.target.closest && e.target.closest('[data-tlgdoan]');
  if(b2){ G.S.tlgDoan = (G.S.tlgDoan || 80) + 80; G.render(); }
  var b3 = e.target.closest && e.target.closest('[data-tlgbang]');
  if(b3){ G.S.tlgBang = (G.S.tlgBang || 8) + 8; G.render(); }
});
})();

/* ═══════════════════════════════════════════════════════════════
   SẮP XẾP THƯ MỤC — Super Admin tự đổi bố cục thanh trái
   ═══════════════════════════════════════════════════════════════ */
(function(){
var U = G.U, h = U.h, ic = U.ic;

G.VIEWS['sap-xep'] = function(){
  if(!G.can('sua_noi_dung'))
    return U.lockCard('Sắp xếp bố cục là quyền của Super Admin. Bố cục là thứ mọi vai khác nhìn thấy, '+
      'nên chỉ một người được đổi.');

  var nav = G.navDung();
  var S = G.SAP_XEP;
  var tongAn = S.anMuc.length + S.anNhom.length;

  var o = U.ph({eyebrow:'QUẢN TRỊ TRANG · CHỈ SUPER ADMIN', ic:'orbit', grad:1,
    t:'Sắp xếp thư mục',
    lead:'Đổi thứ tự, ẩn bớt, thêm thư mục mới, chuyển mục sang chỗ khác. '+
      'Bản gốc luôn giữ nguyên nên trả về mặc định lúc nào cũng được.'});

  o += '<div class="pv-lo">'+
    '<div class="pv-th"><b>'+nav.length+'</b><span>THƯ MỤC ĐANG HIỆN</span></div>'+
    '<div class="pv-th"><b>'+nav.reduce(function(a,g){return a+g.items.length;},0)+'</b><span>MỤC ĐANG HIỆN</span></div>'+
    '<div class="pv-th"><b>'+tongAn+'</b><span>ĐANG ẨN</span></div>'+
    '<div class="pv-th"><b>'+S.nhomThem.length+'</b><span>THƯ MỤC TỰ THÊM</span></div></div>';

  /* Thêm thư mục */
  o += '<div class="card mt2"><div class="up mb" style="color:var(--ink-4)">THÊM THƯ MỤC MỚI</div>'+
    '<div class="ct-luoi">'+
      '<div><label class="tiny up muted">TÊN THƯ MỤC</label>'+
        '<input id="sx_ten" class="inp blk" placeholder="TÀI LIỆU RIÊNG CỦA TÔI"></div>'+
      '<div><label class="tiny up muted">CÂU HỎI DẪN (không bắt buộc)</label>'+
        '<input id="sx_hoi" class="inp blk" placeholder="Phần này để làm gì?"></div>'+
    '</div>'+
    '<button class="btn pri sm mt" data-act="sx-them">'+ic('plus','w-4 h-4')+'Thêm thư mục</button></div>';

  /* Từng thư mục */
  nav.forEach(function(g, gi){
    o += '<div class="sx-nhom" style="--nc:'+g.c+'">'+
      '<div class="sx-h">'+
        '<span class="sx-ic">'+ic(g.ic,'w-4 h-4')+'</span>'+
        '<div class="sx-tx"><b>'+h(G.gname(g))+'</b>'+
          '<span>'+g.items.length+' mục'+(g.them?' · tự thêm':'')+'</span></div>'+
        '<div class="sx-nut">'+
          (gi>0 ? '<button class="sx-b" data-sxnl="'+h(g.id)+'" title="Lên">↑</button>' : '')+
          (gi<nav.length-1 ? '<button class="sx-b" data-sxnx="'+h(g.id)+'" title="Xuống">↓</button>' : '')+
          '<button class="sx-b" data-sxan="'+h(g.id)+'" title="Ẩn thư mục">'+ic('lock','w-3 h-3')+'</button>'+
          (g.them ? '<button class="sx-b xoa" data-sxxoa="'+h(g.id)+'" title="Xoá">'+ic('x','w-3 h-3')+'</button>' : '')+
        '</div></div>'+
      '<div class="sx-ds">'+ g.items.map(function(it, ii){
        return '<div class="sx-m">'+
          '<span class="sx-m-ic">'+ic(it.ic,'w-3 h-3')+'</span>'+
          '<span class="sx-m-t">'+h(G.iname(it))+'</span>'+
          '<select class="inp sx-sel" data-sxchuyen="'+h(it.v)+'">'+
            nav.map(function(x){
              return '<option value="'+h(x.id)+'"'+(x.id===g.id?' selected':'')+'>'+h(G.gname(x))+'</option>';
            }).join('')+
          '</select>'+
          (ii>0 ? '<button class="sx-b" data-sxml="'+h(it.v)+'">↑</button>' : '<span class="sx-b tr"></span>')+
          (ii<g.items.length-1 ? '<button class="sx-b" data-sxmx="'+h(it.v)+'">↓</button>' : '<span class="sx-b tr"></span>')+
          '<button class="sx-b" data-sxma="'+h(it.v)+'" title="Ẩn mục">'+ic('lock','w-3 h-3')+'</button>'+
        '</div>';
      }).join('') +'</div></div>';
  });

  /* Đang ẩn */
  if(tongAn){
    o += U.sec('ĐANG ẨN', tongAn + ' phần — bấm để hiện lại');
    o += '<div class="row wrap" style="gap:8px">'+
      S.anNhom.map(function(id){
        var g = (G.NAV||[]).filter(function(x){return x.id===id;})[0];
        return '<button class="btn ghost sm" data-sxan="'+h(id)+'">'+ic('lock','w-3 h-3')+
          h(g?g.t:id)+' · thư mục</button>';
      }).join('')+
      S.anMuc.map(function(v){
        var it = null;
        (G.NAV||[]).forEach(function(g){ g.items.forEach(function(x){ if(x.v===v) it = x; }); });
        return '<button class="btn ghost sm" data-sxma="'+h(v)+'">'+ic('lock','w-3 h-3')+h(it?it.t:v)+'</button>';
      }).join('') +'</div>';
  }

  o += '<div class="row mt2" style="gap:10px;flex-wrap:wrap">'+
    '<button class="btn ghost sm" data-act="sx-tra">'+ic('orbit','w-4 h-4')+'Trả bố cục về mặc định</button>'+
    '<button class="btn ghost sm" data-v="sua-hien-thi">Sửa chữ hiển thị</button></div>';
  o += '<p class="tiny muted mt">Bố cục lưu trong máy này và đi kèm bản sửa chữ qua đường đồng bộ — '+
    'bản web và bản máy tính thấy như nhau ở lần đồng bộ kế tiếp.</p>';
  return o;
};

document.addEventListener('click', function(e){
  function g(t){ var x = e.target.closest && e.target.closest('['+t+']'); return x && x.getAttribute(t); }
  var a;
  if((a = g('data-sxnl'))) return G.doiChoNhom(a, -1);
  if((a = g('data-sxnx'))) return G.doiChoNhom(a, 1);
  if((a = g('data-sxan'))) return G.anHienNhom(a);
  if((a = g('data-sxxoa'))) return G.xoaNhomThem(a);
  if((a = g('data-sxml'))) return G.doiChoMuc(a, -1);
  if((a = g('data-sxmx'))) return G.doiChoMuc(a, 1);
  if((a = g('data-sxma'))) return G.anHienMuc(a);
});
document.addEventListener('change', function(e){
  var s = e.target.closest && e.target.closest('[data-sxchuyen]');
  if(s) G.chuyenMuc(s.getAttribute('data-sxchuyen'), s.value);
});
})();
