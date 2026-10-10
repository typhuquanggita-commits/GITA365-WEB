/* ═══════════════════════════════════════════════════════════════
   GITA 365 — BÁO CÁO THÁNG CỦA NHÀ MÌNH (màn ho-so-thang · R13/R14)

   Nhà xem bản RÚT GỌN của hồ sơ đo lường: gắn kết, tiến bộ, từng số đo
   so với mục tiêu tháng, thời gian theo nhóm trải nghiệm, xu hướng sáu
   tháng, các tháng đã chốt — và gửi phiếu hài lòng tháng (NPS + CSAT).
   Không hiện điểm tiềm năng, rủi ro hay tầng chăm sóc: đó là công cụ của
   đội để phân bổ giờ Coach, không phải nhãn dán lên một gia đình.

   Chưa có phiên máy chủ: tính từ số đo ngay trên máy này (đồng hồ thật +
   bài đã làm) và nói rõ phần nào chỉ máy chủ mới có.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
(function(){
  var U = G.U, h = U.h, ic = U.ic, VIEW = 'ho-so-thang';
  G.VIEWS = G.VIEWS || {};
  var st = { ai:'', ho:null, ls:null, tai:0, loi:'', nps:null, csat:null, tc:[], daGui:'', ghi:'' };
  /* Năm tiêu chí của phiếu tháng — bản đối chiếu của may-chu/xep-hang-luong.js →
     TIEU_CHI; tools/thu-xep-hang.mjs so hai bản từng ô. Phiếu là căn cứ lương
     thưởng của người đồng hành, nên mỗi câu hỏi về một việc nhà mình THẤY được. */
  G.XH_TIEU_CHI = [
    { ma:'T1', ten:'Người đồng hành lắng nghe và hiểu đúng nhà mình' },
    { ma:'T2', ten:'Đúng hẹn, giữ lời đã hứa' },
    { ma:'T3', ten:'Hướng dẫn rõ ràng, nhà mình làm theo được' },
    { ma:'T4', ten:'Nhà mình thấy thay đổi thật ở con hoặc ở nếp nhà' },
    { ma:'T5', ten:'Tôn trọng, không phán xét, không so sánh nhà mình với nhà khác' }
  ];
  function coMayChu(){ return !!(G.DLG && G.DLG.coMayChu()); }
  function so(n){ return n == null ? '—' : Math.round(Number(n) || 0).toLocaleString('vi-VN'); }
  function haiSo(n){ return (n < 10 ? '0' : '') + n; }
  function thangNay(){ var d = new Date(); return d.getFullYear() + '-' + haiSo(d.getMonth()+1); }
  function tenThang(t){ var a = String(t||'').split('-'); return a.length === 2 ? 'Tháng ' + (+a[1]) + '/' + a[0] : t; }
  function veLai(){ if(G.render && G.S && G.S.view === VIEW) G.render(); }

  /* Số đo của chính máy này cho tháng đang chạy */
  function soDoMay(){
    var DL = G.DL, th = thangNay(), tg = G.DLG ? G.DLG.thoiGian(31) : {}, ngay = {}, pn = { hoc:0, thucHanh:0, baoCao:0, ketNoi:0, khac:0 }, tong = 0;
    Object.keys(tg).forEach(function(n){
      if(n.slice(0, 7) !== th) return;
      if((tg[n].__tong || 0) > 0) ngay[n] = 1;
      tong += tg[n].__tong || 0;
      Object.keys(tg[n]).forEach(function(m){ if(m !== '__tong') pn[DL.nhomCuaMan(m)] += tg[n][m]; });
    });
    var sk = (G.DLG ? G.DLG.suKien() : []).filter(function(s){ return String(s.ngay).slice(0, 7) === th; });
    sk.forEach(function(s){ ngay[s.ngay] = 1; });
    var xong = sk.filter(function(s){ return ['bai_hoc','sat_hach','test','bai_thi'].indexOf(s.loai) >= 0; });
    var coDiem = sk.filter(function(s){ return s.loai === 'sat_hach' || s.loai === 'test'; });
    var cx = sk.filter(function(s){ return s.loai === 'cam_xuc'; });
    Object.keys(pn).forEach(function(k){ pn[k] = Math.round(pn[k] / 60); });
    var d = { thang:th, soNgayThang:new Date().getDate(), ngayHoatDong:Object.keys(ngay).length, phutApp:Math.round(tong / 60), phutHocApp:pn.hoc, phutNhom:pn,
      hoanThanh:xong.length, diemTB:coDiem.length ? Math.round(coDiem.reduce(function(a, s){ return a + s.giaTri; }, 0) / coDiem.length) : null,
      nhatKy:sk.filter(function(s){ return s.loai === 'nhat_ky'; }).length, camXuc:cx.length ? cx.reduce(function(a, s){ return a + s.giaTri; }, 0) / cx.length : null,
      ngayTick:null, soBaoCao:null, viecDuyet:null };
    var diem = DL.chamDiem(d, null);
    d.phutHoc = diem.phutHoc; d.diem = { ganKet:diem.ganKet, tienBo:diem.tienBo }; d.muc = DL.MUC; d.mayNay = true;
    return d;
  }
  function tai(){
    if(!coMayChu() || st.tai) return;
    st.tai = 2; st.loi = '';
    G.goiMayChu('hoSoDoLuongKH', {}, { moi:true }).then(function(r){ st.tai--; if(r && r.ok) st.ho = r; else st.loi = (r && r.error) || 'Chưa đọc được hồ sơ.'; veLai(); });
    G.goiMayChu('dsHoSoThang', {}, { moi:true }).then(function(r){ st.tai--; st.ls = r && r.ok ? r : { ds:[] }; veLai(); });
  }

  function bieuDo(xu){
    var W = 340, H = 140, l = 30, r = 22, t = 12, b = 26, n = xu.length; if(!n) return '';
    var x = function(i){ return l + (n === 1 ? (W - l - r) / 2 : i * (W - l - r) / (n - 1)); }, y = function(v){ return t + (100 - v) * (H - t - b) / 100; };
    var cot = [['ganKet','Gắn kết','#185AB4'], ['tienBo','Tiến bộ','#0B7350']];
    var o = '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Gắn kết và tiến bộ sáu tháng" style="width:100%;max-width:520px;height:auto;color:var(--ink-3,#556)">';
    [0, 50, 100].forEach(function(v){ o += '<line x1="'+l+'" x2="'+(W-r)+'" y1="'+y(v)+'" y2="'+y(v)+'" stroke="currentColor" stroke-opacity=".18"/><text x="'+(l-6)+'" y="'+(y(v)+4)+'" font-size="10" text-anchor="end" fill="currentColor">'+v+'</text>'; });
    xu.forEach(function(p, i){ o += '<text x="'+x(i)+'" y="'+(H-8)+'" font-size="10" text-anchor="middle" fill="currentColor">'+h(String(p.thang).slice(5))+'/'+h(String(p.thang).slice(2,4))+'</text>'; });
    cot.forEach(function(c){
      var pts = xu.map(function(p, i){ return p[c[0]] == null ? null : [x(i), y(p[c[0]])]; }).filter(Boolean); if(!pts.length) return;
      o += '<polyline fill="none" stroke="'+c[2]+'" stroke-width="2.2" stroke-linejoin="round" points="'+pts.map(function(p){ return p[0].toFixed(1)+','+p[1].toFixed(1); }).join(' ')+'"/>';
      var e = pts[pts.length-1]; o += '<circle cx="'+e[0].toFixed(1)+'" cy="'+e[1].toFixed(1)+'" r="3.6" fill="'+c[2]+'"/>';
    });
    return o + '</svg><div class="co-hang tiny">'+cot.map(function(c){ return '<span class="co-hang" style="gap:5px"><i style="display:inline-block;width:12px;height:3px;border-radius:2px;background:'+c[2]+'"></i>'+h(c[1])+'</span>'; }).join('')+'</div>';
  }

  G.VIEWS[VIEW] = function(){
    if(!G.DL) return U.lockCard('Thiếu công thức đo lường.');
    if(!(typeof G.laKhachCredit === 'function' && G.laKhachCredit())) return U.lockCard('Báo cáo tháng này dành cho gia đình (Phụ huynh · Học viên). Đội dẫn dắt xem ở màn Đo lường toàn diện khách hàng.');
    var ai = String((G.S && G.S.acc && G.S.acc.u) || '');
    if(st.ai !== ai){ st = { ai:ai, ho:null, ls:null, tai:0, loi:'', nps:null, csat:null, tc:[], daGui:'', ghi:'' }; }
    var server = coMayChu();
    if(server && !st.ho && !st.loi) tai();
    var x = server && st.ho ? st.ho.ho : soDoMay();
    var o = U.ph({ eyebrow:'NHÀ MÌNH · BÁO CÁO THÁNG', ic:'chart', grad:1, t:'Báo cáo tháng của nhà mình',
      lead:'Thời gian học, việc thực hành, báo cáo và tiến bộ của nhà mình trong tháng — để Coach dựng lộ trình đúng chỗ nhà mình cần. Chỉ so nhà mình với chính nhà mình tháng trước, không so với nhà khác.' });
    if(!server) o += '<div class="co-mau">'+ic('alert','w-4 h-4')+'<span>Đang tính từ số đo <b>trên máy này</b> (đồng hồ thật và bài đã làm). Tick việc hôm nay, báo cáo ngày và việc được Coach duyệt nằm ở máy chủ — đăng nhập bằng tài khoản thật của nhà mình để xem đủ.</span></div>';
    else if(st.tai && !st.ho) o += '<p class="sm muted">Đang đọc hồ sơ từ máy chủ…</p>';
    else if(st.loi) o += '<div class="co-mau">'+ic('alert','w-4 h-4')+'<span>'+h(st.loi)+' Đang hiện số đo trên máy này.</span></div>';
    var tt = G.DLG ? G.DLG.trangThai() : {};
    if(server) o += '<div class="co-hang mb"><span class="tiny muted">'+(tt.lanCuoi ? 'Đã gửi số đo lúc '+h(tt.lanCuoi.toLocaleTimeString('vi-VN')) : 'Số đo tự gửi mỗi 10 phút.')+(tt.loi ? ' · '+h(tt.loi) : '')+'</span>'+
      '<button class="btn ghost sm" data-hst="gui">'+ic('orbit','w-3 h-3')+'Gửi số đo ngay</button></div>';

    var he = Math.min(1, Math.max(x.soNgayThang || 30, 10) / 30), M = x.muc || G.DL.MUC;
    o += '<div class="grid g2 mb"><div class="card pad-sm center">'+U.ring(x.diem.ganKet == null ? 0 : x.diem.ganKet, '#185AB4', 'Gắn kết')+'</div><p class="tiny muted" style="margin:6px 0 0">Có mặt, học, tick việc, báo cáo</p></div>'+
      '<div class="card pad-sm center"><div style="display:flex;justify-content:center">'+U.ring(x.diem.tienBo == null ? 0 : x.diem.tienBo, '#0B7350', 'Tiến bộ')+'</div><p class="tiny muted" style="margin:6px 0 0">Bài hoàn thành, điểm, việc đạt, đều đặn</p></div></div>';
    var dong = [
      ['Ngày có hoạt động', x.ngayHoatDong, M.ngayHoatDong, 'ngày'], ['Phút học', x.phutHoc, M.phutHoc, 'phút'], ['Ngày tick việc hôm nay', x.ngayTick, M.ngayTick, 'ngày'],
      ['Báo cáo ngày', x.soBaoCao, M.baoCao, 'báo cáo'], ['Việc được Coach duyệt', x.viecDuyet, M.viecDuyet, 'việc'], ['Bài hoàn thành', x.hoanThanh, M.hoanThanh, 'bài']
    ];
    o += '<div class="card pad-sm mb"><b class="sm">So với mục tiêu '+(x.soNgayThang && x.soNgayThang < 28 ? 'tới hôm nay' : 'tháng')+'</b><div class="mt">'+dong.map(function(d){
      var muc = Math.max(1, Math.round(d[2] * he));
      return '<div class="mb"><div class="co-hang sm"><span class="co-grow">'+h(d[0])+'</span><b class="co-so">'+(d[1] == null ? '<span class="tiny muted">ở máy chủ</span>' : so(d[1])+' / '+so(muc)+' '+h(d[3]))+'</b></div>'+(d[1] == null ? '' : U.bar(Math.round(100 * d[1] / muc), '#185AB4'))+'</div>'; }).join('')+'</div>'+
      '<p class="tiny muted" style="margin:0">Mục tiêu cả tháng: '+M.ngayHoatDong+' ngày · '+M.phutHoc+' phút học · '+M.ngayTick+' ngày tick · '+M.baoCao+' báo cáo · '+M.viecDuyet+' việc duyệt · '+M.hoanThanh+' bài. Tháng đang chạy thì mục tiêu co theo số ngày đã qua.</p></div>';
    var pn = x.phutNhom || {}, tong = Object.keys(pn).reduce(function(s, k){ return s + (pn[k] || 0); }, 0) || 1, TN = G.DL.TEN_NHOM;
    o += '<div class="grid g2 mb"><div class="card pad-sm"><b class="sm">Thời gian theo nhóm trải nghiệm</b><div class="mt">'+['hoc','thucHanh','baoCao','ketNoi','khac'].map(function(k){
      return '<div class="mb"><div class="co-hang sm"><span class="co-grow">'+h(TN[k])+'</span><b class="co-so">'+so(pn[k])+' phút</b></div>'+U.bar(Math.round(100 * (pn[k]||0) / tong))+'</div>'; }).join('')+'</div>'+
      '<div class="co-dong"><span class="co-grow sm">Điểm trung bình test · sát hạch</span><b class="co-so sm">'+so(x.diemTB)+'</b></div>'+
      '<div class="co-dong"><span class="co-grow sm">Tối có ghi nhật ký</span><b class="co-so sm">'+so(x.nhatKy)+'</b></div>'+
      (x.creditThuong != null ? '<div class="co-dong"><span class="co-grow sm">Credit thưởng trong tháng</span><b class="co-so sm">'+so(x.creditThuong)+'</b></div>' : '')+'</div>';
    var xu = server && st.ho ? st.ho.xuHuong : [];
    o += '<div class="card pad-sm"><b class="sm">Sáu tháng gần nhất</b>'+(xu.length > 1 ? bieuDo(xu) : '<p class="tiny muted">Có từ hai tháng số đo trở lên thì đường xu hướng hiện ở đây.</p>')+'</div></div>';

    /* Phiếu hài lòng tháng */
    o += '<div class="card mb"><b>Nhà mình thấy tháng này thế nào?</b><p class="sm muted" style="margin:4px 0 10px">Mỗi tháng một lần. Học viện đọc từng phiếu để sửa chương trình và làm sản phẩm mới.</p>'+
      '<div class="sm mb">Khả năng nhà mình giới thiệu GITA365 cho một gia đình khác <span class="tiny muted">(0 = không bao giờ · 10 = chắc chắn)</span></div>'+
      '<div class="co-hang mb" role="group" aria-label="Điểm giới thiệu">'+[0,1,2,3,4,5,6,7,8,9,10].map(function(n){ return '<button class="btn sm '+(st.nps===n?'':'ghost')+'" data-hst="nps" data-v2="'+n+'" aria-pressed="'+(st.nps===n)+'">'+n+'</button>'; }).join('')+'</div>'+
      '<div class="sm mb">Mức hài lòng với tháng này</div><div class="co-hang mb" role="group" aria-label="Mức hài lòng">'+[[1,'Rất không hài lòng'],[2,'Chưa hài lòng'],[3,'Tạm được'],[4,'Hài lòng'],[5,'Rất hài lòng']].map(function(c){
        return '<button class="btn sm '+(st.csat===c[0]?'':'ghost')+'" data-hst="csat" data-v2="'+c[0]+'" aria-pressed="'+(st.csat===c[0])+'">'+c[0]+' · '+h(c[1])+'</button>'; }).join('')+'</div>'+
      '<div class="sm mb">Năm điều về người đồng hành tháng này <span class="tiny muted">(1 = chưa có · 5 = rất rõ)</span></div>'+
      G.XH_TIEU_CHI.map(function(t, i){
        return '<div class="mb"><div class="tiny">'+h(t.ten)+'</div><div class="co-hang" role="group" aria-label="'+h(t.ten)+'">'+[1,2,3,4,5].map(function(n){
          return '<button class="btn sm '+(st.tc[i]===n?'':'ghost')+'" data-hst="tc" data-i="'+i+'" data-v2="'+n+'" aria-pressed="'+(st.tc[i]===n)+'">'+n+'</button>'; }).join('')+'</div></div>'; }).join('')+
      '<label class="co-f"><span class="sm">Một điều nhà mình muốn Học viện biết <span class="tiny muted">(không bắt buộc)</span></span><textarea class="inp" id="hst-ghi" rows="3" maxlength="1000">'+h(st.ghi)+'</textarea></label>'+
      '<p class="tiny muted">Phiếu ghi kèm người đồng hành của nhà mình tháng này và là một căn cứ đánh giá công việc của họ.</p>'+
      '<div class="co-hang mt"><button class="btn pri sm" data-hst="gui-phieu">Gửi phiếu tháng '+(+thangNay().slice(5))+'</button>'+(st.daGui ? '<span class="tiny" style="color:#0B7350">'+h(st.daGui)+'</span>' : '')+'</div></div>';

    var ls = st.ls && st.ls.ds ? st.ls.ds : [];
    if(server) o += '<div class="card pad-sm mb"><b class="sm">Các tháng đã chốt</b>'+(ls.length ? ls.map(function(z){ return '<div class="co-dong"><span class="co-grow sm">'+tenThang(z.thang)+'</span><span class="tiny muted">'+so(z.ngayHoatDong)+' ngày · '+so(z.phutHoc)+' phút học · '+so(z.hoanThanh)+' bài</span><b class="co-so sm">GK '+so(z.diem && z.diem.ganKet)+' · TB '+so(z.diem && z.diem.tienBo)+'</b></div>'; }).join('') : '<p class="tiny muted">Hồ sơ tháng được chốt vào đầu tháng sau.</p>')+'</div>';
    return o;
  };

  document.addEventListener('click', function(e){
    var el = e.target.closest && e.target.closest('[data-hst]'); if(!el) return;
    var a = el.getAttribute('data-hst'), v = Number(el.getAttribute('data-v2')); e.preventDefault();
    var o = document.getElementById('hst-ghi'); if(o) st.ghi = String(o.value || '').slice(0, 1000);
    if(a === 'nps') st.nps = v;
    else if(a === 'csat') st.csat = v;
    else if(a === 'tc') st.tc[Number(el.getAttribute('data-i'))] = v;
    else if(a === 'gui'){ if(G.DLG) G.DLG.gui(true).then(function(r){ if(r && r.ok){ U.toast('Đã gửi số đo.', 'ok'); st.ho = null; st.loi = ''; } else if(r && !r.boQua) U.toast((r && r.error) || 'Chưa gửi được.', 'err'); veLai(); }); return; }
    else if(a === 'gui-phieu'){
      if(st.nps == null || st.csat == null){ U.toast('Chọn điểm giới thiệu và mức hài lòng trước khi gửi.', 'err'); return; }
      for(var i = 0; i < G.XH_TIEU_CHI.length; i++) if(!st.tc[i]){ U.toast('Chấm đủ năm điều về người đồng hành trước khi gửi.', 'err'); return; }
      if(!coMayChu()){ U.toast('Phiếu cần tài khoản thật của nhà mình trên máy chủ.', 'err'); return; }
      var g = document.getElementById('hst-ghi');
      G.goiMayChu('guiDanhGiaKH', { nps:st.nps, csat:st.csat, tieuChi:st.tc.slice(0, G.XH_TIEU_CHI.length), ghiChu:g ? String(g.value || '').slice(0, 1000) : '' }).then(function(r){
        if(r && r.ok){ st.daGui = 'Đã nhận phiếu '+tenThang(r.thang)+'. Cảm ơn nhà mình.'; st.ghi = ''; U.toast('Đã gửi phiếu hài lòng.', 'ok'); }
        else U.toast((r && r.error) || 'Chưa gửi được phiếu.', 'err');
        veLai();
      });
      return;
    }
    veLai();
  });
})();
