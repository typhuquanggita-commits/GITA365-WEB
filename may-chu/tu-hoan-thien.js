/* ═══════════════════════════════════════════════════════════════
   VÒNG TỰ HOÀN THIỆN — PHẦN CÓ RĂNG  (9.99.96)

   Theo tình huống 5 của chủ hệ: một khách coach khó tính dò hệ, nhập
   dữ liệu giả, hỏi ngoài kịch bản, đòi vượt cấp không trả phí — và giữa
   lúc tư vấn, MỘT SỐ KHO RỖNG. Bộ não phát hiện, chủ động soạn chuỗi
   tài liệu/giải pháp TỪ DỮ LIỆU ĐÃ CÓ, nhưng 入库 (đưa vào kho phục vụ
   khách) phải qua cấp phép Bộ phận sản phẩm → Giám đốc điều hành →
   Super Admin. Sự chậm ấy là CÓ THẬT, và phải được NÓI RA với khách,
   không giấu, không bịa một câu trả lời chưa duyệt.

   ══ MÔ-ĐUN NÀY KHÔNG TỰ NHẬP KHO GÌ CẢ ══

   Máy SOẠN (ghi vào staging `banNhapKho`), người DUYỆT, và chỉ khi đủ
   ba chữ ký của ba người khác nhau thì Super Admin mới 入库. Cửa `nhapKho`
   là cái răng: cổng đứng TRƯỚC câu UPDATE đưa nội dung ra phục vụ.

   Lần thứ tư thứ tự "dựng cổng trước cửa" được chọn — sau Hiến pháp
   (9.99.62), trần giám sát (9.99.76), vòng tự nâng cấp (9.99.77): một
   hệ tự hoàn thiện mà tự đưa nội dung ra phục vụ khách không cần ai
   duyệt là một hệ tự mở rộng phạm vi của chính nó.

   ══ SOẠN KHÁC NHẬP, VÀ ĐỦ/CHƯA TÍNH LÚC ĐỌC ══

   `banNhapKho` KHÔNG có cột "đãDuyệt". Đủ ba cấp hay chưa TÍNH LÚC ĐỌC
   từ sổ chữ ký `duyetNhap` — cùng luật cột `conHan` không có trong
   theVungManh (9.99.63) và cột `den` không có trong hoSoSongSinh
   (9.99.66). Một cột tóm tắt thì hoặc bị gõ đè (một phép đo thành một
   lời khai), hoặc không ai gõ và nó cũ đi lặng lẽ.
   ═══════════════════════════════════════════════════════════════ */

import { Kho } from './nen.js';
import { ghiSoDen } from './giam-sat.js';

function laR01(hoSo) { return String((hoSo || {}).role || '') === 'R01'; }
function laNguoiNha(hoSo) {
  return /^R(0[1-9]|1[0-2])$/.test(String((hoSo || {}).role || ''));
}
/* Hồ sơ phiên mang tên ô `hoSo.u`, KHÔNG `hoSo.username` — cái bẫy đã
   cắn kho bốn lần (9.99.55 · 9.99.62 · 9.99.75). Gõ nhầm thì cổng
   "người duyệt khác người soạn" mở với mọi người trong im lặng. */
function ten(hoSo) { return String((hoSo || {}).u || ''); }
function vaiCua(hoSo) { return String((hoSo || {}).role || ''); }

/* ═══════════════ CHUỖI CẤP PHÉP 入库 ═══════════════
   HAI CHUỖI CẤP PHÉP, không một cái răng thứ hai (9.99.97 · tình huống 6).
   Bản chép của G.THT_CHUOI — mục 105 đối chiếu. Mỗi bản nháp mang một
   `loaiDuyet` chọn chuỗi; duyetCap và nhapKho đọc CHÍNH chuỗi của bản
   nháp ấy, nên thêm một chuỗi mới KHÔNG dựng lại cổng.
     · kho     — lấp kho rỗng (tình huống 5): Sản phẩm → Giám đốc → Super Admin
     · camNang — cẩm nang gỡ ca khó (tình huống 6): Coach cao nhất → Giám đốc → Super Admin
     · ungPho  — ứng phó vận hành/pháp lý (tình huống 7): Vận hành → Giám đốc → Super Admin
   Ba vai khác nhau trong mỗi chuỗi → ba người khác nhau một cách tự nhiên. */
