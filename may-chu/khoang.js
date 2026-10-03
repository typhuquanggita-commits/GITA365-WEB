/* ═══════════════════════════════════════════════════════════════
   GITA 365 — KHOANG: KHOÁ TỪNG PHẦN & TỰ NGẮT TỪNG PHẦN

   Một con tàu chia khoang kín nước: thủng một khoang thì đóng khoang ấy,
   tàu vẫn chạy. Worker có ~260 việc; trước đây chỉ có HAI trạng thái —
   chạy hết, hoặc ĐÓNG BĂNG hết (cuu-he.js). Bị tấn công vào một cửa
   (ví dụ AI bị spam) thì phải chọn giữa để mặc, hoặc khoá cả hệ.

   Nay mỗi việc thuộc đúng một KHOANG. Ba lớp, đọc từ ngoài vào:

     1. env.GITA_KHOA_KHOANG = "ai,phim"   — khoá bằng biến môi trường.
        Không cần D1, không cần đăng nhập: dùng khi D1 hỏng hoặc khi
        chính tài khoản quản trị bị nghi. Đổi ở Cloudflare Dashboard
        hoặc `wrangler secret put` là có hiệu lực ngay.
     2. Bảng D1 heKhoang                    — Super Admin/Admin khoá/mở
        ngay trong ứng dụng (datKhoang), có lý do và HẠN tự mở. Đọc một
        lần mỗi 30 giây mỗi isolate, không thêm lượt D1 cho mỗi yêu cầu.
     3. TỰ NGẮT (cầu dao)                   — một khoang ném lỗi 500 liên
        tiếp (≥ 8 lần/60 giây trong một isolate) thì tự nghỉ 60 giây,
        lặp lại thì gấp đôi tới 10 phút; chạy lại được thì tự đóng mạch.
        Lỗi của một khoang không kéo cả Worker vào vòng lỗi/hoá đơn.

   HAI KHOANG KHÔNG BAO GIỜ KHOÁ ĐƯỢC TỪ TRONG ỨNG DỤNG:
     · cuuhe — cứu hệ + chính các cửa khoá/mở khoang. Khoá được nó là tự
       nhốt mình ngoài cửa.
     · cua   — đăng nhập/đăng ký. Khoá nó từ trong ứng dụng thì quản trị
       cũng không đăng nhập được để mở lại. Chỉ lớp 1 (env) khoá được.
   ═══════════════════════════════════════════════════════════════ */

import { VIEC_AI, VIEC_CUA } from './ve-chi-phi.js';

export const KHOANG = {
  cuuhe:    'Cứu hệ & điều khiển khoang',
  cua:      'Đăng nhập · đăng ký · bảo mật tài khoản',
  dongbo:   'Đồng bộ hồ sơ',
  ai:       'Trợ lý AI & Agent',
  phim:     'Xưởng phim',
  crm:      'CRM & chăm sóc khách',
  taichinh: 'Tài chính · kế toán · lương',
  thigiac:  'Thị giác · thương hiệu · kênh',
  congdong: 'Cộng đồng & thư viện',
  noidung:  'Nội dung · bài học · nâng cấp',
  taikhoan: 'Tài khoản · phân quyền · phòng ban',
  khac:     'Các việc còn lại'
};

const CUU_HE = new Set(['soatCuuHe', 'baoDongCuuHe', 'dongBangHe', 'moBangHe', 'truyHoiHe',
  'dsKhoang', 'datKhoang', 'sucKhoeHe']);
const KHONG_KHOA_TRONG_APP = new Set(['cuuhe', 'cua']);

/* Thứ tự quy tắc là thứ tự ưu tiên — quy tắc trên thắng. */
const QUY_TAC = [
  ['phim',     /^phim/],
  ['crm',      /^crm|Vip|Lead|KenhVeTinh|^lich365|^sinhNoiDungKenh/],
  ['ai',       /^ai[A-Z]|TroLy|Agent|AI$|Chatbot|^hoi[A-Z]|^lichSuChat|^soanBanNhap|^soanDeBai|^dieuPhoi|^soatDieuPhoi|^chamMotLuot|^luuNhanVat|^docNhanVat/],
  ['taichinh', /PhieuThu|Hoan$|HoaHong|ChungCu|^congNo|^banKe|^ganPhieu|^dongKy|^dsQuaHan|^doiSoat|^soNgay|^chot|^soatChot|^dsChot|KeToan|KhaiThue|Chi$|^soChi|DuyetChi|TaiChinh|GiaoDich|NganHang|Luong|ButToan|HoaDon|ToKhai|BaoCaoTC|CanDoi|GTGT|LuuChuyen|CongNo|ThanhToan|MienGiam|Gia$|^doiGia|^soDoiGia|^tongHop$|^nganHangBao|^xemTepKhach|^suaTepKhach|^dsTepKhach|^bayConSoCEO/],
  ['thigiac',  /ThiGiac|ThuongHieu|RaNgoai|KenhNgoai|DangBai|Tam[A-Z]?|^soDiRa|DieuNho|YTuong|GopY|ThayAnh/],
  ['congdong', /CongDong|^guiChuyen|TaiLieu|TinhHuongKhach/],
  ['taikhoan', /TaiKhoan|PhongBan|Quyen|^nangTang|KhoiPhucMatKhau/],
  ['noidung',  /Bai|NoiDung|^docBuoi|ChuanNghe|Trich|MienDich|NangCap|^thuXepCap|^duyetCap|^nhapKho|^traBoSung|^ghiPhatSinh|^loTrinh/],
  ['dongbo',   /^dongBo$|^capKhoa$/]
];

