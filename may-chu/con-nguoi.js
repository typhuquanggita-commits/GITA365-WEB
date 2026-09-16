/* ═══════════════════════════════════════════════════════════════
   GITA 365 — PHÂN HỆ 6: CON NGƯỜI, PHẦN CHẠY Ở MÁY CHỦ

   Bản chép của G.CN_* — bộ kiểm mục 86 đối chiếu từng ô với kho.

   ══ PHẦN NÀY DỰNG ĐÚNG MỘT THỨ CHƯA CÓ: MỘT CÁI CỔNG ══

   Kho đã có hệ sát hạch nghề (SH_*, 348 câu, sáu vai), đã có Hiến pháp
   13 điều và hàng rào 10 điểm (BN_*). Ba cửa của Phần VIII không dựng
   lại cái nào — chúng TRỎ vào đấy. Thứ chưa có là một cái cổng đứng
   trước lượt chạm khách đầu tiên.

   ══ CỔNG NẰM Ở ghiCham, KHÔNG NẰM Ở MÀN HÌNH ══

   Bản đặc tả viết "không được chạm khách một mình, không ngoại lệ, kể
   cả khi thiếu người". Đặt câu ấy ở màn hình thì nó là một lời nhắc:
   người ta đọc, thấy hợp lý, rồi vẫn gọi vì hôm nay thiếu người. Mỗi
   lần nhân nhượng đều hợp lý ở đúng ca ấy — cùng cái bẫy đã ghi ở cổng
   ADN của trợ lý hình ảnh (9.99.56).

   ══ VÀ BẬT CỔNG LÀ CHẶN CẢ NGƯỜI CŨ ══

   Hệ quả cố ý, không phải tác dụng phụ. Một cổng chỉ áp cho người mới
   là một cổng nói rằng người cũ không cần chuẩn. Đường cho người cũ là
   `lapBaCua`, và dòng ấy mang `nguon: 'khaiCu'` — đọc ra được, mãi mãi.
   ═══════════════════════════════════════════════════════════════ */

import { Kho } from './nen.js';
import * as BoNao from './bo-nao.js';

/* ═══════════════ BẢN CHÉP CỦA KHO ═══════════════ */

export const CUA = ['C1', 'C2', 'C3'];
export const NGUON = ['quaCua', 'khaiCu'];

/* Cửa 1 — mười ba trên mười ba, không có điểm bán phần. */
export const SO_TH_C1 = 13;
/* Cửa 2 — hai mươi bài, đạt từ 90% số bài. */
export const SO_BAI_C2 = 20;
export const NGUONG_C2 = 0.9;
/* Cửa 3 — ba cuộc gọi, khách nói từ 80% thời lượng. */
export const SO_GOI_C3 = 3;
export const TY_KHACH_C3 = 0.8;

/* Mười ba tình huống thử, mỗi điều đúng một. Ô thứ hai đối chiếu
   thẳng với BN_HIENPHAP — thiếu một điều thì bài thi vẫn xưng là 13/13
   trong khi nó chỉ thử mười hai điều, và chỗ thiếu không lộ ra ở đâu. */
export const C1_TH = [
  ['TH01', 'HP01'], ['TH02', 'HP02'], ['TH03', 'HP03'], ['TH04', 'HP04'],
  ['TH05', 'HP05'], ['TH06', 'HP06'], ['TH07', 'HP07'], ['TH08', 'HP08'],
  ['TH09', 'HP09'], ['TH10', 'HP10'], ['TH11', 'HP11'], ['TH12', 'HP12'],
  ['TH13', 'HP13']
];

export const MA_CHAN = ['CHUAQUACUA', 'KEMCHUADU', 'CHUADOC_R9', 'TUKHAI', 'CATHAT'];

/* Cột KHÔNG được có trong bảng ba cửa. Cùng luật với cột `conHan`
   không có trong theVungManh (9.99.63) và cột `den` không có trong
   hoSoSongSinh (9.99.66): một cột tóm tắt thì HOẶC bị gõ đè — và lúc
   ấy một phép đo biến thành một lời khai mà nhìn vẫn y hệt — HOẶC
   không ai gõ và nó cũ đi lặng lẽ, khai rằng một người đã đủ ba cửa
   trong khi cửa thứ ba của họ chưa từng mở. */
