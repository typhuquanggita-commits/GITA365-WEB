/* ═════════════════════════════════════════════════
   GITA 365 · XƯỞNG PHIM AI — CẮT CẢNH THEO NHỊP NHẠC

   Nạp một bài nhạc và một bộ ảnh/clip. Máy nghe nhạc, tìm nhịp, rồi đặt
   mỗi chỗ chuyển cảnh đúng vào một nhịp. Xem thử ngay, xuất ra .webm.

   Chạy HOÀN TOÀN trên thiết bị (Web Audio + Canvas + MediaRecorder):
   nhạc, ảnh, clip không rời máy, không gọi máy chủ, không dịch vụ AI
   ngoài. Không đụng studio.js. View con của 'xuong-ai' (G.catNhip.ve).

   Vì sao dò nhịp ở đây chứ không dùng thư viện: thư viện nghe nhạc tốt
   đều nặng vài trăm KB và phải tải từ mạng. Thuật toán dưới đây (năng
   lượng → dòng khởi âm → tự tương quan ra BPM → căn pha lưới nhịp) đủ cho
   nhạc nền có trống rõ — đúng loại nhạc phim ngắn hay dùng. Nhạc không
   có nhịp rõ (piano tự do, nhạc nền không trống) thì máy NÓI THẲNG độ tin
   thấp và cho người chỉnh tay BPM, không lặng lẽ cắt sai.

   timNhip() là hàm thuần (nhận mẫu âm thanh, trả nhịp), không chạm DOM,
   nên tools/thu-xuong-ai.mjs thử được trên Node bằng tín hiệu tự dựng.
   ═════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
var U = G.U || {}, h = U.h || function(s){ return String(s == null ? '' : s); };

/* ════════ DÒ NHỊP — hàm thuần ════════ */
var KHUNG = 1024, BUOC = 512;

/* Dòng khởi âm: năng lượng từng khung, lấy phần TĂNG so với khung trước.
   Tiếng trống là một cú tăng năng lượng đột ngột; tiếng đàn ngân là năng
   lượng đều — lấy phần tăng thì giữ trống, bỏ ngân. */
function dongKhoiAm(kenh, sr){
  var n = Math.max(0, Math.floor((kenh.length - KHUNG) / BUOC) + 1);
  var nl = new Float32Array(n), ka = new Float32Array(n);
  for (var i = 0; i < n; i++){
    var s = 0, o = i * BUOC;
    for (var j = 0; j < KHUNG; j++){ var v = kenh[o + j]; s += v * v; }
    nl[i] = Math.sqrt(s / KHUNG);
  }
  for (var k = 1; k < n; k++){ var d = nl[k] - nl[k - 1]; ka[k] = d > 0 ? d : 0; }
  return { ka: ka, fps: sr / BUOC };
}

/* Làm mượt và bỏ trung bình. Mượt: một cú trống hay rơi lệch nửa khung,
   lúc khung này lúc khung kia — không mượt thì chu kỳ 21,5 khung chẳng
   khớp 21 cũng chẳng khớp 22, và máy chọn nhầm chu kỳ GẤP ĐÔI (43 khung,
   khớp gần trọn) — 120 nhịp/phút đọc ra 60. Bỏ trung bình: để tự tương
   quan của tiếng ồn quanh 0, nhờ đó độ tin nói đúng "không có nhịp". */
function chuanHoa(ka){
  var n = ka.length, z = new Float32Array(n), tb = 0;
  for (var i = 0; i < n; i++){
    var m = (ka[i - 1] || 0) + 2 * ka[i] + (ka[i + 1] || 0);
    z[i] = m / 4; tb += z[i];
  }
  tb = tb / (n || 1);
  for (var k = 0; k < n; k++) z[k] -= tb;
  return z;
}
/* Tự tương quan ở độ trễ LẺ (nội suy tuyến tính), chia cho năng lượng:
   ra hệ số từ -1 tới 1, so được giữa hai bài khác nhau. */
