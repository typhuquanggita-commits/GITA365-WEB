/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v7.8 — MÀN BỐN TUYẾN

   Màn này trả lời đúng một câu: mỗi tuyến còn thiếu gì trước khi mở
   được cho khách. Và trả lời bằng cách ĐO dữ liệu đang có trong máy,
   không bằng một cờ ai đó tự bật — giống hệt cách màn tự soát làm.

   Vì sao cần: bốn tuyến đang dựng chuẩn song song. Không có một chỗ
   nhìn thấy tất cả thì tới lúc hợp nhất mới phát hiện tuyến nào thiếu
   băng, tuyến nào thiếu kịch bản — và lúc ấy sửa đắt hơn nhiều.

   Hàm đo nằm ở src/data.tuyen.js (G.tuyenDatMoc). Ở đây chỉ vẽ.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var U = G.U, h = U.h, ic = U.ic;
G.VIEWS = G.VIEWS || {};

function o1(dat){
  return dat ? '<span style="color:var(--ok);font-weight:700">✓</span>'
             : '<span style="color:var(--gita-do-ink);font-weight:700">✕</span>';
}
function o1x(dat){
  return dat ? '<span class="chip" style="color:var(--ok);border-color:var(--ok)">đã có</span>'
             : '<span class="chip" style="color:var(--gita-do-ink);border-color:var(--gita-do)">chưa có</span>';
}

