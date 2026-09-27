/* ═══════════════════════════════════════════════════════════════
   GITA 365 · CỬA VÀO MỚI — SỔ BÁO CÁO

   THU THEO NGÀY · CHỐT THEO TUẦN · TỔNG HỢP THÁNG–QUÝ · KẾ TOÁN
   THEO QUÝ VÀ NĂM, TRỌN VẸN TỚI MỨC MANG ĐI KHAI THUẾ ĐƯỢC.

   ══ BỐN NHỊP, BỐN VIỆC KHÁC NHAU ══

     ngày   — nhìn tiền vào. Câu hỏi: hôm nay thu được bao nhiêu.
     tuần   — CHỐT. Câu hỏi: tuần rồi khoá sổ ở con số nào.
     tháng
     quý    — đổi chiến lược. Câu hỏi: đang đi lên hay đi xuống, ở tầng
              nào, tuyến nào, và vì sao.
     quý
     năm    — kế toán. Câu hỏi: khai với cơ quan thuế con số nào, và
              chứng minh nó bằng dòng nào.

   Bốn nhịp này KHÔNG phải cùng một phép cộng chạy trên bốn khoảng thời
   gian khác nhau. Chúng hỏi bốn câu khác nhau nên cần bốn bản khác
   nhau. Gộp làm một là ra một bản không trả lời trọn câu nào.

   ══ HAI CON SỐ, KHÔNG PHẢI MỘT ══

   Chỗ này là chỗ một sổ tự làm dễ sai nhất, và sai thì không nhìn ra.

     DOANH THU GHI NHẬN  — kỳ thu TỚI HẠN trong kỳ báo cáo.
                           Học viện đã dạy, đã có quyền đòi.
     TIỀN THỰC THU       — phiếu thu ĐÃ DUYỆT ghi trong kỳ.
                           Tiền đã vào tài khoản.

   Hai số này khác nhau, và HIỆU CỦA CHÚNG CHÍNH LÀ CÔNG NỢ. Một bản
   báo cáo chỉ có một trong hai thì không nói được nhà nào còn nợ, và
   cũng không khai thuế được — cơ quan thuế hỏi doanh thu, không hỏi
   tiền mặt.

   Nền cũ chỉ có tiền thực thu.

   ══ MÚI GIỜ LÀ CHỖ TIỀN RƠI NHẦM TUẦN ══

   Mọi mốc trong cơ sở dữ liệu là ISO UTC. Việt Nam là UTC+7.

   Một phiếu ghi lúc 6 giờ 30 sáng THỨ HAI giờ Việt Nam có mốc UTC là
   23 giờ 30 CHỦ NHẬT. Cắt tuần theo UTC thì khoản tiền ấy rơi vào tuần
   TRƯỚC — một tuần có thể đã chốt rồi.

   Nên mọi ranh giới kỳ ở tệp này tính theo giờ Việt Nam trước, rồi mới
   quy về UTC để hỏi cơ sở dữ liệu. Không có bước ấy thì mỗi tuần có
   một khoảng bảy tiếng mà tiền rơi nhầm chỗ, và nó rơi nhầm đúng vào
   giờ người ta hay chuyển khoản nhất: sáng sớm đầu tuần.
   ═══════════════════════════════════════════════════════════════ */

import { Kho, tokenMoi } from './nen.js';

const BAC = {R01:1,R02:2,R03:3,R04:4,R05:5,R06:6,R07:7,R08:8,
             R09:9,R10:10,R11:11,R12:12,R13:13,R14:14,R15:15};

const LECH_VN = 7 * 60 * 60 * 1000;   /* UTC+7 */

/* ═══════════════ MÓC THỜI GIAN THEO GIỜ VIỆT NAM ═══════════════ */

/** Ngày Việt Nam của một mốc UTC — 'YYYY-MM-DD'. */
function ngayVN(iso) {
  return new Date(new Date(iso).getTime() + LECH_VN).toISOString().slice(0, 10);
}

/** Đầu một ngày Việt Nam, quy về mốc UTC để hỏi cơ sở dữ liệu. */
function dauNgay(ngay) {
  return new Date(new Date(ngay + 'T00:00:00.000Z').getTime() - LECH_VN).toISOString();
}

/** Cuối một ngày Việt Nam — lấy mốc CUỐI CÙNG còn thuộc ngày ấy, không
    lấy mốc đầu ngày hôm sau. Dùng mốc đầu ngày hôm sau với phép so
    <= là đếm trùng một mili giây sang kỳ sau; ở ranh giới quý thì một
    phiếu đúng nửa đêm vào cả hai quý. */
function cuoiNgay(ngay) {
  return new Date(new Date(ngay + 'T00:00:00.000Z').getTime() - LECH_VN
    + 24 * 3600 * 1000 - 1).toISOString();
}

function congNgay(ngay, n) {
  return new Date(new Date(ngay + 'T00:00:00.000Z').getTime() + n * 86400000)
    .toISOString().slice(0, 10);
}

/* ══ TUẦN THEO ISO-8601: THỨ HAI MỞ, CHỦ NHẬT ĐÓNG ══

   Chọn ISO chứ không tự đặt vì tuần ISO là thứ ngân hàng, phần mềm kế
   toán và bảng tính đều hiểu giống nhau. Tự đặt tuần bắt đầu Chủ nhật
   là mỗi lần đối chiếu với sao kê lại lệch một ngày. */
function thuTrongTuan(ngay) {          /* 1 = Thứ Hai … 7 = Chủ nhật */
  const d = new Date(ngay + 'T00:00:00.000Z').getUTCDay();
  return d === 0 ? 7 : d;
}

function dauTuan(ngay) { return congNgay(ngay, 1 - thuTrongTuan(ngay)); }

/** Số tuần ISO. Luật ISO: tuần chứa ngày Thứ Năm quyết định năm của
    tuần ấy — nên tuần cuối tháng 12 có thể mang số 1 của năm sau. Đây
    là chỗ mọi bản tự viết đều sai, và sai thì một tuần biến mất khỏi
    báo cáo năm. */
function maTuan(ngay) {
  const thu5 = congNgay(dauTuan(ngay), 3);
  const nam = Number(thu5.slice(0, 4));
  const thu5DauNam = congNgay(dauTuan(nam + '-01-04'), 3);
  const so = Math.round(
    (new Date(thu5 + 'T00:00:00.000Z') - new Date(thu5DauNam + 'T00:00:00.000Z'))
    / 604800000) + 1;
  return nam + '-W' + String(so).padStart(2, '0');
}

/* ═══════════════ MỘT KỲ LÀ MỘT KHOẢNG CÓ TÊN ═══════════════

   Trả về {ky, loai, tuNgay, denNgay, tuLuc, denLuc}. Mọi phép cộng ở
   tệp này chạy trên đúng cấu trúc ấy, nên thêm một nhịp mới sau này
   chỉ phải thêm một nhánh ở đây. */
export function dungKy(loai, moc) {
  const l = String(loai || 'tuan');
  let tuNgay, denNgay, ky;

  if (l === 'ngay') {
    tuNgay = denNgay = String(moc);
    ky = tuNgay;

  } else if (l === 'tuan') {
    tuNgay = dauTuan(String(moc));
    denNgay = congNgay(tuNgay, 6);
    ky = maTuan(tuNgay);

  } else if (l === 'thang') {
    const m = String(moc).slice(0, 7);
    tuNgay = m + '-01';
    const [nm, th] = m.split('-').map(Number);
    denNgay = congNgay(th === 12 ? (nm + 1) + '-01-01' : nm + '-' +
      String(th + 1).padStart(2, '0') + '-01', -1);
    ky = m;

  } else if (l === 'quy') {
    /* Nhận cả '2026-Q3' lẫn một ngày bất kỳ trong quý. */
    let nm, q;
    const s = String(moc);
    if (/^\d{4}-Q[1-4]$/.test(s)) { nm = Number(s.slice(0, 4)); q = Number(s[6]); }
    else { nm = Number(s.slice(0, 4)); q = Math.floor((Number(s.slice(5, 7)) - 1) / 3) + 1; }
    tuNgay = nm + '-' + String((q - 1) * 3 + 1).padStart(2, '0') + '-01';
    denNgay = congNgay(q === 4 ? (nm + 1) + '-01-01'
      : nm + '-' + String(q * 3 + 1).padStart(2, '0') + '-01', -1);
    ky = nm + '-Q' + q;

  } else if (l === 'nam') {
    const nm = Number(String(moc).slice(0, 4));
    tuNgay = nm + '-01-01'; denNgay = nm + '-12-31'; ky = String(nm);

  } else {
    return null;
  }

  return {ky, loai: l, tuNgay, denNgay,
    tuLuc: dauNgay(tuNgay), denLuc: cuoiNgay(denNgay)};
}

