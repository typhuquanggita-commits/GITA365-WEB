// Thử XƯỞNG PHIM CÓ TRẦN NGÂN SÁCH (may-chu/phim-ngan-sach.js) — chủ hệ mở
// 3–10 USD cho một video 30 phút. Đi qua worker.fetch thật cho phần máy quay:
// giữ tiền trước khi giao việc · máy miễn phí không nhận việc trả phí · máy
// trả phí nhận hạn giờ GPU · biên nhận do máy chủ tính tiền · cầu dao vượt giờ
// · dọn giữ chỗ treo · trần tập và trần tháng không bao giờ vượt.
// Chạy: node tools/thu-phim-ngan-sach.mjs
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
globalThis.fetch = async () => { throw new Error('bộ thử không ra mạng'); };
console.error = () => {};

const sq = new DatabaseSync(':memory:');
/* Móc chạy MỘT lần ngay trước câu lệnh khớp — dựng lại đúng thứ tự xen kẽ mà
   bộ soát đối kháng tìm ra (lịch dọn chen giữa câu chọn và câu nhận…). */
let moc = null;
sq.exec(fs.readFileSync(ROOT + '/may-chu/csdl.sql', 'utf8'));
const db = {
  prepare(sql) { let a = []; const hua = f => { try { return Promise.resolve(f()); } catch (e) { return Promise.reject(e); } }; const st = {
    bind(...x) { a = x; return st; },
    first(col) { return hua(() => { const r = sq.prepare(sql).get(...a) || null; return col && r ? r[col] : r; }); },
    all() { return hua(() => ({ results: sq.prepare(sql).all(...a) })); },
    run() { return hua(() => { if (moc && moc.khop.test(sql)) { const m = moc; moc = null; m.lam(a); } const r = sq.prepare(sql).run(...a); return { meta: { changes: Number(r.changes) } }; }); } }; return st; },
  async batch(ds) { sq.exec('BEGIN'); try { const ra = []; for (const st of ds) ra.push(await st.run()); sq.exec('COMMIT'); return ra; } catch (e) { sq.exec('ROLLBACK'); throw e; } },
  async exec(s) { sq.exec(s); return {}; }
};
const kho = new Map();
const HOSO = {
  async put(k, v, o) { kho.set(k, { body: v, httpMetadata: (o && o.httpMetadata) || {} }); },
  async get(k) { return kho.get(k) || null; }, async delete(k) { kho.delete(k); },
  async list() { return { objects: [...kho.keys()].map(key => ({ key })) }; }
};
const KHOA = 'khoa-xuong-quay-thu';
const env = { CSDL: db, HOSO, GITA_KHOA_XUONG_QUAY: KHOA, GITA_PHIM_TRAN_TAP_USD: '10', GITA_PHIM_TRAN_THANG_USD: '100', GITA_PHIM_GPU_USD_GIO: '3.95' };
let sai = 0; const kiem = (t, d, ct) => { console.log((d ? '  ✓ ' : '  ✗ ') + t + (d || !ct ? '' : ' — ' + ct)); if (!d) sai++; };
const P = await import(pathToFileURL(ROOT + '/may-chu/phim-ngan-sach.js').href);
const worker = (await import(pathToFileURL(ROOT + '/may-chu/worker.js').href)).default;
const { donDep } = await import(pathToFileURL(ROOT + '/may-chu/worker.js').href);
const SA = { role: 'R01', u: 'chu', uid: 'U-SA' }, GD = { role: 'R03', u: 'giamdoc', uid: 'U-GD' };
const PNG = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52, 0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0]).toString('base64');
async function may(duong, than, method, envKhac, dauThem) {
  const r = await worker.fetch(new Request('https://gita365.example.workers.dev' + duong, { method: method || 'POST',
    headers: Object.assign({ 'Content-Type': 'application/json', 'X-Khoa-Quay': KHOA }, dauThem || {}), body: than === undefined ? undefined : JSON.stringify(than) }), envKhac || env, { waitUntil() {} });
  const j = await r.json(); j.__status = r.status; return j;
}

console.log('1 · GIÁM ĐỐC CHIA NGÂN SÁCH (hàm thuần)');
const dg = P.donGia(env);
const k10 = P.phanBoNganSach({ phut: 30, tranUsd: 10, chatLuong: 'canBang', donGia: dg });
const tongGiay = k => k.giayTheoLoai.dong + k.giayTheoLoai.khau + k.giayTheoLoai.tinh;
kiem('Tập 30 phút · 10 USD · cân bằng: đủ 1.800 giây, chi ước tính không quá phần được chi (trừ 20% dự phòng)',
  tongGiay(k10) === 1800 && k10.usdUocTinh <= k10.chiDuoc + 0.01 && k10.chiDuoc === 8, JSON.stringify(k10.usdTheoLoai));
kiem('Có video chuyển động thật trong tập (' + k10.giayTheoLoai.dong + ' giây ≈ ' + k10.tiLeDong + '%) và lời thoại được khớp môi',
  k10.giayTheoLoai.dong > 300 && k10.giayTheoLoai.khau === 630);