export const COT_CAM = ['daQuaBaCua', 'duocChamKhach', 'soCuaDaQua', 'dat3'];

function duocVaoCN(hoSo) {
  return /^R(0[1-9]|1[0-2])$/.test(String((hoSo || {}).role || ''));
}
function duocKhaiCu(hoSo) {
  return /^R0[12]$/.test(String((hoSo || {}).role || ''));
}

/* ═══════════════ CỬA 1 · HIẾN PHÁP ═══════════════

   ĐỒNG CHUẨN: hàm này KHÔNG nhận vai và không rẽ nhánh theo vai. Đó
   là chỗ có thể kiểm được của câu "Trainer, coach, tư vấn viên đều
   thi cùng một Hiến pháp 13 điều" — chia đề theo vai thì ba vai học
   ba bản, và ba bản trôi xa nhau mỗi bản một ít, không ai thấy, vì
   mỗi bên vẫn thi đạt.

   Trả về TÊN ĐIỀU sai, không trả về một phân số: 12/13 nghe như gần
   đạt, nhưng con số ấy không nói điều nào bị bỏ — mà điều bị bỏ có
   thể là Điều 13, điều duy nhất có hậu quả pháp lý. */
export function chamCua1(dung) {
  const ds = Array.isArray(dung) ? dung.map(x => String(x).trim()) : [];
  const la = ds.filter(m => !C1_TH.some(t => t[0] === m));
  if (la.length) return { ok: false, code: 'THLA', la,
    error: 'Mã tình huống không có trong bộ đề: ' + la.join(' · ') + '.' };

  const sai = C1_TH.filter(t => ds.indexOf(t[0]) < 0)
    .map(t => ({ th: t[0], dieu: t[1] }));

  return { ok: true, cua: 'C1', dat: sai.length === 0,
    soDung: SO_TH_C1 - sai.length, soPhai: SO_TH_C1,
    sai,
    vi: sai.length === 0
      ? 'Đủ mười ba trên mười ba.'
      : 'Chưa đạt. Điều chưa nắm: ' + sai.map(s => s.dieu).join(' · ') +
        '. Cửa 1 đạt là 13/13, không có điểm bán phần — một phân số không nói ' +
        'điều nào bị bỏ, mà điều bị bỏ có thể là điều duy nhất có hậu quả pháp lý.' };
}

/* ═══════════════ CỬA 2 · GIỌNG ═══════════════

   Hàng rào có MƯỜI điểm, mà máy chỉ đo được CHÍN — R9 (nhắc năng lực
   GITA chưa có) luôn là việc của người, và soatRao10 nói thẳng ra ở ô
   `nguoiPhaiDoc`.

   Chín điểm sạch chia cho mười ra đúng 90%, vừa đủ ngưỡng của cửa
   này, trong khi chưa ai đọc điểm thứ mười. Một con số đạt ngưỡng nhờ
   đúng chỗ chưa ai nhìn thì nó tệ hơn một con số thiếu — nên cửa này
   TREO chứ không chấm. Cùng luật với ô daGoNgoai (9.99.58) và cột lời
   khai của phễu (9.99.59). */
