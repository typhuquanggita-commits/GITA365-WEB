/* ═══════════════════════════════════════════════════════════════
   GITA 365 — BỘ NÃO VẬN HÀNH V50 · NHỊP 24/7 · CÓ KHÁCH LÀ CHẠY

   Chủ hệ (07/10/2026): "bật chế độ làm việc full 24/7… có khách là kích
   hoạt chạy full. Bắt đầu nâng cấp lên V50 và chạy hoạt động thử."

   Soát trước khi dựng thì thấy: máy chủ chỉ có hai nhịp theo lịch mỗi
   ngày (03:00 dọn · 07:00 tổng doanh thu). Giữa hai nhịp ấy không ai
   nhìn hệ. Và một lỗ thật: khách kích hoạt xong nhận thư "Tư vấn sẽ liên
   hệ trong 24 giờ", nhưng không dòng mã nào giao nhà ấy cho Tư vấn nào —
   lời hứa đầu tiên với khách không có người giữ.

   Tệp này là phần CHẠY của bộ não, mỗi giờ (CRON_NHIP) và mỗi lần có
   khách mới (kichHoatKhachMoi):
     1. Phân công Tư vấn cho nhà chưa có người phụ trách — người đang giữ
        ít nhà nhất trước — và hẹn chạm ngay hôm nay trong CRM.
     2. Nhà đèn đỏ (quá 14 ngày không ai chạm): đưa lên đầu danh sách gọi
        của người phụ trách (henTiep = hôm nay).
     3. Đếm hẹn CRM quá hạn theo người · công nợ quá hạn · bản nháp kho
        đang chờ duyệt.
     4. Soát báo động an ninh.
     5. Chụp Trung tâm đo lường mỗi ngày một lần (đường xu hướng có điểm).
     6. Ghi một dòng nhịp (nhipBoNao) — bảng điều khiển đọc lại được.

   GIỮ NGUYÊN CỔNG CỦA CHỦ HỆ: bộ não KHÔNG tự nhập nội dung vào kho phục
   vụ khách (tu-hoan-thien: ba chữ ký), KHÔNG tự sửa mã (tu-nang-cap: ký),
   KHÔNG tự cấp quyền. Nó làm việc VẬN HÀNH: giao việc, đưa việc lên đầu,
   đo, báo. Mọi lượt ghi đều đảo ngược được bằng tay trong CRM.

   Chạy thử (that=false): đi đủ sáu bước, chỉ ĐỌC, trả "sẽ làm gì".
   ═══════════════════════════════════════════════════════════════ */
import { Kho } from './nen.js';
import { BAC } from './vai-tro.js';
import { soatBatThuong, tuSoatBaoDong } from './cuu-he.js';
import { docTrungTamDo } from './trung-tam-toi-uu.js';
import { dsQuaHan } from './tai-chinh.js';
import { chayChangDaTri } from './bo-nao-da-tri.js';
import { chayBuocTaiLieu, deAnTuChay } from './xuong-tai-lieu.js';
import { doViecKet, tomTatViecKet } from './viec-ket.js';
import { baoLenCapCao } from './ngan-hang.js';
import { vaBang } from './va-luoc-do.js';

/* LÀM 30 PHÚT · NGHỈ 30 PHÚT (chủ hệ 07/10/2026), lặp liên tục 24/7: sáu
   lượt ở phút 0 · 5 · 10 · 15 · 20 · 25 của mỗi giờ, rồi nghỉ tới hết giờ.
   Lượt đầu ca (phút 0) làm cả việc nặng; năm lượt sau làm việc nhẹ và chạy
   tiếp đội Agent. Một lượt Worker là một lần gọi ngắn — "làm 30 phút" là sáu
   lượt dồn trong nửa giờ, không phải một tiến trình treo 30 phút. */
export const CRON_NHIP = '0,5,10,15,20,25 * * * *';
export const LUOT_MOI_CA = 6;
const HE = Object.freeze({ role: 'R01', u: 'bo-nao-v50', uid: 'bo-nao-v50' });
const NGAY_DO = 14, NGAY_VANG = 7;

