/* ═══════════════════════════════════════════════════════════════
   GITA 365 — BẢNG GIÁ SỬA ĐƯỢC

   ══ VÌ SAO PHẢI CÓ MÔ-ĐUN NÀY ══

   Tới 9.99.72, giá gói nằm ở HAI chỗ và cả hai đều là MÃ: `G.HP_TANG[].gia`
   trong kho đã mã hoá, và một hằng số trong `tai-chinh.js`. Muốn đổi một
   con số thì phải sửa kho gốc → mã hoá lại → gộp mã → dựng lại → đẩy.

   Chủ hệ nói thẳng: *giá hiện tại là tạm thời để xây dựng, bộ khung là cố
   định, cần chỗ sửa số khi cần*. Một con số tạm mà chỉ đổi được bằng một
   lượt phát hành thì trên thực tế nó không tạm — nó cứng, và cái cứng
   nhầm chỗ thì người ta đi đường vòng: gõ tay số khác vào hợp đồng, và
   sổ với hợp đồng nói hai giá.

   ══ KHUNG Ở KHO, SỐ Ở SỔ ══

   `G.HP_TANG` giữ KHUNG — tên bậc, gồm gì, KHÔNG gồm gì, nhịp thu, điều
   khoản hoàn. Khung là lời hứa, và lời hứa đổi thì phải qua một lượt
   phát hành để còn đọc lại được. SỐ nằm ở bảng `bangGia` trong D1, sửa
   được ngay, và mỗi lần sửa là MỘT DÒNG MỚI.

   ══ BA CHỖ DỄ HỎNG, VÀ CẢ BA ĐỀU CÓ RĂNG ══

   1. Giá đã chốt vào lịch thu của một nhà thì KHÔNG đổi theo. Đổi theo
      là đổi số tiền một gia đình đã ký — chuyện ấy không sửa lại được.
   2. Đổi giá KHÔNG tự dời thang duyệt chi. Thang neo vào giá gói, nhưng
      dời thang là một quyết định riêng có người ký.
   3. Giá là VÙNG ĐỎ (`BoNao.DO10` có `datGia`). Chỉ R01, và phải viết
      lý do.
   ═══════════════════════════════════════════════════════════════ */

import { Kho } from './nen.js';
import * as BoNao from './bo-nao.js';

/* ═══════════════ GIÁ KHỞI ĐẦU ═══════════════

   ĐÂY KHÔNG PHẢI GIÁ HIỆN HÀNH. Đây là con số kho mở ra lần đầu, dùng
   khi bảng `bangGia` chưa có dòng nào cho bậc ấy.

   Tên cũ là `GIA_TANG` và nó nằm ở `tai-chinh.js`. Đổi tên là cố ý: một
   hằng số tên `GIA_TANG` mà KHÔNG phải giá đang chạy là cái bẫy đúng
   nghĩa — người đọc sau tin nó, tính một con số, và con số ấy sai theo
   đúng hướng không ai kiểm. Tên mới nói thẳng nó là gì.

   Bộ kiểm **mục 90** đối chiếu bảng này với `G.HP_TANG[].gia` trong kho:
   hai bản KHỞI ĐẦU phải khớp nhau, vì kho là bản gốc của khung.

   Phép đo ấy trước 9.99.73 nằm lọt trong khối mục 80 nhưng mọi chú
   giải — kể cả CLAUDE.md — đều gọi nó là mục 71, nên dòng đỏ của nó
   in ra một số mục KHÔNG dẫn tới đâu. Nay giá có mục của riêng nó. */
export const GIA_KHOI_DAU = {1: 0, 2: 500000, 3: 10000000, 4: 30000000, 5: 50000000};

/* Khai đủ NĂM ô thì mới là một bậc. Một bậc chỉ có số mà không có lời
   hứa là một cái giá không gắn với cái gì — và lúc có tranh chấp thì
   không ai đọc ra bên bán đã hứa giao những gì. */
export const O_KHUNG = ['ten', 'gom', 'khong', 'nhip', 'hoan'];

function laR01(hoSo) { return String((hoSo || {}).role || '') === 'R01'; }
function xemDuoc(hoSo) { return /^R0[1-3]$/.test(String((hoSo || {}).role || '')); }

/* Giá là Vùng Đỏ — trỏ sang Bộ não, không khai lại danh sách. */
export const VIEC_VUNG_DO = 'datGia';
export function laVungDo() { return BoNao.DO10.indexOf(VIEC_VUNG_DO) >= 0; }

