/* ═══════════════════════════════════════════════════════════════
   VÒNG TỰ NÂNG CẤP — PHẦN CÓ RĂNG

   Bản chép của G.TNC_* — bộ kiểm mục 93 đối chiếu từng ô với kho.

   ══ MÔ-ĐUN NÀY KHÔNG NÂNG CẤP GÌ CẢ ══

   Nó chỉ GHI một lượt đi qua năm cửa, và từ chối những lượt không được
   phép tồn tại. Bộ nâng cấp thật dựng sau, và nó phải đi qua đây.

   Lần thứ ba thứ tự này được chọn — sau Hiến pháp (9.99.62) và trần
   giám sát (9.99.76) — vì lần nào cũng cùng một lý do: một cái cổng
   dựng SAU một cái cửa đã chạy thì nó chỉ là một lời nhắc.

   ══ VÙNG KHÔNG TỰ NÂNG CẤP KHÔNG PHẢI MỘT CẤP CAO HƠN ══

   Đây là chỗ dễ dựng sai nhất của cả tệp. Chạm bảy vùng ấy KHÔNG rơi
   vào Cấp 8; nó rơi RA NGOÀI đường này. "Cần duyệt cao hơn" là một cái
   thang, và mọi cái thang đều leo được — hôm nay không leo được thì
   sáu tháng nữa có người leo được, và lúc ấy nó hợp lệ.

   Nên `xepCap` KHÔNG trả về cấp nào cho một đề xuất chạm vùng cấm: nó
   trả `ngoaiDuong`. Trả về "Cấp 8" là mời người ta đi tìm một chữ ký
   Cấp 8.
   ═══════════════════════════════════════════════════════════════ */

import { Kho } from './nen.js';
import { ghiSoDen } from './giam-sat.js';

/* ═══════════════ BẢY VÙNG KHÔNG TỰ NÂNG CẤP ═══════════════

   Mỗi vùng kèm KHO NÀO nó bảo vệ. Không kèm thì sáu tháng sau có người
   gỡ một dòng mà không biết mình đang gỡ cái gì. */
export const VUNG_CAM = ['K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7'];

/* Dấu hiệu chạm vùng. Dò CỤM NHIỀU ÂM TIẾT, cùng luật chọn dấu hiệu đã
   chốt ở 9.99.65 và 9.99.76: âm tiết trần "rào" nằm trong "rào cản",
   "hàng rào sân"; "giá" nằm trong "giá trị", "đánh giá" — và bắt oan
   một câu lành thì lần sau người ta tắt phép soi đi. */
export const DAU_CHAM_VUNG = [
  { dau: 'hiến pháp', ma: 'K1' },
  { dau: 'mười ba điều', ma: 'K1' },
  { dau: '13 điều', ma: 'K1' },
  { dau: 'bn_hienphap', ma: 'K1' },

  /* KHÔNG dò 'hàng rào' trần: "hàng rào sân trường" là một câu hoàn
     toàn lành, và bắt oan một câu lành thì lần sau người ta tắt phép
     soi đi. Mọi cách nói THẬT về hàng rào mười điểm đều viết được
     thành cụm dài hơn — cùng lối chọn dấu hiệu đã chốt ở 9.99.56. */
  { dau: 'hàng rào mười điểm', ma: 'K2' },
  { dau: 'hàng rào 10 điểm', ma: 'K2' },
  { dau: 'điểm hàng rào', ma: 'K2' },
  { dau: 'nới hàng rào', ma: 'K2' },
  { dau: 'sửa hàng rào', ma: 'K2' },
  { dau: 'bn_rao10', ma: 'K2' },

  { dau: 'luật giao diện', ma: 'K3' },
  { dau: 'mười hai luật', ma: 'K3' },
  { dau: 'lgd_luat', ma: 'K3' },

  { dau: 'trần giám sát', ma: 'K4' },
  { dau: 'điều cấm tuyệt đối', ma: 'K4' },
  { dau: 'vip_cam', ma: 'K4' },

  { dau: 'vòng nâng cấp', ma: 'K5' },
  { dau: 'đường nâng cấp', ma: 'K5' },
  { dau: 'vùng không tự nâng cấp', ma: 'K5' },
  /* 'năm cửa' trần KHÔNG dùng được: nó nằm trong "năm cửa hàng". */
  { dau: 'năm cửa của vòng', ma: 'K5' },
  { dau: 'cửa nâng cấp', ma: 'K5' },

  { dau: 'sổ nối băm', ma: 'K6' },
  { dau: 'nhật ký hệ thống', ma: 'K6' },
  { dau: 'sổ đen giám sát', ma: 'K6' },

  /* 'bảng giá' trần cũng KHÔNG dùng được: "bảng giá của nhà cung cấp
     máy chủ" là một đề xuất Cấp 6 hoàn toàn hợp lệ, và đẩy nó ra khỏi
     đường này là bắt oan đúng chỗ đắt nhất. */
  { dau: 'giá gói', ma: 'K7' },
  { dau: 'bảng giá học phí', ma: 'K7' },
  { dau: 'bảng giá gói', ma: 'K7' },
  { dau: 'thang duyệt chi', ma: 'K7' },
  { dau: 'học phí tầng', ma: 'K7' },
  { dau: 'giá bậc', ma: 'K7' }
];

