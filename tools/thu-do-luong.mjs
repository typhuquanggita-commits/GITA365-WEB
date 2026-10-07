/* Thử ĐO LƯỜNG TOÀN DIỆN KHÁCH HÀNG — D1 giả = node:sqlite trong RAM.
   Chứng minh: chỉ nhà gửi số đo của mình · thời gian giữ MAX (gửi lại không
   cộng dồn), trần 16 giờ · sự kiện một lần · gom đúng từng nguồn · sáu điểm
   + tầng chăm sóc · quyền xem (nhà rút gọn · Coach chỉ nhà mình · R12 ẩn
   danh) · chốt tháng một lần · công thức app KHỚP máy chủ.
   Dùng: node tools/thu-do-luong.mjs   (Node >= 22.5) */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import vm from 'node:vm';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = process.argv[2] || fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const M = await import(pathToFileURL(ROOT + '/may-chu/do-luong-kh.js').href);
const CH = await import(pathToFileURL(ROOT + '/may-chu/do-luong-cham.js').href);

const sq = new DatabaseSync(':memory:');
sq.exec(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8'));
const db = { prepare(sql) { let a = []; const st = {
  bind(...x) { a = x; return st; },
  first() { return Promise.resolve(sq.prepare(sql).get(...a) || null); },
  all() { return Promise.resolve({ results: sq.prepare(sql).all(...a) }); },
  run() { const r = sq.prepare(sql).run(...a); return Promise.resolve({ meta: { changes: Number(r.changes) } }); } }; return st; } };
let dat = 0, truot = 0;
const kiem = (ten, dk) => { if (dk) { dat++; console.log('OK  ' + ten); } else { truot++; console.log('SAI ' + ten); } };

const hn = new Date().toISOString().slice(0, 10), thang = hn.slice(0, 7);
const lui = n => { const d = new Date(hn + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() - n); return d.toISOString().slice(0, 10); };
const dsNgay = []; for (let i = 0; i < 20; i++) { const d = lui(i); if (d.slice(0, 7) === thang) dsNgay.push(d); }
const u = (id, un, role, mk) => sq.prepare('INSERT INTO users (id, username, role, active, maKhachHang) VALUES (?, ?, ?, 1, ?)').run(id, un, role, mk || null);
u('P1', 'ph1', 'R13', 'K1'); u('P2', 'ph2', 'R13', 'K2'); u('P3', 'ph3', 'R13', 'K3');
u('C1', 'coach1', 'R07'); u('C2', 'coach2', 'R07'); u('T5', 'tn', 'R05'); u('A4', 'qlcm', 'R04'); u('D12', 'pt', 'R12'); u('A1', 'chu', 'R01');
const vao = lui(80);
sq.prepare("INSERT INTO hoSoKhach (maKhachHang, uidPhuHuynh, tang, coach, band, vaoLuc) VALUES ('K1','P1',3,'coach1','XANH',?)").run(vao);
sq.prepare("INSERT INTO hoSoKhach (maKhachHang, uidPhuHuynh, tang, coach, band, vaoLuc) VALUES ('K2','P2',2,'coach2','DO',?)").run(vao);
sq.prepare("INSERT INTO hoSoKhach (maKhachHang, uidPhuHuynh, tang, coach, band, vaoLuc, boTro) VALUES ('K3','P3',1,'coach1','VANG',?,'K1')").run(lui(3));
const hs = (uid, un, role, mk) => ({ uid, u: un, role, maKhachHang: mk || '' });
const P1 = hs('P1', 'ph1', 'R13', 'K1'), C1 = hs('C1', 'coach1', 'R07'), C2 = hs('C2', 'coach2', 'R07'), TN = hs('T5', 'tn', 'R05'),
  A4 = hs('A4', 'qlcm', 'R04'), D12 = hs('D12', 'pt', 'R12'), A1 = hs('A1', 'chu', 'R01');

/* ── gửi số đo ── */
kiem('nhân sự không gửi số đo thay nhà', (await M.guiSoDoKH({ thoiGian: {} }, {}, db, C1)).code === 'NOPERM');
const tg = {}; dsNgay.slice(0, 3).forEach(d => { tg[d] = { 'khoa-dao-tao': 1800, 'hom-nay': 600, '__tong': 2400 }; });
let r = await M.guiSoDoKH({ thoiGian: tg }, {}, db, P1);
kiem('nhà gửi thời gian 3 ngày (9 dòng)', r.ok && r.soMan === 9);
const tg2 = {}; tg2[dsNgay[0]] = { 'khoa-dao-tao': 900, '__tong': 3000, 'sat-hach': 99999 };
r = await M.guiSoDoKH({ thoiGian: tg2 }, {}, db, P1);
const kdt = sq.prepare("SELECT giay FROM thoiGianNgay WHERE maNha='K1' AND ngay=? AND man='khoa-dao-tao'").get(dsNgay[0]).giay;
kiem('gửi lại số nhỏ hơn: giữ MAX (1800), không cộng dồn; số vượt 16 giờ bị bỏ', kdt === 1800 && r.boQua === 1 &&
  sq.prepare("SELECT giay FROM thoiGianNgay WHERE maNha='K1' AND ngay=? AND man='__tong'").get(dsNgay[0]).giay === 3000);
r = await M.guiSoDoKH({ suKien: [{ loai: 'bai_hoc', ma: 'B1', ngay: dsNgay[0] }, { loai: 'bai_hoc', ma: 'B1' }, { loai: 'bai_hoc', ma: 'B2', ngay: dsNgay[1] },
  { loai: 'test', ma: 'T1', giaTri: 80, ngay: dsNgay[1] }, { loai: 'sat_hach', ma: 'S1', giaTri: 90, ngay: dsNgay[2] }, { loai: 'cam_xuc', ma: dsNgay[0], giaTri: 4 },
  { loai: 'test', ma: 'T9', giaTri: 150 }, { loai: 'la', ma: 'x' }, { loai: 'nhat_ky', ma: dsNgay[0], ngay: dsNgay[0] }] }, {}, db, P1);
kiem('sự kiện: trùng mã không ghi lần hai, điểm ngoài khoảng và loại lạ bị bỏ', r.soSuKienMoi === 6 && r.boQua === 2);

/* ── khảo sát ── */
kiem('khảo sát sai khoảng bị chặn', !(await M.guiDanhGiaKH({ nps: 11, csat: 5 }, {}, db, P1)).ok);
kiem('khảo sát hài lòng tháng', (await M.guiDanhGiaKH({ nps: 9, csat: 5, ghiChu: 'Con tiến bộ rõ' }, {}, db, P1)).ok);

/* ── nguồn của module khác ── */
dsNgay.slice(0, 10).forEach((d, i) => sq.prepare('INSERT INTO nhipXong (id,maNha,maNhip,ngay,bo,boiAi,ghiLuc) VALUES (?,?,?,?,0,?,?)').run('NX' + i, 'K1', 'N', d, 'p', d));
sq.prepare('INSERT INTO nhipXong (id,maNha,maNhip,ngay,bo,boiAi,ghiLuc) VALUES (?,?,?,?,1,?,?)').run('NXb', 'K1', 'N2', dsNgay[0], 'p', dsNgay[0]);
dsNgay.slice(0, 4).forEach((d, i) => sq.prepare('INSERT INTO baoCaoNgay (id,uid,maKhachHang,ngay,baiHoc,phutHoc,kpi) VALUES (?,?,?,?,1,45,80)').run('BC' + i, 'P1', 'K1', d));
sq.prepare("INSERT INTO soCham (id,maNha,ngay,kieu,noiDung,canCu,aiDuyet,boiAi,ghiLuc) VALUES ('CH1','K1',?,'goi','x','y','z','coach1',?)").run(dsNgay[0], dsNgay[0]);
sq.prepare("INSERT INTO phieuThu (id,maKhachHang,soTien,hinhThuc,nguoiGhi,ghiLuc,trangThai) VALUES ('PT1','K1',10000000,'chuyenKhoan','nv',?,'daDuyet')").run(dsNgay[1] + 'T08:00:00Z');
sq.prepare("INSERT INTO kyThu (id,maKhachHang,tang,ky,soKy,ngayThu,phaiThu,hanLuc,taoLuc) VALUES ('KY1','K2',2,1,1,1,3000000,?,?)").run(lui(40), lui(40));
sq.prepare("INSERT INTO lichSuTang (id,maKhachHang,tuTang,denTang,luc) VALUES ('L1','K1',2,3,?)").run(dsNgay[2] + 'T09:00:00Z');
sq.exec("CREATE TABLE IF NOT EXISTS soCredit (id TEXT PRIMARY KEY, maNha TEXT, loai TEXT, so INTEGER, viec TEXT, khoaDuy TEXT, tang INTEGER, cap INTEGER, thamChieu TEXT, ghiChu TEXT, boiAi TEXT, luc TEXT)");
['nv', 'mc', 'cong'].forEach((v, i) => sq.prepare("INSERT INTO soCredit (id,maNha,loai,so,viec,khoaDuy,luc) VALUES (?, 'K1', 'thuong', 500, ?, ?, ?)").run('CR' + i, 'thuong:' + v, 'k' + i, dsNgay[0] + 'T10:00:00Z'));
sq.prepare("INSERT INTO audit (id,luc,uid,viec) VALUES ('AU1',?, 'P1','DANG_NHAP')").run(dsNgay[0] + 'T07:00:00Z');
sq.prepare("INSERT INTO audit (id,luc,uid,viec) VALUES ('AU2',?, 'P1','DANG_NHAP')").run(dsNgay[1] + 'T07:00:00Z');

/* ── gom ── */
const G = await M.gomThang(db, thang, null), d1 = G.D.K1, d2 = G.D.K2;
kiem('ngày hoạt động = hợp mọi nguồn (10 ngày tick, không đếm trùng)', d1.ngayHoatDong === Math.min(10, dsNgay.length));
kiem('phút học từ màn học (3 ngày × 30 phút = 90)', d1.phutHocApp === 90 && d1.phutNhom.thucHanh === 30);
kiem('bài hoàn thành = 2 bài học + 1 test + 1 sát hạch; điểm TB 85', d1.hoanThanh === 4 && d1.diemTB === 85);
kiem('tick đủ số ngày (tối đa 10), 1 việc bỏ; 4 báo cáo, 180 phút báo cáo', d1.ngayTick === Math.min(10, dsNgay.length) && d1.soBo === 1 && d1.soBaoCao === 4 && d1.phutHocBaoCao === 180);
kiem('việc được Coach duyệt = 3, cảm xúc 4, NPS 9, CSAT 5', d1.viecDuyet === 3 && d1.camXuc === 4 && d1.nps === 9 && d1.csat === 5);
kiem('tài chính: thu tháng 10 triệu, LTV 10 triệu, không nợ; K2 nợ 3 triệu', d1.thuThang === 10000000 && d1.ltv === 10000000 && d1.no === 0 && d2.no === 3000000);
kiem('lên tầng trong tháng, 2 lần đăng nhập, giới thiệu 1 nhà, 1 lượt gọi', d1.lenTang && d1.dangNhap === 2 && d1.gioiThieu === 1 && d1.cham.goi === 1);
kiem('nhà không hoạt động: im lặng tính từ khi vào', d2.ngayHoatDong === 0 && d2.imLang >= 1);

/* ── hồ sơ & quyền ── */
const hoNha = await M.hoSoDoLuongKH({}, {}, db, P1);
kiem('nhà xem hồ sơ của mình: BẢN RÚT GỌN (không có tiềm năng, rủi ro, tầng chăm sóc)', hoNha.ok && hoNha.vai === 'nha' && hoNha.ho.diem.ganKet != null &&
  hoNha.ho.diem.tiemNang === undefined && hoNha.ho.tangCS === undefined && hoNha.xuHuong.length === 6);
const hoCoach = await M.hoSoDoLuongKH({ maNha: 'K1' }, {}, db, C1);
kiem('Coach của nhà xem đủ hồ sơ, có tầng chăm sóc và lý do', hoCoach.ok && hoCoach.ho.diem.tiemNang != null && /[A-E]/.test(hoCoach.ho.tangCS) && Array.isArray(hoCoach.ho.lyDo));
kiem('Coach khác không xem được', (await M.hoSoDoLuongKH({ maNha: 'K1' }, {}, db, C2)).code === 'NOPERM');

/* ── xếp hạng ── */
const xhC = await M.xepHangKH({}, {}, db, C1), xhT = await M.xepHangKH({}, {}, db, TN);
kiem('Coach chỉ thấy nhà mình phụ trách (K1, K3)', xhC.ok && xhC.ds.every(x => x.coach === 'coach1') && xhC.ds.length === 2);
kiem('Trưởng nhóm thấy cả hệ, xếp theo tiềm năng giảm dần', xhT.ok && xhT.ds.length === 3 && xhT.ds[0].diem.tiemNang >= xhT.ds[1].diem.tiemNang);
const tK2 = xhT.ds.find(x => x.maNha === 'K2'), tK1 = xhT.ds.find(x => x.maNha === 'K1');
kiem('K2 không hoạt động cả tháng → tầng E (ngủ đông)', tK2.tangCS === 'E');
kiem('K1 hoạt động đều: tầng đúng luật, rủi ro thấp, tiềm năng trên nhà ngủ đông', tK1.tangCS === CH.xepTang(tK1.diem, { ngayHoatDong: tK1.ngayHoatDong }) &&
  tK1.diem.ruiRo < 40 && tK1.diem.tiemNang > tK2.diem.tiemNang);
const manh = { ngayHoatDong: 22, phutHocApp: 700, ngayTick: 21, soBaoCao: 14, viecDuyet: 11, hoanThanh: 12, diemTB: 88, soNgayThang: 30, lenTang: true, nps: 10, csat: 5, ltv: 30000000, tang: 4, no: 0, imLang: 0, gioiThieu: 1 };
kiem('hồ sơ mạnh cả tháng → tầng A; tụt mạnh + im lặng 14 ngày + nợ → tầng D', CH.xepTang(CH.chamDiem(manh), manh) === 'A' &&
  CH.xepTang(CH.chamDiem(Object.assign({}, manh, { ngayHoatDong: 6, phutHocApp: 90, ngayTick: 5, soBaoCao: 1, viecDuyet: 1, imLang: 14, no: 1 }), { ganKet: 100 }), manh) === 'D');
const giua = Object.assign({}, manh, { soNgayThang: 7, ngayHoatDong: 6, phutHocApp: 200, ngayTick: 6, soBaoCao: 4, viecDuyet: 3, hoanThanh: 4 });
kiem('ngày 7 của tháng: mục tiêu co theo ngày đã qua, nhà chăm không bị chấm thấp', CH.chamDiem(giua).ganKet >= 75);
kiem('nhà mới vào (K3) không bị xếp ngủ đông', xhT.ds.find(x => x.maNha === 'K3').tangCS !== 'E');
kiem('Phân tích dữ liệu không xem xếp hạng từng nhà', (await M.xepHangKH({}, {}, db, D12)).code === 'NOPERM');

/* ── báo cáo tháng ── */
const bc = await M.baoCaoThangHe({}, {}, db, A4), bcAn = await M.baoCaoThangHe({}, {}, db, D12);
kiem('báo cáo toàn hệ: đủ khối, có màn dùng nhiều nhất', bc.ok && bc.soNha === 3 && bc.sanPham.man[0].man === 'khoa-dao-tao' && bc.haiLong.nps === 100 && bc.taiChinh.thuThang === 10000000);
kiem('bản ẩn danh cho R12: không mã nhà, không tài chính, không bình luận', bcAn.ok && bcAn.anDanh && bcAn.taiChinh === null &&
  !/"K[123]"/.test(JSON.stringify(bcAn)) && bcAn.haiLong.binhLuan.length === 0);
kiem('Coach không xem báo cáo toàn hệ', (await M.baoCaoThangHe({}, {}, db, C1)).code === 'NOPERM');

/* ── chốt ── */
kiem('không chốt tháng chưa kết thúc', !(await M.chotBaoCaoThang({ thang }, {}, db, A4)).ok);
const [yy, mm] = thang.split('-').map(Number), thTruoc = mm === 1 ? (yy - 1) + '-12' : yy + '-' + String(mm - 1).padStart(2, '0');
const ch = await M.chotBaoCaoThang({ thang: thTruoc }, {}, db, A4);
kiem('chốt tháng trước: lưu hồ sơ tháng cho cả 3 nhà', ch.ok && ch.soNha === 3);
kiem('chốt lại cùng tháng bị chặn (không ghi đè)', (await M.chotBaoCaoThang({ thang: thTruoc }, {}, db, A1)).code === 'DACHOT');
const ls = await M.dsHoSoThang({}, {}, db, P1);
kiem('nhà xem lịch sử hồ sơ tháng đã chốt — bản rút gọn', ls.ok && ls.ds.length === 1 && ls.ds[0].diem.tiemNang === undefined);

/* ── công thức app KHỚP máy chủ ── */
const ctx = { window: {} }; ctx.window.G = {}; ctx.G = ctx.window.G; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(ROOT + '/src/data-do-luong.js', 'utf8'), ctx);
const DL = ctx.G.DL;
kiem('phiên bản công thức app = máy chủ', DL.PHIEN_BAN_DO === CH.PHIEN_BAN_DO);
let lech = 0, hat = 11;
const rnd = () => { hat = (hat * 9301 + 49297) % 233280; return hat / 233280; };
for (let i = 0; i < 400; i++) {
  const d = { ngayHoatDong: Math.floor(rnd() * 31), phutHocApp: Math.floor(rnd() * 900), phutHocBaoCao: Math.floor(rnd() * 700), ngayTick: Math.floor(rnd() * 31),
    soBaoCao: Math.floor(rnd() * 20), viecDuyet: Math.floor(rnd() * 15), hoanThanh: rnd() < 0.2 ? null : Math.floor(rnd() * 20), diemTB: rnd() < 0.3 ? null : Math.floor(rnd() * 100),
    soNgayThang: rnd() < 0.3 ? 1 + Math.floor(rnd() * 30) : 30, lenTang: rnd() < 0.1, nps: rnd() < 0.5 ? null : Math.floor(rnd() * 11), csat: rnd() < 0.5 ? null : 1 + Math.floor(rnd() * 5),
    camXuc: rnd() < 0.5 ? null : 1 + rnd() * 4, daHoan: rnd() < 0.05, ltv: Math.floor(rnd() * 60000000), tang: 1 + Math.floor(rnd() * 5), no: rnd() < 0.2 ? 1000 : 0,
    imLang: Math.floor(rnd() * 30), band: rnd() < 0.2 ? 'DO' : 'XANH', gioiThieu: Math.floor(rnd() * 3), moi: rnd() < 0.1 };
  const truoc = rnd() < 0.5 ? { ganKet: Math.floor(rnd() * 100) } : null;
  const a = CH.chamDiem(d, truoc), b = DL.chamDiem(d, truoc);
  if (JSON.stringify(a) !== JSON.stringify(b) || CH.xepTang(a, d) !== DL.xepTang(b, d) || JSON.stringify(CH.lyDo(a, d)) !== JSON.stringify(DL.lyDo(b, d))) lech++;
}
kiem('400 bộ số ngẫu nhiên: sáu điểm, tầng chăm sóc và lý do của app khớp máy chủ', lech === 0);

console.log('\n' + dat + ' đạt · ' + truot + ' sai');
process.exit(truot ? 1 : 0);
