/* ═══════════════════════════════════════════════════════════════
   GITA 365 — NGĂN "XƯỞNG TÀI LIỆU" (Vòng tự hoàn thiện, R01–R04)

   Màn của máy chủ may-chu/xuong-tai-lieu.js. Người dùng chỉ làm MỘT việc:
   gõ chủ đề, chọn người đọc, tầng, số chương rồi bấm "Đặt đề án". Bật "Tự
   chạy" thì bộ não vận hành đi tiếp một bước mỗi lượt — không phải ngồi
   bấm. Xong thì đề án thành bản nháp ở ngăn "Bản nháp chờ duyệt", cần đủ
   ba chữ ký mới tới gia đình.

   Mọi chữ đến từ máy chủ hay người gõ đều qua h() trước khi ghép HTML.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
(function(){
  var U = G.U, h = U.h;
  var DOI_TUONG = [['phuHuynh','Cha mẹ'],['con6_10','Con 6–10 tuổi (đọc cùng cha mẹ)'],['con11_14','Con 11–14 tuổi'],
    ['con15_18','Con 15–18 tuổi'],['caNha','Cả nhà cùng đọc']];
  var TRANG_THAI = { kienTruc:'Đang lập dàn ý', viet:'Đang viết', dongGoi:'Sắp đóng gói', choDuyet:'Chờ ba chữ ký', dung:'Đang dừng — cần người xem' };
  var st = { ai:'', ds:null, dang:false, loi:'', bao:'', xem:null, dangXem:'' };
  function coMayChu(){ return !!(G.API_CAP_PHEP && G.PHIEN_TOKEN); }
  function vai(){ return String((G.S && G.S.acc && G.S.acc.role) || ''); }
  function duocDung(){ var m = /^R0([1-4])$/.exec(vai()); return !!m; }
  function veLai(){ if(G.S && G.S.view === 'tu-hoan-thien' && G.render) G.render(); }

  function tai(){
    st.dang = true;
    G.goiMayChu('docDeAnTaiLieu', {}).then(function(r){
      st.dang = false;
      if(r && r.ok){ st.ds = r.ds || []; st.loi = ''; } else st.loi = (r && r.error) || 'Chưa đọc được danh sách đề án.';
      veLai();
    });
  }
  function nap(){
    var ai = String((G.S && G.S.acc && G.S.acc.u) || '');
    if(st.ai !== ai) st = { ai:ai, ds:null, dang:false, loi:'', bao:'', xem:null, dangXem:'' };
    if(coMayChu() && !st.ds && !st.dang && !st.loi) tai();
  }
  function giaTri(id){ var el = document.getElementById(id); return el ? el.value : ''; }

  document.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('[data-xtl]'); if(!b) return;
    var viec = b.getAttribute('data-xtl'), id = b.getAttribute('data-id') || '';
    if(viec === 'lap'){
      var c = document.getElementById('xtl-tu-chay');
      b.disabled = true; st.bao = 'Đang đặt đề án…'; veLai();
      G.goiMayChu('lapDeAnTaiLieu', { chuDe: giaTri('xtl-chu-de'), dieuNho: giaTri('xtl-dieu-nho'),
        doiTuong: giaTri('xtl-doi-tuong'), tang: giaTri('xtl-tang'), soChuong: Number(giaTri('xtl-so-chuong')),
        tuChay: !!(c && c.checked) }).then(function(r){
        st.bao = r && r.ok ? 'Đã đặt đề án ' + r.id + (r.tuChay ? ' — bộ não sẽ tự đi tiếp từng bước.' : ' — bấm "Chạy một bước" hoặc bật "Tự chạy".')
          : ((r && r.error) || 'Chưa đặt được đề án.');
        st.ds = null; tai();
      });
    } else if(viec === 'buoc'){
      b.disabled = true; st.bao = 'Đang chạy một bước của ' + id + '…'; veLai();
      G.goiMayChu('chayBuocTaiLieu', { id:id }).then(function(r){
        st.bao = r && r.ok ? (r.vi || ('Xong bước ' + (r.buoc === 'kienTruc' ? 'lập dàn ý' : r.buoc === 'viet' ? 'viết chương ' + r.chuong + (r.dat ? ' — qua biên tập' : ' — bị trả lại, sẽ viết lại') : r.buoc) + '.'))
          : ((r && r.error) || 'Bước chưa chạy được.');
        st.ds = null; if(st.dangXem === id) st.xem = null; tai();
      });
    } else if(viec === 'tuchay' || viec === 'chaylai'){
      G.goiMayChu('datTuChayTaiLieu', { id:id, bat: b.getAttribute('data-bat') === '1', chayLai: viec === 'chaylai' }).then(function(r){
        st.bao = r && r.ok ? (r.tuChay ? 'Đã bật tự chạy cho ' + id + '.' : 'Đã tắt tự chạy cho ' + id + '.') : ((r && r.error) || 'Chưa đổi được.');
        st.ds = null; tai();
      });
    } else if(viec === 'xem'){
      if(st.dangXem === id){ st.dangXem = ''; st.xem = null; veLai(); return; }
      st.dangXem = id; st.xem = null; veLai();
      G.goiMayChu('docDeAnTaiLieu', { id:id }).then(function(r){ st.xem = r && r.ok ? r.deAn : { loi: (r && r.error) || 'Không đọc được.' }; veLai(); });
    }
  });

  function chon(id, ds, mac){
    return '<select class="inp" id="' + id + '">' + ds.map(function(x){
      return '<option value="' + h(x[0]) + '"' + (x[0] === mac ? ' selected' : '') + '>' + h(x[1]) + '</option>';
    }).join('') + '</select>';
  }
  function form(){
    var so = []; for(var i = 3; i <= 8; i++) so.push([String(i), i + ' chương']);
    return '<div class="xtl-form">' +
      '<label class="xtl-o xtl-rong"><span>Chủ đề — tài liệu giúp nhà làm được việc gì</span>' +
        '<input class="inp" id="xtl-chu-de" maxlength="200" placeholder="Ví dụ: Cùng con lập thời gian biểu buổi tối không cãi nhau"></label>' +
      '<label class="xtl-o xtl-rong"><span>Đọc xong, người đọc làm được (tuỳ chọn)</span>' +
        '<input class="inp" id="xtl-dieu-nho" maxlength="200" placeholder="Ví dụ: cùng con viết ba việc tối nay và dán lên tủ lạnh"></label>' +
      '<label class="xtl-o"><span>Người đọc</span>' + chon('xtl-doi-tuong', DOI_TUONG, 'phuHuynh') + '</label>' +
      '<label class="xtl-o"><span>Tầng</span>' + chon('xtl-tang', [['T1','T1'],['T2','T2'],['T3','T3'],['T4','T4'],['T5','T5']], 'T1') + '</label>' +
      '<label class="xtl-o"><span>Độ dài</span>' + chon('xtl-so-chuong', so, '5') + '</label>' +
      '<label class="xtl-chk"><input type="checkbox" id="xtl-tu-chay" checked> Tự chạy — bộ não đi tiếp từng bước, không cần bấm</label>' +
      '<button class="btn pri" data-xtl="lap">Đặt đề án</button>' +
      '</div>';
  }
  function chiTiet(d){
    if(!d) return '<p class="tiny muted">Đang đọc…</p>';
    if(d.loi) return '<p class="tiny" style="color:var(--gita-do)">' + h(d.loi) + '</p>';
    var o = '';
    var dan = d.danY || {};
    if((dan.soNhatQuan || []).length)
      o += '<div class="tiny b">Sổ nhất quán</div><ul class="tiny xtl-ds">' + dan.soNhatQuan.map(function(s){ return '<li>' + h(s) + '</li>'; }).join('') + '</ul>';
    if((dan.chuong || []).length)
      o += '<div class="tiny b">Dàn ý</div><ol class="tiny xtl-ds">' + dan.chuong.map(function(c){
        return '<li><b>' + h(c.tieuDe) + '</b>' + (c.yChinh ? ' — ' + h(c.yChinh) : '') + (c.viec ? '<br><span class="muted">Việc làm được: ' + h(c.viec) + '</span>' : '') + '</li>';
      }).join('') + '</ol>';
    (d.chuong || []).forEach(function(c, i){
      if(!c || !c.noiDung) return;
      o += '<details class="xtl-ch"><summary>Chương ' + (i + 1) + '. ' + h(c.tieuDe || '') +
        ' <span class="tiny muted">· viết ' + h(String(c.lanViet || 1)) + ' lần</span></summary>' +
        (c.mem && c.mem.length ? '<p class="tiny" style="color:var(--warn)">Người duyệt cần kiểm: ' + h(c.mem.join(' ')) + '</p>' : '') +
        '<div class="xtl-van">' + h(c.noiDung) + '</div></details>';
    });
    return o || '<p class="tiny muted">Chưa có dàn ý.</p>';
  }

  G.xtlKhoi = function(){
    var o = '<section class="card pad mb xtl"><b>Xưởng tài liệu gia đình</b>' +
      '<p class="tiny muted" style="margin:4px 0 10px">Học từ ainovel-cli: kiến trúc sư lập dàn ý và sổ nhất quán → người viết viết từng chương → ' +
      'biên tập bằng máy đo (câu rỗng, giọng máy, lời phán, tên riêng) và trả lại để viết lại → đóng gói thành bản nháp. ' +
      'Tài liệu tới gia đình chỉ khi đủ <b>ba chữ ký</b>: Bộ phận sản phẩm → Giám đốc → Super Admin.</p>';
    if(!duocDung()) return o + '<p class="tiny">Xưởng tài liệu mở cho Super Admin, Admin, Giám đốc và Bộ phận sản phẩm.</p></section>';
    if(!coMayChu()) return o + '<p class="tiny">Ví dụ minh hoạ — tài khoản mẫu không nối máy chủ. Đăng nhập bằng tài khoản thật để đặt đề án.</p>' + form() + '</section>';
    nap();
    o += form();
    if(st.bao) o += '<p class="tiny xtl-bao" role="status">' + h(st.bao) + '</p>';
    if(st.loi) return o + '<p class="tiny" style="color:var(--gita-do)">' + h(st.loi) + '</p></section>';
    if(!st.ds) return o + '<p class="tiny muted">Đang đọc…</p></section>';
    if(!st.ds.length) return o + '<p class="tiny muted">Chưa có đề án nào.</p></section>';
    var r01 = vai() === 'R01';
    o += '<div class="xtl-dsda">' + st.ds.map(function(d){
      var chay = ['kienTruc','viet','dongGoi'].indexOf(d.trangThai) >= 0;
      var x = '<div class="xtl-da"><div class="row" style="gap:8px;flex-wrap:wrap;align-items:center">' +
        '<b class="grow">' + h(d.chuDe) + '</b>' +
        '<span class="pill">' + h(TRANG_THAI[d.trangThai] || d.trangThai) + '</span></div>' +
        '<div class="tiny muted">' + h(d.id) + ' · ' + h(d.tang) + ' · chương ' + h(String(Math.min(d.dangChuong, d.soChuong))) + '/' + h(String(d.soChuong)) +
        ' · lượt AI ' + h(String(d.soLuot)) + '/' + h(String(d.tranLuot)) + (d.tuChay ? ' · tự chạy' : '') +
        (d.banNhapId ? ' · bản nháp ' + h(d.banNhapId) : '') + '</div>' +
        (d.loiCuoi ? '<div class="tiny" style="color:var(--warn)">' + h(d.loiCuoi) + '</div>' : '') +
        '<div class="row" style="gap:6px;flex-wrap:wrap;margin-top:6px">' +
        (chay ? '<button class="btn sm" data-xtl="buoc" data-id="' + h(d.id) + '">Chạy một bước</button>' +
          '<button class="btn sm" data-xtl="tuchay" data-id="' + h(d.id) + '" data-bat="' + (d.tuChay ? '0' : '1') + '">' + (d.tuChay ? 'Tắt tự chạy' : 'Bật tự chạy') + '</button>' : '') +
        (d.trangThai === 'dung' && r01 ? '<button class="btn sm" data-xtl="chaylai" data-id="' + h(d.id) + '" data-bat="1">Chạy lại</button>' : '') +
        (d.trangThai === 'choDuyet' ? '<button class="btn sm" onclick="G.thtMoNgan(\'nhap\')">Tới ngăn duyệt</button>' : '') +
        '<button class="btn sm" data-xtl="xem" data-id="' + h(d.id) + '">' + (st.dangXem === d.id ? 'Thu gọn' : 'Xem dàn ý · chương') + '</button>' +
        '</div>';
      if(st.dangXem === d.id) x += '<div class="xtl-xem">' + chiTiet(st.xem) + '</div>';
      return x + '</div>';
    }).join('') + '</div>';
    return o + '</section>';
  };
})();
