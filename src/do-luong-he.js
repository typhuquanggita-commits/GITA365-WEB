/* ═══════════════════════════════════════════════════════════════
   GITA 365 — ĐO LƯỜNG TOÀN DIỆN KHÁCH HÀNG (màn do-luong-he)

   Một màn cho đội dẫn dắt, sáu thẻ:
     Tổng quan tháng · Xếp hạng & phân tầng · Hồ sơ khách · Báo cáo tháng
     · Chăm sóc theo tầng · Công thức
   Số liệu thật đọc từ máy chủ (may-chu/do-luong-kh.js). Quyền ở máy chủ:
     R01–R05 cả hệ · Coach R06–R08 chỉ nhà mình phụ trách · R12 Phân tích
     dữ liệu chỉ xem báo cáo tháng BẢN ẨN DANH · chốt tháng R01–R04.
   Chưa có phiên máy chủ (tài khoản mẫu) thì màn dựng VÍ DỤ MINH HOẠ bằng
   chính công thức G.DL trên 12 nhà giả định — ghi rõ là ví dụ.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
(function(){
  var U = G.U, h = U.h, ic = U.ic, VIEW = 'do-luong-he';
  G.VIEWS = G.VIEWS || {};
  var st = { tab:'tong', thang:'', loc:'', xh:null, bc:null, ho:null, ls:null, hoMa:'', tai:{}, loi:{}, xacChot:false };
  var DIEM = [
    ['ganKet','Gắn kết','#185AB4'], ['tienBo','Tiến bộ','#0B7350'], ['haiLong','Hài lòng','#B4720F'],
    ['giaTri','Giá trị','#0B6675'], ['ruiRo','Rủi ro rời','#BE0E16'], ['tiemNang','Tiềm năng','#5140B4']
  ];

  function lv(){ var r = G.S && G.S.roleObj; return r ? r.lv : 99; }
  function quyen(){ var l = lv(); return { xh: l <= 8, bc: l <= 4 || l === 12, chot: l <= 4, ql: l <= 5, anDanh: l === 12 }; }
  G.xemDoLuongHe = function(){ var q = quyen(); return q.xh || q.bc; };
  function coMayChu(){ return typeof G.goiMayChu === 'function' && !!G.API_CAP_PHEP && !!G.PHIEN_TOKEN; }
  function so(n){ return n == null ? '—' : Math.round(Number(n) || 0).toLocaleString('vi-VN'); }
  function haiSo(n){ return (n < 10 ? '0' : '') + n; }
  function thangNay(){ var d = new Date(); return d.getFullYear() + '-' + haiSo(d.getMonth()+1); }
  function thangTruoc(t){ var a = t.split('-').map(Number); return a[1] === 1 ? (a[0]-1) + '-12' : a[0] + '-' + haiSo(a[1]-1); }
  function tenThang(t){ var a = String(t||'').split('-'); return a.length === 2 ? 'Tháng ' + (+a[1]) + '/' + a[0] : t; }
  function veLai(){ if(G.render && G.S && G.S.view === VIEW) G.render(); }
  function T(){ return (G.DL && G.DL.TANG_CS) || {}; }
  function chipTang(t){ var x = T()[t] || { ten:t, mau:'#73849F' }; return '<span class="co-tag" style="color:'+x.mau+';background:color-mix(in srgb,'+x.mau+' 13%,transparent)" title="'+h(x.ten)+'">'+h(t)+' · '+h(String(x.ten).split(' · ')[0])+'</span>'; }
  function oDiem(v, mau, nguoc){
    if(v == null) return '<span class="tiny muted">chưa có</span>';
    var c = nguoc ? (v >= 60 ? '#BE0E16' : v >= 40 ? '#B4720F' : '#0B7350') : mau;
    return '<div style="min-width:64px"><b class="co-so" style="color:'+c+'">'+v+'</b>'+U.bar(v, c)+'</div>';
  }

  /* ═══════════ VÍ DỤ MINH HOẠ (không có phiên máy chủ) ═══════════ */
  var mau = null;
  function dungMau(){
    if(mau && mau.lv === lv()) return mau;
    var DL = G.DL, thang = thangNay(), soNgay = new Date().getDate();
    var goc = [
      ['VD-01',4,'coach.an',  { ngayHoatDong:22, phutHocApp:720, ngayTick:21, soBaoCao:13, viecDuyet:11, hoanThanh:12, diemTB:86, lenTang:true, nps:10, csat:5, camXuc:4.5, ltv:40000000, imLang:0, gioiThieu:2 }],
      ['VD-02',3,'coach.an',  { ngayHoatDong:19, phutHocApp:610, ngayTick:18, soBaoCao:11, viecDuyet:9, hoanThanh:10, diemTB:78, nps:9, csat:5, camXuc:4, ltv:13000000, imLang:1, gioiThieu:1 }],
      ['VD-03',3,'coach.binh',{ ngayHoatDong:17, phutHocApp:480, ngayTick:15, soBaoCao:9, viecDuyet:8, hoanThanh:8, diemTB:74, nps:8, csat:4, camXuc:3.5, ltv:13000000, imLang:2 }],
      ['VD-04',2,'coach.binh',{ ngayHoatDong:15, phutHocApp:420, ngayTick:14, soBaoCao:7, viecDuyet:6, hoanThanh:7, diemTB:70, nps:8, csat:4, ltv:3000000, imLang:1 }],
      ['VD-05',2,'coach.an',  { ngayHoatDong:12, phutHocApp:300, ngayTick:10, soBaoCao:6, viecDuyet:4, hoanThanh:5, diemTB:66, nps:7, csat:4, ltv:3000000, imLang:3 }],
      ['VD-06',5,'coach.chi', { ngayHoatDong:14, phutHocApp:380, ngayTick:12, soBaoCao:8, viecDuyet:6, hoanThanh:6, diemTB:81, nps:9, csat:4, ltv:93000000, imLang:2, gioiThieu:1 }],
      ['VD-07',3,'coach.chi', { ngayHoatDong:6, phutHocApp:120, ngayTick:4, soBaoCao:2, viecDuyet:1, hoanThanh:2, diemTB:55, nps:5, csat:2, camXuc:2, ltv:13000000, no:5000000, imLang:12, band:'DO' }],
      ['VD-08',2,'coach.binh',{ ngayHoatDong:4, phutHocApp:60, ngayTick:3, soBaoCao:1, viecDuyet:0, hoanThanh:1, diemTB:48, nps:4, csat:2, ltv:3000000, no:1500000, imLang:15, band:'DO' }],
      ['VD-09',1,'coach.an',  { ngayHoatDong:9, phutHocApp:240, ngayTick:7, soBaoCao:3, viecDuyet:2, hoanThanh:3, ltv:0, imLang:1, moi:true }],
      ['VD-10',1,'coach.chi', { ngayHoatDong:0, phutHocApp:0, ngayTick:0, soBaoCao:0, viecDuyet:0, ltv:0, imLang:26 }],
      ['VD-11',3,'coach.binh',{ ngayHoatDong:11, phutHocApp:260, ngayTick:9, soBaoCao:5, viecDuyet:4, hoanThanh:4, diemTB:62, nps:7, csat:3, ltv:13000000, imLang:4 }],
      ['VD-12',4,'coach.an',  { ngayHoatDong:16, phutHocApp:520, ngayTick:16, soBaoCao:10, viecDuyet:8, hoanThanh:9, diemTB:77, nps:9, csat:5, camXuc:4, ltv:43000000, imLang:1 }]
    ];
    var ds = goc.map(function(g){
      var d = g[3]; d.soNgayThang = 30; d.tang = g[1];
      var truoc = { ganKet: Math.min(100, (DL.chamDiem(d, null).ganKet || 0) + (d.imLang > 7 ? 35 : 3)) };
      var diem = DL.chamDiem(d, truoc), t = DL.xepTang(diem, d);
      return { maNha:g[0], tang:g[1], coach:g[2], band:d.band || 'XANH', tangCS:t, diem:diem, lyDo:DL.lyDo(diem, d),
        ngayHoatDong:d.ngayHoatDong, phutApp:Math.round(d.phutHocApp * 1.4), imLang:d.imLang, ltv:d.ltv, no:d.no || 0, moi:!!d.moi, d:d };
    }).sort(function(a, b){ return b.diem.tiemNang - a.diem.tiemNang || a.diem.ruiRo - b.diem.ruiRo; });
    ds.forEach(function(x, i){ x.hang = i + 1; });
    var dem = { A:0, B:0, C:0, D:0, E:0 }; ds.forEach(function(x){ dem[x.tangCS]++; });
    var tb = function(k){ var v = ds.map(function(x){ return x.diem[k]; }).filter(function(z){ return z != null; }); return v.length ? Math.round(v.reduce(function(s, z){ return s + z; }, 0) / v.length) : null; };
    var coNps = ds.filter(function(x){ return x.d.nps != null; });
    var bc = { ok:true, mau:true, thang:thang, soNha:ds.length, anDanh:quyen().anDanh,
      tb:{ ganKet:tb('ganKet'), tienBo:tb('tienBo'), haiLong:tb('haiLong'), giaTri:tb('giaTri'), ruiRo:tb('ruiRo'), tiemNang:tb('tiemNang') },
      hoatDong:{ tyLeHoatDong:Math.round(100 * ds.filter(function(x){ return x.ngayHoatDong > 0; }).length / ds.length), ngayHoatDongTB:13, phutAppTB:560, phutHocTB:390, hoanThanh:77, ngayTickTB:12, baoCao:85, viecDuyet:59, cham:96, lenTang:1 },
      taiChinh:quyen().anDanh ? null : { thuThang:58000000, soNhaNo:2, tongNo:6500000 },
      haiLong:{ soPhieu:coNps.length, nps:Math.round(100 * (coNps.filter(function(x){ return x.d.nps >= 9; }).length - coNps.filter(function(x){ return x.d.nps <= 6; }).length) / coNps.length), csatTB:4,
        binhLuan:quyen().anDanh ? [] : [{ maNha:'VD-01', nps:10, csat:5, ghiChu:'Con tự ngồi vào bàn đúng giờ 3 tuần liền.' }, { maNha:'VD-07', nps:5, csat:2, ghiChu:'Tuần này bận, không theo kịp việc hôm nay.' }] },
      tangCS:dem, theoTang:[1,2,3,4,5].map(function(t){ var x = ds.filter(function(z){ return z.tang === t; }); return { tang:t, soNha:x.length, ganKet:x.length ? Math.round(x.reduce(function(s, z){ return s + (z.diem.ganKet || 0); }, 0) / x.length) : null }; }),
      sanPham:{ man:[['khoa-dao-tao',2140,11],['hom-nay',1630,12],['nhat-ky',980,9],['sat-hach',720,8],['bang-so',540,10],['tro-ly',420,6],['ban-do',300,5],['su-kien',120,3]].map(function(m){ return { man:m[0], phut:m[1], soNha:m[2], nhom:G.DL.nhomCuaMan(m[0]) }; }),
        manItDung:[{ man:'tam-nhin', phut:14, soNha:1, nhom:'thucHanh' }, { man:'dai-su', phut:6, soNha:1, nhom:'ketNoi' }], nhom:{ hoc:3280, thucHanh:2910, baoCao:540, ketNoi:120, khac:200 } },
      top:ds.slice(0, 10).map(function(x){ return { ma:quyen().anDanh ? 'Nhà #' + x.hang : x.maNha, tangCS:x.tangCS, tiemNang:x.diem.tiemNang, lyDo:x.lyDo }; }),
      canCuu:ds.filter(function(x){ return x.tangCS === 'D'; }).map(function(x){ return { ma:quyen().anDanh ? 'Nhà #' + x.hang : x.maNha, ruiRo:x.diem.ruiRo, imLang:x.imLang, lyDo:x.lyDo, coach:quyen().anDanh ? '' : x.coach }; }) };
    var xh = { ok:true, mau:true, thang:thang, tong:ds.length, dem:dem, ds:ds };
    mau = { xh:xh, bc:bc, soNgay:soNgay, lv:lv() };
    return mau;
  }
  function hoMau(ma){
    var m = dungMau(), x = m.xh.ds.filter(function(z){ return z.maNha === ma; })[0] || m.xh.ds[0], DL = G.DL;
    var xu = [], t = thangNay(), cacThang = [];
    for(var i = 0; i < 6; i++){ cacThang.unshift(t); t = thangTruoc(t); }
    cacThang.forEach(function(th, i){
      var k = 0.55 + 0.09 * i, d = {}; Object.keys(x.d).forEach(function(z){ d[z] = x.d[z]; });
      ['ngayHoatDong','phutHocApp','ngayTick','soBaoCao','viecDuyet','hoanThanh'].forEach(function(z){ if(d[z] != null) d[z] = Math.round(d[z] * Math.min(1, k)); });
      var di = DL.chamDiem(d, null); xu.push({ thang:th, diem:di, tangCS:DL.xepTang(di, d), ngayHoatDong:d.ngayHoatDong });
    });
    var d = x.d;
    return { ok:true, mau:true, vai:'ql', ho:{ maNha:x.maNha, thang:thangNay(), tang:x.tang, coach:x.coach, band:x.band, soNgayThang:30, diem:x.diem, tangCS:x.tangCS,
      tenTangCS:T()[x.tangCS].ten, lyDo:x.lyDo, viecNen:T()[x.tangCS].viec, ngayHoatDong:d.ngayHoatDong, phutApp:x.phutApp, phutHocApp:d.phutHocApp, ngayTick:d.ngayTick,
      soBaoCao:d.soBaoCao, viecDuyet:d.viecDuyet, hoanThanh:d.hoanThanh, diemTB:d.diemTB, nps:d.nps, csat:d.csat, camXuc:d.camXuc, ltv:d.ltv, no:d.no || 0,
      imLang:d.imLang, dangNhap:d.ngayHoatDong, gioiThieu:d.gioiThieu || 0, lenTang:!!d.lenTang, nhatKy:Math.round((d.ngayHoatDong||0) * 0.6), creditThuong:(d.viecDuyet||0) * 500,
      cham:{ nhan:4, goi:2, wow:1 }, phutNhom:{ hoc:Math.round(d.phutHocApp), thucHanh:Math.round(d.phutHocApp * 0.3), baoCao:Math.round(d.phutHocApp * 0.06), ketNoi:Math.round(d.phutHocApp * 0.04), khac:0 } }, xuHuong:xu };
  }

  /* ═══════════ TẢI TỪ MÁY CHỦ ═══════════ */
  function tai(viec, fn, than, gan){
    if(!coMayChu() || st.tai[viec]) return;
    st.tai[viec] = 1; st.loi[viec] = '';
    G.goiMayChu(fn, than, { moi:true }).then(function(r){
      st.tai[viec] = 0;
      if(r && r.ok) gan(r); else { st.loi[viec] = (r && r.error) || 'Không đọc được.'; gan(null, true); }
      veLai();
    });
  }
  function canXH(){ if(st.xh || !quyen().xh) return; if(!coMayChu()) { st.xh = dungMau().xh; return; } tai('xh', 'xepHangKH', { thang:st.thang }, function(r, loi){ st.xh = r || { ok:false, ds:[], dem:{}, loi:1 }; }); }
  function canBC(){ if(st.bc || !quyen().bc) return; if(!coMayChu()) { st.bc = dungMau().bc; return; } tai('bc', 'baoCaoThangHe', { thang:st.thang }, function(r){ st.bc = r || { ok:false, loi:1 }; }); }
  function canHo(){
    if(!st.hoMa || (st.ho && st.ho.ho && st.ho.ho.maNha === st.hoMa && st.ho.thang === st.thang)) return;
    if(!coMayChu()){ st.ho = hoMau(st.hoMa); st.ho.thang = st.thang; st.ls = { ok:true, ds:[] }; return; }
    tai('ho', 'hoSoDoLuongKH', { maNha:st.hoMa, thang:st.thang }, function(r){ st.ho = r || { ok:false, loi:1, ho:{ maNha:st.hoMa } }; st.ho.thang = st.thang; });
    tai('ls', 'dsHoSoThang', { maNha:st.hoMa }, function(r){ st.ls = r || { ok:false, ds:[] }; });
  }

  /* ═══════════ MẢNH VẼ ═══════════ */
  function bieuDo(xu, cot){
    var W = 340, H = 150, l = 30, r = 22, t = 12, b = 26, n = xu.length;
    if(!n) return '';
    var x = function(i){ return l + (n === 1 ? (W - l - r) / 2 : i * (W - l - r) / (n - 1)); }, y = function(v){ return t + (100 - v) * (H - t - b) / 100; };
    var o = '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Xu hướng điểm 6 tháng" style="width:100%;max-width:520px;height:auto;color:var(--ink-3,#556)">';
    [0, 50, 100].forEach(function(v){ o += '<line x1="'+l+'" x2="'+(W-r)+'" y1="'+y(v)+'" y2="'+y(v)+'" stroke="currentColor" stroke-opacity=".18"/><text x="'+(l-6)+'" y="'+(y(v)+4)+'" font-size="10" text-anchor="end" fill="currentColor">'+v+'</text>'; });
    xu.forEach(function(p, i){ o += '<text x="'+x(i)+'" y="'+(H-8)+'" font-size="10" text-anchor="middle" fill="currentColor">'+h(String(p.thang).slice(5))+'/'+h(String(p.thang).slice(2,4))+'</text>'; });
    cot.forEach(function(c){
      var pts = xu.map(function(p, i){ var v = p.diem ? p.diem[c[0]] : p[c[0]]; return v == null ? null : [x(i), y(v)]; }).filter(Boolean);
      if(!pts.length) return;
      o += '<polyline fill="none" stroke="'+c[2]+'" stroke-width="2.2" stroke-linejoin="round" points="'+pts.map(function(p){ return p[0].toFixed(1)+','+p[1].toFixed(1); }).join(' ')+'"/>';
      var e = pts[pts.length-1]; o += '<circle cx="'+e[0].toFixed(1)+'" cy="'+e[1].toFixed(1)+'" r="3.6" fill="'+c[2]+'"/>';
    });
    o += '</svg><div class="co-hang tiny">'+cot.map(function(c){ return '<span class="co-hang" style="gap:5px"><i style="display:inline-block;width:12px;height:3px;border-radius:2px;background:'+c[2]+'"></i>'+h(c[1])+'</span>'; }).join('')+'</div>';
    return o;
  }
  function thanhChonThang(){
    return '<div class="co-hang mb"><label class="co-hang sm"><span class="muted">Tháng</span><input type="month" class="inp" style="width:auto" data-dl-ch="thang" value="'+h(st.thang)+'" max="'+thangNay()+'"></label>'+
      '<button class="btn ghost sm" data-dl="lam-moi">'+ic('orbit','w-3 h-3')+'Cập nhật</button>'+
      (st.thang === thangNay() ? '<span class="tiny muted">Tháng đang chạy — mục tiêu co theo số ngày đã qua.</span>' : '')+'</div>';
  }
  function bannerMau(){
    return coMayChu() ? '' : '<div class="co-mau">'+ic('alert','w-4 h-4')+'<span><b>Ví dụ minh hoạ.</b> 12 nhà giả định (mã VD-…), điểm tính bằng đúng công thức đang chạy ở máy chủ. Đăng nhập bằng tài khoản thật trên máy chủ của Học viện để xem khách thật.</span></div>';
  }
  function tabs(){
    var q = quyen(), ds = [['tong','Tổng quan tháng','chart', true], ['xh','Xếp hạng & phân tầng','list', q.xh], ['ho','Hồ sơ khách','user', q.xh],
      ['bc','Báo cáo tháng','book', q.bc], ['cs','Chăm sóc theo tầng','heart', q.xh], ['ct','Công thức','shield', true]];
    return '<div class="co-tabs" role="tablist">'+ds.filter(function(x){ return x[3]; }).map(function(x){ return '<button class="co-tab'+(st.tab===x[0]?' on':'')+'" role="tab" data-dl="tab" data-v2="'+x[0]+'">'+ic(x[2],'w-3 h-3')+h(x[1])+'</button>'; }).join('')+'</div>';
  }
  function choTai(viec){ return st.tai[viec] ? '<p class="sm muted">Đang đọc số liệu từ máy chủ…</p>' : st.loi[viec] ? '<div class="co-mau">'+ic('alert','w-4 h-4')+'<span>'+h(st.loi[viec])+'</span></div>' : ''; }
  function demTang(dem){
    return '<div class="grid g5 mb" style="grid-template-columns:repeat(auto-fit,minmax(140px,1fr))">'+['A','B','C','D','E'].map(function(t){ var x = T()[t];
      return '<button class="card pad-sm lift" style="text-align:left;border-left:4px solid '+x.mau+'" data-dl="loc" data-v2="'+t+'"><div class="tiny muted">Tầng '+t+'</div><b class="co-so" style="font-size:22px;color:'+x.mau+'">'+so((dem||{})[t]||0)+'</b><div class="tiny">'+h(x.ten)+'</div></button>'; }).join('')+'</div>';
  }

  /* ═══════════ THẺ 1 · TỔNG QUAN ═══════════ */
  function vTong(){
    var q = quyen(), o = thanhChonThang();
    if(q.bc){ canBC(); var b = st.bc; if(!b || !b.ok) return o + (choTai('bc') || '<p class="sm muted">Chưa có số liệu.</p>');
      o += '<div class="grid g4 mb">'+
        U.stat({ k:'Nhà được đo', v:so(b.soNha), d:tenThang(b.thang) })+
        U.stat({ k:'Có hoạt động', v:so(b.hoatDong.tyLeHoatDong)+'%', d:'TB '+so(b.hoatDong.ngayHoatDongTB)+' ngày/nhà' })+
        U.stat({ k:'Phút học TB', v:so(b.hoatDong.phutHocTB), d:'dùng app '+so(b.hoatDong.phutAppTB)+' phút/nhà', c:'#185AB4' })+
        U.stat({ k:'NPS', v:b.haiLong.nps == null ? '—' : so(b.haiLong.nps), d:b.haiLong.soPhieu+' phiếu · CSAT '+(b.haiLong.csatTB == null ? '—' : String(b.haiLong.csatTB).replace('.', ','))+'/5', c:'#B4720F' })+'</div>';
      o += '<div class="card pad-sm mb"><b class="sm">Sáu điểm trung bình của hệ</b><div class="grid g3 mt" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">'+
        DIEM.map(function(z){ return '<div><div class="tiny muted">'+h(z[1])+'</div>'+oDiem(b.tb[z[0]], z[2], z[0]==='ruiRo')+'</div>'; }).join('')+'</div></div>';
      o += U.sec('Phân tầng chăm sóc', 'Bấm một tầng để xem danh sách nhà') + demTang(b.tangCS);
      o += '<div class="grid g4 mb">'+
        U.stat({ k:'Bài hoàn thành', v:so(b.hoatDong.hoanThanh), d:'bài học · test · sát hạch · bài thi' })+
        U.stat({ k:'Báo cáo ngày', v:so(b.hoatDong.baoCao), d:'TB tick '+so(b.hoatDong.ngayTickTB)+' ngày/nhà' })+
        U.stat({ k:'Việc Coach duyệt', v:so(b.hoatDong.viecDuyet), d:so(b.hoatDong.cham)+' lượt chạm của đội' })+
        (b.taiChinh ? U.stat({ k:'Thu trong tháng', v:so(b.taiChinh.thuThang)+'đ', d:b.taiChinh.soNhaNo+' nhà còn nợ · '+so(b.taiChinh.tongNo)+'đ', c:'#0B7350' }) : U.stat({ k:'Lên tầng', v:so(b.hoatDong.lenTang), d:'nhà lên tầng trong tháng' }))+'</div>';
      return o;
    }
    canXH(); var x = st.xh; if(!x || !x.ok) return o + (choTai('xh') || '<p class="sm muted">Chưa có số liệu.</p>');
    var tb = function(k){ var v = x.ds.map(function(z){ return z.diem[k]; }).filter(function(z){ return z != null; }); return v.length ? Math.round(v.reduce(function(s, z){ return s + z; }, 0) / v.length) : null; };
    o += '<div class="grid g4 mb">'+U.stat({ k:'Nhà mình phụ trách', v:so(x.tong), d:tenThang(x.thang) })+
      U.stat({ k:'Gắn kết TB', v:so(tb('ganKet')), d:'trên 100', c:'#185AB4' })+U.stat({ k:'Tiềm năng TB', v:so(tb('tiemNang')), d:'trên 100', c:'#5140B4' })+
      U.stat({ k:'Cần cứu (D)', v:so(x.dem.D||0), d:'gọi trong 24 giờ', c:'#BE0E16' })+'</div>';
    return o + U.sec('Phân tầng chăm sóc', 'Bấm một tầng để xem danh sách nhà') + demTang(x.dem);
  }

  /* ═══════════ THẺ 2 · XẾP HẠNG ═══════════ */
  function vXH(){
    canXH(); var o = thanhChonThang(), x = st.xh;
    if(!x || !x.ok) return o + (choTai('xh') || '<p class="sm muted">Chưa có số liệu.</p>');
    o += '<div class="co-hang mb"><button class="btn sm '+(st.loc?'ghost':'')+'" data-dl="loc" data-v2="">Tất cả ('+so(x.tong)+')</button>'+
      ['A','B','C','D','E'].map(function(t){ return '<button class="btn sm '+(st.loc===t?'':'ghost')+'" data-dl="loc" data-v2="'+t+'">'+t+' ('+so((x.dem||{})[t]||0)+')</button>'; }).join('')+
      (quyen().ql ? '<button class="btn ghost sm" data-dl="csv">'+ic('out','w-3 h-3')+'Xuất CSV</button>' : '')+'</div>';
    o += '<p class="tiny muted" style="margin-top:0">Thứ tự này là công cụ NỘI BỘ để phân bổ giờ Coach — không bao giờ hiện cho gia đình, không dùng để so nhà này với nhà kia trước mặt khách (luật "Không xếp hạng gia đình" vẫn giữ nguyên ở mọi màn của khách).</p>';
    var ds = x.ds.filter(function(z){ return !st.loc || z.tangCS === st.loc; });
    if(!ds.length) return o + '<p class="sm muted">Không có nhà nào ở tầng này.</p>';
    o += '<div class="co-tb"><table><thead><tr><th>#</th><th>Nhà</th><th>Tầng chăm sóc</th>'+DIEM.map(function(z){ return '<th>'+h(z[1])+'</th>'; }).join('')+'<th>Hoạt động</th><th>Vì sao</th><th></th></tr></thead><tbody>'+
      ds.map(function(z){ return '<tr><td class="so">'+z.hang+'</td><td><b>'+h(z.maNha)+'</b><div class="tiny muted">T'+h(z.tang)+(z.coach ? ' · '+h(z.coach) : '')+(z.moi ? ' · mới vào' : '')+'</div></td><td>'+chipTang(z.tangCS)+'</td>'+
        DIEM.map(function(c){ return '<td>'+oDiem(z.diem[c[0]], c[2], c[0]==='ruiRo')+'</td>'; }).join('')+
        '<td class="tiny">'+so(z.ngayHoatDong)+' ngày · '+so(z.phutApp)+' phút'+(z.imLang != null ? '<br>im lặng '+so(z.imLang)+' ngày' : '')+'</td>'+
        '<td class="tiny">'+(z.lyDo||[]).map(h).join(' · ')+'</td><td><button class="btn ghost sm" data-dl="mo-ho" data-v2="'+h(z.maNha)+'">Hồ sơ</button></td></tr>'; }).join('')+'</tbody></table></div>';
    return o;
  }

  /* ═══════════ THẺ 3 · HỒ SƠ KHÁCH ═══════════ */
  function vHo(){
    var o = thanhChonThang() + '<div class="card pad-sm mb"><div class="co-form"><label class="co-f"><span>Mã nhà (mã khách hàng)</span><input class="inp" id="dl-ma" value="'+h(st.hoMa)+'" placeholder="VD: KH-0001"></label></div>'+
      '<div class="co-hang mt"><button class="btn sm" data-dl="xem-ho">Xem hồ sơ</button><span class="tiny muted">Hoặc bấm "Hồ sơ" ở thẻ Xếp hạng.</span></div></div>';
    if(!st.hoMa) return o + '<p class="sm muted">Chọn một nhà để xem hồ sơ đo lường: sáu điểm, xu hướng sáu tháng, từng số đo và việc nên làm.</p>';
    canHo(); var r = st.ho;
    if(!r || !r.ok) return o + (choTai('ho') || '<p class="sm muted">Chưa có số liệu.</p>');
    var x = r.ho, tk = T()[x.tangCS] || { mau:'#73849F', ten:'', viec:[] };
    o += '<div class="card mb" style="border-left:5px solid '+tk.mau+'"><div class="co-hang"><b style="font-size:18px">'+h(x.maNha)+'</b>'+chipTang(x.tangCS)+
      '<span class="tiny muted co-grow">T'+h(x.tang)+(x.coach ? ' · Coach '+h(x.coach) : '')+' · '+tenThang(x.thang)+'</span>'+
      '<button class="btn ghost sm" data-dl="in">'+ic('out','w-3 h-3')+'In hồ sơ</button></div>'+
      ((x.lyDo||[]).length ? '<p class="sm mt" style="margin-bottom:0"><b>Vì sao ở tầng này:</b> '+x.lyDo.map(h).join(' · ')+'</p>' : '')+'</div>';
    o += '<div class="grid g3 mb" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">'+DIEM.map(function(z){ return '<div class="card pad-sm"><div class="tiny muted">'+h(z[1])+'</div>'+oDiem(x.diem[z[0]], z[2], z[0]==='ruiRo')+'</div>'; }).join('')+'</div>';
    o += '<div class="grid g2 mb"><div class="card pad-sm"><b class="sm">Xu hướng 6 tháng</b>'+bieuDo(r.xuHuong||[], [DIEM[0], DIEM[1], DIEM[5], DIEM[4]])+'</div>'+
      '<div class="card pad-sm"><b class="sm">Việc nên làm với nhà này</b><ul class="sm" style="margin:8px 0 0;padding-left:18px;line-height:1.8">'+(x.viecNen || tk.viec || []).map(function(v){ return '<li>'+h(v)+'</li>'; }).join('')+'</ul>'+
      '<div class="co-hang mt"><button class="btn ghost sm" data-v="coach-pt">'+ic('target','w-3 h-3')+'Phân tích nhu cầu</button><button class="btn ghost sm" data-v="coach-v20">'+ic('star','w-3 h-3')+'Dựng lộ trình V20</button></div></div></div>';
    var dong = [
      ['Ngày có hoạt động', so(x.ngayHoatDong)+' / '+so(x.soNgayThang)+' ngày'], ['Phút dùng app', so(x.phutApp)], ['Phút học (app / báo cáo)', so(x.phutHocApp)+' / '+so(x.phutHocBaoCao)],
      ['Ngày tick việc hôm nay', so(x.ngayTick)+(x.soBo ? ' · bỏ '+so(x.soBo)+' việc' : '')], ['Báo cáo ngày', so(x.soBaoCao)+(x.kpiBaoCao != null ? ' · KPI TB '+so(x.kpiBaoCao) : '')],
      ['Bài hoàn thành', so(x.hoanThanh)+(x.diemTB != null ? ' · điểm TB '+so(x.diemTB) : '')], ['Tối có nhật ký', so(x.nhatKy)], ['Việc được Coach duyệt', so(x.viecDuyet)+' · '+so(x.creditThuong)+' credit thưởng'],
      ['Cảm xúc tự báo (1–5)', x.camXuc == null ? '—' : String(Math.round(x.camXuc * 10) / 10).replace('.', ',')], ['NPS · CSAT', (x.nps == null ? '—' : x.nps)+' · '+(x.csat == null ? '—' : x.csat)],
      ['Lượt chạm của đội', x.cham ? so(x.cham.nhan)+' nhắn · '+so(x.cham.goi)+' gọi · '+so(x.cham.wow)+' wow' : '—'], ['Đăng nhập', so(x.dangNhap)+' lần'],
      ['Im lặng', x.imLang == null ? '—' : so(x.imLang)+' ngày'], ['Lên tầng trong tháng', x.lenTang ? 'Có' : 'Chưa'], ['Giới thiệu nhà khác', so(x.gioiThieu)]
    ];
    if(x.ltv != null) dong.push(['Đã thanh toán (LTV)', so(x.ltv)+'đ'], ['Còn nợ', x.no ? so(x.no)+'đ' : 'Không']);
    o += '<div class="grid g2 mb"><div class="card pad-sm"><b class="sm">Từng số đo trong tháng</b><div class="mt">'+dong.map(function(d){ return '<div class="co-dong"><span class="co-grow sm">'+h(d[0])+'</span><b class="co-so sm">'+h(d[1])+'</b></div>'; }).join('')+'</div></div>';
    var pn = x.phutNhom || {}, tong = Object.keys(pn).reduce(function(s, k){ return s + (pn[k] || 0); }, 0) || 1, TN = (G.DL && G.DL.TEN_NHOM) || {};
    o += '<div class="card pad-sm"><b class="sm">Thời gian theo nhóm trải nghiệm</b><div class="mt">'+['hoc','thucHanh','baoCao','ketNoi','khac'].map(function(k){
      return '<div class="mb"><div class="co-hang sm"><span class="co-grow">'+h(TN[k]||k)+'</span><b class="co-so">'+so(pn[k])+' phút</b></div>'+U.bar(Math.round(100 * (pn[k]||0) / tong))+'</div>'; }).join('')+'</div>';
    var ls = st.ls && st.ls.ok ? st.ls.ds : [];
    o += '<b class="sm">Hồ sơ tháng đã chốt</b>'+(ls.length ? '<div class="mt">'+ls.map(function(z){ return '<div class="co-dong"><span class="co-grow sm">'+tenThang(z.thang)+'</span>'+(z.tangCS ? chipTang(z.tangCS) : '')+'<b class="co-so sm">'+(z.diem && z.diem.tiemNang != null ? 'TN '+z.diem.tiemNang : '')+'</b></div>'; }).join('')+'</div>' : '<p class="tiny muted">Chưa có tháng nào được chốt.</p>')+'</div></div>';
    return o;
  }

  /* ═══════════ THẺ 4 · BÁO CÁO THÁNG ═══════════ */
  function vBC(){
    canBC(); var o = thanhChonThang(), b = st.bc, q = quyen();
    if(!b || !b.ok) return o + (choTai('bc') || '<p class="sm muted">Chưa có số liệu.</p>');
    o += '<div class="co-hang mb"><button class="btn ghost sm" data-dl="in">'+ic('out','w-3 h-3')+'In / lưu PDF</button>'+
      (b.anDanh ? '<span class="co-tag">Bản ẩn danh — không mã nhà, không tài chính, không bình luận</span>' : '')+'</div>';
    o += '<div class="card mb"><b>Báo cáo đo lường khách hàng · '+tenThang(b.thang)+'</b><p class="sm muted" style="margin:4px 0 0">'+so(b.soNha)+' nhà · công thức '+h((G.DL||{}).PHIEN_BAN_DO||'')+' · '+(b.mau ? 'ví dụ minh hoạ' : 'số liệu máy chủ')+'</p></div>';
    o += U.sec('1. Hoạt động & học tập', '') + '<div class="grid g4 mb">'+
      U.stat({ k:'Tỷ lệ nhà hoạt động', v:so(b.hoatDong.tyLeHoatDong)+'%', d:'TB '+so(b.hoatDong.ngayHoatDongTB)+' ngày' })+U.stat({ k:'Phút học TB/nhà', v:so(b.hoatDong.phutHocTB), d:'dùng app '+so(b.hoatDong.phutAppTB)+' phút' })+
      U.stat({ k:'Bài hoàn thành', v:so(b.hoatDong.hoanThanh), d:'cả hệ' })+U.stat({ k:'Việc Coach duyệt', v:so(b.hoatDong.viecDuyet), d:so(b.hoatDong.baoCao)+' báo cáo ngày' })+'</div>';
    var TN = (G.DL && G.DL.TEN_NHOM) || {}, nh = b.sanPham.nhom || {}, tongN = Object.keys(nh).reduce(function(s, k){ return s + (nh[k]||0); }, 0) || 1;
    o += U.sec('2. Dùng sản phẩm — căn cứ nâng cấp hệ thống', 'Màn được dùng nhiều nhất, nhóm trải nghiệm và màn ít nhà mở') +
      '<div class="grid g2 mb"><div class="card pad-sm"><b class="sm">Màn dùng nhiều nhất</b><div class="co-tb mt"><table><thead><tr><th>Màn</th><th>Nhóm</th><th>Phút</th><th>Số nhà</th></tr></thead><tbody>'+
      (b.sanPham.man||[]).slice(0, 12).map(function(m){ return '<tr><td>'+h(m.man)+'</td><td class="tiny">'+h(TN[m.nhom]||m.nhom)+'</td><td class="so">'+so(m.phut)+'</td><td class="so">'+so(m.soNha)+'</td></tr>'; }).join('')+'</tbody></table></div></div>'+
      '<div class="card pad-sm"><b class="sm">Thời gian theo nhóm trải nghiệm</b><div class="mt">'+['hoc','thucHanh','baoCao','ketNoi','khac'].map(function(k){
        return '<div class="mb"><div class="co-hang sm"><span class="co-grow">'+h(TN[k]||k)+'</span><b class="co-so">'+Math.round(100*(nh[k]||0)/tongN)+'%</b></div>'+U.bar(Math.round(100*(nh[k]||0)/tongN))+'</div>'; }).join('')+'</div>'+
      '<b class="sm">Màn ít nhà mở (≤ 10% số nhà)</b><p class="tiny muted" style="margin:4px 0">Ứng viên để làm lại, gộp, hoặc dẫn đường tốt hơn.</p>'+
      ((b.sanPham.manItDung||[]).length ? (b.sanPham.manItDung||[]).map(function(m){ return '<span class="co-tag" style="margin:2px">'+h(m.man)+' · '+so(m.soNha)+' nhà</span>'; }).join(' ') : '<p class="tiny muted">Không có.</p>')+'</div></div>';
    o += U.sec('3. Hài lòng — căn cứ sản phẩm mới', '') + '<div class="grid g3 mb">'+
      U.stat({ k:'NPS', v:b.haiLong.nps == null ? '—' : so(b.haiLong.nps), d:'(% giới thiệu 9–10) − (% chê 0–6)', c:'#B4720F' })+U.stat({ k:'CSAT TB', v:b.haiLong.csatTB == null ? '—' : String(b.haiLong.csatTB).replace('.', ',')+'/5', d:so(b.haiLong.soPhieu)+' phiếu' })+
      U.stat({ k:'Hài lòng TB', v:so(b.tb.haiLong), d:'điểm tổng hợp' })+'</div>';
    if((b.haiLong.binhLuan||[]).length) o += '<div class="card pad-sm mb"><b class="sm">Lời nhà nói trong tháng</b>'+b.haiLong.binhLuan.map(function(c){ return '<div class="co-dong"><span class="co-grow sm">“'+h(c.ghiChu)+'”</span><span class="tiny muted">'+h(c.maNha)+' · NPS '+h(c.nps)+'</span></div>'; }).join('')+'</div>';
    o += U.sec('4. Phân tầng & theo tầng gói', '') + demTang(b.tangCS) +
      '<div class="co-tb mb"><table><thead><tr><th>Tầng gói</th><th>Số nhà</th><th>Gắn kết TB</th></tr></thead><tbody>'+(b.theoTang||[]).map(function(t){ return '<tr><td>T'+h(t.tang)+'</td><td class="so">'+so(t.soNha)+'</td><td class="so">'+so(t.ganKet)+'</td></tr>'; }).join('')+'</tbody></table></div>';
    o += '<div class="grid g2 mb"><div class="card pad-sm"><b class="sm">10 nhà tiềm năng nhất — đầu tư sâu</b>'+(b.top||[]).map(function(t){ return '<div class="co-dong"><b class="sm co-grow">'+h(t.ma)+'</b>'+chipTang(t.tangCS)+'<b class="co-so sm">'+so(t.tiemNang)+'</b></div>'; }).join('')+'</div>'+
      '<div class="card pad-sm"><b class="sm" style="color:#BE0E16">Nhà cần cứu (tầng D)</b>'+((b.canCuu||[]).length ? b.canCuu.map(function(t){ return '<div class="co-dong"><span class="co-grow sm"><b>'+h(t.ma)+'</b>'+(t.coach ? ' · '+h(t.coach) : '')+'<br><span class="tiny muted">'+(t.lyDo||[]).map(h).join(' · ')+'</span></span><b class="co-so sm" style="color:#BE0E16">'+so(t.ruiRo)+'</b></div>'; }).join('') : '<p class="tiny muted">Không có nhà nào ở tầng D.</p>')+'</div></div>';
    if(b.taiChinh) o += U.sec('5. Tài chính', '') + '<div class="grid g3 mb">'+U.stat({ k:'Thu trong tháng', v:so(b.taiChinh.thuThang)+'đ', d:'phiếu thu đã duyệt', c:'#0B7350' })+U.stat({ k:'Nhà còn nợ', v:so(b.taiChinh.soNhaNo), d:'kỳ thu quá hạn' })+U.stat({ k:'Tổng nợ', v:so(b.taiChinh.tongNo)+'đ', d:'', c:'#BE0E16' })+'</div>';
    if(q.chot){
      var tt = thangTruoc(thangNay());
      o += '<div class="card pad-sm mb"><b class="sm">Chốt hồ sơ tháng</b><p class="tiny muted" style="margin:4px 0 8px">Chốt lưu lại hồ sơ đo lường của từng nhà cho '+tenThang(tt)+' — một lần, không ghi đè. Nhà xem được bản rút gọn của mình.</p>'+
        (st.xacChot ? '<div class="co-hang"><button class="btn pri sm" data-dl="chot-ok">Xác nhận chốt '+tenThang(tt)+'</button><button class="btn ghost sm" data-dl="chot-huy">Thôi</button></div>'
                    : '<button class="btn sm" data-dl="chot">Chốt '+tenThang(tt)+'</button>')+'</div>';
    }
    return o;
  }

  /* ═══════════ THẺ 5 · CHĂM SÓC THEO TẦNG ═══════════ */
  function vCS(){
    canXH(); var x = st.xh, o = thanhChonThang();
    o += '<p class="sm muted" style="margin-top:0">Giờ Coach là nguồn lực đắt nhất. Tầng chăm sóc nói nhà nào cần đầu tư sâu, nhà nào cần cứu, nhà nào chỉ cần một tin nhắn chi phí thấp.</p>';
    return o + ['D','A','B','C','E'].map(function(t){
      var k = T()[t], ds = x && x.ok ? x.ds.filter(function(z){ return z.tangCS === t; }) : [];
      return '<div class="card pad-sm mb" style="border-left:5px solid '+k.mau+'"><div class="co-hang"><b style="color:'+k.mau+'">Tầng '+t+' · '+h(k.ten)+'</b><span class="co-tag co-grow" style="flex:0 0 auto">'+so(ds.length)+' nhà</span></div>'+
        '<ul class="sm" style="margin:8px 0;padding-left:18px;line-height:1.7">'+k.viec.map(function(v){ return '<li>'+h(v)+'</li>'; }).join('')+'</ul>'+
        (ds.length ? '<div class="co-hang">'+ds.slice(0, 30).map(function(z){ return '<button class="btn ghost sm" data-dl="mo-ho" data-v2="'+h(z.maNha)+'">'+h(z.maNha)+' · '+so(z.diem.tiemNang)+'</button>'; }).join('')+'</div>' : '')+'</div>';
    }).join('');
  }

  /* ═══════════ THẺ 6 · CÔNG THỨC ═══════════ */
  function vCT(){
    var DL = G.DL || {}, TN = DL.TEN_NHOM || {};
    var o = '<p class="sm muted" style="margin-top:0">Công thức '+h(DL.PHIEN_BAN_DO||'')+' — cùng một công thức chạy ở máy chủ và ở app (kiểm thử so 400 bộ số mỗi lần đẩy mã). Phần nào chưa có dữ liệu thì để trống và chia lại trọng số, không đoán.</p>';
    o += '<div class="grid g2 mb">'+(DL.GIAI_THICH||[]).map(function(g){ var c = DIEM.filter(function(z){ return z[0] === g.ma; })[0] || ['','', 'var(--gita)'];
      return '<div class="card pad-sm" style="border-left:4px solid '+c[2]+'"><b class="sm" style="color:'+c[2]+'">'+h(g.ten)+'</b><p class="sm" style="margin:6px 0 0;line-height:1.7">'+h(g.mo)+'</p></div>'; }).join('')+'</div>';
    o += U.sec('Luật xếp tầng chăm sóc', 'Xét theo thứ tự — gặp luật nào trước thì dừng') + '<div class="card pad-sm mb">'+(DL.LUAT_TANG||[]).map(function(l){ return '<div class="co-dong">'+chipTang(l[0])+'<span class="co-grow sm">'+h(l[1])+'</span></div>'; }).join('')+'</div>';
    o += U.sec('Đo những gì, từ đâu', '') + '<div class="co-tb mb"><table><thead><tr><th>Số đo</th><th>Nguồn</th></tr></thead><tbody>'+[
      ['Thời gian dùng app theo màn','Đồng hồ thật trong app — chỉ chạy khi cửa sổ hiển thị và có thao tác trong 90 giây; gửi lên mỗi 10 phút'],
      ['Bài học, test, sát hạch, bài thi, nhật ký, cảm xúc','App gửi mỗi sự kiện một lần, kèm điểm (0–100) nếu có'],
      ['Tick việc hôm nay · báo cáo ngày','Sổ nhịp và báo cáo ngày ở máy chủ'],
      ['Việc được Coach duyệt','Sổ credit thưởng (việc đúng hạn · minh chứng · cổng đạt)'],
      ['Lượt chạm của đội','Sổ chạm (nhắn · gọi · wow)'],
      ['NPS · CSAT','Phiếu hài lòng tháng của nhà'],
      ['Thanh toán · nợ · hoàn tiền · lên tầng','Sổ tài chính và lịch sử tầng'],
      ['Đăng nhập · giới thiệu','Nhật ký đăng nhập · mã nhà giới thiệu']
    ].map(function(r){ return '<tr><td><b>'+h(r[0])+'</b></td><td class="sm">'+h(r[1])+'</td></tr>'; }).join('')+'</tbody></table></div>';
    o += U.sec('Màn thuộc nhóm trải nghiệm nào', '') + '<div class="card pad-sm mb">'+Object.keys(DL.NHOM_MAN||{}).map(function(k){ return '<div class="co-dong"><b class="sm" style="min-width:150px">'+h(TN[k]||k)+'</b><span class="co-grow tiny">'+DL.NHOM_MAN[k].map(h).join(' · ')+'</span></div>'; }).join('')+'</div>';
    o += '<div class="co-hang mb"><button class="btn ghost sm" data-v="do-luong-kh">'+ic('pulse','w-3 h-3')+'Bảy chỉ số và chu kỳ đo</button><span class="tiny muted">Phần lý thuyết: ngưỡng cảnh báo, ai đọc, vòng cải tiến</span></div>';
    o += U.sec('Số đo dùng để làm gì', '') + '<div class="grid g3 mb">'+[
      ['Lộ trình từng khách','Điểm tiến bộ và gắn kết thấp ở trục nào thì Coach mở Phân tích nhu cầu và dựng lộ trình V20 đúng chỗ ấy.'],
      ['Nâng cấp hệ thống','Màn dùng nhiều được đầu tư thêm; màn ít nhà mở được làm lại hoặc gộp; nhóm trải nghiệm lệch cho biết hệ đang nặng học hay nặng thực hành.'],
      ['Sản phẩm mới','Lời nhà nói, NPS theo tầng và nhu cầu lặp lại ở các nhà tiềm năng là đầu vào cho chương trình chuyên đề mới.']
    ].map(function(r){ return '<div class="card pad-sm"><b class="sm">'+h(r[0])+'</b><p class="sm" style="margin:6px 0 0;line-height:1.7">'+h(r[1])+'</p></div>'; }).join('')+'</div>';
    return o;
  }

  G.VIEWS[VIEW] = function(){
    if(!G.DL) return U.lockCard('Thiếu công thức đo lường.');
    var q = quyen();
    if(!q.xh && !q.bc) return U.lockCard('Đo lường toàn diện khách hàng mở cho đội dẫn dắt (R01–R08) và Phân tích dữ liệu (bản ẩn danh).');
    /* Đổi người đăng nhập trên cùng tab: bỏ hết số liệu của phiên trước */
    var ai = String((G.S && G.S.acc && G.S.acc.u) || '') + '|' + lv();
    if(st.ai !== ai){ datLai(); st.ai = ai; st.hoMa = ''; st.loc = ''; st.tab = 'tong'; st.xacChot = false; }
    if(!st.thang) st.thang = thangNay();
    if((st.tab === 'xh' || st.tab === 'ho' || st.tab === 'cs') && !q.xh) st.tab = 'tong';
    if(st.tab === 'bc' && !q.bc) st.tab = 'tong';
    var o = U.ph({ eyebrow:'KHÁCH HÀNG · ĐO LƯỜNG TOÀN DIỆN', ic:'chart', grad:1, t:'Đo lường toàn diện khách hàng',
      lead:'Mỗi nhà một hồ sơ đo lường hằng tháng: thời gian học, việc thực hành, báo cáo, tương tác, hài lòng và giá trị — gộp thành sáu điểm, xếp hạng tiềm năng và phân năm tầng chăm sóc để đầu tư giờ Coach đúng chỗ.' });
    o += bannerMau() + tabs();
    o += st.tab === 'xh' ? vXH() : st.tab === 'ho' ? vHo() : st.tab === 'bc' ? vBC() : st.tab === 'cs' ? vCS() : st.tab === 'ct' ? vCT() : vTong();
    return o;
  };

  function datLai(){ st.xh = null; st.bc = null; st.ho = null; st.ls = null; st.loi = {}; }
  document.addEventListener('click', function(e){
    var el = e.target.closest && e.target.closest('[data-dl]'); if(!el) return;
    var a = el.getAttribute('data-dl'), v = el.getAttribute('data-v2'); e.preventDefault();
    if(a === 'tab') st.tab = v;
    else if(a === 'lam-moi') datLai();
    else if(a === 'loc'){ st.loc = v || ''; if(quyen().xh) st.tab = 'xh'; }
    else if(a === 'mo-ho'){ st.hoMa = v; st.ho = null; st.ls = null; st.tab = 'ho'; }
    else if(a === 'xem-ho'){ var i = document.getElementById('dl-ma'); st.hoMa = i ? String(i.value || '').trim().slice(0, 40) : ''; st.ho = null; st.ls = null; }
    else if(a === 'in'){ window.print(); return; }
    else if(a === 'chot') st.xacChot = true;
    else if(a === 'chot-huy') st.xacChot = false;
    else if(a === 'chot-ok'){
      st.xacChot = false;
      if(!coMayChu()){ U.toast('Ví dụ minh hoạ không chốt được — cần tài khoản thật trên máy chủ.', 'err'); }
      else G.goiMayChu('chotBaoCaoThang', { thang:thangTruoc(thangNay()) }).then(function(r){
        if(r && r.ok) U.toast('Đã chốt '+tenThang(r.thang)+' cho '+r.soNha+' nhà.', 'ok'); else U.toast((r && r.error) || 'Chưa chốt được.', 'err');
      });
    }
    else if(a === 'csv'){
      var x = st.xh; if(!x || !x.ds || !G.CO || !G.CO.csv) return;
      G.CO.csv('gita365-xep-hang-khach-'+st.thang+'.csv', ['Hạng','Mã nhà','Tầng gói','Coach','Tầng chăm sóc','Gắn kết','Tiến bộ','Hài lòng','Giá trị','Rủi ro','Tiềm năng','Ngày hoạt động','Phút app','Im lặng','Lý do'],
        x.ds.map(function(z){ return [z.hang, z.maNha, z.tang, z.coach, z.tangCS, z.diem.ganKet, z.diem.tienBo, z.diem.haiLong, z.diem.giaTri, z.diem.ruiRo, z.diem.tiemNang, z.ngayHoatDong, z.phutApp, z.imLang, (z.lyDo||[]).join('; ')]; }));
      return;
    }
    veLai();
  });
  document.addEventListener('change', function(e){
    var el = e.target.closest && e.target.closest('[data-dl-ch]'); if(!el) return;
    if(el.getAttribute('data-dl-ch') === 'thang' && /^\d{4}-\d{2}$/.test(el.value) && el.value <= thangNay()){ st.thang = el.value; datLai(); veLai(); }
  });
})();