function tuongQuan(z, lag, r0){
  var s = 0, f = Math.floor(lag), p = lag - f;
  for (var i = f + 1; i < z.length; i++) s += z[i] * (z[i - f] * (1 - p) + z[i - f - 1] * p);
  return r0 ? s / r0 : 0;
}

/* BPM: quét 60–180 nhịp/phút từng 0,25. Ưu tiên nhẹ vùng 90–140 (nhịp hay
   gặp của nhạc nền); chu kỳ chậm dưới 90 mà gấp đôi tốc độ vẫn khớp gần
   bằng thì lấy tốc độ gấp đôi — cùng một bài, cắt dày hơn dễ thưa lại
   bằng "cắt mỗi N nhịp", cắt thưa thì không dày lên được. */
function uocBpm(z, fps){
  var r0 = 0;
  for (var q = 0; q < z.length; q++) r0 += z[q] * z[q];
  if (!r0) return { bpm: 0, tin: 0 };
  var tot = -1, botBpm = 0, botR = 0;
  for (var bpm = 60; bpm <= 180; bpm += 0.25){
    var r = tuongQuan(z, fps * 60 / bpm, r0);
    var w = r * ((bpm >= 90 && bpm <= 140) ? 1.12 : 1);
    if (w > tot){ tot = w; botBpm = bpm; botR = r; }
  }
  if (botBpm < 90){
    var r2 = tuongQuan(z, fps * 60 / (botBpm * 2), r0);
    if (r2 >= 0.85 * botR){ botBpm = botBpm * 2; botR = r2; }
  }
  return { bpm: botBpm, tin: Math.max(0, botR) };
}

/* Căn pha: trong một chu kỳ nhịp, chọn điểm bắt đầu sao cho lưới nhịp
   trùng nhiều khởi âm nhất. */
function canPha(ka, fps, bpm){
  var chuKy = fps * 60 / bpm, tot = -1, pha = 0;
  for (var p = 0; p < chuKy; p += 0.25){
    var s = 0;
    for (var t = p; t < ka.length - 1; t += chuKy){
      var f = Math.floor(t), d = t - f;
      s += (ka[f] || 0) * (1 - d) + (ka[f + 1] || 0) * d;
    }
    if (s > tot){ tot = s; pha = p; }
  }
  return pha / fps;
}

/* Tinh chỉnh bằng các đỉnh khởi âm thật: lưới quét theo bước 0,25 nhịp/
   phút và khung đo 23 mili-giây thì sai lệch tích luỹ — sau 40 nhịp lệch
   gần một phần tư nhịp. Lấy các đỉnh rõ (nội suy parabol để vượt độ phân
   giải khung), gán mỗi đỉnh vào nhịp gần nhất, rồi khớp đường thẳng bình
   phương nhỏ nhất: độ dốc là chu kỳ thật, hệ số chặn là pha thật. */
function tinhChinh(z, fps, chuKy, coDinh){
  var mx = 0, dinh = [];
  for (var i = 0; i < z.length; i++) if (z[i] > mx) mx = z[i];
  for (var k = 1; k < z.length - 1; k++){
    if (z[k] > 0.3 * mx && z[k] > z[k - 1] && z[k] >= z[k + 1]){
      var a = z[k - 1], b = z[k], c = z[k + 1], mau = a - 2 * b + c;
      dinh.push((k + (mau ? 0.5 * (a - c) / mau : 0)) / fps);
    }
  }
  if (dinh.length < 8) return null;
  var n = [], sn = 0, st = 0, snn = 0, snt = 0, m = dinh.length;
  /* Đánh số nhịp theo KHOẢNG GIỮA HAI ĐỈNH LIỀN NHAU, không theo khoảng
     cách tới đỉnh đầu: chu kỳ thô lệch 2% thì sau 40 nhịp đã lệch gần
     một nhịp, làm tròn từ đỉnh đầu sẽ gán sai số nhịp ở cuối bài. Từng
     khoảng một thì sai 2% không bao giờ đủ để làm tròn nhầm. */
  n[0] = 0;
  for (var j = 1; j < m; j++){ n[j] = n[j - 1] + Math.max(1, Math.round((dinh[j] - dinh[j - 1]) / chuKy)); }
  for (var q = 0; q < m; q++){ sn += n[q]; st += dinh[q]; snn += n[q] * n[q]; snt += n[q] * dinh[q]; }
  var P = coDinh ? chuKy : (m * snt - sn * st) / (m * snn - sn * sn);
  if (!(P > 0) || Math.abs(P - chuKy) / chuKy > 0.08) return null;
  var a0 = (st - P * sn) / m;
  return { chuKy: P, pha: ((a0 % P) + P) % P };
}

