/* ═══════════════════════════════════════════════════════════════
   GITA 365 — TRỢ LÝ GITA V50: BỘ NÃO TRẢ LỜI THEO VAI · CẢM XÚC · Ý HỎI
   (chủ hệ 10/10/2026)

   Chủ hệ: "nâng cấp lên V50 cao cấp, thông minh, tư duy giải quyết vấn đề
   tốt hơn, trả lời khớp từng câu hỏi, nhập được cảm xúc với câu hỏi của
   khách hàng, hỗ trợ theo câu hỏi các vai; trợ lý nhận yêu cầu của Super
   Admin và lên phương án cao cấp, tải thông điệp tới bộ não vận hành —
   hệ thống chuỗi các Agent để cải tiến công việc."

   Bản trước trả lời bằng luật trong máy: tra từ khoá rồi ghép câu. Nó
   đúng với câu đã lường trước và lạc với mọi câu khác. Bản này đọc câu
   hỏi ở MÁY CHỦ theo ba trục rồi mới trả lời:

     1. VAI — đọc từ PHIÊN (hoSo.role), không đọc từ thứ trình duyệt gửi
        lên. Một trình duyệt khai mình là Super Admin thì vẫn là phụ huynh.
     2. CẢM XÚC — bộ đọc cụm từ tiếng Việt (lo, buồn, bực, mệt, vui).
        Dò CỤM NHIỀU ÂM TIẾT trên chữ đã bỏ dấu và có biên khoảng trắng:
        "sợ" trần bỏ dấu thành "so" và khớp "số" — bẫy đã ghi trong kho.
     3. Ý HỎI — câu hỏi hay YÊU CẦU. Yêu cầu của Super Admin được trả lời
        bằng một PHƯƠNG ÁN đủ sáu phần, không phải một đoạn văn.

   Luật giữ nguyên từ trước:
     · Câu có dấu hiệu khẩn KHÔNG đi tới AI — trả ngay đường người thật.
     · Mọi lượt gọi AI đi qua goiTheoLoai: cổng Điều 13 (soatRaNhaCungCap)
       chặn tên, số điện thoại… trước khi rời hệ; trần tải ngày; leo bậc
       nhà cung cấp. Không có đường gọi AI thứ hai.
     · Không lưu NỘI DUNG câu hỏi của khách. Nhật ký chỉ ghi vai · cảm xúc ·
       loại câu · độ dài.
     · AI không sẵn (tắt, hết trần, Điều 13 chặn) → trả mã cho trình duyệt
       để trình duyệt trả lời bằng động cơ trong máy. Không bao giờ để khách
       nhận một khung trống.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

import { laR01, tenNguoiDung as ten } from './vai-tro.js';
import { Kho } from './nen.js';
import { goiTheoLoai, taoTuyenDaTri } from './bo-nao-da-tri.js';

/* ═══════════ VAI ═══════════
   Mỗi vai: nhóm · cách xưng gọi · phạm vi được nói tới · trọng tâm. */
