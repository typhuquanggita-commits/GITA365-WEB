/* ═══════════════════════════════════════════════════════════════
   GITA 365 · CỬA VÀO MỚI — LƯƠNG PHÒNG KẾ TOÁN – TÀI CHÍNH

   Chốt của chủ hệ thống bản 9.99: "Các hoạt động thu, chi, lương
   thưởng, hoa hồng đều có căn cứ rõ ràng. Lập thêm hệ KPI cho phòng
   tài chính; cả KPI cho kế toán trưởng, kế toán thu, kế toán chi để có
   hình thức trả lương."

   Thu, chi và hoa hồng đã có sổ từ 9.9x. LƯƠNG thì tới bản này mới có:
   trước đó quyền fin_payroll đã khai trong bảng quyền mà không có một
   dòng máy chủ nào đứng sau nó — một cái tên quyền không mở ra cửa
   nào là một lời hứa suông trong bảng phân quyền.

   ══ MÁY ĐO ĐIỂM. MÁY KHÔNG QUY ĐIỂM RA TIỀN. ══

   TC_LUONG tự khai hai chỗ máy không quyết:

     L-01  số tiền của từng tầng lương cho từng vị trí
     L-02  điểm dưới 60 thì xử lý thế nào

   Tệp này KHÔNG quyết hộ chỗ nào trong hai chỗ ấy.

   L-01 thành một bảng để TRỐNG khi cài đặt. Chưa ai điền thì bảng
   lương vẫn chạy, vẫn ra điểm và bậc, nhưng phần tiền trả về null kèm
   đúng một câu: chưa có hệ số. Đặt một con số mặc định ở đây là máy tự
   quyết một chuyện nó vừa khai là mình không quyết được — và con số
   mặc định ấy sẽ thành lương thật của một người thật, vì không ai đi
   sửa một chỗ đã có số.

   L-02 thì khó hơn, vì nó cám dỗ: viết một dòng "điểm < 60 thì cắt
   phần KPI" là xong, và nó trông rất giống một luật. Nhưng chính
   TC_LUONG đã nói vì sao không được: "nhiều lần điểm thấp vì một chỗ
   hỏng của HỆ chứ không phải của người, và cắt lương ở đúng chỗ ấy là
   dạy người ta thôi báo cáo."

   Nên máy không cắt và cũng không tha. Nó CHẶN LƯỢT CHỐT lại và đòi
   người chốt ghi ra quyết định của mình cùng lý do — một câu, có tên
   người, ở lại trong dòng. Kỳ sau có ai hỏi thì câu ấy còn đó.

   ══ ĐÔNG CỨNG SỐ ĐO, KHÔNG ĐÔNG CỨNG MỖI CON SỐ ĐIỂM ══

   Luật cứng: "Điểm của một kỳ ĐÃ CHỐT thì không tính lại — cùng luật
   với sổ." Nên lượt chốt ghi lại SỐ ĐO THÔ của cả mười lăm thước.

   Lý do thứ nhất là dựng lại được. Lý do thứ hai mới là lý do thật:
   người bị trừ lương phải CÃI LẠI ĐƯỢC. Một bảng lương chỉ có một con
   số điểm là một bản án không có hồ sơ.

   ══ VÌ SAO NGƯỠNG VÀ TRỌNG SỐ CÓ MỘT BẢN CHÉP Ở ĐÂY ══

   Bản GỐC nằm ở G.TC_KPI trong kho đã mã hoá. Máy chủ không đọc được
   kho ấy — cùng lý do đã buộc GIA_TANG phải có bản chép ở tai-chinh.js
   từ 9.94.

   Chấm điểm ở máy khách rồi gửi số điểm lên là phá luật đầu tiên của
   TC-KP-01: "không thước nào do người tự khai". Máy khách là chỗ người
   dùng sửa được.

   Nên bản chép nằm ở đây, và mục 71 của bộ kiểm đối chiếu TỪNG Ô —
   ngưỡng, đơn vị, hướng tốt, trọng số — với bản gốc trong kho mỗi lần
   chạy. Lệch một ô thì đỏ, vì lệch một ô nghĩa là bảng lương trả theo
   một cái thước khác với cái thước người ta được đọc.
   ═══════════════════════════════════════════════════════════════ */

import { Kho, tokenMoi } from './nen.js';
import { quyenCua, VI_TRI_TC, capDuyetTheoTien } from './chi-tieu.js';
import { chamKpiTaiChinh } from './kpi-tai-chinh.js';

const BAC = {R01:1,R02:2,R03:3,R04:4,R05:5,R06:6,R07:7,R08:8,
             R09:9,R10:10,R11:11,R12:12,R13:13,R14:14,R15:15};

const dinhDang = n => Number(n).toLocaleString('vi-VN') + 'đ';

/* BẢN CHÉP CỦA G.TC_KPI — ngưỡng, đơn vị, hướng tốt, trọng số.
   Bản gốc ở kho-goc/data.kpi-tai-chinh.js. Mục 71 đối chiếu từng ô. */
