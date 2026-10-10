/* ═══════════════════════════════════════════════════════════════
   GITA 365 — VÍ CREDIT · SỔ CÁI (chủ hệ duyệt bảng CR-2026.10-c)

   1 credit = 10 đồng. Mỗi nhà (mã khách hàng) có MỘT ví với ba loại
   credit, trừ theo thứ tự chủ hệ đã duyệt:

       tang    credit TẶNG   — tầng 1: 2.000 · đăng ký tài khoản tầng 2–5:
                               3.000 · 5.000 · 8.000 · 12.000. Học viện chịu.
       thuong  credit THƯỞNG — trả lại cho từng hoạt động, chia từ quỹ
                               thưởng 10% của gói tầng.
       traPhi  credit TRẢ PHÍ — nạp từ phiếu thu ĐÃ DUYỆT (soTien / 10).

   ══ GÓI TẦNG 2 (chủ hệ chốt CR-2026.10-d) ══
   Hai lựa chọn: 500.000đ → 300.000 credit · 868.000đ → 1.000.000 credit.
   Vẫn 10đ = 1 credit: phiếu thu đúng giá một lựa chọn thì nạp soTien/10
   credit TRẢ PHÍ + phần còn lại là credit TẶNG theo gói (Học viện chịu,
   dùng trước, không hoàn). Bảng giá hoạt động tầng 2 tính trên ngân sách
   chuẩn 300.000 credit (CR_CHUAN) — không phụ thuộc giá gói đang chạy,
   nên lựa chọn 1.000.000 credit thật sự mua được nhiều hoạt động hơn.

       Trừ: tang → thuong → traPhi.

   ══ SỔ CHỈ THÊM DÒNG ══
   Không UPDATE, không DELETE. Sửa sai bằng một dòng điều chỉnh có lý do
   (R01). Mỗi dòng có `khoaDuy` UNIQUE: bấm hai lần, gọi lại sau lỗi mạng,
   hai người cùng duyệt — vẫn chỉ MỘT dòng. Không nhận con số credit nào
   từ người gọi: mọi số do máy tính từ bảng tham số dưới đây + giá gói
   đang chạy (docGiaHienHanh).

   ══ AI ĐƯỢC LÀM GÌ ══
     · Nhà (chủ mã khách hàng): xem ví mình · tự tiêu cho mục tự chọn.
     · Coach của nhà (hoSoKhach.coach) hoặc R01–R05: xem ví, ghi thưởng
       hoạt động đã kiểm, ghi tiêu dịch vụ, đặt cấp/nhóm.
     · R01–R03 hoặc Kế toán thu: nạp credit từ phiếu thu đã duyệt.
     · R01: điều chỉnh có lý do. R01–R04: xem tổng quan.

   ══ THƯỞNG TỰ ĐỘNG, CÓ DẤU VẾT ══
   Thưởng "tick việc hôm nay" và "giữ chuỗi 7 ngày" KHÔNG do ai khai: máy
   đọc bảng nhipXong (cửa tickNhip đã ghi) — ngày nào nhà có tick thật thì
   thưởng ngày ấy, từ ngày ví mở trở đi, không vượt trần của tầng.

   Bảng tự tạo (CREATE TABLE IF NOT EXISTS) — không cần chạy lệnh D1 tay.
   Tham số phải KHỚP src/data-credit.js — bộ thử tools/thu-credit.mjs so
   hai bên; lệch là đỏ.
   ═══════════════════════════════════════════════════════════════ */

import { Kho } from './nen.js';
import { docGiaHienHanh } from './bang-gia.js';
import { quyenCua, oDauTien } from './chi-tieu.js';
import { BAC } from './vai-tro.js';

