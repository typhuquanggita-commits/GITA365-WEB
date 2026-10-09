// Thử MẠCH TỰ SOÁT VIỆC KẸT (may-chu/viec-ket.js) trên D1 giả dựng từ csdl.sql.
// Gieo việc vào từng hàng đợi — có việc mới, việc chờ có chủ, việc kẹt — rồi
// đòi mạch phân loại đúng, nói "không biết" khi không đọc được, và bộ não vận
// hành chỉ báo MỘT lần mỗi ngày, không tự gỡ thay ai.
// Chạy: node tools/thu-viec-ket.mjs
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
const VK = await import(pathToFileURL(ROOT + '/may-chu/viec-ket.js').href);
const truoc = gio => new Date(Date.now() - gio * 3600e3).toISOString();
const sau = gio => new Date(Date.now() + gio * 3600e3).toISOString();
const ngayVN = ms => new Date(ms + 7 * 3600e3).toISOString().slice(0, 10);
const hang = (kq, ma) => kq.hang.find(h => h.ma === ma);

console.log('1 · MỌI CÂU TRUY VẤN ĐÚNG VỚI LƯỢC ĐỒ THẬT');
let kq = await VK.doViecKet(db);
const kb = kq.hang.filter(h => h.trangThai === 'khongBiet');
kiem('Không hàng nào "không biết" trên lược đồ csdl.sql (bắt mọi tên cột gõ sai)', kb.length === 0, kb.map(h => h.ma + ': ' + h.loi).join(' | '));
VK.HANG_DOI.push({ ma: 'CHUA_CO', ten: 'Bảng chưa dựng', cua: 'crm', nguong: 1, sql: 'SELECT id, id AS tomTat, NULL AS chu, luc AS tu, NULL AS han FROM bangChuaTungDung' });
const kqCd = await VK.doViecKet(db);
VK.HANG_DOI.pop();
kiem('Bảng do mô-đun tự dựng mà chưa có → "chưa dùng", không gộp vào "thông" hay "không biết"', hang(kqCd, 'CHUA_CO').trangThai === 'chuaDung' && kqCd.tong.khongBiet === 0);
kiem('Kho trống → 0 việc kẹt', kq.tong.ket === 0);

