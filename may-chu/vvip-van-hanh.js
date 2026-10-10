/* ═══════════════════════════════════════════════════════════════
   GITA 365 — VẬN HÀNH VIP/VVIP · ba bộ máy còn thiếu (QD3, 10/2026)

   Master Blueprint đã có hồ sơ, nhóm, điểm chạm, chiến dịch, bảng 80%.
   QD3 nêu ba chỗ còn trống, và chính ba chỗ ấy làm ba chỉ số của bảng
   80% đứng ở null:
     M1  hoàn thành khởi động đúng hạn  → bộ máy KHỞI ĐỘNG (6 mốc)
     M3  yêu cầu được phân công đúng hạn → BÀN HỖ TRỢ (hạn theo nhóm × mức)
     K04 lợi nhuận đóng góp              → SỔ CHI PHÍ PHỤC VỤ theo nhà

   ══ CHUẨN LẤY TỪ ĐÂU ══
   Mốc giờ lấy từ Blueprint (gọi chào 24 giờ · một chiến thắng nhỏ trong
   24 giờ đầu · đủ hồ sơ và một lượt chạm của người hạng chuẩn trong 7
   ngày) và từ sổ tri thức Cây Tiền (lên kế hoạch chăm sóc trước khi phục
   vụ; đường dây trả lời trong 24 giờ là mức sàn cho khách thường, nên khách
   trọng điểm phải nhanh hơn mức sàn ấy). Phần còn lại là chuẩn THỬ NGHIỆM —
   sửa ở hằng số dưới đây, mỗi lần sửa là một lượt phát hành có người đọc.

   ══ AI ĐO ══
   Mỗi mốc khai đúng một đường: `may` (máy đọc thẳng từ sổ chạm, sổ hồ sơ,
   sổ phân công — không ai bấm "xong" được) hoặc `nguoi` (người ghi kèm căn
   cứ, có tên và giờ). Một mốc máy đo được mà để người tự đánh dấu là biến
   một phép đo thành lời khai.

   ══ BA CHỖ CỐ Ý KHÔNG LÀM THAY ══
   1. Chưa ghi chi phí thì lợi nhuận đóng góp TRẢ NULL, không coi là 0 —
      coi là 0 thì nhà nào chưa ai ghi chi phí trông lãi nhất.
   2. Khiếu nại đóng phải do NGƯỜI KHÁC người xử lý — tự xử tự đóng thì sổ
      khiếu nại thành sổ tự khen.
   3. Hạn tính LÚC ĐỌC từ giờ tiếp nhận; bảng không có cột "quá hạn" để ai
      đó quên cập nhật.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

import { Kho } from './nen.js';
import { BAC, roleOf, laNguoiNha } from './vai-tro.js';
import { nhaPhuTrach, LOI_NGOAI_NHA } from './pham-vi-nha.js';

const GIO = 3600000, NGAY = 24 * GIO;
const lvCua = h => BAC[roleOf(h)] || 99;
const bayGio = () => new Date().toISOString();
const maMoi = tien => tien + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const chuoi = (x, n) => String(x == null ? '' : x).trim().slice(0, n || 2000);
const tyLe = (tu, mau) => (mau > 0 ? Math.round(1000 * tu / mau) / 10 : null);

/* ─────────────── 1 · KHỞI ĐỘNG — sáu mốc ─────────────── */
export const MOC_KHOI_DONG = Object.freeze([
  { ma: 'OB1', ten: 'Gọi chào của người phục vụ', hanGio: 24, nguon: 'may', do: 'Sổ chạm có một lượt kiểu "goi" trong 24 giờ đầu', theo: 'Blueprint DC-M05' },
  { ma: 'OB2', ten: 'Một chiến thắng nhỏ trong 24 giờ đầu', hanGio: 24, nguon: 'nguoi', do: 'Người phục vụ ghi việc nhỏ gia đình đã làm được, kèm căn cứ', theo: 'Blueprint DC-M06' },
  { ma: 'OB3', ten: 'Hồ sơ nhập tay đủ (tài liệu 01–04, 06)', hanGio: 7 * 24, nguon: 'may', do: 'Sổ hồ sơ có ít nhất một phiên bản của mỗi tài liệu trong 7 ngày', theo: 'Blueprint CS01' },
  { ma: 'OB4', ten: 'Một lượt chạm của người phục vụ đúng hạng chuẩn', hanGio: 7 * 24, nguon: 'may', do: 'Sổ chạm có lượt chạm do coach đã phân công (VVIP hạng A · VIP hạng A/B) trong 7 ngày', theo: 'Blueprint CS01 · chuẩn người phục vụ' },
  { ma: 'OB5', ten: 'Kế hoạch chăm sóc năm đã thống nhất', hanGio: 10 * 24, nguon: 'nguoi', do: 'Người phục vụ ghi lịch chạm và mục tiêu đã thống nhất với gia đình, kèm căn cứ', theo: 'Cây Tiền — lên kế hoạch chăm sóc trước khi phục vụ' },
  { ma: 'OB6', ten: 'Buổi rà soát 30 ngày cùng gia đình', hanGio: 30 * 24, sauGio: 21 * 24, nguon: 'nguoi', do: 'Ghi biên bản buổi rà soát từ ngày 21 tới ngày 30', theo: 'Blueprint G3 → G4' }
]);
const CHUAN_HANG = Object.freeze({ VVIP: ['A'], VIP: ['A', 'B'] });
const TL_NHAP = Object.freeze(['01', '02', '03', '04', '06']);

