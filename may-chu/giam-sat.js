/* ═══════════════════════════════════════════════════════════════
   GITA-VIP — TRẦN PHẠM VI GIÁM SÁT · PHẦN CÓ RĂNG

   Bản chép của G.VIP_* — bộ kiểm mục 92 đối chiếu từng ô với kho.

   ══ MÔ-ĐUN NÀY KHÔNG GIÁM SÁT AI ══

   Nó chỉ CẤP và THU lệnh, và từ chối những lệnh không được phép tồn
   tại. Bộ giám sát dựng sau, và nó phải đi qua đây.

   Dựng theo thứ tự ấy có chủ ý, cùng lối đã chọn ở 9.99.62 với Hiến
   pháp: một cái cổng dựng SAU một cái cửa đã chạy thì nó chỉ là một
   lời nhắc — người ta đọc, thấy hợp lý với việc hôm nay, rồi vẫn gọi.

   ══ TRẦN KHÁC QUYỀN ══

   `CAM_TUYET_DOI` không cấp được, kể cả bằng lệnh R01 có chữ ký. Đó
   là khác biệt giữa một cái TRẦN và một cái QUYỀN: quyền thì cấp
   được, và một quyền cấp được là một quyền sẽ được cấp — đúng vào
   ngày có người thấy cần.

   ══ SỔ NỐI BĂM ══

   Mỗi dòng mang băm của dòng trước. Sửa một dòng giữa sổ là vỡ mọi
   dòng sau nó, và `soatSoDen` nói ra vỡ ở đâu. Không chống được người
   xoá cả sổ — chống được người sửa một dòng rồi để nguyên phần còn
   lại, và đó mới là thứ hay xảy ra.
   ═══════════════════════════════════════════════════════════════ */

import { Kho } from './nen.js';

/* ═══════════════ SÁU ĐIỀU KHÔNG LỆNH NÀO MỞ ĐƯỢC ═══════════════

   Mỗi mã kèm LUẬT NÀO cấm. Không kèm thì sáu tháng sau có người gỡ nó
   đi mà không biết mình đang gỡ cái gì. */
export const CAM_TUYET_DOI = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'];

/* Dấu hiệu của một phạm vi chạm trần. Dò CỤM NHIỀU ÂM TIẾT, cùng luật
   chọn dấu hiệu của CUM_TUYET_DOI (9.99.65): "hạng" trần nằm trong
   "hạng mục", "thứ hạng ưu tiên xử lý" — những câu hoàn toàn lành, và
   bắt oan một câu lành thì lần sau người ta tắt phép soi đi. */
export const DAU_CHAM_TRAN = [
  { dau: 'xếp hạng học', ma: 'C1' },
  { dau: 'xếp hạng trẻ', ma: 'C1' },
  { dau: 'xếp hạng gia đình', ma: 'C1' },
  { dau: 'so sánh học viên', ma: 'C1' },
  { dau: 'bảng xếp hạng', ma: 'C1' },
  { dau: 'sinh trắc', ma: 'C2' },
  { dau: 'nhận diện khuôn mặt', ma: 'C2' },
  { dau: 'nhịp gõ phím', ma: 'C2' },
  { dau: 'đối chiếu giọng', ma: 'C2' },
  { dau: 'ghi âm liên tục', ma: 'C3' },
  { dau: 'quay hình liên tục', ma: 'C3' },
  { dau: 'camera liên tục', ma: 'C3' },
  { dau: 'hạ cấp', ma: 'C4' },
  { dau: 'tụt hạng', ma: 'C4' },
  { dau: 'tạm giữ tiến độ', ma: 'C4' },
  { dau: 'đặt lại chuỗi', ma: 'C4' },
  { dau: 'doạ mất chuỗi', ma: 'C5' },
  { dau: 'đếm ngược', ma: 'C5' },
  { dau: 'bắt viết lý do', ma: 'C6' },
  { dau: 'khảo sát sau', ma: 'C6' }
];

/* Ba ngăn phạm vi, khác nhau ở CĂN CỨ PHÁP LÝ chứ không ở mức độ. */
export const NGAN = ['NHANSU', 'KHACH', 'TRE'];
export const VAI_NGAN = {
  NHANSU: /^R(0[1-9]|1[0-2])$/,
  KHACH: /^R13$/,
  TRE: /^R14$/
};

