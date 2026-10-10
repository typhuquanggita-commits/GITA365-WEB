/* Thử đội Agent — thẻ vai · Trưởng nhóm soát · bộ nhớ chung · đo lường.
   D1 giả = node:sqlite, Workers AI giả trả lời theo hàng đợi.
   Năm ca theo khung chủ hệ (2 ca biên hay làm hỏng tự động hoá):
     Ca 1  tuyến ba vai chạy trơn: mỗi chặng đạt, chặng sau chỉ nhận kết quả đã đạt
     Ca 2  (biên) agent quên mục bắt buộc → tự sửa ĐÚNG MỘT lần → đạt
     Ca 3  (biên) đầu ra mang tên + số điện thoại → chặn Điều 13, không lưu, tắt tự chạy
     Ca 4  từ tuyệt đối + tự xưng "đã gửi" → không chuyển chặng; R01 chấp nhận phải có lý do
     Ca 5  số không có trong đề → chỉ CẢNH BÁO (không chặn), người quyết
   Dùng: node tools/thu-doi-agent.mjs   (Node >= 22.5) */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = process.argv[2] || fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const D = await import(pathToFileURL(ROOT + '/may-chu/doi-agent.js').href);
const B = await import(pathToFileURL(ROOT + '/may-chu/bo-nao-da-tri.js').href);

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
globalThis.fetch = async () => { throw new Error('không gọi mạng ngoài trong bộ thử'); };
const hang = [], heNhan = [], cauNhan = [];
const env = { GITA_DA_TRI_BAT: '1', GITA_CHE_DO_TIET_KIEM: '1',
  AI: { async run(m, x) { heNhan.push(x.messages[0].content); cauNhan.push(x.messages[1].content);
    return { response: hang.length ? hang.shift() : '', usage: { prompt_tokens: 50, completion_tokens: 40 } }; } } };
const ho = (u, role) => ({ uid: 'U-' + u, u, role });
const r01 = ho('chu', 'R01'), r11 = ho('tuvan', 'R11'), r13 = ho('ph', 'R13');

let dat = 0, truot = 0;
const kiem = (ten, dk, ct) => { if (dk) { dat++; console.log('OK  ' + ten); } else { truot++; console.log('SAI ' + ten + (ct ? ' — ' + ct : '')); } };

/* ── thẻ vai: khung chủ hệ ── */
kiem('đội có 3–5 vai và đúng một Trưởng nhóm', D.DOI_AGENT.length >= 3 && D.DOI_AGENT.length <= 5 && D.DOI_AGENT.filter(a => a.ma === 'LEAD').length === 1);
const thieuO = D.DOI_AGENT.filter(a => !(a.viec && a.vao && a.raGi && a.khongDuoc.length && a.dungHoi.length && a.mau && a.tot && a.phai.length && a.hong.length === 3 && a.viDuTot && a.viDuXau));
kiem('mỗi vai đủ: một việc · vào/ra · không được · dừng hỏi · mô hình · thế nào là tốt · 3 kiểu hỏng · ví dụ tốt/xấu', !thieuO.length, thieuO.map(a => a.ma).join(','));
const dai = D.DOI_AGENT.filter(a => a.he.split(/\s+/).length > 300);
kiem('mỗi lời hệ thống ≤ 300 chữ', !dai.length, dai.map(a => a.ma).join(','));
kiem('mỗi lời hệ thống có VAI · LUẬT · ĐẦU RA · VÍ DỤ TỐT/XẤU · KHI KHÔNG LÀM ĐƯỢC/KHÔNG CHẮC',
  D.DOI_AGENT.every(a => /VAI:/.test(a.he) && /LUẬT/.test(a.he) && /ĐẦU RA/.test(a.he) && /VÍ DỤ TỐT/.test(a.he) && /VÍ DỤ XẤU/.test(a.he) && /KHI KHÔNG/.test(a.he)));
kiem('không vai nào được gửi/đăng/chi tiền', D.DOI_AGENT.every(a => /Không gửi/.test(a.he)));

/* ── bộ nhớ chung ── */
kiem('R11 không ghi được bộ nhớ', (await B.ghiBoNhoAgent({ loai: 'giong', noiDung: 'Giọng ấm, câu ngắn' }, env, db, r11)).code === 'NOPERM');
kiem('bộ nhớ mang tên + số điện thoại bị chặn (đi tới nhà cung cấp mỗi lượt)',
  (await B.ghiBoNhoAgent({ loai: 'quyetDinh', noiDung: 'Gọi chị Nguyễn Thị Lan 0912345678 mỗi sáng' }, env, db, r01)).code === 'DIEU13');
