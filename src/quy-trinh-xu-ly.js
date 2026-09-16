/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v8.2 — QUY TRÌNH XỬ LÝ CÓ RÀNG BUỘC

   Đây không phải một biểu mẫu để điền cho có. Đây là một cái khoá.

   Bảy bước, mỗi bước có bằng chứng bắt buộc. Thiếu một trường thì nút
   "đi tiếp" không bấm được — không phải cảnh báo rồi vẫn cho qua, mà
   không cho qua. Ba ràng buộc nữa chạy tự động: quá hạn thì ca đỏ lên,
   dấu hiệu nguy hiểm chưa chuyển tuyến thì ca đứng lại, và không ai
   giao được việc của tầng trên cho nhà tầng dưới.

   Mục đích không phải kiểm soát người làm. Mục đích là để ba tháng sau,
   khi một ca hỏng, mở hồ sơ ra là biết hỏng ở bước nào, ai làm, dựa
   vào bằng chứng gì. Càng làm càng yên tâm là ở chỗ đó.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var U = G.U, h = U.h, ic = U.ic;
G.VIEWS = G.VIEWS || {};

var KHO = 'gita365_ca_xu_ly';
G.CA = G.CA || [];

function nap(){
  try{ var v = JSON.parse(localStorage.getItem(KHO) || '[]'); if(Array.isArray(v)) G.CA = v; }catch(e){}
}
function ghi(){
  try{ localStorage.setItem(KHO, JSON.stringify(G.CA)); }catch(e){}
  if(G.danhDauCaiDat) G.danhDauCaiDat('ca');
}
G.napCa = nap; nap();

function buoc(ma){ return (G.QUYTRINH_XL || []).filter(function(b){ return b.ma === ma; })[0]; }
function chiSo(ma){
  var ds = G.QUYTRINH_XL || [];
  for(var i = 0; i < ds.length; i++) if(ds[i].ma === ma) return i;
  return -1;
}
function toi(){ return (G.S.acc && G.S.acc.ten) || ''; }
function vaiToi(){ return G.S.roleObj || null; }

/* Ai được mở và đẩy ca: từ Tư vấn trở lên. */
G.duocXuLyCa = function(){ var r = vaiToi(); return !!(r && r.lv <= 11); };

/* ═══════════ MỞ CA ═══════════ */
G.moCa = function(nha, tomTat){
  if(!G.duocXuLyCa()) return {ok:false, ly:'Chỉ từ Tư vấn trở lên mới mở được ca.'};
  if(String(tomTat || '').trim().length < 10)
    return {ok:false, ly:'Tóm tắt ca cần ít nhất 10 ký tự — đủ để người khác đọc là hiểu ca gì.'};
  var c = {
    id: 'C' + Date.now().toString(36).toUpperCase(),
    nha: nha || '', tom: String(tomTat).trim(),
    buoc: 'B1', xong: false, ketLuan: '',
    nguoiMo: toi(), vaiMo: (vaiToi() || {}).n || '',
    moLuc: Date.now(), doiLuc: Date.now(),
    du: {}, nhatKy: [{luc: Date.now(), viec: 'Mở ca', boi: toi()}]
  };
  G.CA.push(c); ghi();
  if(G.secLog) G.secLog('Mở ca xử lý', c.id + ' · ' + c.tom.slice(0, 60), 'Ghi nhận');
  return {ok:true, ca:c};
};

/* ═══════════ KIỂM BẰNG CHỨNG CỦA MỘT BƯỚC ═══════════
   Trả về danh sách trường còn thiếu. Rỗng nghĩa là đủ. */
G.thieuCua = function(ca, maBuoc){
  var b = buoc(maBuoc || ca.buoc);
  if(!b) return ['Bước không tồn tại'];
  var thieu = [];
  (b.canCo || []).forEach(function(t){
    var v = String((ca.du || {})[t.k] || '').trim();
    if(!v){ thieu.push(t.nhan); return; }
    if(t.toiThieu && v.length < t.toiThieu)
      thieu.push(t.nhan + ' (cần ít nhất ' + t.toiThieu + ' ký tự, đang có ' + v.length + ')');
    if(t.kieu === 'chon' && t.chon && t.chon.indexOf(v) < 0)
      thieu.push(t.nhan + ' (chưa chọn)');
  });
  return thieu;
};

