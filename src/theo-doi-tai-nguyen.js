/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v8.4 — THEO DÕI TÀI NGUYÊN CỦA ĐỘI NGŨ

   Người trong nghề phải mở được kho — đó là việc của họ. Nhưng có một
   khoảng cách giữa "mở nhiều vì làm nhiều" và "gom cả kho về máy mình".
   Khoảng cách ấy không nhìn thấy bằng mắt: cả hai đều là những lần bấm mở
   bình thường, chỉ khác ở tổng lượng và ở nhịp.

   Bản này đo tổng lượng. Luật của anh Quang: một tài khoản chạm quá 20%
   tài nguyên thì Admin hệ thống nhận cảnh báo để theo dõi hành vi.

   Ba điều cố ý làm như vậy:

     · KHÔNG chặn. Chặn một Tư vấn đang làm việc thật giữa buổi tư vấn là
       làm hỏng buổi ấy, và người bị chặn oan sẽ mất lòng tin vào hệ thống.
       Cảnh báo để có người xem, rồi người quyết định — không phải máy.
     · Đếm theo TƯ LIỆU KHÁC NHAU, không đếm số lần bấm. Mở đi mở lại một
       phác đồ hai mươi lần là dấu hiệu của người đang làm việc kỹ, không
       phải dấu hiệu của người đang gom kho.
     · Cửa sổ ba mươi ngày trượt. Gom kho thì gom trong vài buổi; làm việc
       thì trải đều theo tháng.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var U = G.U, h = U && U.h, ic = U && U.ic;
G.VIEWS = G.VIEWS || {};

var KHO = 'gita365_tai_nguyen';
var NGUONG = 0.20;          /* 20% tài nguyên — luật của Học viện */
var CUA_SO_NGAY = 30;

G.NGUONG_TAI_NGUYEN = NGUONG;
G.TAI_NGUYEN = G.TAI_NGUYEN || {};   /* {u: {cham:{key:luc}, canhBao:[], vai:''}} */

function nap(){
  try{
    var v = JSON.parse(localStorage.getItem(KHO) || '{}');
    if(v && typeof v === 'object') G.TAI_NGUYEN = v;
  }catch(e){}
}
function ghi(){
  try{ localStorage.setItem(KHO, JSON.stringify(G.TAI_NGUYEN)); }catch(e){}
  if(G.danhDauCaiDat) G.danhDauCaiDat('tainguyen');
}
nap();

function toi(){ return (G.S && G.S.acc && G.S.acc.u) || ''; }
function laNghe(){ var r = G.S && G.S.roleObj; return !!(r && r.lv <= 12); }

/* Tổng tài nguyên = số bản ghi trong các kho tư liệu đang nạp. */
function tongTaiNguyen(){
  if(G.demKho){ var d = G.demKho(); if(d && d.tong) return d.tong; }
  var n = 0;
  ['MOTHUC','PHACDO','KICHBAN','TINHHUONG','BAIHOC','QUA1000'].forEach(function(k){
    if(Array.isArray(G[k])) n += G[k].length;
  });
  return n || 1;
}

function donCu(cham){
  var han = Date.now() - CUA_SO_NGAY * 864e5, ra = {};
  Object.keys(cham || {}).forEach(function(k){ if(cham[k] > han) ra[k] = cham[k]; });
  return ra;
}

/* ═══════════ GHI MỘT LẦN CHẠM ═══════════
   Gọi từ chỗ mở một tư liệu, xuất một bảng, hoặc gửi một tệp. */
G.chamTaiNguyen = function(loai, ma){
  if(!laNghe()) return null;                 /* gia đình đã có trần 30% riêng */
  var u = toi(); if(!u) return null;
  var k = String(loai) + '·' + String(ma);

  var b = G.TAI_NGUYEN[u] || (G.TAI_NGUYEN[u] = {cham:{}, canhBao:[], vai:''});
  b.vai = (G.S.roleObj && G.S.roleObj.n) || '';
  b.cham = donCu(b.cham);
  var moi = !b.cham[k];
  b.cham[k] = Date.now();

  var so = Object.keys(b.cham).length, tong = tongTaiNguyen();
  var ti = tong ? so / tong : 0;
  b.ti = ti; b.so = so; b.tong = tong;

  /* Vượt ngưỡng: ghi MỘT cảnh báo cho mỗi lần vượt, không dội mỗi lần bấm */
  if(ti >= NGUONG){
    var cuoi = b.canhBao[b.canhBao.length - 1];
    var daBao = cuoi && (Date.now() - new Date(cuoi.luc).getTime() < 864e5);   /* trong 24 giờ */
    if(!daBao){
      b.canhBao.push({
        luc: new Date().toISOString(), u: u, vai: b.vai,
        so: so, tong: tong, ti: Math.round(ti * 1000) / 10,
        xem: false
      });
      if(G.secLog) G.secLog('Vượt ngưỡng tài nguyên',
        u + ' đã chạm ' + so + '/' + tong + ' tư liệu (' + Math.round(ti * 100) + '%) trong ' +
        CUA_SO_NGAY + ' ngày — trên ngưỡng ' + Math.round(NGUONG * 100) + '%. Đã báo Admin hệ thống.',
        'Cảnh báo');
    }
  }
  if(moi) ghi();
  return {so: so, tong: tong, ti: ti, vuot: ti >= NGUONG};
};

