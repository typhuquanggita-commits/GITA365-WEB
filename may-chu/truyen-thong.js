/* ═══════════════════════════════════════════════════════════════
   GITA 365 — BẢN TIN GITA · TRUYỀN THÔNG NỘI BỘ (máy chủ)

   Chủ hệ 10/10/2026: khu "Nội dung & truyền thông" của nhân sự đang hời
   hợt — trang bảng tin nội bộ cũ chỉ GIẢI THÍCH LUẬT của một bảng tin,
   không có một bài nào để đọc. Cần truyền thông thật: tầm nhìn · sứ mệnh ·
   giá trị · triết lý · văn hoá · tiêu chuẩn · hiến pháp · định vị; tôn
   vinh người cống hiến, đại sứ, thành viên tiến bộ; trách nhiệm; chiến
   dịch; hướng dẫn vận hành; sự kiện; yêu cầu học tập. Mọi nhân sự phải
   cập nhật thường xuyên — tính vào KPI và có trong thi nghiệp vụ.

   ── BỐN THỨ LÀM NÓ THÀNH THẬT, KHÔNG PHẢI MỘT TRANG LÀM MÀU ──

   1. KHUNG BÀI THEO CHUYÊN MỤC (soatBaiTT). Mỗi chuyên mục đòi đúng những
      ô làm nên một bài có giá trị: bài nền dài đủ để nói được một ý, bài
      vinh danh phải có VIỆC CỤ THỂ và BẰNG CHỨNG (luật "Neo phải có bằng
      chứng thật" của kim chỉ nam 05), hướng dẫn phải có bước, yêu cầu học
      tập phải có câu kiểm tra. Mọi bài phải nói người đọc LÀM ĐƯỢC GÌ sau
      khi đọc. Thiếu thì máy nói thiếu ô nào — không nhận bài rỗng.
   2. NGƯỜI SOẠN ≠ NGƯỜI DUYỆT. Ban biên tập (R01–R04) duyệt; không ai
      duyệt bài của chính mình (so bằng Kho.layUid, email cũng không lách
      được). Riêng Super Admin BAN HÀNH trực tiếp — văn bản nền của Học
      viện là lời của người đứng đầu, và nó được ghi đúng là "ban hành".
   3. LỊCH PHÁT HÀNH tính LÚC ĐỌC. Bài đã duyệt có `lich`; bài hiện trên
      bản tin khi lich ≤ bây giờ. Không cột "đã phát hành" nào để có người
      quên bật — cùng luật cột `conHan` không có trong theVungManh.
   4. ĐO ĐƯỢC. Bài bắt buộc đọc có hạn xác nhận và 1–3 câu kiểm tra; ĐÁP
      ÁN không bao giờ gửi xuống máy khách trước khi trả lời. chiSoTT đo
      ba phần — xác nhận đúng hạn · hiểu · đóng góp — và nghiệp vụ trong
      KPI đọc nó (xep-hang-luong.js).

   ── LUẬT CỦA BẢNG TIN NỘI BỘ CŨ, GIỮ NGUYÊN ──
   · Khách (R13–R15) không đọc được — cổng ở máy chủ, không ở màn.
   · Vinh danh ghi nhận VIỆC, không xếp hạng người: chữ xếp hạng bị chặn.
   · Con số trong bài phải khai nguồn.
   · Đại sứ là khách hàng: vinh danh đại sứ phải khai đã có đồng ý công khai.
   ═══════════════════════════════════════════════════════════════ */
import { Kho } from './nen.js';
import { CUM_TUYET_DOI } from './noi-dung-tiep-thi.js';

import { bacVai as lvCua } from './vai-tro.js';
export const BIEN_TAP_TOI = 4;          /* R01–R04 duyệt bài */
export const GO_TOI = 3;                /* R01–R03 gỡ bài đã phát hành */

/* ── MƯỜI MỘT CHUYÊN MỤC ── bản chép của G.TT_CHUYEN_MUC (bộ thử đối chiếu).
   toiThieu: số ký tự nội dung tối thiểu — đủ để một bài nói được một ý
   trọn, không phải để độn chữ. */