/* Nhóm hiện tại và lúc vào nhóm trọng điểm: lượt duyệt VIP/VVIP SỚM NHẤT
   kể từ lần gần nhất bị rút về CORE. Lên từ VIP sang VVIP không khởi động lại. */
export async function nhomVaLucVao(db) {
  const r = (await db.prepare("SELECT maNha, nhom, duyetLuc FROM hangVvip WHERE trangThai = 'daDuyet' ORDER BY duyetLuc ASC, rowid ASC").all()).results || [];
  const m = {};
  for (const x of r) {
    if (x.nhom === 'CORE') { delete m[x.maNha]; continue; }
    if (!m[x.maNha]) m[x.maNha] = { nhom: x.nhom, tuLuc: x.duyetLuc };
    else m[x.maNha].nhom = x.nhom;
  }
  return m;
}

async function trangThaiMoc(db, maNha, nhom, tuLuc, nay) {
  const t0 = Date.parse(tuLuc), iso = t => new Date(t).toISOString();
  const ghi = (await db.prepare('SELECT ma, xongLuc, boiAi, canCu FROM mocKhoiDong WHERE maNha = ? AND tuLuc = ?').bind(maNha, tuLuc).all()).results || [];
  const daGhi = Object.fromEntries(ghi.map(g => [g.ma, g]));
  const ds = [];
  for (const m of MOC_KHOI_DONG) {
    const han = t0 + m.hanGio * GIO;
    let xongLuc = null, boiAi, canCu;
    if (m.nguon === 'nguoi') { if (daGhi[m.ma]) ({ xongLuc, boiAi, canCu } = daGhi[m.ma]); }
    else if (m.ma === 'OB1') {
      const r = await db.prepare("SELECT ghiLuc, boiAi FROM soCham WHERE maNha = ? AND kieu = 'goi' AND ghiLuc >= ? ORDER BY ghiLuc ASC LIMIT 1").bind(maNha, tuLuc).first();
      if (r) { xongLuc = r.ghiLuc; boiAi = r.boiAi; }
    } else if (m.ma === 'OB3') {
      const r = (await db.prepare('SELECT taiLieu, MIN(luc) dau FROM hoSoVvip WHERE maNha = ? AND luc >= ? GROUP BY taiLieu').bind(maNha, tuLuc).all()).results || [];
      const dau = Object.fromEntries(r.map(x => [x.taiLieu, x.dau]));
      if (TL_NHAP.every(t => dau[t])) xongLuc = TL_NHAP.map(t => dau[t]).sort().pop();
    } else if (m.ma === 'OB4') {
      const pc = (await db.prepare("SELECT nguoi, hangNguoi, luc FROM phanCongVvip WHERE maNha = ? AND vaiTro = 'coach' ORDER BY luc ASC").bind(maNha).all()).results || [];
      const dung = pc.filter(p => (CHUAN_HANG[nhom] || []).includes(p.hangNguoi)).map(p => p.nguoi);
      if (dung.length) {
        const r = await db.prepare('SELECT ghiLuc, boiAi FROM soCham WHERE maNha = ? AND ghiLuc >= ? AND boiAi IN (' + dung.map(() => '?').join(',') + ') ORDER BY ghiLuc ASC LIMIT 1')
          .bind(maNha, tuLuc, ...dung).first();
        if (r) { xongLuc = r.ghiLuc; boiAi = r.boiAi; }
      }
    }
    const tt = xongLuc ? (Date.parse(xongLuc) <= han ? 'dungHan' : 'tre') : (nay > han ? 'quaHan' : 'dangCho');
    ds.push({ ma: m.ma, ten: m.ten, nguon: m.nguon, han: iso(han), xongLuc: xongLuc || undefined, boiAi, canCu, trangThai: tt });
  }
  return ds;
}

