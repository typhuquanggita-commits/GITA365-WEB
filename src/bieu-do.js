/* ═══════════════════════════════════════════════════════════════
   GITA 365 · 9.99.201 — BỘ VẼ BIỂU ĐỒ · SƠ ĐỒ DÒNG CHẢY

   Chủ hệ: "Chữ chỉ 20% — tôi cần NHÌN THẤY dòng chảy công việc; bảng số
   liệu, biểu đồ, sơ đồ." Ba màn điều hành (tài chính · CRM · bộ não) đều
   cần cùng một bộ vẽ, nên gom về một chỗ: sửa một lần, ba màn đổi theo.
   Dựng bản thứ hai của một cái cột là một chỗ để hai màn lệch nhau.

   Ba luật của bộ này:
   1. TẤT CẢ vẽ bằng SVG nội tuyến — chạy trên web lẫn .exe, không tải một
      thư viện nặng nào, và ĐO ĐƯỢC bằng do-khung-man (thẻ thật, chữ thật).
   2. MÀU LẤY TỪ BIẾN THƯƠNG HIỆU (var(--gita…)) — không gõ mã hex, để đổi
      nền sáng/tối là cả biểu đồ đổi theo, không lệch một vệt.
   3. Rộng hơn màn thì CUỘN NGANG trong hộp riêng (overflow-x:auto), không
      đẩy cả trang trượt ngang — luật khổ điện thoại của kho.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var U = G.U, h = U.h;

/* Bảng màu phân loại — họ xanh GITA + hai sắc nhấn. Semantic (ok/đỏ) tách
   riêng, gọi thẳng khi cần, không nằm trong bảng phân loại này.
   Mỗi màu vừa làm chữ trên nền trang vừa làm nền cho chữ đặt lên nó.
   Chữ đặt lên màu dùng token --chu-tren-mau: trắng ở nền Sáng, mực sẫm
   ở nền Tối — vì ở nền Tối cả tám màu đều sáng lên, chữ trắng trên
   chúng chỉ còn 1,7–3,3:1. Đo: nền Sáng tám màu đạt ≥4,5:1 cả hai
   chiều; nền Tối chữ sẫm trên màu đạt ≥5,5:1.
   Bản trước có --gita-sang và --gold-2 — hai tên của CÙNG một xanh nhạt
   (2,91:1): hai nhóm số cùng một màu và cả hai khó đọc (luật TK01). */
U.bdMau = ['var(--gita)','var(--t1)','var(--t2)','var(--ok)',
           '--gita-ink','var(--t3)','var(--warn)','var(--gita-do-ink)'];
function mau(i){ var m = U.bdMau[i % U.bdMau.length]; return m.slice(0,2)==='--' ? 'var('+m+')' : m; }

/* Rút gọn tiền cho nhãn biểu đồ: 1.250.000.000 → "1,25 tỷ" · 450.000 → "450k".
   Nhãn dài làm cột chồng chữ; con số đầy đủ để trong ô số lớn, không lên cột. */
U.bdGon = function(n){
  n = U.num(n); var d = n < 0 ? '-' : ''; n = Math.abs(n);
  if(n >= 1e9)  return d + (n/1e9).toFixed(n>=1e10?0:1).replace('.',',') + ' tỷ';
  if(n >= 1e6)  return d + Math.round(n/1e6) + ' tr';
  if(n >= 1e3)  return d + Math.round(n/1e3) + 'k';
  return d + Math.round(n);
};
U.bdTien = function(n){ return new Intl.NumberFormat('vi-VN').format(Math.round(U.num(n))) + ' đ'; };

/* ─── Ô SỐ LỚN — nhịp đọc đầu tiên của mọi bảng điều hành ───
   o = {k nhãn, v giá trị, d dòng phụ, c màu, xu ±% xu hướng, dat true/false} */
U.bdSo = function(o){
  var c = o.c || 'var(--gita)';
  var xu = '';
  if(typeof o.xu === 'number'){
    var len = o.xu >= 0, mc = (o.tot === false ? !len : len) ? 'var(--ok)' : 'var(--gita-do)';
    xu = '<span class="bd-xu" style="color:'+mc+'">'+(len?'▲':'▼')+' '+
      h(Math.abs(o.xu))+'%</span>';
  }
  return '<div class="bd-so card" style="border-top:3px solid '+c+'">'+
    '<div class="bd-so-k">'+h(o.k)+'</div>'+
    '<div class="bd-so-v" style="color:'+c+'">'+h(o.v)+xu+'</div>'+
    (o.d ? '<div class="bd-so-d">'+h(o.d)+'</div>' : '')+'</div>';
};
U.bdSoHang = function(ds){ return '<div class="bd-so-hang">'+ds.map(U.bdSo).join('')+'</div>'; };

