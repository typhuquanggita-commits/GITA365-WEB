/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v8.2 — KIỂM THỬ THEO VAI

   Chủ hệ thống cần ngồi một chỗ và kiểm được: vai nào nhìn thấy gì.

   Trước màn này việc ấy phải làm bằng tay — đăng xuất, đăng nhập vai
   khác, đi hết trình đơn, ghi ra giấy, rồi lặp lại mười chín lần. Không
   ai làm nổi, nên trên thực tế không ai kiểm.

   Màn này tính sẵn cả ma trận và cho đổi vai bằng một cú bấm.

   MỌI CON SỐ Ở ĐÂY ĐƯỢC TÍNH TỪ G.NAV VÀ G.vaiCo LÚC CHẠY. Không bảng
   nào khai tay. Thêm một màn hay đổi một quyền là ma trận đổi theo ngay
   — bảng phân quyền lệch khỏi ứng dụng là kiểu hỏng không ai phát hiện
   cho tới lúc một vai nhìn thấy thứ đáng lẽ không được nhìn.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var U = G.U, h = U.h, ic = U.ic;
G.VIEWS = G.VIEWS || {};

function moiMan(){
  var ds = [];
  (G.NAV || []).forEach(function(g){
    (g.items || []).forEach(function(i){ ds.push({ it:i, nhom:g }); });
  });
  return ds;
}

/* Vai này thấy màn kia không — đúng phép mà ứng dụng dùng để dựng trình đơn */
G.vaiThayMan = function(vai, it){
  return !it.perm || G.vaiCo(vai, it.perm);
};

/* Đếm cho mọi vai. Trả về số thật, kể cả khi số ấy khó nhìn. */
G.demTheoVai = function(){
  var man = moiMan(), tong = man.length;
  return (G.ROLES || []).map(function(v){
    var thay = man.filter(function(m){ return G.vaiThayMan(v.id, m.it); });
    return { vai:v, thay:thay.length, tong:tong,
             pt: tong ? Math.round(thay.length * 100 / tong) : 0,
             khoa: man.length - thay.length };
  });
};

/* Đối chiếu tỉ lệ màn thực tế với TAM_NHIN; R01–R02 phải thấy đủ 100%. */
G.doiChieuTamNhin = function(){
  var mucTieu = {};
  (G.TAM_NHIN || []).forEach(function(x){
    (x.vai || []).forEach(function(id){ mucTieu[id] = x.pt; });
  });
  return G.demTheoVai().map(function(d){
    var dich = mucTieu[d.vai.id];
    var batBuocDayDu = d.vai.id === 'R01' || d.vai.id === 'R02';
    var lech = typeof dich === 'number'
      ? (d.tong ? d.thay * 100 / d.tong : 0) - dich
      : null;
    return Object.assign({}, d, {
      dich:dich,
      lech:lech,
      dat:typeof dich === 'number' &&
        (batBuocDayDu ? d.pt === 100 && d.khoa === 0 : Math.abs(lech) <= 2)
    });
  });
};

/* Hai vai khác nhau ở đúng những màn nào */
G.soSanhVai = function(a, b){
  var man = moiMan(), chiA = [], chiB = [], caHai = 0;
  man.forEach(function(m){
    var x = G.vaiThayMan(a, m.it), y = G.vaiThayMan(b, m.it);
    if(x && y) caHai++;
    else if(x) chiA.push(m.it);
    else if(y) chiB.push(m.it);
  });
  return { chiA:chiA, chiB:chiB, caHai:caHai, tong:man.length };
};

/* Tài khoản mẫu của một vai — gồm cả bốn chuyên gia phản biện */
function tkCuaVai(id){
  var a = (G.ACCOUNTS || []).filter(function(x){ return x.role === id; })[0];
  return a || null;
}