G.tinhTaiNguyen = function(u){
  var b = G.TAI_NGUYEN[u || toi()];
  if(!b) return {so:0, tong:tongTaiNguyen(), ti:0, vuot:false, canhBao:[]};
  var cham = donCu(b.cham), so = Object.keys(cham).length, tong = tongTaiNguyen();
  return {so:so, tong:tong, ti: tong ? so/tong : 0, vuot: tong ? (so/tong) >= NGUONG : false,
          canhBao: b.canhBao || [], vai: b.vai || ''};
};

G.canhBaoTaiNguyen = function(){
  var ra = [];
  Object.keys(G.TAI_NGUYEN).forEach(function(u){
    (G.TAI_NGUYEN[u].canhBao || []).forEach(function(c){ ra.push(c); });
  });
  return ra.sort(function(a,b){ return new Date(b.luc) - new Date(a.luc); });
};

G.danhDauDaXem = function(luc){
  Object.keys(G.TAI_NGUYEN).forEach(function(u){
    (G.TAI_NGUYEN[u].canhBao || []).forEach(function(c){ if(c.luc === luc) c.xem = true; });
  });
  ghi();
};

/* ═══════════════════════════════════════════════════════════════
   MÀN HÌNH · THEO DÕI HÀNH VI TÀI NGUYÊN — R01 · R02
   ═══════════════════════════════════════════════════════════════ */
