/* ═══════════════════════════════════════════════════════════════
   GITA 365 — PHÂN HỆ 4: VẬN HÀNH & CHĂM SÓC, PHẦN CHẠY Ở MÁY CHỦ

   Bản chép của G.VH_* — bộ kiểm mục 83 đối chiếu từng ô với kho.

   ══ CÁI RĂNG CHÍNH: ĐÈN ĐỎ PHẢI GỌI ══

   Bảng đèn ba màu của bản đặc tả có một cột mà mọi bảng đèn khác
   thường thiếu: AI LÀM. Và cả phân hệ có giá trị ở đúng dòng cuối —
   đèn Đỏ, NGƯỜI THẬT, GỌI ĐIỆN.

   Một cái đèn đỏ đóng lại được bằng một tin nhắn thì nó không phải
   đèn đỏ. Nhắn tin rẻ, nhanh, và đóng được việc trong sổ — nên nếu
   cho phép thì mọi đèn đỏ đều đóng bằng tin nhắn, và bảng ba màu còn
   đúng hai màu. Nên `ghiCham` CHẶN một lượt nhắn vào nhà đang đỏ.

   ══ VÀ MỘT CHỖ CỐ Ý KHÔNG THEO BẢN ĐẶC TẢ ══

   6.4 đề nghị lưu sổ dấu vết trên Google Sheets. Mỗi dòng sổ mang
   tên gia đình, tên con, và nội dung một cuộc trò chuyện riêng —
   đẩy nó lên một dịch vụ đặt ngoài lãnh thổ là xử lý dữ liệu xuyên
   biên giới theo Luật số 91/2025/QH15, và phạm thẳng Điều 13 của
   chính Hiến pháp Bộ não. Sổ nằm ở D1.
   ═══════════════════════════════════════════════════════════════ */

import { Kho } from './nen.js';
import * as BoNao from './bo-nao.js';
import * as ConNguoi from './con-nguoi.js';
import * as PhapLy from './phap-ly-rui-ro.js';

/* ═══════════════ BẢN CHÉP CỦA KHO ═══════════════ */

export const DEN3 = ['XANH', 'VANG', 'DO'];
export const DEN_GOI = 'DO';
export const NGUONG_VANG = 7;
export const NGUONG_DO = 14;
export const TU_THAN = [8, 12];

export const NHIP = [
  [1, 1, 1, 'ngay'], [2, 7, 1, 'ngay'], [8, 12, 2, 'ngay'],
  [13, 21, 1, 'ngay'], [22, 90, 2, 'tuan'], [91, 365, 1, 'tuan']
];

export const SO5 = ['ngay', 'maNha', 'noiDung', 'canCu', 'aiDuyet'];
export const SO_BAT_BUOC = ['canCu', 'aiDuyet'];

export const TRUONG23 = [
  'C01', 'C02', 'C03', 'C04', 'C05', 'C06', 'C07', 'C08', 'C09', 'C10', 'C11', 'C12',
  'D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08',
  'V01', 'V02', 'V03'
];

/* Trường nào máy TÍNH và trường nào TRỎ sang hệ khác — cả hai loại
   đều KHÔNG có cột trong bảng. Danh sách này để mục 83 đối chiếu
   thẳng với các cột thật của `hoSoSongSinh`: một cột lọt vào là đỏ,
   dù chưa ai gõ vào nó. Phép đo về thứ KHÔNG ĐƯỢC TỒN TẠI, cùng lối
   với LR1 ở mục 79 và cửa tự khai ở mục 81. */
export const TRUONG_MAY_TINH = ['C12', 'D01', 'D02', 'D06', 'D07'];
export const TRUONG_TRO_SANG = ['C11', 'D03', 'D04', 'D05', 'V01'];

/* Tên cột thật của bảng, đúng phần người khai. Mục 83 đối chiếu bảng
   trong csdl.sql với danh sách này. */
