/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v8.2 — PHẦN KHO DÀNH CHO GIA ĐÌNH
   Ba luật của Học viện, viết thành mã chạy được:

     1. Gia đình mở sẵn tối đa 30% kho. Đây là phần nền — đủ để bắt đầu
        và đi hết chặng đang ở, không phải bản rút gọn cho có.
     2. Phần còn lại KHÔNG khoá vĩnh viễn. Nó nằm trong kho của Học viện
        và được người thật gửi tới: trợ lý tìm thấy, Tư vấn hoặc Coach
        đọc lại rồi mới gửi cho đúng nhà, đúng lúc.
     3. Cửa mở phần thêm là KPI 80%. Chưa tới 80% thì việc cần làm là
        đi cho xong chặng đang dở, không phải nạp thêm tài liệu.

   Vì sao làm thế: tài liệu nhiều hơn không làm nhà nào đổi khác. Nhà
   đổi khác khi làm hết một việc rồi mới nhận việc kế tiếp. Trần 30% là
   một quyết định sư phạm, không phải một hàng rào bán hàng.

   Mọi thứ ở đây chạy trong máy và đi qua đường đồng bộ sẵn có. Không
   có nút tải xuống, không có tệp nén: gia đình đọc thẳng trên ứng dụng.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){

/* ─── Hai con số của luật ─── */
G.TRAN_KHACH   = 0.30;   /* mở sẵn tối đa 30% kho */
G.KPI_XIN_THEM = 80;     /* đạt 80% mới xin thêm được */

/* ═══════════ KPI CỦA NHÀ ═══════════
   Bốn phần đo được, không phần nào là cảm tính:
     · tự chủ  40% — điểm tự chủ trong hồ sơ nhà
     · chặng   25% — số ngày đã đi trên 365
     · vai     20% — số vai đã nhận trong nhà trên 10
     · nhắc    15% — càng ít phải nhắc càng cao
   Khi nối máy chủ, máy chủ ghi đè bằng KPI thật của tài khoản. */
G.kpiCuaToi = function(nha){
  var f = nha || (G.myFamily ? G.myFamily() : null);
  if(!f) return 0;
  if(typeof f.kpi === 'number') return Math.max(0, Math.min(100, Math.round(f.kpi)));
  var tuchu = Math.min(100, Number(f.tuchu) || 0);
  var chang = Math.min(100, (Number(f.ngay) || 0) / 365 * 100);
  var vai   = Math.min(100, (Number(f.vai)  || 0) / 10  * 100);
  var nhac  = Math.max(0, 100 - (Number(f.nhac) || 0) * 20);
  return Math.round(tuchu * 0.40 + chang * 0.25 + vai * 0.20 + nhac * 0.15);
};

G.datKpi80 = function(nha){ return G.kpiCuaToi(nha) >= G.KPI_XIN_THEM; };

/* ═══════════ ĐẾM KHO ═══════════
   Mọi tư liệu đều quy về một đơn vị đếm được, để con số 30% là con số
   thật chứ không phải ước lượng. */
function khoNguon(){
  return [
    {loai:'Mô thức',   kho:G.MOTHUC,    ma:function(x){return x.id;}, ten:function(x){return x.title;}, tang:function(x){return Number(x.tier)||1;}},
    {loai:'Phác đồ',   kho:G.PHACDO,    ma:function(x){return x.ma;}, ten:function(x){return x.ten;},   tang:function(x){return soTang(x.tang);}},
    {loai:'Kịch bản',  kho:G.KICHBAN,   ma:function(x){return x.ma;}, ten:function(x){return x.ten;},   tang:function(x){return soTang(x.tang);}},
    {loai:'Tình huống',kho:G.TINHHUONG, ma:function(x){return x.key||x.ma||('TH-'+x.stt);}, ten:function(x){return x.th||x.ten;}, tang:function(x){return soTang(x.tang);}},
    {loai:'Bài học',   kho:G.BAIHOC,    ma:function(x){return x.id;}, ten:function(x){return x.ten;},   tang:function(x){return Number(x.tier)||1;}}
    /* Kho vắng mặt thì tự rơi ra — trên máy gia đình chỉ còn kho của phần
       gia đình, trên máy nghề còn cả năm. ĐỪNG lọc thêm theo vai ở đây:
       mục 18 của bộ kiểm đếm toàn kho trên một máy nghề rồi mới hỏi trần
       của gia đình, nên lọc theo vai ở chỗ này làm mẫu số đổi theo người
       đang đăng nhập và con số mất nghĩa.

       Danh sách KB_TRAN_NHA.kho là chỗ ĐỐI CHIẾU, không phải bộ lọc: nó
       khai kho nào ĐÁNG LẼ phải có trên máy gia đình, để bộ kiểm hỏi
       được câu mà trước nay không ai hỏi — kho ấy có mặt thật không.
       Trước bản này câu ấy không hỏi được, nên mẫu số của trần 30% co
       lại từ bản 9.8 mà không ai biết. */
  ].filter(function(n){ return Array.isArray(n.kho) && n.kho.length; });
}
function soTang(v){
  var m = String(v == null ? '' : v).match(/(\d)/);
  var n = m ? Number(m[1]) : 1;
  return n >= 1 && n <= 5 ? n : 1;
}

/* Thứ hạng ổn định trong từng kho: tầng thấp trước, rồi theo thứ tự gốc.
   Cùng một nhà, cùng một kho thì luôn ra cùng một danh sách — không xáo trộn
   mỗi lần mở ứng dụng. */
var HANG = null;
function bangHang(){
  if(HANG) return HANG;
  HANG = {};
  khoNguon().forEach(function(n){
    var ds = n.kho.map(function(x, i){
      return {k: n.loai + '·' + n.ma(x), t: n.tang(x), i: i};
    }).sort(function(a, b){ return a.t - b.t || a.i - b.i; });
    var b = {};
    ds.forEach(function(x, r){ b[x.k] = r; });
    HANG[n.loai] = {bang: b, tong: ds.length};
  });
  return HANG;
}
G.quenBangHang = function(){ HANG = null; };   /* gọi khi đổi vai hoặc nạp kho mới */

G.demKho = function(){
  var b = bangHang(), tong = 0, theoLoai = {};
  Object.keys(b).forEach(function(l){ theoLoai[l] = b[l].tong; tong += b[l].tong; });
  return {tong: tong, theoLoai: theoLoai};
};

/* ═══════════ AI LÀ KHÁCH ═══════════ */
function laKhach(){ return !!(G.LA_KHACH && G.LA_KHACH()); }

/* ═══════════ PHẦN ĐƯỢC GỬI THÊM ═══════════
   Khoá tư liệu → {luc, boi, vai}. Chỉ Tư vấn và Coach ghi vào đây. */
G.KHACH_THEM = G.KHACH_THEM || {};
G.XIN_THEM   = G.XIN_THEM   || [];

var KHO_THEM = 'gita365_khach_them';
var KHO_XIN  = 'gita365_xin_them';

function nap(){
  try{
    var a = JSON.parse(localStorage.getItem(KHO_THEM) || '{}');
    if(a && typeof a === 'object') G.KHACH_THEM = a;
    var b = JSON.parse(localStorage.getItem(KHO_XIN) || '[]');
    if(Array.isArray(b)) G.XIN_THEM = b;
  }catch(e){}
}
function ghi(){
  try{
    localStorage.setItem(KHO_THEM, JSON.stringify(G.KHACH_THEM));
    localStorage.setItem(KHO_XIN,  JSON.stringify(G.XIN_THEM));
  }catch(e){}
  if(G.danhDauCaiDat){ G.danhDauCaiDat('khothem'); G.danhDauCaiDat('xinthem'); }
}
G.napKhoThem = nap; G.ghiKhoThem = ghi;
nap();

function nhaCuaToi(){
  var f = G.myFamily ? G.myFamily() : null;
  return (f && f.id) || '—';
}
/* Khoá tư liệu PHẢI mang mã nhà.
   Cụm này đồng bộ toàn cục, nên nếu khoá chỉ là "loại·mã" thì Tư vấn gửi
   một tư liệu cho nhà A là mở luôn tư liệu ấy cho MỌI nhà đang dùng hệ
   thống. Ghép mã nhà vào đầu khoá là chặn hẳn đường đó. */
function khoaTL(loai, ma, nha){
  return String(nha || nhaCuaToi()) + '|' + String(loai) + '·' + String(ma);
}
G.khoaTuLieu = khoaTL;

/* ═══════════ CỬA MỞ MỘT TƯ LIỆU ═══════════
   Người trong nghề: mở theo phạm vi vai như cũ, luật này không đụng tới.
   Gia đình: trong phần nền 30%, hoặc đã được Tư vấn/Coach gửi thêm. */
G.khachMoDuoc = function(loai, ma){
  if(!laKhach()) return true;
  /* Hai khoá khác nhau, đừng lẫn:
       · khoá TƯ LIỆU đã được gửi thêm  → có mã nhà, vì cụm này đồng bộ chung
       · khoá THỨ HẠNG trong kho        → không mã nhà, vì thứ hạng là của kho */
  if(G.KHACH_THEM[khoaTL(loai, ma)]) return true;
  var b = bangHang()[loai];
  if(!b) return true;                       /* kho lạ thì không tự dựng rào */
  var r = b.bang[String(loai) + '·' + String(ma)];
  if(r == null) return true;
  return r < Math.ceil(b.tong * G.TRAN_KHACH);
};

/* Bảng số cho màn hình: nhà này đang mở bao nhiêu phần kho */
/* Số bản ghi từng LOẠI đang có trên máy này. Bộ kiểm cần nó để hỏi một
   câu mà trước nay không ai hỏi được: kho khai cho gia đình có CÓ MẶT
   thật trên máy gia đình không. Không có accessor thì câu ấy chỉ trả lời
   được bằng cách đọc mã, và đọc mã thì không đỏ được. */
G.khoNhaTheoLoai = function(){
  var b = bangHang(), ra = {};
  Object.keys(b).forEach(function(l){ ra[l] = b[l].tong; });
  return ra;
};

G.khoCuaNha = function(){
  var b = bangHang(), nen = 0, tong = 0;
  Object.keys(b).forEach(function(l){
    tong += b[l].tong;
    nen  += Math.ceil(b[l].tong * G.TRAN_KHACH);
  });
  var them = Object.keys(G.KHACH_THEM).length;
  return {
    tong: tong, nen: nen, them: them, mo: nen + them,
    phanTramNen: tong ? Math.round(nen / tong * 100) : 0,
    phanTramMo:  tong ? Math.round((nen + them) / tong * 100) : 0,
    kpi: G.kpiCuaToi(), dat80: G.datKpi80()
  };
};

/* ═══════════ XIN THÊM ═══════════
   Gia đình không tự mở. Gia đình đặt một lời xin, Tư vấn hoặc Coach đọc
   rồi mới gửi. Đó là chỗ có người thật trong đường đi của tài liệu. */
G.xinThemTuLieu = function(loai, ma, ten){
  var k = khoaTL(loai, ma);
  if(G.KHACH_THEM[k]) return {ok:false, ly:'Tư liệu này nhà mình đã có rồi.'};
  var da = G.XIN_THEM.filter(function(x){ return x.k === k && x.nha === nhaCuaToi() && x.trangThai === 'cho'; })[0];
  if(da) return {ok:false, ly:'Nhà mình đã gửi lời xin tư liệu này, đang chờ Tư vấn xem.'};
  var kpi = G.kpiCuaToi();
  var f = G.myFamily ? G.myFamily() : null;
  G.XIN_THEM.push({
    id: 'X' + Date.now().toString(36).toUpperCase(),
    k: k, loai: loai, ma: ma, ten: ten || ma,
    nha: nhaCuaToi(), tenNha: (f && f.nha) || '',
    coach: (f && f.coach) || '', kpi: kpi,
    u: (G.S.acc && G.S.acc.u) || '', luc: new Date().toISOString(),
    trangThai: 'cho'
  });
  ghi();
  return {ok:true, kpi:kpi, dat: kpi >= G.KPI_XIN_THEM};
};

/* Chỉ người trong nghề mới gửi được. lv ≤ 11 là từ Tư vấn trở lên. */
function nguoiNghe(){
  var r = G.S.roleObj;
  return !!(r && r.lv <= 11);
}
G.duocCapTuLieu = nguoiNghe;

G.capThemTuLieu = function(id){
  if(!nguoiNghe()) return {ok:false, ly:'Chỉ Tư vấn, Coach và cấp quản lý mới gửi được tư liệu.'};
  var x = G.XIN_THEM.filter(function(y){ return y.id === id; })[0];
  if(!x) return {ok:false, ly:'Không tìm thấy lời xin này.'};
  if(x.kpi < G.KPI_XIN_THEM)
    return {ok:false, ly:'Nhà này đang ở KPI ' + x.kpi + '%. Cửa mở thêm là ' +
      G.KPI_XIN_THEM + '%. Việc cần làm là đi cho xong chặng đang dở.'};
  x.trangThai = 'daGui';
  x.nguoiGui  = (G.S.acc && G.S.acc.ten) || '';
  x.vaiGui    = (G.S.roleObj && G.S.roleObj.n) || '';
  x.lucGui    = new Date().toISOString();
  /* Khoá đi theo nhà ĐẶT LỜI XIN, không theo nhà của người đang bấm gửi —
     người bấm là Tư vấn, không phải gia đình. */
  G.KHACH_THEM[x.k] = {luc: x.lucGui, boi: x.nguoiGui, vai: x.vaiGui, nha: x.nha};
  ghi();
  return {ok:true, x:x};
};

G.tuChoiThem = function(id, ly){
  if(!nguoiNghe()) return {ok:false, ly:'Chỉ Tư vấn, Coach và cấp quản lý mới trả lời được.'};
  var x = G.XIN_THEM.filter(function(y){ return y.id === id; })[0];
  if(!x) return {ok:false, ly:'Không tìm thấy lời xin này.'};
  x.trangThai = 'hoanLai';
  x.loiNhan   = G.chuHet(ly || '',400);
  if(G.soiLuat) G.soiLuat(x.loiNhan, 'Lời nhắn hoãn lời xin ' + x.id);
  x.nguoiGui  = (G.S.acc && G.S.acc.ten) || '';
  x.lucGui    = new Date().toISOString();
  ghi();
  return {ok:true, x:x};
};

G.xinDangCho = function(){
  return G.XIN_THEM.filter(function(x){ return x.trangThai === 'cho'; });
};

})();