const k3 = P.phanBoNganSach({ phut: 30, tranUsd: 3, chatLuong: 'tietKiem', donGia: dg });
kiem('3 USD · tiết kiệm (LTX): vẫn có ' + k3.giayTheoLoai.dong + ' giây chuyển động thật, chi ≤ 2,4 USD', k3.giayTheoLoai.dong > 200 && k3.usdUocTinh <= 2.41);
const k10t = P.phanBoNganSach({ phut: 30, tranUsd: 10, chatLuong: 'tietKiem', donGia: dg });
kiem('Chuyển động thật không vượt 60% thời lượng dù tiền còn dư', k10t.giayTheoLoai.dong === 1080);
const k0 = P.phanBoNganSach({ phut: 30, tranUsd: 0, chatLuong: 'canBang', donGia: dg });
kiem('0 USD: không cảnh trả phí nào, và nói ra vì sao', k0.giayTheoLoai.dong === 0 && k0.usdUocTinh === 0 && k0.ghiChu.length > 0);
let tang = true, truoc = -1;
for (const b of [1, 2, 3, 5, 7, 10]) { const k = P.phanBoNganSach({ phut: 30, tranUsd: b, chatLuong: 'canBang', donGia: dg }); if (k.giayTheoLoai.dong < truoc) tang = false; truoc = k.giayTheoLoai.dong; }
kiem('Nhiều tiền hơn thì không bao giờ ít chuyển động hơn', tang);
kiem('Trần tập: xin 50 USD vẫn chỉ được 10 · xin 3 thì được 3', P.tranCua(env, 50).tap === 10 && P.tranCua(env, 3).tap === 3);
kiem('Biến môi trường chỉ HẠ được trần (khai 25 vẫn là 10, khai 5 là 5)', P.tranCua({ GITA_PHIM_TRAN_TAP_USD: '25' }).tap === 10 && P.tranCua({ GITA_PHIM_TRAN_TAP_USD: '5' }).tap === 5);

console.log('2 · DỰ ÁN · QUYỀN');
kiem('Phụ huynh không lập được dự án phim trả phí', (await P.lapDuAnPhim({ ten: 'Phim thử', soTap: 10, phutTap: 30 }, env, db, { role: 'R13', u: 'ph' })).code === 'NOPERM');
const da = await P.lapDuAnPhim({ ten: 'Mười mùa đông', soTap: 10, phutTap: 30, tranTapUsd: 25, chatLuong: 'canBang' }, env, db, GD);
kiem('Giám đốc lập được dự án; xin 25 USD/tập bị hạ về 10', da.ok && da.tranTapUsd === 10 && da.keHoach.giay === 1800, JSON.stringify({ t: da.tranTapUsd }));
const da3 = await P.lapDuAnPhim({ ten: 'Bản tiết kiệm', soTap: 2, phutTap: 30, tranTapUsd: 3, chatLuong: 'canBang' }, env, db, GD);

console.log('3 · GIỮ TIỀN TRƯỚC KHI GIAO VIỆC');
let giu = 0, n = 0, chan = null;
for (let i = 1; i <= 80; i++) {
  const g = await P.giuChoCanh(env, db, { duAnId: da3.id, tap: 1, canh: 'c' + i, loaiCanh: 'dong', giayRa: 5 });
  if (!g.ok) { chan = g; break; }
  giu += g.giuUsd; n++;
}
kiem('Giữ tới khi chạm trần 3 USD thì từ chối, đề nghị hạ cảnh (' + n + ' cảnh, ' + giu.toFixed(2) + ' USD)', chan && chan.code === 'VUOTTRANTAP' && giu <= 3 + 1e-9 && n > 5, JSON.stringify(chan));
kiem('Một cảnh không bị giữ tiền hai lần', (await P.giuChoCanh(env, db, { duAnId: da3.id, tap: 1, canh: 'c1', loaiCanh: 'dong' })).code === 'DAGIU');
kiem('Cảnh ảnh + chuyển động máy quay không cần giữ tiền', (await P.giuChoCanh(env, db, { duAnId: da3.id, tap: 2, canh: 'x', loaiCanh: 'tinh' })).code === 'KHONGTRAPHI');
const envThang = { ...env, GITA_PHIM_TRAN_THANG_USD: '4' };
const gThang = await P.giuChoCanh(envThang, db, { duAnId: da3.id, tap: 2, canh: 't2-1', loaiCanh: 'dong', giayRa: 30 });
let gT = gThang; for (let i = 2; i < 40 && gT.ok; i++) gT = await P.giuChoCanh(envThang, db, { duAnId: da3.id, tap: 2, canh: 't2-' + i, loaiCanh: 'dong', giayRa: 30 });
kiem('Trần tháng chặn riêng, kể cả khi tập còn tiền', gT.code === 'VUOTTRANTHANG' || gT.code === 'VUOTTRANTAP', gT.code);

