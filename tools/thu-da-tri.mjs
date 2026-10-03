/* Thử Bộ não đa trí — D1 giả = node:sqlite trong RAM, nhà cung cấp giả.
   Chứng minh: cửa tắt mặc định · Điều 13 chặn TRƯỚC đệm · rẻ trước ·
   đệm 0 token · hết ngân sách thì leo bậc · lỗi thì leo bậc · tiết kiệm
   chỉ còn Workers AI · Claude/Grok chỉ R01 · hội đồng · chấm chê xoá đệm.
   Dùng: node tools/thu-da-tri.mjs   (Node >= 22.5) */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = process.argv[2] || fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const { hoiDaTri, hoiDongDaTri, chamDaTri, soDaTri, luuGiaiPhap, duyetGiaiPhap, dsGiaiPhap, boSungGiaiPhap,
  canhMauDaTri, canhMauTuDong, thuMauDaTri, vongKhoaHocTuDong, docVongKhoaHoc, tuKhoa, KHUON } = await import(pathToFileURL(ROOT + '/may-chu/bo-nao-da-tri.js').href);

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

const goi = [];
let hong = new Set();
const thanCuoi = {};
const dsMau = {
  'api.deepseek.com': ['deepseek-chat', 'deepseek-reasoner'],
  'generativelanguage.googleapis.com': ['models/gemini-2.5-flash', 'models/embedding-001'],
  'api.openai.com': ['gpt-4o-mini', 'whisper-1'],
  'api.anthropic.com': ['claude-test'],
  'api.x.ai': ['grok-test']
};
globalThis.fetch = async (url, op) => {
  const host = new URL(url).host; goi.push(host);
  if (hong.has(host)) return { ok: false, status: 503 };
  if (op.method === 'GET') return { ok: true, json: async () => ({ data: (dsMau[host] || []).map(id => ({ id })) }) };
  const b = JSON.parse(op.body); thanCuoi[host] = b;
  if (host === 'api.anthropic.com') return { ok: true, json: async () => ({ content: [{ type: 'text', text: 'claude: ' + b.model }], usage: { input_tokens: 50, output_tokens: 20 } }) };
  return { ok: true, json: async () => ({ choices: [{ message: { content: host + ' trả lời' } }], usage: { prompt_tokens: 40, completion_tokens: 30 } }) };
};
let cfGoi = 0, cfTra = 'workers-ai trả lời';
const env = {
  GITA_DA_TRI_BAT: '1',
  AI: { async run(m, x) { cfGoi++; return { response: cfTra, usage: { prompt_tokens: 30, completion_tokens: 10 } }; } },
  GITA_KHOA_DEEPSEEK: 'k1', GITA_KHOA_GEMINI: 'k2', GITA_KHOA_OPENAI: 'k3',
  GITA_KHOA_ANTHROPIC: 'k4', GITA_MAU_ANTHROPIC: 'claude-test', GITA_KHOA_XAI: 'k5', GITA_MAU_XAI: 'grok-test'
};
const r01 = { uid: 'U1', u: 'chu', role: 'R01' }, r05 = { uid: 'U5', u: 'nv', role: 'R05' }, khach = { uid: 'K', u: 'k', role: 'R20' };

let dat = 0, truot = 0;
const kiem = (ten, dk) => { if (dk) { dat++; console.log('OK  ' + ten); } else { truot++; console.log('SAI ' + ten); } };

kiem('khách hàng không gọi được', (await hoiDaTri({ cau: 'xin chào bạn' }, env, db, khach)).code === 'NOPERM');
kiem('cửa tắt khi thiếu GITA_DA_TRI_BAT', (await hoiDaTri({ cau: 'xin chào bạn' }, {}, db, r05)).code === 'CUADONG');

let n0 = goi.length + cfGoi;
const ban = await hoiDaTri({ loai: 'tomTat', cau: 'Tóm tắt hồ sơ bé Nguyễn Thị Lan, số 0912345678' }, env, db, r05);
kiem('Điều 13: dữ liệu nhận dạng bị chặn, KHÔNG gọi ai', ban.ok === false && goi.length + cfGoi === n0);
kiem('chuỗi bẩn không thành ô đệm', sq.prepare('SELECT COUNT(*) n FROM triNhoDaTri').get().n === 0);