/* ═══════════════ TÁM CẤP ═══════════════

   `sanhGio` là số giờ phải CHẠY THỬ TÁCH BIỆT trước khi đưa vào chạy.
   Vắng khoá nghĩa là cấp ấy không đòi chạy thử — vắng mặt là KHÔNG ÁP
   DỤNG, không phải số 0. */
export const CAP8 = [
  { cap: 1, ten: 'Lặp lại hằng ngày', ai: 'máy tự chạy' },
  { cap: 2, ten: 'Cá nhân hoá SOP', ai: 'trưởng bộ phận' },
  { cap: 3, ten: 'Việc mới chưa có SOP', ai: 'bộ phận liên quan' },
  { cap: 4, ten: 'Tạo SOP mới hoặc sửa quy trình', ai: 'hội đồng' },
  { cap: 5, ten: 'Nội dung hoặc tính năng nhạy cảm',
    ai: 'hội đồng và người có chuyên môn pháp lý', sanhGio: 168, soiLuat: true },
  { cap: 6, ten: 'Nâng cấp lớn hệ thống', ai: 'chủ hệ ký',
    sanhGio: 72, soiLuat: true, chuHeKy: true },
  { cap: 7, ten: 'Khủng hoảng khẩn', ai: 'đội ứng phó và chủ hệ trong một giờ' },
  { cap: 8, ten: 'Việc chưa ai từng gặp',
    ai: 'nhiều nguồn độc lập cùng soi', sanhGio: 72, soiLuat: true, chuHeKy: true }
];

/* Dấu hiệu để MÁY xếp cấp. Người đề xuất không tự chọn cấp — để họ tự
   xếp thì mọi thứ đều là Cấp 1, và không ai cố ý nói dối: họ chỉ thật
   lòng thấy việc mình đang làm là việc nhỏ. */
const DAU_CAP = [
  { dau: 'dữ liệu trẻ em', cap: 5 },
  { dau: 'hồ sơ của con', cap: 5 },
  { dau: 'tâm lý học viên', cap: 5 },
  { dau: 'dữ liệu gia đình', cap: 5 },
  { dau: 'gửi ra ngoài', cap: 5 },
  { dau: 'mô hình mới', cap: 6 },
  { dau: 'đổi kiến trúc', cap: 6 },
  { dau: 'nhà cung cấp mới', cap: 6 },
  { dau: 'đổi cơ sở dữ liệu', cap: 6 },
  { dau: 'rò dữ liệu', cap: 7 },
  { dau: 'khủng hoảng truyền thông', cap: 7 },
  { dau: 'bị tấn công', cap: 7 },
  { dau: 'chưa có tiền lệ', cap: 8 },
  { dau: 'chưa ai từng gặp', cap: 8 },
  { dau: 'sửa quy trình', cap: 4 },
  { dau: 'chuẩn hoá cách làm', cap: 4 },
  { dau: 'thêm sop', cap: 4 },
  { dau: 'chưa có sop', cap: 3 },
  { dau: 'lệch chuẩn', cap: 2 }
];

export const CUA5 = ['C1', 'C2', 'C3', 'C4', 'C5'];

function laR01(hoSo) { return String((hoSo || {}).role || '') === 'R01'; }

