/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY KIẾN TẠO CHƯƠNG TRÌNH COACH V20 (G.CO.v20)

   Đầu vào: nguồn thông tin của khách (lời kể, phiếu tiếp nhận) + dữ liệu
   hệ thống (phân tích đã có trong sổ, chỉ số hoạt động nếu nhà đang chạy
   chương trình). Đầu ra: MỘT CHƯƠNG TRÌNH COACH ĐỦ BỘ:

     1 Chẩn đoán   — đọc lời kể → vấn đề G–I–T–A, nhu cầu, sẵn sàng, tiềm
                     năng, KÈM câu trích làm bằng chứng; gộp với phân tích cũ.
     2 Mục tiêu    — kết quả định dạng tốt + đo bằng gì + baseline; máy soát.
     3 Lộ trình    — 5 pha thay đổi bền vững (G.CO_PHA), co giãn theo mức
                     sẵn sàng; mỗi pha: mục tiêu, cổng, KPI, kỹ thuật, giải pháp.
     4 Buổi coach  — từng buổi: bước chuỗi GITA, kỹ thuật NLP / khoa học hành
                     vi, năng lực ICF trọng tâm, sáu nhịp có kịch bản câu hỏi,
                     nhiệm vụ có tiêu chí xong, tiêu chí nghiệm thu.
     5 Đo thành quả — mốc chỉ tiêu từng pha, KPI dẫn và KPI kết quả.
     6 Duy trì     — tình huống dễ trượt, kế hoạch Nếu–Thì, hẹn soi lại
                     sau 30 · 60 · 90 ngày.

   "Đọc lời kể" là bộ đọc từ khoá tiếng Việt chạy NGAY TRÊN MÁY — không gửi
   chữ của gia đình ra ngoài. Máy ĐỀ XUẤT; Coach đọc lại, sửa và quyết.
   Không đụng máy chủ · giấy phép · mã hoá.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