G.VIEWS['tuyen'] = function(){
  /* Bảng này lộ toàn bộ kế hoạch sản phẩm của Học viện — tuyến nào sắp
     mở, tuyến nào còn thiếu gì. Chỉ mở cho cấp quản trị. */
  if(!G.can('qt_trang')) return U.lockCard(
    'Bảng bốn tuyến cho biết tuyến nào sắp mở và tuyến nào còn thiếu gì — '+
    'đó là kế hoạch sản phẩm của Học viện. Màn này chỉ mở cho Super Admin và Admin hệ thống.');

  var DS = G.TUYEN || [], MOC = G.TUYEN_MOC || [];
  var chay = DS.filter(function(t){ return t.trangThai === 'chay'; }).length;

  var o = U.ph({eyebrow:'HỢP NHẤT HỆ THỐNG', ic:'orbit', grad:1,
    t:'Bốn tuyến chuyên môn',
    lead:'ENGWIN365 · MATH365 · SAT365 · HSA365 đang dựng chuẩn riêng, hợp nhất vào GITA365 sau. '+
         'Bảng dưới đo bằng dữ liệu đang có trong máy, không bằng cờ tự bật: mốc nào chưa xanh là '+
         'thứ đó chưa có thật.'});

  /* Hai điều đã chốt — đặt ngay đầu màn vì mọi thứ dưới đây suy ra từ chúng */
  o += '<div class="row wrap mt2" style="gap:12px">'+
    '<div class="card" style="flex:1;min-width:280px;border-left:3px solid var(--ok)">'+
      '<div class="tiny up muted">DÙNG CHUNG</div>'+
      '<b style="display:block;margin-top:4px;font-size:16px">Năm tầng T1 → T5</b>'+
      '<p class="sm mt" style="line-height:1.7">Cả bốn tuyến đi theo cùng năm tầng của GITA365. '+
      'Nhờ vậy ma trận, cổng nghiệm thu, chuẩn thời gian và cách đồng hành dùng lại được nguyên — '+
      'hợp nhất là ghép dữ liệu, không phải viết lại khung.</p></div>'+
    '<div class="card" style="flex:1;min-width:280px;border-left:3px solid var(--gita-do-ink)">'+
      '<div class="tiny up muted">RIÊNG TỪNG TUYẾN</div>'+
      '<b style="display:block;margin-top:4px;font-size:16px">Tín hiệu vào bốn băng</b>'+
      '<p class="sm mt" style="line-height:1.7">Bốn băng giữ nguyên tên và nguyên ý nghĩa hành động, '+
      'nhưng mỗi tuyến tự đặt cách đo: SAT365 đo bằng điểm thi thử, GITA365 đo bằng mức tự chủ. '+
      'Tuyến chưa có chuẩn băng thì hệ thống báo trống, KHÔNG mượn tạm băng của GITA365.</p></div>'+
  '</div>';

  o += U.sec('TRẠNG THÁI SÁU MỐC', chay + '/' + DS.length + ' tuyến đang phục vụ khách · mốc nào chưa xanh là chưa mở được cho khách');

  o += U.tbl(
    ['Tuyến','Trạng thái'].concat(MOC.map(function(m){ return m.ma; })),
    DS.map(function(t){
      var d = G.tuyenDatMoc(t.ma);
      var xong = MOC.filter(function(m){ return d[m.do]; }).length;
      return ['<b class="sm" style="color:'+t.c+'">'+h(t.ten)+'</b>'+
                '<div class="tiny muted">'+h(t.day)+'</div>',
              t.trangThai === 'chay'
                ? '<span class="chip" style="color:var(--ok);border-color:var(--ok)">Đang chạy</span>'
                : '<span class="chip" style="color:var(--gita-do-ink);border-color:var(--gita-do)">Dựng chuẩn '+xong+'/'+MOC.length+'</span>'
             ].concat(MOC.map(function(m){ return '<span class="mono">'+o1(d[m.do])+'</span>'; }));
    }));

  o += '<div class="card mt2"><div class="tiny up muted mb">SÁU MỐC NGHĨA LÀ GÌ</div>'+
    MOC.map(function(m, i){
      return '<div class="row'+(i ? ' mt2' : '')+'" style="gap:11px;align-items:flex-start">'+
        '<b class="mono" style="flex:none;color:var(--gita)">'+h(m.ma)+'</b>'+
        '<div style="flex:1"><b class="sm">'+h(m.ten)+'</b>'+
        '<p class="sm muted mt" style="line-height:1.7">'+h(m.y)+'</p></div></div>';
    }).join('') +'</div>';

  /* Gói cấp phép của từng tuyến — để anh Quang thấy bán tách được */
  o += U.sec('GÓI CẤP PHÉP CỦA TỪNG TUYẾN','Bán tuyến này mà không mở tuyến kia — mỗi tuyến một bộ gói riêng');
  o += '<div class="card"><p class="sm mb" style="line-height:1.75">'+
    'Tuyến gốc GITA365 <b>giữ nguyên tên gói cũ</b> (<span class="mono">nghe · tang1…tang5</span>) — '+
    'đây là ràng buộc cứng: đổi tên là mọi giấy phép đã cấp cho đội ngũ và cho máy khách thành giấy lộn. '+
    'Tuyến mới mang tiền tố riêng.</p>'+
    U.tbl(['Tuyến','Gói nghề','Gói năm tầng'], (G.TUYEN||[]).map(function(t){
      return ['<b class="sm" style="color:'+t.c+'">'+h(t.ma)+'</b>',
              '<span class="mono sm">'+h(G.goiNghe(t.ma))+'</span>',
              '<span class="mono sm">'+h(G.goiTang(t.ma,1))+' … '+h(G.goiTang(t.ma,5))+'</span>'];
    })) +'</div>';

  /* ── HỢP ĐỒNG RIÊNG TỪNG TUYẾN ── */
  o += U.sec('HỢP ĐỒNG RIÊNG CỦA TỪNG TUYẾN',
    'Mỗi tuyến biên soạn hợp đồng theo quy định của chính tuyến ấy — mười bốn điều chung không bỏ điều nào, bảy điều riêng không chép từ tuyến khác');

  o += '<div class="card" style="border-left:3px solid var(--gita-do-ink)">'+
    '<p class="sm" style="line-height:1.75">Bảng dưới đếm theo <b>kho hợp đồng của chính tuyến</b> '+
    '(<span class="mono">&lt;MÃ TUYẾN&gt;_HOPDONG</span>), đối chiếu với mười bốn điều ở bản chuẩn. '+
    'Chưa có kho thì thiếu cả mười bốn.</p>'+
    '<p class="sm mt" style="line-height:1.75"><b>Bản chuẩn không thay luật sư.</b> Nó là danh sách kiểm. '+
    'Điều khoản có hiệu lực phải do người có thẩm quyền pháp lý soạn và gắn với pháp nhân đứng tên — '+
    'mà pháp nhân hiện còn để trống trong <span class="mono">LICENSE</span> và <span class="mono">NOTICE</span>.</p></div>';

  o += U.tbl(['Tuyến','Học phí riêng','Hợp đồng riêng','Điều còn thiếu'],
    DS.map(function(t){
      var d = G.tuyenDatMoc(t.ma);
      var thieu = G.hdConThieu(t.ma);
      var coChuan = thieu !== null;
      return ['<b class="sm" style="color:'+t.c+'">'+h(t.ma)+'</b>',
              o1x(d.hocphi),
              o1x(d.hopdong),
              !coChuan
                ? '<span class="tiny muted">chưa mở được bản chuẩn</span>'
                : (thieu.length
                    ? '<span class="tiny mono" style="color:var(--gita-do-ink)">'+
                      thieu.length+'/14 · '+h(thieu.slice(0,6).join(' '))+
                      (thieu.length > 6 ? '…' : '')+'</span>'
                    : '<span class="tiny" style="color:var(--ok)">đủ mười bốn điều</span>')];
    }));

  o += '<div class="card mt2"><div class="tiny up muted mb">MƯỜI BỐN ĐIỀU CHUNG — KHÔNG TUYẾN NÀO ĐƯỢC BỎ</div>'+
    (G.HD_CHUAN || []).map(function(x, i){
      return '<div style="'+(i ? 'border-top:1px solid var(--line);padding-top:13px;margin-top:13px' : '')+'">'+
        '<div class="row" style="gap:9px;align-items:baseline;flex-wrap:wrap">'+
          '<b class="mono" style="color:var(--gita)">'+h(x.ma)+'</b>'+
          U.chip(x.nhom)+
          '<b class="sm" style="flex:1;min-width:200px">'+h(x.t)+'</b></div>'+
        '<p class="sm mt" style="line-height:1.7">'+h(x.y)+'</p>'+
        '<p class="sm mt" style="line-height:1.7;color:var(--gita-do-ink)"><b>Thiếu thì:</b> '+h(x.rui)+'</p></div>';
    }).join('') +'</div>';

  o += '<div class="card mt2" style="border-color:var(--gita-vien-1)">'+
    '<div class="tiny up muted mb">BẢY ĐIỀU MỖI TUYẾN TỰ QUYẾT — KHÔNG CHÉP TỪ TUYẾN KHÁC</div>'+
    (G.HD_RIENG || []).map(function(x, i){
      return '<div class="row'+(i ? ' mt2' : '')+'" style="gap:10px;align-items:flex-start">'+
        '<span style="color:var(--gita);font-weight:700;flex:none">'+(i+1)+'</span>'+
        '<div style="flex:1"><b class="sm">'+h(x.t)+'</b>'+
        '<p class="sm muted mt" style="line-height:1.7">'+h(x.y)+'</p></div></div>';
    }).join('') +'</div>';

  o += '<div class="card mt2" style="border-color:var(--gita-do)">'+
    '<div class="tiny up mb" style="color:var(--gita-do-ink)">NĂM LUẬT</div>'+
    (G.HD_LUAT || []).map(function(x, i){
      return '<div style="'+(i ? 'border-top:1px solid var(--line);padding-top:12px;margin-top:12px' : '')+'">'+
        '<b class="sm">'+h(x.t)+'</b>'+
        '<p class="sm muted mt" style="line-height:1.7">'+h(x.y)+'</p></div>';
    }).join('') +'</div>';

  /* Hình dạng chuẩn băng — để lúc mang chuẩn về là cắm vào được ngay */
  o += U.sec('CHUẨN BĂNG PHẢI CÓ ĐÚNG NHỮNG TRƯỜNG NÀY','Cùng hình dạng với băng của GITA365 thì hợp nhất là ghép, không phải nắn lại');
  o += '<div class="card">'+ U.tbl(['Trường','Phải ghi gì'],
    (G.TUYEN_BANG_TRUONG||[]).map(function(x){
      return ['<span class="mono sm'+(x.t === 'vao' ? ' b' : '')+'" style="'+
                (x.t === 'vao' ? 'color:var(--gita-do-ink)' : '')+'">'+h(x.t)+'</span>',
              '<span class="sm">'+h(x.y)+'</span>'];
    })) +'</div>';

  return o;
};

})();