/* Một phép soi vai, dùng ở mọi cửa. Năm bản chép của cùng một biểu thức
   regex là năm chỗ để một bản trôi đi — và bản trôi thì không ai thấy,
   vì bốn bản kia vẫn đúng. */
function laNguoiNha(hoSo) {
  return /^R(0[1-9]|1[0-2])$/.test(String((hoSo || {}).role || ''));
}

/* Hồ sơ phiên mang tên ô là `hoSo.u`, KHÔNG phải `hoSo.username` —
   cái bẫy đã cắn kho này bốn lần (9.99.55 · 9.99.62 · 9.99.75). Gõ
   nhầm thì JavaScript trả `undefined`, phép so luôn sai, và cổng
   "người ký khác người đề xuất" mở với mọi người trong im lặng. */
function ten(hoSo) { return String((hoSo || {}).u || ''); }

/* ═══════════════ CỔNG VÙNG CẤM ═══════════════

   Soi chuỗi ĐÃ DỰNG XONG của cả đề xuất, không soi từng ô — cùng lối
   đã chọn ở cổng ẩn danh (9.99.62). Một cái tên kho nằm ở ô việc, ô
   vùng hay ô lùi lại đều như nhau, và soi từng ô là ba phép soi phải
   cùng nhớ. */
export function soatVungCam(deXuat) {
  const s = String(deXuat || '').toLowerCase();
  const cham = [];
  DAU_CHAM_VUNG.forEach(d => {
    if (s.indexOf(d.dau) >= 0 && cham.indexOf(d.ma) < 0) cham.push(d.ma);
  });
  cham.sort();

  return { sach: cham.length === 0, cham,
    vi: cham.length === 0
      ? 'Đề xuất này không chạm vùng không tự nâng cấp.'
      : 'Đề xuất chạm VÙNG KHÔNG TỰ NÂNG CẤP ' + cham.join(' · ') + '. Đây KHÔNG ' +
        'phải "cần duyệt cao hơn" — nó không đi qua đường này. "Cần duyệt cao hơn" ' +
        'là một cái thang, và mọi cái thang đều leo được; cái này là một cánh cửa ' +
        'khác: sửa kho gốc, qua một lượt phát hành, có người đọc diff, có bộ kiểm chạy.' };
}

/* ═══════════════ MÁY XẾP CẤP ═══════════════

   Trả về `ngoaiDuong` cho đề xuất chạm vùng cấm, KHÔNG trả một cấp
   cao. Trả "Cấp 8" là mời người ta đi tìm một chữ ký Cấp 8 — và một
   chữ ký Cấp 8 thì tìm được. */
export function xepCap(viec, vung, luiLai) {
  const s = [viec, vung, luiLai].map(x => String(x || '')).join(' · ').toLowerCase();

  const v = soatVungCam(s);
  if (!v.sach) return { ngoaiDuong: true, cham: v.cham, vi: v.vi };

  let cap = 1;
  const viSao = [];
  DAU_CAP.forEach(d => {
    if (s.indexOf(d.dau) >= 0) {
      if (d.cap > cap) cap = d.cap;
      viSao.push('"' + d.dau + '" → cấp ' + d.cap);
    }
  });

  const b = CAP8.find(c => c.cap === cap) || CAP8[0];
  return { cap, ten: b.ten, ai: b.ai,
    sanhGio: b.sanhGio, soiLuat: !!b.soiLuat, chuHeKy: !!b.chuHeKy,
    viSao: viSao.length ? viSao : ['không có dấu hiệu nào của cấp cao hơn'],
    khongTuChon: 'MÁY xếp cấp, không phải người đề xuất. Để người đề xuất tự xếp thì ' +
      'mọi thứ đều là Cấp 1 — không ai cố ý nói dối, họ chỉ thật lòng thấy việc mình ' +
      'đang làm là việc nhỏ.',
    xinNangDuoc: 'Máy xếp sai thì xin NÂNG cấp lên được, KHÔNG hạ xuống được. Lệch một ' +
      'chiều là cố ý: nâng nhầm thì tốn thời gian, hạ nhầm thì lọt.' };
}