/* RB3 — dấu hiệu nguy hiểm chặn mọi thứ khác */
G.chanNguyHiem = function(ca){
  var v = String((ca.du || {}).nguyHiem || '');
  if(v === 'Có — đang theo dõi sát' && !String((ca.du || {}).aiTheoDoi || '').trim())
    return 'Ca có dấu hiệu nguy hiểm và đang theo dõi sát. Phải ghi rõ ai theo dõi và theo dõi bằng cách nào.';
  return '';
};

/* RB4 — không cấp trên tầng */
G.chanVuotTang = function(ca){
  var t = String((ca.du || {}).tangCa || '').match(/(\d)/);
  var p = String((ca.du || {}).phacDo || '').match(/T(\d)/i);
  if(!t || !p) return '';
  if(Number(p[1]) > Number(t[1]))
    return 'Phác đồ tầng ' + p[1] + ' cho nhà đang ở tầng ' + t[1] +
           '. Không cấp trên tầng — nhà chưa qua nền mà nhận việc tầng trên thì bỏ cuộc.';
  return '';
};

/* ═══════════ GHI BẰNG CHỨNG ═══════════ */
G.ghiCa = function(id, khoa, giaTri){
  var c = G.CA.filter(function(x){ return x.id === id; })[0];
  if(!c) return {ok:false, ly:'Không tìm thấy ca.'};
  if(!G.duocXuLyCa()) return {ok:false, ly:'Không đủ quyền ghi vào ca.'};
  if(c.xong) return {ok:false, ly:'Ca đã đóng. Muốn sửa thì mở ca mới và dẫn về ca này.'};
  c.du = c.du || {};
  var v = String(giaTri == null ? '' : giaTri);

  /* Soi trước khi ghi: nội dung trong ca là thứ gia đình đọc lại được, nên
     số điện thoại cá nhân hay lời rủ ra ngoài hệ thống lọt vào đây là lọt
     thẳng tới nhà. Máy cảnh báo và ghi lại, người quyết định. */
  var soi = G.soiLuat ? G.soiLuat(v, 'Ghi vào ca ' + c.id + ' · trường ' + khoa) : {sach:true};

  c.du[khoa] = v;
  c.doiLuc = Date.now();
  ghi();
  if(!soi.sach && G.U)
    G.U.toast('Nội dung này có ' + soi.thay.map(function(x){ return x.ten.toLowerCase(); }).join(', ') +
      '. Luật LV-01: mọi trao đổi đi qua hệ thống. Lượt này đã vào nhật ký.', 'err');
  return {ok:true, soi:soi};
};

/* ═══════════ ĐI TIẾP ═══════════ */
G.buocTiep = function(id){
  var c = G.CA.filter(function(x){ return x.id === id; })[0];
  if(!c) return {ok:false, ly:'Không tìm thấy ca.'};
  if(!G.duocXuLyCa()) return {ok:false, ly:'Không đủ quyền.'};
  if(c.xong) return {ok:false, ly:'Ca đã đóng.'};

  /* RB1 — không nhảy bước */
  var thieu = G.thieuCua(c);
  if(thieu.length)
    return {ok:false, ly:'Chưa đi tiếp được. Còn thiếu: ' + thieu.join(' · '), thieu:thieu};

  /* RB3 — dấu hiệu nguy hiểm */
  var nh = G.chanNguyHiem(c);
  if(nh) return {ok:false, ly:nh};

  /* RB4 — không cấp trên tầng */
  var vt = G.chanVuotTang(c);
  if(vt) return {ok:false, ly:vt};

  var i = chiSo(c.buoc), ds = G.QUYTRINH_XL || [];
  c.nhatKy.push({luc:Date.now(), viec:'Xong ' + c.buoc, boi:toi()});

  if(i >= ds.length - 1){
    c.xong = true;
    c.ketLuan = String((c.du || {}).ketLuan || '');
    c.xongLuc = Date.now();
    ghi();
    if(G.secLog) G.secLog('Đóng ca', c.id + ' · ' + c.ketLuan, 'Ghi nhận');
    return {ok:true, dong:true, ca:c};
  }
  c.buoc = ds[i + 1].ma;
  c.doiLuc = Date.now();
  ghi();
  return {ok:true, ca:c, buocMoi:c.buoc};
};