export const COT_NGUOI_KHAI = ['tenChaMe', 'tenCon', 'tuoiCon', 'tinhCach',
  'noiLo', 'tuHao', 'daThuThatBai', 'khungGioRanh', 'xungHo', 'ngaySinhCon',
  'ghiChu', 'mua', 'tangGiaTri'];

/* Cột CẤM có mặt trong bảng — bốn trường máy tính và năm trường trỏ
   sang, viết theo đúng tên người ta hay đặt nếu lỡ dựng. */
export const COT_CAM = ['den', 'denTinHieu', 'soNgayImLang', 'ngayChamGanNhat',
  'soWow', 'tang', 'phanHoc', 'tyLe21', 'kpi', 'maThe', 'theVungManh',
  'chamGanNhatNoiGi'];

function duocVaoVH(hoSo) {
  return /^R(0[1-9]|1[0-2])$/.test(String((hoSo || {}).role || ''));
}

/* Máy không ngồi vào chỗ của người. Cùng danh sách với ghế giữ hồn
   của Phân hệ 2 — chặn thứ máy tự gọi mình, không cố dò "tên này có
   phải người thật không": không dò được, và một phép dò không dò
   được chỉ dạy người ta cách gõ vòng qua. */
const TEN_MAY = ['may', 'máy', 'ai', 'bot', 'gpt', 'claude', 'bonao', 'bo-nao',
  'bộ não', 'he thong', 'hệ thống', 'system', 'auto', 'tudong', 'tự động'];

const laMay = t => TEN_MAY.indexOf(String(t || '').trim().toLowerCase()) >= 0;

/* ═══════════════ NGÀY THỨ MẤY CỦA HÀNH TRÌNH ═══════════════ */
export function ngayThu(thamGia, bayGio) {
  const a = Date.parse(thamGia), b = Date.parse(bayGio || new Date().toISOString());
  if (!a || !b) return 0;
  return Math.floor((b - a) / 86400000) + 1;   /* ngày tham gia là ngày 1 */
}

export function nhipCuaNgay(n) {
  const r = NHIP.find(([t, d]) => n >= t && n <= d);
  if (!r) return { ngoaiNhip: true };
  return { tu: r[0], den: r[1], soLan: r[2], donVi: r[3],
    tuThan: r[0] === TU_THAN[0] && r[1] === TU_THAN[1] };
}

/* ═══════════════ ĐÈN — TÍNH LÚC ĐỌC, KHÔNG GIỮ CỘT ═══════════════

   Một cột `den` phải có ai đó chạy cập nhật, và ngày không ai chạy
   thì nó khai XANH cho một nhà đã im lặng hai mươi ngày — rồi cả quy
   trình gọi điện trong hai mươi tư giờ đi theo nó. Cùng luật với cột
   `conHan` KHÔNG có trong theVungManh. */
export function tinhDen({ imLang, ngayThu: n, coLoiNan }) {
  const im = Number(imLang) || 0;
  const tt = n >= TU_THAN[0] && n <= TU_THAN[1];

  if (coLoiNan === true || im > NGUONG_DO) {
    return { den: 'DO', batBuocGoi: true, tuThan: tt,
      vi: im > NGUONG_DO
        ? 'Im lặng ' + im + ' ngày, quá ngưỡng ' + NGUONG_DO + '.'
        : 'Gia đình đã nói một lời nản chí.',
      lam: 'GỌI ĐIỆN trong 24 giờ, người thật. Không bán gì trong cuộc gọi ấy.' };
  }
  if (im >= NGUONG_VANG || tt) {
    return { den: 'VANG', batBuocGoi: false, tuThan: tt,
      vi: tt
        ? 'Đang ở ngày ' + n + ' — VÙNG TỬ THẦN (' + TU_THAN.join('–') + ').'
        : 'Im lặng ' + im + ' ngày.',
      lam: 'Nhắn hỏi thăm trong 24 giờ. Máy soạn, NGƯỜI duyệt. KHÔNG nhắc bài.' };
  }
  return { den: 'XANH', batBuocGoi: false, tuThan: tt,
    vi: 'Có chạm trong ' + NGUONG_VANG + ' ngày.',
    lam: 'Gửi WOW đúng lịch.' };
}

