/* ═══════════════ NHẬT KÝ TOÀN HỆ — MỘT CHỖ SUPER ADMIN THẤY MỌI THAO TÁC ═══════════════
   Chủ hệ: "Mọi thứ đều có thể nhìn thấy, đều có thể đo, đều có thể kiểm
   soát với vai trò của Super Admin và Admin hệ thống."

   Sổ `audit` được 39 mô-đun cùng ghi (một cửa `Kho.ghiNhatKy`), nhưng
   tới 9.99.235 KHÔNG có cửa nào đọc TOÀN BỘ — mỗi nơi chỉ đọc một lát cắt
   riêng (CRM đọc việc CRM_*, cứu hệ đọc theo người…), và màn "Nhật ký hệ
   thống" trên máy khách đọc một MẢNG DEMO `G.AUDIT`, không phải sổ thật.
   Đó đúng là "làm màu, không gắn kết" mà chủ hệ cấm.

   Cửa này đọc SỔ THẬT, lọc được theo nhóm · người · đối tượng · khoảng
   ngày, phân trang, kèm tóm tắt đếm theo nhóm. Chỉ R01–R02 — sổ nhật ký
   là chỗ đọc được mọi thao tác của mọi người, nên nó là quyền quản trị
   cao nhất, không cấp lẻ.

   KHÔNG dựng sổ thứ hai (luật kho: một nguồn). Cửa này chỉ ĐỌC `audit`. */

const BAC = {R01:1, R02:2, R03:3, R04:4, R05:5, R06:6, R07:7, R08:8,
             R09:9, R10:10, R11:11, R12:12, R13:13, R14:14, R15:15};

/* Phân nhóm việc để LỌC và ĐẾM — dò theo CỤM trong tên việc, khai tường
   minh. Đây là công cụ ĐỌC (xem sổ), không phải cổng chặn: một việc không
   khớp nhóm nào rơi về "khác" và VẪN hiện đủ (tên việc thật luôn in ra),
   nên không giấu dòng nào — khác hẳn một bộ dò cổng, nơi bỏ sót là lọt. */
const NHOM = [
  {ma: 'tien',      ten: 'Dòng tiền',
   /* Cụm giá dùng 'BG_'/'DOIGIA' (bang-gia ghi 'BG_DOIGIA'), KHÔNG dùng bare
      'GIA' — 'GIA' bắt nhầm 'GIAMSAT' (thuộc nhóm quyền). Chọn dấu hiệu chính
      xác hơn dùng danh sách trừ (luật 9.99.56). Các cụm còn lại đã kiểm
      không giao với nhóm khác. */
   cum: ['CHI', 'PHIEUTHU', 'HOAN', 'HOAHONG', 'LUONG', 'BG_', 'DOIGIA', 'NGANHANG', 'NH_TIEN',
         'BUTTOAN', 'HOADON', 'TOKHAI', 'MIENGIAM', 'NHACTHU', 'DOISOAT', 'CHOTKET', 'KY_']},
  {ma: 'quyen',     ten: 'Cấp · thu quyền',
   cum: ['QUYEN', 'LENHGIAMSAT', 'GIAMSAT', 'BACUA', 'AIQ', 'SODEN', 'PHANQUYEN']},
  {ma: 'chatluong', ten: 'Chất lượng · chăm sóc',
   cum: ['VH_', 'VM_', 'CK_', 'CRM', 'CHAM', 'THEVUNGMANH', 'COACH', 'THT_', 'DUYETTL', 'KIEMDUYET']},
  {ma: 'hethong',   ten: 'Hệ thống · quản trị',
   cum: ['DANG_NHAP', 'DANGNHAP', 'MATKHAU', 'TAIKHOAN', 'THANHTRA', 'CUUHE', 'CUU_',
         'DANGKY', 'KICHHOAT', 'XOA', 'KHOA', 'DONGBO', 'BONAO', 'DP_', 'TNC']}
];

function nhomCuaViec(viec) {
  const v = String(viec || '').toUpperCase();
  for (const n of NHOM) if (n.cum.some(c => v.indexOf(c) >= 0)) return n.ma;
  return 'khac';
}