/** Kỳ liền trước, cùng loại. Dùng cho phép so kỳ-với-kỳ ở bản tổng hợp
    — một con số đứng một mình không đổi được chiến lược của ai. */
function kyTruoc(k) {
  if (k.loai === 'nam') return dungKy('nam', String(Number(k.ky) - 1));
  return dungKy(k.loai, congNgay(k.tuNgay, -1));
}

/* ═══════════════ PHÉP CỘNG DÙNG CHUNG ═══════════════

   Mọi bản báo cáo ở dưới đều gọi hàm này. Viết lại phép cộng ở từng
   bản là cách chắc chắn nhất để hai bản của cùng một kỳ ra hai số
   khác nhau — và lúc ấy không ai biết bản nào đúng. */
async function dongTien(db, k) {
  const thu = await db.prepare(
    "SELECT COALESCE(SUM(soTien),0) t, COUNT(*) n FROM phieuThu " +
    "WHERE trangThai = 'daDuyet' AND ghiLuc >= ? AND ghiLuc <= ?"
  ).bind(k.tuLuc, k.denLuc).first();

  /* Phiếu ghi trong kỳ mà CHƯA DUYỆT: chưa phải tiền, nhưng phải nêu.
     Không nêu thì người xem tưởng đã thu hết phần thu được. */
  const cho = await db.prepare(
    "SELECT COALESCE(SUM(soTien),0) t, COUNT(*) n FROM phieuThu " +
    "WHERE trangThai = 'choDuyet' AND ghiLuc >= ? AND ghiLuc <= ?"
  ).bind(k.tuLuc, k.denLuc).first();

  const hoan = await db.prepare(
    "SELECT COALESCE(SUM(soTien),0) t, COUNT(*) n FROM hoanTien " +
    "WHERE trangThai = 'daDuyet' AND duyetLuc >= ? AND duyetLuc <= ?"
  ).bind(k.tuLuc, k.denLuc).first();

  /* DOANH THU GHI NHẬN — kỳ thu tới hạn trong khoảng. Kỳ chưa có hanLuc
     là kỳ chưa gắn mốc thật; nó KHÔNG được đếm vào bất kỳ kỳ báo cáo
     nào, vì đếm nó vào kỳ hiện tại là ghi nhận doanh thu của một việc
     chưa biết bao giờ tới hạn. */
  const gn = await db.prepare(
    'SELECT COALESCE(SUM(phaiThu),0) t, COUNT(*) n FROM kyThu ' +
    'WHERE hanLuc IS NOT NULL AND hanLuc >= ? AND hanLuc <= ?'
  ).bind(k.tuLuc, k.denLuc).first();

  /* Đếm MỌI khoản sinh trong kỳ, kể cả khoản về sau bị huỷ: khoản huỷ
     trừ riêng ở dòng huỷ. Lọc sẵn khoản huỷ ra khỏi đây là trừ nó hai
     lần, và đẳng thức cân đối hoa hồng lệch đúng bằng số ấy. */
  const hhS = await db.prepare(
    'SELECT COALESCE(SUM(soTien),0) t, COUNT(*) n FROM hoaHongTra ' +
    'WHERE sinhLuc >= ? AND sinhLuc <= ?'
  ).bind(k.tuLuc, k.denLuc).first();

  const hhT = await db.prepare(
    "SELECT COALESCE(SUM(soTien),0) t, COUNT(*) n FROM hoaHongTra " +
    "WHERE trangThai = 'daTra' AND traLuc >= ? AND traLuc <= ?"
  ).bind(k.tuLuc, k.denLuc).first();

  /* ══ HAI KHOẢN LÀM CHO SỔ CÔNG NỢ CÂN ĐƯỢC ══

     Công nợ là SỐ DƯ, và số dư chỉ cân khi hai đầu của phép trừ nói về
     cùng một tập dòng. Tiền thực thu ở trên KHÔNG phải tập ấy, vì hai
     lý do đều xảy ra thật:

       · phiếu thu KHÔNG GẮN KỲ NÀO — tiền đã vào sổ nhưng chưa trừ nợ
         của ai. Cộng nó vào phép trừ công nợ là làm công nợ giảm mà
         không dòng nào giảm theo.

       · tiền NỘP TRƯỚC cho một kỳ mãi tới kỳ báo cáo này mới tới hạn.
         Nó nằm ngoài "thu trong kỳ" nhưng lại làm giảm công nợ cuối
         kỳ — không nêu riêng thì đẳng thức lệch đúng bằng số ấy, và
         người soát sẽ đi tìm một dòng không tồn tại.

     Tách riêng hai khoản này là chỗ khác nhau giữa một bản báo cáo
     cân được và một bản gần đúng. */
  const thuVaoKy = await db.prepare(
    "SELECT COALESCE(SUM(p.soTien),0) t FROM phieuThu p JOIN kyThu k ON k.id = p.idKy " +
    "WHERE p.trangThai = 'daDuyet' AND p.ghiLuc >= ? AND p.ghiLuc <= ? " +
    'AND k.hanLuc IS NOT NULL AND k.hanLuc <= ?'
  ).bind(k.tuLuc, k.denLuc, k.denLuc).first();

  const thuTruocDaToiHan = await db.prepare(
    "SELECT COALESCE(SUM(p.soTien),0) t FROM phieuThu p JOIN kyThu k ON k.id = p.idKy " +
    "WHERE p.trangThai = 'daDuyet' AND p.ghiLuc < ? " +
    'AND k.hanLuc IS NOT NULL AND k.hanLuc >= ? AND k.hanLuc <= ?'
  ).bind(k.tuLuc, k.tuLuc, k.denLuc).first();

  /* ══ CHI PHÍ VẬN HÀNH — NỬA CÒN LẠI CỦA CUỐN SỔ ══
     Tính theo ngayChi (mốc TIỀN RA), không theo mốc nhập liệu: nhập bù
     một khoản của tháng trước là chuyện thường, và ghi nó vào hôm nay
     làm sai bản kê của cả hai tháng. */
  const chi = await db.prepare(
    "SELECT COALESCE(SUM(soTien),0) t, COUNT(*) n FROM chiPhi " +
    "WHERE trangThai = 'daDuyet' AND ngayChi >= ? AND ngayChi <= ?"
  ).bind(k.tuLuc, k.denLuc).first();

  const chiCoHoaDon = await db.prepare(
    "SELECT COALESCE(SUM(soTien),0) t FROM chiPhi " +
    "WHERE trangThai = 'daDuyet' AND coHoaDon = 1 AND ngayChi >= ? AND ngayChi <= ?"
  ).bind(k.tuLuc, k.denLuc).first();

  /* Bao nhiêu tiền đi LỐI TỰ GHI — một người ký. Đây không phải một
     con số để ngắm: nó là tỷ lệ tiền ra khỏi Học viện mà không ai
     đứng giữa, và nếu nó lớn dần thì hoặc ngưỡng đặt quá cao, hoặc có
     người đang chia nhỏ khoản chi. */
  const chiTuGhi = await db.prepare(
    "SELECT COALESCE(SUM(soTien),0) t, COUNT(*) n FROM chiPhi " +
    "WHERE trangThai = 'daDuyet' AND tuGhi = 1 AND ngayChi >= ? AND ngayChi <= ?"
  ).bind(k.tuLuc, k.denLuc).first();

  /* ══ MIỄN GIẢM — GIẢM TRỪ DOANH THU, KHÔNG PHẢI MỘT KHOẢN CHI ══
     Tính theo duyetLuc: miễn giảm có hiệu lực từ lúc duyệt, không lùi
     ngược. Một khoản giảm duyệt hôm nay không được làm đổi bản báo cáo
     quý trước — cùng luật với mốc huỷ hoa hồng. */
  const mg = await db.prepare(
    "SELECT COALESCE(SUM(soTien),0) t, COUNT(*) n FROM mienGiam " +
    "WHERE trangThai = 'daDuyet' AND duyetLuc >= ? AND duyetLuc <= ?"
  ).bind(k.tuLuc, k.denLuc).first();

  /* Và hai khoản đối ứng của miễn giảm trong đẳng thức công nợ, đúng
     hình với hai khoản của tiền thu ở trên. */
  const mgVaoKy = await db.prepare(
    'SELECT COALESCE(SUM(m.soTien),0) t FROM mienGiam m JOIN kyThu k ON k.id = m.idKy ' +
    "WHERE m.trangThai = 'daDuyet' AND m.duyetLuc >= ? AND m.duyetLuc <= ? " +
    'AND k.hanLuc IS NOT NULL AND k.hanLuc <= ?'
  ).bind(k.tuLuc, k.denLuc, k.denLuc).first();

  const mgTruocDaToiHan = await db.prepare(
    'SELECT COALESCE(SUM(m.soTien),0) t FROM mienGiam m JOIN kyThu k ON k.id = m.idKy ' +
    "WHERE m.trangThai = 'daDuyet' AND m.duyetLuc < ? " +
    'AND k.hanLuc IS NOT NULL AND k.hanLuc >= ? AND k.hanLuc <= ?'
  ).bind(k.tuLuc, k.tuLuc, k.denLuc).first();

  const nhaMoi = await db.prepare(
    'SELECT COUNT(*) n FROM hoSoKhach WHERE vaoLuc >= ? AND vaoLuc <= ?'
  ).bind(k.tuLuc, k.denLuc).first();

  const vuot = await db.prepare(
    'SELECT COUNT(*) n FROM lichSuTang WHERE luc >= ? AND luc <= ?'
  ).bind(k.tuLuc, k.denLuc).first();

  return {
    thu: Number(thu.t), soPhieu: Number(thu.n),
    choDuyet: Number(cho.t), soChoDuyet: Number(cho.n),
    hoan: Number(hoan.t), soHoan: Number(hoan.n),
    ghiNhan: Number(gn.t), soKyToiHan: Number(gn.n),
    thuVaoKy: Number(thuVaoKy.t),
    thuNgoaiLich: Number(thu.t) - Number(thuVaoKy.t),
    thuTruocDaToiHan: Number(thuTruocDaToiHan.t),
    chi: Number(chi.t), soChungTuChi: Number(chi.n),
    chiTuGhi: Number(chiTuGhi.t), soChiTuGhi: Number(chiTuGhi.n),
    chiCoHoaDon: Number(chiCoHoaDon.t),
    chiKhongHoaDon: Number(chi.t) - Number(chiCoHoaDon.t),
    mienGiam: Number(mg.t), soMienGiam: Number(mg.n),
    mgVaoKy: Number(mgVaoKy.t), mgTruocDaToiHan: Number(mgTruocDaToiHan.t),
    hhSinh: Number(hhS.t), soHhSinh: Number(hhS.n),
    hhTra: Number(hhT.t), soHhTra: Number(hhT.n),
    nhaMoi: Number(nhaMoi.n), luotVuotTang: Number(vuot.n)
  };
}

