/* ═══════════════════════════════════════════════════════════════
   GITA 365 · CỬA VÀO MỚI — TÀI CHÍNH

   ══ CHỖ NỀN CŨ KHÔNG DIỄN TẢ ĐƯỢC ══

   Bảng thanhToan cũ có MỘT dòng cho mỗi (nhà × tầng). Nó chỉ nói được
   một câu đúng/sai: tầng này đã trả tiền hay chưa.

   Nhưng chính bảng học phí của Học viện khai nhịp thu khác hẳn — ba kỳ
   cho tầng ba, bốn kỳ theo quý cho tầng bốn và năm, và "kỳ sau chỉ thu
   khi cổng trước đã nghiệm thu". Với một dòng đúng/sai thì một nhà
   tầng bốn đóng xong kỳ MỘT đã được tính là đã thanh toán cả tầng, và
   ba kỳ còn lại biến mất khỏi sổ.

   Đó không phải sai một con số. Là KHÔNG CÓ CHỖ để ghi con số ấy.

   ══ HAI SỔ, KHÔNG PHẢI MỘT ══

     kyThu    — PHẢI THU. Sinh ra lúc nhà vào tầng, theo lịch của tầng.
     phieuThu — ĐÃ THU. Mỗi lần nhận tiền một dòng, trỏ về một kỳ.

   Công nợ = hiệu của hai sổ. Không tách thì không có phép trừ ấy, và
   "nhà này còn nợ bao nhiêu" là câu không trả lời được bằng dữ liệu —
   chỉ trả lời được bằng trí nhớ của người phụ trách.

   ══ NGƯỜI GHI KHÔNG TỰ DUYỆT PHIẾU CỦA MÌNH ══

   Cùng một luật với chứng cứ hoa hồng, và cùng một lý do: một người
   không tự dựng được hồ sơ cho mình. Ở đây nó còn thẳng hơn — người
   ghi phiếu thu là người nói "đã nhận tiền", và nếu chính người ấy
   duyệt luôn thì không có lớp nào đứng giữa lời nói và sổ sách.
   ═══════════════════════════════════════════════════════════════ */

import { Kho, tokenMoi } from './nen.js';
import { docGiaHienHanh } from './bang-gia.js';
import { ghiDieuChinh } from './bao-cao.js';
import { baoTienVao } from './bao-doanh-thu.js';
import { quyenCua, oDauTien, capDuyetTheoTien } from './chi-tieu.js';

const BAC = {R01:1,R02:2,R03:3,R04:4,R05:5,R06:6,R07:7,R08:8,
             R09:9,R10:10,R11:11,R12:12,R13:13,R14:14,R15:15};

/* ── GIÁ TỪNG TẦNG ──
   BẢN CHÉP của G.HP_TANG[].gia. Máy chủ không đọc được kho đã mã hoá
   nên phải chép; bộ kiểm phát hành đối chiếu hai bản mỗi lần chạy, y
   như nó vẫn làm với GITA_TUYEN và GITA_XK_TRAN.

   T1 bằng 0 chứ KHÔNG phải null — hai thứ ấy khác nhau: null là chưa
   biết giá nên mọi phép tính đứng lại, 0 là đã biết và bằng không nên
   phép tính chạy và ra 0. Chốt của chủ hệ ở HH-CC-03. */
/* Giá gói KHÔNG còn là hằng số ở đây từ 9.99.73.

   Con số khởi đầu chuyển sang `bang-gia.js → GIA_KHOI_DAU`, và giá ĐANG
   CHẠY đọc từ bảng `bangGia` bằng `docGiaHienHanh(db)`. Giữ lại một
   hằng tên `GIA_TANG` ở đây thì người đọc sau tin nó là giá hiện hành,
   tính một con số, và con số ấy sai theo đúng hướng không ai kiểm.

   Xuất lại đúng MỘT tên, và tên ấy nói thẳng nó là giá khởi đầu. */
export { GIA_KHOI_DAU } from './bang-gia.js';

/* ── NHỊP THU ──

   Lấy TỪNG CHỮ từ G.HP_TANG[].nhip. Chỗ nào bảng học phí nói rõ ngày
   thì ghi đúng ngày ấy; chỗ nào không nói thì khai vào SUY_RA ở dưới
   chứ không lặng lẽ chọn một con số.

     T1 'Thu một lần trước khi bắt đầu. Chặng ngắn nhất, không chia kỳ.'
     T2 'Thu một lần trước khi bắt đầu, hoặc hai kỳ: trước ngày 1 và
         trước ngày 11.'
     T3 'Ba kỳ, mỗi kỳ trước một chuỗi: K1 trước ngày 1, K2 trước ngày
         43, K3 trước ngày 64. Kỳ sau chỉ thu khi cổng trước đã nghiệm
         thu.'
     T4 'Bốn kỳ theo quý. Kỳ sau chỉ thu khi cổng quý trước đã nghiệm
         thu — không thu trước cho cả năm.'
     T5 'Bốn kỳ theo quý, như tầng 4.'

   T2 có HAI cách; hệ dựng lịch theo cách MỘT KỲ, vì đó là mặc định
   trong câu ("thu một lần ... hoặc hai kỳ") và vì chia đôi một khoản
   năm trăm nghìn thì phần việc ghi sổ đắt hơn phần tiền. Nhà nào muốn
   hai kỳ thì người phụ trách tách tay — và chỗ ấy nằm trong SUY_RA. */
const NHIP = {
  1: {soKy: 1, ngay: [1]},
  2: {soKy: 1, ngay: [1]},
  3: {soKy: 3, ngay: [1, 43, 64], congTruoc: true},
  4: {soKy: 4, ngay: [1, 91, 181, 271], congTruoc: true},
  5: {soKy: 4, ngay: [1, 91, 181, 271], congTruoc: true}
};

/* ── BA CHỖ TÔI SUY RA, KHÔNG PHẢI CHỦ HỆ KHAI ──

   Kê ra đây để chủ hệ nhìn thấy và chốt, thay vì để chúng nằm im
   trong mã dưới dạng những con số trông như đã được duyệt. Cùng lối
   với TV_LECH và HH_CHOCHU của kho. */
export const SUY_RA = [
  {ma: 'TC-01', viec: 'Ngày của bốn kỳ tầng 4 và tầng 5',
   suy: 'ngày 1 · 91 · 181 · 271',
   vi: 'Bảng học phí nói "bốn kỳ theo quý" mà không cho số ngày. Tầng 4 ' +
       'là trọn một năm nên một quý là 91 ngày. Chốt lại nếu Học viện tính ' +
       'quý theo lịch dương thay vì theo ngày vào tầng.'},

  {ma: 'TC-02', viec: 'Chia tiền giữa các kỳ',
   suy: 'chia ĐỀU cho số kỳ',
   vi: 'Bảng học phí không nói tỉ lệ. Chia đều là cách ít giả định nhất, ' +
       'nhưng nhiều nơi thu kỳ đầu nặng hơn để giữ cam kết. Đây là quyết ' +
       'định kinh doanh, không phải quyết định kỹ thuật.'},

  {ma: 'TC-03', viec: 'Tầng 2 dựng lịch một kỳ hay hai kỳ',
   suy: 'MỘT kỳ',
   vi: 'Bảng học phí cho hai cách và không nói cách nào là mặc định. Hệ ' +
       'chọn một kỳ; nhà nào muốn hai kỳ thì người phụ trách tách tay.'}
];

/* ═══════════════ DỰNG LỊCH THU KHI VÀO TẦNG ═══════════════ */
export async function dungLichThu(db, maKhachHang, tang, vaoLuc) {
  const n = NHIP[tang];
  if (!n) return 0;
  /* Đọc giá ĐANG CHẠY, không đọc hằng số. Và con số lấy được ở đây bị
     ĐÓNG BĂNG vào các dòng lịch thu ngay dưới — đổi giá sau đó không
     chạm tới nhà này nữa, vì đổi theo là đổi số tiền một gia đình đã
     ký, và chuyện ấy không sửa lại được. */
  const bg = await docGiaHienHanh(db);
  const gia = bg.gia[tang];
  if (gia == null) throw new Error('Chưa có giá cho tầng ' + tang);

  /* Tầng 0 tiền thì không sinh kỳ nào: một dòng "phải thu 0 đồng" là
     một dòng công nợ giả, và nó làm mọi bản kê công nợ có rác. */
  if (!gia) return 0;

  const moc = new Date(vaoLuc || new Date().toISOString()).getTime();
  const mot = Math.round(gia / n.soKy);
  let so = 0;
  for (let i = 0; i < n.soKy; i++) {
    /* Kỳ CUỐI gánh phần lẻ, để tổng các kỳ đúng bằng giá gói. Chia đều
       rồi làm tròn từng kỳ thì tổng lệch vài đồng, và một bản kê tài
       chính lệch vài đồng là một bản kê phải đi giải thích. */
    const tien = (i === n.soKy - 1) ? gia - mot * (n.soKy - 1) : mot;
    try {
      await db.prepare(
        'INSERT INTO kyThu (id,maKhachHang,tang,ky,soKy,ngayThu,phaiThu,hanLuc,congTruoc,taoLuc) ' +
        'VALUES (?,?,?,?,?,?,?,?,?,?)'
      ).bind('KT-' + tokenMoi().slice(0, 14), maKhachHang, tang, i + 1, n.soKy,
        n.ngay[i], tien,
        new Date(moc + (n.ngay[i] - 1) * 86400e3).toISOString(),
        (n.congTruoc && i > 0) ? ('cong-ky-' + i) : null,
        new Date().toISOString()).run();
      so++;
    } catch (e) {
      /* ix_kythu_mot chặn dựng lịch hai lần cho cùng một tầng. Dựng
         hai lần là NHÂN ĐÔI công nợ của một nhà, và không ai nhìn ra
         cho tới lúc đối chiếu. Đụng khoá thì bỏ qua kỳ ấy, không ném:
         lượt dựng lại là chuyện bình thường khi người ta bấm hai lần. */
      if (!/kyThu/.test(String(e && e.message || e))) throw e;
    }
  }
  return so;
}