export const PHIEN_BAN = 'CR-2026.10-d';
export const TY = 10;
export const TANG = {
  1: { ngay: 30,  buoi: 3,  pha: 3 },
  2: { ngay: 21,  buoi: 6,  pha: 3 },
  3: { ngay: 90,  buoi: 12, pha: 4 },
  4: { ngay: 365, buoi: 24, pha: 4 },
  5: { ngay: 365, buoi: 24, pha: 4 }
};
export const TANG_T1 = 2000;
export const DANG_KY = { 2: 3000, 3: 5000, 4: 8000, 5: 12000 };
/* Lựa chọn gói theo tầng (gia: đồng · cr: tổng credit nhà nhận) và ngân sách chuẩn để tính bảng giá */
export const GOI = { 2: [{ ma: 'T2-500', gia: 500000, cr: 300000 }, { ma: 'T2-868', gia: 868000, cr: 1000000 }] };
export const CR_CHUAN = { 2: 300000 };
export function goiKhop(t, soTien) { return (GOI[t] || []).filter(g => g.gia === Math.round(Number(soTien))).shift() || null; }
export const QUY = { coach: 0.60, hoclieu: 0.15, sukien: 0.10, thuong: 0.10, duphong: 0.05 };
export const NHOM = { TH: 0.90, CS: 1.00, PT: 1.15, SV: 1.00, PH: 0.90, GD: 1.30 };
/* bs: bội số 1 buổi chuẩn · tu: nhà tự chọn được (không cần Coach ghi) */
export const TIEU = {
  'buoi-11':   { bs: 1.00, tu: false }, 'buoi-nhom': { bs: 0.40, tu: false }, 'buoi-pm':  { bs: 0.80, tu: false },
  'cong':      { bs: 0.50, tu: false }, 'danh-gia':  { bs: 1.00, tu: false }, 'test':     { bs: 0.15, tu: true },
  'tai-lieu':  { bs: 0.03, tu: true },  'su-kien':   { bs: 0.30, tu: true },  'khan':     { bs: 0.50, tu: false },
  'gia-han':   { bs: 0.60, tu: true }
};
/* ty: phần quỹ thưởng · dem: số lần tối đa trong tầng · tuDong: máy tự ghi từ nhipXong */
export const THUONG = {
  tick:    { ty: 0.25, dem: T => T.ngay, tuDong: true },
  nhatky:  { ty: 0.10, dem: T => Math.floor(T.ngay / 2) },
  nv:      { ty: 0.20, dem: T => T.buoi * 3 },
  mc:      { ty: 0.15, dem: T => T.buoi * 3 },
  chuoi:   { ty: 0.10, dem: T => Math.max(1, Math.floor(T.ngay / 7)), tuDong: true },
  cong:    { ty: 0.15, dem: T => T.pha },
  phanhoi: { ty: 0.05, dem: T => T.buoi }
};
export const THU_TU_TRU = ['tang', 'thuong', 'traPhi'];

const w = c => 1 + 0.1 * (c - 1);
const TB_W = (() => { let s = 0; for (let c = 1; c <= 10; c++) s += w(c); return s / 10; })();

/* Chia n buổi cho 10 cấp theo trọng số, phần dư lớn nhất — khớp client. */
export function chiaBuoi(n) {
  const ws = []; for (let c = 1; c <= 10; c++) ws.push(w(c));
  const s = ws.reduce((a, b) => a + b, 0), ra = ws.map(x => n * x / s), ng = ra.map(Math.floor);
  let du = n - ng.reduce((a, b) => a + b, 0);
  ra.map((x, i) => [x - Math.floor(x), i]).sort((a, b) => b[0] - a[0] || b[1] - a[1]).slice(0, du).forEach(x => { ng[x[1]]++; });
  return ng;
}

/* Thông số một tầng ở giá đang chạy. */
export function thongSoTang(t, gia) {
  const T = Object.assign({ t }, TANG[t]);
  T.gia = Number(gia) || 0;
  T.cr = CR_CHUAN[t] || (T.gia ? Math.round(T.gia / TY) : (t === 1 ? TANG_T1 : 0));
  T.base = T.buoi ? T.cr * QUY.coach / T.buoi : 0;
  const n = chiaBuoi(T.buoi);
  const tong = n.reduce((a, x, i) => a + x * T.base * w(i + 1) / TB_W, 0);
  T.can = tong ? (T.cr * QUY.coach) / tong : 1;
  T.poolThuong = T.cr * QUY.thuong;
  return T;
}
export function giaHoatDong(T, cap, nhom, ma) {
  const a = TIEU[ma]; if (!a) return 0;
  const c = Math.min(10, Math.max(1, Number(cap) || 1));
  return Math.round(a.bs * T.base * T.can * (w(c) / TB_W) * (NHOM[nhom] || 1));
}
export function thuongMoiLan(T, hd) {
  const a = THUONG[hd]; if (!a) return 0;
  return Math.round(T.poolThuong * a.ty / Math.max(1, a.dem(T)));
}

/* ═══════════ BẢNG ═══════════ */
let daTao = false;
async function taoBang(db) {
  if (daTao) return;
  await db.prepare('CREATE TABLE IF NOT EXISTS soCredit (id TEXT PRIMARY KEY, maNha TEXT NOT NULL, loai TEXT NOT NULL, ' +
    'so INTEGER NOT NULL, viec TEXT NOT NULL, khoaDuy TEXT NOT NULL, tang INTEGER, cap INTEGER, thamChieu TEXT, ' +
    'ghiChu TEXT, boiAi TEXT, luc TEXT NOT NULL)').run();
  await db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS ux_socredit_khoa ON soCredit (khoaDuy)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS ix_socredit_nha ON soCredit (maNha, luc)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS ix_socredit_viec ON soCredit (maNha, viec, tang)').run();
  await db.prepare('CREATE TABLE IF NOT EXISTS viCredit (maNha TEXT PRIMARY KEY, cap INTEGER NOT NULL DEFAULT 1, ' +
    "nhom TEXT NOT NULL DEFAULT 'CS', moLuc TEXT NOT NULL, suaLuc TEXT, boiAi TEXT)").run();
  daTao = true;
}

