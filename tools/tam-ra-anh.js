#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — RA ẢNH TỪ MỘT BỘ ĐỀ BÀI THỊ GIÁC

   Bộ vẽ `src/ve-thi-giac.js` trả về SVG. Phim cần điểm ảnh. Đây là
   chỗ nối hai thứ ấy.

   ══ VÌ SAO ĐỔ ẢNH BẰNG TRÌNH DUYỆT, KHÔNG BẰNG THƯ VIỆN NODE ══

   Có thư viện Node đổi SVG ra PNG mà không cần trình duyệt, và nó
   nhanh hơn nhiều. Không dùng, vì bộ vẽ ĐO CHỮ bằng canvas của
   trình duyệt: bề rộng từng dòng, chỗ ngắt dòng, cỡ chữ vừa ô —
   tất cả tính bằng số đo của Chromium với đúng bộ chữ trong
   `assets/fonts/`. Đổ bằng một bộ dựng chữ khác là dựng lại bằng
   số đo khác, và tấm ra sẽ KHÁC tấm đã qua phép đo tương phản và
   phép đo chữ-trong-khung. Khác một chút thôi cũng đủ: chữ tràn ô
   không hiện ở bản đo, chỉ hiện ở bản người xem.

   ══ CẢ BỘ MỘT KHOÁ ══

   Gọi `G.veThiGiacBo()` chứ không gọi `G.veThiGiac()` từng tấm.
   Bộ khoá kiểu, khổ và nền một lần theo tấm đầu (luật boAnh), nên
   mọi tấm ra đây chắc chắn cùng kích thước — điều kiện `xfade` của
   `dung-phim.js` đòi, và cũng là điều mắt người đòi trước đó.

   Chạy:  node tools/tam-ra-anh.js <đề-bài.json> <thư mục ra> [khổ] [nền]

   Khổ: rong · vuong · doc · dung — không gõ thì bộ tự chốt theo tấm
   đầu, đúng luật boAnh. Nền: giay · sau · sang · but.

   Tệp đề bài là một MẢNG bản ghi, mỗi bản ghi đúng dạng bộ vẽ nhận:
     {id, tang, loaiHinh, nhiemVu, noiDung, nguoiXem[]}
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');

const PW = process.env.PW_PATH || '/opt/node22/lib/node_modules/playwright';
const URL = process.env.GITA_URL || 'http://127.0.0.1:8099/index.html';

/* ── MỘT LƯỢT MỞ TRÌNH DUYỆT, NHIỀU KHỔ ──
   Mở trình duyệt, đăng nhập, chờ kho nạp và chờ bộ chữ tải xong mất
   khoảng bốn giây — và cả bốn giây ấy KHÔNG phụ thuộc vào khổ. Dựng
   ba khổ bằng ba lượt gọi là trả giá ấy ba lần cho cùng một việc.
   Nên tách: mở một lần, rồi chụp từng khổ trong cùng trang. */
async function raAnhNhieu(ds, danhSachKhoa) {
  const { chromium } = require(PW);
  const b = await chromium.launch();
  try {
    const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
    /* Bộ khoá nếu có: không có thì kho chưa mở, mà hiến pháp thị giác
       và bảng màu thương hiệu đều nằm trong kho — bộ vẽ sẽ từ chối
       chứ không vẽ đại bằng màu tự nghĩ. */
    try {
      const k = JSON.parse(fs.readFileSync(
        path.join(__dirname, '..', 'kho', 'khoa.json'), 'utf8'));
      if (k && k.khoa) await p.addInitScript(x => { window.GITA_KHOA = x; }, k.khoa);
    } catch { /* không khoá — sẽ hỏng ở bước dưới, và hỏng có tiếng */ }

    await p.goto(URL, { waitUntil: 'networkidle' });
    await p.evaluate(() => window.G.doLogin('superadmin@gita365.vn'));
    await p.waitForFunction(
      () => window.G.KHO && !window.G.KHO.dangNap.length, { timeout: 60000 });
    await p.evaluate(async () => {
      try { if (document.fonts) await document.fonts.ready; } catch (e) {}
    });

    const ketQua = [];
    for (const mucKhoa of danhSachKhoa) {
      const r = await chupMotKho(p, ds, mucKhoa);
      ketQua.push(r);
    }
    return ketQua;
  } finally {
    await b.close();
  }
}

