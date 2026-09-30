/* ═══════════════════════════════════════════════════════════════
   QUYỀN NĂNG AI — SUPER ADMIN CẤP  (9.99.100)

   Theo yêu cầu chủ hệ: Super Admin là quyền cao nhất, cấp quyền cho các
   vị trí, cho tài khoản khách theo gói, VÀ cấp cho AI quyền xử lý công
   việc. Đây là lớp cấp quyền cho MƯỜI chức năng AI.

   ══ MỖI QUYỀN NĂNG TẮT MẶC ĐỊNH ══

   `aiCoQuyen` trả về false trừ khi Super Admin đã bật. Một quyền năng AI
   bật sẵn là một hệ tự mở rộng quyền của chính nó — đúng thứ Hiến pháp
   cấm (VÀNG mặc định 9.99.62). Chỉ R01 bật được; AI KHÔNG tự bật.

   ══ CHỨC NĂNG LÀM VIỆC THÌ ĐI QUA CỔNG ĐÃ CÓ ══

   Chức năng nào SOẠN nội dung ra khách thì gọi thẳng `soanBanNhap`
   (tu-hoan-thien) → chuỗi cấp phép ba cấp. Không dựng cổng thứ hai —
   một cái răng, nhiều đường vào. Chức năng chỉ ĐỌC thì nêu, không kết
   luận, không tự làm.

   ══ TRẦN TRƯỚC, CỬA SAU ══

   Mười chức năng: NĂM có cửa chạy thật, NĂM khai `chuaCoCua` kèm lý do
   (cùng lối `rangO`/`chuaCoMat` của luật giao diện 9.99.74). Trình cả
   mười như đã chạy thì người duyệt thấy mười dấu tick rồi thôi không
   đọc — và năm cái chưa có cửa lại là năm cái người viết sau dễ mở bừa.
   ═══════════════════════════════════════════════════════════════ */

import { Kho } from './nen.js';
import { ghiSoDen } from './giam-sat.js';
import { ghiPhatSinh, soanBanNhap, CHUOI } from './tu-hoan-thien.js';
import { laNguoiNha, laR01, tenNguoiDung as ten } from './vai-tro.js';
import { soatRaNhaCungCap } from './an-toan-ai.js';

/* ═══════════════ MƯỜI QUYỀN NĂNG AI ═══════════════

   Bản chép của G.AI_QUYEN — mục 106 đối chiếu từng ô với kho.
   · kieu   'ghiSo' ghi một dòng sổ · 'deXuat' soạn nháp qua cổng · 'doc' chỉ nêu
   · cua    tên cửa THẬT nó gọi (mục 106 đòi cửa ấy có trong worker và có cổng aiCoQuyen)
   · chuaCoCua  lý do chưa dựng cửa (thay cho `cua`) — phép đo về thứ chưa tồn tại */