/* CỬA · ghi mốc do NGƯỜI ghi (OB2, OB5, OB6). Mốc máy đo không ghi tay được. */
export async function ghiMocKhoiDong(y, env, db, hoSo) {
  const x = y || {}, maNha = chuoi(x.maNha, 40), ma = chuoi(x.ma, 4), canCu = chuoi(x.canCu, 1000);
  if (!laNguoiNha(hoSo) || !(await nhaPhuTrach(db, hoSo, maNha))) return LOI_NGOAI_NHA;
  const moc = MOC_KHOI_DONG.find(m => m.ma === ma);
  if (!moc) return { ok: false, code: 'SAI', error: 'Mốc phải là OB1–OB6.' };
  if (moc.nguon === 'may') return { ok: false, code: 'MAYDO', error: 'Mốc ' + ma + ' do máy đọc từ sổ (' + moc.do + ') — không đánh dấu tay, để phép đo không thành lời khai.' };
  if (canCu.length < 20) return { ok: false, code: 'THIEUCANCU', error: 'Ghi căn cứ cụ thể (≥ 20 ký tự): việc gì, với ai, kết quả.' };
  const vao = (await nhomVaLucVao(db))[maNha];
  if (!vao) return { ok: false, code: 'NGOAINHOM', error: 'Nhà này chưa ở nhóm VIP/VVIP — không có khởi động để ghi.' };
  const nay = Date.now();
  if (moc.sauGio && nay < Date.parse(vao.tuLuc) + moc.sauGio * GIO) return { ok: false, code: 'SOM', error: 'Buổi rà soát 30 ngày ghi từ ngày ' + (moc.sauGio / 24) + ' — sớm hơn thì chưa có gì để rà.' };
  const co = await db.prepare('SELECT 1 c FROM mocKhoiDong WHERE maNha = ? AND tuLuc = ? AND ma = ?').bind(maNha, vao.tuLuc, ma).first();
  if (co) return { ok: false, code: 'DAGHI', error: 'Mốc này đã ghi.' };
  await db.prepare('INSERT INTO mocKhoiDong (id, maNha, tuLuc, ma, xongLuc, boiAi, canCu) VALUES (?,?,?,?,?,?,?)')
    .bind(maMoi('OB'), maNha, vao.tuLuc, ma, bayGio(), hoSo.u, canCu).run();
  try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'VVIP_MOC', doiTuong: maNha, chiTiet: ma }); } catch (e) {}
  return { ok: true };
}

