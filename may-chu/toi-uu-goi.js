/* ═══════════════════════════════════════════════════════════════
   GITA 365 — BỘ TỐI ƯU HOÁ CẤU HÌNH GÓI
   Theo `gita365-toi-uu-goi.ts` của chủ hệ, viết lại bằng JS thuần.

   Bản chép của G.TU_* — bộ kiểm mục 85 đối chiếu từng ô với kho.

   ══ HÀM MỤC TIÊU LÀ LỜI MỞ ĐẦU HIẾN PHÁP VIẾT THÀNH MÃ ══

     ① chưa đạt mục tiêu lợi nhuận  → tối đa hoá LỢI NHUẬN
     ② đã đạt                       → tối đa hoá SỐ GIA ĐÌNH, và HẠ GIÁ

   Đủ tiền rồi thì phục vụ thêm người, không lấy thêm tiền của cùng số
   người. Và phải nói thẳng hệ quả: bậc hai BỎ phần lợi nhuận vượt mục
   tiêu ra khỏi điểm số, nên bộ tối ưu sẽ vui vẻ đánh đổi mười tám tỷ
   lấy vài trăm gia đình. Đó đúng là điều được yêu cầu.

   ══ BỐN CHỖ ĐÃ VÁ SO VỚI TỆP GỐC ══

   V1 · `lamTronGia` không idempotent — f(300.000)=290.000 rồi
        f(290.000)=280.000. Mà BUOC_GIA có 1.0 để nghĩa "không đổi",
        và cái chặn `giaMoi === giaCu` không nổ. Mỗi vòng leo đồi hạ
        MỌI giá một bước không phải vì điểm số; mười hai vòng là
        300.000 xuống 180.000.
   V2 · f(999.999)=990.000 nhưng f(1.000.000)=900.000 — lệch một đồng
        thì phép hạ khác nhau một trăm lần.
   V3 · dưới mười triệu thì giá "đuôi 9", từ mười triệu trở lên thì
        không. Hai nửa một bảng giá theo hai kiểu.
   V4 · `giaiQuyMo` chia đôi mà không kiểm điều kiện chia đôi.

   Cách vá V1–V3 là TÁCH HAI VIỆC: làm tròn là một phép kỹ thuật và
   nó idempotent; giá "đuôi 9" là một quyết định GIÁ và nó chạy ĐÚNG
   MỘT LẦN lúc trình ra.
   ═══════════════════════════════════════════════════════════════ */

import { tinhToanHeThong, kiemHienPhap, kiemThamSo, ViPhamHienPhap }
  from './gia-goi.js';

/* ═══════════════ BẢN CHÉP CỦA KHO ═══════════════ */

export const MUC_TIEU = ['MT1', 'MT2'];
export const RANG_BUOC_MA = ['RB1', 'RB2', 'RB3', 'RB4', 'RB5', 'RB6'];
export const RANG_BUOC_CUNG = ['RB1', 'RB2', 'RB4'];
export const DA_VA = ['V1', 'V2', 'V3', 'V4'];

/* Tỷ giá quy đổi của bậc hai. Đặt tên riêng vì nó là con số quan
   trọng nhất của cả bộ tối ưu — nằm lẫn trong một biểu thức thì không
   ai thấy nó, và không ai hỏi ai đặt. Mục chờ TU-01. */
export const MOI_GIA_DINH = 100000;
export const MOI_DONG_GIA_TB = 5;

export const PHAT_VI_PHAM = 1e15;

export const RANG_BUOC_MAC_DINH = {
  loiNhuanSauThueToiThieu: 2000000000,
  soNguoiDayToiDa: 6,
  soBuoiMoiNguoiMoiTuan: 12,
  soLuotFreeToiDa: 20000,
  tyLeChuyenDoi: 0.20,
  bienGopToiThieu: 0.45,
  tyLeNhayGiaToiDa: 3.5,
  giaTran: {}
};

/* ═══════════════ V1·V2·V3 · LÀM TRÒN, ĐÃ VÁ ═══════════════

   Một việc, và nó IDEMPOTENT: f(f(x)) = f(x). Không trừ bước, không
   đổi bậc, không rơi xuống dưới sàn của bậc đang đứng.

   Phép thử của bộ kiểm chạy thẳng vào đây: làm tròn hai lần phải ra
   đúng một kết quả. */
