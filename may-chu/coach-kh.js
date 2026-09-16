/* ═══════════════════════════════════════════════════════════════
   GITA 365 — PHÂN HỆ 2: COACH KHÁCH HÀNG, PHẦN CHẠY Ở MÁY CHỦ

   Bản chép của G.CK_* — bộ kiểm mục 81 đối chiếu từng ô với kho.

   ══ CÁI RĂNG CHÍNH NẰM Ở ĐÂU ══

   Bản đặc tả viết đúng một câu mới cho cả Phần IV: trước khi trả lời
   bất kỳ câu hỏi nào về một đứa trẻ cụ thể, bộ não đọc Thẻ Vùng Mạnh
   của con đó trước.

   Dựng câu ấy bằng một cái cờ `daDocThe: true` do người gọi truyền
   vào thì nó là một lời khai, không phải một phép đo — và một lời
   khai bật được mà không đọc gì. Nên ở đây MÁY CHỦ TỰ ĐỌC thẻ, và
   câu trả lời dựng ra phải MANG THEO cửa tiếp nhận đọc được từ thẻ.

   Kéo theo một phép đo mà chính bản đặc tả viết sẵn: "cùng một câu
   hỏi, trả lời cho con vào qua cửa LÀM phải khác hẳn trả lời cho con
   vào qua cửa NGHE". Hai đứa trẻ khác cửa mà ra hai câu trả lời
   giống hệt nhau là máy chưa đọc thẻ — dù cờ có bật, dù nhật ký có
   ghi. Đó là phép đo đo được HÀNH VI, không đo lời khai.
   ═══════════════════════════════════════════════════════════════ */

import { Kho } from './nen.js';
import * as VungManh from './vung-manh.js';
import * as LuatGD from './luat-giao-dien.js';

/* ═══════════════ BẢN CHÉP CỦA KHO ═══════════════ */

export const VONG9 = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9'];
export const TRAN_HOI_LAI = 1;

export const LUONG12 = ['L01', 'L02', 'L03', 'L04', 'L05', 'L06',
  'L07', 'L08', 'L09', 'L10', 'L11', 'L12'];
export const LUONG_NANG = ['L05', 'L06', 'L09', 'L12'];
export const LUOT_HOI_DONG = 3;

export const GHE5 = ['G1', 'G2', 'G3', 'G4', 'G5'];
export const GHE_NGUOI_THAT = 'G5';

export const MUC5 = ['M1', 'M2', 'M3', 'M4', 'M5'];
export const MUC_MAC_DINH = 'M3';

export const CUA3 = ['nhin', 'nghe', 'lam'];
export const SO3 = ['soSai', 'soBiCuoi', 'soNguoiLonBuon'];

export const TRAN_BTB = { chuMoiCau: 20, dongMoiDoan: 4, soTrongBai: 2 };

function duocVaoCK(hoSo) {
  /* R01–R12 (nhà nghề), KHÔNG R13–R15 (khách). Bản đầu mở tới R15 dù câu
     từ chối tự khai "mở cho người của Học viện"; khách qua được cổng ngoài
     và chạm logic hội đồng/L10 (chưa rò Thẻ vì cửa lồng docTheVungManh tự
     kiểm lại, nhưng đó là phòng thủ một lớp mỏng — siết đúng vai theo lời
     khai của chính cổng). 9.99.112, khuyến nghị thanh tra ma-trận-vai. */
  return /^R(0[1-9]|1[0-2])$/.test(String((hoSo || {}).role || ''));
}

/* ═══════════════ BÉ TẬP BÒ — BA CÁI TRẦN ═══════════════

   Đếm câu bằng dấu chấm · chấm hỏi · chấm than, và đếm CHỮ chứ không
   đếm ký tự: tiếng Việt đếm ký tự thì một câu mười hai chữ có dấu
   trông dài hơn một câu mười hai chữ không dấu, mà chúng dài bằng
   nhau khi đọc.

   Đếm con số thì đếm CỤM SỐ, không đếm chữ số — "90 ngày" là một con
   số, không phải hai. Và bỏ qua số nằm trong một mã (T4, L05, M3):
   một cái mã không phải một con số người đọc phải nhớ. */