/* ═══════════ RB2 — QUÁ HẠN ═══════════ */
G.quaHan = function(c){
  if(c.xong) return 0;
  var b = buoc(c.buoc);
  if(!b || !b.hanGio) return 0;
  var gio = (Date.now() - (c.doiLuc || c.moLuc)) / 3600e3;
  return gio > b.hanGio ? Math.round(gio - b.hanGio) : 0;
};

/* ═══════════ ĐO LƯỜNG ═══════════ */
G.doLuongCa = function(){
  var ds = G.CA;
  var theoBuoc = {};
  (G.QUYTRINH_XL || []).forEach(function(b){ theoBuoc[b.ma] = 0; });
  var treo = 0, xong = 0, chuyenTuyen = 0, nguyHiem = 0;
  ds.forEach(function(c){
    if(c.xong){ xong++; if(/[Cc]huyển tuyến/.test(c.ketLuan)) chuyenTuyen++; return; }
    if(theoBuoc[c.buoc] !== undefined) theoBuoc[c.buoc]++;
    if(G.quaHan(c)) treo++;
    if(/^Có/.test(String((c.du||{}).nguyHiem || ''))) nguyHiem++;
  });
  var dang = ds.length - xong;
  return {tong:ds.length, dang:dang, xong:xong, treo:treo,
    nguyHiem:nguyHiem, chuyenTuyen:chuyenTuyen, theoBuoc:theoBuoc,
    tyLeXong: ds.length ? Math.round(xong / ds.length * 100) : 0,
    tyLeTreo: dang ? Math.round(treo / dang * 100) : 0};
};

/* ═══════════════════════════════════════════════════════════════
   MÀN HÌNH · XỬ LÝ CA
   ═══════════════════════════════════════════════════════════════ */
function oNhap(c, t){
  var v = h(String((c.du || {})[t.k] || ''));
  var id = 'ca_' + c.id + '_' + t.k;
  if(t.kieu === 'chon')
    return '<select id="'+id+'" data-caghi="'+h(c.id)+'|'+h(t.k)+'" class="inp blk mb">'+
      '<option value="">— chọn —</option>'+
      t.chon.map(function(x){
        return '<option value="'+h(x)+'"'+(String((c.du||{})[t.k]) === x ? ' selected' : '')+'>'+h(x)+'</option>';
      }).join('')+'</select>';
  if(t.kieu === 'dai')
    return '<textarea id="'+id+'" data-caghi="'+h(c.id)+'|'+h(t.k)+'" rows="3" class="inp blk mb" '+
      'placeholder="'+h(t.nhan)+'">'+v+'</textarea>';
  return '<input id="'+id+'" data-caghi="'+h(c.id)+'|'+h(t.k)+'" class="inp blk mb" value="'+v+'" '+
    'placeholder="'+h(t.nhan)+'">';
}

