/* Thử Bản tin GITA — truyền thông nội bộ (may-chu/truyen-thong.js).
   D1 giả = node:sqlite. Đo CỔNG và HÀNH VI, không đo chất lượng văn: chất
   lượng văn là việc của ban biên tập; máy giữ cho bài rỗng không lọt.
   Dùng: node tools/thu-truyen-thong.mjs   (Node >= 22.5) */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
globalThis.fetch = async () => { throw new Error('không gọi mạng ngoài'); };
let dat = 0, truot = 0;
const kiem = (ten, dk, ct) => { if (dk) { dat++; console.log('OK  ' + ten); } else { truot++; const d = 'SAI ' + ten + (ct ? ' — ' + ct : ''); console.log(d);
  if (process.env.GITHUB_ACTIONS) console.log('::error title=thu-truyen-thong::' + d.replace(/[\r\n%]/g, ' ').slice(0, 900)); } };

function dung() {
  const sq = new DatabaseSync(':memory:');
  sq.exec(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8'));
  const db = { prepare(sql) { let a = []; const st = { bind(...x) { a = x; return st; },
      first() { try { return Promise.resolve(sq.prepare(sql).get(...a) || null); } catch (e) { return Promise.reject(e); } },
      all() { return Promise.resolve({ results: sq.prepare(sql).all(...a) }); },
      run() { const r = sq.prepare(sql).run(...a); return Promise.resolve({ meta: { changes: Number(r.changes) } }); } }; return st; },
    async batch(ds) { sq.exec('BEGIN'); try { for (const s of ds) await s.run(); sq.exec('COMMIT'); } catch (e) { sq.exec('ROLLBACK'); throw e; } } };
  for (const [id, u, r] of [['U1', 'chu', 'R01'], ['U2', 'admin', 'R02'], ['U4', 'bientap', 'R04'], ['U5', 'truongcoach', 'R05'],
    ['U7', 'coach1', 'R07'], ['U11', 'tuvan1', 'R11'], ['P1', 'ph1', 'R13']])
    sq.prepare('INSERT INTO users (id, username, email, role, active) VALUES (?,?,?,?,1)').run(id, u, u + '@gita.vn', r);
  return { sq, db };
}
const ho = (u, role, uid) => ({ u, role, uid });
const chu = ho('chu', 'R01', 'U1'), bt = ho('bientap', 'R04', 'U4'), c1 = ho('coach1', 'R07', 'U7'), tv = ho('tuvan1', 'R11', 'U11'),
  ql = ho('truongcoach', 'R05', 'U5'), ph = ho('ph1', 'R13', 'P1');
const DAI = n => { let s = 'Một gia đình vận hành được bắt đầu từ những việc nhỏ làm đều mỗi ngày, có người nhìn thấy và ghi lại. '; while (s.length < n) s += 'Người đồng hành giữ nhịp, đo bằng bằng chứng, và để gia đình tự lắp phần của mình. '; return s; };

async function chay(T) {
  const { sq, db } = dung(), env = {}, r = {};
  const BAI = { chuyenMuc: 'VANHOA', tieuDe: 'Nghe bảy, khuyên ba — vì sao đây là nhịp làm việc của GITA', tomTat: DAI(80).slice(0, 120),
    noiDung: DAI(900), hanhDong: 'Buổi làm việc tới, đếm số câu mình nói và số câu mình nghe.', anh: 'TT02' };
  r.khachSoan = await T.soanBaiTT({ bai: BAI }, env, db, ph);
  r.khachDs = await T.dsBaiTT({}, env, db, ph);
  r.mong = await T.soanBaiTT({ bai: { chuyenMuc: 'VANHOA', tieuDe: 'Ngắn', noiDung: 'quá ngắn' } }, env, db, c1);
  r.nopMong = await T.nopBaiTT({ id: r.mong.id }, env, db, c1);
  r.soan = await T.soanBaiTT({ bai: BAI }, env, db, c1);
  r.nop = await T.nopBaiTT({ id: r.soan.id }, env, db, c1);
  r.tuDuyet = await T.soanBaiTT({ bai: BAI }, env, db, bt);
  await T.nopBaiTT({ id: r.tuDuyet.id }, env, db, bt);
  r.tuDuyetKq = await T.duyetBaiTT({ id: r.tuDuyet.id, lich: new Date(Date.now() + 3600e3).toISOString() }, env, db, bt);
  r.ngoaiBT = await T.duyetBaiTT({ id: r.soan.id, lich: new Date().toISOString() }, env, db, tv);
  r.traVeNgan = await T.duyetBaiTT({ id: r.soan.id, quyet: 'traVe', ghiChu: 'sửa' }, env, db, bt);
  r.lichSai = await T.duyetBaiTT({ id: r.soan.id, lich: '2020-01-01T00:00:00Z' }, env, db, bt);
  /* lịch tương lai: chưa hiện trên bản tin */
  r.duyetTuongLai = await T.duyetBaiTT({ id: r.soan.id, lich: new Date(Date.now() + 2 * 86400e3).toISOString() }, env, db, bt);
  r.dsTruoc = await T.dsBaiTT({}, env, db, tv);
  r.docTruoc = await T.docBaiTT({ id: r.soan.id }, env, db, tv);
  /* kéo lịch về quá khứ (mô phỏng thời gian trôi) */
  sq.prepare('UPDATE ttBai SET lich = ? WHERE id = ?').run(new Date(Date.now() - 60e3).toISOString(), r.soan.id);
  r.dsSau = await T.dsBaiTT({}, env, db, tv);
  r.docSau = await T.docBaiTT({ id: r.soan.id }, env, db, tv);

  /* vinh danh: chữ xếp hạng bị chặn, phải có việc + bằng chứng */
  r.vdXepHang = T.soatBaiTT({ chuyenMuc: 'CONGHIEN', tieuDe: 'Ghi nhận chị Lan — giỏi nhất đội tháng 10', tomTat: DAI(80).slice(0, 100), noiDung: DAI(400),
    hanhDong: 'Học cách chị giữ nhịp gọi lại trong 24 giờ.', anh: 'TT09', nguoiDuocGhiNhan: 'coach1',
    viecCuThe: 'Gọi lại cho mười hai nhà có đèn đỏ trong vòng 24 giờ, mỗi cuộc ghi đủ ba dòng vào sổ chăm sóc của hệ thống GITA.',
    bangChung: 'Sổ chăm 01–31/10: 12/12 cuộc gọi trong 24 giờ, đối chiếu được.', nguon: 'Sổ chăm sóc (soCham) tháng 10' });
  r.vdThieu = T.soatBaiTT({ chuyenMuc: 'CONGHIEN', tieuDe: 'Cảm ơn cả đội vì một tháng tuyệt vời', tomTat: DAI(80).slice(0, 100), noiDung: DAI(400),
    hanhDong: 'Tiếp tục cố gắng.', anh: 'TT09' });
  r.daiSuKhongDongY = T.soatBaiTT({ chuyenMuc: 'DAISU', tieuDe: 'Đại sứ tháng: nhà anh Minh giới thiệu ba gia đình', tomTat: DAI(80).slice(0, 100),
    noiDung: DAI(400), hanhDong: 'Mời nhà mình phụ trách kể lại một tuần đầu.', anh: 'TT10', nguoiDuocGhiNhan: 'DS-001',
    viecCuThe: 'Nhà anh Minh kể lại hành trình chín mươi ngày cho ba gia đình hàng xóm và đưa họ tới buổi gặp đầu tiên tại học viện.',
    bangChung: 'Ba phiếu giới thiệu có mã DS-001 trong sổ đại sứ tháng 10.', nguon: 'Sổ đại sứ tháng 10' });
  r.tuyetDoi = T.soatBaiTT({ ...BAI, noiDung: BAI.noiDung + ' GITA là chương trình tốt nhất.' });
  r.soKhongNguon = T.soatBaiTT({ ...BAI, noiDung: BAI.noiDung + ' Tháng này 87% gia đình giữ nhịp.' });

  /* yêu cầu học tập: bắt buộc đọc + câu kiểm tra; đáp án không gửi xuống */
  const HT = { chuyenMuc: 'HOCTAP', tieuDe: 'Đọc trước kỳ thi 28: bốn nhịp trong mọi cuộc trò chuyện khó', tomTat: DAI(80).slice(0, 130),
    noiDung: DAI(400), hanhDong: 'Dùng đủ bốn nhịp trong cuộc gọi đầu tiên ngày mai.', anh: 'TT14', hanNgay: 3,
    cauHoi: [{ cau: 'Nhịp nào đến ngay sau NGHE?', chon: ['DẪN ĐƯỜNG', 'CÔNG NHẬN', 'LÀM RÕ'], dung: 1 },
      { cau: 'Làm rõ thì chờ im lặng bao lâu?', chon: ['Một giây', 'Ba giây', 'Mười giây'], dung: 1 }] };
  r.htSoan = await T.soanBaiTT({ bai: HT }, env, db, bt);
  r.htNop = await T.nopBaiTT({ id: r.htSoan.id }, env, db, bt);
  r.htDuyet = await T.duyetBaiTT({ id: r.htSoan.id, lich: new Date(Date.now() - 1000).toISOString() }, env, db, chu);
  r.htDoc = await T.docBaiTT({ id: r.htSoan.id }, env, db, tv);
  r.htXn = await T.xacNhanBaiTT({ id: r.htSoan.id, traLoi: [1, 0] }, env, db, tv);
  r.htXnLai = await T.xacNhanBaiTT({ id: r.htSoan.id, traLoi: [1, 1] }, env, db, tv);
  r.htC1 = await T.xacNhanBaiTT({ id: r.htSoan.id, traLoi: [1, 1] }, env, db, c1);

  /* ban hành của Super Admin: soạn và ban hành trực tiếp, ghi đúng tên */
  r.bh = await T.soanBaiTT({ bai: { ...BAI, chuyenMuc: 'NEN', tieuDe: 'Tầm nhìn GITA: một gia đình vận hành được, qua nhiều thế hệ' } }, env, db, chu);
  r.bhKq = await T.duyetBaiTT({ id: r.bh.id, banHanh: true, lich: new Date(Date.now() - 1000).toISOString() }, env, db, chu);
  r.bhR04 = await T.soanBaiTT({ bai: BAI }, env, db, bt);
  r.bhR04Kq = await T.duyetBaiTT({ id: r.bhR04.id, banHanh: true, lich: new Date(Date.now() + 3600e3).toISOString() }, env, db, bt);

  r.lich = await T.lichTT({}, env, db, tv);
  const ky = new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 7);
  r.csTv = await T.chiSoTT({ ky }, env, db, tv);
  r.csC1 = await T.chiSoTT({ ky }, env, db, c1);
  r.csQl = await T.chiSoTT({ ky }, env, db, ql);
  r.go = await T.goBaiTT({ id: r.soan.id, lyDo: 'ngắn' }, env, db, chu);
  r.goC1 = await T.goBaiTT({ id: r.soan.id, lyDo: 'Bài có thông tin đã cũ, thay bằng bản cập nhật.' }, env, db, c1);
  r.goOk = await T.goBaiTT({ id: r.soan.id, lyDo: 'Bài có thông tin đã cũ, thay bằng bản cập nhật.' }, env, db, chu);
  r.dsSauGo = await T.dsBaiTT({}, env, db, tv);
  r.cot = sq.prepare('PRAGMA table_info(ttBai)').all().map(c => c.name);
  return r;
}