export function soatBeTapBo(chu) {
  const t = String(chu || '');

  const cau = t.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  const cauDai = cau
    .map(s => ({ cau: s.slice(0, 60), so: s.split(/\s+/).filter(Boolean).length }))
    .filter(x => x.so > TRAN_BTB.chuMoiCau);

  const doan = t.split(/\n{2,}/).map(s => s.trim()).filter(Boolean);
  const doanDai = doan
    .map((s, i) => ({ doan: i + 1, dong: s.split(/\n/).filter(x => x.trim()).length }))
    .filter(x => x.dong > TRAN_BTB.dongMoiDoan);

  /* Bỏ mã trước rồi mới đếm số: T4 · L05 · M3 · RB-07 · D1 không phải
     con số người đọc phải nhớ, và đếm chúng thì mọi bài nhắc tới bảng
     nào cũng vượt trần — một phép đo bắt oan thì lần sau người ta tắt. */
  const sach = t.replace(/\b[A-ZĐ]{1,3}-?\d{1,3}\b/g, ' ');
  const so = (sach.match(/\d+(?:[.,]\d+)*/g) || []);

  const vuot = [];
  if (cauDai.length) vuot.push('câu quá ' + TRAN_BTB.chuMoiCau + ' chữ: ' +
    cauDai.length + ' (dài nhất ' + Math.max(...cauDai.map(x => x.so)) + ' chữ)');
  if (doanDai.length) vuot.push('đoạn quá ' + TRAN_BTB.dongMoiDoan + ' dòng: ' +
    doanDai.length);
  if (so.length > TRAN_BTB.soTrongBai) vuot.push('có ' + so.length + ' con số, trần ' +
    TRAN_BTB.soTrongBai + ' — ' + so.slice(0, 6).join(' · '));

  return {
    dat: vuot.length === 0,
    soCau: cau.length, soDoan: doan.length, soCon: so.length,
    cauDai, doanDai, vuot,
    /* Máy KHÔNG cắt hộ. Cắt hộ thì người viết không biết mình vừa viết
       dài, và lần sau viết y hệt — cùng luật với Điều 13 của Hiến pháp. */
    vi: vuot.length
      ? 'Vượt trần Bé tập bò: ' + vuot.join(' · ') + '. Máy KHÔNG tự cắt bớt — cắt ' +
        'hộ thì người viết không biết mình vừa viết dài, và lần sau viết y hệt.'
      : 'Đạt cả ba trần của Bé tập bò.'
  };
}

/* ═══════════════ HỘI ĐỒNG NĂM GHẾ ═══════════════

   Ghế G5 phải mang tên một NGƯỜI. Máy điền vào đó là một lời nói dối
   mang dấu của hệ thống — cùng luật với ô daGoNgoai của trợ lý hình
   ảnh và cột lời khai của phễu.

   Danh sách chặn ngắn và chỉ chặn thứ máy tự gọi mình. Không cố dò
   "cái tên này có phải người thật không": không dò được, và một phép
   dò không dò được thì nó chỉ dạy người ta cách gõ vòng qua. Chỗ
   chặn thật là ô ấy đi vào nhật ký kèm người bấm. */
const TEN_MAY = ['may', 'máy', 'ai', 'bot', 'gpt', 'claude', 'bonao', 'bo-nao',
  'bộ não', 'he thong', 'hệ thống', 'system', 'auto', 'tudong', 'tự động'];

