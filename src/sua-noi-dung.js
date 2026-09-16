/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v7.6 — SỬA NỘI DUNG HIỂN THỊ
   Super Admin sửa được chữ hiện trên màn hình mà không cần lập
   trình viên: tên mục trong thanh trái, tên và mô tả nhóm, tiêu đề
   và câu dẫn của từng màn, và chữ giao diện chung.

   Cách làm: mọi chữ hiển thị đi qua G.nd(khoa, goc). Có bản sửa thì
   trả bản sửa, không có thì trả bản gốc. Bản sửa nằm trong máy và
   đồng bộ lên máy chủ; bản gốc không bao giờ bị ghi đè, nên trả về
   nguyên trạng lúc nào cũng được.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var KEY = 'gita365_sua_noidung';
var U = G.U, h = U.h, ic = U.ic;

G.SUA_ND = (function(){
  try{
    var d = JSON.parse(localStorage.getItem(KEY) || '{}');
    return (d && typeof d === 'object') ? d : {};
  }catch(e){ return {}; }
})();

/* Chữ hiển thị đi qua đây. Bản sửa rỗng coi như chưa sửa. */
/* Ba lớp, theo đúng thứ tự:
     1. Bản Super Admin sửa tay — cao nhất, ai sửa thì thắng
     2. Lời học viên — khi người đang đăng nhập là học viên (R14)
     3. Lời nhà mình — phụ huynh (R13) và cộng tác viên (R15)
     4. Lời nghề — bản gốc trong mã nguồn

   Bậc 2 rơi xuống bậc 3 chứ không rơi thẳng xuống bậc 4: thiếu một câu ở
   lời học viên thì em đọc lời nhà mình, không bao giờ đọc phải thuật ngữ
   nghề.                                                               */
G.nd = function(khoa, goc){
  var v = G.SUA_ND[khoa];
  if(typeof v === 'string' && v.length) return v;

  if(G.LA_HOC_VIEN && G.LA_HOC_VIEN() && G.NOI_HOCVIEN){
    var e = G.NOI_HOCVIEN[khoa];
    if(typeof e === 'string' && e.length) return e;
  }
  if(G.LA_KHACH && G.LA_KHACH() && G.NOI_KHACH){
    var k = G.NOI_KHACH[khoa];
    if(typeof k === 'string' && k.length) return k;
  }
  return goc;
};

G.luuNoiDung = function(){
  try{ localStorage.setItem(KEY, JSON.stringify(G.SUA_ND)); }catch(e){}
  if(G.danhDauCaiDat) G.danhDauCaiDat('noidung');
};

G.datND = function(khoa, giaTri){
  if(!G.can('sua_noi_dung')){ U.toast('Chỉ Super Admin sửa được nội dung hiển thị.','err'); return false; }
  giaTri = String(giaTri == null ? '' : giaTri).trim();
  if(giaTri.length > 400){ U.toast('Chữ quá dài — tối đa 400 ký tự.','err'); return false; }
  /* Khoá khung ảnh nhận một ĐỊA CHỈ, không nhận chữ. Chặn ngay tại chỗ
     dán, đừng để tới lúc dựng màn: javascript: và data: là hai đường
     quen nhất để nhét mã vào một ô tưởng là vô hại, còn http:// thì
     trình duyệt chặn TRONG IM LẶNG — chủ hệ dán xong thấy trống và
     tưởng mình dán sai. Nói ngay thì mất ba giây. */
  if(khoa.slice(0,6) === 'khung.' && giaTri && G.kaHopLe){
    var kq = G.kaHopLe(giaTri);
    if(!kq.ok){ U.toast(kq.loi || 'Địa chỉ không dùng được.','err'); return false; }
  }
  if(!giaTri) delete G.SUA_ND[khoa];
  else G.SUA_ND[khoa] = giaTri;
  G.luuNoiDung();
  if(G.secLog) G.secLog('Sửa nội dung hiển thị',
    khoa + ' → ' + (giaTri ? '"' + giaTri.slice(0,60) + '"' : 'trả về bản gốc') +
    ' · ' + (G.S.acc && G.S.acc.u), 'Ghi nhận');
  return true;
};

