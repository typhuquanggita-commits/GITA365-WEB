/* ═══════════════════════════════════════════════════════════════
   GITA 365 · CỬA VÀO MỚI — BÁO DÒNG DOANH THU VỀ HÒM THƯ CHỦ HỆ

   Chốt của chủ hệ thống bản 9.96: "Khách hàng chuyển tiền có báo dòng
   doanh thu về email của tôi để tôi xác nhận có dòng doanh thu."

   ══ BÁO Ở LÚC GHI PHIẾU, KHÔNG PHẢI LÚC DUYỆT ══

   Một phiếu thu đi qua hai mốc: lúc GHI (có người nói tiền đã vào) và
   lúc DUYỆT (có người thứ hai xác nhận).

   Thư báo về hòm thư chủ hệ phải đi ở mốc THỨ NHẤT. Báo sau khi duyệt
   thì lá thư ấy chẳng thêm được gì — đã có người trong hệ xác nhận
   rồi. Báo lúc ghi thì con mắt của chủ hệ là con mắt ĐỘC LẬP, đứng
   ngoài mọi vai trong hệ, và đó mới là thứ đáng có.

   ══ THƯ CHỞ DÒNG DOANH THU, KHÔNG CHỞ HỒ SƠ KHÁCH ══

   Chủ hệ hỏi "dòng doanh thu", và thư này chở đúng thế: mã nhà, số
   tiền, tầng, kỳ, hình thức, mã giao dịch, ai ghi.

   KHÔNG chở tên phụ huynh, tên học viên, số điện thoại. Không phải vì
   chủ hệ không được xem — ông ấy xem được hết trong hệ. Mà vì hòm thư
   là đường kém an toàn nhất trong cả kiến trúc này: nó đi qua nhà gửi
   thư, qua Google, nằm lại trong hộp thư đến và trong bản sao lưu của
   Google, không mã hoá theo khoá của Học viện, và không nằm dưới bất kỳ
   giấy phép nào.

   Luật của Học viện là dữ liệu khách chỉ ra khỏi hệ theo giấy phép.
   Một lá thư tự động mỗi lần có người chuyển tiền là một dòng chảy đều
   đặn đi ra ngoài — nên nó chở CON SỐ, và ai cần xem hồ sơ thì mở hệ.

   ══ TRẦN MỖI NGÀY, VÌ MỘT HÒM THƯ NGẬP LÀ MỘT HÒM THƯ KHÔNG AI ĐỌC ══

   Hôm nay Học viện vài chục lượt thu một ngày thì mỗi lượt một thư là
   vừa. Ở mức chủ hệ đặt — 100.000 tài khoản, đầy là 500.000 — con số
   ấy thành hàng nghìn thư mỗi ngày.

   Lúc ấy lá thư thứ một nghìn không còn là một lớp kiểm soát; nó là
   rác, và cả nghìn lá trước nó cũng thành rác theo. Nên có trần: qua
   trần thì THÔI gửi từng lá, và gửi MỘT lá nói rõ hôm nay còn bao
   nhiêu lượt nữa không được báo lẻ.

   Điều quan trọng là chủ hệ KHÔNG BAO GIỜ lặng lẽ thôi được báo. Lá
   thư chạm trần nói thẳng ra rằng từ đây trong ngày sẽ không có thư
   lẻ nữa, và bản tổng cuối ngày chở phần còn lại.

   ══ GỬI THƯ HỎNG KHÔNG ĐƯỢC LÀM MẤT MỘT ĐỒNG NÀO ══

   Phiếu thu đã ghi vào sổ trước khi thư đi. Nhà gửi thư sập, hết hạn
   mức, sai khoá — phiếu vẫn nằm nguyên trong sổ. Một lá thư báo hỏng
   là mất một lượt báo; để nó kéo đổ lượt ghi phiếu là mất tiền thật.
   ═══════════════════════════════════════════════════════════════ */

import { guiThu, sachChoThu, CHAN_THU } from './thu.js';
import { Kho } from './nen.js';
import { dungKy } from './bao-cao.js';

/* Trần thư lẻ mỗi ngày. Con số của chủ hệ thống; để thành một dòng để
   đổi được mà không phải đi tìm. */
const TRAN_THU_NGAY = 60;

const dinhDang = n => Number(n).toLocaleString('vi-VN') + 'đ';
const LECH_VN = 7 * 3600e3;

function ngayVN(iso) {
  return new Date(new Date(iso).getTime() + LECH_VN).toISOString().slice(0, 10);
}
function gioVN(iso) {
  return new Date(new Date(iso).getTime() + LECH_VN).toISOString()
    .slice(0, 16).replace('T', ' ');
}

