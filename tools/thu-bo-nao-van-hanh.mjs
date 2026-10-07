/* Chạy thử BỘ NÃO VẬN HÀNH V50 (may-chu/bo-nao-van-hanh.js) trên một D1 giả
   dựng đúng lược đồ thật csdl.sql: một học viện nhỏ — hai Tư vấn, năm nhà —
   rồi đi đủ vòng đời: chạy thử (chỉ đọc) → nhịp thật → nhịp lần hai (không
   làm lại) → có khách mới → hết Tư vấn → lịch Cloudflare gọi đúng nhánh →
   quyền của hai cửa. In ra như một bản báo cáo vận hành.
   Dùng: node tools/thu-bo-nao-van-hanh.mjs   (Node >= 22.5) */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const thuDaGui = [];
globalThis.fetch = async (u, o) => { thuDaGui.push(String(u)); return new Response('{}', { status: 200 }); };

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
const ngayVN = (ms) => new Date((ms || Date.now()) + 7 * 3600e3).toISOString().slice(0, 10);
const truoc = (n) => new Date(Date.now() - n * 864e5).toISOString();
const hn = ngayVN();

/* ── Một học viện nhỏ ── */
const uIns = sq.prepare("INSERT INTO users (id, username, role, active, pwSalt, pwHash, createdAt) VALUES (?,?,?,?, 'x', 'x', ?)");
for (const [id, u, r] of [['A1', 'chu', 'R01'], ['A2', 'admin2', 'R02'], ['G1', 'giamdoc', 'R03'], ['T5', 'truongcoach', 'R05'], ['C1', 'coach1', 'R07'],
  ['V1', 'tuvan.an', 'R11'], ['V2', 'tuvan.binh', 'R11'], ['P1', 'ph1', 'R13'], ['P2', 'ph2', 'R13'], ['P3', 'ph3', 'R13'], ['P4', 'ph4', 'R13'], ['P5', 'ph5', 'R13']])
  uIns.run(id, u, r, 1, truoc(60));
const kIns = sq.prepare("INSERT INTO hoSoKhach (maKhachHang, uidPhuHuynh, tang, coach, tuVan, trangThai, vaoLuc, suaLuc) VALUES (?,?,?,?,?, 'dangHoc', ?, ?)");
kIns.run('GITA-0001', 'P1', 1, 'coach1', 'tuvan.an', truoc(40), truoc(40));   // đang có Tư vấn, 20 ngày không ai chạm → đèn đỏ
kIns.run('GITA-0002', 'P2', 1, 'coach1', 'tuvan.an', truoc(30), truoc(30));   // chạm 3 ngày trước → xanh
kIns.run('GITA-0003', 'P3', 0, null, null, truoc(2), truoc(2));               // khách mới, chưa ai phụ trách
kIns.run('GITA-0004', 'P4', 0, null, null, truoc(1), truoc(1));               // khách mới, chưa ai phụ trách
const cIns = sq.prepare("INSERT INTO soCham (id, maNha, ngay, kieu, noiDung, canCu, aiDuyet, boiAi, ghiLuc) VALUES (?,?,?, 'goi', 'gọi hỏi thăm', 'buổi coach', 'coach1', 'coach1', ?)");
cIns.run('SC1', 'GITA-0001', ngayVN(Date.now() - 20 * 864e5), truoc(20));
cIns.run('SC2', 'GITA-0002', ngayVN(Date.now() - 3 * 864e5), truoc(3));
sq.prepare("INSERT INTO crmKhach (maKH, phuTrach, giaiDoan, henTiep, capNhatLuc) VALUES ('GITA-0001', 'tuvan.an', 'donghanh', ?, ?)").run(ngayVN(Date.now() + 10 * 864e5), truoc(20));
sq.prepare("INSERT INTO crmKhach (maKH, phuTrach, giaiDoan, henTiep, capNhatLuc) VALUES ('GITA-0002', 'tuvan.an', 'donghanh', ?, ?)").run(ngayVN(Date.now() - 2 * 864e5), truoc(5));
sq.prepare("INSERT INTO kyThu (id, maKhachHang, tang, ky, soKy, ngayThu, phaiThu, hanLuc, taoLuc) VALUES ('KY1', 'GITA-0002', 1, 1, 2, 1, 5000000, ?, ?)").run(truoc(9), truoc(30));

