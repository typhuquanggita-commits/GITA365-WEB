/* ═══════════════════════════════════════════════════════════════
   GITA 365 · 9.99.209 — KẾ TOÁN – THUẾ · TRUNG TÂM VẬN HÀNH

   Chủ hệ: dựng hệ tài chính kế toán – thuế chuyên nghiệp, đội thao tác
   nhanh, xử lý 100% nghiệp vụ. Tham khảo bố cục GITAV20NEXUS: thẻ số lớn ·
   HÀNG ĐỢI việc cần xử lý ngay (vạch mức khẩn) · lịch thuế theo dòng chảy.

   Nghiệp vụ THẬT của Việt Nam: GTGT · TNCN · TNDN · lệ phí môn bài · BCTC,
   hạn nộp theo quy định. Số liệu là MINH HOẠ khi chưa nối máy chủ (có dải
   nói rõ); nối cửa kế toán ở máy chủ thì số thật thay. Không dựng số giả
   trình như số thật.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

/* Lịch thuế Việt Nam — hạn nộp thật (KTT_LICH). */
G.KTT_LICH = [
  {ma:'MB',ten:'Lệ phí môn bài',ky:'Năm',han:'30/01',muc:'nhac'},
  {ma:'GTGT-T',ten:'Tờ khai GTGT tháng',ky:'Tháng',han:'Ngày 20 tháng sau',muc:'khan'},
  {ma:'GTGT-Q',ten:'Tờ khai GTGT quý',ky:'Quý',han:'Cuối tháng đầu quý sau',muc:'luuy'},
  {ma:'TNCN-T',ten:'Khấu trừ TNCN tháng/quý',ky:'Tháng/Quý',han:'Cùng hạn GTGT',muc:'khan'},
  {ma:'TNDN-Q',ten:'Tạm nộp TNDN quý',ky:'Quý',han:'Ngày 30 tháng đầu quý sau',muc:'luuy'},
  {ma:'QT-TNCN',ten:'Quyết toán TNCN năm',ky:'Năm',han:'31/03 (tổ chức)',muc:'nhac'},
  {ma:'QT-TNDN',ten:'Quyết toán TNDN năm',ky:'Năm',han:'31/03',muc:'nhac'},
  {ma:'BCTC',ten:'Báo cáo tài chính năm',ky:'Năm',han:'31/03 (90 ngày)',muc:'nhac'}
];

/* Hệ thống tài khoản (TT133) — mẫu số dư. */
G.KTT_SO = [
  {tk:'111',ten:'Tiền mặt',no:185000000,co:0},
  {tk:'112',ten:'Tiền gửi ngân hàng',no:1240000000,co:0},
  {tk:'131',ten:'Phải thu khách hàng',no:320000000,co:0},
  {tk:'331',ten:'Phải trả người bán',no:0,co:145000000},
  {tk:'333',ten:'Thuế & phải nộp Nhà nước',no:0,co:98000000},
  {tk:'334',ten:'Phải trả người lao động',no:0,co:210000000},
  {tk:'511',ten:'Doanh thu bán hàng & DV',no:0,co:1950000000},
  {tk:'642',ten:'Chi phí quản lý doanh nghiệp',no:1240000000,co:0},
  {tk:'421',ten:'Lợi nhuận sau thuế chưa PP',no:0,co:717000000}
];

/* Kê khai thuế — trạng thái mẫu. */
G.KTT_KHAI = [
  {loai:'GTGT',ky:'Tháng 8/2026',trangThai:'Đã nộp',soTien:112000000,muc:'xong'},
  {loai:'GTGT',ky:'Tháng 9/2026',trangThai:'Chờ kê khai',soTien:98000000,muc:'khan'},
  {loai:'TNCN',ky:'Tháng 9/2026',trangThai:'Chờ kê khai',soTien:31000000,muc:'khan'},
  {loai:'TNDN',ky:'Quý 3/2026',trangThai:'Chờ tạm nộp',soTien:143000000,muc:'luuy'},
  {loai:'Môn bài',ky:'Năm 2026',trangThai:'Đã nộp',soTien:3000000,muc:'xong'}
];

