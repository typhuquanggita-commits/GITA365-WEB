/* ═══════════════════════════════════════════════════════════════
   GITA 365 — LỒNG CHUYỆN VÀO CHỖ NGƯỜI TA ĐANG ĐỨNG

   Chủ hệ thống yêu cầu: đưa toàn bộ kho chuyện đã biên soạn lên web app,
   ở những phần lồng ghép được, để thúc đẩy khách hàng theo đúng mô thức
   huấn luyện GITA.

   ── VẤN ĐỀ TRƯỚC BẢN NÀY ──
   Kho có 600 chuyện theo cấp tài khoản, 77 chuyện người thật, 34 câu gốc
   — nhưng tất cả chỉ hiện ở BA màn: Chuyện truyền cảm hứng, Chuyện thế
   giới, Giọng đọc. Người dùng phải chủ động đi tìm mới đọc được.

   Mà cảm hứng không hoạt động theo cách ấy. Một câu chuyện về "đứt nhịp
   rồi quay lại" có sức nặng đúng vào lúc người ta vừa đứt nhịp và đang
   mở màn Người đồng hành — chứ không phải lúc họ rảnh rỗi vào thư viện
   chuyện. Chuyện phải tới chỗ người ta đang đứng.

   ── CÁCH LÀM ──
   Mỗi màn được khai một MẠCH (M1–M10) và một TRỤ GITA. Màn nào đang mở
   thì lấy một chuyện thuộc mạch ấy, trong kho đúng cấp tài khoản của
   người đang xem, và gắn vào cuối màn.

   ── BỐN LUẬT ──
   1. Đúng cấp. Học viên đọc chuyện học viên, phụ huynh đọc chuyện phụ
      huynh. Dùng lại G.chCapCuaToi() của kho chuyện, không tự đặt luật
      thứ hai.
   2. Đứng yên trong ngày. Chuyện chọn theo ngày + tài khoản + tên màn,
      không theo đồng hồ. Mở lại màn mà chuyện đã đổi thì người đọc hiểu
      ngay là máy phát bừa, và cả kho mất trọng lượng.
   3. Không chen vào màn khoá. Màn chưa được cấp phép thì để nguyên —
      chèn chuyện vào đó là nói với người ta rằng cửa vẫn mở.
   4. Không lặp lại ba màn kho chuyện. Chúng đã là kho; chèn thêm vào đó
      là thừa.

   ── VÌ SAO GẮN TRỤ GITA ──
   Chuyện không gắn trụ thì là chuyện vui. Gắn trụ rồi thì người đọc biết
   mình vừa được nạp phần nào: Goal, Inspirits, Talent hay Action — và
   ô "làm được ngay hôm nay" chính là chữ A của mô thức, chỗ mà cảm hứng
   biến thành việc.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var U = G.U, h = U.h, ic = U.ic;

/* ═══════════ BẢNG GẮN MÀN ═══════════
   Mỗi dòng: màn · mạch chuyện · trụ GITA · câu dẫn vào.
   Câu dẫn viết riêng cho từng màn, không dùng chung một câu — một câu
   chung lặp trên ba mươi màn thì tới màn thứ tư người ta đã bỏ qua. */
