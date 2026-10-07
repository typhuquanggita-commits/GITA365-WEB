/* ═══════════════════════════════════════════════════════════════
   GITA 365 — HỆ ĐIỀU HÀNH COACH · HỆ THỐNG GIẢI PHÁP (coach-gp)

   Một thư viện giải pháp neo theo vấn đề G–I–T–A:

     Thư viện        24 giải pháp chuẩn (G.CO_GP) + giải pháp tự soạn:
                     mục tiêu · bước · công cụ · nhiệm vụ mẫu · dấu hiệu
                     thành công · khi nào chuyển → "Áp dụng cho nhà"
                     giao nhiệm vụ mẫu thẳng vào nhật ký (CO.ghi).
     Tìm theo vấn đề chọn vấn đề (hoặc nạp từ phân tích một nhà) → xếp
                     hạng giải pháp theo số vấn đề khớp và độ hợp tầng.
     Soạn giải pháp  cùng khuôn với G.CO_GP, lưu ở sổ (CO.st().gp);
                     quản lý đánh dấu "duyệt dùng chung".
     Phác đồ chuẩn   220 phác đồ (G.PHACDO) khi kho đã mở.

   Màn đọc sổ chung coach-loi.js; không công thức riêng. Mở cho pro_coach.
   Không đụng máy chủ · giấy phép · mã hoá.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic, CO = G.CO;
  var VIEW = 'coach-gp';
  var TIEN_TO = 'Áp dụng giải pháp ';

  function gita(){ return G.GITA || []; }
  function tru(k){ return gita().filter(function(g){ return g.k===k; })[0] || { k:k||'?', short:k||'—', c:'#73849F' }; }
  function vdTen(ma){ var x = (G.CO_VD||[]).filter(function(v){ return v.ma===ma; })[0]; return x ? x.ten : ma; }
  function boDau(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d'); }
  function laTu(g){ return /^GP-TU-/.test(g.ma||''); }
  function tangTxt(a){ a = (a||[]).slice().sort(); return a.length ? (a.length > 1 ? 'T'+a[0]+'–T'+a[a.length-1] : 'T'+a[0]) : 'Mọi tầng'; }
  function suaDuoc(g){ return laTu(g) && (CO.laQuanLy() || !g.ai || g.ai===CO.toi().u); }
  /* Giải pháp tự soạn: Coach thấy của mình + bản đã duyệt; quản lý thấy hết. */
  function dsThay(){
    var me = CO.toi().u;
    return (G.CO_GP||[]).concat(CO.st().gp.filter(function(g){ return CO.laQuanLy() || g.duyet || !g.ai || g.ai===me; }));
  }
  function dsManMo(){
    var out = [], da = {};
    (G.NAV||[]).forEach(function(n){ (n.items||[]).forEach(function(x){
      if(x.v && !da[x.v] && G.allowed && G.allowed(x.v) && G.manCoThat && G.manCoThat(x.v)){ da[x.v] = 1; out.push([x.v, x.t]); } }); });
    return out;
  }
  function apDung(){
    var me = CO.toi().u, dk = {};
    CO.dsDK().forEach(function(d){ dk[d.id] = 1; });
    return CO.st().hd.filter(function(e){ return e.loai==='ghi_chu' && String(e.ghi||'').indexOf(TIEN_TO)===0 && (CO.laQuanLy() || e.ai===me || dk[e.dk]); });
  }
  function veGiu(){
    var y = window.pageYOffset || 0, m = document.getElementById('main'), my = m ? m.scrollTop : 0;
    CO.luu(); window.scrollTo(0, y); if(m) m.scrollTop = my;
  }

  /* ───────── Thẻ & chi tiết ───────── */
  function the(g, them){
    var t = tru(g.tru);
    return '<div class="co-the nhan" style="--c:'+t.c+'"><div class="co-meta"><span style="color:'+t.c+';font-weight:700">'+h(t.k+' · '+t.short)+'</span>'+
      '<span>'+h(g.ma)+'</span><span>'+h(tangTxt(g.tang))+'</span><span>'+(g.ngay||'—')+' ngày</span>'+
      (laTu(g) ? '<span class="co-tag">'+(g.duyet?'tự soạn · đã duyệt':'tự soạn')+'</span>' : '')+'</div>'+
      '<h3>'+h(g.ten)+'</h3><p class="tiny muted" style="margin:0;line-height:1.5">'+h(g.muc||'')+'</p>'+(them||'')+
      '<div><button class="btn ghost sm" data-co="gp-mo" data-ma="'+h(g.ma)+'">'+ic('eye','w-3 h-3')+'Xem chi tiết</button></div></div>';
  }

  function chiTiet(g){
    var t = tru(g.tru), dk = CO.dsDK().filter(function(d){ return d.tt==='dang'; });
    var o = '<div class="co-hang mb"><button class="btn ghost sm" data-co="gp-dong">← Về thư viện</button></div>';
    o += '<div class="card pad-sm" style="border-left:4px solid '+t.c+'">'+
      '<div class="co-hang tiny"><b style="color:'+t.c+'">'+h(t.k+' · '+t.short)+'</b><span class="muted">'+h(g.ma)+' · '+h(tangTxt(g.tang))+' · '+(g.ngay||'—')+' ngày</span>'+
      (laTu(g) ? '<span class="co-tag">'+(g.duyet?'tự soạn · đã duyệt dùng chung':'tự soạn')+'</span>' : '')+'</div>'+
      '<h2 style="font-size:20px;font-weight:800;margin:6px 0 4px">'+h(g.ten)+'</h2>'+
      '<p class="sm" style="margin:0 0 4px"><b>Mục tiêu:</b> '+h(g.muc||'—')+'</p>'+
      ((g.vd||[]).length ? '<p class="tiny muted" style="margin:0">Gỡ vấn đề: '+h(g.vd.map(vdTen).join(' · '))+'</p>' : '')+'</div>';
    o += '<div class="grid g2 mt2" style="align-items:start"><div>';
    o += U.sec('Các bước');
    o += '<ol class="sm" style="margin:0;padding-left:20px;line-height:1.6">'+(g.buoc||[]).map(function(b){ return '<li style="margin-bottom:4px">'+h(b)+'</li>'; }).join('')+'</ol>';
    var cc = (g.cong||[]).filter(function(c){ return G.allowed && G.manCoThat && G.allowed(c[0]) && G.manCoThat(c[0]); });
    o += U.sec('Công cụ', cc.length ? '' : 'Không có công cụ nào vai này mở được');
    if(cc.length) o += '<div class="co-hang">'+cc.map(function(c){ return '<button class="btn ghost sm" data-v="'+h(c[0])+'">'+ic('arrow','w-3 h-3')+h(c[1]||c[0])+'</button>'; }).join('')+'</div>';
    o += U.sec('Dấu hiệu thành công');
    o += (g.dau||[]).length ? U.list(g.dau, '#0B7350') : '<p class="sm muted">—</p>';
    o += U.sec('Khi nào chuyển hướng');
    o += '<div class="co-cb"><div style="--m:#B4720F">'+ic('alert','w-4 h-4')+'<span>'+h(g.canh && g.canh!=='—' ? g.canh : 'Chưa ghi điều kiện chuyển — theo dõi dấu hiệu thành công sau '+(g.ngay||7)+' ngày.')+'</span></div></div>';
    o += '</div><div>';
    o += U.sec('Nhiệm vụ mẫu', (g.nv||[]).length+' nhiệm vụ');
    o += (g.nv||[]).length ? '<div class="co-tb"><table style="min-width:0"><thead><tr><th>Nhiệm vụ</th><th>Tiêu chí xong</th><th>Ngày</th></tr></thead><tbody>'+
      g.nv.map(function(n){ return '<tr><td>'+h(n.ten)+'</td><td>'+h(n.xong||'—')+'</td><td class="so">'+(n.ngay||'—')+'</td></tr>'; }).join('')+'</tbody></table></div>' : '<p class="sm muted">— Không có nhiệm vụ mẫu.</p>';
    /* Áp dụng */
    o += U.sec('Áp dụng cho nhà', 'Giao nhiệm vụ mẫu vào nhật ký nhà, có hạn');
    if(dk.length){
      o += '<div class="card pad-sm"><div class="co-form">'+CO.o2('Nhà đang tham gia', CO.chon('gp-dk', dk.map(function(d){ var c = CO.ct(d.ct);
          return [d.id, d.tenNha+(c?' · '+c.ten:'')+(d.mau && !/minh hoạ/.test(d.tenNha)?' (minh hoạ)':'')]; }), CO.st().gpDK || ''))+'</div>'+
        '<p class="tiny muted" style="margin:8px 0">Sẽ giao '+(g.nv||[]).length+' nhiệm vụ, hạn tính từ hôm nay ('+h(CO.ngayVN(CO.homNay()))+') theo số ngày của từng nhiệm vụ, và ghi một dòng "Áp dụng giải pháp" vào nhật ký. Nhà tự làm — Coach soi bằng chứng, không làm thay.</p>'+
        '<button class="btn pri sm" data-co="gp-ap" data-ma="'+h(g.ma)+'">'+ic('check','w-3 h-3')+'Áp dụng cho nhà</button></div>';
    } else {
      o += '<div class="card pad-sm"><p class="sm muted" style="margin:0">Chưa có nhà nào đang tham gia chương trình. Ghép chương trình cho một nhà trước, rồi quay lại áp dụng.</p>'+
        (G.allowed && G.allowed('coach-ct') ? '<button class="btn ghost sm mt" data-v="coach-ct">'+ic('compass','w-3 h-3')+'Mở Chương trình coach</button>' : '')+'</div>';
    }
    var da = apDung().filter(function(e){ return String(e.ghi).indexOf(TIEN_TO+g.ma+' ')===0; });
    if(da.length) o += '<p class="tiny muted mt">Đã áp dụng '+da.length+' lần: '+h(da.slice(-5).map(function(e){ return CO.tenNha(e.nha)+' ('+CO.gioVN(e.t).slice(0,5)+')'; }).join(' · '))+'</p>';
    if(suaDuoc(g)) o += '<div class="co-hang mt2"><button class="btn ghost sm" data-co="gp-sua" data-ma="'+h(g.ma)+'">'+ic('edit','w-3 h-3')+'Sửa</button>'+
      '<button class="btn ghost sm" data-co="gp-xoa" data-ma="'+h(g.ma)+'">'+ic('x','w-3 h-3')+'Xoá</button></div>';
    o += '</div></div>';
    return o;
  }

  /* ───────── Tab: Thư viện ───────── */
  function tabThuVien(){
    var s = CO.st(), L = s.gpLoc || {};
    if(s.gpMo){ var g = CO.gp(s.gpMo); if(g) return chiTiet(g); }
    var q = boDau(L.q||'');
    var ds = dsThay().filter(function(g){
      if(L.tru && g.tru !== L.tru) return false;
      if(L.tang && g.tang && g.tang.indexOf(Number(L.tang)) < 0) return false;
      if(q && boDau([g.ten, g.muc, (g.buoc||[]).join(' '), g.ma].join(' ')).indexOf(q) < 0) return false;
      return true; });
    var o = '<div class="card pad-sm mb"><div class="co-form">'+
      CO.o2('Trụ', CO.chon('gp-f-tru', [['','Cả bốn trụ']].concat(gita().map(function(t){ return [t.k, t.k+' · '+t.short]; })), L.tru||'', ' data-co-ch="gp-loc"'))+
      CO.o2('Tầng', CO.chon('gp-f-tang', [['','Mọi tầng']].concat((G.TIERS||[]).map(function(t){ return [String(t.id), t.code+' · '+t.name]; })), L.tang||'', ' data-co-ch="gp-loc"'))+
      CO.o2('Tìm trong tên, mục tiêu, bước', '<input class="inp" id="gp-f-q" value="'+h(L.q||'')+'" placeholder="VD: trì hoãn, họp nhà…" data-co-ch="gp-loc">')+
      '</div><div class="co-hang mt"><button class="btn sm" data-co="gp-loc">'+ic('search','w-3 h-3')+'Lọc</button>'+
      (L.tru||L.tang||L.q ? '<button class="btn ghost sm" data-co="gp-loc-xoa">Bỏ lọc</button>' : '')+
      '<span class="tiny muted">'+ds.length+' / '+dsThay().length+' giải pháp</span></div></div>';
    o += ds.length ? '<div class="co-luoi">'+ds.map(function(g){ return the(g); }).join('')+'</div>'
      : '<div class="card center" style="padding:26px"><b>Không có giải pháp khớp bộ lọc</b><p class="sm muted mt">Bỏ bớt điều kiện, hoặc soạn một giải pháp mới ở tab "Soạn giải pháp".</p></div>';
    return o;
  }

  /* ───────── Tab: Tìm theo vấn đề ───────── */
  function tabTim(){
    var s = CO.st(), chon = s.gpVD || [], tang = s.gpTimTang || '';
    var ptDs = Object.keys(s.pt||{}).map(function(m){ return [m, (s.pt[m].tenNha||m)+(s.pt[m].mau && !/minh hoạ/.test(s.pt[m].tenNha||'')?' (minh hoạ)':'')]; });
    var o = '<div class="card pad-sm mb"><div class="co-form">'+
      CO.o2('Nạp vấn đề từ phân tích của nhà', ptDs.length ? CO.chon('gp-pt', [['','— Chọn nhà đã phân tích —']].concat(ptDs), s.gpTimNha||'', ' data-co-ch="gp-nap-pt"')
        : '<span class="sm muted" style="font-weight:400">Chưa có hồ sơ phân tích nào'+(G.allowed && G.allowed('coach-pt') ? ' — lập ở màn Phân tích.' : '.')+'</span>')+
      CO.o2('Tầng của nhà (để xét độ hợp)', CO.chon('gp-tim-tang', [['','Chưa xét tầng']].concat((G.TIERS||[]).map(function(t){ return [String(t.id), t.code+' · '+t.name]; })), tang, ' data-co-ch="gp-tim-tang"'))+
      '</div><p class="tiny muted" style="margin:8px 0 0">Nạp từ phân tích sẽ chọn sẵn các vấn đề ở mức 2 (rõ) trở lên và tầng máy đề xuất cho nhà đó.</p></div>';
    o += '<div class="grid g2" style="align-items:start"><div>';
    o += U.sec('Vấn đề đang chọn', chon.length+' / '+(G.CO_VD||[]).length);
    o += gita().map(function(t){
      var ds = (G.CO_VD||[]).filter(function(x){ return x.tru===t.k; });
      return '<div class="card pad-sm mb" style="border-left:4px solid '+t.c+'"><b class="sm" style="color:'+t.c+'">'+h(t.k+' · '+t.short)+'</b><div class="co-ds" style="margin-top:6px;gap:4px">'+
        ds.map(function(x){ return '<label class="sm" style="display:flex;gap:8px;align-items:flex-start;cursor:pointer"><input type="checkbox" id="gp-vd-'+h(x.ma)+'" data-co-ch="gp-vd" data-ma="'+h(x.ma)+'"'+(chon.indexOf(x.ma)>=0?' checked':'')+'> <span>'+h(x.ten)+'</span></label>'; }).join('')+'</div></div>';
    }).join('');
    if(chon.length) o += '<button class="btn ghost sm" data-co="gp-vd-xoa">Bỏ chọn tất cả</button>';
    o += '</div><div>';
    var kq = dsThay().map(function(g){
      var khop = (g.vd||[]).filter(function(m){ return chon.indexOf(m) >= 0; });
      var hop = tang && (!g.tang || g.tang.indexOf(Number(tang)) >= 0);
      return { g:g, khop:khop, hop:hop, diem:khop.length + (hop ? 0.5 : 0) };
    }).filter(function(x){ return x.khop.length; }).sort(function(a,b){ return b.diem - a.diem || a.g.ma.localeCompare(b.g.ma); });
    o += U.sec('Giải pháp xếp hạng', chon.length ? kq.length+' giải pháp khớp' : 'Chọn ít nhất một vấn đề');
    o += kq.length ? '<div class="co-ds">'+kq.map(function(x, i){
      var t = tru(x.g.tru);
      return '<div class="co-dong" style="border-left:3px solid '+t.c+'"><b class="co-so" style="min-width:22px;color:var(--ink-4)">'+(i+1)+'</b>'+
        '<span class="co-grow" style="min-width:200px"><b class="sm">'+h(x.g.ten)+'</b> <span class="tiny muted">'+h(x.g.ma)+' · '+h(tangTxt(x.g.tang))+'</span>'+
        '<div class="tiny muted">Khớp '+x.khop.length+'/'+chon.length+' vấn đề: '+h(x.khop.map(vdTen).join(' · '))+
        (tang ? (x.hop ? ' · hợp tầng T'+h(tang)+' (+0,5)' : ' · không thuộc tầng T'+h(tang)) : '')+'</div></span>'+
        '<span class="tiny co-so" style="font-weight:800">'+String(x.diem).replace('.',',')+'</span>'+
        '<button class="btn ghost sm" data-co="gp-mo" data-ma="'+h(x.g.ma)+'">'+ic('eye','w-3 h-3')+'Xem</button></div>'; }).join('')+'</div>'+
      '<p class="tiny muted mt">Điểm = số vấn đề đã chọn mà giải pháp gỡ + 0,5 nếu hợp tầng. Máy xếp hạng; Coach chọn giải pháp hợp với nhà.</p>'
      : '<p class="sm muted">'+(chon.length ? 'Chưa có giải pháp nào gỡ các vấn đề này — soạn một giải pháp mới ở tab "Soạn giải pháp".' : '—')+'</p>';
    o += '</div></div>';
    return o;
  }

  /* ───────── Tab: Soạn giải pháp ───────── */
  function nhapMoi(){ return { ten:'', tru:'G', vd:[], tang:[], ngay:14, muc:'', buoc:['',''], cong:[], nv:[{ten:'', xong:'', ngay:3}], dau:[''], canh:'' }; }
  function nhap(){ var s = CO.st(); if(!s.gpNhap || typeof s.gpNhap !== 'object') s.gpNhap = nhapMoi(); return s.gpNhap; }
  /* Đọc toàn bộ ô của form vào bản nháp (trước khi vẽ lại). */
  function docForm(){
    var n = nhap(); if(!document.getElementById('gps-ten')) return n;
    n.ten = CO.o('gps-ten'); n.tru = CO.o('gps-tru') || 'G'; n.ngay = CO.o('gps-ngay'); n.muc = CO.o('gps-muc'); n.canh = CO.o('gps-canh');
    n.vd = (G.CO_VD||[]).filter(function(v){ return CO.o('gps-vd-'+v.ma)===true; }).map(function(v){ return v.ma; });
    n.tang = [1,2,3,4,5].filter(function(t){ return CO.o('gps-tang-'+t)===true; });
    n.buoc = (n.buoc||[]).map(function(x,i){ return CO.o('gps-buoc-'+i); });
    n.dau = (n.dau||[]).map(function(x,i){ return CO.o('gps-dau-'+i); });
    n.cong = (n.cong||[]).map(function(x,i){ return [CO.o('gps-cong-v-'+i), CO.o('gps-cong-t-'+i)]; });
    n.nv = (n.nv||[]).map(function(x,i){ return { ten:CO.o('gps-nv-t-'+i), xong:CO.o('gps-nv-x-'+i), ngay:CO.o('gps-nv-n-'+i) }; });
    return n;
  }
  function tabSoan(){
    var s = CO.st(), n = nhap(), man = dsManMo();
    var o = '';
    o += '<div class="card pad-sm"><div class="co-hang mb"><b>'+(s.gpSua ? 'Sửa giải pháp '+h(s.gpSua) : 'Giải pháp mới')+'</b><span class="co-grow"></span>'+
      (s.gpSua ? '<button class="btn ghost sm" data-co="gps-huy">Huỷ sửa</button>' : '<span class="tiny muted">Bản nháp tự giữ khi đổi ô</span>')+'</div>';
    o += '<div class="co-form">'+
      CO.o2('Tên giải pháp', '<input class="inp" id="gps-ten" maxlength="90" value="'+h(n.ten)+'" data-co-ch="gps-nhap" placeholder="VD: Bảng việc buổi sáng 3 ô">')+
      CO.o2('Trụ', CO.chon('gps-tru', gita().map(function(t){ return [t.k, t.k+' · '+t.short]; }), n.tru, ' data-co-ch="gps-nhap"'))+
      CO.o2('Số ngày áp dụng', '<input class="inp" id="gps-ngay" type="number" min="1" max="365" value="'+h(n.ngay)+'" data-co-ch="gps-nhap">')+'</div>';
    o += '<div class="co-form mt">'+CO.o2('Mục tiêu (kết quả quan sát được)', '<textarea class="inp" id="gps-muc" rows="2" maxlength="300" data-co-ch="gps-nhap">'+h(n.muc)+'</textarea>')+'</div>';
    o += '<div class="co-f mt"><span>Tầng áp dụng</span><div class="co-hang">'+[1,2,3,4,5].map(function(t){
      return '<label class="sm" style="display:flex;gap:5px;align-items:center"><input type="checkbox" id="gps-tang-'+t+'" data-co-ch="gps-nhap"'+(n.tang.indexOf(t)>=0?' checked':'')+'>T'+t+'</label>'; }).join('')+'</div></div>';
    o += '<div class="co-f mt"><span>Vấn đề giải pháp này gỡ (chọn nhiều)</span><div class="grid g2" style="gap:8px">'+gita().map(function(t){
      return '<div style="border-left:3px solid '+t.c+';padding-left:8px"><b class="tiny" style="color:'+t.c+'">'+h(t.k+' · '+t.short)+'</b>'+
        (G.CO_VD||[]).filter(function(v){ return v.tru===t.k; }).map(function(v){
          return '<label class="sm" style="display:flex;gap:6px;align-items:flex-start;font-weight:400;color:var(--ink-2)"><input type="checkbox" id="gps-vd-'+h(v.ma)+'" data-co-ch="gps-nhap"'+(n.vd.indexOf(v.ma)>=0?' checked':'')+'> <span>'+h(v.ten)+'</span></label>'; }).join('')+'</div>'; }).join('')+'</div></div>';
    function hang(ten, ds, ve, them){
      return '<div class="co-f mt"><span>'+h(ten)+'</span><div class="co-ds">'+ds.map(ve).join('')+'</div>'+
        '<div><button class="btn ghost sm" data-co="gps-them" data-k="'+them+'">'+ic('plus','w-3 h-3')+'Thêm dòng</button></div></div>';
    }
    function xoaNut(k, i){ return '<button class="btn ghost sm" data-co="gps-bot" data-k="'+k+'" data-i="'+i+'" aria-label="Xoá dòng">'+ic('x','w-3 h-3')+'</button>'; }
    o += hang('Các bước (ít nhất 2)', n.buoc, function(b,i){ return '<div class="co-hang" style="flex-wrap:nowrap"><span class="tiny co-so" style="flex:none;width:16px;font-weight:700">'+(i+1)+'</span><input class="inp" style="flex:1 1 0;min-width:0;width:auto" id="gps-buoc-'+i+'" aria-label="Bước '+(i+1)+'" maxlength="200" value="'+h(b)+'" data-co-ch="gps-nhap">'+xoaNut('buoc',i)+'</div>'; }, 'buoc');
    o += hang('Công cụ (chỉ màn vai này mở được)', n.cong, function(c,i){ return '<div class="co-hang" style="flex-wrap:nowrap">'+
      CO.chon('gps-cong-v-'+i, [['','— Chọn màn —']].concat(man), c[0], ' aria-label="Màn công cụ '+(i+1)+'" data-co-ch="gps-nhap" style="flex:1 1 0;min-width:0;width:auto"')+
      '<input class="inp" style="flex:1 1 0;min-width:0;width:auto" id="gps-cong-t-'+i+'" aria-label="Nhãn công cụ '+(i+1)+'" maxlength="60" placeholder="Nhãn hiển thị" value="'+h(c[1]||'')+'" data-co-ch="gps-nhap">'+xoaNut('cong',i)+'</div>'; }, 'cong');
    o += hang('Nhiệm vụ mẫu (tên · tiêu chí xong · số ngày)', n.nv, function(x,i){ return '<div class="co-dong" style="padding:8px"><input class="inp co-grow" style="min-width:160px" id="gps-nv-t-'+i+'" aria-label="Tên nhiệm vụ '+(i+1)+'" maxlength="120" placeholder="Tên nhiệm vụ" value="'+h(x.ten)+'" data-co-ch="gps-nhap">'+
      '<input class="inp co-grow" style="min-width:160px" id="gps-nv-x-'+i+'" aria-label="Tiêu chí xong '+(i+1)+'" maxlength="120" placeholder="Tiêu chí xong / minh chứng" value="'+h(x.xong)+'" data-co-ch="gps-nhap">'+
      '<input class="inp" style="width:76px" type="number" min="1" max="90" id="gps-nv-n-'+i+'" aria-label="Số ngày '+(i+1)+'" value="'+h(x.ngay)+'" data-co-ch="gps-nhap">'+xoaNut('nv',i)+'</div>'; }, 'nv');
    o += hang('Dấu hiệu thành công', n.dau, function(d,i){ return '<div class="co-hang" style="flex-wrap:nowrap"><input class="inp" style="flex:1 1 0;min-width:0;width:auto" id="gps-dau-'+i+'" aria-label="Dấu hiệu '+(i+1)+'" maxlength="160" value="'+h(d)+'" data-co-ch="gps-nhap">'+xoaNut('dau',i)+'</div>'; }, 'dau');
    o += '<div class="co-form mt">'+CO.o2('Khi nào chuyển hướng', '<textarea class="inp" id="gps-canh" rows="2" maxlength="300" data-co-ch="gps-nhap" placeholder="VD: Sau 2 buổi con vẫn im lặng → chuyển trụ I trước.">'+h(n.canh)+'</textarea>')+'</div>';
    o += '<div class="co-hang mt2"><button class="btn pri sm" data-co="gps-luu">'+ic('check','w-3 h-3')+(s.gpSua?'Lưu thay đổi':'Lưu giải pháp')+'</button>'+
      '<button class="btn ghost sm" data-co="gps-moi">Xoá trắng form</button></div></div>';

    var me = CO.toi().u, cua = s.gp.filter(function(g){ return CO.laQuanLy() || !g.ai || g.ai===me || g.duyet; });
    o += U.sec('Giải pháp tự soạn', cua.length+' giải pháp');
    o += cua.length ? '<div class="co-tb"><table><thead><tr><th>Giải pháp</th><th>Trụ</th><th>Người soạn</th><th>Trạng thái</th><th></th></tr></thead><tbody>'+
      cua.map(function(g){ var t = tru(g.tru);
        return '<tr><td><b>'+h(g.ten)+'</b><div class="tiny muted">'+h(g.ma)+' · '+h(tangTxt(g.tang))+'</div></td><td><b style="color:'+t.c+'">'+h(t.k)+'</b></td><td class="tiny">'+h(g.ai||'—')+'</td>'+
          '<td>'+(g.duyet ? '<span class="co-tag" style="color:#0B7350;background:color-mix(in srgb,#0B7350 12%,transparent)">duyệt dùng chung</span>' : '<span class="tiny muted">riêng</span>')+'</td>'+
          '<td style="white-space:nowrap"><button class="btn ghost sm" data-co="gp-mo" data-ma="'+h(g.ma)+'">Xem</button>'+
          (suaDuoc(g) ? '<button class="btn ghost sm" data-co="gp-sua" data-ma="'+h(g.ma)+'">Sửa</button><button class="btn ghost sm" data-co="gp-xoa" data-ma="'+h(g.ma)+'">Xoá</button>' : '')+
          (CO.laQuanLy() ? '<button class="btn ghost sm" data-co="gp-duyet" data-ma="'+h(g.ma)+'">'+(g.duyet?'Bỏ duyệt':'Duyệt dùng chung')+'</button>' : '')+'</td></tr>'; }).join('')+'</tbody></table></div>'+
      '<p class="tiny muted mt">"Duyệt dùng chung" hiện cho mọi người dùng sổ trên máy này; khi có đồng bộ máy chủ, bản duyệt mới tới cả đội.</p>'
      : '<p class="sm muted">— Chưa có giải pháp tự soạn.</p>';
    return o;
  }

  /* ───────── Tab: Phác đồ chuẩn ───────── */
  function tabPhacDo(){
    var P = Array.isArray(G.PHACDO) ? G.PHACDO : [];
    if(!P.length) return '<div class="card center" style="padding:30px"><b>Kho phác đồ chưa có trên máy này</b><p class="sm muted mt">220 phác đồ mở sau khi giấy phép được cấp hoặc máy chủ được nối — đây không phải lỗi.</p></div>';
    var mau = P.length < 50 || P.some(function(p){ return /\[cần cấp phép\]/.test(JSON.stringify(p)); }) || (G.KHO && G.KHO.cheDoMau);
    var s = CO.st(), q = boDau(s.gpPdQ||'');
    var ds = P.filter(function(p){ return !q || boDau((p.ma||'')+' '+(p.ten||'')+' '+(p.nhomTen||'')).indexOf(q) >= 0; });
    var nhom = {}; ds.forEach(function(p){ var k = p.nhomTen||'Khác'; (nhom[k] = nhom[k] || []).push(p); });
    var o = '';
    if(mau) o += '<div class="co-cb mb"><div style="--m:var(--gita)">'+ic('vault','w-4 h-4')+'<span>Kho đang ở <b>bản xem trước</b>: có '+P.length+' phác đồ mẫu. Đủ 220 phác đồ mở sau khi cấp phép / nối máy chủ — không phải lỗi.</span></div></div>';
    o += '<div class="card pad-sm mb"><div class="co-form">'+CO.o2('Tìm phác đồ (mã, tên, nhóm)', '<input class="inp" id="gp-pd-q" value="'+h(s.gpPdQ||'')+'" data-co-ch="gp-pd-q" placeholder="VD: môi trường, thiết bị…">')+'</div>'+
      '<div class="co-hang mt"><button class="btn sm" data-co="gp-pd-q">'+ic('search','w-3 h-3')+'Tìm</button><span class="tiny muted">'+ds.length+' / '+P.length+' phác đồ · '+Object.keys(nhom).length+' nhóm</span></div></div>';
    o += Object.keys(nhom).sort().map(function(k){
      return U.sec(k, nhom[k].length+' phác đồ')+'<div class="co-luoi">'+nhom[k].map(function(p){
        return '<button class="co-the" style="text-align:left;cursor:pointer;color:inherit;font:inherit" data-pd="'+h(p.ma)+'"><span class="co-meta"><span>'+h(p.ma)+'</span>'+(p.tang?'<span>'+h(p.tang)+'</span>':'')+'</span>'+
          '<b class="sm" style="line-height:1.4">'+h(p.ten)+'</b><span class="tiny muted">Bấm để mở phác đồ</span></button>'; }).join('')+'</div>'; }).join('');
    if(!ds.length) o += '<p class="sm muted">Không có phác đồ khớp từ khoá.</p>';
    return o;
  }

  /* ───────── Màn ───────── */
  G.VIEWS[VIEW] = function(){
    var k = CO.cua('pro_coach', 'Hệ thống giải pháp coach'); if(k) return k;
    CO.napMau();
    var s = CO.st();
    if(s.gpChon){ if(CO.gp(s.gpChon)){ s.gpMo = s.gpChon; s.tab[VIEW] = 'tv'; } delete s.gpChon; CO.luu(false); }
    var all = dsThay(), tu = s.gp.length, dem = {};
    all.forEach(function(g){ dem[g.tru] = (dem[g.tru]||0) + 1; });
    var ad = apDung();
    var o = U.ph({ eyebrow:'COACH · GIẢI PHÁP', ic:'spark', grad:1, t:'Hệ thống giải pháp coach',
      lead:'Giải pháp neo theo vấn đề G–I–T–A: bước làm, công cụ, nhiệm vụ mẫu có tiêu chí xong, dấu hiệu thành công và khi nào phải chuyển hướng. Áp dụng một chạm vào nhật ký của nhà.' });
    o += '<div class="co-hang mb"><button class="btn ghost sm" data-v="coach-he">← Hệ điều hành Coach</button></div>';
    o += CO.banMau();
    o += '<div class="grid g4 mb">'+
      U.stat({ k:'Tổng giải pháp', v:String(all.length), d:(G.CO_GP||[]).length+' chuẩn + '+(all.length-(G.CO_GP||[]).length)+' tự soạn' })+
      U.stat({ k:'Theo trụ', v:gita().filter(function(t){ return dem[t.k]; }).length+'/4 trụ', d:gita().map(function(t){ return t.k+' '+(dem[t.k]||0); }).join(' · ') })+
      U.stat({ k:'Đã áp dụng', v:String(ad.length), d:ad.length ? 'lần, ở '+Object.keys(ad.reduce(function(m,e){ m[e.nha]=1; return m; },{})).length+' nhà' : 'chưa áp dụng cho nhà nào', c:ad.length?'#0B7350':null })+
      U.stat({ k:'Giải pháp tự soạn', v:String(tu), d:s.gp.filter(function(g){ return g.duyet; }).length+' đã duyệt dùng chung' })+'</div>';
    var tab = CO.tab(VIEW, 'tv');
    o += CO.tabs(VIEW, [['tv','Thư viện','book'],['tim','Tìm theo vấn đề','search'],['soan','Soạn giải pháp','edit'],['pd','Phác đồ chuẩn','vault']], tab);
    if(tab==='tim') o += tabTim();
    else if(tab==='soan') o += tabSoan();
    else if(tab==='pd') o += tabPhacDo();
    else o += tabThuVien();
    return o;
  };

  /* ───────── Thao tác ───────── */
  CO.on('gp-mo', function(el){ var s = CO.st(); s.gpMo = el.getAttribute('data-ma'); s.tab[VIEW] = 'tv'; CO.luu(); });
  CO.on('gp-dong', function(){ CO.st().gpMo = ''; CO.luu(); });
  CO.on('gp-loc', function(){
    var s = CO.st(); if(!document.getElementById('gp-f-tru')) return;
    s.gpLoc = { tru:CO.o('gp-f-tru'), tang:CO.o('gp-f-tang'), q:CO.o('gp-f-q').slice(0,80) }; CO.luu();
  });
  CO.on('gp-loc-xoa', function(){ CO.st().gpLoc = {}; CO.luu(); });
  CO.on('gp-ap', function(el){
    var g = CO.gp(el.getAttribute('data-ma')), id = CO.o('gp-dk'), d = CO.dk(id);
    if(!g){ U.toast('Không tìm thấy giải pháp.','err'); return; }
    if(!d || d.tt !== 'dang'){ U.toast('Chọn một nhà đang tham gia chương trình.','err'); return; }
    var hn = CO.homNay(), n = 0;
    (g.nv||[]).forEach(function(nv){
      CO.ghi({ loai:'nv_giao', ma:CO.id('nv'), han:CO.cong(hn, Math.max(1, Number(nv.ngay)||7)), ghi:nv.ten+' · '+g.ten, nha:d.nha, dk:d.id }, false); n++; });
    CO.ghi({ loai:'ghi_chu', ghi:TIEN_TO+g.ma+' '+g.ten, nha:d.nha, dk:d.id }, false);
    CO.st().gpDK = d.id;
    CO.luu(); U.toast('Đã áp dụng "'+g.ten+'" cho '+d.tenNha+': giao '+n+' nhiệm vụ.','ok');
  });
  CO.on('gp-vd', function(el){
    var s = CO.st(), m = el.getAttribute('data-ma'), a = (s.gpVD||[]).filter(function(x){ return x!==m; });
    if(el.checked) a.push(m); s.gpVD = a; s.gpTimNha = ''; veGiu();
  });
  CO.on('gp-vd-xoa', function(){ var s = CO.st(); s.gpVD = []; s.gpTimNha = ''; CO.luu(); });
  CO.on('gp-tim-tang', function(el){ CO.st().gpTimTang = el.value || ''; veGiu(); });
  CO.on('gp-nap-pt', function(el){
    var s = CO.st(), r = s.pt[el.value];
    s.gpTimNha = el.value || '';
    if(r){ var vd = r.vd || {};
      s.gpVD = Object.keys(vd).filter(function(m){ return Number(vd[m]) >= 2; });
      s.gpTimTang = String(CO.phanTich(r).tang);
      U.toast('Đã nạp '+s.gpVD.length+' vấn đề rõ / nặng của '+(r.tenNha||el.value)+'.','ok'); }
    veGiu();
  });
  CO.on('gp-pd-q', function(){ if(!document.getElementById('gp-pd-q')) return; CO.st().gpPdQ = CO.o('gp-pd-q').slice(0,80); CO.luu(); });

  /* Soạn */
  CO.on('gps-nhap', function(){ docForm(); CO.luu(false); });
  CO.on('gps-them', function(el){
    var n = docForm(), k = el.getAttribute('data-k');
    if((n[k]||[]).length >= 12){ U.toast('Tối đa 12 dòng — giải pháp gọn thì nhà mới làm theo được.','err'); return; }
    n[k] = n[k] || []; n[k].push(k==='nv' ? { ten:'', xong:'', ngay:3 } : k==='cong' ? ['',''] : ''); veGiu();
  });
  CO.on('gps-bot', function(el){ var n = docForm(), k = el.getAttribute('data-k'); (n[k]||[]).splice(Number(el.getAttribute('data-i')), 1); veGiu(); });
  CO.on('gps-moi', function(){ var s = CO.st(); s.gpNhap = nhapMoi(); s.gpSua = ''; CO.luu(); });
  CO.on('gps-huy', function(){ var s = CO.st(); s.gpNhap = nhapMoi(); s.gpSua = ''; CO.luu(); U.toast('Đã huỷ sửa.','ok'); });
  CO.on('gps-luu', function(){
    var n = docForm(), s = CO.st(), man = {};
    dsManMo().forEach(function(m){ man[m[0]] = 1; });
    var ngay = Number(n.ngay);
    var buoc = n.buoc.filter(function(x){ return x; }), dau = n.dau.filter(function(x){ return x; });
    var cong = n.cong.filter(function(c){ return c[0]; });
    var nv = n.nv.filter(function(x){ return x.ten; });
    if(n.ten.length < 6){ U.toast('Tên giải pháp cần ít nhất 6 ký tự để người khác tìm lại được.','err'); return; }
    if(!n.vd.length){ U.toast('Chọn ít nhất một vấn đề mà giải pháp gỡ — máy dựa vào đó để gợi ý.','err'); return; }
    if(!(ngay >= 1 && ngay <= 365)){ U.toast('Số ngày áp dụng phải từ 1 đến 365.','err'); return; }
    if(n.muc.length < 10){ U.toast('Viết mục tiêu bằng kết quả quan sát được (ít nhất 10 ký tự).','err'); return; }
    if(buoc.length < 2){ U.toast('Cần ít nhất 2 bước làm.','err'); return; }
    if(cong.some(function(c){ return !man[c[0]]; })){ U.toast('Có công cụ trỏ tới màn vai này không mở được.','err'); return; }
    if(nv.some(function(x){ return !x.xong || !(Number(x.ngay) >= 1 && Number(x.ngay) <= 90); })){ U.toast('Mỗi nhiệm vụ mẫu cần tiêu chí xong và số ngày 1–90.','err'); return; }
    var g = { tru:n.tru, ten:n.ten, vd:n.vd.slice(), tang:n.tang.length ? n.tang.slice() : [1,2,3,4,5], ngay:ngay, muc:n.muc, buoc:buoc,
      cong:cong.map(function(c){ var it = G.navItem ? G.navItem(c[0]) : null; return [c[0], c[1] || (it && it.t) || c[0]]; }),
      nv:nv.map(function(x){ return { ten:x.ten, xong:x.xong, ngay:Number(x.ngay) }; }), dau:dau, canh:n.canh || '—' };
    if(s.gpSua){
      var cu = s.gp.filter(function(x){ return x.ma===s.gpSua; })[0];
      if(!cu || !suaDuoc(cu)){ U.toast('Không sửa được giải pháp này.','err'); return; }
      Object.keys(g).forEach(function(k){ cu[k] = g[k]; }); cu.sua = Date.now();
      U.toast('Đã lưu thay đổi '+cu.ma+'.','ok');
      s.gpMo = cu.ma;
    } else {
      g.ma = 'GP-TU-'+Date.now().toString(36).toUpperCase(); g.ai = CO.toi().u; g.tao = Date.now(); g.duyet = false;
      s.gp.push(g); s.gpMo = g.ma;
      U.toast('Đã lưu giải pháp '+g.ma+'.','ok');
    }
    s.gpNhap = nhapMoi(); s.gpSua = ''; s.tab[VIEW] = 'tv'; CO.luu();
  });
  CO.on('gp-sua', function(el){
    var s = CO.st(), g = s.gp.filter(function(x){ return x.ma===el.getAttribute('data-ma'); })[0];
    if(!g || !suaDuoc(g)){ U.toast('Chỉ sửa được giải pháp tự soạn của mình.','err'); return; }
    s.gpNhap = { ten:g.ten, tru:g.tru, vd:(g.vd||[]).slice(), tang:(g.tang||[]).slice(), ngay:g.ngay, muc:g.muc||'', buoc:(g.buoc||[]).slice(),
      cong:(g.cong||[]).map(function(c){ return [c[0], c[1]]; }), nv:(g.nv||[]).map(function(x){ return { ten:x.ten, xong:x.xong, ngay:x.ngay }; }),
      dau:(g.dau||[]).slice(), canh:g.canh==='—' ? '' : (g.canh||'') };
    s.gpSua = g.ma; s.gpMo = ''; s.tab[VIEW] = 'soan'; CO.luu();
  });
  CO.on('gp-xoa', function(el){
    var s = CO.st(), ma = el.getAttribute('data-ma'), g = s.gp.filter(function(x){ return x.ma===ma; })[0];
    if(!g || !suaDuoc(g)){ U.toast('Chỉ xoá được giải pháp tự soạn của mình.','err'); return; }
    if(!window.confirm('Xoá giải pháp "'+g.ten+'"? Nhiệm vụ đã giao cho các nhà vẫn giữ trong nhật ký.')) return;
    s.gp = s.gp.filter(function(x){ return x.ma!==ma; }); if(s.gpMo===ma) s.gpMo = ''; if(s.gpSua===ma){ s.gpSua = ''; s.gpNhap = nhapMoi(); }
    CO.luu(); U.toast('Đã xoá giải pháp '+ma+'.','ok');
  });
  CO.on('gp-duyet', function(el){
    if(!CO.laQuanLy()){ U.toast('Chỉ Trưởng nhóm Coach trở lên duyệt dùng chung.','err'); return; }
    var g = CO.st().gp.filter(function(x){ return x.ma===el.getAttribute('data-ma'); })[0]; if(!g) return;
    g.duyet = !g.duyet; g.duyetBoi = g.duyet ? CO.toi().u : ''; g.duyetLuc = g.duyet ? Date.now() : 0;
    veGiu(); U.toast(g.duyet ? 'Đã duyệt dùng chung '+g.ma+' (trên máy này cho tới khi đồng bộ máy chủ).' : 'Đã bỏ duyệt '+g.ma+'.','ok');
  });
})();