export function lamTron(v) {
  const x = Number(v) || 0;
  if (x <= 0) return 0;
  const buoc = x < 1000000 ? 10000 : x < 10000000 ? 100000 : 1000000;
  const r = Math.round(x / buoc) * buoc;
  /* Không cho rơi xuống bậc dưới: làm tròn 1.000.000 mà ra 900.000
     thì lần gọi sau nó đổi bậc và hạ tiếp — đúng lỗi V2. */
  return Math.max(r, buoc);
}

/* Giá "đuôi 9" — một quyết định GIÁ, không phải một phép làm tròn.
   Chạy ĐÚNG MỘT LẦN lúc trình ra, không chạy trong vòng lặp tối ưu.
   Áp cho MỌI bậc, không chỉ bậc dưới mười triệu (vá V3). */
export function giaDep(v) {
  const r = lamTron(v);
  if (r <= 0) return 0;
  const buoc = r < 1000000 ? 10000 : r < 10000000 ? 100000 : 1000000;
  const san = r < 1000000 ? 0 : r < 10000000 ? 1000000 : 10000000;
  /* Chỉ hạ khi con số đang tròn chục bước — 300.000 thành 290.000,
     còn 250.000 vốn đã đọc được thì để nguyên. Nhờ thế nó idempotent:
     gọi lại trên 290.000 không hạ nữa.

     VÀ không hạ khi việc hạ làm giá RƠI XUỐNG BẬC DƯỚI. Bản đầu của
     phép vá này quên chỗ ấy: giaDep(1.000.000) ra 900.000, rồi lần
     gọi sau 900.000 thuộc bậc mười nghìn nên nó hạ tiếp còn 890.000 —
     đúng lỗi V2 quay lại ở một chỗ khác. Một giá đứng ngay đáy bậc
     thì không có kiểu "đuôi 9" nào giữ nó ở lại bậc ấy được, nên để
     nguyên là câu trả lời đúng. */
  if (r % (buoc * 10) !== 0 || r <= buoc) return r;
  return (r - buoc) >= san ? r - buoc : r;
}

/* ═══════════════ KIỂM RÀNG BUỘC ═══════════════

   Tệp gốc nhận `ts` rồi không dùng tới. Bỏ hẳn — một tham số không ai
   đọc làm người sửa sau tưởng nó có vai trò, rồi truyền sai mà không
   có gì báo. */
export function kiemRangBuoc(danhMuc, kq, rb) {
  const viPham = [];
  const soNguoiDay = Math.ceil(kq.soBuoiMoiTuan / rb.soBuoiMoiNguoiMoiTuan);

  if (soNguoiDay > rb.soNguoiDayToiDa) viPham.push(
    { ma: 'RB1', vi: 'Cần ' + soNguoiDay + ' người dạy, chỉ tuyển được ' +
      rb.soNguoiDayToiDa + '.' });
  if (kq.soLuotFree > rb.soLuotFreeToiDa) viPham.push(
    { ma: 'RB2', vi: 'Cần ' + Math.round(kq.soLuotFree) + ' lượt Free, vượt trần ' +
      rb.soLuotFreeToiDa + '.' });

  for (const g of kq.goi) {
    if (g.giaNiemYet > 0 && g.bienGop < rb.bienGopToiThieu) viPham.push(
      { ma: 'RB3', vi: 'Gói ' + g.ma + ' biên gộp ' + Math.round(g.bienGop * 100) +
        '% dưới sàn ' + Math.round(rb.bienGopToiThieu * 100) + '%.' });
    const tran = (rb.giaTran || {})[g.ma];
    if (tran !== undefined && g.giaNiemYet > tran) viPham.push(
      { ma: 'RB4', vi: 'Gói ' + g.ma + ' giá ' + g.giaNiemYet + ' vượt trần thị trường.' });
  }

  /* Vách đá giá xét TRONG TỪNG NHÁNH. Xét chung cả hai nhánh thì một
     gói tự đi rẻ nhất nằm cạnh một gói có người đắt nhất, và phép so
     báo vách đá ở chỗ không ai leo qua. */
  for (const nhanh of ['TU_DI', 'CO_NGUOI']) {
    const bac = danhMuc.filter(g => g.nhanh === nhanh && g.giaNiemYet > 0)
      .slice().sort((a, b) => a.giaNiemYet - b.giaNiemYet);
    for (let i = 1; i < bac.length; i++) {
      const ty = bac[i].giaNiemYet / bac[i - 1].giaNiemYet;
      if (ty > rb.tyLeNhayGiaToiDa) viPham.push(
        { ma: 'RB5', vi: 'Vách đá giá ' + bac[i - 1].ma + '→' + bac[i].ma +
          ': gấp ' + ty.toFixed(1) + ' lần, trần ' + rb.tyLeNhayGiaToiDa + '.' });
    }
  }

  const cung = viPham.filter(v => RANG_BUOC_CUNG.indexOf(v.ma) >= 0);
  return { hopLe: viPham.length === 0, viPham, soNguoiDayCanCo: soNguoiDay,
    /* Ràng buộc CỨNG tách riêng: vượt là cấu hình KHÔNG TỒN TẠI, không
       phải cấu hình kém điểm. Trộn hai loại vào một con số phạt thì
       một cấu hình không tuyển nổi người vẫn thắng nhờ điểm đẹp. */
    phamCung: cung.length > 0, cung };
}

