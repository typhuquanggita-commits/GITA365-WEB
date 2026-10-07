/* ═══════════════════════════════════════════════════════════════
   GITA 365 — HỆ ĐIỀU HÀNH COACH · MÀN TỔNG (coach-he)

   Một màn nhìn cả vòng vận hành Coach, số liệu đọc thẳng từ sổ chung
   (coach-loi.js):

     Phân tích khách → Chương trình → Thiết kế bài → Điều phối & giám sát
       → Kiểm soát chất lượng → (quay lại cải tiến chương trình & bài)
     Giải pháp + Kho tài liệu cấp nguyên liệu cho mọi bước.

   Mở cho pro_coach. Không đụng máy chủ · giấy phép · mã hoá.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic, CO = G.CO;

  var HE = [
    { v:'coach-pt',  so:'1', ic:'target',  c:'--t1', ten:'Phân tích vấn đề – nhu cầu – tiềm năng', mo:'Soi nhà theo bốn trụ G–I–T–A, mười hai nhu cầu, tám chiều tiềm năng → tầng và chương trình đề xuất.' },
    { v:'coach-ct',  so:'2', ic:'compass', c:'--t2', ten:'Chương trình coach', mo:'Mười chương trình chuẩn: giai đoạn, buổi, cổng nghiệm thu, KPI. Ghép chương trình cho từng nhà.' },
    { v:'coach-tk',  so:'3', ic:'edit',    c:'--t3', ten:'Thiết kế bài coach', mo:'Soạn buổi theo sáu nhịp, mục tiêu đo được, nhiệm vụ có tiêu chí xong; máy soát mười luật.' },
    { v:'coach-dp',  so:'4', ic:'pulse',   c:'--t4', ten:'Điều phối & giám sát', mo:'Lịch buổi, nhật ký từng hoạt động của gia đình, điểm gắn kết, đèn và cảnh báo sớm.' },
    { v:'coach-cl',  so:'5', ic:'shield',  c:'--t5', ten:'Kiểm soát & đo lường chất lượng', mo:'Chấm buổi mười tiêu chí, lằn ranh đỏ, chỉ số chất lượng từng Coach và kết quả gia đình.' },
    { v:'coach-gp',  so:'6', ic:'spark',   c:'--t2', ten:'Giải pháp coach', mo:'Thư viện giải pháp theo vấn đề: bước làm, nhiệm vụ mẫu, dấu hiệu thành công, khi nào chuyển.' },
    { v:'coach-kho', so:'7', ic:'vault',   c:'--t3', ten:'Kho tài liệu coach', mo:'Một cửa tìm mọi tư liệu: mô thức, phác đồ, kịch bản, bài học, bộ test, tài liệu tải lên.' },
    { v:'coach-v20', so:'V20', ic:'sparkle', c:'--t5', ten:'Kiến tạo chương trình V20', mo:'Dán lời kể của gia đình → máy dựng trọn chương trình: chẩn đoán có bằng chứng, mục tiêu chuẩn, lộ trình 5 pha, từng buổi có kịch bản, đo thành quả, duy trì.' },
    { v:'coach-nlp', so:'NLP', ic:'book',  c:'--t4', ten:'Thư viện NLP × GITA · chuẩn ICF', mo:'18 kỹ thuật có minh hoạ, quy trình coach 7 bước, chuỗi hành động GITA, 8 năng lực ICF, lộ trình thay đổi bền vững.' }
  ];

  function soLieu(){
    var dk = CO.dsDK().filter(function(d){ return d.tt==='dang'; });
    var hn = CO.homNay(), tuan = CO.cong(hn, 7);
    var cs = dk.map(function(d){ return { d:d, c:CO.chiSo(d) }; });
    var gk = cs.map(function(x){ return x.c.ganKet; }).filter(function(x){ return x!=null; });
    var buoiTuan = 0; dk.forEach(function(d){ d.lich.forEach(function(b){ if(b.ngay >= hn && b.ngay <= tuan && b.tt==='cho') buoiTuan++; }); });
    var s = CO.st(), thang = Date.now() - 30*86400000;
    var me = CO.toi().u, cl = s.cl.filter(function(p){ return p.t >= thang && (CO.laQuanLy() || p.coach===me); });
    var cq = cl.map(function(p){ return CO.cqi(p).diem; }).filter(function(x){ return x!=null; });
    return {
      nha:dk.length, buoiTuan:buoiTuan,
      ganKet: gk.length ? Math.round(gk.reduce(function(a,b){ return a+b; },0)/gk.length) : null,
      doDo: cs.filter(function(x){ return x.c.den==='DO'; }).length,
      vang: cs.filter(function(x){ return x.c.den==='VANG'; }).length,
      cs:cs, phieu:cl.length, cqi: cq.length ? Math.round(cq.reduce(function(a,b){ return a+b; },0)/cq.length) : null,
      pt:Object.keys(s.pt).length, bai:s.bai.length, ghim:s.ghim.length
    };
  }

  function soCuaHe(v, S){
    if(v==='coach-pt') return S.pt+' nhà đã phân tích';
    if(v==='coach-ct') return CO.dsCT().length+' chương trình · '+S.nha+' nhà đang chạy';
    if(v==='coach-tk') return S.bai+' bài đã thiết kế';
    if(v==='coach-dp') return S.buoiTuan+' buổi 7 ngày tới · '+S.doDo+' nhà đỏ';
    if(v==='coach-cl') return S.phieu+' phiếu 30 ngày'+(S.cqi!=null?' · chất lượng '+S.cqi:'');
    if(v==='coach-gp') return CO.dsGP().length+' giải pháp';
    if(v==='coach-kho') return S.ghim+' tài liệu đã ghim';
    if(v==='coach-v20') return (CO.v20 ? CO.v20.ds().length : 0)+' chương trình đã kiến tạo';
    if(v==='coach-nlp') return (G.CO_KT||[]).length+' kỹ thuật · '+(G.CO_ICF||[]).length+' năng lực ICF';
    return '';
  }

  G.VIEWS['coach-he'] = function(){
    var k = CO.cua('pro_coach', 'Hệ điều hành Coach'); if(k) return k;
    CO.napMau();
    var S = soLieu();
    var o = U.ph({ eyebrow:'COACH · HỆ ĐIỀU HÀNH', ic:'grid', grad:1, t:'Hệ điều hành Coach — bảy hệ thống + V20, một sổ',
      lead:'Từ lúc phân tích một gia đình tới lúc đo được từng hoạt động của họ: chương trình, bài coach, điều phối, chất lượng, giải pháp và kho tư liệu chạy chung một sổ và một bộ công thức.' });
    o += CO.banMau();
    o += '<div class="grid g4 mb">'+
      U.stat({ k:'Nhà đang tham gia', v:String(S.nha), d:CO.laQuanLy()?'toàn đội':'nhà tôi phụ trách' })+
      U.stat({ k:'Gắn kết trung bình', v:S.ganKet==null?'—':S.ganKet+'/100', d:'tham gia · nhiệm vụ · minh chứng · nhịp', c:S.ganKet==null?null:S.ganKet>=70?'#0B7350':S.ganKet>=45?'#B4720F':'#BE0E16' })+
      U.stat({ k:'Nhà đèn đỏ', v:String(S.doDo), d:S.vang+' nhà vàng', c:S.doDo?'#BE0E16':'#0B7350' })+
      U.stat({ k:'Chất lượng buổi', v:S.cqi==null?'—':S.cqi+'/100', d:S.phieu+' phiếu chấm 30 ngày' })+'</div>';

    /* Việc cần làm ngay: cảnh báo đỏ trước */
    var viec = [];
    S.cs.forEach(function(x){ x.c.canhBao.forEach(function(cb){ viec.push({ m:cb.m, t:cb.t, d:x.d }); }); });
    viec.sort(function(a,b){ return (a.m==='do'?0:1) - (b.m==='do'?0:1); });
    o += U.sec('Cần làm ngay', viec.length ? 'Tính từ nhật ký hoạt động — đỏ lên trước' : 'Không có cảnh báo nào');
    if(viec.length){
      o += '<div class="co-cb mb">'+ viec.slice(0,6).map(function(x){
        return '<div style="--m:'+(x.m==='do'?'#BE0E16':'#B4720F')+'"><span class="co-grow"><b>'+h(x.d.tenNha)+'</b> — '+h(x.t)+'</span>'+
          '<button class="btn ghost sm" data-co="he-mo-nha" data-dk="'+h(x.d.id)+'">Mở nhà '+ic('arrow','w-3 h-3')+'</button></div>'; }).join('') +'</div>';
    }

    o += U.sec('Bảy hệ thống + V20', 'Theo đúng vòng vận hành: phân tích → chương trình → bài → điều phối → chất lượng; giải pháp và kho cấp nguyên liệu; V20 tự kiến tạo cả chương trình');
    o += '<div class="gdv-luoi">'+ HE.map(function(x){
      var mo = G.allowed ? G.allowed(x.v) : true;
      return '<div class="gdv-the'+(mo?'':' off')+'" style="--c:var('+x.c+')"><div class="gdv-h">'+
        '<span class="vh-so">'+h(x.so)+'</span><span class="vh-ic">'+ic(x.ic)+'</span><b class="gdv-t">'+h(x.ten)+'</b>'+
        (mo ? '<button class="btn sm vh-mo" data-v="'+h(x.v)+'">'+ic('arrow','w-3 h-3')+'Mở</button>' : '<span class="vh-khoa">'+ic('lock','w-3 h-3')+'khoá</span>')+
        '</div><div class="gdv-nvwrap"><p class="sm" style="margin:0 0 8px;line-height:1.55">'+h(x.mo)+'</p>'+
        '<span class="tiny muted co-so">'+h(soCuaHe(x.v, S))+'</span></div></div>';
    }).join('') +'</div>';

    o += '<p class="tiny muted" style="margin-top:14px">'+ic('shield','w-3 h-3')+' Sổ Coach lưu trên máy này, gắn tên người đăng nhập; đổi người là sổ được dọn. '+
      (CO.coMayChu() ? 'Đã nối máy chủ: sổ chạm của từng nhà kéo về được ở màn Điều phối.' : 'Khi nối máy chủ, sổ chạm của từng nhà kéo về được ở màn Điều phối.')+'</p>';
    return o;
  };

  CO.on('he-mo-nha', function(el){ CO.st().tab['coach-dp'] = 'nha'; CO.st().dpNha = el.getAttribute('data-dk'); CO.luu(false); G.go('coach-dp'); });
})();
