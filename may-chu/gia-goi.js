/* ═══════════════════════════════════════════════════════════════
   GITA 365 — BỘ ĐÁNH GIÁ MỘT CẤU HÌNH GÓI

   Tệp `gita365-gia-goi.ts` mà bộ tối ưu của chủ hệ import KHÔNG có ở
   kho này. Đây là bản dựng lại bằng JS thuần, và nó CỐ Ý mỏng: nó chỉ
   biết cách CỘNG, không biết con số nào.

   ══ MÁY KHÔNG ĐOÁN MÔ HÌNH CHI PHÍ ══

   Đơn giá buổi, tỷ lệ lấp đầy, kho bài giảng mỗi năm — đó là con số
   của chủ hệ. Máy đoán ra một bộ thì cả bộ tối ưu chạy trơn tru trên
   một thế giới không có thật, và kết quả trình ra như một đề nghị đã
   được cân nhắc. Nên `kiemThamSo` CHẶN khi thiếu, và nói thiếu ô nào.

   ══ HÌNH CỦA MỘT GÓI ══

     { ma, ten, nhanh: 'TU_DI'|'CO_NGUOI', giaNiemYet, tyLeChon,
       buoi: [ { loai, soBuoi } ] }

   ══ HÌNH CỦA THAM SỐ CHI PHÍ ══

     { donGiaBuoi: {loai: đồng}, tyLeLapDay, quyMoNhom: {loai: người},
       khoBaiGiangMoiNam, quanLyVaTiepThi, thueSuat }
   ═══════════════════════════════════════════════════════════════ */

export const LOAI_BUOI = ['COACH_1_1', 'NHOM_NHO', 'NHOM', 'NHOM_LON',
  'HOI_THAO', 'TU_HOC'];

/* Loại buổi nào chia được chi phí cho nhiều người. TU_HOC không tốn
   người dạy nên nó không nằm đây; COACH_1_1 cũng không, vì một buổi
   một kèm một thì quy mô luôn bằng một. */
export const CO_QUY_MO = ['NHOM_NHO', 'NHOM', 'NHOM_LON', 'HOI_THAO'];

export const O_CHI_PHI = ['donGiaBuoi', 'tyLeLapDay', 'quyMoNhom',
  'khoBaiGiangMoiNam', 'quanLyVaTiepThi', 'thueSuat'];

export const NHANH = ['TU_DI', 'CO_NGUOI'];

/* Lỗi Hiến pháp là một LOẠI RIÊNG, không phải một dòng vi phạm ràng
   buộc. Ràng buộc là chuyện cấu hình kém; Hiến pháp là chuyện cấu
   hình KHÔNG ĐƯỢC TỒN TẠI — và hai thứ ấy không được chấm cùng thang. */
export class ViPhamHienPhap extends Error {
  constructor(m) { super(m); this.name = 'ViPhamHienPhap'; this.hienPhap = true; }
}

/* ═══════════════ GÁC CHẠY TRƯỚC MỌI PHÉP TÍNH ═══════════════

   Ba điều, và cả ba là chuyện cấu hình không được tồn tại:

     · gói Free phải CÓ, và phải thật sự miễn phí
     · mọi gói phải khai nhánh
     · tỷ lệ chọn cộng lại không được vượt 1

   Gác đặt ở đây chứ không ở bộ tối ưu: bộ tối ưu gọi bộ đánh giá hàng
   nghìn lần, và một cái gác chỉ chạy ở cửa ngoài thì mọi cấu hình
   TRUNG GIAN đều không ai soi. */
export function kiemHienPhap(danhMuc, ts) {
  const dm = Array.isArray(danhMuc) ? danhMuc : [];
  if (!dm.length) throw new ViPhamHienPhap('Danh mục rỗng.');

  const free = dm.filter(g => Number(g.giaNiemYet) === 0);
  if (!free.length) throw new ViPhamHienPhap(
    'Không có gói MIỄN PHÍ nào. Bậc thang GITA bắt đầu từ chỗ một gia đình chưa ' +
    'trả đồng nào cũng vào được — bỏ bậc ấy là đổi hẳn Học viện thành một chỗ bán ' +
    'khoá học.');

  const laNhanh = dm.filter(g => NHANH.indexOf(g.nhanh) < 0).map(g => g.ma);
  if (laNhanh.length) throw new ViPhamHienPhap(
    'Gói không khai nhánh: ' + laNhanh.join(' · ') + '.');

  const tong = dm.reduce((s, g) => s + (Number(g.tyLeChon) || 0), 0);
  if (tong > 1.0001) throw new ViPhamHienPhap(
    'Tỷ lệ chọn cộng lại ' + tong.toFixed(3) + ', vượt 1. Một người không mua được ' +
    'hơn một trăm phần trăm.');

  if (ts) {
    const am = O_CHI_PHI.filter(o => {
      const v = ts[o];
      if (typeof v === 'number') return v < 0;
      if (v && typeof v === 'object') return Object.values(v).some(x => Number(x) < 0);
      return false;
    });
    if (am.length) throw new ViPhamHienPhap('Tham số chi phí âm: ' + am.join(' · ') + '.');
  }
  return true;
}