const DEM_KHOANG = new Map();
export function khoangCua(fn) {
  fn = String(fn || '');
  if (DEM_KHOANG.has(fn)) return DEM_KHOANG.get(fn);
  let k = 'khac';
  if (CUU_HE.has(fn)) k = 'cuuhe';
  else if (VIEC_CUA.has(fn) || /^doiMatKhau$|KhoaMat|^xacThucLai|^nhatKyAnToan$/.test(fn)) k = 'cua';
  else if (/^phim/.test(fn)) k = 'phim';
  else if (VIEC_AI.has(fn)) k = 'ai';
  else for (const [ten, re] of QUY_TAC) { if (re.test(fn)) { k = ten; break; } }
  if (DEM_KHOANG.size < 2000) DEM_KHOANG.set(fn, k);
  return k;
}

/* ═══════════ LỚP 2: KHOÁ TRONG D1 (đệm 30 giây) ═══════════ */
let DEM_D1 = {luc: 0, ds: {}};
const DEM_D1_MS = 30e3;

async function taoBang(db) {
  await db.prepare('CREATE TABLE IF NOT EXISTS heKhoang (khoang TEXT PRIMARY KEY, khoa INTEGER NOT NULL DEFAULT 0, ' +
    'lyDo TEXT, hetHan TEXT, boi TEXT, luc TEXT)').run();
}

async function docKhoaD1(db, bayGio) {
  if (!db) return {};
  if (bayGio - DEM_D1.luc < DEM_D1_MS) return DEM_D1.ds;
  let ds = {};
  try {
    const r = await db.prepare('SELECT khoang, lyDo, hetHan FROM heKhoang WHERE khoa = 1').all();
    for (const x of (r.results || [])) {
      if (x.hetHan && Date.parse(x.hetHan) <= bayGio) continue;
      ds[x.khoang] = {lyDo: x.lyDo || '', hetHan: x.hetHan || ''};
    }
  } catch (e) {
    /* Bảng chưa có (chưa ai khoá lần nào) hoặc D1 trục trặc: KHÔNG khoá
       thêm gì — D1 hỏng thì lam() cũng hỏng và cầu dao lớp 3 lo. */
    ds = DEM_D1.ds || {};
  }
  DEM_D1 = {luc: bayGio, ds};
  return ds;
}

function khoaEnv(env) {
  const s = String((env && env.GITA_KHOA_KHOANG) || '').trim();
  if (!s) return new Set();
  return new Set(s.split(/[\s,;]+/).filter(Boolean));
}

/* ═══════════ LỚP 3: CẦU DAO TỰ NGẮT (theo isolate) ═══════════ */
const CAU_DAO = new Map();   /* khoang → {loi:[mốc], ngatDen, lan} */
const NGUONG_LOI = 8, CUA_SO_MS = 60e3, NGHI_DAU_MS = 60e3, NGHI_TRAN_MS = 600e3;

export function ghiLoiKhoang(fn, bayGio) {
  const k = khoangCua(fn);
  if (k === 'cuuhe') return;
  bayGio = bayGio || Date.now();
  const c = CAU_DAO.get(k) || {loi: [], ngatDen: 0, lan: 0};
  c.loi = c.loi.filter(t => bayGio - t < CUA_SO_MS);
  c.loi.push(bayGio);
  if (c.loi.length >= NGUONG_LOI) {
    c.lan = Math.min(c.lan + 1, 6);
    c.ngatDen = bayGio + Math.min(NGHI_DAU_MS * Math.pow(2, c.lan - 1), NGHI_TRAN_MS);
    c.loi = [];
    console.error('KHOANG_TU_NGAT', k, 'lần', c.lan);
  }
  CAU_DAO.set(k, c);
}

export function ghiTotKhoang(fn) {
  const c = CAU_DAO.get(khoangCua(fn));
  if (c && !c.ngatDen) { c.lan = 0; c.loi = []; }
}

