/* ═══════════════════════════════════════════════════════════════
   GITA 365 — HỆ THANH TRA CẤP CAO · MÁY CHỦ  (9.99.124)

   Chủ hệ: "10 thanh tra FBI khó tính nhất, chuẩn cao nhất (Google · FBI ·
   Claude · ChatGPT), soi 100 trợ lý VÀ soi chéo lẫn nhau. Super Admin có
   quyền lực cao nhất: xoá trợ lý, xoá THANH TRA nếu vi phạm. Một thư mục
   báo cáo thanh tra để cập nhật và xử lý vấn đề."

   Bốn cửa, và cái RĂNG nằm ở đây (không ở màn hình):

   1. `xoaTroLy`      — R01 loại một trợ lý vi phạm khỏi vòng phục vụ
   2. `xoaThanhTra`   — R01 loại một THANH TRA vi phạm (không ai trên Super Admin)
   3. `ghiBaoCaoThanhTra` — R01–R02 ghi một dòng báo cáo/xử lý
   4. `docBaoCaoThanhTra` — R01–R02 đọc thư mục báo cáo, xếp mới trước

   LUẬT CỦA CẢ TỆP:
   - Quyền xoá là VÙNG ĐỎ: CHỈ R01, PHẢI viết lý do (≥10 ký tự), và mỗi
     lượt vào sổ `thanhTraSo` + nhật ký `audit`. Một quyền lực xoá mà
     không để lại dấu là một quyền lực không ai truy được — đúng thứ
     chính hệ thanh tra sinh ra để chống.
   - Cổng đứng TRƯỚC câu INSERT (mục 86·87·91·93·103·114). Cổng sau khi
     ghi thì nó chỉ là lời nhắc.
   - Xoá là ĐÁNH DẤU một quyết định, không phá dữ liệu vận hành. Sổ giữ
     lịch sử: khôi phục được, và tranh chấp về sau đọc lại được.
   ═══════════════════════════════════════════════════════════════ */

import { laR01, tenNguoiDung as ten } from './vai-tro.js';
function laR01R02(hoSo) {
  var r = String((hoSo || {}).role || '');
  return r === 'R01' || r === 'R02';
}
function gonLyDo(s) { return String(s == null ? '' : s).trim(); }