/* ═══════════════ GHI PHIẾU THU ═══════════════ */
export async function ghiPhieuThu(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  /* Tư vấn (R11) trở lên ghi được phiếu — họ là người đứng giữa gia
     đình và Học viện, nên họ là người nhận được xác nhận chuyển khoản. */
  if (lv > 11) return {ok: false, error: 'Vai này không ghi được phiếu thu.'};

  const p = y.phieu || {};
  const nha = String(p.maKhachHang || '').trim();
  const tien = Number(p.soTien || 0);
  if (!nha) return {ok: false, error: 'Thiếu mã khách hàng.'};
  if (!(tien > 0)) return {ok: false, error: 'Số tiền phải lớn hơn 0.'};
  if (['chuyenKhoan', 'tienMat', 'the'].indexOf(String(p.hinhThuc)) < 0)
    return {ok: false, error: 'Hình thức thu phải là chuyenKhoan, tienMat hoặc the.'};

  const hs = await db.prepare('SELECT * FROM hoSoKhach WHERE maKhachHang = ?')
    .bind(nha).first();
  if (!hs) return {ok: false, error: 'Không tìm thấy hồ sơ khách hàng này.'};

  let ky = null;
  if (p.idKy) {
    ky = await db.prepare('SELECT * FROM kyThu WHERE id = ?').bind(String(p.idKy)).first();
    if (!ky) return {ok: false, error: 'Không tìm thấy kỳ thu này.'};
    if (String(ky.maKhachHang) !== nha)
      return {ok: false, error: 'Kỳ thu này thuộc về một nhà khác.'};

    /* ── CỔNG: KỲ SAU CHỈ THU KHI KỲ TRƯỚC ĐÃ TRẢ ĐỦ ──

       Bảng học phí khai thẳng: "Kỳ sau chỉ thu khi cổng trước đã
       nghiệm thu — không thu trước cho cả năm." Tới 9.88 cột congTruoc
       được GHI mà không được ĐỌC, nên luật ấy nằm trong dữ liệu như
       một lời chú thích chứ không chặn ai.

       Một luật đã khai mà không thi hành thì tệ hơn không khai: người
       đọc sổ tin là có cổng, và không ai đi kiểm lại. */
    if (ky.congTruoc && Number(ky.ky) > 1) {
      const truoc = await conNoCuaKy(db, nha, Number(ky.tang), Number(ky.ky) - 1);
      if (truoc > 0)
        return {ok: false, code: 'CONGTRUOC',
          error: 'Kỳ ' + (Number(ky.ky) - 1) + ' của tầng ' + ky.tang + ' còn thiếu ' +
            dinhDang(truoc) + '. Thu đủ kỳ trước rồi mới thu kỳ này.'};
    }

    /* ── KHÔNG THU QUÁ SỐ PHẢI THU CỦA MỘT KỲ ──

       Thu thừa vào một kỳ là một con số không có chỗ đứng trong sổ:
       kỳ ấy hết nợ mà tiền vẫn dư, và phần dư không thuộc kỳ nào. Ai
       muốn ghi phần dư thì ghi thành khoản NGOÀI LỊCH (bỏ trống idKy)
       rồi gán vào kỳ sau — có đường đi hẳn hoi, không phải nhét bừa. */
    const con = await conNoCuaKy(db, nha, Number(ky.tang), Number(ky.ky));
    if (tien > con)
      return {ok: false, code: 'THUTHUA',
        error: 'Kỳ này chỉ còn thiếu ' + dinhDang(con) + '. Ghi phần dư thành ' +
          'khoản thu ngoài lịch rồi gán vào kỳ sau.'};
  }

  const id = 'PT-' + tokenMoi().slice(0, 14);
  /* MỘT mốc, dùng cho cả dòng trong sổ lẫn lá thư báo. Gọi new Date()
     hai lần là dựng hai sự thật: một phiếu ghi lúc 23:59:59.999 có thể
     vào sổ ngày hôm nay mà thư báo nói ngày mai. */
  const ghiLuc = new Date().toISOString();
  await db.prepare(
    'INSERT INTO phieuThu (id,maKhachHang,idKy,soTien,hinhThuc,maThamChieu,minhChung,' +
    "nguoiGhi,ghiLuc,trangThai,ghiChu) VALUES (?,?,?,?,?,?,?,?,?,'choDuyet',?)"
  ).bind(id, nha, p.idKy || null, tien, String(p.hinhThuc),
    String(p.maThamChieu || '').slice(0, 80) || null,
    String(p.minhChung || '').slice(0, 120) || null,
    hoSo.u, ghiLuc, String(p.ghiChu || '').slice(0, 500) || null).run();

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'PHIEUTHU_GHI',
    doiTuong: id, chiTiet: nha + ' · ' + tien + 'đ · ' + p.hinhThuc});

  /* ── BÁO DÒNG DOANH THU VỀ HÒM THƯ CHỦ HỆ ──

     Chốt 9.96. Báo ở mốc GHI chứ không ở mốc DUYỆT: báo sau khi duyệt
     thì lá thư chẳng thêm gì, đã có người trong hệ xác nhận rồi. Báo
     lúc ghi thì con mắt của chủ hệ là con mắt ĐỘC LẬP.

     Đặt SAU lượt INSERT và bọc trong try: phiếu đã nằm trong sổ rồi,
     nên nhà gửi thư sập cũng không được làm mất một đồng nào. guiThu
     đã nuốt lỗi mạng, nhưng chỗ này còn có thể ném vì lý do khác —
     một câu SELECT hỏng, một cấu hình thiếu — và không bọc thì lượt
     ghi phiếu đổ theo. */
  let baoThu;
  try {
    baoThu = await baoTienVao(env, db, {
      phieu: {id, maKhachHang: nha, soTien: tien, hinhThuc: String(p.hinhThuc),
        maThamChieu: p.maThamChieu, ghiLuc},
      ky, nguoiGhi: hoSo.u});
  } catch (e) {
    console.error('BAO_DOANHTHU_HONG', id, String(e && e.message || e));
    baoThu = {gui: false};
  }

  return {ok: true, id, trangThai: 'choDuyet',
    daBaoChuHe: !!(baoThu && baoThu.gui) || undefined};
}

const dinhDang = n => Number(n).toLocaleString('vi-VN') + 'đ';

/** Còn thiếu bao nhiêu ở MỘT kỳ. Một câu lệnh, đi qua ix_kythu_mot rồi
    ix_pt_ky — không đọc cả sổ phiếu thu của nhà rồi lọc trong bộ nhớ. */
/* ══ MỘT PHÉP TRỪ MIỄN GIẢM, DÙNG Ở MỌI CHỖ TÍNH CÔNG NỢ ══

   Công nợ một kỳ được tính ở BỐN chỗ: conNoCuaKy (cổng chặn thu thừa),
   congNo (bản kê một nhà), dsQuaHan (danh sách cả hệ), và doiSoat DS-4
   (phép soát thu thừa). Bốn chỗ ấy phải trừ miễn giảm giống hệt nhau.

   Viết lại phép trừ ở từng chỗ là cách chắc chắn nhất để một nhà được
   giảm học phí vẫn hiện lên trong danh sách quá hạn — hoặc tệ hơn: cổng
   chặn thu thừa cho thu quá phần còn phải đóng. Nên MỘT bản, một chuỗi,
   nối vào cả bốn câu.

   Điều kiện phải khớp bí danh k của kyThu ở câu gọi nó. */
const TRU_MIEN_GIAM =
  "(SELECT COALESCE(SUM(m.soTien),0) FROM mienGiam m " +
  " WHERE m.idKy = k.id AND m.trangThai = 'daDuyet')";

async function conNoCuaKy(db, nha, tang, ky) {
  const r = await db.prepare(
    'SELECT k.phaiThu, ' + TRU_MIEN_GIAM + ' AS giam, ' +
    "  COALESCE(SUM(CASE WHEN p.trangThai = 'daDuyet' THEN p.soTien END), 0) daThu " +
    'FROM kyThu k LEFT JOIN phieuThu p ON p.idKy = k.id ' +
    'WHERE k.maKhachHang = ? AND k.tang = ? AND k.ky = ? GROUP BY k.id'
  ).bind(nha, tang, ky).first();
  if (!r) return 0;
  return Math.max(0, Number(r.phaiThu) - Number(r.giam) - Number(r.daThu));
}

/* ═══════════════ DUYỆT PHIẾU THU ═══════════════ */
export async function duyetPhieuThu(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  /* ĐẦU THU CỦA PHÒNG TÀI CHÍNH.

     Kế toán CHI không duyệt được phiếu thu, và đó là chủ ý: gộp hai đầu
     tiền vào một người thì người ấy dựng được một vòng khép kín mà
     không ai đứng ngoài — ghi một phiếu thu không có thật cho tổng thu
     trông đủ, rồi duyệt một khoản chi mang tiền ấy đi. Mỗi bước đều có
     chữ ký hợp lệ của cùng một người, sổ vẫn cân, và không phép soi nào
     trong hệ này bắt được.

     Tách ra thì cái vòng ấy cần HAI người đồng ý. Đó là cả sự khác biệt,
     và nó là lớp kiểm soát cổ nhất của nghề kế toán. */
  const quyenTC = await quyenCua(db, hoSo.u);
  if (lv > 3 && !oDauTien(quyenTC, 'thu'))
    return {ok: false, code: 'NOPERM',
      error: 'Duyệt phiếu thu cần vai R01–R03, hoặc vị trí Kế toán thu / ' +
             'Kế toán trưởng. Kế toán CHI không duyệt được phiếu thu nào.'};

  const pt = await db.prepare('SELECT * FROM phieuThu WHERE id = ?')
    .bind(String(y.id || '')).first();
  if (!pt) return {ok: false, error: 'Không tìm thấy phiếu thu này.'};

  /* NGƯỜI GHI KHÔNG TỰ DUYỆT PHIẾU CỦA MÌNH.

     Cùng luật với chứng cứ hoa hồng, và ở đây còn thẳng hơn: người ghi
     phiếu là người nói "đã nhận tiền". Nếu chính người ấy duyệt luôn
     thì không có lớp nào đứng giữa lời nói và sổ sách, và một khoản
     tiền vào sổ mà không ai ngoài người ấy nhìn thấy. */
  if (String(pt.nguoiGhi) === String(hoSo.u))
    return {ok: false, error: 'Người ghi phiếu không tự duyệt phiếu của mình được.'};

  const duyet = y.duyet !== false;
  const gio = new Date().toISOString();

  /* Ghi có điều kiện: hai người cùng bấm thì ai đổi được dòng người ấy
     duyệt, người kia biết là đã có người làm trước. */
  const r = await db.prepare(
    'UPDATE phieuThu SET trangThai = ?, nguoiDuyet = ?, duyetLuc = ?, lyDo = ? ' +
    "WHERE id = ? AND trangThai = 'choDuyet'"
  ).bind(duyet ? 'daDuyet' : 'tuChoi', hoSo.u, gio,
    String(y.lyDo || '').slice(0, 300) || null, pt.id).run();
  if (!((r && r.meta && r.meta.changes) || 0))
    return {ok: false, error: 'Phiếu này đã được xử lý rồi.'};

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u,
    viec: duyet ? 'PHIEUTHU_DUYET' : 'PHIEUTHU_TUCHOI',
    doiTuong: pt.id, chiTiet: pt.maKhachHang + ' · ' + pt.soTien + 'đ'});
  return {ok: true, trangThai: duyet ? 'daDuyet' : 'tuChoi'};
}

