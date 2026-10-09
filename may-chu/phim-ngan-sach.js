/* ═══════════════════════════════════════════════════════════════
   GITA 365 — XƯỞNG PHIM CÓ TRẦN NGÂN SÁCH  (9/10/2026)

   Chủ hệ: "Tôi có thể trả thêm phí 3–10 USD cho một video 30 phút." Đó là
   lần đầu chủ hệ mở tiền cho video AI thật — và mở có TRẦN. Tệp này giữ
   cái trần ấy bằng mã, không bằng lời hứa.

   ══ HỌC TỪ AGENTCO (github.com/minhvq36/agentco) — ý tưởng, không chép mã ══
   AgentCo theo giấy phép FSL (chỉ được đọc, không phải mã nguồn mở), nên ở
   đây không lấy một dòng nào. Lấy ba ý:
   1. GIÁM ĐỐC LẬP KẾ HOẠCH, THỢ LÀM ĐÚNG MỘT VIỆC. Máy chủ (giám đốc) chia
      tập phim thành từng cảnh và quyết cảnh nào đáng tiền; máy GPU (thợ)
      nhận một cảnh, quay, trả kết quả rồi đi. Thợ không nói chuyện với nhau.
   2. ĐỀ BÀI MANG ĐƯỜNG DẪN, KHÔNG MANG NỘI DUNG. Đề bài cho thợ chỉ chứa khoá
      R2 của ảnh nhân vật và lời thoại — thợ tự lấy.
   3. BIÊN NHẬN NGẮN, CÓ MỘT CÂU NGƯỜI ĐỌC ĐƯỢC. Mỗi cảnh xong trả một biên
      nhận: bao nhiêu giây GPU, ra bao nhiêu giây phim, một câu `say` ≤ 200
      ký tự. Chủ hệ nhìn thấy tiền đi đâu ở từng cảnh, không phải đọc nhật ký.

   ══ CÁI TRẦN CÓ RĂNG Ở BA CHỖ ══
   1. GIỮ CHỖ TRƯỚC KHI GIAO VIỆC. Cảnh trả phí chỉ được giao khi
      (đã chi + đang giữ + ước tính cảnh này) ≤ trần tập VÀ ≤ trần tháng.
      Không đủ thì từ chối và đề nghị hạ cảnh ấy xuống loại miễn phí.
   2. GIỜ GPU CÓ HẠN. Đề bài mang `tranGiayGpu` = tiền đã giữ ÷ đơn giá; thợ
      phải dừng khi chạm. Thợ chạy quá thì biên nhận bị đánh dấu VƯỢT GIỜ và
      cả dự án tạm dừng cho tới khi người xem — một cái cầu dao, không phải
      một dòng cảnh báo.
   3. TIỀN DO MÁY CHỦ TÍNH. Thợ chỉ báo số giây GPU; máy chủ nhân với đơn giá
      đã khai. Một con số tiền gửi từ máy thợ là một lời khai.

   ══ ĐƠN GIÁ: ƯỚC TÍNH CHO TỚI KHI ĐO ĐƯỢC ══
   Hệ số "giây GPU cho mỗi giây phim" mặc định là ƯỚC TÍNH từ thông số công
   bố của các mô hình mở (LTX-Video bản chưng cất, Wan 2.2, MuseTalk) — CHƯA
   ĐO trên máy của Học viện. Khi đã có từ 5 biên nhận của một loại cảnh, máy
   dùng số ĐO ĐƯỢC thay cho số ước tính, và màn hình nói rõ số nào là số nào.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

import { BAC, laR01, tenNguoiDung as ten } from './vai-tro.js';
import { Kho } from './nen.js';
import { quayVideoDong } from './xuong-quay.js';

/* Ba loại cảnh, rẻ tới đắt. Máy chủ chọn loại cho từng cảnh theo ngân sách. */
export const LOAI_CANH = {
  tinh: { ten: 'Ảnh + chuyển động máy quay', giayCanh: 6, vi: 'Một khung hình vẽ trước, máy quay lia/đẩy, ráp bằng CPU — gần như không tốn GPU.' },
  khau: { ten: 'Nhân vật nói (khớp môi)', giayCanh: 6, vi: 'Khung chân dung + giọng đọc, khớp môi bằng mô hình nhẹ (MuseTalk) — rẻ.' },
  dong: { ten: 'Video AI chuyển động thật', giayCanh: 5, vi: 'Mô hình sinh video (LTX / Wan) dựng chuyển động thật — đắt nhất, dành cho cảnh then chốt.' }
};

/* Ba mức chất lượng của cảnh 'dong' — mức nào dùng mô hình nào, hệ số ước tính. */
export const CHAT_LUONG = {
  tietKiem: { ten: 'Tiết kiệm', moHinh: 'LTX-Video bản chưng cất · 768×512', heSoDong: 1.5 },
  canBang:  { ten: 'Cân bằng',  moHinh: 'Wan 2.2 5B (4 bước) · 720p',        heSoDong: 12 },
  caoNhat:  { ten: 'Cao nhất',  moHinh: 'Wan 2.2 14B (4 bước) · 720p',       heSoDong: 30 }
};

/* Đơn giá ước tính. Chủ hệ khai lại bằng biến môi trường khi đã chọn nhà
   cho thuê GPU (Modal · RunPod · …); khai thì số khai thắng số mặc định. */
export const DON_GIA_MAC_DINH = {
  gpuUsdGio: 3.95,    // H100 trên Modal — giá ghi ở xuong-phim-ai/README-nhanh.md; khai lại khi đổi nhà
  heSoKhau: 1.0,      // giây GPU cho mỗi giây khớp môi — ước tính
  giayGpuAnh: 3,      // giây GPU cho một khung hình (FLUX / Qwen-Image) — ước tính
  duPhong: 0.2        // 20% ngân sách giữ lại cho quay lại
};
export const TRAN = { tapToiDa: 10, tapToiThieu: 1, thangMacDinh: 100 };
export const MAU_DO_DUOC = 5;   // số biên nhận tối thiểu để dùng số đo được

