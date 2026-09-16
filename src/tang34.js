/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÁY CHẠY TẦNG 3 VÀ TẦNG 4 CHO TRỢ LÝ VÀ COACH

   Kho chuẩn ở kho-goc/data.tang34.js. Toàn bộ ở gói NGHỀ.

   ═══ SÁU CÁI MỞ ═══

   t34VaiCuaAi(viec, tang)  việc này của máy hay của người. Đây là hàm
                            quan trọng nhất tệp — audit của sổ tay ghi
                            lỗi phổ biến nhất tầng 3 là hai vai lấn nhau.
   t34SoiTin(tin)           một tin nhắn đã đủ nhịp G-I-T-S-A chưa. Nó
                            KHÔNG chấm hay dở — nó chỉ hỏi có thiếu nhịp
                            bắt buộc nào không.
   t34BaoCao(...)           dựng báo cáo ba trụ ĐÚNG THỨ TỰ. Gọi hàm thì
                            không đảo thứ tự được, mà đảo thứ tự là lỗi
                            hay gặp nhất khi người soạn vội.
   t34ChangHomNay(tang,ngay) hôm nay là chặng nào, mùa nào, mốc nào tới.
   t34CuaRa(tang, nha)      ba cửa của ngày cuối, đã lọc qua cổng phí.
   t34Gia(tang)             giá một tầng và giá mỗi ngày, TÍNH TẠI CHỖ
                            từ HP_TANG.

   ═══ VÌ SAO t34Gia() TÍNH CHỨ KHÔNG ĐỌC ═══

   Sổ tay ghi sẵn "≈55.000đ/ngày" cho tầng 4. Con số ấy chỉ đúng nếu
   tầng 4 là hai mươi triệu — mà kho ghi ba mươi. Chép 55.000 vào kho là
   lén chọn hộ chủ hệ một con số tiền bằng đường vòng: không ai thấy
   mình vừa quyết định giá, nhưng lời nói với nhà mình thì đã theo con số
   ấy rồi.

   Nên hàm này chia tại chỗ: gia ÷ soNgay. Sửa HP_TANG thì cả hai con số
   đổi theo trong cùng một lần.

   ═══ BA CÁI KHOÁ ═══

   t34SoiVai()      không việc nào khai hai chủ; mọi việc đều khai tầng.
   t34SoiThuTu()    ba trụ phải đúng thứ tự Thái độ → Kỹ năng → Kiến thức
                    trong CHÍNH kho, không chỉ trong lời hứa.
   t34SoiCuaRa()    mọi cửa loại lên tầng phải khai quaCongPhi = true.
                    Một cửa mời lên tầng mà không qua cổng là một đường
                    vòng quanh luật đã chốt — và đường vòng thì không ai
                    thấy cho tới lúc có người đi qua.

   ═══ MỘT CHỖ SUÝT SAI ═══

   Bản đầu t34CuaRa() lọc bỏ hẳn cửa lên tầng khi cổng phí đóng. Sai:
   lọc bỏ thì màn hình còn hai cửa và người soạn tưởng ngày ấy chỉ có
   hai đường. Nay nó GIỮ cửa và gắn nhãn cổng đóng, kèm lý do — người
   soạn cần biết cửa ấy có tồn tại và vì sao hôm nay chưa mở.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h;
  var SO_NGAY = { T3: 90, T4: 365 };

  function coKho(ten) { return G[ten] !== undefined && G[ten] !== null; }
  function maTang(t) { var m = String(t == null ? '' : t).match(/(\d)/); return m ? 'T' + m[1] : ''; }
  function bo(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  }

  /* ═══════════ MỞ 1: VIỆC NÀY CỦA AI ═══════════ */
  G.t34VaiCuaAi = function (viec, tang) {
    var ds = G.T34_VAI || [];
    if (!ds.length) return { chuaDo: true, thieu: 'T34_VAI' };
    var k = bo(viec), ma = maTang(tang);

    var hop = ds.filter(function (v) {
      if (ma && (v.tang || []).indexOf(ma) < 0) return false;
      return bo(v.viec).indexOf(k) >= 0 || k.indexOf(bo(v.viec)) >= 0;
    });
    if (!hop.length) return { khongBiet: true, viec: viec, tang: ma,
      goiY: ds.filter(function (v) { return !ma || (v.tang || []).indexOf(ma) >= 0; })
              .map(function (v) { return v.viec; }) };

    var v = hop[0];
    return {
      cua: v.cua, viec: v.viec, tang: (v.tang || []).slice(),
      vi: v.vi,
      han: v.han,
      camAiLam: v.camAiLam,
      phaiQua: v.nhungPhaiQua,
      dieuKien: v.dieuKien,
      cot: (G.T34_VAI_LUAT || {}).cot || ''
    };
  };

  /* ═══════════ MỞ 2: TIN NÀY ĐỦ NHỊP CHƯA ═══════════

     Không chấm hay dở. Chỉ hỏi: có thiếu nhịp BẮT BUỘC nào không.
     Nhận vào một đối tượng {G:'…', I:'…', T:'…', S:'…', A:'…'} — vì
     đoán nhịp từ một khối chữ liền thì đoán sai, và đoán sai ở đây
     nguy hơn không đo: người soạn tin sẽ tin vào một con dấu rỗng. */
  G.t34SoiTin = function (tin) {
    var ds = G.T34_GITSA || [];
    if (!ds.length) return { chuaDo: true, thieu: 'T34_GITSA' };
    tin = tin || {};
    var thieu = [], coLuoc = [];
    ds.forEach(function (n) {
      var co = String(tin[n.nhip] || '').trim().length > 0;
      if (co) return;
      if (n.luocDuoc) coLuoc.push(n.nhip);
      else thieu.push(n.nhip + ' — ' + n.ten);
    });
    return {
      dat: thieu.length === 0,
      thieu: thieu,
      daLuoc: coLuoc,
      vi: thieu.length
        ? (G.T34_GITSA_LUAT || {}).viIvaT || ''
        : 'Đủ nhịp bắt buộc.' + (coLuoc.length ? ' Lược ' + coLuoc.join(', ') + ' — cho phép ở tin ngắn.' : '')
    };
  };

  /* ═══════════ MỞ 3: BÁO CÁO BA TRỤ, ĐÚNG THỨ TỰ ═══════════ */
  G.t34BaoCao = function (noiDung) {
    var ds = (G.T34_BATRU || []).slice().sort(function (a, b) { return a.thu - b.thu; });
    if (!ds.length) return { chuaDo: true, thieu: 'T34_BATRU' };
    noiDung = noiDung || {};
    var l = G.T34_BATRU_LUAT || {};
    return {
      moBang: l.loiMoChuan || '',
      dong: ds.map(function (t) {
        return { ma: t.ma, ten: t.ten, c: t.c,
          noiDung: String(noiDung[t.ma] || '').trim(),
          trong: !String(noiDung[t.ma] || '').trim(),
          layTuDau: t.docTuDau };
      }),
      thuTu: l.thuTuBaoCao || '',
      viNguoc: l.viNguoc || ''
    };
  };

  /* ═══════════ MỞ 4: HÔM NAY LÀ CHẶNG NÀO ═══════════ */
  G.t34ChangHomNay = function (tang, ngay) {
    var ma = maTang(tang), n = Number(ngay) || 0;
    if (ma === 'T3') {
      var ds = G.T34_T3_CHANG || [];
      if (!ds.length) return { chuaDo: true, thieu: 'T34_T3_CHANG' };
      var c = ds.filter(function (x) {
        var m = String(x.ngay).split(/[–-]/);
        return n >= Number(m[0]) && n <= Number(m[1]);
      })[0];
      if (!c) return { ngoaiChang: true, tang: ma, ngay: n, tong: SO_NGAY.T3 };
      return { tang: ma, ngay: n, chang: c.so, chuDe: c.chuDe, tru: (c.tru || []).slice(),
        sanPham: c.sanPham, moc: (c.moc || []).slice(), c: c.c, tong: SO_NGAY.T3 };
    }
    if (ma === 'T4') {
      var dm = G.T34_T4_MUA || [];
      if (!dm.length) return { chuaDo: true, thieu: 'T34_T4_MUA' };
      var thang = Math.max(1, Math.min(12, Math.ceil(n / 30.4)));
      var q = dm.filter(function (x) {
        var m = String(x.thang).split(/[–-]/);
        return thang >= Number(m[0]) && thang <= Number(m[1]);
      })[0];
      if (!q) return { ngoaiChang: true, tang: ma, ngay: n, tong: SO_NGAY.T4 };
      return { tang: ma, ngay: n, thang: thang, quy: q.quy, mua: q.mua, chuDe: q.chuDe,
        sanPham: q.sanPham, moc: (q.moc || []).slice(), c: q.c, tong: SO_NGAY.T4 };
    }
    return { khongPhaiTang34: true, tang: ma };
  };

  /* ═══════════ MỞ 5: GIÁ, TÍNH TẠI CHỖ ═══════════ */
  G.t34Gia = function (tang) {
    var ma = maTang(tang);
    if (!coKho('HP_TANG')) return { chuaDo: true, thieu: 'HP_TANG' };
    var b = (G.HP_TANG || []).filter(function (x) { return x.tang === ma; })[0];
    if (!b) return { khongCo: true, tang: ma };
    if (b.gia === null || b.gia === undefined)
      return { chuaCoGia: true, tang: ma,
        vi: 'Chủ Học viện chưa điền giá tầng này. Chưa điền thì không hiện bảng giá.' };
    var soNgay = SO_NGAY[ma] || 0;
    return {
      tang: ma, ten: b.ten, gia: b.gia, donVi: b.donVi,
      soNgay: soNgay,
      moiNgay: soNgay ? Math.round(b.gia / soNgay) : undefined,
      tinhTaiCho: true,
      viTinh: 'Chia tại chỗ từ HP_TANG.gia. Không ghi sẵn con số mỗi ngày vào kho — ghi sẵn là ' +
        'chốt hộ một con số tiền bằng đường vòng.'
    };
  };

  /* ═══════════ MỞ 6: BA CỬA CỦA NGÀY CUỐI ═══════════

     Giữ cả ba cửa. Cửa lên tầng thì gắn nhãn cổng — mở hay chưa, và vì
     sao. Lọc bỏ hẳn thì người soạn tưởng ngày ấy chỉ có hai đường. */
  G.t34CuaRa = function (tang, nha) {
    var ma = maTang(tang);
    var ds = (G.T34_CUARA || []).filter(function (c) { return c.tang === ma; });
    if (!ds.length) return { chuaDo: true, thieu: 'T34_CUARA', tang: ma };

    var cong = null;
    if (typeof G.tvCongPhi === 'function') { try { cong = G.tvCongPhi(nha); } catch (e) { cong = null; } }

    return {
      tang: ma,
      ngay: ds[0].ngay,
      cua: ds.map(function (c) {
        var r = { ma: c.ma, ten: c.ten, loai: c.loai, loi: c.loi, quaCongPhi: !!c.quaCongPhi };
        if (!c.quaCongPhi) { r.mo = true; return r; }
        if (!cong) { r.mo = false; r.viChua = 'Chưa hỏi được cổng phí — thiếu dữ liệu nhà mình. Cổng đóng.'; return r; }
        r.mo = !!cong.noiPhi;
        if (!r.mo) r.viChua = cong.vi || 'Cổng phí chưa mở. Khép chặng bình thường, không nói phí.';
        if (r.mo && c.tangKe) {
          var g = G.t34Gia(c.tangKe);
          if (g && g.gia !== undefined) { r.giaTangKe = g.gia; r.moiNgay = g.moiNgay; }
          else r.giaChuaDoc = true;
        }
        return r;
      }),
      cam: (G.T34_CUARA_LUAT || {}).camTuyetDoi || '',
      viCam: (G.T34_CUARA_LUAT || {}).viCamTuyetDoi || ''
    };
  };

  G.t34Kho = function (tang) {
    var ma = maTang(tang);
    return (G.T34_KHO || []).filter(function (k) { return !ma || k.tang === ma; });
  };
  G.t34Kpi = function (tang) {
    var ma = maTang(tang);
    return (G.T34_KPI || []).filter(function (k) { return !ma || k.tang === ma; });
  };

  /* ═══════════ KHOÁ 1: RANH GIỚI VAI KHÔNG ĐƯỢC MỜ ═══════════ */
  G.t34SoiVai = function () {
    var ds = G.T34_VAI || [], loi = [], thay = {};
    if (!ds.length) return { chuaDo: true, thieu: 'T34_VAI', loi: [] };
    ds.forEach(function (v) {
      var n = '"' + v.viec + '"';
      if (v.cua !== 'ai' && v.cua !== 'coach') loi.push(n + ' chủ lạ: ' + v.cua);
      if (!(v.tang || []).length) loi.push(n + ' chưa khai tầng');
      (v.tang || []).forEach(function (t) {
        if (t !== 'T3' && t !== 'T4') loi.push(n + ' khai tầng ngoài phạm vi: ' + t);
      });
      if (!v.vi) loi.push(n + ' chưa nói vì sao');
      var k = bo(v.viec);
      if (thay[k]) loi.push(n + ' khai hai lần');
      thay[k] = 1;
    });
    /* Cả hai vai đều phải có việc. Bảng chỉ có một vai là bảng không
       phân được ranh giới nào cả. */
    ['ai', 'coach'].forEach(function (v) {
      if (!ds.filter(function (x) { return x.cua === v; }).length)
        loi.push('không việc nào thuộc ' + v);
    });
    return { chuaDo: false, loi: loi, soViec: ds.length,
      cuaAi: ds.filter(function (x) { return x.cua === 'ai'; }).length,
      cuaCoach: ds.filter(function (x) { return x.cua === 'coach'; }).length };
  };

  /* ═══════════ KHOÁ 2: BA TRỤ ĐÚNG THỨ TỰ TRONG CHÍNH KHO ═══════════ */
  G.t34SoiThuTu = function () {
    var ds = G.T34_BATRU || [], loi = [];
    if (!ds.length) return { chuaDo: true, thieu: 'T34_BATRU', loi: [] };
    var dung = ['THAIDO', 'KYNANG', 'KIENTHUC'];
    ds.slice().sort(function (a, b) { return a.thu - b.thu; }).forEach(function (t, i) {
      if (t.ma !== dung[i]) loi.push('trụ thứ ' + (i + 1) + ' là ' + t.ma + ', phải là ' + dung[i]);
      if (t.thu !== i + 1) loi.push(t.ma + ' mang số thứ tự ' + t.thu);
    });
    if (ds.length !== 3) loi.push('có ' + ds.length + ' trụ, phải ba');
    var l = G.T34_BATRU_LUAT || {};
    if (!l.thuTuBaoCao) loi.push('chưa khai thứ tự báo cáo');
    if (!l.viNguoc) loi.push('chưa nói vì sao thứ tự ngược với câu phụ huynh hỏi');
    return { chuaDo: false, loi: loi };
  };

  /* ═══════════ KHOÁ 3: CỬA LÊN TẦNG PHẢI QUA CỔNG ═══════════ */
  G.t34SoiCuaRa = function () {
    var ds = G.T34_CUARA || [], loi = [];
    if (!ds.length) return { chuaDo: true, thieu: 'T34_CUARA', loi: [] };
    ds.forEach(function (c) {
      if (c.loai === 'len-tang' || c.loai === 'gia-han') {
        if (c.quaCongPhi !== true) loi.push(c.ma + ' mời lên tầng mà không qua cổng phí');
        if (c.loai === 'len-tang' && !c.tangKe) loi.push(c.ma + ' chưa khai tầng kế');
      }
      /* Con số tiền trong lời thoại là bản thứ hai của HP_TANG.gia. */
      if (/\d[\d.,]*\s*(triệu|nghìn|đồng|đ\/)/i.test(String(c.loi || '')))
        loi.push(c.ma + ' có con số tiền nằm cứng trong lời');
    });
    ['T3', 'T4'].forEach(function (t) {
      var n = ds.filter(function (c) { return c.tang === t; }).length;
      if (n < 3) loi.push(t + ' chỉ có ' + n + ' cửa, sổ tay ghi ba');
    });
    return { chuaDo: false, loi: loi, soCua: ds.length };
  };

  /* ═══════════════════════════════════════════════════════════
     MÀN HÌNH
     ═══════════════════════════════════════════════════════════ */
  G.VIEWS['tang34'] = function () {
    if (!G.T34_VAI)
      return U.empty('Chưa mở được phần này',
        'Phần này nằm trong gói nghề. Đăng nhập bằng tài khoản có quyền nghề để nạp.');

    var loi = G.T34_LOI || {};
    var o = U.ph({ eyebrow: 'TẦNG 3 · TẦNG 4', ic: 'compass', grad: 1,
      t: 'Việc của Trợ lý, việc của Coach — và lằn ranh giữa hai bên',
      lead: 'Chín mươi ngày và ba trăm sáu lăm ngày. Đây là chỗ người thật bước vào ' +
        'và đứng cạnh máy suốt bốn trăm năm mươi lăm ngày.' });

    o += '<div class="card mb" style="border-color:#0B667556">' +
      '<p style="line-height:1.9;font-size:1.05em"><b>' + h(loi.vaiChuyen || '') + '</b></p>' +
      '<p class="sm mt" style="line-height:1.8"><b>Tầng 3 —</b> ' + h(loi.t3 || '') + '</p>' +
      '<p class="sm" style="line-height:1.8"><b>Tầng 4 —</b> ' + h(loi.t4 || '') + '</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(loi.viDiChung || '') + '</p></div>';

    o += G.kaKhung ? G.kaKhung('tang34', 'dau') : '';

    /* ── Ranh giới vai ── */
    var sv = G.t34SoiVai();
    o += U.sec('Việc nào của máy, việc nào của người' + (sv.loi && sv.loi.length ? ' — LỆCH: ' + sv.loi.join(' · ') : ''),
      (G.T34_VAI_LUAT || {}).hailoi || '');
    o += '<div class="card mb">' + (G.T34_VAI || []).map(function (v) {
      var la = v.cua === 'ai';
      var mau = la ? '#0B6675' : '#B4720F';
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<span class="tiny up" style="color:' + mau + '"><b>' + (la ? 'TRỢ LÝ' : 'COACH') + '</b></span> ' +
        '<span class="tiny dim">' + h((v.tang || []).join(' · ')) + '</span>' +
        '<p class="sm mt" style="line-height:1.8"><b>' + h(v.viec) + '</b>' +
        (v.han ? ' <span class="tiny dim">— ' + h(v.han) + '</span>' : '') + '</p>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(v.vi) + '</p>' +
        (v.camAiLam ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16">' + h(v.camAiLam) + '</p>' : '') +
        (v.nhungPhaiQua ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F">Máy đề nghị, ' +
          h(v.nhungPhaiQua) + ' chốt.</p>' : '') +
        (v.dieuKien ? '<p class="tiny mt" style="line-height:1.7;color:#0B6675">Điều kiện: ' + h(v.dieuKien) + '</p>' : '') +
        '</div>';
    }).join('') + '</div>';
    o += '<p class="tiny dim mb" style="line-height:1.7">' +
      h((G.T34_VAI_LUAT || {}).viCoachKhongOmNhip || '') + '</p>';

    /* ── Khuôn năm nhịp ── */
    var gl = G.T34_GITSA_LUAT || {};
    o += U.sec('Năm nhịp dựng một tin nhắn — G-I-T-S-A', gl.cot || '');
    o += '<div class="card mb">' + (G.T34_GITSA || []).map(function (n) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(n.nhip) + ' — ' + h(n.ten) + '</b> ' +
        (n.luocDuoc ? '<span class="tiny dim">lược được ở tin ngắn</span>'
                    : '<span class="tiny" style="color:#BE0E16">KHÔNG bao giờ lược</span>') +
        '<p class="sm mt" style="line-height:1.8">' + h(n.lam) + '</p>' +
        (n.tuNen ? '<p class="tiny mt" style="line-height:1.7;color:#0B6675">Từ nên dùng: ' +
          h((n.tuNen || []).join(' · ')) + '</p>' : '') +
        (n.tuTranh ? '<p class="tiny" style="line-height:1.7;color:#BE0E16">Từ phải tránh: ' +
          h((n.tuTranh || []).join(' · ')) + '</p>' : '') +
        '</div>';
    }).join('') + '</div>';
    o += '<p class="tiny dim mb" style="line-height:1.7">' + h(gl.viIvaT || '') + '<br>' +
      h(gl.khongDaChuoiNamVong || '') + '</p>';

    /* ── Ba trụ, và một báo cáo dựng thật ── */
    var st = G.t34SoiThuTu();
    var bt = G.T34_BATRU_LUAT || {};
    o += U.sec('Ba trụ đo, và thứ tự báo cáo' + (st.loi && st.loi.length ? ' — LỆCH: ' + st.loi.join(' · ') : ''),
      bt.thuTuBaoCao || '');
    o += '<div class="card mb">' + (G.T34_BATRU || []).map(function (t) {
      return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<span class="tiny up" style="color:' + t.c + '"><b>' + t.thu + '. ' + h(t.ten) + '</b></span>' +
        '<p class="sm mt" style="line-height:1.8">' + h(t.la) + '</p>' +
        '<p class="tiny dim mt" style="line-height:1.7">Lấy từ: ' + h(t.docTuDau) + '</p></div>';
    }).join('') + '</div>';
    o += '<div class="card mb" style="border-color:#B4720F44">' +
      '<p class="tiny up dim">CÂU MỞ CHUẨN — NÓI Ở BÁO CÁO ĐẦU TIÊN</p>' +
      '<p class="sm mt" style="line-height:1.8">&ldquo;' + h(bt.loiMoChuan || '') + '&rdquo;</p>' +
      '<p class="tiny dim mt" style="line-height:1.7">' + h(bt.viNguoc || '') + '</p>' +
      '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' + h(bt.kienThucChuyenTre || '') + '</p></div>';

    o += G.kaKhung ? G.kaKhung('tang34', 'giua') : '';

    /* ── Tầng 3: ba chặng ── */
    o += U.sec('Tầng 3 — ba chặng ba mươi ngày', 'Coach gặp bốn lần: ngày 10, 30, 60, 90.');
    o += (G.T34_T3_CHANG || []).map(function (c) {
      return '<div class="card mb" style="border-color:' + c.c + '4d">' +
        '<span class="tiny up" style="color:' + c.c + '">CHẶNG ' + c.so + ' · NGÀY ' + h(c.ngay) +
        ' · TRỤ ' + h((c.tru || []).join(' + ')) + '</span>' +
        '<p class="mt" style="line-height:1.9"><b>' + h(c.chuDe) + '</b></p>' +
        '<p class="sm mt" style="line-height:1.8">Sản phẩm cuối chặng: ' + h(c.sanPham) + '</p>' +
        '<ul class="tiny mt" style="line-height:1.8;padding-left:18px">' +
        (c.moc || []).map(function (m) { return '<li>' + h(m) + '</li>'; }).join('') + '</ul></div>';
    }).join('');

    /* Ba nhánh khám phá */
    if (G.T34_NHANH) {
      o += U.sec('Ba nhánh khám phá thế mạnh', (G.T34_NHANH_LUAT || {}).cot || '');
      o += '<div class="card mb">' + (G.T34_NHANH || []).map(function (n) {
        return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b class="sm">' + h(n.ten) + '</b>' +
          '<p class="tiny mt" style="line-height:1.7">Thử: ' + h(n.thu) + '</p>' +
          '<p class="tiny mt" style="line-height:1.7;color:#0B6675">Máy ghi: ' +
          h((n.ghiGi || []).join(' · ')) + '</p>' +
          '<p class="tiny mt" style="line-height:1.7">Cửa mạnh: ' + h(n.cuaManh) + '</p>' +
          '<p class="tiny mt" style="line-height:1.8">&ldquo;' + h(n.loiMoi) + '&rdquo;</p></div>';
      }).join('') + '</div>';
      o += '<p class="tiny dim mb" style="line-height:1.7">' +
        h((G.T34_NHANH_LUAT || {}).viGhiHanhVi || '') + '<br>' +
        h((G.T34_NHANH_LUAT || {}).banDoSaiLaViecDaTra || '') + '</p>';
    }

    /* Buông có kiểm soát */
    if (G.T34_BUONG) {
      o += U.sec('Tuần 9 đến 12 — buông có kiểm soát', (G.T34_BUONG_LUAT || {}).cot || '');
      o += '<div class="card mb">' + (G.T34_BUONG || []).map(function (b) {
        return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b class="sm">Tuần ' + b.tuan + ' — bỏ: ' + h(b.bo) + '</b>' +
          '<p class="tiny mt" style="line-height:1.8">&ldquo;' + h(b.noiVoiNha) + '&rdquo;</p></div>';
      }).join('') + '</div>';
      o += '<p class="tiny mb" style="line-height:1.7;color:#BE0E16">' +
        h((G.T34_BUONG_LUAT || {}).loiThuongGap || '') + '</p>';
      o += '<div class="card mb">' + (G.T34_BUONG_BAY || []).map(function (b) {
        return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b class="sm">Bẫy: ' + h(b.bay) + '</b>' +
          '<p class="tiny dim mt" style="line-height:1.7">Dấu hiệu: ' + h(b.dauHieu) + '</p>' +
          (b.khongLam ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16">' + h(b.khongLam) + '</p>' : '') +
          '<p class="tiny mt" style="line-height:1.8">&ldquo;' + h(b.xuLy) + '&rdquo;</p></div>';
      }).join('') + '</div>';
    }

    /* ── Tầng 4: bốn mùa ── */
    o += U.sec('Tầng 4 — bốn quý, bốn mùa', 'Coach gặp mười hai lần, mỗi tháng một buổi.');
    o += (G.T34_T4_MUA || []).map(function (q) {
      return '<div class="card mb" style="border-color:' + q.c + '4d">' +
        '<span class="tiny up" style="color:' + q.c + '">QUÝ ' + q.quy + ' · THÁNG ' + h(q.thang) +
        ' · ' + h(q.mua).toUpperCase() + '</span>' +
        '<p class="mt" style="line-height:1.9"><b>' + h(q.chuDe) + '</b></p>' +
        '<p class="sm mt" style="line-height:1.8">Sản phẩm cuối quý: ' + h(q.sanPham) + '</p>' +
        (q.loiChuyen ? '<p class="tiny mt" style="line-height:1.7;color:#0B6675">' + h(q.loiChuyen) + '</p>' : '') +
        '<ul class="tiny mt" style="line-height:1.8;padding-left:18px">' +
        (q.moc || []).map(function (m) { return '<li>' + h(m) + '</li>'; }).join('') + '</ul></div>';
    }).join('');

    if (G.T34_T4_NHIP) {
      o += '<div class="card mb"><span class="tiny up dim">NHỊP VẬN HÀNH TẦNG 4</span>' +
        (G.T34_T4_NHIP || []).map(function (n) {
          var ten = n.cua === 'ai' ? 'TRỢ LÝ' : (n.cua === 'coach' ? 'COACH' : 'CẢ HỆ');
          return '<p class="sm mt" style="line-height:1.8"><b>' + h(n.nhip) + ' · ' + ten + ':</b> ' +
            h(n.lam) + '</p>' +
            (n.vi ? '<p class="tiny dim" style="line-height:1.7">' + h(n.vi) + '</p>' : '') +
            (n.chuanBi ? '<p class="tiny" style="line-height:1.7;color:#B4720F">' + h(n.chuanBi) + '</p>' : '');
        }).join('') + '</div>';
    }

    if (G.T34_CHUQUYEN_CON) {
      var cq = G.T34_CHUQUYEN_CON;
      o += '<div class="card mb" style="border-color:#0B667544">' +
        '<span class="tiny up" style="color:#0B6675">CHỦ QUYỀN CỦA CON · TỪ ' + h(cq.tuTang) + '</span>' +
        '<p class="mt" style="line-height:1.9"><b>' + h(cq.luat) + '</b></p>' +
        '<p class="sm mt" style="line-height:1.8">Điều kiện: ' + h(cq.dieuKien) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7">Nếu không mở: ' + h(cq.neuKhongMo) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' + h(cq.meBietKhongCanThiep) + '</p>' +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(cq.vi) + '</p></div>';
    }

    /* ── Hai kịch bản phải thuộc ── */
    var tb = G.T34_THATBAI;
    if (tb) {
      o += U.sec('Kịch bản thất bại công khai — bắt buộc thuộc', tb.viBatBuoc || '');
      o += '<div class="card mb" style="border-color:#BE0E1644">' +
        (tb.buoc || []).map(function (b) {
          return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
            '<b class="sm">' + h(b.khi) + '</b>' +
            (b.khongLam ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16">' + h(b.khongLam) + '</p>' : '') +
            '<p class="tiny mt" style="line-height:1.7">' + h(b.lam) + '</p>' +
            (b.loiNoi ? '<p class="sm mt" style="line-height:1.8">&ldquo;' + h(b.loiNoi) + '&rdquo;</p>' : '') +
            (b.luat ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F"><b>' + h(b.luat) + '</b></p>' : '') +
            '</div>';
        }).join('') +
        '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>' + h(tb.loiNguyHiemNhat) + '</b></p></div>';
    }

    var dn = G.T34_DENNHAY;
    if (dn) {
      o += U.sec('Chế độ Đèn nháy — có cửa ngõ lớn trong lộ trình', dn.batKhiNao || '');
      o += '<div class="card mb">' + (dn.buoc || []).map(function (b) {
        return '<div style="padding:8px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b class="sm">' + b.no + '. ' + h(b.lam) + '</b>' +
          (b.vi ? '<p class="tiny dim mt" style="line-height:1.7">' + h(b.vi) + '</p>' : '') +
          (b.baCau ? '<ul class="tiny mt" style="line-height:1.8;padding-left:18px">' +
            (b.baCau || []).map(function (c) { return '<li>' + h(c) + '</li>'; }).join('') + '</ul>' : '') +
          (b.cam ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16">' + h(b.cam) + '</p>' : '') +
          (b.loiNoi ? '<p class="tiny mt" style="line-height:1.8">&ldquo;' + h(b.loiNoi) + '&rdquo;</p>' : '') +
          '</div>';
      }).join('') +
        '<p class="tiny mt" style="line-height:1.7;color:#B4720F"><b>' + h(dn.ketQuaThiKhongDoLoTrinh) + '</b></p></div>';
    }

    /* ── Mười bốn dạng khó ── */
    o += U.sec('Mười bốn dạng khó — sáu của tầng 3, tám của tầng 4',
      'Mỗi dạng kèm câu nói. Câu nói là chỗ dễ hỏng nhất, nên nó ghi nguyên văn.');
    o += '<div class="card mb">' + (G.T34_KHO || []).map(function (k) {
      var mau = k.tang === 'T3' ? '#0B6675' : '#B4720F';
      return '<div style="padding:10px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<span class="tiny up" style="color:' + mau + '">' + h(k.ma) + ' · ' + h(k.tang) +
        (k.aiXu === 'coach' ? ' · COACH XỬ' : '') + '</span>' +
        '<p class="sm mt" style="line-height:1.8"><b>' + h(k.ten) + '</b></p>' +
        (k.khongCoiThuong ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>' + h(k.khongCoiThuong) + '</b></p>' : '') +
        '<p class="tiny mt" style="line-height:1.7">' + h(k.xuLy) + '</p>' +
        (k.ngheAiTruoc ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' + h(k.ngheAiTruoc) + '</p>' : '') +
        (k.noiVoiNha ? '<p class="tiny mt" style="line-height:1.8">&ldquo;' + h(k.noiVoiNha) + '&rdquo;</p>' : '') +
        (k.luat ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F"><b>' + h(k.luat) + '</b></p>' : '') +
        (k.cam ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16">' + h(k.cam) + '</p>' : '') +
        (k.khiNaoChuyen ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16">' + h(k.khiNaoChuyen) + '</p>' : '') +
        (k.khiNaoChuyenTuyen ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16">' + h(k.khiNaoChuyenTuyen) + '</p>' : '') +
        (k.neuEpGayGat ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' + h(k.neuEpGayGat) + '</p>' : '') +
        (k.neuConMuonTuDi ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' + h(k.neuConMuonTuDi) + '</p>' : '') +
        (k.loTrinh ? '<p class="tiny mt" style="line-height:1.7;color:#0B6675">' + h(k.loTrinh) + '</p>' : '') +
        (k.vi ? '<p class="tiny dim mt" style="line-height:1.7">' + h(k.vi) + '</p>' : '') +
        (k.viKhongCam ? '<p class="tiny dim mt" style="line-height:1.7">' + h(k.viKhongCam) + '</p>' : '') +
        '</div>';
    }).join('') + '</div>';

    /* ── Hồ sơ năm ── */
    var hs = G.T34_HOSO;
    if (hs) {
      o += U.sec('Hồ sơ tài năng năm — sản phẩm lớn nhất tầng 4', hs.aiSoan || '');
      o += '<div class="card mb">' + (hs.muc || []).map(function (m) {
        return '<div style="padding:7px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b class="sm">' + h(m.ma) + ' · ' + h(m.ten) + '</b>' +
          (m.batBuoc ? ' <span class="tiny" style="color:#BE0E16">BẮT BUỘC CÓ</span>' : '') +
          (m.viBatBuoc ? '<p class="tiny dim mt" style="line-height:1.7">' + h(m.viBatBuoc) + '</p>' : '') +
          '</div>';
      }).join('') +
        '<p class="tiny mt" style="line-height:1.7;color:#0B6675">' + h(hs.dichSoMuc) + '</p></div>';
    }

    /* ── Ba cửa của ngày cuối, chạy thật qua cổng phí ── */
    var scr = G.t34SoiCuaRa();
    o += U.sec('Ba cửa của ngày cuối' + (scr.loi && scr.loi.length ? ' — LỆCH: ' + scr.loi.join(' · ') : ''),
      (G.T34_CUARA_LUAT || {}).loiTuSoTayCuaTuTvCongPhi || '');
    ['T3', 'T4'].forEach(function (t) {
      var r = G.t34CuaRa(t, typeof G.myFamily === 'function' ? G.myFamily() : null);
      if (r.chuaDo) return;
      o += '<div class="card mb"><span class="tiny up dim">' + h(r.tang) + ' · NGÀY ' + r.ngay + '</span>' +
        (r.cua || []).map(function (c) {
          return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
            '<b class="sm">' + h(c.ten) + '</b> ' +
            (c.quaCongPhi
              ? (c.mo ? '<span class="tiny" style="color:#0B6675">cổng phí MỞ</span>'
                      : '<span class="tiny" style="color:#B4720F">cổng phí CHƯA MỞ</span>')
              : '<span class="tiny dim">không qua cổng phí</span>') +
            '<p class="tiny mt" style="line-height:1.8">&ldquo;' + h(c.loi) + '&rdquo;</p>' +
            (c.viChua ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' + h(c.viChua) + '</p>' : '') +
            (c.moiNgay !== undefined
              ? '<p class="tiny mt" style="line-height:1.7;color:#0B6675">Giá tầng kế đọc từ HP_TANG: ' +
                Number(c.giaTangKe).toLocaleString('vi-VN') + ' đồng — khoảng ' +
                Number(c.moiNgay).toLocaleString('vi-VN') + ' đồng mỗi ngày, tính tại chỗ.</p>'
              : '') +
            '</div>';
        }).join('') + '</div>';
    });
    o += '<p class="tiny mb" style="line-height:1.7;color:#BE0E16"><b>' +
      h((G.T34_CUARA_LUAT || {}).camTuyetDoi || '') + '</b> ' +
      h((G.T34_CUARA_LUAT || {}).viCamTuyetDoi || '') + '</p>';
    o += '<p class="tiny dim mb" style="line-height:1.7">' +
      h((G.T34_CUARA_LUAT || {}).congDongThiVanKhanhThanh || '') + '</p>';

    /* ── KPI ── */
    o += U.sec('KPI hai tầng', (G.T34_KPI_LUAT || {}).motDichBangMotTram || '');
    ['T3', 'T4'].forEach(function (t) {
      var ds = G.t34Kpi(t);
      if (!ds.length) return;
      o += '<div class="card mb"><span class="tiny up dim">' + t + '</span>' + ds.map(function (k) {
        return '<div style="padding:7px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b class="sm">' + h(k.ten) + '</b> ' +
          '<span class="tiny" style="color:#0B6675">' + (k.nguoc ? '≤ ' : '≥ ') +
          h(String(k.dich)) + ' ' + h(k.donVi) + '</span>' +
          '<p class="tiny dim mt" style="line-height:1.7">' + h(k.y) + '</p></div>';
      }).join('') + '</div>';
    });
    o += '<p class="tiny dim mb" style="line-height:1.7">' +
      h((G.T34_KPI_LUAT || {}).viKhongChep || '') + '</p>';

    if (G.T34_AUDIT) {
      o += U.sec('Audit hai tầng', 'Đọc gì, và soi vào đâu.');
      o += '<div class="card mb">' + (G.T34_AUDIT || []).map(function (a) {
        return '<div style="padding:9px 0;border-bottom:1px solid var(--gita-vien-2)">' +
          '<b class="sm">' + h(a.tang) + ' — ' + h(a.matDo) + '</b>' +
          (a.viThua ? '<p class="tiny dim mt" style="line-height:1.7">' + h(a.viThua) + '</p>' : '') +
          '<ul class="tiny mt" style="line-height:1.8;padding-left:18px">' +
          (a.trongDiem || []).map(function (x) { return '<li>' + h(x) + '</li>'; }).join('') +
          '</ul></div>';
      }).join('') + '</div>';
    }

    /* ── Chỗ lệch ── */
    o += U.sec('Chỗ sổ tay lệch với kho', 'Máy đọc kho. Chỗ lệch ghi ra, không tự chọn hộ.');
    o += '<div class="card mb">' + (G.T34_LECH || []).map(function (l) {
      return '<div style="padding:10px 0;border-bottom:1px solid var(--gita-vien-2)">' +
        '<b class="sm">' + h(l.ma) + ' · ' + h(l.o) + '</b>' +
        '<p class="tiny mt" style="line-height:1.7"><b>Sổ tay:</b> ' + h(l.taiLieu) + '</p>' +
        '<p class="tiny mt" style="line-height:1.7"><b>Kho:</b> ' + h(l.kho) + '</p>' +
        (l.vanDe ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' + h(l.vanDe) + '</p>' : '') +
        (l.phepChia ? '<p class="tiny mt" style="line-height:1.7;color:#B4720F">' + h(l.phepChia) + '</p>' : '') +
        (l.dayLaLanThuMay ? '<p class="tiny mt" style="line-height:1.7">' + h(l.dayLaLanThuMay) + '</p>' : '') +
        '<p class="tiny dim mt" style="line-height:1.7">' + h(l.mayLam) + '</p>' +
        (l.noHoSo ? '<p class="tiny mt" style="line-height:1.7;color:#0B6675">Hồ sơ đã mở ở: ' + h(l.noHoSo) + '</p>' : '') +
        (l.suaGhiCu ? '<p class="tiny mt" style="line-height:1.7;color:#0B6675">' + h(l.suaGhiCu) + '</p>' : '') +
        (l.canGi ? '<p class="tiny mt" style="line-height:1.7;color:#BE0E16"><b>Cần: ' + h(l.canGi) + '</b></p>' : '') +
        (l.daRo ? '<p class="tiny mt" style="line-height:1.7;color:#0B6675">Chỗ này không cần chủ hệ quyết.</p>' : '') +
        '</div>';
    }).join('') + '</div>';

    o += G.kaKhung ? G.kaKhung('tang34', 'cuoi') : '';
    return o;
  };
})();