export const CHUYEN_MUC = [
  { ma: 'NEN',      ten: 'Tầm nhìn · sứ mệnh · giá trị cốt lõi', toiThieu: 800 },
  { ma: 'VANHOA',   ten: 'Triết lý kinh doanh · văn hoá GITA',   toiThieu: 800 },
  { ma: 'CHUAN',    ten: 'Tiêu chuẩn con người · chất lượng dịch vụ', toiThieu: 600 },
  { ma: 'HIENPHAP', ten: 'Hiến pháp · phong cách · định vị khác biệt', toiThieu: 800 },
  { ma: 'CONGHIEN', ten: 'Vinh danh người cống hiến',            toiThieu: 300, vinhDanh: true },
  { ma: 'DAISU',    ten: 'Đại sứ · thành viên tiến bộ vượt trội', toiThieu: 300, vinhDanh: true, khach: true },
  { ma: 'TRACHNHIEM', ten: 'Tinh thần trách nhiệm',              toiThieu: 500 },
  { ma: 'CHIENDICH', ten: 'Chiến dịch',                           toiThieu: 400, chienDich: true },
  { ma: 'VANHANH',  ten: 'Hướng dẫn vận hành',                    toiThieu: 400, buoc: true },
  { ma: 'SUKIEN',   ten: 'Sự kiện · thông báo',                   toiThieu: 150, suKien: true },
  { ma: 'HOCTAP',   ten: 'Yêu cầu học tập',                       toiThieu: 300, batBuoc: true }
];
const CM = Object.fromEntries(CHUYEN_MUC.map(c => [c.ma, c]));

/* Thư viện ảnh 3D: mã ảnh có thật trong assets/. Bài trỏ vào ảnh không có
   là một ô vỡ trên bản tin — chặn ở đây. Bản chép của G.TT_ANH. */
export const ANH_HOP_LE = /^(TT(0[1-9]|1[0-9]|2[0-4])|MAI|P[1-8]|CUA|NEN|B(0[1-9]|10))$/;

/* Chữ xếp hạng — vinh danh ghi nhận việc, không xếp người (luật bảng tin
   nội bộ và LR1). Cụm nhiều âm tiết để không bắt oan "nhất định". */
const CUM_XEP_HANG = ['hạng nhất', 'top 1', 'top 3', 'top 10', 'đứng đầu', 'giỏi nhất', 'xuất sắc nhất',
  'số 1 của', 'hơn tất cả', 'bỏ xa', 'vượt mặt', 'xếp hạng', 'bảng xếp'];
const CO_SO = /\d+\s*(%|phần trăm|người|nhà|gia đình|lần|buổi|giờ|ngày|triệu|tỷ|đồng|khách)/i;

const S = v => String(v == null ? '' : v).trim();
const nhoChu = s => S(s).toLowerCase();

/* ═══ KHUNG BÀI — trả danh sách lỗi, rỗng là đạt ═══ */
export function soatBaiTT(b) {
  const l = [];
  const c = CM[S(b.chuyenMuc)];
  if (!c) return ['chuyên mục không có trong danh sách'];
  const td = S(b.tieuDe), tt = S(b.tomTat), nd = S(b.noiDung), hd = S(b.hanhDong);
  if (td.length < 10 || td.length > 110) l.push('tiêu đề 10–110 ký tự');
  if (tt.length < 60 || tt.length > 260) l.push('tóm tắt 60–260 ký tự — một đoạn người đọc lướt là hiểu bài nói gì');
  if (nd.length < c.toiThieu) l.push('nội dung tối thiểu ' + c.toiThieu + ' ký tự cho chuyên mục này (đang ' + nd.length + ')');
  if (nd.length > 20000) l.push('nội dung quá 20.000 ký tự — tách thành loạt bài');
  if (hd.length < 20) l.push('thiếu ô "Sau khi đọc, bạn làm được gì" (≥ 20 ký tự)');
  if (!ANH_HOP_LE.test(S(b.anh))) l.push('chọn một ảnh 3D trong thư viện');
  const toanBai = nhoChu(td + ' ' + tt + ' ' + nd + ' ' + hd);
  const tuyetDoi = CUM_TUYET_DOI.filter(x => toanBai.includes(x));
  if (tuyetDoi.length) l.push('có từ tuyệt đối: ' + tuyetDoi.join(', '));
  if (CO_SO.test(nd) && S(b.nguon).length < 12) l.push('bài có con số — khai số lấy từ đâu (ô Nguồn số liệu ≥ 12 ký tự)');
  if (c.vinhDanh) {
    if (S(b.nguoiDuocGhiNhan).length < 2) l.push('vinh danh: ghi rõ người được ghi nhận');
    if (S(b.viecCuThe).length < 80) l.push('vinh danh: mô tả VIỆC CỤ THỂ đã làm (≥ 80 ký tự) — ghi nhận việc, không khen chung');
    if (S(b.bangChung).length < 40) l.push('vinh danh: bằng chứng (số đo, ngày, sổ nào) ≥ 40 ký tự');
    const xh = CUM_XEP_HANG.filter(x => toanBai.includes(x));
    if (xh.length) l.push('vinh danh không xếp hạng người: bỏ "' + xh.join('", "') + '"');
    if (c.khach && b.dongYCongKhai !== true) l.push('đại sứ là khách hàng: phải xác nhận đã có đồng ý công khai của họ');
  }
  if (c.chienDich) {
    if (S(b.mucTieu).length < 30) l.push('chiến dịch: mục tiêu đo được (≥ 30 ký tự)');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(S(b.tuNgay)) || !/^\d{4}-\d{2}-\d{2}$/.test(S(b.denNgay)) || S(b.tuNgay) > S(b.denNgay))
      l.push('chiến dịch: khai từ ngày – đến ngày');
  }
  if (c.suKien && !/^\d{4}-\d{2}-\d{2}/.test(S(b.thoiDiem))) l.push('sự kiện: khai thời điểm diễn ra');
  if (c.buoc) {
    const bs = (Array.isArray(b.buocLam) ? b.buocLam : []).map(S).filter(x => x.length >= 8);
    if (bs.length < 3) l.push('hướng dẫn vận hành: ít nhất 3 bước làm được (mỗi bước ≥ 8 ký tự)');
  }
  const canKiemTra = c.batBuoc || b.batBuocDoc === true;
  if (canKiemTra) {
    const ch = Array.isArray(b.cauHoi) ? b.cauHoi : [];
    if (ch.length < 1 || ch.length > 3) l.push('bài bắt buộc đọc: 1–3 câu kiểm tra hiểu');
    ch.forEach((q, i) => {
      const chon = Array.isArray(q && q.chon) ? q.chon.map(S).filter(Boolean) : [];
      if (S(q && q.cau).length < 10 || chon.length < 2 || chon.length > 5 || !(Number.isInteger(q.dung) && q.dung >= 0 && q.dung < chon.length))
        l.push('câu kiểm tra ' + (i + 1) + ': cần câu hỏi, 2–5 lựa chọn và một đáp án đúng');
    });
    const han = Number(b.hanNgay);
    if (!(han >= 1 && han <= 14)) l.push('bài bắt buộc đọc: hạn xác nhận 1–14 ngày sau khi phát hành');
  }
  return l;
}