const NGUONG_KPI = {
  keToanThu: [
    {ma: 'KT-T1', dat: 95, don: '%',     huongTot: 'cao',  trong: 30},
    {ma: 'KT-T2', dat: 0,  don: 'khoản', huongTot: 'thap', trong: 25},
    {ma: 'KT-T3', dat: 98, don: '%',     huongTot: 'cao',  trong: 20},
    {ma: 'KT-T4', dat: 0,  don: 'phiếu', huongTot: 'thap', trong: 15},
    {ma: 'KT-T5', dat: 90, don: '%',     huongTot: 'cao',  trong: 10}
  ],
  keToanChi: [
    {ma: 'KT-C1', dat: 85, don: '%',     huongTot: 'cao',  trong: 25},
    {ma: 'KT-C2', dat: 0,  don: 'khoản', huongTot: 'thap', trong: 20},
    {ma: 'KT-C3', dat: 0,  don: 'khoản', huongTot: 'thap', trong: 25},
    {ma: 'KT-C4', dat: 0,  don: 'ngày',  huongTot: 'thap', trong: 15},
    {ma: 'KT-C5', dat: 95, don: '%',     huongTot: 'cao',  trong: 15}
  ],
  keToanTruong: [
    {ma: 'KT-Tr1', dat: 100, don: '%',     huongTot: 'cao',  trong: 25},
    {ma: 'KT-Tr2', dat: 0,   don: 'kỳ',    huongTot: 'thap', trong: 25},
    {ma: 'KT-Tr3', dat: 0,   don: 'chỗ',   huongTot: 'thap', trong: 20},
    {ma: 'KT-Tr4', dat: 100, don: '%',     huongTot: 'cao',  trong: 20},
    {ma: 'KT-Tr5', dat: 0,   don: 'phiếu', huongTot: 'thap', trong: 10}
  ]
};

/* Bản chép của TC_LUONG.bacDiem. Ngưỡng là CHỮ chứ không phải công
   thức: mỗi bậc nói nghĩa của nó để người quản lý quyết. */
const BAC_DIEM = [
  {tu: 90, ten: 'Sổ sạch'},
  {tu: 75, ten: 'Sổ ổn'},
  {tu: 60, ten: 'Có chỗ hở'},
  {tu: 0,  ten: 'Sổ chưa dùng được'}
];

const NGUONG_NGOI_LAI = 60;   /* dưới mốc này thì lượt chốt đòi một quyết định */

function bacCua(diem) {
  if (diem === null || diem === undefined) return null;
  for (const b of BAC_DIEM) if (diem >= b.tu) return b.ten;
  return BAC_DIEM[BAC_DIEM.length - 1].ten;
}

/* ═══════════════ CHẤM MỘT THƯỚC ═══════════════

   Hai hướng, và chúng chấm ngược nhau:

     huongTot 'cao'  — càng cao càng tốt, ngưỡng là sàn (95% khớp)
     huongTot 'thap' — càng thấp càng tốt, ngưỡng là trần (0 khoản treo)

   ══ THƯỚC KHÔNG ĐO ĐƯỢC TRẢ VỀ null, VÀ null KHÔNG PHẢI 100 ══

   chamKpiTaiChinh trả null khi mẫu bằng 0 — một tháng không có phiếu
   chuyển khoản nào thì "tỷ lệ khớp sao kê" không có nghĩa gì. Cho nó
   100 là thưởng một tháng không ai làm gì; cho nó 0 là phạt một người
   vì việc không đến tay họ.

   Nên thước ấy RA KHỎI phép tính, và trọng số của nó chia lại cho
   những thước còn đo được. Phần trọng số bị bỏ ra được ghi lại, vì
   một bảng điểm dựng trên 30 trong 100 trọng số thì con số cuối cùng
   không nói được nhiều, và người đọc phải biết điều đó. */
function chamMotThuoc(gt, ng) {
  if (gt === null || gt === undefined) return null;
  const v = Number(gt);
  if (isNaN(v)) return null;

  if (ng.huongTot === 'thap') {
    /* Trần 0 là trần thường gặp nhất ở đây, nên không chia được cho
       ngưỡng. Đạt trần thì 100; mỗi đơn vị vượt trần trừ 20 điểm, chạm
       đáy ở 0 — năm khoản treo là mất sạch phần của thước ấy. */
    if (v <= ng.dat) return 100;
    return Math.max(0, 100 - (v - ng.dat) * 20);
  }
  if (v >= ng.dat) return 100;
  /* Dưới sàn thì chấm theo tỷ lệ so với sàn, không rơi thẳng về 0: rơi
     thẳng thì 94% và 10% cùng một điểm, và người đang ở 94 không thấy
     lý do gì để lên 95. */
  return ng.dat > 0 ? Math.max(0, Math.round(v / ng.dat * 100)) : 0;
}

/** Chấm cả một vị trí. Trả về điểm, từng thước, và phần trọng số bỏ ra. */
function chamViTri(soDo, viTri) {
  const ds = NGUONG_KPI[viTri] || [];
  const tung = [], boQua = [];
  let tong = 0, trongDung = 0;

  for (const ng of ds) {
    const d = chamMotThuoc(soDo ? soDo[ng.ma] : null, ng);
    if (d === null) { boQua.push(ng.ma); tung.push({ma: ng.ma, do: null, diem: null,
      trong: ng.trong, vi: 'Không có gì để đo trong kỳ'}); continue; }
    tong += d * ng.trong; trongDung += ng.trong;
    tung.push({ma: ng.ma, do: soDo[ng.ma], diem: d, trong: ng.trong,
      dat: ng.dat, don: ng.don, huongTot: ng.huongTot});
  }

  const diem = trongDung > 0 ? Math.round(tong / trongDung * 10) / 10 : null;
  return {diem, bac: bacCua(diem), tung,
    trongBoQua: 100 - trongDung, thuocBoQua: boQua};
}