/* ═══ Danh mục mọi chữ sửa được — dựng từ chính dữ liệu, không chép tay ═══ */
G.mucSuaDuoc = function(){
  var ds = [];
  (G.NAV || []).forEach(function(g){
    ds.push({k:'nhom.'+g.id+'.t',  nhom:'Tên nhóm',     ten:'Nhóm '+g.no,        goc:g.t});
    ds.push({k:'nhom.'+g.id+'.s',  nhom:'Câu hỏi nhóm', ten:'Nhóm '+g.no,        goc:g.s});
    ds.push({k:'nhom.'+g.id+'.e',  nhom:'Tinh thần nhóm',ten:'Nhóm '+g.no,       goc:g.essence});
    g.items.forEach(function(it){
      ds.push({k:'nav.'+it.v+'.t', nhom:'Tên mục',  ten:it.v, goc:it.t, v:it.v});
      ds.push({k:'nav.'+it.v+'.h', nhom:'Mô tả mục',ten:it.v, goc:it.h, v:it.v});
      if(G.NOI_KHACH && G.NOI_KHACH['nav.'+it.v+'.t'])
        ds.push({k:'nav.'+it.v+'.t', nhom:'Lời nhà mình — tên mục', ten:it.v,
                 goc:G.NOI_KHACH['nav.'+it.v+'.t'], v:it.v, khach:1});
    });
  });
  var L = (G.UI && (G.UI[G.LANG] || G.UI.vi)) || {};
  Object.keys(L).forEach(function(k){
    if(typeof L[k] === 'string') ds.push({k:'chu.'+k, nhom:'Chữ giao diện', ten:k, goc:L[k]});
  });
  /* Khung ảnh đi qua ĐÚNG lớp này, không dựng lớp thứ hai. Địa chỉ ảnh
     cũng là một chuỗi sửa được, đồng bộ được, ghi nhật ký được — y hệt
     một câu chữ. Dựng riêng một kho cho ảnh là để dành một ngày mà bản
     này đồng bộ được còn bản kia thì không.

     Bản gốc để TRỐNG có chủ đích: chưa có ảnh nào là bản gốc đúng, và
     mọi khung trống đều hiện lời dặn ngay tại chỗ nó sẽ nằm. */
  (G.KA_CHO || []).forEach(function(k){
    ds.push({k:'khung.'+k.ma+'.nguon', nhom:'Khung ảnh · '+k.loai,
             ten:k.man+' · '+k.ten, goc:'', v:k.man, khung:1});
  });
  return ds;
};

