/* ═══════════════════════════════════════════════════════════════
   GITA 365 — HỆ ĐIỀU HÀNH COACH · PHÂN TÍCH KHÁCH HÀNG (coach-pt)

   Soi một gia đình trước khi chọn đường đi:

     Hồ sơ nhà → Vấn đề (20 mục theo bốn trụ G–I–T–A) → Nhu cầu (12 mục,
     quan trọng × gấp) → Tiềm năng (8 chiều) & mức sẵn sàng (5 mức)
       → Kết quả: hồ sơ G–I–T–A, ma trận ưu tiên, tầng đề xuất,
         chương trình & giải pháp gợi ý, rủi ro → So sánh trước / sau.

   Mọi con số tính bằng G.CO.phanTich (coach-loi.js) — màn này không tự
   viết công thức. Máy GỢI Ý, Coach QUYẾT. Mỗi lần lưu giữ một mốc trong
   lichSu (mốc trong cùng ngày gộp làm một; nút "Chốt mốc" tách mốc mới)
   để so trước / sau. Hồ sơ phân tích là dữ liệu nhạy cảm: chỉ nằm trong
   sổ Coach trên máy này, gắn tên chủ sổ.

   Mở cho pro_consult (R01–R11, gồm Tư vấn · Assessor · Mentor).
   Không đụng máy chủ · giấy phép · mã hoá.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic, CO = G.CO;
  var VIEW = 'coach-pt';
  var MUC = ['Không','Nhẹ','Rõ','Nặng'];
  var MUC_TN = ['Chưa có','Ít','Khá','Mạnh'];
  var MUC_NC = ['0','1','2','3'];
  /* Nhu cầu ↔ vấn đề liên quan — chỉ để đặt nhu cầu lên ma trận ưu tiên
     (trục "vấn đề nặng"); không đổi công thức phanTich. */
  var NC_VD = {
    'ket-qua':['t-hong-goc','t-phuong-phap','g-ngan-han'], 'thoi-quen':['a-tri-hoan','a-nep-nha'],
    'dong-luc':['i-dong-luc','i-buong'], 'dinh-huong':['g-dinh-huong','g-mo-ho'],
    'ket-noi':['a-xung-dot','g-lech'], 'thiet-bi':['a-thiet-bi'], 'cam-xuc':['i-cam-xuc','i-so-sai'],
    'tu-hoc':['t-phuong-phap','t-quan-ly','t-tap-trung'], 'nhip-song':['a-nep-nha','a-thiet-bi'],
    'giao-tiep':['a-xung-dot','i-niem-tin'], 'thi-cu':['t-hong-goc','t-quan-ly'],
    'phu-huynh':['g-nguoi-lon','a-xung-dot','g-lech']
  };
  var CONG_CU = [['assessment','Đánh giá chuyên sâu'],['bo-test','Bộ test nhận diện'],['ra-soat-kh','Rà soát khách hàng'],['chan-dung-nha','Chân dung nhà']];

  function gita(){ return G.GITA || [{k:'G',short:'Mục tiêu',name:'Goal',c:'#185AB4'},{k:'I',short:'Nội lực',name:'Inspirits',c:'#5140B4'},{k:'T',short:'Năng lực',name:'Talent',c:'#0B7350'},{k:'A',short:'Hành động',name:'Action',c:'#BE0E16'}]; }
  function tru(k){ return gita().filter(function(g){ return g.k===k; })[0] || { k:k, short:k, name:k, c:'#73849F' }; }
  function tier(n){ return (G.TIERS||[]).filter(function(t){ return t.id===Number(n); })[0] || null; }
  function vdTen(ma){ var x = (G.CO_VD||[]).filter(function(v){ return v.ma===ma; })[0]; return x ? x.ten : ma; }
  function ssTen(m){ var x = (G.CO_SS||[]).filter(function(v){ return v.ma===Number(m); })[0]; return x ? x.ten : '—'; }
  function mauNang(p){ return p >= 60 ? '#BE0E16' : p >= 35 ? '#B4720F' : '#0B7350'; }
  function mauTN(p){ return p >= 65 ? '#0B7350' : p >= 40 ? '#B4720F' : '#BE0E16'; }
  function thanh(p, c){ return '<div class="co-thanhbar" style="--m:'+c+'"><i style="width:'+Math.max(0, Math.min(100, p))+'%"></i></div>'; }

  /* ───────── Sổ ───────── */
  function cur(){ var s = CO.st(); return s.ptNha && s.ptNha !== '__moi' ? s.ptNha : ''; }
  function rec(ma, tao){
    var s = CO.st();
    if(!ma) return null;
    if(!s.pt[ma] && tao) s.pt[ma] = { tenNha:CO.tenNha(ma) || ma, luc:Date.now(), ai:CO.toi().u, vd:{}, nc:{}, tn:{}, lichSu:[] };
    var r = s.pt[ma]; if(!r) return null;
    if(!r.vd || typeof r.vd !== 'object') r.vd = {};
    if(!r.nc || typeof r.nc !== 'object') r.nc = {};
    if(!r.tn || typeof r.tn !== 'object') r.tn = {};
    if(!Array.isArray(r.lichSu)) r.lichSu = [];
    return r;
  }
  function coDuLieu(r){ return !!r && (Object.keys(r.vd||{}).length + Object.keys(r.nc||{}).length + Object.keys(r.tn||{}).length > 0 || r.ss != null); }
  /* Mốc so sánh: cùng ngày, cùng người → gộp; "moi" → luôn tách mốc mới. */
  function chup(r, moi){
    var p = CO.phanTich(r), me = CO.toi().u, hn = CO.homNay();
    var snap = { luc:Date.now(), ngay:hn, ai:me, tru:p.tru, tiemNang:p.tiemNang, nangNhat:p.nangNhat, tang:p.tang, ss:r.ss==null?null:Number(r.ss) };
    var L = r.lichSu, cuoi = L[L.length-1];
    if(!moi && cuoi && cuoi.ngay===hn && cuoi.ai===me && !cuoi.chot) L[L.length-1] = snap;
    else { if(moi) snap.chot = 1; L.push(snap); }
    if(L.length > 60) L.splice(1, L.length-60);   /* giữ mốc đầu tiên */
    r.luc = snap.luc; r.ai = me;
  }
  function veGiu(){
    var y = window.pageYOffset || 0, m = document.getElementById('main'), my = m ? m.scrollTop : 0;
    CO.luu(); window.scrollTo(0, y); if(m) m.scrollTop = my;
  }
  function canNha(){ var ma = cur(); if(!ma){ U.toast('Chọn một nhà (hoặc tạo "Nhà mới…") trước khi chấm.','err'); return null; } return ma; }

  /* ───────── Mảnh giao diện ───────── */
  function seg(co, ma, val, mau, nhan, ten){
    return '<div class="co-muc" role="group" aria-label="'+h(ten||'Mức')+'" style="--m:'+mau+'">'+ [0,1,2,3].map(function(m){
      var on = val!=null && val!=='' && Number(val)===m;
      return '<button type="button" class="'+(on?'on':'')+'" aria-pressed="'+on+'" data-co="'+co+'" data-ma="'+h(ma)+'" data-m="'+m+'"'+
        ' title="'+h(m+' · '+nhan[m])+'">'+h(nhan[m].length>1 ? m+' '+nhan[m] : String(m))+'</button>'; }).join('') +'</div>';
  }

  function radar(t){
    var C = 120, R = 78, ds = gita(), goc = [-90, 0, 90, 180];
    function pt(i, v){ var a = goc[i]*Math.PI/180, r = R*v/100; return [C + r*Math.cos(a), C + r*Math.sin(a)]; }
    function poly(v){ return ds.map(function(g,i){ var p = pt(i, typeof v==='number' ? v : (t[g.k]||0)); return p[0].toFixed(1)+','+p[1].toFixed(1); }).join(' '); }
    var o = '<svg viewBox="0 0 240 240" width="240" height="240" style="width:100%;height:auto;max-width:260px;display:block;margin:auto;color:var(--ink-2)" role="img" aria-label="Biểu đồ mạng nhện mức vấn đề theo bốn trụ G–I–T–A">';
    [25,50,75,100].forEach(function(v){ o += '<polygon points="'+poly(v)+'" fill="none" stroke="currentColor" stroke-opacity="'+(v===100?.28:.14)+'" stroke-width="1"/>'; });
    ds.forEach(function(g,i){ var p = pt(i,100); o += '<line x1="'+C+'" y1="'+C+'" x2="'+p[0].toFixed(1)+'" y2="'+p[1].toFixed(1)+'" stroke="currentColor" stroke-opacity=".18"/>'; });
    ds.forEach(function(g,i){
      var a = pt(i, t[g.k]||0), b = pt((i+1)%4, t[ds[(i+1)%4].k]||0);
      o += '<polygon points="'+C+','+C+' '+a[0].toFixed(1)+','+a[1].toFixed(1)+' '+b[0].toFixed(1)+','+b[1].toFixed(1)+'" fill="'+g.c+'" fill-opacity=".2" stroke="none"/>';
    });
    o += '<polygon points="'+poly()+'" fill="currentColor" fill-opacity=".05" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>';
    ds.forEach(function(g,i){ var p = pt(i, t[g.k]||0); o += '<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="4" fill="'+g.c+'" stroke="currentColor" stroke-width="1"/>'; });
    var nh = [ [C, 16, 'middle'], [236, C-8, 'end'], [C, 232, 'middle'], [4, C-8, 'start'] ];
    ds.forEach(function(g,i){ o += '<text x="'+nh[i][0]+'" y="'+nh[i][1]+'" text-anchor="'+nh[i][2]+'" font-size="12" font-weight="700" fill="currentColor">'+h(g.k+' '+(t[g.k]||0)+'%')+'</text>'; });
    return o + '</svg>';
  }

  /* Ma trận 2×2: trục ngang = vấn đề nặng (mức ≥ 2), trục dọc = nhu cầu gấp (≥ 2). */
  function maTran(r){
    var vd = r.vd||{}, nc = r.nc||{}, phu = {}, Q = { ngay:[], kh:[], nhanh:[], theo:[] };
    (G.CO_NC||[]).forEach(function(n){
      var o = nc[n.ma]||{}, qt = Number(o.qt)||0, gap = Number(o.gap)||0; if(!qt && !gap) return;
      var lk = NC_VD[n.ma]||[], nang = 0, vdN = '';
      lk.forEach(function(m){ var v = Number(vd[m])||0; if(v >= 2) phu[m] = 1; if(v > nang){ nang = v; vdN = vdTen(m); } });
      var x = { t:n.ten, loai:'Nhu cầu', ly:'gấp '+gap+'/3 · quan trọng '+qt+'/3'+(nang ? ' · vấn đề liên quan "'+vdN+'" mức '+nang : ' · chưa chấm vấn đề liên quan') };
      Q[nang >= 2 ? (gap >= 2 ? 'ngay' : 'kh') : (gap >= 2 ? 'nhanh' : 'theo')].push(x);
    });
    (G.CO_VD||[]).forEach(function(v){ var m = Number(vd[v.ma])||0;
      if(m >= 2 && !phu[v.ma]) Q.kh.push({ t:v.ten, loai:'Vấn đề '+v.tru, ly:'mức '+m+'/3 · chưa có nhu cầu nào gắn với nó được chấm' }); });
    function o(k, ten, mo, c){
      return '<div class="card pad-sm" style="border-color:'+c+'55;border-left:3px solid '+c+'"><div class="co-hang"><b class="sm" style="color:'+c+'">'+h(ten)+'</b>'+
        '<span class="tiny muted co-so">'+Q[k].length+' mục</span></div><p class="tiny muted" style="margin:3px 0 8px">'+h(mo)+'</p>'+
        (Q[k].length ? '<div class="co-ds">'+Q[k].map(function(x){ return '<div class="sm" style="line-height:1.45"><span class="co-tag" style="color:var(--ink-3);background:var(--phu-4,var(--line))">'+h(x.loai)+'</span> <b>'+h(x.t)+'</b><div class="tiny muted">'+h(x.ly)+'</div></div>'; }).join('')+'</div>'
          : '<p class="tiny muted" style="margin:0">— Chưa có mục nào.</p>')+'</div>';
    }
    return '<div class="grid g2" style="gap:10px">'+
      o('ngay','Nặng × Gấp — làm ngay','Đưa vào buổi gần nhất, chọn một việc nhỏ chắc làm được.','#BE0E16')+
      o('nhanh','Nhẹ × Gấp — gỡ nhanh, gọn','Một nhiệm vụ ngắn; đừng để thành trọng tâm chương trình.','#B4720F')+
      o('kh','Nặng × Chưa gấp — lên kế hoạch','Đặt vào lộ trình theo giai đoạn, có cổng nghiệm thu.','#5140B4')+
      o('theo','Nhẹ × Chưa gấp — theo dõi','Ghi sổ, soi lại ở mốc so sánh sau.','#0B7350')+'</div>'+
      '<p class="tiny muted mt">Trục ngang: vấn đề liên quan ở mức 2 (rõ) trở lên. Trục dọc: nhu cầu có mức "gấp" từ 2 trở lên.</p>';
  }

  /* ───────── Các tab ───────── */
  function tabHoSo(ma, r){
    var o = '';
    o += '<div class="card pad-sm"><div class="co-form">'+
      CO.o2('Tên nhà', '<input class="inp" id="pt-ten" maxlength="80" value="'+h(r ? r.tenNha : CO.tenNha(ma))+'">')+
      CO.o2('Tầng hiện tại', CO.chon('pt-tang', [['','Chưa rõ']].concat((G.TIERS||[]).map(function(t){ return [String(t.id), t.code+' · '+t.name]; })), r && r.tangHienTai ? String(r.tangHienTai) : ''))+
      '</div><div class="co-form mt">'+
      CO.o2('Nút thắt chính (bằng hành vi quan sát được)', '<textarea class="inp" id="pt-nut" rows="3" maxlength="1000" placeholder="Ví dụ: con dùng điện thoại tới 1 giờ sáng, sáng không dậy nổi…">'+h(r && r.nutThat || '')+'</textarea>')+
      CO.o2('Ghi chú của người phân tích', '<textarea class="inp" id="pt-ghi" rows="3" maxlength="1500">'+h(r && r.ghiChu || '')+'</textarea>')+
      '</div><div class="co-hang mt"><button class="btn pri sm" data-co="pt-luu-hs">'+ic('check','w-3 h-3')+'Lưu hồ sơ</button>'+
      (r ? '<span class="tiny muted">Lưu lần cuối '+h(CO.gioVN(r.luc||Date.now()))+' · '+h(r.ai||'—')+'</span><span class="co-grow"></span>'+
        '<button class="btn ghost sm" data-co="pt-xoa">'+ic('x','w-3 h-3')+'Xoá hồ sơ phân tích</button>' : '<span class="tiny muted">Nhà này chưa có hồ sơ phân tích — lưu hoặc chấm mục đầu tiên là tạo.</span>')+
      '</div></div>';
    var cc = CONG_CU.filter(function(x){ return G.allowed && G.manCoThat && G.allowed(x[0]) && G.manCoThat(x[0]); });
    if(cc.length){
      o += U.sec('Công cụ soi sâu', 'Dùng khi cần thêm bằng chứng trước khi chấm');
      o += '<div class="co-hang">'+cc.map(function(x){ var it = G.navItem ? G.navItem(x[0]) : null;
        return '<button class="btn ghost sm" data-v="'+h(x[0])+'">'+ic('arrow','w-3 h-3')+h(it && it.t || x[1])+'</button>'; }).join('')+'</div>';
    }
    o += U.sec('Cách đi', 'Bốn bước, mỗi bước lưu ngay khi bấm');
    o += '<div class="co-ds">'+[
      ['Vấn đề (G–I–T–A)','Chấm 20 vấn đề 0–3 theo bằng chứng đã thấy, không theo cảm giác.'],
      ['Nhu cầu','Mỗi nhu cầu hai mức: quan trọng với nhà tới đâu, và gấp tới đâu.'],
      ['Tiềm năng & sẵn sàng','Tám chiều nguồn lực của nhà và mức sẵn sàng thay đổi.'],
      ['Kết quả & đề xuất','Máy gợi ý tầng, chương trình, giải pháp — Coach đọc và quyết.']
    ].map(function(x,i){ return '<div class="co-dong"><b class="co-so" style="color:var(--gita)">'+(i+1)+'</b><span class="co-grow sm"><b>'+h(x[0])+'</b> — '+h(x[1])+'</span></div>'; }).join('')+'</div>';
    return o;
  }

  function tabVanDe(r, p){
    var vd = (r && r.vd) || {};
    return gita().map(function(g){
      var ds = (G.CO_VD||[]).filter(function(x){ return x.tru===g.k; });
      var da = ds.filter(function(x){ return vd[x.ma]!=null; }).length;
      return '<div class="card pad-sm mb" style="border-left:4px solid '+g.c+'">'+
        '<div class="co-hang"><b style="color:'+g.c+'">'+h(g.k)+' · '+h(g.short)+'</b><span class="tiny muted">'+h(g.name)+'</span><span class="co-grow"></span>'+
        '<span class="tiny co-so" style="font-weight:700;color:'+mauNang(p.tru[g.k]||0)+'">mức '+(p.tru[g.k]||0)+'%</span><span class="tiny muted co-so">· đã chấm '+da+'/'+ds.length+'</span></div>'+
        (g.probe ? '<p class="tiny muted" style="margin:6px 0 10px;line-height:1.5">'+ic('quote','w-3 h-3')+' Câu soi: '+h(g.probe)+'</p>' : '')+
        '<div class="co-ds">'+ds.map(function(x){
          return '<div class="co-dong"><span class="co-grow sm" style="min-width:180px">'+h(x.ten)+'</span>'+seg('pt-vd', x.ma, vd[x.ma], g.c, MUC, x.ten)+'</div>'; }).join('')+'</div></div>';
    }).join('') + '<p class="tiny muted">0 Không · 1 Nhẹ · 2 Rõ (thấy lặp lại) · 3 Nặng (chặn việc học / sinh hoạt). Bấm là lưu.</p>';
  }

  function tabNhuCau(r, p){
    var nc = (r && r.nc) || {};
    var o = '<div class="grid g2" style="align-items:start">';
    o += '<div class="co-ds">'+(G.CO_NC||[]).map(function(n){
      var x = nc[n.ma] || {};
      return '<div class="co-dong" style="flex-direction:column;align-items:stretch;gap:6px"><b class="sm">'+h(n.ten)+'</b>'+
        '<div class="co-hang"><span class="tiny muted" style="min-width:76px">Quan trọng</span>'+seg('pt-nc', n.ma+'|qt', x.qt, '#5140B4', MUC_NC, n.ten+' — quan trọng')+'</div>'+
        '<div class="co-hang"><span class="tiny muted" style="min-width:76px">Gấp</span>'+seg('pt-nc', n.ma+'|gap', x.gap, '#BE0E16', MUC_NC, n.ten+' — gấp')+'</div></div>';
    }).join('')+'</div>';
    var top = p.ncTop, max = top.reduce(function(a,x){ return Math.max(a, x.qt*x.gap+x.qt); }, 0) || 1;
    o += '<div class="card pad-sm"><b class="sm">Thứ tự ưu tiên (tính trực tiếp)</b><p class="tiny muted" style="margin:3px 0 10px">Điểm = quan trọng × gấp + quan trọng (tối đa 12).</p>'+
      (top.length ? '<div class="co-ds">'+top.map(function(x,i){ var d = x.qt*x.gap+x.qt;
        return '<div><div class="co-hang sm"><b class="co-so" style="min-width:20px">'+(i+1)+'</b><span class="co-grow">'+h(x.ten)+'</span><span class="co-so tiny" style="font-weight:700">'+d+'/12</span></div>'+
          thanh(Math.round(100*d/max), i < 3 ? '#BE0E16' : '#5140B4')+'</div>'; }).join('')+'</div>'+
        '<p class="tiny muted mt">Ba nhu cầu đầu được dùng để gợi ý chương trình ở tab Kết quả.</p>'
        : '<p class="tiny muted">— Chưa chấm nhu cầu nào.</p>')+'</div>';
    return o + '</div>';
  }

  function tabTiemNang(r, p){
    var tn = (r && r.tn) || {}, ss = r && r.ss!=null ? Number(r.ss) : null;
    var o = '<div class="card pad-sm mb"><div class="co-hang"><b class="sm">Tám chiều tiềm năng</b><span class="co-grow"></span>'+
      '<span class="tiny co-so" style="font-weight:700;color:'+mauTN(p.tiemNang)+'">chỉ số '+p.tiemNang+'%</span></div><div class="co-ds mt">'+
      (G.CO_TN||[]).map(function(x){ return '<div class="co-dong"><span class="co-grow sm" style="min-width:180px">'+h(x.ten)+'</span>'+seg('pt-tn', x.ma, tn[x.ma], '#0B7350', MUC_TN, x.ten)+'</div>'; }).join('')+
      '</div></div>';
    o += U.sec('Mức sẵn sàng thay đổi', ss==null ? 'Chưa chọn — máy tạm tính ở mức 0' : 'Đang chọn: '+ssTen(ss));
    o += '<div class="co-luoi" style="grid-template-columns:repeat(auto-fill,minmax(180px,1fr))">'+(G.CO_SS||[]).map(function(x){
      var on = ss===x.ma;
      return '<button type="button" class="co-the'+(on?' nhan':'')+'" style="text-align:left;cursor:pointer;color:inherit;font:inherit;--c:var(--gita);'+(on?'background:color-mix(in srgb,var(--gita) 9%,var(--surface))':'')+'" aria-pressed="'+on+'" data-co="pt-ss" data-m="'+x.ma+'">'+
        '<span class="co-hang"><b class="co-so" style="color:var(--gita)">'+x.ma+'</b><b class="sm">'+h(x.ten)+'</b>'+(on?ic('check','w-4 h-4'):'')+'</span>'+
        '<span class="tiny muted" style="line-height:1.5">'+h(x.mo)+'</span></button>'; }).join('')+'</div>';
    return o;
  }

  function tabKetQua(ma, r, p){
    if(!coDuLieu(r)) return '<div class="card center" style="padding:30px"><b>Chưa có dữ liệu để đề xuất</b><p class="sm muted mt">Chấm ít nhất vài vấn đề, nhu cầu và mức sẵn sàng — kết quả hiện ở đây ngay khi bấm.</p></div>';
    var o = '<div class="co-cb mb"><div style="--m:var(--gita)">'+ic('shield','w-4 h-4')+'<span><b>Máy gợi ý — Coach quyết định.</b> Mọi đề xuất dưới đây đọc từ điểm đã chấm; người phân tích đối chiếu bằng chứng trước khi chọn.</span></div></div>';
    /* Hồ sơ G–I–T–A */
    o += U.sec('Hồ sơ G–I–T–A', 'Mức vấn đề từng trụ — càng cao càng nặng');
    o += '<div class="grid g2" style="align-items:center"><div class="co-ds">'+gita().map(function(g){
      var v = p.tru[g.k]||0;
      return '<div><div class="co-hang sm"><b style="color:'+g.c+';min-width:18px">'+h(g.k)+'</b><span class="co-grow">'+h(g.short)+'</span><b class="co-so">'+v+'%</b></div>'+thanh(v, g.c)+'</div>'; }).join('')+
      '</div><div>'+radar(p.tru)+'</div></div>';
    /* Ma trận */
    o += U.sec('Ma trận ưu tiên', 'Vấn đề nặng × nhu cầu gấp');
    o += maTran(r);
    /* Tiềm năng & tầng */
    var t = tier(p.tang);
    o += U.sec('Tiềm năng & tầng đề xuất');
    o += '<div class="grid g2"><div class="card pad-sm"><div class="tiny muted">Chỉ số tiềm năng</div><div style="font-size:28px;font-weight:800;color:'+mauTN(p.tiemNang)+'" class="co-so">'+p.tiemNang+'%</div>'+
      thanh(p.tiemNang, mauTN(p.tiemNang))+'<p class="tiny muted mt">Sẵn sàng: <b>'+h(ssTen(p.ss))+'</b>'+(r.ss==null?' (chưa chọn)':'')+' · Mức nặng nhất: <b class="co-so">'+p.nangNhat+'%</b></p></div>'+
      '<div class="card pad-sm" style="border-left:4px solid '+(t?t.c:'var(--gita)')+'"><div class="tiny muted">Tầng đề xuất</div>'+
      '<div style="font-size:22px;font-weight:800;color:'+(t?t.c:'inherit')+'">'+h(t ? t.code+' · '+t.name : 'T'+p.tang)+'</div>'+
      (t ? '<p class="sm" style="margin:4px 0"><b>'+h(t.q)+'</b></p><p class="tiny muted" style="margin:0;line-height:1.5">'+h(t.goal)+'</p>' : '')+
      '<p class="tiny muted mt">Luật: vấn đề nặng + sẵn sàng thấp → bắt đầu từ Nhận diện; không bao giờ đề xuất thấp hơn tầng hiện tại'+(r.tangHienTai?' (T'+h(r.tangHienTai)+')':'')+'.</p></div></div>';
    /* Chương trình */
    var ghepDuoc = G.allowed && G.allowed('coach-ct');
    o += U.sec('Chương trình đề xuất', p.ctDX.length+' gợi ý');
    o += p.ctDX.length ? '<div class="co-ds">'+p.ctDX.map(function(x){ var c = CO.ct(x.ma);
      return '<div class="co-dong" style="border-left:3px solid '+(c&&c.c||'var(--gita)')+'"><span class="co-grow" style="min-width:200px"><b class="sm">'+h(c ? c.ten : x.ma)+'</b>'+
        (c ? ' <span class="tiny muted">· '+c.ngay+' ngày</span>' : '')+'<div class="tiny muted">Lý do: '+h(x.ly)+'</div></span>'+
        (ghepDuoc && c ? '<button class="btn sm" data-co="pt-ghep" data-ct="'+h(x.ma)+'">'+ic('compass','w-3 h-3')+'Ghép chương trình này</button>' : '')+'</div>'; }).join('')+'</div>'+
      (ghepDuoc ? '' : '<p class="tiny muted mt">Vai hiện tại không ghép chương trình — chuyển bản tóm tắt này cho Coach phụ trách để ghép.</p>')
      : '<p class="sm muted">— Chưa đủ dữ liệu để gợi ý chương trình.</p>';
    /* Giải pháp */
    var gpDuoc = G.allowed && G.allowed('coach-gp');
    o += U.sec('Giải pháp gợi ý', p.gpDX.length ? 'Khớp với các vấn đề đã chấm nặng nhất' : 'Cần ít nhất một vấn đề ở mức 2');
    o += p.gpDX.length ? '<div class="co-luoi">'+p.gpDX.map(function(m){ var g = CO.gp(m); if(!g) return ''; var tr = tru(g.tru);
      var khop = (g.vd||[]).filter(function(v){ return (Number(r.vd[v])||0) > 0; }).map(vdTen);
      return '<div class="co-the nhan" style="--c:'+tr.c+'"><div class="co-meta"><span style="color:'+tr.c+';font-weight:700">'+h(tr.k+' · '+tr.short)+'</span><span>'+h(g.ma)+'</span><span>'+(g.ngay||'—')+' ngày</span></div>'+
        '<h3>'+h(g.ten)+'</h3><p class="tiny muted" style="margin:0;line-height:1.5">'+h(g.muc||'')+'</p>'+
        (khop.length ? '<p class="tiny" style="margin:0">Gỡ: '+h(khop.join(' · '))+'</p>' : '')+
        (gpDuoc ? '<div><button class="btn ghost sm" data-co="pt-gp" data-ma="'+h(g.ma)+'">'+ic('spark','w-3 h-3')+'Mở giải pháp</button></div>' : '')+'</div>'; }).join('')+'</div>' : '';
    /* Rủi ro */
    o += U.sec('Cờ rủi ro', p.ruiRo.length ? p.ruiRo.length+' cờ' : 'Không có cờ nào');
    o += p.ruiRo.length ? '<div class="co-cb">'+p.ruiRo.map(function(x){ return '<div style="--m:#BE0E16">'+ic('alert','w-4 h-4')+'<span>'+h(x)+'</span></div>'; }).join('')+'</div>' : '';
    o += '<div class="co-hang mt2"><button class="btn pri sm" data-co="pt-tt">'+ic('book','w-3 h-3')+'Xuất bản tóm tắt</button>'+
      '<button class="btn ghost sm" data-co="pt-chot">'+ic('pulse','w-3 h-3')+'Chốt mốc so sánh</button>'+
      '<span class="tiny muted">'+(r.lichSu||[]).length+' mốc đã lưu</span></div>';
    return o;
  }

  function tabSoSanh(r){
    var L = (r && r.lichSu) || [];
    if(L.length < 2) return '<div class="card center" style="padding:30px"><b>Cần ít nhất hai mốc để so sánh</b><p class="sm muted mt" style="max-width:56ch;margin-inline:auto">Hiện có '+L.length+' mốc. '+
      'Mỗi ngày chấm là một mốc (chấm nhiều lần trong ngày được gộp). Lần phân tích lại sau một chặng — hoặc bấm "Chốt mốc so sánh" ở tab Kết quả — sẽ tạo mốc mới để so với mốc đầu.</p></div>';
    var a = L[0], b = L[L.length-1];
    function d(x, y, tot){ var v = y - x; if(!v) return '<span class="muted">0</span>'; var good = tot==='giam' ? v < 0 : v > 0;
      return '<b style="color:'+(good?'#0B7350':'#BE0E16')+'">'+(v>0?'+':'')+v+'</b>'; }
    var rows = gita().map(function(g){ var x = a.tru[g.k]||0, y = b.tru[g.k]||0;
      return '<tr><td><b style="color:'+g.c+'">'+h(g.k)+'</b> '+h(g.short)+' <span class="tiny muted">(vấn đề)</span></td><td class="so">'+x+'%</td><td class="so">'+y+'%</td><td class="so">'+d(x,y,'giam')+'</td></tr>'; }).join('');
    rows += '<tr><td>Chỉ số tiềm năng</td><td class="so">'+a.tiemNang+'%</td><td class="so">'+b.tiemNang+'%</td><td class="so">'+d(a.tiemNang,b.tiemNang,'tang')+'</td></tr>';
    rows += '<tr><td>Mức nặng nhất</td><td class="so">'+a.nangNhat+'%</td><td class="so">'+b.nangNhat+'%</td><td class="so">'+d(a.nangNhat,b.nangNhat,'giam')+'</td></tr>';
    rows += '<tr><td>Tầng đề xuất</td><td class="so">T'+a.tang+'</td><td class="so">T'+b.tang+'</td><td class="so">'+d(a.tang,b.tang,'tang')+'</td></tr>';
    rows += '<tr><td>Sẵn sàng</td><td class="so">'+h(a.ss==null?'—':ssTen(a.ss))+'</td><td class="so">'+h(b.ss==null?'—':ssTen(b.ss))+'</td><td class="so">'+(a.ss!=null&&b.ss!=null?d(a.ss,b.ss,'tang'):'—')+'</td></tr>';
    var o = U.sec('Mốc đầu → mốc mới nhất', CO.gioVN(a.luc)+' → '+CO.gioVN(b.luc)+' · '+L.length+' mốc');
    o += '<div class="co-tb"><table><thead><tr><th>Chỉ số</th><th>Mốc đầu</th><th>Mới nhất</th><th>Chênh</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
    o += '<p class="tiny muted mt">Vấn đề giảm là tốt (xanh); tiềm năng, tầng, sẵn sàng tăng là tốt.</p>';
    o += U.sec('Trước / sau theo trụ');
    o += '<div class="grid g2" style="gap:10px">'+gita().map(function(g){ var x = a.tru[g.k]||0, y = b.tru[g.k]||0;
      return '<div class="card pad-sm"><div class="co-hang sm"><b style="color:'+g.c+'">'+h(g.k+' · '+g.short)+'</b><span class="co-grow"></span><span class="tiny muted co-so">'+x+'% → '+y+'%</span></div>'+
        '<div class="co-hang tiny muted" style="margin-top:6px;flex-wrap:nowrap"><span style="min-width:40px">Trước</span><span class="co-grow">'+thanh(x, 'var(--ink-4)')+'</span></div>'+
        '<div class="co-hang tiny muted" style="margin-top:4px;flex-wrap:nowrap"><span style="min-width:40px">Sau</span><span class="co-grow">'+thanh(y, g.c)+'</span></div></div>'; }).join('')+'</div>';
    o += U.sec('Các mốc đã lưu');
    o += '<div class="co-tb"><table><thead><tr><th>Lúc</th><th>Người chấm</th><th>Nặng nhất</th><th>Tiềm năng</th><th>Tầng</th></tr></thead><tbody>'+
      L.slice().reverse().map(function(s){ return '<tr><td>'+h(CO.gioVN(s.luc))+(s.chot?' <span class="co-tag">chốt</span>':'')+'</td><td>'+h(s.ai||'—')+'</td><td class="so">'+s.nangNhat+'%</td><td class="so">'+s.tiemNang+'%</td><td class="so">T'+s.tang+'</td></tr>'; }).join('')+'</tbody></table></div>';
    return o;
  }

  /* ───────── Tóm tắt một trang ───────── */
  function tomTat(ma, r){
    var p = CO.phanTich(r), t = tier(p.tang);
    var o = '<div class="co-pt-tt"><div class="tiny up" style="color:var(--ink-4)">GITA 365 · Tóm tắt phân tích khách hàng</div>'+
      '<h2 style="font-size:21px;font-weight:800;margin:4px 0 2px">'+h(r.tenNha||ma)+'</h2>'+
      '<p class="tiny muted" style="margin:0 0 12px">Mã '+h(ma)+' · lập '+h(CO.gioVN(r.luc||Date.now()))+' · người phân tích '+h(r.ai||CO.toi().u)+'</p>';
    if(r.nutThat) o += '<p class="sm" style="margin:0 0 10px"><b>Nút thắt chính:</b> '+h(r.nutThat)+'</p>';
    o += '<table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:10px"><tbody>'+gita().map(function(g){
      return '<tr><td style="padding:4px 0;width:42%"><b style="color:'+g.c+'">'+h(g.k)+'</b> '+h(g.short)+'</td><td style="padding:4px 8px">'+thanh(p.tru[g.k]||0, g.c)+'</td><td style="text-align:right;width:52px"><b>'+(p.tru[g.k]||0)+'%</b></td></tr>'; }).join('')+'</tbody></table>';
    o += '<p class="sm" style="margin:0 0 6px"><b>Tiềm năng:</b> '+p.tiemNang+'% · <b>Sẵn sàng:</b> '+h(ssTen(p.ss))+' · <b>Tầng đề xuất:</b> '+h(t ? t.code+' '+t.name+' — '+t.q : 'T'+p.tang)+'</p>';
    if(p.nang.length) o += '<p class="sm" style="margin:0 0 6px"><b>Vấn đề rõ / nặng:</b> '+h(p.nang.slice(0,6).map(function(x){ return x.ten+' ('+r.vd[x.ma]+')'; }).join(' · '))+'</p>';
    if(p.ncTop.length) o += '<p class="sm" style="margin:0 0 6px"><b>Nhu cầu ưu tiên:</b> '+h(p.ncTop.slice(0,3).map(function(x){ return x.ten; }).join(' · '))+'</p>';
    if(p.ctDX.length) o += '<p class="sm" style="margin:0 0 6px"><b>Chương trình gợi ý:</b> '+h(p.ctDX.map(function(x){ var c = CO.ct(x.ma); return (c?c.ten:x.ma)+' ('+x.ly+')'; }).join(' · '))+'</p>';
    if(p.gpDX.length) o += '<p class="sm" style="margin:0 0 6px"><b>Giải pháp gợi ý:</b> '+h(p.gpDX.map(function(m){ var g = CO.gp(m); return g ? g.ten : m; }).join(' · '))+'</p>';
    if(p.ruiRo.length) o += '<p class="sm" style="margin:0 0 6px;color:#BE0E16"><b>Rủi ro:</b> '+h(p.ruiRo.join(' · '))+'</p>';
    o += '<p class="tiny muted" style="margin-top:12px;line-height:1.5">Máy gợi ý từ điểm đã chấm; Coach đối chiếu bằng chứng và quyết định. Không hứa kết quả không đo được. '+
      'Hồ sơ nhạy cảm của gia đình — không chia sẻ ra ngoài hệ.</p></div>';
    o += '<div class="co-hang mt co-noprint"><button class="btn pri sm" data-co="pt-in">'+ic('book','w-3 h-3')+'In / lưu PDF</button><span class="tiny muted">Bản in ghi vào nhật ký và chỉ mở cho vai có quyền in.</span></div>';
    return o;
  }

  /* ───────── Màn ───────── */
  G.VIEWS[VIEW] = function(){
    var k = CO.cua('pro_consult', 'Phân tích vấn đề – nhu cầu – tiềm năng'); if(k) return k;
    CO.napMau();
    var s = CO.st();
    if(s.ptNha == null){ var ks = Object.keys(s.pt); if(ks.length) s.ptNha = ks[0]; }
    var ma = cur(), r = rec(ma, false), p = CO.phanTich(r || {});
    var dsNha = CO.dsNha(), soPT = Object.keys(s.pt).filter(function(m){ return coDuLieu(s.pt[m]); }).length;

    var o = U.ph({ eyebrow:'COACH · PHÂN TÍCH KHÁCH HÀNG', ic:'target', grad:1, t:'Phân tích vấn đề – nhu cầu – tiềm năng',
      lead:'Soi một gia đình theo bốn trụ G–I–T–A, mười hai nhu cầu và tám chiều tiềm năng; máy gợi ý tầng, chương trình và giải pháp — người phân tích đối chiếu bằng chứng rồi quyết.' });
    o += '<div class="co-hang mb"><button class="btn ghost sm" data-v="coach-he">← Hệ điều hành Coach</button></div>';
    o += CO.banMau();
    var t = tier(p.tang), coDL = coDuLieu(r);
    o += '<div class="grid g4 mb">'+
      U.stat({ k:'Nhà đã phân tích', v:String(soPT), d:Object.keys(s.pt).length+' hồ sơ trong sổ' })+
      U.stat({ k:'Mức nặng nhất', v:coDL ? p.nangNhat+'%' : '—', d:coDL ? 'trụ nặng nhất của nhà đang mở' : (ma ? 'nhà này chưa chấm' : 'chưa chọn nhà'), c:coDL ? mauNang(p.nangNhat) : null })+
      U.stat({ k:'Tiềm năng', v:coDL ? p.tiemNang+'%' : '—', d:'tám chiều nguồn lực', c:coDL ? mauTN(p.tiemNang) : null })+
      U.stat({ k:'Tầng đề xuất', v:coDL ? (t ? t.code : 'T'+p.tang) : '—', d:coDL && t ? t.name+' · máy gợi ý' : 'máy gợi ý, Coach quyết', c:coDL && t ? t.c : null })+'</div>';

    /* Chọn nhà */
    var opt = [['','— Chọn nhà để phân tích —']].concat(dsNha.map(function(n){ return [n.ma, n.ten+(s.pt[n.ma] ? ' · đã có hồ sơ' : '')]; })).concat([['__moi','+ Nhà mới…']]);
    o += '<div class="card pad-sm mb"><div class="co-form">'+CO.o2('Nhà đang phân tích', CO.chon('pt-nha', opt, s.ptNha||'', ' data-co-ch="pt-nha"'))+'</div>';
    if(s.ptNha === '__moi'){
      o += '<div class="co-form mt">'+CO.o2('Mã nhà (chữ, số, gạch ngang)', '<input class="inp" id="pt-moi-ma" maxlength="24" placeholder="VD: HN-0123">')+
        CO.o2('Tên nhà', '<input class="inp" id="pt-moi-ten" maxlength="80" placeholder="VD: Nhà chị Lan – bé Minh">')+'</div>'+
        '<div class="co-hang mt"><button class="btn pri sm" data-co="pt-tao">'+ic('plus','w-3 h-3')+'Tạo hồ sơ phân tích</button><span class="tiny muted">Dùng mã CRM nếu nhà đã có trên máy chủ, để các màn khác nhận ra.</span></div>';
    }
    if(ma && r) o += '<p class="tiny muted" style="margin:8px 0 0">'+h(r.tenNha||ma)+CO.nhanMau(r)+' · cập nhật '+h(CO.gioVN(r.luc||Date.now()))+' · '+(r.lichSu||[]).length+' mốc so sánh</p>';
    o += '</div>';

    if(!ma){
      o += '<div class="card center" style="padding:30px"><b>Chọn một nhà để bắt đầu</b><p class="sm muted mt">Danh sách gồm nhà đã ghép chương trình, khách thật trên máy chủ (nếu đã nối) và nhà đã có hồ sơ phân tích. Nhà chưa có trong danh sách: chọn "Nhà mới…".</p></div>';
    } else {
      var tab = CO.tab(VIEW, 'hs');
      o += CO.tabs(VIEW, [['hs','Hồ sơ nhà','home'],['vd','Vấn đề (G–I–T–A)','target'],['nc','Nhu cầu','list'],['tn','Tiềm năng & sẵn sàng','seed'],['kq','Kết quả & đề xuất','spark'],['ss','So sánh','chart']], tab);
      if(tab==='vd') o += tabVanDe(r, p);
      else if(tab==='nc') o += tabNhuCau(r, p);
      else if(tab==='tn') o += tabTiemNang(r, p);
      else if(tab==='kq') o += tabKetQua(ma, r, p);
      else if(tab==='ss') o += tabSoSanh(r);
      else o += tabHoSo(ma, r);
    }
    o += '<p class="tiny muted co-hang" style="margin-top:16px;gap:6px;flex-wrap:nowrap;align-items:flex-start">'+ic('lock','w-3 h-3')+'<span>Dữ liệu phân tích là hồ sơ nhạy cảm, chỉ lưu trên máy của người phân tích, gắn tên chủ sổ ('+h(CO.toi().u||'—')+'). Đổi người đăng nhập là sổ được dọn.</span></p>';
    return o;
  };

  /* ───────── Thao tác ───────── */
  CO.on('pt-nha', function(el){ CO.st().ptNha = el.value || ''; CO.luu(); });
  CO.on('pt-tao', function(){
    var ma = CO.o('pt-moi-ma').toUpperCase(), ten = CO.o('pt-moi-ten'), s = CO.st();
    if(!/^[A-Z0-9][A-Z0-9_-]{1,23}$/.test(ma)){ U.toast('Mã nhà cần 2–24 ký tự: chữ không dấu, số, gạch ngang.','err'); return; }
    if(ten.length < 2){ U.toast('Nhập tên nhà để người khác nhận ra hồ sơ.','err'); return; }
    if(s.pt[ma]){ U.toast('Mã '+ma+' đã có hồ sơ phân tích — chọn nhà đó trong danh sách.','err'); return; }
    s.pt[ma] = { tenNha:ten, luc:Date.now(), ai:CO.toi().u, vd:{}, nc:{}, tn:{}, lichSu:[] };
    s.ptNha = ma; s.tab[VIEW] = 'hs';
    CO.luu(); U.toast('Đã tạo hồ sơ phân tích cho '+ten+'.','ok');
  });
  CO.on('pt-luu-hs', function(){
    var ma = canNha(); if(!ma) return;
    var ten = CO.o('pt-ten'), tang = CO.o('pt-tang'), nut = CO.o('pt-nut'), ghi = CO.o('pt-ghi');
    if(ten.length < 2){ U.toast('Tên nhà cần ít nhất 2 ký tự.','err'); return; }
    var r = rec(ma, true);
    r.tenNha = ten; r.tangHienTai = tang ? Number(tang) : null; r.nutThat = nut.slice(0,1000); r.ghiChu = ghi.slice(0,1500);
    chup(r); veGiu(); U.toast('Đã lưu hồ sơ nhà '+ten+'.','ok');
  });
  CO.on('pt-xoa', function(){
    var ma = cur(), s = CO.st(); if(!ma || !s.pt[ma]) return;
    if(!window.confirm('Xoá toàn bộ hồ sơ phân tích của '+(s.pt[ma].tenNha||ma)+' (kể cả các mốc so sánh)?')) return;
    delete s.pt[ma]; s.ptNha = ''; CO.luu(); U.toast('Đã xoá hồ sơ phân tích.','ok');
  });
  CO.on('pt-vd', function(el){
    var ma = canNha(); if(!ma) return;
    var r = rec(ma, true); r.vd[el.getAttribute('data-ma')] = Number(el.getAttribute('data-m'));
    chup(r); veGiu();
  });
  CO.on('pt-nc', function(el){
    var ma = canNha(); if(!ma) return;
    var k = el.getAttribute('data-ma').split('|'), r = rec(ma, true);
    var o = r.nc[k[0]] = r.nc[k[0]] || { qt:0, gap:0 }; o[k[1]] = Number(el.getAttribute('data-m'));
    chup(r); veGiu();
  });
  CO.on('pt-tn', function(el){
    var ma = canNha(); if(!ma) return;
    var r = rec(ma, true); r.tn[el.getAttribute('data-ma')] = Number(el.getAttribute('data-m'));
    chup(r); veGiu();
  });
  CO.on('pt-ss', function(el){
    var ma = canNha(); if(!ma) return;
    var r = rec(ma, true); r.ss = Number(el.getAttribute('data-m'));
    chup(r); veGiu();
  });
  CO.on('pt-chot', function(){
    var ma = canNha(); if(!ma) return;
    var r = rec(ma, true); chup(r, true); veGiu(); U.toast('Đã chốt mốc so sánh mới ('+r.lichSu.length+' mốc).','ok');
  });
  CO.on('pt-ghep', function(el){
    var ma = canNha(); if(!ma) return;
    if(!(G.allowed && G.allowed('coach-ct'))){ U.toast('Vai hiện tại không ghép chương trình.','err'); return; }
    var r = rec(ma, false), s = CO.st();
    s.ctGhep = { nha:ma, tenNha:(r && r.tenNha) || CO.tenNha(ma), ct:el.getAttribute('data-ct'), tu:VIEW, luc:Date.now() };
    s.tab['coach-ct'] = 'ghep';   /* mở thẳng tab Ghép cho nhà, đã chọn sẵn nhà + chương trình */
    CO.luu(false); G.go('coach-ct');
  });
  CO.on('pt-gp', function(el){
    if(!(G.allowed && G.allowed('coach-gp'))){ U.toast('Vai hiện tại không mở thư viện giải pháp.','err'); return; }
    CO.st().gpChon = el.getAttribute('data-ma'); CO.luu(false); G.go('coach-gp');
  });
  CO.on('pt-tt', function(){
    var ma = canNha(); if(!ma) return;
    var r = rec(ma, false); if(!coDuLieu(r)){ U.toast('Chưa có điểm nào để tóm tắt.','err'); return; }
    U.modal(tomTat(ma, r));
  });
  CO.on('pt-in', function(){
    var b = document.body; b.classList.add('co-pt-in');
    function xong(){ b.classList.remove('co-pt-in'); window.removeEventListener('afterprint', xong); }
    window.addEventListener('afterprint', xong);
    var ok = G.inTrang ? G.inTrang('Tóm tắt phân tích '+cur()) : (window.print(), true);
    if(ok === false) xong(); else setTimeout(xong, 60000);
  });
})();
