/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v7.5 — ĐỒNG BỘ APP ↔ WEB APP
   Máy giữ dữ liệu và chạy được khi mất mạng. Có mạng thì đẩy phần
   đã đổi lên máy chủ Admin và kéo phần mới về. Xung đột giải theo
   mốc thời gian TỪNG TRƯỜNG — hai máy sửa hai việc khác nhau thì
   giữ được cả hai.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

var KEY_MOC = 'gita365.moc';       // mốc sửa từng trường
var KEY_HANG = 'gita365.hangcho';  // hàng chờ khi mất mạng
/* Thêm thuvien và minhchung: src/thu-vien.js vẫn gọi G.danhDau cho hai nhóm
   này, nhưng chúng không nằm trong danh sách nên mốc bị bỏ ngay ở cửa — sổ
   thư viện và minh chứng nhiệm vụ nằm lại đúng một trình duyệt. Phụ huynh
   nộp minh chứng trên điện thoại, Coach mở máy mình thì không có gì. */
var NHOM = ['checks', 'journal', 'vision', 'test', 'mood', 'thuvien', 'minhchung', 'bando', 'chuyen', 'nhatky', 'baithi', 'thoigian', 'sathach', 'khoahoc', 'tgdoc'];

/* ─── Nhóm nào lấy dữ liệu ở đâu ───
   Trước đây gomThayDoi luôn đọc G.S[nhom]. Nhưng sổ thư viện nằm ở
   G.THUVIEN và sổ minh chứng nằm ở G.MINHCHUNG, nên hai nhóm ấy đánh dấu
   xong là dữ liệu rơi vào khoảng không: mốc có, dữ liệu không, và không ai
   nhìn thấy gì bất thường. Khai thẳng ra đây thì không đoán nữa. */
var NGUON = {
  thuvien:   {lay:function(){ return G.THUVIEN; },   dat:function(v){ if(Array.isArray(v)) G.THUVIEN = v; }},
  minhchung: {lay:function(){ return G.MINHCHUNG; }, dat:function(v){ if(Array.isArray(v)) G.MINHCHUNG = v; }},
  /* Dấu đã đọc của kho chuyện nằm ở G.CHUYEN_DOC, có kho localStorage riêng
     để đọc được ngay khi mở trang, trước cả lần đồng bộ đầu tiên. */
  tgdoc:     {lay:function(){ return G.TG_DOC; }, dat:function(v){
                if(v && typeof v === 'object'){
                  G.TG_DOC = v;
                  try{ localStorage.setItem('gita365_tg_da_doc', JSON.stringify(v)); }catch(e){}
                }}},
  chuyen:    {lay:function(){ return G.CHUYEN_DOC; }, dat:function(v){
                if(v && typeof v === 'object'){
                  G.CHUYEN_DOC = v;
                  try{ localStorage.setItem('gita365_chuyen_da_doc', JSON.stringify(v)); }catch(e){}
                }}}
};
function layNguon(nhom){ return NGUON[nhom] ? NGUON[nhom].lay() : G.S[nhom]; }
function datNguon(nhom, v){
  if(NGUON[nhom]) NGUON[nhom].dat(v);
  else G.S[nhom] = v;
}

G.DONGBO = { trangThai: 'chua', lanCuoi: null, choBaoNhieu: 0, loi: null };

/* ─── Mốc sửa từng trường ─── */
function docMoc(){ try{ return JSON.parse(localStorage.getItem(KEY_MOC) || '{}'); }catch(e){ return {}; } }
function ghiMoc(m){ try{ localStorage.setItem(KEY_MOC, JSON.stringify(m)); }catch(e){} }

/* Gọi mỗi khi người dùng sửa một thứ. Rẻ, chỉ ghi một con số. */
G.danhDau = function(nhom, khoa){
  if(NHOM.indexOf(nhom) < 0) return;
  var m = docMoc(); m[nhom + '.' + khoa] = Date.now(); ghiMoc(m);
  G.DONGBO.choBaoNhieu = demCho();
};