export const VAI_V50 = {
  R01: { ten: 'Super Admin', nhom: 'chuHe', xung: 'em', goi: 'anh/chị', phamVi: 'toàn hệ: chiến lược, vận hành, tài chính, con người, sản phẩm', trongTam: 'quyết định cấp hệ, phương án, rủi ro, con số đo được' },
  R02: { ten: 'Admin hệ thống', nhom: 'quanTri', xung: 'em', goi: 'anh/chị', phamVi: 'vận hành hệ thống, tài khoản, quyền, dữ liệu', trongTam: 'quy trình, thao tác trên hệ thống, an toàn dữ liệu' },
  R03: { ten: 'Giám đốc', nhom: 'quanTri', xung: 'em', goi: 'anh/chị', phamVi: 'vận hành học viện, đội ngũ, tài chính đã được cấp quyền', trongTam: 'điều phối đội ngũ, chỉ số, ưu tiên công việc' },
  R04: { ten: 'Quản lý chuyên môn', nhom: 'chuyenMon', xung: 'em', goi: 'anh/chị', phamVi: 'chất lượng nội dung, giáo trình, chuẩn nghề', trongTam: 'chuẩn chuyên môn, duyệt nội dung, đào tạo đội ngũ' },
  R05: { ten: 'Trưởng nhóm Coach', nhom: 'coach', xung: 'em', goi: 'anh/chị', phamVi: 'các Coach trong nhóm và các nhà nhóm phụ trách', trongTam: 'dẫn dắt Coach, xử lý ca khó, chất lượng đồng hành' },
  R06: { ten: 'Senior Coach', nhom: 'coach', xung: 'em', goi: 'anh/chị', phamVi: 'các nhà anh/chị phụ trách', trongTam: 'phương pháp coaching, ca khó, kèm Coach mới' },
  R07: { ten: 'Coach', nhom: 'coach', xung: 'em', goi: 'anh/chị', phamVi: 'các nhà anh/chị phụ trách', trongTam: 'buổi đồng hành, kịch bản nói chuyện, việc nhà tuần này' },
  R08: { ten: 'Giáo viên', nhom: 'giangDay', xung: 'em', goi: 'anh/chị', phamVi: 'lớp và học viên anh/chị dạy', trongTam: 'bài giảng, hoạt động lớp, theo dõi tiến bộ' },
  R09: { ten: 'Mentor', nhom: 'giangDay', xung: 'em', goi: 'anh/chị', phamVi: 'học viên anh/chị kèm', trongTam: 'kèm cặp, mục tiêu cá nhân của học viên' },
  R10: { ten: 'Chuyên viên đánh giá', nhom: 'danhGia', xung: 'em', goi: 'anh/chị', phamVi: 'các bài đánh giá được giao', trongTam: 'tiêu chí chấm, công bằng, bằng chứng' },
  R11: { ten: 'Tư vấn', nhom: 'tuVan', xung: 'em', goi: 'anh/chị', phamVi: 'các gia đình anh/chị chăm sóc', trongTam: 'lắng nghe nhu cầu, tư vấn trung thực, không ép mua' },
  R12: { ten: 'Phân tích dữ liệu', nhom: 'phanTich', xung: 'em', goi: 'anh/chị', phamVi: 'số liệu tổng hợp — không đọc hồ sơ từng nhà', trongTam: 'chỉ số, xu hướng, cách đo đúng' },
  R13: { ten: 'Phụ huynh', nhom: 'phuHuynh', xung: 'em', goi: 'anh/chị', phamVi: 'chuyện của nhà mình trong hành trình GITA', trongTam: 'nuôi dạy con, giao tiếp trong nhà, việc làm được ngay' },
  R14: { ten: 'Học viên', nhom: 'hocVien', xung: 'mình', goi: 'bạn', phamVi: 'việc học và hành trình của chính bạn', trongTam: 'học tập, thói quen, cảm xúc tuổi lớn, mục tiêu' },
  R15: { ten: 'Đại sứ', nhom: 'daiSu', xung: 'em', goi: 'anh/chị', phamVi: 'việc giới thiệu GITA và quyền lợi đại sứ', trongTam: 'giới thiệu trung thực, quyền lợi một tầng, không hứa hẹn quá' }
};
const KHACH = new Set(['R13', 'R14', 'R15']);

/* ═══════════ CHUẨN HOÁ ═══════════ */
export function boDau(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ').trim();
}
/* Dò cụm theo BIÊN ÂM TIẾT: đệm khoảng trắng hai đầu rồi tìm " cụm ". */
function coCum(s, ds) {
  const t = ' ' + s + ' ';
  return ds.filter(c => t.indexOf(' ' + c + ' ') >= 0);
}

/* ═══════════ KHẨN — không bao giờ đi tới AI ═══════════ */
const KHAN = ['tu tu', 'tu sat', 'muon chet', 'khong muon song', 'tu lam hai', 'tu lam dau', 'tu cat tay', 'rach tay',
  'xam hai', 'lam dung tinh duc', 'bi danh dap', 'danh dap con', 'bao luc gia dinh', 'bo nha di', 'mat tich', 'doa giet'];
