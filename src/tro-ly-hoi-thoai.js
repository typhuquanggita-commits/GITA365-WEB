/* ═══════════════════════════════════════════════════════════════
   GITA 365 — LỚP HỘI THOẠI CỦA TRỢ LÝ (V50·168)

   Chủ hệ (07/10/2026), hai lời:
   · "nhắn xin chào thì trợ lý lấy cả loạt câu hỏi gợi ý ra để hỏi; bấm
     một lựa chọn thì nó gửi cả đống thứ khách chưa cần… giống một cái
     máy vô cảm, không có tư duy, không chạm được kết nối với khách hàng."
   · "Trợ lý cần phân biệt rõ các vai… Trước khi trả lời: check tài khoản
     — giới hạn cấp, tầng, phạm vi → check thông tin từ vai gửi yêu cầu →
     suy luận yêu cầu → tư duy phương án → check kho + quy trình + giới
     hạn → trả lời thông minh (đặt mình vào vị trí người hỏi) → truy vấn
     nghiệp vụ cho phép để dẫn dắt khách vào hành trình GITA365."

   Soi lại thì mỗi bộ phận của trợ lý (chuỗi chẩn đoán, bốn nhịp việc, tư
   liệu, tư liệu chờ, tầng trên, kho chưa khai tầng…) tự đổ khối của mình
   vào CÙNG một câu trả lời cho MỌI vai, và không ai chọn xem người đang
   chat là ai, cần gì lúc này.

   Lớp này là sáu bước ấy, chạy TRƯỚC bộ tra kho, mỗi lượt:
     B1 HỒ SƠ        htHoSo()    vai · nhóm vai · cấp · tầng · nhà · KPI ·
                                 phạm vi dữ liệu · giọng nói · màn mở được
     B2 SUY LUẬN     htSuyLuan() câu xã giao? câu hỏi thẳng (theo nhóm
                                 vai)? hay một chuyện / một ca cần tra kho?
     B3 PHƯƠNG ÁN    mỗi nhóm vai một cách xử lý:
                       phụ huynh  → lắng nghe, chẩn đoán từng câu, chốt
                                    một việc · một con số · một bài đọc
                       học viên   → nói với em, một việc nhỏ, không chẩn
                                    đoán kiểu phụ huynh, không nói tiền
                       đại sứ     → giới thiệu · hoa hồng · sự kiện; chuyện
                                    của nhà khác thì chuyển Tư vấn
                       nhân sự    → tra đúng lăng kính vai (phác đồ, quy
                                    trình, KPI, quyền), nói rõ phạm vi
     B4 KIỂM GIỚI HẠN màn có mở cho vai không (G.allowed), tư liệu có trong
                       phần nền không (khachMoDuoc), cổng phí, phạm vi nhà
     B5 TRẢ LỜI      một câu đón · một ý chính · MỘT câu hỏi
     B6 DẪN ĐƯỜNG    đúng MỘT màn tiếp theo của hành trình — chỉ màn vai
                       ấy mở được, không bao giờ trỏ vào màn bị khoá
   Toàn bộ chạy trong máy, như phần còn lại của trợ lý.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
(function(){
  function boDau(s){
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  }
  /* Câu đã chuẩn hoá: bỏ dấu, bỏ dấu câu, bỏ tiểu từ cuối (ạ · nhé · nha · ơi). */
  function chuan(s){
    return boDau(s).replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
      .replace(/(\s(a|ah|nhe|nha|nhen|oi|ha|nhi|day))+$/, '').trim();
  }
  function soTu(s){ return s ? s.split(' ').length : 0; }
  function esc(s){ return G.U && G.U.h ? G.U.h(s) : String(s); }
  function thuong(s){ s = String(s || '').trim(); return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; }
  function hoa(s){ s = String(s || ''); return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function ngan(s, n){ s = String(s || '').replace(/\s+/g, ' ').trim(); n = n || 60; return s.length > n ? s.slice(0, n - 1).replace(/\s\S*$/, '') + '…' : s; }
  G.htNgan = ngan;
  /* Câu đầu của một đoạn kho. Không dùng lookbehind: Safari dưới 16.4
     không đọc được, và một biểu thức không đọc được làm hỏng cả gói app. */
  function cauDau(s){ s = String(s || '').trim(); var m = s.match(/^[\s\S]*?[.!?…](\s|$)/); return ngan(m ? m[0].trim() : s, 220); }

  /* ═══════════ B1 · HỒ SƠ NGƯỜI ĐANG HỎI ═══════════ */
  var NHOM = { R01:'quanTri', R02:'quanTri', R03:'dieuHanh', R04:'chuyenMon', R05:'coach', R06:'coach', R07:'coach',
    R08:'giaoVien', R09:'mentor', R10:'danhGia', R11:'tuVan', R12:'phanTich', R13:'phuHuynh', R14:'hocVien', R15:'daiSu' };
  var GIONG = {
    phuHuynh:{ goi:'anh chị', toi:'em', da:'Dạ, ', nha:'nhà mình' },
    hocVien: { goi:'em', toi:'mình', da:'', nha:'em' },
    daiSu:   { goi:'anh chị', toi:'em', da:'Dạ, ', nha:'anh chị' },
    nhanSu:  { goi:'anh chị', toi:'em', da:'', nha:'' }
  };
  function moDuoc(v){ return !!(v && G.VIEWS && G.VIEWS[v] && (!G.allowed || G.allowed(v))); }
  function tenMan(v){ var it = G.navItem ? G.navItem(v) : null; return it ? (G.iname ? G.iname(it) : it.t) : v; }
  /* Màn đầu tiên MỞ ĐƯỢC trong một danh sách ứng viên — B4 nằm ở đây. */
  function manDau(ds){ for(var i = 0; i < ds.length; i++) if(moDuoc(ds[i])) return ds[i]; return null; }

  G.htHoSo = function(){
    var S = G.S || {}, r = S.roleObj || {}, a = S.acc || {}, role = S.role || r.id || '';
    var lv = r.lv || 99, nhom = NHOM[role] || 'nhanSu';
    var khach = !!(G.LA_KHACH && G.LA_KHACH());
    var f = null; try { f = khach && G.myFamily ? G.myFamily() : null; } catch(e){}
    var coHoSo = !!(f && f.nha && !/^chưa/i.test(String(f.nha)));
    /* Hồ sơ gia đình chưa nạp thì đọc tầng/nhà khai trên tài khoản — không đoán. */
    var tangSo = coHoSo ? f.tier : (a.tang || null);
    var t = tangSo && G.tierOf ? G.tierOf(tangSo) : null;
    var kpi = null; try { kpi = khach && G.kpiCuaToi ? Math.round(G.kpiCuaToi()) : null; } catch(e){}
    var phamVi = khach ? 'nhà mình' : lv <= 5 ? 'mọi nhà' : nhom === 'phanTich' ? 'số liệu tổng hợp, không đọc hồ sơ từng nhà' : 'các nhà anh chị phụ trách';
    var ten = String(a.ten || '').trim(), tach = ten.split(/\s+/);
    return { role:role, lv:lv, tenVai:r.n || role, nhom:nhom, khach:khach, ten:ten, tenGoi:tach[tach.length - 1] || '',
      nha:coHoSo ? f.nha : (a.nha || ''), coHoSo:coHoSo || !!a.nha, tang:t, kpi:kpi, phamVi:phamVi,
      giong: khach ? (GIONG[nhom] || GIONG.phuHuynh) : GIONG.nhanSu };
  };

  /* ═══════════ B2 · SUY LUẬN LOẠI CÂU ═══════════ */
  var CHAO = /^(xin chao|chao|chao em|chao ban|chao ad|chao admin|chao gita|chao tro ly|chao thay|chao co|hello|hi|helo|hey|alo|a lo|em oi|ad oi|ban oi|tro ly oi|co ai khong|co ai o day khong|xin chao em)$/;
  var CAM_ON = /^((ok|vang|da|da vang)\s)?(cam on|cam on em|cam on ban|cam on nhieu|cam on em nhieu|thanks|thank you|thank|tks|thanks em)$/;
  var DONG_Y_DAI = /^(duoc|ok|vang|da|dong y)( roi)?,? (toi nay|mai|tuan nay|cuoi tuan)?\s*(em|minh|toi|nha minh)?\s*(se )?(lam|thu)( thu| ngay| luon)?$/;
  var DONG_Y = /^(ok|oke|okay|okie|vang|da|u|uh|um|uhm|duoc|duoc roi|dc|roi|hieu roi|minh hieu roi|toi hieu roi|em hieu roi|da vang|vang a|ok em|da em|dung roi|chuan|dong y|duoc lam toi nay|duoc toi nay lam|lam toi nay|toi nay lam)$/;
  var TAM_BIET = /^(tam biet|bye|bye bye|hen gap lai|chao nhe|thoi nhe|toi di day|minh di day|vay thoi)$/;
  var KHEN = /^(hay qua|tuyet|tuyet voi|tot qua|gioi qua|hay|tot|rat hay|rat tot|huu ich qua)$/;
  var CHE = /(khong hieu|kho hieu|may moc|vo duyen|khong dung y|sai roi|tra loi linh tinh|lan man|dai qua|nhieu qua|roi qua|khong lien quan|vo cam|tra loi gi vay|hoi gi vay)/;
  var MO_CHAO = /^\s*(xin chào|chào em|chào bạn|chào thầy|chào cô|chào|hello|hi|alo|em ơi|ad ơi)\s*(ạ|a)?[\s,.!]+/i;

  /* { loai, conLai } — conLai: phần chuyện sau một câu chào ("chào em, con
     mình ôm điện thoại…") để đem đi nghe tiếp, không đánh rơi. */
  G.htLoaiCau = function(cau){
    var c = chuan(cau);
    if(!c) return null;
    if(CHAO.test(c)) return { loai:'chao' };
    if(CAM_ON.test(c)) return { loai:'camOn' };
    if(TAM_BIET.test(c)) return { loai:'tamBiet' };
    if(KHEN.test(c)) return { loai:'khen' };
    if(DONG_Y.test(c) || DONG_Y_DAI.test(c)) return { loai:'dongY' };
    if(soTu(c) <= 12 && CHE.test(c)) return { loai:'che' };
    var m = String(cau).match(MO_CHAO);
    if(m){
      var con = String(cau).slice(m[0].length).trim();
      if(con) return { loai:'chaoKem', conLai:con };
    }
    return null;
  };
  /* Câu vô nghĩa (gõ nhầm, một hai ký tự) — hỏi lại, không đem đi chẩn đoán. */
  G.htVoNghia = function(cau){
    var c = chuan(cau);
    return !c || c.replace(/\s/g, '').length <= 3 || /^[^aeiouy\s]+$/.test(c);
  };

  /* Câu hỏi thẳng — mỗi nhóm vai một bộ, đúng việc của vai ấy. */
  var Y_KHACH = [
    ['hocPhi',  /(hoc phi|chi phi|bao nhieu tien|gia bao nhieu|gia ca|bang gia|goi dich vu|het bao nhieu|ton bao nhieu)/],
    ['lenChang',/(khi nao|bao gio|bao lau).*(len|qua|sang|chuyen) (chang|tang)|len chang sau|len tang tren/],
    ['chang',   /(dang o|o) (chang|tang) nao|chang nao|tang nao|buoc tiep theo la gi|dang o dau trong lo trinh/],
    ['homNay',  /(hom nay|toi nay|bay gio).*(lam|nen lam) (viec )?gi|viec hom nay|hom nay lam gi/],
    ['gapNguoi',/(gap|noi chuyen voi|goi cho|lien he) (tu van|coach|nguoi that|giao vien|hoc vien)|coach cua (toi|minh|nha minh) la ai|so dien thoai|hotline/],
    ['credit',  /(credit|so du|vi cua|nap tien|diem thuong)/]
  ];
  var Y_DAISU = [
    ['gioiThieu',/(gioi thieu|ma gioi thieu|link|moi (nha|gia dinh|ban)|ket noi (nha|gia dinh))/],
    ['hoaHong', /(hoa hong|thuong|bao nhieu phan tram|nhan duoc bao nhieu|chi tra|thanh toan cho toi)/],
    ['suKien',  /(su kien|lua trai|buoi gap|workshop)/]
  ];
  var Y_NHANSU = [
    ['kpiToi',  /kpi (cua toi|thang nay|cua em|cua minh)|chi tieu cua toi|toi dat bao nhieu/],
    ['viecToi', /(hom nay|tuan nay) (toi|em|minh) (lam|can lam|phai lam)|viec cua toi|viec tre|viec qua han/],
    ['quyenHan',/(toi|em|minh) (co duoc|duoc phep|co quyen)|quyen (cua toi|han)|pham vi (cua toi|xem)|sao (toi|em) khong (mo|xem) duoc/],
    ['taiChinh',/(chot luong|bang luong|duyet chi|de xuat chi|phieu thu|hoan tien|mien giam|cong no|nhac thu|ke toan)/],
    ['khachToi',/(nha|gia dinh|khach) (toi|em|minh) phu trach|khach cua toi|danh sach nha|crm/]
  ];
  G.htSuyLuan = function(cau, hs){
    hs = hs || G.htHoSo();
    var c = chuan(cau), bo = hs.khach ? (hs.nhom === 'daiSu' ? Y_DAISU.concat(Y_KHACH) : Y_KHACH) : Y_NHANSU;
    for(var i = 0; i < bo.length; i++) if(bo[i][1].test(c)) return bo[i][0];
    return null;
  };
  /* Giữ tên cũ cho chỗ gọi cũ. */
  G.htYDinh = function(cau){ return G.htSuyLuan(cau); };

  /* ═══════════ B3–B6 · CÂU HỎI THẲNG ═══════════ */
  var HOTLINE = { nhan:'Gọi Tư vấn 08.5555.4688', tel:'0855554688' };
  function nut(v, nhan){ return moDuoc(v) ? [{ nhan:nhan || ('Mở ' + tenMan(v)), v:v }] : []; }

  G.htTraLoiThang = function(yd, d, hs){
    hs = hs || G.htHoSo();
    var V = hs.giong, t = hs.tang, k = hs.kpi, nguong = G.KPI_XIN_THEM || 80;
    var tenT = t ? t.code + ' · ' + (G.tname ? G.tname(t) : t.name) : '';
    var viec = d && d.viec && !d.viec.vuotTang ? d.viec : null, n0 = viec && viec.nhip && viec.nhip[0] && !viec.nhip[0].thieu ? viec.nhip[0] : null;

    /* ── Gia đình · học viên · đại sứ ── */
    if(yd === 'hocPhi'){
      if(hs.nhom === 'hocVien') return { chinh:'Chuyện học phí bố mẹ em trao đổi trực tiếp với Tư vấn nhé. Phần của em là giữ đều việc mỗi ngày — cái đó mới quyết định em đi nhanh hay chậm.', nut:nut('nhiem-vu', 'Xem việc của em') };
      return { chinh:V.da + 'học phí đi theo từng tầng của lộ trình, và mỗi nhà bắt đầu ở tầng hợp với chuyện đang gặp — nên con số đúng là con số Tư vấn báo riêng cho ' + V.nha + ', không phải một bảng giá chung.',
        hoi:'Anh chị muốn Tư vấn gọi lại trao đổi kỹ trong hôm nay không ạ?', nut:[HOTLINE].concat(nut(manDau(['lo-trinh','ban-do']), 'Xem lộ trình các tầng')) };
    }
    if(yd === 'chang'){
      if(!t) return { chinh:V.da + 'hồ sơ của ' + V.nha + ' chưa được mở, nên ' + V.toi + ' chưa thấy đang ở chặng nào. Tư vấn mở hồ sơ ngay sau buổi trao đổi đầu tiên.', nut:[HOTLINE] };
      return { chinh:hoa(V.da + V.nha + ' đang ở ' + tenT + (k != null ? ', KPI chặng này đang ' + k + '%' : '') + '.') + (viec ? ' Bước tiếp theo là một việc: <b>' + esc(viec.ten) + '</b>.' : ''), html:true,
        hoi: viec ? (hs.nhom === 'hocVien' ? 'Em muốn mình chỉ từng bước cho việc đó không?' : 'Anh chị muốn em dẫn từng bước cho việc đó không ạ?') : '',
        nut:nut(manDau(['ban-do','con-duong','lo-trinh']), 'Xem cả lộ trình') };
    }
    if(yd === 'lenChang')
      return { chinh:hoa(V.da + V.nha + ' lên chặng sau khi KPI chặng đang đi đạt ' + nguong + '% và Coach nghiệm thu.') +
          (k != null ? ' Hiện KPI đang ' + k + '%' + (k >= nguong ? ' — đã tới ngưỡng, Coach sẽ hẹn buổi nghiệm thu.' : ', còn ' + (nguong - k) + '% nữa.') : ''),
        hoi: k != null && k < nguong ? (hs.nhom === 'hocVien' ? 'Em muốn biết việc nào kéo KPI lên nhanh nhất không?' : 'Anh chị muốn em chỉ việc nào kéo KPI lên nhanh nhất không ạ?') : '',
        nut:nut(manDau(['kpi-100','tien-bo'])) };
    if(yd === 'homNay'){
      if(!viec) return { chinh:hoa(V.da + 'hôm nay ' + V.nha + ' chỉ cần giữ đúng một việc đang làm dở.'), nut:nut(manDau(['hom-nay','nhiem-vu','ngoi-nha'])) };
      return { chinh:hoa(V.da + 'tối nay ' + V.nha + ' làm đúng một việc: ') + '<b>' + esc(viec.ten) + '</b>.' + (n0 ? ' ' + esc(n0.loi) : ''), html:true,
        hoi: hs.nhom === 'hocVien' ? 'Em làm thử tối nay, mai kể mình nghe kết quả nhé?' : 'Anh chị làm thử tối nay, mai kể em nghe kết quả nhé?',
        chips: hs.nhom === 'hocVien' ? ['Được, tối nay em làm', 'Việc này em làm rồi'] : ['Được, tối nay làm', 'Việc này nhà mình làm rồi'],
        nut:nut(manDau(['hom-nay','nhiem-vu'])) };
    }
    if(yd === 'gapNguoi')
      return { chinh:V.da + (hs.nhom === 'hocVien' ? 'em nhờ bố mẹ gọi giúp nhé — hoặc gọi thẳng số dưới đây, có người thật nghe máy.' : 'anh chị gọi thẳng số dưới đây là gặp người thật — Tư vấn hoặc Coach của ' + V.nha + ' sẽ nhận cuộc gọi.'), nut:[HOTLINE] };
    if(yd === 'credit')
      return { chinh:V.da + (hs.nhom === 'hocVien' ? 'số credit và lịch sử dùng nằm ở Ví credit của nhà em.' : 'số dư, lịch sử nạp và tiêu credit nằm ở Ví credit — mỗi buổi coach đã ghi đều trừ ở đó, có ngày giờ.'), nut:nut(manDau(['vi-credit','thanh-toan'])) };
    if(yd === 'gioiThieu')
      return { chinh:'Dạ, anh chị giới thiệu một nhà bằng cách gửi trang Kết nối — nhà ấy để lại thông tin, Tư vấn gọi trong 24 giờ và ghi anh chị là người giới thiệu.', hoi:'Anh chị đang có nhà nào muốn giới thiệu không ạ?', nut:nut(manDau(['ket-noi','dai-su','ve-tinh'])) };
    if(yd === 'hoaHong')
      return { chinh:'Dạ, hoa hồng tính trên từng nhà anh chị giới thiệu và chỉ ghi nhận khi nhà ấy đã vào học; số đã ghi, chờ duyệt và đã trả nằm ở màn Hoa hồng.', nut:nut(manDau(['hoa-hong','dai-su'])) };
    if(yd === 'suKien')
      return { chinh:V.da + 'lịch sự kiện và lửa trại sắp tới nằm ở màn Sự kiện — đăng ký ở đó là giữ chỗ.', nut:nut(manDau(['su-kien'])) };

    /* ── Nhân sự: đúng lăng kính vai, nói rõ phạm vi ── */
    if(yd === 'kpiToi')
      return { chinh:'KPI của anh chị đo theo vai ' + hs.tenVai + ' và tính trên ' + hs.phamVi + '. Số từng chỉ tiêu, ngưỡng đạt và xu hướng nằm ở màn KPI của tôi.', nut:nut(manDau(['kpi-toi','dk-cua-toi'])) };
    if(yd === 'viecToi')
      return { chinh:'Việc của anh chị hôm nay, kể cả việc trễ nhịp, gom ở Bảng việc — xếp theo hạn, việc trễ lên đầu.', nut:nut(manDau(['bang-viec','dk-cua-toi','vong-nhac'])) };
    if(yd === 'quyenHan'){
      var hubs = G.v50HubsVai ? G.v50HubsVai().map(function(hb){ return hb.ten; }) : [];
      return { chinh:'Vai ' + hs.tenVai + ' (cấp ' + hs.lv + ') mở ' + hubs.length + ' màn: ' + hubs.join(' · ') + '. Dữ liệu khách trong phạm vi ' + hs.phamVi + '. Quyền thêm (CRM, ban tài chính, T5-PRO) chỉ Super Admin cấp.' };
    }
    if(yd === 'taiChinh'){
      var mTC = manDau(['toan-canh-tc','phong-tai-chinh','ke-toan-thue']);
      if(mTC) return { chinh:'Quy trình tiền đi theo mốc: đề xuất → duyệt theo mức C0–C6 → hoá đơn → chốt sổ tuần. Ai làm bước nào, và anh chị đang giữ bước nào, xem ở ' + tenMan(mTC) + '.', nut:nut(mTC) };
      return { chinh:'Vai ' + hs.tenVai + ' chưa được cấp vị trí ban tài chính, nên các bước duyệt và chốt sổ không mở ở tài khoản này. Ghi phiếu thu cho nhà anh chị phụ trách vẫn làm được ở màn chăm sóc; vị trí tài chính do Super Admin cấp.', nut:nut(manDau(['tt-cskh','dk-cua-toi'])) };
    }
    if(yd === 'khachToi'){
      var mK = manDau(['crm','tt-cskh','coach-dp','van-hanh-cham-soc']);
      return { chinh:'Danh sách nhà trong phạm vi ' + hs.phamVi + ' nằm ở ' + (mK ? tenMan(mK) : 'màn chăm sóc khách') + ' — mỗi nhà có đèn chăm sóc, lần chạm cuối và việc kế tiếp.', nut:mK ? nut(mK) : [] };
    }
    return null;
  };

  /* ═══════════ B5 · ĐÁP XÃ GIAO NHƯ NGƯỜI ═══════════ */
  G.htDapXaGiao = function(loai, ctx, hs){
    ctx = ctx || {}; hs = hs || G.htHoSo();
    var V = hs.giong, hv = hs.nhom === 'hocVien', kh = hs.khach, dangDo = ctx.cauDangDo;
    if(loai === 'chao'){
      if(!kh) return { chinh:'Chào anh chị. Anh chị cần tra gì — phác đồ, kịch bản, tình huống, quy trình hay KPI? Cứ gõ tự nhiên, em tìm đúng tư liệu trong phạm vi vai ' + hs.tenVai + '.' };
      if(dangDo) return { chinh:(hv ? 'Mình đây.' : 'Dạ, em đây ạ.') + ' Mình đang nói dở chuyện “' + ngan(dangDo) + '”.', hoi: hv ? 'Em kể tiếp chuyện đó, hay hôm nay có chuyện khác?' : 'Anh chị kể tiếp chuyện đó, hay hôm nay có chuyện mới ạ?' };
      if(hv) return { chinh:'Chào em!', hoi:'Hôm nay em đang vướng chuyện gì — bài vở, thời gian, hay chuyện ở nhà? Kể mình nghe nhé.' };
      if(hs.nhom === 'daiSu') return { chinh:'Dạ, em chào anh chị ạ.', hoi:'Hôm nay anh chị cần em hỗ trợ giới thiệu nhà mới, xem hoa hồng, hay lịch sự kiện ạ?' };
      return { chinh:'Dạ, em chào anh chị ạ.', hoi:'Nhà mình đang cần em hỗ trợ chuyện gì? Anh chị cứ kể tự nhiên, em nghe đây.' };
    }
    if(loai === 'camOn') return { chinh: !kh ? 'Không có gì. Cần tra thêm gì anh chị cứ gõ.' : hv ? 'Không có gì đâu. Em làm thử rồi kể mình nghe nhé!' : 'Dạ, không có gì ạ. Anh chị làm thử rồi kể em nghe kết quả nhé — cần gì thêm cứ nhắn em.' };
    if(loai === 'tamBiet') return { chinh: !kh ? 'Chào anh chị, chúc một ca làm việc trơn tru.' : hv ? 'Chào em, học vui nhé!' : 'Dạ, em chào anh chị. Chúc nhà mình buổi tối nhẹ nhàng — cần gì anh chị nhắn em bất cứ lúc nào.' };
    if(loai === 'khen') return { chinh: !kh ? 'Cảm ơn anh chị.' : hv ? 'Cảm ơn em! Cứ đi từng bước như vậy là đúng rồi.' : 'Dạ, em cảm ơn anh chị. Nhà mình cứ đi từng bước như vậy là đúng nhịp rồi ạ.' };
    if(loai === 'che') return { chinh: !kh ? 'Xin lỗi, em trả lời chưa trúng.' : hv ? 'Xin lỗi em, mình trả lời chưa đúng ý.' : 'Dạ, em xin lỗi vì trả lời chưa đúng ý anh chị.',
      hoi: !kh ? 'Anh chị nói lại giúp em: cần tra đúng việc gì?' : hv ? 'Em nói giúp mình một câu thôi: em cần nhất điều gì lúc này?' : 'Anh chị nói giúp em một câu thôi: điều ' + V.nha + ' cần nhất lúc này là gì?' };
    if(loai === 'dongY'){
      if(ctx.hoiDangDo){
        var hua = /(lam|thu)/.test(chuan(ctx.cau || ''));
        return { chinh: hua ? (hv ? 'Tốt quá! Mình hỏi thêm một chút cho sát nhé.' : 'Dạ, tốt quá ạ. Em hỏi thêm một chút cho sát với nhà mình nhé.') : (hv ? 'Ừ.' : 'Dạ.'),
          hoi:ctx.hoiDangDo.hoi, chips:ctx.hoiDangDo.chips };
      }
      return { chinh: !kh ? 'Vâng. Cần tra gì tiếp anh chị cứ gõ.' : hv ? 'Ừ. Em cứ kể tiếp, hoặc hỏi mình điều đang vướng nhé.' : 'Dạ. Anh chị cứ kể tiếp, hoặc hỏi em điều đang vướng nhé.' };
    }
    if(loai === 'voNghia') return { chinh: !kh ? 'Em chưa rõ ý anh chị.' : hv ? 'Mình chưa rõ ý em lắm.' : 'Dạ, em chưa rõ ý anh chị lắm.',
      hoi: ctx.hoiDangDo ? ctx.hoiDangDo.hoi : (!kh ? 'Anh chị gõ giúp em tên việc, mã phác đồ hoặc một câu mô tả ca nhé.' : hv ? 'Em kể mình nghe chuyện đang vướng nhé.' : 'Anh chị kể em nghe chuyện ' + V.nha + ' đang gặp nhé.'),
      chips: ctx.hoiDangDo ? ctx.hoiDangDo.chips : [] };
    return null;
  };

  /* ═══════════ B3–B6 · MỘT CHUYỆN CỦA GIA ĐÌNH ═══════════
     Từ toàn bộ thứ bộ tra kho trả về, chọn đúng: một câu đón · một ý
     chính · một câu hỏi. Những thứ còn lại (tư liệu chờ, kho chưa khai
     tầng, bốn nhịp đầy đủ…) KHÔNG lên mặt người đang chat. */
  var DON = ['Dạ, em hiểu rồi ạ.', 'Dạ, chuyện này nhiều nhà đang gặp, anh chị không một mình đâu ạ.', 'Dạ, cảm ơn anh chị đã kể.'];
  var DON_HV = ['Mình hiểu rồi.', 'Chuyện này nhiều bạn gặp lắm, em không một mình đâu.', 'Cảm ơn em đã kể.'];

  G.htGon = function(d, ctx, hs){
    hs = hs || G.htHoSo();
    var hv = hs.nhom === 'hocVien', ds = hs.nhom === 'daiSu';
    var g = { mo:'', chinh:'', hoi:'', chips:[], nut:[], baiDoc:null };
    var c = d.chuoi, v0 = d.viec || ctx.viec, viec = v0 && !v0.vuotTang ? v0 : null;
    var kb = d.kbs, kbTL = kb && kb.ro !== false ? (Array.isArray(kb.traLoi) ? kb.traLoi[0] : kb.traLoi) : null;
    var kbCD = kb ? (Array.isArray(kb.chanDoan) ? kb.chanDoan[0] : kb.chanDoan) : null;
    var n0 = viec && viec.nhip && viec.nhip[0] && !viec.nhip[0].thieu ? viec.nhip[0] : null;
    var lo = G.tlNgonNgu ? G.tlNgonNgu(ctx.cau).lo : false;

    /* Đại sứ kể chuyện của một nhà khác: không chẩn đoán hộ — chuyển Tư vấn. */
    if(ds && ctx.laCauMoi){
      g.mo = 'Dạ, em hiểu ạ.';
      g.chinh = 'Chuyện riêng của từng nhà, Tư vấn nhận trực tiếp để lắng nghe đủ và giữ kín cho nhà ấy. Anh chị gửi nhà ấy trang Kết nối, hoặc gọi Tư vấn giới thiệu luôn.';
      g.nut = [HOTLINE].concat(nut(manDau(['ket-noi','dai-su'])));
      g.moHo = true;
      return g;
    }

    if(ctx.laCauMoi){
      var bo = hv ? DON_HV : DON;
      var don = lo ? (hv ? 'Mình hiểu, chuyện này đang làm em mệt. Mình đi từng bước nhé.' : 'Em hiểu, chuyện này đang làm nhà mình mệt. Mình đi từng bước, không vội ạ.') : bo[(ctx.cau || '').length % bo.length];
      g.mo = ctx.chaoKem ? (hv ? 'Chào em! ' : 'Dạ, em chào anh chị. ') + hoa(don.replace(/^Dạ,\s*/, '')) : don;
      if(kbTL && !hv) g.chinh = cauDau(kbTL);
      else if(viec && n0){ g.chinh = (hv ? 'Có một việc nhỏ em làm được ngay tối nay: ' : 'Có một việc nhỏ nhà mình làm được ngay từ tối nay: ') + '<b>' + esc(viec.ten) + '</b>. ' + esc(n0.loi); g.html = true; }
      else if(d.soan && d.soan.cau) g.chinh = cauDau(d.soan.cau);
      else if(d.loi) g.chinh = cauDau(d.loi);
      else if(ctx.baiDoc && ctx.baiDoc.tom){
        /* Kho chỉ khớp một bài học: lấy đúng một câu ý của bài làm ý chính,
           và nút mở bài ngay dưới — không liệt kê mười hai tư liệu. */
        g.chinh = (hv ? 'Có một bài ngắn đúng chuyện của em: ' : 'Có một bài ngắn đúng chuyện này: ') + '<b>' + esc(ctx.baiDoc.ten) + '</b>. ' + esc(cauDau(ctx.baiDoc.tom));
        g.html = true; g.baiDoc = ctx.baiDoc; g.daDuaBai = true;
      }
      if(hv){
        /* Học viên: không chạy chuỗi chẩn đoán viết cho phụ huynh. */
        if(g.chinh && !g.daDuaBai){ g.hoi = 'Em thử tối nay rồi kể mình nghe nhé?'; g.chips = ['Được, tối nay em làm', 'Em chưa hiểu cách làm']; g.nut = nut(manDau(['nhiem-vu','hom-nay'])); }
        else if(g.chinh) g.hoi = 'Em đọc xong thấy chỗ nào giống mình nhất thì kể mình nghe nhé.';
      }
      else if(kb && kb.ro === false) g.hoi = kbCD || 'Anh chị kể rõ hơn một chút giúp em được không ạ?';
      else if(c && (g.chinh || c.khoanhDuoc)){ g.hoi = g.chinh ? 'Để em gợi ý sát với nhà mình hơn: ' + thuong(c.hoi) : c.hoi; g.chips = (c.goiY || []).slice(0, 4); }
      else if(kbCD) g.hoi = kbCD;
      /* Chưa hiểu được chuyện gì: hỏi mở MỘT câu, không mở chuỗi — câu sau
         của khách là một chuyện mới, không bị đọc thành câu trả lời. */
      if(!g.chinh && !g.hoi){
        g.moHo = true;
        g.mo = ctx.chaoKem ? (hv ? 'Chào em!' : 'Dạ, em chào anh chị.') : (hv ? 'Ừ.' : 'Dạ.');
        g.hoi = hv ? 'Em kể mình nghe thêm một chút nhé — chuyện xảy ra ở đâu, từ bao giờ?' : 'Anh chị kể em nghe thêm một chút được không ạ — chuyện đang xảy ra với ai, và từ bao giờ?';
      }
      if(!c && !hv && !g.moHo) g.baiDoc = ctx.baiDoc || null;
      /* Hỏi mở hai lần liền mà vẫn chưa nắm được chuyện: đừng hỏi lần ba —
         mời người thật nghe trực tiếp (B6 cho trường hợp máy không đủ). */
      if(g.moHo && ctx.moHoTruoc){
        g.mo = hv ? 'Mình chưa nắm được chuyện của em qua tin nhắn.' : 'Dạ, em chưa nắm được đủ chuyện của ' + hs.giong.nha + ' qua tin nhắn.';
        g.hoi = hv ? 'Em nhờ bố mẹ gọi Tư vấn, hoặc kể với Coach ở buổi tới nhé — có người thật nghe sẽ rõ hơn nhiều.' : 'Để anh chị không phải kể đi kể lại, em nhờ Tư vấn gọi lại nghe trực tiếp nhé?';
        g.nut = [HOTLINE];
      }
      return g;
    }

    /* Lượt TRẢ LỜI trong chuỗi (phụ huynh): đón câu vừa chọn theo ĐÚNG vòng
       vừa hỏi — không lặp nguyên văn câu khách kèm "em ghi nhận" mọi lượt. */
    var daTra = ctx.daTra || 0, soVong = c ? c.soVong : 0;
    g.mo = donTraLoi(ctx.vongVua, ctx.cau, ctx.chipVua, daTra);
    if(c && daTra >= soVong){
      /* Hết một vòng chẩn đoán: CHỐT — một việc, một con số, một bài đọc,
         và MỘT màn để bắt tay vào làm (B6). */
      var dem = ctx.daChon && ctx.daChon[soVong - 1] ? ctx.daChon[soVong - 1] : '';
      var chon = ctx.daChon && ctx.daChon[3] ? boDau(ctx.daChon[3]) : '';
      var khi = /lam roi/.test(chon) ? 'nhà mình giữ đều việc' : /cuoi tuan/.test(chon) ? 'cuối tuần này cả nhà cùng làm việc' : 'tối nay nhà mình làm việc';
      g.mo = 'Dạ, vậy mình chốt nhé.';
      g.chinh = (viec ? hoa(khi) + ' <b>' + esc(viec.ten) + '</b>' : 'Nhà mình làm đúng việc đã bàn') +
        (dem && !/chưa biết/i.test(dem) ? ', và ba tối nữa mình cùng nhìn lại <b>' + esc(thuong(dem)) + '</b>.' :
         '. Ba tối nữa anh chị chỉ cần đếm số lần phải nhắc con — con số ấy nói thật nhất.');
      g.html = true;
      g.hoi = 'Anh chị làm thử rồi quay lại kể em nghe nhé — có gì vướng giữa chừng cứ nhắn em.';
      g.baiDoc = ctx.baiDoc || null;
      g.nut = nut(manDau(['hom-nay','nhiem-vu','ngoi-nha']), 'Ghi việc vào Nhà mình hôm nay');
      g.chot = true;
      return g;
    }
    if(c && c.vong && c.vong.ma === 'MOTVIEC' && viec && n0){
      g.chinh = 'Với nhà mình, việc nên làm trước là <b>' + esc(viec.ten) + '</b>. ' + esc(n0.loi); g.html = true;
    }
    if(c){ g.hoi = c.hoi; g.chips = (c.goiY || []).slice(0, 4); }
    else if(kbCD) g.hoi = kbCD;
    return g;
  };

  /* Câu đón theo vòng vừa trả lời. Chỉ nhắc lại lời khách khi đó là một
     lựa chọn có sẵn (đọc tự nhiên); câu tự gõ thì đón chung, không trích. */
  var DON_CHUNG = ['Dạ, em hiểu rồi ạ.', 'Dạ, chi tiết này giúp em hiểu rõ hơn nhiều.', 'Dạ, vậy là rõ hơn rồi ạ.'];
  function donTraLoi(ma, cau, laChip, i){
    var b = boDau(cau);
    if(laChip && ma === 'BOICANH' && !/bat cu luc nao/.test(b)) return 'Dạ, vậy chuyện hay rơi vào ' + thuong(cau) + '.';
    if(ma === 'BOICANH' && /bat cu luc nao/.test(b)) return 'Dạ, vậy là cứ nhắc tới việc học là căng.';
    if(ma === 'COTLOI') return /khong co gi/.test(b) ? 'Dạ, em hiểu ạ.' : 'Dạ, chi tiết này quan trọng — nó thường là chỗ chuyện bắt đầu.';
    if(ma === 'MOTVIEC') return /lam roi/.test(b) ? 'Dạ, vậy nhà mình đã đi trước một bước rồi.' : /cuoi tuan/.test(b) ? 'Dạ, cuối tuần cả nhà cùng ngồi cũng được ạ.' : 'Dạ, tốt quá ạ.';
    return DON_CHUNG[(i || 0) % DON_CHUNG.length];
  }

  /* "Em chưa hiểu cách làm" — giải thích thêm ĐÚNG việc vừa đưa: hai nhịp
     kế của chính việc ấy trong kho, không bịa thêm câu nào. */
  G.htGiaiThem = function(viec, hs){
    hs = hs || G.htHoSo();
    var hv = hs.nhom === 'hocVien', ds = (viec && viec.nhip || []).slice(1, 3).filter(function(n){ return !n.thieu && n.loi; });
    if(!ds.length) return null;
    return { mo: hv ? 'Mình nói rõ hơn nhé.' : 'Dạ, em nói rõ hơn ạ.',
      chinh: ds.map(function(n){ return '<b>' + esc(n.ten) + ':</b> ' + esc(cauDau(n.loi)); }).join('<br>'), html:true,
      hoi: hv ? 'Vậy tối nay em thử được chứ?' : 'Vậy tối nay nhà mình thử được chứ ạ?',
      chips: hv ? ['Được, tối nay em làm'] : ['Được, tối nay làm'] };
  };
  G.htHoiGiaiThem = function(cau){ return /(chua hieu|khong hieu|lam the nao|cach lam|giai thich|noi ro|cu the hon)/.test(chuan(cau)); };

  /* Lời chào đầu cửa sổ — theo nhóm vai (B1). */
  G.htLoiChao = function(hs, nho){
    hs = hs || G.htHoSo();
    if(hs.nhom === 'hocVien') return 'Chào ' + hs.tenGoi + '! Mình là giáo viên hướng dẫn của em ở GITA 365. ' + (nho || 'Hôm nay em cần mình giúp chuyện gì — bài vở, thời gian hay chuyện ở nhà?');
    if(hs.nhom === 'daiSu') return 'Em chào anh/chị ' + hs.tenGoi + ' ạ. Em là trợ lý riêng của anh chị ở GITA 365 — giới thiệu nhà mới, hoa hồng hay lịch sự kiện, anh chị cần gì cứ nhắn em.';
    return null;
  };

  /* B6 cho nhân sự: một màn làm việc đúng vai, theo thứ vừa tra. */
  G.htDanNhanSu = function(d, hs){
    hs = hs || G.htHoSo();
    var ds = d && d.nghiepVu && d.nghiepVu.phacDo
      ? (hs.nhom === 'coach' ? ['coach-dp','coach-ct','kn-pp'] : hs.nhom === 'tuVan' ? ['xu-ly-ca','tt-cskh','kn-tuvan'] : ['xu-ly-ca','coach-pt','kn-pp','kn-kho'])
      : (hs.nhom === 'tuVan' ? ['crm','tt-cskh','kn-tuvan'] : hs.nhom === 'phanTich' ? ['trung-tam-do','do-luong-he'] : ['kn-kho','thu-vien-v50']);
    var v = manDau(ds);
    return v ? { nhan:'Mở ' + tenMan(v), v:v } : null;
  };

  /* Vẽ một lượt gọn: chữ thường, không khung kho, không mã. */
  G.htVe = function(g){
    var o = '';
    if(g.mo) o += '<p class="ai-loi">' + esc(g.mo) + '</p>';
    if(g.chinh) o += '<p class="ai-loi">' + (g.html ? g.chinh : esc(g.chinh)) + '</p>';
    if(g.hoi) o += '<p class="kb-hoi">' + esc(g.hoi) + '</p>';
    /* g.chips vẫn là DỮ LIỆU (bộ thử đọc, chuỗi dùng để hiểu câu trả lời
       ngắn) nhưng không vẽ thành nút: chủ hệ 10/10/2026 bỏ câu gợi ý. */
    var ds = (g.nut || []).slice();
    if(g.baiDoc) ds.push({ nhan:'Bài đọc ngắn: ' + ngan(g.baiDoc.ten, 48), v:g.baiDoc.go });
    if(ds.length) o += '<div class="ht-nut">' + ds.map(function(n){
      return n.tel ? '<a class="btn sm" href="tel:' + esc(n.tel) + '">' + esc(n.nhan) + '</a>'
                   : '<button class="btn sm" data-v="' + esc(n.v) + '">' + esc(n.nhan) + '</button>';
    }).join('') + '</div>';
    return o;
  };
})();