/* timNhip(mẫu âm, tần số mẫu [, bpmTay]) → { bpm, tin, nhip:[giây…], dai } */
function timNhip(kenh, sr, bpmTay){
  var dai = kenh.length / sr;
  var dk = dongKhoiAm(kenh, sr);
  var z = chuanHoa(dk.ka);
  var u = uocBpm(z, dk.fps);
  var bpm = bpmTay > 0 ? bpmTay : u.bpm;
  if (!bpm) return { bpm: 0, tin: 0, nhip: [], dai: dai };
  var pha = canPha(z, dk.fps, bpm), buoc = 60 / bpm, nhip = [];
  var tc = tinhChinh(z, dk.fps, buoc, bpmTay > 0);
  if (tc){ buoc = tc.chuKy; pha = tc.pha; bpm = 60 / buoc; }
  /* Bù độ trễ của khung đo: khung thứ i phủ mẫu [512i, 512i+1024], nên cú
     trống làm năng lượng nhảy ở khung bắt đầu SỚM hơn nó trung bình
     1024 − 256 mẫu. Không bù thì mọi điểm cắt rơi sớm ~35 mili-giây —
     đủ để mắt thấy hình đổi trước tiếng trống. */
  pha = (pha + (KHUNG - BUOC / 2) / sr) % buoc;
  for (var t = pha; t < dai; t += buoc) nhip.push(Math.round(t * 1000) / 1000);
  return { bpm: Math.round(bpm * 10) / 10, tin: Math.round(u.tin * 100) / 100, nhip: nhip, dai: dai };
}

/* Điểm cắt: mỗi N nhịp một lần chuyển, từ giây bắt đầu. Đoạn cuối luôn
   kết ở hết bài để phim không cụt giữa câu nhạc. */
function diemCat(nhip, moiN, tuGiay, dai){
  var ds = [], n = Math.max(1, moiN | 0), tu = +tuGiay || 0;
  var lo = nhip.filter(function(t){ return t >= tu; });
  for (var i = 0; i < lo.length; i += n) ds.push(lo[i]);
  if (!ds.length || ds[0] > tu + 0.05) ds.unshift(tu);
  var doan = [];
  for (var k = 0; k < ds.length; k++){
    var a = ds[k], b = k + 1 < ds.length ? ds[k + 1] : dai;
    if (b - a > 0.05) doan.push({ tu: a, den: b });
  }
  return doan;
}

/* ════════ TRẠNG THÁI (chỉ trong bộ nhớ tab — nhạc và ảnh không lưu) ════════
   gan[i] = chỉ số tệp đặt vào cảnh i; vắng thì cảnh i lấy tệp i theo vòng. */
var S = { nhac: null, ten: '', kq: null, doan: [], moiN: 2, tuGiay: 0, bpmTay: 0, vat: [], gan: {}, tua: 0,
          dangChay: false, ghi: null };
var AC = null, raf = 0, nguon = null;
function ac(){ return (AC = AC || new (window.AudioContext || window.webkitAudioContext)()); }

var KHUNG_XUAT = { '9:16': [720, 1280], '16:9': [1280, 720], '1:1': [1080, 1080], '4:5': [864, 1080] };
function khung(){ return KHUNG_XUAT[G.S && G.S.xaKhung] || KHUNG_XUAT['9:16']; }

/* Trộn mọi kênh thành một trước khi dò: nhạc nhiều bài để trống lệch
   sang một bên, nghe mỗi kênh trái là nghe thiếu. */