/* ═══════════════ CÔNG NỢ MỘT NHÀ ═══════════════

   Hiệu của hai sổ, tính bằng MỘT câu lệnh có phép nối trái: kỳ nào
   chưa có phiếu nào duyệt thì phần đã thu bằng 0, chứ không biến mất
   khỏi bản kê. Lọc sau khi đọc về thì kỳ chưa thu đồng nào là kỳ dễ bị
   rơi ra nhất — mà đó đúng là kỳ cần nhìn thấy. */
export async function congNo(y, env, db, hoSo) {
  const nha = String(y.maKhachHang || '').trim();
  if (!nha) return {ok: false, error: 'Thiếu mã khách hàng.'};

  const lv = BAC[hoSo.role] || 99;
  /* Gia đình xem được công nợ CỦA CHÍNH MÌNH; đội ngũ từ Tư vấn trở
     lên xem được của nhà mình phụ trách. Không có lớp này thì một
     phụ huynh gõ mã nhà khác là đọc được tình hình tiền nong nhà ấy. */
  if (lv > 11) {
    const nd = await Kho.nguoiTheoId(db, hoSo.uid);
    if (!nd || String(nd.maKhachHang || '') !== nha)
      return {ok: false, code: 'NOPERM', error: 'Chỉ xem được công nợ của chính nhà mình.'};
  }

  const r = await db.prepare(
    'SELECT k.id, k.tang, k.ky, k.soKy, k.phaiThu, k.hanLuc, k.congTruoc, ' +
    '  ' + TRU_MIEN_GIAM + ' AS giam, ' +
    '  COALESCE(SUM(CASE WHEN p.trangThai = ? THEN p.soTien END), 0) AS daThu ' +
    'FROM kyThu k LEFT JOIN phieuThu p ON p.idKy = k.id ' +
    'WHERE k.maKhachHang = ? GROUP BY k.id ORDER BY k.tang, k.ky'
  ).bind('daDuyet', nha).all();

  /* Bản kê nêu CẢ BA con số — phải đóng, được giảm, đã đóng — chứ không
     chỉ nêu phần còn lại. Gia đình được cấp học bổng có quyền nhìn thấy
     khoản ấy đứng thành một dòng, và người phụ trách cũng cần thấy để
     trả lời được câu "sao nhà này đóng ít hơn nhà kia". */
  const ke = (r.results || []).map(x => ({
    idKy: x.id, tang: x.tang, ky: x.ky, soKy: x.soKy,
    phaiThu: Number(x.phaiThu), mienGiam: Number(x.giam), daThu: Number(x.daThu),
    conNo: Number(x.phaiThu) - Number(x.giam) - Number(x.daThu),
    hanLuc: x.hanLuc, congTruoc: x.congTruoc || null,
    quaHan: !!(x.hanLuc && new Date(x.hanLuc) < new Date() &&
               Number(x.daThu) + Number(x.giam) < Number(x.phaiThu))
  }));

  return {ok: true, maKhachHang: nha, ke,
    tongPhaiThu:  ke.reduce((a, x) => a + x.phaiThu, 0),
    tongMienGiam: ke.reduce((a, x) => a + x.mienGiam, 0),
    tongDaThu:    ke.reduce((a, x) => a + x.daThu, 0),
    tongConNo:    ke.reduce((a, x) => a + x.conNo, 0),
    soKyQuaHan:   ke.filter(x => x.quaHan).length};
}

/* ═══════════════ HOA HỒNG PHẢI TRẢ ═══════════════

   BẢN CHÉP của G.HH_BAC. Hai bậc, và bậc trên đòi CẢ HAI nhà cùng đạt
   chín mươi — vì mười phần trăm là TRẦN của cả hệ, và trả trần cho một
   phía làm tốt còn phía kia vừa đủ là dạy rằng kèm giỏi thì bù được
   cho nếp nhà mình. */
const HH_BAC = [
  {ma: 'B10', phanTram: 10, kpiNhaKem: 90, kpiNhaDuocKem: 90},
  {ma: 'B5',  phanTram: 5,  kpiNhaKem: 80, kpiNhaDuocKem: null}
];
const HH_TRAN = 10;

/** Sinh khoản hoa hồng khi một nhà vừa VƯỢT TẦNG.

    Gọi từ nangTang. Không có nhà bảo trợ thì không sinh gì — và đó là
    trường hợp thường, nên nó phải rẻ và im lặng. */
export async function sinhHoaHong(db, nhaDuocKem, tangVuot, kpiDuocKem) {
  const hs = await db.prepare('SELECT * FROM hoSoKhach WHERE maKhachHang = ?')
    .bind(nhaDuocKem).first();
  const nhaKem = hs && String(hs.boTro || '').trim();
  if (!nhaKem) return null;

  /* TẦNG MỘT KHÔNG CÓ TIỀN, VÀ ĐÓ LÀ ĐIỀU KHOẢN CHỨ KHÔNG PHẢI PHÉP
     NHÂN RA 0 — chốt HH-CC-03. Suy điều khoản từ giá thì ngày Học viện
     mở một đợt miễn phí cho tầng hai là điều khoản tầng hai lặng lẽ
     đổi theo, không ai bấm nút nào và không ai được báo. */
  if (tangVuot <= 1) return null;

  const kemHs = await db.prepare('SELECT * FROM hoSoKhach WHERE maKhachHang = ?')
    .bind(nhaKem).first();
  if (!kemHs) return null;
  const kpiKem = await kpiCuaNha(db, nhaKem);

  const bac = HH_BAC.find(b =>
    Number(kpiKem) >= b.kpiNhaKem &&
    (b.kpiNhaDuocKem === null || Number(kpiDuocKem) >= b.kpiNhaDuocKem));
  if (!bac) return null;

  /* Hoa hồng tính trên giá gói ĐANG CHẠY lúc trả, không trên hằng số. */
  const bgHH = await docGiaHienHanh(db);
  const goi = bgHH.gia[tangVuot] || 0;
  const pt = Math.min(bac.phanTram, HH_TRAN);   /* trần chặn thật, không chỉ là một câu chữ */
  const tien = Math.round(goi * pt / 100);

  try {
    const id = 'HH-' + tokenMoi().slice(0, 14);
    await db.prepare(
      'INSERT INTO hoaHongTra (id,nhaKem,nhaDuocKem,tangVuot,bac,phanTram,goiCanCu,soTien,' +
      "kpiNhaKem,kpiNhaDuocKem,trangThai,sinhLuc) VALUES (?,?,?,?,?,?,?,?,?,?,'phaiTra',?)"
    ).bind(id, nhaKem, nhaDuocKem, tangVuot, bac.ma, pt, goi, tien,
      kpiKem, kpiDuocKem, new Date().toISOString()).run();
    return {id, nhaKem, bac: bac.ma, phanTram: pt, soTien: tien};
  } catch (e) {
    /* ix_hh_mot: một lượt vượt tầng sinh ĐÚNG MỘT khoản. Bấm hai lần
       là trả hai lần, và tiền đã ra thì không gọi về được. */
    if (/hoaHongTra/.test(String(e && e.message || e))) return null;
    throw e;
  }
}

async function kpiCuaNha(db, ma) {
  const r = await db.prepare(
    'SELECT s.kpi FROM hoSoKhach h JOIN students s ON s.id = h.maHocVien ' +
    'WHERE h.maKhachHang = ?'
  ).bind(ma).first();
  return Number(r && r.kpi) || 0;
}

/* ═══════════════ BẢN KÊ TÀI CHÍNH ═══════════════

   Chỉ R01–R03. Bản kê này gộp tiền của cả hệ; nó không phải thứ để mở
   ra xem cho biết. */
export async function banKeTaiChinh(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 3) return {ok: false, code: 'NOPERM', error: 'Chỉ R01–R03 xem được bản kê tài chính.'};

  const tu = String(y.tu || '1970-01-01');
  const den = String(y.den || new Date().toISOString());

  const thu = await db.prepare(
    "SELECT COALESCE(SUM(soTien),0) t, COUNT(*) n FROM phieuThu " +
    "WHERE trangThai = 'daDuyet' AND ghiLuc >= ? AND ghiLuc <= ?"
  ).bind(tu, den).first();

  const cho = await db.prepare(
    "SELECT COALESCE(SUM(soTien),0) t, COUNT(*) n FROM phieuThu WHERE trangThai = 'choDuyet'"
  ).first();

  const hoan = await db.prepare(
    "SELECT COALESCE(SUM(soTien),0) t, COUNT(*) n FROM hoanTien " +
    "WHERE trangThai = 'daDuyet' AND duyetLuc >= ? AND duyetLuc <= ?"
  ).bind(tu, den).first();

  const hh = await db.prepare(
    "SELECT COALESCE(SUM(soTien),0) t, COUNT(*) n FROM hoaHongTra WHERE trangThai = 'phaiTra'"
  ).first();

  const theoTang = await db.prepare(
    'SELECT k.tang, COALESCE(SUM(k.phaiThu),0) phai, ' +
    "  COALESCE(SUM(CASE WHEN p.trangThai = 'daDuyet' THEN p.soTien END),0) da " +
    'FROM kyThu k LEFT JOIN phieuThu p ON p.idKy = k.id GROUP BY k.tang ORDER BY k.tang'
  ).all();

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'BANKE_TAICHINH',
    chiTiet: tu.slice(0, 10) + ' → ' + den.slice(0, 10)});

  return {ok: true, tu, den,
    daThu: {tien: Number(thu.t), so: Number(thu.n)},
    choDuyet: {tien: Number(cho.t), so: Number(cho.n)},
    daHoan: {tien: Number(hoan.t), so: Number(hoan.n)},
    hoaHongPhaiTra: {tien: Number(hh.t), so: Number(hh.n)},
    theoTang: (theoTang.results || []).map(x => ({
      tang: x.tang, phaiThu: Number(x.phai), daThu: Number(x.da),
      conNo: Number(x.phai) - Number(x.da)})),
    /* Bản kê KHÔNG tự cộng ra một con số "lợi nhuận": chi phí vận hành
       không nằm trong hệ này, nên một con số như thế sẽ sai và sẽ được
       ai đó mang đi họp. */
    suyRa: SUY_RA.map(x => x.ma + ' · ' + x.viec)};
}