console.log('4 · MÁY QUAY: MIỄN PHÍ KHÔNG NHẬN VIỆC TRẢ PHÍ · BIÊN NHẬN · CẦU DAO');
const dat = await P.datCanhTraPhi({ duAnId: da.id, tap: 1, canh: 'mo-dau', loaiCanh: 'dong', giayRa: 5, anh: PNG, loiNhac: 'người mẹ mở cửa sổ đón nắng sớm', phamVi: 'khach' }, env, db, SA);
kiem('Super Admin giao một cảnh trả phí: tiền giữ trước, việc vào hàng chờ, có hạn giờ GPU', dat.ok && !!dat.ma && dat.tranGiayGpu > 0, JSON.stringify(dat));
kiem('Giám đốc không tự giao cảnh trả phí (cùng luật xưởng quay: chỉ Super Admin)', (await P.datCanhTraPhi({ duAnId: da.id, tap: 1, canh: 'x', loaiCanh: 'dong' }, env, db, GD)).code === 'NOPERM');
let nh = await may('/quay/nhan', { may: 'kaggle-1', loai: 'vd' });
kiem('Máy MIỄN PHÍ không nhận việc đã giữ tiền', nh.ok && nh.ma === null, JSON.stringify(nh));
nh = await may('/quay/nhan', { may: 'gpu-thue-1', loai: 'vd', traPhi: true });
kiem('Máy TRẢ PHÍ nhận việc, kèm hạn giờ GPU, độ dài cảnh và mức chất lượng đã giữ tiền',
  nh.ok && nh.ma === dat.ma && nh.tranGiayGpu === dat.tranGiayGpu && nh.giayRa === 5 && nh.chatLuong === 'canBang', JSON.stringify(nh));
let bn = await may('/quay/bien-nhan/' + dat.ma, { gpuGiay: 50, giayRa: 5, say: 'Xong cảnh mở đầu, 5 giây 720p', thatUsd: 0, usd: 0 });
kiem('Biên nhận: máy chủ tự tính tiền từ giây GPU (bỏ qua số tiền máy gửi)', bn.ok && bn.trangThai === 'xong' && Math.abs(bn.thatUsd - 50 * 3.95 / 3600) < 1e-4, JSON.stringify(bn));
kiem('Một cảnh chỉ một biên nhận', (await may('/quay/bien-nhan/' + dat.ma, { gpuGiay: 1, giayRa: 5 })).code === 'DABAO');
const dat2 = await P.datCanhTraPhi({ duAnId: da.id, tap: 1, canh: 'canh-2', loaiCanh: 'dong', giayRa: 5, anh: PNG, loiNhac: 'cậu con trai chạy ra sân', phamVi: 'khach' }, env, db, SA);
await may('/quay/nhan', { may: 'gpu-thue-1', loai: 'vd', traPhi: true });
bn = await may('/quay/bien-nhan/' + dat2.ma, { gpuGiay: dat2.tranGiayGpu * 3, giayRa: 5, say: 'chạy lâu' });
const daSau = sq.prepare('SELECT trangThai, lyDoDung FROM duAnPhim WHERE id=?').get(da.id);
kiem('Máy chạy QUÁ giờ đã giữ → biên nhận "vượt giờ" và cả dự án DỪNG (cầu dao)', bn.trangThai === 'vuotGio' && daSau.trangThai === 'dung', JSON.stringify(daSau));
kiem('Dự án đã dừng không giữ thêm tiền được', (await P.giuChoCanh(env, db, { duAnId: da.id, tap: 1, canh: 'canh-3', loaiCanh: 'dong' })).code === 'DUNG');
kiem('Mở lại: Giám đốc không được; Super Admin phải viết lý do', (await P.moLaiDuAnPhim({ id: da.id, lyDo: 'đã kiểm máy' }, env, db, GD)).code === 'NOPERM' &&
  (await P.moLaiDuAnPhim({ id: da.id }, env, db, SA)).code === 'THIEULYDO' && (await P.moLaiDuAnPhim({ id: da.id, lyDo: 'Đã kiểm máy, đổi sang mô hình nhanh hơn' }, env, db, SA)).ok);