function ngayVN(ms) { return new Date((ms || Date.now()) + 7 * 3600e3).toISOString().slice(0, 10); }
function soNgay(tu, den) { const a = Date.parse(String(tu).slice(0, 10)), b = Date.parse(den); return isFinite(a) && isFinite(b) ? Math.floor((b - a) / 864e5) : null; }

async function dungBang(db) {
  await db.prepare('CREATE TABLE IF NOT EXISTS nhipBoNao (id TEXT PRIMARY KEY, luc TEXT NOT NULL, kieu TEXT NOT NULL, that INTEGER NOT NULL, ketQua TEXT NOT NULL)').run();
}

/* ── PHÂN CÔNG TƯ VẤN ──
   Người đang giữ ít nhà nhất trước; chỉ tài khoản R11 còn hoạt động. Câu
   UPDATE có điều kiện "chưa có tư vấn" — hai lượt chạy cùng lúc không giao
   một nhà hai lần, và không bao giờ đè người quản lý đã giao tay. */
export async function phanCongTuVan(db, maKH, that) {
  const hs = await db.prepare('SELECT maKhachHang, tuVan FROM hoSoKhach WHERE maKhachHang = ?').bind(maKH).first();
  if (!hs) return { maKH, ket: 'khongCoHoSo' };
  if (hs.tuVan) return { maKH, ket: 'daCo', tuVan: hs.tuVan };
  const ung = await db.prepare(
    "SELECT u.username, (SELECT COUNT(*) FROM hoSoKhach k WHERE k.tuVan = u.username AND k.trangThai = 'dangHoc') AS tai " +
    "FROM users u WHERE u.role = 'R11' AND u.active = 1 AND u.deletedAt IS NULL AND u.offboardedAt IS NULL " +
    'ORDER BY tai ASC, u.username ASC LIMIT 1').first();
  if (!ung) return { maKH, ket: 'khongCoTuVan' };
  if (!that) return { maKH, ket: 'seGan', tuVan: ung.username, tai: Number(ung.tai) };
  const luc = new Date().toISOString(), hn = ngayVN();
  const r = await db.prepare("UPDATE hoSoKhach SET tuVan = ?, suaLuc = ? WHERE maKhachHang = ? AND (tuVan IS NULL OR tuVan = '')")
    .bind(ung.username, luc, maKH).run();
  if (!(r && r.meta && r.meta.changes)) return { maKH, ket: 'daCo' };
  await db.prepare(
    "INSERT INTO crmKhach (maKH, phuTrach, giaiDoan, henTiep, ghiChu, capNhatLuc, boiAi) VALUES (?, ?, 'moi', ?, ?, ?, ?) " +
    "ON CONFLICT(maKH) DO UPDATE SET phuTrach = COALESCE(NULLIF(crmKhach.phuTrach, ''), excluded.phuTrach), " +
    "henTiep = COALESCE(NULLIF(crmKhach.henTiep, ''), excluded.henTiep)")
    .bind(maKH, ung.username, hn, 'Bộ não V50 giao — liên hệ trong 24 giờ như thư kích hoạt đã hứa.', luc, HE.u).run();
  try { await Kho.ghiNhatKy(db, { uid: HE.uid, username: HE.u, viec: 'BO_NAO_PHAN_CONG', doiTuong: maKH, chiTiet: 'Tư vấn ' + ung.username + ' · hẹn chạm ' + hn }); } catch (e) {}
  return { maKH, ket: 'daGan', tuVan: ung.username };
}

/* ── CÓ KHÁCH LÀ CHẠY ── gọi nền ngay sau khi khách kích hoạt tài khoản. */
export async function kichHoatKhachMoi(env, db, maKH) {
  const t0 = Date.now();
  let pc;
  try { pc = await phanCongTuVan(db, maKH, true); } catch (e) { pc = { maKH, ket: 'loi', loi: String(e && e.message || e).slice(0, 120) }; }
  if (pc.ket === 'khongCoTuVan') {
    try { await Kho.ghiNhatKy(db, { uid: HE.uid, username: HE.u, viec: 'BO_NAO_THIEU_TU_VAN', doiTuong: maKH, chiTiet: 'Không còn tài khoản Tư vấn (R11) hoạt động để giao nhà mới.' }); } catch (e) {}
  }
  await ghiNhip(db, 'khachMoi', true, { maKH, phanCong: pc, ms: Date.now() - t0 });
  return pc;
}

