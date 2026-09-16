/* ═══════════════════════════════════════════════════════════════
   GITA 365 — PHÂN HỆ 1: VÙNG MẠNH, PHẦN CHẠY Ở MÁY CHỦ

   Bản chép của G.VM_* — bộ kiểm mục 79 đối chiếu từng ô với kho.

   ══ BA LẰN RANH LÀ BA CÁI CỔNG, KHÔNG PHẢI BA LỜI NHẮC ══

   Bản đặc tả viết ba lằn ranh đạo đức ở cuối phần III, và viết bằng
   giọng của một lời dặn. Dựng chúng thành lời dặn thì sáu tháng sau
   không còn ai nhớ, vì lời dặn không chặn được gì.

     LR1  không xếp hạng trẻ  → KHÔNG CÓ cửa nào trả nhiều thẻ cùng lúc
     LR2  không kết luận sớm  → quá 90 ngày thì cửa đọc NÓI THẲNG
     LR3  không bán bằng Thẻ  → ô lạ bị CHẶN, không lặng lẽ bỏ qua

   ══ VÀ MỘT CỔNG NỮA, TỪ CHÍNH CÂU MỞ ĐẦU CỦA PHÂN HỆ ══

   "Không có một gen nào gọi là gen thiên tài." Người viết bài về vùng
   mạnh là người đứng GẦN lời hứa gen nhất — cái tên ấy bán chạy và nó
   nằm ngay cạnh thứ GITA làm thật. Nên bộ dò cắm ở đây.
   ═══════════════════════════════════════════════════════════════ */

import { Kho } from './nen.js';
import * as BoNao from './bo-nao.js';
import * as PhapLy from './phap-ly-rui-ro.js';

/* ═══════════════ BẢN CHÉP CỦA KHO ═══════════════ */

export const BA = ['HOC_NHANH', 'QUEN_GIO', 'CHIU_KHO'];

export const TRUONG = [
  [1, 'T1', 'Học nhanh'], [2, 'T2', 'Quên giờ'], [3, 'T3', 'Chịu khó'],
  [4, 'T4', 'Cửa tiếp nhận'], [5, 'T5', 'Nguồn năng lượng'],
  [6, 'T6', 'Động lực gốc'], [7, 'T7', 'Ngưỡng sợ']
];

export const DONG_THE = ['D1', 'D2', 'D3', 'D4', 'D5'];
export const HAN_NGAY = 90;

export const LANRANH = ['LR1', 'LR2', 'LR3'];

export const CAM_NOI = ['gen thiên tài', 'đánh thức gen', 'kích hoạt gen',
  'mở khoá gen', 'gen trội', 'bộ gen thiên tài', 'chỉ số thiên tài',
  'test hướng nghiệp'];

/* Ô nào KHÔNG được có mặt trên một tấm thẻ. Danh sách trắng thì chặt
   hơn — nhưng ô lạ ở đây không phải một ô thừa vô hại, nó là một ô
   người ta CỐ Ý thêm vào, nên nêu tên từng cái để câu chặn nói được
   vì sao. */
export const O_CAM = ['diem', 'diemSo', 'hang', 'xepHang', 'thuHang', 'gia',
  'giaGoi', 'goi', 'tangBan', 'nhan', 'nhanDan', 'soSanh', 'manh', 'mucManh'];

function duocVaoVM(hoSo) {
  return /^R(0[1-5])$/.test(String((hoSo || {}).role || ''));
}

/* ═══════════════ LR3 · KHÔNG BÁN BẰNG THẺ ═══════════════ */
export function soatOLa(d) {
  const o = d || {};
  return Object.keys(o).filter(k => O_CAM.indexOf(k) >= 0);
}

/* ═══════════════ CÂU MỞ ĐẦU CÓ RĂNG · LỜI HỨA VỀ GEN ═══════════════

   Dò chuỗi con, KHÔNG dò biên âm tiết. Ngược với luật thường của kho,
   và có lý do: mọi cụm ở đây đều từ hai âm tiết trở lên và không cụm
   nào nằm lọt trong một từ vô hại. "gen thiên tài" không có cách nào
   xuất hiện tình cờ.

   Dò biên âm tiết ở đây lại hở: người viết gõ "gen-thiên-tài" hoặc
   "gen  thiên tài" hai dấu cách thì biên không khớp, mà ý thì y hệt. */