/** Hòm thư nhận báo. Để ở cấu hình, không gõ cứng trong mã: đổi người
    nhận là việc của chủ hệ, không phải một lượt sửa mã và phát hành. */
function homThuNhan(env) {
  return String(env.GITA_THU_DOANH_THU || '').trim();
}

/* ═══════════════ BÁO MỘT LƯỢT TIỀN VÀO ═══════════════

   Gọi từ ghiPhieuThu, SAU khi phiếu đã nằm trong sổ. */
export async function baoTienVao(env, db, {phieu, ky, nguoiGhi}) {
  const den = homThuNhan(env);
  if (!den) return {gui: false, vi: 'Chưa đặt hòm thư nhận báo doanh thu.'};

  const ngay = ngayVN(phieu.ghiLuc);
  const k = dungKy('ngay', ngay);

  /* Dòng doanh thu HÔM NAY tính tới lúc này — đây mới là "dòng", chứ
     một con số lẻ thì chỉ là một giao dịch. Chủ hệ mở thư ra là thấy
     ngay hôm nay đã vào bao nhiêu, chứ không phải cộng tay từng lá. */
  const hn = await db.prepare(
    'SELECT COUNT(*) so, COALESCE(SUM(soTien),0) tong FROM phieuThu ' +
    "WHERE ghiLuc >= ? AND ghiLuc <= ? AND trangThai <> 'huy'"
  ).bind(k.tuLuc, k.denLuc).first();
  const soHomNay = Number(hn.so);

  /* ── QUA TRẦN THÌ THÔI GỬI LẺ ──
     Gửi ĐÚNG MỘT lá ở lượt vượt trần để chủ hệ biết mình vừa thôi được
     báo lẻ. Im lặng dừng là cách tệ nhất: người ta tưởng hết tiền vào. */
  if (soHomNay > TRAN_THU_NGAY) {
    if (soHomNay !== TRAN_THU_NGAY + 1) return {gui: false, quaTran: true};
    const ok = await guiThu(env, {den,
      tieuDe: 'GITA 365 · ' + ngay + ' — đã quá ' + TRAN_THU_NGAY + ' lượt thu, thôi báo lẻ',
      than: 'Hôm nay ' + ngay + ' đã có hơn ' + TRAN_THU_NGAY + ' lượt tiền vào.\n\n' +
        'Từ lượt này tới hết ngày sẽ KHÔNG gửi thư lẻ nữa — một hòm thư ngập là ' +
        'một hòm thư không ai đọc.\n\n' +
        'Bản tổng cuối ngày vẫn gửi đủ, và mọi lượt đều nằm trong sổ.' + CHAN_THU,
      batBuoc: false});
    return {gui: ok, quaTran: true, baoQuaTran: true};
  }

  const dong = [
    'Có tiền vào — ' + dinhDang(phieu.soTien),
    '',
    'Nhà        : ' + sachChoThu(phieu.maKhachHang, 40),
    'Số tiền    : ' + dinhDang(phieu.soTien),
    'Hình thức  : ' + sachChoThu(phieu.hinhThuc, 20)
  ];
  if (phieu.maThamChieu)
    dong.push('Mã giao dịch: ' + sachChoThu(phieu.maThamChieu, 80));
  if (ky) dong.push('Vào kỳ     : tầng ' + ky.tang + ' · kỳ ' + ky.ky + '/' + ky.soKy);
  else    dong.push('Vào kỳ     : CHƯA GẮN KỲ NÀO — cần gán vào kỳ để trừ nợ');
  dong.push(
    'Người ghi  : ' + sachChoThu(nguoiGhi, 60),
    'Lúc        : ' + gioVN(phieu.ghiLuc) + ' (giờ Việt Nam)',
    'Trạng thái : chờ duyệt — chưa tính vào tiền thực thu',
    '',
    '── Dòng doanh thu hôm nay ' + ngay + ' ──',
    'Đã vào     : ' + dinhDang(Number(hn.tong)) + ' qua ' + soHomNay + ' lượt',
    '',
    'Thư này chở DÒNG DOANH THU, không chở hồ sơ khách hàng: hòm thư là',
    'đường kém an toàn nhất trong hệ, nên tên phụ huynh, tên học viên và',
    'số điện thoại KHÔNG đi qua đây. Mở hệ để xem hồ sơ.'
  );

  const ok = await guiThu(env, {den,
    tieuDe: 'GITA 365 · tiền vào ' + dinhDang(phieu.soTien) + ' · ' +
      sachChoThu(phieu.maKhachHang, 40),
    than: dong.join('\n') + CHAN_THU,
    /* KHÔNG batBuoc. Phiếu đã nằm trong sổ trước khi thư đi; để một lá
       thư hỏng kéo đổ lượt ghi phiếu là mất tiền thật để cứu một lượt
       báo. */
    batBuoc: false});

  return {gui: ok, soHomNay, tongHomNay: Number(hn.tong)};
}

