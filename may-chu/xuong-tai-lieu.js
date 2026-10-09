/* ═══════════════════════════════════════════════════════════════
   GITA 365 — XƯỞNG TÀI LIỆU GIA ĐÌNH  (9/10/2026)

   Chủ hệ: "tích hợp năng lực ainovel-cli để tạo kho tài liệu cho các gia
   đình". ainovel-cli (github.com/kentjuno/ainovel-cli, Apache-2.0) là một
   chương trình Go chạy trong cửa sổ dòng lệnh, viết tiểu thuyết dài bằng
   nhiều tác nhân AI. Nó không chạy được trong Worker, và chủ hệ không dùng
   dòng lệnh — nên ở đây không chép mã của nó. Ở đây dựng lại TINH TUÝ của
   nó bằng JS, trên đúng đường AI và đúng cổng mà GITA đã có:

     ainovel-cli                    GITA (tệp này)
     ─────────────────────────────  ──────────────────────────────────────
     Architect: tiền đề, dàn ý,     Kiến trúc sư: dàn ý từng chương + SỔ
       hồ sơ nhân vật, luật thế giới   NHẤT QUÁN (thuật ngữ, nguyên tắc)
     Writer: viết từng chương       Người viết: một chương mỗi lượt, đọc
                                       dàn ý + sổ nhất quán + tóm tắt chương
                                       trước (nén ngữ cảnh, không gửi lại
                                       cả văn bản)
     Editor: chấm 7 chiều           Biên tập: MÁY ĐO, không nhờ AI tự chấm
     Arbiter: viết lại hay đi tiếp  Trọng tài: luật cứng — sai thì viết lại
                                       kèm lời góp ý cụ thể, tối đa 2 lần
     Checkpoint từng bước           Mỗi lượt gọi đúng MỘT bước, trạng thái
                                       ghi D1 — sập giữa chừng thì lượt sau
                                       đi tiếp đúng chỗ dừng
     Xuất EPUB                      Đóng gói → bản nháp chờ BA CHỮ KÝ

   ══ VÌ SAO BIÊN TẬP LÀ MÁY ĐO, KHÔNG PHẢI MỘT AI CHẤM ĐIỂM ══
   Một mô hình chấm "chiều sâu 8/10" thì không ai truy được vì sao 8, và
   lượt sau cùng bài có thể ra 6 — luật của kiến trúc sư nội dung đã ghi
   đúng chỗ này. Nên Biên tập dùng các phép đo có sẵn ở kien-truc-noi-dung
   (câu rỗng, giọng máy, lời phán, tự xưng chuyên gia, câu dài) và cổng ẩn
   danh soatRaNgoai. Phần máy không đo được — có đúng, có hay, có hợp nhà
   này không — là việc của ba người ký.

   ══ CHIỀU THỨ SÁU CỦA AINOVEL ĐỔI NGƯỢC ══
   ainovel chấm "móc câu giữ chân người đọc cuối chương". Tài liệu gia đình
   KHÔNG giữ chân (L08 · điều 9 bất khả sửa). Chiều ấy đổi thành "việc nhà
   mình làm được": mỗi chương phải kết bằng một việc làm thử được ngay.

   ══ BA LUẬT KHÔNG ĐỔI ══
   1. Không tự đưa ra phục vụ khách. Đóng gói chỉ gọi soanBanNhap (chuỗi
      'kho': Sản phẩm → Giám đốc → Super Admin). Tài liệu tới gia đình chỉ
      khi đủ ba chữ ký — đúng luật của bộ não vận hành.
   2. Không dữ liệu người. Đề bài phải sạch trước khi nhận; mỗi chương phải
      sạch trước khi nhận (cổng ẩn danh), và người viết được dặn không dùng
      tên riêng. Không đưa nội dung kho ra ngoài (C11) — đề bài chỉ gồm
      lời chủ hệ gõ và chính các chương xưởng vừa viết.
   3. Không tốn tiền ngầm. Mọi lượt gọi qua goiTheoLoai của bộ não đa trí:
      chế độ tiết kiệm thì chỉ Workers AI miễn phí, có trần tải. Mỗi đề án
      có trần số lượt; chạm trần thì dừng và nói ra.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

import { Kho } from './nen.js';
import { BAC, laR01, tenNguoiDung as ten } from './vai-tro.js';
import { goiTheoLoai } from './bo-nao-da-tri.js';
import { soatRaNgoai } from './bo-nao.js';
import { soatRong, soatNgonAI, soatLoiNoi, soatChuyenGia, soatCauDai } from './kien-truc-noi-dung.js';
import { ghiPhatSinh, soanBanNhap } from './tu-hoan-thien.js';

export const DOI_TUONG = {
  phuHuynh: 'cha mẹ',
  con6_10: 'con 6–10 tuổi (đọc cùng cha mẹ)',
  con11_14: 'con 11–14 tuổi',
  con15_18: 'con 15–18 tuổi',
  caNha: 'cả nhà cùng đọc',
  coach: 'Coach đồng hành gia đình',
  tuVan: 'tư vấn viên',
  chuyenGia: 'chuyên gia (Coach cao cấp, hội đồng chuyên môn)'
};

/* BA LOẠI ĐỀ ÁN — ba kho, và loại nào đi đúng CHUỖI KÝ của nó.
   Kho của gia đình (tài liệu, phiếu tài nguyên) đi chuỗi 'kho' (Sản phẩm →
   Giám đốc → Super Admin) và chỉ chuỗi ấy được cửa traBoSung phục vụ cho
   khách. Cẩm nang đội ngũ là nội dung NGHỀ: đi chuỗi 'camNang' (Coach cao
   nhất → Giám đốc → Super Admin), nên dù đã nhập kho cũng không bao giờ lọt
   ra màn của khách — cổng ấy nằm ở traBoSung, không nằm ở màn hình. */
