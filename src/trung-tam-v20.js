/* ═══════════════════════════════════════════════════════════════
   GITA 365 — TẦNG "CHIẾN LƯỢC V20" CỦA TRUNG TÂM ĐO LƯỜNG

   Cùng màn trung-tam-do (không thêm một màn rời): công tắc Vận hành ·
   Chiến lược V20. Tám thẻ:
     Bản tin chiến lược · North Star & động lực · Đơn vị kinh tế & nhóm
     khách · Phễu · Dự báo & kịch bản · Bất thường · Mục tiêu chiến lược ·
     Độ tin cậy dữ liệu
   Số thật: docChienLuocV20 / dsMucTieuCL (may-chu/chien-luoc-v20.js).
   Chưa có phiên máy chủ: ví dụ minh hoạ, chấm bằng đúng G.V20.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
(function(){
  var U = G.U, h = U.h, ic = U.ic;
  var st = { ai:'', tab:'bt0', d:null, mt:null, tai:{}, loi:{}, dc:{}, themMT:false };
  var X = G.TTD_V20 = {};
  var MAU = { tot:'#0B7350', canhBao:'#B4720F', xau:'#BE0E16', do:'#BE0E16', vang:'#B4720F', xanh:'#0B7350', chuaDo:'#73849F' };
  function V(){ return G.V20; }
  function lv(){ var r = G.S && G.S.roleObj; return r ? r.lv : 99; }
  function coMayChu(){ return typeof G.goiMayChu === 'function' && !!G.API_CAP_PHEP && !!G.PHIEN_TOKEN; }
  function veLai(){ if(G.render && G.S && G.S.view === 'trung-tam-do') G.render(); }
  function so(n){ return n == null ? '—' : (Math.round(Number(n) * 10) / 10).toLocaleString('vi-VN'); }
  function tien(n){ return n == null ? '—' : Math.round(n).toLocaleString('vi-VN') + 'đ'; }
  function trieu(n){ return n == null ? '—' : (Math.abs(n) >= 1e6 ? (Math.round(n / 1e5) / 10).toLocaleString('vi-VN') + ' tr' : Math.round(n).toLocaleString('vi-VN')); }
  function thg(t){ return t ? String(t).slice(5) + '/' + String(t).slice(2, 4) : ''; }
  function the(muc, chu){ var c = MAU[muc] || '#73849F'; return '<span class="co-tag" style="color:'+c+';background:color-mix(in srgb,'+c+' 13%,transparent)">'+h(chu)+'</span>'; }
  function gtChiSo(dv, v){ return v == null ? '—' : dv === 'đ' ? tien(v) : so(v) + (dv === '%' ? '%' : dv === 'lần' ? ' lần' : ''); }

  /* ═══════════ VÍ DỤ ═══════════ */
  function dungMau(){
    var TH = []; var d0 = new Date(); d0.setUTCDate(1);
    for(var i = 12; i >= 0; i--){ var x = new Date(Date.UTC(d0.getUTCFullYear(), d0.getUTCMonth() - i, 1)); TH.push(x.toISOString().slice(0, 7)); }
    function chuoi(goc, tang, nhieu, pha){ return TH.map(function(t, i){ return Math.max(0, Math.round(goc * Math.pow(1 + tang, i) * (1 + nhieu * Math.sin(i * 1.7 + (pha || 0))))); }); }
    var c = { lead:chuoi(60, 0.04, 0.12), nhaMoi:chuoi(14, 0.035, 0.15, 1), nhaTichCuc:chuoi(120, 0.03, 0.04, 2), nhaTraTien:chuoi(70, 0.03, 0.06, 3), lenTang:chuoi(4, 0.05, 0.3), cham:chuoi(420, 0.03, 0.08) };
    c.kichHoat = c.lead.map(function(v){ return Math.round(v * 0.55); });
    c.thuTB = TH.map(function(t, i){ return Math.round(2100000 * (1 + 0.01 * i)); });
    c.thu = c.nhaTraTien.map(function(v, i){ return v * c.thuTB[i]; });
    c.chi = c.thu.map(function(v, i){ return Math.round(v * (0.66 + 0.04 * Math.sin(i))); });
    c.tiepThi = c.thu.map(function(v){ return Math.round(v * 0.07); }); c.hoaHong = c.thu.map(function(v){ return Math.round(v * 0.02); }); c.hoan = c.thu.map(function(v){ return Math.round(v * 0.012); });
    var nTH = TH.length, last = nTH - 1;
    var tl = new Date().getUTCDate() / 30; ['lead','nhaMoi','nhaTraTien','lenTang','cham','kichHoat','thu','chi','tiepThi','hoaHong','hoan'].forEach(function(k){ c[k][last] = Math.round(c[k][last] * tl); });
    c.nhaTichCuc[last] = Math.round(c.nhaTichCuc[last] * Math.min(1, 0.5 + tl));
    c.giuLai = c.nhaTichCuc.map(function(v, i){ return i ? Math.round(c.nhaTichCuc[i - 1] * 0.89) : null; });
    c.churn = c.giuLai.map(function(v, i){ return i ? Math.round(1000 * (c.nhaTichCuc[i - 1] - v) / c.nhaTichCuc[i - 1]) / 10 : null; });
    var iL = nTH - 2, iP = nTH - 3, tron = function(k){ return c[k].slice(0, -1); };
    var db = {}; ['thu','nhaTichCuc','nhaMoi','lead','chi'].forEach(function(k){ db[k] = V().holt(tron(k).slice(-12), 3); });
    var thSau = [1, 2, 3].map(function(k){ var x = new Date(TH[last] + '-01T00:00:00Z'); x.setUTCMonth(x.getUTCMonth() + k - 1); return x.toISOString().slice(0, 7); });
    var nhom = TH.slice(-10, -1).map(function(t, j){ var n = 10 + (j * 3) % 7; var g = []; for(var k = 0; k <= 5; k++){ g.push(TH.indexOf(t) + k >= last ? null : Math.round(100 * Math.pow(0.88 + 0.01 * (j % 3), k))); } return { thang:t, soNha:n, giu:g, ltvHienTai:Math.round(2100000 * (1 + (9 - j) * 0.8)) }; });
    var arpu = c.thuTB[iL], tyLeTra = c.nhaTraTien[iL] / c.nhaTichCuc[iL], churn = 11, tuoi = Math.round(1000 / churn) / 10, ltv = Math.round(arpu * tyLeTra * tuoi);
    var cac = Math.round((c.tiepThi[iL] + c.hoaHong[iL]) / c.nhaMoi[iL]);
    var ngay60 = []; for(var q = 0; q < 60; q++) ngay60.push(q);
    function nd(goc, nhieu, cuoi){ var s = ngay60.map(function(i){ return Math.max(0, Math.round(goc * (1 + nhieu * Math.sin(i * 2.3)) * ((i % 7) > 4 ? 0.6 : 1))); }); if(cuoi != null) s[59] = cuoi; return s; }
    var bt = [['thu','Tiền thu đã duyệt',nd(5200000, 0.4, 19000000),'phong-tai-chinh'],['dangky','Đăng ký mới',nd(2, 0.5),'crm'],['cham','Lượt chạm khách',nd(15, 0.25, 3),'coach-dp'],['tick','Lượt tick việc của nhà',nd(48, 0.15),'do-luong-he'],
      ['baocao','Báo cáo ngày của nhà',nd(26, 0.2),'do-luong-he'],['dangnhap','Lượt đăng nhập',nd(30, 0.2),'nhat-ky-ht'],['loiai','Lỗi nhà cung cấp AI',nd(1, 0.8, 9),'bo-nao-da-tri'],['chi','Chi được duyệt',nd(3000000, 0.6),'phong-tai-chinh']].map(function(x){
      var s = x[2], z = V().zBen(s.slice(-29, -1), s[59]), tuan = s.slice(-7).reduce(function(a, b){ return a + b; }, 0), tb = [0,1,2,3].map(function(k){ return s.slice(-7 * (k + 2), -7 * (k + 1)).reduce(function(a, b){ return a + b; }, 0); }).reduce(function(a, b){ return a + b; }, 0) / 4;
      return { ma:x[0], ten:x[1], man:x[3], homQua:s[59], z:z, muc:V().mucBatThuong(z), tuan:tuan, tbTuan:Math.round(tb), doiTuan:tb > 0 ? Math.round(1000 * (tuan - tb) / tb) / 10 : null, chuoi:s.slice(-30) };
    });
    var nguon = [['phieuThu','Phiếu thu',1240,0],['chiPhi','Chi phí',610,1],['hoSoKhach','Hồ sơ nhà',186,2],['dangKyCho','Đăng ký',820,0],['crmKhach','CRM nhà',170,4],['crmCoHoi','Cơ hội bán',96,6],['soCham','Sổ chạm',5100,0],['nhipXong','Tick việc',30100,0],
      ['baoCaoNgay','Báo cáo ngày',14800,0],['thoiGianNgay','Thời gian dùng app',9200,0],['danhGiaKH','Phiếu hài lòng',64,9],['kyThu','Lịch thu',410,3],['khaiSoNgoai','Số kênh ngoài',22,19],['soTokenDaTri','Token AI',340,0],['audit','Nhật ký thao tác',88000,0]].map(function(x){
      return { bang:x[0], ten:x[1], so:x[2], ngayCu:x[3], cuoi:'', tt:x[3] <= 3 ? 'tuoi' : x[3] <= 14 ? 'cu' : 'ngu' }; });
    var d = { ok:true, mau:true, thang:TH, thangNay:TH[last], chuoi:c,
      dong:{ thang:TH[iL], dauKy:c.nhaTichCuc[iP], giuLai:c.giuLai[iL], mat:c.nhaTichCuc[iP] - c.giuLai[iL], moiVaQuayLai:c.nhaTichCuc[iL] - c.giuLai[iL], cuoiKy:c.nhaTichCuc[iL], thangNay:c.nhaTichCuc[last] },
      cay:{ thang:TH[iL], thangTruoc:TH[iP], thu:c.thu[iL], thuTruoc:c.thu[iP], nha:c.nhaTraTien[iL], nhaTruoc:c.nhaTraTien[iP], tb:c.thuTB[iL], tbTruoc:c.thuTB[iP], tach:V().tachBienDong(c.nhaTraTien[iP], c.thuTB[iP], c.nhaTraTien[iL], c.thuTB[iL]), nhaMoiTra:Math.round(c.nhaMoi[iL] * 0.8), nhaCuTra:c.nhaTraTien[iL] - Math.round(c.nhaMoi[iL] * 0.8) },
      pheu:[['lead','Đăng ký (lead)',214],['kichHoat','Kích hoạt tài khoản',118],['vaoHoc','Vào học (hồ sơ nhà)',47],['traTien','Có phiếu thu đã duyệt',39],['tichCuc','Học tích cực 30 ngày qua',31],['lenTang','Đã lên tầng',6]].map(function(x, i, a){ return { ma:x[0], ten:x[1], n:x[2], tyLe:i ? Math.round(1000 * x[2] / a[i - 1][2]) / 10 : null }; }),
      nhom:nhom, ktDonVi:{ arpu:arpu, arpuTichCuc:Math.round(arpu * tyLeTra), churn:churn, tuoiDoi:tuoi, ltv:ltv, cac:cac, chiThuHut:(c.tiepThi[iL] + c.hoaHong[iL]) * 3, nhaMoi3:c.nhaMoi[iL] * 3, ltvCac:Math.round(10 * ltv / cac) / 10, hoanVon:Math.round(10 * cac / (arpu * tyLeTra)) / 10, bienGop:28.4 },
      duBao:{ thang:thSau, thu:db.thu, nhaTichCuc:db.nhaTichCuc, nhaMoi:db.nhaMoi, lead:db.lead, chi:db.chi },
      tam:{ thang:TH[last], ngayQua:new Date().getUTCDate(), ngayThang:30, thu:c.thu[last], nhaMoi:c.nhaMoi[last], lead:c.lead[last], thuNhip:Math.round(c.thu[last] / Math.max(0.03, tl)) },
      batThuong:bt, nguon:nguon, du:[{ ten:'Nhà đang học có Coach', co:174, tong:182, pt:95.6 },{ ten:'Phiếu thu gắn kỳ thu', co:1120, tong:1240, pt:90.3 },{ ten:'Khoản chi có hoá đơn', co:520, tong:610, pt:85.2 },{ ten:'Nhà có giai đoạn CRM', co:150, tong:186, pt:80.6 }], tinCay:81,
      coSo:{ lead:c.lead[iL], kichHoat:0.55, vaoHoc:c.nhaMoi[iL] / c.kichHoat[iL], nha:c.nhaTichCuc[iL], giuChan:0.89, traTien:tyLeTra, arpu:arpu } };
    return d;
  }
  function giaTriV20(d){
    var iL = d.thang.length - 2, c = d.chuoi;
    return { nhaTichCuc:c.nhaTichCuc[iL], thu:c.thu[iL], nhaMoi:c.nhaMoi[iL], lead:c.lead[iL], tyLeKichHoat:c.lead[iL] > 0 ? Math.round(1000 * c.kichHoat[iL] / c.lead[iL]) / 10 : null,
      arpu:d.ktDonVi.arpu, churn:d.ktDonVi.churn, cac:d.ktDonVi.cac, ltvCac:d.ktDonVi.ltvCac, bienGop:d.ktDonVi.bienGop };
  }

  /* ═══════════ TẢI ═══════════ */
  function tai(viec, fn, than, gan){
    if(!coMayChu() || st.tai[viec]) return; st.tai[viec] = 1; st.loi[viec] = '';
    G.goiMayChu(fn, than, { moi:true }).then(function(r){ st.tai[viec] = 0; if(r && r.ok) gan(r); else { st.loi[viec] = (r && r.error) || 'Không đọc được.'; gan(null); } veLai(); });
  }
  function canD(){ if(st.d) return; if(!coMayChu()){ st.d = dungMau(); return; } tai('d', 'docChienLuocV20', {}, function(r){ st.d = r || { ok:false }; }); }
  function canMT(){ if(st.mt) return; if(!coMayChu()){ st.mt = { ok:true, mau:true, ds:[] }; return; } tai('mt', 'dsMucTieuCL', {}, function(r){ st.mt = r || { ok:false, ds:[] }; }); }
  function choTai(v){ return st.tai[v] ? '<p class="sm muted">Đang tính từ dữ liệu thật…</p>' : st.loi[v] ? '<div class="co-mau">'+ic('alert','w-4 h-4')+'<span>'+h(st.loi[v])+'</span></div>' : ''; }

  /* ═══════════ BIỂU ĐỒ ═══════════ */
  function bieuDo(nhan, thuc, db, opt){
    opt = opt || {};
    var W = 560, H = 190, l = 54, r = 14, t = 12, b = 26;
    var n = nhan.length, all = thuc.filter(function(v){ return v != null; }).concat(db ? db.tren : []);
    var mx = Math.max.apply(null, all.concat([1])) * 1.08;
    var x = function(i){ return l + i * (W - l - r) / Math.max(1, n - 1); }, y = function(v){ return t + (1 - v / mx) * (H - t - b); };
    var o = '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+h(opt.ten || 'Biểu đồ')+'" style="width:100%;height:auto;color:var(--ink-3,#556)">';
    [0, 0.5, 1].forEach(function(f){ var v = mx * f / 1.08; o += '<line x1="'+l+'" x2="'+(W-r)+'" y1="'+y(v).toFixed(1)+'" y2="'+y(v).toFixed(1)+'" stroke="currentColor" stroke-opacity=".14"/><text x="'+(l-6)+'" y="'+(y(v)+3).toFixed(1)+'" font-size="10" text-anchor="end" fill="currentColor">'+h(opt.tien ? trieu(v) : so(Math.round(v)))+'</text>'; });
    nhan.forEach(function(lb, i){ if(n > 9 && i % 2 && i !== n - 1) return; o += '<text x="'+x(i).toFixed(1)+'" y="'+(H-8)+'" font-size="10" text-anchor="middle" fill="currentColor">'+h(thg(lb))+'</text>'; });
    var soThuc = thuc.length;
    if(db){
      var i0 = soThuc - 1, band = [], tr = [], du = [];
      db.duBao.forEach(function(v, k){ tr.push(x(i0 + 1 + k).toFixed(1)+','+y(db.tren[k]).toFixed(1)); du.push(x(i0 + 1 + k).toFixed(1)+','+y(db.duoi[k]).toFixed(1)); });
      band = [x(i0).toFixed(1)+','+y(thuc[i0] || 0).toFixed(1)].concat(tr).concat(du.reverse());
      o += '<polygon points="'+band.join(' ')+'" fill="#185AB4" fill-opacity=".12"/>';
      o += '<polyline fill="none" stroke="#185AB4" stroke-width="2" stroke-dasharray="5 4" points="'+[x(i0).toFixed(1)+','+y(thuc[i0] || 0).toFixed(1)].concat(db.duBao.map(function(v, k){ return x(i0 + 1 + k).toFixed(1)+','+y(v).toFixed(1); })).join(' ')+'"/>';
    }
    if(opt.cot) thuc.forEach(function(v, i){ if(v == null) return; var w = Math.max(6, (W - l - r) / n * 0.55); o += '<rect x="'+(x(i) - w / 2).toFixed(1)+'" y="'+y(v).toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+(H - b - y(v)).toFixed(1)+'" rx="3" fill="'+(i === soThuc - 1 && opt.tamCuoi ? '#9FB4D6' : '#185AB4')+'" fill-opacity="'+(i === soThuc - 1 && opt.tamCuoi ? '.6' : '.85')+'"/>'; });
    else { var pts = thuc.map(function(v, i){ return v == null ? null : x(i).toFixed(1)+','+y(v).toFixed(1); }).filter(Boolean).join(' '); o += '<polyline fill="none" stroke="#185AB4" stroke-width="2.4" stroke-linejoin="round" points="'+pts+'"/>'; var e = thuc[soThuc - 1]; if(e != null) o += '<circle cx="'+x(soThuc - 1).toFixed(1)+'" cy="'+y(e).toFixed(1)+'" r="3.8" fill="#185AB4"/>'; }
    return o + '</svg>';
  }
  function tiaNho(s, muc){
    if(!s || !s.length) return '';
    var W = 120, H = 30, mx = Math.max.apply(null, s.concat([1])), n = s.length;
    var pts = s.map(function(v, i){ return (i * W / (n - 1)).toFixed(1)+','+(H - 3 - v / mx * (H - 6)).toFixed(1); }).join(' ');
    return '<svg viewBox="0 0 '+W+' '+H+'" width="120" height="30" aria-hidden="true"><polyline fill="none" stroke="#7d8db0" stroke-width="1.4" points="'+pts+'"/><circle cx="'+W+'" cy="'+(H - 3 - s[n-1] / mx * (H - 6)).toFixed(1)+'" r="3" fill="'+(MAU[muc] || '#185AB4')+'"/></svg>';
  }

  /* ═══════════ THẺ ═══════════ */
  function vBanTin(d){
    var bt = V().banTin(d);
    var o = '<p class="sm muted" style="margin-top:0">Máy đọc 12 tháng số liệu thành các điều quan trọng nhất cho chiến lược — mỗi điều có căn cứ bằng số và việc nên làm. Xếp: xấu trước, cảnh báo, rồi điểm tốt.</p>';
    o += bt.map(function(x){
      var gp = x.donBay ? (V().DON_BAY_GP[x.donBay] || []).map(function(ma){ var vd = G.TU && G.TU.VAN_DE[ma]; return vd ? '<button class="btn ghost sm" data-ttd="mo-vd-ngoai" data-v2="'+ma+'">'+h(vd.ten)+'</button>' : ''; }).join('') : '';
      return '<div class="card pad-sm mb" style="border-left:5px solid '+MAU[x.muc]+'"><div class="co-hang">'+the(x.muc, x.muc === 'tot' ? 'Tốt' : x.muc === 'xau' ? 'Xấu' : 'Cảnh báo')+'<b class="co-grow">'+h(x.ten)+'</b>'+(x.the ? '<button class="btn ghost sm" data-v20="tab" data-v2="'+x.the+'">Xem căn cứ</button>' : '')+'</div>'+
        '<p class="sm" style="margin:6px 0 2px"><span class="muted">Căn cứ:</span> '+h(x.canCu)+'</p><p class="sm" style="margin:0"><b>Nên làm:</b> '+h(x.viec)+'</p>'+
        (gp ? '<div class="co-hang mt"><span class="tiny muted">Giải pháp có sẵn để giao:</span>'+gp+'</div>' : '')+'</div>';
    }).join('');
    return o;
  }
  function vNS(d){
    var c = d.chuoi, TH = d.thang, iL = TH.length - 2, dg = d.dong, cay = d.cay;
    var o = '<div class="grid g2 mb"><div class="card pad-sm"><div class="tiny muted">NORTH STAR · Nhà học tích cực mỗi tháng</div><div class="co-hang"><b style="font-size:30px">'+so(c.nhaTichCuc[iL])+'</b><span class="sm muted">'+h(thg(TH[iL]))+' · tháng này tạm '+so(dg.thangNay)+'</span></div>'+
      bieuDo(TH.slice(0, -1).concat(d.duBao.thang || []), c.nhaTichCuc.slice(0, -1), d.duBao && d.duBao.nhaTichCuc, { ten:'Nhà học tích cực' })+'<p class="tiny muted">Đường liền: tháng trọn · nét đứt và vùng nhạt: dự báo 3 tháng, khoảng 80%.</p></div>'+
      '<div class="card pad-sm"><b class="sm">Dòng chảy nhà tháng '+h(thg(dg.thang))+'</b><div class="mt">'+
        [['Đầu kỳ (tích cực tháng trước)', dg.dauKy, '#73849F'], ['Giữ lại', dg.giuLai, '#0B7350'], ['Mất (ngừng hoạt động)', dg.mat == null ? null : -dg.mat, '#BE0E16'], ['Mới hoặc quay lại', dg.moiVaQuayLai, '#185AB4'], ['Cuối kỳ', dg.cuoiKy, '#5140B4']].map(function(r){
          var mx = Math.max(dg.dauKy || 1, dg.cuoiKy || 1);
          return '<div class="mb"><div class="co-hang sm"><span class="co-grow">'+h(r[0])+'</span><b class="co-so" style="color:'+r[2]+'">'+(r[1] == null ? '—' : (r[1] > 0 && (r[0] === 'Mới hoặc quay lại') ? '+' : '')+so(r[1]))+'</b></div>'+U.bar(Math.round(100 * Math.abs(r[1] || 0) / mx), r[2])+'</div>'; }).join('')+'</div></div></div>';
    o += U.sec('Cây động lực doanh thu', 'Doanh thu = số nhà trả tiền × thu trung bình mỗi nhà · tháng '+thg(cay.thang)+' so '+thg(cay.thangTruoc));
    var t = cay.tach || {};
    o += '<div class="card pad-sm mb"><div class="grid g3" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr))">'+
      '<div><div class="tiny muted">Doanh thu</div><b style="font-size:20px">'+tien(cay.thu)+'</b><div class="tiny">trước '+tien(cay.thuTruoc)+'</div></div>'+
      '<div><div class="tiny muted">= Nhà trả tiền</div><b style="font-size:20px">'+so(cay.nha)+'</b><div class="tiny">trước '+so(cay.nhaTruoc)+(cay.nhaMoiTra != null ? ' · mới '+cay.nhaMoiTra+' / cũ '+cay.nhaCuTra : '')+'</div></div>'+
      '<div><div class="tiny muted">× Thu TB mỗi nhà</div><b style="font-size:20px">'+tien(cay.tb)+'</b><div class="tiny">trước '+tien(cay.tbTruoc)+'</div></div></div>'+
      '<div class="mt"><div class="co-hang sm"><span class="co-grow">Thay đổi do <b>số nhà</b></span><b class="co-so" style="color:'+((t.phanSoNha || 0) >= 0 ? '#0B7350' : '#BE0E16')+'">'+((t.phanSoNha || 0) >= 0 ? '+' : '')+tien(t.phanSoNha)+'</b></div>'+
      '<div class="co-hang sm"><span class="co-grow">Thay đổi do <b>thu trung bình</b></span><b class="co-so" style="color:'+((t.phanTrungBinh || 0) >= 0 ? '#0B7350' : '#BE0E16')+'">'+((t.phanTrungBinh || 0) >= 0 ? '+' : '')+tien(t.phanTrungBinh)+'</b></div>'+
      '<div class="co-hang sm"><span class="co-grow"><b>Tổng thay đổi</b></span><b class="co-so">'+((t.tong || 0) >= 0 ? '+' : '')+tien(t.tong)+'</b></div></div></div>';
    o += U.sec('Doanh thu 12 tháng + dự báo', '') + '<div class="card pad-sm mb">'+bieuDo(TH.slice(0, -1).concat(d.duBao.thang || []), c.thu.slice(0, -1), d.duBao && d.duBao.thu, { ten:'Doanh thu', tien:true })+
      '<p class="tiny muted">Tháng đang chạy ('+h(thg(d.tam.thang))+'): đã thu '+tien(d.tam.thu)+' sau '+d.tam.ngayQua+'/'+d.tam.ngayThang+' ngày → nhịp chạy cả tháng ≈ '+tien(d.tam.thuNhip)+'.</p></div>';
    return o;
  }
  function vKT(d){
    var k = d.ktDonVi;
    var o = '<div class="grid g4 mb">'+U.stat({ k:'LTV — giá trị vòng đời', v:trieu(k.ltv), d:'~'+so(k.tuoiDoi)+' tháng × '+tien(k.arpuTichCuc)+'/tháng', c:'#0B7350' })+
      U.stat({ k:'CAC — chi thu hút 1 nhà', v:trieu(k.cac), d:tien(k.chiThuHut)+' / '+so(k.nhaMoi3)+' nhà (3 tháng)', c:'#B4720F' })+
      U.stat({ k:'LTV / CAC', v:k.ltvCac == null ? '—' : so(k.ltvCac)+'×', d:'khoẻ khi ≥ 3', c:k.ltvCac >= 3 ? '#0B7350' : k.ltvCac >= 1 ? '#B4720F' : '#BE0E16' })+
      U.stat({ k:'Hoàn vốn thu hút', v:k.hoanVon == null ? '—' : so(k.hoanVon)+' th', d:'tốt khi ≤ 6 tháng' })+'</div>';
    o += '<div class="grid g4 mb">'+U.stat({ k:'ARPU', v:trieu(k.arpu), d:'thu TB mỗi nhà trả tiền/tháng' })+U.stat({ k:'Tỷ lệ rời / tháng', v:k.churn == null ? '—' : so(k.churn)+'%', d:'TB 3 tháng trọn', c:k.churn > 15 ? '#BE0E16' : '#185AB4' })+
      U.stat({ k:'Tuổi đời ước tính', v:k.tuoiDoi == null ? '—' : so(k.tuoiDoi)+' th', d:'= 1 ÷ tỷ lệ rời (trần 36)' })+U.stat({ k:'Biên thu − chi', v:k.bienGop == null ? '—' : so(k.bienGop)+'%', d:'3 tháng trọn' })+'</div>';
    o += U.sec('Nhóm khách theo tháng vào học', 'Tỷ lệ còn học tích cực sau 0–5 tháng · LTV đến nay mỗi nhà');
    o += '<div class="co-tb mb"><table><thead><tr><th>Tháng vào</th><th>Số nhà</th>'+[0,1,2,3,4,5].map(function(k){ return '<th>Tháng '+k+'</th>'; }).join('')+'<th>LTV đến nay</th></tr></thead><tbody>'+(d.nhom||[]).map(function(n){
      return '<tr><td><b>'+h(thg(n.thang))+'</b></td><td class="so">'+so(n.soNha)+'</td>'+n.giu.map(function(g){ return g == null ? '<td class="tiny muted">·</td>' : '<td class="so" style="background:color-mix(in srgb,#0B7350 '+Math.round(g * 0.55)+'%,transparent)">'+so(g)+'%</td>'; }).join('')+'<td class="so">'+trieu(n.ltvHienTai)+'</td></tr>'; }).join('')+'</tbody></table></div>';
    o += '<p class="tiny muted">Đọc theo hàng: nhóm nào giữ chân tốt hơn cho biết chương trình / mùa tuyển nào hiệu quả. Đọc theo cột: tháng thứ mấy nhà hay rời nhất — đặt điểm chạm chăm sóc ngay trước tháng đó.</p>';
    return o;
  }
  function vPheu(d){
    var p = d.pheu || [], mx = (p[0] && p[0].n) || 1;
    var hep = p.filter(function(x){ return x.tyLe != null; }).sort(function(a, b){ return a.tyLe - b.tyLe; })[0];
    var o = '<p class="sm muted" style="margin-top:0">90 ngày gần nhất, đi từ đăng ký tới lên tầng. Tỷ lệ ghi ở mỗi bước là so với bước liền trước.</p><div class="card pad-sm mb">';
    o += p.map(function(x){ var w = Math.max(4, Math.round(100 * (x.n || 0) / mx)), lahep = hep && hep.ma === x.ma;
      return '<div class="mb"><div class="co-hang sm"><span class="co-grow"><b>'+h(x.ten)+'</b>'+(lahep ? ' '+the('xau', 'chỗ hẹp nhất') : '')+'</span><b class="co-so">'+so(x.n)+'</b>'+(x.tyLe != null ? '<span class="tiny" style="min-width:56px;text-align:right;color:'+(x.tyLe >= 50 ? '#0B7350' : x.tyLe >= 25 ? '#B4720F' : '#BE0E16')+'">'+so(x.tyLe)+'%</span>' : '<span style="min-width:56px"></span>')+'</div>'+
        '<div style="height:14px;border-radius:7px;background:color-mix(in srgb,#185AB4 12%,transparent)"><div style="height:14px;width:'+w+'%;border-radius:7px;background:'+(lahep ? '#BE0E16' : '#185AB4')+'"></div></div></div>'; }).join('');
    o += '</div>';
    if(hep){ var map = { kichHoat:'tv2', vaoHoc:'tv5', traTien:'tc5', tichCuc:'kh1', lenTang:'co7' }, vd = G.TU && G.TU.VAN_DE[map[hep.ma]];
      if(vd) o += '<div class="card pad-sm"><b class="sm">Sửa chỗ hẹp nhất trước:</b> <span class="sm">'+h(vd.ten)+'</span><div class="co-hang mt"><button class="btn sm" data-ttd="mo-vd-ngoai" data-v2="'+map[hep.ma]+'">Xem '+vd.gp.length+' giải pháp & giao triển khai</button></div></div>'; }
    return o;
  }
  var NHAN_DC = { lead:['Lead mỗi tháng', -50, 100, 5, '%', 0.01], kichHoat:['Tỷ lệ kích hoạt', -20, 20, 1, ' điểm %', 0.01], vaoHoc:['Lead kích hoạt → vào học', -20, 20, 1, ' điểm %', 0.01],
    giuChan:['Giữ chân hằng tháng', -10, 10, 1, ' điểm %', 0.01], traTien:['Nhà tích cực có trả tiền', -20, 20, 1, ' điểm %', 0.01], arpu:['Thu TB mỗi nhà', -30, 50, 5, '%', 0.01] };
  function ketQuaKB(d){
    var co = d.coSo, dc = {}; Object.keys(st.dc).forEach(function(k){ dc[k] = (st.dc[k] || 0) * NHAN_DC[k][5]; });
    var a = V().moPhong(co, {}, 12), b = V().moPhong(co, dc, 12);
    var mocs = [2, 5, 11];
    return '<div class="grid g3 mb">'+mocs.map(function(i){ var dt = b.thu[i] - a.thu[i];
      return '<div class="card pad-sm"><div class="tiny muted">Tháng thứ '+(i + 1)+'</div><b>'+trieu(b.thu[i])+'</b> <span class="tiny" style="color:'+(dt >= 0 ? '#0B7350' : '#BE0E16')+'">'+(dt >= 0 ? '+' : '')+trieu(dt)+'</span><div class="tiny muted">'+so(b.nha[i])+' nhà tích cực (gốc '+so(a.nha[i])+')</div></div>'; }).join('')+'</div>'+
      '<div class="card pad-sm mb"><b class="sm">Tổng thu 12 tháng: '+tien(b.tongThu)+'</b> <span class="sm" style="color:'+(b.tongThu >= a.tongThu ? '#0B7350' : '#BE0E16')+'">('+(b.tongThu >= a.tongThu ? '+' : '')+tien(b.tongThu - a.tongThu)+' so kịch bản giữ nguyên)</span></div>';
  }
  function vDB(d){
    var co = d.coSo || {};
    var o = U.sec('Dự báo 3 tháng tới', 'Làm trơn hàm mũ kép (Holt) trên 12 tháng trọn · khoảng tin cậy 80%');
    o += '<div class="co-tb mb"><table><thead><tr><th>Chỉ số</th>'+(d.duBao.thang || []).map(function(t){ return '<th>'+h(thg(t))+'</th>'; }).join('')+'<th>Xu hướng / tháng</th></tr></thead><tbody>'+
      [['thu','Doanh thu',true],['nhaTichCuc','Nhà học tích cực'],['nhaMoi','Nhà mới'],['lead','Lead'],['chi','Chi',true]].map(function(r){ var f = d.duBao[r[0]];
        return '<tr><td><b>'+h(r[1])+'</b></td>'+(f ? f.duBao.map(function(v, k){ return '<td class="so">'+(r[2] ? trieu(v) : so(Math.round(v)))+'<div class="tiny muted">'+(r[2] ? trieu(f.duoi[k]) + '–' + trieu(f.tren[k]) : so(Math.round(f.duoi[k])) + '–' + so(Math.round(f.tren[k])))+'</div></td>'; }).join('') : '<td colspan="3" class="tiny muted">chưa đủ 3 tháng dữ liệu</td>')+
          '<td class="so" style="color:'+(f && f.xuHuong >= 0 ? '#0B7350' : '#BE0E16')+'">'+(f ? (f.xuHuong >= 0 ? '+' : '')+(r[2] ? trieu(f.xuHuong) : so(f.xuHuong)) : '—')+'</td></tr>'; }).join('')+'</tbody></table></div>';
    var dn = V().doNhay(co, 12);
    o += U.sec('Độ nhạy — đòn bẩy nào lớn nhất', 'Tăng riêng từng đòn bẩy 10% (giữ chân: giảm 10% số nhà rời) → tổng thu 12 tháng đổi bao nhiêu');
    var mx = Math.max.apply(null, dn.map(function(x){ return Math.abs(x.pt || 0); }).concat([1]));
    o += '<div class="card pad-sm mb">'+dn.map(function(x, i){ return '<div class="mb"><div class="co-hang sm"><span class="co-grow">'+(i === 0 ? '<b>' : '')+h(x.ten)+(i === 0 ? '</b> '+the('tot', 'lớn nhất') : '')+'</span><b class="co-so">'+(x.pt == null ? '—' : '+'+so(x.pt)+'%')+'</b></div>'+U.bar(Math.round(100 * Math.abs(x.pt || 0) / mx), i === 0 ? '#0B7350' : '#185AB4')+'</div>'; }).join('')+
      (dn[0] && V().DON_BAY_GP[dn[0].ma] ? '<div class="co-hang mt"><span class="tiny muted">Giải pháp cho đòn bẩy này:</span>'+V().DON_BAY_GP[dn[0].ma].map(function(ma){ var vd = G.TU && G.TU.VAN_DE[ma]; return vd ? '<button class="btn ghost sm" data-ttd="mo-vd-ngoai" data-v2="'+ma+'">'+h(vd.ten)+'</button>' : ''; }).join('')+'</div>' : '')+'</div>';
    o += U.sec('Mô phỏng kịch bản', 'Kéo các đòn bẩy — kết quả tính lại ngay. Cơ số = 3 tháng trọn gần nhất.');
    o += '<div class="card pad-sm mb"><div class="tiny muted mb">Cơ số: '+so(co.lead)+' lead/tháng · kích hoạt '+so(100 * co.kichHoat)+'% · vào học '+so(100 * co.vaoHoc)+'% · '+so(co.nha)+' nhà tích cực · giữ chân '+so(100 * co.giuChan)+'% · trả tiền '+so(100 * co.traTien)+'% · ARPU '+tien(co.arpu)+'</div>'+
      Object.keys(NHAN_DC).map(function(k){ var n = NHAN_DC[k], v = st.dc[k] || 0;
        return '<label class="co-hang sm mb" style="gap:10px"><span style="min-width:190px">'+h(n[0])+'</span><input type="range" min="'+n[1]+'" max="'+n[2]+'" step="'+n[3]+'" value="'+v+'" data-v20-dc="'+k+'" style="flex:1;min-width:120px" aria-label="'+h(n[0])+'"><b class="co-so" id="v20-dcv-'+k+'" style="min-width:86px;text-align:right">'+(v > 0 ? '+' : '')+v+h(n[4])+'</b></label>'; }).join('')+
      '<button class="btn ghost sm" data-v20="dc-0">Đặt lại</button></div><div id="v20-kb">'+ketQuaKB(d)+'</div>';
    return o;
  }
  function vBT(d){
    var b = d.batThuong || [];
    var o = '<p class="sm muted" style="margin-top:0">Mỗi chỉ số so ngày hôm qua với 28 ngày trước đó bằng "z bền" (trung vị và độ lệch tuyệt đối trung vị — không bị một ngày đột biến kéo lệch). |z| ≥ 3 đỏ · ≥ 2 vàng. Cột tuần so 7 ngày gần nhất với trung bình 4 tuần trước.</p>';
    o += '<div class="co-tb mb"><table><thead><tr><th>Chỉ số</th><th>Hôm qua</th><th>z</th><th>30 ngày</th><th>7 ngày / TB 4 tuần</th><th></th></tr></thead><tbody>'+b.map(function(x){
      var tienTe = x.ma === 'thu' || x.ma === 'chi';
      return '<tr><td><b>'+h(x.ten)+'</b></td><td class="so">'+(tienTe ? trieu(x.homQua) : so(x.homQua))+'</td><td>'+(x.muc === 'chuaDo' ? '<span class="tiny muted">chưa đo</span>' : the(x.muc, (x.z > 0 ? '+' : '')+so(x.z)))+'</td>'+
        '<td>'+tiaNho(x.chuoi, x.muc)+'</td><td class="so">'+(tienTe ? trieu(x.tuan) : so(x.tuan))+' / '+(tienTe ? trieu(x.tbTuan) : so(x.tbTuan))+(x.doiTuan != null ? ' <span class="tiny" style="color:'+(x.doiTuan >= 0 ? '#0B7350' : '#BE0E16')+'">'+(x.doiTuan >= 0 ? '+' : '')+so(x.doiTuan)+'%</span>' : '')+'</td>'+
        '<td><button class="btn ghost sm" data-v="'+h(x.man)+'">Mở</button></td></tr>'; }).join('')+'</tbody></table></div>';
    o += '<p class="tiny muted">Đỏ không có nghĩa là xấu: tiền thu tăng vọt cũng đỏ. Đỏ nghĩa là "khác thường — cần một người nhìn vào": sự cố, chiến dịch, hay lỗi ghi số.</p>';
    return o;
  }
  function vMT(d){
    canMT(); var M = st.mt, ql = lv() <= 2, v20 = giaTriV20(d);
    var o = '<p class="sm muted" style="margin-top:0">Mỗi mục tiêu chiến lược gắn MỘT chỉ số đo được. Máy so tiến độ với kỳ vọng theo thời gian và dự báo giá trị tại hạn → Đúng hướng · Chậm (dự báo vẫn kịp) · Nguy cơ trượt · Đã đạt. Tốt nhất 3–5 mục tiêu mỗi quý.</p>';
    if(!M || !M.ok) return o + (choTai('mt') || '');
    if(ql) o += st.themMT ? formMT(v20) : '<button class="btn pri sm mb" data-v20="them-mt">'+ic('target','w-3 h-3')+'Đặt mục tiêu chiến lược</button>';
    if(!M.ds.length) return o + '<div class="card pad-sm"><b>Chưa có mục tiêu chiến lược nào.</b>'+(M.mau ? ' <span class="tiny muted">Tài khoản mẫu: mục tiêu đặt thử chỉ nằm trên máy này.</span>' : '')+'</div>';
    return o + M.ds.map(function(m){
      var cs = V().CHI_SO[m.chiSo], ten = cs ? cs[0] : ((G.TU && G.TU.KPI.filter(function(k){ return k.ma === m.chiSo; })[0]) || { ten:m.chiSo }).ten, dv = cs ? cs[1] : '';
      var dg = V().TEN_DANH_GIA[m.danhGia || (m.trangThai === 'huy' ? 'huy' : 'chuaDo')] || ['—', '#73849F'];
      var td = m.tienDo == null ? 0 : Math.max(0, Math.min(100, m.tienDo));
      return '<div class="card pad-sm mb" style="border-left:5px solid '+dg[1]+'"><div class="co-hang"><b class="co-grow">'+h(m.ten)+'</b><span class="co-tag" style="color:'+dg[1]+';background:color-mix(in srgb,'+dg[1]+' 13%,transparent)">'+h(dg[0])+'</span></div>'+
        '<div class="tiny muted mt">'+h(ten)+': đầu '+gtChiSo(dv, m.giaTriDau)+' → hiện tại <b>'+gtChiSo(dv, m.hienTai)+'</b> → mục tiêu '+gtChiSo(dv, m.mucTieu)+' · hạn '+h(m.hanLuc)+(m.duBaoTaiHan != null ? ' · dự báo tại hạn '+gtChiSo(dv, m.duBaoTaiHan) : '')+(m.chuSo ? ' · chủ sở hữu '+h(m.chuSo) : '')+'</div>'+
        '<div style="position:relative;margin-top:8px">'+U.bar(td, dg[1])+(m.kyVong != null ? '<i title="Kỳ vọng theo thời gian" style="position:absolute;top:-3px;left:'+m.kyVong+'%;width:2px;height:14px;background:var(--ink,#123)"></i>' : '')+'</div>'+
        '<div class="co-hang tiny muted"><span>tiến độ '+(m.tienDo == null ? '—' : so(m.tienDo)+'%')+'</span><span>kỳ vọng tới hôm nay '+(m.kyVong == null ? '—' : so(m.kyVong)+'%')+'</span></div>'+
        (ql && m.trangThai === 'dang' ? '<div class="co-hang mt"><button class="btn ghost sm" data-v20="mt-dat" data-v2="'+h(m.id)+'">Đánh dấu đạt</button><button class="btn ghost sm" data-v20="mt-huy" data-v2="'+h(m.id)+'">Huỷ</button><button class="btn ghost sm" data-v20="mt-doi" data-v2="'+h(m.id)+'">Đổi mục tiêu / hạn</button></div>' : '')+'</div>';
    }).join('');
  }
  function formMT(v20){
    var opts = Object.keys(V().CHI_SO).map(function(k){ return '<option value="'+k+'" data-gt="'+(v20[k] == null ? '' : v20[k])+'">V20 · '+h(V().CHI_SO[k][0])+'</option>'; }).join('') +
      ((G.TU && G.TU.KPI) || []).filter(function(k){ return k.kieu !== 'theoDoi'; }).map(function(k){ return '<option value="'+k.ma+'" data-gt="">Trung tâm · '+h(k.ten)+'</option>'; }).join('');
    var han = new Date(); han.setMonth(han.getMonth() + 3);
    return '<div class="card pad-sm mb" style="border:1px dashed #185AB4"><b class="sm">Mục tiêu chiến lược mới</b><div class="co-form mt">'+
      '<label class="co-f"><span>Tên mục tiêu</span><input class="inp" id="v20-mt-ten" placeholder="VD: Tăng nhà học tích cực lên 200 trong quý"></label>'+
      '<label class="co-f"><span>Chỉ số đo</span><select class="inp" id="v20-mt-cs" data-v20-ch="cs">'+opts+'</select></label>'+
      '<label class="co-f"><span>Giá trị đầu (hiện tại)</span><input class="inp" id="v20-mt-dau" value="'+(v20.nhaTichCuc == null ? '' : v20.nhaTichCuc)+'"></label>'+
      '<label class="co-f"><span>Mục tiêu</span><input class="inp" id="v20-mt-muc"></label>'+
      '<label class="co-f"><span>Hạn</span><input class="inp" type="date" id="v20-mt-han" value="'+han.toISOString().slice(0, 10)+'"></label>'+
      '<label class="co-f"><span>Chủ sở hữu (tên đăng nhập)</span><input class="inp" id="v20-mt-chu"></label></div>'+
      '<div class="co-hang mt"><button class="btn pri sm" data-v20="luu-mt">Lưu mục tiêu</button><button class="btn ghost sm" data-v20="huy-mt">Thôi</button></div></div>';
  }
  function vDL(d){
    var TT = { tuoi:['Tươi (≤ 3 ngày)','#0B7350'], cu:['Cũ (≤ 14 ngày)','#B4720F'], ngu:['Ngủ (> 14 ngày)','#BE0E16'], trong:['Trống','#73849F'], thieuBang:['Chưa có bảng','#73849F'] };
    var o = '<div class="card pad-sm mb"><div class="co-hang">'+U.ring(d.tinCay || 0, d.tinCay >= 75 ? '#0B7350' : d.tinCay >= 50 ? '#B4720F' : '#BE0E16', 'tin cậy')+'<div class="co-grow"><b>Độ tin cậy dữ liệu '+so(d.tinCay)+'/100</b><p class="sm muted" style="margin:4px 0 0">60% độ tươi của 15 nguồn + 40% độ đầy đủ của các trường then chốt. Chiến lược đặt trên số cũ hoặc thiếu là chiến lược đặt trên cát.</p></div></div></div>';
    o += '<div class="co-tb mb"><table><thead><tr><th>Nguồn</th><th>Số dòng</th><th>Lần ghi cuối</th><th>Tình trạng</th></tr></thead><tbody>'+(d.nguon||[]).map(function(n){ var t = TT[n.tt] || ['—','#73849F'];
      return '<tr><td><b>'+h(n.ten)+'</b> <span class="tiny muted">'+h(n.bang)+'</span></td><td class="so">'+so(n.so)+'</td><td class="tiny">'+(n.ngayCu == null ? '—' : n.ngayCu === 0 ? 'hôm nay' : n.ngayCu+' ngày trước')+'</td><td>'+the(n.tt === 'tuoi' ? 'tot' : n.tt === 'cu' ? 'canhBao' : 'xau', t[0])+'</td></tr>'; }).join('')+'</tbody></table></div>';
    o += U.sec('Độ đầy đủ của trường then chốt', '') + '<div class="card pad-sm mb">'+(d.du||[]).map(function(x){ return '<div class="mb"><div class="co-hang sm"><span class="co-grow">'+h(x.ten)+'</span><b class="co-so">'+(x.pt == null ? '—' : so(x.pt)+'%')+'</b><span class="tiny muted">'+so(x.co)+'/'+so(x.tong)+'</span></div>'+U.bar(x.pt || 0, (x.pt || 0) >= 90 ? '#0B7350' : (x.pt || 0) >= 70 ? '#B4720F' : '#BE0E16')+'</div>'; }).join('')+'</div>';
    return o;
  }

  X.TABS = [['bt0','Bản tin chiến lược','star'],['ns','North Star & động lực','target'],['kt2','Đơn vị kinh tế & nhóm khách','vault'],['ph','Phễu','filter'],['db','Dự báo & kịch bản','chart'],['bt','Bất thường','alert'],['mt','Mục tiêu chiến lược','target'],['dl','Độ tin cậy dữ liệu','shield']];
  X.ve = function(){
    var ai = String((G.S && G.S.acc && G.S.acc.u) || '') + '|' + lv();
    if(st.ai !== ai){ st = { ai:ai, tab:'bt0', d:null, mt:null, tai:{}, loi:{}, dc:{}, themMT:false }; }
    if(!V()) return U.lockCard('Thiếu tham số V20.');
    var o = '<div class="co-tabs" role="tablist">'+X.TABS.map(function(x){ return '<button class="co-tab'+(st.tab===x[0]?' on':'')+'" role="tab" data-v20="tab" data-v2="'+x[0]+'">'+ic(x[2],'w-3 h-3')+h(x[1])+'</button>'; }).join('')+'</div>';
    o += '<div class="co-hang mb"><span class="tiny muted">12 tháng trọn + tháng đang chạy · '+(st.d && st.d.mau ? 'ví dụ minh hoạ' : 'dữ liệu máy chủ')+' · công thức '+h(V().PHIEN_BAN_V20)+'</span><button class="btn ghost sm" data-v20="lam-moi">'+ic('orbit','w-3 h-3')+'Tính lại</button></div>';
    canD(); var d = st.d;
    if(!d || !d.ok) return o + (choTai('d') || '<p class="sm muted">Chưa có số liệu.</p>');
    return o + (st.tab === 'ns' ? vNS(d) : st.tab === 'kt2' ? vKT(d) : st.tab === 'ph' ? vPheu(d) : st.tab === 'db' ? vDB(d) : st.tab === 'bt' ? vBT(d) : st.tab === 'mt' ? vMT(d) : st.tab === 'dl' ? vDL(d) : vBanTin(d));
  };

  function luuMauMT(m){ st.mt.ds.unshift(Object.assign(m, { id:'MAU-' + Date.now().toString(36), trangThai:'dang', tuLuc:new Date().toISOString().slice(0, 10) })); var x = st.mt.ds[0]; var t = V().tienDo(x, x.hienTai, new Date().toISOString().slice(0, 10), null); x.tienDo = t.tienDo; x.kyVong = t.kyVong; x.danhGia = t.trangThai; }
  document.addEventListener('click', function(e){
    var el = e.target.closest && e.target.closest('[data-v20]'); if(!el) return;
    var a = el.getAttribute('data-v20'), v = el.getAttribute('data-v2'); e.preventDefault();
    if(a === 'tab') st.tab = v;
    else if(a === 'lam-moi'){ st.d = null; st.mt = null; }
    else if(a === 'dc-0') st.dc = {};
    else if(a === 'them-mt') st.themMT = true;
    else if(a === 'huy-mt') st.themMT = false;
    else if(a === 'luu-mt'){
      var g = function(id){ return String((document.getElementById(id) || {}).value || '').trim(); };
      var m = { ten:g('v20-mt-ten'), chiSo:g('v20-mt-cs'), giaTriDau:Number(g('v20-mt-dau')), mucTieu:Number(g('v20-mt-muc')), hanLuc:g('v20-mt-han'), chuSo:g('v20-mt-chu') };
      if(m.ten.length < 5 || !isFinite(m.giaTriDau) || !isFinite(m.mucTieu) || g('v20-mt-muc') === '' || m.giaTriDau === m.mucTieu){ U.toast('Điền tên (≥ 5 ký tự), giá trị đầu và mục tiêu khác nhau.', 'err'); return; }
      if(!coMayChu()){ m.hienTai = m.giaTriDau; luuMauMT(m); st.themMT = false; U.toast('Đã đặt (ví dụ — không lưu máy chủ).', 'ok'); veLai(); return; }
      G.goiMayChu('taoMucTieuCL', m).then(function(r){ if(r && r.ok){ U.toast('Đã đặt mục tiêu chiến lược.', 'ok'); st.themMT = false; st.mt = null; } else U.toast((r && r.error) || 'Chưa lưu được.', 'err'); veLai(); });
      return;
    }
    else if(a === 'mt-dat' || a === 'mt-huy' || a === 'mt-doi'){
      var than = { id:v };
      if(a === 'mt-dat') than.trangThai = 'dat';
      if(a === 'mt-huy') than.trangThai = 'huy';
      if(a === 'mt-doi'){ var muc = window.prompt('Mục tiêu mới (để trống nếu giữ):', ''); if(muc === null) return; var han = window.prompt('Hạn mới YYYY-MM-DD (để trống nếu giữ):', ''); if(han === null) return; var ly = window.prompt('Lý do đổi (ít nhất 10 ký tự):', ''); if(!ly) return; than.mucTieu = muc; if(han) than.hanLuc = han; than.lyDo = ly; }
      if(!coMayChu()){ st.mt.ds.forEach(function(m){ if(m.id === v){ if(than.trangThai){ m.trangThai = than.trangThai; m.danhGia = than.trangThai === 'huy' ? 'huy' : 'dat'; } if(than.mucTieu) m.mucTieu = Number(than.mucTieu); if(than.hanLuc) m.hanLuc = than.hanLuc; } }); veLai(); return; }
      G.goiMayChu('capNhatMucTieuCL', than).then(function(r){ if(r && r.ok){ U.toast('Đã cập nhật mục tiêu.', 'ok'); st.mt = null; } else U.toast((r && r.error) || 'Chưa cập nhật được.', 'err'); veLai(); });
      return;
    }
    veLai();
  });
  document.addEventListener('input', function(e){
    var el = e.target.closest && e.target.closest('[data-v20-dc]'); if(!el || !st.d) return;
    var k = el.getAttribute('data-v20-dc'), v = Number(el.value); st.dc[k] = v;
    var lb = document.getElementById('v20-dcv-' + k); if(lb) lb.textContent = (v > 0 ? '+' : '') + v + NHAN_DC[k][4];
    var kb = document.getElementById('v20-kb'); if(kb) kb.innerHTML = ketQuaKB(st.d);
  });
  document.addEventListener('change', function(e){
    var el = e.target.closest && e.target.closest('[data-v20-ch="cs"]'); if(!el) return;
    var o = el.options[el.selectedIndex], dau = document.getElementById('v20-mt-dau');
    if(dau && o) dau.value = o.getAttribute('data-gt') || '';
  });
})();