/* ═══════════════ CỬA 1 · ĐỀ XUẤT ═══════════════ */
export async function deXuatNangCap(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Vòng nâng cấp mở cho R01–R12.' };

  const x = y || {};
  const viec = String(x.viec || '').trim();
  const vung = String(x.vung || '').trim();
  const luiLai = String(x.luiLai || '').trim();

  if (!viec || !vung)
    return { ok: false, code: 'THIEUO', error: 'Thiếu ô VIỆC GÌ hoặc ô VÙNG NÀO BỊ CHẠM.' };

  /* ── CỔNG 1 · VÙNG KHÔNG TỰ NÂNG CẤP ──
     Đứng TRƯỚC cổng "thiếu ô lùi lại". Báo thiếu ô trước là chỉ người
     đề xuất đường viết thêm một câu rồi gửi lại, trong khi đề xuất ấy
     không được tồn tại trên đường này. Cùng thứ tự đã chọn ở cổng trần
     giám sát (9.99.76). */
  const cV = soatVungCam(viec + ' · ' + vung + ' · ' + luiLai);
  if (!cV.sach) {
    await ghiSoDen(db, hoSo, 'TNC_CHAN_VUNG', cV.cham.join(' · '), viec.slice(0, 80));
    return { ok: false, code: 'VUNGCAM', cham: cV.cham, error: cV.vi,
      duongDoiThat: 'Muốn đổi thì sửa kho gốc, qua một lượt phát hành, có người đọc ' +
        'diff, có bộ kiểm chạy. Chậm hơn — và chậm ở đúng chỗ đáng chậm.' };
  }

  /* ── CỔNG 2 · PHẢI CÓ ĐƯỜNG LÙI ──
     Một nâng cấp không lùi lại được là một nâng cấp chỉ đi một chiều,
     và chiều ấy là chiều chưa ai thử. */
  if (luiLai.length < 10)
    return { ok: false, code: 'THIEULUI',
      error: 'Thiếu ô LÙI LẠI THẾ NÀO. Một nâng cấp không lùi lại được là một nâng cấp ' +
        'chỉ đi một chiều, và chiều ấy là chiều chưa ai thử.',
      phaiThu: 'Ô này còn phải được THỬ ở cửa 4, không chỉ được VIẾT ở đây. Một đường ' +
        'lùi chưa ai đi thử là một đường lùi không tồn tại — và người ta chỉ phát hiện ' +
        'ra điều đó vào đúng lúc cần nó.' };

  const xc = xepCap(viec, vung, luiLai);
  const id = 'NC-' + Date.now().toString(36) + '-' +
    Math.random().toString(36).slice(2, 6);
  const luc = new Date().toISOString();

  await db.prepare(
    'INSERT INTO luotNangCap (id,viec,vung,luiLai,cap,capViSao,aiDeXuat,deXuatLuc)' +
    ' VALUES (?,?,?,?,?,?,?,?)')
    .bind(id, viec, vung, luiLai, xc.cap, xc.viSao.join(' · '), ten(hoSo), luc).run();

  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'TNC_DEXUAT',
    doiTuong: id, chiTiet: 'cấp ' + xc.cap + ' · ' + viec.slice(0, 60) });

  return { ok: true, id, cap: xc.cap, tenCap: xc.ten, ai: xc.ai,
    viSao: xc.viSao, sanhGio: xc.sanhGio, soiLuat: xc.soiLuat, chuHeKy: xc.chuHeKy,
    khongTuChon: xc.khongTuChon, xinNangDuoc: xc.xinNangDuoc };
}

/* ═══════════════ CỬA 2 · SOI LUẬT ═══════════════

   Máy KHÔNG thay được cửa này. Một câu trả lời pháp lý do máy sinh ra
   nghe y hệt một câu trả lời thật (9.99.70), và người đọc nó đúng vào
   lúc đang vội. Nên cửa đòi TÊN NGƯỜI soi, và tên ấy không được là
   người đề xuất. */