function so(v, mac) { const n = Number(v); return isFinite(n) && n > 0 ? n : mac; }
/* Con số TRẦN đọc khác con số đơn giá: vắng mặt thì lấy mặc định, nhưng
   khai 0 nghĩa là CHẶN — không phải "không khai". Bản đầu dùng chung so()
   nên khai 0 để tắt chi thì trần lặng lẽ thành mức tối đa (bộ soát đối
   kháng 9/10/2026 đo ra: khai 0 cả hai trần vẫn giữ được 14,86 USD). */
function soTran(v, mac) {
  if (v === undefined || v === null || String(v).trim() === '') return mac;
  const n = Number(v);
  return isFinite(n) && n >= 0 ? n : mac;
}

/* Đơn giá đang dùng: biến môi trường > mặc định. Không đọc số tiền nào từ
   người gọi cửa. */
export function donGia(env) {
  const e = env || {};
  return {
    gpuUsdGio: so(e.GITA_PHIM_GPU_USD_GIO, DON_GIA_MAC_DINH.gpuUsdGio),
    heSoKhau: so(e.GITA_PHIM_HE_SO_KHAU, DON_GIA_MAC_DINH.heSoKhau),
    giayGpuAnh: so(e.GITA_PHIM_GIAY_GPU_ANH, DON_GIA_MAC_DINH.giayGpuAnh),
    duPhong: DON_GIA_MAC_DINH.duPhong,
    nguon: e.GITA_PHIM_GPU_USD_GIO ? 'khai' : 'uocTinh'
  };
}

/* Trần tiền: tập không bao giờ quá 10 USD (lời chủ hệ), và không ai nâng
   được bằng một tham số gửi lên — chỉ hạ. Tháng đọc từ biến môi trường. */
export function tranCua(env, tranTapXin) {
  const e = env || {};
  const tranTapHe = Math.min(TRAN.tapToiDa, soTran(e.GITA_PHIM_TRAN_TAP_USD, TRAN.tapToiDa));
  const coXin = !(tranTapXin === undefined || tranTapXin === null || String(tranTapXin).trim() === '');
  const xin = Number(tranTapXin);
  const tap = coXin && isFinite(xin) && xin >= 0 ? Math.min(xin, tranTapHe) : tranTapHe;
  return { tap: Math.max(0, Math.round(tap * 100) / 100), thang: soTran(e.GITA_PHIM_TRAN_THANG_USD, TRAN.thangMacDinh) };
}

/* ═══════════════ GIÁM ĐỐC: CHIA NGÂN SÁCH CHO MỘT TẬP ═══════════════
   Hàm thuần — cùng đầu vào thì cùng kết quả, bộ thử chạy được không cần mạng.
   Thứ tự ưu tiên: (1) mọi cảnh đều có khung hình; (2) lời thoại được khớp
   môi; (3) phần tiền còn lại dồn cho video chuyển động thật, tối đa 60% thời
   lượng — phần còn lại là ảnh + chuyển động máy quay. Một tập phim toàn cảnh
   'dong' không hay hơn: mắt người cần nhịp nghỉ, và tiền cho cảnh không cần
   chuyển động là tiền lấy khỏi cảnh cần. */
export function phanBoNganSach(o) {
  const phut = Math.min(60, Math.max(1, Number(o.phut) || 30));
  const giay = phut * 60;
  const tranUsd = Math.max(0, Number(o.tranUsd) || 0);
  const cl = CHAT_LUONG[o.chatLuong] || CHAT_LUONG.canBang;
  const dg = o.donGia || donGia({});
  const heSoDong = Number(o.heSoDong) > 0 ? Number(o.heSoDong) : cl.heSoDong;
  const heSoKhau = Number(o.heSoKhau) > 0 ? Number(o.heSoKhau) : dg.heSoKhau;
  const usdGiay = dg.gpuUsdGio / 3600;
  const tiLeThoai = Math.min(0.8, Math.max(0, o.tiLeThoai == null ? 0.35 : Number(o.tiLeThoai)));
  const tiLeDongMax = 0.6;
  const chiDuoc = tranUsd * (1 - dg.duPhong);

  /* Số cảnh theo độ dài trung bình — mỗi cảnh một khung hình. */
  const giayThoai = Math.round(giay * tiLeThoai);
  const soCanhUocTinh = Math.ceil(giay / 5.5);
  const tienAnh = soCanhUocTinh * dg.giayGpuAnh * usdGiay;
  const tienKhauDu = giayThoai * heSoKhau * usdGiay;

  let giayKhau = giayThoai, giayDong = 0, ghiChu = [];
  let con = chiDuoc - tienAnh;
  if (con < 0) {
    giayKhau = 0; con = 0;
    ghiChu.push('Ngân sách chưa đủ vẽ khung hình cho mọi cảnh bằng GPU thuê — khung hình đi đường Workers AI miễn phí (có trần mỗi ngày).');
  } else if (con < tienKhauDu) {
    giayKhau = Math.floor(con / (heSoKhau * usdGiay));
    con = 0;
    ghiChu.push('Chỉ đủ khớp môi ' + giayKhau + '/' + giayThoai + ' giây thoại — phần còn lại là lời dẫn trên ảnh.');
  } else {
    con -= tienKhauDu;
  }
  const giayConLai = giay - giayKhau;
  const dongMax = Math.min(giayConLai, Math.floor(giay * tiLeDongMax));
  giayDong = Math.min(dongMax, Math.floor(con / (heSoDong * usdGiay)));
  const giayTinh = Math.max(0, giay - giayKhau - giayDong);

  const tien = {
    anh: tienAnh > chiDuoc ? 0 : tienAnh,
    khau: giayKhau * heSoKhau * usdGiay,
    dong: giayDong * heSoDong * usdGiay
  };
  const tong = tien.anh + tien.khau + tien.dong;
  const lam = x => Math.round(x * 100) / 100;
  return {
    phut, giay, tranUsd: lam(tranUsd), chiDuoc: lam(chiDuoc), duPhongUsd: lam(tranUsd - chiDuoc),
    chatLuong: o.chatLuong in CHAT_LUONG ? o.chatLuong : 'canBang', moHinh: cl.moHinh,
    giayTheoLoai: { dong: giayDong, khau: giayKhau, tinh: giayTinh },
    canhTheoLoai: {
      dong: Math.ceil(giayDong / LOAI_CANH.dong.giayCanh),
      khau: Math.ceil(giayKhau / LOAI_CANH.khau.giayCanh),
      tinh: Math.ceil(giayTinh / LOAI_CANH.tinh.giayCanh)
    },
    tiLeDong: Math.round(giayDong / giay * 100),
    usdTheoLoai: { anh: lam(tien.anh), khau: lam(tien.khau), dong: lam(tien.dong) },
    usdUocTinh: lam(tong),
    heSo: { dong: heSoDong, khau: heSoKhau, nguon: o.nguonHeSo || 'uocTinh' },
    ghiChu
  };
}