/* Giữ đúng các ô được phép — không lưu thứ máy khách nhồi thêm. */
function locBai(b) {
  const o = {};
  ['chuyenMuc', 'tieuDe', 'tomTat', 'noiDung', 'hanhDong', 'anh', 'nguon', 'nguoiDuocGhiNhan', 'viecCuThe', 'bangChung',
    'mucTieu', 'tuNgay', 'denNgay', 'thoiDiem', 'diaDiem'].forEach(k => { if (S(b[k])) o[k] = S(b[k]).slice(0, 20000); });
  if (Array.isArray(b.buocLam)) o.buocLam = b.buocLam.map(S).filter(Boolean).slice(0, 20);
  if (b.dongYCongKhai === true) o.dongYCongKhai = true;
  const c = CM[o.chuyenMuc];
  if ((c && c.batBuoc) || b.batBuocDoc === true) {
    o.batBuocDoc = true;
    o.hanNgay = Math.round(Number(b.hanNgay) || 0);
    o.cauHoi = (Array.isArray(b.cauHoi) ? b.cauHoi : []).slice(0, 3).map(q => ({
      cau: S(q.cau).slice(0, 300), chon: (q.chon || []).map(S).filter(Boolean).slice(0, 5).map(x => x.slice(0, 200)), dung: Number(q.dung) }));
  }
  return o;
}
/* Bản gửi xuống máy khách: bỏ đáp án. */
function choKhach(r, cuaToi) {
  const b = JSON.parse(r.noiDungJson || '{}');
  if (b.cauHoi) b.cauHoi = b.cauHoi.map(q => ({ cau: q.cau, chon: q.chon }));
  return { id: r.id, trangThai: r.trangThai, lich: r.lich, tacGia: r.tacGia, nguoiDuyet: r.nguoiDuyet || '',
    ghiChuDuyet: r.ghiChuDuyet || '', taoLuc: r.taoLuc, ...b, ...(cuaToi || {}) };
}

const moiId = () => 'TT-' + Date.now().toString(36) + '-' + crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
const laNhanSu = hoSo => lvCua(hoSo) <= 12;
const bayGio = () => new Date().toISOString();

