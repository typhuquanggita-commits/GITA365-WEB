/* ═══════════════════════════════════════════════════════════════
   GITA 365 — NĂNG LỰC & THĂNG HẠNG NHÂN SỰ  (Giai đoạn 3 · nối dữ liệu thật)

   NGUỒN NHÂN SỰ: G.ACCOUNTS — roster thật của hệ (mỗi vai một tài khoản,
   tên thật). Màn này lấy nhân sự cấp Giám đốc → Phân tích (bậc 3–12).

   TRUNG THỰC VỀ ĐIỂM: điểm đánh giá KHÔNG bịa cho người thật. Mỗi người
   để "Chưa chấm" cho tới khi quản lý nhập điểm thật; điểm lưu vào sổ
   G.S.nlDiem[email] và bền qua phiên (save/load). Chỉ người đã có điểm
   mới tính vào thống kê và xếp hạng.

   SÁU TRỤ: 1 test đầu vào · 2 thi tháng · 3 thăng hạng (5 cấp) · 4 hiệu
   suất→lương · 5 cảnh báo năng suất · 6 vinh danh.

   THUẬT TOÁN minh bạch:
     điểmTổng = 0.25·đầuvào + 0.40·thitháng + 0.35·hiệusuất
     cấp theo điểm: ≥90 C5 · ≥80 C4 · ≥70 C3 · ≥55 C2 · còn lại C1
     thăng hạng ĐẠT khi cấp-theo-điểm > cấp đang giữ
     cảnh báo: hiệusuất <60 đỏ · 60–74 vàng · ≥75 xanh
     vinh danh: điểmTổng ≥90 huy chương · ≥80 ngôi sao

   Quyền: dh_toan_he (Giám đốc trở lên).
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic;

  var CAP_TEN = {1:'C1 · Tập sự',2:'C2 · Thạo việc',3:'C3 · Vững nghề',4:'C4 · Chuyên sâu',5:'C5 · Bậc thầy'};
  var CAP_MAU = {1:'--t1',2:'--t2',3:'--t3',4:'--t4',5:'--t5'};
  var NGUONG   = [0,55,70,80,90];   /* điểm sàn của C1..C5 */

  /* Nhân sự thật, cấp Giám đốc→Phân tích (bậc 3–12). */
  function roster(){
    return (G.ACCOUNTS || []).filter(function(a){
      var r = G.roleById(a.role); return r && r.lv >= 3 && r.lv <= 12;
    });
  }
  function diemCua(u){ return (G.S.nlDiem || {})[u] || null; }

  function capTheoDiem(d){ return d>=90?5:d>=80?4:d>=70?3:d>=55?2:1; }
  function diemTong(d){ return Math.round(0.25*d.dv + 0.40*d.tt + 0.35*d.hs); }
  function denCanhBao(hs){ return hs<60?{m:'--gita-do-ink',t:'Rủi ro',k:'đỏ'}:hs<75?{m:'--warn',t:'Theo dõi',k:'vàng'}:{m:'--ok',t:'Ổn định',k:'xanh'}; }
  function vinhDanh(dt){ return dt>=90?{t:'Huy chương',ic:'crown'}:dt>=80?{t:'Ngôi sao',ic:'star'}:null; }
  function luongDeXuat(hs,thang){ return thang?{t:'Đề xuất tăng bậc lương',c:'--ok'}:(hs>=75?{t:'Giữ bậc · xét kỳ tới',c:'--warn'}:{t:'Chưa xét tăng',c:'--gita-do-ink'}); }

  /* Tính gộp một người đã có điểm. */
  function danhGia(d){
    var dt = diemTong(d), capD = capTheoDiem(dt), capG = d.cap || 1;
    return { dt:dt, capD:capD, capG:capG, thang:capD>capG,
             den:denCanhBao(d.hs), vd:vinhDanh(dt) };
  }

  function pin(txt, mau){ return '<span class="nl-pin" style="--m:var('+mau+')">'+h(txt)+'</span>'; }

  /* ── Nhập / sửa điểm (modal có ô nhập) ── */
  G.nlNhap = function(u){
    var a = (G.ACCOUNTS||[]).filter(function(x){return x.u===u;})[0]; if(!a) return;
    var role = G.roleById(a.role) || {n:a.role,c:'var(--gita)'};
    var d = diemCua(u) || {cap:1,dv:'',tt:'',hs:'',xu:0,lt:0};
    function num(id,lbl,val,mx){ return '<label class="nl-f"><span>'+h(lbl)+'</span>'+
      '<input type="number" id="'+id+'" min="0" max="'+(mx||100)+'" value="'+(val===''?'':h(String(val)))+'" placeholder="0–'+(mx||100)+'"></label>'; }
    var capOpts = [1,2,3,4,5].map(function(c){return '<option value="'+c+'"'+(d.cap==c?' selected':'')+'>'+h(CAP_TEN[c])+'</option>';}).join('');
    var html =
      '<div class="nl-hs"><div class="nl-hh">'+ic('edit')+'<div><b>Nhập điểm · '+h(a.ten)+'</b>'+
        '<span><span class="nl-vai" style="--vc:'+(role.c||'var(--gita)')+'">'+h(role.n)+'</span> · '+h(a.nha||'')+'</span></div></div>'+
      '<div class="nl-form">'+
        '<label class="nl-f"><span>Cấp đang giữ</span><select id="nl-cap">'+capOpts+'</select></label>'+
        num('nl-dv','1 · Test đầu vào (0–100)', d.dv)+
        num('nl-tt','2 · Thi tháng gần nhất (0–100)', d.tt)+
        num('nl-hs','4 · Hiệu suất công việc (0–100)', d.hs)+
        num('nl-xu','Xu hướng thi so với kỳ trước (±)', d.xu, 100)+
        num('nl-lt','Số tháng liên tục đạt', d.lt, 120)+
      '</div>'+
      '<div class="row mt" style="gap:8px;justify-content:flex-end">'+
        '<button class="btn ghost sm" data-act="dong-modal">Huỷ</button>'+
        '<button class="btn sm" data-nlluu="'+h(u)+'">'+ic('check','w-3 h-3')+'Lưu điểm</button>'+
      '</div></div>';
    if(U.modal) U.modal(html);
  };

  function lay(id){ var e=document.getElementById(id); return e?e.value:''; }
  function son(v,mx){ v=parseInt(v,10); if(isNaN(v))v=0; return Math.max(0,Math.min(mx||100,v)); }
  G.nlLuu = function(u){
    if(!G.S.nlDiem) G.S.nlDiem = {};
    var xu = parseInt(lay('nl-xu'),10); if(isNaN(xu)) xu=0; xu=Math.max(-100,Math.min(100,xu));
    G.S.nlDiem[u] = { cap:son(lay('nl-cap'),5)||1, dv:son(lay('nl-dv')), tt:son(lay('nl-tt')),
                      hs:son(lay('nl-hs')), xu:xu, lt:son(lay('nl-lt'),120),
                      capNhat: Date.now() };
    if(G.save) G.save();
    if(U.closeModal) U.closeModal();
    if(G.render) G.render();
    if(U.toast) U.toast('Đã lưu điểm đánh giá','ok');
  };

  /* ── Hồ sơ năng lực một người ── */
  G.nlHoSo = function(u){
    var a = (G.ACCOUNTS||[]).filter(function(x){return x.u===u;})[0]; if(!a) return;
    var role = G.roleById(a.role) || {n:a.role,c:'var(--gita)'};
    var d = diemCua(u);
    if(!d){
      var htmlC =
        '<div class="nl-hs"><div class="nl-hh">'+ic('users')+'<div><b>'+h(a.ten)+'</b>'+
          '<span><span class="nl-vai" style="--vc:'+(role.c||'var(--gita)')+'">'+h(role.n)+'</span> · '+h(a.nha||'')+'</span></div></div>'+
        '<div class="card pad-sm" style="border-color:var(--warn)"><b class="sm">'+ic('alert','w-4 h-4')+' Chưa chấm điểm</b>'+
          '<p class="sm mt">Người này chưa có dữ liệu đánh giá. Nhập điểm thật để hệ tính cấp, thăng hạng, lương và cảnh báo.</p>'+
          '<div class="row mt"><button class="btn sm" data-nlnhap="'+h(u)+'">'+ic('edit','w-3 h-3')+'Nhập điểm</button></div></div></div>';
      if(U.modal) U.modal(htmlC); return;
    }
    var g = danhGia(d), capKe = Math.min(5, g.capG+1);
    function dong(l,v){ return '<div class="nl-hr"><span>'+h(l)+'</span><div>'+v+'</div></div>'; }
    var luong = luongDeXuat(d.hs, g.thang);
    var html =
      '<div class="nl-hs" style="--c:var('+(CAP_MAU[g.capG]||'--t1')+')">'+
        '<div class="nl-hh">'+ic('users')+'<div><b>'+h(a.ten)+'</b>'+
          '<span><span class="nl-vai" style="--vc:'+(role.c||'var(--gita)')+'">'+h(role.n)+'</span> · '+CAP_TEN[g.capG]+' · '+h(a.nha||'')+'</span></div>'+
          (g.vd?'<span class="nl-vd">'+ic(g.vd.ic)+h(g.vd.t)+'</span>':'')+'</div>'+
        '<div class="grid g3 nl-st">'+
          U.stat({k:'Điểm tổng hợp',v:String(g.dt),d:'trên 100',c:g.dt>=80?'#0B7350':g.dt>=70?'#B4720F':'#BE0E16'})+
          U.stat({k:'Cấp theo điểm',v:'C'+g.capD,d:g.thang?'đủ thăng hạng ▲':'giữ cấp',c:g.thang?'#0B7350':'#44556f'})+
          U.stat({k:'Năng suất',v:g.den.k,d:g.den.t,c:'var('+g.den.m+')'})+
        '</div>'+
        '<div class="nl-hg">'+
          dong('1 · Test đầu vào', pin(d.dv+'/100', d.dv>=75?'--ok':'--warn'))+
          dong('2 · Thi tháng gần nhất', pin(d.tt+'/100 '+(d.xu>=0?'▲'+d.xu:'▼'+(-d.xu)), d.tt>=75?'--ok':'--gita-do-ink')+' <span class="dim sm">· '+d.lt+' tháng liên tục đạt</span>')+
          dong('3 · Thăng hạng nghiệp vụ', g.thang?pin('ĐẠT chuẩn '+CAP_TEN[capKe],'--ok'):pin('Giữ '+CAP_TEN[g.capG],'--warn')+' <span class="dim sm">· cần '+Math.max(0,(NGUONG[capKe-1]||90)-g.dt)+' điểm nữa</span>')+
          dong('4 · Hiệu suất → Lương', pin(luong.t, luong.c))+
          dong('5 · Cảnh báo năng suất', pin(g.den.t+' ('+g.den.k+')', g.den.m)+(d.hs<75?' <span class="dim sm">· lên lịch kèm cặp</span>':''))+
          dong('6 · Vinh danh', g.vd?pin(g.vd.t,'--t5'):'<span class="dim sm">Chưa đạt mốc vinh danh (cần điểm tổng ≥ 80)</span>')+
        '</div>'+
        '<div class="row mt" style="gap:8px;justify-content:flex-end"><button class="btn ghost sm" data-nlnhap="'+h(u)+'">'+ic('edit','w-3 h-3')+'Sửa điểm</button></div>'+
      '</div>';
    if(U.modal) U.modal(html);
  };

  G.VIEWS['nang-luc-ns'] = function(){
    var ds = roster();
    var cham = ds.map(function(a){ var d=diemCua(a.u); return {a:a,d:d,g:d?danhGia(d):null}; });
    var daCham = cham.filter(function(x){return x.d;});
    var datTH = daCham.filter(function(x){return x.g.thang;}).length;
    var dCanh = daCham.filter(function(x){return x.d.hs<75;}).length;
    var dVinh = daCham.filter(function(x){return x.g.vd;}).length;

    var head = U.ph ? U.ph({eyebrow:'ĐÁNH GIÁ & THĂNG HẠNG', ic:'chart', grad:1,
      t:'Năng lực & Thăng hạng', lead:'Nhân sự thật từ roster hệ thống (Giám đốc → Phân tích dữ liệu). Sáu trụ: test đầu vào, thi tháng, thăng hạng, lương, cảnh báo năng suất, vinh danh. Bấm một người để xem hoặc nhập điểm.'})
      : '<h2>Năng lực & Thăng hạng</h2>';

    var tk = '<div class="grid g4 mb">'+
      U.stat({k:'Nhân sự',v:String(ds.length),d:'Giám đốc → Phân tích'})+
      U.stat({k:'Đã chấm',v:daCham.length+'/'+ds.length,d:daCham.length<ds.length?'cần chấm tiếp':'đủ',c:daCham.length===ds.length?'#0B7350':'#B4720F'})+
      U.stat({k:'Đủ thăng hạng',v:String(datTH),d:'vượt chuẩn cấp kế',c:'#0B7350'})+
      U.stat({k:'Cảnh báo / Vinh danh',v:dCanh+' / '+dVinh,d:'cần cải thiện / điểm ≥80',c:dCanh?'#B4720F':'#0B7350'})+'</div>';

    var legend = '<div class="nl-tru">'+
      [['1','Test đầu vào','seed'],['2','Thi tháng','pulse'],['3','Thăng hạng','crown'],
       ['4','Lương','chart'],['5','Cảnh báo','alert'],['6','Vinh danh','star']]
      .map(function(t){return '<span class="nl-trui">'+ic(t[2],'w-3 h-3')+'<b>'+t[0]+'</b> '+h(t[1])+'</span>';}).join('')+'</div>';

    var body = cham.map(function(x,i){
      var a=x.a, role=G.roleById(a.role)||{n:a.role,c:'var(--gita)'};
      var nameCell = '<td data-nlhs="'+h(a.u)+'" style="cursor:pointer"><b>'+h(a.ten)+'</b><br>'+
        '<span class="nl-vai sm" style="--vc:'+(role.c||'var(--gita)')+'">'+h(role.n)+'</span></td>';
      if(!x.d){
        return '<tr class="nl-row nl-chua">'+
          '<td class="mono dim">'+(i+1)+'</td>'+ nameCell +
          '<td colspan="6" class="dim sm">Chưa chấm điểm</td>'+
          '<td class="ta-c"><button class="btn sm" data-nlnhap="'+h(a.u)+'">'+ic('edit','w-3 h-3')+'Nhập</button></td></tr>';
      }
      var d=x.d, g=x.g;
      return '<tr class="nl-row" data-nlhs="'+h(a.u)+'">'+
        '<td class="mono dim">'+(i+1)+'</td>'+ nameCell +
        '<td><span class="nl-cap" style="--m:var('+(CAP_MAU[g.capG]||'--t1')+')">'+h(CAP_TEN[g.capG])+'</span></td>'+
        '<td class="ta-c">'+pin(d.dv, d.dv>=75?'--ok':'--warn')+'</td>'+
        '<td class="ta-c">'+pin(d.tt+' '+(d.xu>=0?'▲':'▼'), d.tt>=75?'--ok':'--gita-do-ink')+'</td>'+
        '<td class="ta-c">'+(g.thang?pin('ĐẠT ▲','--ok'):'<span class="dim sm">giữ cấp</span>')+'</td>'+
        '<td class="ta-c">'+pin(g.dt, g.dt>=80?'--ok':g.dt>=70?'--warn':'--gita-do-ink')+'</td>'+
        '<td class="ta-c"><span class="nl-den" style="--m:var('+g.den.m+')" title="'+h(g.den.t)+'"></span> <span class="sm">'+h(g.den.t)+'</span></td>'+
        '<td class="ta-c">'+(g.vd?'<span class="nl-vds">'+ic(g.vd.ic,'w-3 h-3')+h(g.vd.t)+'</span>':'<span class="dim">—</span>')+'</td>'+
      '</tr>';
    }).join('');

    var bang = '<div class="nl-wrap"><table class="nl-tb"><thead><tr>'+
      '<th>STT</th><th>Nhân sự</th><th>Cấp đang giữ</th><th>Đầu vào</th><th>Thi tháng</th>'+
      '<th>Thăng hạng</th><th>Điểm tổng</th><th>Năng suất</th><th>Vinh danh</th>'+
      '</tr></thead><tbody>'+body+'</tbody></table></div>';

    return head + tk + legend +
      (U.sec?U.sec('Bảng đánh giá nhân sự','Người thật từ hệ · bấm một dòng để xem hoặc nhập điểm đánh giá'):'') +
      bang;
  };

})();