function id() { return 'CR-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8); }
async function ghi(db, d) {
  const r = await db.prepare('INSERT INTO soCredit (id,maNha,loai,so,viec,khoaDuy,tang,cap,thamChieu,ghiChu,boiAi,luc) ' +
    'VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(khoaDuy) DO NOTHING')
    .bind(id(), d.maNha, d.loai, Math.round(d.so), d.viec, d.khoaDuy, d.tang || null, d.cap || null,
      d.thamChieu || null, d.ghiChu || null, d.boiAi || '', d.luc || new Date().toISOString()).run();
  return Number((r.meta || {}).changes || 0);
}

export async function soDu(db, maNha) {
  const r = await db.prepare('SELECT loai, COALESCE(SUM(so),0) AS s FROM soCredit WHERE maNha = ? GROUP BY loai').bind(maNha).all();
  const o = { tang: 0, thuong: 0, traPhi: 0 };
  (r.results || []).forEach(x => { if (o[x.loai] !== undefined) o[x.loai] = Number(x.s) || 0; });
  o.tong = o.tang + o.thuong + o.traPhi;
  return o;
}

/* ═══════════ NHÀ · TẦNG · QUYỀN ═══════════ */
export async function maNhaCuaToi(db, hoSo) {
  if (hoSo.maKhachHang) return String(hoSo.maKhachHang);
  const nd = await Kho.nguoiTheoId(db, hoSo.uid);
  if (nd && nd.maKhachHang) return String(nd.maKhachHang);
  if (nd && nd.studentId) {
    const h = await db.prepare('SELECT maKhachHang FROM hoSoKhach WHERE maHocVien = ? LIMIT 1').bind(nd.studentId).first();
    if (h && h.maKhachHang) return String(h.maKhachHang);
  }
  return '';
}
export async function hoSoNha(db, maNha) {
  return await db.prepare('SELECT maKhachHang, tang, coach FROM hoSoKhach WHERE maKhachHang = ?').bind(maNha).first();
}
export async function tangCuaNha(db, maNha) {
  const h = await hoSoNha(db, maNha);
  const t = Number(h && h.tang) || 0;
  return t >= 1 && t <= 5 ? t : 1;
}
/* Mã nhà phải CÓ THẬT (hồ sơ khách hoặc tài khoản mang mã ấy) — không
   mở ví, không tặng credit cho một mã gõ sai. */
export async function nhaCoThat(db, maNha) {
  if (!maNha) return false;
  if (await hoSoNha(db, maNha)) return true;
  const u = await db.prepare('SELECT 1 AS c FROM users WHERE maKhachHang = ? LIMIT 1').bind(maNha).first();
  return !!u;
}
/* 'nha' · 'coach' · 'ql' · '' */
export async function vaiVoiNha(db, hoSo, maNha) {
  const lv = BAC[hoSo.role] || 99;
  if (lv <= 5) return 'ql';
  if (lv <= 8) {
    const h = await hoSoNha(db, maNha);
    if (h && String(h.coach || '') === String(hoSo.u || '')) return 'coach';
  }
  if (maNha && (await maNhaCuaToi(db, hoSo)) === maNha) return 'nha';
  return '';
}
export async function moVi(db, maNha, boiAi) {
  const gio = new Date().toISOString();
  await db.prepare('INSERT INTO viCredit (maNha, cap, nhom, moLuc, boiAi) VALUES (?,1,\'CS\',?,?) ON CONFLICT(maNha) DO NOTHING')
    .bind(maNha, gio, boiAi || '').run();
  return await db.prepare('SELECT * FROM viCredit WHERE maNha = ?').bind(maNha).first();
}
async function thongSoNha(db, maNha) {
  const t = await tangCuaNha(db, maNha);
  const g = await docGiaHienHanh(db);
  return thongSoTang(t, (g.gia || {})[t]);
}

/* Credit tặng của tầng đang ở — một lần mỗi nhà mỗi tầng. */
async function capQuaTang(db, maNha, T) {
  if (T.t === 1) return await ghi(db, { maNha, loai: 'tang', so: TANG_T1, viec: 'tang-T1', khoaDuy: 'qua:T1:' + maNha, tang: 1, ghiChu: 'Credit tặng tầng 1' });
  if (DANG_KY[T.t]) return await ghi(db, { maNha, loai: 'tang', so: DANG_KY[T.t], viec: 'dang-ky', khoaDuy: 'qua:dk:T' + T.t + ':' + maNha, tang: T.t, ghiChu: 'Credit tặng khi đăng ký tầng ' + T.t });
  return 0;
}
async function demThuong(db, maNha, hd, t) {
  const r = await db.prepare('SELECT COUNT(*) AS n FROM soCredit WHERE maNha = ? AND viec = ? AND tang = ?').bind(maNha, 'thuong:' + hd, t).first();
  return Number((r || {}).n || 0);
}
/* Thưởng tick + chuỗi 7 ngày từ nhipXong (bo = 0), từ ngày ví mở. */
async function dongBoThuongTuDong(db, maNha, T, vi) {
  let them = 0;
  const tu = String(vi.moLuc || '').slice(0, 10);
  let r;
  try {
    r = await db.prepare('SELECT DISTINCT ngay FROM nhipXong WHERE maNha = ? AND bo = 0 AND ngay >= ? ORDER BY ngay ASC').bind(maNha, tu).all();
  } catch (e) { return 0; }   /* nhà chưa có nhịp nào */
  const ngay = (r.results || []).map(x => String(x.ngay));
  const tranTick = THUONG.tick.dem(T), giaTick = thuongMoiLan(T, 'tick');
  let daCo = await demThuong(db, maNha, 'tick', T.t);
  for (const d of ngay) {
    if (daCo >= tranTick || !giaTick) break;
    const n = await ghi(db, { maNha, loai: 'thuong', so: giaTick, viec: 'thuong:tick', khoaDuy: 'th:tick:' + maNha + ':' + d, tang: T.t, thamChieu: d, ghiChu: 'Tick việc hôm nay ' + d, boiAi: 'may' });
    daCo += n; them += n;
  }
  /* Chuỗi: mỗi khối 7 ngày liền KHÔNG chồng nhau tính một lần. */
  const tranChuoi = THUONG.chuoi.dem(T), giaChuoi = thuongMoiLan(T, 'chuoi');
  let daChuoi = await demThuong(db, maNha, 'chuoi', T.t), lien = 0, dau = '', truoc = '';
  for (const d of ngay) {
    const lienTiep = truoc && (Date.parse(d) - Date.parse(truoc) === 86400000);
    if (!lienTiep || lien === 0) { lien = 1; dau = d; } else lien++;
    truoc = d;
    if (lien === 7) {
      if (daChuoi < tranChuoi && giaChuoi) {
        const n = await ghi(db, { maNha, loai: 'thuong', so: giaChuoi, viec: 'thuong:chuoi', khoaDuy: 'th:chuoi:' + maNha + ':' + dau, tang: T.t, thamChieu: dau, ghiChu: 'Giữ chuỗi 7 ngày từ ' + dau, boiAi: 'may' });
        daChuoi += n; them += n;
      }
      lien = 0; truoc = '';
    }
  }
  return them;
}

function bangGiaNha(T, vi) {
  const o = {};
  Object.keys(TIEU).forEach(m => { o[m] = { cr: giaHoatDong(T, vi.cap, vi.nhom, m), tuChon: TIEU[m].tu }; });
  return o;
}
function bangThuongNha(T) {
  const o = {};
  Object.keys(THUONG).forEach(m => { o[m] = { cr: thuongMoiLan(T, m), toiDa: THUONG[m].dem(T), tuDong: !!THUONG[m].tuDong }; });
  return o;
}

/* ═══════════ CỬA 1 · XEM VÍ ═══════════ */
export async function viCredit(y, env, db, hoSo) {
  await taoBang(db);
  const x = y || {};
  const maNha = String(x.maNha || '').trim() || await maNhaCuaToi(db, hoSo);
  if (!maNha) return { ok: false, code: 'KHONGNHA', error: 'Tài khoản này chưa gắn với mã khách hàng nào.' };
  const vai = await vaiVoiNha(db, hoSo, maNha);
  if (!vai) return { ok: false, code: 'NOPERM', error: 'Chỉ xem được ví của chính nhà mình, hoặc nhà mình phụ trách.' };
  if (!(await nhaCoThat(db, maNha))) return { ok: false, code: 'KHONGNHA', error: 'Không có nhà nào mang mã ' + maNha + '.' };
  const vi = await moVi(db, maNha, hoSo.u);
  const T = await thongSoNha(db, maNha);
  const qua = await capQuaTang(db, maNha, T);
  const thuongMoi = await dongBoThuongTuDong(db, maNha, T, vi);
  const du = await soDu(db, maNha);
  const r = await db.prepare('SELECT loai, so, viec, thamChieu, ghiChu, boiAi, luc, tang FROM soCredit WHERE maNha = ? ORDER BY luc DESC, rowid DESC LIMIT 30').bind(maNha).all();
  return { ok: true, phienBan: PHIEN_BAN, maNha, vai, tang: T.t, cap: vi.cap, nhom: vi.nhom,
    soDu: du, quaMoi: qua, thuongMoi, gan: r.results || [],
    tang_ts: { cr: T.cr, gia: T.gia, buoiChuan: Math.round(T.base), quyThuong: Math.round(T.poolThuong) },
    giaTieu: bangGiaNha(T, vi), giaThuong: bangThuongNha(T), thuTuTru: THU_TU_TRU, ty: TY };
}

/* ═══════════ CỬA 2 · SỔ CỦA MỘT NHÀ ═══════════ */
export async function soCreditNha(y, env, db, hoSo) {
  await taoBang(db);
  const x = y || {};
  const maNha = String(x.maNha || '').trim() || await maNhaCuaToi(db, hoSo);
  if (!maNha || !(await vaiVoiNha(db, hoSo, maNha))) return { ok: false, code: 'NOPERM', error: 'Không xem được sổ credit của nhà này.' };
  const trang = Math.max(0, Number(x.trang) || 0);
  const r = await db.prepare('SELECT loai, so, viec, thamChieu, ghiChu, boiAi, luc, tang, cap FROM soCredit WHERE maNha = ? ORDER BY luc DESC, rowid DESC LIMIT 100 OFFSET ?')
    .bind(maNha, trang * 100).all();
  return { ok: true, maNha, trang, ds: r.results || [], soDu: await soDu(db, maNha) };
}

/* ═══════════ CỬA 3 · GHI THƯỞNG HOẠT ĐỘNG (Coach đã kiểm) ═══════════ */
export async function thuongCredit(y, env, db, hoSo) {
  await taoBang(db);
  const x = y || {}, maNha = String(x.maNha || '').trim(), hd = String(x.hoatDong || '').trim(), tc = String(x.thamChieu || '').trim();
  const vai = await vaiVoiNha(db, hoSo, maNha);
  if (vai !== 'coach' && vai !== 'ql') return { ok: false, code: 'NOPERM', error: 'Thưởng hoạt động do Coach của nhà hoặc Trưởng nhóm trở lên ghi — sau khi đã kiểm bằng chứng.' };
  if (!(await nhaCoThat(db, maNha))) return { ok: false, code: 'KHONGNHA', error: 'Không có nhà nào mang mã ' + maNha + '.' };
  if (!THUONG[hd]) return { ok: false, code: 'HDLA', error: 'Hoạt động thưởng không có trong bảng đã duyệt.' };
  if (THUONG[hd].tuDong) return { ok: false, code: 'TUDONG', error: 'Thưởng "' + hd + '" do máy tự tính từ nhịp hằng ngày — không ghi tay.' };
  if (!tc || tc.length > 80) return { ok: false, code: 'THIEUTC', error: 'Thiếu mã tham chiếu (mã nhiệm vụ, minh chứng, buổi…) để không thưởng trùng.' };
  await moVi(db, maNha, hoSo.u);
  const T = await thongSoNha(db, maNha);
  if ((await demThuong(db, maNha, hd, T.t)) >= THUONG[hd].dem(T))
    return { ok: false, code: 'TRAN', error: 'Đã đủ số lần thưởng tối đa của hoạt động này ở tầng ' + T.t + '.' };
  const so = thuongMoiLan(T, hd);
  const n = await ghi(db, { maNha, loai: 'thuong', so, viec: 'thuong:' + hd, khoaDuy: 'th:' + hd + ':' + maNha + ':' + tc, tang: T.t, thamChieu: tc, ghiChu: String(x.ghiChu || '').slice(0, 200), boiAi: hoSo.u });
  return { ok: true, daGhi: n === 1, trung: n === 0, so: n ? so : 0, soDu: await soDu(db, maNha) };
}

/* ═══════════ CỬA 4 · TIÊU CREDIT ═══════════
   Trừ theo thứ tự tang → thuong → traPhi. Mỗi phần một dòng âm, cùng
   tham chiếu. Ghi có điều kiện (đủ số dư mới ghi) để hai lượt tiêu cùng
   lúc không đẩy ví xuống âm; phần nào không ghi được thì hoàn ngay phần
   đã ghi của lượt ấy. */
export async function tieuCredit(y, env, db, hoSo) {
  await taoBang(db);
  const x = y || {}, ma = String(x.hoatDong || '').trim(), tc = String(x.thamChieu || '').trim();
  const maNha = String(x.maNha || '').trim() || await maNhaCuaToi(db, hoSo);
  const vai = await vaiVoiNha(db, hoSo, maNha);
  if (!vai) return { ok: false, code: 'NOPERM', error: 'Không tiêu được credit của nhà này.' };
  if (!(await nhaCoThat(db, maNha))) return { ok: false, code: 'KHONGNHA', error: 'Không có nhà nào mang mã ' + maNha + '.' };
  if (!TIEU[ma]) return { ok: false, code: 'HDLA', error: 'Hoạt động không có trong bảng giá credit đã duyệt.' };
  if (vai === 'nha' && !TIEU[ma].tu) return { ok: false, code: 'CANCOACH', error: 'Dịch vụ này do Coach ghi sau khi đã thực hiện — nhà không tự trừ được.' };
  if (!tc || tc.length > 80) return { ok: false, code: 'THIEUTC', error: 'Thiếu mã tham chiếu của lượt dùng.' };
  const vi = await moVi(db, maNha, hoSo.u);
  const T = await thongSoNha(db, maNha);
  const gia = giaHoatDong(T, vi.cap, vi.nhom, ma);
  if (!gia) return { ok: false, code: 'GIA0', error: 'Giá credit của hoạt động này đang bằng 0 ở tầng hiện tại.' };
  const k = await truTheoThuTu(db, { maNha, gia, viec: 'tieu:' + ma, tc, tang: T.t, cap: vi.cap, ghiChu: x.ghiChu, boiAi: hoSo.u });
  if (!k.ok || k.trung) return k;
  const daGhi = k.daGhi; const gio = k.gio;
  /* V50·168 · COACH ↔ CRM: buổi coach đã ghi tiêu credit thì vào luôn sổ chạm —
     chính sổ CRM đọc (dòng thời gian, "chạm cuối", KPI). Một lượt ghi, hai
     nơi thấy; khoá chống trùng là mã tham chiếu của buổi. */
  if (vai !== 'nha' && /^buoi/.test(ma)) {
    try {
      await db.prepare('INSERT INTO soCham (id,maNha,ngay,kieu,denLuc,noiDung,canCu,aiDuyet,boiAi,ghiLuc) ' +
        "SELECT ?,?,?,'buoi',NULL,?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM soCham WHERE maNha = ? AND canCu = ?)")
        .bind('CH-' + id(), maNha, gio.slice(0, 10), ('Buổi coach · ' + (String(x.ghiChu || '').trim() || ma)).slice(0, 300),
          'credit:' + tc, hoSo.u, hoSo.u, gio, maNha, 'credit:' + tc).run();
    } catch (e) { /* sổ chạm là phần nối — không làm hỏng lượt trừ credit đã xong */ }
  }
  return { ok: true, so: gia, chiTiet: daGhi.map(([l, s]) => ({ loai: l, so: s })), soDu: await soDu(db, maNha) };
}

/* Trừ `gia` credit của một nhà theo thứ tự tang → thuong → traPhi. Dùng
   chung cho tieuCredit và kho cấp cao (kho-cao.js) — một chỗ trừ, không
   hai bản chép của cùng một phép trừ có điều kiện.
   Mỗi phần một dòng âm, ghi CÓ ĐIỀU KIỆN (đủ số dư mới ghi) để hai lượt
   cùng lúc không đẩy ví xuống âm; phần nào không ghi được thì hoàn ngay
   phần đã ghi của lượt ấy. Cùng tham chiếu `tc` gọi lại → trung:true. */
export async function truTheoThuTu(db, d) {
  await taoBang(db);
  const { maNha, gia, viec, tc } = d;
  /* Khoá CHÍNH XÁC, không dò tiền tố: dò `tieu:nha:tc:%` thì mã "A" trùng
     nhầm với "A:B". Lượt đã bị hoàn (hết số dư giữa chừng) không tính là
     đã trừ — nhưng khoá cũ đã dùng, nên phải gọi lại bằng mã tham chiếu mới. */
  const goc = THU_TU_TRU.map(l => 'tieu:' + maNha + ':' + tc + ':' + l);
  const co = ((await db.prepare('SELECT khoaDuy FROM soCredit WHERE khoaDuy IN (?,?,?,?,?,?)')
    .bind(...goc, ...goc.map(k => k + ':hoan')).all()).results || []).map(r => r.khoaDuy);
  if (goc.some(k => co.includes(k) && !co.includes(k + ':hoan'))) return { ok: true, trung: true, so: 0, soDu: await soDu(db, maNha) };
  if (co.length) return { ok: false, code: 'DOI', error: 'Lượt này đã được hoàn vì số dư đổi giữa chừng — dùng mã tham chiếu mới để thử lại.' };
  const du = await soDu(db, maNha);
  if (du.tong < gia) return { ok: false, code: 'THIEU', error: 'Ví còn ' + du.tong + ' credit, lượt này cần ' + gia + ' credit.', can: gia, soDu: du };
  let con = gia; const ke = [];
  for (const loai of THU_TU_TRU) { if (con <= 0) break; const lay = Math.min(con, Math.max(0, du[loai])); if (lay > 0) { ke.push([loai, lay]); con -= lay; } }
  const daGhi = []; const gio = new Date().toISOString();
  for (const [loai, lay] of ke) {
    const r = await db.prepare('INSERT INTO soCredit (id,maNha,loai,so,viec,khoaDuy,tang,cap,thamChieu,ghiChu,boiAi,luc) ' +
      'SELECT ?,?,?,?,?,?,?,?,?,?,?,? WHERE (SELECT COALESCE(SUM(so),0) FROM soCredit WHERE maNha = ? AND loai = ?) >= ? ' +
      'ON CONFLICT(khoaDuy) DO NOTHING')
      .bind(id(), maNha, loai, -lay, viec, 'tieu:' + maNha + ':' + tc + ':' + loai, d.tang || null, d.cap || null, tc,
        String(d.ghiChu || '').slice(0, 200), d.boiAi || '', gio, maNha, loai, lay).run();
    if (Number((r.meta || {}).changes || 0) === 1) daGhi.push([loai, lay]);
    else {
      for (const [l2, s2] of daGhi) await ghi(db, { maNha, loai: l2, so: s2, viec: 'hoan-tieu', khoaDuy: 'tieu:' + maNha + ':' + tc + ':' + l2 + ':hoan', tang: d.tang, thamChieu: tc, ghiChu: 'Hoàn do số dư vừa đổi', boiAi: 'may' });
      return { ok: false, code: 'DOI', error: 'Số dư vừa thay đổi — thử lại.' };
    }
  }
  return { ok: true, daGhi, gio };
}

/* ═══════════ CỬA 5 · NẠP TỪ PHIẾU THU ĐÃ DUYỆT ═══════════ */
async function duocNap(db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv <= 3) return true;
  try { return oDauTien(await quyenCua(db, hoSo.u), 'thu'); } catch (e) { return false; }
}
export async function napCreditPhieu(y, env, db, hoSo) {
  await taoBang(db);
  if (!(await duocNap(db, hoSo))) return { ok: false, code: 'NOPERM', error: 'Nạp credit từ phiếu thu cần R01–R03 hoặc Kế toán thu.' };
  const idP = String((y || {}).idPhieu || '').trim();
  const pt = await db.prepare('SELECT id, maKhachHang, soTien, trangThai FROM phieuThu WHERE id = ?').bind(idP).first();
  if (!pt) return { ok: false, error: 'Không tìm thấy phiếu thu.' };
  if (pt.trangThai !== 'daDuyet') return { ok: false, code: 'CHUADUYET', error: 'Chỉ nạp credit từ phiếu thu ĐÃ DUYỆT (hai người: người ghi và người duyệt).' };
  const so = Math.floor(Number(pt.soTien) / TY);
  if (!(so > 0)) return { ok: false, error: 'Số tiền phiếu không hợp lệ.' };
  await moVi(db, pt.maKhachHang, hoSo.u);
  const t = await tangCuaNha(db, pt.maKhachHang);
  const n = await ghi(db, { maNha: pt.maKhachHang, loai: 'traPhi', so, viec: 'nap', khoaDuy: 'nap:' + pt.id, tang: t, thamChieu: pt.id, ghiChu: 'Nạp từ phiếu thu ' + pt.id + ' · ' + Number(pt.soTien).toLocaleString('vi-VN') + 'đ', boiAi: hoSo.u });
  const g = goiKhop(t, pt.soTien), them = g ? g.cr - so : 0;
  const n2 = them > 0 ? await ghi(db, { maNha: pt.maKhachHang, loai: 'tang', so: them, viec: 'tang-goi', khoaDuy: 'nap-tang:' + pt.id, tang: t, thamChieu: pt.id, ghiChu: 'Credit tặng theo gói ' + g.ma + ' (' + g.gia.toLocaleString('vi-VN') + 'đ → ' + g.cr.toLocaleString('vi-VN') + ' credit)', boiAi: hoSo.u }) : 0;
  return { ok: true, daNap: n === 1, trung: n === 0 && n2 === 0, so: n ? so : 0, tangGoi: n2 ? them : 0, goi: g ? g.ma : '', maNha: pt.maKhachHang, soDu: await soDu(db, pt.maKhachHang) };
}
export async function dsPhieuThuChuaNap(y, env, db, hoSo) {
  await taoBang(db);
  if (!(await duocNap(db, hoSo))) return { ok: false, code: 'NOPERM', error: 'Cần R01–R03 hoặc Kế toán thu.' };
  const r = await db.prepare("SELECT p.id, p.maKhachHang, p.soTien, p.duyetLuc, h.tang FROM phieuThu p LEFT JOIN hoSoKhach h ON h.maKhachHang = p.maKhachHang " +
    "WHERE p.trangThai = 'daDuyet' AND NOT EXISTS (SELECT 1 FROM soCredit s WHERE s.khoaDuy = 'nap:' || p.id) ORDER BY p.duyetLuc DESC LIMIT 200").all();
  return { ok: true, ds: (r.results || []).map(p => {
    const credit = Math.floor(Number(p.soTien) / TY), g = goiKhop(Number(p.tang) || 0, p.soTien);
    return Object.assign(p, { credit, tangGoi: g ? Math.max(0, g.cr - credit) : 0, goi: g ? g.ma : '' });
  }) };
}