export function coKhan(cau) { return coCum(boDau(cau), KHAN).length > 0; }
export const LOI_KHAN = 'Em đọc thấy đây là chuyện có thể nguy hiểm, nên em nói ngay điều quan trọng nhất: ' +
  'nếu có ai đang gặp nguy hiểm trước mắt, gọi 113 (công an) hoặc 115 (cấp cứu). Chuyện liên quan tới an toàn của trẻ em, ' +
  'gọi Tổng đài quốc gia bảo vệ trẻ em 111 (miễn phí, 24/7). Em không xử lý chuyện này qua tin nhắn được — ' +
  'Tư vấn phụ trách nhà mình sẽ liên hệ lại với anh/chị bằng người thật.';

/* ═══════════ CẢM XÚC ═══════════
   Cụm nhiều âm tiết, đã bỏ dấu. Mỗi nhóm một câu ĐÓN để AI bám (không
   chép nguyên văn — AI viết câu đồng cảm theo đúng điều người ta vừa kể). */
const CAM_XUC = {
  lo:   { ten: 'lo lắng', cum: ['lo lang', 'lo qua', 'rat lo', 'lo so', 'so qua', 'rat so', 'bat an', 'hoang mang', 'boi roi', 'cang thang', 'khong biet lam sao', 'khong biet phai lam sao', 'lo khong biet', 'mat ngu'] },
  buon: { ten: 'buồn, thất vọng', cum: ['buon qua', 'rat buon', 'buon long', 'that vong', 'chan nan', 'nan long', 'tui than', 'muon khoc', 'bat khoc', 'dau long', 'co don', 'tuyet vong'] },
  buc:  { ten: 'bực bội, ấm ức', cum: ['buc minh', 'buc qua', 'tuc qua', 'tuc gian', 'gian qua', 'phat dien', 'ung uc', 'kho chiu qua', 'qua dang', 'khong chap nhan duoc', 'that vo ly', 'vo ly qua', 'loi hen', 'lua dao'] },
  met:  { ten: 'mệt mỏi, quá sức', cum: ['met moi', 'met qua', 'kiet suc', 'duoi suc', 'qua tai', 'het chiu noi', 'khong chiu noi', 'chan qua', 'bat luc', 'het cach', 'buong xuoi', 'khong con suc'] },
  vui:  { ten: 'vui, biết ơn', cum: ['vui qua', 'rat vui', 'cam on nhieu', 'tuyet voi', 'hai long', 'tien bo', 'mung qua', 'hanh phuc'] }
};
export function docCamXuc(cau) {
  const s = boDau(cau);
  let tot = null, n = 0;
  for (const ma of Object.keys(CAM_XUC)) {
    const k = coCum(s, CAM_XUC[ma].cum);
    if (k.length > n) { n = k.length; tot = { ma, ten: CAM_XUC[ma].ten, dau: k }; }
  }
  /* Dấu chấm than lặp, chữ in hoa cả câu: cường độ, không phải loại. */
  const manh = /!{2,}/.test(cau) || (cau.length > 12 && cau === cau.toUpperCase() && /[A-ZĐ]/.test(cau));
  return tot ? Object.assign(tot, { muc: n > 1 || manh ? 2 : 1 }) : { ma: 'trungTinh', ten: '', dau: [], muc: manh ? 1 : 0 };
}

/* ═══════════ Ý HỎI ═══════════ */
const YEU_CAU = ['len phuong an', 'lap phuong an', 'lap ke hoach', 'len ke hoach', 'xay dung ke hoach', 'xay dung phuong an',
  'de xuat', 'chien luoc', 'cai tien', 'toi uu', 'trien khai', 'giai phap', 'phuong an', 'ke hoach', 'nang cap', 'lo trinh cho'];
const MENH_LENH = /^(hay|lam|lap|len|xay dung|de xuat|thiet ke|toi uu|cai tien|trien khai|tong hop|phan tich|danh gia|soan|viet)\b/;
export function docYHoi(cau) {
  const s = boDau(cau);
  const yc = coCum(s, YEU_CAU).length > 0 || MENH_LENH.test(s);
  return { loai: yc ? 'yeuCau' : 'cauHoi', coDauHoi: /[?？]/.test(cau) };
}