function theCa(c){
  var b = buoc(c.buoc), i = chiSo(c.buoc), n = (G.QUYTRINH_XL || []).length;
  var tre = G.quaHan(c);
  var thieu = c.xong ? [] : G.thieuCua(c);

  var o = '<div class="card mt2" style="border-color:'+
    (c.xong ? 'var(--ok)' : tre ? 'var(--gita-do)' : 'var(--gita-vien-1)')+'">'+
    '<div class="row" style="gap:10px;align-items:baseline;flex-wrap:wrap">'+
      '<span class="mono sm" style="color:var(--gita-ink)">'+h(c.id)+'</span>'+
      '<b style="flex:1;min-width:200px">'+h(c.tom)+'</b>'+
      (c.xong ? '<span class="chip" style="color:var(--ok)">Đã đóng · '+h(c.ketLuan)+'</span>'
              : '<span class="chip">Bước '+(i+1)+'/'+n+' · '+h(b ? b.ten : c.buoc)+'</span>')+
      (tre ? '<span class="chip" style="color:var(--gita-do-ink)">'+ic('bell','w-3 h-3')+
             ' Quá hạn '+tre+' giờ</span>' : '')+
    '</div>'+
    '<p class="tiny muted mt">'+h(c.nha ? c.nha + ' · ' : '')+'mở bởi '+h(c.nguoiMo)+
      (c.vaiMo ? ' · ' + h(c.vaiMo) : '')+'</p>';

  if(!c.xong && b){
    o += '<div class="mt2" style="border-left:3px solid var(--gita);padding-left:14px">'+
      '<div class="tiny up mb" style="color:var(--gita-ink)">'+h(b.ma)+' · '+h(b.ten)+
        ' · hạn '+b.hanGio+' giờ</div>'+
      '<p class="sm" style="line-height:1.65">'+h(b.viec)+'</p>'+
      '<p class="tiny mt" style="color:var(--gita-do-ink);line-height:1.55">'+
        ic('shield','w-3 h-3')+' '+h(b.hongKhiThieu)+'</p></div>'+
      '<div class="mt2">'+ (b.canCo || []).map(function(t){
        return '<label class="tiny up muted">'+h(t.nhan)+'</label>'+oNhap(c, t);
      }).join('') +'</div>';

    if(thieu.length)
      o += '<div class="card pad-sm" style="border-color:var(--gita-do);background:var(--phu-1)">'+
        '<b class="sm" style="color:var(--gita-do-ink)">'+ic('lock','w-3 h-3')+' Chưa đi tiếp được</b>'+
        U.list(thieu, 'var(--gita-do)')+'</div>';

    o += '<button class="btn '+(thieu.length ? 'ghost' : 'pri')+' mt"'+
      (thieu.length ? ' disabled style="opacity:.5;cursor:not-allowed"' : '')+
      ' data-catiep="'+h(c.id)+'">'+ic('arrow','w-4 h-4')+
      (i >= n - 1 ? 'Đóng ca' : 'Xong bước này, đi tiếp')+'</button>';
  }

  if(c.nhatKy && c.nhatKy.length > 1)
    o += '<details class="mt2"><summary class="tiny up muted" style="cursor:pointer">'+
      'NHẬT KÝ CA · '+c.nhatKy.length+' mốc</summary>'+
      U.list(c.nhatKy.map(function(x){
        return new Date(x.luc).toLocaleString('vi-VN') + ' — ' + x.viec + ' · ' + x.boi;
      }))+'</details>';

  return o + '</div>';
}

