/* ═══════════════════════════════════════════════════════════════
   GITA 365 — PHÂN HỆ 3: NỘI DUNG & TIẾP THỊ, PHẦN CHẠY Ở MÁY CHỦ

   Bản chép của G.NT_* — bộ kiểm mục 82 đối chiếu từng ô với kho.

   ══ CHỖ NÀY TRỎ, KHÔNG CHÉP ══

   `kien-truc-noi-dung.js` đã có bộ soi nguồn (`soatNguon`), bộ dò câu
   sáo rỗng, bộ dò lời phán, bộ dò tự xưng chuyên gia. Mục QC4 của bộ
   lọc quảng cáo — "con số nào không truy được nguồn" — GỌI THẲNG sang
   `soatNguon`, không chép bảng nhãn nguồn sang đây. Chép thì thêm một
   nhãn mới ở bản sau là hai bảng lệch nhau, và bộ lọc quảng cáo bắt
   oan một bài đã ghi nguồn đúng.

   ══ VÀ MỘT CHỖ CỐ Ý KHÔNG DỰNG ══

   Không dựng phép tự đoán tầng nhận thức từ chữ. Đoán thì một phần
   bảy là trúng, và người viết tưởng bài đã được xếp tầng nên thôi
   không nghĩ tới nữa — mà việc xếp tầng CHÍNH LÀ việc phải nghĩ.
   ═══════════════════════════════════════════════════════════════ */

import { Kho } from './nen.js';
import { soatNguon } from './kien-truc-noi-dung.js';

/* ═══════════════ BẢN CHÉP CỦA KHO ═══════════════ */

export const TANG_NT = [1, 2, 3, 4, 5, 6, 7];
export const NHOM4 = ['N12', 'N34', 'N56', 'N7'];

/* Tầng nào thuộc nhóm nào. Một bảng, không phải bảy dòng chép lời kêu
   gọi — sửa lời kêu gọi của một nhóm thì sửa đúng một chỗ. */
export const TANG_NHOM = { 1: 'N12', 2: 'N12', 3: 'N34', 4: 'N34',
  5: 'N56', 6: 'N56', 7: 'N7' };

export const NHANH7 = ['NH1', 'NH2', 'NH3', 'NH4', 'NH5', 'NH6', 'NH7'];
export const LOC7 = ['QC1', 'QC2', 'QC3', 'QC4', 'QC5', 'QC6', 'QC7'];
export const LOC_MAY = ['QC1', 'QC2', 'QC3', 'QC4'];
export const LOC_NGUOI = ['QC5', 'QC6', 'QC7'];

/* Lời kêu gọi SAI của từng nhóm. Nhóm N7 KHÔNG có khoá này — bản đặc
   tả để trống ô ấy, và luật kho là vắng mặt nghĩa là không áp dụng. */
export const KEU_GOI_SAI = {
  N12: ['đăng ký ngay'],
  N34: ['còn 3 suất'],
  N56: ['giảm 50% hôm nay']
};

function duocVaoNT(hoSo) {
  return /^R(0[1-9]|1[0-2])$/.test(String((hoSo || {}).role || ''));
}

/* ═══════════════ 5.1 · TẦNG NHẬN THỨC ═══════════════

   Máy KHÔNG đoán tầng. Chỉ nhận, và chặn khi không có.

   Một chỗ dễ sai im lặng: `tangNT` gửi lên là chuỗi "1" thì so bằng
   `===` với số 1 trượt, và máy báo "chưa khai tầng" cho một bài đã
   khai. Nên ép về số một lần ở đây, đúng một chỗ. */
export function docTangNT(tangNT) {
  const n = Number(tangNT);
  if (!Number.isInteger(n) || TANG_NT.indexOf(n) < 0) {
    return { ok: false, code: 'CHUAKHAITANG',
      error: 'Nội dung chưa khai tầng nhận thức (1–7), nên KHÔNG xuất bản được. ' +
        'Không khai thì mặc định người viết viết cho người đã muốn mua — vì đó là ' +
        'người dễ hình dung nhất — mà sáu trên bảy tầng không phải người ấy. Và ' +
        'máy KHÔNG đoán hộ: đoán thì một phần bảy là trúng, và người viết tưởng ' +
        'bài đã được xếp tầng nên thôi không nghĩ tới nữa.' };
  }
  return { ok: true, tangNT: n, nhom: TANG_NHOM[n] };
}

/* ═══════════════ LỜI KÊU GỌI SAI TẦNG ═══════════════

   Cổng đo được nhất của cả 5.1, và cũng là cổng đáng nhất: một bài
   tầng 1–2 kết bằng "Đăng ký ngay" thì nó không bị ai phản đối — nó
   bị lướt qua, và lướt qua thì không để lại dấu nào để về sau truy. */
