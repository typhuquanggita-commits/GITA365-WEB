/* ═══════════════════════════════════════════════════════════════
   GITA 365 — BÀN DỰNG STUDIO · biên tập ảnh · màu · hiệu ứng · chữ ·
   âm thanh · ghép ảnh thành phim  (xưởng sản xuất toàn diện, TẠI MÁY)

   Công cụ biên tập THẬT, chạy hoàn toàn trên thiết bị bằng Canvas 2D +
   Web Audio + MediaRecorder — KHÔNG gửi ảnh/giọng/dữ liệu ra máy chủ hay
   dịch vụ ngoài (đúng luật xưởng). KHÔNG đụng studio.js (xưởng dựng video
   gói nghề) · máy chủ · giấy phép. View key: ban-dung. Mở cho qt_trang.

   Làm được:
     · Nạp & ghép nhiều ảnh, khung dọc 9:16, phóng·di·xoay·lật
     · Chỉnh sáng · tương phản · bão hoà · ấm/lạnh · mờ · nét · tối góc
     · Hiệu ứng điện ảnh (preset lọc màu)
     · Thêm chữ (tiêu đề·phụ đề) + logo GITA
     · Ghép nhạc nền + giọng đọc, chỉnh âm lượng & fade, nghe thử
     · Ghép các khung thành phim (slideshow) + nhạc/giọng → xem thử
     · Xuất khung ảnh PNG · xuất video nháp (.webm) nếu trình duyệt hỗ trợ
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic;
  var W = 1080, H = 1920;

  var PRESET = {
    ''        : { ten:'Gốc',       sang:100, tuong:100, bao:100, am:0,   vig:0,  sepia:0,  gray:0  },
    dienanh   : { ten:'Điện ảnh',  sang:100, tuong:116, bao:92,  am:-8,  vig:38, sepia:6,  gray:0  },
    am        : { ten:'Ấm áp',     sang:104, tuong:102, bao:110, am:30,  vig:10, sepia:8,  gray:0  },
    lanh      : { ten:'Lạnh',      sang:100, tuong:107, bao:96,  am:-28, vig:12, sepia:0,  gray:0  },
    bw        : { ten:'Đen trắng', sang:102, tuong:114, bao:100, am:0,   vig:24, sepia:0,  gray:100},
    codien    : { ten:'Cổ điển',   sang:101, tuong:98,  bao:88,  am:14,  vig:32, sepia:48, gray:0  },
    rucro     : { ten:'Rực rỡ',    sang:103, tuong:109, bao:138, am:4,   vig:0,  sepia:0,  gray:0  }
  };

  /* Trạng thái sống (ảnh/âm là bộ nhớ phiên, không serialize vào G.S) */
  var S = G.bdS = G.bdS || {
    anh:[], hoat:-1, fit:'cover', zoom:1, offX:0, offY:0, rot:0, flip:false,
    sang:100, tuong:100, bao:100, am:0, mo:0, net:0, vig:0, sepia:0, gray:0, preset:'',
    tieuDe:'', phuDe:'', cuChu:70, mauChu:'#ffffff', viChu:'duoi', logo:true, viLogo:'phai',
    nhac:null, nhacTen:'', giong:null, giongTen:'', amNhac:0.45, amGiong:1, fadeIn:true, fadeOut:true,
    khung:[], moiKhung:2.5, chuyen:'mo'
  };
  var AC=null, nut=[], choi=false, raf=0, ghiMR=null;
  function ac(){ return (AC = AC || new (window.AudioContext||window.webkitAudioContext)()); }
  function cv(){ return document.getElementById('bd-cv'); }
  function ctx(){ var c=cv(); return c?c.getContext('2d'):null; }

  /* ════════ VẼ KHUNG ════════ */
  function veKhung(c, bo){
    if(!c) return;
    var x = c.getContext('2d');
    x.save(); x.setTransform(1,0,0,1,0,0);
    x.fillStyle = '#0c1118'; x.fillRect(0,0,W,H);

    var img = S.anh[S.hoat];
    x.filter = 'brightness('+S.sang+'%) contrast('+S.tuong+'%) saturate('+S.bao+'%) blur('+S.mo+'px)'+
               (S.sepia?' sepia('+S.sepia+'%)':'') + (S.gray?' grayscale('+S.gray+'%)':'');
    if(img){
      var iw=img.width, ih=img.height, s;
      if(S.fit==='cover') s = Math.max(W/iw, H/ih); else s = Math.min(W/iw, H/ih);
      s *= S.zoom;
      var dw=iw*s, dh=ih*s;
      x.translate(W/2 + S.offX, H/2 + S.offY);
      x.rotate(S.rot*Math.PI/180);
      x.scale(S.flip?-1:1, 1);
      x.drawImage(img, -dw/2, -dh/2, dw, dh);
    } else {
      /* Chưa nạp ảnh — nền chuyển sắc để vẫn dựng chữ/âm được */
      var g = x.createLinearGradient(0,0,0,H);
      g.addColorStop(0,'#1b2b4d'); g.addColorStop(1,'#0c1118');
      x.filter='none'; x.fillStyle=g; x.fillRect(0,0,W,H);
    }
    x.restore();
    x.filter='none';

    /* Ấm / lạnh — phủ một lớp màu mỏng */
    if(S.am){
      x.save(); x.globalCompositeOperation='soft-light';
      x.globalAlpha = Math.min(Math.abs(S.am)/100*0.9, 0.6);
      x.fillStyle = S.am>0 ? '#ff8a1e' : '#1e7bff';
      x.fillRect(0,0,W,H); x.restore();
    }
    /* Tối góc (vignette) */
    if(S.vig){
      x.save();
      var r = x.createRadialGradient(W/2,H/2,H*0.30, W/2,H/2,H*0.72);
      r.addColorStop(0,'rgba(0,0,0,0)'); r.addColorStop(1,'rgba(0,0,0,'+(S.vig/100*0.85)+')');
      x.fillStyle=r; x.fillRect(0,0,W,H); x.restore();
    }
    if(!bo || !bo.khongChu) veChuLogo(x);
  }
  function veChuLogo(x){
    if(S.tieuDe || S.phuDe){
      var y = S.viChu==='tren' ? H*0.16 : S.viChu==='giua' ? H*0.50 : H*0.82;
      x.save(); x.textAlign='center'; x.shadowColor='rgba(0,0,0,.6)'; x.shadowBlur=18; x.shadowOffsetY=3;
      x.fillStyle=S.mauChu;
      if(S.tieuDe){ x.font='800 '+S.cuChu+'px "Be Vietnam Pro",system-ui,sans-serif';
        wrapText(x, S.tieuDe, W/2, y, W*0.86, S.cuChu*1.14); }
      if(S.phuDe){ x.font='500 '+Math.round(S.cuChu*0.56)+'px "Be Vietnam Pro",system-ui,sans-serif';
        var yp = y + (S.tieuDe? S.cuChu*1.25 : 0);
        wrapText(x, S.phuDe, W/2, yp, W*0.82, S.cuChu*0.70); }
      x.restore();
    }
    if(S.logo){
      var pad=46, bw=250, bh=74, bx = S.viLogo==='trai'?pad:(W-bw-pad), by=pad;
      x.save(); x.globalAlpha=0.92;
      roundRect(x, bx, by, bw, bh, 16); x.fillStyle='rgba(10,20,40,.55)'; x.fill();
      x.fillStyle='#fff'; x.textAlign='left'; x.font='800 40px "Be Vietnam Pro",system-ui,sans-serif';
      x.fillText('GITA', bx+22, by+50);
      x.fillStyle='#8fb6ff'; x.font='700 24px "Be Vietnam Pro",system-ui,sans-serif';
      x.fillText('365', bx+140, by+49); x.restore();
    }
  }
  function wrapText(x,t,cx,cy,maxW,lh){
    var words=String(t).split(/\s+/), line='', lines=[];
    words.forEach(function(w){ var test=line?line+' '+w:w;
      if(x.measureText(test).width>maxW && line){ lines.push(line); line=w; } else line=test; });
    if(line) lines.push(line);
    var y0 = cy - (lines.length-1)*lh/2;
    lines.forEach(function(l,i){ x.fillText(l, cx, y0+i*lh); });
  }
  function roundRect(x,rx,ry,rw,rh,r){ x.beginPath();
    x.moveTo(rx+r,ry); x.arcTo(rx+rw,ry,rx+rw,ry+rh,r); x.arcTo(rx+rw,ry+rh,rx,ry+rh,r);
    x.arcTo(rx,ry+rh,rx,ry,r); x.arcTo(rx,ry,rx+rw,ry,r); x.closePath(); }

  function ve(){ veKhung(cv()); }
  G.bd = G.bd || {};
  G.bd.init = function(){ var c=cv(); if(!c) return; c.width=W; c.height=H; ve(); veStrip(); };

  /* ════════ ĐIỀU KHIỂN ════════ */
  G.bd.set = function(k,v){
    if(k==='fit'||k==='viChu'||k==='viLogo'||k==='chuyen'||k==='mauChu'||k==='tieuDe'||k==='phuDe') S[k]=v;
    else if(k==='flip'||k==='logo') S[k]=!S[k];
    else S[k]=+v;
    var el=document.getElementById('bdv-'+k); if(el) el.textContent = v;
    ve();
    if(k==='flip'||k==='logo'||k==='viChu'||k==='viLogo'||k==='fit'||k==='mauChu') dongBo();
  };
  function dongBo(){ /* cập nhật nút segment on/off mà không re-render cả màn */
    ['fit','viChu','viLogo','chuyen'].forEach(function(g){
      var box=document.getElementById('seg-'+g); if(!box) return;
      Array.prototype.forEach.call(box.querySelectorAll('button'), function(b){
        b.classList.toggle('on', b.getAttribute('data-v')===String(S[g])); });
    });
    var lg=document.getElementById('bd-logo-btn'); if(lg) lg.classList.toggle('on', S.logo);
    var fl=document.getElementById('bd-flip-btn'); if(fl) fl.classList.toggle('on', S.flip);
  }
  G.bd.preset = function(p){
    var P=PRESET[p]||PRESET['']; S.preset=p;
    S.sang=P.sang; S.tuong=P.tuong; S.bao=P.bao; S.am=P.am; S.vig=P.vig; S.sepia=P.sepia; S.gray=P.gray;
    ['sang','tuong','bao','am','vig'].forEach(function(k){
      var r=document.getElementById('bdr-'+k); if(r) r.value=S[k];
      var t=document.getElementById('bdv-'+k); if(t) t.textContent=S[k];
    });
    Array.prototype.forEach.call(document.querySelectorAll('.bd-ps'), function(b){
      b.classList.toggle('on', b.getAttribute('data-p')===p); });
    ve();
  };
  G.bd.reset = function(){ S.zoom=1;S.offX=0;S.offY=0;S.rot=0;S.flip=false; G.bd.preset(''); dongBo();
    ['zoom','rot'].forEach(function(k){var r=document.getElementById('bdr-'+k);if(r)r.value=S[k];var t=document.getElementById('bdv-'+k);if(t)t.textContent=S[k];});
    ve(); };

  /* ════════ NẠP VẬT LIỆU (tại máy) ════════ */
  G.bd.napAnh = function(inp){
    var fs=inp.files; if(!fs||!fs.length) return;
    Array.prototype.forEach.call(fs, function(f){
      if(!/^image\//.test(f.type)) return;
      createImageBitmap(f).then(function(bm){ S.anh.push(bm); S.hoat=S.anh.length-1; ve(); G.bd.dsAnh(); })
        .catch(function(){ U.toast('Không đọc được ảnh "'+f.name+'".','err'); });
    });
    inp.value='';
  };
  G.bd.chonAnh = function(i){ S.hoat=i; ve(); G.bd.dsAnh(); };
  G.bd.xoaAnh = function(i){ S.anh.splice(i,1); if(S.hoat>=S.anh.length) S.hoat=S.anh.length-1; ve(); G.bd.dsAnh(); };
  G.bd.dsAnh = function(){
    var box=document.getElementById('bd-ds-anh'); if(!box) return;
    if(!S.anh.length){ box.innerHTML='<p class="bd-tip">Chưa có ảnh. Nạp ảnh để bắt đầu dựng khung.</p>'; return; }
    box.innerHTML = S.anh.map(function(_,i){
      return '<div class="bd-chip" style="cursor:pointer'+(i===S.hoat?';border-color:var(--gita);color:var(--gita)':'')+'" '+
        'onclick="G.bd.chonAnh('+i+')">Ảnh '+(i+1)+' <b onclick="event.stopPropagation();G.bd.xoaAnh('+i+')" style="cursor:pointer;color:var(--gita-do-ink)">✕</b></div>';
    }).join('');
  };

  G.bd.napNhac = function(inp){ var f=inp.files[0]; if(!f) return;
    f.arrayBuffer().then(function(b){return ac().decodeAudioData(b);})
      .then(function(buf){ S.nhac=buf; S.nhacTen=f.name;
        var el=document.getElementById('bd-nhac-ten'); if(el) el.textContent=f.name+' · '+buf.duration.toFixed(1)+'s';
        U.toast('Đã nạp nhạc nền.','ok'); })
      .catch(function(){ U.toast('Không đọc được nhạc.','err'); }); inp.value=''; };
  G.bd.napGiong = function(inp){ var f=inp.files[0]; if(!f) return;
    f.arrayBuffer().then(function(b){return ac().decodeAudioData(b);})
      .then(function(buf){ S.giong=buf; S.giongTen=f.name;
        var el=document.getElementById('bd-giong-ten'); if(el) el.textContent=f.name+' · '+buf.duration.toFixed(1)+'s';
        U.toast('Đã nạp giọng đọc.','ok'); })
      .catch(function(){ U.toast('Không đọc được giọng.','err'); }); inp.value=''; };

  /* ════════ ÂM THANH — nghe thử bản phối ════════ */
  function dungTieng(){ nut.forEach(function(n){try{n.stop();}catch(e){}}); nut=[]; }
  function xepTieng(dich, dur){
    var a=ac(), t0=a.currentTime+0.06;
    [['nhac',S.amNhac],['giong',S.amGiong]].forEach(function(p){
      var buf=S[p[0]]; if(!buf) return;
      var src=a.createBufferSource(), g=a.createGain();
      src.buffer=buf; if(p[0]==='nhac') src.loop=true;
      g.gain.value=p[1];
      if(S.fadeIn){ g.gain.setValueAtTime(0.0001,t0); g.gain.exponentialRampToValueAtTime(Math.max(p[1],0.001),t0+0.8); }
      if(S.fadeOut && dur){ g.gain.setValueAtTime(Math.max(p[1],0.001),t0+Math.max(dur-0.9,0.01)); g.gain.exponentialRampToValueAtTime(0.0001,t0+dur); }
      src.connect(g); g.connect(dich); src.start(t0); nut.push(src);
    });
  }
  G.bd.ngheAm = function(){
    if(!S.nhac && !S.giong){ U.toast('Chưa có nhạc hay giọng để nghe.','err'); return; }
    ac().resume(); dungTieng();
    var dur = Math.max(S.giong?S.giong.duration:0, S.nhac?Math.min(S.nhac.duration,20):0, 3);
    xepTieng(ac().destination, dur);
    U.toast('Đang nghe thử bản phối…','ok');
  };
  G.bd.dungAm = function(){ dungTieng(); };

  /* ════════ GHÉP PHIM (slideshow) ════════ */
  G.bd.themKhung = function(){
    var url = cv().toDataURL('image/png');
    var im = new Image(); im.src=url;
    S.khung.push({url:url, giay:S.moiKhung, img:im}); veStrip();
    U.toast('Đã thêm khung '+S.khung.length+' vào phim.','ok');
  };
  G.bd.xoaKhung = function(i){ S.khung.splice(i,1); veStrip(); };
  function veStrip(){
    var box=document.getElementById('bd-strip'); if(!box) return;
    if(!S.khung.length){ box.innerHTML='<p class="bd-tip">Chưa có khung nào. Dựng một khung rồi bấm “Thêm khung vào phim”.</p>'; return; }
    box.innerHTML = S.khung.map(function(k,i){
      return '<div style="position:relative;flex:none"><img class="bd-frame" src="'+k.url+'" title="Khung '+(i+1)+'">'+
        '<b onclick="G.bd.xoaKhung('+i+')" style="position:absolute;top:2px;right:2px;background:#000a;color:#fff;border-radius:50%;width:18px;height:18px;display:grid;place-items:center;font-size:11px;cursor:pointer">✕</b>'+
        '<span style="position:absolute;bottom:2px;left:2px;background:#000a;color:#fff;font-size:9px;padding:1px 4px;border-radius:4px">'+(i+1)+'</span></div>';
    }).join('');
  }
  function tongGiay(){ return S.khung.reduce(function(s,k){return s+(+k.giay||0);},0); }

  G.bd.xemPhim = function(){
    if(!S.khung.length){ U.toast('Chưa có khung nào để chiếu.','err'); return; }
    var c=cv(), x=c.getContext('2d'); choi=true;
    ac().resume(); dungTieng(); xepTieng(ac().destination, tongGiay());
    var t0=performance.now();
    function nhip(now){
      if(!choi) return;
      var t=(now-t0)/1000, acc=0, idx=0, inner=0;
      for(var i=0;i<S.khung.length;i++){ var g=+S.khung[i].giay||0.1; if(t<acc+g){idx=i;inner=(t-acc)/g;break;} acc+=g; idx=i; inner=1; }
      if(t>=tongGiay()){ choi=false; dungTieng(); veStrip(); return; }
      var k=S.khung[idx];
      if(k.img && k.img.complete){ x.drawImage(k.img,0,0,W,H);
        if(S.chuyen==='mo' && inner<0.18){ x.save(); x.globalAlpha=1-inner/0.18; x.fillStyle='#000'; x.fillRect(0,0,W,H); x.restore(); } }
      raf=requestAnimationFrame(nhip);
    }
    raf=requestAnimationFrame(nhip);
  };
  G.bd.dungPhim = function(){ choi=false; cancelAnimationFrame(raf); dungTieng(); ve(); };

  /* ════════ XUẤT ════════ */
  G.bd.xuatPNG = function(){
    if(!G.duocLuuPhim()) return;
    try{ cv().toBlob(function(b){
        if(!b){ U.toast('Không xuất được ảnh.','err'); return; }
        G.luuTepPhim(b, 'gita-khung-'+Date.now()+'.png', 'image/png', '.png', 'khung'); }, 'image/png'); }
    catch(e){ U.toast('Không xuất được ảnh: '+(e&&e.message),'err'); }
  };
  G.bd.xuatVideo = function(){
    if(!S.khung.length){ U.toast('Cần ít nhất một khung để xuất phim.','err'); return; }
    if(!G.duocLuuPhim()) return;
    /* N9 (soát 10/2026): ghi dừng ở tổng giây các khung, nên giọng dài hơn
       phim bị CẮT mất mà không báo (đo được: giọng 8s, phim 4,45s). Hỏi kéo
       dài khung cuối cho đủ giọng + nửa giây. */
    var thieuGiay = S.giong ? (S.giong.duration + 0.5 - tongGiay()) : 0;
    if(thieuGiay > 0.05){
      var cuoi = S.khung[S.khung.length-1];
      if(confirm('Giọng đọc dài '+(Math.round(S.giong.duration*10)/10)+' giây nhưng phim chỉ '+(Math.round(tongGiay()*10)/10)+' giây — phần cuối giọng sẽ bị cắt. Kéo dài khung cuối thêm '+(Math.round(thieuGiay*10)/10)+' giây cho đủ giọng?')){
        cuoi.giay = Math.round(((+cuoi.giay||0) + thieuGiay)*10)/10; veStrip();
      }
    }
    var c=cv();
    if(!c.captureStream || typeof MediaRecorder==='undefined'){
      U.toast('Trình duyệt này chưa hỗ trợ xuất video. Dùng Chrome/Edge mới, hoặc xuất từng khung PNG.','err'); return; }
    try{
      var vs=c.captureStream(30), dest=ac().createMediaStreamDestination();
      var tracks=vs.getVideoTracks().concat(dest.stream.getAudioTracks());
      var st=new MediaStream(tracks);
      var mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')?'video/webm;codecs=vp9':'video/webm';
      var mr=new MediaRecorder(st,{mimeType:mime}), manh=[];
      ghiMR=mr;
      mr.ondataavailable=function(e){ if(e.data.size) manh.push(e.data); };
      mr.onstop=function(){
        ghiMR=null;
        G.luuTepPhim(new Blob(manh,{type:mime}), 'gita-phim-'+Date.now()+'.webm', 'video/webm', '.webm', 'phim');
      };
      /* chạy slideshow + ghi đồng thời */
      choi=true; var x=c.getContext('2d'), t0=performance.now();
      dungTieng(); xepTieng(dest, tongGiay());
      mr.start();
      U.toast('Đang dựng video… giữ màn hình tới khi xong.','ok');
      function nhip(now){
        if(!choi){ return; }
        var t=(now-t0)/1000, acc=0, idx=0;
        for(var i=0;i<S.khung.length;i++){ var g=+S.khung[i].giay||0.1; if(t<acc+g){idx=i;break;} acc+=g; idx=i; }
        if(t>=tongGiay()){ choi=false; try{mr.stop();}catch(e){} dungTieng(); ve(); veStrip(); return; }
        var k=S.khung[idx]; if(k.img&&k.img.complete) x.drawImage(k.img,0,0,W,H);
        raf=requestAnimationFrame(nhip);
      }
      raf=requestAnimationFrame(nhip);
    }catch(e){ U.toast('Không xuất được video: '+(e&&e.message),'err'); }
  };

  /* ════════ GIAO DIỆN ════════ */
  function slider(k,lbl,mn,mx,unit){
    return '<div class="bd-row"><span class="bd-lbl">'+h(lbl)+'</span>'+
      '<input type="range" id="bdr-'+k+'" min="'+mn+'" max="'+mx+'" value="'+S[k]+'" oninput="G.bd.set(\''+k+'\',this.value)">'+
      '<span class="bd-val"><span id="bdv-'+k+'">'+S[k]+'</span>'+(unit||'')+'</span></div>';
  }
  function seg(k,opts){
    return '<div class="bd-seg" id="seg-'+k+'">'+ opts.map(function(o){
      return '<button data-v="'+o[0]+'" class="'+(String(S[k])===o[0]?'on':'')+'" onclick="G.bd.set(\''+k+'\',\''+o[0]+'\')">'+h(o[1])+'</button>';
    }).join('') +'</div>';
  }

  G.VIEWS['ban-dung'] = function(){
    if(!(typeof G.can==='function' && G.can('qt_trang')))
      return U.lockCard('Bàn dựng Studio mở cho Super Admin / Admin. Đăng nhập đúng vai để xem.');

    var o = U.ph({ eyebrow:'XƯỞNG PHIM · BÀN DỰNG TẠI MÁY', ic:'sparkle', grad:1,
      t:'Bàn dựng GITA Studio',
      lead:'Biên tập thật ngay trên thiết bị: nạp & ghép ảnh, chỉnh sáng·màu·hiệu ứng, thêm chữ & logo, ghép nhạc + giọng, rồi ghép các khung thành phim 9:16 và xuất ra. Không gửi ảnh·giọng·dữ liệu ra ngoài.' });

    o += '<div class="row mb" style="gap:8px;flex-wrap:wrap">'+
      '<button class="btn ghost sm" data-v="studio-he">'+ic('arrow','w-3 h-3')+'Hệ điều hành xưởng</button>'+
      '<button class="btn ghost sm" data-v="lam-phim-10">'+ic('sparkle','w-3 h-3')+'Chương trình 10 bước</button>'+
      (G.allowed && G.allowed('studio') ? '<button class="btn ghost sm" data-v="studio">'+ic('spark','w-3 h-3')+'Xưởng dựng video (gói nghề)</button>' : '')+
      '</div>';

    o += '<div class="bd-wrap">';

    /* CỘT TRÁI · màn xem + xuất */
    o += '<div class="bd-stage">'+
      '<canvas id="bd-cv" class="bd-cv" width="'+W+'" height="'+H+'"></canvas>'+
      '<button class="btn sm" onclick="G.bd.xuatPNG()">'+ic('arrow','w-3 h-3')+'Xuất khung ảnh (PNG)</button>'+
      '<button class="btn ghost sm" onclick="G.bd.reset()">'+ic('orbit','w-3 h-3')+'Đặt lại chỉnh sửa</button>'+
    '</div>';

    /* CỘT PHẢI · bảng điều khiển 6 nhóm (tab CSS) */
    o += '<div class="bd-ctrl">'+
      '<input type="radio" name="bdTab" id="bd-anh" class="bd-radio" checked>'+
      '<input type="radio" name="bdTab" id="bd-mau" class="bd-radio">'+
      '<input type="radio" name="bdTab" id="bd-ht" class="bd-radio">'+
      '<input type="radio" name="bdTab" id="bd-chu" class="bd-radio">'+
      '<input type="radio" name="bdTab" id="bd-am" class="bd-radio">'+
      '<input type="radio" name="bdTab" id="bd-phim" class="bd-radio">'+
      '<div class="bd-tabbar">'+
        '<label for="bd-anh">'+ic('grid','w-3 h-3')+'Ảnh & khung</label>'+
        '<label for="bd-mau">'+ic('pulse','w-3 h-3')+'Sáng & màu</label>'+
        '<label for="bd-ht">'+ic('spark','w-3 h-3')+'Hiệu ứng</label>'+
        '<label for="bd-chu">'+ic('quote','w-3 h-3')+'Chữ & logo</label>'+
        '<label for="bd-am">'+ic('heart','w-3 h-3')+'Âm thanh</label>'+
        '<label for="bd-phim">'+ic('sparkle','w-3 h-3')+'Ghép phim & xuất</label>'+
      '</div>';

    /* 1 · Ảnh & khung */
    o += '<div id="bd-p-anh" class="bd-pan">'+
      '<label class="bd-file">'+ic('arrow','w-3 h-3')+'Nạp ảnh (có thể nhiều)<input type="file" accept="image/*" multiple onchange="G.bd.napAnh(this)"></label>'+
      '<div class="bd-chips" id="bd-ds-anh"><p class="bd-tip">Chưa có ảnh. Nạp ảnh để bắt đầu dựng khung.</p></div>'+
      '<div class="bd-field"><span>Cách lấp khung 9:16</span>'+seg('fit',[['cover','Lấp đầy'],['contain','Vừa khít']])+'</div>'+
      slider('zoom','Phóng to',1,4)+
      slider('rot','Xoay (độ)',-45,45)+
      '<div class="bd-field"><span>Lật ngang</span><div class="bd-seg"><button id="bd-flip-btn" class="'+(S.flip?'on':'')+'" onclick="G.bd.set(\'flip\')">Lật trái–phải</button></div></div>'+
    '</div>';

    /* 2 · Sáng & màu */
    o += '<div id="bd-p-mau" class="bd-pan">'+
      slider('sang','Sáng',20,200,'%')+ slider('tuong','Tương phản',20,200,'%')+
      slider('bao','Bão hoà',0,200,'%')+ slider('am','Ấm / Lạnh',-50,50)+
      slider('mo','Mờ mềm',0,12,'px')+ slider('vig','Tối góc',0,100)+
      '<p class="bd-tip">Kéo "Ấm / Lạnh" sang phải cho tông ấm (nắng), sang trái cho tông lạnh (đêm).</p>'+
    '</div>';

    /* 3 · Hiệu ứng */
    o += '<div id="bd-p-ht" class="bd-pan">'+
      '<p class="bd-tip">Bấm một hiệu ứng để áp bộ lọc màu điện ảnh. Sau đó vẫn tinh chỉnh ở tab “Sáng & màu”.</p>'+
      '<div class="bd-presets">'+ Object.keys(PRESET).map(function(p){
        return '<button class="bd-ps'+(S.preset===p?' on':'')+'" data-p="'+p+'" onclick="G.bd.preset(\''+p+'\')">'+h(PRESET[p].ten)+'</button>';
      }).join('') +'</div>'+
    '</div>';

    /* 4 · Chữ & logo */
    o += '<div id="bd-p-chu" class="bd-pan">'+
      '<div class="bd-field"><span>Tiêu đề trên phim</span><input type="text" value="'+h(S.tieuDe)+'" oninput="G.bd.set(\'tieuDe\',this.value)" placeholder="VD: Gia đình thịnh vượng"></div>'+
      '<div class="bd-field"><span>Phụ đề / dòng nhỏ</span><input type="text" value="'+h(S.phuDe)+'" oninput="G.bd.set(\'phuDe\',this.value)" placeholder="VD: Hành trình 5 tầng cùng GITA"></div>'+
      slider('cuChu','Cỡ chữ',32,160)+
      '<div class="bd-field"><span>Vị trí chữ</span>'+seg('viChu',[['tren','Trên'],['giua','Giữa'],['duoi','Dưới']])+'</div>'+
      '<div class="bd-field"><span>Màu chữ</span>'+seg('mauChu',[['#ffffff','Trắng'],['#ffd34d','Vàng'],['#111111','Đen'],['#8fb6ff','Xanh']])+'</div>'+
      '<div class="bd-field"><span>Logo GITA 365</span><div class="bd-seg"><button id="bd-logo-btn" class="'+(S.logo?'on':'')+'" onclick="G.bd.set(\'logo\')">Hiện logo</button></div>'+seg('viLogo',[['phai','Góc phải'],['trai','Góc trái']])+'</div>'+
    '</div>';

    /* 5 · Âm thanh */
    o += '<div id="bd-p-am" class="bd-pan">'+
      '<label class="bd-file">'+ic('arrow','w-3 h-3')+'Nạp nhạc nền<input type="file" accept="audio/*" onchange="G.bd.napNhac(this)"></label> '+
      '<span class="bd-tip" id="bd-nhac-ten">'+(S.nhacTen?h(S.nhacTen):'chưa có nhạc')+'</span>'+
      '<div style="height:8px"></div>'+
      '<label class="bd-file">'+ic('arrow','w-3 h-3')+'Nạp giọng đọc<input type="file" accept="audio/*" onchange="G.bd.napGiong(this)"></label> '+
      '<span class="bd-tip" id="bd-giong-ten">'+(S.giongTen?h(S.giongTen):'chưa có giọng')+'</span>'+
      slider('amNhac','Âm nhạc',0,1)+ slider('amGiong','Âm giọng',0,1)+
      '<div class="bd-field"><span>Vuốt (fade)</span><div class="bd-seg">'+
        '<button class="'+(S.fadeIn?'on':'')+'" onclick="S.__x=0;window.G.bdS.fadeIn=!window.G.bdS.fadeIn;this.classList.toggle(\'on\')">Mở nhẹ đầu</button>'+
        '<button class="'+(S.fadeOut?'on':'')+'" onclick="window.G.bdS.fadeOut=!window.G.bdS.fadeOut;this.classList.toggle(\'on\')">Tắt nhẹ cuối</button>'+
      '</div></div>'+
      '<div class="row" style="gap:8px;margin-top:8px"><button class="btn sm" onclick="G.bd.ngheAm()">'+ic('spark','w-3 h-3')+'Nghe thử</button>'+
        '<button class="btn ghost sm" onclick="G.bd.dungAm()">Dừng</button></div>'+
      '<p class="bd-tip">Nhạc & giọng xử lý tại máy, không gửi đi đâu.</p>'+
    '</div>';

    /* 6 · Ghép phim & xuất */
    o += '<div id="bd-p-phim" class="bd-pan">'+
      '<div class="bd-field"><span>Thời lượng mỗi khung (giây)</span>'+
        '<input type="range" id="bdr-moiKhung" min="1" max="8" step="0.5" value="'+S.moiKhung+'" oninput="window.G.bdS.moiKhung=+this.value;document.getElementById(\'bdv-moiKhung\').textContent=this.value"> '+
        '<span class="bd-val"><span id="bdv-moiKhung">'+S.moiKhung+'</span>s</span></div>'+
      '<div class="bd-field"><span>Chuyển cảnh</span>'+seg('chuyen',[['mo','Mờ dần'],['cat','Cắt thẳng']])+'</div>'+
      '<button class="btn sm" onclick="G.bd.themKhung()">'+ic('check','w-3 h-3')+'Thêm khung hiện tại vào phim</button>'+
      '<div class="bd-strip" id="bd-strip" style="margin-top:10px"><p class="bd-tip">Chưa có khung nào. Dựng một khung rồi bấm “Thêm khung vào phim”.</p></div>'+
      '<div class="row" style="gap:8px;margin-top:6px;flex-wrap:wrap">'+
        '<button class="btn sm" onclick="G.bd.xemPhim()">'+ic('spark','w-3 h-3')+'Xem thử phim</button>'+
        '<button class="btn ghost sm" onclick="G.bd.dungPhim()">Dừng</button>'+
        '<button class="btn" onclick="G.bd.xuatVideo()">'+ic('arrow','w-3 h-3')+'Xuất video (.webm)</button>'+
      '</div>'+
      '<p class="bd-tip">Phim = các khung đã dựng + nhạc/giọng đã nạp. Xuất video chạy ngay trên máy (cần Chrome/Edge mới). Mỗi khung thêm là ảnh PNG của màn hiện tại — chỉnh khung trước, rồi “Thêm”.</p>'+
    '</div>';

    o += '</div></div>'; /* /bd-ctrl /bd-wrap */

    o += '<p class="tiny muted" style="margin-top:14px">'+ic('shield','w-3 h-3')+' Toàn bộ biên tập chạy trong trình duyệt trên máy anh/chị — ảnh, giọng, nhạc KHÔNG tải lên máy chủ hay dịch vụ ngoài. Màn này độc lập, không đụng xưởng dựng video gói nghề.</p>';

    setTimeout(function(){ try{ G.bd.init(); G.bd.dsAnh(); }catch(e){} }, 0);
    return o;
  };
})();
