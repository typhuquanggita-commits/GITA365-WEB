/* ═══════════════════════════════════════════════════════════════
   GITA 365 — TRA CỨU GIẢI PHÁP · 13 MỤC (chủ hệ 10/10/2026)

   Một vấn đề → mười ba mục, đọc THẲNG từ kho nghề đã có, không chép thêm
   bản thứ hai:
     · phác đồ (G.PHACDO) · tình huống (G.TINHHUONG)
     · quy trình riêng của nhóm (G.QT_NHOM) · chiều sâu năm cấp (G.PD_SAU)
     · khung bảy bước xử lý ca (G.QUYTRINH_XL)
   Hai mục kho chưa từng có (Tư duy 20/80, Kỹ năng xử lý) và hai mục kho
   chỉ có một phần (Phương án, Tham vấn) có nút NHỜ MÁY SOẠN NHÁP — bản nháp
   gắn nhãn rõ, không tự vào kho. Mục Sổ nhật ký, Kết quả và Bài học rút ra
   đọc từ sổ nhật ký giải pháp trên máy chủ: chúng lớn lên theo việc thật.

   Đối tượng: từ chuyên viên tư vấn trở lên — quyền `ca_xu_ly` (R01–R11),
   cùng ngưỡng với cổng máy chủ (may-chu/tra-cuu-giai-phap.js).

   Mục nào kho chưa có thì NÓI là chưa có — một ô trống trông như "đã xem
   rồi, không có gì" sẽ đánh lừa người đang xử lý ca.
   ═══════════════════════════════════════════════════════════════ */