/* ═══════════════ HÀM MỤC TIÊU ═══════════════ */
export function chamDiem(danhMuc, ts, rb, soLuotFree) {
  let kq;
  try {
    kq = tinhToanHeThong(danhMuc, ts, soLuotFree, rb.tyLeChuyenDoi);
  } catch (e) {
    if (e instanceof ViPhamHienPhap) return {
      tong: -PHAT_VI_PHAM * 10, datMucTieuLoiNhuan: false,
      loiNhuanSauThue: -Infinity, soGiaDinhPhucVu: 0, giaTrungBinh: 0,
      hopLe: false, phamHienPhap: true, viPham: [{ ma: 'HP', vi: e.message }] };
    throw e;
  }

  const kiem = kiemRangBuoc(danhMuc, kq, rb);
  const phucVu = kq.soLuotFree + kq.soKhachTraTien;
  const giaTB = danhMuc.filter(g => g.giaNiemYet > 0)
    .reduce((s, g) => s + g.giaNiemYet * (Number(g.tyLeChon) || 0), 0);
  const dat = kq.loiNhuanSauThue >= rb.loiNhuanSauThueToiThieu;

  let tong;
  if (!dat) {
    tong = kq.loiNhuanSauThue;
  } else {
    /* Bậc hai BỎ phần lợi nhuận vượt mục tiêu. Lợi nhuận chỉ còn vai
       trò PHÁ HOÀ ở trọng số rất nhỏ: hai cấu hình y hệt nhau về gia
       đình và giá thì cái lãi hơn thắng. Phá hoà không đổi thứ tự ưu
       tiên — nó tránh cho bộ tối ưu chốt đúng một cấu hình nằm sát
       mép mục tiêu không còn đệm nào. */
    const duOi = kq.loiNhuanSauThue - rb.loiNhuanSauThueToiThieu;
    tong = rb.loiNhuanSauThueToiThieu
      + phucVu * MOI_GIA_DINH
      - giaTB * MOI_DONG_GIA_TB
      + duOi * 1e-6;
  }
  if (!kiem.hopLe) tong -= PHAT_VI_PHAM * kiem.viPham.length;

  return { tong, datMucTieuLoiNhuan: dat, loiNhuanSauThue: kq.loiNhuanSauThue,
    soGiaDinhPhucVu: phucVu, giaTrungBinh: giaTB,
    hopLe: kiem.hopLe, phamCung: kiem.phamCung, viPham: kiem.viPham,
    soNguoiDayCanCo: kiem.soNguoiDayCanCo };
}

/* ═══════════════ V4 · GIẢI QUY MÔ, ĐÃ VÁ ═══════════════

   Phép chia đôi CHỈ đúng khi lợi nhuận tăng theo quy mô. Có gói biên
   gộp âm thì càng đông càng lỗ, và phép chia đôi vẫn trả về một con
   số trông hợp lý — im lặng hoàn toàn.

   Nay kiểm điều kiện trước. Không thoả thì NÓI LÀ KHÔNG GIẢI ĐƯỢC,
   không trả về một con số. */