/* Chụp trọn một bộ ở MỘT khoá kiểu. Trang đã sẵn sàng khi vào đây. */
async function chupMotKho(p, ds, mucKhoa) {
  const thuMuc = mucKhoa.thuMuc;
  const khoaMuon = mucKhoa.khoa || null;
  {
    const bo = await p.evaluate(x => {   /* eslint-disable-line */
      if (!window.G.veThiGiacBo) return { ok: false, error: 'CHUACOBOVE' };
      const v = window.G.veThiGiacBo(x.ds, x.khoa);
      /* Trả về không kèm SVG: chuỗi SVG của một bộ mười lăm tấm là
         vài megabyte đi qua cầu Node↔trình duyệt mà chẳng để làm gì —
         tấm được dựng và chụp NGAY TRONG trang. */
      return { ok: v.ok !== false, error: v.error,
               khoa: v.khoa, hong: v.hong || [], thieuY: v.thieuY || [],
               so: (v.tam || []).length,
               kg: v.tam && v.tam[0] ? { w: v.tam[0].w, h: v.tam[0].h } : null,
               /* Kèm `so` (thứ tự trong đề bài gốc) chứ không chỉ tên
                  loại hình: tấm hỏng bị bỏ qua, nên vị trí trong
                  danh sách RA không còn khớp danh sách VÀO. */
               ten: (v.tam || []).map(t => t.loaiHinh),
               nguon: (v.tam || []).map(t => ({so: t.so, id: t.id})) };
    }, { ds: ds, khoa: khoaMuon || null });
    if (!bo.ok || !bo.so) throw new Error('Không dựng được bộ: ' +
      (bo.error || 'không tấm nào vẽ được'));

    fs.mkdirSync(thuMuc, { recursive: true });
    await p.setViewportSize({ width: bo.kg.w, height: bo.kg.h });
    const ra = [];
    for (let i = 0; i < bo.so; i++) {
      await p.evaluate(function (x) {
        const cu = document.getElementById('gita-tam-ra');
        if (cu) cu.remove();
        const v = window.G.veThiGiacBo(x.ds, x.khoa);
        const o = document.createElement('div');
        o.id = 'gita-tam-ra';
        o.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;' +
          'width:' + v.tam[x.i].w + 'px;height:' + v.tam[x.i].h + 'px';
        o.innerHTML = v.tam[x.i].svg;
        const s = o.querySelector('svg');
        s.style.cssText = 'display:block;width:100%;height:100%';
        document.body.appendChild(o);
      }, { ds: ds, i: i, khoa: khoaMuon || null });
      /* Ảnh trong tấm (lớp người) tải qua mạng — chụp trước khi nó
         về là chụp một ô trống, và một ô trống trông y hệt một tấm
         chưa khai ảnh. Chờ mọi <img>/<image> xong rồi mới chụp. */
      await p.evaluate(() => Promise.all(
        [...document.querySelectorAll('#gita-tam-ra image')].map(function (e) {
          return new Promise(function (xong) {
            const u = e.getAttribute('href') || e.getAttribute('xlink:href');
            if (!u || /^data:/.test(u)) return xong();
            const im = new Image(); im.onload = im.onerror = xong; im.src = u;
          });
        })));
      const tep = path.join(thuMuc, 'tam-' + String(i).padStart(3, '0') + '-' +
        bo.ten[i].toLowerCase().replace(/_/g, '-') + '.png');
      await p.screenshot({ path: tep,
        clip: { x: 0, y: 0, width: bo.kg.w, height: bo.kg.h } });
      ra.push(tep);
    }

    /* ── SỔ NGUỒN: TẤM NÀY TỪ BẢN GHI NÀO, ĐANG Ở BẬC NÀO ──
       Luật C19 nói phim chỉ dựng từ tấm ĐÃ phát hành. Một luật như
       thế mà không có chỗ nào kiểm được thì nó là một câu trong sổ:
       tệp PNG không mang theo bậc duyệt của bản ghi sinh ra nó, và
       nhìn một thư mục ảnh thì không đọc ra được cái gì.
       Nên ghi kèm sổ nguồn, và `dung-phim.js` ĐÒI sổ ấy — danh sách
       trắng, không danh sách cấm. */
    const nguon = {khoa: bo.khoa, kg: bo.kg, luc: new Date().toISOString(),
      tam: ra.map(function (t, i) {
        const g = ds[bo.nguon[i].so - 1] || {};
        return {tep: path.basename(t), id: bo.nguon[i].id,
          loaiHinh: bo.ten[i], trangThai: g.trangThai || 'nhap'};
      })};
    fs.writeFileSync(path.join(thuMuc, 'nguon.json'),
      JSON.stringify(nguon, null, 1), 'utf8');

    return { tep: ra, khoa: bo.khoa, kg: bo.kg, nguon: nguon, thuMuc: thuMuc,
             hong: bo.hong, thieuY: bo.thieuY };
  }
}