const NHA = ['phuHuynh', 'con6_10', 'con11_14', 'con15_18', 'caNha'];
export const LOAI_DE_AN = {
  giaDinh:   { ten: 'Tài liệu gia đình', tenKho: 'TAILIEU_GIA_DINH', loaiDuyet: 'kho', doiTuong: NHA,
               mucCuoi: 'Việc nhà mình làm được' },
  taiNguyen: { ten: 'Phiếu tài nguyên', tenKho: 'TAINGUYEN_GIA_DINH', loaiDuyet: 'kho', doiTuong: NHA,
               mucCuoi: 'Cách dùng phiếu này' },
  doiNgu:    { ten: 'Cẩm nang đội ngũ', tenKho: 'CAMNANG_DOI_NGU', loaiDuyet: 'camNang', doiTuong: ['coach', 'tuVan', 'chuyenGia'],
               mucCuoi: 'Điều không làm' }
};
const loaiCua = d => LOAI_DE_AN[(d && d.loai) || 'giaDinh'] || LOAI_DE_AN.giaDinh;
export const TANG = ['T1', 'T2', 'T3', 'T4', 'T5'];
export const SO_CHUONG = { it: 3, nhieu: 8 };
export const LAN_VIET_TOI_DA = 3;          /* lần đầu + 2 lần viết lại */
export const TEN_KHO = 'TAILIEU_GIA_DINH';
export const DAI = { it: 600, nhieu: 9000 }; /* ký tự mỗi chương */
const DANG_CHAY = ['kienTruc', 'viet', 'dongGoi'];
const TRAN_LUOT = so => 3 + so * LAN_VIET_TOI_DA;   /* trần lượt AI của một đề án */

/* Ai được đặt và chạy xưởng: R01–R04 (Bộ phận sản phẩm là cấp ký đầu của
   chuỗi 'kho'). Người đặt đề án không ký thay được — soanBanNhap ghi người
   soạn, duyetCap chặn người soạn tự ký. */
const duocDung = hoSo => (BAC[String((hoSo || {}).role || '')] || 99) <= 4;

/* Người SOẠN bản nháp là chính xưởng (AI viết), không phải người bấm nút.
   Nếu ghi tên người bấm, Super Admin bấm bước đóng gói thì thành "người
   soạn" và không còn ký được cấp Super Admin — chuỗi ba chữ ký kẹt vĩnh
   viễn khi Học viện chỉ có một Super Admin. Ghi đúng tác giả thì cả ba
   người ký đều là người, và đều khác người soạn. */
export const MAY_SOAN = Object.freeze({ role: 'R01', u: 'xuong-tai-lieu', uid: 'xuong-tai-lieu' });

let daDung = false;
async function taoBang(db) {
  if (daDung) return;
  await db.prepare('CREATE TABLE IF NOT EXISTS deAnTaiLieu (id TEXT PRIMARY KEY, chuDe TEXT NOT NULL, ' +
    'doiTuong TEXT NOT NULL, tang TEXT NOT NULL, soChuong INTEGER NOT NULL, dieuNho TEXT, ' +
    "loai TEXT NOT NULL DEFAULT 'giaDinh', trangThai TEXT NOT NULL DEFAULT 'kienTruc', dangChuong INTEGER NOT NULL DEFAULT 0, " +
    "danY TEXT, chuong TEXT NOT NULL DEFAULT '[]', phatSinhId TEXT, banNhapId TEXT, tuChay INTEGER NOT NULL DEFAULT 0, " +
    'soLuot INTEGER NOT NULL DEFAULT 0, loiCuoi TEXT, nccCuoi TEXT, taoBoi TEXT, taoLuc TEXT, suaLuc TEXT)').run();
  daDung = true;
}