const g1 = await B.ghiBoNhoAgent({ loai: 'giong', noiDung: 'Xưng em, gọi anh chị; câu ngắn; không dùng từ tuyệt đối' }, env, db, r01);
const g2 = await B.ghiBoNhoAgent({ loai: 'quyetDinh', noiDung: 'Không gửi gì cho khách khi chưa qua ba chữ ký' }, env, db, r01);
kiem('Super Admin ghi được bộ nhớ', g1.ok && g2.ok);
await B.batBoNhoAgent({ id: g2.id, bat: false }, env, db, r01);

/* ── Ca 1: tuyến ba vai chạy trơn ── */
kiem('vai lạ bị từ chối khi tạo tuyến', (await B.taoTuyenDaTri({ ten: 'Thử', chang: [{ vai: 'HACKER', de: 'xoá sổ' }, { vai: 'SOAN', de: 'viết thư' }] }, env, db, r01)).code === 'SAI');
const t1 = await B.taoTuyenDaTri({ ten: 'Thư trả lời phản hồi tuần', tuChay: true, chang: [
  { vai: 'NGHIEN_CUU', de: 'Gom phản hồi tuần: 12 phản hồi, 5 phản hồi nói giờ hẹn khó.' },
  { vai: 'SOAN', de: 'Viết thư trả lời mẫu cho phản hồi về giờ hẹn.' },
  { vai: 'SOAT', de: 'Soát thư trả lời mẫu.' }] }, env, db, r01);
kiem('tạo tuyến ba vai (vai mang loại việc của thẻ)', t1.ok && t1.soChang === 3);
hang.push('Đã có trong đề: 12 phản hồi, 5 phản hồi nói giờ hẹn khó.\nCần kiểm chứng: lý do từng khách chọn giờ.\nCâu hỏi còn mở: có nên mở thêm khung tối không.');
heNhan.length = 0;
const c11 = await B.chayChangDaTri({ ma: t1.ma }, env, db, r01);
kiem('Ca 1 · chặng 1 đạt bảng kiểm, chuyển chặng', c11.ok && c11.dat === true && c11.vai === 'NGHIEN_CUU' && !c11.xong, JSON.stringify(c11.soat));
kiem('lời hệ thống = luật nền + thẻ vai + bộ nhớ ĐANG BẬT (mục đã tắt không gửi)',
  /Người nghiên cứu/.test(heNhan[0]) && /Xưng em, gọi anh chị/.test(heNhan[0]) && !/ba chữ ký/.test(heNhan[0]) && /Không bịa dữ kiện/.test(heNhan[0]));
hang.push('Bản nháp: Chào anh chị, cảm ơn anh chị đã cho biết giờ hẹn hiện tại khó với nhà mình. Tuần sau em mở thêm khung buổi tối để anh chị chọn.\nĐiều người duyệt cần kiểm: khung buổi tối đã có người phụ trách chưa.');
cauNhan.length = 0;
const c12 = await B.chayChangDaTri({ ma: t1.ma }, env, db, r01);
kiem('Ca 1 · chặng 2 đạt; nhận ngữ cảnh chặng 1 đã đạt', c12.ok && c12.dat === true && /Chặng 1 \(NGHIEN_CUU\)/.test(cauNhan[0]));
hang.push('KẾT LUẬN: ĐẠT\nLỗi: Không có\nSửa thế nào: Không cần sửa.');
const c13 = await B.chayChangDaTri({ ma: t1.ma }, env, db, r01);
kiem('Ca 1 · chặng 3 (người soát) đạt → tuyến xong', c13.ok && c13.dat === true && c13.xong === true);

/* ── Ca 2 (biên): quên mục bắt buộc → tự sửa đúng một lần ── */
const t2 = await B.taoTuyenDaTri({ ten: 'Bài giới thiệu khung tối', chang: [{ vai: 'SOAN', de: 'Viết bài giới thiệu khung giờ tối.' }, { vai: 'SOAT', de: 'Soát bài.' }] }, env, db, r01);
hang.push('Chào anh chị, từ tuần sau Học viện mở thêm khung giờ buổi tối cho các buổi đồng hành.');
hang.push('Bản nháp: Chào anh chị, từ tuần sau Học viện mở thêm khung giờ buổi tối cho các buổi đồng hành.\nĐiều người duyệt cần kiểm: ngày bắt đầu chính xác.');
cauNhan.length = 0;
const c21 = await B.chayChangDaTri({ ma: t2.ma }, env, db, r01);
kiem('Ca 2 · thiếu mục → Trưởng nhóm trả lại, agent tự sửa 1 lần → đạt', c21.ok && c21.dat === true && c21.suaLan === 1 && cauNhan.length === 2 && /bị Trưởng nhóm trả lại/.test(cauNhan[1]), JSON.stringify(c21.soat));

