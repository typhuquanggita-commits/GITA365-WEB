/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v8.9 — ĐỒNG HỒ THẬT · CHUẨN HOÀN THÀNH · THƯỞNG PHẠT

   Đồng hồ chỉ chạy khi cửa sổ đang hiển thị VÀ có thao tác trong vòng 90
   giây gần nhất. Ngoài hai điều đó thì dừng. Con số vì thế thấp hơn thời
   gian người ta thật sự ngồi trước máy — và như vậy là đúng: thà đếm
   thiếu còn hơn tính công cho một tab đang bỏ quên.

   Dữ liệu nằm trong hồ sơ riêng của tài khoản (G.S.thoigian) và đi lên
   máy chủ theo đường đồng bộ TỪNG TRƯỜNG khoá theo uid.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var U = G.U, h = U.h, ic = U.ic;
G.VIEWS = G.VIEWS || {};

/* ─── Kho riêng ─── */
function tg(){
  if(!G.S) return {};
  if(!G.S.thoigian || typeof G.S.thoigian !== 'object') G.S.thoigian = {};
  return G.S.thoigian;
}
function ghi(k, v){
  /* Không có ai đang đăng nhập thì không ghi gì.
     Đây không phải một điều kiện thừa: đồng hồ có chốt ở beforeunload, và
     chốt thì gọi G.save(). Nếu ai đó xoá kho trình duyệt rồi tải lại trang,
     lần chốt cuối cùng sẽ ghi lại phiên vừa xoá — và người dùng quay vào
     thấy mình vẫn đang đăng nhập, đúng thứ họ vừa cố xoá đi. */
  if(!G.S || !G.S.acc) return;
  /* Và: kho trình duyệt phải còn phiên. Nếu ai đó vừa xoá kho ở tab khác
     hoặc đang tải lại sau khi xoá, thì lần chốt cuối cùng này sẽ dựng lại
     đúng phiên vừa bị xoá — người dùng quay vào thấy mình vẫn đang đăng
     nhập, đúng thứ họ vừa cố xoá đi. Thà mất hai mươi giây đo được. */
  try{ if(!localStorage.getItem('gita365.v7')) return; }catch(e){ return; }
  tg()[k] = v;
  if(G.danhDau) G.danhDau('thoigian', k);
  if(G.save) G.save();
}

function haiSo(n){ return (n < 10 ? '0' : '') + n; }
function homNay(){
  var d = new Date();
  return d.getFullYear() + '-' + haiSo(d.getMonth()+1) + '-' + haiSo(d.getDate());
}

/* ═══════════════ ĐỒNG HỒ ═══════════════ */
var manDang = null;       /* màn đang mở */
var batDau = 0;           /* mốc bắt đầu tính, theo đồng hồ đơn điệu */
var chamCuoi = 0;         /* lần thao tác gần nhất */
var donDep = null;

function bayGio(){
  return (window.performance && performance.now) ? performance.now() : Date.now();
}
function dangHoatDong(){
  if(document.hidden) return false;
  return (bayGio() - chamCuoi) < (G.TG_NGUNG_GIAY || 90) * 1000;
}

/* Cộng phần vừa trôi qua vào màn đang mở, rồi đặt lại mốc */
function chot(){
  if(!manDang || !batDau) return;
  var giay = Math.round((bayGio() - batDau) / 1000);
  batDau = bayGio();
  if(giay <= 0 || giay > 3600) return;         /* trên một tiếng một nhịp là không thật */
  var k = 'ng|' + homNay();
  var d = tg()[k] || {};
  d[manDang] = (Number(d[manDang]) || 0) + giay;
  d.__tong = (Number(d.__tong) || 0) + giay;
  ghi(k, d);
}

/* Gọi mỗi khi đổi màn */
G.tgVaoMan = function(v){
  if(!G.S || !G.S.acc) return;
  if(manDang === v) return;
  chot();
  manDang = v;
  batDau = bayGio();
  chamCuoi = bayGio();
};

['click','keydown','scroll','pointermove','touchstart'].forEach(function(e){
  document.addEventListener(e, function(){ chamCuoi = bayGio(); }, {passive:true});
});
document.addEventListener('visibilitychange', function(){
  if(document.hidden) chot();
  else { batDau = bayGio(); chamCuoi = bayGio(); }
});
window.addEventListener('beforeunload', chot);

