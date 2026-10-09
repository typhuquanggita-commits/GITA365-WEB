/* ═══════════════════════════════════════════════════════════════
   GITA 365 — ĐO HÀNH VI KHÁCH TRÊN TRANG CÔNG KHAI

   Chủ hệ hỏi: khách thao tác trên trang giới thiệu thì tôi có đo được
   không? Tới 9/10/2026 câu trả lời là KHÔNG — các trang công khai không
   gửi một tín hiệu nào về hệ.

   Ba luật, và vì sao:

   1. ĐO Ở MÁY CHỦ CỦA HỌC VIỆN, KHÔNG DÙNG DỊCH VỤ ĐO NGOÀI. Gắn một mã đo
      của bên thứ ba là đưa hành vi của từng phụ huynh cho bên ấy — đúng
      thứ form liên hệ vừa thôi làm với formspree.
   2. KHÔNG NHẬN DẠNG AI. Không cookie, không địa chỉ IP, không mã người
      xem. Mỗi tín hiệu chỉ cộng MỘT vào một ô đếm theo
      (ngày · trang · việc · nhãn · nguồn · loại máy). Câu hỏi của chủ hệ là
      "bao nhiêu người làm việc X", không phải "ai làm việc X" — và một bảng
      đếm thì không thể bị dùng để trả lời câu sau.
   3. MỌI GIÁ TRỊ ĐỀU QUA DANH SÁCH TRẮNG. Cửa này không cần phiên, nên ai
      cũng gọi được. Nhận chữ tự do là để người lạ đẻ ra vô số dòng rác,
      hoặc nhét chữ của họ vào màn hình quản trị. Giá trị lạ → 'khac'.

   Giới hạn, nói thẳng: không có mã người xem nên KHÔNG đếm được "người
   duy nhất". 'phienMoi' đếm số lần mở trang lần đầu trong một phiên trình
   duyệt (cờ sessionStorage ở máy khách) — gần với số lượt ghé thăm, không
   phải số người. Máy quét có thể đếm thêm; đừng đọc con số như số khách.
   ═══════════════════════════════════════════════════════════════ */
import { BAC } from './vai-tro.js';

export const TRANG = ['landing', 've-chung-toi', 'dich-vu', 'bang-gia', 'lien-he', 'cau-hoi-thuong-gap', 'khac'];
export const SU = ['xem', 'phienMoi', 'cuon50', 'cuon90', 'bamCta', 'goiDien', 'moUngDung', 'moForm',
  'guiForm', 'guiFormOk', 'guiFormLoi', 'faqMo', 'doiNgonNgu'];
export const NGUON = ['truc-tiep', 'google', 'facebook', 'zalo', 'youtube', 'tiktok', 'noi-bo', 'khac'];
const MAY = ['dt', 'may'];
const NHAN = /^[a-z0-9-]{1,32}$/;
const GIU_NGAY = 400;

let daDung = false;
async function damBaoBang(db) {
  if (daDung) return;
  /* Cùng lối ap-dung.js: mô-đun tự dựng bảng của mình, nên máy chủ thật có
     bảng ngay lượt đầu dù csdl.sql chưa được chạy lại. */
  await db.prepare('CREATE TABLE IF NOT EXISTS doTrang (ngay TEXT NOT NULL, trang TEXT NOT NULL, su TEXT NOT NULL, ' +
    "nhan TEXT NOT NULL DEFAULT '', nguon TEXT NOT NULL DEFAULT 'khac', may TEXT NOT NULL DEFAULT 'may', " +
    'dem INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (ngay, trang, su, nhan, nguon, may))').run();
  daDung = true;
}

/* Ngày theo giờ Việt Nam: Workers chạy UTC, lệch bảy tiếng thì lượt xem
   buổi sáng sớm rơi về hôm qua. */
function ngayVN(ms) { return new Date((ms || Date.now()) + 7 * 3600e3).toISOString().slice(0, 10); }
function trong(ds, v, mac) { return ds.indexOf(v) >= 0 ? v : mac; }

