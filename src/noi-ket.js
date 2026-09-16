/* ═══════════════════════════════════════════════════════════════
   GITA 365 — ĐƯA LỚP NỐI LÊN GIAO DIỆN

   Kho có 1.000 kịch bản, 600 chuyện theo cấp, 77 chuyện người thật,
   220 phác đồ, 250 tình huống — mà không một kịch bản nào gắn với phác
   đồ nào. Người mở một phác đồ chỉ đọc được nguyên nhân và giải pháp;
   muốn tìm kịch bản cho ca ấy thì phải tự nhớ tên rồi dò trong một
   nghìn cái. Thực tế là không ai làm.

   Kho không thiếu nội dung. Kho thiếu ĐƯỜNG ĐI GIỮA CÁC NỘI DUNG.

   Tệp này gắn vào hai cửa sổ đã có — phác đồ và tình huống — năm thứ:
     · Kịch bản dùng được cho ca này
     · Chuyện của cấp mình, và chuyện người thật
     · Chiều sâu năm cấp của nhóm phác đồ
     · Quy trình xử lý riêng của nhóm
     · Tài liệu phát cho gia đình

   ── NÓI THẲNG VỀ ĐỘ TIN ──
   Mối nối do máy dựng, không do người duyệt từng cái. Nên mỗi mối nối
   hiện kèm ĐIỂM và TỪ KHOÁ TRÙNG: người dùng thấy được vì sao nó được
   gắn vào đây, và tự bỏ qua cái yếu. Giấu điểm đi là bắt người ta tin
   một thứ họ không kiểm được.

   Mối nối dưới ngưỡng thì công cụ đã không sinh ra; ở đây không có
   chỗ nào bịa thêm.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var U = G.U, h = U.h, ic = U.ic;

function nk(){ return G.NOI_KET || {pd:{}, th:{}}; }

/* ─── Tra một bản ghi theo mã ─── */
function tim(kho, ma){
  var a = G[kho] || [];
  for(var i=0;i<a.length;i++) if(a[i].ma === ma) return a[i];
  return null;
}

/* ─── Thẻ một mối nối ───
   Điểm hiện ra bằng chữ, không bằng số trần: "khớp mạnh / khớp vừa /
   khớp nhẹ". Số trần làm người đọc tưởng có độ chính xác không có. */
function mucDo(d){
  return d >= 4 ? {t:'khớp mạnh', c:'var(--ok)'} :
         d >= 2.5 ? {t:'khớp vừa', c:'var(--gita)'} :
                    {t:'khớp nhẹ', c:'var(--ink-3)'};
}

function the(x, ten, phu, act, maHien){
  var m = mucDo(x.d);
  return '<button class="card pad-sm lift mb" ' + (act || '') + ' style="text-align:left;width:100%">' +
    '<div class="row" style="gap:7px;align-items:baseline;flex-wrap:wrap">' +
      '<span class="mono tiny" style="color:var(--ink-4)">' + h(maHien || x.ma) + '</span>' +
      '<span class="chip" style="color:' + m.c + '">' + m.t + '</span></div>' +
    '<b class="sm" style="display:block;line-height:1.45;margin-top:4px">' + h(ten) + '</b>' +
    (phu ? '<p class="tiny muted mt" style="line-height:1.5">' + h(phu) + '</p>' : '') +
    (x.vi && x.vi.length ? '<p class="tiny mt" style="color:var(--ink-4)">trùng: ' +
      h(x.vi.join(' · ')) + '</p>' : '') +
    '</button>';
}

function muc(t, s){
  return '<div class="tiny up mb mt2" style="color:var(--gita)">' + h(t) +
    (s ? ' <span class="muted" style="text-transform:none">· ' + h(s) + '</span>' : '') + '</div>';
}

