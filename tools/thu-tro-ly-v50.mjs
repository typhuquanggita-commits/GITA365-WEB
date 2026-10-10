/* Thử Trợ lý GITA V50 — D1 giả = node:sqlite trong RAM, Workers AI giả.
   Chứng minh:
     · vai đọc từ PHIÊN, không từ thứ trình duyệt gửi lên
     · đọc cảm xúc bằng cụm nhiều âm tiết (không bắt oan "số" thành "sợ")
     · yêu cầu của Super Admin → khuôn phương án sáu phần; vai khác thì không
     · câu khẩn KHÔNG tới AI — trả đường người thật
     · bộ lọc đầu ra cắt khối "gợi ý / bạn có thể hỏi thêm"
     · cổng Điều 13 chặn tên + số điện thoại TRƯỚC khi gọi ai
     · trần lượt ngày · bộ não tắt → trả mã để trình duyệt tự trả lời
     · làn troLy không mở được qua cửa hỏi đa trí hay tuyến chặng
     · thông điệp tới bộ não vận hành: chỉ R01, thành MỘT tuyến Agent ba chặng tự chạy
     · nhật ký KHÔNG chép nội dung câu hỏi
   Dùng: node tools/thu-tro-ly-v50.mjs   (Node >= 22.5) */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = process.argv[2] || fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const V = await import(pathToFileURL(ROOT + '/may-chu/tro-ly-v50.js').href);
const DT = await import(pathToFileURL(ROOT + '/may-chu/bo-nao-da-tri.js').href);

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

let luot = [], tra = 'Em hiểu anh chị đang lo. Tối nay thử ngồi cạnh con mười phút, không hỏi điểm.';
globalThis.fetch = async () => { throw new Error('không được gọi mạng ngoài trong bộ thử'); };
const env = {
  GITA_DA_TRI_BAT: '1',
  AI: { async run(m, x) { luot.push(x); return { response: tra, usage: { prompt_tokens: 30, completion_tokens: 20 } }; } }
};
const r01 = { uid: 'U1', u: 'chu', role: 'R01' }, r07 = { uid: 'U7', u: 'coach', role: 'R07' };
const r13 = { uid: 'U13', u: 'ph', role: 'R13' }, r14 = { uid: 'U14', u: 'hv', role: 'R14' };

let dat = 0, truot = 0;
const kiem = (ten, dk, chiTiet) => { if (dk) { dat++; console.log('OK  ' + ten); } else { truot++; console.log('SAI ' + ten + (chiTiet ? ' — ' + chiTiet : '')); } };
const he = () => (luot[luot.length - 1].messages || [])[0].content;

/* ── 1. Đọc câu ── */
kiem('cảm xúc: "lo quá, không biết làm sao" → lo lắng', V.docCamXuc('Em lo quá, không biết làm sao với con').ma === 'lo');
kiem('cảm xúc: hai cụm cùng nhóm → mức mạnh', V.docCamXuc('Tôi mệt mỏi lắm, kiệt sức rồi').muc === 2);
kiem('cảm xúc: "số buổi" KHÔNG bị đọc thành "sợ"', V.docCamXuc('Số buổi học tuần này là bao nhiêu').ma === 'trungTinh');
kiem('cảm xúc: "bực mình" → bực bội', V.docCamXuc('Bực mình quá, con cãi suốt').ma === 'buc');
kiem('ý hỏi: "Lên phương án tăng giữ chân" → yêu cầu', V.docYHoi('Lên phương án tăng tỷ lệ gia đình ở lại').loai === 'yeuCau');
kiem('ý hỏi: "Con hay khóc là sao?" → câu hỏi', V.docYHoi('Con hay khóc là sao?').loai === 'cauHoi');
kiem('khẩn: "muốn chết" bị nhận', V.coKhan('Con nói con muốn chết'));
kiem('khẩn: câu thường không bị nhận nhầm', !V.coKhan('Con chết mê trò chơi điện tử'));
kiem('đủ 15 vai R01–R15', Object.keys(V.VAI_V50).length === 15);

/* ── 2. Bộ lọc đầu ra ── */
const loc = V.locTra('**Bước 1:** ngồi cạnh con.\nBước 2: hỏi một câu mở.\n\nGợi ý câu hỏi tiếp theo:\n- Học phí bao nhiêu?\n- Tầng 2 là gì?');
kiem('lọc: cắt khối gợi ý ở cuối', !/Gợi ý|Học phí/.test(loc), loc);
kiem('lọc: bỏ dấu markdown đậm', !/\*\*/.test(loc) && /Bước 1:/.test(loc));
kiem('lọc: giữ nguyên nội dung chính', /hỏi một câu mở/.test(loc));