/* Đọc toàn sổ, lọc + phân trang + tóm tắt theo nhóm. Chỉ R01–R02. */
export async function docNhatKyToanHe(y, env, db, hoSo) {
  if ((BAC[hoSo.role] || 99) > 2)
    return {ok: false, code: 'NOPERM',
      error: 'Chỉ Super Admin và Admin hệ thống đọc được nhật ký toàn hệ.'};

  const d = y || {};
  const dk = [];          /* mệnh đề WHERE */
  const th = [];          /* tham số bind */

  /* Cụm có dấu gạch dưới ('KY_', 'NH_', 'VH_'…) — mà '_' là KÝ TỰ ĐẠI DIỆN
     của SQL LIKE (khớp một ký tự bất kỳ). Không thoát thì SQL khớp RỘNG hơn
     phép indexOf của nhomCuaViec, và bảng trả về dòng mà nhóm tính lại ra
     khác — bộ lọc nói dối. Thoát '_' và '%' rồi LIKE ... ESCAPE để SQL khớp
     ĐÚNG NHƯ chuỗi con, khớp khít với nhomCuaViec. */
  const escLike = c => c.toUpperCase().replace(/[\\%_]/g, '\\$&');

  /* Lọc theo NHÓM: dựng điều kiện từ chính bảng cụm, không gõ tay lần hai. */
  const nhom = String(d.nhom || '').trim();
  if (nhom && nhom !== 'tatca') {
    if (nhom === 'khac') {
      /* "khác" = không rơi vào cụm nào của mọi nhóm đã khai. */
      const moiCum = NHOM.reduce((a, n) => a.concat(n.cum), []);
      moiCum.forEach(c => { dk.push("UPPER(viec) NOT LIKE ? ESCAPE '\\'"); th.push('%' + escLike(c) + '%'); });
    } else {
      const n = NHOM.find(x => x.ma === nhom);
      if (n) {
        dk.push('(' + n.cum.map(() => "UPPER(viec) LIKE ? ESCAPE '\\'").join(' OR ') + ')');
        n.cum.forEach(c => th.push('%' + escLike(c) + '%'));
      }
    }
  }

  const viec = String(d.viec || '').trim();
  if (viec) { dk.push('viec = ?'); th.push(viec); }

  const nguoi = String(d.nguoi || '').trim().toLowerCase();
  if (nguoi) { dk.push('LOWER(username) LIKE ?'); th.push('%' + nguoi + '%'); }

  const doiTuong = String(d.doiTuong || '').trim();
  if (doiTuong) { dk.push('doiTuong LIKE ?'); th.push('%' + doiTuong + '%'); }

  const tuNgay = String(d.tuNgay || '').trim();
  if (tuNgay) { dk.push('luc >= ?'); th.push(tuNgay); }
  const denNgay = String(d.denNgay || '').trim();
  if (denNgay) { dk.push('luc <= ?'); th.push(denNgay + '￿'); }   /* tới hết ngày */

  const where = dk.length ? (' WHERE ' + dk.join(' AND ')) : '';

  /* Tổng theo bộ lọc hiện tại. */
  const tongR = await db.prepare('SELECT COUNT(*) n FROM audit' + where).bind(...th).first();
  const tong = (tongR && tongR.n) || 0;

  /* Phân trang. */
  const coMoi = Math.min(Math.max(Number(d.coMoi) || 60, 10), 200);
  const trang = Math.max(Number(d.trang) || 1, 1);
  const bo = (trang - 1) * coMoi;
  const soTrang = Math.max(Math.ceil(tong / coMoi), 1);

  const rs = await db.prepare(
    'SELECT luc, uid, username, viec, doiTuong, chiTiet FROM audit' + where +
    ' ORDER BY luc DESC, rowid DESC LIMIT ? OFFSET ?'
  ).bind(...th, coMoi, bo).all();
  const ds = (rs.results || []).map(r => ({
    luc: r.luc, username: r.username || '', viec: r.viec || '',
    doiTuong: r.doiTuong || '', chiTiet: r.chiTiet || '', nhom: nhomCuaViec(r.viec)
  }));

  /* Tóm tắt ĐẾM theo nhóm — trên TOÀN sổ (không theo bộ lọc), để luôn
     thấy bức tranh chung. Đếm bằng GROUP BY viec rồi gộp về nhóm ở JS:
     một con số đếm THẬT từ sổ, không phải số khai. */
  const gr = await db.prepare('SELECT viec, COUNT(*) n FROM audit GROUP BY viec').all();
  const dem = {tien: 0, quyen: 0, chatluong: 0, hethong: 0, khac: 0};
  let tongAll = 0;
  (gr.results || []).forEach(r => { const m = nhomCuaViec(r.viec); dem[m] += r.n; tongAll += r.n; });
  const tomTat = NHOM.map(n => ({ma: n.ma, ten: n.ten, n: dem[n.ma]}))
    .concat([{ma: 'khac', ten: 'Khác', n: dem.khac}]);

  return {ok: true, ds, tong, tongAll, trang, soTrang, coMoi,
    tomTat, nhomCoThe: NHOM.map(n => ({ma: n.ma, ten: n.ten})),
    loc: {nhom: nhom || 'tatca', viec, nguoi, doiTuong, tuNgay, denNgay}};
}
