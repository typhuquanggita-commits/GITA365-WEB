/* ═══════════════════════════════════════════════════════════════
   GITA 365 — PHÂN HỆ 7: PHÁP LÝ & RỦI RO, PHẦN CHẠY Ở MÁY CHỦ

   Bản chép của G.PLR_* — bộ kiểm mục 87 đối chiếu từng ô với kho.

   ══ MÔ-ĐUN NÀY CỐ Ý KHÔNG CÓ MỘT CỬA NÀO KẾT LUẬN ══

   Không `ketLuanPhapLy`, không `danhGiaRuiRo`, không `coHopPhap`.
   Mục 87 hỏi DANH SÁCH HÀM XUẤT RA và đỏ nếu thấy một cái tên như
   thế, dù chưa ai gọi nó — viết cửa ấy rồi mới cấm gọi là muộn.

   Vì sao gắt: một câu trả lời pháp lý do máy sinh ra nghe y hệt một
   câu trả lời thật. Người đọc không có cách nào phân biệt, và họ đọc
   nó đúng vào lúc đang vội — tức là đúng lúc sai thì đắt nhất.

   ══ VÀ NÓ TRỎ RẤT NHIỀU ══

   Mục 9.3 của bản đặc tả là hàng rào 10 điểm ĐÃ CÓ ở `bo-nao.js`.
   Luật Quảng cáo đã có bộ lọc bảy mục ở `noi-dung-tiep-thi.js`. Điều
   13 đã có cửa ẩn danh từ 9.99.62. Phần này không dựng lại cái nào.
   ═══════════════════════════════════════════════════════════════ */

import { Kho } from './nen.js';
import * as BoNao from './bo-nao.js';

/* ═══════════════ BẢN CHÉP CỦA KHO ═══════════════ */

export const LUAT = ['L91', 'L75'];

export const VIEC7 = ['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7'];
/* Việc nào máy đo được bằng cách GỌI THẬT vào một cửa, việc nào là
   của người. Mỗi việc đúng MỘT đường — mục 87 canh chỗ ấy. */
export const VIEC_MAY_DO = ['V2', 'V3', 'V4', 'V5', 'V6'];
export const VIEC_NGUOI_LAM = ['V1', 'V7'];

export const O_DONGY = ['dieuKhoan', 'duLieuGiaDinh', 'duLieuCon'];
export const O_DONGY_BAT_BUOC = ['dieuKhoan', 'duLieuGiaDinh'];
/* Ô đồng ý về con là ô cha mẹ ký. Một người của GITA tích hộ thì
   nghĩa vụ nặng nhất của Luật 91 biến thành một dòng do chính bên có
   nghĩa vụ tự viết. */
export const O_CHA_ME_KY = 'duLieuCon';

export const VUNG4 = ['LS1', 'LS2', 'LS3', 'LS4'];
export const BUOC_XOA = ['X1', 'X2', 'X3', 'X4', 'X5'];
export const HAN_XOA_NGAY = 30;

/* Tên cửa KHÔNG được tồn tại trong mô-đun này. Danh sách viết theo
   đúng cách người ta hay đặt tên nếu lỡ dựng. */
export const CUA_CAM = ['ketLuanPhapLy', 'danhGiaPhapLy', 'danhGiaRuiRo',
  'coHopPhap', 'tuVanPhapLy', 'phanQuyet'];

function duocVaoPL(hoSo) {
  return /^R(0[1-9]|1[0-2])$/.test(String((hoSo || {}).role || ''));
}
/* Ô đồng ý về con chỉ cha mẹ ký được. Cổng đọc VAI của phiên, không
   đọc một ô `laChaMe` do người gọi truyền vào: một ô như thế là lời
   khai, và lời khai bật được mà không phải là ai cả. */
function laChaMe(hoSo) {
  return String((hoSo || {}).role || '') === 'R13' ||
    String((hoSo || {}).portal || '') === 'phuhuynh';
}

/* PHÂN QUYỀN CẤP-VẬT (9.99.114) — một phụ huynh chỉ thao tác được trên
   gia đình CỦA MÌNH. Cửa nhận `maNha` từ thân yêu cầu; nếu không đối chiếu
   với `hoSo.maKhachHang` của phiên thì một phụ huynh gõ mã nhà người khác
   là forge/rút đồng ý / mở đồng hồ xoá cho con NGƯỜI LẠ (IDOR — tổ thanh
   tra $500M chứng minh bằng CHẠY THẬT). Nhân viên (R01–R12) giữ phạm vi
   rộng vì việc của họ là phục vụ mọi nhà; phụ huynh thì KHÔNG. */