const dat3 = await P.datCanhTraPhi({ duAnId: da.id, tap: 1, canh: 'canh-4', loaiCanh: 'dong', giayRa: 5, anh: PNG, loiNhac: 'cả nhà ngồi ăn cơm tối', phamVi: 'khach' }, env, db, SA);
await may('/quay/nhan', { may: 'gpu-thue-2', loai: 'vd', traPhi: true });
const mp4 = new Uint8Array(2000); mp4.set([0, 0, 0, 24, 0x66, 0x74, 0x79, 0x70], 0);
await worker.fetch(new Request('https://gita365.example.workers.dev/quay/kq/' + dat3.ma, { method: 'PUT', headers: { 'X-Khoa-Quay': KHOA, 'Content-Length': '2000' }, body: mp4 }), env, { waitUntil() {} });
const tam = sq.prepare('SELECT trangThai, thatUsd, giuUsd FROM chiPhiPhim WHERE maViec=?').get(dat3.ma);
kiem('Máy nộp phim mà quên biên nhận → sổ ghi ngay bằng tiền đã giữ (ghi dư, không ghi thiếu)', tam.trangThai === 'xong' && tam.thatUsd === tam.giuUsd, JSON.stringify(tam));
bn = await may('/quay/bien-nhan/' + dat3.ma, { gpuGiay: 20, giayRa: 5, say: 'gửi muộn' });
kiem('Biên nhận tới muộn thay số tạm bằng số thật', bn.ok && Math.abs(bn.thatUsd - 20 * 3.95 / 3600) < 1e-4);

console.log('4b · CẢNH LỖI VẪN TÍNH TIỀN · QUAY LẠI ĐƯỢC · LỖI VƯỢT GIỜ CŨNG NHẢY CẦU DAO');
const daL = await P.lapDuAnPhim({ ten: 'Thử máy lỗi', soTap: 1, phutTap: 30, tranTapUsd: 1, chatLuong: 'canBang' }, env, db, GD);
/* Cảnh 30 giây: hạn 453 giây GPU. Máy chạy 450 giây (còn trong hạn) rồi lỗi
   — ≈ 0,49 USD đã đi thật, không ra phim. */