function demCho(){
  var m = docMoc(), lan = Number(localStorage.getItem(KEY_HANG) || 0), n = 0;
  Object.keys(m).forEach(function(k){ if(m[k] > lan) n++; });
  return n;
}

/* ─── Gom phần đã đổi kể từ lần đồng bộ cuối ─── */
function gomThayDoi(){
  var m = docMoc(), lan = Number(localStorage.getItem(KEY_HANG) || 0);
  var day = {}, mocDay = {};
  Object.keys(m).forEach(function(k){
    if(m[k] <= lan) return;
    var i = k.indexOf('.'), nhom = k.slice(0, i), khoa = k.slice(i + 1);
    if(NHOM.indexOf(nhom) < 0) return;
    var nguon = layNguon(nhom);
    /* Nhóm có thể là một giá trị đơn, không phải đối tượng — G.S.mood là
       một chuỗi. Trước đây nhánh này lặng lẽ bỏ qua, nên mốc đã ghi mà dữ
       liệu không bao giờ đi lên: không vào day, không vào mocDay, và cũng
       không vào danh sách bỏ qua để ai đó nhìn thấy. */
    if(nguon === undefined || nguon === null) return;
    if(typeof nguon !== 'object'){
      day[nhom] = nguon;
      mocDay[k] = m[k];
      return;
    }
    day[nhom] = (typeof day[nhom] === 'object' && day[nhom]) ? day[nhom] : {};
    day[nhom][khoa] = nguon[khoa];
    mocDay[k] = m[k];
  });
  return { day: day, mocDay: mocDay, so: Object.keys(mocDay).length };
}

/* ─── Nhận phần máy chủ trả về, ghi đè đúng những trường máy chủ mới hơn ─── */
function nhanVe(keo, mocChu){
  if(!keo) return 0;
  var m = docMoc(), doi = 0;
  NHOM.forEach(function(nhom){
    var v = keo[nhom];
    if(v === undefined || v === null) return;

    /* Nhóm là một giá trị đơn (G.S.mood là chuỗi) hoặc là một mảng
       (sổ thư viện, sổ minh chứng): nhận nguyên khối theo mốc của nhóm. */
    if(typeof v !== 'object' || Array.isArray(v)){
      var khoaN = nhom + '.' + (Array.isArray(v) ? 'so' : nhom);
      var tC = Number((mocChu || {})[khoaN] || 0), tM = Number(m[khoaN] || 0);
      if(tC > tM){ datNguon(nhom, v); m[khoaN] = tC; doi++; }
      return;
    }

    var hien = layNguon(nhom);
    if(!hien || typeof hien !== 'object'){ hien = {}; datNguon(nhom, hien); }
    var doiNhom = 0;
    Object.keys(v).forEach(function(k){
      var khoa = nhom + '.' + k;
      var tChu = Number((mocChu || {})[khoa] || 0), tMay = Number(m[khoa] || 0);
      if(tChu > tMay){ hien[k] = v[k]; m[khoa] = tChu; doi++; doiNhom++; }
    });
    /* Nhóm có kho riêng (không nằm trong G.S) phải được ghi xuống đĩa ngay:
       G.save() chỉ lưu G.S, nên nếu không gọi lại datNguon thì phần vừa kéo
       về chỉ sống trong bộ nhớ tới lúc đóng tab. */
    if(doiNhom && NGUON[nhom]) datNguon(nhom, hien);
  });
  ghiMoc(m);
  return doi;
}

/* ══════════ CÀI ĐẶT CỦA CHỦ HỆ THỐNG ══════════
   Bố cục thư mục, chữ hiển thị và bảng phân quyền không nằm trong G.S
   mà có kho riêng. Ba thứ này đồng bộ theo CẢ CỤM, ai sửa sau thì bản
   đó thắng — vì một bố cục chỉ có nghĩa khi trọn vẹn, không ghép nửa
   bản này với nửa bản kia. */
