/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v8.7 — SOI VI PHẠM LUẬT LÀM VIỆC

   Luật nằm ở kho-goc/data.luat-lam-viec.js. Tệp này làm hai việc:

     1. Soi văn bản trước khi nó tới gia đình — số điện thoại cá nhân,
        email, tài khoản Zalo, lời rủ ra ngoài hệ thống.
     2. Dựng màn hình để đội ngũ đọc luật, và để Admin xem các lượt đã soi.

   Một điều cố ý: máy CẢNH BÁO và GHI LẠI, máy không kết luận. Một số điện
   thoại trong đoạn chat có thể là số của bệnh viện, của trường, của chính
   Học viện. Kết luận vi phạm là việc của Hội đồng chuyên môn sau khi nghe
   người liên quan trình bày — đúng như quy trình bốn bước trong luật.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var U = G.U, h = U.h, ic = U.ic;
G.VIEWS = G.VIEWS || {};

var KHO = 'gita365_soi_luat';
G.SOI_LUAT = G.SOI_LUAT || [];

function nap(){
  try{ var v = JSON.parse(localStorage.getItem(KHO) || '[]'); if(Array.isArray(v)) G.SOI_LUAT = v; }catch(e){}
}
function ghi(){
  try{ localStorage.setItem(KHO, JSON.stringify(G.SOI_LUAT.slice(-300))); }catch(e){}
  if(G.danhDauCaiDat) G.danhDauCaiDat('soiluat');
}
nap();

/* ═══════════ SOI MỘT ĐOẠN VĂN BẢN ═══════════ */
G.soiLuat = function(van, boiCanh){
  var L = G.LUAT_LAMVIEC;
  if(!L || !van) return {sach:true, thay:[]};

  var t = String(van);
  /* Bỏ những thứ của chính Học viện ra trước khi soi — nếu không thì số
     hotline in trên mọi tài liệu sẽ bị bắt mỗi lần. */
  (L.ngoaiLe || []).forEach(function(x){
    t = t.split(x).join(' ');
  });

  var thay = [];
  (L.dauHieu || []).forEach(function(d){
    var re;
    try{ re = new RegExp(d.re, 'gi'); }catch(e){ return; }
    var m = t.match(re);
    if(m && m.length) thay.push({ma:d.ma, ten:d.ten, vd:m.slice(0,2).join(' · ')});
  });

  if(thay.length){
    var r = G.S && G.S.roleObj;
    G.SOI_LUAT.push({
      luc: new Date().toISOString(),
      u: (G.S.acc && G.S.acc.u) || '', vai: (r && r.n) || '',
      boiCanh: String(boiCanh || ''),
      thay: thay.map(function(x){ return x.ten; }),
      trich: t.replace(/\s+/g,' ').slice(0, 160),
      xem: false
    });
    ghi();
    if(G.secLog) G.secLog('Dấu hiệu vi phạm luật làm việc',
      thay.map(function(x){ return x.ten; }).join(' · ') + ' · ' + (boiCanh||''), 'Cảnh báo');
  }
  return {sach: !thay.length, thay: thay};
};

/* Ai phải bị soi: đội ngũ trực tiếp làm việc với gia đình */
G.phaiSoiLuat = function(){
  var r = G.S && G.S.roleObj;
  return !!(r && r.lv >= 5 && r.lv <= 11);
};

/* ═══════════════════════════════════════════════════════════════
   MÀN HÌNH · LUẬT LÀM VIỆC VỚI GIA ĐÌNH
   ═══════════════════════════════════════════════════════════════ */