export const CHUOI = {
  kho: [
    { ma: 'sanPham',    ten: 'Bộ phận sản phẩm',       vai: 'R04', thu: 1 },
    { ma: 'giamDoc',    ten: 'Giám đốc điều hành',      vai: 'R03', thu: 2 },
    { ma: 'superAdmin', ten: 'Super Admin',             vai: 'R01', thu: 3 }
  ],
  camNang: [
    { ma: 'coachCao',   ten: 'Bộ phận Coach cao nhất',  vai: 'R05', thu: 1 },
    { ma: 'giamDoc',    ten: 'Giám đốc điều hành',      vai: 'R03', thu: 2 },
    { ma: 'superAdmin', ten: 'Super Admin',             vai: 'R01', thu: 3 }
  ],
  ungPho: [
    { ma: 'vanHanh',    ten: 'Ban vận hành',            vai: 'R02', thu: 1 },
    { ma: 'giamDoc',    ten: 'Giám đốc điều hành',      vai: 'R03', thu: 2 },
    { ma: 'superAdmin', ten: 'Super Admin',             vai: 'R01', thu: 3 }
  ]
};
const LOAI_DUYET = Object.keys(CHUOI);
function chuoiCua(ld) { return CHUOI[ld] || null; }

/* Mười một loại phát sinh. Bản chép của G.THT_PHATSINH_LOAI — mục 105
   đối chiếu. giaDinhVuong (9.99.97) là tình huống 6; ba loại 9.99.98 là
   tình huống 7. Ba loại 9.99.99: nhanSuNgoaiLuong (TH8) · doiVuotQuyen
   (TH9) · chiaSeTaiKhoan (TH10). */
export const LOAI_PHATSINH = ['khoRong', 'phanHoiXau', 'hoiNgoaiKichBan',
  'duLieuGia', 'giaDinhVuong', 'doiThuChoiXau', 'quaTai', 'guiNhamSai',
  'nhanSuNgoaiLuong', 'doiVuotQuyen', 'chiaSeTaiKhoan'];

/* ═══════════════ SỔ PHÁT SINH — GHI NGAY ═══════════════

   Mỗi phát sinh (kho rỗng lúc tư vấn, phản hồi xấu, câu hỏi ngoài kịch
   bản, dữ liệu khách khai giả) vào sổ NGAY. Continuous update: cái đáng
   ngờ nhất là những phát sinh bị bỏ đi không ghi. */
export async function ghiPhatSinh(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Sổ phát sinh mở cho R01–R12.' };

  const x = y || {};
  const loai = String(x.loai || '').trim();
  const kho = String(x.kho || '').trim();
  const cauHoi = String(x.cauHoi || '').trim();
  const chiTiet = String(x.chiTiet || '').trim();

  if (LOAI_PHATSINH.indexOf(loai) < 0)
    return { ok: false, code: 'LOAILA', error: 'Loại phát sinh không hợp lệ: ' + loai };
  if (chiTiet.length < 10)
    return { ok: false, code: 'THIEUO',
      error: 'Thiếu ô chi tiết — một phát sinh không nói rõ chuyện gì thì sổ không dùng được.' };

  const id = 'PS-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
  const luc = new Date().toISOString();
  await db.prepare(
    'INSERT INTO phatSinh (id,loai,kho,cauHoi,chiTiet,aiGhi,luc) VALUES (?,?,?,?,?,?,?)')
    .bind(id, loai, kho, cauHoi, chiTiet, ten(hoSo), luc).run();
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'THT_PHATSINH',
    doiTuong: id, chiTiet: loai + ' · ' + chiTiet.slice(0, 60) });
  return { ok: true, id, loai, luc };
}

/* ═══════════════ SOẠN BẢN NHÁP — KHÔNG PHẢI NHẬP KHO ═══════════════

   Máy soạn TỪ DỮ LIỆU ĐÃ CÓ, ghi vào staging. KHÔNG một câu INSERT nào
   vào kho phục vụ khách — mục 105 đọc thân hàm và đỏ nếu thấy.

   KHÔNG BỊA: bản nháp phải DẪN NGUỒN. Kho rỗng mà máy tự nghĩ ra một
   câu là đúng thứ Hiến pháp cấm — nghe y hệt câu thật nên người đọc
   tin. Dẫn nguồn buộc bản nháp phải rút từ thứ hệ đã có. */