export function soatKeuGoi(tangNT, chu) {
  const t = docTangNT(tangNT);
  if (!t.ok) return t;
  const sai = KEU_GOI_SAI[t.nhom] || [];
  const s = String(chu || '').toLowerCase().replace(/\s+/g, ' ');
  const dinh = sai.filter(c => s.indexOf(c) >= 0);
  return {
    ok: true, tangNT: t.tangNT, nhom: t.nhom, dinh,
    dat: dinh.length === 0,
    vi: dinh.length
      ? 'Lời kêu gọi SAI TẦNG: "' + dinh.join('" · "') + '" không dùng được ở ' +
        'nhóm ' + t.nhom + '. Người ở tầng này chưa tới chỗ mua, và họ không phản ' +
        'đối lời mời — họ lướt qua.'
      : 'Lời kêu gọi hợp tầng ' + t.tangNT + '.'
  };
}

/* ═══════════════ 5.2 · MỘT GỐC RA BẢY NHÁNH ═══════════════

   Đếm bài CÓ THẬT, không nhận một lời khai "đã làm đủ". Và thiếu thì
   nêu TỪNG nhánh thiếu: một con số thiếu không nói thiếu cái gì thì
   người viết đoán, và họ đoán nhánh dễ làm nhất. */
export function soatNhanh7(daCo) {
  const ds = Array.isArray(daCo) ? daCo.map(x => String(x || '').trim()) : [];
  const co = NHANH7.filter(n => ds.indexOf(n) >= 0);
  const thieu = NHANH7.filter(n => ds.indexOf(n) < 0);
  const la = ds.filter(x => x && NHANH7.indexOf(x) < 0);
  return {
    dat: thieu.length === 0, soCo: co.length, thieu, la,
    vi: thieu.length
      ? 'Bài gốc mới ra ' + co.length + '/7 nhánh, còn thiếu: ' + thieu.join(' · ') +
        '. Đây là phép đo CHẤT LƯỢNG BÀI GỐC đội lốt một phép đếm — không kể được ' +
        'trong sáu mươi giây thì bài chưa có ý trung tâm; không rút được thành một ' +
        'trang thì bài chưa có việc nào làm được. Phần đó chưa đủ chín.'
      : 'Đủ bảy nhánh — bài gốc đã chín.'
  };
}

/* ═══════════════ 5.3 · BỘ LỌC QUẢNG CÁO ═══════════════

   Bốn mục máy đo, ba mục chỉ người khai được. Hàm này trả về HAI
   NGĂN riêng, không gộp thành một con số "đạt mấy trên bảy": gộp lại
   thì một lời khai nằm cùng hàng với một phép đo, và người đọc tin
   cả hai như nhau. */

/* QC1 — cụm tuyệt đối. Dò CỤM NHIỀU ÂM TIẾT, không dò âm tiết trần:
   "nhất" trần nằm trong "nhất định", "thống nhất", "duy nhất một lần
   nữa"; và tiếng Việt không phân từ bằng khoảng trắng, nên biên âm
   tiết ở đây không cứu được gì. Chọn cụm là chặn ở chỗ CHỌN DẤU HIỆU
   — rẻ hơn và chắc hơn một danh sách trừ phải dài thêm mãi. */
/* 'số 1' TRẦN đã bị bỏ (9.99.112): doCum dùng indexOf nên 'số 1' là chuỗi
   con của "số 12/15…" và của số thứ tự ("bước số 1", "buổi số 1") → bắt oan
   một bài lành, đúng bẫy dò-chuỗi-con mà chính file này cảnh báo. Thay bằng
   CỤM XẾP HẠNG nhiều âm tiết (số 1 + phạm vi). 'số một' (viết chữ) giữ lại. */
export const CUM_TUYET_DOI = ['tốt nhất', 'số một', 'hàng đầu',
  'số 1 việt nam', 'số 1 thế giới', 'số 1 thị trường', 'số 1 trong ngành',
  'là số 1', 'đứng số 1', 'vị trí số 1',
  'duy nhất tại', 'duy nhất ở', 'đầu tiên và duy nhất', 'không ai bằng',
  'vô địch', 'đỉnh cao nhất', 'hiệu quả nhất', 'uy tín nhất'];

/* QC2 — hình của lời so sánh. Dò hình, không dò tên đối thủ: một danh
   sách tên đối thủ phải dài thêm mãi và luôn thiếu đúng cái tên mới. */
export const CUM_SO_SANH = ['hơn hẳn', 'tốt hơn trung tâm', 'vượt trội so với',
  'so với các trung tâm', 'khác với các trung tâm', 'không như những nơi khác',
  'hơn mọi chương trình', 'trong khi các nơi khác'];

/* QC3 — cam kết kết quả. Cụm hai vế: một lời hứa đứng cạnh một kết
   quả đo được. "Cam kết" trần không đủ — kho này cam kết rất nhiều
   thứ đúng đắn (cam kết đồng hành, cam kết bảo mật). */
export const CUM_CAM_KET = ['cam kết điểm', 'cam kết đỗ', 'cam kết đạt',
  'đảm bảo điểm', 'đảm bảo đỗ', 'chắc chắn tăng điểm', 'cam kết kết quả',
  'hoàn tiền nếu không tăng', 'cam kết 100%', 'bảo đảm kết quả'];