/* ═══════════ KHỐI NỐI CHO MỘT PHÁC ĐỒ ═══════════ */
G.nkKhoiPhacDo = function(ma){
  var d = nk().pd[ma];
  if(!d) return '';
  var o = '';

  /* Kịch bản */
  if(d.kb && d.kb.length){
    o += muc('KỊCH BẢN DÙNG ĐƯỢC CHO CA NÀY', d.kb.length + ' buổi');
    o += d.kb.map(function(x){
      var k = tim('KICHBAN', x.ma); if(!k) return '';
      return the(x, k.ten, k.tang + ' · ' + k.loai + ' · ' + k.phut + ' phút · ' + k.nhom,
        'data-kb="' + h(k.ma) + '"');
    }).join('');
  }

  /* Chiều sâu năm cấp của nhóm */
  var s = (G.PD_SAU || {})[d.nhom];
  if(s){
    o += muc('CHIỀU SÂU NĂM CẤP NGHỀ', 'nhóm ' + d.nhom);
    o += '<div class="card pad-sm mb"><p class="sm" style="line-height:1.7">' + h(s.y) + '</p>' +
      '<button class="btn ghost sm mt2" data-pdsau="' + h(d.nhom) + '">' +
      ic('chart','w-3 h-3') + ' Xem năm cấp làm được gì với nhóm này</button></div>';
  }

  /* Quy trình riêng của nhóm */
  var q = (G.QT_NHOM || []).filter(function(x){ return x.nhom === d.nhom; })[0];
  if(q){
    o += muc('QUY TRÌNH XỬ LÝ RIÊNG CỦA NHÓM', q.ten || d.nhom);
    o += '<div class="card pad-sm mb" style="border-color:var(--gita-do)">' +
      '<p class="sm" style="line-height:1.7"><b>Khác bảy bước chung ở chỗ:</b> ' + h(q.khac) + '</p>' +
      '<button class="btn ghost sm mt2" data-qtnhom="' + h(d.nhom) + '">' +
      ic('map','w-3 h-3') + ' Mở bảy bước của nhóm này</button></div>';
  }

  /* Tài liệu phát cho gia đình */
  var tl = (G.TL_GIADINH || []).filter(function(x){ return x.nhom === d.nhom; })[0];
  if(tl){
    o += muc('TÀI LIỆU PHÁT CHO GIA ĐÌNH', tl.dai || '');
    o += '<div class="card pad-sm mb" style="border-color:var(--ok)">' +
      '<b class="sm">' + h(tl.ten) + '</b>' +
      '<p class="tiny muted mt">' + h(tl.cho || '') + (tl.khiNao ? ' · ' + h(tl.khiNao) : '') + '</p>' +
      '<button class="btn ghost sm mt2" data-tlgd="' + h(tl.ma) + '">' +
      ic('book','w-3 h-3') + ' Mở tài liệu</button></div>';
  }

  /* Chuyện */
  var ch = (d.ch || []).map(function(x){
    var c = tim('CHUYEN', x.ma); if(!c) return '';
    return the(x, c.ten, c.cap + ' · ' + c.hoc, 'data-chxem="' + h(c.ma) + '"');
  }).filter(Boolean).join('');
  var tg = (d.tg || []).map(function(x){
    var c = tim('CHUYEN_TG', x.ma); if(!c) return '';
    return the(x, c.ten, (c.nuoc || '') + (c.nam ? ' · ' + c.nam : ''), 'data-tgxem="' + h(c.ma) + '"');
  }).filter(Boolean).join('');
  if(ch || tg){
    o += muc('CHUYỆN KỂ ĐƯỢC TRONG CA NÀY', 'người thật, việc thật');
    o += ch + tg;
  }

  if(!o) return '';
  return '<div class="mt2" style="border-top:1px solid var(--vien);padding-top:12px">' + o +
    '<p class="tiny muted mt2" style="line-height:1.6">Những mối nối trên do hệ thống dựng bằng độ trùng ' +
    'từ khoá, không do người duyệt từng cái. Chữ "khớp mạnh / vừa / nhẹ" và danh sách từ trùng là để ' +
    'anh chị tự kiểm — thấy cái nào lệch thì bỏ qua.</p></div>';
};