/* ═══════════════ KHÔNG NHẮC BÀI ═══════════════

   Đèn Vàng và vùng tử thần đều CẤM nhắc bài. Dò CỤM nhiều âm tiết
   chứ không dò âm tiết trần: "bài" trần nằm trong "bài viết", "bài
   hát", "một bài chia sẻ" — và tiếng Việt không phân từ bằng khoảng
   trắng nên biên âm tiết không cứu được gì. Chặn ở chỗ CHỌN DẤU
   HIỆU, như bảng cụm tuyệt đối của Phân hệ 3. */
export const CUM_NHAC_BAI = ['làm bài', 'nộp bài', 'chưa làm bài', 'còn bài',
  'bài tập', 'hoàn thành bài', 'học bài', 'trả bài', 'deadline', 'hạn nộp',
  'chưa hoàn thành', 'còn thiếu bài', 'nhắc con làm'];

export function soatNhacBai(chu) {
  const s = String(chu || '').toLowerCase().replace(/\s+/g, ' ');
  const dinh = CUM_NHAC_BAI.filter(c => s.indexOf(c) >= 0);
  return {
    sach: dinh.length === 0, dinh,
    vi: dinh.length
      ? 'Câu này NHẮC BÀI: "' + dinh.join('" · "') + '". Ngày 8–12 là chỗ người ta ' +
        'bỏ, và bỏ trong im lặng — nhắc bài đúng lúc ấy là đẩy họ đi nhanh hơn.'
      : 'Không nhắc bài.'
  };
}

/* ═══════════════ ĐỌC MỘT HỒ SƠ SONG SINH ═══════════════ */
export async function docSongSinh(y, env, db, hoSo) {
  if (!duocVaoVH(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Cổng Vận hành & chăm sóc mở cho R01–R12.' };

  const maNha = String((y || {}).maNha || '').trim();
  if (!maNha) return { ok: false, error: 'Thiếu mã gia đình.' };

  const hs = await db.prepare('SELECT * FROM hoSoSongSinh WHERE maNha = ?')
    .bind(maNha).first();
  if (!hs) return { ok: false, code: 'CHUACO',
    error: 'Nhà này chưa có hồ sơ song sinh.' };

  /* Rút đồng ý chặn cả ĐỌC (9.99.112) — cùng luật với docTheVungManh:
     đọc hồ sơ con để dùng lại là xử lý tiếp, mà rút đồng ý (Luật 91) là
     chặn xử lý tiếp. Ghi lại lượt bị chặn. */
  const dyDoc = await PhapLy.soatDongYCon(maNha, db);
  if (!dyDoc.duoc) {
    await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'VH_DOC_SS_CHAN',
      doiTuong: maNha, chiTiet: dyDoc.code });
    return { ok: false, code: dyDoc.code,
      error: 'Nhà này ' + (dyDoc.code === 'DARUT' ? 'đã RÚT đồng ý' : 'chưa có đồng ý') +
        ' cho dữ liệu về con — không phục vụ hồ sơ nữa (Luật 91: rút đồng ý chặn xử lý tiếp).' };
  }

  /* rowid DESC phá hoà (9.99.114) — ngay chỉ tới NGÀY, nhiều lượt chạm
     cùng ngày thì fold trả TÙY Ý một dòng, mà dòng này lái đèn đỏ/im lặng.
     Cùng lớp lỗi fold-tiền heSoCua và theVungManh (9.99.112–113). */
  const cuoi = await db.prepare(
    'SELECT ngay, noiDung, kieu FROM soCham WHERE maNha = ? ORDER BY ngay DESC, rowid DESC LIMIT 1')
    .bind(maNha).first();
  const demWow = await db.prepare(
    "SELECT COUNT(*) n FROM soCham WHERE maNha = ? AND kieu = 'wow'")
    .bind(maNha).first();

  const bayGio = (y || {}).bayGio || new Date().toISOString();
  const n = ngayThu(hs.ngayThamGia, bayGio);
  const imLang = cuoi
    ? Math.floor((Date.parse(bayGio) - Date.parse(cuoi.ngay)) / 86400000)
    : n;

  /* ── LUẬT 91 · VIỆC SỐ 6 ── ghi lượt ĐỌC, không chỉ lượt ghi. */
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'VH_DOC_SS',
    doiTuong: maNha, chiTiet: 'đọc hồ sơ song sinh' });

  const den = tinhDen({ imLang, ngayThu: n, coLoiNan: (y || {}).coLoiNan === true });

  /* Bốn trường máy tính trả về ở đây, và KHÔNG có cột nào cho chúng
     trong bảng. Trả kèm ô `tinh` để người đọc biết con số này máy
     tính chứ không ai gõ — cùng luật tách hai ngăn của phễu thị giác
     và của bộ lọc quảng cáo. */
  return { ok: true, maNha,
    nguoiKhai: {
      tenChaMe: hs.tenChaMe, tenCon: hs.tenCon, tuoiCon: hs.tuoiCon,
      tinhCach: hs.tinhCach, noiLo: hs.noiLo, tuHao: hs.tuHao,
      daThuThatBai: hs.daThuThatBai, khungGioRanh: hs.khungGioRanh,
      xungHo: hs.xungHo, ngaySinhCon: hs.ngaySinhCon, ghiChu: hs.ghiChu,
      mua: hs.mua, tangGiaTri: hs.tangGiaTri
    },
    mayTinh: {
      ngayChamGanNhat: cuoi ? cuoi.ngay : undefined,
      chamGanNhatNoiGi: cuoi ? cuoi.noiDung : undefined,
      soNgayImLang: imLang,
      soWow: Number((demWow || {}).n || 0),
      den: den.den
    },
    ngayThu: n, nhip: nhipCuaNgay(n), den,
    vi: 'Bốn trường ở ngăn mayTinh KHÔNG có cột trong bảng — chúng tính lúc đọc. ' +
      'Một cột đèn cũ khai XANH cho một nhà đã im lặng hai mươi ngày, và cả quy ' +
      'trình gọi điện trong hai mươi tư giờ đi theo nó.' };
}