/* ═══════════════ SỔ CHI ═══════════════ */
let daDung = false;
/* Tạo bảng tuần tự, không gói batch: CREATE … IF NOT EXISTS lặp lại được,
   nên hỏng giữa chừng thì lượt sau tạo nốt — không cần giao dịch. */
export async function taoBangPhim(db) {
  if (daDung) return;
  const cau = [
    'CREATE TABLE IF NOT EXISTS duAnPhim (id TEXT PRIMARY KEY, ten TEXT NOT NULL, soTap INTEGER NOT NULL, ' +
      'phutTap INTEGER NOT NULL, tranTapUsd REAL NOT NULL, chatLuong TEXT NOT NULL, ' +
      "trangThai TEXT NOT NULL DEFAULT 'chay', lyDoDung TEXT, taoBoi TEXT, taoLuc TEXT, suaLuc TEXT)",
    'CREATE TABLE IF NOT EXISTS chiPhiPhim (id TEXT PRIMARY KEY, duAnId TEXT NOT NULL, tap INTEGER NOT NULL, ' +
      'canh TEXT NOT NULL, loaiCanh TEXT NOT NULL, giuUsd REAL NOT NULL, tranGiayGpu INTEGER NOT NULL, ' +
      'thatUsd REAL, gpuGiay REAL, giayRa REAL, say TEXT, khoaR2 TEXT, maViec TEXT, ' +
      "trangThai TEXT NOT NULL DEFAULT 'giu', may TEXT, giuLuc TEXT NOT NULL, xongLuc TEXT, " +
      'UNIQUE (duAnId, tap, canh))',
    'CREATE INDEX IF NOT EXISTS ix_cpp_du_an ON chiPhiPhim (duAnId, tap, trangThai)',
    'CREATE INDEX IF NOT EXISTS ix_cpp_luc ON chiPhiPhim (giuLuc)',
    'CREATE INDEX IF NOT EXISTS ix_cpp_viec ON chiPhiPhim (maViec)'
  ];
  for (const c of cau) await db.prepare(c).run();
  daDung = true;
}

const duocQuanLy = hoSo => (BAC[String((hoSo || {}).role || '')] || 99) <= 3;
const dauThangISO = () => new Date().toISOString().slice(0, 7) + '-01T00:00:00.000Z';

/* Đã dùng của một tập / của tháng: tiền thật của cảnh xong + tiền đang giữ
   của cảnh chưa xong. Tính lúc đọc, không cột tổng nào.
   Cảnh LỖI ('loi') vẫn tính: máy đã chạy, giờ GPU đã đi, chỉ là không ra
   phim. Bỏ nó ra ngoài phép cộng thì một máy lỗi liên tục đốt tiền mãi mà
   không bao giờ chạm trần — đúng cái trần sinh ra để chặn. */
const DA_TIEU = "('giu','xong','vuotGio','loi')";
export const TRANG_THAI_DA_TIEU = ['giu', 'xong', 'vuotGio', 'loi'];
/* Hai phép cộng dùng ở CẢ chỗ đọc lẫn chỗ giữ tiền — một bản, không hai.
   Tháng: mọi khoản ĐANG GIỮ (giữ từ tháng trước mà chưa chạy vẫn là tiền
   sắp đi — bản đầu bỏ sót nên tháng mới có thể vượt trần), cộng tiền thật
   của cảnh đã xong trong tháng này (tính theo lúc xong). */
const TONG_TAP = "COALESCE(SUM(CASE WHEN trangThai = 'giu' THEN giuUsd ELSE COALESCE(thatUsd, 0) END), 0)";
const TONG_THANG = "COALESCE(SUM(CASE WHEN trangThai = 'giu' THEN giuUsd WHEN COALESCE(xongLuc, giuLuc) >= ? THEN COALESCE(thatUsd, 0) ELSE 0 END), 0)";
async function daDungTap(db, duAnId, tap) {
  const r = await db.prepare('SELECT ' + TONG_TAP + ' AS u FROM chiPhiPhim WHERE duAnId = ? AND tap = ? AND trangThai IN ' + DA_TIEU)
    .bind(duAnId, tap).first();
  return Number((r && r.u) || 0);
}
async function daDungThang(db) {
  const r = await db.prepare('SELECT ' + TONG_THANG + ' AS u FROM chiPhiPhim WHERE trangThai IN ' + DA_TIEU)
    .bind(dauThangISO()).first();
  return Number((r && r.u) || 0);
}

/* Dọn giữ chỗ treo NGAY khi có người giữ tiền hoặc mở sổ — không chỉ chờ lịch
   dọn hằng ngày. Bản đầu chỉ dọn theo lịch 20:00 UTC, nên câu "quá 3 giờ thì
   tiền tự trả về" có lúc sai tới 27 giờ. Lỗi ở đây không chặn việc chính. */
async function donGiuChoTreo(db) {
  try { await db.prepare(DON_GIU_CHO.cau).bind(...DON_GIU_CHO.dv()).run(); } catch (e) { /* bảng quay chưa có — bỏ qua */ }
}