/* ── 3. Vai đọc từ phiên ── */
luot = [];
const a = await V.troLyV50({ cau: 'Con tôi ôm điện thoại cả tối, tôi lo quá', vai: 'R01', role: 'R01' }, env, db, r13);
kiem('phụ huynh: trả lời được qua bộ não', a.ok && a.tra && a.ncc === 'cf-workers-ai', JSON.stringify(a));
kiem('vai đọc từ PHIÊN — ô "vai" trình duyệt gửi bị bỏ qua', a.vai === 'Phụ huynh' && !a.phuongAn);
kiem('lời hệ thống mang vai Phụ huynh và luật khách hàng', /Người đang hỏi: Phụ huynh/.test(he()) && /khách hàng: không nói về nội bộ/.test(he()));
kiem('lời hệ thống mang cảm xúc lo lắng', a.camXuc === 'lo lắng' && /lo lắng/.test(he()));
kiem('lời hệ thống cấm danh sách câu gợi ý', /TUYỆT ĐỐI không đưa danh sách câu hỏi gợi ý/.test(he()));
kiem('tra lời không mang khối gợi ý', !/gợi ý/i.test(a.tra));

luot = [];
const hv = await V.troLyV50({ cau: 'Mình học mãi không vào, chán nản quá' }, env, db, r14);
kiem('học viên: xưng "mình", gọi "bạn"', hv.ok && /Xưng "mình", gọi người hỏi là "bạn"/.test(he()));

/* ── 4. Super Admin: phương án sáu phần, vai khác không ── */
luot = [];
const sa = await V.troLyV50({ cau: 'Lên phương án tăng tỷ lệ gia đình ở lại sau 90 ngày' }, env, db, r01);
kiem('SA yêu cầu → phương án, đi làn rẻ (Workers AI), trần chữ 1800', sa.ok && sa.phuongAn === true && sa.loaiCau === 'yeuCau' && sa.ncc === 'cf-workers-ai' && luot[luot.length - 1].max_tokens === 1800, JSON.stringify(sa));
kiem('SA: lời hệ thống đòi đủ sáu phần', /PHƯƠNG ÁN cao cấp/.test(he()) && /6\) Cách đo kết quả/.test(he()));
luot = [];
const co = await V.troLyV50({ cau: 'Lên phương án cho ca khó tuần này' }, env, db, r07);
kiem('Coach yêu cầu: KHÔNG thành phương án cấp hệ', co.ok && !co.phuongAn && !/PHƯƠNG ÁN cao cấp/.test(he()));

/* ── 5. Khẩn không tới AI ── */
luot = [];
const k = await V.troLyV50({ cau: 'Con tôi nói muốn chết, tôi phải làm sao' }, env, db, r13);
kiem('khẩn: trả đường người thật, KHÔNG gọi AI', k.ok && k.khan && /111/.test(k.tra) && luot.length === 0);

/* ── 6. Điều 13 ── */
luot = [];
const d13 = await V.troLyV50({ cau: 'Bé Nguyễn Thị Lan số 0912345678 hay khóc' }, env, db, r13);
kiem('Điều 13: tên + số điện thoại bị chặn, KHÔNG gọi ai', !d13.ok && luot.length === 0, JSON.stringify(d13));

luot = [];
const lsBan = await V.troLyV50({ cau: 'Con hay quên làm bài tập về nhà', lichSu: [{ ai: 'trolY', loi: 'Chào anh Nguyễn Văn Hùng, em là trợ lý.' }] }, env, db, r13);
kiem('Điều 13: tên ở LƯỢT TRƯỚC không chặn câu sạch hiện tại — thử lại không kèm lịch sử', lsBan.ok && luot.length === 1 && !/Nguyễn/.test(JSON.stringify(luot[0])), JSON.stringify(lsBan));

/* ── 7. Tắt · trần · rỗng → trả mã cho trình duyệt ── */
const tat = await V.troLyV50({ cau: 'Con hay cãi lời bố mẹ' }, {}, db, r13);
kiem('bộ não tắt → mã CUADONG (trình duyệt tự trả lời)', !tat.ok && tat.code === 'CUADONG');
const la = await V.troLyV50({ cau: 'Câu hỏi' }, env, db, { uid: 'X', role: 'R99' });
kiem('vai lạ → NOPERM', !la.ok && la.code === 'NOPERM');
tra = '';
const rong = await V.troLyV50({ cau: 'Một câu khác hẳn để không trùng' }, env, db, r07);
kiem('bộ não trả rỗng → không trả khung trống', !rong.ok);
tra = 'ok';
const nk = sq.prepare("SELECT chiTiet FROM audit WHERE viec = 'TRO_LY_V50'").all();
kiem('nhật ký KHÔNG chép nội dung câu hỏi', nk.length > 0 && nk.every(r => !/điện thoại|ôm|phương án/.test(r.chiTiet || '')), JSON.stringify(nk.slice(0, 2)));
let het = null;
for (let i = 0; i < 62; i++) { const r = await V.troLyV50({ cau: 'Câu thứ ' + i + ' về thói quen đọc sách' }, env, db, { uid: 'U13b', u: 'ph2', role: 'R13' }); if (!r.ok) { het = r; break; } }
kiem('trần ngày của khách: hết lượt → HETTRAN', het && het.code === 'HETTRAN', het && het.code);