export function soatHuaGen(chu) {
  const t = String(chu || '').toLowerCase().replace(/[-–—]/g, ' ').replace(/\s+/g, ' ');
  const pham = CAM_NOI.filter(c => t.indexOf(c) >= 0);
  return {
    sach: pham.length === 0, pham,
    vi: pham.length
      ? 'Câu này hứa về GEN. Không có một gen nào gọi là gen thiên tài, và không ' +
        'khoá học nào đánh thức được gen — nói vậy với phụ huynh là nói dối, và ' +
        'phạm cùng lúc Điều 1, Điều 10, Điều 13. Nói thứ THẬT, vì thứ thật còn ' +
        'mạnh hơn: mỗi đứa trẻ có một tổ hợp riêng gồm ba thứ QUAN SÁT ĐƯỢC, và ' +
        'chỗ ba thứ chồng lên nhau là vùng mạnh.'
      : 'Không thấy lời hứa về gen.'
  };
}

/* ═══════════════ LR2 · HẠN CHÍN MƯƠI NGÀY ═══════════════

   TÍNH lúc đọc, không giữ một cột `conHan` trong bảng. Một cột như thế
   phải có ai đó chạy cập nhật, và ngày không ai chạy thì nó nói dối
   theo đúng hướng nguy hiểm nhất: thẻ quá hạn vẫn khai là còn hạn. */
export function doHan(lapLuc, bayGio) {
  const lap = new Date(lapLuc).getTime();
  const nay = (bayGio ? new Date(bayGio) : new Date()).getTime();
  const ngay = Math.floor((nay - lap) / 86400000);
  return { ngayTuoi: ngay, conHan: ngay <= HAN_NGAY, conLai: HAN_NGAY - ngay };
}