/** Công nợ LUỸ KẾ tính tới một mốc — không phải công nợ phát sinh
    trong kỳ. Đây là số dư, và số dư phải tính từ đầu tới mốc ấy chứ
    không cộng riêng trong khoảng. */
async function conNoToi(db, denLuc) {
  const r = await db.prepare(
    'SELECT COALESCE(SUM(k.phaiThu),0) phai FROM kyThu k ' +
    'WHERE k.hanLuc IS NOT NULL AND k.hanLuc <= ?'
  ).bind(denLuc).first();
  const d = await db.prepare(
    "SELECT COALESCE(SUM(p.soTien),0) da FROM phieuThu p " +
    "JOIN kyThu k ON k.id = p.idKy " +
    "WHERE p.trangThai = 'daDuyet' AND p.ghiLuc <= ? " +
    "AND k.hanLuc IS NOT NULL AND k.hanLuc <= ?"
  ).bind(denLuc, denLuc).first();
  /* Miễn giảm ĐÃ DUYỆT TÍNH TỚI MỐC ẤY. Đọc trạng thái hôm nay thay vì
     đọc mốc duyệt là làm cho công nợ của mọi kỳ quá khứ đổi theo mỗi
     lượt duyệt hôm nay — cùng cái sai đã bắt được ở sổ hoa hồng. */
  const g = await db.prepare(
    'SELECT COALESCE(SUM(m.soTien),0) giam FROM mienGiam m JOIN kyThu k ON k.id = m.idKy ' +
    "WHERE m.trangThai = 'daDuyet' AND m.duyetLuc <= ? " +
    'AND k.hanLuc IS NOT NULL AND k.hanLuc <= ?'
  ).bind(denLuc, denLuc).first();
  return Number(r.phai) - Number(d.da) - Number(g.giam);
}

/* ═══════════════ VÂN TAY CỦA MỘT KỲ ═══════════════

   Dấu của TẬP DÒNG, không phải của con số tổng. Hai chuyện khác nhau:
   một phiếu 500.000đ bị huỷ và một phiếu 500.000đ khác được ghi thêm
   thì TỔNG không đổi, nhưng tập dòng đã đổi — và vân tay bắt được,
   còn con số tổng thì không.

   Xếp theo id trước khi băm: cơ sở dữ liệu không hứa thứ tự trả về,
   nên không xếp thì cùng một tập dòng ra hai vân tay khác nhau và
   phép soát báo động giả suốt ngày. */
async function vanTayCuaKy(db, k) {
  const phan = [];
  const gom = async (nhan, cau) => {
    const r = await db.prepare(cau).bind(k.tuLuc, k.denLuc).all();
    for (const d of (r.results || []))
      phan.push(nhan + '|' + d.id + '|' + d.soTien + '|' + d.trangThai);
  };
  await gom('PT', "SELECT id, soTien, trangThai FROM phieuThu " +
    'WHERE ghiLuc >= ? AND ghiLuc <= ? ORDER BY id');
  await gom('HT', "SELECT id, soTien, trangThai FROM hoanTien " +
    'WHERE deXuatLuc >= ? AND deXuatLuc <= ? ORDER BY id');
  await gom('HH', "SELECT id, soTien, trangThai FROM hoaHongTra " +
    'WHERE sinhLuc >= ? AND sinhLuc <= ? ORDER BY id');
  /* Chi phí và miễn giảm cũng phải nằm trong vân tay: một khoản chi
     duyệt lùi vào tuần đã chốt đổi con số của tuần ấy y như một phiếu
     thu, và nếu vân tay không phủ nó thì phép soát không thấy gì. */
  await gom('CP', 'SELECT id, soTien, trangThai FROM chiPhi ' +
    'WHERE ngayChi >= ? AND ngayChi <= ? ORDER BY id');
  await gom('MG', 'SELECT id, soTien, trangThai FROM mienGiam ' +
    'WHERE deXuatLuc >= ? AND deXuatLuc <= ? ORDER BY id');

  const b = await crypto.subtle.digest('SHA-256',
    new TextEncoder().encode(phan.join('\n')));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}

/* ═══════════════════════════════════════════════════════════════
   1 · THU THEO NGÀY

   Bản mỏng nhất, chạy nhiều nhất. Người thu tiền mở nó cuối ngày để
   biết hôm nay khớp chưa — nên nó phải trả về TỪNG PHIẾU, không chỉ
   tổng: đối chiếu với sao kê ngân hàng là đối chiếu từng dòng.
   ═══════════════════════════════════════════════════════════════ */
export async function soNgay(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 5) return {ok: false, code: 'NOPERM',
    error: 'Từ R01–R05 mới xem được sổ thu theo ngày.'};

  const k = dungKy('ngay', String(y.ngay || ngayVN(new Date().toISOString())));
  if (!k) return {ok: false, error: 'Ngày không hợp lệ.'};

  const t = await dongTien(db, k);

  const ds = await db.prepare(
    'SELECT p.id, p.maKhachHang, p.soTien, p.hinhThuc, p.maThamChieu, ' +
    '  p.trangThai, p.nguoiGhi, p.nguoiDuyet, p.ghiLuc, k.tang, k.ky ' +
    'FROM phieuThu p LEFT JOIN kyThu k ON k.id = p.idKy ' +
    'WHERE p.ghiLuc >= ? AND p.ghiLuc <= ? ORDER BY p.ghiLuc'
  ).bind(k.tuLuc, k.denLuc).all();

  /* Chia theo hình thức: tiền mặt phải đếm được ở két, chuyển khoản
     phải khớp sao kê. Gộp chung một số là bỏ mất phép đối chiếu duy
     nhất mà người thủ quỹ có. */
  const theoHinhThuc = {};
  for (const d of (ds.results || [])) {
    if (d.trangThai !== 'daDuyet') continue;
    const h = d.hinhThuc || 'khac';
    theoHinhThuc[h] = (theoHinhThuc[h] || 0) + Number(d.soTien);
  }

  return {ok: true, ngay: k.ky, thuocTuan: maTuan(k.tuNgay),
    daThu: t.thu, soPhieu: t.soPhieu,
    choDuyet: t.choDuyet, soChoDuyet: t.soChoDuyet,
    theoHinhThuc,
    phieu: (ds.results || []),
    /* Nhắc rằng giờ ở đây là giờ Việt Nam, vì mốc trong sổ là UTC và
       một người đọc bản này lúc nửa đêm sẽ hỏi đúng câu ấy. */
    vi: 'Ngày tính theo giờ Việt Nam (UTC+7), từ ' + k.tuLuc + ' đến ' + k.denLuc + '.'};
}