/* ═══ SOẠN / SỬA BẢN NHÁP (mọi nhân sự R01–R12) ═══ */
export async function soanBaiTT(y, env, db, hoSo) {
  if (!laNhanSu(hoSo)) return { ok: false, code: 'NOPERM', error: 'Bản tin nội bộ dành cho nhân sự.' };
  const b = locBai(y.bai || {});
  const uid = await Kho.layUid(db, hoSo.u);
  if (y.id) {
    const cu = await db.prepare('SELECT * FROM ttBai WHERE id = ?').bind(S(y.id)).first();
    if (!cu) return { ok: false, code: 'KHONGCO', error: 'Không có bài này.' };
    if (cu.tacGiaUid !== uid) return { ok: false, code: 'NOPERM', error: 'Chỉ tác giả sửa được bản nháp của mình.' };
    if (!['nhap', 'traVe'].includes(cu.trangThai)) return { ok: false, code: 'KHOA', error: 'Bài đã nộp duyệt — chờ biên tập trả về mới sửa được.' };
    await db.prepare('UPDATE ttBai SET chuyenMuc = ?, noiDungJson = ?, suaLuc = ? WHERE id = ?')
      .bind(b.chuyenMuc || '', JSON.stringify(b), bayGio(), cu.id).run();
    return { ok: true, id: cu.id, loi: soatBaiTT(b) };
  }
  const id = moiId();
  await db.prepare('INSERT INTO ttBai (id, chuyenMuc, noiDungJson, tacGia, tacGiaUid, trangThai, taoLuc, suaLuc) VALUES (?,?,?,?,?,?,?,?)')
    .bind(id, b.chuyenMuc || '', JSON.stringify(b), hoSo.u, uid, 'nhap', bayGio(), bayGio()).run();
  return { ok: true, id, loi: soatBaiTT(b) };
}

/* ═══ NỘP DUYỆT — khung phải đạt, nếu không nói thiếu gì ═══ */
export async function nopBaiTT(y, env, db, hoSo) {
  if (!laNhanSu(hoSo)) return { ok: false, code: 'NOPERM', error: 'Bản tin nội bộ dành cho nhân sự.' };
  const cu = await db.prepare('SELECT * FROM ttBai WHERE id = ?').bind(S(y.id)).first();
  if (!cu) return { ok: false, code: 'KHONGCO', error: 'Không có bài này.' };
  if (cu.tacGiaUid !== await Kho.layUid(db, hoSo.u)) return { ok: false, code: 'NOPERM', error: 'Chỉ tác giả nộp được bài của mình.' };
  if (!['nhap', 'traVe'].includes(cu.trangThai)) return { ok: false, code: 'KHOA', error: 'Bài đã nộp rồi.' };
  const loi = soatBaiTT(JSON.parse(cu.noiDungJson || '{}'));
  if (loi.length) return { ok: false, code: 'THIEU', error: 'Bài chưa đủ khung: ' + loi.join('; '), loi };
  await db.prepare("UPDATE ttBai SET trangThai = 'choDuyet', nopLuc = ? WHERE id = ?").bind(bayGio(), cu.id).run();
  return { ok: true };
}

/* ═══ DUYỆT · TRẢ VỀ · BAN HÀNH ═══
   Ban biên tập R01–R04. Không duyệt bài của chính mình — trừ Super Admin
   BAN HÀNH (y.banHanh), ghi đúng tên ấy vào sổ. Lịch không được ở quá khứ
   quá 10 phút (lệch đồng hồ), không quá 90 ngày tới. */