const T = await import(pathToFileURL(ROOT + '/may-chu/truyen-thong.js').href);
const r = await chay(T);
kiem('khách (R13) không soạn được bài nội bộ', r.khachSoan.code === 'NOPERM');
kiem('khách (R13) không đọc được bản tin nội bộ', r.khachDs.code === 'NOPERM');
kiem('bài rỗng: nộp bị chặn và nói thiếu ô nào', r.nopMong.code === 'THIEU' && /tiêu đề/.test(r.nopMong.error) && /nội dung tối thiểu 800/.test(r.nopMong.error) && /ảnh 3D/.test(r.nopMong.error), r.nopMong.error);
kiem('bài đủ khung nộp được', r.soan.ok && r.soan.loi.length === 0 && r.nop.ok, JSON.stringify(r.soan.loi));
kiem('ban biên tập không duyệt bài của chính mình', r.tuDuyetKq.code === 'TUDUYET', JSON.stringify(r.tuDuyetKq));
kiem('ngoài ban biên tập (R11) không duyệt được', r.ngoaiBT.code === 'NOPERM');
kiem('trả về phải ghi rõ cần sửa gì', r.traVeNgan.code === 'THIEU');
kiem('lịch ở quá khứ xa bị chặn', r.lichSai.code === 'LICH');
kiem('duyệt với lịch tương lai: chưa hiện trên bản tin, người khác chưa đọc được', r.duyetTuongLai.ok && !r.dsTruoc.banTin.some(b => b.id === r.soan.id) && r.docTruoc.code === 'NOPERM');
kiem('tới lịch thì bài tự hiện (tính lúc đọc, không cột "đã phát hành")', r.dsSau.banTin.some(b => b.id === r.soan.id) && r.docSau.ok && r.docSau.bai.soNguoiDoc === 1);
kiem('bảng ttBai không có cột "đã phát hành"', !r.cot.some(c => /daPhat|phatHanh|congKhai/i.test(c)), r.cot.join(','));
kiem('vinh danh: chữ xếp hạng bị chặn', r.vdXepHang.some(x => /không xếp hạng người/.test(x)), JSON.stringify(r.vdXepHang));
kiem('vinh danh: khen chung chung (không việc, không bằng chứng) bị chặn', r.vdThieu.some(x => /VIỆC CỤ THỂ/.test(x)) && r.vdThieu.some(x => /bằng chứng/.test(x)) && r.vdThieu.some(x => /người được ghi nhận/.test(x)));
kiem('đại sứ là khách: phải xác nhận đồng ý công khai', r.daiSuKhongDongY.some(x => /đồng ý công khai/.test(x)), JSON.stringify(r.daiSuKhongDongY));
kiem('từ tuyệt đối bị chặn ("tốt nhất")', r.tuyetDoi.some(x => /tuyệt đối/.test(x)));
kiem('con số không khai nguồn bị chặn', r.soKhongNguon.some(x => /Nguồn số liệu/.test(x)));
kiem('bài bắt buộc: đáp án KHÔNG gửi xuống máy khách', r.htDoc.ok && r.htDoc.bai.cauHoi.length === 2 && r.htDoc.bai.cauHoi.every(q => q.dung === undefined), JSON.stringify(r.htDoc.bai && r.htDoc.bai.cauHoi));
kiem('chấm câu kiểm tra ở máy chủ: 1/2 đúng = 50, trả đáp án SAU khi nộp', r.htXn.ok && r.htXn.diem === 50 && r.htXn.dungHan && JSON.stringify(r.htXn.dapAn) === '[1,1]', JSON.stringify(r.htXn));
kiem('mỗi người xác nhận một lần', r.htXnLai.code === 'DAXONG');
kiem('Super Admin ban hành trực tiếp được, sổ ghi "(ban hành)"', r.bhKq.ok, JSON.stringify(r.bhKq));
kiem('R04 không dùng được cờ ban hành để tự duyệt', r.bhR04Kq.code === 'TUDUYET' || r.bhR04Kq.code === 'KHOA', JSON.stringify(r.bhR04Kq));
kiem('lịch phát hành: nhịp chuẩn bốn tuần, có ô trống để giao người viết', r.lich.ok && r.lich.o.length >= 20 && r.lich.soTrong > 0 && r.lich.o.every(x => x.ten && x.gio), r.lich.o.length + ' ô, ' + r.lich.soTrong + ' trống');
kiem('chỉ số tư vấn: có bài bắt buộc → ba phần (xác nhận · hiểu · đóng góp)', r.csTv.ok && r.csTv.toi.phan.length === 3 && r.csTv.toi.soBatBuoc === 1, JSON.stringify(r.csTv.toi));
kiem('tư vấn xác nhận đúng hạn 1/1, hiểu 50, chưa viết bài → 50·100 + 20·50 + 30·0 = 60', r.csTv.toi.diem === 60, JSON.stringify(r.csTv.toi));
kiem('coach1 viết 1 bài đã phát hành + xác nhận đủ → 100', r.csC1.toi.diem === 100, JSON.stringify(r.csC1.toi));
kiem('quản lý (R05) thấy cả đội, xếp theo tên — không xếp hạng', Array.isArray(r.csQl.doi) && r.csQl.doi.length >= 6 && r.csQl.doi.map(d => d.u).join() === r.csQl.doi.map(d => d.u).sort().join());
kiem('nhân sự thường không thấy chỉ số cả đội', r.csTv.doi === undefined);
kiem('gỡ bài phải có lý do; R07 không gỡ được', r.go.code === 'THIEU' && r.goC1.code === 'NOPERM');
kiem('gỡ xong bài biến khỏi bản tin', r.goOk.ok && !r.dsSauGo.banTin.some(b => b.id === r.dsSau.banTin.find(x => x.chuyenMuc === 'VANHOA').id));