/* ─── CỘT ĐƠN / CỘT ĐÔI ───
   rows = [{nhan, a, b?}] · o = {aTen, bTen, cao, dvi} — b optional = cột đôi. */
U.bdCot = function(rows, o){
  o = o || {}; rows = rows || [];
  var doi = rows.some(function(r){ return r.b != null; });
  var H = o.cao || 190, top = 26, bot = 34, n = rows.length || 1;
  var W = Math.max(300, n * (doi ? 78 : 60));
  var vals = []; rows.forEach(function(r){ vals.push(U.num(r.a)); if(doi) vals.push(U.num(r.b)); });
  var max = Math.max.apply(null, vals.concat([1]));
  var plot = H - top - bot, step = W / n;
  var svg = '<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" ' +
    'preserveAspectRatio="xMinYMid meet" role="img">';
  /* Bốn vạch lưới ngang mờ — cho mắt bám mức, không cần trục số dày chữ. */
  for(var g=1; g<=3; g++){ var gy = top + plot*g/3;
    svg += '<line x1="0" y1="'+gy.toFixed(1)+'" x2="'+W+'" y2="'+gy.toFixed(1)+
      '" stroke="var(--phu-3)" stroke-width="1"/>'; }
  rows.forEach(function(r, i){
    var cx = step*i, bw = doi ? step*0.30 : step*0.5, gap = doi ? step*0.08 : 0;
    var ax = cx + step/2 - (doi ? bw + gap/2 : bw/2);
    function bar(x, v, cl){
      var hh = Math.max(2, plot * U.num(v)/max), y = top + plot - hh;
      return '<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+bw.toFixed(1)+
        '" height="'+hh.toFixed(1)+'" rx="3" fill="'+cl+'"/>'+
        '<text x="'+(x+bw/2).toFixed(1)+'" y="'+(y-5).toFixed(1)+'" text-anchor="middle" '+
        'font-size="10" fill="var(--ink-3)">'+h(U.bdGon(v))+'</text>';
    }
    svg += bar(ax, r.a, 'var(--gita)');
    if(doi) svg += bar(ax + bw + gap, r.b, 'var(--gita-do)');
    svg += '<text x="'+(cx+step/2).toFixed(1)+'" y="'+(H-12)+'" text-anchor="middle" '+
      'font-size="10.5" fill="var(--ink-4)">'+h(r.nhan)+'</text>';
  });
  svg += '</svg>';
  var chu = doi ? '<div class="bd-chu"><span><i style="background:var(--gita)"></i>'+
    h(o.aTen||'A')+'</span><span><i style="background:var(--gita-do)"></i>'+h(o.bTen||'B')+
    '</span></div>' : '';
  return '<div class="bd-box"><div class="bd-cuon">'+svg+'</div>'+chu+'</div>';
};

/* ─── ĐƯỜNG + VÙNG — xu hướng theo thời gian ───
   pts = [{nhan, gia}] */
U.bdDuong = function(pts, o){
  o = o || {}; pts = pts || [];
  var H = o.cao || 170, top = 24, bot = 30, n = pts.length;
  if(n < 2) return '<div class="bd-box"><p class="bd-trong">Chưa đủ điểm để vẽ đường.</p></div>';
  var W = Math.max(300, n * 64), L = 8, R = W - 8;
  var vals = pts.map(function(p){ return U.num(p.gia); });
  var max = Math.max.apply(null, vals), min = Math.min.apply(null, vals.concat([0]));
  var plot = H - top - bot, rng = (max - min) || 1;
  function X(i){ return L + (R-L) * i/(n-1); }
  function Y(v){ return top + plot * (1 - (U.num(v)-min)/rng); }
  var line = '', area = 'M '+X(0).toFixed(1)+' '+(top+plot).toFixed(1);
  pts.forEach(function(p,i){ var x=X(i).toFixed(1), y=Y(p.gia).toFixed(1);
    line += (i?' L ':'M ')+x+' '+y; area += ' L '+x+' '+y; });
  area += ' L '+X(n-1).toFixed(1)+' '+(top+plot).toFixed(1)+' Z';
  var svg = '<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" '+
    'preserveAspectRatio="xMinYMid meet" role="img">'+
    '<defs><linearGradient id="bdg" x1="0" y1="0" x2="0" y2="1">'+
      '<stop offset="0" stop-color="var(--gita)" stop-opacity="0.30"/>'+
      '<stop offset="1" stop-color="var(--gita)" stop-opacity="0.02"/></linearGradient></defs>'+
    '<path d="'+area+'" fill="url(#bdg)"/>'+
    '<path d="'+line+'" fill="none" stroke="var(--gita)" stroke-width="2.5" '+
      'stroke-linejoin="round" stroke-linecap="round"/>';
  pts.forEach(function(p,i){
    svg += '<circle cx="'+X(i).toFixed(1)+'" cy="'+Y(p.gia).toFixed(1)+'" r="3" fill="var(--gita-sau)"/>'+
      '<text x="'+X(i).toFixed(1)+'" y="'+(Y(p.gia)-8).toFixed(1)+'" text-anchor="middle" '+
      'font-size="10.5" fill="var(--ink-3)">'+h(U.bdGon(p.gia))+'</text>'+
      '<text x="'+X(i).toFixed(1)+'" y="'+(H-10)+'" text-anchor="middle" font-size="10" '+
      'fill="var(--ink-4)">'+h(p.nhan)+'</text>';
  });
  svg += '</svg>';
  return '<div class="bd-box"><div class="bd-cuon">'+svg+'</div></div>';
};