export function giaiQuyMo(danhMuc, ts, rb) {
  const hi0 = rb.soLuotFreeToiDa;
  let ln0, lnHi, lnGiua;
  try {
    ln0 = tinhToanHeThong(danhMuc, ts, 0, rb.tyLeChuyenDoi).loiNhuanSauThue;
    lnHi = tinhToanHeThong(danhMuc, ts, hi0, rb.tyLeChuyenDoi).loiNhuanSauThue;
    lnGiua = tinhToanHeThong(danhMuc, ts, hi0 / 2, rb.tyLeChuyenDoi).loiNhuanSauThue;
  } catch (e) {
    return { giaiDuoc: false, vi: 'Cấu hình không tính được: ' + e.message };
  }

  /* Ba điểm mẫu phải KHÔNG GIẢM. Không đủ để chứng minh đơn điệu,
     nhưng đủ để bắt cái sai hay gặp nhất: biên gộp âm thì càng đông
     càng lỗ, và ba điểm ấy đi xuống thấy ngay. */
  if (!(lnHi >= lnGiua && lnGiua >= ln0)) return { giaiDuoc: false,
    diem: [ln0, lnGiua, lnHi],
    vi: 'Lợi nhuận KHÔNG tăng theo quy mô, nên phép chia đôi không dùng được ở đây. ' +
      'Thường là vì có gói biên gộp âm: càng đông càng lỗ. Máy KHÔNG trả về một con ' +
      'số — một con số ra từ phép chia đôi sai trông y hệt một con số đúng.' };

  if (lnHi < rb.loiNhuanSauThueToiThieu) return { giaiDuoc: false,
    vi: 'Không đạt mục tiêu lợi nhuận ở MỌI quy mô, kể cả trần ' + hi0 + ' lượt Free.' };

  let lo = 0, hi = hi0;
  for (let i = 0; i < 60; i++) {
    const giua = (lo + hi) / 2;
    const r = tinhToanHeThong(danhMuc, ts, giua, rb.tyLeChuyenDoi);
    if (r.loiNhuanSauThue < rb.loiNhuanSauThueToiThieu) lo = giua; else hi = giua;
  }
  return { giaiDuoc: true, soLuotFree: Math.ceil(hi) };
}

/* ═══════════════ LEO ĐỒI THEO TOẠ ĐỘ ═══════════════ */
const BUOC_GIA = [0.80, 0.90, 0.95, 1.05, 1.10, 1.25];
const BUOC_BUOI = [-4, -2, -1, 1, 2, 4];
const BUOC_QUYMO = {
  NHOM: [12, 15, 18, 20, 24], NHOM_NHO: [4, 5, 6, 8],
  NHOM_LON: [20, 25, 30, 40], HOI_THAO: [60, 80, 100, 150]
};

function sao(dm) {
  return dm.map(g => Object.assign({}, g, { buoi: (g.buoi || []).map(b => Object.assign({}, b)) }));
}