function moi(s, n) { return String(s || '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, n); }

/* ═══════════════ CỬA: ĐẶT MỘT ĐỀ ÁN ═══════════════ */
export async function lapDeAnTaiLieu(y, env, db, hoSo) {
  if (!duocDung(hoSo)) return { ok: false, code: 'NOPERM', error: 'Xưởng tài liệu mở cho Super Admin, Admin, Giám đốc và Bộ phận sản phẩm.' };
  const x = y || {};
  const chuDe = moi(x.chuDe, 200), dieuNho = moi(x.dieuNho, 200);
  const doiTuong = String(x.doiTuong || ''), tang = String(x.tang || '');
  const soChuong = Math.round(Number(x.soChuong));
  const loai = String(x.loai || 'giaDinh'), L = LOAI_DE_AN[loai];
  if (!L) return { ok: false, code: 'SAI', error: 'Loại đề án không hợp lệ.' };
  if (chuDe.length < 8) return { ok: false, code: 'SAI', error: 'Chủ đề cần ít nhất 8 ký tự — nói rõ tài liệu giúp nhà nào làm được việc gì.' };
  if (!DOI_TUONG[doiTuong] || L.doiTuong.indexOf(doiTuong) < 0)
    return { ok: false, code: 'SAI', error: 'Người đọc không hợp với loại "' + L.ten + '".' };
  if (TANG.indexOf(tang) < 0) return { ok: false, code: 'SAI', error: 'Chọn tầng T1–T5.' };
  if (!(soChuong >= SO_CHUONG.it && soChuong <= SO_CHUONG.nhieu))
    return { ok: false, code: 'SAI', error: 'Số chương từ ' + SO_CHUONG.it + ' đến ' + SO_CHUONG.nhieu + '.' };
  /* Đề bài sẽ đi tới bộ viết AI — soát trước khi nhận, không đợi tới lượt gọi. */
  const ra = soatRaNgoai(chuDe + '\n' + dieuNho);
  if (!ra.sach) return { ok: false, code: 'DULIEUNGUOI', ngo: ra.ngo, error: ra.vi };
  await taoBang(db);
  const id = 'TL-' + crypto.randomUUID().slice(0, 8).toUpperCase();
  /* Mỗi bản nháp phải trỏ vào một PHÁT SINH (luật của vòng tự hoàn thiện:
     không có phát sinh thì không biết bản nháp lấp lỗ nào). Đề án chính là
     một lỗ của kho tài liệu — ghi nó vào sổ ngay lúc đặt. */
  const ps = await ghiPhatSinh({ loai: 'khoRong', kho: L.tenKho, cauHoi: chuDe,
    chiTiet: 'Xưởng tài liệu ' + id + ': kho "' + L.ten + '" chưa có chủ đề này (' + tang + ' · ' + DOI_TUONG[doiTuong] + ').' }, env, db, hoSo);
  if (!ps || !ps.ok) return { ok: false, code: (ps && ps.code) || 'PHATSINH', error: (ps && ps.error) || 'Không ghi được phát sinh.' };
  const luc = new Date().toISOString();
  await db.prepare('INSERT INTO deAnTaiLieu (id, chuDe, doiTuong, tang, soChuong, dieuNho, loai, phatSinhId, tuChay, taoBoi, taoLuc, suaLuc) ' +
    'VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind(id, chuDe, doiTuong, tang, soChuong, dieuNho, loai, ps.id, x.tuChay === true ? 1 : 0, ten(hoSo), luc, luc).run();
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'XTL_LAP', doiTuong: id,
    chiTiet: loai + ' · ' + tang + ' · ' + doiTuong + ' · ' + soChuong + ' chương' + (x.tuChay === true ? ' · tự chạy' : '') });
  return { ok: true, id, loai, trangThai: 'kienTruc', tuChay: x.tuChay === true, tranLuot: TRAN_LUOT(soChuong) };
}

/* ═══════════════ LỜI DẶN CHO TỪNG VAI ═══════════════ */
function boiCanh(d) {
  const l = (d && d.loai) || 'giaDinh';
  const dau = l === 'doiNgu'
    ? 'Cẩm nang nghề cho ' + DOI_TUONG[d.doiTuong] + ' của Học viện GITA, dùng khi đồng hành gia đình ở tầng ' + d.tang + '. '
    : l === 'taiNguyen'
      ? 'Phiếu thực hành cho ' + DOI_TUONG[d.doiTuong] + ', gia đình ở tầng ' + d.tang + ' của hành trình GITA365. '
      : 'Tài liệu cho ' + DOI_TUONG[d.doiTuong] + ', gia đình ở tầng ' + d.tang + ' của hành trình GITA365. ';
  return dau + 'Chủ đề: ' + d.chuDe + '.' + (d.dieuNho ? ' Đọc xong, người đọc làm được: ' + d.dieuNho + '.' : '');
}
const KHUON_KIEN_TRUC = 'Bạn là kiến trúc sư tài liệu của Học viện GITA (giáo dục gia đình). KHÔNG dùng tên riêng người thật hay hư cấu ' +
  '(viết "người mẹ", "cậu con trai 9 tuổi"). Không hứa kết quả, không chẩn đoán. Trả về ĐÚNG dạng:\n' +
  'SỔ NHẤT QUÁN:\n- (3 đến 6 dòng: thuật ngữ dùng thống nhất và nguyên tắc xuyên suốt)\n' +
  '## Chương 1: <tiêu đề>\n- Ý chính: <một câu>\n- Việc làm được: <một việc làm thử được trong tuần>\n' +
  '(lặp lại cho đủ số chương)';
const KHUON_VIET = 'Bạn là người viết tài liệu giáo dục gia đình, tiếng Việt, câu ngắn, ấm, cụ thể. ' +
  'KHÔNG dùng tên riêng người (viết "người mẹ", "cô con gái 12 tuổi"). Không hứa kết quả, không chẩn đoán y tế, ' +
  'không tự xưng chuyên gia, không bịa số liệu hay nguồn. Giữ đúng thuật ngữ trong SỔ NHẤT QUÁN. ' +
  'Chỉ viết đúng chương được giao: mở bằng một tình huống đời thường, giải thích vì sao, rồi các bước. ' +
  'Kết bằng mục "Việc nhà mình làm được tuần này:" với 1 đến 3 gạch đầu dòng.';
const KHUON_PHIEU = 'Bạn soạn PHIẾU THỰC HÀNH cho gia đình, tiếng Việt, câu ngắn, cụ thể. KHÔNG dùng tên riêng người. ' +
  'Không hứa kết quả, không chẩn đoán. Giữ đúng thuật ngữ trong SỔ NHẤT QUÁN. Chương được giao là MỘT phiếu, có đủ: ' +
  '"Mục tiêu:", "Chuẩn bị:", "Các bước:" (đánh số), "Bảng ghi:" (các cột để cả nhà điền trong 7 ngày), ' +
  'và kết bằng mục "Cách dùng phiếu này:" với 1 đến 3 gạch đầu dòng.';
const KHUON_CAMNANG = 'Bạn soạn CẨM NANG NGHỀ cho đội ngũ Học viện GITA (coach, tư vấn, chuyên gia), tiếng Việt, câu ngắn. ' +
  'KHÔNG dùng tên khách thật hay hư cấu. Không chẩn đoán y tế hay tâm lý; khi có dấu hiệu nặng thì ghi rõ phải chuyển ' +
  'Hội đồng chuyên môn. Không hứa kết quả. Giữ đúng thuật ngữ trong SỔ NHẤT QUÁN. Chương được giao có đủ: "Tình huống:", ' +
  '"Dấu hiệu nhận biết:", "Các bước xử lý:" (đánh số), "Câu nói mẫu:", và kết bằng mục "Điều không làm:" với 1 đến 3 gạch đầu dòng.';
const KHUON_THEO_LOAI = { giaDinh: KHUON_VIET, taiNguyen: KHUON_PHIEU, doiNgu: KHUON_CAMNANG };

/* Dàn ý trả về dạng chữ, không dạng JSON: mô hình nhỏ hay hỏng ngoặc, còn
   dòng "## Chương N:" thì gần như không hỏng. Đọc lỏng, kiểm chặt số chương. */
export function docDanY(txt, soChuong) {
  const t = String(txt || '');
  const so = (t.split(/##\s*Chương/i)[0].split(/SỔ NHẤT QUÁN\s*:?/i)[1] || '')
    .split('\n').map(s => s.replace(/^[\s\-•*]+/, '').trim()).filter(Boolean).slice(0, 8);
  const chuong = [];
  const re = /##\s*Chương\s*(\d+)\s*[:.\-–]\s*(.+)\n([\s\S]*?)(?=\n##\s*Chương|\s*$)/gi;
  let m;
  while ((m = re.exec(t)) && chuong.length < soChuong) {
    const than = m[3] || '';
    const y = (than.match(/Ý chính\s*:\s*(.+)/i) || [])[1] || '';
    const v = (than.match(/Việc làm được\s*:\s*(.+)/i) || [])[1] || '';
    chuong.push({ tieuDe: m[2].trim().slice(0, 140), yChinh: y.trim().slice(0, 300), viec: v.trim().slice(0, 300) });
  }
  return { soNhatQuan: so, chuong };
}

/* ═══════════════ BIÊN TẬP — MÁY ĐO ═══════════════
   Hai cổng CỨNG (không qua thì viết lại; hết lượt mà vẫn sai thì dừng chờ
   người): dữ liệu người · độ dài. Các phép đo còn lại là MỀM: được ghi kèm
   bản nháp làm "điều người duyệt cần kiểm", không giấu đi. */
export function bienTap(chu, loai) {
  const t = String(chu || '');
  const L = LOAI_DE_AN[loai || 'giaDinh'] || LOAI_DE_AN.giaDinh;
  const cung = [], mem = [];
  const ra = soatRaNgoai(t);
  if (!ra.sach) cung.push('Có chỗ giống tên riêng hoặc dữ liệu nhận dạng được (' + ra.ngo.map(n => n.ma).join(', ') +
    '). Bỏ mọi tên riêng, viết "người mẹ", "cậu con trai".');
  if (t.length < DAI.it) cung.push('Chương quá ngắn (' + t.length + ' ký tự, cần từ ' + DAI.it + ').');
  if (t.length > DAI.nhieu) mem.push('Chương dài ' + t.length + ' ký tự — cân nhắc tách.');
  if (t.toLowerCase().indexOf(L.mucCuoi.toLowerCase()) < 0) mem.push('Thiếu mục "' + L.mucCuoi + '".');
  const rong = soatRong(t), giong = soatNgonAI(t), phan = soatLoiNoi(t), cg = soatChuyenGia(t), dai = soatCauDai(t);
  if (rong.length) mem.push(rong.length + ' câu rỗng (vd. "' + rong[0].bat + '").');
  if (giong.length) mem.push(giong.length + ' chỗ giọng máy (vd. "' + giong[0].bat + '").');
  if (phan.length) mem.push(phan.length + ' câu phán xét (vd. "' + phan[0].bat + '" → "' + phan[0].thay + '").');
  if (cg.length) mem.push(cg.length + ' chỗ tự xưng chuyên gia.');
  if (dai.dai && dai.dai.length) mem.push(dai.dai.length + ' câu quá dài.');
  return { dat: !cung.length, cung, mem };
}

/* Nén ngữ cảnh kiểu ainovel: chương trước chỉ đi tiếp bằng tiêu đề và câu
   mở, không gửi lại cả văn bản — rẻ token, và đề bài không phình mãi. */
function tomTruoc(ds) {
  return ds.map((c, i) => 'Chương ' + (i + 1) + ' — ' + c.tieuDe + ': ' +
    String(c.noiDung || '').replace(/\s+/g, ' ').slice(0, 220)).join('\n').slice(0, 1800);
}

async function luu(db, d, thay) {
  const o = Object.assign({}, d, thay, { suaLuc: new Date().toISOString() });
  await db.prepare('UPDATE deAnTaiLieu SET trangThai = ?, dangChuong = ?, danY = ?, chuong = ?, banNhapId = ?, ' +
    'soLuot = ?, loiCuoi = ?, nccCuoi = ?, suaLuc = ? WHERE id = ?')
    .bind(o.trangThai, o.dangChuong, o.danY || null, o.chuong, o.banNhapId || null, o.soLuot,
      o.loiCuoi || null, o.nccCuoi || null, o.suaLuc, o.id).run();
  return o;
}

/* ═══════════════ CỬA: CHẠY MỘT BƯỚC ═══════════════
   Đúng MỘT bước mỗi lượt (nhiều nhất một lượt gọi AI). Bấm tay hay để bộ
   não vận hành chạy thì cùng một hàm, cùng cổng. */
export async function chayBuocTaiLieu(y, env, db, hoSo) {
  if (!duocDung(hoSo)) return { ok: false, code: 'NOPERM', error: 'Xưởng tài liệu mở cho R01–R04.' };
  await taoBang(db);
  const d = await db.prepare('SELECT * FROM deAnTaiLieu WHERE id = ?').bind(String((y || {}).id || '')).first();
  if (!d) return { ok: false, code: 'KHONG_CO', error: 'Không có đề án này.' };
  if (DANG_CHAY.indexOf(d.trangThai) < 0)
    return { ok: false, code: 'KHONG_CHAY', trangThai: d.trangThai, error: d.trangThai === 'choDuyet'
      ? 'Đề án đã đóng gói — đang chờ ba chữ ký ở ngăn Bản nháp chờ duyệt.' : 'Đề án đang dừng: ' + (d.loiCuoi || d.trangThai) };
  const chuong = JSON.parse(d.chuong || '[]');

  /* Bước cuối không gọi AI: soát lần chót trên TOÀN văn rồi soạn bản nháp. */
  if (d.trangThai === 'dongGoi') {
    const dan = JSON.parse(d.danY || '{}');
    const tieuDe = d.chuDe.slice(0, 120);
    const kiem = chuong.map((c, i) => c.mem && c.mem.length ? 'Chương ' + (i + 1) + ': ' + c.mem.join(' ') : '').filter(Boolean);
    const L = loaiCua(d);
    const noiDung = '# ' + tieuDe + '\n\n_' + L.ten + ' · dành cho ' + DOI_TUONG[d.doiTuong] + ' · tầng ' + d.tang + '_\n\n' +
      chuong.map((c, i) => '## Chương ' + (i + 1) + '. ' + c.tieuDe + '\n\n' + c.noiDung).join('\n\n') +
      '\n\n---\n**Điều người duyệt cần kiểm** (máy đo, không phải lời phán):\n' +
      (kiem.length ? kiem.map(k => '- ' + k).join('\n') : '- Máy không thấy chỗ cần sửa; vẫn cần người đọc kiểm đúng, hay, hợp.') +
      '\n\n_Bản nháp AI · xưởng tài liệu GITA · ' + (dan.soNhatQuan || []).length + ' dòng sổ nhất quán._';
    const ra = soatRaNgoai(noiDung);
    if (!ra.sach) {
      await luu(db, d, { trangThai: 'dung', loiCuoi: 'Toàn văn còn chỗ ngờ dữ liệu người: ' + ra.ngo.map(n => n.ma).join(', ') });
      return { ok: false, code: 'DULIEUNGUOI', error: 'Toàn văn còn chỗ ngờ dữ liệu người — dừng, chờ người sửa.' };
    }
    const bn = await soanBanNhap({ phatSinhId: d.phatSinhId, tenKho: L.tenKho, tieuDe, noiDung, loaiDuyet: L.loaiDuyet,
      nguon: 'Xưởng tài liệu ' + d.id + ' · đề bài của ' + (d.taoBoi || '?') + ' · AI ' + (d.nccCuoi || '?') }, env, db, MAY_SOAN);
    if (!bn || !bn.ok) {
      await luu(db, d, { loiCuoi: (bn && bn.error) || 'Không soạn được bản nháp.' });
      return { ok: false, code: (bn && bn.code) || 'SOANLOI', error: (bn && bn.error) || 'Không soạn được bản nháp.' };
    }
    await luu(db, d, { trangThai: 'choDuyet', banNhapId: bn.id, loiCuoi: null });
    await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'XTL_DONG_GOI', doiTuong: d.id, chiTiet: bn.id });
    return { ok: true, id: d.id, buoc: 'dongGoi', trangThai: 'choDuyet', banNhapId: bn.id,
      vi: 'Đã đóng gói thành bản nháp ' + bn.id + '. Tài liệu tới gia đình chỉ khi đủ ba chữ ký.' };
  }

  if (d.soLuot >= TRAN_LUOT(d.soChuong)) {
    await luu(db, d, { trangThai: 'dung', loiCuoi: 'Chạm trần ' + TRAN_LUOT(d.soChuong) + ' lượt AI của đề án.' });
    return { ok: false, code: 'TRANLUOT', error: 'Đề án đã dùng hết ' + TRAN_LUOT(d.soChuong) + ' lượt AI — dừng để người xem.' };
  }

  if (d.trangThai === 'kienTruc') {
    const cau = boiCanh(d) + '\nLập dàn ý đúng ' + d.soChuong + ' chương.';
    const r = await goiTheoLoai(env, db, hoSo, 'soan', cau, { khuon: KHUON_KIEN_TRUC, ra: 900 });
    if (!r.ok) return ngung(db, d, r);
    const dan = docDanY(r.text, d.soChuong);
    const thieu = dan.chuong.length < d.soChuong || dan.chuong.some(c => !c.tieuDe);
    await luu(db, d, thieu
      ? { soLuot: d.soLuot + 1, nccCuoi: r.ncc, loiCuoi: 'Dàn ý mới có ' + dan.chuong.length + '/' + d.soChuong + ' chương — lập lại.' }
      : { soLuot: d.soLuot + 1, nccCuoi: r.ncc, loiCuoi: null, trangThai: 'viet', dangChuong: 0, danY: JSON.stringify(dan) });
    return { ok: true, id: d.id, buoc: 'kienTruc', dat: !thieu, soChuongDanY: dan.chuong.length, ncc: r.ncc, token: r.token };
  }

  /* trangThai 'viet' */
  const dan = JSON.parse(d.danY || '{}');
  const i = d.dangChuong, muc = (dan.chuong || [])[i] || {};
  const cu = chuong[i] || { lanViet: 0 };
  const cau = boiCanh(d) +
    '\nSỔ NHẤT QUÁN:\n' + (dan.soNhatQuan || []).map(s => '- ' + s).join('\n') +
    (i ? '\nCác chương trước (tóm tắt):\n' + tomTruoc(chuong.slice(0, i)) : '') +
    '\n\nViết CHƯƠNG ' + (i + 1) + '/' + d.soChuong + ': ' + muc.tieuDe +
    '\nÝ chính: ' + muc.yChinh + '\nViệc làm được: ' + muc.viec +
    (cu.gopY ? '\n\nBẢN TRƯỚC BỊ TRẢ LẠI VÌ: ' + cu.gopY + '\nViết lại, sửa đúng các chỗ ấy.' : '');
  const r = await goiTheoLoai(env, db, hoSo, 'soan', cau.slice(0, 6000), { khuon: KHUON_THEO_LOAI[d.loai] || KHUON_VIET, ra: 1400 });
  if (!r.ok) return ngung(db, d, r);
  const bt = bienTap(r.text, d.loai);
  const lan = (cu.lanViet || 0) + 1;
  const ban = { tieuDe: muc.tieuDe, noiDung: r.text, lanViet: lan, mem: bt.mem, ncc: r.ncc };
  let thay;
  if (bt.dat) {
    chuong[i] = ban;
    const xong = i + 1 >= d.soChuong;
    thay = { chuong: JSON.stringify(chuong), dangChuong: i + 1, trangThai: xong ? 'dongGoi' : 'viet', loiCuoi: null };
  } else if (lan < LAN_VIET_TOI_DA) {
    chuong[i] = Object.assign({}, cu, { lanViet: lan, gopY: bt.cung.join(' ') });
    thay = { chuong: JSON.stringify(chuong), loiCuoi: 'Chương ' + (i + 1) + ' trả lại lần ' + lan + ': ' + bt.cung.join(' ') };
  } else {
    chuong[i] = Object.assign(ban, { gopY: bt.cung.join(' ') });
    thay = { chuong: JSON.stringify(chuong), trangThai: 'dung',
      loiCuoi: 'Chương ' + (i + 1) + ' viết ' + lan + ' lần vẫn chưa qua cổng cứng: ' + bt.cung.join(' ') };
  }
  await luu(db, d, Object.assign({ soLuot: d.soLuot + 1, nccCuoi: r.ncc }, thay));
  return { ok: true, id: d.id, buoc: 'viet', chuong: i + 1, lanViet: lan, dat: bt.dat, cung: bt.cung, mem: bt.mem,
    trangThai: thay.trangThai || 'viet', ncc: r.ncc, token: r.token };
}

/* Bộ não tắt, hết ngân sách, cổng Điều 13 chặn: KHÔNG tính là một lượt viết
   hỏng và không đổi trạng thái — chỉ ghi lý do, lượt sau thử lại. */
async function ngung(db, d, r) {
  await luu(db, d, { loiCuoi: (r.code || 'LOI') + ': ' + (r.error || '') });
  return { ok: false, code: r.code || 'AI_LOI', error: r.error || 'Lượt AI không thành.', id: d.id };
}

/* ═══════════════ CỬA: ĐỌC ═══════════════ */
export async function docDeAnTaiLieu(y, env, db, hoSo) {
  if (!duocDung(hoSo)) return { ok: false, code: 'NOPERM', error: 'Xưởng tài liệu mở cho R01–R04.' };
  await taoBang(db);
  const id = String((y || {}).id || '');
  if (id) {
    const d = await db.prepare('SELECT * FROM deAnTaiLieu WHERE id = ?').bind(id).first();
    if (!d) return { ok: false, code: 'KHONG_CO', error: 'Không có đề án này.' };
    return { ok: true, deAn: Object.assign({}, d, { danY: JSON.parse(d.danY || 'null'), chuong: JSON.parse(d.chuong || '[]'),
      tuChay: !!d.tuChay, tranLuot: TRAN_LUOT(d.soChuong) }) };
  }
  const ds = (await db.prepare('SELECT id, chuDe, loai, doiTuong, tang, soChuong, trangThai, dangChuong, tuChay, soLuot, loiCuoi, ' +
    'banNhapId, taoBoi, suaLuc FROM deAnTaiLieu ORDER BY suaLuc DESC LIMIT 100').all()).results || [];
  return { ok: true, ds: ds.map(d => Object.assign({}, d, { tuChay: !!d.tuChay, tranLuot: TRAN_LUOT(d.soChuong) })) };
}

/* ═══════════════ CỬA: BẬT / TẮT TỰ CHẠY · CHẠY LẠI ĐỀ ÁN ĐANG DỪNG ═══════════════
   Tự chạy = bộ não vận hành đi tiếp một bước mỗi lượt làm việc. Chạy lại
   một đề án đang dừng chỉ Super Admin (người khác dừng vì lý do thì người
   cao nhất mới gỡ), và nó cấp thêm đúng một vòng trần lượt. */
export async function datTuChayTaiLieu(y, env, db, hoSo) {
  if (!duocDung(hoSo)) return { ok: false, code: 'NOPERM', error: 'Xưởng tài liệu mở cho R01–R04.' };
  await taoBang(db);
  const id = String((y || {}).id || ''), bat = (y || {}).bat === true ? 1 : 0;
  const d = await db.prepare('SELECT id, trangThai FROM deAnTaiLieu WHERE id = ?').bind(id).first();
  if (!d) return { ok: false, code: 'KHONG_CO', error: 'Không có đề án này.' };
  if ((y || {}).chayLai === true) {
    if (!laR01(hoSo)) return { ok: false, code: 'NOPERM', error: 'Chạy lại đề án đang dừng chỉ Super Admin.' };
    if (d.trangThai !== 'dung') return { ok: false, code: 'KHONG_DUNG', error: 'Đề án không ở trạng thái dừng.' };
    const dd = await db.prepare('SELECT * FROM deAnTaiLieu WHERE id = ?').bind(id).first();
    const ch = JSON.parse(dd.chuong || '[]');
    const tt = !dd.danY ? 'kienTruc' : (dd.dangChuong >= dd.soChuong ? 'dongGoi' : 'viet');
    if (ch[dd.dangChuong]) ch[dd.dangChuong].lanViet = 0;
    await db.prepare('UPDATE deAnTaiLieu SET trangThai = ?, soLuot = 0, chuong = ?, loiCuoi = NULL, suaLuc = ? WHERE id = ?')
      .bind(tt, JSON.stringify(ch), new Date().toISOString(), id).run();
  }
  await db.prepare('UPDATE deAnTaiLieu SET tuChay = ?, suaLuc = ? WHERE id = ?').bind(bat, new Date().toISOString(), id).run();
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'XTL_TU_CHAY', doiTuong: id,
    chiTiet: (bat ? 'bật' : 'tắt') + ((y || {}).chayLai === true ? ' · chạy lại' : '') });
  return { ok: true, id, tuChay: !!bat };
}