/* Nhịp chốt: mỗi 20 giây, và chỉ khi thật sự đang hoạt động */
donDep = setInterval(function(){
  if(!manDang) return;
  if(dangHoatDong()) chot();
  else batDau = bayGio();     /* đứng yên: bỏ qua đoạn vừa rồi, không cộng */
}, 20000);

/* ═══════════════ TRA CỨU ═══════════════ */
G.tgLoaiCua = function(v){
  return (G.TG_XEP || {})[v] || 'xem';
};
G.tgChuanCua = function(v){
  var l = G.tgLoaiCua(v);
  return (G.TG_LOAI || []).filter(function(x){ return x.ma === l; })[0] ||
         {ma:'xem', ten:'Màn nhìn tổng quan', toiThieu:20, chuan:90, tran:420, c:'var(--gita)'};
};
G.tgNgay = function(ngay){
  return tg()['ng|' + (ngay || homNay())] || {};
};
G.tgTongNgay = function(ngay){
  return Number(G.tgNgay(ngay).__tong) || 0;
};
G.tgSoNgayCoDo = function(){
  return Object.keys(tg()).filter(function(k){ return k.indexOf('ng|') === 0; }).length;
};
/* Bảy ngày gần nhất, cũ trước mới sau */
G.tgBayNgay = function(){
  var ra = [];
  for(var i = 6; i >= 0; i--){
    var d = new Date(); d.setDate(d.getDate() - i);
    var k = d.getFullYear() + '-' + haiSo(d.getMonth()+1) + '-' + haiSo(d.getDate());
    ra.push({ngay:k, giay: G.tgTongNgay(k), nhan: haiSo(d.getDate()) + '/' + haiSo(d.getMonth()+1)});
  }
  return ra;
};

/* Xếp một màn vào ba ngưỡng */
G.tgXep = function(v, giay){
  var c = G.tgChuanCua(v);
  if(giay < c.toiThieu) return {ma:'luot', ten:'Lướt', c:'#B4720F',
    y:'Chưa đủ ' + c.toiThieu + ' giây — chưa tính là đã xem'};
  if(giay > c.tran) return {ma:'mac', ten:'Có thể đang mắc', c:'#BE0E16',
    y:'Quá ' + Math.round(c.tran/60) + ' phút — thường là đang tắc, không phải đang chăm'};
  return {ma:'du', ten:'Đủ', c:'#0B7350', y:'Trong khoảng chuẩn của loại màn này'};
};

/* Tỉ lệ màn được xem đủ trong ngày — chỉ số vào KPI */
G.tgTiLeDu = function(ngay){
  var d = G.tgNgay(ngay), du = 0, tong = 0;
  Object.keys(d).forEach(function(v){
    if(v.indexOf('__') === 0) return;
    tong++;
    if(G.tgXep(v, d[v]).ma === 'du') du++;
  });
  return tong ? Math.round(du / tong * 100) : 0;
};

/* ═══════════════ MỤC THỜI LƯỢNG MỖI NGÀY ═══════════════
   Chủ hệ chốt 30–45 phút. Ba hàm dưới đây trả lời ba câu khác nhau, và
   không hàm nào được trả lời hộ hai câu kia:

     tgMucNgay()     hôm nay bao nhiêu phút, và ĐI ĐÂU
     tgQuaTran()     bao nhiêu phút trong đó là phút VƯỢT TRẦN một màn
     tgTranNoiDung() nội dung hiện có đỡ nổi bao nhiêu phút

   Câu thứ hai giữ cho con số thật: quá trần của một màn thường là đang
   TẮC chứ không phải đang chăm, nên phút ấy vẫn cộng vào tổng mà không
   được khen. Câu thứ ba giữ cho cái mục có nghĩa: ba mươi phút một ngày
   chỉ có nghĩa nếu có ba mươi phút thứ đáng xem. */
G.tgQuaTran = function(ngay){
  var d = G.tgNgay(ngay), ra = [], tong = 0;
  Object.keys(d).forEach(function(v){
    if(v.indexOf('__') === 0) return;
    var c = G.tgChuanCua(v), du = (d[v] || 0) - (c.tran || 0);
    if(du > 0){ tong += du; ra.push({ man: v, giay: d[v], tran: c.tran, du: du }); }
  });
  return { giay: tong, man: ra };
};

