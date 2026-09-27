/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v7.8 — THƯ VIỆN TÀI LIỆU: GỬI LÊN VÀ KIỂM DUYỆT
   Mọi vị trí đều gửi được tài liệu lên làm giàu kho chung.
   Super Admin và Admin hệ thống xem — chấm mức chuẩn hoá — duyệt,
   yêu cầu chỉnh sửa hoặc từ chối. Chỉ tài liệu ĐÃ DUYỆT mới vào kho.

   Tệp thật nằm ở Drive của Học viện, đẩy lên qua máy chủ cấp phép.
   Chưa nối máy chủ thì ứng dụng ghi nhận hồ sơ tài liệu và nói thẳng
   là tệp chưa được lưu — không giả vờ đã tải lên.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var KEY = 'gita365_thuvien';
var U = G.U, h = U.h, ic = U.ic;

/* ─── Sổ tài liệu ─── */
G.THUVIEN = (function(){
  try{ var d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
  catch(e){ return []; }
})();
function luu(){
  try{ localStorage.setItem(KEY, JSON.stringify(G.THUVIEN)); }catch(e){}
  if(G.danhDau) G.danhDau('thuvien','so');
}

var LOAI = [
  {id:'giai-phap', t:'Hệ thống giải pháp'},
  {id:'quy-trinh', t:'Quy trình'},
  {id:'giao-trinh',t:'Giáo trình · bài giảng'},
  {id:'kich-ban',  t:'Kịch bản chuyên môn'},
  {id:'phac-do',   t:'Phác đồ'},
  {id:'bieu-mau',  t:'Biểu mẫu · văn bản'},
  {id:'tinh-huong',t:'Tình huống thực chiến'},
  {id:'tu-lieu',   t:'Tư liệu tham khảo'}
];

/* Bảy điểm chuẩn hoá — lấy thẳng từ bộ nhận diện, không tự nghĩ ra bộ khác. */
var CHUAN = [
  {id:'logo',   t:'Có logo GITA và khoảng thở đúng chuẩn'},
  {id:'dinhdanh',t:'Có tên tài liệu, tầng áp dụng, phiên bản, ngày ban hành'},
  {id:'banquyen',t:'Có dòng bản quyền Học viện GITA'},
  {id:'truynguyen',t:'Có mã truy nguyên ở chân trang'},
  {id:'vai',    t:'Ghi rõ vai nào được giữ tài liệu này'},
  {id:'mau',    t:'Chỉ dùng ba màu thương hiệu, không có màu lạ'},
  {id:'nguon',  t:'Dẫn được nguồn: mô thức GITA nào, nhịp ngôn từ nào'}
];

var TRANG_THAI = {
  'cho-duyet':   {t:'Chờ duyệt',            c:'#96500A'},
  'yeu-cau-sua': {t:'Yêu cầu chỉnh sửa',    c:'#BE0E16'},
  'da-duyet':    {t:'Đã duyệt — vào kho',   c:'#0B7350'},
  'tu-choi':     {t:'Không nhận',           c:'#665E88'}
};

function maTL(){
  return 'TL-' + new Date().toISOString().slice(2,7).replace('-','') + '-' +
    String(G.THUVIEN.length + 1).padStart(4,'0');
}

/* ─── Danh sách tài liệu vai hiện tại được nhìn ─── */
G.taiLieuThayDuoc = function(){
  var u = (G.S.acc && G.S.acc.u) || '';
  if(G.can('tl_xem_het')) return G.THUVIEN.slice();
  return G.THUVIEN.filter(function(t){ return t.nguoiGui === u || t.trangThai === 'da-duyet'; });
};

/* ═══════════════ MÀN 1 · THƯ VIỆN & GỬI TÀI LIỆU ═══════════════ */
G.VIEWS['thu-vien'] = function(){
  var ds = G.taiLieuThayDuoc();
  var guiDuoc = G.can('tl_gui');

  var o = U.ph({eyebrow:'THƯ VIỆN TÀI LIỆU', ic:'book', grad:1,
    t:'Kho tài liệu của cả hệ',
    lead:'Mọi vị trí đều gửi được tài liệu lên đây. Tài liệu qua kiểm duyệt sẽ vào kho chung '+
      'và mở cho đúng những vai được phép đọc.'});

  var dem = {};
  Object.keys(TRANG_THAI).forEach(function(k){
    dem[k] = ds.filter(function(t){ return t.trangThai === k; }).length;
  });
  o += '<div class="pv-lo">'+
    '<div class="pv-th"><b>'+ds.length+'</b><span>TÀI LIỆU ĐANG CÓ</span></div>'+
    '<div class="pv-th"><b>'+dem['da-duyet']+'</b><span>ĐÃ VÀO KHO</span></div>'+
    '<div class="pv-th"><b>'+dem['cho-duyet']+'</b><span>ĐANG CHỜ DUYỆT</span></div>'+
    '<div class="pv-th"><b>'+dem['yeu-cau-sua']+'</b><span>CẦN CHỈNH SỬA</span></div></div>';

  /* Nói thật khi kho còn trống */
  if(!ds.length){
    o += '<div class="card mt2" style="border-color:var(--gita-vien-1)">'+
      '<div class="row mb"><span style="color:var(--gita-ink)">'+ic('seed','w-4 h-4')+'</span>'+
      '<b>Kho đang trống — chưa ai gửi tài liệu nào lên</b></div>'+
      '<p class="sm" style="line-height:1.75;color:var(--ink-2)">Đây là kho tài liệu do chính đội ngũ đóng góp, '+
      'khác với kho chuyên môn đã mã hoá sẵn trong ứng dụng. Kho này bắt đầu từ con số không và lớn lên '+
      'theo từng tài liệu được gửi và duyệt.</p>'+
      '<p class="sm muted mt">Gửi tài liệu đầu tiên ở ô bên dưới.</p></div>';
  }

  /* ─── Ô gửi tài liệu — mở cho MỌI vị trí ─── */
  if(guiDuoc){
    o += U.sec('GỬI TÀI LIỆU LÊN','Vị trí nào cũng gửi được — kho lớn lên nhờ chỗ này');
    o += '<div class="card">'+
      '<div class="ct-luoi">'+
        '<div style="grid-column:1/-1"><label class="tiny up muted">TÊN TÀI LIỆU</label>'+
          '<input id="tl_ten" class="inp blk" placeholder="Bộ giáo trình kỹ năng học tập tầng 2"></div>'+
        '<div><label class="tiny up muted">LOẠI TÀI LIỆU</label>'+
          '<select id="tl_loai" class="inp blk">'+
            LOAI.map(function(l){ return '<option value="'+h(l.id)+'">'+h(l.t)+'</option>'; }).join('')+
          '</select></div>'+
        '<div><label class="tiny up muted">ÁP DỤNG CHO TẦNG</label>'+
          '<select id="tl_tang" class="inp blk"><option value="">Dùng chung mọi tầng</option>'+
            (G.TIERS||[]).map(function(t){ return '<option value="'+t.id+'">'+h(t.code+' · '+t.name)+'</option>'; }).join('')+
          '</select></div>'+
        '<div style="grid-column:1/-1"><label class="tiny up muted">TÀI LIỆU NÀY GIẢI QUYẾT VIỆC GÌ</label>'+
          '<textarea id="tl_mo" class="inp blk" rows="3" placeholder="Viết ngắn: dùng cho ai, trong tình huống nào, thay thế hay bổ sung cho tài liệu nào."></textarea></div>'+
        '<div style="grid-column:1/-1"><label class="tiny up muted">CHỌN TỆP</label>'+
          '<input id="tl_tep" type="file" class="inp blk" '+
            'accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.webp,.txt,.csv"></div>'+
      '</div>'+
      '<div class="card pad-sm mt" style="border-color:var(--gita-vien-1)">'+
        '<div class="tiny up muted mb">TỰ CHẤM TRƯỚC KHI GỬI — bảy điểm chuẩn hoá</div>'+
        CHUAN.map(function(c){
          return '<label class="dk-dy" style="margin:0 0 6px"><input type="checkbox" class="tl-chuan" data-c="'+h(c.id)+'">'+
            '<span class="tiny" style="line-height:1.5;color:var(--ink-2)">'+h(c.t)+'</span></label>';
        }).join('')+
        '<p class="tiny muted" style="margin-top:6px">Thiếu điểm nào cứ gửi — người duyệt sẽ ghi rõ cần bổ sung gì. '+
        'Tự chấm trung thực giúp vòng duyệt nhanh hơn nhiều.</p>'+
      '</div>'+
      '<div id="tl_loi" class="tiny mt" style="color:var(--gita-do-ink);min-height:16px"></div>'+
      '<button class="btn pri mt" data-act="tl-gui">'+ic('plus','w-4 h-4')+'Gửi lên thư viện</button>'+
      (G.API_CAP_PHEP ? '' :
        '<p class="tiny muted mt">Bản mẫu chưa nối máy chủ: hồ sơ tài liệu được ghi lại, nhưng '+
        '<b>tệp chưa được lưu lên Drive của Học viện</b>. Nối máy chủ rồi gửi lại tệp.</p>')+
      '</div>';
  } else {
    o += U.lockCard('Vai hiện tại chưa được gửi tài liệu lên thư viện.');
  }

  /* ─── Danh sách ─── */
  if(ds.length){
    o += U.sec('TÀI LIỆU ĐANG CÓ', ds.length + (G.can('tl_xem_het') ? ' — toàn hệ' : ' — của tôi và tài liệu đã duyệt'));
    o += U.tbl(['Mã · Tên','Loại · Tầng','Người gửi','Chuẩn hoá','Trạng thái'],
      ds.slice().reverse().map(function(t){
        var tt = TRANG_THAI[t.trangThai] || TRANG_THAI['cho-duyet'];
        var loai = (LOAI.filter(function(l){ return l.id === t.loai; })[0] || {}).t || t.loai;
        var tang = t.tang ? ('T' + t.tang) : 'chung';
        return ['<div class="pq-ten"><b>'+h(t.ten)+'</b><span class="mono tiny muted">'+h(t.id)+'</span></div>',
          '<span class="sm">'+h(loai)+'</span><div class="tiny muted">'+h(tang)+'</div>',
          '<span class="sm">'+h(t.vaiGui||'')+'</span><div class="tiny muted">'+h(t.nguoiGui||'')+'</div>',
          '<b>'+(t.diemChuan||0)+'</b><span class="muted sm"> / '+CHUAN.length+'</span>',
          U.chip(tt.t, tt.c)];
      }));
  }
  return o;
};

G.guiTaiLieu = function(){
  var loi = document.getElementById('tl_loi');
  function bao(t){ if(loi) loi.textContent = t; }
  if(!G.can('tl_gui')){ bao('Vai hiện tại chưa được gửi tài liệu.'); return; }
  var ten = ((document.getElementById('tl_ten')||{}).value || '').trim();
  var mo  = ((document.getElementById('tl_mo')||{}).value || '').trim();
  var loai = (document.getElementById('tl_loai')||{}).value || '';
  var tang = (document.getElementById('tl_tang')||{}).value || '';
  var oTep = document.getElementById('tl_tep');
  var tep = oTep && oTep.files && oTep.files[0];

  if(ten.length < 6){ bao('Tên tài liệu quá ngắn — viết đủ để người khác tìm lại được.'); return; }
  if(mo.length < 20){ bao('Viết vài dòng tài liệu này giải quyết việc gì, để người duyệt hiểu đúng.'); return; }
  if(!tep){ bao('Chưa chọn tệp.'); return; }
  if(tep.size > 25 * 1024 * 1024){ bao('Tệp lớn hơn 25 MB — tách nhỏ hoặc nén lại rồi gửi.'); return; }

  var dat = [].slice.call(document.querySelectorAll('.tl-chuan:checked')).map(function(x){
    return x.getAttribute('data-c');
  });

  var ban = {
    id: maTL(), ten: ten, loai: loai, tang: tang ? Number(tang) : 0, moTa: mo,
    tenTep: tep.name, coTep: tep.size, kieuTep: tep.type || '',
    nguoiGui: (G.S.acc && G.S.acc.u) || '', vaiGui: (G.S.roleObj && G.S.roleObj.n) || '',
    vaiId: G.S.role || '', luc: new Date().toISOString(),
    trangThai: 'cho-duyet', tuCham: dat, diemChuan: dat.length, ghiChu: [],
    daLuuTep: false
  };
  G.THUVIEN.push(ban); luu();
  if(G.secLog) G.secLog('Gửi tài liệu', ban.id + ' · ' + ten + ' · ' + ban.nguoiGui, 'Ghi nhận');

  if(G.API_CAP_PHEP && G.dayTepLen) G.dayTepLen(ban, tep);

  U.toast('Đã gửi ' + ban.id + ' — đang chờ kiểm duyệt.', 'ok');
  G.render();
};

/* ═══════════════ MÀN 2 · KIỂM DUYỆT ═══════════════ */
G.VIEWS['duyet-tai-lieu'] = function(){
  if(!G.can('tl_duyet'))
    return U.lockCard('Kiểm duyệt tài liệu là quyền của Super Admin và Admin hệ thống. '+
      'Tài liệu vào kho là thứ cả hệ dùng, nên chỉ hai vị trí đó được quyết.');

  var cho = G.THUVIEN.filter(function(t){ return t.trangThai === 'cho-duyet'; });
  var sua = G.THUVIEN.filter(function(t){ return t.trangThai === 'yeu-cau-sua'; });
  var xong = G.THUVIEN.filter(function(t){ return t.trangThai === 'da-duyet'; });

  var o = U.ph({eyebrow:'QUẢN TRỊ TRANG · CHỈ R01 – R02', ic:'shield', grad:1,
    t:'Kiểm duyệt tài liệu',
    lead:'Xem tài liệu đội ngũ gửi lên, chấm mức chuẩn hoá, rồi duyệt — yêu cầu chỉnh sửa — hoặc không nhận. '+
      'Mọi quyết định đều ghi lý do và vào nhật ký.'});

  o += '<div class="pv-lo">'+
    '<div class="pv-th"><b>'+cho.length+'</b><span>CHỜ TÔI DUYỆT</span></div>'+
    '<div class="pv-th"><b>'+sua.length+'</b><span>ĐÃ YÊU CẦU SỬA</span></div>'+
    '<div class="pv-th"><b>'+xong.length+'</b><span>ĐÃ VÀO KHO</span></div></div>';

  if(!G.THUVIEN.length){
    o += G.khungTrong({
      ten:'Kiểm duyệt tài liệu', ic:'shield',
      seCo:'Từng tài liệu đội ngũ gửi lên sẽ nằm ở đây, kèm bảy điểm chuẩn hoá người gửi đã tự chấm, '+
           'mức tầng, loại tài liệu và tệp đính kèm. Anh chị đọc rồi chọn một trong ba: duyệt vào kho, '+
           'yêu cầu chỉnh sửa kèm điều cần bổ sung, hoặc không nhận kèm lý do.',
      khiNao:'Ngay khi một người trong đội ngũ gửi bản đầu tiên qua màn Thư viện tài liệu.',
      aiLam:'Mọi vị trí đều gửi được — đó là cách kho lớn lên. Nhưng chỉ Super Admin và Admin hệ thống duyệt.',
      viSao:'Tài liệu chưa duyệt mà đã đưa cho gia đình dùng là chỗ sai lan nhanh nhất: một bản sai được '+
            'chép lại mười lần trước khi có ai phát hiện. Hàng chờ này là cửa duy nhất vào kho thật.',
      viDu:{tieu:'Một bản chờ duyệt trông như thế này', dong:[
        ['Mã','TL-K3F2A9'],
        ['Tên','Bảng theo dõi giờ ngủ 21 ngày'],
        ['Loại','Quy trình · Tầng 1'],
        ['Người gửi','coach@gita365.vn · Coach'],
        ['Tự chấm chuẩn hoá','5 / 7 điểm — thiếu mã tra cứu và nguồn gốc'],
        ['Trạng thái','Chờ duyệt · gửi 2 giờ trước']
      ]},
      lam:[{t:'Mở thư viện để gửi thử một bản', v:'thu-vien'},
           {t:'Xem bảy điểm chuẩn hoá', v:'hang-tai-lieu'}],
      ghi:'Gửi thử một bản là cách nhanh nhất để thấy màn này chạy — bản thử duyệt xong xoá được.'
    });
    return o;
  }

  function the(t){
    var tt = TRANG_THAI[t.trangThai];
    var loai = (LOAI.filter(function(l){ return l.id === t.loai; })[0] || {}).t || t.loai;
    var thieu = CHUAN.filter(function(c){ return (t.tuCham||[]).indexOf(c.id) < 0; });
    return '<div class="tl-the">'+
      '<div class="tl-the-h">'+
        '<div><b>'+h(t.ten)+'</b>'+
          '<div class="tiny muted mono">'+h(t.id)+' · '+h(loai)+(t.tang?' · T'+t.tang:'')+'</div></div>'+
        U.chip(tt.t, tt.c)+'</div>'+
      '<p class="sm" style="line-height:1.65;color:var(--ink-2);margin:9px 0">'+h(t.moTa)+'</p>'+
      '<div class="tiny muted">Người gửi: <b>'+h(t.nguoiGui)+'</b> · '+h(t.vaiGui)+
        ' · tệp <span class="mono">'+h(t.tenTep)+'</span> ('+Math.round((t.coTep||0)/1024)+' KB)'+
        (t.daLuuTep ? '' : ' — <b style="color:var(--gita-do-ink)">tệp chưa lưu lên Drive</b>')+'</div>'+
      '<div class="tl-chuan-o">'+
        '<div class="tiny up muted mb">MỨC CHUẨN HOÁ — '+(t.diemChuan||0)+'/'+CHUAN.length+'</div>'+
        (thieu.length
          ? '<div class="tiny" style="color:var(--gita-do-ink);line-height:1.6">Còn thiếu: '+
             h(thieu.map(function(c){ return c.t.toLowerCase(); }).join(' · '))+'</div>'
          : '<div class="tiny" style="color:var(--ok)">Đủ bảy điểm chuẩn hoá</div>')+
      '</div>'+
      ((t.ghiChu||[]).length ? '<div class="tl-ghi">'+ t.ghiChu.map(function(g){
        return '<div class="tl-ghi-d"><b>'+h(g.viec)+'</b> — '+h(g.noi)+
          '<span class="tiny muted"> · '+h(g.ai)+'</span></div>';
      }).join('') +'</div>' : '')+
      (t.trangThai === 'cho-duyet' || t.trangThai === 'yeu-cau-sua'
        ? '<input class="inp blk mt" id="tl_ly_'+h(t.id)+'" placeholder="Lý do hoặc điều cần bổ sung — bắt buộc khi yêu cầu sửa hay không nhận">'+
          '<div class="row mt" style="gap:8px;flex-wrap:wrap">'+
          '<button class="btn pri sm" data-tlduyet="'+h(t.id)+'">'+ic('check','w-4 h-4')+'Duyệt vào kho</button>'+
          '<button class="btn ghost sm" data-tlsua="'+h(t.id)+'">Yêu cầu chỉnh sửa</button>'+
          '<button class="btn ghost sm" data-tltuchoi="'+h(t.id)+'">Không nhận</button></div>'
        : '')+
      '</div>';
  }

  if(cho.length){ o += U.sec('CHỜ DUYỆT', cho.length + ' tài liệu'); o += cho.map(the).join(''); }
  if(sua.length){ o += U.sec('ĐÃ YÊU CẦU CHỈNH SỬA', sua.length + ' tài liệu'); o += sua.map(the).join(''); }
  if(xong.length){ o += U.sec('ĐÃ VÀO KHO', xong.length + ' tài liệu'); o += xong.map(the).join(''); }
  return o;
};

function quyetDinh(id, viec, canLyDo){
  if(!G.can('tl_duyet')){ U.toast('Vai này không có quyền kiểm duyệt.','err'); return; }
  var t = G.THUVIEN.filter(function(x){ return x.id === id; })[0];
  if(!t) return;
  var o = document.getElementById('tl_ly_' + id);
  var ly = (o && o.value || '').trim();
  if(canLyDo && ly.length < 8){
    U.toast('Ghi rõ lý do hoặc điều cần bổ sung — người gửi cần biết phải sửa gì.','err');
    if(o) o.focus();
    return;
  }
  t.trangThai = viec === 'duyet' ? 'da-duyet' : viec === 'sua' ? 'yeu-cau-sua' : 'tu-choi';
  t.ghiChu = t.ghiChu || [];
  t.ghiChu.push({
    viec: viec === 'duyet' ? 'Đã duyệt' : viec === 'sua' ? 'Yêu cầu chỉnh sửa' : 'Không nhận',
    noi: ly || 'Đạt chuẩn, đưa vào kho.',
    ai: (G.S.acc && G.S.acc.u) || '', luc: new Date().toISOString()
  });
  luu();
  if(G.secLog) G.secLog('Kiểm duyệt tài liệu',
    t.id + ' → ' + t.trangThai + (ly ? ' · ' + ly : '') + ' · ' + (G.S.acc && G.S.acc.u), 'Ghi nhận');

  /* Gửi quyết định lên máy chủ.
     Trước đây hàm này chỉ sửa localStorage: Admin duyệt hai mươi tài liệu
     buổi sáng, sổ trên Google Sheet vẫn "chờ duyệt" cả hai mươi, và Admin
     thứ hai mở máy mình thấy y nguyên rồi duyệt lại lần nữa. */
  if(G.API_CAP_PHEP){
    fetch(G.API_CAP_PHEP, {
      method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'},
      body: JSON.stringify({fn:'duyetTaiLieu', u:(G.S.acc && G.S.acc.u) || '',
        token: G.PHIEN_TOKEN || '', ma: t.id, viec: viec, lyDo: ly})
    }).then(function(r){ return r.json(); })
      .then(function(d){
        if(d && d.ok){ U.toast('Đã ghi quyết định cho ' + t.id + ' — máy chủ đã nhận.','ok'); return; }
        t.chuaDongBo = true; luu();
        U.toast('Đã ghi trên máy này, nhưng máy chủ chưa nhận: ' +
          ((d && d.error) || 'không rõ lý do') + '. Bấm lại khi có mạng.','err');
      })
      .catch(function(){
        t.chuaDongBo = true; luu();
        U.toast('Đã ghi trên máy này. Chưa gửi được lên máy chủ — bấm lại khi có mạng.','err');
      });
  } else {
    U.toast('Đã ghi quyết định cho ' + t.id + '. Bản mẫu chưa nối máy chủ nên chưa gửi đi.','ok');
  }
  G.render();
}

document.addEventListener('click', function(e){
  var a = e.target.closest && e.target.closest('[data-tlduyet]');
  if(a) return quyetDinh(a.getAttribute('data-tlduyet'), 'duyet', false);
  var b = e.target.closest && e.target.closest('[data-tlsua]');
  if(b) return quyetDinh(b.getAttribute('data-tlsua'), 'sua', true);
  var c = e.target.closest && e.target.closest('[data-tltuchoi]');
  if(c) return quyetDinh(c.getAttribute('data-tltuchoi'), 'tuchoi', true);
});

/* ─── Đẩy tệp lên Drive của Học viện qua máy chủ cấp phép ─── */
G.dayTepLen = function(ban, tep){
  var doc = new FileReader();
  doc.onload = function(){
    fetch(G.API_CAP_PHEP, {
      method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'},
      body: JSON.stringify({
        fn:'napTaiLieu', u:(G.S.acc && G.S.acc.u), token:G.PHIEN_TOKEN || '',
        ban:{id:ban.id, ten:ban.ten, loai:ban.loai, tang:ban.tang, moTa:ban.moTa,
             tenTep:ban.tenTep, kieuTep:ban.kieuTep},
        dulieu: String(doc.result).split(',')[1] || ''
      })
    }).then(function(r){ return r.json(); })
      .then(function(d){
        if(!d || !d.ok) throw new Error(d && d.error || 'Máy chủ từ chối');
        var t = G.THUVIEN.filter(function(x){ return x.id === ban.id; })[0];
        if(t){ t.daLuuTep = true; t.driveId = d.driveId || ''; luu(); }
        U.toast('Đã lưu tệp lên Drive của Học viện.','ok');
      })
      .catch(function(err){ U.toast('Chưa lưu được tệp: ' + err.message, 'err'); });
  };
  doc.readAsDataURL(tep);
};
})();

