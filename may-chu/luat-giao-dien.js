/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MƯỜI HAI LUẬT GIAO DIỆN · PHẦN CÓ RĂNG

   Bản chép của G.LGD_* — bộ kiểm mục 91 đối chiếu từng ô với kho.

   ══ MÔ-ĐUN NÀY KHÔNG DỰNG MÀN HÌNH NÀO ══

   Nó chỉ chứa CỔNG. Luật giao diện mà chỉ sống ở mã giao diện thì nó
   chết cùng lượt viết lại giao diện đầu tiên — mà giao diện là thứ bị
   viết lại nhiều nhất trong mọi kho.

   Đặt cổng ở máy chủ thì một bản giao diện mới, một ứng dụng di động
   viết sau, hay một người gọi thẳng vào cửa bằng công cụ nhà phát triển
   đều gặp cùng một cái cổng. Đó là khác biệt giữa một luật và một lời
   dặn.

   ══ 9.99.75 · CẢ MƯỜI HAI CỔNG ĐỀU CÓ RĂNG ══

   Tới 9.99.74 kho chưa có Chế độ Bão, chưa có bản đồ riêng của trẻ,
   chưa có nút chia sẻ ảnh — năm luật ấy chỉ có phép canh đặt trước.
   Chủ hệ chốt LGD-01 và `may-chu/hom-nay.js` dựng đủ bốn cửa còn
   thiếu, nên nay cả mười hai đều chặn thật.

   Phép canh đặt trước ở mục 91 **KHÔNG bị gỡ**: nó canh những cửa chưa
   viết — cửa Chế độ Bão THỨ HAI, cửa ghim THỨ HAI. Gỡ nó đi vì "đã có
   cổng rồi" là bỏ đúng lớp bảo vệ dành cho người viết cửa sau.
   ═══════════════════════════════════════════════════════════════ */

import { Kho } from './nen.js';

/* ═══════════════ L04 · NĂM Ô VÒNG ĐỎ ═══════════════

   Chặn theo TÊN Ô, cùng lối `soatOLa` của Thẻ Vùng Mạnh (9.99.63).

   Vì sao tên ô chứ không phải nội dung: nội dung thì viết kiểu gì cũng
   được, nên một bộ dò nội dung luôn thiếu đúng cách viết mới. Còn muốn
   hệ ĐỌC được một ô thì người gọi phải gõ đúng tên nó — chỗ hẹp ấy là
   chỗ đặt cổng. */
export const O_VONG_DO = ['thuThaTho', 'noCamXuc', 'chiSoGK', 'hoSoSucKhoe',
  'tuyenNgonMotDoi'];

/* Soi CẢ CHUỖI đã dựng xong lẫn tên ô ở mọi tầng của vật. Soi một tầng
   thì gói ô ấy vào một ô con là lọt — và người gói không cố ý, họ chỉ
   đang gom dữ liệu cho gọn. */
export function soatVongDo(x, sau) {
  const thay = [];
  const di = (v, d) => {
    if (d > 6 || v === null || typeof v !== 'object') return;
    Object.keys(v).forEach(k => {
      if (O_VONG_DO.indexOf(k) >= 0 && thay.indexOf(k) < 0) thay.push(k);
      di(v[k], d + 1);
    });
  };
  di(x, 0);
  return { sach: thay.length === 0, thay,
    vi: thay.length === 0
      ? 'Không ô vòng đỏ nào trong yêu cầu này.'
      : 'Yêu cầu mang ô vòng đỏ: ' + thay.join(' · ') + '. Năm ô này là chỗ người ta ' +
        'viết ra điều chưa nói với ai — chúng mã hoá TẠI THIẾT BỊ và không có bản ' +
        'nào ở máy chủ. Một bản sao trên máy chủ là một bản sao đọc được, và lời ' +
        'hứa "chỉ mình bạn thấy" thành lời nói dối mà người tin nó không kiểm được.' +
        (sau ? ' (' + sau + ')' : '') };
}