function kenhTron(buf){
  if (buf.numberOfChannels < 2) return buf.getChannelData(0);
  var n = buf.length, ra = new Float32Array(n), c = buf.numberOfChannels;
  for (var k = 0; k < c; k++){ var d = buf.getChannelData(k); for (var i = 0; i < n; i++) ra[i] += d[i] / c; }
  return ra;
}
var KENH = null;
function tinhLai(){
  if (!S.nhac) return;
  S.kq = timNhip(KENH, S.nhac.sampleRate, +S.bpmTay || 0);
  S.doan = diemCat(S.kq.nhip, S.moiN, S.tuGiay, S.kq.dai);
  if (S.tua < S.tuGiay || S.tua > S.kq.dai) S.tua = S.tuGiay;
}
function vatCuaDoan(i){
  if (!S.vat.length) return null;
  var g = S.gan[i];
  return S.vat[(g != null && g < S.vat.length ? g : i) % S.vat.length];
}

/* ════════ NẠP ════════ */
G.catNhip = G.catNhip || {};
G.catNhip.timNhip = timNhip;
G.catNhip.diemCat = diemCat;

function dangGhi(){
  if (!S.ghi) return false;
  U.toast && U.toast('Đang ghi phim — chờ ghi xong hoặc bấm Dừng để huỷ bản ghi.', 'err');
  return true;
}
G.catNhip.napNhac = function(inp){
  var f = inp.files && inp.files[0]; if (!f || dangGhi()) return;
  G.catNhip.dung();
  S.ten = f.name;
  f.arrayBuffer().then(function(b){ return ac().decodeAudioData(b); })
    .then(function(buf){ S.nhac = buf; KENH = kenhTron(buf); S.gan = {}; S.tua = 0; tinhLai(); G.catNhip.veLai();
      U.toast && U.toast('Đã nghe xong bài nhạc — tìm thấy ' + S.kq.nhip.length + ' nhịp.', 'ok'); })
    .catch(function(){ U.toast && U.toast('Không đọc được tệp nhạc này. Thử MP3 hoặc WAV.', 'err'); });
};
G.catNhip.napVat = function(inp){
  var fs = [].slice.call(inp.files || []), con = fs.length, hong = [];
  if (!con || dangGhi()) return;
  function xong(){
    if (--con > 0) return;
    S.vat.sort(function(a, b){ return a.ten.localeCompare(b.ten); });
    if (hong.length) U.toast && U.toast('Không đọc được ' + hong.length + ' tệp: ' + hong.join(', '), 'err');
    G.catNhip.veLai();
  }
  fs.forEach(function(f){
    var la = /^video\//.test(f.type) ? 'clip' : (/^image\//.test(f.type) ? 'anh' : '');
    if (!la){ hong.push(f.name); xong(); return; }
    var fr = new FileReader();
    fr.onerror = function(){ hong.push(f.name); xong(); };
    fr.onload = function(){
      var v = { ten: f.name, loai: la, src: fr.result, el: null };
      if (la === 'anh'){
        var im = new Image();
        /* Ảnh thu nhỏ 96px cho dải cảnh — nhúng ảnh gốc vào mỗi ô thì một
           phim 40 cảnh kéo theo vài chục MB chữ trong trang. */
        im.onload = function(){
          try {
            var tc = document.createElement('canvas'), tl = 96 / Math.max(im.naturalWidth, im.naturalHeight);
            tc.width = Math.max(1, Math.round(im.naturalWidth * tl)); tc.height = Math.max(1, Math.round(im.naturalHeight * tl));
            tc.getContext('2d').drawImage(im, 0, 0, tc.width, tc.height);
            v.nho = tc.toDataURL('image/jpeg', 0.7);
            if (document.getElementById('cn-goc') && !S.dangChay) G.catNhip.veLai();
          } catch (e) {}
        };
        im.src = fr.result; v.el = im;
      }
      else { var vd = document.createElement('video'); vd.src = fr.result; vd.muted = true; vd.playsInline = true; vd.preload = 'auto'; v.el = vd; }
      S.vat.push(v); xong();
    };
    fr.readAsDataURL(f);
  });
};
G.catNhip.xoaVat = function(i){ if (dangGhi()) return; S.vat.splice(i, 1); S.gan = {}; G.catNhip.veLai(); };
G.catNhip.dat = function(k, v){
  if (dangGhi()) return;
  G.catNhip.dung();
  S[k] = (k === 'moiN' || k === 'bpmTay' || k === 'tuGiay') ? Math.max(0, +v || 0) : v;
  if (k === 'moiN' && S.moiN < 1) S.moiN = 1;
  S.gan = {};
  tinhLai(); G.catNhip.veLai();
};
/* Đổi tệp của một cảnh: bấm ô cảnh trên dải để lấy tệp kế tiếp. */
G.catNhip.doiVat = function(i){
  if (dangGhi() || !S.vat.length) return;
  var cu = S.gan[i] != null ? S.gan[i] : i % S.vat.length;
  S.gan[i] = (cu + 1) % S.vat.length;
  S.tua = S.doan[i] ? S.doan[i].tu : S.tua;
  G.catNhip.veLai();
};