G.VIEWS['xu-ly-ca'] = function(){
  var o = U.ph({eyebrow:'QUY TRÌNH BẮT BUỘC', ic:'shield', grad:1,
    t:'Xử lý ca theo bảy bước',
    lead:'Mỗi bước có bằng chứng phải nộp. Thiếu thì nút đi tiếp không bấm được — '+
         'không phải để làm khó, mà để ba tháng sau mở hồ sơ ra là biết hỏng ở đâu.'});

  /* Vai không đủ quyền vẫn thấy được màn này là gì và bảy bước gồm những
     gì — chỉ không thao tác được. Trước đây chỗ này trả về một dòng duy
     nhất, nên màn chỉ có tiêu đề và một câu: nhìn như màn hỏng. */
  if(!G.duocXuLyCa()){
    o += '<div class="card mt2" style="border-color:rgba(251,146,60,.35)">'+
      '<div class="row mb" style="gap:9px"><span style="color:var(--alert)">'+ic('lock','w-4 h-4')+'</span>'+
      '<b>Vai hiện tại chưa thao tác được trên màn này</b></div>'+
      '<p class="sm dim" style="line-height:1.7">Mở ca, nộp bằng chứng và đóng ca là việc của Tư vấn, Coach '+
      'và cấp quản lý. Vai của anh chị xem được quy trình để biết một ca đi qua những gì, '+
      'nhưng không mở được ca mới.</p>'+
      '<p class="tiny muted mt">Cần thao tác thì đề nghị Admin hệ thống cấp quyền <span class="mono">pro_consult</span> '+
      'cho tài khoản này.</p></div>';
    o += U.sec('BẢY BƯỚC CỦA MỘT CA','Xem được để biết ca của nhà mình đang ở đâu.');
    o += (G.QUYTRINH_XL || []).map(function(b){
      return '<div class="card pad-sm mb"><div class="row wrap mb" style="gap:8px">'+
        U.chip(b.ma,'#0B6675')+'<b class="sm">'+U.h(b.ten)+'</b>'+
        (b.hanGio ? '<span class="tiny muted mono">hạn '+b.hanGio+' giờ</span>' : '')+'</div>'+
        '<p class="tiny">'+U.h(b.viec)+'</p>'+
        (b.hongKhiThieu ? '<p class="tiny muted mt">Bỏ bước này thì: '+U.h(b.hongKhiThieu)+'</p>' : '')+
        '</div>';
    }).join('');
    return o;
  }

  /* Mở ca mới */
  o += '<div class="card mt2">'+
    '<div class="tiny up mb">MỞ CA MỚI</div>'+
    '<div class="row" style="gap:9px;flex-wrap:wrap">'+
      '<input id="caNha" class="inp" placeholder="Nhà nào (tên hoặc mã)" style="flex:1;min-width:200px">'+
      '<input id="caTom" class="inp" placeholder="Ca này là chuyện gì — một câu" style="flex:2;min-width:260px">'+
      '<button class="btn pri" data-act="ca-mo">'+ic('plus','w-4 h-4')+'Mở ca</button>'+
    '</div></div>';

  var d = G.doLuongCa();
  o += '<div class="card mt2"><div class="row" style="gap:18px;align-items:center;flex-wrap:wrap">'+
    U.ring(d.tyLeXong, 'var(--gita)', 'CA ĐÃ ĐÓNG')+
    '<div style="flex:1;min-width:220px">'+
      '<b class="sm">'+d.dang+' ca đang chạy · '+d.xong+' đã đóng</b>'+
      (d.treo ? '<p class="sm mt" style="color:var(--gita-do-ink)">'+ic('bell','w-3 h-3')+
        ' '+d.treo+' ca quá hạn — cần xem hôm nay</p>' : '<p class="sm dim mt">Không ca nào quá hạn.</p>')+
      (d.nguyHiem ? '<p class="sm mt" style="color:var(--gita-do-ink)">'+ic('shield','w-3 h-3')+
        ' '+d.nguyHiem+' ca có dấu hiệu cần người thật</p>' : '')+
    '</div></div></div>';

  var dang = G.CA.filter(function(c){ return !c.xong; });
  var xong = G.CA.filter(function(c){ return c.xong; });

  o += U.sec('CA ĐANG CHẠY', dang.length ? dang.length + ' ca' : 'Chưa có ca nào');
  if(!dang.length)
    o += G.khungTrong({
      ten:'Ca đang chạy', ic:'shield',
      seCo:'Mỗi ca là một chuyện của một nhà, đi qua bảy bước. Ở đây anh chị thấy ca đang ở bước nào, '+
           'còn thiếu bằng chứng gì, và ca nào đã quá hạn.',
      khiNao:'Ngay khi anh chị mở ca đầu tiên ở ô bên trên.',
      aiLam:'Tư vấn, Coach và cấp quản lý mở và đẩy ca. Gia đình không mở ca — đây là việc của đội ngũ.',
      viSao:'Xử lý theo bản năng thì không đo được, không truy được, và khi hỏng thì không ai biết hỏng ở '+
            'bước nào. Ba tháng sau mở hồ sơ ra, bảy bước này là thứ duy nhất còn nói được sự thật.',
      viDu:{tieu:'Một ca đang chạy trông như thế này', dong:[
        ['Mã ca','CM8K2F1A'],
        ['Nhà','Nhà Minh An'],
        ['Tóm tắt','Con ôm điện thoại, phụ huynh nhắc mãi không chuyển'],
        ['Đang ở bước','B4 Chọn đường đi · hạn 72 giờ'],
        ['Còn thiếu','Vì sao chọn đường này (cần ít nhất 40 ký tự)'],
        ['Người mở','Coach Đặng Hoàng Nam']
      ]},
      lam:[{t:'Xem bảy bước và bốn ràng buộc', v:'van-dung'},
           {t:'Mở bản đồ coaching', v:'bando-coach'}],
      ghi:'Mở ca ngay từ cuộc gọi đầu tiên, đừng đợi tới lúc chuyện đã lớn.'
    });
  else
    dang.sort(function(a,b2){ return G.quaHan(b2) - G.quaHan(a); }).forEach(function(c){ o += theCa(c); });

  if(xong.length){
    o += U.sec('CA ĐÃ ĐÓNG', xong.length + ' ca');
    xong.slice(-10).reverse().forEach(function(c){ o += theCa(c); });
  }

  o += U.sec('BỐN RÀNG BUỘC MÁY TỰ KIỂM','Không phụ thuộc ai nhớ');
  o += '<div class="row wrap" style="gap:12px">'+ (G.RANG_BUOC || []).map(function(r){
    return '<div class="card" style="flex:1;min-width:250px;border-color:var(--gita-vien-1)">'+
      '<span class="mono tiny" style="color:var(--gita)">'+h(r.ma)+'</span>'+
      '<b class="sm" style="display:block;margin:3px 0 5px">'+h(r.ten)+'</b>'+
      '<p class="sm" style="line-height:1.6">'+h(r.luat)+'</p>'+
      '<p class="tiny muted mt" style="line-height:1.55">'+h(r.viSao)+'</p></div>';
  }).join('') +'</div>';

  return o;
};