/* ═══════════════ LẬP THẺ ═══════════════ */
export async function lapTheVungManh(y, env, db, hoSo) {
  if (!duocVaoVM(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Cổng Thẻ Vùng Mạnh mở cho R01–R05.' };

  const d = (y || {}).the || {};
  const maNha = String(y.maNha || '').trim();
  if (!maNha) return { ok: false, error: 'Thiếu mã gia đình.' };

  /* ── LUẬT 91 · VIỆC SỐ 3 ──
     Dữ liệu trẻ em được bảo vệ ĐẶC BIỆT, nên tấm thẻ này không mở
     trước khi cha mẹ có một dòng đồng ý RIÊNG — không phải một ô gộp
     trong điều khoản chung. Đây là một trong hai cửa duy nhất tạo ra
     một hồ sơ về con, nên cổng phải nằm ở đây: không có nó thì việc
     số 3 là một dòng chữ trong một bảng bảy dòng. */
  const dy = await PhapLy.soatDongYCon(maNha, db);
  if (!dy.duoc) return { ok: false, code: dy.code, error: dy.error };

  /* ── LR3 CHẶN TRƯỚC MỌI THỨ ──
     Chặn chứ không lặng lẽ bỏ qua: bỏ qua thì người gửi tưởng ô ấy đã
     được ghi, và lần sau gửi lại. Và một ô giá nằm trên tờ giấy nói về
     nỗi sợ của con họ là lời mời mua đặt đúng chỗ không được đặt. */
  const oLa = soatOLa(d);
  if (oLa.length) return { ok: false, code: 'OCAM', oLa,
    error: 'Thẻ Vùng Mạnh KHÔNG mang ô: ' + oLa.join(' · ') + '. Lằn ranh thứ ba ' +
      'của phân hệ: không dùng Thẻ để bán hàng, và không có điểm số thì không có ' +
      'thứ hạng. Một ô giá nằm trên tờ giấy nói về nỗi sợ của con họ là lời mời ' +
      'mua đặt đúng chỗ không được đặt.' };

  /* Năm dòng, đủ cả năm. Thiếu một dòng thì tấm thẻ ấy không phải Thẻ
     Vùng Mạnh — nó là một tờ ghi chép dở, và giao cho gia đình một tờ
     dở thì họ đọc phần thiếu thành phần không có. */
  const thieu = DONG_THE.filter(k => String(d[k.toLowerCase()] || '').trim().length < 5);
  if (thieu.length) return { ok: false, code: 'THIEUDONG', thieu,
    error: 'Thiếu dòng: ' + thieu.join(' · ') + '. Thẻ Vùng Mạnh có ĐÚNG NĂM DÒNG, ' +
      'và thiếu một dòng thì nó không phải một tấm thẻ — nó là một tờ ghi chép dở.' };

  /* ── ĐIỀU 13 · THẺ LÀ THỨ NHẠY NHẤT TRONG HỆ ──
     Dòng D4 giữ nỗi sợ của một đứa trẻ, ghi nguyên văn lời nó nói.
     Một cái tên lọt vào đây rồi tấm thẻ đi ra ngoài thì thứ rò ra
     không phải một dòng dữ liệu — nó là chỗ riêng tư nhất của một đứa
     trẻ, gắn với tên nó. */
  const caThe = DONG_THE.map(k => d[k.toLowerCase()] || '').join(' \n ');
  const ra = BoNao.soatRaNgoai(caThe);
  if (!ra.sach) return { ok: false, code: 'CHUAANDANH', ngo: ra.ngo,
    error: 'Ngờ có dữ liệu NHẬN DẠNG ĐƯỢC trong thẻ: ' +
      ra.ngo.map(n => n.ma + ' (' + n.thay + ')').join(' · ') + '. Thẻ này giữ nỗi ' +
      'sợ của một đứa trẻ — đây là chỗ riêng tư nhất trong cả hệ. Viết bằng lời ' +
      'quan sát, không bằng tên: "con rụt lại khi phải đứng trước lớp", không phải ' +
      'tên bạn hay tên cô giáo.' };

  /* ── CÂU MỞ ĐẦU CÓ RĂNG ── */
  const gen = soatHuaGen(caThe);
  if (!gen.sach) return { ok: false, code: 'HUAGEN', pham: gen.pham,
    error: 'Thẻ đang hứa về GEN: ' + gen.pham.join(' · ') + '. ' + gen.vi };

  const cu = await db.prepare(
    'SELECT id, lan FROM theVungManh WHERE maNha = ? ORDER BY lapLuc DESC, rowid DESC LIMIT 1')
    .bind(maNha).first();
  const lan = cu ? Number(cu.lan) + 1 : 1;
  const id = 'VM-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  const luc = new Date().toISOString();

  await db.prepare(
    'INSERT INTO theVungManh (id,maNha,tuoiCon,lan,theTruoc,d1,d2,d3,d4,d5,' +
    'quanSat,lapBoiAi,lapLuc) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)'
  ).bind(id, maNha, Number(y.tuoiCon) || null, lan, cu ? cu.id : null,
    String(d.d1).trim(), String(d.d2).trim(), String(d.d3).trim(),
    String(d.d4).trim(), String(d.d5).trim(),
    y.quanSat ? JSON.stringify(y.quanSat) : null, hoSo.u, luc).run();

  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'VM_LAPTHE',
    doiTuong: id, chiTiet: maNha + ' · thẻ lần ' + lan });

  return { ok: true, id, maNha, lan, theTruoc: cu ? cu.id : undefined,
    hanNgay: HAN_NGAY,
    /* Bản cũ Ở LẠI. Chuỗi thẻ theo thời gian chính là thứ cho thấy đứa
       trẻ đã đổi — mà "trẻ đổi rất nhanh" là lý do lằn ranh thứ hai
       tồn tại. Ghi đè là xoá đúng bằng chứng ấy. */
    vi: 'Thẻ lần ' + lan + '. Bản cũ Ở LẠI NGUYÊN — chuỗi thẻ theo thời gian chính ' +
      'là thứ cho thấy đứa trẻ đã đổi. Hạn ' + HAN_NGAY + ' ngày, và hạn có răng: ' +
      'quá hạn thì cửa đọc nói thẳng chứ không trả về như thẻ còn hiệu lực.',
    chuThich: 'Đây là ảnh chụp của một giai đoạn, không phải kết luận về con. ' +
      'Hẹn xem lại sau 90 ngày.' };
}

/* ═══════════════ ĐỌC MỘT THẺ — VÀ HẠN CÓ RĂNG ═══════════════

   Đọc ĐÚNG MỘT nhà. Không có tham số nào nhận nhiều nhà, và không có
   cửa nào trả về một danh sách thẻ để so — lằn ranh thứ nhất. */