export async function soanBanNhap(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Cửa soạn bản nháp mở cho R01–R12.' };

  const x = y || {};
  const phatSinhId = String(x.phatSinhId || '').trim();
  const tenKho = String(x.tenKho || '').trim();
  const tieuDe = String(x.tieuDe || '').trim();
  const noiDung = String(x.noiDung || '').trim();
  const nguon = String(x.nguon || '').trim();
  /* loaiDuyet chọn CHUỖI cấp phép. Mặc định 'kho' để bản 9.99.96 không
     đổi hành vi; 'camNang' là chuỗi gỡ ca khó của tình huống 6. */
  const loaiDuyet = String(x.loaiDuyet || 'kho').trim();

  if (LOAI_DUYET.indexOf(loaiDuyet) < 0)
    return { ok: false, code: 'LOAIDUYETLA', error: 'Loại duyệt không hợp lệ: ' + loaiDuyet };
  if (!phatSinhId)
    return { ok: false, code: 'THIEUPS',
      error: 'Bản nháp phải trỏ vào một phát sinh — không có phát sinh thì không biết nó lấp lỗ nào.' };
  const ps = await db.prepare('SELECT id FROM phatSinh WHERE id = ?').bind(phatSinhId).first();
  if (!ps) return { ok: false, code: 'KHONGCOPS', error: 'Không có phát sinh: ' + phatSinhId };
  if (!tenKho || tieuDe.length < 4 || noiDung.length < 20)
    return { ok: false, code: 'THIEUO', error: 'Thiếu ô kho / tiêu đề / nội dung.' };
  if (nguon.length < 4)
    return { ok: false, code: 'THIEUNGUON',
      error: 'Bản nháp phải DẪN NGUỒN từ dữ liệu đã có — máy SOẠN từ thứ hệ đã có, không ' +
        'bịa. Kho rỗng thì nói thật là chưa có, không dựng vội một câu chưa được duyệt.' };

  const id = 'BN-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
  const luc = new Date().toISOString();
  await db.prepare(
    'INSERT INTO banNhapKho (id,phatSinhId,tenKho,tieuDe,noiDung,nguon,loaiDuyet,aiSoan,soanLuc,trangThai)' +
    ' VALUES (?,?,?,?,?,?,?,?,?,?)')
    .bind(id, phatSinhId, tenKho, tieuDe, noiDung, nguon, loaiDuyet, ten(hoSo), luc, 'nhap').run();
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'THT_SOAN',
    doiTuong: id, chiTiet: loaiDuyet + ' · ' + tenKho + ' · ' + tieuDe.slice(0, 50) });
  return { ok: true, id, loaiDuyet, trangThai: 'nhap', soanLuc: luc };
}

/* ═══════════════ DUYỆT MỘT CẤP ═══════════════

   Sổ chữ ký nối thêm, không cột tóm tắt. Ba răng:
   · Vai người ký PHẢI khớp cấp (R04 · R03 · R01).
   · Người duyệt KHÁC người soạn — cùng luật L3 (9.99.42), vai C khác
     vai A (9.99.72), người ký khác người đề xuất (9.99.77).
   · Ba cấp là BA NGƯỜI khác nhau — một người ký hai cấp thì cả chuỗi
     duyệt là một người, mà sổ vẫn đủ ba dòng nên không ai đọc ra. */