/* ═══════════════ GIÁ ĐANG CHẠY ═══════════════

   Dòng MỚI NHẤT của mỗi bậc là giá hiện hành. Tính lúc đọc, không giữ
   một cột "giá hiện tại" — một cột như thế phải có ai đó cập nhật, và
   ngày không ai cập nhật thì nó nói dối trong im lặng. Cùng luật với cột
   `conHan` không có trong theVungManh và cột `den` không có trong
   hoSoSongSinh.

   Ô `nguon` là ô quan trọng nhất của kết quả: nó nói con số này là giá
   KHỞI ĐẦU hay đã có người đổi. Gộp hai thứ ấy lại thì một bậc chưa ai
   đụng tới trông y hệt một bậc vừa được chốt lại tuần trước. */
export async function docGiaHienHanh(db) {
  const r = await db.prepare(
    /* rowid ASC là mốc phá hoà: fold lấy dòng CUỐI mỗi bậc làm giá hiện
       hành, mà ghiLuc mili-giây trùng thì thứ tự mảng tùy ý → giá đọc sai.
       Sổ chỉ thêm nên rowid tăng đơn điệu. Cùng lớp lỗi 9.99.112. */
    'SELECT tang, gia, lyDo, boiAi, ghiLuc, dong, ten, gom, khong, nhip, hoan' +
    ' FROM bangGia ORDER BY ghiLuc ASC, rowid ASC').all();
  const ds = (r.results || r || []);

  const moi = {};
  ds.forEach(d => { moi[String(d.tang)] = d; });

  const gia = {}, nguon = {}, doiLuc = {}, boiAi = {}, dongBac = [];
  Object.keys(GIA_KHOI_DAU).forEach(t => {
    gia[t] = GIA_KHOI_DAU[t];
    nguon[t] = 'khoiDau';
  });
  Object.keys(moi).forEach(t => {
    const d = moi[t];
    gia[t] = Number(d.gia);
    nguon[t] = 'daDoi';
    doiLuc[t] = d.ghiLuc;
    boiAi[t] = d.boiAi;
    if (Number(d.dong) === 1) dongBac.push(t);
  });

  return { gia, nguon, doiLuc, boiAi, dongBac, soLanDoi: ds.length,
    bacMoi: Object.keys(moi).filter(t => GIA_KHOI_DAU[t] === undefined) };
}

