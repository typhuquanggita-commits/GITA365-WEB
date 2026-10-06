/* ═══════════════════════════════════════════════════════════════
   GITA 365 · XƯỞNG PHIM — DỰ ÁN PHIM (video 4–8 phút cao cấp, MIỄN PHÍ, nhiều lần/tháng)

   Cách tối ưu khi không thuê dịch vụ: AI chỉ làm phần KHÔNG quay được.
     · "quay"  — Trainer/MC nói, cảnh nhiều người chạm nhau → QUAY THẬT bằng điện thoại
                 (đúng mặt, đúng giọng, khớp môi tuyệt đối, không hình mờ, 0đ)
     · "stock" — cảnh nền không có nhân vật → video miễn phí Pexels/Pixabay
     · "ai"    — một nhân vật hành động mà không quay được → Kaggle GPU miễn phí
   App tự phân loại từng cảnh (sửa được), in danh sách quay, gợi ý từ khoá video nền,
   tạo thư mục dự án trên Google Drive, gửi dựng cảnh AI, rồi "Ráp phim": máy GitHub
   tải tệp từ Drive → giọng chuẩn phát sóng, màu, phụ đề, thẻ tên, nhạc → phim về Drive.
   Dùng chung bộ đọc kịch bản (G.axn) và kho Drive (G.khoDrive). Lưu: G.S.axDA.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
(function(){
  var U = G.U, h = U.h;
  var da = G.axda = G.axda || {};
  var NHOM = { quay:['🎥 Quay thật','#0B7350'], stock:['🎞 Video nền miễn phí','#2E5AAC'], ai:['✨ AI (Kaggle)','#7A3FB0'] };
  var THU_MUC = { quay:'Quay-that', stock:'Stock', ai:'AI' };
  var TU_KHOA = { 'bc-sanh':'modern office lobby', 'bc-bucgiang':'conference stage screen', 'bc-hoithao':'conference hall',
    'bc-lophoc':'modern classroom', 'bc-vanphong':'executive office city view', 'bc-sankhau':'event stage lights',
    'bc-coach':'cozy office sofa', 'bc-phongkhach':'family living room', 'bc-vuontre':'bamboo forest path',
    'bc-bep':'modern kitchen', 'bc-bien':'beach waves sunset' };
  /* từ khoá tiếng Việt trong mô tả → từ khoá tìm video nền (tiếng Anh) */
  var TU_DIEN = [[/thành phố|đô thị/,'city skyline'],[/bình minh/,'sunrise'],[/hoàng hôn/,'sunset'],[/biển/,'ocean waves'],
    [/núi/,'mountains'],[/đường phố|phố/,'street traffic'],[/cà phê|quán/,'coffee shop'],[/mưa/,'rain'],[/rừng/,'forest'],
    [/cánh đồng|lúa/,'rice field'],[/sông|hồ/,'river'],[/văn phòng/,'office'],[/bầu trời|mây/,'sky clouds'],[/đêm/,'night'],
    [/tiền|tài chính/,'money finance'],[/học|sách/,'books study'],[/gia đình/,'family home'],[/việt nam/,'vietnam']];
  function tuKhoa(c){
    var t=(c.mo_ta||'').toLowerCase(), k=TU_DIEN.filter(function(x){ return x[0].test(t); }).map(function(x){ return x[1]; });
    return k.length ? k.slice(0,3).join(' ') : (TU_KHOA[c.bc_id] || 'city skyline');
  }
  function bam(t){ var x=5381; for(var i=0;i<t.length;i++) x=((x<<5)+x+t.charCodeAt(i))|0; return (x>>>0).toString(36); }
  var CO = { dac_ta:'đặc tả', can:'cận', trung:'trung', trung_rong:'trung rộng', toan:'toàn' };
  var MAU = '[Bục giảng studio GITA]\n' +
    'Trainer: Chào anh chị, hôm nay chúng ta nói về kỷ luật tài chính của gia đình trẻ.\n' +
    'MC: Thưa thầy, vì sao nhiều gia đình thu nhập khá mà vẫn thiếu trước hụt sau?\n' +
    'Trainer: Vì tiền đi trước kế hoạch. Muốn đổi, hãy bắt đầu từ một thói quen nhỏ.\n\n' +
    '[Toàn cảnh thành phố lúc bình minh]\n\n' +
    '[Phòng khách] Người mẹ ngồi xuống bàn, mở sổ ghi chép chi tiêu.\n\n' +
    '[Văn phòng] Trainer và MC bắt tay, cùng cười.\n' +
    'Trainer: Kỷ luật hôm nay là tự do của ngày mai. Hẹn gặp anh chị ở tập sau.';

  function st(){
    if(!G.S.axDA) G.S.axDA = { ten:'Dự án phim GITA', kichBan:MAU, khung:'doc', chongRung:false, nhom:{}, duAn:'', link:'', tep:null, jobAI:'', ttAI:null, jobRap:'', ttRap:null };
    if(!G.S.axDA.cheDo) G.S.axDA.cheDo = 'ai100';     /* mặc định: 100% AI từ ảnh chủ hệ cung cấp */
    return G.S.axDA;
  }
  function cast(){ return (G.axn && G.axn.st ? G.axn.st().nv : (G.S.axN && G.S.axN.nv)) || []; }
  function luu(){ if(G.save) G.save(); }
  function ve(){ if(G.render) G.render(); }
  function kd(){ return G.khoDrive && G.khoDrive.coKho() ? G.khoDrive : null; }

  /* ── phân cảnh + phân loại ── */
  function tuDong(c, ds){
    if(c.loai==='noi') return 'quay';
    if(c.nv.length>1 || /^(bat_tay|om|dua_do|tro_chuyen)$/.test(c.hanh_dong||'')) return 'quay';
    if(!c.hanh_dong && !(G.axn.nguoiTrong(c.mo_ta||'', ds).length)) return 'stock';
    return 'ai';
  }
  function ai100(){ return st().cheDo === 'ai100'; }
  da.keHoach = function(){
    var s=st(), ds=cast(), kh=G.axn.doc(s.kichBan, ds, ai100() ? 14 : 34);   /* 100% AI: câu nói ≤ ~5 giây/cảnh */
    kh.canh.forEach(function(c,i){
      c.id = (i+1<10?'0':'')+(i+1);
      c.tuDong = ai100() ? 'ai' : tuDong(c, ds);
      c.khoa = c.id+'-'+bam(c.thoai||c.mo_ta||'');
      c.nhom = ai100() ? 'ai' : (s.nhom[c.khoa] || c.tuDong);
      c.khongRo = c.loai==='dien' && c.nhom!=='stock' && !G.axn.nguoiTrong(c.mo_ta||'', ds).length;
      if(c.nhom==='stock') c.nv = [];
      if(ai100() && c.loai==='dien' && !c.hanh_dong && !G.axn.nguoiTrong(c.mo_ta||'', ds).length){ c.nv = []; c.khongRo = false; }   /* cảnh không người (toàn cảnh…) */
    });
    return kh;
  };
  function tenNv(id){ return (cast().filter(function(n){ return n.id===id; })[0]||{}).ten || id; }
  function uocTinh(kh){
    var g={quay:0,stock:0,ai:0}; kh.canh.forEach(function(c){ g[c.nhom]+=c.giay; });
    /* T4 Kaggle: FastWan 3 bước ~4 phút/cảnh + khớp môi ~1,5 phút/cảnh nói + hậu kỳ ~1 phút (ước tính, chưa đo) */
    var gioGPU = kh.canh.filter(function(c){ return c.nhom==='ai'; }).reduce(function(t,c){ return t + 5 + (c.loai==='noi'?1.5:0); }, 0)/60;
    var phimThang = gioGPU>0 ? Math.floor(120/gioGPU) : 99;
    return { g:g, gioGPU:gioGPU, phimThang:Math.min(phimThang, 40) };
  }

  /* ── thao tác ── */
  da.dat = function(k,v){ st()[k]=v; luu(); ve(); };
  da.cheDo = function(v){ st().cheDo=v; luu(); ve(); };
  da.kichBan = function(v){ st().kichBan=v; luu(); var el=document.getElementById('da-bang'); if(el) el.innerHTML=veBang(da.keHoach()); };
  da.doiNhom = function(khoa, v){ st().nhom[khoa]=v; luu(); ve(); };
  da.mau = function(){ var s=st(); s.kichBan=MAU; s.nhom={}; luu(); ve(); };
  da.taoThuMuc = function(){
    var k=kd(), s=st(); if(!k) return U.toast('Chưa nối kho Drive — mở tab Kho phim.','err');
    k.goi('taoDuAn',{ten:s.ten}).then(function(d){ s.duAn=d.id; s.link=d.link; s.tep=null; luu(); ve(); U.toast('Đã tạo thư mục "'+d.ten+'" trên Drive','ok'); })
      .catch(function(e){ U.toast(e.message,'err'); });
  };
  da.kiemTep = function(){
    var k=kd(), s=st(); if(!k||!s.duAn) return;
    k.goi('dsDuAn',{duAn:s.duAn}).then(function(d){ s.tep=d.tep; luu(); ve(); }).catch(function(e){ U.toast(e.message,'err'); });
  };
  function goiKeHoach(kh, chiAI){
    var s=st(), dung={};
    /* mien_phi: động cơ chạy FastWan + MuseTalk trên Kaggle T4 */
    var canh = kh.canh.filter(function(c){ return !chiAI || c.nhom==='ai'; });
    canh.forEach(function(c){ c.nv.forEach(function(id){ dung[id]=1; }); });
    return { du_an:s.duAn, tieu_de:s.ten, khung:s.khung, ngon_ngu:(G.S.axN||{}).ngonNgu||'vi', chong_rung:!!s.chongRung, mien_phi:true,
      nhan_vat: cast().filter(function(n){ return dung[n.id]; }).map(function(n){
        return {id:n.id, ten:n.ten, vai:n.vai, gioi:n.gioi, tuoi:n.tuoi, giong_key:(n.gioi||'nam')+'-'+(n.tuoi||'lon'), anh:n.anhDrive||''}; }),
      canh: canh.map(function(c){ return {id:c.id, nhom:c.nhom, loai:c.loai, nv:c.nv, thoai:c.thoai||'', mo_ta:c.mo_ta||'',
        hanh_dong:c.hanh_dong||'', boi_canh_en:c.boi_canh_en, may:c.may, giay:c.giay}; }) };
  }
  da.dungAI = function(){
    var k=kd(), s=st(), kh=da.keHoach();
    if(!k||!s.duAn) return U.toast('Tạo thư mục dự án trên Drive trước.','err');
    var ai = kh.canh.filter(function(c){ return c.nhom==='ai'; });
    if(!ai.length) return U.toast('Không có cảnh AI nào.','err');
    var thieu = {}; ai.forEach(function(c){ c.nv.forEach(function(id){ var n=cast().filter(function(x){return x.id===id;})[0]; if(!n||!n.anhDrive) thieu[tenNv(id)]=1; }); });
    if(Object.keys(thieu).length) return U.toast('Cảnh AI cần ảnh mẫu của: '+Object.keys(thieu).join(', ')+' (gửi ở tab Làm phim nhanh).','err');
    k.goi('datAI',{ke_hoach:goiKeHoach(kh,true)}).then(function(d){ s.jobAI=d.jobid; s.ttAI={trangThai:'queued',buoc:'Đã gửi'}; luu(); ve(); da.theoDoi(); })
      .catch(function(e){ U.toast(e.message,'err'); });
  };
  /* 100% AI: một lần chạy Kaggle làm hết — ảnh → video → giọng → khớp môi → hậu kỳ → ráp → phim về Drive */
  da.lamAI100 = function(){
    var k=kd(), s=st(), kh=da.keHoach();
    if(!k||!s.duAn) return U.toast('Tạo thư mục dự án trên Drive trước.','err');
    if(!s.tep) return U.toast('Bấm "Kiểm tra tệp" để xưởng thấy ảnh anh/chị đã đưa vào.','err');
    var coAnh={}; s.tep.forEach(function(t){ if(t.nhom==='anh') coAnh[t.so]=1; });
    var thieu = kh.canh.filter(function(c){ return !coAnh[c.id] && !(c.nv[0] && (cast().filter(function(n){ return n.id===c.nv[0]; })[0]||{}).anhDrive); })
      .map(function(c){ return c.id; });
    if(thieu.length) return U.toast('Còn thiếu ảnh cho cảnh: '+thieu.join(', ')+' (đặt Anh/'+thieu[0]+'.jpg, hoặc gửi ảnh nhân vật ở tab Làm phim nhanh).','err');
    k.goi('datAI',{ke_hoach:goiKeHoach(kh,false), tron:true}).then(function(d){ s.jobAI=d.jobid; s.ttAI={trangThai:'queued',buoc:'Đã gửi việc'}; luu(); ve(); da.theoDoi(); })
      .catch(function(e){ U.toast(e.message,'err'); });
  };
  da.rap = function(){
    var k=kd(), s=st(), kh=da.keHoach();
    if(!k||!s.duAn) return U.toast('Tạo thư mục dự án trên Drive trước.','err');
    var co={}; (s.tep||[]).forEach(function(t){ co[t.so]=1; });
    var thieu = kh.canh.filter(function(c){ return !co[c.id]; }).map(function(c){ return c.id; });
    if(!s.tep) return U.toast('Bấm "Kiểm tra tệp" trước khi ráp.','err');
    if(thieu.length && !window.confirm('Còn thiếu tệp cảnh: '+thieu.join(', ')+'. Vẫn ráp (bỏ các cảnh thiếu)?')) return;
    k.goi('datRap',{ke_hoach:goiKeHoach(kh,false)}).then(function(d){ s.jobRap=d.jobid; s.ttRap={trangThai:'queued',buoc:'Đã gửi'}; luu(); ve(); da.theoDoi(); })
      .catch(function(e){ U.toast(e.message,'err'); });
  };
  da.theoDoi = function(){
    var k=kd(), s=st(); clearTimeout(da._t); if(!k) return;
    var viec=[['jobAI','ttAI'],['jobRap','ttRap']].filter(function(x){ return s[x[0]] && (!s[x[1]] || !/done|error/.test(s[x[1]].trangThai)); });
    if(!viec.length) return;
    Promise.all(viec.map(function(x){ return k.goi('trangThai',{jobid:s[x[0]]}).then(function(d){ s[x[1]]=d; }).catch(function(){}); }))
      .then(function(){ luu(); ve(); da._t=setTimeout(da.theoDoi, 30000); });
  };
  da.chepDS = function(){
    var t=(document.getElementById('da-ds-quay')||{}).innerText||'';
    if(navigator.clipboard) navigator.clipboard.writeText(t).then(function(){ U.toast('Đã chép danh sách quay.','ok'); });
  };

  /* ── giao diện ── */
  function chip(n){ return '<span class="bd-chip" style="border-color:'+NHOM[n][1]+';color:'+NHOM[n][1]+'">'+NHOM[n][0]+'</span>'; }
  function tenNoi(c){
    var b=(G.S.axBC||[]).filter(function(x){ return x.id===c.bc_id; })[0];
    return b ? b.ten : '';
  }
  function goiYAnh(c){
    if(!c.nv.length) return 'cảnh không người — '+(c.mo_ta||'toàn cảnh')+' (ảnh chụp hoặc ảnh tạo bằng Gemini)';
    var ai = c.nv.map(tenNv).join(' và '), noi = tenNoi(c);
    if(c.loai==='noi') return ai+(noi?' tại '+noi:'')+', '+((c.may&&c.may.co)==='can'?'cận mặt':'trung cảnh (ngang hông)')+', nhìn vào máy, miệng khép';
    return ai+(noi?' tại '+noi:'')+' — tư thế ĐẦU cảnh: '+(c.mo_ta||'');
  }
  function veBangAI(kh){
    var s=st(), u=uocTinh(kh), coAnh={}, coNv={};
    (s.tep||[]).forEach(function(t){ if(t.nhom==='anh') coAnh[t.so]=1; });
    cast().forEach(function(n){ if(n.anhDrive) coNv[n.id]=1; });
    var noi = kh.canh.filter(function(c){ return c.loai==='noi'; }).length;
    var o = '<div class="row" style="gap:8px;flex-wrap:wrap;align-items:center">'+
      '<span class="bd-chip">'+kh.canh.length+' cảnh · ~'+Math.round(kh.tongGiay/6)/10+' phút</span>'+
      '<span class="bd-chip">'+noi+' cảnh nói (khớp môi)</span><span class="bd-chip">'+(kh.canh.length-noi)+' cảnh diễn</span></div>'+
      '<p class="bd-tip" style="margin-top:6px">≈ '+(Math.round(u.gioGPU*10)/10)+' giờ GPU Kaggle cho phim này (ước tính, chưa đo thật) · Kaggle cho ~30 giờ/tuần → khoảng <b>'+u.phimThang+' phim/tháng</b>.</p>'+
      (kh.canhBao.length?'<p class="bd-tip" style="color:#B4720F">'+kh.canhBao.map(h).join('<br>')+'</p>':'');
    o += '<div class="gd-wrap" style="margin-top:8px"><table class="gd-tb"><thead><tr><th>#</th><th>Loại</th><th>Nội dung</th><th>Giây</th><th>Ảnh khung đầu (Anh/số.jpg)</th></tr></thead><tbody>'+
      kh.canh.map(function(c){
        var nd = (c.nv.length?h(c.nv.map(tenNv).join(' + '))+' · ':'')+(c.thoai?'“'+h(c.thoai)+'”':h(c.mo_ta||''))+
          '<br><span class="tiny muted">Ảnh nên có: '+h(goiYAnh(c))+'</span>'+
          (c.khongRo?'<br><span class="tiny" style="color:#B4720F">⚠ Mô tả không nhắc ai trong dàn nhân vật — đang dùng '+h(tenNv(c.nv[0]))+'. Ảnh Anh/'+c.id+'.jpg của anh/chị sẽ quyết định ai xuất hiện.</span>':'');
        var anh = coAnh[c.id] ? '<span style="color:#0B7350">✓ Anh/'+c.id+'.jpg</span>'
          : (c.nv[0] && coNv[c.nv[0]] ? '<span style="color:#B4720F">dùng ảnh nhân vật</span><br><span class="tiny muted">nên thêm Anh/'+c.id+'.jpg</span>'
          : '<span style="color:#B42318">thiếu Anh/'+c.id+'.jpg</span>');
        return '<tr><td>'+c.id+'</td><td>'+(c.loai==='noi'?'🗣 Nói':'🎬 Diễn')+'</td><td style="min-width:240px">'+nd+'</td><td>'+c.giay+'</td><td>'+(s.tep?anh:'<span class="tiny muted">Anh/'+c.id+'.jpg</span>')+'</td></tr>'; }).join('')+
      '</tbody></table></div>';
    return o;
  }
  function veBang(kh){
    if(ai100()) return veBangAI(kh);
    var s=st(), co={}, u=uocTinh(kh);
    (s.tep||[]).forEach(function(t){ co[t.so]=t.nhom; });
    var o = '<div class="row" style="gap:8px;flex-wrap:wrap;align-items:center">'+
      '<span class="bd-chip">'+kh.canh.length+' cảnh · ~'+Math.round(kh.tongGiay/6)/10+' phút</span>'+
      Object.keys(NHOM).map(function(n){ return chip(n).replace('</span>',' · '+Math.round(u.g[n])+'s</span>'); }).join('')+'</div>'+
      '<p class="bd-tip" style="margin-top:6px">AI chỉ chiếm '+(kh.tongGiay?Math.round(u.g.ai/kh.tongGiay*100):0)+'% thời lượng → ≈ '+(Math.round(u.gioGPU*10)/10)+' giờ GPU Kaggle mỗi phim. '+
        'Kaggle cho ~30 giờ/tuần → làm được khoảng <b>'+u.phimThang+' phim/tháng</b> (phần quay thật và ráp không tốn giờ GPU).</p>'+
      (kh.canhBao.length?'<p class="bd-tip" style="color:#B4720F">'+kh.canhBao.map(h).join('<br>')+'</p>':'');
    o += '<div class="gd-wrap" style="margin-top:8px"><table class="gd-tb"><thead><tr><th>#</th><th>Làm bằng</th><th>Nội dung</th><th>Giây</th><th>Tệp trên Drive</th></tr></thead><tbody>'+
      kh.canh.map(function(c){
        var noi = (c.nv.length?h(c.nv.map(tenNv).join(' + '))+' · ':'')+(c.thoai?'“'+h(c.thoai.slice(0,80))+(c.thoai.length>80?'…':'')+'”':h((c.mo_ta||'').slice(0,80)))+
          (c.khongRo?'<br><span class="tiny" style="color:#B4720F">⚠ Mô tả không nhắc ai trong dàn nhân vật — đang tạm dùng '+h(tenNv(c.nv[0]))+'. Thêm nhân vật ở tab Làm phim nhanh nếu cần.</span>':'');
        var tep = s.tep ? (co[c.id] ? (co[c.id]===c.nhom?'<span style="color:#0B7350">✓ '+c.id+'</span>':'<span style="color:#B4720F">✓ '+c.id+' (ở thư mục '+h(THU_MUC[co[c.id]]||co[c.id])+')</span>') : '<span style="color:#B42318">thiếu '+c.id+'.mp4</span>') : '<span class="tiny muted">'+c.id+'.mp4 → '+THU_MUC[c.nhom]+'</span>';
        return '<tr><td>'+c.id+'</td><td><select onchange="G.axda.doiNhom(\''+c.khoa+'\',this.value)" style="padding:4px;border:1px solid var(--line);border-radius:8px">'+
          Object.keys(NHOM).map(function(n){ return '<option value="'+n+'"'+(c.nhom===n?' selected':'')+'>'+NHOM[n][0]+(c.tuDong===n?' (gợi ý)':'')+'</option>'; }).join('')+'</select></td>'+
          '<td style="min-width:220px">'+noi+'</td><td>'+c.giay+'</td><td>'+tep+'</td></tr>'; }).join('')+'</tbody></table></div>';
    return o;
  }
  function veTT(tt, ten){
    if(!tt) return '';
    var pt = tt.trangThai==='done'?100:Math.max(2,+tt.phanTram||0), mau = tt.trangThai==='error'?'#B42318':(tt.trangThai==='done'?'#0B7350':'var(--gita)');
    return '<div style="margin-top:8px"><div class="tiny"><b>'+ten+':</b> '+h(tt.buoc||tt.loi||'')+'</div>'+
      '<div style="height:8px;border-radius:5px;background:var(--line);overflow:hidden;margin-top:4px"><div style="height:100%;width:'+pt+'%;background:'+mau+'"></div></div></div>';
  }
  da.ve = function(){
    var s=st(), kh=da.keHoach(), k=kd(), doc=s.khung!=='ngang';
    if((s.jobAI && s.ttAI && !/done|error/.test(s.ttAI.trangThai)) || (s.jobRap && s.ttRap && !/done|error/.test(s.ttRap.trangThai))) setTimeout(da.theoDoi, 0);
    var A = ai100();
    var o = U.sec('Dự án phim', A ? 'Video 4–8 phút 100% AI từ ảnh anh/chị cung cấp · miễn phí (Kaggle) · khớp môi tiếng Việt · tự ráp, lưu Google Drive'
                                  : 'Video 4–8 phút cao cấp, miễn phí: quay thật phần chính · video nền miễn phí · AI cho phần không quay được → ráp tự động, lưu Google Drive');
    o += '<div class="row mb" style="gap:8px;flex-wrap:wrap">'+
      '<button class="btn sm '+(A?'':'ghost')+'" onclick="G.axda.cheDo(\'ai100\')">✨ 100% AI từ ảnh</button>'+
      '<button class="btn sm '+(A?'ghost':'')+'" onclick="G.axda.cheDo(\'lai\')">🎥 Quay thật + AI</button></div>';
    if(!k) o += '<div class="card pad-sm mb"><p class="tiny" style="color:#B4720F">Cần nối kho Google Drive trước (tab 🗄 Kho phim → Cài đặt kho Drive).</p></div>';
    /* 1 · kịch bản */
    o += '<div class="card pad-sm mb"><b class="sm">① Kịch bản</b>'+
      '<div class="row mt" style="gap:8px;flex-wrap:wrap"><input type="text" value="'+h(s.ten)+'" onchange="G.axda.dat(\'ten\',this.value)" placeholder="Tên dự án" style="flex:1;min-width:200px;padding:8px;border:1px solid var(--line);border-radius:8px">'+
      '<select onchange="G.axda.dat(\'khung\',this.value)" style="padding:6px;border:1px solid var(--line);border-radius:8px"><option value="doc"'+(doc?' selected':'')+'>Dọc 9:16</option><option value="ngang"'+(doc?'':' selected')+'>Ngang 16:9</option></select>'+
      '<button class="btn ghost sm" onclick="G.axda.mau()">Kịch bản mẫu</button></div>'+
      '<p class="tiny muted" style="margin:6px 0">Viết như tab Làm phim nhanh: <b>[Nơi quay]</b> · <b>Tên: lời thoại</b> · câu hành động. Đoạn chỉ có <b>[cảnh]</b> không người → '+(A?'cảnh toàn cảnh (cần ảnh riêng)':'video nền')+'.</p>'+
      '<textarea rows="9" oninput="G.axda.kichBan(this.value)" style="width:100%;box-sizing:border-box;padding:10px;border:1px solid var(--line);border-radius:10px;font-size:14px;line-height:1.5">'+h(s.kichBan)+'</textarea></div>';
    /* 2 · phân loại */
    o += '<div class="card pad-sm mb"><b class="sm">② '+(A?'Phân cảnh & ảnh cần có':'Xưởng chia việc từng cảnh')+'</b> <span class="tiny muted">'+(A?'(câu nói dài được tách cảnh ≤ ~5 giây)':'(đổi được ở cột "Làm bằng")')+'</span><div id="da-bang" style="margin-top:8px">'+veBang(kh)+'</div></div>';
    /* 3 · thư mục Drive */
    o += '<div class="card pad-sm mb"><b class="sm">③ Thư mục dự án trên Google Drive</b><div class="row mt" style="gap:8px;flex-wrap:wrap">'+
      (s.duAn ? '<a class="btn sm" target="_blank" rel="noopener" href="'+h(s.link)+'">📁 Mở thư mục dự án</a><button class="btn ghost sm" onclick="G.axda.kiemTep()">↻ Kiểm tra tệp</button>'
              : '<button class="btn sm" onclick="G.axda.taoThuMuc()">📁 Tạo thư mục dự án</button>')+'</div>'+
      (A ? '<p class="bd-tip" style="margin-top:6px"><b>Anh/</b>: ảnh khung đầu từng cảnh, đặt tên đúng số cảnh <b>01.jpg, 02.jpg…</b> — đúng người, đúng nơi, đúng tư thế lúc bắt đầu cảnh (ảnh chụp, hoặc ảnh tạo bằng ứng dụng Gemini rồi tải về). '+
             '<b>Giong/</b> (tuỳ chọn): mỗi nhân vật 1 tệp đọc rõ 10–20 giây, đặt tên theo nhân vật, vd <b>'+h(((cast()[0]||{}).ten)||'Trainer')+'.wav</b> — thiếu thì dùng giọng có sẵn theo giới tính. <b>Nhac/</b>: 1 tệp nhạc nền mp3.</p></div>'
         : '<p class="bd-tip" style="margin-top:6px">Trong thư mục có <b>Quay-that · Stock · AI · Nhac</b>. Đặt tên tệp đúng số cảnh: <b>01.mp4, 02.mov…</b> (điện thoại quay xong đổi tên rồi kéo vào). Thư mục Nhac: thả 1 tệp nhạc nền mp3.</p></div>');
    if(A){
      var xongA = s.ttAI && s.ttAI.trangThai==='done' && s.ttAI.phimId;
      o += '<div class="card pad-sm mb"><b class="sm">④ Làm phim 100% AI</b> <span class="tiny muted">· Kaggle GPU miễn phí · FastWan 2.2 + khớp môi MuseTalk · 1080p · thường vài giờ</span>'+
        '<div class="row mt"><button class="btn" onclick="G.axda.lamAI100()">🎬 Làm phim</button></div>'+veTT(s.ttAI,'Tiến độ')+
        (xongA && G.khoDrive ? '<div style="position:relative;width:100%;max-width:'+(doc?'420px':'720px')+';aspect-ratio:'+(doc?'9/16':'16/9')+';margin:10px auto 0;max-height:75vh">'+
          '<iframe src="'+h(G.khoDrive.xem(s.ttAI.phimId))+'" allow="autoplay; fullscreen" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0;border-radius:12px;background:#000"></iframe></div>'+
          '<div class="row mt" style="gap:8px;flex-wrap:wrap"><a class="btn" target="_blank" rel="noopener" href="'+h(G.khoDrive.link(s.ttAI.phimId))+'">⬇ Mở / tải trên Drive</a>'+
          (s.ttAI.phimPhuDeId?'<a class="btn ghost" target="_blank" rel="noopener" href="'+h(G.khoDrive.link(s.ttAI.phimPhuDeId))+'">Bản có phụ đề</a>':'')+'</div>' : '')+
        '<p class="bd-tip" style="margin-top:6px">Xưởng tự: giọng nói từng câu → video từ ảnh của anh/chị → khớp môi tiếng Việt → giữ mặt, làm nét → phụ đề, thẻ tên, nhạc → phim 1080p vào Drive/Phim. '+
          'Cảnh nào không khớp môi được sẽ để mặt tự nhiên + lồng tiếng, không giả khẩu hình.</p></div>';
      return o;
    }
    /* 4 · danh sách quay */
    var quay = kh.canh.filter(function(c){ return c.nhom==='quay'; });
    o += '<details class="card pad-sm mb"'+(quay.length?' open':'')+'><summary class="sm" style="cursor:pointer"><b>④ Danh sách quay điện thoại</b> <span class="tiny muted">· '+quay.length+' cảnh · một buổi quay</span></summary>'+
      '<div id="da-ds-quay" class="tiny" style="line-height:1.7;margin-top:8px;color:var(--ink-2)">'+
      '<p><b>Chuẩn bị:</b> điện thoại '+(doc?'quay DỌC':'quay NGANG')+' 1080p 30fps · đặt chân máy ngang tầm mắt · mic cài áo · đứng gần cửa sổ hoặc đèn, không ngược sáng · cách máy 1,5–2m · im lặng 1 giây trước và sau mỗi câu · mỗi cảnh quay 2 lần, giữ bản tốt.</p>'+
      quay.map(function(c){ return '<p><b>Cảnh '+c.id+'</b> · '+h(c.nv.map(tenNv).join(' + ')||'—')+' · khung '+(CO[c.may&&c.may.co]||'trung')+' · nơi quay: '+h((c.bc_id||'').replace('bc-',''))+'<br>'+
        (c.thoai?'Nói: “'+h(c.thoai)+'”':'Diễn: '+h(c.mo_ta||''))+'<br><i>Lưu tên '+c.id+'.mp4 → thư mục Quay-that</i></p>'; }).join('')+'</div>'+
      '<button class="btn ghost sm" onclick="G.axda.chepDS()">Chép danh sách</button></details>';
    /* 5 · video nền */
    var stock = kh.canh.filter(function(c){ return c.nhom==='stock'; });
    if(stock.length) o += '<div class="card pad-sm mb"><b class="sm">⑤ Video nền miễn phí</b> <span class="tiny muted">(Pexels/Pixabay: dùng thương mại được, không cần ghi nguồn)</span>'+
      stock.map(function(c){ var kw = tuKhoa(c), q = encodeURIComponent(kw);
        return '<div class="row" style="gap:8px;flex-wrap:wrap;align-items:center;margin-top:6px"><span class="tiny"><b>Cảnh '+c.id+'</b> · '+h((c.mo_ta||'').slice(0,60))+' · ~'+c.giay+'s</span>'+
          '<a class="btn ghost sm" target="_blank" rel="noopener" href="https://www.pexels.com/search/videos/'+q+'/?orientation='+(doc?'portrait':'landscape')+'">Pexels: '+h(kw)+'</a>'+
          '<a class="btn ghost sm" target="_blank" rel="noopener" href="https://pixabay.com/videos/search/'+q+'/">Pixabay</a></div>'; }).join('')+
      '<p class="bd-tip" style="margin-top:6px">Tải bản 1080p, đổi tên đúng số cảnh rồi kéo vào thư mục Stock. Tránh đoạn có logo thương hiệu hay người nổi tiếng.</p></div>';
    /* 6 · AI */
    var ai = kh.canh.filter(function(c){ return c.nhom==='ai'; });
    if(ai.length) o += '<div class="card pad-sm mb"><b class="sm">⑥ Cảnh AI</b> <span class="tiny muted">· '+ai.length+' cảnh · Kaggle GPU miễn phí, thường vài giờ</span>'+
      '<div class="row mt"><button class="btn sm" onclick="G.axda.dungAI()">✨ Dựng cảnh AI</button></div>'+veTT(s.ttAI,'Cảnh AI')+
      '<p class="bd-tip" style="margin-top:6px">Dùng ảnh mẫu đã gửi ở tab Làm phim nhanh. Xong, cảnh tự vào thư mục AI của dự án.</p></div>';
    /* 7 · ráp */
    var xong = s.ttRap && s.ttRap.trangThai==='done' && s.ttRap.phimId;
    o += '<div class="card pad-sm mb"><b class="sm">⑦ Ráp phim</b> <span class="tiny muted">· máy GitHub miễn phí · 1080p · giọng chuẩn phát sóng · màu · phụ đề · thẻ tên · nhạc</span>'+
      '<div class="row mt" style="gap:8px;flex-wrap:wrap;align-items:center"><button class="btn" onclick="G.axda.rap()">🎬 Ráp phim</button>'+
      '<label class="tiny" style="display:flex;gap:6px;align-items:center"><input type="checkbox"'+(s.chongRung?' checked':'')+' onchange="G.axda.dat(\'chongRung\',this.checked)"> Chống rung (quay cầm tay)</label></div>'+
      veTT(s.ttRap,'Ráp')+
      (xong && G.khoDrive ? '<div style="position:relative;width:100%;max-width:'+(doc?'420px':'720px')+';aspect-ratio:'+(doc?'9/16':'16/9')+';margin:10px auto 0;max-height:75vh">'+
        '<iframe src="'+h(G.khoDrive.xem(s.ttRap.phimId))+'" allow="autoplay; fullscreen" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0;border-radius:12px;background:#000"></iframe></div>'+
        '<div class="row mt" style="gap:8px;flex-wrap:wrap"><a class="btn" target="_blank" rel="noopener" href="'+h(G.khoDrive.link(s.ttRap.phimId))+'">⬇ Mở / tải trên Drive</a>'+
        (s.ttRap.phimPhuDeId?'<a class="btn ghost" target="_blank" rel="noopener" href="'+h(G.khoDrive.link(s.ttRap.phimPhuDeId))+'">Bản có phụ đề</a>':'')+'</div>' : '')+'</div>';
    return o;
  };
})();