G.VIEWS['luat-lam-viec'] = function(){
  var L = G.LUAT_LAMVIEC;
  var o = U.ph({eyebrow:'LUẬT ' + (L ? L.ma : 'LV-01'), ic:'shield', grad:1,
    t:'Làm việc với gia đình phải đi qua hệ thống',
    lead:'Luật này không cấm quan tâm. Nó chỉ đòi việc quan tâm để lại dấu vết ở chỗ cả hai bên đều tra được.'});
  if(!L) return o + '<div class="card"><p class="sm dim">Luật nằm trong kho nghề — đăng nhập bằng vai được cấp phép.</p></div>';

  o += '<div class="card mt2" style="border-color:var(--gita-do)">'+
    '<div class="row" style="gap:10px;align-items:center;flex-wrap:wrap">'+
      ic('bell','w-5 h-5')+
      '<b style="font-size:16px;color:var(--gita-do-ink)">Vi phạm: '+h(L.chetai.muc)+'</b></div>'+
    '<p class="sm dim mt">Áp dụng với: '+h(L.apDung.join(' · '))+'</p></div>';

  o += U.sec('VÌ SAO CHẶT ĐẾN THẾ','Ba lý do thật, không phải để kiểm soát người làm');
  o += '<div class="row wrap" style="gap:12px">'+
    [['Gia đình mất chỗ bấu víu',
      'Trao đổi qua Zalo riêng thì khi người ấy nghỉ việc, chuyển nhóm hay đơn giản là bận, cả lịch sử chăm sóc biến mất theo. Nhà mình phải kể lại từ đầu với người mới.'],
     ['Không ai bảo vệ được ai',
      'Có chuyện xảy ra — một lời khuyên sai, một hiểu lầm về tiền — thì không có bản ghi nào để đối chiếu. Người làm đúng cũng không chứng minh được mình đúng.'],
     ['Trẻ vị thành niên',
      'Một người lớn nhắn tin riêng với một em nhỏ, không qua hệ thống, không ai thấy. Đó là chỗ Học viện không được phép để xảy ra, dù người lớn ấy có ý tốt đến đâu.']]
    .map(function(x){
      return '<div class="card" style="flex:1;min-width:250px;border-left:3px solid var(--gita-do)">'+
        '<b class="sm" style="color:var(--gita-do-ink)">'+h(x[0])+'</b>'+
        '<p class="sm dim mt" style="line-height:1.65">'+h(x[1])+'</p></div>';
    }).join('')+'</div>';

  o += U.sec('NĂM ĐIỀU KHÔNG ĐƯỢC LÀM','Không có ngoại lệ ở điều thứ năm');
  o += U.tbl(['Điều','Rõ hơn'], L.cam.map(function(c){
    return ['<b class="sm"><span class="mono" style="color:var(--gita-do)">'+h(c.ma)+'</span> '+h(c.t)+'</b>',
            '<span class="sm">'+h(c.ro)+'</span>'];
  }));

  o += U.sec('BỐN ĐIỀU VẪN LÀM BÌNH THƯỜNG','Luật không làm khó việc chăm sóc');
  o += '<div class="card">'+U.list(L.duoc, 'var(--ok)')+'</div>';

  o += U.sec('CHẾ TÀI VÀ QUY TRÌNH','Máy cảnh báo, người quyết định');
  o += '<div class="row wrap" style="gap:12px">'+
    '<div class="card" style="flex:1;min-width:250px;border-color:var(--gita-do)">'+
      '<div class="tiny up mb" style="color:var(--gita-do-ink)">MỨC</div>'+
      '<b class="sm">'+h(L.chetai.muc)+'</b>'+U.list(L.chetai.them, 'var(--gita-do)')+'</div>'+
    '<div class="card" style="flex:1;min-width:250px">'+
      '<div class="tiny up mb">QUY TRÌNH BỐN BƯỚC</div>'+
      U.list(L.chetai.quyTrinh)+
      '<p class="tiny muted mt">Hội đồng chuyên môn quyết định — không phải máy quyết định.</p></div>'+
  '</div>';

  o += U.sec('ĐIỀU KHOẢN ĐƯA VÀO HỢP ĐỒNG','Chép nguyên văn vào phụ lục hợp đồng lao động và hợp đồng cộng tác');
  o += '<div class="card cho-chep" style="border-color:var(--gita-vien-1)">'+
    '<p class="sm" style="line-height:1.9;text-align:justify">'+h(L.dieuKhoanHopDong)+'</p>'+
    '<p class="tiny muted mt">Hiệu lực: '+h(L.hieuLuc)+'</p></div>';

  /* Nhật ký soi — chỉ R01–R02 */
  if(G.can('qt_trang')){
    var ds = G.SOI_LUAT.slice().reverse();
    o += U.sec('CÁC LƯỢT MÁY ĐÃ SOI THẤY', ds.length ? ds.length + ' lượt' : 'Chưa có lượt nào');
    if(!ds.length){
      o += G.khungTrongGon('Nhật ký soi luật',
        'Khi một người trong đội ngũ soạn nội dung gửi cho gia đình mà có số điện thoại cá nhân, '+
        'email, tài khoản Zalo hoặc lời rủ ra ngoài hệ thống, lượt ấy sẽ hiện ở đây kèm trích đoạn.',
        {t:'Đọc lại năm điều cấm', v:'luat-lam-viec'});
    } else {
      o += U.tbl(['Lúc','Ai','Thấy gì','Trích'], G.dsHet(ds,25).map(function(x){
        return ['<span class="tiny">'+h(new Date(x.luc).toLocaleString('vi-VN'))+'</span>',
          '<span class="mono sm">'+h(x.u)+'</span><div class="tiny muted">'+h(x.vai)+'</div>',
          '<span class="tiny" style="color:var(--gita-do-ink)">'+h(x.thay.join(' · '))+'</span>',
          '<span class="tiny muted">'+h(x.trich)+'</span>'];
      }));
      o += '<p class="tiny muted mt">Một số điện thoại trong đoạn chat có thể là số bệnh viện, số trường, '+
        'hoặc số của chính Học viện. Nghe người liên quan trình bày trước khi kết luận.</p>';
    }
  }
  return o;
};

})();
