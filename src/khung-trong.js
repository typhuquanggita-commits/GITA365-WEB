/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v8.6 — KHUNG CHO MÀN CHƯA CÓ DỮ LIỆU

   Một màn hình trống là chỗ mất lòng tin nhanh nhất. Người dùng mở ra,
   thấy một dòng "chưa có dữ liệu", và kết luận: hệ thống này chưa làm
   xong. Họ không sai — chúng ta đã để họ tự đoán.

   Bịa dữ liệu giả để lấp cho đầy thì tệ hơn nữa: người ta tin vào con số
   không có thật, rồi ra quyết định trên đó.

   Đường thứ ba, và là đường bản này đi: màn trống phải TỰ GIẢI THÍCH.
   Năm phần, không phần nào thừa:

     1. Chỗ này rồi sẽ có gì
     2. Nó xuất hiện khi nào, do ai làm
     3. Vì sao phần này quan trọng — nếu bỏ thì hỏng ở đâu
     4. Một ví dụ thật, ghi rõ là ví dụ
     5. Việc anh chị làm ngay bây giờ để nó có dữ liệu

   Sau năm phần ấy, người mở ra không còn thấy trống. Họ thấy một chỗ đã
   được chuẩn bị sẵn, đang đợi đúng một việc của họ.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var U = G.U, h = U.h, ic = U.ic;

/**
 * o = {
 *   ten     : 'Minh chứng nhiệm vụ',
 *   ic      : 'check',
 *   seCo    : 'Ảnh, báo cáo và ghi chép các nhà gửi lên...',
 *   khiNao  : 'Ngay khi một gia đình nộp minh chứng đầu tiên.',
 *   aiLam   : 'Phụ huynh và học viên nộp · Coach và giáo viên xác nhận.',
 *   viSao   : 'Không có minh chứng thì...',
 *   viDu    : {tieu:'Ví dụ một bản ghi', dong:[['Nhà','Nhà Minh An'],...]},
 *   lam     : [{t:'Nộp minh chứng đầu tiên', v:'minh-chung'}, ...],
 *   soLieu  : [{k:'ĐANG CÓ', v:'0', d:'bản ghi'}]
 * }
 */
G.khungTrong = function(o){
  o = o || {};
  var c = 'var(--gita)';

  var s = '<div class="card mt2" style="border-color:var(--gita-vien-1);background:var(--gita-mo-1)">'+
    '<div class="row" style="gap:11px;align-items:center">'+
      '<span style="width:42px;height:42px;border-radius:14px;display:grid;place-items:center;'+
        'background:var(--gita-mo-2);color:'+c+'">'+ic(o.ic || 'seed','w-5 h-5')+'</span>'+
      '<div><b style="font-size:16px">Chỗ này đã sẵn sàng, chỉ chưa có dữ liệu</b>'+
      '<div class="tiny muted mt">Không phải phần chưa làm xong — là phần đang đợi đúng một việc</div></div>'+
    '</div>';

  if(o.seCo)
    s += '<div class="mt2"><div class="tiny up mb" style="color:var(--gita-ink)">RỒI SẼ CÓ GÌ Ở ĐÂY</div>'+
      '<p class="sm" style="line-height:1.7">'+h(o.seCo)+'</p></div>';

  s += '<div class="row wrap mt2" style="gap:12px">';
  if(o.khiNao)
    s += '<div style="flex:1;min-width:230px;border-left:2px solid '+c+';padding-left:11px">'+
      '<div class="tiny up mb" style="color:'+c+'">XUẤT HIỆN KHI NÀO</div>'+
      '<p class="sm" style="line-height:1.6">'+h(o.khiNao)+'</p></div>';
  if(o.aiLam)
    s += '<div style="flex:1;min-width:230px;border-left:2px solid '+c+';padding-left:11px">'+
      '<div class="tiny up mb" style="color:'+c+'">AI LÀM RA NÓ</div>'+
      '<p class="sm" style="line-height:1.6">'+h(o.aiLam)+'</p></div>';
  s += '</div>';

  if(o.viSao)
    s += '<div class="mt2" style="border-left:2px solid var(--gita-do);padding-left:11px">'+
      '<div class="tiny up mb" style="color:var(--gita-do-ink)">BỎ QUA THÌ HỎNG Ở ĐÂU</div>'+
      '<p class="sm" style="line-height:1.65">'+h(o.viSao)+'</p></div>';

  s += '</div>';

  /* Ví dụ — ghi RÕ là ví dụ, đóng khung khác hẳn để không ai nhầm là số thật */
  if(o.viDu && o.viDu.dong && o.viDu.dong.length){
    s += '<div class="card mt2" style="border-style:dashed;border-color:var(--line)">'+
      '<div class="row" style="gap:8px;align-items:center;margin-bottom:10px">'+
        '<span class="chip" style="color:var(--ink-4)">'+ic('quote','w-3 h-3')+' VÍ DỤ MINH HOẠ</span>'+
        '<span class="tiny muted">'+h(o.viDu.tieu || 'Một bản ghi trông như thế này')+
        ' — đây KHÔNG phải dữ liệu thật của Học viện</span></div>'+
      U.tbl(['Trường','Nội dung'], o.viDu.dong.map(function(d){
        return ['<b class="sm">'+h(d[0])+'</b>', '<span class="sm">'+h(d[1])+'</span>'];
      }))+'</div>';
  }

  /* Việc làm ngay */
  if(o.lam && o.lam.length){
    s += '<div class="card mt2" style="border-color:'+c+'">'+
      '<div class="up mb" style="color:var(--gita-ink)">'+ic('arrow','w-4 h-4')+' LÀM NGAY BÂY GIỜ</div>'+
      '<div class="row wrap" style="gap:9px">'+ o.lam.map(function(x, i){
        return '<button class="btn '+(i === 0 ? 'pri' : 'ghost')+'"'+
          (x.v ? ' data-v="'+h(x.v)+'"' : '')+
          (x.act ? ' data-act="'+h(x.act)+'"' : '')+'>'+h(x.t)+'</button>';
      }).join('') +'</div>'+
      (o.ghi ? '<p class="tiny muted mt">'+h(o.ghi)+'</p>' : '')+
    '</div>';
  }

  return s;
};

/* Khung gọn hơn cho các chỗ nhỏ trong một màn đã có nội dung khác */
G.khungTrongGon = function(ten, seCo, lam){
  return '<div class="card" style="border-color:var(--gita-vien-1);background:var(--gita-mo-1)">'+
    '<div class="row" style="gap:9px;align-items:baseline;flex-wrap:wrap">'+
      ic('seed','w-4 h-4')+'<b class="sm">'+h(ten)+' — chưa có bản ghi nào</b></div>'+
    '<p class="sm dim mt" style="line-height:1.65">'+h(seCo)+'</p>'+
    (lam ? '<button class="btn sm mt"'+(lam.v ? ' data-v="'+h(lam.v)+'"' : '')+
           (lam.act ? ' data-act="'+h(lam.act)+'"' : '')+'>'+h(lam.t)+'</button>' : '')+
  '</div>';
};

})();