/* ═══════════ LỜI HỆ THỐNG ═══════════
   Đặt toàn bộ cách trả lời vào lời hệ thống — một lượt gọi, không thêm
   lượt "tự soát". Luật "không gợi ý" nằm ở đây VÀ ở bộ lọc đầu ra (locTra),
   vì mô hình nhỏ hay quên dòng cuối của lời dặn. */
export function dungLoiHe(v, cx, y, laSA) {
  const dong = [
    'Bạn là Trợ lý GITA V50 của Học viện GITA 365 — học viện giáo dục gia đình, hành trình 365 ngày qua 5 tầng T1–T5, mỗi nhà có Tư vấn và Coach là người thật.',
    'Người đang hỏi: ' + v.ten + '. Xưng "' + v.xung + '", gọi người hỏi là "' + v.goi + '".',
    'Phạm vi được nói tới: ' + v.phamVi + '. Trọng tâm của vai này: ' + v.trongTam + '.',
    cx.ma !== 'trungTinh'
      ? 'Cảm xúc nhận ra trong câu: ' + cx.ten + (cx.muc > 1 ? ' (mạnh)' : '') + '. Mở đầu bằng ĐÚNG MỘT câu đồng cảm cụ thể với điều họ vừa kể — không sáo rỗng, không lặp lại câu hỏi — rồi đi thẳng vào việc.'
      : 'Không thấy cảm xúc rõ: đi thẳng vào câu trả lời, không mở đầu xã giao.',
    'Cách trả lời:',
    '1. Trả lời ĐÚNG câu vừa hỏi. Không trả lời một câu khác, không lan sang chủ đề bên cạnh.',
    '2. Tư duy giải quyết vấn đề: nắm đúng vấn đề thật → nguyên nhân có thể (khi cần) → cách làm cụ thể → bước đầu tiên làm được ngay hôm nay.',
    '3. Gọn: câu hỏi đơn giản trả lời trong 2–5 câu. Chỉ dùng gạch đầu dòng khi có các bước.',
    '4. TUYỆT ĐỐI không đưa danh sách câu hỏi gợi ý, không kết bằng "bạn có thể hỏi thêm…", không quảng cáo, không chào bán.',
    '5. Không bịa con số, chính sách, giá, tên người. Không chắc thì nói không chắc và chỉ đúng người trả lời được (Tư vấn hoặc Coach phụ trách).',
    '6. Không chẩn đoán y tế, tâm lý, pháp lý. Thấy dấu hiệu nguy hiểm thì khuyên liên hệ người thật ngay.',
    '7. Thiếu một thông tin quyết định thì hỏi lại ĐÚNG MỘT câu ngắn thay vì đoán.',
    '8. Viết tiếng Việt tự nhiên, ấm, như một chuyên gia đang nói chuyện trực tiếp. Không dùng markdown đậm/nghiêng.'
  ];
  if (KHACH.has(v.ma)) dong.push('9. Người hỏi là khách hàng: không nói về nội bộ, nhân sự, tài chính của Học viện; không hứa kết quả cho con.');
  if (v.ma === 'R15') dong.push('10. Đại sứ chỉ hưởng quyền lợi một tầng (người mình giới thiệu trực tiếp) — không có tuyến dưới.');
  if (laSA && y.loai === 'yeuCau') {
    dong.push('ĐÂY LÀ YÊU CẦU CỦA SUPER ADMIN. Trả lời bằng một PHƯƠNG ÁN cao cấp, đủ ý mà gọn, đúng sáu phần đánh số:',
      '1) Mục tiêu — đo được bằng gì. 2) Hiện trạng và điểm nghẽn — nói rõ điều chưa biết. 3) Phương án chọn và lý do — so với một phương án thay thế. ' +
      '4) Các bước — ai làm, mốc thời gian. 5) Rủi ro và cách chặn. 6) Cách đo kết quả sau 7 và 30 ngày.',
      'Không hứa con số chưa đo. Việc chạm tiền, quyền, nội dung tới khách thì ghi rõ cần chữ ký nào theo luật của Học viện.');
  }
  return dong.join('\n');
}

/* Lọc đầu ra: bỏ khối "gợi ý / bạn có thể hỏi thêm" và dấu markdown thừa.
   Cắt từ dòng tiêu đề gợi ý trở xuống — mô hình hay đặt nó ở cuối. */