/* CỬA · đọc khởi động. Quản lý R01–R05 thấy mọi nhà; người phục vụ thấy nhà mình. */
export async function docKhoiDong(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM', error: 'Khởi động VIP/VVIP dành cho nhân sự.' };
  const nay = Date.now(), vao = await nhomVaLucVao(db), ds = [];
  for (const maNha of Object.keys(vao)) {
    if (lvCua(hoSo) > 5 && !(await nhaPhuTrach(db, hoSo, maNha))) continue;
    const { nhom, tuLuc } = vao[maNha];
    const moc = await trangThaiMoc(db, maNha, nhom, tuLuc, nay);
    const ngay = Math.floor((nay - Date.parse(tuLuc)) / NGAY);
    ds.push({ maNha, nhom, tuLuc, ngay, moc, quaHan: moc.filter(m => m.trangThai === 'quaHan').length,
      daHetHan: ngay >= 30, dungHanHet: moc.every(m => m.trangThai === 'dungHan') });
  }
  ds.sort((a, b) => b.quaHan - a.quaHan || a.ngay - b.ngay);
  return { ok: true, ds, mocChuan: MOC_KHOI_DONG, ...chiSoKhoiDong(ds) };
}
/* M1: trong các nhà đã qua hết hạn mốc cuối (ngày ≥ 30), tỷ lệ nhà xong CẢ SÁU mốc đúng hạn. */
export function chiSoKhoiDong(ds) {
  const xet = ds.filter(d => d.daHetHan);
  return { m1: xet.length ? tyLe(xet.filter(d => d.dungHanHet).length, xet.length) : null, m1Mau: xet.length,
    m1Vi: xet.length ? undefined : 'Chưa nhà nào qua đủ 30 ngày khởi động — chưa đo được.' };
}

/* ─────────────── 2 · BÀN HỖ TRỢ — hạn theo nhóm × mức ─────────────── */
export const MUC_YEU_CAU = Object.freeze(['thuong', 'gap', 'khieuNai']);
export const KENH_YEU_CAU = Object.freeze(['dienThoai', 'tinNhan', 'email', 'gapMat', 'ungDung']);
/* giờ — thử nghiệm. Mức sàn của sách (trả lời trong 24 giờ) dành cho khách
   thường; khách trọng điểm phải nhanh hơn mức sàn ấy. */
export const HAN_HO_TRO = Object.freeze({
  VVIP: { phanCong: { thuong: 1, gap: 0.5, khieuNai: 0.5 }, phanHoi: { thuong: 4, gap: 1, khieuNai: 2 }, dong: { thuong: 72, gap: 24, khieuNai: 120 } },
  VIP: { phanCong: { thuong: 2, gap: 0.5, khieuNai: 0.5 }, phanHoi: { thuong: 8, gap: 2, khieuNai: 2 }, dong: { thuong: 96, gap: 48, khieuNai: 120 } }
});

function hanCua(r) {
  const H = HAN_HO_TRO[r.nhom] || HAN_HO_TRO.VIP, t0 = Date.parse(r.tiepNhanLuc), iso = t => new Date(t).toISOString();
  return { phanCong: iso(t0 + H.phanCong[r.mucDo] * GIO), phanHoi: iso(t0 + H.phanHoi[r.mucDo] * GIO), dong: iso(t0 + H.dong[r.mucDo] * GIO) };
}
function danhGia(r, nay) {
  const h = hanCua(r), qua = (moc, han) => moc ? Date.parse(moc) > Date.parse(han) : nay > Date.parse(han);
  return { han: h, quaHanPhanCong: qua(r.phanCongLuc, h.phanCong), quaHanPhanHoi: qua(r.phanHoiLuc, h.phanHoi), quaHanDong: qua(r.dongLuc, h.dong) };
}

/* CỬA · mở yêu cầu. Nhân sự phụ trách mở hộ gia đình, hoặc phụ huynh tự mở cho NHÀ MÌNH. */
export async function moYeuCauVvip(y, env, db, hoSo) {
  const x = y || {};
  let maNha = chuoi(x.maNha, 40);
  if (roleOf(hoSo) === 'R13') { maNha = String(hoSo.maKhachHang || ''); if (!maNha) return { ok: false, code: 'NOPERM', error: 'Tài khoản chưa gắn nhà.' }; }
  else if (!laNguoiNha(hoSo) || !(await nhaPhuTrach(db, hoSo, maNha))) return LOI_NGOAI_NHA;
  const mucDo = MUC_YEU_CAU.includes(x.mucDo) ? x.mucDo : 'thuong', kenh = KENH_YEU_CAU.includes(x.kenh) ? x.kenh : 'ungDung';
  const noiDung = chuoi(x.noiDung, 2000);
  if (noiDung.length < 10) return { ok: false, code: 'THIEU', error: 'Nội dung yêu cầu ít nhất 10 ký tự.' };
  const vao = (await nhomVaLucVao(db))[maNha];
  if (!vao) return { ok: false, code: 'NGOAINHOM', error: 'Bàn hỗ trợ có hạn này dành cho nhà VIP/VVIP; nhà khác dùng kênh chăm sóc chung.' };
  const id = maMoi('YC');
  await db.prepare('INSERT INTO yeuCauVvip (id, maNha, nhom, kenh, mucDo, noiDung, tiepNhanLuc, moBoi, trangThai) VALUES (?,?,?,?,?,?,?,?,?)')
    .bind(id, maNha, vao.nhom, kenh, mucDo, noiDung, bayGio(), hoSo.u, 'moi').run();
  try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'VVIP_YC_MO', doiTuong: maNha, chiTiet: id + ' · ' + mucDo }); } catch (e) {}
  return { ok: true, id, han: hanCua({ nhom: vao.nhom, mucDo, tiepNhanLuc: bayGio() }) };
}