export function chamCua2(bai, maNguoi) {
  const ds = Array.isArray(bai) ? bai : [];
  if (ds.length !== SO_BAI_C2) return { ok: false, code: 'THIEUBAI',
    coBai: ds.length, phaiCo: SO_BAI_C2,
    error: 'Cửa 2 là hai mươi câu hỏi thật của phụ huynh, đang có ' + ds.length +
      '. Bớt bài đi thì tỷ lệ đạt dễ lên, mà ngưỡng thì vẫn giữ nguyên con số.' };

  /* Ai chưa có tên người đọc R9 — nêu SỐ THỨ TỰ bài, để người chấm
     biết đường tìm. */
  const chuaR9 = [];
  ds.forEach((b, i) => {
    const ai = String((b || {}).r9BoiAi || '').trim();
    if (!ai || (maNguoi && ai === String(maNguoi))) chuaR9.push(i + 1);
  });
  if (chuaR9.length) return { ok: false, code: 'CHUADOC_R9', bai: chuaR9,
    error: 'Bài ' + chuaR9.join(' · ') + ' chưa có tên người đọc điểm R9, hoặc ' +
      'người đọc chính là ứng viên. Máy đo được chín trên mười điểm của hàng rào; ' +
      'chín chia mười ra đúng 90%, vừa đủ ngưỡng của cửa này, nhờ đúng chỗ chưa ' +
      'ai nhìn. Nên cửa TREO cho tới khi có một cái tên.' };

  const cham = ds.map((b, i) => {
    const r = BoNao.soatRao10(String((b || {}).chu || ''), (b || {}).y);
    const r9 = String((b || {}).r9Dat || '') === 'dat';
    return { bai: i + 1, dat: r.dat && r9, pham: r.pham.map(p => p.ma),
      r9BoiAi: String(b.r9BoiAi).trim(), r9Dat: r9 };
  });

  const soDat = cham.filter(c => c.dat).length;
  const ty = soDat / SO_BAI_C2;
  return { ok: true, cua: 'C2', dat: ty >= NGUONG_C2,
    soDat, soPhai: SO_BAI_C2, ty, nguong: NGUONG_C2, cham,
    vi: ty >= NGUONG_C2
      ? 'Đạt ' + soDat + '/' + SO_BAI_C2 + ' bài, và cả hai mươi bài đều có người đọc R9.'
      : 'Mới ' + soDat + '/' + SO_BAI_C2 + ' bài sạch hàng rào, dưới ngưỡng ' +
        Math.round(NGUONG_C2 * 100) + '%.' };
}

/* ═══════════════ CỬA 3 · TRI KỶ ═══════════════

   Máy không nghe được cuộc gọi. Nhưng người kèm khai HAI CON SỐ PHÚT
   chứ không khai một tỷ lệ: một tỷ lệ gõ thẳng vào là một lời phán,
   hai quãng thời gian là hai thứ quan sát được, và phép chia thì để
   máy làm.

   ĐO TỪNG CUỘC, không lấy trung bình ba cuộc. Trung bình thì một cuộc
   khách nói gần hết gánh được hai cuộc người GITA nói gần hết — mà
   thứ cửa này đo là một THÓI QUEN, và một thói quen thì phải đúng ở
   cả ba lần. */
export function chamCua3(goi, maNguoi) {
  const ds = Array.isArray(goi) ? goi : [];
  if (ds.length !== SO_GOI_C3) return { ok: false, code: 'THIEUGOI',
    coGoi: ds.length, phaiCo: SO_GOI_C3,
    error: 'Cửa 3 là ba cuộc gọi thật có người kèm, đang có ' + ds.length + '.' };

  const tuKhai = [];
  const thieu = [];
  ds.forEach((g, i) => {
    const o = g || {};
    const ai = String(o.boiAi || '').trim();
    if (!ai) { thieu.push(i + 1); return; }
    if (maNguoi && ai === String(maNguoi)) tuKhai.push(i + 1);
    const k = Number(o.phutKhach), t = Number(o.phutGITA);
    if (!(k >= 0) || !(t >= 0) || (k + t) <= 0) thieu.push(i + 1);
  });

  if (tuKhai.length) return { ok: false, code: 'TUKHAI', goi: tuKhai,
    error: 'Cuộc ' + tuKhai.join(' · ') + ' khai người kèm chính là ứng viên. ' +
      'Một dòng tự khai mình đã được kèm thì cửa thứ ba chỉ còn là một ô tích.' };

  if (thieu.length) return { ok: false, code: 'THIEUPHUT', goi: thieu,
    error: 'Cuộc ' + thieu.join(' · ') + ' thiếu tên người kèm hoặc thiếu hai con ' +
      'số phút. Người kèm khai HAI QUÃNG THỜI GIAN, không khai một tỷ lệ: một tỷ ' +
      'lệ gõ thẳng vào là một lời phán, hai quãng thời gian thì quan sát được.' };

  const cham = ds.map((g, i) => {
    const k = Number(g.phutKhach), t = Number(g.phutGITA);
    const ty = k / (k + t);
    return { goi: i + 1, boiAi: String(g.boiAi).trim(), phutKhach: k, phutGITA: t,
      tyKhach: ty, dat: ty >= TY_KHACH_C3 };
  });

  const chua = cham.filter(c => !c.dat).map(c => c.goi);
  return { ok: true, cua: 'C3', dat: chua.length === 0, cham,
    nguong: TY_KHACH_C3,
    vi: chua.length === 0
      ? 'Cả ba cuộc khách nói từ ' + Math.round(TY_KHACH_C3 * 100) + '% trở lên.'
      : 'Cuộc ' + chua.join(' · ') + ' khách nói dưới ' +
        Math.round(TY_KHACH_C3 * 100) + '%. Đo TỪNG cuộc chứ không lấy trung bình ' +
        'ba cuộc: thứ cửa này đo là một thói quen, và một thói quen thì phải đúng ' +
        'ở cả ba lần.' };
}