const BN = await import(pathToFileURL(ROOT + '/may-chu/bo-nao-van-hanh.js').href);
let soLanAI = 0;
const env = { CSDL: db, GITA_DA_TRI_BAT: '1', GITA_CHE_DO_TIET_KIEM: '1', AI: { run: async () => { soLanAI++; return { response: 'Kết quả chặng ' + soLanAI + ': ba ý chính đã phân tích.', usage: { prompt_tokens: 50, completion_tokens: 40 } }; } }, GITA_THU_DOANH_THU: 'chu@gita.vn' };

let dat = 0, sai = 0;
const thu = (ten, ok) => { if (ok) { dat++; console.log('  ✓ ' + ten); } else { sai++; console.log('  ✗ ' + ten); } };
const inBuoc = (kq) => kq.buoc.forEach(b => console.log('     · ' + (b.tt === 'ok' ? 'ổn     ' : b.tt === 'canhBao' ? 'cảnh báo' : 'LỖI    ') + ' ' + b.ten +
  (b.ma === 'PHAN_CONG' ? ' — ' + b.so + ' nhà · ' + (kq.that ? 'đã giao ' + b.daGan : 'sẽ giao ' + b.seGan) : '') +
  (b.ma === 'DEN_CHAM' ? ' — xanh ' + b.xanh + ' · vàng ' + b.vang + ' · đỏ ' + b.do + (kq.that ? ' · đưa lên đầu ' + b.duaLen : '') : '') +
  (b.ma === 'HEN_CRM' ? ' — ' + b.tong + ' hẹn quá hạn' : '') +
  (b.ma === 'CONG_NO' ? ' — ' + b.so + ' kỳ quá hạn · ' + (b.tongConNo || 0).toLocaleString('vi-VN') + ' đ · chưa ai nhắc ' + b.chuaAiNhac : '') +
  (b.ma === 'BAO_DONG' ? ' — ' + (b.soNgo ? b.soNgo + ' tài khoản đáng ngờ' : 'không có dấu hiệu') + (b.mailCuu ? '' : ' · chưa nạp email cứu hệ') : '') +
  (b.ma === 'CHUP_DO' ? ' — ' + (b.daChup ? 'đã chụp' : b.seChup ? 'sẽ chụp' : b.daCo ? 'hôm nay đã có' : '') : '') +
  (b.loi ? ' — ' + b.loi : '')));

console.log('\n1 · CHẠY THỬ (chỉ đọc, không ghi gì)');
const soDongTruoc = dem("SELECT COUNT(*) n FROM crmKhach");
const k0 = await BN.nhipVanHanh(env, { that: false });
inBuoc(k0);
thu('chạy thử không ghi: hai nhà mới vẫn chưa có Tư vấn', dem("SELECT COUNT(*) n FROM hoSoKhach WHERE tuVan IS NULL") === 2);
thu('chạy thử không thêm dòng CRM, không ghi nhịp', dem("SELECT COUNT(*) n FROM crmKhach") === soDongTruoc && dem("SELECT COUNT(*) n FROM sqlite_master WHERE name='nhipBoNao'") === 1 && dem("SELECT COUNT(*) n FROM nhipBoNao") === 0);
thu('chạy thử báo đúng việc sẽ làm: giao 2 nhà, 1 nhà đỏ', k0.buoc.find(b => b.ma === 'PHAN_CONG').seGan === 2 && k0.buoc.find(b => b.ma === 'DEN_CHAM').do === 1);
thu('không bước nào lỗi', k0.tom.loi === 0);