G.CLG_BANG = [
 /* ── Cửa vào và định hướng ── */
 {man:'gioi-thieu',    mach:'M1',  tru:'I', dan:'Một nhà đã đi trước, kể lại chỗ khó nhất lúc bắt đầu'},
 {man:'tham-gia',      mach:'M1',  tru:'I', dan:'Trước khi quyết, đọc chuyện một người đã ở đúng chỗ anh chị đang đứng'},
 {man:'bat-dau',       mach:'M1',  tru:'G', dan:'Ngày đầu của người khác — để biết mình không phải người duy nhất thấy khó'},
 {man:'pham-vi',       mach:'M1',  tru:'G', dan:'Biết mình được gì rồi thì đây là chuyện của người đã dùng hết phần ấy'},
 {man:'dinh-vi',       mach:'M1',  tru:'G', dan:'Định vị đúng chỗ đứng là bước đầu — người này đã làm thế nào'},

 /* ── Mục tiêu và bản đồ ── */
 {man:'ban-do',        mach:'M5',  tru:'G', dan:'Khúc giữa bản đồ là khúc không ai vỗ tay — chuyện của người đã đi qua'},
 {man:'ban-do-ca-nhan',mach:'M5',  tru:'G', dan:'Bản đồ của riêng mình, và một người đã vẽ xong bản đồ của họ'},
 {man:'hanh-trinh-12', mach:'M5',  tru:'G', dan:'Mười hai chặng nhìn thì dài — nghe người đã đi hết kể lại'},
 {man:'hanh-trinh-con',mach:'M5',  tru:'G', dan:'Đường của con mình, và đường của một đứa trẻ khác đã đi trước'},
 {man:'lo-trinh',      mach:'M5',  tru:'G', dan:'Lộ trình trên giấy và lộ trình khi đi thật — chuyện của người đi thật'},
 {man:'tam-nhin',      mach:'M10', tru:'G', dan:'Tầm nhìn thành thật khi có người về tới đích và quay lại dắt người sau'},

 /* ── Nội lực: ngày mệt, bị chê, đứt nhịp ── */
 {man:'toi',           mach:'M2',  tru:'I', dan:'Hồ sơ của mình, và chuyện của một người đã có ngày muốn bỏ'},
 {man:'cu-hich',       mach:'M2',  tru:'I', dan:'Cú hích đúng lúc — đây là cú hích đã hiệu quả với một người thật'},
 {man:'dong-hanh',     mach:'M3',  tru:'I', dan:'Đứt một ngày không giết được ai. Đây là người đã đứt và quay lại'},
 {man:'nhat-ky-ht',    mach:'M3',  tru:'A', dan:'Nhật ký viết đều thì thành đường. Người này đã viết thế nào'},
 {man:'nhat-ky-vi-tri',mach:'M3',  tru:'A', dan:'Sổ của vị trí này, qua một người đã giữ nó đủ lâu'},
 {man:'ngon-tu',       mach:'M4',  tru:'I', dan:'Lời nói đúng lúc bị nghi ngờ — chuyện của người đã chọn được lời'},
 {man:'ranh-gioi',     mach:'M4',  tru:'I', dan:'Giữ ranh giới mà không mất người — một người đã làm được'},
 {man:'hai-long',      mach:'M4',  tru:'I', dan:'Chỗ khó nhất của nghề là lúc bị hiểu nhầm. Chuyện của người đã qua'},

 /* ── Tài năng và cách nghĩ ── */
 {man:'tu-duy',        mach:'M7',  tru:'T', dan:'Đường cũ tắc thì tìm đường khác — đây là một đường khác có thật'},
 {man:'nhan-dien',     mach:'M4',  tru:'T', dan:'Nhận ra đúng người trước mặt mình — chuyện của người đã nhận ra kịp'},
 {man:'chan-dung-nha', mach:'M4',  tru:'T', dan:'Mỗi nhà một kiểu. Đây là một nhà cụ thể, và cách đọc được nhà ấy'},
 {man:'tinh-huong',    mach:'M2',  tru:'T', dan:'Tình huống trên giấy và tình huống ngoài đời — một ca có thật'},
 {man:'xu-ly-ca',      mach:'M7',  tru:'T', dan:'Ca khó nhất là ca không giống bài nào. Người này đã xử thế nào'},
 {man:'chuyen-doi',    mach:'M7',  tru:'T', dan:'Chuyển đổi thật là chuyển đổi giữ được sau ba tháng — đây là một ca'},
 {man:'kho',           mach:'M6',  tru:'T', dan:'Kho đầy mà không dùng thì vẫn là kho rỗng. Người này đã dùng thế nào'},
 {man:'so-tay-nhan-dien', mach:'M4', tru:'T', dan:'Sổ tay đọc người, qua một lần đọc đúng đã thay đổi cả một ca'},

 /* ── Hành động và nếp ── */
 {man:'nhiem-vu',      mach:'M6',  tru:'A', dan:'Việc nhỏ làm đều thì thành nếp. Đây là một người đã làm đều'},
 {man:'thoi-quen',     mach:'M6',  tru:'A', dan:'Thói quen không dựng bằng quyết tâm, dựng bằng lặp lại — chuyện thật'},
 {man:'do-thoi-gian',  mach:'M6',  tru:'A', dan:'Đo được thì sửa được. Người này đã đo và đã sửa'},
 {man:'thi-viet',      mach:'M6',  tru:'A', dan:'Viết đủ bốn mốc là một việc dài. Người này đã viết hết'},
 {man:'sat-hach',      mach:'M6',  tru:'A', dan:'Thi không phải để loại, để biết mình đang ở đâu — chuyện của một người thi'},
 {man:'khoa-dao-tao',  mach:'M1',  tru:'A', dan:'Bắt đầu một khoá khi chưa sẵn sàng — người này đã bắt đầu thế nào'},
 {man:'phan-thuong',   mach:'M6',  tru:'A', dan:'Phần thưởng là hệ quả, không phải là đích. Chuyện của người hiểu ra điều đó'},

 /* ── Trao đi và dẫn dắt ── */
 {man:'chin-vai',      mach:'M9',  tru:'T', dan:'Chín vai trong nhà, qua một nhà đã chia lại được vai'},
 {man:'dai-su',        mach:'M9',  tru:'A', dan:'Giới thiệu người khác vào là trao đi, không phải bán — chuyện thật'},
 {man:'referral',      mach:'M9',  tru:'A', dan:'Một lời giới thiệu tử tế đi xa tới đâu — đây là một lời như thế'},
 {man:'vinh-danh',     mach:'M10', tru:'A', dan:'Về đích rồi trao lại — chuyện của người đã trao'},
 {man:'nguoi-dan-dat', mach:'M9',  tru:'T', dan:'Dẫn dắt là nâng người khác lên chỗ mình đang đứng. Một người đã làm'},
 {man:'doi-ngu',       mach:'M9',  tru:'A', dan:'Đội mạnh không phải đội giỏi nhất, là đội đỡ được nhau — chuyện thật'},

 /* ── Trung thực và luật ── */
 {man:'hoc-phi',       mach:'M8',  tru:'I', dan:'Nói thật về tiền lúc bất lợi — chuyện của một người đã nói thật'},
 {man:'luat-lam-viec', mach:'M8',  tru:'A', dan:'Luật chỉ sống khi có người giữ lúc không ai nhìn. Đây là một lần như thế'},
 {man:'an-toan-du-lieu',mach:'M8', tru:'A', dan:'Giữ dữ liệu của nhà người khác là giữ lòng tin — một lần giữ được'},
 {man:'tang-truong',   mach:'M7',  tru:'G', dan:'Tăng trưởng bền là tăng trưởng không đốt người — chuyện của một nhóm'}
];