/* ═══════════ KHỐI NỐI CHO MỘT TÌNH HUỐNG ═══════════ */
G.nkKhoiTinhHuong = function(id){
  var d = nk().th[id];
  if(!d) return '';
  var o = '';
  if(d.kb && d.kb.length){
    o += muc('KỊCH BẢN DÙNG ĐƯỢC', d.kb.length + ' buổi, ưu tiên cùng tầng');
    o += d.kb.map(function(x){
      var k = tim('KICHBAN', x.ma); if(!k) return '';
      return the(x, k.ten, k.tang + ' · ' + k.loai + ' · ' + k.phut + ' phút',
        'data-kb="' + h(k.ma) + '"');
    }).join('');
  }
  /* Chiều sâu theo CHỦ ĐỀ — 250 tình huống chia 50 nhóm, mà chiều sâu
     viết theo 10 chủ đề. Bảng ánh xạ nằm ở G.NOI_KET.chuDe, do
     tools/dung-noi-ket.js dựng ra và có bài kiểm soi không nhóm nào
     rơi ra ngoài. */
  var cd = d.chuDe && (G.TH_SAU || {})[d.chuDe];
  if(cd){
    o += muc('CHIỀU SÂU NĂM CẤP NGHỀ', cd.ten || d.chuDe);
    o += '<div class="card pad-sm mb"><p class="sm" style="line-height:1.7">' + h(cd.y) + '</p>' +
      '<button class="btn ghost sm mt2" data-thsau="' + h(d.chuDe) + '">' +
      ic('chart','w-3 h-3') + ' Xem năm cấp làm được gì với chủ đề này</button></div>';
  }

  if(d.ch && d.ch.length){
    o += muc('CHUYỆN KỂ ĐƯỢC', 'người thật, việc thật');
    o += d.ch.map(function(x){
      var c = tim('CHUYEN', x.ma); if(!c) return '';
      return the(x, c.ten, c.cap + ' · ' + c.hoc, 'data-chxem="' + h(c.ma) + '"');
    }).join('');
  }
  if(!o) return '';
  return '<div class="mt2" style="border-top:1px solid var(--vien);padding-top:12px">' + o +
    '<p class="tiny muted mt2" style="line-height:1.6">Mối nối do hệ thống dựng bằng độ trùng từ khoá. ' +
    'Chữ khớp mạnh / vừa / nhẹ là để anh chị tự kiểm.</p></div>';
};

/* ═══════════ GẮN VÀO HAI CỬA SỔ ĐÃ CÓ ═══════════
   Bọc hàm cũ thay vì sửa vào ruột nó: hai cửa sổ ấy đổi sau này thì
   phần nối vẫn chạy y nguyên. U.modal được thay tạm trong lúc gọi để
   bắt lấy nội dung, rồi trả về đúng như cũ. */
function boc(ten, them){
  var cu = G[ten];
  if(typeof cu !== 'function') return false;
  G[ten] = function(ma){
    var giu = U.modal, ra = null;
    U.modal = function(html){ ra = html; };
    try { cu.call(this, ma); } catch(e) { ra = null; }
    U.modal = giu;
    if(ra == null) return;
    var t = '';
    try { t = them(ma) || ''; } catch(e) { t = ''; }
    U.modal(ra + t);
  };
  return true;
}
G.NK_DA_BOC = [];
if(boc('phacDoModal', G.nkKhoiPhacDo)) G.NK_DA_BOC.push('phacDoModal');
if(boc('tinhHuongModal', G.nkKhoiTinhHuong)) G.NK_DA_BOC.push('tinhHuongModal');

/* ═══════════ BẤM ═══════════ */
document.addEventListener('click', function(e){
  var t = e.target; if(!t || !t.closest) return;

  /* data-kb đã có bộ nhận toàn cục ở src/app.js gọi G.kichBanModal.
     Bắt lại ở đây là mở cửa sổ hai lần. Để nguyên cho app.js lo. */

  var c = t.closest('[data-chxem]');
  if(c){
    var x = tim('CHUYEN', c.getAttribute('data-chxem'));
    if(x && G.veChuyen) U.modal(G.veChuyen(x, true));
    return;
  }
  var g = t.closest('[data-tgxem]');
  if(g){
    var y = tim('CHUYEN_TG', g.getAttribute('data-tgxem'));
    if(y && G.veChuyenTG) U.modal(G.veChuyenTG(y, true));
    return;
  }
  var s = t.closest('[data-pdsau]');
  if(s){ U.modal(G.nkBangSau(s.getAttribute('data-pdsau'))); return; }
  var s2 = t.closest('[data-thsau]');
  if(s2){ U.modal(G.nkBangSau(s2.getAttribute('data-thsau'), true)); return; }
  var q = t.closest('[data-qtnhom]');
  if(q){ U.modal(G.nkBangQT(q.getAttribute('data-qtnhom'))); return; }
  var l = t.closest('[data-tlgd]');
  if(l){ U.modal(G.nkBangTL(l.getAttribute('data-tlgd'))); return; }
}, false);