var CAI_DAT = {
  sapxep:   {kho:'gita365_sapxep',    lay:function(){ return G.SAP_XEP; },   dat:function(v){ G.SAP_XEP = v; }},
  noidung:  {kho:'gita365_sua_noidung',lay:function(){ return G.SUA_ND; },   dat:function(v){ G.SUA_ND = v; }},
  phanquyen:{kho:'gita365_phanquyen', lay:function(){ return G.PHANQUYEN; }, dat:function(v){ G.PHANQUYEN = v; }},
  /* Tư liệu Tư vấn và Coach đã gửi thêm cho từng nhà, cùng những lời xin
     đang chờ. Đi chung đường đồng bộ để nhà mình mở máy nào cũng thấy. */
  khothem:  {kho:'gita365_khach_them', lay:function(){ return G.KHACH_THEM; }, dat:function(v){ G.KHACH_THEM = v; }},
  xinthem:  {kho:'gita365_xin_them',   lay:function(){ return G.XIN_THEM; },   dat:function(v){ if(Array.isArray(v)) G.XIN_THEM = v; }},
  /* Hồ sơ ca xử lý. Đây là thứ phải truy được về sau, nên nó đi lên máy chủ
     chứ không nằm lại một máy. */
  ca:       {kho:'gita365_ca_xu_ly',   lay:function(){ return G.CA; },        dat:function(v){ if(Array.isArray(v)) G.CA = v; }},
  /* Mức dùng tài nguyên của đội ngũ. Phải đi lên máy chủ, nếu không thì
     Admin ngồi máy mình sẽ không bao giờ thấy cảnh báo của người khác. */
  tainguyen:{kho:'gita365_tai_nguyen', lay:function(){ return G.TAI_NGUYEN; }, dat:function(v){ if(v && typeof v==='object') G.TAI_NGUYEN = v; }}
};
var KEY_CD_MOC = 'gita365_caidat_moc';

function mocCaiDat(){
  try{ return JSON.parse(localStorage.getItem(KEY_CD_MOC) || '{}'); }catch(e){ return {}; }
}
function ghiMocCaiDat(m){
  try{ localStorage.setItem(KEY_CD_MOC, JSON.stringify(m)); }catch(e){}
}
/* Gọi mỗi khi chủ hệ thống sửa một trong ba thứ trên */
G.danhDauCaiDat = function(ten){
  if(!CAI_DAT[ten]) return;
  var m = mocCaiDat(); m[ten] = Date.now(); ghiMocCaiDat(m);
};
function goiCaiDat(){
  var m = mocCaiDat(), ra = {};
  Object.keys(CAI_DAT).forEach(function(k){
    if(m[k]) ra[k] = {luc: m[k], du: CAI_DAT[k].lay()};
  });
  return ra;
}
function nhanCaiDat(cd){
  if(!cd || typeof cd !== 'object') return 0;
  var m = mocCaiDat(), doi = 0;
  Object.keys(CAI_DAT).forEach(function(k){
    var v = cd[k];
    if(!v || typeof v !== 'object' || !v.du) return;
    if(Number(v.luc || 0) <= Number(m[k] || 0)) return;   /* bản mình mới hơn thì giữ */
    try{
      CAI_DAT[k].dat(v.du);
      localStorage.setItem(CAI_DAT[k].kho, JSON.stringify(v.du));
      m[k] = Number(v.luc); doi++;
    }catch(e){}
  });
  ghiMocCaiDat(m);
  return doi;
}

