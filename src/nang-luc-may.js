/* ═══════════════════════════════════════════════════════════════
   GITA 365 · NĂNG LỰC MÁY & NHẬT KÝ LỖI PHÍA MÁY KHÁCH
   (docs/TOI_UU_CHI_PHI_CHAT_LUONG.md — điểm yếu 1 và 2)

   1. ĐO MÁY TRƯỚC KHI GIAO VIỆC NẶNG. Xưởng phim xuất video bằng canvas
      + MediaRecorder ngay trên máy; điện thoại cũ mà ép 30 khung/giây,
      6 Mbps là treo tab. Ở đây đo RAM, số lõi, WebGL/WebGPU/WASM, chế độ
      tiết kiệm dữ liệu → xếp máy vào BA BẬC: 'manh' | 'vua' | 'yeu'.
      Các màn hỏi G.NANG_LUC / G.cauHinhPhim() thay vì đoán.
      Bậc 'yeu' gắn data-may="yeu" lên <html> → CSS tắt hiệu ứng nặng.

   2. XIN TRÌNH DUYỆT GIỮ KHO. navigator.storage.persist(): được duyệt
      thì trình duyệt KHÔNG tự xoá IndexedDB/localStorage khi thiếu chỗ —
      bớt hẳn một đường mất dữ liệu chưa kịp đồng bộ.

   3. NHẬT KÝ LỖI VÒNG (40 dòng gần nhất, chỉ trong máy). Bắt lỗi JS,
      promise bị bỏ rơi, lỗi gọi máy chủ KÈM MÃ YÊU CẦU (x-gita-ma) — mã
      ấy tra thẳng ra dòng nhật ký Worker. Người dùng bấm "chép nhật ký"
      gửi hỗ trợ là ghép được hai phía Client ↔ Edge, khỏi đoán.
      KHÔNG ghi token, mật khẩu hay nội dung hồ sơ — chỉ lời lỗi.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

(function(){
  var nav = window.navigator || {};
  var ram = Number(nav.deviceMemory || 0);          // GB, Chrome/Edge; Safari/Firefox không có
  var loi = Number(nav.hardwareConcurrency || 0);
  var ketNoi = nav.connection || {};
  var coWebGL = false;
  try {
    var cv = document.createElement('canvas');
    coWebGL = !!(cv.getContext('webgl2') || cv.getContext('webgl'));
  } catch(e){}
  var nl = {
    ram: ram, loi: loi,
    webgpu: !!nav.gpu,
    webgl: coWebGL,
    wasm: typeof WebAssembly === 'object',
    ghiHinh: typeof window.MediaRecorder === 'function',
    luuTep: typeof window.showSaveFilePicker === 'function',
    tietKiemDuLieu: !!ketNoi.saveData,
    mangCham: /(^|-)2g$/.test(String(ketNoi.effectiveType || '')),
    diDong: /Android|iPhone|iPad|iPod|Mobile/i.test(nav.userAgent || '')
  };
  var bac;
  if((ram && ram <= 2) || (loi && loi <= 2) || !nl.webgl) bac = 'yeu';
  else if((ram && ram >= 8) && loi >= 8 && !nl.diDong) bac = 'manh';
  else bac = 'vua';
  /* Người dùng tự chọn (Cài đặt → hiệu năng) thắng phép đo. */
  try { var chon = localStorage.getItem('gita365.bacMay'); if(/^(manh|vua|yeu)$/.test(chon || '')) bac = chon; } catch(e){}
  nl.bac = bac;
  G.NANG_LUC = nl;
  try { document.documentElement.setAttribute('data-may', bac); } catch(e){}

  G.datBacMay = function(b){
    try {
      if(/^(manh|vua|yeu)$/.test(b || '')) localStorage.setItem('gita365.bacMay', b);
      else localStorage.removeItem('gita365.bacMay');
    } catch(e){}
  };

  /* Thông số xuất phim theo bậc máy. Khung hình (dọc/ngang) giữ nguyên
     theo dự án; chỉ hạ khung/giây, bitrate và — ở máy yếu — thu nhỏ cạnh
     dài về tối đa 960 px (vẫn rõ trên điện thoại, nhẹ RAM ~45%). */
  var PHIM = {
    manh: {fps: 30, bitrate: 6000000, canhToiDa: 1920},
    vua:  {fps: 30, bitrate: 4000000, canhToiDa: 1280},
    yeu:  {fps: 24, bitrate: 2500000, canhToiDa: 960}
  };
  G.cauHinhPhim = function(){ return PHIM[G.NANG_LUC.bac] || PHIM.vua; };
})();

/* ── Xin giữ kho — gọi một lần, im lặng nếu trình duyệt không hỗ trợ ── */
(function(){
  try {
    if(navigator.storage && navigator.storage.persist && navigator.storage.persisted){
      navigator.storage.persisted().then(function(da){
        if(!da) return navigator.storage.persist();
        return true;
      }).then(function(ok){ G.KHO_BEN = !!ok; }).catch(function(){});
    }
  } catch(e){}
})();

/* ── Nhật ký lỗi vòng ── */
(function(){
  var TRAN = 40, KHOA = 'gita365.nhatKyLoi';
  var ds = [];
  try { ds = JSON.parse(sessionStorage.getItem(KHOA) || '[]') || []; } catch(e){ ds = []; }
  function luu(){ try { sessionStorage.setItem(KHOA, JSON.stringify(ds)); } catch(e){} }
  /* Bỏ mọi thứ trông như token/mật khẩu trước khi ghi. */
  function sach(s){
    return String(s || '').slice(0, 300)
      .replace(/(token|matKhau|password|mk)\s*[:=]\s*["']?[^"',\s}]+/gi, '$1=***');
  }
  G.ghiLoi = function(loai, loi, ma){
    ds.push({luc: new Date().toISOString(), loai: loai, loi: sach(loi), ma: ma || '',
      man: (G.S && G.S.view) || '', ban: (G.META && G.META.version) || ''});
    if(ds.length > TRAN) ds = ds.slice(-TRAN);
    luu();
  };
  G.NHAT_KY_LOI = function(){ return ds.slice(); };
  /* Một khối chữ để dán vào thư hỗ trợ: máy gì, bậc nào, lỗi gì, mã nào. */
  G.chepNhatKyLoi = function(){
    var nl = G.NANG_LUC || {};
    var dau = 'GITA 365 ' + ((G.META && G.META.version) || '') + ' · bậc máy ' + (nl.bac || '?') +
      ' · RAM ' + (nl.ram || '?') + 'GB · ' + (nl.loi || '?') + ' lõi · ' + (navigator.userAgent || '').slice(0, 120);
    var chu = dau + '\n' + ds.map(function(x){
      return x.luc + ' [' + x.loai + '] ' + (x.ma ? '(mã ' + x.ma + ') ' : '') + x.loi;
    }).join('\n');
    if(navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(chu).then(function(){ return chu; });
    return Promise.resolve(chu);
  };
  window.addEventListener('error', function(ev){
    if(!ev || !ev.message) return;   // lỗi tải tài nguyên (img/script) không có message — bỏ
    G.ghiLoi('js', ev.message + ' @' + String(ev.filename || '').split('/').pop() + ':' + (ev.lineno || 0));
  });
  window.addEventListener('unhandledrejection', function(ev){
    var r = ev && ev.reason;
    G.ghiLoi('promise', (r && (r.message || r.name)) || String(r));
  });
})();