/* ═══════════════ GHI MỘT LƯỢT CHẠM ═══════════════

   Ba cái cổng, theo thứ tự đắt dần:
     1. căn cứ và người duyệt — không có thì đây là một tin nhắn
     2. đèn Vàng / vùng tử thần — không được nhắc bài
     3. đèn Đỏ — PHẢI gọi, và người gọi phải là người thật */
export async function ghiCham(y, env, db, hoSo) {
  if (!duocVaoVH(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Cổng Vận hành & chăm sóc mở cho R01–R12.' };

  const x = y || {};
  const maNha = String(x.maNha || '').trim();
  const kieu = String(x.kieu || '').trim();
  const noiDung = String(x.noiDung || '').trim();
  const canCu = String(x.canCu || '').trim();
  const aiDuyet = String(x.aiDuyet || '').trim();

  if (!maNha || !noiDung) return { ok: false, error: 'Thiếu mã gia đình hoặc nội dung.' };
  if (['nhan', 'goi', 'wow'].indexOf(kieu) < 0) return { ok: false, code: 'KIEULA',
    error: 'Kiểu chạm phải là nhan · goi · wow.' };

  /* ── CỔNG 1 · HAI CỘT LÀM CHO CẢ SỔ CÓ NGHĨA ── */
  const thieu = [];
  if (!canCu) thieu.push('canCu');
  if (!aiDuyet) thieu.push('aiDuyet');
  if (thieu.length) return { ok: false, code: 'THIEUCOT', thieu,
    error: 'Sổ dấu vết thiếu ' + thieu.join(' · ') + '. Một lượt chạm không có căn ' +
      'cứ thì nó là một tin nhắn, không phải một việc làm theo quy trình — và lúc ' +
      'có tranh chấp, một tin nhắn không chứng minh được gì.' };

  /* Đèn đọc THẲNG từ sổ, không nhận từ người gọi: nhận từ người gọi
     thì ai muốn nhắn vào một nhà đỏ chỉ cần khai nhà ấy đang xanh. */
  const doc = await docSongSinh({ maNha, bayGio: x.bayGio, coLoiNan: x.coLoiNan },
    env, db, hoSo);
  if (!doc.ok) return doc;
  const den = doc.den;

  /* ── CỔNG 2 · VÀNG VÀ VÙNG TỬ THẦN: KHÔNG NHẮC BÀI ── */
  if (den.den === 'VANG' || den.tuThan) {
    const nb = soatNhacBai(noiDung);
    if (!nb.sach) return { ok: false, code: 'NHACBAI', den: den.den,
      tuThan: den.tuThan, dinh: nb.dinh, error: nb.vi };
  }

  /* ── CỔNG 3 · ĐỎ PHẢI GỌI, VÀ NGƯỜI GỌI PHẢI LÀ NGƯỜI ── */
  if (den.den === DEN_GOI) {
    if (kieu !== 'goi') return { ok: false, code: 'DOPHAIGOI', den: 'DO',
      error: 'Nhà này đang ở đèn ĐỎ, nên lượt chạm phải là một CUỘC GỌI. Một cái ' +
        'đèn đỏ đóng lại được bằng tin nhắn thì nó không phải đèn đỏ — nhắn tin rẻ, ' +
        'nhanh, và đóng được việc trong sổ, nên nếu cho phép thì mọi đèn đỏ đều ' +
        'đóng bằng tin nhắn và bảng ba màu còn đúng hai màu.' };
    if (laMay(hoSo.u) || laMay(x.boiAi)) return { ok: false, code: 'DOPHAINGUOI',
      den: 'DO',
      error: 'Cuộc gọi đèn Đỏ phải do NGƯỜI THẬT thực hiện. Thứ đang thiếu ở một ' +
        'nhà im lặng mười lăm ngày là một người, không phải một câu chữ.' };
  }

  /* ── CỔNG 4 · BA CỬA CỦA PHÂN HỆ 6 ──
     Người chưa qua đủ ba cửa thì không chạm khách MỘT MÌNH. Cổng nằm
     ở đây — chỗ một lượt chạm được GHI — chứ không ở màn hình: đặt ở
     màn hình thì nó là một lời nhắc, người ta đọc, thấy hợp lý, rồi
     vẫn gọi vì hôm nay thiếu người, và mỗi lần nhân nhượng đều hợp lý
     ở đúng ca ấy.

     VÌ SAO ĐỨNG SAU BA CỔNG KIA chứ không đứng đầu: cả bốn cổng đều
     chặn, nên thứ tự chỉ quyết câu người ta ĐỌC TRƯỚC. Ba cổng trên
     nói về chính lượt chạm này và câu của chúng cụ thể hơn. Đặt cổng
     ba cửa lên đầu thì một cái máy gọi vào nhà đỏ nhận câu "chưa qua
     ba cửa" — đúng, nhưng lạc, vì vấn đề của nó là nó không phải một
     người. */
  const baCua = await ConNguoi.soatChamKhach(
    { maNguoi: String(x.boiAi || hoSo.u || '').trim(), nguoiKem: x.nguoiKem }, db);
  if (!baCua.duoc) return { ok: false, code: baCua.code, thieu: baCua.thieu,
    nguoiKem: baCua.nguoiKem, error: baCua.error };

  /* Nội dung chạm mang tên con và nỗi lo của một gia đình, nên nó
     không được rời hệ — soi bằng chính cửa Điều 13 của Bộ não, không
     dựng bộ dò thứ hai. Ở ĐÂY chỉ ghi vào sổ trong hệ, nên soi là để
     bắt trường hợp người viết dán nhầm một đoạn đã dựng để gửi ra
     ngoài. */
  const id = 'CH-' + Date.now().toString(36) + '-' +
    Math.random().toString(36).slice(2, 6);
  const ghiLuc = new Date().toISOString();

  await db.prepare(
    'INSERT INTO soCham (id,maNha,ngay,kieu,denLuc,noiDung,canCu,aiDuyet,boiAi,ghiLuc)' +
    ' VALUES (?,?,?,?,?,?,?,?,?,?)')
    .bind(id, maNha, String(x.ngay || ghiLuc).slice(0, 10), kieu, den.den,
      noiDung, canCu, aiDuyet, String(x.boiAi || hoSo.u || ''), ghiLuc).run();

  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'VH_CHAM',
    doiTuong: maNha, chiTiet: kieu + ' · đèn ' + den.den + ' · duyệt ' + aiDuyet });

  return { ok: true, id, maNha, kieu, den: den.den, tuThan: den.tuThan,
    vi: 'Đã ghi một DÒNG MỚI vào sổ dấu vết. Ghi đè dòng cũ thì mất hẳn phần lịch ' +
      'sử, và chính phần lịch sử chứng minh được rằng Học viện chạm ĐỀU chứ không ' +
      'chạm dồn một hôm.' };
}