/* Một khổ thôi — vỏ mỏng quanh raAnhNhieu, giữ nguyên chữ ký cũ. */
async function raAnh(ds, thuMuc, khoaMuon) {
  const r = await raAnhNhieu(ds, [{thuMuc: thuMuc, khoa: khoaMuon || null}]);
  return r[0];
}

module.exports = { raAnh, raAnhNhieu };

if (require.main === module) {
  if (process.argv.length < 4) {
    console.log('Dùng: node tools/tam-ra-anh.js <đề-bài.json> <thư mục ra> ' +
      '[khổ: rong|vuong|doc|dung] [nền: giay|sau|sang|but]');
    process.exit(2);
  }
  const ds = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  /* Khoá kiểu gõ tay ở dòng lệnh: không gõ thì bộ tự đọc từ tấm đầu,
     đúng luật boAnh. Gõ thì cả bộ theo cái gõ. */
  var khoa = (process.argv[4] || process.argv[5])
    ? {kho: process.argv[4] || null, che: process.argv[5] || null} : null;
  raAnh(Array.isArray(ds) ? ds : [ds], process.argv[3], khoa).then(function (r) {
    console.log('✓ ' + r.tep.length + ' tấm · ' + r.kg.w + '×' + r.kg.h +
      ' · nền ' + (r.khoa && r.khoa.che) +
      (r.hong.length ? '\n✗ hỏng:\n' + r.hong.map(
        h => '  tấm ' + h.so + ' (' + h.id + ') — ' + h.error).join('\n') : '') +
      (r.thieuY.length ? '\n! thiếu ý:\n' + r.thieuY.map(
        t => '  tấm ' + t.so + ' (' + t.id + ') — ' +
             (t.thieu || []).join(' · ')).join('\n') : ''));
    console.log(r.tep.map(t => '  ' + t).join('\n'));
    /* ── MỘT TẤM HỎNG THÌ CẢ BỘ HỎNG ──
       Bộ vẽ bỏ qua tấm nó không vẽ được và trả về phần còn lại. Với
       một bộ ảnh đăng lẻ thì thế là đúng. Với một cuốn phim thì
       không: thiếu một cảnh, cuốn phim vẫn chạy trơn, vẫn đẹp, và
       không ai đọc ra là thiếu — đúng lớp "nội dung ít đi mà không
       ai biết" mà kho này đã ăn ba lần. */
    if (r.hong.length) process.exit(1);
  }).catch(function (e) {
    console.error('✗ ' + e.message);
    process.exit(1);
  });
}