/* Ba màn kho chuyện: không chèn thêm, chúng đã là kho */
var TRU_MAN = ['chuyen-cam-hung', 'chuyen-the-gioi', 'giong-doc'];

/* ═══════════ CHỌN CHUYỆN ═══════════ */
function bam(s){
  var n = 0;
  for(var i = 0; i < s.length; i++) n = ((n << 5) - n + s.charCodeAt(i)) | 0;
  return Math.abs(n);
}
function ngay(){
  var d = new Date();
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}

G.clgDong = function(man){
  for(var i = 0; i < G.CLG_BANG.length; i++)
    if(G.CLG_BANG[i].man === man) return G.CLG_BANG[i];
  return null;
};

/* Chuyện cho một màn: đúng cấp tài khoản, đúng mạch, đứng yên trong ngày.
   Mạch nào kho của cấp ấy không có chuyện thì lấy cả kho — thà một chuyện
   hơi lệch mạch còn hơn một ô trống, vì ô trống là lời hứa hụt. */
G.clgChon = function(man){
  var d = G.clgDong(man);
  if(!d) return null;
  var cap = G.chCapCuaToi ? G.chCapCuaToi() : 'PH';
  var kho = (G.CHUYEN || []).filter(function(x){ return x.cap === cap; });
  if(!kho.length) return null;
  var hop = kho.filter(function(x){ return x.mach === d.mach; });
  var nguon = hop.length ? hop : kho;
  var u = (G.S && G.S.acc && G.S.acc.u) || 'khach';
  return nguon[bam(ngay() + '|' + u + '|' + man) % nguon.length];
};

/* ═══════════ VẼ ═══════════ */
function truCua(k){
  var a = G.GITA || [];
  for(var i = 0; i < a.length; i++) if(a[i].k === k) return a[i];
  return null;
}

G.clgThe = function(man){
  var d = G.clgDong(man);
  var c = G.clgChon(man);
  if(!d || !c || !G.veChuyen) return '';
  var t = truCua(d.tru);
  var mach = (G.CH_MACH || []).filter(function(x){ return x.ma === d.mach; })[0];
  var mau = (mach && mach.c) || 'var(--gita)';

  return U.sec('CHUYỆN CHO CHỖ NÀY', d.dan) +
    '<div class="card" style="padding:0;overflow:hidden;border-color:' + mau + '55">' +
      '<div class="row" style="gap:10px;align-items:center;flex-wrap:wrap;padding:11px 15px;' +
        'background:' + mau + '12;border-bottom:1px solid ' + mau + '33">' +
        '<span style="color:' + mau + ';flex:none">' + ic((mach && mach.ic) || 'spark', 'w-4 h-4') + '</span>' +
        '<b class="sm" style="flex:1;min-width:170px;color:' + mau + '">' + h(mach ? mach.ten : d.mach) + '</b>' +
        (t ? '<span class="chip" style="color:var(--gita)" title="' + h(t.desc || '') + '">' +
             'Trụ ' + h(t.k) + ' · ' + h(t.name) + '</span>' : '') +
      '</div>' +
      '<div style="padding:4px 15px 14px">' + G.veChuyen(c, true) + '</div>' +
      '<div class="row" style="gap:9px;flex-wrap:wrap;padding:0 15px 14px">' +
        (G.chDaDoc && G.chDaDoc(c.ma) ? '' :
          '<button class="btn pri sm" data-chdoc="' + h(c.ma) + '">' +
          ic('check', 'w-3 h-3') + ' Đã đọc và sẽ làm</button>') +
        '<button class="btn ghost sm" data-go="chuyen-cam-hung">' +
        ic('book', 'w-3 h-3') + ' Cả kho chuyện của cấp mình</button>' +
      '</div>' +
    '</div>';
};

