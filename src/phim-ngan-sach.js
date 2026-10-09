/* ═══════════════════════════════════════════════════════════════
   GITA 365 — KHỐI "NGÂN SÁCH PHIM AI THẬT" (đầu màn Xưởng phim, R01–R03)

   Chủ hệ mở 3–10 USD cho một tập phim 30 phút. Khối này cho người quản lý
   thấy TIỀN ĐI ĐÂU ở từng tập và từng cảnh, đọc thẳng cửa
   docXuongPhimNganSach (may-chu/phim-ngan-sach.js):
     · trần tập (không quá 10 USD) và trần tháng, đã dùng bao nhiêu;
     · kế hoạch chia một tập: bao nhiêu giây chuyển động thật, bao nhiêu giây
       khớp môi, bao nhiêu giây ảnh + máy quay — kèm nhãn ƯỚC TÍNH hay ĐO
       ĐƯỢC cho hệ số tốc độ;
     · từng biên nhận của máy GPU, có một câu người đọc được;
     · dự báo "đi sai hướng" trước khi hết tiền, và cầu dao khi máy chạy quá
       giờ — chỉ Super Admin mở lại, phải viết lý do.
   Máy chủ giữ mọi cái trần; khối này chỉ trình ra và gửi lời xin.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
(function(){
  var U = G.U, h = U.h;
  var st = { ai:'', d:null, dang:false, loi:'', mo:'', gui:false, anh:'', tenAnh:'' };
  var CL = { tietKiem:'Tiết kiệm', canBang:'Cân bằng', caoNhat:'Cao nhất' };
  var TT = { xong:['xong','var(--ok)'], vuotGio:['vượt giờ','var(--gita-do-ink)'], loi:['lỗi','var(--warn)'], huy:['huỷ','var(--ink-4)'], giu:['đang giữ','var(--ink-3)'] };
  function coMayChu(){ return !!(G.API_CAP_PHEP && G.PHIEN_TOKEN); }
  function vai(){ return String((G.S && G.S.acc && G.S.acc.role) || ''); }
  function laSA(){ return vai() === 'R01'; }
  function duocXem(){ return /^R0[1-3]$/.test(vai()); }
  function usd(x){ var n = Number(x) || 0; return (Math.round(n * 100) / 100).toFixed(2); }
  function veLai(){ if(G.S && G.S.view === 'xuong-phim' && G.render) G.render(); }
  function nap(lai){
    var ai = String((G.S && G.S.acc && G.S.acc.u) || '');
    if(st.ai !== ai) st = { ai:ai, d:null, dang:false, loi:'', mo:'', gui:false, anh:'', tenAnh:'' };
    if(lai){ st.d = null; st.loi = ''; }
    if(st.d || st.dang || st.loi) return;
    st.dang = true;
    G.goiMayChu('docXuongPhimNganSach', {}).then(function(r){
      st.dang = false;
      if(r && r.ok){ st.d = r; if(!st.mo && r.duAn && r.duAn[0]) st.mo = r.duAn[0].id; }
      else st.loi = (r && r.error) || 'Chưa đọc được sổ chi phim.';
      veLai();
    });
  }
  function giaTri(id){ var el = document.getElementById(id); return el ? String(el.value || '').trim() : ''; }

  function lapDuAn(){
    if(st.gui) return;
    var x = { ten:giaTri('pns-ten'), soTap:Number(giaTri('pns-tap')) || 10, phutTap:Number(giaTri('pns-phut')) || 30,
      tranTapUsd:Number(giaTri('pns-tran')) || 10, chatLuong:giaTri('pns-cl') || 'canBang' };
    if(x.ten.length < 4){ U.toast('Đặt tên dự án ít nhất 4 ký tự.', 'err'); return; }
    st.gui = true; veLai();
    G.goiMayChu('lapDuAnPhim', x).then(function(r){
      st.gui = false;
      if(r && r.ok){ st.mo = r.id; U.toast('Đã lập dự án · trần ' + usd(r.tranTapUsd) + ' USD/tập.', 'ok'); nap(true); }
      else { U.toast((r && r.error) || 'Không lập được dự án.', 'err'); veLai(); }
    });
  }
  function moLai(id){
    var ly = giaTri('pns-ly-' + id);
    if(ly.length < 10){ U.toast('Viết lý do mở lại (ít nhất 10 ký tự).', 'err'); return; }
    G.goiMayChu('moLaiDuAnPhim', { id:id, lyDo:ly }).then(function(r){
      if(r && r.ok){ U.toast('Đã mở lại dự án.', 'ok'); nap(true); }
      else U.toast((r && r.error) || 'Không mở lại được.', 'err');
    });
  }
  function giaoCanh(id){
    if(st.gui) return;
    var x = { duAnId:id, tap:Number(giaTri('pns-gt-' + id)) || 1, canh:giaTri('pns-gc-' + id), loaiCanh:'dong',
      giayRa:Number(giaTri('pns-gg-' + id)) || 5, loiNhac:giaTri('pns-gl-' + id), anh:st.anh, phamVi:'khach' };
    if(!x.canh){ U.toast('Đặt mã cảnh (ví dụ t1-c07).', 'err'); return; }
    if(x.loiNhac.length < 8){ U.toast('Tả động tác của cảnh (ít nhất 8 ký tự).', 'err'); return; }
    if(!x.anh){ U.toast('Chọn khung hình đầu của cảnh.', 'err'); return; }
    st.gui = true; veLai();
    G.goiMayChu('datCanhTraPhi', x).then(function(r){
      st.gui = false;
      if(r && r.ok){ st.anh = ''; st.tenAnh = ''; U.toast('Đã giữ ' + usd(r.giuUsd) + ' USD · hạn ' + r.tranGiayGpu + ' giây GPU · việc vào hàng chờ máy trả phí.', 'ok'); nap(true); }
      else { U.toast((r && r.error) || 'Không giao được cảnh.', 'err'); veLai(); }
    });
  }
  /* Ảnh khung đầu: thu nhỏ về cạnh dài 1280 rồi gửi JPEG — máy chủ nhận tối đa 6 MB. */
  function docAnh(input){
    var f = input.files && input.files[0]; if(!f) return;
    if(!/^image\/(png|jpeg|webp)$/.test(f.type)){ U.toast('Ảnh phải là PNG, JPEG hoặc WEBP.', 'err'); return; }
    var r = new FileReader();
    r.onload = function(){
      var im = new Image();
      im.onload = function(){
        var s = Math.min(1, 1280 / Math.max(im.width, im.height));
        var cv = document.createElement('canvas'); cv.width = Math.round(im.width * s); cv.height = Math.round(im.height * s);
        cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
        st.anh = cv.toDataURL('image/jpeg', 0.9); st.tenAnh = f.name; veLai();
      };
      im.src = r.result;
    };
    r.readAsDataURL(f);
  }

  document.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('[data-pns]'); if(!b) return;
    var m = b.getAttribute('data-pns'), id = b.getAttribute('data-id') || '';
    if(m === 'tai') nap(true);
    else if(m === 'lap') lapDuAn();
    else if(m === 'mo'){ st.mo = st.mo === id ? '' : id; veLai(); }
    else if(m === 'molai') moLai(id);
    else if(m === 'giao') giaoCanh(id);
  });
  document.addEventListener('change', function(e){
    var t = e.target; if(t && t.getAttribute && t.getAttribute('data-pns-anh') !== null) docAnh(t);
  });

  function veKeHoach(k){
    if(!k) return '';
    var g = k.giayTheoLoai || {}, u = k.usdTheoLoai || {}, hs = k.heSo || {};
    var o = '<div class="pns-kh"><div class="pns-thanh" role="img" aria-label="Một tập chia theo loại cảnh">' +
      '<span class="pns-dong" style="flex:' + (g.dong || 0) + '"></span><span class="pns-khau" style="flex:' + (g.khau || 0) + '"></span><span class="pns-tinh" style="flex:' + (g.tinh || 0) + '"></span></div>' +
      '<ul class="pns-chu">' +
      '<li><i class="pns-dong"></i>Chuyển động thật <b>' + h(String(g.dong || 0)) + ' giây</b> (' + h(String(k.tiLeDong || 0)) + '%) · ' + h(usd(u.dong)) + ' USD</li>' +
      '<li><i class="pns-khau"></i>Nhân vật nói, khớp môi <b>' + h(String(g.khau || 0)) + ' giây</b> · ' + h(usd(u.khau)) + ' USD</li>' +
      '<li><i class="pns-tinh"></i>Ảnh + chuyển động máy quay <b>' + h(String(g.tinh || 0)) + ' giây</b> · gần như 0 đồng</li>' +
      '<li>Khung hình mọi cảnh · ' + h(usd(u.anh)) + ' USD</li></ul>' +
      '<p class="tiny muted" style="margin:6px 0 0">Ước tính chi <b>' + h(usd(k.usdUocTinh)) + '</b> / được chi ' + h(usd(k.chiDuoc)) + ' USD mỗi tập · giữ ' + h(usd(k.duPhongUsd)) + ' USD để quay lại · mô hình ' + h(k.moHinh || '') + ' · ' +
      (hs.nguon === 'doDuoc' ? '<b>hệ số đo được</b> từ biên nhận thật' : '<b>hệ số ƯỚC TÍNH</b> — chưa đo trên máy của Học viện; đủ 5 biên nhận mỗi loại cảnh thì máy tự dùng số đo') + '.</p>';
    (k.ghiChu || []).forEach(function(c){ o += '<p class="tiny" style="color:var(--warn);margin:4px 0 0">' + h(c) + '</p>'; });
    return o + '</div>';
  }
  function veTap(da){
    if(!da.tap || !da.tap.length) return '<p class="tiny muted">Chưa có cảnh trả phí nào được giao cho dự án này.</p>';
    var o = '<div class="pns-bang"><table class="tbl"><thead><tr><th>Tập</th><th>Cảnh</th><th>Đã chi</th><th>Đang giữ</th><th>Lỗi</th><th>Giây phim xong</th><th>Dự báo cả tập</th></tr></thead><tbody>';
    da.tap.forEach(function(t){
      o += '<tr' + (t.saiHuong ? ' class="pns-sai"' : '') + '><td>' + h(String(t.tap)) + '</td><td>' + h(String(t.soCanh)) + '</td>' +
        '<td class="mono">' + h(usd(t.daChi)) + '</td><td class="mono">' + h(usd(t.dangGiu)) + '</td><td>' + h(String(t.soLoi || 0)) + '</td>' +
        '<td>' + h(String(t.giayXong)) + '</td><td class="mono">' + (t.duBaoUsd === undefined ? '<span class="muted">chưa đủ dữ liệu</span>' :
          h(usd(t.duBaoUsd)) + (t.saiHuong ? ' <b style="color:var(--gita-do-ink)">· vượt trần nếu giữ nhịp này</b>' : '')) + '</td></tr>';
    });
    return o + '</tbody></table></div>';
  }
  function veBienNhan(ds){
    if(!ds || !ds.length) return '';
    return '<h4 class="pns-h4">Biên nhận gần nhất</h4><ul class="pns-bn">' + ds.map(function(b){
      var tt = TT[b.trangThai] || [b.trangThai, 'var(--ink-3)'];
      return '<li><span class="pill" style="color:' + tt[1] + '">' + h(tt[0]) + '</span> <b>Tập ' + h(String(b.tap)) + ' · ' + h(b.canh || '') + '</b>' +
        ' <span class="tiny mono">' + (b.thatUsd == null ? '' : h(usd(b.thatUsd)) + ' USD · ') + (b.gpuGiay == null ? '' : h(String(Math.round(b.gpuGiay))) + 's GPU · ') + (b.giayRa == null ? '' : h(String(b.giayRa)) + 's phim') + '</span>' +
        (b.say ? '<div class="tiny muted">' + h(b.say) + '</div>' : '') + '</li>';
    }).join('') + '</ul>';
  }
  function veGiao(da){
    if(!laSA() || da.trangThai !== 'chay') return '';
    return '<details class="pns-giao"><summary>Giao một cảnh chuyển động thật (giữ tiền trước)</summary><div class="pns-luoi">' +
      '<label class="xtl-o">Tập<input class="inp" id="pns-gt-' + h(da.id) + '" type="number" min="1" max="' + h(String(da.soTap)) + '" value="1"></label>' +
      '<label class="xtl-o">Mã cảnh<input class="inp" id="pns-gc-' + h(da.id) + '" maxlength="60" placeholder="t1-c07"></label>' +
      '<label class="xtl-o">Số giây<input class="inp" id="pns-gg-' + h(da.id) + '" type="number" min="1" max="30" value="5"></label>' +
      '<label class="xtl-o xtl-rong">Động tác (một câu)<input class="inp" id="pns-gl-' + h(da.id) + '" maxlength="400" placeholder="người mẹ mở cửa sổ, nắng sớm tràn vào phòng"></label>' +
      '<label class="xtl-o xtl-rong">Khung hình đầu' + '<input class="inp" type="file" accept="image/png,image/jpeg,image/webp" data-pns-anh></label>' +
      (st.tenAnh ? '<p class="tiny muted xtl-rong" style="margin:0">Đã chọn: ' + h(st.tenAnh) + '</p>' : '') +
      '</div><button class="btn sm" data-pns="giao" data-id="' + h(da.id) + '"' + (st.gui ? ' disabled' : '') + '>Giữ tiền và giao cảnh</button>' +
      '<p class="tiny muted" style="margin:6px 0 0">Máy chủ giữ tiền trước; không đủ trần tập hoặc trần tháng thì từ chối. Việc chỉ máy GPU TRẢ PHÍ nhận (may-quay-kaggle/may-tra-phi.py), máy miễn phí bỏ qua. Không máy nào nhận trong 3 giờ thì tiền giữ được trả về ở lần mở sổ hoặc giao cảnh kế tiếp. Cảnh khớp môi đi đường miễn phí.</p></details>';
  }

  G.pnsKhoi = function(){
    if(!coMayChu() || !duocXem()) return '';
    nap(false);
    var o = '<section class="card pad mb pns"><div class="row" style="gap:8px;flex-wrap:wrap;align-items:center">' +
      '<b>Ngân sách phim AI thật · trần 10 USD mỗi tập</b><span class="grow"></span>' +
      '<button class="btn sm ghost" data-pns="tai">Đọc lại sổ</button></div>';
    if(st.loi) return o + '<p class="tiny" style="color:var(--gita-do-ink);margin:8px 0 0">' + h(st.loi) + '</p></section>';
    if(!st.d) return o + '<p class="tiny muted" style="margin:8px 0 0">Đang đọc sổ chi…</p></section>';
    var d = st.d, dg = d.donGia || {}, hs = d.heSoDoDuoc || {};
    var phanThang = d.tranThangUsd ? Math.min(100, Math.round((d.daDungThangUsd || 0) / d.tranThangUsd * 100)) : 0;
    o += '<div class="pns-so">' +
      '<div><span class="tiny muted">Tháng này đã dùng</span><b>' + h(usd(d.daDungThangUsd)) + ' / ' + h(usd(d.tranThangUsd)) + ' USD</b>' +
        '<span class="pns-vach" role="img" aria-label="' + h(String(phanThang)) + '% trần tháng"><span style="width:' + phanThang + '%"></span></span></div>' +
      '<div><span class="tiny muted">Giá GPU</span><b>' + h(usd(dg.gpuUsdGio)) + ' USD/giờ</b><span class="tiny muted">' + (dg.nguon === 'khai' ? 'chủ hệ đã khai' : 'ước tính — khai lại khi chọn nhà cho thuê') + '</span></div>' +
      '<div><span class="tiny muted">Tốc độ máy</span><b>' + (Object.keys(hs).length ? 'đo được' : 'ước tính') + '</b><span class="tiny muted">' +
        (Object.keys(hs).length ? Object.keys(hs).map(function(k){
          /* Đo riêng từng mức chất lượng — xem heSoDoDuoc ở máy chủ. */
          var ten = k === 'khau' ? 'khớp môi' : 'chuyển động ' + (CL[k.split('|')[1]] || k.split('|')[1]);
          return h(ten) + ': ' + h(String(Math.round(hs[k].heSo * 10) / 10)) + 's GPU/giây phim (' + h(String(hs[k].mau)) + ' mẫu)';
        }).join(' · ') : 'chưa đủ 5 biên nhận ở mức nào') + '</span></div>' +
      '</div>';
    o += '<p class="tiny muted" style="margin:0 0 10px">Tiền do máy chủ tính từ số giây GPU máy thợ báo về — máy thợ không gửi số tiền. Cảnh chỉ được giao khi tiền đã giữ, và máy GPU phải tự dừng khi chạm hạn giờ của cảnh. Thời gian máy thuê nằm không thì KHÔNG nằm trong trần: tắt máy thuê khi không quay.</p>';
    o += '<details class="pns-lap"' + ((d.duAn || []).length ? '' : ' open') + '><summary>Lập dự án phim mới</summary><div class="pns-luoi">' +
      '<label class="xtl-o xtl-rong">Tên dự án<input class="inp" id="pns-ten" maxlength="120" placeholder="Mười mùa đông — 10 tập"></label>' +
      '<label class="xtl-o">Số tập<input class="inp" id="pns-tap" type="number" min="1" max="30" value="10"></label>' +
      '<label class="xtl-o">Phút mỗi tập<input class="inp" id="pns-phut" type="number" min="1" max="60" value="30"></label>' +
      '<label class="xtl-o">Trần USD mỗi tập<input class="inp" id="pns-tran" type="number" min="1" max="10" step="0.5" value="10"></label>' +
      '<label class="xtl-o">Chất lượng<select class="inp" id="pns-cl">' +
        Object.keys(CL).map(function(k){ return '<option value="' + k + '"' + (k === 'canBang' ? ' selected' : '') + '>' + h(CL[k] + ' · ' + ((((d.chatLuong || {})[k]) || {}).moHinh || '')) + '</option>'; }).join('') + '</select></label>' +
      '</div><button class="btn sm" data-pns="lap"' + (st.gui ? ' disabled' : '') + '>Lập dự án và xem kế hoạch chia tiền</button>' +
      '<p class="tiny muted" style="margin:6px 0 0">Xin trên 10 USD thì máy chủ hạ về 10 — lời chủ hệ là trần cứng, không ai nâng được bằng một ô nhập.</p></details>';
    var ds = d.duAn || [];
    o += ds.map(function(da){
      var mo = st.mo === da.id;
      var dung = da.trangThai === 'dung';
      var r = '<div class="pns-da"><button class="pns-dau" data-pns="mo" data-id="' + h(da.id) + '" aria-expanded="' + (mo ? 'true' : 'false') + '">' +
        '<span class="pns-ten">' + h(da.ten) + '</span><span class="tiny mono">' + h(String(da.soTap)) + ' tập × ' + h(String(da.phutTap)) + ' phút · ' + h(CL[da.chatLuong] || da.chatLuong) + ' · trần ' + h(usd(da.tranTapUsd)) + ' USD/tập</span>' +
        '<span class="pill" style="color:' + (dung ? 'var(--gita-do-ink)' : 'var(--ok)') + '">' + (dung ? 'đã dừng' : 'đang chạy') + '</span></button>';
      if(mo){
        r += '<div class="pns-mo">';
        if(dung){
          r += '<p class="pns-dung"><b>Cầu dao đã nhảy:</b> ' + h(da.lyDoDung || '') + '</p>';
          if(laSA()) r += '<div class="row" style="gap:8px;flex-wrap:wrap"><input class="inp grow" id="pns-ly-' + h(da.id) + '" maxlength="300" placeholder="Lý do mở lại — đã kiểm máy, đã đổi mức chất lượng…">' +
            '<button class="btn sm" data-pns="molai" data-id="' + h(da.id) + '">Mở lại dự án</button></div>';
          else r += '<p class="tiny muted">Chỉ Super Admin mở lại được, và phải viết lý do.</p>';
        }
        r += '<h4 class="pns-h4">Kế hoạch chia tiền một tập</h4>' + veKeHoach(da.keHoach) +
          '<h4 class="pns-h4">Tiền từng tập</h4>' + veTap(da) + veBienNhan(da.bienNhan) + veGiao(da) + '</div>';
      }
      return r + '</div>';
    }).join('');
    return o + '</section>';
  };
})();