/* ═══════════════ HỆ SỐ LƯƠNG — CÂU TRẢ LỜI L-01 ═══════════════ */

/** Dòng hệ số CÓ HIỆU LỰC cho một vị trí ở một kỳ.

    Đọc theo KỲ chứ không đọc dòng mới nhất: chốt lại bảng lương tháng
    Một vào tháng Sáu phải ra đúng con số của tháng Một, kể cả khi hệ
    số đã đổi hai lần ở giữa. */
async function heSoCua(db, viTri, ky) {
  /* rowid DESC phá hoà (9.99.114) — hai dòng cùng viTri+tuKy+datLuc thì
     không có mốc đơn điệu, fold trả về TÙY Ý một trong hai; đây là con số
     quyết định LƯƠNG, nên phải xác định. Cùng lớp lỗi đã vá ở theVungManh
     · bangGia · dongYDuLieu (9.99.112–113); đây là fold tiền còn sót. */
  return await db.prepare(
    'SELECT * FROM heSoLuong WHERE viTri = ? AND tuKy <= ? ' +
    'ORDER BY tuKy DESC, datLuc DESC, rowid DESC LIMIT 1'
  ).bind(viTri, ky).first();
}

export async function datHeSoLuong(y, env, db, hoSo) {
  /* CHỈ SUPER ADMIN. Hệ số lương là câu trả lời của CHỦ HỆ cho L-01,
     và TC_LUONG nói rõ đó là quyết định về ngân sách. Mở cho Giám đốc
     là để người tiêu ngân sách tự đặt ngân sách của mình. */
  if (hoSo.role !== 'R01') return {ok: false, code: 'NOPERM',
    error: 'Chỉ Super Admin đặt được hệ số lương. Đây là câu trả lời cho L-01 — ' +
           'một quyết định về ngân sách, không phải một tham số kỹ thuật.'};

  const h = y.heSo || {};
  const viTri = String(h.viTri || '').trim();
  if (!NGUONG_KPI[viTri]) return {ok: false,
    error: 'Vị trí phải là một trong: ' + Object.keys(NGUONG_KPI).join(', ') + '.'};

  const tuKy = String(h.tuKy || '').trim();
  if (!/^\d{4}-\d{2}$/.test(tuKy))
    return {ok: false, error: 'Kỳ hiệu lực phải có dạng YYYY-MM.'};

  const cung = Math.round(Number(h.luongCung || 0));
  const tran = Math.round(Number(h.tranKpi || 0));
  if (!(cung > 0)) return {ok: false, error: 'Lương cứng phải lớn hơn 0.'};
  if (!(tran >= 0)) return {ok: false, error: 'Trần phần KPI không được âm.'};

  const lyDo = String(h.lyDo || '').trim();
  if (lyDo.length < 10) return {ok: false,
    error: 'Ghi vì sao đặt con số này. Một mức lương không có lý do thì kỳ sau ' +
           'không ai bảo vệ được nó, kể cả người đã đặt.'};

  /* Không sửa đè dòng cũ. Đổi hệ số là ghi một dòng MỚI có hiệu lực từ
     một kỳ; dòng cũ ở lại để một bảng lương đã chốt còn giải thích được. */
  const id = 'HSL-' + tokenMoi().slice(0, 14);
  await db.prepare(
    'INSERT INTO heSoLuong (id,viTri,tuKy,luongCung,tranKpi,lyDo,boiAi,datLuc) ' +
    'VALUES (?,?,?,?,?,?,?,?)'
  ).bind(id, viTri, tuKy, cung, tran, lyDo.slice(0, 500), hoSo.u,
    new Date().toISOString()).run();

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'LUONG_HESO',
    doiTuong: id, chiTiet: viTri + ' từ ' + tuKy + ' · cứng ' + dinhDang(cung) +
      ' · trần KPI ' + dinhDang(tran)});
  return {ok: true, id, viTri, tuKy, luongCung: cung, tranKpi: tran};
}

export async function dsHeSoLuong(y, env, db, hoSo) {
  if ((BAC[hoSo.role] || 99) > 3) return {ok: false, code: 'NOPERM',
    error: 'Vai này không xem được bảng hệ số lương.'};
  const r = await db.prepare(
    'SELECT * FROM heSoLuong ORDER BY viTri, tuKy DESC LIMIT 200').all();
  const ds = (r.results || []).map(x => ({id: x.id, viTri: x.viTri,
    tenViTri: (VI_TRI_TC[x.viTri] || {}).ten || x.viTri,
    tuKy: x.tuKy, luongCung: x.luongCung, tranKpi: x.tranKpi,
    lyDo: x.lyDo, boiAi: x.boiAi, datLuc: x.datLuc}));
  const thieu = Object.keys(NGUONG_KPI).filter(v => !ds.some(x => x.viTri === v));
  return {ok: true, ds, ba_tang: 3,
    /* Nêu thẳng vị trí nào CHƯA có hệ số. Một bảng rỗng không nói được
       là chưa ai điền hay là không có vị trí nào. */
    chuaCoHeSo: thieu,
    choChuHeChot: thieu.length ? 'L-01 chưa chốt cho: ' + thieu.join(', ') : ''};
}