/* Cho bộ não vận hành: các đề án đang tự chạy, cũ nhất trước. */
export async function deAnTuChay(db, n) {
  await taoBang(db);
  return ((await db.prepare("SELECT id, chuDe, trangThai, dangChuong, soChuong FROM deAnTaiLieu WHERE tuChay = 1 " +
    "AND trangThai IN ('kienTruc','viet','dongGoi') ORDER BY suaLuc ASC LIMIT ?").bind(n || 2).all()).results) || [];
}

/* ═══════════════ MÁY XÂY KHO HÀNG LOẠT ═══════════════
   Chủ hệ: "xây full kho coach, kho tư vấn, kho tài nguyên". Kho nội dung
   gốc nằm trong các gói mã hoá — không ai được sửa tay chúng, và máy càng
   không. Đường đúng để kho LỚN THÊM là đường đã có: đề án → AI soạn → máy
   biên tập → ba chữ ký → nhập kho. Cửa này chỉ làm một việc: đặt CẢ MỘT BỘ
   đề án cùng lúc, bật tự chạy, để bộ não vận hành viết dần mỗi lượt.

   Bộ khởi đầu bám đúng năm tầng (G.TIERS): T1 nhận diện — quan sát, không
   chữa · T2 giải mã — giả thuyết, vòng 7 ngày · T3 kiến tạo — chuỗi 21 ngày,
   PDCA · T4 chuyển hoá — chu kỳ 90 ngày, giảm hỗ trợ · T5 bứt phá — gia đình
   tự vận hành. Chủ đề chỉ là ĐỀ BÀI; nội dung do AI soạn và NGƯỜI ký. */
