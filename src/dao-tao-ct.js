/* ═══════════════════════════════════════════════════════════════
   GITA 365 — CHƯƠNG TRÌNH ĐÀO TẠO (màn chuong-trinh-dt)

   Ba chương trình Tư vấn · Nhân sự · Coach — xếp theo thứ tự trình bày,
   không chương trình nào đòi chứng nhận của chương trình khác. Mỗi bước TRỎ
   vào một màn đã có (sổ tay, nghề, kho nghề, sát hạch, ba cửa) — màn
   này không chép lại nội dung học, nó giữ SỔ: ai học tới đâu, ai chấm,
   ai ký chứng nhận.

   G.DTC_CT là bản đối chiếu của may-chu/dao-tao-ct.js → CT.
   tools/thu-dao-tao-ct.mjs so hai bản từng ô; lệch là đỏ.

   Tiến độ CHỈ nằm ở máy chủ. Chưa nối máy chủ thì màn vẫn hiện chương
   trình nhưng nói thẳng là không ghi được — không giữ tiến độ trong
   máy, vì một dấu tick nằm trong trình duyệt của chính người học thì
   không ai kiểm lại được, và nó trông y hệt một dấu tick thật.
   ═══════════════════════════════════════════════════════════════ */
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic;

  G.DTC_CT = [
    { ma:'tuvan', ten:'Tư vấn viên', vaiChinh:['R11'], chamToi:4, capToi:3, buoc:[
      { ma:'TV01', loai:'tuHoc', man:'bo-nao', ten:'Hiến pháp 13 điều và hàng rào 10 điểm' },
      { ma:'TV02', loai:'tuHoc', man:'phap-ly-rui-ro', ten:'Điều 13 và quyền dữ liệu của gia đình' },
      { ma:'TV03', loai:'tuHoc', man:'so-tay-tu-van', ten:'Sổ tay tư vấn' },
      { ma:'TV04', loai:'tuHoc', man:'nghe-tu-van', ten:'Nghề tư vấn: hành trình khách qua năm tầng' },
      { ma:'TV05', loai:'tuHoc', man:'kich-ban', ten:'Kịch bản và cách đáp phản đối' },
      { ma:'TV06', loai:'tuHoc', man:'kn-tuvan', ten:'Kho nghề tư vấn' },
      { ma:'TV07', loai:'nguoiCham', man:'kich-ban', nguong:80, ten:'Đóng vai một cuộc tư vấn đầu, có người kèm nghe' },
      { ma:'TV08', loai:'nguoiCham', man:'sat-hach', nguong:70, ten:'Sát hạch vai tư vấn, làm trước mặt người chấm' },
      { ma:'TV09', loai:'mayCham', man:'con-nguoi', cua:['C1','C2','C3'], ten:'Ba cửa con người' }
    ]},
    { ma:'nhansu', ten:'Nhập môn nhân sự', vaiChinh:['R01','R02','R03','R04','R05','R06',
      'R07','R08','R09','R10','R11','R12'], chamToi:6, capToi:3, buoc:[
      { ma:'NS01', loai:'tuHoc', man:'luat-lam-viec', ten:'Luật làm việc' },
      { ma:'NS02', loai:'tuHoc', man:'phap-ly-rui-ro', ten:'Bảo mật và Điều 13' },
      { ma:'NS03', loai:'tuHoc', man:'luat-giao-dien', ten:'Mười hai lời hứa với gia đình' },
      { ma:'NS04', loai:'tuHoc', man:'bang-viec', ten:'Bàn làm việc và đầu việc' },
      { ma:'NS05', loai:'tuHoc', man:'bo-nao', ten:'Hiến pháp 13 điều và hàng rào 10 điểm' },
      { ma:'NS06', loai:'tuHoc', man:'khoa-dao-tao', ten:'Khoá đào tạo 30 bài: Học · Làm · Nộp' },
      { ma:'NS07', loai:'nguoiCham', man:'bang-viec', nguong:70, ten:'Buổi kèm việc đầu tiên với người quản lý' },
      { ma:'NS08', loai:'mayCham', man:'con-nguoi', cua:['C1'], ten:'Cửa 1 · Hiến pháp 13 trên 13' }
    ]},
    { ma:'coach', ten:'Coach', vaiChinh:['R05','R06','R07','R08'], chamToi:6, capToi:5, buoc:[
      { ma:'CO01', loai:'tuHoc', man:'coach-ct', ten:'Hệ điều hành Coach: chương trình' },
      { ma:'CO02', loai:'tuHoc', man:'coach-5-tang', ten:'Năm tầng đồng hành' },
      { ma:'CO03', loai:'tuHoc', man:'nghe-coach', ten:'Nghề coach' },
      { ma:'CO04', loai:'tuHoc', man:'kn-coach', ten:'Kho nghề coach' },
      { ma:'CO05', loai:'tuHoc', man:'dao-tao-dh', ten:'Đào tạo đồng hành 40 giờ' },
      { ma:'CO06', loai:'tuHoc', man:'coach-kh', ten:'Coach khách hàng và Thẻ Vùng Mạnh' },
      { ma:'CO07', loai:'nguoiCham', man:'coach-kh', nguong:80, ten:'Ba buổi coach có người kèm' },
      { ma:'CO08', loai:'nguoiCham', man:'sat-hach', nguong:70, ten:'Sát hạch vai coach, làm trước mặt người chấm' },
      { ma:'CO09', loai:'mayCham', man:'con-nguoi', cua:['C1','C2','C3'], ten:'Ba cửa con người' }
    ]}
  ];

  var LOAI = {
    tuHoc:     { ten:'Tự học · lời khai', m:'var(--ink-4)', vi:'Chính bạn đánh dấu, kèm một câu: sau bài này bạn sẽ làm gì khác. Đây là LỜI KHAI, không phải phép đo.' },
    nguoiCham: { ten:'Người chấm', m:'var(--gita)', vi:'Một người kèm (không phải bạn) chấm 0–100 kèm nhận xét. Tên người chấm đi cùng con số.' },
    mayCham:   { ten:'Máy đọc', m:'var(--ok)', vi:'Máy đọc thẳng sổ ba cửa — không ai đánh dấu hộ được.' }
  };
  var CAU = 20;
  var st = {};
  /* Trạng thái gắn với MỘT tài khoản. Đổi tài khoản trên cùng một thẻ mà
     không xoá thì người sau thấy tiến độ của người trước cho tới khi tải
     lại trang — chỗ hở bắt được lúc thử đăng nhập lần lượt ba vai. */
  function datLai(ai){
    var r = (G.S && G.S.acc && G.S.acc.role) || '';
    st = { ai:ai, ngan: r === 'R11' ? 'tuvan' : /^R0[5-8]$/.test(r) ? 'coach' : 'nhansu',
      tai:false, loi:'', du:null, doi:{}, doiTai:'', mo:'', nguoiXem:'' };
  }
  function giuDung(){ var ai = (G.S && G.S.acc && G.S.acc.u) || ''; if(st.ai !== ai) datLai(ai); }
  datLai(null);

  function coMayChu(){ return typeof G.goiMayChu === 'function' && !!G.API_CAP_PHEP && !!G.PHIEN_TOKEN; }
  function lv(){ return (G.S && G.S.roleObj && G.S.roleObj.lv) || 99; }
  function veLai(){ if(G.render) G.render(); }
  function ct(ma){ return G.DTC_CT.filter(function(c){ return c.ma === ma; })[0] || null; }
  function moMan(v){ return !!G.VIEWS[v] && (!G.allowed || G.allowed(v)); }
  function tenVai(id){ var r = G.roleById && G.roleById(id); return r ? r.short : id; }
  function dsVai(arr){ return arr.map(tenVai).join(' · '); }
  function tuBac(n){ var a = []; for(var i = 1; i <= n; i++) a.push('R' + (i < 10 ? '0' : '') + i); return dsVai(a); }
  /* Đếm riêng từng loại bước — không gộp lời khai với bước được chấm vào một phân số. */
  function demLoai(tl){
    return ['tuHoc','nguoiCham','mayCham'].map(function(l){
      var x = (tl || {})[l] || { xong:0, tong:0 };
      return '<span class="dtc-tag" style="--m:' + LOAI[l].m + '">' + h(LOAI[l].ten) + ' ' + x.xong + '/' + x.tong + '</span>';
    }).join(' ');
  }

  function tai(){
    if(!coMayChu()) return;
    st.tai = true; st.loi = '';
    var cua = st;
    G.goiMayChu('docDaoTao', st.nguoiXem ? { maNguoi:st.nguoiXem } : {}, { moi:true }).then(function(r){
      /* Câu trả lời về trễ sau khi đã đổi tài khoản thì bỏ — không rơi vào trạng thái của người sau. */
      if(cua !== st) return;
      st.tai = false;
      /* Tên chính tắc của chính mình lấy từ máy chủ — acc.u có thể là email. */
      if(r && r.ok){ st.du = r; if(!st.nguoiXem) st.minh = r.maNguoi; } else st.loi = (r && r.error) || 'Không đọc được tiến độ.';
      veLai();
    });
  }
  function taiDoi(ma){
    if(!coMayChu()) return;
    st.doiTai = ma;
    var cua = st;
    G.goiMayChu('doiDaoTao', { ct:ma }, { moi:true }).then(function(r){
      if(cua !== st) return;
      st.doiTai = '';
      st.doi[ma] = (r && r.ok) ? r.ds : { loi:(r && r.error) || 'Không đọc được đội.' };
      veLai();
    });
  }
  function goi(fn, than, xong){
    G.goiMayChu(fn, than).then(function(r){
      if(r && r.ok){ U.toast(xong, 'ok'); st.mo = ''; st.du = null; st.doi = {}; tai(); }
      else U.toast((r && r.error) || 'Không ghi được.', 'err');
    });
  }

  function thanh(){
    var ds = G.DTC_CT.map(function(c){ return { ma:c.ma, ten:c.ten, ic:c.ma === 'coach' ? 'flame' : c.ma === 'tuvan' ? 'heart' : 'book' }; });
    if(lv() <= 6) ds.push({ ma:'doi', ten:'Đội tôi kèm', ic:'target' });
    return '<div class="co-tabs" role="tablist">' + ds.map(function(n){
      return '<button class="co-tab' + (st.ngan === n.ma ? ' on' : '') + '" role="tab" aria-selected="' + (st.ngan === n.ma) + '" data-dtc="ngan" data-ma="' + n.ma + '">' + ic(n.ic) + h(n.ten) + '</button>';
    }).join('') + '</div>';
  }

  function dongBuoc(c, b, tt, laMinh){
    var L = LOAI[b.loai];
    var xong = tt && tt.xong;
    var CHU_XONG = { tuHoc:'Đã khai', nguoiCham:'Đạt', mayCham:'Đủ cửa' };
    var den = !xong ? '<span class="co-den" style="--m:var(--ink-4)"><i></i>Chưa</span>'
      : (b.loai === 'mayCham' && tt.coKhaiCu) ? '<span class="co-den" style="--m:var(--warn)"><i></i>Đủ cửa · có khai hộ</span>'
      : '<span class="co-den" style="--m:' + L.m + '"><i></i>' + CHU_XONG[b.loai] + '</span>';
    var phu = '';
    if(b.loai === 'nguoiCham'){
      phu = 'Đạt từ ' + b.nguong + ' điểm';
      if(tt && typeof tt.diem === 'number') phu += ' · lượt cuối ' + tt.diem + ' điểm, chấm bởi ' + h(tt.boiAi);
    } else if(b.loai === 'mayCham'){
      phu = 'Cần ' + b.cua.join(' · ');
      if(tt && tt.thieuCua && tt.thieuCua.length) phu += ' · còn thiếu ' + tt.thieuCua.join(' · ');
      if(tt && tt.coKhaiCu) phu += ' · có cửa được khai hộ (lời khai, không phải phép đo)';
    } else if(tt && tt.cau){
      phu = '“' + h(tt.cau) + '”';
    }
    var nut = moMan(b.man)
      ? '<button class="btn ghost sm" data-v="' + h(b.man) + '">' + ic('arrow','w-3 h-3') + 'Mở bài</button>'
      : G.VIEWS[b.man] ? '<span class="tiny muted">Bài này chưa mở với vai của bạn</span>'
      : '<span class="tiny muted">Bài mở khi gói nghề của vai đã nạp</span>';
    var o = '<div class="co-dong dtc-dong"><span class="dtc-ma">' + h(b.ma) + '</span>' +
      '<span class="co-grow"><b class="sm">' + h(b.ten) + '</b> <span class="dtc-tag" style="--m:' + L.m + '">' + h(L.ten) + '</span>' +
      (phu ? '<br><span class="tiny muted">' + phu + '</span>' : '') + '</span>' + den + nut;
    if(laMinh && b.loai === 'tuHoc' && !xong && coMayChu() && st.du && tt){
      var k = c.ma + ':' + b.ma;
      if(st.mo === k){
        o += '<div class="dtc-form"><label class="co-f" for="dtc-cau"><span>Sau bài này bạn sẽ làm gì khác? (từ ' + CAU + ' ký tự)</span>' +
          '<textarea class="inp" id="dtc-cau" rows="2"></textarea></label>' +
          '<div class="co-hang"><button class="btn pri sm" data-dtc="tuhoc" data-ct="' + c.ma + '" data-b="' + b.ma + '">Đánh dấu đã học</button>' +
          '<button class="btn ghost sm" data-dtc="dong">Thôi</button></div></div>';
      } else o += '<button class="btn sm" data-dtc="mo" data-k="' + k + '">Đánh dấu đã học</button>';
    }
    return o + '</div>';
  }

  function nganCt(c){
    var tt = st.du && st.du.ct.filter(function(x){ return x.ct === c.ma; })[0];
    var o = '<p class="sm muted mb">Dành cho: ' + h(dsVai(c.vaiChinh)) + '. Người chấm: ' + h(tuBac(c.chamToi)) +
      '. Người ký chứng nhận: ' + h(tuBac(c.capToi)) + '. Không ai tự chấm hay tự ký cho chính mình, và người ký phải khác người chấm.</p>';
    if(c.ma === 'coach') o += '<div class="co-cb mb"><div style="--m:var(--gita)"><span>Đây là <b>chứng nhận hoàn thành chương trình</b>, không thay chứng chỉ hành nghề Coach. Chứng chỉ hành nghề vẫn theo Đào tạo đồng hành: mười tuần thực tập và bài thi cuối có nhiều người chấm.</span></div></div>';
    o += '<div class="co-cb dtc-luat mb">' + ['tuHoc','nguoiCham','mayCham'].map(function(l){
      return '<div style="--m:' + LOAI[l].m + '"><b>' + h(LOAI[l].ten) + '</b><span>' + h(LOAI[l].vi) + '</span></div>';
    }).join('') + '</div>';

    if(!coMayChu()){
      o += '<div class="co-mau">' + ic('alert','w-4 h-4') + '<span>Tiến độ nằm ở máy chủ của Học viện. Tài khoản mẫu xem được chương trình, nhưng không ghi được bước nào — một dấu tick chỉ nằm trong máy của bạn thì không ai kiểm lại được.</span></div>';
    } else if(st.tai && !st.du){
      o += '<p class="sm muted">Đang đọc tiến độ…</p>';
    } else if(st.loi && !st.du){
      o += '<div class="co-cb"><div style="--m:var(--gita-do-ink)">' + ic('alert','w-4 h-4') + '<span>' + h(st.loi) + '</span></div></div>';
    } else if(tt){
      var laMinh = !st.nguoiXem;
      o += '<div class="co-hang mb"><span class="sm co-grow">' + (laMinh ? 'Tiến độ của bạn' : 'Tiến độ của <b>' + h(st.du.maNguoi) + '</b>') +
        ': ' + demLoai(tt.theoLoai) + '</span>' +
        (tt.chungChi ? '<span class="co-den" style="--m:var(--ok)"><i></i>Đã có chứng nhận · ký bởi ' + h(tt.chungChi.boiAi) + '</span>'
          : tt.duDieuKien ? '<span class="co-den" style="--m:var(--gita)"><i></i>Đủ điều kiện · chờ người ký</span>' : '') + '</div>';
      if(tt.daThuHoi) o += '<div class="co-cb mb"><div style="--m:var(--warn)"><span>Chứng nhận đã bị thu hồi bởi ' + h(tt.daThuHoi.boiAi) + ': ' + h(tt.daThuHoi.lyDo || '') + '</span></div></div>';
      if(!tt.ghiDanh && laMinh)
        o += '<div class="co-hang mb"><span class="sm co-grow">Bạn chưa ghi danh chương trình này.</span><button class="btn pri sm" data-dtc="ghidanh" data-ct="' + c.ma + '">Ghi danh</button></div>';
    }
    o += '<div class="co-ds">' + c.buoc.map(function(b){
      var tb = tt && tt.buoc.filter(function(x){ return x.ma === b.ma; })[0];
      return dongBuoc(c, b, tt && tt.ghiDanh ? tb : (tb && b.loai === 'mayCham' ? tb : null), !st.nguoiXem);
    }).join('') + '</div>';
    return o;
  }

  function nganDoi(){
    var o = '<p class="sm muted mb">Người kèm (' + h(tuBac(6)) + ') ghi danh hộ, chấm bước người-chấm và ký chứng nhận. Máy kiểm lại mọi điều kiện lúc ký — không tin dấu nào màn này gửi lên.</p>';
    if(!coMayChu()) return o + '<div class="co-mau">' + ic('alert','w-4 h-4') + '<span>Đội nằm ở máy chủ. Đăng nhập bằng tài khoản thật để xem.</span></div>';
    o += '<div class="co-form mb"><label class="co-f" for="dtc-gd-nguoi"><span>Tên đăng nhập hoặc email</span><input class="inp" id="dtc-gd-nguoi" autocomplete="off"></label>' +
      '<label class="co-f" for="dtc-gd-ct"><span>Chương trình</span><select class="inp" id="dtc-gd-ct">' +
      G.DTC_CT.map(function(c){ return '<option value="' + c.ma + '">' + h(c.ten) + '</option>'; }).join('') + '</select></label>' +
      '<div class="co-f"><span>&nbsp;</span><button class="btn pri sm" data-dtc="ghidanh-ho">Ghi danh hộ</button></div></div>';
    G.DTC_CT.forEach(function(c){
      o += U.sec(c.ten);
      var d = st.doi[c.ma];
      if(!d){ if(st.doiTai !== c.ma) taiDoi(c.ma); o += '<p class="sm muted">Đang đọc…</p>'; return; }
      if(d.loi){ o += '<p class="sm muted">' + h(d.loi) + '</p>'; return; }
      if(!d.length){ o += '<p class="sm muted">Chưa ai ghi danh.</p>'; return; }
      o += '<div class="co-ds">' + d.map(function(p){
        var k = 'doi:' + c.ma + ':' + p.maNguoi;
        var chamDuoc = c.buoc.filter(function(b){ return b.loai === 'nguoiCham'; });
        /* Dòng của chính mình: không hiện nút chấm/ký — máy chủ cũng chặn (TUCHAM · TUCAP). */
        var laMinh = !!st.minh && p.maNguoi === st.minh;
        var r = '<div class="co-dong dtc-dong"><span class="co-grow"><b class="sm">' + h(p.maNguoi) + '</b><br>' + demLoai(p.theoLoai) +
          (p.thieu.length ? '<br><span class="tiny muted">Còn thiếu ' + h(p.thieu.join(' · ')) + '</span>' : '') + '</span>' +
          (p.coChungChi ? '<span class="co-den" style="--m:var(--ok)"><i></i>Có chứng nhận</span>' : '') +
          '<button class="btn ghost sm" data-dtc="xem" data-n="' + h(p.maNguoi) + '" data-ct="' + c.ma + '">Xem</button>' +
          (!laMinh && lv() <= c.chamToi ? '<button class="btn ghost sm" data-dtc="mo" data-k="' + h(k) + '">Chấm</button>' : '') +
          (!laMinh && p.duDieuKien && !p.coChungChi && lv() <= c.capToi ? '<button class="btn pri sm" data-dtc="ky" data-n="' + h(p.maNguoi) + '" data-ct="' + c.ma + '">Ký chứng nhận</button>' : '') +
          (p.coChungChi && lv() <= c.capToi ? '<button class="btn ghost sm" data-dtc="mo" data-k="' + h('thu:' + c.ma + ':' + p.maNguoi) + '">Thu hồi</button>' : '');
        if(st.mo === k){
          r += '<div class="dtc-form"><div class="co-form">' +
            '<label class="co-f" for="dtc-ch-b"><span>Bước</span><select class="inp" id="dtc-ch-b">' + chamDuoc.map(function(b){
              return '<option value="' + b.ma + '">' + h(b.ma + ' · ' + b.ten + ' (đạt từ ' + b.nguong + ')') + '</option>'; }).join('') + '</select></label>' +
            '<label class="co-f" for="dtc-ch-d"><span>Điểm 0–100</span><input class="inp" id="dtc-ch-d" type="number" min="0" max="100" step="1" inputmode="numeric"></label></div>' +
            '<label class="co-f mt" for="dtc-ch-n"><span>Nhận xét: đã làm được gì, còn thiếu gì (từ ' + CAU + ' ký tự)</span><textarea class="inp" id="dtc-ch-n" rows="2"></textarea></label>' +
            '<div class="co-hang mt"><button class="btn pri sm" data-dtc="cham" data-n="' + h(p.maNguoi) + '" data-ct="' + c.ma + '">Ghi điểm</button><button class="btn ghost sm" data-dtc="dong">Thôi</button></div></div>';
        }
        if(st.mo === 'thu:' + c.ma + ':' + p.maNguoi){
          r += '<div class="dtc-form"><label class="co-f" for="dtc-th-l"><span>Lý do thu hồi (từ ' + CAU + ' ký tự)</span><textarea class="inp" id="dtc-th-l" rows="2"></textarea></label>' +
            '<div class="co-hang mt"><button class="btn pri sm" data-dtc="thuhoi" data-n="' + h(p.maNguoi) + '" data-ct="' + c.ma + '">Thu hồi chứng nhận</button><button class="btn ghost sm" data-dtc="dong">Thôi</button></div></div>';
        }
        return r + '</div>';
      }).join('') + '</div>';
    });
    return o;
  }

  G.VIEWS['chuong-trinh-dt'] = function(){
    var o = U.ph({ eyebrow:'ĐÀO TẠO & NĂNG LỰC', ic:'book', t:'Chương trình đào tạo',
      lead:'Ba chương trình: Tư vấn · Nhân sự · Coach. Mỗi bước mở một bài đã có trong hệ; sổ ở máy chủ ghi ai học tới đâu, ai chấm, ai ký chứng nhận hoàn thành.' });
    giuDung();
    if(coMayChu() && !st.du && !st.tai && !st.loi) tai();
    if(st.nguoiXem) o += '<div class="co-hang mb"><span class="sm co-grow">Đang xem tiến độ của <b>' + h(st.nguoiXem) + '</b></span><button class="btn ghost sm" data-dtc="ve-minh">Về tiến độ của tôi</button></div>';
    o += thanh();
    if(st.ngan === 'doi' && lv() <= 6) return o + nganDoi();
    return o + nganCt(ct(st.ngan) || G.DTC_CT[0]);
  };

  function gt(id){ var e = document.getElementById(id); return e ? String(e.value || '').trim() : ''; }
  document.addEventListener('click', function(e){
    var el = e.target.closest && e.target.closest('[data-dtc]'); if(!el) return;
    var a = el.getAttribute('data-dtc');
    giuDung();
    if(a === 'ngan'){ st.ngan = el.getAttribute('data-ma'); st.mo = ''; return veLai(); }
    if(a === 'mo'){ st.mo = el.getAttribute('data-k'); veLai(); setTimeout(function(){ var t = document.querySelector('.dtc-form textarea,.dtc-form select'); if(t) t.focus(); }, 30); return; }
    if(a === 'dong'){ st.mo = ''; return veLai(); }
    if(a === 've-minh'){ st.nguoiXem = ''; st.du = null; return tai(); }
    if(a === 'xem'){ st.nguoiXem = el.getAttribute('data-n'); st.ngan = el.getAttribute('data-ct'); st.du = null; return tai(); }
    if(a === 'ghidanh') return goi('ghiDanhDaoTao', { ct:el.getAttribute('data-ct') }, 'Đã ghi danh.');
    if(a === 'ghidanh-ho'){
      var n = gt('dtc-gd-nguoi'); if(!n) return U.toast('Nhập tên đăng nhập hoặc email.', 'err');
      return goi('ghiDanhDaoTao', { ct:gt('dtc-gd-ct'), maNguoi:n }, 'Đã ghi danh ' + n + '.');
    }
    if(a === 'tuhoc'){
      var cau = gt('dtc-cau'); if(cau.length < CAU) return U.toast('Viết ít nhất ' + CAU + ' ký tự: bạn sẽ làm gì khác sau bài này.', 'err');
      return goi('ghiBuocDaoTao', { ct:el.getAttribute('data-ct'), buoc:el.getAttribute('data-b'), ghiChu:cau }, 'Đã đánh dấu.');
    }
    if(a === 'cham'){
      var nx = gt('dtc-ch-n'), d = gt('dtc-ch-d');
      if(d === '' || nx.length < CAU) return U.toast('Cần điểm 0–100 và nhận xét từ ' + CAU + ' ký tự.', 'err');
      return goi('ghiBuocDaoTao', { ct:el.getAttribute('data-ct'), buoc:gt('dtc-ch-b'), maNguoi:el.getAttribute('data-n'),
        diem:Number(d), ghiChu:nx }, 'Đã ghi điểm.');
    }
    if(a === 'ky') return goi('capChungChiDaoTao', { ct:el.getAttribute('data-ct'), maNguoi:el.getAttribute('data-n') }, 'Đã ký chứng nhận.');
    if(a === 'thuhoi'){
      var ly = gt('dtc-th-l'); if(ly.length < CAU) return U.toast('Viết lý do từ ' + CAU + ' ký tự.', 'err');
      return goi('thuHoiChungChiDaoTao', { ct:el.getAttribute('data-ct'), maNguoi:el.getAttribute('data-n'), lyDo:ly }, 'Đã thu hồi.');
    }
  });
})();
