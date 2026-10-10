/* ═══════════════════════════════════════════════════════════════
   GITA 365 — HỆ ĐIỀU HÀNH COACH · THƯ VIỆN NLP × GITA · CHUẨN ICF (coach-nlp)

   Một chỗ cho Coach học và tra nhanh "làm thế nào" — đọc thẳng dữ liệu
   chuẩn (data-coach-v20.js), không viết bản thứ hai:

     Kỹ thuật           18 thẻ: NLP (công cụ thực hành, bằng chứng HẠN CHẾ)
                        và khoa học hành vi (bằng chứng tốt). Lọc theo nhóm,
                        trụ G–I–T–A, năng lực ICF, pha lộ trình; ghim thẻ
                        (sổ.ktGhim); in thẻ; gửi sang màn Thiết kế bài.
     Quy trình coach    bảy bước nghề, khớp tám năng lực ICF — đọc 5 phút.
     Chuỗi GITA         tám bước hành động (G.CO_CHUOI) × cấp độ Dilts × trụ.
     Năng lực ICF       tám năng lực theo miền, dấu hiệu quan sát được, kỹ
                        thuật luyện và tiêu chí chấm đo nó (G.CO_TC_ICF).
     Lộ trình bền vững  năm pha (G.CO_PHA): mục đích, cổng, KPI, kỹ thuật.

   GITA bám khung năng lực ICF để dạy và chấm — đây KHÔNG phải chứng nhận
   ICF. Hình minh hoạ do G.CO.v20.ve vẽ. Mở cho pro_coach. Không đụng máy
   chủ · giấy phép · mã hoá.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic, CO = G.CO;
  var VIEW = 'coach-nlp';
  function icI(n){ return '<span style="display:inline-flex;vertical-align:-2px">'+ic(n,'w-3 h-3')+'</span>'; }
  function V(){ return (CO && CO.v20) || null; }
  function KT(){ return G.CO_KT || []; }
  function kt(ma){ return KT().filter(function(k){ return k.ma===ma; })[0] || null; }
  function icf(ma){ return (G.CO_ICF||[]).filter(function(c){ return c.ma===ma; })[0] || null; }
  function gru(k){ return (G.GITA||[]).filter(function(x){ return x.k===k; })[0] || null; }
  function mauTru(k){ var g = gru(k); return g ? g.c : '#73849F'; }
  function tenTru(k){ var g = gru(k); return g ? g.short : k; }
  function pha(so){ return (G.CO_PHA||[]).filter(function(p){ return p.so===so; })[0] || null; }
  function ghim(){ var s = CO.st(); if(!Array.isArray(s.ktGhim)) s.ktGhim = []; return s.ktGhim; }
  function daGhim(ma){ return ghim().indexOf(ma) >= 0; }
  function boDau(t){ var v = V(); if(v && v.boDau) return v.boDau(t); return String(t||'').toLowerCase(); }
  function veGiu(){ var y = window.pageYOffset || 0; CO.luu(); window.scrollTo(0, y); }
  var MAU_NHOM = { NLP:CO.MAU_DEN.VANG, KH:CO.MAU_DEN.XANH };
  var TEN_NHOM = { NLP:'NLP', KH:'Khoa học hành vi' };
  var MAU7 = ['#185AB4','#2A72C6','#5140B4','#0B6675','#0B7350','#B4720F','#BE0E16'];
  function hinh(k, lon){
    var v = V(); if(!v || !v.ve) return '';
    return '<div style="max-width:'+(lon?'420px':'100%')+';margin:'+(lon?'0 auto':'0')+'">'+v.ve(k.minh, v.nhanHinh ? v.nhanHinh(k) : [], mauTru((k.tru||[])[0]))+'</div>';
  }
  function badge(k){
    var tot = k.nhom==='KH';
    return '<span class="co-tag" style="color:'+MAU_NHOM[k.nhom]+';background:color-mix(in srgb,'+MAU_NHOM[k.nhom]+' 14%,transparent)">'+(tot?'bằng chứng tốt':'bằng chứng hạn chế')+'</span>';
  }
  function chipKT(ma){
    var k = kt(ma); if(!k) return '<span class="chip">'+h(ma)+'</span>';
    return '<button class="chip" data-co="nlp-mo" data-ma="'+h(ma)+'" title="'+h(k.ten)+'" style="color:'+MAU_NHOM[k.nhom]+';border-color:color-mix(in srgb,'+MAU_NHOM[k.nhom]+' 40%,transparent)">'+h(k.ten)+'</button>';
  }
  function chipICF(ma){ var c = icf(ma); return '<span class="chip" title="'+h(c?c.ten:ma)+'">'+h(ma)+(c?' · '+h(c.ten):'')+'</span>'; }
  function chipTru(k){ return U.chip(k+' · '+tenTru(k), mauTru(k)); }

  /* ═════════ VIEW ═════════ */
  G.VIEWS[VIEW] = function(){
    var k = CO.cua('pro_coach', 'Thư viện NLP × GITA'); if(k) return k;
    CO.napMau();
    var cur = CO.tab(VIEW, 'kt'), ds = KT();
    var nNLP = ds.filter(function(x){ return x.nhom==='NLP'; }).length;
    var o = '<div class="co-hang mb"><button class="btn ghost sm" data-v="coach-he">← Hệ điều hành Coach</button></div>';
    o += U.ph({ eyebrow:'COACH · NLP × GITA · ICF', ic:'brain', grad:1, t:'Thư viện NLP × GITA · chuẩn coach quốc tế',
      lead:'Kỹ thuật NLP và khoa học hành vi đặt vào bốn trụ G–I–T–A, quy trình coach bảy bước theo khung năng lực ICF, chuỗi hành động GITA và năm pha của thay đổi bền vững — viết cho Coach mới đọc hiểu trong năm phút.' });
    o += CO.banMau();
    if(!ds.length) return o + '<div class="card pad-sm muted">Chưa nạp được dữ liệu kỹ thuật (data-coach-v20.js).</div>';
    o += '<div class="grid g4 mb">'+
      U.stat({ k:'Kỹ thuật', v:String(ds.length), d:'NLP '+nNLP+' · khoa học hành vi '+(ds.length-nNLP) })+
      U.stat({ k:'Năng lực ICF', v:String((G.CO_ICF||[]).length), d:'khung năng lực cốt lõi dùng để dạy & chấm' })+
      U.stat({ k:'Bước chuỗi GITA', v:String((G.CO_CHUOI||[]).length), d:'từ hiện trạng tới đo & củng cố' })+
      U.stat({ k:'Kỹ thuật đã ghim', v:String(ghim().length), d:ghim().length ? 'thẻ tra nhanh của tôi' : 'bấm Ghim trên thẻ để giữ ở đầu' })+'</div>';
    o += CO.tabs(VIEW, [['kt','Kỹ thuật','book'],['qt','Quy trình coach chuẩn','list'],['chuoi','Chuỗi hành động GITA','orbit'],['icf','Năng lực ICF','shield'],['pha','Lộ trình bền vững','chart']], cur);
    if(cur==='qt') o += veQuyTrinh();
    else if(cur==='chuoi') o += veChuoi();
    else if(cur==='icf') o += veICF();
    else if(cur==='pha') o += vePha();
    else o += veKyThuat();
    return o;
  };

  /* ═════════ 1 · KỸ THUẬT ═════════ */
  function chuoiTim(k){ return boDau([k.ten,k.goc,k.muc,k.ma,k.khiNao].join(' ')); }
  function locDS(L){
    var q = boDau(L.q||'').trim();
    return KT().filter(function(k){
      if(L.nhom && k.nhom!==L.nhom) return false;
      if(L.tru && (k.tru||[]).indexOf(L.tru) < 0) return false;
      if(L.icf && (k.icf||[]).indexOf(L.icf) < 0) return false;
      if(L.pha && (k.pha||[]).indexOf(Number(L.pha)) < 0) return false;
      if(L.ghim && !daGhim(k.ma)) return false;
      if(q && chuoiTim(k).indexOf(q) < 0) return false;
      return true;
    }).sort(function(a,b){ return (daGhim(b.ma)?1:0) - (daGhim(a.ma)?1:0); });
  }
  function veKyThuat(){
    var s = CO.st(), L = s.nlpLoc || {}, ds = locDS(L);
    var o = '<div class="co-cb mb"><div style="--m:'+CO.MAU_DEN.VANG+'">'+icI('alert')+'<span><b>Nói thẳng về bằng chứng.</b> Kỹ thuật NLP là công cụ thực hành được dùng rộng rãi trong coaching, nhưng bằng chứng khoa học còn hạn chế. '+
      'GITA dùng chúng như cách đặt câu hỏi và tổ chức trải nghiệm, luôn đi cặp với phương pháp có bằng chứng tốt (khoa học hành vi), và <b>không bao giờ</b> dùng để chẩn đoán hay hứa kết quả.</span></div></div>';
    o += '<div class="card pad-sm mb"><div class="co-form">'+
      CO.o2('Tìm kỹ thuật', '<input class="inp" id="nlp-q" type="search" maxlength="60" placeholder="VD: mục tiêu, thói quen, niềm tin…" value="'+h(L.q||'')+'">')+
      CO.o2('Nhóm', CO.chon('nlp-nhom', [['','Mọi nhóm'],['NLP','NLP'],['KH','Khoa học hành vi']], L.nhom||'', ' data-co-ch="nlp-loc"'))+
      CO.o2('Năng lực ICF', CO.chon('nlp-icf', [['','Mọi năng lực']].concat((G.CO_ICF||[]).map(function(c){ return [c.ma, c.ma+' · '+c.ten]; })), L.icf||'', ' data-co-ch="nlp-loc"'))+
      CO.o2('Pha lộ trình', CO.chon('nlp-pha', [['','Mọi pha']].concat((G.CO_PHA||[]).map(function(p){ return [p.so, 'P'+p.so+' · '+p.ten]; })), L.pha||'', ' data-co-ch="nlp-loc"'))+
    '</div>'+
    '<div class="co-hang mt" role="group" aria-label="Lọc theo trụ GITA"><span class="tiny muted">Trụ</span>'+
      '<button class="chip'+(!L.tru?' on':'')+'" aria-pressed="'+(!L.tru)+'" data-co="nlp-tru" data-gt="">Mọi trụ</button>'+
      (G.GITA||[]).map(function(g){ var on = L.tru===g.k;
        return '<button class="chip'+(on?' on':'')+'" aria-pressed="'+on+'" data-co="nlp-tru" data-gt="'+h(g.k)+'" style="color:'+h(g.c)+';border-color:'+h(g.c)+'55'+(on?';background:'+h(g.c)+'22':'')+'">'+h(g.k+' · '+g.short)+'</button>'; }).join('')+
      '<label class="sm co-hang" style="gap:6px;margin-left:auto"><input type="checkbox" id="nlp-ghim" data-co-ch="nlp-loc"'+(L.ghim?' checked':'')+'> Chỉ thẻ đã ghim</label>'+
    '</div></div>';
    o += '<div class="co-hang mb"><span class="sm co-grow" id="nlp-dem" style="min-width:160px">'+ds.length+'/'+KT().length+' kỹ thuật</span>'+
      '<button class="btn ghost sm" id="nlp-bo-loc" data-co="nlp-xoa-loc"'+((L.nhom||L.tru||L.icf||L.pha||L.ghim||L.q) ? '' : ' style="display:none"')+'>Bỏ lọc</button></div>';
    if(!ds.length) return o + '<div class="card pad-sm muted sm">Không có kỹ thuật nào khớp bộ lọc. Bấm "Bỏ lọc" để xem lại tất cả.</div>';
    o += '<div class="co-luoi" id="nlp-luoi">'+ ds.map(function(k){
      var c = mauTru((k.tru||[])[0]);
      return '<div class="co-the nhan" data-nlp-tim="'+h(chuoiTim(k))+'" style="--c:'+h(c)+';border-top:4px solid '+h(c)+'">'+
        '<div class="co-hang" style="gap:6px">'+U.chip(TEN_NHOM[k.nhom]||k.nhom, MAU_NHOM[k.nhom])+(k.tru||[]).map(function(t){ return U.chip(t, mauTru(t)); }).join('')+
          (k.icf||[]).map(function(x){ return '<span class="co-tag">'+h(x)+'</span>'; }).join('')+(daGhim(k.ma)?'<span class="co-tag" style="margin-left:auto">'+icI('star')+' đã ghim</span>':'')+'</div>'+
        '<h2>'+h(k.ten)+'</h2><div class="tiny muted" style="margin-top:-4px"><i>'+h(k.goc||'')+'</i></div>'+
        hinh(k, false)+
        '<p class="sm" style="margin:0;line-height:1.5">'+h(k.muc||'')+'</p>'+
        '<div class="co-hang" style="margin-top:auto;padding-top:6px">'+badge(k)+'<span class="co-grow"></span>'+
          '<button class="btn ghost sm" data-co="nlp-ghim-bat" data-ma="'+h(k.ma)+'" aria-pressed="'+daGhim(k.ma)+'">'+icI('star')+(daGhim(k.ma)?' Bỏ ghim':' Ghim')+'</button>'+
          '<button class="btn sm" data-co="nlp-mo" data-ma="'+h(k.ma)+'">Xem cách dùng '+ic('arrow','w-3 h-3')+'</button></div>'+
      '</div>'; }).join('') +'</div>';
    return o;
  }
  /* Tìm sống: lọc thẻ ngay trên trang, không vẽ lại (giữ con trỏ trong ô tìm) */
  var henTim = null;
  document.addEventListener('input', function(e){
    if(!e.target || e.target.id !== 'nlp-q') return;
    clearTimeout(henTim);
    henTim = setTimeout(function(){
      var q = boDau(e.target.value||'').trim(), s = CO.st(); s.nlpLoc = s.nlpLoc || {}; s.nlpLoc.q = e.target.value || '';
      var n = 0, the = document.querySelectorAll('#nlp-luoi [data-nlp-tim]');
      for(var i=0;i<the.length;i++){ var ok = !q || the[i].getAttribute('data-nlp-tim').indexOf(q) >= 0; the[i].style.display = ok ? '' : 'none'; if(ok) n++; }
      var d = document.getElementById('nlp-dem'); if(d && the.length) d.textContent = n+'/'+KT().length+' kỹ thuật';
      var L = s.nlpLoc, bo = document.getElementById('nlp-bo-loc'); if(bo) bo.style.display = (L.nhom||L.tru||L.icf||L.pha||L.ghim||q) ? '' : 'none';
      if(G.save) G.save();
    }, 200);
  });
  CO.on('nlp-loc', function(){
    var s = CO.st(), L = s.nlpLoc = s.nlpLoc || {};
    L.nhom = CO.o('nlp-nhom'); L.icf = CO.o('nlp-icf'); L.pha = CO.o('nlp-pha'); L.ghim = CO.o('nlp-ghim')===true; L.q = CO.o('nlp-q');
    veGiu();
  });
  CO.on('nlp-tru', function(el){ var s = CO.st(); s.nlpLoc = s.nlpLoc || {}; s.nlpLoc.q = CO.o('nlp-q'); s.nlpLoc.tru = el.getAttribute('data-gt'); veGiu(); });
  CO.on('nlp-xoa-loc', function(){ CO.st().nlpLoc = {}; veGiu(); });
  function batGhim(ma){
    var g = ghim(), i = g.indexOf(ma), k = kt(ma); if(!k) return false;
    if(i >= 0) g.splice(i, 1); else g.push(ma);
    U.toast(i >= 0 ? 'Đã bỏ ghim "'+k.ten+'".' : 'Đã ghim "'+k.ten+'" — thẻ đứng đầu danh sách.', 'ok');
    return i < 0;
  }
  CO.on('nlp-ghim-bat', function(el){ batGhim(el.getAttribute('data-ma')); veGiu(); });

  /* Thẻ chi tiết */
  function chiTiet(k){
    return '<div class="tiny muted">'+h(k.ma)+' · '+h(TEN_NHOM[k.nhom]||k.nhom)+'</div>'+
      '<h2 style="margin:2px 0 2px;font-size:21px;padding-right:36px">'+h(k.ten)+'</h2><div class="sm muted"><i>'+h(k.goc||'')+'</i></div>'+
      '<div class="co-hang mt" style="gap:6px">'+badge(k)+(k.tru||[]).map(chipTru).join('')+'</div>'+
      '<div class="mt">'+hinh(k, true)+'</div>'+
      '<p style="margin:10px 0;line-height:1.55"><b>Để làm gì.</b> '+h(k.muc||'')+'</p>'+
      '<div class="grid g2" style="gap:10px">'+
        '<div class="co-cb"><div style="--m:'+CO.MAU_DEN.XANH+'">'+icI('check')+'<span><b>Khi dùng.</b> '+h(k.khiNao||'—')+'</span></div></div>'+
        '<div class="co-cb"><div style="--m:'+CO.MAU_DEN.DO+'">'+icI('x')+'<span><b>Khi KHÔNG dùng.</b> '+h(k.khongDung||'—')+'</span></div></div>'+
      '</div>'+
      '<div class="tiny muted mt2">CÁC BƯỚC</div>'+
      '<ol class="co-nlp-buoc">'+(k.buoc||[]).map(function(b, i){ return '<li><b>'+(i+1)+'</b><span>'+h(b)+'</span></li>'; }).join('')+'</ol>'+
      '<div class="tiny muted mt2">CÂU HỎI MẪU</div>'+
      '<div class="co-ds mt">'+(k.cau||[]).map(function(c){ return '<div class="co-dong" style="border-left:3px solid '+h(mauTru((k.tru||[])[0]))+'"><span class="sm"><i>“'+h(c)+'”</i></span></div>'; }).join('')+'</div>'+
      (k.vd ? '<div class="tiny muted mt2">VÍ DỤ</div><p class="sm" style="margin:4px 0 0;line-height:1.55">'+h(k.vd)+'</p>' : '')+
      '<div class="grid g2 mt2" style="gap:10px">'+
        '<div><div class="tiny muted">NĂNG LỰC ICF LUYỆN ĐƯỢC</div><div class="co-hang mt" style="gap:6px">'+(k.icf||[]).map(chipICF).join('')+'</div></div>'+
        '<div><div class="tiny muted">HỢP VỚI PHA</div><div class="co-hang mt" style="gap:6px">'+(k.pha||[]).map(function(p){ var x = pha(p); return '<span class="chip">P'+p+(x?' · '+h(x.ten):'')+'</span>'; }).join('')+'</div></div>'+
      '</div>'+
      '<div class="co-cb mt2"><div style="--m:'+MAU_NHOM[k.nhom]+'"><span class="sm"><b>Bằng chứng.</b> '+h(k.bc||'—')+'</span></div></div>';
  }
  function moChiTiet(ma){
    var k = kt(ma); if(!k) return;
    var mo = G.allowed ? G.allowed('coach-tk') : true;
    U.modal(chiTiet(k)+'<div class="co-hang mt2 co-noprint">'+
      '<button class="btn '+(daGhim(k.ma)?'ghost':'pri')+'" data-co="nlp-ghim-hop" data-ma="'+h(k.ma)+'">'+icI('star')+(daGhim(k.ma)?' Bỏ ghim':' Ghim')+'</button>'+
      (mo ? '<button class="btn ghost" data-co="nlp-dung" data-ma="'+h(k.ma)+'">'+icI('edit')+' Dùng trong bài coach</button>' : '')+
      '<button class="btn ghost" data-co="nlp-in-the" data-ma="'+h(k.ma)+'">'+icI('book')+' In thẻ</button>'+
      '<button class="btn ghost" data-co="nlp-dong">Đóng</button></div>');
  }
  CO.on('nlp-mo', function(el){ moChiTiet(el.getAttribute('data-ma')); });
  CO.on('nlp-dong', function(){ U.closeModal(); });
  CO.on('nlp-ghim-hop', function(el){
    var ma = el.getAttribute('data-ma'); batGhim(ma);
    if(G.S && G.S.view===VIEW) veGiu(); else CO.luu(false);
    moChiTiet(ma);
  });
  CO.on('nlp-dung', function(el){
    var s = CO.st(), ma = el.getAttribute('data-ma'); s.ktChon = ma; s.tab['coach-tk'] = 'soan';
    U.closeModal(); CO.luu(false);
    if(G.allowed && G.allowed('coach-tk')){ U.toast('Đã chọn "'+((kt(ma)||{}).ten||ma)+'" — mở màn Thiết kế bài.', 'ok'); G.go('coach-tk'); }
  });
  CO.on('nlp-in-the', function(el){
    var k = kt(el.getAttribute('data-ma')); if(!k) return;
    U.modal('<div class="co-tk-in"><div class="tiny muted">GITA 365 · THẺ KỸ THUẬT COACH</div>'+chiTiet(k)+
      '<p class="tiny muted" style="margin-top:12px">Tài liệu nội bộ đội Coach GITA — không chuyển ra ngoài hệ.</p></div>'+
      '<div class="co-hang mt2 co-noprint"><button class="btn pri" data-co="nlp-in">'+icI('book')+' In / lưu PDF</button>'+
      '<button class="btn ghost" data-co="nlp-mo" data-ma="'+h(k.ma)+'">← Về thẻ</button><button class="btn ghost" data-co="nlp-dong">Đóng</button></div>');
  });
  CO.on('nlp-in', function(){
    var b = document.body; b.classList.add('co-tk-dangin');   /* dùng chung lớp in hộp thoại của coach-tk */
    function xong(){ b.classList.remove('co-tk-dangin'); window.removeEventListener('afterprint', xong); }
    window.addEventListener('afterprint', xong);
    setTimeout(function(){ try{ window.print(); }catch(e){} setTimeout(xong, 1500); }, 30);
  });

  /* ═════════ 2 · QUY TRÌNH COACH CHUẨN (7 bước) ═════════ */
  var QT = [
    { ten:'Thoả thuận & an toàn', ngan:['Thoả thuận','& an toàn'], icf:['C1','C3','C4'], kt:['NLP-NN','KH-SC'],
      lam:'Chào hỏi, nói rõ vai trò Coach và bảo mật. Hỏi cảm xúc từng người (1–5). Hỏi gia đình muốn ra về với điều gì.',
      hoi:['Hôm nay mỗi người đang ở mức mấy trên năm?','Cuối buổi, điều gì khiến buổi này đáng giá với nhà mình?'],
      ra:'Mục tiêu buổi do gia đình nói ra; mọi người thấy đủ an toàn để nói thật.', loi:'Vào bài ngay khi nhà còn căng; hứa kết quả để lấy lòng.' },
    { ten:'Lắng nghe & nhận diện', ngan:['Lắng nghe','& nhận diện'], icf:['C5','C6'], kt:['NLP-MM','NLP-GQ','NLP-NN'],
      lam:'Nghe hết câu, nhắc lại bằng đúng lời của gia đình. Nghe "luôn luôn", "không bao giờ" thì hỏi một ví dụ cụ thể. Xem bằng chứng tuần qua.',
      hoi:['"Luôn luôn" — có lần nào không như vậy không?','Mình xem bảng tick tuần trước nhé — điều gì đã chạy?'],
      ra:'Bức tranh thật, có ví dụ và số liệu.', loi:'Ngắt lời; kết luận thay gia đình.' },
    { ten:'Mục tiêu định dạng tốt', ngan:['Mục tiêu','định dạng tốt'], icf:['C3'], kt:['NLP-KQ','KH-WOOP'],
      lam:'Đổi điều không muốn thành điều muốn: nói ở thể khẳng định, nằm trong tay con, có con số và cách đo.',
      hoi:['Thay vì điều con không muốn, con muốn mình đang làm gì?','Khi đạt rồi, ai trong nhà nhận ra đầu tiên, nhờ điều gì?'],
      ra:'Một mục tiêu khẳng định, có số, có cách đo — do con nói ra.', loi:'Lấy mục tiêu của người lớn; mục tiêu kiểu "bớt lười".' },
    { ten:'Khơi gợi nhận thức theo G–I–T–A', ngan:['Khơi gợi','G–I–T–A'], icf:['C7'], kt:['NLP-CL','KH-MI','NLP-DK','NLP-VT'],
      lam:'Hỏi để gia đình tự thấy nút thắt nằm ở trụ nào: mục tiêu, nội lực, năng lực hay hành động & môi trường. Dám im lặng chờ.',
      hoi:['Lúc việc ấy không chạy, chuyện gì xảy ra ngay trước đó?','Gặp bài khó, con tin gì về bản thân mình?'],
      ra:'Nút thắt được chính gia đình gọi tên, có căn cứ.', loi:'Coach chẩn đoán hộ; dùng kỹ thuật để gán nhãn con.' },
    { ten:'Đồng kiến tạo hành động', ngan:['Đồng kiến tạo','hành động'], icf:['C8'], kt:['KH-GROW','KH-NT','KH-VTQ'],
      lam:'Gia đình tự đưa phương án. Chọn 1–3 việc nhỏ, mỗi việc có tiêu chí xong, hạn, minh chứng, gắn với một tình huống "Nếu – Thì".',
      hoi:['Nếu chỉ đổi một điều nhỏ tuần này, nhà mình chọn điều gì?','Làm sao mình biết việc này đã xong?'],
      ra:'1–3 nhiệm vụ rõ ràng; con tự tin làm được ≥ 7/10.', loi:'Giao nhiều việc, việc mơ hồ; Coach làm thay.' },
    { ten:'Nghiệm thu bằng chứng & đo', ngan:['Nghiệm thu','& đo'], icf:['C8'], kt:['KH-SC','KH-PDCA','KH-TDM'],
      lam:'Buổi sau xét đạt / chưa đạt bằng minh chứng, đặt cạnh baseline. Khen quá trình. Chỉ chỉnh một biến mỗi lần.',
      hoi:['Đặt cạnh tuần trước, số liệu tuần này nói gì?','Vì sao là 6 mà không thấp hơn?'],
      ra:'Bảng đạt / chưa đạt và quyết định giữ – chỉnh – bỏ.', loi:'Nghiệm thu theo cảm nhận; khen chung chung "con giỏi quá".' },
    { ten:'Duy trì & chuyển giao', ngan:['Duy trì','& chuyển giao'], icf:['C8','C1'], kt:['KH-PTP','NLP-TL','NLP-NE'],
      lam:'Chuẩn bị trước lúc dễ trượt, quy tắc quay lại trong 48 giờ, giảm dần hỗ trợ để gia đình tự vận hành.',
      hoi:['Lúc nào con dễ bỏ nhịp nhất?','Nếu lỡ trượt 2 ngày, con quay lại bằng việc nhỏ nhất nào?'],
      ra:'Kế hoạch phòng tái phát; nhà tự chạy 14 ngày liền.', loi:'Kết thúc đột ngột; không có kế hoạch khi trượt.' }
  ];
  function soDoQT(){
    /* Ngang cho màn rộng */
    var W = 770, o = '';
    QT.forEach(function(q, i){
      var x = 55 + i*110;
      if(i < QT.length-1) o += '<line x1="'+(x+22)+'" y1="40" x2="'+(x+86)+'" y2="40" stroke="currentColor" stroke-opacity=".45" stroke-width="2"/><polygon points="'+(x+90)+',40 '+(x+82)+',35 '+(x+82)+',45" fill="currentColor" fill-opacity=".45"/>';
      o += '<circle cx="'+x+'" cy="40" r="20" fill="'+MAU7[i]+'"/><text x="'+x+'" y="45" font-size="14" font-weight="800" fill="#fff" text-anchor="middle">'+(i+1)+'</text>'+
        '<text x="'+x+'" y="80" font-size="12" font-weight="700" fill="currentColor" text-anchor="middle">'+h(q.ngan[0])+'</text>'+
        '<text x="'+x+'" y="96" font-size="12" fill="currentColor" text-anchor="middle">'+h(q.ngan[1])+'</text>'+
        '<text x="'+x+'" y="114" font-size="10.5" fill="currentColor" fill-opacity=".6" text-anchor="middle">'+h(q.icf.join(' · '))+'</text>';
    });
    o += '<path d="M 715 122 C 715 150, 55 150, 55 122" fill="none" stroke="currentColor" stroke-opacity=".25" stroke-dasharray="5 5"/>'+
      '<text x="385" y="158" font-size="10.5" fill="currentColor" fill-opacity=".6" text-anchor="middle">bước 1–6 lặp lại mỗi buổi · bước 7 khi nhà đã tự chạy được</text>';
    var ngang = '<svg class="co-nlp-ngang" viewBox="0 0 '+W+' 166" role="img" aria-label="Quy trình coach bảy bước" style="width:100%;height:auto;color:var(--ink-2)">'+o+'</svg>';
    /* Dọc cho điện thoại */
    var d = '', hb = 52;
    QT.forEach(function(q, i){
      var y = 26 + i*hb;
      if(i < QT.length-1) d += '<line x1="26" y1="'+(y+18)+'" x2="26" y2="'+(y+hb-18)+'" stroke="currentColor" stroke-opacity=".45" stroke-width="2"/>';
      d += '<circle cx="26" cy="'+y+'" r="16" fill="'+MAU7[i]+'"/><text x="26" y="'+(y+5)+'" font-size="13" font-weight="800" fill="#fff" text-anchor="middle">'+(i+1)+'</text>'+
        '<text x="54" y="'+(y-1)+'" font-size="13" font-weight="700" fill="currentColor">'+h(q.ten)+'</text>'+
        '<text x="54" y="'+(y+15)+'" font-size="11" fill="currentColor" fill-opacity=".6">ICF '+h(q.icf.join(' · '))+'</text>';
    });
    var doc = '<svg class="co-nlp-doc" viewBox="0 0 330 '+(QT.length*hb+4)+'" role="img" aria-label="Quy trình coach bảy bước" style="width:100%;max-width:420px;height:auto;color:var(--ink-2)">'+d+'</svg>';
    return '<div class="card pad-sm mb">'+ngang+doc+'</div>';
  }
  function veQuyTrinh(){
    var o = '<p class="sm" style="max-width:72ch;line-height:1.6;margin:0 0 12px">Bảy bước dưới đây là xương sống của mọi buổi coach GITA. Bước 1–6 đi trong một buổi (bước 6 nối sang đầu buổi sau); bước 7 khi nhà đã chạy được. '+
      'Mỗi bước ghi rõ <b>làm gì</b>, <b>hỏi gì</b>, <b>dùng công cụ nào</b>, <b>ra được gì</b> và <b>lỗi hay gặp</b>. Bấm tên kỹ thuật để xem cách dùng.</p>';
    o += soDoQT();
    o += '<div class="co-ds mb">'+ QT.map(function(q, i){
      return '<div class="co-the" style="border-left:5px solid '+MAU7[i]+'">'+
        '<div class="co-hang"><span class="co-so" style="flex:none;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font-weight:800;color:#fff;background:'+MAU7[i]+'">'+(i+1)+'</span>'+
          '<h2 class="co-grow" style="min-width:160px">'+h(q.ten)+'</h2><span class="co-hang" style="gap:4px">'+q.icf.map(function(c){ return '<span class="co-tag" title="'+h((icf(c)||{}).ten||c)+'">'+h(c)+' · '+h((icf(c)||{}).ten||'')+'</span>'; }).join('')+'</span></div>'+
        '<p class="sm" style="margin:0;line-height:1.55"><b>Làm gì.</b> '+h(q.lam)+'</p>'+
        '<div class="grid g2" style="gap:8px">'+q.hoi.map(function(c){ return '<div class="co-dong" style="border-left:3px solid '+MAU7[i]+'"><span class="sm"><i>“'+h(c)+'”</i></span></div>'; }).join('')+'</div>'+
        '<div class="co-hang" style="gap:6px"><span class="tiny muted">Công cụ</span>'+q.kt.map(chipKT).join('')+'</div>'+
        '<div class="grid g2" style="gap:8px">'+
          '<div class="sm"><span class="tiny muted">RA ĐƯỢC</span><br>'+h(q.ra)+'</div>'+
          '<div class="sm"><span class="tiny muted">LỖI HAY GẶP</span><br><span style="color:'+CO.MAU_DEN.DO+'">'+h(q.loi)+'</span></div>'+
        '</div></div>'; }).join('') +'</div>';
    o += '<p class="tiny muted">'+icI('shield')+' Sáu nhịp của một buổi ở màn Thiết kế bài là cách chia thời gian cho các bước 1–6 này; máy soát mười luật kiểm cùng tinh thần.</p>';
    return o;
  }

  /* ═════════ 3 · CHUỖI HÀNH ĐỘNG GITA ═════════ */
  var NGAN8 = ['1 Hiện trạng','2 Khát vọng','3 Động lực','4 Niềm tin','5 Năng lực','6 Hành động','7 Môi trường','8 Đo · củng cố'];
  var DILTS = { 1:'Môi trường · Hành vi (thấy đúng hiện trạng)', 2:'Sứ mệnh (điều lớn hơn mà con hướng tới)', 3:'Giá trị (vì sao điều đó quan trọng với con)',
    4:'Niềm tin · Bản sắc (con tin gì, thấy mình là ai)', 5:'Năng lực (biết cách, có phương pháp)', 6:'Hành vi (việc cụ thể mỗi ngày)',
    7:'Môi trường (ở đâu, khi nào, với ai)', 8:'Hành vi → Năng lực (lặp lại thành nếp, đo và giữ)' };
  function veChuoi(){
    var C = G.CO_CHUOI || [], v = V();
    var o = '<div class="grid g2 mb" style="align-items:center">'+
      '<div class="card pad-sm">'+(v && v.ve ? v.ve('vong', NGAN8.slice(0, C.length), '#5140B4') : '')+'</div>'+
      '<div><p class="sm" style="line-height:1.6;margin:0">Tám bước khách hàng đi qua, theo bốn trụ <b>G → I → T → A</b> rồi quay vòng: đo xong lại soi hiện trạng mới. '+
      'Cột "Cấp độ Dilts" cho biết bước ấy chạm tới tầng nào trong '+chipKT('NLP-CL')+' — sửa hành vi mãi không đổi thì có thể nút thắt nằm ở tầng niềm tin hay bản sắc.</p></div></div>';
    o += '<div class="grid g4 mb">'+ (G.GITA||[]).map(function(g){
      return '<div class="co-the" style="border-top:4px solid '+h(g.c)+';gap:6px"><b style="color:'+h(g.c)+'">'+h(g.k)+' · '+h(g.short)+'</b>'+
        '<div class="tiny muted" style="line-height:1.5">'+h(g.desc)+'</div><div class="tiny" style="line-height:1.5"><b>Câu soi:</b> <i>'+h(g.probe)+'</i></div>'+
        '<div class="tiny muted">Bước: '+C.filter(function(c){ return c.tru===g.k; }).map(function(c){ return c.so; }).join(', ')+'</div></div>'; }).join('') +'</div>';
    o += '<div class="co-tb mb"><table><thead><tr><th>Bước</th><th>Trụ</th><th>Ý nghĩa</th><th>Cấp độ Dilts</th><th>Kỹ thuật</th><th>Năng lực ICF</th></tr></thead><tbody>'+
      C.map(function(c){
        return '<tr><td style="min-width:150px"><b>'+c.so+'. '+h(c.ten)+'</b></td><td>'+U.chip(c.tru, mauTru(c.tru))+'</td>'+
          '<td class="sm" style="min-width:180px">'+h(c.mo)+'</td><td class="sm" style="min-width:170px">'+h(DILTS[c.so]||'—')+'</td>'+
          '<td style="min-width:200px"><div class="co-hang" style="gap:4px">'+(c.kt||[]).map(chipKT).join('')+'</div></td>'+
          '<td class="sm" style="min-width:140px">'+(c.icf||[]).map(function(x){ var n = icf(x); return h(x)+(n?' · '+h(n.ten):''); }).join('<br>')+'</td></tr>';
      }).join('')+'</tbody></table></div>';
    return o;
  }

  /* ═════════ 4 · NĂNG LỰC ICF ═════════ */
  function veICF(){
    var ds = G.CO_ICF || [], mien = [];
    ds.forEach(function(c){ if(mien.indexOf(c.mien) < 0) mien.push(c.mien); });
    var tcCua = {}; Object.keys(G.CO_TC_ICF||{}).forEach(function(tc){ (G.CO_TC_ICF[tc]||[]).forEach(function(m){ (tcCua[m] = tcCua[m] || []).push(tc); }); });
    var tcTen = {}; (G.CO_TC||[]).forEach(function(t){ tcTen[t.ma] = t.ten; });
    var o = '<div class="co-cb mb"><div style="--m:var(--gita)">'+icI('shield')+'<span><b>GITA bám khung tám năng lực cốt lõi của ICF</b> (bản cập nhật 2019) để đào tạo và chấm chất lượng Coach. '+
      'Đây <b>không phải</b> chứng nhận ICF — chứng nhận là việc mỗi Coach tự làm với ICF. Tên gốc tiếng Anh ghi kèm để đối chiếu.</span></div></div>';
    mien.forEach(function(m){
      o += U.sec(m, ds.filter(function(c){ return c.mien===m; }).length+' năng lực');
      o += '<div class="co-luoi mb" style="grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr))">'+ ds.filter(function(c){ return c.mien===m; }).map(function(c){
        var kts = KT().filter(function(k){ return (k.icf||[]).indexOf(c.ma) >= 0; });
        return '<div class="co-the" style="border-top:4px solid var(--gita)">'+
          '<div class="co-hang"><span class="co-tag">'+h(c.ma)+'</span><h3 class="co-grow">'+h(c.ten)+'</h3></div>'+
          '<div class="tiny muted" style="margin-top:-4px"><i>'+h(c.goc)+'</i></div>'+
          '<p class="sm" style="margin:0;line-height:1.5">'+h(c.mo)+'</p>'+
          '<div><div class="tiny muted">DẤU HIỆU QUAN SÁT ĐƯỢC</div><ul class="sm" style="margin:4px 0 0;padding-left:18px;line-height:1.5">'+(c.dau||[]).map(function(d){ return '<li>'+h(d)+'</li>'; }).join('')+'</ul></div>'+
          '<div><div class="tiny muted">KỸ THUẬT LUYỆN ('+kts.length+')</div><div class="co-hang mt" style="gap:4px">'+(kts.length ? kts.map(function(k){ return chipKT(k.ma); }).join('') : '<span class="tiny muted">—</span>')+'</div></div>'+
          '<div><div class="tiny muted">TIÊU CHÍ CHẤM ĐO NÓ</div><div class="sm" style="margin-top:4px">'+((tcCua[c.ma]||[]).length ? (tcCua[c.ma]).map(function(t){ return h(tcTen[t]||t); }).join(' · ') : '—')+'</div></div>'+
        '</div>'; }).join('') +'</div>';
    });
    if(G.allowed && G.allowed('coach-cl')) o += '<div class="co-hang mb"><span class="tiny muted co-grow" style="min-width:200px">Tiêu chí chấm nằm ở phiếu chấm buổi — mỗi tiêu chí 0–4, quy về năng lực ICF như trên.</span><button class="btn ghost sm" data-v="coach-cl">Mở màn Kiểm soát chất lượng '+ic('arrow','w-3 h-3')+'</button></div>';
    return o;
  }

  /* ═════════ 5 · LỘ TRÌNH BỀN VỮNG ═════════ */
  function vePha(){
    var P = G.CO_PHA || [], C = G.CO_CHUOI || [];
    var ssTen = {}; (G.CO_SS||[]).forEach(function(x){ ssTen[x.ma] = x.ten; });
    var o = '<p class="sm" style="max-width:72ch;line-height:1.6;margin:0 0 12px">Thay đổi bền vững đi qua năm pha. Không pha nào được bỏ qua: qua cổng mới sang pha sau. Độ dài mỗi pha là tỷ trọng gợi ý — chương trình thật co giãn theo mức sẵn sàng của nhà.</p>';
    o += '<div class="card pad-sm mb"><div class="co-nlp-pha" role="img" aria-label="Năm pha của lộ trình bền vững">'+ P.map(function(p, i){
      return '<div style="flex:'+p.ty+';--m:'+MAU7[i]+'"><b>P'+p.so+' · '+Math.round(p.ty*100)+'%</b><span>'+h(p.ten)+'</span></div>'; }).join('') +'</div></div>';
    o += '<div class="co-ds mb">'+ P.map(function(p, i){
      return '<div class="co-the" style="border-left:5px solid '+MAU7[i]+'">'+
        '<div class="co-hang"><span class="co-so" style="flex:none;width:34px;height:30px;border-radius:9px;display:grid;place-items:center;font-weight:800;color:#fff;background:'+MAU7[i]+'">P'+p.so+'</span>'+
          '<h2 class="co-grow" style="min-width:160px">'+h(p.ten)+'</h2><span class="tiny muted">≈ '+Math.round(p.ty*100)+'% thời lượng</span></div>'+
        '<p class="sm" style="margin:0;line-height:1.55"><b>Mục đích.</b> '+h(p.muc)+'</p>'+
        '<div class="co-cb"><div style="--m:'+MAU7[i]+'">'+icI('shield')+'<span class="sm"><b>Cổng:</b> '+h(p.cong)+'</span></div></div>'+
        '<div class="grid g2" style="gap:10px">'+
          '<div><div class="tiny muted">KPI</div><div class="co-tb mt"><table style="min-width:0"><tbody>'+(p.kpi||[]).map(function(x){ return '<tr><td class="sm">'+h(x[0])+'</td><td class="so"><b>'+h(x[1])+'</b></td></tr>'; }).join('')+'</tbody></table></div></div>'+
          '<div><div class="tiny muted">BƯỚC CHUỖI GITA</div><div class="co-hang mt" style="gap:4px">'+(p.chuoi||[]).map(function(n){ var c = C.filter(function(x){ return x.so===n; })[0];
              return c ? U.chip(n+'. '+c.ten, mauTru(c.tru)) : ''; }).join('')+'</div>'+
            '<div class="tiny muted mt">MỨC SẴN SÀNG PHỤC VỤ</div><div class="sm" style="margin-top:4px">'+(p.ss||[]).map(function(m){ return h(ssTen[m]||m); }).join(' · ')+'</div></div>'+
        '</div>'+
        '<div class="co-hang" style="gap:4px"><span class="tiny muted">Kỹ thuật</span>'+(p.kt||[]).map(chipKT).join('')+'</div></div>'; }).join('') +'</div>';
    return o;
  }
})();
