/* Đo HÌNH HỌC THẬT của Ngôi nhà thịnh vượng trên trình duyệt (Playwright).
   Bộ tĩnh (thu-ngoi-nha.mjs) canh MÃ; bộ này canh thứ người xem THẤY và
   BẤM — hai thứ ấy đã từng lệch nhau: CSS "đúng" mà vòng che kín nhà.
   Quét TRỌN MỘT VÒNG QUAY (đặt thời điểm hoạt ảnh bằng Web Animations, 40
   mốc) ở bốn khổ màn, và đòi:
     · không bánh đà nào chạm ngôi nhà, không bánh nào chạm nhau
     · chữ luôn thẳng (góc tổng vòng + bánh = 0°), bán kính giữ 37%
     · không vượt vào vòng khẩu hiệu, không cuộn ngang
     · 11 phần ngôi nhà + 10 bánh đà BẤM TRÚNG (không bị lớp nào che)
     · vòng có quay; máy xin giảm chuyển động → đứng yên; người dùng chọn
       "quay" → quay; rê chuột vào bánh → cả vòng dừng
   Cần máy chủ tĩnh: python3 -m http.server 8123 (trong thư mục kho)
   Dùng: node tools/thu-ngoi-nha-trinh-duyet.mjs [địa-chỉ]   */
const URL0 = process.argv[2] || 'http://127.0.0.1:8123/index.html';
let pw;
try { pw = (await import('playwright')).default; }
catch (e) { try { pw = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default; } catch (e2) { console.log('Bỏ qua: máy này không có Playwright.'); process.exit(0); } }
const mo = {}; if (process.env.PW_CHROMIUM) mo.executablePath = process.env.PW_CHROMIUM;
else { try { (await import('node:fs')).default.accessSync('/opt/pw-browsers/chromium'); mo.executablePath = '/opt/pw-browsers/chromium'; } catch (e) {} }
const b = await pw.chromium.launch(mo);

let dat = 0, truot = 0;
const kiem = (ten, dk, ct) => { if (dk) { dat++; console.log('OK  ' + ten); } else { truot++; console.log('SAI ' + ten + (ct ? ' — ' + ct : '')); } };

async function moMan(w, rm, cheDo) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, reducedMotion: rm || 'no-preference' });
  await p.goto(URL0, { waitUntil: 'load' }); await p.waitForTimeout(1000);
  await p.evaluate(c => { localStorage.clear(); if (c) localStorage.setItem('gita.nhaQuay', c); G.doLogin('superadmin@gita365.vn', 'Gita#Super01'); }, cheDo || '');
  await p.waitForTimeout(1400);
  await p.evaluate(async () => { G.THROTTLE = 0; G.go('ngoi-nha'); await new Promise(r => setTimeout(r, 1200)); });
  return p;
}
/* "Có quay" nghĩa là QUAY ÊM đúng nhịp 60 giây/vòng: góc tăng ≈ 6°/giây ở
   mỗi lần lấy mẫu. Chỉ hỏi "góc có đổi không" là xanh giả — vòng bị ép
   thời lượng 0,01ms vẫn đổi góc (giật lung tung), tổ soát bắt 10/10/2026. */
const dangQuay = (p, giay) => p.evaluate(async (giay) => {
  const n = document.querySelector('.nha-ring-nodes');
  const goc = () => { const m = new DOMMatrix(getComputedStyle(n).transform); return (Math.atan2(m.b, m.a) * 180 / Math.PI + 360) % 360; };
  const buoc = [];
  let g0 = goc();
  for (let i = 0; i < 4; i++) { await new Promise(r => setTimeout(r, 400)); const g1 = goc(); buoc.push(((g1 - g0) + 360) % 360); g0 = g1; }
  const k = 360 * 0.4 / giay;   /* độ mỗi 400 ms */
  return getComputedStyle(n).animationDuration === giay + 's' && buoc.every(d => d > k * 0.5 && d < k * 1.8);
}, giay || 60);