async function layYC(db, id) { return db.prepare('SELECT * FROM yeuCauVvip WHERE id = ?').bind(chuoi(id, 60)).first(); }

/* CỬA · phân công — quản lý R01–R05. */
export async function phanCongYeuCau(y, env, db, hoSo) {
  if (lvCua(hoSo) > 5) return { ok: false, code: 'NOPERM', error: 'Phân công yêu cầu do quản lý R01–R05.' };
  const x = y || {}, r = await layYC(db, x.id), nguoi = chuoi(x.nguoi, 80);
  if (!r) return { ok: false, code: 'KHONGCO', error: 'Không có yêu cầu này.' };
  if (r.trangThai === 'daDong') return { ok: false, code: 'DADONG', error: 'Yêu cầu đã đóng.' };
  const u = await db.prepare('SELECT username, role FROM users WHERE (username = ? OR email = ?) AND active = 1').bind(nguoi, nguoi).first();
  if (!u || !(BAC[u.role] <= 12)) return { ok: false, code: 'SAINGUOI', error: 'Người nhận phải là nhân sự đang hoạt động.' };
  /* Lưu TÊN ĐĂNG NHẬP, không lưu chuỗi người giao gõ: giao bằng email mà lưu
     email thì phép so "người xử lý ≠ người đóng" so email với tên đăng nhập
     của phiên — luôn khác — và người xử lý tự đóng được khiếu nại của mình
     (cùng lớp lỗi định danh hai hình đã vá ở 9.99.112). */
  await db.prepare("UPDATE yeuCauVvip SET nguoiXuLy = ?, phanCongLuc = COALESCE(phanCongLuc, ?), trangThai = CASE WHEN trangThai = 'moi' THEN 'daPhanCong' ELSE trangThai END WHERE id = ?")
    .bind(u.username, bayGio(), r.id).run();
  try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'VVIP_YC_GIAO', doiTuong: r.id, chiTiet: u.username }); } catch (e) {}
  return { ok: true };
}

/* CỬA · phản hồi đầu — người được giao hoặc quản lý. */
export async function phanHoiYeuCau(y, env, db, hoSo) {
  const x = y || {}, r = await layYC(db, x.id), noiDung = chuoi(x.noiDung, 2000);
  if (!r) return { ok: false, code: 'KHONGCO', error: 'Không có yêu cầu này.' };
  if (!(lvCua(hoSo) <= 5 || r.nguoiXuLy === hoSo.u)) return { ok: false, code: 'NOPERM', error: 'Chỉ người được giao hoặc quản lý R01–R05 phản hồi.' };
  if (noiDung.length < 10) return { ok: false, code: 'THIEU', error: 'Nội dung phản hồi ít nhất 10 ký tự.' };
  if (r.trangThai === 'daDong') return { ok: false, code: 'DADONG', error: 'Yêu cầu đã đóng.' };
  await db.prepare("UPDATE yeuCauVvip SET phanHoiLuc = COALESCE(phanHoiLuc, ?), phanHoi = ?, trangThai = 'daPhanHoi' WHERE id = ?").bind(bayGio(), noiDung, r.id).run();
  try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'VVIP_YC_PHANHOI', doiTuong: r.id }); } catch (e) {}
  return { ok: true };
}