/* ═══════════════ ĐỌC SỔ DẤU VẾT CỦA MỘT NHÀ ═══════════════ */
export async function doSoCham(y, env, db, hoSo) {
  if (!duocVaoVH(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Cổng Vận hành & chăm sóc mở cho R01–R12.' };
  const maNha = String((y || {}).maNha || '').trim();
  if (!maNha) return { ok: false, error: 'Thiếu mã gia đình.' };
  const r = await db.prepare(
    'SELECT ngay, kieu, denLuc, noiDung, canCu, aiDuyet, boiAi FROM soCham' +
    ' WHERE maNha = ? ORDER BY ngay ASC').bind(maNha).all();
  const ds = (r.results || r || []);
  return { ok: true, maNha, so: ds.length, ds,
    vi: 'Xếp TĂNG DẦN, đọc xuôi được — xếp giảm dần thì đọc đời một gia đình phải ' +
      'đọc ngược, và mất chỗ ngay dòng thứ ba.' };
}

/* ═══════════════ SỔ NÀY KHÔNG RA GOOGLE SHEETS ═══════════════

   Cửa xuất sổ ra ngoài đi qua ĐÚNG cổng ẩn danh của Điều 13, không
   có đường vòng. Gọi thẳng bộ soi của Bộ não chứ không dựng bộ dò
   thứ hai — bộ thứ hai cũ đi lặng lẽ. */
export function xuatSoRaNgoai(ds) {
  const chuoi = (Array.isArray(ds) ? ds : []).map(d =>
    [d.ngay, d.maNha, d.noiDung, d.canCu].join(' · ')).join('\n');
  const ra = BoNao.soatRaNgoai(chuoi);
  return {
    duocRa: ra.sach, ngo: ra.ngo,
    vi: ra.sach
      ? 'Chuỗi này không mang dấu hiệu nhận dạng nào — ra ngoài được.'
      : 'CHẶN. Sổ dấu vết mang tên gia đình, tên con và nội dung một cuộc trò ' +
        'chuyện riêng. Đẩy nó lên một dịch vụ đặt ngoài lãnh thổ là xử lý dữ liệu ' +
        'xuyên biên giới theo Luật số 91/2025/QH15, và phạm thẳng Điều 13. Bản đặc ' +
        'tả đề nghị Google Sheets; chỗ này cố ý không làm theo.'
  };
}

/* ═══════════════ LẬP HỒ SƠ SONG SINH ═══════════════

   Cổng ở đây là một cổng về THỨ KHÔNG ĐƯỢC GHI: người gọi gửi lên
   một trường máy tính hoặc một trường đã sống ở hệ khác thì CHẶN,
   không lặng lẽ bỏ qua.

   Bỏ qua thì người gửi tưởng ô ấy đã được ghi và lần sau gửi lại —
   rồi một hôm ai đó thêm cột cho vừa, và lúc ấy một phép đo đã biến
   thành một lời khai mà không ai quyết định điều đó cả. Cùng lối với
   cổng ADN của trợ lý hình ảnh: chặn ở chỗ GHI, không chỉ ở chỗ đọc. */
export async function lapSongSinh(y, env, db, hoSo) {
  if (!duocVaoVH(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Cổng Vận hành & chăm sóc mở cho R01–R12.' };

  const x = y || {};
  const maNha = String(x.maNha || '').trim();
  if (!maNha) return { ok: false, error: 'Thiếu mã gia đình.' };
  if (!String(x.ngayThamGia || '').trim()) return { ok: false, code: 'THIEUTHAMGIA',
    error: 'Thiếu ngày tham gia. Cả nhịp 365 ngày sinh ra từ mốc ấy — không có mốc ' +
      'thì không có lịch chạm nào, và nhà nào người phụ trách nhớ mới được chạm.' };

  /* ── LUẬT 91 · VIỆC SỐ 3 ──
     Hồ sơ song sinh giữ tên con, tuổi con, tính cách và nỗi lo của
     một gia đình thật. Đây là cửa thứ hai trong hai cửa tạo ra một hồ
     sơ về con, nên cổng đồng ý của cha mẹ nằm ở đây — không có cổng
     thì việc số 3 của Luật 91 là một dòng chữ trong một bảng bảy dòng. */
  const dyCon = await PhapLy.soatDongYCon(maNha, db);
  if (!dyCon.duoc) return { ok: false, code: dyCon.code, error: dyCon.error };

  const oLa = COT_CAM.filter(k => x[k] !== undefined);
  if (oLa.length) return { ok: false, code: 'OTUTINH', oLa,
    error: 'Ô không được ghi: ' + oLa.join(' · ') + '. Chúng là trường MÁY TÍNH ' +
      'hoặc trường đã sống ở hệ khác, nên hồ sơ song sinh không giữ cột nào cho ' +
      'chúng. Ghi đè một trường máy tính là biến một phép đo thành một lời khai — ' +
      'mà nhìn thì vẫn y hệt.' };

  /* Tên con và nỗi lo của gia đình đi vào đây là ĐÚNG — trong hệ thì
     dữ liệu gia đình được phép có mặt. Cổng ẩn danh nằm ở cửa ĐI RA,
     không ở cửa ghi vào. */
  const nay = new Date().toISOString();
  const co = await db.prepare('SELECT maNha FROM hoSoSongSinh WHERE maNha = ?')
    .bind(maNha).first();

  if (co) {
    const cot = [], gt = [];
    COT_NGUOI_KHAI.forEach(k => {
      if (x[k] !== undefined) { cot.push(k + ' = ?'); gt.push(x[k]); }
    });
    if (!cot.length) return { ok: false, error: 'Không có ô nào để sửa.' };
    await db.prepare('UPDATE hoSoSongSinh SET ' + cot.join(', ') +
      ', suaBoiAi = ?, suaLuc = ? WHERE maNha = ?')
      .bind(...gt, hoSo.u || '', nay, maNha).run();
    await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'VH_SUA_SS',
      doiTuong: maNha, chiTiet: cot.length + ' ô' });
    return { ok: true, maNha, moi: false, soO: cot.length };
  }

  await db.prepare(
    'INSERT INTO hoSoSongSinh (maNha,' + COT_NGUOI_KHAI.join(',') +
    ',ngayThamGia,lapBoiAi,lapLuc) VALUES (?' +
    COT_NGUOI_KHAI.map(() => ',?').join('') + ',?,?,?)')
    .bind(maNha, ...COT_NGUOI_KHAI.map(k => x[k] === undefined ? null : x[k]),
      String(x.ngayThamGia), hoSo.u || '', nay).run();

  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'VH_LAP_SS',
    doiTuong: maNha, chiTiet: 'tham gia ' + String(x.ngayThamGia).slice(0, 10) });

  return { ok: true, maNha, moi: true,
    vi: 'Hồ sơ giữ ĐÚNG mười ba ô người khai. Bốn trường máy tính và năm trường ' +
      'trỏ sang hệ khác không có cột nào ở đây — đọc ra thì tính, không gõ vào.' };
}
