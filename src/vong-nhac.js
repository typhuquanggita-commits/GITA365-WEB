/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v8.6 — VÒNG TRÒN NHẮC

   Vấn đề có thật, và ai làm nghề này cũng gặp: người ta MỞ màn hình, đọc
   lướt hai dòng, gật đầu, rồi đóng lại. Ba tuần sau hỏi thì "em xem rồi"
   — xem thì đúng là có xem, nhưng không có gì đổi khác.

   Xem không phải là làm. Và một hệ thống chỉ đếm lượt mở thì đang tự nói
   dối mình.

   Vòng tròn này đóng khoảng cách đó bằng ba nấc, gọi là ĐÚNG – ĐỦ – SÂU:

     ĐÚNG  Đã mở đúng thứ cần mở, đúng thứ tự. Mở việc hai trước việc một
           thì không tính.
     ĐỦ    Đã làm, và có bằng chứng. Không có bằng chứng thì vẫn là nói.
     SÂU   Đã nhìn lại sau một nhịp, và nói được nó đổi cái gì. Làm một
           lần rồi thôi là chưa sâu.

   Vòng tròn vì nó quay lại: xong SÂU là mở việc kế tiếp ở nấc ĐÚNG.

   Hai chiều, không phải một:
     · Nhắc GIA ĐÌNH việc của mình
     · Nhắc TƯ VẤN, COACH, GIÁO VIÊN việc của họ với từng nhà — đây mới là
       chỗ hay hỏng, vì nhà thì có một việc, còn Coach thì có mười nhà.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var U = G.U, h = U.h, ic = U.ic;
G.VIEWS = G.VIEWS || {};

var KHO = 'gita365_vong_nhac';

G.NAC = [
  {ma:'DUNG', ten:'ĐÚNG', c:'#185AB4', ic:'target',
   y:'Đã mở đúng thứ cần mở, đúng thứ tự.',
   dat:'Mở đúng mục được giao, không nhảy cóc sang mục sau.',
   chua:'Mở lướt nhiều mục, không mục nào ở lại. Hoặc mở việc hai khi việc một chưa xong.'},
  {ma:'DU', ten:'ĐỦ', c:'#0B7350', ic:'check',
   y:'Đã làm, và có bằng chứng.',
   dat:'Nộp được một minh chứng cho việc đã hẹn.',
   chua:'Nói là đã làm nhưng không có gì để xem. Không có bằng chứng thì vẫn là nói.'},
  {ma:'SAU', ten:'SÂU', c:'#BE0E16', ic:'brain',
   y:'Đã nhìn lại sau một nhịp, và nói được nó đổi cái gì.',
   dat:'Viết được một câu về thứ đã khác đi, bằng lời của chính mình.',
   chua:'Làm một lần rồi thôi. Hoặc nhắc lại đúng lời người khác vừa nói.'}
];

/* ═══════════ VIỆC TRONG VÒNG ═══════════
   Mỗi việc: ai làm, mở ở màn nào, nhịp bao lâu, và bằng chứng là gì. */