const BAC = { R01: 1, R02: 2, R03: 3, R04: 4, R05: 5, R06: 6, R07: 7, R08: 8,
  R09: 9, R10: 10, R11: 11, R12: 12, R13: 13, R14: 14, R15: 15 };

function laR01(hoSo) { return String((hoSo || {}).role || '') === 'R01'; }
function xemDuoc(hoSo) { return /^R0[1-3]$/.test(String((hoSo || {}).role || '')); }

/* ═══════════════ CỔNG TRẦN ═══════════════

   Soi CẢ chuỗi phạm vi lẫn ngăn. Ngăn TRE bị cấm nhiều thứ hơn hai
   ngăn kia — không phải vì trẻ đáng ngờ hơn, mà vì trẻ không ký được
   hợp đồng nào và không rời đi được. */
export function soatPhamVi(phamVi, ngan) {
  const s = String(phamVi || '').toLowerCase();
  const cham = [];
  DAU_CHAM_TRAN.forEach(d => {
    if (s.indexOf(d.dau) >= 0 && cham.indexOf(d.ma) < 0) cham.push(d.ma);
  });

  /* Ngăn TRE: mọi thứ theo giây và mọi hồ sơ tính cách đều chạm trần,
     kể cả khi câu chữ không mang dấu hiệu nào ở trên. */
  if (String(ngan || '') === 'TRE' &&
      /theo giây|từng giây|1hz|hồ sơ tính cách|phân loại tính cách/.test(s) &&
      cham.indexOf('C2') < 0) cham.push('C2');

  return { sach: cham.length === 0, cham,
    vi: cham.length === 0
      ? 'Phạm vi này nằm dưới trần.'
      : 'Phạm vi chạm ĐIỀU CẤM ' + cham.join(' · ') + '. Đây là TRẦN, không phải ' +
        'quyền — không lệnh nào mở được, kể cả lệnh R01 có chữ ký. Quyền thì cấp ' +
        'được, và một quyền cấp được là một quyền sẽ được cấp đúng vào ngày có ' +
        'người thấy cần.' };
}