console.log('\n2 · NHỊP THẬT (lịch mỗi giờ)');
const k1 = await BN.nhipVanHanh(env, { that: true });
inBuoc(k1);
const gan = sq.prepare("SELECT maKhachHang, tuVan FROM hoSoKhach WHERE maKhachHang IN ('GITA-0003','GITA-0004') ORDER BY maKhachHang").all();
thu('hai nhà mới đều có Tư vấn', gan.every(x => x.tuVan));
thu('chia đều: người đang giữ ít nhà nhất nhận trước (tuvan.binh trước tuvan.an)', gan[0].tuVan === 'tuvan.binh');
thu('CRM: nhà mới có người phụ trách và hẹn chạm HÔM NAY', dem("SELECT COUNT(*) n FROM crmKhach WHERE maKH IN ('GITA-0003','GITA-0004') AND henTiep = ? AND giaiDoan = 'moi'", hn) === 2);
thu('nhà đèn đỏ lên đầu danh sách gọi (hẹn 10 ngày nữa → hôm nay)', sq.prepare("SELECT henTiep FROM crmKhach WHERE maKH='GITA-0001'").get().henTiep === hn);
thu('hẹn CRM quá hạn và công nợ quá hạn được đếm', k1.buoc.find(b => b.ma === 'HEN_CRM').tong === 1 && k1.buoc.find(b => b.ma === 'CONG_NO').so === 1);
thu('mỗi lượt giao có dấu trong nhật ký', dem("SELECT COUNT(*) n FROM audit WHERE viec = 'BO_NAO_PHAN_CONG'") === 2);
thu('nhịp được ghi để bảng điều khiển đọc lại', dem("SELECT COUNT(*) n FROM nhipBoNao WHERE kieu='nhip' AND that=1") === 1);

console.log('\n3 · NHỊP LẦN HAI (một giờ sau)');
const k2 = await BN.nhipVanHanh(env, { that: true });
thu('không giao lại, không đè người đã giao', k2.buoc.find(b => b.ma === 'PHAN_CONG').so === 0 && sq.prepare("SELECT tuVan FROM hoSoKhach WHERE maKhachHang='GITA-0003'").get().tuVan === 'tuvan.binh');
thu('nhà đỏ đã ở đầu danh sách thì không ghi lại', k2.buoc.find(b => b.ma === 'DEN_CHAM').duaLen === 0);
sq.prepare("UPDATE hoSoKhach SET tuVan = 'giao.tay' WHERE maKhachHang = 'GITA-0004'").run();
await BN.nhipVanHanh(env, { that: true });
thu('quản lý đã giao tay thì bộ não không đổi', sq.prepare("SELECT tuVan FROM hoSoKhach WHERE maKhachHang='GITA-0004'").get().tuVan === 'giao.tay');

console.log('\n4 · CÓ KHÁCH LÀ CHẠY');
kIns.run('GITA-0005', 'P5', 0, null, null, new Date().toISOString(), new Date().toISOString());
const pc = await BN.kichHoatKhachMoi(env, db, 'GITA-0005');
console.log('     · GITA-0005 kích hoạt → ' + pc.ket + ' · ' + (pc.tuVan || ''));
thu('khách vừa kích hoạt được giao Tư vấn ngay', pc.ket === 'daGan' && !!pc.tuVan);
thu('lượt khách mới được ghi vào nhịp', dem("SELECT COUNT(*) n FROM nhipBoNao WHERE kieu='khachMoi'") === 1);
sq.prepare("UPDATE users SET active = 0 WHERE role = 'R11'").run();
kIns.run('GITA-0006', 'P5', 0, null, null, new Date().toISOString(), new Date().toISOString());
const pc2 = await BN.kichHoatKhachMoi(env, db, 'GITA-0006');
thu('hết Tư vấn hoạt động: báo thiếu người, không giao bừa', pc2.ket === 'khongCoTuVan' && dem("SELECT COUNT(*) n FROM audit WHERE viec='BO_NAO_THIEU_TU_VAN'") === 1);
sq.prepare("UPDATE users SET active = 1 WHERE role = 'R11'").run();

