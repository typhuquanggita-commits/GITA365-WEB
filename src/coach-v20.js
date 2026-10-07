/* ═══════════════════════════════════════════════════════════════
   GITA 365 — KIẾN TẠO CHƯƠNG TRÌNH COACH V20 (coach-v20)

   Bảy bước, một đường thẳng — Coach không cần biết lập trình:
     1 Nguồn thông tin  lời kể / phiếu tiếp nhận + dữ liệu sẵn trong hệ
     2 Chẩn đoán        vấn đề G–I–T–A có câu trích làm bằng chứng
     3 Mục tiêu         kết quả định dạng tốt + máy soát 5 điều
     4 Lộ trình         5 pha thay đổi bền vững, cổng, KPI, mốc chỉ tiêu
     5 Buổi & kịch bản  từng buổi: chuỗi GITA · kỹ thuật · ICF · sáu nhịp
     6 Đo & duy trì     KPI, hoạt động cần ghi, phòng tái phát, hẹn 30–60–90
     7 Xuất bản         thành chương trình + bài coach (+ lịch cho nhà)

   Máy ở coach-v20-may.js; sổ chung ở coach-loi.js. Máy ĐỀ XUẤT, Coach
   quyết. Lời kể của gia đình xử lý trên máy, không gửi ra ngoài.
   Mở cho pro_coach. Không đụng máy chủ · giấy phép · mã hoá.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic, CO = G.CO, V = CO.v20;
  var VIEW = 'coach-v20';
  var BUOC = [['nguon','1 · Nguồn thông tin','edit'],['chan','2 · Chẩn đoán','search'],['muc','3 · Mục tiêu','target'],
    ['lo','4 · Lộ trình','map'],['buoi','5 · Buổi & kịch bản','list'],['do','6 · Đo & duy trì','chart'],['xuat','7 · Xuất bản','check']];
  var MAU_PHA = ['#185AB4','#5140B4','#0B6675','#0B7350','#B4720F'];
  var LOI_KE_MAU = 'Con trai em học lớp 9, chuẩn bị thi vào lớp 10. Tối nào con cũng cầm điện thoại chơi game tới 1 giờ sáng, sáng không dậy nổi. ' +
    'Em nhắc mãi con mới chịu ngồi vào bàn, mà ngồi thì mất tập trung, học trước quên sau. Môn Toán con yếu, con nói "con không làm được đâu". ' +
    'Mẹ con hay la mắng, con đóng cửa phòng không nói chuyện. Con thích vẽ và rất khéo tay. Bố mẹ sẵn sàng dành thời gian mỗi tối, muốn thay đổi nhưng không biết bắt đầu từ đâu.';

  function nhap(){ var s = CO.st(); return s.v20Nhap || null; }
  function kt(ma){ return V.kt(ma) || { ma:ma, ten:ma, tru:[], icf:[] }; }
  function icfTen(c){ var x = (G.CO_ICF||[]).filter(function(i){ return i.ma===c; })[0]; return x ? x.ten : c; }
  function gita(k){ return (G.GITA||[]).filter(function(g){ return g.k===k; })[0] || { k:k, short:k, c:'#73849F' }; }
  function chip(t, c){ return U.chip(t, c); }
  function ktChip(ma){ var k = kt(ma); return '<span class="chip" title="'+h(k.goc||'')+'" style="color:'+(k.nhom==='KH'?'#0B7350':'#B4720F')+';border-color:currentColor">'+h(k.ten)+'</span>'; }

  /* ───────── 1 · Nguồn thông tin ───────── */
  function buocNguon(P){
    var s = CO.st(), f = s.v20Form || {};
    var nha = CO.dsNha(), chon = f.nha || (P && P.nha) || (nha[0] && nha[0].ma) || '';
    var dsChon = [['','— chọn nhà —']].concat(nha.map(function(n){ return [n.ma, n.ten+(n.nguon==='mau'?' · minh hoạ':'')]; })).concat([['__moi','+ Nhà mới…']]);
    var cu = s.pt[chon], dkDang = CO.dsDK(true).filter(function(d){ return d.nha===chon && d.tt==='dang'; })[0];
    var csDang = dkDang ? CO.chiSo(dkDang) : null;
    var o = '<div class="card pad-sm mb"><div class="co-form">'+
      CO.o2('Gia đình', CO.chon('v20-nha', dsChon, f.moi ? '__moi' : chon, ' data-co-ch="v20-doi-nha"'))+
      (f.moi ? CO.o2('Mã nhà mới', '<input class="inp" id="v20-ma" maxlength="30" value="'+h(f.ma||'')+'" placeholder="VD: GITA-0201">')+
               CO.o2('Tên nhà', '<input class="inp" id="v20-ten" maxlength="60" value="'+h(f.ten||'')+'" placeholder="VD: Nhà Minh Khôi">') : '')+
      CO.o2('Gọi con là', '<input class="inp" id="v20-nguoi" maxlength="30" value="'+h(f.nguoi||'con')+'" placeholder="con / tên con">')+
      CO.o2('Tầng hiện tại', CO.chon('v20-tang', [['','Để máy đề xuất']].concat((G.TIERS||[]).map(function(t){ return [t.id, t.code+' · '+t.name]; })), f.tang||''))+
      CO.o2('Độ dài lộ trình', CO.chon('v20-tuan', [['','Theo tầng (máy chọn)'],['6','6 tuần'],['8','8 tuần'],['10','10 tuần'],['12','12 tuần'],['16','16 tuần'],['24','24 tuần']], f.tuan||''))+
      CO.o2('Buổi mỗi tuần', CO.chon('v20-bt', [['1','1 buổi'],['2','2 buổi']], f.bt||'1'))+
      CO.o2('Phút mỗi buổi', CO.chon('v20-phut', [['45','45 phút'],['60','60 phút'],['75','75 phút'],['90','90 phút']], f.phut||'60'))+
      '</div>'+
      '<label class="co-f mt"><span>Lời kể của gia đình / phiếu tiếp nhận (dán nguyên văn — càng cụ thể càng tốt)</span>'+
        '<textarea class="inp" id="v20-vb" rows="7" maxlength="4000" placeholder="Con đang gặp chuyện gì, từ bao giờ, lúc nào nặng nhất, con mạnh ở đâu, gia đình mong gì…">'+h(f.vb||'')+'</textarea></label>'+
      '<div class="co-hang mt"><button class="btn pri" data-co="v20-tao">'+ic('sparkle','w-4 h-4')+'Đọc & kiến tạo chương trình</button>'+
        '<button class="btn ghost sm" data-co="v20-mau">Dán lời kể mẫu</button>'+
        '<span class="tiny muted co-grow">Lời kể được đọc ngay trên máy này, không gửi đi đâu.</span></div></div>';
    o += U.sec('Dữ liệu hệ thống sẽ được dùng', 'Máy gộp lời kể với những gì đã có trong sổ — không xoá điều Coach đã ghi');
    o += '<div class="grid g3 mb">'+
      '<div class="card pad-sm"><b class="sm">Phân tích đã có</b><p class="tiny muted mt">'+(cu ? 'Có · cập nhật '+h(CO.gioVN(cu.luc||Date.now()))+' · '+Object.keys(cu.vd||{}).length+' vấn đề đã chấm' : 'Chưa có — máy sẽ dựng từ lời kể.')+'</p>'+
        (G.allowed('coach-pt') ? '<button class="btn ghost sm mt" data-v="coach-pt">Mở màn Phân tích</button>' : '')+'</div>'+
      '<div class="card pad-sm"><b class="sm">Chương trình đang chạy</b><p class="tiny muted mt">'+(csDang ? h((CO.ct(dkDang.ct)||{}).ten||dkDang.ct)+' · gắn kết '+(csDang.ganKet==null?'—':csDang.ganKet)+' · đèn '+CO.TEN_DEN[csDang.den] : 'Không — lộ trình mới bắt đầu từ đầu.')+'</p></div>'+
      '<div class="card pad-sm"><b class="sm">Kho chuẩn được dùng</b><p class="tiny muted mt">'+(G.CO_KT||[]).length+' kỹ thuật · '+CO.dsGP().length+' giải pháp · '+(G.CO_ICF||[]).length+' năng lực ICF · '+CO.nhip().length+' nhịp/buổi ('+h(CO.nhipNguon())+')</p></div></div>';
    return o;
  }
  function docForm(){
    var s = CO.st(), f = s.v20Form = s.v20Form || {};
    if(!document.getElementById('v20-vb')) return f;
    var n = CO.o('v20-nha');
    f.moi = n === '__moi'; if(!f.moi) f.nha = n;
    if(f.moi && document.getElementById('v20-ma')){ f.ma = CO.o('v20-ma'); f.ten = CO.o('v20-ten'); }
    f.nguoi = CO.o('v20-nguoi'); f.tang = CO.o('v20-tang'); f.tuan = CO.o('v20-tuan'); f.bt = CO.o('v20-bt'); f.phut = CO.o('v20-phut'); f.vb = CO.o('v20-vb');
    return f;
  }
  CO.on('v20-doi-nha', function(){ docForm(); CO.luu(); });
  CO.on('v20-mau', function(){ var f = docForm(); f.vb = LOI_KE_MAU; CO.luu(); });
  CO.on('v20-tao', function(){
    var f = docForm(), ma = f.moi ? String(f.ma||'').trim() : f.nha, ten = f.moi ? String(f.ten||'').trim() : CO.tenNha(f.nha);
    if(!ma) return U.toast(f.moi ? 'Nhập mã nhà mới trước.' : 'Chọn một gia đình trước.', 'err');
    if(f.moi && !ten) return U.toast('Nhập tên nhà mới.', 'err');
    if(String(f.vb||'').trim().length < 20 && !CO.st().pt[ma]) return U.toast('Lời kể còn quá ngắn và nhà chưa có phân tích — dán thêm vài câu về tình hình của nhà.', 'err');
    var P = V.taoKeHoach({ nha:ma, tenNha:ten, vanBan:f.vb, nguoi:f.nguoi, tangHienTai:f.tang, tuan:f.tuan, buoiTuan:f.bt, phut:f.phut });
    CO.st().v20Nhap = P; CO.st().tab[VIEW] = 'chan';
    CO.luu(); U.toast('Đã kiến tạo: '+P.pha.length+' pha · '+P.buoi.length+' buổi · '+P.tuan+' tuần. Đọc lại từng bước rồi xuất bản.', 'ok');
  });

  /* ───────── 2 · Chẩn đoán ───────── */
  function buocChan(P){
    var D = P.chanDoan, A = D.A, doc = D.doc, o = '';
    o += '<div class="grid g4 mb">'+
      U.stat({ k:'Câu đã đọc', v:String(doc.soCau), d:doc.soKhop+' chỗ khớp từ khoá' })+
      U.stat({ k:'Mức nặng nhất', v:A.nangNhat+'%', d:'trụ nặng nhất', c:A.nangNhat>=60?'#BE0E16':A.nangNhat>=35?'#B4720F':'#0B7350' })+
      U.stat({ k:'Tiềm năng', v:A.tiemNang+'%', d:'8 chiều nguồn lực' })+
      U.stat({ k:'Sẵn sàng', v:((G.CO_SS||[])[A.ss]||{}).ten||'—', d:'tầng đề xuất T'+A.tang })+'</div>';
    if(P.canhBao.length) o += '<div class="co-cb mb">'+P.canhBao.map(function(c){ return '<div style="--m:#BE0E16">'+ic('alert','w-4 h-4')+'<span>'+h(c)+'</span></div>'; }).join('')+'</div>';
    o += U.sec('Bốn trụ G–I–T–A', 'Mức vấn đề theo từng trụ (0 = không có, 100 = nặng ở mọi vấn đề của trụ)');
    o += '<div class="card pad-sm mb">'+ (G.GITA||[]).map(function(g){
      var v = A.tru[g.k]||0;
      return '<div class="co-hang" style="margin:6px 0"><b style="min-width:110px;color:'+g.c+'">'+h(g.k+' · '+g.short)+'</b>'+
        '<div class="co-grow co-thanhbar" style="--m:'+g.c+';min-width:120px"><i style="width:'+v+'%"></i></div><span class="co-so sm" style="width:44px;text-align:right">'+v+'%</span></div>'; }).join('') +'</div>';
    o += U.sec('Vấn đề máy nhận ra — kèm câu trích làm bằng chứng', 'Mức 1 nhẹ · 2 rõ · 3 nặng. Sai thì sửa ở màn Phân tích rồi kiến tạo lại.');
    var vd = (G.CO_VD||[]).filter(function(x){ return (D.pt.vd[x.ma]||0) > 0; }).sort(function(a,b){ return D.pt.vd[b.ma] - D.pt.vd[a.ma]; });
    o += vd.length ? '<div class="co-tb mb"><table><thead><tr><th>Trụ</th><th>Vấn đề</th><th>Mức</th><th>Bằng chứng trong lời kể</th></tr></thead><tbody>'+
      vd.map(function(x){ var g = gita(x.tru), tr = (doc.trich[x.ma]||[]);
        return '<tr><td><b style="color:'+g.c+'">'+h(x.tru)+'</b></td><td>'+h(x.ten)+'</td><td class="so">'+D.pt.vd[x.ma]+'</td>'+
          '<td class="tiny">'+(tr.length ? tr.slice(0,2).map(function(t){ return '“'+h(t)+'”'; }).join('<br>') : '<span class="muted">từ phân tích đã có</span>')+'</td></tr>'; }).join('')+
      '</tbody></table></div>' : '<p class="sm muted mb">Chưa nhận ra vấn đề nào.</p>';
    o += '<div class="grid g2 mb"><div class="card pad-sm"><b class="sm">Nhu cầu ưu tiên</b>'+
      (A.ncTop.length ? '<ol class="sm mt" style="padding-left:18px;line-height:1.7">'+A.ncTop.slice(0,5).map(function(x){ return '<li>'+h(x.ten)+' <span class="tiny muted">quan trọng '+x.qt+' · gấp '+x.gap+'</span></li>'; }).join('')+'</ol>' : '<p class="tiny muted mt">—</p>')+'</div>'+
      '<div class="card pad-sm"><b class="sm">Nguồn lực / tiềm năng thấy được</b>'+
      ((G.CO_TN||[]).filter(function(x){ return (D.pt.tn[x.ma]||0) > 0; }).map(function(x){ return '<div class="tiny mt">'+ic('check','w-3 h-3')+' '+h(x.ten)+' — mức '+D.pt.tn[x.ma]+'</div>'; }).join('') || '<p class="tiny muted mt">Lời kể chưa nói tới điểm mạnh — hỏi thêm ở buổi 1.</p>')+'</div></div>';
    if(D.chiSo) o += '<p class="tiny muted">Dữ liệu hoạt động hiện tại của nhà: gắn kết '+(D.chiSo.ganKet==null?'—':D.chiSo.ganKet)+' · tham gia '+CO.pt(D.chiSo.thamGia)+' · nhiệm vụ '+CO.pt(D.chiSo.nhiemVu)+' · im lặng '+D.chiSo.imLang+' ngày.</p>';
    return o;
  }

  /* ───────── 3 · Mục tiêu ───────── */
  function buocMuc(P){
    var M = P.mucTieu, S = V.soatMucTieu(M.cau, M.do, P.nguoi), dat = S.filter(function(x){ return x.ok; }).length;
    var o = '<div class="card pad-sm mb"><label class="co-f"><span>Kết quả mong muốn (định dạng tốt)</span><textarea class="inp" id="v20-kq" rows="3" maxlength="400">'+h(M.cau)+'</textarea></label>'+
      '<div class="co-form mt">'+CO.o2('Đo bằng', '<input class="inp" id="v20-do" maxlength="200" value="'+h(M.do)+'">')+
      CO.o2('Chỉ số baseline cần ghi tuần đầu', '<input class="inp" id="v20-cs" maxlength="120" value="'+h(M.cs)+'">')+'</div>'+
      '<div class="co-hang mt"><button class="btn sm" data-co="v20-luu-muc">'+ic('check','w-3 h-3')+'Lưu & soát lại</button><span class="tiny muted">Máy soát 5 điều của kết quả định dạng tốt.</span></div></div>';
    o += '<div class="card pad-sm mb"><div class="co-hang"><b class="co-grow">Máy soát mục tiêu</b><span class="co-so" style="font-size:22px;font-weight:800;color:'+(dat===5?'#0B7350':'#B4720F')+'">'+dat+'/5</span></div>'+
      S.map(function(x){ return '<div class="tiny mt" style="color:'+(x.ok?'#0B7350':'#BE0E16')+'">'+(x.ok?'✓':'✗')+' '+h(x.t)+'</div>'; }).join('')+'</div>';
    var k = kt('NLP-KQ');
    o += '<div class="grid g2"><div class="card pad-sm"><b class="sm">Hỏi gia đình để chốt mục tiêu ('+h(k.ten)+')</b><ul class="sm mt" style="padding-left:18px;line-height:1.7">'+
      (k.buoc||[]).map(function(b){ return '<li>'+h(b)+'</li>'; }).join('')+'</ul></div>'+
      '<div class="card pad-sm"><b class="sm">Minh hoạ</b>'+V.ve('bac', V.nhanHinh(k), '#185AB4')+'<p class="tiny muted">'+h(k.vd)+'</p></div></div>';
    return o;
  }
  CO.on('v20-luu-muc', function(){
    var P = nhap(); if(!P) return;
    var kq = CO.o('v20-kq'); if(kq.length < 15) return U.toast('Kết quả còn quá ngắn.', 'err');
    P.mucTieu.cau = kq; P.mucTieu.do = CO.o('v20-do'); P.mucTieu.cs = CO.o('v20-cs');
    CO.luu(); U.toast('Đã lưu mục tiêu.', 'ok');
  });

  /* ───────── 4 · Lộ trình ───────── */
  function buocLo(P){
    var o = '<div class="card pad-sm mb">'+V.veLoTrinh(P)+'</div>';
    o += '<div class="co-ds">'+ P.pha.map(function(p, i){
      return '<div class="co-the nhan" style="--c:'+MAU_PHA[i]+'"><div class="co-hang"><b style="color:'+MAU_PHA[i]+'">P'+p.so+'</b><h3 class="co-grow">'+h(p.ten)+'</h3>'+
        '<span class="tiny muted co-so">ngày '+p.tu+'–'+p.den+' · '+p.buoi+' buổi</span></div>'+
        '<p class="sm" style="margin:0">'+h(p.muc)+'</p>'+
        '<div class="grid g2" style="gap:10px"><div class="tiny"><b>Cổng nghiệm thu:</b> '+h(p.cong)+'</div><div class="tiny"><b>Mốc chỉ tiêu:</b> '+h(p.moc)+'</div></div>'+
        '<div class="tiny"><b>KPI:</b> '+p.kpi.map(function(k){ return h(k[0])+' '+h(k[1]); }).join(' · ')+'</div>'+
        '<div class="co-meta"><span>Chuỗi GITA:</span>'+p.chuoi.map(function(c){ var x = G.CO_CHUOI[c-1]; return chip(c+' · '+x.ten, gita(x.tru).c); }).join('')+'</div>'+
        '<div class="co-meta"><span>Kỹ thuật:</span>'+p.kt.map(ktChip).join('')+'</div>'+
        '<div class="co-meta"><span>Năng lực ICF:</span>'+p.icf.map(function(c){ return chip(c+' '+icfTen(c)); }).join('')+'</div>'+
        (p.gp.length ? '<div class="co-meta"><span>Giải pháp:</span>'+p.gp.map(function(m){ var g = CO.gp(m); return chip(g ? g.ten : m, gita(g && g.tru).c); }).join('')+'</div>' : '')+
      '</div>'; }).join('') +'</div>';
    return o;
  }

  /* ───────── 5 · Buổi & kịch bản ───────── */
  function veBuoi(b, mo){
    var k = kt(b.kt), g = b.gp ? CO.gp(b.gp) : null;
    return '<details class="card pad-sm"'+(mo?' open':'')+'><summary class="co-hang" style="cursor:pointer"><b class="co-grow">'+h(b.ten)+'</b>'+
      '<span class="tiny muted">P'+b.pha+' · ngày '+b.ngayThu+'</span></summary>'+
      '<div class="co-meta mt">'+chip(b.tru+' · '+gita(b.tru).short, gita(b.tru).c)+ktChip(b.kt)+b.icf.map(function(c){ return chip(c+' '+icfTen(c)); }).join('')+'</div>'+
      '<p class="sm mt"><b>Mục tiêu buổi:</b> '+h(b.muc)+'</p>'+
      '<div class="co-tb mt"><table><thead><tr><th>Nhịp</th><th>Phút</th><th>Làm gì</th><th>Câu hỏi chính</th></tr></thead><tbody>'+
        b.nhip.map(function(n){ return '<tr><td><b>'+h(n.no+'. '+n.ten)+'</b></td><td class="so">'+n.phut+'</td><td class="tiny">'+h(n.lam)+'<div class="muted" style="margin-top:3px">Tránh: '+h(n.tranh||'—')+'</div></td><td class="tiny"><i>'+h(n.hoi)+'</i></td></tr>'; }).join('')+
      '</tbody></table></div>'+
      '<div class="grid g2 mt" style="gap:10px"><div><b class="sm">Nhiệm vụ giao</b>'+b.nv.map(function(t){ return '<div class="tiny mt">'+ic('check','w-3 h-3')+' '+h(t.ten)+' — <span class="muted">xong khi: '+h(t.xong)+' · hạn '+t.han+' ngày · minh chứng: '+h(t.mc)+'</span></div>'; }).join('')+'</div>'+
      '<div><b class="sm">Nghiệm thu</b><p class="tiny mt">'+h(b.nghiemThu)+'</p>'+(g ? '<p class="tiny muted">Giải pháp dùng: '+h(g.ten)+'</p>' : '')+'</div></div>'+
      '<div class="co-hang mt"><div style="width:260px;max-width:100%">'+V.ve(k.minh||'bac', V.nhanHinh(k), gita((k.tru||[])[0]).c)+'</div>'+
        '<div class="tiny muted co-grow" style="min-width:160px">'+h(k.muc||'')+'<br><span style="color:'+(k.nhom==='KH'?'#0B7350':'#B4720F')+'">'+h(k.nhom==='KH'?'Khoa học hành vi':'NLP — bằng chứng hạn chế')+'</span></div></div>'+
    '</details>';
  }
  function buocBuoi(P){
    var o = '<div class="co-hang mb"><span class="sm co-grow">'+P.buoi.length+' buổi · mỗi buổi '+P.phut+' phút · '+P.buoiTuan+' buổi/tuần. Bấm từng buổi để xem kịch bản đủ sáu nhịp.</span>'+
      '<button class="btn ghost sm" data-co="v20-in">'+ic('out','w-3 h-3')+'In toàn bộ chương trình</button></div>';
    o += '<div class="co-ds">'+P.buoi.map(function(b, i){ return veBuoi(b, i===0); }).join('')+'</div>';
    return o;
  }

  /* ───────── 6 · Đo & duy trì ───────── */
  var GHI = [['tick_nhip','mỗi ngày — tick hành vi then chốt'],['nv_xong','mỗi nhiệm vụ xong'],['minh_chung','kèm mỗi nhiệm vụ'],['cam_xuc','mỗi tối hoặc mỗi buổi'],['phan_hoi','cuối mỗi buổi'],['bai_test','đầu và cuối lộ trình']];
  function buocDo(P){
    var M = P.mucTieu;
    var o = U.sec('Thành quả đo bằng gì', 'Một kết quả chính + KPI dẫn của từng pha');
    o += '<div class="co-tb mb"><table><thead><tr><th>Pha</th><th>Mốc chỉ tiêu ('+h(M.cs)+')</th><th>KPI dẫn</th><th>Cổng</th></tr></thead><tbody>'+
      P.pha.map(function(p, i){ return '<tr><td><b style="color:'+MAU_PHA[i]+'">P'+p.so+'</b> '+h(p.ten)+'</td><td class="tiny">'+h(p.moc)+'</td><td class="tiny">'+p.kpi.map(function(k){ return h(k[0]+' '+k[1]); }).join('<br>')+'</td><td class="tiny">'+h(p.cong)+'</td></tr>'; }).join('')+
      '</tbody></table></div>';
    o += U.sec('Ghi gì để máy đo được từng hoạt động', 'Ghi ở màn Điều phối & giám sát — điểm gắn kết, đèn và cảnh báo tự tính từ đây');
    o += '<div class="co-luoi mb">'+GHI.map(function(x){ var d = CO.hd(x[0]); return '<div class="co-dong">'+ic(d.ic,'w-4 h-4')+'<span class="co-grow sm"><b>'+h(d.ten)+'</b><br><span class="tiny muted">'+h(x[1])+'</span></span></div>'; }).join('')+'</div>';
    o += U.sec('Duy trì & phòng tái phát', P.duyTri.quyTac);
    o += '<div class="co-cb mb">'+P.duyTri.truot.map(function(t){ return '<div style="--m:#B4720F"><span><b>'+h(t.tinhHuong)+'</b> <span class="tiny muted">(gắn với: '+h(t.vd)+')</span><br><span class="tiny">'+h(t.neuThi)+'</span></span></div>'; }).join('')+'</div>';
    o += '<div class="grid g3">'+P.duyTri.hen.map(function(x){ return '<div class="card pad-sm"><b class="sm">+'+x.sau+' ngày sau khi kết thúc</b><p class="tiny muted mt">'+h(x.viec)+'</p></div>'; }).join('')+'</div>';
    return o;
  }

  /* ───────── 7 · Xuất bản ───────── */
  function buocXuat(P){
    var ql = CO.laQuanLy(), o = '';
    if(P.xuat){
      o += '<div class="co-cb mb"><div style="--m:#0B7350">'+ic('check','w-4 h-4')+'<span>Đã xuất bản lúc '+h(CO.gioVN(P.xuat.luc))+': chương trình <b>'+h(P.xuat.ct)+'</b> · '+P.xuat.bai.length+' bài coach'+(P.xuat.dk?' · đã ghép và lập lịch cho nhà':'')+'.</span></div></div>';
      o += '<div class="co-hang mb">'+[['coach-ct','Xem chương trình'],['coach-tk','Mở thư viện bài'],['coach-dp','Điều phối & giám sát']].filter(function(x){ return G.allowed(x[0]); })
        .map(function(x){ return '<button class="btn sm" data-v="'+x[0]+'">'+h(x[1])+' '+ic('arrow','w-3 h-3')+'</button>'; }).join('')+'</div>';
      return o;
    }
    o += '<div class="card pad-sm mb"><p class="sm" style="margin-top:0">Xuất bản sẽ tạo:</p><ul class="sm" style="padding-left:18px;line-height:1.8">'+
      '<li>1 chương trình riêng "V20 · '+h(P.tenNha)+'" — '+P.pha.length+' giai đoạn, '+P.ngay+' ngày (sửa được ở màn Chương trình)</li>'+
      '<li>'+P.buoi.length+' bài coach đủ sáu nhịp, nhiệm vụ, nghiệm thu (sửa được ở màn Thiết kế bài)</li>'+
      '<li>Cập nhật phân tích của nhà (giữ lịch sử để so sánh trước – sau)</li></ul>'+
      '<label class="co-hang mt"><input type="checkbox" id="v20-ghep" checked> <span class="sm">Ghép ngay cho nhà và lập lịch buổi</span></label>'+
      '<div class="co-form mt">'+
        (ql ? CO.o2('Coach phụ trách', CO.chon('v20-coach', CO.dsCoach().map(function(c){ return [c.u, c.ten+' · '+c.vai]; }), CO.toi().u)) : '')+
        CO.o2('Ngày bắt đầu', '<input class="inp" type="date" id="v20-bd" value="'+h(CO.homNay())+'">')+'</div>'+
      '<div class="co-hang mt"><button class="btn pri" data-co="v20-xuat">'+ic('check','w-4 h-4')+'Xuất bản chương trình</button>'+
      '<span class="tiny muted co-grow">Coach đã đọc lại chẩn đoán, mục tiêu và các buổi — máy đề xuất, người quyết.</span></div></div>';
    return o;
  }
  CO.on('v20-xuat', function(){
    var P = nhap(); if(!P) return;
    if(P.xuat) return U.toast('Kế hoạch này đã xuất bản rồi.', 'err');
    var ghep = CO.o('v20-ghep'), bd = CO.o('v20-bd') || CO.homNay();
    if(ghep && CO.dsDK(true).some(function(d){ return d.nha===P.nha && d.tt==='dang' && !d.mau && String(d.ct).indexOf('V20-')===0; }))
      return U.toast('Nhà này đang chạy một chương trình V20 khác — kết thúc chương trình cũ ở màn Điều phối trước.', 'err');
    var x = V.xuatBan(P, { ghep:ghep, coach:CO.laQuanLy() ? (CO.o('v20-coach') || CO.toi().u) : CO.toi().u, batDau:bd });
    CO.luu(); U.toast('Đã xuất bản: '+x.bai.length+' bài coach'+(x.dk?' · đã lập lịch':'')+'.', 'ok');
  });

  /* In toàn bộ chương trình */
  CO.on('v20-in', function(){
    var P = nhap(); if(!P) return;
    var o = '<div class="co-v20-in"><h2 style="margin:0 0 4px">Chương trình coach · '+h(P.tenNha)+'</h2>'+
      '<p class="sm muted" style="margin:0 0 10px">'+P.tuan+' tuần · '+P.buoi.length+' buổi · kiến tạo '+h(CO.gioVN(P.tao))+' · GITA 365</p>'+
      '<p><b>Mục tiêu:</b> '+h(P.mucTieu.cau)+'<br><b>Đo bằng:</b> '+h(P.mucTieu.do)+'</p>'+V.veLoTrinh(P)+
      P.pha.map(function(p){ return '<p class="sm"><b>P'+p.so+' · '+h(p.ten)+'</b> (ngày '+p.tu+'–'+p.den+') — '+h(p.muc)+' <i>Cổng: '+h(p.cong)+'</i></p>'; }).join('')+
      P.buoi.map(function(b){ return '<div style="break-inside:avoid;margin-top:10px"><b>'+h(b.ten)+'</b> · ngày '+b.ngayThu+' · '+h(kt(b.kt).ten)+'<br><span class="sm">Mục tiêu: '+h(b.muc)+'</span>'+
        '<ol class="sm" style="margin:4px 0 0;padding-left:18px">'+b.nhip.map(function(n){ return '<li>'+h(n.ten)+' ('+n.phut+'′): '+h(n.lam)+' — <i>'+h(n.hoi)+'</i></li>'; }).join('')+'</ol>'+
        '<div class="sm">Nhiệm vụ: '+b.nv.map(function(t){ return h(t.ten)+' ('+h(t.xong)+')'; }).join('; ')+'</div></div>'; }).join('')+
      '<p class="sm" style="margin-top:12px"><b>Duy trì:</b> '+h(P.duyTri.quyTac)+'</p></div>'+
      '<div class="co-hang mt co-noprint"><button class="btn pri" data-co="v20-print">'+ic('out','w-4 h-4')+'In</button></div>';
    U.modal(o);
  });
  CO.on('v20-print', function(){ window.print(); });

  /* ───────── Danh sách kế hoạch đã kiến tạo ───────── */
  function dsKeHoach(){
    var ds = V.ds().slice().reverse();
    if(!ds.length) return '';
    return U.sec('Kế hoạch đã xuất bản', ds.length+' kế hoạch') + '<div class="co-tb"><table><thead><tr><th>Nhà</th><th>Mục tiêu</th><th>Tuần</th><th>Buổi</th><th>Xuất bản</th><th></th></tr></thead><tbody>'+
      ds.map(function(p){ return '<tr><td><b>'+h(p.tenNha)+'</b></td><td class="tiny">'+h(p.mucTieu.cau)+'</td><td class="so">'+p.tuan+'</td><td class="so">'+p.buoi.length+'</td><td class="tiny">'+h(CO.gioVN((p.xuat||{}).luc||p.tao))+'</td>'+
        '<td><button class="btn ghost sm" data-co="v20-mo" data-id="'+h(p.id)+'">Mở</button></td></tr>'; }).join('')+'</tbody></table></div>';
  }
  CO.on('v20-mo', function(el){ var id = el.getAttribute('data-id'), p = V.ds().filter(function(x){ return x.id===id; })[0]; if(!p) return;
    CO.st().v20Nhap = p; CO.st().tab[VIEW] = 'lo'; CO.luu(); });
  CO.on('v20-moi', function(){ CO.st().v20Nhap = null; CO.st().tab[VIEW] = 'nguon'; CO.luu(); });

  G.VIEWS[VIEW] = function(){
    var k = CO.cua('pro_coach', 'Kiến tạo chương trình V20'); if(k) return k;
    CO.napMau();
    var P = nhap(), cur = CO.tab(VIEW, 'nguon');
    if(!P && cur !== 'nguon') cur = 'nguon';
    var ds = V.ds();
    var o = U.ph({ eyebrow:'COACH · V20 · KIẾN TẠO TỰ ĐỘNG', ic:'sparkle', grad:1, t:'Kiến tạo chương trình coach V20',
      lead:'Dán lời kể của gia đình, máy đọc cùng dữ liệu sẵn có rồi dựng trọn chương trình: chẩn đoán G–I–T–A có bằng chứng, mục tiêu định dạng tốt, lộ trình 5 pha bền vững, từng buổi đủ sáu nhịp với kỹ thuật NLP và khoa học hành vi theo khung năng lực ICF, hệ đo thành quả và kế hoạch duy trì.' });
    o += '<div class="co-hang mb"><button class="btn ghost sm" data-v="coach-he">← Hệ điều hành Coach</button>'+
      (G.allowed('coach-nlp') ? '<button class="btn ghost sm" data-v="coach-nlp">'+ic('book','w-3 h-3')+'Thư viện NLP × GITA</button>' : '')+
      (P ? '<button class="btn ghost sm" data-co="v20-moi">'+ic('plus','w-3 h-3')+'Kiến tạo chương trình mới</button>' : '')+'</div>';
    o += CO.banMau();
    o += '<div class="grid g4 mb">'+
      U.stat({ k:'Kế hoạch đã xuất bản', v:String(ds.length), d:'chương trình riêng từng nhà' })+
      U.stat({ k:'Buổi đã soạn tự động', v:String(ds.reduce(function(a,p){ return a + p.buoi.length; }, 0)), d:'đủ sáu nhịp, có kịch bản' })+
      U.stat({ k:'Kỹ thuật trong kho', v:String((G.CO_KT||[]).length), d:(G.CO_KT||[]).filter(function(x){ return x.nhom==='NLP'; }).length+' NLP · '+(G.CO_KT||[]).filter(function(x){ return x.nhom==='KH'; }).length+' khoa học hành vi' })+
      U.stat({ k:'Đang soạn', v:P ? P.tenNha : '—', d:P ? P.tuan+' tuần · '+P.buoi.length+' buổi' : 'chưa có bản nháp' })+'</div>';
    o += CO.tabs(VIEW, BUOC, cur);
    if(cur === 'nguon') o += buocNguon(P);
    else if(cur === 'chan') o += buocChan(P);
    else if(cur === 'muc') o += buocMuc(P);
    else if(cur === 'lo') o += buocLo(P);
    else if(cur === 'buoi') o += buocBuoi(P);
    else if(cur === 'do') o += buocDo(P);
    else o += buocXuat(P);
    if(P && cur !== 'xuat'){
      var i = BUOC.map(function(b){ return b[0]; }).indexOf(cur);
      o += '<div class="co-hang mt2">'+(i > 0 ? '<button class="btn ghost sm" data-co="tab" data-view="'+VIEW+'" data-tab="'+BUOC[i-1][0]+'">← '+h(BUOC[i-1][1])+'</button>' : '')+
        '<span class="co-grow"></span>'+(i < BUOC.length-1 ? '<button class="btn sm" data-co="tab" data-view="'+VIEW+'" data-tab="'+BUOC[i+1][0]+'">'+h(BUOC[i+1][1])+' →</button>' : '')+'</div>';
    }
    if(cur === 'nguon') o += dsKeHoach();
    o += '<p class="tiny muted" style="margin-top:14px">'+ic('shield','w-3 h-3')+' Máy đề xuất, Coach quyết. GITA bám khung năng lực ICF để dạy và chấm — đây không phải chứng nhận ICF. Kỹ thuật NLP được ghi rõ mức bằng chứng; không dùng để chẩn đoán hay hứa kết quả.</p>';
    return o;
  };
})();