/* ═══════════════ BẢNG LƯƠNG MỘT KỲ ═══════════════ */

/** Ai được xem và chốt bảng lương.

    Bảng lương là chỗ tập trung nhất của cả phòng: nó nói thu nhập của
    từng người. Nên nó KHÔNG mở theo vị trí trong phòng — kế toán thu
    không có việc gì phải biết lương kế toán chi. */
async function duocXemLuong(db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  const q = await quyenCua(db, hoSo.u);
  return {toanBang: lv <= 3 || q.quanLyPhong || q.keToanTruong, quyen: q, lv};
}

export async function bangLuong(y, env, db, hoSo) {
  const {toanBang} = await duocXemLuong(db, hoSo);
  const ky = String(y.ky || '').trim();
  if (!/^\d{4}-\d{2}$/.test(ky))
    return {ok: false, error: 'Kỳ phải có dạng YYYY-MM.'};

  /* Người không xem được cả bảng vẫn xem được DÒNG CỦA CHÍNH MÌNH.
     Không cho một người xem bảng lương của chính họ là buộc họ tin một
     con số không tra lại được. */
  const rieng = !toanBang;

  const daChot = await db.prepare(
    "SELECT * FROM bangLuong WHERE ky = ? AND trangThai = 'daChot'"
  ).bind(ky).all();
  const chotTheoNguoi = {};
  for (const x of (daChot.results || [])) chotTheoNguoi[x.username] = x;

  /* Ai đang giữ vị trí trong phòng. Người đã thu hồi vị trí giữa kỳ
     vẫn có dòng nếu kỳ ấy đã chốt — dòng chốt là sự thật của kỳ, không
     phải của hôm nay. */
  const bay = new Date().toISOString();
  const ng = await db.prepare(
    'SELECT username, chucNang FROM quyenTaiChinh WHERE thuHoiLuc IS NULL ' +
    'AND (hetHan IS NULL OR hetHan > ?) AND chucNang <> ? ORDER BY chucNang, username'
  ).bind(bay, 'quanLyPhong').all();

  const nguoi = [];
  for (const x of (ng.results || [])) nguoi.push({u: x.username, viTri: x.chucNang});
  for (const u of Object.keys(chotTheoNguoi))
    if (!nguoi.some(x => x.u === u))
      nguoi.push({u, viTri: chotTheoNguoi[u].viTri});

  /* Chấm KPI của kỳ MỘT LẦN rồi dùng cho mọi người: chamKpiTaiChinh
     chấm cả ba vị trí trong một lượt, gọi lại cho từng người là chạy
     lại cùng một phép ba lần. */
  const kpi = await chamKpiTaiChinh({loai: 'thang', moc: ky}, env, db, hoSo);

  const dong = [];
  for (const p of nguoi) {
    if (rieng && p.u !== hoSo.u) continue;
    const cu = chotTheoNguoi[p.u];

    if (cu) {
      /* ĐÃ CHỐT THÌ ĐỌC RA, KHÔNG TÍNH LẠI. Luật cứng của TC_LUONG. */
      let soDo = {}; try { soDo = JSON.parse(cu.soDo || '{}'); } catch (e) { soDo = {}; }
      dong.push({username: cu.username, viTri: cu.viTri,
        tenViTri: (VI_TRI_TC[cu.viTri] || {}).ten || cu.viTri,
        diem: cu.diem, bac: cu.bacDiem, soDo,
        trongBoQua: cu.trongBoQua,
        luongCung: cu.luongCung, phanKpi: cu.phanKpi, ghiNhan: cu.ghiNhan,
        ghiNhanVi: cu.ghiNhanVi || undefined,
        tong: cu.luongCung + cu.phanKpi + cu.ghiNhan,
        duoi60: cu.duoi60 || undefined,
        trangThai: 'daChot', nguoiChot: cu.nguoiChot, chotLuc: cu.chotLuc});
      continue;
    }

    const soDo = (kpi && kpi.ok) ? (kpi[p.viTri] || null) : null;
    const cham = chamViTri(soDo, p.viTri);
    const hs = await heSoCua(db, p.viTri, ky);

    dong.push({username: p.u, viTri: p.viTri,
      tenViTri: (VI_TRI_TC[p.viTri] || {}).ten || p.viTri,
      diem: cham.diem, bac: cham.bac, tung: cham.tung, soDo: soDo || {},
      trongBoQua: cham.trongBoQua, thuocBoQua: cham.thuocBoQua,
      /* CHƯA CÓ HỆ SỐ THÌ TIỀN LÀ null, KHÔNG PHẢI 0. Số 0 đọc ra thành
         "người này không được trả gì"; null đọc ra thành "chưa ai đặt
         con số", và hai câu ấy dẫn tới hai việc khác hẳn nhau. */
      luongCung: hs ? hs.luongCung : null,
      phanKpi: (hs && cham.diem !== null)
        ? Math.round(hs.tranKpi * cham.diem / 100) : null,
      idHeSo: hs ? hs.id : undefined,
      thieuHeSo: !hs,
      canNgoiLai: cham.diem !== null && cham.diem < NGUONG_NGOI_LAI,
      trangThai: 'nhap'});
  }

  const thieu = dong.filter(x => x.thieuHeSo).map(x => x.viTri);
  return {ok: true, ky, chiDongCuaToi: rieng, so: dong.length, dong,
    bacDiem: BAC_DIEM, nguongNgoiLai: NGUONG_NGOI_LAI,
    daChot: dong.length > 0 && dong.every(x => x.trangThai === 'daChot'),
    choChuHeChot: thieu.length
      ? 'L-01 chưa chốt cho: ' + [...new Set(thieu)].join(', ') +
        '. Máy đo được ĐIỂM, không quy được điểm ra tiền — Super Admin đặt hệ số ' +
        'thì phần tiền hiện ra ngay, không phải chấm lại.'
      : '',
    vi: 'Điểm chấm trên SỔ THẬT, không thước nào do người tự khai. Thước không có ' +
        'gì để đo trong kỳ thì RA KHỎI phép tính và trọng số chia lại — không cho ' +
        'nó 100, vì thế là thưởng một tháng không ai làm gì.'};
}