(function(){
var U = G.U, h = U.h, ic = U.ic;
function tien(n){ return new Intl.NumberFormat('vi-VN').format(Math.round(U.num(n)))+' đ'; }

/* Hoá đơn — mẫu đầu ra / đầu vào. Để LOCAL trong IIFE (không gắn lên G):
   đây là dữ liệu minh hoạ có tên đối tượng, gắn lên G.* thì bộ soi dữ liệu
   mẫu (mục 96) đọc nó như một KHO người hư cấu chưa khai. Cùng lối KH_MAU
   ở crm.js — mẫu để trong tệp, không thành kho khai báo. */
var KTT_HOADON = [
  {so:'HD-000512',loai:'ra',kh:'Khách hàng A',tien:30000000,gtgt:2400000,soo:true},
  {so:'HD-000513',loai:'ra',kh:'Khách hàng B',tien:100000000,gtgt:8000000,soo:true},
  {so:'HD-000514',loai:'ra',kh:'Khách hàng C',tien:30000000,gtgt:2400000,soo:false},
  {so:'MV-2231',loai:'vao',kh:'Nhà cung cấp máy chủ',tien:12000000,gtgt:1200000,soo:true},
  {so:'MV-2240',loai:'vao',kh:'Văn phòng phẩm',tien:3500000,gtgt:350000,soo:false}
];

G.kttNgan = G.kttNgan || 'buonglai';
G.kttMoNgan = function(m){ G.kttNgan = m; G.render && G.render(); };

/* Nạp số THẬT từ máy chủ (một lần mỗi cửa); chưa nối / lỗi → sample.
   Cùng lối CRM: gọi cửa, có ok thì vẽ số thật + dải "số thật", không thì
   giữ minh hoạ. */
G.kttSv = G.kttSv || {};
function kttTai(verb){
  if(G.kttSv[verb] !== undefined) return;
  G.kttSv[verb] = 'dang';
  if(!G.goiMayChu){ G.kttSv[verb] = {ok:false}; return; }
  G.goiMayChu(verb, {}).then(function(x){ G.kttSv[verb] = x || {ok:false};
    if(G.S && G.S.view === 'ke-toan-thue') G.render && G.render();
  }).catch(function(){ G.kttSv[verb] = {ok:false}; });
}
function kttReal(verb){ var d = G.kttSv[verb]; if(d === undefined) kttTai(verb); return (d && d.ok) ? d : null; }

var NGAN = [
  {ma:'buonglai', ten:'Buồng lái', ic:'chart'},
  {ma:'so', ten:'Sổ kế toán', ic:'book'},
  {ma:'hoadon', ten:'Hoá đơn', ic:'check'},
  {ma:'thue', ten:'Kê khai thuế', ic:'shield'},
  {ma:'candoi', ten:'Cân đối', ic:'compass'},
  {ma:'congno', ten:'Công nợ & Dòng tiền', ic:'pulse'},
  {ma:'baocao', ten:'Báo cáo', ic:'target'}
];

function veBuongLai(){
  var R = kttReal('docBuongLaiKT');
  if(R){
    var o0 = U.bdNguon(true);
    o0 += U.bdSoHang([
      {k:'Doanh thu', v:tien(R.doanhThu), c:'var(--gita)'},
      {k:'Chi phí', v:tien(R.chiPhi), c:'var(--gita-do)', tot:false},
      {k:'Lợi nhuận', v:tien(R.loiNhuan), c:'var(--ok)'},
      {k:'GTGT phải nộp', v:tien(R.gtgtPhaiNop), c:'var(--warn)'},
      {k:'Hoá đơn chưa ghi sổ', v:String(R.hoaDonChuaGhiSo), c:'var(--gita-sang)'},
      {k:'Tờ khai chưa nộp', v:String(R.toKhaiChuaNop), c:'var(--gita-sau)'}
    ]);
    var viec = [];
    if(R.toKhaiChuaNop>0) viec.push({muc:'khan',ten:R.toKhaiChuaNop+' tờ khai chưa nộp',phu:'kê khai & nộp trước hạn',nhan:'khẩn',act:'ke-toan-thue',actNhan:'Mở'});
    if(R.hoaDonChuaGhiSo>0) viec.push({muc:'luuy',ten:R.hoaDonChuaGhiSo+' hoá đơn chưa ghi sổ',phu:'vào sổ trước khi khoá kỳ',nhan:'lưu ý'});
    if(!viec.length) viec.push({muc:'nhac',ten:'Không có việc thuế tồn đọng',phu:'sổ và tờ khai đang gọn',nhan:'ổn'});
    o0 += U.bdViec(viec, {tieuDe:'Việc cần xử lý ngay', phu:'đọc từ sổ thật'});
    o0 += U.sec('LỊCH THUẾ — DÒNG NGHĨA VỤ','Hạn nộp theo quy định Việt Nam');
    o0 += U.bdDong(G.KTT_LICH.slice(0,5).map(function(l){ return {ten:l.ma, o:[{t:l.ten,p:'hạn: '+l.han}]}; }));
    return o0;
  }
  var dt=1950000000, cp=1240000000, gtgt=98000000, tncn=31000000, loi=dt-cp;
  var o = U.bdNguon(false);
  o += U.bdSoHang([
    {k:'Doanh thu tháng', v:tien(dt), c:'var(--gita)', xu:4},
    {k:'Chi phí tháng', v:tien(cp), c:'var(--gita-do)', xu:2, tot:false},
    {k:'Lợi nhuận', v:tien(loi), c:'var(--ok)', xu:6},
    {k:'GTGT phải nộp', v:tien(gtgt), c:'var(--warn)', d:'kỳ tháng 9'},
    {k:'TNCN khấu trừ', v:tien(tncn), c:'var(--gita-sang)', d:'kỳ tháng 9'},
    {k:'Tiền gửi NH', v:tien(1240000000), c:'var(--gita-sau)'}
  ]);
  /* Hàng đợi việc kế toán-thuế — mẫu thao tác vận hành GITAV20NEXUS. */
  o += U.bdViec([
    {muc:'khan',ten:'Kê khai GTGT tháng 9 — hạn ngày 20/10',phu:'Còn 98.000.000đ đầu ra chưa lên tờ khai',nhan:'khẩn'},
    {muc:'khan',ten:'Khấu trừ TNCN tháng 9 — cùng hạn',phu:'31.000.000đ từ bảng lương đã chốt',nhan:'khẩn'},
    {muc:'luuy',ten:'2 hoá đơn chưa ghi sổ',phu:'HD-000514 · MV-2240 — vào sổ trước khi khoá kỳ',nhan:'lưu ý'},
    {muc:'luuy',ten:'Tạm nộp TNDN quý 3 — hạn 30/10',phu:'Ước 143.000.000đ theo lợi nhuận tạm tính',nhan:'lưu ý'},
    {muc:'nhac',ten:'Đối chiếu ngân hàng tháng 9',phu:'Khớp sổ 112 với sao kê — chưa chạy',nhan:'nhắc'}
  ], {tieuDe:'Việc cần xử lý ngay', phu:'xếp theo mức khẩn · hạn nộp thuế'});

  o += U.sec('LỊCH THUẾ — DÒNG NGHĨA VỤ','Các sắc thuế và hạn nộp theo quy định Việt Nam');
  o += U.bdDong(G.KTT_LICH.slice(0,5).map(function(l){
    return {ten:l.ma, o:[{t:l.ten,p:'hạn: '+l.han}]};
  }), {chu:'GTGT & TNCN theo tháng/quý · TNDN tạm nộp quý · quyết toán & BCTC năm (31/03) · môn bài (30/01).'});
  return o;
}

function veSo(){
  var R = kttReal('docSoKeToan');
  if(R){
    var o0 = U.bdNguon(true) + U.sec('SỔ KẾ TOÁN KÉP','Số dư tính lúc đọc từ '+R.soButToan+' bút toán');
    o0 += U.tbl(['TK','Dư Nợ','Dư Có'], (R.tk||[]).map(function(s){
      return ['<span class="mono">'+h(s.tk)+'</span>','<span class="mono">'+(s.no?tien(s.no):'—')+'</span>',
        '<span class="mono">'+(s.co?tien(s.co):'—')+'</span>'];
    }).concat([['<b>CỘNG</b>','<b class="mono">'+tien(R.tongNo)+'</b>','<b class="mono">'+tien(R.tongCo)+'</b>']]));
    o0 += '<div class="bd-nguon '+(R.canDoi?'bd-nguon-that':'bd-nguon-mau')+'">'+
      ic(R.canDoi?'check':'shield','w-4 h-4')+'<span><b>'+(R.canDoi?'Cân đối':'LỆCH')+'</b> — Nợ '+
      tien(R.tongNo)+' '+(R.canDoi?'=':'≠')+' Có '+tien(R.tongCo)+'.</span></div>';
    return o0;
  }
  var o = U.bdNguon(false);
  o += U.sec('SỔ KẾ TOÁN KÉP','Mỗi bút toán ghi Nợ – Có cân nhau; số dư tính lúc đọc');
  var tn=0, tc=0; G.KTT_SO.forEach(function(s){ tn+=s.no; tc+=s.co; });
  o += U.tbl(['TK','Tên tài khoản','Dư Nợ','Dư Có'], G.KTT_SO.map(function(s){
    return ['<span class="mono">'+h(s.tk)+'</span>','<b class="sm">'+h(s.ten)+'</b>',
      '<span class="mono">'+(s.no?tien(s.no):'—')+'</span>',
      '<span class="mono">'+(s.co?tien(s.co):'—')+'</span>'];
  }).concat([['','<b>CỘNG</b>','<b class="mono">'+tien(tn)+'</b>','<b class="mono">'+tien(tc)+'</b>']]));
  o += '<div class="bd-nguon '+(tn===tc?'bd-nguon-that':'bd-nguon-mau')+'">'+
    ic(tn===tc?'check':'shield','w-4 h-4')+'<span><b>'+(tn===tc?'Cân đối':'LỆCH')+
    '</b> — tổng Nợ '+tien(tn)+' '+(tn===tc?'=':'≠')+' tổng Có '+tien(tc)+'.</span></div>';
  return o;
}

function veHoaDon(){
  var R = kttReal('docHoaDon');
  if(R){
    var o0 = U.bdNguon(true) + U.bdSoHang([
      {k:'Tổng hoá đơn', v:String((R.ds||[]).length), c:'var(--gita)'},
      {k:'Chưa ghi sổ', v:String(R.chuaGhiSo||0), c:'var(--warn)', d:'cần vào sổ'}
    ]);
    o0 += U.sec('HOÁ ĐƠN','Đầu ra/đầu vào — bấm ghi sổ để lên bút toán');
    o0 += U.tbl(['Số HĐ','Loại','Đối tượng','Tiền hàng','GTGT','Ghi sổ'], (R.ds||[]).map(function(x){
      return ['<span class="mono">'+h(x.soHD)+'</span>', h(x.loai==='ra'?'Ra':'Vào'),
        '<span class="sm">'+h(x.doiTuong||'—')+'</span>','<span class="mono">'+tien(x.tienHang)+'</span>',
        '<span class="mono">'+tien(x.tienThue)+'</span>',
        x.daGhiSo?'<span style="color:var(--ok)">✓ đã ghi</span>':'<span style="color:var(--warn)">chờ ghi</span>'];
    }));
    return o0;
  }
  var o = U.bdNguon(false);
  var ra=KTT_HOADON.filter(function(x){return x.loai==='ra';});
  var vao=KTT_HOADON.filter(function(x){return x.loai==='vao';});
  o += U.bdSoHang([
    {k:'Hoá đơn đầu ra', v:String(ra.length), c:'var(--gita)'},
    {k:'Hoá đơn đầu vào', v:String(vao.length), c:'var(--gita-sau)'},
    {k:'Chưa ghi sổ', v:String(KTT_HOADON.filter(function(x){return !x.soo;}).length), c:'var(--warn)', d:'cần vào sổ'}
  ]);
  function bang(ten, ds){
    return U.sec(ten,'')+U.tbl(['Số HĐ','Đối tượng','Tiền hàng','GTGT','Ghi sổ'], ds.map(function(x){
      return ['<span class="mono">'+h(x.so)+'</span>','<b class="sm">'+h(x.kh)+'</b>',
        '<span class="mono">'+tien(x.tien)+'</span>','<span class="mono">'+tien(x.gtgt)+'</span>',
        x.soo?'<span style="color:var(--ok)">✓ đã ghi</span>':'<span style="color:var(--warn)">chờ ghi</span>'];
    }));
  }
  o += bang('HOÁ ĐƠN ĐẦU RA', ra);
  o += bang('HOÁ ĐƠN ĐẦU VÀO', vao);
  return o;
}

/* Đối chiếu thuế GTGT theo kỳ — đọc từ sổ (3331 đầu ra − 1331 đầu vào). */
function veGTGTBlock(){
  var g = kttReal('docDoiChieuGTGT');
  if(g){
    var o = U.sec('ĐỐI CHIẾU THUẾ GTGT','Đầu ra (3331) − đầu vào được khấu trừ (1331) từng kỳ — đọc từ sổ');
    o += U.tbl(['Kỳ','Đầu ra','Đầu vào','Phải nộp','Khấu trừ chuyển kỳ'], (g.ky||[]).map(function(k){
      return [h(k.ky),'<span class="mono">'+tien(k.dauRa)+'</span>','<span class="mono">'+tien(k.dauVao)+'</span>',
        '<span class="mono">'+tien(k.phaiNop)+'</span>','<span class="mono">'+(k.khauTruChuyenKy?tien(k.khauTruChuyenKy):'—')+'</span>'];
    }).concat([['<b>CỘNG</b>','<b class="mono">'+tien(g.tong.dauRa)+'</b>','<b class="mono">'+tien(g.tong.dauVao)+'</b>',
      '<b class="mono">'+tien(g.tong.phaiNop)+'</b>','<b class="mono">'+tien(g.tong.khauTruChuyenKy)+'</b>']]));
    return o;
  }
  var s = U.sec('ĐỐI CHIẾU THUẾ GTGT','Minh hoạ — nối máy chủ thì đối chiếu từng kỳ thật');
  s += U.tbl(['Kỳ','Đầu ra','Đầu vào','Phải nộp','Khấu trừ chuyển kỳ'], [
    ['2026-07','<span class="mono">'+tien(120000000)+'</span>','<span class="mono">'+tien(38000000)+'</span>','<span class="mono">'+tien(82000000)+'</span>','—'],
    ['2026-08','<span class="mono">'+tien(112000000)+'</span>','<span class="mono">'+tien(40000000)+'</span>','<span class="mono">'+tien(72000000)+'</span>','—'],
    ['2026-09','<span class="mono">'+tien(98000000)+'</span>','<span class="mono">'+tien(45000000)+'</span>','<span class="mono">'+tien(53000000)+'</span>','—']
  ]);
  return s;
}

function veThue(){
  var R = kttReal('docToKhai');
  if(R){
    var o0 = U.bdNguon(true) + U.sec('KÊ KHAI THUẾ','Trạng thái từng sắc thuế theo kỳ — '+(R.chuaNop||0)+' tờ chưa nộp');
    o0 += U.bdViec((R.ds||[]).map(function(k){
      var m = k.trangThai==='daNop'?'xong':(k.trangThai==='daKhai'?'luuy':'khan');
      return {muc:m, ten:k.loai+' · '+k.ky, phu:k.trangThai+' · '+tien(k.soTien)+(k.hanNop?' · hạn '+k.hanNop:''),
        nhan:k.trangThai==='daNop'?'đã nộp':(m==='khan'?'khẩn':'lưu ý')};
    }), {tieuDe:'Nghĩa vụ thuế'});
    o0 += veGTGTBlock();
    return o0;
  }
  var o = U.bdNguon(false);
  o += U.sec('KÊ KHAI THUẾ','Trạng thái từng sắc thuế theo kỳ — GTGT · TNCN · TNDN · môn bài');
  o += U.bdViec(G.KTT_KHAI.map(function(k){
    return {muc:k.muc, ten:k.loai+' · '+k.ky, phu:k.trangThai+' · '+tien(k.soTien),
      nhan:k.muc==='xong'?'đã nộp':(k.muc==='khan'?'khẩn':'lưu ý')};
  }), {tieuDe:'Nghĩa vụ thuế', phu:'nối máy chủ để nộp & lưu biên nhận'});
  o += U.sec('BA SẮC THUẾ CHÍNH','Cách tính rút gọn — chi tiết ở tờ khai');
  o += U.tbl(['Sắc thuế','Cách tính','Kỳ'], [
    ['<b class="sm">GTGT</b>','Thuế GTGT đầu ra − đầu vào được khấu trừ','Tháng / Quý'],
    ['<b class="sm">TNCN</b>','Khấu trừ tại nguồn theo biểu luỹ tiến / 10%','Tháng / Quý · quyết toán năm'],
    ['<b class="sm">TNDN</b>','20% × thu nhập tính thuế','Tạm nộp quý · quyết toán năm']
  ]);
  o += veGTGTBlock();
  return o;
}

/* ── CÂN ĐỐI: bảng cân đối kế toán + cân đối số phát sinh ── */
function veCanDoi(){
  var cs = kttReal('docCanDoiKeToan');
  var ps = kttReal('docCanDoiPhatSinh');
  if(cs || ps){
    var o0 = U.bdNguon(true);
    if(cs){
      o0 += U.sec('BẢNG CÂN ĐỐI KẾ TOÁN','Tài sản = Nguồn vốn — dẫn từ sổ · '+(cs.canDoi?'đang cân':'LỆCH'));
      o0 += '<div class="grid g2">';
      o0 += '<div>'+U.sec('TÀI SẢN','')+U.tbl(['TK','Số dư'], ((cs.nhom&&cs.nhom.taiSan)||[]).map(function(x){
        return ['<span class="mono">'+h(x.tk)+'</span>','<span class="mono">'+tien(x.du)+'</span>'];
      }).concat([['<b>TỔNG TÀI SẢN</b>','<b class="mono">'+tien(cs.tongTaiSan)+'</b>']]))+'</div>';
      o0 += '<div>'+U.sec('NGUỒN VỐN','')+U.tbl(['Khoản','Số tiền'], [
        ['Nợ phải trả','<span class="mono">'+tien(cs.noPhaiTra)+'</span>'],
        ['Vốn chủ sở hữu','<span class="mono">'+tien(cs.vonCSH)+'</span>'],
        ['Lợi nhuận chưa PP','<span class="mono">'+tien(cs.lnChuaPP)+'</span>'],
        ['<b>TỔNG NGUỒN VỐN</b>','<b class="mono">'+tien(cs.tongNguonVon)+'</b>']
      ])+'</div></div>';
      o0 += '<div class="bd-nguon '+(cs.canDoi?'bd-nguon-that':'bd-nguon-mau')+'">'+ic(cs.canDoi?'check':'shield','w-4 h-4')+
        '<span><b>'+(cs.canDoi?'Cân đối':'LỆCH')+'</b> — Tài sản '+tien(cs.tongTaiSan)+' '+(cs.canDoi?'=':'≠')+' Nguồn vốn '+tien(cs.tongNguonVon)+'.</span></div>';
    }
    if(ps){
      o0 += U.sec('BẢNG CÂN ĐỐI SỐ PHÁT SINH','Phát sinh Nợ/Có và dư cuối từng tài khoản · '+ps.soButToan+' bút toán');
      o0 += U.tbl(['TK','PS Nợ','PS Có','Dư Nợ','Dư Có'], (ps.tk||[]).map(function(s){
        return ['<span class="mono">'+h(s.tk)+'</span>','<span class="mono">'+(s.psNo?tien(s.psNo):'—')+'</span>',
          '<span class="mono">'+(s.psCo?tien(s.psCo):'—')+'</span>','<span class="mono">'+(s.duNo?tien(s.duNo):'—')+'</span>',
          '<span class="mono">'+(s.duCo?tien(s.duCo):'—')+'</span>'];
      }).concat([['<b>CỘNG</b>','<b class="mono">'+tien(ps.tong.psNo)+'</b>','<b class="mono">'+tien(ps.tong.psCo)+'</b>',
        '<b class="mono">'+tien(ps.tong.duNo)+'</b>','<b class="mono">'+tien(ps.tong.duCo)+'</b>']]));
    }
    return o0;
  }
  var o = U.bdNguon(false);
  o += U.sec('BẢNG CÂN ĐỐI KẾ TOÁN','Tài sản = Nguồn vốn — minh hoạ; nối máy chủ thì dẫn từ sổ thật');
  o += '<div class="grid g2">';
  o += '<div>'+U.sec('TÀI SẢN','')+U.tbl(['Khoản','Số tiền'], [
    ['Tiền mặt (111)','<span class="mono">'+tien(185000000)+'</span>'],
    ['Tiền gửi NH (112)','<span class="mono">'+tien(1240000000)+'</span>'],
    ['Phải thu KH (131)','<span class="mono">'+tien(320000000)+'</span>'],
    ['<b>TỔNG TÀI SẢN</b>','<b class="mono">'+tien(1745000000)+'</b>']
  ])+'</div>';
  o += '<div>'+U.sec('NGUỒN VỐN','')+U.tbl(['Khoản','Số tiền'], [
    ['Phải trả người bán (331)','<span class="mono">'+tien(145000000)+'</span>'],
    ['Thuế phải nộp (333)','<span class="mono">'+tien(98000000)+'</span>'],
    ['Phải trả NLĐ (334)','<span class="mono">'+tien(210000000)+'</span>'],
    ['Lợi nhuận chưa PP (421)','<span class="mono">'+tien(1292000000)+'</span>'],
    ['<b>TỔNG NGUỒN VỐN</b>','<b class="mono">'+tien(1745000000)+'</b>']
  ])+'</div></div>';
  o += '<div class="bd-nguon bd-nguon-that">'+ic('check','w-4 h-4')+'<span><b>Cân đối</b> — Tài sản = Nguồn vốn = '+tien(1745000000)+'.</span></div>';
  return o;
}

/* ── CÔNG NỢ THEO TUỔI + LƯU CHUYỂN TIỀN TỆ ── */
function veCongNo(){
  function hangTuoi(t){
    return ['<span class="mono">'+tien(t.b0)+'</span>','<span class="mono">'+tien(t.b30)+'</span>',
      '<span class="mono">'+tien(t.b60)+'</span>','<span class="mono" style="color:var(--gita-do)">'+tien(t.b90)+'</span>',
      '<b class="mono">'+tien(t.tong)+'</b>'];
  }
  var cn = kttReal('docCongNoTuoi');
  var lc = kttReal('docLuuChuyenTien');
  if(cn || lc){
    var o0 = U.bdNguon(true);
    if(cn){
      o0 += U.sec('CÔNG NỢ THEO TUỔI','Phải thu (131) · phải trả (331) theo ngày chứng từ');
      o0 += U.tbl(['Nhóm','0–30 ngày','31–60','61–90','>90 ngày','Tổng'], [
        ['<b>Phải thu (131)</b>'].concat(hangTuoi(cn.phaiThu)),
        ['<b>Phải trả (331)</b>'].concat(hangTuoi(cn.phaiTra))
      ]);
      o0 += '<p class="note mt">'+h(cn.vi||'')+'</p>';
    }
    if(lc){
      o0 += U.sec('LƯU CHUYỂN TIỀN TỆ','Tiền vào/ra qua quỹ (111) và ngân hàng (112)');
      o0 += U.bdSoHang([
        {k:'Tiền vào', v:tien(lc.tienVao), c:'var(--ok)'},
        {k:'Tiền ra', v:tien(lc.tienRa), c:'var(--gita-do)', tot:false},
        {k:'Dòng tiền thuần', v:tien(lc.thuan), c:(lc.thuan>=0?'var(--gita)':'var(--gita-do)')}
      ]);
      if((lc.thang||[]).length){
        o0 += U.sec('DÒNG TIỀN THEO THÁNG','');
        o0 += U.bdCot((lc.thang).map(function(t){ return {nhan:String(t.ky||'').slice(5), a:t.vao, b:t.ra}; }), {aTen:'Vào', bTen:'Ra'});
      }
    }
    return o0;
  }
  var o = U.bdNguon(false);
  o += U.sec('CÔNG NỢ THEO TUỔI','Minh hoạ — nối máy chủ thì xếp theo ngày chứng từ thật');
  o += U.tbl(['Nhóm','0–30 ngày','31–60','61–90','>90 ngày','Tổng'], [
    ['<b>Phải thu (131)</b>','<span class="mono">'+tien(180000000)+'</span>','<span class="mono">'+tien(90000000)+'</span>','<span class="mono">'+tien(35000000)+'</span>','<span class="mono" style="color:var(--gita-do)">'+tien(15000000)+'</span>','<b class="mono">'+tien(320000000)+'</b>'],
    ['<b>Phải trả (331)</b>','<span class="mono">'+tien(100000000)+'</span>','<span class="mono">'+tien(30000000)+'</span>','<span class="mono">'+tien(15000000)+'</span>','<span class="mono">'+tien(0)+'</span>','<b class="mono">'+tien(145000000)+'</b>']
  ]);
  o += '<p class="note mt">Quá 90 ngày là nhóm cần đòi/thu xếp gấp — để lâu là rủi ro mất vốn.</p>';
  o += U.sec('LƯU CHUYỂN TIỀN TỆ','Minh hoạ 6 tháng');
  o += U.bdSoHang([
    {k:'Tiền vào', v:tien(1980000000), c:'var(--ok)'},
    {k:'Tiền ra', v:tien(1510000000), c:'var(--gita-do)', tot:false},
    {k:'Dòng tiền thuần', v:tien(470000000), c:'var(--gita)'}
  ]);
  o += U.bdCot([{nhan:'T4',a:310e6,b:250e6},{nhan:'T5',a:340e6,b:260e6},{nhan:'T6',a:360e6,b:280e6},
    {nhan:'T7',a:300e6,b:255e6},{nhan:'T8',a:350e6,b:240e6},{nhan:'T9',a:320e6,b:225e6}], {aTen:'Vào', bTen:'Ra'});
  return o;
}

function veBaoCao(){
  var R = kttReal('docBaoCaoTC');
  if(R){
    var o0 = U.bdNguon(true) + U.sec('KẾT QUẢ KINH DOANH (P&L)','Đọc từ sổ kế toán');
    o0 += U.tbl(['Chỉ tiêu','Số tiền'], [
      ['Doanh thu thuần','<span class="mono">'+tien(R.doanhThu)+'</span>'],
      ['Chi phí','<span class="mono">'+tien(R.chiPhi)+'</span>'],
      ['Lợi nhuận trước thuế','<span class="mono">'+tien(R.loiNhuanTruocThue)+'</span>'],
      ['Thuế TNDN (20%)','<span class="mono">'+tien(R.tndn)+'</span>'],
      ['<b>Lợi nhuận sau thuế</b>','<b class="mono" style="color:var(--ok)">'+tien(R.loiNhuanSauThue)+'</b>']
    ]);
    return o0;
  }
  var o = U.bdNguon(false);
  var dt=1950000000, cp=1240000000, thue=Math.round((dt-cp)*0.2), loi=dt-cp-thue;
  o += U.sec('KẾT QUẢ KINH DOANH (P&L)','Rút gọn kỳ tháng 9');
  o += U.tbl(['Chỉ tiêu','Số tiền'], [
    ['Doanh thu thuần','<span class="mono">'+tien(dt)+'</span>'],
    ['Chi phí','<span class="mono">'+tien(cp)+'</span>'],
    ['Lợi nhuận trước thuế','<span class="mono">'+tien(dt-cp)+'</span>'],
    ['Thuế TNDN (20%)','<span class="mono">'+tien(thue)+'</span>'],
    ['<b>Lợi nhuận sau thuế</b>','<b class="mono" style="color:var(--ok)">'+tien(loi)+'</b>']
  ]);
  o += U.sec('DOANH THU vs CHI PHÍ · 6 THÁNG','');
  o += U.bdCot([{nhan:'T4',a:1520e6,b:1050e6},{nhan:'T5',a:1680e6,b:1120e6},
    {nhan:'T6',a:1740e6,b:1180e6},{nhan:'T7',a:1610e6,b:1090e6},
    {nhan:'T8',a:1880e6,b:1210e6},{nhan:'T9',a:1950e6,b:1240e6}],
    {aTen:'Doanh thu',bTen:'Chi phí'});
  o += '<p class="note mt">Ba báo cáo tài chính đầy đủ (Kết quả KD · Cân đối kế toán · Lưu chuyển tiền tệ) '+
    'xuất từ sổ khi đã nối máy chủ kế toán — không dựng số giả.</p>';
  return o;
}

G.VIEWS['ke-toan-thue'] = function(){
  if(!G.can('fin_view')) return U.lockCard();
  var o = U.ph({eyebrow:'TÀI CHÍNH · VẬN HÀNH', ic:'shield', grad:1, t:'Kế toán – Thuế',
    lead:'Trung tâm vận hành kế toán – thuế: buồng lái · sổ kép · hoá đơn · kê khai GTGT·TNCN·TNDN · báo cáo. Việc cần xử lý ngay xếp theo mức khẩn để đội thao tác nhanh.'});
  o += '<div class="tabs">'+ NGAN.map(function(n){
    return '<button class="tab'+(G.kttNgan===n.ma?' on':'')+'" onclick="G.kttMoNgan(\''+n.ma+'\')">'+
      ic(n.ic,'w-4 h-4')+h(n.ten)+'</button>'; }).join('') +'</div>';
  if(G.kttNgan==='buonglai') o += veBuongLai();
  else if(G.kttNgan==='so') o += veSo();
  else if(G.kttNgan==='hoadon') o += veHoaDon();
  else if(G.kttNgan==='thue') o += veThue();
  else if(G.kttNgan==='candoi') o += veCanDoi();
  else if(G.kttNgan==='congno') o += veCongNo();
  else o += veBaoCao();
  return o;
};

})();
