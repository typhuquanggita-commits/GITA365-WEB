#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GITA 365 — THỬ MÁY CHỦ CẤP KHOÁ CỦA BẢN MÁY TÍNH (desktop/may-chu.js)

       node tools/thu-may-chu-may-tinh.mjs

   Bản .exe bật được một máy chủ trong mạng nội bộ để máy khác vào dùng.
   Máy chủ ấy KHÔNG hỏi mật khẩu — nó dựa vào việc chủ hệ thống DUYỆT
   từng máy. Nên hai thứ phải đúng, và đây là hai thứ soát an ninh
   9/10/2026 tìm ra là sai:

     1. Dấu của một máy phải KHÔNG CHÉP ĐƯỢC. Bản cũ lấy địa chỉ mạng +
        chuỗi trình duyệt, máy khác sau cùng bộ phát wifi giả được.
        Nay là mã ngẫu nhiên trong cookie HttpOnly.
     2. Duyệt một máy là duyệt cho ĐÚNG MỘT tài khoản. Bản cũ ghi đè tài
        khoản ở mỗi lượt xin: máy đã duyệt cho một Coach gõ tên Super
        Admin là nhận khoá của Super Admin.

   Không cần Electron, không cần mạng ngoài, không cần khoá kho thật.
   ═══════════════════════════════════════════════════════════════ */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';

const require = createRequire(import.meta.url);
const mayChu = require('../desktop/may-chu.js');

let loi = 0;
const bao = (ok, ten, ct) => { if (!ok) loi++; console.log((ok ? '  ✓ ' : '  ✗ ') + ten + (ct ? ' — ' + ct : '')); };

const tam = fs.mkdtempSync(path.join(os.tmpdir(), 'gita-may-chu-'));
fs.writeFileSync(path.join(tam, 'index.html'), '<!doctype html><title>thu</title>');
const tepMay = path.join(tam, 'may-quen.json');
const CONG = 18365 + Math.floor(Math.random() * 500);
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0 Safari/537.36';

function goi(phuongThuc, duong, than, cookie) {
  return new Promise((thanh, hong) => {
    const d = than ? JSON.stringify(than) : '';
    const r = http.request({ host: '127.0.0.1', port: CONG, method: phuongThuc, path: duong,
      headers: { 'user-agent': UA, 'content-type': 'application/json',
        ...(cookie ? { cookie } : {}), ...(d ? { 'content-length': Buffer.byteLength(d) } : {}) } }, res => {
      let b = '';
      res.on('data', c => { b += c; });
      res.on('end', () => {
        let j = null; try { j = JSON.parse(b); } catch { /* trang tĩnh */ }
        thanh({ ma: res.statusCode, j, datCookie: res.headers['set-cookie'] || [] });
      });
    });
    r.on('error', hong);
    if (d) r.write(d);
    r.end();
  });
}
const layCookie = ds => { const c = (ds[0] || '').split(';')[0]; return /^gita_may=/.test(c) ? c : ''; };

await mayChu.bat({
  goc: tam, cong: CONG,
  layKhoaGoc: () => ({}),
  layBangCap: () => ({ 'coach@gita365.vn': { vai: 'R07', goi: [] }, 'superadmin@gita365.vn': { vai: 'R01', goi: [] } }),
  ghiNhatKy: () => {},
  tepMayQuen: tepMay
});