(function(){
  var CO = G.CO = G.CO || {};
  var V = CO.v20 = {};

  /* ───────── 1 · ĐỌC LỜI KỂ ───────── */
  V.boDau = function(s){
    return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d');
  };
  function coCum(cau, cauBD, cum){
    var c = String(cum).toLowerCase();
    return cau.indexOf(c) >= 0 || cauBD.indexOf(V.boDau(c)) >= 0;
  }
  V.docVanBan = function(vb){
    var K = G.CO_TUKHOA || {}, out = { vd:{}, nc:{}, tn:{}, ss:null, trich:{}, soCau:0, soKhop:0 };
    var caus = String(vb||'').split(/[.!?\n;]+/).map(function(x){ return x.trim(); }).filter(function(x){ return x.length > 2; });
    out.soCau = caus.length;
    var ssDem = {};
    caus.forEach(function(goc){
      var cau = goc.toLowerCase(), bd = V.boDau(goc);
      var manh = (K.manh||[]).some(function(x){ return coCum(cau, bd, x); });
      var phu = (K.phu||[]).some(function(x){ return coCum(cau, bd, x); });
      Object.keys(K.vd||{}).forEach(function(ma){
        if(!(K.vd[ma]||[]).some(function(x){ return coCum(cau, bd, x); })) return;
        out.soKhop++;
        var lan = (out.trich[ma]||[]).length;
        var diem = (lan ? 1 : 0) + (manh ? 2 : 1) + 0;
        if(phu) diem = Math.max(1, diem - 1);
        out.vd[ma] = Math.min(3, Math.max(out.vd[ma]||0, diem + (lan ? (out.vd[ma]||0) - 1 : 0)));
        (out.trich[ma] = out.trich[ma] || []).push(goc);
      });
      Object.keys(K.nc||{}).forEach(function(ma){
        if((K.nc[ma]||[]).some(function(x){ return coCum(cau, bd, x); })){ out.nc[ma] = { qt:2, gap:2 };   /* nhu cầu nói thẳng = bối cảnh; vấn đề nặng vẫn đứng trước */ (out.trich['nc:'+ma] = out.trich['nc:'+ma]||[]).push(goc); }
      });
      Object.keys(K.tn||{}).forEach(function(ma){
        if((K.tn[ma]||[]).some(function(x){ return coCum(cau, bd, x); })){ out.tn[ma] = Math.max(out.tn[ma]||0, manh ? 3 : 2); (out.trich['tn:'+ma] = out.trich['tn:'+ma]||[]).push(goc); }
      });
      Object.keys(K.ss||{}).forEach(function(m){
        if((K.ss[m]||[]).some(function(x){ return coCum(cau, bd, x); })){ ssDem[m] = (ssDem[m]||0) + 1; (out.trich['ss:'+m] = out.trich['ss:'+m]||[]).push(goc); }
      });
    });
    /* Nhu cầu suy từ vấn đề khi lời kể không nói thẳng */
    Object.keys(out.vd).forEach(function(ma){
      var nc = (G.CO_VD_NC||{})[ma]; if(!nc) return;
      var o = out.nc[nc] || { qt:0, gap:0 };
      out.nc[nc] = { qt:Math.max(o.qt, out.vd[ma]), gap:Math.max(o.gap, out.vd[ma] >= 3 ? 3 : out.vd[ma] >= 2 ? 2 : 1) };
    });
    var ks = Object.keys(ssDem);
    if(ks.length) out.ss = Number(ks.sort(function(a,b){ return ssDem[b]-ssDem[a] || b-a; })[0]);
    return out;
  };

  /* Gộp lời kể vào phân tích đã có: lấy mức cao hơn, không xoá gì của Coach. */
  V.gop = function(cu, doc){
    cu = cu || {}; var r = { vd:{}, nc:{}, tn:{}, ss:cu.ss, tangHienTai:cu.tangHienTai, nutThat:cu.nutThat, tenNha:cu.tenNha };
    function maxObj(a, b){ var o = {}; Object.keys(a||{}).concat(Object.keys(b||{})).forEach(function(k){ o[k] = Math.max(Number((a||{})[k])||0, Number((b||{})[k])||0); }); return o; }
    r.vd = maxObj(cu.vd, doc.vd); r.tn = maxObj(cu.tn, doc.tn);
    Object.keys(cu.nc||{}).concat(Object.keys(doc.nc||{})).forEach(function(k){
      var a = (cu.nc||{})[k] || {}, b = (doc.nc||{})[k] || {};
      r.nc[k] = { qt:Math.max(Number(a.qt)||0, Number(b.qt)||0), gap:Math.max(Number(a.gap)||0, Number(b.gap)||0) };
    });
    if(r.ss == null || r.ss === '') r.ss = doc.ss != null ? doc.ss : 1;
    return r;
  };

  /* ───────── 2 · MỤC TIÊU & MÁY SOÁT ───────── */
  V.soatMucTieu = function(cau, doBang, nguoi){
    var c = String(cau||''), bd = V.boDau(c), ng = V.boDau(nguoi||'').trim();
    return [
      { t:'Nói ở thể khẳng định (điều muốn, không phải điều tránh)', ok:!/(^|[\s,])(không|bớt|đừng|ngừng|hết|thôi)(?=[\s,.]|$)/.test(c.toLowerCase().replace(/không cần nhắc|không đứt|không ngắt/g,'')) },
      { t:'Nằm trong tầm tay của con / gia đình', ok:/\b(con|em|cha me|bo me|ca nha|gia dinh)\b/.test(bd) || (!!ng && bd.indexOf(ng) >= 0) },
      { t:'Đo được (có con số, số ngày, số lần, phút, %)', ok:/\d|ngay|lan|phut|%|tuan/.test(bd) },
      { t:'Có thời hạn', ok:/sau \d+|tuan|thang|ngay|truoc/.test(bd) },
      { t:'Có cách đo / bằng chứng rõ', ok:String(doBang||'').trim().length > 5 }
    ];
  };

  /* ───────── 3–6 · TẠO CHƯƠNG TRÌNH ───────── */
  var TUAN_MAC = { 1:8, 2:10, 3:12, 4:24, 5:24 };
  var MUC_PHA = {
    1:['Cả nhà mô tả 1 ngày thật bằng hành vi quan sát được và chọn 1 chỉ số baseline: {cs}','Cả nhà đọc dữ liệu baseline 7 ngày, gọi tên 1 nút thắt thật theo G–I–T–A'],
    2:['Con tự nói 1 kết quả mong muốn theo cách định dạng tốt, có mốc đo','Con kể 3 lý do của chính mình và gọi tên 1 niềm tin đang cản','Con lập 1 kế hoạch WOOP: gọi tên 1 trở ngại bên trong và cách vượt'],
    3:['Con chọn 1 hành vi then chốt, viết kế hoạch Nếu–Thì, giữ ≥ 4/7 ngày tuần này','Cả nhà soi bằng chứng tuần trước, chỉnh 1 biến (PDCA), giữ ≥ 5/7 ngày','Con thêm 1 hành vi then chốt thứ hai khi hành vi đầu đã đạt ≥ 70% số ngày'],
    4:['Con đổi khúc giữa của 1 vòng thói quen; nhà dựng lại góc học và giờ thiết bị trong 7 ngày','Con giữ nhịp qua 1 tuần có biến động, không đứt quá 2 ngày','Con tự lập kế hoạch tuần 3 việc chính, cha mẹ chỉ hỏi, giữ ≥ 5/7 ngày'],
    5:['Con viết kế hoạch phòng tái phát cho 3 tình huống dễ trượt và cách quay lại trong 48 giờ','Con tự vận hành 14 ngày liền; Coach chỉ soi bằng chứng','Cả nhà tổng kết hành trình, đặt 3 mốc soi lại sau 30–60–90 ngày']
  };
  /* Đầu ra mong đợi của sáu nhịp (khớp màn Thiết kế bài) */
  var RA = ['Điểm cảm xúc 1–5 của từng người', 'Bảng đạt / chưa đạt của nhiệm vụ cũ, có minh chứng', 'Nút thắt được gọi tên theo G–I–T–A, có căn cứ',
    'Một phương án do chính gia đình chọn', '1–3 nhiệm vụ có tiêu chí xong, hạn, minh chứng', 'Cam kết của từng người + điểm buổi 1–5'];
  var MC = { 'ảnh':'anh', 'ghi âm':'ghi_am', 'văn bản':'van_ban', 'bảng tick':'bang' };
  var TRUOT = { 'a-thiet-bi':'Ngày nghỉ, cuối tuần, có game mới', 'a-tri-hoan':'Tuần nhiều bài, sát kỳ thi', 'a-xung-dot':'Lúc cả nhà mệt, cuối ngày',
    'a-nep-nha':'Nghỉ lễ, đi chơi xa, có khách', 'i-dong-luc':'Sau một bài kiểm điểm thấp', 'i-cam-xuc':'Áp lực thi, chuyện với bạn bè',
    'i-buong':'Khi tiến bộ chững lại 1–2 tuần', 't-tap-trung':'Học khuya, thiếu ngủ', 't-quan-ly':'Tuần có nhiều hoạt động ngoài giờ',
    'g-nguoi-lon':'Khi người lớn đặt thêm kỳ vọng mới', 'i-so-sai':'Bài khó, bị phê bình trước lớp' };

  function kt(ma){ return (G.CO_KT||[]).filter(function(k){ return k.ma===ma; })[0]; }
  V.kt = kt;
  function chiaNgay(tong, ty){
    var s = ty.reduce(function(a,b){ return a+b; }, 0), d = ty.map(function(x){ return Math.max(7, Math.round(tong*x/s)); });
    var lech = tong - d.reduce(function(a,b){ return a+b; }, 0);
    for(var i = d.length-1; lech !== 0 && i >= 0; i--){ var bot = lech < 0 ? Math.max(lech, 7 - d[i]) : lech; d[i] += bot; lech -= bot; if(lech === 0) break; }
    if(lech !== 0) d[d.length-1] += lech;
    return d;
  }

  V.taoKeHoach = function(o){
    var s = CO.st();
    var doc = V.docVanBan(o.vanBan||'');
    var pt = V.gop(s.pt[o.nha], doc);
    if(o.tangHienTai) pt.tangHienTai = Number(o.tangHienTai);
    var A = CO.phanTich(pt);
    var nguoi = (o.nguoi||'').trim() || 'con';
    /* Dữ liệu hệ thống: nhà đang chạy chương trình thì đọc chỉ số thật */
    var dkDang = CO.dsDK(true).filter(function(d){ return d.nha===o.nha && d.tt==='dang' && !d.mau; })[0] ||
                 CO.dsDK(true).filter(function(d){ return d.nha===o.nha && d.tt==='dang'; })[0];
    var cs = dkDang ? CO.chiSo(dkDang) : null;

    /* Nhu cầu chính → mẫu kết quả */
    var ncChinh = (A.ncTop[0] && A.ncTop[0].ma) || (A.nang[0] && (G.CO_VD_NC||{})[A.nang[0].ma]) || 'thoi-quen';
    var M = (G.CO_KQ||{})[ncChinh] || G.CO_KQ['thoi-quen'];
    var tuan = Math.max(4, Math.min(52, Number(o.tuan) || TUAN_MAC[A.tang] || 12));
    var buoiTuan = Number(o.buoiTuan) === 2 ? 2 : 1;
    var phut = Math.max(30, Math.min(120, Number(o.phut) || 60));
    var ngay = tuan * 7;
    var kq = /^con /.test(M.kq) ? nguoi+' '+M.kq.slice(4) : M.kq.replace(/ con /g, ' '+nguoi+' ');
    var mt = { cau:'Sau '+tuan+' tuần, '+kq+'.', do:M.do, cs:M.cs, nc:ncChinh };
    mt.soat = V.soatMucTieu(mt.cau, mt.do, nguoi);

    /* Lộ trình 5 pha: sẵn sàng cao thì nén pha đầu, không bỏ hẳn (vẫn cần tin cậy & baseline). */
    var ss = A.ss;
    var ty = (G.CO_PHA||[]).map(function(p){ var t = p.ty; if(ss >= 3 && p.so <= 2) t *= 0.45; else if(ss === 2 && p.so === 1) t *= 0.6; else if(ss <= 0 && p.so <= 2) t *= 1.4; return t; });
    var dai = chiaNgay(ngay, ty);
    var tongBuoi = tuan * buoiTuan;
    var nBuoi = dai.map(function(d){ return Math.max(1, Math.round(tongBuoi * d / ngay)); });
    var lechB = tongBuoi - nBuoi.reduce(function(a,b){ return a+b; }, 0); nBuoi[2] = Math.max(1, nBuoi[2] + lechB);

    var truNang = {}; A.nang.forEach(function(v){ truNang[v.tru] = (truNang[v.tru]||0) + 1; });
    var truUu = Object.keys(A.tru).sort(function(a,b){ return A.tru[b] - A.tru[a]; });
    var gpDS = A.gpDX.map(CO.gp).filter(Boolean);
    if(gpDS.length < 3) CO.dsGP().forEach(function(g){ if(gpDS.length < 6 && gpDS.indexOf(g) < 0 && g.tru === truUu[0]) gpDS.push(g); });

    var tu = 1, buoi = [], so = 0;
    var pha = (G.CO_PHA||[]).map(function(P, i){
      var den = tu + dai[i] - 1;
      /* Kỹ thuật của pha: ưu tiên kỹ thuật chạm trụ đang nặng */
      var ktPha = P.kt.map(kt).filter(Boolean).sort(function(a,b){
        function d(k){ return k.tru.reduce(function(s,t){ return s + (A.tru[t]||0); }, 0) + (k.nhom==='KH' ? 15 : 0); }
        return d(b) - d(a); });
      var truPha = []; P.chuoi.forEach(function(c){ var x = (G.CO_CHUOI||[])[c-1]; if(x && truPha.indexOf(x.tru) < 0) truPha.push(x.tru); });
      var gpPha = gpDS.filter(function(g){ return truPha.indexOf(g.tru) >= 0; }).slice(0,2);
      if(!gpPha.length && (P.so === 3 || P.so === 4)) gpPha = gpDS.slice(0,2);
      var p = { so:P.so, ten:P.ten, tu:tu, den:den, buoi:nBuoi[i], muc:P.muc, cong:P.cong,
        kpi:P.kpi.slice(), kt:ktPha.slice(0,3).map(function(k){ return k.ma; }), gp:gpPha.map(function(g){ return g.ma; }),
        chuoi:P.chuoi.slice(), icf:[] };
      ktPha.slice(0,3).forEach(function(k){ k.icf.forEach(function(c){ if(p.icf.indexOf(c) < 0) p.icf.push(c); }); });
      /* Mốc chỉ tiêu kết quả của pha */
      p.moc = ['Ghi baseline: '+M.cs, 'Chỉ tiêu do chính '+nguoi+' đặt, có số', 'Đạt khoảng 50% chỉ tiêu', 'Đạt khoảng 80% chỉ tiêu, giữ qua biến động', 'Đạt 100% và tự duy trì 14 ngày'][i];
      for(var b = 0; b < p.buoi; b++){
        so++;
        var off = p.buoi === 1 ? 0 : Math.round((dai[i]-1) * b / (p.buoi - 1));
        var k = ktPha[b % Math.max(1, Math.min(3, ktPha.length))] || kt('KH-GROW');
        var buocC = (G.CO_CHUOI||[])[(p.chuoi[b % p.chuoi.length]||1) - 1];
        var mucMau = MUC_PHA[P.so][Math.min(b, MUC_PHA[P.so].length-1)].replace('{cs}', M.cs);
        var g = gpPha[b % Math.max(1, gpPha.length)];
        buoi.push(V.taoBuoi({ so:so, pha:P.so, phaTen:P.ten, ngayThu:tu + off, kt:k, buocC:buocC, muc:mucMau, gp:g, phut:phut, nguoi:nguoi, ss:ss }));
      }
      tu = den + 1;
      return p;
    });

    /* Duy trì & phòng tái phát */
    var truot = A.nang.map(function(v){ return TRUOT[v.ma] ? { vd:v.ten, t:TRUOT[v.ma] } : null; }).filter(Boolean).slice(0,3);
    if(!truot.length) truot = [{ vd:'Thay đổi lịch sinh hoạt', t:'Nghỉ lễ, ốm, kỳ thi' }];
    var duyTri = {
      truot:truot.map(function(x){ return { tinhHuong:x.t, vd:x.vd, neuThi:'Nếu gặp "'+x.t.toLowerCase()+'", thì '+nguoi+' giữ phiên bản nhỏ nhất của thói quen (10–15 phút) và báo cho người nhắc trong nhà.' }; }),
      quyTac:'Quy tắc 48 giờ: trượt một ngày là bình thường — quay lại ngay hôm sau bằng việc nhỏ nhất.',
      hen:[30,60,90].map(function(n){ return { sau:n, ngay:n, viec:n===30?'Soi lại bảng tick và kế hoạch Nếu–Thì':n===60?'Đo lại chỉ số kết quả, chỉnh nếu tụt':'Tổng kết, quyết định lên tầng tiếp theo' }; })
    };
    var canhBao = A.ruiRo.slice();
    if(cs && cs.den === 'DO') canhBao.unshift('Nhà đang đèn đỏ trong chương trình hiện tại ('+cs.canhBao.map(function(x){ return x.t; }).join(' · ')+') — ổn định trước khi khởi động lộ trình mới.');
    if(Number(pt.vd['i-cam-xuc']) >= 3) canhBao.unshift('Cảm xúc ở mức nặng: buổi 1 ưu tiên an toàn; có dấu hiệu tổn thương sâu thì dừng coaching và chuyển chuyên gia (năng lực C1 — đạo đức).');
    if(!doc.soKhop && !Object.keys(s.pt[o.nha]||{}).length) canhBao.push('Lời kể chưa có thông tin máy đọc được — kết quả chỉ dựa trên mặc định. Nên ghi thêm lời kể hoặc làm phân tích trước.');

    return { id:CO.id('v20'), tao:Date.now(), tacGia:CO.toi().u, nha:o.nha, tenNha:o.tenNha||CO.tenNha(o.nha), nguoi:nguoi,
      chanDoan:{ doc:doc, pt:pt, A:A, chiSo:cs ? { ganKet:cs.ganKet, den:cs.den, thamGia:cs.p.thamGia, nhiemVu:cs.p.nhiemVu, imLang:cs.imLang } : null },
      mucTieu:mt, tuan:tuan, buoiTuan:buoiTuan, phut:phut, ngay:ngay, pha:pha, buoi:buoi, duyTri:duyTri,
      taiLieu:{ gp:gpDS.map(function(g){ return g.ma; }), kt:[].concat.apply([], pha.map(function(p){ return p.kt; })).filter(function(x,i,a){ return a.indexOf(x)===i; }) },
      canhBao:canhBao, vanBan:String(o.vanBan||'').slice(0,4000) };
  };

  /* Một buổi coach: sáu nhịp, mỗi nhịp có việc làm và câu hỏi lấy từ kỹ thuật */
  V.taoBuoi = function(x){
    var nhip = CO.nhip(), tong = nhip.reduce(function(a,n){ return a + (Number(n.phut)||0); }, 0) || 60;
    var k = x.kt || {}, g = x.gp;
    var cauK = (k.cau||[]).slice(), buocK = (k.buoc||[]);
    var nv = [];
    if(g && g.nv) g.nv.slice(0,2).forEach(function(t){ nv.push({ ten:t.ten, xong:t.xong, han:t.ngay||3, mc:'ảnh' }); });
    if(x.pha === 1 && !nv.length) nv.push({ ten:'Ghi baseline mỗi tối', xong:'Bảng ghi ≥ 5/7 ngày', han:7, mc:'bảng tick' });
    if(k.ma === 'KH-NT') nv.push({ ten:'Thực hiện kế hoạch Nếu–Thì mỗi ngày', xong:'Tick ≥ 5/7 lần kích hoạt', han:7, mc:'bảng tick' });
    if(k.ma === 'KH-WOOP' || k.ma === 'NLP-KQ') nv.push({ ten:'Viết lại mục tiêu bằng lời của chính '+x.nguoi, xong:'Câu viết tay hoặc ghi âm', han:3, mc:'văn bản' });
    if(k.ma === 'KH-PTP') nv.push({ ten:'Hoàn thành kế hoạch phòng tái phát', xong:'Bản kế hoạch có 3 tình huống', han:5, mc:'văn bản' });
    if(!nv.length) nv.push({ ten:'Một hành động nhỏ đã chọn trong buổi', xong:'Tick ≥ 5/7 ngày', han:7, mc:'bảng tick' });
    nv = nv.slice(0,3);
    var nhipRa = nhip.map(function(n, i){
      var phut = Math.max(3, Math.round((Number(n.phut)||10) * x.phut / tong));
      var lam = n.lam, hoi = n.hoi;
      if(i === 2 && buocK.length) { lam = n.lam + ' Dùng "'+k.ten+'": ' + buocK.slice(0, Math.ceil(buocK.length/2)).join(' → ') + '.'; hoi = cauK[0] || hoi; }
      if(i === 3 && buocK.length) { lam = n.lam + ' Tiếp "'+k.ten+'": ' + buocK.slice(Math.ceil(buocK.length/2)).join(' → ') + '.'; hoi = cauK[1] || cauK[0] || hoi; }
      if(i === 4 && g) lam = n.lam + ' Gợi ý từ giải pháp "'+g.ten+'".';
      if(i === 0 && x.pha === 1) hoi = 'Hôm nay mỗi người đang ở mức mấy trên năm? Điều gì khiến mình đến buổi này?';
      if(i === 5 && x.pha === 5) hoi = 'Nếu lỡ trượt, nhà mình quay lại bằng việc nhỏ nhất nào?';
      return { no:n.no, ten:n.ten, phut:phut, lam:lam, hoi:hoi, tranh:n.tranh };
    });
    return { so:x.so, pha:x.pha, phaTen:x.phaTen, ngayThu:x.ngayThu, ten:'Buổi '+x.so+' · '+x.buocC.ten+' · '+(k.ten||''), tru:x.buocC.tru, buocChuoi:x.buocC.so,
      kt:k.ma, icf:(k.icf||[]).slice(0,2), muc:x.muc, nhip:nhipRa, nv:nv, gp:g ? g.ma : '',
      nghiemThu:'Đối chiếu bằng chứng của nhiệm vụ buổi trước (đạt / chưa đạt) và chỉ số: '+(x.pha===1?'baseline đủ ngày':'tiến độ chỉ tiêu của pha') };
  };

  /* ───────── XUẤT BẢN: thành chương trình + bài + (tuỳ chọn) lịch ───────── */
  V.xuatBan = function(plan, tuy){
    tuy = tuy || {};
    var s = CO.st(); if(!Array.isArray(s.v20)) s.v20 = [];
    var maCT = 'V20-'+plan.id.split('-').slice(1).join('').slice(0,8).toUpperCase();
    var ct = { ma:maCT, ten:'V20 · '+plan.tenNha, tang:[plan.chanDoan.A.tang], ngay:plan.ngay, loai:'v20', c:'#5140B4',
      doiTuong:plan.tenNha+' — chương trình riêng do máy V20 kiến tạo từ lời kể và dữ liệu',
      mien:Object.keys(plan.chanDoan.A.tru).filter(function(k){ return plan.chanDoan.A.tru[k] > 0; }),
      muc:plan.mucTieu.cau,
      gd:plan.pha.map(function(p){ return { ten:p.ten, tu:p.tu, den:p.den, buoi:p.buoi, muc:p.muc, cong:p.cong }; }),
      kpi:[[plan.mucTieu.cs, 'đạt chỉ tiêu cuối lộ trình']].concat(plan.pha[2].kpi, plan.pha[3].kpi),
      vao:'Lời kể + phân tích của '+plan.tenNha, ra:'Đạt kết quả và tự duy trì 14 ngày · hẹn soi lại 30–60–90 ngày',
      capCoach:'R07', v20:plan.id, tao:Date.now(), tacGia:plan.tacGia };
    s.chuong.push(ct);
    var baiIds = [];
    plan.buoi.forEach(function(b){
      var bai = V.thanhBai(plan, ct, b);
      s.bai.push(bai); baiIds.push(bai.id);
    });
    /* Lưu phân tích gộp vào sổ phân tích (giữ lịch sử) */
    var cu = s.pt[plan.nha] || {};
    var pt = plan.chanDoan.pt;
    s.pt[plan.nha] = Object.assign({}, cu, { tenNha:plan.tenNha, vd:pt.vd, nc:pt.nc, tn:pt.tn, ss:pt.ss, tangHienTai:pt.tangHienTai||cu.tangHienTai,
      nutThat:cu.nutThat || plan.vanBan.slice(0,300), luc:Date.now(), ai:CO.toi().u,
      lichSu:(cu.lichSu||[]).concat([{ luc:Date.now(), ai:CO.toi().u, tru:plan.chanDoan.A.tru, tiemNang:plan.chanDoan.A.tiemNang, tang:plan.chanDoan.A.tang, nguon:'V20' }]) });
    var dk = null;
    if(tuy.ghep) dk = CO.ghep({ nha:plan.nha, tenNha:plan.tenNha, ct:ct.ma, coach:tuy.coach || CO.toi().u, batDau:tuy.batDau || CO.homNay() });
    plan.xuat = { ct:ct.ma, bai:baiIds, dk:dk ? dk.id : '', luc:Date.now() };
    s.v20.push(plan);
    CO.luu(false);
    return plan.xuat;
  };
  /* Một buổi V20 → bản ghi bài coach (cùng khuôn với màn Thiết kế bài) */
  V.thanhBai = function(plan, ct, b){
    var now = Date.now();
    return { id:CO.id('bai'), ten:b.ten, ct:ct.ma, gd:b.pha-1, buoi:b.so, nha:plan.nha, tru:b.tru, muc:b.muc,
      nhip:b.nhip.map(function(n, i){ return { phut:n.phut, lam:n.lam, hoi:n.hoi, cu:((V.kt(b.kt)||{}).ten||''), ra:RA[i]||'' }; }),
      nv:b.nv.map(function(t){ return { ten:t.ten, xong:t.xong, han:Number(t.han)||3, mc:MC[t.mc]||t.mc||'bang' }; }),
      nguon:'V20', gpDung:b.gp ? [b.gp] : [],
      nghiemThu:b.nghiemThu, ghiChu:'Kỹ thuật: '+((V.kt(b.kt)||{}).ten||b.kt)+' · ICF '+b.icf.join(', ')+' · do máy V20 kiến tạo',
      tao:now, sua:now, tacGia:plan.tacGia, mauChuan:false, v20:plan.id, kt:b.kt, icf:b.icf };
  };
  V.ds = function(){ var s = CO.st(); return Array.isArray(s.v20) ? s.v20 : []; };

  /* ───────── HÌNH MINH HOẠ (SVG thuần, theo màu chủ đề) ───────── */
  function esc(t){ return G.U.h(t); }
  V.ve = function(kieu, nhan, mau){
    mau = mau || '#5140B4'; nhan = nhan || [];
    var W = 320, H = 150, o = '';
    function tx(x, y, t, a){ return '<text x="'+x+'" y="'+y+'" font-size="11" fill="currentColor" text-anchor="'+(a||'middle')+'">'+esc(t)+'</text>'; }
    if(kieu === 'bac'){
      var n = Math.max(3, nhan.length || 4), w = (W-20)/n, hai = n > 4, day = hai ? H-34 : H-20;
      for(var i=0;i<n;i++){ var hh = 18 + i*((day-28)/n), cx = 10+i*w+(w-6)/2;
        o += '<rect x="'+(10+i*w)+'" y="'+(day-hh)+'" width="'+(w-6)+'" height="'+hh+'" rx="5" fill="'+mau+'" fill-opacity="'+(0.18+0.12*i)+'" stroke="'+mau+'"/>';
        var t = nhan[i]||('Bậc '+(i+1)), y = hai ? (i % 2 ? H-5 : H-19) : H-6;
        if(hai) o += '<line x1="'+cx+'" y1="'+day+'" x2="'+cx+'" y2="'+(y-9)+'" stroke="'+mau+'" stroke-opacity=".5"/>';
        o += '<text x="'+cx+'" y="'+y+'" font-size="'+(hai ? 10 : 11)+'" fill="currentColor" text-anchor="middle">'+esc(t.length > 16 ? t.slice(0,15)+'…' : t)+'</text>'; }
    } else if(kieu === 'vong'){
      var m = Math.max(3, nhan.length || 4), cx = W/2, cy = 72, r = 52;
      o += '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+mau+'" stroke-width="2" stroke-dasharray="6 5"/>';
      for(var j=0;j<m;j++){ var a = -Math.PI/2 + j*2*Math.PI/m, x = cx + r*Math.cos(a), y = cy + r*Math.sin(a);
        o += '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="7" fill="'+mau+'"/>'+tx((cx+(r+30)*Math.cos(a)).toFixed(1), (cy+(r+18)*Math.sin(a)+4).toFixed(1), (nhan[j]||'').slice(0,16)); }
    } else if(kieu === 'ghe'){
      var P = [[70,110],[250,110],[160,32]];
      o += '<polygon points="70,110 250,110 160,32" fill="'+mau+'" fill-opacity=".08" stroke="'+mau+'" stroke-dasharray="5 4"/>';
      P.forEach(function(p,i){ o += '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="14" fill="'+mau+'" fill-opacity=".85"/>'+'<text x="'+p[0]+'" y="'+(p[1]+4)+'" font-size="12" font-weight="700" fill="#fff" text-anchor="middle">'+(i+1)+'</text>'+tx(p[0], i===2 ? p[1]-20 : p[1]+30, nhan[i]||['Mình','Người kia','Người quan sát'][i]); });
    } else if(kieu === 'muiten'){
      o += '<line x1="20" y1="80" x2="290" y2="80" stroke="'+mau+'" stroke-width="3"/><polygon points="300,80 286,72 286,88" fill="'+mau+'"/>';
      var q = Math.max(2, nhan.length || 3);
      for(var k2=0;k2<q;k2++){ var xx = 30 + k2*(250/(q-1)); o += '<circle cx="'+xx+'" cy="80" r="6" fill="'+mau+'"/>'+tx(xx, k2%2 ? 110 : 60, (nhan[k2]||'').slice(0,16)); }
    } else if(kieu === 'pheu'){
      o += '<polygon points="40,20 280,20 200,90 120,90" fill="'+mau+'" fill-opacity=".14" stroke="'+mau+'"/><rect x="140" y="90" width="40" height="40" fill="'+mau+'" fill-opacity=".35" stroke="'+mau+'"/>';
      o += tx(160, 42, nhan[0]||'Câu khái quát'); o += tx(160, 70, nhan[1]||'Câu hỏi làm rõ'); o += tx(160, 146, nhan[2]||'Ví dụ cụ thể');
    } else if(kieu === 'khung'){
      o += '<rect x="30" y="16" width="260" height="118" rx="10" fill="none" stroke="'+mau+'" stroke-width="2"/><rect x="90" y="46" width="140" height="58" rx="8" fill="'+mau+'" fill-opacity=".14" stroke="'+mau+'"/>';
      o += tx(160, 80, nhan[0]||'Sự việc'); o += tx(160, 34, nhan[1]||'Khung nhìn mới');
    } else if(kieu === 'song'){
      var d1 = 'M10 70 C 50 30, 90 30, 130 70 S 210 110, 250 70', d2 = 'M70 80 C 110 40, 150 40, 190 80 S 270 120, 310 80';
      o += '<path d="'+d1+'" fill="none" stroke="currentColor" stroke-opacity=".55" stroke-width="2.5"/><path d="'+d2+'" fill="none" stroke="'+mau+'" stroke-width="2.5"/>';
      o += tx(60, 130, nhan[0]||'Hoà nhịp'); o += tx(250, 130, nhan[1]||'Dẫn dắt');
    } else if(kieu === 'neo'){
      o += '<circle cx="160" cy="34" r="10" fill="none" stroke="'+mau+'" stroke-width="3"/><line x1="160" y1="44" x2="160" y2="110" stroke="'+mau+'" stroke-width="3"/><path d="M110 92 Q 160 140 210 92" fill="none" stroke="'+mau+'" stroke-width="3"/><line x1="135" y1="62" x2="185" y2="62" stroke="'+mau+'" stroke-width="3"/>';
      o += tx(60, 70, nhan[0]||'Ký ức tự tin', 'middle'); o += tx(262, 70, nhan[1]||'Cử chỉ nhỏ', 'middle');
    } else if(kieu === 'thang'){
      for(var z=0; z<=10; z++){ var x3 = 20 + z*28; o += '<rect x="'+(x3-11)+'" y="60" width="22" height="26" rx="5" fill="'+mau+'" fill-opacity="'+(z===4?0.9:0.12+z*0.03)+'" stroke="'+mau+'"/>'+'<text x="'+x3+'" y="77" font-size="11" text-anchor="middle" fill="'+(z===4?'#fff':'currentColor')+'">'+z+'</text>'; }
      o += tx(132, 50, nhan[0]||'Hiện tại'); o += tx(160, 110, nhan[1]||'Bước +1: lên 5 sẽ khác gì?');
    }
    var nhanAria = (nhan.length ? nhan.join(' → ') : kieu);
    return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(nhanAria)+'" style="width:100%;max-width:420px;height:auto;display:block;color:var(--ink-2)">'+o+'</svg>';
  };
  /* Nhãn mặc định cho hình của từng kỹ thuật */
  V.nhanHinh = function(k){
    var m = { 'NLP-KQ':['Điều muốn','Trong tầm tay','Thấy·nghe·cảm','Sinh thái','Bước đầu'], 'NLP-CL':['Môi trường','Hành vi','Năng lực','Niềm tin','Bản sắc','Sứ mệnh'],
      'KH-GROW':['Mục tiêu','Thực trạng','Phương án','Cam kết'], 'KH-WOOP':['Ước','Kết quả','Trở ngại','Kế hoạch'], 'KH-TDM':['Nỗ lực','Chiến lược','Kiên trì','Tiến bộ'],
      'KH-MI':['Hỏi mở','Khẳng định','Phản hồi','Tóm tắt'], 'KH-VTQ':['Tín hiệu','Hành vi','Phần thưởng'], 'KH-PDCA':['Kế hoạch','Làm','Kiểm','Chỉnh'],
      'NLP-TL':['Hôm nay','Mốc giữa','Ngày đạt'], 'KH-NT':['Nếu…','Thì…','Tick'], 'NLP-MM':['"Luôn luôn…"','Có lần nào không?','Ví dụ cụ thể'],
      'NLP-DK':['Sự việc','Khung nhìn mới'], 'KH-PTP':['Tình huống trượt','Kế hoạch quay lại'], 'NLP-NN':['Hoà nhịp','Dẫn dắt'], 'NLP-GQ':['Nghe từ giác quan','Đáp cùng loại'],
      'NLP-NE':['Ký ức tự tin','Cử chỉ nhỏ'], 'NLP-VT':['Mình','Người kia','Người quan sát'], 'KH-SC':['Hiện tại: 4','Bước +1: lên 5 sẽ khác gì?'] };
    return m[k.ma] || [];
  };
  /* Bản đồ lộ trình 5 pha */
  V.veLoTrinh = function(plan){
    var W = 640, H = 150, tong = plan.ngay, mauP = ['#185AB4','#5140B4','#0B6675','#0B7350','#B4720F'], o = '';
    plan.pha.forEach(function(p, i){
      var x = 10 + (p.tu-1)/tong*(W-20), w = Math.max(26, (p.den-p.tu+1)/tong*(W-20) - 4), cx = (x + w/2).toFixed(1);
      var hep = w < 120, y = 84 + (hep && i % 2 ? 30 : 0);
      var ten = ['Kết nối','Động lực','Thử nghiệm','Củng cố','Duy trì'][p.so-1] || p.ten;
      o += '<rect x="'+x.toFixed(1)+'" y="30" width="'+w.toFixed(1)+'" height="34" rx="8" fill="'+mauP[i]+'" fill-opacity=".85"/>'+
        '<text x="'+cx+'" y="52" font-size="12" font-weight="700" fill="#fff" text-anchor="middle">P'+p.so+(w > 80 ? ' · '+p.buoi+' buổi' : '')+'</text>'+
        (hep ? '<line x1="'+cx+'" y1="64" x2="'+cx+'" y2="'+(y-12)+'" stroke="'+mauP[i]+'" stroke-width="1"/>' : '')+
        '<text x="'+cx+'" y="'+y+'" font-size="11" font-weight="600" fill="currentColor" text-anchor="middle">'+esc(ten)+'</text>'+
        '<text x="'+cx+'" y="'+(y+14)+'" font-size="10" fill="currentColor" fill-opacity=".7" text-anchor="middle">ngày '+p.tu+'–'+p.den+'</text>';
    });
    o += '<text x="10" y="18" font-size="11" fill="currentColor" fill-opacity=".7">Ngày 1</text><text x="'+(W-10)+'" y="18" font-size="11" fill="currentColor" fill-opacity=".7" text-anchor="end">Ngày '+tong+' · '+plan.tuan+' tuần · '+plan.buoi.length+' buổi</text>';
    return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Lộ trình 5 pha trong '+plan.tuan+' tuần" style="width:100%;max-width:820px;height:auto;display:block;margin:0 auto;color:var(--ink-2)">'+o+'</svg>';
  };

})();