async function ghiNhip(db, kieu, that, ketQua) {
  try {
    await dungBang(db);
    const luc = new Date().toISOString();
    await db.prepare('INSERT INTO nhipBoNao (id, luc, kieu, that, ketQua) VALUES (?, ?, ?, ?, ?)')
      .bind('NB-' + luc.replace(/\D/g, '').slice(0, 17) + '-' + Math.random().toString(36).slice(2, 7), luc, kieu, that ? 1 : 0, JSON.stringify(ketQua).slice(0, 60000)).run();
    await db.prepare('DELETE FROM nhipBoNao WHERE luc < ?').bind(new Date(Date.now() - 30 * 864e5).toISOString()).run();
  } catch (e) {}
}

/* ── NHỊP VẬN HÀNH ── that=false: chạy thử, chỉ đọc. */
export async function nhipVanHanh(env, opt) {
  opt = opt || {};
  const that = opt.that === true, db = env.CSDL, hn = ngayVN(), t0 = Date.now();
  /* Lượt thứ mấy trong ca: đọc từ mốc đã hẹn. Chạy tay luôn coi là đầu ca. */
  const lan = opt.lan != null ? opt.lan : 0, dauCa = lan === 0;
  const kq = { luc: new Date().toISOString(), that, kieu: opt.kieu || 'nhip', lan, buoc: [] };
  async function buoc(ma, ten, f) {
    const b = { ma, ten };
    try { Object.assign(b, await f()); b.tt = b.tt || 'ok'; }
    catch (e) { b.tt = 'loi'; b.loi = String(e && e.message || e).slice(0, 160); }
    kq.buoc.push(b);
  }

  await buoc('PHAN_CONG', 'Phân công Tư vấn cho nhà chưa có người phụ trách', async () => {
    const r = await db.prepare("SELECT maKhachHang FROM hoSoKhach WHERE (tuVan IS NULL OR tuVan = '') AND trangThai = 'dangHoc' ORDER BY vaoLuc LIMIT 100").all();
    const ds = (r.results || []).map(x => x.maKhachHang), ket = { daGan: 0, seGan: 0, thieu: 0 }, chiTiet = [];
    for (const ma of ds) {
      const p = await phanCongTuVan(db, ma, that);
      if (p.ket === 'daGan') ket.daGan++; else if (p.ket === 'seGan') ket.seGan++; else if (p.ket === 'khongCoTuVan') ket.thieu++;
      if (chiTiet.length < 20) chiTiet.push(p);
    }
    return { so: ds.length, ...ket, chiTiet, tt: ket.thieu ? 'canhBao' : 'ok',
      ghiChu: ket.thieu ? 'Không còn tài khoản Tư vấn hoạt động — cần mở thêm tài khoản R11.' : '' };
  });

  await buoc('DEN_CHAM', 'Đèn chăm sóc: nhà quá 14 ngày không ai chạm lên đầu danh sách gọi', async () => {
    const r = await db.prepare(
      "SELECT k.maKhachHang AS ma, k.tuVan, k.coach, k.vaoLuc, (SELECT MAX(c.ngay) FROM soCham c WHERE c.maNha = k.maKhachHang) AS chamCuoi " +
      "FROM hoSoKhach k WHERE k.trangThai = 'dangHoc' LIMIT 5000").all();
    let xanh = 0, vang = 0, doDs = [];
    for (const x of (r.results || [])) {
      const n = soNgay(x.chamCuoi || x.vaoLuc, hn);
      if (n == null || n <= NGAY_VANG) xanh++; else if (n <= NGAY_DO) vang++; else doDs.push({ ma: x.ma, ngay: n, phuTrach: x.tuVan || x.coach || '' });
    }
    let duaLen = 0;
    if (that) for (const x of doDs) {
      const u = await db.prepare("UPDATE crmKhach SET henTiep = ?, capNhatLuc = ?, boiAi = ? WHERE maKH = ? AND (henTiep IS NULL OR henTiep = '' OR henTiep > ?)")
        .bind(hn, new Date().toISOString(), HE.u, x.ma, hn).run();
      if (u && u.meta && u.meta.changes) duaLen++;
    }
    return { xanh, vang, do: doDs.length, duaLen: that ? duaLen : undefined, seDuaLen: that ? undefined : doDs.length,
      nhaDo: doDs.slice(0, 15), tt: doDs.length ? 'canhBao' : 'ok' };
  });

  if (dauCa) await buoc('HEN_CRM', 'Hẹn chạm CRM quá hạn theo người phụ trách', async () => {
    const r = await db.prepare("SELECT COALESCE(NULLIF(phuTrach, ''), '(chưa giao)') AS ai, COUNT(*) AS n FROM crmKhach WHERE henTiep IS NOT NULL AND henTiep <> '' AND henTiep < ? GROUP BY ai ORDER BY n DESC LIMIT 30").bind(hn).all();
    const ds = (r.results || []).map(x => ({ ai: x.ai, n: Number(x.n) }));
    const tong = ds.reduce((a, x) => a + x.n, 0);
    return { tong, theoNguoi: ds, tt: tong ? 'canhBao' : 'ok' };
  });

  if (dauCa) await buoc('CONG_NO', 'Công nợ quá hạn', async () => {
    const q = await dsQuaHan({}, env, db, HE);
    if (!q || !q.ok) return { tt: 'loi', loi: (q && q.error) || 'không đọc được' };
    const chuaNhac = (q.ds || []).filter(x => !x.soLanNhac).length;
    return { so: q.so, tongConNo: q.tongConNo, chuaAiNhac: chuaNhac, tt: q.so ? 'canhBao' : 'ok' };
  });

  if (dauCa) await buoc('KHO_CHO_DUYET', 'Bản nháp kho chờ ba chữ ký', async () => {
    let n = 0;
    try { const r = await db.prepare("SELECT COUNT(*) AS n FROM banNhapKho WHERE trangThai = 'nhap'").first(); n = Number(r && r.n) || 0; }
    catch (e) { if (!/no such table/i.test(String(e && e.message))) throw e; }
    return { so: n, tt: n ? 'canhBao' : 'ok', ghiChu: n ? 'Bộ não chỉ soạn nháp — nhập kho phục vụ khách cần đủ ba chữ ký.' : '' };
  });

  await buoc('BAO_DONG', 'Soát báo động an ninh (60 phút gần nhất)', async () => {
    const bt = await soatBatThuong(db, 60), ngo = (bt && bt.ngo) || [];
    if (that && ngo.length) await tuSoatBaoDong(env, db);
    return { soNgo: ngo.length, ngo: ngo.slice(0, 5), vi: bt && bt.vi, mailCuu: !!String(env.GITA_MAIL_CUU || '').trim(),
      tt: ngo.length ? 'canhBao' : 'ok' };
  });

  await buoc('AGENT', 'Đội Agent: chạy tiếp chặng kế của các tuyến tự chạy', async () => {
    await vaBang(db, 'tuyenDaTri');
    let ds = [];
    try { ds = (await db.prepare("SELECT ma, ten, dangO, cacChang FROM tuyenDaTri WHERE trangThai = 'dangChay' AND tuChay = 1 ORDER BY lucSua ASC LIMIT 3").all()).results || []; }
    catch (e) { if (!/no such (table|column)/i.test(String(e && e.message))) throw e; }
    const tom = ds.map(x => ({ ma: x.ma, ten: x.ten, chang: Number(x.dangO) + 1, soChang: (JSON.parse(x.cacChang || '[]') || []).length }));
    if (!ds.length) return { so: 0 };
    if (String(env.GITA_DA_TRI_BAT || '') !== '1') return { so: ds.length, tuyen: tom, tt: 'canhBao', ghiChu: 'Bộ não đa trí đang tắt — tuyến tự chạy đang chờ.' };
    if (!that) return { so: ds.length, seChay: tom };
    const ket = [];
    for (const x of ds) {
      const r = await chayChangDaTri({ ma: x.ma }, env, db, HE);
      const k = { ma: x.ma, ok: !!(r && r.ok), chang: r && r.ok ? r.chang + 1 : undefined, xong: !!(r && r.xong), ncc: r && r.ncc, loi: r && !r.ok ? (r.code || r.error) : undefined };
      /* Chặng phân tích sâu / chiến lược cần nhà cung cấp bậc ≥ 2. Chế độ tiết
         kiệm chỉ có Workers AI (bậc 1) → tuyến ấy CHỜ, nói rõ vì sao; các tuyến
         khác vẫn chạy. Hết ngân sách ngày thì dừng cả lượt. */
      if (r && r.code === 'KHONG_NCC') k.vi = 'Chặng này cần nhà cung cấp AI bậc cao (DeepSeek/Gemini/OpenAI/Claude/Grok). Nạp khoá và đặt GITA_CHE_DO_TIET_KIEM = "0" để chạy tiếp.';
      ket.push(k);
      if (r && r.code === 'VUOT_HAN') break;
    }
    const loi = ket.filter(k => !k.ok);
    return { so: ds.length, daChay: ket.filter(k => k.ok).length, ket, tt: loi.length ? 'canhBao' : 'ok',
      ghiChu: loi.some(k => k.loi === 'KHONG_NCC') ? 'Có tuyến chờ nhà cung cấp AI bậc cao.' : '' };
  });

  /* Xưởng tài liệu gia đình: đề án bật "tự chạy" đi tiếp MỘT bước mỗi lượt
     (một lượt AI). Đóng gói chỉ ra bản nháp — vào kho phục vụ khách vẫn cần
     ba chữ ký. Chạy thử thì chỉ báo đề án nào sẽ chạy, không gọi AI. */
  await buoc('XUONG_TAI_LIEU', 'Xưởng tài liệu: đi tiếp một bước các đề án tự chạy', async () => {
    const ds = await deAnTuChay(db, 2);
    const tom = ds.map(x => ({ id: x.id, chuDe: x.chuDe, trangThai: x.trangThai, chuong: Number(x.dangChuong) + '/' + x.soChuong }));
    if (!ds.length) return { so: 0 };
    if (String(env.GITA_DA_TRI_BAT || '') !== '1') return { so: ds.length, deAn: tom, tt: 'canhBao', ghiChu: 'Bộ não đa trí đang tắt — đề án tự chạy đang chờ.' };
    if (!that) return { so: ds.length, seChay: tom };
    const ket = [];
    for (const x of ds) {
      const r = await chayBuocTaiLieu({ id: x.id }, env, db, HE);
      ket.push({ id: x.id, ok: !!(r && r.ok), buoc: r && r.buoc, trangThai: r && r.trangThai, loi: r && !r.ok ? (r.code || r.error) : undefined });
      if (r && (r.code === 'KHONG_NCC' || r.code === 'CUADONG')) break;
    }
    return { so: ds.length, daChay: ket.filter(k => k.ok).length, ket, tt: ket.some(k => !k.ok) ? 'canhBao' : 'ok' };
  });

  /* Mạch việc kẹt (tinh tuý OpenRig): đọc mọi hàng đợi, đếm việc nằm im
     không ai cầm hoặc quá hạn. Chỉ ĐỌC; lượt đầu ca của mỗi ngày mới ghi
     đúng MỘT dòng vào hộp thông báo của Giám đốc và Super Admin — báo, không
     tự gỡ thay ai. Chạy thử thì không ghi gì. */
  if (dauCa) await buoc('VIEC_KET', 'Việc kẹt: soát mọi hàng đợi, báo việc nằm im không ai cầm', async () => {
    const vk = await doViecKet(db);
    const ds = vk.hang.filter(h => h.so.ket > 0).map(h => ({ ma: h.ma, ten: h.ten, ket: h.so.ket }));
    const kb = vk.hang.filter(h => h.trangThai === 'khongBiet').map(h => h.ma);
    const kq2 = { ket: vk.tong.ket, cho: vk.tong.cho, hang: ds, khongBiet: kb.length ? kb : undefined,
      tt: vk.tong.ket || kb.length ? 'canhBao' : 'ok' };
    const than = tomTatViecKet(vk);
    if (!than) return kq2;
    if (!that) return Object.assign(kq2, { seBao: true });
    const lan2 = await Kho.demNhip(db, 'viecKet·' + hn, 86400);
    if (lan2 === 1) {
      await baoLenCapCao(db, { loai: 'viecKet', mucDo: 'canXem',
        tieuDe: vk.tong.ket + ' việc đang kẹt trong các hàng đợi', than, doiTuong: 'viec-ket' });
      kq2.daBao = true;
    } else kq2.daBaoHomNay = true;
    return kq2;
  });

  if (dauCa) await buoc('CHUP_DO', 'Chụp Trung tâm đo lường (mỗi ngày một lần)', async () => {
    const homNayUTC = new Date().toISOString().slice(0, 10);
    let m = null;
    try { const r = await db.prepare('SELECT MAX(ngay) AS m FROM chupTrungTam').first(); m = r && r.m; } catch (e) {}
    if (m === homNayUTC) return { daCo: true };
    if (!that) return { seChup: true };
    const r = await docTrungTamDo({ ngay: 30 }, env, db, HE);
    return { daChup: !!(r && r.ok), diemTong: r && r.tong };
  });

  kq.ms = Date.now() - t0;
  kq.tom = {
    canhBao: kq.buoc.filter(b => b.tt === 'canhBao').length,
    loi: kq.buoc.filter(b => b.tt === 'loi').length
  };
  if (that) await ghiNhip(db, kq.kieu, true, kq);
  return kq;
}