/* TÊN LÀ tgMucNgay CHỨ KHÔNG PHẢI tgHomNay: src/chuyen-the-gioi.js đã
   giữ tên G.tgHomNay từ trước — "tg" ở đó là THẾ GIỚI, không phải thời
   gian. Đặt trùng thì tệp nào nạp sau thắng, tệp kia im lặng gọi nhầm
   hàm của người khác, và không chỗ nào đỏ. Tôi đã đặt trùng đúng một
   lần ở bản này và chỉ phát hiện vì phép thử phá trả về mười hai khoá
   lạ hoắc. */
G.tgMucNgay = function(ngay){
  var M = G.TG_MUC || {};
  var d = G.tgNgay(ngay), tong = G.tgTongNgay(ngay);
  /* Cộng theo VIỆC, mà việc thì nối với LOẠI — không dựng bảng thứ hai
     gán từng màn vào từng việc. TG_XEP đã gán màn vào loại rồi. */
  var theoViec = (G.TG_VIEC || []).map(function(vc){
    var giay = 0, soMan = 0;
    Object.keys(d).forEach(function(v){
      if(v.indexOf('__') === 0) return;
      if(vc.loai.indexOf(G.tgLoaiCua(v)) < 0) return;
      giay += d[v] || 0; soMan++;
    });
    return { ma: vc.ma, ten: vc.ten, c: vc.c, giay: giay, soMan: soMan,
      khongPhaiGiaDinh: vc.khongPhaiGiaDinh === true };
  });
  var min = (M.phutMin || 0) * 60, max = (M.phutMax || 0) * 60;
  return { giay: tong, phut: Math.round(tong / 60),
    min: M.phutMin || null, max: M.phutMax || null,
    trangThai: !min ? 'chuaKhai' : tong < min ? 'duoi' : tong > max ? 'tren' : 'trong',
    conThieu: min && tong < min ? Math.ceil((min - tong) / 60) : 0,
    theoViec: theoViec, quaTran: G.tgQuaTran(ngay) };
};

/* Nội dung hiện có đỡ nổi bao nhiêu phút — cộng CHUẨN của mọi màn vai
   này mở được. Không gõ tay, nên thêm một màn thì con số lên theo trong
   cùng lần chạy. */
G.tgTranNoiDung = function(){
  if(!G.NAV || !G.allowed) return null;
  var mo = {}, theoLoai = {};
  (G.NAV || []).forEach(function(g){
    (g.items || g.muc || []).forEach(function(it){
      var v = it && it.v;
      if(!v || mo[v]) return;
      if(!G.allowed(v)) return;
      mo[v] = 1;
      var l = G.tgLoaiCua(v), c = G.tgChuanCua(v);
      theoLoai[l] = theoLoai[l] || { loai: l, so: 0, giay: 0 };
      theoLoai[l].so++; theoLoai[l].giay += (c.chuan || 0);
    });
  });
  var ds = Object.keys(theoLoai).map(function(k){ return theoLoai[k]; })
    .sort(function(a, b){ return b.giay - a.giay; });
  var tong = 0; ds.forEach(function(x){ tong += x.giay; });
  var M = G.TG_MUC || {};
  var min = (M.phutMin || 0) * 60;
  return { soMan: Object.keys(mo).length, giay: tong, phut: Math.round(tong / 60),
    theoLoai: ds,
    /* Đủ cho mấy ngày ở mục dưới — nói bằng NGÀY vì đó là đơn vị người
       ta lo thật: hết nội dung ngày thứ tư thì mục ngày thứ năm là một
       lời hứa không có gì đỡ. */
    duMayNgay: min ? Math.floor(tong / min) : null };
};

function phut(giay){
  giay = Math.max(0, Math.round(giay || 0));
  if(giay < 60) return giay + ' giây';
  var p = Math.floor(giay / 60), g = giay % 60;
  return p + ' phút' + (g ? ' ' + g + ' giây' : '');
}
G.tgPhut = phut;

/* ═══════════════ ĐIỂM ═══════════════
   Điểm cộng từ ba nguồn đo được: chuỗi ngày ghi sổ, KPI, và tỉ lệ xem đủ.
   Không cộng điểm cho việc mở nhiều màn — mở nhiều không phải là làm nhiều. */
