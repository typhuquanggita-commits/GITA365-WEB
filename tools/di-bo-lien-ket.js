/* ═══════════════════════════════════════════════════════════════
   GITA 365 — ĐI BỘ QUA TOÀN BỘ LIÊN KẾT

       node tools/di-bo-lien-ket.js

   Bộ kiểm chính dựng từng màn hình rồi đếm. Nhưng dựng được không có
   nghĩa là bấm được: một nút trỏ tới màn hình không tồn tại, một thư mục
   mở ra rỗng, một hành động không ai nghe — những thứ đó chỉ lộ ra khi
   có người thật ngồi bấm hết.

   Tệp này bấm thay. Với TỪNG VAI: mở mọi mục điều hướng, gom mọi nút
   data-v và data-act trên mọi màn, rồi đối chiếu xem có đích đến thật
   hay không. Bấm thật những nút an toàn và bắt lỗi trang.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const PW = process.env.PW_PATH || '/opt/node22/lib/node_modules/playwright';
const { chromium } = require(PW);
const fs = require('fs');
const path = require('path');
const URL = process.env.GITA_URL || 'http://127.0.0.1:8099/index.html';

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 1000 } });

  let coKhoa = false;
  try {
    const k = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'kho', 'khoa.json'), 'utf8'));
    if (k && k.khoa) { await p.addInitScript(x => { window.GITA_KHOA = x; }, k.khoa); coKhoa = true; }
  } catch { /* chế độ mẫu */ }

  const loiTrang = [];
  p.on('pageerror', e => loiTrang.push(e.message));
  p.on('console', m => { if (m.type() === 'error') loiTrang.push('console: ' + m.text()); });

  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.evaluate(() => localStorage.clear());
  await p.reload({ waitUntil: 'networkidle' });
  console.log(coKhoa ? '\n(có bộ khoá — đi hết cả nội dung đã cấp phép)'
                     : '\n(không có bộ khoá — đi ở chế độ mẫu)');

  let loi = 0;
  const bao = (ok, ten, ct) => {
    if (!ok) loi++;
    console.log((ok ? '  ✓ ' : '  ✗ ') + ten + (ct ? ' — ' + ct : ''));
  };

  /* ── Đi bộ cho một vai ── */
  async function diBo(vaiId, tenDangNhap) {
    await p.evaluate(u => window.G.doLogin(u), tenDangNhap);
    await p.waitForTimeout(2600);

    return await p.evaluate(() => {
      const G = window.G;
      const nav = [];
      G.NAV.forEach(g => g.items.forEach(i => { if (!i.perm || G.can(i.perm)) nav.push(i); }));

      const thayDuoc = new Set(nav.map(i => i.v));
      const hong = { manThieu: [], nutChet: [], manRong: [], thieuTieuDe: [], mucChet: [], theKhoa: [] };
      const actThay = new Set();

      /* Mọi hành động có người nghe: quét chuỗi data-act trong toàn bộ mã đã nạp */
      nav.forEach(muc => {
        /* Đi đúng đường người dùng: gói chưa được cấp thì đó là mục CHẾT,
           không phải màn nổ — báo riêng, vì hai chuyện khác nhau. */
        const can = G.goiCanCho(muc.v);
        if (can && !G.coGoi(can)) { hong.mucChet.push(muc.v + ' (cần gói ' + can + ')'); return; }

        let html = '';
        try {
          G.S.view = muc.v;
          html = G.VIEWS[muc.v] ? G.VIEWS[muc.v]() : '';
        } catch (e) {
          hong.manThieu.push(muc.v + ' (nổ: ' + e.message.slice(0, 60) + ')');
          return;
        }
        if (!html || html.length < 200) { hong.manRong.push(muc.v + ' (' + (html || '').length + ' ký tự)'); return; }
        /* Cửa thứ hai của cùng một lỗi: mục qua được G.allowed, gói đã cấp,
           nhưng thân màn tự khoá bằng G.can(...) và trả về đúng một thẻ
           "Vai hiện tại chưa mở mục này". Với người dùng thì bấm vào và
           không có gì — giống hệt một mục chết. */
        if (html.trim().indexOf('<div class="card center" style="padding:40px">') === 0) {
          hong.theKhoa.push(muc.v); return;
        }
        if (!/<h1|class="ph-t"|class="up |<b/.test(html)) hong.thieuTieuDe.push(muc.v);

        /* Nút trỏ sang màn khác */
        for (const m of html.matchAll(/data-v="([^"]+)"/g)) {
          const dich = m[1];
          if (!G.VIEWS[dich]) hong.nutChet.push(muc.v + ' → ' + dich + ' (không có màn này)');
        }
        for (const m of html.matchAll(/data-act="([^"]+)"/g)) actThay.add(m[1]);
      });

      return {
        vai: G.S.roleObj.id, ten: G.S.roleObj.n,
        soMuc: nav.length, soNhom: G.NAV.filter(g => g.items.some(i => !i.perm || G.can(i.perm))).length,
        hong: hong, act: [...actThay]
      };
    });
  }

  const VAI = [
    ['R01', 'superadmin@gita365.vn'], ['R02', 'admin@gita365.vn'],
    ['R03', 'giamdoc@gita365.vn'],    ['R04', 'chuyenmon@gita365.vn'],
    ['R05', 'truongcoach@gita365.vn'],['R07', 'coach@gita365.vn'],
    ['R08', 'giaovien@gita365.vn'],   ['R10', 'danhgia@gita365.vn'],
    ['R11', 'tuvan@gita365.vn'],      ['R12', 'phantich@gita365.vn'],
    ['R13', 'phuhuynh@gita365.vn'],   ['R14', 'hocvien@gita365.vn'],
    ['R15', 'daisu@gita365.vn']
  ];

  console.log('\n1 · ĐI HẾT MỌI MỤC CỦA TỪNG VAI');
  const moiAct = new Set();
  let tongMuc = 0;
  for (const [id, u] of VAI) {
    const r = await diBo(id, u);
    r.act.forEach(a => moiAct.add(a));
    tongMuc += r.soMuc;
    const h = r.hong;
    const xau = h.manThieu.length + h.nutChet.length + h.manRong.length + h.mucChet.length + h.theKhoa.length;
    bao(xau === 0, r.vai + ' ' + r.ten,
      r.soNhom + ' thư mục · ' + r.soMuc + ' mục' +
      (xau ? ' · HỎNG: ' + [...h.manThieu, ...h.nutChet, ...h.manRong, ...h.mucChet,
        ...h.theKhoa.map(v => v + ' (chỉ ra thẻ khoá)')].slice(0, 8).join(' | ') : ''));
  }
  console.log('    ' + tongMuc + ' lượt mở màn · ' + moiAct.size + ' hành động khác nhau');

  console.log('\n2 · MỌI HÀNH ĐỘNG ĐỀU CÓ NGƯỜI NGHE');
  {
    const srcDir = path.join(__dirname, '..', 'src');
    const ma = fs.readdirSync(srcDir).filter(f => f.endsWith('.js'))
      .map(f => fs.readFileSync(path.join(srcDir, f), 'utf8')).join('\n');
    const moCoi = [...moiAct].filter(a => {
      const re = new RegExp("(a\\s*===?\\s*'" + a + "'|\\[data-act=\"" + a + "\"\\]|case\\s*'" + a + "')");
      return !re.test(ma);
    });
    bao(moCoi.length === 0, 'không nút nào bấm vào rồi không có gì xảy ra',
      moCoi.length ? moCoi.join(', ') : moiAct.size + ' hành động đều có nơi xử lý');
  }

  console.log('\n3 · BẤM THẬT TỪNG THƯ MỤC BÊN TRÁI');
  {
    await p.evaluate(() => window.G.doLogin('superadmin@gita365.vn'));
    await p.waitForTimeout(2600);
    const nhom = await p.evaluate(() => window.G.NAV.map(g => g.id));
    let mo = 0, rong = [];
    for (const g of nhom) {
      const n = await p.evaluate(gid => {
        const el = document.querySelector('#left [data-g="' + gid + '"]');
        if (el) el.click();
        const kh = document.querySelectorAll('#left [data-g="' + gid + '"] ~ * [data-v], #left [data-v]');
        return kh.length;
      }, g);
      if (n > 0) mo++; else rong.push(g);
    }
    bao(rong.length === 0, 'mọi thư mục bên trái đều mở ra có mục bên trong',
      mo + '/' + nhom.length + ' thư mục' + (rong.length ? ' · rỗng: ' + rong.join(', ') : ''));
  }

  console.log('\n4 · ĐI QUA MỌI MÀN BẰNG ĐIỀU HƯỚNG THẬT');
  {
    const ds = await p.evaluate(() => {
      const r = [];
      window.G.NAV.forEach(g => g.items.forEach(i => { if (!i.perm || window.G.can(i.perm)) r.push(i.v); }));
      return r;
    });
    let hong = [];
    for (const v of ds) {
      const ok = await p.evaluate(async view => {
        try {
          window.G.go(view);
          await new Promise(r => setTimeout(r, 30));
          const el = document.getElementById('main') || document.getElementById('app');
          return !!el && el.innerHTML.length > 150;
        } catch (e) { return false; }
      }, v);
      if (!ok) hong.push(v);
    }
    bao(hong.length === 0, 'điều hướng thật tới ' + ds.length + ' màn đều ra nội dung',
      hong.length ? 'trống: ' + hong.slice(0, 5).join(', ') : 'đủ cả');
  }

  console.log('\n5 · KHÔNG LỖI NÀO TRONG SUỐT CHUYẾN ĐI');
  {
    const that = loiTrang.filter(x => !/favicon|manifest|sw\.js|ServiceWorker/i.test(x));
    bao(that.length === 0, 'chạy sạch qua toàn bộ chuyến đi',
      that.length ? that.slice(0, 3).join(' | ') : 'không lỗi nào');
  }

  console.log('\n' + (loi ? '✗ CÒN ' + loi + ' ĐIỂM CHƯA ĐẠT' : '✓ TOÀN BỘ ĐẠT — mọi liên kết đi được'));
  await b.close();
  process.exit(loi ? 1 : 0);
})();