console.log('\n5 · LỊCH CLOUDFLARE');
const W = (await import(pathToFileURL(ROOT + '/may-chu/worker.js').href)).default;
const cho = []; const ctx = { waitUntil: (p) => cho.push(p) };
const truocNhip = dem("SELECT COUNT(*) n FROM nhipBoNao WHERE kieu='nhip'");
thuDaGui.length = 0;
await W.scheduled({ cron: BN.CRON_NHIP, scheduledTime: Date.UTC(2026, 9, 8, 0, 0) }, env, ctx);
await Promise.all(cho);
thu('lượt đầu ca lúc 00:00 UTC chạy nhịp, KHÔNG gửi lại bản tổng doanh thu (lịch 0 0 * * * là lượt riêng)', dem("SELECT COUNT(*) n FROM nhipBoNao WHERE kieu='nhip'") === truocNhip + 1 && thuDaGui.length === 0);
const lanCuoi = JSON.parse(sq.prepare("SELECT ketQua FROM nhipBoNao WHERE kieu='nhip' ORDER BY luc DESC, rowid DESC LIMIT 1").get().ketQua);
thu('lượt đầu ca làm đủ việc nặng (công nợ · hẹn CRM · kho chờ duyệt · chụp đo)', lanCuoi.lan === 0 && ['CONG_NO', 'HEN_CRM', 'KHO_CHO_DUYET', 'CHUP_DO'].every(m => lanCuoi.buoc.some(b => b.ma === m)));
cho.length = 0;
await W.scheduled({ cron: BN.CRON_NHIP, scheduledTime: Date.UTC(2026, 9, 8, 0, 20) }, env, ctx);
await Promise.all(cho);
const lan4 = JSON.parse(sq.prepare("SELECT ketQua FROM nhipBoNao WHERE kieu='nhip' ORDER BY luc DESC, rowid DESC LIMIT 1").get().ketQua);
thu('lượt phút 20 là lượt thứ 5: chỉ việc nhẹ + Agent, không quét công nợ lại', lan4.lan === 4 && !lan4.buoc.some(b => b.ma === 'CONG_NO') && lan4.buoc.some(b => b.ma === 'AGENT') && lan4.buoc.some(b => b.ma === 'PHAN_CONG'));
thu('lịch là LÀM 30 PHÚT · NGHỈ 30 PHÚT: sáu lượt ở phút 0–25, không lượt nào từ phút 30', BN.CRON_NHIP === '0,5,10,15,20,25 * * * *' && BN.LUOT_MOI_CA === 6);
cho.length = 0;
const truocNghi = dem("SELECT COUNT(*) n FROM nhipBoNao");
await W.scheduled({ cron: BN.CRON_NHIP, scheduledTime: Date.UTC(2026, 9, 8, 1, 0) }, Object.assign({}, env, { GITA_BO_NAO_NGHI: '1' }), ctx);
await Promise.all(cho);
thu('công tắc khẩn GITA_BO_NAO_NGHI = 1: bộ não nghỉ hẳn', dem("SELECT COUNT(*) n FROM nhipBoNao") === truocNghi);
const toml = fs.readFileSync(ROOT + '/may-chu/wrangler.toml', 'utf8');
thu('wrangler.toml khai lịch mỗi giờ', toml.includes('"' + BN.CRON_NHIP + '"'));
const wk = fs.readFileSync(ROOT + '/may-chu/worker.js', 'utf8');
thu('worker.js nối kích hoạt tài khoản → bộ não', /fn === 'kichHoat' && kq\.maKhachHang[\s\S]{0,120}kichHoatKhachMoi/.test(wk));