/* CỬA · đóng. Khiếu nại phải do NGƯỜI KHÁC người xử lý đóng, và là quản lý. */
export async function dongYeuCau(y, env, db, hoSo) {
  const x = y || {}, r = await layYC(db, x.id), ketQua = chuoi(x.ketQua, 1000);
  if (!r) return { ok: false, code: 'KHONGCO', error: 'Không có yêu cầu này.' };
  if (r.trangThai === 'daDong') return { ok: false, code: 'DADONG', error: 'Yêu cầu đã đóng.' };
  if (!r.phanHoiLuc) return { ok: false, code: 'CHUAPHANHOI', error: 'Chưa có phản hồi nào cho gia đình — chưa đóng được.' };
  if (ketQua.length < 15) return { ok: false, code: 'THIEU', error: 'Ghi kết quả (≥ 15 ký tự): đã giải quyết gì, gia đình xác nhận thế nào.' };
  if (r.mucDo === 'khieuNai') {
    if (lvCua(hoSo) > 5) return { ok: false, code: 'NOPERM', error: 'Khiếu nại do quản lý R01–R05 đóng.' };
    if (hoSo.u === r.nguoiXuLy) return { ok: false, code: 'TUDONG', error: 'Người xử lý khiếu nại không tự đóng khiếu nại của mình — một quản lý khác đóng.' };
  } else if (!(lvCua(hoSo) <= 5 || r.nguoiXuLy === hoSo.u)) return { ok: false, code: 'NOPERM', error: 'Chỉ người được giao hoặc quản lý R01–R05 đóng.' };
  await db.prepare("UPDATE yeuCauVvip SET dongLuc = ?, dongBoi = ?, ketQua = ?, trangThai = 'daDong' WHERE id = ?").bind(bayGio(), hoSo.u, ketQua, r.id).run();
  try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'VVIP_YC_DONG', doiTuong: r.id, chiTiet: r.mucDo }); } catch (e) {}
  return { ok: true };
}

/* CỬA · danh sách — quản lý thấy hết; người được giao thấy việc của mình; phụ huynh thấy yêu cầu nhà mình. */
export async function dsYeuCauVvip(y, env, db, hoSo) {
  const nay = Date.now(), tu = new Date(nay - 90 * NGAY).toISOString();
  let rows;
  if (roleOf(hoSo) === 'R13') rows = (await db.prepare('SELECT * FROM yeuCauVvip WHERE maNha = ? ORDER BY tiepNhanLuc DESC LIMIT 100').bind(String(hoSo.maKhachHang || '')).all()).results || [];
  else if (lvCua(hoSo) <= 5) rows = (await db.prepare('SELECT * FROM yeuCauVvip WHERE tiepNhanLuc >= ? OR trangThai <> ? ORDER BY tiepNhanLuc DESC LIMIT 500').bind(tu, 'daDong').all()).results || [];
  else if (laNguoiNha(hoSo)) rows = (await db.prepare('SELECT * FROM yeuCauVvip WHERE nguoiXuLy = ? OR moBoi = ? ORDER BY tiepNhanLuc DESC LIMIT 200').bind(hoSo.u, hoSo.u).all()).results || [];
  else return { ok: false, code: 'NOPERM', error: 'Không có quyền xem bàn hỗ trợ.' };
  const ds = rows.map(r => ({ ...r, ...danhGia(r, nay) }));
  return { ok: true, ds, han: HAN_HO_TRO, ...chiSoHoTro(ds, nay) };
}
/* M3: yêu cầu trong 90 ngày mà hạn phân công đã tới — tỷ lệ phân công đúng hạn.
   Xử lý vấn đề (phần còn thiếu của K06): đã đóng đúng hạn ÷ yêu cầu đã tới hạn đóng. */