/* ═══════════════════════════════════════════════════════════════
   2 · CHỐT TUẦN

   Đóng sổ một tuần. Sau lượt này con số của tuần ấy không tính lại
   nữa — mọi bản báo cáo tháng, quý, năm đọc số ĐÃ CHỐT chứ không cộng
   lại từ sổ sống.
   ═══════════════════════════════════════════════════════════════ */
export async function chotTuan(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 3) return {ok: false, code: 'NOPERM', error: 'Chỉ R01–R03 chốt được sổ.'};

  const k = dungKy('tuan', String(y.ngay || ngayVN(new Date().toISOString())));
  if (!k) return {ok: false, error: 'Ngày không hợp lệ.'};

  /* KHÔNG CHỐT MỘT TUẦN CHƯA HẾT.

     Chốt giữa tuần là ghi một con số rồi tuần ấy vẫn còn hai ngày để
     tiền vào — và số đã ghi thành sai ngay hôm sau, nhưng mang dấu
     "đã chốt" nên không ai tính lại. */
  const nay = ngayVN(new Date().toISOString());
  if (k.denNgay >= nay)
    return {ok: false, code: 'CHUAHET',
      error: 'Tuần ' + k.ky + ' còn chạy tới hết ' + k.denNgay +
        '. Chốt được từ ' + congNgay(k.denNgay, 1) + '.'};

  const cu = await db.prepare('SELECT * FROM soChot WHERE ky = ?').bind(k.ky).first();
  if (cu && !y.chotLai)
    return {ok: false, code: 'DACHOT',
      error: 'Tuần ' + k.ky + ' đã chốt lúc ' + cu.chotLuc + ' bởi ' + cu.boiAi + '.',
      daChot: {thu: cu.thu, vanTay: cu.vanTay}};

  /* CHỐT LẠI PHẢI CÓ LÝ DO, và lý do ấy ở lại trong dòng.

     Một kỳ đã đóng rồi mở ra đóng lại là chuyện xảy ra thật — nhưng nó
     phải để lại vết. Không có vết thì "đã chốt" chỉ có nghĩa cho tới
     lần chốt lại tiếp theo. */
  if (cu && y.chotLai && !String(y.lyDo || '').trim())
    return {ok: false, error: 'Chốt lại một kỳ đã đóng thì phải ghi lý do.'};

  const t = await dongTien(db, k);
  const no = await conNoToi(db, k.denLuc);
  const vt = await vanTayCuaKy(db, k);
  const luc = new Date().toISOString();

  await db.prepare(
    'INSERT INTO soChot (ky,loai,tuNgay,denNgay,tuLuc,denLuc,thu,soPhieu,hoan,soHoan,' +
    'ghiNhan,soKyToiHan,hhSinh,hhTra,chi,soChungTuChi,mienGiam,conNoCuoiKy,nhaMoi,' +
    'luotVuotTang,vanTay,chotLuc,boiAi) ' +
    'VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ' +
    'ON CONFLICT(ky) DO UPDATE SET thu=excluded.thu, soPhieu=excluded.soPhieu, ' +
    'hoan=excluded.hoan, soHoan=excluded.soHoan, ghiNhan=excluded.ghiNhan, ' +
    'soKyToiHan=excluded.soKyToiHan, hhSinh=excluded.hhSinh, hhTra=excluded.hhTra, ' +
    'chi=excluded.chi, soChungTuChi=excluded.soChungTuChi, mienGiam=excluded.mienGiam, ' +
    'conNoCuoiKy=excluded.conNoCuoiKy, nhaMoi=excluded.nhaMoi, ' +
    'luotVuotTang=excluded.luotVuotTang, vanTay=excluded.vanTay, ' +
    'moLaiLuc=excluded.chotLuc, moLaiBoi=excluded.boiAi, moLaiLyDo=?'
  ).bind(k.ky, 'tuan', k.tuNgay, k.denNgay, k.tuLuc, k.denLuc,
    t.thu, t.soPhieu, t.hoan, t.soHoan, t.ghiNhan, t.soKyToiHan,
    t.hhSinh, t.hhTra, t.chi, t.soChungTuChi, t.mienGiam,
    no, t.nhaMoi, t.luotVuotTang, vt, luc, hoSo.u,
    String(y.lyDo || '').slice(0, 500) || null).run();

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u,
    viec: cu ? 'CHOT_LAI' : 'CHOT_TUAN', doiTuong: k.ky,
    chiTiet: 'thu ' + t.thu + ' · ' + t.soPhieu + ' phiếu · vân tay ' + vt.slice(0, 12) +
      (cu ? ' · lý do: ' + String(y.lyDo).slice(0, 200) : '')});

  return {ok: true, ky: k.ky, tuNgay: k.tuNgay, denNgay: k.denNgay,
    chotLai: !!cu, ...t, conNoCuoiKy: no, vanTay: vt, chotLuc: luc};
}

/* ═══════════════ SOÁT CÁC KỲ ĐÃ CHỐT ═══════════════

   Tính lại vân tay của từng kỳ đã đóng và so với vân tay đã ghi. Khác
   nhau nghĩa là có dòng đổi đi SAU khi chốt.

   Phép soát này KHÔNG SỬA GÌ, giống doiSoat. Nó nêu ra kỳ nào đã động,
   động bao nhiêu tiền, và có bút toán điều chỉnh nào giải thích chưa. */
export async function soatChot(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 3) return {ok: false, code: 'NOPERM', error: 'Chỉ R01–R03 soát được sổ chốt.'};

  const r = await db.prepare(
    'SELECT * FROM soChot ORDER BY tuNgay DESC LIMIT ?'
  ).bind(Number(y.soKy) > 0 ? Number(y.soKy) : 60).all();

  const lech = [];
  for (const c of (r.results || [])) {
    const k = {ky: c.ky, loai: c.loai, tuNgay: c.tuNgay, denNgay: c.denNgay,
      tuLuc: c.tuLuc, denLuc: c.denLuc};
    const vt = await vanTayCuaKy(db, k);
    if (vt === c.vanTay) continue;

    const nay = await dongTien(db, k);
    const dc = await db.prepare(
      'SELECT COUNT(*) n, COALESCE(SUM(soTien),0) t FROM dieuChinh WHERE kyBiAnhHuong = ?'
    ).bind(c.ky).first();

    lech.push({ky: c.ky, tuNgay: c.tuNgay, denNgay: c.denNgay,
      thuLucChot: Number(c.thu), thuBayGio: nay.thu,
      chenh: nay.thu - Number(c.thu),
      soButToanDieuChinh: Number(dc.n), tienDieuChinh: Number(dc.t),
      /* Có bút toán khớp thì chỗ lệch này ĐÃ ĐƯỢC GIẢI THÍCH — vẫn nêu,
         nhưng nêu khác: một chỗ đã có người xử lý, không phải một chỗ
         chưa ai biết. */
      daGiaiThich: Number(dc.n) > 0 &&
        Math.abs(Number(dc.t) - (nay.thu - Number(c.thu))) < 0.5});
  }

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'SOAT_CHOT',
    chiTiet: (r.results || []).length + ' kỳ · ' + lech.length + ' kỳ đã động'});

  return {ok: true, soKyDaSoat: (r.results || []).length,
    sach: lech.length === 0, soLech: lech.length, lech,
    vi: 'Vân tay là dấu của TẬP DÒNG, không phải của con số tổng: huỷ một phiếu ' +
        '500.000đ rồi ghi thêm một phiếu 500.000đ khác thì tổng không đổi nhưng ' +
        'vân tay đổi. Phép soát này KHÔNG SỬA GÌ.'};
}

/* ═══════════════ GHI MỘT BÚT TOÁN ĐIỀU CHỈNH ═══════════════

   Gọi từ tai-chinh.js mỗi khi một khoản tiền động vào mốc nằm trong
   một kỳ ĐÃ CHỐT. Không thuộc kỳ đã chốt nào thì không ghi gì — phần
   lớn thao tác rơi vào kỳ đang mở, và ghi bút toán cho chúng là làm
   ngập sổ điều chỉnh bằng chuyện thường ngày. */
export async function ghiDieuChinh(db, {lucGoc, loai, idChungTu, maKhachHang,
                                        soTien, boi, dienGiai}) {
  const c = await db.prepare(
    'SELECT ky FROM soChot WHERE tuLuc <= ? AND denLuc >= ? ORDER BY tuNgay LIMIT 1'
  ).bind(lucGoc, lucGoc).first();
  if (!c) return null;

  const id = 'DC-' + tokenMoi().slice(0, 14);
  await db.prepare(
    'INSERT INTO dieuChinh (id,kyBiAnhHuong,loai,idChungTu,maKhachHang,soTien,' +
    'luc,lucGoc,boi,dienGiai) VALUES (?,?,?,?,?,?,?,?,?,?)'
  ).bind(id, c.ky, loai, idChungTu, maKhachHang || null, soTien,
    new Date().toISOString(), lucGoc, boi, dienGiai).run();
  return {id, kyBiAnhHuong: c.ky};
}