export async function duyetCap(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Cửa duyệt mở cho R01–R12.' };

  const x = y || {};
  const napId = String(x.napId || '').trim();
  const cap = String(x.cap || '').trim();
  const ghiChu = String(x.ghiChu || '').trim();

  const bn = await db.prepare('SELECT id,aiSoan,trangThai,loaiDuyet FROM banNhapKho WHERE id = ?')
    .bind(napId).first();
  if (!bn) return { ok: false, code: 'KHONGCO', error: 'Không có bản nháp: ' + napId };
  if (bn.trangThai !== 'nhap')
    return { ok: false, code: 'DANHAP', error: 'Bản nháp đã 入库 hoặc bị gỡ — không duyệt thêm được.' };
  /* Đọc CHÍNH chuỗi của bản nháp — cấp và vai hợp lệ tuỳ loaiDuyet. */
  const chuoi = chuoiCua(bn.loaiDuyet);
  if (!chuoi) return { ok: false, code: 'KHONGCHUOI', error: 'Bản nháp mang loại duyệt lạ: ' + bn.loaiDuyet };
  const buoc = chuoi.filter(function (c) { return c.ma === cap; })[0];
  if (!buoc)
    return { ok: false, code: 'CAPLA', error: 'Cấp "' + cap + '" không thuộc chuỗi ' + bn.loaiDuyet + '.' };
  if (ghiChu.length < 5)
    return { ok: false, code: 'THIEUO',
      error: 'Duyệt phải viết một câu — một dấu tick không nói vì sao duyệt.' };

  if (vaiCua(hoSo) !== buoc.vai)
    return { ok: false, code: 'SAIVAI',
      error: 'Cấp "' + cap + '" phải do vai ' + buoc.vai + ' ký. Vai hiện tại: ' +
        (vaiCua(hoSo) || '(không)') + '.' };
  if (ten(hoSo) === bn.aiSoan)
    return { ok: false, code: 'TUDUYET',
      error: 'Người duyệt không được là người soạn — cùng một người thì phần duyệt chỉ là ' +
        'phần soạn nói lại lần nữa, và nó sẽ đồng ý với chính nó.' };

  const daKy = ((await db.prepare('SELECT cap,aiDuyet FROM duyetNhap WHERE napId = ?')
    .bind(napId).all()).results) || [];
  if (daKy.some(function (r) { return r.cap === cap; }))
    return { ok: false, code: 'DAKY', error: 'Cấp "' + cap + '" đã ký rồi.' };
  if (daKy.some(function (r) { return r.aiDuyet === ten(hoSo); }))
    return { ok: false, code: 'MOTNGUOI',
      error: 'Một người không ký hai cấp — ba cấp phải là ba người khác nhau, nếu không ' +
        'thì cả chuỗi duyệt là một người.' };

  const id = 'DN-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
  const luc = new Date().toISOString();
  await db.prepare(
    'INSERT INTO duyetNhap (id,napId,cap,aiDuyet,duyetLuc,ghiChu) VALUES (?,?,?,?,?,?)')
    .bind(id, napId, cap, ten(hoSo), luc, ghiChu).run();
  await ghiSoDen(db, hoSo, 'THT_DUYET', napId, cap + ' · ' + ten(hoSo));
  const con = chuoi.map(function (c) { return c.ma; }).filter(function (c) {
    return c !== cap && !daKy.some(function (r) { return r.cap === c; });
  });
  return { ok: true, id, cap, loaiDuyet: bn.loaiDuyet, duyetLuc: luc, conThieu: con };
}

/* ═══════════════ 入库 — CÁI RĂNG ═══════════════

   Chỉ Super Admin, và cổng đứng TRƯỚC câu UPDATE. Đủ ba cấp hay chưa
   tính LÚC ĐỌC từ `duyetNhap`, không đọc một cột tóm tắt. 入库 khi chưa
   đủ duyệt là để một nội dung chưa ai chốt đi ra phục vụ khách — và
   nội dung đã ra ngoài không sửa lại được nữa. */