export async function duyetBaiTT(y, env, db, hoSo) {
  const lv = lvCua(hoSo);
  if (lv > BIEN_TAP_TOI) return { ok: false, code: 'NOPERM', error: 'Duyệt bài là việc của ban biên tập (R01–R04).' };
  const cu = await db.prepare('SELECT * FROM ttBai WHERE id = ?').bind(S(y.id)).first();
  if (!cu) return { ok: false, code: 'KHONGCO', error: 'Không có bài này.' };
  const uid = await Kho.layUid(db, hoSo.u);
  const banHanh = y.banHanh === true && lv === 1;
  if (cu.tacGiaUid === uid && !banHanh) return { ok: false, code: 'TUDUYET', error: 'Không duyệt bài của chính mình — chuyển cho một người khác trong ban biên tập.' };
  const choPhep = banHanh ? ['nhap', 'traVe', 'choDuyet'] : ['choDuyet'];
  if (!choPhep.includes(cu.trangThai)) return { ok: false, code: 'KHOA', error: 'Bài không ở trạng thái chờ duyệt.' };
  if (y.quyet === 'traVe') {
    if (S(y.ghiChu).length < 20) return { ok: false, code: 'THIEU', error: 'Trả về thì viết rõ cần sửa gì (≥ 20 ký tự).' };
    await db.prepare("UPDATE ttBai SET trangThai = 'traVe', nguoiDuyet = ?, ghiChuDuyet = ?, duyetLuc = ? WHERE id = ?")
      .bind(hoSo.u, S(y.ghiChu).slice(0, 1000), bayGio(), cu.id).run();
    return { ok: true, trangThai: 'traVe' };
  }
  const b = JSON.parse(cu.noiDungJson || '{}');
  const loi = soatBaiTT(b);
  if (loi.length) return { ok: false, code: 'THIEU', error: 'Bài chưa đủ khung: ' + loi.join('; '), loi };
  const t = Date.parse(S(y.lich));
  if (!isFinite(t) || t < Date.now() - 600000 || t > Date.now() + 90 * 86400000)
    return { ok: false, code: 'LICH', error: 'Chọn lịch phát hành từ bây giờ tới 90 ngày tới.' };
  await db.prepare("UPDATE ttBai SET trangThai = 'daDuyet', lich = ?, nguoiDuyet = ?, ghiChuDuyet = ?, duyetLuc = ? WHERE id = ?")
    .bind(new Date(t).toISOString(), banHanh ? hoSo.u + ' (ban hành)' : hoSo.u, S(y.ghiChu).slice(0, 1000), bayGio(), cu.id).run();
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: banHanh ? 'TT_BANHANH' : 'TT_DUYET', doiTuong: cu.id, chiTiet: 'lịch ' + new Date(t).toISOString() });
  return { ok: true, trangThai: 'daDuyet', lich: new Date(t).toISOString() };
}

/* ═══ GỠ BÀI (R01–R03, phải có lý do) ═══ */
export async function goBaiTT(y, env, db, hoSo) {
  if (lvCua(hoSo) > GO_TOI) return { ok: false, code: 'NOPERM', error: 'Gỡ bài là việc của R01–R03.' };
  if (S(y.lyDo).length < 15) return { ok: false, code: 'THIEU', error: 'Gỡ bài phải ghi lý do (≥ 15 ký tự) — để lần sau không ai dựng lại đúng bài ấy.' };
  const r = await db.prepare("UPDATE ttBai SET trangThai = 'daGo', ghiChuDuyet = ?, duyetLuc = ? WHERE id = ? AND trangThai = 'daDuyet'")
    .bind('Gỡ: ' + S(y.lyDo).slice(0, 500), bayGio(), S(y.id)).run();
  if (!(r.meta && r.meta.changes)) return { ok: false, code: 'KHONGCO', error: 'Không có bài đang phát hành với mã này.' };
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'TT_GO', doiTuong: S(y.id), chiTiet: S(y.lyDo).slice(0, 200) });
  return { ok: true };
}

/* ═══ DANH SÁCH ═══
   Bản tin: bài đã duyệt có lịch ≤ bây giờ. Ban biên tập thấy thêm hàng chờ
   và bài đã lên lịch; tác giả thấy bài của mình ở mọi trạng thái. */
export async function dsBaiTT(y, env, db, hoSo) {
  if (!laNhanSu(hoSo)) return { ok: false, code: 'NOPERM', error: 'Bản tin nội bộ dành cho nhân sự.' };
  const uid = await Kho.layUid(db, hoSo.u), now = bayGio();
  const cm = CM[S(y.chuyenMuc)] ? S(y.chuyenMuc) : '';
  const daPhat = (await db.prepare("SELECT * FROM ttBai WHERE trangThai = 'daDuyet' AND lich <= ?" + (cm ? ' AND chuyenMuc = ?' : '') +
    ' ORDER BY lich DESC, rowid DESC LIMIT 200').bind(...(cm ? [now, cm] : [now])).all()).results || [];
  const doc = (await db.prepare('SELECT baiId, docLuc, xacNhanLuc, diem FROM ttDoc WHERE uid = ?').bind(uid).all()).results || [];
  const dm = Object.fromEntries(doc.map(d => [d.baiId, d]));
  const banTin = daPhat.map(r => {
    const d = dm[r.id], b = JSON.parse(r.noiDungJson || '{}');
    const han = b.batBuocDoc ? new Date(Date.parse(r.lich) + b.hanNgay * 86400000).toISOString() : '';
    return { id: r.id, chuyenMuc: r.chuyenMuc, tieuDe: b.tieuDe, tomTat: b.tomTat, anh: b.anh, tacGia: r.tacGia, lich: r.lich,
      batBuocDoc: !!b.batBuocDoc, hanXacNhan: han, daDoc: !!(d && d.docLuc), daXacNhan: !!(d && d.xacNhanLuc), diem: d ? d.diem : undefined };
  });
  const out = { ok: true, banTin, laBienTap: lvCua(hoSo) <= BIEN_TAP_TOI, chuyenMuc: CHUYEN_MUC.map(c => ({ ma: c.ma, ten: c.ten, toiThieu: c.toiThieu })) };
  const cuaToi = (await db.prepare('SELECT * FROM ttBai WHERE tacGiaUid = ? ORDER BY suaLuc DESC, rowid DESC LIMIT 100').bind(uid).all()).results || [];
  out.cuaToi = cuaToi.map(r => choKhach(r));
  if (out.laBienTap) {
    const hang = (await db.prepare("SELECT * FROM ttBai WHERE trangThai = 'choDuyet' ORDER BY nopLuc ASC, rowid ASC LIMIT 100").all()).results || [];
    const sap = (await db.prepare("SELECT * FROM ttBai WHERE trangThai = 'daDuyet' AND lich > ? ORDER BY lich ASC, rowid ASC LIMIT 100").bind(now).all()).results || [];
    out.choDuyet = hang.map(r => choKhach(r));
    out.sapPhat = sap.map(r => choKhach(r));
  }
  return out;
}