/* Hệ số đo được từ biên nhận thật: giây GPU ÷ giây phim, theo loại cảnh. */
/* Cảnh chuyển động đo RIÊNG theo mức chất lượng của dự án: LTX (tiết kiệm)
   nhanh hơn Wan 14B (cao nhất) hàng chục lần. Gộp chung thì năm biên nhận
   rẻ làm cảnh cao nhất chỉ được giữ 1/14 số giờ nó cần — rồi cảnh ấy hỏng
   hoặc vượt giờ. Cảnh khớp môi dùng một mô hình ở mọi mức nên đo chung.
   Khoá: 'dong|<mức>' và 'khau'. */
export async function heSoDoDuoc(db) {
  const ds = ((await db.prepare("SELECT c.loaiCanh AS loai, COALESCE(d.chatLuong, 'canBang') AS cl, COUNT(*) AS n, " +
    'SUM(c.gpuGiay) AS g, SUM(c.giayRa) AS r FROM chiPhiPhim c LEFT JOIN duAnPhim d ON d.id = c.duAnId ' +
    "WHERE c.trangThai IN ('xong','vuotGio') AND c.gpuGiay > 0 AND c.giayRa > 0 GROUP BY c.loaiCanh, cl").all()).results) || [];
  const o = {}, khau = { n: 0, g: 0, r: 0 };
  for (const x of ds) {
    if (x.loai === 'khau') { khau.n += Number(x.n); khau.g += Number(x.g); khau.r += Number(x.r); continue; }
    if (Number(x.n) >= MAU_DO_DUOC) o[x.loai + '|' + x.cl] = { heSo: Number(x.g) / Number(x.r), mau: Number(x.n) };
  }
  if (khau.n >= MAU_DO_DUOC) o.khau = { heSo: khau.g / khau.r, mau: khau.n };
  return o;
}
export function heSoCua(doDuoc, loaiCanh, chatLuong) {
  return loaiCanh === 'dong' ? (doDuoc || {})['dong|' + (chatLuong || 'canBang')] : (doDuoc || {}).khau;
}

/* ═══════════════ CỬA: LẬP DỰ ÁN + KẾ HOẠCH ═══════════════ */
export async function lapDuAnPhim(y, env, db, hoSo) {
  if (!duocQuanLy(hoSo)) return { ok: false, code: 'NOPERM', error: 'Dự án phim trả phí mở cho Super Admin, Admin và Giám đốc.' };
  const x = y || {};
  const tenDA = String(x.ten || '').trim().slice(0, 120);
  if (tenDA.length < 4) return { ok: false, code: 'SAI', error: 'Tên dự án cần ít nhất 4 ký tự.' };
  const soTap = Math.round(Number(x.soTap) || 0), phut = Math.round(Number(x.phutTap) || 30);
  if (!(soTap >= 1 && soTap <= 30)) return { ok: false, code: 'SAI', error: 'Số tập từ 1 đến 30.' };
  if (!(phut >= 1 && phut <= 60)) return { ok: false, code: 'SAI', error: 'Mỗi tập từ 1 đến 60 phút.' };
  const cl = CHAT_LUONG[x.chatLuong] ? x.chatLuong : 'canBang';
  const coXin = !(x.tranTapUsd === undefined || x.tranTapUsd === null || String(x.tranTapUsd).trim() === '');
  if (coXin && !(Number(x.tranTapUsd) >= TRAN.tapToiThieu))
    return { ok: false, code: 'SAI', error: 'Trần mỗi tập tối thiểu ' + TRAN.tapToiThieu + ' USD (tối đa ' + TRAN.tapToiDa + ').' };
  const tran = tranCua(env, x.tranTapUsd);
  if (tran.tap < TRAN.tapToiThieu)
    return { ok: false, code: 'KHOA', error: 'Trần hệ cho phim trả phí đang là ' + tran.tap + ' USD — xưởng phim trả phí đang khoá.' };
  await taoBangPhim(db);
  const id = 'PH-' + crypto.randomUUID().slice(0, 8).toUpperCase(), luc = new Date().toISOString();
  await db.prepare('INSERT INTO duAnPhim (id, ten, soTap, phutTap, tranTapUsd, chatLuong, taoBoi, taoLuc, suaLuc) VALUES (?,?,?,?,?,?,?,?,?)')
    .bind(id, tenDA, soTap, phut, tran.tap, cl, ten(hoSo), luc, luc).run();
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'PHIM_DU_AN', doiTuong: id,
    chiTiet: soTap + ' tập × ' + phut + ' phút · trần ' + tran.tap + ' USD/tập · ' + cl });
  return Object.assign({ ok: true, id, tranTapUsd: tran.tap, tranThangUsd: tran.thang },
    { keHoach: await keHoachTap({ phutTap: phut, tranTapUsd: tran.tap, chatLuong: cl }, env, db) });
}

async function keHoachTap(da, env, db) {
  const dg = donGia(env), doDuoc = await heSoDoDuoc(db);
  const cl = CHAT_LUONG[da.chatLuong] || CHAT_LUONG.canBang;
  const hd = heSoCua(doDuoc, 'dong', da.chatLuong), hk = heSoCua(doDuoc, 'khau');
  return phanBoNganSach({ phut: da.phutTap, tranUsd: Math.min(Number(da.tranTapUsd) || 0, tranCua(env).tap), chatLuong: da.chatLuong, donGia: dg,
    heSoDong: hd ? hd.heSo : cl.heSoDong, heSoKhau: hk ? hk.heSo : dg.heSoKhau,
    nguonHeSo: hd || hk ? 'doDuoc' : 'uocTinh' });
}

/* ═══════════════ GIỮ CHỖ TRƯỚC KHI GIAO MỘT CẢNH TRẢ PHÍ ═══════════════
   Gọi từ chỗ GIAO việc cho máy GPU trả phí — không gọi từ màn hình. Trả về
   tranGiayGpu để đề bài mang theo. */