G.tgDiemCuaToi = function(){
  var d = 0, ct = [];
  var chuoi = G.nkChuoi ? G.nkChuoi() : 0;
  if(chuoi >= 7){  d += 50;  ct.push({t:'Chuỗi 7 ngày ghi sổ', d:50}); }
  if(chuoi >= 21){ d += 150; ct.push({t:'Chuỗi 21 ngày ghi sổ', d:150}); }
  var kpi = G.kpiCuaToi ? G.kpiCuaToi() : 0;
  if(kpi >= 80){ d += 200; ct.push({t:'KPI đạt từ 80%', d:200}); }
  if(kpi >= 90){ d += 400; ct.push({t:'KPI đạt từ 90%', d:400}); }
  var tl = G.tgTiLeDu();
  if(tl >= 70){ d += 60; ct.push({t:'Từ 70% màn được xem đủ, không lướt', d:60}); }
  var bt = (G.S && G.S.baithi) || {};
  Object.keys(bt).forEach(function(k){
    if(bt[k] && bt[k].nop){ d += 300; ct.push({t:'Đã nộp bài dự thi ' + k, d:300}); }
  });
  return {diem:d, chiTiet:ct};
};

/* ═══════════════ MÀN HÌNH ═══════════════ */
G.VIEWS['do-thoi-gian'] = function(){
  var d = G.tgNgay();
  var tongNay = G.tgTongNgay();
  var tl = G.tgTiLeDu();
  var bay = G.tgBayNgay();
  var diem = G.tgDiemCuaToi();
  var khach = !!(G.LA_KHACH && G.LA_KHACH());

  var o = U.ph({eyebrow:'ĐỒNG HỒ THẬT · BA NGƯỠNG · THƯỞNG VÀ PHẠT', ic:'pulse', grad:1,
    t: khach ? 'Thời gian nhà mình thật sự dùng' : 'Thời gian và chuẩn hoàn thành',
    lead:'Đồng hồ chỉ chạy khi cửa sổ đang mở và có thao tác trong 90 giây gần nhất. '+
      'Ngoài hai điều đó thì dừng — nên con số ở đây thấp hơn thời gian ngồi trước máy, '+
      'và như vậy là đúng: thà đếm thiếu còn hơn tính công cho một tab bỏ quên.'});

  o += '<div class="row wrap mt2" style="gap:12px">'+
    [[phut(tongNay), 'HÔM NAY', tongNay ? 'var(--gita)' : 'var(--ink-4)'],
     [tl + '%', 'MÀN ĐƯỢC XEM ĐỦ', tl >= 70 ? 'var(--ok)' : 'var(--ink-4)'],
     [String(G.tgSoNgayCoDo()), 'NGÀY CÓ ĐO', 'var(--gita)'],
     [String(diem.diem), 'ĐIỂM ĐANG CÓ', diem.diem ? 'var(--gold-ink)' : 'var(--ink-4)']]
    .map(function(x){
      return '<div class="card" style="flex:1;min-width:150px;text-align:center">'+
        '<b style="font-size:21px;color:'+x[2]+'">'+h(x[0])+'</b>'+
        '<div class="tiny up muted mt">'+h(x[1])+'</div></div>';
    }).join('')+'</div>';

  /* ── MỤC 30–45 PHÚT MỖI NGÀY, VÀ THỜI GIAN ĐI ĐÂU ── */
  var hn = G.tgMucNgay ? G.tgMucNgay() : null;
  var M = G.TG_MUC || {};
  if(hn && hn.min){
    var mau = hn.trangThai === 'trong' ? 'var(--ok)'
      : hn.trangThai === 'tren' ? '#B4720F' : 'var(--ink-4)';
    o += U.sec('HÔM NAY ĐI ĐƯỢC BAO NHIÊU · MỤC ' + hn.min + '–' + hn.max + ' PHÚT',
      M.khongPhaiDichCuaNguoiDung || '');
    /* Thanh có HAI mốc, không phải một đích. Một đích thì dưới mốc là
       trượt; hai mốc thì có một khoảng ĐỦ, và trên khoảng ấy không phải
       là hơn — trần của từng màn đã nói vì sao. */
    var pc = Math.min(100, Math.round(hn.giay / (hn.max * 60) * 100));
    var pcMin = Math.round(hn.min / hn.max * 100);
    o += '<div class="tg-thanh"><div class="tg-day" style="width:' + pc + '%;background:' + mau + '"></div>' +
      '<i class="tg-moc" style="left:' + pcMin + '%"></i></div>' +
      '<p class="tg-loi"><b style="color:' + mau + '">' + h(phut(hn.giay)) + '</b> · ' +
      h(hn.trangThai === 'trong' ? 'trong khoảng đủ'
        : hn.trangThai === 'tren' ? 'trên khoảng đủ — xem phần vượt trần bên dưới'
        : 'còn ' + hn.conThieu + ' phút nữa tới mốc ' + hn.min) + '</p>';

    /* Thời gian ĐI ĐÂU — theo năm việc, và việc nối với LOẠI màn chứ
       không dựng bảng thứ hai gán từng màn vào từng việc. */
    var viec = hn.theoViec.filter(function(x){ return !x.khongPhaiGiaDinh || x.giay; });
    o += '<div class="tg-viec">' + viec.map(function(x){
      var pcx = hn.giay ? Math.round(x.giay / hn.giay * 100) : 0;
      return '<div class="tg-hang"><span class="tg-ten" style="color:' + x.c + '">' +
        h(x.ten) + '</span>' +
        '<span class="tg-vach"><i style="width:' + pcx + '%;background:' + x.c + '"></i></span>' +
        '<span class="tg-so">' + h(phut(x.giay)) + '</span></div>';
    }).join('') + '</div>';

    /* PHÚT VƯỢT TRẦN — cộng vào tổng vì nó có thật, nhưng KHÔNG được
       khen. Quá trần của một màn thường là đang tắc chứ không phải đang
       chăm, và khen nhầm chỗ ấy là dạy người ta ngồi lâu hơn. */
    if(hn.quaTran.giay > 0)
      o += '<div class="card mb" style="border-color:#B4720F45">' +
        '<b class="sm" style="color:#B4720F">' + h(phut(hn.quaTran.giay)) +
        ' trong số đó là phút VƯỢT TRẦN của ' + hn.quaTran.man.length + ' màn</b>' +
        '<p class="sm mt" style="line-height:1.75">' + h(M.viKhongKhen || '') + '</p>' +
        '<p class="tiny dim mt" style="line-height:1.7">' +
        hn.quaTran.man.map(function(x){
          return h(x.man) + ': ' + phut(x.giay) + ' / trần ' + phut(x.tran);
        }).join(' · ') + '</p></div>';

    /* NỘI DUNG ĐỠ NỔI BAO NHIÊU — con số này giữ cho cái mục có nghĩa.
       Ba mươi phút một ngày chỉ có nghĩa nếu có ba mươi phút thứ đáng
       xem, và số ấy CỘNG ra chứ không gõ tay. */
    var tn = G.tgTranNoiDung ? G.tgTranNoiDung() : null;
    if(tn)
      o += '<div class="card mb"><b class="sm">Nội dung vai này mở được đỡ nổi ' +
        '<b style="color:var(--gita)">' + tn.phut + ' phút</b> nếu xem đủ chuẩn một lượt — ' +
        tn.soMan + ' màn' + (tn.duMayNgay ? ', đủ khoảng ' + tn.duMayNgay + ' ngày ở mục ' +
        hn.min + ' phút' : '') + '</b>' +
        '<p class="sm mt" style="line-height:1.75">Sau lượt đầu, thời lượng phải đến từ việc ' +
        'LÀM LẠI — đặt quân mỗi tối, đọc tin mới, kể một chuyện — chứ không từ màn mới. ' +
        'Đó là chỗ mục này sống hay chết.</p>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + tn.theoLoai.map(function(x){
          var l = (G.TG_LOAI || []).filter(function(y){ return y.ma === x.loai; })[0];
          return h((l ? l.ten : x.loai) + ': ' + x.so + ' màn · ' + Math.round(x.giay / 60) + ' phút');
        }).join(' · ') + '</p>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(M.viTranNoiDung || '') + '</p></div>';
  }

  /* Bảy ngày */
  var caoNhat = Math.max(1, Math.max.apply(null, bay.map(function(x){ return x.giay; })));
  o += U.sec('BẢY NGÀY GẦN NHẤT','Cột trống là ngày không mở ứng dụng — đó cũng là dữ liệu thật');
  o += '<div class="card"><div class="row" style="gap:8px;align-items:flex-end;height:130px">'+
    bay.map(function(x){
      var cao = Math.max(3, Math.round(x.giay / caoNhat * 105));
      return '<div style="flex:1;text-align:center">'+
        '<div style="height:'+cao+'px;border-radius:7px 7px 0 0;background:'+
          (x.giay ? 'var(--gita)' : 'var(--line)')+'"></div>'+
        '<div class="tiny muted mt">'+h(x.nhan)+'</div>'+
        '<div class="tiny" style="color:var(--ink-3)">'+(x.giay ? Math.round(x.giay/60)+"'" : '—')+'</div>'+
      '</div>';
    }).join('')+'</div></div>';

  /* Ba ngưỡng */
  o += U.sec('BA NGƯỠNG CHO MỖI LOẠI MÀN','Ngưỡng MẮC quan trọng ngang ngưỡng LƯỚT');
  o += '<div class="card" style="background:var(--phu-1)">'+
    '<p class="sm" style="line-height:1.75">Dưới ngưỡng tối thiểu là <b>LƯỚT</b> — mở rồi đóng, không tính '+
    'là đã xem. Trong khoảng chuẩn là <b>ĐỦ</b>. Vượt xa ngưỡng trên là <b>CÓ THỂ ĐANG MẮC</b> — '+
    'một nhà ngồi bốn mươi phút ở màn lẽ ra mất sáu phút là một nhà đang cần người gọi điện, '+
    'không phải một nhà chăm chỉ.</p></div>';
  o += U.tbl(['Loại màn','Tối thiểu','Chuẩn','Trần','Vì sao đặt như vậy'],
    (G.TG_LOAI || []).map(function(x){
      return ['<b class="sm" style="color:'+x.c+'">'+h(x.ten)+'</b><div class="tiny muted">'+h(x.vd)+'</div>',
        '<span class="mono sm">'+phut(x.toiThieu)+'</span>',
        '<span class="mono sm">'+phut(x.chuan)+'</span>',
        '<span class="mono sm">'+phut(x.tran)+'</span>',
        '<span class="tiny">'+h(x.y)+'</span>'];
    }));

  /* Màn hôm nay */
  var ds = Object.keys(d).filter(function(k){ return k.indexOf('__') !== 0; })
    .sort(function(a,b){ return d[b] - d[a]; });
  o += U.sec('MÀN ĐÃ MỞ HÔM NAY', ds.length ? ds.length + ' màn' : 'Chưa có màn nào đủ dữ liệu');
  if(!ds.length){
    o += '<div class="card" style="background:var(--phu-1)">'+
      '<p class="sm" style="line-height:1.75">Chưa có gì để hiện — đồng hồ mới bắt đầu chạy trong phiên này, '+
      'và nó chỉ ghi lại sau mỗi hai mươi giây có thao tác thật. Mở vài màn rồi quay lại đây là có số.</p></div>';
  } else {
    o += U.tbl(['Màn','Thời gian','Xếp','Ghi chú'], ds.map(function(v){
      var x = G.tgXep(v, d[v]);
      var it = G.navItem ? G.navItem(v) : null;
      var ten = (it && (G.nd ? G.nd('nav.'+v+'.t', it.t) : it.t)) || v;
      return ['<span class="sm">'+h(ten)+'</span>',
        '<span class="mono sm">'+phut(d[v])+'</span>',
        '<span class="chip" style="color:'+x.c+'">'+h(x.ten)+'</span>',
        '<span class="tiny">'+h(x.y)+'</span>'];
    }));
  }

  /* Chuẩn hoàn thành nhiệm vụ */
  o += U.sec('CHUẨN HOÀN THÀNH NHIỆM VỤ','Đo từ lúc việc được giao tới lúc có bằng chứng');
  o += U.tbl(['Loại việc','Xong sớm','Hạn','Trễ thì sao'],
    (G.TG_NHIEMVU || []).map(function(x){
      return ['<b class="sm" style="color:'+x.c+'">'+h(x.ten)+'</b><div class="tiny muted">'+h(x.vd)+'</div>',
        '<span class="mono sm">'+x.som+'h</span>',
        '<span class="mono sm">'+x.han+'h</span>',
        '<span class="tiny">'+h(x.phat)+'</span>'];
    }));

  /* Thưởng */
  o += U.sec('THƯỞNG','Thứ đắt nhất Học viện trao đi là tri thức và người, không phải tiền');
  (G.TG_THUONG || []).forEach(function(x){
    o += '<div class="card mt2" style="border-left:3px solid '+x.c+'">'+
      '<div class="row" style="gap:9px;align-items:baseline;flex-wrap:wrap">'+
        '<b style="flex:1;min-width:200px">'+h(x.dieu)+'</b>'+
        '<span class="chip" style="color:var(--gold-ink)">+'+x.diem+' điểm</span></div>'+
      '<p class="sm mt" style="line-height:1.7"><b>Được gì:</b> '+h(x.cho)+'</p>'+
      '<p class="tiny mt muted" style="line-height:1.65">Vì sao đặt như vậy: '+h(x.vi)+'</p></div>';
  });

  /* Phạt */
  o += U.sec('PHẠT','Không để trừng phạt ai — để con số KPI nói đúng sự thật');
  o += '<div class="card" style="background:var(--phu-1)">'+
    '<p class="sm" style="line-height:1.75">Mọi mức phạt đều có ba thứ: báo trước, ngưỡng rõ, và đường gỡ lại. '+
    'Trừ đúng một điều — Luật LV-01 — mức đó anh Quang đặt và không có ngoại lệ, kể cả với người giỏi nhất.</p></div>';
  (G.TG_PHAT || []).forEach(function(x){
    o += '<div class="card mt2" style="border-left:3px solid '+x.c+'">'+
      '<b style="color:'+x.c+'">'+h(x.dieu)+'</b>'+
      '<p class="sm mt" style="line-height:1.7"><b>Mức:</b> '+h(x.muc)+'</p>'+
      '<p class="sm" style="line-height:1.7"><b>Gỡ lại:</b> '+h(x.gio)+'</p>'+
      '<p class="tiny mt muted" style="line-height:1.65">Vì sao: '+h(x.vi)+'</p></div>';
  });

  /* Điểm của tôi và quy đổi */
  o += U.sec('ĐIỂM CỦA TÔI','Cộng từ thứ đo được, không cộng cho việc mở nhiều màn');
  o += '<div class="card">';
  if(!diem.chiTiet.length){
    o += '<p class="sm" style="line-height:1.75">Chưa có điểm nào — và điều đó bình thường ở tuần đầu. '+
      'Điểm đầu tiên tới ở ngày thứ bảy có ghi sổ liên tiếp: cộng 50. Đó là mốc gần nhất, và cũng là mốc '+
      'khó nhất, vì nó đòi bảy tối liền không bỏ.</p>';
  } else {
    o += diem.chiTiet.map(function(x){
      return '<div class="row" style="gap:9px;justify-content:space-between;padding:7px 0;'+
        'border-bottom:1px solid var(--line)"><span class="sm">'+h(x.t)+'</span>'+
        '<b class="mono sm" style="color:var(--gold-ink)">+'+x.d+'</b></div>';
    }).join('') +
    '<div class="row mt2" style="gap:9px;justify-content:space-between">'+
      '<b>Tổng</b><b class="mono" style="color:var(--gold-ink);font-size:18px">'+diem.diem+' điểm</b></div>';
  }
  o += '</div>';

  o += U.sec('QUY ĐỔI ĐIỂM','Phần mở thêm cửa đứng trước phần quà vật chất');
  o += U.tbl(['Điểm','Đổi được gì','Loại','Đủ chưa'],
    (G.TG_QUYDOI || []).map(function(x){
      var du = diem.diem >= x.diem;
      return ['<b class="mono sm" style="color:'+x.c+'">'+x.diem+'</b>',
        '<span class="sm">'+h(x.qua)+'</span>',
        '<span class="chip" style="color:'+x.c+'">'+h(x.loai)+'</span>',
        du ? '<span class="chip" style="color:var(--ok)">✓ Đủ điểm</span>'
           : '<span class="tiny muted">còn '+(x.diem - diem.diem)+' điểm</span>'];
    }));

  o += '<div class="card mt2" style="border-color:var(--gita-vien-1)">'+
    '<b>'+ic('shield','w-4 h-4')+' Dữ liệu này của ai</b>'+
    '<p class="sm dim mt" style="line-height:1.75">Số liệu thời gian nằm trong hồ sơ của chính tài khoản này '+
    'và chỉ đi lên máy chủ theo đường đồng bộ khoá theo tài khoản. Coach và Tư vấn thấy được mức tổng hợp '+
    'của nhà mình phụ trách — để biết lúc nào cần gọi điện — chứ không thấy từng thao tác. '+
    'Không nhà nào đọc được số của nhà khác.</p></div>';

  return o;
};

})();