try {
  console.log('\n— Dấu máy là mã ngẫu nhiên, không phải địa chỉ + trình duyệt');
  const r1 = await goi('GET', '/');
  const c1 = layCookie(r1.datCookie);
  bao(!!c1, 'Lượt đầu nhận cookie gita_may', c1 ? 'có' : 'không có Set-Cookie');
  const thuocTinh = (r1.datCookie[0] || '');
  bao(/HttpOnly/i.test(thuocTinh) && /SameSite=Strict/i.test(thuocTinh), 'Cookie mang HttpOnly và SameSite=Strict', thuocTinh.replace(/gita_may=[^;]+/, 'gita_may=…'));
  const r1b = await goi('GET', '/', null, c1);
  bao(!r1b.datCookie.length, 'Đã có cookie thì không phát mã mới');

  console.log('\n— Máy lạ phải chờ duyệt');
  const x1 = await goi('POST', '/cap-phep', { fn: 'capKhoa', u: 'Coach@gita365.vn', goi: [] }, c1);
  bao(x1.ma === 403 && x1.j && x1.j.code === 'CHODUYET', 'Máy chưa duyệt → CHODUYET', String(x1.ma) + ' ' + (x1.j && x1.j.code));
  const ds = mayChu.danhSachMay();
  bao(ds.length === 1 && ds[0].taiKhoan === 'coach@gita365.vn', 'Danh sách duyệt hiện đúng tài khoản (đã chuẩn hoá chữ thường)', ds.map(m => m.taiKhoan).join(','));

  mayChu.datMay(ds[0].van, 'thuan');

  console.log('\n— Đã duyệt: đúng tài khoản được, tài khoản khác bị chặn');
  const x2 = await goi('POST', '/cap-phep', { fn: 'capKhoa', u: 'coach@gita365.vn', goi: [] }, c1);
  bao(x2.ma === 200 && x2.j && x2.j.ok && x2.j.phien, 'Tài khoản được duyệt nhận phiên', String(x2.ma));
  const x3 = await goi('POST', '/cap-phep', { fn: 'capKhoa', u: 'superadmin@gita365.vn', vai: 'R01', goi: [] }, c1);
  bao(x3.ma === 403 && x3.j && x3.j.code === 'SAITAIKHOAN', 'Máy duyệt cho Coach xin khoá Super Admin → SAITAIKHOAN', String(x3.ma) + ' ' + (x3.j && x3.j.code));
  bao(mayChu.danhSachMay()[0].taiKhoan === 'coach@gita365.vn', 'Lượt xin sai không ghi đè tài khoản đã duyệt');

  console.log('\n— Cùng địa chỉ, cùng trình duyệt nhưng KHÁC cookie = máy khác');
  const r4 = await goi('GET', '/');
  const c4 = layCookie(r4.datCookie);
  const x4 = await goi('POST', '/cap-phep', { fn: 'capKhoa', u: 'coach@gita365.vn', goi: [] }, c4);
  bao(x4.ma === 403 && x4.j && x4.j.code === 'CHODUYET', 'Giả cùng IP + UA không mượn được dấu máy đã duyệt', String(x4.ma) + ' ' + (x4.j && x4.j.code));
  const gia = await goi('POST', '/cap-phep', { fn: 'capKhoa', u: 'coach@gita365.vn', goi: [] }, 'gita_may=AAAAAAAAAAAAAAAAAAAAAAAA');
  bao(gia.ma === 403 && gia.j && gia.j.code === 'CHODUYET', 'Cookie tự bịa không phải máy đã duyệt', String(gia.ma));

  console.log('\n— Quên máy thì phải duyệt lại');
  mayChu.datMay(mayChu.danhSachMay().find(m => m.duyet === 'thuan').van, 'quen');
  const x5 = await goi('POST', '/cap-phep', { fn: 'capKhoa', u: 'coach@gita365.vn', goi: [] }, c1);
  bao(x5.ma === 403 && x5.j && x5.j.code === 'CHODUYET', 'Sau "Quên máy" cùng cookie phải chờ duyệt lại', String(x5.ma));

  console.log('\n— Kho gốc không bao giờ rời máy chủ');
  const k = await goi('GET', '/kho/nen.enc', null, c1);
  bao(k.ma === 403, '/kho/*.enc bị chặn', String(k.ma));
} finally {
  mayChu.tat();
  fs.rmSync(tam, { recursive: true, force: true });
}

console.log(loi ? '\n✗ ' + loi + ' chỗ hỏng' : '\n✓ Máy chủ cấp khoá bản máy tính: đạt');
process.exit(loi ? 1 : 0);