function doCum(chu, bang) {
  const s = String(chu || '').toLowerCase().replace(/\s+/g, ' ');
  return bang.filter(c => s.indexOf(c) >= 0);
}

export function soatLocMay(chu) {
  const qc1 = doCum(chu, CUM_TUYET_DOI);
  const qc2 = doCum(chu, CUM_SO_SANH);
  const qc3 = doCum(chu, CUM_CAM_KET);
  /* QC4 gọi THẲNG sang hiến pháp nội dung. Chép bảng nhãn nguồn sang
     đây thì thêm một nhãn mới ở bản sau là hai bảng lệch nhau, và bộ
     lọc bắt oan một bài đã ghi nguồn đúng. */
  const coSo = /\d/.test(String(chu || ''));
  const ng = soatNguon(chu);
  const qc4 = coSo && !ng.dat;

  const pham = [];
  if (qc1.length) pham.push({ ma: 'QC1', dinh: qc1 });
  if (qc2.length) pham.push({ ma: 'QC2', dinh: qc2 });
  if (qc3.length) pham.push({ ma: 'QC3', dinh: qc3 });
  if (qc4) pham.push({ ma: 'QC4', dinh: ['có con số mà không có nhãn nguồn'] });

  return { dat: pham.length === 0, pham, coSo, soNhanNguon: ng.soNhan };
}

/* Ba mục người-khai. Đòi MỘT CÁI TÊN kèm MỘT CHỖ TRỎ TỚI GIẤY TỜ —
   không nhận một ô tích. Một ô tích không tên thì lúc cần đối chất
   không hỏi được ai, và đó đúng là ba mục nặng nhất về pháp lý. */
export function soatLocNguoi(khai) {
  const k = khai || {};
  const thieu = [];
  LOC_NGUOI.forEach(ma => {
    const o = k[ma];
    /* Mục không áp dụng thì khai thẳng `khongApDung` — không dùng hình
       ảnh trẻ em thì QC6 không phải một mục phải ký. Bỏ trống KHÁC
       hẳn khai không áp dụng: bỏ trống là chưa ai nhìn tới. */
    if (o && o.khongApDung === true) return;
    if (!o || !String(o.boiAi || '').trim()) { thieu.push(ma + ' · thiếu TÊN người khai'); return; }
    if (!String(o.giayTo || '').trim()) thieu.push(ma + ' · thiếu số hiệu giấy tờ');
  });
  return {
    dat: thieu.length === 0, thieu,
    vi: thieu.length
      ? 'Ba mục người-khai chưa đủ: ' + thieu.join(' · ') + '. Máy nhìn thấy cái ô ' +
        'tích, không nhìn thấy sự việc — nên ô ấy đòi một cái tên và một chỗ trỏ ' +
        'tới giấy tờ.'
      : 'Ba mục người-khai đã có tên và giấy tờ.'
  };
}

/* ═══════════════ CỬA · SOI MỘT BÀI TIẾP THỊ TRƯỚC KHI CHẠY ═══════════════ */
export async function soatTiepThi(y, env, db, hoSo) {
  if (!duocVaoNT(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Cổng Nội dung & tiếp thị mở cho R01–R12.' };

  const x = y || {};
  const chu = String(x.chu || '').trim();
  if (chu.length < 10) return { ok: false, error: 'Dưới mười chữ thì chưa đủ để soi.' };

  const t = docTangNT(x.tangNT);
  if (!t.ok) return t;

  const kg = soatKeuGoi(t.tangNT, chu);
  const may = soatLocMay(chu);
  const nguoi = soatLocNguoi(x.khai);

  /* HAI NGĂN riêng, không gộp thành "đạt mấy trên bảy". Gộp thì một
     lời khai nằm cùng hàng với một phép đo và người đọc tin cả hai
     như nhau. */
  const dat = kg.dat && may.dat && nguoi.dat;

  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'NT_SOAT',
    doiTuong: String(x.ma || '').slice(0, 60) || 'nhap',
    chiTiet: 'tầng ' + t.tangNT + ' · ' + (dat ? 'sạch' : 'còn ' +
      (may.pham.length + nguoi.thieu.length + kg.dinh.length) + ' chỗ') });

  return { ok: true, tangNT: t.tangNT, nhom: t.nhom, dat,
    keuGoi: kg, locMay: may, locNguoi: nguoi,
    vi: dat
      ? 'Bài sạch cả ba cổng: đúng tầng, bốn mục máy đo không phạm, ba mục ' +
        'người-khai đã có tên và giấy tờ.'
      : 'Chưa chạy được. Ngờ là đủ để chặn: bắt oan tốn ba mươi giây khai thêm ' +
        'một số hiệu tài liệu, còn lọt một câu là một bài quảng cáo đã chạy.' };
}

/* ═══════════════ CỬA · MỘT GỐC RA BẢY NHÁNH ═══════════════ */
export async function soatBayNhanh(y, env, db, hoSo) {
  if (!duocVaoNT(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Cổng Nội dung & tiếp thị mở cho R01–R12.' };
  const r = soatNhanh7((y || {}).daCo);
  return { ok: true, ...r };
}
