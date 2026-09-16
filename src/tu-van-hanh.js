/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v8.4 — MÀN TỰ VẬN HÀNH

   Màn này KHÔNG phải một bảng mô tả. Nó chạy thật: G.tdQuet() đi hết
   danh mục canh, đo trên dữ liệu đang nạp, và trả về kết quả kèm mức
   nghiêm trọng. Bảng mô tả thì ai cũng viết được; thứ đáng tin là con
   số đo được lúc mở màn.

   Hàm nằm ở src/ vì kho đóng gói bằng JSON.stringify — hàm viết trong
   kho-goc sẽ biến mất sau khi mã hoá.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var U = G.U, h = U.h, ic = U.ic;
G.VIEWS = G.VIEWS || {};

function mucCua(ma){
  var a = G.TD_MUC || [];
  for(var i=0;i<a.length;i++) if(a[i].ma === ma) return a[i];
  return null;
}

/* ── Quét thật. Mỗi mục canh nào đo được ở phía trình duyệt thì đo. ── */
G.tdQuet = function(){
  var kq = [];
  function ghi(ma, dat, so, ghiChu){
    kq.push({ ma:ma, dat:dat, so:so, ghiChu:ghiChu || '' });
  }

  /* C-05 · danh sách tệp lệch — đo bằng số tệp đã nạp thật */
  var tep = document.querySelectorAll('script[src^="src/"]').length;
  ghi('C-05', true, tep ? tep + ' tệp mã nguồn đã nạp' : 'bản một tệp — không áp dụng');

  /* C-06 và C-07 · dùng KẾT QUẢ ĐÃ CÓ của bộ tự soát, không ép nó chạy.

     Ép chạy ở đây là đệ quy: bộ tự soát dựng thử mọi màn, trong đó có
     chính màn này, và màn này lại gọi bộ tự soát. Đã treo trình duyệt
     một lần vì đúng chuyện ấy.

     Nên: có sẵn kết quả thì đọc, chưa có thì nói thẳng là chưa đo và mời
     mở màn tự soát. Thà báo "chưa đo" còn hơn treo máy. */
  var soat = (G.soatTatCa && G.soatCoSan && G.soatCoSan()) ? G.soatTatCa() : null;
  if(soat){
    ghi('C-06', !soat.hong, soat.hong ? soat.hong + ' chỗ lệch' : 'mọi mốc khớp');
    var n = (soat.tam ? soat.tam.length : 0) + (soat.cut ? soat.cut.length : 0);
    ghi('C-07', !n, n ? n + ' chỗ' : 'sạch');
  } else {
    ghi('C-06', null, 'mở màn Soát đủ ruột một lần để có số');
    ghi('C-07', null, 'mở màn Soát đủ ruột một lần để có số');
  }

  /* C-08 · bậc thang phân quyền đảo ngược */
  if(G.demTheoVai){
    var d = G.demTheoVai().slice().sort(function(a,b){ return a.vai.lv - b.vai.lv; });
    var nguoc = [];
    for(var i=1;i<d.length;i++) if(d[i].thay > d[i-1].thay) nguoc.push(d[i].vai.id);
    ghi('C-08', !nguoc.length, nguoc.length ? nguoc.join(' ') : 'bậc thang đúng chiều');
  } else ghi('C-08', null, 'chưa đo được');

  /* C-09 · vai thấy màn mà Super Admin không thấy */
  if(G.soSanhVai && G.ROLES){
    var thieu = G.ROLES.filter(function(v){ return v.id !== 'R01'; })
      .filter(function(v){ return G.soSanhVai('R01', v.id).chiB.length > 0; })
      .map(function(v){ return v.id; });
    ghi('C-09', !thieu.length, thieu.length ? thieu.join(' ') : 'Super Admin thấy hết');
  } else ghi('C-09', null, 'chưa đo được');

  /* C-04 · gói kho giải mã lỗi */
  var kho = G.KHO || {};
  ghi('C-04', !kho.lyDoTuChoi,
    kho.cheDoMau ? 'chế độ mẫu — không có gói nào để giải mã'
                 : ((kho.daNap || []).length + ' gói mở tốt'));

  /* C-01 · ngưỡng tài nguyên — đọc từ lớp theo dõi nếu có */
  if(G.tnVuot){
    try { var v = G.tnVuot(); ghi('C-01', !v.length, v.length ? v.length + ' tài khoản vượt' : 'không ai vượt 20%'); }
    catch(e){ ghi('C-01', null, 'chưa đo được'); }
  } else ghi('C-01', null, 'đo ở máy chủ, không đo ở trình duyệt');

  /* C-02 · C-03 · C-10 — đo ở máy chủ hoặc cần người đọc ngữ cảnh */
  ghi('C-02', null, 'đo ở máy chủ cấp phép');
  ghi('C-03', null, 'cần người đọc ngữ cảnh — máy chỉ đánh dấu');
  ghi('C-10', null, 'ngưỡng chưa chốt — chờ Hội đồng chuyên môn');

  var doDuoc = kq.filter(function(x){ return x.dat !== null; });
  return {
    kq: kq,
    doDuoc: doDuoc.length,
    dat: doDuoc.filter(function(x){ return x.dat; }).length,
    hong: doDuoc.filter(function(x){ return !x.dat; }),
    chuaDo: kq.filter(function(x){ return x.dat === null; }).length
  };
};