/* ════════ VẼ MỘT KHUNG HÌNH ════════ */
function doanTai(t){
  var i = 0;
  while (i < S.doan.length - 1 && t >= S.doan[i].den) i++;
  return i;
}
function veKhung(x, W, H, t, dangPhat){
  x.fillStyle = '#000'; x.fillRect(0, 0, W, H);
  if (!S.doan || !S.doan.length || !S.vat.length) return;
  var i = doanTai(t), d = S.doan[i], v = vatCuaDoan(i), el = v && v.el;
  if (!el) return;
  var tien = Math.max(0, Math.min(1, (t - d.tu) / Math.max(0.05, d.den - d.tu)));
  var w0 = el.videoWidth || el.naturalWidth || el.width, h0 = el.videoHeight || el.naturalHeight || el.height;
  if (!w0 || !h0) return;
  if (v.loai === 'clip' && dangPhat && el.paused){ try { el.currentTime = 0; el.play(); } catch (e) {} }
  /* Lấp đầy khung (cắt mép, không méo) + đẩy máy chậm 4% — ảnh tĩnh đứng
     im trông như trình chiếu; chuyển động nhỏ đủ để thấy là phim. */
  var tl = Math.max(W / w0, H / h0) * (1 + 0.04 * tien);
  var dw = w0 * tl, dh = h0 * tl;
  x.drawImage(el, (W - dw) / 2, (H - dh) / 2, dw, dh);
  /* Nháy sáng 80 mili-giây ở mỗi điểm cắt — mắt bắt được cú cắt đúng nhịp. */
  var sau = t - d.tu;
  if (i > 0 && sau >= 0 && sau < 0.08){ x.save(); x.globalAlpha = 0.35 * (1 - sau / 0.08); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.restore(); }
}

function cv(){ return document.getElementById('cn-cv'); }
function veTinh(){
  var c = cv(); if (!c || !S.kq) return;
  var k = khung(); c.width = k[0]; c.height = k[1];
  veKhung(c.getContext('2d'), c.width, c.height, S.tua, false);
  veViTri(S.tua);
}

