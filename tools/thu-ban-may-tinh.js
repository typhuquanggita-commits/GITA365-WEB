#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — THỬ BẢN MÁY TÍNH

       node desktop/chuan-bi.js && node tools/thu-ban-may-tinh.js

   Mở đúng ứng dụng Electron sẽ đóng thành .exe, rồi kiểm những thứ
   chỉ bản máy tính mới có và bộ kiểm web không chạm tới được:

     · Ứng dụng mở được, không lỗi trang
     · Giao thức riêng gita:// phục vụ đủ tệp
     · Cổng in từ chối khách hàng, cho phép cấp quản lý
     · Hàm mà TRÌNH ĐƠN của tiến trình chính gọi trả về đúng
     · Có mặt hàm đồng bộ, đổi mật khẩu, lấy lại mật khẩu

   Cần màn hình ảo trên máy chủ không có màn hình:
       xvfb-run -a node tools/thu-ban-may-tinh.js
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const path = require('path');
const fs = require('fs');

const GOC = path.join(__dirname, '..');
const DESKTOP = path.join(GOC, 'desktop');
const PW = process.env.PW_PATH || '/opt/node22/lib/node_modules/playwright';
const EXE = path.join(DESKTOP, 'node_modules', 'electron', 'dist', 'electron');

if (!fs.existsSync(path.join(DESKTOP, 'app', 'index.html'))) {
  console.error('Chưa chuẩn bị bản máy tính. Chạy trước: node desktop/chuan-bi.js');
  process.exit(1);
}
if (!fs.existsSync(EXE)) {
  console.error('Chưa có Electron. Chạy trước: cd desktop && npm ci');
  process.exit(1);
}

const { _electron: electron } = require(PW);

let loi = 0;
const bao = (ok, ten, ct) => { if (!ok) loi++; console.log((ok ? '  ✓ ' : '  ✗ ') + ten + (ct ? ' — ' + ct : '')); };

(async () => {
  console.log('\nTHỬ BẢN MÁY TÍNH\n');
  const app = await electron.launch({ args: ['.'], cwd: DESKTOP, executablePath: EXE });
  const p = await app.firstWindow();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.waitForTimeout(3000);

  console.log('1 · MỞ ỨNG DỤNG');
  bao(/GITA 365/.test(await p.title()), 'ứng dụng mở được', await p.title());
  bao((await p.url()).indexOf('gita://') === 0, 'chạy trên giao thức riêng gita://', await p.url());

  /* Nạp khoá như bản đã kích hoạt giấy phép */
  let coKhoa = false;
  try {
    const k = JSON.parse(fs.readFileSync(path.join(GOC, 'kho', 'khoa.json'), 'utf8')).khoa;
    await p.addInitScript(x => { window.GITA_KHOA = x; }, k);
    await p.reload();
    await p.waitForTimeout(2500);
    coKhoa = true;
  } catch (e) { await p.waitForTimeout(500); }
  console.log(coKhoa ? '  (có bộ khoá — kiểm như bản đã kích hoạt)' : '  (không có bộ khoá — kiểm ở chế độ mẫu)');

  console.log('\n2 · CỔNG IN THEO VAI');
  const CHO = [
    ['superadmin@gita365.vn', true,  true],
    ['chuyenmon@gita365.vn',  true,  true],
    ['truongcoach@gita365.vn',true,  false],
    ['coach@gita365.vn',      false, false],
    ['phuhuynh@gita365.vn',   false, false],
    ['hocvien@gita365.vn',    false, false]
  ];
  for (const [u, choIn, choSheet] of CHO) {
    const r = await p.evaluate(x => {
      const a = window.G.ACCOUNTS.filter(y => y.u === x)[0];
      window.G.S.acc = a; window.G.S.role = a.role; window.G.S.roleObj = window.G.roleById(a.role);
      return { vai: a.role, in: window.G.coTheIn(), sheet: window.G.can('xuat_sheet'), cong: window.G.inTrang('thử') };
    }, u);
    bao(r.in === choIn && r.sheet === choSheet && r.cong === choIn,
      u.padEnd(24) + r.vai, 'in=' + r.in + ' sheet=' + r.sheet + ' cổng=' + r.cong);
  }

  console.log('\n3 · TRÌNH ĐƠN CỦA TIẾN TRÌNH CHÍNH');
  /* Đúng câu lệnh mà main.js chạy trước khi cho Xuất PDF và Sao lưu */
  const CAU = '(function(){ try{ return !!(window.G && window.G.S && window.G.S.acc && window.G.coTheIn && window.G.coTheIn()); }catch(e){ return false; } })()';
  await p.evaluate(() => {
    const a = window.G.ACCOUNTS.filter(y => y.u === 'phuhuynh@gita365.vn')[0];
    window.G.S.acc = a; window.G.S.role = a.role; window.G.S.roleObj = window.G.roleById(a.role);
  });
  bao((await p.evaluate(CAU)) === false, 'trình đơn Xuất PDF và Sao lưu bị khoá với phụ huynh');
  await p.evaluate(() => {
    const a = window.G.ACCOUNTS.filter(y => y.u === 'chuyenmon@gita365.vn')[0];
    window.G.S.acc = a; window.G.S.role = a.role; window.G.S.roleObj = window.G.roleById(a.role);
  });
  bao((await p.evaluate(CAU)) === true, 'trình đơn mở cho Quản lý chuyên môn');

  console.log('\n4 · CÓ ĐỦ PHẦN MỚI');
  const co = await p.evaluate(() => ({
    dongBo: typeof window.G.dongBo, danhDau: typeof window.G.danhDau,
    doiMK: typeof window.G.moDoiMatKhau, quenMK: typeof window.G.moQuenMatKhau,
    kiemBan: typeof window.G.kiemBanMoi
  }));
  bao(co.dongBo === 'function' && co.danhDau === 'function', 'có đồng bộ App ↔ Web');
  bao(co.doiMK === 'function' && co.quenMK === 'function', 'có đổi và lấy lại mật khẩu');
  bao(co.kiemBan === 'function', 'có kiểm bản mới của ứng dụng');

  console.log('\n5 · KHÔNG LỖI TRANG');
  bao(!errs.length, 'không lỗi nào khi chạy', errs.join(' | ') || 'sạch');

  await app.close();
  console.log('\n' + (loi ? '✗ CÒN ' + loi + ' ĐIỂM CHƯA ĐẠT' : '✓ TOÀN BỘ ĐẠT — bản máy tính chạy đúng'));
  process.exit(loi ? 1 : 0);
})().catch(e => { console.error('\n✗ ' + e.message); process.exit(1); });