export async function giuChoCanh(env, db, { duAnId, tap, canh, loaiCanh, giayRa }) {
  await taoBangPhim(db);
  await donGiuChoTreo(db);
  const da = await db.prepare('SELECT * FROM duAnPhim WHERE id = ?').bind(String(duAnId || '')).first();
  if (!da) return { ok: false, code: 'KHONG_CO', error: 'Không có dự án phim này.' };
  if (da.trangThai !== 'chay') return { ok: false, code: 'DUNG', error: 'Dự án đang dừng: ' + (da.lyDoDung || da.trangThai) };
  const t = Math.round(Number(tap) || 0);
  if (!(t >= 1 && t <= da.soTap)) return { ok: false, code: 'SAI', error: 'Số tập ngoài dự án.' };
  if (!LOAI_CANH[loaiCanh] || loaiCanh === 'tinh') return { ok: false, code: 'KHONGTRAPHI', error: 'Cảnh ảnh + chuyển động máy quay không cần giữ tiền.' };
  const maCanh = String(canh == null ? '' : canh).trim().slice(0, 60);
  if (!maCanh) return { ok: false, code: 'SAI', error: 'Thiếu mã cảnh.' };
  /* Hỏi cảnh đã có dòng chưa TRƯỚC khi hỏi tiền: hỏi tiền trước thì một cảnh
     đã giữ rồi bị báo "hết tiền" — đúng nhưng lạc, và người đọc đi tìm chỗ
     thiếu tiền trong khi chuyện thật là cảnh ấy đã đang chạy. */
  const cu = await db.prepare('SELECT id, trangThai FROM chiPhiPhim WHERE duAnId = ? AND tap = ? AND canh = ?').bind(da.id, t, maCanh).first();
  if (cu) {
    if (cu.trangThai !== 'huy' && cu.trangThai !== 'loi')
      return { ok: false, code: 'DAGIU', error: 'Cảnh này đã được giữ tiền (' + cu.trangThai + ').' };
    /* Cảnh đã huỷ hoặc đã lỗi được quay lại: đổi tên dòng cũ để nhường chỗ
       cho lượt mới, KHÔNG xoá — dòng lỗi mang tiền đã tiêu, xoá nó là trả
       lại cho trần một khoản đã đi thật. */
    await db.prepare("UPDATE chiPhiPhim SET canh = canh || ? WHERE id = ? AND trangThai IN ('huy','loi')")
      .bind('#' + cu.trangThai + '-' + String(cu.id).slice(3, 11), cu.id).run();
  }
  const giay = Math.min(30, Math.max(1, Number(giayRa) || LOAI_CANH[loaiCanh].giayCanh));
  const dg = donGia(env), doDuoc = await heSoDoDuoc(db);
  const cl = CHAT_LUONG[da.chatLuong] || CHAT_LUONG.canBang;
  const hs = heSoCua(doDuoc, loaiCanh, da.chatLuong);
  const heSo = hs ? hs.heSo : (loaiCanh === 'dong' ? cl.heSoDong : dg.heSoKhau);
  const usdGiay = dg.gpuUsdGio / 3600;
  /* Giữ thêm 25% cho một cảnh — mô hình chạy chậm hơn ước tính là chuyện
     thường; giữ sát quá thì cầu dao giờ GPU nhảy oan. */
  const giuUsd = Math.round((giay * heSo + dg.giayGpuAnh) * usdGiay * 1.25 * 10000) / 10000;
  /* Trần của tập = trần ghi lúc lập dự án, NHƯNG không quá trần hệ hiện tại:
     chủ hệ hạ GITA_PHIM_TRAN_TAP_USD thì dự án cũ cũng hạ theo. */
  const tran = tranCua(env, da.tranTapUsd);
  const tranTap = Math.min(Number(da.tranTapUsd) || 0, tran.tap);
  const id = 'CP-' + crypto.randomUUID().slice(0, 12);
  const tranGiayGpu = Math.max(1, Math.floor(giuUsd / usdGiay));
  /* Hỏi trần và ghi dòng giữ tiền trong MỘT câu lệnh. Bản đầu đọc tổng rồi
     ghi ở câu sau: sáu lượt giữ gửi cùng lúc cùng đọc thấy còn tiền, cùng
     ghi — 4,96 USD trên một tập trần 1 USD (bộ soát đối kháng đo được). Một
     câu INSERT … SELECT … WHERE thì cơ sở dữ liệu tự xếp hàng các lượt ghi,
     lượt sau thấy dòng của lượt trước. */
  let r;
  try {
    r = await db.prepare('INSERT INTO chiPhiPhim (id, duAnId, tap, canh, loaiCanh, giuUsd, tranGiayGpu, giayRa, giuLuc) ' +
      'SELECT ?,?,?,?,?,?,?,?,? WHERE ' +
      '(SELECT ' + TONG_TAP + ' FROM chiPhiPhim WHERE duAnId = ? AND tap = ? AND trangThai IN ' + DA_TIEU + ') + ? <= ? AND ' +
      '(SELECT ' + TONG_THANG + ' FROM chiPhiPhim WHERE trangThai IN ' + DA_TIEU + ') + ? <= ?')
      .bind(id, da.id, t, maCanh, loaiCanh, giuUsd, tranGiayGpu, giay, new Date().toISOString(),
        da.id, t, giuUsd, tranTap + 1e-9, dauThangISO(), giuUsd, tran.thang + 1e-9).run();
  } catch (e) {
    /* UNIQUE (duAnId, tap, canh): một cảnh không bị giữ tiền hai lần. */
    if (/UNIQUE/i.test(String(e && e.message))) return { ok: false, code: 'DAGIU', error: 'Cảnh này đã được giữ tiền.' };
    throw e;
  }
  if (!(r && r.meta && r.meta.changes === 1)) {
    const [dungTap, dungThang] = [await daDungTap(db, da.id, t), await daDungThang(db)];
    if (dungTap + giuUsd > tranTap + 1e-9)
      return { ok: false, code: 'VUOTTRANTAP', con: Math.max(0, Math.round((tranTap - dungTap) * 100) / 100),
        error: 'Tập ' + t + ' đã dùng ' + dungTap.toFixed(2) + '/' + tranTap + ' USD — cảnh này hạ xuống ảnh + chuyển động máy quay.' };
    return { ok: false, code: 'VUOTTRANTHANG', error: 'Tháng này đã dùng ' + dungThang.toFixed(2) + '/' + tran.thang + ' USD cho phim.' };
  }
  return { ok: true, chiPhiId: id, giuUsd, tranGiayGpu, heSo: Math.round(heSo * 100) / 100,
    nguonHeSo: hs ? 'doDuoc' : 'uocTinh' };
}