export async function soiLuatNangCap(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Cửa soi luật mở cho R01–R12.' };

  const x = y || {};
  const id = String(x.id || '').trim();
  const ketLuan = String(x.ketLuan || '').trim();
  const nguoiSoi = String(x.nguoiSoi || '').trim();

  const d = await docLuot(db, id);
  if (!d) return { ok: false, code: 'KHONGCO', error: 'Không có lượt nâng cấp: ' + id };

  const ct = soatThuTu(d, 'C2');
  if (ct) return ct;

  if (!nguoiSoi || ketLuan.length < 10)
    return { ok: false, code: 'THIEUO',
      error: 'Cửa soi luật phải có TÊN NGƯỜI SOI và KẾT LUẬN. Máy không thay được cửa ' +
        'này — một câu trả lời pháp lý do máy sinh ra nghe y hệt một câu thật.' };

  /* ── TÊN NGƯỜI SOI PHẢI LÀ MỘT TÀI KHOẢN CÓ THẬT ──
     Nhận chữ tự do thì gõ "luật sư A" là qua, và ô ấy thành một lời
     khai không kiểm lại được — đúng thứ cửa này sinh ra để chặn.

     Và cổng KHÔNG XÁC MINH ĐƯỢC thì ĐÓNG, không bỏ qua: cùng bài học
     đã ghi ở cổng NGANGCAP (9.99.76), nơi một dòng `!== null && ...`
     làm cổng chưa bao giờ chặn gì. */
  const ndSoi = (await Kho.nguoiTheoTen(db, nguoiSoi).catch(() => null)) ||
    (await Kho.nguoiTheoId(db, nguoiSoi).catch(() => null));
  if (!ndSoi) return { ok: false, code: 'KHONGRONGUOI',
    error: 'Không tra được người soi luật: ' + nguoiSoi + '. Nhận một cái tên tự do ' +
      'thì ô ấy là một lời khai không kiểm lại được — mà cả cửa này sinh ra để chặn ' +
      'đúng chuyện đó.' };

  /* So bằng ĐỊNH DANH CHÍNH TẮC (uid), không so chuỗi thô: nguoiSoi nhận
     id/tên/email (bộ tra ngay trên), mà aiDeXuat lưu là username — gửi id
     hoặc email của chính người đề xuất thì chuỗi khác nhau nhưng CÙNG một
     người, lách qua TUSOI. Lỗ 9.99.112 (F1 tổ soi tự nâng cấp). ndSoi đã
     tra ở trên; quy aiDeXuat về uid rồi so. */
  const uidDeXuat = await Kho.layUid(db, d.aiDeXuat);
  if (ndSoi.id === uidDeXuat)
    return { ok: false, code: 'TUSOI',
      error: 'Người soi luật không được là người đề xuất. Cùng một người làm cả hai thì ' +
        'phần soi chỉ là phần đề xuất nói lại lần nữa, và nó sẽ đồng ý với chính nó — ' +
        'mà sổ vẫn đủ năm dòng nên không ai đọc ra.' };

  const luc = new Date().toISOString();
  await db.prepare(
    'UPDATE luotNangCap SET nguoiSoi = ?, soiKetLuan = ?, soiLuc = ? WHERE id = ?')
    .bind(nguoiSoi, ketLuan, luc, id).run();
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'TNC_SOILUAT',
    doiTuong: id, chiTiet: nguoiSoi + ' · ' + ketLuan.slice(0, 60) });
  return { ok: true, id, cua: 'C2', nguoiSoi, soiLuc: luc };
}