export function chiSoHoTro(ds, nay) {
  const tu = nay - 90 * NGAY;
  const trong = ds.filter(r => Date.parse(r.tiepNhanLuc) >= tu);
  const toiHanPC = trong.filter(r => r.phanCongLuc || nay > Date.parse(r.han.phanCong));
  const toiHanDong = trong.filter(r => r.dongLuc || nay > Date.parse(r.han.dong));
  return {
    m3: toiHanPC.length ? tyLe(toiHanPC.filter(r => !r.quaHanPhanCong).length, toiHanPC.length) : null, m3Mau: toiHanPC.length,
    xuLy: toiHanDong.length ? tyLe(toiHanDong.filter(r => r.dongLuc && !r.quaHanDong).length, toiHanDong.length) : null, xuLyMau: toiHanDong.length,
    dangMo: ds.filter(r => r.trangThai !== 'daDong').length, quaHan: ds.filter(r => r.trangThai !== 'daDong' && (r.quaHanPhanCong || r.quaHanPhanHoi || r.quaHanDong)).length
  };
}

/* ─────────────── 3 · CHI PHÍ PHỤC VỤ THEO NHÀ ─────────────── */
export const LOAI_CHI_PHI = Object.freeze({ gioNguoi: 'Giờ người phục vụ', taiLieu: 'Tài liệu · công cụ', suKien: 'Sự kiện · buổi gặp', tangPham: 'Tặng phẩm', khac: 'Khác' });
export const TRAN_MOT_KHOAN = 50000000;

export async function ghiChiPhiPhucVu(y, env, db, hoSo) {
  const x = y || {}, maNha = chuoi(x.maNha, 40), loai = chuoi(x.loai, 20), ghiChu = chuoi(x.ghiChu, 500);
  if (!laNguoiNha(hoSo) || !(await nhaPhuTrach(db, hoSo, maNha))) return LOI_NGOAI_NHA;
  if (!LOAI_CHI_PHI[loai]) return { ok: false, code: 'SAI', error: 'Loại chi phí: ' + Object.keys(LOAI_CHI_PHI).join(', ') + '.' };
  const soTien = Math.round(Number(x.soTien));
  if (!(soTien > 0 && soTien <= TRAN_MOT_KHOAN)) return { ok: false, code: 'SOTIEN', error: 'Số tiền phải dương và không quá ' + TRAN_MOT_KHOAN.toLocaleString('vi-VN') + 'đ một khoản.' };
  if (ghiChu.length < 10) return { ok: false, code: 'THIEU', error: 'Ghi chú ≥ 10 ký tự: chi cho việc gì.' };
  const ngay = /^\d{4}-\d{2}-\d{2}$/.test(String(x.ngay || '')) ? x.ngay : bayGio().slice(0, 10);
  if (ngay > bayGio().slice(0, 10)) return { ok: false, code: 'TUONGLAI', error: 'Không ghi chi phí cho ngày chưa tới.' };
  const soGio = loai === 'gioNguoi' && Number(x.soGio) > 0 ? Math.min(200, Number(x.soGio)) : null;
  const id = maMoi('CP');
  await db.prepare('INSERT INTO chiPhiPhucVu (id, maNha, loai, soTien, soGio, ngay, ghiChu, boiAi, luc) VALUES (?,?,?,?,?,?,?,?,?)')
    .bind(id, maNha, loai, soTien, soGio, ngay, ghiChu, hoSo.u, bayGio()).run();
  try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'VVIP_CHIPHI', doiTuong: maNha, chiTiet: loai + ' · ' + soTien }); } catch (e) {}
  return { ok: true, id };
}

/* Chi phí phục vụ theo nhà trong [tu, den) — map maNha → đồng. Nhà KHÔNG có
   dòng nào thì không có khoá: "chưa ghi" khác "bằng 0". */
export async function chiPhiTheoNha(db, tuNgay, denNgay) {
  const r = (await db.prepare('SELECT maNha, SUM(soTien) s FROM chiPhiPhucVu WHERE ngay >= ? AND ngay < ? GROUP BY maNha').bind(tuNgay, denNgay).all()).results || [];
  return Object.fromEntries(r.map(x => [x.maNha, Number(x.s || 0)]));
}

/* Lợi nhuận đóng góp của nhóm trọng điểm — chỉ tính trên nhà ĐÃ có chi phí
   ghi, và nói ra bao nhiêu nhà chưa ghi. Mẫu số là MỌI nhà đã ghi chi phí
   (kể cả nhà có chi phí mà chưa có thu trong kỳ — lỗ thật vẫn là lỗ).
   Hai chỗ trả null, không trả một con số:
     · chưa nhà trọng điểm nào ghi chi phí;
     · chưa nhà NGOÀI nhóm nào ghi chi phí — chia lợi nhuận trọng điểm cho
       chính nó ra 100%, một con số đẹp không nói gì. */
