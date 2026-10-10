/* ═══════════════════════════════════════════════════════════════
   GITA 365 — THI CHỨNG CHỈ (màn thi-chung-chi)

   Tư vấn 50 cấp · Coach 100 cấp. Cấp càng cao mở càng nhiều phần kho
   cấp cao. Mỗi tháng thi lại để giữ cấp; bỏ một tháng thì tụt một cấp.

   Màn này KHÔNG giữ bản chép nào của khung cấp: khung, luật và % kho đọc
   từ máy chủ (khungThi · thiCuaToi). Đề thi ghép ở máy chủ lúc bắt đầu
   từ kho cấp cao × dạng nhiệm vụ × biến cố, riêng cho từng người, nên
   đọc mã màn hình không ra đề.

   Ba việc máy KHÔNG làm, và màn nói thẳng ra:
   - máy không chấm bài — người chấm khác người thi, chấm mù;
   - máy không tự đình chỉ hay tính bồi thường — chỉ ghi đề nghị lên
     Giám đốc và Super Admin;
   - vấn đề khó không có lối tự xử lý — phải xin ý kiến, và người duyệt
     có thể chuyển ca cho người có năng lực cao hơn.
   ═══════════════════════════════════════════════════════════════ */
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic;
  var NX_TOI_THIEU = 30, LD_TOI_THIEU = 30;
  var LY_KHO = { quanLy:'quản lý mở hết', congTat:'cổng thi đang tắt', khoaDoViPham:'đang khoá do vi phạm',
    vaiKhongDocKho:'vai này không đọc kho cấp cao', khongThuocHe:'không thuộc thang thi nào' };
  function ngayNgan(ts){ return ts ? new Date(Number(ts)).toLocaleDateString('vi-VN') : ''; }
  /* Tiêu chuẩn của cấp — người thi đọc để biết bị chấm theo gì, người chấm
     đọc để chấm đúng cấp chứ không chấm theo cảm giác. */
  function tieuChuanCap(cd){
    if(!cd) return '';
    return '<details class="tcc-chi sm mt"><summary><b>Tiêu chuẩn cấp ' + cd.cap + '</b> · ' + h(cd.ten) + '</summary>' +
      '<p><b>Năng lực cần thể hiện</b></p><ul>' + cd.nangLuc.map(function(x){ return '<li>' + h(x) + '</li>'; }).join('') + '</ul>' +
      '<p><b>Tiêu chuẩn</b></p><ul>' + cd.tieuChuan.map(function(x){ return '<li>' + h(x) + '</li>'; }).join('') + '</ul>' +
      '<p><b>Lỗi trượt ngay</b></p><ul>' + cd.loiTruot.map(function(x){ return '<li>' + h(x) + '</li>'; }).join('') + '</ul></details>';
  }
  var st = {};
  /* Trạng thái gắn với MỘT tài khoản — cùng lý do màn chuong-trinh-dt:
     đổi tài khoản trên cùng một thẻ thì người sau không được thấy bài
     đang làm hay hàng chấm của người trước. */
  function datLai(ai){
    st = { ai:ai, ngan:'toi', toi:null, khung:null, tai:{}, loi:{}, luot:'', bai:null, nhap:{},
      cham:null, chamLuot:'', chamBai:null, yk:null, doi:{}, soVp:null, moCap:'', mo:'', xh:null, xhKy:'', lich:null };
  }
  function giuDung(){ var ai = (G.S && G.S.acc && G.S.acc.u) || ''; if(st.ai !== ai) datLai(ai); }
  datLai(null);

  function coMayChu(){ return typeof G.goiMayChu === 'function' && !!G.API_CAP_PHEP && !!G.PHIEN_TOKEN; }
  function lv(){ return (G.S && G.S.roleObj && G.S.roleObj.lv) || 99; }
  function laR01(){ return ((G.S && G.S.acc && G.S.acc.role) || '') === 'R01'; }
  function veLai(){ if(G.render) G.render(); }
  function ngay(ts){ if(!ts) return ''; var d = new Date(Number(ts)); return d.toLocaleDateString('vi-VN') + ' ' + d.toTimeString().slice(0, 5); }
  function gt(id){ var e = document.getElementById(id); return e ? String(e.value || '').trim() : ''; }
  function canhBaoMau(chu, m){ return '<div class="co-cb mb"><div style="--m:' + (m || 'var(--gita-do-ink)') + '">' + ic('alert','w-4 h-4') + '<span>' + chu + '</span></div></div>'; }

  /* Một hàm đọc cho mọi cửa: bỏ câu trả lời về trễ sau khi đổi tài khoản. */
  function doc(k, fn, than, xong){
    if(!coMayChu() || st.tai[k]) return;
    st.tai[k] = true; delete st.loi[k];
    var cua = st;
    G.goiMayChu(fn, than || {}, { moi:true }).then(function(r){
      if(cua !== st) return;
      st.tai[k] = false;
      if(r && r.ok) xong(r); else st.loi[k] = (r && r.error) || 'Không đọc được.';
      veLai();
    });
  }
  function ghi(fn, than, loiOk, sau){
    G.goiMayChu(fn, than).then(function(r){
      if(r && r.ok){ U.toast(loiOk(r), 'ok'); if(sau) sau(r); }
      else U.toast((r && r.error) || 'Không ghi được.', 'err');
    });
  }
  function taiLai(){ st.toi = null; st.yk = null; st.cham = null; st.soVp = null; st.doi = {}; veLai(); }
  function capDef(he, cap){ return st.khung && st.khung.cap[he] ? st.khung.cap[he][cap - 1] : null; }

  var TT = { dangLam:['Đang làm','var(--gita)'], choCham:['Chờ chấm','var(--warn)'], dat:['Đạt','var(--ok)'], truot:['Trượt','var(--gita-do-ink)'] };
  function denMau(chu, m){ return '<span class="co-den" style="--m:' + m + '"><i></i>' + h(chu) + '</span>'; }
  function den(tt, them){ var x = TT[tt] || [tt, 'var(--ink-4)']; return denMau(x[0] + (them || ''), x[1]); }

  function thanh(){
    var ds = [{ ma:'toi', ten:'Cấp của tôi', ic:'target' }, { ma:'xephang', ten:'Xếp hạng tháng', ic:'chart' }, { ma:'khung', ten:'Khung cấp', ic:'grid' }, { ma:'ykien', ten:'Xin ý kiến', ic:'chat' }];
    if(lv() <= 6) ds.push({ ma:'cham', ten:'Chấm bài', ic:'check' });
    if(lv() <= 5) ds.push({ ma:'quanly', ten:'Đội · vi phạm', ic:'shield' });
    return '<div class="co-tabs" role="tablist">' + ds.map(function(n){
      return '<button class="co-tab' + (st.ngan === n.ma ? ' on' : '') + '" role="tab" aria-selected="' + (st.ngan === n.ma) + '" data-tcc="ngan" data-ma="' + n.ma + '">' + ic(n.ic) + h(n.ten) + '</button>';
    }).join('') + '</div>';
  }

  /* ── CẤP CỦA TÔI ── */
  function nganToi(){
    if(!st.toi){ doc('toi', 'thiCuaToi', {}, function(r){ st.toi = r; }); return st.loi.toi ? canhBaoMau(h(st.loi.toi)) : '<p class="sm muted">Đang đọc cấp của bạn…</p>'; }
    var t = st.toi, o = '';
    o += t.cong
      ? canhBaoMau('Cổng thi đang <b>BẬT</b>: phần kho cấp cao bạn mở được đi theo cấp đang giữ. Vấn đề vượt cấp hoặc hạng VVIP · DIAMOND phải xin ý kiến trước khi đề xuất.', 'var(--gita)')
      : canhBaoMau('Cổng thi đang <b>TẮT</b>: kho cấp cao chưa khoá theo cấp. Bạn vẫn thi được để có cấp sẵn trước khi Super Admin bật cổng.', 'var(--ink-4)');
    o += t.moHomNay
      ? canhBaoMau('Hôm nay là <b>ngày thi ' + t.ngayThi + '</b>. Mỗi tháng tối đa hai lượt, cả hai đều trong ngày hôm nay.', 'var(--ok)')
      : canhBaoMau('Thi chứng chỉ mở vào <b>ngày ' + t.ngayThi + ' hằng tháng</b>. Kỳ thi tới: <b>' + h(ngayNgan(t.ngayThiKe)) + '</b>. Bài đang làm dở vẫn nộp được tới hết giờ.', 'var(--ink-4)');
    if(!t.he.length) return o + '<p class="sm">Vai của bạn không thuộc thang thi nào. Thang Tư vấn dành cho Tư vấn viên; thang Coach dành cho Trưởng nhóm Coach, Coach cao cấp, Coach và Giáo viên.</p>';
    t.he.forEach(function(x){
      o += U.sec('Thang ' + x.ten + ' · ' + x.soCap + ' cấp');
      o += '<div class="dtc-so"><div><span class="tiny muted">Cấp đang giữ</span><b>' + x.cap + ' / ' + x.soCap + '</b><span class="tiny">' + h(x.tenCap || 'Chưa có cấp') + '</span></div>' +
        '<div><span class="tiny muted">Phần kho cấp cao mở</span><b>' + (x.khoHet ? '100%' : x.kho + '%') + '</b><span class="tiny">' + h(LY_KHO[x.khoLy] || (x.khoHet ? 'không khoá' : 'theo cấp')) + '</span></div>' +
        (x.cap ? '<div><span class="tiny muted">Chứng chỉ ' + h(x.ten) + '</span><b>' + h(x.tenCap ? 'Cấp ' + x.cap : '') + '</b><span class="tiny">hiệu lực tới ' + h(ngayNgan(x.hieuLucDen)) + '</span></div>' : '') +
        '<div><span class="tiny muted">Tháng ' + h(x.thangNay) + '</span><b>' + (x.datThangNay ? 'Đã giữ cấp' : 'Chưa thi') + '</b><span class="tiny">còn ' + x.conLanThang + ' lượt thi tháng này</span></div></div>';
      if(x.khoaDen && x.khoaDen > Date.now()) o += canhBaoMau('Kho cấp cao đang khoá tới ' + h(ngay(x.khoaDen)) + ' do vi phạm mức 3.');
      if(!x.datThangNay && x.cap > 0) o += canhBaoMau('Tháng này bạn chưa thi giữ cấp. Bỏ kỳ thi ngày ' + t.ngayThi + ' mà chưa có bài đạt ở cấp ' + x.cap + ' trở lên thì hết tháng cấp tụt một bậc.', 'var(--warn)');
      var dang = x.bai.filter(function(b){ return b.trangThai === 'dangLam' && b.hanLuc > Date.now(); })[0];
      o += '<div class="co-hang mb">';
      if(dang) o += '<button class="btn pri sm" data-tcc="lam" data-l="' + h(dang.luot) + '">' + ic('arrow','w-3 h-3') + 'Làm tiếp bài cấp ' + dang.cap + '</button>';
      else if(!t.moHomNay) o += '<span class="sm muted">Mở thi ngày ' + t.ngayThi + ' · kỳ tới ' + h(ngayNgan(t.ngayThiKe)) + '</span>';
      else if(x.conLanThang > 0){
        if(x.cap < x.soCap) o += '<button class="btn pri sm" data-tcc="batdau" data-he="' + x.he + '" data-muc="len">Thi lên cấp ' + x.capKe + ' · ' + h(x.tenCapKe) + '</button>';
        if(x.cap > 0) o += '<button class="btn ghost sm" data-tcc="batdau" data-he="' + x.he + '" data-muc="giu">Thi giữ cấp ' + x.cap + '</button>';
      } else o += '<span class="sm muted">Đã dùng hết lượt thi tháng này.</span>';
      o += '</div>';
      if(x.bai.length) o += '<div class="co-ds">' + x.bai.map(function(b){
        var het = b.trangThai === 'dangLam' && b.hanLuc <= Date.now();
        return '<div class="co-dong"><span class="co-grow"><b class="sm">Cấp ' + b.cap + '</b> <span class="tiny muted">· ' + (b.muc === 'giu' ? 'giữ cấp' : 'lên cấp') + ' · tháng ' + h(b.thang) + '</span></span>' +
          (het ? denMau('Hết giờ, chưa nộp', 'var(--ink-4)') : den(b.trangThai, b.quaGio ? ' · nộp quá giờ' : '')) +
          '<button class="btn ghost sm" data-tcc="lam" data-l="' + h(b.luot) + '">' + (b.trangThai === 'dangLam' && !het ? 'Làm bài' : 'Xem') + '</button></div>';
      }).join('') + '</div>';
    });
    if(t.viPham.length){
      o += U.sec('Vi phạm đã ghi');
      o += '<div class="co-ds">' + t.viPham.map(function(v){
        var k = 'gt:' + v.id;
        var r = '<div class="co-dong"><span class="co-grow"><b class="sm">' + h(v.tenLoai || v.loai) + '</b> <span class="tiny muted">· mức ' + v.mucDo + ' · ' + h(ngay(v.luc)) + ' · ghi bởi ' + h(v.boiAi) + '</span>' +
          '<br><span class="tiny">' + h(v.chungCu) + '</span>' +
          (v.giaiTrinh ? '<br><span class="tiny muted">Giải trình của bạn: “' + h(v.giaiTrinh) + '”</span>' : '') + '</span>' +
          (v.quyet === 'huy' ? denMau('Đã huỷ', 'var(--ok)') : v.quyet === 'xacNhan' ? denMau('Đã xác nhận', 'var(--gita-do-ink)') : denMau('Chờ Super Admin', 'var(--warn)')) +
          (!v.quyet ? '<button class="btn ghost sm" data-tcc="mo" data-k="' + h(k) + '">Viết giải trình</button>' : '');
        if(st.mo === k) r += '<div class="dtc-form"><label class="co-f" for="tcc-gt"><span>Giải trình (từ ' + LD_TOI_THIEU + ' ký tự): việc đã làm, chứng cứ ở đâu</span><textarea class="inp" id="tcc-gt" rows="3"></textarea></label>' +
          '<div class="co-hang mt"><button class="btn pri sm" data-tcc="giaitrinh" data-id="' + h(v.id) + '">Gửi giải trình</button><button class="btn ghost sm" data-tcc="dong">Thôi</button></div></div>';
        return r + '</div>';
      }).join('') + '</div>';
    }
    return o;
  }

  /* ── LÀM BÀI / XEM BÀI CỦA MÌNH ── */
  function nganBai(){
    var o = '<div class="co-hang mb"><button class="btn ghost sm" data-tcc="ve">' + ic('arrow','w-3 h-3') + 'Về cấp của tôi</button></div>';
    if(!st.bai){ doc('bai', 'docBaiThi', { luot:st.luot }, function(r){ st.bai = r; }); return o + (st.loi.bai ? canhBaoMau(h(st.loi.bai)) : '<p class="sm muted">Đang mở bài…</p>'); }
    if(!st.khung) doc('khung', 'khungThi', {}, function(r){ st.khung = r; });
    var b = st.bai, mo = b.trangThai === 'dangLam' && b.hanLuc > Date.now(), toiThieu = b.chuToiThieu || 200;
    var conPhut = Math.max(0, Math.round((b.hanLuc - Date.now()) / 60000));
    o += '<h3 class="hvh-h">' + h(b.ma) + ' · ' + h(b.tenCap) + '</h3>';
    o += '<p class="sm muted mb">' + b.de.length + ' ca · đạt từ ' + b.nguong + ' điểm · ' + b.canNguoi + ' người chấm' +
      (mo ? ' · hạn nộp ' + h(ngay(b.hanLuc)) + ' (còn ' + conPhut + ' phút)' : ' · ' + (TT[b.trangThai] ? TT[b.trangThai][0] : b.trangThai)) + '</p>';
    o += tieuChuanCap(capDef(b.he, b.cap));
    if(mo) o += canhBaoMau('Viết bằng lời của bạn, mỗi ca từ ' + toiThieu + ' ký tự; mỗi ca chấm riêng, một ca dưới ' + (b.sanCa || 50) + ' điểm là trượt cả bài. Bài trùng lời giải trong kho sẽ bị máy đánh dấu cho người chấm xem. Vấn đề vượt quyền của bạn thì viết rõ bạn xin ý kiến ai — tự xử lý vấn đề khó là lỗi trượt.', 'var(--gita)');
    var nhap = st.nhap[b.luot] || (st.nhap[b.luot] = []);
    b.de.forEach(function(c, i){
      o += '<div class="card mt tcc-ca"><div class="co-hang"><b class="co-grow">Ca ' + (i + 1) + ' · ' + h(c.ten || c.ma) + '</b><span class="dtc-tag" style="--m:var(--gita)">' + h(c.hang || '') + '</span><span class="dtc-tag" style="--m:var(--ink-4)">' + h(c.tenDang || c.dang) + '</span></div>' +
        '<p class="sm mt">' + h(c.van) + '</p>' + (c.boiCanh ? '<p class="tiny muted">Bối cảnh: ' + h(c.boiCanh) + '</p>' : '') +
        (c.bien.length ? '<div class="co-cb mt">' + c.bien.map(function(x){ return '<div style="--m:var(--warn)"><b>Biến cố</b><span>' + h(x) + '</span></div>'; }).join('') + '</div>' : '') +
        '<p class="sm mt"><b>Nhiệm vụ:</b> ' + h(c.yeuCau) + '</p>' +
        '<div class="tcc-thang tiny">' + c.thang.map(function(t){ return '<div><b>' + h(t.ten) + '</b><span>' + h(t.moTa) + '</span></div>'; }).join('') + '</div>';
      if(mo){
        var v = nhap[i] || '';
        o += '<label class="co-f mt" for="tcc-bl-' + i + '"><span>Bài làm ca ' + (i + 1) + ' · <span id="tcc-dem-' + i + '">' + v.length + '</span>/' + toiThieu + ' ký tự</span>' +
          '<textarea class="inp" id="tcc-bl-' + i + '" rows="7" data-tcc-nhap="' + i + '">' + h(v) + '</textarea></label>';
      } else if(b.baiLam[i]) o += '<div class="tcc-bai mt sm">' + h(b.baiLam[i]) + '</div>';
      o += '</div>';
    });
    if(mo) o += '<div class="co-hang mt"><button class="btn pri" data-tcc="nop">Nộp bài</button><span class="tiny muted">Nộp rồi không sửa được.</span></div>';
    if(!mo && b.cham && b.cham.length){
      o += U.sec('Điểm và nhận xét');
      o += '<div class="co-ds">' + b.cham.map(function(c){
        return '<div class="co-dong"><span class="co-grow"><b class="sm">' + c.diem + ' điểm</b> <span class="tiny muted">· chấm bởi ' + h(c.boiAi) + '</span>' +
          (c.loiTruot ? '<br><span class="tiny" style="color:var(--gita-do-ink)">Lỗi trượt: ' + h(c.loiTruot) + '</span>' : '') +
          '<br><span class="tiny">' + h(c.ghiChu) + '</span></span></div>';
      }).join('') + '</div>';
    } else if(b.trangThai === 'choCham') o += '<p class="sm muted mt">Bài đang chờ chấm. Điểm chỉ hiện khi đủ người chấm.</p>';
    return o;
  }

  /* ── KHUNG CẤP ── */
  function nganKhung(){
    if(!st.khung){ doc('khung', 'khungThi', {}, function(r){ st.khung = r; }); return st.loi.khung ? canhBaoMau(h(st.loi.khung)) : '<p class="sm muted">Đang đọc khung…</p>'; }
    var k = st.khung, L = k.luat, o = '';
    o += '<div class="co-cb mb">' +
      '<div style="--m:var(--gita)"><b>Mỗi tháng</b><span>Thi tối đa ' + L.lanToiDa + ' lượt một thang. Có bài đạt ở cấp đang giữ trở lên thì giữ cấp; không có thì cuối tháng tụt một cấp.</span></div>' +
      '<div style="--m:var(--ink-4)"><b>Đề riêng</b><span>Mỗi bài ghép từ kho cấp cao × ' + k.dang.length + ' dạng nhiệm vụ × ' + k.soBien + ' biến cố, theo tên người, cấp, tháng và lượt. Không có ngân hàng câu hỏi để học thuộc.</span></div>' +
      '<div style="--m:var(--warn)"><b>Vấn đề khó</b><span>Hạng ' + h(L.hangKho.join(' · ')) + ' và mọi vấn đề vượt cấp phải xin ý kiến. Ý kiến được duyệt có hiệu lực ' + L.ngayChoPhep + ' ngày.</span></div>' +
      '<div style="--m:var(--gita-do-ink)"><b>Vi phạm</b><span>Mức 1 hạ ' + L.heQua[1].ha + ' cấp · mức 2 hạ ' + L.heQua[2].ha + ' cấp · mức 3 về cấp 0 và khoá kho ' + L.heQua[3].khoaNgay + ' ngày. Đình chỉ và bồi thường là quyết định của người, máy chỉ ghi đề nghị.</span></div></div>';
    Object.keys(k.he).forEach(function(he){
      var H = k.he[he];
      o += U.sec('Thang ' + H.ten + ' · ' + H.soCap + ' cấp');
      o += '<div class="tcc-bang" role="region" aria-label="Khung cấp ' + h(H.ten) + '" tabindex="0"><table class="tbl sm"><tr><th>Cấp</th><th>Tên</th><th>Ca</th><th>Biến cố</th><th>Đạt từ</th><th>Người chấm</th><th>Phút</th><th>Kho mở</th><th></th></tr>' +
        k.cap[he].map(function(c){
          var key = he + ':' + c.cap;
          var r = '<tr><td class="mono">' + h(c.ma) + '</td><td>' + h(c.ten) + '<br><span class="tiny muted">' + h(c.daiTen) + '</span></td><td>' + c.soCa + '</td><td>' + c.soBien + '</td><td>' + c.nguong + '</td><td>' + c.soNguoiCham + '</td><td>' + c.phut + '</td><td>' + c.kho + '%</td>' +
            '<td><button class="btn ghost sm" data-tcc="mocap" data-k="' + h(key) + '">' + (st.moCap === key ? 'Thu' : 'Xem') + '</button></td></tr>';
          if(st.moCap === key) r += '<tr><td colspan="9"><div class="tcc-chi sm"><p><b>Trọng tâm:</b> ' + h(c.trongTam) + '</p><p><b>Khó hơn cấp trước:</b> ' + h(c.khoHon) + '</p>' +
            '<p><b>Năng lực cần thể hiện</b></p><ul>' + c.nangLuc.map(function(x){ return '<li>' + h(x) + '</li>'; }).join('') + '</ul>' +
            '<p><b>Tiêu chuẩn</b></p><ul>' + c.tieuChuan.map(function(x){ return '<li>' + h(x) + '</li>'; }).join('') + '</ul>' +
            '<p><b>Lỗi trượt ngay</b></p><ul>' + c.loiTruot.map(function(x){ return '<li>' + h(x) + '</li>'; }).join('') + '</ul></div></td></tr>';
          return r;
        }).join('') + '</table></div>';
    });
    return o;
  }

  /* ── XIN Ý KIẾN ── */
  function nganYKien(){
    var o = '<p class="sm muted mb">Vấn đề khó, vượt cấp hay chưa chắc thì xin ý kiến trước khi đề xuất cho nhà. Người duyệt có thể cho làm, chuyển ca cho người có năng lực cao hơn, hoặc từ chối. Giấu vấn đề hay tự xử lý theo kinh nghiệm cá nhân là vi phạm.</p>';
    o += '<div class="co-form mb"><label class="co-f" for="tcc-yk-nha"><span>Mã nhà</span><input class="inp" id="tcc-yk-nha" autocomplete="off"></label>' +
      '<label class="co-f" for="tcc-yk-ma"><span>Mã vấn đề (vd. V2-B-014)</span><input class="inp" id="tcc-yk-ma" autocomplete="off"></label></div>' +
      '<label class="co-f" for="tcc-yk-ly"><span>Vấn đề gì, vì sao khó, đã làm gì, đề nghị ai xử lý (từ ' + LD_TOI_THIEU + ' ký tự)</span><textarea class="inp" id="tcc-yk-ly" rows="3"></textarea></label>' +
      '<div class="co-hang mt mb"><button class="btn pri sm" data-tcc="xin">Gửi xin ý kiến</button></div>';
    if(!st.yk){ doc('yk', 'dsYKien', {}, function(r){ st.yk = r; }); return o + (st.loi.yk ? canhBaoMau(h(st.loi.yk)) : '<p class="sm muted">Đang đọc…</p>'); }
    o += U.sec(st.yk.quanLy ? 'Mọi lượt xin ý kiến' : 'Lượt xin của tôi');
    if(!st.yk.ds.length) return o + '<p class="sm muted">Chưa có lượt nào.</p>';
    var Q = { cho:['Cho làm','var(--ok)'], chuyen:['Đã chuyển','var(--gita)'], tuChoi:['Từ chối','var(--gita-do-ink)'] };
    o += '<div class="co-ds">' + st.yk.ds.map(function(y){
      var q = Q[y.quyet], k = 'yk:' + y.id;
      var r = '<div class="co-dong"><span class="co-grow"><b class="sm">' + h(y.ma) + '</b> <span class="tiny muted">· nhà ' + h(y.maNha) + ' · ' + h(y.boiAi) + ' · ' + h(ngay(y.luc)) + '</span><br><span class="tiny">' + h(y.lyDo) + '</span>' +
        (y.quyet === 'chuyen' && y.choAi ? '<br><span class="tiny muted">Giao cho ' + h(y.choAi) + '</span>' : '') + '</span>' +
        (q ? '<span class="co-den" style="--m:' + q[1] + '"><i></i>' + q[0] + '</span>' : '<span class="co-den" style="--m:var(--warn)"><i></i>Chờ duyệt</span>') +
        (st.yk.quanLy && !y.quyet ? '<button class="btn ghost sm" data-tcc="mo" data-k="' + h(k) + '">Duyệt</button>' : '');
      if(st.mo === k) r += '<div class="dtc-form"><div class="co-form"><label class="co-f" for="tcc-dy-q"><span>Quyết định</span><select class="inp" id="tcc-dy-q">' +
        '<option value="cho">Cho người xin làm</option><option value="chuyen">Chuyển cho người khác</option><option value="tuChoi">Từ chối</option></select></label>' +
        '<label class="co-f" for="tcc-dy-ai"><span>Chuyển cho (tên đăng nhập hoặc email)</span><input class="inp" id="tcc-dy-ai" autocomplete="off"></label></div>' +
        '<label class="co-f mt" for="tcc-dy-gc"><span>Lý do quyết định (từ 10 ký tự)</span><textarea class="inp" id="tcc-dy-gc" rows="2"></textarea></label>' +
        '<div class="co-hang mt"><button class="btn pri sm" data-tcc="duyet" data-id="' + h(y.id) + '">Ghi quyết định</button><button class="btn ghost sm" data-tcc="dong">Thôi</button></div></div>';
      return r + '</div>';
    }).join('') + '</div>';
    return o;
  }

  /* ── CHẤM BÀI ── */
  function nganCham(){
    if(st.chamLuot) return nganChamBai();
    var o = '<p class="sm muted mb">Bạn chỉ thấy bài mình được chấm: không phải bài của mình, và nếu không phải quản lý thì bài ở cấp thấp hơn cấp bạn đang giữ. Chấm mù: chưa chấm thì không thấy điểm của người chấm khác.</p>';
    if(!st.cham){ doc('cham', 'dsBaiCham', {}, function(r){ st.cham = r.ds; }); return o + (st.loi.cham ? canhBaoMau(h(st.loi.cham)) : '<p class="sm muted">Đang đọc hàng chấm…</p>'); }
    if(!st.cham.length) return o + '<p class="sm muted">Không có bài nào chờ bạn chấm.</p>';
    return o + '<div class="co-ds">' + st.cham.map(function(d){
      return '<div class="co-dong"><span class="co-grow"><b class="sm">' + h(d.ma) + '</b> <span class="tiny muted">· nộp ' + h(ngay(d.nopLuc)) + ' · đã chấm ' + d.daCham + '/' + d.canNguoi + '</span></span>' +
        (d.coCanhBao ? '<span class="co-den" style="--m:var(--gita-do-ink)"><i></i>Máy báo trùng kho</span>' : '') +
        '<button class="btn pri sm" data-tcc="mocham" data-l="' + h(d.luot) + '">Chấm</button></div>';
    }).join('') + '</div>';
  }
  function nganChamBai(){
    var o = '<div class="co-hang mb"><button class="btn ghost sm" data-tcc="vecham">' + ic('arrow','w-3 h-3') + 'Về hàng chấm</button></div>';
    if(!st.khung) doc('khung', 'khungThi', {}, function(r){ st.khung = r; });
    if(!st.chamBai){ doc('chamBai', 'docBaiThi', { luot:st.chamLuot }, function(r){ st.chamBai = r; }); return o + (st.loi.chamBai ? canhBaoMau(h(st.loi.chamBai)) : '<p class="sm muted">Đang mở bài…</p>'); }
    var b = st.chamBai, cd = capDef(b.he, b.cap);
    o += '<h3 class="hvh-h">' + h(b.ma) + ' · ' + h(b.tenCap) + (b.muc === 'giu' ? ' · thi giữ cấp' : '') + '</h3><p class="sm muted mb">Đạt từ ' + b.nguong + ' điểm (trung bình các ca, mỗi ca 4 tiêu chí × 25) và không ca nào dưới ' + (b.sanCa || 50) + '. Mỗi người chấm một lần, không sửa được. Người thi không hiện tên.</p>' + tieuChuanCap(cd);
    if(b.canhBao && b.canhBao.length) o += canhBaoMau('Máy thấy bài trùng lời giải trong kho ở ' + b.canhBao.map(function(c){ return 'ca ' + c.ca + ' (' + c.tyLe + '%' + (c.cum ? ', ' + c.cum + ' cụm' : '') + ')'; }).join(' · ') + '. Đọc kỹ trước khi chấm; nếu là chép thì ghi lỗi trượt và báo quản lý ghi vi phạm "Gian lận khi thi".');
    b.de.forEach(function(c, i){
      o += '<div class="card mt tcc-ca"><b>Ca ' + (i + 1) + ' · ' + h(c.ten || c.ma) + '</b> <span class="tiny muted">· ' + h(c.tenDang || c.dang) + '</span>' +
        '<p class="sm mt">' + h(c.van) + '</p>' + (c.bien.length ? '<p class="tiny muted">Biến cố: ' + h(c.bien.join(' · ')) + '</p>' : '') +
        '<p class="sm"><b>Nhiệm vụ:</b> ' + h(c.yeuCau) + '</p><div class="tcc-bai mt sm">' + h(b.baiLam[i] || '') + '</div>' +
        '<div class="co-form mt">' + c.thang.map(function(t, j){
          return '<label class="co-f" for="tcc-d-' + i + '-' + j + '"><span>' + h(t.ten) + ' (0–25)</span><input class="inp" id="tcc-d-' + i + '-' + j + '" type="number" min="0" max="25" step="1" inputmode="numeric" title="' + h(t.moTa) + '"></label>';
        }).join('') + '</div></div>';
    });
    o += '<label class="co-f mt" for="tcc-lt"><span>Lỗi trượt ngay (nếu có — chọn thì bài trượt dù điểm cao)</span><select class="inp" id="tcc-lt"><option value="">Không có</option>' +
      (cd ? cd.loiTruot.map(function(x){ return '<option value="' + h(x) + '">' + h(x) + '</option>'; }).join('') : '') + '</select></label>' +
      '<label class="co-f mt" for="tcc-nx"><span>Nhận xét: điểm mạnh, chỗ cần nâng (từ ' + NX_TOI_THIEU + ' ký tự)</span><textarea class="inp" id="tcc-nx" rows="3"></textarea></label>' +
      '<div class="co-hang mt"><button class="btn pri" data-tcc="cham" data-n="' + b.de.length + '">Ghi điểm</button></div>';
    return o;
  }

  /* ── XẾP HẠNG LƯƠNG THƯỞNG THÁNG · LỊCH TRẢ LƯƠNG ── */
  function kyTruoc(){ var d = new Date(Date.now() + 7 * 3600000 - 20 * 86400000); return d.toISOString().slice(0, 7); }
  /* Ba trạng thái, không gộp: đạt · không đạt · CHƯA XÉT (thiếu mẫu phiếu). */
  function oThuong(t){
    if(!t) return '<span class="muted">—</span>';
    var nhan = t.trangThai === 'dat' ? '<b style="color:var(--gita)">Thưởng ' + (t.ptLuong || 0) + '% lương</b>' : t.trangThai === 'chuaXet' ? '<span class="muted">Chưa xét</span>' : '<span>Chưa đạt</span>';
    return nhan + (t.tyLeHaiLong !== null && t.tyLeHaiLong !== undefined ? '<br><span class="tiny muted">hài lòng ' + t.tyLeHaiLong + '%</span>' : '') +
      '<br><span class="tiny muted">' + h(t.lyDo) + '</span>';
  }
  function nganXepHang(){
    var ky = st.xhKy || kyTruoc();
    var o = '<p class="sm muted mb">Hạng tháng ghép từ ba thứ đo được trong sổ: điểm thi ngày 28, cấp chứng chỉ, và phiếu tháng của chính các gia đình mình phụ trách. Không ô nào người được xếp hạng tự gõ.</p>';
    o += '<div class="co-form mb"><label class="co-f" for="tcc-xh-ky"><span>Kỳ (tháng)</span><input class="inp" id="tcc-xh-ky" type="month" value="' + h(ky) + '"></label>' +
      '<div class="co-f"><span>&nbsp;</span><button class="btn ghost sm" data-tcc="xhky">Xem kỳ này</button></div></div>';
    if(!st.xh || st.xh.ky !== ky){ doc('xh', 'xepHangThang', { ky:ky }, function(r){ st.xh = r; }); o += st.loi.xh ? canhBaoMau(h(st.loi.xh)) : '<p class="sm muted">Đang tính…</p>'; }
    else {
      var x = st.xh, L = x.luat;
      if(x.ngayTra) o += canhBaoMau('Lương kỳ ' + h(x.ky) + ' trả ngày <b>' + h(x.ngayTra.ngay.split('-').reverse().join('/')) + '</b>' + (x.ngayTra.doi ? ' (dời vì ' + h(x.ngayTra.lyDo) + ')' : '') + '.', 'var(--gita)');
      o += '<div class="co-cb mb"><div style="--m:var(--ink-4)"><span>Trọng số KPI: thi ngày 28 ' + L.trongSo.thi + ' · cấp chứng chỉ ' + L.trongSo.cap + ' · tỷ lệ nhà hài lòng ' + L.trongSo.phanHoi +
        '. Hạng ' + L.hang.map(function(g){ return g.hang + (g.tu ? ' từ ' + g.tu : ''); }).join(' · ') + '. Dưới ' + L.mauToiThieu + ' nhà có phiếu thì phần phản hồi ghi "chưa đủ mẫu", không tính là 0. ' +
        (L.thuong ? '<b>Thưởng lương</b> khi KPI từ ' + L.thuong.kpi + ' VÀ từ ' + L.thuong.haiLong + '% nhà hài lòng (nhà hài lòng = điểm hài lòng trung bình từ ' + L.csatHaiLong + '/5); mức thưởng ' +
          (L.mucThuong || []).slice().reverse().map(function(m){ return m.pt + '% lương từ KPI ' + m.tu; }).join(' · ') + '. ' : '') + h(x.gioiHan) + '</span></div></div>';
      if(!x.ds.length) o += '<p class="sm muted">' + (x.chiDongCuaToi ? 'Vai của bạn không nằm trong thang Coach / Tư vấn.' : 'Chưa có Coach hay Tư vấn viên nào.') + '</p>';
      else o += '<div class="tcc-bang" role="region" aria-label="Xếp hạng lương thưởng" tabindex="0"><table class="tbl sm"><tr><th>Nhân sự</th><th>Hạng</th><th>Điểm</th><th>Thi ngày 28</th><th>Cấp</th><th>Nhà hài lòng</th><th>Thưởng</th></tr>' +
        x.ds.map(function(d){
          var tp = {}; d.thanhPhan.forEach(function(t){ tp[t.ma] = t; });
          var o2 = function(t){ return (t.giaTri === null ? '<span class="muted">chưa đủ mẫu</span>' : t.giaTri) + (t.ghiChu ? '<br><span class="tiny muted">' + h(t.ghiChu) + '</span>' : ''); };
          return '<tr><td>' + h(d.maNguoi) + '<br><span class="tiny muted">' + h(d.role) + ' · ' + d.soNhaPhuTrach + ' nhà phụ trách</span></td><td><b>' + h(d.hang) + '</b></td><td>' + d.diem +
            (d.trongBoQua ? '<br><span class="tiny muted">bỏ ' + d.trongBoQua + '% trọng số</span>' : '') + '</td><td>' + o2(tp.thi) + '</td><td>' + o2(tp.cap) + '</td><td>' + o2(tp.phanHoi) + '</td><td>' + oThuong(d.thuong) + '</td></tr>';
        }).join('') + '</table></div>';
    }
    o += U.sec('Lịch trả lương');
    if(!st.lich){ doc('lich', 'lichTraLuong', {}, function(r){ st.lich = r; }); o += st.loi.lich ? canhBaoMau(h(st.loi.lich)) : '<p class="sm muted">Đang đọc…</p>'; }
    else {
      o += '<p class="sm muted mb">Ngày ' + st.lich.luat.ngayTra + ' hằng tháng trả lương của tháng trước; ngày ấy trùng ngày nghỉ (thứ Bảy, Chủ nhật, lễ, ngày Super Admin khai) thì trả ngày ' + st.lich.luat.ngayLui + '; ngày ' + st.lich.luat.ngayLui + ' cũng nghỉ thì trả ngày làm việc kế tiếp. Ngày trả bị dời thì mỗi nhân sự nhận một thông báo trong hộp thông báo.</p>';
      o += '<div class="tcc-bang" role="region" aria-label="Lịch trả lương ' + st.lich.nam + '" tabindex="0"><table class="tbl sm"><tr><th>Lương tháng</th><th>Ngày trả</th></tr>' + st.lich.lich.map(function(l){
        return '<tr><td>' + h(l.ky) + '</td><td>' + h(l.ngay.split('-').reverse().join('/')) + (l.doi ? ' <span class="tiny muted">· ' + h(l.lyDo) + '</span>' : '') + '</td></tr>'; }).join('') + '</table></div>';
      if(st.lich.nghiKhai.length) o += '<p class="tiny muted">Ngày đã khai: ' + st.lich.nghiKhai.map(function(n){ return h(n.ngay + ' ' + (n.nghi ? 'nghỉ' : 'làm') + ' · ' + n.ten); }).join(' · ') + '</p>';
      if(laR01()) o += '<div class="co-form mt"><label class="co-f" for="tcc-nn-ngay"><span>Ngày (Tết âm lịch, nghỉ bù…)</span><input class="inp" id="tcc-nn-ngay" type="date"></label>' +
        '<label class="co-f" for="tcc-nn-ten"><span>Tên ngày</span><input class="inp" id="tcc-nn-ten" autocomplete="off"></label>' +
        '<div class="co-f"><span>&nbsp;</span><div class="co-hang"><button class="btn pri sm" data-tcc="nghi" data-n="1">Khai là ngày nghỉ</button><button class="btn ghost sm" data-tcc="nghi" data-n="0">Khai là ngày làm</button></div></div></div>';
    }
    return o;
  }

  /* ── ĐỘI · VI PHẠM ── */
  function nganQuanLy(){
    var o = '';
    if(laR01()){
      var bat = st.toi ? st.toi.cong : null;
      o += U.sec('Cổng thi');
      o += '<p class="sm mb">Bật cổng thì kho cấp cao khoá theo cấp của từng người, và vấn đề khó phải xin ý kiến. Quản lý (R01–R04) không qua cổng.' +
        (bat === null ? '' : ' Hiện đang <b>' + (bat ? 'BẬT' : 'TẮT') + '</b>.') + '</p>' +
        '<label class="co-f" for="tcc-cong-ly"><span>Lý do bật/tắt (ghi vào sổ)</span><input class="inp" id="tcc-cong-ly" autocomplete="off"></label>' +
        '<div class="co-hang mt mb"><button class="btn pri sm" data-tcc="cong" data-bat="1">Bật cổng</button><button class="btn ghost sm" data-tcc="cong" data-bat="0">Tắt cổng</button></div>';
      if(!st.toi) doc('toi', 'thiCuaToi', {}, function(r){ st.toi = r; });
    }
    o += U.sec('Ghi vi phạm');
    o += '<p class="sm muted mb">Chỉ ghi cho người bậc thấp hơn mình. Máy hạ cấp ngay theo mức; đề nghị đình chỉ hay bồi thường chỉ được gửi lên Giám đốc và Super Admin — máy không tự làm.</p>' +
      '<div class="co-form"><label class="co-f" for="tcc-vp-ai"><span>Tên đăng nhập hoặc email</span><input class="inp" id="tcc-vp-ai" autocomplete="off"></label>' +
      '<label class="co-f" for="tcc-vp-he"><span>Thang</span><select class="inp" id="tcc-vp-he"><option value="tuvan">Tư vấn</option><option value="coach">Coach</option></select></label>' +
      '<label class="co-f" for="tcc-vp-loai"><span>Loại</span><select class="inp" id="tcc-vp-loai">' +
      (st.khung ? Object.keys(st.khung.luat.viPham).map(function(k){ return '<option value="' + k + '">' + h(st.khung.luat.viPham[k]) + '</option>'; }).join('') : '') + '</select></label>' +
      '<label class="co-f" for="tcc-vp-muc"><span>Mức</span><select class="inp" id="tcc-vp-muc"><option value="1">Mức 1</option><option value="2">Mức 2</option><option value="3">Mức 3</option></select></label>' +
      '<label class="co-f" for="tcc-vp-dx"><span>Đề nghị lên cấp cao</span><select class="inp" id="tcc-vp-dx"><option value="">Không</option><option value="dinhChi">Đề nghị đình chỉ</option><option value="boiThuong">Đề nghị bồi thường</option></select></label></div>' +
      '<label class="co-f mt" for="tcc-vp-cc"><span>Chứng cứ: việc gì, lúc nào, ở ca nào (từ ' + LD_TOI_THIEU + ' ký tự)</span><textarea class="inp" id="tcc-vp-cc" rows="3"></textarea></label>' +
      '<div class="co-hang mt mb"><button class="btn pri sm" data-tcc="ghivp">Ghi vi phạm</button></div>';
    if(!st.khung) doc('khung', 'khungThi', {}, function(r){ st.khung = r; });

    o += U.sec('Sổ vi phạm');
    if(!st.soVp){ doc('soVp', 'dsViPham', {}, function(r){ st.soVp = r.ds; }); o += st.loi.soVp ? canhBaoMau(h(st.loi.soVp)) : '<p class="sm muted">Đang đọc…</p>'; }
    else if(!st.soVp.length) o += '<p class="sm muted">Chưa có vi phạm nào được ghi.</p>';
    else o += '<div class="co-ds">' + st.soVp.map(function(v){
      var k = 'q:' + v.id;
      var r = '<div class="co-dong"><span class="co-grow"><b class="sm">' + h(v.maNguoi) + '</b> <span class="tiny muted">· ' + h(v.tenLoai || v.loai) + ' · mức ' + v.mucDo + ' · ghi bởi ' + h(v.boiAi) + ' · ' + h(ngay(v.luc)) + '</span>' +
        '<br><span class="tiny">' + h(v.chungCu) + '</span>' + (v.deXuat ? '<br><span class="tiny" style="color:var(--gita-do-ink)">Đề nghị ' + (v.deXuat === 'dinhChi' ? 'đình chỉ' : 'bồi thường') + ' — chờ người có thẩm quyền</span>' : '') +
        '<br><span class="tiny muted">Giải trình: ' + (v.giaiTrinh ? '“' + h(v.giaiTrinh) + '”' : 'chưa có') + '</span></span>' +
        (v.quyet ? '<span class="co-den" style="--m:' + (v.quyet === 'huy' ? 'var(--ok)' : 'var(--gita-do-ink)') + '"><i></i>' + (v.quyet === 'huy' ? 'Đã huỷ' : 'Đã xác nhận') + '</span>'
          : laR01() ? '<button class="btn ghost sm" data-tcc="mo" data-k="' + h(k) + '">Quyết định</button>' : '<span class="co-den" style="--m:var(--warn)"><i></i>Chờ Super Admin</span>');
      if(st.mo === k) r += '<div class="dtc-form"><label class="co-f" for="tcc-q-gc"><span>Lý do (từ 10 ký tự)</span><textarea class="inp" id="tcc-q-gc" rows="2"></textarea></label>' +
        '<div class="co-hang mt"><button class="btn pri sm" data-tcc="quyet" data-q="xacNhan" data-id="' + h(v.id) + '">Xác nhận vi phạm</button><button class="btn ghost sm" data-tcc="quyet" data-q="huy" data-id="' + h(v.id) + '">Huỷ (ghi nhầm)</button><button class="btn ghost sm" data-tcc="dong">Thôi</button></div></div>';
      return r + '</div>';
    }).join('') + '</div>';

    ['tuvan', 'coach'].forEach(function(he){
      o += U.sec('Đội · thang ' + (he === 'coach' ? 'Coach' : 'Tư vấn'));
      var d = st.doi[he];
      if(!d){ doc('doi-' + he, 'doiThi', { he:he }, function(r){ st.doi[he] = r.ds; }); o += st.loi['doi-' + he] ? canhBaoMau(h(st.loi['doi-' + he])) : '<p class="sm muted">Đang đọc…</p>'; return; }
      if(!d.length){ o += '<p class="sm muted">Chưa có nhân sự nào ở thang này.</p>'; return; }
      o += '<div class="tcc-bang" role="region" aria-label="Đội thang ' + he + '" tabindex="0"><table class="tbl sm"><tr><th>Nhân sự</th><th>Vai</th><th>Cấp</th><th>Tháng này</th></tr>' + d.map(function(p){
        return '<tr><td>' + h(p.maNguoi) + '</td><td>' + h(p.role) + '</td><td>' + p.cap + '</td><td>' + (p.datThangNay ? 'Đã giữ cấp' : 'Chưa thi') +
          (p.khoaDen && p.khoaDen > Date.now() ? ' · kho khoá tới ' + h(ngay(p.khoaDen)) : '') + '</td></tr>';
      }).join('') + '</table></div>';
    });
    return o;
  }

  G.VIEWS['thi-chung-chi'] = function(){
    var o = U.ph({ eyebrow:'ĐÀO TẠO & NĂNG LỰC', ic:'shield', t:'Thi chứng chỉ',
      lead:'Tư vấn 50 cấp · Coach 100 cấp. Cấp càng cao mở càng nhiều phần kho cấp cao. Mỗi tháng thi lại để giữ cấp; đề ghép riêng cho từng người từ tình huống thật trong kho, người chấm khác người thi.' });
    giuDung();
    if(!coMayChu()) return o + '<div class="co-mau">' + ic('alert','w-4 h-4') + '<span>Bài thi, điểm và cấp nằm ở máy chủ của Học viện. Tài khoản mẫu không thi được: một cấp chỉ nằm trong máy của bạn thì không ai kiểm lại được, và không được mở kho.</span></div>' +
      '<div class="co-cb"><div style="--m:var(--gita)"><b>Thi ở đâu</b><span>Đăng nhập bằng tài khoản nhân sự thật. Tư vấn viên thi thang Tư vấn; Trưởng nhóm Coach, Coach cao cấp, Coach và Giáo viên thi thang Coach.</span></div>' +
      '<div style="--m:var(--warn)"><b>Vấn đề khó</b><span>Luôn xin ý kiến qua ngăn "Xin ý kiến"; người duyệt có thể chuyển ca cho người có năng lực cao hơn. Giấu vấn đề hay tự xử lý là vi phạm và bị hạ cấp.</span></div></div>';
    o += thanh();
    if(st.ngan === 'toi' && st.luot) return o + nganBai();
    if(st.ngan === 'xephang') return o + nganXepHang();
    if(st.ngan === 'khung') return o + nganKhung();
    if(st.ngan === 'ykien') return o + nganYKien();
    if(st.ngan === 'cham' && lv() <= 6) return o + nganCham();
    if(st.ngan === 'quanly' && lv() <= 5) return o + nganQuanLy();
    return o + nganToi();
  };

  /* Bài đang viết giữ trong bộ nhớ của trang — màn vẽ lại (toast, đổi
     ngăn) không được làm mất chữ. Không ghi vào localStorage: bài thi
     nằm trên máy dùng chung thì người sau đọc được. */
  document.addEventListener('input', function(e){
    var el = e.target; if(!el || !el.getAttribute) return;
    var i = el.getAttribute('data-tcc-nhap'); if(i === null || !st.luot) return;
    (st.nhap[st.luot] || (st.nhap[st.luot] = []))[Number(i)] = el.value;
    var d = document.getElementById('tcc-dem-' + i); if(d) d.textContent = String(el.value.length);
  });
  document.addEventListener('click', function(e){
    var el = e.target.closest && e.target.closest('[data-tcc]'); if(!el) return;
    var a = el.getAttribute('data-tcc');
    giuDung();
    if(a === 'ngan'){ st.ngan = el.getAttribute('data-ma'); st.mo = ''; st.luot = ''; st.bai = null; st.chamLuot = ''; st.chamBai = null; return veLai(); }
    if(a === 'mo'){ st.mo = el.getAttribute('data-k'); veLai(); setTimeout(function(){ var t = document.querySelector('.dtc-form textarea,.dtc-form select'); if(t) t.focus(); }, 30); return; }
    if(a === 'dong'){ st.mo = ''; return veLai(); }
    if(a === 'mocap'){ var k = el.getAttribute('data-k'); st.moCap = st.moCap === k ? '' : k; return veLai(); }
    if(a === 'lam'){ st.luot = el.getAttribute('data-l'); st.bai = null; return veLai(); }
    if(a === 've'){ st.luot = ''; st.bai = null; st.toi = null; return veLai(); }
    if(a === 'batdau'){
      var muc = el.getAttribute('data-muc');
      el.disabled = true;
      return G.goiMayChu('batDauThi', { he:el.getAttribute('data-he'), muc:muc }).then(function(r){
        el.disabled = false;
        if(r && r.ok){ U.toast('Đã mở bài cấp ' + r.cap + ' · ' + r.phut + ' phút.', 'ok'); st.luot = r.luot; st.bai = null; st.toi = null; veLai(); }
        else U.toast((r && r.error) || 'Không mở được bài.', 'err');
      });
    }
    if(a === 'nop'){
      var bl = (st.nhap[st.luot] || []).slice(0, st.bai ? st.bai.de.length : 0);
      var tt = (st.bai && st.bai.chuToiThieu) || 200;
      var thieu = (st.bai ? st.bai.de : []).map(function(_, i){ return (bl[i] || '').trim().length < tt ? i + 1 : 0; }).filter(Boolean);
      if(thieu.length) return U.toast('Ca ' + thieu.join(', ') + ' chưa đủ ' + tt + ' ký tự.', 'err');
      if(!window.confirm('Nộp bài? Nộp rồi không sửa được.')) return;
      return ghi('nopBaiThi', { luot:st.luot, baiLam:bl.map(function(s){ return s.trim(); }) }, function(r){ return r.quaGio ? 'Đã nộp — quá giờ, bài sẽ không đạt.' : 'Đã nộp. Bài chờ chấm.'; },
        function(){ delete st.nhap[st.luot]; st.bai = null; st.toi = null; veLai(); });
    }
    if(a === 'giaitrinh'){
      var gtx = gt('tcc-gt'); if(gtx.length < LD_TOI_THIEU) return U.toast('Giải trình từ ' + LD_TOI_THIEU + ' ký tự.', 'err');
      return ghi('giaiTrinhViPham', { id:el.getAttribute('data-id'), noiDung:gtx }, function(){ return 'Đã gửi giải trình.'; }, function(){ st.mo = ''; taiLai(); });
    }
    if(a === 'xin'){
      var ly = gt('tcc-yk-ly');
      if(!gt('tcc-yk-nha') || !gt('tcc-yk-ma') || ly.length < LD_TOI_THIEU) return U.toast('Cần mã nhà, mã vấn đề và lời trình bày từ ' + LD_TOI_THIEU + ' ký tự.', 'err');
      return ghi('xinYKienKho', { maNha:gt('tcc-yk-nha'), ma:gt('tcc-yk-ma').toUpperCase(), lyDo:ly }, function(){ return 'Đã gửi. Chờ người quản lý duyệt.'; }, taiLai);
    }
    if(a === 'duyet'){
      var q = gt('tcc-dy-q'), gc = gt('tcc-dy-gc');
      if(gc.length < 10) return U.toast('Ghi lý do từ 10 ký tự.', 'err');
      if(q === 'chuyen' && !gt('tcc-dy-ai')) return U.toast('Nhập người nhận ca.', 'err');
      return ghi('duyetYKien', { id:el.getAttribute('data-id'), quyet:q, choAi:gt('tcc-dy-ai'), ghiChu:gc }, function(r){ return r.choAi ? 'Đã ghi. Ca giao cho ' + r.choAi + '.' : 'Đã ghi quyết định.'; }, function(){ st.mo = ''; taiLai(); });
    }
    if(a === 'mocham'){ st.chamLuot = el.getAttribute('data-l'); st.chamBai = null; return veLai(); }
    if(a === 'vecham'){ st.chamLuot = ''; st.chamBai = null; st.cham = null; return veLai(); }
    if(a === 'cham'){
      var n = Number(el.getAttribute('data-n')), ct = [], sai = false;
      for(var i = 0; i < n; i++){ var dong = []; for(var j = 0; j < 4; j++){ var s = gt('tcc-d-' + i + '-' + j), v = Number(s); if(s === '' || !(v >= 0 && v <= 25) || Math.round(v) !== v) sai = true; dong.push(v); } ct.push(dong); }
      if(sai) return U.toast('Mỗi ca 4 tiêu chí, mỗi tiêu chí số nguyên 0–25.', 'err');
      var nx = gt('tcc-nx'); if(nx.length < NX_TOI_THIEU) return U.toast('Nhận xét từ ' + NX_TOI_THIEU + ' ký tự.', 'err');
      return ghi('chamBaiThi', { luot:st.chamLuot, chiTiet:ct, loiTruot:gt('tcc-lt'), ghiChu:nx }, function(r){ return 'Đã ghi ' + r.diem + ' điểm. ' + (TT[r.trangThai] ? TT[r.trangThai][0] : ''); },
        function(){ st.chamLuot = ''; st.chamBai = null; st.cham = null; veLai(); });
    }
    if(a === 'cong'){
      var lyc = gt('tcc-cong-ly'); if(lyc.length < 10) return U.toast('Ghi lý do từ 10 ký tự.', 'err');
      return ghi('datCongThi', { bat:el.getAttribute('data-bat') === '1', lyDo:lyc }, function(r){ return r.bat ? 'Đã bật cổng thi.' : 'Đã tắt cổng thi.'; }, taiLai);
    }
    if(a === 'ghivp'){
      var cc = gt('tcc-vp-cc');
      if(!gt('tcc-vp-ai') || cc.length < LD_TOI_THIEU) return U.toast('Cần người bị ghi và chứng cứ từ ' + LD_TOI_THIEU + ' ký tự.', 'err');
      return ghi('ghiViPham', { maNguoi:gt('tcc-vp-ai'), he:gt('tcc-vp-he'), loai:gt('tcc-vp-loai'), mucDo:Number(gt('tcc-vp-muc')), deXuat:gt('tcc-vp-dx'), chungCu:cc },
        function(r){ return r.vi || 'Đã ghi.'; }, taiLai);
    }
    if(a === 'xhky'){ var k = gt('tcc-xh-ky'); if(!/^\d{4}-\d{2}$/.test(k)) return U.toast('Chọn một tháng.', 'err'); st.xhKy = k; st.xh = null; return veLai(); }
    if(a === 'nghi'){
      var nn = gt('tcc-nn-ngay'), tn = gt('tcc-nn-ten');
      if(!nn || tn.length < 3) return U.toast('Chọn ngày và ghi tên ngày (từ 3 ký tự).', 'err');
      return ghi('khaiNgayNghi', { ngay:nn, ten:tn, nghi:el.getAttribute('data-n') === '1' }, function(){ return 'Đã khai ngày ' + nn + '.'; }, function(){ st.lich = null; st.xh = null; veLai(); });
    }
    if(a === 'quyet'){
      var qg = gt('tcc-q-gc'); if(qg.length < 10) return U.toast('Ghi lý do từ 10 ký tự.', 'err');
      return ghi('quyetViPham', { id:el.getAttribute('data-id'), quyet:el.getAttribute('data-q'), ghiChu:qg }, function(){ return 'Đã ghi quyết định.'; }, function(){ st.mo = ''; taiLai(); });
    }
  });
})();