/* ═══════════════════════════════════════════════════════════════
   3 · TỔNG HỢP THÁNG – QUÝ ĐỂ ĐỔI CHIẾN LƯỢC

   Bản này KHÔNG phải bản kế toán. Nó trả lời một câu khác: đang đi lên
   hay đi xuống, ở đâu, và vì sao.

   Nên nó bắt buộc có KỲ TRƯỚC để so. Một con số đứng một mình không
   đổi được chiến lược của ai — "quý này thu 400 triệu" không nói lên
   điều gì cho tới khi biết quý trước thu bao nhiêu.

   Và nó cắt theo TẦNG và theo NGƯỜI PHỤ TRÁCH, vì tổng đi xuống thì
   câu hỏi tiếp theo luôn là "xuống ở đâu".
   ═══════════════════════════════════════════════════════════════ */
export async function tongHop(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 4) return {ok: false, code: 'NOPERM',
    error: 'Từ R01–R04 mới xem được bản tổng hợp.'};

  const loai = String(y.loai || 'thang');
  if (loai !== 'thang' && loai !== 'quy')
    return {ok: false, error: 'Bản tổng hợp chạy theo tháng hoặc quý.'};

  const k = dungKy(loai, String(y.moc || ngayVN(new Date().toISOString())));
  if (!k) return {ok: false, error: 'Mốc kỳ không hợp lệ.'};
  const kt = kyTruoc(k);

  const nay = await dongTien(db, k);
  const truoc = await dongTien(db, kt);

  const doi = (a, b) => b === 0 ? (a === 0 ? 0 : null)
    : Math.round((a - b) / b * 1000) / 10;

  /* THU ĐƯỢC BAO NHIÊU PHẦN CỦA PHẦN ĐÁNG LẼ THU.

     Đây là con số nói nhiều nhất trong cả bản, và cũng là con số duy
     nhất không đọc được từ tổng thu: thu tăng mà tỷ lệ thu giảm nghĩa
     là học viên tăng còn khả năng thu đang xấu đi. */
  const tyLeThu = k => k.ghiNhan === 0 ? null
    : Math.round(k.thu / k.ghiNhan * 1000) / 10;

  const theoTang = await db.prepare(
    'SELECT k.tang, COUNT(DISTINCT k.maKhachHang) soNha, ' +
    '  COALESCE(SUM(k.phaiThu),0) ghiNhan, ' +
    "  COALESCE(SUM(CASE WHEN p.trangThai='daDuyet' AND p.ghiLuc>=? AND p.ghiLuc<=? " +
    '    THEN p.soTien END),0) thu ' +
    'FROM kyThu k LEFT JOIN phieuThu p ON p.idKy = k.id ' +
    'WHERE k.hanLuc IS NOT NULL AND k.hanLuc >= ? AND k.hanLuc <= ? ' +
    'GROUP BY k.tang ORDER BY k.tang'
  ).bind(k.tuLuc, k.denLuc, k.tuLuc, k.denLuc).all();

  /* Cắt theo người phụ trách. Không có lớp này thì bản tổng hợp nói
     được "đang xuống" mà không nói được ai cần giúp. */
  const theoNguoi = await db.prepare(
    "SELECT COALESCE(h.coach,'(chưa gán)') coach, COUNT(DISTINCT h.maKhachHang) soNha, " +
    "  COALESCE(SUM(CASE WHEN p.trangThai='daDuyet' AND p.ghiLuc>=? AND p.ghiLuc<=? " +
    '    THEN p.soTien END),0) thu ' +
    'FROM hoSoKhach h LEFT JOIN phieuThu p ON p.maKhachHang = h.maKhachHang ' +
    "WHERE h.trangThai = 'dangHoc' GROUP BY h.coach ORDER BY thu DESC LIMIT 50"
  ).bind(k.tuLuc, k.denLuc).all();

  const nghi = await db.prepare(
    "SELECT COUNT(*) n FROM hoSoKhach WHERE trangThai IN ('nghi','tamDung') " +
    'AND suaLuc >= ? AND suaLuc <= ?'
  ).bind(k.tuLuc, k.denLuc).first();

  const noCuoi = await conNoToi(db, k.denLuc);
  const noDau  = await conNoToi(db, kt.denLuc);

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'TONGHOP',
    doiTuong: k.ky});

  return {ok: true, ky: k.ky, loai, tuNgay: k.tuNgay, denNgay: k.denNgay,
    soVoi: kt.ky,
    thu:      {nay: nay.thu,      truoc: truoc.thu,      doiPhanTram: doi(nay.thu, truoc.thu)},
    ghiNhan:  {nay: nay.ghiNhan,  truoc: truoc.ghiNhan,  doiPhanTram: doi(nay.ghiNhan, truoc.ghiNhan)},
    nhaMoi:   {nay: nay.nhaMoi,   truoc: truoc.nhaMoi,   doiPhanTram: doi(nay.nhaMoi, truoc.nhaMoi)},
    vuotTang: {nay: nay.luotVuotTang, truoc: truoc.luotVuotTang,
               doiPhanTram: doi(nay.luotVuotTang, truoc.luotVuotTang)},
    hoan:     {nay: nay.hoan,     truoc: truoc.hoan,     doiPhanTram: doi(nay.hoan, truoc.hoan)},
    mienGiam: {nay: nay.mienGiam, truoc: truoc.mienGiam, doiPhanTram: doi(nay.mienGiam, truoc.mienGiam)},
    /* Chi phí đứng cạnh doanh thu, vì "thu tăng" và "thu tăng chậm hơn
       chi" là hai câu dẫn tới hai chiến lược ngược nhau. */
    chi:      {nay: nay.chi,      truoc: truoc.chi,      doiPhanTram: doi(nay.chi, truoc.chi)},
    chenhLechThuChi: {
      nay:   nay.ghiNhan - nay.hoan - nay.mienGiam - nay.chi - nay.hhTra,
      truoc: truoc.ghiNhan - truoc.hoan - truoc.mienGiam - truoc.chi - truoc.hhTra},
    tyLeThu:  {nay: tyLeThu(nay), truoc: tyLeThu(truoc)},
    conNo:    {dauKy: noDau, cuoiKy: noCuoi, doi: noCuoi - noDau},
    nhaDungHoc: Number(nghi.n),
    theoTang: (theoTang.results || []).map(x => ({
      tang: x.tang, soNha: Number(x.soNha), ghiNhan: Number(x.ghiNhan),
      thu: Number(x.thu), conNo: Number(x.ghiNhan) - Number(x.thu)})),
    theoNguoiKem: (theoNguoi.results || []).map(x => ({
      coach: x.coach, soNha: Number(x.soNha), thu: Number(x.thu)})),
    /* Bản này KHÔNG kết luận hộ. Nó đặt các con số cạnh nhau; đọc ra
       chiến lược là việc của người, và người ấy biết những thứ không
       có trong sổ. */
    vi: 'Bản tổng hợp để ĐỔI CHIẾN LƯỢC, không phải bản kế toán. ' +
        'Số kế toán lấy ở baoCaoKeToan.'};
}

/* ═══════════════════════════════════════════════════════════════
   4 · BÁO CÁO KẾ TOÁN THEO KỲ · QUÝ · NĂM

   Bản này phải CÂN. Một bản kế toán không cân là một bản sai, và cái
   sai ấy phải hiện ra ngay trên mặt bản chứ không nằm im chờ kiểm
   toán tìm.

   Hai đẳng thức bắt buộc:

     công nợ đầu kỳ + ghi nhận trong kỳ − đã thu − giảm trừ
       = công nợ cuối kỳ

     hoa hồng phải trả đầu kỳ + sinh trong kỳ − đã trả − huỷ
       = hoa hồng phải trả cuối kỳ

   Lệch quá một đồng thì bản trả về canDoi.can = false và nêu số lệch.
   Không làm tròn cho khớp: một đồng lệch là một dòng chưa tìm ra.
   ═══════════════════════════════════════════════════════════════ */
