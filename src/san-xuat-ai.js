/* ═══════════════════════════════════════════════════════════════
   GITA 365 — BỘ ĐIỀU KHIỂN SẢN XUẤT PHIM AI (xưởng phim AI · phần não)

   App GITA KHÔNG sinh video (việc đó ở notebook Kaggle · model mở). Màn
   này là BỘ ĐIỀU KHIỂN: giữ dàn nhân vật nhất quán, phân cảnh kịch bản,
   SINH PROMPT + FILE CẤU HÌNH chuẩn cho các công cụ free (InstantID/SDXL ·
   Wan I2V · viXTTS · LatentSync), và theo dõi sản xuất từng cảnh/tập.

   Tải "cấu hình .json" → đưa vào notebook Kaggle để sinh. KHÔNG slideshow,
   KHÔNG ảnh mấp môi — mô tả cảnh người thật chuyển động. View: san-xuat-ai.
   Dữ liệu lưu qua phiên (axNV · axPhim). Mở cho qt_trang.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic;
  var TT = [ {k:'',t:'Chưa',c:'--ink-4'}, {k:'anh',t:'Ảnh xong',c:'--gita'},
             {k:'clip',t:'Clip xong',c:'--warn'}, {k:'lip',t:'Lip-sync',c:'#5140B4'}, {k:'rap',t:'Đã ráp',c:'--ok'} ];
  function ttOf(k){ for(var i=0;i<TT.length;i++) if(TT[i].k===k) return TT[i]; return TT[0]; }
  function uid(p){ return p+Math.random().toString(36).slice(2,8); }

  /* Vai · giới · độ tuổi · giọng theo giới+tuổi */
  var VAI = [['trainer','Trainer'],['mc','MC'],['dienvien','Diễn viên'],['phu','Vai phụ']];
  var GIOI = [['nam','Nam'],['nu','Nữ']];
  var TUOI = [['lon','Người lớn'],['teen','Thiếu niên'],['treem','Trẻ em']];
  function nhan(o,arr){ var f=arr.filter(function(x){return x[0]===o;})[0]; return f?f[1]:''; }
  function giongKey(gioi,tuoi){ return (gioi||'nam')+'-'+(tuoi||'lon'); }
  function coLora(l){ return !!(l && String(l).trim() && String(l).indexOf('chưa')<0 && String(l).indexOf('(')!==0); }
  function trigger(id){ return 'gita'+String(id||'').replace(/[^a-z0-9]/gi,'').toLowerCase(); }
  function giongTen(gioi,tuoi){ var m={ 'nam-lon':'Nam trầm ấm','nu-lon':'Nữ truyền cảm',
    'nam-teen':'Nam trẻ trong','nu-teen':'Nữ trẻ tươi','nam-treem':'Bé trai hồn nhiên','nu-treem':'Bé gái hồn nhiên' };
    return m[giongKey(gioi,tuoi)] || 'Nam trầm ấm'; }
  /* Ép chất lượng + chặn hoạt hình/người que/mấp môi */
  var QPROM = 'ảnh chụp thật, máy ảnh DSLR, 4K, nét căng, điện ảnh, ánh sáng tự nhiên, da người thật, chân dung nhất quán';
  var QNEG  = 'hoạt hình, anime, cartoon, hoạt hoạ, 2D, tranh vẽ, phác thảo, người que, hình que, ảnh tĩnh, mấp máy môi, mặt méo, biến dạng, thừa ngón tay, mờ nhoè, răng cưa, chất lượng thấp, sai tỉ lệ cơ thể';

  function initData(){
    if(!G.S.axNV){ G.S.axNV = [
      { id:'nv-trainer', ten:'Chuyên gia GITA (Trainer)', loai:'nguoi', vai:'trainer', gioi:'nam', tuoi:'lon',
        mota:'Nam chuyên gia Á Đông ~35 tuổi, tóc ngắn đen gọn, đeo kính gọng đen, da sáng, gương mặt điềm đạm tin cậy',
        trangPhuc:'Vest xanh navy, sơ mi trắng', giong:'Nam trầm ấm', seed:'101', lora:'(chưa train)', ghiChu:'Dẫn dắt, tư vấn' },
      { id:'nv-mc', ten:'MC nữ', loai:'nguoi', vai:'mc', gioi:'nu', tuoi:'lon',
        mota:'Nữ MC Á Đông ~30 tuổi, tóc dài, trang điểm nhẹ, nụ cười thân thiện, chuyên nghiệp',
        trangPhuc:'Vest xanh nhạt hoặc kem', giong:'Nữ truyền cảm', seed:'202', lora:'(chưa train)', ghiChu:'Dẫn chương trình' },
      { id:'nv-bo', ten:'Bố', loai:'nguoi', vai:'dienvien', gioi:'nam', tuoi:'lon',
        mota:'Người bố Á Đông ~40 tuổi, tóc đen, gương mặt hiền, khoẻ khoắn',
        trangPhuc:'Sơ mi xanh nhạt, quần kaki', giong:'Nam trầm ấm', seed:'301', lora:'(chưa train)', ghiChu:'Nhân vật gia đình' },
      { id:'nv-me', ten:'Mẹ', loai:'nguoi', vai:'dienvien', gioi:'nu', tuoi:'lon',
        mota:'Người mẹ Á Đông ~38 tuổi, tóc nâu ngang vai, dịu dàng, ấm áp',
        trangPhuc:'Áo blouse kem', giong:'Nữ truyền cảm', seed:'302', lora:'(chưa train)', ghiChu:'Nhân vật gia đình' },
      { id:'nv-congai', ten:'Con gái (tuổi teen)', loai:'nguoi', vai:'dienvien', gioi:'nu', tuoi:'teen',
        mota:'Thiếu nữ Á Đông ~16 tuổi, tóc dài đen, tươi tắn, năng động',
        trangPhuc:'Áo thun tím, quần jeans', giong:'Nữ trẻ tươi', seed:'303', lora:'(chưa train)', ghiChu:'Nhân vật gia đình' },
      { id:'nv-contrai', ten:'Con trai (thiếu niên)', loai:'nguoi', vai:'dienvien', gioi:'nam', tuoi:'teen',
        mota:'Bé trai Á Đông ~11 tuổi, tóc đen, lanh lợi, vui vẻ',
        trangPhuc:'Áo polo xanh teal, quần short', giong:'Nam trẻ trong', seed:'304', lora:'(chưa train)', ghiChu:'Nhân vật gia đình' }
    ]; }
    if(!G.S.axPhim){ G.S.axPhim = [
      { id:'phim-1', ten:'Tập 1 — Hành trình GITA 365', mota:'Giới thiệu hành trình 5 tầng, dạng người dẫn + cảnh minh hoạ',
        canh:[
          { id:uid('c'), nvId:'nv-trainer', loai:'nguoi', boiCanh:'Phòng khách ấm cúng, cây xanh, ánh sáng tự nhiên', may:'Cận cảnh ngang mặt, tĩnh', chuyenDong:'Người ngồi nói, gật đầu nhẹ, tay đan', thoai:'Chào anh chị, hành trình thịnh vượng của gia đình bắt đầu từ một quyết định.', giay:5, tt:'' },
          { id:uid('c'), nvId:'nv-mc', loai:'nguoi', boiCanh:'Trường quay sáng, màn hình lớn phía sau', may:'Trung cảnh, máy lia nhẹ sang phải', chuyenDong:'Đứng thuyết trình, tay chỉ về màn hình', thoai:'GITA đồng hành cùng gia đình qua năm tầng phát triển.', giay:5, tt:'' },
          { id:uid('c'), nvId:'nv-bo', loai:'canh', boiCanh:'Vườn tre, cả gia đình cùng đi dạo trò chuyện', may:'Toàn cảnh, máy đi lùi theo bước chân', chuyenDong:'Cả nhà đi bộ, trò chuyện, cùng cười', thoai:'', giay:5, tt:'' }
        ] }
    ]; }
    if(!G.S.axActive) G.S.axActive = G.S.axPhim[0].id;
    if(!G.S.axTab) G.S.axTab = 'nv';
  }
  function nvById(id){ return (G.S.axNV||[]).filter(function(x){return x.id===id;})[0]; }
  function phimActive(){ return (G.S.axPhim||[]).filter(function(x){return x.id===G.S.axActive;})[0] || (G.S.axPhim||[])[0]; }
  function luu(){ if(G.save) G.save(); if(G.render) G.render(); }

  G.ax = G.ax || {};
  G.ax.tab = function(t){ G.S.axTab=t; if(G.render) G.render(); };

  /* ── NHÂN VẬT ── */
  function selOpts(arr,cur){ return arr.map(function(x){ return '<option value="'+x[0]+'"'+(x[0]===cur?' selected':'')+'>'+h(x[1])+'</option>'; }).join(''); }
  function formNV(nv){
    var e = nv||{id:'',ten:'',vai:'dienvien',gioi:'nam',tuoi:'lon',mota:'',trangPhuc:'',seed:'',lora:'',ghiChu:''};
    var ss='padding:8px;border:1px solid var(--line);border-radius:9px;width:100%;box-sizing:border-box';
    return '<h3 class="mb">'+(nv?'Sửa nhân vật':'Thêm nhân vật')+'</h3>'+
      '<div class="bd-field"><span>Tên vai</span><input type="text" id="f-ten" value="'+h(e.ten)+'"></div>'+
      '<div class="grid g3">'+
        '<div class="bd-field"><span>Vai trò</span><select id="f-vai" style="'+ss+'">'+selOpts(VAI,e.vai||'dienvien')+'</select></div>'+
        '<div class="bd-field"><span>Giới tính</span><select id="f-gioi" style="'+ss+'">'+selOpts(GIOI,e.gioi||'nam')+'</select></div>'+
        '<div class="bd-field"><span>Độ tuổi</span><select id="f-tuoi" style="'+ss+'">'+selOpts(TUOI,e.tuoi||'lon')+'</select></div>'+
      '</div>'+
      '<p class="bd-tip">Giọng tự chọn theo giới tính + độ tuổi (vd Nam người lớn → "Nam trầm ấm"). Dùng mẫu giọng <b>giong/&lt;giới-tuổi&gt;.wav</b> trên Kaggle.</p>'+
      '<div class="bd-field"><span>Mô tả ngoại hình (giữ nhân vật nhất quán)</span><textarea id="f-mota" rows="3" style="'+ss+'">'+h(e.mota)+'</textarea></div>'+
      '<div class="bd-field"><span>Trang phục mặc định</span><input type="text" id="f-tp" value="'+h(e.trangPhuc)+'"></div>'+
      '<div class="grid g2"><div class="bd-field"><span>Seed (giữ khuôn mặt)</span><input type="text" id="f-seed" value="'+h(e.seed)+'"></div>'+
      '<div class="bd-field"><span>Tên LoRA (nếu có)</span><input type="text" id="f-lora" value="'+h(e.lora)+'"></div></div>'+
      '<div class="bd-field"><span>Ghi chú</span><input type="text" id="f-gc" value="'+h(e.ghiChu)+'"></div>'+
      '<div class="row mt" style="gap:8px"><button class="btn" onclick="G.ax.nvLuu(\''+(e.id||'')+'\')">Lưu</button>'+
      '<button class="btn ghost" onclick="U.closeModal()">Huỷ</button></div>';
  }
  G.ax.nvThem = function(){ U.modal(formNV(null)); };
  G.ax.nvSuaMo = function(id){ U.modal(formNV(nvById(id))); };
  G.ax.nvLuu = function(id){
    function v(x){ var el=document.getElementById(x); return el?(el.value||'').trim():''; }
    var gioi=v('f-gioi')||'nam', tuoi=v('f-tuoi')||'lon';
    var o = { ten:v('f-ten')||'Nhân vật', vai:v('f-vai')||'dienvien', gioi:gioi, tuoi:tuoi, loai:'nguoi',
      mota:v('f-mota'), trangPhuc:v('f-tp'), giong:giongTen(gioi,tuoi), seed:v('f-seed'), lora:v('f-lora'), ghiChu:v('f-gc') };
    if(id){ var nv=nvById(id); if(nv) Object.assign(nv,o); }
    else { o.id=uid('nv'); G.S.axNV.push(o); }
    U.closeModal(); luu();
  };
  G.ax.nvXoa = function(id){ G.S.axNV = G.S.axNV.filter(function(x){return x.id!==id;}); luu(); };

  /* ── PHIM / TẬP ── */
  G.ax.phimChon = function(id){ G.S.axActive=id; if(G.render) G.render(); };
  G.ax.phimThem = function(){
    U.modal('<h3 class="mb">Thêm tập phim</h3>'+
      '<div class="bd-field"><span>Tên tập</span><input type="text" id="f-pten" placeholder="VD: Tập 2 — Tầng Nền"></div>'+
      '<div class="bd-field"><span>Mô tả</span><input type="text" id="f-pmota"></div>'+
      '<div class="row mt" style="gap:8px"><button class="btn" onclick="G.ax.phimLuu()">Tạo tập</button><button class="btn ghost" onclick="U.closeModal()">Huỷ</button></div>');
  };
  G.ax.phimLuu = function(){
    var t=(document.getElementById('f-pten')||{}).value||'Tập mới';
    var m=(document.getElementById('f-pmota')||{}).value||'';
    var p={id:uid('phim'),ten:t.trim(),mota:m.trim(),canh:[]}; G.S.axPhim.push(p); G.S.axActive=p.id;
    U.closeModal(); luu();
  };
  G.ax.phimXoa = function(id){ if(G.S.axPhim.length<=1) return U.toast('Giữ lại ít nhất một tập.','err');
    G.S.axPhim=G.S.axPhim.filter(function(x){return x.id!==id;}); if(G.S.axActive===id) G.S.axActive=G.S.axPhim[0].id; luu(); };

  /* ── CẢNH ── */
  function formCanh(c){
    var e=c||{id:'',nvId:(G.S.axNV[0]||{}).id,loai:'nguoi',boiCanh:'',may:'',chuyenDong:'',thoai:'',giay:5};
    var opts=(G.S.axNV||[]).map(function(n){return '<option value="'+n.id+'"'+(n.id===e.nvId?' selected':'')+'>'+h(n.ten)+'</option>';}).join('');
    return '<h3 class="mb">'+(c?'Sửa cảnh':'Thêm cảnh')+'</h3>'+
      '<div class="grid g2"><div class="bd-field"><span>Nhân vật</span><select id="f-nv" style="padding:8px;border:1px solid var(--line);border-radius:9px">'+opts+'</select></div>'+
      '<div class="bd-field"><span>Loại cảnh</span><div class="bd-seg"><button type="button" class="'+(e.loai==='nguoi'?'on':'')+'" onclick="this.parentNode.querySelectorAll(\'button\').forEach(function(b){b.classList.remove(\'on\')});this.classList.add(\'on\');window.__cloai=\'nguoi\'">Người dẫn nói</button><button type="button" class="'+(e.loai==='canh'?'on':'')+'" onclick="this.parentNode.querySelectorAll(\'button\').forEach(function(b){b.classList.remove(\'on\')});this.classList.add(\'on\');window.__cloai=\'canh\'">Cảnh diễn</button></div></div></div>'+
      '<div class="bd-field"><span>Bối cảnh</span><input type="text" id="f-bc" value="'+h(e.boiCanh)+'" placeholder="VD: trường quay sáng, màn hình lớn"></div>'+
      '<div class="bd-field"><span>Máy quay (góc · chuyển động)</span><input type="text" id="f-may" value="'+h(e.may)+'" placeholder="VD: trung cảnh, máy lia nhẹ sang phải"></div>'+
      '<div class="bd-field"><span>Chuyển động nhân vật</span><input type="text" id="f-cd" value="'+h(e.chuyenDong)+'" placeholder="VD: đứng nói, tay chỉ màn hình"></div>'+
      '<div class="bd-field"><span>Thoại (để trống nếu cảnh không lời)</span><textarea id="f-thoai" rows="2">'+h(e.thoai)+'</textarea></div>'+
      '<div class="bd-field"><span>Thời lượng (giây)</span><input type="number" id="f-giay" min="2" max="10" value="'+(e.giay||5)+'" style="width:90px"></div>'+
      '<div class="row mt" style="gap:8px"><button class="btn" onclick="G.ax.canhLuu(\''+(e.id||'')+'\')">Lưu</button><button class="btn ghost" onclick="U.closeModal()">Huỷ</button></div>';
  }
  G.ax.canhThem = function(){ window.__cloai='nguoi'; U.modal(formCanh(null)); };
  G.ax.canhSuaMo = function(id){ var p=phimActive(); var c=p.canh.filter(function(x){return x.id===id;})[0]; window.__cloai=c.loai; U.modal(formCanh(c)); };
  G.ax.canhLuu = function(id){
    function v(x){var el=document.getElementById(x);return el?el.value:'';}
    var o={ nvId:v('f-nv'), loai:window.__cloai||'nguoi', boiCanh:v('f-bc').trim(), may:v('f-may').trim(),
      chuyenDong:v('f-cd').trim(), thoai:v('f-thoai').trim(), giay:Math.max(2,Math.min(10,+v('f-giay')||5)) };
    var p=phimActive();
    if(id){ var c=p.canh.filter(function(x){return x.id===id;})[0]; if(c) Object.assign(c,o); }
    else { o.id=uid('c'); o.tt=''; p.canh.push(o); }
    U.closeModal(); luu();
  };
  G.ax.canhXoa = function(id){ var p=phimActive(); p.canh=p.canh.filter(function(x){return x.id!==id;}); luu(); };
  G.ax.canhDoi = function(id,d){ var p=phimActive(), i=p.canh.findIndex(function(x){return x.id===id;}); var j=i+d;
    if(i<0||j<0||j>=p.canh.length) return; var t=p.canh[i]; p.canh[i]=p.canh[j]; p.canh[j]=t; luu(); };
  G.ax.canhTT = function(id){ var p=phimActive(), c=p.canh.filter(function(x){return x.id===id;})[0]; if(!c) return;
    var i=TT.findIndex(function(t){return t.k===(c.tt||'');}); c.tt=TT[(i+1)%TT.length].k; luu(); };

  /* ── SINH PROMPT ── */
  function promptCanh(c){
    var nv=nvById(c.nvId)||{};
    var noi = c.loai==='nguoi' && (c.thoai||'').trim();
    var img = [nv.mota, nv.trangPhuc, c.boiCanh, c.may, 'khung dọc 9:16', QPROM].filter(Boolean).join(', ');
    if(coLora(nv.lora)) img = trigger(nv.id)+', '+img;   /* từ khoá LoRA khoá đúng mặt */
    var vid = [c.chuyenDong||'(giữ tư thế tự nhiên)',
      noi?'đang nói, khẩu hình khớp lời, cử động đầu và tay tự nhiên':'diễn theo cảnh, chuyển động cơ thể tự nhiên',
      c.may, 'quay chuyển động mượt, sắc nét, người thật, không hoạt hình', (c.giay||5)+' giây'].filter(Boolean).join(', ');
    return {img:img, vid:vid, neg:QNEG};
  }
  function configPhim(){
    var p=phimActive();
    return {
      phim:{ id:p.id, ten:p.ten, mota:p.mota },
      cam:['khong-hoat-hinh','khong-nguoi-que','khong-anh-tinh-map-moi','phai-nguoi-that-chuyen-dong-sac-net'],
      chuan:{ negative_chung:QNEG, phong_cach:'ảnh thật điện ảnh 9:16, nét căng, khớp khẩu hình với giọng' },
      pipeline:{ anh:'instantid_sdxl', i2v:'wan2.2_i2v', tts:'vixtts', lipsync:'latentsync', nang_net:'realesrgan_codeformer', muot:'rife', phu_de:'faster_whisper', rap:'ffmpeg', khung:'1080x1920', fps_xuat:30 },
      nhan_vat: (G.S.axNV||[]).map(function(n){ return {id:n.id,ten:n.ten,vai:n.vai,gioi:n.gioi,tuoi:n.tuoi,loai:n.loai,
        mo_ta:n.mota,trang_phuc:n.trangPhuc,giong:n.giong,giong_key:giongKey(n.gioi,n.tuoi),seed:n.seed,
        lora:n.lora, co_lora:coLora(n.lora), trigger:trigger(n.id)}; }),
      canh: p.canh.map(function(c,i){ var pr=promptCanh(c); var nv=nvById(c.nvId)||{};
        return { thu_tu:i+1, id:c.id, nhan_vat:c.nvId, loai:c.loai, boi_canh:c.boiCanh, may_quay:c.may,
          prompt_anh:pr.img, prompt_video:pr.vid, negative:pr.neg, thoai:c.thoai,
          giong:nv.giong, giong_key:giongKey(nv.gioi,nv.tuoi), seed:nv.seed,
          lora:nv.lora, co_lora:coLora(nv.lora), trigger:trigger(nv.id),
          giay:c.giay||5, lip_sync: c.loai==='nguoi' && !!(c.thoai&&c.thoai.trim()), trang_thai:c.tt||'' }; })
    };
  }
  G.ax.taiConfig = function(){
    try{ var cfg=configPhim(); var a=document.createElement('a');
      a.download='gita-phim-'+(phimActive().id)+'.json';
      a.href='data:application/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(cfg,null,2)); a.click();
      U.toast('Đã tải cấu hình .json cho notebook Kaggle.','ok');
    }catch(e){ U.toast('Lỗi xuất cấu hình: '+(e&&e.message),'err'); }
  };

  /* ════════ CHẠY TỰ ĐỘNG (Worker → GitHub → Kaggle → R2) ════════ */
  var tdTimer=null;
  function lsGet(k){ try{ return window.localStorage.getItem(k)||''; }catch(e){ return ''; } }
  function lsSet(k,v){ try{ window.localStorage.setItem(k,v); }catch(e){} }
  function tdCfg(){ return { worker:lsGet('axWorker').replace(/\/+$/,''), token:lsGet('axToken'), job:lsGet('axJob') }; }
  var TDT = { queued:{t:'Đang xếp hàng',c:'--ink-4'}, running:{t:'Đang dựng…',c:'--warn'}, done:{t:'Xong',c:'--ok'}, error:{t:'Lỗi',c:'--gita-do-ink'} };

  G.ax.tdLuuCaiDat = function(){
    var w=(document.getElementById('f-worker')||{}).value||'';
    var t=(document.getElementById('f-token')||{}).value||'';
    lsSet('axWorker', w.trim()); lsSet('axToken', t.trim());
    U.toast('Đã lưu cài đặt tự động trên máy.','ok'); if(G.render) G.render();
  };
  G.ax.tdGui = function(){
    var cf=tdCfg(); if(!cf.worker||!cf.token){ U.toast('Chưa có URL Worker / mật khẩu.','err'); return; }
    var cfg=configPhim();
    G.ax.tdSetUI('queued','Đang gửi lên Worker…','');
    fetch(cf.worker+'/api/phim',{ method:'POST', headers:{'content-type':'application/json','x-gita-token':cf.token}, body:JSON.stringify({config:cfg}) })
      .then(function(r){ return r.json(); })
      .then(function(d){ if(d.jobid){ lsSet('axJob',d.jobid); G.ax.tdTheoDoi(d.jobid); U.toast('Đã gửi. Mã job: '+d.jobid,'ok'); }
        else { G.ax.tdSetUI('error', d.loi||'Gửi thất bại', ''); } })
      .catch(function(e){ G.ax.tdSetUI('error','Không gọi được Worker: '+(e&&e.message),''); });
  };
  G.ax.tdTheoDoi = function(jobid){
    var cf=tdCfg(); if(!cf.worker||!jobid) return;
    if(tdTimer) clearInterval(tdTimer);
    function tick(){
      fetch(cf.worker+'/api/phim/'+jobid).then(function(r){return r.json();}).then(function(s){
        G.ax.tdSetUI(s.trangThai||'running', s.buoc||'', s.phim?jobid:'');
        if(s.trangThai==='done'||s.trangThai==='error'){ if(tdTimer){clearInterval(tdTimer);tdTimer=null;} }
      }).catch(function(){});
    }
    tick(); tdTimer=setInterval(tick, 8000);
  };
  G.ax.tdSetUI = function(tt,buoc,jobForVideo){
    var box=document.getElementById('ax-td-status'); if(!box) return;
    var m=TDT[tt]||TDT.running; var cf=tdCfg();
    var vid = (tt==='done'&&jobForVideo)?
      '<div class="mt"><video src="'+h(cf.worker+'/api/phim/'+jobForVideo+'/video')+'" controls style="width:100%;max-width:320px;border-radius:12px;background:#000"></video>'+
      '<div class="row mt" style="gap:8px"><a class="btn sm" href="'+h(cf.worker+'/api/phim/'+jobForVideo+'/video')+'" target="_blank" rel="noopener">Tải / mở phim</a></div></div>' : '';
    box.innerHTML = '<div class="row" style="gap:8px;align-items:center"><span class="gd-den" style="--m:var('+m.c+')"></span>'+
      '<b style="color:var('+m.c+')">'+h(m.t)+'</b></div>'+
      '<p class="sm muted" style="margin-top:4px">'+h(buoc||'')+'</p>'+vid;
  };

  /* ════════ GIAO DIỆN ════════ */
  function tabBtn(k,t){ return '<button class="btn sm '+(G.S.axTab===k?'':'ghost')+'" onclick="G.ax.tab(\''+k+'\')">'+h(t)+'</button>'; }

  function veTuDong(){
    var cf=tdCfg();
    var o=U.sec('Chạy tự động','Gửi một cái là Cloudflare → GitHub → Kaggle tự dựng ra phim, hiện lại ở đây');
    if(!cf.worker || !cf.token){
      o += '<div class="card pad-sm"><b class="sm">Cài đặt kết nối (một lần)</b>'+
        '<p class="bd-tip">Dán URL Worker và mật khẩu (SUBMIT_TOKEN) đã tạo theo hướng dẫn xuong-phim-ai/tu-dong. Lưu trên máy anh/chị, không đẩy lên mạng.</p>'+
        '<div class="bd-field"><span>URL Worker</span><input type="text" id="f-worker" value="'+h(cf.worker)+'" placeholder="https://gita-xuong-phim.xxx.workers.dev"></div>'+
        '<div class="bd-field"><span>Mật khẩu gửi (SUBMIT_TOKEN)</span><input type="password" id="f-token" value="'+h(cf.token)+'"></div>'+
        '<div class="row mt"><button class="btn sm" onclick="G.ax.tdLuuCaiDat()">Lưu cài đặt</button></div></div>';
      return o;
    }
    o += '<div class="row mb" style="gap:8px;flex-wrap:wrap">'+
      '<button class="btn" onclick="G.ax.tdGui()">'+ic('spark','w-3 h-3')+'Gửi sản xuất tự động</button>'+
      '<button class="btn ghost sm" onclick="(function(){try{localStorage.removeItem(\'axWorker\')}catch(e){}; if(G.render)G.render();})()">Sửa cài đặt</button>'+
      '<span class="bd-chip">Worker: đã kết nối</span></div>';
    o += '<div class="card pad-sm" id="ax-td-status"><p class="sm muted">Chưa gửi tập nào. Bấm "Gửi sản xuất tự động" để bắt đầu.</p></div>';
    o += '<p class="bd-tip" style="margin-top:8px">Dây chuyền: Web → Cloudflare Worker → GitHub Action → Kaggle (GPU, model mở) → phim về R2 → hiện ở đây. Mỗi phim mất ~30 phút đến vài giờ tuỳ hàng đợi Kaggle.</p>';
    return o;
  }

  function veNhanVat(){
    var o=U.sec('Kho nhân vật','Giữ đúng một dàn người qua mọi tập — nhất quán như bộ ảnh mẫu')+
      '<div class="row mb"><button class="btn sm" onclick="G.ax.nvThem()">'+ic('spark','w-3 h-3')+'Thêm nhân vật</button></div>';
    o += '<div class="grid g2">'+ (G.S.axNV||[]).map(function(n){
      return '<div class="card pad-sm"><div class="row" style="justify-content:space-between"><b>'+h(n.ten)+'</b>'+
        '<span class="bd-chip">'+h(nhan(n.vai,VAI)||'Diễn viên')+'</span></div>'+
        '<div class="bd-chips" style="margin:5px 0"><span class="bd-chip">'+h(nhan(n.gioi,GIOI)||'—')+'</span><span class="bd-chip">'+h(nhan(n.tuoi,TUOI)||'—')+'</span></div>'+
        '<p class="sm muted" style="line-height:1.5;margin:6px 0">'+h(n.mota)+'</p>'+
        '<p class="tiny muted">👔 '+h(n.trangPhuc||'—')+'</p>'+
        '<p class="tiny muted">🎙 '+h(n.giong||'—')+' ('+h(giongKey(n.gioi,n.tuoi))+') · seed '+h(n.seed||'—')+'</p>'+
        '<div class="row mt" style="gap:6px"><button class="btn ghost sm" onclick="G.ax.nvSuaMo(\''+n.id+'\')">Sửa</button>'+
        '<button class="btn ghost sm" onclick="G.ax.nvXoa(\''+n.id+'\')">Xoá</button></div></div>';
    }).join('') +'</div>';
    return o;
  }

  function vePhanCanh(){
    var p=phimActive();
    var sel=(G.S.axPhim||[]).map(function(x){return '<option value="'+x.id+'"'+(x.id===G.S.axActive?' selected':'')+'>'+h(x.ten)+'</option>';}).join('');
    var o=U.sec('Phim & phân cảnh','Mỗi tập là một chuỗi cảnh — cảnh người dẫn nói hoặc cảnh diễn')+
      '<div class="row mb" style="gap:8px;flex-wrap:wrap">'+
        '<select onchange="G.ax.phimChon(this.value)" style="padding:8px;border:1px solid var(--line);border-radius:9px">'+sel+'</select>'+
        '<button class="btn sm" onclick="G.ax.phimThem()">'+ic('spark','w-3 h-3')+'Thêm tập</button>'+
        '<button class="btn ghost sm" onclick="G.ax.phimXoa(\''+p.id+'\')">Xoá tập</button>'+
        '<button class="btn sm" onclick="G.ax.canhThem()">'+ic('check','w-3 h-3')+'Thêm cảnh</button></div>';
    o += '<p class="sm muted mb">'+h(p.mota||'')+'</p>';
    if(!p.canh.length) o += '<p class="bd-tip">Chưa có cảnh. Bấm "Thêm cảnh" để bắt đầu phân cảnh.</p>';
    o += p.canh.map(function(c,i){ var nv=nvById(c.nvId)||{}; var pr=promptCanh(c);
      return '<div class="card pad-sm mb"><div class="row" style="justify-content:space-between;align-items:flex-start">'+
        '<div><b>Cảnh '+(i+1)+' · '+h(nv.ten||'?')+'</b> <span class="bd-chip">'+(c.loai==='nguoi'?'Người dẫn nói':'Cảnh diễn')+'</span> <span class="bd-chip">'+(c.giay||5)+'s</span></div>'+
        '<div class="row" style="gap:4px"><button class="btn ghost sm" onclick="G.ax.canhDoi(\''+c.id+'\',-1)" title="Lên">▲</button>'+
        '<button class="btn ghost sm" onclick="G.ax.canhDoi(\''+c.id+'\',1)" title="Xuống">▼</button>'+
        '<button class="btn ghost sm" onclick="G.ax.canhSuaMo(\''+c.id+'\')">Sửa</button>'+
        '<button class="btn ghost sm" onclick="G.ax.canhXoa(\''+c.id+'\')">Xoá</button></div></div>'+
        '<p class="tiny muted" style="margin-top:6px">🎬 '+h(c.boiCanh||'—')+' · 📷 '+h(c.may||'—')+'</p>'+
        (c.thoai?'<p class="sm" style="margin-top:4px">🗣 "'+h(c.thoai)+'"</p>':'')+
        '</div>';
    }).join('');
    return o;
  }

  function vePrompt(){
    var p=phimActive();
    var o=U.sec('Prompt & cấu hình','Sinh sẵn prompt + file .json cho notebook Kaggle (model mở, free)')+
      '<div class="row mb" style="gap:8px;flex-wrap:wrap"><button class="btn" onclick="G.ax.taiConfig()">'+ic('arrow','w-3 h-3')+'Tải cấu hình .json cho Kaggle</button>'+
      '<span class="bd-chip">Tập: '+h(p.ten)+' · '+p.canh.length+' cảnh</span></div>';
    o += '<div class="gd-wrap"><table class="gd-tb"><thead><tr><th>#</th><th>Nhân vật</th><th>Prompt ảnh (InstantID/SDXL)</th><th>Prompt video (Wan I2V)</th><th>Thoại · giọng</th><th>Lip-sync</th></tr></thead><tbody>'+
      p.canh.map(function(c,i){ var nv=nvById(c.nvId)||{}; var pr=promptCanh(c);
        return '<tr><td>'+(i+1)+'</td><td>'+h(nv.ten||'?')+'</td><td style="min-width:220px">'+h(pr.img)+'</td>'+
        '<td style="min-width:200px">'+h(pr.vid)+'</td><td>'+(c.thoai?h(c.thoai)+' <span class="tiny muted">('+h(nv.giong||'—')+')</span>':'<span class="muted">—</span>')+'</td>'+
        '<td class="ta-c">'+((c.loai==='nguoi'&&c.thoai)?'✔':'—')+'</td></tr>';
      }).join('') +'</tbody></table></div>'+
      '<p class="bd-tip">File .json gồm: dàn nhân vật (giữ nhất quán) · pipeline model mở · từng cảnh (prompt ảnh/video · thoại · giọng · seed · lip-sync). Notebook Kaggle đọc file này để sinh — em sẽ viết notebook ngay sau.</p>';
    return o;
  }

  function veBang(){
    var p=phimActive();
    var dem={}; TT.forEach(function(t){dem[t.k]=0;}); p.canh.forEach(function(c){dem[c.tt||'']++;});
    var xong=dem['rap']||0;
    var o=U.sec('Bảng sản xuất','Bấm ô trạng thái để cập nhật: Chưa → Ảnh → Clip → Lip-sync → Đã ráp')+
      '<div class="grid g4 mb">'+
      U.stat({k:'Tổng cảnh',v:String(p.canh.length),d:'tập này'})+
      U.stat({k:'Đã ráp',v:xong+'/'+p.canh.length,d:'hoàn tất',c:xong===p.canh.length&&p.canh.length?'#0B7350':'#B4720F'})+
      U.stat({k:'Đang làm',v:String((dem['anh']||0)+(dem['clip']||0)+(dem['lip']||0)),d:'giữa chừng'})+
      U.stat({k:'Tổng thời lượng',v:p.canh.reduce(function(s,c){return s+(c.giay||5);},0)+'s',d:'ước tính'})+'</div>';
    o += p.canh.map(function(c,i){ var nv=nvById(c.nvId)||{}; var t=ttOf(c.tt||'');
      return '<div class="gd-nvr"><button class="gd-tick" style="--m:var('+t.c+')" onclick="G.ax.canhTT(\''+c.id+'\')" title="Đổi trạng thái"></button>'+
        '<span class="gd-nvi">'+(i+1)+'</span><span class="gd-nvt">'+h(nv.ten||'?')+' · '+h(c.boiCanh||'')+'</span>'+
        '<span class="gd-nvs" style="--m:var('+t.c+')">'+h(t.t)+'</span></div>';
    }).join('');
    return o;
  }

  G.VIEWS['san-xuat-ai'] = function(){
    if(!(typeof G.can==='function' && G.can('qt_trang')))
      return U.lockCard('Bộ điều khiển sản xuất phim AI mở cho Super Admin / Admin. Đăng nhập đúng vai để xem.');
    initData();

    var o = U.ph({ eyebrow:'XƯỞNG PHIM AI · BỘ ĐIỀU KHIỂN', ic:'orbit', grad:1,
      t:'Bộ điều khiển sản xuất phim AI',
      lead:'App GITA là bộ não: giữ dàn nhân vật nhất quán, phân cảnh kịch bản, sinh prompt + cấu hình chuẩn cho công cụ AI free (Kaggle), và theo dõi sản xuất từng tập. Phần sinh video người thật chuyển động chạy ở notebook Kaggle — không slideshow, không ảnh mấp môi.' });

    o += '<div class="row mb" style="gap:8px;flex-wrap:wrap">'+
      '<button class="btn ghost sm" data-v="studio-he">'+ic('arrow','w-3 h-3')+'Hệ điều hành xưởng</button>'+
      '<button class="btn ghost sm" data-v="lam-phim-10">'+ic('sparkle','w-3 h-3')+'Chương trình 10 bước</button>'+
      '</div>';

    o += '<div class="row mb" style="gap:6px;flex-wrap:wrap">'+
      tabBtn('nv','Kho nhân vật')+tabBtn('phim','Phim & phân cảnh')+tabBtn('prompt','Prompt & cấu hình')+tabBtn('bang','Bảng sản xuất')+tabBtn('tudong','Tự động')+'</div>';

    if(G.S.axTab==='nv') o += veNhanVat();
    else if(G.S.axTab==='phim') o += vePhanCanh();
    else if(G.S.axTab==='prompt') o += vePrompt();
    else if(G.S.axTab==='bang') o += veBang();
    else { o += veTuDong(); var _j=tdCfg().job; if(_j) setTimeout(function(){ try{ G.ax.tdTheoDoi(_j); }catch(e){} }, 0); }

    o += '<p class="tiny muted" style="margin-top:14px">'+ic('shield','w-3 h-3')+' Dữ liệu nhân vật & phân cảnh lưu trên máy anh/chị, giữ qua phiên. App không gửi gì ra ngoài; việc sinh video do notebook Kaggle (model mở) thực hiện bằng cấu hình .json tải ở tab "Prompt & cấu hình".</p>';
    return o;
  };
})();