export async function docTheVungManh(y, env, db, hoSo) {
  if (!duocVaoVM(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Cổng Thẻ Vùng Mạnh mở cho R01–R05.' };

  const maNha = String((y || {}).maNha || '').trim();
  if (!maNha) return { ok: false, error: 'Thiếu mã gia đình.' };

  const t = await db.prepare(
    'SELECT * FROM theVungManh WHERE maNha = ? ORDER BY lapLuc DESC, rowid DESC LIMIT 1')
    .bind(maNha).first();
  if (!t) return { ok: false, code: 'CHUACO',
    error: 'Nhà này chưa có Thẻ Vùng Mạnh. Thẻ lập sau bốn tuần quan sát, không ' +
      'lập trước — bốn tuần ấy chính là phần làm nên tấm thẻ.' };

  /* ── RÚT ĐỒNG Ý CHẶN CẢ ĐỌC, KHÔNG CHỈ GHI (9.99.112) ──
     Bản đầu chỉ chặn TẠO thẻ khi chưa/đã-rút đồng ý; cửa ĐỌC vẫn trả D4
     (nỗi sợ nguyên văn của trẻ) sau khi cha mẹ đã RÚT. Đọc thẻ để dùng
     lại LÀ xử lý tiếp, mà rút đồng ý (Luật 91) là chặn xử lý tiếp — nên
     cửa đọc phải dừng phục vụ nội dung, không chỉ cửa ghi. Ghi lại lượt
     bị chặn để truy trách nhiệm. (Nếu chủ hệ/luật sư chốt cho staff đọc
     để xử tranh chấp thì đó là ngoại lệ hẹp thêm sau — mặc định an toàn
     là DỪNG.) */
  const dyDoc = await PhapLy.soatDongYCon(maNha, db);
  if (!dyDoc.duoc) {
    await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'VM_DOCTHE_CHAN',
      doiTuong: maNha, chiTiet: dyDoc.code });
    return { ok: false, code: dyDoc.code,
      error: 'Nhà này ' + (dyDoc.code === 'DARUT' ? 'đã RÚT đồng ý' : 'chưa có đồng ý') +
        ' cho dữ liệu về con — không phục vụ nội dung thẻ nữa. Rút đồng ý là chặn XỬ ' +
        'LÝ TIẾP theo Luật 91, và đọc thẻ để dùng lại chính là xử lý tiếp.' };
  }

  /* ── LUẬT 91 · VIỆC SỐ 6 ──
     Nhật ký phải ghi ai TRUY CẬP dữ liệu gia đình nào, lúc nào — chứ
     không chỉ ai SỬA. Tới 9.99.69 sổ audit của kho này chỉ ghi lượt
     GHI, nên câu hỏi "ai đã đọc hồ sơ con nhà ấy" không trả lời được.
     Một sự thật CÓ mà không đọc ra được thì trên thực tế là KHÔNG CÓ. */
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'VM_DOCTHE',
    doiTuong: maNha, chiTiet: 'đọc thẻ lần ' + Number(t.lan) });

  const han = doHan(t.lapLuc, (y || {}).bayGio);

  /* ── LR2 CÓ RĂNG ──
     Quá hạn thì NÓI THẲNG và trả về `conHan:false` ở mức cao nhất của
     kết quả, không giấu trong một ô phụ. Trả về như một tấm thẻ còn
     hiệu lực rồi thêm một dòng nhắc nhỏ là để người đọc lướt qua dòng
     nhắc — và họ sẽ lướt qua, vì tấm thẻ trông vẫn y hệt. */
  return { ok: true, id: t.id, maNha: t.maNha, lan: Number(t.lan),
    tuoiCon: t.tuoiCon || undefined,
    conHan: han.conHan, ngayTuoi: han.ngayTuoi,
    conLai: han.conHan ? han.conLai : undefined,
    quaHanNgay: han.conHan ? undefined : -han.conLai,
    the: han.conHan
      ? { d1: t.d1, d2: t.d2, d3: t.d3, d4: t.d4, d5: t.d5 }
      /* Quá hạn thì KHÔNG trả về năm dòng. Đọc được năm dòng thì người
         ta dùng nó, dù có một dòng chữ đỏ bên trên. Lằn ranh thứ hai
         không phải một lời nhắc — nó là một cánh cửa. */
      : undefined,
    chuThich: 'Đây là ảnh chụp của một giai đoạn, không phải kết luận về con. ' +
      'Hẹn xem lại sau 90 ngày.',
    vi: han.conHan
      ? 'Thẻ lần ' + t.lan + ', lập ' + han.ngayTuoi + ' ngày trước, còn ' +
        han.conLai + ' ngày.'
      : 'THẺ ĐÃ QUÁ HẠN ' + (-han.conLai) + ' NGÀY — và máy không trả về năm dòng ' +
        'nữa. Trẻ đổi rất nhanh; một tấm thẻ quá hạn đọc được là một cái nhãn cũ ' +
        'dán lên một đứa trẻ đã khác. Lập thẻ mới sau bốn tuần quan sát lại.' };
}

