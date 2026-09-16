/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÀN ĐÁNH GIÁ VÀ DUYỆT ĐÁNH GIÁ

   Hai màn dùng chung một kho:
     · Gia đình gửi đánh giá (màn "danh-gia")
     · Học viện duyệt trước khi công khai (màn "duyet-danh-gia")

   ── NÓI THẲNG MỘT GIỚI HẠN ──
   Đánh giá gửi đi được lưu trong máy của gia đình và đẩy lên máy chủ
   khi có nối. Chưa nối máy chủ thì nó nằm lại trong máy, và Học viện
   chưa thấy. Điều này được ghi thẳng trên màn, vì một gia đình bỏ công
   viết ba đoạn rồi tưởng đã gửi mà thật ra chưa gửi là chuyện tệ hơn
   hẳn việc nói trước rằng chưa nối.

   ── VÀ MỘT GIỚI HẠN NỮA ──
   Đánh giá được duyệt CHƯA tự lên trang công khai. Trang công khai
   dựng từ tools/dung-trang-seo.js, đọc G.DANHGIA_THAT trong kho. Nên
   sau khi duyệt còn một bước người làm: đưa vào kho rồi phát hành lại.
   Cố tình để vậy — nội dung ra ngoài phải qua tay người, giống mọi
   đường ra khác của hệ thống này.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var U = G.U, h = U.h, ic = U.ic;
G.VIEWS = G.VIEWS || {};

var KHO = 'gita365_danh_gia';

function doc(){
  try{ return JSON.parse(localStorage.getItem(KHO) || '[]') || []; }catch(e){ return []; }
}
function ghi(a){
  try{ localStorage.setItem(KHO, JSON.stringify(a)); }catch(e){}
}

/* ── Ai được gửi ──
   Luật 1: phải là tài khoản thật, đã đi đủ mốc. Chưa có mốc thì vẫn
   cho gửi góp ý, chỉ không tính là đánh giá công khai được. */
G.dgDuocGui = function(){
  var r = G.S && G.S.roleObj;
  return !!(r && (r.portal === 'ph' || r.portal === 'hs'));
};

G.dgCuaToi = function(){
  var u = (G.S && G.S.acc && G.S.acc.u) || '';
  return doc().filter(function(x){ return x.u === u; });
};

G.dgGui = function(sao, doiGi, chuaTot, choCongKhai, mucTen){
  sao = Number(sao);
  if(!(sao >= 1 && sao <= 5)) return {ok:false, ly:'Chọn từ 1 tới 5 sao.'};
  if(!String(doiGi || '').trim()) return {ok:false, ly:'Viết giúp một dòng về điều đã đổi trong nhà mình.'};
  var acc = (G.S && G.S.acc) || {};
  var a = doc();
  a.unshift({
    ma:'DG-' + Date.now().toString(36).toUpperCase(),
    u:acc.u || '', ten:acc.ten || '', vai:(G.S && G.S.role) || '',
    sao:sao, doiGi:String(doiGi).trim(), chuaTot:String(chuaTot || '').trim(),
    choCongKhai: !!choCongKhai, mucTen: mucTen || 'RUT',
    ngay:new Date().toISOString(), trangThai:'cho'
  });
  ghi(a);
  if(G.secLog) G.secLog('Gửi đánh giá', sao + ' sao' +
    (choCongKhai ? ' · cho phép công khai' : ' · chỉ gửi nội bộ'), 'Ghi nhận');
  /* Đẩy lên máy chủ nếu có nối — dùng lại đường đồng bộ sẵn có */
  if(G.API_CAP_PHEP && G.dongBo) { try{ G.dongBo(); }catch(e){} }
  return {ok:true};
};

/* ── Chỉ những cái ĐỦ BỐN CỬA mới ra tới trang công khai ── */
G.dgCongKhai = function(){
  return doc().filter(function(x){
    return x.trangThai === 'duyet' && x.choCongKhai && x.sao >= 1 && x.doiGi;
  });
};

G.dgChoDuyet = function(){ return doc().filter(function(x){ return x.trangThai === 'cho'; }); };

