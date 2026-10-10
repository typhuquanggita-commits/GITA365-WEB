/* ═══════════════════════════════════════════════════════════════
   GITA 365 — KHO NGÔI NHÀ THỊNH VƯỢNG (màn kho-nha · cam-nang-nha)

   Hai màn, một máy chủ (may-chu/kho-nhiem-vu.js):
   · kho-nha — nhân sự: 21 ô bản đồ, mỗi ô một cuốn cẩm nang ba cấp soạn
     (cấp 1 khách · cấp 2 tư vấn · cấp 3 kho Coach) và các nhiệm vụ của ô.
     Trao cẩm nang cấp 1 cho nhà, giao phiếu nhiệm vụ, nghiệm thu.
   · cam-nang-nha — gia đình: đúng những gì người phụ trách đã TRAO.

   Màn này KHÔNG chứa một chữ nội dung nào: cẩm nang và nhiệm vụ nằm ở máy
   chủ, cấp nào trả về do cổng máy chủ quyết theo vai. Màn chỉ vẽ cái máy
   chủ trả. Một cấp màn không vẽ được không có nghĩa là có mà bị ẩn — máy
   chủ đã không gửi xuống.
   ═══════════════════════════════════════════════════════════════ */
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic;
  var st = {};
  function datLai(ai){ st = { ai:ai, o:'', cap:1, cn:null, ds:null, nv:null, nvMa:'', moNV:null, phieu:null, cuaNha:null, tai:{}, loi:{}, nap:null }; }
  function giuDung(){ var ai = (G.S && G.S.acc && G.S.acc.u) || ''; if(st.ai !== ai) datLai(ai); }
  function coMayChu(){ return typeof G.goiMayChu === 'function' && !!G.API_CAP_PHEP && !!G.PHIEN_TOKEN; }
  function veLai(){ if(G.render) G.render(); }
  function gt(id){ var e = document.getElementById(id); return e ? String(e.value || '').trim() : ''; }
  function doc(k, fn, than, xong){
    if(!coMayChu() || st.tai[k]) return;
    st.tai[k] = true; delete st.loi[k];
    var cua = st;
    G.goiMayChu(fn, than || {}, { moi:true }).then(function(r){
      if(cua !== st) return;
      st.tai[k] = false;
      if(r && r.ok) xong(r); else st.loi[k] = (r && r.error) || 'Không đọc được.';
      veLai();
    });
  }
  function ghi(fn, than, ok, sau){
    G.goiMayChu(fn, than).then(function(r){
      if(r && r.ok){ U.toast(ok(r), 'ok'); if(sau) sau(r); veLai(); }
      else U.toast((r && r.error) || 'Không ghi được.', 'err');
    });
  }
  function cb(chu, m){ return '<div class="co-cb mb"><div style="--m:' + (m || 'var(--gita-do-ink)') + '">' + ic('alert','w-4 h-4') + '<span>' + chu + '</span></div></div>'; }

  /* Nhãn đọc được cho từng ô dữ liệu của cẩm nang và nhiệm vụ. Ô không có
     nhãn thì hiện đúng tên khoá — thà xấu còn hơn giấu mất một phần. */
  var NHAN = {
    loiMo:'Lời mở', viSao:'Vì sao', buocDauTien:'Bước đầu tiên tối nay', baViec:'Ba việc', viec:'Việc', cachLam:'Cách làm', dauHieu:'Dấu hiệu',
    phieu7:'Phiếu 7 ngày', cauHoiNha:'Câu hỏi cả nhà', dauHieuTienBo:'Dấu hiệu tiến bộ', dungLam:'Điều nên tránh', khiNaoHoi:'Khi nào nhắn người đồng hành',
    mucTieuNghiepVu:'Mục tiêu nghiệp vụ', chanDoan:'Chẩn đoán', cauHoi:'Câu hỏi', ngheGi:'Nghe ra điều gì', kichBanBuoi:'Kịch bản một buổi',
    mo:'Mở', khai:'Khai', thongNhat:'Thống nhất', chot:'Chốt', bieuMau:'Biểu mẫu', ten:'Tên', dung:'Dùng khi', truong:'Các ô',
    loTrinh:'Lộ trình', n7:'7 ngày', n21:'21 ngày', n90:'90 ngày', caNhanHoa:'Cá nhân hoá theo tầng', phanDoi:'Phản đối thường gặp', cau:'Câu', dap:'Cách đáp',
    nguyenLy2080:'Nguyên lý 20/80', chuanDat:'Chuẩn đạt', khiChuyenCoach:'Khi chuyển Coach',
    lyThuyet:'Lý thuyết', nguyenLy:'Nguyên lý', nenTang:'Nền tảng', nguon:'Nguồn', chuoi5:'Chuỗi chữa lành – gắn kết – khai mở – định hướng – nâng tầm',
    chuaLanh:'1 · Chữa lành', ganKet:'2 · Gắn kết', khaiMo:'3 · Khai mở', dinhHuong:'4 · Định hướng', nangTam:'5 · Nâng tầm',
    mucDich:'Mục đích', dauHieuVao:'Dấu hiệu bắt đầu', thucHanh:'Thực hành từng bước', cauHoiKhaiVan:'Câu hỏi khai vấn', chuanRa:'Chuẩn ra', bay:'Bẫy hay mắc', voiNhanSu:'Áp cho nhân sự',
    trienKhai:'Từng bước triển khai', loTrinh90:'Lộ trình 90 ngày', tuan:'Theo tuần', tuDuyKhacBiet:'Tư duy khác biệt', thuongNghi:'Thường nghĩ', gitaNghi:'GITA nghĩ',
    hai:'20% việc quyết định', tamMuoi:'80% kết quả', boQua:'Có thể để sau', moThucGITA:'Mô thức huấn luyện GITA', c437:'Công thức 4-3-7',
    caMau:'Ca mẫu', boiCanh:'Bối cảnh', diBuoc:'Đi từng bước', ketQua:'Kết quả', baiHoc:'Bài học', saoChuyenGia:'Năm sao chuyên gia', kyNang:'Kỹ năng', hanhVi:'Hành vi', chuaDat:'Chưa đạt', anToan:'An toàn',
    tenViec:'Tên việc', noiDungViec:'Nội dung việc', thuocTinh:'Thuộc tính', doiTuong:'Đối tượng', thoiLuong:'Thời lượng', phamVi:'Phạm vi', vatLieu:'Vật liệu', dauRa:'Đầu ra', phanLoai:'Phân loại',
    gita:'G · I · T · A', yeuTo:'Bốn yếu tố', giaiDoan:'Ba giai đoạn', du:'Đủ', deu:'Đều', buoc:'Bảy bước', hanhDong:'Hành động', phanVai:'Phân vai', vai:'Vai', phanViec:'Phần việc',
    lich7:'Lịch 7 ngày', hoatDong:'Hoạt động', baMuc:'Ba mức', toiThieu:'Tối thiểu', tieuChuan:'Tiêu chuẩn', moRong:'Mở rộng', phucHoi:'Phục hồi khi bỏ lỡ',
    phanHoi:'Phản hồi có chiều sâu', cauHoiChuyenGia:'Câu hỏi chuyên gia', video:'Video phản tư', baiHocGiaTri:'Bài học giá trị', giaTri:'Giá trị', traiNghiem:'Trải nghiệm',
    kyThuat:'Kỹ thuật', toChuc:'Tổ chức', quanHe:'Quan hệ và bằng chứng', moc:'Mốc 7 · 21 · 90', chiSo:'Chỉ số', ddd:'Đúng · Đủ · Đều',
    cap:'Mười cấp', nangLuc:'Năng lực', mucTieu:'Mục tiêu', nhiemVu:'Nhiệm vụ và phân vai', huongDan:'Cầm tay chỉ việc', gocTuDuy:'Góc tư duy', cauDaoSau:'Câu đào sâu',
    ungDung:'Ứng dụng', bangChung:'Bằng chứng', hoTro:'Coach hỗ trợ', cuaLenCap:'Cửa lên cấp', credit:'Credit nghiệp vụ', chang:'Bốn chặng giao', phanGiao:'Phần giao', dieuKien:'Điều kiện chuyển chặng',
    khoiTao:'Khởi tạo', thucHanh7:'Thực hành 7 ngày', duyTri21:'Duy trì 21 ngày', lamChu90:'Làm chủ 90 ngày', canhBao:'Cảnh báo', G:'Goal', I:'Inspirits', T:'Talent', A:'Academy & Action',
    T1:'Tầng 1', T2:'Tầng 2', T3:'Tầng 3', T4:'Tầng 4', T5:'Tầng 5', maGoc:'Mã gốc hồ sơ', gocTuDuyChung:'Mười góc tư duy', doiThoaiMau:'Đối thoại mẫu',
    phanLoaiNangLuc:'Phân loại năng lực và xếp cấp', nghiemThu:'Quy tắc nghiệm thu', tang:'Tầng', doiTuong2:'Đối tượng'
  };
  var BO_QUA = { id:1, so:1 };
  function ve(v, sau){
    sau = sau || 0;
    if(v == null) return '';
    if(typeof v === 'string' || typeof v === 'number') return '<span>' + h(String(v)) + '</span>';
    if(Array.isArray(v)){
      if(v.every(function(x){ return typeof x === 'string'; })) return '<ol class="kn-ds">' + v.map(function(x){ return '<li>' + h(x) + '</li>'; }).join('') + '</ol>';
      return v.map(function(x, i){ return '<div class="kn-khoi">' + (x && x.so ? '<b class="kn-so">' + h(String(x.so)) + '</b>' : '<b class="kn-so">' + (i + 1) + '</b>') + ve(x, sau + 1) + '</div>'; }).join('');
    }
    return Object.keys(v).filter(function(k){ return !BO_QUA[k]; }).map(function(k){
      var con = v[k], nhan = NHAN[k] || k;
      if(con && typeof con === 'object' && sau < 2 && JSON.stringify(con).length > 600)
        return '<details class="kn-mo"' + (sau === 0 ? ' open' : '') + '><summary>' + h(nhan) + '</summary>' + ve(con, sau + 1) + '</details>';
      return '<div class="kn-o"><b>' + h(nhan) + '</b>' + ve(con, sau + 1) + '</div>';
    }).join('');
  }

  /* ── Super Admin nạp gói ── */
  function b64(s){ var b = atob(s), a = new Uint8Array(b.length); for(var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
  function moGoi(matKhau){
    return fetch('kho-nha/goi.enc', { cache:'no-store' }).then(function(r){
      if(!r.ok) throw new Error('Chưa có gói kho Ngôi nhà (mã ' + r.status + ').');
      return r.json();
    }).then(function(g){
      var enc = new TextEncoder();
      return crypto.subtle.importKey('raw', enc.encode(matKhau), 'PBKDF2', false, ['deriveKey']).then(function(k){
        return crypto.subtle.deriveKey({ name:'PBKDF2', salt:b64(g.salt), iterations:g.n, hash:'SHA-256' }, k, { name:'AES-GCM', length:256 }, false, ['decrypt']);
      }).then(function(key){ return crypto.subtle.decrypt({ name:'AES-GCM', iv:b64(g.iv) }, key, b64(g.ct)); })
        .catch(function(){ throw new Error('Sai mật khẩu gói, hoặc gói đã bị sửa.'); })
        .then(function(nen){ return new Response(new Blob([nen]).stream().pipeThrough(new DecompressionStream('gzip'))).text(); })
        .then(function(t){ return { ban:g.ban, ds:JSON.parse(t) }; });
    });
  }
  function napGoi(mk){
    st.nap = { dang:true, xong:0, tong:0, loi:'' }; veLai();
    moGoi(mk).then(function(goi){
      var cn = goi.ds.cn || [], nv = goi.ds.nv || [], lo = [], i;
      for(i = 0; i < cn.length; i += 3) lo.push(['napCamNang', cn.slice(i, i + 3)]);
      for(i = 0; i < nv.length; i += 20) lo.push(['napKhoNhiemVu', nv.slice(i, i + 20)]);
      st.nap.tong = cn.length + nv.length;
      function chay(k){
        if(k >= lo.length){ st.nap.dang = false; st.cn = null; st.ds = null; U.toast('Đã nạp ' + cn.length + ' cẩm nang và ' + nv.length + ' nhiệm vụ.', 'ok'); return veLai(); }
        return G.goiMayChu(lo[k][0], { ds:lo[k][1], ban:goi.ban }).then(function(r){
          if(!(r && r.ok)) throw new Error(((r && r.error) || 'Máy chủ từ chối lô.') + (r && r.hong ? ' ' + r.hong.slice(0, 2).join(' · ') : ''));
          st.nap.xong += lo[k][1].length; veLai(); return chay(k + 1);
        });
      }
      return chay(0);
    }).catch(function(e){ st.nap.dang = false; st.nap.loi = String(e && e.message || e); veLai(); });
  }
  function veNap(){
    if(G.S.role !== 'R01') return '';
    var n = st.nap;
    return '<details class="card pad-sm mb"' + (n && (n.dang || n.loi) ? ' open' : '') + '><summary class="sm" style="cursor:pointer">' + ic('lock','w-3 h-3') +
      ' Super Admin · nạp kho Ngôi nhà từ gói mã hoá</summary><div class="mt" style="display:grid;gap:8px">' +
      '<p class="tiny muted">Mật khẩu nằm trong Google Drive của chủ hệ (tài liệu “GITA365 — Mật khẩu gói Kho Ngôi nhà”). Máy này tự mở gói; mật khẩu không gửi lên máy chủ.</p>' +
      '<input id="knMk" class="inp" type="password" autocomplete="off" aria-label="Mật khẩu gói kho Ngôi nhà" placeholder="Mật khẩu gói">' +
      '<div><button class="btn sm pri" data-kn="nap"' + (n && n.dang ? ' disabled' : '') + '>' + ic('check','w-3 h-3') + (n && n.dang ? 'Đang nạp ' + n.xong + ' / ' + (n.tong || '…') : 'Mở gói và nạp') + '</button></div>' +
      (n && n.loi ? '<p class="tiny" style="color:var(--gita-do-ink)">' + h(n.loi) + '</p>' : '') + '</div></details>';
  }

  /* ── màn nhân sự ── */
  var TEN_CAP = { 1:'Cấp 1 · Khách hàng', 2:'Cấp 2 · Tư vấn', 3:'Cấp 3 · Chuyên gia Coach' };
  G.VIEWS['kho-nha'] = function(){
    giuDung();
    var o = U.ph({ eyebrow:'KHO COACH', ic:'home', t:'Kho Ngôi nhà thịnh vượng',
      lead:'21 ô của bản đồ — mái Tầm nhìn, tám phòng, cửa Hành động, nền móng và mười bánh đà. Mỗi ô một cuốn cẩm nang ba cấp soạn và các nhiệm vụ thực hành của ô ấy.' });
    if(!coMayChu()) return o + cb('Kho Ngôi nhà nằm ở máy chủ của Học viện. Đăng nhập bằng tài khoản nhân sự thật để đọc.', 'var(--gita)');
    o += veNap();
    o += nganNghiemThu();
    if(!st.cn){ doc('cn', 'dsCamNang', {}, function(r){ st.cn = r; }); return o + (st.loi.cn ? cb(h(st.loi.cn)) : '<p class="sm muted">Đang đọc mục lục…</p>'); }
    var C = st.cn;
    o += '<p class="sm muted mb">Vai của bạn mở: ' + C.capMo.map(function(n){ return h(TEN_CAP[n]); }).join(' · ') + '. Cấp 1 là phần trao được cho gia đình; cấp 2 và cấp 3 không rời kho nghề.</p>';
    o += '<div class="kn-luoi">' + C.ds.map(function(x){
      return '<button class="kn-the' + (st.o === x.o ? ' on' : '') + (x.daNap ? '' : ' chua') + '" data-kn="o" data-o="' + h(x.o) + '"><b>' + h(x.ten) + '</b><span class="tiny muted">' + h(x.vi) + (x.daNap ? '' : ' · chưa nạp') + '</span></button>';
    }).join('') + '</div>';
    if(!st.o) return o;
    var cur = C.ds.filter(function(x){ return x.o === st.o; })[0];
    o += U.sec(cur.ten + ' — ' + cur.vi);
    o += '<div class="row wrap mb" style="gap:6px">' + C.capMo.map(function(n){
      return '<button class="btn sm' + (st.cap === n ? ' pri' : '') + '" data-kn="cap" data-cap="' + n + '">' + h(TEN_CAP[n]) + '</button>';
    }).join('') + '<button class="btn sm' + (st.cap === 'nv' ? ' pri' : '') + '" data-kn="cap" data-cap="nv">Nhiệm vụ của ô</button></div>';
    if(st.cap === 'nv') return o + nganNV();
    var k = st.o + ':' + st.cap;
    if(!st.doc || st.doc.k !== k){
      if(!cur.daNap) return o + '<p class="sm muted">Cẩm nang ô này chưa nạp vào máy chủ.</p>';
      doc('doc', 'docCamNang', { ma:'CN-' + st.o, cap:st.cap }, function(r){ st.doc = { k:k, nd:r.noiDung }; });
      return o + (st.loi.doc ? cb(h(st.loi.doc)) : '<p class="sm muted">Đang mở cẩm nang…</p>');
    }
    if(st.cap === 1) o += '<div class="co-form mb"><label class="co-f" for="kn-nha"><span>Trao cấp 1 cho nhà (mã nhà)</span><input class="inp" id="kn-nha" autocomplete="off"></label>' +
      '<div class="co-f"><span>&nbsp;</span><button class="btn sm pri" data-kn="trao">Trao cẩm nang</button></div></div>';
    return o + '<div class="kn-sach">' + ve(st.doc.nd) + '</div>';
  };
  function nganNV(){
    var o = '';
    if(!st.ds || st.ds.o !== st.o){ doc('ds', 'dsKhoNhiemVu', { o:st.o }, function(r){ r.o = st.o; st.ds = r; }); return st.loi.ds ? cb(h(st.loi.ds)) : '<p class="sm muted">Đang đọc nhiệm vụ…</p>'; }
    var q = st.ds.quyen;
    o += '<p class="sm muted mb">' + h(q.ten) + (q.toanKho ? ' · đọc toàn kho' : ' · trần ' + q.pct + '% kho = ' + q.tran + ' nhiệm vụ, đã gán ' + q.daGan) + ' · đọc tới cấp ' + q.capToi + '.</p>';
    if(!st.ds.ds.length) return o + '<p class="sm muted">Ô này chưa có nhiệm vụ nào trong kho.</p>';
    o += '<div class="tcc-bang" role="region" aria-label="Nhiệm vụ của ô" tabindex="0"><table class="tbl sm"><tr><th>Mã</th><th>Nhiệm vụ</th><th>Cho</th><th>Tầng</th><th></th></tr>' +
      st.ds.ds.map(function(x){
        return '<tr><td class="mono">' + h(x.ma) + '</td><td>' + h(x.ten) + (x.traiNghiem ? ' <span class="tiny muted">· trải nghiệm T1–T2</span>' : '') + '</td><td>' + (x.doiTuong === 'nha' ? 'Gia đình' : 'Nhân sự') + '</td><td>' + (x.tang ? 'T' + x.tang : '—') + '</td><td>' +
          (x.khoa ? '<span class="tiny muted">' + ic('lock','w-3 h-3') + ' chưa gán</span>' : '<button class="btn ghost sm" data-kn="nv" data-ma="' + h(x.ma) + '">Mở</button>') + '</td></tr>';
      }).join('') + '</table></div>';
    if(st.nvMa){
      if(!st.nv || st.nv.ma !== st.nvMa){ doc('nv', 'docNhiemVu', { ma:st.nvMa }, function(r){ st.nv = { ma:st.nvMa, nv:r.nv, capToi:r.capToi }; }); o += st.loi.nv ? cb(h(st.loi.nv)) : '<p class="sm muted">Đang mở hồ sơ…</p>'; }
      else {
        var nv = st.nv.nv;
        o += U.sec(nv.id + ' · ' + nv.ten);
        o += '<div class="co-form mb">' + (nv.doiTuong === 'nha' ? '<label class="co-f" for="kn-g-dt"><span>Mã nhà nhận</span><input class="inp" id="kn-g-dt" autocomplete="off"></label>'
            : '<label class="co-f" for="kn-g-dt"><span>Nhân sự nhận (tên đăng nhập)</span><input class="inp" id="kn-g-dt" autocomplete="off"></label>') +
          '<label class="co-f" for="kn-g-cap"><span>Cấp</span><select class="inp" id="kn-g-cap">' + [1,2,3,4,5,6,7,8,9,10].filter(function(n){ return n <= st.nv.capToi; }).map(function(n){ return '<option value="' + n + '">Cấp ' + n + '</option>'; }).join('') + '</select></label>' +
          '<label class="co-f" for="kn-g-ch"><span>Chặng</span><select class="inp" id="kn-g-ch"><option value="khoiTao">Khởi tạo</option><option value="thucHanh7">Thực hành 7 ngày</option><option value="duyTri21">Duy trì 21 ngày</option><option value="lamChu90">Làm chủ 90 ngày</option></select></label>' +
          '<label class="co-f" for="kn-g-pl"><span>Phân loại ban đầu (khi bắt đầu trên cấp 1)</span><textarea class="inp" id="kn-g-pl" rows="2"></textarea></label>' +
          '<div class="co-f"><span>&nbsp;</span><button class="btn sm pri" data-kn="giao">Giao phiếu</button></div></div>';
        o += '<div class="kn-sach">' + ve(nv) + '</div>';
      }
    }
    return o;
  }

  /* Nghiệm thu: người phụ trách mở phiếu của một nhà, đọc bằng chứng đã
     gửi, ghi đạt / cần bổ sung / làm lại kèm một câu. Máy chủ quyết ai được
     ghi và chỉ cộng credit nghiệp vụ một lần. */
  function nganNghiemThu(){
    var o = '<details class="card pad-sm mb"' + (st.ntNha ? ' open' : '') + '><summary class="sm" style="cursor:pointer">' + ic('check','w-3 h-3') + ' Nghiệm thu phiếu của một nhà</summary><div class="mt">' +
      '<div class="co-form mb"><label class="co-f" for="kn-nt-nha"><span>Mã nhà</span><input class="inp" id="kn-nt-nha" autocomplete="off" value="' + h(st.ntNha || '') + '"></label>' +
      '<div class="co-f"><span>&nbsp;</span><button class="btn sm" data-kn="ntmo">Mở phiếu</button></div></div>';
    if(st.ntNha){
      if(!st.ntDs || st.ntDs.nha !== st.ntNha){ doc('nt', 'phieuCuaToi', { maNha:st.ntNha }, function(r){ r.nha = st.ntNha; st.ntDs = r; }); o += st.loi.nt ? cb(h(st.loi.nt)) : '<p class="sm muted">Đang đọc…</p>'; }
      else if(!st.ntDs.ds.length) o += '<p class="sm muted">Nhà này chưa có phiếu nào.</p>';
      else o += st.ntDs.ds.map(function(x){
        var nt = x.nghiemThu;
        return '<div class="card pad-sm mb"><b>' + h(x.phieu.ten) + '</b> · cấp ' + x.cap + ' · ' + h(x.phieu.tenChang) + ' · ' + x.soNop + ' lần gửi' +
          (nt ? '<p class="sm">Đã ghi: <b>' + h(nt.ketQua) + '</b> — ' + h(nt.ghiChu) + '</p>' : '') +
          (nt && nt.ketQua === 'dat' ? '' : '<label class="co-f mt" for="kn-nt-' + h(x.id) + '"><span>Ghi chú nghiệm thu (tiêu chí đạt, còn thiếu, ngày kiểm lại)</span><textarea class="inp" id="kn-nt-' + h(x.id) + '" rows="2"></textarea></label>' +
            '<div class="co-hang mt"><button class="btn sm pri" data-kn="nt" data-kq="dat" data-id="' + h(x.id) + '">Đạt</button>' +
            '<button class="btn sm" data-kn="nt" data-kq="boSung" data-id="' + h(x.id) + '">Cần bổ sung</button>' +
            '<button class="btn sm ghost" data-kn="nt" data-kq="lamLai" data-id="' + h(x.id) + '">Làm lại</button></div>') + '</div>';
      }).join('');
    }
    return o + '</div></details>';
  }

  /* ── màn gia đình ── */
  G.VIEWS['cam-nang-nha'] = function(){
    giuDung();
    var o = U.ph({ eyebrow:'NGÔI NHÀ CỦA MÌNH', ic:'home', t:'Cẩm nang & nhiệm vụ của nhà mình',
      lead:'Những phần người đồng hành đã trao cho nhà mình: cẩm nang thực hành từng ô của ngôi nhà, và phiếu nhiệm vụ đang làm. Làm xong thì ghi lại vài dòng — ảnh và video giữ tại nhà.' });
    if(!coMayChu()) return o + cb('Cẩm nang và phiếu nhiệm vụ nằm ở máy chủ của Học viện. Đăng nhập bằng tài khoản gia đình thật để xem phần đã được trao.', 'var(--gita)');
    if(!st.cuaNha){ doc('cn2', 'camNangCuaNha', {}, function(r){ st.cuaNha = r; }); }
    if(!st.phieu){ doc('ph', 'phieuCuaToi', {}, function(r){ st.phieu = r; }); }
    if(!st.cuaNha || !st.phieu) return o + (st.loi.cn2 || st.loi.ph ? cb(h(st.loi.cn2 || st.loi.ph)) : '<p class="sm muted">Đang đọc…</p>');
    var P = st.phieu;
    if(P.tranTraiNghiem) o += cb('Nhà mình đang ở tầng ' + P.tang + ': nhận tối đa ' + P.tranTraiNghiem + ' nhiệm vụ trải nghiệm, mỗi nhiệm vụ tới cấp 2. Cẩm nang đầy đủ mười cấp mở từ tầng 3.', 'var(--gita)');
    o += U.sec('Phiếu nhiệm vụ');
    if(!P.ds.length) o += '<p class="sm muted mb">Chưa có phiếu nào. Người đồng hành sẽ giao phiếu đầu tiên sau buổi trò chuyện.</p>';
    o += P.ds.map(function(x){
      var p = x.phieu, nt = x.nghiemThu;
      var tt = nt ? (nt.ketQua === 'dat' ? 'Đã đạt' : nt.ketQua === 'boSung' ? 'Cần bổ sung' : 'Làm lại') : (x.soNop ? 'Đã gửi, chờ xem' : 'Đang làm');
      return '<details class="card pad-sm mb"><summary><b>' + h(p.ten) + '</b> · cấp ' + x.cap + ' · ' + h(p.tenChang) + ' · <span class="tiny">' + h(tt) + '</span></summary>' +
        (nt ? '<p class="sm mt"><b>Nhận xét:</b> ' + h(nt.ghiChu) + '</p>' : '') +
        '<div class="kn-sach mt">' + ve({ tenViec:p.tenViec, mucTieu:p.mucTieu, phanGiao:p.phanGiao, huongDan:p.huongDan, gocTuDuy:p.gocTuDuy, cauDaoSau:p.cauDaoSau,
          baMuc:p.baMuc, chuanDat:p.chuanDat, bangChung:p.bangChung, lich7:p.lich7, phucHoi:p.phucHoi, baiHoc:p.baiHoc, ungDung:p.ungDung, anToan:p.anToan, canhBao:p.canhBao }) + '</div>' +
        (nt && nt.ketQua === 'dat' ? '' : '<label class="co-f mt" for="kn-nop-' + h(x.id) + '"><span>Nhà mình đã làm gì (số đo, một khó khăn, cách sửa)</span><textarea class="inp" id="kn-nop-' + h(x.id) + '" rows="3"></textarea></label>' +
          '<div class="co-hang mt"><button class="btn sm pri" data-kn="nop" data-id="' + h(x.id) + '">Gửi cho người đồng hành</button></div>') + '</details>';
    }).join('');
    o += U.sec('Cẩm nang đã được trao');
    if(!st.cuaNha.ds.length) o += '<p class="sm muted">Chưa có cẩm nang nào được trao.</p>';
    o += st.cuaNha.ds.map(function(x){ return '<details class="card pad-sm mb"><summary><b>' + h(x.ten) + '</b></summary><div class="kn-sach mt">' + ve(x.cap1) + '</div></details>'; }).join('');
    return o;
  };

  document.addEventListener('click', function(e){
    var el = e.target.closest && e.target.closest('[data-kn]'); if(!el) return;
    giuDung();
    var a = el.getAttribute('data-kn');
    if(a === 'o'){ st.o = el.getAttribute('data-o'); st.cap = (st.cn && st.cn.capMo[0]) || 1; st.doc = null; st.nvMa = ''; return veLai(); }
    if(a === 'cap'){ var c = el.getAttribute('data-cap'); st.cap = c === 'nv' ? 'nv' : Number(c); st.doc = null; return veLai(); }
    if(a === 'nv'){ st.nvMa = el.getAttribute('data-ma'); st.nv = null; return veLai(); }
    if(a === 'nap'){ var mk = gt('knMk'); if(mk.length < 16) return U.toast('Nhập mật khẩu gói.', 'err'); return napGoi(mk); }
    if(a === 'trao') return ghi('giaoCamNang', { ma:'CN-' + st.o, maNha:gt('kn-nha') }, function(){ return 'Đã trao cẩm nang cho nhà.'; });
    if(a === 'giao'){
      var nv = st.nv && st.nv.nv; if(!nv) return;
      var than = { ma:nv.id, cap:Number(gt('kn-g-cap')), chang:gt('kn-g-ch'), phanLoai:gt('kn-g-pl') };
      if(nv.doiTuong === 'nha') than.maNha = gt('kn-g-dt'); else than.maNguoi = gt('kn-g-dt');
      return ghi('giaoPhieuNhiemVu', than, function(r){ return 'Đã giao cấp ' + r.cap + '.'; });
    }
    if(a === 'ntmo'){ st.ntNha = gt('kn-nt-nha'); st.ntDs = null; return veLai(); }
    if(a === 'nt'){ var pid = el.getAttribute('data-id'); return ghi('nghiemThuNhiemVu', { phieu:pid, ketQua:el.getAttribute('data-kq'), ghiChu:gt('kn-nt-' + pid) },
      function(r){ return r.ketQua === 'dat' ? 'Đã nghiệm thu đạt · +' + r.credit + ' credit nghiệp vụ.' : 'Đã ghi nghiệm thu.'; }, function(){ st.ntDs = null; }); }
    if(a === 'nop'){ var id = el.getAttribute('data-id'); return ghi('nopNhiemVu', { phieu:id, noiDung:gt('kn-nop-' + id) }, function(){ return 'Đã gửi cho người đồng hành.'; }, function(){ st.phieu = null; }); }
  });
})();
