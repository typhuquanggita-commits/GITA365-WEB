/* Thử Cây tiền — D1 giả = node:sqlite trong RAM. Chứng minh: phân quyền ·
   kho trống báo thật · ba chỉ số tính đúng công thức · đích 90/90/20.
   Dùng: node tools/thu-cay-tien.mjs   (Node >= 22.5) */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = process.argv[2] || fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const { docKpiCayTien, DICH_CAY_TIEN } = await import(pathToFileURL(ROOT + '/may-chu/cay-tien.js').href);

const sq = new DatabaseSync(':memory:');
sq.exec(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8'));
const db = {
  prepare(sql) { let a = []; const st = {
    bind(...x) { a = x; return st; },
    first() { return Promise.resolve(sq.prepare(sql).get(...a) || null); },
    all() { return Promise.resolve({ results: sq.prepare(sql).all(...a) }); },
    run() { const r = sq.prepare(sql).run(...a); return Promise.resolve({ meta: { changes: Number(r.changes) } }); } }; return st; },
  async batch(ds) { for (const s of ds) await s.run(); }
};

const r01 = { uid: 'U1', u: 'chu', role: 'R01' }, khach = { uid: 'K', u: 'k', role: 'R20' };
let dat = 0, truot = 0;
const kiem = (ten, dk) => { if (dk) { dat++; console.log('OK  ' + ten); } else { truot++; console.log('SAI ' + ten); } };

kiem('khách hàng không đọc được KPI', (await docKpiCayTien({}, {}, db, khach)).code === 'NOPERM');
const trong = await docKpiCayTien({}, {}, db, r01);
kiem('kho trống: báo thật chưa có dữ liệu, không bịa số', trong.ok && trong.tong === 0 && !trong.kpi && /Chưa có khách/.test(trong.ghiChu));

/* 10 khách: K01–K02 tầng 5 · K09 nghỉ · K01–K05 tái dùng · K06 nâng cấp ·
   K08 hoàn tiền · K10 CRM rời. */
for (let i = 1; i <= 10; i++) {
  const ma = 'K' + String(i).padStart(2, '0');
  sq.prepare('INSERT INTO hoSoKhach (maKhachHang, uidPhuHuynh, tang, trangThai) VALUES (?, ?, ?, ?)')
    .run(ma, 'u' + i, i <= 2 ? 5 : 1, i === 9 ? 'nghi' : 'dangHoc');
}
for (let i = 1; i <= 10; i++) {
  const ma = 'K' + String(i).padStart(2, '0');
  sq.prepare("INSERT INTO phieuThu (id, maKhachHang, soTien, hinhThuc, nguoiGhi, ghiLuc, trangThai) VALUES (?, ?, 100, 'chuyenKhoan', 'nv', '2026-01-01', 'daDuyet')")
    .run('P' + i + 'a', ma);
  if (i <= 5)
    sq.prepare("INSERT INTO phieuThu (id, maKhachHang, soTien, hinhThuc, nguoiGhi, ghiLuc, trangThai) VALUES (?, ?, 100, 'chuyenKhoan', 'nv', '2026-02-01', 'daDuyet')")
      .run('P' + i + 'b', ma);
}
sq.prepare("INSERT INTO lichSuTang (id, maKhachHang, tuTang, denTang, luc) VALUES ('L1', 'K06', 1, 2, '2026-02-01')").run();
sq.prepare("INSERT INTO hoanTien (id, maKhachHang, soTien, theoLuat, lyDo, nguoiDeXuat, deXuatLuc, trangThai) VALUES ('H1', 'K08', 100, 'luật', 'lý do', 'nv', '2026-03-01', 'daDuyet')").run();
sq.prepare("INSERT INTO crmKhach (maKH, giaiDoan) VALUES ('K10', 'roi')").run();

const k = await docKpiCayTien({}, {}, db, r01);
const tim = ma => k.kpi.find(x => x.ma === ma);
kiem('đọc được KPI khi có dữ liệu', k.ok && k.tong === 10 && k.dangHoc === 9 && k.tang5 === 2);
kiem('tầng 5: 2/10 = 20% → đạt đích 20%', tim('TANG5').giaTri === 20 && tim('TANG5').dat === true);
kiem('tái dùng+nâng cấp: hợp(K01–K05 tái dùng, K06 nâng cấp) = 60%, chưa đạt 90%',
  tim('TAIDUNG').giaTri === 60 && tim('TAIDUNG').dat === false && tim('TAIDUNG').conThieu === 30);
kiem('hài lòng: 10 − 3 xấu (hoàn · rời · nghỉ) = 70%, thiếu 20 điểm',
  tim('HAILONG').giaTri === 70 && tim('HAILONG').dat === false && tim('HAILONG').conThieu === 20);
kiem('đích là 90 · 90 · 20, do chủ hệ đặt', DICH_CAY_TIEN.haiLong === 90 && DICH_CAY_TIEN.taiDungNangCap === 90 && DICH_CAY_TIEN.tang5 === 20);
kiem('hài lòng ghi rõ là proxy + chỗ trống không giấu', tim('HAILONG').proxy === true && k.khoangTrong.length > 0);

/* Một khách hoàn tiền VÀ rời khỏi CRM không bị đếm hai lần (UNION). */
sq.prepare("INSERT INTO crmKhach (maKH, giaiDoan) VALUES ('K08', 'roi')").run();
const k2 = await docKpiCayTien({}, {}, db, r01);
kiem('khách vừa hoàn tiền vừa "rời" vẫn chỉ tính MỘT dấu hiệu xấu', k2.kpi.find(t => t.ma === 'HAILONG').giaTri === 70);

console.log(`\n${dat} đạt · ${truot} sai`);
process.exit(truot ? 1 : 0);
