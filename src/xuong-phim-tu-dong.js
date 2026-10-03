/* ═══════════════════════════════════════════════════════════════
   GITA 365 · XƯỞNG PHIM — LÀM TỰ ĐỘNG TỪ A ĐẾN Z (9.99.251)

   Chủ hệ chỉ dán KỊCH BẢN, bấm một nút. Máy làm lần lượt:
     1 · Phân cảnh   — AI đọc kịch bản → nhân vật, bối cảnh, ~36 cảnh quay
     2 · Đọc thoại   — giọng AI tiếng Việt cho từng câu (tuỳ chọn)
     3 · Chân dung   — mỗi nhân vật một ảnh tham chiếu cố định
     4 · Khung đầu   — ảnh mở đầu từng cảnh, giữ đúng mặt nhân vật
     5 · Quay        — ảnh → clip 5/10 giây (Kling 2.1)
     6 · Tải về      — clip và giọng về bộ nhớ tab (địa chỉ data:)
     7 · Xuất phim   — lắp phụ đề, logo, số tập, giọng, nhạc → MP4

   Mọi lời gọi đi qua máy chủ (may-chu/phim-ai.js) bằng khoá fal.ai của
   chủ hệ; trình duyệt KHÔNG cầm khoá. Tiến độ (mã việc, địa chỉ kết quả)
   lưu trong dự án ở localStorage: tải lại trang rồi bấm "Làm tiếp" thì
   việc đã trả tiền không bị gọi lại.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function () {
  var U = G.U, h = U.h;
  var GIA = {anh: 0.039, video5: 0.28, video10: 0.56, da5: 0.35, da10: 0.70, khopMoi: 0.07, kyTu: 0.0001, llm: 0.05,
    anhPro: 0.15, bt5: 0.56, bt10: 1.12};
  G.xpTdGia = GIA;
  /* 9.99.254 — hạng Bom tấn: Nano Banana Pro + Kling 3 Pro (chỉ khi không ở chế độ 0 đồng) */
  function la0dBat() { return !!(G.xp0d && G.xp0d.bat()); }
  function laBomTan(cl) { return cl === 'bomTan' && !la0dBat(); }
  /* Bom tấn Cloudflare (0 đồng): mặc định ở chế độ 0đ, trừ khi chọn "Tiêu chuẩn".
     Bật chỉ dẫn đạo diễn bom tấn cho kịch bản + ảnh khung lớn có màu điện ảnh. */
  function laBomTanCF(cl) { return la0dBat() ? cl !== 'thuong' : cl === 'bomTan'; }
  G.xpTdLoaiAnh = function (sua, cl) {
    var bt = laBomTanCF(cl === undefined ? (G.xpDA || {}).chatLuong : cl);
    return sua ? (bt ? 'anhSuaPro' : 'anhSua') : (bt ? 'anhPro' : 'anh');
  };
  G.xpTdLaBomTan = laBomTan;
  G.xpTdLaBomTanCF = laBomTanCF;
  var NAM = ['Deep_Voice_Man', 'Elegant_Man', 'Patient_Man', 'Determined_Man', 'Casual_Guy', 'Young_Knight', 'Decent_Boy', 'Imposing_Manner'];
  var NU = ['Wise_Woman', 'Calm_Woman', 'Lively_Girl', 'Lovely_Girl', 'Sweet_Girl_2', 'Inspirational_girl', 'Exuberant_Girl', 'Abbess', 'Friendly_Person'];
  var BUOC = [
    ['phanCanh', 'Phân cảnh kịch bản'], ['giong', 'Đọc thoại'], ['chanDung', 'Vẽ chân dung nhân vật'],
    ['khungDau', 'Vẽ khung mở đầu từng cảnh'], ['quay', 'Quay clip từng cảnh'], ['khopMoi', 'Khớp khẩu hình với giọng'],
        ['khopMoi0d', 'Khớp môi AI (máy GitHub miễn phí)'],
        ['tai', 'Tải clip về máy'], ['xuat', 'Xuất phim']
  ];
  var LOI_DUNG_HAN = ['CHUA_CO_KHOA', 'NOPERM', 'VUOT_HAN', 'AUTH', 'DIEU13', 'NHALA', 'CHE_DO_0_DONG', 'CHUA_CO_AI'];
  var CAM_XUC = ['happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised', 'neutral'];

  var dangChay = false, dungLai = false, fhLuu = null, khoaMan = null, trangThai = null, hoiLuc = 0;

  function TD() {
    var da = G.xpDA;
    if (!da.tuDong) da.tuDong = {buoc: '', viec: {}, nhatKy: [], coGiong: true};
    if (!da.tuDong.viec) da.tuDong.viec = {};
    if (!da.tuDong.nhatKy) da.tuDong.nhatKy = [];
    return da.tuDong;
  }
  function luu() { if (G.xpLuu) G.xpLuu(); }
  function laR01() {
    var S = G.S || {};
    return [S.role, (S.acc || {}).role, (S.hoSo || {}).role].indexOf('R01') >= 0;
  }
  function ghi(chu, kho) {
    var td = kho || TD(), gio = new Date().toTimeString().slice(0, 5);
    if (!td.nhatKy) td.nhatKy = [];
    td.nhatKy.push(gio + ' · ' + chu); if (td.nhatKy.length > 40) td.nhatKy = td.nhatKy.slice(-40);
    if (kho && kho.luu) kho.luu(); else luu();
    hienTienDo(chu, kho);
  }
  function hienTienDo(chu, kho) {
    var tien = kho && kho.tienTo ? kho.tienTo : 'xp-td';
    var el = document.getElementById(tien + '-tt'); if (el) el.textContent = chu;
    var nk = document.getElementById(tien + '-nk');
    if (nk) nk.textContent = (kho || TD()).nhatKy.slice(-8).join('\n');
    if (!kho && G.xpDA.boMa) { var e2 = document.getElementById('xb-tt'); if (e2) e2.textContent = 'Tập ' + G.xpDA.boTap + ' · ' + chu; }
  }

  /* ══ GỠ BẮT OAN CỦA CỔNG ĐIỀU 13 ══
     Cổng chặn cụm giống họ tên ("mẹ lại phải nhắc" — "Lại" là một họ;
     "QUẢN LÝ" — viết hoa liền). Với chữ DO AI VIẾT (nhân vật hư cấu), máy
     chèn dấu phẩy sau từ đầu của cụm bị ngờ để cụm không còn đọc thành
     "dấu người + họ + tên" — nghĩa câu giữ nguyên, cổng vẫn quét lại đủ
     từ đầu. Không đụng kịch bản người dùng tự dán (bước phân cảnh đơn lẻ
     vẫn dừng để người dùng tự sửa). */
  function boDau(c) { return c.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase(); }
  G.xpSuaNgo = function (chu, ngo) {
    var s = String(chu || ''), cum = [];
    (ngo || []).forEach(function (n) { String(n && n.thay || '').split(' · ').forEach(function (x) { x = x.trim(); if (x) cum.push(x); }); });
    cum.sort(function (a, b) { return b.length - a.length; });
    cum.forEach(function (p) {
      var pg = p.split('').map(boDau).join('').replace(/\s+/g, ' ');
      var map = [], g = '';
      for (var i = 0; i < s.length; i++) { var b = boDau(s.charAt(i)); for (var k = 0; k < b.length; k++) { g += /\s/.test(b.charAt(k)) ? ' ' : b.charAt(k); map.push(i); } }
      var tu = 0, ra = [];
      while (true) {
        var j = g.indexOf(pg, tu); if (j < 0) break;
        if (j === 0 || !/[a-z0-9]/.test(g.charAt(j - 1))) {
          var khoang = g.indexOf(' ', j);
          if (khoang > j && khoang < j + pg.length) ra.push(map[khoang]);
        }
        tu = j + pg.length;
      }
      for (var r = ra.length - 1; r >= 0; r--) {
        var vt = ra[r];
        if (s.charAt(vt - 1) !== ',') s = s.slice(0, vt) + ',' + s.slice(vt);
      }
    });
    return s;
  };
  function suaNgoDV(o, ngo, k) {
    if (typeof o === 'string') return (/^https:\/\//.test(o) || /^(giong|khung|loai|che|camXuc|keys)$/.test(k || '')) ? o : G.xpSuaNgo(o, ngo);
    if (Array.isArray(o)) return o.map(function (x) { return suaNgoDV(x, ngo, k); });
    if (o && typeof o === 'object') {
      var r = {}; Object.keys(o).forEach(function (kk) { r[kk] = suaNgoDV(o[kk], ngo, kk); }); return r;
    }
    return o;
  }
  G.xpSuaNgoDV = suaNgoDV;
  function goi(fn, y) {
    return G.goiMayChu(fn, y).then(function (x) { return x || {ok: false, error: 'Máy chủ không trả lời.'}; });
  }
  function ngu(ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); }
  function usd(n) { return (Math.round(n * 100) / 100).toFixed(2).replace('.', ',') + ' USD'; }
  /* 9.99.253 — chế độ 0 đồng (mặc định): Workers AI miễn phí + giọng đọc trong máy */
  function che0d() { return !!(G.xp0d && G.xp0d.bat()); }
  G.xpTdChe0d = che0d;

  /* ══ ƯỚC TÍNH CHI PHÍ ══ */
  G.xpTdUocTinh = function (da) {
    da = da || G.xpDA;
    var kyTu = 0, video = 0, khop = 0, dienAnh = da.chatLuong === 'dienAnh', bt = laBomTan(da.chatLuong);
    da.canh.forEach(function (c) {
      var dai = +c.giay > 5;
      video += bt ? (dai ? GIA.bt10 : GIA.bt5) : dai ? (dienAnh ? GIA.da10 : GIA.video10) : (dienAnh ? GIA.da5 : GIA.video5);
      c.thoai.forEach(function (x) { kyTu += String(x.loi || '').length; });
      if (da.khopMoi && c.thoai.length === 1) khop += GIA.khopMoi;
    });
    var coGiong = (da.tuDong || {}).coGiong !== false;
    var giong = coGiong ? kyTu * GIA.kyTu : 0;
    var nvMoi = da.nhanVat.filter(function (n) { return !n.anhUrl; }).length;
    var giay = 0; da.canh.forEach(function (c) { giay += +c.giay || 5; });
    var la0d = che0d(), neuron = la0d && G.xp0d ? G.xp0d.uocNeuron(nvMoi + da.canh.length, 0, laBomTanCF(da.chatLuong)) : 0;
    return {nv: da.nhanVat.length, canh: da.canh.length, giay: giay, che0d: la0d, neuron: neuron,
      ngay: la0d && G.xp0d ? G.xp0d.soNgay(neuron) : 0,
      tien: la0d ? 0 : GIA.llm + (nvMoi + da.canh.length) * (bt ? GIA.anhPro : GIA.anh) + video + giong + (coGiong ? khop : 0)};
  };

  /* ══ ĐỌC KẾT QUẢ PHÂN CẢNH ══ */
  function docJSON(chu) {
    var s = String(chu || '').replace(/^\s*```(?:json)?/i, '').replace(/```\s*$/, '');
    var a = s.indexOf('{'), b = s.lastIndexOf('}');
    if (a < 0 || b <= a) throw new Error('AI không trả JSON.');
    return JSON.parse(s.slice(a, b + 1));
  }
  function chuoi(v, n) { return String(v == null ? '' : v).trim().slice(0, n || 2000); }
  G.xpTdApDung = function (o, da) {
    da = da || G.xpDA;
    var ma = G.xpMa || function (t) { return t + '-' + Math.random().toString(36).slice(2, 9); };
    if (!o || !Array.isArray(o.canh) || !o.canh.length) throw new Error('AI không chia được cảnh nào.');
    if (o.ten) da.ten = chuoi(o.ten, 120);
    if (o.phongCach) da.phongCach = chuoi(o.phongCach, 600);
    var dungNam = 0, dungNu = 0, daDung = {};
    da.nhanVat = (o.nhanVat || []).slice(0, 20).map(function (n) {
      var gioi = /^n(u|ữ)$/i.test(chuoi(n.gioi)) ? 'nu' : 'nam';
      var g = chuoi(n.giong, 40), bo = gioi === 'nu' ? NU : NAM;
      if (bo.indexOf(g) < 0 || daDung[g]) {
        g = bo.filter(function (x) { return !daDung[x]; })[0] || bo[(gioi === 'nu' ? dungNu++ : dungNam++) % bo.length];
      }
      daDung[g] = 1;
      return {id: ma('nv'), ten: chuoi(n.ten, 40), moTa: chuoi(n.moTa, 200), prompt: chuoi(n.prompt, 600), gioi: gioi, giong: g};
    }).filter(function (n) { return n.ten; });
    da.boiCanh = (o.boiCanh || []).slice(0, 30).map(function (b) {
      return {id: ma('bc'), ten: chuoi(b.ten, 80), prompt: chuoi(b.prompt, 600)};
    }).filter(function (b) { return b.ten; });
    function bcId(ten) {
      var t = chuoi(ten).toLowerCase();
      var b = da.boiCanh.filter(function (x) { return x.ten.toLowerCase() === t; })[0];
      if (!b && t) { b = {id: ma('bc'), ten: chuoi(ten, 80), prompt: ''}; da.boiCanh.push(b); }
      return b ? b.id : ((da.boiCanh[0] || {}).id || '');
    }
    function loi(ds, coCamXuc) {
      return (Array.isArray(ds) ? ds : []).slice(0, 6).map(function (x) {
        var r = {ai: chuoi(x && x.ai, 40), loi: chuoi(x && x.loi, 600)};
        if (coCamXuc && CAM_XUC.indexOf(chuoi(x && x.camXuc, 20)) >= 0) r.camXuc = chuoi(x.camXuc, 20);
        return r;
      }).filter(function (x) { return x.loi; });
    }
    da.canh = o.canh.slice(0, 80).map(function (c) {
      return {id: ma('c'), boiCanh: bcId(c.boiCanh), chiDao: chuoi(c.chiDao, 120), hanhDong: chuoi(c.hanhDong, 800),
        nhanVat: (Array.isArray(c.nhanVat) ? c.nhanVat : []).slice(0, 6).map(function (x) { return chuoi(x, 40); }),
        hinh: chuoi(c.hinh, 1200), chuyenDong: chuoi(c.chuyenDong, 800),
        thoai: loi(c.thoai, true), tinNhan: loi(c.tinNhan), giay: +c.giay >= 8 ? 10 : 5, clip: ''};
    });
    if (G.xpBoGhep) G.xpBoGhep(da);
    return da;
  };
  G.xpTdDocJSON = function (chu) { return docJSON(chu); };

  /* ══ CHẠY MỘT LÔ VIỆC — gửi tối đa `gioiHan` việc, hỏi 12 việc/lượt ══ */
  function chayLo(ds, gioiHan, nhan, kho) {
    return new Promise(function (ok, hong) {
      var td = kho || TD(), cho = [], dang = [], xong = 0, hongDem = 0, tong = ds.length, ketThuc = false;
      var la0d = che0d(), choDen = 0;
      var luuKho = function () { if (kho && kho.luu) kho.luu(); else luu(); };
      var ghiKho = function (chu) { ghi(chu, kho); };
      if (!td.viec) td.viec = {};
      if (!tong) { ok({xong: 0, hong: 0}); return; }
      ds.forEach(function (v) {
        var s = td.viec[v.khoa];
        if (s && s.kq) {
          try { v.xong(s.kq); xong++; return; } catch (e) { delete s.kq; }
        }
        if (s && s.xem && la0d) { delete s.xem; delete s.lay; }
        if (s && s.xem) { dang.push(v); return; }
        if (s) { s.lan = 0; delete s.loi; }
        cho.push(v);
      });
      function bao() { hienTienDo(nhan + ': xong ' + xong + '/' + tong + (hongDem ? ' · lỗi ' + hongDem : '') + ' · đang chạy ' + dang.length, kho); }
      function het(loi) {
        if (ketThuc) return; ketThuc = true; luuKho();
        if (loi) hong(loi); else ok({xong: xong, hong: hongDem});
      }
      function bo(v) { dang = dang.filter(function (x) { return x !== v; }); }
      function thatBai(v, chu) {
        var s = td.viec[v.khoa] || {}; s.lan = (s.lan || 0) + 1; delete s.xem; delete s.lay;
        td.viec[v.khoa] = s; bo(v);
        if (s.lan < 2) { cho.push(v); ghiKho(nhan + ' · thử lại: ' + chu); return; }
        s.loi = chu; hongDem++; xong++; ghiKho(nhan + ' · bỏ qua một việc: ' + chu);
        if (v.hong) try { v.hong(chu); } catch (e) {}
      }
      function loiGui(v, x) {
        /* Chữ do AI viết bị cổng Điều 13 ngờ oan → chèn dấu phẩy rồi gửi lại (tối đa 3 lần) */
        if (x.code === 'DIEU13' && v.tuSua && (v.lanSua || 0) < 3) {
          var moi = suaNgoDV(v.dauVao, x.ngo);
          if (JSON.stringify(moi) !== JSON.stringify(v.dauVao)) {
            v.lanSua = (v.lanSua || 0) + 1; v.dauVao = moi; bo(v); cho.unshift(v);
            ghiKho(nhan + ' · tách cụm giống họ tên (' + (x.ngo || []).map(function (n) { return n.thay; }).join(' · ') + ') rồi gửi lại.');
            return;
          }
        }
        if (x.code === 'DIEU13' && v.tuSua) { thatBai(v, 'cổng Điều 13 chặn: ' + (x.ngo || []).map(function (n) { return n.thay; }).join(' · ')); return; }
        if (LOI_DUNG_HAN.indexOf(x.code) >= 0 || /HTTP 40[123]/.test(x.error || '')) { het(x); return; }
        thatBai(v, x.error || 'không gửi được');
      }
      /* Chế độ 0 đồng: làm xong ngay trong một lượt gọi, không phải hỏi lại */
      function gui0d(v) {
        G.xp0d.lam(v.loai, v.dauVao).then(function (x) {
          v.dangGui = false;
          if (ketThuc) return;
          if (x.ok) {
            try { v.xong(x.kq); } catch (e) { thatBai(v, String(e && e.message || e)); return; }
            var s = td.viec[v.khoa] || {}; s.loai = v.loai; s.kq = x.kq; delete s.xem; delete s.lay;
            td.viec[v.khoa] = s; bo(v); xong++; luuKho(); bao(); return;
          }
          if (x.code === 'HET_MIEN_PHI') {
            bo(v); cho.unshift(v);
            var mai = Date.parse(x.mai || '') || (Date.now() + 3600000);
            if (mai + 120000 > choDen) {
              choDen = mai + 120000;
              ghiKho(nhan + ' · hết phần miễn phí hôm nay — máy tự làm tiếp lúc ' + new Date(choDen).toTimeString().slice(0, 5) + '. Không tốn đồng nào.');
            }
            return;
          }
          loiGui(v, x);
        });
      }
      function gui() {
        if (choDen > Date.now()) return;
        while (!dungLai && dang.length < gioiHan && cho.length) {
          var v = cho.shift(); dang.push(v); v.dangGui = true;
          if (la0d) { gui0d(v); continue; }
          (function (v) {
            goi('phimGuiViec', Object.assign({loai: v.loai}, v.dauVao)).then(function (x) {
              v.dangGui = false;
              if (x.ok) { var s = td.viec[v.khoa] || {}; s.loai = v.loai; s.xem = x.xem; s.lay = x.lay; td.viec[v.khoa] = s; luuKho(); return; }
              loiGui(v, x);
            });
          })(v);
        }
      }
      function baoCho() {
        var con = Math.max(0, choDen - Date.now()), gio = Math.floor(con / 3600000), phut = Math.ceil((con % 3600000) / 60000);
        hienTienDo(nhan + ': đã dùng hết phần MIỄN PHÍ hôm nay. Máy tự làm tiếp lúc ' + new Date(choDen).toTimeString().slice(0, 5) +
          ' (còn ' + (gio ? gio + ' giờ ' : '') + phut + ' phút). Giữ máy bật và tab này mở — không tốn đồng nào.', kho);
      }
      function vong() {
        if (ketThuc) return;
        if (dungLai) { het({code: 'DUNG', error: 'Đã dừng theo yêu cầu.'}); return; }
        if (xong >= tong) { het(); return; }
        gui(); bao();
        if (choDen > Date.now()) baoCho();
        var hoi = dang.filter(function (v) { return !v.dangGui && td.viec[v.khoa] && td.viec[v.khoa].xem; }).slice(0, 12);
        if (!hoi.length) { setTimeout(vong, 1500); return; }
        goi('phimXemViec', {ds: hoi.map(function (v) { var s = td.viec[v.khoa]; return {loai: v.loai, xem: s.xem, lay: s.lay}; })})
          .then(function (x) {
            if (!x.ok) {
              if (LOI_DUNG_HAN.indexOf(x.code) >= 0) { het(x); return; }
              setTimeout(vong, 8000); return;
            }
            (x.ds || []).forEach(function (r, i) {
              var v = hoi[i]; if (!v || !r) return;
              if (r.trangThai === 'XONG') {
                try { v.xong(r.ketQua); } catch (e) { thatBai(v, String(e && e.message || e)); return; }
                td.viec[v.khoa].kq = r.ketQua; delete td.viec[v.khoa].xem; delete td.viec[v.khoa].lay;
                bo(v); xong++;
              } else if (r.trangThai === 'LOI') thatBai(v, r.loi || 'model báo lỗi');
            });
            luuKho(); bao();
            setTimeout(vong, xong >= tong ? 0 : 5000);
          });
      }
      vong();
    });
  }

  /* ══ TẢI KẾT QUẢ VỀ BỘ NHỚ TAB ══ */
  var ctxGiai = null;
  function taiBlob(url) {
    if (G.xp0d && G.xp0d.laIdb(url)) return G.xp0d.doc(url);
    return fetch(url, {credentials: 'omit', cache: 'no-store'}).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status); return r.blob();
    });
  }
  function taiPhim(url, ten) {
    return taiBlob(url).then(function (bl) {
      return new Promise(function (ok, hong) {
        var fr = new FileReader();
        fr.onload = function () {
          var v = document.createElement('video'); v.preload = 'auto'; v.playsInline = true;
          v.onloadedmetadata = function () { var id = G.xpMa('v'); G.xpVat[id] = {ma: id, ten: ten, loai: 'phim', el: v}; ok(id); };
          v.onerror = function () { hong(new Error('không phát được clip')); };
          v.src = fr.result;
        };
        fr.onerror = function () { hong(new Error('không đọc được clip')); };
        fr.readAsDataURL(bl);
      });
    });
  }
  function taiAnh(url, ten) {
    return taiBlob(url).then(function (bl) { return createImageBitmap(bl); }).then(function (bm) {
      var id = G.xpMa('v'); G.xpVat[id] = {ma: id, ten: ten, loai: 'anh', el: bm}; return id;
    });
  }
  function taiGiong(url, ten) {
    if (!ctxGiai) ctxGiai = new (window.AudioContext || window.webkitAudioContext)();
    return taiBlob(url).then(function (bl) { return bl.arrayBuffer(); })
      .then(function (b) { return ctxGiai.decodeAudioData(b); })
      .then(function (buf) { var id = G.xpMa('g'); G.xpVat[id] = {ma: id, ten: ten, loai: 'giong', buffer: buf}; return id; });
  }
  function chayLan(viec, gioiHan) {
    var i = 0;
    function mot() {
      if (dungLai || i >= viec.length) return Promise.resolve();
      var f = viec[i++]; return f().then(mot, mot);
    }
    var ds = []; for (var k = 0; k < gioiHan; k++) ds.push(mot());
    return Promise.all(ds);
  }
  G.xpTdChayLo = chayLo;
  G.xpTdDangChay = function () { return dangChay; };

  /* ══ CÁC BƯỚC ══ */
  function nvTheoTen(ten) {
    var t = String(ten || '').toLowerCase();
    return G.xpDA.nhanVat.filter(function (n) { return n.ten.toLowerCase() === t; })[0];
  }
  function buocPhanCanh() {
    var td = TD(), da = G.xpDA;
    if (td.phanCanhXong) return Promise.resolve();
    td.viec = {}; td.ngo = null; td.quay = {};
    var laTap = !!(da.boMa && G.xpBoKinh);
    var dv = laTap ? {che: 'tap', kinh: G.xpBoKinh(), soTap: da.boTap} : {kichBan: da.kichBan};
    var cl = laTap && G.xpBoChatLieu ? G.xpBoChatLieu() : '';
    if (cl) dv.chatLieu = cl;
    if (laBomTanCF(da.chatLuong)) dv.bomTan = true;
    ghi(laTap ? 'AI viết kịch bản phân cảnh tập ' + da.boTap + ' (khoảng 5 phút)…' : 'Bắt đầu phân cảnh kịch bản (' + da.kichBan.length + ' ký tự)…');
    return chayLo([{khoa: 'llm', loai: 'llm', dauVao: dv, tuSua: laTap, xong: function (kq) {
      G.xpTdApDung(docJSON(kq.chu), da);
    }}], 1, 'Phân cảnh').then(function (r) {
      if (r.hong) { delete td.viec.llm; throw {error: 'AI phân cảnh không thành công. Bấm "Làm phim tự động" để thử lại.'}; }
      td.phanCanhXong = true; td.daDuyet = !!td.duyetSan; luu();
      ghi('Đã chia ' + da.canh.length + ' cảnh · ' + da.nhanVat.length + ' nhân vật · ' + da.boiCanh.length + ' bối cảnh.');
      if (G.xpVeLai) G.xpVeLai();
    });
  }
  function buocGiong() {
    var td = TD(), ds = [];
    if (!td.coGiong) return Promise.resolve();
    G.xpDA.canh.forEach(function (c) {
      c.thoai.forEach(function (x, i) {
        var n = nvTheoTen(x.ai), dv = {loi: x.loi, giong: (n && n.giong) || 'Wise_Woman'};
        if (x.camXuc) dv.camXuc = x.camXuc;
        ds.push({khoa: 'g-' + c.id + '-' + i, loai: 'giong', dauVao: dv, tuSua: true,
          xong: function (kq) { x.amUrl = kq.url; x.amMs = +kq.ms || 0; }});
      });
    });
    ghi('Đọc thoại: ' + ds.length + ' câu.');
    return chayLo(ds, 6, 'Đọc thoại').then(function () {
      G.xpDA.canh.forEach(function (c) {
        var t = 0.3;
        c.thoai.forEach(function (x) {
          var d = x.amMs ? x.amMs / 1000 : 0;
          if (!d) { delete x.tu; delete x.den; return; }
          x.tu = t; x.den = t + d; t = x.den + 0.25;
        });
        if (t + 0.15 > 5.2) c.giay = 10;
      });
      luu();
    });
  }
  function buocChanDung() {
    var da = G.xpDA;
    var ds = da.nhanVat.filter(function (n) { return !n.anhUrl; }).map(function (n) {
      return {khoa: 'cd-' + n.id, loai: G.xpTdLoaiAnh(false), tuSua: true, dauVao: {khung: '9:16', prompt:
        'Vertical 9:16 character reference portrait, ' + da.phongCach + '. ' + (n.prompt || n.moTa) +
        ', upper body, natural neutral expression, looking at camera, plain light grey studio background, sharp focus on the face, no text, no watermark.'},
        xong: function (kq) { n.anhUrl = kq.url; }};
    });
    if (!ds.length) return Promise.resolve();
    ghi('Vẽ chân dung ' + ds.length + ' nhân vật.');
    return chayLo(ds, 6, 'Chân dung');
  }
  function buocKhungDau() {
    var da = G.xpDA;
    var ds = da.canh.map(function (c) {
      var p = G.xpPrompt(c), co = p.nv.filter(function (n) { return n.sheetUrl || n.anhUrl; }).slice(0, 3);
      var bc = da.boiCanh.filter(function (b) { return b.id === c.boiCanh; })[0];
      var dv = {khung: '9:16', prompt: p.anh};
      var loai = G.xpTdLoaiAnh(false), refs = co.map(function (n) { return n.sheetUrl || n.anhUrl; }), ta = co.map(function (n, i) {
        return 'image ' + (i + 1) + ' is the character reference of ' + n.ten;
      });
      if (bc && bc.plateUrl) { refs.push(bc.plateUrl); ta.push('image ' + refs.length + ' is the location "' + bc.ten + '" (keep its architecture, furniture, colors and lighting)'); }
      if (refs.length) {
        loai = G.xpTdLoaiAnh(true);
        dv.anhThamChieu = refs;
        dv.prompt = p.anh + ' Reference images: ' + ta.join('; ') +
          '. Keep each character\'s face, hairstyle, distinguishing marks and outfit exactly as in the references, placed naturally in the scene. ' +
          'A single photorealistic cinematic film still, vertical 9:16, not a collage, no text.';
      }
      return {khoa: 'kd-' + c.id, loai: loai, dauVao: dv, tuSua: true, xong: function (kq) { c.anhUrl = kq.url; }};
    });
    ghi('Vẽ khung mở đầu ' + ds.length + ' cảnh.');
    return chayLo(ds, 6, 'Khung mở đầu');
  }
  function buocQuay() {
    var dienAnh = G.xpDA.chatLuong === 'dienAnh', bt = laBomTan(G.xpDA.chatLuong);
    var ds = G.xpDA.canh.filter(function (c) { return c.anhUrl; }).map(function (c) {
      var p = G.xpPrompt(c), dv = {prompt: p.video, anh: c.anhUrl, giay: +c.giay > 5 ? '10' : '5', am: p.am};
      if (bt) dv.nhanVat = p.nv.filter(function (n) { return n.anhUrl; }).slice(0, 3).map(function (n) {
        return {ten: n.ten, mat: n.anhUrl, thamChieu: n.sheetUrl ? [n.sheetUrl] : [n.anhUrl]};
      });
      return {khoa: 'q-' + c.id, loai: bt ? 'videoBomTan' : dienAnh ? 'videoDienAnh' : 'video', tuSua: true,
        dauVao: dv,
        xong: function (kq) { if (!c.khopMoi) c.videoUrl = kq.url; c.videoQuay = kq.url; }};
    });
    ghi('Quay ' + ds.length + ' clip' + (bt ? ' hạng BOM TẤN (Kling 3 Pro)' : dienAnh ? ' chất lượng điện ảnh' : '') + ' (mỗi clip 1–5 phút, chạy song song).');
    return chayLo(ds, 6, 'Quay clip');
  }
  /* Khớp khẩu hình: cảnh có đúng MỘT câu thoại đã đọc (2 giây trở lên, vừa trong clip) */
  function buocKhopMoi() {
    var da = G.xpDA;
    if (!da.khopMoi || TD().coGiong === false) return Promise.resolve();
    var ds = da.canh.filter(function (c) {
      var x = c.thoai.length === 1 && c.thoai[0];
      return x && x.amUrl && x.amMs >= 2000 && x.amMs <= (+c.giay || 5) * 1000 - 200 && (c.videoQuay || c.videoUrl);
    }).map(function (c) {
      var x = c.thoai[0];
      return {khoa: 'km-' + c.id, loai: 'lipSync', dauVao: {video: c.videoQuay || c.videoUrl, am: x.amUrl},
        xong: function (kq) {
          if (c.videoUrl !== kq.url && c.clip && G.xpVat[c.clip]) { delete G.xpVat[c.clip]; c.clip = ''; }
          c.videoUrl = kq.url; c.khopMoi = true; x.tu = 0; x.den = x.amMs / 1000;
        }};
    });
    if (!ds.length) return Promise.resolve();
    ghi('Khớp khẩu hình ' + ds.length + ' cảnh có lời thoại.');
    return chayLo(ds, 6, 'Khớp khẩu hình');
  }
  /* ══ KHỚP MÔI 0 ĐỒNG — máy CPU miễn phí của GitHub Actions (SadTalker)
     quay khuôn mặt trong khung cảnh nói theo đúng tiếng thoại. Chỉ cảnh
     có MỘT người nói (2–15 giây); tiếng vẫn phát từ giọng trong máy nên
     clip trả về không kèm âm thanh và bắt đầu đúng từ giây 0 của cảnh. ══ */
  var KM0 = {toiThieu: 2, toiDa: 15, hoi: 30000};
  function apiGoc() { return String(G.API_CAP_PHEP || 'https://gita365.typhuquanggita.workers.dev').replace(/\/+$/, ''); }
  function canhKhopMoi0d(c) {
    if (!c.anhUrl || c.videoUrl) return 0;
    var noi = c.thoai.filter(function (x) { return x.amUrl && x.amMs && x.den; });
    if (!noi.length) return 0;
    var ai = {}; noi.forEach(function (x) { ai[String(x.ai || '').toLowerCase()] = 1; });
    if (Object.keys(ai).length !== 1) return 0;
    var p = G.xpPrompt ? G.xpPrompt(c) : {nv: []};
    if ((p.nv || []).length > 1) return 0;
    var d = Math.max(+c.giay || 5, Math.max.apply(null, noi.map(function (x) { return +x.den; })) + 0.4);
    return d >= KM0.toiThieu && d <= KM0.toiDa ? d : 0;
  }
  G.xpTdCanhKhopMoi0d = canhKhopMoi0d;
  function blobB64(bl) {
    return new Promise(function (ok, hong) {
      var fr = new FileReader();
      fr.onload = function () { ok(String(fr.result).replace(/^data:[^,]*,/, '')); };
      fr.onerror = function () { hong(new Error('không đọc được tệp')); };
      fr.readAsDataURL(bl);
    });
  }
  function wavTu(buf) {
    var d = buf.getChannelData(0), n = d.length, ab = new ArrayBuffer(44 + n * 2), v = new DataView(ab);
    function s(o, t) { for (var i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); }
    s(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); s(8, 'WAVE'); s(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, buf.sampleRate, true); v.setUint32(28, buf.sampleRate * 2, true);
    v.setUint16(32, 2, true); v.setUint16(34, 16, true); s(36, 'data'); v.setUint32(40, n * 2, true);
    for (var i = 0; i < n; i++) { var x = Math.max(-1, Math.min(1, d[i])); v.setInt16(44 + i * 2, x < 0 ? x * 0x8000 : x * 0x7FFF, true); }
    return new Blob([ab], {type: 'audio/wav'});
  }
  G.xpTdWavTu = wavTu;
  /* Trộn các câu thoại của cảnh vào một dải tiếng 16 kHz dài đúng bằng cảnh */
  function amCanhWav(c, giay) {
    var tan = 16000, oc = new OfflineAudioContext(1, Math.ceil(giay * tan), tan);
    var noi = c.thoai.filter(function (x) { return x.amUrl && x.amMs && x.den; });
    return Promise.all(noi.map(function (x) {
      return taiBlob(x.amUrl).then(function (bl) { return bl.arrayBuffer(); })
        .then(function (b) { return oc.decodeAudioData(b); })
        .then(function (ab) { var s = oc.createBufferSource(); s.buffer = ab; s.connect(oc.destination); s.start(Math.max(0, +x.tu || 0)); });
    })).then(function () { return oc.startRendering(); }).then(wavTu);
  }
  function buocKhopMoi0d() {
    var da = G.xpDA, td = TD();
    if (da.khopMoi0d === false || td.coGiong === false) return Promise.resolve();
    if (!td.quay) td.quay = {};
    var ds = da.canh.filter(function (c) { var q = td.quay[c.id]; return q ? !q.xong && !q.loi : canhKhopMoi0d(c); });
    if (!ds.length) return Promise.resolve();
    var chan = null;
    var gui = ds.filter(function (c) { return !td.quay[c.id]; }).map(function (c) {
      return function () {
        if (chan) return Promise.resolve();
        var giay = canhKhopMoi0d(c);
        return Promise.all([taiBlob(c.anhUrl).then(blobB64), amCanhWav(c, giay).then(blobB64)]).then(function (v) {
          return goi('quayKhopMoi', {anh: v[0], am: v[1]});
        }).then(function (x) {
          if (x.ok) { td.quay[c.id] = {ma: x.ma}; luu(); return; }
          if (x.code === 'CHUA_CO_XUONG' || x.code === 'CHUA_CO_R2' || x.code === 'NOPERM' || x.code === 'DAY') chan = x;
          else ghi('Khớp môi: bỏ qua 1 cảnh (' + (x.error || 'lỗi') + ').');
        }, function (e) { ghi('Khớp môi: bỏ qua 1 cảnh (' + ((e && e.message) || e) + ').'); });
      };
    });
    ghi('Khớp môi 0 đồng: ' + ds.length + ' cảnh một người nói → xưởng quay GitHub (máy miễn phí, mỗi cảnh 10–30 phút, nhiều máy chạy song song).');
    var t0 = Date.now();
    return chayLan(gui, 2).then(function () {
      if (chan) { ghi('Khớp môi tạm bỏ qua: ' + (chan.error || '') + ' Phim vẫn làm bằng ảnh tĩnh chuyển động.'); return; }
      function vong() {
        if (dungLai) throw {code: 'DUNG', error: 'Đã dừng.'};
        var cho = da.canh.filter(function (c) { var q = td.quay[c.id]; return q && q.ma && !q.xong && !q.loi; });
        if (!cho.length) return;
        if (Date.now() - t0 > 8 * 3600e3) { ghi('Khớp môi quá 8 giờ chưa xong — dùng ảnh tĩnh cho các cảnh còn lại.'); return; }
        return goi('quayXem', {ds: cho.map(function (c) { return td.quay[c.id].ma; })}).then(function (x) {
          if (x && x.ok) {
            var dang = 0, truoc = 0;
            (x.ds || []).forEach(function (r, i) {
              var c = cho[i], q = c && td.quay[c.id];
              if (!q || r.ma !== q.ma) return;
              if (r.trangThai === 'xong' && r.url) {
                q.xong = true; c.videoUrl = apiGoc() + r.url; c.khopMoi0d = true;
                if (c.clip && G.xpVat[c.clip]) { delete G.xpVat[c.clip]; c.clip = ''; }
              }
              else if (r.trangThai === 'loi' || r.trangThai === 'mat') { q.loi = r.loi || 'mất việc'; }
              else if (r.trangThai === 'dang') dang++;
              else truoc = Math.max(truoc, +r.truoc || 0);
            });
            luu();
            var xong = da.canh.filter(function (c) { return td.quay[c.id] && td.quay[c.id].xong; }).length;
            var tong = Object.keys(td.quay).length;
            hienTienDo('Khớp môi: xong ' + xong + '/' + tong + ' · đang quay ' + dang + ' · máy GitHub đang chạy ' + (+x.mayDangChay || 0) +
              (x.mayDangChay ? '' : ' (máy tự bật trong vòng ~10 phút)'));
          }
          return ngu(KM0.hoi).then(vong);
        });
      }
      return vong();
    }).then(function () {
      var hong = Object.keys(td.quay).filter(function (k) { return td.quay[k].loi; }).length;
      if (hong) ghi('Khớp môi: ' + hong + ' cảnh không quay được (thường do khung không thấy rõ mặt) — dùng ảnh tĩnh chuyển động.');
    });
  }
  function buocTai() {
    var viec = [], loiDem = 0;
    G.xpDA.canh.forEach(function (c, i) {
      var ten = 'canh-' + (i < 9 ? '0' : '') + (i + 1);
      if (!(c.clip && G.xpVat[c.clip])) {
        if (c.videoUrl) viec.push(function () { return taiPhim(c.videoUrl, ten + '.mp4').then(function (id) { c.clip = id; }, function () {
          /* Clip khớp môi 0 đồng chỉ giữ 7 ngày trên máy chủ — mất thì quay về ảnh tĩnh của cảnh */
          if (c.khopMoi0d && c.anhUrl) return taiAnh(c.anhUrl, ten + '.jpg').then(function (id) { c.clip = id; }, function () { loiDem++; });
          loiDem++;
        }); });
        else if (c.anhUrl) viec.push(function () { return taiAnh(c.anhUrl, ten + '.jpg').then(function (id) { c.clip = id; }, function () { loiDem++; }); });
      }
      c.thoai.forEach(function (x, j) {
        if (x.amUrl && !(x.am && G.xpVat[x.am]))
          viec.push(function () { return taiGiong(x.amUrl, ten + '-thoai-' + (j + 1)).then(function (id) { x.am = id; }, function () { loiDem++; }); });
      });
    });
    ghi('Tải ' + viec.length + ' tệp về máy…');
    var dem = 0, tong = viec.length;
    viec = viec.map(function (f) { return function () { return f().then(function () { dem++; hienTienDo('Tải về: ' + dem + '/' + tong); }); }; });
    return chayLan(viec, 4).then(function () {
      luu();
      if (loiDem) ghi(loiDem + ' tệp không tải được (cảnh đó sẽ hiện khung xám).');
    });
  }
  function buocXuat() {
    if (!fhLuu) { TD().buoc = 'choXuat'; luu(); ghi('Đã đủ tư liệu. Bấm "Xuất phim" để lưu tệp MP4.'); return Promise.resolve(); }
    if (G.S && G.S.view !== 'xuong-phim' && G.go) G.go('xuong-phim');
    return ngu(400).then(function () {
      if (!document.getElementById('xp-man')) { TD().buoc = 'choXuat'; luu(); ghi('Mở lại màn Xưởng phim rồi bấm "Xuất phim".'); return; }
      ghi('Đang xuất phim theo thời gian thực — giữ tab này mở và hiện trên màn hình.');
      return new Promise(function (ok) {
        G.xpXuatVao(fhLuu, function (thanhCong) {
          TD().buoc = thanhCong ? 'xong' : 'choXuat'; luu();
          ghi(thanhCong ? 'XONG! Phim đã lưu: ' + fhLuu.name : 'Chưa ghi được tệp — bấm "Xuất phim" để thử lại.');
          ok();
        });
      });
    });
  }

  function duyetChiPhi() {
    var td = TD();
    if (td.daDuyet) return true;
    var u = G.xpTdUocTinh();
    var dong = 'Kịch bản đã được chia thành ' + u.canh + ' cảnh (khoảng ' + Math.round(u.giay) + ' giây phim), ' + u.nv + ' nhân vật.\n\n' +
      (u.che0d ? 'Chi phí: 0 ĐỒNG (Workers AI miễn phí + giọng đọc trong máy). Cần khoảng ' + u.ngay + ' ngày phần miễn phí; ' +
        'hết phần trong ngày máy tự chờ đến 07:00 sáng rồi làm tiếp.'
        : 'Chi phí ước tính trên tài khoản fal.ai: khoảng ' + usd(u.tien) + '.') +
      '\n\nBấm OK để làm tiếp, Cancel để xem lại cảnh trước.';
    if (!window.confirm(dong)) { td.buoc = 'choDuyet'; luu(); ghi('Đang chờ bạn duyệt — xem các cảnh bên dưới rồi bấm "Làm tiếp".'); return false; }
    td.daDuyet = true; td.uocTinh = u.che0d ? 0 : u.tien; luu();
    return true;
  }

  function khoaManHinh() {
    try { if (navigator.wakeLock && !khoaMan) navigator.wakeLock.request('screen').then(function (k) { khoaMan = k; }, function () {}); } catch (e) {}
  }
  function moKhoaManHinh() { try { if (khoaMan) khoaMan.release(); } catch (e) {} khoaMan = null; }
  function canhBaoRoi(e) { if (dangChay) { e.preventDefault(); e.returnValue = ''; } }

  function chay() {
    var td = TD();
    dangChay = true; dungLai = false; khoaManHinh();
    window.addEventListener('beforeunload', canhBaoRoi);
    if (G.xpVeLai) G.xpVeLai();
    var p = Promise.resolve();
    function buoc(ma, f) {
      p = p.then(function () {
        if (dungLai) throw {code: 'DUNG', error: 'Đã dừng.'};
        td.buoc = ma; luu(); return f();
      });
    }
    buoc('phanCanh', buocPhanCanh);
    p = p.then(function () { if (!duyetChiPhi()) throw {code: 'CHO_DUYET'}; });
    buoc('giong', buocGiong);
    buoc('chanDung', buocChanDung);
    buoc('khungDau', buocKhungDau);
    /* 0 đồng: không quay video/khớp môi trả phí — ảnh tĩnh + Ken Burns khi xuất */
    if (!che0d()) {
      buoc('quay', buocQuay);
      buoc('khopMoi', buocKhopMoi);
    } else buoc('khopMoi0d', buocKhopMoi0d);
    buoc('tai', buocTai);
    buoc('xuat', buocXuat);
    return p.catch(function (e) {
      if (e && e.code === 'CHO_DUYET') return;
      if (e && e.code === 'DIEU13') {
        td.ngo = (e.ngo || []).map(function (n) { return n.thay; }).join(' · ');
        ghi('Dừng: kịch bản có chỗ giống tên người thật hoặc số điện thoại (' + td.ngo + ').');
        return;
      }
      td.loi = (e && (e.error || e.message)) || String(e);
      ghi('Dừng: ' + td.loi);
    }).then(function () {
      dangChay = false; moKhoaManHinh();
      window.removeEventListener('beforeunload', canhBaoRoi);
      luu(); if (G.xpVeLai) G.xpVeLai();
    });
  }

  /* ══ NÚT BẤM ══ */
  G.xpTdBatDau = function (lamLai) {
    if (dangChay) return;
    var da = G.xpDA, td = TD();
    if (!laR01()) { U.toast('Chỉ Super Admin dùng được làm phim tự động.', 'err'); return; }
    if (String(da.kichBan || '').trim().length < 30) { U.toast('Dán kịch bản vào ô trước đã (ít nhất vài câu).', 'err'); return; }
    if (lamLai) {
      if (!confirm('Làm lại từ đầu với kịch bản hiện tại? Các cảnh, ảnh và clip AI cũ sẽ bị thay (đã trả tiền thì không lấy lại được).')) return;
      da.tuDong = {buoc: '', viec: {}, nhatKy: [], coGiong: td.coGiong !== false};
      td = TD();
    }
    td.loi = ''; td.ngo = null;
    /* Hỏi chỗ lưu NGAY lúc bấm — hộp lưu cần cú bấm của người dùng */
    /* Hỏi lại trạng thái máy chủ (chế độ 0 đồng) trước khi chạy; lỗi thì vẫn chạy 0 đồng cho an toàn */
    function chayMoi() {
      G.xpTdLamMoiTrangThai().then(function () { chay(); });
    }
    G.xpChonNoiLuu().then(function (fh) { fhLuu = fh; chayMoi(); }, function (e) {
      if (e && e.name === 'AbortError') { U.toast('Bạn chưa chọn nơi lưu phim — máy vẫn làm, xong sẽ hỏi lại.', 'ok'); fhLuu = null; chayMoi(); }
    });
  };
  G.xpTdDung = function () {
    if (dangChay || (G.xpBoDangChay && G.xpBoDangChay())) { dungLai = true; ghi(che0d() ? 'Đang dừng — phần đã làm được giữ lại, bấm "Làm tiếp" để chạy tiếp.' : 'Đang dừng — việc đang chạy ở fal.ai vẫn được giữ, bấm "Làm tiếp" để nhận.'); }
  };
  G.xpTdDungLai = function (b) { if (b !== undefined) dungLai = !!b; return dungLai; };
  /* Cho bộ phim gọi: chạy trọn một tập đang mở trong G.xpDA, ghi vào fh; trả true nếu xong */
  G.xpTdChayTap = function (fh) {
    if (dangChay) return Promise.resolve(false);
    fhLuu = fh || null; TD().loi = '';
    return chay().then(function () { return TD().buoc === 'xong'; });
  };
  G.xpTdXuat = function () {
    if (G.xpDangChay && G.xpDangChay()) return;
    G.xpChonNoiLuu().then(function (fh) {
      fhLuu = fh;
      var thieu = G.xpDA.canh.some(function (c) { return (c.videoUrl && !(c.clip && G.xpVat[c.clip])) ||
        c.thoai.some(function (x) { return x.amUrl && !(x.am && G.xpVat[x.am]); }); });
      dangChay = true; dungLai = false; khoaManHinh(); if (G.xpVeLai) G.xpVeLai();
      return (thieu ? buocTai() : Promise.resolve()).then(buocXuat).then(function () {
        dangChay = false; moKhoaManHinh(); if (G.xpVeLai) G.xpVeLai();
      });
    }, function () {});
  };
  G.xpTdRutTen = function () {
    var td = TD(), da = G.xpDA;
    var ds = String(td.ngo || '').split(' · ').map(function (s) { return s.trim(); }).filter(Boolean)
      .sort(function (a, b) { return b.length - a.length; });
    var kb = da.kichBan;
    ds.forEach(function (s) {
      var thay = /\d/.test(s) ? '(số điện thoại)' : s.split(/\s+/).pop();
      kb = kb.split(s).join(thay);
    });
    if (kb === da.kichBan) { U.toast('Không tự sửa được — hãy đổi các tên đó trong kịch bản bằng tay.', 'err'); return; }
    da.kichBan = kb; td.ngo = null; td.phanCanhXong = false; luu();
    U.toast('Đã đổi họ tên đầy đủ thành tên gọi. Bấm "Làm phim tự động" để chạy tiếp.', 'ok');
    if (G.xpVeLai) G.xpVeLai();
  };
  G.xpTdGiong = function (b) { TD().coGiong = !!b; luu(); };
  G.xpTdTuyChon = function (k, v) { G.xpDA[k] = v; if (k === 'chatLuong' && v !== 'thuong' && G.xpDA.khung === '720x1280') G.xpDA.khung = '1080x1920'; luu(); if (G.xpVeLai) G.xpVeLai(); };

  /* Hỏi lại trạng thái máy chủ trước mỗi lượt chạy; lỗi thì giữ nguyên (mặc định 0 đồng cho an toàn) */
  G.xpTdLamMoiTrangThai = function () {
    if (!G.goiMayChu) return Promise.resolve();
    return goi('phimTrangThai', {}).then(function (x) {
      if (x && x.ok) { trangThai = x; if (G.xp0d) G.xp0d.trangThai = x; }
    }, function () {});
  };
  function hoiTrangThai() {
    /* Trạng thái lỗi (mất mạng…) thì hỏi lại, tối đa 30 giây một lần */
    if ((trangThai && (trangThai.ok || trangThai.dangHoi || Date.now() - hoiLuc < 30000)) || !laR01() || !G.goiMayChu) return;
    hoiLuc = Date.now();
    trangThai = Object.assign({}, trangThai || {}, {dangHoi: true});
    goi('phimTrangThai', {}).then(function (x) {
      if (trangThai && trangThai.ok && !(x && x.ok)) { delete trangThai.dangHoi; return; }
      trangThai = x; if (G.xp0d) G.xp0d.trangThai = x; if (G.xpVeLai && !dangChay) G.xpVeLai();
    }, function (e) { trangThai = {ok: false, error: String(e && e.message || e)}; });
  }

  /* ══ BẢNG TRÊN MÀN XƯỞNG PHIM ══ */
  G.xpTuDongView = function () {
    var da = G.xpDA, td = TD(), o = '';
    o += '<div class="giay" style="border:2px solid var(--chinh,#c58b2a)"><h3>🎬 Làm phim tự động từ A đến Z</h3>';
    if (!laR01()) {
      return o + '<p class="note">Chỉ Super Admin dùng được: máy tự vẽ, dựng và đọc thoại ở chế độ 0 đồng (không tốn phí).</p></div>';
    }
    hoiTrangThai();
    var la0d = che0d(), mp = trangThai && trangThai.mienPhi;
    if (la0d) {
      o += '<p class="note" style="color:#0a6b2c"><b>💚 Chế độ 0 ĐỒNG đang bật</b> — không dùng dịch vụ trả phí nào. ' +
        (mp ? 'Phần miễn phí hôm nay còn khoảng <b>' + h(String(mp.conLai)) + '/' + h(String(mp.tran)) + '</b> đơn vị (đặt lại lúc 07:00 sáng).' : '') + '</p>';
      if (trangThai && trangThai.ok && mp && !mp.coAI) {
        o += '<p class="note" style="color:#b00"><b>Máy chủ chưa bật Workers AI.</b> Cần triển khai lại máy chủ (GitHub Actions "Triển khai máy chủ").</p>';
      }
    } else if (trangThai && trangThai.ok && !trangThai.coKhoa) {
      o += '<p class="note" style="color:#b00"><b>Máy chủ chưa có khoá fal.ai.</b> Làm theo tệp hướng dẫn "HUONG-DAN-XUONG-PHIM-TU-DONG" trên màn hình máy tính ' +
        '(tạo tài khoản fal.ai, nạp tiền, lấy khoá rồi gửi cho kỹ thuật nạp vào máy chủ).</p>';
    }
    o += la0d
      ? '<p class="note">Bạn chỉ cần <b>dán kịch bản</b> (viết tự nhiên cũng được) rồi bấm nút. Máy tự chia cảnh, tạo nhân vật, vẽ từng cảnh, ' +
        'cho máy quay chuyển động trên ảnh, đọc thoại tiếng Việt ngay trong máy, gắn phụ đề, logo, số tập và lưu thành tệp MP4. ' +
        '<b>Chi phí: 0 đồng.</b> Mỗi ngày làm được khoảng 1–2 tập (Bom tấn Cloudflare chậm hơn Tiêu chuẩn vì ảnh lớn hơn); hết phần miễn phí máy tự chờ đến 07:00 sáng rồi làm tiếp. Giữ máy tính bật và tab này mở.</p>'
      : '<p class="note">Bạn chỉ cần <b>dán kịch bản</b> (viết tự nhiên cũng được) rồi bấm nút. Máy tự chia cảnh, tạo nhân vật, vẽ, quay, đọc thoại tiếng Việt, ' +
        'gắn phụ đề, logo, số tập và lưu thành tệp MP4. Tập 3 phút mất khoảng 30–60 phút và khoảng 10–15 USD (hạng Bom tấn khoảng 25–40 USD). Giữ máy tính bật và tab này mở.</p>';
    o += '<textarea rows="8" style="width:100%;box-sizing:border-box" placeholder="Dán kịch bản vào đây…" oninput="G.xpSua(\'kichBan\',this.value)"' + (dangChay ? ' disabled' : '') + '>' + h(da.kichBan || '') + '</textarea>';
    o += '<div class="row"><label><input type="checkbox"' + (td.coGiong !== false ? ' checked' : '') + ' onchange="G.xpTdGiong(this.checked)"> Đọc thoại bằng giọng AI tiếng Việt</label>' +
      (la0d ?
      '<label><input type="checkbox"' + (da.khopMoi0d !== false ? ' checked' : '') + ' onchange="G.xpTdTuyChon(\'khopMoi0d\',this.checked)"> 🗣️ Khớp môi AI (0 đồng, máy GitHub)</label>' +
      '<label>Chất lượng <select onchange="G.xpTdTuyChon(\'chatLuong\',this.value)">' +
      '<option value="bomTan"' + (da.chatLuong !== 'thuong' ? ' selected' : '') + '>🎥 Bom tấn Cloudflare (0 đồng)</option>' +
      '<option value="thuong"' + (da.chatLuong === 'thuong' ? ' selected' : '') + '>Tiêu chuẩn (nhanh hơn, 0 đồng)</option></select></label>' :
      '<label><input type="checkbox"' + (da.khopMoi ? ' checked' : '') + ' onchange="G.xpTdTuyChon(\'khopMoi\',this.checked)"> Khớp khẩu hình với giọng</label>' +
      '<label>Chất lượng <select onchange="G.xpTdTuyChon(\'chatLuong\',this.value)">' +
      '<option value="thuong"' + (da.chatLuong === 'thuong' || !da.chatLuong ? ' selected' : '') + '>Tiêu chuẩn (Kling 2.1)</option>' +
      '<option value="dienAnh"' + (da.chatLuong === 'dienAnh' ? ' selected' : '') + '>Điện ảnh (Kling 2.5 Pro)</option>' +
      '<option value="bomTan"' + (da.chatLuong === 'bomTan' ? ' selected' : '') + '>🎥 Bom tấn (Kling 3 Pro + Nano Banana Pro)</option></select></label>') +
      '<label>Tập số <input type="number" min="1" value="' + h(String(da.tap || 1)) + '" oninput="G.xpSua(\'tap\',this.value)" style="width:70px"></label>' +
      '<label>Chữ logo <input value="' + h(String(da.logo || '')) + '" oninput="G.xpSua(\'logo\',this.value)" style="width:120px"></label></div>';
    var dangDo = td.buoc && td.buoc !== 'xong' && !dangChay;
    o += '<div class="row">';
    if (dangChay) o += '<button class="btn" onclick="G.xpTdDung()">Dừng</button>';
    else {
      o += '<button class="btn btn-chinh" onclick="G.xpTdBatDau(false)">' + (dangDo ? '▶ Làm tiếp' : '🎬 Làm phim tự động') + '</button>';
      if (td.buoc) o += '<button class="btn" onclick="G.xpTdBatDau(true)">Làm lại từ đầu</button>';
      if (td.buoc === 'choXuat' || td.buoc === 'xong') o += '<button class="btn btn-chinh" onclick="G.xpTdXuat()">💾 Xuất phim</button>';
    }
    o += '</div>';
    if (td.ngo) {
      o += '<p class="note" style="color:#b00">Kịch bản có chỗ giống <b>họ tên người thật</b> hoặc số điện thoại: ' + h(td.ngo) +
        '. Hệ thống không gửi thông tin nhận dạng ra ngoài.</p><button class="btn" onclick="G.xpTdRutTen()">Đổi thành tên gọi ngắn (ví dụ "Nguyễn Văn An" → "An")</button>';
    }
    if (td.buoc) {
      var cacBuoc = la0d ? BUOC.filter(function (b) { return b[0] !== 'quay' && b[0] !== 'khopMoi' && (b[0] !== 'khopMoi0d' || da.khopMoi0d !== false); })
        : BUOC.filter(function (b) { return b[0] !== 'khopMoi0d'; });
      var i = cacBuoc.map(function (b) { return b[0]; }).indexOf(td.buoc === 'choDuyet' ? 'giong' : td.buoc);
      o += '<ol class="note" style="padding-left:22px">' + cacBuoc.map(function (b, j) {
        var dau = td.buoc === 'xong' || j < i ? '✓ ' : (j === i ? (dangChay ? '⏳ ' : '• ') : '');
        return '<li>' + dau + h(b[1]) + '</li>';
      }).join('') + '</ol>';
      if (td.uocTinh) o += '<p class="note">Chi phí đã duyệt: khoảng ' + usd(td.uocTinh) + '.</p>';
      else if (la0d && td.daDuyet) o += '<p class="note">Chi phí: 0 đồng.</p>';
    }
    o += '<p class="note" id="xp-td-tt"><b>' + h(td.loi ? 'Lỗi: ' + td.loi : '') + '</b></p>';
    o += '<pre class="note" id="xp-td-nk" style="white-space:pre-wrap;max-height:180px;overflow:auto">' + h(td.nhatKy.slice(-8).join('\n')) + '</pre>';
    o += '</div>';
    return o;
  };
})();