export function toiUuHoa(danhMucGoc, tsGoc, rb, soVongToiDa) {
  rb = rb || RANG_BUOC_MAC_DINH;
  soVongToiDa = soVongToiDa || 12;
  kiemHienPhap(danhMucGoc, tsGoc);
  const kt = kiemThamSo(tsGoc);
  if (!kt.du) return { ok: false, code: 'THIEUCHIPHI', thieu: kt.thieu, error: kt.vi };

  let dm = sao(danhMucGoc);
  let ts = Object.assign({}, tsGoc, { quyMoNhom: Object.assign({}, tsGoc.quyMoNhom) });
  const g0 = giaiQuyMo(dm, ts, rb);
  if (!g0.giaiDuoc) return { ok: false, code: 'KHONGGIAIDUOC', error: g0.vi, diem: g0.diem };

  let free = g0.soLuotFree;
  let tot = chamDiem(dm, ts, rb, free);
  const thayDoi = [];
  let vong = 0;

  /* Ngưỡng cải thiện tính THEO TỶ LỆ. Tệp gốc dùng `+1` tuyệt đối, mà
     điểm số ở thang tỷ đồng thì một đơn vị nằm dưới cả sai số dấu
     phẩy động — cái chặn ấy không chặn gì. */
  const hon = (a, b) => a > b + Math.max(1, Math.abs(b) * 1e-9);

  const thu = (dmMoi, tsMoi, mota) => {
    const g = giaiQuyMo(dmMoi, tsMoi, rb);
    if (!g.giaiDuoc) return false;
    let d;
    try { d = chamDiem(dmMoi, tsMoi, rb, g.soLuotFree); } catch (e) { return false; }
    /* Cấu hình phạm ràng buộc CỨNG thì không nhận, dù điểm có đẹp tới
       đâu — nó là cấu hình không tồn tại, không phải cấu hình kém. */
    if (d.phamCung) return false;
    if (!hon(d.tong, tot.tong)) return false;
    dm = dmMoi; ts = tsMoi; free = g.soLuotFree; tot = d; thayDoi.push(mota);
    return true;
  };

  for (; vong < soVongToiDa; vong++) {
    let caiThien = false;

    for (const loai of Object.keys(BUOC_QUYMO)) {
      for (const qm of BUOC_QUYMO[loai]) {
        if (qm === ts.quyMoNhom[loai]) continue;
        const tsMoi = Object.assign({}, ts,
          { quyMoNhom: Object.assign({}, ts.quyMoNhom, { [loai]: qm }) });
        if (thu(dm, tsMoi, 'Quy mô ' + loai + ': ' + ts.quyMoNhom[loai] + ' → ' + qm))
          caiThien = true;
      }
    }

    for (let i = 0; i < dm.length; i++) {
      if (dm[i].giaNiemYet === 0) continue;
      for (const he of BUOC_GIA) {
        /* lamTron, KHÔNG giaDep. Giá "đuôi 9" chạy một lần lúc trình
           ra; chạy ở đây thì nó hạ giá mỗi vòng không phải vì điểm. */
        const giaMoi = lamTron(dm[i].giaNiemYet * he);
        if (giaMoi === dm[i].giaNiemYet || giaMoi <= 0) continue;
        const dmMoi = sao(dm); dmMoi[i].giaNiemYet = giaMoi;
        if (thu(dmMoi, ts, 'Giá ' + dm[i].ma + ': ' + dm[i].giaNiemYet + ' → ' + giaMoi))
          caiThien = true;
      }
    }

    for (let i = 0; i < dm.length; i++) {
      for (let j = 0; j < (dm[i].buoi || []).length; j++) {
        for (const d of BUOC_BUOI) {
          const moi = dm[i].buoi[j].soBuoi + d;
          if (moi < 0 || moi > 60) continue;
          const dmMoi = sao(dm); dmMoi[i].buoi[j].soBuoi = moi;
          if (thu(dmMoi, ts, 'Buổi ' + dm[i].ma + '/' + dm[i].buoi[j].loai + ': ' +
            dm[i].buoi[j].soBuoi + ' → ' + moi)) caiThien = true;
        }
      }
    }

    if (!caiThien) break;
  }

  /* CẤU HÌNH HẠT GIỐNG cũng phải kiểm ràng buộc CỨNG (9.99.114) — thu()
     từ chối MỌI hàng xóm phạm cứng, nhưng hạt giống ban đầu KHÔNG ai soi
     lại; khi không hàng xóm nào cải thiện thì hạt giống được trả về nguyên.
     Tổ thanh tra $500M: với soNguoiDayToiDa nhỏ, toiUuHoa trả ok:true cho
     một kế hoạch cần 12 người dạy (phamCung=true). "Cấu hình KHÔNG TỒN TẠI,
     không phải cấu hình kém điểm" — một công cụ định giá trình ra một kế
     hoạch không tuyển nổi người là nói dối. Nói KHÔNG GIẢI ĐƯỢC, không trả. */
  if (tot.phamCung) return { ok: false, code: 'PHAMCUNG', diem: tot,
    error: 'Không tìm được cấu hình thoả ràng buộc CỨNG (ví dụ: vượt trần người ' +
      'dạy). Đây là cấu hình KHÔNG TỒN TẠI, không phải cấu hình kém điểm — nới ' +
      'ràng buộc cứng hoặc đổi khung gói.' };

  /* Giá "đuôi 9" áp ĐÚNG MỘT LẦN, ở đây, lúc trình ra. */
  const dmTrinh = sao(dm).map(g =>
    Object.assign({}, g, { giaNiemYet: g.giaNiemYet > 0 ? giaDep(g.giaNiemYet) : 0 }));

  return { ok: true, danhMucToiUu: dm, danhMucTrinh: dmTrinh, thamSoToiUu: ts,
    soLuotFree: free, diem: tot,
    ketQua: tinhToanHeThong(dm, ts, free, rb.tyLeChuyenDoi),
    soVongLap: vong + 1, thayDoi };
}