G.VIEC_NHAC = [
 /* ── Gia đình ── */
 {ma:'GD-1', cho:'nha', ten:'Viết bảng tầm nhìn của nhà mình', v:'tam-nhin',
  nhip:'Một lần, ngay chặng đầu', hanNgay:7,
  bangChung:'Bảng có đủ chữ ở cả bốn ô, do chính người trong nhà viết',
  sau:'Đọc lại sau 90 ngày và nói được chỗ nào đã khác'},
 {ma:'GD-2', cho:'nha', ten:'Ghi nhật ký tối', v:'nhiem-vu',
  nhip:'Mỗi tối', hanNgay:1,
  bangChung:'Bảy tối liên tiếp có ghi',
  sau:'Nhìn lại bảy tối và chỉ ra một nếp đang hình thành'},
 {ma:'GD-3', cho:'nha', ten:'Nộp minh chứng nhiệm vụ tuần', v:'minh-chung',
  nhip:'Mỗi tuần', hanNgay:7,
  bangChung:'Ảnh hoặc ghi chép việc đã làm, Coach xác nhận',
  sau:'So với tuần trước, con tự làm được thêm việc gì'},
 {ma:'GD-4', cho:'nha', ten:'Làm bài đo đầu chặng', v:'bo-test',
  nhip:'Đầu mỗi chặng', hanNgay:10,
  bangChung:'Bài hoàn tất, có kết quả',
  sau:'Đối chiếu với bài cuối chặng trước'},
 {ma:'GD-5', cho:'nha', ten:'Nhìn lại cuối chặng cùng cả nhà', v:'cong-nghiem-thu',
  nhip:'Cuối mỗi chặng', hanNgay:14,
  bangChung:'Đã qua cổng nghiệm thu, có biên bản',
  sau:'Cả nhà nói được một điều đã đổi, không phải một điều đã học'},

 /* ── Đội ngũ ── */
 {ma:'DN-1', cho:'nghe', ten:'Mở ca cho mỗi nhà mới nhận', v:'xu-ly-ca',
  nhip:'Trong 24 giờ từ cuộc gọi đầu', hanNgay:1,
  bangChung:'Ca đã mở, bước B1 có nguyên văn lời gia đình',
  sau:'Đọc lại lời gốc ở bước B6 xem mình có đi đúng chuyện ban đầu không'},
 {ma:'DN-2', cho:'nghe', ten:'Thăm hỏi theo đúng nhịp của tầng', v:'khach-lon',
  nhip:'Bạch kim 2 lần/tuần · Vàng 2 lần/tháng · Thép 2 lần/quý', hanNgay:7,
  bangChung:'Có ghi chép buổi thăm trong hồ sơ nhà',
  sau:'Hiệu quả thăm hỏi = số lần × chất lượng. Xem lại chất lượng, không chỉ đếm số lần.'},
 {ma:'DN-3', cho:'nghe', ten:'Đẩy ca sang bước tiếp theo trước hạn', v:'xu-ly-ca',
  nhip:'Theo hạn giờ của từng bước', hanNgay:3,
  bangChung:'Ca không có bước nào quá hạn',
  sau:'Ca nào hay tắc ở cùng một bước thì bước ấy đang thiếu gì'},
 {ma:'DN-4', cho:'nghe', ten:'Trả lời lời xin tư liệu của các nhà', v:'gui-tu-lieu',
  nhip:'Trong 3 ngày làm việc', hanNgay:3,
  bangChung:'Hàng chờ trống, mỗi lời xin có câu trả lời',
  sau:'Tư liệu đã gửi có được dùng không — hỏi ở buổi hẹn sau'},
 {ma:'DN-5', cho:'nghe', ten:'Nhìn lại chặng cùng gia đình', v:'cong-nghiem-thu',
  nhip:'Cuối mỗi chặng của mỗi nhà', hanNgay:14,
  bangChung:'Biên bản nghiệm thu có bằng chứng của chính nhà đó',
  sau:'Nhà này dạy đội ngũ điều gì — ghi vào bước B7 của ca'},
 {ma:'DN-6', cho:'nghe', ten:'Gửi tài liệu mình biên soạn lên kho chung', v:'thu-vien',
  nhip:'Mỗi tháng ít nhất một bản', hanNgay:30,
  bangChung:'Bản đã gửi, đã qua kiểm duyệt',
  sau:'Bản của mình có ai dùng không, và họ sửa chỗ nào'}
];

/* ═══════════ TRẠNG THÁI ═══════════ */
G.VONG = G.VONG || {};     /* {maViec: {nac:'DUNG', luc:..., ghi:''}} */

function nap(){
  try{ var v = JSON.parse(localStorage.getItem(KHO) || '{}'); if(v && typeof v === 'object') G.VONG = v; }catch(e){}
}
function ghiXuong(){
  try{ localStorage.setItem(KHO, JSON.stringify(G.VONG)); }catch(e){}
  if(G.danhDauCaiDat) G.danhDauCaiDat('vongnhac');
}
nap();

function laNha(){ return !!(G.LA_KHACH && G.LA_KHACH()); }

/* Ba vòng, không phải hai.

   G.LA_KHACH() gộp cả cộng tác viên vào nhóm khách (bậc từ 13 trở lên).
   Đúng cho giọng văn — họ ở ngoài Học viện, nói với họ không nói bằng
   ngôn ngữ nội bộ. Nhưng SAI cho việc: cộng tác viên có ba đầu việc
   được giao trong danh mục, còn vòng 'nha' thì nhắc họ "viết bảng tầm
   nhìn của nhà mình" và "nhìn lại cuối chặng cùng cả nhà" — cộng tác
   viên không có nhà nào trong hệ thống để làm việc đó. Đẩy sang vòng
   'nghe' cũng sai nốt: vòng ấy là mở ca, thăm hỏi theo nhịp tầng, nhìn
   lại chặng cùng gia đình — việc của Coach, không phải của họ.

   Nên vòng thứ ba dựng từ chính danh mục đầu việc của họ, không viết
   thêm nội dung mới: mã, tên, nhịp và bằng chứng đóng đều lấy nguyên từ
   G.CV_MUC. Sửa danh mục một chỗ là vòng nhắc đi theo. */