export const BO_CHU_DE = {
  khoiDau: [
    { loai: 'giaDinh', tang: 'T1', doiTuong: 'phuHuynh', soChuong: 4, chuDe: 'Bảy ngày quan sát: ghi lại buổi tối của nhà mình mà chưa sửa gì' },
    { loai: 'giaDinh', tang: 'T1', doiTuong: 'phuHuynh', soChuong: 4, chuDe: 'Nhìn ra mô thức: khi nào con dễ cáu, khi nào con hợp tác' },
    { loai: 'giaDinh', tang: 'T1', doiTuong: 'caNha', soChuong: 3, chuDe: 'Cả nhà cùng kể: mỗi người một góc nhìn về chuyện học ở nhà' },
    { loai: 'giaDinh', tang: 'T2', doiTuong: 'phuHuynh', soChuong: 5, chuDe: 'Đặt giả thuyết thay vì đổ lỗi: vì sao con trì hoãn bài tập' },
    { loai: 'giaDinh', tang: 'T2', doiTuong: 'phuHuynh', soChuong: 4, chuDe: 'Vòng thử 7 ngày: đổi đúng một điều rồi ghi bằng chứng' },
    { loai: 'giaDinh', tang: 'T2', doiTuong: 'con11_14', soChuong: 4, chuDe: 'Con tự quan sát mình: nhật ký năng lượng trong ngày' },
    { loai: 'giaDinh', tang: 'T3', doiTuong: 'phuHuynh', soChuong: 5, chuDe: 'Chuỗi 21 ngày đầu tiên: dựng khung giờ học buổi tối' },
    { loai: 'giaDinh', tang: 'T3', doiTuong: 'caNha', soChuong: 4, chuDe: 'Họp nhà 15 phút mỗi tuần: lập kế hoạch, làm, soát, chỉnh' },
    { loai: 'giaDinh', tang: 'T3', doiTuong: 'con11_14', soChuong: 4, chuDe: 'Con tự lập thời gian biểu và tự soát cuối tuần' },
    { loai: 'giaDinh', tang: 'T3', doiTuong: 'con6_10', soChuong: 3, chuDe: 'Đọc cùng con nhỏ mười lăm phút trước giờ ngủ' },
    { loai: 'giaDinh', tang: 'T4', doiTuong: 'phuHuynh', soChuong: 5, chuDe: 'Lùi lại đúng lúc: chuyển quyền điều hành việc học cho con' },
    { loai: 'giaDinh', tang: 'T4', doiTuong: 'phuHuynh', soChuong: 4, chuDe: 'Khi con vấp lại thói quen cũ: phục hồi mà không trách móc' },
    { loai: 'giaDinh', tang: 'T4', doiTuong: 'con15_18', soChuong: 4, chuDe: 'Con tự đặt mục tiêu 90 ngày và đo tiến bộ của chính mình' },
    { loai: 'giaDinh', tang: 'T5', doiTuong: 'caNha', soChuong: 4, chuDe: 'Gia đình tự vận hành: những việc vẫn chạy khi không ai nhắc' },
    { loai: 'giaDinh', tang: 'T5', doiTuong: 'caNha', soChuong: 4, chuDe: 'Từ tự quản sang tạo giá trị: một dự án nhỏ của cả nhà' },
    { loai: 'giaDinh', tang: 'T5', doiTuong: 'phuHuynh', soChuong: 4, chuDe: 'Cha mẹ làm gương: lịch học của chính mình' },
    { loai: 'taiNguyen', tang: 'T1', doiTuong: 'phuHuynh', soChuong: 3, chuDe: 'Phiếu quan sát bảy ngày cho cha mẹ' },
    { loai: 'taiNguyen', tang: 'T2', doiTuong: 'phuHuynh', soChuong: 3, chuDe: 'Phiếu thử nghiệm một thay đổi trong bảy ngày' },
    { loai: 'taiNguyen', tang: 'T3', doiTuong: 'caNha', soChuong: 3, chuDe: 'Phiếu chuỗi 21 ngày và cổng nghiệm thu' },
    { loai: 'taiNguyen', tang: 'T3', doiTuong: 'caNha', soChuong: 3, chuDe: 'Phiếu họp nhà hằng tuần' },
    { loai: 'taiNguyen', tang: 'T4', doiTuong: 'con15_18', soChuong: 3, chuDe: 'Phiếu tự đánh giá 90 ngày cho con' },
    { loai: 'doiNgu', tang: 'T1', doiTuong: 'coach', soChuong: 5, chuDe: 'Buổi đầu với một gia đình tầng 1: nghe, ghi, chưa chữa' },
    { loai: 'doiNgu', tang: 'T2', doiTuong: 'coach', soChuong: 4, chuDe: 'Đồng hành vòng thử 7 ngày: giúp nhà đặt giả thuyết đúng' },
    { loai: 'doiNgu', tang: 'T2', doiTuong: 'coach', soChuong: 4, chuDe: 'Dấu hiệu cần chuyển Hội đồng chuyên môn và cách nói với cha mẹ' },
    { loai: 'doiNgu', tang: 'T3', doiTuong: 'coach', soChuong: 4, chuDe: 'Khi gia đình bỏ dở chuỗi 21 ngày: đưa nhà trở lại nhịp' },
    { loai: 'doiNgu', tang: 'T4', doiTuong: 'coach', soChuong: 4, chuDe: 'Giảm dần hỗ trợ ở tầng 4 mà nhà không hụt' },
    { loai: 'doiNgu', tang: 'T1', doiTuong: 'tuVan', soChuong: 4, chuDe: 'Cuộc gọi đầu tiên với phụ huynh mới: lắng nghe trước khi giới thiệu' },
    { loai: 'doiNgu', tang: 'T1', doiTuong: 'tuVan', soChuong: 4, chuDe: 'Trả lời phụ huynh còn do dự mà không hứa kết quả' },
    { loai: 'doiNgu', tang: 'T2', doiTuong: 'tuVan', soChuong: 4, chuDe: 'Chăm sóc gia đình im lặng quá bảy ngày: gọi, hỏi, không bán' },
    { loai: 'doiNgu', tang: 'T3', doiTuong: 'chuyenGia', soChuong: 4, chuDe: 'Soát chất lượng một ca đồng hành: đọc sổ, nghe lại, góp ý' },
    { loai: 'doiNgu', tang: 'T4', doiTuong: 'chuyenGia', soChuong: 5, chuDe: 'Thiết kế lộ trình 365 ngày cho một gia đình nhiều khó khăn' }
  ]
};
export const TRAN_KE_HOACH = 40;

