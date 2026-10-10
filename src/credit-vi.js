/* ═══════════════════════════════════════════════════════════════
   GITA 365 — VÍ CREDIT TRÊN APP (nối sổ cái may-chu/credit.js)

     · Màn "Ví credit của tôi" (vi-credit) cho gia đình: số dư ba loại,
       cách tích, mục tự chọn để dùng, lịch sử.
     · G.CRV.veQuanTri() — tab "Ví thật" của màn Hệ thống Credit: tổng
       quan, phiếu thu đã duyệt chưa nạp, tra ví một nhà, đặt cấp/nhóm,
       điều chỉnh (R01).
     · Móc vào Hệ điều hành Coach: Coach ghi hoạt động đã kiểm → máy chủ
       thưởng credit; Coach đánh dấu buổi đã dẫn → máy chủ trừ credit buổi.

   App KHÔNG tự tính hay giữ số dư: mọi con số đọc từ máy chủ. Chưa nối
   máy chủ thì nói thẳng. Không đụng giấy phép · mã hoá.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic;
  var CRV = G.CRV = {};
  var st = { vi:null, dangTai:false, loi:'', chon:'', qt:null, phieu:null, traNha:'', traVi:null, traSo:null, dx:null, dxChon:'' };
  function so(n){ return Math.round(Number(n)||0).toLocaleString('vi-VN'); }
  /* Ví thật cần PHIÊN máy chủ (đăng nhập thật) — tài khoản mẫu thì nói thẳng, không gọi. */
  function coMayChu(){ return typeof G.goiMayChu === 'function' && !!G.API_CAP_PHEP && !!G.PHIEN_TOKEN; }
  function veLai(){ if(G.render) G.render(); }
  var TEN_LOAI = { tang:'Credit tặng', thuong:'Credit thưởng', traPhi:'Credit trả phí' };
  var MAU_LOAI = { tang:'#5140B4', thuong:'#0B7350', traPhi:'#185AB4' };
  function tenTieu(ma){ var x = ((G.CR_THAMSO||{}).tieu||[]).filter(function(a){ return a.ma===ma; })[0]; return x ? x.ten : ma; }
  function tenThuong(ma){ var x = ((G.CR_THAMSO||{}).thuong||[]).filter(function(a){ return a.ma===ma; })[0]; return x ? x.ten : ma; }
  function tenViec(v){
    v = String(v||'');
    if(v==='tang-goi') return 'Tặng theo gói'; if(v==='tang-T1') return 'Tặng tầng 1'; if(v==='dang-ky') return 'Tặng khi đăng ký'; if(v==='nap') return 'Nạp từ gói';
    if(v==='dieu-chinh') return 'Điều chỉnh'; if(v==='hoan-tieu') return 'Hoàn lượt tiêu';
    if(v.indexOf('thuong:')===0) return 'Thưởng · '+tenThuong(v.slice(7));
    if(v.indexOf('tieu:')===0) return 'Dùng · '+tenTieu(v.slice(5));
    return v;
  }
  function dongSo(r){
    var am = Number(r.so) < 0;
    return '<div class="co-dong"><span class="co-grow sm"><b>'+h(tenViec(r.viec))+'</b> <span class="co-tag" style="color:'+MAU_LOAI[r.loai]+';background:color-mix(in srgb,'+MAU_LOAI[r.loai]+' 12%,transparent)">'+h(TEN_LOAI[r.loai]||r.loai)+'</span>'+
      (r.ghiChu ? '<br><span class="tiny muted">'+h(r.ghiChu)+'</span>' : '')+'</span>'+
      '<span class="tiny muted">'+h(new Date(r.luc).toLocaleString('vi-VN'))+'</span>'+
      '<b class="co-so" style="min-width:90px;text-align:right;color:'+(am?'#BE0E16':'#0B7350')+'">'+(am?'':'+')+so(r.so)+'</b></div>';
  }
  function oSoDu(du){
    return '<div class="grid g4 mb">'+
      U.stat({ k:'Tổng credit', v:so(du.tong), d:'≈ '+so(du.tong*10)+'đ' })+
      ['tang','thuong','traPhi'].map(function(l){ return U.stat({ k:TEN_LOAI[l], v:so(du[l]), d:l==='tang'?'dùng trước tiên':l==='thuong'?'dùng thứ hai':'dùng sau cùng', c:MAU_LOAI[l] }); }).join('')+'</div>';
  }

  /* ═══════════ MÀN VÍ CỦA TÔI ═══════════ */
  CRV.taiVi = function(maNha){
    if(!coMayChu()) return;
    st.dangTai = true; st.loi = '';
    G.goiMayChu('viCredit', maNha ? { maNha:maNha } : {}, { moi:true }).then(function(r){
      st.dangTai = false;
      if(r && r.ok){ st.vi = r; if(r.quaMoi) U.toast('Đã nhận credit tặng của tầng '+r.tang+'.','ok'); if(r.thuongMoi) U.toast('Vừa cộng '+r.thuongMoi+' lượt thưởng từ việc hôm nay.','ok'); }
      else st.loi = (r && r.error) || 'Không đọc được ví.';
      veLai();
    });
  };
  G.VIEWS['vi-credit'] = function(){
    var o = U.ph({ eyebrow:'NHÀ MÌNH · VÍ CREDIT', ic:'vault', grad:1, t:'Ví credit của nhà mình',
      lead:'Gói của nhà mình đổi thành credit (10 đồng = 1 credit). Làm đủ việc của hành trình thì được thưởng thêm credit; dùng dịch vụ thì trừ credit — luôn trừ credit tặng trước, rồi tới credit thưởng, sau cùng mới tới credit trả phí.' });
    if(!coMayChu()) return o + '<div class="co-mau">'+ic('alert','w-4 h-4')+'<span>Ví credit nằm ở máy chủ của Học viện. Đăng nhập bằng tài khoản thật của nhà mình để xem số dư; tài khoản mẫu chỉ xem được cách tích và cách dùng.</span></div>' + bangCachTich(null);
    if(!st.vi && !st.dangTai && !st.loi) CRV.taiVi();
    if(st.dangTai && !st.vi) return o + '<div class="card center" style="padding:30px"><p class="sm muted">Đang đọc ví…</p></div>';
    if(st.loi && !st.vi) return o + '<div class="co-cb"><div style="--m:#BE0E16">'+ic('alert','w-4 h-4')+'<span>'+h(st.loi)+'</span></div></div>';
    var V = st.vi;
    o += '<div class="co-hang mb"><span class="sm co-grow">Mã nhà <b>'+h(V.maNha)+'</b> · tầng <b>T'+V.tang+'</b> · cấp '+V.cap+' · nhóm '+h(V.nhom)+'</span>'+
      '<button class="btn ghost sm" data-crv="lam-moi">'+ic('orbit','w-3 h-3')+'Cập nhật</button></div>';
    o += oSoDu(V.soDu);
    o += U.sec('Dùng credit cho nhà mình', 'Mục nhà tự chọn được — dịch vụ coach do Coach ghi sau khi đã thực hiện');
    o += '<div class="co-ds mb">'+ Object.keys(V.giaTieu).filter(function(m){ return V.giaTieu[m].tuChon; }).map(function(m){
      var g = V.giaTieu[m].cr, du = V.soDu.tong >= g, xac = st.chon === m;
      return '<div class="co-dong"><span class="co-grow sm"><b>'+h(tenTieu(m))+'</b><br><span class="tiny muted">'+so(g)+' credit · ≈ '+so(g*10)+'đ</span></span>'+
        (xac ? '<button class="btn pri sm" data-crv="dung" data-m="'+h(m)+'">Xác nhận trừ '+so(g)+'</button><button class="btn ghost sm" data-crv="huy">Thôi</button>'
             : '<button class="btn sm" data-crv="chon" data-m="'+h(m)+'"'+(du?'':' disabled title="Chưa đủ credit"')+'>Dùng</button>')+'</div>'; }).join('')+'</div>';
    o += veDeXuat();
    o += bangCachTich(V);
    o += U.sec('Lịch sử gần đây', (V.gan||[]).length ? 'Mỗi dòng là một giao dịch đã ghi ở máy chủ — không sửa, không xoá' : 'Chưa có giao dịch nào');
    o += '<div class="co-ds">'+(V.gan||[]).map(dongSo).join('')+'</div>';
    return o;
  };
  /* ═══════════ GIẢI PHÁP COACH ĐỀ XUẤT — NHÀ TỰ CHỌN ═══════════
     Kho cấp cao 6 hạng: Coach đề xuất 1–3 phương án, nhà xem giá + gói rồi
     TỰ CHỌN — credit chỉ bị trừ ở bước này, không bao giờ do Coach bấm. */
  function taiDeXuat(){
    st.dx = 'dang';
    G.goiMayChu('dsDeXuatNha', {}, { moi:true }).then(function(r){ st.dx = r && r.ok ? r : { loi:(r && r.error) || '' }; veLai(); });
  }
  function veDeXuat(){
    if(!st.dx){ taiDeXuat(); return ''; }
    if(st.dx === 'dang' || st.dx.loi || !st.dx.ds) return '';
    var cho = st.dx.ds.filter(function(d){ return d.trangThai === 'cho' && d.phuongAn.length; });
    if(!cho.length) return '';
    var o = U.sec('Giải pháp Coach đề xuất cho nhà mình', 'Hạng cao hơn là gói sâu hơn: nhiều buổi hơn, cá nhân hoá hơn, theo dõi dài hơn. Nhà chọn mức phù hợp — credit chỉ trừ khi nhà bấm chọn.');
    cho.forEach(function(d){
      o += '<div class="card pad-sm mb">' + (d.ghiChu ? '<p class="sm mb">' + h(d.ghiChu) + ' <span class="tiny muted">— Coach ' + h(d.boiAi || '') + '</span></p>' : '') +
        '<div class="co-ds">' + d.phuongAn.map(function(p){
          var k = d.id + '|' + p.ma, du = st.dx.soDu && st.dx.soDu.tong >= p.gia;
          return '<div class="co-dong"><span class="co-grow sm"><b>' + h(p.tenHang) + ' · ' + so(p.gia) + ' credit</b> <span class="tiny muted">≈ ' + so(p.gia * 10) + 'đ</span><br>' + h(p.ten) +
            '<br><span class="tiny muted">' + h(p.goi.phamVi) + ' · ' + h(p.goi.theoDoi) + '</span><br><span class="tiny"><b>Nhà cần làm:</b> ' + h(p.goi.dieuKien) + '</span></span>' +
            (st.dxChon === k ? '<button class="btn pri sm" data-crv="dx-chon" data-id="' + h(d.id) + '" data-m="' + h(p.ma) + '">Xác nhận trừ ' + so(p.gia) + '</button><button class="btn ghost sm" data-crv="dx-thoi">Thôi</button>'
              : '<button class="btn sm" data-crv="dx-xem" data-k="' + h(k) + '"' + (du ? '' : ' disabled title="Chưa đủ credit"') + '>Chọn</button>') + '</div>';
        }).join('') + '</div><div class="co-hang mt"><button class="btn ghost sm" data-crv="dx-huy" data-id="' + h(d.id) + '">Không chọn đề xuất này</button></div></div>';
    });
    return o;
  }
  function bangCachTich(V){
    var ds = V ? Object.keys(V.giaThuong).map(function(m){ return [tenThuong(m), V.giaThuong[m].cr, V.giaThuong[m].toiDa, V.giaThuong[m].tuDong]; })
               : (function(){ var t = Number((G.S && G.S.acc && G.S.acc.tang) || 1) || 1;
                   return G.CR ? G.CR.thuong(t).map(function(a){ return [a.ten, a.cr, a.dem, a.ma==='tick'||a.ma==='chuoi']; }) : []; })();
    var tMau = V ? '' : ' · số theo bảng đã duyệt, tầng T'+(Number((G.S && G.S.acc && G.S.acc.tang) || 1) || 1);
    return U.sec('Cách tích credit thưởng', 'Tick việc hôm nay và giữ chuỗi 7 ngày được máy tự cộng; các việc còn lại Coach ghi sau khi xem bằng chứng'+tMau) +
      '<div class="co-tb mb"><table style="min-width:420px"><thead><tr><th>Việc</th><th>Credit mỗi lần</th><th>Tối đa trong tầng</th><th>Ai ghi</th></tr></thead><tbody>'+
      ds.map(function(x){ return '<tr><td><b>'+h(x[0])+'</b></td><td class="so">'+(x[1]==null?'—':so(x[1]))+'</td><td class="so">'+(x[2]==null?'—':x[2]+' lần')+'</td><td class="tiny">'+(x[3]?'Máy tự cộng':'Coach ghi')+'</td></tr>'; }).join('')+
      '</tbody></table></div>';
  }

  /* ═══════════ TAB VÍ THẬT (màn Hệ thống Credit) ═══════════ */
  function taiQuanTri(){
    G.goiMayChu('tongQuanCredit', {}, { moi:true }).then(function(r){ st.qt = r; veLai(); });
    G.goiMayChu('dsPhieuThuChuaNap', {}, { moi:true }).then(function(r){ st.phieu = r; veLai(); });
  }
  CRV.veQuanTri = function(){
    if(!coMayChu()) return '<div class="co-mau">'+ic('alert','w-4 h-4')+'<span>Ví thật, nạp credit và sổ cái hiện ở đây khi đăng nhập bằng tài khoản thật trên máy chủ của Học viện (tài khoản mẫu không có phiên máy chủ).</span></div>';
    if(!st.qt) { taiQuanTri(); return '<p class="sm muted">Đang đọc sổ credit…</p>'; }
    var o = '<div class="co-hang mb"><button class="btn ghost sm" data-crv="qt-moi">'+ic('orbit','w-3 h-3')+'Cập nhật</button></div>';
    if(st.qt.ok){
      var L = {}; (st.qt.theoLoai||[]).forEach(function(x){ L[x.loai] = Number(x.s)||0; });
      o += '<div class="grid g4 mb">'+U.stat({ k:'Ví đã mở', v:so(st.qt.soVi), d:'nhà' })+
        ['tang','thuong','traPhi'].map(function(l){ return U.stat({ k:TEN_LOAI[l]+' đang lưu hành', v:so(L[l]||0), d:'≈ '+so((L[l]||0)*10)+'đ', c:MAU_LOAI[l] }); }).join('')+'</div>';
      o += '<p class="tiny muted">Credit trả phí đang lưu hành là tiền khách đã trả trước chưa dùng (doanh thu chưa thực hiện). Credit tặng và thưởng là cam kết Học viện chịu.</p>';
    } else o += '<div class="co-cb mb"><div style="--m:#BE0E16"><span>'+h(st.qt.error||'Không đọc được tổng quan.')+'</span></div></div>';
    o += U.sec('Phiếu thu đã duyệt chưa nạp credit', 'Nạp chỉ từ phiếu ĐÃ DUYỆT (người ghi khác người duyệt) · mỗi phiếu nạp một lần · 10đ = 1 credit · phiếu đúng giá gói tầng 2 thì cộng thêm credit tặng theo gói');
    if(st.phieu && st.phieu.ok){
      o += st.phieu.ds.length ? '<div class="co-tb mb"><table><thead><tr><th>Phiếu</th><th>Mã nhà</th><th>Số tiền</th><th>Credit</th><th>Duyệt lúc</th><th></th></tr></thead><tbody>'+
        st.phieu.ds.map(function(p){ return '<tr><td class="co-so">'+h(p.id)+'</td><td>'+h(p.maKhachHang)+'</td><td class="so">'+so(p.soTien)+'đ</td><td class="so"><b>'+so(p.credit)+'</b>'+(p.tangGoi ? '<div class="tiny" style="color:#5140B4">+'+so(p.tangGoi)+' tặng gói '+h(p.goi)+'</div>' : '')+'</td><td class="tiny">'+h(p.duyetLuc||'')+'</td>'+
          '<td><button class="btn sm" data-crv="nap" data-id="'+h(p.id)+'">Nạp</button></td></tr>'; }).join('')+'</tbody></table></div>' : '<p class="sm muted mb">Không còn phiếu nào chờ nạp.</p>';
    } else if(st.phieu) o += '<p class="tiny muted mb">'+h(st.phieu.error||'')+'</p>';
    o += U.sec('Tra ví một nhà', 'Xem số dư, sổ giao dịch; Coach của nhà và Trưởng nhóm trở lên đặt được cấp và nhóm');
    o += '<div class="card pad-sm mb"><div class="co-hang"><input class="inp" id="crv-ma" style="max-width:240px" placeholder="Mã khách hàng" value="'+h(st.traNha)+'">'+
      '<button class="btn sm" data-crv="tra">Tra ví</button></div>';
    if(st.traVi){
      if(!st.traVi.ok) o += '<p class="sm mt" style="color:#BE0E16">'+h(st.traVi.error||'')+'</p>';
      else {
        var V = st.traVi;
        o += '<div class="mt">'+oSoDu(V.soDu)+'</div><div class="co-form">'+
          '<label class="co-f"><span>Cấp (1–10)</span><select class="inp" id="crv-cap">'+[1,2,3,4,5,6,7,8,9,10].map(function(c){ return '<option'+(c===V.cap?' selected':'')+'>'+c+'</option>'; }).join('')+'</select></label>'+
          '<label class="co-f"><span>Nhóm khách hàng</span><select class="inp" id="crv-nhom">'+((G.CR_THAMSO||{}).nhom||[]).map(function(n){ return '<option value="'+n.ma+'"'+(n.ma===V.nhom?' selected':'')+'>'+n.ma+' · '+h(n.ten)+'</option>'; }).join('')+'</select></label></div>'+
          '<div class="co-hang mt"><button class="btn ghost sm" data-crv="dat-vi">Lưu cấp & nhóm</button><span class="tiny muted">Tầng T'+V.tang+' (đọc từ hồ sơ khách)</span></div>';
        if((G.S.roleObj||{}).id === 'R01') o += '<div class="co-form mt">'+
          '<label class="co-f"><span>Điều chỉnh loại</span><select class="inp" id="crv-dc-loai"><option value="tang">Credit tặng</option><option value="thuong">Credit thưởng</option><option value="traPhi">Credit trả phí</option></select></label>'+
          '<label class="co-f"><span>Số credit (âm để trừ)</span><input class="inp" id="crv-dc-so" inputmode="numeric"></label>'+
          '<label class="co-f"><span>Lý do (bắt buộc)</span><input class="inp" id="crv-dc-ly" maxlength="300"></label></div>'+
          '<div class="co-hang mt"><button class="btn ghost sm" data-crv="dieu-chinh">Ghi điều chỉnh</button></div>';
        o += '<div class="co-ds mt">'+((st.traSo && st.traSo.ds) || V.gan || []).map(dongSo).join('')+'</div>';
      }
    }
    o += '</div>';
    return o;
  };

  document.addEventListener('click', function(e){
    var el = e.target.closest && e.target.closest('[data-crv]'); if(!el) return;
    e.preventDefault();
    var a = el.getAttribute('data-crv');
    if(a==='lam-moi'){ st.vi = null; st.dx = null; CRV.taiVi(); return; }
    if(a==='dx-xem'){ st.dxChon = el.getAttribute('data-k'); veLai(); return; }
    if(a==='dx-thoi'){ st.dxChon = ''; veLai(); return; }
    if(a==='dx-chon'){
      st.dxChon = '';
      G.goiMayChu('chonDeXuat', { id:el.getAttribute('data-id'), ma:el.getAttribute('data-m') }).then(function(r){
        if(r && r.ok){ U.toast('Đã chọn gói · trừ '+so(r.so)+' credit. Coach sẽ bắt đầu theo gói này.','ok'); st.vi = null; st.dx = null; CRV.taiVi(); }
        else { U.toast((r && r.error) || 'Chưa chọn được.','err'); veLai(); }
      });
      return;
    }
    if(a==='dx-huy'){
      G.goiMayChu('huyDeXuat', { id:el.getAttribute('data-id') }).then(function(r){
        U.toast(r && r.ok ? 'Đã báo Coach: nhà không chọn đề xuất này.' : ((r && r.error) || 'Chưa ghi được.'), r && r.ok ? 'ok' : 'err'); st.dx = null; veLai(); });
      return;
    }
    if(a==='chon'){ st.chon = el.getAttribute('data-m'); veLai(); return; }
    if(a==='huy'){ st.chon = ''; veLai(); return; }
    if(a==='dung'){
      var m = el.getAttribute('data-m'); st.chon = '';
      G.goiMayChu('tieuCredit', { hoatDong:m, thamChieu:'tu-'+Date.now().toString(36) }).then(function(r){
        if(r && r.ok){ U.toast('Đã trừ '+so(r.so)+' credit cho "'+tenTieu(m)+'".','ok'); st.vi = null; CRV.taiVi(); }
        else { U.toast((r && r.error) || 'Không trừ được.','err'); veLai(); }
      });
      return;
    }
    if(a==='qt-moi'){ st.qt = null; st.phieu = null; veLai(); return; }
    if(a==='nap'){
      G.goiMayChu('napCreditPhieu', { idPhieu:el.getAttribute('data-id') }).then(function(r){
        U.toast(r && r.ok ? (r.trung ? 'Phiếu này đã nạp từ trước.' : 'Đã nạp '+so(r.so)+' credit'+(r.tangGoi ? ' + '+so(r.tangGoi)+' credit tặng theo gói' : '')+' cho nhà '+r.maNha+'.') : ((r && r.error) || 'Không nạp được.'), r && r.ok ? 'ok' : 'err');
        st.qt = null; st.phieu = null; veLai();
      });
      return;
    }
    if(a==='tra'){
      st.traNha = String((document.getElementById('crv-ma')||{}).value||'').trim(); st.traVi = null; st.traSo = null;
      if(!st.traNha) return U.toast('Nhập mã khách hàng.','err');
      G.goiMayChu('viCredit', { maNha:st.traNha }, { moi:true }).then(function(r){ st.traVi = r; veLai();
        if(r && r.ok) G.goiMayChu('soCreditNha', { maNha:st.traNha }, { moi:true }).then(function(s){ st.traSo = s; veLai(); }); });
      return;
    }
    if(a==='dat-vi'){
      G.goiMayChu('datViCredit', { maNha:st.traNha, cap:Number(document.getElementById('crv-cap').value), nhom:document.getElementById('crv-nhom').value }).then(function(r){
        U.toast(r && r.ok ? 'Đã lưu cấp '+r.cap+' · nhóm '+r.nhom+'.' : ((r && r.error) || 'Không lưu được.'), r && r.ok ? 'ok' : 'err'); });
      return;
    }
    if(a==='dieu-chinh'){
      G.goiMayChu('dieuChinhCredit', { maNha:st.traNha, loai:document.getElementById('crv-dc-loai').value, so:Number(document.getElementById('crv-dc-so').value), lyDo:document.getElementById('crv-dc-ly').value }).then(function(r){
        U.toast(r && r.ok ? 'Đã ghi điều chỉnh.' : ((r && r.error) || 'Không ghi được.'), r && r.ok ? 'ok' : 'err');
        if(r && r.ok){ st.traVi = null; document.querySelector('[data-crv="tra"]') && document.querySelector('[data-crv="tra"]').click(); }
      });
    }
  });

  /* ═══════════ MÓC VÀO HỆ ĐIỀU HÀNH COACH ═══════════
     Chỉ gửi khi đã nối máy chủ, với nhà thật (không phải minh hoạ), và
     do Coach ghi (máy chủ còn kiểm Coach có phụ trách nhà ấy không). */
  var MAP_THUONG = { nhat_ky:'nhatky', nv_xong:'nv', minh_chung:'mc', cong_dat:'cong', phan_hoi:'phanhoi' };
  function nhaThat(ma){ return ma && !/^MH-/.test(ma); }
  function baoKetQua(r, nhan){
    if(r && r.ok && r.so) U.toast(nhan+': '+(r.so > 0 ? '+' : '')+so(r.so)+' credit.','ok');
    else if(r && !r.ok && r.code !== 'NOPERM' && r.code !== 'TRAN' && r.code !== 'KHONGNHA') U.toast('Credit · '+(r.error||'chưa ghi được'),'err');
  }
  function gan(){
    var CO = G.CO; if(!CO) return;
    CO.sauGhi = function(e){
      var hd = MAP_THUONG[e.loai];
      if(!hd || !coMayChu() || e.mau || e.nguon === 'may-chu' || !nhaThat(e.nha)) return;
      if(hd === 'nv'){   /* chỉ thưởng nhiệm vụ ĐÚNG HẠN */
        var giao = CO.st().hd.filter(function(x){ return x.loai==='nv_giao' && x.ma===e.ma && x.nha===e.nha; })[0];
        var ngay = new Date(e.t); var s = ngay.getFullYear()+'-'+('0'+(ngay.getMonth()+1)).slice(-2)+'-'+('0'+ngay.getDate()).slice(-2);
        if(!giao || (giao.han && s > giao.han)) return;
      }
      G.goiMayChu('thuongCredit', { maNha:e.nha, hoatDong:hd, thamChieu:(hd==='nv' ? e.ma : e.id), ghiChu:e.ghi||'' })
        .then(function(r){ baoKetQua(r, 'Thưởng credit'); });
    };
    CO.sauBuoi = function(d, b){
      if(b.tt !== 'xong' || !coMayChu() || d.mau || !nhaThat(d.nha)) return;
      G.goiMayChu('tieuCredit', { maNha:d.nha, hoatDong:'buoi-11', thamChieu:d.id+':b'+b.so, ghiChu:'Buổi '+b.so })
        .then(function(r){ if(r && r.ok && !r.trung) baoKetQua({ ok:true, so:-r.so }, 'Trừ credit buổi '+b.so); else if(r && !r.ok) baoKetQua(r); });
    };
  }
  gan();
  G.laKhachCredit = function(){ var r = G.S && G.S.roleObj; return !!(r && (r.lv === 13 || r.lv === 14)); };   /* Phụ huynh · Học viên */
})();
