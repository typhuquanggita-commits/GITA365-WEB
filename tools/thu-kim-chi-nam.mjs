/* Thử kim chỉ nam ở đầu mọi màn khách (may-chu/kim-chi-nam.js · src/kim-chi-nam.js).
   D1 giả = node:sqlite. Dùng: node tools/thu-kim-chi-nam.mjs   (Node >= 22.5) */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = process.argv[2] || fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
globalThis.fetch = async () => { throw new Error('không gọi mạng ngoài'); };
let dat = 0, truot = 0;
const kiem = (ten, dk, ct) => { if (dk) { dat++; console.log('OK  ' + ten); } else { truot++; const d = 'SAI ' + ten + (ct ? ' — ' + ct : ''); console.log(d);
  if (process.env.GITHUB_ACTIONS) console.log('::error title=thu-kim-chi-nam::' + d.replace(/[\r\n%]/g, ' ').slice(0, 900)); } };

function dung() {
  const sq = new DatabaseSync(':memory:');
  sq.exec(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8'));
  const db = { prepare(sql) { let a = []; const st = { bind(...x) { a = x; return st; },
      first() { return Promise.resolve(sq.prepare(sql).get(...a) || null); }, all() { return Promise.resolve({ results: sq.prepare(sql).all(...a) }); },
      run() { const r = sq.prepare(sql).run(...a); return Promise.resolve({ meta: { changes: Number(r.changes) } }); } }; return st; } };
  const U = (id, u, role, them) => sq.prepare('INSERT INTO users (id, username, email, role, active, hoTen, maKhachHang, studentId) VALUES (?,?,?,?,?,?,?,?)')
    .run(id, u, u + '@gita.vn', role, them.active === 0 ? 0 : 1, them.hoTen || null, them.mk || null, them.sv || null);
  U('C1', 'coachlan', 'R07', { hoTen: 'Nguyễn Thị Lan' });
  U('T1', 'tuvanminh', 'R11', { hoTen: 'Trần Minh' });
  U('C9', 'coachnghi', 'R07', { hoTen: 'Người Đã Nghỉ', active: 0 });
  U('P1', 'ph1', 'R13', { mk: 'K1' });
  U('P2', 'ph2', 'R13', { mk: 'K2' });
  U('P3', 'ph3', 'R13', {});
  U('H1', 'hs1', 'R14', { sv: 'SV1' });
  U('D1', 'ds1', 'R15', {});
  U('Q5', 'truongcoach', 'R05', { hoTen: 'Hoàng Mỹ Duyên' });
  U('Q4', 'chuyenmon', 'R04', { hoTen: 'Lê Quốc Duy' });
  U('Q1', 'chu', 'R01', { hoTen: 'Chủ hệ' });
  sq.prepare("INSERT INTO hoSoKhach (maKhachHang, uidPhuHuynh, maHocVien, tang, coach, tuVan, vaoLuc) VALUES ('K1','P1','SV1',2,'coachlan','tuvanminh',1)").run();
  sq.prepare("INSERT INTO hoSoKhach (maKhachHang, uidPhuHuynh, tang, coach, tuVan, vaoLuc) VALUES ('K2','P2',1,'coachnghi',NULL,1)").run();
  /* việc hôm nay của nhà K1 + một thông báo chờ coach */
  sq.prepare("INSERT INTO nhipNha (id, maNha, ten, thuTu, ghiLuc) VALUES ('N1','K1','Bữa cơm tối không màn hình',1,'2026-10-10')").run();
  sq.prepare("INSERT INTO thongBao (id, denAi, loai, mucDo, tieuDe, than, luc) VALUES ('TB1','coachlan','traLuong','canXem','Lương','x','2026-10-10')").run();
  return { sq, db };
}
const ho = (u, role, uid) => ({ u, role, uid });

async function chay(M) {
  const { db } = dung(), r = {};
  r.p1 = await M.kimChiNam({}, {}, db, ho('ph1', 'R13', 'P1'));
  r.p1Ngoai = await M.kimChiNam({ maNha: 'K2', maKhachHang: 'K2' }, {}, db, ho('ph1', 'R13', 'P1'));
  r.p2 = await M.kimChiNam({}, {}, db, ho('ph2', 'R13', 'P2'));
  r.p3 = await M.kimChiNam({}, {}, db, ho('ph3', 'R13', 'P3'));
  r.hs = await M.kimChiNam({}, {}, db, ho('hs1', 'R14', 'H1'));
  r.ds = await M.kimChiNam({}, {}, db, ho('ds1', 'R15', 'D1'));
  r.coach = await M.kimChiNam({}, {}, db, ho('coachlan', 'R07', 'C1'));
  r.sa = await M.kimChiNam({}, {}, db, ho('chu', 'R01', 'Q1'));
  r.tv = await M.kimChiNam({}, {}, db, ho('tuvanminh', 'R11', 'T1'));
  return r;
}

const M = await import(pathToFileURL(ROOT + '/may-chu/kim-chi-nam.js').href);
const r = await chay(M);
const ten = (x, vai) => ((x.nguoiDongHanh || []).find(n => n.vai === vai) || {});
kiem('phụ huynh thấy tầng của nhà mình', r.p1.ok && r.p1.tang === 2, JSON.stringify(r.p1));
kiem('phụ huynh thấy HỌ TÊN Coach và chuyên gia tư vấn đi cùng', ten(r.p1, 'Coach').ten === 'Nguyễn Thị Lan' && ten(r.p1, 'Chuyên gia tư vấn').ten === 'Trần Minh');
kiem('không lộ tên đăng nhập hay email của nhân sự', !/coachlan|tuvanminh|@gita\.vn/.test(JSON.stringify(r.p1)), JSON.stringify(r.p1));
kiem('nhà lấy từ PHIÊN: gửi mã nhà khác trong thân yêu cầu vẫn chỉ đọc nhà mình', r.p1Ngoai.tang === 2 && ten(r.p1Ngoai, 'Coach').ten === 'Nguyễn Thị Lan');
kiem('người phụ trách đã nghỉ thì coi như chưa xếp, không hiện tên người đã rời đi', ten(r.p2, 'Coach').daXep === false && !/Người Đã Nghỉ/.test(JSON.stringify(r.p2)));
kiem('chưa có chuyên gia tư vấn thì nói đang xếp (daXep=false), không bịa tên', ten(r.p2, 'Chuyên gia tư vấn').daXep === false && !ten(r.p2, 'Chuyên gia tư vấn').ten);
kiem('chưa có hồ sơ nhà thì nói đang lập hồ sơ (nha=false), không trả lỗi', r.p3.ok && r.p3.nha === false && /đang được lập/.test(r.p3.chuyenGia));
kiem('học viên tìm được nhà qua mã học viên', r.hs.ok && r.hs.tang === 2 && ten(r.hs, 'Coach').ten === 'Nguyễn Thị Lan');
kiem('đại sứ (R15) không có nhà, được chỉ tới Ban vận hành', r.ds.ok && r.ds.nha === false && /Ban vận hành/.test(r.ds.chuyenGia));
kiem('luôn nói có người đứng sau khi việc khó (xin ý kiến Trưởng nhóm chuyên môn)', /Trưởng nhóm chuyên môn/.test(r.p1.chuyenGia));
kiem('khách: bước tiếp là ĐÚNG MỘT việc hôm nay của nhà (từ cửa Hôm nay)', r.p1.viecHomNay && r.p1.viecHomNay.ten === 'Bữa cơm tối không màn hình', JSON.stringify(r.p1.viecHomNay));
kiem('nhà chưa đặt nhịp thì nói "chưa có nhịp", không bịa việc', r.p2.viecHomNay && r.p2.viecHomNay.chuaCoNhip === true, JSON.stringify(r.p2.viecHomNay));
kiem('thành viên (Coach) có kim chỉ nam gắn với VIỆC THẬT: thông báo đang chờ', r.coach.ok && r.coach.thanhVien && r.coach.buocTiep && r.coach.buocTiep.loai === 'thongBao' && r.coach.buocTiep.so === 1, JSON.stringify(r.coach));
kiem('Coach được đỡ bởi Trưởng nhóm Coach (có họ tên)', r.coach.nguoiDo && r.coach.nguoiDo.vai === 'Trưởng nhóm Coach' && r.coach.nguoiDo.ten === 'Hoàng Mỹ Duyên');
kiem('Tư vấn được đỡ bởi Trưởng nhóm chuyên môn', r.tv.ok && r.tv.nguoiDo && r.tv.nguoiDo.vai === 'Trưởng nhóm chuyên môn');
kiem('Super Admin là người quyết cuối — không ai "đỡ" phía trên', r.sa.ok && r.sa.nguoiDo === null && /quyết cuối/.test(r.sa.chuyenGia));
kiem('không có việc nào chờ thì nói không có, không bịa', r.tv.buocTiep === null && Array.isArray(r.tv.viec) && r.tv.viec.length === 0);

/* ── tĩnh ── */
const goc = fs.readFileSync(ROOT + '/may-chu/kim-chi-nam.js', 'utf8');
kiem('cửa CHỈ ĐỌC — không một câu ghi', !/\b(INSERT|UPDATE|DELETE)\b/i.test(goc.replace(/\/\*[\s\S]*?\*\//g, '')));
const wk = fs.readFileSync(ROOT + '/may-chu/worker.js', 'utf8');
const canPhien = (wk.match(/const CAN_PHIEN = \[([\s\S]*?)\];/) || [])[1] || '';
kiem('kimChiNam có trong CAN_PHIEN và có đường gọi', canPhien.includes("'kimChiNam'") && wk.includes("fn === 'kimChiNam'"));
const app = fs.readFileSync(ROOT + '/src/app.js', 'utf8'), ui = fs.readFileSync(ROOT + '/src/kim-chi-nam.js', 'utf8');
kiem('render() chèn kim chỉ nam ở đầu MỌI màn (một chỗ)', /var kcn = G\.kcnThanh \? G\.kcnThanh\(G\.S\.view\) : ''/.test(app) && /'<div class="view">' \+ kcn \+/.test(app));
kiem('một dải cho cả khách lẫn thành viên — không màn riêng (nhánh thanhVien trong cùng G.kcnThanh)', /if \(!G\.LA_KHACH \|\| !G\.LA_KHACH\(\)\) return thanhVien\(v,/.test(ui) && !/G\.VIEWS\[['"]kim-chi-nam['"]\]/.test(ui));
kiem('mặc định thu gọn một dòng (details), mở/đóng nhớ trên máy, bọc try/catch', /<details class="kcn"/.test(ui) && /try \{ localStorage\.setItem\(KHOA_MO/.test(ui));
kiem('màn được gộp vào bản chạy', JSON.parse(fs.readFileSync(ROOT + '/tools/danh-sach-src.json', 'utf8')).app.includes('src/kim-chi-nam.js'));
kiem('mọi chữ ghép vào HTML đều qua h()', !/\+ (x\.ten|x\.vai|d\.chuyenGia|chip|diCung) \+/.test(ui));

/* ── phá thử ── */
async function pha(tenPha, tu, sang, dieu) {
  const ban = goc.replace(tu, sang);
  if (ban === goc) { kiem('phá thử ' + tenPha + ': chuỗi phá có trong mã', false); return; }
  const tam = ROOT + '/may-chu/_pha-kim-chi-nam.js';
  try {
    fs.writeFileSync(tam, ban);
    const P = await import(pathToFileURL(tam).href + '?v=' + Date.now());
    kiem('phá thử ' + tenPha + ': phép đo đỏ đúng chỗ', dieu(await chay(P)));
  } finally { fs.rmSync(tam, { force: true }); }
}
await pha('cho khách lọt vào nhánh thành viên', "if ((BAC[vai] || 99) <= 12) return kimChiNamThanhVien", "if ((BAC[vai] || 99) <= 15) return kimChiNamThanhVien", rp => rp.p1.thanhVien === true);
await pha('bỏ việc thật của thành viên', "if (tb && tb.n) viec.push", "if (false) viec.push", rp => !rp.coach.buocTiep);
await pha('hiện người đã nghỉ', "AND active = 1 AND deletedAt IS NULL').bind(String(ten)", "AND deletedAt IS NULL').bind(String(ten)", rp => /Người Đã Nghỉ/.test(JSON.stringify(rp.p2)));
await pha('trả tên đăng nhập', "ds.push(n ? { vai: nhan, ten: n.ten || (nhan + ' của nhà mình'), daXep: true }", "ds.push(n ? { vai: nhan, ten: n.ten || (nhan + ' của nhà mình'), daXep: true, maNguoi: k[ma] }", rp => /coachlan/.test(JSON.stringify(rp.p1)));

console.log('\n' + dat + ' đạt · ' + truot + ' sai');
process.exit(truot ? 1 : 0);
