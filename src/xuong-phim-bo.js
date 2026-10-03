/* ═══════════════════════════════════════════════════════════════
   GITA 365 · XƯỞNG PHIM — BỘ PHIM 10 TẬP × 5 PHÚT (9.99.252)

   Dựng cả một BỘ PHIM từ vấn đề khảo sát của một khách hàng:
     1 · Chọn tầng và tình huống khảo sát (TH_KHACH, tối đa 6) + ghi chú
     2 · AI viết "kinh bộ phim": tên, nhân vật (ngoại hình cố định từng
         chi tiết, giọng, tính cách), 6–12 bối cảnh, 10 tập theo khung
         kể chuyện 10 phần của GITA365 (mỗi phần một tập)
     3 · Dựng nhân vật & bối cảnh MỘT LẦN cho cả bộ: chân dung, tờ nhân
         vật nhiều góc (mặt cận, chính diện, ¾, nghiêng, toàn thân) và
         ảnh bối cảnh không người. Mọi khung hình của mọi tập đều vẽ từ
         các ảnh tham chiếu này → nhân vật, bối cảnh giữ nguyên cả bộ.
     4 · Từng tập: AI viết ~60 cảnh 5 giây, rồi chạy dây chuyền A-Z của
         src/xuong-phim-tu-dong.js (giọng có cảm xúc, khung đầu, quay
         Kling 2.5 Pro, khớp khẩu hình, xuất MP4 vào thư mục đã chọn).

   Tập đang mở là G.xpDA (dự án của xưởng). Các tập khác nằm trong
   G.xpBo.tap[i].da. Tất cả lưu ở localStorage để tải lại trang rồi
   "Làm tiếp" không gọi lại việc đã trả tiền.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function () {
  var U = G.U, h = U.h;
  var KHOA = 'gita.xuongPhim.bo.v1';
  var NAM = ['Deep_Voice_Man', 'Elegant_Man', 'Patient_Man', 'Determined_Man', 'Casual_Guy', 'Young_Knight', 'Decent_Boy', 'Imposing_Manner'];
  var NU = ['Wise_Woman', 'Calm_Woman', 'Lively_Girl', 'Lovely_Girl', 'Sweet_Girl_2', 'Inspirational_girl', 'Exuberant_Girl', 'Abbess', 'Friendly_Person'];
  var dangChay = false, tinhHuong = null, baoDay = false;

  function laR01() {
    var S = G.S || {};
    return [S.role, (S.acc || {}).role, (S.hoSo || {}).role].indexOf('R01') >= 0;
  }
  function boMoi() {
    return {ma: 'bo-' + Date.now().toString(36), khach: {tang: 'T1', keys: [], ghiChu: '', cap: ''}, kinh: null, duyet: null,
      nhanVat: [], boiCanh: [], viec: {}, nhatKy: [], tap: [], logo: 'GITA 365', chatLuong: 'bomTan', khopMoi: true};
  }
  function nap() {
    var b = null;
    try { b = JSON.parse(localStorage.getItem(KHOA) || 'null'); } catch (e) { b = null; }
    if (!b || !b.ma) b = boMoi();
    (b.tap || []).forEach(function (t, i) {
      if (t.da && t.da.dangMo) t.da = (G.xpDA && G.xpDA.boMa === b.ma && +G.xpDA.boTap === i + 1) ? G.xpDA : null;
    });
    return b;
  }
  function luuBo() {
    var b = G.xpBo;
    try {
      localStorage.setItem(KHOA, JSON.stringify(b, function (k, v) {
        if (k === 'da' && v && v === G.xpDA) return {dangMo: true};
        if (k === 'luu' || k === 'tienTo') return undefined;
        return v;
      }));
    } catch (e) {
      if (!baoDay) { baoDay = true; U.toast('Bộ nhớ trình duyệt đã đầy — tiến độ bộ phim có thể không lưu được. Xoá bớt dự án cũ.', 'err'); }
    }
  }
  function kho() { var b = G.xpBo; b.luu = luuBo; b.tienTo = 'xb'; if (!b.viec) b.viec = {}; if (!b.nhatKy) b.nhatKy = []; return b; }
  function ghi(chu) {
    var b = kho(), gio = new Date().toTimeString().slice(0, 5);
    b.nhatKy.push(gio + ' · ' + chu); if (b.nhatKy.length > 40) b.nhatKy = b.nhatKy.slice(-40);
    luuBo();
    var el = document.getElementById('xb-tt'); if (el) el.textContent = chu;
    var nk = document.getElementById('xb-nk'); if (nk) nk.textContent = b.nhatKy.slice(-8).join('\n');
  }
  function veLai() { if (G.xpVeLai) G.xpVeLai(); }
  function chuoi(v, n) { return String(v == null ? '' : v).trim().slice(0, n || 2000); }
  function usd(n) { return (Math.round(n * 100) / 100).toFixed(2).replace('.', ',') + ' USD'; }
  /* 9.99.253 — chế độ 0 đồng (mặc định) */
  function la0d() { return !!(G.xpTdChe0d && G.xpTdChe0d()); }
  function nguon(u) { return G.xp0d ? G.xp0d.src(u, veLai) : u; }
  function ten2(n) { return (n < 10 ? '0' : '') + n; }
  function giongHop(n, daDung) {
    var bo = n.gioi === 'nu' ? NU : NAM, g = n.giong;
    if (bo.indexOf(g) < 0 || daDung[g]) g = bo.filter(function (x) { return !daDung[x]; })[0] || bo[0];
    daDung[g] = 1; return g;
  }

  /* ══ HÀNH TRÌNH 50 CẤP của khách (9.99.254) ══
     Cấp hiện tại + giáo trình bốn cột của cấp (nếu gói nghề đã nạp) + cấp kế
     tiếp → đoạn chữ gửi cho đội Agent viết kịch bản dẫn khách lên một cấp. */
  function bo(v) { return String(v == null ? '' : (Array.isArray(v) ? v.join('; ') : typeof v === 'object' ? Object.keys(v).map(function (k) { return v[k]; }).join('; ') : v)).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }
  G.xpBoCap = function (ma) {
    var ds = G.KTL_CAP50 || [];
    for (var i = 0; i < ds.length; i++) if (ds[i].ma === ma) return {cap: ds[i], sau: ds[i + 1] || null};
    return null;
  };
  G.xpBoHanhTrinh = function (ma) {
    var c = G.xpBoCap(ma); if (!c) return '';
    var tang = (G.KTL_TANG || []).filter(function (t) { return t.ma === c.cap.tang || t.id === c.cap.tang; })[0] || {};
    var tl = (G.KTL_TL50 || {})[ma] || null;
    var r = ['CURRENT LEVEL ' + c.cap.ma + ' — "' + c.cap.ten + '" (tier ' + c.cap.tang + (tang.ten ? ' ' + bo(tang.ten) : '') + (tang.biet ? ' "' + bo(tang.biet) + '"' : '') + (tang.hoa ? ', tier arc: ' + bo(tang.hoa) : '') + '; timing: ' + bo(c.cap.khi) + ')'];
    if (tl) {
      if (tl.chuoi) r.push('Action chain of this level: ' + bo(tl.chuoi).slice(0, 600));
      if (tl.wow) r.push('WOW touchpoint to show on screen: ' + bo(tl.wow).slice(0, 500));
      if (tl.coche) r.push('Mechanism (why it works): ' + bo(tl.coche).slice(0, 400));
      if (tl.tinHieu) r.push('Signals of moving up: ' + bo(tl.tinHieu).slice(0, 400));
    }
    r.push(c.sau ? 'NEXT LEVEL to reach by episode 10: ' + c.sau.ma + ' — "' + c.sau.ten + '" (' + bo(c.sau.khi) + ')'
      : 'This is the top level: episode 10 shows the family passing the legacy on to another family.');
    return r.join('\n').slice(0, 2900);
  };

  /* ══ ÁP KINH BỘ PHIM do AI viết ══ */
  G.xpBoApKinh = function (o, b) {
    b = b || G.xpBo;
    if (!o || !Array.isArray(o.tap) || o.tap.length < 10 || !Array.isArray(o.nhanVat) || !o.nhanVat.length)
      throw new Error('AI chưa viết đủ 10 tập và nhân vật.');
    var daDung = {};
    b.kinh = {ten: chuoi(o.ten, 120), logline: chuoi(o.logline, 600), phongCach: chuoi(o.phongCach, 600)};
    b.nhanVat = o.nhanVat.slice(0, 8).map(function (n, i) {
      var r = {id: 'bnv-' + i, ten: chuoi(n.ten, 40), moTa: chuoi(n.moTa, 300), prompt: chuoi(n.prompt, 900),
        gioi: /^n(u|ữ)$/i.test(chuoi(n.gioi)) ? 'nu' : 'nam', giong: chuoi(n.giong, 40),
        tinhCach: chuoi(n.tinhCach, 500), cungCamXuc: chuoi(n.cungCamXuc, 600)};
      r.giong = giongHop(r, daDung); return r;
    }).filter(function (n) { return n.ten && n.prompt; });
    b.boiCanh = (o.boiCanh || []).slice(0, 14).map(function (x, i) {
      return {id: 'bbc-' + i, ten: chuoi(x.ten, 80), prompt: chuoi(x.prompt, 700)};
    }).filter(function (x) { return x.ten; });
    b.tap = o.tap.slice(0, 10).map(function (t, i) {
      return {so: i + 1, ten: chuoi(t.ten, 120), khung: chuoi(t.khung, 200), vanDe: chuoi(t.vanDe, 80),
        tomTat: chuoi(t.tomTat, 2500), boiCanh: (Array.isArray(t.boiCanh) ? t.boiCanh : []).slice(0, 8).map(function (x) { return chuoi(x, 80); }),
        da: null, xong: false, tep: ''};
    });
    return b;
  };

  /* Kinh gửi cho AI viết một tập — gọn, tập đang viết và hai tập kề giữ đủ */
  G.xpBoKinh = function (soTap) {
    var b = G.xpBo, so = +soTap || +(G.xpDA && G.xpDA.boTap) || 1;
    if (!b || !b.kinh || (G.xpDA && G.xpDA.boMa && G.xpDA.boMa !== b.ma)) return '';
    function dung(dai) {
      return JSON.stringify({ten: b.kinh.ten, logline: b.kinh.logline, phongCach: b.kinh.phongCach,
        nhanVat: b.nhanVat.map(function (n) { return {ten: n.ten, moTa: n.moTa, prompt: n.prompt, gioi: n.gioi, giong: n.giong, tinhCach: n.tinhCach, cungCamXuc: n.cungCamXuc}; }),
        boiCanh: b.boiCanh.map(function (x) { return {ten: x.ten, prompt: x.prompt}; }),
        tap: b.tap.map(function (t) {
          var gan = Math.abs(t.so - so) <= 1;
          return {so: t.so, ten: t.ten, khung: t.khung, tomTat: gan ? t.tomTat : t.tomTat.slice(0, dai), boiCanh: t.boiCanh};
        })});
    }
    var s = dung(600); if (s.length > 23500) s = dung(200); if (s.length > 23500) s = dung(0);
    return s.slice(0, 24000);
  };

  /* Chép nhân vật/bối cảnh của bộ vào tập (theo tên) — giữ ảnh tham chiếu và giọng */
  function khop(a, b) { return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase(); }
  G.xpBoGhep = function (da) {
    var b = G.xpBo;
    if (!b || !da || da.boMa !== b.ma) return;
    if (b.kinh && b.kinh.phongCach) da.phongCach = b.kinh.phongCach;
    if (b.kinh && b.kinh.ten) da.ten = b.kinh.ten;
    var daDung = {};
    da.nhanVat.forEach(function (n) {
      var g = b.nhanVat.filter(function (x) { return khop(x.ten, n.ten); })[0];
      if (g) { n.prompt = g.prompt; n.giong = g.giong; n.gioi = g.gioi; n.moTa = g.moTa; n.anhUrl = g.anhUrl || ''; n.sheetUrl = g.sheetUrl || ''; daDung[g.giong] = 1; }
    });
    da.nhanVat.forEach(function (n) {
      if (!b.nhanVat.some(function (x) { return khop(x.ten, n.ten); })) n.giong = giongHop(n, daDung);
    });
    da.boiCanh.forEach(function (x) {
      var g = b.boiCanh.filter(function (y) { return khop(y.ten, x.ten); })[0];
      if (g) { x.prompt = g.prompt; x.plateUrl = g.plateUrl || ''; }
    });
  };
  G.xpBoLuu = function () { luuBo(); };
  G.xpBoDangChay = function () { return dangChay; };

  /* ══ MỞ MỘT TẬP vào xưởng ══ */
  function taoTap(t) {
    var b = G.xpBo;
    var dan = 'Tập ' + t.so + ': ' + t.ten + '\nKhung: ' + t.khung + '\n\n' + t.tomTat;
    return {ten: b.kinh.ten, tap: t.so, logo: b.logo || 'GITA 365',
      khung: b.chatLuong === 'thuong' ? '720x1280' : '1080x1920', phongCach: b.kinh.phongCach,
      nhanVat: b.nhanVat.map(function (n) { return {id: n.id, ten: n.ten, moTa: n.moTa, prompt: n.prompt, gioi: n.gioi, giong: n.giong, anhUrl: n.anhUrl || '', sheetUrl: n.sheetUrl || ''}; }),
      boiCanh: b.boiCanh.map(function (x) { return {id: x.id, ten: x.ten, prompt: x.prompt, plateUrl: x.plateUrl || ''}; }),
      kichBan: dan, canh: [], boMa: b.ma, boTap: t.so, chatLuong: b.chatLuong, khopMoi: !!b.khopMoi, khopMoi0d: b.khopMoi !== false, chuyenDong0d: b.chuyenDong !== false, anHuongDan: true,
      tuDong: {buoc: '', viec: {}, nhatKy: [], coGiong: true, duyetSan: true, daDuyet: true}};
  }
  function moTap(so) {
    var b = G.xpBo, t = b.tap[so - 1];
    if (!t) return null;
    if (G.xpDA && G.xpDA.boMa === b.ma && G.xpDA.boTap && b.tap[G.xpDA.boTap - 1]) b.tap[G.xpDA.boTap - 1].da = G.xpDA;
    if (!t.da) t.da = taoTap(t);
    t.da.chatLuong = b.chatLuong; t.da.khopMoi = !!b.khopMoi; t.da.khopMoi0d = b.khopMoi !== false; t.da.chuyenDong0d = b.chuyenDong !== false; t.da.logo = b.logo || t.da.logo;
    G.xpDA = t.da;
    if (G.xpLuu) G.xpLuu();
    return t.da;
  }
  G.xpBoMoTap = function (so) {
    if (dangChay || (G.xpTdDangChay && G.xpTdDangChay())) { U.toast('Đang làm phim — dừng trước khi mở tập khác.', 'err'); return; }
    moTap(so); veLai();
    U.toast('Đã mở tập ' + so + ' trong xưởng (xem các cảnh bên dưới).', 'ok');
  };
  function giaiPhong(da) {
    (da.canh || []).forEach(function (c) {
      if (c.clip) { delete G.xpVat[c.clip]; c.clip = ''; }
      (c.thoai || []).forEach(function (x) { if (x.am) { delete G.xpVat[x.am]; x.am = ''; } });
    });
  }

  /* Chất liệu gốc từ sổ tay & kho GITA (9.99.255) — tính một lần khi viết
     kinh rồi giữ trong bộ, để 10 tập cùng đứng trên một nền chữ thật. */
  function vanDeKhach(b) {
    var ds = (tinhHuong && tinhHuong.ds) || [];
    return ds.filter(function (x) { return b.khach.keys.indexOf(x.key) >= 0; })
      .map(function (x) { return x.nhom + ' ' + x.th; }).concat([b.khach.ghiChu || '']).join(' . ');
  }
  function lamChatLieu(b, cap) {
    if (b.dungChatLieu === false || !G.xpClDoan) return '';
    try { return G.xpClDoan({tang: b.khach.tang, cap: cap, vanDe: vanDeKhach(b)}); } catch (e) { return ''; }
  }
  G.xpBoChatLieu = function () {
    var b = G.xpBo;
    if (!b || b.dungChatLieu === false || (G.xpDA && G.xpDA.boMa && G.xpDA.boMa !== b.ma)) return '';
    return b.chatLieu || '';
  };

  /* ══ CÁC BƯỚC CỦA BỘ ══ */
  function chayLo(ds, nhan) { return G.xpTdChayLo(ds, 6, nhan, kho()); }
  function buocKinh() {
    var b = G.xpBo;
    if (b.kinh && b.tap.length === 10) return buocDuyet();
    var cap = b.khach.cap && G.xpBoCap(b.khach.cap) ? b.khach.cap : '';
    if (!b.khach.keys.length && !cap) return Promise.reject({error: 'Chọn cấp hành trình hoặc ít nhất một tình huống khảo sát của khách.'});
    ghi('Agent Biên kịch đang viết kinh bộ phim (nhân vật, bối cảnh, 10 tập)' + (cap ? ' theo cấp ' + cap : '') + '…');
    var dv = {che: 'boPhim', keys: b.khach.keys.slice(0, 6), ghiChu: b.khach.ghiChu || ''};
    if (cap) { dv.capMa = cap; dv.hanhTrinh = G.xpBoHanhTrinh(cap); }
    b.chatLieu = lamChatLieu(b, cap);
    if (b.chatLieu) { dv.chatLieu = b.chatLieu; ghi('Đã lấy chất liệu từ Sổ tay gia đình & kho GITA cho câu chuyện.'); }
    if (G.xpTdLaBomTanCF ? G.xpTdLaBomTanCF(b.chatLuong) : (G.xpTdLaBomTan && G.xpTdLaBomTan(b.chatLuong))) dv.bomTan = true;
    return chayLo([{khoa: 'kinh', loai: 'llm', dauVao: dv,
      xong: function (kq) { G.xpBoApKinh(G.xpTdDocJSON(kq.chu), b); }}], 'Kinh bộ phim').then(function (r) {
      if (r.hong || !b.kinh) { delete b.viec.kinh; throw {error: 'AI chưa viết được kinh bộ phim. Bấm lại để thử.'}; }
      b.duyet = null; b.kinhCap = cap;
      luuBo(); ghi('Đã có kinh: "' + b.kinh.ten + '" · ' + b.nhanVat.length + ' nhân vật · ' + b.boiCanh.length + ' bối cảnh · 10 tập.');
      return buocDuyet();
    });
  }
  /* Tổ duyệt của đội Agent: phản biện kinh MỘT lượt trước khi vẽ (Điều 13,
     giọng GITA, đúng hành trình, kịch tính). Lỗi thì giữ bản gốc, không chặn. */
  function buocDuyet() {
    var b = G.xpBo;
    if (b.duyet || !b.kinh || b.nhanVat.some(function (n) { return n.anhUrl; })) return Promise.resolve();
    var cap = b.kinhCap || '';
    var kinhGoc = JSON.stringify({ten: b.kinh.ten, logline: b.kinh.logline, phongCach: b.kinh.phongCach,
      nhanVat: b.nhanVat.map(function (n) { return {ten: n.ten, moTa: n.moTa, prompt: n.prompt, gioi: n.gioi, giong: n.giong, tinhCach: n.tinhCach, cungCamXuc: n.cungCamXuc}; }),
      boiCanh: b.boiCanh.map(function (x) { return {ten: x.ten, prompt: x.prompt}; }),
      tap: b.tap.map(function (t) { return {so: t.so, ten: t.ten, khung: t.khung, vanDe: t.vanDe, tomTat: t.tomTat, boiCanh: t.boiCanh}; })}).slice(0, 24000);
    var dv = {che: 'duyetKinh', kinh: kinhGoc};
    if (cap) { dv.capMa = cap; dv.hanhTrinh = G.xpBoHanhTrinh(cap); }
    if (b.chatLieu && b.dungChatLieu !== false) dv.chatLieu = b.chatLieu;
    ghi('Agent Tổ duyệt đang phản biện câu chuyện (Điều 13 · giọng GITA · hành trình · kịch tính)…');
    var kq = null;
    return chayLo([{khoa: 'duyet', loai: 'llm', dauVao: dv, xong: function (k) { kq = G.xpTdDocJSON(k.chu); }}], 'Tổ duyệt').then(function (r) {
      var d = {diem: {}, nhanXet: [], sua: false};
      if (!r.hong && kq && kq.kinh) {
        try {
          var thu = G.xpBoApKinh(kq.kinh, {});
          if (thu.tap.length === 10 && thu.nhanVat.length) {
            G.xpBoApKinh(kq.kinh, b); d.sua = true;
          }
        } catch (e) { d.loi = 'Bản sửa chưa đủ 10 tập — giữ bản gốc.'; }
        ['anToan', 'giongGita', 'hanhTrinh', 'kichTinh'].forEach(function (k) {
          var v = Math.round(+((kq.diem || {})[k])); if (v >= 0 && v <= 10) d.diem[k] = v;
        });
        d.nhanXet = (Array.isArray(kq.nhanXet) ? kq.nhanXet : []).slice(0, 6).map(function (x) { return chuoi(x, 300); }).filter(Boolean);
      } else d.loi = 'Tổ duyệt chưa trả lời — giữ bản gốc.';
      b.duyet = d; delete b.viec.duyet; luuBo();
      ghi(d.sua ? 'Tổ duyệt đã sửa câu chuyện' + (d.nhanXet.length ? ': ' + d.nhanXet[0] : '.') : (d.loi || 'Tổ duyệt giữ nguyên câu chuyện.'));
    });
  }
  function buocTuLieu() {
    var b = G.xpBo, phong = (b.kinh && b.kinh.phongCach) || 'photorealistic cinematic';
    function loaiAnh(sua) { return G.xpTdLoaiAnh ? G.xpTdLoaiAnh(sua, b.chatLuong) : (sua ? 'anhSua' : 'anh'); }
    var cd = b.nhanVat.filter(function (n) { return !n.anhUrl; }).map(function (n) {
      return {khoa: 'cd-' + n.id, loai: loaiAnh(false), tuSua: true, dauVao: {khung: '9:16', prompt:
        'Vertical 9:16 character reference portrait, ' + phong + '. ' + n.prompt +
        '. Upper body, neutral expression, looking at camera, plain light grey studio background, sharp focus on the face, no text, no watermark.'},
        xong: function (kq) { n.anhUrl = kq.url; }};
    });
    var bc = b.boiCanh.filter(function (x) { return !x.plateUrl; }).map(function (x) {
      return {khoa: 'bc-' + x.id, loai: loaiAnh(false), tuSua: true, dauVao: {khung: '9:16', prompt:
        'Vertical 9:16 empty location reference plate, ' + phong + '. ' + x.prompt +
        '. No people, no text, no watermark, wide view showing the whole space.'},
        xong: function (kq) { x.plateUrl = kq.url; }};
    });
    ghi('Vẽ ' + cd.length + ' chân dung nhân vật và ' + bc.length + ' bối cảnh.');
    return chayLo(cd.concat(bc), 'Nhân vật & bối cảnh').then(function () {
      var sh = b.nhanVat.filter(function (n) { return n.anhUrl && !n.sheetUrl; }).map(function (n) {
        return {khoa: 'sh-' + n.id, loai: loaiAnh(true), tuSua: true, dauVao: {khung: '16:9', anhThamChieu: [n.anhUrl], prompt:
          'Character reference sheet of the SAME person as in the image: ' + n.prompt +
          '. Layout on a plain light grey background: one large face close-up, then front view, three-quarter view, side profile and full body standing. ' +
          'Identical face, hairstyle, marks and outfit in every view, photorealistic, even soft studio light, no text, no labels.'},
          xong: function (kq) { n.sheetUrl = kq.url; }};
      });
      if (!sh.length) return;
      ghi('Vẽ tờ nhân vật nhiều góc cho ' + sh.length + ' nhân vật.');
      return chayLo(sh, 'Tờ nhân vật');
    }).then(function () {
      luuBo();
      var thieu = b.nhanVat.filter(function (n) { return !n.anhUrl; }).length;
      if (thieu) throw {error: thieu + ' nhân vật chưa có ảnh. Bấm lại để thử.'};
    });
  }
  function tuLieuDu() {
    var b = G.xpBo;
    return b.kinh && b.tap.length === 10 && b.nhanVat.every(function (n) { return n.anhUrl; });
  }
  function lamTap(so, fh) {
    var b = G.xpBo, t = b.tap[so - 1];
    moTap(so);
    if (G.S && G.S.view !== 'xuong-phim' && G.go) G.go('xuong-phim'); else veLai();
    ghi('Bắt đầu tập ' + so + ': ' + t.ten);
    return G.xpTdChayTap(fh).then(function (ok) {
      if (ok) {
        t.xong = true; t.tep = fh ? fh.name : ''; giaiPhong(t.da); luuBo();
        ghi('XONG tập ' + so + (fh ? ' → ' + fh.name : '') + '.');
      } else ghi('Tập ' + so + ' chưa xong: ' + (((t.da || {}).tuDong || {}).loi || 'xem nhật ký của tập.'));
      return ok;
    });
  }
  function bocChay(f) {
    if (dangChay || (G.xpTdDangChay && G.xpTdDangChay())) return;
    dangChay = true; if (G.xpTdDungLai) G.xpTdDungLai(false); veLai();
    return Promise.resolve(G.xpTdLamMoiTrangThai && G.xpTdLamMoiTrangThai()).then(f).catch(function (e) {
      ghi('Dừng: ' + ((e && (e.error || e.message)) || String(e)));
    }).then(function () { dangChay = false; luuBo(); veLai(); });
  }
  function giaTap() {
    var g = G.xpTdGia || {};
    var cl = G.xpBo.chatLuong, da = cl === 'dienAnh', bt = G.xpTdLaBomTan && G.xpTdLaBomTan(cl);
    return (g.llm || 0.05) + 60 * (bt ? (g.anhPro || 0.15) + (g.bt5 || 0.56) : (g.anh || 0.039) + (da ? (g.da5 || 0.35) : (g.video5 || 0.28))) +
      (G.xpBo.khopMoi ? 40 * (g.khopMoi || 0.07) : 0) + 0.4;
  }

  /* ══ NÚT BẤM ══ */
  function kiemQuyen() { if (!laR01()) { U.toast('Chỉ Super Admin dùng được.', 'err'); return false; } return true; }
  G.xpBoSua = function (k, v) { var b = G.xpBo; if (k in b.khach || k === 'cap') b.khach[k] = v; else b[k] = v; luuBo(); };
  G.xpBoChonTH = function (i, co) {
    var x = tinhHuong && tinhHuong.ds && tinhHuong.ds[i]; if (!x) return;
    var key = x.key;
    var ds = G.xpBo.khach.keys.filter(function (k) { return k !== key; });
    if (co) { if (ds.length >= 6) { U.toast('Chọn tối đa 6 tình huống.', 'err'); veLai(); return; } ds.push(key); }
    G.xpBo.khach.keys = ds; luuBo();
  };
  G.xpBoSuaTap = function (i, v) { var t = G.xpBo.tap[i]; if (t) { t.tomTat = chuoi(v, 2500); if (t.da && !t.da.canh.length) t.da = null; luuBo(); } };
  G.xpBoVietKinh = function (lai) {
    if (!kiemQuyen()) return;
    var b = G.xpBo;
    if (lai) {
      if (!confirm('Viết lại kinh bộ phim? Nhân vật, bối cảnh và các tập hiện có sẽ bị thay.')) return;
      b.kinh = null; b.tap = []; b.nhanVat = []; b.boiCanh = []; b.viec = {}; b.duyet = null;
    }
    bocChay(buocKinh);
  };
  G.xpBoTuLieu = function () { if (kiemQuyen()) bocChay(function () { return buocKinh().then(buocTuLieu); }); };
  G.xpBoLamTap = function (so) {
    if (!kiemQuyen()) return;
    var b = G.xpBo, t = b.tap[so - 1]; if (!t) return;
    var cu = G.xpDA;
    moTap(so);
    G.xpChonNoiLuu().then(function (fh) {
      bocChay(function () { return (tuLieuDu() ? Promise.resolve() : buocTuLieu()).then(function () { return lamTap(so, fh); }); });
    }, function (e) {
      if (!(e && e.name === 'AbortError')) { G.xpDA = cu; return; }
      bocChay(function () { return (tuLieuDu() ? Promise.resolve() : buocTuLieu()).then(function () { return lamTap(so, null); }); });
    });
  };
  G.xpBoLamCaBo = function () {
    if (!kiemQuyen()) return;
    var b = G.xpBo;
    if (!b.kinh) { U.toast('Bấm "Viết kinh bộ phim" trước để xem câu chuyện.', 'err'); return; }
    G.xpChonThuMuc().then(function (dir) {
      var con = b.tap.filter(function (t) { return !t.xong; });
      if (!con.length) { U.toast('Cả 10 tập đã xong.', 'ok'); return; }
      if (!confirm('Làm ' + con.length + ' tập còn lại, mỗi tập khoảng 5 phút phim.\n\n' + (la0d()
        ? (function () { var tapNgay = b.chatLuong === 'thuong' ? 2 : 1;
            return 'Chi phí: 0 ĐỒNG. Phần miễn phí mỗi ngày đủ khoảng ' + tapNgay + ' tập' + (tapNgay === 1 ? ' Bom tấn Cloudflare' : '') +
              ', nên cả bộ mất khoảng ' + Math.ceil(con.length / tapNgay) + ' ngày; '; })() +
          'hết phần trong ngày máy tự chờ đến 07:00 sáng rồi làm tiếp. Giữ máy bật và tab mở.'
        : 'Chi phí ước tính trên fal.ai: khoảng ' + usd(giaTap()) + ' mỗi tập, tổng khoảng ' + usd(giaTap() * con.length) + '.\nMỗi tập mất khoảng 1–2 giờ. Giữ máy bật và tab mở.') +
        '\n\nBấm OK để bắt đầu.')) return;
      var duoi = G.xpDuoiPhim ? G.xpDuoiPhim() : '.mp4';
      bocChay(function () {
        var p = tuLieuDu() ? Promise.resolve() : buocTuLieu();
        con.forEach(function (t) {
          p = p.then(function (tiep) {
            if (tiep === false || (G.xpTdDungLai && G.xpTdDungLai())) return false;
            return dir.getFileHandle('Tap-' + ten2(t.so) + duoi, {create: true}).then(function (fh) { return lamTap(t.so, fh); });
          });
        });
        return p.then(function (ok) { if (ok !== false) ghi('XONG CẢ BỘ — các tệp Tap-01 … Tap-10 nằm trong thư mục bạn đã chọn.'); });
      });
    }, function () {});
  };
  G.xpBoDung = function () { if (G.xpTdDung) G.xpTdDung(); };
  G.xpBoMoi = function () {
    if (dangChay) return;
    if (!confirm('Bắt đầu bộ phim mới cho khách khác? Bộ hiện tại sẽ bị xoá khỏi máy này (các tệp phim đã lưu vẫn còn).')) return;
    G.xpBo = boMoi(); luuBo(); veLai();
  };
  G.xpBoKhoiTao = function () { G.xpBo = nap(); };

  function napTinhHuong() {
    if (tinhHuong || !G.goiMayChu) return;
    tinhHuong = {dangHoi: true};
    G.goiMayChu('phimTinhHuong', {}).then(function (x) { tinhHuong = x && x.ok ? x : {loi: (x && x.error) || 'Không tải được'}; veLai(); });
  }

  /* ══ BẢNG TRÊN MÀN XƯỞNG PHIM ══ */
  G.xpBoView = function () {
    if (!laR01()) return '';
    var b = G.xpBo, o = '', chay = dangChay || (G.xpTdDangChay && G.xpTdDangChay()), dis = chay ? ' disabled' : '';
    napTinhHuong();
    o += '<div class="giay" style="border:2px solid var(--chinh,#c58b2a)"><h3>🎞 Bộ phim 10 tập × 5 phút theo vấn đề của khách</h3>';
    o += '<p class="note">Chọn vấn đề khảo sát của khách → máy viết câu chuyện 10 tập theo khung kể chuyện GITA365, dựng nhân vật và bối cảnh cố định cho cả bộ, ' +
      (la0d() ? 'rồi làm từng tập: vẽ từng cảnh, máy quay chuyển động trên ảnh, giọng đọc tiếng Việt trong máy, phụ đề, logo, lưu MP4. <b>Chi phí: 0 đồng.</b></p>'
        : 'rồi làm từng tập: quay chất lượng điện ảnh, giọng có cảm xúc, khớp khẩu hình, phụ đề, logo, lưu MP4.</p>');
    /* 1 · Khách */
    o += '<h4>1 · Vấn đề của khách</h4><div class="row"><label>Tầng <select onchange="G.xpBoSua(\'tang\',this.value);G.render()"' + dis + '>' +
      ['T1', 'T2', 'T3', 'T4', 'T5'].map(function (t) { return '<option' + (t === b.khach.tang ? ' selected' : '') + '>' + t + '</option>'; }).join('') + '</select></label>' + (la0d() ?
      '<label>Chất lượng <select onchange="G.xpBoSua(\'chatLuong\',this.value)"' + dis + '>' +
      '<option value="bomTan"' + (b.chatLuong !== 'thuong' ? ' selected' : '') + '>🎥 Bom tấn Cloudflare (0 đồng)</option>' +
      '<option value="thuong"' + (b.chatLuong === 'thuong' ? ' selected' : '') + '>Tiêu chuẩn (nhanh hơn, 0 đồng)</option></select></label>' +
      '<label><input type="checkbox"' + (b.chuyenDong !== false ? ' checked' : '') + ' onchange="G.xpBoSua(\'chuyenDong\',this.checked)"' + dis + '> 🚶 Người chuyển động (0 đồng)</label>' +
      '<label><input type="checkbox"' + (b.khopMoi !== false ? ' checked' : '') + ' onchange="G.xpBoSua(\'khopMoi\',this.checked)"' + dis + '> 🗣️ Khớp môi AI (0 đồng, máy GitHub)</label>' :
      '<label>Chất lượng <select onchange="G.xpBoSua(\'chatLuong\',this.value)"' + dis + '>' +
      '<option value="bomTan"' + (b.chatLuong === 'bomTan' ? ' selected' : '') + '>🎥 Bom tấn (Kling 3 Pro + Nano Banana Pro)</option>' +
      '<option value="dienAnh"' + (b.chatLuong === 'dienAnh' ? ' selected' : '') + '>Điện ảnh (Kling 2.5 Pro)</option>' +
      '<option value="thuong"' + (b.chatLuong === 'thuong' ? ' selected' : '') + '>Tiêu chuẩn (rẻ hơn)</option></select></label>' +
      '<label><input type="checkbox"' + (b.khopMoi ? ' checked' : '') + ' onchange="G.xpBoSua(\'khopMoi\',this.checked)"' + dis + '> Khớp khẩu hình</label>') +
      '<label>Chữ logo <input value="' + h(b.logo || '') + '" oninput="G.xpBoSua(\'logo\',this.value)" style="width:120px"></label></div>';
    /* Cấp hành trình 50 cấp — cá nhân hoá câu chuyện theo vị trí của khách */
    var CAP = G.KTL_CAP50 || [];
    if (CAP.length) {
      o += '<label style="display:block;margin:6px 0"><b>Cấp hành trình hiện tại của khách</b> (phim dẫn khách lên cấp kế tiếp) <select onchange="G.xpBoSua(\'cap\',this.value);G.render()"' + dis + '>' +
        '<option value="">— Không chọn (chỉ theo tình huống) —</option>' + CAP.map(function (c) {
          return '<option value="' + h(c.ma) + '"' + (c.ma === b.khach.cap ? ' selected' : '') + '>' + h(c.ma + ' · ' + c.tang + ' · ' + c.ten) + '</option>';
        }).join('') + '</select></label>';
      var cc = b.khach.cap && G.xpBoCap(b.khach.cap);
      if (cc) o += '<p class="note">Khách đang ở <b>' + h(cc.cap.ma + ' ' + cc.cap.ten) + '</b> (' + h(cc.cap.khi || '') + ')' +
        (cc.sau ? ' → phim dẫn lên <b>' + h(cc.sau.ma + ' ' + cc.sau.ten) + '</b>.' : ' — cấp cao nhất.') +
        ((G.KTL_TL50 || {})[cc.cap.ma] ? ' Có giáo trình bốn cột của cấp (chuỗi · WOW · cơ chế · tín hiệu).' : '') + '</p>';
    }
    o += '<p class="note">🤖 <b>Đội Agent xưởng phim:</b> Biên kịch → Tổ duyệt (Điều 13 · giọng GITA · hành trình · kịch tính) → Đạo diễn phân cảnh → Hoạ sĩ → Dựng trong máy' +
      (la0d() ? ' — tất cả miễn phí.' : '.') + '</p>';
    if (!tinhHuong || tinhHuong.dangHoi) o += '<p class="note">Đang tải danh sách tình huống…</p>';
    else if (tinhHuong.loi) o += '<p class="note" style="color:#b00">' + h(tinhHuong.loi) + '</p>';
    else {
      var ds = (tinhHuong.ds || []).map(function (x, i) { return {x: x, i: i}; })
        .filter(function (o) { return o.x.tang === b.khach.tang || b.khach.keys.indexOf(o.x.key) >= 0; });
      o += '<div style="max-height:220px;overflow:auto;border:1px solid #ddd;padding:6px">' + ds.map(function (r) {
        var x = r.x;
        return '<label style="display:block"><input type="checkbox"' + (b.khach.keys.indexOf(x.key) >= 0 ? ' checked' : '') + dis +
          ' onchange="G.xpBoChonTH(' + r.i + ',this.checked)"> <b>' + h(x.tang) + ' · ' + h(x.nhom) + '</b> — ' + h(x.th) + '</label>';
      }).join('') + '</div><p class="note">Đã chọn ' + b.khach.keys.length + '/6 tình huống.</p>';
    }
    o += '<label>Ghi chú thêm từ khảo sát (không ghi họ tên, số điện thoại của khách) <textarea rows="3" oninput="G.xpBoSua(\'ghiChu\',this.value)"' + dis + '>' + h(b.khach.ghiChu || '') + '</textarea></label>';
    if (G.xpClTomTat) {
      var cl = [];
      try { cl = G.xpClTomTat({tang: b.khach.tang, cap: b.khach.cap, vanDe: vanDeKhach(b)}); } catch (e) { cl = []; }
      o += '<label style="display:block;margin:6px 0"><input type="checkbox"' + (b.dungChatLieu !== false ? ' checked' : '') + dis +
        ' onchange="G.xpBoSua(\'dungChatLieu\',this.checked);G.render()"> <b>📖 Dựng câu chuyện từ Sổ tay gia đình &amp; kho GITA</b> (lời thật của hệ — khách thấy chính nhà mình)</label>' +
        (b.dungChatLieu !== false && cl.length ? '<p class="note">Sẽ dùng: ' + h(cl.join(' · ')) + '. Mở khoá thêm gói tài liệu thì chất liệu càng đầy.</p>' : '');
    }
    o += '<div class="row">';
    if (chay) o += '<button class="btn" onclick="G.xpBoDung()">Dừng</button>';
    else {
      o += '<button class="btn btn-chinh" onclick="G.xpBoVietKinh(false)">' + (b.kinh ? '✓ Đã có câu chuyện' : '2 · Viết câu chuyện 10 tập' + (la0d() ? ' (0 đồng)' : ' (~0,05 USD)')) + '</button>';
      if (b.kinh) o += '<button class="btn" onclick="G.xpBoVietKinh(true)">Viết lại câu chuyện</button>';
      o += '<button class="btn" onclick="G.xpBoMoi()">Bộ phim mới</button>';
    }
    o += '</div>';
    /* 2 · Kinh */
    if (b.kinh) {
      o += '<h4>2 · ' + h(b.kinh.ten) + '</h4><p class="note">' + h(b.kinh.logline) + '</p>';
      if (b.duyet) {
        var DN = {anToan: 'An toàn', giongGita: 'Giọng GITA', hanhTrinh: 'Hành trình', kichTinh: 'Kịch tính'};
        o += '<div class="note" style="border-left:3px solid var(--chinh,#c58b2a);padding-left:8px"><b>Tổ duyệt:</b> ' +
          (Object.keys(b.duyet.diem || {}).map(function (k) { return h(DN[k] || k) + ' ' + b.duyet.diem[k] + '/10'; }).join(' · ') || h(b.duyet.loi || '')) +
          ((b.duyet.nhanXet || []).length ? '<ul style="margin:4px 0">' + b.duyet.nhanXet.map(function (x) { return '<li>' + h(x) + '</li>'; }).join('') + '</ul>' : '') + '</div>';
      }
      o += '<div class="row" style="flex-wrap:wrap">' + b.nhanVat.map(function (n) {
        return '<div style="width:150px;font-size:12px">' + (n.sheetUrl || n.anhUrl ? '<img src="' + h(nguon(n.sheetUrl || n.anhUrl)) + '" alt="" style="width:150px;border-radius:6px">' : '') +
          '<b>' + h(n.ten) + '</b> · ' + h(n.moTa) + '<br><i>' + h(n.giong) + '</i></div>';
      }).join('') + '</div>';
      o += '<p class="note"><b>Bối cảnh:</b> ' + b.boiCanh.map(function (x) {
        return (x.plateUrl ? '<img src="' + h(nguon(x.plateUrl)) + '" alt="" style="height:60px;vertical-align:middle;border-radius:4px"> ' : '') + h(x.ten);
      }).join(' · ') + '</p>';
      if (!chay) o += '<div class="row"><button class="btn btn-chinh" onclick="G.xpBoTuLieu()">' + (tuLieuDu() ? '✓ Đã dựng nhân vật & bối cảnh' : '3 · Dựng nhân vật & bối cảnh' + (la0d() ? ' (0 đồng)' : ' (~1–2 USD)')) + '</button>' +
        '<button class="btn btn-chinh" onclick="G.xpBoLamCaBo()">🎬 Làm cả bộ 10 tập</button></div>';
      o += '<h4>4 · Các tập</h4>';
      b.tap.forEach(function (t, i) {
        var dangMo = G.xpDA && G.xpDA.boMa === b.ma && +G.xpDA.boTap === t.so;
        var td = (t.da && t.da.tuDong) || {};
        var tt = t.xong ? '✓ Xong' + (t.tep ? ' (' + h(t.tep) + ')' : '') : (td.buoc ? 'Đang ở bước: ' + h(td.buoc) : 'Chưa làm');
        o += '<details class="giay"><summary><b>Tập ' + t.so + ' · ' + h(t.ten) + '</b> — ' + tt + (dangMo ? ' · <i>đang mở</i>' : '') + '</summary>' +
          '<p class="note">Khung: ' + h(t.khung) + (t.vanDe ? ' · Vấn đề: ' + h(t.vanDe) : '') + '</p>' +
          '<textarea rows="5" style="width:100%;box-sizing:border-box" oninput="G.xpBoSuaTap(' + i + ',this.value)"' + dis + '>' + h(t.tomTat) + '</textarea>' +
          (chay ? '' : '<div class="row"><button class="btn btn-chinh" onclick="G.xpBoLamTap(' + t.so + ')">' + (t.xong ? 'Làm lại / xuất lại tập ' : '▶ Làm tập ') + t.so + '</button>' +
            '<button class="btn" onclick="G.xpBoMoTap(' + t.so + ')">Mở tập ' + t.so + ' trong xưởng</button></div>') + '</details>';
      });
      o += la0d() ? '<p class="note">Chi phí: 0 đồng. Phần miễn phí mỗi ngày đủ khoảng 1 tập Bom tấn Cloudflare (hoặc 2 tập Tiêu chuẩn); hết thì máy tự chờ đến 07:00 sáng rồi làm tiếp.</p>'
        : '<p class="note">Mỗi tập khoảng ' + usd(giaTap()) + ' trên fal.ai, mất 1–2 giờ. Đặt hạn mức chi tiêu ở fal.ai để yên tâm.</p>';
    }
    o += '<p class="note" id="xb-tt"></p><pre class="note" id="xb-nk" style="white-space:pre-wrap;max-height:180px;overflow:auto">' + h((b.nhatKy || []).slice(-8).join('\n')) + '</pre>';
    o += '</div>';
    return o;
  };

  G.xpBo = G.xpBo || nap();
})();