G.dgDuyet = function(ma, thuan){
  var a = doc(), doi = false;
  for(var i=0;i<a.length;i++) if(a[i].ma === ma){
    a[i].trangThai = thuan ? 'duyet' : 'tuchoi';
    a[i].duyetBoi = (G.S && G.S.acc && G.S.acc.u) || '';
    doi = true;
  }
  if(doi){ ghi(a); if(G.secLog) G.secLog('Duyệt đánh giá', ma + ' · ' + (thuan?'đăng':'từ chối'), 'Ghi nhận'); }
  return doi;
};

/* ── Tên hiển thị theo đúng mức gia đình chọn ── */
G.dgTenHien = function(x){
  var t = String(x.ten || '').trim();
  if(x.mucTen === 'AN' || !t) return 'Một phụ huynh của GITA 365';
  if(x.mucTen === 'DAY') return t;
  var p = t.split(/\s+/);
  return p.slice(0, -1).join(' ').slice(0, 1) === '' ? t.charAt(0) + '.'
    : (p[0] + ' ' + p[p.length-1].charAt(0) + '.');
};

function sao(n){
  var o = '';
  for(var i=1;i<=5;i++) o += '<span style="color:' + (i<=n ? 'var(--gita)' : 'var(--vien)') + '">★</span>';
  return '<span style="font-size:18px;letter-spacing:2px">' + o + '</span>';
}

