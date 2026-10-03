/* ═══════════════════════════════════════════════════════════════
   GITA 365 · XƯỞNG PHIM NGẮN AI — phim dọc 9:16 nhiều tập

   Dựng phim ngắn kiểu "phim ngắn dọc" (nhân vật người thật do AI dựng,
   nhiều bối cảnh, thoại có phụ đề, logo góc màn, số tập) theo BỐN bước:

     1 · Sổ nhân vật & bối cảnh — mỗi nhân vật một đoạn mô tả ngoại hình
         CỐ ĐỊNH (tiếng Anh). Câu ấy được chép nguyên vào mọi prompt, nên
         cùng một gương mặt đi qua mọi cảnh.
     2 · Kịch bản → danh sách cảnh quay. Viết kịch bản theo lối thường
         (# bối cảnh · [góc máy] hành động · Tên: lời thoại · TIN NHẮN:),
         máy tách ra từng cảnh và soạn sẵn prompt ẢNH + prompt VIDEO.
     3 · Người dùng dán prompt vào công cụ tạo video AI (Kling, Hailuo,
         Veo, Runway…) BẰNG TÀI KHOẢN CỦA MÌNH, tải từng clip về máy.
     4 · Nạp các clip vào đây: máy xếp đúng thứ tự, đè phụ đề, logo, số
         tập, khung tin nhắn, trộn nhạc nền, rồi xuất một tệp phim 9:16.

   ── HAI CÁCH LÀM ──
   · Tự tay (bốn bước trên): xưởng chỉ SOẠN chữ và LẮP clip người dùng
     mang vào — không một byte nào rời máy (đúng luật C20 của xưởng cũ).
   · Tự động A-Z (src/xuong-phim-tu-dong.js, 9.99.251): theo yêu cầu chủ
     hệ, Super Admin dán kịch bản, máy chủ gọi fal.ai bằng khoá của chủ
     hệ (may-chu/phim-ai.js) để phân cảnh, vẽ, quay, đọc thoại; xưởng
     tải kết quả về rồi tự lắp và xuất. Đây là ngoại lệ có chủ ý của C20.

   ── KHÔNG `URL.createObjectURL` ──
   Clip đọc bằng FileReader thành địa chỉ data: (CSP media-src có data:),
   ảnh đi thẳng vào createImageBitmap, nhạc vào decodeAudioData. Tệp phim
   xuất ra được GHI qua hộp "Lưu thành" của hệ điều hành
   (showSaveFilePicker) — không sinh địa chỉ blob, không thẻ <a download>.
   Máy khách (G.LA_MAY_KHACH) và tài khoản khách hàng (G.BI_KHOA_CHEP)
   không xuất được: đúng chính sách "chỉ dùng, không lưu".
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;
  var KHOA_LUU = 'gita.xuongPhim.v1';

  var demMa = 0;
  function ma(tien) { demMa += 1; return tien + '-' + Date.now().toString(36) + demMa.toString(36); }

  /* ══ DỰ ÁN MẪU — câu chuyện gốc của GITA, không chép phim của ai ══ */
  function duAnMau() {
    return {
      ten: 'Bữa Cơm Muộn', tap: 1, logo: 'GITA 365', khung: '720x1280',
      phongCach: 'photorealistic cinematic short drama, soft natural light, shallow depth of field, 35mm film look, subtle film grain',
      nhanVat: [
        {id: 'nv-minh', ten: 'Minh', moTa: 'Bố, 42 tuổi, áo sơ mi xanh nhạt',
          prompt: 'a 42-year-old Vietnamese man, short neat black hair, light stubble, tired kind eyes, light blue cotton shirt with rolled sleeves'},
        {id: 'nv-an', ten: 'An', moTa: 'Con gái, 15 tuổi, đồng phục học sinh',
          prompt: 'a 15-year-old Vietnamese girl, long straight black hair in a low ponytail, white school uniform shirt, small silver hair clip'}
      ],
      boiCanh: [
        {id: 'bc-bep', ten: 'Gian bếp - tối', prompt: 'a small warm Vietnamese family kitchen at night, wooden dining table, two bowls of rice, warm yellow pendant lamp'},
        {id: 'bc-phong', ten: 'Phòng của An', prompt: 'a teenage girl bedroom at night, study desk with books, desk lamp, posters on the wall'}
      ],
      kichBan: [
        '# Gian bếp - tối',
        '[Toàn cảnh, máy đứng yên] Minh ngồi một mình bên mâm cơm đã nguội, nhìn đồng hồ.',
        '[Cận cảnh, đẩy máy vào] Minh cầm điện thoại, ngập ngừng rồi gõ tin nhắn.',
        'TIN NHẮN: Minh: Con về chưa? Bố để phần cơm rồi.',
        '# Phòng của An',
        '[Trung cảnh, máy cầm tay] An ngồi bên bàn học, đọc tin nhắn, mắt đỏ hoe.',
        'An: Con xin lỗi bố… hôm nay con bị điểm kém.',
        '# Gian bếp - tối',
        '[Trung cảnh hai người, lia máy chậm] An bước vào bếp, Minh mỉm cười, kéo ghế cho con.',
        'Minh: Ăn đi con. Điểm kém thì mai mình học lại.',
        'An: Bố không giận con ạ?',
        '[Cận cảnh, máy đứng yên] Minh xoa đầu An, cả hai cùng cười.',
        'Minh: Bố chỉ giận khi con ăn cơm một mình thôi.'
      ].join('\n'),
      canh: []
    };
  }

  function napDuAn() {
    try {
      var s = localStorage.getItem(KHOA_LUU);
      if (s) { var d = JSON.parse(s); if (d && d.nhanVat && d.canh) return d; }
    } catch (e) {}
    var m = duAnMau(); m.canh = G.xpTachKichBan(m.kichBan, m); return m;
  }
  function luuDuAn() {
    try { localStorage.setItem(KHOA_LUU, JSON.stringify(G.xpDA)); } catch (e) {}
    if (G.xpDA && G.xpDA.boMa && G.xpBoLuu) G.xpBoLuu();
  }

  /* ══ TÁCH KỊCH BẢN → CẢNH QUAY ══
     # Bối cảnh              → đổi bối cảnh (tự thêm nếu chưa có)
     [Góc máy, chuyển máy] … → mở một cảnh quay mới, phần sau là hành động
     Tên: lời               → lời thoại của cảnh đang mở
     TIN NHẮN: Tên: lời     → cảnh chèn khung tin nhắn điện thoại
     dòng khác              → thêm vào hành động của cảnh đang mở */
  var GOC = [
    ['toàn cảnh', 'wide establishing shot'], ['trung cảnh', 'medium shot'],
    ['cận cảnh', 'close-up shot'], ['đặc tả', 'extreme close-up'],
    ['qua vai', 'over-the-shoulder shot'], ['góc nhìn', 'point-of-view shot'],
    ['từ trên', 'high-angle shot'], ['từ dưới', 'low-angle shot']
  ];
  var MAY = [
    ['đứng yên', 'static camera'], ['đẩy máy vào', 'slow dolly in'], ['kéo máy ra', 'slow dolly out'],
    ['lia', 'slow pan'], ['cầm tay', 'subtle handheld movement'], ['bám theo', 'tracking shot following the subject'],
    ['xoay quanh', 'slow orbit around the subject'], ['nâng máy', 'crane up']
  ];
  function tra(bang, chu) {
    var t = String(chu || '').toLowerCase();
    for (var i = 0; i < bang.length; i++) if (t.indexOf(bang[i][0]) >= 0) return bang[i][1];
    return '';
  }

  G.xpTachKichBan = function (vb, da) {
    da = da || G.xpDA;
    var ds = [], bc = (da.boiCanh[0] || {}).id || '', cur = null;
    function moi(chiDao, hanhDong) {
      cur = {id: ma('c'), boiCanh: bc, chiDao: chiDao || '', hanhDong: hanhDong || '',
        thoai: [], tinNhan: [], giay: 5, clip: ''};
      ds.push(cur); return cur;
    }
    String(vb || '').split(/\r?\n/).forEach(function (dong) {
      var d = dong.trim(); if (!d) return;
      var m;
      if (d.charAt(0) === '#') {
        var ten = d.replace(/^#+\s*/, '').replace(/^cảnh\s*:\s*/i, '').trim();
        var co = da.boiCanh.filter(function (b) { return b.ten.toLowerCase() === ten.toLowerCase(); })[0];
        if (!co && ten) { co = {id: ma('bc'), ten: ten, prompt: ''}; da.boiCanh.push(co); }
        if (co) bc = co.id; cur = null; return;
      }
      if ((m = d.match(/^\[([^\]]*)\]\s*(.*)$/))) { moi(m[1], m[2]); return; }
      if ((m = d.match(/^tin nh[aắ]n\s*:\s*(.*)$/i))) {
        var c = (cur && !cur.thoai.length && (cur.tinNhan.length || !cur.hanhDong)) ? cur : moi('Đặc tả màn hình điện thoại', 'Màn hình điện thoại hiện tin nhắn');
        if (!c.hanhDong) c.hanhDong = 'Màn hình điện thoại hiện tin nhắn';
        var p = m[1].match(/^([^:]{1,30}):\s*(.+)$/);
        c.tinNhan.push(p ? {ai: p[1].trim(), loi: p[2].trim()} : {ai: '', loi: m[1]});
        cur = c; return;
      }
      if ((m = d.match(/^([^:\[\]]{1,30}):\s*(.+)$/))) {
        if (!cur) moi('', '');
        cur.thoai.push({ai: m[1].trim(), loi: m[2].trim()}); return;
      }
      if (!cur) moi('', d); else cur.hanhDong = (cur.hanhDong ? cur.hanhDong + ' ' : '') + d;
    });
    ds.forEach(function (c) {
      var chu = c.thoai.concat(c.tinNhan).map(function (t) { return t.loi; }).join(' ').length;
      c.giay = Math.min(10, Math.max(5, Math.ceil(chu / 14) + 2));
    });
    return ds;
  };

  /* ══ SOẠN PROMPT ══ */
  function nvTrongCanh(c) {
    if (c.nhanVat && c.nhanVat.length) {
      var ds = c.nhanVat.map(function (x) { return String(x).toLowerCase(); });
      var co = G.xpDA.nhanVat.filter(function (n) { return n.ten && ds.indexOf(n.ten.toLowerCase()) >= 0; });
      if (co.length) return co;
    }
    var chu = (c.hanhDong + ' ' + c.thoai.map(function (t) { return t.ai; }).join(' ') + ' ' +
      c.tinNhan.map(function (t) { return t.ai; }).join(' ')).toLowerCase();
    return G.xpDA.nhanVat.filter(function (n) { return n.ten && chu.indexOf(n.ten.toLowerCase()) >= 0; });
  }
  function boiCanhCua(c) {
    return G.xpDA.boiCanh.filter(function (b) { return b.id === c.boiCanh; })[0] || {ten: '', prompt: ''};
  }
  G.xpPrompt = function (c) {
    var nv = nvTrongCanh(c), bc = boiCanhCua(c);
    var goc = tra(GOC, c.chiDao) || 'medium shot', may = tra(MAY, c.chiDao) || 'static camera';
    var ai = nv.map(function (n) { return n.ten + ' (' + (n.prompt || n.moTa) + ')'; }).join('; ');
    var noi = c.thoai.length ? ' The character is speaking with natural lip movement and genuine emotion.' : '';
    var anh = 'Vertical 9:16 frame. ' + G.xpDA.phongCach + '. ' + goc + '. ' +
      (ai ? 'Characters: ' + ai + '. ' : '') +
      (bc.prompt || bc.ten ? 'Setting: ' + (bc.prompt || bc.ten) + '. ' : '') +
      (c.hinh ? c.hinh + ' ' : 'Scene (Vietnamese description, translate faithfully): ' + c.hanhDong + '. ') +
      (c.tinNhan.length ? 'Close-up of a smartphone screen showing a chat conversation. ' : '') +
      'Consistent character appearance, realistic skin texture, no text, no subtitles, no watermark, no logo.';
    var vid = goc + ', ' + may + '. ' + (ai ? ai + '. ' : '') + (c.chuyenDong || c.hanhDong) + '.' + noi +
      ' Smooth natural motion, cinematic lighting, vertical 9:16, ' + (+c.giay || 5) +
      ' seconds. No text on screen, no subtitles, no watermark.';
    var am = 'blurry, distorted face, extra fingers, deformed hands, text, subtitles, watermark, logo, cartoon, low quality';
    return {anh: anh, video: vid, am: am, nv: nv};
  };

  /* ══ PHỤ ĐỀ ══ — mỗi lời thoại chia theo độ dài trong thời lượng cảnh */
  function moc(t) {
    var ms = Math.round(t * 1000), hh = Math.floor(ms / 3600000), mm = Math.floor(ms / 60000) % 60,
      ss = Math.floor(ms / 1000) % 60, r = ms % 1000;
    function p(n, k) { n = String(n); while (n.length < k) n = '0' + n; return n; }
    return p(hh, 2) + ':' + p(mm, 2) + ':' + p(ss, 2) + ',' + p(r, 3);
  }
  function thoiLuongCanh(c) {
    var v = c.clip && G.xpVat[c.clip];
    var can = 0;
    c.thoai.forEach(function (x) { if (x.am && G.xpVat[x.am] && x.den) can = Math.max(can, x.den + 0.4); });
    if (G.xpDA.theoClip && v && v.loai === 'phim' && v.el && v.el.duration) return Math.max(v.el.duration, can);
    return Math.max(+c.giay || 5, can);
  }
  G.xpDongPhuDe = function () {
    var ds = [], t0 = 0;
    G.xpDA.canh.forEach(function (c) {
      var d = thoiLuongCanh(c), tong = 0;
      var coMoc = c.thoai.length && c.thoai.every(function (x) { return x.am && G.xpVat[x.am] && x.den > x.tu; });
      if (coMoc) {
        c.thoai.forEach(function (x) { ds.push({tu: t0 + x.tu, den: t0 + Math.min(d, x.den + 0.15), chu: x.loi, ai: x.ai, canh: c.id}); });
        t0 += d; return;
      }
      c.thoai.forEach(function (t) { tong += t.loi.length + 8; });
      var t = t0 + 0.2;
      c.thoai.forEach(function (x) {
        var dd = (d - 0.4) * (x.loi.length + 8) / (tong || 1);
        ds.push({tu: t, den: t + dd, chu: x.loi, ai: x.ai, canh: c.id}); t += dd;
      });
      t0 += d;
    });
    return ds;
  };
  G.xpSRT = function () {
    return G.xpDongPhuDe().map(function (p, i) {
      return (i + 1) + '\n' + moc(p.tu) + ' --> ' + moc(p.den) + '\n' + p.chu + '\n';
    }).join('\n');
  };
  G.xpGoiPrompt = function () {
    var da = G.xpDA, o = [];
    o.push('GÓI PROMPT · ' + da.ten + ' · Tập ' + da.tap);
    o.push('Phong cách chung: ' + da.phongCach);
    o.push('');
    o.push('=== NHÂN VẬT (dùng ảnh chân dung này làm ảnh tham chiếu cho mọi cảnh) ===');
    da.nhanVat.forEach(function (n) {
      o.push('• ' + n.ten + ' — ' + n.moTa);
      o.push('  Prompt chân dung: Vertical 9:16 portrait, ' + da.phongCach + '. ' + (n.prompt || n.moTa) +
        ', neutral expression, looking at camera, plain soft background, full face clearly visible, no text.');
    });
    o.push('');
    da.canh.forEach(function (c, i) {
      var p = G.xpPrompt(c);
      o.push('=== CẢNH ' + (i + 1) + ' · ' + boiCanhCua(c).ten + ' · ' + (+c.giay || 5) + ' giây · tên clip gợi ý: canh-' + (i < 9 ? '0' : '') + (i + 1) + '.mp4 ===');
      o.push('Ảnh mở đầu (image prompt):'); o.push(p.anh);
      o.push('Video (image-to-video prompt):'); o.push(p.video);
      o.push('Negative prompt: ' + p.am);
      if (c.thoai.length) o.push('Thoại (phụ đề, KHÔNG đưa vào prompt): ' + c.thoai.map(function (t) { return t.ai + ': ' + t.loi; }).join(' | '));
      o.push('');
    });
    return o.join('\n');
  };

  /* ══ KHO CLIP — nằm trong máy ══ */
  G.xpVat = G.xpVat || {};
  G.xpDA = G.xpDA || napDuAn();
  var actx = null;
  function ac() { if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); return actx; }

  function soTen(a, b) { return a.name.localeCompare(b.name, undefined, {numeric: true, sensitivity: 'base'}); }
  G.xpNhanTep = function (ds, vai) {
    var tep = Array.prototype.slice.call(ds || []).sort(soTen), xong = 0, phimMoi = [];
    if (!tep.length) return;
    function het() {
      xong += 1;
      if (xong < tep.length) return;
      if (vai === 'clip') {
        /* Clip không chỉ định thì xếp lần lượt vào các cảnh còn trống, theo tên tệp */
        var trong = G.xpDA.canh.filter(function (c) { return !c.clip || !G.xpVat[c.clip]; });
        phimMoi.forEach(function (id, i) { if (trong[i]) trong[i].clip = id; });
      }
      luuDuAn(); veLai();
    }
    tep.forEach(function (f) {
      var id = ma('v');
      if (vai === 'nhac') {
        if (!/^audio\//.test(f.type) && !/^video\//.test(f.type)) { U.toast(f.name + ': nhạc nền cần tệp âm thanh.', 'err'); het(); return; }
        f.arrayBuffer().then(function (b) { return ac().decodeAudioData(b); }).then(function (buf) {
          G.xpVat[id] = {ma: id, ten: f.name, loai: 'nhac', buffer: buf}; G.xpDA.nhac = id; het();
        }).catch(function () { U.toast('Không đọc được nhạc ' + f.name, 'err'); het(); });
        return;
      }
      if (/^image\//.test(f.type)) {
        createImageBitmap(f).then(function (bm) {
          G.xpVat[id] = {ma: id, ten: f.name, loai: 'anh', el: bm};
          if (vai === 'logo') G.xpDA.logoAnh = id; else phimMoi.push(id);
          het();
        }).catch(function () { U.toast('Không đọc được ảnh ' + f.name, 'err'); het(); });
        return;
      }
      if (/^video\//.test(f.type) || /\.(mp4|webm|mov|m4v)$/i.test(f.name)) {
        if (f.size > 300 * 1024 * 1024) { U.toast(f.name + ' quá 300 MB — hãy dùng clip từng cảnh (5–10 giây).', 'err'); het(); return; }
        var fr = new FileReader();
        fr.onload = function () {
          var v = document.createElement('video');
          v.preload = 'auto'; v.playsInline = true;
          v.onloadedmetadata = function () {
            G.xpVat[id] = {ma: id, ten: f.name, loai: 'phim', el: v};
            phimMoi.push(id); het();
          };
          v.onerror = function () { U.toast('Trình duyệt không phát được ' + f.name + ' (thử xuất lại clip dạng MP4 H.264).', 'err'); het(); };
          v.src = fr.result;
        };
        fr.onerror = function () { het(); };
        fr.readAsDataURL(f);
        return;
      }
      U.toast(f.name + ': chưa nhận loại tệp này.', 'err'); het();
    });
  };

  /* ══ VẼ MỘT KHUNG ══ */
  function kichThuoc() { var k = String(G.xpDA.khung || '720x1280').split('x'); return {w: +k[0] || 720, h: +k[1] || 1280}; }
  function phuKin(x, src, sw, sh, W, H, zoom) {
    var s = Math.max(W / sw, H / sh) * (zoom || 1), dw = sw * s, dh = sh * s;
    x.drawImage(src, (W - dw) / 2, (H - dh) / 2, dw, dh);
  }
  function chuNgat(x, chu, rong) {
    var tu = String(chu).split(/\s+/), dong = [], cur = '';
    tu.forEach(function (w) {
      var thu = cur ? cur + ' ' + w : w;
      if (x.measureText(thu).width > rong && cur) { dong.push(cur); cur = w; } else cur = thu;
    });
    if (cur) dong.push(cur); return dong;
  }
  function veTinNhan(x, W, H, ds, tienDo) {
    var n = Math.max(1, Math.ceil(ds.length * Math.min(1, tienDo * 1.6)));
    x.fillStyle = 'rgba(0,0,0,.55)'; x.fillRect(0, 0, W, H);
    var pw = W * 0.78, ph = H * 0.62, px = (W - pw) / 2, py = H * 0.16, r = W * 0.05;
    x.fillStyle = '#f2f3f5'; x.beginPath();
    x.moveTo(px + r, py); x.arcTo(px + pw, py, px + pw, py + ph, r); x.arcTo(px + pw, py + ph, px, py + ph, r);
    x.arcTo(px, py + ph, px, py, r); x.arcTo(px, py, px + pw, py, r); x.fill();
    var co = Math.round(W * 0.036), y = py + co * 2.2;
    x.font = '600 ' + co + 'px system-ui, sans-serif'; x.textBaseline = 'top';
    var nguoiDau = ds[0] && ds[0].ai;
    ds.slice(0, n).forEach(function (t) {
      var phai = t.ai && t.ai === nguoiDau;
      var dong = chuNgat(x, t.loi, pw * 0.62), bw = 0;
      dong.forEach(function (d) { bw = Math.max(bw, x.measureText(d).width); });
      bw += co * 1.2; var bh = dong.length * co * 1.3 + co * 0.8;
      var bx = phai ? px + pw - bw - co * 0.8 : px + co * 0.8;
      if (t.ai && !phai) { x.fillStyle = '#666'; x.fillText(t.ai, bx, y); y += co * 1.2; }
      x.fillStyle = phai ? '#3b82f6' : '#ffffff'; x.fillRect(bx, y, bw, bh);
      x.fillStyle = phai ? '#fff' : '#111';
      dong.forEach(function (d, i) { x.fillText(d, bx + co * 0.6, y + co * 0.4 + i * co * 1.3); });
      y += bh + co * 0.8;
    });
  }
  function vePhuDe(x, W, H, chu) {
    var co = Math.round(W * 0.05);
    x.font = '700 ' + co + 'px system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
    var dong = chuNgat(x, chu, W * 0.86), y0 = H * 0.80 - (dong.length - 1) * co * 1.25;
    x.lineJoin = 'round'; x.lineWidth = co * 0.18; x.strokeStyle = 'rgba(0,0,0,.9)'; x.fillStyle = '#fff';
    dong.forEach(function (d, i) { x.strokeText(d, W / 2, y0 + i * co * 1.25); x.fillText(d, W / 2, y0 + i * co * 1.25); });
    x.textAlign = 'left';
  }
  G.xpVeKhung = function (x, c, tCanh, dCanh, tPhim) {
    var K = kichThuoc(), W = K.w, H = K.h, v = c && c.clip && G.xpVat[c.clip];
    x.fillStyle = '#000'; x.fillRect(0, 0, W, H);
    if (v && v.loai === 'phim' && v.el.videoWidth) phuKin(x, v.el, v.el.videoWidth, v.el.videoHeight, W, H);
    else if (v && v.loai === 'anh') phuKin(x, v.el, v.el.width, v.el.height, W, H, 1 + 0.06 * (tCanh / (dCanh || 1)));
    else if (c) {
      x.fillStyle = '#1f2937'; x.fillRect(0, 0, W, H);
      x.fillStyle = '#9ca3af'; x.font = '600 ' + Math.round(W * 0.04) + 'px system-ui, sans-serif'; x.textBaseline = 'top';
      chuNgat(x, 'Chưa có clip · ' + (c.chiDao ? '[' + c.chiDao + '] ' : '') + c.hanhDong, W * 0.8)
        .forEach(function (d, i) { x.fillText(d, W * 0.1, H * 0.35 + i * W * 0.055); });
    }
    if (c && c.tinNhan.length) veTinNhan(x, W, H, c.tinNhan, tCanh / (dCanh || 1));
    /* Mờ dần đầu/cuối cảnh — chuyển cảnh nhẹ, không giật */
    var mo = Math.min(1, tCanh / 0.25, Math.max(0, dCanh - tCanh) / 0.25);
    if (mo < 1) { x.fillStyle = 'rgba(0,0,0,' + (1 - mo).toFixed(3) + ')'; x.fillRect(0, 0, W, H); }
    var pd = G.xpPhuDeNay(tPhim);
    if (pd) vePhuDe(x, W, H, pd.chu);
    var lg = G.xpDA.logoAnh && G.xpVat[G.xpDA.logoAnh];
    if (lg) { var lw = W * 0.2, lh = lw * lg.el.height / lg.el.width; x.globalAlpha = 0.85; x.drawImage(lg.el, W * 0.04, W * 0.04, lw, lh); x.globalAlpha = 1; }
    else if (G.xpDA.logo) {
      x.font = '800 ' + Math.round(W * 0.04) + 'px system-ui, sans-serif'; x.textBaseline = 'top';
      x.lineWidth = W * 0.006; x.strokeStyle = 'rgba(0,0,0,.7)'; x.fillStyle = 'rgba(255,255,255,.9)';
      x.strokeText(G.xpDA.logo, W * 0.04, W * 0.04); x.fillText(G.xpDA.logo, W * 0.04, W * 0.04);
    }
    if (G.xpDA.tap) {
      var nhan = 'Tập ' + G.xpDA.tap;
      x.font = '700 ' + Math.round(W * 0.036) + 'px system-ui, sans-serif'; x.textBaseline = 'top';
      var tw = x.measureText(nhan).width;
      x.fillStyle = 'rgba(0,0,0,.45)'; x.fillRect(W - tw - W * 0.08, W * 0.035, tw + W * 0.04, W * 0.056);
      x.fillStyle = '#fff'; x.fillText(nhan, W - tw - W * 0.06, W * 0.045);
    }
  };
  var phuDeDem = null;
  G.xpPhuDeNay = function (t) {
    phuDeDem = phuDeDem || G.xpDongPhuDe();
    for (var i = 0; i < phuDeDem.length; i++) if (t >= phuDeDem[i].tu && t < phuDeDem[i].den) return phuDeDem[i];
    return null;
  };

  /* ══ PHÁT / XUẤT — chạy thời gian thực trên canvas ══ */
  var chay = null;
  function noiTieng(el, dich) {
    var a = ac();
    if (!el._nguon) { el._nguon = a.createMediaElementSource(el); el._gain = a.createGain(); el._nguon.connect(el._gain); }
    try { el._gain.disconnect(); } catch (e) {}
    el._gain.gain.value = +G.xpDA.amLuongClip >= 0 ? +G.xpDA.amLuongClip : 1;
    el._gain.connect(a.destination); if (dich) el._gain.connect(dich);
  }
  G.xpDung = function () {
    if (!chay) return;
    chay.dung = true;
    if (chay.ghi && chay.ghi.state === 'recording') chay.ghi.stop();
    dungPhat();
  };
  function tatGiong() {
    (chay && chay.giong || []).forEach(function (s) { try { s.stop(); } catch (e) {} });
    if (chay) chay.giong = [];
  }
  function dungPhat() {
    if (!chay) return;
    cancelAnimationFrame(chay.raf);
    tatGiong();
    G.xpDA.canh.forEach(function (c) { var v = G.xpVat[c.clip]; if (v && v.loai === 'phim') try { v.el.pause(); } catch (e) {} });
    if (chay.nhac) try { chay.nhac.stop(); } catch (e) {}
  }
  G.xpPhat = function (xuat, xongFn) {
    if (chay && !chay.dung) { G.xpDung(); return; }
    if (!G.xpDA.canh.length) { U.toast('Chưa có cảnh nào — bấm "Tách kịch bản thành cảnh" trước.', 'err'); return; }
    var cv = document.getElementById('xp-man'); if (!cv) return;
    var K = kichThuoc(); cv.width = K.w; cv.height = K.h;
    var x = cv.getContext('2d'), a = ac(); a.resume();
    phuDeDem = G.xpDongPhuDe();
    var dich = xuat ? a.createMediaStreamDestination() : null;
    chay = {i: -1, t0: 0, batDau: 0, dung: false, raf: 0, giong: []};
    if (G.xpDA.nhac && G.xpVat[G.xpDA.nhac]) {
      var src = a.createBufferSource(), g = a.createGain();
      src.buffer = G.xpVat[G.xpDA.nhac].buffer; src.loop = true;
      g.gain.value = +G.xpDA.amLuongNhac >= 0 ? +G.xpDA.amLuongNhac : 0.25;
      src.connect(g); g.connect(a.destination); if (dich) g.connect(dich);
      src.start(); chay.nhac = src;
    }
    if (xuat) {
      var luong = cv.captureStream(30);
      dich.stream.getAudioTracks().forEach(function (t) { luong.addTrack(t); });
      var kieu = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm']
        .filter(function (k) { return window.MediaRecorder && MediaRecorder.isTypeSupported(k); })[0];
      if (!kieu) { U.toast('Trình duyệt này không ghi được video. Dùng Chrome hoặc Edge trên máy tính.', 'err'); dungPhat(); chay = null; return; }
      var manh = [], ghi = new MediaRecorder(luong, {mimeType: kieu, videoBitsPerSecond: 6000000});
      ghi.ondataavailable = function (e) { if (e.data && e.data.size) manh.push(e.data); };
      ghi.onstop = function () { var bl = new Blob(manh, {type: kieu}); if (xongFn) xongFn(bl, kieu); };
      ghi.start(1000); chay.ghi = ghi;
    }
    function sangCanh(i) {
      G.xpDA.canh.forEach(function (c, j) { var v = G.xpVat[c.clip]; if (j !== i && v && v.loai === 'phim') try { v.el.pause(); } catch (e) {} });
      chay.i = i; chay.batDau = performance.now();
      var c = G.xpDA.canh[i], v = c && G.xpVat[c.clip];
      if (v && v.loai === 'phim') {
        try { noiTieng(v.el, dich); } catch (e) {}
        v.el.currentTime = 0; var p = v.el.play(); if (p && p.catch) p.catch(function () {});
      }
      tatGiong();
      /* Cảnh đã khớp khẩu hình: giọng nằm sẵn trong clip, không phát thêm lần nữa */
      var giongTrongClip = c && c.khopMoi && v && v.loai === 'phim';
      (c && !giongTrongClip ? c.thoai : []).forEach(function (x) {
        var gv = x.am && G.xpVat[x.am];
        if (!gv || gv.loai !== 'giong') return;
        var s = a.createBufferSource(), g = a.createGain();
        s.buffer = gv.buffer; g.gain.value = +G.xpDA.amLuongGiong >= 0 ? +G.xpDA.amLuongGiong : 1;
        s.connect(g); g.connect(a.destination); if (dich) g.connect(dich);
        s.start(a.currentTime + Math.max(0, +x.tu || 0)); chay.giong.push(s);
      });
    }
    var tPhimTruoc = 0;
    function nhip() {
      if (chay.dung) return;
      var c = G.xpDA.canh[chay.i], d = thoiLuongCanh(c), t = (performance.now() - chay.batDau) / 1000;
      if (t >= d) {
        tPhimTruoc += d;
        if (chay.i + 1 >= G.xpDA.canh.length) { chay.dung = true; if (chay.ghi) chay.ghi.stop(); dungPhat(); veNut(); return; }
        sangCanh(chay.i + 1); c = G.xpDA.canh[chay.i]; d = thoiLuongCanh(c); t = 0;
      }
      G.xpVeKhung(x, c, t, d, tPhimTruoc + t);
      var tt = document.getElementById('xp-tt');
      if (tt) tt.textContent = (xuat ? 'Đang xuất · ' : 'Đang phát · ') + 'cảnh ' + (chay.i + 1) + '/' + G.xpDA.canh.length +
        ' · ' + Math.floor(tPhimTruoc + t) + 's / ' + Math.round(tongGiay()) + 's';
      chay.raf = requestAnimationFrame(nhip);
    }
    sangCanh(0); veNut();
    chay.raf = requestAnimationFrame(nhip);
  };
  function tongGiay() { return G.xpDA.canh.reduce(function (s, c) { return s + thoiLuongCanh(c); }, 0); }
  function veNut() {
    var b = document.getElementById('xp-nut-phat');
    if (b) b.textContent = (chay && !chay.dung) ? 'Dừng' : 'Xem thử cả tập';
  }

  /* ══ LƯU TỆP — hộp "Lưu thành" của hệ điều hành, không địa chỉ blob ══ */
  function duocLuu() {
    if (G.LA_MAY_KHACH || (G.BI_KHOA_CHEP && G.BI_KHOA_CHEP())) {
      U.toast('Tài khoản/máy này chỉ được dùng, không được lưu tệp ra máy.', 'err'); return false;
    }
    if (!window.showSaveFilePicker) {
      U.toast('Trình duyệt này chưa có hộp "Lưu thành". Hãy mở GITA 365 bằng Chrome hoặc Edge trên máy tính.', 'err'); return false;
    }
    return true;
  }
  function luuTep(ten, du, mo, duoi) {
    var loai = {}; loai[mo] = [duoi];
    return window.showSaveFilePicker({suggestedName: ten, types: [{description: duoi, accept: loai}]})
      .then(function (fh) { return fh.createWritable(); })
      .then(function (w) { return w.write(du).then(function () { return w.close(); }); })
      .then(function () { U.toast('Đã lưu ' + ten, 'ok'); })
      .catch(function (e) { if (e && e.name !== 'AbortError') U.toast('Không lưu được: ' + (e.message || e), 'err'); });
  }
  function tenTep() { return String(G.xpDA.ten || 'phim').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '-tap-' + (G.xpDA.tap || 1); }
  G.xpLuuChu = function (loai) {
    if (!duocLuu()) return;
    if (loai === 'srt') luuTep(tenTep() + '.srt', new Blob([G.xpSRT()], {type: 'text/plain'}), 'text/plain', '.srt');
    else luuTep(tenTep() + '-prompt.txt', new Blob([G.xpGoiPrompt()], {type: 'text/plain'}), 'text/plain', '.txt');
  };
  G.xpXuat = function () {
    if (chay && !chay.dung) { G.xpDung(); return; }
    if (!duocLuu()) return;
    var thieu = G.xpDA.canh.filter(function (c) { return !c.clip || !G.xpVat[c.clip]; }).length;
    if (thieu && !confirm(thieu + ' cảnh chưa có clip sẽ hiện khung xám. Vẫn xuất?')) return;
    /* Hỏi chỗ lưu TRƯỚC khi ghi — hộp lưu cần cú bấm của người dùng */
    var mp4 = window.MediaRecorder && MediaRecorder.isTypeSupported('video/mp4');
    var duoi = mp4 ? '.mp4' : '.webm', mo = mp4 ? 'video/mp4' : 'video/webm';
    var loai = {}; loai[mo] = [duoi];
    window.showSaveFilePicker({suggestedName: tenTep() + duoi, types: [{description: 'Phim', accept: loai}]})
      .then(function (fh) { G.xpXuatVao(fh); })
      .catch(function (e) { if (e && e.name !== 'AbortError') U.toast('Không mở được hộp lưu: ' + (e.message || e), 'err'); });
  };
  /* Hỏi chỗ lưu (cần cú bấm) — dùng cho làm phim tự động: hỏi lúc bắt đầu, ghi lúc xong */
  G.xpChonNoiLuu = function () {
    if (!duocLuu()) return Promise.reject(new Error('KHONG_LUU'));
    var mp4 = window.MediaRecorder && MediaRecorder.isTypeSupported('video/mp4');
    var duoi = mp4 ? '.mp4' : '.webm', mo = mp4 ? 'video/mp4' : 'video/webm';
    var loai = {}; loai[mo] = [duoi];
    return window.showSaveFilePicker({suggestedName: tenTep() + duoi, types: [{description: 'Phim', accept: loai}]});
  };
  /* Hỏi một THƯ MỤC (cần cú bấm) — bộ phim ghi Tap-01 … Tap-10 vào đó */
  G.xpChonThuMuc = function () {
    if (!duocLuu()) return Promise.reject(new Error('KHONG_LUU'));
    if (!window.showDirectoryPicker) { U.toast('Trình duyệt này chưa chọn được thư mục. Dùng Chrome hoặc Edge trên máy tính.', 'err'); return Promise.reject(new Error('KHONG_LUU')); }
    return window.showDirectoryPicker({id: 'gita-bo-phim', mode: 'readwrite'});
  };
  G.xpDuoiPhim = function () { return window.MediaRecorder && MediaRecorder.isTypeSupported('video/mp4') ? '.mp4' : '.webm'; };
  G.xpXuatVao = function (fh, xongFn) {
    U.toast('Đang xuất theo thời gian thực (' + Math.round(tongGiay()) + ' giây). Giữ tab này mở và hiện trên màn hình.', 'ok');
    G.xpPhat(true, function (bl) {
      fh.createWritable().then(function (w) { return w.write(bl).then(function () { return w.close(); }); })
        .then(function () { U.toast('Đã xuất xong ' + fh.name, 'ok'); if (xongFn) xongFn(true); })
        .catch(function (e) { U.toast('Không ghi được tệp: ' + (e && e.message), 'err'); if (xongFn) xongFn(false); });
    });
  };
  G.xpChep = function (i, loai) {
    var c = G.xpDA.canh[i]; if (!c) return;
    var p = G.xpPrompt(c), chu = loai === 'anh' ? p.anh : p.video;
    if (navigator.clipboard && navigator.clipboard.writeText)
      navigator.clipboard.writeText(chu).then(function () { U.toast('Đã chép prompt cảnh ' + (i + 1), 'ok'); },
        function () { U.toast('Không chép được — bôi đen ô prompt rồi Ctrl+C.', 'err'); });
  };

  /* ══ SỬA DỮ LIỆU ══ */
  G.xpLuu = function () { luuDuAn(); };
  G.xpVeLai = function () { veLai(); };
  G.xpMa = ma;
  G.xpTongGiay = function () { return tongGiay(); };
  G.xpDangChay = function () { return !!(chay && !chay.dung); };
  function veLai() { phuDeDem = null; if (G.S && G.S.view === 'xuong-phim' && G.render) G.render(); }
  G.xpSua = function (k, v) { G.xpDA[k] = v; phuDeDem = null; luuDuAn(); };
  G.xpSuaDS = function (ds, id, k, v) {
    var o = (G.xpDA[ds] || []).filter(function (x) { return x.id === id; })[0];
    if (o) { o[k] = (k === 'giay') ? Math.max(1, Math.min(60, +v || 5)) : v; phuDeDem = null; luuDuAn(); }
  };
  G.xpThem = function (ds) {
    G.xpDA[ds].push(ds === 'nhanVat' ? {id: ma('nv'), ten: 'Nhân vật mới', moTa: '', prompt: ''} : {id: ma('bc'), ten: 'Bối cảnh mới', prompt: ''});
    luuDuAn(); veLai();
  };
  G.xpXoa = function (ds, id) {
    G.xpDA[ds] = G.xpDA[ds].filter(function (x) { return x.id !== id; }); luuDuAn(); veLai();
  };
  G.xpTach = function () {
    var cu = G.xpDA.canh;
    G.xpDA.canh = G.xpTachKichBan(G.xpDA.kichBan, G.xpDA);
    /* Giữ clip đã gắn theo thứ tự cảnh */
    G.xpDA.canh.forEach(function (c, i) { if (cu[i] && cu[i].clip) c.clip = cu[i].clip; });
    luuDuAn(); veLai();
    U.toast('Đã tách ' + G.xpDA.canh.length + ' cảnh quay.', 'ok');
  };
  G.xpDuAnMoi = function (mau) {
    if (!confirm(mau ? 'Nạp lại dự án mẫu? Dự án đang mở sẽ bị thay.' : 'Tạo dự án trống? Dự án đang mở sẽ bị thay.')) return;
    var m = duAnMau();
    if (!mau) { m.ten = 'Phim mới'; m.nhanVat = []; m.boiCanh = []; m.kichBan = ''; }
    m.canh = G.xpTachKichBan(m.kichBan, m); G.xpDA = m; luuDuAn(); veLai();
  };
  G.xpDoiCho = function (i, d) {
    var ds = G.xpDA.canh, j = i + d; if (j < 0 || j >= ds.length) return;
    var t = ds[i]; ds[i] = ds[j]; ds[j] = t; luuDuAn(); veLai();
  };

  /* ══ MÀN ══ */
  function o_(lbl, val, fn, kieu) {
    return '<label>' + lbl + ' <input type="' + (kieu || 'text') + '" value="' + h(String(val == null ? '' : val)) + '" oninput="' + fn + '"></label>';
  }
  G.VIEWS['xuong-phim'] = function () {
    var da = G.xpDA, o = '';
    o += '<div class="hd"><h2>' + ic('spark') + ' Xưởng phim ngắn AI · phim dọc 9:16</h2>' +
      '<p class="sub">Viết kịch bản → máy soạn prompt cho từng cảnh → bạn tạo clip bằng công cụ video AI → nạp clip vào đây ' +
      '→ máy lắp phụ đề, logo, số tập, nhạc và xuất thành phim. Clip, ảnh và nhạc xử lý ngay trên máy, không tải lên đâu.</p></div>';
    o += '<div class="man-xu">';
    if (G.xpBoView) o += G.xpBoView();
    if (G.xpTuDongView) o += G.xpTuDongView();

    /* Hướng dẫn nhanh */
    o += '<details class="giay"' + (da.anHuongDan ? '' : ' open') + ' ontoggle="G.xpSua(\'anHuongDan\',!this.open)"><summary><b>Cách làm một tập phim (đọc một lần)</b></summary>' +
      '<ol class="note">' +
      '<li><b>Sổ nhân vật:</b> mỗi nhân vật một câu mô tả ngoại hình bằng tiếng Anh (tuổi, tóc, trang phục). Giữ nguyên câu này suốt cả bộ phim để gương mặt không đổi.</li>' +
      '<li><b>Kịch bản:</b> dòng <code># Tên bối cảnh</code> · dòng <code>[Cận cảnh, đẩy máy vào] hành động</code> mở một cảnh · dòng <code>Tên: lời thoại</code> · dòng <code>TIN NHẮN: Tên: nội dung</code> cho cảnh điện thoại. Bấm <b>Tách kịch bản thành cảnh</b>.</li>' +
      '<li><b>Tạo ảnh nhân vật trước:</b> trong gói prompt có "Prompt chân dung". Tạo 1 ảnh chân dung cho mỗi nhân vật, lưu lại làm ảnh tham chiếu.</li>' +
      '<li><b>Tạo clip từng cảnh:</b> mở công cụ video AI, chọn khổ <b>9:16</b>, dùng chức năng ảnh → video (image-to-video) hoặc "nhân vật tham chiếu", dán prompt VIDEO của cảnh. Tải clip về, đặt tên <code>canh-01.mp4</code>, <code>canh-02.mp4</code>…</li>' +
      '<li><b>Nạp clip:</b> chọn tất cả clip một lượt — máy tự xếp theo tên tệp vào các cảnh. Thêm logo và nhạc nền nếu có.</li>' +
      '<li><b>Xem thử</b> rồi <b>Xuất phim</b> (Chrome/Edge trên máy tính). Máy ghi theo thời gian thực: phim 3 phút thì chờ 3 phút, giữ tab mở.</li></ol>' +
      '<p class="note"><b>Công cụ tạo clip AI (bạn tự đăng ký, dùng tài khoản của mình):</b> Kling AI (klingai.com) · Hailuo / MiniMax (hailuoai.video) · ' +
      'Google Veo (qua Gemini / Flow) · Runway (runwayml.com) · Pika (pika.art). Phần lớn có lượt dùng thử miễn phí mỗi ngày; muốn làm nhiều tập thì cần gói trả phí. ' +
      'Lời thoại tiếng Việt: đưa vào phụ đề (máy tự đè), hoặc tự thu giọng rồi trộn làm nhạc nền.</p>' +
      '<p class="note"><b>Bản quyền:</b> hãy dùng câu chuyện và nhân vật của chính bạn. Không đăng lại phim, nhân vật, logo của đơn vị khác; không dùng gương mặt người thật khi chưa được đồng ý.</p></details>';

    /* 1 · Thông tin phim */
    o += '<div class="giay"><h3>1 · Thông tin phim</h3><div class="row">' +
      o_('Tên phim', da.ten, "G.xpSua('ten',this.value)") +
      o_('Tập số', da.tap, "G.xpSua('tap',this.value)", 'number') +
      o_('Chữ logo góc trái', da.logo, "G.xpSua('logo',this.value)") +
      '<label>Độ nét <select onchange="G.xpSua(\'khung\',this.value)">' +
      ['720x1280', '1080x1920'].map(function (k) { return '<option' + (k === da.khung ? ' selected' : '') + '>' + k + '</option>'; }).join('') +
      '</select></label></div>' +
      '<label>Phong cách hình (tiếng Anh, dùng chung mọi cảnh) <textarea rows="2" oninput="G.xpSua(\'phongCach\',this.value)">' + h(da.phongCach) + '</textarea></label>' +
      '<div class="row"><button class="btn" onclick="G.xpDuAnMoi(false)">Dự án trống</button>' +
      '<button class="btn" onclick="G.xpDuAnMoi(true)">Nạp lại dự án mẫu</button></div></div>';

    /* 2 · Sổ nhân vật & bối cảnh */
    o += '<div class="giay"><h3>2 · Sổ nhân vật</h3>';
    da.nhanVat.forEach(function (n) {
      o += '<div class="row">' + o_('Tên', n.ten, "G.xpSuaDS('nhanVat','" + h(n.id) + "','ten',this.value)") +
        o_('Ghi chú (tiếng Việt)', n.moTa, "G.xpSuaDS('nhanVat','" + h(n.id) + "','moTa',this.value)") +
        '<button class="btn" onclick="G.xpXoa(\'nhanVat\',\'' + h(n.id) + '\')">Xoá</button></div>' +
        '<label>Ngoại hình cố định (tiếng Anh) <textarea rows="2" oninput="G.xpSuaDS(\'nhanVat\',\'' + h(n.id) + '\',\'prompt\',this.value)">' + h(n.prompt) + '</textarea></label>';
    });
    o += '<button class="btn" onclick="G.xpThem(\'nhanVat\')">+ Thêm nhân vật</button>';
    o += '<h3>Bối cảnh</h3>';
    da.boiCanh.forEach(function (b) {
      o += '<div class="row">' + o_('Tên (khớp dòng # trong kịch bản)', b.ten, "G.xpSuaDS('boiCanh','" + h(b.id) + "','ten',this.value)") +
        '<button class="btn" onclick="G.xpXoa(\'boiCanh\',\'' + h(b.id) + '\')">Xoá</button></div>' +
        '<label>Mô tả bối cảnh (tiếng Anh) <textarea rows="2" oninput="G.xpSuaDS(\'boiCanh\',\'' + h(b.id) + '\',\'prompt\',this.value)">' + h(b.prompt) + '</textarea></label>';
    });
    o += '<button class="btn" onclick="G.xpThem(\'boiCanh\')">+ Thêm bối cảnh</button></div>';

    /* 3 · Kịch bản */
    o += '<div class="giay"><h3>3 · Kịch bản</h3>' +
      '<textarea rows="12" oninput="G.xpSua(\'kichBan\',this.value)">' + h(da.kichBan) + '</textarea>' +
      '<div class="row"><button class="btn btn-chinh" onclick="G.xpTach()">Tách kịch bản thành cảnh</button>' +
      '<button class="btn" onclick="G.xpLuuChu(\'prompt\')">Lưu gói prompt (.txt)</button>' +
      '<button class="btn" onclick="G.xpLuuChu(\'srt\')">Lưu phụ đề (.srt)</button></div></div>';

    /* 4 · Cảnh quay & prompt */
    var vPhim = Object.keys(G.xpVat).filter(function (k) { return G.xpVat[k].loai === 'phim' || G.xpVat[k].loai === 'anh'; });
    o += '<div class="giay"><h3>4 · ' + da.canh.length + ' cảnh quay · ' + Math.round(tongGiay()) + ' giây</h3>';
    da.canh.forEach(function (c, i) {
      var p = G.xpPrompt(c), bc = boiCanhCua(c);
      o += '<details class="giay xu-canh"><summary><b>Cảnh ' + (i + 1) + '</b> · ' + h(bc.ten) + ' · ' + h(c.chiDao || '—') + ' · ' +
        h(String(c.giay)) + 's' + (c.clip && G.xpVat[c.clip] ? ' · ✓ ' + h(G.xpVat[c.clip].ten) : ' · <em>chưa có clip</em>') + '</summary>' +
        '<p class="note">' + h(c.hanhDong) + '</p>' +
        (c.thoai.length ? '<p class="note">' + c.thoai.map(function (t) { return '<b>' + h(t.ai) + ':</b> ' + h(t.loi); }).join('<br>') + '</p>' : '') +
        (c.tinNhan.length ? '<p class="note">Tin nhắn: ' + c.tinNhan.map(function (t) { return h(t.ai + ': ' + t.loi); }).join(' · ') + '</p>' : '') +
        (p.nv.length ? '' : '<p class="note">⚠ Không thấy tên nhân vật nào trong cảnh — nhắc tên nhân vật trong hành động để prompt có mô tả ngoại hình.</p>') +
        '<label>Prompt ảnh mở đầu <textarea rows="3" readonly class="cho-chep">' + h(p.anh) + '</textarea></label>' +
        '<label>Prompt video <textarea rows="3" readonly class="cho-chep">' + h(p.video) + '</textarea></label>' +
        '<div class="row"><button class="btn" onclick="G.xpChep(' + i + ',\'anh\')">Chép prompt ảnh</button>' +
        '<button class="btn" onclick="G.xpChep(' + i + ',\'video\')">Chép prompt video</button>' +
        '<label>Giây <input type="number" min="1" max="60" value="' + h(String(c.giay)) + '" onchange="G.xpSuaDS(\'canh\',\'' + h(c.id) + '\',\'giay\',this.value);G.render()"></label>' +
        '<label>Clip <select onchange="G.xpSuaDS(\'canh\',\'' + h(c.id) + '\',\'clip\',this.value);G.render()"><option value="">— chưa có —</option>' +
        vPhim.map(function (k) { return '<option value="' + h(k) + '"' + (k === c.clip ? ' selected' : '') + '>' + h(G.xpVat[k].ten) + '</option>'; }).join('') +
        '</select></label>' +
        '<button class="btn" onclick="G.xpDoiCho(' + i + ',-1)">↑</button><button class="btn" onclick="G.xpDoiCho(' + i + ',1)">↓</button></div></details>';
    });
    o += '</div>';

    /* 5 · Nạp clip & dựng */
    o += '<div class="giay"><h3>5 · Nạp clip, dựng và xuất phim</h3>' +
      '<div class="row"><label>Clip các cảnh (chọn nhiều) <input type="file" accept="video/*,image/*" multiple onchange="G.xpNhanTep(this.files,\'clip\')"></label>' +
      '<label>Logo (ảnh PNG) <input type="file" accept="image/*" onchange="G.xpNhanTep(this.files,\'logo\')"></label>' +
      '<label>Nhạc nền <input type="file" accept="audio/*" onchange="G.xpNhanTep(this.files,\'nhac\')"></label></div>' +
      '<div class="row">' + o_('Âm lượng clip (0–1)', da.amLuongClip == null ? 1 : da.amLuongClip, "G.xpSua('amLuongClip',this.value)", 'number') +
      o_('Âm lượng nhạc (0–1)', da.amLuongNhac == null ? 0.25 : da.amLuongNhac, "G.xpSua('amLuongNhac',this.value)", 'number') +
      '<label><input type="checkbox"' + (da.theoClip ? ' checked' : '') + ' onchange="G.xpSua(\'theoClip\',this.checked);G.render()"> Thời lượng cảnh theo độ dài clip</label></div>' +
      (G.xpDA.nhac && G.xpVat[G.xpDA.nhac] ? '<p class="note">Nhạc nền: ' + h(G.xpVat[G.xpDA.nhac].ten) + '</p>' : '') +
      '<p class="note">Clip chỉ nằm trong bộ nhớ của tab này — tải lại trang thì cần nạp lại (kịch bản và prompt vẫn được giữ).</p>' +
      '<canvas id="xp-man" style="width:100%;max-width:300px;aspect-ratio:9/16;background:#000;display:block;margin:8px 0;border-radius:8px"></canvas>' +
      '<p class="note" id="xp-tt"></p>' +
      '<div class="row"><button class="btn" id="xp-nut-phat" onclick="G.xpPhat(false)">' + (chay && !chay.dung ? 'Dừng' : 'Xem thử cả tập') + '</button>' +
      '<button class="btn btn-chinh" onclick="G.xpXuat()">Xuất phim</button></div></div>';

    o += '</div>';
    setTimeout(function () {
      var cv = document.getElementById('xp-man');
      if (cv && !(chay && !chay.dung)) { var K = kichThuoc(); cv.width = K.w; cv.height = K.h; G.xpVeKhung(cv.getContext('2d'), da.canh[0], 1, 5, 1); }
    }, 0);
    return o;
  };
})();