export function locTra(t) {
  let s = String(t || '').replace(/\r/g, '').trim();
  const lines = s.split('\n');
  const cat = lines.findIndex(l => /^\s*(\*\*)?\s*(gợi ý|câu hỏi gợi ý|bạn có thể hỏi|anh\/chị có thể hỏi|anh chị có thể hỏi|có thể bạn quan tâm|câu hỏi tiếp theo|hỏi thêm)/i.test(l));
  if (cat > 0) s = lines.slice(0, cat).join('\n').trim();
  s = s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/(^|\s)\*(\S[^*]*?)\*(?=\s|$)/g, '$1$2').replace(/^#{1,6}\s*/gm, '');
  return s.slice(0, 6000);
}

/* Trần lượt mỗi ngày theo nhóm — trợ lý là việc thường ngày, không phải
   lối đốt ngân sách AI. Hết trần thì trình duyệt trả lời bằng động cơ trong máy. */
function tranNgay(role) { return role === 'R01' ? 400 : KHACH.has(role) ? 60 : 200; }

function lichSuSach(ls) {
  if (!Array.isArray(ls)) return '';
  return ls.slice(-6).map(m => {
    const ai = m && m.ai === 'toi' ? 'Người hỏi' : 'Trợ lý';
    return ai + ': ' + String((m && m.loi) || '').replace(/[\u0000-\u001f]+/g, ' ').trim().slice(0, 600);
  }).filter(x => x.length > 12).join('\n');
}

/* ═══════════ CỬA: HỎI TRỢ LÝ V50 ═══════════ */
export async function troLyV50(y, env, db, hoSo) {
  const role = String((hoSo || {}).role || '');
  const v0 = VAI_V50[role];
  if (!v0) return { ok: false, code: 'NOPERM', error: 'Tài khoản chưa có vai hợp lệ.' };
  const v = Object.assign({ ma: role }, v0);
  const cau = String((y || {}).cau || '').replace(/[\u0000-\u0008\u000b-\u001f]+/g, ' ').trim();
  if (cau.length < 1) return { ok: false, code: 'SAI', error: 'Câu hỏi trống.' };
  if (cau.length > 3000) return { ok: false, code: 'SAI', error: 'Câu hỏi quá dài (tối đa 3.000 ký tự).' };
  const cx = docCamXuc(cau), yh = docYHoi(cau), laSA = laR01(hoSo);
  const meta = { vai: v.ten, nhom: v.nhom, camXuc: cx.ma === 'trungTinh' ? undefined : cx.ten, loaiCau: yh.loai, phuongAn: laSA && yh.loai === 'yeuCau' };
  if (coKhan(cau)) {
    try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'TRO_LY_V50_KHAN', doiTuong: role, chiTiet: 'câu có dấu hiệu khẩn — không gửi AI' }); } catch (e) {}
    return Object.assign({ ok: true, khan: true, tra: LOI_KHAN }, meta);
  }
  const dem = await Kho.demNhip(db, 'troLyV50:' + String(hoSo.uid || hoSo.u || role), 86400);
  if (dem > tranNgay(role)) return Object.assign({ ok: false, code: 'HETTRAN', error: 'Hôm nay đã dùng hết lượt trả lời bằng bộ não máy chủ.' }, meta);
  const ls = lichSuSach((y || {}).lichSu);
  const de = (ls ? 'Đoạn trò chuyện gần nhất:\n' + ls + '\n\n' : '') + 'Câu hỏi hiện tại cần trả lời:\n' + cau;
  /* Phương án của Super Admin đi CÙNG làn troLy (bậc 1–3, Workers AI trước),
     chỉ nới trần chữ ra. Làn chienLuoc bắt đầu ở bậc 3 — tức là nhà cung
     cấp trả phí — mà chi AI trả phí đang tắt theo lệnh chủ hệ; đi làn ấy
     thì mọi yêu cầu của Super Admin rơi về động cơ trong máy. */
  const k = await goiTheoLoai(env, db, hoSo, 'troLy', de, { he: dungLoiHe(v, cx, yh, laSA), ra: meta.phuongAn ? 1800 : 700 });
  if (!k.ok) return Object.assign({ ok: false, code: k.code || 'AI_LOI', error: k.error }, meta);
  const tra = locTra(k.text);
  if (!tra) return Object.assign({ ok: false, code: 'AI_RONG', error: 'Bộ não trả lời rỗng.' }, meta);
  /* Nhật ký KHÔNG chép câu hỏi — chỉ vai, cảm xúc, loại câu, nhà cung cấp, độ dài. */
  try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'TRO_LY_V50', doiTuong: role,
    chiTiet: [v.nhom, cx.ma, yh.loai, k.ncc, cau.length + '→' + tra.length].join(' · ') }); } catch (e) {}
  return Object.assign({ ok: true, tra, ncc: k.ncc }, meta);
}