const a = await hoiDaTri({ loai: 'tomTat', cau: 'Tóm tắt ba nguyên tắc xây thói quen học tập' }, env, db, r05);
kiem('rẻ trước: bậc 1 Workers AI', a.ok && a.ncc === 'cf-workers-ai' && a.bac === 1 && cfGoi === 1);
const b = await hoiDaTri({ loai: 'tomTat', cau: '  tóm tắt BA nguyên tắc   xây thói quen học tập ' }, env, db, r05);
kiem('đệm: câu giống nhau → 0 token, không gọi lại', b.ok && b.tuDem && b.token === 0 && cfGoi === 1);

const c = await hoiDaTri({ loai: 'tomTat', cau: 'Tóm tắt ba nguyên tắc xây thói quen học tập', tuBac: 2 }, env, db, r05);
kiem('lên bậc chủ động: bậc 2 DeepSeek', c.ok && c.ncc === 'deepseek');

const r1 = await hoiDaTri({ loai: 'phanTich', cau: 'Phân tích rủi ro mở rộng sang thị trường mới' }, env, db, r05);
kiem('phân tích bắt đầu bậc 2', r1.ok && r1.bac === 2);
const r2 = await hoiDaTri({ loai: 'phanTich', cau: 'Phân tích khác số hai', tuBac: 4 }, env, db, r05);
kiem('R05 không chạm bậc 4 (Claude/Grok)', !r2.ok && r2.code === 'KHONG_NCC');
const r3 = await hoiDaTri({ loai: 'phanTich', cau: 'Phân tích khác số ba', tuBac: 4 }, env, db, r01);
kiem('R01 chạm bậc 4', r3.ok && r3.bac === 4);
kiem('chiến lược cấp hệ chỉ R01', (await hoiDaTri({ loai: 'chienLuoc', cau: 'Chiến lược toàn cầu' }, env, db, r05)).code === 'NOPERM');

hong = new Set(['api.deepseek.com']);
const d = await hoiDaTri({ loai: 'phanTich', cau: 'Phân tích khi DeepSeek hỏng' }, env, db, r05);
kiem('nhà cung cấp lỗi → tự leo bậc 3', d.ok && d.bac === 3 && d.daThu.length === 1);
hong = new Set();

const envNgan = Object.assign({}, env, { GITA_NGAN_TOKEN_DEEPSEEK: '1' });
const e = await hoiDaTri({ loai: 'phanTich', cau: 'Phân tích khi DeepSeek hết ngân sách' }, envNgan, db, r05);
kiem('hết ngân sách ngày → bỏ qua, leo bậc', e.ok && e.ncc !== 'deepseek');

const tk = await hoiDaTri({ loai: 'phanTich', cau: 'Phân tích trong chế độ tiết kiệm' }, Object.assign({}, env, { GITA_CHE_DO_TIET_KIEM: '1' }), db, r05);
kiem('tiết kiệm: phân tích (bậc 2+) không ra ngoài', !tk.ok && tk.code === 'KHONG_NCC');

kiem('hội đồng: R05 bị chặn', (await hoiDongDaTri({ cau: 'Chiến lược giá năm tới' }, env, db, r05)).code === 'NOPERM');
const hd = await hoiDongDaTri({ cau: 'Chiến lược giá năm tới cho gói gia đình' }, env, db, r01);
kiem('hội đồng: 3 nhà khác nhau', hd.ok && new Set(hd.hoiDong.map(x => x.ncc)).size === 3);

await chamDaTri({ loai: 'tomTat', ncc: 'cf-workers-ai', tot: false, khoa: a.khoa }, env, db, r05);
const f = await hoiDaTri({ loai: 'tomTat', cau: 'Tóm tắt ba nguyên tắc xây thói quen học tập' }, env, db, r05);
kiem('chấm chê → xoá đệm, lần sau hỏi lại', f.ok && !f.tuDem);