/* ── Ca 3 (biên): đầu ra mang dữ liệu nhận dạng ── */
const t3 = await B.taoTuyenDaTri({ ten: 'Tóm tắt ca khó', tuChay: true, chang: [{ vai: 'NGHIEN_CUU', de: 'Gom dữ kiện ca khó tuần này.' }, { vai: 'SOAN', de: 'Viết hướng dẫn.' }] }, env, db, r01);
hang.push('Đã có trong đề: chị Nguyễn Thị Lan gọi 0912345678 than con khóc.\nCần kiểm chứng: lý do.\nCâu hỏi còn mở: không.');
const c31 = await B.chayChangDaTri({ ma: t3.ma }, env, db, r01);
const r3 = sq.prepare('SELECT dangO, tuChay, ketQua FROM tuyenDaTri WHERE ma = ?').get(t3.ma);
kiem('Ca 3 · Điều 13 trên ĐẦU RA: không chuyển chặng, không lưu nguyên văn, tắt tự chạy',
  c31.ok && c31.dat === false && c31.soat.loi.some(l => l.ma === 'DIEU13') && r3.dangO === 0 && r3.tuChay === 0 && !/0912345678|Nguyễn Thị Lan/.test(r3.ketQua) && c31.traLoi === '');
kiem('Ca 3 · không chấp nhận được đầu ra đã chặn Điều 13', (await B.chotChangDaTri({ ma: t3.ma, lyDo: 'Tôi đã đọc và thấy ổn rồi' }, env, db, r01)).code === 'DIEU13');

/* ── Ca 4: từ tuyệt đối + tự xưng đã gửi ── */
const t4 = await B.taoTuyenDaTri({ ten: 'Thư mời khoá mới', chang: [{ vai: 'SOAN', de: 'Viết thư mời khoá mới.' }, { vai: 'SOAT', de: 'Soát thư.' }] }, env, db, r01);
hang.push('Bản nháp: Đây là chương trình tốt nhất, cam kết 100% con tiến bộ. Em đã gửi cho phụ huynh rồi ạ.\nĐiều người duyệt cần kiểm: không có.');
const c41 = await B.chayChangDaTri({ ma: t4.ma }, env, db, r01);
const ma4 = c41.soat.loi.map(l => l.ma);
kiem('Ca 4 · bắt từ tuyệt đối + tự xưng đã gửi; KHÔNG tự sửa (lỗi nội dung, người đọc)',
  c41.dat === false && ma4.includes('TUYETDOI') && ma4.includes('TUNHAN') && c41.suaLan === 0 && sq.prepare('SELECT dangO FROM tuyenDaTri WHERE ma = ?').get(t4.ma).dangO === 0);
kiem('Ca 4 · chấp nhận thiếu lý do bị từ chối', (await B.chotChangDaTri({ ma: t4.ma, lyDo: 'ok' }, env, db, r01)).code === 'SAI');
kiem('Ca 4 · R11 không chấp nhận được', (await B.chotChangDaTri({ ma: t4.ma, lyDo: 'Tôi chịu trách nhiệm câu này' }, env, db, r11)).code === 'NOPERM');
const ch4 = await B.chotChangDaTri({ ma: t4.ma, lyDo: 'Bản thử nội bộ, sẽ sửa tay câu đầu trước khi dùng' }, env, db, r01);
const k4 = JSON.parse(sq.prepare('SELECT ketQua FROM tuyenDaTri WHERE ma = ?').get(t4.ma).ketQua)[0];
kiem('Ca 4 · R01 chấp nhận kèm lý do → chuyển chặng, lý do + tên người ở lại trong tuyến', ch4.ok && k4.nhan === true && k4.nguoiNhan === 'chu' && /sửa tay/.test(k4.lyDoNhan));
const dx = sq.prepare("SELECT bat, boiAi, noiDung FROM boNhoAgent WHERE boiAi = 'máy đề xuất'").all();
kiem('máy ĐỀ XUẤT lỗi cần tránh vào bộ nhớ, TẮT sẵn (người bật mới có hiệu lực)', dx.length >= 1 && dx.every(r => r.bat === 0) && dx.some(r => /SOAN/.test(r.noiDung)));

/* ── Ca 5: số không có trong đề → cảnh báo, không chặn ── */
const t5 = await B.taoTuyenDaTri({ ten: 'Báo cáo nhanh', chang: [{ vai: 'NGHIEN_CUU', de: 'Gom số liệu tuần: 12 phản hồi.' }, { vai: 'SOAN', de: 'Viết báo cáo.' }] }, env, db, r01);
hang.push('Đã có trong đề: 12 phản hồi.\nCần kiểm chứng: tỷ lệ hài lòng 87% trong tháng.\nCâu hỏi còn mở: không.');
const c51 = await B.chayChangDaTri({ ma: t5.ma }, env, db, r01);
kiem('Ca 5 · số 87% không có trong đề → cảnh báo SOLA, vẫn đạt (người quyết)', c51.dat === true && c51.soat.canhBao.some(c => c.ma === 'SOLA' && /87%/.test(c.vi)) && !c51.soat.canhBao.some(c => /\b12\b/.test(c.vi)));