/* ═══════════ THÔNG ĐIỆP SUPER ADMIN → BỘ NÃO VẬN HÀNH ═══════════
   Một thông điệp thành MỘT tuyến Agent ba chặng trong đội Agent tự chạy
   (bo-nao-da-tri · tuyenDaTri): phân tích → phương án → danh sách việc.
   Bộ não vận hành chạy tiếp từng chặng ở mỗi lượt làm việc, trong ngân sách
   ngày. Kết quả chỉ Super Admin đọc — Agent KHÔNG tự sửa mã, tự cấp quyền,
   tự gửi gì tới khách (luật của vòng tự nâng cấp và tự hoàn thiện). */
const PHAN_HE_THEO = [
  ['TU_HOAN_THIEN', ['kho', 'tai lieu', 'noi dung', 'cam nang', 'giao trinh', 'bai hoc']],
  ['XUONG_TAI_LIEU', ['xuong tai lieu', 'tai lieu gia dinh', 'phieu tai nguyen']],
  ['TU_NANG_CAP', ['giao dien', 'man hinh', 'tinh nang', 'nang cap', 'cai tien he thong', 'loi he thong', 'web app']],
  ['THANH_TRA', ['an ninh', 'bao mat', 'vi pham', 'thanh tra', 'gian lan']],
  ['VIEC_KET', ['ton dong', 'viec ket', 'cham tre', 'qua han']],
  ['NHIP', ['phu huynh', 'gia dinh', 'phan hoi', 'doi ngu', 'nhan su', 'coach', 'tu van', 'cham soc', 'khach hang', 'doanh thu', 'tai chinh', 'van hanh']]
];
export function chonPhanHe(noiDung) {
  const s = boDau(noiDung);
  for (const [ma, cum] of PHAN_HE_THEO) if (coCum(s, cum).length) return ma;
  return 'AGENT';
}

let daDungTD = false;
async function taoBangThongDiep(db) {
  if (daDungTD) return;
  await db.prepare('CREATE TABLE IF NOT EXISTS thongDiepBoNao (id TEXT PRIMARY KEY, noiDung TEXT NOT NULL, phuongAn TEXT, ' +
    "mucDo TEXT NOT NULL DEFAULT 'thuong', phanHe TEXT, tuyen TEXT, boiAi TEXT, luc INTEGER NOT NULL, trangThai TEXT NOT NULL DEFAULT 'daGui')").run();
  await db.prepare('CREATE INDEX IF NOT EXISTS ix_tdbn_luc ON thongDiepBoNao (luc)').run();
  daDungTD = true;
}