/* ═══════════════ THAM SỐ CHI PHÍ CÓ ĐỦ CHƯA ═══════════════

   Thiếu thì NÓI THIẾU Ô NÀO, không rơi về một bộ mặc định. Một bộ mặc
   định ở đây là cách chắc nhất để cả bộ tối ưu chạy trên số tưởng
   tượng mà không ai biết. */
export function kiemThamSo(ts) {
  const t = ts || {};
  const thieu = O_CHI_PHI.filter(o => t[o] === undefined || t[o] === null);
  return {
    du: thieu.length === 0, thieu,
    vi: thieu.length
      ? 'Mô hình chi phí thiếu ô: ' + thieu.join(' · ') + '. Máy KHÔNG đoán hộ — ' +
        'đoán thì cả bộ tối ưu chạy trơn tru trên một thế giới không có thật, và ' +
        'kết quả trình ra như một đề nghị đã được cân nhắc. Điền ở TU_CHIPHI_KHUNG.'
      : 'Đủ sáu ô của mô hình chi phí.'
  };
}

/* ═══════════════ CHI PHÍ MỘT BUỔI CHO MỘT NGƯỜI HỌC ═══════════════ */
function chiMotBuoiMotNguoi(loai, ts) {
  const don = Number((ts.donGiaBuoi || {})[loai] || 0);
  if (CO_QUY_MO.indexOf(loai) < 0) return don;
  const qm = Number((ts.quyMoNhom || {})[loai] || 1);
  const lap = Number(ts.tyLeLapDay || 1);
  /* Chia cho SỐ CHỖ ĐƯỢC LẤP THẬT, không chia cho quy mô khai. Chia
     cho quy mô khai là giả định nhóm nào cũng đầy — và chỗ trống thì
     vẫn tốn đúng tiền người dạy. */
  const thuc = Math.max(qm * lap, 1);
  return don / thuc;
}

/* ═══════════════ TÍNH TOÀN HỆ THỐNG ═══════════════ */
export function tinhToanHeThong(danhMuc, ts, soLuotFree, tyLeChuyenDoi) {
  kiemHienPhap(danhMuc, ts);
  const kt = kiemThamSo(ts);
  if (!kt.du) throw new ViPhamHienPhap(kt.vi);

  const free = Math.max(Number(soLuotFree) || 0, 0);
  const tl = Number(tyLeChuyenDoi) || 0;
  const soMua = free * tl;

  let tongDoanhThu = 0, tongBienDoi = 0, soBuoiNam = 0, soKhachTraTien = 0;
  const goi = [];

  for (const g of danhMuc) {
    const gia = Number(g.giaNiemYet) || 0;
    /* Gói Free lấy số khách từ chính lượt Free; gói trả phí lấy từ
       phần đã chuyển đổi nhân tỷ lệ chọn. */
    const soKhach = gia === 0 ? free : soMua * (Number(g.tyLeChon) || 0);
    const buoi = (g.buoi || []);
    const soBuoiMotNguoi = buoi.reduce((s, b) => s + (Number(b.soBuoi) || 0), 0);
    const chiMotNguoi = buoi.reduce(
      (s, b) => s + (Number(b.soBuoi) || 0) * chiMotBuoiMotNguoi(b.loai, ts), 0);

    const dt = gia * soKhach;
    const chi = chiMotNguoi * soKhach;
    tongDoanhThu += dt;
    tongBienDoi += chi;
    soBuoiNam += soBuoiMotNguoi * soKhach;
    if (gia > 0) soKhachTraTien += soKhach;

    goi.push({ ma: g.ma, ten: g.ten, giaNiemYet: gia, soKhach,
      soBuoiMotNguoi, chiMotNguoi,
      /* Biên gộp của gói Free không có nghĩa — chia cho doanh thu
         bằng không. Bỏ hẳn khoá chứ không ghi 0: 0 đọc ra là "lỗ
         sạch", vắng mặt đọc ra là "không áp dụng". */
      bienGop: gia > 0 ? (gia - chiMotNguoi) / gia : undefined,
      doanhThuTong: dt, loiNhuanTong: dt - chi });
  }

  const coDinh = Number(ts.khoBaiGiangMoiNam || 0) + Number(ts.quanLyVaTiepThi || 0);
  const truocThue = tongDoanhThu - tongBienDoi - coDinh;
  const thue = truocThue > 0 ? truocThue * Number(ts.thueSuat || 0) : 0;

  return {
    goi, soLuotFree: free, soKhachTraTien,
    tongDoanhThu, tongChiBienDoi: tongBienDoi, chiCoDinh: coDinh,
    loiNhuanTruocThue: truocThue, loiNhuanSauThue: truocThue - thue,
    soBuoiThucGiaoMoiNam: soBuoiNam,
    soBuoiMoiTuan: soBuoiNam / 52
  };
}
