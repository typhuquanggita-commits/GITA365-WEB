/* ═══════════════════════════════════════════════════════════════
   GITA 365 — HỆ ĐIỀU HÀNH COACH · KHO TÀI LIỆU (coach-kho)

   Một cửa tìm mọi tư liệu đang có trên máy, đếm thật:

     Kho nghề   G.MOTHUC · G.PHACDO · G.KICHBAN · G.TINHHUONG · G.BAIHOC
                · G.TEST750 · G.THUVIEN (tài liệu tải lên, theo quyền xem)
     Kho Coach  sinh từ dữ liệu chuẩn: hướng dẫn từng chương trình,
                thẻ giải pháp, thang chấm chất lượng, khung sáu nhịp
     Màn sâu    các màn chuyên sâu vai này mở được

   Kho nào vắng mặt (chưa cấp phép, máy gia đình…) thì tự rơi ra, không
   báo lỗi. Ghim lưu ở CO.st().ghim — màn Thiết kế bài dùng làm tư liệu
   đính kèm. Gửi cho gia đình đi qua màn gui-tu-lieu (trần 30% · cửa
   KPI 80%). Mở cho pro_coach. Không đụng máy chủ · giấy phép · mã hoá.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic, CO = G.CO;
  var VIEW = 'coach-kho';
  var CCP = /\s*…?\s*\[cần cấp phép\]\s*/g;
  var LOAI = [
    { k:'mt',  ten:'Mô thức',               c:'#185AB4', ic:'compass' },
    { k:'pd',  ten:'Phác đồ',               c:'#BE0E16', ic:'shield' },
    { k:'kb',  ten:'Kịch bản',              c:'#5140B4', ic:'ritual' },
    { k:'th',  ten:'Tình huống',            c:'#B4720F', ic:'chat' },
    { k:'bh',  ten:'Bài học',               c:'#0B7350', ic:'book' },
    { k:'ts',  ten:'Bộ test',               c:'#0B6675', ic:'target' },
    { k:'tl',  ten:'Tài liệu tải lên',      c:'#665E88', ic:'list' },
    { k:'ct',  ten:'Hướng dẫn chương trình', c:'#2A72C6', ic:'map' },
    { k:'gp',  ten:'Thẻ giải pháp',         c:'#0B7350', ic:'spark' },
    { k:'tc',  ten:'Thang chấm chất lượng', c:'#B4720F', ic:'star' },
    { k:'nh',  ten:'Khung sáu nhịp',        c:'#185AB4', ic:'pulse' },
    { k:'man', ten:'Màn chuyên sâu',        c:'#73849F', ic:'grid' }
  ];
  var MAN_SAU = ['ban-ve','chuan-ngon-ngu','dien-thu','coach-5-tang','diem-cham-1000','tang34','so-tay-van-hanh','bando-coach','phac-do','kich-ban','tinh-huong'];
  var NHAN = { title:'Tên', ten:'Tên', tieuDe:'Tiêu đề', summary:'Tóm tắt', nguyenLy:'Nguyên lý', muc:'Mục tiêu', mo:'Mở đầu', moTa:'Mô tả', nhom:'Nhóm', nhomTen:'Nhóm',
    loai:'Loại', ai:'Dành cho', phut:'Thời lượng (phút)', tuoi:'Độ tuổi', mien:'Miền đo', bo:'Bộ', tier:'Tầng', tang:'Tầng', chot:'Câu chốt', tranh:'Điều tránh',
    viec:'Việc làm', cauHoi:'Câu hỏi', vd:'Ví dụ', ungDung:'Ứng dụng', nguon:'Nguồn', ngay:'Ngày' };

  function loai(k){ return LOAI.filter(function(x){ return x.k===k; })[0] || { k:k, ten:k, c:'#73849F', ic:'dot' }; }
  function boDau(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d'); }
  function soTang(v){
    if(Array.isArray(v)) return v.map(function(x){ return soTang(x)[0]; }).filter(function(x){ return x; });
    var m = String(v==null ? '' : v).match(/([1-5])/); return m ? [Number(m[1])] : [];
  }
  function sach(s){ s = String(s==null ? '' : s); var k = /\[cần cấp phép\]/.test(s), t = s.replace(CCP, ' ').replace(/\s+/g,' ').trim(); return { t:k && t ? t+'…' : t, khoa:k }; }
  function tangTxt(a){ a = (a||[]).slice().sort(); return a.length ? (a.length>1 && a[a.length-1]!==a[0] ? 'T'+a[0]+'–T'+a[a.length-1] : 'T'+a[0]) : ''; }
  function veGiu(){
    var y = window.pageYOffset || 0, m = document.getElementById('main'), my = m ? m.scrollTop : 0;
    CO.luu(); window.scrollTo(0, y); if(m) m.scrollTop = my;
  }

  /* ───────── Dựng chỉ mục (mỗi lần vẽ — kho có thể vừa mở thêm) ───────── */
  function chiMuc(){
    var L = [];
    function them(k, ma, ten, tom, tang, tru, mo, src){
      if(!ma || !ten) return;
      var a = sach(ten), b = sach(tom);
      L.push({ loai:k, ma:String(ma), ten:a.t, tom:b.t, khoa:a.khoa || b.khoa, tang:soTang(tang), tru:tru||[], mo:mo, src:src,
        s:boDau(ma+' '+a.t+' '+b.t+' '+(src && (src.nhom||src.nhomTen||src.loai||'')||'')) });
    }
    function mang(x){ return Array.isArray(x) ? x : []; }
    mang(G.MOTHUC).forEach(function(x){ them('mt', x.id, x.title, x.summary, x.tier, [], 'modal', x); });
    mang(G.PHACDO).forEach(function(x){ them('pd', x.ma, x.ten, x.nhomTen || x.nguyenNhan || '', x.tang, [], 'pd', x); });
    mang(G.KICHBAN).forEach(function(x){ them('kb', x.ma, x.ten, x.muc || x.nhom || '', x.tang, [], 'kb', x); });
    mang(G.TINHHUONG).forEach(function(x){ them('th', x.key || x.ma || (x.tang+'-'+x.stt), x.th || x.ten, x.nhom || x.mo || '', x.tang, [], (x.tang && x.stt!=null) ? 'th' : 'modal', x); });
    mang(G.BAIHOC).forEach(function(x){ them('bh', x.id, x.ten, x.nguyenLy, x.tier, [], 'modal', x); });
    mang(G.TEST750).forEach(function(x){ them('ts', x.ma, x.tieuDe || x.ten, x.muc, x.tang, [], 'modal', x); });
    var tl = typeof G.taiLieuThayDuoc==='function' ? G.taiLieuThayDuoc() : mang(G.THUVIEN);
    tl.forEach(function(x){ them('tl', x.id, x.ten, x.moTa, x.tang || null, [], 'modal', x); });
    CO.dsCT().forEach(function(c){ them('ct', c.ma, c.ten, c.muc, c.tang, c.mien || [], 'modal', c); });
    CO.dsGP().forEach(function(g){ them('gp', g.ma, g.ten, g.muc, g.tang, g.tru ? [g.tru] : [], 'modal', g); });
    if((G.CO_TC||[]).length) them('tc', 'CO-TC', 'Thang chấm chất lượng buổi coach', (G.CO_TC||[]).length+' tiêu chí 0–4 · '+(G.CO_LANRANH||[]).length+' lằn ranh đỏ · băng điểm CQI', null, [], 'modal', { tc:1 });
    if(CO.nhip().length) them('nh', 'CO-NHIP', 'Khung sáu nhịp một buổi coach', CO.nhipNguon()+' · '+CO.nhip().map(function(n){ return n.ten; }).join(' → '), null, [], 'modal', { nh:1 });
    MAN_SAU.forEach(function(v){
      if(!(G.allowed && G.manCoThat && G.allowed(v) && G.manCoThat(v))) return;
      var it = G.navItem ? G.navItem(v) : null;
      them('man', v, it && it.t || v, it && it.h || 'Màn chuyên sâu', null, [], 'v', { v:v });
    });
    return L;
  }
  function khoa(x){ return x.loai+'|'+x.ma; }
  function ghimMap(){ var m = {}; CO.st().ghim.forEach(function(g){ m[g.loai+'|'+g.ma] = 1; }); return m; }
  function timMuc(L, loaiK, ma){ return L.filter(function(x){ return x.loai===loaiK && x.ma===ma; })[0] || null; }

  function nutMo(x){
    var a = x.mo==='pd' ? 'data-pd="'+h(x.ma)+'"' : x.mo==='kb' ? 'data-kb="'+h(x.ma)+'"' : x.mo==='th' ? 'data-th="'+h(x.src.tang+'-'+x.src.stt)+'"'
      : x.mo==='v' ? 'data-v="'+h(x.src.v)+'"' : 'data-co="kho-mo" data-l="'+h(x.loai)+'" data-ma="'+h(x.ma)+'"';
    return '<button class="btn sm" '+a+'>'+ic('eye','w-3 h-3')+'Mở</button>';
  }
  function dong(x, gm, them){
    var l = loai(x.loai), tom = x.tom.length > 170 ? x.tom.slice(0,170).replace(/\s+\S*$/,'')+'…' : x.tom;
    return '<div class="co-dong" style="align-items:flex-start;border-left:3px solid '+l.c+'"><span class="co-grow" style="min-width:200px">'+
      '<span class="co-meta" style="display:flex;flex-wrap:wrap;gap:6px;font-size:11px;margin-bottom:3px">'+U.chip(l.ten, l.c)+(x.tang.length?U.chip(tangTxt(x.tang)):'')+
      (x.tru.length?'<span class="tiny muted">trụ '+h(x.tru.join('·'))+'</span>':'')+(x.khoa?'<span class="co-tag">cần cấp phép</span>':'')+'</span>'+
      '<b class="sm" style="display:block;line-height:1.4">'+h(x.ten)+'</b>'+(tom?'<span class="tiny muted" style="display:block;line-height:1.5;margin-top:2px">'+h(tom)+'</span>':'')+'</span>'+
      '<span class="co-hang" style="gap:6px">'+(them||'')+nutMo(x)+
      '<button class="btn ghost sm" data-co="kho-ghim" data-l="'+h(x.loai)+'" data-ma="'+h(x.ma)+'" aria-pressed="'+!!gm[khoa(x)]+'">'+ic(gm[khoa(x)]?'check':'plus','w-3 h-3')+(gm[khoa(x)]?'Bỏ ghim':'Ghim')+'</button></span></div>';
  }

  /* ───────── Hộp xem nội dung đọc được ───────── */
  function the(t, c, html){ return '<div class="card pad-sm mb" style="border-color:'+c+'2a"><div class="tiny up mb" style="color:'+c+'">'+h(t)+'</div>'+html+'</div>'; }
  function para(s){ var a = sach(s); return '<p class="sm" style="line-height:1.65;margin:0">'+h(a.t)+(a.khoa?' <span class="co-tag">cần cấp phép</span>':'')+'</p>'; }
  function hop(x){
    var l = loai(x.loai), r = x.src, o = '<div class="row wrap" style="gap:6px;margin-bottom:9px">'+U.chip(l.ten, l.c)+U.chip(x.ma)+(x.tang.length?U.chip(tangTxt(x.tang)):'')+'</div>'+
      '<h2 style="font-size:20px;font-weight:800;line-height:1.3;margin-bottom:12px">'+h(x.ten)+'</h2>';
    if(x.loai==='ct'){
      o += the('Mục tiêu', l.c, para(r.muc)) + the('Đối tượng', l.c, para(r.doiTuong||'—'));
      o += the('Giai đoạn', l.c, '<div class="co-tb"><table style="min-width:0"><thead><tr><th>Giai đoạn</th><th>Ngày</th><th>Buổi</th><th>Cổng nghiệm thu</th></tr></thead><tbody>'+
        (r.gd||[]).map(function(g){ return '<tr><td><b>'+h(g.ten)+'</b><div class="tiny muted">'+h(g.muc||'')+'</div></td><td class="so">'+g.tu+'–'+g.den+'</td><td class="so">'+(g.buoi||1)+'</td><td>'+h(g.cong||'—')+'</td></tr>'; }).join('')+'</tbody></table></div>');
      o += the('KPI', l.c, U.list((r.kpi||[]).map(function(k){ return k[0]+': '+k[1]; }), l.c));
      o += the('Vào / ra', l.c, '<p class="sm" style="margin:0">Vào: '+h(r.vao||'—')+'<br>Ra: '+h(r.ra||'—')+'</p>');
      if(G.allowed && G.allowed('coach-ct')) o += '<button class="btn ghost sm" data-v="coach-ct">'+ic('compass','w-3 h-3')+'Mở Chương trình coach</button>';
    } else if(x.loai==='gp'){
      o += the('Mục tiêu', l.c, para(r.muc));
      o += the('Các bước', l.c, '<ol class="sm" style="margin:0;padding-left:20px;line-height:1.6">'+(r.buoc||[]).map(function(b){ return '<li>'+h(b)+'</li>'; }).join('')+'</ol>');
      o += the('Nhiệm vụ mẫu', l.c, U.list((r.nv||[]).map(function(n){ return n.ten+' — xong khi: '+n.xong+' · '+n.ngay+' ngày'; }), l.c));
      o += the('Dấu hiệu thành công', l.c, U.list(r.dau||[], l.c)) + the('Khi nào chuyển', '#B4720F', para(r.canh||'—'));
      if(G.allowed && G.allowed('coach-gp')) o += '<button class="btn ghost sm" data-co="kho-gp" data-ma="'+h(r.ma)+'">'+ic('spark','w-3 h-3')+'Mở trong Hệ thống giải pháp</button>';
    } else if(x.loai==='tc'){
      o += the('Mười tiêu chí (0–4)', l.c, '<div class="co-tb"><table style="min-width:0"><thead><tr><th>Tiêu chí</th><th>Mức 4 — chuẩn mẫu</th><th>Mức 0 — không đạt</th></tr></thead><tbody>'+
        (G.CO_TC||[]).map(function(t){ return '<tr><td><b>'+h(t.ten)+'</b></td><td>'+h(t.m4)+'</td><td>'+h(t.m0)+'</td></tr>'; }).join('')+'</tbody></table></div>');
      o += the('Lằn ranh đỏ — chạm là dưới chuẩn', '#BE0E16', U.list((G.CO_LANRANH||[]).map(function(x){ return x.ten; }), '#BE0E16'));
      o += the('Băng điểm CQI', l.c, U.list((G.CO_BANG||[]).map(function(b){ return 'Từ '+b.tu+': '+b.ten; }), l.c));
    } else if(x.loai==='nh'){
      o += '<p class="tiny muted mb">Nguồn: '+h(CO.nhipNguon())+'</p>';
      o += CO.nhip().map(function(n){ return the(n.no+' · '+n.ten+' · '+n.phut+' phút', n.c||l.c, '<p class="sm" style="margin:0 0 4px;line-height:1.6">'+h(n.lam||'')+'</p>'+
        (n.hoi?'<p class="sm" style="margin:0 0 4px"><b>Câu hỏi:</b> '+h(n.hoi)+'</p>':'')+(n.tranh?'<p class="sm" style="margin:0;color:#BE0E16"><b>Tránh:</b> '+h(n.tranh)+'</p>':'')); }).join('');
    } else if(x.loai==='tl'){
      o += the('Mô tả', l.c, para(r.moTa||'—'));
      o += the('Hồ sơ tài liệu', l.c, '<p class="sm" style="margin:0;line-height:1.7">Loại: '+h(r.loai||'—')+'<br>Tệp: '+h(r.tenTep||'—')+(r.daLuuTep?'':' <span class="co-tag">tệp chưa lưu lên máy chủ</span>')+
        '<br>Trạng thái: '+h(r.trangThai||'—')+'<br>Người gửi: '+h(r.nguoiGui||'—')+'</p>');
      if(G.allowed && G.allowed('thu-vien')) o += '<button class="btn ghost sm" data-v="thu-vien">'+ic('book','w-3 h-3')+'Mở Thư viện tài liệu</button>';
    } else {
      var bo = { id:1, ma:1, stt:1, key:1, title:1, ten:1, tieuDe:1, th:1 };
      Object.keys(r).forEach(function(k){
        if(bo[k]) return; var v = r[k]; if(v==null || v==='') return;
        var nh = NHAN[k] || k;
        if(Array.isArray(v)){ if(v.length && typeof v[0] !== 'object') o += the(nh, l.c, U.list(v.map(String), l.c)); }
        else if(typeof v !== 'object') o += the(nh, l.c, para(String(v)));
      });
    }
    if(x.khoa) o += '<p class="tiny muted mt">Phần có nhãn "cần cấp phép" mở đủ sau khi giấy phép được cấp hoặc máy chủ được nối.</p>';
    return o;
  }

  /* ───────── Tabs ───────── */
  function tabTim(L, gm){
    var s = CO.st(), q = boDau(s.khoQ||''), fl = s.khoLoai||'', ft = s.khoTang||'', fr = s.khoTru||'', n = s.khoN || 40;
    var co = {}; L.forEach(function(x){ co[x.loai] = (co[x.loai]||0)+1; });
    var tu = q.split(/\s+/).filter(function(x){ return x; });
    var ds = L.filter(function(x){
      if(fl && x.loai!==fl) return false;
      if(ft && x.tang.indexOf(Number(ft)) < 0) return false;
      if(fr && x.tru.indexOf(fr) < 0) return false;
      return tu.every(function(w){ return x.s.indexOf(w) >= 0; });
    });
    if(tu.length) ds.sort(function(a,b){ var A = boDau(a.ten).indexOf(tu[0])>=0 ? 0 : 1, B = boDau(b.ten).indexOf(tu[0])>=0 ? 0 : 1; return A - B; });
    var o = '<div class="card pad-sm mb"><div class="co-form">'+
      CO.o2('Tìm trong kho', '<input class="inp" id="kho-q" type="search" value="'+h(s.khoQ||'')+'" placeholder="VD: trì hoãn, baseline, họp nhà…" data-co-ch="kho-q">')+
      CO.o2('Loại', CO.chon('kho-loai', [['','Mọi loại']].concat(LOAI.filter(function(l){ return co[l.k]; }).map(function(l){ return [l.k, l.ten+' ('+co[l.k]+')']; })), fl, ' data-co-ch="kho-loc"'))+
      CO.o2('Tầng', CO.chon('kho-tang', [['','Mọi tầng']].concat([1,2,3,4,5].map(function(t){ return [String(t), 'T'+t]; })), ft, ' data-co-ch="kho-loc"'))+
      CO.o2('Trụ', CO.chon('kho-tru', [['','Mọi trụ']].concat((G.GITA||[]).map(function(g){ return [g.k, g.k+' · '+g.short]; })), fr, ' data-co-ch="kho-loc"'))+
      '</div><div class="co-hang mt"><button class="btn pri sm" data-co="kho-q">'+ic('search','w-3 h-3')+'Tìm</button>'+
      (s.khoQ||fl||ft||fr ? '<button class="btn ghost sm" data-co="kho-xoa-loc">Bỏ lọc</button>' : '')+
      '<span class="tiny muted">'+ds.length+' / '+L.length+' mục'+(fr?' · lọc trụ chỉ áp cho mục có gắn trụ (chương trình, giải pháp)':'')+'</span></div></div>';
    o += ds.length ? '<div class="co-ds">'+ds.slice(0, n).map(function(x){ return dong(x, gm); }).join('')+'</div>'+
      (ds.length > n ? '<div class="center mt"><button class="btn sm" data-co="kho-them">Hiện thêm 40 mục</button><p class="tiny muted mt">Đang hiện '+n+' / '+ds.length+'</p></div>' : '')
      : '<div class="card center" style="padding:26px"><b>Không có mục nào khớp</b><p class="sm muted mt">Thử từ khoá ngắn hơn hoặc bỏ bớt bộ lọc.</p></div>';
    return o;
  }

  function tabLoai(L){
    var co = {}; L.forEach(function(x){ co[x.loai] = (co[x.loai]||0)+1; });
    var max = Math.max.apply(null, LOAI.map(function(l){ return co[l.k]||0; }).concat([1]));
    var o = '<div class="co-ds">'+LOAI.map(function(l){ var v = co[l.k]||0;
      return '<button type="button" class="co-dong" style="text-align:left;cursor:pointer;color:inherit;font:inherit;width:100%'+(v?'':';opacity:.55')+'" data-co="kho-chon-loai" data-l="'+l.k+'"'+(v?'':' disabled')+'>'+
        '<span style="color:'+l.c+'">'+ic(l.ic,'w-4 h-4')+'</span><span style="min-width:150px" class="sm"><b>'+h(l.ten)+'</b></span>'+
        '<span class="co-grow"><span class="co-thanhbar" style="--m:'+l.c+';display:block"><i style="width:'+Math.round(100*v/max)+'%"></i></span></span>'+
        '<b class="co-so sm" style="min-width:44px;text-align:right">'+v+'</b></button>'; }).join('')+'</div>';
    o += '<p class="tiny muted mt">Loại có 0 mục là kho chưa có trên máy này (chưa cấp phép, hoặc vai không mở màn đó). Bấm một loại để lọc ở tab Tìm.</p>';
    return o;
  }

  function tabGhim(L, gm){
    var G2 = CO.st().ghim;
    if(!G2.length) return '<div class="card center" style="padding:30px"><b>Chưa ghim tài liệu nào</b><p class="sm muted mt">Bấm "Ghim" ở kết quả tìm kiếm. Tài liệu đã ghim hiện ở màn Thiết kế bài coach để đính kèm vào buổi.</p></div>';
    return '<div class="co-ds">'+G2.map(function(g, i){
      var x = timMuc(L, g.loai, g.ma);
      var len = '<button class="btn ghost sm" data-co="kho-len" data-i="'+i+'" aria-label="Đưa lên"'+(i===0?' disabled':'')+'>↑</button>'+
        '<button class="btn ghost sm" data-co="kho-xuong" data-i="'+i+'" aria-label="Đưa xuống"'+(i===G2.length-1?' disabled':'')+'>↓</button>';
      if(x) return dong(x, gm, len);
      return '<div class="co-dong" style="opacity:.7"><span class="co-grow sm"><b>'+h(g.ten||g.ma)+'</b><div class="tiny muted">'+h(loai(g.loai).ten)+' · không còn trong kho trên máy này (kho chưa mở hoặc đã bị xoá)</div></span>'+len+
        '<button class="btn ghost sm" data-co="kho-bo" data-i="'+i+'">'+ic('x','w-3 h-3')+'Bỏ ghim</button></div>';
    }).join('')+'</div><p class="tiny muted mt">'+G2.length+' tài liệu đã ghim · thứ tự này là thứ tự hiện ở màn Thiết kế bài coach.</p>';
  }

  function tabGui(){
    var duoc = G.allowed && G.allowed('gui-tu-lieu');
    var lv = (G.PERM||{}).tl_gui_khach, vai = (G.ROLES||[]).filter(function(r){ return lv && r.lv <= lv; }).map(function(r){ return r.short || r.n; });
    var o = '<div class="grid g2"><div class="card pad-sm" style="border-left:4px solid var(--gita)"><b>Trần nội dung 30%</b>'+
      '<p class="sm" style="line-height:1.65;margin:6px 0 0">Gia đình mở sẵn khoảng 30% kho tư liệu GITA. Phần còn lại không tự mở ra: nó đi qua một người thật — đọc lời xin, nhìn KPI của nhà, rồi mới gửi, để tài liệu tới đúng nhà, đúng lúc, có người giải thích.</p></div>'+
      '<div class="card pad-sm" style="border-left:4px solid #0B7350"><b>Cửa KPI '+h(G.KPI_XIN_THEM || 80)+'%</b>'+
      '<p class="sm" style="line-height:1.65;margin:6px 0 0">Nhà đạt KPI từ '+h(G.KPI_XIN_THEM || 80)+'% trở lên mới xin thêm tư liệu được. Coach không gửi tài liệu thay cho việc nhà phải làm — tư liệu đi kèm nhiệm vụ và tiêu chí xong.</p></div></div>';
    o += '<div class="card pad-sm mt2">';
    if(duoc) o += '<p class="sm" style="margin:0 0 10px">Vai của anh/chị được gửi tư liệu cho gia đình. Lời xin đang chờ và cửa KPI nằm ở màn Gửi tư liệu.</p><button class="btn pri sm" data-v="gui-tu-lieu">'+ic('share','w-3 h-3')+'Mở Gửi tư liệu cho gia đình</button>';
    else o += '<p class="sm" style="margin:0">Vai hiện tại không gửi tư liệu cho gia đình. Người gửi được: '+h(vai.length ? vai.join(', ') : 'Tư vấn và Coach phụ trách nhà')+'. Ghim tài liệu ở đây rồi nhờ Coach phụ trách nhà gửi.</p>';
    o += '</div><p class="tiny muted mt">Mọi lần gửi đi qua cửa có ghi nhật ký; không chép tài liệu ra ngoài hệ.</p>';
    return o;
  }

  /* ───────── Màn ───────── */
  G.VIEWS[VIEW] = function(){
    var k = CO.cua('pro_coach', 'Kho tài liệu coach'); if(k) return k;
    CO.napMau();
    var s = CO.st(), L = chiMuc(), gm = ghimMap();
    var soLoai = {}; L.forEach(function(x){ soLoai[x.loai] = 1; });
    var mau = G.KHO && G.KHO.cheDoMau;
    var o = U.ph({ eyebrow:'COACH · KHO TÀI LIỆU', ic:'vault', grad:1, t:'Kho tài liệu coach',
      lead:'Một cửa tìm mọi tư liệu đang có trên máy: mô thức, phác đồ, kịch bản, tình huống, bài học, bộ test, tài liệu tải lên — cùng hướng dẫn chương trình, thẻ giải pháp và các màn chuyên sâu.' });
    o += '<div class="co-hang mb"><button class="btn ghost sm" data-v="coach-he">← Hệ điều hành Coach</button></div>';
    o += CO.banMau();
    o += '<div class="grid g4 mb">'+
      U.stat({ k:'Mục trong kho', v:L.length.toLocaleString('vi-VN'), d:'đếm thật trên máy này' })+
      U.stat({ k:'Số loại', v:Object.keys(soLoai).length+'/'+LOAI.length, d:'loại đang có mục' })+
      U.stat({ k:'Đã ghim', v:String(s.ghim.length), d:'dùng ở Thiết kế bài coach' })+
      U.stat({ k:'Trạng thái kho', v:mau ? 'Bản mẫu' : 'Đã mở', d:mau ? 'bản mẫu — cấp phép để mở đủ' : 'kho nghề đã nạp', c:mau ? '#B4720F' : '#0B7350' })+'</div>';
    var tab = CO.tab(VIEW, 'tim');
    o += CO.tabs(VIEW, [['tim','Tìm','search'],['loai','Theo loại','chart'],['ghim','Đã ghim','star'],['gui','Gửi cho gia đình','share']], tab);
    if(tab==='loai') o += tabLoai(L);
    else if(tab==='ghim') o += tabGhim(L, gm);
    else if(tab==='gui') o += tabGui();
    else o += tabTim(L, gm);
    return o;
  };

  /* ───────── Thao tác ───────── */
  CO.on('kho-q', function(){
    if(!document.getElementById('kho-q')) return;
    var s = CO.st(); s.khoQ = CO.o('kho-q').slice(0,80); s.khoN = 40; CO.luu();
  });
  CO.on('kho-loc', function(){
    var s = CO.st(); s.khoQ = CO.o('kho-q').slice(0,80); s.khoLoai = CO.o('kho-loai'); s.khoTang = CO.o('kho-tang'); s.khoTru = CO.o('kho-tru'); s.khoN = 40; CO.luu();
  });
  CO.on('kho-xoa-loc', function(){ var s = CO.st(); s.khoQ = ''; s.khoLoai = ''; s.khoTang = ''; s.khoTru = ''; s.khoN = 40; CO.luu(); });
  CO.on('kho-them', function(){ var s = CO.st(); s.khoN = (s.khoN||40) + 40; veGiu(); });
  CO.on('kho-chon-loai', function(el){ var s = CO.st(); s.khoLoai = el.getAttribute('data-l'); s.khoN = 40; s.tab[VIEW] = 'tim'; CO.luu(); });
  CO.on('kho-mo', function(el){
    var x = timMuc(chiMuc(), el.getAttribute('data-l'), el.getAttribute('data-ma'));
    if(!x){ U.toast('Mục này không còn trong kho trên máy này.','err'); return; }
    U.modal(hop(x));
  });
  CO.on('kho-gp', function(el){ U.closeModal(); CO.st().gpChon = el.getAttribute('data-ma'); CO.luu(false); G.go('coach-gp'); });
  CO.on('kho-ghim', function(el){
    var s = CO.st(), l = el.getAttribute('data-l'), ma = el.getAttribute('data-ma');
    var i = -1; s.ghim.forEach(function(g, j){ if(g.loai===l && g.ma===ma) i = j; });
    if(i >= 0){ s.ghim.splice(i, 1); veGiu(); U.toast('Đã bỏ ghim.','ok'); return; }
    var x = timMuc(chiMuc(), l, ma); if(!x){ U.toast('Không tìm thấy mục để ghim.','err'); return; }
    if(s.ghim.length >= 60){ U.toast('Đã ghim 60 mục — bỏ bớt trước khi ghim thêm.','err'); return; }
    s.ghim.push({ loai:l, ma:ma, ten:x.ten, luc:Date.now() }); veGiu(); U.toast('Đã ghim "'+x.ten.slice(0,60)+'".','ok');
  });
  function doi(i, j){ var a = CO.st().ghim; if(i<0 || j<0 || i>=a.length || j>=a.length) return; var t = a[i]; a[i] = a[j]; a[j] = t; veGiu(); }
  CO.on('kho-len', function(el){ var i = Number(el.getAttribute('data-i')); doi(i, i-1); });
  CO.on('kho-xuong', function(el){ var i = Number(el.getAttribute('data-i')); doi(i, i+1); });
  CO.on('kho-bo', function(el){ CO.st().ghim.splice(Number(el.getAttribute('data-i')), 1); veGiu(); U.toast('Đã bỏ ghim.','ok'); });
})();