/* ─── VÒNG NHIỀU MẢNH + CHÚ DẪN — chia một tổng (hoa hồng, chi phí…) ───
   segs = [{ten, gia, mau?}] */
U.bdVong = function(segs, o){
  o = o || {}; segs = (segs||[]).filter(function(s){ return U.num(s.gia) > 0; });
  var tong = segs.reduce(function(s,x){ return s + U.num(x.gia); }, 0) || 1;
  var r = 52, cx = 66, cy = 66, C = 2*Math.PI*r, off = 0;
  var svg = '<svg viewBox="0 0 132 132" width="132" height="132" role="img">';
  segs.forEach(function(s, i){
    var frac = U.num(s.gia)/tong, len = C*frac;
    svg += '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+(s.mau||mau(i))+
      '" stroke-width="16" stroke-dasharray="'+len.toFixed(1)+' '+(C-len).toFixed(1)+
      '" stroke-dashoffset="'+(-off).toFixed(1)+'" transform="rotate(-90 '+cx+' '+cy+')"/>';
    off += len;
  });
  svg += '<text x="'+cx+'" y="'+(cy-2)+'" text-anchor="middle" font-size="13" font-weight="700" '+
    'fill="var(--ink)">'+h(o.giua||'')+'</text>'+
    '<text x="'+cx+'" y="'+(cy+14)+'" text-anchor="middle" font-size="10.5" '+
    'fill="var(--ink-4)">'+h(o.duoi||'')+'</text></svg>';
  var cd = '<div class="bd-cd">'+segs.map(function(s,i){
    return '<div class="bd-cd-h"><i style="background:'+(s.mau||mau(i))+'"></i>'+
      '<span>'+h(s.ten)+'</span><b>'+Math.round(U.num(s.gia)/tong*100)+'%</b></div>';
  }).join('')+'</div>';
  return '<div class="bd-box bd-vong"><div>'+svg+'</div>'+cd+'</div>';
};

/* ─── PHỄU — các chặng thu hẹp dần, kèm tỷ lệ chuyển ───
   stages = [{ten, so, mau?}] */
U.bdPhieu = function(stages){
  stages = (stages||[]);
  if(!stages.length) return '<div class="bd-box"><p class="bd-trong">Chưa có chặng nào.</p></div>';
  var maxSo = Math.max.apply(null, stages.map(function(s){ return U.num(s.so); }).concat([1]));
  var W = 340, rowH = 46, H = stages.length*rowH + 8;
  var svg = '<svg viewBox="0 0 '+W+' '+H+'" width="100%" height="'+H+'" '+
    'preserveAspectRatio="xMidYMid meet" role="img">';
  stages.forEach(function(s, i){
    var w = Math.max(60, (W-40) * U.num(s.so)/maxSo), x = (W - w)/2, y = i*rowH + 4;
    var wNext = i < stages.length-1 ? Math.max(60,(W-40)*U.num(stages[i+1].so)/maxSo) : w;
    var xNext = (W - wNext)/2;
    var d = 'M '+x+' '+y+' L '+(x+w)+' '+y+' L '+(xNext+wNext)+' '+(y+rowH-6)+
      ' L '+xNext+' '+(y+rowH-6)+' Z';
    svg += '<path d="'+d+'" fill="'+(s.mau||mau(i))+'" opacity="0.90"/>'+
      '<text x="'+(W/2)+'" y="'+(y+rowH/2-3)+'" text-anchor="middle" font-size="11.5" '+
      'font-weight="600" fill="var(--chu-tren-mau)">'+h(s.ten)+' · '+h(U.bdGon(s.so))+'</text>';
    if(i>0){ var tl = Math.round(U.num(s.so)/(U.num(stages[i-1].so)||1)*100);
      svg += '<text x="'+(W-6)+'" y="'+(y+4)+'" text-anchor="end" font-size="10.5" '+
        'fill="var(--ink-4)">'+tl+'%</text>'; }
  });
  svg += '</svg>';
  return '<div class="bd-box">'+svg+'</div>';
};