/* ═══════════════════════════════════════════════════════════════
   MINH CHỨNG NHIỆM VỤ — phụ huynh và học viên nộp, Coach xác nhận
   Khác thư viện ở chỗ: đây là bằng chứng của MỘT nhà về việc đã làm,
   không vào kho chung, và chỉ người phụ trách nhà đó mới xem được.
   ═══════════════════════════════════════════════════════════════ */
(function(){
var KEY = 'gita365_minhchung';
var U = G.U, h = U.h, ic = U.ic;

G.MINHCHUNG = (function(){
  try{ var d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
  catch(e){ return []; }
})();
function luu(){
  try{ localStorage.setItem(KEY, JSON.stringify(G.MINHCHUNG)); }catch(e){}
  if(G.danhDau) G.danhDau('minhchung','so');
}

var TT = {
  'da-nop':   {t:'Đã nộp — chờ xác nhận', c:'#96500A'},
  'xac-nhan': {t:'Đã xác nhận',            c:'#0B7350'},
  'nop-lai':  {t:'Cần nộp lại',            c:'#BE0E16'}
};

function maMC(){
  return 'MC-' + new Date().toISOString().slice(2,10).replace(/-/g,'') + '-' +
    String(G.MINHCHUNG.length + 1).padStart(3,'0');
}

/* Danh sách nhiệm vụ có thể gắn minh chứng — lấy từ chính dữ liệu đang có */
function dsNhiemVu(){
  var ra = [];
  var K = G.KPI100;
  if(K && K.diem) K.diem.forEach(function(d){
    ra.push({id:'kpi-'+d.no, t:'Điểm về đích ' + d.no + ' · ' + (d.t || '')});
  });
  (G.TIERS||[]).forEach(function(t){
    ra.push({id:'tang-'+t.id, t:'Nhiệm vụ tầng ' + t.code + ' · ' + t.name});
  });
  ra.push({id:'nhat-ky', t:'Nhật ký 365 ngày — việc làm hằng ngày'});
  ra.push({id:'khac', t:'Việc khác — ghi rõ trong phần mô tả'});
  return ra;
}

G.minhChungThayDuoc = function(){
  var u = (G.S.acc && G.S.acc.u) || '';
  if(G.can('mc_duyet')) return G.MINHCHUNG.slice();
  return G.MINHCHUNG.filter(function(m){ return m.nguoiGui === u; });
};

G.VIEWS['minh-chung'] = function(){
  var ds = G.minhChungThayDuoc();
  var guiDuoc = G.can('mc_gui');
  var duyetDuoc = G.can('mc_duyet');
  var NV = dsNhiemVu();

  var o = U.ph({eyebrow:'MINH CHỨNG NHIỆM VỤ', ic:'check', grad:1,
    t: duyetDuoc ? 'Minh chứng các nhà gửi lên' : 'Nộp minh chứng đã làm',
    lead: duyetDuoc
      ? 'Ảnh và báo cáo các gia đình nộp lên để xác nhận đã làm nhiệm vụ. Xác nhận hoặc đề nghị nộp lại.'
      : 'Chụp ảnh hoặc gửi báo cáo để xác nhận nhà mình đã làm nhiệm vụ. Coach xem và xác nhận, việc đó vào KPI của nhà.'});

  var dem = {};
  Object.keys(TT).forEach(function(k){ dem[k] = ds.filter(function(m){ return m.trangThai === k; }).length; });
  o += '<div class="pv-lo">'+
    '<div class="pv-th"><b>'+ds.length+'</b><span>ĐÃ NỘP</span></div>'+
    '<div class="pv-th"><b>'+dem['xac-nhan']+'</b><span>ĐÃ XÁC NHẬN</span></div>'+
    '<div class="pv-th"><b>'+dem['da-nop']+'</b><span>ĐANG CHỜ</span></div>'+
    '<div class="pv-th"><b>'+dem['nop-lai']+'</b><span>CẦN NỘP LẠI</span></div></div>';

  if(guiDuoc && !duyetDuoc){
    o += U.sec('NỘP MINH CHỨNG','Ảnh chụp, báo cáo hoặc tệp — cái nào tiện thì gửi cái đó');
    o += '<div class="card">'+
      '<div class="ct-luoi">'+
        '<div style="grid-column:1/-1"><label class="tiny up muted">MINH CHỨNG CHO NHIỆM VỤ NÀO</label>'+
          '<select id="mc_nv" class="inp blk">'+
            NV.map(function(n){ return '<option value="'+h(n.id)+'">'+h(n.t)+'</option>'; }).join('')+
          '</select></div>'+
        '<div style="grid-column:1/-1"><label class="tiny up muted">NHÀ MÌNH ĐÃ LÀM GÌ</label>'+
          '<textarea id="mc_mo" class="inp blk" rows="3" placeholder="Viết ngắn gọn: làm việc gì, ngày nào, ai tham gia, kết quả thấy được."></textarea></div>'+
        '<div style="grid-column:1/-1"><label class="tiny up muted">ẢNH HOẶC TỆP</label>'+
          '<input id="mc_tep" type="file" class="inp blk" accept="image/*,.pdf,.doc,.docx"></div>'+
      '</div>'+
      '<div id="mc_loi" class="tiny mt" style="color:var(--gita-do-ink);min-height:16px"></div>'+
      '<button class="btn pri mt" data-act="mc-gui">'+ic('plus','w-4 h-4')+'Nộp minh chứng</button>'+
      '<p class="tiny muted mt">Chỉ Coach phụ trách nhà mình và cấp quản lý xem được. '+
      'Không ai khác trong hệ thống nhìn thấy ảnh của gia đình anh chị.'+
      (G.API_CAP_PHEP ? '' : ' Bản mẫu chưa nối máy chủ nên tệp chưa được lưu lên Drive.')+'</p>'+
      '</div>';
  }

  if(!ds.length){
    o += duyetDuoc
      ? G.khungTrong({
          ten:'Minh chứng nhiệm vụ', ic:'check',
          seCo:'Ảnh, báo cáo và ghi chép các gia đình nộp lên để chứng minh đã làm xong nhiệm vụ. '+
               'Mỗi bản gắn với đúng một nhiệm vụ, có ngày nộp, lời nhà mình tự kể và tệp đính kèm.',
          khiNao:'Ngay khi một nhà nộp bản đầu tiên. Thường là trong tuần thứ hai của chặng.',
          aiLam:'Phụ huynh và học viên nộp. Coach, giáo viên và cấp quản lý xác nhận — '+
                'người nộp KHÔNG tự xác nhận minh chứng của chính mình.',
          viSao:'Không có minh chứng thì KPI của một nhà chỉ dựa vào lời kể. Lời kể thì ai cũng nói được, '+
                'và ba tháng sau không ai nhớ nhà nào đã thật sự làm gì. Đây là chỗ biến lời hứa thành bằng chứng.',
          viDu:{tieu:'Một bản minh chứng trông như thế này', dong:[
            ['Nhà','Nhà Minh An · Trần Minh An, lớp 9'],
            ['Nhiệm vụ','Tự bắt đầu một phiên học mỗi tối, không chờ ai gọi'],
            ['Nhà mình kể','Tuần này con tự vào bàn 5/7 tối. Hai tối còn lại đi học thêm về muộn.'],
            ['Đính kèm','Ảnh bảng theo dõi treo ở góc học tập'],
            ['Trạng thái','Đã nộp — chờ Coach xác nhận']
          ]},
          lam:[{t:'Xem danh sách nhiệm vụ đang giao', v:'nhiem-vu'},
               {t:'Mở buồng lái Coach', v:'coach-deck'}],
          ghi:'Nhắc gia đình nộp minh chứng là việc của buổi 1-1, không phải việc của tin nhắn tự động.'
        })
      : G.khungTrong({
          ten:'Minh chứng của nhà mình', ic:'check',
          seCo:'Những việc nhà mình đã làm xong, có ảnh hoặc ghi chép kèm theo. '+
               'Coach xem và xác nhận, rồi việc đó mới được tính vào chặng của nhà mình.',
          khiNao:'Ngay sau khi anh chị nộp bản đầu tiên ở ô bên trên.',
          aiLam:'Nhà mình nộp. Coach của nhà mình xác nhận — không ai khác trong hệ thống nhìn thấy ảnh này.',
          viSao:'Làm rồi mà không ghi lại thì ba tuần sau chính nhà mình cũng quên. '+
                'Và khi nhìn lại cuối chặng, không có gì để thấy mình đã đi được bao xa.',
          viDu:{tieu:'Một bản nhà mình nộp trông như thế này', dong:[
            ['Việc đã làm','Con tự vào bàn học 5 trên 7 tối trong tuần'],
            ['Kể lại','Hai tối còn lại con đi học thêm về muộn, mẹ không nhắc'],
            ['Ảnh kèm','Bảng theo dõi treo ở góc học tập'],
            ['Sau đó','Coach xem trong vòng một ngày làm việc và xác nhận']
          ]},
          lam:[{t:'Xem nhiệm vụ của nhà mình', v:'nhiem-vu'},
               {t:'Bản đồ nhà mình đang ở đâu', v:'ban-do'}],
          ghi:'Chụp bằng điện thoại là đủ. Không cần đẹp, cần thật.'
        });
    return o;
  }

  o += U.sec(duyetDuoc ? 'CÁC NHÀ ĐÃ NỘP' : 'MINH CHỨNG CỦA NHÀ MÌNH', ds.length + ' bản');
  o += ds.slice().reverse().map(function(m){
    var t = TT[m.trangThai] || TT['da-nop'];
    var nv = (NV.filter(function(x){ return x.id === m.nhiemVu; })[0] || {}).t || m.nhiemVu;
    return '<div class="tl-the">'+
      '<div class="tl-the-h"><div><b>'+h(nv)+'</b>'+
        '<div class="tiny muted mono">'+h(m.id)+' · '+h((m.luc||'').slice(0,10))+'</div></div>'+
        U.chip(t.t, t.c)+'</div>'+
      '<p class="sm" style="line-height:1.65;color:var(--ink-2);margin:9px 0">'+h(m.moTa)+'</p>'+
      '<div class="tiny muted">'+h(m.nguoiGui)+' · tệp <span class="mono">'+h(m.tenTep)+'</span>'+
        (m.daLuuTep ? '' : ' — <b style="color:var(--gita-do-ink)">tệp chưa lưu lên Drive</b>')+'</div>'+
      ((m.ghiChu||[]).length ? '<div class="tl-ghi">'+ m.ghiChu.map(function(g){
        return '<div class="tl-ghi-d"><b>'+h(g.viec)+'</b> — '+h(g.noi)+'<span class="tiny muted"> · '+h(g.ai)+'</span></div>';
      }).join('') +'</div>' : '')+
      (duyetDuoc && m.trangThai !== 'xac-nhan'
        ? '<input class="inp blk mt" id="mc_ly_'+h(m.id)+'" placeholder="Lời nhắn cho gia đình — bắt buộc khi đề nghị nộp lại">'+
          '<div class="row mt" style="gap:8px;flex-wrap:wrap">'+
          '<button class="btn pri sm" data-mcok="'+h(m.id)+'">'+ic('check','w-4 h-4')+'Xác nhận đã làm</button>'+
          '<button class="btn ghost sm" data-mclai="'+h(m.id)+'">Đề nghị nộp lại</button></div>'
        : '')+
      '</div>';
  }).join('');
  return o;
};

G.guiMinhChung = function(){
  var loi = document.getElementById('mc_loi');
  function bao(t){ if(loi) loi.textContent = t; }
  if(!G.can('mc_gui')){ bao('Vai hiện tại chưa được nộp minh chứng.'); return; }
  var nv = (document.getElementById('mc_nv')||{}).value || '';
  var mo = ((document.getElementById('mc_mo')||{}).value || '').trim();
  var oTep = document.getElementById('mc_tep');
  var tep = oTep && oTep.files && oTep.files[0];
  if(mo.length < 12){ bao('Viết vài dòng nhà mình đã làm gì — Coach cần hiểu để xác nhận.'); return; }
  if(!tep){ bao('Chưa chọn ảnh hoặc tệp.'); return; }
  if(tep.size > 15 * 1024 * 1024){ bao('Tệp lớn hơn 15 MB — chụp lại cỡ nhỏ hơn hoặc nén lại.'); return; }

  var ban = {
    id: maMC(), nhiemVu: nv, moTa: mo, tenTep: tep.name, coTep: tep.size,
    kieuTep: tep.type || '', nguoiGui: (G.S.acc && G.S.acc.u) || '',
    vaiId: G.S.role || '', nha: (G.myFamily && G.myFamily().id) || '',
    luc: new Date().toISOString(), trangThai: 'da-nop', ghiChu: [], daLuuTep: false
  };
  G.MINHCHUNG.push(ban); luu();
  if(G.secLog) G.secLog('Nộp minh chứng', ban.id + ' · ' + nv + ' · ' + ban.nguoiGui, 'Ghi nhận');
  if(G.API_CAP_PHEP && G.dayTepLen) G.dayTepLen(ban, tep);
  U.toast('Đã nộp ' + ban.id + ' — Coach sẽ xem và xác nhận.', 'ok');
  G.render();
};

function xuLy(id, ok){
  if(!G.can('mc_duyet')){ U.toast('Vai này không xác nhận được minh chứng.','err'); return; }
  var m = G.MINHCHUNG.filter(function(x){ return x.id === id; })[0];
  if(!m) return;
  var o = document.getElementById('mc_ly_' + id);
  var ly = (o && o.value || '').trim();
  if(!ok && ly.length < 6){
    U.toast('Ghi lời nhắn cho gia đình — họ cần biết nộp lại thế nào.','err');
    if(o) o.focus(); return;
  }
  m.trangThai = ok ? 'xac-nhan' : 'nop-lai';
  m.ghiChu = m.ghiChu || [];
  m.ghiChu.push({viec: ok ? 'Đã xác nhận' : 'Đề nghị nộp lại',
    noi: ly || 'Đủ minh chứng, đã tính vào KPI của nhà.',
    ai: (G.S.acc && G.S.acc.u) || '', luc: new Date().toISOString()});
  luu();
  if(G.secLog) G.secLog('Xác nhận minh chứng', m.id + ' → ' + m.trangThai + ' · ' + (G.S.acc && G.S.acc.u), 'Ghi nhận');
  U.toast(ok ? 'Đã xác nhận ' + m.id + '.' : 'Đã gửi đề nghị nộp lại.', 'ok');
  G.render();
}

document.addEventListener('click', function(e){
  var a = e.target.closest && e.target.closest('[data-mcok]');
  if(a) return xuLy(a.getAttribute('data-mcok'), true);
  var b = e.target.closest && e.target.closest('[data-mclai]');
  if(b) return xuLy(b.getAttribute('data-mclai'), false);
});
})();