/* ═══════════ CỔNG: gọi TRƯỚC lam() ═══════════ */
export async function chanKhoang(fn, env, db, bayGio) {
  bayGio = bayGio || Date.now();
  const k = khoangCua(fn);
  if (k === 'cuuhe') return null;

  const en = khoaEnv(env);
  if (en.has(k) || (en.has('*') && k !== 'cua'))
    return traKhoa(k, 'Quản trị đã tạm khoá phần này ở máy chủ.', 300);

  const c = CAU_DAO.get(k);
  if (c && c.ngatDen > bayGio)
    return {ok: false, code: 'KHOANG_NGHI', khoang: k, thuLaiSau: Math.ceil((c.ngatDen - bayGio) / 1000),
      error: 'Phần "' + KHOANG[k] + '" đang tự nghỉ ít phút để hồi phục. Các phần khác vẫn chạy; dữ liệu trong máy vẫn nguyên.'};
  if (c && c.ngatDen && c.ngatDen <= bayGio) c.ngatDen = 0; /* nửa mở: cho thử lại */

  if (KHONG_KHOA_TRONG_APP.has(k)) return null;
  const d1 = await docKhoaD1(db, bayGio);
  if (d1[k]) {
    const con = d1[k].hetHan ? Math.max(30, Math.ceil((Date.parse(d1[k].hetHan) - bayGio) / 1000)) : 300;
    return traKhoa(k, d1[k].lyDo, Math.min(con, 3600));
  }
  return null;
}

function traKhoa(k, lyDo, thuLaiSau) {
  return {ok: false, code: 'KHOANG_KHOA', khoang: k, thuLaiSau: thuLaiSau,
    error: 'Phần "' + KHOANG[k] + '" đang tạm khoá' + (lyDo ? ' (' + String(lyDo).slice(0, 120) + ')' : '') +
      '. Các phần khác vẫn chạy bình thường; dữ liệu trong máy vẫn nguyên.'};
}

/* ═══════════ CỬA QUẢN TRỊ ═══════════ */
function laQuanTri(hoSo, BAC) { return (BAC[hoSo && hoSo.role] || 99) <= 2; }

export async function dsKhoang(y, env, db, hoSo, BAC) {
  if (!laQuanTri(hoSo, BAC)) return {ok: false, error: 'Chỉ Super Admin/Admin xem được khoang hệ thống.'};
  const bayGio = Date.now();
  DEM_D1.luc = 0;
  const d1 = await docKhoaD1(db, bayGio), en = khoaEnv(env);
  return {ok: true, ds: Object.keys(KHOANG).map(k => {
    const c = CAU_DAO.get(k);
    return {khoang: k, ten: KHOANG[k], khoaApp: !!d1[k], lyDo: d1[k] ? d1[k].lyDo : '',
      hetHan: d1[k] ? d1[k].hetHan : '', khoaEnv: en.has(k), tuNgat: !!(c && c.ngatDen > bayGio),
      khoaDuoc: !KHONG_KHOA_TRONG_APP.has(k)};
  })};
}

export async function datKhoang(y, env, db, hoSo, BAC, Kho) {
  if (!laQuanTri(hoSo, BAC)) return {ok: false, error: 'Chỉ Super Admin/Admin khoá/mở được khoang.'};
  const k = String(y.khoang || '');
  if (!KHOANG[k]) return {ok: false, error: 'Không có khoang này.'};
  if (KHONG_KHOA_TRONG_APP.has(k))
    return {ok: false, error: 'Khoang "' + KHOANG[k] + '" không khoá từ trong ứng dụng (tránh tự nhốt). Dùng biến GITA_KHOA_KHOANG ở máy chủ.'};
  const khoa = y.khoa ? 1 : 0;
  const phut = Math.max(0, Math.min(Number(y.phut) || 0, 7 * 24 * 60));
  const hetHan = khoa && phut ? new Date(Date.now() + phut * 60e3).toISOString() : '';
  const lyDo = String(y.lyDo || '').slice(0, 200);
  await taoBang(db);
  await db.prepare('INSERT INTO heKhoang (khoang,khoa,lyDo,hetHan,boi,luc) VALUES (?,?,?,?,?,?) ' +
    'ON CONFLICT(khoang) DO UPDATE SET khoa=excluded.khoa, lyDo=excluded.lyDo, hetHan=excluded.hetHan, boi=excluded.boi, luc=excluded.luc')
    .bind(k, khoa, lyDo, hetHan, hoSo.u || '', new Date().toISOString()).run();
  DEM_D1.luc = 0;
  if (!khoa) { const c = CAU_DAO.get(k); if (c) { c.ngatDen = 0; c.lan = 0; c.loi = []; } }
  try { await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: khoa ? 'KHOA_KHOANG' : 'MO_KHOANG',
    doiTuong: k, chiTiet: (lyDo || '—') + (hetHan ? ' · tự mở ' + hetHan : '')}); } catch (e) {}
  return {ok: true, khoang: k, khoa: !!khoa, hetHan};
}

/* Bộ dọn đêm: xoá dòng khoá đã hết hạn (cho bảng gọn, nhật ký rõ). */
export async function donKhoangHetHan(db) {
  try {
    const r = await db.prepare("UPDATE heKhoang SET khoa = 0 WHERE khoa = 1 AND hetHan <> '' AND hetHan <= ?")
      .bind(new Date().toISOString()).run();
    DEM_D1.luc = 0;
    return (r && r.meta && r.meta.changes) || 0;
  } catch (e) { return 0; }
}

export function _xoaKhoang() { CAU_DAO.clear(); DEM_D1 = {luc: 0, ds: {}}; }