function vongTuDanhMuc(){
  if(!G.cvMucCuaToi) return [];
  return G.cvMucCuaToi().map(function(m){
    var n = (G.TG_NHIEMVU || []).filter(function(x){ return x.ma === m.nhip; })[0] || {};
    return { ma: m.ma, cho: 'viec', ten: m.ten, v: 'bang-viec',
      nhip: n.ten || m.nhip, hanNgay: Math.max(1, Math.round((n.han || 24) / 24)),
      bangChung: m.xong,
      sau: m.chuyen ? 'Xong rồi thì việc đi tiếp sang vị trí khác — xem đường đi trên bảng công việc.'
                    : 'Đóng kèm bằng chứng trên bảng công việc là vào KPI của ngày ấy.' };
  });
}

function vieCuaToi(){
  /* Có đầu việc được giao thì vòng nhắc là chính bảng việc ấy. */
  if(G.cvVaiCoDauViec && G.cvVaiCoDauViec() && laNha()) return vongTuDanhMuc();
  var cho = laNha() ? 'nha' : 'nghe';
  return G.VIEC_NHAC.filter(function(x){ return x.cho === cho; });
}

G.nacCua = function(ma){
  var t = G.VONG[ma];
  return t && t.nac ? t.nac : null;
};

/* Đi lên một nấc. Không nhảy: chưa ĐÚNG thì không lên ĐỦ được. */
G.lenNac = function(ma, ghi){
  var v = G.VIEC_NHAC.filter(function(x){ return x.ma === ma; })[0];
  if(!v) return {ok:false, ly:'Không có việc này.'};
  var hien = G.nacCua(ma);
  var thu = ['DUNG','DU','SAU'];
  var i = hien ? thu.indexOf(hien) : -1;

  if(i >= 1 && !String(ghi || '').trim())
    return {ok:false, ly: i === 1
      ? 'Nấc SÂU cần một câu: việc này đã đổi cái gì? Viết bằng lời của chính mình.'
      : 'Nấc ĐỦ cần một dòng về bằng chứng: đã làm gì, ngày nào.'};

  if(i >= 2) return {ok:false, ly:'Việc này đã đi hết vòng. Vòng sau bắt đầu ở nhịp kế tiếp.'};

  var moi = thu[i + 1];
  G.VONG[ma] = {nac: moi, luc: Date.now(), ghi: String(ghi || '').trim()};
  ghiXuong();
  if(G.secLog) G.secLog('Vòng tròn nhắc', v.ten + ' → nấc ' + moi, 'Ghi nhận');
  return {ok:true, nac:moi, xong: moi === 'SAU'};
};

/* Bắt đầu lại một vòng mới cho việc lặp theo nhịp */
G.vongMoi = function(ma){
  delete G.VONG[ma];
  ghiXuong();
  return {ok:true};
};

/* Việc nào đang trễ: đã lên nấc nhưng để quá hạn nhịp mà không đi tiếp */
G.viecTre = function(){
  var nay = Date.now();
  return vieCuaToi().filter(function(v){
    var t = G.VONG[v.ma];
    if(!t) return true;                                  /* chưa bắt đầu cũng là đang chờ */
    if(t.nac === 'SAU') return false;                    /* đã đi hết vòng */
    return (nay - t.luc) > (v.hanNgay || 7) * 864e5;
  });
};

G.tomTatVong = function(){
  var ds = vieCuaToi();
  var d = {tong: ds.length, dung:0, du:0, sau:0, chua:0, tre: G.viecTre().length};
  ds.forEach(function(v){
    var n = G.nacCua(v.ma);
    if(n === 'SAU') d.sau++;
    else if(n === 'DU') d.du++;
    else if(n === 'DUNG') d.dung++;
    else d.chua++;
  });
  d.pt = d.tong ? Math.round(d.sau / d.tong * 100) : 0;
  return d;
};