export async function baoCaoKeToan(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 3) return {ok: false, code: 'NOPERM',
    error: 'Chỉ R01–R03 xem được báo cáo kế toán.'};

  const loai = String(y.loai || 'quy');
  if (['thang', 'quy', 'nam'].indexOf(loai) < 0)
    return {ok: false, error: 'Báo cáo kế toán chạy theo tháng, quý hoặc năm.'};

  const k = dungKy(loai, String(y.moc || ngayVN(new Date().toISOString())));
  if (!k) return {ok: false, error: 'Mốc kỳ không hợp lệ.'};

  const t = await dongTien(db, k);
  const noCuoi = await conNoToi(db, k.denLuc);
  const noDau  = await conNoToi(db, new Date(
    new Date(k.tuLuc).getTime() - 1).toISOString());

  /* ── HOA HỒNG: SỐ DƯ ĐẦU KỲ VÀ CUỐI KỲ ──

     "Phải trả tại một mốc" = đã sinh trước mốc ấy, và tại mốc ấy chưa
     trả cũng chưa huỷ. Nên cả ba trạng thái đều phải xét theo MỐC của
     chúng, không theo trạng thái hôm nay: một khoản hôm nay mang dấu
     'daTra' vẫn là khoản PHẢI TRẢ ở mốc đầu kỳ, nếu lúc ấy nó chưa
     được trả. Đọc trạng thái hôm nay rồi suy ngược là cách làm cho sổ
     của mọi kỳ quá khứ đổi theo mỗi lượt chi hôm nay. */
  const duNo = async moc => Number((await db.prepare(
    'SELECT COALESCE(SUM(soTien),0) t FROM hoaHongTra ' +
    'WHERE sinhLuc <= ? AND (traLuc IS NULL OR traLuc > ?) ' +
    'AND (huyLuc IS NULL OR huyLuc > ?)'
  ).bind(moc, moc, moc).first()).t);

  const hhDau  = await duNo(new Date(new Date(k.tuLuc).getTime() - 1).toISOString());
  const hhCuoi = await duNo(k.denLuc);
  const hhHuy = await db.prepare(
    "SELECT COALESCE(SUM(soTien),0) t, COUNT(*) n FROM hoaHongTra " +
    'WHERE huyLuc IS NOT NULL AND huyLuc >= ? AND huyLuc <= ?'
  ).bind(k.tuLuc, k.denLuc).first();

  /* ── BÚT TOÁN ĐIỀU CHỈNH GHI TRONG KỲ NÀY ──

     Chúng thuộc kỳ ĐÃ CHỐT nào đó ở quá khứ nhưng rơi vào kỳ này, y
     như sổ sách thật làm. Nêu riêng để người đọc không cộng nhầm
     chúng vào doanh thu phát sinh của kỳ. */
  const dc = await db.prepare(
    'SELECT kyBiAnhHuong, loai, COUNT(*) n, COALESCE(SUM(soTien),0) t ' +
    'FROM dieuChinh WHERE luc >= ? AND luc <= ? GROUP BY kyBiAnhHuong, loai'
  ).bind(k.tuLuc, k.denLuc).all();

  const doanhThuThuan = t.ghiNhan - t.hoan - t.mienGiam;

  /* ══ HAI ĐẲNG THỨC, VIẾT RA ĐÚNG NHƯ CHÚNG PHẢI ĐÚNG ══

     Công nợ KHÔNG trừ khoản hoàn: hoàn tiền trả lại tiền nhưng không
     xoá kỳ thu, nên nhà ấy vẫn còn nợ đúng số cũ. Đưa khoản hoàn vào
     đẳng thức này là chỗ sai mà bản đầu tôi viết, và nó chỉ lộ ra khi
     có một lượt hoàn thật. */
  const lechNo = (noDau + t.ghiNhan - t.thuVaoKy - t.thuTruocDaToiHan
                  - t.mgVaoKy - t.mgTruocDaToiHan) - noCuoi;
  const lechHh = (hhDau + t.hhSinh - t.hhTra - Number(hhHuy.t)) - hhCuoi;

  const theoMuc = await db.prepare(
    "SELECT khoanMuc, COUNT(*) n, COALESCE(SUM(soTien),0) t FROM chiPhi " +
    "WHERE trangThai = 'daDuyet' AND ngayChi >= ? AND ngayChi <= ? " +
    'GROUP BY khoanMuc ORDER BY t DESC'
  ).bind(k.tuLuc, k.denLuc).all();

  const cacKyDaChot = await db.prepare(
    'SELECT ky, thu, chotLuc, vanTay FROM soChot ' +
    'WHERE tuNgay >= ? AND denNgay <= ? ORDER BY tuNgay'
  ).bind(k.tuNgay, k.denNgay).all();

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'BAOCAO_KETOAN',
    doiTuong: k.ky, chiTiet: loai + ' · doanh thu ' + doanhThuThuan});

  return {ok: true, ky: k.ky, loai, tuNgay: k.tuNgay, denNgay: k.denNgay,

    A_doanhThu: {
      ghiNhanTrongKy: t.ghiNhan, soKyToiHan: t.soKyToiHan,
      /* Hoàn tiền và miễn giảm đều là GIẢM TRỪ DOANH THU, nhưng nêu
         riêng: hoàn là tiền đã ra khỏi tài khoản, miễn giảm là tiền
         chưa từng vào. Gộp một dòng thì không ai biết Học viện đang
         trả lại hay đang cho đi, mà đó là hai câu chuyện khác hẳn. */
      hoanTien: t.hoan, soLuotHoan: t.soHoan,
      mienGiam: t.mienGiam, soLuotMienGiam: t.soMienGiam,
      giamTruDoanhThu: t.hoan + t.mienGiam,
      doanhThuThuan,
      nguon: 'Ghi nhận = kyThu có hanLuc trong kỳ. Giảm trừ = hoanTien đã duyệt ' +
             'trong kỳ. Đây là số theo DỒN TÍCH, dùng để khai thuế.'},

    B_tienMat: {
      thucThu: t.thu, soPhieu: t.soPhieu,
      choDuyetCuoiKy: t.choDuyet, soPhieuChoDuyet: t.soChoDuyet,
      thucChiHoan: t.hoan,
      thucChiHoaHong: t.hhTra,
      rong: t.thu - t.hoan - t.hhTra,
      nguon: 'phieuThu đã duyệt, tính theo ghiLuc — ngày TIỀN VÀO, không phải ' +
             'ngày duyệt. Số này khác doanh thu ghi nhận, và hiệu của chúng là công nợ.'},

    C_congNo: {
      dauKy: noDau,
      phatSinh: t.ghiNhan,
      daThuVaoKy: t.thuVaoKy,
      thuTruocNayToiHan: t.thuTruocDaToiHan,
      mienGiamVaoKy: t.mgVaoKy,
      mienGiamTruocNayToiHan: t.mgTruocDaToiHan,
      cuoiKy: noCuoi,
      /* Nêu riêng, vì đây là tiền ĐÃ VÀO SỔ mà CHƯA TRỪ NỢ của ai. Nó
         không thuộc đẳng thức trên, và nó là việc phải làm: gán vào
         kỳ qua ganPhieuVaoKy. */
      thuChuaGanKy: t.thuNgoaiLich,
      vi: 'Công nợ KHÔNG trừ khoản hoàn: hoàn tiền trả lại tiền nhưng không xoá ' +
          'kỳ thu, nên nhà ấy vẫn còn nợ đúng số cũ. Khoản hoàn nằm ở mục A.'},

    D_hoaHong: {
      phaiTraDauKy: hhDau, sinhTrongKy: t.hhSinh, daTra: t.hhTra,
      huy: Number(hhHuy.t), soHuy: Number(hhHuy.n),
      phaiTraCuoiKy: hhCuoi},

    E_butToanDieuChinh: {
      so: (dc.results || []).reduce((s, x) => s + Number(x.n), 0),
      tien: (dc.results || []).reduce((s, x) => s + Number(x.t), 0),
      chiTiet: (dc.results || []).map(x => ({kyBiAnhHuong: x.kyBiAnhHuong,
        loai: x.loai, so: Number(x.n), tien: Number(x.t)})),
      vi: 'Khoản thuộc kỳ đã chốt nhưng phát sinh trong kỳ này. Không cộng vào ' +
          'doanh thu phát sinh của kỳ.'},

    /* ── HAI ĐẲNG THỨC PHẢI ĐÚNG ── */
    canDoi: {
      can: Math.abs(lechNo) < 1 && Math.abs(lechHh) < 1,
      lechCongNo: Math.round(lechNo * 100) / 100,
      lechHoaHong: Math.round(lechHh * 100) / 100,
      dangThuc: [
        'công nợ: đầu kỳ + phát sinh − thu vào kỳ − thu trước nay tới hạn ' +
          '− miễn giảm vào kỳ − miễn giảm trước nay tới hạn = cuối kỳ',
        'hoa hồng: phải trả đầu kỳ + sinh − đã trả − huỷ = phải trả cuối kỳ'],
      vi: 'Lệch quá một đồng là một dòng chưa tìm ra; bản này KHÔNG làm tròn cho khớp.'},

    tuanDaChotTrongKy: (cacKyDaChot.results || []).map(x => ({
      ky: x.ky, thu: Number(x.thu), chotLuc: x.chotLuc,
      vanTay: x.vanTay.slice(0, 16)})),

    F_chiPhi: {
      tongChi: t.chi, soChungTu: t.soChungTuChi,
      coHoaDon: t.chiCoHoaDon,
      khongHoaDon: t.chiKhongHoaDon,
      /* Hai lối nêu riêng — xem chú giải ở dongTien. */
      quaCuaDuyet: t.chi - t.chiTuGhi,
      loiTuGhi: t.chiTuGhi, soChungTuTuGhi: t.soChiTuGhi,
      tyLeTuGhi: t.chi === 0 ? null : Math.round(t.chiTuGhi / t.chi * 1000) / 10,
      theoKhoanMuc: (theoMuc.results || []).map(x => ({
        khoanMuc: x.khoanMuc, so: Number(x.n), tien: Number(x.t)})),
      /* Hoa hồng đại sứ KHÔNG nằm trong sổ chi: nó có bảng riêng, có
         luật riêng, có chứng cứ riêng. Nêu cạnh nhau để cộng đúng, chứ
         không trộn vào một dòng. */
      hoaHongDaTra: t.hhTra,
      tongTienRa: t.chi + t.hhTra + t.hoan,
      nguon: "chiPhi WHERE trangThai='daDuyet' và ngayChi trong kỳ. Cột coHoaDon " +
             'tách riêng vì khoản chi không hoá đơn vẫn là tiền đã ra thật nhưng ' +
             'đứng khác khi tính thuế; cột tuGhi tách riêng vì khoản dưới ngưỡng ' +
             'chỉ có một người ký.'},

    /* ══ CHÊNH LỆCH THU CHI — VÀ VÌ SAO KHÔNG GỌI NÓ LÀ LỢI NHUẬN ══

       Từ bản 9.91 hệ này có cả hai nửa, nên phép trừ chạy được. Nhưng
       phép trừ chạy được không có nghĩa kết quả của nó là lợi nhuận
       kế toán:

         · doanh thu ghi theo DỒN TÍCH (kỳ tới hạn), còn chi phí ghi
           theo TIỀN RA. Hai cơ sở khác nhau đặt cạnh nhau.
         · khấu hao chỉ có nếu ai đó nhập tay vào khoản mục khauHao —
           không có bảng tài sản nào tự tính.
         · các khoản trích trước, dự phòng, chênh lệch tỷ giá: không có.

       Nên con số này là CHÊNH LỆCH THU CHI, dùng để nhìn xu hướng và
       ra quyết định trong nhà. Nó KHÔNG phải dòng lợi nhuận để nộp cho
       ai, và tên gọi ở đây giữ nguyên như thế để không ai nhầm. */
    G_chenhLechThuChi: {
      doanhThuThuan,
      chiPhiVanHanh: t.chi,
      hoaHongDaTra: t.hhTra,
      chenhLech: doanhThuThuan - t.chi - t.hhTra,
      tyLeChiTrenThu: doanhThuThuan === 0 ? null
        : Math.round((t.chi + t.hhTra) / doanhThuThuan * 1000) / 10,
      khongPhaiLoiNhuan: true,
      thieuNhungGi: ['khấu hao tự tính từ bảng tài sản (chỉ có nếu nhập tay)',
        'các khoản trích trước và dự phòng', 'chênh lệch tỷ giá',
        'thuế thu nhập doanh nghiệp'],
      vi: 'Doanh thu ghi theo DỒN TÍCH, chi phí ghi theo TIỀN RA — hai cơ sở khác ' +
          'nhau. Đây là chênh lệch thu chi để nhìn xu hướng trong nhà, KHÔNG phải ' +
          'lợi nhuận kế toán, và không được nộp cho ai dưới tên ấy.'},

    vi: 'Từ bản 9.91 bản kê có cả hai nửa — tiền vào và tiền ra — nên phép trừ ' +
        'chạy được. Nhưng nó vẫn KHÔNG phải báo cáo kết quả kinh doanh: xem ' +
        'G_chenhLechThuChi.thieuNhungGi.'};
}