const so = await soDaTri({}, env, db, r05);
kiem('sổ: có token hôm nay, đánh giá, không lộ khoá', so.ok && so.homNay.length >= 3 && so.danhGia.length === 1 &&
  !JSON.stringify(so).includes('k1'));
const audit = sq.prepare("SELECT COUNT(*) n FROM audit WHERE viec LIKE 'ATAI_%'").get().n;
kiem('mọi lượt đi qua cổng an toàn (sổ ATAI)', audit >= 10);
kiem('lượt bị chặn Điều 13 có vết trong sổ', sq.prepare("SELECT COUNT(*) n FROM audit WHERE viec = 'ATAI_DIEU13'").get().n === 1);

/* ── TINH TÚY 5 BỘ NÃO ── */
kiem('khuôn nhà khoa học nằm trong lời hệ (phân tích)', String(thanCuoi['api.deepseek.com'].messages[0].content).includes(KHUON.phanTich));
const gm = await hoiDaTri({ loai: 'tomTat', cau: 'Tóm tắt dài cần ngữ cảnh rộng', tuBac: 3 }, env, db, r05);
kiem('tóm tắt ở bậc 3: ưu tiên Gemini (ngữ cảnh dài)', gm.ok && gm.ncc === 'gemini');

/* ── TRẦN TẢI 50% ── */
const daDS = sq.prepare("SELECT SUM(vao + ra) n FROM soTokenDaTri WHERE ncc = 'deepseek'").get().n;
const envTran = Object.assign({}, env, { GITA_NGAN_TOKEN_DEEPSEEK: String(Math.ceil(daDS * 1.5)) });
const t50 = await hoiDaTri({ loai: 'phanTich', cau: 'Phân tích khi đã dùng quá nửa ngân sách' }, envTran, db, r05);
kiem('trần 50%: đã dùng > nửa ngân sách → không gọi DeepSeek nữa', t50.ok && t50.ncc !== 'deepseek');
const t100 = await hoiDaTri({ loai: 'phanTich', cau: 'Phân tích khi mở trần 100 phần trăm' }, Object.assign({}, envTran, { GITA_TRAN_TAI: '100' }), db, r05);
kiem('GITA_TRAN_TAI=100 → DeepSeek dùng lại được', t100.ok && t100.ncc === 'deepseek');
const soT = await soDaTri({}, envTran, db, r05);
const dsT = soT.ncc.find(x => x.ma === 'deepseek');
kiem('sổ báo trần tải 50% và ngân sách hiệu lực = nửa gốc', soT.tranTai === 50 && dsT.nganNgay === Math.floor(dsT.nganGoc / 2) &&
  soT.tinhTuy.length === 5);

/* ── KHO GIẢI PHÁP ── */
kiem('từ khoá bỏ dấu, bỏ hư từ, không phụ thuộc thứ tự', tuKhoa('Quy trình xử lý khiếu nại học phí') === tuKhoa('khiếu nại HỌC PHÍ: quy trình xử lý'));
const cauKho = 'Quy trình xử lý khiếu nại học phí của phụ huynh';
const lu = await luuGiaiPhap({ loai: 'soan', cau: cauKho, traLoi: 'B1 nghe · B2 ghi sổ · B3 trả lời trong 48 giờ', ncc: 'deepseek' }, env, db, r05);
kiem('R05 lưu → bản nháp chờ duyệt', lu.ok && lu.trangThai === 'nhap');
let n1 = goi.length + cfGoi;
const chuaDuyet = await hoiDaTri({ loai: 'soan', cau: 'quy trình xử lý KHIẾU NẠI học phí phụ huynh' }, env, db, r05);
kiem('nháp chưa duyệt không được dùng', chuaDuyet.ok && !chuaDuyet.tuKho);
kiem('R05 không duyệt được', (await duyetGiaiPhap({ ma: lu.ma, dongY: true }, env, db, r05)).code === 'NOPERM');
kiem('R01 duyệt', (await duyetGiaiPhap({ ma: lu.ma, dongY: true }, env, db, r01)).ok);
n1 = goi.length + cfGoi;
const tuKhoHit = await hoiDaTri({ loai: 'soan', cau: 'phụ huynh khiếu nại học phí: quy trình xử lý?' }, env, db, r05);
kiem('câu tương tự → trả từ kho, 0 token, không gọi AI', tuKhoHit.ok && tuKhoHit.tuKho && tuKhoHit.token === 0 &&
  tuKhoHit.maGP === lu.ma && goi.length + cfGoi === n1);