/* ── TRẠNG THÁI CÁC PHÂN HỆ ── chỉ báo CÓ / KHÔNG cho khoá, không bao giờ trả giá trị khoá. */
function phanHe(env) {
  const co = k => !!String((env && env[k]) || '').trim();
  const daTri = co('GITA_DA_TRI_BAT') && String(env.GITA_DA_TRI_BAT) === '1';
  const tietKiem = String((env && env.GITA_CHE_DO_TIET_KIEM) || '') === '1';
  const ncc = ['DEEPSEEK', 'GEMINI', 'OPENAI', 'ANTHROPIC', 'XAI'].filter(n => co('GITA_KHOA_' + n));
  return [
    { ma: 'NHIP', ten: 'Nhịp làm 30 phút · nghỉ 30 phút', bat: String((env && env.GITA_BO_NAO_NGHI) || '') !== '1', cheDo: String((env && env.GITA_BO_NAO_NGHI) || '') === '1' ? 'Đang tạm nghỉ (GITA_BO_NAO_NGHI = 1)' : 'Lặp liên tục 24/7 · 6 lượt mỗi giờ (phút 0–25), nghỉ phút 30–59', moTa: 'Đầu ca: phân công · đèn chăm sóc · hẹn CRM · công nợ · kho chờ duyệt · báo động · Agent · chụp đo lường. Năm lượt sau: phân công · đèn · báo động · Agent.' },
    { ma: 'KHACH_MOI', ten: 'Có khách là chạy', bat: true, cheDo: 'Tự động, ngay lúc khách kích hoạt tài khoản', moTa: 'Giao Tư vấn ít việc nhất, hẹn chạm hôm nay trong CRM.' },
    { ma: 'DEM', ten: 'Ca đêm 03:00', bat: true, cheDo: 'Tự động mỗi ngày', moTa: 'Vá lược đồ · dọn dẹp · soát sao lưu · tự soát và chữa · vòng khoa học của bộ não đa trí.' },
    { ma: 'SANG', ten: 'Bản tổng doanh thu 07:00', bat: co('GITA_THU_DOANH_THU'), cheDo: 'Tự động mỗi ngày', moTa: 'Gửi thư tổng ngày hôm qua.' },
    { ma: 'BAO_DONG', ten: 'Báo động an ninh', bat: co('GITA_MAIL_CUU'), cheDo: co('GITA_MAIL_CUU') ? 'Tự động sau mỗi thao tác nhạy cảm + mỗi giờ' : 'Đo được nhưng CHƯA GỬI được thư', moTa: co('GITA_MAIL_CUU') ? '' : 'Chưa nạp GITA_MAIL_CUU (email cứu hệ) trên Cloudflare.' },
    { ma: 'DA_TRI', ten: 'Bộ não đa trí (AI)', bat: daTri, cheDo: !daTri ? 'Tắt' : tietKiem ? 'Tiết kiệm: đệm + Workers AI miễn phí' : 'Đầy đủ theo ngân sách ngày', moTa: 'Nhà cung cấp có khoá: ' + (ncc.length ? ncc.join(', ') : 'chưa có') + ' · Workers AI: ' + (env && env.AI ? 'có' : 'không') + '.' },
    { ma: 'TU_HOAN_THIEN', ten: 'Tự hoàn thiện kho', bat: true, cheDo: 'Soạn nháp tự động · nhập kho cần 3 chữ ký', moTa: 'Không tự đưa nội dung chưa duyệt tới khách.' },
    { ma: 'TU_NANG_CAP', ten: 'Vòng tự nâng cấp', bat: true, cheDo: 'Đề xuất · cần ký · bảy vùng cấm ngoài đường', moTa: 'Không tự sửa mã, không tự cấp quyền.' },
    { ma: 'THANH_TRA', ten: 'Hệ thanh tra', bat: true, cheDo: 'Ghi sổ · Super Admin xử lý', moTa: '' },
    { ma: 'AGENT', ten: 'Đội Agent tự chạy', bat: daTri, cheDo: daTri ? 'Mỗi lượt làm việc chạy tiếp chặng kế (tối đa 3 tuyến) · trong ngân sách ngày' : 'Chờ bộ não đa trí bật', moTa: 'Super Admin tạo tuyến ở Bộ não đa trí và bật "Tự chạy". Kết quả chỉ Super Admin đọc — không tự gửi ra khách.' },
    { ma: 'VIEC_KET', ten: 'Mạch việc kẹt', bat: true, cheDo: 'Lượt đầu ca: soát mọi hàng đợi · báo hộp thông báo một lần mỗi ngày', moTa: 'Chỉ đọc. Phân biệt việc kẹt (không ai cầm, quá hạn, nằm im quá ngưỡng) với việc chờ có chủ. Không tự duyệt, không tự giao thay ai.' },
    { ma: 'XUONG_TAI_LIEU', ten: 'Xưởng tài liệu gia đình', bat: daTri, cheDo: daTri ? 'Mỗi lượt đi tiếp một bước (tối đa 2 đề án) · trần lượt AI mỗi đề án' : 'Chờ bộ não đa trí bật', moTa: 'Đề án đặt ở Vòng tự hoàn thiện → Xưởng tài liệu. Xong thì thành bản nháp chờ ba chữ ký — không tự gửi tới gia đình.' }
  ];
}

