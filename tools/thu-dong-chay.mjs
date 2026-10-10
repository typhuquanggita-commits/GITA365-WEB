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
const kiem = (ten, dk, ct) => { if (dk) { dat++; console.log('OK  ' + ten); } else { truot++; console.log('SAI ' + ten + (ct ? '  ← ' + ct : '')); } };
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
sq.prepare("INSERT INTO chiPhi (id, khoanMuc, soTien, ngayChi, hinhThuc, dienGiai, nguoiDeXuat, deXuatLuc, trangThai) VALUES ('C1','thue-may-chu',40,?,'chuyenKhoan','x','nv',?,'daDuyet')").run(hn, hn);
/* đề xuất chưa duyệt / bị từ chối KHÔNG là chi phí */
sq.prepare("INSERT INTO chiPhi (id, khoanMuc, soTien, ngayChi, hinhThuc, dienGiai, nguoiDeXuat, deXuatLuc, trangThai) VALUES ('C2','x',500,?,'chuyenKhoan','x','nv',?,'choDuyet')").run(hn, hn);
sq.prepare("INSERT INTO chiPhi (id, khoanMuc, soTien, ngayChi, hinhThuc, dienGiai, nguoiDeXuat, deXuatLuc, trangThai) VALUES ('C3','x',700,?,'chuyenKhoan','x','nv',?,'tuChoi')").run(hn, hn);
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
kiem('dòng chi phí: tổng 40 (chỉ khoản đã duyệt) · lương kỳ 2026-09 đọc được', d.chiPhi.tong === 40 && d.chiPhi.luong && d.chiPhi.luong.ky === '2026-09');
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


/* ── SỬA 10/2026: một chỉ số hỏng không kéo sập cả cửa ──
   Bản đầu: bảng thêm sau chưa có trên D1 cũ → câu ấy ném → cả cửa 500 →
   ba lượt thì máy khách ngắt cả ứng dụng ("máy chủ không trả lời"). */
const tu365 = new Date(Date.now() - 365 * 86400e3).toISOString().slice(0, 10);
const truoc = new Date(Date.parse(tu365) - 86400e3).toISOString().slice(0, 10);
sq.prepare("INSERT INTO phieuThu (id, maKhachHang, soTien, hinhThuc, nguoiGhi, ghiLuc, trangThai) VALUES ('PB1','K09',7,'chuyenKhoan','nv',?,'daDuyet')").run(tu365 + 'T00:00:01.000Z');
sq.prepare("INSERT INTO phieuThu (id, maKhachHang, soTien, hinhThuc, nguoiGhi, ghiLuc, trangThai) VALUES ('PB2','K09',1000,'chuyenKhoan','nv',?,'daDuyet')").run(truoc + 'T23:59:59.000Z');
const d365 = await docDongChay({ ngay: 365 }, {}, db, r01);
kiem('lọc ngày đi chỉ mục vẫn giữ đúng biên: phiếu ĐÚNG ngày bắt đầu được tính, phiếu hôm trước thì không',
  d365.ok && d365.tien.thu === 307);
const dongChayMa = fs.readFileSync(ROOT + '/may-chu/dong-chay.js', 'utf8');
/* Bỏ chú giải trước khi dò: chú giải đầu tệp KỂ về chính cái bẫy này. */
const maKhongChu = dongChayMa.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
kiem('không còn lọc ngày bằng substr(cot,1,10) >= ? (substr chặn chỉ mục, quét trọn sổ audit một năm)',
  !/substr\(\s*\w+\s*,\s*1\s*,\s*1[09]\s*\)\s*[<>]=?\s*\?/.test(maKhongChu));
const keHoach = sq.prepare('EXPLAIN QUERY PLAN SELECT COUNT(*) n FROM audit WHERE luc >= ?').all(tu365).map(r => r.detail).join(' | ');
kiem('câu đếm sổ audit theo kỳ dùng chỉ mục ix_audit_luc', /ix_audit_luc/.test(keHoach), keHoach);

/* Giả một D1 cũ: hai bảng thêm sau chưa có. */
sq.exec('DROP TABLE thanhTraSo; DROP TABLE soTokenDaTri;');
const dCu = await docDongChay({ ngay: 365 }, {}, db, r01);
kiem('D1 thiếu bảng: cửa VẪN trả ok, không ném 500', dCu.ok === true);
kiem('chỉ số hỏng ghi tên vào chuaDo (không kèm lời lỗi CSDL)',
  Array.isArray(dCu.chuaDo) && dCu.chuaDo.length === 2 && dCu.chuaDo.some(t => /B01/.test(t)) && dCu.chuaDo.includes('Token AI') &&
  !/no such table|thanhTraSo|soTokenDaTri/.test(JSON.stringify(dCu.chuaDo)));
kiem('chỉ số hỏng là null — không đọc ra như số 0; ban chỉ có chỉ số ấy thành "chưa đo được"',
  dCu.chiPhi.aiToken === null && dCu.ban.B01.chiSo[0].giaTri === null && dCu.ban.B01.danhGia === 'chua-do');