/* ═══════════════ BIÊN NHẬN TỪ MÁY GPU ═══════════════
   Máy chỉ báo giây GPU, giây phim, khoá R2 và một câu. Tiền do máy chủ tính.
   Gọi từ cửa có xác thực máy (cùng khoá của máy quay) — không mở cho phiên. */
export async function bienNhanCanh(env, db, b) {
  await taoBangPhim(db);
  const x = b || {};
  const r = await db.prepare('SELECT * FROM chiPhiPhim WHERE id = ?').bind(String(x.chiPhiId || '')).first();
  if (!r) return { ok: false, code: 'KHONG_CO', error: 'Không có dòng giữ chỗ này.' };
  /* Nhận biên nhận khi còn giữ chỗ, HOẶC khi máy đã nộp kết quả trước và sổ
     tạm ghi bằng tiền đã giữ (chưa có giây GPU) — biên nhận thật thay số tạm. */
  const tamGhi = r.trangThai === 'xong' && (r.gpuGiay === null || r.gpuGiay === undefined);
  if (r.trangThai !== 'giu' && !tamGhi) return { ok: false, code: 'DABAO', error: 'Cảnh này đã có biên nhận.' };
  const gpuGiay = Math.max(0, Number(x.gpuGiay) || 0), giayRa = Math.max(0, Number(x.giayRa) || 0);
  const say = String(x.say || '').replace(/[\u0000-\u001f]+/g, ' ').trim().slice(0, 200);
  const khoaR2 = /^[A-Za-z0-9/_.\-]{1,200}$/.test(String(x.khoaR2 || '')) ? String(x.khoaR2) : null;
  const dg = donGia(env);
  const thatUsd = Math.round(gpuGiay * dg.gpuUsdGio / 3600 * 10000) / 10000;
  const luc = new Date().toISOString();
  /* Cầu dao xét MỌI biên nhận, kể cả biên nhận báo hỏng: máy chạy quá giờ
     rồi báo hỏng vẫn là máy chạy quá giờ. Bản đầu xét sau nhánh báo hỏng nên
     một lượt hỏng vượt 30 lần hạn vẫn để dự án chạy tiếp. */
  const vuot = gpuGiay > r.tranGiayGpu * 1.05;
  if (x.ok === false) {
    await db.prepare("UPDATE chiPhiPhim SET trangThai = 'loi', thatUsd = ?, gpuGiay = ?, say = ?, xongLuc = ? WHERE id = ?")
      .bind(thatUsd, gpuGiay, say, luc, r.id).run();
  } else {
    await db.prepare('UPDATE chiPhiPhim SET trangThai = ?, thatUsd = ?, gpuGiay = ?, giayRa = ?, say = ?, khoaR2 = ?, xongLuc = ? WHERE id = ?')
      .bind(vuot ? 'vuotGio' : 'xong', thatUsd, gpuGiay, giayRa, say, khoaR2, luc, r.id).run();
  }
  if (vuot) {
    /* Cầu dao: máy chạy quá giờ đã giữ → dừng cả dự án cho tới khi người xem.
       Cảnh đang chờ của dự án ấy không máy nào nhận nữa (locNhanViec). */
    await db.prepare("UPDATE duAnPhim SET trangThai = 'dung', lyDoDung = ?, suaLuc = ? WHERE id = ?")
      .bind('Cảnh ' + r.canh + ' tập ' + r.tap + ' chạy ' + Math.round(gpuGiay) + ' giây GPU, quá hạn ' + r.tranGiayGpu + ' giây đã giữ.', luc, r.duAnId).run();
  }
  return { ok: true, trangThai: x.ok === false ? 'loi' : (vuot ? 'vuotGio' : 'xong'), thatUsd, duAnDung: vuot };
}

/* Giữ chỗ quá 3 giờ mà không có biên nhận:
   · việc CHƯA máy nào nhận → huỷ, trả tiền giữ về (không giam ngân sách);
   · việc ĐÃ có máy nhận → ghi chi đúng bằng tiền đã giữ. Máy đã chạy mà
     không báo là tiền đã đi; trả về ngân sách lúc ấy là để trần bị vượt
     thật trong khi sổ vẫn báo còn. Ghi dư an toàn hơn ghi thiếu. */
export const DON_GIU_CHO = {
  bang: 'chiPhiPhim',
  cau: "UPDATE chiPhiPhim SET " +
    "trangThai = CASE WHEN EXISTS (SELECT 1 FROM quay_viec q WHERE q.ma = chiPhiPhim.maViec AND q.trangThai <> 'cho') THEN 'xong' ELSE 'huy' END, " +
    "thatUsd = CASE WHEN EXISTS (SELECT 1 FROM quay_viec q WHERE q.ma = chiPhiPhim.maViec AND q.trangThai <> 'cho') THEN giuUsd ELSE NULL END, " +
    "say = CASE WHEN EXISTS (SELECT 1 FROM quay_viec q WHERE q.ma = chiPhiPhim.maViec AND q.trangThai <> 'cho') " +
    "THEN 'Máy không gửi biên nhận — ghi bằng tiền đã giữ.' ELSE 'Không máy nào nhận — trả tiền giữ về.' END " +
    "WHERE trangThai = 'giu' AND giuLuc < ?",
  dv: () => [new Date(Date.now() - 3 * 3600e3).toISOString()],
  vi: 'giữ chỗ cảnh phim quá 3 giờ không biên nhận: chưa ai nhận thì trả tiền về, đã có máy chạy thì ghi bằng tiền đã giữ'
};

/* ═══════════════ CỬA: GIAO MỘT CẢNH TRẢ PHÍ ═══════════════
   Giữ tiền TRƯỚC, rồi mới đặt việc vào hàng chờ xưởng quay. Đặt việc hỏng
   thì huỷ phần đã giữ. Việc đã giữ tiền chỉ máy TRẢ PHÍ nhận (máy khai
   traPhi), máy miễn phí bỏ qua — xem nhanViecCoNganSach. Chỉ Super Admin,
   cùng luật của xưởng quay. */