export async function guiThongDiepBoNao(y, env, db, hoSo) {
  if (!laR01(hoSo)) return { ok: false, code: 'NOPERM', error: 'Gửi thông điệp tới bộ não vận hành chỉ dành cho Super Admin.' };
  const x = y || {};
  const noiDung = String(x.noiDung || '').replace(/[\u0000-\u0008\u000b-\u001f]+/g, ' ').trim();
  const phuongAn = String(x.phuongAn || '').replace(/[\u0000-\u0008\u000b-\u001f]+/g, ' ').trim().slice(0, 6000);
  if (noiDung.length < 10 || noiDung.length > 4000) return { ok: false, code: 'SAI', error: 'Thông điệp từ 10 đến 4.000 ký tự.' };
  if (coKhan(noiDung)) return { ok: false, code: 'KHAN', error: 'Thông điệp có dấu hiệu khẩn — xử lý bằng người thật, không giao Agent.' };
  const mucDo = x.mucDo === 'gap' ? 'gap' : 'thuong';
  const phanHe = chonPhanHe(noiDung);
  await taoBangThongDiep(db);
  const cat = (s, n) => s.length > n ? s.slice(0, n - 1) + '…' : s;
  const nen = 'Thông điệp của Super Admin:\n' + cat(noiDung, 1100) + (phuongAn ? '\n\nPhương án trợ lý đã soạn:\n' + cat(phuongAn, 700) : '');
  const t = await taoTuyenDaTri({
    ten: 'Thông điệp SA · ' + cat(noiDung.replace(/\s+/g, ' '), 80),
    tuChay: true,
    chang: [
      { loai: 'phanTich', de: cat(nen + '\n\nViệc của chặng: phân tích vấn đề thật đằng sau thông điệp, nguyên nhân gốc, điều còn chưa biết.', 2000) },
      { loai: 'chienLuoc', de: cat(nen + '\n\nViệc của chặng: dựa trên phân tích chặng trước, lập phương án cải tiến: mục tiêu đo được, các bước, ai làm, mốc, rủi ro, cách đo.', 2000) },
      { loai: 'soan', de: cat(nen + '\n\nViệc của chặng: soạn danh sách việc giao cho từng vai (tối đa 10 việc), mỗi việc có người làm, hạn, và tiêu chí xong. Việc chạm tiền/quyền/nội dung tới khách ghi rõ chữ ký cần có.', 2000) }
    ]
  }, env, db, hoSo);
  if (!t.ok) return t;
  const id = 'TD-' + crypto.randomUUID().slice(0, 8).toUpperCase();
  await db.prepare('INSERT INTO thongDiepBoNao (id, noiDung, phuongAn, mucDo, phanHe, tuyen, boiAi, luc) VALUES (?,?,?,?,?,?,?,?)')
    .bind(id, noiDung, phuongAn || null, mucDo, phanHe, t.ma, ten(hoSo), Date.now()).run();
  try { await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'THONG_DIEP_BO_NAO', doiTuong: id, chiTiet: phanHe + ' · tuyến ' + t.ma + ' · ' + mucDo }); } catch (e) {}
  return { ok: true, id, tuyen: t.ma, phanHe, soChang: t.soChang,
    vi: 'Bộ não vận hành đã nhận. Đội Agent chạy tuyến ' + t.ma + ' (phân tích → phương án → danh sách việc) ở các lượt làm việc tới, trong ngân sách ngày. Kết quả đọc ở Bộ não đa trí.' };
}

export async function docThongDiepBoNao(y, env, db, hoSo) {
  if (!laR01(hoSo)) return { ok: false, code: 'NOPERM', error: 'Chỉ Super Admin đọc thông điệp gửi bộ não.' };
  await taoBangThongDiep(db);
  let ds = [];
  try {
    ds = ((await db.prepare('SELECT t.id, t.noiDung, t.mucDo, t.phanHe, t.tuyen, t.luc, d.dangO, d.trangThai AS ttTuyen, d.cacChang ' +
      'FROM thongDiepBoNao t LEFT JOIN tuyenDaTri d ON d.ma = t.tuyen ORDER BY t.luc DESC LIMIT 30').all()).results) || [];
  } catch (e) {
    ds = ((await db.prepare('SELECT id, noiDung, mucDo, phanHe, tuyen, luc FROM thongDiepBoNao ORDER BY luc DESC LIMIT 30').all()).results) || [];
  }
  return { ok: true, ds: ds.map(r => {
    let n = 0; try { n = JSON.parse(r.cacChang || '[]').length; } catch (e) {}
    return { id: r.id, tom: String(r.noiDung).slice(0, 160), mucDo: r.mucDo, phanHe: r.phanHe, tuyen: r.tuyen, luc: r.luc,
      tienDo: n ? (Number(r.dangO) || 0) + '/' + n : undefined, trangThai: r.ttTuyen || undefined };
  }) };
}