G.VIEWS['theo-doi-tai-nguyen'] = function(){
  var o = U.ph({eyebrow:'QUẢN TRỊ TRANG', ic:'chart', grad:1,
    t:'Theo dõi tài nguyên của đội ngũ',
    lead:'Một tài khoản chạm quá ' + Math.round(NGUONG*100) + '% kho trong ' + CUA_SO_NGAY +
         ' ngày thì hiện ở đây. Đây là cảnh báo để có người xem, không phải lệnh chặn — '+
         'máy không đủ dữ kiện để phân biệt người làm nhiều với người gom kho.'});

  var ds = Object.keys(G.TAI_NGUYEN).map(function(u){
    var t = G.tinhTaiNguyen(u); t.u = u; return t;
  }).sort(function(a,b){ return b.ti - a.ti; });

  var vuot = ds.filter(function(x){ return x.vuot; });
  var chuaXem = G.canhBaoTaiNguyen().filter(function(c){ return !c.xem; });

  o += '<div class="row wrap mt2" style="gap:12px">'+
    [[String(ds.length), 'TÀI KHOẢN ĐANG THEO DÕI', 'var(--gita)'],
     [String(vuot.length), 'ĐANG TRÊN NGƯỠNG', vuot.length ? 'var(--gita-do)' : 'var(--ok)'],
     [String(chuaXem.length), 'CẢNH BÁO CHƯA XEM', chuaXem.length ? 'var(--gita-do)' : 'var(--ok)'],
     [Math.round(NGUONG*100) + '%', 'NGƯỠNG CỦA HỌC VIỆN', 'var(--gita-sau)']]
    .map(function(x){
      return '<div class="card" style="flex:1;min-width:150px;text-align:center">'+
        '<b style="font-size:26px;color:'+x[2]+'">'+h(x[0])+'</b>'+
        '<div class="tiny up muted mt">'+h(x[1])+'</div></div>';
    }).join('')+'</div>';

  o += U.sec('MỨC DÙNG TÀI NGUYÊN', ds.length ? ds.length + ' tài khoản' : 'Chưa có dữ liệu');
  if(!ds.length){
    o += G.khungTrong({
      ten:'Mức dùng tài nguyên', ic:'chart',
      seCo:'Mỗi tài khoản trong đội ngũ, số tư liệu KHÁC NHAU đã chạm trong 30 ngày, và tỉ lệ trên tổng kho. '+
           'Ai vượt ' + Math.round(NGUONG*100) + '% thì hiện cảnh báo kèm mốc thời gian.',
      khiNao:'Số liệu bắt đầu tích ngay khi một người trong đội ngũ tra kho lần đầu.',
      aiLam:'Máy đếm tự động. Chỉ Super Admin và Admin hệ thống xem được bảng này.',
      viSao:'Có một khoảng cách giữa "mở nhiều vì làm nhiều" và "gom cả kho về máy mình". '+
            'Khoảng cách ấy không nhìn thấy bằng mắt — cả hai đều là những lần bấm mở bình thường. '+
            'Chỉ tổng lượng và nhịp mới phân biệt được.',
      viDu:{tieu:'Một dòng cảnh báo trông như thế này', dong:[
        ['Tài khoản','tuvan@gita365.vn · Tư vấn'],
        ['Đã chạm','341 / 1.526 tư liệu khác nhau'],
        ['Tỉ lệ','22,3% — trên ngưỡng ' + Math.round(NGUONG*100) + '%'],
        ['Trong','30 ngày gần nhất'],
        ['Việc của Admin','Mở nhật ký xem NHỊP: trải đều theo tuần, hay dồn trong vài buổi']
      ]},
      lam:[{t:'Mở nhật ký hệ thống', v:'nhat-ky-ht'},
           {t:'Xem bảng phân quyền', v:'phan-quyen'}],
      ghi:'Trên ngưỡng không có nghĩa là làm sai. Gọi một cuộc hỏi trước khi kết luận.'
    });
  } else {
    o += U.tbl(['Tài khoản','Vai','Đã chạm','Tỉ lệ','Tình trạng'], ds.map(function(x){
      var pt = Math.round(x.ti * 1000) / 10;
      return [
        '<span class="mono sm">'+h(x.u)+'</span>',
        '<span class="sm">'+h(x.vai || '—')+'</span>',
        '<b class="mono">'+x.so.toLocaleString('vi-VN')+'</b>'+
          '<span class="tiny muted"> / '+x.tong.toLocaleString('vi-VN')+'</span>',
        '<b style="color:'+(x.vuot ? 'var(--gita-do)' : 'var(--ok)')+'">'+pt+'%</b>',
        x.vuot ? '<span class="chip" style="color:var(--gita-do-ink)">'+ic('bell','w-3 h-3')+' Trên ngưỡng</span>'
               : '<span class="tiny" style="color:var(--ok)">Bình thường</span>'
      ];
    }));
  }

  var cb = G.canhBaoTaiNguyen();
  if(cb.length){
    o += U.sec('NHẬT KÝ CẢNH BÁO', cb.length + ' lượt');
    o += U.tbl(['Lúc','Tài khoản','Mức chạm',''], G.dsHet(cb,30).map(function(c){
      return [
        '<span class="tiny">'+h(new Date(c.luc).toLocaleString('vi-VN'))+'</span>',
        '<span class="mono sm">'+h(c.u)+'</span><div class="tiny muted">'+h(c.vai||'')+'</div>',
        '<b style="color:var(--gita-do-ink)">'+c.ti+'%</b>'+
          '<span class="tiny muted"> · '+c.so+'/'+c.tong+'</span>',
        c.xem ? '<span class="tiny muted">đã xem</span>'
              : '<button class="btn sm" data-tnxem="'+h(c.luc)+'">Đánh dấu đã xem</button>'
      ];
    }));
  }

  o += '<div class="card mt2" style="border-color:var(--gita-vien-1)">'+
    '<b>'+ic('shield','w-4 h-4')+' Cảnh báo này nghĩa là gì</b>'+
    '<p class="sm dim mt" style="line-height:1.7">Trên ngưỡng KHÔNG có nghĩa là làm sai. Một Tư vấn '+
    'đang chạy nhiều ca cùng lúc hoàn toàn có thể chạm tới ngần ấy tư liệu. Việc của Admin là mở nhật ký '+
    'ra xem NHỊP: người làm việc thì trải đều theo tuần, người gom kho thì dồn trong vài buổi. '+
    'Nếu thấy dồn, hãy gọi một cuộc — hỏi trước khi kết luận.</p>'+
    '<button class="btn ghost mt" data-v="nhat-ky-ht">'+ic('arrow','w-4 h-4')+'Mở nhật ký hệ thống</button></div>';

  return o;
};

document.addEventListener('click', function(e){
  var b = e.target.closest && e.target.closest('[data-tnxem]');
  if(!b) return;
  G.danhDauDaXem(b.getAttribute('data-tnxem'));
  if(G.U) G.U.toast('Đã đánh dấu là đã xem.','ok');
  if(G.render) G.render();
});

})();