/* ═══════════════ CHỐT MỘT DÒNG LƯƠNG ═══════════════ */
export async function chotLuong(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  const q = await quyenCua(db, hoSo.u);
  /* Chốt lương là quyền của người QUẢN LÝ phòng, không phải của người
     đứng trong phòng: kế toán trưởng chấm được sổ nhưng không tự chốt
     bảng lương có dòng của chính mình. */
  if (lv > 3 && !q.quanLyPhong)
    return {ok: false, code: 'NOPERM',
      error: 'Chốt lương cần vai R01–R03, hoặc quyền quản lý phòng tài chính.'};

  const ky = String(y.ky || '').trim();
  const nguoi = String(y.username || '').trim();
  if (!/^\d{4}-\d{2}$/.test(ky) || !nguoi)
    return {ok: false, error: 'Cần kỳ dạng YYYY-MM và tên tài khoản.'};

  /* ══ KHÔNG AI CHỐT LƯƠNG CỦA CHÍNH MÌNH ══
     Cùng một luật với người đề xuất chi không tự duyệt. Ở đây nó còn
     thẳng hơn: người chốt quyết luôn tầng ba của chính mình. */
  if (nguoi === hoSo.u) return {ok: false, code: 'TUCHOT',
    error: 'Không ai chốt dòng lương của chính mình. Người chốt quyết cả tầng ghi ' +
           'nhận, nên tự chốt là tự quyết thu nhập của mình.'};

  const daCo = await db.prepare('SELECT * FROM bangLuong WHERE ky = ? AND username = ?')
    .bind(ky, nguoi).first();
  if (daCo && daCo.trangThai === 'daChot')
    return {ok: false, code: 'DACHOT',
      error: 'Dòng lương kỳ ' + ky + ' của người này đã chốt. Kỳ đã chốt thì không ' +
             'tính lại — cùng luật với sổ.'};

  const vt = await db.prepare(
    'SELECT chucNang FROM quyenTaiChinh WHERE username = ? AND thuHoiLuc IS NULL ' +
    'AND chucNang <> ? LIMIT 1'
  ).bind(nguoi, 'quanLyPhong').first();
  if (!vt) return {ok: false,
    error: 'Người này không giữ vị trí nào trong phòng tài chính ở thời điểm chốt.'};

  const kpi = await chamKpiTaiChinh({loai: 'thang', moc: ky}, env, db, hoSo);
  if (!kpi || !kpi.ok) return {ok: false,
    error: 'Chưa chấm được KPI kỳ này, nên chưa chốt lương được.'};

  const soDo = kpi[vt.chucNang] || null;
  const cham = chamViTri(soDo, vt.chucNang);
  const hs = await heSoCua(db, vt.chucNang, ky);
  if (!hs) return {ok: false, code: 'THIEUHESO',
    error: 'Chưa có hệ số lương cho vị trí ' +
           ((VI_TRI_TC[vt.chucNang] || {}).ten || vt.chucNang) + ' ở kỳ ' + ky +
           '. Đây là L-01 — Super Admin đặt hệ số trước, rồi mới chốt được.'};

  /* ══ ĐIỂM DƯỚI 60: MÁY KHÔNG CẮT VÀ CŨNG KHÔNG THA ══

     L-02 chưa chốt, và tệp này không chốt hộ. Viết một dòng "dưới 60
     thì cắt phần KPI" trông rất giống một luật, nhưng TC_LUONG đã nói
     vì sao không được: nhiều lần điểm thấp vì một chỗ hỏng của HỆ chứ
     không phải của người, và cắt lương ở đúng chỗ ấy là dạy người ta
     thôi báo cáo.

     Nên máy chặn lượt chốt lại và đòi người chốt ghi ra quyết định của
     mình. Một câu, có tên người, ở lại trong dòng. */
  const duoi60 = String(y.duoi60 || '').trim();
  if (cham.diem !== null && cham.diem < NGUONG_NGOI_LAI && duoi60.length < 10)
    return {ok: false, code: 'CANQUYETDINH',
      error: 'Điểm kỳ này là ' + cham.diem + ', dưới ' + NGUONG_NGOI_LAI +
        '. Máy KHÔNG tự cắt phần KPI và cũng không tự bỏ qua: nhiều lần điểm thấp ' +
        'là vì một chỗ hỏng của hệ chứ không phải của người, và cắt lương ở đúng ' +
        'chỗ ấy là dạy người ta thôi báo cáo. Ghi ra bạn quyết thế nào và vì sao — ' +
        'câu ấy ở lại trong dòng lương này.',
      diem: cham.diem, bac: cham.bac};

  /* Tầng ba — ghi nhận của người quản lý. Có tiền thì phải có lý do:
     một khoản thưởng không lý do là một khoản không ai kiểm được, và
     nó là chỗ dễ nhất để trả ơn bằng tiền của Học viện. */
  const ghiNhan = Math.round(Number(y.ghiNhan || 0));
  const ghiNhanVi = String(y.ghiNhanVi || '').trim();
  if (ghiNhan < 0) return {ok: false, error: 'Phần ghi nhận không được âm.'};
  if (ghiNhan > 0 && ghiNhanVi.length < 10)
    return {ok: false, code: 'THIEULYDO',
      error: 'Tầng ghi nhận có tiền thì phải có lý do. Đây là chỗ trả cho những ' +
             'việc không đếm được, nên nó phải được KỂ RA — không kể thì nó thành ' +
             'chỗ dễ nhất để trả ơn bằng tiền của Học viện.'};

  /* ══ TRẦN CHO TẦNG GHI NHẬN — BỊT CỬA HẬU MỘT CHỮ KÝ ══

     Lương chốt bằng MỘT chữ ký, và đó là đúng cho phần ĐO ĐƯỢC: luongCung
     và phanKpi không có số nào người chốt gõ ra — chúng là hệ số Super
     Admin đặt nhân điểm trên sổ thật. Nhưng `ghiNhan` thì NGƯỜI CHỐT GÕ,
     và tới 9.99.110 nó không có trần: một Giám đốc (lv<=3) chốt lương cho
     người thông đồng với ghiNhan = 500 triệu, một câu lý do mười ký tự, và
     500 triệu ra sổ chi ở trạng thái daDuyet với một chữ ký — trong khi
     một khoản chi thẳng cùng cỡ phải qua nấc N5 (hai người duyệt + hoá đơn
     + báo giá) VÀ mốc chu kỳ (Super Admin). doiSoatLuong không bắt được vì
     số chi KHỚP đúng bảng lương thật. Chú giải cũ tự bào chữa "ở đây không
     có số tiền nào được gõ" — SAI với ghiNhan.

     Nên ghiNhan có trần bằng tranKpi — ceiling biến-thiên-lương của chính
     vị trí ấy, do Super Admin đặt, người chốt không nống được. Một ghi
     nhận lớn hơn cả trần KPI một tháng của vị trí thì nó không còn là "ghi
     nhận việc nhỏ" — nó là một khoản chi thật, và phải đi qua thang nấc
     như mọi khoản chi lớn, không lọt qua cửa lương một chữ ký. */
  if (ghiNhan > hs.tranKpi)
    return {ok: false, code: 'GHINHANVUOTTRAN',
      error: 'Phần ghi nhận (' + dinhDang(ghiNhan) + ') vượt trần KPI một tháng của ' +
             'vị trí (' + dinhDang(hs.tranKpi) + '). Cửa lương chốt bằng MỘT chữ ký, ' +
             'nên nó chỉ trả được phần đo được cộng một khoản ghi nhận trong trần. ' +
             'Một khoản lớn hơn là một khoản chi thật — lập nó qua sổ chi (duyetChi) ' +
             'để nó đi đúng thang nấc và mốc chu kỳ, không lọt qua cửa lương.',
      tranGhiNhan: hs.tranKpi};

  const phanKpi = cham.diem !== null ? Math.round(hs.tranKpi * cham.diem / 100) : 0;

  /* ══ THANG CHỮ KÝ THEO SỐ TIỀN (9.99.117) ══
     Lương chốt là tiền RA — người chốt phải đủ cấp theo TỔNG lương, dùng
     lại thang mốc chu kỳ như chi trực tiếp và hai cửa rút tiền kia. ghiNhan
     đã bị chặn trần bằng tranKpi ở trên; gate này canh thêm tổng khoản: một
     lương tổng 80 triệu+ thì phải Super Admin chốt, không lọt qua một Giám
     đốc như chi thẳng cùng cỡ cũng đòi. */
  const tongLuong = hs.luongCung + phanKpi + ghiNhan;
  const canL = capDuyetTheoTien(tongLuong);
  /* quanLyPhong (kế toán trưởng) giữ quyền uỷ nhiệm chốt lương dù lv>3 —
     gate rank chỉ áp cho người KHÔNG phải quản lý phòng, để không chặn nhầm
     đường hợp lệ. Phần người chốt gõ tay (ghiNhan) đã bị trần tranKpi ở
     trên, nên phần rủi ro nhất của lương lớn đã được canh riêng. */
  if (lv > canL.bac && !q.quanLyPhong) return {ok: false, code: 'CANCAPCAOHON',
    error: 'Tổng lương kỳ này ' + dinhDang(tongLuong) + ' cần ' + canL.tenVai +
      ' chốt (thang chữ ký theo số tiền, mốc ' + canL.moc + '). Cấp hiện tại chưa đủ — ' +
      'chi cùng cỡ cũng đòi đúng cấp này.'};

  const luc = new Date().toISOString();
  const id = daCo ? daCo.id : ('BL-' + tokenMoi().slice(0, 14));

  const cot = [id, ky, nguoi, vt.chucNang, cham.diem, cham.bac,
    JSON.stringify(soDo || {}), cham.trongBoQua, hs.luongCung, phanKpi,
    ghiNhan, ghiNhanVi.slice(0, 500) || null, duoi60.slice(0, 500) || null,
    hs.id, hoSo.u, luc];

  const luongStmt = daCo
    ? db.prepare(
        'UPDATE bangLuong SET viTri=?, diem=?, bacDiem=?, soDo=?, trongBoQua=?, ' +
        'luongCung=?, phanKpi=?, ghiNhan=?, ghiNhanVi=?, duoi60=?, idHeSo=?, ' +
        "trangThai='daChot', nguoiChot=?, chotLuc=? WHERE id = ? AND trangThai <> 'daChot'"
      ).bind(...cot.slice(3), id)
    : db.prepare(
        'INSERT INTO bangLuong (id,ky,username,viTri,diem,bacDiem,soDo,trongBoQua,' +
        'luongCung,phanKpi,ghiNhan,ghiNhanVi,duoi60,idHeSo,nguoiChot,chotLuc,trangThai) ' +
        "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'daChot')"
      ).bind(...cot);

  /* ══ LƯƠNG ĐÃ CHỐT LÀ MỘT KHOẢN CHI, VÀ GHI NGUYÊN TỬ CÙNG DÒNG LƯƠNG (9.99.119) ══

     Không đưa vào sổ chi thì bản kê kế toán thiếu đúng khoản chi lớn nhất và
     đều đặn nhất của Học viện, và bộ số khai thuế dựng trên một bản kê thiếu
     — cả hai vẫn "cân", vì chúng cân với chính chỗ thiếu ấy.

     Khoản này KHÔNG đi qua thang nấc, và đó là một quyết định: thang nấc
     đứng giữa một NGƯỜI và một SỐ TIỀN họ tự gõ; ở đây phần đo được không có
     số nào được gõ (hệ số Super Admin đặt × điểm trên sổ thật), và phần DUY
     NHẤT người chốt gõ — tầng ghi nhận — đã bị trần tranKpi ở trên.

     THỨ TỰ GHI: trước 9.99.119 là dòng lương TRƯỚC, khoản chi SAU, RỜI nhau
     — chú giải cũ nói "D1 không gói hai lượt ghi vào một giao dịch" và phải
     "chọn chỗ hỏng". Nay tiền đề ấy SAI: db.batch (9.99.116) gói được. Hai
     ghi đi CÙNG một giao dịch — hoặc cả dòng lương lẫn khoản chi, hoặc không
     gì. Hết cảnh "dòng lương chưa có khoản chi" hay "khoản chi mồ côi".
     doiSoatLuong vẫn soi hai phía (móc idBangLuong không được tin), nay như
     lớp phòng thủ cho lệch đến từ nguồn khác (gõ tay, huỷ chi, dời lược đồ). */
  const idChi = 'CP-' + tokenMoi().slice(0, 14);
  const chiStmt = db.prepare(
    'INSERT INTO chiPhi (id,khoanMuc,soTien,ngayChi,hinhThuc,dienGiai,' +
    'nguoiDeXuat,deXuatLuc,nguoiDuyet,duyetLuc,nac,trangThai,idBangLuong) ' +
    "VALUES (?,'luong',?,?,'chuyenKhoan',?,'may-chu',?,?,?,?,'daDuyet',?)"
  ).bind(idChi, hs.luongCung + phanKpi + ghiNhan, cuoiKy(ky),
    'Lương kỳ ' + ky + ' · ' + ((VI_TRI_TC[vt.chucNang] || {}).ten || vt.chucNang) +
      ' · ' + nguoi,
    luc, hoSo.u, luc, 'LUONG', id);

  try {
    await db.batch([luongStmt, chiStmt]);
  } catch (e) {
    console.error('LUONG_CHOT_HONG', id, String(e && e.message || e));
    return {ok: false, code: 'GHIHONG',
      error: 'Ghi dòng lương và khoản chi không thành công — giao dịch đã lăn ngược, ' +
             'không để lại nửa vời. Xin thử lại.'};
  }

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'LUONG_CHOT',
    doiTuong: id, chiTiet: ky + ' · ' + nguoi + ' · ' + cham.diem + ' điểm · ' +
      dinhDang(hs.luongCung + phanKpi + ghiNhan) + ' · vào sổ chi ' + idChi});

  return {ok: true, id, ky, username: nguoi, viTri: vt.chucNang, idChi,
    /* Dòng lương và khoản chi đi cùng một giao dịch (9.99.119), nên khi tới
       đây là cả hai đã vào sổ — không còn nhánh "chưa vào sổ chi". */
    diem: cham.diem, bac: cham.bac, trongBoQua: cham.trongBoQua,
    luongCung: hs.luongCung, phanKpi, ghiNhan,
    tong: hs.luongCung + phanKpi + ghiNhan,
    vi: 'Số đo thô của cả ' + (NGUONG_KPI[vt.chucNang] || []).length +
        ' thước đã đông cứng trong dòng này. Kỳ đã chốt thì không tính lại, và ' +
        'người bị trừ lương cãi lại được bằng chính những số đo ấy.'};
}