/* ═══════════════ CẤP MỘT LỆNH ═══════════════ */
export async function capLenhGiamSat(y, env, db, hoSo) {
  if (!laR01(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Chỉ R01 cấp được lệnh giám sát. Không ai tự cấp cho mình.' };

  const x = y || {};
  const phamVi = String(x.phamVi || '').trim();
  const ngan = String(x.ngan || '').trim();
  const lyDo = String(x.lyDo || '').trim();
  const choAi = String(x.choAi || '').trim();
  const hanDen = String(x.hanDen || '').trim();

  if (!phamVi || NGAN.indexOf(ngan) < 0 || !choAi)
    return { ok: false, code: 'THIEUO',
      error: 'Thiếu phạm vi, người được cấp, hoặc ngăn không phải ' + NGAN.join(' · ') + '.' };

  /* ── CỔNG 1 · TRẦN ──
     Đứng TRƯỚC mọi cổng khác. Một lệnh chạm trần thì không có chuyện
     "thiếu lý do" hay "thiếu hạn" nữa — nó không được tồn tại, và nói
     cho người cấp biết họ thiếu lý do là chỉ họ đường viết thêm một
     câu rồi gửi lại. */
  const t = soatPhamVi(phamVi, ngan);
  if (!t.sach) {
    await ghiSoDen(db, hoSo, 'VIP_CHAN_TRAN', choAi, phamVi + ' · ' + t.cham.join(' · '));
    return { ok: false, code: 'CHAMTRAN', cham: t.cham, error: t.vi };
  }

  /* ── CỔNG 2 · KHÔNG TỰ CẤP CHO MÌNH ──
     Kiểm nhanh theo chuỗi thô (bắt hình id/username hiển nhiên); phép kiểm
     THẬT theo định danh chính tắc nằm SAU khi tra được `nd` (cổng 5) —
     choAi nhận cả email, mà so thô ở đây bỏ sót email của chính mình khi
     email ≠ username. Lỗ 9.99.112 (F2 tổ soi giám sát). */
  if (choAi === String(hoSo.u || '') || choAi === String(hoSo.uid || ''))
    return { ok: false, code: 'TUCAP',
      error: 'Không tự cấp quyền giám sát cho chính mình. Người ký và người được cấp ' +
        'là một thì chữ ký ấy không chứng minh gì.' };

  /* ── CỔNG 3 · PHẢI CÓ HẠN ──
     Một quyền không có hạn là một quyền không ai nhớ đi thu lại. Sáu
     tháng sau nó vẫn mở, người được cấp đã chuyển việc, và không ai
     biết nó còn đó. */
  const han = Date.parse(hanDen);
  if (!hanDen || !Number.isFinite(han)) return { ok: false, code: 'THIEUHAN',
    error: 'Lệnh giám sát PHẢI có hạn. Không có quyền vĩnh viễn mặc định.' };
  if (han <= Date.now()) return { ok: false, code: 'HANQUA',
    error: 'Hạn phải ở tương lai.' };

  /* ── CỔNG 4 · PHẢI VIẾT LÝ DO ── */
  if (lyDo.length < 10) return { ok: false, code: 'THIEULYDO',
    error: 'Lệnh giám sát phải viết LÝ DO. Một sổ lệnh không có lý do chỉ kể được ' +
      'rằng ĐÃ cấp, không kể được VÌ SAO — và không ai dám thu lại một thứ mình ' +
      'không hiểu vì sao có.' };

  /* ── CỔNG 5 · KHÔNG GIÁM SÁT VAI NGANG HOẶC TRÊN ──
     Cho phép thì một người tự bảo vệ mình bằng cách nhìn vào người có
     thể soi mình, và sổ audit thành vũ khí thay vì bằng chứng.

     ══ CỔNG KHÔNG TRA ĐƯỢC NGƯỜI THÌ ĐÓNG, KHÔNG BỎ QUA ══

     Bản đầu viết `if (bacNguoi !== null && ...)` — tức là **không tìm
     thấy người thì bỏ qua cổng**. Bộ thử bắt ngay: `nguoiTheoId` tra
     theo ID, mà lệnh khai người bằng tên đăng nhập, nên `nd` luôn null
     và cổng chưa bao giờ chặn gì.

     Hai lỗi trong một dòng, và lỗi thứ hai nặng hơn: một cổng KHÔNG
     XÁC MINH ĐƯỢC thì phải ĐÓNG. Mở là chọn cái tiện lúc viết, và cái
     tiện ấy đúng vào chỗ nguy hiểm nhất — người không tra được là
     người đáng hỏi thêm nhất. */
  const nd = (await Kho.nguoiTheoTen(db, choAi).catch(() => null)) ||
    (await Kho.nguoiTheoId(db, choAi).catch(() => null));
  if (!nd) return { ok: false, code: 'KHONGRONGUOI',
    error: 'Không tra được người được cấp: ' + choAi + '. Cổng không xác minh được ' +
      'thì ĐÓNG, không bỏ qua — người không tra được là người đáng hỏi thêm nhất.' };

  /* Cổng 2 THẬT — theo định danh chính tắc: choAi resolve về chính người
     ký (dù gõ bằng email) thì vẫn là tự cấp. Bắt lỗ email của 9.99.112. */
  if (String(nd.id) === String(hoSo.uid || ''))
    return { ok: false, code: 'TUCAP',
      error: 'Không tự cấp quyền giám sát cho chính mình (kể cả khai bằng email). ' +
        'Người ký và người được cấp là một thì chữ ký ấy không chứng minh gì.' };

  const bacNguoi = BAC[nd.role] || 99;
  const bacDich = Number(x.bacDich || 99);
  if (!Number.isFinite(bacDich) || bacDich >= 99) return { ok: false, code: 'THIEUBAC',
    error: 'Lệnh phải khai BẬC VAI bị nhìn vào. Không khai thì luật "không nhìn vai ' +
      'ngang hoặc trên" không kiểm được, mà luật ấy là cả lý do cổng này tồn tại.' };
  if (bacDich <= bacNguoi)
    return { ok: false, code: 'NGANGCAP', bacNguoi, bacDich,
      error: 'Người được cấp ở bậc ' + bacNguoi + ', lệnh này cho nhìn vào bậc ' +
        bacDich + ' — ngang hoặc trên. Cho phép thì một người tự bảo vệ mình bằng ' +
        'cách nhìn vào người có thể soi mình, và sổ audit thành vũ khí thay vì bằng chứng.' };

  const id = 'GS-' + Date.now().toString(36) + '-' +
    Math.random().toString(36).slice(2, 6);
  const ghiLuc = new Date().toISOString();
  await db.prepare(
    'INSERT INTO lenhGiamSat (id,phamVi,ngan,choAi,lyDo,aiKy,hanDen,ghiLuc,thuLuc)' +
    ' VALUES (?,?,?,?,?,?,?,?,NULL)')
    .bind(id, phamVi, ngan, choAi, lyDo, String(hoSo.u || ''),
      new Date(han).toISOString(), ghiLuc).run();

  await ghiSoDen(db, hoSo, 'VIP_CAP_LENH', choAi,
    ngan + ' · ' + phamVi.slice(0, 60) + ' · hạn ' + new Date(han).toISOString().slice(0, 10));

  return { ok: true, id, phamVi, ngan, choAi, hanDen: new Date(han).toISOString(),
    tuThuHoi: 'Lệnh TỰ HẾT HIỆU LỰC lúc hạn, không cần ai đi thu. Còn hiệu lực hay ' +
      'không thì tính LÚC ĐỌC — bảng không có cột "đang hiệu lực", vì một cột như ' +
      'thế phải có người cập nhật, và ngày không ai cập nhật thì nó khai một quyền ' +
      'đã hết hạn là còn.' };
}

export async function thuLenhGiamSat(y, env, db, hoSo) {
  if (!laR01(hoSo)) return { ok: false, code: 'NOPERM', error: 'Chỉ R01 thu được lệnh.' };
  const id = String((y || {}).id || '').trim();
  if (!id) return { ok: false, code: 'THIEUO', error: 'Thiếu mã lệnh.' };
  const luc = new Date().toISOString();
  await db.prepare('UPDATE lenhGiamSat SET thuLuc = ? WHERE id = ? AND thuLuc IS NULL')
    .bind(luc, id).run();
  await ghiSoDen(db, hoSo, 'VIP_THU_LENH', id, String((y || {}).lyDo || '').slice(0, 80));
  return { ok: true, id, thuLuc: luc };
}

/* ═══════════════ ĐỌC SỔ LỆNH ═══════════════

   Còn hiệu lực TÍNH LÚC ĐỌC. Và nêu RIÊNG ba nhóm — đang chạy, đã hết
   hạn, đã thu tay: gộp thành một con số "bao nhiêu lệnh" thì một quyền
   đã hết hạn nằm chung rổ với một quyền vừa được cấp sáng nay. */
export async function docLenhGiamSat(y, env, db, hoSo) {
  if (!xemDuoc(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Sổ lệnh giám sát mở cho R01–R03.' };

  const r = await db.prepare('SELECT * FROM lenhGiamSat ORDER BY ghiLuc DESC LIMIT 500').all();
  const ds = (r.results || r || []);
  const bay = Date.now();

  const dangChay = ds.filter(d => !d.thuLuc && Date.parse(d.hanDen) > bay);
  const hetHan = ds.filter(d => !d.thuLuc && Date.parse(d.hanDen) <= bay);
  const daThu = ds.filter(d => !!d.thuLuc);

  return { ok: true, so: ds.length, dangChay, hetHan, daThu,
    vi: dangChay.length + ' lệnh đang chạy · ' + hetHan.length + ' đã tự hết hạn · ' +
      daThu.length + ' đã thu tay.',
    khongGopSo: 'Ba nhóm KHÔNG gộp. Gộp thành một con số thì một quyền đã hết hạn nằm ' +
      'chung rổ với một quyền vừa cấp sáng nay, và người đọc không phân biệt được.' };
}

/* ═══════════════ SỔ NỐI BĂM ═══════════════

   Mỗi dòng mang băm của dòng trước. Sửa một dòng giữa sổ là vỡ mọi
   dòng sau nó.

   Nói rõ giới hạn, đừng để người đọc tự suy: cách này KHÔNG chống được
   người xoá cả sổ hay dựng lại sổ từ đầu. Nó chống được người sửa MỘT
   dòng rồi để nguyên phần còn lại — và đó mới là thứ hay xảy ra, vì
   xoá cả sổ thì ai cũng thấy. */
async function bamChuoi(s) {
  const b = new TextEncoder().encode(String(s));
  const h = await crypto.subtle.digest('SHA-256', b);
  return [...new Uint8Array(h)].map(x => x.toString(16).padStart(2, '0')).join('');
}

export async function ghiSoDen(db, hoSo, viec, doiTuong, chiTiet) {
  const truoc = await db.prepare(
    'SELECT bamTu FROM soDen ORDER BY stt DESC LIMIT 1').first();
  const bamTruoc = (truoc && truoc.bamTu) || 'GITA-VIP-GOC';
  const luc = new Date().toISOString();
  const than = [luc, String((hoSo || {}).u || ''), viec, String(doiTuong || ''),
    String(chiTiet || '')].join('|');
  const bamTu = await bamChuoi(bamTruoc + '|' + than);
  await db.prepare(
    'INSERT INTO soDen (luc,aiLam,viec,doiTuong,chiTiet,bamTruoc,bamTu)' +
    ' VALUES (?,?,?,?,?,?,?)')
    .bind(luc, String((hoSo || {}).u || ''), viec, String(doiTuong || ''),
      String(chiTiet || ''), bamTruoc, bamTu).run();
  return bamTu;
}

/* Soi lại cả chuỗi và NÓI RA VỠ Ở ĐÂU — không trả một chữ "đạt". Một
   chữ "đạt" không nói dòng nào bị sửa, và sửa mò thì lần sau không tìm
   được nữa. */
export async function soatSoDen(y, env, db, hoSo) {
  if (!xemDuoc(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Sổ giám sát mở cho R01–R03.' };

  const r = await db.prepare(
    'SELECT stt,luc,aiLam,viec,doiTuong,chiTiet,bamTruoc,bamTu FROM soDen ORDER BY stt ASC').all();
  const ds = (r.results || r || []);
  let truoc = 'GITA-VIP-GOC';
  const vo = [];
  for (const d of ds) {
    const than = [d.luc, d.aiLam, d.viec, d.doiTuong, d.chiTiet].join('|');
    const mong = await bamChuoi(truoc + '|' + than);
    if (d.bamTruoc !== truoc || d.bamTu !== mong)
      vo.push({ stt: d.stt, luc: d.luc, viec: d.viec });
    truoc = d.bamTu;
  }

  return { ok: true, so: ds.length, lanh: vo.length === 0, vo,
    vi: vo.length === 0
      ? ds.length + ' dòng, chuỗi băm liền mạch.'
      : 'CHUỖI VỠ ở ' + vo.length + ' chỗ, dòng đầu tiên là số ' + vo[0].stt + ' (' +
        vo[0].luc + '). Một dòng bị sửa làm vỡ mọi dòng sau nó — chỗ vỡ ĐẦU TIÊN là ' +
        'chỗ đáng nhìn, phần sau chỉ là hệ quả.',
    khongChanDuocGi: 'Cách này KHÔNG chống được người xoá cả sổ hay dựng lại sổ từ ' +
      'đầu. Nó chống được người sửa MỘT dòng rồi để nguyên phần còn lại — và đó mới ' +
      'là thứ hay xảy ra, vì xoá cả sổ thì ai cũng thấy.' };
}

/* ═══════════════ ĐỌC BẢN TRẦN ═══════════════ */
export async function docTranGiamSat(y, env, db, hoSo) {
  if (!/^R(0[1-9]|1[0-2])$/.test(String((hoSo || {}).role || '')))
    return { ok: false, code: 'NOPERM', error: 'Bản trần giám sát mở cho R01–R12.' };
  return { ok: true, cam: CAM_TUYET_DOI, ngan: NGAN, soDauHieu: DAU_CHAM_TRAN.length,
    vi: CAM_TUYET_DOI.length + ' điều CẤM TUYỆT ĐỐI — không lệnh nào mở được, kể cả ' +
      'lệnh R01 có chữ ký. Ba ngăn phạm vi khác nhau ở CĂN CỨ PHÁP LÝ, không ở mức độ.' };
}