/* ═══════════════════════════════════════════════════════════════
   TÁM TÌNH HUỐNG TIỀN NONG CÒN LẠI

   Tới bản 9.88 phần tài chính chỉ đi được ĐƯỜNG THẲNG: dựng lịch, ghi
   phiếu, duyệt, xem công nợ. Đường thẳng là đường ít xảy ra nhất.

   Những gì thật sự xảy ra ở một Học viện đang chạy:

     1. Duyệt phiếu xong mới biết ngân hàng hoàn giao dịch
     2. Ghi nhầm tiền của nhà A vào nhà B
     3. Gia đình dừng giữa chừng và đòi hoàn theo luật của tầng
     4. Hoa hồng đã sinh cho một nhà, rồi nhà ấy được hoàn tiền
     5. Hoa hồng nằm mãi ở "phải trả" vì không có đường trả
     6. Khách chuyển dư, hoặc chuyển trước khi có kỳ
     7. Nhà nghỉ mà lịch thu vẫn treo, tháng nào cũng vào bản kê nợ
     8. Sổ lệch mà không ai biết, vì không có phép đối soát nào

   Bảng hoanTien dựng ở 9.88 và tới 9.88 KHÔNG có một dòng mã nào ghi
   vào — một bảng chết. Đây là phần làm cho nó sống.
   ═══════════════════════════════════════════════════════════════ */

/* ── 1 · HUỶ MỘT PHIẾU ĐÃ DUYỆT ──

   Ngân hàng hoàn giao dịch, hoặc phát hiện ghi nhầm nhà. Cần một
   đường đi RA, và đường ấy không được là phép xoá.

   HUỶ LÀ ĐÁNH DẤU. Xoá dòng là xoá luôn bằng chứng rằng tiền đã từng
   được ghi nhận và đã từng được duyệt — mà đó chính là thứ phải trưng
   ra khi có người hỏi "tháng trước sổ báo đủ, sao giờ thiếu". */
export async function huyPhieuThu(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 3) return {ok: false, error: 'Chỉ R01–R03 huỷ được phiếu thu đã duyệt.'};

  const lyDo = String(y.lyDo || '').trim();
  if (!lyDo) return {ok: false,
    error: 'Chưa nói vì sao huỷ. Một khoản tiền ra khỏi sổ mà không có lý do ' +
           'thì tháng sau không ai dựng lại được câu chuyện.'};

  const pt = await db.prepare('SELECT * FROM phieuThu WHERE id = ?')
    .bind(String(y.id || '')).first();
  if (!pt) return {ok: false, error: 'Không tìm thấy phiếu thu này.'};

  const r = await db.prepare(
    "UPDATE phieuThu SET trangThai = 'huy', lyDo = ?, nguoiDuyet = ?, duyetLuc = ? " +
    "WHERE id = ? AND trangThai IN ('daDuyet','choDuyet')"
  ).bind(lyDo, hoSo.u, new Date().toISOString(), pt.id).run();
  if (!((r && r.meta && r.meta.changes) || 0))
    return {ok: false, error: 'Phiếu này đã huỷ hoặc đã bị từ chối rồi.'};

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'PHIEUTHU_HUY',
    doiTuong: pt.id, chiTiet: pt.maKhachHang + ' · ' + dinhDang(pt.soTien) + ' · ' + lyDo});

  /* PHIẾU NÀY CÓ THUỘC MỘT TUẦN ĐÃ CHỐT KHÔNG.

     Nếu có: sổ tuần ấy đã đóng và KHÔNG được sửa. Khoản giảm đi ghi
     thành một bút toán điều chỉnh, rơi vào kỳ đang mở, có trỏ ngược
     về tuần bị ảnh hưởng — đúng cách sổ sách thật làm.

     Không có bước này thì bản báo cáo tuần ấy in ra tháng trước và bản
     in lại tháng sau ra hai số khác nhau, và không dòng nào giải thích
     vì sao. Số tiền để ÂM vì đây là một khoản giảm. */
  const dc = await ghiDieuChinh(db, {
    lucGoc: pt.ghiLuc, loai: 'huyPhieu', idChungTu: pt.id,
    maKhachHang: pt.maKhachHang, soTien: -Number(pt.soTien), boi: hoSo.u,
    dienGiai: 'Huỷ phiếu thu đã vào sổ tuần đã chốt · ' + lyDo});

  /* Công nợ tự đúng lại: congNo chỉ cộng phiếu daDuyet, nên phiếu vừa
     huỷ rời khỏi phép cộng ngay mà không phải sửa con số nào. Đó là
     lợi ích của việc không lưu số dư — số dư luôn được TÍNH, không
     được GIỮ, nên nó không bao giờ lệch với chứng từ. */
  return {ok: true, trangThai: 'huy',
    dieuChinh: dc ? {id: dc.id, kyBiAnhHuong: dc.kyBiAnhHuong,
      vi: 'Phiếu này nằm trong kỳ ĐÃ CHỐT ' + dc.kyBiAnhHuong + '. Sổ kỳ ấy giữ ' +
          'nguyên; khoản giảm ghi thành bút toán điều chỉnh ở kỳ đang mở.'} : undefined};
}

/* ── 2 · GÁN MỘT KHOẢN THU NGOÀI LỊCH VÀO MỘT KỲ ──

   Khách chuyển trước khi có kỳ, hoặc chuyển gộp nhiều kỳ. Khoản ấy
   vào sổ với idKy trống, và cần một đường gán về sau — không có đường
   ấy thì tiền nằm trong sổ mà không trừ nợ của ai. */
export async function ganPhieuVaoKy(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 3) return {ok: false, error: 'Chỉ R01–R03 gán được khoản thu vào kỳ.'};

  const pt = await db.prepare('SELECT * FROM phieuThu WHERE id = ?')
    .bind(String(y.id || '')).first();
  if (!pt) return {ok: false, error: 'Không tìm thấy phiếu thu này.'};
  if (pt.idKy) return {ok: false, error: 'Phiếu này đã gắn với một kỳ rồi.'};
  if (pt.trangThai === 'huy' || pt.trangThai === 'tuChoi')
    return {ok: false, error: 'Phiếu đã huỷ hoặc bị từ chối thì không gán được.'};

  const ky = await db.prepare('SELECT * FROM kyThu WHERE id = ?')
    .bind(String(y.idKy || '')).first();
  if (!ky) return {ok: false, error: 'Không tìm thấy kỳ thu này.'};
  if (String(ky.maKhachHang) !== String(pt.maKhachHang))
    return {ok: false, error: 'Kỳ thu này thuộc về một nhà khác.'};

  const con = await conNoCuaKy(db, pt.maKhachHang, Number(ky.tang), Number(ky.ky));
  if (Number(pt.soTien) > con)
    return {ok: false, code: 'THUTHUA',
      error: 'Kỳ này chỉ còn thiếu ' + dinhDang(con) + ', mà phiếu là ' +
        dinhDang(pt.soTien) + '. Tách phiếu trước khi gán.'};

  await db.prepare('UPDATE phieuThu SET idKy = ? WHERE id = ? AND idKy IS NULL')
    .bind(ky.id, pt.id).run();

  /* Gán một khoản treo vào kỳ KHÔNG đổi số tiền thu của tuần nào — nó
     chỉ đổi chỗ khoản ấy trừ nợ. Nhưng bản công nợ của tuần đã chốt
     thì đổi, nên vẫn phải để lại vết. Số tiền để 0: đây là bút toán
     ghi chú, không phải bút toán tiền. */
  const dc = await ghiDieuChinh(db, {
    lucGoc: pt.ghiLuc, loai: 'ganPhieu', idChungTu: pt.id,
    maKhachHang: pt.maKhachHang, soTien: 0, boi: hoSo.u,
    dienGiai: 'Gán khoản thu treo vào kỳ ' + ky.ky + ' tầng ' + ky.tang +
      ' — đổi chỗ trừ nợ, không đổi số tiền thu của kỳ đã chốt'});

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'PHIEUTHU_GAN',
    doiTuong: pt.id, chiTiet: 'vào kỳ ' + ky.ky + ' tầng ' + ky.tang});
  return {ok: true, idKy: ky.id,
    dieuChinh: dc ? {id: dc.id, kyBiAnhHuong: dc.kyBiAnhHuong} : undefined};
}

/* ── 3 · HOÀN TIỀN ──

   Mỗi tầng có luật hoàn RIÊNG, khai bằng CHỮ ở HP_TANG[].hoan:

     T1 giao đủ mà chưa như mong đợi thì không hoàn
     T2 dừng trước ngày 7 hoàn phần chưa dùng theo tỷ lệ ngày
     T3 chuỗi đang chạy không hoàn, chuỗi chưa bắt đầu hoàn đủ
     T4 quý đang chạy không hoàn, quý chưa bắt đầu hoàn đủ
     T5 như T4, thêm đường hạ về tầng 4 và hoàn chênh lệch

   MÁY KHÔNG TỰ TÍNH SỐ TIỀN HOÀN. Luật ấy là chữ, không phải công
   thức: "phần chưa dùng theo tỷ lệ ngày" cần biết ngày dừng thật,
   "chuỗi đang chạy" cần biết nhà đang ở chuỗi nào, và cả hai đều là
   việc người đọc hồ sơ mới trả lời được.

   Máy làm đúng ba việc: bắt PHẢI ghi lại theo luật nào, bắt phải có
   NGƯỜI KHÁC duyệt, và không cho hoàn quá số đã thu. */