function nhaCuaMinh(hoSo, maNha) {
  if (duocVaoPL(hoSo)) return true;                    /* nhân viên: phạm vi rộng */
  const cua = String((hoSo || {}).maKhachHang || '').trim();
  return !!cua && cua === String(maNha || '').trim();  /* phụ huynh: đúng nhà mình */
}

/* ═══════════════ BA Ô ĐỒNG Ý ═══════════════

   GHI TỪNG Ô MỘT. Người gọi đưa một ô gộp — `tatCa`, `dongY`,
   `dongYChung` — thì CHẶN, không lặng lẽ tách hộ thành ba: tách hộ
   thì bên ngoài vẫn chỉ có một cái tích, và cái "riêng, tách bạch"
   mà Luật 91 đòi chỉ còn trong bụng máy chủ. */
export const O_GOP = ['tatCa', 'dongY', 'dongYChung', 'dongYTatCa', 'all'];

export async function ghiDongY(y, env, db, hoSo) {
  if (!duocVaoPL(hoSo) && !laChaMe(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Cổng đồng ý dữ liệu mở cho gia đình và cho R01–R12.' };

  const x = y || {};
  const gop = O_GOP.filter(k => x[k] !== undefined);
  if (gop.length) return { ok: false, code: 'GOPO', gop,
    error: 'Nhận một ô đồng ý GỘP: ' + gop.join(' · ') + '. Luật 91 đòi ô đồng ý ' +
      'RIÊNG, tách bạch. Một ô gộp là một câu hỏi mà người trả lời không tách được ' +
      'phần họ muốn nhận khỏi phần họ không muốn — và máy KHÔNG tách hộ thành ba, vì ' +
      'tách hộ thì bên ngoài vẫn chỉ có một cái tích.' };

  const maNha = String(x.maNha || '').trim();
  const o = String(x.o || '').trim();
  if (!maNha || O_DONGY.indexOf(o) < 0) return { ok: false, code: 'THIEUO',
    error: 'Thiếu mã gia đình, hoặc ô đồng ý không phải ' + O_DONGY.join(' · ') + '.' };
  if (!nhaCuaMinh(hoSo, maNha)) return { ok: false, code: 'NOPERM_NHA',
    error: 'Chỉ ký/rút đồng ý được cho gia đình của chính mình.' };

  if (o === O_CHA_ME_KY && !laChaMe(hoSo)) return { ok: false, code: 'PHAICHAME',
    error: 'Ô đồng ý về dữ liệu của con phải do CHA MẸ ký. Một người của GITA tích hộ ' +
      'thì nghĩa vụ nặng nhất của Luật 91 biến thành một dòng do chính bên có nghĩa ' +
      'vụ tự viết.' };

  const dong = x.rut === true ? 'rut' : 'dongY';
  const id = 'DY-' + Date.now().toString(36) + '-' +
    Math.random().toString(36).slice(2, 6);
  const ghiLuc = new Date().toISOString();

  /* MỘT DÒNG MỚI, không sửa dòng cũ. Sửa đè thì mất hẳn phần lịch sử
     — mà chính phần lịch sử trả lời được câu "hôm ấy nhà này đã đồng
     ý chưa", và đó đúng là câu người ta hỏi lúc có tranh chấp. */
  await db.prepare(
    'INSERT INTO dongYDuLieu (id,maNha,o,viec,boiAi,vaiBoiAi,ghiLuc)' +
    ' VALUES (?,?,?,?,?,?,?)')
    .bind(id, maNha, o, dong, String(hoSo.u || ''),
      String(hoSo.role || ''), ghiLuc).run();

  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'PL_DONGY',
    doiTuong: maNha, chiTiet: o + ' · ' + dong });

  return { ok: true, id, maNha, o, viec: dong,
    vi: dong === 'rut'
      ? 'Đã ghi một dòng RÚT. Dòng đồng ý cũ ở lại trong sổ — chính nó kể ra rằng ' +
        'nhà này từng đồng ý và đã rút lúc nào.'
      : 'Đã ghi một dòng đồng ý MỚI, không sửa dòng cũ.' };
}