function choi(ghiLai){
  if (S.ghi){ dangGhi(); return; }
  if (!S.nhac){ U.toast && U.toast('Nạp một bài nhạc trước.', 'err'); return; }
  if (!S.vat.length){ U.toast && U.toast('Nạp ít nhất một ảnh hoặc clip.', 'err'); return; }
  G.catNhip.dung();
  var c = cv(); if (!c) return;
  var k = khung(); c.width = k[0]; c.height = k[1];
  var x = c.getContext('2d'), ctx = ac();
  ctx.resume();
  nguon = ctx.createBufferSource(); nguon.buffer = S.nhac;
  /* Phim bắt đầu ở "Bắt đầu từ giây" khi xuất; xem thử thì từ chỗ đang tua. */
  var tu = ghiLai ? S.tuGiay : Math.max(S.tuGiay, S.tua >= S.kq.dai - 0.2 ? S.tuGiay : S.tua);
  var mr = null, manh = [];
  if (ghiLai){
    if (!c.captureStream || typeof MediaRecorder === 'undefined'){
      U.toast && U.toast('Trình duyệt này chưa xuất được video. Dùng Chrome hoặc Edge trên máy tính.', 'err'); nguon = null; return; }
    var dest = ctx.createMediaStreamDestination();
    nguon.connect(dest);
    var st = new MediaStream(c.captureStream(30).getVideoTracks().concat(dest.stream.getAudioTracks()));
    var mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
    mr = new MediaRecorder(st, { mimeType: mime }); S.ghi = mr;
    mr.ondataavailable = function(e){ if (e.data.size) manh.push(e.data); };
    mr.onstop = function(){
      var du = mr._du; S.ghi = null;
      if (!du){ U.toast && U.toast('Đã huỷ bản ghi dở.', 'ok'); return; }
      var fr = new FileReader();
      fr.onload = function(){ var a = document.createElement('a'); a.download = 'gita-cat-nhip-' + Date.now() + '.webm'; a.href = fr.result; a.click();
        U.toast && U.toast('Đã xuất phim cắt theo nhịp (.webm).', 'ok'); };
      fr.readAsDataURL(new Blob(manh, { type: mime }));
    };
  }
  nguon.connect(ctx.destination);
  var t0 = ctx.currentTime + 0.05;
  nguon.start(t0, tu);
  if (mr) mr.start();
  S.dangChay = true;
  function nhip(){
    if (!S.dangChay) return;
    /* Rời màn thì dừng nhạc; màn vẽ lại thì đi theo khung xem mới. */
    var c2 = cv();
    if (!c2){ G.catNhip.dung(); return; }
    if (c2 !== c){
      if (mr){ G.catNhip.dung(); return; }
      c = c2; c.width = k[0]; c.height = k[1]; x = c.getContext('2d');
    }
    var t = tu + ctx.currentTime - t0;
    if (t >= S.kq.dai){ if (mr) mr._du = true; G.catNhip.dung(); S.tua = S.tuGiay; return; }
    S.tua = Math.max(tu, t);
    veKhung(x, c.width, c.height, S.tua, true);
    veViTri(S.tua);
    raf = requestAnimationFrame(nhip);
  }
  raf = requestAnimationFrame(nhip);
  if (ghiLai) U.toast && U.toast('Đang ghi phim theo thời gian thực — giữ tab này mở tới hết bài.', 'ok');
}
G.catNhip.xemThu = function(){ choi(false); };
G.catNhip.xuat = function(){ choi(true); };
G.catNhip.dung = function(){
  S.dangChay = false; cancelAnimationFrame(raf);
  try { if (nguon) nguon.stop(); } catch (e) {}
  nguon = null;
  try { if (S.ghi && S.ghi.state !== 'inactive') S.ghi.stop(); } catch (e2) {}
  S.vat.forEach(function(v){ if (v.loai === 'clip' && v.el) try { v.el.pause(); } catch (e3) {} });
};
/* Bấm lên dạng sóng để tua: khung xem nhảy tới đúng giây ấy. */
G.catNhip.tuaToi = function(ev){
  var c = document.getElementById('cn-truc'); if (!c || !S.kq || S.ghi) return;
  var r = c.getBoundingClientRect();
  S.tua = Math.max(0, Math.min(S.kq.dai, (ev.clientX - r.left) / r.width * S.kq.dai));
  if (S.dangChay){ G.catNhip.dung(); choi(false); } else veTinh();
};