kiem('phần còn lại vẫn đúng (thu kỳ 365 ngày, ban B14 vẫn đỏ)',
  dCu.tien.thu === 307 && dCu.ban.B14.danhGia === 'can-nang-cap');
kiem('bảng đầy đủ thì chuaDo rỗng', Array.isArray(d.chuaDo) && d.chuaDo.length === 0);

/* Phá thử: bỏ lớp doRieng thì D1 thiếu bảng phải làm cửa ném. */
const { pathToFileURL: p2u } = await import('node:url');
const tamDuong = ROOT + '/may-chu/.thu-dong-chay-pha.mjs';
const maPha = dongChayMa.replace(/const doRieng = [\s\S]*?\n  \}\);\n/, 'const doRieng = (ten, fn) => fn();\n');
let phaNem = false;
fs.writeFileSync(tamDuong, maPha);
try {
  const { docDongChay: dcPha } = await import(p2u(tamDuong).href);
  try { await dcPha({ ngay: 365 }, {}, db, r01); } catch (e) { phaNem = true; }
} finally { fs.unlinkSync(tamDuong); }
kiem('PHÁ THỬ: bỏ lớp doRieng thì D1 thiếu bảng làm cửa ném (phép đo trên ĐỎ được)', maPha !== dongChayMa && phaNem);

/* ── Cầu dao máy khách: lỗi CÓ mã yêu cầu chỉ khoá đúng cửa ấy ── */
import vm from 'node:vm';
const nguonKhach = fs.readFileSync(ROOT + '/src/noi-may-chu.js', 'utf8');
function dungKhach(nguon, traLoi) {
  const goi = [];
  const win = { G: { U: { h: x => String(x), ic: () => '' }, API_CAP_PHEP: 'https://x.test/api', S: { acc: { u: 'a' } } } };
  const ctx = { window: win, document: { addEventListener() {}, querySelector: () => null, getElementById: () => null }, localStorage: { getItem: () => '', setItem() {}, removeItem() {} }, location: { origin: 'https://x.test', href: 'https://x.test/' },
    URL, console, Promise, JSON, Object, Date, Math, Number, String, Array,
    fetch: (u, o) => { const fn = JSON.parse(o.body).fn; goi.push(fn); return Promise.resolve(traLoi(fn)); } };
  ctx.G = win.G; vm.createContext(ctx); vm.runInContext(nguon, ctx);
  return { G: win.G, goi };
}
const tl = (status, ma, body) => ({ status, headers: { get: k => (k === 'x-gita-ma' ? ma : null) }, json: () => Promise.resolve(body) });
const traLoiHong = fn => fn === 'docDongChay' ? tl(500, 'M123', { ok: false, error: 'Máy chủ gặp trục trặc.' }) : tl(200, 'M9', { ok: true, fn });
async function chayCauDao(nguon) {
  const k = dungKhach(nguon, traLoiHong);
  for (let i = 0; i < 3; i++) await k.G.goiMayChu('docDongChay', { ngay: 365, i }, { moi: true });
  const lai = await k.G.goiMayChu('docDongChay', { ngay: 365, i: 9 }, { moi: true });
  const khac = await k.G.goiMayChu('docKhac', {}, { moi: true });
  return { lai, khac, goi: k.goi };
}
const cd = await chayCauDao(nguonKhach);
kiem('cầu dao: ba lượt 500 CÓ mã ở một cửa → cửa ấy tạm khoá với lời nói đúng chỗ (CUA_HONG), không gọi máy chủ thêm',
  cd.lai.code === 'CUA_HONG' && /M123/.test(cd.lai.error) && cd.goi.filter(f => f === 'docDongChay').length === 3, JSON.stringify(cd.lai));
kiem('cầu dao: các cửa KHÁC vẫn chạy (không còn "máy chủ không trả lời" cho cả ứng dụng)', cd.khac.ok === true && cd.khac.code !== 'NGAT');
const kMang = dungKhach(nguonKhach, () => tl(503, '', null));
for (let i = 0; i < 3; i++) await kMang.G.goiMayChu('ghiGi', { i });
kiem('cầu dao chung vẫn còn: ba lượt 5xx KHÔNG mã (Worker sập) → ngắt cả ứng dụng', (await kMang.G.goiMayChu('docKhac', {})).code === 'NGAT');
const nguonCu = nguonKhach.replace(/if\(r\.status >= 500 && !ma\) HONG_LIEN\+\+;[\s\S]*?else delete HONG_FN\[fn\];\n      \}/, 'if(r.status >= 500) HONG_LIEN++; else HONG_LIEN = 0;');
const cdCu = await chayCauDao(nguonCu);
kiem('PHÁ THỬ: trả cầu dao về bản cũ thì cửa khác bị NGAT (đúng lỗi chủ hệ chụp màn)', nguonCu !== nguonKhach && cdCu.khac.code === 'NGAT');

console.log(`\n${dat} đạt · ${truot} sai`);
process.exit(truot ? 1 : 0);