/* ═══ ĐỌC MỘT BÀI — ghi lượt đọc ═══ */
export async function docBaiTT(y, env, db, hoSo) {
  if (!laNhanSu(hoSo)) return { ok: false, code: 'NOPERM', error: 'Bản tin nội bộ dành cho nhân sự.' };
  const r = await db.prepare('SELECT * FROM ttBai WHERE id = ?').bind(S(y.id)).first();
  if (!r) return { ok: false, code: 'KHONGCO', error: 'Không có bài này.' };
  const uid = await Kho.layUid(db, hoSo.u);
  const congKhai = r.trangThai === 'daDuyet' && r.lich <= bayGio();
  if (!congKhai && r.tacGiaUid !== uid && lvCua(hoSo) > BIEN_TAP_TOI)
    return { ok: false, code: 'NOPERM', error: 'Bài chưa phát hành.' };
  let d = null;
  if (congKhai) {
    await db.prepare('INSERT OR IGNORE INTO ttDoc (baiId, uid, u, docLuc) VALUES (?,?,?,?)').bind(r.id, uid, hoSo.u, bayGio()).run();
    d = await db.prepare('SELECT * FROM ttDoc WHERE baiId = ? AND uid = ?').bind(r.id, uid).first();
  }
  const soDoc = (await db.prepare('SELECT COUNT(*) n FROM ttDoc WHERE baiId = ?').bind(r.id).first()).n;
  return { ok: true, bai: choKhach(r, { daXacNhan: !!(d && d.xacNhanLuc), diem: d ? d.diem : undefined, soNguoiDoc: soDoc }) };
}

/* ═══ XÁC NHẬN BÀI BẮT BUỘC — chấm câu kiểm tra ở máy chủ ═══
   Trả lời một lần; đúng hay sai đều ghi, kèm đáp án đúng SAU khi nộp —
   để người đọc học từ chỗ sai chứ không chỉ nhận một con số. */
export async function xacNhanBaiTT(y, env, db, hoSo) {
  if (!laNhanSu(hoSo)) return { ok: false, code: 'NOPERM', error: 'Bản tin nội bộ dành cho nhân sự.' };
  const r = await db.prepare("SELECT * FROM ttBai WHERE id = ? AND trangThai = 'daDuyet' AND lich <= ?").bind(S(y.id), bayGio()).first();
  if (!r) return { ok: false, code: 'KHONGCO', error: 'Bài chưa phát hành hoặc không có.' };
  const b = JSON.parse(r.noiDungJson || '{}');
  if (!b.batBuocDoc) return { ok: false, code: 'SAI', error: 'Bài này không cần xác nhận.' };
  const uid = await Kho.layUid(db, hoSo.u);
  const d = await db.prepare('SELECT * FROM ttDoc WHERE baiId = ? AND uid = ?').bind(r.id, uid).first();
  if (d && d.xacNhanLuc) return { ok: false, code: 'DAXONG', error: 'Bạn đã xác nhận bài này rồi.' };
  const tl = Array.isArray(y.traLoi) ? y.traLoi : [];
  const dung = b.cauHoi.filter((q, i) => Number(tl[i]) === q.dung).length;
  const diem = Math.round(100 * dung / b.cauHoi.length);
  const luc = bayGio();
  await db.prepare('INSERT INTO ttDoc (baiId, uid, u, docLuc, xacNhanLuc, diem) VALUES (?,?,?,?,?,?) ' +
    'ON CONFLICT(baiId, uid) DO UPDATE SET xacNhanLuc = excluded.xacNhanLuc, diem = excluded.diem')
    .bind(r.id, uid, hoSo.u, luc, luc, diem).run();
  const han = Date.parse(r.lich) + b.hanNgay * 86400000;
  return { ok: true, diem, dungHan: Date.parse(luc) <= han, dapAn: b.cauHoi.map(q => q.dung) };
}