const khac = await hoiDaTri({ loai: 'soan', cau: 'Quy trình tuyển dụng giáo viên mới' }, env, db, r05);
kiem('câu khác hẳn → không dính kho', khac.ok && !khac.tuKho);
const boQua = await hoiDaTri({ loai: 'soan', cau: cauKho, boQuaKho: true }, env, db, r05);
kiem('"Hỏi mới" (boQuaKho) → bỏ qua kho', boQua.ok && !boQua.tuKho);
kiem('lưu trùng giải pháp đã duyệt → DA_CO', (await luuGiaiPhap({ loai: 'soan', cau: cauKho, traLoi: 'x' }, env, db, r05)).code === 'DA_CO');

cfTra = 'ĐỦ';
const du = await boSungGiaiPhap({ ma: lu.ma }, env, db, r05);
kiem('kiểm lại: AI trả ĐỦ → chỉ đóng dấu soát, không tạo nháp', du.ok && du.du === true &&
  sq.prepare("SELECT COUNT(*) n FROM khoGiaiPhapDaTri WHERE trangThai = 'nhap'").get().n === 0);
cfTra = 'Thiếu bước báo cáo kế toán';
const bs = await boSungGiaiPhap({ ma: lu.ma, ghiChu: 'xem lại phần hoàn phí' }, env, db, r05);
kiem('bổ sung: phần thiếu thành bản nháp phiên bản 2', bs.ok && !bs.du && bs.maNhap === lu.ma + '-V2');
cfTra = 'workers-ai trả lời';
await duyetGiaiPhap({ ma: bs.maNhap, dongY: true }, env, db, r01);
const sau = sq.prepare('SELECT phienBan, giaiPhap FROM khoGiaiPhapDaTri WHERE ma = ?').get(lu.ma);
kiem('R01 duyệt bổ sung → phiên bản 2, giữ bản cũ + phần thêm', sau.phienBan === 2 && sau.giaiPhap.includes('48 giờ') &&
  sau.giaiPhap.includes('kế toán') && !sq.prepare('SELECT 1 FROM khoGiaiPhapDaTri WHERE ma = ?').get(bs.maNhap));
const dsg = await dsGiaiPhap({}, env, db, r05);
kiem('danh sách kho: 1 giải pháp đã duyệt, đã dùng ≥ 1', dsg.ok && dsg.ds.length === 1 && dsg.ds[0].dung >= 1);

/* ── CANH MÔ HÌNH MỚI ── */
kiem('canh mô hình: R05 bị chặn', (await canhMauDaTri({}, env, db, r05)).code === 'NOPERM');
const cm1 = await canhMauDaTri({}, env, db, r01);
kiem('lần đầu: chỉ ghi mốc nền, không báo mới', cm1.ok && cm1.kq.length === 5 && cm1.kq.every(x => x.mocNen && !x.moi.length));
kiem('lọc mô hình theo hãng (bỏ embedding/whisper)', cm1.kq.find(x => x.ncc === 'gemini').tong === 1 && cm1.kq.find(x => x.ncc === 'openai').tong === 1);
dsMau['api.openai.com'] = ['gpt-4o-mini', 'gpt-9-test'];
dsMau['api.deepseek.com'] = ['deepseek-reasoner'];
const cm2 = await canhMauDaTri({}, env, db, r01);
const oa = cm2.kq.find(x => x.ncc === 'openai'), dk = cm2.kq.find(x => x.ncc === 'deepseek');
kiem('lần sau: báo đúng mô hình mới', oa.moi.length === 1 && oa.moi[0] === 'gpt-9-test');
kiem('báo khi mô hình đang dùng biến khỏi danh sách', dk.dangDungConTrongDs === false);
kiem('có vết DA_TRI_MAU_MOI trong sổ', sq.prepare("SELECT COUNT(*) n FROM audit WHERE viec = 'DA_TRI_MAU_MOI'").get().n === 1);
n1 = goi.length;
await canhMauTuDong(Object.assign({}, env, { CSDL: db }));
kiem('lịch chạy: chưa đủ 7 ngày → không canh lại', goi.length === n1);