/* ═══════════ MÀN GIA ĐÌNH GỬI ═══════════ */
G.VIEWS['danh-gia'] = function(){
  var o = '<div class="view">';
  o += U.ph({eyebrow:'TIẾNG NÓI CỦA NHÀ MÌNH', ic:'heart', grad:1,
    t:'Đánh giá GITA 365',
    lead:'Ba câu thôi. Phần "chưa tốt" Học viện cần hơn phần khen — vì lời khen giữ nguyên hệ thống, '+
         'còn chỗ chưa tốt mới sửa được nó.'});

  if(!G.API_CAP_PHEP)
    o += '<div class="card mt2" style="border-color:var(--alert)">' +
      '<div class="row" style="gap:9px;align-items:flex-start">' +
      '<span style="color:var(--alert);flex:none">' + ic('bell','w-4 h-4') + '</span>' +
      '<div><b class="sm">Máy này chưa nối máy chủ</b>' +
      '<p class="sm muted mt" style="line-height:1.7">Đánh giá gửi bây giờ được giữ trong máy và ' +
      'sẽ tự đẩy lên khi có nối. Học viện chưa thấy ngay. Nói trước để anh chị không viết xong ' +
      'rồi tưởng đã gửi.</p></div></div></div>';

  (G.DG_HOI || []).forEach(function(q){
    if(q.loai === 'sao'){
      o += '<div class="card mt2"><b class="sm">' + h(q.t) + '</b>' +
        '<div class="row mt2" style="gap:7px;flex-wrap:wrap">';
      for(var i=1;i<=5;i++)
        o += '<button class="btn ghost" data-dgsao="' + i + '" style="font-size:18px;padding:6px 13px">' +
          '★ ' + i + '</button>';
      o += '</div><p class="tiny muted mt">Đang chọn: <b id="dg-sao-hien">chưa chọn</b></p></div>';
    } else {
      o += '<div class="card mt2"><b class="sm">' + h(q.t) + '</b>' +
        (q.goi ? '<p class="tiny muted mt">' + h(q.goi) + '</p>' : '') +
        '<textarea id="dg-' + h(q.ma) + '" class="cho-chep" rows="4" ' +
        'style="width:100%;margin-top:9px" placeholder="Viết ở đây…"></textarea></div>';
    }
  });

  o += '<div class="card mt2"><b class="sm">Cho phép Học viện đăng công khai?</b>' +
    '<p class="tiny muted mt" style="line-height:1.7">Để trống thì đánh giá vẫn về Học viện để sửa ' +
    'hệ thống, chỉ không lên trang giới thiệu. Anh chị rút lại lúc nào cũng được, không cần lý do.</p>' +
    '<label class="row mt2" style="gap:9px;align-items:center;cursor:pointer">' +
    '<input type="checkbox" id="dg-congkhai"><span class="sm">Tôi đồng ý cho đăng công khai</span></label>' +
    /* Dòng này là NHÃN THẬT của ô chọn, không phải một câu mô tả: viết
       bằng <p> thì trình đọc màn hình đọc ô chọn là "danh sách, không
       tên" — người mù nghe thấy một ô chọn mà không biết nó chọn gì.
       <label for> chứ không aria-label: nó còn cho chạm vào chữ là
       nhảy vào ô, thứ người tay run cần nhất. */
    '<label for="dg-ten" class="tiny muted mt2" style="display:block">Tên hiển thị:</label>' +
    '<select id="dg-ten" style="margin-top:5px">' +
    (G.DG_TEN || []).map(function(t, i){
      return '<option value="' + h(t.ma) + '"' + (t.ma === 'RUT' ? ' selected' : '') + '>' +
        h(t.t) + ' — ' + h(t.vd) + '</option>';
    }).join('') + '</select></div>';

  o += '<div class="row mt2"><button class="btn pri" data-dggui>' + ic('check','w-3 h-3') +
    ' Gửi đánh giá</button></div>';

  var toi = G.dgCuaToi();
  if(toi.length){
    o += U.sec('ĐÁNH GIÁ NHÀ MÌNH ĐÃ GỬI', toi.length + ' lần');
    o += toi.map(function(x){
      return '<div class="card mt"><div class="row" style="gap:10px;align-items:center;flex-wrap:wrap">' +
        sao(x.sao) + '<span class="tiny muted">' + h(x.ngay.slice(0,10)) + '</span>' +
        '<span class="chip" style="color:' + (x.trangThai === 'duyet' ? 'var(--ok)' :
          x.trangThai === 'tuchoi' ? 'var(--alert)' : 'var(--ink-3)') + '">' +
        (x.trangThai === 'duyet' ? 'Đã duyệt' : x.trangThai === 'tuchoi' ? 'Không đăng' : 'Chờ Học viện đọc') +
        '</span>' + (x.choCongKhai ? '<span class="chip">cho đăng</span>' : '') +
        '</div><p class="sm mt" style="line-height:1.75">' + h(x.doiGi) + '</p>' +
        (x.chuaTot ? '<p class="sm muted mt" style="line-height:1.75"><b>Chưa tốt:</b> ' +
          h(x.chuaTot) + '</p>' : '') + '</div>';
    }).join('');
  }

  o += U.sec('SÁU LUẬT HỌC VIỆN TỰ RÀNG MÌNH', 'Để con số còn nghĩa gì');
  o += '<div class="card">' + (G.DG_LUAT || []).map(function(x, i){
    return '<div class="row' + (i ? ' mt2' : '') + '" style="gap:10px;align-items:flex-start">' +
      '<span style="color:var(--gita);flex:none;font-weight:700">' + (i+1) + '</span>' +
      '<div style="flex:1"><b class="sm">' + h(x.t) + '</b>' +
      '<p class="sm muted mt" style="line-height:1.7">' + h(x.y) + '</p></div></div>';
  }).join('') + '</div>';

  return o + '</div>';
};