/* ═══ LỊCH PHÁT HÀNH — nhịp chuẩn bốn tuần tới, ô nào đã có bài ═══
   Bản chép của G.TT_NHIP. Một ô trống không phải lỗi máy — nó là việc
   biên tập phải giao người viết, và nó hiện ra để không ai quên. */
export const NHIP = [
  { thu: 1, gio: '08:00', chuyenMuc: ['NEN', 'VANHOA', 'HIENPHAP', 'TRACHNHIEM'], ten: 'Thứ Hai · nền tảng GITA (luân phiên)' },
  { thu: 2, gio: '08:00', chuyenMuc: ['VANHANH'], ten: 'Thứ Ba · hướng dẫn vận hành' },
  { thu: 3, gio: '08:00', chuyenMuc: ['CHUAN'], ten: 'Thứ Tư · tiêu chuẩn con người · chất lượng dịch vụ' },
  { thu: 4, gio: '08:00', chuyenMuc: ['HOCTAP'], ten: 'Thứ Năm · yêu cầu học tập' },
  { thu: 5, gio: '16:00', chuyenMuc: ['CONGHIEN', 'DAISU'], ten: 'Thứ Sáu · vinh danh' },
  { ngay: 1, gio: '08:00', chuyenMuc: ['CHIENDICH'], ten: 'Ngày 1 hằng tháng · chiến dịch tháng' }
];
const ngayVN = t => new Date(t + 7 * 3600000).toISOString().slice(0, 10);
export async function lichTT(y, env, db, hoSo) {
  if (!laNhanSu(hoSo)) return { ok: false, code: 'NOPERM', error: 'Bản tin nội bộ dành cho nhân sự.' };
  const tu = Date.now(), den = tu + 28 * 86400000;
  const bai = (await db.prepare("SELECT id, chuyenMuc, lich, noiDungJson, tacGia FROM ttBai WHERE trangThai = 'daDuyet' AND lich >= ? AND lich <= ? ORDER BY lich ASC")
    .bind(new Date(tu - 86400000).toISOString(), new Date(den).toISOString()).all()).results || [];
  const o = [];
  for (let t = tu; t <= den; t += 86400000) {
    const ngay = ngayVN(t), d = new Date(Date.parse(ngay + 'T00:00:00Z'));
    NHIP.forEach(n => {
      const khop = n.ngay ? d.getUTCDate() === n.ngay : d.getUTCDay() === n.thu;
      if (!khop) return;
      const coBai = bai.filter(b => ngayVN(Date.parse(b.lich)) === ngay && n.chuyenMuc.includes(b.chuyenMuc))
        .map(b => ({ id: b.id, chuyenMuc: b.chuyenMuc, tieuDe: JSON.parse(b.noiDungJson || '{}').tieuDe, tacGia: b.tacGia }));
      o.push({ ngay, gio: n.gio, ten: n.ten, chuyenMuc: n.chuyenMuc, bai: coBai, trong: !coBai.length });
    });
  }
  const ngoaiNhip = bai.filter(b => !o.some(x => x.bai.some(z => z.id === b.id)))
    .map(b => ({ id: b.id, chuyenMuc: b.chuyenMuc, lich: b.lich, tieuDe: JSON.parse(b.noiDungJson || '{}').tieuDe }));
  return { ok: true, o, ngoaiNhip, soTrong: o.filter(x => x.trong).length };
}

/* ═══ CHỈ SỐ TRUYỀN THÔNG CỦA MỘT NGƯỜI TRONG KỲ ═══
   Ba phần, mỗi phần chỉ tính khi ÁP DỤNG được (vắng mặt là không áp dụng,
   không phải 0):
   · XÁC NHẬN ĐÚNG HẠN (50) — bài bắt buộc phát hành trong kỳ.
   · HIỂU (20) — điểm câu kiểm tra của những bài đã xác nhận.
   · ĐÓNG GÓP (30) — bài mình viết đã phát hành trong kỳ, so với
     DONG_GOP_THANG (mặc định 1 bài/tháng, chủ hệ chỉnh).
   Kỳ không có bài bắt buộc nào thì phần một và hai không áp dụng; điểm là
   phần đóng góp. Kỳ YYYY-MM theo giờ Việt Nam. */