/* ═══ Màn hình sửa ═══ */
G.VIEWS['sua-hien-thi'] = function(){
  if(!G.can('sua_noi_dung'))
    return U.lockCard('Sửa nội dung hiển thị là quyền của Super Admin. '+
      'Chữ trên màn hình là thứ hàng nghìn gia đình đọc, nên chỉ một người được đổi — '+
      'và mọi lần đổi đều vào nhật ký.');

  var ds = G.mucSuaDuoc();
  var daSua = ds.filter(function(x){ return G.SUA_ND[x.k]; });
  var tim = (G.S.ndTim || '').toLowerCase();

  var o = U.ph({eyebrow:'QUẢN TRỊ TRANG · CHỈ SUPER ADMIN', ic:'book', grad:1,
    t:'Sửa nội dung hiển thị',
    lead:'Chỗ nào chữ chưa hợp lý thì sửa ngay tại đây. Bản gốc luôn được giữ, '+
      'nên trả về nguyên trạng lúc nào cũng được — từng mục một hoặc cả bảng.'});

  o += '<div class="pv-lo">'+
    '<div class="pv-th"><b>'+ds.length+'</b><span>MỤC SỬA ĐƯỢC</span></div>'+
    '<div class="pv-th"><b>'+daSua.length+'</b><span>ĐANG DÙNG BẢN SỬA</span></div>'+
    '<div class="pv-th"><b>'+(ds.length-daSua.length)+'</b><span>GIỮ BẢN GỐC</span></div></div>';

  o += '<div class="card mt2 pad-sm" style="border-color:var(--gita-vien-1)">'+
    '<p class="sm" style="line-height:1.7;color:var(--ink-2)">'+
    '<b>Ba điều nên biết:</b> sửa xong là thấy ngay, không phải dựng lại ứng dụng. '+
    'Bản gốc không bị ghi đè — xoá ô trống là chữ gốc quay lại. '+
    'Mọi lần sửa vào nhật ký kèm tên người sửa và chữ cũ.</p></div>';

  o += '<div class="row mt2" style="gap:10px;flex-wrap:wrap">'+
    '<input id="nd_tim" class="inp" style="flex:1;min-width:220px" placeholder="Tìm theo chữ hoặc theo mã mục…" value="'+h(G.S.ndTim||'')+'">'+
    (daSua.length ? '<button class="btn ghost sm" data-act="nd-tra-het">'+ic('orbit','w-4 h-4')+'Trả cả bảng về bản gốc</button>' : '')+
    '</div>';

  if(daSua.length){
    o += U.sec('ĐANG DÙNG BẢN SỬA', daSua.length + ' mục');
    o += U.tbl(['Chỗ hiển thị','Bản gốc','Bản đang dùng',''], daSua.map(function(x){
      return ['<div class="pq-ten"><b>'+h(x.nhom)+'</b><span class="mono tiny muted">'+h(x.ten)+'</span></div>',
        '<span class="sm muted">'+h(x.goc||'—')+'</span>',
        '<span class="sm" style="color:var(--gold-ink)">'+h(G.SUA_ND[x.k])+'</span>',
        '<button class="btn sm ghost" data-ndtra="'+h(x.k)+'">Trả về gốc</button>'];
    }));
  }

  var loc = ds.filter(function(x){
    if(!tim) return true;
    return (x.goc||'').toLowerCase().indexOf(tim) >= 0 ||
           x.k.toLowerCase().indexOf(tim) >= 0 ||
           (G.SUA_ND[x.k]||'').toLowerCase().indexOf(tim) >= 0;
  });

  o += U.sec('TOÀN BỘ CHỮ HIỂN THỊ', loc.length + (tim ? ' mục khớp' : ' mục') + ' · sửa xong bấm ra ngoài ô là lưu');
  var nhom = {};
  loc.forEach(function(x){ (nhom[x.nhom] = nhom[x.nhom] || []).push(x); });
  Object.keys(nhom).forEach(function(n){
    o += '<div class="nd-nhom"><div class="nd-nhom-h">'+h(n)+'<span>'+nhom[n].length+'</span></div>';
    o += nhom[n].map(function(x){
      var dang = G.SUA_ND[x.k];
      return '<div class="nd-hang'+(dang?' sua':'')+'">'+
        '<div class="nd-goc"><span class="mono tiny muted">'+h(x.ten)+'</span>'+
          '<p>'+h(x.goc||'—')+'</p></div>'+
        '<input class="inp nd-o" data-ndk="'+h(x.k)+'" value="'+h(dang||'')+'" '+
          'placeholder="'+h((x.goc||'').slice(0,60))+'">'+
        '</div>';
    }).join('');
    o += '</div>';
  });
  return o;
};

/* ═══ Nối tay ═══ */
document.addEventListener('change', function(e){
  var o = e.target.closest && e.target.closest('[data-ndk]');
  if(!o) return;
  if(G.datND(o.getAttribute('data-ndk'), o.value)){
    U.toast(o.value.trim() ? 'Đã lưu chữ mới.' : 'Đã trả về bản gốc.', 'ok');
    G.render();
  }
});
document.addEventListener('input', function(e){
  if(e.target && e.target.id === 'nd_tim'){
    G.S.ndTim = e.target.value;
    clearTimeout(G._ndT);
    G._ndT = setTimeout(function(){
      G.render();
      var i = document.getElementById('nd_tim');
      if(i){ i.focus(); i.setSelectionRange(i.value.length, i.value.length); }
    }, 420);
  }
});
document.addEventListener('click', function(e){
  var t = e.target.closest && e.target.closest('[data-ndtra]');
  if(t){ if(G.datND(t.getAttribute('data-ndtra'), '')){ U.toast('Đã trả về bản gốc.','ok'); G.render(); } return; }
  var x = e.target.closest && e.target.closest('[data-act="nd-tra-het"]');
  if(x){
    if(!G.can('sua_noi_dung')) return;
    var n = Object.keys(G.SUA_ND).length;
    G.SUA_ND = {}; G.luuNoiDung();
    if(G.secLog) G.secLog('Trả nội dung về bản gốc', n + ' mục · ' + (G.S.acc && G.S.acc.u), 'Ghi nhận');
    U.toast('Đã trả ' + n + ' mục về bản gốc.','ok'); G.render();
  }
});
})();
