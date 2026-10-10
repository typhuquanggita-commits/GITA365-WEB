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

var TC = G.TCGP = G.TCGP || { q:'', chon:null, nk:{}, nhap:{}, dangSoan:{}, dangGhi:false };

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

G.VIEWS['tra-cuu-gp'] = function(){
  if(!G.can('ca_xu_ly')) return U.lockCard();
  var ds = dsVanDe(), q = chuan(TC.q);
  var loc = q ? ds.filter(function(v){ return chuan(v.ten + ' ' + v.nhomTen + ' ' + v.ma).indexOf(q) >= 0; }) : ds;
  var o = U.ph({ eyebrow:'TRA CỨU · TỪ CHUYÊN VIÊN TƯ VẤN', ic:'compass', t:'Tra cứu giải pháp · 13 mục',
    lead:'Chọn một vấn đề: mười ba mục từ phân tích tới bài học, đọc thẳng từ kho nghề và sổ nhật ký của cả đội. Mục nào kho chưa có thì nói rõ là chưa có.' });
  if(!ds.length) return o + U.empty('Kho nghề chưa mở với tài khoản này', 'Phác đồ và tình huống nằm trong gói nghề — đăng nhập bằng tài khoản có quyền để mở.');
  o += '<div class="tcgp-lo">';
  o += '<div class="tcgp-ds"><input id="tcgpQ" class="inp" placeholder="Tìm vấn đề, nhóm hoặc mã…" value="' + h(TC.q) + '">' +
    '<p class="tiny muted mt mb">' + loc.length + ' / ' + ds.length + ' vấn đề</p>' +
    loc.slice(0, 40).map(function(v){
      return '<button class="card pad-sm lift mb tcgp-mot' + (TC.chon === v.ma ? ' on' : '') + '" data-tcgp-chon="' + h(v.ma) + '" style="text-align:left;width:100%">' +
        '<span class="mono tiny muted">' + h(v.loai === 'pd' ? v.ma : v.tang) + '</span> <b class="sm">' + h(v.ten) + '</b>' +
        (v.nhomTen ? '<div class="tiny muted">' + h(v.nhomTen) + '</div>' : '') + '</button>';
    }).join('') +
    (loc.length > 40 ? '<p class="tiny muted">… gõ thêm chữ để thu hẹp.</p>' : '') + '</div>';
  var vd = TC.chon ? timVanDe(TC.chon) : null;
  o += '<div class="tcgp-ct">' + (vd ? veChiTiet(vd) : '<div class="card pad-sm"><p class="sm muted">Chọn một vấn đề ở danh sách để xem đủ 13 mục.</p></div>') + '</div>';
  return o + '</div>';
};

document.addEventListener('click', function(e){
  var t = e.target.closest && e.target.closest('[data-tcgp-chon]');
  if(t){
    TC.chon = t.getAttribute('data-tcgp-chon');
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
    var v2 = timVanDe(TC.chon); if(!v2) return;
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