/* ═══════════ MÀN HỌC VIỆN DUYỆT ═══════════ */
G.VIEWS['duyet-danh-gia'] = function(){
  var o = '<div class="view">';
  o += U.ph({eyebrow:'TRƯỚC KHI RA NGOÀI', ic:'shield', grad:1,
    t:'Duyệt đánh giá của gia đình',
    lead:'Bốn cửa trước khi một dòng chữ của gia đình ra tới trang công khai. Duyệt xong vẫn còn '+
         'một bước người làm: đưa vào kho rồi phát hành lại.'});

  var cho = G.dgChoDuyet(), ck = G.dgCongKhai();

  o += '<div class="row wrap mt2" style="gap:12px">' +
    U.stat({k:'Chờ đọc', v:cho.length, d:'gia đình đã gửi'}) +
    U.stat({k:'Được phép đăng', v:ck.length, d:'đã duyệt và gia đình cho phép', c:'var(--ok)'}) +
    U.stat({k:'Đang công khai', v:(G.DANHGIA_THAT || []).length, d:'trên trang giới thiệu'}) +
    '</div>';

  o += '<div class="card mt2" style="border-color:var(--alert)">' +
    '<div class="tiny up mb" style="color:var(--alert)">KHÔNG DỰNG SỐ</div>' +
    '<p class="sm" style="line-height:1.75">Kho G.HAILONG là dữ liệu mẫu — "Nhà Khánh Vy", ' +
    '"Nhà Đức Anh", 87,4% đều là số dựng để xem giao diện. Không nhà nào có thật. ' +
    'Trang công khai KHÔNG lấy kho ấy, và không phát dữ liệu đánh giá nào khi ' +
    'G.DANHGIA_THAT còn rỗng — im lặng, không bịa. Đánh giá giả là phạt tay của Google, ' +
    'tức mất hẳn chỉ mục, ngược đúng cái đang muốn đạt.</p></div>';

  if(!cho.length)
    o += '<div class="card mt2 center" style="padding:30px"><p class="sm muted">' +
      'Chưa có đánh giá nào chờ đọc.</p></div>';
  else
    o += cho.map(function(x){
      return '<div class="card mt2"><div class="row" style="gap:10px;align-items:center;flex-wrap:wrap">' +
        sao(x.sao) + '<b class="sm">' + h(G.dgTenHien(x)) + '</b>' +
        '<span class="tiny muted">' + h(x.ngay.slice(0,10)) + '</span>' +
        '<span class="chip" style="color:' + (x.choCongKhai ? 'var(--ok)' : 'var(--ink-3)') + '">' +
        (x.choCongKhai ? 'gia đình CHO đăng' : 'chỉ nội bộ — không được đăng') + '</span></div>' +
        '<p class="sm mt2" style="line-height:1.8">' + h(x.doiGi) + '</p>' +
        (x.chuaTot ? '<div class="mt2" style="padding:11px 14px;border-radius:11px;background:var(--phu-1)">' +
          '<span class="tiny up muted">CHƯA TỐT</span><p class="sm mt" style="line-height:1.75">' +
          h(x.chuaTot) + '</p></div>' : '') +
        '<div class="row mt2" style="gap:9px;flex-wrap:wrap">' +
        '<button class="btn pri sm" data-dgduyet="' + h(x.ma) + '">Duyệt</button>' +
        '<button class="btn ghost sm" data-dgtuchoi="' + h(x.ma) + '">Không đăng</button></div></div>';
    }).join('');

  return o + '</div>';
};

/* ═══════════ BẤM ═══════════ */
var saoDang = 0;
document.addEventListener('click', function(e){
  var t = e.target; if(!t || !t.closest) return;

  var s = t.closest('[data-dgsao]');
  if(s){
    saoDang = Number(s.getAttribute('data-dgsao'));
    var n = document.getElementById('dg-sao-hien');
    if(n) n.textContent = saoDang + ' sao';
    return;
  }
  if(t.closest('[data-dggui]')){
    var d = document.getElementById('dg-D'), c = document.getElementById('dg-C');
    var ok = document.getElementById('dg-congkhai'), tn = document.getElementById('dg-ten');
    var kq = G.dgGui(saoDang, d && d.value, c && c.value,
      ok && ok.checked, tn && tn.value);
    U.toast(kq.ok ? 'Đã ghi nhận. Cảm ơn nhà mình — phần chưa tốt là phần giúp được nhiều nhất.'
      : kq.ly, kq.ok ? 'ok' : 'err');
    if(kq.ok){ saoDang = 0; if(G.render) G.render(); }
    return;
  }
  var du = t.closest('[data-dgduyet]'), tu = t.closest('[data-dgtuchoi]');
  if(du || tu){
    G.dgDuyet((du || tu).getAttribute(du ? 'data-dgduyet' : 'data-dgtuchoi'), !!du);
    U.toast(du ? 'Đã duyệt. Còn bước đưa vào kho rồi phát hành lại.' : 'Đã đánh dấu không đăng.', 'ok');
    if(G.render) G.render();
  }
}, false);

})();
