/* ═══════════════════════════════════════════════════════════════
   GITA 365 — HỆ ĐIỀU HÀNH CẤP ĐIỀU HÀNH, PHẦN CHẠY Ở MÁY CHỦ

   Bản chép của G.HDH_* — bộ kiểm mục 88 đối chiếu từng ô với kho.

   ══ MÔ-ĐUN NÀY KHÔNG TỰ TÍNH MỘT CON SỐ NÀO ══

   Chín chỉ số máy đo của bảng điều khiển đều GỌI THẲNG cửa đã có:
   `bayConSoCEO` · `docSongSinh` · `soatVungManh` · `chamKpiTaiChinh` ·
   `doPheuThiGiac`. Chép công thức số-tháng-sống sang đây thì sửa luật
   tài chính ở một chỗ mà bảng điều khiển vẫn nói con số cũ — và không
   ai biết là nó cũ, vì cả hai chỗ đều trông đúng.

   Mục 88 canh chỗ ấy hai lớp: mô-đun không khai một hằng số ngưỡng
   tiền nào, và mỗi tên cửa trong kho được đối chiếu với danh sách cửa
   THẬT của máy chủ — một bảng điều khiển trỏ vào một cửa không tồn
   tại thì ô ấy trống, mà một ô trống trong một bảng số đọc ra là số
   KHÔNG.
   ═══════════════════════════════════════════════════════════════ */

import { Kho } from './nen.js';
import * as BoNao from './bo-nao.js';

/* ═══════════════ BẢN CHÉP CỦA KHO ═══════════════ */

export const NHIP = ['N1', 'N2', 'N3', 'N4'];
export const CHISO12 = ['C01', 'C02', 'C03', 'C04', 'C05', 'C06',
  'C07', 'C08', 'C09', 'C10', 'C11', 'C12'];
/* Ba chỉ số NGƯỜI KHAI — nêu riêng, không xếp lẫn chín chỉ số đo
   được. Một con số gõ tay đặt cạnh một con số đo được, cùng hàng cùng
   kiểu chữ, thì người đọc tin cả hai như nhau. */
export const CHISO_NGUOI_KHAI = ['C07', 'C10', 'C12'];
export const QUYET5 = ['B1', 'B2', 'B3', 'B4', 'B5'];
export const CHANG = ['CH1', 'CH2', 'CH3', 'CH4', 'CH5'];
export const LENH4 = ['L1', 'L2', 'L3', 'L4'];
export const THUOC_TUAN = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8'];

/* Bản tin sáng đúng MỘT màn hình. */
export const TRAN_DUYET_SANG = 5;
/* Ba gia đình của nhịp tháng, máy BỐC chứ người không chọn. */
export const SO_NHA_GOI_THANG = 3;
/* Hai ghế duy nhất có quyền phủ quyết — trỏ sang BN_GHE, không khai lại. */
export const GHE_PHU_QUYET = ['G5', 'G7'];

function duocVaoHDH(hoSo) {
  return /^R0[1-3]$/.test(String((hoSo || {}).role || ''));
}

/* ═══════════════ BẢNG ĐIỀU KHIỂN 12 CHỈ SỐ ═══════════════

   Trả về HAI NGĂN, không trả một bảng mười hai dòng. Chín con số đo
   được và ba con số người khai không được nằm cùng một bảng — cùng
   luật với phễu của trợ lý hình ảnh (9.99.59) và bảy con số CEO
   (9.99.67).

   Và ba chỉ số người khai KHÔNG được trả về với giá trị 0 khi chưa ai
   nhập: một số 0 nằm cạnh chín số đo được đọc ra là "chưa ai làm việc
   tử tế nào", không đọc ra là "chưa ai nhập". */