export async function datCanhTraPhi(y, env, db, hoSo) {
  if (!laR01(hoSo)) return { ok: false, code: 'NOPERM', error: 'Giao cảnh trả phí chỉ Super Admin.' };
  const x = y || {};
  /* Khớp môi trả phí cần một máy thợ có MuseTalk nhận việc trả phí — chưa
     có máy ấy (may-tra-phi.py chỉ quay chuyển động). Giữ tiền cho một việc
     không máy nào nhận là giam ngân sách vô ích; cảnh nói vẫn đi đường khớp
     môi miễn phí như cũ. */
  if (x.loaiCanh === 'khau')
    return { ok: false, code: 'CHUACOMAY', error: 'Khớp môi trả phí chưa có máy thợ nhận — cảnh nói đi đường khớp môi miễn phí của xưởng quay.' };
  const loaiCanh = 'dong';
  const g = await giuChoCanh(env, db, { duAnId: x.duAnId, tap: x.tap, canh: x.canh, loaiCanh, giayRa: x.giayRa });
  if (!g.ok) return g;
  /* Gắn mã việc vào dòng giữ tiền TRƯỚC khi việc vào hàng chờ. Bản đầu đặt
     việc rồi mới gắn: trong khe ấy một máy MIỄN PHÍ thấy việc chưa gắn tiền
     và nhận mất, còn sổ thì vẫn tính tiền cho lượt chạy miễn phí. */
  const maViec = [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2, '0')).join('');
  await db.prepare('UPDATE chiPhiPhim SET maViec = ? WHERE id = ?').bind(maViec, g.chiPhiId).run();
  let viec;
  try {
    viec = await quayVideoDong(x, env, db, hoSo, { ma: maViec });
  } catch (e) { viec = { ok: false, error: String(e && e.message || e).slice(0, 160) }; }
  if (!viec || !viec.ok || viec.ma !== maViec) {
    await db.prepare("UPDATE chiPhiPhim SET trangThai = 'huy', say = ? WHERE id = ?")
      .bind('Không đặt được việc: ' + String((viec && viec.error) || '').slice(0, 150), g.chiPhiId).run();
    return Object.assign({ ok: false, code: (viec && viec.code) || 'DATVIEC' }, { error: (viec && viec.error) || 'Không đặt được việc vào xưởng quay.' });
  }
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'PHIM_CANH_TRA_PHI', doiTuong: g.chiPhiId,
    chiTiet: x.duAnId + ' · tập ' + x.tap + ' · ' + loaiCanh + ' · giữ ' + g.giuUsd + ' USD' });
  return { ok: true, ma: viec.ma, chiPhiId: g.chiPhiId, giuUsd: g.giuUsd, tranGiayGpu: g.tranGiayGpu, nguonHeSo: g.nguonHeSo };
}

/* ═══════════════ PHÍA MÁY QUAY (xuong-quay.js gọi) ═══════════════ */
/* Dòng giữ chỗ của một việc, nếu việc ấy là việc trả phí. */
export async function giuChoCuaViec(db, ma) {
  await taoBangPhim(db);
  /* Mang theo độ dài cảnh và mức chất lượng của dự án: máy thợ quay đúng
     thứ đã được giữ tiền, không tự chọn dài hơn hay đẹp hơn. */
  return await db.prepare('SELECT c.id, c.tranGiayGpu, c.trangThai, c.giayRa, c.loaiCanh, d.chatLuong FROM chiPhiPhim c ' +
    'LEFT JOIN duAnPhim d ON d.id = c.duAnId WHERE c.maViec = ? LIMIT 1').bind(String(ma || '')).first();
}
/* Điều kiện SQL cho câu nhận việc: máy trả phí chỉ nhận việc ĐÃ giữ tiền;
   máy miễn phí không bao giờ nhận việc đã giữ tiền (để không tính tiền
   cho một việc máy miễn phí làm, và để việc trả phí đi đúng máy tốt). */
/* Máy trả phí còn đòi dự án ĐANG CHẠY: cầu dao nhảy thì cảnh đã xếp hàng
   của dự án ấy cũng dừng — bản đầu chỉ chặn giữ tiền MỚI, nên sau cầu dao
   máy vẫn nhận tiếp hai cảnh đang chờ và cả hai lại vượt giờ. Điều kiện này
   chạy ở CẢ câu chọn lẫn câu nhận (xuong-quay.js), để lịch dọn trả tiền về
   giữa hai câu thì câu nhận cũng không ăn. */
export function locNhanViec(traPhi) {
  return traPhi
    ? " AND EXISTS (SELECT 1 FROM chiPhiPhim c JOIN duAnPhim d ON d.id = c.duAnId WHERE c.maViec = quay_viec.ma AND c.trangThai = 'giu' AND d.trangThai = 'chay')"
    : " AND NOT EXISTS (SELECT 1 FROM chiPhiPhim c WHERE c.maViec = quay_viec.ma AND c.trangThai = 'giu')";
}
/* Việc trả phí hỏng hoặc máy im lặng quá hạn → KHÔNG giao lại cho máy khác
   trên cùng một dòng giữ chỗ. Giao lại thì lượt chạy đầu đã đốt giờ GPU mà
   sổ không ghi, lượt hai đốt tiếp — ba lượt thử là gấp ba trần mà sổ vẫn
   báo một. Nên ghi lượt ấy là LỖI bằng đúng tiền đã giữ (máy có thể đã
   chạy tới hạn), rồi người giao lại cảnh bằng một lượt giữ tiền MỚI — lượt
   mới đi qua trần như mọi lượt khác. */
export async function chotKhiViecLoi(db, ma, say) {
  const r = await giuChoCuaViec(db, ma);
  if (!r || r.trangThai !== 'giu') return false;
  await db.prepare("UPDATE chiPhiPhim SET trangThai = 'loi', thatUsd = giuUsd, say = ?, xongLuc = ? WHERE id = ? AND trangThai = 'giu'")
    .bind(String(say || 'Việc hỏng — ghi bằng tiền đã giữ.').slice(0, 200), new Date().toISOString(), r.id).run();
  return true;
}
export const CO_GIU_CHO = "EXISTS (SELECT 1 FROM chiPhiPhim c WHERE c.maViec = quay_viec.ma AND c.trangThai = 'giu')";