export async function ghiLuotTrang(y, env, db) {
  const su = trong(SU, String(y.su || ''), '');
  if (!su) return { ok: false, code: 'SU', error: 'Việc không hợp lệ.' };
  const trang = trong(TRANG, String(y.trang || ''), 'khac');
  const nhan = NHAN.test(String(y.nhan || '')) ? String(y.nhan) : '';
  const nguon = trong(NGUON, String(y.nguon || ''), 'khac');
  const may = trong(MAY, String(y.may || ''), 'may');
  await damBaoBang(db);
  await db.prepare('INSERT INTO doTrang (ngay, trang, su, nhan, nguon, may, dem) VALUES (?,?,?,?,?,?,1) ' +
    'ON CONFLICT(ngay, trang, su, nhan, nguon, may) DO UPDATE SET dem = dem + 1')
    .bind(ngayVN(), trang, su, nhan, nguon, may).run();
  return { ok: true };
}

/* Đọc: chỉ cấp quản lý (R01–R03). Trả SỐ ĐẾM đã gộp, không có gì để lần
   ra một người. */
export async function docDoTrang(y, env, db, hoSo) {
  if (!hoSo || !(BAC[hoSo.role] <= 3)) return { ok: false, code: 'NOPERM', error: 'Chỉ Super Admin, Admin và Giám đốc xem được số đo trang công khai.' };
  const soNgay = [7, 30, 90].indexOf(Number(y.soNgay)) >= 0 ? Number(y.soNgay) : 30;
  await damBaoBang(db);
  const tu = ngayVN(Date.now() - (soNgay - 1) * 86400e3);
  const ds = ((await db.prepare('SELECT ngay, trang, su, nhan, nguon, may, dem FROM doTrang WHERE ngay >= ?')
    .bind(tu).all()).results) || [];
  const cong = (loc) => ds.filter(loc).reduce((s, r) => s + (r.dem || 0), 0);
  const nhom = (khoa, loc) => {
    const o = {};
    ds.filter(loc).forEach(r => { o[r[khoa]] = (o[r[khoa]] || 0) + (r.dem || 0); });
    return Object.keys(o).map(k => ({ k, n: o[k] })).sort((a, b) => b.n - a.n);
  };
  const phien = cong(r => r.su === 'phienMoi');
  const pheu = [
    { su: 'phienMoi', ten: 'Lượt ghé thăm', n: phien },
    { su: 'bamCta', ten: 'Bấm nút đăng ký / tư vấn', n: cong(r => r.su === 'bamCta') },
    { su: 'moForm', ten: 'Bắt đầu điền form', n: cong(r => r.su === 'moForm') },
    { su: 'guiFormOk', ten: 'Gửi form thành công', n: cong(r => r.su === 'guiFormOk') }
  ];
  const ngayDs = {};
  ds.filter(r => r.su === 'xem').forEach(r => { ngayDs[r.ngay] = (ngayDs[r.ngay] || 0) + r.dem; });
  return {
    ok: true, soNgay, tuNgay: tu,
    tong: { xem: cong(r => r.su === 'xem'), phien, goiDien: cong(r => r.su === 'goiDien'),
      moUngDung: cong(r => r.su === 'moUngDung'), guiFormLoi: cong(r => r.su === 'guiFormLoi'),
      cuon90: cong(r => r.su === 'cuon90') },
    pheu,
    /* Tỷ lệ chỉ tính khi có mẫu — 0/0 không phải 0%. */
    tyLeChuyenDoi: phien ? Math.round(pheu[3].n / phien * 1000) / 10 : undefined,
    theoTrang: nhom('trang', r => r.su === 'xem'),
    theoNguon: nhom('nguon', r => r.su === 'phienMoi'),
    theoMay: nhom('may', r => r.su === 'phienMoi'),
    nutBam: nhom('nhan', r => r.su === 'bamCta' && r.nhan),
    theoNgay: Object.keys(ngayDs).sort().map(k => ({ ngay: k, n: ngayDs[k] }))
  };
}

/* Lịch dọn (worker.js → HAN): bảng chỉ có số đếm, nhưng giữ mãi thì lớn
   mãi. Hơn một năm là đủ so cùng kỳ. */
export const DON_DO_TRANG = {
  bang: 'doTrang', cau: 'DELETE FROM doTrang WHERE ngay < ?',
  dv: () => [ngayVN(Date.now() - GIU_NGAY * 86400e3)],
  vi: 'số đếm hành vi trang công khai — không mang dữ liệu người; giữ ' + GIU_NGAY + ' ngày để so cùng kỳ'
};