/* Ước tính token, nói rõ là ƯỚC TÍNH: một lượt dàn ý ~2.000, mỗi chương
   ~3.000 (đề bài + bài viết), chưa tính viết lại. Ngân sách ngày đọc từ đúng
   hai biến bộ não đa trí dùng (GITA_NGAN_TOKEN_CF_WORKERS_AI · GITA_TRAN_TAI)
   — bộ não còn việc khác, nên số ngày thật có thể dài hơn. */
function uocTinh(ds, env) {
  const token = ds.reduce((t, x) => t + 2000 + 3000 * x.soChuong, 0);
  const goc = Number(env && env.GITA_NGAN_TOKEN_CF_WORKERS_AI) > 0 ? Number(env.GITA_NGAN_TOKEN_CF_WORKERS_AI) : 100000;
  const tran = Number(env && env.GITA_TRAN_TAI) >= 1 && Number(env.GITA_TRAN_TAI) <= 100 ? Number(env.GITA_TRAN_TAI) / 100 : 0.5;
  const ngay = Math.max(1, Math.ceil(token / Math.max(1, goc * tran)));
  return { token, nganNgay: Math.floor(goc * tran), ngay, la: 'uocTinh' };
}

export async function lapKeHoachKho(y, env, db, hoSo) {
  if (!duocDung(hoSo)) return { ok: false, code: 'NOPERM', error: 'Máy xây kho mở cho R01–R04.' };
  const x = y || {};
  const ds = x.bo ? (BO_CHU_DE[String(x.bo)] || null) : (Array.isArray(x.ds) ? x.ds : null);
  if (!ds || !ds.length) return { ok: false, code: 'SAI', error: 'Chọn một bộ chủ đề có sẵn hoặc gửi danh sách đề án.' };
  if (ds.length > TRAN_KE_HOACH) return { ok: false, code: 'SAI', error: 'Một lượt đặt tối đa ' + TRAN_KE_HOACH + ' đề án.' };
  await taoBang(db);
  const daTao = [], boQua = [], loi = [];
  for (const it of ds) {
    const chuDe = moi(it && it.chuDe, 200), loai = String((it && it.loai) || 'giaDinh');
    /* Không đặt trùng: cùng chủ đề, cùng loại thì đã có người đang viết. */
    const co = await db.prepare('SELECT id FROM deAnTaiLieu WHERE chuDe = ? AND loai = ? LIMIT 1').bind(chuDe, loai).first();
    if (co) { boQua.push({ chuDe, id: co.id }); continue; }
    const r = await lapDeAnTaiLieu(Object.assign({}, it, { chuDe, tuChay: x.tuChay !== false }), env, db, hoSo);
    if (r && r.ok) daTao.push(r.id); else loi.push({ chuDe, error: (r && r.error) || 'lỗi' });
  }
  const moiTao = ds.filter(it => daTao.length && !boQua.some(b => b.chuDe === moi(it.chuDe, 200)));
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'XTL_KE_HOACH', doiTuong: String(x.bo || 'tuChon'),
    chiTiet: 'tạo ' + daTao.length + ' · bỏ qua ' + boQua.length + ' · lỗi ' + loi.length });
  return { ok: true, daTao: daTao.length, boQua: boQua.length, loi, ids: daTao, uocTinh: uocTinh(moiTao, env),
    vi: 'Đã đặt ' + daTao.length + ' đề án, bộ não viết dần mỗi lượt. Mỗi bản xong vẫn phải đủ ba chữ ký mới vào kho.' };
}
