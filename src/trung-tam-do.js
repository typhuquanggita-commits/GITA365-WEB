/* ═══════════════════════════════════════════════════════════════
   GITA 365 — TRUNG TÂM ĐO LƯỜNG & TỐI ƯU (màn trung-tam-do)

   Một chỗ cho Super Admin thay vì tám màn "tổng quan" rải rác:
     Tổng quan · Từng phòng ban (7 khối) · Từng vai & từng người · Từng hoạt
     động · Kết quả kiểm tra · Phân tích & giải pháp · Triển khai · Bản đồ
   Số thật đọc từ máy chủ (may-chu/trung-tam-toi-uu.js). R01–R03 xem hết và
   giao giải pháp; nhân sự R04–R12 chỉ thấy "Việc tối ưu của tôi".
   Chưa có phiên máy chủ: ví dụ minh hoạ tính bằng đúng công thức G.TU.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
(function(){
  var U = G.U, h = U.h, ic = U.ic, VIEW = 'trung-tam-do';
  G.VIEWS = G.VIEWS || {};
  var st = { ai:'', lop:'vh', tab:'tong', ngay:30, khoi:'TV', d:null, ls:null, kh:null, tai:{}, loi:{}, mo:'', giao:null, moKH:'', locVD:'' };
  var MAU_TT = { donBay:'#5140B4', dat:'#0B7350', canhBao:'#B4720F', xau:'#BE0E16', chuaDo:'#73849F', theoDoi:'#185AB4' };
  var TEN_TT = { donBay:'Đòn bẩy chiến lược', dat:'Đạt', canhBao:'Cảnh báo', xau:'Xấu', chuaDo:'Chưa đo', theoDoi:'Theo dõi' };
  var TEN_TTKH = { moi:'Mới giao', dangLam:'Đang làm', xong:'Đã xong', huy:'Đã huỷ' };

  function T(){ return G.TU; }
  function lv(){ var r = G.S && G.S.roleObj; return r ? r.lv : 99; }
  function laQL(){ return lv() <= 3; }
  G.xemTrungTamDo = function(){ return lv() <= 12; };
  function coMayChu(){ return typeof G.goiMayChu === 'function' && !!G.API_CAP_PHEP && !!G.PHIEN_TOKEN; }
  function veLai(){ if(G.render && G.S && G.S.view === VIEW) G.render(); }
  function so(n){ return n == null ? '—' : (Math.round(Number(n) * 10) / 10).toLocaleString('vi-VN'); }
  function kpiDef(ma){ return T().KPI.filter(function(k){ return k.ma === ma; })[0]; }
  function khoiDef(ma){ return T().KHOI.filter(function(k){ return k.ma === ma; })[0]; }
  function tenVai(r){ var x = (G.ROLES || []).filter(function(z){ return z.id === r; })[0]; return x ? x.n : r; }
  function giaTri(k, v){ if(v == null) return '—'; if(k.dv === 'đ') return Math.round(v).toLocaleString('vi-VN') + 'đ'; return so(v) + (k.dv === '%' ? '%' : k.dv === '/5' ? '/5' : ''); }
  function chip(tt){ var c = MAU_TT[tt] || '#73849F'; return '<span class="co-tag" style="color:'+c+';background:color-mix(in srgb,'+c+' 13%,transparent)">'+h(TEN_TT[tt] || tt)+'</span>'; }
  function mauDiem(d){ return d == null ? '#73849F' : d >= 75 ? '#0B7350' : d >= 50 ? '#B4720F' : '#BE0E16'; }
  function nguongChu(k, n){
    if(k.kieu === 'tang') return 'không tụt so kỳ trước';
    if(k.kieu === 'tran') return 'không vượt 120% kỳ trước';
    if(k.kieu === 'theoDoi') return 'theo dõi';
    return (k.kieu === 'cao' ? '≥ ' : '≤ ') + giaTri(k, n.muc);
  }

  /* ═══════════ VÍ DỤ MINH HOẠ ═══════════ */
  var mau = null;
  function dungMau(){
    if(mau && mau.ngay === st.ngay) return mau;
    var gt = { tv1:6, tv2:48, tv3:8, tv4:18, tv5:36, tv6:240000000, co1:3.1, co2:22, co3:9, co4:44, co5:9, co6:7, co7:2,
      kh1:68, kh2:210, kh3:41, kh4:4.2, kh5:1.5, mk1:38, mk2:6, mk3:9, mk4:12400, mk5:1.6, mk6:12,
      tc1:186000000, tc2:74, tc3:31000000, tc4:2, tc5:4, tc6:12, tc7:1, ns1:72, ns2:9.4, ns3:1, ns4:0, ns5:2, cn1:4100000, cn2:1.2, cn3:0, cn4:0, cn5:0 };
    var tr = { tv1:8, tv2:52, tv5:41, co1:2.8, co4:47, co5:8, co6:9, co7:3, kh1:71, kh2:190, kh3:38, kh4:4.1, kh5:2.1, mk1:45, mk2:8, mk3:12, mk4:15100, mk5:1.4, mk6:10,
      tc1:201000000, tc2:69, tc3:42000000, tc6:9, ns2:8.8, cn1:3000000, cn2:1.4, cn3:0, cn4:1 };
    var he = st.ngay / 30;
    ['tv1','co6','co7','mk1','mk2','mk3','mk4','tc1','tc3','cn1'].forEach(function(k){ gt[k] = Math.round(gt[k] * he); if(tr[k] != null) tr[k] = Math.round(tr[k] * he); });
    ['co1','co5','kh2'].forEach(function(k){ gt[k] = Math.round(gt[k] * he * 10) / 10; if(tr[k] != null) tr[k] = Math.round(tr[k] * he * 10) / 10; });
    var kq = T().chamHet(gt, tr, st.ngay);
    var vai = ['R01','R02','R03','R04','R05','R06','R07','R08','R09','R10','R11','R12','R13','R14','R15'].map(function(r, i){
      var tk = [1,2,1,1,2,3,8,3,2,1,4,1,46,38,6][i], v7 = [1,2,1,1,2,3,6,2,1,1,4,1,31,22,3][i], tt = [220,410,160,190,260,330,1180,240,90,60,620,140,1900,1500,80][i] * he;
      return { vai:r, taiKhoan:tk, vao7:v7, thaoTac:Math.round(tt), tbNguoi:Math.round(tt / tk), top:[{ viec:['DUYET_PHIEU','DAT_KHOANG','DUYET_CHI','CHAM_CL','GIAO_NHA','GHI_CHAM','GHI_CHAM','GHI_BAI','GHI_CA','DANH_GIA','CRM_GHI','DOC_BAO_CAO','TICK_NHIP','HOC_BAI','GIOI_THIEU'][i], n:Math.round(tt * 0.4) }] };
    });
    var nguoi = [['coach.an','R07',34,'2026-10-06',140,96,4,0,0],['coach.binh','R07',22,'2026-10-07',98,61,2,1,0],['coach.chi','R07',41,'2026-09-28',40,12,1,2,1],['tuvan.dung','R11',0,'2026-10-07',210,8,62,1,0],
      ['tuvan.em','R11',0,'2026-10-02',80,2,21,0,0],['senior.gia','R06',18,'2026-10-07',120,58,3,0,0],['truong.ha','R05',6,'2026-10-07',160,22,6,1,0],['ketoan.ich','R03',0,'2026-10-07',130,0,0,1,0]].map(function(x){
      return { u:x[0], ten:'', vai:x[1], phongBan:'', nhaKem:x[2], lanCuoi:x[3] + 'T08:00:00Z', thaoTac:Math.round(x[4] * he), cham:Math.round(x[5] * he), crm:Math.round(x[6] * he), viecMo:x[7], viecTre:x[8] };
    });
    var hd = [['thu','Phiếu thu được duyệt',41,46,'phong-tai-chinh'],['chi','Khoản chi được duyệt',28,24,'phong-tai-chinh'],['dangky','Đăng ký mới',38,45,'crm'],['nhamoi','Nhà mới vào học',6,8,'crm'],['cohoi','Cơ hội bán mới',22,19,'crm'],
      ['cham','Lượt chạm khách (nhắn · gọi · wow)',259,231,'coach-dp'],['tick','Lượt tick việc hôm nay',1240,1310,'do-luong-he'],['baocao','Báo cáo ngày của nhà',748,690,'do-luong-he'],['baihoc','Bài học hoàn thành',312,280,'do-luong-he'],
      ['phut','Giờ dùng app của nhà',290,262,'do-luong-he'],['lentang','Lượt lên tầng',2,3,'do-luong-he'],['hoan','Lượt hoàn tiền',1,2,'phong-tai-chinh'],['noidung','Bài nội dung vào cổng',6,8,'bien-soan-noi-dung'],['dangngoai','Bài đăng kênh ngoài',9,12,'kien-truc-thi-giac'],
      ['credit','Giao dịch credit',980,860,'credit-gita'],['dangnhap','Lượt đăng nhập',612,590,'nhat-ky-ht'],['ai','Lượt gọi AI',3400,2600,'bo-nao-da-tri'],['thaotac','Tổng thao tác ghi nhật ký',7300,6900,'nhat-ky-ht']].map(function(x){
      return { ma:x[0], ten:x[1], nay:Math.round(x[2] * he), truoc:Math.round(x[3] * he), man:x[4] };
    });
    var ktr = [['KT01','Phiếu thu chờ duyệt quá 3 ngày',2,'phong-tai-chinh'],['KT02','Kỳ thu quá hạn chưa thu đủ',4,'phong-tai-chinh','còn 11.500.000đ'],['KT03','Đề xuất chi chờ duyệt quá 7 ngày',1,'phong-tai-chinh'],['KT04','Nhà đang học không có người phụ trách',7,'crm'],
      ['KT05','Nhà quá hẹn chăm sóc',15,'crm'],['KT06','Nhà quá 7 ngày chưa được chạm',18,'coach-dp'],['KT07','Nhà đang học tầng 2–5 chưa có lịch thu',0,'phong-tai-chinh'],['KT08','Tài khoản đã cho nghỉ mà vẫn mở',0,'vong-doi-tk'],
      ['KT09','Tài khoản nhân sự bỏ không 30 ngày',2,'phan-quyen'],['KT10','Nhân sự mới chưa qua đủ ba cửa',1,'con-nguoi'],['KT11','Yêu cầu xoá dữ liệu quá hạn',0,'phap-ly-rui-ro'],['KT12','Việc tối ưu quá hạn',0,'trung-tam-do'],
      ['KT13','Cơ hội bán quá ngày dự kiến chốt',3,'crm'],['KT14','Bài nội dung treo quá 7 ngày chưa vào cổng',2,'bien-soan-noi-dung']].map(function(x){ return { ma:x[0], ten:x[1], so:x[2], dat:x[2] === 0, man:x[3], ghi:x[4] || '' }; });
    var lsMau = []; for(var i = 13; i >= 0; i--){ var dd = new Date(); dd.setDate(dd.getDate() - i); lsMau.push({ ngay:dd.toISOString().slice(0, 10), tong:Math.max(30, Math.min(90, kq.tong - 6 + Math.round(Math.sin(i) * 3) + (13 - i) / 2)) }); }
    mau = { ngay:st.ngay, d:Object.assign({ ok:true, mau:true, ngay:st.ngay, vai:vai, nguoi:nguoi, hoatDong:{ ds:hd, topViec:[{ viec:'TICK_NHIP', n:1240 },{ viec:'DANG_NHAP', n:612 },{ viec:'GHI_CHAM', n:259 },{ viec:'CRM_GHI', n:180 }] }, kiemTra:ktr, phu:{} }, kq), ls:{ ok:true, ds:lsMau } };
    return mau;
  }

  /* ═══════════ TẢI ═══════════ */
  function tai(viec, fn, than, gan){
    if(!coMayChu() || st.tai[viec]) return;
    st.tai[viec] = 1; st.loi[viec] = '';
    G.goiMayChu(fn, than, { moi:true }).then(function(r){ st.tai[viec] = 0; if(r && r.ok) gan(r); else { st.loi[viec] = (r && r.error) || 'Không đọc được.'; gan(null); } veLai(); });
  }
  function canDo(){
    if(st.d && st.d.ngay === st.ngay) return;
    if(!coMayChu()){ var m = dungMau(); st.d = m.d; st.ls = m.ls; return; }
    tai('d', 'docTrungTamDo', { ngay:st.ngay }, function(r){ st.d = r || { ok:false, ngay:st.ngay }; });
    if(!st.ls) tai('ls', 'lichSuTrungTamDo', {}, function(r){ st.ls = r || { ok:false, ds:[] }; });
  }
  function canKH(){
    if(st.kh) return;
    if(!coMayChu()){ st.kh = { ok:true, mau:true, quanLy:laQL(), ds:[], taiViec:[], dem:{ moi:0, dangLam:0, xong:0, tre:0 } }; return; }
    tai('kh', 'dsKeHoachToiUu', {}, function(r){ st.kh = r || { ok:false, ds:[], taiViec:[], dem:{} }; });
  }
  function choTai(v){ return st.tai[v] ? '<p class="sm muted">Đang đọc số liệu từ máy chủ…</p>' : st.loi[v] ? '<div class="co-mau">'+ic('alert','w-4 h-4')+'<span>'+h(st.loi[v])+'</span></div>' : ''; }

  /* ═══════════ VẤN ĐỀ ĐANG MỞ ═══════════ */
  function dsVanDe(d){
    var diemK = {}; (d.khoi || []).forEach(function(k){ diemK[k.ma] = k.diem; });
    return (d.kpi || []).filter(function(x){ return (x.tt === 'xau' || x.tt === 'canhBao') && T().VAN_DE[x.ma]; })
      .sort(function(a, b){ return (a.tt === 'xau' ? 0 : 1) - (b.tt === 'xau' ? 0 : 1) || (diemK[a.khoi] == null ? 999 : diemK[a.khoi]) - (diemK[b.khoi] == null ? 999 : diemK[b.khoi]); });
  }
  function danhGia(x, d){
    var k = kpiDef(x.ma), K = khoiDef(x.khoi), dk = (d.khoi || []).filter(function(z){ return z.ma === x.khoi; })[0] || {};
    var s = k.ten + ' đang ' + giaTri(k, x.gt) + ' — ' + (x.tt === 'xau' ? 'XẤU' : x.tt === 'donBay' ? 'chưa xấu nhưng là đòn bẩy chiến lược lớn nhất theo mô phỏng V20' : 'cảnh báo') + ' (ngưỡng ' + nguongChu(k, x.nguong) + ')';
    if(x.truoc != null) s += '; kỳ trước ' + giaTri(k, x.truoc) + (x.gt > x.truoc ? ', đang tăng' : x.gt < x.truoc ? ', đang giảm' : ', đứng yên');
    return s + '. Khối ' + K.ten + ' đạt ' + (dk.diem == null ? '—' : dk.diem) + '/100 (' + (dk.xau || 0) + ' chỉ số xấu, ' + (dk.canhBao || 0) + ' cảnh báo).';
  }

  /* ═══════════ MẢNH VẼ ═══════════ */
  function vongDiem(d, lb){ return U.ring(d == null ? 0 : d, mauDiem(d), lb); }
  function duongDiem(ds){
    if(!ds || ds.length < 2) return '<p class="tiny muted">Đường điểm hiện khi có từ hai ngày ảnh chụp (mỗi lần mở kỳ 30 ngày, máy lưu một ảnh/ngày).</p>';
    var W = 320, H = 90, l = 26, r = 10, t = 8, b = 18, n = ds.length;
    var x = function(i){ return l + i * (W - l - r) / (n - 1); }, y = function(v){ return t + (100 - v) * (H - t - b) / 100; };
    var pts = ds.map(function(p, i){ return p.tong == null ? null : x(i).toFixed(1) + ',' + y(p.tong).toFixed(1); }).filter(Boolean).join(' ');
    var e = ds[n-1];
    return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Điểm toàn hệ theo ngày" style="width:100%;max-width:460px;height:auto;color:var(--ink-3,#556)">'+
      [0,50,100].map(function(v){ return '<line x1="'+l+'" x2="'+(W-r)+'" y1="'+y(v)+'" y2="'+y(v)+'" stroke="currentColor" stroke-opacity=".16"/><text x="'+(l-5)+'" y="'+(y(v)+3)+'" font-size="9" text-anchor="end" fill="currentColor">'+v+'</text>'; }).join('')+
      '<polyline fill="none" stroke="#185AB4" stroke-width="2.2" points="'+pts+'"/>'+(e.tong != null ? '<circle cx="'+x(n-1).toFixed(1)+'" cy="'+y(e.tong).toFixed(1)+'" r="3.5" fill="#185AB4"/>' : '')+
      '<text x="'+l+'" y="'+(H-4)+'" font-size="9" fill="currentColor">'+h(String(ds[0].ngay).slice(5))+'</text><text x="'+(W-r)+'" y="'+(H-4)+'" font-size="9" text-anchor="end" fill="currentColor">'+h(String(e.ngay).slice(5))+'</text></svg>';
  }
  function sao(n, mau2){ var o = ''; for(var i = 1; i <= 3; i++) o += '<span style="color:'+(i <= n ? mau2 : 'var(--line,#ccd)')+'">●</span>'; return o; }
  function thanhKy(){
    return '<div class="co-hang mb"><span class="sm muted">Kỳ đo</span>'+[7,30,90].map(function(n){ return '<button class="btn sm '+(st.ngay===n?'':'ghost')+'" data-ttd="ky" data-v2="'+n+'">'+n+' ngày</button>'; }).join('')+
      '<button class="btn ghost sm" data-ttd="lam-moi">'+ic('orbit','w-3 h-3')+'Đo lại</button>'+(st.d && st.d.tu ? '<span class="tiny muted">'+h(st.d.tu)+' → hôm nay · so với '+st.ngay+' ngày liền trước</span>' : '')+'</div>';
  }

  /* ═══════════ THẺ: TỔNG QUAN ═══════════ */
  function vTong(d){
    var vd = dsVanDe(d), kt = d.kiemTra || [], ktDat = kt.filter(function(x){ return x.dat; }).length;
    var o = '<div class="grid g2 mb"><div class="card pad-sm"><div class="co-hang" style="align-items:center">'+vongDiem(d.tong, 'toàn hệ')+
      '<div class="co-grow"><b>Điểm sức khoẻ toàn hệ</b><p class="sm muted" style="margin:4px 0 8px">Trung bình 7 khối; mỗi khối = chỉ số đạt 100 · cảnh báo 50 · xấu 0.</p>'+
      '<div class="co-hang sm"><span>'+chip('xau')+' '+(d.kpi||[]).filter(function(x){ return x.tt==='xau'; }).length+'</span><span>'+chip('canhBao')+' '+(d.kpi||[]).filter(function(x){ return x.tt==='canhBao'; }).length+'</span><span>'+chip('dat')+' '+(d.kpi||[]).filter(function(x){ return x.tt==='dat'; }).length+'</span><span>'+chip('chuaDo')+' '+(d.kpi||[]).filter(function(x){ return x.tt==='chuaDo'; }).length+'</span></div></div></div>'+
      '<div class="mt">'+duongDiem(st.ls && st.ls.ds)+'</div></div>'+
      '<div class="card pad-sm"><b>Việc cần Super Admin quyết</b><div class="mt">'+
        '<div class="co-dong"><span class="co-grow sm">Vấn đề đang mở (chỉ số xấu / cảnh báo)</span><b class="co-so">'+vd.length+'</b><button class="btn ghost sm" data-ttd="tab" data-v2="gp">Xem giải pháp</button></div>'+
        '<div class="co-dong"><span class="co-grow sm">Kết quả kiểm tra đạt</span><b class="co-so">'+ktDat+'/'+kt.length+'</b><button class="btn ghost sm" data-ttd="tab" data-v2="kt">Xem</button></div>'+
        '<div class="co-dong"><span class="co-grow sm">Việc tối ưu đang chạy · trễ</span><b class="co-so">'+(st.kh && st.kh.dem ? (st.kh.dem.moi + st.kh.dem.dangLam)+' · '+st.kh.dem.tre : '—')+'</b><button class="btn ghost sm" data-ttd="tab" data-v2="tk">Theo dõi</button></div></div>'+
      (vd.length ? '<div class="mt"><div class="tiny muted mb">Ưu tiên xử lý trước</div>'+vd.slice(0, 5).map(function(x){ var k = kpiDef(x.ma); return '<div class="co-dong">'+chip(x.tt)+'<span class="co-grow sm"><b>'+h(T().VAN_DE[x.ma].ten)+'</b><br><span class="tiny muted">'+h(khoiDef(x.khoi).ten)+' · '+h(k.ten)+' '+giaTri(k, x.gt)+'</span></span><button class="btn sm" data-ttd="mo-vd" data-v2="'+x.ma+'">Giải pháp</button></div>'; }).join('')+'</div>' : '<p class="sm muted mt">Không có chỉ số xấu hay cảnh báo.</p>')+'</div></div>';
    o += U.sec('7 khối · 16 ban gom về một chỗ', 'Bấm một khối để xem từng chỉ số') + '<div class="grid g4 mb" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">'+(d.khoi||[]).map(function(k){ var K = khoiDef(k.ma);
      return '<button class="card pad-sm lift" style="text-align:left;border-top:4px solid '+mauDiem(k.diem)+'" data-ttd="mo-khoi" data-v2="'+k.ma+'"><div class="co-hang"><b class="co-grow sm">'+h(K.ten)+'</b><b class="co-so" style="font-size:22px;color:'+mauDiem(k.diem)+'">'+(k.diem == null ? '—' : k.diem)+'</b></div>'+
        U.bar(k.diem || 0, mauDiem(k.diem))+'<div class="tiny muted mt">'+k.xau+' xấu · '+k.canhBao+' cảnh báo · '+k.dat+' đạt · ban '+K.ban.join(' ')+'</div></button>'; }).join('')+'</div>';
    return o;
  }

  /* ═══════════ THẺ: TỪNG PHÒNG BAN ═══════════ */
  function vKhoi(d){
    var o = '<div class="co-hang mb">'+T().KHOI.map(function(K){ var k = (d.khoi||[]).filter(function(z){ return z.ma === K.ma; })[0] || {};
      return '<button class="btn sm '+(st.khoi===K.ma?'':'ghost')+'" data-ttd="khoi" data-v2="'+K.ma+'">'+h(K.ten)+' · '+(k.diem == null ? '—' : k.diem)+'</button>'; }).join('')+'</div>';
    var K = khoiDef(st.khoi), dk = (d.khoi||[]).filter(function(z){ return z.ma === st.khoi; })[0] || {};
    o += '<div class="card pad-sm mb" style="border-left:5px solid '+mauDiem(dk.diem)+'"><div class="co-hang"><b class="co-grow">'+h(K.ten)+' — '+(dk.diem == null ? 'chưa đo' : dk.diem + '/100')+'</b>'+
      '<span class="tiny muted">Ban '+K.ban.join(' · ')+'</span><button class="btn ghost sm" data-v="'+K.man+'">'+ic('out','w-3 h-3')+'Màn chi tiết</button></div></div>';
    var ds = (d.kpi||[]).filter(function(x){ return x.khoi === st.khoi; });
    o += '<div class="co-tb mb"><table><thead><tr><th>Chỉ số</th><th>Kỳ này</th><th>Kỳ trước</th><th>Ngưỡng</th><th>Đánh giá</th><th></th></tr></thead><tbody>'+ds.map(function(x){ var k = kpiDef(x.ma);
      return '<tr><td><b>'+h(k.ten)+'</b></td><td class="so"><b>'+giaTri(k, x.gt)+'</b></td><td class="so">'+(x.truoc == null ? '<span class="tiny muted">hiện tại</span>' : giaTri(k, x.truoc))+'</td><td class="tiny">'+h(nguongChu(k, x.nguong))+'</td><td>'+chip(x.tt)+'</td>'+
        '<td>'+((x.tt === 'xau' || x.tt === 'canhBao') && T().VAN_DE[x.ma] ? '<button class="btn sm" data-ttd="mo-vd" data-v2="'+x.ma+'">Giải pháp</button>' : '')+'</td></tr>'; }).join('')+'</tbody></table></div>';
    o += '<p class="tiny muted">"Hiện tại" là chỉ số đo ngay lúc mở (tồn đọng, quá hạn), không có kỳ trước. Chưa đo = bảng chưa có dữ liệu — máy không đoán.</p>';
    return o;
  }

  /* ═══════════ THẺ: TỪNG VAI & NGƯỜI ═══════════ */
  function vVai(d){
    var diemK = {}; (d.khoi||[]).forEach(function(k){ diemK[k.ma] = k.diem; });
    var o = U.sec('Từng vai', 'Tài khoản đang mở · đăng nhập 7 ngày · thao tác trong kỳ · khối chịu trách nhiệm');
    o += '<div class="co-tb mb"><table><thead><tr><th>Vai</th><th>Tài khoản</th><th>Đăng nhập 7 ngày</th><th>Thao tác kỳ</th><th>TB/người</th><th>Việc nhiều nhất</th><th>Khối phụ trách</th></tr></thead><tbody>'+(d.vai||[]).map(function(v){
      var pt = v.taiKhoan ? Math.round(100 * v.vao7 / v.taiKhoan) : null;
      return '<tr><td><b>'+h(v.vai)+'</b> '+h(tenVai(v.vai))+'</td><td class="so">'+so(v.taiKhoan)+'</td><td class="so" style="color:'+(pt == null ? 'inherit' : pt >= 80 ? '#0B7350' : pt >= 60 ? '#B4720F' : '#BE0E16')+'">'+so(v.vao7)+(pt == null ? '' : ' · '+pt+'%')+'</td>'+
        '<td class="so">'+so(v.thaoTac)+'</td><td class="so">'+so(v.tbNguoi)+'</td><td class="tiny">'+(v.top||[]).map(function(t){ return h(t.viec)+' ('+so(t.n)+')'; }).join(' · ')+'</td>'+
        '<td class="tiny">'+(T().VAI_KHOI[v.vai]||[]).map(function(k){ return '<span style="color:'+mauDiem(diemK[k])+'">'+k+' '+(diemK[k] == null ? '—' : diemK[k])+'</span>'; }).join(' · ')+'</td></tr>'; }).join('')+'</tbody></table></div>';
    var nguoi = d.nguoi || [], bayNgay = new Date(Date.now() - 7 * 864e5).toISOString();
    o += U.sec('Từng người (nhân sự)', 'Ai đang quá tải, ai đang ít việc, ai lâu không vào — căn cứ để phân bổ');
    o += '<div class="co-tb mb"><table><thead><tr><th>Người</th><th>Vai</th><th>Lần vào cuối</th><th>Thao tác</th><th>Lượt chạm</th><th>CRM</th><th>Nhà kèm</th><th>Việc tối ưu</th><th>Tín hiệu</th></tr></thead><tbody>'+nguoi.map(function(p){
      var tin = []; if(!p.lanCuoi || p.lanCuoi < bayNgay) tin.push('<span style="color:#BE0E16">lâu không vào</span>'); if(p.nhaKem > 40 || p.viecMo >= 3) tin.push('<span style="color:#B4720F">quá tải</span>'); if(p.viecTre) tin.push('<span style="color:#BE0E16">'+p.viecTre+' việc trễ</span>');
      return '<tr><td><b>'+h(p.u)+'</b>'+(p.ten ? '<div class="tiny muted">'+h(p.ten)+'</div>' : '')+'</td><td>'+h(p.vai)+'</td><td class="tiny">'+(p.lanCuoi ? h(new Date(p.lanCuoi).toLocaleDateString('vi-VN')) : '—')+'</td>'+
        '<td class="so">'+so(p.thaoTac)+'</td><td class="so">'+so(p.cham)+'</td><td class="so">'+so(p.crm)+'</td><td class="so">'+so(p.nhaKem)+'</td><td class="so">'+so(p.viecMo)+'</td><td class="tiny">'+(tin.join(' · ') || '<span style="color:#0B7350">ổn</span>')+'</td></tr>'; }).join('')+'</tbody></table></div>';
    return o;
  }

  /* ═══════════ THẺ: TỪNG HOẠT ĐỘNG ═══════════ */
  function vHD(d){
    var H = d.hoatDong || { ds:[], topViec:[] };
    var o = '<div class="co-tb mb"><table><thead><tr><th>Hoạt động</th><th>Kỳ này</th><th>Kỳ trước</th><th>Thay đổi</th><th></th></tr></thead><tbody>'+H.ds.map(function(x){
      var d2 = x.nay == null || !(x.truoc > 0) ? null : Math.round(100 * (x.nay - x.truoc) / x.truoc);
      return '<tr><td><b>'+h(x.ten)+'</b></td><td class="so"><b>'+so(x.nay)+'</b></td><td class="so">'+so(x.truoc)+'</td><td class="so" style="color:'+(d2 == null ? 'inherit' : d2 >= 0 ? '#0B7350' : '#BE0E16')+'">'+(d2 == null ? '—' : (d2 > 0 ? '▲ +' : d2 < 0 ? '▼ ' : '')+d2+'%')+'</td>'+
        '<td><button class="btn ghost sm" data-v="'+h(x.man)+'">Mở</button></td></tr>'; }).join('')+'</tbody></table></div>';
    o += U.sec('Việc được ghi nhật ký nhiều nhất', '') + '<div class="card pad-sm mb">'+(H.topViec||[]).map(function(t){ var mx = (H.topViec[0]||{}).n || 1; return '<div class="mb"><div class="co-hang sm"><span class="co-grow">'+h(t.viec)+'</span><b class="co-so">'+so(t.n)+'</b></div>'+U.bar(Math.round(100 * t.n / mx))+'</div>'; }).join('')+'</div>';
    o += '<p class="tiny muted">Hoạt động hoàn hảo của hệ là khi các dòng "giá trị" (chạm, tick, báo cáo, bài học, lên tầng) tăng nhanh hơn dòng "chi" và "thao tác".</p>';
    return o;
  }

  /* ═══════════ THẺ: KẾT QUẢ KIỂM TRA ═══════════ */
  function vKT(d){
    var kt = d.kiemTra || [], dat = kt.filter(function(x){ return x.dat; }).length;
    var o = '<div class="card pad-sm mb"><div class="co-hang">'+vongDiem(kt.length ? Math.round(100 * dat / kt.length) : null, 'đạt')+'<div class="co-grow"><b>'+dat+'/'+kt.length+' phép kiểm đạt</b><p class="sm muted" style="margin:4px 0 0">Mỗi phép kiểm đếm một loại tồn đọng hoặc lỗ hổng. Đạt = 0 trường hợp.</p></div></div></div>';
    o += kt.map(function(x){ var c = x.chuaDo ? '#73849F' : x.dat ? '#0B7350' : '#BE0E16';
      return '<div class="co-dong" style="border-left:4px solid '+c+';padding-left:10px"><span class="co-so tiny muted" style="min-width:40px">'+h(x.ma)+'</span><span class="co-grow sm"><b>'+h(x.ten)+'</b>'+(x.ghi ? ' <span class="tiny muted">· '+h(x.ghi)+'</span>' : '')+'</span>'+
        '<b class="co-so" style="color:'+c+'">'+(x.chuaDo ? 'chưa đo' : x.dat ? '✓ 0' : so(x.so))+'</b><button class="btn ghost sm" data-v="'+h(x.man)+'">Xử lý</button></div>'; }).join('');
    return o;
  }

  /* ═══════════ THẺ: PHÂN TÍCH & GIẢI PHÁP ═══════════ */
  function vGP(d){
    var vd = dsVanDe(d);
    /* Mở từ Chiến lược V20: vấn đề được chọn có thể chưa xấu nhưng là đòn bẩy cần đẩy */
    if(st.mo && T().VAN_DE[st.mo] && !vd.some(function(x){ return x.ma === st.mo; })){ var them = (d.kpi || []).filter(function(x){ return x.ma === st.mo; })[0]; if(them) vd.unshift(Object.assign({}, them, { ttGoc: them.tt, tt: them.tt === 'xau' || them.tt === 'canhBao' ? them.tt : 'donBay' })); }
    var o = '<p class="sm muted" style="margin-top:0">Mỗi chỉ số xấu hoặc cảnh báo là một vấn đề. Máy đưa đánh giá, nguyên nhân thường gặp và 2–5 giải pháp xếp theo điểm ưu tiên (2 × tác động − công sức). Chọn một giải pháp → giao triển khai: máy đề xuất người đúng vai đang ít việc nhất.</p>';
    if(!vd.length) return o + '<div class="card pad-sm"><b>Không có vấn đề đang mở.</b> <span class="sm muted">Mọi chỉ số chấm được đều đạt.</span></div>';
    o += '<div class="co-hang mb"><button class="btn sm '+(st.locVD?'ghost':'')+'" data-ttd="loc-vd" data-v2="">Tất cả ('+vd.length+')</button>'+T().KHOI.map(function(K){ var n = vd.filter(function(x){ return x.khoi === K.ma; }).length; return n ? '<button class="btn sm '+(st.locVD===K.ma?'':'ghost')+'" data-ttd="loc-vd" data-v2="'+K.ma+'">'+h(K.ten)+' ('+n+')</button>' : ''; }).join('')+'</div>';
    return o + vd.filter(function(x){ return !st.locVD || x.khoi === st.locVD; }).map(function(x){
      var V = T().VAN_DE[x.ma], mo = st.mo === x.ma;
      var gps = V.gp.slice().sort(function(a, b){ return T().uuTien(b) - T().uuTien(a); });
      var s = '<div class="card pad-sm mb" id="vd-'+x.ma+'" style="border-left:5px solid '+MAU_TT[x.tt]+'"><div class="co-hang">'+chip(x.tt)+'<b class="co-grow">'+h(V.ten)+'</b><span class="tiny muted">'+h(khoiDef(x.khoi).ten)+'</span>'+
        '<button class="btn '+(mo?'ghost ':'')+'sm" data-ttd="mo-vd" data-v2="'+x.ma+'">'+(mo ? 'Thu gọn' : gps.length+' giải pháp')+'</button></div>';
      if(!mo) return s + '<p class="tiny muted" style="margin:6px 0 0">'+h(danhGia(x, d))+'</p></div>';
      s += '<p class="sm" style="margin:8px 0"><b>Đánh giá:</b> '+h(danhGia(x, d))+'</p><p class="sm" style="margin:0 0 10px"><b>Nguyên nhân thường gặp:</b> '+V.viSao.map(h).join(' · ')+'</p>';
      s += gps.map(function(g, i){
        var dangGiao = st.giao && st.giao.ma === g.ma;
        var r = '<div class="card pad-sm mb" style="background:color-mix(in srgb,var(--surface,#fff) 92%,#185AB4)"><div class="co-hang"><b class="co-grow sm">'+(i === 0 ? '<span class="co-tag" style="color:#0B7350;background:color-mix(in srgb,#0B7350 13%,transparent)">Đề xuất</span> ' : '')+h(g.ten)+'</b>'+
          '<span class="tiny">Tác động '+sao(g.tacDong, '#0B7350')+' · Công sức '+sao(g.congSuc, '#B4720F')+'</span></div><p class="sm" style="margin:6px 0">'+h(g.mo)+'</p>'+
          '<ol class="sm" style="margin:0 0 8px;padding-left:20px;line-height:1.7">'+g.buoc.map(function(b){ return '<li>'+h(b)+'</li>'; }).join('')+'</ol>'+
          '<div class="co-hang tiny muted"><span>Vai triển khai: <b>'+g.vai.map(function(v){ return h(v+' '+tenVai(v)); }).join(', ')+'</b></span><span>Hạn: <b>'+g.han+' ngày</b></span><span>Màn làm việc: <b>'+h(g.man)+'</b></span></div>';
        if(laQL()) r += dangGiao ? formGiao(g, x) : '<div class="co-hang mt"><button class="btn pri sm" data-ttd="giao" data-v2="'+g.ma+'" data-kpi="'+x.ma+'">'+ic('check','w-3 h-3')+'Giao triển khai</button><button class="btn ghost sm" data-v="'+h(g.man)+'">Mở màn làm việc</button></div>';
        return r + '</div>';
      }).join('');
      return s + '</div>';
    }).join('');
  }
  function formGiao(g, x){
    var gi = st.giao, k = kpiDef(x.ma);
    var uv = gi.ungVien || [];
    var o = '<div class="card pad-sm mt" style="border:1px dashed #185AB4"><b class="sm">Phân bổ & giao việc</b>';
    if(gi.dangTai) return o + '<p class="tiny muted">Đang tìm người đúng vai…</p></div>';
    o += '<p class="tiny muted" style="margin:4px 0 8px">Máy chọn người vai '+g.vai.join('/')+' đang ít việc tối ưu nhất'+(gi.chon ? ': <b>'+h(gi.chon.u)+'</b> ('+gi.chon.dangMo+' việc đang mở)' : '')+'. Anh đổi được.</p>';
    o += '<div class="co-form"><label class="co-f"><span>Người phụ trách</span><select class="inp" id="ttd-nguoi">'+(uv.length ? uv.map(function(u){ return '<option value="'+h(u.u)+'"'+(gi.chon && gi.chon.u === u.u ? ' selected' : '')+'>'+h(u.u)+' · '+h(u.vai)+' · '+u.dangMo+' việc mở</option>'; }).join('') : '<option value="">(chưa có tài khoản đúng vai — gõ tên bên dưới)</option>')+'</select></label>'+
      '<label class="co-f"><span>Hoặc tên đăng nhập khác</span><input class="inp" id="ttd-nguoi2" placeholder="để trống nếu dùng ô trên"></label>'+
      '<label class="co-f"><span>Hạn (ngày)</span><input class="inp" id="ttd-han" inputmode="numeric" value="'+g.han+'"></label>'+
      '<label class="co-f"><span>Mục tiêu '+h(k.ten)+'</span><input class="inp" id="ttd-muc" value="'+h(x.nguong.muc == null ? '' : x.nguong.muc)+'"></label></div>'+
      '<div class="co-hang mt"><button class="btn pri sm" data-ttd="giao-ok">Giao kế hoạch</button><button class="btn ghost sm" data-ttd="giao-huy">Thôi</button></div></div>';
    return o;
  }

  /* ═══════════ THẺ: TRIỂN KHAI ═══════════ */
  function vTK(){
    canKH(); var K = st.kh;
    if(!K || !K.ok) return choTai('kh') || '<p class="sm muted">Chưa đọc được danh sách việc.</p>';
    var hn = new Date().toISOString().slice(0, 10);
    var o = '<div class="grid g4 mb">'+U.stat({ k:'Mới giao', v:so(K.dem.moi), d:'chưa bắt đầu' })+U.stat({ k:'Đang làm', v:so(K.dem.dangLam), d:'có bước đã xong', c:'#185AB4' })+
      U.stat({ k:'Trễ hạn', v:so(K.dem.tre), d:'cần chuyển người / gia hạn', c:'#BE0E16' })+U.stat({ k:'Đã xong', v:so(K.dem.xong), d:'đã đo lại chỉ số', c:'#0B7350' })+'</div>';
    if(K.quanLy && (K.taiViec||[]).length) o += U.sec('Tải việc từng người', 'Phân bổ dựa vào cột này: không giao thêm cho người đã có 3 việc mở') +
      '<div class="card pad-sm mb">'+K.taiViec.map(function(t){ return '<div class="co-dong"><b class="sm co-grow">'+h(t.u)+'</b><span class="co-so sm">'+t.mo+' việc mở</span>'+(t.tre ? '<span class="tiny" style="color:#BE0E16">'+t.tre+' trễ</span>' : '')+U.bar(Math.min(100, t.mo * 33), t.mo >= 3 ? '#BE0E16' : '#185AB4')+'</div>'; }).join('')+'</div>';
    if(!K.ds.length) return o + '<div class="card pad-sm"><b>'+(K.quanLy ? 'Chưa giao giải pháp nào.' : 'Anh/chị chưa được giao việc tối ưu nào.')+'</b>'+(K.quanLy ? ' <button class="btn sm" data-ttd="tab" data-v2="gp">Chọn giải pháp</button>' : '')+(K.mau ? '<p class="tiny muted" style="margin:6px 0 0">Tài khoản mẫu: giao thử ở thẻ Phân tích & giải pháp sẽ không lưu lên máy chủ.</p>' : '')+'</div>';
    o += K.ds.map(function(k){
      var mo = st.moKH === k.id, dong = k.trangThai === 'xong' || k.trangThai === 'huy', duoc = !dong && (K.quanLy || String(k.nguoiPhuTrach) === String((G.S.acc||{}).u)), kd = kpiDef(k.kpi) || { ten:k.kpi, dv:'' };
      var s = '<div class="card pad-sm mb" style="border-left:5px solid '+(k.tre ? '#BE0E16' : k.trangThai === 'xong' ? '#0B7350' : '#185AB4')+'"><div class="co-hang"><b class="co-grow sm">'+h(k.ten)+'</b><span class="co-tag">'+h(TEN_TTKH[k.trangThai] || k.trangThai)+'</span>'+
        '<button class="btn ghost sm" data-ttd="mo-kh" data-v2="'+h(k.id)+'">'+(mo ? 'Thu gọn' : 'Chi tiết')+'</button></div>'+
        '<div class="co-hang tiny muted mt"><span>'+h(k.nguoiPhuTrach)+'</span><span style="color:'+(k.tre ? '#BE0E16' : 'inherit')+'">hạn '+h(k.hanLuc)+(k.tre ? ' · TRỄ' : '')+'</span><span>'+h(kd.ten)+': đầu '+giaTri(kd, k.giaTriDau)+' → mục tiêu '+giaTri(kd, k.mucTieu)+(k.ketQua != null ? ' → <b>đo lại '+giaTri(kd, k.ketQua)+'</b>' : '')+'</span></div>'+U.bar(k.tienDo, k.trangThai === 'xong' ? '#0B7350' : '#185AB4');
      if(!mo) return s + '</div>';
      s += '<div class="mt">'+(k.buoc||[]).map(function(b, i){ return '<label class="co-dong sm" style="cursor:'+(duoc?'pointer':'default')+'"><input type="checkbox" data-ttd-b="'+h(k.id)+'" data-i="'+i+'"'+(b.xong?' checked':'')+(duoc?'':' disabled')+'> <span class="co-grow"'+(b.xong?' style="text-decoration:line-through;opacity:.7"':'')+'>'+h(b.t)+'</span></label>'; }).join('')+'</div>';
      if(k.ghiChu) s += '<p class="tiny muted">'+h(k.ghiChu)+'</p>';
      if(duoc) s += '<div class="co-hang mt"><button class="btn pri sm" data-ttd="xong-kh" data-v2="'+h(k.id)+'">Đóng & đo lại</button>'+(K.quanLy ? '<button class="btn ghost sm" data-ttd="huy-kh" data-v2="'+h(k.id)+'">Huỷ</button>' : '')+'</div>';
      return s + '</div>';
    }).join('');
    return o;
  }

  /* ═══════════ THẺ: BẢN ĐỒ & QUY TRÌNH ═══════════ */
  function vBD(){
    var LOAI = { that:['Số thật','#0B7350'], mau:['Số mẫu','#B4720F'], ly:['Lý thuyết','#185AB4'] };
    var o = U.sec('Quy trình tối ưu khép kín', 'Bảy bước — mỗi vòng kết thúc bằng một lần đo lại') + '<div class="card pad-sm mb"><ol class="sm" style="margin:0;padding-left:20px;line-height:1.8">'+T().QUY_TRINH.map(function(q){ return '<li><b>'+h(q[0])+'</b> — '+h(q[1])+'</li>'; }).join('')+'</ol></div>';
    o += U.sec('Bản đồ gom màn', 'Mỗi khối dùng các màn này; màn số mẫu trùng việc đã ghi rõ màn thay thế') + T().KHOI.concat([{ ma:'TONG', ten:'Màn tổng quan cũ' }]).map(function(K){
      return '<div class="card pad-sm mb"><b class="sm">'+h(K.ten)+'</b><div class="mt">'+(T().BAN_DO[K.ma]||[]).map(function(m){ var L = LOAI[m[2]] || ['', '#73849F'];
        return '<div class="co-dong"><span class="co-tag" style="color:'+L[1]+';background:color-mix(in srgb,'+L[1]+' 13%,transparent);min-width:72px;text-align:center">'+h(L[0])+'</span><span class="co-grow sm">'+h(m[1])+(m[3] ? '<br><span class="tiny" style="color:#B4720F">'+h(m[3])+'</span>' : '')+'</span><button class="btn ghost sm" data-v="'+h(m[0])+'">Mở</button></div>'; }).join('')+'</div></div>'; }).join('');
    return o;
  }

  function tabs(){
    var ds = laQL() ? [['tong','Tổng quan','chart'],['khoi','Từng phòng ban','grid'],['vai','Từng vai & người','users'],['hd','Từng hoạt động','pulse'],['kt','Kết quả kiểm tra','shield'],['gp','Phân tích & giải pháp','star'],['tk','Triển khai','check'],['bd','Bản đồ & quy trình','compass']]
                    : [['tk','Việc tối ưu của tôi','check']];
    return '<div class="co-tabs" role="tablist">'+ds.map(function(x){ return '<button class="co-tab'+(st.tab===x[0]?' on':'')+'" role="tab" data-ttd="tab" data-v2="'+x[0]+'">'+ic(x[2],'w-3 h-3')+h(x[1])+'</button>'; }).join('')+'</div>';
  }

  /* Mở Trung tâm ở đúng chỗ từ màn khác (V50: màn gộp → tầng V20; thanh
     Áp dụng của màn học thuyết → giải pháp của đúng khối). Dùng một lần. */
  var choMo = null;
  G.TTD_MO = function(o){ choMo = o || null; };

  G.VIEWS['trung-tam-do'] = function(){
    if(!T()) return U.lockCard('Thiếu tham số Trung tâm đo lường.');
    if(!G.xemTrungTamDo()) return U.lockCard('Trung tâm đo lường & tối ưu dành cho đội ngũ.');
    var ai = String((G.S && G.S.acc && G.S.acc.u) || '') + '|' + lv();
    if(st.ai !== ai){ st = { ai:ai, lop:'vh', tab: laQL() ? 'tong' : 'tk', ngay:30, khoi:'TV', d:null, ls:null, kh:null, tai:{}, loi:{}, mo:'', giao:null, moKH:'', locVD:'' }; mau = null; }
    if(choMo && laQL()){ if(choMo.lop) st.lop = choMo.lop; if(choMo.tab){ st.lop = 'vh'; st.tab = choMo.tab; } if(choMo.khoi != null) st.locVD = choMo.khoi; }
    choMo = null;
    if(!laQL()) st.tab = 'tk';
    var o = U.ph({ eyebrow:'SUPER ADMIN · ĐO LƯỜNG & TỐI ƯU', ic:'chart', grad:1, t: laQL() ? 'Trung tâm đo lường & tối ưu' : 'Việc tối ưu của tôi',
      lead: laQL() ? 'Một chỗ đo toàn hệ: 7 khối gom 16 ban, 41 chỉ số, từng vai, từng người, từng hoạt động và kết quả kiểm tra — kèm phân tích, 2–5 giải pháp cho mỗi vấn đề, phân bổ người đúng vai và theo dõi triển khai tới khi đo lại.'
                   : 'Các giải pháp tối ưu Super Admin giao cho anh/chị: tick từng bước, đóng khi xong — máy tự đo lại chỉ số.' });
    /* Hộp thông báo trong hệ (src/hop-thong-bao.js) đứng ĐẦU màn cấp quản lý:
       yêu cầu tư vấn và việc chờ duyệt là việc của hôm nay, không phải số đo. */
    if(laQL() && G.htbKhoi) o += G.htbKhoi();
    /* Trang công khai (src/do-trang-cong-khai.js): khách làm gì trước khi đăng ký. */
    if(laQL() && G.dtcKhoi) o += G.dtcKhoi();
    if(!coMayChu()) o += '<div class="co-mau">'+ic('alert','w-4 h-4')+'<span><b>Ví dụ minh hoạ.</b> Số liệu giả định, chấm bằng đúng công thức đang chạy ở máy chủ. Đăng nhập tài khoản thật trên máy chủ của Học viện để xem số thật và giao việc.</span></div>';
    if(laQL()) o += '<div class="co-hang mb" role="group" aria-label="Tầng xem"><button class="btn '+(st.lop==='vh'?'pri':'ghost')+'" data-ttd="lop" data-v2="vh">'+ic('pulse','w-3 h-3')+'Vận hành · hôm nay</button>'+
      '<button class="btn '+(st.lop==='v20'?'pri':'ghost')+'" data-ttd="lop" data-v2="v20">'+ic('target','w-3 h-3')+'Chiến lược V20 · đi về đâu</button></div>';
    if(laQL() && st.lop === 'v20' && G.TTD_V20) return o + G.TTD_V20.ve();
    o += tabs();
    if(st.tab === 'tk') return o + vTK();
    if(st.tab === 'bd') return o + vBD();
    canDo(); canKH();
    var d = st.d;
    o += thanhKy();
    if(!d || !d.ok) return o + (choTai('d') || '<p class="sm muted">Chưa có số liệu.</p>');
    o += st.tab === 'khoi' ? vKhoi(d) : st.tab === 'vai' ? vVai(d) : st.tab === 'hd' ? vHD(d) : st.tab === 'kt' ? vKT(d) : st.tab === 'gp' ? vGP(d) : vTong(d);
    return o;
  };

  function giaoMau(g, x, nguoi, han, muc){
    var hn = new Date(); hn.setDate(hn.getDate() + han);
    st.kh.ds.unshift({ id:'MAU-' + Date.now().toString(36), maGiaiPhap:g.ma, kpi:x.ma, khoi:x.khoi, ten:g.ten, giaTriDau:x.gt, mucTieu:muc, nguoiPhuTrach:nguoi || g.vai[0], hanLuc:hn.toISOString().slice(0, 10),
      trangThai:'moi', buoc:g.buoc.map(function(t){ return { t:t, xong:false }; }), tienDo:0, tre:false });
    st.kh.dem.moi++;
  }
  document.addEventListener('click', function(e){
    var el = e.target.closest && e.target.closest('[data-ttd]'); if(!el) return;
    var a = el.getAttribute('data-ttd'), v = el.getAttribute('data-v2'); e.preventDefault();
    if(a === 'tab') st.tab = v;
    else if(a === 'lop') st.lop = v === 'v20' ? 'v20' : 'vh';
    else if(a === 'mo-vd-ngoai'){ st.lop = 'vh'; st.tab = 'gp'; st.mo = v; st.giao = null; st.locVD = ''; setTimeout(function(){ var n = document.getElementById('vd-' + v); if(n && n.scrollIntoView) n.scrollIntoView({ block:'start' }); }, 60); }
    else if(a === 'ky'){ st.ngay = Number(v); st.d = null; }
    else if(a === 'lam-moi'){ st.d = null; st.ls = null; st.kh = null; }
    else if(a === 'khoi') st.khoi = v;
    else if(a === 'mo-khoi'){ st.khoi = v; st.tab = 'khoi'; }
    else if(a === 'loc-vd') st.locVD = v || '';
    else if(a === 'mo-vd'){ st.tab = 'gp'; st.mo = st.mo === v && el.closest('#vd-' + v) ? '' : v; st.giao = null; setTimeout(function(){ var n = document.getElementById('vd-' + v); if(n && n.scrollIntoView) n.scrollIntoView({ block:'start' }); }, 30); }
    else if(a === 'mo-kh') st.moKH = st.moKH === v ? '' : v;
    else if(a === 'giao'){
      st.giao = { ma:v, kpi:el.getAttribute('data-kpi'), dangTai:true, ungVien:[] };
      if(coMayChu()) G.goiMayChu('goiYPhanBo', { maGiaiPhap:v }).then(function(r){ if(st.giao && st.giao.ma === v){ st.giao.dangTai = false; st.giao.ungVien = (r && r.ungVien) || []; st.giao.chon = r && r.chon; } veLai(); });
      else { st.giao.dangTai = false; st.giao.ungVien = []; }
    }
    else if(a === 'giao-huy') st.giao = null;
    else if(a === 'giao-ok'){
      var gi = st.giao; if(!gi) return;
      var V = T().VAN_DE[gi.kpi], g = V.gp.filter(function(z){ return z.ma === gi.ma; })[0], x = (st.d.kpi || []).filter(function(z){ return z.ma === gi.kpi; })[0];
      var n2 = String((document.getElementById('ttd-nguoi2') || {}).value || '').trim(), n1 = String((document.getElementById('ttd-nguoi') || {}).value || '').trim();
      var han = Number((document.getElementById('ttd-han') || {}).value) || g.han, muc = (document.getElementById('ttd-muc') || {}).value;
      if(!coMayChu()){ canKH(); giaoMau(g, x, n2 || n1, han, muc === '' ? null : Number(muc)); st.giao = null; U.toast('Đã giao (ví dụ — không lưu máy chủ).', 'ok'); st.tab = 'tk'; veLai(); return; }
      G.goiMayChu('taoKeHoachToiUu', { maGiaiPhap:g.ma, ten:g.ten, buoc:g.buoc, nguoiPhuTrach:n2 || n1, hanNgay:han, giaTriDau:x ? x.gt : null, mucTieu:muc }).then(function(r){
        if(r && r.ok){ U.toast('Đã giao cho ' + r.nguoiPhuTrach + ' · hạn ' + r.hanLuc + (r.cachChon === 'tuPhanBo' ? ' (máy phân bổ)' : '') + '.', 'ok'); st.giao = null; st.kh = null; st.tab = 'tk'; }
        else U.toast((r && r.error) || 'Chưa giao được.', 'err');
        veLai();
      });
      return;
    }
    else if(a === 'xong-kh' || a === 'huy-kh'){
      var tt = a === 'xong-kh' ? 'xong' : 'huy';
      if(!coMayChu()){ (st.kh.ds || []).forEach(function(k){ if(k.id === v){ if(tt === 'xong' && k.buoc.some(function(b){ return !b.xong; })) { U.toast('Còn bước chưa xong — tick đủ các bước rồi mới đóng.', 'err'); return; } k.trangThai = tt; } }); veLai(); return; }
      G.goiMayChu('capNhatKeHoachToiUu', { id:v, trangThai:tt }).then(function(r){
        if(r && r.ok){ U.toast(tt === 'xong' ? 'Đã đóng. Đo lại: ' + (r.ketQua == null ? 'chưa có số' : r.ketQua) + ' (đầu kỳ ' + (r.giaTriDau == null ? '—' : r.giaTriDau) + ').' : 'Đã huỷ kế hoạch.', 'ok'); st.kh = null; }
        else U.toast((r && r.error) || 'Chưa cập nhật được.', 'err');
        veLai();
      });
      return;
    }
    veLai();
  });
  document.addEventListener('change', function(e){
    var el = e.target.closest && e.target.closest('[data-ttd-b]'); if(!el) return;
    var id = el.getAttribute('data-ttd-b'), k = (st.kh && st.kh.ds || []).filter(function(z){ return z.id === id; })[0]; if(!k) return;
    k.buoc[Number(el.getAttribute('data-i'))].xong = el.checked;
    var xong = []; k.buoc.forEach(function(b, i){ if(b.xong) xong.push(i); });
    k.tienDo = Math.round(100 * xong.length / k.buoc.length);
    if(!coMayChu()){ if(k.trangThai === 'moi' && xong.length) k.trangThai = 'dangLam'; veLai(); return; }
    G.goiMayChu('capNhatKeHoachToiUu', { id:id, buocXong:xong }).then(function(r){ if(r && r.ok){ k.trangThai = r.trangThai; k.tienDo = r.tienDo; } else U.toast((r && r.error) || 'Chưa lưu được.', 'err'); veLai(); });
  });
})();
