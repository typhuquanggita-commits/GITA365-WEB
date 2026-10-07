/* ═══════════════════════════════════════════════════════════════
   GITA 365 — HỆ ĐIỀU HÀNH COACH · KIỂM SOÁT & ĐO LƯỜNG CHẤT LƯỢNG (coach-cl)

   Chất lượng coach đo bằng hai nguồn, cùng đọc từ sổ chung (coach-loi.js):

     QUY TRÌNH   phiếu chấm buổi theo 10 tiêu chí 0–4 (G.CO_TC) + 5 lằn
                 ranh đỏ (G.CO_LANRANH) → CQI = CO.cqi(phiếu), băng G.CO_BANG
     KẾT QUẢ     gắn kết, tham gia, đúng hạn, hài lòng của các nhà Coach
                 phụ trách → CO.chiSo(dk)

     Chấm buổi          biểu mẫu chấm (nháp giữ qua vẽ lại, qua tải lại)
     Bảng chất lượng    từng Coach: CQI, xu hướng, tiêu chí yếu, việc sửa
     Kết quả gia đình   số đo nhà + điểm chất lượng tổng hợp 50/30/20
     Hiệu chuẩn         hai người chấm cùng một buổi → độ lệch từng tiêu chí
     Chuẩn & ngưỡng     thang chấm, lằn ranh, băng điểm, nhịp soát 2 phiếu/30 ngày

   Quyền: pro_coach. Quản lý (CO.laQuanLy) chấm mọi Coach và xem cả đội;
   Coach chỉ tự chấm và chỉ thấy phiếu của chính mình.
   Không đụng máy chủ · giấy phép · mã hoá.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic, CO = G.CO;
  var VIEW = 'coach-cl';
  var NGUON = { 'du-truc-tiep':'Dự trực tiếp', 'ghi-am':'Nghe ghi âm', 'soat-ho-so':'Soát hồ sơ', 'tu-cham':'Tự chấm' };
  var TRONG = { cqi:50, gk:30, hl:20 };
  var NHIP_SOAT = 2;   /* mỗi Coach ≥ 2 phiếu chấm trong 30 ngày */

  /* ───────── Tiện ích ───────── */
  function st(){ return CO.st(); }
  function me(){ return CO.toi().u; }
  function cong(a){ return a.reduce(function(s,x){ return s+x; }, 0); }
  function tb(a){ return a.length ? cong(a)/a.length : null; }
  function tron(x){ return x==null ? null : Math.round(x); }
  function so1(x){ return x==null ? '—' : x.toFixed(1).replace('.', ','); }
  function phan(t, m){ return m ? CO.pt(t/m) : '—'; }
  function mauDiem(d){ return d==null ? 'var(--ink-4)' : d>=70 ? CO.MAU_DEN.XANH : d>=55 ? CO.MAU_DEN.VANG : CO.MAU_DEN.DO; }
  function mauMuc(n){ return n==null ? 'var(--gita)' : n>=3 ? CO.MAU_DEN.XANH : n>=2 ? CO.MAU_DEN.VANG : CO.MAU_DEN.DO; }
  function bang(d){ return (G.CO_BANG||[]).filter(function(b){ return (d||0) >= b.tu; })[0] || { ten:'—', den:'VANG' }; }
  function vach(frac, m){
    var p = frac==null ? 0 : Math.max(0, Math.min(100, Math.round(100*frac)));
    return '<div class="co-thanhbar" style="--m:'+m+'" role="img" aria-label="'+p+'%"><i style="width:'+p+'%"></i></div>';
  }
  function the(nhan, mau){ return '<span class="co-tag" style="color:'+mau+';background:color-mix(in srgb,'+mau+' 12%,transparent)">'+h(nhan)+'</span>'; }
  function trong(t, s){ return '<div class="card center" style="padding:28px"><b>'+h(t)+'</b>'+(s?'<p class="sm muted mt" style="max-width:62ch;margin-inline:auto">'+h(s)+'</p>':'')+'</div>'; }
  function tenTC(ma){ var t = (G.CO_TC||[]).filter(function(x){ return x.ma===ma; })[0]; return t ? t.ten : ma; }
  function tenLR(ma){ var t = (G.CO_LANRANH||[]).filter(function(x){ return x.ma===ma; })[0]; return t ? t.ten : ma; }
  function tuNgay(n){ return CO.cong(CO.homNay(), -n); }

  /* Phiếu nhìn được: quản lý thấy hết, Coach chỉ thấy phiếu chấm mình. */
  function dsPhieu(){ var ql = CO.laQuanLy(), u = me(); return st().cl.filter(function(p){ return ql || p.coach===u; }); }
  function moiNhat(a){ return a.slice().sort(function(x, y){ return x.ngay < y.ngay ? 1 : x.ngay > y.ngay ? -1 : y.t - x.t; }); }
  function duocXoa(p){ return CO.laQuanLy() || p.nguoiCham===me(); }
  function duocDongSua(p){ return CO.laQuanLy() || p.coach===me(); }

  /* Trung bình từng tiêu chí trên một tập phiếu → [{ma,ten,tb,n}] */
  function tbTieuChi(ds){
    return (G.CO_TC||[]).map(function(t){
      var a = ds.map(function(p){ return p.diem ? p.diem[t.ma] : null; }).filter(function(v){ return v!=null && v!==''; }).map(Number);
      return { ma:t.ma, ten:t.ten, tb:tb(a), n:a.length };
    });
  }
  function yeuNhat(ds){
    var a = tbTieuChi(ds).filter(function(x){ return x.tb!=null; });
    if(!a.length) return null;
    return a.sort(function(x, y){ return x.tb - y.tb; })[0];
  }
  /* Thống kê một Coach trên tập phiếu đã lọc theo quyền */
  function tkCoach(u, ds){
    var hn = CO.homNay(), m90 = tuNgay(90);
    var p = ds.filter(function(x){ return x.coach===u; }).sort(function(x, y){ return x.ngay < y.ngay ? -1 : x.ngay > y.ngay ? 1 : x.t - y.t; });
    var cq = p.map(function(x){ return CO.cqi(x).diem; });
    var cqOk = cq.filter(function(v){ return v!=null; });
    var p90 = p.filter(function(x){ return x.ngay >= m90; });
    var lr90 = cong(p90.map(function(x){ return (x.lanRanh||[]).length; }));
    var suaMo = p.filter(function(x){ return x.sua && !x.daSua; });
    var quaHan = suaMo.filter(function(x){ return x.hanSua && x.hanSua < hn; });
    var tbCQ = tron(tb(cqOk));
    var den = !p.length ? null : lr90 ? 'DO' : bang(tbCQ).den;
    return { u:u, p:p, n:p.length, cqi:tbCQ, xuHuong:cqOk.slice(-5), yeu:yeuNhat(p), lr:cong(p.map(function(x){ return (x.lanRanh||[]).length; })), lr90:lr90,
      suaMo:suaMo.length, quaHan:quaHan.length, den:den,
      p30:p.filter(function(x){ return x.ngay >= tuNgay(30); }) };
  }
  function dsCoachThay(ds){
    var u = me();
    if(!CO.laQuanLy()) return [u];
    var m = {}, out = [];
    CO.dsCoach().forEach(function(c){ if(!m[c.u]){ m[c.u] = 1; out.push(c.u); } });
    ds.forEach(function(p){ if(p.coach && !m[p.coach]){ m[p.coach] = 1; out.push(p.coach); } });
    CO.dsDK(true).forEach(function(d){ if(d.coach && !m[d.coach]){ m[d.coach] = 1; out.push(d.coach); } });
    return out;
  }
  function spark(vals){
    if(!vals.length) return '<span class="tiny muted">—</span>';
    if(vals.length===1) return '<span class="tiny muted">1 phiếu</span>';
    var W = 76, H = 24, n = vals.length;
    var pts = vals.map(function(v, i){ return [ (4 + i*(W-8)/(n-1)).toFixed(1), (H-3 - (H-6)*v/100).toFixed(1) ]; });
    var cuoi = pts[pts.length-1];
    return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="CQI '+h(vals.join(', '))+'" style="width:'+W+'px;height:'+H+'px;color:var(--gita);vertical-align:middle">'+
      '<line x1="0" x2="'+W+'" y1="'+(H-3-(H-6)*0.7).toFixed(1)+'" y2="'+(H-3-(H-6)*0.7).toFixed(1)+'" style="stroke:var(--line)" stroke-dasharray="2 2"><title>Mốc 70 — đạt chuẩn</title></line>'+
      '<polyline points="'+pts.map(function(p){ return p.join(','); }).join(' ')+'" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>'+
      '<circle cx="'+cuoi[0]+'" cy="'+cuoi[1]+'" r="2.6" fill="currentColor"/></svg>';
  }

  /* ═════════ CHẤM BUỔI ═════════ */
  function nhap(){
    var s = st();
    if(!s.clNhap || typeof s.clNhap!=='object') s.clNhap = {};
    var n = s.clNhap;
    if(!n.diem || typeof n.diem!=='object') n.diem = {};
    if(!Array.isArray(n.lanRanh)) n.lanRanh = [];
    if(!n.ngay) n.ngay = CO.homNay();
    if(!CO.laQuanLy()){ n.coach = me(); n.nguon = 'tu-cham'; }
    else if(!n.nguon) n.nguon = 'du-truc-tiep';
    return n;
  }
  /* Đọc ô đang có trên màn vào nháp trước khi vẽ lại. */
  function chupNhap(){
    var n = nhap();
    [['coach','cl-coach'],['nha','cl-nha'],['ngay','cl-ngay'],['nguon','cl-nguon'],['nx','cl-nx'],['sua','cl-sua'],['hanSua','cl-han']].forEach(function(p){
      if(document.getElementById(p[1])) n[p[0]] = CO.o(p[1]); });
    if(document.getElementById('cl-lr-'+((G.CO_LANRANH||[])[0]||{}).ma)){
      n.lanRanh = (G.CO_LANRANH||[]).filter(function(l){ return CO.o('cl-lr-'+l.ma); }).map(function(l){ return l.ma; });
    }
    if(!CO.laQuanLy()){ n.coach = me(); n.nguon = 'tu-cham'; }
    return n;
  }
  function canSua(q){ return q.lanRanh > 0 || (q.diem!=null && q.diem < 70); }
  function tabCham(){
    var n = nhap(), ql = CO.laQuanLy(), q = CO.cqi(n), soDa = (G.CO_TC||[]).filter(function(t){ return n.diem[t.ma]!=null; }).length, o = '';
    var nhaDs = CO.dsNha();
    o += '<div class="card pad-sm mb"><div class="co-form">';
    if(ql){
      o += CO.o2('Coach được chấm', CO.chon('cl-coach', [['','— chọn Coach —']].concat(CO.dsCoach().map(function(c){ return [c.u, c.ten+' · '+c.vai+(c.u===me()?' (tôi)':'')]; })), n.coach||'', ' data-co-ch="cl-doi"'));
      o += CO.o2('Nguồn chấm', CO.chon('cl-nguon', Object.keys(NGUON).map(function(k){ return [k, NGUON[k]]; }), n.nguon||'du-truc-tiep', ' data-co-ch="cl-doi"'));
    } else {
      o += '<div class="co-f"><span>Coach được chấm</span><div class="sm" style="padding:9px 0"><b>'+h(CO.tenCoach(me()))+'</b> · tự chấm</div></div>';
    }
    o += CO.o2('Nhà của buổi', nhaDs.length ? CO.chon('cl-nha', [['','— chọn nhà —']].concat(nhaDs.map(function(x){ return [x.ma, x.ten+(x.nguon==='may-chu'?' · máy chủ':'')]; })), n.nha||'')
                                            : '<div class="sm muted" style="padding:9px 0">Chưa có nhà nào — ghép chương trình trước.</div>');
    o += CO.o2('Ngày buổi', '<input type="date" class="inp" id="cl-ngay" max="'+h(CO.homNay())+'" value="'+h(n.ngay||'')+'">');
    o += '</div>'+(ql ? '' : '<p class="tiny muted mt">Vai Coach chỉ tự chấm. Phiếu do Trưởng nhóm / Quản lý chấm cho anh/chị sẽ hiện ở "Bảng chất lượng".</p>')+'</div>';

    /* 10 tiêu chí */
    o += U.sec('Mười tiêu chí (0–4)', 'Bấm mức cho từng tiêu chí; bấm lại để bỏ. 4 = chuẩn mẫu · 0 = dấu hiệu không đạt');
    o += '<div class="co-ds mb">'+(G.CO_TC||[]).map(function(t, i){
      var v = n.diem[t.ma];
      var nut = '<div class="co-muc" role="group" aria-label="'+h(t.ten)+'" style="--m:'+mauMuc(v)+'">';
      for(var k=0;k<=4;k++) nut += '<button type="button" class="'+(v===k?'on':'')+'" data-co="cl-diem" data-tc="'+h(t.ma)+'" data-n="'+k+'" aria-pressed="'+(v===k)+'">'+k+'</button>';
      nut += '</div>';
      return '<div class="co-dong" style="align-items:flex-start"><span class="co-grow" style="min-width:220px"><b class="sm">'+(i+1)+'. '+h(t.ten)+'</b>'+
        '<div class="tiny" style="margin-top:3px;color:'+CO.MAU_DEN.XANH+'"><b>4</b> · '+h(t.m4)+'</div>'+
        '<div class="tiny" style="color:'+CO.MAU_DEN.DO+'"><b>0</b> · '+h(t.m0)+'</div></span>'+nut+'</div>';
    }).join('')+'</div>';

    /* Lằn ranh đỏ */
    o += U.sec('Lằn ranh đỏ', 'Chạm một lằn ranh là phiếu vào băng đỏ, bất kể điểm');
    o += '<div class="card pad-sm mb"><div class="co-ds">'+(G.CO_LANRANH||[]).map(function(l){
      return '<label class="co-hang sm" style="gap:8px;flex-wrap:nowrap"><input type="checkbox" id="cl-lr-'+h(l.ma)+'" data-co-ch="cl-doi"'+(n.lanRanh.indexOf(l.ma)>=0?' checked':'')+'><span>'+h(l.ten)+'</span></label>';
    }).join('')+'</div></div>';

    /* Nhận xét + sửa + xem trước */
    var bat = canSua(q);
    o += '<div class="grid g2 mb"><div class="card pad-sm"><div class="co-ds">'+
      CO.o2('Nhận xét (bằng chứng quan sát được)', '<textarea class="inp" id="cl-nx" rows="3" maxlength="600" placeholder="Điều làm tốt, điều cần sửa — trích hành vi cụ thể">'+h(n.nx||'')+'</textarea>')+
      CO.o2('Một điều sửa'+(bat?' (bắt buộc)':''), '<input class="inp" id="cl-sua" maxlength="200" value="'+h(n.sua||'')+'" placeholder="Một hành vi cụ thể, đo được">')+
      CO.o2('Hạn sửa'+(bat?' (bắt buộc)':''), '<input type="date" class="inp" id="cl-han" min="'+h(CO.homNay())+'" value="'+h(n.hanSua||'')+'">')+
      '</div></div>'+
      '<div class="card pad-sm" style="border-color:'+(q.diem==null?'var(--line)':CO.MAU_DEN[q.band.den])+'"><b class="sm">Xem trước CQI</b>'+
      '<div class="co-hang mt"><b class="co-so" style="font-size:34px;line-height:1;color:'+(q.diem==null?'var(--ink-4)':CO.MAU_DEN[q.band.den])+'">'+(q.diem==null?'—':q.diem)+'</b><span class="sm muted">/100</span>'+
      (q.diem==null ? '' : CO.den(q.band.den, false)+'<b class="sm">'+h(q.band.ten)+'</b>')+'</div>'+
      vach(soDa/10, 'var(--gita)')+'<p class="tiny muted" style="margin-top:4px">'+soDa+'/'+(G.CO_TC||[]).length+' tiêu chí đã chấm'+(q.du?'':' — phải chấm đủ mới lưu được')+
      ' · CQI = tổng điểm ÷ (4 × số tiêu chí đã chấm) × 100.</p>'+
      (q.lanRanh ? '<div class="co-cb mt"><div style="--m:'+CO.MAU_DEN.DO+'">Chạm '+q.lanRanh+' lằn ranh đỏ — bắt buộc ghi một điều sửa và hạn.</div></div>'
        : (q.diem!=null && q.diem<70) ? '<div class="co-cb mt"><div style="--m:'+CO.MAU_DEN.VANG+'">CQI dưới 70 — bắt buộc ghi một điều sửa và hạn.</div></div>' : '')+
      '<div class="co-hang mt"><button class="btn pri" data-co="cl-luu">'+ic('check','w-4 h-4')+'Lưu phiếu</button><button class="btn ghost sm" data-co="cl-nhap-xoa">Xoá nháp</button></div>'+
      '</div></div>';
    return o;
  }

  /* ═════════ BẢNG CHẤT LƯỢNG ═════════ */
  function chiTietPhieu(p){
    var q = CO.cqi(p);
    return '<div class="card pad-sm" style="border-color:var(--gita)"><div class="grid g2"><div class="co-ds">'+
      (G.CO_TC||[]).map(function(t){ var v = p.diem ? p.diem[t.ma] : null;
        return '<div><div class="co-hang sm"><span class="co-grow">'+h(t.ten)+'</span><b class="co-so" style="color:'+mauMuc(v==null?null:Number(v))+'">'+(v==null?'—':v)+'/4</b></div>'+vach(v==null?0:Number(v)/4, mauMuc(v==null?null:Number(v)))+'</div>'; }).join('')+
      '</div><div class="co-ds sm">'+
      '<div><b>CQI '+(q.diem==null?'—':q.diem)+'</b> · '+h(q.band.ten)+'</div>'+
      '<div class="muted">Người chấm: '+h(CO.tenCoach(p.nguoiCham))+' · '+h(NGUON[p.nguon]||p.nguon)+' · lập '+h(CO.gioVN(p.t))+'</div>'+
      ((p.lanRanh||[]).length ? '<div class="co-cb">'+p.lanRanh.map(function(m){ return '<div style="--m:'+CO.MAU_DEN.DO+'">'+h(tenLR(m))+'</div>'; }).join('')+'</div>' : '<div class="muted">Không chạm lằn ranh đỏ.</div>')+
      (p.nx ? '<div><b>Nhận xét:</b> '+h(p.nx)+'</div>' : '')+
      (p.sua ? '<div><b>Một điều sửa:</b> '+h(p.sua)+(p.hanSua ? ' · hạn '+h(CO.ngayVN(p.hanSua)) : '')+(p.daSua ? ' · <span style="color:'+CO.MAU_DEN.XANH+'">đã sửa '+h(CO.ngayVN(p.daSua))+'</span>' : '')+'</div>' : '')+
      '</div></div></div>';
  }
  function tabBang(){
    var ds = dsPhieu(), ql = CO.laQuanLy(), hn = CO.homNay(), o = '';
    var coach = dsCoachThay(ds).map(function(u){ return tkCoach(u, ds); });
    o += '<div class="co-tb mb"><table><thead><tr><th>Coach</th><th>Số phiếu</th><th>CQI TB</th><th>Xu hướng (5 phiếu)</th><th>Tiêu chí yếu nhất</th><th>Lằn ranh</th><th>Sửa mở</th><th>Quá hạn</th><th>Đèn</th></tr></thead><tbody>'+
      coach.map(function(c){
        return '<tr><td><b>'+h(CO.tenCoach(c.u))+'</b>'+(c.u===me()?' <span class="tiny muted">(tôi)</span>':'')+'</td><td class="so">'+c.n+'</td>'+
          '<td class="so"><b style="color:'+mauDiem(c.cqi)+'">'+(c.cqi==null?'—':c.cqi)+'</b></td><td>'+spark(c.xuHuong)+'</td>'+
          '<td>'+(c.yeu ? h(c.yeu.ten)+' <span class="tiny muted co-so">'+so1(c.yeu.tb)+'/4</span>' : '<span class="tiny muted">—</span>')+'</td>'+
          '<td class="so" style="color:'+(c.lr?CO.MAU_DEN.DO:'inherit')+'">'+c.lr+'</td><td class="so">'+c.suaMo+'</td>'+
          '<td class="so" style="color:'+(c.quaHan?CO.MAU_DEN.DO:'inherit')+'">'+c.quaHan+'</td>'+
          '<td>'+(c.den ? CO.den(c.den) : '<span class="tiny muted">chưa có phiếu</span>')+'</td></tr>';
      }).join('')+'</tbody></table></div>';
    o += '<p class="tiny muted mb">Đèn: theo băng của CQI trung bình (từ 70 xanh · 55–69 vàng · dưới 55 đỏ); có lằn ranh đỏ trong 90 ngày là đỏ. Xu hướng: CQI các phiếu gần nhất theo ngày buổi, vạch đứt là mốc 70.</p>';

    /* Trung bình từng tiêu chí */
    var tc = tbTieuChi(ds), coSo = tc.filter(function(x){ return x.tb!=null; });
    var thap = coSo.length ? Math.min.apply(null, coSo.map(function(x){ return x.tb; })) : null;
    o += U.sec(ql ? 'Trung bình từng tiêu chí — cả đội' : 'Trung bình từng tiêu chí — của tôi', ds.length+' phiếu · tiêu chí yếu nhất được tô đậm');
    o += ds.length ? '<div class="card pad-sm mb"><div class="co-ds">'+tc.map(function(x){
      var yeu = x.tb!=null && x.tb===thap;
      return '<div><div class="co-hang sm"><span class="co-grow"'+(yeu?' style="font-weight:800;color:'+CO.MAU_DEN.DO+'"':'')+'>'+h(x.ten)+(yeu?' · yếu nhất':'')+'</span>'+
        '<span class="tiny muted">'+x.n+' phiếu</span><b class="co-so" style="min-width:48px;text-align:right">'+so1(x.tb)+'/4</b></div>'+
        vach(x.tb==null?0:x.tb/4, yeu ? CO.MAU_DEN.DO : mauMuc(x.tb==null?null:x.tb))+'</div>';
    }).join('')+'</div></div>' : trong('Chưa có phiếu chấm nào', 'Chấm buổi đầu tiên ở thẻ "Chấm buổi".');

    /* Danh sách phiếu */
    var mo = st().clMo, xoa = st().clXoa;
    o += U.sec('Phiếu chấm', 'Mới nhất trước · xoá được phiếu do mình chấm'+(ql?' (quản lý xoá được mọi phiếu)':''));
    if(ds.length) o += '<div class="co-ds">'+moiNhat(ds).map(function(p){
      var q = CO.cqi(p), quaHan = p.sua && !p.daSua && p.hanSua && p.hanSua < hn;
      var s = '<div class="co-dong"><span class="co-grow" style="min-width:200px"><b class="sm">'+h(CO.ngayVN(p.ngay))+' · '+h(CO.tenNha(p.nha))+'</b>'+CO.nhanMau(p)+
        '<div class="tiny muted">'+(ql?'Coach '+h(CO.tenCoach(p.coach))+' · ':'')+h(NGUON[p.nguon]||p.nguon)+' · chấm bởi '+h(CO.tenCoach(p.nguoiCham))+
        (p.sua ? ' · sửa: '+h(p.sua)+(p.daSua ? ' (đã sửa)' : p.hanSua ? ' (hạn '+h(CO.ngayVN(p.hanSua))+')' : '') : '')+'</div></span>'+
        (quaHan ? the('sửa quá hạn', CO.MAU_DEN.DO) : '')+
        '<b class="co-so" style="color:'+CO.MAU_DEN[q.band.den]+'">'+(q.diem==null?'—':q.diem)+'</b>'+CO.den(q.band.den, false)+
        '<span class="co-hang" style="gap:6px"><button class="btn ghost sm" data-co="cl-mo" data-id="'+h(p.id)+'" aria-expanded="'+(mo===p.id)+'">'+(mo===p.id?'Thu gọn':'Mở')+'</button>'+
        (p.sua && !p.daSua && duocDongSua(p) ? '<button class="btn ghost sm" data-co="cl-da-sua" data-id="'+h(p.id)+'">'+ic('check','w-3 h-3')+'Đã sửa</button>' : '')+
        (duocXoa(p) ? (xoa===p.id ? '<button class="btn sm" style="background:'+CO.MAU_DEN.DO+';border-color:'+CO.MAU_DEN.DO+';color:#fff" data-co="cl-xoa" data-id="'+h(p.id)+'">Xác nhận xoá</button><button class="btn ghost sm" data-co="cl-xoa-bo">Không</button>'
                                   : '<button class="btn ghost sm" data-co="cl-xoa-hoi" data-id="'+h(p.id)+'">Xoá</button>') : '')+
        '</span></div>';
      return s + (mo===p.id ? chiTietPhieu(p) : '');
    }).join('')+'</div>';
    return o;
  }

  /* ═════════ KẾT QUẢ GIA ĐÌNH ═════════ */
  function ketQua(u, ds){
    var dk = CO.dsDK(true).filter(function(d){ return d.coach===u && d.tt==='dang'; });
    var cs = dk.map(function(d){ return CO.chiSo(d); });
    var gk = cs.map(function(c){ return c.ganKet; }).filter(function(v){ return v!=null; });
    var hl = cs.map(function(c){ return c.p.haiLong; }).filter(function(v){ return v!=null; });
    var cm = cong(cs.map(function(c){ return c.coMat; })), vg = cong(cs.map(function(c){ return c.vang; }));
    var xo = cong(cs.map(function(c){ return c.xong; })), dh = cong(cs.map(function(c){ return c.dungHan; }));
    var m90 = tuNgay(90);
    var cq = ds.filter(function(p){ return p.coach===u && p.ngay >= m90; }).map(function(p){ return CO.cqi(p).diem; }).filter(function(v){ return v!=null; });
    var parts = { cqi:tb(cq), gk:tb(gk), hl:hl.length ? 100*tb(hl) : null };
    var s = 0, w = 0, ct = [];
    Object.keys(TRONG).forEach(function(k){ if(parts[k]!=null){ s += TRONG[k]*parts[k]; w += TRONG[k]; ct.push(TRONG[k]+'×'+Math.round(parts[k])); } });
    return { u:u, nha:dk.length, gk:tron(tb(gk)), thamGia:phan(cm, cm+vg), dungHan:phan(dh, xo), hl:hl.length ? 5*tb(hl) : null,
      nhaDo:cs.filter(function(c){ return c.den==='DO'; }).length, cqi:tron(parts.cqi), soPhieu:cq.length,
      tong: w ? Math.round(s/w) : null, ct:ct, w:w, parts:parts };
  }
  function tabKq(){
    var ds = dsPhieu(), ql = CO.laQuanLy(), o = '';
    var rows = dsCoachThay(ds).map(function(u){ return ketQua(u, ds); });
    if(ql) rows = rows.filter(function(r){ return r.nha || r.soPhieu; });
    o += '<p class="sm muted mb">Số đo lấy từ các nhà <b>đang chạy chương trình</b> của từng Coach (cùng công thức với màn Điều phối). CQI lấy trung bình phiếu chấm 90 ngày gần nhất.</p>';
    if(!rows.length) return o + trong('Chưa có dữ liệu kết quả', 'Chưa có Coach nào có nhà đang chạy hoặc phiếu chấm trong 90 ngày.');
    o += '<div class="co-tb mb"><table><thead><tr><th>Coach</th><th>Số nhà</th><th>Gắn kết TB</th><th>Tham gia</th><th>Nhiệm vụ đúng hạn</th><th>Hài lòng TB</th><th>Nhà đỏ</th><th>CQI 90 ngày</th><th>Điểm tổng hợp</th></tr></thead><tbody>'+
      rows.map(function(r){
        return '<tr><td><b>'+h(CO.tenCoach(r.u))+'</b>'+(r.u===me()?' <span class="tiny muted">(tôi)</span>':'')+'</td><td class="so">'+r.nha+'</td>'+
          '<td class="so" style="color:'+mauDiem(r.gk)+'">'+(r.gk==null?'—':r.gk)+'</td><td class="so">'+r.thamGia+'</td><td class="so">'+r.dungHan+'</td>'+
          '<td class="so">'+(r.hl==null?'—':so1(r.hl)+'/5')+'</td><td class="so" style="color:'+(r.nhaDo?CO.MAU_DEN.DO:'inherit')+'">'+r.nhaDo+'</td>'+
          '<td class="so" style="color:'+mauDiem(r.cqi)+'">'+(r.cqi==null?'—':r.cqi)+' <span class="tiny muted">('+r.soPhieu+')</span></td>'+
          '<td class="so"><b style="font-size:15px;color:'+mauDiem(r.tong)+'">'+(r.tong==null?'—':r.tong)+'</b></td></tr>';
      }).join('')+'</tbody></table></div>';

    o += U.sec('Điểm chất lượng tổng hợp', 'Quy trình đúng chưa đủ — phải thấy được ở kết quả của gia đình');
    o += '<div class="grid g2 mb"><div class="card pad-sm sm" style="line-height:1.65">'+
      '<b>Điểm tổng hợp = 50% CQI quy trình + 30% gắn kết + 20% hài lòng.</b>'+
      '<ul style="margin:8px 0 0 18px;padding:0"><li><b>CQI quy trình</b> (0–100): trung bình CQI các phiếu chấm 90 ngày.</li>'+
      '<li><b>Gắn kết</b> (0–100): trung bình điểm gắn kết các nhà đang chạy.</li>'+
      '<li><b>Hài lòng</b> (0–100): trung bình điểm nhà chấm buổi (1–5) ÷ 5 × 100.</li></ul>'+
      '<p class="tiny muted mt">Phần nào chưa có dữ liệu thì bỏ ra và chia lại trọng số trên các phần còn lại — không đoán, không điền số giả.</p></div>'+
      '<div class="card pad-sm"><b class="sm">Cách ra từng con số</b><div class="co-ds mt">'+rows.map(function(r){
        return '<div class="sm"><b>'+h(CO.tenCoach(r.u))+'</b>: '+(r.w ? '<span class="co-so">('+h(r.ct.join(' + '))+') ÷ '+r.w+' = <b style="color:'+mauDiem(r.tong)+'">'+r.tong+'</b></span>'+
          (r.w<100 ? ' <span class="tiny muted">(thiếu '+[r.parts.cqi==null?'CQI':'', r.parts.gk==null?'gắn kết':'', r.parts.hl==null?'hài lòng':''].filter(Boolean).join(', ')+')</span>' : '')
          : '<span class="muted">chưa có phần nào có dữ liệu</span>')+'</div>';
      }).join('')+'</div></div></div>';
    return o;
  }

  /* ═════════ HIỆU CHUẨN ═════════ */
  function nhomHC(ds){
    var g = {};
    ds.forEach(function(p){ var k = p.coach+'|'+p.nha+'|'+p.ngay; (g[k] = g[k] || []).push(p); });
    return Object.keys(g).map(function(k){
      var a = g[k], nguoi = {};
      a.forEach(function(p){ nguoi[p.nguoiCham] = p; });   /* mỗi người chấm lấy phiếu cuối */
      var ps = Object.keys(nguoi).map(function(u){ return nguoi[u]; });
      return { k:k, ps:ps };
    }).filter(function(x){ return x.ps.length >= 2; });
  }
  function tabHc(){
    var ds = dsPhieu(), nh = nhomHC(ds), o = '';
    o += '<p class="sm muted mb">Hai người trở lên chấm cùng một buổi (cùng Coach · nhà · ngày) thì so từng tiêu chí. Lệch từ 2 điểm trở lên là hai người đang hiểu thang chấm khác nhau — cần ngồi lại thống nhất cách chấm.</p>';
    if(!nh.length) return o + trong('Chưa có buổi nào được hai người chấm',
      'Để hiệu chuẩn: Trưởng nhóm và một người chấm khác (hoặc Coach tự chấm) cùng chấm một buổi — chọn đúng Coach, nhà và ngày buổi giống nhau ở thẻ "Chấm buổi".');
    var dem = {};
    nh.forEach(function(x){
      var ps = x.ps, p0 = ps[0], lech = [];
      o += '<div class="card pad-sm mb"><div class="co-hang"><b class="co-grow sm">'+h(CO.tenCoach(p0.coach))+' · '+h(CO.tenNha(p0.nha))+' · buổi '+h(CO.ngayVN(p0.ngay))+'</b>'+
        '<span class="tiny muted">'+ps.length+' người chấm</span></div>';
      o += '<div class="co-tb mt"><table><thead><tr><th>Tiêu chí</th>'+ps.map(function(p){ return '<th>'+h(CO.tenCoach(p.nguoiCham))+'<div class="tiny muted" style="text-transform:none;letter-spacing:0">'+h(NGUON[p.nguon]||p.nguon)+'</div></th>'; }).join('')+'<th>Lệch</th><th></th></tr></thead><tbody>'+
        (G.CO_TC||[]).map(function(t){
          var v = ps.map(function(p){ var d = p.diem ? p.diem[t.ma] : null; return d==null||d==='' ? null : Number(d); });
          var co = v.filter(function(x){ return x!=null; });
          var l = co.length >= 2 ? Math.max.apply(null, co) - Math.min.apply(null, co) : null;
          if(l!=null) lech.push(l);
          if(l!=null && l>=2) dem[t.ma] = (dem[t.ma]||0) + 1;
          return '<tr><td>'+h(t.ten)+'</td>'+v.map(function(x){ return '<td class="so">'+(x==null?'—':x)+'</td>'; }).join('')+
            '<td class="so"><b style="color:'+(l>=2?CO.MAU_DEN.DO:l===1?CO.MAU_DEN.VANG:'inherit')+'">'+(l==null?'—':l)+'</b></td>'+
            '<td>'+(l>=2 ? the('cần thống nhất cách chấm', CO.MAU_DEN.DO) : '')+'</td></tr>';
        }).join('')+
        '<tr><td><b>CQI</b></td>'+ps.map(function(p){ var q = CO.cqi(p); return '<td class="so"><b style="color:'+CO.MAU_DEN[q.band.den]+'">'+(q.diem==null?'—':q.diem)+'</b></td>'; }).join('')+'<td></td><td></td></tr>'+
        '</tbody></table></div>';
      var tbL = tb(lech), nCan = lech.filter(function(l){ return l>=2; }).length;
      o += '<p class="sm mt"><b>Độ lệch trung bình: <span class="co-so" style="color:'+(tbL==null?'inherit':tbL>=1.5?CO.MAU_DEN.DO:tbL>=0.8?CO.MAU_DEN.VANG:CO.MAU_DEN.XANH)+'">'+so1(tbL)+'</span> điểm/tiêu chí</b> · '+
        nCan+' tiêu chí lệch ≥ 2.</p></div>';
    });
    var keys = Object.keys(dem).sort(function(a, b){ return dem[b] - dem[a]; });
    o += U.sec('Tiêu chí hay lệch', keys.length ? 'Đưa vào buổi hiệu chuẩn đội tiếp theo' : 'Không có tiêu chí nào lệch từ 2 điểm');
    if(keys.length) o += '<div class="co-cb">'+keys.map(function(m){ return '<div style="--m:'+CO.MAU_DEN.DO+'"><span class="co-grow"><b>'+h(tenTC(m))+'</b> — lệch ≥ 2 ở '+dem[m]+' buổi</span></div>'; }).join('')+'</div>';
    return o;
  }

  /* ═════════ CHUẨN & NGƯỠNG ═════════ */
  function tabChuan(){
    var ql = CO.laQuanLy(), ds = dsPhieu(), m30 = tuNgay(30), o = '';
    o += U.sec('Thang chấm mười tiêu chí', 'Mỗi tiêu chí 0–4 · CQI = tổng điểm ÷ 40 × 100');
    o += '<div class="co-tb mb"><table><thead><tr><th>#</th><th>Tiêu chí</th><th>4 · chuẩn mẫu</th><th>0 · không đạt</th></tr></thead><tbody>'+
      (G.CO_TC||[]).map(function(t, i){ return '<tr><td class="so">'+(i+1)+'</td><td><b>'+h(t.ten)+'</b></td><td class="sm">'+h(t.m4)+'</td><td class="sm">'+h(t.m0)+'</td></tr>'; }).join('')+'</tbody></table></div>';
    o += '<div class="grid g2 mb"><div class="card pad-sm"><b class="sm">Năm lằn ranh đỏ</b><p class="tiny muted" style="margin:2px 0 8px">Chạm một lằn ranh: phiếu vào băng "Chạm lằn ranh đỏ", bắt buộc một điều sửa có hạn.</p><div class="co-cb">'+
      (G.CO_LANRANH||[]).map(function(l){ return '<div style="--m:'+CO.MAU_DEN.DO+'">'+h(l.ten)+'</div>'; }).join('')+'</div></div>'+
      '<div class="card pad-sm"><b class="sm">Băng điểm CQI</b><div class="co-ds mt">'+
      (G.CO_BANG||[]).map(function(b, i, a){ var den = i===0 ? 100 : a[i-1].tu - 1;
        return '<div class="co-hang sm">'+CO.den(b.den, false)+'<span class="co-grow"><b>'+h(b.ten)+'</b></span><span class="co-so">'+b.tu+'–'+den+'</span></div>'; }).join('')+
      '<div class="co-hang sm">'+CO.den('DO', false)+'<span class="co-grow"><b>Chạm lằn ranh đỏ</b></span><span class="tiny muted">bất kể điểm</span></div></div>'+
      '<p class="tiny muted mt">Dưới 70 hoặc chạm lằn ranh: bắt buộc "Một điều sửa" + hạn. Ngưỡng là ngưỡng vận hành ban đầu, Quản lý chuyên môn chỉnh theo dữ liệu thật.</p></div></div>';

    o += U.sec('Nhịp soát chất lượng', 'Mỗi Coach ≥ '+NHIP_SOAT+' buổi được chấm trong 30 ngày (tính theo ngày buổi, từ '+CO.ngayVN(m30)+')');
    var coach = ql ? CO.dsCoach().map(function(c){ return c.u; }) : [me()];
    var hang = coach.map(function(u){
      var p = ds.filter(function(x){ return x.coach===u && x.ngay >= m30; });
      var tu = p.filter(function(x){ return x.nguon==='tu-cham'; }).length;
      return { u:u, n:p.length, tu:tu, khac:p.length - tu };
    });
    var thieu = hang.filter(function(x){ return x.n < NHIP_SOAT; });
    if(ql) o += '<p class="sm mb">'+(thieu.length ? '<b style="color:'+CO.MAU_DEN.DO+'">'+thieu.length+' Coach dưới nhịp soát:</b> '+h(thieu.map(function(x){ return CO.tenCoach(x.u); }).join(', ')) : '<b style="color:'+CO.MAU_DEN.XANH+'">Mọi Coach đều đủ nhịp soát.</b>')+'</p>';
    o += '<div class="co-tb mb"><table><thead><tr><th>Coach</th><th>Phiếu 30 ngày</th><th>Người khác chấm</th><th>Tự chấm</th><th>Nhịp soát</th></tr></thead><tbody>'+
      hang.map(function(x){ return '<tr><td><b>'+h(CO.tenCoach(x.u))+'</b></td><td class="so">'+x.n+'</td><td class="so">'+x.khac+'</td><td class="so">'+x.tu+'</td>'+
        '<td>'+(x.n >= NHIP_SOAT ? the('đủ', CO.MAU_DEN.XANH) : the('thiếu '+(NHIP_SOAT-x.n)+' phiếu', CO.MAU_DEN.DO))+'</td></tr>'; }).join('')+'</tbody></table></div>';
    return o;
  }

  /* ═════════ MÀN ═════════ */
  G.VIEWS[VIEW] = function(){
    var k = CO.cua('pro_coach', 'Kiểm soát & đo lường chất lượng coach'); if(k) return k;
    CO.napMau();
    var ds = dsPhieu(), ql = CO.laQuanLy(), tab = CO.tab(VIEW, 'cham');
    var m30 = tuNgay(30), m90 = tuNgay(90);
    var p30 = ds.filter(function(p){ return p.ngay >= m30; });
    var cq30 = p30.map(function(p){ return CO.cqi(p).diem; }).filter(function(v){ return v!=null; });
    var cqTB = tron(tb(cq30));
    var p90 = ds.filter(function(p){ return p.ngay >= m90; });
    var lr90 = cong(p90.map(function(p){ return (p.lanRanh||[]).length; }));
    var phieuLR = p90.filter(function(p){ return (p.lanRanh||[]).length; }).length;
    var o4;
    if(ql){
      var duoi = dsCoachThay(ds).map(function(u){ return tkCoach(u, ds); }).filter(function(c){
        var c90 = c.p.filter(function(p){ return p.ngay >= m90; }).map(function(p){ return CO.cqi(p).diem; }).filter(function(v){ return v!=null; });
        var t = tb(c90);
        return (t!=null && t < 70) || c.lr90 > 0; });
      o4 = U.stat({ k:'Coach dưới chuẩn', v:String(duoi.length), d:duoi.length ? duoi.map(function(c){ return CO.tenCoach(c.u); }).join(', ') : 'CQI 90 ngày ≥ 70, không chạm lằn ranh', c:duoi.length?CO.MAU_DEN.DO:CO.MAU_DEN.XANH });
    } else {
      var y = yeuNhat(ds);
      o4 = U.stat({ k:'Tiêu chí yếu nhất của tôi', v:y ? so1(y.tb)+'/4' : '—', d:y ? y.ten : 'chưa có phiếu nào', c:y?mauMuc(y.tb):null });
    }
    var o = '<div class="mb"><button class="btn ghost sm" data-v="coach-he">← Hệ điều hành Coach</button></div>';
    o += U.ph({ eyebrow:'COACH · KIỂM SOÁT CHẤT LƯỢNG', ic:'shield', grad:1, t:'Kiểm soát & đo lường chất lượng coach',
      lead:'Chấm buổi theo mười tiêu chí và năm lằn ranh đỏ, theo dõi chỉ số chất lượng từng Coach, đối chiếu với kết quả thật của gia đình — bằng chứng trước, cảm nhận sau.' });
    o += CO.banMau();
    o += '<div class="grid g4 mb">'+
      U.stat({ k:'Phiếu 30 ngày', v:String(p30.length), d:(ql?'toàn đội':'phiếu chấm tôi')+' · theo ngày buổi' })+
      U.stat({ k:'CQI trung bình', v:cqTB==null?'—':cqTB+'/100', d:cqTB==null?'chưa có phiếu 30 ngày':bang(cqTB).ten+' · '+cq30.length+' phiếu 30 ngày', c:cqTB==null?null:mauDiem(cqTB) })+
      U.stat({ k:'Chạm lằn ranh đỏ', v:String(lr90), d:'90 ngày · trên '+phieuLR+' phiếu', c:lr90?CO.MAU_DEN.DO:CO.MAU_DEN.XANH })+
      o4+'</div>';
    o += CO.tabs(VIEW, [['cham','Chấm buổi','edit'],['bang','Bảng chất lượng','chart'],['kq','Kết quả gia đình','users'],['hc','Hiệu chuẩn','target'],['chuan','Chuẩn & ngưỡng','shield']], tab);
    if(tab==='bang') o += tabBang();
    else if(tab==='kq') o += tabKq();
    else if(tab==='hc') o += tabHc();
    else if(tab==='chuan') o += tabChuan();
    else o += tabCham();
    return o;
  };

  /* ═════════ BẤM ═════════ */
  CO.on('cl-doi', function(){ chupNhap(); CO.luu(); });
  CO.on('cl-diem', function(el){
    var n = chupNhap(), ma = el.getAttribute('data-tc'), v = Number(el.getAttribute('data-n'));
    if(n.diem[ma]===v) delete n.diem[ma]; else n.diem[ma] = v;
    CO.luu();
  });
  CO.on('cl-nhap-xoa', function(){ var n = nhap(); st().clNhap = { coach:n.coach, nguon:n.nguon }; CO.luu(); U.toast('Đã xoá nháp phiếu chấm.', 'ok'); });
  CO.on('cl-luu', function(){
    var n = chupNhap(), ql = CO.laQuanLy(), u = me(), hn = CO.homNay();
    var q = CO.cqi(n);
    if(ql && !n.coach){ U.toast('Chọn Coach được chấm.', 'err'); return; }
    if(!ql && n.coach!==u){ U.toast('Vai Coach chỉ tự chấm buổi của chính mình.', 'err'); return; }
    if(!NGUON[n.nguon]){ U.toast('Chọn nguồn chấm.', 'err'); return; }
    if(n.nguon==='tu-cham' && n.coach!==u){ U.toast('"Tự chấm" chỉ dùng khi chấm buổi của chính mình.', 'err'); return; }
    if(n.nguon!=='tu-cham' && n.coach===u){ U.toast('Chấm buổi của chính mình thì chọn nguồn "Tự chấm".', 'err'); return; }
    if(!n.nha){ U.toast('Chọn nhà của buổi được chấm.', 'err'); return; }
    if(!/^\d{4}-\d{2}-\d{2}$/.test(n.ngay||'')){ U.toast('Chọn ngày buổi.', 'err'); return; }
    if(n.ngay > hn){ U.toast('Ngày buổi không được ở tương lai — chỉ chấm buổi đã diễn ra.', 'err'); return; }
    if(!q.du){ var thieu = (G.CO_TC||[]).filter(function(t){ return n.diem[t.ma]==null; });
      U.toast('Chưa chấm đủ 10 tiêu chí — còn thiếu '+thieu.length+': '+thieu.map(function(t){ return t.ten; }).slice(0,3).join(', ')+(thieu.length>3?'…':'')+'.', 'err'); return; }
    if(canSua(q)){
      if(!n.sua || n.sua.length < 6){ U.toast((q.lanRanh ? 'Phiếu chạm lằn ranh đỏ' : 'CQI dưới 70')+' — phải ghi "Một điều sửa" cụ thể.', 'err'); return; }
      if(!/^\d{4}-\d{2}-\d{2}$/.test(n.hanSua||'')){ U.toast('Ghi hạn cho điều cần sửa.', 'err'); return; }
    }
    if(n.hanSua && n.hanSua < hn){ U.toast('Hạn sửa không được ở quá khứ.', 'err'); return; }
    var trung = st().cl.filter(function(p){ return p.coach===n.coach && p.nha===n.nha && p.ngay===n.ngay && p.nguoiCham===u; })[0];
    if(trung){ U.toast('Anh/chị đã chấm buổi này rồi (cùng Coach, nhà, ngày). Xoá phiếu cũ ở "Bảng chất lượng" nếu muốn chấm lại.', 'err'); return; }
    var diem = {}; (G.CO_TC||[]).forEach(function(t){ diem[t.ma] = Number(n.diem[t.ma]); });
    var p = { id:CO.id('cl'), t:Date.now(), coach:n.coach, nha:n.nha, ngay:n.ngay, nguon:n.nguon, nguoiCham:u, diem:diem,
      lanRanh:n.lanRanh.slice(), nx:String(n.nx||'').slice(0,600), sua:String(n.sua||'').slice(0,200), hanSua:n.sua ? (n.hanSua||'') : '' };
    st().cl.push(p);
    st().clNhap = { coach:n.coach, nguon:n.nguon };
    st().clMo = p.id;
    CO.luu();
    U.toast('Đã lưu phiếu chấm: CQI '+q.diem+' · '+q.band.ten+'.', 'ok');
  });
  CO.on('cl-mo', function(el){ var id = el.getAttribute('data-id'); st().clMo = st().clMo===id ? null : id; CO.luu(); });
  CO.on('cl-xoa-hoi', function(el){ st().clXoa = el.getAttribute('data-id'); CO.luu(); });
  CO.on('cl-xoa-bo', function(){ st().clXoa = null; CO.luu(); });
  CO.on('cl-xoa', function(el){
    var id = el.getAttribute('data-id'), s = st(), p = s.cl.filter(function(x){ return x.id===id; })[0];
    if(!p || s.clXoa!==id) return;
    if(!duocXoa(p)){ U.toast('Chỉ người chấm hoặc quản lý mới xoá được phiếu này.', 'err'); return; }
    s.cl = s.cl.filter(function(x){ return x.id!==id; }); s.clXoa = null; if(s.clMo===id) s.clMo = null;
    CO.luu(); U.toast('Đã xoá phiếu chấm.', 'ok');
  });
  CO.on('cl-da-sua', function(el){
    var id = el.getAttribute('data-id'), p = st().cl.filter(function(x){ return x.id===id; })[0];
    if(!p || !p.sua || p.daSua) return;
    if(!duocDongSua(p)){ U.toast('Chỉ Coach được chấm hoặc quản lý mới đóng được việc sửa.', 'err'); return; }
    p.daSua = CO.homNay(); p.aiDongSua = me();
    CO.luu(); U.toast('Đã ghi nhận: việc sửa "'+p.sua+'" đã xong.', 'ok');
  });
})();