G.VIEWS['kiem-theo-vai'] = function(){
  if(!G.can('qt_trang')) return U.lockCard(
    'Màn kiểm thử theo vai cho thấy toàn bộ ma trận màn × vai và tài khoản mẫu. '+
    'Chỉ mở cho Super Admin và Admin hệ thống.');

  var dem = G.doiChieuTamNhin(), man = moiMan(), toi = G.S.roleObj;
  var NAV = G.NAV || [];
  var adminChuaDayDu = dem.filter(function(d){
    return (d.vai.id === 'R01' || d.vai.id === 'R02') && !d.dat;
  });

  var o = U.ph({eyebrow:'QUẢN TRỊ TRANG', ic:'users', grad:1,
    t:'Kiểm thử theo vai',
    lead:'Ma trận và tỉ lệ bên dưới được tính từ bảng quyền đang chạy. R01–R02 phải '+
         'thấy đủ 100% màn; các vai còn lại được đối chiếu với tỉ lệ TAM_NHIN.'});

  o += '<div class="card mt2" style="border-left:3px solid '+(adminChuaDayDu.length ? 'var(--gita-do)' : 'var(--ok)')+'">'+
    '<b class="sm">'+(adminChuaDayDu.length
      ? 'CẦN RÀ SOÁT: VAI QUẢN TRỊ CHƯA THẤY ĐỦ MÀN'
      : 'R01–R02 ĐẠT YÊU CẦU 100% HIỂN THỊ')+'</b>'+
    '<p class="sm muted mt">'+(adminChuaDayDu.length
      ? 'Không tự mở quyền. Kiểm tra các màn bị khoá trong ma trận và sửa tại bảng phân quyền có thẩm quyền.'
      : 'Tỉ lệ các vai khác được so với TAM_NHIN, dung sai ±2 điểm phần trăm.')+
      ' Tỉ lệ này đo quyền mặc định theo vai, không tính quyền T5-PRO cấp riêng theo tài khoản và không phải phần trăm dữ liệu được cấp.</p></div>';

  o += '<div class="card mt2" style="border-left:3px solid var(--gita)">'+
    '<div class="row" style="gap:9px;align-items:baseline;flex-wrap:wrap">'+
      '<span class="tiny up muted">ĐANG Ở VAI</span>'+
      U.chip(toi.short + ' · LV' + toi.lv, toi.c)+
      '<span class="sm" style="flex:1;min-width:200px">'+h(toi.ln || '')+'</span></div>'+
    '<p class="sm muted mt">Bấm <b>Vào vai này</b> ở bảng dưới là đổi ngay, không phải đăng xuất. '+
    'Quay lại Super Admin cũng bằng đúng cách ấy.</p></div>';

  /* ── A · MƯỜI LĂM VAI, MỘT CÚ BẤM ── */
  o += U.sec('MƯỜI LĂM VAI — TÀI KHOẢN MẪU VÀ PHẠM VI HIỂN THỊ',
    'Cột "khoá" là số màn vai ấy KHÔNG thấy. Đây là con số đáng nhìn hơn con số thấy được.');

  o += U.tbl(['Vai','Tài khoản mẫu','Thấy được','Khoá','Thực tế / đích','Đối chiếu','Vào vai'],
    dem.map(function(d){
      var a = tkCuaVai(d.vai.id);
      var dang = d.vai.id === toi.id;
      return ['<b class="sm" style="color:'+d.vai.c+'">'+h(d.vai.short)+'</b>'+
                '<div class="tiny mono muted">'+h(d.vai.id)+' · LV'+d.vai.lv+'</div>',
              a ? '<span class="tiny mono">'+h(a.u)+'</span>'
                : '<span class="tiny muted">chưa có tài khoản mẫu</span>',
              '<b class="mono">'+d.thay+'</b><span class="tiny muted">/'+d.tong+'</span>',
              '<span class="mono" style="color:'+(d.khoa ? 'var(--gita-do-ink)' : 'var(--ok)')+'">'+d.khoa+'</span>',
              '<div style="min-width:90px">'+U.bar(d.pt, d.vai.c)+
                '<div class="tiny mono muted mt">'+d.pt+'% / '+
                (typeof d.dich === 'number' ? d.dich+'%' : 'chưa khai')+'</div></div>',
              typeof d.lech !== 'number' ? '<span class="tiny muted">chưa khai đích</span>'
                : '<span class="chip" style="color:'+(d.dat ? 'var(--ok)' : 'var(--gita-do-ink)')+
                  ';border-color:'+(d.dat ? 'var(--ok)' : 'var(--gita-do)')+'">'+
                  (d.dat ? 'ĐẠT' : 'LỆCH')+' · '+(d.lech > 0 ? '+' : '')+
                  (Math.round(d.lech * 10) / 10)+' điểm</span>',
              dang ? '<span class="chip" style="color:var(--ok);border-color:var(--ok)">đang ở đây</span>'
                   : (a ? '<button class="btn ghost sm" data-switch="'+h(d.vai.id)+'">Vào vai này</button>'
                        : '<span class="tiny muted">—</span>')];
    }));

  /* ── B · BỐN CHUYÊN GIA PHẢN BIỆN ── */
  if((G.AUDITORS || []).length){
    o += U.sec('BỐN CHUYÊN GIA PHẢN BIỆN','Bốn tài khoản riêng để soi hệ thống từ góc khó tính nhất');
    o += U.tbl(['Người','Vai mượn','Tài khoản','Vào vai'],
      G.AUDITORS.map(function(a){
        var v = G.roleById(a.role) || {};
        return ['<b class="sm">'+h(a.ten)+'</b>',
                '<span class="tiny mono">'+h(a.role)+' · '+h(v.short || '')+'</span>',
                '<span class="tiny mono">'+h(a.u)+'</span>',
                '<button class="btn ghost sm" data-login="'+h(a.u)+'">Vào vai này</button>'];
      }));
  }

  /* ── C · MA TRẬN MÀN × VAI ── */
  o += U.sec('MA TRẬN MÀN × VAI',
    man.length + ' màn × ' + dem.length + ' vai. Ô đặc là thấy, ô rỗng là khoá. '+
    'Cột bên phải là số vai thấy được màn ấy — màn chỉ một vai thấy là màn nhạy nhất.');

  /* Chú giải mã cột. Bảng mười bảy cột không đủ chỗ cho tên vai, nên cột
     mang số và tên nằm ở đây. Bảng tự cuộn ngang trong khung của nó —
     thân trang không bao giờ cuộn ngang. */
  o += '<div class="card"><div class="tiny up muted mb">MÃ CỘT</div>'+
    '<div class="row wrap" style="gap:8px">'+ dem.map(function(d){
      return '<span class="chip" style="color:'+d.vai.c+';border-color:'+d.vai.c+'55">'+
             '<b class="mono">'+h(d.vai.id.replace('R',''))+'</b> '+h(d.vai.short)+'</span>';
    }).join('') +'</div></div>';

  NAV.forEach(function(g){
    o += '<div class="card mt2">'+
      '<div class="row" style="gap:10px;align-items:baseline;flex-wrap:wrap">'+
        '<b style="font-size:16px">'+h(g.t || g.id)+'</b>'+
        '<span class="chip">'+((g.items || []).length)+' màn</span></div>'+
      '<div class="mt">'+
      /* Tiêu đề cột là CHỮ THUẦN. U.tbl bọc tiêu đề bằng U.h nên thẻ HTML
         đưa vào đây sẽ hiện ra nguyên mã — đã vấp đúng lỗi ấy một lần.
         Màu và tên đầy đủ của vai nằm ở dải chú giải ngay trên bảng. */
      U.tbl(['Màn'].concat(dem.map(function(d){ return d.vai.id.replace('R',''); }))
              .concat(['Số vai']),
        (g.items || []).map(function(i){
          var n = 0;
          var o1 = dem.map(function(d){
            var thay = G.vaiThayMan(d.vai.id, i);
            if(thay) n++;
            return thay ? '<span style="color:'+d.vai.c+'">●</span>'
                        : '<span style="color:var(--ink-4)">○</span>';
          });
          return ['<b class="sm">'+h(i.t)+'</b>'+
                    '<div class="tiny mono muted">'+h(i.v)+
                    (i.perm ? ' · ' + h(i.perm) : '')+'</div>']
                 .concat(o1)
                 .concat(['<b class="mono" style="color:'+
                    (n === 1 ? 'var(--gita-do-ink)' : (n === dem.length ? 'var(--ok)' : 'var(--ink-2)'))+
                    '">'+n+'</b>']);
        }))+'</div></div>';
  });

  /* ── D · MÀN NHẠY NHẤT ── */
  var hep = man.map(function(m){
    var n = dem.filter(function(d){ return G.vaiThayMan(d.vai.id, m.it); }).length;
    return { it:m.it, n:n };
  }).filter(function(x){ return x.n <= 2; }).sort(function(a,b){ return a.n - b.n; });

  o += U.sec('MÀN HẸP NHẤT — TỪ HAI VAI TRỞ XUỐNG',
    hep.length + ' màn. Đây là chỗ một lần nới quyền nhầm sẽ tốn nhất, nên nó được liệt riêng.');
  o += U.tbl(['Màn','Quyền','Số vai thấy','Những vai nào'],
    hep.map(function(x){
      var ai = dem.filter(function(d){ return G.vaiThayMan(d.vai.id, x.it); })
                  .map(function(d){ return d.vai.short; });
      return ['<b class="sm">'+h(x.it.t)+'</b><div class="tiny mono muted">'+h(x.it.v)+'</div>',
              '<span class="tiny mono">'+h(x.it.perm || '—')+'</span>',
              '<b class="mono" style="color:var(--gita-do-ink)">'+x.n+'</b>',
              '<span class="sm">'+h(ai.join(' · '))+'</span>'];
    }));

  /* ── E · SO SÁNH HAI VAI ── */
  var A = 'R01', B = G.S.ssVai || 'R13';
  var ss = G.soSanhVai(A, B);
  var vB = G.roleById(B) || {};
  o += U.sec('SO SÁNH SUPER ADMIN VỚI MỘT VAI KHÁC',
    'Chọn vai để xem chính xác Super Admin thấy thêm những màn nào');
  o += '<div class="card"><div class="row wrap mb" style="gap:7px">'+
    dem.filter(function(d){ return d.vai.id !== 'R01'; }).map(function(d){
      return '<button class="chip'+(d.vai.id === B ? ' on' : '')+'" data-ssvai="'+h(d.vai.id)+'"'+
             (d.vai.id === B ? ' style="color:'+d.vai.c+';border-color:'+d.vai.c+'"' : '')+'>'+
             h(d.vai.short)+'</button>';
    }).join('')+'</div>'+
    '<div class="grid g4 mb">'+
      U.stat({k:'CẢ HAI CÙNG THẤY', v:ss.caHai, d:'màn chung', c:'#0B7350'})+
      U.stat({k:'CHỈ SUPER ADMIN', v:ss.chiA.length, d:'màn ' + h(vB.short || B) + ' không thấy', c:'#BE0E16'})+
      U.stat({k:'CHỈ ' + h((vB.short || B).toUpperCase()), v:ss.chiB.length, d:'màn Super Admin không thấy', c:'#B45309'})+
      U.stat({k:'TỔNG MÀN', v:ss.tong, d:'toàn hệ', c:'#2A72C6'})+
    '</div>'+
    (ss.chiB.length
      ? '<div class="card" style="border-color:var(--gita-do)"><b class="sm" style="color:var(--gita-do-ink)">'+
        'CÓ MÀN SUPER ADMIN KHÔNG THẤY</b><p class="sm mt">'+
        h(ss.chiB.map(function(i){ return i.t; }).join(' · '))+
        '</p><p class="sm muted mt">Super Admin phải thấy được mọi màn. Đây là lỗi phân quyền, không phải thiết kế.</p></div>'
      : '<p class="sm" style="color:var(--ok)">Không màn nào Super Admin không thấy — đúng như phải thế.</p>')+
    '<div class="mt2"><div class="tiny up muted mb">'+ss.chiA.length+' MÀN CHỈ SUPER ADMIN THẤY, '+
      h(vB.short || B)+' THÌ KHÔNG</div>'+
      '<div class="row wrap" style="gap:6px">'+
      ss.chiA.map(function(i){ return U.chip(i.t); }).join('')+'</div></div>'+
    '</div>';

  return o;
};

/* Chọn vai để so sánh — không đổi vai đang dùng, chỉ đổi bảng so sánh */
document.addEventListener('click', function(e){
  var b = e.target.closest && e.target.closest('[data-ssvai]');
  if(!b) return;
  e.preventDefault();
  G.S.ssVai = b.getAttribute('data-ssvai');
  if(G.save) G.save();
  if(G.render) G.render();
});

})();
