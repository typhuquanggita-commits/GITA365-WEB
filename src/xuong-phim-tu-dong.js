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
  var GIA = {anh: 0.039, video5: 0.28, video10: 0.56, kyTu: 0.0001, llm: 0.02};
  var NAM = ['Deep_Voice_Man', 'Elegant_Man', 'Patient_Man', 'Determined_Man', 'Casual_Guy', 'Young_Knight', 'Decent_Boy', 'Imposing_Manner'];
  var NU = ['Wise_Woman', 'Calm_Woman', 'Lively_Girl', 'Lovely_Girl', 'Sweet_Girl_2', 'Inspirational_girl', 'Exuberant_Girl', 'Abbess', 'Friendly_Person'];
  var BUOC = [
    ['phanCanh', 'Phân cảnh kịch bản'], ['giong', 'Đọc thoại'], ['chanDung', 'Vẽ chân dung nhân vật'],
    ['khungDau', 'Vẽ khung mở đầu từng cảnh'], ['quay', 'Quay clip từng cảnh'], ['tai', 'Tải clip về máy'], ['xuat', 'Xuất phim']
  ];
  var LOI_DUNG_HAN = ['CHUA_CO_KHOA', 'NOPERM', 'VUOT_HAN', 'AUTH', 'DIEU13', 'NHALA'];

  var dangChay = false, dungLai = false, fhLuu = null, khoaMan = null, trangThai = null;

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
  function ghi(chu) {
    var td = TD(), gio = new Date().toTimeString().slice(0, 5);
    td.nhatKy.push(gio + ' · ' + chu); if (td.nhatKy.length > 40) td.nhatKy = td.nhatKy.slice(-40);
    luu(); hienTienDo(chu);
  }
  function hienTienDo(chu) {
    var el = document.getElementById('xp-td-tt'); if (el) el.textContent = chu;
    var nk = document.getElementById('xp-td-nk');
    if (nk) nk.textContent = TD().nhatKy.slice(-8).join('\n');
  }
  function goi(fn, y) {
    return G.goiMayChu(fn, y).then(function (x) { return x || {ok: false, error: 'Máy chủ không trả lời.'}; });
  }
  function ngu(ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); }
  function usd(n) { return (Math.round(n * 100) / 100).toFixed(2).replace('.', ',') + ' USD'; }

  /* ══ ƯỚC TÍNH CHI PHÍ ══ */
  G.xpTdUocTinh = function (da) {
    da = da || G.xpDA;
    var kyTu = 0, video = 0;
    da.canh.forEach(function (c) {
      video += (+c.giay > 5 ? GIA.video10 : GIA.video5);
      c.thoai.forEach(function (x) { kyTu += String(x.loi || '').length; });
    });
    var giong = TD().coGiong ? kyTu * GIA.kyTu : 0;
    return {nv: da.nhanVat.length, canh: da.canh.length, giay: G.xpTongGiay ? G.xpTongGiay() : 0,
      tien: GIA.llm + (da.nhanVat.length + da.canh.length) * GIA.anh + video + giong};
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
    function loi(ds) {
      return (Array.isArray(ds) ? ds : []).slice(0, 6).map(function (x) {
        return {ai: chuoi(x && x.ai, 40), loi: chuoi(x && x.loi, 600)};
      }).filter(function (x) { return x.loi; });
    }
    da.canh = o.canh.slice(0, 60).map(function (c) {
      return {id: ma('c'), boiCanh: bcId(c.boiCanh), chiDao: chuoi(c.chiDao, 120), hanhDong: chuoi(c.hanhDong, 800),
        nhanVat: (Array.isArray(c.nhanVat) ? c.nhanVat : []).slice(0, 6).map(function (x) { return chuoi(x, 40); }),
        hinh: chuoi(c.hinh, 1200), chuyenDong: chuoi(c.chuyenDong, 800),
        thoai: loi(c.thoai), tinNhan: loi(c.tinNhan), giay: +c.giay >= 8 ? 10 : 5, clip: ''};
    });
    return da;
  };

  /* ══ CHẠY MỘT LÔ VIỆC — gửi tối đa `gioiHan` việc, hỏi 12 việc/lượt ══ */
  function chayLo(ds, gioiHan, nhan) {
    return new Promise(function (ok, hong) {
      var td = TD(), cho = [], dang = [], xong = 0, hongDem = 0, tong = ds.length, ketThuc = false;
      if (!tong) { ok({xong: 0, hong: 0}); return; }
      ds.forEach(function (v) {
        var s = td.viec[v.khoa];
        if (s && s.kq) {
          try { v.xong(s.kq); xong++; return; } catch (e) { delete s.kq; }
        }
        if (s && s.xem) { dang.push(v); return; }
        if (s) { s.lan = 0; delete s.loi; }
        cho.push(v);
      });
      function bao() { hienTienDo(nhan + ': xong ' + xong + '/' + tong + (hongDem ? ' · lỗi ' + hongDem : '') + ' · đang chạy ' + dang.length); }
      function het(loi) {
        if (ketThuc) return; ketThuc = true; luu();
        if (loi) hong(loi); else ok({xong: xong, hong: hongDem});
      }
      function bo(v) { dang = dang.filter(function (x) { return x !== v; }); }
      function thatBai(v, chu) {
        var s = td.viec[v.khoa] || {}; s.lan = (s.lan || 0) + 1; delete s.xem; delete s.lay;
        td.viec[v.khoa] = s; bo(v);
        if (s.lan < 2) { cho.push(v); ghi(nhan + ' · thử lại: ' + chu); return; }
        s.loi = chu; hongDem++; xong++; ghi(nhan + ' · bỏ qua một việc: ' + chu);
        if (v.hong) try { v.hong(chu); } catch (e) {}
      }
      function gui() {
        while (!dungLai && dang.length < gioiHan && cho.length) {
          var v = cho.shift(); dang.push(v); v.dangGui = true;
          (function (v) {
            goi('phimGuiViec', Object.assign({loai: v.loai}, v.dauVao)).then(function (x) {
              v.dangGui = false;
              if (x.ok) { var s = td.viec[v.khoa] || {}; s.loai = v.loai; s.xem = x.xem; s.lay = x.lay; td.viec[v.khoa] = s; luu(); return; }
              if (LOI_DUNG_HAN.indexOf(x.code) >= 0 || /HTTP 40[123]/.test(x.error || '')) { het(x); return; }
              thatBai(v, x.error || 'không gửi được');
            });
          })(v);
        }
      }
      function vong() {
        if (ketThuc) return;
        if (dungLai) { het({code: 'DUNG', error: 'Đã dừng theo yêu cầu.'}); return; }
        if (xong >= tong) { het(); return; }
        gui(); bao();
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
            luu(); bao();
            setTimeout(vong, xong >= tong ? 0 : 5000);
          });
      }
      vong();
    });
  }

  /* ══ TẢI KẾT QUẢ VỀ BỘ NHỚ TAB ══ */
  var ctxGiai = null;
  function taiBlob(url) {
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

  /* ══ CÁC BƯỚC ══ */
  function nvTheoTen(ten) {
    var t = String(ten || '').toLowerCase();
    return G.xpDA.nhanVat.filter(function (n) { return n.ten.toLowerCase() === t; })[0];
  }
  function buocPhanCanh() {
    var td = TD(), da = G.xpDA;
    if (td.phanCanhXong) return Promise.resolve();
    td.viec = {}; td.ngo = null;
    ghi('Bắt đầu phân cảnh kịch bản (' + da.kichBan.length + ' ký tự)…');
    return chayLo([{khoa: 'llm', loai: 'llm', dauVao: {kichBan: da.kichBan}, xong: function (kq) {
      G.xpTdApDung(docJSON(kq.chu), da);
    }}], 1, 'Phân cảnh').then(function (r) {
      if (r.hong) { delete td.viec.llm; throw {error: 'AI phân cảnh không thành công. Bấm "Làm phim tự động" để thử lại.'}; }
      td.phanCanhXong = true; td.daDuyet = false; luu();
      ghi('Đã chia ' + da.canh.length + ' cảnh · ' + da.nhanVat.length + ' nhân vật · ' + da.boiCanh.length + ' bối cảnh.');
      if (G.xpVeLai) G.xpVeLai();
    });
  }
  function buocGiong() {
    var td = TD(), ds = [];
    if (!td.coGiong) return Promise.resolve();
    G.xpDA.canh.forEach(function (c) {
      c.thoai.forEach(function (x, i) {
        var n = nvTheoTen(x.ai);
        ds.push({khoa: 'g-' + c.id + '-' + i, loai: 'giong',
          dauVao: {loi: x.loi, giong: (n && n.giong) || 'Wise_Woman'},
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
    var ds = da.nhanVat.map(function (n) {
      return {khoa: 'cd-' + n.id, loai: 'anh', dauVao: {khung: '9:16', prompt:
        'Vertical 9:16 character reference portrait, ' + da.phongCach + '. ' + (n.prompt || n.moTa) +
        ', upper body, natural neutral expression, looking at camera, plain light grey studio background, sharp focus on the face, no text, no watermark.'},
        xong: function (kq) { n.anhUrl = kq.url; }};
    });
    ghi('Vẽ chân dung ' + ds.length + ' nhân vật.');
    return chayLo(ds, 6, 'Chân dung');
  }
  function buocKhungDau() {
    var da = G.xpDA;
    var ds = da.canh.map(function (c) {
      var p = G.xpPrompt(c), co = p.nv.filter(function (n) { return n.anhUrl; }).slice(0, 3);
      var dv = {khung: '9:16', prompt: p.anh};
      var loai = 'anh';
      if (co.length) {
        loai = 'anhSua';
        dv.anhThamChieu = co.map(function (n) { return n.anhUrl; });
        dv.prompt = p.anh + ' Reference photos: ' + co.map(function (n, i) { return 'image ' + (i + 1) + ' is ' + n.ten; }).join('; ') +
          '. Keep each character\'s face, hairstyle and outfit exactly as in the reference photos, placed naturally in the new scene. ' +
          'A single photorealistic film still, not a collage, no text.';
      }
      return {khoa: 'kd-' + c.id, loai: loai, dauVao: dv, xong: function (kq) { c.anhUrl = kq.url; }};
    });
    ghi('Vẽ khung mở đầu ' + ds.length + ' cảnh.');
    return chayLo(ds, 6, 'Khung mở đầu');
  }
  function buocQuay() {
    var ds = G.xpDA.canh.filter(function (c) { return c.anhUrl; }).map(function (c) {
      var p = G.xpPrompt(c);
      return {khoa: 'q-' + c.id, loai: 'video', dauVao: {prompt: p.video, anh: c.anhUrl, giay: +c.giay > 5 ? '10' : '5', am: p.am},
        xong: function (kq) { c.videoUrl = kq.url; }};
    });
    ghi('Quay ' + ds.length + ' clip (mỗi clip 1–5 phút, chạy song song).');
    return chayLo(ds, 5, 'Quay clip');
  }
  function buocTai() {
    var viec = [], loiDem = 0;
    G.xpDA.canh.forEach(function (c, i) {
      var ten = 'canh-' + (i < 9 ? '0' : '') + (i + 1);
      if (!(c.clip && G.xpVat[c.clip])) {
        if (c.videoUrl) viec.push(function () { return taiPhim(c.videoUrl, ten + '.mp4').then(function (id) { c.clip = id; }, function () { loiDem++; }); });
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
      'Chi phí ước tính trên tài khoản fal.ai: khoảng ' + usd(u.tien) + '.\n\nBấm OK để làm tiếp, Cancel để xem lại cảnh trước.';
    if (!window.confirm(dong)) { td.buoc = 'choDuyet'; luu(); ghi('Đang chờ bạn duyệt chi phí — xem các cảnh bên dưới rồi bấm "Làm tiếp".'); return false; }
    td.daDuyet = true; td.uocTinh = u.tien; luu();
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
    buoc('quay', buocQuay);
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
    G.xpChonNoiLuu().then(function (fh) { fhLuu = fh; chay(); }, function (e) {
      if (e && e.name === 'AbortError') { U.toast('Bạn chưa chọn nơi lưu phim — máy vẫn làm, xong sẽ hỏi lại.', 'ok'); fhLuu = null; chay(); }
    });
  };
  G.xpTdDung = function () { if (dangChay) { dungLai = true; ghi('Đang dừng — việc đang chạy ở fal.ai vẫn được giữ, bấm "Làm tiếp" để nhận.'); } };
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

  function hoiTrangThai() {
    if (trangThai || !laR01() || !G.goiMayChu) return;
    trangThai = {dangHoi: true};
    goi('phimTrangThai', {}).then(function (x) { trangThai = x; if (G.xpVeLai && !dangChay) G.xpVeLai(); });
  }

  /* ══ BẢNG TRÊN MÀN XƯỞNG PHIM ══ */
  G.xpTuDongView = function () {
    var da = G.xpDA, td = TD(), o = '';
    o += '<div class="giay" style="border:2px solid var(--chinh,#c58b2a)"><h3>🎬 Làm phim tự động từ A đến Z</h3>';
    if (!laR01()) {
      return o + '<p class="note">Chỉ Super Admin dùng được: máy tự vẽ, quay và đọc thoại bằng tài khoản fal.ai của chủ hệ (có tốn phí).</p></div>';
    }
    hoiTrangThai();
    if (trangThai && trangThai.ok && !trangThai.coKhoa) {
      o += '<p class="note" style="color:#b00"><b>Máy chủ chưa có khoá fal.ai.</b> Làm theo tệp hướng dẫn "HUONG-DAN-XUONG-PHIM-TU-DONG" trên màn hình máy tính ' +
        '(tạo tài khoản fal.ai, nạp tiền, lấy khoá rồi gửi cho kỹ thuật nạp vào máy chủ).</p>';
    }
    o += '<p class="note">Bạn chỉ cần <b>dán kịch bản</b> (viết tự nhiên cũng được) rồi bấm nút. Máy tự chia cảnh, tạo nhân vật, vẽ, quay, đọc thoại tiếng Việt, ' +
      'gắn phụ đề, logo, số tập và lưu thành tệp MP4. Tập 3 phút mất khoảng 30–60 phút và khoảng 10–15 USD. Giữ máy tính bật và tab này mở.</p>';
    o += '<textarea rows="8" style="width:100%;box-sizing:border-box" placeholder="Dán kịch bản vào đây…" oninput="G.xpSua(\'kichBan\',this.value)"' + (dangChay ? ' disabled' : '') + '>' + h(da.kichBan || '') + '</textarea>';
    o += '<div class="row"><label><input type="checkbox"' + (td.coGiong !== false ? ' checked' : '') + ' onchange="G.xpTdGiong(this.checked)"> Đọc thoại bằng giọng AI tiếng Việt</label>' +
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
      var i = BUOC.map(function (b) { return b[0]; }).indexOf(td.buoc === 'choDuyet' ? 'giong' : td.buoc);
      o += '<ol class="note" style="padding-left:22px">' + BUOC.map(function (b, j) {
        var dau = td.buoc === 'xong' || j < i ? '✓ ' : (j === i ? (dangChay ? '⏳ ' : '• ') : '');
        return '<li>' + dau + h(b[1]) + '</li>';
      }).join('') + '</ol>';
      if (td.uocTinh) o += '<p class="note">Chi phí đã duyệt: khoảng ' + usd(td.uocTinh) + '.</p>';
    }
    o += '<p class="note" id="xp-td-tt"><b>' + h(td.loi ? 'Lỗi: ' + td.loi : '') + '</b></p>';
    o += '<pre class="note" id="xp-td-nk" style="white-space:pre-wrap;max-height:180px;overflow:auto">' + h(td.nhatKy.slice(-8).join('\n')) + '</pre>';
    o += '</div>';
    return o;
  };
})();
