/* ═══════════════════════════════════════════════════════════════
   GITA 365 — HỆ ĐIỀU HÀNH COACH · CHƯƠNG TRÌNH COACH (coach-ct)

   Bốn thẻ, cùng đọc một sổ chung (coach-loi.js) — không sổ thứ hai:

     Danh mục      mười chương trình chuẩn (G.CO_CT) + chương trình tự
                   thiết kế (sổ.chuong); lọc theo loại và tầng T1–T5.
     Chi tiết      mục tiêu, điều kiện vào/ra, Coach tối thiểu, trục giai
                   đoạn có cổng nghiệm thu, KPI, sáu nhịp, giải pháp gợi ý,
                   bài coach đã soạn, và các nhà đang chạy (đèn, tiến độ).
     Ghép cho nhà  nhà × chương trình × Coach × ngày bắt đầu → xem trước
                   lịch buổi theo giai đoạn RỒI mới lưu (CO.ghep). Chặn ghép
                   trùng; cảnh báo khi vai Coach dưới mức tối thiểu.
     Thiết kế      (Trưởng nhóm Coach trở lên) dựng chương trình riêng cùng
                   khuôn với G.CO_CT: giai đoạn liền mạch trong 1..ngày,
                   KPI, nhân bản từ chương trình chuẩn.

   Mọi con số đọc từ sổ. Mở cho pro_coach. Không đụng máy chủ · giấy
   phép · mã hoá.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic, CO = G.CO;
  function icI(n){ return '<span style="display:inline-flex;vertical-align:-2px">'+ic(n,'w-3 h-3')+'</span>'; }
  var VIEW = 'coach-ct';
  var LOAI = { 'tang':'Tầng chính', 'chuyen-de':'Chuyên đề', 'can-thiep':'Can thiệp' };
  var THU = ['CN','T2','T3','T4','T5','T6','T7'];
  var MAU = [['#185AB4','Xanh dương'],['#5140B4','Tím'],['#0B6675','Xanh lam'],['#0B7350','Xanh lá'],['#B4720F','Hổ phách'],['#BE0E16','Đỏ']];
  var CAP = ['R05','R06','R07','R08'];

  /* ───────── Tiện ích ───────── */
  function tier(t){ return (G.TIERS||[])[t-1] || { code:'T'+t, name:'', c:'#73849F' }; }
  function tangChip(t){ var T = tier(t); return U.chip(T.code||('T'+t), T.c); }
  function tongBuoi(ct){ return (ct.gd||[]).reduce(function(a,g){ return a + Math.max(1, Number(g.buoi)||1); }, 0); }
  function vai(id){ var r = G.roleById ? G.roleById(id) : null; return r || { id:id, n:id, short:id, lv:99 }; }
  function laTuTK(ct){ return CO.st().chuong.some(function(c){ return c.ma===ct.ma; }); }
  function ngayThu(d){ return CO.cach(d.batDau, CO.homNay()) + 1; }
  function ngayDu(s){ if(!s) return '—'; var x = new Date(s+'T00:00:00'); return THU[x.getDay()]+' '+CO.ngayVN(s)+'/'+x.getFullYear(); }
  function tenTru(k){ var g = (G.GITA||[]).filter(function(x){ return x.k===k; })[0]; return g ? g.short : k; }
  function mauTru(k){ var g = (G.GITA||[]).filter(function(x){ return x.k===k; })[0]; return g ? g.c : '#73849F'; }
  /* Giữ chỗ cuộn khi vẽ lại trong cùng một thẻ (G.render luôn cuộn về đầu). */
  function veGiu(focusId){
    var y = window.pageYOffset || 0; CO.luu(); window.scrollTo(0, y);
    if(focusId){ var el = document.getElementById(focusId); if(el && el.focus) try{ el.focus({ preventScroll:true }); }catch(e){ el.focus(); } }
  }
  function dkDang(ma){ return CO.dsDK().filter(function(d){ return d.tt==='dang' && (!ma || d.ct===ma); }); }

  /* Cổng nghiệm thu đã đạt — sổ ghi chỉ số giai đoạn (số), hoặc {gd}, hoặc tên giai đoạn. */
  function congDaDat(d, gi, ct){
    return (d.congDat||[]).some(function(x){
      if(x===gi || String(x)===String(gi)) return true;
      if(x && typeof x==='object') return x.gd===gi || String(x.gd)===String(gi);
      return !!(ct && ct.gd && ct.gd[gi] && x===ct.gd[gi].ten);
    });
  }
  function congCua(d){
    var ct = CO.ct(d.ct); if(!ct) return { dat:0, het:0 };
    var n = ngayThu(d), dat = 0, het = 0;
    (ct.gd||[]).forEach(function(g, gi){ if((g.den||g.tu) < n){ het++; if(congDaDat(d, gi, ct)) dat++; } });
    return { dat:dat, het:het };
  }

  function soLieu(){
    var ds = CO.dsDK(), dang = ds.filter(function(d){ return d.tt==='dang'; });
    var nha = {}; dang.forEach(function(d){ nha[d.nha] = 1; });
    var buoi = 0; ds.forEach(function(d){ (d.lich||[]).forEach(function(b){ if(b.tt==='xong') buoi++; }); });
    var dat = 0, het = 0; ds.forEach(function(d){ var c = congCua(d); dat += c.dat; het += c.het; });
    return { ct:CO.dsCT().length, tuTK:CO.st().chuong.length, nha:Object.keys(nha).length, dk:dang.length, buoi:buoi, dat:dat, het:het };
  }

  /* ═════════ VIEW ═════════ */
  G.VIEWS[VIEW] = function(){
    var k = CO.cua('pro_coach', 'Chương trình coach'); if(k) return k;
    CO.napMau();
    var s = CO.st(), S = soLieu();
    var cur = CO.tab(VIEW, 'dm');
    var o = '<div class="co-hang mb"><button class="btn ghost sm" data-v="coach-he">← Hệ điều hành Coach</button></div>';
    o += U.ph({ eyebrow:'COACH · CHƯƠNG TRÌNH', ic:'compass', grad:1, t:'Chương trình coach',
      lead:'Mười chương trình chuẩn theo năm tầng, cộng chương trình đội tự thiết kế. Mỗi chương trình có giai đoạn, số buổi, cổng nghiệm thu và KPI — ghép cho một nhà là lịch buổi được lập ngay.' });
    o += CO.banMau();
    var tl = S.het ? Math.round(100*S.dat/S.het) : null;
    o += '<div class="grid g4 mb">'+
      U.stat({ k:'Chương trình', v:String(S.ct), d:(S.ct - S.tuTK)+' chuẩn · '+S.tuTK+' tự thiết kế' })+
      U.stat({ k:'Nhà đang chạy', v:String(S.nha), d:S.dk+' lượt ghép · '+(CO.laQuanLy()?'toàn đội':'nhà tôi phụ trách') })+
      U.stat({ k:'Buổi đã dẫn', v:String(S.buoi), d:'buổi đã ghi "có mặt, đã dẫn"' })+
      U.stat({ k:'Tỷ lệ đạt cổng', v:tl==null?'—':tl+'%', d:S.het ? S.dat+'/'+S.het+' cổng của giai đoạn đã qua'+(S.dat?'':' · ghi đạt cổng ở Điều phối') : 'chưa có giai đoạn nào kết thúc', c:tl==null?null:tl>=70?CO.MAU_DEN.XANH:tl>=45?CO.MAU_DEN.VANG:CO.MAU_DEN.DO })+
      '</div>';
    o += CO.tabs(VIEW, [['dm','Danh mục','grid'],['ct','Chi tiết','book'],['ghep','Ghép cho nhà','users'],['tk','Thiết kế chương trình','edit']], cur);
    if(cur==='ct') o += veChiTiet(s);
    else if(cur==='ghep') o += veGhep(s);
    else if(cur==='tk') o += veThietKe(s);
    else o += veDanhMuc(s);
    return o;
  };

  /* ═════════ 1 · DANH MỤC ═════════ */
  function veDanhMuc(s){
    var loc = s.ctLoc || {}, loai = loc.loai || '', tang = Number(loc.tang)||0;
    var ds = CO.dsCT().filter(function(c){ return (!loai || c.loai===loai) && (!tang || (c.tang||[]).indexOf(tang) >= 0); });
    function chip(kk, v, t, on){ return '<button class="chip'+(on?' on':'')+'" aria-pressed="'+on+'" data-co="ct-loc" data-k="'+kk+'" data-gt="'+h(v)+'">'+h(t)+'</button>'; }
    var o = '<div class="co-hang mb" role="group" aria-label="Lọc theo loại">'+'<span class="tiny muted" style="min-width:52px">Loại</span>'+
      chip('loai','','Tất cả',!loai) + Object.keys(LOAI).map(function(x){ return chip('loai', x, LOAI[x], loai===x); }).join('')+'</div>';
    o += '<div class="co-hang mb" role="group" aria-label="Lọc theo tầng"><span class="tiny muted" style="min-width:52px">Tầng</span>'+
      chip('tang','','Mọi tầng',!tang) + [1,2,3,4,5].map(function(t){ var T = tier(t); return chip('tang', t, T.code+' · '+(T.name||'').toLowerCase(), tang===t); }).join('')+'</div>';
    if(!ds.length) return o + '<div class="card pad-sm muted sm">Không có chương trình nào khớp bộ lọc. Bấm "Tất cả" và "Mọi tầng" để xem lại cả danh mục.</div>';
    o += '<div class="co-luoi">'+ ds.map(function(c){
      var n = dkDang(c.ma).length;
      return '<div class="co-the nhan" style="--c:'+h(c.c||'#185AB4')+';border-top:4px solid '+h(c.c||'#185AB4')+'">'+
        '<div class="co-hang" style="gap:6px">'+(c.tang||[]).map(tangChip).join('')+
          '<span class="co-tag">'+h(LOAI[c.loai]||c.loai||'')+'</span>'+(laTuTK(c)?'<span class="co-tag">tự thiết kế</span>':'')+'</div>'+
        '<h2>'+h(c.ten)+'</h2>'+
        '<div class="co-meta"><span>'+icI('calendar')+' '+h(c.ngay)+' ngày</span><span>· '+tongBuoi(c)+' buổi</span><span>· '+(c.gd||[]).length+' giai đoạn</span><span>· Coach từ '+h(vai(c.capCoach).short)+'</span></div>'+
        '<div class="sm"><b>Đối tượng:</b> '+h(c.doiTuong||'—')+'</div>'+
        '<p class="sm muted" style="margin:0;line-height:1.5">'+h(c.muc||'')+'</p>'+
        '<div class="co-hang" style="margin-top:auto;padding-top:6px">'+
          '<span class="tiny co-grow" style="min-width:120px;color:'+(n?'var(--ink-2)':'var(--ink-4)')+'">'+icI('users')+' '+n+' nhà đang chạy</span>'+
          '<button class="btn ghost sm" data-co="ct-xem" data-ma="'+h(c.ma)+'">Xem chi tiết</button>'+
          '<button class="btn sm" data-co="ct-ghep-mo" data-ma="'+h(c.ma)+'">'+ic('plus','w-3 h-3')+'Ghép cho nhà</button></div>'+
      '</div>'; }).join('') +'</div>';
    return o;
  }
  CO.on('ct-loc', function(el){
    var s = CO.st(); s.ctLoc = s.ctLoc || {};
    s.ctLoc[el.getAttribute('data-k')] = el.getAttribute('data-gt'); veGiu();
  });
  CO.on('ct-xem', function(el){ var s = CO.st(); s.ctChon = el.getAttribute('data-ma'); s.tab[VIEW] = 'ct'; CO.luu(); });
  CO.on('ct-ghep-mo', function(el){
    var s = CO.st(); s.ctGhep = s.ctGhep || {}; s.ctGhep.ct = el.getAttribute('data-ma'); s.tab[VIEW] = 'ghep'; CO.luu();
  });

  /* ═════════ 2 · CHI TIẾT ═════════ */
  function veChiTiet(s){
    var dsct = CO.dsCT(), ct = CO.ct(s.ctChon) || dsct[0];
    if(!ct) return '<div class="card pad-sm muted">Chưa có chương trình nào.</div>';
    var c = ct.c || '#185AB4';
    var o = '<div class="co-form mb" style="max-width:520px">'+CO.o2('Chương trình đang xem',
      CO.chon('ct-chon-sel', dsct.map(function(x){ return [x.ma, x.ten+(laTuTK(x)?' (tự thiết kế)':'')]; }), ct.ma, ' data-co-ch="ct-chon-sel"'))+'</div>';

    /* Đầu thẻ */
    o += '<div class="co-the nhan mb" style="--c:'+h(c)+';border-left:5px solid '+h(c)+'">'+
      '<div class="co-hang" style="gap:6px">'+(ct.tang||[]).map(tangChip).join('')+'<span class="co-tag">'+h(LOAI[ct.loai]||ct.loai||'')+'</span>'+
        (laTuTK(ct)?'<span class="co-tag">tự thiết kế</span>':'')+'<span class="tiny muted">mã '+h(ct.ma)+'</span></div>'+
      '<h2 style="font-size:19px">'+h(ct.ten)+'</h2>'+
      '<div class="co-meta"><span>'+h(ct.ngay)+' ngày</span><span>· '+tongBuoi(ct)+' buổi</span><span>· '+(ct.gd||[]).length+' giai đoạn</span><span>· '+dkDang(ct.ma).length+' nhà đang chạy</span></div>'+
      '<p style="margin:2px 0 0;line-height:1.55"><b>Mục tiêu.</b> '+h(ct.muc||'—')+'</p>'+
      '<div class="co-hang mt"><button class="btn sm" data-co="ct-ghep-mo" data-ma="'+h(ct.ma)+'">'+ic('plus','w-3 h-3')+'Ghép cho nhà</button>'+
        (G.allowed && G.allowed('coach-tk') ? '<button class="btn ghost sm" data-co="ct-bai-moi" data-ma="'+h(ct.ma)+'">'+ic('edit','w-3 h-3')+'Soạn bài cho chương trình này</button>' : '')+'</div>'+
    '</div>';

    var cap = vai(ct.capCoach);
    o += '<div class="grid g2 mb">'+
      '<div class="card pad-sm"><div class="tiny muted">ĐỐI TƯỢNG</div><div class="sm mt">'+h(ct.doiTuong||'—')+'</div>'+
        '<div class="tiny muted mt2">TRỤ TRỌNG TÂM</div><div class="co-hang mt" style="gap:6px">'+(ct.mien||[]).map(function(m){ return U.chip(m+' · '+tenTru(m), mauTru(m)); }).join('')+'</div></div>'+
      '<div class="card pad-sm"><div class="tiny muted">ĐIỀU KIỆN VÀO</div><div class="sm mt">'+h(ct.vao||'—')+'</div>'+
        '<div class="tiny muted mt2">ĐIỀU KIỆN RA</div><div class="sm mt">'+h(ct.ra||'—')+'</div>'+
        '<div class="tiny muted mt2">COACH TỐI THIỂU</div><div class="sm mt"><b>'+h(cap.n)+'</b> <span class="muted">('+h(cap.id)+') — vai từ mức này trở lên được dẫn</span></div></div>'+
    '</div>';

    /* Trục giai đoạn */
    var tong = Math.max(1, Number(ct.ngay)||1), soBuoi = 0;
    o += U.sec('Giai đoạn & cổng nghiệm thu', 'Mỗi giai đoạn kết thúc bằng một cổng — đạt cổng mới sang giai đoạn sau');
    o += '<div class="co-ct-truc mb" role="img" aria-label="Trục '+h(ct.ngay)+' ngày chia theo giai đoạn">'+ (ct.gd||[]).map(function(g, gi){
      var dai = Math.max(1, (g.den||g.tu) - g.tu + 1);
      return '<i title="'+h(g.ten)+' · ngày '+g.tu+'–'+(g.den||g.tu)+'" style="flex:'+dai+';background:'+h(c)+';opacity:'+(1 - (gi%2)*0.45)+'"></i>'; }).join('') +'</div>';
    o += '<div class="co-ds mb">'+ (ct.gd||[]).map(function(g, gi){
      var b0 = soBuoi + 1; soBuoi += Math.max(1, Number(g.buoi)||1);
      return '<div class="co-dong" style="align-items:flex-start;border-left:4px solid '+h(c)+'">'+
        '<span class="co-so" style="flex:none;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font-weight:800;color:#fff;background:'+h(c)+'">'+(gi+1)+'</span>'+
        '<div class="co-grow"><b>'+h(g.ten)+'</b>'+
          '<div class="tiny muted">Ngày '+g.tu+'–'+(g.den||g.tu)+' · '+(g.buoi||1)+' buổi (buổi '+b0+(soBuoi>b0?'–'+soBuoi:'')+') · '+Math.round(100*((g.den||g.tu)-g.tu+1)/tong)+'% thời lượng</div>'+
          '<div class="sm" style="margin-top:4px">'+h(g.muc||'')+'</div>'+
          '<div class="sm" style="margin-top:4px;color:var(--ink-2)">'+icI('shield')+' <b>Cổng:</b> '+h(g.cong||'—')+'</div></div></div>';
    }).join('') +'</div>';

    /* KPI */
    o += U.sec('KPI chương trình', 'Chỉ tiêu nghiệm thu khi kết thúc');
    o += (ct.kpi||[]).length ? '<div class="co-tb mb"><table style="min-width:0"><thead><tr><th>Chỉ số</th><th>Chỉ tiêu</th></tr></thead><tbody>'+
      ct.kpi.map(function(x){ return '<tr><td>'+h(x[0])+'</td><td class="so"><b>'+h(x[1])+'</b></td></tr>'; }).join('')+'</tbody></table></div>'
      : '<div class="card pad-sm muted sm mb">Chương trình chưa khai KPI.</div>';

    /* Sáu nhịp */
    var nh = CO.nhip(), phut = nh.reduce(function(a,x){ return a + (Number(x.phut)||0); }, 0);
    o += U.sec('Sáu nhịp mỗi buổi', CO.nhipNguon()+' · tổng '+phut+' phút');
    o += '<div class="co-luoi mb" style="grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px">'+ nh.map(function(x){
      return '<div class="co-the" style="padding:10px 12px;gap:4px;border-left:4px solid '+h(x.c||'#185AB4')+'"><div class="co-hang" style="gap:6px"><b class="co-grow sm">'+h(x.no)+' · '+h(x.ten)+'</b><span class="tiny muted co-so">'+h(x.phut)+'′</span></div>'+
        '<div class="tiny muted" style="line-height:1.45">'+h(x.lam)+'</div></div>'; }).join('') +'</div>';

    /* Giải pháp gợi ý */
    var gp = CO.dsGP().filter(function(g){ return (ct.mien||[]).indexOf(g.tru) >= 0 && (!g.tang || (g.tang||[]).some(function(t){ return (ct.tang||[]).indexOf(t) >= 0; })); });
    o += U.sec('Giải pháp hợp chương trình', gp.length+' giải pháp cùng trụ trọng tâm và cùng tầng');
    if(gp.length){
      o += '<div class="co-ds mb">'+ gp.slice(0,8).map(function(g){
        return '<div class="co-dong">'+U.chip(g.tru+' · '+tenTru(g.tru), mauTru(g.tru))+'<span class="co-grow sm" style="min-width:180px"><b>'+h(g.ten)+'</b> <span class="muted">— '+h(g.muc||'')+'</span></span>'+
          '<span class="tiny muted">'+h(g.ngay||'—')+' ngày</span></div>'; }).join('') +'</div>';
      if(gp.length > 8 || (G.allowed && G.allowed('coach-gp'))) o += '<div class="co-hang mb"><span class="tiny muted co-grow">'+(gp.length>8?'Đang hiện 8/'+gp.length+'. ':'')+'</span>'+
        (G.allowed && G.allowed('coach-gp') ? '<button class="btn ghost sm" data-v="coach-gp">Mở thư viện giải pháp '+ic('arrow','w-3 h-3')+'</button>' : '')+'</div>';
    } else o += '<div class="card pad-sm muted sm mb">Chưa có giải pháp nào khớp trụ và tầng của chương trình này.</div>';

    /* Bài coach đã thiết kế */
    var me = CO.toi().u;
    var bai = s.bai.filter(function(b){ return b.ct===ct.ma && (CO.laQuanLy() || b.tacGia===me || b.mauChuan || b.mau); })
      .sort(function(a,b){ return (Number(a.gd)||0)-(Number(b.gd)||0) || (Number(a.buoi)||0)-(Number(b.buoi)||0); });
    o += U.sec('Bài coach đã soạn cho chương trình', bai.length ? bai.length+' bài' : 'Chưa có bài nào');
    if(bai.length){
      o += '<div class="co-ds mb">'+ bai.map(function(b){
        var g = (ct.gd||[])[Number(b.gd)||0];
        return '<div class="co-dong"><span class="co-grow sm" style="min-width:180px"><b>'+h(b.ten||'(chưa đặt tên)')+'</b>'+(b.mauChuan?' <span class="co-tag">mẫu chuẩn</span>':'')+
          '<br><span class="tiny muted">'+h(g?g.ten:'—')+' · buổi '+h(b.buoi||'—')+' · '+h(CO.tenCoach(b.tacGia))+'</span></span>'+
          '<span class="tiny co-so" style="font-weight:700;color:'+(b.diem==null?'var(--ink-4)':b.diem>=8?CO.MAU_DEN.XANH:b.diem>=6?CO.MAU_DEN.VANG:CO.MAU_DEN.DO)+'">'+(b.diem==null?'chưa soát':'soát '+b.diem+'/10')+'</span>'+
          (G.allowed && G.allowed('coach-tk') ? '<button class="btn ghost sm" data-co="ct-bai-mo" data-id="'+h(b.id)+'">Mở '+ic('arrow','w-3 h-3')+'</button>' : '')+'</div>'; }).join('') +'</div>';
    } else o += '<div class="card pad-sm muted sm mb">Chưa ai soạn bài cho chương trình này. Bài soạn ở màn Thiết kế bài coach sẽ hiện ở đây.</div>';

    /* Nhà đang chạy */
    var dk = dkDang(ct.ma);
    o += U.sec('Nhà đang chạy chương trình', dk.length ? dk.length+' nhà · '+(CO.laQuanLy()?'toàn đội':'nhà tôi phụ trách') : 'Chưa có nhà nào');
    if(dk.length){
      o += '<div class="co-tb mb"><table><thead><tr><th>Nhà</th><th>Coach</th><th>Giai đoạn</th><th>Tiến độ</th><th>Cổng</th><th>Đèn</th><th></th></tr></thead><tbody>'+
        dk.map(function(d){
          var c2 = CO.chiSo(d), g = (ct.gd||[])[c2.gdNay], cg = congCua(d);
          return '<tr><td><b>'+h(d.tenNha)+'</b>'+CO.nhanMau(d)+'<div class="tiny muted">bắt đầu '+h(CO.ngayVN(d.batDau))+'</div></td>'+
            '<td class="sm">'+h(CO.tenCoach(d.coach))+'</td>'+
            '<td class="sm">'+h(g?g.ten:'—')+'</td>'+
            '<td style="min-width:130px"><div class="tiny muted co-so">Ngày '+Math.max(0,Math.min(c2.ngayThu,c2.tongNgay))+'/'+h(c2.tongNgay)+' · '+Math.round(100*c2.tienDo)+'%</div>'+CO.thanh(c2.tienDo, c)+'</td>'+
            '<td class="so">'+(cg.het?cg.dat+'/'+cg.het:'—')+'</td>'+
            '<td>'+CO.den(c2.den)+'</td>'+
            '<td>'+(G.allowed && G.allowed('coach-dp') ? '<button class="btn ghost sm" data-co="ct-mo-dp" data-dk="'+h(d.id)+'">Điều phối</button>' : '')+'</td></tr>';
        }).join('')+'</tbody></table></div>';
    } else o += '<div class="card pad-sm muted sm mb">Chưa có nhà nào đang chạy chương trình này. Dùng thẻ "Ghép cho nhà" để bắt đầu.</div>';
    return o;
  }
  CO.on('ct-chon-sel', function(el){ CO.st().ctChon = el.value; veGiu(); });
  CO.on('ct-mo-dp', function(el){ var s = CO.st(); s.tab['coach-dp'] = 'nha'; s.dpNha = el.getAttribute('data-dk'); CO.luu(false); G.go('coach-dp'); });
  CO.on('ct-bai-mo', function(el){ var s = CO.st(); s.tkMo = el.getAttribute('data-id'); s.tab['coach-tk'] = 'soan'; CO.luu(false); G.go('coach-tk'); });
  CO.on('ct-bai-moi', function(el){ var s = CO.st(); s.tkMoiCT = el.getAttribute('data-ma'); s.tab['coach-tk'] = 'soan'; CO.luu(false); G.go('coach-tk'); });

  /* ═════════ 3 · GHÉP CHO NHÀ ═════════ */
  function coachCho(){
    var me = CO.toi(), ds = CO.dsCoach();
    if(CO.laQuanLy()){
      if(!ds.some(function(c){ return c.u===me.u; }) && me.u) ds = [{ u:me.u, ten:me.ten, role:me.role, vai:vai(me.role).short }].concat(ds);
      return ds;
    }
    var toi = ds.filter(function(c){ return c.u===me.u; })[0];
    return [toi || { u:me.u, ten:me.ten, role:me.role, vai:vai(me.role).short }];
  }
  function ghepNhap(s){
    var f = s.ctGhep = s.ctGhep || {};
    var dsct = CO.dsCT(), dsn = CO.dsNha(), dsc = coachCho();
    if(!CO.ct(f.ct)) f.ct = (dsct[0]||{}).ma;
    if(f.nha !== '__moi' && !dsn.some(function(n){ return n.ma===f.nha; })) f.nha = dsn.length ? dsn[0].ma : '__moi';
    if(!dsc.some(function(c){ return c.u===f.coach; })) f.coach = (dsc.filter(function(c){ return c.u===CO.toi().u; })[0] || dsc[0] || {}).u;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(f.bd||'')) f.bd = CO.homNay();
    return f;
  }
  function docGhep(){
    var f = CO.st().ctGhep = CO.st().ctGhep || {};
    ['nha','ct','coach','bd'].forEach(function(k){ var el = document.getElementById('ctg-'+k); if(el) f[k] = String(el.value||'').trim(); });
    var m = document.getElementById('ctg-ma'), t = document.getElementById('ctg-ten');
    if(m) f.maMoi = String(m.value||'').trim();
    if(t) f.tenMoi = String(t.value||'').trim();
    return f;
  }
  function kiemGhep(f){
    var loi = [], canh = [], ct = CO.ct(f.ct), nha = f.nha, ten = '';
    if(!ct) loi.push('Chưa chọn chương trình.');
    if(nha === '__moi'){
      nha = f.maMoi || ''; ten = f.tenMoi || '';
      if(!nha) loi.push('Nhập mã nhà mới.');
      else if(!/^[A-Za-z0-9._-]{2,24}$/.test(nha)) loi.push('Mã nhà chỉ gồm chữ không dấu, số, dấu chấm, gạch (2–24 ký tự).');
      else if(CO.dsNha().some(function(n){ return n.ma.toLowerCase()===nha.toLowerCase(); })) loi.push('Mã "'+nha+'" đã có trong danh sách — hãy chọn nhà ấy ở ô "Nhà".');
      if(!ten) loi.push('Nhập tên nhà mới.');
    } else { if(!nha) loi.push('Chưa chọn nhà.'); ten = CO.tenNha(nha); }
    if(!f.coach) loi.push('Chưa chọn Coach phụ trách.');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(f.bd||'') || isNaN(new Date(f.bd+'T00:00:00'))) loi.push('Ngày bắt đầu không hợp lệ.');
    if(ct && nha && CO.st().dk.some(function(d){ return d.nha===nha && d.ct===ct.ma && d.tt==='dang'; }))
      loi.push('Nhà này đang chạy "'+ct.ten+'" — không ghép trùng. Kết thúc lượt cũ ở màn Điều phối trước.');
    if(ct && f.coach){
      var c = coachCho().filter(function(x){ return x.u===f.coach; })[0];
      if(c && ct.capCoach && vai(c.role).lv > vai(ct.capCoach).lv)
        canh.push('Vai của '+c.ten+' ('+vai(c.role).n+') dưới mức tối thiểu của chương trình ('+vai(ct.capCoach).n+'). Vẫn ghép được, nhưng nên có người kèm.');
    }
    if(f.bd && /^\d{4}-\d{2}-\d{2}$/.test(f.bd)){
      var lech = CO.cach(CO.homNay(), f.bd);
      if(lech < -14) canh.push('Ngày bắt đầu đã qua '+(-lech)+' ngày — các buổi trước hôm nay sẽ hiện "chưa ghi kết quả" cho tới khi được đánh dấu.');
      if(lech > 60) canh.push('Ngày bắt đầu còn '+lech+' ngày nữa.');
    }
    return { loi:loi, canh:canh, ct:ct, nha:nha, ten:ten };
  }

  function veGhep(s){
    var f = ghepNhap(s), dsn = CO.dsNha(), dsc = coachCho(), ql = CO.laQuanLy();
    var o = '<div class="card pad-sm mb"><div class="co-form">'+
      CO.o2('Nhà', CO.chon('ctg-nha', dsn.map(function(n){ return [n.ma, n.ten+(n.ma!==n.ten?' · '+n.ma:'')]; }).concat([['__moi','Nhà mới…']]), f.nha, ' data-co-ch="ctg-doi"'))+
      (f.nha==='__moi' ? CO.o2('Mã nhà mới', '<input class="inp" id="ctg-ma" maxlength="24" placeholder="VD: HN-012" value="'+h(f.maMoi||'')+'">')+
                         CO.o2('Tên nhà mới', '<input class="inp" id="ctg-ten" maxlength="80" placeholder="VD: Nhà chị Lan – bé Minh" value="'+h(f.tenMoi||'')+'">') : '')+
      CO.o2('Chương trình', CO.chon('ctg-ct', CO.dsCT().map(function(c){ return [c.ma, c.ten]; }), f.ct, ' data-co-ch="ctg-doi"'))+
      CO.o2('Coach phụ trách', CO.chon('ctg-coach', dsc.map(function(c){ return [c.u, c.ten+' · '+c.vai]; }), f.coach, ' data-co-ch="ctg-doi"'+(ql?'':' disabled')))+
      CO.o2('Ngày bắt đầu', '<input class="inp" type="date" id="ctg-bd" value="'+h(f.bd)+'" data-co-ch="ctg-doi">')+
    '</div>'+(ql?'':'<p class="tiny muted mt">Coach tự ghép cho nhà mình phụ trách; Trưởng nhóm Coach trở lên phân công được cho người khác.</p>')+'</div>';

    var K = kiemGhep(f), ct = K.ct;
    /* Phân tích của nhà (nếu có) → đề xuất chương trình */
    var pt = f.nha && f.nha!=='__moi' ? s.pt[f.nha] : null;
    if(pt){
      var P = CO.phanTich(pt);
      o += '<div class="co-cb mb"><div style="--m:var(--gita)"><span class="co-grow sm">'+icI('target')+' <b>Phân tích của nhà này đề xuất:</b> '+
        (P.ctDX.length ? P.ctDX.map(function(x){ var c = CO.ct(x.ma); return h(c?c.ten:x.ma)+' <span class="muted">('+h(x.ly)+')</span>'; }).join(' · ') : 'chưa đủ dữ liệu để đề xuất')+
        ' · tầng gợi ý T'+P.tang+'</span></div></div>';
    }
    if(K.loi.length || K.canh.length){
      o += '<div class="co-cb mb">'+ K.loi.map(function(t){ return '<div style="--m:'+CO.MAU_DEN.DO+'">'+ic('x','w-3 h-3')+'<span>'+h(t)+'</span></div>'; }).join('')+
        K.canh.map(function(t){ return '<div style="--m:'+CO.MAU_DEN.VANG+'">'+ic('alert','w-3 h-3')+'<span>'+h(t)+'</span></div>'; }).join('') +'</div>';
    }
    if(!ct) return o;

    /* Xem trước lịch */
    var L = CO.lapLich(ct, f.bd), het = CO.cong(f.bd, (Number(ct.ngay)||1) - 1);
    o += U.sec('Xem trước lịch buổi', L.length+' buổi · '+ngayDu(f.bd)+' → '+ngayDu(het)+' · chưa lưu cho tới khi bấm "Ghép & lập lịch"');
    o += '<div class="co-ds mb">'+ (ct.gd||[]).map(function(g, gi){
      var bs = L.filter(function(b){ return b.gd===gi; });
      return '<div class="co-the" style="border-left:4px solid '+h(ct.c||'#185AB4')+';padding:12px 14px">'+
        '<div class="co-hang"><b class="co-grow">'+(gi+1)+' · '+h(g.ten)+'</b><span class="tiny muted">'+h(CO.ngayVN(CO.cong(f.bd, g.tu-1)))+' – '+h(CO.ngayVN(CO.cong(f.bd, (g.den||g.tu)-1)))+'</span></div>'+
        '<div class="co-hang" style="gap:6px">'+ bs.map(function(b){
          return '<span class="chip co-so">Buổi '+b.so+' · '+h(ngayDu(b.ngay).replace(/\/\d{4}$/,''))+'</span>'; }).join('') +'</div>'+
        '<div class="tiny muted">'+icI('shield')+' Cổng: '+h(g.cong||'—')+'</div></div>';
    }).join('') +'</div>';
    o += '<div class="co-hang mb"><button class="btn pri'+(K.loi.length?' off':'')+'" data-co="ctg-luu"'+(K.loi.length?' aria-disabled="true"':'')+'>'+ic('check','w-4 h-4')+'Ghép & lập lịch</button>'+
      '<span class="tiny muted co-grow">Sau khi ghép: lịch vào sổ, nhật ký ghi một dòng "Ghép chương trình", màn Điều phối theo dõi từ hôm nay.</span></div>';
    return o;
  }
  CO.on('ctg-doi', function(){ docGhep(); veGiu(); });
  CO.on('ctg-luu', function(){
    var f = docGhep(), K = kiemGhep(f);
    if(K.loi.length){ U.toast(K.loi[0], 'err'); veGiu(); return; }
    var d = CO.ghep({ nha:K.nha, tenNha:K.ten, ct:K.ct.ma, coach:f.coach, batDau:f.bd });
    if(!d){ U.toast('Không ghép được — chương trình không còn trong danh mục.', 'err'); return; }
    var s = CO.st();
    s.ctGhep = { ct:f.ct, coach:f.coach, bd:CO.homNay(), nha:K.nha };
    U.toast('Đã ghép '+K.ten+' vào "'+K.ct.ten+'" · '+d.lich.length+' buổi đã lên lịch.', 'ok');
    if(G.manCoThat && G.manCoThat('coach-dp') && G.allowed && G.allowed('coach-dp')){
      s.tab['coach-dp'] = 'nha'; s.dpNha = d.id; CO.luu(false); G.go('coach-dp');
    } else { s.tab[VIEW] = 'dm'; CO.luu(); }
  });

  /* ═════════ 4 · THIẾT KẾ CHƯƠNG TRÌNH ═════════ */
  function nhapRong(){
    return { sua:null, ten:'', loai:'chuyen-de', tang:[], ngay:21, doiTuong:'', muc:'', mien:[], vao:'', ra:'', capCoach:'R07', c:'#0B6675',
      gd:[ { ten:'', tu:1, den:21, buoi:1, muc:'', cong:'' } ], kpi:[ ['', ''] ] };
  }
  function saoCT(c){
    return { ten:c.ten||'', loai:c.loai||'chuyen-de', tang:(c.tang||[]).slice(), ngay:Number(c.ngay)||1, doiTuong:c.doiTuong||'', muc:c.muc||'',
      mien:(c.mien||[]).slice(), vao:c.vao||'', ra:c.ra||'', capCoach:c.capCoach||'R07', c:c.c||'#0B6675',
      gd:(c.gd||[]).map(function(g){ return { ten:g.ten||'', tu:Number(g.tu)||1, den:Number(g.den||g.tu)||1, buoi:Number(g.buoi)||1, muc:g.muc||'', cong:g.cong||'' }; }),
      kpi:(c.kpi||[]).map(function(x){ return [x[0]||'', x[1]||'']; }) };
  }
  function nhap(){ var s = CO.st(); if(!s.ctTK || !Array.isArray(s.ctTK.gd)) s.ctTK = nhapRong(); return s.ctTK; }
  function so(id, mac){ var v = CO.o(id); if(v==='') return mac; var n = Number(v); return isNaN(n) ? mac : Math.round(n); }
  function docTK(){
    var n = nhap();
    if(!document.getElementById('tkc-ten')) return n;
    n.ten = CO.o('tkc-ten'); n.loai = CO.o('tkc-loai') || n.loai; n.ngay = so('tkc-ngay', ''); n.doiTuong = CO.o('tkc-dt'); n.muc = CO.o('tkc-muc');
    n.vao = CO.o('tkc-vao'); n.ra = CO.o('tkc-ra'); n.capCoach = CO.o('tkc-cap') || n.capCoach; n.c = CO.o('tkc-mau') || n.c;
    n.tang = [1,2,3,4,5].filter(function(t){ return CO.o('tkc-tang-'+t)===true; });
    n.mien = ['G','I','T','A'].filter(function(k){ return CO.o('tkc-mien-'+k)===true; });
    n.gd = n.gd.map(function(g, i){ return { ten:CO.o('tkc-g'+i+'-ten'), tu:so('tkc-g'+i+'-tu',''), den:so('tkc-g'+i+'-den',''), buoi:so('tkc-g'+i+'-buoi',''), muc:CO.o('tkc-g'+i+'-muc'), cong:CO.o('tkc-g'+i+'-cong') }; });
    n.kpi = n.kpi.map(function(x, i){ return [CO.o('tkc-k'+i+'-ten'), CO.o('tkc-k'+i+'-chi')]; });
    return n;
  }
  function kiemTK(n){
    var loi = [];
    if(!n.ten || n.ten.length < 4) loi.push('Tên chương trình cần ít nhất 4 ký tự.');
    else if(CO.dsCT().some(function(c){ return String(c.ten).toLowerCase()===n.ten.toLowerCase() && c.ma!==n.sua; })) loi.push('Đã có chương trình tên "'+n.ten+'".');
    if(!n.tang.length) loi.push('Chọn ít nhất một tầng.');
    var ngay = Number(n.ngay);
    if(!ngay || ngay < 1 || ngay > 400) loi.push('Số ngày phải từ 1 đến 400.');
    if(!n.mien.length) loi.push('Chọn ít nhất một trụ trọng tâm G/I/T/A.');
    if(!n.muc) loi.push('Viết mục tiêu chương trình.');
    if(!n.gd.length) loi.push('Cần ít nhất một giai đoạn.');
    var truoc = 0, tongB = 0;
    n.gd.forEach(function(g, i){
      var ten = 'Giai đoạn '+(i+1);
      if(!g.ten) loi.push(ten+': chưa có tên.');
      var tu = Number(g.tu), den = Number(g.den), b = Number(g.buoi);
      if(!tu || !den){ loi.push(ten+': nhập đủ từ ngày – đến ngày.'); return; }
      if(den < tu) loi.push(ten+': "đến ngày" ('+den+') nhỏ hơn "từ ngày" ('+tu+').');
      if(tu < 1 || (ngay && den > ngay)) loi.push(ten+': phải nằm trong ngày 1–'+(ngay||'?')+'.');
      if(tu !== truoc + 1) loi.push(truoc===0 ? ten+': phải bắt đầu từ ngày 1.' : (tu <= truoc ? ten+': chồng lên giai đoạn trước (ngày '+tu+'–'+truoc+').' : ten+': hở ngày '+(truoc+1)+(tu-1>truoc+1?'–'+(tu-1):'')+' so với giai đoạn trước.'));
      truoc = Math.max(truoc, den);
      if(!b || b < 1) loi.push(ten+': cần ít nhất 1 buổi.'); else tongB += b;
      if(b && den >= tu && b > den - tu + 1) loi.push(ten+': '+b+' buổi nhiều hơn số ngày của giai đoạn.');
      if(!g.cong) loi.push(ten+': chưa có cổng nghiệm thu.');
    });
    if(n.gd.length && ngay && truoc && truoc < ngay) loi.push('Giai đoạn cuối kết thúc ngày '+truoc+' — chương trình dài '+ngay+' ngày, còn hở ngày '+(truoc+1)+'–'+ngay+'.');
    if(!tongB) loi.push('Chương trình cần ít nhất 1 buổi.');
    return loi;
  }
  function dungDK(ma){ return CO.st().dk.filter(function(d){ return d.ct===ma; }).length; }

  function veThietKe(s){
    if(!CO.laQuanLy()){
      return '<div class="card pad-sm"><b>Thiết kế chương trình dành cho Trưởng nhóm Coach trở lên.</b>'+
        '<p class="sm muted mt">Chương trình là chuẩn chung của cả đội, nên chỉ người giữ chuẩn được thêm hay sửa. Anh/chị vẫn dùng được mọi chương trình ở thẻ Danh mục, '+
        'và đề xuất chương trình mới với Trưởng nhóm kèm dữ liệu từ các nhà mình đang dẫn.</p></div>';
    }
    var n = nhap(), rieng = s.chuong;
    var o = '';
    /* Danh sách chương trình tự thiết kế */
    o += U.sec('Chương trình tự thiết kế', rieng.length ? rieng.length+' chương trình' : 'Chưa có — bắt đầu từ trang trắng hoặc nhân bản một chương trình chuẩn');
    if(rieng.length){
      o += '<div class="co-ds mb">'+ rieng.map(function(c){
        var dung = dungDK(c.ma);
        return '<div class="co-dong" style="border-left:4px solid '+h(c.c||'#0B6675')+'"><span class="co-grow sm" style="min-width:180px"><b>'+h(c.ten)+'</b> <span class="tiny muted">'+h(c.ma)+'</span><br>'+
          '<span class="tiny muted">'+h(LOAI[c.loai]||c.loai)+' · '+(c.tang||[]).map(function(t){ return 'T'+t; }).join(', ')+' · '+h(c.ngay)+' ngày · '+tongBuoi(c)+' buổi · '+dung+' lượt ghép</span></span>'+
          '<button class="btn ghost sm" data-co="ctk-sua" data-ma="'+h(c.ma)+'">'+ic('edit','w-3 h-3')+'Sửa</button>'+
          '<button class="btn ghost sm" data-co="ctk-nhan" data-ma="'+h(c.ma)+'">Nhân bản</button>'+
          '<button class="btn ghost sm" data-co="ctk-xoa" data-ma="'+h(c.ma)+'"'+(dung?' title="Đang có nhà dùng — không xoá được"':'')+'>Xoá</button></div>'; }).join('') +'</div>';
    }
    o += '<div class="card pad-sm mb"><div class="co-hang"><span class="sm co-grow" style="min-width:200px"><b>Nhân bản từ chương trình chuẩn</b> — lấy sẵn giai đoạn, cổng và KPI rồi chỉnh.</span>'+
      '<span style="min-width:200px;flex:1">'+CO.chon('tkc-nguon', (G.CO_CT||[]).map(function(c){ return [c.ma, c.ten]; }), '', ' aria-label="Chương trình chuẩn để nhân bản"')+'</span>'+
      '<button class="btn sm" data-co="ctk-tu-chuan">Nhân bản vào biểu mẫu</button></div></div>';

    /* Biểu mẫu */
    var dangSua = n.sua && CO.ct(n.sua);
    o += U.sec(dangSua ? 'Đang sửa: '+n.sua : 'Chương trình mới', dangSua ? (dungDK(n.sua) ? dungDK(n.sua)+' lượt ghép đang dùng — lịch đã lập của họ giữ nguyên, chỉ lượt ghép mới theo bản sửa' : 'Chưa nhà nào dùng') : 'Mã tự sinh khi lưu (TK-…)');
    o += '<div class="card pad-sm mb"><div class="co-form">'+
      CO.o2('Tên chương trình', '<input class="inp" id="tkc-ten" maxlength="80" value="'+h(n.ten)+'" placeholder="VD: Ôn thi vào 10 trong 60 ngày">')+
      CO.o2('Loại', CO.chon('tkc-loai', Object.keys(LOAI).map(function(x){ return [x, LOAI[x]]; }), n.loai))+
      CO.o2('Số ngày', '<input class="inp" type="number" min="1" max="400" id="tkc-ngay" value="'+h(n.ngay)+'">')+
      CO.o2('Coach tối thiểu', CO.chon('tkc-cap', CAP.map(function(r){ return [r, vai(r).n+' ('+r+')']; }), n.capCoach))+
      CO.o2('Màu nhận diện', CO.chon('tkc-mau', MAU, n.c))+
    '</div>'+
    '<div class="co-form mt">'+
      '<fieldset class="co-f" style="border:0;padding:0;margin:0"><span>Tầng</span><div class="co-hang" style="gap:12px">'+ [1,2,3,4,5].map(function(t){
        return '<label class="sm" style="display:inline-flex;gap:5px;align-items:center"><input type="checkbox" id="tkc-tang-'+t+'"'+(n.tang.indexOf(t)>=0?' checked':'')+'>'+h(tier(t).code||'T'+t)+'</label>'; }).join('') +'</div></fieldset>'+
      '<fieldset class="co-f" style="border:0;padding:0;margin:0"><span>Trụ trọng tâm</span><div class="co-hang" style="gap:12px">'+ ['G','I','T','A'].map(function(k){
        return '<label class="sm" style="display:inline-flex;gap:5px;align-items:center"><input type="checkbox" id="tkc-mien-'+k+'"'+(n.mien.indexOf(k)>=0?' checked':'')+'>'+k+' · '+h(tenTru(k))+'</label>'; }).join('') +'</div></fieldset>'+
    '</div>'+
    '<div class="co-form mt">'+
      CO.o2('Đối tượng', '<input class="inp" id="tkc-dt" maxlength="160" value="'+h(n.doiTuong)+'" placeholder="Nhà nào nên vào chương trình này">')+
      CO.o2('Điều kiện vào', '<input class="inp" id="tkc-vao" maxlength="160" value="'+h(n.vao)+'">')+
      CO.o2('Điều kiện ra', '<input class="inp" id="tkc-ra" maxlength="160" value="'+h(n.ra)+'">')+
    '</div>'+
    '<div class="mt">'+CO.o2('Mục tiêu chương trình', '<textarea class="inp" id="tkc-muc" rows="2" maxlength="400" placeholder="Kết quả đo được khi kết thúc — không hứa điều không đo được">'+h(n.muc)+'</textarea>')+'</div></div>';

    /* Giai đoạn */
    var ngay = Number(n.ngay)||0;
    o += '<div class="co-hang mb"><b class="sm co-grow">Giai đoạn ('+n.gd.length+')</b>'+
      '<button class="btn ghost sm" data-co="ctk-chia">Chia đều số ngày</button>'+
      '<button class="btn sm" data-co="ctk-them-gd">'+ic('plus','w-3 h-3')+'Thêm giai đoạn</button></div>';
    if(ngay && n.gd.length){
      o += '<div class="co-ct-truc mb" role="img" aria-label="Phủ ngày của các giai đoạn">'+ n.gd.map(function(g, gi){
        var tu = Number(g.tu)||0, den = Number(g.den)||0, dai = Math.max(1, den - tu + 1);
        return '<i title="'+h(g.ten||('Giai đoạn '+(gi+1)))+'" style="flex:'+dai+';background:'+h(n.c)+';opacity:'+(1-(gi%2)*0.45)+'"></i>'; }).join('') +'</div>';
    }
    o += '<div class="co-ds mb">'+ n.gd.map(function(g, i){
      var p = 'tkc-g'+i+'-';
      return '<div class="co-the" style="border-left:4px solid '+h(n.c)+';padding:12px 14px">'+
        '<div class="co-hang"><b class="sm co-grow">Giai đoạn '+(i+1)+'</b>'+
          (n.gd.length>1 ? '<button class="btn ghost sm" data-co="ctk-xoa-gd" data-i="'+i+'" aria-label="Bỏ giai đoạn '+(i+1)+'">'+ic('x','w-3 h-3')+'Bỏ</button>' : '')+'</div>'+
        '<div class="co-form" style="grid-template-columns:repeat(auto-fit,minmax(96px,1fr))">'+
          '<div style="grid-column:1/-1">'+CO.o2('Tên giai đoạn', '<input class="inp" id="'+p+'ten" maxlength="80" value="'+h(g.ten)+'">')+'</div>'+
          CO.o2('Từ ngày', '<input class="inp" type="number" min="1" id="'+p+'tu" value="'+h(g.tu)+'">')+
          CO.o2('Đến ngày', '<input class="inp" type="number" min="1" id="'+p+'den" value="'+h(g.den)+'">')+
          CO.o2('Số buổi', '<input class="inp" type="number" min="1" id="'+p+'buoi" value="'+h(g.buoi)+'">')+
        '</div>'+
        '<div class="co-form">'+
          CO.o2('Mục tiêu giai đoạn', '<input class="inp" id="'+p+'muc" maxlength="200" value="'+h(g.muc)+'">')+
          CO.o2('Cổng nghiệm thu (đo được)', '<input class="inp" id="'+p+'cong" maxlength="200" value="'+h(g.cong)+'" placeholder="VD: Làm hành vi mới ≥ 5/7 ngày">')+
        '</div></div>';
    }).join('') +'</div>';

    /* KPI */
    o += '<div class="co-hang mb"><b class="sm co-grow">KPI ('+n.kpi.length+')</b><button class="btn sm" data-co="ctk-them-kpi">'+ic('plus','w-3 h-3')+'Thêm KPI</button></div>';
    o += '<div class="co-ds mb">'+ n.kpi.map(function(x, i){
      return '<div class="co-dong" style="align-items:flex-end">'+
        '<span class="co-grow" style="min-width:180px">'+CO.o2('Chỉ số '+(i+1), '<input class="inp" id="tkc-k'+i+'-ten" maxlength="120" value="'+h(x[0])+'">')+'</span>'+
        '<span style="min-width:120px;flex:0 1 180px">'+CO.o2('Chỉ tiêu', '<input class="inp" id="tkc-k'+i+'-chi" maxlength="40" value="'+h(x[1])+'" placeholder="≥ 70%">')+'</span>'+
        '<button class="btn ghost sm" data-co="ctk-xoa-kpi" data-i="'+i+'" aria-label="Bỏ KPI '+(i+1)+'">'+ic('x','w-3 h-3')+'</button></div>'; }).join('') +'</div>';

    var loi = s.ctTKSoat ? kiemTK(n) : [];
    if(loi.length) o += '<div class="co-cb mb">'+ loi.map(function(t){ return '<div style="--m:'+CO.MAU_DEN.DO+'">'+ic('x','w-3 h-3')+'<span>'+h(t)+'</span></div>'; }).join('') +'</div>';
    else if(s.ctTKSoat) o += '<div class="co-cb mb"><div style="--m:'+CO.MAU_DEN.XANH+'">'+ic('check','w-3 h-3')+'<span>Biểu mẫu hợp lệ — lưu được.</span></div></div>';
    o += '<div class="co-hang mb"><button class="btn pri" data-co="ctk-luu">'+ic('check','w-4 h-4')+(dangSua?'Lưu thay đổi':'Lưu chương trình')+'</button>'+
      '<button class="btn ghost" data-co="ctk-kiem">Kiểm tra</button>'+
      '<button class="btn ghost" data-co="ctk-moi">'+(dangSua?'Huỷ sửa':'Làm lại từ đầu')+'</button>'+
      '<span class="tiny muted co-grow" style="min-width:200px">Giai đoạn phải liền nhau từ ngày 1 tới ngày cuối, không chồng, không hở; mỗi giai đoạn ≥ 1 buổi và có cổng đo được.</span></div>';
    return o;
  }
  CO.on('ctk-them-gd', function(){
    var n = docTK(), cuoi = n.gd[n.gd.length-1], tu = cuoi ? (Number(cuoi.den)||0) + 1 : 1, ngay = Number(n.ngay)||tu;
    n.gd.push({ ten:'', tu:tu, den:Math.max(tu, ngay), buoi:1, muc:'', cong:'' });
    veGiu('tkc-g'+(n.gd.length-1)+'-ten');
  });
  CO.on('ctk-xoa-gd', function(el){ var n = docTK(), i = Number(el.getAttribute('data-i')); if(n.gd.length > 1) n.gd.splice(i, 1); veGiu(); });
  CO.on('ctk-them-kpi', function(){ var n = docTK(); n.kpi.push(['','']); veGiu('tkc-k'+(n.kpi.length-1)+'-ten'); });
  CO.on('ctk-xoa-kpi', function(el){ var n = docTK(); n.kpi.splice(Number(el.getAttribute('data-i')), 1); veGiu(); });
  CO.on('ctk-chia', function(){
    var n = docTK(), ngay = Number(n.ngay)||0, k = n.gd.length;
    if(!ngay || ngay < k){ U.toast('Nhập số ngày (≥ số giai đoạn) trước khi chia.', 'err'); return; }
    var tu = 1;
    n.gd.forEach(function(g, i){ var den = i===k-1 ? ngay : Math.round(ngay*(i+1)/k); g.tu = tu; g.den = Math.max(tu, den); tu = g.den + 1; });
    U.toast('Đã chia '+ngay+' ngày cho '+k+' giai đoạn.', 'ok'); veGiu();
  });
  CO.on('ctk-kiem', function(){ var n = docTK(); CO.st().ctTKSoat = 1; var l = kiemTK(n);
    U.toast(l.length ? 'Còn '+l.length+' chỗ cần sửa.' : 'Biểu mẫu hợp lệ — lưu được.', l.length?'err':'ok'); veGiu(); });
  CO.on('ctk-moi', function(){ var s = CO.st(); s.ctTK = nhapRong(); s.ctTKSoat = 0; veGiu(); });
  CO.on('ctk-tu-chuan', function(){
    var c = CO.ct(CO.o('tkc-nguon')); if(!c){ U.toast('Chọn một chương trình chuẩn.', 'err'); return; }
    var s = CO.st(), n = saoCT(c); n.sua = null; n.ten = c.ten+' (bản đội)'; s.ctTK = n; s.ctTKSoat = 0;
    U.toast('Đã chép "'+c.ten+'" vào biểu mẫu — chỉnh rồi lưu.', 'ok'); veGiu('tkc-ten');
  });
  CO.on('ctk-sua', function(el){
    var c = CO.ct(el.getAttribute('data-ma')); if(!c) return;
    var s = CO.st(), n = saoCT(c); n.sua = c.ma; s.ctTK = n; s.ctTKSoat = 0; veGiu('tkc-ten');
  });
  CO.on('ctk-nhan', function(el){
    var c = CO.ct(el.getAttribute('data-ma')); if(!c) return;
    var s = CO.st(), n = saoCT(c); n.sua = null; n.ten = c.ten+' (bản sao)'; s.ctTK = n; s.ctTKSoat = 0;
    U.toast('Đã chép vào biểu mẫu — đổi tên rồi lưu.', 'ok'); veGiu('tkc-ten');
  });
  CO.on('ctk-xoa', function(el){
    var ma = el.getAttribute('data-ma'), c = CO.ct(ma); if(!c) return;
    var dung = dungDK(ma);
    if(dung){ U.toast('Không xoá được: '+dung+' lượt ghép đang dùng "'+c.ten+'". Kết thúc các lượt ấy trước.', 'err'); return; }
    U.modal('<h3 style="margin:0 0 8px">Xoá chương trình?</h3><p class="sm">"'+h(c.ten)+'" ('+h(ma)+') sẽ bị xoá khỏi danh mục. Bài coach đã soạn cho nó vẫn giữ trong thư viện.</p>'+
      '<div class="co-hang mt2"><button class="btn pri" data-co="ctk-xoa-ok" data-ma="'+h(ma)+'">Xoá</button><button class="btn ghost" data-co="ct-dong-hop">Thôi</button></div>');
  });
  CO.on('ctk-xoa-ok', function(el){
    var s = CO.st(), ma = el.getAttribute('data-ma');
    if(dungDK(ma)){ U.closeModal(); U.toast('Đã có nhà dùng chương trình — không xoá.', 'err'); return; }
    s.chuong = s.chuong.filter(function(c){ return c.ma!==ma; });
    if(s.ctTK && s.ctTK.sua===ma) s.ctTK = nhapRong();
    if(s.ctChon===ma) s.ctChon = '';
    U.closeModal(); U.toast('Đã xoá chương trình '+ma+'.', 'ok'); veGiu();
  });
  CO.on('ct-dong-hop', function(){ U.closeModal(); });
  CO.on('ctk-luu', function(){
    var s = CO.st(), n = docTK(); s.ctTKSoat = 1;
    var loi = kiemTK(n);
    if(loi.length){ U.toast(loi[0], 'err'); veGiu(); return; }
    var rec = { ten:n.ten, tang:n.tang.slice().sort(), ngay:Number(n.ngay), loai:n.loai, c:n.c, doiTuong:n.doiTuong, mien:n.mien.slice(), muc:n.muc,
      gd:n.gd.map(function(g){ return { ten:g.ten, tu:Number(g.tu), den:Number(g.den), buoi:Number(g.buoi), muc:g.muc, cong:g.cong }; }),
      kpi:n.kpi.filter(function(x){ return x[0]; }).map(function(x){ return [x[0], x[1]||'—']; }),
      vao:n.vao, ra:n.ra, capCoach:n.capCoach, sua:Date.now() };
    var cu = n.sua ? s.chuong.filter(function(c){ return c.ma===n.sua; })[0] : null;
    if(cu){ Object.keys(rec).forEach(function(k){ cu[k] = rec[k]; }); }
    else {
      var ma; do { ma = 'TK-'+Date.now().toString(36).slice(-4).toUpperCase()+Math.random().toString(36).slice(2,4).toUpperCase(); } while(CO.ct(ma));
      rec.ma = ma; rec.tao = Date.now(); rec.tacGia = CO.toi().u; s.chuong.push(rec); cu = rec;
    }
    s.ctTK = nhapRong(); s.ctTKSoat = 0; s.ctChon = cu.ma; s.tab[VIEW] = 'ct';
    U.toast('Đã lưu chương trình "'+cu.ten+'" ('+cu.ma+').', 'ok'); CO.luu();
  });
})();