console.log('2 · GIEO VIỆC VÀO TỪNG HÀNG');
sq.prepare("INSERT INTO phieuThu (id,maKhachHang,soTien,hinhThuc,nguoiGhi,ghiLuc,trangThai) VALUES ('PT1','GITA-0091',5000000,'chuyenKhoan','ketoan.thu',?,'choDuyet')").run(truoc(72));
sq.prepare("INSERT INTO phieuThu (id,maKhachHang,soTien,hinhThuc,nguoiGhi,ghiLuc,trangThai) VALUES ('PT2','GITA-0092',5000000,'chuyenKhoan','ketoan.thu',?,'choDuyet')").run(truoc(2));
sq.prepare("INSERT INTO chiPhi (id,khoanMuc,soTien,ngayChi,hinhThuc,dienGiai,nguoiDeXuat,deXuatLuc,trangThai) VALUES ('CP1','vanPhong',800000,'2026-10-01','tienMat','mua giấy','nv1',?,'choDuyet')").run(truoc(24));
sq.prepare("INSERT INTO yeuCauXoa (id,maNha,boiAi,ghiLuc,hanXuLy) VALUES ('XD1','GITA-0093','ph3',?,?)").run(truoc(24), sau(24 * 20));
sq.prepare("INSERT INTO yeuCauXoa (id,maNha,boiAi,ghiLuc,hanXuLy) VALUES ('XD2','GITA-0094','ph4',?,?)").run(truoc(24 * 31), truoc(24));
sq.prepare("INSERT INTO users (id,username,role,active,pwSalt,pwHash,createdAt) VALUES ('P9','ph9','R13',1,'x','x',?)").run(truoc(100));
sq.prepare("INSERT INTO hoSoKhach (maKhachHang,uidPhuHuynh,tang,trangThai,vaoLuc,suaLuc) VALUES ('GITA-0095','P9',0,'dangHoc',?,?)").run(truoc(48), truoc(48));
sq.prepare("INSERT INTO crmKhach (maKH,phuTrach,giaiDoan,henTiep,capNhatLuc) VALUES ('GITA-0096','tuvan.an','donghanh',?,?)").run(ngayVN(Date.now() - 2 * 864e5), truoc(72));
sq.prepare("INSERT INTO crmKhach (maKH,phuTrach,giaiDoan,henTiep,capNhatLuc) VALUES ('GITA-0097','tuvan.an','donghanh',?,?)").run(ngayVN(Date.now() + 3 * 864e5), truoc(5));
sq.prepare("INSERT INTO tinTaiChinh (id,mucDo,loai,tieuDe,than,nguoiDang,luc,giaoCho,hanXuLy,trangThai) VALUES ('TT1','vang','thu','Đối chiếu tháng 9','x','kt',?,'ketoan.truong',?,'moi')").run(truoc(5), sau(48));
sq.prepare("INSERT INTO tinTaiChinh (id,mucDo,loai,tieuDe,than,nguoiDang,luc,trangThai) VALUES ('TT2','xanh','thu','Ghi chú ngân hàng','x','kt',?,'moi')").run(truoc(48));
sq.prepare("INSERT INTO thongBao (id,denVai,loai,mucDo,tieuDe,than,luc) VALUES ('TB1','R01','lienHe','canXem','Yêu cầu tư vấn mới','x',?)").run(truoc(72));
sq.prepare("INSERT INTO phatSinh (id,loai,kho,chiTiet,aiGhi,luc) VALUES ('PS1','khoRong','TAILIEU_GIA_DINH','chưa có tài liệu về giờ ngủ','sp',?)").run(truoc(24 * 8));
sq.prepare("INSERT INTO phatSinh (id,loai,kho,chiTiet,aiGhi,luc) VALUES ('PS2','khoRong','TAILIEU_GIA_DINH','đã có bản nháp lấp lỗ này','sp',?)").run(truoc(24 * 9));
sq.prepare("INSERT INTO banNhapKho (id,phatSinhId,tenKho,tieuDe,noiDung,nguon,loaiDuyet,aiSoan,soanLuc,trangThai) VALUES ('BN1','PS2','TAILIEU_GIA_DINH','Giờ ngủ','...','xưởng','kho','xuong-tai-lieu',?,'nhap')").run(truoc(24));
sq.prepare("INSERT INTO deAnTaiLieu (id,chuDe,doiTuong,tang,soChuong,trangThai,loiCuoi,taoBoi,taoLuc,suaLuc) VALUES ('TL-1','Giờ ngủ','phuHuynh','T1',3,'dung','Chạm trần lượt','sp',?,?)").run(truoc(30), truoc(5));
sq.prepare("INSERT INTO deAnTaiLieu (id,chuDe,doiTuong,tang,soChuong,trangThai,tuChay,taoBoi,taoLuc,suaLuc) VALUES ('TL-2','Tiền tiêu vặt','phuHuynh','T1',3,'viet',1,'sp',?,?)").run(truoc(3), truoc(1));
sq.prepare("INSERT INTO luotNangCap (id,viec,vung,luiLai,cap,capViSao,aiDeXuat,deXuatLuc) VALUES ('NC1','Đổi bố cục màn','giaoDien','trả lại bản cũ',2,'x','dev',?)").run(truoc(24 * 10));
kq = await VK.doViecKet(db);
const so = ma => hang(kq, ma).so;
kiem('Phiếu thu chờ 3 ngày → KẸT; phiếu mới 2 giờ → đang chạy', so('PHIEU_THU').ket === 1 && so('PHIEU_THU').dang === 1);
kiem('Khoản chi đề xuất hôm qua (ngưỡng 72 giờ) → đang chạy, chưa kẹt', so('CHI_PHI').dang === 1 && so('CHI_PHI').ket === 0);
kiem('Yêu cầu xoá còn hạn luật, có người → CHỜ CÓ CHỦ; quá hạn luật → KẸT', so('XOA_DU_LIEU').cho === 1 && so('XOA_DU_LIEU').ket === 1);
kiem('Khách mới 2 ngày chưa có Tư vấn → KẸT', so('KHACH_MOI').ket === 1);
kiem('Hẹn CRM đã qua ngày → KẸT; hẹn tương lai không bị tính', so('HEN_CRM').ket === 1 && so('HEN_CRM').cho + so('HEN_CRM').dang === 0);
kiem('Tin tài chính có người cầm, còn hạn → CHỜ; không ai cầm 2 ngày → KẸT', so('TIN_TAI_CHINH').cho === 1 && so('TIN_TAI_CHINH').ket === 1);
kiem('Thông báo cần xem 3 ngày chưa ai mở → KẸT', so('HOP_THU').ket === 1);
kiem('Phát sinh 8 ngày chưa ai soạn → KẸT; phát sinh đã có bản nháp không tính', so('PHAT_SINH').ket === 1 && so('PHAT_SINH').dang === 0);
kiem('Bản nháp mới 1 ngày → đang chạy', so('BAN_NHAP').dang === 1 && so('BAN_NHAP').ket === 0);
kiem('Đề án tài liệu đang dừng → KẸT (cần Super Admin); đề án tự chạy mới đi → đang chạy', so('DE_AN_TAI_LIEU').ket === 1 && so('DE_AN_TAI_LIEU').dang === 1);
kiem('Đề xuất nâng cấp 10 ngày chưa ký → KẸT', so('NANG_CAP').ket === 1);
const pt = hang(kq, 'PHIEU_THU');
kiem('Việc kẹt nói VÌ SAO và màn xử lý có thật', pt.mau[0].id === 'PT1' && /Nằm im 72 giờ/.test(pt.mau[0].viSao) && pt.cua === 'phong-tai-chinh');
const views = new Set();
for (const f of fs.readdirSync(ROOT + '/src')) for (const m of fs.readFileSync(ROOT + '/src/' + f, 'utf8').matchAll(/G\.VIEWS\['([a-z0-9-]+)'\]\s*=/g)) views.add(m[1]);
const thieuMan = VK.HANG_DOI.filter(q => !views.has(q.cua)).map(q => q.ma + '→' + q.cua);
kiem('Mọi hàng đợi trỏ tới một màn CÓ THẬT', thieuMan.length === 0, thieuMan.join(', '));
kiem('Tổng: 9 việc kẹt, 2 việc chờ có chủ, 4 việc đang chạy', kq.tong.ket === 9 && kq.tong.cho === 2 && kq.tong.dang === 4, JSON.stringify(kq.tong));