/* ═══════════════ ĐỌC BA CỬA CỦA MỘT NGƯỜI ═══════════════

   Tính LÚC ĐỌC từ ba dòng, không đọc một cột tóm tắt — bảng không có
   cột ấy, và COT_CAM nói rõ vì sao. */
async function docDongBaCua(db, maNguoi) {
  const r = await db.prepare(
    /* rowid ASC phá hoà: trạng thái mỗi cửa = dòng CUỐI; cùng lớp lỗi 9.99.112. */
    'SELECT cua, nguon, ngayQua, boiAi, ghiChu, ghiLuc FROM baCuaConNguoi' +
    ' WHERE maNguoi = ? ORDER BY ghiLuc ASC, rowid ASC').bind(String(maNguoi)).all();
  const ds = (r.results || r || []);
  const theoCua = {};
  ds.forEach(d => { theoCua[d.cua] = d; });
  const thieu = CUA.filter(c => !theoCua[c]);
  return { ds, theoCua, thieu, du: thieu.length === 0,
    coKhaiCu: ds.some(d => d.nguon === 'khaiCu') };
}

export async function docBaCua(y, env, db, hoSo) {
  if (!duocVaoCN(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Cổng Ba cửa mở cho R01–R12.' };
  const maNguoi = String((y || {}).maNguoi || hoSo.u || '').trim();
  if (!maNguoi) return { ok: false, error: 'Thiếu tên người.' };

  const t = await docDongBaCua(db, maNguoi);
  return { ok: true, maNguoi, du: t.du, thieu: t.thieu, ds: t.ds,
    /* Nêu riêng phần KHAI CŨ, không gộp vào một con số "đã đủ". Gộp
       thì một người được khai hộ cả ba cửa nằm chung rổ với một người
       đã làm đủ ba bài — và sau vài tháng cả bảng trông như đã đo hết. */
    soKhaiCu: t.ds.filter(d => d.nguon === 'khaiCu').length,
    vi: t.du
      ? (t.coKhaiCu
        ? 'Đủ ba cửa, nhưng có dòng mang nguồn khaiCu — đó là LỜI KHAI, không phải phép đo.'
        : 'Đủ ba cửa, cả ba đều qua trong hệ.')
      : 'Còn thiếu: ' + t.thieu.join(' · ') + '. Chưa đủ ba cửa thì không chạm ' +
        'khách một mình.' };
}

/* ═══════════════ CỔNG · CHẠM KHÁCH MỘT MÌNH ═══════════════

   Gọi từ ghiCham. Trả về `{ duoc: true }` hoặc một dòng chặn — và
   dòng chặn nói cả đường đi tiếp, vì một mã chặn không nói lý do thì
   người bị chặn đi tìm đường vòng chứ không đi sửa.

   Đường mở duy nhất là CÓ NGƯỜI KÈM, và người kèm phải đã qua đủ ba
   cửa: kèm bằng một người chưa qua cửa là nhân đôi chỗ hở chứ không
   bịt nó. */
export async function soatChamKhach({ maNguoi, nguoiKem }, db) {
  const ai = String(maNguoi || '').trim();
  if (!ai) return { duoc: false, code: 'CHUAQUACUA',
    error: 'Không biết ai đang chạm. Lượt chạm không có tên người thì cổng ba cửa ' +
      'không soi được gì.' };

  const t = await docDongBaCua(db, ai);
  if (t.du) return { duoc: true, tuMinh: true };

  const kem = String(nguoiKem || '').trim();
  if (!kem) return { duoc: false, code: 'CHUAQUACUA', thieu: t.thieu,
    error: ai + ' chưa qua đủ ba cửa (còn ' + t.thieu.join(' · ') + '), nên không ' +
      'được chạm khách MỘT MÌNH. Không ngoại lệ, kể cả khi thiếu người — thiếu ' +
      'người là lý do hay gặp nhất, nên nếu nó được tính là ngoại lệ thì nó thành ' +
      'lối đi chính. Đường mở duy nhất: khai ô nguoiKem, và người kèm phải đã qua ' +
      'đủ ba cửa.' };

  if (kem === ai) return { duoc: false, code: 'TUKHAI',
    error: 'Người kèm khai chính là người chạm. Kèm chính mình thì cổng này chỉ ' +
      'còn là một ô để gõ tên vào.' };

  const k = await docDongBaCua(db, kem);
  if (!k.du) return { duoc: false, code: 'KEMCHUADU', thieu: k.thieu, nguoiKem: kem,
    error: 'Người kèm ' + kem + ' cũng chưa qua đủ ba cửa (còn ' +
      k.thieu.join(' · ') + '). Kèm bằng một người chưa qua cửa là nhân đôi chỗ ' +
      'hở chứ không bịt nó.' };

  return { duoc: true, tuMinh: false, nguoiKem: kem };
}

/* ═══════════════ GHI MỘT CỬA ĐÃ QUA ═══════════════ */
export async function ghiCua(y, env, db, hoSo) {
  if (!duocVaoCN(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Cổng Ba cửa mở cho R01–R12.' };

  const x = y || {};
  const maNguoi = String(x.maNguoi || '').trim();
  const cua = String(x.cua || '').trim();
  if (!maNguoi || CUA.indexOf(cua) < 0) return { ok: false, code: 'THIEUO',
    error: 'Thiếu tên người, hoặc mã cửa không phải C1 · C2 · C3.' };

  /* Máy CHẤM LẠI, không nhận một ô "đã đạt" do người gọi truyền vào.
     Một cái cờ do người gọi truyền vào là một lời khai, và lời khai
     bật được mà không làm gì cả — cùng cái bẫy đã ghi ở daDocThe của
     Phân hệ 2 (9.99.64). */
  let kq;
  if (cua === 'C1') kq = chamCua1(x.dung);
  else if (cua === 'C2') kq = chamCua2(x.bai, maNguoi);
  else kq = chamCua3(x.goi, maNguoi);
  if (!kq.ok) return kq;
  if (!kq.dat) return { ok: false, code: 'CHUADAT', cua, cham: kq,
    error: kq.vi };

  const boiAi = String(x.boiAi || hoSo.u || '').trim();
  if (!boiAi) return { ok: false, code: 'THIEUNGUOICHAM',
    error: 'Thiếu tên người chấm.' };

  const id = 'BC-' + Date.now().toString(36) + '-' +
    Math.random().toString(36).slice(2, 6);
  const ghiLuc = new Date().toISOString();
  await db.prepare(
    'INSERT INTO baCuaConNguoi (id,maNguoi,cua,nguon,ngayQua,boiAi,ghiChu,ghiLuc)' +
    ' VALUES (?,?,?,?,?,?,?,?)')
    .bind(id, maNguoi, cua, 'quaCua', String(x.ngayQua || ghiLuc).slice(0, 10),
      boiAi, String(x.ghiChu || '').trim() || null, ghiLuc).run();

  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'CN_CUA',
    doiTuong: maNguoi, chiTiet: cua + ' · quaCua · chấm bởi ' + boiAi });

  return { ok: true, id, maNguoi, cua, nguon: 'quaCua', cham: kq };
}

/* ═══════════════ KHAI HỘ CỬA ĐÃ QUA TỪ TRƯỚC ═══════════════

   Đây là đường cho người đã làm nghề trước khi có cổng. Nó mở được
   cổng, nhưng nó KHÔNG đổi thành một phép đo: dòng mang `khaiCu`, và
   sổ đọc ra được là dòng nào thuộc loại nào. */
export async function lapBaCua(y, env, db, hoSo) {
  if (!duocKhaiCu(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Chỉ R01–R02 khai hộ được cửa đã qua từ trước. Khai hộ là nói thay cho ' +
      'một phép đo chưa từng chạy, nên nó phải có một cái tên chịu trách nhiệm.' };

  const x = y || {};
  const maNguoi = String(x.maNguoi || '').trim();
  const cua = String(x.cua || '').trim();
  const canCu = String(x.canCu || '').trim();
  if (!maNguoi || CUA.indexOf(cua) < 0) return { ok: false, code: 'THIEUO',
    error: 'Thiếu tên người, hoặc mã cửa không phải C1 · C2 · C3.' };
  if (canCu.length < 10) return { ok: false, code: 'THIEUCANCU',
    error: 'Khai hộ phải viết CĂN CỨ: người này đã làm gì để coi là qua cửa ấy. ' +
      'Khai không căn cứ thì sau này không ai truy được vì sao một người được mở ' +
      'cổng — và lúc có chuyện thì đó đúng là câu hỏi đầu tiên.' };

  const id = 'BC-' + Date.now().toString(36) + '-' +
    Math.random().toString(36).slice(2, 6);
  const ghiLuc = new Date().toISOString();
  await db.prepare(
    'INSERT INTO baCuaConNguoi (id,maNguoi,cua,nguon,ngayQua,boiAi,ghiChu,ghiLuc)' +
    ' VALUES (?,?,?,?,?,?,?,?)')
    .bind(id, maNguoi, cua, 'khaiCu', String(x.ngayQua || ghiLuc).slice(0, 10),
      String(hoSo.u || ''), canCu, ghiLuc).run();

  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'CN_KHAICU',
    doiTuong: maNguoi, chiTiet: cua + ' · khaiCu · ' + canCu.slice(0, 80) });

  return { ok: true, id, maNguoi, cua, nguon: 'khaiCu',
    vi: 'Đã ghi một dòng LỜI KHAI. Nó mở được cổng, nhưng nó không phải phép đo, ' +
      'và sổ sẽ luôn đọc ra được điều ấy.' };
}

/* ═══════════════ BÀI TUẦN ═══════════════

   ══ CHỖ CẢ BÀI TUẦN DỄ MỤC NHẤT ══

   Một "bản trả lời sai" mà hàng rào chấm SẠCH thì nó không sai — nó
   chỉ là một cách nói khác, và đội ngũ học được rằng cái sai là chuyện
   cảm tính. Nên máy chạy hàng rào trên bản sai và ĐÒI NÓ ĐỎ.

   Hai phép đo ngược chiều nhau trên cùng một bộ dò: bản mẫu phải
   sạch, bản sai phải đỏ. Bộ dò hỏng thì một trong hai phía đỏ ngay,
   chứ không im cả hai. */
export function soatTuan(bai) {
  const b = bai || {};
  const ca = Array.isArray(b.ca) ? b.ca : [];
  const thi = Array.isArray(b.thi) ? b.thi : [];
  const loi = [];

  if (ca.length !== 5) loi.push({ ma: 'SOCA', vi: 'Bài tuần có ĐÚNG năm ca thật, đang có ' + ca.length + '.' });

  const dieuCo = BoNao.HIENPHAP.map(d => d[1]);

  ca.forEach((c, i) => {
    const o = c || {};
    const n = i + 1;

    /* Ca thật là chuyện của một gia đình thật. Soi bằng chính cửa
       Điều 13, không dựng bộ dò thứ hai. */
    const ra = BoNao.soatRaNgoai(String(o.chuyen || ''));
    if (!ra.sach) loi.push({ ma: 'CATHAT', ca: n,
      vi: 'Ca ' + n + ' còn dấu vết nhận dạng được: ' +
        ra.ngo.map(g => g.ma).join(' · ') + '. Bài tuần đi tới hai chục người, ' +
        'và sau đó không còn cổng nào nữa.' });

    const mau = BoNao.soatRao10(String(o.mau || ''), { laTraLoiKhach: true });
    if (!mau.dat) loi.push({ ma: 'MAUKHONGDAT', ca: n,
      vi: 'Bản MẪU của ca ' + n + ' phạm hàng rào: ' +
        mau.pham.map(p => p.ma).join(' · ') + '. Một bản mẫu phạm hàng rào dạy ' +
        'đúng cái đang bị cấm, và nó dạy mạnh hơn mọi lời dặn vì nó được gắn ' +
        'nhãn "mẫu".' });

    const sai = BoNao.soatRao10(String(o.sai || ''), { laTraLoiKhach: true });
    if (sai.dat) loi.push({ ma: 'SAIKHONGSAI', ca: n,
      vi: 'Bản SAI của ca ' + n + ' được hàng rào chấm sạch — tức là nó không ' +
        'sai, nó chỉ là một cách nói khác. Đội ngũ đọc xong sẽ học rằng cái sai ' +
        'là chuyện cảm tính.' });

    const dp = Array.isArray(o.dieuPham) ? o.dieuPham.map(x => String(x).trim()) : [];
    if (!dp.length) loi.push({ ma: 'THIEUDIEU', ca: n,
      vi: 'Bản sai của ca ' + n + ' không chỉ ra vi phạm điều nào. Một bản sai ' +
        'không gọi tên điều thì nó chỉ nói "cái này sai", và người học không mang ' +
        'được gì sang ca sau.' });
    const dLa = dp.filter(m => dieuCo.indexOf(m) < 0);
    if (dLa.length) loi.push({ ma: 'DIEULA', ca: n,
      vi: 'Ca ' + n + ' ghi mã điều không có trong Hiến pháp: ' + dLa.join(' · ') +
        '. Bài tuần vẫn trông đầy đủ, và người học đi tìm một điều không tồn tại.' });
  });

  if (thi.length !== 10) loi.push({ ma: 'SOTHI',
    vi: 'Bài thi ngắn có ĐÚNG mười câu, đang có ' + thi.length + '.' });
  const thieuDap = thi.map((c, i) => ({ c, i }))
    .filter(x => !String((x.c || {}).dap || '').trim()).map(x => x.i + 1);
  if (thieuDap.length) loi.push({ ma: 'THIEUDAP',
    vi: 'Câu ' + thieuDap.join(' · ') + ' của bài thi chưa có đáp án.' });

  return { ok: true, dat: loi.length === 0, loi,
    vi: loi.length === 0
      ? 'Bài tuần đủ bốn phần: năm ca đã ẩn danh, năm bản mẫu sạch hàng rào, năm ' +
        'bản sai thật sự đỏ và gọi đúng tên điều, mười câu thi có đáp án.'
      : loi.length + ' chỗ phải sửa trước khi gửi cho đội ngũ.' };
}

export async function soatBaiTuan(y, env, db, hoSo) {
  if (!duocVaoCN(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Cổng Ba cửa mở cho R01–R12.' };
  const kq = soatTuan((y || {}).bai);
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'CN_TUAN',
    doiTuong: String((y || {}).tuan || ''),
    chiTiet: kq.dat ? 'đạt' : kq.loi.map(l => l.ma).join(' · ') });
  return { ok: true, ...kq,
    mayKhongChonCa: 'Máy KHÔNG tự chọn năm ca. Chọn ca là quyết định về việc gia ' +
      'đình nào được đem ra dạy — một quyết định về người, không phải một phép lọc.' };
}