export function soatGhe5(ds) {
  const d = ds || {};
  const thieu = GHE5.filter(g => !String(d[g] || '').trim());
  const g5 = String(d[GHE_NGUOI_THAT] || '').trim().toLowerCase();
  const mayNgoi = !!g5 && TEN_MAY.indexOf(g5) >= 0;
  return {
    dat: thieu.length === 0 && !mayNgoi,
    thieu, mayNgoi,
    vi: thieu.length
      ? 'Thiếu ghế: ' + thieu.join(' · ') + '. Năm ghế là năm câu hỏi khác nhau — ' +
        'bỏ một ghế là bỏ một câu hỏi, không phải bớt một thủ tục.'
      : mayNgoi
        ? 'Ghế Người giữ hồn đang mang tên máy. Bốn ghế kia hỏi câu đo được; ghế ' +
          'này hỏi "đọc xong người mẹ ấy thấy gì", và câu trả lời của máy cho nó ' +
          'nghe y hệt câu trả lời thật — đó đúng là lý do nó phải là người.'
        : 'Đủ năm ghế, ghế giữ hồn mang tên người.'
  };
}

/* ═══════════════ HỘI ĐỒNG BA LƯỢT CHO BỐN LUỒNG NẶNG ═══════════════ */
export function soatHoiDong(luong, luot) {
  const l = String(luong || '').trim();
  const ds = Array.isArray(luot) ? luot.map(x => String(x || '').trim()) : [];
  const nang = LUONG_NANG.indexOf(l) >= 0;
  if (!nang) return { dat: true, nang: false,
    vi: 'Luồng thường — không bắt buộc hội đồng ba lượt.' };

  const du = ds.filter(Boolean).length >= LUOT_HOI_DONG;
  /* Ba lượt phải KHÁC NHAU. Chép lại một lượt ba lần thì con số ba vẫn
     đúng và cái được canh thì không còn — bảng hội đồng thành sân khấu,
     và một sân khấu mang dấu kiểm duyệt thì tệ hơn không có bảng nào. */
  const rieng = new Set(ds.filter(Boolean).map(x => x.replace(/\s+/g, ' ').toLowerCase()));
  const trung = du && rieng.size < LUOT_HOI_DONG;

  return {
    dat: du && !trung, nang: true, soLuot: ds.filter(Boolean).length, soRieng: rieng.size,
    vi: !du
      ? 'Luồng ' + l + ' bắt buộc ' + LUOT_HOI_DONG + ' lượt hội đồng, mới có ' +
        ds.filter(Boolean).length + '. Một lượt là một ý kiến; ba lượt là lượt đầu bị ' +
        'phản biện rồi bản sửa bị kiểm chứng.'
      : trung
        ? 'Có đủ ' + LUOT_HOI_DONG + ' lượt nhưng chỉ ' + rieng.size + ' lượt khác ' +
          'nhau. Chép lại một lượt ba lần thì con số ba vẫn đúng và cái được canh ' +
          'thì không còn.'
        : 'Đủ ' + LUOT_HOI_DONG + ' lượt, cả ba khác nhau.'
  };
}

/* ═══════════════ BA CỬA × BA NGƯỠNG SỢ ═══════════════ */
export const CUA_DOI = [
  ['nhin', 'Đưa trước một hình, một bảng, một sơ đồ. Nói sau.',
    'Đừng giảng dài rồi mới cho xem.'],
  ['nghe', 'Kể thành chuyện, đọc to lên, hỏi đáp bằng lời.',
    'Đừng phát cho con một tờ giấy rồi bảo tự đọc.'],
  ['lam', 'Cho cầm vào trước, hiểu sau. Bài tập đổi sang dạng làm tay.',
    'Đừng bắt ngồi yên nghe hết rồi mới cho làm.']
];

export const SO_GIONG = [
  ['soSai', 'Nói trước rằng làm sai là một bước của việc làm đúng.'],
  ['soBiCuoi', 'Giai đoạn đầu diễn ra TRONG NHÀ. Không khoe, không quay phim.'],
  ['soNguoiLonBuon', 'Người lớn nói rõ: bố mẹ không buồn vì điểm.']
];

/* ═══════════════ CỬA CHÍNH — TRẢ LỜI MỘT CÂU VỀ MỘT ĐỨA TRẺ ═══════════════

   Máy chủ TỰ đọc thẻ. Người gọi không truyền vào được một cái cờ nào
   nói rằng đã đọc rồi — vì một cái cờ như thế bật được mà không đọc
   gì, và lúc ấy cả Phân hệ 1 dừng ở một tờ giấy đẹp. */