(function(){
'use strict';
var G = window.G, U = G.U, h = U.h, ic = U.ic;

var TC = G.TCGP = G.TCGP || { q:'', chon:null, nk:{}, nhap:{}, dangSoan:{}, dangGhi:false, ngan:'kh', k:{}, kvd:{}, nap:null, cao:null, kcvd:{}, caoTang:0, caoHang:'', gia:null, gio:[], gui:null, nhaXem:'', dxNha:null, napCao:null };

function chuan(s){ return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd'); }

/* Danh sách vấn đề: phác đồ + tình huống. Mã tình huống = tầng-stt (cùng
   khoá với tinhHuongModal) để một mã trỏ được về đúng một bản ghi. */
function dsVanDe(){
  var ds = [];
  (G.PHACDO || []).forEach(function(p){
    ds.push({ loai:'pd', ma:p.ma, ten:p.ten, nhom:p.nhom, nhomTen:p.nhomTen || '', goc:p });
  });
  (G.TINHHUONG || []).forEach(function(x){
    ds.push({ loai:'th', ma:'TH-' + x.tang + '-' + x.stt, ten:x.th, nhom:x.nhom, nhomTen:x.nhom || '', tang:x.tang, goc:x });
  });
  return ds;
}
/* ── TỶ LỆ XEM THEO VAI (G.TCGP_TY_LE) ──
   Xếp hạng trên TOÀN danh sách (tầng thấp trước, rồi thứ tự gốc) rồi cắt ở
   ceil(tổng × pt%). Xếp trên toàn danh sách, không trên kết quả tìm: lọc
   trước rồi mới cắt thì mẫu số đổi theo chữ người ta gõ, và cùng một vấn
   đề lúc mở lúc khoá. Cùng cách cắt với trần 30% của khách (kho-khach.js). */
function soTang(v){ var m = String(v == null ? '' : v).match(/(\d)/); var n = m ? Number(m[1]) : 1; return n >= 1 && n <= 5 ? n : 1; }
G.tcgpTyLe = function(vai){
  var bang = G.TCGP_TY_LE || [];
  for(var i = 0; i < bang.length; i++) if(bang[i].vai.indexOf(vai) >= 0) return bang[i].pt;
  return 0;
};
var HANG = null, HANG_KHOA = '';
function bangHang(ds){
  var khoa = ds.length + '|' + (ds[0] ? ds[0].ma : '');
  if(HANG && HANG_KHOA === khoa) return HANG;
  var xep = ds.map(function(v, i){ return { ma:v.ma, t:soTang(v.loai === 'pd' ? v.goc.tang : v.tang), i:i }; })
    .sort(function(a, b){ return a.t - b.t || a.i - b.i; });
  HANG = {}; xep.forEach(function(x, r){ HANG[x.ma] = r; });
  HANG_KHOA = khoa;
  return HANG;
}
G.tcgpMo = function(vai, ds){
  ds = ds || dsVanDe();
  var pt = G.tcgpTyLe(vai), tong = ds.length, so = Math.ceil(tong * pt / 100), hang = bangHang(ds);
  return { pt:pt, tong:tong, so:so, mo:function(ma){ return hang[ma] != null && hang[ma] < so; } };
};

function timVanDe(ma){
  var ds = dsVanDe();
  for(var i = 0; i < ds.length; i++) if(ds[i].ma === ma) return ds[i];
  return null;
}

function muc(so, ten, than, chuThich){
  return '<div class="card pad-sm mb tcgp-muc">' +
    '<div class="row" style="gap:8px;align-items:baseline;margin-bottom:6px">' +
      '<b class="mono" style="color:var(--gita)">' + so + '</b><b class="sm">' + h(ten) + '</b>' +
      (chuThich ? '<span class="tiny muted">· ' + h(chuThich) + '</span>' : '') + '</div>' + than + '</div>';
}
function doan(s){ return s ? '<p class="sm" style="line-height:1.7">' + h(s) + '</p>' : ''; }
function chuaCo(s){ return '<p class="sm muted">' + h(s || 'Kho chưa có phần này cho vấn đề này.') + '</p>'; }

/* Nút nhờ máy soạn nháp + chỗ hiện bản nháp đã soạn. */
function vungSoan(vd, maMuc){
  var k = vd.ma + '|' + maMuc, n = TC.nhap[k];
  if(n && n.nhap)
    return '<div class="card pad-sm mt" style="border-style:dashed">' +
      '<div class="tiny up mb" style="color:var(--gita-do-ink)">BẢN NHÁP MÁY SOẠN — CHƯA DUYỆT</div>' +
      n.nhap.split(/\n+/).map(function(d){ return '<p class="sm" style="line-height:1.7">' + h(d) + '</p>'; }).join('') +
      '<p class="tiny muted mt">' + h(n.vi || '') + '</p></div>';
  var dang = !!TC.dangSoan[k];
  if(!(G.API_CAP_PHEP && G.PHIEN_TOKEN))
    return '<p class="tiny muted mt">Nhờ máy soạn nháp cần đăng nhập bằng tài khoản thật trên máy chủ.</p>';
  return '<button class="btn sm mt" data-tcgp-soan="' + h(maMuc) + '"' + (dang ? ' disabled' : '') + '>' +
    ic('spark', 'w-3 h-3') + (dang ? 'Đang soạn…' : 'Nhờ máy soạn nháp mục này') + '</button>' +
    (n && n.loi ? '<p class="tiny mt" style="color:var(--gita-do-ink)">' + h(n.loi) + '</p>' : '');
}

/* Bối cảnh gửi kèm khi soạn nháp: chỉ chữ của KHO (phân tích · phác đồ ·
   các bước) — không bao giờ có dữ liệu của một gia đình. */
function boiCanh(vd, q){
  var g = vd.goc, s = [];
  if(vd.loai === 'pd'){ if(g.nguyenNhan) s.push('Nguyên nhân: ' + g.nguyenNhan); if(g.giaiPhap) s.push('Giải pháp: ' + g.giaiPhap); }
  else { if(g.pt) s.push('Phân tích: ' + g.pt); if(g.gp) s.push('Giải pháp: ' + g.gp); if(g.chot) s.push('Mấu chốt: ' + g.chot); }
  if(q && (q.buoc || []).length) s.push('Các bước: ' + q.buoc.map(function(b){ return b.lam; }).join(' / '));
  return s.join('\n').slice(0, 2400);
}

function veChiTiet(vd){
  var g = vd.goc, pd = vd.loai === 'pd';
  var q = (G.QT_NHOM || []).filter(function(x){ return x.nhom === vd.nhom; })[0] || null;
  var sau = pd ? (G.PD_SAU || {})[vd.nhom] : (G.TH_SAU || {})[vd.nhom];
  var nk = TC.nk[vd.ma];
  var o = '';

  /* 1 · Vấn đề */
  o += muc('01', 'Vấn đề', '<b class="sm" style="display:block;margin-bottom:4px">' + h(vd.ten) + '</b>' +
    '<div class="row wrap" style="gap:6px">' + U.chip(pd ? vd.ma : vd.tang) + (vd.nhomTen ? U.chip(vd.nhomTen, 'var(--gita)') : '') + '</div>' +
    (!pd ? doan(g.mo) : ''), pd ? 'phác đồ' : 'tình huống');

  /* 2 · Phân tích theo quy trình */
  var pt = pd ? g.nguyenNhan : g.pt;
  var khung = (G.QUYTRINH_XL || []).map(function(b){ return b.ten; }).filter(Boolean);
  o += muc('02', 'Phân tích vấn đề (theo quy trình)',
    (pt ? doan(pt) : chuaCo()) +
    (khung.length ? '<p class="tiny muted mt">Đi theo khung ' + khung.length + ' bước xử lý ca: ' + h(khung.join(' → ')) + '</p>' : ''));

  /* 3 · Phác đồ xử lý */
  var pdo = pd ? [['Giải pháp', g.giaiPhap], ['Việc của người lớn', g.ph], ['Việc của Coach', g.coach]] : [['Giải pháp theo tầng', g.gp]];
  var coPd = pdo.filter(function(x){ return x[1]; });
  o += muc('03', 'Phác đồ xử lý', coPd.length ? coPd.map(function(x){ return '<p class="sm mb" style="line-height:1.7"><b>' + h(x[0]) + ':</b> ' + h(x[1]) + '</p>'; }).join('') : chuaCo());

  /* 4 · Tư duy 20/80 */
  o += muc('04', 'Tư duy 20/80 trong xử lý',
    (!pd && g.chot ? '<p class="sm" style="line-height:1.7"><b>Điểm mấu chốt (kho):</b> ' + h(g.chot) + '</p>' : chuaCo('Kho chưa khai riêng 20% việc tạo 80% thay đổi cho vấn đề này.')) +
    vungSoan(vd, 'tuDuy2080'));

  /* 5 · Kỹ năng xử lý */
  var kn = sau && sau.c ? ['C1','C2','C3','C4','C5'].map(function(c){ return sau.c[c] && sau.c[c].lam ? c + ' · ' + sau.c[c].lam : ''; }).filter(Boolean) : [];
  o += muc('05', 'Kỹ năng xử lý',
    (kn.length ? '<p class="tiny muted mb">Năm cấp làm được (chiều sâu của nhóm):</p>' + U.list(kn) : chuaCo('Kho chưa khai kỹ năng cho vấn đề này.')) +
    vungSoan(vd, 'kyNang'));

  /* 6 · Các bước xử lý */
  var buoc = q ? (q.buoc || []).map(function(b){ return (b.ma ? b.ma + ' · ' : '') + b.lam; }) : [];
  o += muc('06', 'Các bước xử lý',
    (buoc.length ? U.list(buoc) : '') + (!pd && g.tt ? '<p class="sm mt" style="line-height:1.7"><b>Thử thách 7 ngày:</b> ' + h(g.tt) + '</p>' : '') +
    (!buoc.length && !(!pd && g.tt) ? chuaCo() : ''), q ? q.ten : '');

  /* 7 · Sổ nhật ký giải pháp */
  o += muc('07', 'Sổ nhật ký giải pháp', veSo(vd, nk), 'mỗi lần đem ra dùng');

  /* 8 · Lưu ý */
  var luuY = [];
  if(sau && sau.y) luuY.push(sau.y);
  if(q) (q.buoc || []).forEach(function(b){ if(b.bay) luuY.push('Bẫy · ' + b.bay); });
  o += muc('08', 'Các lưu ý khi xử lý',
    (luuY.length ? U.list(luuY) : '') +
    (q && (q.dungNgay || []).length ? '<div class="tiny up mt" style="color:var(--gita-do-ink)">DỪNG NGAY VÀ BÁO CẤP TRÊN</div>' + U.list(q.dungNgay, 'var(--gita-do)') : '') +
    (!luuY.length && !(q && (q.dungNgay || []).length) ? chuaCo() : ''));

  /* 9 · Tham vấn chuyên gia */
  o += muc('09', 'Tham vấn chuyên gia',
    (q && q.chuyenTuyen ? '<p class="sm" style="line-height:1.7"><b>Chuyển tuyến (kho):</b> ' + h(q.chuyenTuyen) + '</p>' : chuaCo('Kho chưa khai ngưỡng tham vấn cho nhóm này.')) +
    vungSoan(vd, 'thamVan'));

  /* 10 · Các phương án */
  o += muc('10', 'Các phương án xử lý', chuaCo('Kho chỉ có một phác đồ chính cho vấn đề này — chưa khai các phương án thay thế.') + vungSoan(vd, 'phuongAn'));

  /* 11 · Kết quả */
  var dich = g.dich;
  o += muc('11', 'Kết quả',
    (dich ? '<p class="sm" style="line-height:1.7"><b>Đích cần đạt (kho):</b> ' + h(dich) + '</p>' : '') +
    (nk && nk.tong ? '<p class="sm mt"><b>Đã dùng ' + nk.tong + ' lần:</b> ' + nk.dem.tot + ' đạt · ' + nk.dem.motPhan + ' đạt một phần · ' + nk.dem.chua + ' chưa đạt.</p>'
      : '<p class="tiny muted mt">Chưa có lượt dùng nào trong sổ nhật ký — kết quả thật sẽ hiện ở đây.</p>'));

  /* 12 · Công cụ đánh giá */
  var cc = [];
  if(!pd && g.kpi) cc.push('KPI hoàn thành · ' + g.kpi);
  if(q) (q.doBang || []).forEach(function(d){ cc.push(d); });
  o += muc('12', 'Công cụ đánh giá kết quả', cc.length ? U.list(cc, 'var(--ok)') : chuaCo());

  /* 13 · Bài học */
  var bh = nk && nk.ds ? nk.ds.filter(function(r){ return r.baiHoc; }).slice(0, 5) : [];
  o += muc('13', 'Bài học rút ra',
    bh.length ? bh.map(function(r){ return '<p class="sm mb" style="line-height:1.7">' + h(r.baiHoc) + ' <span class="tiny muted">— ' + h(r.boiAi || '') + ' · ' + h(new Date(r.luc).toLocaleDateString('vi-VN')) + '</span></p>'; }).join('')
      : chuaCo('Chưa có bài học nào — ghi sổ nhật ký ở mục 07 sau mỗi lần dùng.'));
  return o;
}

function veSo(vd, nk){
  var o = '';
  if(!(G.API_CAP_PHEP && G.PHIEN_TOKEN)) return '<p class="tiny muted">Sổ nhật ký nằm trên máy chủ — đăng nhập bằng tài khoản thật để đọc và ghi.</p>';
  if(!nk) o += '<p class="tiny muted">Đang đọc sổ…</p>';
  else if(nk.loi) o += '<p class="tiny" style="color:var(--gita-do-ink)">' + h(nk.loi) + '</p>';
  else if(!nk.ds.length) o += '<p class="tiny muted">Chưa ai ghi lượt dùng nào cho vấn đề này.</p>';
  else o += U.tbl(['Ngày', 'Phương án', 'Kết quả', 'Đo bằng', 'Người ghi'], nk.ds.slice(0, 10).map(function(r){
    return [h(new Date(r.luc).toLocaleDateString('vi-VN')), h(r.phuongAn), h({ tot:'Đạt', motPhan:'Đạt một phần', chua:'Chưa đạt' }[r.ketQua] || r.ketQua), h(r.danhGia || ''), h(r.boiAi || '')];
  }));
  o += '<details class="mt"><summary class="sm" style="cursor:pointer;color:var(--gita-ink)">' + ic('plus', 'w-3 h-3') + ' Ghi một lượt dùng</summary>' +
    '<div class="mt" style="display:grid;gap:8px">' +
      '<textarea id="tcgpPa" class="inp" rows="2" placeholder="Phương án đã dùng (không ghi tên, số điện thoại gia đình)"></textarea>' +
      '<select id="tcgpKq" class="inp"><option value="tot">Đạt</option><option value="motPhan">Đạt một phần</option><option value="chua">Chưa đạt</option></select>' +
      '<input id="tcgpDg" class="inp" placeholder="Đo bằng công cụ nào, số đo bao nhiêu">' +
      '<textarea id="tcgpBh" class="inp" rows="2" placeholder="Bài học rút ra"></textarea>' +
      '<div><button class="btn sm pri" data-tcgp-ghi="1"' + (TC.dangGhi ? ' disabled' : '') + '>' + ic('check', 'w-3 h-3') + (TC.dangGhi ? 'Đang ghi…' : 'Ghi vào sổ') + '</button></div>' +
    '</div></details>';
  return o;
}

function napSo(ma){
  if(!(G.API_CAP_PHEP && G.PHIEN_TOKEN && G.goiMayChu)) return;
  G.goiMayChu('docNhatKyGiaiPhap', { maVanDe:ma }, { moi:true }).then(function(r){
    TC.nk[ma] = r && r.ok ? r : { loi:(r && r.error) || 'Chưa đọc được sổ.', ds:[], dem:{}, tong:0 };
    if(G.S.view === 'tra-cuu-gp' && G.render) G.render();
  });
}

/* ═══════════ KHO 1000 VẤN ĐỀ — đọc từ MÁY CHỦ ═══════════
   500 vấn đề khách hàng · 500 vấn đề nội bộ. Nội dung không nằm trong gói
   gửi xuống máy: máy chủ chỉ gửi TÊN cho cả danh sách và gửi NỘI DUNG cho
   đúng phần trăm vai được xem — tỷ lệ ở đây được cắt thật ở máy chủ. */
var NGAN = [['kh', 'Khách hàng · 500'], ['ns', 'Nội bộ · 500'], ['nghe', 'Phác đồ & tình huống'], ['cao', 'Cấp cao · 6 hạng']];
/* Cùng ngưỡng với cổng máy chủ (may-chu/kho-cao.js → docDuocHe): hệ Coach
   (tầng 4–5) mở cho R01–R07; hệ Tư vấn (tầng 1–3) mở thêm cho R11. Màn chỉ
   ẩn ngăn; máy chủ mới là cổng. */
function lvCao(){ var r = (G.ROLES || []).filter(function(x){ return x.id === G.S.role; })[0]; return r ? r.lv : 99; }
function moHeCao(he){ var b = lvCao(); return he === 'coach' ? b <= 7 : he === 'tuvan' ? (b <= 7 || b === 11) : false; }
function moCao(){ return moHeCao('coach') || moHeCao('tuvan'); }
var HE_CAO = { coach:{ ten:'Hệ Coach', tang:[4, 5] }, tuvan:{ ten:'Hệ Tư vấn', tang:[1, 2, 3] } };
function heCao(){ var he = TC.caoHe || (moHeCao('coach') ? 'coach' : 'tuvan'); return moHeCao(he) ? he : 'tuvan'; }
function coMayChu(){ return !!(G.API_CAP_PHEP && G.PHIEN_TOKEN && G.goiMayChu); }
function napDsKho(loai){
  if(!coMayChu() || TC.k[loai] === 'dang') return;
  TC.k[loai] = 'dang';
  G.goiMayChu('dsKhoVanDe', { loai:loai }, { moi:true }).then(function(r){
    TC.k[loai] = r && r.ok ? r : { loi:(r && r.error) || 'Chưa đọc được kho.' };
    if(G.S.view === 'tra-cuu-gp' && G.render) G.render();
  });
}
function napVdKho(ma){
  TC.kvd[ma] = 'dang';
  G.goiMayChu('docKhoVanDe', { ma:ma }, { moi:true }).then(function(r){
    TC.kvd[ma] = r && r.ok ? r.vd : { loi:(r && r.error) || 'Chưa đọc được vấn đề.' };
    if(G.S.view === 'tra-cuu-gp' && G.render) G.render();
  });
}
function vanDeDangChon(){
  if(TC.ngan === 'nghe') return timVanDe(TC.chon);
  if(TC.ngan === 'cao'){ var c = TC.kcvd[TC.chon]; return c && c.ma ? c : null; }
  var v = TC.kvd[TC.chon];
  return v && v.ma ? v : null;
}
function veChiTietKho(vd){
  var p = vd.phanTich || {}, t = vd.t2080 || {}, tv = vd.thamVan || {}, nk = TC.nk[vd.ma];
  var CAP = ['', 'Cơ bản', 'Thường gặp', 'Cần kỹ năng', 'Phức tạp', 'Nhạy cảm cao'];
  var o = '';
  o += muc('01', 'Vấn đề', '<b class="sm" style="display:block;margin-bottom:4px">' + h(vd.ten) + '</b>' +
    '<div class="row wrap" style="gap:6px">' + U.chip(vd.ma) + U.chip(vd.nhomTen || vd.nhom, 'var(--gita)') +
      (vd.hang ? U.chip(vd.tenHang + ' · ' + vd.gia + ' credit', 'var(--gita-do)') + U.chip('Tầng ' + vd.tang) : U.chip('Cấp ' + vd.cap + ' · ' + (CAP[vd.cap] || ''))) + '</div>' + doan(vd.van),
    vd.hang ? 'kho cấp cao · ' + (vd.he === 'coach' ? 'Coach' : 'Tư vấn') : vd.loai === 'kh' ? 'khách hàng' : 'nội bộ');
  o += muc('02', 'Phân tích vấn đề (theo quy trình)', U.list([
    'Hiện tượng · ' + (p.hienTuong || ''), 'Bối cảnh · ' + (p.boiCanh || ''),
    'Nguyên nhân gốc · ' + (p.nguyenNhan || []).join(' / '), 'Tác động nếu để yên · ' + (p.tacDong || ''),
    'Điểm đòn bẩy · ' + (p.donBay || '')]), 'hiện tượng → bối cảnh → nguyên nhân → tác động → đòn bẩy');
  o += muc('03', 'Phác đồ xử lý', U.list(vd.phacDo || []));
  o += muc('04', 'Tư duy 20/80 trong xử lý', '<p class="tiny muted mb">20% việc tạo 80% thay đổi:</p>' + U.list(t.lam || [], 'var(--gita)') +
    (t.gac ? '<p class="sm mt" style="line-height:1.7"><b>Tạm gác:</b> ' + h(t.gac) + '</p>' : ''));
  o += muc('05', 'Kỹ năng xử lý', U.list(vd.kyNang || []));
  o += muc('06', 'Các bước xử lý', U.list((vd.buoc || []).map(function(b, i){ return (i + 1) + '. ' + String(b).replace(/^Bước\s*\d+\s*[:.\-–—]?\s*/i, ''); })));
  o += muc('07', 'Sổ nhật ký giải pháp', veSo(vd, nk), 'mỗi lần đem ra dùng');
  o += muc('08', 'Các lưu ý khi xử lý', U.list(vd.luuY || [], 'var(--gita-do)'));
  o += muc('09', 'Tham vấn chuyên gia', '<p class="sm" style="line-height:1.7"><b>Khi nào:</b> ' + h(tv.khi || '') + '</p>' +
    '<p class="sm" style="line-height:1.7"><b>Tham vấn ai:</b> ' + h(tv.ai || '') + '</p>');
  o += muc('10', 'Các phương án xử lý', (vd.phuongAn || []).map(function(x){
    return '<div class="mb"><b class="sm">' + h(x.ten) + '</b><p class="tiny muted">Khi: ' + h(x.khi) + '</p>' + doan(x.cach) + '</div>';
  }).join(''));
  o += muc('11', 'Kết quả', '<p class="sm" style="line-height:1.7"><b>Kết quả mong đợi:</b> ' + h(vd.ketQua || '') + '</p>' +
    (nk && nk.tong ? '<p class="sm mt"><b>Đã dùng ' + nk.tong + ' lần:</b> ' + nk.dem.tot + ' đạt · ' + nk.dem.motPhan + ' đạt một phần · ' + nk.dem.chua + ' chưa đạt.</p>'
      : '<p class="tiny muted mt">Chưa có lượt dùng nào trong sổ nhật ký — kết quả thật sẽ hiện ở đây.</p>'));
  o += muc('12', 'Công cụ đánh giá kết quả', U.list(vd.doBang || [], 'var(--ok)'));
  var bh = nk && nk.ds ? nk.ds.filter(function(r){ return r.baiHoc; }).slice(0, 5) : [];
  o += muc('13', 'Bài học rút ra', doan(vd.baiHoc) +
    bh.map(function(r){ return '<p class="sm mb" style="line-height:1.7">' + h(r.baiHoc) + ' <span class="tiny muted">— ' + h(r.boiAi || '') + ' · ' + h(new Date(r.luc).toLocaleDateString('vi-VN')) + '</span></p>'; }).join(''),
    bh.length ? 'kho + ' + bh.length + ' bài học của đội' : 'kho');
  if(vd.hang) o += muc('14', 'Gói giải pháp ở hạng ' + vd.tenHang, veGoi(vd), vd.gia + ' credit một lượt');
  return o;
}
/* Nạp gói mã hoá (chỉ Super Admin). Gói nằm trong kho mã ở dạng đã mã hoá
   AES-256-GCM; mật khẩu không nằm trong kho mã, không gửi lên máy chủ —
   máy này tự mở gói rồi gửi từng lô bản ghi đã mở cho cửa napKhoVanDe. */
function b64(s){ var b = atob(s), a = new Uint8Array(b.length); for(var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
function moGoi(matKhau, tep){
  return fetch(tep || 'kho-van-de/goi.enc', { cache:'no-store' }).then(function(r){
    if(!r.ok) throw new Error('Không tải được gói (mã ' + r.status + ').');
    return r.json();
  }).then(function(g){
    var enc = new TextEncoder();
    return crypto.subtle.importKey('raw', enc.encode(matKhau), 'PBKDF2', false, ['deriveKey']).then(function(k){
      return crypto.subtle.deriveKey({ name:'PBKDF2', salt:b64(g.salt), iterations:g.n, hash:'SHA-256' }, k, { name:'AES-GCM', length:256 }, false, ['decrypt']);
    }).then(function(key){
      return crypto.subtle.decrypt({ name:'AES-GCM', iv:b64(g.iv) }, key, b64(g.ct));
    }).catch(function(){ throw new Error('Sai mật khẩu gói, hoặc gói đã bị sửa.'); }).then(function(nen){
      var ds = new Blob([nen]).stream().pipeThrough(new DecompressionStream('gzip'));
      return new Response(ds).text();
    }).then(function(t){ return { ban:g.ban, ds:JSON.parse(t) }; });
  });
}
/* Dùng chung cho mọi gói cùng định dạng (sách nội bộ ở Phòng VVIP) — một
   hàm mở gói, không chép hàm thứ hai. */
G.moGoiMaHoa = moGoi;
function napGoi(matKhau){
  TC.nap = { dang:true, xong:0, tong:0, loi:'' }; G.render && G.render();
  moGoi(matKhau).then(function(goi){
    var ds = goi.ds, LO = 50, i = 0;
    TC.nap.tong = ds.length;
    function lo(){
      if(i >= ds.length){ TC.nap.dang = false; TC.k = {}; U.toast('Đã nạp ' + ds.length + ' vấn đề vào kho.', 'ok'); G.render && G.render(); return; }
      return G.goiMayChu('napKhoVanDe', { ds:ds.slice(i, i + LO), ban:goi.ban }).then(function(r){
        if(!(r && r.ok)) throw new Error(((r && r.error) || 'Máy chủ từ chối lô.') + (r && r.hong ? ' ' + r.hong.slice(0, 3).join(' · ') : ''));
        i += LO; TC.nap.xong = Math.min(i, ds.length); G.render && G.render();
        return lo();
      });
    }
    return lo();
  }).catch(function(e){ TC.nap.dang = false; TC.nap.loi = String(e && e.message || e); G.render && G.render(); });
}
function veNap(){
  if(G.S.role !== 'R01') return '';
  var n = TC.nap;
  return '<details class="card pad-sm mb"' + (n && (n.dang || n.loi) ? ' open' : '') + '><summary class="sm" style="cursor:pointer">' + ic('lock', 'w-3 h-3') +
    ' Super Admin · nạp hoặc cập nhật kho 1000 vấn đề từ gói mã hoá</summary>' +
    '<div class="mt" style="display:grid;gap:8px">' +
      '<p class="tiny muted">Mật khẩu gói nằm trong Google Drive của chủ hệ (tài liệu “GITA365 — Mật khẩu gói Kho 1000 vấn đề”). Máy này tự mở gói; mật khẩu không gửi lên máy chủ.</p>' +
      '<input id="tcgpMk" class="inp" type="password" autocomplete="off" aria-label="Mật khẩu gói kho 1000 vấn đề" placeholder="Mật khẩu gói">' +
      '<div><button class="btn sm pri" data-tcgp-nap="1"' + (n && n.dang ? ' disabled' : '') + '>' + ic('check', 'w-3 h-3') +
        (n && n.dang ? 'Đang nạp ' + n.xong + ' / ' + (n.tong || '…') : 'Mở gói và nạp') + '</button></div>' +
      (n && n.loi ? '<p class="tiny" style="color:var(--gita-do-ink)">' + h(n.loi) + '</p>' : '') +
    '</div></details>';
}
function veKho(loai, q){
  var o = veNap();
  if(!coMayChu()) return o + U.empty('Kho 1000 vấn đề nằm trên máy chủ', 'Đăng nhập bằng tài khoản thật để tra cứu — tài khoản trải nghiệm chỉ mở được phác đồ & tình huống trong máy.');
  var k = TC.k[loai];
  if(!k){ napDsKho(loai); k = 'dang'; }
  if(k === 'dang') return o + '<div class="card pad-sm"><p class="sm muted">Đang đọc kho…</p></div>';
  if(k.loi) return o + '<div class="card pad-sm"><p class="sm" style="color:var(--gita-do-ink)">' + h(k.loi) + '</p></div>';
  if(!k.tong) return o + U.empty('Kho chưa được nạp', 'Super Admin mở gói mã hoá để nạp 1000 vấn đề vào máy chủ.');
  o += '<p class="sm mb">' + ic(k.so < k.tong ? 'lock' : 'check', 'w-3 h-3') + ' Vai của anh/chị mở <b>' + k.pt + '%</b> kho ' + h(loai === 'kh' ? 'khách hàng' : 'nội bộ') +
    ': <b>' + k.so + '</b> / ' + k.tong + ' vấn đề' + (k.so < k.tong ? ', xếp từ cấp cơ bản lên. Vấn đề ngoài phần ấy hiện tên kèm ổ khoá.' : '.') + '</p>';
  var loc = q ? k.ds.filter(function(v){ return chuan(v.ten + ' ' + (k.nhomTen[v.nhom] || '') + ' ' + v.ma).indexOf(q) >= 0; }) : k.ds;
  o += '<div class="tcgp-lo"><div class="tcgp-ds"><input id="tcgpQ" class="inp" placeholder="Tìm vấn đề, nhóm hoặc mã…" value="' + h(TC.q) + '">' +
    '<p class="tiny muted mt mb">' + loc.length + ' / ' + k.ds.length + ' vấn đề</p>' +
    loc.slice(0, 60).map(function(v){
      if(!v.mo) return '<div class="card pad-sm mb tcgp-mot tcgp-khoa" title="Ngoài phần trăm vai này được xem">' +
        ic('lock', 'w-3 h-3') + ' <span class="mono tiny muted">' + h(v.ma) + '</span> <span class="sm muted">' + h(v.ten) + '</span></div>';
      return '<button class="card pad-sm lift mb tcgp-mot' + (TC.chon === v.ma ? ' on' : '') + '" data-tcgp-kho="' + h(v.ma) + '" style="text-align:left;width:100%">' +
        '<span class="mono tiny muted">' + h(v.ma) + ' · C' + v.cap + '</span> <b class="sm">' + h(v.ten) + '</b>' +
        '<div class="tiny muted">' + h(k.nhomTen[v.nhom] || '') + '</div></button>';
    }).join('') + (loc.length > 60 ? '<p class="tiny muted">… gõ thêm chữ để thu hẹp.</p>' : '') + '</div>';
  var vd = TC.kvd[TC.chon];
  o += '<div class="tcgp-ct">' + (vd && vd.ma && vd.loai === loai ? veChiTietKho(vd)
    : vd && vd.loi ? '<div class="card pad-sm"><p class="sm" style="color:var(--gita-do-ink)">' + h(vd.loi) + '</p></div>'
    : vd === 'dang' ? '<div class="card pad-sm"><p class="sm muted">Đang mở vấn đề…</p></div>'
    : '<div class="card pad-sm"><p class="sm muted">Chọn một vấn đề ở danh sách để xem đủ 13 mục.</p></div>') + '</div>';
  return o + '</div>';
}

/* ═══════════ KHO CẤP CAO · 6 HẠNG · TRẢ BẰNG CREDIT ═══════════
   Coach tầng 4–5: 2000 vấn đề, mỗi vấn đề một hạng (1 sao … Diamond).
   Hạng cao hơn = vấn đề phức tạp hơn và gói giải pháp sâu hơn; giá một
   lượt áp dụng do MÁY CHỦ tính (bảng giá Super Admin đặt) — màn không giữ
   bản giá thứ hai. An toàn không bao giờ bị khoá theo gói: lượt an toàn
   không trừ credit. */
var HANG_CAO = ['S1', 'S3', 'S5', 'VIP', 'VVIP', 'DIAMOND'];
function napGia(){
  if(!coMayChu() || TC.gia === 'dang') return;
  TC.gia = 'dang';
  G.goiMayChu('giaKhoCao', {}, { moi:true }).then(function(r){
    TC.gia = r && r.ok ? r : { loi:(r && r.error) || 'Chưa đọc được bảng giá.' };
    if(G.S.view === 'tra-cuu-gp' && G.render) G.render();
  });
}
function napCao(){
  if(!coMayChu() || TC.cao === 'dang') return;
  TC.cao = 'dang';
  G.goiMayChu('dsKhoCao', { he:heCao() }, { moi:true }).then(function(r){
    TC.cao = r && r.ok ? r : { loi:(r && r.error) || 'Chưa đọc được kho cấp cao.' };
    if(G.S.view === 'tra-cuu-gp' && G.render) G.render();
  });
}
function napVdCao(ma){
  TC.kcvd[ma] = 'dang';
  G.goiMayChu('docKhoCao', { ma:ma }, { moi:true }).then(function(r){
    TC.kcvd[ma] = r && r.ok ? r.vd : { loi:(r && r.error) || 'Chưa đọc được vấn đề.' };
    if(G.S.view === 'tra-cuu-gp' && G.render) G.render();
  });
}
function veGoi(vd){
  var g = vd.goi || {}, trong = TC.gio.indexOf(vd.ma) >= 0;
  var o = U.list(['Phạm vi · ' + (g.phamVi || ''), 'Cá nhân hoá · ' + (g.caNhanHoa || ''), 'Theo dõi · ' + (g.theoDoi || '')]) +
    '<p class="sm mt" style="line-height:1.7"><b>Gia đình cần làm:</b> ' + h(g.dieuKien || '') + '</p>' +
    '<p class="tiny muted mt">Giải pháp phát huy theo mức gia đình thực hiện. Không hứa kết quả.</p>';
  if(!coMayChu()) return o;
  return o + '<div class="row wrap mt" style="gap:8px"><button class="btn sm' + (trong ? '' : ' pri') + '" data-kc-gio="' + h(vd.ma) + '"' + (!trong && TC.gio.length >= 3 ? ' disabled title="Đề xuất tối đa 3 phương án"' : '') + '>' +
    ic(trong ? 'check' : 'plus', 'w-3 h-3') + (trong ? 'Đã có trong đề xuất · bỏ ra' : 'Thêm vào đề xuất cho nhà') + '</button></div>';
}
/* Giỏ đề xuất: Coach gom 1–3 phương án (thường là cùng vấn đề ở các hạng
   khác nhau) rồi gửi cho một nhà. Credit KHÔNG bị trừ ở bước này — nhà tự
   chọn trong ví credit của mình, lúc ấy mới trừ. */
function veGio(){
  var k = TC.cao && TC.cao.ds ? TC.cao.ds : [], tim = function(m){ return k.filter(function(v){ return v.ma === m; })[0]; };
  var o = '<div class="card pad-sm mb"><div class="tiny up mb">Đề xuất cho một nhà · ' + TC.gio.length + '/3 phương án</div>';
  o += TC.gio.length ? U.tbl(['Mã', 'Hạng', 'Credit', ''], TC.gio.map(function(m){ var v = tim(m) || {};
      return [h(m), h((TC.cao.tenHang || {})[v.hang] || v.hang || ''), h(String(v.gia || '')), '<button class="btn sm ghost" data-kc-gio="' + h(m) + '">Bỏ</button>']; }))
    : '<p class="tiny muted">Mở một vấn đề rồi bấm "Thêm vào đề xuất". Nên đưa cùng một hướng ở vài hạng để nhà chọn mức phù hợp.</p>';
  o += '<div class="row wrap mt" style="gap:8px"><input id="kcNha" class="inp" style="max-width:220px" aria-label="Mã khách hàng của nhà" placeholder="Mã khách hàng của nhà" value="' + h(TC.nhaXem) + '">' +
    '<input id="kcGhi" class="inp" style="flex:1;min-width:200px" aria-label="Lời nhắn cho nhà" placeholder="Lời nhắn cho nhà (không ghi tên, số điện thoại)">' +
    '<button class="btn sm pri" data-kc-gui="1"' + (!TC.gio.length || TC.gui === 'dang' ? ' disabled' : '') + '>' + ic('check', 'w-3 h-3') + 'Gửi đề xuất · nhà tự chọn</button></div>';
  o += '<p class="tiny muted mt">Credit chỉ bị trừ khi gia đình chọn một phương án trong ví credit của nhà.</p>';
  o += '<div class="row wrap mt" style="gap:8px"><button class="btn sm ghost" data-kc-xemnha="1">' + ic('compass', 'w-3 h-3') + 'Xem đề xuất của nhà này</button>' +
    '<button class="btn sm" data-kc-at="1" style="border-color:var(--gita-do);color:var(--gita-do-ink)">' + ic('shield', 'w-3 h-3') + 'Dấu hiệu an toàn · chuyển ngay, 0 credit</button></div>' +
    '<p class="tiny muted">An toàn không bao giờ bị khoá theo gói: tự làm đau, ý nghĩ tự tử, bạo lực, xâm hại → chuyển ngay, mọi hạng, không cần số dư. Bấm là báo ngay Giám đốc và Super Admin.</p>';
  var d = TC.dxNha;
  if(d && d.loi) o += '<p class="tiny mt" style="color:var(--gita-do-ink)">' + h(d.loi) + '</p>';
  else if(d && d.ds){
    o += d.ds.length ? '<div class="mt">' + U.tbl(['Đề xuất', 'Trạng thái', 'Phương án', ''], d.ds.map(function(x){
      var tt = { cho:'Chờ nhà chọn', chon:'Nhà đã chọn ' + x.maChon, huy:'Đã huỷ' }[x.trangThai] || x.trangThai;
      return [h(x.id), h(tt), h(x.phuongAn.map(function(p){ return p.ma + ' · ' + p.tenHang + ' · ' + p.gia; }).join(' | ')),
        x.trangThai === 'chon' ? '<button class="btn sm" data-kc-xong="' + h(x.id) + '">Ghi hoàn thành</button>'
        : x.trangThai === 'cho' ? '<button class="btn sm ghost" data-kc-huy="' + h(x.id) + '">Huỷ</button>' : ''];
    })) + '</div>' : '<p class="tiny muted mt">Nhà này chưa có đề xuất nào.</p>';
  }
  return o + '</div>';
}
function giaTriO(id){ var el = document.getElementById(id); return el ? el.value.trim() : ''; }
function napDxNha(){
  TC.nhaXem = giaTriO('kcNha') || TC.nhaXem;
  if(!TC.nhaXem){ U.toast('Nhập mã khách hàng của nhà.', 'err'); return; }
  G.goiMayChu('dsDeXuatNha', { maNha:TC.nhaXem }, { moi:true }).then(function(r){
    TC.dxNha = r && r.ok ? r : { loi:(r && r.error) || 'Chưa đọc được đề xuất.' };
    G.render && G.render();
  });
}
function veBangGia(){
  var g = TC.gia;
  if(!g){ napGia(); return ''; }
  if(g === 'dang' || g.loi) return '';
  var o = '<details class="card pad-sm mb"><summary class="sm" style="cursor:pointer">' + ic('star', 'w-3 h-3') + ' Bảng giá credit theo hạng × tầng' + (g.khoiDau ? ' · thang chủ hệ duyệt' : '') + '</summary>' +
    '<div class="mt">' + U.tbl(['Tầng'].concat(g.hang.map(function(x){ return g.tenHang[x]; })), HE_CAO[heCao()].tang.map(function(t){
      return ['Tầng ' + t].concat(g.hang.map(function(x){ return h(String(g.theoTang[t][x])); }));
    })) + '<p class="tiny muted mt">1 credit = 10đ. Hạng cao hơn = gói sâu hơn: nhiều buổi hơn, cá nhân hoá hơn, nhiều người hỗ trợ hơn, theo dõi dài hơn.' +
    (g.lyDo ? ' Lần sửa gần nhất: ' + h(g.lyDo) + '.' : '') + '</p>';
  if(G.S.role === 'R01'){
    o += '<div class="mt" style="display:grid;gap:8px"><p class="tiny up">Super Admin · sửa giá gốc (tầng 1–3) và hệ số tầng</p>' +
      '<div class="row wrap" style="gap:6px">' + g.hang.map(function(x){ return '<input class="inp" style="width:110px" data-kc-goc="' + x + '" aria-label="Giá gốc ' + h(g.tenHang[x]) + '" value="' + h(String(g.bang.goc[x])) + '">'; }).join('') + '</div>' +
      '<div class="row wrap" style="gap:6px">' + [1, 2, 3, 4, 5].map(function(t){ return '<input class="inp" style="width:90px" data-kc-heso="' + t + '" aria-label="Hệ số tầng ' + t + '" value="' + h(String(g.bang.heSo[t])) + '">'; }).join('') + '</div>' +
      '<input id="kcLyDo" class="inp" aria-label="Lý do đổi giá" placeholder="Lý do đổi giá (ít nhất 10 ký tự)">' +
      '<div><button class="btn sm pri" data-kc-gia="1">' + ic('check', 'w-3 h-3') + 'Lưu bảng giá mới</button></div></div>';
  }
  return o + '</div></details>';
}
function veNapCao(){
  if(G.S.role !== 'R01') return '';
  var n = TC.napCao;
  return '<details class="card pad-sm mb"' + (n && (n.dang || n.loi) ? ' open' : '') + '><summary class="sm" style="cursor:pointer">' + ic('lock', 'w-3 h-3') +
    ' Super Admin · nạp kho cấp cao từ gói mã hoá</summary>' +
    '<div class="mt" style="display:grid;gap:8px">' +
      '<p class="tiny muted">Mật khẩu gói nằm trong Google Drive của chủ hệ (tài liệu “GITA365 — Mật khẩu gói Kho cấp cao”). Máy này tự mở gói; mật khẩu không gửi lên máy chủ.</p>' +
      '<input id="kcMk" class="inp" type="password" autocomplete="off" aria-label="Mật khẩu gói kho cấp cao" placeholder="Mật khẩu gói">' +
      '<div><button class="btn sm pri" data-kc-nap="1"' + (n && n.dang ? ' disabled' : '') + '>' + ic('check', 'w-3 h-3') +
        (n && n.dang ? 'Đang nạp ' + n.xong + ' / ' + (n.tong || '…') : 'Mở gói và nạp') + '</button></div>' +
      (n && n.loi ? '<p class="tiny" style="color:var(--gita-do-ink)">' + h(n.loi) + '</p>' : '') +
    '</div></details>';
}
function napGoiCao(matKhau){
  TC.napCao = { dang:true, xong:0, tong:0, loi:'' }; G.render && G.render();
  moGoi(matKhau, 'kho-cao/goi.enc').then(function(goi){
    var ds = goi.ds, LO = 50, i = 0;
    TC.napCao.tong = ds.length;
    function lo(){
      if(i >= ds.length){ TC.napCao.dang = false; TC.cao = null; U.toast('Đã nạp ' + ds.length + ' vấn đề cấp cao.', 'ok'); G.render && G.render(); return; }
      return G.goiMayChu('napKhoCao', { ds:ds.slice(i, i + LO), ban:goi.ban }).then(function(r){
        if(!(r && r.ok)) throw new Error(((r && r.error) || 'Máy chủ từ chối lô.') + (r && r.hong ? ' ' + r.hong.slice(0, 3).join(' · ') : ''));
        i += LO; TC.napCao.xong = Math.min(i, ds.length); G.render && G.render();
        return lo();
      });
    }
    return lo();
  }).catch(function(e){ TC.napCao.dang = false; TC.napCao.loi = String(e && e.message || e); G.render && G.render(); });
}
function veCao(q){
  var o = veNapCao();
  if(!coMayChu()) return o + U.empty('Kho cấp cao nằm trên máy chủ', 'Đăng nhập bằng tài khoản thật để tra cứu.');
  o += veBangGia();
  var k = TC.cao, he = heCao(), T = HE_CAO[he].tang;
  if(k && k.he && k.he !== he){ TC.cao = k = null; }
  if(!k){ napCao(); k = 'dang'; }
  if(moHeCao('coach') && moHeCao('tuvan'))
    o = '<div class="row wrap mb" style="gap:6px">' + ['coach', 'tuvan'].map(function(x){
      return '<button class="btn sm' + (x === he ? ' pri' : '') + '" data-kc-he="' + x + '">' + h(HE_CAO[x].ten + ' · tầng ' + HE_CAO[x].tang[0] + '–' + HE_CAO[x].tang[HE_CAO[x].tang.length - 1]) + '</button>';
    }).join('') + '</div>' + o;
  if(k === 'dang') return o + '<div class="card pad-sm"><p class="sm muted">Đang đọc kho cấp cao…</p></div>';
  if(k.loi) return o + '<div class="card pad-sm"><p class="sm" style="color:var(--gita-do-ink)">' + h(k.loi) + '</p></div>';
  if(!k.tong) return o + U.empty('Kho cấp cao chưa được nạp', 'Super Admin mở gói mã hoá để nạp vấn đề tầng ' + T[0] + '–' + T[T.length - 1] + ' của ' + HE_CAO[he].ten.toLowerCase() + ' vào máy chủ.');
  o += veGio();
  o += '<p class="sm mb">' + ic('check', 'w-3 h-3') + ' <b>' + k.tong + '</b> vấn đề ' + h(HE_CAO[he].ten.toLowerCase()) + ' · tầng ' + T[0] + '–' + T[T.length - 1] + ' · ' + HANG_CAO.map(function(x){ return h(k.tenHang[x]) + ' ' + (k.dem[x] || 0); }).join(' · ') + '</p>';
  o += '<div class="row wrap mb" style="gap:6px">' +
    [[0, 'Mọi tầng']].concat(T.map(function(t){ return [t, 'Tầng ' + t]; })).map(function(t){ return '<button class="btn sm' + (TC.caoTang === t[0] ? ' pri' : '') + '" data-kc-tang="' + t[0] + '">' + h(t[1]) + '</button>'; }).join('') +
    '<span style="width:8px"></span>' +
    [['', 'Mọi hạng']].concat(HANG_CAO.map(function(x){ return [x, k.tenHang[x]]; })).map(function(x){ return '<button class="btn sm' + (TC.caoHang === x[0] ? ' pri' : '') + '" data-kc-hang="' + x[0] + '">' + h(x[1]) + '</button>'; }).join('') + '</div>';
  var loc = k.ds.filter(function(v){
    return (!TC.caoTang || v.tang === TC.caoTang) && (!TC.caoHang || v.hang === TC.caoHang) &&
      (!q || chuan(v.ten + ' ' + (k.nhomTen[v.nhom] || '') + ' ' + v.ma).indexOf(q) >= 0);
  });
  o += '<div class="tcgp-lo"><div class="tcgp-ds"><input id="tcgpQ" class="inp" placeholder="Tìm vấn đề, nhóm hoặc mã…" value="' + h(TC.q) + '">' +
    '<p class="tiny muted mt mb">' + loc.length + ' / ' + k.ds.length + ' vấn đề</p>' +
    loc.slice(0, 60).map(function(v){
      return '<button class="card pad-sm lift mb tcgp-mot' + (TC.chon === v.ma ? ' on' : '') + '" data-kc-chon="' + h(v.ma) + '" style="text-align:left;width:100%">' +
        '<span class="mono tiny muted">' + h(v.ma) + ' · ' + h(k.tenHang[v.hang] || v.hang) + ' · ' + h(String(v.gia)) + ' cr</span> <b class="sm">' + h(v.ten) + '</b>' +
        '<div class="tiny muted">' + h(k.nhomTen[v.nhom] || '') + '</div></button>';
    }).join('') + (loc.length > 60 ? '<p class="tiny muted">… gõ thêm chữ hoặc lọc tầng, hạng để thu hẹp.</p>' : '') + '</div>';
  var vd = TC.kcvd[TC.chon];
  o += '<div class="tcgp-ct">' + (vd && vd.ma ? veChiTietKho(vd)
    : vd && vd.loi ? '<div class="card pad-sm"><p class="sm" style="color:var(--gita-do-ink)">' + h(vd.loi) + '</p></div>'
    : vd === 'dang' ? '<div class="card pad-sm"><p class="sm muted">Đang mở vấn đề…</p></div>'
    : '<div class="card pad-sm"><p class="sm muted">Chọn một vấn đề để xem đủ 13 mục và gói giải pháp của hạng.</p></div>') + '</div>';
  return o + '</div>';
}
G.VIEWS['tra-cuu-gp'] = function(){
  if(!G.can('ca_xu_ly')) return U.lockCard();
  var q = chuan(TC.q);
  var o = U.ph({ eyebrow:'TRA CỨU · TỪ CHUYÊN VIÊN TƯ VẤN', ic:'compass', t:'Tra cứu giải pháp · 13 mục',
    lead:'Chọn một vấn đề: mười ba mục từ phân tích tới bài học, đọc từ kho 1000 vấn đề, kho nghề và sổ nhật ký của cả đội.' });
  o += '<div class="row wrap mb" role="tablist" style="gap:6px">' + NGAN.filter(function(n){ return n[0] !== 'cao' || moCao(); }).map(function(n){
    return '<button class="btn sm' + (TC.ngan === n[0] ? ' pri' : '') + '" role="tab" aria-selected="' + (TC.ngan === n[0]) + '" data-tcgp-ngan="' + n[0] + '">' + h(n[1]) + '</button>';
  }).join('') + '</div>';
  if(TC.ngan === 'cao') return o + (moCao() ? veCao(q) : U.lockCard());
  if(TC.ngan !== 'nghe') return o + veKho(TC.ngan, q);
  var ds = dsVanDe(), quyen = G.tcgpMo(G.S.role, ds);
  var loc = q ? ds.filter(function(v){ return chuan(v.ten + ' ' + v.nhomTen + ' ' + v.ma).indexOf(q) >= 0; }) : ds;
  if(!ds.length) return o + U.empty('Kho nghề chưa mở với tài khoản này', 'Phác đồ và tình huống nằm trong gói nghề — đăng nhập bằng tài khoản có quyền để mở.');
  o += '<p class="sm mb">' + ic(quyen.so < quyen.tong ? 'lock' : 'check', 'w-3 h-3') + ' Vai của anh/chị mở <b>' + quyen.pt + '%</b> kho tra cứu: <b>' + quyen.so + '</b> / ' + quyen.tong + ' vấn đề' +
    (quyen.so < quyen.tong ? ', xếp từ tầng thấp lên. Vấn đề ngoài phần ấy hiện tên kèm ổ khoá.' : '.') + '</p>';
  o += '<div class="tcgp-lo">';
  o += '<div class="tcgp-ds"><input id="tcgpQ" class="inp" placeholder="Tìm vấn đề, nhóm hoặc mã…" value="' + h(TC.q) + '">' +
    '<p class="tiny muted mt mb">' + loc.length + ' / ' + ds.length + ' vấn đề</p>' +
    loc.slice(0, 40).map(function(v){
      if(!quyen.mo(v.ma))
        return '<div class="card pad-sm mb tcgp-mot tcgp-khoa" title="Ngoài phần trăm vai này được xem">' +
          ic('lock', 'w-3 h-3') + ' <span class="mono tiny muted">' + h(v.loai === 'pd' ? v.ma : v.tang) + '</span> <span class="sm muted">' + h(v.ten) + '</span></div>';
      return '<button class="card pad-sm lift mb tcgp-mot' + (TC.chon === v.ma ? ' on' : '') + '" data-tcgp-chon="' + h(v.ma) + '" style="text-align:left;width:100%">' +
        '<span class="mono tiny muted">' + h(v.loai === 'pd' ? v.ma : v.tang) + '</span> <b class="sm">' + h(v.ten) + '</b>' +
        (v.nhomTen ? '<div class="tiny muted">' + h(v.nhomTen) + '</div>' : '') + '</button>';
    }).join('') +
    (loc.length > 40 ? '<p class="tiny muted">… gõ thêm chữ để thu hẹp.</p>' : '') + '</div>';
  var vd = TC.chon && quyen.mo(TC.chon) ? timVanDe(TC.chon) : null;
  o += '<div class="tcgp-ct">' + (vd ? veChiTiet(vd) : '<div class="card pad-sm"><p class="sm muted">Chọn một vấn đề ở danh sách để xem đủ 13 mục.</p></div>') + '</div>';
  return o + '</div>';
};

document.addEventListener('click', function(e){
  var ng = e.target.closest && e.target.closest('[data-tcgp-ngan]');
  if(ng){ TC.ngan = ng.getAttribute('data-tcgp-ngan'); TC.chon = null; TC.q = ''; G.render && G.render(); return; }
  var kc = e.target.closest && e.target.closest('[data-kc-chon]');
  if(kc){ var m2 = kc.getAttribute('data-kc-chon'); TC.chon = m2; if(!TC.kcvd[m2] || TC.kcvd[m2].loi) napVdCao(m2); if(!TC.nk[m2]) napSo(m2); G.render && G.render(); return; }
  var khe = e.target.closest && e.target.closest('[data-kc-he]');
  if(khe){ TC.caoHe = khe.getAttribute('data-kc-he'); TC.caoTang = 0; TC.cao = null; TC.chon = ''; TC.gio = []; G.render && G.render(); return; }
  var kt = e.target.closest && e.target.closest('[data-kc-tang]');
  if(kt){ TC.caoTang = Number(kt.getAttribute('data-kc-tang')) || 0; G.render && G.render(); return; }
  var kh = e.target.closest && e.target.closest('[data-kc-hang]');
  if(kh){ TC.caoHang = kh.getAttribute('data-kc-hang') || ''; G.render && G.render(); return; }
  var kg = e.target.closest && e.target.closest('[data-kc-gio]');
  if(kg){ var mg = kg.getAttribute('data-kc-gio'), vt = TC.gio.indexOf(mg);
    if(vt >= 0) TC.gio.splice(vt, 1); else if(TC.gio.length < 3) TC.gio.push(mg);
    G.render && G.render(); return; }
  if(e.target.closest && e.target.closest('[data-kc-gui]')){
    var nha = giaTriO('kcNha'); if(!nha){ U.toast('Nhập mã khách hàng của nhà.', 'err'); return; }
    TC.gui = 'dang'; TC.nhaXem = nha; G.render && G.render();
    G.goiMayChu('deXuatKhoCao', { maNha:nha, ds:TC.gio.slice(), ghiChu:giaTriO('kcGhi') }).then(function(r){
      TC.gui = null;
      if(r && r.ok){ U.toast('Đã gửi đề xuất ' + r.id + ' — nhà sẽ tự chọn trong ví credit.', 'ok'); TC.gio = []; napDxNha(); }
      else U.toast((r && r.error) || 'Chưa gửi được.', 'err');
      G.render && G.render();
    });
    return;
  }
  if(e.target.closest && e.target.closest('[data-kc-xemnha]')){ napDxNha(); return; }
  if(e.target.closest && e.target.closest('[data-kc-at]')){
    var nhaAt = giaTriO('kcNha'); if(!nhaAt){ U.toast('Nhập mã khách hàng của nhà để chuyển an toàn.', 'err'); return; }
    G.goiMayChu('chuyenAnToan', { maNha:nhaAt, ghiChu:giaTriO('kcGhi') }).then(function(r){
      U.toast(r && r.ok ? r.vi : ((r && r.error) || 'Chưa ghi được — báo ngay Trưởng nhóm Coach.'), r && r.ok ? 'ok' : 'err');
    });
    return;
  }
  var kx = e.target.closest && e.target.closest('[data-kc-xong]');
  if(kx){
    var bc = window.prompt('Bằng chứng gia đình đã làm (không ghi tên, số điện thoại):', '');
    if(bc == null) return;
    G.goiMayChu('hoanThanhKhoCao', { id:kx.getAttribute('data-kc-xong'), bangChung:bc }).then(function(r){
      U.toast(r && r.ok ? (r.choXacNhan ? r.vi : r.trung ? 'Gói này đã ghi hoàn thành trước đó.' : 'Đã ghi hoàn thành' + (r.thuong ? ' · nhà được thưởng ' + r.thuong + ' credit.' : '.' + (r.thuongLoi ? ' ' + r.thuongLoi : ''))) : ((r && r.error) || 'Chưa ghi được.'), r && r.ok ? 'ok' : 'err');
      napDxNha();
    });
    return;
  }
  var kh2 = e.target.closest && e.target.closest('[data-kc-huy]');
  if(kh2){
    G.goiMayChu('huyDeXuat', { id:kh2.getAttribute('data-kc-huy') }).then(function(r){
      U.toast(r && r.ok ? 'Đã huỷ đề xuất.' : ((r && r.error) || 'Chưa huỷ được.'), r && r.ok ? 'ok' : 'err'); napDxNha(); });
    return;
  }
  if(e.target.closest && e.target.closest('[data-kc-nap]')){
    var mkc = document.getElementById('kcMk'), mkcv = mkc ? mkc.value : '';
    if(G.S.role !== 'R01' || TC.napCao && TC.napCao.dang) return;
    if(mkcv.length < 12){ U.toast('Mật khẩu gói dài ít nhất 12 ký tự.', 'err'); return; }
    napGoiCao(mkcv); return;
  }
  if(e.target.closest && e.target.closest('[data-kc-gia]')){
    if(G.S.role !== 'R01') return;
    var goc = {}, heSo = {};
    document.querySelectorAll('[data-kc-goc]').forEach(function(el){ goc[el.getAttribute('data-kc-goc')] = Number(el.value); });
    document.querySelectorAll('[data-kc-heso]').forEach(function(el){ heSo[el.getAttribute('data-kc-heso')] = Number(el.value); });
    var ld = document.getElementById('kcLyDo');
    G.goiMayChu('datGiaKhoCao', { goc:goc, heSo:heSo, lyDo:ld ? ld.value : '' }).then(function(r){
      if(r && r.ok){ U.toast('Đã lưu bảng giá mới.', 'ok'); TC.gia = null; TC.cao = null; TC.kcvd = {}; }
      else U.toast((r && r.error) || 'Chưa lưu được.', 'err');
      if(G.render) G.render();
    });
    return;
  }
  var kb = e.target.closest && e.target.closest('[data-tcgp-kho]');
  if(kb){
    var mk = kb.getAttribute('data-tcgp-kho'), dsk = TC.k[TC.ngan];
    var dong = dsk && dsk.ds ? dsk.ds.filter(function(v){ return v.ma === mk; })[0] : null;
    if(!dong || !dong.mo) return;
    TC.chon = mk;
    if(!TC.kvd[mk] || TC.kvd[mk].loi) napVdKho(mk);
    if(!TC.nk[mk]) napSo(mk);
    G.render && G.render();
    return;
  }
  var nb = e.target.closest && e.target.closest('[data-tcgp-nap]');
  if(nb){
    var mkEl = document.getElementById('tcgpMk'), mkv = mkEl ? mkEl.value : '';
    if(G.S.role !== 'R01' || TC.nap && TC.nap.dang) return;
    if(mkv.length < 12){ U.toast('Mật khẩu gói dài ít nhất 12 ký tự.', 'err'); return; }
    napGoi(mkv);
    return;
  }
  var t = e.target.closest && e.target.closest('[data-tcgp-chon]');
  if(t){
    var ma0 = t.getAttribute('data-tcgp-chon');
    if(!G.tcgpMo(G.S.role).mo(ma0)) return;
    TC.chon = ma0;
    if(!TC.nk[TC.chon]) napSo(TC.chon);
    G.render && G.render();
    return;
  }
  var s = e.target.closest && e.target.closest('[data-tcgp-soan]');
  if(s){
    var vd = timVanDe(TC.chon); if(!vd) return;
    var maMuc = s.getAttribute('data-tcgp-soan'), k = vd.ma + '|' + maMuc;
    var qn = (G.QT_NHOM || []).filter(function(x){ return x.nhom === vd.nhom; })[0];
    TC.dangSoan[k] = true; G.render && G.render();
    G.goiMayChu('soanMucGiaiPhap', { muc:maMuc, tenVanDe:vd.ten, boiCanh:boiCanh(vd, qn) }).then(function(r){
      TC.dangSoan[k] = false;
      TC.nhap[k] = r && r.ok ? { nhap:r.nhap, vi:r.vi } : { loi:(r && r.error) || 'Chưa soạn được — thử lại sau.' };
      if(G.S.view === 'tra-cuu-gp' && G.render) G.render();
    });
    return;
  }
  var gb = e.target.closest && e.target.closest('[data-tcgp-ghi]');
  if(gb){
    var v2 = vanDeDangChon(); if(!v2) return;
    var gt = function(id){ var el = document.getElementById(id); return el ? el.value : ''; };
    TC.dangGhi = true;
    G.goiMayChu('ghiNhatKyGiaiPhap', { maVanDe:v2.ma, tenVanDe:v2.ten, phuongAn:gt('tcgpPa'), ketQua:gt('tcgpKq'), danhGia:gt('tcgpDg'), baiHoc:gt('tcgpBh') }).then(function(r){
      TC.dangGhi = false;
      if(r && r.ok){ U.toast('Đã ghi vào sổ nhật ký giải pháp.', 'ok'); napSo(v2.ma); }
      else U.toast((r && r.error) || 'Chưa ghi được.', 'err');
      if(G.render) G.render();
    });
  }
});
document.addEventListener('input', function(e){
  if(!e.target || e.target.id !== 'tcgpQ') return;
  TC.q = e.target.value;
  var pos = e.target.selectionStart;
  G.render && G.render();
  var el = document.getElementById('tcgpQ');
  if(el){ el.focus(); try { el.setSelectionRange(pos, pos); } catch(_e){} }
});

})();
