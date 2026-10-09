// Thử XƯỞNG TÀI LIỆU GIA ĐÌNH (may-chu/xuong-tai-lieu.js) trên D1 giả dựng
// từ csdl.sql và một Workers AI giả. Đi trọn vòng: đặt đề án → kiến trúc sư
// → viết từng chương (có một chương bị biên tập trả lại vì tên riêng) →
// đóng gói thành bản nháp chờ BA chữ ký → bộ não vận hành tự chạy.
// Chạy: node tools/thu-xuong-tai-lieu.mjs
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
globalThis.fetch = async () => { throw new Error('bộ thử không ra mạng'); };
console.error = () => {};

const sq = new DatabaseSync(':memory:');
sq.exec(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8'));
const db = {
  prepare(sql) { let a = []; const hua = f => { try { return Promise.resolve(f()); } catch (e) { return Promise.reject(e); } }; const st = {
    bind(...x) { a = x; return st; },
    first(col) { return hua(() => { const r = sq.prepare(sql).get(...a) || null; return col && r ? r[col] : r; }); },
    all() { return hua(() => ({ results: sq.prepare(sql).all(...a) })); },
    run() { return hua(() => { const r = sq.prepare(sql).run(...a); return { meta: { changes: Number(r.changes) } }; }); } }; return st; },
  async batch(ds) { const ra = []; for (const st of ds) ra.push(await st.run()); return ra; },
  async exec(s) { sq.exec(s); return {}; }
};
const dem = (sql, ...a) => Number(sq.prepare(sql).get(...a).n);
let sai = 0; const kiem = (t, d, ct) => { console.log((d ? '  ✓ ' : '  ✗ ') + t + (d || !ct ? '' : ' — ' + ct)); if (!d) sai++; };

const X = await import(pathToFileURL(ROOT + '/may-chu/xuong-tai-lieu.js').href);
const THT = await import(pathToFileURL(ROOT + '/may-chu/tu-hoan-thien.js').href);

/* Workers AI giả: đọc lời hệ thống để biết đang đóng vai nào. */
const daGui = [];
let kichBan = {};
const viet = (n, ten) => 'Tối thứ ba, người mẹ thấy cậu con trai 9 tuổi vẫn còn bật máy tính bảng.' + (ten ? ' ' + ten + ' bảo con tắt máy.' : '') +
  '\n\nVì sao chuyện này hay xảy ra: trẻ chưa thấy giờ giấc là của mình. Khi con được cùng đặt luật, con giữ luật lâu hơn.\n\n' +
  'Các bước: cả nhà ngồi lại mười phút, mỗi người nói một việc muốn làm trước giờ ngủ, viết lên giấy, dán ở chỗ dễ thấy. ' +
  'Khi con đề nghị một việc, hỏi con vì sao việc ấy quan trọng, rồi cùng con chọn giờ bắt đầu và giờ kết thúc. ' +
  'Cha mẹ làm trước, con nhìn theo. Nếu một tối lỡ hẹn, sáng hôm sau nói lại nhẹ nhàng, không trách.\n\n' +
  'Việc nhà mình làm được tuần này:\n- Tối nay viết ba việc trước giờ ngủ (chương ' + n + ').\n- Dán lên tủ lạnh.';
const env = { CSDL: db, GITA_DA_TRI_BAT: '1', GITA_CHE_DO_TIET_KIEM: '1', AI: { run: async (model, o) => {
  const he = o.messages[0].content, cau = o.messages[1].content;
  daGui.push(cau);
  if (/kiến trúc sư tài liệu/.test(he)) {
    const so = Number((cau.match(/đúng (\d+) chương/) || [])[1] || 3);
    return { response: 'SỔ NHẤT QUÁN:\n- Gọi là "giờ của nhà mình", không gọi là "giờ giới nghiêm"\n- Cha mẹ làm trước\n' +
      Array.from({ length: so }, (_, i) => '## Chương ' + (i + 1) + ': Bước ' + (i + 1) + ' của buổi tối\n- Ý chính: ý ' + (i + 1) + '\n- Việc làm được: việc ' + (i + 1)).join('\n'),
      usage: { prompt_tokens: 100, completion_tokens: 200 } };
  }
  const n = Number((cau.match(/CHƯƠNG (\d+)\//) || [])[1] || 1);
  const k = kichBan[n] || 'sach';
  if (k === 'ngan') return { response: 'Quá ngắn.', usage: {} };
  if (k === 'ten' && !/BỊ TRẢ LẠI/.test(cau)) return { response: viet(n, 'Chị Nguyễn Thị Lan'), usage: {} };
  return { response: viet(n), usage: { prompt_tokens: 300, completion_tokens: 400 } };
} } };

const SA = { role: 'R01', u: 'chu', uid: 'U-SA' }, SP = { role: 'R04', u: 'sanpham', uid: 'U-SP' };

/* ── 1 · Ai được đặt đề án, đề bài nào được nhận ── */
console.log('1 · CỬA ĐẶT ĐỀ ÁN');
const DE = { chuDe: 'Cùng con lập thời gian biểu buổi tối không cãi nhau', doiTuong: 'phuHuynh', tang: 'T1', soChuong: 3 };
kiem('Phụ huynh (R13) không đặt được', (await X.lapDeAnTaiLieu(DE, env, db, { role: 'R13', u: 'ph' })).code === 'NOPERM');
kiem('Coach (R05) không đặt được — xưởng của khối sản phẩm', (await X.lapDeAnTaiLieu(DE, env, db, { role: 'R05', u: 'c' })).code === 'NOPERM');
kiem('Số chương ngoài 3–8 bị từ chối', (await X.lapDeAnTaiLieu({ ...DE, soChuong: 20 }, env, db, SP)).code === 'SAI');
const pii = await X.lapDeAnTaiLieu({ ...DE, chuDe: 'Giúp bé Nguyễn Văn An 8 tuổi bớt khóc' }, env, db, SP);
kiem('Đề bài có tên trẻ bị chặn TRƯỚC khi tới AI (Điều 13)', pii.code === 'DULIEUNGUOI' && daGui.length === 0, JSON.stringify(pii.code));
const lap = await X.lapDeAnTaiLieu(DE, env, db, SP);
kiem('Đặt đề án ghi một dòng sổ phát sinh "kho rỗng"', dem("SELECT COUNT(*) n FROM phatSinh WHERE loai='khoRong' AND kho='TAILIEU_GIA_DINH'") === 1);
kiem('Bộ phận sản phẩm (R04) đặt được đề án 3 chương', lap.ok && /^TL-/.test(lap.id) && lap.tranLuot === 12, JSON.stringify(lap));

/* ── 2 · Bộ não tắt thì không đổi gì ── */
console.log('2 · BỘ NÃO TẮT');
const tat = await X.chayBuocTaiLieu({ id: lap.id }, { ...env, GITA_DA_TRI_BAT: '0' }, db, SP);
const d0 = sq.prepare('SELECT trangThai, soLuot FROM deAnTaiLieu WHERE id=?').get(lap.id);
kiem('Bộ não đa trí tắt → nói rõ, KHÔNG tính lượt, không đổi trạng thái', tat.code === 'CUADONG' && d0.trangThai === 'kienTruc' && d0.soLuot === 0);

/* ── 3 · Đi trọn vòng ── */
console.log('3 · KIẾN TRÚC SƯ → NGƯỜI VIẾT → BIÊN TẬP → ĐÓNG GÓI');
kichBan = { 2: 'ten' };
let r = await X.chayBuocTaiLieu({ id: lap.id }, env, db, SP);
kiem('Kiến trúc sư: dàn ý đủ 3 chương + sổ nhất quán → chuyển sang viết', r.ok && r.buoc === 'kienTruc' && r.dat &&
  sq.prepare('SELECT trangThai FROM deAnTaiLieu WHERE id=?').get(lap.id).trangThai === 'viet');
r = await X.chayBuocTaiLieu({ id: lap.id }, env, db, SP);
kiem('Chương 1 qua biên tập máy đo', r.ok && r.chuong === 1 && r.dat === true, JSON.stringify(r.cung));
r = await X.chayBuocTaiLieu({ id: lap.id }, env, db, SP);
kiem('Chương 2 có tên riêng → biên tập TRẢ LẠI, chưa nhận', r.ok && r.chuong === 2 && r.dat === false && /tên riêng/.test(r.cung.join(' ')));
const deBaiChuong2 = daGui[daGui.length - 1];
r = await X.chayBuocTaiLieu({ id: lap.id }, env, db, SP);
const deBaiVietLai = daGui[daGui.length - 1];
kiem('Lần viết lại mang đúng lời góp ý của biên tập, và lần này qua', r.ok && r.chuong === 2 && r.dat && r.lanViet === 2 && /BỊ TRẢ LẠI/.test(deBaiVietLai));
kiem('Nén ngữ cảnh: đề bài chương 2 có tóm tắt chương 1, KHÔNG có cả văn bản chương 1',
  /Các chương trước \(tóm tắt\)/.test(deBaiChuong2) && deBaiChuong2.indexOf('Dán lên tủ lạnh') < 0);
kiem('Sổ nhất quán đi theo mọi chương', daGui.slice(1).every(c => /giờ của nhà mình/.test(c)));
r = await X.chayBuocTaiLieu({ id: lap.id }, env, db, SP);
kiem('Chương 3 xong → sang đóng gói', r.ok && r.trangThai === 'dongGoi');
const soGoiAI = daGui.length;
r = await X.chayBuocTaiLieu({ id: lap.id }, env, db, SA);
kiem('Đóng gói KHÔNG gọi AI, ra bản nháp chờ duyệt', r.ok && r.trangThai === 'choDuyet' && !!r.banNhapId && daGui.length === soGoiAI, JSON.stringify(r));
const bn = sq.prepare('SELECT * FROM banNhapKho WHERE id=?').get(String(r.banNhapId || '')) || {};
kiem('Bản nháp nằm ở chuỗi "kho" (3 chữ ký), trạng thái nháp, đúng tên kho', bn && bn.loaiDuyet === 'kho' && bn.trangThai === 'nhap' && bn.tenKho === 'TAILIEU_GIA_DINH');
kiem('Bản nháp ghi rõ "điều người duyệt cần kiểm" và là bản nháp AI', /Điều người duyệt cần kiểm/.test(bn.noiDung || '') && /Bản nháp AI/.test(bn.noiDung || ''));
kiem('Không có tên riêng nào lọt vào bản nháp', !!bn.noiDung && bn.noiDung.indexOf('Nguyễn') < 0);
const phucVu = await THT.traBoSung({ tenKho: 'TAILIEU_GIA_DINH' }, env, db, { role: 'R13', u: 'ph' });
kiem('Chưa đủ ba chữ ký → gia đình KHÔNG thấy tài liệu', phucVu.ok && phucVu.bo.length === 0);
kiem('Người soạn bản nháp là chính xưởng — không phải người bấm', bn.aiSoan === 'xuong-tai-lieu');
const SP2 = { role: 'R04', u: 'sanpham2', uid: 'U-SP2' }, GD = { role: 'R03', u: 'giamdoc', uid: 'U-GD' };
kiem('Ký cấp 1 (Bộ phận sản phẩm)', (await THT.duyetCap({ napId: bn.id, cap: 'sanPham', ghiChu: 'Đọc hết, đúng giọng GITA' }, env, db, SP2)).ok);
kiem('Ký cấp 2 (Giám đốc)', (await THT.duyetCap({ napId: bn.id, cap: 'giamDoc', ghiChu: 'Hợp tầng T1' }, env, db, GD)).ok);
const ky3 = await THT.duyetCap({ napId: bn.id, cap: 'superAdmin', ghiChu: 'Cho phát hành' }, env, db, SA);
kiem('Ký cấp 3: Super Admin vẫn ký được kể cả khi chính Super Admin bấm chạy xưởng', ky3.ok, JSON.stringify(ky3));
kiem('Đủ ba chữ ký → Super Admin nhập kho', (await THT.nhapKho({ napId: bn.id }, env, db, SA)).ok);
const phucVu2 = await THT.traBoSung({ tenKho: 'TAILIEU_GIA_DINH' }, env, db, { role: 'R13', u: 'ph' });
kiem('Sau ba chữ ký, gia đình đọc được tài liệu', phucVu2.bo.length === 1 && /Bước 1 của buổi tối/.test(phucVu2.bo[0].noiDung));
kiem('Đề án đã đóng gói không chạy thêm được', (await X.chayBuocTaiLieu({ id: lap.id }, env, db, SP)).code === 'KHONG_CHAY');
kiem('Mọi đề bài gửi AI đều sạch dữ liệu người', daGui.every(c => c.indexOf('Nguyễn') < 0));

/* ── 4 · Trần: viết hỏng mãi thì dừng chờ người ── */
console.log('4 · TRẦN VIẾT LẠI · CHẠY LẠI');
const lap2 = await X.lapDeAnTaiLieu({ ...DE, chuDe: 'Nói chuyện tiền tiêu vặt với con 12 tuổi', soChuong: 3 }, env, db, SP);
kichBan = { 1: 'ngan' };
await X.chayBuocTaiLieu({ id: lap2.id }, env, db, SP);
for (let i = 0; i < 3; i++) r = await X.chayBuocTaiLieu({ id: lap2.id }, env, db, SP);
const d2 = sq.prepare('SELECT trangThai, loiCuoi FROM deAnTaiLieu WHERE id=?').get(lap2.id);
kiem('Chương viết 3 lần vẫn sai cổng cứng → DỪNG, nói rõ vì sao', d2.trangThai === 'dung' && /3 lần/.test(d2.loiCuoi), JSON.stringify(d2));
kiem('Đề án đang dừng không chạy tiếp được', (await X.chayBuocTaiLieu({ id: lap2.id }, env, db, SP)).code === 'KHONG_CHAY');
kiem('Chạy lại đề án dừng: Bộ phận sản phẩm KHÔNG được', (await X.datTuChayTaiLieu({ id: lap2.id, chayLai: true }, env, db, SP)).code === 'NOPERM');
kichBan = {};
kiem('Chạy lại: Super Admin được, đề án đi tiếp đúng chương đang dở',
  (await X.datTuChayTaiLieu({ id: lap2.id, chayLai: true, bat: false }, env, db, SA)).ok &&
  (await X.chayBuocTaiLieu({ id: lap2.id }, env, db, SA)).chuong === 1);

/* ── 5 · Bộ não vận hành tự chạy ── */
console.log('5 · TỰ CHẠY');
const BN = await import(pathToFileURL(ROOT + '/may-chu/bo-nao-van-hanh.js').href);
const lap3 = await X.lapDeAnTaiLieu({ ...DE, chuDe: 'Ba câu hỏi buổi tối giúp con kể chuyện ở trường', tuChay: true }, env, db, SP);
const goiTruoc = daGui.length;
const thu0 = await BN.nhipVanHanh(env, { that: false, kieu: 'thu' });
const b0 = thu0.buoc.find(b => b.ma === 'XUONG_TAI_LIEU');
kiem('Chạy thử: báo đề án sẽ chạy, KHÔNG gọi AI', b0 && b0.so === 1 && b0.seChay && daGui.length === goiTruoc, JSON.stringify(b0));
const that1 = await BN.nhipVanHanh(env, { that: true, kieu: 'nhip' });
const b1 = that1.buoc.find(b => b.ma === 'XUONG_TAI_LIEU');
kiem('Nhịp thật: đi tiếp đúng một bước', b1 && b1.daChay === 1 &&
  sq.prepare('SELECT trangThai FROM deAnTaiLieu WHERE id=?').get(lap3.id).trangThai === 'viet', JSON.stringify(b1));

/* ── 6 · Soát tĩnh: không đường tắt ── */
console.log('6 · KHÔNG ĐƯỜNG TẮT');
const ma = fs.readFileSync(ROOT + '/may-chu/xuong-tai-lieu.js', 'utf8');
const w = fs.readFileSync(ROOT + '/may-chu/worker.js', 'utf8');
kiem('Không tự gọi mạng hay Workers AI — mọi lượt AI qua goiTheoLoai (một cổng Điều 13)', !/\bfetch\s*\(|env\.AI\b/.test(ma) && /goiTheoLoai\(/.test(ma));
kiem('Không tự ghi vào kho phục vụ khách — chỉ qua soanBanNhap', !/INSERT INTO banNhapKho|UPDATE banNhapKho/.test(ma) && /soanBanNhap\(/.test(ma));
kiem('Bốn cửa đăng ký sau cổng phiên', ['lapDeAnTaiLieu', 'chayBuocTaiLieu', 'docDeAnTaiLieu', 'datTuChayTaiLieu'].every(f =>
  new RegExp("'" + f + "'").test(w.slice(w.indexOf('CAN_PHIEN'), w.indexOf('CAN_PHIEN') + 20000)) && w.indexOf("fn === '" + f + "'") > 0));
const bt = X.bienTap('Chị Trần Thị Mai nói với con.');
kiem('Phá thử biên tập: tên riêng + quá ngắn → hai cổng cứng', !bt.dat && bt.cung.length === 2);

console.log(sai ? `\n✗ ${sai} phép đo sai` : '\n✓ Xưởng tài liệu: máy soạn từng bước, máy đo biên tập, người ký mới tới gia đình');
process.exit(sai ? 1 : 0);