/* ── 8. Làn troLy không mở qua cửa khác ── */
const qua = await DT.hoiDaTri({ loai: 'troLy', cau: 'Thử đi đường vòng' }, env, db, r07);
kiem('làn troLy không gọi được qua hỏi đa trí', !qua.ok && qua.code === 'LOAILA');
const tv = await DT.taoTuyenDaTri({ ten: 'Tuyến vòng', chang: [{ loai: 'troLy', de: 'abcd' }, { loai: 'soan', de: 'abcd' }] }, env, db, r01);
kiem('làn troLy không làm chặng tuyến được', !tv.ok);

/* ── 9. Thông điệp tới bộ não vận hành ── */
const kq = await V.guiThongDiepBoNao({ noiDung: 'Giảm thời gian phản hồi phụ huynh xuống dưới 2 giờ', phuongAn: 'Phương án sáu phần…' }, env, db, r07);
kiem('Coach không gửi được thông điệp tới bộ não', !kq.ok && kq.code === 'NOPERM');
const td = await V.guiThongDiepBoNao({ noiDung: 'Giảm thời gian phản hồi phụ huynh xuống dưới 2 giờ', phuongAn: 'Phương án sáu phần…' }, env, db, r01);
kiem('SA gửi → một tuyến Agent ba chặng', td.ok && td.soChang === 3 && /^TY-/.test(td.tuyen), JSON.stringify(td));
const ty = sq.prepare('SELECT cacChang, tuChay, trangThai FROM tuyenDaTri WHERE ma = ?').get(td.tuyen);
const ch = JSON.parse(ty.cacChang).map(c => c.loai).join(',');
kiem('tuyến: phân tích → chiến lược → soạn, tự chạy', ch === 'phanTich,chienLuoc,soan' && ty.tuChay === 1 && ty.trangThai === 'dangChay', ch);
kiem('phân hệ đọc từ nội dung (phụ huynh → NHIP)', td.phanHe === 'NHIP', td.phanHe);
const ngan = await V.guiThongDiepBoNao({ noiDung: 'ngắn' }, env, db, r01);
kiem('thông điệp quá ngắn bị chặn', !ngan.ok && ngan.code === 'SAI');
const khanTD = await V.guiThongDiepBoNao({ noiDung: 'Học viên có dấu hiệu tự tử, xử lý giúp' }, env, db, r01);
kiem('thông điệp khẩn không giao Agent', !khanTD.ok && khanTD.code === 'KHAN');
const ds = await V.docThongDiepBoNao({}, env, db, r01);
kiem('SA đọc lại thông điệp kèm tiến độ tuyến', ds.ok && ds.ds.length === 1 && ds.ds[0].tienDo === '0/3', JSON.stringify(ds.ds[0]));
kiem('Coach không đọc được thông điệp', (await V.docThongDiepBoNao({}, env, db, r07)).code === 'NOPERM');

/* ── 10. Cửa nối vào worker ── */
const w = fs.readFileSync(ROOT + '/may-chu/worker.js', 'utf8');
kiem('worker: ba cửa có trong CAN_PHIEN và có nhánh gọi',
  ['troLyV50', 'guiThongDiepBoNao', 'docThongDiepBoNao'].every(f => w.includes("'" + f + "'") && w.includes("fn === '" + f + "'")));
kiem('csdl.sql có bảng thongDiepBoNao', /CREATE TABLE IF NOT EXISTS thongDiepBoNao/.test(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8')));

/* ── 11. Giao diện: không chip gợi ý, có đường máy chủ ── */
const ui = fs.readFileSync(ROOT + '/src/tro-ly-chat.js', 'utf8') + fs.readFileSync(ROOT + '/src/tro-ly-noi.js', 'utf8')
  + fs.readFileSync(ROOT + '/src/tro-ly-hoi-thoai.js', 'utf8');
const bo = ui.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
kiem('giao diện không còn vẽ chip gợi ý', !/class="(chip|kb-chip|tln-chip)"|'kb-chip'|"tln-chip"|kb-chip" data-kbv/.test(bo));
kiem('khung chat gọi cửa troLyV50 và có đường lùi trong máy', /goiMayChu\('troLyV50'/.test(bo) && /traLoiTrongMay\(/.test(bo));
kiem('SA có nút gửi tới bộ não vận hành', /goiMayChu\('guiThongDiepBoNao'/.test(bo) && /Gửi tới bộ não vận hành/.test(bo));

console.log('\n' + (truot ? '✗ ' + truot + ' SAI · ' : '✓ ') + dat + ' đạt');
process.exit(truot ? 1 : 0);