export const AI_QUYEN = [
  { ma: 'AI01', ten: 'Phân loại phản hồi thành phát sinh', kieu: 'ghiSo',
    cua: 'aiPhanLoai', dinhTuyen: 'ghiPhatSinh (tu-hoan-thien)' },
  { ma: 'AI02', ten: 'Soạn nháp lấp kho rỗng', kieu: 'deXuat',
    cua: 'aiSoanNhap', dinhTuyen: 'soanBanNhap chuỗi kho · soanDeBaiNgoai qua cổng ẩn danh' },
  { ma: 'AI03', ten: 'Soạn cẩm nang gỡ ca khó', kieu: 'deXuat',
    cua: 'aiSoanNhap', dinhTuyen: 'soanBanNhap chuỗi camNang' },
  { ma: 'AI04', ten: 'Soạn phương án ứng phó', kieu: 'deXuat',
    cua: 'aiSoanNhap', dinhTuyen: 'soanBanNhap chuỗi ungPho' },
  { ma: 'AI05', ten: 'Tổng hợp giám sát chia sẻ tài khoản', kieu: 'doc',
    cua: 'aiTongHopGiamSat', dinhTuyen: 'THT_GIAMSAT — báo động, KHÔNG khoá' },
  { ma: 'AI06', ten: 'Tóm tắt hồ sơ gia đình cho người nhà', kieu: 'doc',
    chuaCoCua: 'Đọc hồ sơ con phải qua cổng ghi nhật ký lượt đọc (9.99.70) và ẩn danh khi ' +
      'ra ngoài (Điều 13). Dựng cửa trước khi nối hai cổng ấy là mở một đường đọc chưa ghi vết.' },
  { ma: 'AI07', ten: 'Nêu câu hỏi rủi ro pháp lý', kieu: 'doc',
    chuaCoCua: 'Phải TRỎ vào PLR (hỏi, không kết luận 9.99.70). Một cửa AI kết luận pháp lý ' +
      'nghe y hệt một câu thật — dựng sau khi chốt nó chỉ nêu câu hỏi.' },
  { ma: 'AI08', ten: 'Đề xuất bước tiếp cho một nhà', kieu: 'deXuat',
    chuaCoCua: 'Bước tiếp cho một nhà đọc Thẻ Vùng Mạnh (Phân hệ 1–2). Nối vào là quyết định ' +
      'về nội dung khách nhận — chờ chủ hệ chốt phạm vi.' },
  { ma: 'AI09', ten: 'Dịch nội dung sang tiếng Anh', kieu: 'deXuat',
    chuaCoCua: 'Bản dịch là nháp phải người duyệt; chưa chốt đường duyệt riêng cho bản dịch.' },
  { ma: 'AI10', ten: 'Soạn bản tin nội bộ', kieu: 'deXuat',
    chuaCoCua: 'Bản tin nội bộ đã có màn tin-noi-bo; nối AI vào cần chốt ai duyệt trước khi đăng.' }
];
const AI_MA = AI_QUYEN.map(function (q) { return q.ma; });
/* AI02·AI03·AI04 dùng chung cửa aiSoanNhap, chọn chuỗi theo loaiDuyet. */
const SOAN_QUYEN = { kho: 'AI02', camNang: 'AI03', ungPho: 'AI04' };

/* ═══════════════ CỔNG: QUYỀN NĂNG ĐÃ BẬT CHƯA ═══════════════

   Trạng thái tính LÚC ĐỌC từ dòng mới nhất của `quyenAI` — không cột
   "đang bật". Cùng luật cột conHan (9.99.63), dongYDuLieu (9.99.70).
   Mặc định TẮT: chưa có dòng nào thì false. */
export async function aiCoQuyen(db, quyen, pham) {
  const p = pham || 'he';
  const r = await db.prepare(
    'SELECT bat FROM quyenAI WHERE quyen = ? AND pham = ? ORDER BY stt DESC LIMIT 1')
    .bind(quyen, p).first();
  return !!(r && Number(r.bat) === 1);
}

/* ═══════════════ SUPER ADMIN CẤP / THU HỒI ═══════════════ */
export async function capQuyenAI(y, env, db, hoSo) {
  if (!laR01(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Chỉ Super Admin cấp được quyền năng cho AI — cấp quyền là việc của quyền cao nhất.' };
  const x = y || {};
  const quyen = String(x.quyen || '').trim();
  const pham = String(x.pham || 'he').trim();
  const ghiChu = String(x.ghiChu || '').trim();
  if (AI_MA.indexOf(quyen) < 0)
    return { ok: false, code: 'QUYENLA', error: 'Quyền năng AI không hợp lệ: ' + quyen };
  if (ghiChu.length < 5)
    return { ok: false, code: 'THIEUO', error: 'Cấp quyền phải viết một câu vì sao.' };
  const luc = new Date().toISOString();
  await db.prepare('INSERT INTO quyenAI (quyen,pham,bat,boiAi,luc,ghiChu) VALUES (?,?,?,?,?,?)')
    .bind(quyen, pham, 1, ten(hoSo), luc, ghiChu).run();
  await ghiSoDen(db, hoSo, 'AI_CAP', quyen, pham + ' · ' + ghiChu.slice(0, 60));
  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'AIQ_CAP',
    doiTuong: quyen, chiTiet: pham + ' · ' + ghiChu.slice(0, 80)});
  return { ok: true, quyen, pham, bat: 1, luc };
}
export async function thuHoiQuyenAI(y, env, db, hoSo) {
  if (!laR01(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Chỉ Super Admin thu hồi được quyền năng AI.' };
  const x = y || {};
  const quyen = String(x.quyen || '').trim();
  const pham = String(x.pham || 'he').trim();
  const ghiChu = String(x.ghiChu || '').trim();
  if (AI_MA.indexOf(quyen) < 0)
    return { ok: false, code: 'QUYENLA', error: 'Quyền năng AI không hợp lệ: ' + quyen };
  if (ghiChu.length < 5)
    return { ok: false, code: 'THIEUO', error: 'Thu hồi phải viết một câu vì sao.' };
  const luc = new Date().toISOString();
  /* Thu hồi là một DÒNG MỚI bat=0, không xoá dòng cũ — giữ lịch sử "hôm
     ấy quyền này đã bật chưa". Cùng luật dongYDuLieu (9.99.70). */
  await db.prepare('INSERT INTO quyenAI (quyen,pham,bat,boiAi,luc,ghiChu) VALUES (?,?,?,?,?,?)')
    .bind(quyen, pham, 0, ten(hoSo), luc, ghiChu).run();
  await ghiSoDen(db, hoSo, 'AI_THUHOI', quyen, pham + ' · ' + ghiChu.slice(0, 60));
  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'AIQ_THUHOI',
    doiTuong: quyen, chiTiet: pham + ' · ' + ghiChu.slice(0, 80)});
  return { ok: true, quyen, pham, bat: 0, luc };
}