/* ═══════════ CỬA 6 · ĐẶT CẤP / NHÓM CỦA VÍ ═══════════ */
export async function datViCredit(y, env, db, hoSo) {
  await taoBang(db);
  const x = y || {}, maNha = String(x.maNha || '').trim();
  const vai = await vaiVoiNha(db, hoSo, maNha);
  if (vai !== 'coach' && vai !== 'ql') return { ok: false, code: 'NOPERM', error: 'Cấp và nhóm do Coach của nhà hoặc Trưởng nhóm trở lên đặt.' };
  if (!(await nhaCoThat(db, maNha))) return { ok: false, code: 'KHONGNHA', error: 'Không có nhà nào mang mã ' + maNha + '.' };
  const cap = Number(x.cap), nhom = String(x.nhom || '');
  if (!(cap >= 1 && cap <= 10)) return { ok: false, error: 'Cấp phải từ 1 tới 10.' };
  if (!NHOM[nhom]) return { ok: false, error: 'Nhóm khách hàng không có trong bảng đã duyệt.' };
  await moVi(db, maNha, hoSo.u);
  await db.prepare('UPDATE viCredit SET cap = ?, nhom = ?, suaLuc = ?, boiAi = ? WHERE maNha = ?').bind(cap, nhom, new Date().toISOString(), hoSo.u, maNha).run();
  return { ok: true, maNha, cap, nhom };
}