/* ═══════════════════════════════════════════════════════════════
   5 · BỘ SỐ ĐỂ KHAI THUẾ

   ══ RANH GIỚI CỦA BẢN NÀY ══

   Máy KHÔNG khai thuế và KHÔNG kết luận nghĩa vụ thuế. Nó làm đúng
   một việc: dựng đủ các chỉ tiêu mà một tờ khai cần, mỗi chỉ tiêu kèm
   NGUỒN SỐ — hỏi bảng nào, lọc điều kiện gì — để kế toán tra ngược
   được về từng dòng.

   Vì sao dừng ở đó: thuế suất, đối tượng chịu thuế và cách kê khai
   thay đổi theo văn bản và theo từng doanh nghiệp. Một con số thuế do
   máy tự tính rồi nộp đi là một con số không ai chịu trách nhiệm.

   BA CHỖ DƯỚI ĐÂY CHỜ KẾ TOÁN CỦA HỌC VIỆN XÁC NHẬN, không phải chờ
   mã. Chúng khai ở CHO_KE_TOAN và hiện nguyên văn trên bản trả về —
   để không ai tưởng máy đã chốt hộ.
   ═══════════════════════════════════════════════════════════════ */
const CHO_KE_TOAN = [
  {ma: 'T-01', viec: 'Dịch vụ đào tạo của Học viện thuộc diện nào của thuế GTGT',
   vi: 'Cách xử lý khác nhau giữa không chịu thuế, chịu thuế suất 0% và chịu ' +
       'thuế suất thường; chọn sai thì tờ khai sai từ dòng đầu. Bản này KHÔNG ' +
       'giả định giúp.'},
  {ma: 'T-02', viec: 'Hoa hồng trả cho đại sứ là cá nhân — khấu trừ thuế thu ' +
       'nhập cá nhân tại nguồn theo tỷ lệ nào, từ ngưỡng nào',
   vi: 'Bản này liệt kê ĐỦ các lượt chi và người nhận để khấu trừ được, nhưng ' +
       'không tự nhân một tỷ lệ nào vào.'},
  {ma: 'T-03', viec: 'Kỳ kê khai của Học viện là tháng hay quý',
   vi: 'Quyết định bản này chạy theo nhịp nào. Mặc định đang là quý.'},
  {ma: 'T-04', viec: 'Khoản chi nào được trừ khi tính thuế thu nhập doanh nghiệp',
   vi: 'Bản này tách sẵn phần CÓ HOÁ ĐƠN và phần KHÔNG, theo từng khoản mục, ' +
       'nhưng không tự kết luận khoản nào được trừ — điều kiện được trừ còn phụ ' +
       'thuộc hình thức thanh toán, hợp đồng và hồ sơ kèm theo.'},
  {ma: 'T-05', viec: 'Doanh thu khai theo DỒN TÍCH hay theo TIỀN THỰC THU',
   vi: 'Hai con số này khác nhau và bản kê trả về cả hai. Chọn sai cơ sở thì ' +
       'tờ khai lệch đúng bằng công nợ của kỳ.'}
];