export async function traLoiCoach(y, env, db, hoSo) {
  if (!duocVaoCK(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Cổng Coach khách hàng mở cho người của Học viện đã đăng nhập.' };

  const x = y || {};
  const luong = String(x.luong || '').trim();
  const cauHoi = String(x.cauHoi || '').trim();
  const maNha = String(x.maNha || '').trim();

  if (LUONG12.indexOf(luong) < 0) return { ok: false, code: 'LUONGLA',
    error: 'Chưa phân luồng. Bước B2 của vòng chín bước không bỏ được: bốn luồng ' +
      'nặng đi đường khác, và không phân luồng thì chúng đi đường thường.' };
  if (cauHoi.length < 5) return { ok: false, error: 'Thiếu câu hỏi.' };

  /* ══ L10 · BA GHẾ NGƯỜI GIỮ ══  (9.99.74)

     Máy KHÔNG soạn hộ lời khen con, lời xin lỗi, thư tha thứ, tin nhắn
     an ủi. Chặn ĐẦU cửa, trước cả phân luồng và hội đồng: bốn thứ này
     không phải một luồng khó cần thêm người duyệt — chúng không phải
     việc của máy ở bất kỳ luồng nào.

     Chặn vì máy viết HAY, không phải vì máy viết dở. Một lời xin lỗi do
     máy viết đọc lên nghe y hệt một lời xin lỗi thật, và người nhận
     không có cách nào phân biệt — nên thứ họ nhận được không còn là
     điều họ tưởng mình đang nhận. Chặn vì nó viết dở thì mai nó viết
     hay hơn là luật hết hiệu lực.

     Trả kèm DÒNG NHẮC, không chỉ trả lời từ chối: người hỏi đang cần
     viết một câu khó, và đuổi họ đi tay không thì lần sau họ đi hỏi
     một cái máy không có cổng nào. */
  const ng = LuatGD.soatNguoiGiu(cauHoi);
  if (!ng.sach) {
    await LuatGD.ghiChanLuat(db, hoSo, 'L10', ng.viec + ' · ' + ng.dau);
    return { ok: false, code: 'NGUOIGIU', viec: ng.viec, nhac: ng.nhac,
      oVietTay: true, error: ng.vi };
  }

  /* ══ L04 · DỮ LIỆU VÒNG ĐỎ KHÔNG RỜI MÁY ══
     Soi cả vật yêu cầu, mọi tầng. Năm ô ấy không có bản nào ở máy chủ,
     nên chúng cũng không được đi VÀO một cửa máy chủ. */
  const vd = LuatGD.soatVongDo(x, 'cửa traLoiCoach');
  if (!vd.sach) {
    await LuatGD.ghiChanLuat(db, hoSo, 'L04', vd.thay.join(' · '));
    return { ok: false, code: 'VONGDO', thay: vd.thay, error: vd.vi };
  }

  /* ── LUỒNG NẶNG: HỘI ĐỒNG BA LƯỢT, CHẶN TRƯỚC KHI DỰNG ── */
  const hd = soatHoiDong(luong, x.luot);
  if (!hd.dat) return { ok: false, code: 'THIEUHOIDONG', hoiDong: hd, error: hd.vi };

  const ghe = soatGhe5(x.ghe);
  if (hd.nang && !ghe.dat) return { ok: false, code: 'THIEUGHE', ghe, error: ghe.vi };

  /* ── CÂU VỀ MỘT ĐỨA TRẺ CỤ THỂ: ĐỌC THẺ TRƯỚC ── */
  if (!maNha) return { ok: false, code: 'THIEUNHA',
    error: 'Chưa có mã gia đình, nên máy không đọc được Thẻ Vùng Mạnh. Trả lời ' +
      'chung thì được — nhưng KHÔNG được gọi đó là cá nhân hoá.' };

  const doc = await VungManh.docTheVungManh({ maNha, bayGio: x.bayGio }, env, db, hoSo);
  if (!doc.ok) return { ok: false, code: 'CHUATHE', vungManh: doc,
    error: 'Nhà này chưa có Thẻ Vùng Mạnh, nên câu trả lời cá nhân hoá KHÔNG dựng ' +
      'được. Trả lời chung rồi gọi là cá nhân hoá là chỗ dối dễ nhất của cả hệ — ' +
      'nó nghe giống hệt thứ thật.' };
  if (!doc.conHan) return { ok: false, code: 'THEQUAHAN', quaHanNgay: doc.quaHanNgay,
    error: 'Thẻ đã quá hạn ' + doc.quaHanNgay + ' ngày. Quá hạn thì cũng như chưa ' +
      'có, đúng luật LR2 của Phân hệ 1 — trẻ đổi rất nhanh.' };

  let q = {};
  try {
    const t = await db.prepare(
      'SELECT quanSat FROM theVungManh WHERE maNha = ? ORDER BY lapLuc DESC, rowid DESC LIMIT 1')
      .bind(maNha).first();
    q = JSON.parse((t || {}).quanSat || '{}');
  } catch (e) { q = {}; }

  const cua = CUA3.indexOf(String(q.T4 || '')) >= 0 ? String(q.T4) : undefined;
  const so = SO3.indexOf(String(q.T7 || '')) >= 0 ? String(q.T7) : undefined;

  /* Thiếu ô cửa thì NÓI LÀ KHÔNG BIẾT, không đoán. Đoán thì một phần
     ba là trúng, và người đọc không có cách nào biết câu trả lời vừa
     được xây trên một cái đoán. */
  if (!cua) return { ok: false, code: 'THIEUCUA',
    error: 'Thẻ của nhà này chưa có ô cửa tiếp nhận (T4), và máy KHÔNG đoán một ' +
      'cửa. Đoán thì một phần ba là trúng, và người đọc không có cách nào biết câu ' +
      'trả lời vừa được xây trên một cái đoán.' };

  const doiCua = CUA_DOI.find(r => r[0] === cua);
  const giong = so ? (SO_GIONG.find(r => r[0] === so) || [])[1] : undefined;

  const tra = {
    cua, doi: doiCua[1], trach: doiCua[2],
    soHai: so, giong,
    /* Mức mặc định là M3, và nó được GHI RA chứ không để im. Một mức
       không ghi ra thì lần sau không ai biết bản ấy viết cho ai. */
    muc: MUC5.indexOf(String(x.muc || '')) >= 0 ? String(x.muc) : MUC_MAC_DINH
  };

  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'CK_TRALOI',
    doiTuong: maNha, chiTiet: luong + ' · cửa ' + cua + (so ? ' · ' + so : '') +
      ' · ' + tra.muc });

  return { ok: true, luong, maNha, nang: hd.nang, ...tra,
    chuThich: doc.chuThich,
    vi: 'Câu trả lời dựng theo cửa ' + cua + ' đọc từ Thẻ Vùng Mạnh còn hạn ' +
      doc.conLai + ' ngày. Cùng một câu hỏi, con vào qua cửa khác thì câu trả lời ' +
      'khác — đó là chỗ cá nhân hoá chạm tới từng câu chữ.' };
}

/* ═══════════════ SOI MỘT BẢN NHÁP TRƯỚC KHI GỬI ═══════════════ */
export async function soatBanTra(y, env, db, hoSo) {
  if (!duocVaoCK(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Cổng Coach khách hàng mở cho người của Học viện đã đăng nhập.' };
  const chu = String((y || {}).chu || '').trim();
  if (chu.length < 10) return { ok: false, error: 'Dưới mười chữ thì chưa đủ để soi.' };
  const btb = soatBeTapBo(chu);
  const gen = VungManh.soatHuaGen(chu);
  return { ok: true, beTapBo: btb, gen, dat: btb.dat && gen.sach };
}