export async function deXuatHoan(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 7) return {ok: false, error: 'Từ Coach trở lên mới đề xuất hoàn tiền được.'};

  const h = y.hoan || {};
  const nha = String(h.maKhachHang || '').trim();
  const tien = Number(h.soTien || 0);
  const luat = String(h.theoLuat || '').trim();
  const lyDo = String(h.lyDo || '').trim();
  if (!nha) return {ok: false, error: 'Thiếu mã khách hàng.'};
  if (!(tien > 0)) return {ok: false, error: 'Số tiền hoàn phải lớn hơn 0.'};
  if (luat.length < 20) return {ok: false,
    error: 'Phải ghi lại HOÀN THEO LUẬT NÀO, nguyên văn từ bảng học phí của tầng ấy. ' +
           'Một lượt hoàn không nêu luật là một lượt hoàn không đứng được khi có người hỏi.'};
  if (!lyDo) return {ok: false, error: 'Chưa nói vì sao hoàn.'};

  /* KHÔNG HOÀN QUÁ SỐ ĐÃ THU. Một sổ hoàn nhiều hơn thu là một sổ có
     tiền chảy ra từ hư không, và không phép cộng nào bắt được nó nếu
     chỗ này không chặn. */
  const daThu = await db.prepare(
    "SELECT COALESCE(SUM(soTien),0) t FROM phieuThu " +
    "WHERE maKhachHang = ? AND trangThai = 'daDuyet'"
  ).bind(nha).first();
  const daHoan = await db.prepare(
    "SELECT COALESCE(SUM(soTien),0) t FROM hoanTien " +
    "WHERE maKhachHang = ? AND trangThai IN ('daDuyet','choDuyet')"
  ).bind(nha).first();
  const conHoanDuoc = Number(daThu.t) - Number(daHoan.t);
  if (tien > conHoanDuoc)
    return {ok: false, code: 'QUAHOAN',
      error: 'Nhà này đã thu ' + dinhDang(Number(daThu.t)) + ', đã hoàn hoặc đang ' +
        'chờ hoàn ' + dinhDang(Number(daHoan.t)) + '. Chỉ hoàn thêm được tối đa ' +
        dinhDang(Math.max(0, conHoanDuoc)) + '.'};

  const id = 'HT-' + tokenMoi().slice(0, 14);
  await db.prepare(
    'INSERT INTO hoanTien (id,maKhachHang,idPhieuThu,soTien,theoLuat,lyDo,nguoiDeXuat,' +
    "deXuatLuc,trangThai) VALUES (?,?,?,?,?,?,?,?,'choDuyet')"
  ).bind(id, nha, h.idPhieuThu || null, tien, luat.slice(0, 800), lyDo.slice(0, 500),
    hoSo.u, new Date().toISOString()).run();

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'HOAN_DEXUAT',
    doiTuong: id, chiTiet: nha + ' · ' + dinhDang(tien)});
  return {ok: true, id, trangThai: 'choDuyet', conHoanDuoc};
}

export async function duyetHoan(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 3) return {ok: false, error: 'Chỉ R01–R03 duyệt được hoàn tiền.'};

  const ht = await db.prepare('SELECT * FROM hoanTien WHERE id = ?')
    .bind(String(y.id || '')).first();
  if (!ht) return {ok: false, error: 'Không tìm thấy đề xuất hoàn này.'};

  /* Cùng luật với phiếu thu: người đề xuất không tự duyệt cho mình. */
  if (String(ht.nguoiDeXuat) === String(hoSo.u))
    return {ok: false, error: 'Người đề xuất hoàn không tự duyệt được.'};

  const duyet = y.duyet !== false;

  /* ══ THANG CHỮ KÝ THEO SỐ TIỀN (9.99.117) ══
     Cấp người duyệt phải đủ theo số tiền hoàn — dùng lại thang mốc chu kỳ
     của chi trực tiếp, không đặt ngưỡng mới. Chỉ áp khi DUYỆT (từ chối thì
     cấp nào cũng được — chặn tiền ra là an toàn). */
  if (duyet) {
    const can = capDuyetTheoTien(Number(ht.soTien));
    if (lv > can.bac) return {ok: false, code: 'CANCAPCAOHON',
      error: 'Khoản hoàn ' + Number(ht.soTien).toLocaleString('vi-VN') + 'đ cần ' +
        can.tenVai + ' duyệt (thang chữ ký theo số tiền, mốc ' + can.moc +
        '). Cấp hiện tại chưa đủ — chi cùng cỡ cũng đòi đúng cấp này.'};
  }
  const gio = new Date().toISOString();
  const r = await db.prepare(
    'UPDATE hoanTien SET trangThai = ?, nguoiDuyet = ?, duyetLuc = ? ' +
    "WHERE id = ? AND trangThai = 'choDuyet'"
  ).bind(duyet ? 'daDuyet' : 'tuChoi', hoSo.u, gio, ht.id).run();
  if (!((r && r.meta && r.meta.changes) || 0))
    return {ok: false, error: 'Đề xuất này đã được xử lý rồi.'};

  let hh = null;
  if (duyet) hh = await soatHoaHongSauHoan(db, ht.maKhachHang, hoSo.u);

  /* KHOẢN HOÀN THUỘC VỀ KỲ CỦA PHIẾU GỐC, KHÔNG PHẢI KỲ HÔM NAY.

     Tiền hoàn duyệt hôm nay, nhưng nó làm giảm doanh thu của cái kỳ mà
     phiếu gốc đã vào sổ. Nếu kỳ ấy đã chốt thì đây đúng là chỗ phải có
     một bút toán điều chỉnh — và phải trỏ về kỳ của PHIẾU GỐC, không
     phải kỳ hôm nay, nếu không thì tra ngược sẽ dẫn nhầm chỗ.

     Khoản hoàn không gắn phiếu gốc nào thì không quy về kỳ nào được;
     lúc ấy nó nằm trọn trong kỳ đang mở và không cần điều chỉnh. */
  let dc = null;
  if (duyet && ht.idPhieuThu) {
    const goc = await db.prepare('SELECT ghiLuc FROM phieuThu WHERE id = ?')
      .bind(ht.idPhieuThu).first();
    if (goc) dc = await ghiDieuChinh(db, {
      lucGoc: goc.ghiLuc, loai: 'duyetHoan', idChungTu: ht.id,
      maKhachHang: ht.maKhachHang, soTien: -Number(ht.soTien), boi: hoSo.u,
      dienGiai: 'Hoàn tiền cho phiếu ' + ht.idPhieuThu + ' đã vào sổ kỳ đã chốt · ' +
        String(ht.lyDo || '').slice(0, 200)});
  }

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u,
    viec: duyet ? 'HOAN_DUYET' : 'HOAN_TUCHOI',
    doiTuong: ht.id, chiTiet: ht.maKhachHang + ' · ' + dinhDang(ht.soTien)});
  return {ok: true, trangThai: duyet ? 'daDuyet' : 'tuChoi', hoaHong: hh || undefined,
    dieuChinh: dc ? {id: dc.id, kyBiAnhHuong: dc.kyBiAnhHuong} : undefined};
}

/* ── 4 · HOÀN TIỀN RỒI THÌ HOA HỒNG PHẢI ĐỘNG THEO ──

   Hoa hồng tính trên GÓI của nhà được kèm. Nhà ấy được hoàn tiền thì
   cái gói ấy không còn nguyên, và khoản hoa hồng dựa trên nó cũng vậy.

   Máy làm được MỘT nửa và chỉ làm đúng nửa ấy:

     · khoản còn ở "phải trả" thì HUỶ — tiền chưa ra, huỷ được sạch
     · khoản ĐÃ TRẢ thì KHÔNG tự đòi lại. Tiền đã vào tay người khác;
       đòi lại là một cuộc nói chuyện, không phải một câu lệnh. Máy
       nêu tên khoản ấy ra để người phụ trách đi nói chuyện.

   Tự động trừ ngược một khoản đã trả là cách nhanh nhất để một Đại sứ
   mở app thấy số dư âm mà không ai báo trước. */
async function soatHoaHongSauHoan(db, maKhachHang, boi) {
  const r = await db.prepare(
    'SELECT * FROM hoaHongTra WHERE nhaDuocKem = ?'
  ).bind(maKhachHang).all();
  const ds = r.results || [];
  const huy = [], daTra = [];
  for (const x of ds) {
    if (x.trangThai === 'phaiTra') {
      await db.prepare(
        "UPDATE hoaHongTra SET trangThai = 'huy', lyDo = ?, nguoiDuyet = ?, huyLuc = ? " +
        "WHERE id = ? AND trangThai = 'phaiTra'"
      ).bind('Nhà được kèm đã được hoàn tiền', boi, new Date().toISOString(), x.id).run();
      huy.push(x.id);
    } else if (x.trangThai === 'daTra') {
      daTra.push({id: x.id, nhaKem: x.nhaKem, soTien: x.soTien});
    }
  }
  if (huy.length || daTra.length)
    await Kho.ghiNhatKy(db, {username: boi, viec: 'HOAHONG_SOAT_SAU_HOAN',
      doiTuong: maKhachHang,
      chiTiet: 'huỷ ' + huy.length + ' khoản chưa trả · ' + daTra.length +
        ' khoản ĐÃ TRẢ cần nói chuyện lại'});
  return {daHuy: huy, daTraCanNoiChuyen: daTra};
}

/* ── 5 · TRẢ HOA HỒNG ──

   Không có đường này thì mọi khoản nằm mãi ở "phải trả", và bản kê
   tài chính tháng nào cũng cộng lại đúng những khoản đã trả từ lâu. */