export async function boSoKhaiThue(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 2) return {ok: false, code: 'NOPERM',
    error: 'Chỉ R01–R02 xem được bộ số khai thuế.'};

  const loai = String(y.loai || 'quy');
  if (['thang', 'quy', 'nam'].indexOf(loai) < 0)
    return {ok: false, error: 'Bộ số khai thuế chạy theo tháng, quý hoặc năm.'};

  const k = dungKy(loai, String(y.moc || ngayVN(new Date().toISOString())));
  if (!k) return {ok: false, error: 'Mốc kỳ không hợp lệ.'};

  const t = await dongTien(db, k);

  /* ── DOANH THU CHIA THEO TẦNG ──
     Tờ khai hỏi doanh thu theo nhóm dịch vụ, không hỏi một số tổng. */
  const theoTang = await db.prepare(
    'SELECT tang, COALESCE(SUM(phaiThu),0) t, COUNT(*) n FROM kyThu ' +
    'WHERE hanLuc IS NOT NULL AND hanLuc >= ? AND hanLuc <= ? GROUP BY tang ORDER BY tang'
  ).bind(k.tuLuc, k.denLuc).all();

  const mucThue = await db.prepare(
    "SELECT khoanMuc, COUNT(*) n, COALESCE(SUM(soTien),0) t, " +
    '  COALESCE(SUM(CASE WHEN coHoaDon = 1 THEN soTien END),0) hd FROM chiPhi ' +
    "WHERE trangThai = 'daDuyet' AND ngayChi >= ? AND ngayChi <= ? " +
    'GROUP BY khoanMuc ORDER BY t DESC'
  ).bind(k.tuLuc, k.denLuc).all();

  /* ── TỪNG LƯỢT CHI HOA HỒNG, KÈM NGƯỜI NHẬN ──

     Khấu trừ thuế thu nhập cá nhân tính THEO TỪNG LƯỢT CHI cho TỪNG
     người, không tính trên tổng cả kỳ. Nên bản này trả về từng lượt,
     và gộp thêm theo người để đối chiếu. Trả về tổng thôi thì kế toán
     phải mở lại cơ sở dữ liệu, và lúc ấy bản này vô dụng. */
  const luotChi = await db.prepare(
    'SELECT h.id, h.nhaKem, h.nhaDuocKem, h.soTien, h.traLuc, h.bac, h.maChungCu, ' +
    '  u.hoTen, u.email ' +
    'FROM hoaHongTra h ' +
    'LEFT JOIN hoSoKhach hs ON hs.maKhachHang = h.nhaKem ' +
    'LEFT JOIN users u ON u.id = hs.uidPhuHuynh ' +
    "WHERE h.trangThai = 'daTra' AND h.traLuc >= ? AND h.traLuc <= ? " +
    'ORDER BY h.traLuc'
  ).bind(k.tuLuc, k.denLuc).all();

  const theoNguoiNhan = {};
  for (const c of (luotChi.results || [])) {
    const n = theoNguoiNhan[c.nhaKem] || (theoNguoiNhan[c.nhaKem] =
      {maKhachHang: c.nhaKem, hoTen: c.hoTen || null, soLuot: 0, tong: 0, luot: []});
    n.soLuot++; n.tong += Number(c.soTien);
    n.luot.push({id: c.id, soTien: Number(c.soTien), traLuc: c.traLuc});
  }

  /* ── CHỨNG TỪ THIẾU ──

     Một khoản chi không có chứng cứ đã xác nhận là một khoản không
     đứng được khi bị hỏi. Nêu ra TRƯỚC khi nộp tờ khai, không phải
     sau. */
  const thieuChungCu = (luotChi.results || [])
    .filter(c => !c.maChungCu)
    .map(c => ({id: c.id, nhaKem: c.nhaKem, soTien: Number(c.soTien), traLuc: c.traLuc}));

  /* ── TUẦN CHƯA CHỐT TRONG KỲ ──

     Nộp tờ khai cho một quý mà trong quý còn tuần chưa chốt nghĩa là
     nộp một con số còn có thể đổi. Nêu tên từng tuần thiếu. */
  const daChot = new Set((await db.prepare(
    "SELECT ky FROM soChot WHERE loai = 'tuan' AND tuNgay >= ? AND denNgay <= ?"
  ).bind(k.tuNgay, k.denNgay).all()).results?.map(x => x.ky) || []);

  const thieuTuan = [];
  const nay = ngayVN(new Date().toISOString());
  for (let d = dauTuan(k.tuNgay); d <= k.denNgay; d = congNgay(d, 7)) {
    if (d < k.tuNgay) continue;
    if (congNgay(d, 6) >= nay) continue;      /* tuần chưa hết thì chưa chốt được */
    const m = maTuan(d);
    if (!daChot.has(m)) thieuTuan.push({tuan: m, tuNgay: d, denNgay: congNgay(d, 6)});
  }

  /* Két còn lệch và khoản chi còn treo đều là chỗ con số của kỳ chưa
     đứng yên. Nộp tờ khai lên rồi mới xử lý thì phải khai bổ sung. */
  const ketLech = ((await db.prepare(
    'SELECT ngay, chenh, lyDo FROM chotKet WHERE ngay >= ? AND ngay <= ? ' +
    'AND (chenh > 0.5 OR chenh < -0.5) ORDER BY ngay'
  ).bind(k.tuNgay, k.denNgay).all()).results || [])
    .map(x => ({ngay: x.ngay, chenh: Number(x.chenh), lyDo: x.lyDo}));

  const chiCho = await db.prepare(
    "SELECT COUNT(*) n FROM chiPhi WHERE trangThai = 'choDuyet' " +
    'AND ngayChi >= ? AND ngayChi <= ?'
  ).bind(k.tuLuc, k.denLuc).first();

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'BOSO_KHAITHUE',
    doiTuong: k.ky, chiTiet: loai + ' · ' + (luotChi.results || []).length + ' lượt chi'});

  return {ok: true, ky: k.ky, loai, tuNgay: k.tuNgay, denNgay: k.denNgay,

    doanhThu: {
      ghiNhan: t.ghiNhan,
      thucThu: t.thu,
      hoanTien: t.hoan,
      mienGiam: t.mienGiam,
      giamTru: t.hoan + t.mienGiam,
      thuan: t.ghiNhan - t.hoan - t.mienGiam,
      theoTang: (theoTang.results || []).map(x => ({
        tang: x.tang, soKy: Number(x.n), doanhThu: Number(x.t)})),
      nguon: "kyThu WHERE hanLuc trong kỳ; trừ hoanTien WHERE trangThai='daDuyet' " +
             "và duyetLuc trong kỳ; trừ mienGiam WHERE trangThai='daDuyet' và " +
             'duyetLuc trong kỳ.',
      vi: 'GHI NHẬN là số theo dồn tích, THỰC THU là tiền đã vào. Hai con số ' +
          'khác nhau và bản này trả về cả hai — chọn cơ sở nào là T-05.'},

    chiHoaHong: {
      tong: t.hhTra, soLuot: (luotChi.results || []).length,
      theoNguoiNhan: Object.values(theoNguoiNhan),
      nguon: "hoaHongTra WHERE trangThai='daTra' và traLuc trong kỳ, nối về " +
             'hoSoKhach → users để ra người nhận.',
      vi: 'Trả về TỪNG LƯỢT CHI vì khấu trừ thuế thu nhập cá nhân tính theo từng ' +
          'lượt cho từng người, không tính trên tổng kỳ. Bản này KHÔNG nhân tỷ lệ ' +
          'nào vào — xem T-02.'},

    chiPhi: {
      tong: t.chi, soChungTu: t.soChungTuChi,
      coHoaDon: t.chiCoHoaDon,
      khongHoaDon: t.chiKhongHoaDon,
      loiTuGhi: t.chiTuGhi, soChungTuTuGhi: t.soChiTuGhi,
      theoKhoanMuc: (mucThue.results || []).map(x => ({
        khoanMuc: x.khoanMuc, so: Number(x.n), tien: Number(x.t),
        coHoaDon: Number(x.hd)})),
      nguon: "chiPhi WHERE trangThai='daDuyet' và ngayChi trong kỳ.",
      vi: 'Cột CÓ HOÁ ĐƠN tách riêng vì khoản chi không có hoá đơn vẫn là tiền ' +
          'đã ra thật — vẫn phải vào sổ chi — nhưng đứng khác khi tính thuế. ' +
          'Bản này KHÔNG kết luận khoản nào được trừ, khoản nào không: xem T-04.'},

    /* Bản này nêu chỗ CHƯA SẴN SÀNG trước, vì nộp rồi mới phát hiện thì
       phải khai bổ sung, và khai bổ sung là một việc nặng hơn nhiều. */
    chuaSanSang: {
      sanSang: thieuTuan.length === 0 && thieuChungCu.length === 0 &&
               ketLech.length === 0 && Number(chiCho.n) === 0,
      tuanChuaChot: thieuTuan,
      luotChiThieuChungCu: thieuChungCu,
      ngayKetConLech: ketLech,
      khoanChiConChoDuyet: Number(chiCho.n)},

    choKeToanXacNhan: CHO_KE_TOAN,

    vi: 'Máy KHÔNG khai thuế và KHÔNG kết luận nghĩa vụ thuế. Bản này dựng đủ ' +
        'chỉ tiêu và nêu NGUỒN SỐ để kế toán tra ngược về từng dòng, rồi tự quyết ' +
        'thuế suất và cách kê khai. Ba chỗ ở choKeToanXacNhan là quyết định của ' +
        'người, không phải của mã.'};
}

/* ═══════════════ DANH SÁCH CÁC KỲ ĐÃ CHỐT ═══════════════ */
export async function dsChot(y, env, db, hoSo) {
  const lv = BAC[hoSo.role] || 99;
  if (lv > 4) return {ok: false, code: 'NOPERM', error: 'Vai này không xem được sổ chốt.'};

  const r = await db.prepare(
    'SELECT * FROM soChot WHERE (? = 0 OR loai = ?) ORDER BY tuNgay DESC LIMIT ?'
  ).bind(y.loai ? 1 : 0, String(y.loai || ''),
    Number(y.soKy) > 0 ? Number(y.soKy) : 52).all();

  return {ok: true, so: (r.results || []).length,
    ds: (r.results || []).map(c => ({
      ky: c.ky, loai: c.loai, tuNgay: c.tuNgay, denNgay: c.denNgay,
      thu: Number(c.thu), soPhieu: Number(c.soPhieu),
      ghiNhan: Number(c.ghiNhan), hoan: Number(c.hoan),
      conNoCuoiKy: Number(c.conNoCuoiKy),
      nhaMoi: Number(c.nhaMoi), luotVuotTang: Number(c.luotVuotTang),
      chotLuc: c.chotLuc, boiAi: c.boiAi,
      daMoLai: !!c.moLaiLuc,
      moLaiLyDo: c.moLaiLyDo || undefined}))};
}