/** Mốc TIỀN RA của một kỳ lương: ngày cuối của tháng ấy, giờ Việt Nam.

    Không lấy ngày chốt: chốt tháng Ba vào tháng Sáu thì khoản chi phải
    thuộc tháng Ba, nếu không bản kê quý I thiếu lương ba tháng và quý
    II thừa. */
function cuoiKy(ky) {
  const [n, t] = ky.split('-').map(Number);
  /* Ngày 0 của tháng SAU là ngày cuối của tháng NÀY — không phải đếm
     tay 30 hay 31, và tháng Hai năm nhuận cũng đúng. */
  const d = new Date(Date.UTC(n, t, 0, 16, 59, 59));
  return d.toISOString();
}

/* ═══════════════ ĐỐI CHIẾU LƯƠNG — HAI PHÍA ═══════════════

   Cùng lối với đối chiếu ngân hàng, và cùng lý do: một con số "khớp
   hay không khớp" không nói được phải làm gì, còn hai danh sách thì
   nói hai chuyện khác hẳn nhau.

     DÒNG LƯƠNG ĐÃ CHỐT MÀ CHƯA CÓ KHOẢN CHI
       — Học viện nợ một người mà sổ chi không biết. Bản kê kế toán
         thiếu, và người ấy có thể không được trả.

     KHOẢN CHI MÓC VÀO MỘT DÒNG LƯƠNG KHÔNG CÓ THẬT, HOẶC LỆCH SỐ TIỀN
       — Đây là chỗ MẤT TIỀN: ai đó gõ tay một khoản 'luong' rồi gắn
         một cái móc vào để nó trông như máy sinh ra. Cái móc không
         được tin, nên phép này soi ngược lại từ sổ chi. */