/* ─── Một vòng đồng bộ ─── */
G.dongBo = function(tuTay){
  if(!G.API_CAP_PHEP){
    G.DONGBO.trangThai = 'chua-noi';
    if(tuTay) G.U.toast('Chưa nối máy chủ nên chưa đồng bộ được. Xem docs/TRIEN_KHAI_WEB.md.','err');
    return Promise.resolve(false);
  }
  if(!G.S.acc){ return Promise.resolve(false); }
  if(!navigator.onLine){
    G.DONGBO.trangThai = 'mat-mang';
    if(tuTay) G.U.toast('Đang mất mạng. Dữ liệu vẫn ghi trong máy, có mạng lại là tự đẩy lên.','err');
    return Promise.resolve(false);
  }
  if(G.DONGBO.trangThai === 'dang') return Promise.resolve(false);

  var g = gomThayDoi();
  G.DONGBO.trangThai = 'dang';
  var batDau = Date.now();

  return fetch(G.API_CAP_PHEP, {
    method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'},
    body: JSON.stringify({ fn:'dongBo', u:G.S.acc.u, token:G.PHIEN_TOKEN||'',
      day:g.day, mocTruong:g.mocDay, caiDat:goiCaiDat(),
      may:navigator.userAgent.slice(0,120) })
  }).then(function(r){ return r.json(); })
    .then(function(d){
      if(!d || !d.ok) throw new Error(d && d.error || 'Máy chủ từ chối');
      var ve = nhanVe(d.keo, d.mocTruong) + nhanCaiDat(d.caiDat);
      /* Phần kéo về nằm trong G.S. Không ghi xuống đĩa ngay thì đóng tab
         trước lần lưu kế tiếp là mất — đúng thứ vừa kéo về. */
      if(ve && G.save) G.save();
      try{ localStorage.setItem(KEY_HANG, String(batDau)); }catch(e){}
      G.DONGBO.trangThai = 'xong';
      G.DONGBO.lanCuoi = new Date();
      G.DONGBO.choBaoNhieu = demCho();
      G.DONGBO.loi = null;
      if(G.secLog) G.secLog('Đồng bộ', 'Đẩy ' + g.so + ' thay đổi, nhận về ' + ve, 'Ghi nhận');
      if(tuTay) G.U.toast('Đã đồng bộ. Đẩy lên ' + g.so + ' thay đổi, nhận về ' + ve + '.','ok');
      if(ve && G.render) G.render();
      return true;
    })
    .catch(function(e){
      G.DONGBO.trangThai = 'loi';
      G.DONGBO.loi = e.message;
      if(tuTay) G.U.toast('Đồng bộ hỏng: ' + e.message + '. Dữ liệu vẫn nguyên trong máy.','err');
      return false;
    });
};

/* ─── Tự chạy: khi mở, khi có mạng lại, và mỗi sáu giờ ─── */
G.batDongBo = function(){
  if(!G.API_CAP_PHEP) return;
  setTimeout(function(){ G.dongBo(); }, 4000);
  window.addEventListener('online', function(){
    G.U.toast('Có mạng trở lại — đang đồng bộ phần đã ghi khi ngoại tuyến.','ok');
    G.dongBo();
  });
  window.addEventListener('offline', function(){
    G.DONGBO.trangThai = 'mat-mang';
    G.U.toast('Mất mạng. Ứng dụng vẫn chạy bình thường, dữ liệu ghi trong máy.','err');
  });
  setInterval(function(){ G.dongBo(); }, 6 * 3600 * 1000);
  /* Rời trang thì cố đẩy nốt phần còn lại */
  window.addEventListener('pagehide', function(){
    var g = gomThayDoi();
    if(!g.so || !navigator.onLine || !G.API_CAP_PHEP || !G.S.acc) return;
    try{
      navigator.sendBeacon(G.API_CAP_PHEP, new Blob([JSON.stringify({
        fn:'dongBo', u:G.S.acc.u, token:G.PHIEN_TOKEN||'',
        day:g.day, mocTruong:g.mocDay, may:'pagehide'
      })], {type:'text/plain;charset=utf-8'}));
    }catch(e){}
  });
};

/* ─── Kiểm bản mới của ứng dụng ─── */
G.kiemBanMoi = function(){
  if(!G.API_CAP_PHEP || !navigator.onLine) return Promise.resolve(null);
  return fetch(G.API_CAP_PHEP, {
    method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'},
    body: JSON.stringify({ fn:'kiemBanMoi', banApp:(G.META && G.META.version) || '' })
  }).then(function(r){ return r.json(); })
    .then(function(d){
      if(!d || !d.ok || !d.banMoiNhat) return null;
      if(d.banMoiNhat !== ((G.META && G.META.version) || '')) {
        G.BAN_MOI = d;
        G.U.toast('Có bản mới ' + d.banMoiNhat + '. Mở mục Kết nối hệ sinh thái để tải.','ok');
      }
      return d;
    })
    .catch(function(){ return null; });
};