/* ═══════════ CỬA 7 · ĐIỀU CHỈNH (R01, có lý do) ═══════════ */
export async function dieuChinhCredit(y, env, db, hoSo) {
  await taoBang(db);
  if (hoSo.role !== 'R01') return { ok: false, code: 'NOPERM', error: 'Chỉ Super Admin điều chỉnh credit.' };
  const x = y || {}, maNha = String(x.maNha || '').trim(), loai = String(x.loai || ''), so = Math.round(Number(x.so)), lyDo = String(x.lyDo || '').trim();
  if (!(await nhaCoThat(db, maNha))) return { ok: false, code: 'KHONGNHA', error: 'Không có nhà nào mang mã ' + maNha + '.' };
  if (THU_TU_TRU.indexOf(loai) < 0) return { ok: false, error: 'Loại credit phải là tang · thuong · traPhi.' };
  if (!so || Math.abs(so) > 10000000) return { ok: false, error: 'Số credit điều chỉnh không hợp lệ (khác 0, tối đa 10.000.000).' };
  if (lyDo.length < 10) return { ok: false, error: 'Điều chỉnh phải có lý do (ít nhất 10 ký tự) — sáu tháng sau không ai nhớ vì sao.' };
  const du = await soDu(db, maNha);
  if (so < 0 && du[loai] + so < 0) return { ok: false, error: 'Điều chỉnh làm ' + loai + ' âm — số dư hiện ' + du[loai] + '.' };
  await moVi(db, maNha, hoSo.u);
  const tc = 'DC-' + Date.now().toString(36);
  await ghi(db, { maNha, loai, so, viec: 'dieu-chinh', khoaDuy: 'dc:' + maNha + ':' + tc, thamChieu: tc, ghiChu: lyDo.slice(0, 300), boiAi: hoSo.u });
  return { ok: true, soDu: await soDu(db, maNha) };
}