/* ═══════════ CỬA ═══════════ */
export async function docBoNao(y, env, db, hoSo) {
  if ((BAC[(hoSo || {}).role] || 99) > 3) return { ok: false, code: 'NOPERM', error: 'Bộ não vận hành mở cho R01–R03.' };
  await dungBang(db);
  const r = await db.prepare('SELECT luc, kieu, that, ketQua FROM nhipBoNao ORDER BY luc DESC LIMIT 48').all();
  const lan = (r.results || []).map(x => { let k = {}; try { k = JSON.parse(x.ketQua); } catch (e) {} return { luc: x.luc, kieu: x.kieu, that: !!x.that, lan: k.lan, tom: k.tom || null, ms: k.ms, buoc: k.buoc ? k.buoc.map(b => ({ ma: b.ma, tt: b.tt })) : undefined, maKH: k.maKH, phanCong: k.phanCong }; });
  const nhipCuoi = lan.find(x => x.kieu === 'nhip');
  return { ok: true, phanHe: phanHe(env), lanChay: lan, nhipCuoi: nhipCuoi ? nhipCuoi.luc : null };
}

export async function chayThuBoNao(y, env, db, hoSo) {
  if ((hoSo || {}).role !== 'R01') return { ok: false, code: 'NOPERM', error: 'Chạy bộ não bằng tay dành cho Super Admin.' };
  const that = !!(y && y.that === true);
  const kq = await nhipVanHanh(Object.assign({}, env, { CSDL: db }), { that, kieu: that ? 'tay' : 'thu' });
  try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: that ? 'BO_NAO_CHAY_TAY' : 'BO_NAO_CHAY_THU', doiTuong: 'bộ não V50', chiTiet: kq.buoc.map(b => b.ma + ':' + b.tt).join(' · ') }); } catch (e) {}
  return { ok: true, ...kq, phanHe: phanHe(env) };
}
