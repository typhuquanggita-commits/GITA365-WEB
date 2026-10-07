/* ═══════════════════════════════════════════════════════════════
   GITA 365 — HỆ ĐIỀU HÀNH COACH · THIẾT KẾ BÀI COACH (coach-tk)

   Ba thẻ, đọc và ghi một sổ chung (coach-loi.js · sổ.bai):

     Soạn bài      một buổi coach = chương trình + giai đoạn + buổi số +
                   trụ trọng tâm + mục tiêu đo được + sáu nhịp (CO.nhip)
                   + tối đa năm nhiệm vụ (tiêu chí xong · hạn · minh
                   chứng) + tiêu chí nghiệm thu + ghi chú an toàn.
                   "Soạn nháp tự động" lấy nguyên liệu từ giai đoạn của
                   chương trình, giải pháp chuẩn (G.CO_GP) cùng trụ và
                   tầng, và phân tích của nhà (CO.phanTich) nếu có.
                   MÁY SOÁT 10 LUẬT chạy ngay bên cạnh khi gõ, chấm x/10,
                   lưu điểm lần soát cuối lên bài.
     Thư viện bài  lọc, mở, sửa, nhân bản, xoá, đánh dấu mẫu chuẩn (quản
                   lý), in / xuất bản kế hoạch buổi, và giao nhiệm vụ của
                   bài cho một nhà đang chạy chương trình → nhật ký
                   'nv_giao' (nuôi công thức giám sát CO.chiSo).
     Chuẩn soát    giải thích mười luật và sáu nhịp, kèm nguồn.

   Coach thấy bài của mình + bài mẫu chuẩn; Trưởng nhóm trở lên thấy cả
   đội. Không đụng máy chủ · giấy phép · mã hoá.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic, CO = G.CO;
  function icI(n){ return '<span style="display:inline-flex;vertical-align:-2px">'+ic(n,'w-3 h-3')+'</span>'; }
  var VIEW = 'coach-tk';
  var MC = [['anh','Ảnh'],['ghi_am','Ghi âm'],['van_ban','Văn bản'],['bang','Bảng tick']];
  var TEN_MC = { anh:'Ảnh', ghi_am:'Ghi âm', van_ban:'Văn bản', bang:'Bảng tick' };
  var RA = ['Điểm cảm xúc 1–5 của từng người', 'Bảng đạt / chưa đạt của nhiệm vụ cũ, có minh chứng', 'Nút thắt được gọi tên theo G–I–T–A, có căn cứ',
    'Một phương án do chính gia đình chọn', '1–3 nhiệm vụ có tiêu chí xong, hạn, minh chứng', 'Cam kết của từng người + điểm buổi 1–5'];
  var CAM = ['chắc chắn','đảm bảo','cam kết 100','100%','phải','hư','lười','con nhà người ta','so với','không được khóc'];
  var DONG_TU = ['viết','nói','kể','ghi','làm','chọn','lập','đặt','đọc','tick','chấm','ký','liệt kê','vẽ','gọi tên','hoàn thành','thực hiện','trình bày',
    'xác định','thử','học','dựng','đo','nộp','chụp','giảng','họp','thống nhất','mô tả','thoả thuận','thỏa thuận','giữ','đưa ra','nghe','hỏi','tìm','xếp','chia','phân loại','tự'];
  var LUAT = [
    { so:1, ten:'Mục tiêu có hành vi và con số đo được', tc:'muc-tieu', goi:'Viết theo khuôn "ai – làm gì – bao nhiêu / mốc nào", ví dụ: "Con tự lập kế hoạch tuần 3 việc, giữ ≥ 5/7 ngày".' },
    { so:2, ten:'Tổng thời lượng 45–90 phút', tc:'dung-nhip', goi:'Cộng phút sáu nhịp vào khoảng 45–90; buổi quá ngắn bỏ sót nhịp, quá dài làm nhà mệt.' },
    { so:3, ten:'Đủ sáu nhịp, nhịp nào cũng có hoạt động', tc:'du-nhip', goi:'Điền hoạt động và số phút cho từng nhịp — không bỏ soi bằng chứng, không bỏ chốt.' },
    { so:4, ten:'Câu hỏi chính là câu hỏi mở', tc:'ngon-ngu', goi:'Bắt đầu bằng "điều gì", "khi nào", "làm sao", "nếu…"; kết thúc bằng "?"; tránh câu trả lời có/không.' },
    { so:5, ten:'Không có câu cấm', tc:'ngon-ngu', goi:'Bỏ lời hứa tuyệt đối, lời gán nhãn, lời so sánh, lời ép buộc; thay bằng mô tả hành vi và lời mời.' },
    { so:6, ten:'Một đến ba nhiệm vụ vừa sức', tc:'nhiem-vu', goi:'Giữ 1–3 việc; việc thứ tư trở đi để buổi sau.' },
    { so:7, ten:'Mỗi nhiệm vụ có tiêu chí xong và hạn', tc:'nhiem-vu', goi:'Ghi "xong là khi…" và số ngày tới hạn cho từng việc.' },
    { so:8, ten:'Mỗi nhiệm vụ có loại minh chứng', tc:'nghiem-thu', goi:'Chọn ảnh, ghi âm, văn bản hay bảng tick — nghiệm thu bằng bằng chứng, không bằng cảm nhận.' },
    { so:9, ten:'Có tiêu chí nghiệm thu buổi', tc:'nghiem-thu', goi:'Viết rõ khi nào buổi được coi là đạt — tốt nhất gắn với cổng của giai đoạn.' },
    { so:10, ten:'Gắn đúng chương trình và giai đoạn', tc:'chuan-bi', goi:'Chọn chương trình, giai đoạn và buổi số nằm trong giai đoạn ấy.' }
  ];

  /* ───────── Tiện ích ───────── */
  function veGiu(focusId){
    var y = window.pageYOffset || 0; CO.luu(); window.scrollTo(0, y);
    if(focusId){ var el = document.getElementById(focusId); if(el && el.focus) try{ el.focus({ preventScroll:true }); }catch(e){ el.focus(); } }
  }
  function tenTru(k){ var g = (G.GITA||[]).filter(function(x){ return x.k===k; })[0]; return g ? g.short : (k||'—'); }
  function mauTru(k){ var g = (G.GITA||[]).filter(function(x){ return x.k===k; })[0]; return g ? g.c : '#73849F'; }
  function gru(k){ return (G.GITA||[]).filter(function(x){ return x.k===k; })[0] || null; }
  function khoang(ct, gi){
    var a = 0; for(var i=0;i<(ct.gd||[]).length;i++){ var n = Math.max(1, Number(ct.gd[i].buoi)||1); if(i===gi) return { tu:a+1, den:a+n }; a += n; }
    return null;
  }
  function tongBuoi(ct){ return (ct.gd||[]).reduce(function(a,g){ return a + Math.max(1, Number(g.buoi)||1); }, 0); }
  function canSua(b){ return CO.laQuanLy() || b.tacGia===CO.toi().u; }
  function dsBai(){ var me = CO.toi().u; return CO.st().bai.filter(function(b){ return CO.laQuanLy() || b.tacGia===me || b.mauChuan || b.mau; }); }
  function bai(id){ return CO.st().bai.filter(function(b){ return b.id===id; })[0] || null; }
  function tenGhim(g){ return String((g && (g.ten || g.t || g.tieuDe || g.title)) || '').trim(); }
  function mauDiem(d){ return d==null ? 'var(--ink-4)' : d>=8 ? CO.MAU_DEN.XANH : d>=6 ? CO.MAU_DEN.VANG : CO.MAU_DEN.DO; }
  function esc(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  var CHU = '0-9a-zà-ỹđ';
  function coCum(text, cum){
    var t = String(text||'').toLowerCase();
    try{ t = t.normalize('NFC'); }catch(e){}
    return new RegExp('(^|[^'+CHU+'])'+esc(cum)+'(?=$|[^'+CHU+'])').test(t);
  }

  /* ───────── Bản nháp đang soạn (sổ.tkNhap) ───────── */
  function nhipMoi(){ return CO.nhip().map(function(b){ return { phut:Number(b.phut)||10, lam:b.lam||'', hoi:b.hoi||'', cu:'', ra:'' }; }); }
  function moiNhap(maCT){
    var ct = CO.ct(maCT);
    return { id:null, ten:'', ct:ct?ct.ma:'', gd:0, buoi:1, nha:'', tru:ct && ct.mien && ct.mien[0] || 'G', muc:'', nhip:nhipMoi(),
      nv:[{ ten:'', xong:'', han:'', mc:'' }], nghiemThu:'', ghiChu:'', nguon:'', gpDung:[] };
  }
  function tuBai(b){
    var n = JSON.parse(JSON.stringify(b));
    n.nhip = n.nhip || []; n.nv = n.nv || []; n.gpDung = n.gpDung || [];
    return n;
  }
  function nhap(){
    var s = CO.st();
    if(!s.tkNhap || !Array.isArray(s.tkNhap.nhip)) s.tkNhap = moiNhap('');
    var n = s.tkNhap, nh = CO.nhip();
    while(n.nhip.length < nh.length){ var b = nh[n.nhip.length]; n.nhip.push({ phut:Number(b.phut)||10, lam:b.lam||'', hoi:b.hoi||'', cu:'', ra:'' }); }
    if(n.nhip.length > nh.length) n.nhip = n.nhip.slice(0, nh.length);
    if(!Array.isArray(n.nv)) n.nv = [];
    return n;
  }
  function soN(id){ var v = CO.o(id); if(v==='') return ''; var x = Number(v); return isNaN(x) ? v : x; }
  function docNhap(){
    var n = nhap();
    if(!document.getElementById('tk-ten')) return n;
    n.ten = CO.o('tk-ten'); n.ct = CO.o('tk-ct'); n.gd = Number(CO.o('tk-gd'))||0; n.buoi = soN('tk-buoi');
    n.nha = CO.o('tk-nha'); n.tru = CO.o('tk-tru') || n.tru; n.muc = CO.o('tk-muc');
    n.nhip = n.nhip.map(function(x, i){ var p = 'tk-n'+i+'-';
      return { phut:soN(p+'phut'), lam:CO.o(p+'lam'), hoi:CO.o(p+'hoi'), cu:CO.o(p+'cu'), ra:CO.o(p+'ra') }; });
    n.nv = n.nv.map(function(x, i){ var p = 'tk-v'+i+'-';
      return { ten:CO.o(p+'ten'), xong:CO.o(p+'xong'), han:soN(p+'han'), mc:CO.o(p+'mc') }; });
    n.nghiemThu = CO.o('tk-nt'); n.ghiChu = CO.o('tk-at');
    return n;
  }

  /* ───────── MÁY SOÁT 10 LUẬT ───────── */
  function soat(b){
    var R = [], nh = CO.nhip(), nhip = b.nhip || [], nv = (b.nv||[]).filter(function(x){ return x.ten; });
    function them(so, dat, chi, muc){ var L = LUAT[so-1]; R.push({ so:so, ten:L.ten, goi:L.goi, dat:!!dat, muc:muc || (dat?'dat':'truot'), chi:chi||'' }); }
    /* 1 */
    var muc = String(b.muc||'').trim();
    var coSo = /\d|lần|ngày|%|phút|tuần|buổi|giờ|mốc/i.test(muc), coDT = DONG_TU.some(function(v){ return coCum(muc, v); });
    them(1, muc.length >= 12 && coSo && coDT, !muc ? 'Chưa có mục tiêu buổi.' : !coDT ? 'Chưa thấy động từ hành vi (viết, nói, chọn, lập, ghi…).' : !coSo ? 'Chưa có con số hay mốc đo được.' : muc.length < 12 ? 'Mục tiêu quá ngắn.' : 'Có hành vi và mốc đo.');
    /* 2 */
    var phut = nhip.reduce(function(a,x){ return a + (Number(x.phut)||0); }, 0);
    them(2, phut >= 45 && phut <= 90, 'Tổng '+phut+' phút'+(phut<45?' — ngắn quá.':phut>90?' — dài quá.':'.'));
    /* 3 */
    var thieu = []; nh.forEach(function(x, i){ var y = nhip[i] || {}; if(!String(y.lam||'').trim() || !(Number(y.phut) > 0)) thieu.push(i+1); });
    them(3, !thieu.length && nh.length, thieu.length ? 'Nhịp '+thieu.join(', ')+' chưa có hoạt động hoặc số phút.' : 'Đủ '+nh.length+' nhịp.');
    /* 4 */
    var dong = [];
    nh.forEach(function(x, i){
      var q = String((nhip[i]||{}).hoi||'').trim(), ql = q.toLowerCase();
      if(!q) { dong.push('nhịp '+(i+1)+' trống'); return; }
      if(!/\?\s*$/.test(q)) { dong.push('nhịp '+(i+1)+' thiếu "?"'); return; }
      if(/^(có phải|sao không|đúng không)/.test(ql) || /(đúng không|phải không|được không|không nhỉ)\s*\?\s*$/.test(ql) || /^có\s.+\skhông\s*\?\s*$/.test(ql)) dong.push('nhịp '+(i+1)+' là câu có/không');
    });
    them(4, !dong.length, dong.length ? 'Cần sửa: '+dong.join('; ')+'.' : 'Cả '+nh.length+' câu hỏi đều mở.');
    /* 5 */
    var trung = [];
    function quet(nhan, text){ CAM.forEach(function(c){ if(coCum(text, c)) trung.push('"'+c+'" ở '+nhan); }); }
    quet('tên bài', b.ten); quet('mục tiêu buổi', b.muc);
    nhip.forEach(function(x, i){ quet('nhịp '+(i+1)+' · hoạt động', x.lam); quet('nhịp '+(i+1)+' · câu hỏi', x.hoi); quet('nhịp '+(i+1)+' · công cụ', x.cu); quet('nhịp '+(i+1)+' · đầu ra', x.ra); });
    (b.nv||[]).forEach(function(x, i){ quet('nhiệm vụ '+(i+1), x.ten); quet('nhiệm vụ '+(i+1)+' · tiêu chí', x.xong); });
    quet('tiêu chí nghiệm thu', b.nghiemThu);
    them(5, !trung.length, trung.length ? trung.slice(0,5).join(' · ')+(trung.length>5?' · và '+(trung.length-5)+' chỗ khác':'') : 'Không có câu cấm.');
    /* 6 */
    var k = nv.length;
    them(6, k >= 1 && k <= 3, k===0 ? 'Chưa có nhiệm vụ nào.' : k<=3 ? k+' nhiệm vụ — vừa sức.' : k+' nhiệm vụ — quá sức, chưa tính điểm.', k > 3 ? 'canh' : null);
    /* 7 */
    var t7 = nv.filter(function(x){ return !String(x.xong||'').trim() || !(Number(x.han) >= 1); });
    them(7, k && !t7.length, !k ? 'Chưa có nhiệm vụ để xét.' : t7.length ? t7.length+' nhiệm vụ thiếu tiêu chí xong hoặc hạn: '+t7.map(function(x){ return '"'+x.ten+'"'; }).join(', ') : 'Đủ tiêu chí và hạn.');
    /* 8 */
    var t8 = nv.filter(function(x){ return !TEN_MC[x.mc]; });
    them(8, k && !t8.length, !k ? 'Chưa có nhiệm vụ để xét.' : t8.length ? t8.length+' nhiệm vụ chưa chọn loại minh chứng.' : 'Đủ loại minh chứng.');
    /* 9 */
    var nt = String(b.nghiemThu||'').trim();
    them(9, nt.length >= 10, nt ? (nt.length < 10 ? 'Tiêu chí quá ngắn.' : 'Có tiêu chí nghiệm thu.') : 'Chưa có tiêu chí nghiệm thu buổi.');
    /* 10 */
    var ct = CO.ct(b.ct), g = ct && (ct.gd||[])[Number(b.gd)], kh = g ? khoang(ct, Number(b.gd)) : null, bs = Number(b.buoi);
    var c10 = !ct ? 'Chưa chọn chương trình.' : !g ? 'Giai đoạn không thuộc chương trình.' : !bs ? 'Chưa ghi buổi số.' :
      (bs < kh.tu || bs > kh.den) ? 'Buổi '+bs+' không thuộc "'+g.ten+'" (buổi '+kh.tu+'–'+kh.den+').' : 'Buổi '+bs+' · '+g.ten+'.';
    them(10, ct && g && bs && bs >= kh.tu && bs <= kh.den, c10);
    var diem = R.filter(function(x){ return x.dat; }).length;
    return { diem:diem, luat:R, phut:phut };
  }

  function veSoat(n){
    var S = soat(n), d = S.diem;
    var o = '<div class="card pad-sm"><div class="co-hang"><b class="co-grow">Máy soát 10 luật</b>'+
      '<span class="co-so" style="font-size:26px;font-weight:800;color:'+mauDiem(d)+'">'+d+'<span class="sm muted">/10</span></span></div>'+
      '<div class="co-thanhbar mt" style="--m:'+mauDiem(d)+'"><i style="width:'+(d*10)+'%"></i></div>'+
      '<div class="tiny muted mt">'+(d>=8?'Đạt chuẩn — dùng được.':d>=6?'Gần đạt — sửa các luật đỏ trước khi dẫn.':'Chưa dùng được — sửa các luật đỏ.')+
        ' · Tổng '+S.phut+' phút'+(n.id && bai(n.id) && bai(n.id).diem!=null ? ' · lần lưu cuối: '+bai(n.id).diem+'/10' : '')+'</div>'+
      '<div class="mt">'+ S.luat.map(function(L){
        var m = L.dat ? CO.MAU_DEN.XANH : L.muc==='canh' ? CO.MAU_DEN.VANG : CO.MAU_DEN.DO;
        return '<div class="co-tk-luat" style="--m:'+m+'"><b aria-label="'+(L.dat?'đạt':'chưa đạt')+'">'+(L.dat?'✓':L.so)+'</b><div class="co-grow">'+
          '<div style="font-weight:600;color:var(--ink-2)">'+L.so+'. '+h(L.ten)+'</div><div class="muted">'+h(L.chi)+'</div>'+
          (L.dat ? '' : '<div style="color:'+m+';margin-top:2px">→ '+h(L.goi)+'</div>')+'</div></div>'; }).join('') +'</div>'+
      '<div class="co-hang mt"><button class="btn ghost sm" data-co="tk-soat">'+ic('shield','w-3 h-3')+'Soát lại</button>'+
        '<span class="tiny muted co-grow">Soát tự chạy khi anh/chị gõ.</span></div></div>';
    return o;
  }

  /* ───────── Thống kê ───────── */
  function soLieu(){
    var ds = dsBai(), moc = Date.now() - 30*86400000;
    return { bai:ds.length, dat:ds.filter(function(b){ return b.diem >= 8; }).length, mau:ds.filter(function(b){ return b.mauChuan; }).length,
      dung:ds.filter(function(b){ return (b.dung||[]).some(function(x){ return x.t >= moc; }); }).length,
      cuaToi:ds.filter(function(b){ return b.tacGia===CO.toi().u; }).length };
  }

  /* ═════════ VIEW ═════════ */
  G.VIEWS[VIEW] = function(){
    var k = CO.cua('pro_coach', 'Thiết kế bài coach'); if(k) return k;
    CO.napMau();
    var s = CO.st();
    /* Lời mời từ màn Chương trình: mở một bài / soạn bài mới cho một chương trình */
    if(s.tkMo){
      var b0 = bai(s.tkMo);
      if(b0){ if(canSua(b0)) s.tkNhap = tuBai(b0);
              else { var c0 = tuBai(b0); c0.id = null; c0.ten = b0.ten+' (bản của tôi)'; c0.tuMau = b0.id; s.tkNhap = c0; } }
      s.tkMo = null; s.tab[VIEW] = 'soan';
    }
    if(s.tkMoiCT){ s.tkNhap = moiNhap(s.tkMoiCT); s.tkMoiCT = null; s.tab[VIEW] = 'soan'; }
    var S = soLieu(), cur = CO.tab(VIEW, 'soan');
    var o = '<div class="co-hang mb"><button class="btn ghost sm" data-v="coach-he">← Hệ điều hành Coach</button></div>';
    o += U.ph({ eyebrow:'COACH · THIẾT KẾ BÀI', ic:'edit', grad:1, t:'Thiết kế bài coach',
      lead:'Soạn từng buổi theo sáu nhịp, mục tiêu đo được, nhiệm vụ có tiêu chí xong — máy soát mười luật chấm ngay khi gõ. Bài đạt chuẩn thành mẫu cho cả đội, và giao thẳng nhiệm vụ cho nhà.' });
    o += CO.banMau();
    o += '<div class="grid g4 mb">'+
      U.stat({ k:'Số bài', v:String(S.bai), d:CO.laQuanLy() ? 'toàn đội · '+S.cuaToi+' bài của tôi' : S.cuaToi+' bài của tôi + bài mẫu chuẩn' })+
      U.stat({ k:'Đạt soát ≥ 8/10', v:String(S.dat), d:S.bai ? Math.round(100*S.dat/S.bai)+'% số bài' : 'chưa có bài', c:S.bai ? (S.dat/S.bai >= 0.7 ? CO.MAU_DEN.XANH : CO.MAU_DEN.VANG) : null })+
      U.stat({ k:'Bài mẫu chuẩn', v:String(S.mau), d:'Trưởng nhóm đánh dấu' })+
      U.stat({ k:'Dùng trong 30 ngày', v:String(S.dung), d:'bài đã giao nhiệm vụ cho nhà' })+'</div>';
    o += CO.tabs(VIEW, [['soan','Soạn bài','edit'],['tv','Thư viện bài','book'],['chuan','Chuẩn soát','shield']], cur);
    if(cur==='tv') o += veThuVien(s);
    else if(cur==='chuan') o += veChuan();
    else o += veSoan(s);
    return o;
  };

  /* ═════════ 1 · SOẠN BÀI ═════════ */
  function veSoan(s){
    var n = nhap(), dsct = CO.dsCT(), ct = CO.ct(n.ct), nh = CO.nhip();
    var dangSua = n.id && bai(n.id);
    var ghim = s.ghim.map(tenGhim).filter(Boolean);
    var o = '<div class="co-hang mb"><b class="co-grow">'+(dangSua ? 'Đang sửa: '+h(dangSua.ten||'(chưa đặt tên)') : 'Bài mới')+'</b>'+
      '<button class="btn ghost sm" data-co="tk-moi">'+ic('plus','w-3 h-3')+'Bài mới</button>'+
      '<button class="btn sm" data-co="tk-nhap-tu-dong">'+ic('sparkle','w-3 h-3')+'Soạn nháp tự động</button></div>';
    if(n.tuMau) o += '<div class="co-cb mb"><div style="--m:var(--gita)"><span>Đang soạn từ bản sao của một bài mẫu — lưu sẽ thành bài mới của anh/chị, bài gốc giữ nguyên.</span></div></div>';
    var ktc = s.ktChon && (G.CO_KT||[]).filter(function(x){ return x.ma===s.ktChon; })[0];
    if(ktc) o += '<div class="co-cb mb"><div style="--m:var(--gita)"><span class="co-grow sm"><b>Kỹ thuật đã chọn từ thư viện NLP × GITA:</b> '+h(ktc.ten)+
      ((ktc.cau||[])[0] ? ' — câu mẫu: <i>“'+h(ktc.cau[0])+'”</i>' : '')+'</span>'+
      '<button class="btn sm" data-co="tk-kt-gan">Gắn vào nhịp 4</button><button class="btn ghost sm" data-co="tk-kt-bo">Bỏ</button></div></div>';
    o += '<div class="co-tk-khung"><div id="tk-form">';

    /* Khung bài */
    o += '<div class="card pad-sm mb"><div class="co-form">'+
      '<div style="grid-column:1/-1">'+CO.o2('Tên bài', '<input class="inp" id="tk-ten" maxlength="120" value="'+h(n.ten)+'" placeholder="VD: Buổi 3 · Đổi khúc giữa vòng thói quen">')+'</div>'+
      CO.o2('Chương trình', CO.chon('tk-ct', [['','— chọn chương trình —']].concat(dsct.map(function(c){ return [c.ma, c.ten]; })), n.ct, ' data-co-ch="tk-doi-ct"'))+
      CO.o2('Giai đoạn', ct ? CO.chon('tk-gd', (ct.gd||[]).map(function(g, i){ var kh = khoang(ct, i); return [i, (i+1)+' · '+g.ten+' (buổi '+kh.tu+(kh.den>kh.tu?'–'+kh.den:'')+')']; }), n.gd, ' data-co-ch="tk-doi-gd"')
                              : '<select class="inp" id="tk-gd" disabled><option>Chọn chương trình trước</option></select>')+
      CO.o2('Buổi số', '<input class="inp" type="number" min="1" id="tk-buoi" value="'+h(n.buoi)+'"'+(ct?' max="'+tongBuoi(ct)+'"':'')+'>')+
      CO.o2('Trụ trọng tâm', CO.chon('tk-tru', (G.GITA||[]).map(function(g){ return [g.k, g.k+' · '+g.short]; }), n.tru))+
      CO.o2('Nhà (không bắt buộc)', CO.chon('tk-nha', [['','— bài dùng chung —']].concat(CO.dsNha().map(function(x){ return [x.ma, x.ten]; })), n.nha, ' data-co-ch="tk-doi-nha"'))+
    '</div>';
    if(ct){
      var g = (ct.gd||[])[n.gd];
      if(g) o += '<div class="tiny muted mt" style="line-height:1.5">'+icI('compass')+' <b>'+h(g.ten)+'</b> · ngày '+g.tu+'–'+(g.den||g.tu)+' · mục tiêu: '+h(g.muc||'—')+' · cổng: '+h(g.cong||'—')+'</div>';
    }
    var tr = gru(n.tru);
    if(tr) o += '<div class="tiny muted mt" style="line-height:1.5">'+icI('target')+' <b style="color:'+h(tr.c)+'">'+h(tr.name)+'</b> — câu soi: '+h(tr.probe)+'</div>';
    if(n.nguon || (n.gpDung||[]).length) o += '<div class="tiny muted mt">'+icI('book')+' Nguyên liệu nháp: '+
      [n.nguon].concat((n.gpDung||[]).map(function(m){ var x = CO.gp(m); return x ? x.ma+' '+x.ten : m; })).filter(Boolean).map(h).join(' · ')+'</div>';
    o += '</div>';

    /* Phân tích của nhà */
    var pt = n.nha ? s.pt[n.nha] : null;
    if(pt){
      var P = CO.phanTich(pt), maxK = Object.keys(P.tru).sort(function(a,b){ return P.tru[b]-P.tru[a]; })[0];
      o += '<div class="card pad-sm mb" style="border-color:var(--gita)"><div class="co-hang"><b class="sm co-grow">'+icI('target')+' Phân tích của '+h(CO.tenNha(n.nha))+'</b>'+
        '<button class="btn sm" data-co="tk-lay-pt">Lấy trọng tâm từ phân tích</button></div>'+
        '<div class="grid g4 mt" style="gap:8px">'+ Object.keys(P.tru).map(function(kk){
          return '<div><div class="tiny co-hang" style="gap:4px"><b style="color:'+h(mauTru(kk))+'">'+kk+'</b><span class="muted co-grow">'+h(tenTru(kk))+'</span><span class="co-so">'+P.tru[kk]+'</span></div>'+U.bar(P.tru[kk], mauTru(kk))+'</div>'; }).join('') +'</div>'+
        '<div class="grid g2 mt" style="gap:10px"><div><div class="tiny muted">VẤN ĐỀ NẶNG NHẤT</div>'+
          (P.nang.length ? '<ul class="sm" style="margin:4px 0 0;padding-left:18px">'+P.nang.slice(0,3).map(function(x){ return '<li>'+h(x.ten)+' <span class="muted">('+x.tru+' · mức '+(Number((pt.vd||{})[x.ma])||0)+')</span></li>'; }).join('')+'</ul>' : '<div class="sm muted">Chưa có vấn đề mức ≥ 2.</div>')+'</div>'+
          '<div><div class="tiny muted">NHU CẦU ƯU TIÊN</div>'+
          (P.ncTop.length ? '<ul class="sm" style="margin:4px 0 0;padding-left:18px">'+P.ncTop.slice(0,3).map(function(x){ return '<li>'+h(x.ten)+'</li>'; }).join('')+'</ul>' : '<div class="sm muted">Chưa chấm nhu cầu.</div>')+'</div></div>'+
        (P.ruiRo.length ? '<div class="co-cb mt">'+P.ruiRo.map(function(r){ return '<div style="--m:'+CO.MAU_DEN.VANG+'">'+ic('alert','w-3 h-3')+'<span>'+h(r)+'</span></div>'; }).join('')+'</div>' : '')+
        '<div class="tiny muted mt">Trụ nặng nhất: <b>'+h(maxK)+' · '+h(tenTru(maxK))+'</b> ('+P.tru[maxK]+'/100) · tầng gợi ý T'+P.tang+'</div></div>';
    } else if(n.nha){
      o += '<div class="card pad-sm mb sm muted">'+h(CO.tenNha(n.nha))+' chưa có phân tích vấn đề – nhu cầu – tiềm năng.'+
        (G.allowed && G.allowed('coach-pt') ? ' <button class="btn ghost sm" data-v="coach-pt">Mở màn Phân tích</button>' : '')+'</div>';
    }

    /* Mục tiêu */
    o += '<div class="card pad-sm mb">'+CO.o2('Mục tiêu buổi — hành vi + con số / mốc', '<textarea class="inp" id="tk-muc" rows="2" maxlength="400" placeholder="VD: Kết thúc buổi, con tự chọn 1 hành vi thay thế và cam kết làm ≥ 5/7 ngày tới">'+h(n.muc)+'</textarea>')+'</div>';

    /* Sáu nhịp */
    o += U.sec('Sáu nhịp của buổi', CO.nhipNguon());
    o += '<div class="co-ds mb">'+ nh.map(function(B, i){
      var x = n.nhip[i] || {}, p = 'tk-n'+i+'-';
      return '<div class="co-the" style="border-left:4px solid '+h(B.c||'#185AB4')+';padding:12px 14px">'+
        '<div class="co-hang"><b class="co-grow sm">Nhịp '+h(B.no||i+1)+' · '+h(B.ten)+'</b>'+
          '<label class="tiny muted" style="display:inline-flex;gap:6px;align-items:center">Phút <input class="inp" style="width:74px;padding:6px 8px" type="number" min="0" max="90" id="'+p+'phut" value="'+h(x.phut)+'"></label></div>'+
        (B.tranh ? '<div class="tiny" style="color:'+CO.MAU_DEN.VANG+'">Tránh: '+h(B.tranh)+'</div>' : '')+
        '<div class="co-form">'+
          CO.o2('Hoạt động', '<textarea class="inp" id="'+p+'lam" rows="3" maxlength="400">'+h(x.lam)+'</textarea>')+
          CO.o2('Câu hỏi chính', '<textarea class="inp" id="'+p+'hoi" rows="2" maxlength="240">'+h(x.hoi)+'</textarea>')+
        '</div><div class="co-form">'+
          CO.o2('Công cụ / tài liệu', '<input class="inp" id="'+p+'cu" maxlength="160" value="'+h(x.cu)+'" placeholder="Phiếu, bảng, video…">'+
            (ghim.length ? '<select class="inp" id="'+p+'ghim" data-co-ch="tk-ghim" data-i="'+i+'" aria-label="Chọn tài liệu đã ghim cho nhịp '+(i+1)+'" style="margin-top:4px"><option value="">+ lấy từ tài liệu đã ghim…</option>'+
              ghim.map(function(t){ return '<option value="'+h(t)+'">'+h(t)+'</option>'; }).join('')+'</select>' : ''))+
          CO.o2('Đầu ra mong đợi', '<input class="inp" id="'+p+'ra" maxlength="200" value="'+h(x.ra)+'" placeholder="'+h(RA[i]||'Điều đo được khi kết thúc nhịp')+'">')+
        '</div></div>';
    }).join('') +'</div>';

    /* Nhiệm vụ */
    o += '<div class="co-hang mb"><b class="sm co-grow">Nhiệm vụ giao ('+n.nv.length+'/5) <span class="muted" style="font-weight:400">— vừa sức là 1–3 việc</span></b>'+
      (n.nv.length < 5 ? '<button class="btn sm" data-co="tk-them-nv">'+ic('plus','w-3 h-3')+'Thêm nhiệm vụ</button>' : '')+'</div>';
    o += '<div class="co-ds mb">'+ (n.nv.length ? n.nv.map(function(x, i){
      var p = 'tk-v'+i+'-';
      return '<div class="co-the" style="padding:12px 14px'+(i>=3?';border-color:'+CO.MAU_DEN.VANG:'')+'">'+
        '<div class="co-hang"><b class="sm co-grow">Nhiệm vụ '+(i+1)+(i>=3?' <span class="tiny" style="color:'+CO.MAU_DEN.VANG+'">· vượt mức vừa sức</span>':'')+'</b>'+
          '<button class="btn ghost sm" data-co="tk-xoa-nv" data-i="'+i+'" aria-label="Bỏ nhiệm vụ '+(i+1)+'">'+ic('x','w-3 h-3')+'Bỏ</button></div>'+
        '<div class="co-form">'+
          '<div style="grid-column:1/-1">'+CO.o2('Tên nhiệm vụ', '<input class="inp" id="'+p+'ten" maxlength="160" value="'+h(x.ten)+'">')+'</div>'+
          CO.o2('Tiêu chí xong', '<input class="inp" id="'+p+'xong" maxlength="160" value="'+h(x.xong)+'" placeholder="Xong là khi…">')+
          CO.o2('Hạn (số ngày)', '<input class="inp" type="number" min="1" max="60" id="'+p+'han" value="'+h(x.han)+'">')+
          CO.o2('Loại minh chứng', CO.chon(p+'mc', [['','— chọn —']].concat(MC), x.mc))+
        '</div></div>'; }).join('') : '<div class="card pad-sm muted sm">Chưa có nhiệm vụ. Bấm "Thêm nhiệm vụ" hoặc "Soạn nháp tự động".</div>') +'</div>';

    /* Nghiệm thu & an toàn */
    o += '<div class="card pad-sm mb"><div class="co-form">'+
      CO.o2('Tiêu chí nghiệm thu buổi', '<textarea class="inp" id="tk-nt" rows="2" maxlength="400" placeholder="Buổi đạt khi…">'+h(n.nghiemThu)+'</textarea>')+
      CO.o2('Ghi chú an toàn', '<textarea class="inp" id="tk-at" rows="2" maxlength="400" placeholder="Dấu hiệu phải dừng, khi nào chuyển chuyên gia, điều không nói trước mặt con…">'+h(n.ghiChu)+'</textarea>')+
    '</div></div>';
    o += '<div class="co-hang mb"><button class="btn pri" data-co="tk-luu">'+ic('check','w-4 h-4')+(dangSua?'Lưu bài':'Lưu vào thư viện')+'</button>'+
      (dangSua ? '<button class="btn ghost" data-co="tk-in-mo" data-id="'+h(n.id)+'">'+ic('eye','w-3 h-3')+'Xem bản in</button>' : '')+
      '<span class="tiny muted co-grow" style="min-width:200px">Bản nháp tự lưu trên máy này khi gõ; bấm Lưu để vào thư viện và ghi điểm soát.</span></div>';
    o += '</div><div class="co-tk-ben" id="tk-soat-panel">'+veSoat(n)+'</div></div>';
    return o;
  }

  /* Soát sống: gõ đến đâu, máy soát chấm đến đó — chỉ vẽ lại khung soát, không mất chỗ con trỏ. */
  var hen = null;
  function soatSong(){
    var pn = document.getElementById('tk-soat-panel'); if(!pn || !document.getElementById('tk-ten')) return;
    var n = docNhap(); pn.innerHTML = veSoat(n);
    if(G.save) G.save();
  }
  document.addEventListener('input', function(e){
    if(!e.target || !e.target.closest || !e.target.closest('#tk-form')) return;
    clearTimeout(hen); hen = setTimeout(soatSong, 350);
  });

  CO.on('tk-doi-ct', function(){
    var n = docNhap(), ct = CO.ct(n.ct);
    n.gd = 0; n.buoi = ct ? 1 : n.buoi;
    if(ct && (ct.mien||[]).indexOf(n.tru) < 0) n.tru = ct.mien[0] || n.tru;
    veGiu();
  });
  CO.on('tk-doi-gd', function(){
    var n = docNhap(), ct = CO.ct(n.ct); if(!ct){ veGiu(); return; }
    var kh = khoang(ct, n.gd); if(kh && !(Number(n.buoi) >= kh.tu && Number(n.buoi) <= kh.den)) n.buoi = kh.tu;
    veGiu();
  });
  CO.on('tk-doi-nha', function(){ docNhap(); veGiu(); });
  CO.on('tk-ghim', function(el){
    var i = Number(el.getAttribute('data-i')), t = el.value; if(!t) return;
    var n = docNhap(), x = n.nhip[i]; if(!x) return;
    x.cu = x.cu ? (x.cu.indexOf(t) >= 0 ? x.cu : x.cu+'; '+t) : t;
    veGiu('tk-n'+i+'-cu');
  });
  CO.on('tk-kt-gan', function(){
    var s = CO.st(), k = (G.CO_KT||[]).filter(function(x){ return x.ma===s.ktChon; })[0], n = docNhap(); if(!k) return;
    var x = n.nhip[3] || n.nhip[n.nhip.length-1]; if(!x) return;
    var t = 'Kỹ thuật: '+k.ten; x.cu = x.cu ? (x.cu.indexOf(t) >= 0 ? x.cu : x.cu+'; '+t) : t;
    if((k.cau||[])[0] && !x.hoi) x.hoi = k.cau[0];
    s.ktChon = null; U.toast('Đã gắn "'+k.ten+'" vào công cụ của nhịp 4.', 'ok'); veGiu('tk-n3-cu');
  });
  CO.on('tk-kt-bo', function(){ docNhap(); CO.st().ktChon = null; veGiu(); });
  CO.on('tk-them-nv', function(){
    var n = docNhap(); if(n.nv.length >= 5){ U.toast('Tối đa 5 nhiệm vụ — vừa sức là 1–3.', 'err'); return; }
    n.nv.push({ ten:'', xong:'', han:'', mc:'' });
    if(n.nv.length === 4) U.toast('Từ nhiệm vụ thứ 4 là vượt mức vừa sức — máy soát sẽ không tính điểm luật 6.', 'err');
    veGiu('tk-v'+(n.nv.length-1)+'-ten');
  });
  CO.on('tk-xoa-nv', function(el){ var n = docNhap(); n.nv.splice(Number(el.getAttribute('data-i')), 1); veGiu(); });
  CO.on('tk-moi', function(){
    var s = CO.st(), cu = docNhap();
    s.tkNhap = moiNhap(cu && cu.ct); U.toast('Đã mở bài mới.', 'ok'); veGiu('tk-ten');
  });
  CO.on('tk-soat', function(){ var n = docNhap(), S = soat(n); U.toast('Máy soát: '+S.diem+'/10.', S.diem>=8?'ok':'err'); veGiu(); });
  CO.on('tk-lay-pt', function(){
    var n = docNhap(), pt = CO.st().pt[n.nha]; if(!pt) return;
    var P = CO.phanTich(pt), maxK = Object.keys(P.tru).sort(function(a,b){ return P.tru[b]-P.tru[a]; })[0];
    n.tru = maxK; n.vdTT = P.nang.slice(0,3).map(function(x){ return x.ma; });
    if(!n.muc && P.nang[0]) n.muc = 'Gỡ "'+P.nang[0].ten.toLowerCase()+'": kết thúc buổi, gia đình chọn 1 việc nhỏ và giữ ≥ 5/7 ngày tới';
    U.toast('Đã lấy trọng tâm trụ '+maxK+' · '+tenTru(maxK)+(n.vdTT.length?' và '+n.vdTT.length+' vấn đề nặng nhất':'')+'.', 'ok');
    veGiu();
  });

  /* Soạn nháp tự động */
  function doanMC(t){
    t = String(t||'').toLowerCase();
    if(/ảnh|chụp/.test(t)) return 'anh';
    if(/ghi âm/.test(t)) return 'ghi_am';
    if(/bảng|tick|ngày có|\d+\/\d+/.test(t)) return 'bang';
    return 'van_ban';
  }
  function lapNhap(n){
    var ct = CO.ct(n.ct), g = ct && (ct.gd||[])[n.gd]; if(!g) return false;
    var tang = (ct.tang||[])[0] || 1, nh = CO.nhip(), tr = gru(n.tru), kh = khoang(ct, n.gd);
    if(!(Number(n.buoi) >= kh.tu && Number(n.buoi) <= kh.den)) n.buoi = kh.tu;
    if(!n.ten) n.ten = ct.ten+' · '+g.ten+' · Buổi '+n.buoi;
    var mg = String(g.muc||'').trim();
    n.muc = 'Kết thúc buổi: '+(mg || 'đi xong bước của giai đoạn')+' — cổng giai đoạn: '+(g.cong||'—')+'.';
    n.nhip = nh.map(function(B, i){
      var lam = B.lam||'';
      if(i===2 && tr) lam += ' Trọng tâm trụ '+tr.k+' ('+tr.short+'): '+tr.probe;
      if(i===3 && mg) lam += ' Hướng của giai đoạn: '+mg+'.';
      return { phut:Number(B.phut)||10, lam:lam, hoi:B.hoi||'', cu:'', ra:RA[i]||'' };
    });
    /* Nhiệm vụ mẫu từ giải pháp cùng trụ + cùng tầng; ưu tiên giải pháp gỡ đúng vấn đề nặng của nhà */
    var vdTT = n.vdTT || [];
    var gp = CO.dsGP().filter(function(x){ return x.tru===n.tru && (!x.tang || (x.tang||[]).some(function(t){ return (ct.tang||[]).indexOf(t) >= 0; })); })
      .sort(function(a,b){
        function d(x){ return (x.vd||[]).filter(function(m){ return vdTT.indexOf(m) >= 0; }).length; }
        return d(b) - d(a); });
    if(!gp.length) gp = CO.dsGP().filter(function(x){ return x.tru===n.tru; });
    var nv = [], dung = [];
    gp.forEach(function(x){ (x.nv||[]).forEach(function(t){ if(nv.length < 3){ nv.push({ ten:t.ten, xong:t.xong||'', han:Number(t.ngay)||3, mc:doanMC(t.xong) }); if(dung.indexOf(x.ma) < 0) dung.push(x.ma); } }); });
    n.nv = nv.length ? nv : [{ ten:'', xong:'', han:'', mc:'' }];
    n.gpDung = dung;
    n.nghiemThu = 'Buổi đạt khi: '+(g.cong ? g.cong.charAt(0).toLowerCase()+g.cong.slice(1) : 'đạt mục tiêu buổi')+'; mỗi nhiệm vụ cũ được xét đạt / chưa đạt bằng minh chứng; mỗi người nói lại việc của mình.';
    var canh = dung.map(function(m){ var x = CO.gp(m); return x && x.canh && x.canh!=='—' ? x.canh : ''; }).filter(Boolean);
    n.ghiChu = 'Thấy dấu hiệu tổn thương sâu hoặc tự hại: dừng buổi, báo Trưởng nhóm Coach, chuyển chuyên gia.'+(canh.length ? ' '+canh.join(' ') : '');
    n.nguon = '';
    if(Array.isArray(G.KICHBAN)){
      var kb = G.KICHBAN.filter(function(x){ return x && (x.tang==='T'+tang || x.tang===tang) && String(x.loai||'').toUpperCase()==='COACH'; })[0];
      if(kb) n.nguon = 'Kịch bản kho: '+(kb.ten||'')+(kb.muc ? ' — '+kb.muc : '');
    }
    return true;
  }
  CO.on('tk-nhap-tu-dong', function(){
    var n = docNhap(), ct = CO.ct(n.ct);
    if(!ct){ U.toast('Chọn chương trình và giai đoạn trước khi soạn nháp.', 'err'); return; }
    var coNoiDung = n.muc || n.nv.some(function(x){ return x.ten; }) || n.nghiemThu;
    if(coNoiDung){
      U.modal('<h3 style="margin:0 0 8px">Thay bằng bản nháp tự động?</h3><p class="sm">Mục tiêu, sáu nhịp, nhiệm vụ, nghiệm thu và ghi chú an toàn sẽ được viết lại từ giai đoạn "'+h((ct.gd[n.gd]||{}).ten||'')+'" và giải pháp trụ '+h(n.tru)+'. Tên bài, chương trình, nhà giữ nguyên.</p>'+
        '<div class="co-hang mt2"><button class="btn pri" data-co="tk-nhap-ok">Viết lại</button><button class="btn ghost" data-co="tk-dong-hop">Thôi</button></div>');
      return;
    }
    lapNhap(n); U.toast('Đã soạn nháp — đọc lại, sửa theo nhà rồi lưu.', 'ok'); veGiu();
  });
  CO.on('tk-nhap-ok', function(){ U.closeModal(); var n = nhap(); lapNhap(n); U.toast('Đã soạn nháp — đọc lại, sửa theo nhà rồi lưu.', 'ok'); veGiu(); });
  CO.on('tk-dong-hop', function(){ U.closeModal(); });

  CO.on('tk-luu', function(){
    var s = CO.st(), n = docNhap();
    if(!n.ten || n.ten.length < 3){ U.toast('Đặt tên bài (ít nhất 3 ký tự).', 'err'); veGiu('tk-ten'); return; }
    if(!CO.ct(n.ct)){ U.toast('Chọn chương trình cho bài.', 'err'); veGiu('tk-ct'); return; }
    if(n.buoi!=='' && !(Number(n.buoi) >= 1 && Math.round(Number(n.buoi))===Number(n.buoi))){ U.toast('Buổi số phải là số nguyên từ 1.', 'err'); return; }
    var hanSai = n.nv.filter(function(x){ return x.han!=='' && !(Number(x.han) >= 1 && Number(x.han) <= 60); })[0];
    if(hanSai){ U.toast('Hạn của nhiệm vụ "'+(hanSai.ten||'?')+'" phải từ 1 đến 60 ngày.', 'err'); return; }
    var nvLoi = n.nv.filter(function(x){ return !x.ten && (x.xong || x.han!=='' || x.mc); })[0];
    if(nvLoi){ U.toast('Có nhiệm vụ chưa đặt tên — đặt tên hoặc bỏ dòng ấy.', 'err'); return; }
    var S = soat(n), now = Date.now();
    var rec = { ten:n.ten, ct:n.ct, gd:Number(n.gd)||0, buoi:n.buoi==='' ? '' : Number(n.buoi), nha:n.nha, tru:n.tru, muc:n.muc,
      nhip:n.nhip.map(function(x){ return { phut:Number(x.phut)||0, lam:x.lam, hoi:x.hoi, cu:x.cu, ra:x.ra }; }),
      nv:n.nv.filter(function(x){ return x.ten; }).map(function(x){ return { ten:x.ten, xong:x.xong, han:x.han==='' ? '' : Number(x.han), mc:x.mc }; }),
      nghiemThu:n.nghiemThu, ghiChu:n.ghiChu, nguon:n.nguon||'', gpDung:(n.gpDung||[]).slice(), diem:S.diem, soatLuc:now, sua:now };
    var cu = n.id ? bai(n.id) : null;
    if(cu && !canSua(cu)) cu = null;
    if(cu){ Object.keys(rec).forEach(function(k){ cu[k] = rec[k]; }); if(cu.tacGia!==CO.toi().u) cu.nguoiSua = CO.toi().u; }
    else {
      rec.id = CO.id('bai'); rec.tao = now; rec.tacGia = CO.toi().u; rec.mauChuan = false; rec.dung = [];
      if(n.tuMau) rec.tuMau = n.tuMau;
      s.bai.push(rec); cu = rec;
    }
    s.tkNhap = tuBai(cu);
    U.toast('Đã lưu "'+cu.ten+'" · máy soát '+S.diem+'/10'+(S.diem>=8?' — đạt chuẩn.':' — xem các luật đỏ.'), S.diem>=8?'ok':'err');
    veGiu();
  });

  /* ═════════ 2 · THƯ VIỆN BÀI ═════════ */
  function locBai(s){
    var L = s.tkLoc || {};
    return dsBai().filter(function(b){
      return (!L.ct || b.ct===L.ct) && (!L.tru || b.tru===L.tru) && (!L.tg || b.tacGia===L.tg) && (!L.mau || b.mauChuan);
    }).sort(function(a,b){ return (b.sua||0) - (a.sua||0); });
  }
  function veThuVien(s){
    var L = s.tkLoc || {}, all = dsBai(), ds = locBai(s), ql = CO.laQuanLy();
    var tg = {}; all.forEach(function(b){ if(b.tacGia) tg[b.tacGia] = 1; });
    var o = '<div class="card pad-sm mb"><div class="co-form">'+
      CO.o2('Chương trình', CO.chon('tkl-ct', [['','Mọi chương trình']].concat(CO.dsCT().map(function(c){ return [c.ma, c.ten]; })), L.ct||'', ' data-co-ch="tk-loc"'))+
      CO.o2('Trụ', CO.chon('tkl-tru', [['','Mọi trụ']].concat((G.GITA||[]).map(function(g){ return [g.k, g.k+' · '+g.short]; })), L.tru||'', ' data-co-ch="tk-loc"'))+
      CO.o2('Tác giả', CO.chon('tkl-tg', [['','Mọi tác giả']].concat(Object.keys(tg).map(function(u){ return [u, CO.tenCoach(u)]; })), L.tg||'', ' data-co-ch="tk-loc"'))+
      '<label class="co-f"><span>Chỉ bài mẫu chuẩn</span><span class="co-hang" style="min-height:42px"><input type="checkbox" id="tkl-mau" data-co-ch="tk-loc"'+(L.mau?' checked':'')+'> <span class="sm">Chỉ hiện mẫu chuẩn</span></span></label>'+
    '</div></div>';
    o += '<div class="co-hang mb"><span class="sm co-grow" style="min-width:160px">'+ds.length+'/'+all.length+' bài'+(ql?' · toàn đội':' · của tôi + mẫu chuẩn')+'</span>'+
      (ds.length ? '<button class="btn ghost sm" data-co="tk-csv">'+ic('list','w-3 h-3')+'Xuất danh sách (CSV)</button>' : '')+
      '<button class="btn sm" data-co="tk-moi-tv">'+ic('plus','w-3 h-3')+'Soạn bài mới</button></div>';
    if(!all.length) return o + '<div class="card center" style="padding:30px"><b>Thư viện còn trống</b><p class="sm muted mt">Soạn bài đầu tiên ở thẻ "Soạn bài" — "Soạn nháp tự động" dựng sẵn khung từ chương trình và giải pháp chuẩn.</p></div>';
    if(!ds.length) return o + '<div class="card pad-sm muted sm">Không có bài nào khớp bộ lọc.</div>';
    o += '<div class="co-tb"><table><thead><tr><th>Tên bài</th><th>Chương trình · giai đoạn · buổi</th><th>Trụ</th><th>Điểm soát</th><th>Tác giả</th><th>Sửa lần cuối</th><th>Thao tác</th></tr></thead><tbody>'+
      ds.map(function(b){
        var ct = CO.ct(b.ct), g = ct && (ct.gd||[])[Number(b.gd)||0], sua = canSua(b);
        return '<tr><td style="min-width:180px"><b>'+h(b.ten||'(chưa đặt tên)')+'</b>'+(b.mauChuan?' <span class="co-tag">mẫu chuẩn</span>':'')+CO.nhanMau(b)+
            (b.nha ? '<div class="tiny muted">'+h(CO.tenNha(b.nha))+'</div>' : '')+
            ((b.dung||[]).length ? '<div class="tiny muted">đã giao '+b.dung.length+' lần</div>' : '')+'</td>'+
          '<td class="sm" style="min-width:170px">'+h(ct?ct.ten:'(chương trình đã xoá)')+'<div class="tiny muted">'+h(g?g.ten:'—')+' · buổi '+h(b.buoi||'—')+'</div></td>'+
          '<td>'+(b.tru ? U.chip(b.tru, mauTru(b.tru)) : '—')+'</td>'+
          '<td class="so"><b style="color:'+mauDiem(b.diem)+'">'+(b.diem==null?'—':b.diem+'/10')+'</b></td>'+
          '<td class="sm">'+h(CO.tenCoach(b.tacGia))+'</td>'+
          '<td class="sm" style="white-space:nowrap">'+(b.sua ? h(CO.gioVN(b.sua)) : '—')+'</td>'+
          '<td><div class="co-hang" style="gap:6px;min-width:250px">'+
            '<button class="btn ghost sm" data-co="tk-in-mo" data-id="'+h(b.id)+'">'+ic('eye','w-3 h-3')+'Mở / In</button>'+
            (sua ? '<button class="btn ghost sm" data-co="tk-sua" data-id="'+h(b.id)+'">'+ic('edit','w-3 h-3')+'Sửa</button>' : '')+
            '<button class="btn ghost sm" data-co="tk-nhan" data-id="'+h(b.id)+'">Nhân bản</button>'+
            ((b.nv||[]).length ? '<button class="btn ghost sm" data-co="tk-giao-mo" data-id="'+h(b.id)+'">'+ic('users','w-3 h-3')+'Giao cho nhà</button>' : '')+
            (ql ? '<button class="btn ghost sm" data-co="tk-mau" data-id="'+h(b.id)+'">'+ic('star','w-3 h-3')+(b.mauChuan?'Bỏ mẫu chuẩn':'Đánh dấu mẫu chuẩn')+'</button>' : '')+
            (sua ? '<button class="btn ghost sm" data-co="tk-xoa" data-id="'+h(b.id)+'">Xoá</button>' : '')+
          '</div></td></tr>';
      }).join('')+'</tbody></table></div>';
    return o;
  }
  CO.on('tk-loc', function(){
    var s = CO.st();
    s.tkLoc = { ct:CO.o('tkl-ct'), tru:CO.o('tkl-tru'), tg:CO.o('tkl-tg'), mau:CO.o('tkl-mau')===true };
    veGiu();
  });
  CO.on('tk-moi-tv', function(){ var s = CO.st(); s.tkNhap = moiNhap(''); s.tab[VIEW] = 'soan'; CO.luu(); });
  CO.on('tk-sua', function(el){
    var b = bai(el.getAttribute('data-id')); if(!b) return;
    if(!canSua(b)){ U.toast('Bài của người khác — dùng "Nhân bản" để soạn bản của mình.', 'err'); return; }
    var s = CO.st(); s.tkNhap = tuBai(b); s.tab[VIEW] = 'soan'; CO.luu();
  });
  function nhanBan(id, moSua){
    var b = bai(id); if(!b) return;
    var s = CO.st(), c = tuBai(b), now = Date.now();
    c.id = CO.id('bai'); c.ten = (b.ten||'Bài')+' (bản sao)'; c.tacGia = CO.toi().u; c.mauChuan = false; c.tao = now; c.sua = now; c.dung = []; c.tuMau = b.id;
    delete c.mau; delete c.nguoiSua; delete c.mauBoi; delete c.mauLuc; c.diem = soat(c).diem; c.soatLuc = now;
    s.bai.push(c);
    if(moSua){ s.tkNhap = tuBai(c); s.tab[VIEW] = 'soan'; U.toast('Đã nhân bản thành "'+c.ten+'" — đang mở để sửa.', 'ok'); CO.luu(); }
    else { U.toast('Đã nhân bản thành "'+c.ten+'".', 'ok'); veGiu(); }
  }
  CO.on('tk-nhan', function(el){ nhanBan(el.getAttribute('data-id'), false); });
  CO.on('tk-xoa', function(el){
    var b = bai(el.getAttribute('data-id')); if(!b) return;
    if(!canSua(b)){ U.toast('Chỉ tác giả hoặc Trưởng nhóm được xoá bài này.', 'err'); return; }
    U.modal('<h3 style="margin:0 0 8px">Xoá bài coach?</h3><p class="sm">"'+h(b.ten)+'" sẽ bị xoá khỏi thư viện. Nhiệm vụ đã giao cho nhà vẫn giữ trong nhật ký.</p>'+
      (b.mauChuan ? '<p class="sm" style="color:'+CO.MAU_DEN.VANG+'">Đây là bài mẫu chuẩn của đội.</p>' : '')+
      '<div class="co-hang mt2"><button class="btn pri" data-co="tk-xoa-ok" data-id="'+h(b.id)+'">Xoá</button><button class="btn ghost" data-co="tk-dong-hop">Thôi</button></div>');
  });
  CO.on('tk-xoa-ok', function(el){
    var s = CO.st(), id = el.getAttribute('data-id'), b = bai(id); if(!b){ U.closeModal(); return; }
    s.bai = s.bai.filter(function(x){ return x.id!==id; });
    if(s.tkNhap && s.tkNhap.id===id) s.tkNhap = moiNhap(b.ct);
    U.closeModal(); U.toast('Đã xoá bài "'+b.ten+'".', 'ok'); veGiu();
  });
  CO.on('tk-mau', function(el){
    if(!CO.laQuanLy()){ U.toast('Chỉ Trưởng nhóm Coach trở lên đánh dấu mẫu chuẩn.', 'err'); return; }
    var b = bai(el.getAttribute('data-id')); if(!b) return;
    if(!b.mauChuan){
      var d = soat(b).diem;
      if(d < 8){ U.toast('Bài mới đạt '+d+'/10 — cần soát ≥ 8/10 mới làm mẫu chuẩn.', 'err'); return; }
      b.diem = d; b.mauChuan = true; b.mauBoi = CO.toi().u; b.mauLuc = Date.now();
      U.toast('Đã đánh dấu "'+b.ten+'" là bài mẫu chuẩn — cả đội thấy bài này.', 'ok');
    } else { b.mauChuan = false; U.toast('Đã bỏ mẫu chuẩn.', 'ok'); }
    veGiu();
  });
  CO.on('tk-csv', function(){
    var ds = locBai(CO.st());
    CO.csv('bai-coach-'+CO.homNay()+'.csv', ['Tên bài','Chương trình','Giai đoạn','Buổi','Trụ','Điểm soát','Mẫu chuẩn','Tác giả','Số nhiệm vụ','Tổng phút','Sửa lần cuối'],
      ds.map(function(b){ var ct = CO.ct(b.ct), g = ct && (ct.gd||[])[Number(b.gd)||0];
        return [b.ten, ct?ct.ten:b.ct, g?g.ten:'', b.buoi, b.tru, b.diem==null?'':b.diem, b.mauChuan?'có':'', CO.tenCoach(b.tacGia), (b.nv||[]).length,
          (b.nhip||[]).reduce(function(a,x){ return a+(Number(x.phut)||0); },0), b.sua?CO.gioVN(b.sua):'']; }));
    U.toast('Đã xuất '+ds.length+' bài ra CSV.', 'ok');
  });

  /* In / xuất: bản kế hoạch buổi sạch */
  function banIn(b){
    var ct = CO.ct(b.ct), g = ct && (ct.gd||[])[Number(b.gd)||0], nh = CO.nhip(), S = soat(b);
    var phut = (b.nhip||[]).reduce(function(a,x){ return a+(Number(x.phut)||0); },0);
    var o = '<div class="co-tk-in">'+
      '<div class="tiny muted">GITA 365 · KẾ HOẠCH BUỔI COACH</div>'+
      '<h2 style="margin:4px 0 6px;font-size:21px">'+h(b.ten||'(chưa đặt tên)')+'</h2>'+
      '<div class="sm muted">'+h(ct?ct.ten:'—')+' · '+h(g?g.ten:'—')+' · buổi '+h(b.buoi||'—')+' · trụ '+h(b.tru||'—')+' · '+tenTru(b.tru)+' · '+phut+' phút'+
        (b.nha ? ' · '+h(CO.tenNha(b.nha)) : '')+'</div>'+
      '<div class="sm muted">Soạn: '+h(CO.tenCoach(b.tacGia))+(b.sua ? ' · sửa '+h(CO.gioVN(b.sua)) : '')+' · máy soát '+S.diem+'/10'+(b.mauChuan?' · mẫu chuẩn':'')+'</div>'+
      '<p style="margin:12px 0 4px"><b>Mục tiêu buổi.</b> '+h(b.muc||'—')+'</p>'+
      (g ? '<p class="sm" style="margin:0 0 10px"><b>Cổng giai đoạn.</b> '+h(g.cong||'—')+'</p>' : '')+
      '<div class="co-tb mt"><table><thead><tr><th>Nhịp</th><th>Phút</th><th>Hoạt động</th><th>Câu hỏi chính</th><th>Công cụ</th><th>Đầu ra</th></tr></thead><tbody>'+
        nh.map(function(B, i){ var x = (b.nhip||[])[i] || {};
          return '<tr><td><b>'+h(B.no||i+1)+'.</b> '+h(B.ten)+'</td><td class="so">'+h(x.phut||'—')+'</td><td class="sm">'+h(x.lam||'—')+'</td><td class="sm"><i>'+h(x.hoi||'—')+'</i></td><td class="sm">'+h(x.cu||'—')+'</td><td class="sm">'+h(x.ra||'—')+'</td></tr>'; }).join('')+
      '</tbody></table></div>'+
      '<h3 style="margin:14px 0 6px;font-size:15px">Nhiệm vụ giao</h3>'+
      ((b.nv||[]).length ? '<div class="co-tb"><table style="min-width:420px"><thead><tr><th>#</th><th>Nhiệm vụ</th><th>Xong là khi</th><th>Hạn</th><th>Minh chứng</th></tr></thead><tbody>'+
        b.nv.map(function(x, i){ return '<tr><td class="so">'+(i+1)+'</td><td class="sm">'+h(x.ten)+'</td><td class="sm">'+h(x.xong||'—')+'</td><td class="so">'+(x.han?h(x.han)+' ngày':'—')+'</td><td class="sm">'+h(TEN_MC[x.mc]||'—')+'</td></tr>'; }).join('')+
        '</tbody></table></div>' : '<p class="sm muted">Không giao nhiệm vụ.</p>')+
      '<p style="margin:12px 0 4px"><b>Tiêu chí nghiệm thu buổi.</b> '+h(b.nghiemThu||'—')+'</p>'+
      (b.ghiChu ? '<p class="sm" style="margin:0"><b>Ghi chú an toàn.</b> '+h(b.ghiChu)+'</p>' : '')+
      '<p class="tiny muted" style="margin-top:12px">Tài liệu nội bộ — không chuyển ra ngoài hệ. Thông tin gia đình chỉ dùng cho buổi coach.</p>'+
      '</div>';
    return o;
  }
  CO.on('tk-in-mo', function(el){
    var id = el.getAttribute('data-id'), b = bai(id);
    if(!b){ U.toast('Lưu bài trước khi xem bản in.', 'err'); return; }
    U.modal(banIn(b)+'<div class="co-hang mt2 co-noprint"><button class="btn pri" data-co="tk-in">'+ic('book','w-4 h-4')+'In / lưu PDF</button>'+
      (canSua(b) ? '<button class="btn ghost" data-co="tk-sua-hop" data-id="'+h(b.id)+'">'+ic('edit','w-3 h-3')+'Sửa bài</button>' : '<button class="btn ghost" data-co="tk-nhan-hop" data-id="'+h(b.id)+'">Nhân bản để dùng</button>')+
      '<button class="btn ghost" data-co="tk-dong-hop">Đóng</button></div>');
  });
  CO.on('tk-sua-hop', function(el){ U.closeModal(); var b = bai(el.getAttribute('data-id')); if(!b || !canSua(b)) return; var s = CO.st(); s.tkNhap = tuBai(b); s.tab[VIEW] = 'soan'; CO.luu(); });
  CO.on('tk-nhan-hop', function(el){ U.closeModal(); nhanBan(el.getAttribute('data-id'), true); });
  CO.on('tk-in', function(){
    var b = document.body; b.classList.add('co-tk-dangin');
    function go(){ b.classList.remove('co-tk-dangin'); window.removeEventListener('afterprint', go); }
    window.addEventListener('afterprint', go);
    setTimeout(function(){ try{ window.print(); }catch(e){} setTimeout(go, 1500); }, 30);
  });

  /* Giao nhiệm vụ của bài cho nhà → nhật ký nv_giao */
  CO.on('tk-giao-mo', function(el){
    var b = bai(el.getAttribute('data-id')); if(!b) return;
    var nv = (b.nv||[]).filter(function(x){ return x.ten; });
    if(!nv.length){ U.toast('Bài chưa có nhiệm vụ để giao.', 'err'); return; }
    var dk = CO.dsDK().filter(function(d){ return d.tt==='dang'; });
    if(b.nha) dk.sort(function(a, c){ return (c.nha===b.nha ? 1 : 0) - (a.nha===b.nha ? 1 : 0); });
    if(!dk.length){ U.toast('Chưa có nhà nào đang chạy chương trình — ghép chương trình ở màn Chương trình coach trước.', 'err'); return; }
    var mac = dk.filter(function(d){ return d.ct===b.ct; })[0] || dk[0];
    var hn = CO.homNay();
    U.modal('<h3 style="margin:0 0 6px">Giao nhiệm vụ cho nhà</h3><p class="sm muted">Mỗi nhiệm vụ thành một dòng "Giao nhiệm vụ" trong nhật ký của nhà, có hạn tính từ hôm nay — màn Điều phối đo đúng hạn, quá hạn, minh chứng từ đây.</p>'+
      '<div class="mt">'+CO.o2('Lượt ghép đang chạy', CO.chon('tk-giao-dk', dk.map(function(d){ var c = CO.ct(d.ct); return [d.id, d.tenNha+' · '+(c?c.ten:d.ct)+(d.mau?' (minh hoạ)':'')]; }), mac.id))+'</div>'+
      '<div class="co-ds mt">'+ nv.map(function(x, i){
        var ok = Number(x.han) >= 1;
        return '<label class="co-dong" style="cursor:pointer"><input type="checkbox" id="tk-giao-'+i+'"'+(ok?' checked':' disabled')+'>'+
          '<span class="co-grow sm"><b>'+h(x.ten)+'</b><br><span class="tiny muted">'+(ok ? 'hạn '+h(CO.ngayVN(CO.cong(hn, Number(x.han))))+' · '+h(x.xong||'chưa có tiêu chí xong')+' · '+h(TEN_MC[x.mc]||'chưa chọn minh chứng') : 'chưa có hạn — sửa bài trước khi giao')+'</span></span></label>'; }).join('') +'</div>'+
      '<div class="co-hang mt2"><button class="btn pri" data-co="tk-giao-ok" data-id="'+h(b.id)+'">'+ic('check','w-4 h-4')+'Giao nhiệm vụ</button><button class="btn ghost" data-co="tk-dong-hop">Thôi</button></div>');
  });
  CO.on('tk-giao-ok', function(el){
    var b = bai(el.getAttribute('data-id')); if(!b){ U.closeModal(); return; }
    var d = CO.dk(CO.o('tk-giao-dk'));
    if(!d){ U.toast('Chọn một lượt ghép.', 'err'); return; }
    var nv = (b.nv||[]).filter(function(x){ return x.ten; }), hn = CO.homNay(), chon = [];
    nv.forEach(function(x, i){ if(CO.o('tk-giao-'+i)===true && Number(x.han) >= 1) chon.push(x); });
    if(!chon.length){ U.toast('Chọn ít nhất một nhiệm vụ có hạn.', 'err'); return; }
    var trung = (b.dung||[]).some(function(u){ return u.dk===d.id && u.ngay===hn; });
    if(trung){ U.toast('Bài này đã giao cho '+d.tenNha+' hôm nay — tránh giao trùng.', 'err'); return; }
    chon.forEach(function(x){
      CO.ghi({ loai:'nv_giao', ma:CO.id('nv'), han:CO.cong(hn, Number(x.han)), ghi:x.ten, nha:d.nha, dk:d.id }, false);
    });
    b.dung = b.dung || []; b.dung.push({ t:Date.now(), ngay:hn, dk:d.id, nha:d.nha, so:chon.length });
    U.closeModal(); U.toast('Đã giao '+chon.length+' nhiệm vụ cho '+d.tenNha+'.', 'ok'); veGiu();
  });

  /* ═════════ 3 · CHUẨN SOÁT ═════════ */
  function veChuan(){
    var tc = {}; (G.CO_TC||[]).forEach(function(t){ tc[t.ma] = t; });
    var o = U.sec('Mười luật của máy soát', 'Mỗi luật một điểm · ≥ 8/10 đạt chuẩn · 6–7 sửa trước khi dẫn · dưới 6 chưa dùng được');
    o += '<div class="co-tb mb"><table><thead><tr><th>#</th><th>Luật</th><th>Máy kiểm thế nào</th><th>Vì sao — tiêu chí chất lượng</th></tr></thead><tbody>'+
      LUAT.map(function(L){
        var cach = {
          1:'Có động từ hành vi (viết, nói, chọn, lập, ghi…) và con số hoặc mốc (số, lần, ngày, %, phút, tuần, buổi).',
          2:'Cộng phút của sáu nhịp, nằm trong 45–90.',
          3:'Nhịp nào cũng có hoạt động và số phút lớn hơn 0.',
          4:'Câu hỏi kết thúc bằng "?", không mở đầu bằng "có phải", "sao không", "đúng không", không phải câu có/không.',
          5:'Quét tên bài, mục tiêu, sáu nhịp, nhiệm vụ, nghiệm thu tìm các cụm cấm (xem dưới). Ghi chú an toàn không bị quét — ở đó được trích câu cấm để nhắc.',
          6:'Đếm nhiệm vụ có tên: 1–3 đạt; 4–5 cảnh báo, không tính điểm.',
          7:'Mỗi nhiệm vụ có "xong là khi…" và hạn từ 1 ngày.',
          8:'Mỗi nhiệm vụ chọn ảnh / ghi âm / văn bản / bảng tick.',
          9:'Có tiêu chí nghiệm thu buổi (từ 10 ký tự).',
          10:'Chương trình có thật, giai đoạn thuộc chương trình, buổi số nằm trong dải buổi của giai đoạn.' }[L.so];
        var t = tc[L.tc];
        return '<tr><td class="so"><b>'+L.so+'</b></td><td style="min-width:160px"><b>'+h(L.ten)+'</b><div class="tiny muted">Sửa: '+h(L.goi)+'</div></td>'+
          '<td class="sm" style="min-width:200px">'+h(cach)+'</td><td class="sm" style="min-width:180px">'+(t ? '<b>'+h(t.ten)+'</b><div class="tiny muted">Mẫu 4 điểm: '+h(t.m4)+'</div>' : '—')+'</td></tr>';
      }).join('')+'</tbody></table></div>';
    o += '<div class="card pad-sm mb"><b class="sm">Cụm cấm (luật 5)</b><div class="co-hang mt" style="gap:6px">'+ CAM.map(function(c){ return U.chip(c, CO.MAU_DEN.DO); }).join('') +'</div>'+
      '<p class="tiny muted mt" style="line-height:1.5">Gốc từ lằn ranh đỏ của nghề: '+(G.CO_LANRANH||[]).map(function(x){ return h(x.ten); }).join(' · ')+
      '. Lời hứa tuyệt đối không đo được, lời gán nhãn làm tổn thương con, lời so sánh và ép buộc đều đẩy gia đình ra khỏi vai người tự tìm giải pháp.</p></div>';

    var nh = CO.nhip(), phut = nh.reduce(function(a,x){ return a+(Number(x.phut)||0); },0);
    o += U.sec('Sáu nhịp của một buổi', 'Nguồn: '+CO.nhipNguon()+' · khung mặc định '+phut+' phút');
    o += '<div class="co-tb mb"><table><thead><tr><th>Nhịp</th><th>Phút</th><th>Làm gì</th><th>Câu hỏi mẫu</th><th>Tránh</th></tr></thead><tbody>'+
      nh.map(function(B, i){ return '<tr><td style="min-width:150px"><b style="color:'+h(B.c||'inherit')+'">'+h(B.no||i+1)+'. '+h(B.ten)+'</b></td><td class="so">'+h(B.phut)+'</td>'+
        '<td class="sm">'+h(B.lam||'—')+'</td><td class="sm"><i>'+h(B.hoi||'—')+'</i></td><td class="sm">'+h(B.tranh||'—')+'</td></tr>'; }).join('')+'</tbody></table></div>';
    o += '<p class="tiny muted">'+icI('shield')+' Máy soát kiểm hình thức của bài — nó không thay được người dẫn. Chất lượng buổi thật được chấm ở màn Kiểm soát chất lượng theo mười tiêu chí 0–4.</p>';
    return o;
  }
})();