export async function docBangGia(y, env, db, hoSo) {
  if (!xemDuoc(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Bảng giá mở cho R01–R03. Đổi giá thì chỉ R01.' };

  const t = await docGiaHienHanh(db);
  const chuaDoi = Object.keys(t.gia).filter(k => t.nguon[k] === 'khoiDau');

  return { ok: true, ...t,
    doiDuocBoiAi: 'Chỉ R01. Đặt và đổi giá nằm trong mười việc Vùng Đỏ của Hiến pháp.',
    chuaDoi,
    vi: Object.keys(t.gia).length + ' bậc · ' + (Object.keys(t.gia).length - chuaDoi.length) +
      ' bậc đã có người đổi, ' + chuaDoi.length + ' bậc còn ở GIÁ KHỞI ĐẦU' +
      (t.dongBac.length ? ' · đã đóng: ' + t.dongBac.join(' · ') : ''),
    khungOKho: 'Tên bậc, gồm gì, KHÔNG gồm gì, nhịp thu và điều khoản hoàn nằm ở ' +
      'G.HP_TANG trong kho — khung là LỜI HỨA, và lời hứa đổi thì phải qua một lượt ' +
      'phát hành để còn đọc lại được. Ở đây chỉ đổi SỐ.' };
}

/* ═══════════════ ĐỔI GIÁ MỘT BẬC ═══════════════

   MỘT LẦN ĐỔI LÀ MỘT DÒNG MỚI. Không có cột nào bị ghi đè.

   Vì sao gắt: câu người ta hỏi lúc có tranh chấp không phải "giá bây
   giờ là bao nhiêu" — nó là "hôm ấy nhà này ký ở giá nào". Ghi đè thì
   câu ấy không còn chỗ nào trả lời được, và lúc cần thì đã muộn. */
export async function doiGia(y, env, db, hoSo) {
  if (!laR01(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Chỉ R01 (Super Admin) đổi được giá. "Đặt hoặc đổi giá" là một trong mười ' +
      'việc VÙNG ĐỎ của Hiến pháp — không uỷ quyền cho ai, và cũng không cho máy.' };

  const x = y || {};
  const tang = String(x.tang || '').trim();
  const lyDo = String(x.lyDo || '').trim();
  if (!tang) return { ok: false, code: 'THIEUO', error: 'Thiếu mã bậc.' };

  const gia = Number(x.gia);
  if (!Number.isFinite(gia) || gia < 0) return { ok: false, code: 'GIALA',
    error: 'Giá phải là một số không âm. Bậc miễn phí ghi 0 — 0 là ĐÃ BIẾT VÀ BẰNG ' +
      'KHÔNG, khác hẳn bỏ trống là CHƯA BIẾT.' };

  if (lyDo.length < 10) return { ok: false, code: 'THIEULYDO',
    error: 'Đổi giá phải viết LÝ DO. Sáu tháng sau không ai nhớ vì sao con số ấy đổi, ' +
      'và một bảng giá có lịch sử mà không có lý do thì nó chỉ kể được rằng đã đổi, ' +
      'không kể được vì sao — mà vì sao mới là thứ người sau cần.' };

  const t = await docGiaHienHanh(db);
  const laBacMoi = t.gia[tang] === undefined;

  /* ── BẬC MỚI PHẢI CÓ ĐỦ KHUNG ──
     Một bậc chỉ có số mà không có lời hứa là một cái giá không gắn với
     cái gì. Bậc đã có sẵn thì khung nằm ở kho, nên không hỏi lại. */
  const khung = {};
  if (laBacMoi) {
    const thieu = O_KHUNG.filter(o => !String(x[o] || '').trim());
    if (thieu.length) return { ok: false, code: 'THIEUKHUNG', thieu,
      error: 'Bậc MỚI phải khai đủ năm ô của khung, đang thiếu: ' + thieu.join(' · ') +
        '. Một bậc chỉ có số mà không có lời hứa là một cái giá không gắn với cái gì — ' +
        'và lúc có tranh chấp thì không ai đọc ra bên bán đã hứa giao những gì.' };
    O_KHUNG.forEach(o => { khung[o] = String(x[o]).trim(); });
  }

  const giaCu = t.gia[tang];
  if (!laBacMoi && Number(giaCu) === gia) return { ok: false, code: 'KHONGDOI',
    error: 'Giá mới bằng đúng giá đang chạy (' + gia + '). Ghi một dòng không đổi gì ' +
      'là làm sổ dài ra mà không thêm sự thật nào.' };

  const id = 'BG-' + Date.now().toString(36) + '-' +
    Math.random().toString(36).slice(2, 6);
  const ghiLuc = new Date().toISOString();
  await db.prepare(
    'INSERT INTO bangGia (id,tang,gia,lyDo,boiAi,vaiBoiAi,ghiLuc,dong,' +
    'ten,gom,khong,nhip,hoan) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind(id, tang, gia, lyDo, String(hoSo.u || ''), String(hoSo.role || ''),
      ghiLuc, x.dong === true ? 1 : 0,
      khung.ten || null, khung.gom || null, khung.khong || null,
      khung.nhip || null, khung.hoan || null).run();

  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'BG_DOIGIA',
    doiTuong: tang,
    chiTiet: (laBacMoi ? 'bậc mới ' : String(giaCu) + ' → ') + gia + ' · ' + lyDo.slice(0, 80) });

  return { ok: true, id, tang, gia, giaCu: laBacMoi ? undefined : giaCu, laBacMoi,
    /* Hai câu phải nói ra ngay, không để người đổi giá tự phát hiện. */
    lichThuCuKhongDoi: 'Lịch thu đã dựng cho các nhà GIỮ NGUYÊN số tiền cũ. Đổi theo ' +
      'là đổi số tiền một gia đình đã ký — chuyện ấy không sửa lại được.',
    thangChuaChotLai: 'Thang duyệt chi neo vào giá gói, và nó KHÔNG tự dời theo. Chạy ' +
      'soatNeoThang để xem chỗ lệch, rồi chốt lại thang bằng một quyết định có người ký.',
    vi: 'Đã ghi một DÒNG MỚI. Câu người ta hỏi lúc có tranh chấp không phải "giá bây ' +
      'giờ là bao nhiêu" — nó là "hôm ấy nhà này ký ở giá nào".' };
}

/* ═══════════════ SỔ ĐỔI GIÁ ═══════════════ */
export async function soDoiGia(y, env, db, hoSo) {
  if (!xemDuoc(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Sổ đổi giá mở cho R01–R03.' };

  const tang = String((y || {}).tang || '').trim();
  const r = tang
    ? await db.prepare('SELECT * FROM bangGia WHERE tang = ? ORDER BY ghiLuc ASC, rowid ASC')
        .bind(tang).all()
    : await db.prepare('SELECT * FROM bangGia ORDER BY ghiLuc ASC, rowid ASC').all();
  const ds = (r.results || r || []);

  return { ok: true, so: ds.length, ds,
    vi: ds.length
      ? ds.length + ' lần đổi trong sổ, xếp TĂNG DẦN — đọc xuôi được.'
      : 'Chưa ai đổi giá lần nào. Mọi bậc đang ở GIÁ KHỞI ĐẦU.' };
}