/* ════════ TRỤC THỜI GIAN — dòng nhạc, nhịp, điểm cắt ════════ */
function veTruc(){
  var c = document.getElementById('cn-truc'); if (!c || !S.kq) return;
  var W = c.clientWidth || 600, H = 64; c.width = W; c.height = H;
  var x = c.getContext('2d'), cs = getComputedStyle(document.documentElement);
  var mau = function(k, d){ return (cs.getPropertyValue(k) || '').trim() || d; };
  x.clearRect(0, 0, W, H);
  var kenh = KENH, buoc = Math.max(1, Math.floor(kenh.length / W));
  x.fillStyle = mau('--line-2', '#ccc');
  for (var i = 0; i < W; i++){
    var mx = 0, o = i * buoc;
    for (var j = 0; j < buoc; j += 16){ var v = Math.abs(kenh[o + j] || 0); if (v > mx) mx = v; }
    var hh = Math.max(1, mx * (H - 10)); x.fillRect(i, (H - hh) / 2, 1, hh);
  }
  var dai = S.kq.dai;
  x.fillStyle = mau('--ink-4', '#888');
  S.kq.nhip.forEach(function(t){ x.fillRect(Math.round(t / dai * W), H - 6, 1, 6); });
  x.fillStyle = mau('--gita', '#2A72C6');
  S.doan.forEach(function(d){ x.fillRect(Math.round(d.tu / dai * W), 0, 2, H); });
  veViTri(S.tua);
  veTinh();
}
function veViTri(t){
  var m = document.getElementById('cn-vitri'); if (!m || !S.kq) return;
  m.style.left = Math.min(100, t / S.kq.dai * 100) + '%';
}

/* ════════ GIAO DIỆN ════════ */
G.catNhip.veLai = function(){
  var o = document.getElementById('cn-goc');
  if (o){ o.outerHTML = G.catNhip.ve(); setTimeout(veTruc, 0); }
};

function veDai(){
  /* Dải cảnh: mỗi ô rộng theo độ dài cảnh, mang ảnh thu nhỏ của tệp đặt vào.
     Bấm một ô để đổi sang tệp kế tiếp — dựng phim bằng cách xếp, không bằng gõ. */
  if (!S.kq || !S.doan.length || !S.vat.length) return '';
  var dai = S.kq.dai;
  return '<div class="cn-dai" role="list" aria-label="Các cảnh theo thời gian">' + S.doan.map(function(d, i){
    var v = vatCuaDoan(i), rong = Math.max(2, (d.den - d.tu) / dai * 100);
    var nen = v && v.nho ? ' style="flex-basis:' + rong + '%;background-image:url(' + v.nho + ')"' : ' style="flex-basis:' + rong + '%"';
    return '<button class="cn-dai-o' + (v && v.loai === 'clip' ? ' clip' : '') + '" role="listitem"' + nen +
      ' onclick="G.catNhip.doiVat(' + i + ')" title="Cảnh ' + (i + 1) + ' · ' + h(v ? v.ten : '') + ' — bấm để đổi tệp"' +
      ' aria-label="Cảnh ' + (i + 1) + ', ' + (Math.round((d.den - d.tu) * 10) / 10) + ' giây, ' + h(v ? v.ten : '') + '. Bấm để đổi tệp">' +
      '<span>' + (i + 1) + '</span></button>';
  }).join('') + '</div>';
}

