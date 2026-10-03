/* Thử Truy vấn đa chiều — D1 giả = node:sqlite. Chứng minh: bốn dòng
   chảy tính đúng · bảng điểm ban đỏ đúng khi tín hiệu vượt ngưỡng ·
   tham số ngày hợp lệ · phân quyền.
   Dùng: node tools/thu-dong-chay.mjs   (Node >= 22.5) */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = process.argv[2] || fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const { docDongChay } = await import(pathToFileURL(ROOT + '/may-chu/dong-chay.js').href);

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
const hn = new Date().toISOString().slice(0, 10);
const homQua = new Date(Date.now() - 86400e3).toISOString().slice(0, 10);
const tuanTruoc = new Date(Date.now() - 5 * 86400e3).toISOString();

kiem('khách hàng không đọc được', (await docDongChay({}, {}, db, khach)).code === 'NOPERM');

/* Gieo dữ liệu: dòng tiền · chi phí · giá trị · công việc · tín hiệu xấu. */
sq.prepare("INSERT INTO phieuThu (id, maKhachHang, soTien, hinhThuc, nguoiGhi, ghiLuc, trangThai) VALUES ('P1','K01',100,'chuyenKhoan','nv',?,'daDuyet')").run(hn);
sq.prepare("INSERT INTO phieuThu (id, maKhachHang, soTien, hinhThuc, nguoiGhi, ghiLuc, trangThai) VALUES ('P2','K02',200,'chuyenKhoan','nv',?,'daDuyet')").run(hn);
sq.prepare("INSERT INTO phieuThu (id, maKhachHang, soTien, hinhThuc, nguoiGhi, ghiLuc, trangThai) VALUES ('P3','K03',999,'chuyenKhoan','nv',?,'choDuyet')").run(tuanTruoc);
sq.prepare("INSERT INTO hoanTien (id, maKhachHang, soTien, theoLuat, lyDo, nguoiDeXuat, deXuatLuc, trangThai) VALUES ('H1','K04',50,'luật','lý do','nv',?,'daDuyet')").run(hn);
sq.prepare("INSERT INTO hoaHongTra (id, nhaKem, nhaDuocKem, tangVuot, bac, phanTram, goiCanCu, soTien, trangThai, sinhLuc, traLuc) VALUES ('HH1','K05','K06',1,'B5',10,1000,30,'daTra',?,?)").run(hn, hn);
sq.prepare("INSERT INTO chiPhi (id, khoanMuc, soTien, ngayChi, hinhThuc, dienGiai, nguoiDeXuat, deXuatLuc) VALUES ('C1','thue-may-chu',40,?,'chuyenKhoan','x','nv',?)").run(hn, hn);
sq.prepare("INSERT INTO baiHocHoanThanh (id, maHocVien, maBai, ngay) VALUES ('B1','HV1','BAI1',?),('B2','HV1','BAI2',?),('B3','HV2','BAI1',?)").run(hn, hn, hn);
sq.prepare("INSERT INTO soCham (id, maNha, ngay, kieu, denLuc, noiDung, canCu, aiDuyet, boiAi, ghiLuc) VALUES ('S1','K01',?,'wow','XANH','n','c','a','b',?)").run(hn, hn);
sq.prepare("INSERT INTO soCham (id, maNha, ngay, kieu, denLuc, noiDung, canCu, aiDuyet, boiAi, ghiLuc) VALUES ('S2','K02',?,'nhan','DO','n','c','a','b',?)").run(hn, hn);
sq.prepare("INSERT INTO lichSuTang (id, maKhachHang, tuTang, denTang, luc) VALUES ('L1','K01',1,2,?)").run(hn);
sq.prepare("INSERT INTO khoGiaiPhapDaTri (ma, loai, cauHoi, tuKhoa, giaiPhap, trangThai, luc, lucSoat) VALUES ('GP-T','soan','cau hoi thu nghiem','cau hoi','gp','nhap',?,?)").run(Date.now(), Date.now());
sq.prepare("INSERT INTO tailieu (id, trangThai) VALUES ('T1','cho')").run();
sq.prepare("INSERT INTO crmKhach (maKH, henTiep, giaiDoan) VALUES ('K07',?,'donghanh')").run(homQua);
sq.prepare("INSERT INTO thanhTraSo (loai, mucDo, noiDung, boiAi, luc) VALUES ('baoCao','nang','n','a',?)").run(hn);
sq.prepare("INSERT INTO yeuCauXoa (id, maNha, boiAi, ghiLuc, hanXuLy) VALUES ('X1','K08','a',?,?)").run(tuanTruoc, homQua);
sq.prepare("INSERT INTO tuyenDaTri (ma, ten, cacChang, dangO, ketQua, trangThai, luc, lucSua) VALUES ('TY-T','t','[]',0,'[]','dangChay',?,?)")
  .run(Date.now() - 8 * 86400e3, Date.now() - 8 * 86400e3);
sq.prepare("INSERT INTO danhGiaDaTri (loai, ncc, tot, xau) VALUES ('soan','cf-workers-ai',3,4)").run();
sq.prepare("INSERT INTO bangLuong (id, ky, username, viTri, soDo, trongBoQua) VALUES ('BL1','2026-09','nv','v','{}',50)").run();
sq.prepare("INSERT INTO audit (id, luc, uid, username, viec) VALUES ('A1',?,'U1','chu','DA_TRI'),('A2',?,'U1','chu','DA_TRI')").run(new Date().toISOString(), new Date().toISOString());

const d = await docDongChay({ ngay: 30 }, {}, db, r01);
kiem('dòng tiền: thu 300 · hoàn 50 · hoa hồng 30 · ròng 220',
  d.ok && d.tien.thu === 300 && d.tien.hoan === 50 && d.tien.hoaHong === 30 && d.tien.rong === 220);
kiem('dòng chi phí: tổng 40 · lương kỳ 2026-09 đọc được', d.chiPhi.tong === 40 && d.chiPhi.luong && d.chiPhi.luong.ky === '2026-09');
kiem('dòng giá trị: 3 bài học · 1 WOW · 1 lên tầng', d.giaTri.baiHoc === 3 && d.giaTri.wow === 1 && d.giaTri.lenTang === 1);
kiem('dòng công việc: audit đếm được, việc nhiều nhất là DA_TRI', d.congViec.tongLuot >= 2 && d.congViec.top[0].viec === 'DA_TRI');

const doBan = m => d.ban[m].danhGia === 'can-nang-cap';
kiem('bảng điểm: mười ban đỏ đúng chỗ (B01·B03·B04·B05·B07·B08·B09·B11·B13·B14·B15)',
  doBan('B01') && doBan('B03') && doBan('B04') && doBan('B05') && doBan('B07') &&
  doBan('B08') && doBan('B09') && doBan('B11') && doBan('B13') && doBan('B14') && doBan('B15'));
kiem('bảng điểm: B06 đạt chuẩn (chỉ số tham chiếu), B10 ghi thật chưa đo được từ D1',
  d.ban.B06.danhGia === 'chuan' && d.ban.B10.danhGia === 'chua-do');
kiem('tham số ngày: 7 hợp lệ, giá trị lạ về 30',
  (await docDongChay({ ngay: 7 }, {}, db, r01)).ngay === 7 && (await docDongChay({ ngay: 13 }, {}, db, r01)).ngay === 30);
kiem('giới hạn thật được ghi ra (ngưỡng vận hành · AT5 · B10 ở CI)',
  d.gioiHan.length === 3 && /AT5/.test(d.gioiHan[1]));

console.log(`\n${dat} đạt · ${truot} sai`);
process.exit(truot ? 1 : 0);
