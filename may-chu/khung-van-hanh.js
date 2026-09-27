/* ═══════════════════════════════════════════════════════════════
   GITA 365 — KHUNG VẬN HÀNH · MÁY CHỦ  (Harness Engineering · V20)

   Tầng chuẩn hoá cách Bộ não điều phối 100 trợ lý. Hai cửa:
     soatKhungVanHanh — đọc năm trụ + bốn luật (chỉ đọc).
     chamMotLuot      — bộ chấm mỗi lượt: chạy năm trụ, trả VERDICT.

   ══ chamMotLuot CÓ RĂNG và KHÔNG TỰ RA TAY ══

   Đây là chỗ khác một tấm áp phích (bài học điều phối 9.99.107 bản đầu là
   echo không đo gì). Bộ chấm nhận một lượt trợ lý định ra tay và kiểm năm
   trụ THẬT; thiếu trụ nào trả về mã hỏng của trụ ấy. Phá-thử-đỏ-được: một
   câu thử sai (cửa lạ · chạm vùng cấm · thiếu tự kiểm · trùng khoá · thiếu
   ngữ cảnh) làm `dat=false` đúng chỗ; câu thử lành `dat=true`.

   Bộ chấm CHỈ trả verdict rồi dừng — KHÔNG có câu ghi thẳng, KHÔNG gọi
   một cửa ghi nào, KHÔNG bỏ qua cổng. Cổng thật vẫn nằm ở TỪNG cửa. Nó
   ghi một dòng nhật ký lượt chấm (qua Kho.ghiNhatKy — cùng lối dieuPhoi
   9.99.107) để có vết, chứ không tự làm việc thay trợ lý.

   ══ HE2 ĐO HAI ĐẦU ĐỘC LẬP (luật 9.99.84) ══

   Cửa hợp lệ = khoá sở hữu ∈ danh sách cửa THẬT (worker truyền CAN_PHIEN).
   Không có danh sách thì ĐÓNG, không suy đoán — cùng lối dieuPhoiTroLy.
   ═══════════════════════════════════════════════════════════════ */

import { Kho } from './nen.js';

function laNguoiNha(hoSo) {
  return /^R(0[1-9]|1[0-2])$/.test(String((hoSo || {}).role || ''));
}

/* Năm mã trụ — bản tóm ở máy chủ để soatKhungVanHanh trả về; nội dung
   đầy đủ nằm ở kho G.HE_TRU phía màn. KHÔNG phải bản chép của một bảng
   cấm — đây là mã của chính tầng khung vận hành. */
const HE_TRU_MC = ['HE1', 'HE2', 'HE3', 'HE4', 'HE5'];

/* Vùng bất khả chạm — TRỎ tới bảng thật, không chép nội dung của chúng.
   Một lượt trợ lý khai `chamVung` rơi vào đây thì bị chặn (HE3). */
const VUNG_CAM = ['hienPhap', 'hangRao', 'khoaSoHuu', 'roster', 'duongNangCap', 'gia', 'quyen'];

/* ═══════════════ ĐỌC NĂM TRỤ + BỐN LUẬT ═══════════════ */
export async function soatKhungVanHanh(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Khung vận hành mở cho R01–R12.' };
  return { ok: true,
    ma: 'V20',
    tru: HE_TRU_MC, soTru: HE_TRU_MC.length,
    vungCam: VUNG_CAM,
    boNaoCaoNhat: true,
    nhac: 'Năm trụ: ngữ cảnh · cổng đúng · gác hiến pháp · chống trùng · tự kiểm. Mỗi trụ đo ' +
      'được ở bộ chấm mỗi lượt. Đạt V20 = cả năm trụ có răng. Bộ chấm KHÔNG tự ra tay.' };
}

/* ═══════════════ BỘ CHẤM MỖI LƯỢT — VERDICT, KHÔNG RA TAY ═══════════════

   y: { khoaSoHuu, nguCanh, chamVung, tuKiem, khoaDaGiu:[…] }
   Trả về { ok, dat, lots:[…], … }. dat=true khi không trụ nào hỏng. */
export async function chamMotLuot(y, env, db, hoSo, danhSachCua) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Bộ chấm khung vận hành mở cho R01–R12.' };
  const x = y || {};
  const khoaSoHuu = String(x.khoaSoHuu || x.cua || '').trim();
  const nguCanh = String(x.nguCanh || '').trim();
  const chamVung = String(x.chamVung || '').trim();
  const tuKiem = String(x.tuKiem || '').trim();
  const daGiu = Array.isArray(x.khoaDaGiu) ? x.khoaDaGiu : [];

  const cua = (danhSachCua && typeof danhSachCua.includes === 'function') ? danhSachCua : null;
  if (!cua) return { ok: false, code: 'KHONGDANHSACH',
    error: 'Bộ chấm không có danh sách cửa để đối chiếu — đóng, không suy đoán.' };

  const lots = [];
  /* HE1 · ngữ cảnh có mặt trước lượt */
  if (!nguCanh) lots.push('NGUCANH');
  /* HE2 · khoá sở hữu là một cửa THẬT (đo hai đầu độc lập) */
  if (!khoaSoHuu || !cua.includes(khoaSoHuu)) lots.push('KHONGCUA');
  /* HE3 · không chạm vùng bất khả sửa */
  if (chamVung && VUNG_CAM.indexOf(chamVung) >= 0) lots.push('VUNGCAM');
  /* HE4 · khoá không trùng trong lượt (chống hai trợ lý cùng ra tay) */
  if (khoaSoHuu && daGiu.indexOf(khoaSoHuu) >= 0) lots.push('TRUNGKHOA');
  /* HE5 · có bản tự kiểm trước khi ra */
  if (!tuKiem) lots.push('THIEUTUKIEM');

  const dat = lots.length === 0;

  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u,
    viec: 'HE_CHAMLUOT', doiTuong: (khoaSoHuu || '—') + ' · ' + (dat ? 'DAT' : lots.join(',')) });

  return { ok: true,
    dat,
    lots,
    khoaSoHuu,
    khongTuRaTay: true,
    vi: dat
      ? 'Lượt đạt cả năm trụ (V20) — cửa "' + khoaSoHuu + '" có thật, có ngữ cảnh, không chạm ' +
        'vùng cấm, không trùng khoá, có bản tự kiểm. Bộ chấm CHỈ xác nhận rồi dừng; việc thật ' +
        'vẫn gọi đúng cửa và cửa tự kiểm cổng.'
      : 'Lượt KHÔNG đạt — hỏng ở: ' + lots.join(', ') + '. Trợ lý phải sửa trước khi ra tay. Bộ ' +
        'chấm không tự ra tay, không bỏ qua cổng.' };
}