/* Máy nộp kết quả mà không gửi biên nhận → ghi bằng tiền đã giữ (ghi dư an
   toàn hơn ghi thiếu). Có biên nhận rồi thì không làm gì. */
export async function chotKhiNopKetQua(db, ma) {
  const r = await giuChoCuaViec(db, ma);
  if (!r || r.trangThai !== 'giu') return;
  await db.prepare("UPDATE chiPhiPhim SET trangThai = 'xong', thatUsd = giuUsd, say = ?, xongLuc = ? WHERE id = ? AND trangThai = 'giu'")
    .bind('Máy nộp kết quả nhưng chưa gửi biên nhận — ghi bằng tiền đã giữ.', new Date().toISOString(), r.id).run();
}

/* ═══════════════ CỬA: ĐỌC XƯỞNG PHIM ═══════════════ */
export async function docXuongPhimNganSach(y, env, db, hoSo) {
  if (!duocQuanLy(hoSo)) return { ok: false, code: 'NOPERM', error: 'Xem sổ chi phim mở cho R01–R03.' };
  await taoBangPhim(db);
  await donGiuChoTreo(db);
  const tran = tranCua(env), dg = donGia(env), doDuoc = await heSoDoDuoc(db);
  const dsDA = ((await db.prepare('SELECT * FROM duAnPhim ORDER BY suaLuc DESC LIMIT 20').all()).results) || [];
  const duAn = [];
  for (const da of dsDA) {
    /* daChi gồm cả cảnh LỖI — tiền đã đi dù không ra phim; giayXong chỉ đếm
       phim ra được. Nên lỗi nhiều thì "dự báo" xấu đi, đúng chiều phải báo. */
    const tapRows = ((await db.prepare("SELECT tap, COUNT(*) AS soCanh, " +
      "SUM(CASE WHEN trangThai IN ('xong','vuotGio','loi') THEN COALESCE(thatUsd,0) ELSE 0 END) AS daChi, " +
      "SUM(CASE WHEN trangThai = 'giu' THEN giuUsd ELSE 0 END) AS dangGiu, " +
      "SUM(CASE WHEN trangThai = 'loi' THEN 1 ELSE 0 END) AS soLoi, " +
      "SUM(CASE WHEN trangThai IN ('xong','vuotGio') THEN COALESCE(giayRa,0) ELSE 0 END) AS giayXong " +
      'FROM chiPhiPhim WHERE duAnId = ? GROUP BY tap ORDER BY tap').bind(da.id).all()).results) || [];
    const bien = ((await db.prepare("SELECT tap, canh, loaiCanh, trangThai, thatUsd, gpuGiay, giayRa, say, xongLuc FROM chiPhiPhim " +
      "WHERE duAnId = ? AND trangThai <> 'giu' ORDER BY xongLuc DESC LIMIT 12").bind(da.id).all()).results) || [];
    const kh = await keHoachTap(da, env, db);
    duAn.push({ id: da.id, ten: da.ten, soTap: da.soTap, phutTap: da.phutTap, tranTapUsd: Math.min(Number(da.tranTapUsd) || 0, tran.tap), chatLuong: da.chatLuong,
      trangThai: da.trangThai, lyDoDung: da.lyDoDung || undefined, keHoach: kh,
      tap: tapRows.map(t => {
        const daChi = Math.round(Number(t.daChi) * 100) / 100, giayXong = Number(t.giayXong) || 0;
        /* "Đi sai hướng": tiền mỗi giây phim cảnh trả phí đã quay, nhân ra phần
           trả phí còn lại của kế hoạch — vượt trần thì nói trước, đừng đợi hết tiền. */
        const giayTraPhi = kh.giayTheoLoai.dong + kh.giayTheoLoai.khau;
        const duBao = giayXong > 0 ? Math.round(daChi / giayXong * giayTraPhi * 100) / 100 : undefined;
        return { tap: t.tap, soCanh: Number(t.soCanh), daChi, dangGiu: Math.round(Number(t.dangGiu) * 100) / 100,
          soLoi: Number(t.soLoi) || 0, giayXong, duBaoUsd: duBao, saiHuong: duBao !== undefined && duBao > Math.min(Number(da.tranTapUsd) || 0, tran.tap) };
      }),
      bienNhan: bien });
  }
  return { ok: true, tranThangUsd: tran.thang, daDungThangUsd: Math.round(await daDungThang(db) * 100) / 100,
    donGia: dg, heSoDoDuoc: doDuoc, chatLuong: CHAT_LUONG, loaiCanh: LOAI_CANH, duAn };
}

/* Super Admin mở lại dự án đã nhảy cầu dao — phải viết lý do. */
export async function moLaiDuAnPhim(y, env, db, hoSo) {
  if (!laR01(hoSo)) return { ok: false, code: 'NOPERM', error: 'Chỉ Super Admin mở lại dự án phim đã dừng.' };
  const lyDo = String((y || {}).lyDo || '').trim();
  if (lyDo.length < 10) return { ok: false, code: 'THIEULYDO', error: 'Viết lý do mở lại (ít nhất 10 ký tự).' };
  await taoBangPhim(db);
  const r = await db.prepare("UPDATE duAnPhim SET trangThai = 'chay', lyDoDung = NULL, suaLuc = ? WHERE id = ? AND trangThai = 'dung'")
    .bind(new Date().toISOString(), String((y || {}).id || '')).run();
  if (!(r && r.meta && r.meta.changes)) return { ok: false, code: 'KHONG_DUNG', error: 'Dự án không ở trạng thái dừng.' };
  await Kho.ghiNhatKy(db, { uid: hoSo.uid, username: ten(hoSo), viec: 'PHIM_MO_LAI', doiTuong: String(y.id), chiTiet: lyDo.slice(0, 200) });
  return { ok: true };
}
