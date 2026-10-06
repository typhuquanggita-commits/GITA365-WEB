/* ═══════════════════════════════════════════════════════════════
   GITA 365 · XƯỞNG PHIM — LÀM PHIM NHANH (3 bước, ~15 phút, 1080p)

   Chủ hệ chỉ làm 3 việc:  ① chọn ảnh mẫu nhân vật  ② dán kịch bản
   ③ bấm "Làm phim". Xưởng tự:
     · đọc kịch bản → phân cảnh, chọn phim trường, hành động, góc máy
       (bộ đọc luật tiếng Việt chạy ngay trong trình duyệt, không gửi đi đâu)
     · gửi lên trạm Cloudflare → máy GPU nội bộ chạy SONG SONG từng cảnh
       (model mở: Qwen-Image-Edit · Wan 2.2 · InfiniteTalk · VieNeu-TTS)
     · ráp 1080p, phụ đề, thẻ tên, nhạc → trả video về đây để xem/tải.
   Trình duyệt chỉ giữ địa chỉ trạm + mật khẩu gửi (localStorage), không
   giữ khoá máy GPU. Dữ liệu màn này lưu qua phiên: G.S.axN. View con của
   san-xuat-ai (tab "Làm phim nhanh"); mở cho qt_trang.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
(function(){
  var U = G.U, h = U.h, ic = U.ic;
  var axn = G.axn = G.axn || {};
  var TOI_DA_CANH = 14;                       /* giữ mốc ~15 phút: mỗi cảnh một máy GPU chạy song song */

  /* ── Phim trường nội bộ: từ khoá tiếng Việt → mô tả tiếng Anh cho mô hình ── */
  var BOI_CANH = [
    ['bc-sanh', /sảnh|lobby/, 'a luxurious modern lobby of the GITA365 ecosystem, large LED wall, polished marble floor, green plants, navy blue and gold interior'],
    ['bc-bucgiang', /bục giảng|giảng đường|studio|trường quay/, 'a professional training studio stage with a large screen behind, warm wood paneling, soft key light'],
    ['bc-hoithao', /hội thảo|hội trường|hội nghị/, 'a bright conference hall with neat rows of chairs, glass windows, green plants, natural light'],
    ['bc-lophoc', /lớp học|lớp|phòng học/, 'a modern training classroom with a whiteboard, green plants, natural daylight'],
    ['bc-vanphong', /văn phòng|phòng làm việc|công ty/, 'an upscale executive office with wooden bookshelves, glass windows overlooking the city, warm lights'],
    ['bc-sankhau', /sân khấu|sự kiện|lễ/, 'an event stage with a navy blue and gold backdrop, stage lighting, audience silhouettes'],
    ['bc-coach', /coach|1-1|tư vấn riêng/, 'a cozy one-on-one coaching room with a sofa, green plants, soft warm light'],
    ['bc-phongkhach', /phòng khách|trong nhà|ở nhà|gia đình/, 'an elegant family living room with a sofa, bookshelves, plants, warm afternoon sunlight'],
    ['bc-vuontre', /vườn|tre|công viên|ngoài trời/, 'a green bamboo garden path with a traditional wooden house in the distance, sunlight through the leaves'],
    ['bc-bep', /bếp|nấu/, 'a modern family kitchen with a kitchen island, fresh vegetables, large glass window'],
    ['bc-bien', /biển|bãi cát/, 'a sunny beach with gentle waves, golden sand, clear blue sky']
  ];
  /* ── Hành động: từ khoá → mã (động cơ có sẵn ngữ pháp chuyển động tiếng Anh cho từng mã) ── */
  var HANH = [
    ['chay', /\bchạy\b/], ['bat_tay', /bắt tay/], ['om', /\bôm\b/], ['dua_do', /trao|đưa cho|tặng/],
    ['cam_do', /cầm|nhấc|giơ/], ['ngoi_xuong', /ngồi xuống|ngồi/], ['dung_len', /đứng dậy|đứng lên/],
    ['rot_tra', /rót/], ['go_may', /gõ máy|máy tính|laptop/], ['vay_tay', /vẫy tay|chào/],
    ['thuyet_trinh', /thuyết trình|giảng|chỉ (lên |vào )?màn hình/], ['tro_chuyen', /trò chuyện|nói chuyện/],
    ['di_bo', /đi bộ|bước|đi dạo|tiến vào|đi vào|\bđi\b/], ['gat_dau', /gật đầu|lắng nghe/]
  ];
  var MAU = '[Bục giảng studio GITA]\n' +
    'Trainer: Chào anh chị, hôm nay chúng ta cùng nói về kỷ luật tài chính của gia đình.\n' +
    'MC: Thưa thầy, một gia đình trẻ nên bắt đầu từ đâu ạ?\n' +
    'Trainer: Bắt đầu từ một thói quen nhỏ: ghi lại mọi khoản chi trong ba mươi ngày.\n\n' +
    '[Vườn tre] Trainer đi bộ chậm, mỉm cười nhìn về phía máy.\n' +
    'Trainer: Kỷ luật hôm nay là tự do của ngày mai. Hẹn gặp anh chị ở GITA365.';

  function boDau(s){ return (s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').trim(); }
  function lsGet(k){ try{ return window.localStorage.getItem(k)||''; }catch(e){ return ''; } }
  function lsSet(k,v){ try{ window.localStorage.setItem(k,v); }catch(e){} }
  function tram(){ return { worker:lsGet('axWorker').replace(/\/+$/,''), token:lsGet('axToken') }; }
  function luu(){ if(G.save) G.save(); }
  /* Đường làm phim: đã nối kho Google Drive → MIỄN PHÍ (Drive + GitHub + Kaggle, vài giờ);
     không thì trạm Cloudflare + máy GPU thuê (~15 phút). */
  function kd(){ return G.khoDrive && G.khoDrive.coKho() ? G.khoDrive : null; }
  function anhCua(n){ return kd() ? n.anhDrive : n.anh; }

  function st(){
    if(!G.S.axN){
      var goc = (G.S.axNV||[]).filter(function(n){ return n.vai==='trainer'||n.vai==='mc'; }).slice(0,2);
      if(!goc.length) goc=[{id:'nv-trainer',ten:'Trainer Trương Nhật Quang',vai:'trainer',gioi:'nam',tuoi:'lon'},{id:'nv-mc',ten:'MC GITA',vai:'mc',gioi:'nu',tuoi:'lon'}];
      G.S.axN = { nv: goc.map(function(n){ return {id:n.id, ten:n.ten, vai:n.vai, gioi:n.gioi||'nam', tuoi:n.tuoi||'lon', anh:'', thumb:''}; }),
        kichBan: MAU, khung:'doc', ngonNgu:'vi', job:'', lichSu:[] };
    }
    return G.S.axN;
  }

  /* ════════ BỘ ĐỌC KỊCH BẢN → KẾ HOẠCH CẢNH (chạy trong trình duyệt) ════════ */
  function timNguoi(nhan, ds){
    var k = boDau(nhan);
    var vai = /trainer|thay|giang vien|chuyen gia/.test(k) ? 'trainer' : (/\bmc\b|dan chuong trinh|nguoi dan/.test(k) ? 'mc' : '');
    for(var i=0;i<ds.length;i++){
      var t = boDau(ds[i].ten);
      if(t===k || t.indexOf(k)>=0 || k.indexOf(t)>=0) return ds[i];
      var tu = t.split(/\s+/).filter(function(x){ return x.length>2; });
      if(tu.some(function(x){ return new RegExp('\\b'+x+'\\b').test(k); }) && !/^(trainer|mc|gita)$/.test(k)) return ds[i];
    }
    if(vai) for(var j=0;j<ds.length;j++) if(ds[j].vai===vai) return ds[j];
    return null;
  }
  function nguoiTrongMoTa(moTa, ds){ var k=boDau(moTa); return ds.filter(function(n){
      var t=boDau(n.ten).split(/\s+/).filter(function(x){return x.length>2 && !/^(gita|gita365|trainer)$/.test(x);});
      return t.some(function(x){ return k.indexOf(x)>=0; }) || (n.vai==='trainer'&&/trainer|thay/.test(k)) || (n.vai==='mc'&&/\bmc\b/.test(k)); }); }
  function catCau(text, toiDa){
    var cau = text.match(/[^.!?…]+[.!?…]*/g) || [text], ra=[], cur='';
    cau.forEach(function(c){ c=c.trim(); if(!c) return;
      var n=(cur+' '+c).trim().split(/\s+/).length;
      if(cur && n>toiDa){ ra.push(cur); cur=c; } else cur=(cur+' '+c).trim(); });
    if(cur) ra.push(cur); return ra;
  }
  function giayNoi(t){ return Math.max(3, Math.min(14, Math.round((t.split(/\s+/).length/3.0 + 0.8)*10)/10)); }

  axn.st = st;                                   /* tab Dự án phim dùng chung dàn nhân vật + ảnh mẫu */
  axn.nguoiTrong = nguoiTrongMoTa;              /* dùng chung cho tab Dự án phim */
  axn.BOI_CANH = BOI_CANH;
  axn.doc = function(kichBan, ds){
    var canh=[], canhBao=[], bc=null, bcTruoc=null;
    var khoi = (kichBan||'').replace(/\r/g,'').split(/\n\s*\n/);
    khoi.forEach(function(k){
      var moTa=[], thoai=[], noi=[];
      k.split('\n').forEach(function(d){ d=d.trim(); if(!d) return;
        var m = d.match(/^[\[(]([^\])]+)[\])]\s*(.*)$/);
        if(m){ noi.push(m[1]); if(m[2]) moTa.push(m[2]); return; }
        var t = d.match(/^([^:：]{1,32})[:：]\s*(.+)$/);
        if(t){ var ng=timNguoi(t[1], ds);
          if(!ng){ canhBao.push('Không nhận ra người nói "'+t[1].trim()+'" — tạm giao cho '+((ds[0]||{}).ten||'nhân vật 1')+'.'); ng=ds[0]; }
          if(ng) thoai.push({nv:ng.id, text:t[2].trim()}); return; }
        moTa.push(d); });
      var mt = moTa.join('. '), chon = noi.join('. ');            /* [..] = nơi quay · câu thường = hành động */
      var tim = BOI_CANH.filter(function(b){ return b[1].test((chon||mt).toLowerCase()); })[0];
      if(tim) bc=tim; if(!bc) bc=BOI_CANH[1];
      var hd = (HANH.filter(function(x){ return x[1].test(mt.toLowerCase()); })[0]||[''])[0];
      var co = nguoiTrongMoTa(mt, ds);
      if((mt||chon) && (!thoai.length || bc!==bcTruoc)){        /* cảnh diễn / cảnh mở bối cảnh mới */
        var dong = hd==='di_bo'||hd==='chay'||hd==='di_ngang';
        var nvs = (co.length?co:[ds.filter(function(n){ return thoai.length && n.id===thoai[0].nv; })[0]||ds[0]]).filter(Boolean).slice(0,2);
        canh.push({ loai:'dien', nv:nvs.map(function(n){return n.id;}), mo_ta:mt||chon, hanh_dong:hd, bc_id:bc[0], boi_canh_en:bc[2],
          giay: dong?6:(thoai.length?4:5),
          may: dong ? {co:'trung_rong',goc:'ngang_mat',chuyen:'bam_theo'} : (hd==='bat_tay'||hd==='om' ? {co:'trung',goc:'ngang_mat',chuyen:'xoay_quanh'} : (hd ? {co:'trung',goc:'ngang_mat',chuyen:'day_vao',cuong:0.3} : {co:'toan',goc:'ngang_mat',chuyen:'day_vao',cuong:0.35})) });
      }
      bcTruoc=bc;
      thoai.forEach(function(t){
        catCau(t.text, 34).forEach(function(doan){
          var i = canh.filter(function(c){ return c.loai==='noi'; }).length;
          canh.push({ loai:'noi', nv:[t.nv], thoai:doan, mo_ta:mt, hanh_dong: hd==='thuyet_trinh'?'thuyet_trinh':'', bc_id:bc[0], boi_canh_en:bc[2],
            giay: giayNoi(doan), may: i%2 ? {co:'can',goc:'ngang_mat',chuyen:'tinh'} : {co:'trung',goc:'ngang_mat',chuyen:'day_vao',cuong:0.3} });
        });
      });
    });
    if(canh.length){ var cuoi=canh[canh.length-1]; if(cuoi.loai==='noi' && cuoi.may.chuyen==='tinh') cuoi.may={co:cuoi.may.co,goc:'ngang_mat',chuyen:'keo_ra',cuong:0.35}; }
    if(canh.length>TOI_DA_CANH) canhBao.push('Kịch bản ra '+canh.length+' cảnh — vượt '+TOI_DA_CANH+' cảnh thì quá mốc 15 phút. Nên tách thành 2 tập.');
    canh.forEach(function(c,i){ c.id='s'+(i+1); c.thu_tu=i+1; });
    return { canh:canh, canhBao:canhBao, tongGiay: Math.round(canh.reduce(function(s,c){ return s+c.giay; },0)) };
  };

  /* ════════ ẢNH MẪU: thu nhỏ trên máy rồi gửi lên trạm ════════ */
  function thuNho(file, canh, chat){
    return new Promise(function(ok, loi){
      var r = new FileReader();
      r.onerror = function(){ loi(new Error('Không đọc được ảnh')); };
      r.onload = function(){ var im = new Image();
        im.onerror = function(){ loi(new Error('Tệp không phải ảnh')); };
        im.onload = function(){ var s = Math.min(1, canh/Math.max(im.width, im.height));
          var cv = document.createElement('canvas'); cv.width = Math.round(im.width*s); cv.height = Math.round(im.height*s);
          cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); ok(cv.toDataURL('image/jpeg', chat)); };
        im.src = r.result; };
      r.readAsDataURL(file);
    });
  }
  axn.chonAnh = function(i, input){
    var f = input.files && input.files[0]; if(!f) return;
    var s = st(), n = s.nv[i], t = tram(), k = kd();
    if(!k && !t.worker){ return U.toast('Chưa nối kho Drive hay trạm — mở tab "Kho phim" để nối Google Drive.','err'); }
    Promise.all([thuNho(f, 1280, 0.9), thuNho(f, 160, 0.8)]).then(function(kq){
      n.thumb = kq[1]; ve();
      if(k) return k.goi('taiAnh', { id:n.id, data:kq[0] });
      return fetch(t.worker+'/api/anh', { method:'POST', headers:{'content-type':'application/json','x-gita-token':t.token},
        body: JSON.stringify({ id:n.id, data:kq[0] }) }).then(function(r){ return r.json(); });
    }).then(function(d){
      if(d && k && d.id){ n.anhDrive = d.id; luu(); ve(); U.toast('Đã lưu ảnh '+n.ten+' vào Drive','ok'); }
      else if(d && d.key){ n.anh = d.key; luu(); ve(); U.toast('Đã gửi ảnh '+n.ten,'ok'); }
      else U.toast((d&&d.loi)||'Gửi ảnh thất bại','err');
    }).catch(function(e){ U.toast('Lỗi ảnh: '+(e&&e.message),'err'); });
  };
  axn.nvSua = function(i, k, v){ var n=st().nv[i]; if(!n) return; n[k]=v; luu(); };
  axn.nvThem = function(){ var s=st(); if(s.nv.length>=4) return U.toast('Tối đa 4 nhân vật cho một video nhanh.','err');
    s.nv.push({ id:'nv-'+Math.random().toString(36).slice(2,7), ten:'Nhân vật '+(s.nv.length+1), vai:'dienvien', gioi:'nam', tuoi:'lon', anh:'', thumb:'' }); luu(); ve(); };
  axn.nvXoa = function(i){ var s=st(); if(s.nv.length<=1) return; s.nv.splice(i,1); luu(); ve(); };
  axn.kichBan = function(v){ st().kichBan=v; luu(); var el=document.getElementById('axn-doc'); if(el) el.innerHTML=veDoc(); };
  axn.dat = function(k,v){ st()[k]=v; luu(); ve(); };
  axn.mau = function(){ st().kichBan=MAU; luu(); ve(); };

  /* ════════ GỬI LÀM PHIM + THEO DÕI ════════ */
  function giongKey(n){ return (n.gioi||'nam')+'-'+(n.tuoi||'lon'); }
  axn.lamPhim = function(){
    var s=st(), t=tram(), k=kd();
    if(!k && (!t.worker || !t.token)) return U.toast('Chưa nối kho Drive — mở tab "Kho phim" để nối Google Drive.','err');
    var kh = axn.doc(s.kichBan, s.nv);
    if(!kh.canh.length) return U.toast('Kịch bản chưa có cảnh nào.','err');
    var dung = {}; kh.canh.forEach(function(c){ c.nv.forEach(function(id){ dung[id]=1; }); });
    var thieu = s.nv.filter(function(n){ return dung[n.id] && !anhCua(n); });
    if(thieu.length) return U.toast('Còn thiếu ảnh mẫu: '+thieu.map(function(n){return n.ten;}).join(', '),'err');
    var goi = { tieu_de: (s.kichBan.split('\n').filter(function(x){return x.trim();})[0]||'Phim GITA').slice(0,80),
      khung: s.khung, ngon_ngu: s.ngonNgu, kich_ban: s.kichBan,
      nhan_vat: s.nv.filter(function(n){ return dung[n.id]; }).map(function(n){ return {id:n.id, ten:n.ten, vai:n.vai, gioi:n.gioi, tuoi:n.tuoi, giong_key:giongKey(n), anh:anhCua(n)}; }),
      canh: kh.canh };
    s.job=''; s.duong = k ? 'drive' : 'tram';
    s.tt={trangThai:'queued', buoc: k ? 'Đang gửi việc vào kho Drive…' : 'Đang gửi lên trạm…', phanTram:1}; s.batDau=Date.now(); luu(); ve();
    var nhan = function(d){
        if(!d.jobid){ s.tt={trangThai:'error', buoc:d.loi||'Gửi thất bại'}; luu(); ve(); return; }
        s.job=d.jobid; s.lichSu.unshift({job:d.jobid, ten:goi.tieu_de, luc:new Date().toISOString(), canh:kh.canh.length, duong:s.duong});
        s.lichSu=s.lichSu.slice(0,10); luu(); axn.theoDoi(); };
    if(k){ k.goi('datViec', { ke_hoach:goi }).then(nhan).catch(function(e){ s.tt={trangThai:'error', buoc:e.message}; luu(); ve(); }); return; }
    fetch(t.worker+'/api/nhanh', { method:'POST', headers:{'content-type':'application/json','x-gita-token':t.token}, body:JSON.stringify(goi) })
      .then(function(r){ return r.json(); })
      .then(nhan)
      .catch(function(e){ s.tt={trangThai:'error', buoc:'Không gọi được trạm: '+(e&&e.message)}; luu(); ve(); });
  };
  axn.theoDoi = function(){
    var s=st(), t=tram(); clearTimeout(axn._t);
    if(!s.job) return;
    var hoi = s.duong==='drive' ? (kd() ? kd().goi('trangThai', {jobid:s.job}) : null)
                                : (t.worker ? fetch(t.worker+'/api/phim/'+s.job).then(function(r){ return r.json(); }) : null);
    if(!hoi) return;
    hoi.then(function(d){
      s.tt=d; luu(); veTienDo();
      if(d.trangThai!=='done' && d.trangThai!=='error') axn._t=setTimeout(axn.theoDoi, s.duong==='drive' ? 30000 : 6000);
      else ve();
    }).catch(function(){ axn._t=setTimeout(axn.theoDoi, 10000); });
  };
  axn.luuTram = function(){
    var w=(document.getElementById('axn-w')||{}).value||'', k=(document.getElementById('axn-k')||{}).value||'';
    if(!/^https:\/\//.test(w.trim())) return U.toast('Địa chỉ trạm phải bắt đầu bằng https://','err');
    lsSet('axWorker', w.trim()); lsSet('axToken', k.trim()); U.toast('Đã lưu cài đặt trạm trên máy này.','ok'); ve();
  };

  /* ════════ GIAO DIỆN ════════ */
  function ve(){ if(G.render) G.render(); }
  function mmss(ms){ var s=Math.max(0,Math.round(ms/1000)); return Math.floor(s/60)+':'+('0'+(s%60)).slice(-2); }
  function veDoc(){
    var s=st(), kh=axn.doc(s.kichBan, s.nv);
    var dem = {noi:0, dien:0}; kh.canh.forEach(function(c){ dem[c.loai]++; });
    return '<div class="row" style="gap:8px;flex-wrap:wrap;align-items:center">'+
        '<span class="bd-chip">'+kh.canh.length+' cảnh</span><span class="bd-chip">'+dem.noi+' cảnh nói</span><span class="bd-chip">'+dem.dien+' cảnh diễn</span>'+
        '<span class="bd-chip">~'+kh.tongGiay+' giây phim</span></div>'+
      (kh.canhBao.length ? '<p class="bd-tip" style="color:#B4720F;margin-top:6px">'+kh.canhBao.map(h).join('<br>')+'</p>' : '')+
      '<details style="margin-top:8px"><summary class="tiny muted" style="cursor:pointer">Xem xưởng phân cảnh thế nào</summary>'+
      '<ol class="tiny" style="margin:6px 0 0 18px;color:var(--ink-2);line-height:1.6">'+kh.canh.map(function(c){
        var ten = c.nv.map(function(id){ return (s.nv.filter(function(n){return n.id===id;})[0]||{}).ten||id; }).join(' + ');
        return '<li><b>'+(c.loai==='noi'?'Nói':'Diễn')+'</b> · '+h(ten)+' · '+c.giay+'s · 🎥 '+h(c.may.co+' / '+c.may.chuyen)+
          (c.thoai?' — “'+h(c.thoai.slice(0,70))+(c.thoai.length>70?'…':'')+'”':(c.mo_ta?' — '+h(c.mo_ta.slice(0,60)):''))+'</li>'; }).join('')+'</ol></details>';
  }
  function veTienDo(){
    var el=document.getElementById('axn-td'); if(el) el.innerHTML=htmlTienDo();
  }
  function htmlTienDo(){
    var s=st(), d=s.tt; if(!d) return '';
    var pt = d.trangThai==='done'?100:Math.max(2, Math.min(99, +d.phanTram||0));
    var mau = d.trangThai==='error' ? '#B42318' : (d.trangThai==='done' ? '#0B7350' : 'var(--gita)');
    var o = '<div class="row" style="justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap">'+
      '<b class="sm">'+(d.trangThai==='done'?'✅ Phim xong':(d.trangThai==='error'?'⚠ Dừng lại':'⏳ Xưởng đang làm'))+'</b>'+
      '<span class="tiny muted">'+(s.batDau?'đã chạy '+mmss((d.xong?Date.parse(d.xong):Date.now())-s.batDau)+(s.duong==='drive'?' · đường miễn phí, thường vài giờ':' · mốc 15:00'):'')+'</span></div>'+
      '<div style="height:10px;border-radius:6px;background:var(--line);overflow:hidden;margin-top:8px"><div style="height:100%;width:'+pt+'%;background:'+mau+';transition:width .6s"></div></div>'+
      '<p class="tiny" style="margin-top:6px;color:var(--ink-2)">'+h(d.buoc||'')+'</p>';
    if(d.trangThai==='done' && s.duong==='drive' && d.phimId && G.khoDrive){
      o += '<div style="position:relative;width:100%;max-width:480px;aspect-ratio:'+(s.khung==='ngang'?'16/9':'9/16')+';margin:10px auto 0;max-height:75vh">'+
          '<iframe src="'+h(G.khoDrive.xem(d.phimId))+'" allow="autoplay; fullscreen" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0;border-radius:12px;background:#000"></iframe></div>'+
        '<div class="row mt" style="gap:8px;flex-wrap:wrap">'+
          '<a class="btn" target="_blank" rel="noopener" href="'+h(G.khoDrive.link(d.phimId))+'">⬇ Mở / tải trên Drive</a>'+
          (d.phimPhuDeId?'<a class="btn ghost" target="_blank" rel="noopener" href="'+h(G.khoDrive.link(d.phimPhuDeId))+'">Bản có phụ đề</a>':'')+
          '<button class="btn ghost" onclick="G.ax.tab(\'khophim\')">Xem trong Kho phim</button></div>';
    } else if(d.trangThai==='done' && s.job){
      var w=tram().worker;
      o += '<video controls playsinline style="width:100%;max-height:70vh;border-radius:12px;margin-top:10px;background:#000" src="'+h(w+'/api/phim/'+s.job+'/video')+'"></video>'+
        '<div class="row mt" style="gap:8px;flex-wrap:wrap">'+
          '<a class="btn" href="'+h(w+'/api/phim/'+s.job+'/video?tai=1')+'">⬇ Tải video 1080p</a>'+
          '<a class="btn ghost" href="'+h(w+'/api/phim/'+s.job+'/video?ban=phude&tai=1')+'">Tải bản có phụ đề</a></div>';
    }
    return o;
  }
  axn.ve = function(){
    var s=st(), t=tram();
    var o = U.sec('Làm phim nhanh','Gửi ảnh mẫu + kịch bản → xưởng tự làm từ A đến Z → video 1080p lưu vào Google Drive');
    /* Bước 1 · ảnh mẫu */
    o += '<div class="card pad-sm mb"><b class="sm">① Ảnh mẫu nhân vật</b><p class="tiny muted" style="margin:4px 0 8px">Ảnh rõ mặt, nhìn thẳng, đủ sáng. Mỗi người một ảnh là đủ.</p>'+
      '<div class="grid g2" style="gap:10px">'+s.nv.map(function(n,i){
        return '<div style="display:flex;gap:10px;align-items:center;border:1px solid var(--line);border-radius:12px;padding:8px">'+
          '<label style="width:64px;height:64px;border-radius:10px;flex:none;cursor:pointer;background:var(--line) center/cover no-repeat'+(n.thumb?' url('+n.thumb+')':'')+';display:flex;align-items:center;justify-content:center;font-size:22px" title="Chọn ảnh">'+
            (n.thumb?'':'📷')+'<input type="file" accept="image/*" style="display:none" onchange="G.axn.chonAnh('+i+',this)"></label>'+
          '<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px">'+
            '<input type="text" value="'+h(n.ten)+'" onchange="G.axn.nvSua('+i+',\'ten\',this.value)" style="padding:6px;border:1px solid var(--line);border-radius:8px">'+
            '<div class="row" style="gap:4px;flex-wrap:wrap">'+
              '<select onchange="G.axn.nvSua('+i+',\'gioi\',this.value)" style="padding:4px;border:1px solid var(--line);border-radius:8px"><option value="nam"'+(n.gioi==='nam'?' selected':'')+'>Nam</option><option value="nu"'+(n.gioi==='nu'?' selected':'')+'>Nữ</option></select>'+
              '<select onchange="G.axn.nvSua('+i+',\'tuoi\',this.value)" style="padding:4px;border:1px solid var(--line);border-radius:8px"><option value="lon"'+(n.tuoi==='lon'?' selected':'')+'>Người lớn</option><option value="teen"'+(n.tuoi==='teen'?' selected':'')+'>Thiếu niên</option><option value="treem"'+(n.tuoi==='treem'?' selected':'')+'>Trẻ em</option></select>'+
              '<span class="tiny" style="color:'+(anhCua(n)?'#0B7350':'#B4720F')+'">'+(anhCua(n)?'✓ đã gửi ảnh':'chưa có ảnh')+'</span>'+
              (s.nv.length>1?'<button class="btn ghost sm" style="padding:2px 8px" onclick="G.axn.nvXoa('+i+')">Bỏ</button>':'')+'</div></div></div>';
      }).join('')+'</div>'+
      (s.nv.length<4?'<button class="btn ghost sm mt" onclick="G.axn.nvThem()">+ Thêm nhân vật</button>':'')+'</div>';
    /* Bước 2 · kịch bản */
    o += '<div class="card pad-sm mb"><b class="sm">② Kịch bản</b>'+
      '<p class="tiny muted" style="margin:4px 0 8px">Mỗi đoạn cách nhau một dòng trống. <b>[Bối cảnh]</b> ở đầu đoạn · <b>Tên: lời thoại</b> cho người nói · câu thường là hành động.</p>'+
      '<textarea rows="9" oninput="G.axn.kichBan(this.value)" style="width:100%;box-sizing:border-box;padding:10px;border:1px solid var(--line);border-radius:10px;font-size:14px;line-height:1.5">'+h(s.kichBan)+'</textarea>'+
      '<div class="row mt" style="gap:8px;flex-wrap:wrap;align-items:center">'+
        '<select onchange="G.axn.dat(\'khung\',this.value)" style="padding:6px;border:1px solid var(--line);border-radius:8px"><option value="doc"'+(s.khung==='doc'?' selected':'')+'>Dọc 9:16 · Reels/TikTok</option><option value="ngang"'+(s.khung==='ngang'?' selected':'')+'>Ngang 16:9 · YouTube</option></select>'+
        '<select onchange="G.axn.dat(\'ngonNgu\',this.value)" style="padding:6px;border:1px solid var(--line);border-radius:8px"><option value="vi"'+(s.ngonNgu==='vi'?' selected':'')+'>Tiếng Việt</option><option value="en"'+(s.ngonNgu==='en'?' selected':'')+'>English</option></select>'+
        '<button class="btn ghost sm" onclick="G.axn.mau()">Dùng kịch bản mẫu</button></div>'+
      '<div id="axn-doc" style="margin-top:10px">'+veDoc()+'</div></div>';
    /* Bước 3 · làm phim */
    var dangChay = s.tt && s.job && s.tt.trangThai!=='done' && s.tt.trangThai!=='error';
    o += '<div class="card pad-sm mb"><b class="sm">③ Làm phim</b><div class="row mt" style="gap:8px;flex-wrap:wrap;align-items:center">'+
      '<button class="btn" '+(dangChay?'disabled':'')+' onclick="G.axn.lamPhim()">'+ic('spark','w-3 h-3')+(dangChay?'Đang làm…':'🎬 Làm phim')+'</button>'+
      '<span class="tiny muted">Video 1080p · giọng chuẩn phát sóng · phụ đề · thẻ tên · nhạc nền · '+(kd()?'<b>đường miễn phí</b>: lưu thẳng vào Google Drive (Kaggle GPU, thường vài giờ)':(t.worker?'máy GPU thuê, ~15 phút':'<b>chưa nối</b> — mở tab Kho phim để nối Google Drive'))+'</span></div>'+
      '<div id="axn-td" style="margin-top:10px">'+htmlTienDo()+'</div></div>';
    if(s.lichSu.length>1) o += '<div class="card pad-sm mb"><b class="sm">Phim đã làm</b><ul class="tiny" style="margin:6px 0 0 18px;line-height:1.7">'+
      s.lichSu.map(function(x){ return '<li>'+(x.duong==='drive' ? h(x.ten)+' · <a href="javascript:void 0" onclick="G.ax.tab(\'khophim\')">trong Kho phim</a>' : '<a href="'+h(t.worker+'/api/phim/'+x.job+'/video?tai=1')+'">'+h(x.ten)+'</a>')+' · '+x.canh+' cảnh · '+h(new Date(x.luc).toLocaleString('vi-VN'))+'</li>'; }).join('')+'</ul></div>';
    /* Cài đặt một lần */
    o += '<details class="card pad-sm"><summary class="sm" style="cursor:pointer"><b>Máy GPU thuê (tuỳ chọn, ~15 phút)</b> <span class="tiny muted">'+(t.worker?'· đã nối trạm':'· chưa dùng — mặc định đi đường miễn phí qua Google Drive')+'</span></summary>'+
      '<div class="grid g2 mt" style="gap:8px"><input id="axn-w" type="url" placeholder="https://gita-xuong-phim….workers.dev" value="'+h(t.worker)+'" style="padding:8px;border:1px solid var(--line);border-radius:8px">'+
      '<input id="axn-k" type="password" placeholder="Mật khẩu gửi phim" value="'+h(t.token)+'" style="padding:8px;border:1px solid var(--line);border-radius:8px"></div>'+
      '<div class="row mt"><button class="btn sm" onclick="G.axn.luuTram()">Lưu</button></div>'+
      '<p class="bd-tip">Chỉ dùng khi thuê máy GPU (Modal). Đã nối kho Google Drive thì xưởng ưu tiên đường miễn phí. Hướng dẫn: <b>xuong-phim-ai/nhanh/README-nhanh.md</b>.</p></details>';
    if(dangChay) setTimeout(axn.theoDoi, 0);
    return o;
  };
})();
