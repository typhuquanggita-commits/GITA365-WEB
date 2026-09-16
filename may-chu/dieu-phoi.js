/* ═══════════════════════════════════════════════════════════════
   GITA 365 — ĐIỀU PHỐI TRỢ LÝ · MÁY CHỦ  (9.99.107)

   Tầng điều phối cho một trăm trợ lý siêu cấp. Bộ não GITA365 cao nhất;
   điều phối chỉ TÌM ĐÚNG trợ lý và DẪN tới đúng cửa — nó KHÔNG tự ra
   tay và KHÔNG bỏ qua cổng của cửa ấy.

   ══ VÌ SAO ĐIỀU PHỐI KHÔNG ĐƯỢC TỰ RA TAY ══

   Một cửa điều phối mà tự chạy việc là một cửa hậu cho cả trăm trợ lý:
   mọi cổng (Điều 13, cấp quyền AI, ba chữ ký) nằm ở TỪNG cửa thật, nên
   nếu điều phối chạy thay thì nó đi vòng qua tất cả. Nên `dieuPhoiTroLy`
   chỉ trả về một BẢN KẾ HOẠCH — trợ lý nào, cửa nào, cổng nào phải qua —
   rồi dừng. Việc thật vẫn phải gọi đúng cửa ấy, và cửa ấy tự kiểm cổng.
   Mục 110 và bộ thử worker canh rằng mô-đun này KHÔNG có một câu
   INSERT/UPDATE nào và KHÔNG gọi một cửa ghi nào.

   ══ TỰ HOÀN THIỆN ĐI QUA VÒNG CÓ CỔNG ══

   `tuHoanThienTroLy` KHÔNG tự sửa gì — nó gói yêu cầu rồi TRỎ thẳng vào
   `deXuatNangCap` (vòng năm cửa, bảy vùng không tự chạm). Chạm vùng cấm
   thì chính vòng ấy trả `ngoaiDuong`, không phải một luật thứ hai ở đây.
   ═══════════════════════════════════════════════════════════════ */

import { Kho } from './nen.js';
import { deXuatNangCap } from './tu-nang-cap.js';

function laNguoiNha(hoSo) {
  return /^R(0[1-9]|1[0-2])$/.test(String((hoSo || {}).role || ''));
}

/* Bảy luật trần — bản tóm ở máy chủ để `soatDieuPhoi` trả về; nội dung
   đầy đủ nằm ở kho G.DP_TRAN phía màn. Đây KHÔNG phải bản chép của một
   bảng cấm (hiến pháp/hàng rào) — nó là luật của chính tầng điều phối. */
const DP_TRAN_MC = ['DP1', 'DP2', 'DP3', 'DP4', 'DP5', 'DP6', 'DP7'];

/* ═══════════════ ĐIỀU PHỐI: XÁC MINH CỬA, TRỎ TỚI ĐÚNG NƠI ═══════════════

   ĐỌC KỸ — bản 9.99.107 dựng cửa này thành một CÁI ECHO: nó nhận bừa
   một chuỗi, không đối chiếu gì, rồi khai "đã tìm trợ lý sở hữu cửa X"
   kể cả khi X không tồn tại. Một tổ soi đối kháng bắt đúng: đó là một
   lời nói dối mang dấu hệ thống (cùng luật daGoNgoai/den/conHan), và cả
   tính năng thành một tấm áp phích (mục 88).

   Nay cửa này CÓ RĂNG và FALSIFIABLE: `khoaSoHuu` phải là một cửa THẬT
   đã đăng ký (đối chiếu `danhSachCua` = CAN_PHIEN của worker truyền
   vào). Cửa lạ → KHONGCUA. Không có danh sách để đối chiếu → ĐÓNG
   (KHONGDANHSACH), không suy đoán. Đối chiếu XONG rồi mới ghi nhật ký —
   không làm bẩn sổ bằng một cửa không có thật.

   Vẫn KHÔNG tự ra tay: khoá sở hữu = một cửa, mỗi cửa đúng một trợ lý
   (bất biến "đôi một khác nhau" của roster). Điều phối XÁC NHẬN cửa có
   thật rồi dừng; việc thật gọi đúng cửa ấy và cửa tự kiểm cổng. Nói
   THẲNG là nó chỉ xác nhận + trỏ, không "tìm ra" một trợ lý bằng một
   phép tra không tồn tại. */