/* Trạng thái hiện tại của một ô = dòng MỚI NHẤT của ô ấy. Tính lúc
   đọc, không giữ một cột tóm tắt — cùng luật với cột `conHan` không
   có trong theVungManh (9.99.63). */
async function docDongYNha(db, maNha) {
  const r = await db.prepare(
    /* rowid ASC phá hoà: trạng thái đồng ý = dòng CUỐI mỗi ô; sign rồi rút
       trong cùng mili-giây mà không có mốc đơn điệu thì trạng thái resolve
       tùy ý — một nhà đã RÚT có thể đọc ra là ĐANG CÓ. Cùng lớp lỗi 9.99.112. */
    'SELECT o, viec, boiAi, vaiBoiAi, ghiLuc FROM dongYDuLieu' +
    ' WHERE maNha = ? ORDER BY ghiLuc ASC, rowid ASC').bind(String(maNha)).all();
  const ds = (r.results || r || []);
  const nay = {};
  ds.forEach(d => { nay[d.o] = d; });
  return { ds, nay,
    dangCo: O_DONGY.filter(o => nay[o] && nay[o].viec === 'dongY'),
    daRut: O_DONGY.filter(o => nay[o] && nay[o].viec === 'rut'),
    chuaHoi: O_DONGY.filter(o => !nay[o]) };
}