/* ═══════════════ ĐỌC SỔ QUYỀN NĂNG ═══════════════ */
export async function soatQuyenAI(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Sổ quyền năng AI mở cho R01–R12.' };
  const out = [];
  for (const q of AI_QUYEN) {
    const bat = await aiCoQuyen(db, q.ma, 'he');
    out.push({ ma: q.ma, ten: q.ten, kieu: q.kieu, coCua: !!q.cua,
      chuaCoCua: q.chuaCoCua || '', batHe: bat });
  }
  return { ok: true, quyen: out,
    nhac: 'Bật là quyền của Super Admin; mỗi quyền năng TẮT mặc định. Chức năng có cửa mà chưa ' +
      'bật thì AI gọi vào bị từ chối (CHUACAP).' };
}

/* ═══════════════ NĂM CỬA CHỨC NĂNG CÓ CỔNG ═══════════════
   Mỗi cửa kiểm aiCoQuyen TRƯỚC khi làm gì. Chưa bật → CHUACAP. */

export async function aiPhanLoai(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM', error: 'Mở cho R01–R12.' };
  if (!(await aiCoQuyen(db, 'AI01', 'he')))
    return { ok: false, code: 'CHUACAP', error: 'Quyền năng AI01 chưa được Super Admin bật.' };
  /* Trỏ thẳng ghiPhatSinh — không dựng lại sổ phát sinh. */
  return await ghiPhatSinh(y, env, db, hoSo);
}

export async function aiSoanNhap(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM', error: 'Mở cho R01–R12.' };
  const loaiDuyet = String((y || {}).loaiDuyet || 'kho').trim();
  const quyen = SOAN_QUYEN[loaiDuyet];
  if (!quyen || !CHUOI[loaiDuyet])
    return { ok: false, code: 'CHUOILA', error: 'Chuỗi soạn không hợp lệ: ' + loaiDuyet };
  if (!(await aiCoQuyen(db, quyen, 'he')))
    return { ok: false, code: 'CHUACAP', error: 'Quyền năng ' + quyen + ' chưa được Super Admin bật.' };
  /* Trỏ thẳng soanBanNhap — bản nháp vào staging, đủ ba chữ ký mới 入库. */
  return await soanBanNhap(y, env, db, hoSo);
}