/* đối chiếu bản chép máy khách */
const js = fs.readFileSync(ROOT + '/src/truyen-thong.js', 'utf8');
const cmKhach = [...js.matchAll(/\{\s*ma:\s*'([A-Z]+)'\s*,\s*ten:\s*'/g)].map(m => m[1]);
kiem('G.BTG_CHUYEN_MUC (máy khách) khớp CHUYEN_MUC (máy chủ)', T.CHUYEN_MUC.every(c => cmKhach.includes(c.ma)), cmKhach.join(','));

/* PHÁ THỬ — mỗi cổng phải đỏ khi bị gỡ */
async function pha(ten, cu, moi, kiemDo) {
  const tep = ROOT + '/may-chu/truyen-thong.js', goc = fs.readFileSync(tep, 'utf8');
  if (!goc.includes(cu)) { kiem('phá thử ' + ten + ': tìm thấy chỗ phá', false, cu); return; }
  const tam = ROOT + '/may-chu/.pha-tt-' + process.pid + '.js';
  fs.writeFileSync(tam, goc.replace(cu, moi));
  try { const P = await import(pathToFileURL(tam).href + '?' + Date.now()); const rp = await chay(P); kiem('phá thử ' + ten + ': phép đo đỏ đúng chỗ', kiemDo(rp)); }
  finally { fs.unlinkSync(tam); }
}
await pha('cho tự duyệt', "if (cu.tacGiaUid === uid && !banHanh)", 'if (false)', rp => rp.tuDuyetKq.ok === true);
await pha('gửi đáp án xuống', "if (b.cauHoi) b.cauHoi = b.cauHoi.map(q => ({ cau: q.cau, chon: q.chon }));", '', rp => rp.htDoc.bai.cauHoi.some(q => q.dung !== undefined));
await pha('hiện bài trước lịch', "WHERE trangThai = 'daDuyet' AND lich <= ?\" + (cm", "WHERE trangThai = 'daDuyet' AND ? != ''\" + (cm", rp => rp.dsTruoc.banTin.some(b => b.chuyenMuc === 'VANHOA'));
await pha('bỏ luật xếp hạng', "const xh = CUM_XEP_HANG.filter(x => toanBai.includes(x));", 'const xh = [];', rp => !rp.vdXepHang.some(x => /không xếp hạng/.test(x)));

console.log('\n' + dat + ' đạt · ' + truot + ' sai');
process.exit(truot ? 1 : 0);