/* ── THỬ MÔ HÌNH MỚI TRÊN ĐỀ CỦA GITA ── */
kiem('thử mô hình: R05 bị chặn', (await thuMauDaTri({ ncc: 'openai', model: 'gpt-9-test' }, env, db, r05)).code === 'NOPERM');
const tm = await thuMauDaTri({ ncc: 'openai', model: 'gpt-9-test' }, env, db, r01);
kiem('thử mô hình: chạy đề kho bằng đúng mô hình ứng viên, đặt cạnh bản duyệt', tm.ok && tm.ket.length === 1 &&
  thanCuoi['api.openai.com'].model === 'gpt-9-test' && tm.ket[0].daDuyet.includes('48 giờ'));

/* ── VÒNG NHÀ KHOA HỌC (0 token) · TỰ ĐIỀU CHỈNH CÓ BIÊN ── */
kiem('vòng khoa học: R05 bị chặn', (await docVongKhoaHoc({ chay: true }, env, db, r05)).code === 'NOPERM');
sq.prepare('UPDATE khoGiaiPhapDaTri SET lucSoat = ? WHERE trangThai = \'duyet\'').run(Date.now() - 100 * 86400e3);
sq.prepare('INSERT OR REPLACE INTO danhGiaDaTri (loai, ncc, tot, xau) VALUES (\'tomTat\', \'cf-workers-ai\', 1, 11)').run();
let n2 = goi.length + cfGoi;
const vk = await docVongKhoaHoc({ chay: true }, env, db, r01);
const ph = (vk.moiNhat || { phatHien: [] }).phatHien;
kiem('vòng khoa học: 0 lượt gọi AI', vk.ok && goi.length + cfGoi === n2);
kiem('vòng khoa học: mỗi phát hiện đủ quan sát · giả thuyết · phép thử · đề xuất',
  ph.length >= 2 && ph.every(x => x.quanSat && x.giaThuyet && x.phepThu && x.deXuat));
kiem('vòng khoa học: thấy giải pháp quá hạn soát → trỏ boSungGiaiPhap', ph.some(x => x.cua === 'boSungGiaiPhap'));
kiem('vòng khoa học: thấy nhà cung cấp bị chê → mức cao, xếp đầu', ph[0].mucDo === 'cao' && ph.some(x => x.cua === 'thuMauDaTri' && /cf-workers-ai/.test(x.quanSat)));
kiem('vòng khoa học: mức cao có vết DA_TRI_KHOA_HOC', sq.prepare("SELECT COUNT(*) n FROM audit WHERE viec = 'DA_TRI_KHOA_HOC'").get().n === 1);
await vongKhoaHocTuDong(env);
kiem('lịch chạy: chưa đủ 20 giờ → không chạy lại', sq.prepare('SELECT COUNT(*) n FROM vongKhoaHocDaTri').get().n === 1);
const tdc = await hoiDaTri({ loai: 'tomTat', cau: 'Tóm tắt cách lập kế hoạch tuần cho gia đình' }, env, db, r05);
kiem('tự điều chỉnh: nhà bị chê > 70%/≥10 lượt xếp cuối hàng', tdc.ok && tdc.ncc !== 'cf-workers-ai');
const tdc0 = await hoiDaTri({ loai: 'tomTat', cau: 'Tóm tắt cách lập kế hoạch tháng cho gia đình' }, Object.assign({}, env, { GITA_TU_DIEU_CHINH: '0' }), db, r05);
kiem('GITA_TU_DIEU_CHINH="0" → đảo lại, rẻ nhất trước', tdc0.ok && tdc0.ncc === 'cf-workers-ai');

console.log(`\n${dat} đạt · ${truot} sai`);
process.exit(truot ? 1 : 0);