export async function traHoaHong(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 3) return {ok: false, error: 'Chỉ R01–R03 duyệt trả hoa hồng.'};

  const hh = await db.prepare('SELECT * FROM hoaHongTra WHERE id = ?')
    .bind(String(y.id || '')).first();
  if (!hh) return {ok: false, error: 'Không tìm thấy khoản hoa hồng này.'};

  /* ══ THANG CHỮ KÝ THEO SỐ TIỀN (9.99.117) ══
     Trả hoa hồng là tiền RA — cấp người duyệt phải đủ theo số tiền, dùng
     lại thang mốc chu kỳ, không đặt ngưỡng mới. */
  const canHH = capDuyetTheoTien(Number(hh.soTien));
  if (lv > canHH.bac) return {ok: false, code: 'CANCAPCAOHON',
    error: 'Khoản hoa hồng ' + Number(hh.soTien).toLocaleString('vi-VN') + 'đ cần ' +
      canHH.tenVai + ' duyệt (thang chữ ký theo số tiền, mốc ' + canHH.moc +
      '). Cấp hiện tại chưa đủ — chi cùng cỡ cũng đòi đúng cấp này.'};

  /* CHỈ TRẢ KHI CHỨNG CỨ ĐÃ ĐƯỢC NHÀ ĐƯỢC KÈM XÁC NHẬN.

     Đây là chỗ nối hai phần lại: bảng chứng cứ dựng ra để đứng được
     khi đối chất, mà nếu tiền vẫn ra được khi chưa ai xác nhận thì
     bảng ấy chỉ là thủ tục. Chưa có mã chứng cứ thì cũng chưa trả —
     trả trước rồi mới đi tìm chứng cứ là làm ngược. */
  if (!hh.maChungCu) return {ok: false, code: 'CHUACHUNGCU',
    error: 'Khoản này chưa gắn với bản chứng cứ nào. Gắn chứng cứ đã được ' +
           'nhà được kèm xác nhận rồi mới trả.'};
  const cc = await db.prepare('SELECT * FROM chungCu WHERE ma = ?').bind(hh.maChungCu).first();
  if (!cc || !String(cc.xacNhanBoi || '').trim())
    return {ok: false, code: 'CHUAXACNHAN',
      error: 'Bản chứng cứ của khoản này chưa được nhà được kèm xác nhận.'};

  const gio = new Date().toISOString();
  const r = await db.prepare(
    "UPDATE hoaHongTra SET trangThai = 'daTra', traLuc = ?, nguoiDuyet = ?, lyDo = ? " +
    "WHERE id = ? AND trangThai = 'phaiTra'"
  ).bind(gio, hoSo.u, String(y.lyDo || '').slice(0, 300) || null, hh.id).run();
  if (!((r && r.meta && r.meta.changes) || 0))
    return {ok: false, error: 'Khoản này đã trả hoặc đã huỷ rồi.'};

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'HOAHONG_TRA',
    doiTuong: hh.id, chiTiet: hh.nhaKem + ' · ' + dinhDang(hh.soTien)});
  return {ok: true, trangThai: 'daTra', soTien: hh.soTien};
}

/** Gắn một bản chứng cứ vào khoản hoa hồng. Tách khỏi lượt trả để
    người gắn và người trả có thể là hai người. */
export async function ganChungCuHoaHong(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 7) return {ok: false, error: 'Từ Coach trở lên mới gắn được chứng cứ.'};
  const hh = await db.prepare('SELECT * FROM hoaHongTra WHERE id = ?')
    .bind(String(y.id || '')).first();
  if (!hh) return {ok: false, error: 'Không tìm thấy khoản hoa hồng này.'};
  const cc = await db.prepare('SELECT * FROM chungCu WHERE ma = ?')
    .bind(String(y.maChungCu || '')).first();
  if (!cc) return {ok: false, error: 'Không tìm thấy bản chứng cứ này.'};
  await db.prepare("UPDATE hoaHongTra SET maChungCu = ? WHERE id = ? AND trangThai = 'phaiTra'")
    .bind(cc.ma, hh.id).run();
  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'HOAHONG_GAN_CC',
    doiTuong: hh.id, chiTiet: cc.ma});
  return {ok: true};
}

/* ── 6 · NHÀ NGHỈ HOẶC HẠ TẦNG: ĐÓNG KỲ CHƯA TỚI HẠN ──

   Nhà dừng giữa chừng mà lịch thu vẫn treo thì tháng nào bản kê nợ
   cũng gọi tên họ, và người phụ trách gọi điện đòi tiền một gia đình
   đã nghỉ. Đó là cách mất một khách hàng cũ lần thứ hai.

   ĐÓNG, KHÔNG XOÁ: kỳ đã tới hạn thì giữ nguyên vì nó là khoản nợ có
   thật; chỉ kỳ CHƯA tới hạn mới đóng. Luật hoàn của tầng nói đúng
   điều đó — "các chuỗi chưa bắt đầu thì hoàn đủ". */
export async function dongKyChuaToi(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 3) return {ok: false, error: 'Chỉ R01–R03 đóng được kỳ thu.'};

  const nha = String(y.maKhachHang || '').trim();
  const lyDo = String(y.lyDo || '').trim();
  if (!nha) return {ok: false, error: 'Thiếu mã khách hàng.'};
  if (!lyDo) return {ok: false, error: 'Chưa nói vì sao đóng.'};

  const bay = new Date().toISOString();
  /* Chỉ đóng kỳ CHƯA tới hạn VÀ chưa thu đồng nào. Kỳ đã thu một phần
     thì để nguyên — phần ấy phải đi qua đường hoàn tiền, nơi có luật
     hoàn và có người duyệt. */
  const r = await db.prepare(
    'DELETE FROM kyThu WHERE maKhachHang = ? AND hanLuc > ? AND id NOT IN ' +
    "(SELECT idKy FROM phieuThu WHERE idKy IS NOT NULL AND trangThai = 'daDuyet')"
  ).bind(nha, bay).run();
  const so = (r && r.meta && r.meta.changes) || 0;

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'KYTHU_DONG',
    doiTuong: nha, chiTiet: 'đóng ' + so + ' kỳ chưa tới hạn · ' + lyDo});
  return {ok: true, daDong: so,
    vi: 'Kỳ đã tới hạn và kỳ đã thu một phần thì giữ nguyên — phần ấy đi qua ' +
        'đường hoàn tiền, nơi có luật hoàn và có người duyệt.'};
}

/* ── 7 · DANH SÁCH QUÁ HẠN TOÀN HỆ ──

   congNo trả lời cho MỘT nhà. Người làm tài chính cần câu ngược lại:
   hôm nay những nhà nào đang quá hạn. Không có câu ấy thì cách duy
   nhất là mở từng nhà một. */
export async function dsQuaHan(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 3) return {ok: false, code: 'NOPERM',
    error: 'Chỉ R01–R03 xem được danh sách quá hạn của cả hệ.'};

  const bay = new Date().toISOString();
  const r = await db.prepare(
    'SELECT k.id, k.maKhachHang, k.tang, k.ky, k.phaiThu, k.hanLuc, ' +
    '  ' + TRU_MIEN_GIAM + ' AS giam, ' +
    "  COALESCE(SUM(CASE WHEN p.trangThai = 'daDuyet' THEN p.soTien END), 0) daThu, " +
    /* Người đi đòi cần biết đã gọi mấy lần và lần cuối bao giờ. Không
       có hai cột này thì danh sách quá hạn là một danh sách nhìn thì
       biết nhưng không làm được — mỗi lượt gọi lại bắt đầu từ đầu, và
       nhà đã hứa trả tuần sau vẫn bị gọi như nhà chưa ai liên lạc. */
    '  (SELECT COUNT(*) FROM nhacThu n WHERE n.maKhachHang = k.maKhachHang) soLanNhac, ' +
    '  (SELECT MAX(n.luc) FROM nhacThu n WHERE n.maKhachHang = k.maKhachHang) nhacLanCuoi, ' +
    '  (SELECT n.ketQua FROM nhacThu n WHERE n.maKhachHang = k.maKhachHang ' +
    '     ORDER BY n.luc DESC LIMIT 1) ketQuaLanCuoi, ' +
    '  (SELECT n.henLuc FROM nhacThu n WHERE n.maKhachHang = k.maKhachHang ' +
    '     AND n.henLuc IS NOT NULL ORDER BY n.luc DESC LIMIT 1) henTraLuc ' +
    'FROM kyThu k LEFT JOIN phieuThu p ON p.idKy = k.id ' +
    'WHERE k.hanLuc < ? GROUP BY k.id ' +
    'HAVING daThu + ' + TRU_MIEN_GIAM + ' < k.phaiThu ' +
    'ORDER BY k.hanLuc LIMIT 500'
  ).bind(bay).all();

  const ds = (r.results || []).map(x => ({
    idKy: x.id, maKhachHang: x.maKhachHang, tang: x.tang, ky: x.ky,
    conNo: Number(x.phaiThu) - Number(x.giam) - Number(x.daThu), hanLuc: x.hanLuc,
    mienGiam: Number(x.giam) || undefined,
    soLanNhac: Number(x.soLanNhac), nhacLanCuoi: x.nhacLanCuoi || undefined,
    ketQuaLanCuoi: x.ketQuaLanCuoi || undefined,
    henTraLuc: x.henTraLuc || undefined,
    treNgay: Math.floor((Date.now() - new Date(x.hanLuc).getTime()) / 86400e3)
  }));
  return {ok: true, so: ds.length, tongConNo: ds.reduce((a, x) => a + x.conNo, 0), ds};
}

/* ── 8 · ĐỐI SOÁT ──

   Một sổ tài chính không có phép đối soát là một sổ chỉ đúng chừng nào
   chưa ai kiểm. Sáu câu hỏi dưới đây, mỗi câu nhắm vào một kiểu lệch
   ĐÃ CÓ THẬT trong các hệ tương tự — không phải kiểu lệch tôi nghĩ ra
   cho đủ số.

   Phép đối soát này KHÔNG SỬA GÌ. Nó chỉ nêu ra; sửa là việc của
   người, vì mỗi chỗ lệch có một câu chuyện riêng và máy không biết
   câu chuyện ấy. */
