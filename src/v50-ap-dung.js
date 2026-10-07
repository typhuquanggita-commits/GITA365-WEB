/* ═══════════════════════════════════════════════════════════════
   GITA 365 — V50 · ĐỘNG CƠ ÁP DỤNG + THƯ VIỆN VẬN HÀNH

   Màn học thuyết cũ chỉ để ĐỌC: không bấm được việc gì, không ai biết
   đội đã làm theo hay chưa. V50 nâng cả 154 màn bằng MỘT động cơ thay vì
   vá từng màn:
     · Thanh ÁP DỤNG ở đầu mỗi màn học thuyết (app.js chèn qua G.v50Thanh):
       cụm của màn · điểm áp dụng của tôi · chỉ số chịu tác động ở Trung tâm
       đo lường · nút Tự soát.
     · Tự soát: bảng 5–6 việc của cụm, mỗi việc bốn trạng thái (đã làm ·
       đang làm · chưa · không liên quan) → điểm 0–100, lưu máy chủ
       (ghiApDung) để Super Admin thấy học thuyết nào còn nằm trên giấy.
     · Thư viện vận hành (thu-vien-v50): 14 cụm, tìm nhanh, mức áp dụng toàn
       đội (R01–R03, tongApDung), danh sách màn đã gộp và nút tắt V50.
   Không có máy chủ (bản thử) → bảng tự soát lưu trên máy này; số toàn đội
   hiện VÍ DỤ MINH HOẠ có nhãn rõ.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic;
  var VIEW = 'thu-vien-v50';
  var st = { ai:'', bang:null, daTaiMay:false, tong:null, taiTong:false, loiTong:'', soat:null, soatTT:null };

  function V(){ return G.V50; }
  function lv(){ var r = G.S && G.S.roleObj; return r && r.lv ? r.lv : 99; }
  function ten(){ return String((G.S && G.S.acc && G.S.acc.u) || ''); }
  function coMayChu(){ return !!(G.API_CAP_PHEP && G.PHIEN_TOKEN); }
  function laQL(){ return lv() <= 3; }
  function kpiDef(ma){ var T = G.TU; if(!T) return null; for(var i = 0; i < T.KPI.length; i++) if(T.KPI[i].ma === ma) return T.KPI[i]; return null; }
  function khoiDef(ma){ var T = G.TU; if(!T) return null; for(var i = 0; i < T.KHOI.length; i++) if(T.KHOI[i].ma === ma) return T.KHOI[i]; return null; }
  function veLai(){ if(G.render) G.render(); }
  function so(n){ return Number(n).toLocaleString('vi-VN'); }

  /* ── Bảng tự soát của tôi: máy này + máy chủ (bản mới hơn thắng) ── */
  function khoaMay(){ return 'gita_v50_ad:' + ten(); }
  function canBang(){
    if(st.ai !== ten() + '|' + lv()){ st = { ai:ten() + '|' + lv(), bang:null, daTaiMay:false, tong:null, taiTong:false, loiTong:'', soat:null, soatTT:null }; }
    if(!st.bang){
      st.bang = {};
      try { var s = localStorage.getItem(khoaMay()); if(s) st.bang = JSON.parse(s) || {}; } catch(e){ st.bang = {}; }
    }
    if(coMayChu() && !st.daTaiMay && V().laNhanSu()){
      st.daTaiMay = true;
      G.goiMayChu('docApDung', {}).then(function(r){
        if(!r || !r.ok) return;
        var doi = false;
        (r.ds || []).forEach(function(x){
          var co = st.bang[x.cum];
          if(!co || String(co.luc || '') < String(x.luc || '')){ st.bang[x.cum] = { tt:x.tt, diem:x.diem, luc:x.luc }; doi = true; }
        });
        if(doi){ luuMay(); if(G.S && (G.S.view === VIEW || V().cumCua(G.S.view))) veLai(); }
      });
    }
    return st.bang;
  }
  function luuMay(){ try { localStorage.setItem(khoaMay(), JSON.stringify(st.bang || {})); } catch(e){} }
  function diemCua(ma){ var b = canBang()[ma]; return b && b.diem != null ? b.diem : null; }
  function vien(d){
    if(d == null) return '<span class="v50-diem v50-chua">chưa soát</span>';
    var k = d >= 80 ? 'v50-tot' : d >= 50 ? 'v50-vua' : 'v50-yeu';
    return '<span class="v50-diem ' + k + '">' + d + '<small>/100</small></span>';
  }

  /* ── Thanh áp dụng ở đầu màn học thuyết (app.js gọi mỗi lần vẽ) ── */
  G.v50Thanh = function(v){
    if(!V()) return '';
    var o = '';
    var g = V().vuaGop;
    if(g && g.den === v){
      var itTu = G.navItem ? G.navItem(g.tu) : null;
      o += '<div class="v50-gop" role="status">' + ic('arrow','w-4 h-4') + '<span><b>«' + h(itTu ? G.iname(itTu) : g.tu) + '» đã gộp vào đây.</b> ' + h(g.ly) + '</span>' +
        '<button class="btn sm ghost" data-v50="ban-cu" data-v2="' + h(g.tu) + '">Xem bản cũ</button></div>';
      V().vuaGop = null;
    }
    if(V().tat() || !V().laNhanSu()) return o;
    var c = V().cumCua(v);
    if(!c) return o;
    var k = kpiDef(c.kpi), kh = khoiDef(c.khoi), d = diemCua(c.ma);
    o += '<div class="v50-thanh">' +
      '<div class="v50-thanh-dau"><span class="v50-nhan">V50 · ÁP DỤNG</span><b>' + h(c.ten) + '</b><span class="tiny muted">' + c.man.length + ' màn trong cụm</span></div>' +
      '<div class="v50-thanh-than">' +
        '<div class="v50-o"><span class="tiny muted">Điểm áp dụng của tôi</span>' + vien(d) + '</div>' +
        '<div class="v50-o v50-o-rong"><span class="tiny muted">Chỉ số chịu tác động</span><b>' + h(k ? k.ten : c.kpi) + '</b><span class="tiny muted">' + h(kh ? kh.ten : c.khoi) + ' · đo ở Trung tâm đo lường</span></div>' +
        '<div class="v50-nut">' +
          '<button class="btn sm pri" data-v50="soat" data-v2="' + h(c.ma) + '">' + ic('check','w-3 h-3') + 'Tự soát ' + c.viec.length + ' việc</button>' +
          (laQL() && G.manCoThat && G.manCoThat('trung-tam-do') ? '<button class="btn sm ghost" data-v50="giai-phap" data-v2="' + h(c.khoi) + '">' + ic('chart','w-3 h-3') + 'Giải pháp khối này</button>' : '') +
          '<button class="btn sm ghost" data-v="' + VIEW + '">' + ic('book','w-3 h-3') + 'Thư viện</button>' +
        '</div>' +
      '</div></div>';
    return o;
  };

  /* ── Hộp tự soát ── */
  var NHAN = [['da','Đã làm'], ['dang','Đang làm'], ['chua','Chưa'], ['kl','Không liên quan']];
  function moSoat(ma){
    var c = V().cum(ma); if(!c) return;
    var b = canBang()[ma];
    st.soat = ma;
    st.soatTT = c.viec.map(function(x, i){ return (b && b.tt && b.tt[i]) || 'chua'; });
    veSoat();
  }
  function veSoat(){
    var c = V().cum(st.soat); if(!c) return;
    var kq = V().cham(st.soatTT), k = kpiDef(c.kpi);
    var o = '<div class="v50-hop"><div class="up tiny muted">TỰ SOÁT ÁP DỤNG · ' + h(c.ten) + '</div>' +
      '<h3 style="margin:4px 0 6px">Đội mình đang làm theo tới đâu?</h3>' +
      '<p class="sm muted" style="margin:0 0 12px">Chấm thật, không chấm cho đẹp: điểm này cộng vào mức áp dụng toàn đội mà Super Admin xem, và đi cùng chỉ số <b>' + h(k ? k.ten : c.kpi) + '</b>.</p>' +
      c.viec.map(function(t, i){
        return '<div class="v50-viec"><div class="sm">' + (i + 1) + '. ' + h(t) + '</div><div class="v50-chon" role="group" aria-label="Trạng thái việc ' + (i + 1) + '">' +
          NHAN.map(function(n){ return '<button class="v50-tt' + (st.soatTT[i] === n[0] ? ' on v50-tt-' + n[0] : '') + '" data-v50="tt" data-v2="' + i + ':' + n[0] + '" aria-pressed="' + (st.soatTT[i] === n[0]) + '">' + h(n[1]) + '</button>'; }).join('') +
        '</div></div>';
      }).join('') +
      '<div class="v50-kq"><span>Điểm sau khi chấm</span>' + vien(kq.diem) + '<span class="tiny muted">' + kq.da + ' đã · ' + kq.dang + ' đang · ' + kq.tong + ' việc liên quan</span></div>' +
      '<div class="row" style="gap:8px;justify-content:flex-end;margin-top:12px"><button class="btn ghost" data-v50="dong">Để sau</button>' +
      '<button class="btn pri" data-v50="luu">' + ic('check','w-3 h-3') + 'Lưu tự soát</button></div></div>';
    U.modal(o);
  }
  function luuSoat(){
    var ma = st.soat, tt = st.soatTT.slice(), kq = V().cham(tt), luc = new Date().toISOString();
    canBang()[ma] = { tt:tt, diem:kq.diem, luc:luc }; luuMay();
    U.closeModal(); st.soat = null;
    if(!coMayChu()){ U.toast('Đã lưu trên máy này (bản thử — chưa nối máy chủ).', 'ok'); veLai(); return; }
    G.goiMayChu('ghiApDung', { cum:ma, tt:tt }).then(function(r){
      if(r && r.ok){ canBang()[ma].luc = r.luc || luc; luuMay(); st.tong = null; st.taiTong = false; U.toast('Đã lưu tự soát · ' + (r.diem == null ? 'chưa đo' : r.diem + '/100') + '.', 'ok'); }
      else U.toast((r && r.error) || 'Chưa lưu được lên máy chủ — bảng vẫn giữ trên máy này.', 'err');
      veLai();
    });
  }

  /* ── Mức áp dụng toàn đội (R01–R03) ── */
  function canTong(){
    if(!laQL() || st.taiTong) return;
    st.taiTong = true;
    if(!coMayChu()){ st.tong = mauTong(); return; }
    G.goiMayChu('tongApDung', {}).then(function(r){
      if(r && r.ok){ st.tong = r; st.loiTong = ''; } else st.loiTong = (r && r.error) || 'Chưa đọc được mức áp dụng.';
      if(G.S && G.S.view === VIEW) veLai();
    });
  }
  function mauTong(){
    var cum = V().CUM.map(function(c, i){ return { cum:c.ma, soNguoi:3 + (i * 5) % 9, diemTB:35 + (i * 17) % 55, thapNhat:10 + (i * 7) % 30 }; });
    return { ok:true, mau:true, nhanSu:24, daSoat:17, phu:70.8, cum:cum, vai:[],
      thap:[{ u:'coach.vi.du', vai:'R07', cum:'COACH', diem:20 }, { u:'tuvan.vi.du', vai:'R11', cum:'TUVAN', diem:30 }, { u:'ql.vi.du', vai:'R04', cum:'NGHE', diem:40 }] };
  }
  function veTong(){
    if(!laQL()) return '';
    canTong();
    var t = st.tong;
    var o = '<div class="card mb"><div class="row wrap" style="justify-content:space-between;gap:8px"><div><div class="up tiny muted">TOÀN ĐỘI · R01–R03</div><b>Mức áp dụng học thuyết</b></div>';
    if(!t){ return o + '</div><p class="sm muted mt">' + h(st.loiTong || 'Đang đọc…') + '</p></div>'; }
    o += '<div class="row wrap" style="gap:6px"><span class="chip">' + so(t.daSoat || 0) + (t.nhanSu ? ' / ' + so(t.nhanSu) : '') + ' nhân sự đã soát</span>' +
      (t.phu != null ? '<span class="chip">độ phủ ' + String(t.phu).replace('.', ',') + '%</span>' : '') + '</div></div>';
    if(t.mau) o += '<div class="co-mau mt">' + ic('alert','w-4 h-4') + '<span><b>Ví dụ minh hoạ.</b> Bản thử chưa nối máy chủ nên số toàn đội là giả định. Đăng nhập tài khoản thật để thấy số đội mình.</span></div>';
    var m = {}; (t.cum || []).forEach(function(x){ m[x.cum] = x; });
    var hang = V().CUM.map(function(c){ var x = m[c.ma]; return { c:c, x:x, d: x ? Number(x.diemTB) : null }; })
      .sort(function(a, b){ return (a.d == null ? 999 : a.d) - (b.d == null ? 999 : b.d); });
    o += '<div class="v50-bang mt" role="table" aria-label="Mức áp dụng từng cụm">' +
      '<div class="v50-hang v50-hang-dau" role="row"><span>Cụm (thấp trước)</span><span>Người</span><span>Điểm TB</span><span>Thấp nhất</span></div>' +
      hang.map(function(r){
        return '<div class="v50-hang" role="row"><span>' + h(r.c.ten) + '</span><span>' + (r.x ? so(r.x.soNguoi) : '—') + '</span><span>' +
          (r.d == null ? '<span class="tiny muted">chưa ai soát</span>' : vien(Math.round(r.d))) + '</span><span>' + (r.x && r.x.thapNhat != null ? so(r.x.thapNhat) : '—') + '</span></div>';
      }).join('') + '</div>';
    if((t.thap || []).length)
      o += '<details class="mt"><summary class="sm"><b>' + t.thap.length + ' bảng dưới 50 điểm</b> — người cần kèm</summary><div class="v50-bang mt">' +
        t.thap.map(function(x){ var c = V().cum(x.cum); return '<div class="v50-hang"><span class="mono tiny">' + h(x.u) + '</span><span>' + h(x.vai) + '</span><span>' + h(c ? c.ten : x.cum) + '</span><span>' + vien(x.diem) + '</span></div>'; }).join('') +
        '</div></details>';
    return o + '</div>';
  }

  /* ── Màn Thư viện vận hành ── */
  G.VIEWS[VIEW] = function(){
    if(!V()) return U.lockCard('Thiếu bản đồ V50.');
    var nhanSu = V().laNhanSu(), tat = V().tat();
    var hien = function(v){ var it = G.navItem ? G.navItem(v) : null; return it && (!G.mucHien || G.mucHien(it)) ? it : null; };
    var tongCum = 0, tongGop = 0;
    V().CUM.forEach(function(c){ c.man.forEach(function(v){ if(hien(v)) tongCum++; }); });
    Object.keys(V().GOP).forEach(function(v){ if(V().dich(v) || tat) tongGop++; });
    var tongCong = 0;
    (G.NAV || []).forEach(function(g){ g.items.forEach(function(it){ if((!G.mucHien || G.mucHien(it)) && !V().an(it.v)) tongCong++; }); });

    var o = U.ph({ eyebrow:'KIẾN TRÚC VẬN HÀNH V50', ic:'book', grad:1, t:'Thư viện vận hành',
      lead: nhanSu
        ? 'Cột trái chỉ giữ công cụ làm việc. Mọi màn học thuyết nằm ở đây, gom theo 14 cụm — mỗi cụm có bảng việc áp dụng để chấm đội mình đang làm theo tới đâu, và chỉ số ở Trung tâm đo lường để thấy học thuyết ấy có đổi được số hay không.'
        : 'Các bài đọc về hành trình nhà mình, gom theo chủ đề. Bấm vào một bài để đọc.' });
    if(tat) o += '<div class="co-mau mb">' + ic('alert','w-4 h-4') + '<span><b>V50 đang tắt.</b> Cột trái hiện đủ mọi mục như trước và màn mẫu không chuyển hướng.</span></div>';
    if(nhanSu)
      o += '<div class="grid g3 mb">' +
        '<div class="card"><div class="up tiny muted">Cột trái</div><div class="v50-so">' + so(tongCong) + '</div><div class="tiny muted">công cụ mở được với vai này</div></div>' +
        '<div class="card"><div class="up tiny muted">Học thuyết</div><div class="v50-so">' + so(tongCum) + '</div><div class="tiny muted">màn gom vào ' + V().CUM.length + ' cụm, có bảng việc áp dụng</div></div>' +
        '<div class="card"><div class="up tiny muted">Đã gộp</div><div class="v50-so">' + so(tongGop) + '</div><div class="tiny muted">màn mẫu / trùng chuyển thẳng sang công cụ sống</div></div></div>';
    if(nhanSu && !tat) o += veTong();

    o += '<label class="v50-tim">' + ic('search','w-4 h-4') + '<input id="v50-tim" class="inp" type="search" placeholder="Tìm màn hoặc cụm — ví dụ: phác đồ, VIP, hợp đồng" aria-label="Tìm trong Thư viện vận hành"></label>';
    o += '<div class="v50-cums">';
    V().CUM.forEach(function(c){
      var ds = c.man.map(hien).filter(Boolean);
      if(!ds.length) return;
      var k = kpiDef(c.kpi), d = nhanSu ? diemCua(c.ma) : null;
      o += '<section class="card v50-cum" data-cum="' + h((c.ten + ' ' + c.mo).toLowerCase()) + '">' +
        '<div class="v50-cum-dau"><div><b>' + h(c.ten) + '</b><p class="tiny muted" style="margin:3px 0 0">' + h(c.mo) + '</p></div>' + (nhanSu ? vien(d) : '') + '</div>' +
        (nhanSu ? '<div class="tiny muted mt">Chỉ số: <b>' + h(k ? k.ten : c.kpi) + '</b></div>' : '') +
        '<div class="v50-man">' + ds.map(function(it){
          return '<button class="v50-mo" data-v="' + h(it.v) + '" data-ten="' + h(String(G.iname(it)).toLowerCase()) + '">' + ic(it.ic || 'book','w-3 h-3') + '<span>' + h(G.iname(it)) + '</span></button>';
        }).join('') + '</div>' +
        (nhanSu ? '<div class="row mt" style="gap:6px"><button class="btn sm pri" data-v50="soat" data-v2="' + h(c.ma) + '">' + ic('check','w-3 h-3') + 'Tự soát ' + c.viec.length + ' việc</button></div>' : '') +
      '</section>';
    });
    o += '</div><p class="tiny muted v50-trong" hidden>Không có màn nào khớp.</p>';

    if(nhanSu){
      var gop = Object.keys(V().GOP).map(function(v){ var it = G.navItem ? G.navItem(v) : null, g = V().GOP[v], den = G.navItem ? G.navItem(g[0][0]) : null;
        return '<div class="v50-hang"><span>' + h(it ? G.iname(it) : v) + '</span><span>→ ' + h(den ? G.iname(den) : g[0][0]) + '</span><span class="tiny muted">' + h(g[1]) + '</span>' +
          '<span><button class="btn sm ghost" data-v50="ban-cu" data-v2="' + h(v) + '">Bản cũ</button></span></div>'; }).join('');
      o += '<details class="card mt"><summary><b>' + Object.keys(V().GOP).length + ' màn mẫu / trùng đã gộp</b> <span class="tiny muted">— màn cũ vẫn còn, chỉ không còn là lối vào chính</span></summary><div class="v50-bang v50-bang-gop mt">' + gop + '</div></details>';
    }
    if(G.can && G.can('qt_trang'))
      o += '<div class="card mt"><div class="row wrap" style="justify-content:space-between;gap:8px"><div><b>' + (tat ? 'Bật lại V50' : 'Tắt V50 trên máy này') + '</b>' +
        '<p class="tiny muted" style="margin:3px 0 0">' + (tat ? 'Rút học thuyết khỏi cột trái và chuyển màn mẫu sang công cụ sống.' : 'Hiện lại đủ mọi mục ở cột trái như trước V50, màn mẫu không chuyển hướng. Không xoá dữ liệu nào.') + '</p></div>' +
        '<button class="btn ' + (tat ? 'pri' : 'ghost') + '" data-v50="bat-tat">' + (tat ? 'Bật lại' : 'Hiện lại đủ') + '</button></div></div>';
    return '<div class="v50">' + o + '</div>';
  };

  /* ── Sự kiện ── */
  document.addEventListener('click', function(e){
    var el = e.target.closest && e.target.closest('[data-v50]'); if(!el) return;
    var a = el.getAttribute('data-v50'), v = el.getAttribute('data-v2') || '';
    if(a === 'soat'){ moSoat(v); return; }
    if(a === 'tt'){ var p = v.split(':'), i = Number(p[0]); if(st.soatTT && i >= 0 && i < st.soatTT.length){ st.soatTT[i] = p[1]; veSoat(); } return; }
    if(a === 'luu'){ if(st.soat) luuSoat(); return; }
    if(a === 'dong'){ U.closeModal(); st.soat = null; return; }
    if(a === 'giai-phap'){ if(G.TTD_MO) G.TTD_MO({ tab:'gp', khoi:v }); G.go('trung-tam-do'); return; }
    if(a === 'ban-cu'){ V().boQua[v] = 1; G.go(v); return; }
    if(a === 'bat-tat'){ var tat = V().tat(); V().datTat(!tat); U.toast(tat ? 'Đã bật lại V50.' : 'Đã tắt V50 trên máy này — cột trái hiện đủ như trước.', 'ok'); veLai(); return; }
  });
  document.addEventListener('input', function(e){
    if(!e.target || e.target.id !== 'v50-tim') return;
    var q = String(e.target.value || '').toLowerCase().trim(), con = 0;
    var cums = document.querySelectorAll('.v50-cum');
    for(var i = 0; i < cums.length; i++){
      var c = cums[i], caCum = !q || c.getAttribute('data-cum').indexOf(q) >= 0, nut = c.querySelectorAll('.v50-mo'), coNut = 0;
      for(var j = 0; j < nut.length; j++){
        nut[j].hidden = !caCum && nut[j].getAttribute('data-ten').indexOf(q) < 0;
        if(!nut[j].hidden) coNut++;
      }
      c.hidden = !coNut; if(coNut) con++;
    }
    var tr = document.querySelector('.v50-trong'); if(tr) tr.hidden = con > 0;
  });
})();
