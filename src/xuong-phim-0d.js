/* ═══════════════════════════════════════════════════════════════
   GITA 365 · XƯỞNG PHIM 0 ĐỒNG — phía trình duyệt (9.99.253)

   Chủ hệ chốt: chuỗi video GITA không tốn một đồng nào. Mọi việc của
   xưởng phim tự động đi qua đây thay cho fal.ai trả phí:

     · llm / anh / anhSua → máy chủ GITA (phimMienPhi) → Workers AI
       miễn phí 10.000 neuron/ngày; máy chủ tự dừng trước khi vượt.
     · giong → Piper (mã nguồn mở) đọc tiếng Việt NGAY TRONG MÁY, không
       qua máy chủ, không gửi chữ ra ngoài. Mô hình giọng tải một lần
       (~90 MB) rồi nằm trong bộ nhớ đệm trình duyệt.

   ── NGOẠI LỆ C20 CÓ TÊN (chủ hệ chốt 10/10/2026) ──
   Luật C20: giọng là tệp có sẵn, máy chỉ trộn. Piper là chỗ máy SINH
   giọng, nên nó chỉ được đứng với ba điều kiện:
     1. Chỉ giọng KHO CÓ SẴN của Piper (vais1000 · vivos). KHÔNG nhái
        giọng một người cụ thể từ mẫu thu — không có đường nạp mẫu nào.
     2. Mọi giọng sinh ra mang cờ `tongHop`, và phim tự đè nhãn
        "Giọng đọc tổng hợp bằng máy" suốt thời lượng (xuong-phim.js).
     3. Phim đào tạo tự tay (giọng người thật) vẫn là đường ưu tiên số
        một; Piper chỉ dùng cho bản nháp và chuỗi phim 0 đồng.
     · Kết quả (ảnh, giọng) nằm trong IndexedDB của máy này, địa chỉ
       dạng "idb:…" — không thuê kho lưu trữ nào.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function () {
  var X = {};
  G.xp0d = X;
  X.trangThai = null;
  /* Bật trừ khi máy chủ nói rõ đã tắt chế độ 0 đồng */
  X.bat = function () { return !(X.trangThai && X.trangThai.ok && X.trangThai.chi0d === false); };

  /* ══ KHO TỆP TRONG MÁY (IndexedDB) ══ */
  var TEN_DB = 'gita-xuong-phim-0d', BANG = 'tep', dbHua = null, urlDem = {};
  function moDB() {
    if (!dbHua) dbHua = new Promise(function (ok, hong) {
      var r = indexedDB.open(TEN_DB, 1);
      r.onupgradeneeded = function () { r.result.createObjectStore(BANG); };
      r.onsuccess = function () { ok(r.result); };
      r.onerror = function () { dbHua = null; hong(r.error || new Error('không mở được IndexedDB')); };
    });
    return dbHua;
  }
  function giaoDich(che, f) {
    return moDB().then(function (db) {
      return new Promise(function (ok, hong) {
        var t = db.transaction(BANG, che), r = f(t.objectStore(BANG));
        t.oncomplete = function () { ok(r && r.result); };
        t.onerror = t.onabort = function () { hong(t.error || new Error('IndexedDB lỗi')); };
      });
    });
  }
  function maMoi(duoi) { return 'idb:' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10) + '.' + duoi; }
  X.ghi = function (blob, duoi) {
    var k = maMoi(duoi || 'bin');
    return giaoDich('readwrite', function (s) { return s.put(blob, k); }).then(function () {
      urlDem[k] = URL.createObjectURL(blob); return k;
    });
  };
  X.doc = function (k) {
    return giaoDich('readonly', function (s) { return s.get(k); }).then(function (b) {
      if (!b) throw new Error('Tệp đã mất khỏi máy này (' + k + ')');
      return b;
    });
  };
  X.laIdb = function (u) { return /^idb:/.test(String(u || '')); };
  /* Lấy tệp dù là idb:, data: hay https: */
  X.layBlob = function (u) {
    if (X.laIdb(u)) return X.doc(u);
    return fetch(u, {credentials: 'omit', cache: 'no-store'}).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status); return r.blob();
    });
  };
  /* Dùng trong <img src>: idb: → blob: (lần đầu trả ảnh trống rồi vẽ lại) */
  var TRONG = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==', dangDoc = {};
  X.src = function (u, veLai) {
    if (!X.laIdb(u)) return u || '';
    if (urlDem[u]) return urlDem[u];
    if (!dangDoc[u]) dangDoc[u] = X.doc(u).then(function (b) {
      urlDem[u] = URL.createObjectURL(b); if (typeof veLai === 'function') veLai();
    }, function () {});
    return TRONG;
  };

  function goi(fn, y) {
    return G.goiMayChu(fn, y).then(function (x) { return x || {ok: false, error: 'Máy chủ không trả lời.'}; },
      function (e) { return {ok: false, error: String(e && e.message || e || 'không gọi được máy chủ')}; });
  }

  /* ══ ẢNH THAM CHIẾU → JPEG ≤ 512 px, base64 (máy chủ nhận tối đa 4) ══ */
  function thuNho(blob) {
    return createImageBitmap(blob).then(function (bm) {
      var k = Math.min(1, 512 / Math.max(bm.width, bm.height));
      var c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(bm.width * k)); c.height = Math.max(1, Math.round(bm.height * k));
      c.getContext('2d').drawImage(bm, 0, 0, c.width, c.height);
      if (bm.close) bm.close();
      return c.toDataURL('image/jpeg', 0.85).split(',')[1];
    });
  }
  function b64Blob(s, kieu) {
    var nhi = atob(s), m = new Uint8Array(nhi.length);
    for (var i = 0; i < nhi.length; i++) m[i] = nhi.charCodeAt(i);
    return new Blob([m], {type: kieu || 'image/jpeg'});
  }
  function hatGiong(s) {
    var h = 2166136261; s = String(s || '');
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) % 2147483647;
  }

  function lamAnh(loai, dv) {
    var cao = dv.cao === true || /Pro$|Cao$/.test(loai);
    var refs = /^anhSua/.test(loai) ? (dv.anhThamChieu || []).slice(0, 4) : [];
    return Promise.all(refs.map(function (u) { return X.layBlob(u).then(thuNho); })).then(function (b64) {
      var y = {loai: 'anh', khung: dv.khung || '9:16', prompt: String(dv.prompt || '').slice(0, 3000),
        seed: hatGiong(dv.prompt)};
      if (cao) y.cao = true;
      if (b64.length) y.anhB64 = b64;
      return goi('phimMienPhi', y);
    }).then(function (x) {
      if (!x.ok) return x;
      var kieu = (x.kq && x.kq.kieu) || 'image/jpeg';
      return X.ghi(b64Blob(x.kq.anh, kieu), kieu === 'image/png' ? 'png' : kieu === 'image/webp' ? 'webp' : 'jpg')
        .then(function (k) { return {ok: true, kq: {url: k}, neuron: x.neuron}; });
    }, function (e) { return {ok: false, error: 'Không đọc được ảnh tham chiếu: ' + (e && e.message || e)}; });
  }

  /* ══ GIỌNG ĐỌC PIPER (chạy trong trình duyệt) ══
     Mọi tệp giọng tải từ Worker của GITA (R2 Cloudflare, đường /tn/);
     onnxruntime từ cdnjs.cloudflare.com (CDN của Cloudflare). */
  var ORT = 'https://cdnjs.cloudflare.com/ajax/libs/onnxruntime-web/1.18.0/';
  /* Dấu vân tay SHA-384 của ort.min.js 1.18.0 (lấy từ gói npm gốc). Trình duyệt
     từ chối chạy nếu tệp CDN bị tráo — không còn chạy mù mã của bên thứ ba.
     CDN chính không khớp thì thử bản npm nguyên gốc trên jsDelivr, cùng dấu vân tay. */
  var ORT_SRI = 'sha384-+sDrjb5Otytk3e52a47vPhUx98dLh5PCPk8NHBLoekdIAC8urCZbpRWfw/mMXYQv';
  var ORT_DU_PHONG = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/';
  function tn(ten) { return String(G.API_CAP_PHEP || 'https://gita365.typhuquanggita.workers.dev').replace(/\/+$/, '') + '/tn/' + ten; }
  var MO_HINH = {vais: 'vi_VN-vais1000-medium', vivos: 'vi_VN-vivos-x_low'};
  /* Tên giọng cũ (MiniMax) → giọng Piper. Người vivos đã đo cao độ: nam < 160 Hz, nữ > 215 Hz. */
  var NAM = ['Deep_Voice_Man', 'Elegant_Man', 'Patient_Man', 'Determined_Man', 'Casual_Guy', 'Young_Knight', 'Decent_Boy', 'Imposing_Manner'];
  var NU = ['Wise_Woman', 'Calm_Woman', 'Lively_Girl', 'Lovely_Girl', 'Sweet_Girl_2', 'Inspirational_girl', 'Exuberant_Girl', 'Abbess', 'Friendly_Person'];
  var VIVOS_NAM = [8, 29, 33, 45, 50, 57, 25, 44], VIVOS_NU = [0, 3, 10, 12, 15, 21, 23, 61, 64];
  var TOC_DO = {sad: 1.12, fearful: 1.05, angry: 0.93, happy: 0.95, surprised: 0.95, disgusted: 1.0, neutral: 1.0};
  X.chonGiong = function (ten) {
    var i = NAM.indexOf(ten);
    if (i >= 0) return {mo: 'vivos', sid: VIVOS_NAM[i % VIVOS_NAM.length]};
    i = NU.indexOf(ten);
    if (i === 0 || i < 0) return {mo: 'vais', sid: 0};
    return {mo: 'vivos', sid: VIVOS_NU[(i - 1) % VIVOS_NU.length]};
  };

  function napScript(src, sri) {
    return new Promise(function (ok, hong) {
      var s = document.createElement('script'); s.src = src; s.async = true;
      if (sri) { s.integrity = sri; s.crossOrigin = 'anonymous'; }
      s.onload = ok; s.onerror = function () { hong(new Error('không tải được ' + src)); };
      document.head.appendChild(s);
    });
  }
  /* Mô hình giọng tải một lần, giữ trong Cache Storage của trình duyệt */
  function taiCoDem(u) {
    var co = window.caches && caches.open ? caches.open('gita-piper-v1') : Promise.reject();
    return co.then(function (c) {
      return c.match(u).then(function (r) {
        if (r) return r;
        return fetch(u).then(function (r2) {
          if (!r2.ok) throw new Error('HTTP ' + r2.status + ' khi tải mô hình giọng');
          return c.put(u, r2.clone()).then(function () { return r2; }, function () { return r2; });
        });
      });
    }, function () { return fetch(u); });
  }
  var ortHua = null, glueHua = null, phien = {};
  function sanSangOrt() {
    var goc = ORT;
    if (!ortHua) ortHua = (window.ort ? Promise.resolve() : napScript(ORT + 'ort.min.js', ORT_SRI).catch(function () {
      goc = ORT_DU_PHONG; return napScript(ORT_DU_PHONG + 'ort.min.js', ORT_SRI);
    })).then(function () {
      window.ort.env.wasm.numThreads = 1; window.ort.env.wasm.wasmPaths = goc;
    }, function (e) { ortHua = null; throw e; });
    return ortHua;
  }
  function moHinh(ten) {
    if (!phien[ten]) {
      var duong = tn(MO_HINH[ten]);
      phien[ten] = Promise.all([
        taiCoDem(duong + '.onnx.json').then(function (r) { return r.json(); }),
        taiCoDem(duong + '.onnx').then(function (r) { return r.arrayBuffer(); }),
        sanSangOrt()
      ]).then(function (k) {
        return window.ort.InferenceSession.create(k[1]).then(function (s) { return {cfg: k[0], s: s}; });
      });
      phien[ten].catch(function () { delete phien[ten]; });
    }
    return phien[ten];
  }
  /* Chữ → mã âm vị. Tự dựng mã từ chuỗi âm vị theo phoneme_id_map của
     từng mô hình (mã sẵn của bộ tách chỉ đúng với vais1000). */
  function amVi(text, cfg) {
    if (!glueHua) glueHua = import(tn('piper-glue.js')).catch(function (e) { glueHua = null; throw e; });
    return glueHua.then(function (glue) {
      return new Promise(function (ok, hong) {
        var xong = false;
        glue.createPiperPhonemize({
          print: function (dong) {
            if (xong) return;
            try {
              var o = JSON.parse(dong), m = cfg.phoneme_id_map, r = [].concat(m['^'], m['_']);
              (o.phonemes || []).forEach(function (p) { if (m[p]) { r.push.apply(r, m[p]); r.push.apply(r, m['_']); } });
              r.push.apply(r, m['$']); xong = true; ok(r);
            } catch (e) { xong = true; hong(e); }
          },
          printErr: function () {},
          locateFile: function (l) { return /\.wasm$/.test(l) ? tn('piper_phonemize.wasm') : /\.data$/.test(l) ? tn('piper_phonemize.data') : l; }
        }).then(function (md) {
          md.callMain(['-l', cfg.espeak.voice, '--input', JSON.stringify([{text: text}]), '--espeak_data', '/espeak-ng-data']);
          setTimeout(function () { if (!xong) { xong = true; hong(new Error('bộ tách âm không trả lời')); } }, 20000);
        }, hong);
      });
    });
  }
  function wav(f32, sr) {
    var n = f32.length, b = new ArrayBuffer(44 + n * 2), v = new DataView(b);
    function chu(o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); }
    chu(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); chu(8, 'WAVE'); chu(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
    chu(36, 'data'); v.setUint32(40, n * 2, true);
    for (var i = 0; i < n; i++) { var s = Math.max(-1, Math.min(1, f32[i])); v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true); }
    return new Blob([b], {type: 'audio/wav'});
  }
  X.doc1Cau = function (loi, giong, camXuc) {
    var g = X.chonGiong(giong);
    return moHinh(g.mo).then(function (m) {
      var cfg = m.cfg, ort = window.ort;
      return amVi(String(loi || '').trim(), cfg).then(function (ids) {
        var inf = cfg.inference || {}, toc = TOC_DO[camXuc] || 1;
        var vao = {
          input: new ort.Tensor('int64', BigInt64Array.from(ids.map(function (x) { return BigInt(x); })), [1, ids.length]),
          input_lengths: new ort.Tensor('int64', BigInt64Array.from([BigInt(ids.length)])),
          scales: new ort.Tensor('float32', Float32Array.from([inf.noise_scale || 0.667, (inf.length_scale || 1) * toc, inf.noise_w || 0.8]))
        };
        if (cfg.num_speakers > 1) vao.sid = new ort.Tensor('int64', BigInt64Array.from([BigInt(g.sid)]));
        return m.s.run(vao).then(function (r) {
          var d = r.output.data, sr = cfg.audio.sample_rate;
          return {blob: wav(d, sr), ms: Math.round(d.length / sr * 1000)};
        });
      });
    });
  };
  var hangGiong = Promise.resolve(), daBaoTai = false;
  function lamGiong(dv) {
    var viec = hangGiong.then(function () {
      if (!daBaoTai && G.U && G.U.toast) { daBaoTai = true; G.U.toast('Lần đầu: máy tải giọng đọc tiếng Việt (~90 MB, chỉ một lần).', 'ok'); }
      return X.doc1Cau(dv.loi, dv.giong, dv.camXuc);
    }).then(function (k) {
      return X.ghi(k.blob, 'wav').then(function (u) { return {ok: true, kq: {url: u, ms: k.ms}}; });
    }, function (e) { return {ok: false, error: 'Giọng đọc trong máy lỗi: ' + (e && e.message || e)}; });
    hangGiong = viec.then(function () {}, function () {});
    return viec;
  }

  /* ══ CỬA CHUNG: thay cho phimGuiViec + phimXemViec ══
     Trả {ok:true, kq} ngay khi xong; {ok:false, code, error, mai?} nếu không. */
  X.lam = function (loai, dv) {
    dv = dv || {};
    if (loai === 'llm') return goi('phimMienPhi', Object.assign({}, dv, {loai: 'llm'}));
    if (/^anh(Sua)?(Pro|Cao)?$/.test(loai)) return lamAnh(loai, dv);
    if (loai === 'giong') return lamGiong(dv);
    return Promise.resolve({ok: false, code: 'CHE_DO_0_DONG', error: 'Việc "' + loai + '" cần dịch vụ trả phí — bỏ qua ở chế độ 0 đồng.'});
  };

  /* Ước tính neuron Workers AI (để báo số ngày miễn phí) */
  X.uocNeuron = function (soAnh, soLLM, cao) { return Math.round((soAnh || 0) * (cao ? 180 : 120) + (soLLM || 0) * 300); };
  X.soNgay = function (neuron, tran) {
    tran = tran || (X.trangThai && X.trangThai.mienPhi && X.trangThai.mienPhi.tran) || 9000;
    return Math.max(1, Math.ceil(neuron / tran));
  };
})();
