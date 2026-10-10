/* ═══════════════════════════════════════════════════════════════
   NGOẠI LỆ CÓ TÊN · LƯU PHIM RA MÁY (N4 · chốt 10/10/2026)

   Luật nền: khách hàng không tải bất cứ dữ liệu nào ra máy. Xưởng phim
   thì phải ra được tệp .mp4 — không ra được thì nó không phải xưởng phim.
   Hai điều ấy không mâu thuẫn nếu ngoại lệ có TÊN, có NGƯỜI và có SỔ:

   - Chỉ R01–R02 (quyền qt_trang — đúng quyền mở màn Xưởng phim).
   - Mỗi lượt lưu ghi một dòng nhật ký: ai, tệp gì, loại gì, cỡ bao nhiêu.
     Nhật ký KHÔNG giữ nội dung tệp — chỉ giữ dấu.
   - Máy khách gọi cửa này TRƯỚC khi mở hộp lưu; cửa từ chối thì không lưu.
     Ghi sổ không được thì cũng không lưu: một ngoại lệ không để lại dấu
     là một đường tải tệp đội lốt ngoại lệ.

   Vì sao chặn ở máy chủ chứ không chỉ ở màn hình: lọc trên màn hình không
   phải bảo vệ. Ai gọi thẳng G.luuTepPhim trong bảng điều khiển vẫn phải
   qua cửa này, và cửa này đọc vai từ phiên, không đọc từ thân yêu cầu.
   ═══════════════════════════════════════════════════════════════ */
import { Kho } from './nen.js';
import { BAC, roleOf } from './vai-tro.js';

export const LOAI_LUU_PHIM = Object.freeze(['phim', 'khung', 'phuDe', 'prompt', 'cauHinh']);
export const TRAN_TEN = 120;

export async function ghiLuuPhim(y, env, db, hoSo) {
  y = y || {};
  const bac = BAC[roleOf(hoSo)];
  if (!bac || bac > 2) {
    return { ok: false, error: 'NOPERM_LUU', vi: 'Lưu tệp ra máy chỉ dành cho Super Admin và Admin hệ thống (ngoại lệ N4).' };
  }
  const loai = String(y.loai || '');
  if (LOAI_LUU_PHIM.indexOf(loai) < 0) {
    return { ok: false, error: 'LOAI_LA', vi: 'Loại tệp không nằm trong danh sách được lưu: ' + LOAI_LUU_PHIM.join(', ') + '.' };
  }
  const ten = String(y.ten || '').replace(/[\u0000-\u001f]/g, '').slice(0, TRAN_TEN);
  if (!ten) return { ok: false, error: 'THIEU_TEN', vi: 'Thiếu tên tệp.' };
  const co = Math.max(0, Math.floor(+y.co || 0));
  const man = String(y.man || '').slice(0, 40);
  await Kho.ghiNhatKy(db, {
    uid: hoSo.uid, username: hoSo.u, viec: 'LUU_TEP_PHIM',
    doiTuong: ten, chiTiet: loai + ' · ' + co + ' byte' + (man ? ' · ' + man : '')
  });
  return { ok: true, vi: 'Đã ghi sổ lượt lưu.' };
}