export function loiNhuanDongGop(dt, cp, nhomCua) {
  const nhaTD = Object.keys(nhomCua);
  const coCP = nhaTD.filter(k => cp[k] != null);
  const tatCaCoCP = Object.keys(cp);
  const ngoaiCoCP = tatCaCoCP.filter(k => !nhomCua[k]);
  if (!coCP.length) return { giaTri: null, vi: 'Chưa nhà VIP/VVIP nào có chi phí phục vụ được ghi — lợi nhuận đóng góp chưa đo được (không coi là 0).', thieu: nhaTD.length };
  const ldTD = coCP.reduce((s, k) => s + (dt[k] || 0) - cp[k], 0);
  const ldTong = tatCaCoCP.reduce((s, k) => s + (dt[k] || 0) - cp[k], 0);
  const thieu = nhaTD.length - coCP.length;
  const chung = { loiNhuanTrongDiem: Math.round(ldTD), loiNhuanTatCa: Math.round(ldTong), nhaCoChiPhi: coCP.length, nhaTrongDiem: nhaTD.length, nhaNgoaiCoChiPhi: ngoaiCoCP.length, thieu };
  if (!ngoaiCoCP.length) return { giaTri: null, ...chung, vi: 'Chưa nhà ngoài nhóm VIP/VVIP nào ghi chi phí phục vụ — tỷ trọng không xác định (chia cho chính mình ra 100%). Lợi nhuận trọng điểm tuyệt đối vẫn hiện.' };
  return { giaTri: ldTong > 0 ? tyLe(ldTD, ldTong) : null, ...chung,
    vi: ldTong > 0 ? (thieu ? thieu + ' nhà VIP/VVIP chưa ghi chi phí — chưa tính vào; con số đúng cho phần đã ghi.' : undefined)
      : 'Tổng lợi nhuận đóng góp của các nhà đã ghi chi phí không dương — tỷ trọng không xác định.' };
}

export async function dsChiPhiPhucVu(y, env, db, hoSo) {
  if (lvCua(hoSo) > 3) return { ok: false, code: 'NOPERM', error: 'Lợi nhuận đóng góp theo nhà chỉ R01–R03 (luật tài chính).' };
  const nay = Date.now(), tu = new Date(nay - 365 * NGAY).toISOString(), den = new Date(nay + NGAY).toISOString();
  const nhom = await nhomVaLucVao(db);
  const cp = await chiPhiTheoNha(db, tu.slice(0, 10), den.slice(0, 10));
  const thu = (await db.prepare("SELECT maKhachHang k, SUM(soTien) s FROM phieuThu WHERE trangThai = 'daDuyet' AND COALESCE(duyetLuc, ghiLuc) >= ? GROUP BY maKhachHang").bind(tu).all()).results || [];
  const hoan = (await db.prepare("SELECT maKhachHang k, SUM(soTien) s FROM hoanTien WHERE trangThai = 'daDuyet' AND COALESCE(duyetLuc, deXuatLuc) >= ? GROUP BY maKhachHang").bind(tu).all()).results || [];
  const dt = {}; thu.forEach(x => { dt[x.k] = (dt[x.k] || 0) + Number(x.s || 0); }); hoan.forEach(x => { dt[x.k] = (dt[x.k] || 0) - Number(x.s || 0); });
  const ds = Object.keys(nhom).map(k => ({ maNha: k, nhom: nhom[k].nhom, doanhThu: Math.round(dt[k] || 0), chiPhi: cp[k] != null ? cp[k] : undefined,
    loiNhuan: cp[k] != null ? Math.round((dt[k] || 0) - cp[k]) : undefined })).sort((a, b) => (b.doanhThu - a.doanhThu));
  return { ok: true, ds, loai: LOAI_CHI_PHI, tongHop: loiNhuanDongGop(dt, cp, Object.fromEntries(Object.entries(nhom).map(([k, v]) => [k, v.nhom]))) };
}