/* ═══════════ THANH NHẮC — hiện trên mọi màn ═══════════ */
G.thanhNhac = function(){
  if(!G.S || !G.S.acc) return '';
  var tre = G.viecTre();
  if(!tre.length) return '';
  var v = tre[0];
  var nac = G.nacCua(v.ma);
  var N = G.NAC.filter(function(x){ return x.ma === (nac || 'DUNG'); })[0];

  return '<div class="nhac-thanh">'+
    '<span class="nhac-cham" style="background:'+N.c+'"></span>'+
    '<div class="nhac-noi">'+
      '<b>'+h(v.ten)+'</b>'+
      '<span class="nhac-y">'+h(nac ? ('Đang ở nấc ' + N.ten + ' — ' + N.y) : 'Chưa bắt đầu · ' + v.nhip)+'</span>'+
    '</div>'+
    (tre.length > 1 ? '<span class="chip">+'+(tre.length-1)+' việc nữa</span>' : '')+
    '<button class="btn sm pri" data-v="vong-nhac">Mở vòng nhắc</button>'+
  '</div>';
};

/* ═══════════════════════════════════════════════════════════════
   MÀN HÌNH · VÒNG TRÒN NHẮC
   ═══════════════════════════════════════════════════════════════ */
G.VIEWS['vong-nhac'] = function(){
  var nha = laNha();
  var ds = vieCuaToi();
  var d = G.tomTatVong();

  var o = U.ph({eyebrow:'ĐÚNG · ĐỦ · SÂU', ic:'orbit', grad:1,
    t: nha ? 'Vòng nhắc của nhà mình' : 'Vòng nhắc việc của tôi',
    lead: nha
      ? 'Xem không phải là làm. Mỗi việc đi qua ba nấc: mở đúng thứ cần mở, làm và có bằng chứng, '+
        'rồi nhìn lại xem nó đổi cái gì. Xong nấc ba là mở việc kế tiếp.'
      : 'Nhà thì có một việc, còn anh chị có mười nhà — đây là chỗ hay hỏng nhất. '+
        'Vòng này giữ cho không nhà nào bị bỏ quên giữa chặng.'});

  o += '<div class="row wrap mt2" style="gap:12px">'+
    [[String(d.sau)+' / '+d.tong, 'ĐÃ ĐI HẾT VÒNG', 'var(--ok)'],
     [String(d.dung + d.du), 'ĐANG GIỮA VÒNG', 'var(--gita)'],
     [String(d.chua), 'CHƯA BẮT ĐẦU', 'var(--ink-4)'],
     [String(d.tre), 'ĐANG TRỄ NHỊP', d.tre ? 'var(--gita-do)' : 'var(--ok)']]
    .map(function(x){
      return '<div class="card" style="flex:1;min-width:150px;text-align:center">'+
        '<b style="font-size:21px;color:'+x[2]+'">'+h(x[0])+'</b>'+
        '<div class="tiny up muted mt">'+h(x[1])+'</div></div>';
    }).join('')+'</div>';

  o += U.sec('BA NẤC','Không nhảy nấc — chưa xong nấc trước thì nút nấc sau không bấm được');
  o += '<div class="row wrap" style="gap:12px">'+ G.NAC.map(function(n, i){
    return '<div class="card" style="flex:1;min-width:230px;border-left:3px solid '+n.c+'">'+
      '<div class="row" style="gap:8px;align-items:center">'+ic(n.ic,'w-4 h-4')+
        '<b style="font-size:16px;color:'+n.c+'">'+(i+1)+'. '+h(n.ten)+'</b></div>'+
      '<p class="sm mt" style="line-height:1.6">'+h(n.y)+'</p>'+
      '<p class="tiny mt" style="color:var(--ok);line-height:1.55">✓ '+h(n.dat)+'</p>'+
      '<p class="tiny mt" style="color:var(--gita-do-ink);line-height:1.55">✕ '+h(n.chua)+'</p></div>';
  }).join('') +'</div>';

  o += U.sec(nha ? 'VIỆC CỦA NHÀ MÌNH' : 'VIỆC CỦA TÔI VỚI TỪNG NHÀ', ds.length + ' việc trong vòng');
  ds.forEach(function(v){
    var nac = G.nacCua(v.ma);
    var thu = ['DUNG','DU','SAU'];
    var i = nac ? thu.indexOf(nac) : -1;
    var tre = G.viecTre().some(function(x){ return x.ma === v.ma; });

    o += '<div class="card mt2" style="border-color:'+(tre ? 'var(--gita-do)' : i>=2 ? 'var(--ok)' : 'var(--line)')+'">'+
      '<div class="row" style="gap:10px;align-items:baseline;flex-wrap:wrap">'+
        '<span class="mono tiny" style="color:var(--gita)">'+h(v.ma)+'</span>'+
        '<b style="flex:1;min-width:200px">'+h(v.ten)+'</b>'+
        '<span class="chip">'+h(v.nhip)+'</span>'+
        (tre ? '<span class="chip" style="color:var(--gita-do-ink)">'+ic('bell','w-3 h-3')+' Trễ nhịp</span>' : '')+
      '</div>'+

      /* Ba nấc, nấc nào xong thì sáng */
      '<div class="row mt2" style="gap:7px;flex-wrap:wrap">'+ G.NAC.map(function(n, j){
        var xong = i >= j;
        return '<span class="chip" style="'+(xong
          ? 'background:'+n.c+'1f;color:'+n.c+';border-color:'+n.c+'55'
          : 'color:var(--ink-4)')+'">'+(xong ? '✓ ' : (j+1)+'. ')+h(n.ten)+'</span>';
      }).join('') +'</div>'+

      '<p class="tiny muted mt">Bằng chứng: '+h(v.bangChung)+'</p>'+
      '<p class="tiny muted">Nấc sâu: '+h(v.sau)+'</p>'+

      (G.VONG[v.ma] && G.VONG[v.ma].ghi
        ? '<div class="mt" style="padding:10px 13px;border-radius:11px;background:var(--phu-1)">'+
          '<span class="tiny up muted">ĐÃ GHI</span>'+
          '<p class="sm mt" style="line-height:1.6">'+h(G.VONG[v.ma].ghi)+'</p></div>' : '')+

      '<div class="mt2">'+
        (i >= 2
          ? '<div class="row" style="gap:9px;flex-wrap:wrap">'+
            '<span class="chip" style="color:var(--ok)">'+ic('check','w-3 h-3')+' Đã đi hết vòng</span>'+
            '<button class="btn ghost sm" data-vongmoi="'+h(v.ma)+'">Bắt đầu vòng mới</button></div>'
          : '<div class="row" style="gap:9px;flex-wrap:wrap;align-items:center">'+
            (i >= 0
              ? '<input id="vn_'+h(v.ma)+'" class="inp" style="flex:1;min-width:230px" placeholder="'+
                (i === 0 ? 'Bằng chứng: đã làm gì, ngày nào' : 'Việc này đã đổi cái gì? Viết bằng lời của mình.')+'">'
              : '')+
            '<button class="btn pri sm" data-vonglen="'+h(v.ma)+'">'+
              (i < 0 ? 'Bắt đầu — mở ' + h(v.ten.split(' ').slice(0,3).join(' ')) : 'Lên nấc ' + G.NAC[i+1].ten)+
            '</button>'+
            (v.v ? '<button class="btn ghost sm" data-v="'+h(v.v)+'">Mở màn việc này</button>' : '')+
          '</div>')+
      '</div>'+
    '</div>';
  });

  o += '<div class="card mt2" style="border-color:var(--gita-vien-1)">'+
    '<b>'+ic('orbit','w-4 h-4')+' Vì sao là vòng tròn, không phải danh sách</b>'+
    '<p class="sm dim mt" style="line-height:1.7">Danh sách thì tích xong là xong. Nhưng một thói quen '+
    'không xong sau một lần — nó cần quay lại. Đi hết nấc SÂU là mở vòng mới ở nhịp kế tiếp, và lần này '+
    'nấc SÂU khó hơn: phải nói được nó đổi cái gì SO VỚI VÒNG TRƯỚC.</p></div>';

  return o;
};

/* ═══════════ BẤM ═══════════ */
document.addEventListener('click', function(e){
  var a = e.target.closest && e.target.closest('[data-vonglen]');
  if(a){
    var ma = a.getAttribute('data-vonglen');
    var o = document.getElementById('vn_' + ma);
    var r = G.lenNac(ma, o ? o.value : '');
    U.toast(r.ok
      ? (r.xong ? 'Đã đi hết vòng. Việc này giờ là một nếp, không còn là một lần.'
                : 'Lên nấc ' + r.nac + '. Nấc sau cần bằng chứng.')
      : r.ly, r.ok ? 'ok' : 'err');
    if(r.ok && G.render) G.render();
    return;
  }
  var b = e.target.closest && e.target.closest('[data-vongmoi]');
  if(b){
    G.vongMoi(b.getAttribute('data-vongmoi'));
    U.toast('Đã mở vòng mới. Lần này nấc SÂU so với vòng trước.','ok');
    if(G.render) G.render();
  }
});

})();
