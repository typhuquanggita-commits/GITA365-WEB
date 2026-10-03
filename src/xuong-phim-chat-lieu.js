/* ═══════════════════════════════════════════════════════════════════
   9.99.255 — KHO CHẤT LIỆU CỐT TRUYỆN của xưởng phim
   Chọn đúng những trang trong bộ sách và kho tri thức GITA365 khớp với
   khách (tầng · cấp hành trình · tình huống khảo sát · ghi chú) rồi gói
   thành một đoạn "chất liệu gốc" gửi cho đội Agent biên kịch. Phim dựng
   từ lời thật của hệ — chân dung trước/sau, nỗi đau → khát khao, câu hỏi
   thật của phụ huynh, sổ tay giấy, bài học, mùa cảm xúc — nên khách xem
   thấy chính nhà mình trong đó.
   Đọc G.* (kho/mau.json + các gói đã mở khoá: mở càng nhiều gói, chất
   liệu càng đầy). Chạy hoàn toàn trong máy, không gọi mạng, 0 đồng.
   ═══════════════════════════════════════════════════════════════════ */
(function (G) {
  'use strict';
  var TOI_DA = 3900;

  function bo(v) {
    return String(v == null ? '' : (Array.isArray(v) ? v.join('; ') : typeof v === 'object' ? Object.keys(v).map(function (k) { return v[k]; }).join('; ') : v))
      .replace(/<[^>]*>/g, ' ').replace(/\[cần cấp phép\]/g, '').replace(/[\u0370-\u03FF\u0400-\u04FF]+/g, '').replace(/…\s*$/, '').replace(/\s+/g, ' ').trim();
  }
  function cat(v, n) { var s = bo(v); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s; }
  function mang(v) { return Array.isArray(v) ? v : []; }

  /* ── So khớp chữ tiếng Việt: bỏ dấu, ghép từng cặp âm tiết ── */
  var NGAT = ' con cua va la khong nha me bo ba cha cho voi mot cac nhung duoc trong khi thi ma de da dang se roi lai nay do cung nhu hay '
    + 'rat qua toi ban minh anh chi em co gi the nao vi sao lam ra vao len xuong ';
  function khongDau(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd'); }
  function tu(s) { return khongDau(s).split(/[^a-z0-9]+/).filter(function (w) { return w.length > 1; }); }
  function dau(s) {
    var w = tu(s), r = {};
    for (var i = 0; i < w.length; i++) {
      if (NGAT.indexOf(' ' + w[i] + ' ') < 0 && w[i].length > 2) r['1:' + w[i]] = 1;
      if (i + 1 < w.length) r['2:' + w[i] + ' ' + w[i + 1]] = 1;
    }
    return r;
  }
  function diem(daCan, chu) {
    var d = dau(chu), s = 0;
    for (var k in daCan) if (d[k]) s += k.charAt(0) === '2' ? 3 : 1;
    return s;
  }
  function tot(ds, daCan, lay, n, loc) {
    return mang(ds).map(function (x, i) { return {x: x, s: diem(daCan, lay(x)) - i * 0.001}; })
      .filter(function (o) { return !loc || loc(o.x); })
      .sort(function (a, b) { return b.s - a.s; }).slice(0, n).map(function (o) { return o.x; });
  }
  function soTang(t) { var m = /([1-5])/.exec(String(t || '')); return m ? +m[1] : 0; }

  /* o = {tang:'T2', cap:'2.3', vanDe:'chữ tình huống + ghi chú'} */
  G.xpClChon = function (o) {
    o = o || {};
    var n = soTang(o.cap) || soTang(o.tang) || 1, T = 'T' + n, can = dau(o.vanDe || '');
    var cungTang = function (x) { return soTang(x.tier || x.tang) === n; };
    var r = {tang: T};
    r.chanDung = ['PH', 'HS'].map(function (a) {
      return mang(G.CHANDUNG).filter(function (c) { return c.tier === T && c.audience === a; })[0];
    }).filter(Boolean);
    r.chuyenDich = tot(G.CHUYENDICH, can, function (c) { return [c.linh, c.dau, c.khat].join(' '); }, 2);
    var kb = tot(G.KBTV_KB, can, function (k) { return k.ten + ' ' + mang(k.hoi).join(' '); }, 2);
    if (!Object.keys(can).length) kb = mang(G.KBTV_KB).filter(function (k) { return [1, 3, 25, 28].indexOf(k.chuong) >= 0 || /KBTV-0[13]|KBTV-2[58]/.test(k.ma); }).slice(0, 2);
    r.tinhHuong = kb;
    r.soTay = {
      dongDau: G.SG_DONGDAU && G.SG_DONGDAU.chu || '',
      hoi: tot(G.SG_HOI, can, function (x) { return x.hoi + ' ' + x.dap; }, 2)
    };
    var bh = mang(G.BAIHOC);
    r.baiHoc = tot(bh, can, function (b) { return [b.ten, b.dungKhiNao, b.nguyenLy].join(' '); }, 2);
    r.hanhTrinh = mang(G.HANHTRINH12).filter(cungTang).slice(0, 2);
    r.camXuc = mang(G.TT_CAMXUC).slice(0, 7);
    r.mua = mang(G.TT_MUA).slice(0, 4);
    r.daiSu = G.DAISU && G.DAISU.gioiThieu && G.DAISU.gioiThieu.trietLy || '';
    return r;
  };

  /* Đoạn chất liệu gửi máy chủ (≤ 3.900 ký tự). Chữ nguồn giữ tiếng Việt
     nguyên văn để nhân vật nói đúng lời của hệ. */
  G.xpClDoan = function (o) {
    var r = G.xpClChon(o), p = [];
    function them(u, s) { p.push({u: u, s: s, i: p.length}); }
    r.chanDung.forEach(function (c, j) {
      var dd = c.tuDuyDoi || {};
      them(j ? 6 : 1, '[CHÂN DUNG ' + (c.audience === 'PH' ? 'PHỤ HUYNH' : 'HỌC VIÊN') + ' · ' + c.tier + '] ' + cat(c.tieuDe, 140) +
        '\n- Trước: ' + mang(c.truocKhiVao).slice(0, 3).map(function (x) { return cat(x, 130); }).join(' | ') +
        '\n- Sau: ' + mang(c.sauKhiRa).slice(0, 2).map(function (x) { return cat(x, 130); }).join(' | ') +
        (dd.tu ? '\n- Đổi nghĩ: "' + cat(dd.tu, 110) + '" → "' + cat(dd.sang, 150) + '"' : '') +
        (mang(c.chuaPhaiLa).length ? '\n- Chưa phải là: ' + cat(c.chuaPhaiLa[0], 140) : '') +
        (c.nguoiKhacThay ? '\n- Người khác thấy: ' + cat(c.nguoiKhacThay, 140) : '') +
        (c.cauChotLoi ? '\n- Câu chốt: "' + cat(c.cauChotLoi, 220) + '"' : ''));
    });
    r.chuyenDich.forEach(function (c, j) {
      them(j ? 9 : 3, '[NỖI ĐAU → KHÁT KHAO · ' + bo(c.linh) + '] Đau: "' + cat(c.dau, 180) + '" → Khát: "' + cat(c.khat, 180) + '"' + (c.don ? ' · GITA trao: ' + cat(c.don, 120) : ''));
    });
    r.tinhHuong.forEach(function (k, j) {
      them(j ? 9 : 4, '[CÂU HỎI THẬT CỦA PHỤ HUYNH · ' + cat(k.ten, 110) + '] ' + mang(k.hoi).slice(0, 4).map(function (x) { return '"' + cat(x, 90) + '"'; }).join(' '));
    });
    var st = r.soTay;
    if (st.dongDau || st.hoi.length) {
      them(2, '[SỔ TAY GIA ĐÌNH — sách giấy của GITA365]' + (st.dongDau ? ' Dòng in đầu sách: "' + cat(st.dongDau, 200) + '"' : '') +
        st.hoi.map(function (x) { return '\n- Hỏi "' + cat(x.hoi, 90) + '" — Sách đáp: "' + cat(x.dap, 260) +         '"'; }).join(''));
    }
    r.baiHoc.forEach(function (b, j) {
      them(j ? 10 : 8, '[BÀI HỌC · ' + cat(b.ten, 90) + '] ' + cat(b.nguyenLy, 260) + (b.viDuVietNam ? ' Ví dụ: ' + cat(b.viDuVietNam, 160) : ''));
    });
    r.hanhTrinh.forEach(function (h, j) {
      them(j ? 10 : 7, '[CHẶNG ' + h.no + ' · ' + cat(h.ten, 70) + '] Xong khi: ' + cat(h.xongKhi, 150) + (h.wow ? ' · WOW: ' + cat(h.wow, 140) : ''));
    });
    if (r.camXuc.length) them(5, '[MÙA CẢM XÚC CỦA HÀNH TRÌNH, theo thứ tự] ' + r.camXuc.map(function (x) { return bo(x.ten) + ' (' + cat(x.khi, 50) + ')'; }).join(' → '));
    if (r.mua.length) them(10, '[MÙA ĐỜI — nhà nào cũng có] ' + r.mua.map(function (x) { return bo(x.ten) + ': ' + cat(x.khi, 80); }).join(' · '));
    if (r.daiSu) them(6, '[LUẬT KỂ CHUYỆN CỦA ĐẠI SỨ] ' + cat(r.daiSu, 260));
    var dau = 'Material for tier ' + r.tang + '. HEART RULES: (1) episode 1 opens on one "Trước" line lived as a concrete everyday scene; ' +
      '(2) every episode turns one source line into a lived moment — show, do not lecture; (3) the parent asks at least two of the real questions word-for-word and the GITA companion answers in the spirit of the notebook; ' +
      '(4) one episode is an honest setback ("Chưa phải là", a winter season) — no miracle cures; (5) the emotional arc walks the seasons in order; ' +
      '(6) the finale shows the "Sau" lines and the "Câu chốt", and ends on the notebook opening line spoken or written verbatim; (7) never invent numbers, guarantees or promises beyond this material.\n';
    var con = TOI_DA - dau.length, lay = [];
    p.slice().sort(function (a, b) { return a.u - b.u || a.i - b.i; }).forEach(function (x) {
      if (x.s.length + 1 <= con) { lay.push(x); con -= x.s.length + 1; }
    });
    lay.sort(function (a, b) { return a.i - b.i; });
    return (dau + lay.map(function (x) { return x.s; }).join('\n')).trim();
  };

  /* Tóm tắt cho chủ hệ xem đã lấy những trang nào */
  G.xpClTomTat = function (o) {
    var r = G.xpClChon(o), ds = [];
    if (r.chanDung.length) ds.push(r.chanDung.length + ' chân dung ' + r.tang);
    if (r.chuyenDich.length) ds.push('nỗi đau → khát khao: ' + r.chuyenDich.map(function (c) { return bo(c.linh).toLowerCase(); }).join(', '));
    if (r.tinhHuong.length) ds.push('câu hỏi thật: ' + r.tinhHuong.map(function (k) { return cat(k.ten, 60); }).join('; '));
    if (r.soTay.dongDau || r.soTay.hoi.length) ds.push('Sổ tay gia đình (' + (r.soTay.hoi.length + (r.soTay.dongDau ? 1 : 0)) + ' đoạn)');
    if (r.baiHoc.length) ds.push('bài học: ' + r.baiHoc.map(function (b) { return cat(b.ten, 50); }).join('; '));
    if (r.hanhTrinh.length) ds.push('chặng ' + r.hanhTrinh.map(function (h) { return h.no; }).join(', '));
    if (r.camXuc.length) ds.push(r.camXuc.length + ' mùa cảm xúc');
    if (r.daiSu) ds.push('luật kể chuyện đại sứ');
    return ds;
  };
})(window.G = window.G || {});