/* ═══════════ CHUYỆN NGƯỜI THẬT ═══════════
   Kho 77 người có thật đi kèm sáu màn nói về vượt giới hạn và tầm nhìn.
   Ít màn hơn kho chuyện theo cấp, có chủ ý: người thật có sức nặng riêng,
   rải khắp nơi là mất. */
G.CLG_TG = ['tu-duy', 'hanh-trinh-12', 'vinh-danh', 'cu-hich', 'dinh-vi', 'tam-nhin'];

G.clgTheTG = function(man){
  var ds = G.CHUYEN_TG || [];
  if(!ds.length || !G.veChuyenTG) return '';
  var u = (G.S && G.S.acc && G.S.acc.u) || 'khach';
  var c = ds[bam(ngay() + '|' + u + '|tg|' + man) % ds.length];
  var l = (G.TG_LINH || []).filter(function(x){ return x.ma === c.linh; })[0];
  return U.sec('NGƯỜI THẬT ĐÃ ĐI QUA CHỖ NÀY',
      'Người có thật, việc có thật, ghi chép công khai — không phải chuyện dựng để động viên' +
      (l ? ' · ' + l.ten : '')) +
    G.veChuyenTG(c, true);
};

/* ═══════════ NỐI VÀO MÀN CÓ SẴN ═══════════
   Cùng cách src/cong-dong.js dùng: bọc hàm dựng màn cũ, không sửa vào
   ruột nó. Màn nào đổi sau này thì phần chèn vẫn chạy y nguyên. */
function biKhoa(html){
  return typeof html !== 'string' || html.length < 400 ||
    html.indexOf('data-go="pham-vi"') >= 0 ||
    html.trim().indexOf('<div class="card center" style="padding:40px">') === 0;
}

function noi(ten, them){
  var cu = G.VIEWS && G.VIEWS[ten];
  if(typeof cu !== 'function') return false;
  G.VIEWS[ten] = function(){
    var o = cu.apply(this, arguments);
    if(biKhoa(o)) return o;
    try{ return o + them(); }catch(e){ return o; }
  };
  return true;
}

G.clgDaNoi = [];

/* Nối lại được nhiều lần, và bỏ qua màn đã nối.

   Vì sao cần chạy lại: từ bản 9.23 mã dựng màn của nghề nằm ở gói riêng,
   về SAU khi tệp này đã chạy. Vòng nối chạy một lần lúc tải trang thì ba
   màn nghề không bao giờ được lồng chuyện — và hụt kiểu ấy không ném lỗi
   nào, chỉ là màn ấy thiếu một thẻ chuyện mà không ai để ý.

   Nên nó thành hàm, và người nạp mã nghề gọi lại nó khi mã về. */
G.clgNoiLai = function(){
  var them = 0;
  for(var i = 0; i < G.CLG_BANG.length; i++){
    var m = G.CLG_BANG[i].man;
    if(TRU_MAN.indexOf(m) >= 0) continue;
    if(G.clgDaNoi.indexOf(m) >= 0) continue;
    (function(man){
      if(noi(man, function(){
        return G.clgThe(man) + (G.CLG_TG.indexOf(man) >= 0 ? G.clgTheTG(man) : '');
      })) { G.clgDaNoi.push(man); them++; }
    })(m);
  }
  return them;
};
G.clgNoiLai();
(G.BOC_LAI = G.BOC_LAI || []).push('clgNoiLai');

/* Đếm thật để màn tự soát và bài kiểm phát hành đọc được, thay vì tin
   vào con số viết tay trong tài liệu. */
G.clgSoat = function(){
  var thieuMan = [], thieuChuyen = [];
  for(var i = 0; i < G.CLG_BANG.length; i++){
    var d = G.CLG_BANG[i];
    /* Có thật hay không — khác với mã đã về hay chưa. */
    if(!(G.manCoThat ? G.manCoThat(d.man) : (G.VIEWS||{})[d.man])) thieuMan.push(d.man);
    if(!G.clgChon(d.man)) thieuChuyen.push(d.man);
  }
  return {
    soDong: G.CLG_BANG.length,
    daNoi: G.clgDaNoi.length,
    thieuMan: thieuMan,
    thieuChuyen: thieuChuyen,
    soChuyen: (G.CHUYEN || []).length,
    soNguoiThat: (G.CHUYEN_TG || []).length
  };
};

})();
