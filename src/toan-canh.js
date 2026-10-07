/* ═══════════════════════════════════════════════════════════════
   GITA 365 — TOÀN CẢNH CRM · TOÀN CẢNH TÀI CHÍNH (V50·168)

   Chủ hệ: "CRM và Tài chính hiển thị đầy đủ bảng, sơ đồ, biểu đồ để tôi
   nhìn được khung toàn diện trước khi góp ý". Mỗi màn bảy khối:
     1. Chỉ số chính — số thật từ Trung tâm đo lường (docTrungTamDo) khi đã
        nối máy chủ và vai R01–R03; chưa nối thì ví dụ minh hoạ CÓ NHÃN.
     2. Sơ đồ quy trình (bước · bảng ghi · cửa máy chủ).
     3. Sơ đồ quan hệ bảng (bảng trung tâm và các bảng nối với nó).
     4. Biểu đồ — xu hướng từ ảnh chụp hằng ngày của Trung tâm (lichSuTrungTamDo)
        khi có; phân bổ chưa có cửa đọc riêng thì vẽ khung minh hoạ có nhãn.
     5. Ma trận chức năng × vai — đúng cổng ở máy chủ (soát 07/10/2026).
     6. Kiểm soát rủi ro — mỗi rủi ro gắn chỉ số canh nó.
     7. Danh mục bảng — từ G.KHUNG_DL (sinh từ csdl.sql); bấm sang Khung dữ
        liệu để xem từng cột.
   Mỗi khối mang nhãn "Số thật" hoặc "Minh hoạ" — không trộn mà không nói.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G; G.VIEWS = G.VIEWS || {};
(function(){
  var U = G.U, h = U.h, ic = U.ic;
  var st = { ai:'', d:null, ls:null, dang:false, loi:'' };

  function lv(){ var r = G.S && G.S.roleObj; return r && r.lv ? r.lv : 99; }
  function coMayChu(){ return !!(G.API_CAP_PHEP && G.PHIEN_TOKEN); }
  function soThat(){ return coMayChu() && lv() <= 3; }
  function veLai(){ if(G.render) G.render(); }
  function nhanNguon(that){ return '<span class="tc-nhan ' + (that ? 'tc-that' : 'tc-mau') + '">' + (that ? 'Số thật' : 'Minh hoạ') + '</span>'; }
  function khoi(ten, phu, that, than){
    return '<section class="card mb tc-khoi"><div class="tc-khoi-dau"><b>' + h(ten) + '</b>' + (that === null ? '' : nhanNguon(that)) + '</div>' +
      (phu ? '<p class="tiny muted" style="margin:2px 0 10px">' + h(phu) + '</p>' : '') + than + '</section>';
  }

  /* ── Số thật từ Trung tâm đo lường ── */
  function canSo(){
    var ai = String((G.S && G.S.acc && G.S.acc.u) || '');
    if(st.ai !== ai){ st = { ai:ai, d:null, ls:null, dang:false, loi:'' }; }
    if(!soThat() || st.d || st.dang) return;
    st.dang = true;
    Promise.all([G.goiMayChu('docTrungTamDo', { ngay:30 }), G.goiMayChu('lichSuTrungTamDo', {})]).then(function(r){
      st.dang = false;
      if(r[0] && r[0].ok) st.d = r[0]; else st.loi = (r[0] && r[0].error) || 'Chưa đọc được Trung tâm đo lường.';
      if(r[1] && r[1].ok) st.ls = r[1].ds || [];
      if(G.S && /^toan-canh-/.test(G.S.view)) veLai();
    });
  }
  function kpiDef(ma){ var T = G.TU; for(var i = 0; T && i < T.KPI.length; i++) if(T.KPI[i].ma === ma) return T.KPI[i]; return null; }
  function giaTri(ma){ if(!st.d || !st.d.kpi) return null; for(var i = 0; i < st.d.kpi.length; i++) if(st.d.kpi[i].ma === ma) return st.d.kpi[i]; return null; }
  var MAU_TT = { dat:'var(--ok)', canhBao:'var(--warn)', xau:'var(--gita-do)', chuaDo:'var(--ink-4)', theoDoi:'var(--gita)' };
  function oSo(ma, mau){
    var k = kpiDef(ma); if(!k) return null;
    var g = soThat() ? giaTri(ma) : null, v, tt;
    if(g){ v = g.gt; tt = g.tt; } else { v = mau; tt = 'mau'; }
    var hien = v == null ? 'chưa đo' : (k.dv === 'đ' ? U.bdGon(v) + ' đ' : String(v).replace('.', ',') + (k.dv && k.dv !== 'đ' ? ' ' + k.dv : ''));
    return { k:k.ten, v:hien, d: g ? (tt === 'dat' ? 'đạt' : tt === 'canhBao' ? 'cảnh báo' : tt === 'xau' ? 'cần xử lý' : tt === 'chuaDo' ? 'chưa đủ dữ liệu' : 'theo dõi') : 'ví dụ', c: g ? (MAU_TT[tt] || 'var(--gita)') : 'var(--ink-4)' };
  }
  function chuoi(ma, mau){
    if(soThat() && st.ls && st.ls.length >= 2){
      var pts = st.ls.map(function(x){ var o = null; (x.kpi || []).forEach(function(z){ if(z[0] === ma) o = z[1]; }); return { nhan:String(x.ngay).slice(5), gia:o == null ? 0 : Number(o) }; });
      return { that:true, pts:pts };
    }
    return { that:false, pts:mau };
  }

  /* ── Sơ đồ quan hệ bảng: bảng trung tâm + các bảng nối ── */
  function veSao(tam, ve){
    var W = 760, H = 330, cx = W / 2, cy = H / 2, R = 128, n = ve.length;
    var o = '<div class="tc-cuon"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Quan hệ của bảng ' + h(tam) + '" class="tc-sao">';
    ve.forEach(function(x, i){
      var a = -Math.PI / 2 + i * 2 * Math.PI / n, x2 = cx + Math.cos(a) * R * 2.05, y2 = cy + Math.sin(a) * R;
      var mx = (cx + x2) / 2, my = (cy + y2) / 2;
      o += '<line x1="' + cx + '" y1="' + cy + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="currentColor" stroke-opacity=".35"/>' +
        '<text x="' + mx.toFixed(1) + '" y="' + (my - 4).toFixed(1) + '" font-size="10.5" text-anchor="middle" fill="currentColor" fill-opacity=".7">' + h(x[1]) + '</text>';
    });
    ve.forEach(function(x, i){
      var a = -Math.PI / 2 + i * 2 * Math.PI / n, x2 = cx + Math.cos(a) * R * 2.05, y2 = cy + Math.sin(a) * R, w = Math.max(84, x[0].length * 7.4 + 18);
      o += '<rect x="' + (x2 - w / 2).toFixed(1) + '" y="' + (y2 - 14).toFixed(1) + '" width="' + w.toFixed(1) + '" height="28" rx="8" fill="var(--surface)" stroke="currentColor" stroke-opacity=".5"/>' +
        '<text x="' + x2.toFixed(1) + '" y="' + (y2 + 4).toFixed(1) + '" font-size="12" text-anchor="middle" fill="currentColor" font-family="var(--mono,monospace)">' + h(x[0]) + '</text>';
    });
    var wt = Math.max(110, tam.length * 8 + 26);
    o += '<rect x="' + (cx - wt / 2) + '" y="' + (cy - 17) + '" width="' + wt + '" height="34" rx="9" fill="var(--gita-mo-1)" stroke="var(--gita)" stroke-width="2"/>' +
      '<text x="' + cx + '" y="' + (cy + 5) + '" font-size="13" font-weight="700" text-anchor="middle" fill="currentColor" font-family="var(--mono,monospace)">' + h(tam) + '</text>';
    return o + '</svg></div>';
  }

  function maTran(cot, hang){
    return '<div class="tc-cuon"><table class="kdl-mt tc-mt"><thead><tr><th>Chức năng</th>' + cot.map(function(c){ return '<th>' + h(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      hang.map(function(r){ return '<tr><th>' + h(r[0]) + '</th>' + r.slice(1).map(function(x){ var k = x === '—' ? ' muted' : x === 'mọi nhà' || x === 'được' ? ' tc-co' : ''; return '<td class="tc-o' + k + '">' + h(x) + '</td>'; }).join('') + '</tr>'; }).join('') +
      '</tbody></table></div><p class="tiny muted mt">Đúng cổng ở máy chủ (soát 07/10/2026). "khi được cấp" = Super Admin cấp dòng quyền riêng cho người đó (CRM: xem · sửa · quản lý; tài chính: kế toán thu · chi · trưởng · quản lý phòng).</p>';
  }
  var COT = ['Super Admin','Admin','Giám đốc','QLCM','TN Coach','Coach · Senior','Giáo viên','Mentor · ĐG','Tư vấn','Phân tích','Khách'];

  function danhMuc(ds){
    return '<div class="v50-bang" role="table">' + '<div class="v50-hang v50-hang-dau tc-dm" role="row"><span>Bảng</span><span>Việc</span><span>Cột</span><span>Ai ghi</span></div>' +
      ds.map(function(b){ return '<div class="v50-hang tc-dm" role="row"><span class="mono">' + h(b.ten) + '</span><span class="tiny">' + h(b.mo) + '</span><span class="mono tiny">' + b.cot.filter(function(c){ return c[0] !== '(ràng buộc)'; }).length + '</span><span class="tiny">' + h(b.ghi) + '</span></div>'; }).join('') +
      '</div><div class="row mt" style="gap:8px"><button class="btn sm ghost" data-v="khung-du-lieu">' + ic('grid','w-3 h-3') + 'Xem từng cột ở Khung dữ liệu</button></div>';
  }

  function ruiRo(ds){
    return ds.map(function(r){
      var k = kpiDef(r[1]), g = soThat() ? giaTri(r[1]) : null;
      var tt = g ? g.tt : '', mau = MAU_TT[tt] || 'var(--line-2)';
      return '<div class="tc-rr" style="--rr:' + mau + '"><div><b>' + h(r[0]) + '</b><p class="tiny muted" style="margin:2px 0 0">' + h(r[2]) + '</p></div>' +
        '<div class="tc-rr-so"><span class="tiny muted">' + h(k ? k.ten : r[1]) + '</span><b>' + (g ? (g.gt == null ? 'chưa đo' : h(String(g.gt).replace('.', ','))) : '<span class="tiny muted">chờ số thật</span>') + '</b></div></div>';
    }).join('');
  }

  function dau(t, lead){
    canSo();
    var o = U.ph({ eyebrow:'V50·168 · KHUNG TOÀN DIỆN', ic:'chart', grad:1, t:t, lead:lead });
    o += U.bdNguon ? U.bdNguon(soThat() && !!st.d) : '';
    if(soThat() && st.dang && !st.d) o += '<p class="sm muted mb">Đang đọc số thật từ Trung tâm đo lường…</p>';
    if(st.loi) o += '<p class="sm mb" style="color:var(--bad)">' + h(st.loi) + '</p>';
    return o;
  }

  /* ════════════ TOÀN CẢNH CRM ════════════ */
  G.VIEWS['toan-canh-crm'] = function(){
    if(!(G.can && (G.can('crm_view') || G.can('dh_toan_he')))) return U.lockCard('Toàn cảnh CRM mở cho người được cấp CRM và ban điều hành.');
    var K = G.KHUNG_DL || { crm:[] }, that = soThat() && !!st.d;
    var o = dau('Toàn cảnh CRM', 'Khách đi từ lúc đăng ký tới khi lên tầng và giới thiệu nhà khác: bảng nào ghi, ai chạm, đo bằng chỉ số nào, ai được làm gì.');
    o += khoi('Chỉ số chính', 'Ba khối của Trung tâm đo lường: Tư vấn & bán hàng · Coach & chăm sóc · Khách hàng & trải nghiệm.', that,
      U.bdSoHang([oSo('tv1', 14), oSo('tv2', 52), oSo('tv5', 31), oSo('tv3', 6), oSo('co2', 3), oSo('co3', 2), oSo('kh3', 46), oSo('kh1', 78)].filter(Boolean)));
    o += khoi('Sơ đồ quy trình khách hàng', 'Mỗi cột một chặng; dòng dưới là bảng được ghi và cửa máy chủ làm việc đó.', null,
      U.bdDong([
        { ten:'1 · Đăng ký', o:['Khách tự đăng ký, xác nhận email', 'users · dangKyCho', 'dangKy → kichHoat'] },
        { ten:'2 · Tư vấn', o:['Gán Tư vấn trong 24 giờ', 'Phiếu chẩn đoán Tầng 1', 'crmKhach · crmCoHoi', 'crmGhiKhach · crmGhiCoHoi'] },
        { ten:'3 · Vào học', o:['Phiếu thu được duyệt', 'Mở tệp khách, dựng kỳ thu', 'hoSoKhach · kyThu', 'ghiPhieuThu → duyetPhieuThu'] },
        { ten:'4 · Chăm sóc', o:['Coach chạm đều: nhắn · gọi · WOW · buổi', 'Đèn xanh / vàng / đỏ', 'soCham · soCredit', 'ghiCham · tieuCredit'] },
        { ten:'5 · Đo & lên tầng', o:['Sổ đo, NPS, báo cáo tháng', 'Đủ KPI + thanh toán → lên tầng', 'danhGiaKH · hoSoThang · lichSuTang', 'nangTang'] },
        { ten:'6 · Lan toả', o:['Fan giới thiệu nhà mới', 'Hoa hồng đại sứ', 'hoSoKhach.boTro · hoaHongTra', 'traHoaHong'] }
      ]));
    o += khoi('Sơ đồ quan hệ bảng', 'hoSoKhach là gốc: mọi bảng CRM nối về mã nhà (maKhachHang / maNha / maKH).', null,
      veSao('hoSoKhach', [['crmKhach','maKH'], ['crmCoHoi','maKH'], ['soCham','maNha'], ['suKienKH','maNha'], ['danhGiaKH','maNha'], ['hoSoThang','maNha'], ['quyenCRM','username → phạm vi'], ['users','uidPhuHuynh']]));
    var tuan = chuoi('co1', [{nhan:'T1',gia:38},{nhan:'T2',gia:44},{nhan:'T3',gia:41},{nhan:'T4',gia:52},{nhan:'T5',gia:49},{nhan:'T6',gia:57}]);
    var nps = chuoi('kh3', [{nhan:'Th5',gia:32},{nhan:'Th6',gia:38},{nhan:'Th7',gia:41},{nhan:'Th8',gia:39},{nhan:'Th9',gia:44},{nhan:'Th10',gia:46}]);
    o += '<div class="tc-luoi">' +
      khoi('Phễu chuyển đổi', 'Lead → kích hoạt → vào học → lên tầng → giới thiệu.', false, U.bdPhieu([{ten:'Lead',so:120},{ten:'Kích hoạt',so:62},{ten:'Vào học',so:21},{ten:'Lên tầng',so:9},{ten:'Giới thiệu nhà mới',so:4}])) +
      khoi('Nhà theo đèn chăm sóc', 'Đèn đọc thẳng từ sổ chạm: xanh ≤ 7 ngày · vàng 7–14 · đỏ > 14.', false, U.bdVong([{ten:'Xanh',gia:31,mau:'var(--ok)'},{ten:'Vàng',gia:8,mau:'var(--warn)'},{ten:'Đỏ',gia:3,mau:'var(--gita-do)'}])) +
      khoi('Lượt chạm mỗi nhà', tuan.that ? 'Theo ảnh chụp hằng ngày của Trung tâm.' : 'Theo tuần.', tuan.that, U.bdDuong(tuan.pts, { dvi:'lượt' })) +
      khoi('NPS', nps.that ? 'Theo ảnh chụp hằng ngày của Trung tâm.' : 'Theo tháng.', nps.that, U.bdDuong(nps.pts, { dvi:'điểm' })) +
      '</div>';
    o += khoi('Ma trận chức năng × vai', 'Ai được làm gì trong CRM.', null, maTran(COT, [
      ['Xem khách của mình', 'được', 'được', 'khi được cấp', 'khi được cấp', 'khi được cấp', 'khi được cấp', 'khi được cấp', 'khi được cấp', 'khi được cấp', 'khi được cấp', '—'],
      ['Xem toàn bộ khách (mức quản lý)', 'được', 'được', 'khi được cấp', 'khi được cấp', 'khi được cấp', 'khi được cấp', 'khi được cấp', 'khi được cấp', 'khi được cấp', 'khi được cấp', '—'],
      ['Sửa giai đoạn, hẹn tiếp', 'được', 'được', 'khi được cấp', 'khi được cấp', 'khi được cấp', 'khi được cấp', 'khi được cấp', 'khi được cấp', 'khi được cấp', 'khi được cấp', '—'],
      ['Giao Coach / Tư vấn phụ trách nhà', 'được', 'được', 'được', 'được', '—', '—', '—', '—', '—', '—', '—'],
      ['Phân tích chuyên sâu', 'được', 'được', 'khi được cấp', 'khi được cấp', 'khi được cấp', 'khi được cấp', 'khi được cấp', 'khi được cấp', 'khi được cấp', 'khi được cấp', '—'],
      ['Ghi lượt chạm (sổ chạm)', 'mọi nhà', 'mọi nhà', 'mọi nhà', 'mọi nhà', 'nhà mình', 'nhà mình', 'nhà mình', 'nhà mình', 'nhà mình', 'nhà mình', '—'],
      ['Ghi buổi coach (tự vào CRM)', 'mọi nhà', 'mọi nhà', 'mọi nhà', 'mọi nhà', 'mọi nhà', 'nhà mình', 'nhà mình', '—', '—', '—', '—'],
      ['Cấp / thu hồi quyền CRM', 'được', '—', '—', '—', '—', '—', '—', '—', '—', '—', '—']
    ]));
    o += khoi('Kiểm soát rủi ro', 'Mỗi rủi ro có một chỉ số canh ở Trung tâm đo lường.', that, '<div class="tc-rr-ds">' + ruiRo([
      ['Lead không ai nhận', 'tv3', 'Nhà mới quá 24 giờ chưa có Tư vấn phụ trách.'],
      ['Hẹn chăm sóc quá hạn', 'tv4', 'Cơ hội có ngày hẹn đã qua mà chưa ghi lần chạm.'],
      ['Nhà bị bỏ quên', 'co2', 'Quá 7 ngày chưa được chạm.'],
      ['Nhà đèn đỏ', 'co3', 'Quá 14 ngày im lặng — phải gọi, người thật gọi.'],
      ['Khách không hài lòng', 'kh4', 'CSAT thấp — gọi lại trong 48 giờ.'],
      ['Hoàn tiền', 'kh5', 'Tỷ lệ hoàn tiền tăng là tín hiệu chăm sóc hỏng sớm.']
    ]) + '</div>');
    o += khoi('Danh mục bảng CRM', K.crm.length + ' bảng · sinh từ lược đồ máy chủ.', null, danhMuc(K.crm));
    return o;
  };

  /* ════════════ TOÀN CẢNH TÀI CHÍNH ════════════ */
  G.VIEWS['toan-canh-tc'] = function(){
    if(!(G.can && G.can('fin_view'))) return U.lockCard('Toàn cảnh tài chính mở cho ban điều hành và ban tài chính được cấp.');
    var K = G.KHUNG_DL || { taiChinh:[] }, that = soThat() && !!st.d;
    var o = dau('Toàn cảnh tài chính', 'Tiền vào, tiền ra, công nợ, credit, lương, thuế: bảng nào ghi, ai duyệt ở mốc nào, rủi ro nào được canh bằng chỉ số nào.');
    o += khoi('Chỉ số chính', 'Khối Tài chính của Trung tâm đo lường (30 ngày).', that,
      U.bdSoHang([oSo('tc1', 186000000), oSo('tc2', 64), oSo('tc3', 67000000), oSo('tc4', 2), oSo('tc5', 3), oSo('tc6', 1), oSo('tc7', 0)].filter(Boolean)));
    o += khoi('Sơ đồ quy trình THU', 'Từ phiếu thu tới công nợ và ví credit của nhà.', null, U.bdDong([
      { ten:'1 · Ghi phiếu', o:['Tư vấn trở lên ghi phiếu thu', 'phieuThu (chờ duyệt)', 'ghiPhieuThu'] },
      { ten:'2 · Đối chiếu', o:['Khớp giao dịch ngân hàng', 'giaoDichNganHang', 'doiChieuNganHang · khopGiaoDich'] },
      { ten:'3 · Duyệt', o:['R01–R03 hoặc kế toán thu', 'phieuThu (đã duyệt)', 'duyetPhieuThu'] },
      { ten:'4 · Công nợ', o:['Trừ vào kỳ thu, miễn giảm', 'kyThu · mienGiam', 'congNo · duyetMienGiam'] },
      { ten:'5 · Credit', o:['Nạp ví theo gói', 'soCredit · viCredit', 'napCreditPhieu'] },
      { ten:'6 · Chốt & báo cáo', o:['Chốt tuần, báo cáo kế toán', 'soChot · chotKet · ketToan*', 'chotTuan · baoCaoKeToan'] }
    ]));
    o += khoi('Sơ đồ quy trình CHI', 'Duyệt theo mốc tiền C0–C6; không ai tự duyệt khoản của mình.', null, U.bdDong([
      { ten:'1 · Đề xuất', o:['Trưởng nhóm Coach trở lên', 'chiPhi (đề xuất)', 'ghiChi'] },
      { ten:'2 · Duyệt theo mốc', o:['Kế toán chi / trưởng theo mốc', 'R01–R03 ở mốc cao', 'duyetChi'] },
      { ten:'3 · Hoá đơn', o:['Gắn hoá đơn, bút toán', 'ketToanHoaDon · ketToanButToan', ''] },
      { ten:'4 · Lương', o:['Hệ số do Super Admin', 'Chốt và đối soát lương', 'heSoLuong · bangLuong', 'chotLuong · doiSoatLuong'] },
      { ten:'5 · Thuế', o:['Tờ khai', 'ketToanToKhai', 'boSoKhaiThue'] }
    ]));
    o += '<div class="tc-luoi">' +
      khoi('Quan hệ bảng · phía THU', '', null, veSao('phieuThu', [['kyThu','idKy'], ['hoSoKhach','maKhachHang'], ['giaoDichNganHang','đối chiếu'], ['soCredit','nạp từ phiếu'], ['mienGiam','trừ kỳ'], ['hoanTien','hoàn'], ['quyenTaiChinh','ai duyệt']])) +
      khoi('Quan hệ bảng · phía CHI', '', null, veSao('chiPhi', [['quyenTaiChinh','mốc duyệt'], ['ketToanHoaDon','hoá đơn'], ['ketToanButToan','bút toán'], ['bangLuong','lương'], ['heSoLuong','hệ số'], ['hoaHongTra','hoa hồng']])) +
      '</div>';
    var tc1 = chuoi('tc1', [{nhan:'Th5',gia:142000000},{nhan:'Th6',gia:151000000},{nhan:'Th7',gia:168000000},{nhan:'Th8',gia:159000000},{nhan:'Th9',gia:177000000},{nhan:'Th10',gia:186000000}]);
    var tc3 = chuoi('tc3', [{nhan:'Th5',gia:38000000},{nhan:'Th6',gia:41000000},{nhan:'Th7',gia:55000000},{nhan:'Th8',gia:47000000},{nhan:'Th9',gia:61000000},{nhan:'Th10',gia:67000000}]);
    o += '<div class="tc-luoi">' +
      khoi('Thu và chi theo tháng', 'Cột đôi: thu đã duyệt · chi đã duyệt.', false, U.bdCot([{nhan:'Th5',a:142,b:104},{nhan:'Th6',a:151,b:110},{nhan:'Th7',a:168,b:113},{nhan:'Th8',a:159,b:112},{nhan:'Th9',a:177,b:116},{nhan:'Th10',a:186,b:119}], { aTen:'Thu (triệu đ)', bTen:'Chi (triệu đ)' })) +
      khoi('Tiền thu đã duyệt', tc1.that ? 'Theo ảnh chụp hằng ngày của Trung tâm.' : 'Theo tháng.', tc1.that, U.bdDuong(tc1.pts, { dvi:'đ' })) +
      khoi('Dòng tiền ròng', tc3.that ? 'Theo ảnh chụp hằng ngày của Trung tâm.' : 'Theo tháng.', tc3.that, U.bdDuong(tc3.pts, { dvi:'đ' })) +
      khoi('Cơ cấu chi', 'Theo nhóm chi đã duyệt.', false, U.bdVong([{ten:'Lương & thưởng',gia:58},{ten:'Hoa hồng đại sứ',gia:12},{ten:'Hạ tầng & AI',gia:9},{ten:'Marketing',gia:14},{ten:'Vận hành khác',gia:7}])) +
      khoi('Công nợ theo tuổi nợ', 'Số kỳ thu chưa thu đủ, theo số ngày quá hạn.', false, U.bdCot([{nhan:'Chưa tới hạn',a:12},{nhan:'1–15 ngày',a:4},{nhan:'16–30 ngày',a:2},{nhan:'> 30 ngày',a:1}], { aTen:'Số kỳ' })) +
      khoi('Credit nạp và tiêu', 'Cột đôi theo tháng (nghìn credit).', false, U.bdCot([{nhan:'Th7',a:900,b:610},{nhan:'Th8',a:1100,b:780},{nhan:'Th9',a:1300,b:960},{nhan:'Th10',a:1600,b:1120}], { aTen:'Nạp', bTen:'Tiêu' })) +
      '</div>';
    o += khoi('Ma trận chức năng × vai', 'Ai được làm gì với tiền.', null, maTran(COT, [
      ['Ghi phiếu thu', 'được', 'được', 'được', 'được', 'được', 'được', 'được', 'được', 'được', '—', '—'],
      ['Duyệt phiếu thu · nạp credit từ phiếu', 'được', 'được', 'được', 'khi được cấp', 'khi được cấp', 'khi được cấp', 'khi được cấp', 'khi được cấp', 'khi được cấp', 'khi được cấp', '—'],
      ['Xem công nợ', 'mọi nhà', 'mọi nhà', 'mọi nhà', 'nhà mình', 'nhà mình', 'nhà mình', 'nhà mình', 'nhà mình', 'nhà mình', '—', 'nhà mình'],
      ['Đề xuất miễn giảm · hoàn tiền', 'được', 'được', 'được', 'được', 'được', 'được', '—', '—', '—', '—', '—'],
      ['Duyệt miễn giảm · hoàn tiền', 'được', 'được', 'được', '—', '—', '—', '—', '—', '—', '—', '—'],
      ['Đề xuất chi', 'được', 'được', 'được', 'được', 'được', '—', '—', '—', '—', '—', '—'],
      ['Duyệt chi (theo mốc C0–C6)', 'được', 'được', 'được', 'khi được cấp', 'khi được cấp', 'khi được cấp', 'khi được cấp', 'khi được cấp', 'khi được cấp', 'khi được cấp', '—'],
      ['Chốt sổ tuần · báo cáo kế toán', 'được', 'được', 'được', '—', '—', '—', '—', '—', '—', '—', '—'],
      ['Bảng lương', 'cả bảng', 'cả bảng', 'cả bảng', 'dòng mình', 'dòng mình', 'dòng mình', 'dòng mình', 'dòng mình', 'dòng mình', 'dòng mình', '—'],
      ['Đổi giá · hệ số lương · điều chỉnh credit', 'được', '—', '—', '—', '—', '—', '—', '—', '—', '—', '—'],
      ['Cấp / thu hồi vị trí ban tài chính', 'được', '—', '—', '—', '—', '—', '—', '—', '—', '—', '—']
    ]));
    o += khoi('Kiểm soát rủi ro tài chính', 'Mỗi rủi ro có một chỉ số canh ở Trung tâm đo lường.', that, '<div class="tc-rr-ds">' + ruiRo([
      ['Tiền về mà chưa ghi nhận', 'tc4', 'Phiếu thu chờ duyệt quá 3 ngày.'],
      ['Công nợ trễ', 'tc5', 'Kỳ thu quá hạn chưa thu đủ.'],
      ['Chi không chứng từ', 'tc6', 'Khoản chi không có hoá đơn.'],
      ['Đề xuất chi tồn đọng', 'tc7', 'Đề xuất chi chờ duyệt quá 7 ngày.'],
      ['Chi vượt thu', 'tc2', 'Tỷ lệ chi trên thu vượt ngưỡng.'],
      ['Dòng tiền âm', 'tc3', 'Thu trừ chi trong kỳ.']
    ]) + '</div><p class="tiny muted mt">Khoá cứng ở máy chủ: không ai tự duyệt khoản của mình, không ai tự cấp vị trí tài chính cho mình, mọi phiếu và mọi lần duyệt vào nhật ký không sửa xoá được.</p>');
    o += khoi('Danh mục bảng tài chính', K.taiChinh.length + ' bảng · sinh từ lược đồ máy chủ.', null, danhMuc(K.taiChinh));
    return o;
  };
})();