export async function doiSoat(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 3) return {ok: false, code: 'NOPERM', error: 'Chỉ R01–R03 chạy được đối soát.'};

  const lech = [];
  const hoi = async (ma, viec, cau, dv, vi) => {
    const r = await db.prepare(cau).bind(...(dv || [])).all();
    const ds = r.results || [];
    if (ds.length) lech.push({ma, viec, so: ds.length, vi, viDu: ds.slice(0, 5)});
  };

  await hoi('DS-1', 'Phiếu thu trỏ vào một kỳ không còn tồn tại',
    'SELECT id, maKhachHang, idKy FROM phieuThu WHERE idKy IS NOT NULL ' +
    'AND idKy NOT IN (SELECT id FROM kyThu) LIMIT 50', [],
    'Kỳ bị đóng trong khi đã có phiếu gắn vào. Tiền vẫn trong sổ nhưng không ' +
    'trừ nợ của kỳ nào — nó biến mất khỏi mọi bản kê công nợ.');

  await hoi('DS-2', 'Kỳ thu của một nhà không có tệp khách hàng',
    'SELECT id, maKhachHang FROM kyThu WHERE maKhachHang NOT IN ' +
    '(SELECT maKhachHang FROM hoSoKhach) LIMIT 50', [],
    'Công nợ treo cho một nhà không tra được. Thường do dựng lịch bằng một mã ' +
    'gõ tay sai một ký tự.');

  await hoi('DS-3', 'Nhà đang ở tầng có phí mà chưa có kỳ thu nào',
    'SELECT maKhachHang, tang FROM hoSoKhach WHERE tang >= 2 ' +
    'AND maKhachHang NOT IN (SELECT maKhachHang FROM kyThu) LIMIT 50', [],
    'Nhà học mà không có ai đòi tiền. Thường do nâng tầng bằng đường sửa thẳng ' +
    'cơ sở dữ liệu, đi vòng qua nangTang.');

  await hoi('DS-4', 'Kỳ thu đã thu QUÁ số phải thu',
    'SELECT k.id, k.maKhachHang, k.phaiThu, ' + TRU_MIEN_GIAM + ' AS giam, ' +
    "  SUM(CASE WHEN p.trangThai = 'daDuyet' THEN p.soTien ELSE 0 END) daThu " +
    'FROM kyThu k JOIN phieuThu p ON p.idKy = k.id ' +
    'GROUP BY k.id HAVING daThu > k.phaiThu - ' + TRU_MIEN_GIAM + ' LIMIT 50', [],
    'Cổng chặn thu thừa nằm ở lúc GHI phiếu; dòng nào lọt qua được là dòng ' +
    'vào sổ bằng một đường khác.');

  await hoi('DS-5', 'Hoàn nhiều hơn thu',
    'SELECT h.maKhachHang, SUM(h.soTien) hoan FROM hoanTien h ' +
    "WHERE h.trangThai = 'daDuyet' GROUP BY h.maKhachHang " +
    'HAVING hoan > (SELECT COALESCE(SUM(p.soTien),0) FROM phieuThu p ' +
    "  WHERE p.maKhachHang = h.maKhachHang AND p.trangThai = 'daDuyet') LIMIT 50", [],
    'Tiền chảy ra từ hư không. Thường do huỷ một phiếu thu SAU khi đã duyệt ' +
    'hoàn dựa trên chính phiếu ấy.');

  await hoi('DS-6', 'Hoa hồng đã trả cho một nhà đã được hoàn tiền',
    'SELECT id, nhaKem, nhaDuocKem, soTien FROM hoaHongTra ' +
    "WHERE trangThai = 'daTra' AND nhaDuocKem IN " +
    "(SELECT maKhachHang FROM hoanTien WHERE trangThai = 'daDuyet') LIMIT 50", [],
    'Máy KHÔNG tự đòi lại tiền đã ra tay người khác — đó là một cuộc nói chuyện, ' +
    'không phải một câu lệnh. Nêu tên ra để người phụ trách đi nói chuyện.');

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'DOI_SOAT',
    chiTiet: lech.length ? lech.map(x => x.ma).join(',') : 'sạch'});

  return {ok: true, sach: lech.length === 0, soLech: lech.length, lech,
    vi: 'Phép đối soát KHÔNG SỬA GÌ. Mỗi chỗ lệch có một câu chuyện riêng, ' +
        'và máy không biết câu chuyện ấy.'};
}

/* ═══════════════════════════════════════════════════════════════
   MIỄN GIẢM HỌC PHÍ

   Học bổng, giảm cho anh chị em cùng học, giảm theo hoàn cảnh: chuyện
   có thật hằng tháng, và tới bản 9.90 không có đường nào ghi. Nên cách
   duy nhất là một trong hai đường sai:

     sửa thẳng phaiThu   — xoá mất cam kết gốc. Sang năm không ai trả
                           lời được "đáng lẽ đóng bao nhiêu, được giảm
                           bao nhiêu, ai duyệt".
     ghi một phiếu giả   — thổi phồng TIỀN THỰC THU. Sổ báo đã thu một
                           khoản chưa từng vào tài khoản nào, và nó lọt
                           thẳng vào bản đối chiếu sao kê.

   Nên: một dòng riêng. Cam kết ở kyThu giữ nguyên, công nợ trừ đi phần
   đã duyệt. Cùng một hình với hoàn tiền — người đề xuất khác người
   duyệt, và phải ghi GIẢM THEO LUẬT NÀO.
   ═══════════════════════════════════════════════════════════════ */

const MG_LOAI = ['hocBong', 'anhChiEm', 'hoanCanh', 'khuyenMai', 'khac'];

export async function deXuatMienGiam(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 7) return {ok: false, code: 'NOPERM',
    error: 'Từ Coach trở lên mới đề xuất miễn giảm được.'};

  const m = y.mienGiam || {};
  const tien = Number(m.soTien || 0);
  const loai = String(m.loai || '').trim();
  const luat = String(m.theoLuat || '').trim();
  const lyDo = String(m.lyDo || '').trim();

  if (!(tien > 0)) return {ok: false, error: 'Số tiền miễn giảm phải lớn hơn 0.'};
  if (MG_LOAI.indexOf(loai) < 0) return {ok: false,
    error: 'Loại miễn giảm phải là một trong: ' + MG_LOAI.join(', ') + '.'};
  if (!luat) return {ok: false,
    error: 'Phải ghi GIẢM THEO LUẬT NÀO — nguyên văn quy định hoặc quyết định ' +
           'cho giảm. Một khoản giảm không dẫn được về luật nào là một khoản ' +
           'do một người quyết, và người ấy sẽ phải trả lời một mình.'};
  if (!lyDo) return {ok: false, error: 'Chưa nói vì sao giảm cho nhà này.'};

  const ky = await db.prepare('SELECT * FROM kyThu WHERE id = ?')
    .bind(String(m.idKy || '')).first();
  if (!ky) return {ok: false, error: 'Không tìm thấy kỳ thu này.'};

  /* ── KHÔNG GIẢM QUÁ PHẦN CÒN LẠI CỦA KỲ ──

     Giảm quá thì công nợ âm, và một công nợ âm chảy vào mọi bản kê:
     tổng nợ của cả hệ nhỏ đi bằng đúng số ấy, và không dòng nào chỉ ra
     chỗ nó nhỏ đi. Đây cũng là cổng chặn chuyện dùng miễn giảm để rút
     tiền — giảm nhiều hơn phải thu rồi hoàn phần chênh. */
  const con = await conNoCuaKy(db, ky.maKhachHang, Number(ky.tang), Number(ky.ky));
  if (tien > con)
    return {ok: false, code: 'GIAMQUA',
      error: 'Kỳ này chỉ còn ' + dinhDang(con) + ' chưa đóng, mà đề xuất giảm ' +
        dinhDang(tien) + '. Giảm quá phần còn lại là dựng ra một công nợ âm.'};

  const id = 'MG-' + tokenMoi().slice(0, 14);
  await db.prepare(
    'INSERT INTO mienGiam (id,maKhachHang,idKy,soTien,loai,theoLuat,lyDo,' +
    "nguoiDeXuat,deXuatLuc,trangThai) VALUES (?,?,?,?,?,?,?,?,?,'choDuyet')"
  ).bind(id, ky.maKhachHang, ky.id, tien, loai, luat.slice(0, 1000),
    lyDo.slice(0, 1000), hoSo.u, new Date().toISOString()).run();

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'MIENGIAM_DEXUAT',
    doiTuong: id, chiTiet: ky.maKhachHang + ' · kỳ ' + ky.ky + ' tầng ' + ky.tang +
      ' · ' + dinhDang(tien) + ' · ' + loai});
  return {ok: true, id, soTien: tien, conLaiCuaKy: con, trangThai: 'choDuyet'};
}

export async function duyetMienGiam(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 3) return {ok: false, code: 'NOPERM', error: 'Chỉ R01–R03 duyệt được miễn giảm.'};

  const mg = await db.prepare('SELECT * FROM mienGiam WHERE id = ?')
    .bind(String(y.id || '')).first();
  if (!mg) return {ok: false, error: 'Không tìm thấy đề xuất miễn giảm này.'};

  if (String(mg.nguoiDeXuat) === String(hoSo.u))
    return {ok: false, code: 'TUDUYET',
      error: 'Người đề xuất miễn giảm không tự duyệt được.'};

  /* Kiểm LẠI ở lúc duyệt, không tin phép kiểm lúc đề xuất: giữa hai
     mốc ấy có thể đã có một khoản miễn giảm khác được duyệt cho cùng
     kỳ, hoặc một phiếu thu vừa vào. Hai đề xuất mỗi cái vừa đủ, cộng
     lại thì vượt — và không kiểm lại thì cả hai cùng lọt. */
  if (y.duyet !== false) {
    const ky = await db.prepare('SELECT * FROM kyThu WHERE id = ?').bind(mg.idKy).first();
    const con = ky ? await conNoCuaKy(db, ky.maKhachHang, Number(ky.tang), Number(ky.ky)) : 0;
    if (Number(mg.soTien) > con)
      return {ok: false, code: 'GIAMQUA',
        error: 'Kỳ này giờ chỉ còn ' + dinhDang(con) + ' chưa đóng, mà khoản giảm là ' +
          dinhDang(mg.soTien) + '. Từ lúc đề xuất tới giờ đã có khoản khác vào kỳ này.'};
  }

  const duyet = y.duyet !== false;
  const gio = new Date().toISOString();
  const r = await db.prepare(
    'UPDATE mienGiam SET trangThai = ?, nguoiDuyet = ?, duyetLuc = ? ' +
    "WHERE id = ? AND trangThai = 'choDuyet'"
  ).bind(duyet ? 'daDuyet' : 'tuChoi', hoSo.u, gio, mg.id).run();
  if (!((r && r.meta && r.meta.changes) || 0))
    return {ok: false, error: 'Đề xuất này đã được xử lý rồi.'};

  /* Miễn giảm làm giảm doanh thu của kỳ mà KỲ THU tới hạn, nên bút
     toán trỏ về mốc ấy — không trỏ về hôm nay. */
  let dc = null;
  if (duyet) {
    const ky = await db.prepare('SELECT hanLuc FROM kyThu WHERE id = ?').bind(mg.idKy).first();
    if (ky && ky.hanLuc) dc = await ghiDieuChinh(db, {
      lucGoc: ky.hanLuc, loai: 'duyetMienGiam', idChungTu: mg.id,
      maKhachHang: mg.maKhachHang, soTien: -Number(mg.soTien), boi: hoSo.u,
      dienGiai: 'Miễn giảm duyệt cho một kỳ đã vào sổ kỳ đã chốt · ' +
        String(mg.lyDo).slice(0, 200)});
  }

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u,
    viec: duyet ? 'MIENGIAM_DUYET' : 'MIENGIAM_TUCHOI',
    doiTuong: mg.id, chiTiet: mg.maKhachHang + ' · ' + dinhDang(mg.soTien)});
  return {ok: true, trangThai: duyet ? 'daDuyet' : 'tuChoi',
    dieuChinh: dc ? {id: dc.id, kyBiAnhHuong: dc.kyBiAnhHuong} : undefined};
}