/* ═══════════════ ĐỘ NHẠY — THAM SỐ NÀO ĐÁNG LO NHẤT ═══════════════ */
export function phanTichDoNhay(dm, ts, rb, free) {
  const goc = tinhToanHeThong(dm, ts, free, rb.tyLeChuyenDoi).loiNhuanSauThue;
  const ra = [];
  const dat = (ten, gtGoc, bien) => {
    for (const he of [0.8, 1.2]) {
      const b = bien(he);
      const r = tinhToanHeThong(dm, b.ts, free, b.tl === undefined ? rb.tyLeChuyenDoi : b.tl);
      ra.push({ thamSo: ten, giaTriGoc: gtGoc, lech: he < 1 ? '−20%' : '+20%',
        loiNhuanSauThue: r.loiNhuanSauThue,
        thayDoiPhanTram: goc !== 0 ? (r.loiNhuanSauThue - goc) / Math.abs(goc) : 0 });
    }
  };

  dat('Tỷ lệ chuyển đổi', rb.tyLeChuyenDoi, he => ({ ts, tl: rb.tyLeChuyenDoi * he }));
  dat('Tỷ lệ lấp đầy nhóm', ts.tyLeLapDay,
    he => ({ ts: Object.assign({}, ts, { tyLeLapDay: Math.min(1, ts.tyLeLapDay * he) }) }));
  dat('Kho bài giảng mỗi năm', ts.khoBaiGiangMoiNam,
    he => ({ ts: Object.assign({}, ts, { khoBaiGiangMoiNam: ts.khoBaiGiangMoiNam * he }) }));
  dat('Quản lý và tiếp thị', ts.quanLyVaTiepThi,
    he => ({ ts: Object.assign({}, ts, { quanLyVaTiepThi: ts.quanLyVaTiepThi * he }) }));
  Object.keys(ts.donGiaBuoi || {}).forEach(loai => {
    dat('Đơn giá buổi ' + loai, ts.donGiaBuoi[loai], he => ({
      ts: Object.assign({}, ts,
        { donGiaBuoi: Object.assign({}, ts.donGiaBuoi, { [loai]: ts.donGiaBuoi[loai] * he }) }) }));
  });

  return ra.sort((a, b) => Math.abs(b.thayDoiPhanTram) - Math.abs(a.thayDoiPhanTram));
}

/* ═══════════════ CỬA MÁY CHỦ ═══════════════ */
function duocVaoTU(hoSo) {
  return /^R(0[1-3])$/.test(String((hoSo || {}).role || ''));
}

export async function toiUuGoi(y, env, db, hoSo) {
  if (!duocVaoTU(hoSo)) return { ok: false, code: 'NOPERM',
    error: 'Bộ tối ưu cấu hình gói mở cho R01–R03.' };
  const x = y || {};
  if (!Array.isArray(x.danhMuc) || !x.danhMuc.length) return { ok: false,
    error: 'Thiếu danh mục gói.' };
  const rb = Object.assign({}, RANG_BUOC_MAC_DINH, x.rangBuoc || {});
  try {
    return toiUuHoa(x.danhMuc, x.thamSo || {}, rb, x.soVong);
  } catch (e) {
    if (e instanceof ViPhamHienPhap) return { ok: false, code: 'HIENPHAP',
      error: e.message };
    throw e;
  }
}
