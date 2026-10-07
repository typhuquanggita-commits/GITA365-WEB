/* ═══════════════════════════════════════════════════════════════
   GITA 365 — HỆ ĐIỀU HÀNH COACH · ĐIỀU PHỐI & GIÁM SÁT (coach-dp)

   Đo chính xác từng hoạt động của mỗi gia đình đang trong chương trình.
   Mọi con số đọc thẳng từ sổ chung (coach-loi.js) — không số nào gõ tay:

     Tổng quan     bảng mọi nhà đang chạy: ngày, giai đoạn, tham gia,
                   nhiệm vụ, đúng hạn, minh chứng, im lặng, gắn kết, đèn
     Lịch buổi     buổi sắp tới & buổi đã qua chưa ghi → có mặt / vắng / dời
     Nhà           một nhà: giai đoạn, dòng thời gian từng hoạt động,
                   biểu đồ 8 tuần, năm phần của điểm gắn kết, nhiệm vụ mở
     Ghi hoạt động biểu mẫu ghi nhanh (có thể đẩy lượt chạm lên máy chủ)
     Nhật ký       toàn bộ nhật ký, lọc, phân trang, xuất CSV
     Cảnh báo      cảnh báo sớm, đỏ trước, kèm việc nên làm

   Quyền: pro_coach. Coach thấy nhà mình; Trưởng nhóm trở lên thấy cả đội.
   Máy chủ: chỉ gọi cửa đã có (doSoCham, ghiCham). Không đụng giấy phép ·
   mã hoá.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic, CO = G.CO;
  var VIEW = 'coach-dp';
  var TT_DK = { dang:'Đang chạy', dung:'Tạm dừng', xong:'Đã kết thúc', huy:'Đã huỷ' };
  var KIEU = { nhan:'Nhắn', goi:'Gọi', wow:'Wow (bất ngờ)' };
  var THU = ['Chủ nhật','Thứ hai','Thứ ba','Thứ tư','Thứ năm','Thứ sáu','Thứ bảy'];
  var PHAN = {
    thamGia:   { ten:'Tham gia buổi',       cach:'buổi có mặt ÷ (có mặt + vắng), chỉ tính buổi đã tới hạn' },
    nhiemVu:   { ten:'Hoàn thành nhiệm vụ', cach:'nhiệm vụ đã xong ÷ nhiệm vụ đã giao' },
    minhChung: { ten:'Minh chứng',          cach:'số minh chứng ÷ nhiệm vụ đã xong (tối đa 100%)' },
    nhipDeu:   { ten:'Nhịp đều 14 ngày',    cach:'số ngày nhà có hoạt động trong 14 ngày ÷ số ngày đã tham gia (tối đa 14)' },
    haiLong:   { ten:'Hài lòng',            cach:'trung bình 5 lần nhà chấm buổi gần nhất ÷ 5' }
  };

  /* ───────── Tiện ích ───────── */
  function pad(n){ return ('0'+n).slice(-2); }
  function d2s(t){ var x = new Date(t); return x.getFullYear()+'-'+pad(x.getMonth()+1)+'-'+pad(x.getDate()); }
  function dtLocal(t){ var x = new Date(t); return d2s(t)+'T'+pad(x.getHours())+':'+pad(x.getMinutes()); }
  function cong(a){ return a.reduce(function(s,x){ return s+x; }, 0); }
  function tb(a){ return a.length ? cong(a)/a.length : null; }
  function so1(x){ return x==null ? '—' : x.toFixed(1).replace('.', ','); }
  function phan(t, m){ return m ? CO.pt(t/m) : '—'; }
  function mauGK(g){ return g==null ? 'var(--ink-4)' : g>=70 ? CO.MAU_DEN.XANH : g>=45 ? CO.MAU_DEN.VANG : CO.MAU_DEN.DO; }
  function vach(frac, m, rong){
    var p = frac==null ? 0 : Math.max(0, Math.min(100, Math.round(100*frac)));
    return '<div class="co-thanhbar" style="--m:'+m+(rong?';width:'+rong+';margin-left:auto':'')+'" role="img" aria-label="'+p+'%"><i style="width:'+p+'%"></i></div>';
  }
  function the(nhan, mau, tieuDe){ return '<span class="co-tag" style="color:'+mau+';background:color-mix(in srgb,'+mau+' 12%,transparent)"'+(tieuDe?' title="'+h(tieuDe)+'"':'')+'>'+h(nhan)+'</span>'; }
  function thuNgay(s){ return THU[new Date(s+'T00:00:00').getDay()]+', '+CO.ngayVN(s); }
  function tenCT(d){ var c = CO.ct(d.ct); return c ? c.ten : d.ct; }
  function tenGD(d, i){ var c = CO.ct(d.ct); return (c && c.gd && c.gd[i]) ? c.gd[i].ten : '—'; }
  function st(){ return CO.st(); }
  function me(){ return CO.toi().u; }
  var moCT = function(){ return !G.allowed || G.allowed('coach-ct'); };

  /* Phạm vi nhìn: Coach thấy nhà mình, quản lý thấy cả đội (CO.dsDK đã lo). */
  function dsThay(){ return CO.dsDK(); }
  function dsDang(){ return dsThay().filter(function(d){ return d.tt==='dang'; }); }
  function thayDK(id){ return dsThay().filter(function(d){ return d.id===id; })[0] || null; }
  function hdThay(){
    var all = st().hd;
    if(CO.laQuanLy()) return all.slice();
    var id = {}, nha = {};
    dsThay().forEach(function(d){ id[d.id] = 1; nha[d.nha] = 1; });
    return all.filter(function(e){ return e.dk ? id[e.dk] : nha[e.nha]; });
  }
  function nguoiGhi(e){ return e.ai ? CO.tenCoach(e.ai) : (CO.hd(e.loai).ai==='nha' ? 'Gia đình' : '—'); }
  function nguonTen(e){ return e.mau ? 'minh hoạ' : e.nguon==='may-chu' ? 'máy chủ' : 'sổ'; }
  function nguonThe(e){
    if(e.mau) return '<span class="co-tag">minh hoạ</span>';
    if(e.nguon==='may-chu') return the('máy chủ', 'var(--gita)');
    return the('sổ', 'var(--ink-3)');
  }
  function nvGiao(nha, ma){ return st().hd.filter(function(e){ return e.loai==='nv_giao' && e.nha===nha && e.ma===ma; })[0] || null; }
  function giaTri(e){
    var t = CO.hd(e.loai), v = e.gt;
    if(e.loai==='nv_giao') return (e.ma ? e.ma+' · ' : '')+(e.han ? 'hạn '+CO.ngayVN(e.han) : 'không hạn');
    if((e.loai==='nv_xong' || e.loai==='minh_chung') && e.ma){ var g = nvGiao(e.nha, e.ma); return e.ma+(g && g.ghi ? ' · '+g.ghi : ''); }
    if(e.loai==='cong_dat' && v!==''){ var d = CO.dk(e.dk); return 'Giai đoạn '+(Number(v)+1)+(d ? ' · '+tenGD(d, Number(v)) : ''); }
    if(v==='' || v==null) return '';
    if(t.gt==='1-5') return v+'/5';
    if(t.gt==='kieu') return KIEU[v] || v;
    if(t.gt==='diem') return v+' điểm';
    return String(v);
  }
  /* Nhiệm vụ đang mở của một lượt ghép: giao mà chưa có nv_xong cùng mã. */
  function nvMo(d){
    var ev = CO.hdCua(d.nha, d.id), xong = {};
    ev.forEach(function(e){ if(e.loai==='nv_xong' && e.ma) xong[e.ma] = 1; });
    return ev.filter(function(e){ return e.loai==='nv_giao' && e.ma && !xong[e.ma]; });
  }
  function nvTatCa(d){ return CO.hdCua(d.nha, d.id).filter(function(e){ return e.loai==='nv_giao' && e.ma; }); }

  function soLieu(){
    var cs = dsDang().map(function(d){ return { d:d, c:CO.chiSo(d) }; });
    var coMat = cong(cs.map(function(x){ return x.c.coMat; })), vang = cong(cs.map(function(x){ return x.c.vang; }));
    var xong = cong(cs.map(function(x){ return x.c.xong; })), dung = cong(cs.map(function(x){ return x.c.dungHan; }));
    var gk = cs.map(function(x){ return x.c.ganKet; }).filter(function(x){ return x!=null; });
    var nha = {}; cs.forEach(function(x){ nha[x.d.nha] = 1; });
    return { cs:cs, nha:Object.keys(nha).length, coMat:coMat, vang:vang, xong:xong, dung:dung,
      gk: gk.length ? Math.round(tb(gk)) : null,
      DO: cs.filter(function(x){ return x.c.den==='DO'; }).length,
      VANG: cs.filter(function(x){ return x.c.den==='VANG'; }).length,
      XANH: cs.filter(function(x){ return x.c.den==='XANH'; }).length };
  }
  function trong(t, s, nut){
    return '<div class="card center" style="padding:28px"><b>'+h(t)+'</b>'+(s ? '<p class="sm muted mt" style="max-width:60ch;margin-inline:auto">'+h(s)+'</p>' : '')+(nut||'')+'</div>';
  }
  function nutGhep(){ return moCT() ? '<p class="mt"><button class="btn pri" data-v="coach-ct">'+ic('compass','w-4 h-4')+'Ghép chương trình cho một nhà</button></p>' : ''; }

  /* ═════════ TỔNG QUAN ═════════ */
  var THU_TU_DEN = { DO:0, VANG:1, XANH:2 };
  function xepCS(cs, k){
    var a = cs.slice();
    a.sort(function(x, y){
      var gx = x.c.ganKet==null ? 999 : x.c.ganKet, gy = y.c.ganKet==null ? 999 : y.c.ganKet;
      if(k==='gk') return gx - gy;
      if(k==='im') return y.c.imLang - x.c.imLang;
      return (THU_TU_DEN[x.c.den] - THU_TU_DEN[y.c.den]) || (gx - gy);
    });
    return a;
  }
  function tabTong(S){
    var ql = CO.laQuanLy(), o = '';
    if(!S.cs.length) return trong('Chưa có nhà nào đang chạy chương trình',
      'Bảng giám sát bắt đầu khi một nhà được ghép chương trình. Mọi số đo ở màn này đọc từ lịch buổi và nhật ký hoạt động của nhà đó.', nutGhep());
    var k = st().dpSap || 'den';
    o += '<div class="co-hang mb"><span class="co-grow sm muted" style="min-width:230px">'+S.cs.length+' lượt ghép đang chạy · số đo tính tới hôm nay '+h(CO.ngayVN(CO.homNay()))+'</span>'+
      '<label class="co-hang sm" style="gap:6px"><span class="muted">Xếp theo</span>'+
      CO.chon('dp-sap', [['den','Đèn (đỏ trước)'],['gk','Gắn kết (thấp trước)'],['im','Im lặng (lâu nhất trước)']], k, ' data-co-ch="dp-sap" style="width:auto"')+'</label></div>';
    o += '<div class="co-tb mb"><table><thead><tr><th>Nhà</th><th>Chương trình</th>'+(ql?'<th>Coach</th>':'')+
      '<th>Ngày · giai đoạn</th><th>Tham gia</th><th>Nhiệm vụ</th><th>Đúng hạn</th><th>Minh chứng</th><th>Im lặng</th><th>Gắn kết</th><th>Đèn</th><th></th></tr></thead><tbody>'+
      xepCS(S.cs, k).map(function(x){
        var d = x.d, c = x.c;
        return '<tr><td><b>'+h(d.tenNha)+'</b>'+CO.nhanMau(d)+'<div class="tiny muted">'+h(d.nha)+'</div></td>'+
          '<td>'+h(tenCT(d))+'</td>'+(ql?'<td>'+h(CO.tenCoach(d.coach))+'</td>':'')+
          '<td><span class="co-so">'+Math.min(c.ngayThu, c.tongNgay)+'/'+c.tongNgay+'</span><div class="tiny muted">'+h(tenGD(d, c.gdNay))+'</div></td>'+
          '<td class="so">'+CO.pt(c.p.thamGia)+'<div class="tiny muted">'+c.coMat+'/'+(c.coMat+c.vang)+' buổi</div></td>'+
          '<td class="so">'+c.xong+'/'+c.giao+'</td>'+
          '<td class="so">'+phan(c.dungHan, c.xong)+'</td>'+
          '<td class="so">'+c.minhChung+'</td>'+
          '<td class="so" style="color:'+(c.imLang>=7?CO.MAU_DEN.DO:c.imLang>=4?CO.MAU_DEN.VANG:'inherit')+'">'+c.imLang+' ngày</td>'+
          '<td class="so"><b style="color:'+mauGK(c.ganKet)+'">'+(c.ganKet==null?'—':c.ganKet)+'</b>'+vach(c.ganKet==null?0:c.ganKet/100, mauGK(c.ganKet), '64px')+'</td>'+
          '<td>'+CO.den(c.den)+'</td>'+
          '<td><button class="btn ghost sm" data-co="dp-mo" data-dk="'+h(d.id)+'">Mở</button></td></tr>';
      }).join('')+'</tbody></table></div>';

    /* Phân bố gắn kết + tóm tắt theo chương trình */
    var bk = [['Xanh · 70–100', CO.MAU_DEN.XANH, function(g){ return g!=null && g>=70; }],
              ['Vàng · 45–69', CO.MAU_DEN.VANG, function(g){ return g!=null && g>=45 && g<70; }],
              ['Đỏ · dưới 45', CO.MAU_DEN.DO, function(g){ return g!=null && g<45; }],
              ['Chưa đủ dữ liệu', 'var(--ink-4)', function(g){ return g==null; }]];
    var n = S.cs.length;
    o += '<div class="grid g2 mb"><div class="card pad-sm"><b class="sm">Phân bố điểm gắn kết</b>'+
      '<p class="tiny muted" style="margin:2px 0 10px">Theo điểm 0–100, không theo đèn — đèn còn xét thêm cảnh báo.</p><div class="co-ds">'+
      bk.map(function(b){ var m = S.cs.filter(function(x){ return b[2](x.c.ganKet); }).length;
        return '<div><div class="co-hang sm"><span class="co-grow">'+h(b[0])+'</span><b class="co-so">'+m+' nhà</b></div>'+vach(n ? m/n : 0, b[1])+'</div>'; }).join('')+
      '</div></div>';
    var theoCT = {};
    S.cs.forEach(function(x){ (theoCT[x.d.ct] = theoCT[x.d.ct] || []).push(x); });
    o += '<div class="card pad-sm"><b class="sm">Theo chương trình</b><div class="co-ds mt">'+
      Object.keys(theoCT).map(function(ma){
        var a = theoCT[ma], g = a.map(function(x){ return x.c.ganKet; }).filter(function(v){ return v!=null; });
        var cm = cong(a.map(function(x){ return x.c.coMat; })), vg = cong(a.map(function(x){ return x.c.vang; }));
        var gt = g.length ? Math.round(tb(g)) : null, ct = CO.ct(ma);
        return '<div class="co-hang sm"><span class="co-grow"><b>'+h(ct ? ct.ten : ma)+'</b><div class="tiny muted">'+a.length+' nhà · tham gia '+phan(cm, cm+vg)+
          ' · '+a.filter(function(x){ return x.c.den==='DO'; }).length+' đỏ</div></span>'+
          '<span class="tiny muted">gắn kết</span><b class="co-so" style="color:'+mauGK(gt)+'">'+(gt==null?'—':gt)+'</b></div>';
      }).join('')+'</div></div></div>';

    if(ql){
      var theoCoach = {};
      S.cs.forEach(function(x){ (theoCoach[x.d.coach] = theoCoach[x.d.coach] || []).push(x); });
      o += U.sec('Theo từng Coach', 'Số nhà, gắn kết trung bình và số nhà đỏ — đọc từ cùng bảng trên');
      o += '<div class="co-tb mb"><table><thead><tr><th>Coach</th><th>Nhà đang chạy</th><th>Gắn kết TB</th><th>Tham gia</th><th>Nhà đỏ</th><th>Nhà vàng</th></tr></thead><tbody>'+
        Object.keys(theoCoach).map(function(u){
          var a = theoCoach[u], g = a.map(function(x){ return x.c.ganKet; }).filter(function(v){ return v!=null; }), gt = g.length ? Math.round(tb(g)) : null;
          var cm = cong(a.map(function(x){ return x.c.coMat; })), vg = cong(a.map(function(x){ return x.c.vang; }));
          var nDo = a.filter(function(x){ return x.c.den==='DO'; }).length;
          return '<tr><td><b>'+h(CO.tenCoach(u))+'</b></td><td class="so">'+a.length+'</td><td class="so" style="color:'+mauGK(gt)+'"><b>'+(gt==null?'—':gt)+'</b></td>'+
            '<td class="so">'+phan(cm, cm+vg)+'</td><td class="so" style="color:'+(nDo?CO.MAU_DEN.DO:'inherit')+'">'+nDo+'</td>'+
            '<td class="so">'+a.filter(function(x){ return x.c.den==='VANG'; }).length+'</td></tr>';
        }).join('')+'</tbody></table></div>';
    }
    return o;
  }

  /* ═════════ LỊCH BUỔI ═════════ */
  function muc(co, cur){
    var s = '<div class="co-muc" role="group">';
    for(var i=1;i<=5;i++) s += '<button type="button" class="'+(Number(cur)===i?'on':'')+'" data-co="'+co+'" data-n="'+i+'" aria-pressed="'+(Number(cur)===i)+'">'+i+'</button>';
    return s+'</div>';
  }
  function tabLich(){
    var hn = CO.homNay(), cua = st().dpCua || '7', o = '';
    var den = cua==='qua' ? hn : CO.cong(hn, Number(cua));
    var ds = [];
    dsDang().forEach(function(d){
      d.lich.forEach(function(b){
        if(b.tt!=='cho') return;
        var qua = b.ngay < hn;
        if(qua || (cua!=='qua' && b.ngay >= hn && b.ngay <= den)) ds.push({ d:d, b:b, qua:qua });
      });
    });
    ds.sort(function(a, b){ return a.b.ngay < b.b.ngay ? -1 : a.b.ngay > b.b.ngay ? 1 : (a.d.tenNha < b.d.tenNha ? -1 : a.d.tenNha > b.d.tenNha ? 1 : a.b.so - b.b.so); });
    var nQua = ds.filter(function(x){ return x.qua; }).length;
    o += '<div class="co-hang mb"><span class="co-grow sm muted" style="min-width:230px">'+(nQua ? '<b style="color:'+CO.MAU_DEN.VANG+'">'+nQua+' buổi đã qua chưa ghi</b>' : 'Không có buổi đã qua nào chưa ghi')+
      (cua==='qua' ? '' : ' · '+(ds.length-nQua)+' buổi trong '+cua+' ngày tới')+'</span>'+
      '<label class="co-hang sm" style="gap:6px"><span class="muted">Khoảng</span>'+
      CO.chon('dp-cua', [['7','7 ngày tới'],['14','14 ngày tới'],['30','30 ngày tới'],['qua','Đã qua chưa ghi']], cua, ' data-co-ch="dp-cua" style="width:auto"')+'</label></div>';
    if(!ds.length) return o + trong('Không có buổi nào trong khoảng này',
      dsDang().length ? 'Mọi buổi đã tới hạn đều đã ghi kết quả.' : 'Chưa có nhà nào đang chạy chương trình.');
    var mo = st().dpMo || null, ngay = '';
    o += '<div class="co-ds">';
    ds.forEach(function(x){
      var d = x.d, b = x.b;
      if(b.ngay !== ngay){
        ngay = b.ngay;
        var cach = CO.cach(hn, b.ngay);
        o += '<div class="co-hang mt"><b class="sm">'+h(thuNgay(b.ngay))+'</b>'+
          (cach<0 ? the('đã qua '+(-cach)+' ngày · chưa ghi', CO.MAU_DEN.VANG) : cach===0 ? the('hôm nay', 'var(--gita)') : '<span class="tiny muted">còn '+cach+' ngày</span>')+'</div>';
      }
      var toi = b.ngay <= hn;
      o += '<div class="co-dong"><span class="co-grow" style="min-width:180px"><b>'+h(d.tenNha)+'</b>'+CO.nhanMau(d)+
        '<div class="tiny muted">'+h(tenCT(d))+' · buổi '+b.so+'/'+d.lich.length+' · '+h(tenGD(d, b.gd))+(b.doiTu ? ' · đã dời từ '+h(CO.ngayVN(b.doiTu)) : '')+'</div></span>'+
        '<span class="co-hang" style="gap:6px">'+
        (toi ? '<button class="btn sm" data-co="dp-xong" data-dk="'+h(d.id)+'" data-so="'+b.so+'">'+ic('check','w-3 h-3')+'Có mặt</button>'+
               '<button class="btn ghost sm" data-co="dp-vang" data-dk="'+h(d.id)+'" data-so="'+b.so+'">Vắng</button>'
             : '<span class="tiny muted">chưa tới ngày</span>')+
        '<button class="btn ghost sm" data-co="dp-doi" data-dk="'+h(d.id)+'" data-so="'+b.so+'">'+ic('calendar','w-3 h-3')+'Dời</button></span></div>';
      if(mo && mo.dk===d.id && mo.so===b.so) o += mo.k==='doi' ? oDoi(d, b, mo) : oXong(d, b, mo);
    });
    return o+'</div>';
  }
  function oXong(d, b, mo){
    var ct = CO.ct(d.ct) || { gd:[] }, g = ct.gd[b.gd] || {}, daDat = (d.congDat||[]).indexOf(b.gd) >= 0;
    var cuoiGD = !d.lich.some(function(x){ return x.gd===b.gd && x.so > b.so; });
    return '<div class="card pad-sm" style="border-color:var(--gita)"><b class="sm">Ghi kết quả buổi '+b.so+' — '+h(d.tenNha)+'</b>'+
      '<p class="tiny muted" style="margin:2px 0 10px">Các ô dưới đây không bắt buộc. Chỉ ghi điều gia đình thực sự nói ra trong buổi.</p>'+
      '<div class="co-form">'+
      '<div class="co-f"><span>Cảm xúc của nhà (1–5)</span>'+muc('dp-mo-cx', mo.cx)+'</div>'+
      '<div class="co-f"><span>Nhà chấm buổi (1–5)</span>'+muc('dp-mo-cb', mo.cb)+'</div>'+
      CO.o2('Ghi chú buổi', '<input class="inp" id="dp-mo-ghi" maxlength="300" value="'+h(mo.ghi||'')+'" placeholder="Điều đã chạy, điều vướng…">')+'</div>'+
      (daDat ? '<p class="tiny muted mt">✓ Cổng giai đoạn «'+h(g.ten||'')+'» đã đạt trước đó.</p>'
             : '<label class="co-hang sm mt" style="gap:8px;flex-wrap:nowrap;align-items:flex-start"><input type="checkbox" id="dp-mo-cong"'+(mo.cong?' checked':'')+'><span>Cổng nghiệm thu giai đoạn «'+h(g.ten||'')+'» đạt'+
               (g.cong ? ': <i>'+h(g.cong)+'</i>' : '')+(cuoiGD ? '' : ' <span class="tiny muted">(chưa phải buổi cuối giai đoạn)</span>')+'</span></label>')+
      '<div class="co-hang mt"><button class="btn pri sm" data-co="dp-luu-xong">'+ic('check','w-3 h-3')+'Lưu: có mặt</button>'+
      '<button class="btn ghost sm" data-co="dp-dong">Đóng</button></div></div>';
  }
  function oDoi(d, b, mo){
    return '<div class="card pad-sm" style="border-color:var(--gita)"><b class="sm">Dời buổi '+b.so+' — '+h(d.tenNha)+' (đang hẹn '+h(CO.ngayVN(b.ngay))+')</b>'+
      '<div class="co-form mt">'+CO.o2('Ngày mới', '<input type="date" class="inp" id="dp-doi-ngay" min="'+h(CO.homNay())+'" value="'+h(mo.ngay||'')+'">')+
      CO.o2('Lý do dời', '<input class="inp" id="dp-doi-ly" maxlength="200" value="'+h(mo.ly||'')+'" placeholder="Ví dụ: con thi học kỳ">')+'</div>'+
      '<div class="co-hang mt"><button class="btn pri sm" data-co="dp-luu-doi">'+ic('calendar','w-3 h-3')+'Lưu dời lịch</button>'+
      '<button class="btn ghost sm" data-co="dp-dong">Đóng</button></div></div>';
  }

  /* ═════════ NHÀ ═════════ */
  function chonNha(){
    var ds = dsThay(), id = st().dpNha;
    var d = ds.filter(function(x){ return x.id===id; })[0];
    return d || ds.filter(function(x){ return x.tt==='dang'; })[0] || ds[0] || null;
  }
  function bieuDoTuan(d){
    var hn = CO.homNay(), ev = CO.hdCua(d.nha, d.id).filter(function(e){ return CO.hd(e.loai).ai==='nha'; });
    var tuan = [];
    for(var i=7;i>=0;i--){
      var den = CO.cong(hn, -7*i), tu = CO.cong(den, -6);
      tuan.push({ tu:tu, den:den, n:ev.filter(function(e){ var s = d2s(e.t); return s >= tu && s <= den; }).length });
    }
    var max = Math.max.apply(null, tuan.map(function(t){ return t.n; }).concat([1]));
    var W = 320, H = 150, bw = 26, gap = (W - 8*bw)/8, top = 18, day = H - 30;
    var s = '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Số hoạt động của nhà mỗi tuần, 8 tuần gần nhất" style="width:100%;height:auto;max-width:520px;color:var(--gita);display:block">';
    s += '<line x1="0" x2="'+W+'" y1="'+day+'" y2="'+day+'" style="stroke:var(--line)"/>';
    tuan.forEach(function(t, i){
      var x = gap/2 + i*(bw+gap), hh = Math.round((day-top) * t.n / max), y = day - hh;
      s += '<rect x="'+x.toFixed(1)+'" y="'+y+'" width="'+bw+'" height="'+Math.max(hh, t.n?2:0)+'" rx="4" fill="currentColor" opacity="'+(i===7?1:0.6)+'"><title>'+h(CO.ngayVN(t.tu)+'–'+CO.ngayVN(t.den)+': '+t.n+' hoạt động')+'</title></rect>';
      s += '<text x="'+(x+bw/2).toFixed(1)+'" y="'+(y-5)+'" text-anchor="middle" font-size="11" font-weight="700" style="fill:var(--ink-2)">'+t.n+'</text>';
      s += '<text x="'+(x+bw/2).toFixed(1)+'" y="'+(H-10)+'" text-anchor="middle" font-size="9.5" style="fill:var(--ink-4)">'+h(CO.ngayVN(t.tu))+'</text>';
    });
    return s+'</svg>';
  }
  function congThuc(c){
    var W = G.CO_TRONGSO || {}, tu = [], mau = [];
    var chiTiet = {
      thamGia: c.coMat+'/'+(c.coMat+c.vang)+' buổi',
      nhiemVu: c.xong+'/'+c.giao+' nhiệm vụ',
      minhChung: c.minhChung+' MC / '+c.xong+' việc xong',
      nhipDeu: c.ngayHD14+'/'+Math.min(14, Math.max(1, c.ngayThu))+' ngày',
      haiLong: c.haiLong==null ? 'chưa có lần chấm' : 'TB '+so1(c.haiLong)+'/5'
    };
    var o = '<div class="co-ds">';
    Object.keys(W).forEach(function(k){
      var v = c.p[k], m = PHAN[k] || { ten:k, cach:'' };
      if(v!=null){ tu.push(W[k]+'×'+Math.round(100*v)+'%'); mau.push(W[k]); }
      o += '<div><div class="co-hang sm" style="gap:6px"><span class="co-grow"><b>'+h(m.ten)+'</b> <span class="tiny muted">trọng số '+W[k]+'</span></span>'+
        '<span class="tiny muted">'+h(chiTiet[k]||'')+'</span><b class="co-so" style="min-width:40px;text-align:right">'+CO.pt(v)+'</b></div>'+
        vach(v, v==null ? 'var(--ink-4)' : 'var(--gita)')+'<div class="tiny muted" style="margin-top:2px">'+h(m.cach)+(v==null?' — chưa có dữ liệu: phần này không tính, trọng số chia lại.':'')+'</div></div>';
    });
    o += '</div>';
    o += '<p class="sm mt" style="line-height:1.6"><b>Gắn kết = Σ(trọng số × phần) ÷ Σ trọng số của các phần có dữ liệu.</b><br>'+
      (mau.length ? '<span class="co-so">('+h(tu.join(' + '))+') ÷ '+cong(mau)+' = <b style="color:'+mauGK(c.ganKet)+'">'+c.ganKet+'</b>/100</span>'
                  : 'Chưa phần nào có dữ liệu nên chưa tính điểm.')+'</p>'+
      '<p class="tiny muted">Ngưỡng điểm: từ 70 xanh · 45–69 vàng · dưới 45 đỏ. Đèn còn xét cảnh báo (im lặng, vắng liền, sự cố, cảm xúc thấp…).</p>';
    return o;
  }
  function dongThoiGian(d){
    var ev = CO.hdCua(d.nha, d.id).slice().reverse(), n = st().dpTlN || 40, ngay = '', o = '';
    if(!ev.length) return '<p class="sm muted">Chưa có hoạt động nào được ghi.</p>';
    o += '<div class="co-ds">';
    ev.slice(0, n).forEach(function(e){
      var s = d2s(e.t), t = CO.hd(e.loai), gt = giaTri(e);
      if(s !== ngay){ ngay = s; o += '<div class="tiny muted mt" style="font-weight:700;letter-spacing:.04em">'+h(thuNgay(s).toUpperCase())+'</div>'; }
      o += '<div class="co-dong" style="padding:8px 10px;flex-wrap:nowrap;align-items:flex-start"><span style="color:'+(t.ai==='nha'?'var(--gita)':'var(--ink-3)')+';flex:none">'+ic(t.ic,'w-4 h-4')+'</span>'+
        '<span class="co-grow sm"><b>'+h(t.ten)+'</b>'+(gt ? ' · <span class="co-so">'+h(gt)+'</span>' : '')+
        (e.ghi ? '<div class="tiny muted">'+h(e.ghi)+'</div>' : '')+
        '<div class="tiny muted">'+h(CO.gioVN(e.t).slice(-5))+' · '+h(nguoiGhi(e))+'</div></span>'+nguonThe(e)+'</div>';
    });
    o += '</div>';
    if(ev.length > n) o += '<button class="btn ghost sm mt" data-co="dp-tl-them">Xem thêm ('+(ev.length-n)+' hoạt động cũ hơn)</button>';
    return o;
  }
  function tabNha(){
    var d = chonNha(), o = '';
    if(!d) return trong('Chưa có nhà nào được ghép chương trình', '', nutGhep());
    var c = CO.chiSo(d), ct = CO.ct(d.ct) || { gd:[], ten:d.ct }, hn = CO.homNay();
    o += CO.o2('Chọn nhà', CO.chon('dp-nha', dsThay().map(function(x){ return [x.id, x.tenNha+' — '+tenCT(x)+(x.tt!=='dang' ? ' ('+(TT_DK[x.tt]||x.tt)+')' : '')]; }), d.id, ' data-co-ch="dp-chon-nha"'));
    o += '<div class="co-the nhan mt" style="--c:'+h(ct.c||'var(--gita)')+'"><div class="co-hang"><h3 class="co-grow">'+h(d.tenNha)+CO.nhanMau(d)+'</h3>'+CO.den(c.den)+'</div>'+
      '<div class="co-meta"><span>'+h(d.nha)+'</span><span>· '+h(ct.ten)+'</span><span>· Coach '+h(CO.tenCoach(d.coach))+'</span><span>· bắt đầu '+h(CO.ngayVN(d.batDau))+'</span>'+
      '<span>· '+h(TT_DK[d.tt]||d.tt)+'</span><span>· ngày '+Math.min(c.ngayThu, c.tongNgay)+'/'+c.tongNgay+'</span></div>'+vach(c.tienDo, ct.c||'var(--gita)')+
      (c.canhBao.length ? '<div class="co-cb">'+c.canhBao.map(function(x){ return '<div style="--m:'+(x.m==='do'?CO.MAU_DEN.DO:CO.MAU_DEN.VANG)+'">'+h(x.t)+'</div>'; }).join('')+'</div>' : '')+'</div>';

    o += '<div class="grid mt mb" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr))">'+
      U.stat({ k:'Gắn kết', v:c.ganKet==null?'—':c.ganKet+'/100', d:c.ganKet==null?'chưa đủ dữ liệu':'5 phần có trọng số', c:c.ganKet==null?null:mauGK(c.ganKet) })+
      U.stat({ k:'Tham gia buổi', v:CO.pt(c.p.thamGia), d:c.coMat+' có mặt · '+c.vang+' vắng · '+c.chuaGhi+' chưa ghi' })+
      U.stat({ k:'Nhiệm vụ xong', v:c.xong+'/'+c.giao, d:'đúng hạn '+phan(c.dungHan, c.xong)+' · '+c.quaHan.length+' quá hạn' })+
      U.stat({ k:'Im lặng', v:c.imLang+' ngày', d:c.ngayHD14+' ngày có hoạt động / 14', c:c.imLang>=7?CO.MAU_DEN.DO:c.imLang>=4?CO.MAU_DEN.VANG:null })+
      U.stat({ k:'Minh chứng', v:String(c.minhChung), d:'trên '+c.xong+' việc xong' })+
      U.stat({ k:'Cảm xúc (3 lần gần)', v:c.camXuc==null?'—':so1(c.camXuc)+'/5', d:c.camXuc==null?'chưa có lần báo':'trung bình', c:c.camXuc!=null&&c.camXuc<=2?CO.MAU_DEN.DO:null })+
      U.stat({ k:'Hài lòng (5 lần gần)', v:c.haiLong==null?'—':so1(c.haiLong)+'/5', d:c.haiLong==null?'chưa có lần chấm':'nhà chấm buổi' })+
      U.stat({ k:'Hoạt động', v:String(c.soHD), d:c.soHDNha+' do nhà làm · '+c.suCo+' sự cố mở', c:c.suCo?CO.MAU_DEN.DO:null })+'</div>';

    /* Giai đoạn */
    o += U.sec('Tiến độ giai đoạn', 'Ngày tính từ ngày bắt đầu · cổng nghiệm thu do Coach xác nhận bằng bằng chứng');
    o += '<div class="co-ds mb">'+(ct.gd||[]).map(function(g, i){
      var bu = d.lich.filter(function(b){ return b.gd===i; }), bx = bu.filter(function(b){ return b.tt==='xong'; }).length;
      var dat = (d.congDat||[]).indexOf(i) >= 0, nay = i===c.gdNay && d.tt==='dang';
      var tu = CO.cong(d.batDau, g.tu-1), den = CO.cong(d.batDau, (g.den||g.tu)-1);
      return '<div class="co-dong"'+(nay?' style="border-color:var(--gita)"':'')+'><span class="co-grow" style="min-width:200px"><b class="sm">'+(i+1)+'. '+h(g.ten)+'</b>'+(nay?' '+the('đang ở đây','var(--gita)'):'')+
        '<div class="tiny muted">'+h(CO.ngayVN(tu))+' – '+h(CO.ngayVN(den))+' · buổi '+bx+'/'+bu.length+' · cổng: '+h(g.cong||'—')+'</div>'+vach(bu.length ? bx/bu.length : 0, ct.c||'var(--gita)')+'</span>'+
        (dat ? the('cổng đạt', CO.MAU_DEN.XANH) : (tu <= hn ? '<button class="btn ghost sm" data-co="dp-cong" data-dk="'+h(d.id)+'" data-gd="'+i+'">'+ic('shield','w-3 h-3')+'Xác nhận đạt cổng</button>' : '<span class="tiny muted">chưa tới</span>'))+'</div>';
    }).join('')+'</div>';

    /* Biểu đồ + công thức */
    o += '<div class="grid g2 mb"><div class="card pad-sm"><b class="sm">Hoạt động của nhà theo tuần</b>'+
      '<p class="tiny muted" style="margin:2px 0 8px">8 tuần gần nhất; mỗi cột là 7 ngày bắt đầu từ ngày ghi dưới cột, cột cuối kết thúc hôm nay. Chỉ đếm hoạt động do gia đình làm.</p>'+bieuDoTuan(d)+'</div>'+
      '<div class="card pad-sm"><b class="sm">Điểm gắn kết được tính thế nào</b><div class="mt">'+congThuc(c)+'</div></div></div>';

    /* Nhiệm vụ đang mở */
    var mo = nvMo(d);
    o += U.sec('Nhiệm vụ đang mở', mo.length ? mo.length+' việc — đánh dấu xong khi có bằng chứng' : 'Không có nhiệm vụ nào đang mở');
    if(mo.length) o += '<div class="co-ds mb">'+mo.map(function(e){
      var qua = e.han && e.han < hn;
      return '<div class="co-dong"><span class="co-grow sm" style="min-width:180px"><b>'+h(e.ghi||e.ma)+'</b><div class="tiny muted">'+h(e.ma)+' · giao '+h(CO.ngayVN(d2s(e.t)))+' · '+(e.han ? 'hạn '+h(CO.ngayVN(e.han)) : 'không hạn')+'</div></span>'+
        (qua ? the('quá hạn '+CO.cach(e.han, hn)+' ngày', CO.MAU_DEN.DO) : '')+
        '<span class="co-hang" style="gap:6px"><button class="btn sm" data-co="dp-nv-xong" data-dk="'+h(d.id)+'" data-ma="'+h(e.ma)+'">'+ic('check','w-3 h-3')+'Đánh dấu xong</button>'+
        '<button class="btn ghost sm" data-co="dp-nv-mc" data-dk="'+h(d.id)+'" data-ma="'+h(e.ma)+'">'+ic('eye','w-3 h-3')+'Minh chứng</button></span></div>';
    }).join('')+'</div>';

    /* Ghi nhanh */
    o += U.sec('Ghi nhanh', 'Loại không cần giá trị được ghi ngay với giờ hiện tại; loại cần giá trị mở biểu mẫu Ghi hoạt động');
    o += [['nha','Gia đình làm'],['coach','Coach làm']].map(function(n){
      return '<div class="tiny muted" style="font-weight:700;margin:4px 0">'+h(n[1].toUpperCase())+'</div><div class="co-hang mb" style="gap:6px">'+
        (G.CO_HD||[]).filter(function(t){ return t.ai===n[0]; }).map(function(t){
          return '<button class="btn ghost sm" data-co="dp-nhanh" data-dk="'+h(d.id)+'" data-loai="'+h(t.ma)+'">'+ic(t.ic,'w-3 h-3')+h(t.ten)+'</button>';
        }).join('')+'</div>';
    }).join('');

    /* Dòng thời gian */
    o += U.sec('Dòng thời gian hoạt động', 'Mới nhất trước · mỗi dòng là một hoạt động có giờ, người ghi và nguồn (sổ · máy chủ · minh hoạ)');
    o += '<div class="mb">'+dongThoiGian(d)+'</div>';

    /* Điều khiển lượt ghép + máy chủ */
    o += U.sec('Điều khiển lượt ghép', 'Trạng thái hiện tại: '+(TT_DK[d.tt]||d.tt));
    var nut = [];
    if(d.tt==='dang') nut.push('<button class="btn ghost sm" data-co="dp-tt" data-tt="dung" data-dk="'+h(d.id)+'">Tạm dừng</button>');
    if(d.tt==='dung') nut.push('<button class="btn sm" data-co="dp-tt" data-tt="dang" data-dk="'+h(d.id)+'">Tiếp tục</button>');
    if(d.tt==='dang' || d.tt==='dung') nut.push('<button class="btn ghost sm" data-co="dp-tt" data-tt="xong" data-dk="'+h(d.id)+'">Kết thúc chương trình</button>');
    if(d.tt==='xong' || d.tt==='huy') nut.push('<button class="btn ghost sm" data-co="dp-tt" data-tt="dang" data-dk="'+h(d.id)+'">Mở lại</button>');
    if(d.tt!=='huy') nut.push(st().dpHuy===d.id
      ? '<button class="btn sm" style="background:'+CO.MAU_DEN.DO+';border-color:'+CO.MAU_DEN.DO+';color:#fff" data-co="dp-tt" data-tt="huy" data-dk="'+h(d.id)+'">Xác nhận huỷ lượt ghép</button><button class="btn ghost sm" data-co="dp-huy-bo">Không huỷ</button>'
      : '<button class="btn ghost sm" data-co="dp-huy" data-dk="'+h(d.id)+'">Huỷ lượt ghép</button>');
    if(CO.coMayChu()) nut.push('<button class="btn ghost sm" data-co="dp-keo" data-dk="'+h(d.id)+'">'+ic('orbit','w-3 h-3')+'Kéo sổ chạm từ máy chủ</button>');
    o += '<div class="co-hang mb" style="gap:6px">'+nut.join('')+'</div>';
    o += '<p class="tiny muted">Huỷ không xoá nhật ký — lượt ghép được giữ để đối chiếu, chỉ rời khỏi bảng giám sát. '+
      (CO.coMayChu() ? 'Lượt chạm kéo về gắn nhãn "máy chủ", không trùng dòng đã có.' : 'Chưa nối máy chủ — sổ chạm chỉ ở sổ trên máy này.')+'</p>';
    return o;
  }

  /* ═════════ GHI HOẠT ĐỘNG ═════════ */
  function nhap(){ var s = st(); if(!s.dpGhi || typeof s.dpGhi!=='object') s.dpGhi = {}; return s.dpGhi; }
  /* Đọc mọi ô đang có trên màn vào bản nháp trước khi vẽ lại (vẽ lại xoá ô). */
  function chupGhi(){
    var g = nhap();
    [['dk','dp-g-dk'],['loai','dp-g-loai'],['kieu','dp-g-kieu'],['ten','dp-g-ten'],['han','dp-g-han'],['nvMa','dp-g-nv'],['diem','dp-g-diem'],
     ['cd','dp-g-cd'],['t','dp-g-t'],['ghi','dp-g-ghi'],['canCu','dp-g-cancu']].forEach(function(p){ if(document.getElementById(p[1])) g[p[0]] = CO.o(p[1]); });
    if(document.getElementById('dp-g-cham')) g.cham = CO.o('dp-g-cham');
    return g;
  }
  function dsGhiDuoc(){ return dsThay().filter(function(d){ return d.tt!=='huy'; }); }
  function tabGhi(){
    var g = nhap(), ds = dsGhiDuoc(), o = '';
    if(!ds.length) return trong('Chưa có lượt ghép nào để ghi hoạt động', 'Ghép chương trình cho một nhà trước, rồi ghi từng hoạt động ở đây.', nutGhep());
    var d = ds.filter(function(x){ return x.id===g.dk; })[0] || ds[0];
    var loai = g.loai || 'tick_nhip', t = CO.hd(loai), ct = CO.ct(d.ct) || { gd:[] };
    var o2 = '';
    if(t.gt==='1-5') o2 = '<div class="co-f"><span>Giá trị (1–5)</span>'+muc('dp-g-muc', g.gt)+'</div>';
    else if(t.gt==='kieu') o2 = CO.o2('Kiểu chạm', CO.chon('dp-g-kieu', [['','— chọn —']].concat(Object.keys(KIEU).map(function(k){ return [k, KIEU[k]]; })), g.kieu||''));
    else if(loai==='nv_giao') o2 = CO.o2('Tên nhiệm vụ (có tiêu chí xong)', '<input class="inp" id="dp-g-ten" maxlength="160" value="'+h(g.ten||'')+'" placeholder="Ví dụ: Hai phiên 25–5 mỗi ngày">')+
      CO.o2('Hạn', '<input type="date" class="inp" id="dp-g-han" value="'+h(g.han||'')+'">');
    else if(loai==='nv_xong'){
      var mo = nvMo(d);
      o2 = mo.length ? CO.o2('Nhiệm vụ đã xong', CO.chon('dp-g-nv', [['','— chọn —']].concat(mo.map(function(e){ return [e.ma, e.ma+' · '+(e.ghi||'')+(e.han?' (hạn '+CO.ngayVN(e.han)+')':'')]; })), g.nvMa||''))
        : '<p class="sm muted" style="align-self:end">Nhà này không có nhiệm vụ nào đang mở.</p>';
    }
    else if(loai==='minh_chung'){
      var tc = nvTatCa(d);
      o2 = CO.o2('Gắn với nhiệm vụ (không bắt buộc)', CO.chon('dp-g-nv', [['','— không gắn —']].concat(tc.map(function(e){ return [e.ma, e.ma+' · '+(e.ghi||'')]; })), g.nvMa||''));
    }
    else if(t.gt==='diem') o2 = CO.o2('Điểm bài test (0–100)', '<input type="number" class="inp" id="dp-g-diem" min="0" max="100" step="1" value="'+h(g.diem||'')+'">');
    else if(loai==='cong_dat'){
      var con = (ct.gd||[]).map(function(x, i){ return [String(i), (i+1)+'. '+x.ten+' — '+(x.cong||'')]; }).filter(function(x){ return (d.congDat||[]).indexOf(Number(x[0])) < 0; });
      o2 = con.length ? CO.o2('Cổng giai đoạn', CO.chon('dp-g-cd', [['','— chọn —']].concat(con), g.cd||'')) : '<p class="sm muted" style="align-self:end">Mọi cổng của chương trình này đã đạt.</p>';
    }
    else o2 = '<p class="tiny muted" style="align-self:end">Loại này không cần giá trị — chỉ ghi thời điểm và ghi chú.</p>';

    o += '<div class="card pad-sm mb"><div class="co-form">'+
      CO.o2('Nhà', CO.chon('dp-g-dk', ds.map(function(x){ return [x.id, x.tenNha+' — '+tenCT(x)]; }), d.id, ' data-co-ch="dp-g-doi"'))+
      CO.o2('Loại hoạt động', '<select class="inp" id="dp-g-loai" data-co-ch="dp-g-doi">'+
        [['nha','Gia đình làm'],['coach','Coach làm']].map(function(n){
          return '<optgroup label="'+n[1]+'">'+(G.CO_HD||[]).filter(function(x){ return x.ai===n[0]; }).map(function(x){
            return '<option value="'+h(x.ma)+'"'+(x.ma===loai?' selected':'')+'>'+h(x.ten)+'</option>'; }).join('')+'</optgroup>';
        }).join('')+'</select>')+
      o2+
      CO.o2('Thời điểm', '<input type="datetime-local" class="inp" id="dp-g-t" max="'+h(dtLocal(Date.now()))+'" value="'+h(g.t||dtLocal(Date.now()))+'">')+'</div>'+
      '<div class="mt">'+CO.o2(loai==='lien_he' ? 'Nội dung lượt chạm / ghi chú' : 'Ghi chú', '<textarea class="inp" id="dp-g-ghi" rows="2" maxlength="500" placeholder="Bằng chứng, lời nhà nói, điều quan sát được…">'+h(g.ghi||'')+'</textarea>')+'</div>';
    if(loai==='lien_he'){
      o += '<div class="mt"><label class="co-hang sm" style="gap:8px"><input type="checkbox" id="dp-g-cham"'+(g.cham?' checked':'')+' data-co-ch="dp-g-doi"><span>Ghi lên sổ chạm máy chủ</span></label>'+
        (g.cham ? '<div class="mt">'+CO.o2('Căn cứ (bắt buộc khi ghi lên máy chủ)', '<input class="inp" id="dp-g-cancu" maxlength="200" value="'+h(g.canCu||'')+'" placeholder="Vì sao chạm lúc này: đèn, nhiệm vụ, lời hẹn…">')+'</div>' : '')+
        '<p class="tiny muted" style="margin-top:4px">'+(CO.coMayChu() ? 'Máy chủ tự gác và có thể từ chối (ví dụ nhà đèn đỏ thì phải gọi, không nhắn) — lời từ chối hiện nguyên văn.' : 'Chưa nối máy chủ — lượt chạm vẫn lưu trong sổ trên máy này, máy chủ sẽ báo lý do không ghi được.')+'</p></div>';
    }
    o += '<div class="co-hang mt"><button class="btn pri" data-co="dp-g-ghi">'+ic('check','w-4 h-4')+'Ghi</button>'+
      '<span class="tiny muted co-grow">'+h(t.ai==='nha' ? 'Hoạt động của gia đình — tính vào im lặng, nhịp đều và gắn kết.' : 'Hoạt động của Coach — vào nhật ký, không tính vào gắn kết.')+'</span></div></div>';

    var u = me(), cua = st().hd.filter(function(e){ return e.ai===u; }).slice(-10).reverse();
    o += U.sec('10 hoạt động tôi ghi gần nhất', 'Theo thứ tự ghi vào sổ, mới nhất trước');
    o += cua.length ? '<div class="co-ds">'+cua.map(function(e){
      var tt = CO.hd(e.loai), gt = giaTri(e);
      return '<div class="co-dong" style="padding:8px 10px;flex-wrap:nowrap;align-items:flex-start"><span style="color:var(--ink-3);flex:none">'+ic(tt.ic,'w-4 h-4')+'</span><span class="co-grow sm"><b>'+h(CO.tenNha(e.nha))+'</b> · '+h(tt.ten)+
        (gt ? ' · <span class="co-so">'+h(gt)+'</span>' : '')+(e.ghi ? '<div class="tiny muted">'+h(e.ghi)+'</div>' : '')+
        (e.mayChu && e.mayChu!=='ok' ? '<div class="tiny" style="color:'+CO.MAU_DEN.DO+'">Máy chủ: '+h(e.mayChu)+'</div>' : '')+
        '<div class="tiny muted">'+h(CO.gioVN(e.t))+'</div></span>'+
        (e.mayChu==='ok' ? the('đã lên máy chủ', CO.MAU_DEN.XANH) : '')+nguonThe(e)+'</div>';
    }).join('')+'</div>' : '<p class="sm muted">Anh/chị chưa ghi hoạt động nào.</p>';
    return o;
  }

  /* ═════════ NHẬT KÝ ═════════ */
  function loc(){ var s = st(); if(!s.dpLoc || typeof s.dpLoc!=='object') s.dpLoc = {}; return s.dpLoc; }
  function locHD(){
    var L = loc();
    return hdThay().filter(function(e){
      if(L.nha && e.nha!==L.nha) return false;
      if(L.loai && e.loai!==L.loai) return false;
      if(L.ai && CO.hd(e.loai).ai!==L.ai) return false;
      if(L.nguon){ var n = e.mau ? 'mau' : e.nguon==='may-chu' ? 'may-chu' : 'so'; if(n!==L.nguon) return false; }
      var s = d2s(e.t);
      if(L.tu && s < L.tu) return false;
      if(L.den && s > L.den) return false;
      return true;
    }).sort(function(a, b){ return b.t - a.t; });
  }
  function tenCTe(e){ var d = e.dk ? CO.dk(e.dk) : null; return d ? tenCT(d) : '—'; }
  function tabNk(){
    var L = loc(), ds = locHD(), N = 50, tong = Math.max(1, Math.ceil(ds.length/N)), trang = Math.max(1, Math.min(st().dpTrang||1, tong)), o = '';
    var nhaDs = {}; hdThay().forEach(function(e){ nhaDs[e.nha] = 1; });
    o += '<div class="card pad-sm mb"><div class="co-form" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">'+
      CO.o2('Nhà', CO.chon('dp-l-nha', [['','Tất cả']].concat(Object.keys(nhaDs).map(function(m){ return [m, CO.tenNha(m)]; })), L.nha||'', ' data-co-ch="dp-loc"'))+
      CO.o2('Loại', CO.chon('dp-l-loai', [['','Tất cả']].concat((G.CO_HD||[]).map(function(x){ return [x.ma, x.ten]; })), L.loai||'', ' data-co-ch="dp-loc"'))+
      CO.o2('Ai làm', CO.chon('dp-l-ai', [['','Cả hai'],['nha','Gia đình'],['coach','Coach']], L.ai||'', ' data-co-ch="dp-loc"'))+
      CO.o2('Nguồn', CO.chon('dp-l-nguon', [['','Tất cả'],['so','Sổ'],['may-chu','Máy chủ'],['mau','Minh hoạ']], L.nguon||'', ' data-co-ch="dp-loc"'))+
      CO.o2('Từ ngày', '<input type="date" class="inp" id="dp-l-tu" value="'+h(L.tu||'')+'" data-co-ch="dp-loc">')+
      CO.o2('Đến ngày', '<input type="date" class="inp" id="dp-l-den" value="'+h(L.den||'')+'" data-co-ch="dp-loc">')+'</div>'+
      '<div class="co-hang mt"><span class="co-grow sm"><b class="co-so">'+ds.length+'</b> hoạt động khớp bộ lọc</span>'+
      '<button class="btn ghost sm" data-co="dp-loc-xoa">Xoá lọc</button>'+
      '<button class="btn sm" data-co="dp-csv"'+(ds.length?'':' disabled')+'>'+ic('share','w-3 h-3')+'Xuất CSV</button></div></div>';
    if(!ds.length) return o + trong('Không có hoạt động nào khớp', 'Nới bộ lọc hoặc ghi hoạt động ở thẻ "Ghi hoạt động".');
    var trangDs = ds.slice((trang-1)*N, trang*N);
    o += '<div class="co-tb"><table><thead><tr><th>Thời gian</th><th>Nhà</th><th>Chương trình</th><th>Loại</th><th>Giá trị</th><th>Ghi chú</th><th>Người ghi</th><th>Nguồn</th></tr></thead><tbody>'+
      trangDs.map(function(e){ var t = CO.hd(e.loai);
        return '<tr><td style="white-space:nowrap" class="co-so">'+h(CO.gioVN(e.t))+'</td><td>'+h(CO.tenNha(e.nha))+'<div class="tiny muted">'+h(e.nha)+'</div></td><td>'+h(tenCTe(e))+'</td>'+
          '<td><span style="display:inline-flex;vertical-align:-2px;margin-right:4px;color:'+(t.ai==='nha'?'var(--gita)':'var(--ink-3)')+'">'+ic(t.ic,'w-3 h-3')+'</span>'+h(t.ten)+'</td><td class="co-so">'+h(giaTri(e))+'</td>'+
          '<td class="sm">'+h(e.ghi||'')+'</td><td>'+h(nguoiGhi(e))+'</td><td>'+nguonThe(e)+'</td></tr>'; }).join('')+'</tbody></table></div>';
    o += '<div class="co-hang mt" style="justify-content:center"><button class="btn ghost sm" data-co="dp-trang" data-n="'+(trang-1)+'"'+(trang<=1?' disabled':'')+'>← Trước</button>'+
      '<span class="sm co-so">Trang '+trang+'/'+tong+' · dòng '+((trang-1)*N+1)+'–'+Math.min(trang*N, ds.length)+'</span><button class="btn ghost sm" data-co="dp-trang" data-n="'+(trang+1)+'"'+(trang>=tong?' disabled':'')+'>Sau →</button></div>';
    return o;
  }

  /* ═════════ CẢNH BÁO ═════════ */
  function viecNen(cb, c){
    var t = cb.t;
    if(/im lặng/i.test(t)) return c.imLang >= 7 ? { t:'Gọi trong 24 giờ, cân nhắc Can thiệp nhanh 14 ngày', ct:1 } : { t:'Nhắn hỏi thăm hôm nay — nghe trước, không nhắc bài' };
    if(/Vắng/.test(t)) return { t:'Gọi cho nhà, hỏi điều đang vướng và dời lịch buổi sau cho vừa', lich:1 };
    if(/quá hạn/.test(t)) return { t:'Soi lại nhiệm vụ: có vừa sức không, tiêu chí xong có rõ không — chẻ nhỏ thay vì giục' };
    if(/Cảm xúc thấp/.test(t)) return { t:'Buổi kết nối trước khi giao việc; chuyển chuyên gia nếu có dấu hiệu nặng' };
    if(/8–12/.test(t)) return { t:'Nhắn nhịp ngắn mỗi ngày, ghi nhận từng việc nhỏ để nhà qua vùng dễ bỏ cuộc' };
    if(/chưa ghi/.test(t)) return { t:'Ghi kết quả các buổi đã qua ngay hôm nay', lich:1 };
    if(/sự cố/i.test(t)) return { t:'Xử lý sự cố, ghi biên bản, rồi ghi "Đóng sự cố"' };
    return { t:'Mở hồ sơ nhà để xem chi tiết' };
  }
  function dsCanhBao(S){
    var a = [];
    S.cs.forEach(function(x){ x.c.canhBao.forEach(function(cb){ a.push({ cb:cb, d:x.d, c:x.c }); }); });
    a.sort(function(x, y){ return (x.cb.m==='do'?0:1) - (y.cb.m==='do'?0:1); });
    return a;
  }
  function tabCb(S){
    var a = dsCanhBao(S);
    if(!a.length) return trong('Không có cảnh báo nào', 'Đã soát '+S.cs.length+' lượt ghép đang chạy: không nhà nào im lặng, vắng liền, quá hạn hay có sự cố.');
    var nDo = a.filter(function(x){ return x.cb.m==='do'; }).length;
    return '<p class="sm muted mb">'+nDo+' cảnh báo đỏ · '+(a.length-nDo)+' cảnh báo vàng. Tính từ lịch buổi và nhật ký — không phải cảm nhận.</p>'+
      '<div class="co-cb">'+a.map(function(x){
        var v = viecNen(x.cb, x.c);
        return '<div style="--m:'+(x.cb.m==='do'?CO.MAU_DEN.DO:CO.MAU_DEN.VANG)+';flex-wrap:wrap"><span class="co-grow" style="min-width:200px"><b>'+h(x.d.tenNha)+'</b>'+CO.nhanMau(x.d)+' — '+h(x.cb.t)+
          '<div class="tiny" style="margin-top:3px"><b>→ Nên làm:</b> '+h(v.t)+'</div></span>'+
          '<span class="co-hang" style="gap:6px">'+(v.ct && moCT() ? '<button class="btn ghost sm" data-v="coach-ct">Can thiệp nhanh</button>' : '')+
          (v.lich ? '<button class="btn ghost sm" data-co="dp-cb-lich">Lịch buổi</button>' : '')+
          '<button class="btn sm" data-co="dp-mo" data-dk="'+h(x.d.id)+'">Mở nhà</button></span></div>';
      }).join('')+'</div>';
  }

  /* ═════════ MÀN ═════════ */
  G.VIEWS[VIEW] = function(){
    var k = CO.cua('pro_coach', 'Điều phối & giám sát chương trình coach'); if(k) return k;
    CO.napMau();
    var S = soLieu(), tab = CO.tab(VIEW, 'tong'), nCb = dsCanhBao(S).length;
    var o = '<div class="mb"><button class="btn ghost sm" data-v="coach-he">← Hệ điều hành Coach</button></div>';
    o += U.ph({ eyebrow:'COACH · ĐIỀU PHỐI & GIÁM SÁT', ic:'pulse', grad:1, t:'Điều phối & giám sát chương trình coach',
      lead:'Đo chính xác từng hoạt động của mỗi gia đình đang trong chương trình: lịch buổi, nhiệm vụ, minh chứng, im lặng, gắn kết, đèn và cảnh báo sớm — mọi con số đọc từ sổ.' });
    o += CO.banMau();
    o += '<div class="grid g4 mb">'+
      U.stat({ k:'Nhà đang tham gia', v:String(S.nha), d:S.cs.length+' lượt ghép đang chạy · '+(CO.laQuanLy()?'toàn đội':'nhà tôi phụ trách') })+
      U.stat({ k:'Tỷ lệ tham gia buổi', v:phan(S.coMat, S.coMat+S.vang), d:S.coMat+' có mặt / '+(S.coMat+S.vang)+' buổi đã ghi' })+
      U.stat({ k:'Nhiệm vụ đúng hạn', v:phan(S.dung, S.xong), d:S.dung+' / '+S.xong+' nhiệm vụ đã xong' })+
      U.stat({ k:'Gắn kết trung bình', v:S.gk==null?'—':S.gk+'/100', d:S.DO+' đỏ · '+S.VANG+' vàng · '+S.XANH+' xanh', c:S.gk==null?null:mauGK(S.gk) })+'</div>';
    o += CO.tabs(VIEW, [['tong','Tổng quan','grid'],['lich','Lịch buổi','calendar'],['nha','Nhà','home'],['ghi','Ghi hoạt động','edit'],['nk','Nhật ký','list'],['cb','Cảnh báo'+(nCb?' ('+nCb+')':''),'alert']], tab);
    if(tab==='lich') o += tabLich();
    else if(tab==='nha') o += tabNha();
    else if(tab==='ghi') o += tabGhi();
    else if(tab==='nk') o += tabNk();
    else if(tab==='cb') o += tabCb(S);
    else o += tabTong(S);
    return o;
  };

  /* ═════════ BẤM ═════════ */
  function veTab(t){ st().tab[VIEW] = t; }
  function dkCua(el){ return thayDK(el.getAttribute('data-dk')); }
  function ok(t){ U.toast(t, 'ok'); }

  CO.on('dp-sap', function(el){ st().dpSap = el.value; CO.luu(); });
  CO.on('dp-mo', function(el){ st().dpNha = el.getAttribute('data-dk'); st().dpTlN = 40; st().dpHuy = null; veTab('nha'); CO.luu(); window.scrollTo(0, 0); });
  CO.on('dp-cua', function(el){ st().dpCua = el.value; st().dpMo = null; CO.luu(); });
  CO.on('dp-cb-lich', function(){ st().dpCua = 'qua'; veTab('lich'); CO.luu(); window.scrollTo(0, 0); });

  /* Lịch buổi */
  CO.on('dp-xong', function(el){ st().dpMo = { k:'xong', dk:el.getAttribute('data-dk'), so:Number(el.getAttribute('data-so')) }; CO.luu(); });
  CO.on('dp-doi', function(el){ st().dpMo = { k:'doi', dk:el.getAttribute('data-dk'), so:Number(el.getAttribute('data-so')) }; CO.luu(); });
  CO.on('dp-dong', function(){ st().dpMo = null; CO.luu(); });
  function chupMo(){ var m = st().dpMo; if(!m) return null;
    if(document.getElementById('dp-mo-ghi')) m.ghi = CO.o('dp-mo-ghi');
    if(document.getElementById('dp-mo-cong')) m.cong = CO.o('dp-mo-cong');
    if(document.getElementById('dp-doi-ngay')) m.ngay = CO.o('dp-doi-ngay');
    if(document.getElementById('dp-doi-ly')) m.ly = CO.o('dp-doi-ly');
    return m; }
  CO.on('dp-mo-cx', function(el){ var m = chupMo(); if(!m) return; var n = Number(el.getAttribute('data-n')); m.cx = m.cx===n ? null : n; CO.luu(); });
  CO.on('dp-mo-cb', function(el){ var m = chupMo(); if(!m) return; var n = Number(el.getAttribute('data-n')); m.cb = m.cb===n ? null : n; CO.luu(); });
  CO.on('dp-vang', function(el){
    var d = dkCua(el), so = Number(el.getAttribute('data-so')); if(!d) return;
    var b = d.lich.filter(function(x){ return x.so===so; })[0];
    if(!b || b.ngay > CO.homNay()){ U.toast('Buổi chưa tới ngày — chưa thể ghi vắng.', 'err'); return; }
    st().dpMo = null; CO.danhDauBuoi(d.id, so, 'vang'); ok('Đã ghi: '+d.tenNha+' vắng buổi '+so+'.');
  });
  CO.on('dp-luu-xong', function(){
    var m = chupMo(); if(!m) return;
    var d = thayDK(m.dk); if(!d){ U.toast('Không tìm thấy lượt ghép.', 'err'); return; }
    var b = d.lich.filter(function(x){ return x.so===m.so; })[0];
    if(!b || b.ngay > CO.homNay()){ U.toast('Buổi chưa tới ngày — chưa thể ghi có mặt.', 'err'); return; }
    var luc = Date.now();
    if(m.cx) CO.ghi({ nha:d.nha, dk:d.id, loai:'cam_xuc', gt:String(m.cx), ghi:'Báo trong buổi '+m.so, t:luc }, false);
    if(m.cb) CO.ghi({ nha:d.nha, dk:d.id, loai:'phan_hoi', gt:String(m.cb), ghi:'Chấm buổi '+m.so, t:luc }, false);
    var datCong = false;
    if(m.cong){
      d.congDat = d.congDat || [];
      if(d.congDat.indexOf(b.gd) < 0){ d.congDat.push(b.gd); datCong = true; CO.ghi({ nha:d.nha, dk:d.id, loai:'cong_dat', gt:String(b.gd), ghi:'Đạt cổng: '+tenGD(d, b.gd)+' (buổi '+m.so+')', t:luc }, false); }
    }
    var so = m.so, cx = m.cx, cb = m.cb;
    st().dpMo = null;
    CO.danhDauBuoi(d.id, so, 'xong', m.ghi || '');
    ok('Đã lưu buổi '+so+' của '+d.tenNha+': có mặt'+(cx?' · cảm xúc '+cx+'/5':'')+(cb?' · chấm '+cb+'/5':'')+(datCong?' · đạt cổng':'')+'.');
  });
  CO.on('dp-luu-doi', function(){
    var m = chupMo(); if(!m) return;
    var d = thayDK(m.dk); if(!d) return;
    var b = d.lich.filter(function(x){ return x.so===m.so; })[0]; if(!b) return;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(m.ngay||'')){ U.toast('Chọn ngày mới cho buổi.', 'err'); return; }
    if(m.ngay < CO.homNay()){ U.toast('Ngày mới không được ở quá khứ.', 'err'); return; }
    if(m.ngay === b.ngay){ U.toast('Ngày mới trùng ngày đang hẹn.', 'err'); return; }
    var cu = b.ngay, so = m.so, moi = m.ngay;
    if(!b.doiTu) b.doiTu = cu;
    b.ngay = moi;
    st().dpMo = null;
    CO.danhDauBuoi(d.id, so, 'cho', 'dời từ '+CO.ngayVN(cu)+' sang '+CO.ngayVN(moi)+(m.ly ? ' — '+m.ly : ''));
    ok('Đã dời buổi '+so+' của '+d.tenNha+' sang '+CO.ngayVN(moi)+'.');
  });

  /* Nhà */
  CO.on('dp-chon-nha', function(el){ st().dpNha = el.value; st().dpTlN = 40; st().dpHuy = null; CO.luu(); });
  CO.on('dp-tl-them', function(){ st().dpTlN = (st().dpTlN || 40) + 60; CO.luu(); });
  CO.on('dp-cong', function(el){
    var d = dkCua(el), gd = Number(el.getAttribute('data-gd')); if(!d) return;
    d.congDat = d.congDat || [];
    if(d.congDat.indexOf(gd) >= 0) return;
    d.congDat.push(gd);
    CO.ghi({ nha:d.nha, dk:d.id, loai:'cong_dat', gt:String(gd), ghi:'Đạt cổng: '+tenGD(d, gd) });
    ok('Đã xác nhận đạt cổng giai đoạn '+(gd+1)+'.');
  });
  CO.on('dp-nv-xong', function(el){
    var d = dkCua(el), ma = el.getAttribute('data-ma'); if(!d) return;
    if(!nvMo(d).some(function(e){ return e.ma===ma; })){ U.toast('Nhiệm vụ này đã được đánh dấu xong.', 'err'); return; }
    var g = nvGiao(d.nha, ma);
    CO.ghi({ nha:d.nha, dk:d.id, loai:'nv_xong', ma:ma, ghi:'Xong: '+((g && g.ghi) || ma) });
    ok('Đã đánh dấu xong '+ma+'.');
  });
  CO.on('dp-nv-mc', function(el){
    var d = dkCua(el), ma = el.getAttribute('data-ma'); if(!d) return;
    var g = nvGiao(d.nha, ma);
    CO.ghi({ nha:d.nha, dk:d.id, loai:'minh_chung', ma:ma, ghi:'Minh chứng cho '+((g && g.ghi) || ma) });
    ok('Đã ghi minh chứng cho '+ma+'.');
  });
  CO.on('dp-nhanh', function(el){
    var d = dkCua(el), loai = el.getAttribute('data-loai'); if(!d) return;
    var t = CO.hd(loai);
    if(t.gt || loai==='cong_dat' || loai==='minh_chung'){
      var g = nhap(); g.dk = d.id; g.loai = loai; g.gt = null; g.t = ''; g.nvMa = ''; g.cd = ''; g.kieu = ''; g.cham = false;
      veTab('ghi'); CO.luu(); window.scrollTo(0, 0); return;
    }
    if(loai==='su_co_dong' && !CO.chiSo(d).suCo){ U.toast('Nhà này không có sự cố nào đang mở.', 'err'); return; }
    CO.ghi({ nha:d.nha, dk:d.id, loai:loai });
    ok('Đã ghi "'+t.ten+'" cho '+d.tenNha+' lúc '+CO.gioVN(Date.now()).slice(-5)+'.');
  });
  CO.on('dp-huy', function(el){ st().dpHuy = el.getAttribute('data-dk'); CO.luu(); });
  CO.on('dp-huy-bo', function(){ st().dpHuy = null; CO.luu(); });
  CO.on('dp-tt', function(el){
    var d = dkCua(el), tt = el.getAttribute('data-tt'); if(!d || !TT_DK[tt] || d.tt===tt) return;
    if(tt==='huy' && st().dpHuy!==d.id) return;
    var cu = d.tt; d.tt = tt; st().dpHuy = null; st().dpNha = d.id;
    CO.ghi({ nha:d.nha, dk:d.id, loai:'ghi_chu', ghi:'Lượt ghép: '+(TT_DK[cu]||cu)+' → '+TT_DK[tt] }, false);
    CO.luu();
    ok('Đã chuyển lượt ghép sang "'+TT_DK[tt]+'".');
  });
  CO.on('dp-keo', function(el){
    var d = dkCua(el); if(!d) return;
    el.disabled = true;
    CO.keoSoCham(d.nha, d.id).then(function(r){
      if(r && r.ok) U.toast('Đã kéo '+r.them+' lượt chạm mới (máy chủ có '+r.so+' lượt cho nhà này).', 'ok');
      else { el.disabled = false; U.toast((r && r.error) || 'Máy chủ không trả lời.', 'err'); }
    }, function(e){ el.disabled = false; U.toast('Không gọi được máy chủ: '+((e && e.message) || e), 'err'); });
  });

  /* Ghi hoạt động */
  CO.on('dp-g-doi', function(el){
    var g = chupGhi();
    if(el.id==='dp-g-loai' || el.id==='dp-g-dk'){ g.gt = null; g.nvMa = ''; g.cd = ''; }
    CO.luu();
  });
  CO.on('dp-g-muc', function(el){ var g = chupGhi(), n = Number(el.getAttribute('data-n')); g.gt = g.gt===n ? null : n; CO.luu(); });
  CO.on('dp-g-ghi', function(){
    var g = chupGhi(), ds = dsGhiDuoc();
    var d = ds.filter(function(x){ return x.id===g.dk; })[0] || ds[0];
    if(!d){ U.toast('Chọn nhà.', 'err'); return; }
    var loai = g.loai || 'tick_nhip', t = CO.hd(loai);
    var luc = g.t ? new Date(g.t).getTime() : Date.now();
    if(!luc || isNaN(luc)){ U.toast('Thời điểm không hợp lệ.', 'err'); return; }
    if(luc > Date.now() + 60000){ U.toast('Thời điểm không được ở tương lai — chỉ ghi điều đã xảy ra.', 'err'); return; }
    if(d2s(luc) < d.batDau){ U.toast('Thời điểm trước ngày bắt đầu chương trình ('+CO.ngayVN(d.batDau)+').', 'err'); return; }
    var e = { nha:d.nha, dk:d.id, loai:loai, ghi:g.ghi||'', t:luc }, gi = null;
    if(t.gt==='1-5'){ if(!(g.gt>=1 && g.gt<=5)){ U.toast('Chọn giá trị từ 1 đến 5.', 'err'); return; } e.gt = String(g.gt); }
    else if(t.gt==='kieu'){ if(!KIEU[g.kieu]){ U.toast('Chọn kiểu chạm: nhắn, gọi hay wow.', 'err'); return; } e.gt = g.kieu; }
    else if(loai==='nv_giao'){
      if(!g.ten || g.ten.length < 4){ U.toast('Viết tên nhiệm vụ (ít nhất 4 ký tự), có tiêu chí xong.', 'err'); return; }
      if(!/^\d{4}-\d{2}-\d{2}$/.test(g.han||'')){ U.toast('Nhiệm vụ cần có hạn.', 'err'); return; }
      if(g.han < d2s(luc)){ U.toast('Hạn không được trước ngày giao.', 'err'); return; }
      e.ma = 'NV-'+Date.now().toString(36).slice(-5).toUpperCase(); e.han = g.han; e.ghi = g.ten + (g.ghi ? ' — '+g.ghi : '');
    }
    else if(loai==='nv_xong'){
      var mo = nvMo(d).filter(function(x){ return x.ma===g.nvMa; })[0];
      if(!mo){ U.toast('Chọn nhiệm vụ đang mở đã hoàn thành.', 'err'); return; }
      if(luc < mo.t){ U.toast('Thời điểm xong không được trước lúc giao nhiệm vụ.', 'err'); return; }
      e.ma = mo.ma; if(!e.ghi) e.ghi = 'Xong: '+(mo.ghi||mo.ma);
    }
    else if(loai==='minh_chung'){ if(g.nvMa) e.ma = g.nvMa; }
    else if(t.gt==='diem'){
      var dd = Number(g.diem);
      if(g.diem==='' || g.diem==null || isNaN(dd) || dd < 0 || dd > 100){ U.toast('Điểm bài test phải từ 0 đến 100.', 'err'); return; }
      e.gt = String(dd);
    }
    else if(loai==='cong_dat'){
      if(g.cd==='' || g.cd==null){ U.toast('Chọn cổng giai đoạn đã đạt.', 'err'); return; }
      gi = Number(g.cd);
      if((d.congDat||[]).indexOf(gi) >= 0){ U.toast('Cổng này đã đạt trước đó.', 'err'); return; }
      e.gt = String(gi); if(!e.ghi) e.ghi = 'Đạt cổng: '+tenGD(d, gi);
    }
    else if(loai==='su_co_dong' && !CO.chiSo(d).suCo){ U.toast('Nhà này không có sự cố nào đang mở.', 'err'); return; }
    var day = loai==='lien_he' && g.cham, canCu = g.canCu || '';
    if(day){
      if(canCu.length < 4){ U.toast('Ghi lên máy chủ cần căn cứ — vì sao chạm lúc này.', 'err'); return; }
      if(!e.ghi){ U.toast('Ghi lên máy chủ cần nội dung lượt chạm (ô Nội dung).', 'err'); return; }
    }
    if(gi!=null){ d.congDat = d.congDat || []; d.congDat.push(gi); }
    var x = CO.ghi(e, false);
    g.gt = null; g.ten = ''; g.han = ''; g.nvMa = ''; g.diem = ''; g.cd = ''; g.t = ''; g.ghi = ''; g.canCu = ''; g.dk = d.id;
    CO.luu();
    if(!day){ ok('Đã ghi "'+t.ten+'" cho '+d.tenNha+' lúc '+CO.gioVN(luc)+'.'); return; }
    ok('Đã ghi vào sổ — đang gửi lượt chạm lên máy chủ…');
    CO.dayCham(d.nha, e.gt, e.ghi, canCu).then(function(r){
      x.mayChu = (r && r.ok) ? 'ok' : String((r && r.error) || 'từ chối, không nêu lý do');
      CO.luu();
      if(r && r.ok) U.toast('Máy chủ đã ghi lượt chạm'+(r.id ? ' (mã '+r.id+')' : '')+(r.den ? ' · đèn '+(CO.TEN_DEN[r.den]||r.den) : '')+'.', 'ok');
      else U.toast(x.mayChu, 'err');
    }, function(err){
      x.mayChu = 'Không gọi được máy chủ: '+((err && err.message) || err); CO.luu(); U.toast(x.mayChu, 'err');
    });
  });

  /* Nhật ký */
  CO.on('dp-loc', function(){
    var L = loc();
    L.nha = CO.o('dp-l-nha'); L.loai = CO.o('dp-l-loai'); L.ai = CO.o('dp-l-ai'); L.nguon = CO.o('dp-l-nguon');
    var tu = CO.o('dp-l-tu'), den = CO.o('dp-l-den');
    if(tu && den && tu > den){ U.toast('"Từ ngày" phải trước hoặc bằng "Đến ngày".', 'err'); return; }
    L.tu = tu; L.den = den; st().dpTrang = 1; CO.luu();
  });
  CO.on('dp-loc-xoa', function(){ st().dpLoc = {}; st().dpTrang = 1; CO.luu(); });
  CO.on('dp-trang', function(el){ if(el.disabled) return; st().dpTrang = Math.max(1, Number(el.getAttribute('data-n'))||1); CO.luu(); });
  CO.on('dp-csv', function(){
    var ds = locHD(); if(!ds.length){ U.toast('Không có dòng nào để xuất.', 'err'); return; }
    CO.csv('nhat-ky-coach-'+CO.homNay()+'.csv',
      ['Thời gian','Mã nhà','Tên nhà','Chương trình','Loại','Giá trị','Ghi chú','Người ghi','Nguồn'],
      ds.map(function(e){ var x = new Date(e.t);
        return [d2s(e.t)+' '+pad(x.getHours())+':'+pad(x.getMinutes()), e.nha, CO.tenNha(e.nha), tenCTe(e), CO.hd(e.loai).ten, giaTri(e), e.ghi||'', nguoiGhi(e), nguonTen(e)]; }));
    ok('Đã xuất '+ds.length+' dòng nhật ký ra CSV.');
  });
})();