async function ghiAudit(db, viec, boiAi, chiTiet) {
  /* LỖI CŨ (sửa 9.99.236): INSERT dùng cột `boiAi` KHÔNG có trong lược đồ
     audit (id,luc,uid,username,viec,doiTuong,chiTiet) — câu ném lỗi, bị
     try/catch nuốt, nên MỌI lượt xoá của thanh tra ÂM THẦM không vào sổ.
     Đúng thứ hệ thanh tra sinh ra để chống: một quyền lực xoá không để lại
     dấu. Nay ghi đúng cột: người làm → `username`, tên việc → `viec`. */
  try {
    await db.prepare('INSERT INTO audit (id,luc,uid,username,viec,doiTuong,chiTiet) VALUES (?,?,?,?,?,?,?)')
      .bind('TT-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        new Date().toISOString(), '', boiAi || '', viec || '', '', chiTiet || '').run();
  } catch (e) { /* audit hỏng không được chặn việc chính, nhưng đã cố */ }
}

/* ── 1 · Xoá (loại) một TRỢ LÝ vi phạm ─────────────────────────
   Chỉ R01. Lý do bắt buộc. Ghi vào sổ TRƯỚC khi coi là xong. */
export async function xoaTroLy(y, env, db, hoSo) {
  if (!laR01(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Chỉ Super Admin (R01) được xoá trợ lý.' };
  var d = y || {};
  var doiTuong = String(d.troLy || d.doiTuong || '').trim();
  var lyDo = gonLyDo(d.lyDo);
  if (!doiTuong) return { ok: false, code: 'THIEUDT', error: 'Thiếu trợ lý cần xoá.' };
  if (lyDo.length < 10) return { ok: false, code: 'THIEULYDO',
    error: 'Phải viết lý do xoá (tối thiểu 10 ký tự) — quyền xoá là Vùng Đỏ.' };
  var luc = new Date().toISOString();
  await db.prepare(
    'INSERT INTO thanhTraSo (loai,doiTuong,mucDo,noiDung,boiAi,luc) VALUES (?,?,?,?,?,?)')
    .bind('xoaTroLy', doiTuong, String(d.mucDo || 'nang'), lyDo, ten(hoSo), luc).run();
  await ghiAudit(db, 'THANHTRA_XOA_TROLY', ten(hoSo), doiTuong + ' · ' + lyDo);
  return { ok: true, doiTuong: doiTuong, luc: luc,
    vi: 'Đã ghi quyết định xoá trợ lý ' + doiTuong + ' vào sổ thanh tra. Có lịch sử, khôi phục được.' };
}

/* ── 2 · Xoá (loại) một THANH TRA vi phạm ──────────────────────
   Không ai trên Super Admin: kể cả thanh tra cũng bị R01 loại nếu
   vi phạm. Cùng luật lý-do-bắt-buộc + ghi sổ trước. */
export async function xoaThanhTra(y, env, db, hoSo) {
  if (!laR01(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Chỉ Super Admin (R01) được xoá thanh tra.' };
  var d = y || {};
  var doiTuong = String(d.thanhTra || d.doiTuong || '').trim();
  var lyDo = gonLyDo(d.lyDo);
  if (!doiTuong) return { ok: false, code: 'THIEUDT', error: 'Thiếu thanh tra cần xoá.' };
  if (lyDo.length < 10) return { ok: false, code: 'THIEULYDO',
    error: 'Phải viết lý do xoá thanh tra (tối thiểu 10 ký tự).' };
  var luc = new Date().toISOString();
  await db.prepare(
    'INSERT INTO thanhTraSo (loai,doiTuong,mucDo,noiDung,boiAi,luc) VALUES (?,?,?,?,?,?)')
    .bind('xoaThanhTra', doiTuong, String(d.mucDo || 'nang'), lyDo, ten(hoSo), luc).run();
  await ghiAudit(db, 'THANHTRA_XOA_THANHTRA', ten(hoSo), doiTuong + ' · ' + lyDo);
  return { ok: true, doiTuong: doiTuong, luc: luc,
    vi: 'Đã ghi quyết định xoá thanh tra ' + doiTuong + '. Super Admin đứng trên cả thanh tra.' };
}

/* ── 3 · Ghi một dòng BÁO CÁO / xử lý vấn đề ───────────────────
   R01–R02. Mỗi báo cáo khai đối tượng (trợ lý/thanh tra nào), mức độ,
   và nội dung. Đây là "thư mục báo cáo" — cập nhật liên tục. */
export async function ghiBaoCaoThanhTra(y, env, db, hoSo) {
  if (!laR01R02(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Ghi báo cáo thanh tra mở cho R01–R02.' };
  var d = y || {};
  var noiDung = gonLyDo(d.noiDung);
  if (noiDung.length < 5) return { ok: false, code: 'THIEUND',
    error: 'Báo cáo phải có nội dung (tối thiểu 5 ký tự).' };
  var luc = new Date().toISOString();
  await db.prepare(
    'INSERT INTO thanhTraSo (loai,doiTuong,mucDo,noiDung,boiAi,luc) VALUES (?,?,?,?,?,?)')
    .bind('baoCao', String(d.doiTuong || ''), String(d.mucDo || 'thuong'), noiDung, ten(hoSo), luc).run();
  await ghiAudit(db, 'THANHTRA_BAOCAO', ten(hoSo), String(d.doiTuong || '') + ' · ' + noiDung.slice(0, 60));
  return { ok: true, luc: luc, vi: 'Đã ghi vào thư mục báo cáo thanh tra.' };
}

/* ── 4 · Đọc thư mục báo cáo — mới trước ───────────────────────
   R01–R02. Nêu RIÊNG ba loại (báo cáo · xoá trợ lý · xoá thanh tra)
   để một quyết định xoá không lẫn vào một dòng ghi chú thường. */
export async function docBaoCaoThanhTra(y, env, db, hoSo) {
  if (!laR01R02(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Thư mục báo cáo thanh tra mở cho R01–R02.' };
  var gioiHan = Math.min(Math.max(parseInt((y || {}).gioiHan, 10) || 200, 1), 500);
  var r = await db.prepare(
    'SELECT loai,doiTuong,mucDo,noiDung,boiAi,luc FROM thanhTraSo ORDER BY luc DESC, rowid DESC LIMIT ?')
    .bind(gioiHan).all();
  var ds = (r && r.results) || [];
  return {
    ok: true,
    tong: ds.length,
    baoCao: ds.filter(function (x) { return x.loai === 'baoCao'; }),
    xoaTroLy: ds.filter(function (x) { return x.loai === 'xoaTroLy'; }),
    xoaThanhTra: ds.filter(function (x) { return x.loai === 'xoaThanhTra'; }),
    vi: 'Ba loại nêu riêng — một quyết định xoá không lẫn vào ghi chú thường.'
  };
}