/* ═══════════════ BẢN TỔNG CUỐI NGÀY ═══════════════

   Gọi từ bộ chạy theo giờ. Đây là lá thư trả lời đúng câu chủ hệ hỏi —
   "có dòng doanh thu không" — và nó gửi CẢ KHI KHÔNG CÓ ĐỒNG NÀO VÀO.

   Ngày không có tiền vào mà không có thư là hai chuyện không phân biệt
   được: hôm nay không ai đóng tiền, và hệ thống báo hỏng. Chúng dẫn
   tới hai việc khác hẳn nhau, nên phải nói ra được cái nào. */
export async function tongNgayDoanhThu(env, db, ngay) {
  const den = homThuNhan(env);
  if (!den) return {gui: false};

  const n = ngay || ngayVN(new Date(Date.now() - 86400e3).toISOString());
  const k = dungKy('ngay', n);

  const thu = await db.prepare(
    'SELECT COUNT(*) so, COALESCE(SUM(soTien),0) tong FROM phieuThu ' +
    "WHERE ghiLuc >= ? AND ghiLuc <= ? AND trangThai <> 'huy'"
  ).bind(k.tuLuc, k.denLuc).first();

  const duyet = await db.prepare(
    'SELECT COUNT(*) so, COALESCE(SUM(soTien),0) tong FROM phieuThu ' +
    "WHERE ghiLuc >= ? AND ghiLuc <= ? AND trangThai = 'daDuyet'"
  ).bind(k.tuLuc, k.denLuc).first();

  const hinhThuc = await db.prepare(
    'SELECT hinhThuc, COUNT(*) so, COALESCE(SUM(soTien),0) tong FROM phieuThu ' +
    "WHERE ghiLuc >= ? AND ghiLuc <= ? AND trangThai <> 'huy' GROUP BY hinhThuc"
  ).bind(k.tuLuc, k.denLuc).all();

  const so = Number(thu.so);
  const dong = [
    'Dòng doanh thu ngày ' + n + ' (giờ Việt Nam)',
    ''
  ];

  if (!so) {
    dong.push(
      'HÔM NAY KHÔNG CÓ LƯỢT TIỀN VÀO NÀO.',
      '',
      'Thư này vẫn gửi khi không có đồng nào vào, và đó là chủ ý: một ngày',
      'không tiền mà không có thư thì không phân biệt được với một ngày hệ',
      'thống báo hỏng. Hai chuyện ấy dẫn tới hai việc khác hẳn nhau.');
  } else {
    dong.push(
      'Đã ghi     : ' + dinhDang(Number(thu.tong)) + ' qua ' + so + ' lượt',
      'Đã duyệt   : ' + dinhDang(Number(duyet.tong)) + ' qua ' + Number(duyet.so) + ' lượt',
      'Còn chờ    : ' + dinhDang(Number(thu.tong) - Number(duyet.tong)) +
        ' qua ' + (so - Number(duyet.so)) + ' lượt',
      '',
      '── Theo hình thức ──');
    for (const h of (hinhThuc.results || []))
      dong.push('  ' + String(h.hinhThuc).padEnd(14) + dinhDang(Number(h.tong)) +
        ' (' + Number(h.so) + ' lượt)');
    if (so > TRAN_THU_NGAY)
      dong.push('', 'Hôm nay quá ' + TRAN_THU_NGAY + ' lượt nên thư lẻ đã dừng giữa ' +
        'chừng; bản tổng này chở đủ.');
  }

  dong.push('', 'Số ĐÃ GHI là tiền có người nói đã vào; số ĐÃ DUYỆT là tiền có',
    'người thứ hai xác nhận. Chỉ số thứ hai vào bản kê tài chính.');

  const ok = await guiThu(env, {den,
    tieuDe: 'GITA 365 · dòng doanh thu ' + n + ' · ' +
      (so ? dinhDang(Number(thu.tong)) : 'không có lượt nào'),
    than: dong.join('\n') + CHAN_THU, batBuoc: false});

  if (ok) await Kho.ghiNhatKy(db, {username: 'may-chu', viec: 'BAO_DOANHTHU_NGAY',
    doiTuong: n, chiTiet: so + ' lượt · ' + Number(thu.tong) + 'đ'});
  return {gui: ok, ngay: n, so, tong: Number(thu.tong)};
}

export { TRAN_THU_NGAY };