/* ═══════════ BA CỬA SỔ NỘI DUNG ═══════════ */
var CAP = ['C1','C2','C3','C4','C5'];

/* Một hàm cho cả hai kho chiều sâu: cấu trúc giống hệt nhau nên viết
   hai bản là mở đường cho hai bản trôi khỏi nhau. */
G.nkBangSau = function(nhom, laTinhHuong){
  var s = (laTinhHuong ? (G.TH_SAU || {}) : (G.PD_SAU || {}))[nhom];
  if(!s) return '<p class="sm">Chưa có chiều sâu cho ' + (laTinhHuong ? 'chủ đề' : 'nhóm') + ' này.</p>';
  var cd = {}; (G.CAPDO_VANDUNG || []).forEach(function(x){ cd[x.ma] = x; });
  var o = '<div class="tiny up" style="color:var(--gita)">CHIỀU SÂU NĂM CẤP · ' +
    h(s.ten || ((laTinhHuong ? 'CHỦ ĐỀ ' : 'NHÓM ') + nhom)) + '</div>' +
    '<p class="sm mt" style="line-height:1.75">' + h(s.y) + '</p>';
  o += '<div class="card pad-sm mt2">' +
    [['Ở nhà', s.nha], ['Ở trường', s.truong], ['Ngoài xã hội', s.xaHoi],
     ['Thói quen tối thiểu', s.thoiQuen], ['Đường đi', s.di], ['Tư liệu cần', s.tuLieu]]
    .filter(function(x){ return x[1]; })
    .map(function(x){ return '<p class="sm mb"><b>' + h(x[0]) + ':</b> ' + h(x[1]) + '</p>'; }).join('') +
    '</div>';
  o += CAP.map(function(c){
    var v = s.c && s.c[c]; if(!v) return '';
    var d = cd[c] || {ten:c};
    return '<div class="card pad-sm mt2" style="border-left:3px solid var(--gita)">' +
      '<div class="row" style="gap:8px;align-items:baseline">' +
      '<b class="mono" style="color:var(--gita)">' + h(c) + '</b>' +
      '<b class="sm">' + h(d.ten) + '</b></div>' +
      '<p class="sm mt"><b>Làm được:</b> ' + h(v.lam) + '</p>' +
      '<p class="sm mt" style="color:var(--alert)"><b>Chưa làm được:</b> ' + h(v.chua) + '</p>' +
      '<p class="sm mt"><b>Việc nộp:</b> ' + h(v.viec) + '</p>' +
      '<p class="sm mt"><b>Lên cấp khi:</b> ' + h(v.len) + '</p></div>';
  }).join('');
  return o;
};