G.catNhip.ve = function(){
  var kq = S.kq, k = khung(), ghi = !!S.ghi;
  var o = '<div id="cn-goc" class="cn">';
  o += '<div class="cn-buoc">' +
    '<label class="cn-nap"><b>1 · Nhạc</b><span class="tiny muted">' + (S.ten ? h(S.ten) : 'MP3 hoặc WAV, có trống rõ là tốt nhất') + '</span>' +
    '<span class="btn sm">Chọn bài nhạc</span><input type="file" accept="audio/*" onchange="G.catNhip.napNhac(this)"></label>' +
    '<label class="cn-nap"><b>2 · Ảnh / clip</b><span class="tiny muted">' + (S.vat.length ? S.vat.length + ' tệp · xếp theo tên' : 'Chọn nhiều tệp một lượt') + '</span>' +
    '<span class="btn sm">Chọn ảnh, clip</span><input type="file" accept="image/*,video/*" multiple onchange="G.catNhip.napVat(this)"></label>' +
    '</div>';

  if (kq){
    var tinThap = kq.tin < 0.3 && !(S.bpmTay > 0);
    o += '<div class="cn-so">' +
      '<div><span class="tiny muted">Nhịp/phút</span><b class="mono">' + (kq.bpm || '—') + '</b></div>' +
      '<div><span class="tiny muted">Số nhịp</span><b class="mono">' + kq.nhip.length + '</b></div>' +
      '<div><span class="tiny muted">Số cảnh</span><b class="mono">' + S.doan.length + '</b></div>' +
      '<div><span class="tiny muted">Độ dài</span><b class="mono">' + Math.round(kq.dai - S.tuGiay) + 's</b></div></div>';
    if (tinThap) o += '<p class="cn-bao">Bài này nhịp không rõ (độ tin ' + Math.round(kq.tin * 100) + '%) — máy có thể bắt lệch. Nếu biết nhịp/phút của bài, gõ vào ô bên dưới để cắt đúng.</p>';
  }

  /* Bàn dựng: khung xem ở trên, trục thời gian và dải cảnh ở dưới — đúng
     bố cục của phòng dựng: nhìn hình, thấy nhịp, xếp cảnh. */
  o += '<div class="cn-xem"><canvas id="cn-cv" width="' + k[0] + '" height="' + k[1] + '" style="aspect-ratio:' + k[0] + '/' + k[1] + '" aria-label="Khung xem thử phim"></canvas></div>';
  o += '<div class="row" style="gap:8px;flex-wrap:wrap">' +
    '<button class="btn pri" onclick="G.catNhip.xemThu()"' + (kq && S.vat.length && !ghi ? '' : ' disabled') + '>Xem thử</button>' +
    '<button class="btn" onclick="G.catNhip.dung()">Dừng' + (ghi ? ' (huỷ bản ghi)' : '') + '</button>' +
    '<button class="btn" onclick="G.catNhip.xuat()"' + (kq && S.vat.length && !ghi ? '' : ' disabled') + '>Xuất phim .webm</button></div>';
  if (kq){
    o += '<div class="cn-truc-boc"><canvas id="cn-truc" height="64" onclick="G.catNhip.tuaToi(event)" aria-label="Dạng sóng bài nhạc: vạch xanh là điểm cắt cảnh, bấm để tua tới giây ấy"></canvas><span id="cn-vitri" class="cn-vitri"></span></div>';
    o += veDai();
    o += '<div class="cn-chinh">' +
      '<label>Cắt mỗi <select onchange="G.catNhip.dat(\'moiN\',this.value)">' +
      [1, 2, 4, 8].map(function(n){ return '<option value="' + n + '"' + (n === S.moiN ? ' selected' : '') + '>' + n + ' nhịp</option>'; }).join('') + '</select></label>' +
      '<label>Bắt đầu từ giây <input type="number" min="0" step="0.5" value="' + S.tuGiay + '" onchange="G.catNhip.dat(\'tuGiay\',this.value)"></label>' +
      '<label>Nhịp/phút gõ tay <input type="number" min="0" step="0.1" placeholder="tự dò" value="' + (S.bpmTay || '') + '" onchange="G.catNhip.dat(\'bpmTay\',this.value)"></label>' +
      '</div>';
  }
  if (S.vat.length){
    o += '<details class="cn-ds"><summary class="sm">Danh sách tệp (' + S.vat.length + ')</summary><div class="cn-vat">' + S.vat.map(function(v, i){
      return '<div class="cn-vat-o"><span class="tiny">' + (i + 1) + ' · ' + h(v.ten) + '</span><button class="btn ghost sm" onclick="G.catNhip.xoaVat(' + i + ')" aria-label="Bỏ tệp ' + h(v.ten) + '">Bỏ</button></div>';
    }).join('') + '</div></details>';
  }
  o += '<p class="tiny muted mt">Khổ ' + h(G.S && G.S.xaKhung || '9:16') + ' · ' + k[0] + '×' + k[1] + ' — đổi ở mục "Mẫu & khổ hình". Nhạc, ảnh và clip chỉ nằm trong tab này, không gửi đi đâu; tải lại trang là phải nạp lại.</p>';
  o += '</div>';
  setTimeout(veTruc, 0);
  return o;
};
})();