/* ═══════════════ L10 · BỐN THỨ MÁY KHÔNG SOẠN HỘ ═══════════════

   Chặn vì máy viết HAY, không phải vì máy viết dở. Chặn vì viết dở thì
   mai nó viết hay hơn là luật hết hiệu lực. */
export const VIEC_NGUOI_GIU = ['loiKhenCon', 'loiXinLoi', 'thuThaTho', 'tinNhanAnUi'];

/* Dò cụm NHIỀU ÂM TIẾT trong câu hỏi, cùng luật chọn dấu hiệu của
   CUM_TUYET_DOI (9.99.65). "khen" trần nằm trong "khen thưởng",
   "lời khen ngợi đồng nghiệp" — những câu không thuộc luật này. */
export const DAU_NGUOI_GIU = [
  { dau: 'viết hộ lời khen', viec: 'loiKhenCon' },
  { dau: 'soạn lời khen', viec: 'loiKhenCon' },
  { dau: 'viết lời khen cho con', viec: 'loiKhenCon' },
  { dau: 'viết hộ lời xin lỗi', viec: 'loiXinLoi' },
  { dau: 'soạn lời xin lỗi', viec: 'loiXinLoi' },
  { dau: 'viết lời xin lỗi', viec: 'loiXinLoi' },
  { dau: 'viết thư tha thứ', viec: 'thuThaTho' },
  { dau: 'soạn thư tha thứ', viec: 'thuThaTho' },
  { dau: 'viết hộ tin nhắn an ủi', viec: 'tinNhanAnUi' },
  { dau: 'soạn tin nhắn an ủi', viec: 'tinNhanAnUi' }
];

export const NHAC_NGUOI_GIU = {
  loiKhenCon: 'Khen việc con LÀM, đừng khen con LÀ ai.',
  loiXinLoi: 'Nói rõ việc mình đã làm, đừng nói rõ hoàn cảnh của mình.',
  thuThaTho: 'Thư này không rời máy. Viết cho mình đọc trước đã.',
  tinNhanAnUi: 'Không cần biết nói gì. Nói rằng mình không biết nói gì cũng được.'
};

export function soatNguoiGiu(cau) {
  const s = String(cau || '').toLowerCase();
  const trung = DAU_NGUOI_GIU.filter(d => s.indexOf(d.dau) >= 0);
  if (!trung.length) return { sach: true };
  const viec = trung[0].viec;
  return { sach: false, viec, dau: trung[0].dau, nhac: NHAC_NGUOI_GIU[viec],
    vi: 'Chỗ này là Ghế Người Giữ — máy không soạn hộ. Một lời xin lỗi do máy viết ' +
      'đọc lên NGHE Y HỆT một lời xin lỗi thật, và người nhận không có cách nào ' +
      'phân biệt, nên thứ họ nhận được không còn là điều họ tưởng mình đang nhận. ' +
      'Không phải vì máy viết dở — máy viết rất hay, và đó chính là lý do phải chặn.' };
}

/* ═══════════════ L08 · KHÔNG GIỮ CHÂN NGƯỜI DÙNG ═══════════════

   Cụm NHIỀU ÂM TIẾT. "chuỗi" trần nằm trong "chuỗi 21 ngày" — câu hoàn
   toàn lành, và bắt oan một câu lành thì lần sau người ta tắt phép đo. */
export const DAU_GIU_CHAN = ['sắp mất chuỗi', 'mất chuỗi', 'đứt chuỗi',
  'còn lại bao lâu', 'chỉ còn hôm nay', 'ưu đãi kết thúc', 'đăng ký lại ngay',
  'gia hạn ngay'];

export function soatGiuChan(cau) {
  const s = String(cau || '').toLowerCase();
  const thay = DAU_GIU_CHAN.filter(d => s.indexOf(d) >= 0);
  return { sach: thay.length === 0, thay,
    vi: thay.length === 0
      ? 'Câu nhắc không mang dấu hiệu giữ chân.'
      : 'Câu nhắc mang dấu hiệu giữ chân: ' + thay.join(' · ') + '. Mọi mẹo giữ chân ' +
        'đều hiệu quả — đó là lý do chúng có mặt ở khắp nơi. Dùng chúng ở đây là ' +
        'đổi lòng tin của một gia đình lấy vài lượt mở app.' };
}