export async function doiSoatLuong(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  const q = await quyenCua(db, hoSo.u);
  if (lv > 3 && !q.quanLyPhong && !q.keToanTruong)
    return {ok: false, code: 'NOPERM',
      error: 'Đối chiếu lương cần vai R01–R03, quyền quản lý phòng, hoặc Kế toán trưởng.'};

  const ky = String(y.ky || '').trim();
  const locKy = /^\d{4}-\d{2}$/.test(ky);

  const bl = await db.prepare(
    "SELECT * FROM bangLuong WHERE trangThai = 'daChot'" +
    (locKy ? ' AND ky = ?' : '') + ' ORDER BY ky DESC LIMIT 400'
  ).bind(...(locKy ? [ky] : [])).all();

  const cp = await db.prepare(
    "SELECT id, soTien, trangThai, idBangLuong, dienGiai FROM chiPhi " +
    'WHERE idBangLuong IS NOT NULL LIMIT 400').all();

  const theoMoc = {};
  for (const x of (cp.results || [])) (theoMoc[x.idBangLuong] =
    theoMoc[x.idBangLuong] || []).push(x);

  const chuaVaoSo = [], lechTien = [], mocMaCoi = [], mocTrung = [];
  const idThat = {};
  for (const b of (bl.results || [])) {
    idThat[b.id] = b;
    const ds = (theoMoc[b.id] || []).filter(x => x.trangThai !== 'huy');
    const tong = b.luongCung + b.phanKpi + b.ghiNhan;
    if (!ds.length) { chuaVaoSo.push({id: b.id, ky: b.ky, username: b.username,
      soTien: tong}); continue; }
    /* HAI khoản chi cùng móc vào một dòng lương là trả hai lần. */
    if (ds.length > 1) mocTrung.push({id: b.id, ky: b.ky, username: b.username,
      so: ds.length, idChi: ds.map(x => x.id)});
    for (const c of ds)
      if (Math.round(Number(c.soTien)) !== Math.round(tong))
        lechTien.push({idChi: c.id, idLuong: b.id, ky: b.ky, username: b.username,
          soTrenSoChi: Number(c.soTien), soTrenBangLuong: tong});
  }
  for (const c of (cp.results || []))
    if (!idThat[c.idBangLuong] && c.trangThai !== 'huy')
      mocMaCoi.push({idChi: c.id, mocToi: c.idBangLuong, soTien: Number(c.soTien),
        dienGiai: c.dienGiai});

  const so = chuaVaoSo.length + lechTien.length + mocMaCoi.length + mocTrung.length;
  return {ok: true, ky: locKy ? ky : 'tất cả', soDongLuong: (bl.results || []).length,
    soKhoanChi: (cp.results || []).length, soChoLech: so, khop: so === 0,
    chuaVaoSo, lechTien, mocMaCoi, mocTrung,
    vi: 'Hai phía, hai chuyện khác nhau. LƯƠNG CHƯA VÀO SỔ CHI: Học viện nợ một ' +
        'người mà sổ chi không biết, nên bản kê thiếu và người ấy có thể không được ' +
        'trả. MÓC MỒ CÔI hoặc LỆCH TIỀN: ai đó gõ tay một khoản lương rồi gắn móc ' +
        'cho nó trông như máy sinh — đây là chỗ mất tiền, và cái móc không được tin.'};
}

export { NGUONG_KPI, BAC_DIEM, NGUONG_NGOI_LAI, chamViTri, chamMotThuoc, cuoiKy };