const gL = await P.giuChoCanh(env, db, { duAnId: daL.id, tap: 1, canh: 'loi-1', loaiCanh: 'dong', giayRa: 30 });
const bL = await P.bienNhanCanh(env, db, { chiPhiId: gL.chiPhiId, ok: false, gpuGiay: Math.floor(gL.tranGiayGpu * 0.99), say: 'hết bộ nhớ ở bước 3' });
kiem('Biên nhận lỗi trong hạn giờ: trạng thái "lỗi", ghi đúng tiền GPU đã chạy, dự án KHÔNG dừng', bL.ok && bL.trangThai === 'loi' && bL.thatUsd > 0.45 && !bL.duAnDung, JSON.stringify(bL));
let gL2 = await P.giuChoCanh(env, db, { duAnId: daL.id, tap: 1, canh: 'loi-2', loaiCanh: 'dong', giayRa: 5 });
let soGiuSauLoi = 0; while (gL2.ok && soGiuSauLoi < 30) { soGiuSauLoi++; gL2 = await P.giuChoCanh(env, db, { duAnId: daL.id, tap: 1, canh: 'loi-x' + soGiuSauLoi, loaiCanh: 'dong', giayRa: 5 }); }
const dungL = Number(sq.prepare("SELECT COALESCE(SUM(CASE WHEN trangThai='giu' THEN giuUsd ELSE COALESCE(thatUsd,0) END),0) u FROM chiPhiPhim WHERE duAnId=? AND trangThai IN ('giu','xong','vuotGio','loi')").get(daL.id).u);
kiem('Tiền của cảnh LỖI vẫn tính vào trần — máy lỗi liên tục không đốt tiền quá trần (' + dungL.toFixed(2) + '/1 USD)', dungL <= 1 + 1e-9 && gL2.code === 'VUOTTRANTAP', JSON.stringify({ dungL, code: gL2.code }));
sq.prepare("UPDATE chiPhiPhim SET trangThai='huy', thatUsd=NULL WHERE duAnId=? AND trangThai='giu'").run(daL.id);
const gLai = await P.giuChoCanh(env, db, { duAnId: daL.id, tap: 1, canh: 'loi-1', loaiCanh: 'dong', giayRa: 5 });
const dongCu = sq.prepare("SELECT canh, trangThai, thatUsd FROM chiPhiPhim WHERE duAnId=? AND trangThai='loi'").get(daL.id);
kiem('Cảnh đã lỗi quay lại được; dòng lỗi cũ GIỮ NGUYÊN tiền, chỉ đổi tên để nhường chỗ', gLai.ok && dongCu && dongCu.thatUsd > 0.45 && /^loi-1#loi-/.test(dongCu.canh), JSON.stringify({ gLai: gLai.code, dongCu }));
kiem('Cảnh đang giữ / đã xong thì vẫn không giữ lần hai', (await P.giuChoCanh(env, db, { duAnId: daL.id, tap: 1, canh: 'loi-1', loaiCanh: 'dong' })).code === 'DAGIU');
const daB = await P.lapDuAnPhim({ ten: 'Thử lỗi vượt giờ', soTap: 1, phutTap: 30, tranTapUsd: 10, chatLuong: 'canBang' }, env, db, GD);
const gB = await P.giuChoCanh(env, db, { duAnId: daB.id, tap: 1, canh: 'b1', loaiCanh: 'dong', giayRa: 5 });
const bB = await P.bienNhanCanh(env, db, { chiPhiId: gB.chiPhiId, ok: false, gpuGiay: gB.tranGiayGpu * 3, say: 'chạy quá rồi hỏng' });
kiem('Biên nhận BÁO HỎNG mà chạy quá giờ cũng nhảy cầu dao (bản đầu bỏ qua: lỗi vượt 30 lần hạn vẫn để dự án chạy)',
  bB.trangThai === 'loi' && bB.duAnDung === true && sq.prepare('SELECT trangThai FROM duAnPhim WHERE id=?').get(daB.id).trangThai === 'dung', JSON.stringify(bB));

console.log('4c · VIỆC TRẢ PHÍ HỎNG KHÔNG BỊ GIAO LẠI TRÊN CÙNG KHOẢN GIỮ');
const daT = await P.lapDuAnPhim({ ten: 'Thử máy im lặng', soTap: 1, phutTap: 30, tranTapUsd: 10, chatLuong: 'canBang' }, env, db, GD);
const im = await P.datCanhTraPhi({ duAnId: daT.id, tap: 1, canh: 'im-lang', loaiCanh: 'dong', giayRa: 5, anh: PNG, loiNhac: 'ông nội kể chuyện bên hiên', phamVi: 'khach' }, env, db, SA);
const nIm = await may('/quay/nhan', { may: 'gpu-thue-4', loai: 'vd', traPhi: true });
sq.prepare('UPDATE quay_viec SET nhanLuc = ? WHERE ma = ?').run(Date.now() - 2 * 3600e3, im.ma);
await may('/quay/nhan', { may: 'gpu-thue-5', loai: 'vd', traPhi: true });
const vIm = sq.prepare('SELECT trangThai FROM quay_viec WHERE ma=?').get(im.ma), cIm = sq.prepare('SELECT trangThai, thatUsd, giuUsd FROM chiPhiPhim WHERE maViec=?').get(im.ma);
kiem('Máy trả phí nhận việc rồi im lặng quá hạn → việc KHÔNG về hàng chờ, khoản giữ ghi là lỗi bằng đúng tiền đã giữ',
  nIm.ma === im.ma && vIm.trangThai === 'loi' && cIm.trangThai === 'loi' && cIm.thatUsd === cIm.giuUsd, JSON.stringify({ vIm, cIm }));
const hong = await P.datCanhTraPhi({ duAnId: daT.id, tap: 1, canh: 'bao-hong', loaiCanh: 'dong', giayRa: 5, anh: PNG, loiNhac: 'bà ngoại nấu nồi canh chua', phamVi: 'khach' }, env, db, SA);
await may('/quay/nhan', { may: 'gpu-thue-6', loai: 'vd', traPhi: true });
await may('/quay/loi/' + hong.ma, { loi: 'CUDA hết bộ nhớ', tamThoi: true });
const vH = sq.prepare('SELECT trangThai FROM quay_viec WHERE ma=?').get(hong.ma), cH = sq.prepare('SELECT trangThai, thatUsd, giuUsd FROM chiPhiPhim WHERE maViec=?').get(hong.ma);
kiem('Máy trả phí báo "hỏng tạm thời" → vẫn không về hàng chờ (lượt hai sẽ đốt tiền mà sổ không ghi)',
  vH.trangThai === 'loi' && cH.trangThai === 'loi' && cH.thatUsd === cH.giuUsd, JSON.stringify({ vH, cH }));
const giaoLai = await P.datCanhTraPhi({ duAnId: daT.id, tap: 1, canh: 'bao-hong', loaiCanh: 'dong', giayRa: 5, anh: PNG, loiNhac: 'bà ngoại nấu nồi canh chua', phamVi: 'khach' }, env, db, SA);
kiem('Giao lại cảnh hỏng bằng một lượt giữ tiền MỚI (đi qua trần như mọi lượt)', giaoLai.ok && giaoLai.ma !== hong.ma, JSON.stringify(giaoLai));
await may('/quay/nhan', { may: 'gpu-thue-7', loai: 'vd', traPhi: true });

console.log('4d · NHỮNG LỖ BỘ SOÁT ĐỐI KHÁNG TÌM RA — MỖI LỖ MỘT PHÉP ĐO');
/* 1 · Sáu lượt giữ tiền gửi CÙNG LÚC vào một tập trần 1 USD (mỗi lượt ≈ 0,5 USD). */
const daS = await P.lapDuAnPhim({ ten: 'Thử song song', soTap: 1, phutTap: 30, tranTapUsd: 1, chatLuong: 'canBang' }, env, db, GD);
const song = await Promise.all([1, 2, 3, 4, 5, 6].map(i => P.giuChoCanh(env, db, { duAnId: daS.id, tap: 1, canh: 's' + i, loaiCanh: 'dong', giayRa: 30 })));
const nhanS = song.filter(g => g.ok), tongS = nhanS.reduce((a, g) => a + g.giuUsd, 0);
kiem('Sáu lượt giữ tiền CÙNG LÚC: chỉ nhận số lượt vừa trần (' + nhanS.length + ' lượt · ' + tongS.toFixed(2) + '/1 USD) — bản đầu nhận cả sáu, 4,96 USD',
  nhanS.length >= 1 && nhanS.length <= 2 && tongS <= 1 + 1e-9, JSON.stringify(song.map(g => g.code || 'ok')));
/* 2 · Cầu dao nhảy thì cảnh ĐANG XẾP HÀNG của dự án ấy cũng dừng. */
const daQ = await P.lapDuAnPhim({ ten: 'Thử cầu dao hàng chờ', soTap: 1, phutTap: 30, tranTapUsd: 10, chatLuong: 'canBang' }, env, db, GD);
const q1 = await P.datCanhTraPhi({ duAnId: daQ.id, tap: 1, canh: 'q1', giayRa: 5, anh: PNG, loiNhac: 'bé gái tưới cây ngoài ban công', phamVi: 'khach' }, env, db, SA);
const q2 = await P.datCanhTraPhi({ duAnId: daQ.id, tap: 1, canh: 'q2', giayRa: 5, anh: PNG, loiNhac: 'bé trai đọc sách bên cửa sổ', phamVi: 'khach' }, env, db, SA);
const nq1 = await may('/quay/nhan', { may: 'gpu-thue-8', loai: 'vd', traPhi: true });
await may('/quay/bien-nhan/' + nq1.ma, { gpuGiay: q1.tranGiayGpu * 3, giayRa: 5, say: 'vượt giờ' });
const nq2 = await may('/quay/nhan', { may: 'gpu-thue-9', loai: 'vd', traPhi: true });
kiem('Cầu dao nhảy → máy trả phí KHÔNG nhận tiếp cảnh đang chờ của dự án ấy (bản đầu nhận thêm hai cảnh, cả hai lại vượt giờ)',
  nq1.ma === q1.ma && nq2.ma === null && sq.prepare('SELECT trangThai FROM quay_viec WHERE ma=?').get(q2.ma).trangThai === 'cho', JSON.stringify({ nq2 }));
/* 3 · Cảnh chuyển động đo tốc độ RIÊNG theo mức chất lượng. */
const daT1 = await P.lapDuAnPhim({ ten: 'Thử mức rẻ', soTap: 1, phutTap: 30, tranTapUsd: 10, chatLuong: 'tietKiem' }, env, db, GD);
for (let i = 1; i <= 5; i++) {
  const g = await P.giuChoCanh(env, db, { duAnId: daT1.id, tap: 1, canh: 'r' + i, loaiCanh: 'dong', giayRa: 5 });
  await P.bienNhanCanh(env, db, { chiPhiId: g.chiPhiId, gpuGiay: 7.5, giayRa: 5, say: 'LTX' });
}
const hsDo = await P.heSoDoDuoc(db);
const daCao = await P.lapDuAnPhim({ ten: 'Thử mức cao', soTap: 1, phutTap: 30, tranTapUsd: 10, chatLuong: 'caoNhat' }, env, db, GD);
const gCao = await P.giuChoCanh(env, db, { duAnId: daCao.id, tap: 1, canh: 'c1', loaiCanh: 'dong', giayRa: 5 });
kiem('Năm biên nhận của mức TIẾT KIỆM không kéo hệ số của mức CAO NHẤT (vẫn 30 ước tính, không 1,5)',
  hsDo['dong|tietKiem'] && Math.abs(hsDo['dong|tietKiem'].heSo - 1.5) < 1e-9 && gCao.heSo === 30 && gCao.nguonHeSo === 'uocTinh', JSON.stringify({ hs: hsDo, gCao }));
/* 4 · Trần khai 0 là CHẶN; xin dưới 1 USD là sai; hạ trần hệ thì dự án cũ hạ theo. */
const envThang0 = { ...env, GITA_PHIM_TRAN_THANG_USD: '0' }, envTap0 = { ...env, GITA_PHIM_TRAN_TAP_USD: '0' }, envTap05 = { ...env, GITA_PHIM_TRAN_TAP_USD: '0.5' };
const daZ = await P.lapDuAnPhim({ ten: 'Thử trần không', soTap: 1, phutTap: 30, tranTapUsd: 10, chatLuong: 'canBang' }, env, db, GD);
kiem('Khai trần THÁNG = 0 → không giữ được đồng nào (bản đầu coi 0 là "không khai" → 100 USD)',
  (await P.giuChoCanh(envThang0, db, { duAnId: daZ.id, tap: 1, canh: 'z1', loaiCanh: 'dong', giayRa: 5 })).code === 'VUOTTRANTHANG');
kiem('Khai trần TẬP = 0 → dự án cũ trần 10 cũng không giữ được (trần hệ hạ thì dự án cũ hạ theo)',
  (await P.giuChoCanh(envTap0, db, { duAnId: daZ.id, tap: 1, canh: 'z2', loaiCanh: 'dong', giayRa: 5 })).code === 'VUOTTRANTAP');
kiem('Xin trần 0,5 USD/tập → từ chối và nói ngưỡng, không lặng lẽ thành 10', (await P.lapDuAnPhim({ ten: 'Thử nửa đô', soTap: 1, phutTap: 30, tranTapUsd: 0.5 }, env, db, GD)).code === 'SAI');
kiem('Trần hệ dưới 1 USD → không lập được dự án mới (xưởng trả phí đang khoá)', (await P.lapDuAnPhim({ ten: 'Thử hệ khoá', soTap: 1, phutTap: 30 }, envTap05, db, GD)).code === 'KHOA');
/* 5 · Lịch dọn chen giữa câu chọn và câu nhận: câu nhận phải tự hỏi lại tiền. */
const daR = await P.lapDuAnPhim({ ten: 'Thử chen ngang', soTap: 1, phutTap: 30, tranTapUsd: 10, chatLuong: 'canBang' }, env, db, GD);
const r1 = await P.datCanhTraPhi({ duAnId: daR.id, tap: 1, canh: 'r1', giayRa: 5, anh: PNG, loiNhac: 'ông bà dạo bộ trong công viên', phamVi: 'khach' }, env, db, SA);
moc = { khop: /^UPDATE quay_viec SET trangThai = 'dang'/, lam: () => sq.prepare("UPDATE chiPhiPhim SET trangThai='huy' WHERE maViec=?").run(r1.ma) };
const nR = await may('/quay/nhan', { may: 'gpu-thue-10', loai: 'vd', traPhi: true });
moc = null;
kiem('Tiền giữ bị trả về giữa câu chọn và câu nhận → máy trả phí KHÔNG nhận việc (bản đầu nhận, đốt 80 giây GPU không ai ghi)',
  nR.ma === null && sq.prepare('SELECT trangThai FROM quay_viec WHERE ma=?').get(r1.ma).trangThai === 'cho', JSON.stringify(nR));
/* 6 · Gắn mã việc vào khoản giữ TRƯỚC khi việc vào hàng chờ. */
let daGanTruoc = null;
moc = { khop: /^INSERT INTO quay_viec/, lam: (a) => { daGanTruoc = !!sq.prepare("SELECT 1 FROM chiPhiPhim WHERE maViec=? AND trangThai='giu'").get(a[0]); } };
const r2 = await P.datCanhTraPhi({ duAnId: daR.id, tap: 1, canh: 'r2', giayRa: 5, anh: PNG, loiNhac: 'mẹ và con nấu bữa sáng', phamVi: 'khach' }, env, db, SA);
moc = null;
kiem('Lúc việc vào hàng chờ, khoản giữ tiền ĐÃ mang mã việc (không còn khe để máy miễn phí nhận mất)', r2.ok && daGanTruoc === true, JSON.stringify({ daGanTruoc }));
await may('/quay/nhan', { may: 'gpu-thue-11', loai: 'vd', traPhi: true });
/* 7 · Khớp môi trả phí chưa có máy nhận → không giam tiền. */
kiem('Giao cảnh KHỚP MÔI trả phí → từ chối rõ ràng, không giữ tiền cho việc không máy nào nhận',
  (await P.datCanhTraPhi({ duAnId: daR.id, tap: 1, canh: 'k1', loaiCanh: 'khau', anh: PNG }, env, db, SA)).code === 'CHUACOMAY');
/* 8 · Dọn giữ chỗ treo ngay khi giữ tiền, không chờ lịch hằng ngày. */
const gTreo = await P.giuChoCanh(env, db, { duAnId: daR.id, tap: 1, canh: 'treo-ngay', loaiCanh: 'dong', giayRa: 5 });
sq.prepare('UPDATE chiPhiPhim SET giuLuc=? WHERE id=?').run(new Date(Date.now() - 4 * 3600e3).toISOString(), gTreo.chiPhiId);
await P.giuChoCanh(env, db, { duAnId: daR.id, tap: 1, canh: 'sau-treo', loaiCanh: 'dong', giayRa: 5 });
kiem('Giữ chỗ quá 3 giờ không máy nhận → trả tiền về NGAY ở lượt giữ tiền kế tiếp (bản đầu chờ lịch 20:00 UTC, có lúc tới 27 giờ)',
  sq.prepare('SELECT trangThai FROM chiPhiPhim WHERE id=?').get(gTreo.chiPhiId).trangThai === 'huy');
/* 9 · Khoá riêng của máy trả phí (khi chủ hệ khai). */
const KHOA_TP_GIA = 'khoa-gia-cho-bo-thu'; // khoá GIẢ chỉ dùng trong bộ thử — gita-bi-mat:bo-qua
const envKhoa = { ...env, GITA_KHOA_MAY_TRA_PHI: KHOA_TP_GIA };
const kKhong = await may('/quay/nhan', { may: 'gpu-thue-12', loai: 'vd', traPhi: true }, 'POST', envKhoa);
const kCo = await may('/quay/nhan', { may: 'gpu-thue-12', loai: 'vd', traPhi: true }, 'POST', envKhoa, { 'X-Khoa-Tra-Phi': KHOA_TP_GIA });
const kBn = await may('/quay/bien-nhan/' + 'a'.repeat(32), { gpuGiay: 1 }, 'POST', envKhoa);
const kMienPhi = await may('/quay/nhan', { may: 'kaggle-2', loai: 'vd' }, 'POST', envKhoa);
const kNop = await worker.fetch(new Request('https://gita365.example.workers.dev/quay/kq/' + (kCo.ma || r2.ma), { method: 'PUT', headers: { 'X-Khoa-Quay': KHOA, 'Content-Length': '2000' }, body: mp4 }), envKhoa, { waitUntil() {} });
kiem('Khai khoá riêng → máy cầm khoá chung KHÔNG nộp kết quả thay cho việc trả phí (sổ ghi tiền theo lượt nộp)', kNop.status === 401, String(kNop.status));
kiem('Khai khoá riêng máy trả phí → thiếu khoá thì không nhận việc trả phí, không gửi biên nhận; máy miễn phí vẫn chạy như cũ',
  kKhong.__status === 401 && kCo.__status === 200 && kBn.__status === 401 && kMienPhi.__status === 200, JSON.stringify({ a: kKhong.__status, b: kCo.__status, c: kBn.__status, d: kMienPhi.__status }));

console.log('5 · DỌN GIỮ CHỖ TREO');
const dat4 = await P.datCanhTraPhi({ duAnId: da.id, tap: 2, canh: 'treo-chua-nhan', loaiCanh: 'dong', giayRa: 5, anh: PNG, loiNhac: 'người cha đọc sách', phamVi: 'khach' }, env, db, SA);
const dat5 = await P.datCanhTraPhi({ duAnId: da.id, tap: 2, canh: 'treo-da-nhan', loaiCanh: 'dong', giayRa: 5, anh: PNG, loiNhac: 'người mẹ tưới cây', phamVi: 'khach' }, env, db, SA);
await may('/quay/nhan', { may: 'gpu-thue-3', loai: 'vd', traPhi: true });
sq.prepare("UPDATE chiPhiPhim SET giuLuc = ? WHERE maViec IN (?, ?)").run(new Date(Date.now() - 5 * 3600e3).toISOString(), dat4.ma, dat5.ma);
await donDep(env);
const r4 = sq.prepare('SELECT trangThai, thatUsd FROM chiPhiPhim WHERE maViec=?').get(dat4.ma);
const r5 = sq.prepare('SELECT trangThai, thatUsd, giuUsd FROM chiPhiPhim WHERE maViec=?').get(dat5.ma);
const daNhan = sq.prepare("SELECT ma FROM quay_viec WHERE ma IN (?, ?) AND trangThai = 'dang'").get(dat4.ma, dat5.ma);
const rDaNhan = daNhan.ma === dat4.ma ? r4 : r5, rChua = daNhan.ma === dat4.ma ? r5 : r4;
kiem('Giữ chỗ treo 3 giờ: việc chưa máy nào nhận → trả tiền về; việc đã có máy chạy → ghi bằng tiền đã giữ',
  rChua.trangThai === 'huy' && rDaNhan.trangThai === 'xong' && rDaNhan.thatUsd > 0, JSON.stringify({ r4, r5 }));

console.log('6 · MÀN ĐỌC · KHÔNG ĐƯỜNG TẮT');
const doc = await P.docXuongPhimNganSach({}, env, db, GD);
const daDoc = doc.duAn.find(d => d.id === da.id);
kiem('Giám đốc đọc được sổ chi: tiền từng tập, biên nhận có câu người đọc được', doc.ok && daDoc && daDoc.tap.length >= 1 && daDoc.bienNhan.some(b => /Xong cảnh mở đầu/.test(b.say || '')));
kiem('Phụ huynh không đọc được sổ chi phim', (await P.docXuongPhimNganSach({}, env, db, { role: 'R13', u: 'ph' })).code === 'NOPERM');
const tongThang = Number(sq.prepare("SELECT COALESCE(SUM(CASE WHEN trangThai='giu' THEN giuUsd ELSE COALESCE(thatUsd,0) END),0) u FROM chiPhiPhim WHERE trangThai IN ('giu','xong','vuotGio')").get().u);
kiem('Tổng đã dùng trong tháng không vượt trần tháng 100 USD', tongThang <= 100);
const ma = fs.readFileSync(ROOT + '/may-chu/phim-ngan-sach.js', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
kiem('Mô-đun không tự gọi mạng — việc trả phí chỉ đi qua hàng chờ xưởng quay', !/\bfetch\s*\(/.test(ma));

console.log(sai ? `\n✗ ${sai} phép đo sai` : '\n✓ Xưởng phim có trần: giữ tiền trước, máy chủ tính tiền, cầu dao giờ GPU, không vượt trần tập và tháng');
process.exit(sai ? 1 : 0);