console.log('3 · KHÔNG BIẾT LÀ MỘT GIÁ TRỊ');
VK.HANG_DOI.push({ ma: 'PHA_THU', ten: 'Phá thử', cua: 'crm', nguong: 1, sql: 'SELECT id, cotKhongCo AS tomTat, NULL AS chu, ghiLuc AS tu, NULL AS han FROM phieuThu' });
const kqPha = await VK.doViecKet(db);
VK.HANG_DOI.pop();
kiem('Phá thử: câu truy vấn gõ sai tên cột → hàng ấy "không biết", KHÔNG báo "thông"', hang(kqPha, 'PHA_THU').trangThai === 'khongBiet' && kqPha.tong.khongBiet === 1);
kiem('Việc không có mốc thời gian nào → "không biết", không đoán là ổn', VK.xepViec({ id: 'x' }, { nguong: 1 }, Date.now()).loai === 'khongBiet');

console.log('4 · QUYỀN');
kiem('Phụ huynh (R13) không đọc được', (await VK.docViecKet({}, {}, db, { role: 'R13', u: 'ph' })).code === 'NOPERM');
kiem('Coach (R07) không đọc được', (await VK.docViecKet({}, {}, db, { role: 'R07', u: 'c' })).code === 'NOPERM');
kiem('Giám đốc (R03) đọc được', (await VK.docViecKet({}, {}, db, { role: 'R03', u: 'gd' })).ok === true);

console.log('5 · BỘ NÃO VẬN HÀNH: BÁO MỘT LẦN, KHÔNG TỰ GỠ');
const BN = await import(pathToFileURL(ROOT + '/may-chu/bo-nao-van-hanh.js').href);
const env = { CSDL: db };
const tbTruoc = dem("SELECT COUNT(*) n FROM thongBao WHERE loai='viecKet'");
const k0 = await BN.nhipVanHanh(env, { that: false, kieu: 'thu' });
const b0 = k0.buoc.find(b => b.ma === 'VIEC_KET');
kiem('Chạy thử: báo sẽ gửi, KHÔNG ghi dòng nào', b0 && b0.seBao === true && b0.ket === 9 && dem("SELECT COUNT(*) n FROM thongBao WHERE loai='viecKet'") === tbTruoc, JSON.stringify(b0));
const k1 = await BN.nhipVanHanh(env, { that: true, kieu: 'nhip' });
const b1 = k1.buoc.find(b => b.ma === 'VIEC_KET');
const tb = sq.prepare("SELECT denVai, than FROM thongBao WHERE loai='viecKet'").all();
kiem('Nhịp thật đầu ca: đúng hai dòng (Giám đốc + Super Admin)', b1 && b1.daBao === true && tb.length === 2 && tb.map(x => x.denVai).sort().join() === 'R01,R03', JSON.stringify(b1));
kiem('Thông báo không chép tên khách hay mã nhà', tb.every(x => !/GITA-\d+/.test(x.than)));
const k2 = await BN.nhipVanHanh(env, { that: true, kieu: 'nhip' });
kiem('Lượt đầu ca thứ hai cùng ngày: không báo lại', k2.buoc.find(b => b.ma === 'VIEC_KET').daBaoHomNay === true && dem("SELECT COUNT(*) n FROM thongBao WHERE loai='viecKet'") === 2);
kiem('Mạch không tự gỡ: phiếu thu kẹt vẫn chờ người xác nhận', sq.prepare("SELECT trangThai FROM phieuThu WHERE id='PT1'").get().trangThai === 'choDuyet');
const ma = fs.readFileSync(ROOT + '/may-chu/viec-ket.js', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
kiem('Mã mạch việc kẹt CHỈ ĐỌC: không INSERT · UPDATE · DELETE', !/\b(INSERT|UPDATE|DELETE)\b/i.test(ma));

console.log(sai ? `\n✗ ${sai} phép đo sai` : '\n✓ Mạch việc kẹt: phân biệt kẹt với chờ, nói "không biết" khi không đọc được, báo một lần, không tự gỡ');
process.exit(sai ? 1 : 0);