export async function soanDeBaiNgoai(y, env, db, hoSo) {
  if (!laR01(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Chỉ Super Admin được gửi yêu cầu soạn ra nhà cung cấp AI.' };
  if (!(await aiCoQuyen(db, 'AI02', 'he')))
    return { ok: false, code: 'CHUACAP', error: 'Quyền năng AI02 chưa được Super Admin bật.' };

  const deBai = String((y || {}).deBai || '').trim();
  const model = String(env.GITA_AI_MAU || '').trim();
  const khoa = String(env.GITA_AI_KHOA || '');
  if (deBai.length < 20 || deBai.length > 1500)
    return { ok: false, code: 'DEBAI_KHONG_HOP_LE',
      error: 'Đề bài phải từ 20 đến 1.500 ký tự.' };
  if (!khoa || !/^[A-Za-z0-9._:-]{1,80}$/.test(model))
    return { ok: false, code: 'CUADONG',
      error: 'Cửa soạn AI đang đóng; Worker chưa được cấu hình GITA_AI_KHOA và GITA_AI_MAU.' };

  const gioiHan = 20;
  const homNay = new Date().toISOString().slice(0, 10);
  const dem = await Kho.demNhip(db, 'soan-ai·' + hoSo.uid + '·' + homNay, 86400);
  if (dem > gioiHan) return { ok: false, code: 'VUOT_HAN',
    error: 'Đã hết lượt soạn AI trong ngày; thử lại ngày mai.' };

  const payload = {
    model,
    messages: [
      { role: 'system', content: 'Bạn soạn bản nháp tiếng Việt ngắn, rõ, tôn trọng trẻ em và gia đình. ' +
        'Không chẩn đoán, không đưa lời khuyên y tế hoặc pháp lý, không bịa dữ kiện hay nguồn. ' +
        'Nêu rõ phần nào cần người phụ trách kiểm chứng. Chỉ trả nội dung bản nháp.' },
      { role: 'user', content: deBai }
    ],
    max_tokens: 1200,
    temperature: 0.3
  };
  const anToan = await soatRaNhaCungCap({
    provider: 'openai', model, messages: payload.messages
  }, env, db, hoSo);
  if (!anToan.cho) return { ok: false, code: anToan.code, error: anToan.vi || 'Đề bài không được phép gửi.' };

  let phanHoi;
  try {
    phanHoi = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      redirect: 'error',
      headers: {
        'Authorization': 'Bearer ' + khoa,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20000)
    });
  } catch (e) {
    return { ok: false, code: 'AI_KHONG_KET_NOI', error: 'Không kết nối được nhà cung cấp AI.' };
  }
  if (!phanHoi.ok) return { ok: false, code: 'AI_LOI',
    error: 'Nhà cung cấp AI từ chối yêu cầu (HTTP ' + phanHoi.status + ').' };

  let ketQua;
  try { ketQua = await phanHoi.json(); }
  catch (e) { return { ok: false, code: 'AI_PHAN_HOI_LOI', error: 'Phản hồi AI không đọc được.' }; }
  const banNhap = String(ketQua && ketQua.choices && ketQua.choices[0] &&
    ketQua.choices[0].message && ketQua.choices[0].message.content || '').trim().slice(0, 8000);
  if (!banNhap) return { ok: false, code: 'AI_TRONG', error: 'Nhà cung cấp AI không trả về bản nháp.' };

  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo),
    viec: 'AI_SOAN_NGOAI', doiTuong: model, chiTiet: 'AI02 · ký tự=' + deBai.length });
  return { ok: true, model, banNhap,
    canDuyet: true, nhac: 'Đây chỉ là bản nháp chưa xác minh; cần người phụ trách kiểm tra trước khi dùng.' };
}

export async function aiTongHopGiamSat(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM', error: 'Mở cho R01–R12.' };
  if (!(await aiCoQuyen(db, 'AI05', 'he')))
    return { ok: false, code: 'CHUACAP', error: 'Quyền năng AI05 chưa được Super Admin bật.' };
  /* Chỉ NÊU khung mười cách + nói thẳng chưa có sổ lượt dùng theo phiên
     để chấm thật. Máy BÁO ĐỘNG, người quyết; KHÔNG tự khoá tài khoản. */
  return { ok: true,
    khung: 'Mười cách giám sát ở G.THT_GIAMSAT; tổng hợp NHIỀU dấu hiệu, không một cái tự kết luận.',
    chuaDo: 'Chưa có sổ lượt-đăng-nhập-theo-thiết-bị để chấm thật — trả về khung, không con số.',
    khongKhoaTuDong: true };
}