for (const w of [1024, 1280, 1440, 1920]) {
  const p = await moMan(w);
  const r = await p.evaluate(async () => {
    const ring = document.querySelector('.nha-ring'), nha = document.querySelector('.nha-ring .nha');
    if (!ring || getComputedStyle(document.querySelector('.nha-ring-nodes')).position !== 'absolute') return { vong: false };
    const anims = document.getAnimations().filter(a => a.animationName === 'nhaQuay' || a.animationName === 'nhaGiu');
    anims.forEach(a => a.pause());
    const R = ring.getBoundingClientRect(), H = nha.getBoundingClientRect(), cx = R.left + R.width / 2, cy = R.top + R.height / 2;
    const cham = (A, B) => A.left < B.right && A.right > B.left && A.top < B.bottom && A.bottom > B.top;
    let chamNha = 0, chamNhau = 0, nghieng = 0, rMin = 1, rMax = 0, xa = 0;
    for (let t = 0; t < 60000; t += 1500) {
      anims.forEach(a => { a.currentTime = t; });
      const ns = [...document.querySelectorAll('.nha-ring-nodes .nha-bd-o')], bs = ns.map(e => e.getBoundingClientRect());
      const pm = new DOMMatrix(getComputedStyle(document.querySelector('.nha-ring-nodes')).transform);
      bs.forEach((B, i) => {
        if (cham(B, H)) chamNha++;
        for (let j = i + 1; j < bs.length; j++) if (cham(B, bs[j])) chamNhau++;
        const d = Math.hypot(B.left + B.width / 2 - cx, B.top + B.height / 2 - cy) / R.width; rMin = Math.min(rMin, d); rMax = Math.max(rMax, d);
        xa = Math.max(xa, ...[[B.left, B.top], [B.right, B.top], [B.left, B.bottom], [B.right, B.bottom]].map(([x, y]) => Math.hypot(x - cx, y - cy) / R.width));
        const net = pm.multiply(new DOMMatrix(getComputedStyle(ns[i]).transform));
        nghieng = Math.max(nghieng, Math.abs(Math.atan2(net.b, net.a) * 180 / Math.PI));
      });
    }
    anims.forEach(a => a.play());
    /* bấm trúng: cuộn tới từng nút rồi hỏi điểm giữa nút là phần tử nào */
    let trung = 0, tong = 0;
    for (const e of document.querySelectorAll('.nha-ring .nha-o:not(.khoa), .nha-ring-nodes .nha-bd-o')) {
      tong++; e.scrollIntoView({ block: 'center' }); await new Promise(r => setTimeout(r, 20));
      const B = e.getBoundingClientRect(); if (e.contains(document.elementFromPoint(B.left + B.width / 2, B.top + B.height / 2))) trung++;
    }
    return { vong: true, chamNha, chamNhau, nghieng, rMin, rMax, xa, trung, tong, sw: document.documentElement.scrollWidth, iw: innerWidth };
  });
  if (!r.vong) { kiem(w + 'px: vòng tròn được dựng', false); await p.close(); continue; }
  kiem(w + 'px: suốt một vòng quay không bánh nào chạm nhà / chạm nhau', r.chamNha === 0 && r.chamNhau === 0, r.chamNha + '/' + r.chamNhau);
  kiem(w + 'px: chữ luôn thẳng (nghiêng < 0,5°) và bán kính giữ 37%', r.nghieng < 0.5 && Math.abs(r.rMin - 0.37) < 0.006 && Math.abs(r.rMax - 0.37) < 0.006, r.nghieng.toFixed(2) + '° · ' + r.rMin.toFixed(3) + '–' + r.rMax.toFixed(3));
  kiem(w + 'px: bánh không lấn vòng khẩu hiệu (≤ 44% bề ngang) · không cuộn ngang', r.xa <= 0.44 && r.sw <= r.iw, r.xa.toFixed(3) + ' · ' + r.sw + '/' + r.iw);
  kiem(w + 'px: mọi phần nhà + mọi bánh đà bấm trúng (không lớp nào che)', r.trung === r.tong && r.tong >= 20, r.trung + '/' + r.tong);
  await p.close();
  /* Trang MỚI cho phần quay/dừng: phần quét hình ở trên đã gọi pause()/play()
     bằng script, mà theo chuẩn Web Animations một lần gọi như thế ĐÈ luật
     animation-play-state của CSS — đo hover trên trang ấy là đo sai. */
  if (w === 1440) {
    const p = await moMan(w);
    kiem('vòng có quay khi máy không xin giảm chuyển động', await dangQuay(p));
    const dung = await p.evaluate(async () => {
      document.querySelector('.nha-ring-nodes .nha-bd-o').scrollIntoView({ block: 'center' });
      await new Promise(r => setTimeout(r, 100));
      const B = document.querySelector('.nha-ring-nodes .nha-bd-o').getBoundingClientRect(); return { x: B.left + B.width / 2, y: B.top + B.height / 2 };
    });
    await p.mouse.move(dung.x, dung.y);
    kiem('rê chuột vào một bánh → cả vòng dừng để bấm trúng', !(await dangQuay(p)));
    await p.close();
  }
}
const pg = await moMan(1440, 'reduce');
kiem('máy xin giảm chuyển động → vòng QUAY CHẬM êm (240 giây/vòng), không giật', await dangQuay(pg, 240));
await pg.click('text=Quay đủ nhịp');
kiem('bấm "Quay đủ nhịp" (chuột thật) → quay êm 60 giây/vòng dù máy xin giảm', await dangQuay(pg, 60));
await pg.click('text=Dừng vòng bánh đà');
kiem('bấm "Dừng" (chuột thật) → vòng đứng yên; tiêu điểm ở lại trên nút',
  await pg.evaluate(async () => { const n = document.querySelector('.nha-ring-nodes'); const a = getComputedStyle(n).transform; await new Promise(r => setTimeout(r, 800));
    return getComputedStyle(n).animationName === 'none' && a === getComputedStyle(n).transform && document.activeElement && document.activeElement.closest('.nha-quay-nut') !== null; }));
await pg.close();
const p390 = await moMan(390);
const hep = await p390.evaluate(() => ({ pos: getComputedStyle(document.querySelector('.nha-ring-nodes')).position, nut: getComputedStyle(document.querySelector('.nha-quay-nut')).display, sw: document.documentElement.scrollWidth, iw: innerWidth }));
kiem('390px: bánh đà xếp phẳng (không vòng), ẩn nút quay, không cuộn ngang', hep.pos === 'static' && hep.nut === 'none' && hep.sw <= hep.iw, JSON.stringify(hep));
await p390.close();
await b.close();
console.log('\n' + (truot ? '✗ ' + truot + ' SAI · ' : '✓ ') + dat + ' đạt');
process.exit(truot ? 1 : 0);