/* ═══════════════════════════════════════════════════════════════
   MÀN HÌNH · GỬI TƯ LIỆU CHO GIA ĐÌNH
   Dành cho Tư vấn, Coach và cấp quản lý. Đây là chỗ có người thật
   đứng giữa kho và gia đình — cố tình đặt như vậy, không phải để làm
   chậm mà để tài liệu tới kèm một buổi nói chuyện.
   ═══════════════════════════════════════════════════════════════ */
(function(){
var U = G.U, h = U.h, ic = U.ic;

function doiLuc(s){
  try{ var d = new Date(s); return d.toLocaleDateString('vi-VN') + ' · ' +
    d.toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'}); }catch(e){ return ''; }
}

G.VIEWS['gui-tu-lieu'] = function(){
  var o = U.ph({eyebrow:'TƯ VẤN & COACH', ic:'share', grad:1,
    t:'Gửi tư liệu cho gia đình',
    lead:'Mỗi nhà mở sẵn '+Math.round(G.TRAN_KHACH*100)+'% kho. Phần sâu hơn đi qua anh chị: '+
         'đọc lời xin, nhìn KPI, rồi gửi kèm một buổi hẹn. Tài liệu tới một mình thì ít khi được dùng.'});

  var cho  = G.XIN_THEM.filter(function(x){ return x.trangThai === 'cho'; });
  var xong = G.XIN_THEM.filter(function(x){ return x.trangThai !== 'cho'; });

  o += U.sec('LUẬT CỦA CỬA NÀY', 'Ba điều máy tự kiểm, anh chị không phải nhớ');
  o += '<div class="row wrap" style="gap:12px">'+
    [['Trần '+Math.round(G.TRAN_KHACH*100)+'%','Phần nền mọi nhà đều có. Đủ để đi hết chặng đang ở, không phải bản rút gọn.'],
     ['Cửa KPI '+G.KPI_XIN_THEM+'%','Dưới mức này máy không cho gửi. Việc cần làm là đi cho xong chặng đang dở.'],
     ['Có người thật','Không có đường tự động. Mỗi phần gửi đi đều mang tên một người trong đội ngũ.']]
    .map(function(x){
      return '<div class="card" style="flex:1;min-width:240px;border-color:var(--gita-vien-1)">'+
        '<b class="sm" style="color:var(--gita-ink)">'+h(x[0])+'</b>'+
        '<p class="sm dim mt" style="line-height:1.6">'+h(x[1])+'</p></div>';
    }).join('')+'</div>';

  o += U.sec('LỜI XIN ĐANG CHỜ', cho.length ? cho.length + ' nhà đang đợi' : 'Chưa có nhà nào đang đợi');
  if(!cho.length){
    o += G.khungTrong({
      ten:'Lời xin tư liệu', ic:'share',
      seCo:'Từng lời xin của các nhà, kèm tên nhà, tư liệu họ chạm phải, KPI hiện tại và Coach phụ trách. '+
           'Anh chị đọc rồi gửi, hoặc hoãn lại kèm lý do.',
      khiNao:'Khi một nhà hỏi trợ lý và chạm phải phần nằm ngoài kho nền 30% của họ.',
      aiLam:'Gia đình đặt lời xin — không tự mở được. Tư vấn, Coach và cấp quản lý là người gửi.',
      viSao:'Đây là chỗ CÓ NGƯỜI THẬT trong đường đi của tài liệu. Bỏ bước này thì tư liệu tới nhà mình '+
            'một mình, không ai giải thích, và phần lớn sẽ không được dùng tới.',
      viDu:{tieu:'Một lời xin trông như thế này', dong:[
        ['Nhà','Nhà Minh An · Coach Nguyễn Thu Trang'],
        ['Tư liệu','Phác đồ · PD-T3-014 Khi con mất động lực giữa chặng'],
        ['KPI hiện tại','88% — đã qua cửa 80%'],
        ['Lúc gửi','Hôm nay, 20:14'],
        ['Việc của anh chị','Gửi kèm một buổi hẹn, đừng gửi trống']
      ]},
      lam:[{t:'Xem năm cấp độ vận dụng', v:'van-dung'},
           {t:'Mở buồng lái Coach', v:'coach-deck'}],
      ghi:'Tư liệu gửi đi một mình thì ít khi được dùng. Luôn hẹn một buổi để đọc cùng.'
    });
  }else{
    o += U.tbl(['Nhà','Tư liệu','KPI','Lúc gửi',''], cho.map(function(x){
      var dat = x.kpi >= G.KPI_XIN_THEM;
      return [
        '<b class="sm">'+h(x.tenNha || x.nha)+'</b>'+
          (x.coach ? '<div class="tiny muted">Coach '+h(x.coach)+'</div>' : ''),
        '<span class="tiny up" style="color:var(--gita-ink)">'+h(x.loai)+'</span>'+
          '<div class="sm">'+h(x.ten)+'</div><span class="mono tiny muted">'+h(x.ma)+'</span>',
        '<b style="color:'+(dat?'var(--ok)':'var(--gita-do-ink)')+'">'+x.kpi+'%</b>',
        '<span class="tiny muted">'+h(doiLuc(x.luc))+'</span>',
        dat ? '<button class="btn sm pri" data-cap="'+h(x.id)+'">Gửi cho nhà này</button>'+
              '<button class="btn ghost sm" data-hoan="'+h(x.id)+'">Hoãn lại</button>'
            : '<span class="tiny" style="color:var(--gita-do-ink)">Chưa tới '+G.KPI_XIN_THEM+'% — '+
              'việc bây giờ là đi nốt chặng dở</span>'
      ];
    }));
  }

  if(xong.length){
    o += U.sec('ĐÃ TRẢ LỜI', xong.length + ' lượt');
    o += U.tbl(['Nhà','Tư liệu','Kết quả','Người trả lời'], xong.slice(-20).reverse().map(function(x){
      return [h(x.tenNha || x.nha), h(x.loai + ' · ' + x.ten),
        x.trangThai === 'daGui'
          ? '<span style="color:var(--ok)">Đã gửi</span>'
          : '<span style="color:var(--ink-4)">Hoãn lại</span>'+(x.loiNhan?'<div class="tiny muted">'+h(x.loiNhan)+'</div>':''),
        h((x.nguoiGui || '') + (x.vaiGui ? ' · ' + x.vaiGui : ''))];
    }));
  }
  return o;
};

document.addEventListener('click', function(e){
  var a = e.target.closest && e.target.closest('[data-cap]');
  if(a){
    var r = G.capThemTuLieu(a.getAttribute('data-cap'));
    U.toast(r.ok ? 'Đã gửi tư liệu tới ' + (r.x.tenNha || r.x.nha) + '. Nhớ hẹn nhà mình một buổi để đọc cùng.' : r.ly,
      r.ok ? 'ok' : 'err');
    if(r.ok) G.render && G.render();
    return;
  }
  var b = e.target.closest && e.target.closest('[data-hoan]');
  if(b){
    var r2 = G.tuChoiThem(b.getAttribute('data-hoan'), 'Hoãn lại — nhà mình làm nốt việc đang dở trước.');
    U.toast(r2.ok ? 'Đã hoãn lại và ghi lý do.' : r2.ly, r2.ok ? 'ok' : 'err');
    if(r2.ok) G.render && G.render();
  }
});

})();