export async function dsMienGiam(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 5) return {ok: false, code: 'NOPERM',
    error: 'Từ R01–R05 mới xem được sổ miễn giảm của cả hệ.'};

  const loc = [], gt = [];
  if (y.maKhachHang) { loc.push('maKhachHang = ?'); gt.push(String(y.maKhachHang)); }
  if (y.trangThai)   { loc.push('trangThai = ?');   gt.push(String(y.trangThai)); }
  if (y.loai)        { loc.push('loai = ?');        gt.push(String(y.loai)); }

  const r = await db.prepare(
    'SELECT * FROM mienGiam' + (loc.length ? ' WHERE ' + loc.join(' AND ') : '') +
    ' ORDER BY deXuatLuc DESC LIMIT 500'
  ).bind(...gt).all();
  const ds = r.results || [];

  const theoLoai = {};
  for (const x of ds) {
    if (x.trangThai !== 'daDuyet') continue;
    const t = theoLoai[x.loai] || (theoLoai[x.loai] = {loai: x.loai, so: 0, tien: 0});
    t.so++; t.tien += Number(x.soTien);
  }

  return {ok: true, so: ds.length, ds,
    tongDaDuyet: ds.filter(x => x.trangThai === 'daDuyet')
      .reduce((a, x) => a + Number(x.soTien), 0),
    choDuyet: ds.filter(x => x.trangThai === 'choDuyet')
      .reduce((a, x) => a + Number(x.soTien), 0),
    theoLoai: Object.values(theoLoai).sort((a, b) => b.tien - a.tien),
    loaiCoThe: MG_LOAI};
}

/* ═══════════════════════════════════════════════════════════════
   NHẮC THU

   dsQuaHan trả về những nhà đang nợ. Người đi đòi cần câu tiếp theo, và
   tới bản 9.90 không chỗ nào trả lời: nhà này đã nhắc mấy lần, lần cuối
   bao giờ, họ nói gì, có hẹn ngày nào không.

   Không có bảng này thì câu trả lời nằm trong đầu người phụ trách, và
   ngày họ nghỉ là ngày câu trả lời biến mất. Nhà đã hứa trả tuần sau
   vẫn bị gọi như nhà chưa ai liên lạc — đó là cách nhanh nhất làm một
   gia đình đang khó khăn thấy mình bị đòi nợ.

   VÀ ĐÂY LÀ CHỖ LUẬT "LÀM VIỆC TRÊN HỆ THỐNG" CÓ HIỆU LỰC THẬT. Coach
   và Tư vấn không được mang thông tin của khách ra làm việc riêng. Một
   lượt nhắc ghi ở đây là một lượt làm việc đúng quy định; không ghi thì
   không có gì chứng minh nó đã xảy ra trên hệ thống.
   ═══════════════════════════════════════════════════════════════ */

const NT_KENH = ['goiDien', 'nhanTin', 'email', 'gapMat'];
const NT_KETQUA = ['huaTra', 'xinKhatNo', 'khongLienLac', 'tuChoi', 'daTra'];

export async function ghiNhacThu(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 11) return {ok: false, code: 'NOPERM',
    error: 'Vai này không ghi được lượt nhắc thu.'};

  const n = y.nhac || {};
  const nha = String(n.maKhachHang || '').trim();
  const kenh = String(n.kenh || '').trim();
  const ketQua = String(n.ketQua || '').trim();
  const noiDung = String(n.noiDung || '').trim();

  if (!nha) return {ok: false, error: 'Thiếu mã khách hàng.'};
  if (NT_KENH.indexOf(kenh) < 0) return {ok: false,
    error: 'Kênh nhắc phải là một trong: ' + NT_KENH.join(', ') + '.'};
  if (NT_KETQUA.indexOf(ketQua) < 0) return {ok: false,
    error: 'Kết quả phải là một trong: ' + NT_KETQUA.join(', ') + '.'};
  if (noiDung.length < 5) return {ok: false,
    error: 'Chưa ghi nhà nói gì. Một lượt nhắc không có nội dung thì lượt sau ' +
           'người khác gọi lại từ đầu, và gia đình phải kể lại câu chuyện của họ.'};

  const hs = await db.prepare('SELECT maKhachHang FROM hoSoKhach WHERE maKhachHang = ?')
    .bind(nha).first();
  if (!hs) return {ok: false, error: 'Không tìm thấy tệp khách hàng này.'};

  /* HẸN TRẢ PHẢI Ở TƯƠNG LAI. Một cái hẹn nằm ở quá khứ thì không phải
     hẹn, và nó sẽ làm nhà ấy biến mất khỏi mọi bộ lọc "đang có hẹn". */
  let hen = String(n.henLuc || '').trim() || null;
  if (hen) {
    if (isNaN(new Date(hen).getTime()))
      return {ok: false, error: 'Ngày hẹn trả không đọc được.'};
    if (new Date(hen).getTime() < Date.now() - 86400000)
      return {ok: false, error: 'Ngày hẹn trả nằm ở quá khứ.'};
  }
  if (ketQua === 'huaTra' && !hen)
    return {ok: false,
      error: 'Nhà hứa trả thì phải ghi HẸN NGÀY NÀO. Một lời hứa không có ngày ' +
             'thì không theo dõi được, và tuần sau lại gọi hỏi đúng câu cũ.'};

  const id = 'NT-' + tokenMoi().slice(0, 14);
  const luc = new Date().toISOString();
  await db.prepare(
    'INSERT INTO nhacThu (id,maKhachHang,idKy,kenh,noiDung,ketQua,henLuc,boi,luc) ' +
    'VALUES (?,?,?,?,?,?,?,?,?)'
  ).bind(id, nha, String(n.idKy || '') || null, kenh, noiDung.slice(0, 2000),
    ketQua, hen, hoSo.u, luc).run();

  const dem = await db.prepare('SELECT COUNT(*) c FROM nhacThu WHERE maKhachHang = ?')
    .bind(nha).first();

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'NHACTHU_GHI',
    doiTuong: nha, chiTiet: kenh + ' · ' + ketQua + (hen ? ' · hẹn ' + hen.slice(0, 10) : '')});
  return {ok: true, id, laLanThu: Number(dem.c), luc};
}

export async function lichSuNhacThu(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 11) return {ok: false, code: 'NOPERM', error: 'Vai này không xem được sổ nhắc thu.'};

  const nha = String(y.maKhachHang || '').trim();
  if (!nha) return {ok: false, error: 'Thiếu mã khách hàng.'};

  const r = await db.prepare(
    'SELECT * FROM nhacThu WHERE maKhachHang = ? ORDER BY luc DESC LIMIT 100'
  ).bind(nha).all();
  const ds = r.results || [];

  return {ok: true, maKhachHang: nha, soLan: ds.length, ds,
    henGanNhat: (ds.filter(x => x.henLuc && new Date(x.henLuc) >= new Date())
      .sort((a, b) => a.henLuc < b.henLuc ? -1 : 1)[0] || {}).henLuc};
}

/* ── NHÀ ĐẾN HẸN MÀ CHƯA TRẢ ──

   Danh sách quá hạn nói ai đang nợ; bản này nói ai đã HỨA và đã tới
   ngày. Hai việc khác nhau: một nhà đang nợ mà hẹn tuần sau thì chưa
   phải gọi, còn một nhà hẹn hôm qua mà chưa trả thì phải gọi hôm nay. */
export async function denHenChuaTra(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 5) return {ok: false, code: 'NOPERM',
    error: 'Từ R01–R05 mới xem được danh sách đến hẹn của cả hệ.'};

  const bay = new Date().toISOString();
  const r = await db.prepare(
    'SELECT n.maKhachHang, n.henLuc, n.noiDung, n.boi, n.luc ' +
    'FROM nhacThu n WHERE n.henLuc IS NOT NULL AND n.henLuc <= ? ' +
    "  AND n.ketQua = 'huaTra' " +
    /* Chỉ lấy lượt nhắc MỚI NHẤT của mỗi nhà: nhà đã hẹn ba lần thì ba
       dòng cũ không còn là việc phải làm, chỉ lời hứa gần nhất mới là. */
    '  AND n.luc = (SELECT MAX(x.luc) FROM nhacThu x WHERE x.maKhachHang = n.maKhachHang) ' +
    /* Và bỏ nhà đã trả xong: còn nợ mới còn là việc. */
    '  AND EXISTS (SELECT 1 FROM kyThu k LEFT JOIN phieuThu p ON p.idKy = k.id ' +
    '     WHERE k.maKhachHang = n.maKhachHang GROUP BY k.id ' +
    "     HAVING COALESCE(SUM(CASE WHEN p.trangThai='daDuyet' THEN p.soTien END),0) " +
    '       + ' + TRU_MIEN_GIAM + ' < k.phaiThu) ' +
    'ORDER BY n.henLuc LIMIT 500'
  ).bind(bay).all();

  const ds = (r.results || []).map(x => ({
    maKhachHang: x.maKhachHang, henLuc: x.henLuc, noiDung: x.noiDung,
    nguoiNhac: x.boi, nhacLuc: x.luc,
    treNgay: Math.floor((Date.now() - new Date(x.henLuc).getTime()) / 86400e3)}));

  return {ok: true, so: ds.length, ds,
    vi: 'Nhà ĐÃ HỨA và đã tới ngày mà vẫn còn nợ. Khác với danh sách quá hạn: ' +
        'nhà đang nợ mà hẹn tuần sau thì chưa phải gọi.'};
}