export async function docBangDieuKhien(y, env, db, hoSo) {
  if (!duocVaoHDH(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Bảng điều khiển điều hành mở cho R01–R03.' };

  const x = y || {};
  const khai = (x.nguoiKhai && typeof x.nguoiKhai === 'object') ? x.nguoiKhai : {};

  /* Mỗi chỉ số đo được nói TÊN CỬA của nó. Mô-đun không gọi hộ ở đây
     vì mỗi cửa có cổng quyền riêng và có tham số riêng — gọi hộ là
     dựng một lớp trung gian phải nhớ cả năm chữ ký hàm, và lớp ấy sẽ
     lệch đi ở bản sau. Cái mô-đun này làm là KHAI đường đi, và bộ
     kiểm đối chiếu đường ấy với cửa thật. */
  const doDuoc = CHISO12.filter(m => CHISO_NGUOI_KHAI.indexOf(m) < 0);

  const loiKhai = CHISO_NGUOI_KHAI.map(m => {
    const v = khai[m];
    /* Bỏ hẳn khoá khi chưa ai nhập, không ghi 0. */
    return (v === undefined || v === null || v === '')
      ? { ma: m, chuaNhap: true }
      : { ma: m, giaTri: v, boiAi: String(x.boiAi || hoSo.u || '') };
  });

  const chuaNhap = loiKhai.filter(d => d.chuaNhap).map(d => d.ma);

  return { ok: true,
    doDuoc, loiKhai,
    tranManHinh: CHISO12.length,
    vi: doDuoc.length + ' chỉ số ĐO ĐƯỢC (gọi thẳng cửa đã có, không tính lại) · ' +
      CHISO_NGUOI_KHAI.length + ' chỉ số NGƯỜI KHAI, nêu ở ngăn riêng' +
      (chuaNhap.length ? ' · chưa ai nhập: ' + chuaNhap.join(' · ') : ''),
    khongTronHaiLoai: 'Ba chỉ số người khai nằm ngăn riêng. Đặt một con số gõ tay ' +
      'cạnh một con số đo được, cùng hàng cùng kiểu chữ, thì người đọc tin cả hai ' +
      'như nhau — mà con số gõ tay thì gõ nhầm được, gõ đẹp lên được, hoặc quên gõ ' +
      'mà hàng vẫn đầy.' };
}

/* ═══════════════ BẢN TIN SÁNG ═══════════════

   Đúng MỘT màn hình, tối đa năm mục cần duyệt.

   CẮT IM LẶNG Ở CON SỐ NĂM LÀ TỆ HƠN TRÌNH RA BA MƯƠI: người đọc tin
   rằng hôm nay chỉ có năm việc, và hai mươi lăm việc kia không ai
   biết là có. Nên máy trình năm mục gấp nhất và NÓI RA còn bao nhiêu. */
export async function banTinSang(y, env, db, hoSo) {
  if (!duocVaoHDH(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Bản tin sáng mở cho R01–R03.' };

  const x = y || {};
  const cho = Array.isArray(x.choDuyet) ? x.choDuyet : [];
  /* Xếp GẤP lên trước, rồi mới tới thứ tự đến. Xếp theo thứ tự đến
     thì mục gấp nhất nằm dưới cùng, và người đọc lướt tới đó lúc đã
     hết chú ý — cùng lý do mười tờ ứng phó xếp tờ GẤP lên trước. */
  const xep = cho.slice().sort((a, b) =>
    (b && b.gap ? 1 : 0) - (a && a.gap ? 1 : 0));
  const trinh = xep.slice(0, TRAN_DUYET_SANG);
  const conLai = Math.max(xep.length - TRAN_DUYET_SANG, 0);

  return { ok: true,
    denDo: Array.isArray(x.denDo) ? x.denDo : [],
    choDuyet: trinh,
    conLaiChuaTrinh: conLai,
    soDoiBatThuong: Array.isArray(x.soLa) ? x.soLa : [],
    cauDangDoc: String(x.cauKhach || '').trim() || undefined,
    vi: conLai
      ? 'Trình ' + trinh.length + ' mục gấp nhất, CÒN ' + conLai + ' mục nữa chưa ' +
        'trình. Cắt im lặng ở con số năm là tệ hơn trình ra ba mươi: người đọc tin ' +
        'rằng hôm nay chỉ có năm việc.'
      : trinh.length + ' mục cần duyệt, vừa một màn hình.' };
}

/* ═══════════════ BA GIA ĐÌNH CỦA NHỊP THÁNG ═══════════════

   Máy BỐC, người không chọn. Để người chọn thì họ chọn ba nhà đang
   vui — không ai nói dối câu nào mà cả phép kiểm vẫn mất nghĩa.

   Cửa này CỐ Ý không nhận một ô lọc nào. Nhận `chiNhaXanh` hay
   `tru` thì phép bốc ngẫu nhiên chỉ còn là một cái tên. */
export const O_LOC_CAM = ['chiNha', 'loc', 'tru', 'chiDen', 'chonTay'];

export async function chonBaNhaNgauNhien(y, env, db, hoSo) {
  if (!duocVaoHDH(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Nhịp tháng mở cho R01–R03.' };

  const x = y || {};
  const loc = O_LOC_CAM.filter(k => x[k] !== undefined);
  if (loc.length) return { ok: false, code: 'COLOC', loc,
    error: 'Cửa này KHÔNG nhận ô lọc: ' + loc.join(' · ') + '. Ba gia đình của nhịp ' +
      'tháng do máy BỐC. Để người chọn thì họ chọn ba nhà đang vui — không ai nói ' +
      'dối câu nào mà cả phép kiểm vẫn mất nghĩa, và đó đúng là chỗ nguy hiểm nhất: ' +
      'một phép kiểm hỏng mà vẫn báo xanh.' };

  const r = await db.prepare(
    'SELECT maNha FROM hoSoSongSinh ORDER BY RANDOM() LIMIT ?')
    .bind(SO_NHA_GOI_THANG).all();
  const ds = (r.results || r || []).map(d => d.maNha);

  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'HDH_BOCNHA',
    doiTuong: ds.join(' · '), chiTiet: 'nhịp tháng, máy bốc' });

  return { ok: true, nha: ds, so: ds.length, phaiCo: SO_NHA_GOI_THANG,
    aiGoi: 'Chủ hệ gọi, KHÔNG uỷ quyền.',
    vi: ds.length < SO_NHA_GOI_THANG
      ? 'Sổ mới có ' + ds.length + ' nhà, chưa đủ ' + SO_NHA_GOI_THANG + '.'
      : 'Đã bốc ' + ds.length + ' nhà. Máy bốc và ghi vào nhật ký NGAY — bốc lại cho ' +
        'tới khi ra ba nhà vừa ý thì mỗi lượt bốc đều nằm trong sổ.' };
}

/* ═══════════════ NĂM BƯỚC RA QUYẾT ĐỊNH ═══════════════

   Ba cái răng, và cái thứ nhất là cái khó làm giả nhất:

   1. Bước 3 (hỏi ngược) phải có mốc thời gian SỚM HƠN bước 5. Viết
      sau khi quyết thì nó không còn là phép dự phòng — nó là một lời
      biện minh, và nó luôn nghe rất hợp lý. Máy so HAI MỐC, không đọc
      một ô tự khai "đã hỏi ngược rồi".
   2. Ba phương án, và MỘT phương án khai `khongLamGi`. Hai phương án
      là một câu hỏi có/không đội lốt một lựa chọn.
   3. Cờ ĐỎ của ghế 5 hoặc ghế 7 thì DỪNG. */
export function soatQuyetDinh(d) {
  const q = d || {};
  const loi = [];

  if (!String(q.hoiDat || '').trim())
    loi.push({ ma: 'B1', vi: 'Chưa đặt lại câu hỏi. Một nửa quyết định sai là vì ' +
      'trả lời ĐÚNG một câu hỏi SAI.' });

  const pa = Array.isArray(q.phuongAn) ? q.phuongAn : [];
  if (pa.length < 3)
    loi.push({ ma: 'B2', vi: 'Mới ' + pa.length + ' phương án. Phải từ BA — hai ' +
      'phương án là một câu hỏi có/không đội lốt một lựa chọn.' });
  if (!pa.some(p => (p || {}).khongLamGi === true))
    loi.push({ ma: 'B2', vi: 'Không có phương án "KHÔNG LÀM GÌ". Nó thường là ' +
      'phương án đúng, mà nó không bao giờ tự xuất hiện — không ai họp để đề xuất ' +
      'đừng làm gì cả.' });

  const hn = String(q.hoiNguoc || '').trim();
  if (!hn)
    loi.push({ ma: 'B3', vi: 'Chưa viết câu hỏi ngược: nếu một năm nữa việc này ' +
      'thất bại, lý do khả dĩ nhất là gì?' });

  /* HAI MỐC THỜI GIAN, không một ô tự khai. */
  const tHN = Date.parse(q.hoiNgucLuc || q.hoiNguocLuc || '');
  const tQ = Date.parse(q.quyetLuc || '');
  if (hn && q.quyetLuc && (!tHN || tHN >= tQ))
    loi.push({ ma: 'B3', vi: 'Câu hỏi ngược được ghi SAU hoặc CÙNG LÚC với quyết ' +
      'định. Viết sau khi quyết thì nó không còn là phép dự phòng — nó là một lời ' +
      'biện minh, và nó luôn nghe rất hợp lý.' });

  const co = q.co || {};
  const thieuCo = GHE_PHU_QUYET.filter(g =>
    ['DO', 'VANG', 'XANH'].indexOf(String(co[g] || '')) < 0);
  if (thieuCo.length)
    loi.push({ ma: 'B4', vi: 'Ghế ' + thieuCo.join(' · ') + ' chưa cắm cờ. Hai ghế ' +
      'ấy là hai ghế DUY NHẤT có quyền phủ quyết.' });
  const coDo = GHE_PHU_QUYET.filter(g => String(co[g] || '') === 'DO');

  const thieuGhi = ['quyetGi', 'viSao', 'giaDinh', 'xemLaiKhi']
    .filter(k => !String(q[k] || '').trim());
  if (q.quyetLuc && thieuGhi.length)
    loi.push({ ma: 'B5', vi: 'Bước ghi thiếu ô: ' + thieuGhi.join(' · ') +
      '. Ô GIẢ ĐỊNH là ô quan trọng nhất — giả định sai thì đổi quyết định, mà muốn ' +
      'biết nó đã sai thì phải có ai đó viết nó ra từ đầu.' });

  if (coDo.length) return { ok: true, dat: false, dung: true, coDo, loi,
    vi: 'Ghế ' + coDo.join(' · ') + ' cắm cờ ĐỎ. DỪNG — không ghi bước 5. Một hệ mà ' +
      'tăng trưởng luôn thắng chất lượng thì nó nổ trong vòng hai năm.' };

  return { ok: true, dat: loi.length === 0, dung: false, coDo: [], loi,
    vi: loi.length === 0
      ? 'Đủ năm bước. Máy DỪNG ở đây — bước 5 là chữ ký của người, và mọi quyết định ' +
        'lớn nằm ở Vùng Đỏ.'
      : loi.length + ' chỗ chưa đủ.' };
}

/* SOI là ĐỌC, GHI là GHI — hai cửa, không một.

   Câu lệnh "Soi quyết định" phải chạy được mà KHÔNG ghi gì: người ta
   soi để biết mình đang thiếu bước nào, và một cửa soi mà cũng ghi
   thì nó ép người dùng chốt sớm hơn họ muốn. Cùng lối tách đã dùng ở
   docGopY / banMoiThiGiac của trợ lý hình ảnh (9.99.56) — và ở đó
   cũng đã ghi rõ: cái răng nằm ở cửa GHI, không ở cửa đọc. */
export async function soiQuyetDinh(y, env, db, hoSo) {
  if (!duocVaoHDH(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Cửa soi quyết định mở cho R01–R03.' };
  const kq = soatQuyetDinh((y || {}).quyet);
  return { ...kq, chiDoc: true,
    cuaGhi: 'ghiQuyetDinh',
    viChiDoc: 'Cửa này chỉ ĐỌC — nó nói thiếu bước nào và hai cờ đang màu gì, và nó ' +
      'không chặn gì vì nó không ghi. Cái răng nằm ở cửa GHI.' };
}

export async function ghiQuyetDinh(y, env, db, hoSo) {
  if (!duocVaoHDH(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Sổ quyết định lớn mở cho R01–R03.' };

  const q = (y || {}).quyet || {};
  const kq = soatQuyetDinh(q);
  if (kq.dung) return { ok: false, code: 'CODO', coDo: kq.coDo, error: kq.vi };
  if (!kq.dat) return { ok: false, code: 'CHUADU', loi: kq.loi,
    error: kq.vi + ' ' + kq.loi.map(l => l.ma + ': ' + l.vi).join(' ') };

  const id = 'QD-' + Date.now().toString(36) + '-' +
    Math.random().toString(36).slice(2, 6);
  await db.prepare(
    'INSERT INTO quyetDinhLon (id,hoiDat,soPhuongAn,hoiNguoc,hoiNguocLuc,coG5,coG7,' +
    'quyetGi,viSao,giaDinh,xemLaiKhi,quyetLuc,boiAi,ghiLuc) ' +
    'VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind(id, String(q.hoiDat), (q.phuongAn || []).length, String(q.hoiNguoc),
      String(q.hoiNgucLuc || q.hoiNguocLuc), String(q.co.G5), String(q.co.G7),
      String(q.quyetGi), String(q.viSao), String(q.giaDinh), String(q.xemLaiKhi),
      String(q.quyetLuc), String(hoSo.u || ''), new Date().toISOString()).run();

  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: hoSo.u, viec: 'HDH_QUYET',
    doiTuong: id, chiTiet: String(q.quyetGi).slice(0, 80) });

  return { ok: true, id, xemLaiKhi: String(q.xemLaiKhi),
    vi: 'Đã ghi. Ô giả định ở lại trong sổ — giả định sai thì đổi quyết định, không ' +
      'cố chấp.' };
}

/* ═══════════════ CHUYỂN CHẶNG ═══════════════

   Máy ĐO điều kiện và NÓI đủ hay chưa, rồi DỪNG. Chuyển chặng là
   quyết định về quy mô, và mọi quyết định về quy mô nằm ở Vùng Đỏ. */
export function soatChuyenChang(chang, so) {
  const c = String(chang || '');
  const i = CHANG.indexOf(c);
  if (i < 0) return { ok: false, code: 'CHANGLA',
    error: 'Chặng phải là ' + CHANG.join(' · ') + '.' };
  if (i === CHANG.length - 1) return { ok: true, chang: c, chotChang: true,
    vi: 'Đây là chặng cuối — không có chặng sau để chuyển sang.' };

  const s = so || {};
  const thieu = [];
  if (c === 'CH1') {
    if (!(Number(s.oLai90) >= 60)) thieu.push('tỷ lệ ở lại 90 ngày phải trên 60%');
    if (!(Number(s.tuGioiThieu) > 0)) thieu.push('phải có người tự giới thiệu');
  } else if (c === 'CH4') {
    if (!(Number(s.thangSong) > 12)) thieu.push('số tháng sống được phải trên 12');
  } else {
    return { ok: true, chang: c, du: false, nguoiDo: true,
      vi: 'Điều kiện qua chặng này KHÔNG đo được bằng một con số — phải chạy thật ' +
        'rồi chấm lại. Máy không kết luận thay.' };
  }

  return { ok: true, chang: c, du: thieu.length === 0, thieu,
    mayKhongChuyen: true,
    vi: thieu.length === 0
      ? 'ĐỦ điều kiện qua chặng sau. Máy dừng ở đây — chuyển chặng là một quyết định ' +
        'về quy mô, và mọi quyết định về quy mô nằm ở Vùng Đỏ.'
      : 'CHƯA đủ: ' + thieu.join(' · ') + '. Không sang chặng sau khi chỉ số chất ' +
        'lượng của chặng hiện tại chưa đạt — ngành giáo dục có nghĩa địa đầy những ' +
        'đơn vị nhảy cóc, và chết vì tai tiếng nhanh hơn nhiều so với chết vì chậm.' };
}

/* ═══════════════ "TÔI VẮNG BA NGÀY. CHUẨN BỊ." ═══════════════

   Câu lệnh đáng giá nhất trong bốn câu: một tổ chức chạy được khi
   người đứng đầu vắng ba ngày mới là một tổ chức thật.

   NGƯỠNG GỌI TRỎ THẲNG vào mười việc Vùng Đỏ của Bộ não và bảng đèn
   ba màu — KHÔNG dựng một danh sách thứ hai. Hai danh sách ngưỡng thì
   cái nào cũng tự tin, và lúc gấp thì người ta đọc cái nào gần tay
   hơn. Mục 88 canh rằng mô-đun này không khai một danh sách nào của
   riêng nó. */
export async function chuanBiVang(y, env, db, hoSo) {
  if (!duocVaoHDH(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Cửa chuẩn bị vắng mở cho R01–R03.' };

  const ngay = Math.max(Number((y || {}).ngay) || 3, 1);

  return { ok: true, ngay,
    /* Lấy THẲNG từ Bộ não, không chép. */
    nguongGoi: BoNao.DO10,
    denPhaiGoi: 'Mọi nhà lên đèn ĐỎ trong thời gian vắng — người thật gọi trong 24 ' +
      'giờ, không nhắn, không uỷ quyền cho máy.',
    vangVungVang: 'Việc Vùng Vàng cần duyệt TRƯỚC khi đi: mọi nội dung sắp đăng, ' +
      'thẻ Vùng Mạnh sắp giao, kế hoạch tuần của từng phân hệ.',
    aiThayGhe: undefined,
    choChu: 'HDH-02',
    viThieuAiThay: 'Ai ngồi thay ghế nào là một quyết định về NGƯỜI, và máy không ' +
      'gán người vào ghế. Bảy dòng ấy chờ chủ hệ — mục HDH-02. Khai bừa một cái tên ' +
      'thì lúc gấp người ấy không biết mình đang được trông đợi.',
    vi: 'Vắng ' + ngay + ' ngày. Ngưỡng gọi lấy ĐÚNG mười việc Vùng Đỏ của Hiến ' +
      'pháp, không thêm không bớt — hai danh sách ngưỡng thì lúc gấp người ta đọc ' +
      'cái nào gần tay hơn.' };
}

/* ═══════════════ TÁM THƯỚC ĐO HẰNG TUẦN ═══════════════

   Năm thước máy-đo đều TRỎ vào một điểm của hàng rào 10 điểm đã có.
   Không dựng bộ dò thứ hai — mục 88 đối chiếu từng mã rào với bảng
   rào thật của Bộ não. */
export function thuocTuan() {
  const raoCo = BoNao.RAO10.map(r => r[0]);
  return { ok: true, thuoc: THUOC_TUAN, raoCo,
    motTramKhongDungSai: 'Năm thước đích 100% KHÔNG có dung sai. Nới xuống 99% là bỏ ' +
      'hẳn phép canh — một phần trăm của một nghìn lượt là mười gia đình.' };
}