export async function nhapKho(y, env, db, hoSo) {
  if (!laR01(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Chỉ Super Admin 入库 được — đây là bước đưa nội dung ra phục vụ khách.' };

  const napId = String((y || {}).napId || '').trim();
  const bn = await db.prepare('SELECT id,tenKho,trangThai,aiSoan,loaiDuyet FROM banNhapKho WHERE id = ?')
    .bind(napId).first();
  if (!bn) return { ok: false, code: 'KHONGCO', error: 'Không có bản nháp: ' + napId };
  if (bn.trangThai === 'daNhap')
    return { ok: false, code: 'ROI', error: 'Bản này 入库 rồi.' };
  const chuoi = chuoiCua(bn.loaiDuyet);
  if (!chuoi) return { ok: false, code: 'KHONGCHUOI', error: 'Bản nháp mang loại duyệt lạ: ' + bn.loaiDuyet };

  const daKy = ((await db.prepare('SELECT cap,aiDuyet FROM duyetNhap WHERE napId = ?')
    .bind(napId).all()).results) || [];
  const capCoKy = {}; daKy.forEach(function (r) { capCoKy[r.cap] = r.aiDuyet; });
  const thieu = chuoi.map(function (c) { return c.ma; }).filter(function (c) { return !capCoKy[c]; });
  const nguoiKy = {}; daKy.forEach(function (r) { nguoiKy[r.aiDuyet] = 1; });

  /* Cổng đứng TRƯỚC câu UPDATE 入库. */
  if (thieu.length)
    return { ok: false, code: 'CHUADU', thieu,
      error: 'Chưa đủ chữ ký ba cấp — còn thiếu: ' + thieu.join(', ') + '. 入库 khi chưa ' +
        'đủ duyệt là để một nội dung chưa ai chốt đi ra phục vụ khách.' };
  if (Object.keys(nguoiKy).length < 3)
    return { ok: false, code: 'KHONGDU3NGUOI',
      error: 'Ba cấp phải do ba người khác nhau ký.' };

  const luc = new Date().toISOString();
  await db.prepare('UPDATE banNhapKho SET trangThai = ?, aiNhap = ?, nhapLuc = ? WHERE id = ?')
    .bind('daNhap', ten(hoSo), luc, napId).run();
  await ghiSoDen(db, hoSo, 'THT_NHAPKHO', napId, bn.tenKho);
  return { ok: true, napId, trangThai: 'daNhap', nhapLuc: luc };
}

/* ═══════════════ TRẢ PHẦN BỔ SUNG ĐÃ 入库 ═══════════════

   Chỉ trả bản trạng thái 'daNhap' — ranh giới nằm ở CÂU TRUY VẤN
   (WHERE trangThai='daNhap'), không ở màn hình. Lọc trên màn KHÔNG phải
   bảo vệ dữ liệu (luật đã cắn ba lần). Bản 'nhap' chưa duyệt không bao
   giờ vào câu này.

   ══ HAI RANH GIỚI, KHÔNG PHẢI MỘT (9.99.112) ══

   Ba chuỗi cấp phép KHÔNG cùng khán giả: `kho` là chuỗi DUY NHẤT phục vụ
   khách; `camNang` (cẩm nang gỡ ca coach) và `ungPho` (đối phó đối thủ,
   nêu cả điểm yếu của GITA) là NỘI BỘ. Bản đầu không lọc `loaiDuyet` và
   không kiểm vai, nên một khách (R13/R14/R15) đọc được cả playbook nội bộ
   — đúng lớp lỗi "lọc trên màn không phải bảo vệ dữ liệu" (KICHBAN/CV_MUC/
   17 kho nghề), và đúng kịch bản tình huống 5 (khách coach dò hệ). Nay:
   người ngoài nghề CHỈ thấy chuỗi `kho`; nhà nghề thấy cả ba. Ranh giới ở
   CÂU TRUY VẤN. */
export async function traBoSung(y, env, db, hoSo) {
  const tenKho = String((y || {}).tenKho || '').trim();
  const nhaNghe = laNguoiNha(hoSo);
  let q = 'SELECT id,tenKho,tieuDe,noiDung,nguon,nhapLuc,loaiDuyet FROM banNhapKho WHERE trangThai = ?';
  const b = ['daNhap'];
  if (!nhaNghe) q += " AND loaiDuyet = 'kho'";
  if (tenKho) { q += ' AND tenKho = ?'; b.push(tenKho); }
  q += ' ORDER BY nhapLuc DESC LIMIT 50';
  const rs = ((await db.prepare(q).bind(...b).all()).results) || [];
  return { ok: true, bo: rs };
}

/* ═══════════════ ĐỌC SỔ TỰ HOÀN THIỆN ═══════════════

   Đếm phát sinh theo loại (đo được), và mỗi bản nháp kèm chữ ký ĐÃ CÓ
   tính lúc đọc. Không trả một con số "đã qua mấy cấp" gộp lại. */
export async function soatTuHoanThien(y, env, db, hoSo) {
  if (!laNguoiNha(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Sổ tự hoàn thiện mở cho R01–R12.' };

  const ps = ((await db.prepare('SELECT loai, COUNT(*) n FROM phatSinh GROUP BY loai').all())
    .results) || [];
  const nhaps = ((await db.prepare(
    'SELECT id,tenKho,tieuDe,aiSoan,soanLuc,trangThai,loaiDuyet FROM banNhapKho ORDER BY soanLuc DESC LIMIT 50')
    .all()).results) || [];

  const out = [];
  for (const n of nhaps) {
    const daKy = ((await db.prepare('SELECT cap,aiDuyet FROM duyetNhap WHERE napId = ?')
      .bind(n.id).all()).results) || [];
    const co = daKy.map(function (r) { return r.cap; });
    const nguoi = {}; daKy.forEach(function (r) { nguoi[r.aiDuyet] = 1; });
    const chuoi = chuoiCua(n.loaiDuyet) || [];
    const maChuoi = chuoi.map(function (c) { return c.ma; });
    out.push({ id: n.id, tenKho: n.tenKho, tieuDe: n.tieuDe, aiSoan: n.aiSoan,
      soanLuc: n.soanLuc, trangThai: n.trangThai, loaiDuyet: n.loaiDuyet, daKy: co,
      thieu: maChuoi.filter(function (c) { return co.indexOf(c) < 0; }),
      du: maChuoi.length > 0 && maChuoi.every(function (c) { return co.indexOf(c) >= 0; }) &&
        Object.keys(nguoi).length >= 3 });
  }
  return { ok: true, phatSinh: ps, nhap: out, chuoi: CHUOI,
    khongGopSo: 'Đủ ba cấp hay chưa tính lúc đọc từ sổ chữ ký, không một cột "đãDuyệt". ' +
      'Một cột tóm tắt thì hoặc bị gõ đè, hoặc cũ đi lặng lẽ.' };
}