G.nkBangQT = function(nhom){
  var q = (G.QT_NHOM || []).filter(function(x){ return x.nhom === nhom; })[0];
  if(!q) return '<p class="sm">Chưa có quy trình riêng cho nhóm này.</p>';
  var o = '<div class="tiny up" style="color:var(--gita)">QUY TRÌNH NHÓM ' + h(nhom) + '</div>' +
    '<h2 style="font-size:21px;font-weight:800;margin:6px 0 10px">' + h(q.ten) + '</h2>' +
    '<div class="card pad-sm mb" style="border-color:var(--gita)"><p class="sm" style="line-height:1.7">' +
    '<b>Khác bảy bước chung:</b> ' + h(q.khac) + '</p></div>';
  o += (q.buoc || []).map(function(b){
    return '<div class="card pad-sm mb"><div class="row" style="gap:8px;align-items:baseline">' +
      '<b class="mono" style="color:var(--gita)">' + h(b.ma) + '</b></div>' +
      '<p class="sm mt" style="line-height:1.7">' + h(b.lam) + '</p>' +
      ((b.hoi || []).length ? '<p class="tiny muted mt"><b>Hỏi:</b> ' +
        h(b.hoi.join(' · ')) + '</p>' : '') +
      (b.bay ? '<p class="tiny mt" style="color:var(--alert)"><b>Bẫy:</b> ' + h(b.bay) + '</p>' : '') +
      '</div>';
  }).join('');
  if((q.dungNgay || []).length)
    o += '<div class="card pad-sm mb" style="border-color:var(--gita-do)">' +
      '<div class="tiny up mb" style="color:var(--gita-do-ink)">DỪNG NGAY VÀ BÁO CẤP TRÊN</div>' +
      U.list(q.dungNgay, 'var(--gita-do)') + '</div>';
  if(q.chuyenTuyen)
    o += '<div class="card pad-sm mb" style="border-color:var(--alert)">' +
      '<div class="tiny up mb" style="color:var(--alert)">CHUYỂN TUYẾN</div>' +
      '<p class="sm" style="line-height:1.7">' + h(q.chuyenTuyen) + '</p></div>';
  if((q.doBang || []).length)
    o += '<div class="card pad-sm"><div class="tiny up mb muted">ĐO CA NÀY BẰNG</div>' +
      U.list(q.doBang, 'var(--ok)') + '</div>';
  return o;
};

G.nkBangTL = function(ma){
  var t = (G.TL_GIADINH || []).filter(function(x){ return x.ma === ma; })[0];
  if(!t) return '<p class="sm">Chưa có tài liệu này.</p>';
  var o = '<div class="tiny up" style="color:var(--ok)">TÀI LIỆU PHÁT CHO GIA ĐÌNH · ' + h(t.dai || '') + '</div>' +
    '<h2 style="font-size:21px;font-weight:800;margin:6px 0 6px">' + h(t.ten) + '</h2>' +
    '<p class="tiny muted mb">' + h(t.cho || '') + (t.khiNao ? ' · ' + h(t.khiNao) : '') + '</p>' +
    (t.muc ? '<p class="sm mb" style="line-height:1.75">' + h(t.muc) + '</p>' : '');
  o += (t.than || []).map(function(x){
    return '<div class="card pad-sm mb"><b class="sm">' + h(x.h) + '</b>' +
      '<p class="sm mt" style="line-height:1.75">' + h(x.d) + '</p></div>';
  }).join('');
  if(t.bang && (t.bang.cot || []).length)
    o += '<div class="card pad-sm mb"><div class="tiny up mb" style="color:var(--gita)">' +
      h(t.bang.ten || 'BẢNG GHI') + '</div>' +
      U.tbl(t.bang.cot, [t.bang.cot.map(function(){ return '…'; })]) +
      (t.bang.y ? '<p class="tiny muted mt">' + h(t.bang.y) + '</p>' : '') + '</div>';
  if((t.khong || []).length)
    o += '<div class="card pad-sm mb" style="border-color:var(--gita-do)">' +
      '<div class="tiny up mb" style="color:var(--gita-do-ink)">KHÔNG LÀM NHỮNG ĐIỀU NÀY</div>' +
      U.list(t.khong, 'var(--gita-do)') + '</div>';
  if(t.xong)
    o += '<div class="card pad-sm"><div class="tiny up mb muted">DÙNG XONG KHI</div>' +
      '<p class="sm" style="line-height:1.7">' + h(t.xong) + '</p></div>';
  return o;
};

/* Đếm thật cho bài kiểm và màn tự soát */
G.nkSoat = function(){
  var d = nk(), pd = Object.keys(d.pd || {}), th = Object.keys(d.th || {});
  var coKB = pd.filter(function(m){ return (d.pd[m].kb || []).length; }).length;
  var thKB = th.filter(function(m){ return (d.th[m].kb || []).length; }).length;
  return {
    pd: pd.length, th: th.length, pdCoKB: coKB, thCoKB: thKB,
    boc: (G.NK_DA_BOC || []).length,
    sau: Object.keys(G.PD_SAU || {}).length,
    sauTH: Object.keys(G.TH_SAU || {}).length,
    qt: (G.QT_NHOM || []).length,
    tl: (G.TL_GIADINH || []).length
  };
};

})();