/* ═══════════ BẤM ═══════════ */
document.addEventListener('change', function(e){
  var t = e.target.closest && e.target.closest('[data-caghi]');
  if(!t) return;
  var p = t.getAttribute('data-caghi').split('|');
  G.ghiCa(p[0], p[1], t.value);
});

document.addEventListener('click', function(e){
  var b = e.target.closest && e.target.closest('[data-catiep]');
  if(b){
    var r = G.buocTiep(b.getAttribute('data-catiep'));
    U.toast(r.ok ? (r.dong ? 'Ca đã đóng và vào nhật ký.' : 'Xong bước. Sang ' + r.buocMoi + '.') : r.ly,
      r.ok ? 'ok' : 'err');
    if(r.ok) G.render && G.render();
    return;
  }
  var a = e.target.closest && e.target.closest('[data-act="ca-mo"]');
  if(a){
    var nha = (document.getElementById('caNha') || {}).value || '';
    var tom = (document.getElementById('caTom') || {}).value || '';
    var r2 = G.moCa(nha, tom);
    U.toast(r2.ok ? 'Đã mở ca ' + r2.ca.id + '. Bắt đầu từ B1 Tiếp nhận.' : r2.ly, r2.ok ? 'ok' : 'err');
    if(r2.ok) G.render && G.render();
  }
});

})();

/* ═══════════════════════════════════════════════════════════════
   MÀN HÌNH · BỘ VẬN DỤNG 5 CẤP ĐỘ
   Gắn được vào mọi màn tài liệu qua G.veVanDung(loai).
   ═══════════════════════════════════════════════════════════════ */