/* ═══════════════ CỬA 3 · CHỦ HỆ KÝ ═══════════════ */
export async function kyNangCap(y, env, db, hoSo) {
  if (!laR01(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Chỉ R01 ký được lượt nâng cấp.' };

  const id = String((y || {}).id || '').trim();
  const d = await docLuot(db, id);
  if (!d) return { ok: false, code: 'KHONGCO', error: 'Không có lượt nâng cấp: ' + id };

  const ct = soatThuTu(d, 'C3');
  if (ct) return ct;

  /* ── NGƯỜI KÝ KHÁC NGƯỜI ĐỀ XUẤT ──
     Cùng luật L3 của thang năm cổng (9.99.42) và vai C khác vai A
     (9.99.72). Sổ vẫn đủ năm dòng khi một người làm cả hai — nên cái
     được canh phải là HAI CÁI TÊN, không phải năm dòng. */
  if (ten(hoSo) === d.aiDeXuat)
    return { ok: false, code: 'TUKY',
      error: 'Người ký không được là người đề xuất. Cùng một người làm cả hai thì phần ' +
        'duyệt chỉ là phần đề xuất nói lại lần nữa, và nó sẽ đồng ý với chính nó.' };

  const luc = new Date().toISOString();
  await db.prepare('UPDATE luotNangCap SET aiKy = ?, kyLuc = ? WHERE id = ?')
    .bind(ten(hoSo), luc, id).run();
  await ghiSoDen(db, hoSo, 'TNC_KY', id, 'cấp ' + d.cap + ' · ' + String(d.viec).slice(0, 60));
  return { ok: true, id, cua: 'C3', aiKy: ten(hoSo), kyLuc: luc };
}

/* ═══════════════ CỬA 4 · CHẠY THỬ TÁCH BIỆT ═══════════════

   ĐỒNG HỒ, không phải một ô tích. Máy so HAI MỐC THẬT — một ô "đã chạy
   thử đủ" bật được trong một giây, và con số giờ vẫn đủ trong sổ.

   Và đường LÙI phải được THỬ ở đây, không chỉ được VIẾT ở cửa 1. */
export async function mocChayThu(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Cửa chạy thử mở cho R01–R12.' };

  const x = y || {};
  const id = String(x.id || '').trim();
  const moc = String(x.moc || '').trim();      /* 'bat' hoặc 'ket' */

  const d = await docLuot(db, id);
  if (!d) return { ok: false, code: 'KHONGCO', error: 'Không có lượt nâng cấp: ' + id };

  const ct = soatThuTu(d, 'C4');
  if (ct) return ct;

  const luc = new Date().toISOString();

  if (moc === 'bat') {
    await db.prepare('UPDATE luotNangCap SET thuBatDau = ? WHERE id = ?').bind(luc, id).run();
    return { ok: true, id, cua: 'C4', thuBatDau: luc,
      dongHo: 'Máy so HAI MỐC THẬT. Mốc kết thúc ghi lúc bấm, không gõ tay được.' };
  }

  if (moc !== 'ket')
    return { ok: false, code: 'THIEUO', error: 'Mốc phải là "bat" hoặc "ket".' };

  if (!d.thuBatDau)
    return { ok: false, code: 'CHUABAT',
      error: 'Chưa có mốc BẮT ĐẦU. Không có mốc đầu thì không có quãng nào để đo, và ' +
        'một quãng không đo được là một ô tích đội lốt một phép đo.' };

  const kq = String(x.ketQua || '').trim();
  const luiDaThu = x.luiLaiDaThu === true;

  if (kq.length < 10)
    return { ok: false, code: 'THIEUKQ', error: 'Phải viết KẾT QUẢ chạy thử.' };

  /* ── ĐƯỜNG LÙI PHẢI ĐƯỢC THỬ ──
     Viết ở cửa 1 là một lời khai; thử ở cửa 4 là một phép đo. Một
     đường lùi chưa ai đi thử là một đường lùi không tồn tại, và người
     ta chỉ phát hiện ra điều đó vào đúng lúc cần nó. */
  if (!luiDaThu)
    return { ok: false, code: 'CHUATHULUI',
      error: 'Đường LÙI LẠI chưa được thử. Viết ở cửa 1 là một lời khai; thử ở cửa 4 ' +
        'mới là một phép đo. Một đường lùi chưa ai đi thử là một đường lùi không tồn ' +
        'tại — và người ta chỉ phát hiện ra điều đó vào đúng lúc cần nó.',
      duongLui: d.luiLai };

  await db.prepare(
    'UPDATE luotNangCap SET thuKetThuc = ?, thuKetQua = ?, luiLaiDaThu = 1 WHERE id = ?')
    .bind(luc, kq, id).run();

  const gio = (Date.parse(luc) - Date.parse(d.thuBatDau)) / 3600000;
  return { ok: true, id, cua: 'C4', thuKetThuc: luc, gioDaChay: Math.round(gio * 100) / 100,
    dongHo: 'Hai mốc thật, không phải một ô tích.' };
}

/* ═══════════════ CỬA 5 · ĐƯA VÀO CHẠY ═══════════════ */
export async function batNangCap(y, env, db, hoSo) {
  if (!/^R0[1-2]$/.test(String((hoSo || {}).role || '')))
    return { ok: false, code: 'NOPERM', error: 'Cửa đưa vào chạy mở cho R01–R02.' };

  const id = String((y || {}).id || '').trim();
  const d = await docLuot(db, id);
  if (!d) return { ok: false, code: 'KHONGCO', error: 'Không có lượt nâng cấp: ' + id };

  const ct = soatThuTu(d, 'C5');
  if (ct) return ct;

  /* ── SÀNH GIỜ ──
     Cấp 6 cần 72 giờ, cấp 5 cần 168 giờ. So hai mốc thật, không đọc
     một ô "đã chạy đủ". */
  const b = CAP8.find(c => c.cap === Number(d.cap));
  if (b && b.sanhGio) {
    const gio = (Date.now() - Date.parse(d.thuBatDau)) / 3600000;
    if (!(gio >= b.sanhGio))
      return { ok: false, code: 'CHUADUGIO', canGio: b.sanhGio,
        daChay: Math.round(gio * 100) / 100,
        error: 'Cấp ' + d.cap + ' cần chạy thử ' + b.sanhGio + ' giờ, mới được ' +
          Math.round(gio * 100) / 100 + ' giờ. Máy so HAI MỐC THẬT — một ô tích "đã ' +
          'chạy thử đủ" thì bật được trong một giây.' };
  }

  const luc = new Date().toISOString();
  await db.prepare('UPDATE luotNangCap SET aiBat = ?, batLuc = ? WHERE id = ?')
    .bind(ten(hoSo), luc, id).run();
  await ghiSoDen(db, hoSo, 'TNC_BAT', id, 'cấp ' + d.cap + ' · ' + String(d.viec).slice(0, 60));

  return { ok: true, id, cua: 'C5', aiBat: ten(hoSo), batLuc: luc,
    vi: 'Cửa cuối có một cái tên. Cơ chế hậu kiểm nghĩa là sai thì sai CÔNG KHAI, và ' +
      'lúc ấy câu hỏi đầu tiên là ai đã bấm.' };
}

/* ═══════════════ THỨ TỰ NĂM CỬA ═══════════════

   Năm cửa đi ĐÚNG THỨ TỰ. Soi luật sau khi đã chạy thì bản được soi
   không phải bản sắp chạy.

   Cấp nào đòi cửa nào thì đọc từ CAP8 — không chép một bảng thứ hai.
   Hai bảng thì cái nào cũng tự tin, và lúc gấp người ta đọc cái gần
   tay hơn. */
function soatThuTu(d, cua) {
  const b = CAP8.find(c => c.cap === Number(d.cap)) || {};

  if (cua === 'C2' && !b.soiLuat)
    return { ok: false, code: 'KHONGCANSOI',
      error: 'Cấp ' + d.cap + ' không đi qua cửa soi luật. Ghi một cửa không cần đi là ' +
        'làm sổ dài ra mà không thêm một phép canh nào.' };

  if (cua === 'C3') {
    if (!b.chuHeKy) return { ok: false, code: 'KHONGCANKY',
      error: 'Cấp ' + d.cap + ' không cần chữ ký chủ hệ.' };
    if (b.soiLuat && !d.soiLuc) return nhayCua('C2', 'C3');
  }

  if (cua === 'C4') {
    if (!b.sanhGio) return { ok: false, code: 'KHONGCANTHU',
      error: 'Cấp ' + d.cap + ' không đòi chạy thử tách biệt.' };
    if (b.soiLuat && !d.soiLuc) return nhayCua('C2', 'C4');
    if (b.chuHeKy && !d.kyLuc) return nhayCua('C3', 'C4');
  }

  if (cua === 'C5') {
    if (b.soiLuat && !d.soiLuc) return nhayCua('C2', 'C5');
    if (b.chuHeKy && !d.kyLuc) return nhayCua('C3', 'C5');
    if (b.sanhGio && !d.thuKetThuc) return nhayCua('C4', 'C5');
    if (b.sanhGio && !Number(d.luiLaiDaThu)) return { ok: false, code: 'CHUATHULUI',
      error: 'Đường lùi chưa được thử ở cửa 4.' };
    if (d.batLuc) return { ok: false, code: 'DABAT',
      error: 'Lượt này đã được đưa vào chạy lúc ' + d.batLuc + '.' };
  }

  return null;
}

function nhayCua(thieu, dangO) {
  return { ok: false, code: 'NHAYCUA', thieu,
    error: 'Nhảy cửa: chưa qua ' + thieu + ' mà đã tới ' + dangO + '. Năm cửa đi ĐÚNG ' +
      'THỨ TỰ — soi luật sau khi đã chạy thì bản được soi không phải bản sắp chạy.' };
}

async function docLuot(db, id) {
  if (!id) return null;
  return await db.prepare('SELECT * FROM luotNangCap WHERE id = ?').bind(id).first();
}

/* ═══════════════ ĐỌC VÒNG ═══════════════

   Nêu RIÊNG phần còn thiếu của MÁY và phần còn thiếu của NGƯỜI. Gộp
   thành một con số "đã qua mấy cửa" thì một lượt vừa chạy xong cửa máy
   trông gần xong, trong khi thứ còn thiếu là cả hai cửa của người —
   cùng luật với `docVongChay` của bộ prompt (9.99.72). */
export async function docVongNangCap(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Sổ nâng cấp mở cho R01–R12.' };

  const r = await db.prepare(
    'SELECT * FROM luotNangCap ORDER BY deXuatLuc DESC LIMIT 200').all();
  const ds = (r.results || r || []);

  const dangChay = [], daBat = [];
  ds.forEach(d => {
    const b = CAP8.find(c => c.cap === Number(d.cap)) || {};
    const thieuNguoi = [], thieuMay = [];
    if (b.soiLuat && !d.soiLuc) thieuNguoi.push('C2 soi luật');
    if (b.chuHeKy && !d.kyLuc) thieuNguoi.push('C3 chủ hệ ký');
    if (b.sanhGio && !d.thuKetThuc) thieuMay.push('C4 chạy thử ' + b.sanhGio + ' giờ');
    if (b.sanhGio && !Number(d.luiLaiDaThu)) thieuMay.push('C4 thử đường lùi');
    if (!d.batLuc) thieuNguoi.push('C5 đưa vào chạy');

    const mo = { id: d.id, viec: d.viec, cap: d.cap, aiDeXuat: d.aiDeXuat,
      deXuatLuc: d.deXuatLuc, thieuNguoi, thieuMay };
    if (d.batLuc) daBat.push({ id: d.id, viec: d.viec, cap: d.cap,
      aiBat: d.aiBat, batLuc: d.batLuc });
    else dangChay.push(mo);
  });

  return { ok: true, so: ds.length, dangChay, daBat,
    khongGopSo: 'Phần thiếu của MÁY và phần thiếu của NGƯỜI nêu riêng. Gộp thành một ' +
      'con số "đã qua mấy cửa" thì một lượt vừa chạy xong cửa máy trông gần xong, ' +
      'trong khi thứ còn thiếu là cả hai cửa của người.' };
}

/* ═══════════════ ĐỌC BẢN TRẦN ═══════════════ */
export async function docTranNangCap(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Bản trần nâng cấp mở cho R01–R12.' };
  return { ok: true, vung: VUNG_CAM, cua: CUA5, soCap: CAP8.length,
    soDauHieu: DAU_CHAM_VUNG.length,
    vi: VUNG_CAM.length + ' vùng KHÔNG đi qua đường tự nâng cấp. Chạm vùng ấy không ' +
      'phải "cần duyệt cao hơn" — "cần duyệt cao hơn" là một cái thang, và mọi cái ' +
      'thang đều leo được; cái này là một cánh cửa khác.',
    khongCoCuaNoiLong: 'Mô-đun này KHÔNG có cửa nào nới một vùng ra. Viết cửa ấy rồi ' +
      'mới cấm gọi là muộn.' };
}

/* Không xem được sổ thì cũng không đọc được gì — nhưng phép xếp cấp thì
   đọc được, vì nó chỉ nói máy sẽ xếp thế nào. Một người muốn biết việc
   của mình rơi vào cấp nào TRƯỚC khi viết đề xuất là người đang làm
   đúng thứ tự. */
export async function thuXepCap(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Phép xếp cấp mở cho R01–R12.' };
  const x = y || {};
  return { ok: true, ...xepCap(x.viec, x.vung, x.luiLai),
    chuaGhiGi: 'Phép này KHÔNG ghi gì vào sổ. Nó chỉ nói máy sẽ xếp thế nào.' };
}