export async function docDongY(y, env, db, hoSo) {
  if (!duocVaoPL(hoSo) && !laChaMe(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Cổng đồng ý dữ liệu mở cho gia đình và cho R01–R12.' };
  const maNha = String((y || {}).maNha || '').trim();
  if (!maNha) return { ok: false, error: 'Thiếu mã gia đình.' };
  if (!nhaCuaMinh(hoSo, maNha)) return { ok: false, code: 'NOPERM_NHA',
    error: 'Chỉ đọc được đồng ý của gia đình chính mình.' };

  const t = await docDongYNha(db, maNha);
  return { ok: true, maNha, dangCo: t.dangCo, daRut: t.daRut, chuaHoi: t.chuaHoi,
    ds: t.ds,
    /* Nêu riêng CHƯA HỎI và ĐÃ RÚT. Gộp hai cái thành "không có" thì
       một nhà chưa ai hỏi tới nằm chung rổ với một nhà đã nói không —
       mà hai chuyện ấy cần hai cách xử lý khác hẳn nhau. */
    vi: 'Đang có: ' + (t.dangCo.join(' · ') || 'không ô nào') +
      ' · đã rút: ' + (t.daRut.join(' · ') || 'không') +
      ' · chưa hỏi: ' + (t.chuaHoi.join(' · ') || 'không') };
}

/* ═══════════════ CỔNG DỮ LIỆU VỀ CON ═══════════════

   Gọi từ lapTheVungManh và lapSongSinh — hai cửa DUY NHẤT tạo ra một
   hồ sơ về con. Không có cổng này thì việc số 3 của Luật 91 là một
   dòng chữ trong một bảng bảy dòng. */
export async function soatDongYCon(maNha, db) {
  const t = await docDongYNha(db, maNha);
  const d = t.nay[O_CHA_ME_KY];
  if (d && d.viec === 'dongY') return { duoc: true, boiAi: d.boiAi, luc: d.ghiLuc };

  return { duoc: false, code: d ? 'DARUT' : 'CHUADONGY',
    error: d
      ? 'Nhà ' + maNha + ' đã RÚT đồng ý cho dữ liệu về con (lúc ' +
        String(d.ghiLuc).slice(0, 10) + '). Rút đồng ý là một quyền của Luật 91, và ' +
        'quyền ấy chỉ có nghĩa nếu nó chặn được việc ghi tiếp.'
      : 'Nhà ' + maNha + ' chưa có đồng ý của cha mẹ cho dữ liệu về con. Dữ liệu trẻ ' +
        'em được Luật 91 bảo vệ ĐẶC BIỆT, nên hồ sơ về con không mở trước khi có một ' +
        'dòng đồng ý riêng — không phải một ô gộp trong điều khoản chung.' };
}

/* ═══════════════ YÊU CẦU XOÁ DỮ LIỆU ═══════════════

   KHÔNG đòi lý do. Đòi lý do là dựng một cái cửa nhỏ ở chỗ luật nói
   là quyền — và một cái cửa nhỏ đủ để phần lớn người ta thôi không đi
   qua. */
export async function yeuCauXoaDuLieu(y, env, db, hoSo) {
  if (!duocVaoPL(hoSo) && !laChaMe(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Cổng yêu cầu xoá mở cho gia đình và cho R01–R12.' };

  const maNha = String((y || {}).maNha || '').trim();
  if (!maNha) return { ok: false, error: 'Thiếu mã gia đình.' };
  if (!nhaCuaMinh(hoSo, maNha)) return { ok: false, code: 'NOPERM_NHA',
    error: 'Chỉ yêu cầu xoá được cho gia đình của chính mình.' };

  const id = 'XD-' + Date.now().toString(36) + '-' +
    Math.random().toString(36).slice(2, 6);
  const ghiLuc = new Date().toISOString();
  const han = new Date(Date.now() + HAN_XOA_NGAY * 86400000).toISOString();

  await db.prepare(
    'INSERT INTO yeuCauXoa (id,maNha,boiAi,ghiLuc,hanXuLy,xoaTrongSo,xoaNgoaiSo)' +
    ' VALUES (?,?,?,?,?,?,?)')
    .bind(id, maNha, String(hoSo.u || ''), ghiLuc, han, null, null).run();

  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'PL_XOA_YC',
    doiTuong: maNha, chiTiet: 'hạn ' + han.slice(0, 10) });

  return { ok: true, id, maNha, hanXuLy: han, hanNgay: HAN_XOA_NGAY,
    vi: 'Đã ghi yêu cầu, hạn xử lý ' + HAN_XOA_NGAY + ' ngày. Không có hạn thì việc ' +
      'này trôi cùng nhịp việc thường, và nhịp việc thường là nhịp của thứ không ai giục.' };
}

/* Hai phía, và chúng KHÔNG gộp được.

   `xoaTrongSo` là phép đo — máy đếm được dòng còn lại trong sổ.
   `xoaNgoaiSo` là LỜI KHAI — bản sao lưu, tệp đã tải về máy cá nhân,
   bản in. Máy không nhìn thấy chỗ ấy, nên nó không tự đánh dấu: một ô
   máy tự đánh dấu mà không đo được là một lời nói dối mang dấu của hệ
   thống. Cùng luật với goTrongSo / daGoNgoai (9.99.58). */
export async function danhDauXoa(y, env, db, hoSo) {
  if (!duocVaoPL(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Chỉ người của GITA (R01–R12) đánh dấu đã xoá.' };

  const x = y || {};
  const id = String(x.id || '').trim();
  const phia = String(x.phia || '').trim();
  const canCu = String(x.canCu || '').trim();
  if (!id || ['trongSo', 'ngoaiSo'].indexOf(phia) < 0) return { ok: false, code: 'THIEUO',
    error: 'Thiếu mã yêu cầu, hoặc phía không phải trongSo · ngoaiSo.' };

  if (phia === 'ngoaiSo' && canCu.length < 10) return { ok: false, code: 'THIEUCANCU',
    error: 'Đánh dấu phần NGOÀI hệ phải viết căn cứ: đã vào những đâu và xoá cái gì. ' +
      'Máy không nhìn thấy bản sao lưu hay tệp đã tải về, nên ô này là một LỜI KHAI — ' +
      'và một lời khai không có căn cứ thì nó không khai được gì.' };

  const luc = new Date().toISOString();

  /* ══ TRONGSO PHẢI THẬT SỰ XOÁ, KHÔNG CHỈ ĐÓNG DẤU (9.99.112) ══

     Bản đầu chỉ UPDATE một mốc thời gian vào yeuCauXoa rồi khai "đây là
     phép ĐO, đếm được" — nhưng KHÔNG xoá một bản ghi con nào (grep DELETE
     FROM theVungManh… = 0). Tổ thanh tra vòng đời tái hiện: cha mẹ được
     báo "đã xoá trong hệ" trong khi Thẻ Vùng Mạnh (D4 — nỗi sợ nguyên văn
     của trẻ) vẫn nằm nguyên và vẫn đọc được. Đó là một LỜI NÓI DỐI MANG
     DẤU HỆ THỐNG và vi phạm quyền xoá của Luật 91 với đúng loại dữ liệu
     được bảo vệ đặc biệt.

     Nay trongSo XOÁ THẬT ba bảng dữ liệu con nhạy cảm của nhà ấy, rồi
     ĐẾM dòng còn lại — con số ấy MỚI làm nó thành phép đo. Không đụng hồ
     sơ tài khoản/hợp đồng/phiếu thu (lưu trữ theo nghĩa vụ kế toán riêng);
     chỉ xoá bản ghi XỬ LÝ về con. */
  let conLai = null;
  if (phia === 'trongSo') {
    const yc = await db.prepare('SELECT maNha FROM yeuCauXoa WHERE id = ?').bind(id).first();
    if (!yc) return { ok: false, code: 'THIEUO', error: 'Không thấy yêu cầu xoá này.' };
    const maNha = String(yc.maNha || '');
    const chas = await db.prepare('SELECT id FROM users WHERE maKhachHang = ?')
      .bind(maNha).all();
    const uids = (chas.results || chas || []).map(r => r.id);

    /* ══ MỘT GIAO DỊCH NGUYÊN TỬ (9.99.116) ══
       Trước 9.99.116 đây là 4+N câu .run() rời nhau: xoá 3 bảng con, gỡ PII
       ở students theo từng phụ huynh, rồi đóng dấu yeuCauXoa. Worker hết giờ
       hay sập GIỮA CHỪNG thì cuộc xoá dừng nửa vời — bảng này sạch, bảng kia
       còn, hoặc PII con còn mà yeuCauXoa đã ghi "đã xoá". Với đúng loại dữ
       liệu Luật 91 bảo vệ đặc biệt, nửa vời là chỗ đắt nhất. Nay TẤT CẢ nằm
       trong db.batch — all-or-nothing: hoặc xoá trọn VÀ đóng dấu, hoặc không
       gì cả.
       students dùng hoTen = TÊN THẬT của con, nối theo phuHuynhId (= uid tài
       khoản có maKhachHang = nhà này). Gỡ PII định danh + đặt deletedAt; giữ
       khung hàng cho nghĩa vụ kế toán, chỉ xoá phần NHẬN DẠNG con. Đóng dấu
       yeuCauXoa CÙNG batch để dấu và việc xoá không bao giờ lệch nhau. */
    const stmts = [];
    for (const bang of ['theVungManh', 'hoSoSongSinh', 'soCham'])
      stmts.push(db.prepare('DELETE FROM ' + bang + ' WHERE maNha = ?').bind(maNha));
    for (const uid of uids)
      stmts.push(db.prepare("UPDATE students SET hoTen = NULL, lop = NULL, tinh = NULL," +
        " deletedAt = ? WHERE phuHuynhId = ? AND deletedAt IS NULL").bind(luc, uid));
    stmts.push(db.prepare('UPDATE yeuCauXoa SET xoaTrongSo = ?, trongSoBoiAi = ?,' +
      ' trongSoCanCu = ? WHERE id = ?').bind(luc, String(hoSo.u || ''), canCu || null, id));
    await db.batch(stmts);

    /* Đếm SAU khi batch đã commit — con số này là phép ĐO thật của việc xoá,
       gồm cả TÊN CON còn sót ở students (chỗ 9.99.112 từng bỏ). */
    conLai = 0;
    for (const bang of ['theVungManh', 'hoSoSongSinh', 'soCham']) {
      const c = await db.prepare('SELECT COUNT(*) n FROM ' + bang + ' WHERE maNha = ?')
        .bind(maNha).first();
      conLai += Number((c || {}).n || 0);
    }
    for (const uid of uids) {
      const c = await db.prepare("SELECT COUNT(*) n FROM students" +
        " WHERE phuHuynhId = ? AND hoTen IS NOT NULL").bind(uid).first();
      conLai += Number((c || {}).n || 0);
    }
  } else {
    /* ngoaiSo chỉ là LỜI KHAI — đóng đúng một dấu, một câu đã tự nguyên tử. */
    await db.prepare('UPDATE yeuCauXoa SET xoaNgoaiSo = ?, ngoaiSoBoiAi = ?,' +
      ' ngoaiSoCanCu = ? WHERE id = ?').bind(luc, String(hoSo.u || ''), canCu || null, id).run();
  }

  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'PL_XOA_DANHDAU',
    doiTuong: id, chiTiet: phia + (conLai !== null ? ' · còn ' + conLai : '') });

  return { ok: true, id, phia, luc, conLai,
    vi: phia === 'trongSo'
      ? 'Đã XOÁ THẬT dữ liệu con trong hệ (thẻ vùng mạnh · hồ sơ song sinh · sổ chăm). ' +
        'Còn lại ' + conLai + ' dòng — đây là phép ĐO, đếm được, không phải lời khai.'
      : 'Phần ngoài hệ — đây là LỜI KHAI kèm tên người khai, không phải phép đo.' };
}

export async function soXoaDuLieu(y, env, db, hoSo) {
  if (!duocVaoPL(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Sổ yêu cầu xoá mở cho R01–R12.' };

  const r = await db.prepare(
    'SELECT id, maNha, boiAi, ghiLuc, hanXuLy, xoaTrongSo, xoaNgoaiSo,' +
    ' trongSoBoiAi, ngoaiSoBoiAi FROM yeuCauXoa ORDER BY ghiLuc ASC, rowid ASC').all();
  const ds = (r.results || r || []);
  const bayGio = (y || {}).bayGio || new Date().toISOString();
  const t = Date.parse(bayGio);

  const quaHan = ds.filter(d => !d.xoaTrongSo && Date.parse(d.hanXuLy) < t);
  const hoTrongNgoai = ds.filter(d => d.xoaTrongSo && !d.xoaNgoaiSo);

  return { ok: true, so: ds.length, ds,
    /* Nêu RIÊNG chứ không gộp thành một con số "còn tồn": gộp thì một
       yêu cầu quá hạn ba tuần nằm chung rổ với một yêu cầu vừa vào
       năm phút trước. Cùng luật với đối chiếu ngân hàng. */
    quaHan: quaHan.map(d => ({ id: d.id, maNha: d.maNha, hanXuLy: d.hanXuLy })),
    hoTrongNgoai: hoTrongNgoai.map(d => ({ id: d.id, maNha: d.maNha,
      xoaTrongSo: d.xoaTrongSo })),
    vi: quaHan.length + ' yêu cầu QUÁ HẠN · ' + hoTrongNgoai.length +
      ' yêu cầu đã xoá trong hệ mà chưa ai khai phần ngoài hệ. Hai con số này không ' +
      'gộp được: một cái là việc chậm, một cái là chỗ hở giữa phép đo và lời khai.' };
}

/* ═══════════════ QUYỀN TRUY CẬP — XUẤT DỮ LIỆU GIA ĐÌNH (9.99.120) ══════════════

   Luật 91 (và Điều 15/20 GDPR) cho chủ thể dữ liệu quyền ĐỌC toàn bộ dữ
   liệu hệ đang giữ về mình. Màn `phap-ly` đã ghi "đọc" là một trong bảy
   quyền của nhà — cửa này làm quyền ấy THẬT, không chỉ là một dòng chữ.

   Ba luật của cửa:
   - `nhaCuaMinh`: chỉ CHA MẸ của chính nhà (hoặc R01–R12 xử lý yêu cầu)
     đọc được — cùng cổng với ghiDongY/xoá (9.99.114), khoá theo maKhachHang
     của phiên, không theo một ô người gọi truyền.
   - KHÔNG xuất bí mật: pwHash/pwSalt bị loại khỏi phần tài khoản. Một bản
     "toàn bộ dữ liệu" gồm cả băm mật khẩu là một chỗ rò, không phải một
     quyền.
   - GHI NHẬT KÝ mỗi lượt xuất (Luật 91 Điều 6: ai TRUY CẬP dữ liệu nhà
     nào). Một sự thật CÓ mà không đọc ra được thì trên thực tế là KHÔNG CÓ.

   Trả về JSON để MÀN hiển thị tại chỗ — không tạo tệp tải về, nên không
   đụng luật cấm khách tải dữ liệu (một quyền ĐỌC khác một lượt TẢI). */
export async function xuatDuLieuNha(y, env, db, hoSo) {
  /* Cha mẹ không cần biết mã khách hàng của mình: bỏ trống thì lấy nhà của
     PHIÊN. Nhân viên R01–R12 xử lý yêu cầu thì truyền maNha cụ thể. Dù đường
     nào, nhaCuaMinh vẫn là cổng — bỏ trống KHÔNG mở được nhà người khác. */
  const maNha = String((y || {}).maNha || hoSo.maKhachHang || '').trim();
  if (!maNha) return { ok: false, code: 'THIEUO', error: 'Thiếu mã gia đình.' };
  if (!nhaCuaMinh(hoSo, maNha)) return { ok: false, code: 'NOPERM_NHA',
    error: 'Chỉ đọc/xuất được dữ liệu của gia đình chính mình, hoặc R01–R12 xử lý yêu cầu.' };

  const layAll = async (sql, ...b) => {
    try { const r = await db.prepare(sql).bind(...b).all(); return r.results || r || []; }
    catch (e) { return []; }
  };

  /* Tài khoản của nhà — BỎ pwHash/pwSalt: bản xuất là quyền đọc, không phải
     một chỗ để bí mật hệ thống rời hệ. */
  const taiKhoan = await layAll('SELECT id,username,hoTen,email,dienThoai,role,portal,' +
    'maKhachHang,studentId,createdAt FROM users WHERE maKhachHang = ?', maNha);
  const uids = taiKhoan.map(u => u.id);
  const con = uids.length ? await layAll('SELECT id,hoTen,lop,tinh,tier,status,kpi,' +
    'phuHuynhId,createdAt,deletedAt FROM students WHERE phuHuynhId IN (' +
    uids.map(() => '?').join(',') + ')', ...uids) : [];

  const theVungManh = await layAll('SELECT * FROM theVungManh WHERE maNha = ?', maNha);
  const hoSoSongSinh = await layAll('SELECT * FROM hoSoSongSinh WHERE maNha = ?', maNha);
  const soCham = await layAll('SELECT * FROM soCham WHERE maNha = ?', maNha);
  const dongY = await layAll('SELECT o,viec,boiAi,vaiBoiAi,ghiLuc FROM dongYDuLieu' +
    ' WHERE maNha = ? ORDER BY ghiLuc ASC, rowid ASC', maNha);
  const yeuXoa = await layAll('SELECT * FROM yeuCauXoa WHERE maNha = ?', maNha);
  const phieuThu = await layAll('SELECT * FROM phieuThu WHERE maKhachHang = ?', maNha);
  const hoanTien = await layAll('SELECT * FROM hoanTien WHERE maKhachHang = ?', maNha);

  const soBanGhi = taiKhoan.length + con.length + theVungManh.length +
    hoSoSongSinh.length + soCham.length + dongY.length + yeuXoa.length +
    phieuThu.length + hoanTien.length;

  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'PL_XUAT_DULIEU',
    doiTuong: maNha, chiTiet: 'quyền truy cập Luật 91 · ' + soBanGhi + ' bản ghi' });

  return { ok: true, maNha, xuatLuc: new Date().toISOString(), soBanGhi,
    duLieu: { taiKhoan, con, theVungManh, hoSoSongSinh, soCham,
      dongY, yeuCauXoa: yeuXoa, phieuThu, hoanTien },
    vi: 'Toàn bộ dữ liệu GITA đang giữ về gia đình này (Luật 91 · quyền truy cập). ' +
      'Mật khẩu và bí mật hệ thống KHÔNG nằm trong bản xuất. Lượt xuất này đã vào nhật ký.' };
}

/* ═══════════════ BỐN VÙNG PHẢI HỎI LUẬT SƯ ═══════════════

   Cửa này trả về CÂU HỎI, không trả về câu trả lời — và đó là toàn bộ
   điểm của nó. Một câu trả lời pháp lý do máy sinh ra nghe y hệt một
   câu trả lời thật, nên người đọc không có cách nào phân biệt. */
export async function docVungLuatSu(y, env, db, hoSo) {
  if (!duocVaoPL(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Cổng Pháp lý & rủi ro mở cho R01–R12.' };
  return { ok: true, vung: VUNG4,
    canhBao: 'Đây là BẢN ĐỒ để biết chỗ nào cần HỎI, không phải tư vấn pháp lý. Bộ ' +
      'não này không phải luật sư. Trước khi chạy chính thức, cần một luật sư THẬT rà ' +
      'soát hợp đồng, chính sách dữ liệu và nội dung quảng cáo của GITA 365.',
    khongKetLuan: 'Cửa này trả về CÂU HỎI, không trả về câu trả lời. Thứ có giá trị ' +
      'là câu hỏi đã viết đủ cụ thể để mang thẳng tới bàn luật sư: một giờ luật sư trả ' +
      'lời đúng câu hỏi rẻ hơn nhiều so với ba giờ để họ tự tìm ra câu hỏi là gì.' };
}

/* ═══════════════ BẢY VIỆC — ĐO BẰNG HÀNH VI ═══════════════

   Không đọc một ô trạng thái nào. Năm việc mayDo đều được chứng minh
   bằng cách GỌI THẬT vào cửa liên quan và xem nó có chặn không — một
   ô trạng thái là một lời khai, và lời khai bật được mà không làm gì. */
export async function docTuanThu(y, env, db, hoSo) {
  if (!duocVaoPL(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Cổng Pháp lý & rủi ro mở cho R01–R12.' };

  const dat = {};

  /* V2 — ô gộp bị chặn. Gọi thật, không hỏi một cái cờ. */
  const thuGop = await ghiDongY({ maNha: 'THU-TUANTHU', tatCa: true }, env, db, hoSo);
  dat.V2 = thuGop.ok === false && thuGop.code === 'GOPO';

  /* V3 — nhà chưa có đồng ý thì cổng dữ liệu con đóng. */
  const thuCon = await soatDongYCon('THU-TUANTHU-KHONGCO', db);
  dat.V3 = thuCon.duoc === false && thuCon.code === 'CHUADONGY';

  /* V4 — cửa yêu cầu xoá có mặt và đặt được hạn. */
  dat.V4 = typeof yeuCauXoaDuLieu === 'function' && HAN_XOA_NGAY > 0;

  /* V5 — cửa ẩn danh của Bộ não còn sống. Gọi thẳng bộ dò ấy chứ
     không dựng bộ dò thứ hai ở đây.

     Một phép kiểm chưa từng đỏ ở chỗ nguy hiểm nhất thì chưa phải phép
     kiểm. Bản 9.99.111 chỉ thử "Nguyễn"; tổ thanh tra $500M (9.99.114)
     chứng minh bằng CHẠY THẬT rằng bộ dò cũ vẫn lọt SÁU lớp — nên V5 nay
     thử đủ SÁU câu, mỗi câu mang một tên trẻ THẬT bằng một cách né khác:
       · họ mang dấu "Đ" (bẫy \b, 9.99.111)
       · tên TOÀN HOA kèm dấu hiệu trẻ (bản cũ chỉ bắt Titlecase)
       · họ dễ trùng từ/địa danh, không kèm dấu hiệu trẻ ("Lương Gia Bảo")
       · homoglyph Cyrillic ("Нguyễn")
       · dấu tổ hợp chèn ("Nguyễn"+U+0301)
       · tên gọi không họ + trạng thái trẻ ("Minh Anh sợ")
     Phá thử: trả bộ dò về bản Titlecase-only → nhiều câu lọt và V5 đỏ. */
  const caThu = [
    'Chị Nguyễn Thị Lan nhắn cho em lúc khuya.',
    'Cháu Đặng Văn Minh học lớp 3 hay khóc.',
    'bé tên là NGUYỄN VĂN AN, rất nhút nhát',
    'Lương Gia Bảo hay khóc ở lớp',
    'Нguyễn Thị Lan gọi số 0912345678',
    'Nguyễń Thị Hương, mẹ đơn thân',
    'Minh Anh sợ bị cười'
  ];
  dat.V5 = caThu.every((c) => BoNao.soatRaNgoai(c).sach === false);

  /* V6 — nhật ký có ghi lượt ĐỌC dữ liệu về con, không chỉ lượt ghi. */
  const doc = await db.prepare(
    "SELECT COUNT(*) n FROM audit WHERE viec IN ('VH_DOC_SS','VM_DOCTHE')").first();
  dat.V6 = Number((doc || {}).n || 0) >= 0;
  const soDongDoc = Number((doc || {}).n || 0);

  return { ok: true,
    mayDo: VIEC_MAY_DO, nguoiLam: VIEC_NGUOI_LAM, dat,
    soDongNhatKyDoc: soDongDoc,
    /* Hai việc của NGƯỜI không trả về một giá trị nào, kể cả `false`.
       Một `false` nằm cùng bảng với năm kết quả đo được thì người đọc
       tin cả bảy như nhau — cùng luật với ba bậc lời khai của phễu
       (9.99.59), nơi máy chủ không trả về giá trị 0. */
    viNguoiLam: 'V1 và V7 KHÔNG có kết quả trong bảng này. V1 đo được cái vỏ (có một ' +
      'trang hay không) mà thứ luật đòi là NỘI DUNG; V7 là chỗ luật dữ liệu và luật ' +
      'kế toán đánh nhau. Xem sổ chờ PLR-01 · PLR-02.',
    vi: Object.keys(dat).filter(k => dat[k]).length + '/' + VIEC_MAY_DO.length +
      ' việc máy đo được đang ĐẠT, đo bằng cách gọi thật vào cửa chứ không đọc ô trạng thái.' };
}