/* ─── SƠ ĐỒ DÒNG CHẢY — cột việc nối bằng mũi tên: "nhìn thấy dòng chảy" ───
   cols = [{ten, mau?, o:[{t, p?}| 'chuỗi']}] */
U.bdDong = function(cols, o){
  cols = cols || [];
  var html = '<div class="bd-dong">' + cols.map(function(c, i){
    var oc = (c.o||[]).map(function(x){
      var t = typeof x === 'string' ? x : x.t, p = (x && x.p) || '';
      return '<div class="bd-dong-o">'+h(t)+(p?'<span>'+h(p)+'</span>':'')+'</div>';
    }).join('');
    var m = c.mau || mau(i);
    return '<div class="bd-dong-cot">'+
      '<div class="bd-dong-dau" style="background:'+m+'">'+h(c.ten)+'</div>'+
      '<div class="bd-dong-than">'+(oc||'<div class="bd-dong-o bd-dong-trong">—</div>')+'</div>'+
      '</div>' + (i < cols.length-1 ? '<div class="bd-dong-mui">→</div>' : '');
  }).join('') + '</div>';
  return '<div class="bd-box"><div class="bd-cuon">'+html+'</div>'+
    (o && o.chu ? '<p class="bd-ghi">'+h(o.chu)+'</p>' : '')+'</div>';
};

/* ─── HÀNG ĐỢI VIỆC — "việc cần xử lý ngay", vạch mức khẩn bên trái ───
   Mẫu thao tác vận hành: đội nhìn một chỗ là biết làm gì trước. Mỗi việc
   một mức (khan · luuy · nhac), có thể kèm nút hành động. items =
   [{muc, ten, phu, nhan, act?, actNhan?}] */
U.bdViec = function(items, o){
  o = o || {};
  var M = {khan:{c:'var(--gita-do)',n:'khẩn'}, luuy:{c:'var(--warn)',n:'lưu ý'},
           nhac:{c:'var(--gita)',n:'nhắc'}, xong:{c:'var(--ok)',n:'xong'}};
  var body = (items||[]).map(function(v){
    var m = M[v.muc] || M.nhac;
    return '<div class="bd-viec-o" style="--vc:'+m.c+'">'+
      '<div class="bd-viec-noi"><b>'+h(v.ten)+'</b>'+
        (v.phu?'<p>'+h(v.phu)+'</p>':'')+'</div>'+
      (v.act?'<button class="btn sm" data-v="'+h(v.act)+'">'+h(v.actNhan||'Mở')+'</button>'
            :'<span class="bd-viec-nhan" style="color:'+m.c+'">'+h(v.nhan||m.n)+'</span>')+
      '</div>';
  }).join('');
  return '<div class="bd-viec card">'+
    (o.tieuDe?'<div class="bd-viec-h"><b>'+h(o.tieuDe)+'</b>'+
      (o.phu?'<span>'+h(o.phu)+'</span>':'')+'</div>':'')+
    (body||'<p class="bd-trong">Không có việc nào cần xử lý ngay.</p>')+'</div>';
};

/* ─── DẢI TRUNG THỰC — dữ liệu minh hoạ hay số thật ───
   Một bảng số mà không nói con số từ đâu thì người đọc tin cả bảng như
   nhau. Dải này đứng ĐẦU màn, nói thẳng: minh hoạ (chưa nối máy chủ) hay
   số thật (đã nối). Cùng luật mayDo/khai của kho. */
U.bdNguon = function(that){
  if(that) return '<div class="bd-nguon bd-nguon-that">'+U.ic('check','w-4 h-4')+
    '<span><b>Số thật</b> — đọc trực tiếp từ máy chủ Cloudflare.</span></div>';
  return '<div class="bd-nguon bd-nguon-mau">'+U.ic('spark','w-4 h-4')+
    '<span><b>Dữ liệu minh hoạ</b> — đây là bố cục và dòng chảy để anh chị xem trước. '+
    'Nối máy chủ CRM/tài chính thì mọi số ở đây tự thay bằng số thật của Học viện, không dựng số giả.</span></div>';
};

})();