export async function dieuPhoiTroLy(y, env, db, hoSo, danhSachCua) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Điều phối trợ lý mở cho R01–R12.' };
  const x = y || {};
  const khoaSoHuu = String(x.khoaSoHuu || x.cua || '').trim();
  if (!khoaSoHuu) return { ok: false, code: 'THIEUO',
    error: 'Thiếu khoá sở hữu (tên cửa) để đối chiếu.' };

  /* Đối chiếu TRƯỚC KHI GHI. Không có danh sách thì đóng, không đoán. */
  const cua = (danhSachCua && typeof danhSachCua.includes === 'function') ? danhSachCua : null;
  if (!cua) return { ok: false, code: 'KHONGDANHSACH',
    error: 'Điều phối không có danh sách cửa để đối chiếu — đóng, không suy đoán.' };
  if (!cua.includes(khoaSoHuu)) return { ok: false, code: 'KHONGCUA',
    error: 'Khoá sở hữu "' + khoaSoHuu + '" KHÔNG phải một cửa thật đã đăng ký — ' +
      'không trợ lý nào sở hữu nó.' };

  /* Cửa đã xác minh có thật → mới ghi nhật ký lượt điều phối. */
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u,
    viec: 'DP_DIEUPHOI', doiTuong: khoaSoHuu });

  return { ok: true,
    quyetDinh: 'daDinhTuyen',
    khoaSoHuu,
    boNaoCaoNhat: true,
    khongTuRaTay: true,
    khongBoQuaCong: true,
    vi: 'Cửa "' + khoaSoHuu + '" hợp lệ (CÓ THẬT, đã đăng ký trong worker). Điều phối CHỈ ' +
      'xác nhận cửa có thật rồi dừng — việc thật phải gọi ĐÚNG cửa này, và cửa tự kiểm cổng ' +
      'của nó. Không tự ra tay, không bỏ qua cổng. ' +
      'GHI CHÚ (9.99.112): worker đối chiếu với CAN_PHIEN (mọi cửa có phiên), nên KHÔNG ' +
      'khẳng định ở ĐÂY rằng cửa này có đúng một trợ lý sở hữu — đó là bất biến của ROSTER ' +
      '100 cửa (khoá đôi một khác nhau), canh ở mục 110 lúc dựng. Cửa ngoài roster vẫn có ' +
      'thật và tự đủ cổng; buộc khoá sở hữu ∈ roster ở máy chủ cần roster server-side (DP-03).' };
}

/* ═══════════════ ĐỌC TRẦN ĐIỀU PHỐI ═══════════════ */
export async function soatDieuPhoi(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Trần điều phối mở cho R01–R12.' };
  return { ok: true, tran: DP_TRAN_MC, soTran: DP_TRAN_MC.length,
    boNaoCaoNhat: true,
    nhac: 'Một trăm trợ lý, mỗi trợ lý một khoá sở hữu (một cửa) nên không xung đột. ' +
      'Tự hoàn thiện đi qua vòng nâng cấp có cổng; cấp quyền cho trợ lý ở lớp Quyền năng AI.' };
}

/* ═══════════════ TỰ HOÀN THIỆN — TRỎ VÀO VÒNG CÓ CỔNG ═══════════════

   Không tự sửa gì; gói yêu cầu rồi gọi thẳng deXuatNangCap. Vòng ấy có
   bảy vùng không tự chạm (K1–K7) — chạm vào là chính nó trả ngoaiDuong,
   không cần một luật thứ hai ở đây. */
export async function tuHoanThienTroLy(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Tự hoàn thiện trợ lý mở cho R01–R12.' };
  const x = y || {};
  const viec = String(x.viec || '').trim();
  const vung = String(x.vung || '').trim();
  const luiLai = String(x.luiLai || '').trim();
  if (!viec || !vung)
    return { ok: false, code: 'THIEUO',
      error: 'Tự hoàn thiện phải khai VIỆC GÌ (cải tiến gì) và VÙNG NÀO BỊ CHẠM.' };
  /* Trỏ thẳng vòng nâng cấp — không dựng đường nâng cấp thứ hai. */
  return await deXuatNangCap(
    { viec: 'Trợ lý tự hoàn thiện: ' + viec, vung, luiLai },
    env, db, hoSo);
}