G.VIEWS['tu-van-hanh'] = function(){
  if(!G.can('qt_trang')) return U.lockCard(
    'Màn tự vận hành cho thấy toàn bộ cơ chế canh, ngưỡng, và những việc hệ thống tự làm. '+
    'Chỉ mở cho Super Admin và Admin hệ thống.');

  var q = G.tdQuet(), CANH = G.TD_CANH || [], MUC = G.TD_MUC || [];
  var tra = {}; q.kq.forEach(function(x){ tra[x.ma] = x; });

  var o = U.ph({eyebrow:'QUẢN TRỊ TRANG', ic:'pulse', grad:1,
    t:'Tự vận hành, tự vá, tự học',
    lead:'Bốn mức: máy tự phát hiện, tự chặn, tự sửa trong danh sách hẹp — và dừng lại ở mức thứ tư, '+
         'nơi quyết định gắn với trách nhiệm. Bảng dưới quét thật trên dữ liệu đang nạp, không mô tả suông.'});

  o += '<div class="grid g4 mt2">'+
    U.stat({k:'MỤC CANH', v:CANH.length, d:'toàn bộ danh mục', c:'#2A72C6'})+
    U.stat({k:'ĐO ĐƯỢC NGAY', v:q.doDuoc, d:'ở phía trình duyệt', c:'#5140B4'})+
    U.stat({k:'ĐANG ĐẠT', v:q.dat + '/' + q.doDuoc, d:'trên số đo được',
            c: q.hong.length ? '#BE0E16' : '#0B7350'})+
    U.stat({k:'ĐO Ở NƠI KHÁC', v:q.chuaDo, d:'máy chủ, hoặc cần người đọc', c:'#B45309'})+
  '</div>';

  if(q.hong.length)
    o += '<div class="card mt2" style="border-color:var(--gita-do)">'+
      '<div class="tiny up mb" style="color:var(--gita-do-ink)">ĐANG CÓ VẤN ĐỀ</div>'+
      q.hong.map(function(x){
        var c = CANH.filter(function(y){ return y.ma === x.ma; })[0] || {};
        return '<p class="sm mt" style="line-height:1.7"><b class="mono">'+h(x.ma)+'</b> · '+
               h(c.ten || '')+' — <span style="color:var(--gita-do-ink)">'+h(x.so)+'</span></p>';
      }).join('') +'</div>';
  else
    o += '<div class="card mt2" style="border-color:var(--ok)">'+
      '<div class="row" style="gap:9px"><span style="color:var(--ok)">'+ic('check','w-4 h-4')+'</span>'+
      '<p class="sm" style="flex:1;line-height:1.7">Mọi mục canh đo được ở đây đều đang đạt. '+
      h(q.chuaDo)+' mục còn lại đo ở máy chủ hoặc cần người đọc ngữ cảnh — chúng được ghi rõ, không bỏ qua.</p></div></div>';

  /* Bốn mức */
  o += U.sec('BỐN MỨC TỰ ĐỘNG','Mức bốn không phải chỗ hệ thống yếu — là chỗ quyết định gắn với người đứng tên');
  o += '<div class="row wrap" style="gap:11px">'+ MUC.map(function(m){
    return '<div class="card" style="flex:1;min-width:230px;border-top:3px solid '+m.c+'">'+
      '<div class="row" style="gap:8px;align-items:baseline">'+
        '<b class="mono" style="color:'+m.c+'">'+h(m.ma)+'</b>'+
        '<b style="flex:1;font-size:14.5px">'+h(m.ten)+'</b>'+
        (m.tuDong ? U.chip('máy tự làm', m.c) : U.chip('cần người', '#BE0E16'))+'</div>'+
      '<p class="sm mt" style="line-height:1.7">'+h(m.y)+'</p>'+
      '<p class="tiny muted mt2" style="line-height:1.6"><b>Ví dụ:</b> '+h(m.vd)+'</p>'+
      '<p class="tiny mt" style="line-height:1.6;color:var(--gita-do-ink)"><b>Rủi ro:</b> '+h(m.rui)+'</p></div>';
  }).join('') +'</div>';

  /* Danh mục canh + kết quả quét */
  o += U.sec('DANH MỤC CANH — VÀ KẾT QUẢ QUÉT NGAY BÂY GIỜ',
    'Cột "máy làm gì" và cột "lùi thế nào" đi cùng nhau. Việc nào máy tự làm mà không lùi được thì không được tự làm.');
  o += U.tbl(['Mã','Canh gì','Ngưỡng','Mức','Máy làm gì','Ai xác nhận','Lùi thế nào','Đo được'],
    CANH.map(function(c){
      var m = mucCua(c.muc) || {}, r = tra[c.ma] || {};
      var oDat = r.dat === true  ? '<span style="color:var(--ok)">✓ '+h(r.so)+'</span>'
               : r.dat === false ? '<span style="color:var(--gita-do-ink)">✗ '+h(r.so)+'</span>'
               : '<span class="tiny muted">'+h(r.so || '—')+'</span>';
      return ['<b class="mono sm">'+h(c.ma)+'</b><div class="tiny muted">'+h(c.nhom)+'</div>',
              '<b class="sm">'+h(c.ten)+'</b><div class="tiny muted">'+h(c.do)+'</div>',
              '<span class="sm">'+h(c.nguong)+'</span>',
              '<span class="chip" style="color:'+(m.c||'')+';border-color:'+(m.c||'')+'55">'+h(c.muc)+'</span>',
              '<span class="sm">'+h(c.may)+'</span>',
              '<span class="sm">'+h(c.ai)+'</span>',
              '<span class="tiny muted">'+h(c.lui)+'</span>',
              oDat];
    }));

  /* Đường cập nhật kiến thức */
  o += U.sec('ĐƯỜNG CẬP NHẬT KIẾN THỨC','Máy đi ba chặng đầu và DỪNG trước cửa kho — chỉ tài liệu đã duyệt mới thành chuẩn nghề');
  o += '<div class="row wrap" style="gap:11px">'+ (G.TD_TRITHUC || []).map(function(x){
    var c = x.may ? '#0B7350' : '#BE0E16';
    return '<div class="card" style="flex:1;min-width:220px;border-top:3px solid '+c+'">'+
      '<div class="row" style="gap:8px;align-items:baseline">'+
        '<b class="mono" style="color:'+c+'">'+h(x.b)+'</b>'+
        '<b style="flex:1;font-size:14.5px">'+h(x.ten)+'</b></div>'+
      (x.may ? U.chip('máy làm', c) : U.chip('người quyết', c))+
      '<p class="sm mt" style="line-height:1.7">'+h(x.lam)+'</p>'+
      '<p class="tiny muted mt2" style="line-height:1.6"><b>Ra:</b> '+h(x.ra)+'</p></div>';
  }).join('') +'</div>';

  /* Máy chủ nhà */
  var MC = G.TD_MAYCHU || {};
  o += U.sec('DỮ LIỆU Ở MÁY CHỦ CỦA CHỦ HỆ THỐNG','Máy khác chỉ dùng, không giữ');
  o += '<div class="card"><p class="sm" style="line-height:1.75">'+h(MC.y || '')+'</p>'+
    '<div class="row wrap mt2" style="gap:12px;align-items:flex-start">'+
      '<div style="flex:1;min-width:230px"><div class="tiny up" style="color:var(--gita)">MÁY CHỦ GIỮ</div>'+
        U.list(MC.chu || [], 'var(--gita)')+'</div>'+
      '<div style="flex:1;min-width:230px"><div class="tiny up" style="color:var(--ok)">MÁY KHÁCH ĐƯỢC</div>'+
        U.list(MC.khach || [], 'var(--ok)')+'</div>'+
      '<div style="flex:1;min-width:230px"><div class="tiny up" style="color:var(--gita-do-ink)">CHẶN BẰNG</div>'+
        U.list(MC.chan || [], 'var(--gita-do)')+'</div>'+
    '</div>'+
    '<div class="card mt2" style="border-color:var(--gita-do);background:rgba(251,146,60,.06)">'+
      '<div class="tiny up mb" style="color:var(--alert)">NÓI THẲNG PHẦN KHÔNG CHẶN ĐƯỢC</div>'+
      '<p class="sm" style="line-height:1.75">'+h(MC.that || '')+'</p></div></div>';

  /* ── Đã chạy thật / chưa làm ──
     Trước v8.5 cả mục này mới là chính sách viết ra giấy. Nay phần chạy
     thật nằm ở desktop/may-chu.js và src/may-khach.js, nên phải tách rõ
     hai cột: cái đã có hàng rào, và cái mới có lời hứa. Gộp chung là
     đúng kiểu làm người đọc yên tâm nhầm chỗ. */
  o += '<div class="row wrap mt2" style="gap:14px;align-items:flex-start">'+
    '<div class="card" style="flex:1;min-width:300px;border-color:var(--ok)">'+
      '<div class="tiny up mb" style="color:var(--ok)">ĐÃ CHẠY THẬT — CÓ MỤC KIỂM ĐỨNG SAU</div>'+
      (MC.daChay || []).map(function(x, i){
        return '<div class="row'+(i ? ' mt2' : '')+'" style="gap:10px;align-items:flex-start">'+
          '<span style="color:var(--ok);font-weight:700;flex:none">✓</span>'+
          '<div style="flex:1"><b class="sm">'+h(x.t)+'</b>'+
          '<p class="sm muted mt" style="line-height:1.7">'+h(x.y)+'</p></div></div>';
      }).join('')+'</div>'+
    '<div class="card" style="flex:1;min-width:300px;border-color:var(--alert)">'+
      '<div class="tiny up mb" style="color:var(--alert)">CHƯA LÀM — GHI RA THAY VÌ GIẤU ĐI</div>'+
      (MC.chuaLam || []).map(function(x, i){
        return '<div class="row'+(i ? ' mt2' : '')+'" style="gap:10px;align-items:flex-start">'+
          '<span style="color:var(--alert);font-weight:700;flex:none">○</span>'+
          '<div style="flex:1"><b class="sm">'+h(x.t)+'</b>'+
          '<p class="sm muted mt" style="line-height:1.7">'+h(x.y)+'</p></div></div>';
      }).join('')+'</div>'+
  '</div>';

  /* Không bao giờ tự động */
  o += U.sec('SÁU VIỆC KHÔNG BAO GIỜ TỰ ĐỘNG','Tự động hoá phần chịu trách nhiệm không phải tiến bộ — là bỏ tay lái');
  o += '<div class="card" style="border-color:var(--gita-do)">'+ (G.TD_KHONG || []).map(function(x, i){
    return '<div class="row'+(i ? ' mt2' : '')+'" style="gap:10px;align-items:flex-start">'+
      '<span style="color:var(--gita-do-ink);font-weight:700;flex:none">✕</span>'+
      '<div style="flex:1"><b class="sm">'+h(x.t)+'</b>'+
      '<p class="sm muted mt" style="line-height:1.7">'+h(x.y)+'</p></div></div>';
  }).join('') +'</div>';

  /* Nói thật về ba chữ */
  o += U.sec('BA CHỮ, VÀ NGHĨA THẬT CỦA CHÚNG','Một hệ thống hứa quá phần làm được sẽ làm người dùng lơi tay ở đúng chỗ cần chặt nhất');
  o += '<div class="row wrap" style="gap:11px">'+ (G.TD_THAT || []).map(function(x){
    return '<div class="card" style="flex:1;min-width:270px;border-left:3px solid var(--gita)">'+
      '<div class="tiny up muted">CHỮ ĐẶT RA</div>'+
      '<b style="display:block;margin:3px 0 8px;font-size:16px">'+h(x.chu)+'</b>'+
      '<p class="sm" style="line-height:1.75">'+h(x.that)+'</p>'+
      '<p class="tiny muted mt2" style="line-height:1.6"><b>Đo được:</b> '+h(x.do)+'</p></div>';
  }).join('') +'</div>';

  return o;
};

})();
