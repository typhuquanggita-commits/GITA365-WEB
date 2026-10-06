/* ═══════════════════════════════════════════════════════════════
   GITA 365 — NĂNG LỰC & THĂNG HẠNG NHÂN SỰ  (Giai đoạn 3)

   Hệ đánh giá cho mọi cấp từ Giám đốc đến Phân tích dữ liệu, sáu trụ:
     1. Test năng lực ĐẦU VÀO
     2. Thi nâng cấp chuyên môn HÀNG THÁNG
     3. Tiêu chuẩn THĂNG HẠNG nghiệp vụ (5 cấp chứng nhận)
     4. Hiệu suất → đề xuất TĂNG LƯƠNG
     5. Hệ CẢNH BÁO năng suất (đèn xanh/vàng/đỏ)
     6. Hệ VINH DANH · tuyên dương

   Thuật toán minh bạch (ai cũng đối chiếu được):
     diemTong = 0.25·đầuvào + 0.40·thitháng + 0.35·hiệusuất
     cấp chứng nhận = ngưỡng(diemTong): ≥90 C5 · ≥80 C4 · ≥70 C3 · ≥55 C2 · còn lại C1
     thăng hạng ĐẠT khi cấp theo điểm > cấp đang giữ
     cảnh báo: hiệusuất <60 đỏ · 60–74 vàng · ≥75 xanh
     vinh danh: diemTong ≥90 huy chương · ≥80 ngôi sao

   Màn quản trị (perm dh_toan_he — Giám đốc trở lên). Mỗi người bấm vào
   mở hồ sơ năng lực. Dữ liệu dưới đây là BỘ KHUNG mẫu để vận hành ngay;
   khi nối hồ sơ nhân sự thật, thay NS_DATA là chạy.

   MÀU QUY ƯỚC: đạt/xanh = --ok · theo dõi/vàng = --warn · rủi ro/đỏ =
   --gita-do-ink · cấp chứng nhận theo tầng t1..t5.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic;

  /* Bộ khung nhân sự mẫu — Giám đốc (R03) → Phân tích dữ liệu (R12).
     [tên, vaiId, capGiuC(1..5), điểmĐầuVào, điểmThiTháng, hiệuSuất,
      xu hướng thi (+/-), số tháng liên tục đạt] */
  var NS_DATA = [
    ['Trần Nhật Minh',    'R03', 4, 88, 92, 90,  2, 11],
    ['Lê Thu Hà',         'R04', 4, 85, 88, 86,  1,  8],
    ['Phạm Quốc Dũng',    'R05', 3, 80, 84, 82,  3,  6],
    ['Nguyễn Khánh Vy',   'R06', 4, 90, 91, 93,  1,  9],
    ['Đỗ Gia Bảo',        'R07', 2, 72, 68, 64, -2,  2],
    ['Vũ Thanh Tâm',      'R07', 3, 78, 82, 80,  2,  5],
    ['Hoàng Mỹ Linh',     'R08', 3, 82, 79, 77, -1,  4],
    ['Bùi Anh Khoa',      'R09', 2, 70, 58, 55, -4,  1],
    ['Đặng Thuỳ Trang',   'R10', 4, 86, 90, 88,  2,  7],
    ['Ngô Hải Đăng',      'R11', 5, 93, 95, 94,  1, 12],
    ['Trịnh Bảo Ngọc',    'R11', 3, 79, 83, 81,  3,  5],
    ['Cao Minh Tuấn',     'R12', 4, 87, 89, 85,  1,  6]
  ];

  var CAP_TEN = {1:'C1 · Tập sự',2:'C2 · Thạo việc',3:'C3 · Vững nghề',4:'C4 · Chuyên sâu',5:'C5 · Bậc thầy'};
  var CAP_MAU = {1:'--t1',2:'--t2',3:'--t3',4:'--t4',5:'--t5'};

  function capTheoDiem(d){ return d>=90?5:d>=80?4:d>=70?3:d>=55?2:1; }
  function diemTong(r){ return Math.round(0.25*r[3] + 0.40*r[4] + 0.35*r[5]); }
  function denCanhBao(hs){ return hs<60?{m:'--gita-do-ink',t:'Rủi ro',k:'đỏ'}:hs<75?{m:'--warn',t:'Theo dõi',k:'vàng'}:{m:'--ok',t:'Ổn định',k:'xanh'}; }
  function vinhDanh(dt){ return dt>=90?{t:'Huy chương',ic:'crown'}:dt>=80?{t:'Ngôi sao',ic:'star'}:null; }
  function luongDeXuat(hs,thang){ return thang?{t:'Đề xuất tăng bậc lương',c:'--ok'}:(hs>=75?{t:'Giữ bậc · xét kỳ tới',c:'--warn'}:{t:'Chưa xét tăng',c:'--gita-do-ink'}); }

  function roleName(id){ var R=G.ROLES||{}; var k=Object.keys(R).filter(function(x){return R[x].id===id;})[0]; return k?R[k]:{n:id,c:'var(--gita)',lv:'?'}; }

  function pin(txt, mau){ return '<span class="nl-pin" style="--m:var('+mau+')">'+h(txt)+'</span>'; }

  /* ── Hồ sơ năng lực một người (modal) ── */
  G.nlHoSo = function(idx){
    var r = NS_DATA[idx]; if(!r) return;
    var role = roleName(r[1]);
    var dt = diemTong(r), capDiem = capTheoDiem(dt), capGiu = r[2];
    var den = denCanhBao(r[5]), vd = vinhDanh(dt);
    var thang = capDiem > capGiu;
    var luong = luongDeXuat(r[5], thang);
    var capKe = Math.min(5, capGiu+1);
    function dong(l,v){ return '<div class="nl-hr"><span>'+h(l)+'</span><div>'+v+'</div></div>'; }
    var html =
      '<div class="nl-hs" style="--c:var('+(CAP_MAU[capGiu]||'--t1')+')">'+
        '<div class="nl-hh">'+ic('users')+'<div><b>'+h(r[0])+'</b>'+
          '<span><span class="nl-vai" style="--vc:'+(role.c||'var(--gita)')+'">'+h(role.n)+'</span> · '+CAP_TEN[capGiu]+'</span></div>'+
          (vd?'<span class="nl-vd">'+ic(vd.ic)+h(vd.t)+'</span>':'')+'</div>'+
        '<div class="grid g3 nl-st">'+
          U.stat({k:'Điểm tổng hợp',v:String(dt),d:'trên 100',c:dt>=80?'#0B7350':dt>=70?'#B4720F':'#BE0E16'})+
          U.stat({k:'Cấp theo điểm',v:'C'+capDiem,d:thang?'đủ thăng hạng ▲':'giữ cấp',c:thang?'#0B7350':'#44556f'})+
          U.stat({k:'Năng suất',v:den.k,d:den.t,c:'var('+den.m+')'})+
        '</div>'+
        '<div class="nl-hg">'+
          dong('1 · Test đầu vào', pin(r[3]+'/100', r[3]>=75?'--ok':'--warn'))+
          dong('2 · Thi tháng gần nhất', pin(r[4]+'/100 '+(r[6]>=0?'▲'+r[6]:'▼'+(-r[6])), r[4]>=75?'--ok':'--gita-do-ink')+' <span class="dim sm">· '+r[7]+' tháng liên tục đạt</span>')+
          dong('3 · Thăng hạng nghiệp vụ', thang?pin('ĐẠT chuẩn '+CAP_TEN[capKe],'--ok'):pin('Giữ '+CAP_TEN[capGiu],'--warn')+' <span class="dim sm">· cần '+Math.max(0,( [0,55,70,80,90][capKe-1]||90)-dt)+' điểm nữa</span>')+
          dong('4 · Hiệu suất → Lương', pin(luong.t, luong.c))+
          dong('5 · Cảnh báo năng suất', pin(den.t+' ('+den.k+')', den.m)+(r[5]<75?' <span class="dim sm">· lên lịch kèm cặp</span>':''))+
          dong('6 · Vinh danh', vd?pin(vd.t,'--t5'):'<span class="dim sm">Chưa đạt mốc vinh danh (cần điểm tổng ≥ 80)</span>')+
        '</div>'+
      '</div>';
    if(U.modal) U.modal(html);
  };

  G.VIEWS['nang-luc-ns'] = function(){
    var rows = NS_DATA.map(function(r,i){ var dt=diemTong(r); return {r:r,i:i,dt:dt,cap:capTheoDiem(dt),thang:capTheoDiem(dt)>r[2],den:denCanhBao(r[5]),vd:vinhDanh(dt)}; });
    var datTH = rows.filter(function(x){return x.thang;}).length;
    var dCanh = rows.filter(function(x){return x.r[5]<75;}).length;
    var dVinh = rows.filter(function(x){return x.vd;}).length;

    var head = U.ph ? U.ph({eyebrow:'ĐÁNH GIÁ & THĂNG HẠNG', ic:'chart', grad:1,
      t:'Năng lực & Thăng hạng', lead:'Sáu trụ đánh giá cho mọi cấp từ Giám đốc đến Phân tích dữ liệu — test đầu vào, thi tháng, thăng hạng, lương, cảnh báo năng suất và vinh danh. Bấm một người để mở hồ sơ năng lực.'})
      : '<h2>Năng lực & Thăng hạng</h2>';

    var tk = '<div class="grid g4 mb">'+
      U.stat({k:'Nhân sự theo dõi',v:String(rows.length),d:'Giám đốc → Phân tích'})+
      U.stat({k:'Đủ thăng hạng',v:String(datTH),d:'vượt chuẩn cấp kế',c:'#0B7350'})+
      U.stat({k:'Cần cải thiện',v:String(dCanh),d:'cảnh báo năng suất',c:dCanh?'#B4720F':'#0B7350'})+
      U.stat({k:'Được vinh danh',v:String(dVinh),d:'điểm tổng ≥ 80',c:'#BE0E16'})+'</div>';

    var legend = '<div class="nl-tru">'+
      [['1','Test đầu vào','seed'],['2','Thi tháng','pulse'],['3','Thăng hạng','crown'],
       ['4','Lương','chart'],['5','Cảnh báo','alert'],['6','Vinh danh','star']]
      .map(function(t){return '<span class="nl-trui">'+ic(t[2],'w-3 h-3')+'<b>'+t[0]+'</b> '+h(t[1])+'</span>';}).join('')+'</div>';

    var body = rows.map(function(x){
      var r=x.r, role=roleName(r[1]);
      return '<tr class="nl-row" data-nlhs="'+x.i+'">'+
        '<td class="mono dim">'+(x.i+1)+'</td>'+
        '<td><b>'+h(r[0])+'</b><br><span class="nl-vai sm" style="--vc:'+(role.c||'var(--gita)')+'">'+h(role.n)+'</span></td>'+
        '<td><span class="nl-cap" style="--m:var('+(CAP_MAU[r[2]]||'--t1')+')">'+h(CAP_TEN[r[2]])+'</span></td>'+
        '<td class="ta-c">'+pin(r[3], r[3]>=75?'--ok':'--warn')+'</td>'+
        '<td class="ta-c">'+pin(r[4]+' '+(r[6]>=0?'▲':'▼'), r[4]>=75?'--ok':'--gita-do-ink')+'</td>'+
        '<td class="ta-c">'+(x.thang?pin('ĐẠT ▲','--ok'):'<span class="dim sm">giữ cấp</span>')+'</td>'+
        '<td class="ta-c">'+pin(x.dt, x.dt>=80?'--ok':x.dt>=70?'--warn':'--gita-do-ink')+'</td>'+
        '<td class="ta-c"><span class="nl-den" style="--m:var('+x.den.m+')" title="'+h(x.den.t)+'"></span> <span class="sm">'+h(x.den.t)+'</span></td>'+
        '<td class="ta-c">'+(x.vd?'<span class="nl-vds" style="--m:--t5">'+ic(x.vd.ic,'w-3 h-3')+h(x.vd.t)+'</span>':'<span class="dim">—</span>')+'</td>'+
      '</tr>';
    }).join('');

    var bang = '<div class="nl-wrap"><table class="nl-tb"><thead><tr>'+
      '<th>STT</th><th>Nhân sự</th><th>Cấp đang giữ</th><th>Đầu vào</th><th>Thi tháng</th>'+
      '<th>Thăng hạng</th><th>Điểm tổng</th><th>Năng suất</th><th>Vinh danh</th>'+
      '</tr></thead><tbody>'+body+'</tbody></table></div>';

    return head + tk + legend +
      (U.sec?U.sec('Bảng đánh giá nhân sự','Bấm một dòng để mở hồ sơ năng lực · đề xuất thăng hạng · lương'):'') +
      bang;
  };

})();