/* ═══════════════ ĐỌC BẢN LUẬT ═══════════════

   Trả về HAI NGĂN RIÊNG, không gộp. Gộp mười hai luật thành một con số
   "đã cưỡng chế 12/12" thì năm luật chưa có bề mặt biến mất khỏi tầm
   nhìn — và chúng đúng là năm luật sẽ được viết bởi người không đọc
   tệp này. Cùng luật với cột lời khai của phễu (9.99.59) và hai ngăn
   của bảy việc Luật 91 (9.99.70). */
export const CO_RANG = ['L01', 'L02', 'L03', 'L04', 'L05', 'L06', 'L07', 'L08',
  'L09', 'L10', 'L11', 'L12'];
/* 9.99.75: chủ hệ chốt LGD-01 (thêm màn vào cổng phụ huynh), nên năm
   luật L03 · L06 · L07 · L11 · L12 có bề mặt để cắm răng và chuyển
   sang CO_RANG. Danh sách này RỖNG chứ không bị xoá: ngày bản đặc tả
   sau đẻ ra một luật về màn chưa dựng thì chỗ khai nó vẫn sẵn đó, và
   phép canh đặt trước ở mục 91 KHÔNG bị gỡ — nó vẫn canh những cửa
   chưa viết, tức là cửa Chế độ Bão THỨ HAI, cửa ghim THỨ HAI. */
export const CANH_TRUOC = [];

export async function docLuatGiaoDien(y, env, db, hoSo) {
  if (!/^R(0[1-9]|1[0-5])$/.test(String((hoSo || {}).role || '')))
    return { ok: false, code: 'NOPERM', error: 'Bản luật giao diện mở cho R01–R15.' };

  return { ok: true,
    coRang: CO_RANG, canhTruoc: CANH_TRUOC,
    soVongDo: O_VONG_DO.length, soNguoiGiu: VIEC_NGUOI_GIU.length,
    /* KHÔNG trả về một con số "đã cưỡng chế mấy trên mười hai". Một phân
       số ở đây đọc ra như một mức hoàn thành, trong khi hai nửa của nó
       là hai thứ khác hẳn nhau. */
    vi: CO_RANG.length + ' luật có cổng chặn thật. ' + (CANH_TRUOC.length
      ? CANH_TRUOC.length + ' luật còn nói về màn hình CHƯA DỰNG.'
      : 'Không luật nào còn treo.') +
      ' Phép canh đặt trước vẫn chạy ở mục 91 — nó canh những CỬA CHƯA VIẾT: ngày ' +
      'ai đó viết cửa Chế độ Bão thứ hai mà nhận ô lý do, hay cửa chia sẻ ảnh thứ ' +
      'hai mà không gọi cổng phủ quyết, mục ấy đỏ ngay.',
    khongGopSo: 'Hai ngăn KHÔNG gộp thành một phân số. Một phân số ở đây đọc ra như ' +
      'mức hoàn thành, mà năm luật chưa có bề mặt lại đúng là năm luật sẽ được viết ' +
      'bởi người không đọc bản này.' };
}

/* ═══════════════ GHI MỘT LƯỢT SOI ═══════════════

   Chỉ ghi lượt BỊ CHẶN, không ghi lượt sạch. Ghi cả lượt sạch thì sổ
   dài ra bằng số lượt dùng, và chỗ đáng nhìn — những lần ai đó suýt
   gửi một lá thư tha thứ lên máy chủ — chìm trong đó. */
export async function ghiChanLuat(db, hoSo, ma, chiTiet) {
  await Kho.ghiNhatKy(db, { uid: (hoSo || {}).uid, username: (hoSo || {}).u,
    viec: 'LGD_CHAN', doiTuong: ma, chiTiet: String(chiTiet || '').slice(0, 160) });
}