/* ═══════════ CỬA 8 · TỔNG QUAN (R01–R04) ═══════════ */
export async function tongQuanCredit(y, env, db, hoSo) {
  await taoBang(db);
  if ((BAC[hoSo.role] || 99) > 4) return { ok: false, code: 'NOPERM', error: 'Tổng quan credit mở cho R01–R04.' };
  const loai = await db.prepare('SELECT loai, COALESCE(SUM(so),0) AS s, COUNT(*) AS n FROM soCredit GROUP BY loai').all();
  const viec = await db.prepare("SELECT viec, COALESCE(SUM(so),0) AS s, COUNT(*) AS n FROM soCredit GROUP BY viec ORDER BY ABS(SUM(so)) DESC LIMIT 30").all();
  const soVi = await db.prepare('SELECT COUNT(*) AS n FROM viCredit').first();
  const gan = await db.prepare('SELECT maNha, loai, so, viec, ghiChu, boiAi, luc FROM soCredit ORDER BY luc DESC, rowid DESC LIMIT 40').all();
  const g = await docGiaHienHanh(db);
  const bang = {}; for (let t = 1; t <= 5; t++) { const T = thongSoTang(t, (g.gia || {})[t]); bang[t] = { gia: T.gia, cr: T.cr, buoiChuan: Math.round(T.base), dangKy: DANG_KY[t] || 0 }; }
  return { ok: true, phienBan: PHIEN_BAN, ty: TY, soVi: Number((soVi || {}).n || 0), theoLoai: loai.results || [], theoViec: viec.results || [], gan: gan.results || [], bang };
}