console.log('\n6 · ĐỘI AGENT TỰ CHẠY');
const DT = await import(pathToFileURL(ROOT + '/may-chu/bo-nao-da-tri.js').href);
const R01 = { role: 'R01', u: 'chu', uid: 'A1' };
const t1 = await DT.taoTuyenDaTri({ ten: 'Soạn chuỗi bài cho phụ huynh mới', tuChay: true, chang: [{ loai: 'tomTat', de: 'Tóm tắt ba nỗi lo lớn nhất của phụ huynh mới' }, { loai: 'soan', de: 'Soạn dàn ý ba bài đọc ngắn' }] }, env, db, R01);
const t2 = await DT.taoTuyenDaTri({ ten: 'Tuyến chạy tay', chang: [{ loai: 'phanTich', de: 'Phân tích việc A' }, { loai: 'soan', de: 'Soạn việc B' }] }, env, db, R01);
thu('tạo tuyến có "tự chạy"', t1.ok && t1.tuChay === true && t2.ok && t2.tuChay === false);
const kThu = await BN.nhipVanHanh(env, { that: false, lan: 2 });
thu('chạy thử: báo tuyến sẽ chạy, không gọi AI', kThu.buoc.find(b => b.ma === 'AGENT').so === 1 && soLanAI === 0);
const kA = await BN.nhipVanHanh(env, { that: true, lan: 2 });
const bA = kA.buoc.find(b => b.ma === 'AGENT');
console.log('     · lượt làm việc: ' + bA.daChay + '/' + bA.so + ' tuyến chạy tiếp · ' + JSON.stringify(bA.ket));
thu('lượt làm việc: tuyến tự chạy đi tiếp một chặng', bA.daChay === 1 && sq.prepare('SELECT dangO FROM tuyenDaTri WHERE ma = ?').get(t1.ma).dangO === 1);
thu('tuyến KHÔNG bật tự chạy thì bộ não không đụng', sq.prepare('SELECT dangO FROM tuyenDaTri WHERE ma = ?').get(t2.ma).dangO === 0);
await BN.nhipVanHanh(env, { that: true, lan: 3 });
thu('lượt sau: tuyến chạy xong chặng cuối và dừng', sq.prepare('SELECT trangThai FROM tuyenDaTri WHERE ma = ?').get(t1.ma).trangThai === 'xong');
const soAI = soLanAI;
await BN.nhipVanHanh(env, { that: true, lan: 4 });
thu('tuyến đã xong thì không gọi AI nữa', soLanAI === soAI);
thu('bật tự chạy cho tuyến có sẵn: chỉ Super Admin', (await DT.datTuChayTuyen({ ma: t2.ma, bat: true }, env, db, { role: 'R02', u: 'a', uid: 'A2' })).code === 'NOPERM' && (await DT.datTuChayTuyen({ ma: t2.ma, bat: true }, env, db, R01)).ok);
const t3 = await DT.taoTuyenDaTri({ ten: 'Tuyến cần phân tích sâu', tuChay: true, chang: [{ loai: 'phanTich', de: 'Phân tích sâu thị trường' }, { loai: 'soan', de: 'Soạn kết luận' }] }, env, db, R01);
const kSau = await BN.nhipVanHanh(env, { that: true, lan: 5 });
const bSau = kSau.buoc.find(b => b.ma === 'AGENT'), k3 = (bSau.ket || []).find(k => k.ma === t3.ma);
thu('chế độ tiết kiệm: chặng phân tích sâu CHỜ và nói rõ cần nạp khoá AI bậc cao', k3 && k3.loi === 'KHONG_NCC' && /GITA_CHE_DO_TIET_KIEM/.test(k3.vi) && bSau.tt === 'canhBao');
await DT.datTuChayTuyen({ ma: t3.ma, bat: false }, env, db, R01);
const soAI2 = soLanAI;
const kTat = await BN.nhipVanHanh(Object.assign({}, env, { GITA_DA_TRI_BAT: '0' }), { that: true, lan: 1 });
thu('bộ não đa trí tắt: tuyến chờ, có cảnh báo, không gọi AI', kTat.buoc.find(b => b.ma === 'AGENT').tt === 'canhBao' && soLanAI === soAI2);

console.log('\n7 · CỬA VÀ QUYỀN');
const ho = (role) => ({ role, u: 'x', uid: 'x' });
thu('chạy tay: chỉ Super Admin', (await BN.chayThuBoNao({}, env, db, ho('R02'))).code === 'NOPERM' && (await BN.chayThuBoNao({}, env, db, ho('R01'))).ok);
thu('chạy tay mặc định là chạy thử', (await BN.chayThuBoNao({}, env, db, ho('R01'))).that === false);
const d = await BN.docBoNao({}, env, db, ho('R03'));
thu('bảng điều khiển: R01–R03 đọc được, R05 không', d.ok && (await BN.docBoNao({}, env, db, ho('R05'))).code === 'NOPERM');
thu('bảng điều khiển có đủ phân hệ và lịch sử chạy', d.phanHe.length >= 8 && d.lanChay.length >= 3);
const envKhoa = Object.assign({}, env, { GITA_KHOA_OPENAI: 'sk-bimat-123' });
thu('không bao giờ trả giá trị khoá — chỉ có/không', !JSON.stringify((await BN.docBoNao({}, envKhoa, db, ho('R01'))).phanHe).includes('sk-bimat'));
thu('bộ não đa trí: báo đúng chế độ tiết kiệm', /Tiết kiệm/.test(d.phanHe.find(x => x.ma === 'DA_TRI').cheDo));

console.log('\n' + dat + ' đạt · ' + sai + ' sai');
process.exit(sai ? 1 : 0);