(function(){
var U = G.U, h = U.h, ic = U.ic;
G.VIEWS = G.VIEWS || {};

/* Khối vận dụng gọn, chèn được xuống cuối bất kỳ màn tài liệu nào. */
G.veVanDung = function(loai){
  var v = (G.VANDUNG || []).filter(function(x){ return x.loai === loai; })[0];
  if(!v) return '';
  var khach = G.LA_KHACH && G.LA_KHACH();
  if(khach) return '';    /* phần này của đội ngũ, không hiện với gia đình */

  var o = '<div class="card mt2" style="border-color:var(--gita-vien-1)">'+
    '<div class="row" style="gap:9px;align-items:center">'+ic(v.ic,'w-4 h-4')+
      '<b>Vận dụng '+h(loai.toLowerCase())+' — dành cho người dẫn</b></div>'+
    '<p class="sm dim mt" style="line-height:1.65">'+h(v.laGi)+'</p>'+
    '<div class="row wrap mt2" style="gap:8px">'+
      '<span class="chip">Ai dùng: '+h(v.aiDung.join(' · '))+'</span>'+
      '<span class="chip">Tầng: '+h(v.tangDung)+'</span>'+
    '</div>'+
    '<div class="row wrap mt2" style="gap:12px;align-items:stretch">'+
      '<div style="flex:1;min-width:250px">'+
        '<div class="tiny up mb" style="color:var(--gita-ink)">DÙNG KHI</div>'+
        U.list(v.dungKhi)+'</div>'+
      '<div style="flex:1;min-width:250px">'+
        '<div class="tiny up mb" style="color:var(--gita-do-ink)">KHÔNG DÙNG KHI</div>'+
        U.list(v.khongDungKhi, 'var(--gita-do)')+'</div>'+
    '</div>'+
    '<div class="mt2"><div class="tiny up mb">BÁO CÁO BẮT BUỘC SAU KHI DÙNG</div>'+
      U.list(v.baoCao)+'</div>'+
    '<p class="tiny muted mt"><a href="#" data-v="van-dung">Xem đủ năm cấp độ vận dụng →</a></p>'+
  '</div>';
  return o;
};

G.VIEWS['van-dung'] = function(){
  var o = U.ph({eyebrow:'CHIỀU SÂU NGHỀ', ic:'brain', grad:1,
    t:'Năm cấp độ vận dụng',
    lead:'Hai người cùng cầm một phác đồ, một người mở được một nhà ra, một người đọc cho xong buổi. '+
         'Chênh lệch nằm ở chỗ vận dụng. Đây là chỗ đó, viết ra thành năm cấp.'});

  o += '<div class="row wrap mt2" style="gap:12px;align-items:stretch">'+
    (G.CAPDO_VANDUNG || []).map(function(c){
      return '<div class="card" style="flex:1;min-width:280px;border-left:3px solid '+c.mau+'">'+
        '<div class="row" style="gap:8px;align-items:baseline">'+
          '<span class="mono" style="font-size:18px;font-weight:800;color:'+c.mau+'">'+h(c.ma)+'</span>'+
          '<b style="font-size:16px">'+h(c.ten)+'</b></div>'+
        '<p class="sm mt" style="line-height:1.6"><b>Cho ai:</b> '+h(c.choAi)+'</p>'+
        '<p class="sm mt" style="line-height:1.6"><b>Độ sâu:</b> '+h(c.sau)+'</p>'+
        '<p class="sm mt" style="line-height:1.6"><b>Người đọc thấy:</b> '+h(c.docThayGi)+'</p>'+
        '<p class="sm mt" style="line-height:1.6"><b>Người dẫn làm gì:</b> '+h(c.nguoiHuongDan)+'</p>'+
        '<div class="mt" style="border-left:2px solid var(--ok);padding-left:10px">'+
          '<p class="tiny" style="line-height:1.55;color:var(--ok)">✓ Đủ để lên cấp: '+h(c.dauHieuDuVao)+'</p></div>'+
        '<div class="mt" style="border-left:2px solid var(--gita-do);padding-left:10px">'+
          '<p class="tiny" style="line-height:1.55;color:var(--gita-do-ink)">✕ Chưa đủ: '+h(c.dauHieuChua)+'</p></div>'+
        '<p class="tiny muted mt" style="line-height:1.55">Lỗi thường gặp: '+h(c.loiThuongGap)+'</p>'+
      '</div>';
    }).join('')+'</div>';

  o += U.sec('GIỚI HẠN THEO VỊ TRÍ','Cấp độ cao nhất mỗi vị trí được vận dụng, theo từng loại tài liệu');
  var viTri = ['Giáo viên','Mentor','Tư vấn','Coach','Senior Coach'];
  o += U.tbl(['Loại tài liệu'].concat(viTri), (G.VANDUNG || []).map(function(v){
    return ['<b class="sm">'+h(v.loai)+'</b>'].concat(viTri.map(function(p){
      var c = (v.capToiDa || {})[p] || '—';
      var cd = (G.CAPDO_VANDUNG || []).filter(function(x){ return x.ma === c; })[0];
      return cd ? '<span class="chip" style="color:'+cd.mau+'">'+h(c)+'</span>' : '<span class="muted">—</span>';
    }));
  }));
  o += '<p class="tiny muted mt">Vượt giới hạn không phải là nhiệt tình. Người ở C2 dùng tài liệu ở '+
    'mức C4 thì ghép bừa, và nhà nhận hậu quả chứ không phải người dẫn.</p>';

  (G.VANDUNG || []).forEach(function(v){
    o += U.sec(v.loai.toUpperCase(), v.laGi);
    o += G.veVanDung(v.loai);
  });

  o += U.sec('BẢY BƯỚC XỬ LÝ BẮT BUỘC','Mỗi bước có bằng chứng phải nộp — thiếu thì không đi tiếp được');
  o += '<div class="card">'+ (G.QUYTRINH_XL || []).map(function(b, i){
    return '<div style="'+(i ? 'border-top:1px solid var(--line);padding-top:14px;margin-top:14px' : '')+'">'+
      '<div class="row" style="gap:9px;align-items:baseline;flex-wrap:wrap">'+
        '<span class="mono sm" style="color:var(--gita);font-weight:800">'+h(b.ma)+'</span>'+
        '<b class="sm" style="flex:1;min-width:160px">'+h(b.ten)+'</b>'+
        '<span class="chip">hạn '+b.hanGio+' giờ</span></div>'+
      '<p class="sm mt" style="line-height:1.6">'+h(b.viec)+'</p>'+
      '<div class="mt"><span class="tiny up muted">BẰNG CHỨNG PHẢI NỘP</span>'+
        U.list((b.canCo || []).map(function(t){ return t.nhan; }))+'</div>'+
      '<p class="tiny mt" style="color:var(--gita-do-ink);line-height:1.55">'+
        ic('shield','w-3 h-3')+' Bỏ bước này: '+h(b.hongKhiThieu)+'</p></div>';
  }).join('') +'</div>';

  o += '<div class="card mt2" style="border-color:var(--gita)">'+
    '<b>'+ic('arrow','w-4 h-4')+' Mở một ca thật</b>'+
    '<p class="sm dim mt">Quy trình trên chạy thật ở màn Xử lý ca. Mở ca, điền bằng chứng từng bước, '+
    'hệ thống tự chặn khi thiếu và tự báo khi quá hạn.</p>'+
    '<button class="btn pri mt" data-v="xu-ly-ca">Vào màn xử lý ca</button></div>';

  return o;
};

})();

/* ═══════════════════════════════════════════════════════════════
   GẮN KHỐI VẬN DỤNG VÀO CÁC MÀN TÀI LIỆU
   Bọc lại năm màn có sẵn thay vì sửa từng tệp — một chỗ để thêm,
   một chỗ để bỏ, và không đụng vào mã của các màn đó.
   ═══════════════════════════════════════════════════════════════ */
(function(){
var GAN = {
  'mo-thuc':      'Mô thức',
  'phac-do':      'Phác đồ',
  'kich-ban':     'Kịch bản',
  'tinh-huong':   'Tình huống',
  'tai-lieu-goc': 'Tài liệu Học viện'
};
/* Bản đồ cá nhân tự gọi G.veVanDung trong thân màn, chỉ hiện với đội ngũ —
   không gắn qua GAN để tránh gắn hai lần. */
Object.keys(GAN).forEach(function(v){
  var goc = G.VIEWS[v];
  if(typeof goc !== 'function') return;
  G.VIEWS[v] = function(){
    return goc.apply(this, arguments) + (G.veVanDung ? G.veVanDung(GAN[v]) : '');
  };
});
})();