export const TRONG_SO_TT = Object.freeze({ xacNhan: 50, hieu: 20, dongGop: 30 });
export const DONG_GOP_THANG = 1;
const ranhKy = ky => [Date.parse(ky + '-01T00:00:00+07:00'),
  Date.parse((Number(ky.slice(5)) === 12 ? (Number(ky.slice(0, 4)) + 1) + '-01' : ky.slice(0, 5) + String(Number(ky.slice(5)) + 1).padStart(2, '0')) + '-01T00:00:00+07:00')];
export async function chiSoMotNguoi(db, uid, ky, gioiHan) {
  const [a, b] = ranhKy(ky);
  const den = Math.min(b, gioiHan || Date.now());
  const batBuoc = ((await db.prepare("SELECT id, lich, noiDungJson FROM ttBai WHERE trangThai IN ('daDuyet','daGo') AND lich >= ? AND lich < ?")
    .bind(new Date(a).toISOString(), new Date(den).toISOString()).all()).results || [])
    .map(r => ({ id: r.id, lich: r.lich, b: JSON.parse(r.noiDungJson || '{}') })).filter(x => x.b.batBuocDoc);
  const doc = (await db.prepare('SELECT baiId, xacNhanLuc, diem FROM ttDoc WHERE uid = ?').bind(uid).all()).results || [];
  const dm = Object.fromEntries(doc.map(d => [d.baiId, d]));
  let dungHan = 0, diemTong = 0, soDiem = 0;
  batBuoc.forEach(x => {
    const d = dm[x.id];
    if (d && d.xacNhanLuc) {
      if (Date.parse(d.xacNhanLuc) <= Date.parse(x.lich) + x.b.hanNgay * 86400000) dungHan++;
      diemTong += Number(d.diem) || 0; soDiem++;
    }
  });
  const viet = (await db.prepare("SELECT COUNT(*) n FROM ttBai WHERE tacGiaUid = ? AND trangThai = 'daDuyet' AND lich >= ? AND lich < ?")
    .bind(uid, new Date(a).toISOString(), new Date(den).toISOString()).first()).n;
  const phan = [];
  if (batBuoc.length) {
    phan.push({ ma: 'xacNhan', giaTri: Math.round(100 * dungHan / batBuoc.length), trong: TRONG_SO_TT.xacNhan, ghiChu: dungHan + '/' + batBuoc.length + ' bài bắt buộc xác nhận đúng hạn' });
    phan.push({ ma: 'hieu', giaTri: soDiem ? Math.round(diemTong / soDiem) : 0, trong: TRONG_SO_TT.hieu, ghiChu: soDiem ? 'điểm hiểu trung bình ' + soDiem + ' bài' : 'chưa trả lời câu kiểm tra nào' });
  }
  phan.push({ ma: 'dongGop', giaTri: Math.round(100 * Math.min(1, viet / DONG_GOP_THANG)), trong: TRONG_SO_TT.dongGop, ghiChu: viet + '/' + DONG_GOP_THANG + ' bài đã phát hành trong kỳ' });
  const tr = phan.reduce((s, p) => s + p.trong, 0);
  const diem = Math.round(phan.reduce((s, p) => s + p.giaTri * p.trong, 0) / tr);
  return { diem, phan, soBatBuoc: batBuoc.length, soViet: viet };
}
export async function chiSoTT(y, env, db, hoSo) {
  if (!laNhanSu(hoSo)) return { ok: false, code: 'NOPERM', error: 'Bản tin nội bộ dành cho nhân sự.' };
  const ky = /^\d{4}-(0[1-9]|1[0-2])$/.test(S(y.ky)) ? S(y.ky) : ngayVN(Date.now()).slice(0, 7);
  const uid = await Kho.layUid(db, hoSo.u);
  const toi = await chiSoMotNguoi(db, uid, ky);
  const out = { ok: true, ky, toi, luat: { trongSo: TRONG_SO_TT, dongGopThang: DONG_GOP_THANG } };
  /* Quản lý (R01–R05) xem cả đội — để biết ai đang tụt nhịp, không để xếp hạng. */
  if (lvCua(hoSo) <= 5) {
    const ns = (await db.prepare("SELECT id, username, role FROM users WHERE active = 1 AND deletedAt IS NULL AND role IN ('R01','R02','R03','R04','R05','R06','R07','R08','R09','R10','R11','R12') ORDER BY username LIMIT 300").all()).results || [];
    out.doi = [];
    for (const n of ns) { const c = await chiSoMotNguoi(db, n.id, ky); out.doi.push({ u: n.username, role: n.role, diem: c.diem, phan: c.phan }); }
    out.doi.sort((p, q) => p.u.localeCompare(q.u));
  }
  return out;
}