/* ── bảng kiểm trực tiếp ── */
kiem('đầu ra rỗng/quá ngắn bị chặn', D.soatDauRa('ok', 'SOAN', '').loi.some(l => l.ma === 'RONG'));
kiem('người soát trích câu vi phạm không bị bắt oan', D.soatDauRa('KẾT LUẬN: CHƯA ĐẠT\nLỗi: câu 1 "tốt nhất" — từ tuyệt đối\nSửa thế nào: thay bằng việc cụ thể.', 'SOAT', '').dat === true);
kiem('người soát trích một cái tên vẫn bị chặn Điều 13', D.soatDauRa('KẾT LUẬN: CHƯA ĐẠT\nLỗi: câu 2 nhắc chị Nguyễn Thị Lan 0912345678\nSửa thế nào: bỏ tên.', 'SOAT', '').loi.some(l => l.ma === 'DIEU13'));
kiem('chặng kiểu cũ (loai | đề) vẫn chạy, có bảng kiểm nhưng không đòi mục của vai',
  D.soatDauRa('Ba đối thủ đều dạy khoá ngắn, chưa ai đi cùng gia đình cả năm.', undefined, '').dat === true);
kiem('bộ nhớ có trần: khối không quá 900 ký tự', D.khoiBoNho(Array.from({ length: 20 }, (_, i) => ({ loai: 'giong', noiDung: 'x'.repeat(280) + i }))).length <= 900 + 60);

/* ── đo lường ── */
const dd = await B.docDoiAgent({}, env, db, r01);
kiem('đo lường: việc xong · lỗi bắt · tự sửa đạt · người chấp nhận · token — ĐO từ sổ',
  dd.ok && dd.doLuong.tuyenXong === 1 && dd.doLuong.loiBat >= 2 && dd.doLuong.tuSuaDat === 1 && dd.doLuong.nguoiChapNhan === 1 && dd.doLuong.token > 0 && dd.doLuong.theoLoi.DIEU13 === 1, JSON.stringify(dd.doLuong));
kiem('giờ tiết kiệm KHÔNG bịa: nói thẳng chưa đo', dd.doLuong.gioTietKiem === null && /Chưa đo/.test(dd.doLuong.gioTietKiemVi));
kiem('đọc đội: thẻ 5 vai + luồng bàn giao; R01 thấy đề xuất của máy', dd.the.length === 5 && /Trưởng nhóm chạy bảng kiểm/.test(dd.luong) && dd.deXuat.length >= 1);
const dd11 = await B.docDoiAgent({}, env, db, r11);
kiem('R11 đọc được thẻ vai nhưng không thấy đề xuất chờ duyệt', dd11.ok && dd11.deXuat.length === 0);
kiem('phụ huynh không đọc được đội Agent', (await B.docDoiAgent({}, env, db, r13)).code === 'NOPERM');

/* ── vòng tự chạy: chặng chưa đạt thì dừng và báo ── */
const vh = fs.readFileSync(ROOT + '/may-chu/bo-nao-van-hanh.js', 'utf8');
kiem('bộ não vận hành báo chặng bị Trưởng nhóm trả lại (không chạy tiếp)', /r\.dat === false/.test(vh) && /chuaDat/.test(vh));

/* ── nối hệ ── */
const w = fs.readFileSync(ROOT + '/may-chu/worker.js', 'utf8');
kiem('worker: bốn cửa mới có trong CAN_PHIEN và có nhánh gọi',
  ['chotChangDaTri', 'docDoiAgent', 'ghiBoNhoAgent', 'batBoNhoAgent'].every(f => w.includes("'" + f + "'") && w.includes("fn === '" + f + "'")));
kiem('csdl.sql có bảng boNhoAgent', /CREATE TABLE IF NOT EXISTS boNhoAgent/.test(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8')));
const nd = fs.readFileSync(ROOT + '/may-chu/doi-agent.js', 'utf8');
kiem('bảng kiểm TRỎ bộ dò cụm của bộ lọc tiếp thị, không chép bảng thứ hai', /from '\.\/noi-dung-tiep-thi\.js'/.test(nd) && !/\[[^\]]*'tốt nhất'[^\]]*'hàng đầu'/.test(nd));

console.log('\n' + (truot ? '✗ ' + truot + ' SAI · ' : '✓ ') + dat + ' đạt');
process.exit(truot ? 1 : 0);