/* ═══════════════ THẺ → LỘ TRÌNH ═══════════════
   Máy ĐỀ NGHỊ, người chốt. Lộ trình của một đứa trẻ thật thì không ai
   ký thay được — cùng luật với bảng loại hình của trợ lý hình ảnh. */
export const DOI = [
  ['T4', 'lam', 'Mọi bài tập đổi sang dạng làm bằng tay, cắt bớt phần đọc.'],
  ['T5', 'motMinh', 'Bỏ phần hoạt động nhóm ở giai đoạn đầu, thêm vào từ tầng Dựng xây.'],
  ['T6', 'giupNguoi', 'Dự án tầng 4 chuyển sang việc phục vụ người thật.'],
  ['T7', 'soBiCuoi', 'Toàn bộ giai đoạn đầu diễn ra TRONG NHÀ, không công khai.']
];

export function deNghiLoTrinh(quanSat) {
  const q = quanSat || {};
  const doi = DOI.filter(([t, v]) => String(q[t] || '') === v)
    .map(([t, v, lam]) => ({ truong: t, giaTri: v, doi: lam }));
  return {
    doi,
    /* Không có trường nào khớp thì NÓI LÀ KHÔNG BIẾT, không rơi về một
       lộ trình mặc định. Một lộ trình mặc định trình ra như một đề nghị
       cá nhân hoá là nói dối về chỗ tốn công nhất của cả chương trình. */
    vi: doi.length
      ? 'Máy ĐỀ NGHỊ ' + doi.length + ' chỗ đổi, người chốt. Cùng một khoá ba mươi ' +
        'phần, nhưng thứ tự, ví dụ và bài tập đổi theo Thẻ — đây là chỗ cá nhân ' +
        'hoá thật sự xảy ra.'
      : 'Bảy trường quan sát chưa khớp chỗ đổi nào đã khai. Máy KHÔNG rơi về một ' +
        'lộ trình mặc định rồi gọi nó là cá nhân hoá — đó là nói dối về chỗ tốn ' +
        'công nhất của cả chương trình.'
  };
}

export async function loTrinhTuThe(y, env, db, hoSo) {
  if (!duocVaoVM(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Cổng Thẻ Vùng Mạnh mở cho R01–R05.' };
  const t = await db.prepare(
    'SELECT quanSat, lapLuc FROM theVungManh WHERE maNha = ? ORDER BY lapLuc DESC, rowid DESC LIMIT 1')
    .bind(String((y || {}).maNha || '')).first();
  if (!t) return { ok: false, code: 'CHUACO', error: 'Nhà này chưa có Thẻ Vùng Mạnh.' };

  /* Thẻ quá hạn thì KHÔNG dựng lộ trình từ nó. Dựng lộ trình 365 ngày
     trên một quan sát đã cũ là kéo dài cái nhãn cũ thêm một năm. */
  const han = doHan(t.lapLuc, (y || {}).bayGio);
  if (!han.conHan) return { ok: false, code: 'THEQUAHAN',
    quaHanNgay: -han.conLai,
    error: 'Thẻ đã quá hạn ' + (-han.conLai) + ' ngày, nên máy KHÔNG dựng lộ trình ' +
      'từ nó. Dựng lộ trình ba trăm sáu mươi lăm ngày trên một quan sát đã cũ là ' +
      'kéo dài cái nhãn cũ thêm một năm.' };

  let q = {};
  try { q = JSON.parse(t.quanSat || '{}'); } catch (e) { q = {}; }
  return { ok: true, ...deNghiLoTrinh(q) };
}

/* ═══════════════ SOI MỘT ĐOẠN CHỮ CỦA PHÂN HỆ NÀY ═══════════════ */
export async function soatVungManh(y, env, db, hoSo) {
  if (!duocVaoVM(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Cổng Thẻ Vùng Mạnh mở cho R01–R05.' };
  const chu = String((y || {}).chu || '').trim();
  if (chu.length < 10) return { ok: false, error: 'Dưới mười chữ thì chưa đủ để soi.' };
  const gen = soatHuaGen(chu);
  const ra = BoNao.soatRaNgoai(chu);
  return { ok: true, gen, anDanh: ra,
    dat: gen.sach && ra.sach };
}
