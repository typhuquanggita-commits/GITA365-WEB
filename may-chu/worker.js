/* ═══════════════════════════════════════════════════════════════
   GITA 365 · CỬA VÀO MỚI — BỘ ĐỊNH TUYẾN

   Cloudflare Worker. Giữ NGUYÊN bề mặt mà máy khách đang gọi: POST một
   khối JSON có trường fn, nhận về một khối JSON. Máy khách không phải
   sửa một dòng nào — đổi mỗi địa chỉ ở G.API_CAP_PHEP.

   Giữ nguyên bề mặt là điều kiện để CHUYỂN DẦN: hai máy chủ cùng chạy
   một thời gian, đổi địa chỉ là đổi nền, và đổi ngược lại được ngay
   trong một phút nếu có chuyện. Đổi bề mặt cùng lúc với đổi nền thì
   lúc hỏng không ai biết hỏng vì nền hay vì bề mặt.

   ── PHẦN NÀY ĐÃ PORT TỚI ĐÂU ──

   Xong: đăng nhập · đăng xuất · kiểm phiên · đổi mật khẩu · cấp khoá
   kho · trạng thái máy chủ · đồng bộ hồ sơ và cài đặt · đăng ký, mã xác
   nhận qua email, kích hoạt · quên và đặt lại mật khẩu · quyền xem hồ
   sơ khách · nâng tầng · chứng cứ hoa hồng · TỆP KHÁCH HÀNG CHUẨN ·
   TÀI CHÍNH đầy đủ — kỳ thu, phiếu thu, công nợ, bản kê, huỷ phiếu,
   hoàn tiền, trả hoa hồng, đóng kỳ, danh sách quá hạn, đối soát.

   Chưa: tài liệu, sổ cộng đồng, tình huống khách, xuất Sheet.

   CHƯA PORT THÌ BÁO TO, KHÔNG IM. Danh sách CHUA_PORT ở dưới trả về
   đúng một câu nói rõ việc ấy chưa có ở nền mới. Trả 'Yêu cầu không
   hợp lệ' cho một việc CÓ THẬT ở nền cũ là cách chắc nhất để một lỗi
   chuyển nền bị đọc thành lỗi máy khách, và người đi tìm sẽ tìm nhầm
   chỗ suốt buổi.
   ═══════════════════════════════════════════════════════════════ */

import { Kho, kiemPhien, kiemMatKhau, bamMoi, muoiMoi, soSanhAnToan, kiemMkMoi } from './nen.js';
import { dongBo, quetSaoLuuMoCoi } from './dong-bo.js';
import { veChiPhi, maYeuCau } from './ve-chi-phi.js';
import { guiLienHe } from './lien-he.js';
import { ghiLuotTrang, docDoTrang, DON_DO_TRANG } from './do-trang.js';
import { chanKhoang, ghiLoiKhoang, ghiTotKhoang, dsKhoang, datKhoang } from './khoang.js';
import { tuSoatVaChua, sucKhoeHe } from './tu-chua.js';
import { dangKy, guiLaiOtp, xacThucOtp, kichHoat } from './dang-ky.js';
import { quenMatKhau, datLaiMatKhau } from './mat-khau.js';
import { capQuyenXem, thuHoiQuyenXem, soiQuyenXem, xemKhachCao, nangTang } from './quyen-xem.js';
import { capQuyenT5Pro, thuHoiQuyenT5Pro, dsQuyenT5Pro, quyenT5ProDangHieuLuc } from './quyen-t5pro.js';
import { xemThongTinThanhToan, capNhatThongTinThanhToan } from './tai-khoan-nhan.js';
import { kyChungCu, xacNhanChungCu, soiChungCu } from './chung-cu.js';
import { xemTepKhach, suaTepKhach, dsTepKhach } from './ho-so-khach.js';
import { ghiPhieuThu, duyetPhieuThu, congNo, banKeTaiChinh,
  huyPhieuThu, ganPhieuVaoKy, deXuatHoan, duyetHoan, traHoaHong,
  ganChungCuHoaHong, dongKyChuaToi, dsQuaHan, doiSoat,
  deXuatMienGiam, duyetMienGiam, dsMienGiam,
  ghiNhacThu, lichSuNhacThu, denHenChuaTra } from './tai-chinh.js';
import { soNgay, chotTuan, soatChot, tongHop, baoCaoKeToan, boSoKhaiThue,
  dsChot } from './bao-cao.js';
import { tongNgayDoanhThu } from './bao-doanh-thu.js';
import { thuGuiThu } from './thu.js';
import { phucVuTaiNguyen } from './tai-nguyen.js';
import { quayKhopMoi, quayChuyenDong, quayVideoDong, taoNhanVatAI, quayXem, quayXoa, quayGiongNoi, quayPhimMoi, xuLyMayQuay, phucVuPhimQuay, donQuay } from './xuong-quay.js';
import { dongGoiPhanTu, xemPhanTu, phucVuPhimPhanTu } from './phim-phan-tu.js';
import { chamKpiTaiChinh } from './kpi-tai-chinh.js';
import { dangTinTaiChinh, bangTinTaiChinh,
  xuLyTinTaiChinh } from './tin-tai-chinh.js';
import { hoiTroLyTaiChinh } from './tro-ly-tai-chinh.js';
import { datHeSoLuong, dsHeSoLuong, bangLuong, chotLuong,
  doiSoatLuong } from './luong.js';
import { deXuatThiGiac, chuyenBacThiGiac, banMoiThiGiac, chamThiGiac,
  ghiLuatThuongHieu, khoThiGiac, docTaiLieuThiGiac, docNoiDungThiGiac,
  guiDeBaiRaNgoai, xuatTamThiGiac, ghiChuThayAnh, docAnhThiGiac,
  soDiRa,
  docDieuNho, docYTuong, docGopY,
  dangTamThiGiac, goTamThiGiac, soDangBai,
  doPheuThiGiac, doiMotTam, khaiSoKenhNgoai } from './kien-truc-thi-giac.js';
import { soatBoNao, soatAnDanh } from './bo-nao.js';
import { lapTheVungManh, docTheVungManh, loTrinhTuThe, soatVungManh } from './vung-manh.js';
import { traLoiCoach, soatBanTra } from './coach-kh.js';
import { soatTiepThi, soatBayNhanh } from './noi-dung-tiep-thi.js';
import { lapSongSinh, docSongSinh, ghiCham, doSoCham } from './van-hanh-cham-soc.js';
import { bayConSoCEO, soatLuatTaiChinh, dangOKichBan } from './tai-chinh-ceo.js';
import { toiUuGoi } from './toi-uu-goi.js';
import { docBaCua, ghiCua, lapBaCua, soatBaiTuan } from './con-nguoi.js';
import { docTuanThu, ghiDongY, docDongY, yeuCauXoaDuLieu, danhDauXoa,
  soXoaDuLieu, docVungLuatSu, xuatDuLieuNha } from './phap-ly-rui-ro.js';
import { docBangDieuKhien, banTinSang, chonBaNhaNgauNhien, soiQuyetDinh,
  ghiQuyetDinh, chuanBiVang } from './he-dieu-hanh.js';
import { ghiLuotPrompt, docVongChay } from './bo-prompt.js';
import { docBangGia, doiGia, soDoiGia } from './bang-gia.js';
import { viCredit, soCreditNha, thuongCredit, tieuCredit, napCreditPhieu, dsPhieuThuChuaNap,
  datViCredit, dieuChinhCredit, tongQuanCredit } from './credit.js';
import { guiSoDoKH, guiDanhGiaKH, hoSoDoLuongKH, xepHangKH, baoCaoThangHe, chotBaoCaoThang,
  dsHoSoThang } from './do-luong-kh.js';
import { docTrungTamDo, lichSuTrungTamDo, goiYPhanBo, taoKeHoachToiUu, capNhatKeHoachToiUu,
  dsKeHoachToiUu } from './trung-tam-toi-uu.js';
import { docChienLuocV20, dsMucTieuCL, taoMucTieuCL, capNhatMucTieuCL } from './chien-luoc-v20.js';
import { ghiApDung, docApDung, tongApDung } from './ap-dung.js';
import { ghiSoatMan, layBaoCaoSoat } from './soat-man.js';
import { soatLuocDo, vaLuocDo } from './va-luoc-do.js';
import { CRON_NHIP, nhipVanHanh, kichHoatKhachMoi, docBoNao, chayThuBoNao } from './bo-nao-van-hanh.js';
import { docLuatGiaoDien } from './luat-giao-dien.js';
import { capLenhGiamSat, thuLenhGiamSat, docLenhGiamSat, soatSoDen,
  docTranGiamSat } from './giam-sat.js';
import { ghiHoChieuVideo } from './studio.js';
import { tuSoatBaoDong, CUA_NHAY } from './cuu-he.js';
import { baoDongCuuHe, dongBangHe, moBangHe, truyHoiHe, soatCuuHe, dangBang,
  AN_TOAN_KHI_BANG } from './cuu-he.js';
import { docHomNay, tickNhip, boViecHomNay, batCheDoBao, ghiGhimCon, docGhimCon,
  datDongYAnhCon, chiaSeCoAnhCon } from './hom-nay.js';
import { deXuatNangCap, soiLuatNangCap, kyNangCap, mocChayThu, batNangCap,
  docVongNangCap, docTranNangCap, thuXepCap } from './tu-nang-cap.js';
import { ghiPhatSinh, soanBanNhap, duyetCap, nhapKho, traBoSung,
  soatTuHoanThien } from './tu-hoan-thien.js';
import { capQuyenAI, thuHoiQuyenAI, soatQuyenAI, aiPhanLoai, aiSoanNhap,
  soanDeBaiNgoai, aiTongHopGiamSat } from './quyen-nang-ai.js';
import { phimGuiViec, phimXemViec, phimTinhHuong } from './phim-ai.js';
import { phimMienPhi, phimTrangThaiDu } from './phim-0d.js';
import { hoiDaTri, hoiDongDaTri, chamDaTri, soDaTri, luuGiaiPhap, duyetGiaiPhap, dsGiaiPhap, boSungGiaiPhap,
  canhMauDaTri, canhMauTuDong, thuMauDaTri, vongKhoaHocTuDong, docVongKhoaHoc,
  taoTuyenDaTri, datTuChayTuyen, chayChangDaTri, docTuyenDaTri,
  chotChangDaTri, docDoiAgent, ghiBoNhoAgent, batBoNhoAgent, doiSangDoiAgent } from './bo-nao-da-tri.js';
import { lapDeAnTaiLieu, chayBuocTaiLieu, docDeAnTaiLieu, datTuChayTaiLieu, lapKeHoachKho } from './xuong-tai-lieu.js';
import { docViecKet } from './viec-ket.js';
import { troLyV50, guiThongDiepBoNao, docThongDiepBoNao } from './tro-ly-v50.js';
import { ghiNhatKyGiaiPhap, docNhatKyGiaiPhap, soanMucGiaiPhap, napKhoVanDe, dsKhoVanDe, docKhoVanDe } from './tra-cuu-giai-phap.js';
import { lapDuAnPhim, docXuongPhimNganSach, datCanhTraPhi, moLaiDuAnPhim, DON_GIU_CHO } from './phim-ngan-sach.js';
import { docKpiCayTien } from './cay-tien.js';
import { docDongChay } from './dong-chay.js';
import { trangThaiCongKhai } from './trang-thai.js';
import { dieuPhoiTroLy, soatDieuPhoi, tuHoanThienTroLy, soatHoatDongAgent } from './dieu-phoi.js';
import { soatKhungVanHanh, chamMotLuot } from './khung-van-hanh.js';
import { lapKeHoachAgent, chayBuocAgent, dsWorkflowAgent } from './agent-team.js';
import { dsPhongBan, chiTietPhongBan, ganPhongBan, baoCaoKpiPhongBan } from './phong-ban.js';
import { taoTaiKhoanNoiBo, capNhatTaiKhoan, dsTaiKhoan, offboardTaiKhoan,
  adminKhoiPhucMatKhau } from './quan-ly-tai-khoan.js';
import { doSucChua } from './suc-chua-toc-do.js';
import { kiemBanMoi, docTinCongDong, ghiTinCongDong, guiChuyen,
  napTaiLieu, duyetTaiLieu, napTinhHuongKhach } from './cong-dong.js';
import { luuNhanVat, docNhanVat } from './nhan-vat.js';
import { xoaTroLy, xoaThanhTra, ghiBaoCaoThanhTra, docBaoCaoThanhTra } from './thanh-tra.js';
import { soatNoiDung, mauBaiHoc, napBai, nopBai, kyBai, soKyBai, baiTreo,
  capQuyenNoiDung, thuHoiQuyenNoiDung, dsQuyenNoiDung,
  docBuoi, xuatChuanNghe, soatMienDich,
  chotTrichNghe, dsChotTrich } from './kien-truc-noi-dung.js';
import { nganHangBao, nhapGiaoDichTay, doiChieuNganHang, khopGiaoDich,
  hopThongBao, danhDauDaDoc } from './ngan-hang.js';
import { ghiChi, duyetChi, huyChi, soChi, chotKet, dsChotKet,
  xemThangDuyetChi, baoCaoChi, tongHopChi,
  capQuyenTaiChinh, thuHoiQuyenTaiChinh, dsQuyenTaiChinh, quyenCua as quyenTaiChinhCua } from './chi-tieu.js';
import { capQuyenCRM, thuHoiQuyenCRM, dsQuyenCRM, crmDanhSach, crmChiTiet,
  crmBangDieuKhien, crmUuTien, crmGhiKhach, crmQuanTri,
  crmGhiCoHoi, crmCoHoi, mucCrmCua } from './crm.js';
import { tinhReadyVip, deXuatChamSocVip, dsVipCanCham } from './vip-care.js';
import { lich365Ngay, sinhNoiDungKenh, duBaoLead, dsKenhVeTinh } from './satellite-engine.js';
import { dangKyKhoaMatBatDau, dangKyKhoaMatXong, dangNhapMatBatDau,
  xacThucDangNhapMat, dsKhoaMat, xoaKhoaMat,
  xacThucLaiMatBatDau, xacThucLaiMat, nhatKyAnToan, congBuocMat } from './sinh-trac.js';
import { crmTroLy, crmDieuPhoiAI } from './crm-ai.js';
import { crmKpiCham, crmKpiTroLy } from './crm-kpi.js';
import { crmPhanTichKhach, crmUuTienNangCao } from './crm-chuyen-sau.js';
import { loTrinhCaNhan, khoaNoiDungTheoTang } from './lo-trinh-ca-nhan-hoa.js';
import { hoiChatbot, lichSuChat } from './chatbot-thong-minh.js';
import { guiBaoCaoNgay, tongHopBaoCao, dsBaoCaoNgay } from './bao-cao-hang-ngay.js';
import { docNhatKyToanHe } from './nhat-ky.js';
import { ghiButToan, docSoKeToan, ghiHoaDon, docHoaDon, ghiSoHoaDon,
  ghiToKhai, docToKhai, docBuongLaiKT, docBaoCaoTC,
  docCanDoiPhatSinh, docCanDoiKeToan, docDoiChieuGTGT,
  docLuuChuyenTien, docCongNoTuoi } from './ke-toan.js';

const HAN_PHIEN_GIO      = 12;
const HAN_KHOA_GIO       = 12;
const TRAN_XIN_KHOA_GIO  = 12;
const TRAN_SAI_MK        = 8;      /* lượt sai liên tiếp trước khi khoá */
const GIAY_KHOA_SAI      = 15 * 60;

/* ═══════════════ BỐN TUYẾN ═══════════════
   BẢN CHÉP của G.TUYEN trong src/data.tuyen.js, y như server/GITA_CapPhep.gs
   vẫn chép. Bộ kiểm phát hành (mục 36) đối chiếu các bản này mỗi lần chạy
   và dừng phát hành nếu lệch. */
const TUYEN = [
  { ma: 'GITA365',   trangThai: 'chay',  goiCu: true },
  { ma: 'ENGWIN365', trangThai: 'chuan', goiCu: false },
  { ma: 'MATH365',   trangThai: 'chuan', goiCu: false },
  { ma: 'SAT365',    trangThai: 'chuan', goiCu: false },
  { ma: 'HSA365',    trangThai: 'chuan', goiCu: false }
];
const SO_TANG = 5;

/* Bậc vai — bản chép của G.ROLES. Càng nhỏ càng nhiều quyền. */
import { BAC } from './vai-tro.js';
const tuyen_   = ma => TUYEN.find(t => t.ma === ma) || null;
const goiNghe_ = ma => { const t = tuyen_(ma); return t ? (t.goiCu ? 'nghe' : ma.toLowerCase() + '-nghe') : ''; };
const goiNgheCao_ = ma => { const t = tuyen_(ma); return t ? (t.goiCu ? 'nghe-cao' : ma.toLowerCase() + '-nghe-cao') : ''; };
const goiTang_ = (ma, tang) => {
  const t = tuyen_(ma);
  if (!t || !(tang >= 1 && tang <= SO_TANG)) return '';
  return t.goiCu ? 'tang' + tang : ma.toLowerCase() + '-t' + tang;
};

/* Tuyến của một tài khoản. Ô trống nghĩa là GITA365 — nhờ vậy mọi tài
   khoản có trước v7.8 giữ nguyên phạm vi cũ mà không phải điền gì.
   Chỉ tuyến ĐANG CHẠY mới được cấp; tuyến đang dựng chuẩn chưa có khoá. */
function tuyenCuaTK_(hoSo) {
  const tho = String((hoSo && hoSo.tuyen) || '').trim();
  if (!tho) return tuyen_('GITA365').trangThai === 'chay' ? ['GITA365'] : [];
  const ra = [];
  for (const x of tho.split(/[,;\s]+/)) {
    const t = tuyen_(String(x).toUpperCase());
    if (t && t.trangThai === 'chay' && ra.indexOf(t.ma) < 0) ra.push(t.ma);
  }
  return ra;
}

/** Phạm vi cấp phép — port nguyên văn gitaPhamViCapPhep của nền cũ.
    Đây là chỗ KHÔNG được viết lại cho gọn: mỗi dòng ở đây là một quyết
    định của chủ hệ về ai thấy được dữ liệu của ai, và "gọn hơn" ở đây
    nghĩa là "khác đi ở một chỗ nào đó không ai nhìn ra". */
export function phamViCapPhep(hoSo) {
  const ds = ['nen'];                       /* mọi tài khoản đã đăng nhập */

  /* VAI KHÔNG CÓ TRONG BẢNG THÌ DỪNG Ở PHẦN NỀN.

     Nền cũ viết  ROLES[hoSo.role] || {lv: 99}  rồi để rơi tiếp xuống
     nhánh khách hàng — nên một vai lạ vẫn nhận gói theo TẦNG của hồ sơ
     học viên gắn với tài khoản ấy. Hỏng theo hướng an toàn (không có
     gói nghề, không có nghề cao), nhưng nó là RƠI QUA chứ không phải
     một quyết định, và chỗ rơi qua thì không ai đọc ra được ý định.

     Chủ hệ đã chốt lối DANH SÁCH TRẮNG ở bản 9.46 cho quyền xem hồ sơ
     khách: vai nào không có tên là không được, kể cả vai chưa tồn tại
     hôm nay. Kê danh sách cấm thì mỗi vai mới sinh ra là mặc định nhìn
     thấy, và cái mặc định ấy không ai nhớ đi sửa. Cùng một luật, nên
     cùng một cách viết.

     Siết theo hướng CHẶT HƠN nền cũ, nên hai máy chủ chạy song song
     trong lúc chuyển nền không sinh ra chỗ hở nào. */
  if (!BAC[hoSo.role]) return ds;

  const lv = BAC[hoSo.role];
  const tuyenTK = tuyenCuaTK_(hoSo);

  if (lv <= 12) {
    for (const k of tuyenTK) {
      ds.push(goiNghe_(k));
      if (lv <= 2) ds.push(goiNgheCao_(k));
      for (let i = 1; i <= SO_TANG; i++) ds.push(goiTang_(k, i));
    }
    return gon_(ds);
  }
  if (lv === 15) return ds;                 /* CTV giới thiệu: chỉ phần nền */

  const tang = Number(hoSo.tier || 0);
  if (!(tang >= 1)) return ds;
  for (const k of tuyenTK)
    for (let j = 1; j <= Math.min(SO_TANG, tang); j++) ds.push(goiTang_(k, j));
  return gon_(ds);
}
const gon_ = ds => ds.filter((x, i) => x && ds.indexOf(x) === i);

export function tachKhoaDuocCap(goi, kho) {
  const co = goi.filter(g => Object.prototype.hasOwnProperty.call(kho, g) && kho[g]);
  const thieu = goi.filter(g => !Object.prototype.hasOwnProperty.call(kho, g) || !kho[g]);
  return {co, thieu};
}

/* ═══════════════ VIỆC ═══════════════ */

/* CHUA_PORT đã RỖNG từ 9.99.198–199: bảy cửa còn lại chuyển sang cong-dong.js
   (kiemBanMoi · docTinCongDong · ghiTinCongDong · guiChuyen · napTaiLieu ·
   duyetTaiLieu · napTinhHuongKhach); ba cửa Google-riêng (kiemDrive ·
   xuatSheet · xemKpiKhach) bỏ hẳn vì máy khách không còn gọi. Không còn
   phần nào chạy trên Apps Script. */

const CAN_PHIEN = ['dsKhoang', 'datKhoang', 'sucKhoeHe', 'capKhoa', 'doiMatKhau', 'dongBo', 'thuGuiThu',
  'docTinCongDong', 'ghiTinCongDong', 'guiChuyen', 'napTaiLieu', 'duyetTaiLieu', 'napTinhHuongKhach',
  'capQuyenXem', 'thuHoiQuyenXem', 'soiQuyenXem', 'xemKhachCao', 'nangTang',
  'capQuyenT5Pro', 'thuHoiQuyenT5Pro', 'dsQuyenT5Pro',
  'xemThongTinThanhToan', 'capNhatThongTinThanhToan',
  'kyChungCu', 'xacNhanChungCu', 'soiChungCu',
  'xemTepKhach', 'suaTepKhach', 'dsTepKhach',
  'ghiPhieuThu', 'duyetPhieuThu', 'congNo', 'banKeTaiChinh',
  'huyPhieuThu', 'ganPhieuVaoKy', 'deXuatHoan', 'duyetHoan', 'traHoaHong',
  'ganChungCuHoaHong', 'dongKyChuaToi', 'dsQuaHan', 'doiSoat',
  'soNgay', 'chotTuan', 'soatChot', 'tongHop', 'baoCaoKeToan', 'boSoKhaiThue',
  'dsChot',
  'ghiChi', 'duyetChi', 'huyChi', 'soChi', 'chotKet', 'dsChotKet',
  'xemThangDuyetChi', 'baoCaoChi', 'tongHopChi',
  'capQuyenTaiChinh', 'thuHoiQuyenTaiChinh', 'dsQuyenTaiChinh',
  'nhapGiaoDichTay', 'doiChieuNganHang', 'khopGiaoDich',
  'hopThongBao', 'danhDauDaDoc', 'docDoTrang', 'chamKpiTaiChinh',
  'dangTinTaiChinh', 'bangTinTaiChinh', 'xuLyTinTaiChinh',
  'hoiTroLyTaiChinh',
  'datHeSoLuong', 'dsHeSoLuong', 'bangLuong', 'chotLuong', 'doiSoatLuong',
  'deXuatThiGiac', 'chuyenBacThiGiac', 'banMoiThiGiac', 'chamThiGiac',
  'ghiLuatThuongHieu', 'khoThiGiac', 'docTaiLieuThiGiac', 'docNoiDungThiGiac',
  'guiDeBaiRaNgoai', 'xuatTamThiGiac', 'ghiChuThayAnh', 'docAnhThiGiac',
  'soDiRa', 'docDieuNho', 'docYTuong', 'docGopY',
  'dangTamThiGiac', 'goTamThiGiac', 'soDangBai', 'doPheuThiGiac', 'doiMotTam', 'khaiSoKenhNgoai', 'soatBoNao', 'soatAnDanh',
  'lapTheVungManh', 'docTheVungManh', 'loTrinhTuThe', 'soatVungManh',
  'traLoiCoach', 'soatBanTra',
  'soatTiepThi', 'soatBayNhanh',
  'lapSongSinh', 'docSongSinh', 'ghiCham', 'doSoCham',
  'bayConSoCEO', 'soatLuatTaiChinh', 'dangOKichBan',
  'toiUuGoi', 'docNhatKyToanHe',
  'docBaCua', 'ghiCua', 'lapBaCua', 'soatBaiTuan',
  'docTuanThu', 'ghiDongY', 'docDongY', 'yeuCauXoaDuLieu', 'danhDauXoa',
  'soXoaDuLieu', 'docVungLuatSu', 'xuatDuLieuNha',
  'docBangDieuKhien', 'banTinSang', 'chonBaNhaNgauNhien', 'soiQuyetDinh', 'ghiQuyetDinh',
  'chuanBiVang',
  'ghiLuotPrompt', 'docVongChay',
  'docBangGia', 'doiGia', 'soDoiGia', 'docLuatGiaoDien',
  'capLenhGiamSat', 'thuLenhGiamSat', 'docLenhGiamSat', 'soatSoDen', 'docTranGiamSat',
  'ghiHoChieuVideo',
  'soatCuuHe',
  'ghiPhatSinh', 'soanBanNhap', 'duyetCap', 'nhapKho', 'traBoSung', 'soatTuHoanThien',
  'capQuyenAI', 'thuHoiQuyenAI', 'soatQuyenAI', 'aiPhanLoai', 'aiSoanNhap', 'aiTongHopGiamSat',
  'dieuPhoiTroLy', 'soatDieuPhoi', 'tuHoanThienTroLy', 'soatHoatDongAgent',
  'soatKhungVanHanh', 'chamMotLuot',
  'lapKeHoachAgent', 'chayBuocAgent', 'dsWorkflowAgent',
  'doSucChua',
  'luuNhanVat', 'docNhanVat',
  'xoaTroLy', 'xoaThanhTra', 'ghiBaoCaoThanhTra', 'docBaoCaoThanhTra',
  'docHomNay', 'tickNhip', 'boViecHomNay', 'batCheDoBao',
  'ghiGhimCon', 'docGhimCon', 'datDongYAnhCon', 'chiaSeCoAnhCon',
  'deXuatNangCap', 'soiLuatNangCap', 'kyNangCap', 'mocChayThu', 'batNangCap',
  'docVongNangCap', 'docTranNangCap', 'thuXepCap',
  'soatNoiDung', 'mauBaiHoc', 'napBai', 'nopBai', 'kyBai', 'soKyBai', 'baiTreo',
  'capQuyenNoiDung', 'thuHoiQuyenNoiDung', 'dsQuyenNoiDung', 'docBuoi', 'xuatChuanNghe', 'soatMienDich',
  'chotTrichNghe', 'dsChotTrich',
  'deXuatMienGiam', 'duyetMienGiam', 'dsMienGiam',
  'ghiNhacThu', 'lichSuNhacThu', 'denHenChuaTra',
  'capQuyenCRM', 'thuHoiQuyenCRM', 'dsQuyenCRM', 'crmDanhSach', 'crmChiTiet',
  'crmBangDieuKhien', 'crmUuTien', 'crmGhiKhach', 'crmTroLy', 'crmDieuPhoiAI',
  'crmKpiCham', 'crmKpiTroLy', 'crmQuanTri', 'crmGhiCoHoi', 'crmCoHoi',
  'tinhReadyVip', 'deXuatChamSocVip', 'dsVipCanCham',
  'lich365Ngay', 'sinhNoiDungKenh', 'duBaoLead', 'dsKenhVeTinh',
  'ghiButToan', 'docSoKeToan', 'ghiHoaDon', 'docHoaDon', 'ghiSoHoaDon',
  'ghiToKhai', 'docToKhai', 'docBuongLaiKT', 'docBaoCaoTC',
  'docCanDoiPhatSinh', 'docCanDoiKeToan', 'docDoiChieuGTGT',
  'docLuuChuyenTien', 'docCongNoTuoi',
  'dangKyKhoaMatBatDau', 'dangKyKhoaMatXong', 'dsKhoaMat', 'xoaKhoaMat',
  'xacThucLaiMatBatDau', 'xacThucLaiMat', 'nhatKyAnToan',
  'dsPhongBan', 'chiTietPhongBan', 'ganPhongBan', 'baoCaoKpiPhongBan',
  'taoTaiKhoanNoiBo', 'capNhatTaiKhoan', 'dsTaiKhoan', 'offboardTaiKhoan',
  'adminKhoiPhucMatKhau',
  'crmPhanTichKhach', 'crmUuTienNangCao',
  'loTrinhCaNhan', 'khoaNoiDungTheoTang',
  'hoiChatbot', 'lichSuChat', 'soanDeBaiNgoai',
  'hoiDaTri', 'hoiDongDaTri', 'chamDaTri', 'soDaTri',
  'luuGiaiPhap', 'duyetGiaiPhap', 'dsGiaiPhap', 'boSungGiaiPhap', 'canhMauDaTri', 'thuMauDaTri', 'docVongKhoaHoc',
  'taoTuyenDaTri', 'chayChangDaTri', 'docTuyenDaTri', 'chotChangDaTri', 'docDoiAgent', 'ghiBoNhoAgent', 'batBoNhoAgent', 'doiSangDoiAgent',
  'troLyV50', 'guiThongDiepBoNao', 'docThongDiepBoNao',
  'ghiNhatKyGiaiPhap', 'docNhatKyGiaiPhap', 'soanMucGiaiPhap', 'napKhoVanDe', 'dsKhoVanDe', 'docKhoVanDe',
  'lapDeAnTaiLieu', 'chayBuocTaiLieu', 'docDeAnTaiLieu', 'datTuChayTaiLieu', 'lapKeHoachKho', 'docViecKet',
  'lapDuAnPhim', 'docXuongPhimNganSach', 'datCanhTraPhi', 'moLaiDuAnPhim', 'docKpiCayTien', 'docDongChay',
  'phimTrangThai', 'phimGuiViec', 'phimXemViec', 'phimTinhHuong', 'phimMienPhi', 'quayKhopMoi', 'quayChuyenDong', 'quayVideoDong', 'taoNhanVatAI', 'quayXem', 'quayXoa', 'quayGiongNoi', 'quayPhimMoi', 'dongGoiPhanTu', 'xemPhanTu',
  'guiBaoCaoNgay', 'tongHopBaoCao', 'dsBaoCaoNgay',
  /* Ví credit (credit.js) — sổ cái chỉ thêm dòng, bảng chủ hệ đã duyệt. */
  'viCredit', 'soCreditNha', 'thuongCredit', 'tieuCredit', 'napCreditPhieu', 'dsPhieuThuChuaNap',
  'datViCredit', 'dieuChinhCredit', 'tongQuanCredit',
  /* Đo lường toàn diện khách hàng (do-luong-kh.js) — hồ sơ tháng · xếp hạng · báo cáo. */
  'guiSoDoKH', 'guiDanhGiaKH', 'hoSoDoLuongKH', 'xepHangKH', 'baoCaoThangHe', 'chotBaoCaoThang', 'dsHoSoThang',
  /* Trung tâm đo lường & tối ưu (trung-tam-toi-uu.js) — 7 khối · vai · người · hoạt động · kiểm tra · kế hoạch. */
  'docTrungTamDo', 'lichSuTrungTamDo', 'goiYPhanBo', 'taoKeHoachToiUu', 'capNhatKeHoachToiUu', 'dsKeHoachToiUu',
  /* Nền tảng chiến lược V20 (chien-luoc-v20.js) — North Star · động lực · nhóm khách · dự báo · bất thường · mục tiêu. */
  'docChienLuocV20', 'dsMucTieuCL', 'taoMucTieuCL', 'capNhatMucTieuCL',
  /* V50 · mức áp dụng học thuyết (ap-dung.js) — 14 cụm, tự soát, tổng hợp cho R01–R03. */
  'ghiApDung', 'docApDung', 'tongApDung',
  /* Soát toàn bộ màn (soat-man.js) — R01 gửi báo cáo ĐÃ MÃ HOÁ trong trình duyệt. */
  'ghiSoatMan',
  /* Tự vá lược đồ D1 (va-luoc-do.js) — R01: thêm cột còn thiếu so với csdl.sql. */
  'soatLuocDo', 'docBoNao', 'chayThuBoNao', 'datTuChayTuyen'];

async function lam(fn, y, env, db, req) {
  if (fn === 'dangNhap')  return await dangNhap(y, env, db);
  if (fn === 'dangXuat')  return await dangXuat(y, db);

  /* Đăng nhập bằng KHUÔN MẶT — KHÔNG cần phiên (nó tạo phiên), nên đứng
     TRƯỚC cổng phiên, cùng chỗ với dangNhap. Khuôn mặt quét trên thiết
     bị, chỉ chữ ký khoá công khai đi lên — không dữ liệu sinh trắc nào. */
  if (fn === 'dangNhapMatBatDau') return await dangNhapMatBatDau(y, env, db);
  if (fn === 'dangNhapMatXong')   return await dangNhapMatXong(y, env, db);

  /* Bốn bước đăng ký — KHÔNG cần phiên, vì người đăng ký chưa có tài
     khoản nào để mở phiên. Đây cũng là lý do chúng là cửa dễ bị lợi
     dụng nhất; mọi chỗ chặt nằm trong dang-ky.js. */
  if (fn === 'dangKy')     return await dangKy(y, env, db);
  if (fn === 'guiLaiOtp')  return await guiLaiOtp(y, env, db);
  if (fn === 'xacThucOtp') return await xacThucOtp(y, env, db);
  if (fn === 'kichHoat')   return await kichHoat(y, env, db);

  /* Quên mật khẩu cũng không cần phiên, vì người quên mật khẩu thì
     không mở được phiên nào. */
  if (fn === 'quenMatKhau')   return await quenMatKhau(y, env, db);
  if (fn === 'datLaiMatKhau') return await datLaiMatKhau(y, env, db);

  /* Kiểm bản mới — KHÔNG cần phiên: app hỏi lúc mở, trước cả đăng nhập. */
  if (fn === 'kiemBanMoi') return await kiemBanMoi(y, env, db);

  /* Tạo Super Admin ĐẦU TIÊN — cửa mở-máy MỘT LẦN, KHÔNG cần phiên (chưa
     ai đăng nhập được khi hệ chưa có ai). Tự đóng vĩnh viễn ngay khi đã có
     một quản trị (R01/R02) — không dùng để leo quyền về sau. */
  if (fn === 'taoAdminDau') return await taoAdminDau(y, env, db);

  /* ── CỬA NGÂN HÀNG: XÁC THỰC BẰNG KHOÁ RIÊNG, KHÔNG BẰNG PHIÊN ──

     Ngân hàng không đăng nhập được vào hệ. Cửa này phải đứng TRƯỚC cổng
     phiên, và khoá của nó chỉ mở đúng một việc: đẩy một dòng sao kê
     vào. Nó không mở được bất kỳ cửa nào khác trong hệ. */
  if (fn === 'nganHangBao') return await nganHangBao(y, env, db);

  /* ── CỬA CỨU HỆ: KHÔNG DÙNG PHIÊN ──
     Hacker đang giữ mọi phiên hợp lệ; Super Admin thật không có phiên
     nào. Nên bốn cửa này đứng TRƯỚC cổng phiên, xác thực bằng khoá cứu
     hệ offline + token email + mật khẩu cũ, không bằng token đăng nhập.
     Cùng lối cửa ngân hàng ngay trên. */
  if (fn === 'baoDongCuuHe') return await baoDongCuuHe(y, env, db);
  if (fn === 'dongBangHe')   return await dongBangHe(y, env, db);
  if (fn === 'moBangHe')     return await moBangHe(y, env, db);
  if (fn === 'truyHoiHe')    return await truyHoiHe(y, env, db);
  /* Cửa trạng thái CÔNG KHAI: không phiên, chỉ tổng hợp số. Đứng trước
     kiểm phiên — đây là cửa duy nhất cho phép vậy, và nó không chạm
     bảng người dùng. */
  if (fn === 'trangThaiCongKhai') return await trangThaiCongKhai(y, env, db);
  /* Form "Đăng ký tư vấn" của trang Liên hệ: KHÔNG phiên (người hỏi chưa có
     tài khoản), không lưu nội dung, người nhận cố định là hòm chủ hệ.
     Thay formspree.io — dữ liệu cha mẹ không rời tay Học viện. lien-he.js. */
  if (fn === 'guiLienHe') return await guiLienHe(y, env, db, req);
  /* Đo hành vi trên trang công khai: KHÔNG phiên (khách chưa đăng nhập),
     chỉ cộng một vào ô đếm đã gộp, mọi giá trị qua danh sách trắng, không
     IP, không cookie. do-trang.js. */
  if (fn === 'ghiLuotTrang') return await ghiLuotTrang(y, env, db);
  /* Báo cáo soát toàn màn: KHÔNG phiên, nhưng chỉ trả BẢN MÃ (AES-GCM bọc
     RSA-OAEP, khoá riêng không ở máy chủ) và không trả tên người gửi — để
     workflow GitHub chuyển cho người giữ khoá riêng. soat-man.js. */
  if (fn === 'layBaoCaoSoat') return await layBaoCaoSoat(y, env, db);

  if (CAN_PHIEN.indexOf(fn) < 0) return {ok: false, error: 'Yêu cầu không hợp lệ.'};

  const hoSo = await kiemPhien(db, y.token, y.u);
  if (!hoSo) return {ok: false, code: 'AUTH', error: 'Phiên không hợp lệ hoặc đã hết hạn.'};
  if (hoSo.khoa) return {ok: false, code: 'LOCKED', error: 'Tài khoản đang bị khoá.'};

  /* Điều khiển khoang & sức khoẻ hệ đứng TRƯỚC cổng đóng băng: lúc phá
     kính chính là lúc quản trị cần khoá/mở từng phần nhất. */
  if (fn === 'dsKhoang')  return await dsKhoang(y, env, db, hoSo, BAC);
  if (fn === 'datKhoang') return await datKhoang(y, env, db, hoSo, BAC, Kho);
  if (fn === 'sucKhoeHe') return await sucKhoeHe(y, env, db, hoSo, BAC);

  /* ── CỔNG ĐÓNG BĂNG: MẶC ĐỊNH-TỪ-CHỐI ──
     Khi hệ bị đóng băng trong lúc phá kính, chặn MỌI cửa trừ danh sách
     an toàn (đọc + cứu hệ + đổi mật khẩu). Khoá NHIỀU hơn thì an toàn
     hơn khoá ÍT — một cửa ghi lọt qua lúc băng là một đòn phá nữa. */
  if (fn !== 'soatCuuHe' && !AN_TOAN_KHI_BANG.has(fn) && await dangBang(db))
    return {ok: false, code: 'DANGBANG',
      error: 'Hệ đang ĐÓNG BĂNG để cứu hệ. Mọi cửa ghi tạm khoá cho tới khi ' +
             'Super Admin truy hồi xong. Chỉ cửa đọc và cửa cứu hệ còn mở.'};

  if (fn === 'doiMatKhau') return await doiMatKhau(y, env, db, hoSo);
  if (fn === 'thuGuiThu')  return await thuGuiThu(y, env, db, hoSo);
  if (fn === 'capKhoa')    return await capKhoa(y, env, db, hoSo);
  if (fn === 'dongBo')     return await dongBo(y, env, db, hoSo);

  /* Cộng đồng + thư viện — sáu cửa cuối chuyển từ Apps Script sang D1/R2. */
  if (fn === 'docTinCongDong') return await docTinCongDong(y, env, db, hoSo);
  if (fn === 'ghiTinCongDong') return await ghiTinCongDong(y, env, db, hoSo);
  if (fn === 'guiChuyen')      return await guiChuyen(y, env, db, hoSo);
  if (fn === 'napTaiLieu')     return await napTaiLieu(y, env, db, hoSo);
  if (fn === 'duyetTaiLieu')   return await duyetTaiLieu(y, env, db, hoSo);
  if (fn === 'napTinhHuongKhach') return await napTinhHuongKhach(y, env, db, hoSo);

  if (fn === 'capQuyenXem')    return await capQuyenXem(y, env, db, hoSo);
  if (fn === 'thuHoiQuyenXem') return await thuHoiQuyenXem(y, env, db, hoSo);
  if (fn === 'soiQuyenXem')    return await soiQuyenXem(y, env, db, hoSo);
  if (fn === 'xemKhachCao')    return await xemKhachCao(y, env, db, hoSo);
  if (fn === 'nangTang')       return await nangTang(y, env, db, hoSo);
  if (fn === 'capQuyenT5Pro')    return await capQuyenT5Pro(y, env, db, hoSo);
  if (fn === 'thuHoiQuyenT5Pro') return await thuHoiQuyenT5Pro(y, env, db, hoSo);
  if (fn === 'dsQuyenT5Pro')     return await dsQuyenT5Pro(y, env, db, hoSo);
  if (fn === 'xemThongTinThanhToan') return await xemThongTinThanhToan(y, env, db, hoSo);
  if (fn === 'capNhatThongTinThanhToan') return await capNhatThongTinThanhToan(y, env, db, hoSo);

  if (fn === 'kyChungCu')      return await kyChungCu(y, env, db, hoSo);
  if (fn === 'xacNhanChungCu') return await xacNhanChungCu(y, env, db, hoSo);
  if (fn === 'soiChungCu')     return await soiChungCu(y, env, db, hoSo);

  if (fn === 'xemTepKhach')  return await xemTepKhach(y, env, db, hoSo);
  if (fn === 'suaTepKhach')  return await suaTepKhach(y, env, db, hoSo);
  if (fn === 'dsTepKhach')   return await dsTepKhach(y, env, db, hoSo);

  if (fn === 'ghiPhieuThu')   return await ghiPhieuThu(y, env, db, hoSo);
  if (fn === 'duyetPhieuThu') return await duyetPhieuThu(y, env, db, hoSo);
  if (fn === 'congNo')        return await congNo(y, env, db, hoSo);
  if (fn === 'banKeTaiChinh') return await banKeTaiChinh(y, env, db, hoSo);

  /* Tám tình huống tiền nong ngoài đường thẳng — xem chú giải dài ở
     nửa dưới tai-chinh.js. Đường thẳng là đường ít xảy ra nhất. */
  if (fn === 'huyPhieuThu')       return await huyPhieuThu(y, env, db, hoSo);
  if (fn === 'ganPhieuVaoKy')     return await ganPhieuVaoKy(y, env, db, hoSo);
  if (fn === 'deXuatHoan')        return await deXuatHoan(y, env, db, hoSo);
  if (fn === 'duyetHoan')         return await duyetHoan(y, env, db, hoSo);
  if (fn === 'traHoaHong')        return await traHoaHong(y, env, db, hoSo);
  if (fn === 'ganChungCuHoaHong') return await ganChungCuHoaHong(y, env, db, hoSo);
  if (fn === 'dongKyChuaToi')     return await dongKyChuaToi(y, env, db, hoSo);
  if (fn === 'dsQuaHan')          return await dsQuaHan(y, env, db, hoSo);
  if (fn === 'doiSoat')           return await doiSoat(y, env, db, hoSo);

  /* Bốn nhịp báo cáo — ngày để nhìn tiền vào, tuần để CHỐT, tháng và
     quý để đổi chiến lược, quý và năm để kế toán. Bốn câu hỏi khác
     nhau nên bốn bản khác nhau; xem chú giải đầu bao-cao.js. */
  if (fn === 'soNgay')        return await soNgay(y, env, db, hoSo);
  if (fn === 'chotTuan')      return await chotTuan(y, env, db, hoSo);
  if (fn === 'soatChot')      return await soatChot(y, env, db, hoSo);
  if (fn === 'dsChot')        return await dsChot(y, env, db, hoSo);
  if (fn === 'tongHop')       return await tongHop(y, env, db, hoSo);
  if (fn === 'baoCaoKeToan')  return await baoCaoKeToan(y, env, db, hoSo);
  if (fn === 'boSoKhaiThue')  return await boSoKhaiThue(y, env, db, hoSo);

  /* Nửa còn lại của cuốn sổ — tiền RA, tiền được GIẢM, tiền phải ĐÒI,
     và tiền mặt phải ĐẾM. Xem chú giải đầu chi-tieu.js. */
  if (fn === 'ghiChi')  return await ghiChi(y, env, db, hoSo);
  if (fn === 'duyetChi')   return await duyetChi(y, env, db, hoSo);
  if (fn === 'huyChi')     return await huyChi(y, env, db, hoSo);
  if (fn === 'soChi')      return await soChi(y, env, db, hoSo);
  if (fn === 'chotKet')    return await chotKet(y, env, db, hoSo);
  if (fn === 'dsChotKet')  return await dsChotKet(y, env, db, hoSo);
  if (fn === 'xemThangDuyetChi') return await xemThangDuyetChi(y, env, db, hoSo);
  if (fn === 'baoCaoChi')        return await baoCaoChi(y, env, db, hoSo);
  if (fn === 'tongHopChi')       return await tongHopChi(y, env, db, hoSo);

  /* Phòng Kế toán – Tài chính: một TRỤC RIÊNG, vuông góc với thang vai.
     Xem chú giải dài ở chi-tieu.js. */
  if (fn === 'capQuyenTaiChinh')    return await capQuyenTaiChinh(y, env, db, hoSo);
  if (fn === 'thuHoiQuyenTaiChinh') return await thuHoiQuyenTaiChinh(y, env, db, hoSo);
  if (fn === 'dsQuyenTaiChinh')     return await dsQuyenTaiChinh(y, env, db, hoSo);
  if (fn === 'capQuyenCRM')         return await capQuyenCRM(y, env, db, hoSo);
  if (fn === 'thuHoiQuyenCRM')      return await thuHoiQuyenCRM(y, env, db, hoSo);
  if (fn === 'dsQuyenCRM')          return await dsQuyenCRM(y, env, db, hoSo);
  if (fn === 'crmDanhSach')         return await crmDanhSach(y, env, db, hoSo);
  if (fn === 'crmChiTiet')          return await crmChiTiet(y, env, db, hoSo);
  if (fn === 'crmBangDieuKhien')    return await crmBangDieuKhien(y, env, db, hoSo);
  if (fn === 'crmUuTien')           return await crmUuTien(y, env, db, hoSo);
  if (fn === 'crmGhiKhach')         return await crmGhiKhach(y, env, db, hoSo);
  if (fn === 'crmGhiCoHoi')         return await crmGhiCoHoi(y, env, db, hoSo);
  if (fn === 'crmCoHoi')            return await crmCoHoi(y, env, db, hoSo);
  if (fn === 'tinhReadyVip')        return await tinhReadyVip(y, env, db, hoSo);
  if (fn === 'deXuatChamSocVip')    return await deXuatChamSocVip(y, env, db, hoSo);
  if (fn === 'dsVipCanCham')        return await dsVipCanCham(y, env, db, hoSo);
  if (fn === 'lich365Ngay')         return await lich365Ngay(y, env, db, hoSo);
  if (fn === 'sinhNoiDungKenh')     return await sinhNoiDungKenh(y, env, db, hoSo);
  if (fn === 'duBaoLead')           return await duBaoLead(y, env, db, hoSo);
  if (fn === 'dsKenhVeTinh')        return await dsKenhVeTinh(y, env, db, hoSo);

  /* Đăng KÝ / quản lý khoá mặt — cần phiên (thêm khoá cho tài khoản CỦA
     MÌNH). Đăng nhập bằng mặt thì đứng trước cổng phiên (ở trên). */
  if (fn === 'dangKyKhoaMatBatDau') return await dangKyKhoaMatBatDau(y, env, db, hoSo);
  if (fn === 'dangKyKhoaMatXong')   return await dangKyKhoaMatXong(y, env, db, hoSo);
  if (fn === 'dsKhoaMat')           return await dsKhoaMat(y, env, db, hoSo);
  if (fn === 'xoaKhoaMat')          return await xoaKhoaMat(y, env, db, hoSo);
  if (fn === 'xacThucLaiMatBatDau') return await xacThucLaiMatBatDau(y, env, db, hoSo);
  if (fn === 'xacThucLaiMat')       return await xacThucLaiMat(y, env, db, hoSo);
  if (fn === 'nhatKyAnToan')        return await nhatKyAnToan(y, env, db, hoSo);
  if (fn === 'crmTroLy')            return await crmTroLy(y, env, db, hoSo, CAN_PHIEN);
  if (fn === 'crmDieuPhoiAI')       return await crmDieuPhoiAI(y, env, db, hoSo, CAN_PHIEN);
  if (fn === 'crmKpiCham')          return await crmKpiCham(y, env, db, hoSo);
  if (fn === 'crmKpiTroLy')         return await crmKpiTroLy(y, env, db, hoSo);
  if (fn === 'crmQuanTri')          return await crmQuanTri(y, env, db, hoSo);

  /* Nhật ký toàn hệ — một chỗ Super Admin/Admin đọc MỌI thao tác (R01–R02). */
  if (fn === 'docNhatKyToanHe')     return await docNhatKyToanHe(y, env, db, hoSo);

  /* Hệ thống 13 phòng ban doanh nghiệp. */
  if (fn === 'dsPhongBan')          return await dsPhongBan(y, env, db, hoSo);
  if (fn === 'chiTietPhongBan')     return await chiTietPhongBan(y, env, db, hoSo);
  if (fn === 'ganPhongBan')         return await ganPhongBan(y, env, db, hoSo);
  if (fn === 'baoCaoKpiPhongBan')   return await baoCaoKpiPhongBan(y, env, db, hoSo);

  /* Quản lý tài khoản nội bộ (Super Admin/Admin). */
  if (fn === 'taoTaiKhoanNoiBo')    return await taoTaiKhoanNoiBo(y, env, db, hoSo);
  if (fn === 'capNhatTaiKhoan')     return await capNhatTaiKhoan(y, env, db, hoSo);
  if (fn === 'dsTaiKhoan')          return await dsTaiKhoan(y, env, db, hoSo);
  if (fn === 'offboardTaiKhoan')    return await offboardTaiKhoan(y, env, db, hoSo);
  if (fn === 'adminKhoiPhucMatKhau') return await adminKhoiPhucMatKhau(y, env, db, hoSo);

  /* CRM chuyên sâu: phân tích, phân khúc, rủi ro, ưu tiên. */
  if (fn === 'crmPhanTichKhach')    return await crmPhanTichKhach(y, env, db, hoSo);
  if (fn === 'crmUuTienNangCao')    return await crmUuTienNangCao(y, env, db, hoSo);

  /* Lộ trình cá nhân hóa 7/21/90/365 ngày + khóa nội dung theo tầng. */
  if (fn === 'loTrinhCaNhan')       return await loTrinhCaNhan(y, env, db, hoSo);
  if (fn === 'khoaNoiDungTheoTang') return await khoaNoiDungTheoTang(y, env, db, hoSo);

  /* Chatbot thông minh theo cấp/tầng. */
  if (fn === 'hoiChatbot')          return await hoiChatbot(y, env, db, hoSo);
  if (fn === 'lichSuChat')          return await lichSuChat(y, env, db, hoSo);

  /* Báo cáo hàng ngày + đánh giá chuẩn xác. */
  if (fn === 'guiBaoCaoNgay')       return await guiBaoCaoNgay(y, env, db, hoSo);
  if (fn === 'tongHopBaoCao')       return await tongHopBaoCao(y, env, db, hoSo);
  if (fn === 'dsBaoCaoNgay')        return await dsBaoCaoNgay(y, env, db, hoSo);

  /* Kế toán – Thuế: sổ kép · hoá đơn · tờ khai · báo cáo (R01–R03). */
  if (fn === 'ghiButToan')          return await ghiButToan(y, env, db, hoSo);
  if (fn === 'docSoKeToan')         return await docSoKeToan(y, env, db, hoSo);
  if (fn === 'ghiHoaDon')           return await ghiHoaDon(y, env, db, hoSo);
  if (fn === 'docHoaDon')           return await docHoaDon(y, env, db, hoSo);
  if (fn === 'ghiSoHoaDon')         return await ghiSoHoaDon(y, env, db, hoSo);
  if (fn === 'ghiToKhai')           return await ghiToKhai(y, env, db, hoSo);
  if (fn === 'docToKhai')           return await docToKhai(y, env, db, hoSo);
  if (fn === 'docBuongLaiKT')       return await docBuongLaiKT(y, env, db, hoSo);
  if (fn === 'docBaoCaoTC')         return await docBaoCaoTC(y, env, db, hoSo);
  if (fn === 'docCanDoiPhatSinh')   return await docCanDoiPhatSinh(y, env, db, hoSo);
  if (fn === 'docCanDoiKeToan')     return await docCanDoiKeToan(y, env, db, hoSo);
  if (fn === 'docDoiChieuGTGT')     return await docDoiChieuGTGT(y, env, db, hoSo);
  if (fn === 'docLuuChuyenTien')    return await docLuuChuyenTien(y, env, db, hoSo);
  if (fn === 'docCongNoTuoi')       return await docCongNoTuoi(y, env, db, hoSo);

  /* Nối sổ kế toán với tài khoản ngân hàng, và thông báo trong hệ. */
  if (fn === 'nhapGiaoDichTay')   return await nhapGiaoDichTay(y, env, db, hoSo);
  if (fn === 'doiChieuNganHang')  return await doiChieuNganHang(y, env, db, hoSo);
  if (fn === 'khopGiaoDich')      return await khopGiaoDich(y, env, db, hoSo);
  if (fn === 'hopThongBao')       return await hopThongBao(y, env, db, hoSo);
  if (fn === 'docDoTrang')        return await docDoTrang(y, env, db, hoSo);
  if (fn === 'danhDauDaDoc')      return await danhDauDaDoc(y, env, db, hoSo);
  if (fn === 'chamKpiTaiChinh')   return await chamKpiTaiChinh(y, env, db, hoSo);
  if (fn === 'dangTinTaiChinh')   return await dangTinTaiChinh(y, env, db, hoSo);
  if (fn === 'bangTinTaiChinh')   return await bangTinTaiChinh(y, env, db, hoSo);
  if (fn === 'xuLyTinTaiChinh')   return await xuLyTinTaiChinh(y, env, db, hoSo);
  if (fn === 'hoiTroLyTaiChinh')  return await hoiTroLyTaiChinh(y, env, db, hoSo);
  if (fn === 'datHeSoLuong')      return await datHeSoLuong(y, env, db, hoSo);
  if (fn === 'dsHeSoLuong')       return await dsHeSoLuong(y, env, db, hoSo);
  if (fn === 'bangLuong')         return await bangLuong(y, env, db, hoSo);
  if (fn === 'chotLuong')         return await chotLuong(y, env, db, hoSo);
  if (fn === 'doiSoatLuong')      return await doiSoatLuong(y, env, db, hoSo);
  if (fn === 'deXuatThiGiac')     return await deXuatThiGiac(y, env, db, hoSo);
  if (fn === 'chuyenBacThiGiac')  return await chuyenBacThiGiac(y, env, db, hoSo);
  if (fn === 'banMoiThiGiac')     return await banMoiThiGiac(y, env, db, hoSo);
  if (fn === 'chamThiGiac')       return await chamThiGiac(y, env, db, hoSo);
  if (fn === 'ghiChuThayAnh')     return await ghiChuThayAnh(y, env, db, hoSo);
  if (fn === 'docAnhThiGiac')     return await docAnhThiGiac(y, env, db, hoSo);
  if (fn === 'ghiLuatThuongHieu') return await ghiLuatThuongHieu(y, env, db, hoSo);
  if (fn === 'khoThiGiac')        return await khoThiGiac(y, env, db, hoSo);
  if (fn === 'docTaiLieuThiGiac') return await docTaiLieuThiGiac(y, env, db, hoSo);
  if (fn === 'docNoiDungThiGiac') return await docNoiDungThiGiac(y, env, db, hoSo);
  if (fn === 'xuatTamThiGiac') return await xuatTamThiGiac(y, env, db, hoSo);
  if (fn === 'guiDeBaiRaNgoai')   return await guiDeBaiRaNgoai(y, env, db, hoSo);
  if (fn === 'docDieuNho')        return await docDieuNho(y, env, db, hoSo);
  if (fn === 'docYTuong')         return await docYTuong(y, env, db, hoSo);
  if (fn === 'docGopY')           return await docGopY(y, env, db, hoSo);
  if (fn === 'dangTamThiGiac')    return await dangTamThiGiac(y, env, db, hoSo);
  if (fn === 'goTamThiGiac')      return await goTamThiGiac(y, env, db, hoSo);
  if (fn === 'soDangBai')         return await soDangBai(y, env, db, hoSo);
  if (fn === 'doPheuThiGiac')     return await doPheuThiGiac(y, env, db, hoSo);
  if (fn === 'doiMotTam')         return await doiMotTam(y, env, db, hoSo);
  if (fn === 'khaiSoKenhNgoai')   return await khaiSoKenhNgoai(y, env, db, hoSo);
  if (fn === 'soatBoNao')         return await soatBoNao(y, env, db, hoSo);
  if (fn === 'soatAnDanh')        return await soatAnDanh(y, env, db, hoSo);
  if (fn === 'lapTheVungManh')    return await lapTheVungManh(y, env, db, hoSo);
  if (fn === 'docTheVungManh')    return await docTheVungManh(y, env, db, hoSo);
  if (fn === 'loTrinhTuThe')      return await loTrinhTuThe(y, env, db, hoSo);
  if (fn === 'soatVungManh')      return await soatVungManh(y, env, db, hoSo);
  if (fn === 'traLoiCoach')       return await traLoiCoach(y, env, db, hoSo);
  if (fn === 'soatBanTra')        return await soatBanTra(y, env, db, hoSo);
  if (fn === 'soatTiepThi')       return await soatTiepThi(y, env, db, hoSo);
  if (fn === 'soatBayNhanh')      return await soatBayNhanh(y, env, db, hoSo);
  if (fn === 'lapSongSinh')       return await lapSongSinh(y, env, db, hoSo);
  if (fn === 'docSongSinh')       return await docSongSinh(y, env, db, hoSo);
  if (fn === 'ghiCham')           return await ghiCham(y, env, db, hoSo);
  if (fn === 'doSoCham')          return await doSoCham(y, env, db, hoSo);
  if (fn === 'bayConSoCEO')       return await bayConSoCEO(y, env, db, hoSo);
  if (fn === 'soatLuatTaiChinh')  return await soatLuatTaiChinh(y, env, db, hoSo);
  if (fn === 'dangOKichBan')      return await dangOKichBan(y, env, db, hoSo);
  if (fn === 'toiUuGoi')          return await toiUuGoi(y, env, db, hoSo);
  if (fn === 'docBaCua')          return await docBaCua(y, env, db, hoSo);
  if (fn === 'ghiCua')            return await ghiCua(y, env, db, hoSo);
  if (fn === 'lapBaCua')          return await lapBaCua(y, env, db, hoSo);
  if (fn === 'soatBaiTuan')       return await soatBaiTuan(y, env, db, hoSo);
  if (fn === 'docTuanThu')        return await docTuanThu(y, env, db, hoSo);
  if (fn === 'ghiDongY')          return await ghiDongY(y, env, db, hoSo);
  if (fn === 'docDongY')          return await docDongY(y, env, db, hoSo);
  if (fn === 'yeuCauXoaDuLieu')   return await yeuCauXoaDuLieu(y, env, db, hoSo);
  if (fn === 'danhDauXoa')        return await danhDauXoa(y, env, db, hoSo);
  if (fn === 'soXoaDuLieu')       return await soXoaDuLieu(y, env, db, hoSo);
  if (fn === 'docVungLuatSu')     return await docVungLuatSu(y, env, db, hoSo);
  if (fn === 'xuatDuLieuNha')     return await xuatDuLieuNha(y, env, db, hoSo);
  if (fn === 'docBangDieuKhien')  return await docBangDieuKhien(y, env, db, hoSo);
  if (fn === 'banTinSang')        return await banTinSang(y, env, db, hoSo);
  if (fn === 'chonBaNhaNgauNhien')return await chonBaNhaNgauNhien(y, env, db, hoSo);
  if (fn === 'soiQuyetDinh')      return await soiQuyetDinh(y, env, db, hoSo);
  if (fn === 'ghiQuyetDinh')      return await ghiQuyetDinh(y, env, db, hoSo);
  if (fn === 'chuanBiVang')       return await chuanBiVang(y, env, db, hoSo);
  if (fn === 'ghiLuotPrompt')     return await ghiLuotPrompt(y, env, db, hoSo);
  if (fn === 'docVongChay')       return await docVongChay(y, env, db, hoSo);
  if (fn === 'docBangGia')        return await docBangGia(y, env, db, hoSo);
  if (fn === 'doiGia')            return await doiGia(y, env, db, hoSo);
  if (fn === 'soDoiGia')          return await soDoiGia(y, env, db, hoSo);
  if (fn === 'docLuatGiaoDien')   return await docLuatGiaoDien(y, env, db, hoSo);
  if (fn === 'capLenhGiamSat')    return await capLenhGiamSat(y, env, db, hoSo);
  if (fn === 'thuLenhGiamSat')    return await thuLenhGiamSat(y, env, db, hoSo);
  if (fn === 'docLenhGiamSat')    return await docLenhGiamSat(y, env, db, hoSo);
  if (fn === 'soatSoDen')         return await soatSoDen(y, env, db, hoSo);
  if (fn === 'docTranGiamSat')    return await docTranGiamSat(y, env, db, hoSo);
  if (fn === 'soatCuuHe')  return await soatCuuHe(y, env, db, hoSo);
  if (fn === 'dieuPhoiTroLy')     return await dieuPhoiTroLy(y, env, db, hoSo, CAN_PHIEN);
  if (fn === 'soatDieuPhoi')      return await soatDieuPhoi(y, env, db, hoSo);
  if (fn === 'tuHoanThienTroLy')  return await tuHoanThienTroLy(y, env, db, hoSo);
  if (fn === 'soatHoatDongAgent')  return await soatHoatDongAgent(y, env, db, hoSo);
  if (fn === 'soatKhungVanHanh')  return await soatKhungVanHanh(y, env, db, hoSo);
  if (fn === 'chamMotLuot')       return await chamMotLuot(y, env, db, hoSo, CAN_PHIEN);
  if (fn === 'lapKeHoachAgent')   return await lapKeHoachAgent(y, env, db, hoSo);
  if (fn === 'chayBuocAgent')     return await chayBuocAgent(y, env, db, hoSo, CAN_PHIEN);
  if (fn === 'dsWorkflowAgent')   return await dsWorkflowAgent(y, env, db, hoSo);
  if (fn === 'doSucChua')         return await doSucChua(y, env, db, hoSo);
  if (fn === 'luuNhanVat')        return await luuNhanVat(y, env, db, hoSo);
  if (fn === 'docNhanVat')        return await docNhanVat(y, env, db, hoSo);
  if (fn === 'xoaTroLy')          return await xoaTroLy(y, env, db, hoSo);
  if (fn === 'xoaThanhTra')       return await xoaThanhTra(y, env, db, hoSo);
  if (fn === 'ghiBaoCaoThanhTra') return await ghiBaoCaoThanhTra(y, env, db, hoSo);
  if (fn === 'docBaoCaoThanhTra') return await docBaoCaoThanhTra(y, env, db, hoSo);
  if (fn === 'docHomNay')         return await docHomNay(y, env, db, hoSo);
  if (fn === 'ghiHoChieuVideo')   return await ghiHoChieuVideo(y, env, db, hoSo);
  if (fn === 'tickNhip')          return await tickNhip(y, env, db, hoSo);
  if (fn === 'viCredit')          return await viCredit(y, env, db, hoSo);
  if (fn === 'soCreditNha')       return await soCreditNha(y, env, db, hoSo);
  if (fn === 'thuongCredit')      return await thuongCredit(y, env, db, hoSo);
  if (fn === 'tieuCredit')        return await tieuCredit(y, env, db, hoSo);
  if (fn === 'napCreditPhieu')    return await napCreditPhieu(y, env, db, hoSo);
  if (fn === 'dsPhieuThuChuaNap') return await dsPhieuThuChuaNap(y, env, db, hoSo);
  if (fn === 'datViCredit')       return await datViCredit(y, env, db, hoSo);
  if (fn === 'dieuChinhCredit')   return await dieuChinhCredit(y, env, db, hoSo);
  if (fn === 'tongQuanCredit')    return await tongQuanCredit(y, env, db, hoSo);
  if (fn === 'guiSoDoKH')         return await guiSoDoKH(y, env, db, hoSo);
  if (fn === 'guiDanhGiaKH')      return await guiDanhGiaKH(y, env, db, hoSo);
  if (fn === 'hoSoDoLuongKH')     return await hoSoDoLuongKH(y, env, db, hoSo);
  if (fn === 'xepHangKH')         return await xepHangKH(y, env, db, hoSo);
  if (fn === 'baoCaoThangHe')     return await baoCaoThangHe(y, env, db, hoSo);
  if (fn === 'chotBaoCaoThang')   return await chotBaoCaoThang(y, env, db, hoSo);
  if (fn === 'dsHoSoThang')       return await dsHoSoThang(y, env, db, hoSo);
  if (fn === 'docTrungTamDo')     return await docTrungTamDo(y, env, db, hoSo);
  if (fn === 'lichSuTrungTamDo')  return await lichSuTrungTamDo(y, env, db, hoSo);
  if (fn === 'goiYPhanBo')        return await goiYPhanBo(y, env, db, hoSo);
  if (fn === 'taoKeHoachToiUu')   return await taoKeHoachToiUu(y, env, db, hoSo);
  if (fn === 'capNhatKeHoachToiUu') return await capNhatKeHoachToiUu(y, env, db, hoSo);
  if (fn === 'dsKeHoachToiUu')    return await dsKeHoachToiUu(y, env, db, hoSo);
  if (fn === 'docChienLuocV20')   return await docChienLuocV20(y, env, db, hoSo);
  if (fn === 'dsMucTieuCL')       return await dsMucTieuCL(y, env, db, hoSo);
  if (fn === 'taoMucTieuCL')      return await taoMucTieuCL(y, env, db, hoSo);
  if (fn === 'capNhatMucTieuCL')  return await capNhatMucTieuCL(y, env, db, hoSo);
  if (fn === 'ghiApDung')         return await ghiApDung(y, env, db, hoSo);
  if (fn === 'docApDung')         return await docApDung(y, env, db, hoSo);
  if (fn === 'tongApDung')        return await tongApDung(y, env, db, hoSo);
  if (fn === 'ghiSoatMan')        return await ghiSoatMan(y, env, db, hoSo);
  if (fn === 'soatLuocDo')        return await soatLuocDo(y, env, db, hoSo);
  if (fn === 'docBoNao')          return await docBoNao(y, env, db, hoSo);
  if (fn === 'chayThuBoNao')      return await chayThuBoNao(y, env, db, hoSo);
  if (fn === 'boViecHomNay')      return await boViecHomNay(y, env, db, hoSo);
  if (fn === 'batCheDoBao')       return await batCheDoBao(y, env, db, hoSo);
  if (fn === 'ghiGhimCon')        return await ghiGhimCon(y, env, db, hoSo);
  if (fn === 'docGhimCon')        return await docGhimCon(y, env, db, hoSo);
  if (fn === 'datDongYAnhCon')    return await datDongYAnhCon(y, env, db, hoSo);
  if (fn === 'chiaSeCoAnhCon')    return await chiaSeCoAnhCon(y, env, db, hoSo);
  if (fn === 'deXuatNangCap')     return await deXuatNangCap(y, env, db, hoSo);
  if (fn === 'soiLuatNangCap')    return await soiLuatNangCap(y, env, db, hoSo);
  if (fn === 'kyNangCap')         return await kyNangCap(y, env, db, hoSo);
  if (fn === 'mocChayThu')        return await mocChayThu(y, env, db, hoSo);
  if (fn === 'batNangCap')        return await batNangCap(y, env, db, hoSo);
  if (fn === 'docVongNangCap')    return await docVongNangCap(y, env, db, hoSo);
  if (fn === 'docTranNangCap')    return await docTranNangCap(y, env, db, hoSo);
  if (fn === 'thuXepCap')         return await thuXepCap(y, env, db, hoSo);
  if (fn === 'ghiPhatSinh')       return await ghiPhatSinh(y, env, db, hoSo);
  if (fn === 'soanBanNhap')       return await soanBanNhap(y, env, db, hoSo);
  if (fn === 'duyetCap')          return await duyetCap(y, env, db, hoSo);
  if (fn === 'nhapKho')           return await nhapKho(y, env, db, hoSo);
  if (fn === 'traBoSung')         return await traBoSung(y, env, db, hoSo);
  if (fn === 'soatTuHoanThien')   return await soatTuHoanThien(y, env, db, hoSo);
  if (fn === 'capQuyenAI')        return await capQuyenAI(y, env, db, hoSo);
  if (fn === 'thuHoiQuyenAI')     return await thuHoiQuyenAI(y, env, db, hoSo);
  if (fn === 'soatQuyenAI')       return await soatQuyenAI(y, env, db, hoSo);
  if (fn === 'aiPhanLoai')        return await aiPhanLoai(y, env, db, hoSo);
  if (fn === 'aiSoanNhap')        return await aiSoanNhap(y, env, db, hoSo);
  if (fn === 'soanDeBaiNgoai')    return await soanDeBaiNgoai(y, env, db, hoSo);
  if (fn === 'hoiDaTri')          return await hoiDaTri(y, env, db, hoSo);
  if (fn === 'hoiDongDaTri')      return await hoiDongDaTri(y, env, db, hoSo);
  if (fn === 'chamDaTri')         return await chamDaTri(y, env, db, hoSo);
  if (fn === 'soDaTri')           return await soDaTri(y, env, db, hoSo);
  if (fn === 'luuGiaiPhap')       return await luuGiaiPhap(y, env, db, hoSo);
  if (fn === 'duyetGiaiPhap')     return await duyetGiaiPhap(y, env, db, hoSo);
  if (fn === 'dsGiaiPhap')        return await dsGiaiPhap(y, env, db, hoSo);
  if (fn === 'boSungGiaiPhap')    return await boSungGiaiPhap(y, env, db, hoSo);
  if (fn === 'canhMauDaTri')      return await canhMauDaTri(y, env, db, hoSo);
  if (fn === 'thuMauDaTri')       return await thuMauDaTri(y, env, db, hoSo);
  if (fn === 'docVongKhoaHoc')    return await docVongKhoaHoc(y, env, db, hoSo);
  if (fn === 'taoTuyenDaTri')     return await taoTuyenDaTri(y, env, db, hoSo);
  if (fn === 'chayChangDaTri')    return await chayChangDaTri(y, env, db, hoSo);
  if (fn === 'chotChangDaTri')    return await chotChangDaTri(y, env, db, hoSo);
  if (fn === 'docDoiAgent')       return await docDoiAgent(y, env, db, hoSo);
  if (fn === 'ghiBoNhoAgent')     return await ghiBoNhoAgent(y, env, db, hoSo);
  if (fn === 'batBoNhoAgent')     return await batBoNhoAgent(y, env, db, hoSo);
  if (fn === 'doiSangDoiAgent')   return await doiSangDoiAgent(y, env, db, hoSo);
  if (fn === 'troLyV50')          return await troLyV50(y, env, db, hoSo);
  if (fn === 'guiThongDiepBoNao') return await guiThongDiepBoNao(y, env, db, hoSo);
  if (fn === 'docThongDiepBoNao') return await docThongDiepBoNao(y, env, db, hoSo);
  if (fn === 'ghiNhatKyGiaiPhap') return await ghiNhatKyGiaiPhap(y, env, db, hoSo);
  if (fn === 'docNhatKyGiaiPhap') return await docNhatKyGiaiPhap(y, env, db, hoSo);
  if (fn === 'soanMucGiaiPhap')   return await soanMucGiaiPhap(y, env, db, hoSo);
  if (fn === 'napKhoVanDe')       return await napKhoVanDe(y, env, db, hoSo);
  if (fn === 'dsKhoVanDe')        return await dsKhoVanDe(y, env, db, hoSo);
  if (fn === 'docKhoVanDe')       return await docKhoVanDe(y, env, db, hoSo);
  if (fn === 'lapDeAnTaiLieu')    return await lapDeAnTaiLieu(y, env, db, hoSo);
  if (fn === 'chayBuocTaiLieu')   return await chayBuocTaiLieu(y, env, db, hoSo);
  if (fn === 'docDeAnTaiLieu')    return await docDeAnTaiLieu(y, env, db, hoSo);
  if (fn === 'datTuChayTaiLieu')  return await datTuChayTaiLieu(y, env, db, hoSo);
  if (fn === 'lapKeHoachKho')     return await lapKeHoachKho(y, env, db, hoSo);
  if (fn === 'docViecKet')        return await docViecKet(y, env, db, hoSo);
  if (fn === 'lapDuAnPhim')       return await lapDuAnPhim(y, env, db, hoSo);
  if (fn === 'docXuongPhimNganSach') return await docXuongPhimNganSach(y, env, db, hoSo);
  if (fn === 'datCanhTraPhi')     return await datCanhTraPhi(y, env, db, hoSo);
  if (fn === 'moLaiDuAnPhim')     return await moLaiDuAnPhim(y, env, db, hoSo);
  if (fn === 'datTuChayTuyen')    return await datTuChayTuyen(y, env, db, hoSo);
  if (fn === 'docTuyenDaTri')     return await docTuyenDaTri(y, env, db, hoSo);
  if (fn === 'docKpiCayTien')     return await docKpiCayTien(y, env, db, hoSo);
  if (fn === 'docDongChay')       return await docDongChay(y, env, db, hoSo);
  if (fn === 'trangThaiCongKhai') return await trangThaiCongKhai(y, env, db);
  if (fn === 'phimTrangThai')     return await phimTrangThaiDu(y, env, db, hoSo);
  if (fn === 'phimMienPhi')       return await phimMienPhi(y, env, db, hoSo);
  if (fn === 'quayKhopMoi')       return await quayKhopMoi(y, env, db, hoSo);
  if (fn === 'quayChuyenDong')    return await quayChuyenDong(y, env, db, hoSo);
  if (fn === 'quayVideoDong')     return await quayVideoDong(y, env, db, hoSo);
  if (fn === 'taoNhanVatAI')      return await taoNhanVatAI(y, env, db, hoSo);
  if (fn === 'quayXem')           return await quayXem(y, env, db, hoSo);
  if (fn === 'quayXoa')           return await quayXoa(y, env, db, hoSo);
  if (fn === 'quayGiongNoi')      return await quayGiongNoi(y, env, db, hoSo);
  if (fn === 'quayPhimMoi')       return await quayPhimMoi(y, env, db, hoSo);
  if (fn === 'dongGoiPhanTu')     return await dongGoiPhanTu(y, env, db, hoSo);
  if (fn === 'xemPhanTu')         return await xemPhanTu(y, env, db, hoSo);
  if (fn === 'phimGuiViec')       return await phimGuiViec(y, env, db, hoSo);
  if (fn === 'phimXemViec')       return await phimXemViec(y, env, db, hoSo);
  if (fn === 'phimTinhHuong')     return await phimTinhHuong(y, env, db, hoSo);
  if (fn === 'aiTongHopGiamSat')  return await aiTongHopGiamSat(y, env, db, hoSo);
  if (fn === 'soDiRa')            return await soDiRa(y, env, db, hoSo);
  if (fn === 'soatNoiDung')       return await soatNoiDung(y, env, db, hoSo);
  if (fn === 'mauBaiHoc')         return await mauBaiHoc(y, env, db, hoSo);
  if (fn === 'napBai')            return await napBai(y, env, db, hoSo);
  if (fn === 'nopBai')            return await nopBai(y, env, db, hoSo);
  if (fn === 'kyBai')             return await kyBai(y, env, db, hoSo);
  if (fn === 'soKyBai')           return await soKyBai(y, env, db, hoSo);
  if (fn === 'baiTreo')           return await baiTreo(y, env, db, hoSo);
  if (fn === 'capQuyenNoiDung')   return await capQuyenNoiDung(y, env, db, hoSo);
  if (fn === 'thuHoiQuyenNoiDung') return await thuHoiQuyenNoiDung(y, env, db, hoSo);
  if (fn === 'dsQuyenNoiDung')    return await dsQuyenNoiDung(y, env, db, hoSo);
  if (fn === 'docBuoi')           return await docBuoi(y, env, db, hoSo);
  if (fn === 'xuatChuanNghe')     return await xuatChuanNghe(y, env, db, hoSo);
  if (fn === 'soatMienDich')      return await soatMienDich(y, env, db, hoSo);
  if (fn === 'chotTrichNghe')     return await chotTrichNghe(y, env, db, hoSo);
  if (fn === 'dsChotTrich')       return await dsChotTrich(y, env, db, hoSo);

  if (fn === 'deXuatMienGiam') return await deXuatMienGiam(y, env, db, hoSo);
  if (fn === 'duyetMienGiam')  return await duyetMienGiam(y, env, db, hoSo);
  if (fn === 'dsMienGiam')     return await dsMienGiam(y, env, db, hoSo);

  if (fn === 'ghiNhacThu')    return await ghiNhacThu(y, env, db, hoSo);
  if (fn === 'lichSuNhacThu') return await lichSuNhacThu(y, env, db, hoSo);
  if (fn === 'denHenChuaTra') return await denHenChuaTra(y, env, db, hoSo);
  return {ok: false, error: 'Yêu cầu không hợp lệ.'};
}

/* ── ĐĂNG NHẬP ──

   HAI CÂU TỪ CHỐI PHẢI GIỐNG HỆT NHAU cho "không có tài khoản này" và
   "sai mật khẩu". Khác nhau một chữ là dò được email nào đã đăng ký với
   Học viện, và danh sách ấy tự nó đã là dữ liệu của khách hàng. Nền cũ
   làm đúng chỗ này; giữ nguyên. */
const SAI = {ok: false, error: 'Tên đăng nhập hoặc mật khẩu chưa đúng.'};

/* ═══════════════ TẠO SUPER ADMIN ĐẦU TIÊN (BOOTSTRAP) ═══════════════
   Sau khi dựng máy chủ, D1 rỗng — chưa có tài khoản nào, nên KHÔNG ai đăng
   nhập được, nên KHÔNG ai xin được khoá (capKhoa đòi phiên thật). Cửa này
   phá thế bí ấy: tạo Super Admin đầu tiên. Nó CHỈ chạy khi hệ chưa có quản
   trị (R01/R02); có rồi thì đóng vĩnh viễn. Mật khẩu băm bằng GITA_TIEU
   ngay trong máy chủ — không có bản rõ nào rời máy chủ. */
async function taoAdminDau(y, env, db) {
  const khoaKhoiTao = String(env.GITA_TAO_ADMIN || '');
  const khoaGuiLen = String(y.setupKey || '');
  if (!khoaKhoiTao || !khoaGuiLen || !soSanhAnToan(khoaGuiLen, khoaKhoiTao))
    return {ok: false, code: 'AUTH',
      error: 'Thiếu hoặc sai khoá khởi tạo quản trị.'};

  const co = await db.prepare(
    "SELECT COUNT(*) AS n FROM users WHERE role IN ('R01','R02') AND (deletedAt IS NULL OR deletedAt = '')"
  ).first();
  if (co && Number(co.n) > 0)
    return {ok: false, code: 'DACO',
      error: 'Hệ đã có quản trị — cửa tạo Super Admin đầu tiên đã đóng.'};

  const u = String(y.tenMoi || y.u || '').trim().toLowerCase();
  const mk = String(y.mk || '');
  const hoTen = String(y.hoTen || 'Super Admin').trim().slice(0, 80) || 'Super Admin';
  if (u.length < 3)  return {ok: false, error: 'Tên đăng nhập cần ít nhất 3 ký tự.'};
  /* Cùng một luật với mọi cửa đặt mật khẩu khác. Bản cũ chỉ đòi tám ký tự
     — đúng ở cửa tạo tài khoản quyền CAO NHẤT, luật lại lỏng nhất. */
  const cheMk = await kiemMkMoi(mk, {username: u}, env);
  if (cheMk) return {ok: false, code: 'WEAK', error: cheMk};

  const trung = await Kho.nguoiTheoTen(db, u);
  if (trung) return {ok: false, error: 'Tên đăng nhập đã có người dùng. Chọn tên khác.'};

  const id = crypto.randomUUID();
  const muoi = muoiMoi();
  const bam = await bamMoi(mk, muoi, env.GITA_TIEU);
  const now = new Date().toISOString();
  await db.prepare(
    'INSERT INTO users (id, username, hoTen, role, pwSalt, pwHash, active, createdAt) ' +
    'VALUES (?, ?, ?, ?, ?, ?, 1, ?)'
  ).bind(id, u, hoTen, 'R01', muoi, bam, now).run();

  await Kho.ghiNhatKy(db, {uid: id, username: u, viec: 'TAO_ADMIN_DAU',
    doiTuong: 'R01', chiTiet: 'Bootstrap Super Admin đầu tiên'});
  return {ok: true, msg: 'Đã tạo Super Admin "' + u + '". Đăng nhập máy chủ bằng tên và mật khẩu vừa đặt.'};
}

async function dangNhap(y, env, db) {
  const u = String(y.u || '').trim().toLowerCase();
  const mk = String(y.mk || '');
  if (!u || !mk) return {ok: false, error: 'Thiếu tên đăng nhập hoặc mật khẩu.'};

  /* Đếm TRƯỚC khi tra, và đếm theo tên người ta gõ vào — đếm sau khi
     tra thì tài khoản không tồn tại được thử vô hạn lần. */
  const khoaNhip = 'dangNhapSai·' + u;
  const soSai = await Kho.demNhip(db, khoaNhip, GIAY_KHOA_SAI);
  if (soSai > TRAN_SAI_MK)
    return {ok: false, code: 'RATE',
      error: 'Sai quá nhiều lần. Thử lại sau 15 phút, hoặc dùng mục Quên mật khẩu.'};

  const nd = await Kho.nguoiTheoTen(db, u);
  if (!nd || nd.deletedAt) {
    /* CÂU SAI GIỐNG NHAU chưa đủ — phải trả sau CÙNG một quãng thời gian.
       Đường "không có tài khoản" trả về ngay (~1ms) còn đường "sai mật
       khẩu" chạy PBKDF2 (~90ms): chênh 141 lần, đo được, và nó dò ra email
       nào đã đăng ký — đúng dữ liệu khách mà hai câu SAI giống nhau sinh ra
       để giấu. Chạy một lượt băm GIẢ (cùng số vòng) rồi vứt, để hai đường
       tốn ~bằng nhau. Lỗ 9.99.112 (tổ soi xác thực F-1). */
    await bamMoi(mk, 'nu-khong-co-tai-khoan-dang-nhap', env.GITA_TIEU);
    return SAI;
  }

  /* CHẶN-ĐOÁN THEO ĐỊNH DANH CHÍNH TẮC (tổ soi $deadline): khoá trên đây
     dựng theo CHUỖI người gõ (username HOẶC email) — một tài khoản có hai
     cách gõ nên có HAI ngân sách, gấp đôi trần đoán. Sau khi tra được nd,
     đếm thêm một khoá theo uid: hai alias gộp về MỘT ngân sách. Giữ khoá
     theo-chuỗi-gõ làm lớp rẻ cho tài khoản không tồn tại. */
  const khoaUid = 'dangNhapSai·uid·' + nd.id;
  const soSaiUid = await Kho.demNhip(db, khoaUid, GIAY_KHOA_SAI);
  if (soSaiUid > TRAN_SAI_MK)
    return {ok: false, code: 'RATE',
      error: 'Sai quá nhiều lần. Thử lại sau 15 phút, hoặc dùng mục Quên mật khẩu.'};

  const kq = await kiemMatKhau(nd, mk, env.GITA_TIEU);
  if (!kq.dung) return SAI;

  /* Đúng mật khẩu rồi thì nói THẬT là tài khoản đang khoá — tới đây
     người hỏi đã chứng minh họ là chủ tài khoản, nên câu trả lời rõ
     ràng không còn là chỗ rò rỉ nữa. Nền cũ cũng chia đúng như vậy. */
  if (!Number(nd.active))
    return {ok: false, code: 'LOCKED', error: 'Tài khoản đang bị khoá. Liên hệ quản trị.'};

  await Kho.xoaNhip(db, khoaNhip);
  await Kho.xoaNhip(db, khoaUid);

  /* NÂNG BẢN BĂM NGAY TRONG LƯỢT ĐĂNG NHẬP ĐÚNG NÀY.
     Đây là lần duy nhất máy chủ cầm mật khẩu thật trong tay, nên cũng
     là lần duy nhất nâng được mà không phải hỏi ai. Bỏ lỡ là phải đợi
     tới lần đăng nhập sau. */
  if (kq.canNangCap) {
    const muoi = muoiMoi();
    await db.prepare('UPDATE users SET pwSalt = ?, pwHash = ?, updatedAt = ? WHERE id = ?')
      .bind(muoi, await bamMoi(mk, muoi, env.GITA_TIEU), new Date().toISOString(), nd.id).run();
  }

  return await traLoiDangNhap(db, nd, kq.canNangCap ? 'đã nâng bản băm mật khẩu' : '');
}

/* Đáp ứng đăng nhập — MỘT NGUỒN cho hình đáp ứng, dùng chung cho đăng
   nhập mật khẩu VÀ đăng nhập bằng khuôn mặt. Hai đường vào khác nhau,
   nhưng phiên cấp ra và payload trả về phải y hệt. */
async function traLoiDangNhap(db, nd, chiTiet) {
  const token = await Kho.moPhien(db, nd, HAN_PHIEN_GIO);
  const hv = await Kho.hocVienCuaCha(db, nd.id);
  /* Mức CRM được cấp (nếu có) — để máy khách biết có hiện mục CRM không.
     R01–R03 thấy mặc định (perm crm_view lv≤3); bộ phận khác chỉ thấy khi
     có dòng quyenCRM còn hiệu lực. Máy chủ vẫn là cổng thật cho mọi thao
     tác (mucCua ở từng cửa); crmMuc này chỉ để bật/tắt MỤC trên máy khách. */
  const crmMuc = await mucCrmCua(db, nd.role, nd.username);
  /* V50·168: vị trí ban tài chính Super Admin đã cấp (còn hiệu lực) — để máy
     khách mở màn Tài chính đúng phạm vi. Mọi cửa tiền vẫn tự gác ở máy chủ. */
  let taiChinhMuc = [];
  try { const q = await quyenTaiChinhCua(db, nd.username); taiChinhMuc = ['keToanThu', 'keToanChi', 'keToanTruong', 'quanLyPhong'].filter(k => q[k]); } catch (e) { taiChinhMuc = []; }
  await Kho.ghiNhatKy(db, {uid: nd.id, username: nd.username, viec: 'DANG_NHAP',
    chiTiet: chiTiet || ''});
  return {ok: true, token: token, u: nd.username, role: nd.role, portal: nd.portal,
    hoTen: nd.hoTen, tier: hv ? Number(hv.tier || 0) : 0,
    maKhachHang: nd.maKhachHang || '', crmMuc: crmMuc || '', taiChinhMuc: taiChinhMuc,
    phaiDoiMk: !!Number(nd.mustChangePw),
    hetHan: new Date(Date.now() + HAN_PHIEN_GIO * 3600e3).toISOString()};
}

/* Đăng nhập bằng khuôn mặt — KHÔNG cần phiên (nó tạo ra phiên). Xác thực
   chữ ký ở sinh-trac.js, rồi cấp phiên qua đúng traLoiDangNhap. */
async function dangNhapMatXong(y, env, db) {
  const kq = await xacThucDangNhapMat(y, env, db);
  if (!kq.ok) return kq;
  return await traLoiDangNhap(db, kq.nd, 'đăng nhập bằng khuôn mặt (' + (kq.tenKhoa || '') + ')');
}

async function dangXuat(y, db) {
  await Kho.dongPhien(db, y.token);
  return {ok: true};
}

/* ── ĐỔI MẬT KHẨU ── */
async function doiMatKhau(y, env, db, hoSo) {
  const nd = await Kho.nguoiTheoId(db, hoSo.uid);
  if (!nd) return {ok: false, error: 'Không tìm thấy tài khoản.'};

  const cu = await kiemMatKhau(nd, String(y.cu || ''), env.GITA_TIEU);
  if (!cu.dung) return {ok: false, error: 'Mật khẩu hiện tại chưa đúng.'};

  /* CHỐNG CHIẾM TÀI KHOẢN: nếu tài khoản đã bật khoá mặt thì đổi mật khẩu
     đòi một lượt quét mặt TƯƠI. Kẻ trộm được mật khẩu cũ vẫn không đổi
     được — không có khuôn mặt thật thì không qua. Kiểm SAU khi mật khẩu
     cũ đúng, để người không có mật khẩu chỉ thấy "mật khẩu sai". */
  const congMat = await congBuocMat(db, hoSo);
  if (!congMat.ok) return congMat;

  const moi = String(y.moi || '');
  const che = await kiemMkMoi(moi, nd, env);
  if (che) return {ok: false, error: che};

  const muoi = muoiMoi();
  await db.prepare(
    'UPDATE users SET pwSalt = ?, pwHash = ?, mustChangePw = 0, pwDoiLuc = ?, updatedAt = ? WHERE id = ?'
  ).bind(muoi, await bamMoi(moi, muoi, env.GITA_TIEU),
    new Date().toISOString(), new Date().toISOString(), nd.id).run();

  /* ĐÁ MỌI PHIÊN KHÁC NGAY. Người đổi mật khẩu thường đổi vì nghi có
     người khác vào được; giữ lại phiên cũ là giữ nguyên cánh cửa mà họ
     vừa đi khoá. */
  const da = await Kho.daPhienKhac(db, nd.id, hoSo.token);
  await Kho.ghiNhatKy(db, {uid: nd.id, username: nd.username, viec: 'DOI_MAT_KHAU',
    chiTiet: 'đá ' + da + ' phiên khác'});
  return {ok: true, daPhien: da};
}

/* ── CẤP KHOÁ KHO ── */
async function capKhoa(y, env, db, hoSo) {
  if (hoSo.phaiDoiMk) {
    await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'CAP_KHOA_CHAN',
      chiTiet: 'Mật khẩu tạm chưa đổi'});
    return {ok: false, code: 'MUSTCHANGE',
      error: 'Tài khoản đang dùng mật khẩu tạm do máy sinh ra. ' +
             'Đổi sang mật khẩu của riêng anh chị rồi kho mới mở.'};
  }

  const soLan = await Kho.demNhip(db, 'xinKhoa·' + hoSo.u, 3600);
  if (soLan > TRAN_XIN_KHOA_GIO) {
    await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'CAP_KHOA_CHAN',
      chiTiet: 'Vượt trần ' + TRAN_XIN_KHOA_GIO + ' lượt/giờ — lượt thứ ' + soLan});
    return {ok: false, code: 'RATE', error: 'Xin khoá quá nhiều lần trong một giờ. Thử lại sau.'};
  }

  const duocCap = phamViCapPhep(hoSo);
  if ((BAC[hoSo.role] || 99) > 2 && (BAC[hoSo.role] || 99) <= 12 &&
      await quyenT5ProDangHieuLuc(db, hoSo.uid))
    for (const k of tuyenCuaTK_(hoSo)) duocCap.push(goiNgheCao_(k));
  const xin = Array.isArray(y.goi) && y.goi.length ? y.goi : duocCap;
  const cap = duocCap.filter(g => xin.indexOf(g) >= 0);

  /* BỘ KHOÁ NẰM TRONG SECRET CỦA WORKER, KHÔNG NẰM TRONG CƠ SỞ DỮ LIỆU.
     Một bản sao lưu cơ sở dữ liệu bị lộ mà kéo theo bộ khoá thì mất
     toàn bộ tài sản nội dung của Học viện, chứ không phải mất dữ liệu
     một người. Hai thứ ấy không được nằm cùng một chỗ. */
  let kho = {};
  try { kho = JSON.parse(env.GITA_KHOA_KHO || '{}'); } catch (e) { kho = {}; }
  /* CHẤP NHẬN CẢ HAI DẠNG BÍ MẬT — port an toàn cho người triển khai.
     Tệp kho/khoa.json thật có hình {chuY, taoLuc, thuatToan, khoa:{nen,
     nghe,…}} — bản đồ khoá nằm trong .khoa. Người triển khai gần như luôn
     dán NGUYÊN tệp vào GITA_KHOA_KHO (đúng như hướng dẫn từng viết). Nếu
     đọc thẳng cấp trên thì kho['nen'] là undefined → cấp một bộ khoá RỖNG
     mà KHÔNG báo lỗi (ok:true, khoa:{}) → máy khách rơi về chế độ mẫu, kho
     trống, và không ai truy ra vì sao. Mở bọc .khoa để cả hai cách dán đều
     chạy: bản đồ phẳng {nen:…} hay cả tệp {…,khoa:{nen:…}}. */
  if (kho && kho.khoa && typeof kho.khoa === 'object' && !kho.nen) kho = kho.khoa;
  if (!Object.keys(kho).length)
    return {ok: false, code: 'NOKEY', error: 'Máy chủ chưa được nạp bộ khoá.'};

  const {co: coKhoa, thieu} = tachKhoaDuocCap(cap, kho);
  if (!coKhoa.length)
    return {ok: false, code: 'NOKEY',
      error: 'Máy chủ chưa có khoá cho gói nội dung được cấp.'};

  const saiDinhDang = coKhoa.filter(g => {
    if (typeof kho[g] !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(kho[g])) return true;
    try { return atob(kho[g]).length !== 32; } catch (e) { return true; }
  });
  if (saiDinhDang.length)
    return {ok: false, code: 'BADKEY',
      error: 'Khoá máy chủ sai định dạng AES-256 cho các gói: ' + saiDinhDang.join(', ') + '.'};

  const traVe = {};
  for (const g of coKhoa) traVe[g] = kho[g];

  await Kho.ghiNhatKy(db, {uid: hoSo.uid, username: hoSo.u, viec: 'CAP_KHOA',
    doiTuong: coKhoa.join(','), chiTiet:
      (thieu.length ? 'Thiếu khoá: ' + thieu.join(', ') + ' · ' : '') +
      String(y.may || '').slice(0, 120)});

  return {ok: true, khoa: traVe, phamVi: coKhoa, thieuKhoa: thieu,
    hetHan: new Date(Date.now() + HAN_KHOA_GIO * 3600e3).toISOString()};
}

/* ═══════════════ CỬA ═══════════════ */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Expose-Headers': 'x-gita-ma'
};

/* GITA_DIA_CHI_WEB là DANH SÁCH origin, phân tách bằng dấu phẩy. Phải gồm
   MỌI địa chỉ đang chạy bản web (hiện chỉ https://gita365.pages.dev):
   thiếu một tên miền là trình duyệt chặn CORS và app báo "không kết nối được
   máy chủ" dù Worker vẫn sống. Origin của request khớp danh sách thì trả lại
   đúng origin ấy; không khớp thì trả origin đầu tiên (trình duyệt sẽ chặn).
   'null' (file://) không bao giờ được chấp nhận. Biến trống → '*'. */
function dsOriginWeb(env) {
  return String((env && env.GITA_DIA_CHI_WEB) || '').split(',')
    .map(s => s.trim().replace(/\/+$/, '')).filter(s => s && s !== 'null');
}
export function corsTheoEnv(env, req) {
  const ds = dsOriginWeb(env);
  if (!ds.length) return CORS;
  const goi = req && req.headers && req.headers.get('Origin');
  const origin = goi && goi !== 'null' && ds.includes(goi) ? goi : ds[0];
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Expose-Headers': 'x-gita-ma',
    'Vary': 'Origin'
  };
}
const TRAN_THAN_BYTE = 10 * 1024 * 1024;

function traJson(o, ma, env, req) {
  const headers = corsTheoEnv(env || {}, req);
  return new Response(JSON.stringify(o), {
    status: ma || 200,
    /* nosniff + no-store (tầng BM02): dữ liệu tài khoản không nằm lại ở
       bộ đệm trung gian, trình duyệt không đoán kiểu nội dung. GET trạng
       thái tự đặt lại Cache-Control công khai 30 giây. */
    headers: {'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store', ...headers}
  });
}

/* ═══════════════ DỌN THEO LỊCH ═══════════════

   Bốn bảng ở nền mới chỉ lớn lên nếu không ai dọn: phiên đã hết hạn,
   dòng chặn nhịp đã qua giờ, mã lấy lại mật khẩu đã chết, và lượt đăng
   ký bỏ dở. Đây đúng lớp việc mà bản 9.79 dựng GITA_DonDep.gs cho nền
   cũ; chuyển nền thì phải mang theo, nếu không thì vừa gỡ được một chỗ
   tắc lại dựng lại đúng chỗ ấy ở nơi mới.

   Ba luật giữ nguyên từ 9.79:

     1. XOÁ THEO LUẬT ĐÃ KHAI, KHÔNG THEO CẢM GIÁC. Bảng nào giữ bao
        lâu và VÌ SAO chừng ấy — khai ở HAN ngay dưới.
     2. KHÔNG BAO GIỜ XOÁ THỨ CÒN HIỆU LỰC. Mọi câu đều có điều kiện
        thời gian; không câu nào xoá theo số lượng.
     3. NÓI RA ĐÃ XOÁ BAO NHIÊU. Ghi một dòng vào nhật ký — một bộ dọn
        chạy im lặng là một bộ dọn không ai kiểm được, và ngày nó xoá
        nhầm thì cũng không ai biết nó đã chạy.

   Đăng ký bỏ dở giữ 30 ngày, nhưng lượt ĐANG CHỜ kích hoạt thì giữ bất
   kể bao lâu: người ta có thể mở thư cũ và bấm vào. */
const HAN = [
  {bang: 'sessions', cau: 'DELETE FROM sessions WHERE exp < ?',
   dv: () => [Date.now()],
   vi: 'phiên hết hạn thì không ai dùng lại được nữa'},

  {bang: 'chanNhip', cau: 'DELETE FROM chanNhip WHERE hetHan < ?',
   dv: () => [Date.now() - 86400e3],
   vi: 'giữ thêm một ngày sau khi hết hạn để còn tra lại khi có sự cố'},

  {bang: 'maLayLai', cau: 'DELETE FROM maLayLai WHERE hetHan < ?',
   dv: () => [Date.now() - 3600e3],
   vi: 'mã chết rồi thì giữ thêm một giờ, đủ để đọc nhật ký một sự cố đang xảy ra'},

  {bang: 'dangKyCho',
   cau: "DELETE FROM dangKyCho WHERE createdAt < ? AND trangThai <> 'choKichHoat'",
   dv: () => [new Date(Date.now() - 30 * 86400e3).toISOString()],
   vi: 'đăng ký bỏ dở quá ba mươi ngày thì người ta không quay lại nữa; ' +
       'lượt ĐANG CHỜ kích hoạt thì giữ bất kể bao lâu'},

  {bang: 'thongBao',
   cau: "DELETE FROM thongBao WHERE loai = 'lienHe' AND docLuc IS NOT NULL AND docLuc < ?",
   dv: () => [new Date(Date.now() - 90 * 86400e3).toISOString()],
   vi: 'yêu cầu tư vấn từ trang Liên hệ mang tên + số điện thoại của người lạ; ' +
       'đã xem quá chín mươi ngày thì xoá, CHƯA xem thì giữ bất kể bao lâu'},

  DON_DO_TRANG,
  DON_GIU_CHO
];

export async function donDep(env) {
  const db = env.CSDL, ke = [];
  let tong = 0;
  for (const h of HAN) {
    try {
      const r = await db.prepare(h.cau).bind(...h.dv()).run();
      const n = (r && r.meta && r.meta.changes) || 0;
      tong += n;
      ke.push(h.bang + ' −' + n);
    } catch (e) {
      ke.push(h.bang + ': ' + String(e && e.message || e).slice(0, 80));
    }
  }
  try { const n = await donQuay(env); tong += n; ke.push('quay_viec −' + n); }
  catch (e) { ke.push('quay_viec: ' + String(e && e.message || e).slice(0, 80)); }
  /* Ghi SAU khi dọn, để chính dòng này không bị lượt dọn vừa rồi cuốn đi. */
  try {
    await Kho.ghiNhatKy(db, {viec: 'DON_DEP', doiTuong: 'tự động',
      chiTiet: 'xoá ' + tong + ' dòng · ' + ke.join(' · ')});
  } catch (e) {}
  return {ok: true, tongXoa: tong, ke};
}

export default {
  /* Cloudflare gọi hàm này theo lịch khai ở wrangler.toml.

     HAI KHUNG GIỜ, HAI VIỆC:

       20:00 UTC = 03:00 sáng giờ Việt Nam → DỌN
       00:00 UTC = 07:00 sáng giờ Việt Nam → BẢN TỔNG DOANH THU hôm qua

     Phân theo giờ chứ không chạy cả hai ở mỗi lần nổ: dọn hai lần một
     ngày là phí, còn gửi bản tổng hai lần là một hòm thư có hai lá
     giống nhau — và người đọc thôi tin cả hai.

     Bản đầu tôi viết cổng này là gioUTC === 0 trong khi wrangler.toml
     mới chỉ khai một khung 20:00. Nghĩa là bản tổng KHÔNG BAO GIỜ gửi,
     mà mã vẫn trông như đã làm xong việc. Nay khai đủ hai khung ở đó,
     và phép đo ở thu-worker.js gọi thẳng scheduled() với cả hai mốc. */
  async scheduled(su, env, ctx) {
    /* V50 · NHỊP VẬN HÀNH MỖI GIỜ (bo-nao-van-hanh.js). Phân theo CHUỖI LỊCH,
       đứng trước phép phân theo giờ: lượt 00:15 mà rơi xuống nhánh gioUTC === 0
       là gửi bản tổng doanh thu lần hai. */
    if (su && su.cron === CRON_NHIP) {
      /* Công tắc khẩn: GITA_BO_NAO_NGHI = "1" thì bộ não nghỉ hẳn, không cần sửa lịch. */
      if (String(env.GITA_BO_NAO_NGHI || '') === '1') return;
      const lan = Math.floor(new Date((su && su.scheduledTime) || Date.now()).getUTCMinutes() / 5);
      ctx.waitUntil(nhipVanHanh(env, { that: true, lan }).catch(e =>
        console.error('BO_NAO_NHIP_HONG', String(e && e.message || e))));
      return;
    }
    const gioUTC = new Date((su && su.scheduledTime) || Date.now()).getUTCHours();

    if (gioUTC === 0) {
      /* NGÀY LẤY TỪ MỐC ĐÃ HẸN, KHÔNG LẤY TỪ "BÂY GIỜ".

         Lượt chạy theo lịch có thể nổ muộn, hoặc chạy lại sau một lượt
         hỏng. Lấy "hôm qua" theo Date.now() thì một lượt chạy muộn qua
         nửa đêm sẽ tổng kết nhầm ngày, và ngày đúng thì không ai tổng
         kết nữa — mất hẳn một ngày khỏi chuỗi thư. */
      const homQua = new Date(new Date((su && su.scheduledTime) || Date.now())
        .getTime() + 7 * 3600e3 - 86400e3).toISOString().slice(0, 10);
      ctx.waitUntil(tongNgayDoanhThu(env, env.CSDL, homQua).catch(e =>
        console.error('BAO_DOANHTHU_NGAY_HONG', String(e && e.message || e))));
      return;
    }
    /* V50·168: mỗi đêm tự vá lược đồ trước tiên — cột thêm sau trong csdl.sql
       tới được D1 đã có bảng (chỉ thêm cột, không xoá / đổi). */
    ctx.waitUntil(vaLuocDo(env.CSDL).catch(e => console.error('VA_LUOC_DO_HONG', String(e && e.message || e))));
    ctx.waitUntil(donDep(env).then(() => quetSaoLuuMoCoi(env)).then(() => tuSoatVaChua(env)).catch(e =>
      console.error('DON_DEP_HONG', String(e && e.message || e))));
    ctx.waitUntil(vongKhoaHocTuDong(env).catch(e =>
      console.error('DA_TRI_KHOA_HOC_HONG', String(e && e.message || e))));
    ctx.waitUntil(canhMauTuDong(env).catch(e =>
      console.error('DA_TRI_CANH_MAU_HONG', String(e && e.message || e))));
  },

  async fetch(req, env, ctx) {
    /* Tài nguyên tĩnh công khai (giọng đọc Piper) — phục vụ từ R2. */
    if ((req.method === 'GET' || req.method === 'HEAD') && new URL(req.url).pathname.startsWith('/tn/'))
      return phucVuTaiNguyen(req, env);
    /* Xưởng quay khớp môi: phim đã quay (công khai theo mã) + lời gọi của máy quay GitHub Actions. */
    const duongQ = new URL(req.url).pathname;
    if (duongQ.startsWith('/phim/')) {
      try { return await phucVuPhimPhanTu(req, env, duongQ); }
      catch (e) {
        console.error('PHIM_PT_LOI', String(e && e.message || e));
        return new Response('Không ghép được phim.', { status: 500 });
      }
    }
    if (duongQ.startsWith('/quay/')) {
      try {
        if ((req.method === 'GET' || req.method === 'HEAD') && duongQ.startsWith('/quay/phim/')) return await phucVuPhimQuay(req, env, duongQ);
        return await xuLyMayQuay(req, env, duongQ);
      } catch (e) {
        console.error('QUAY_LOI', String(e && e.message || e));
        return new Response('{"ok":false,"error":"Máy chủ gặp trục trặc."}', {status: 500, headers: {'Content-Type': 'application/json; charset=utf-8'}});
      }
    }
    const cors = corsTheoEnv(env, req);
    if (req.method === 'OPTIONS') return new Response(null, {status: 204, headers: cors});
    const ma = maYeuCau(req);

    /* Trạng thái: máy chủ còn sống chưa, đã nạp khoá chưa. KHÔNG trả
       khoá nào, và không nói gì về số tài khoản. Cho trình duyệt giữ 30
       giây — máy giám sát/tab mở nhiều không biến thành nhiều lượt Worker. */
    if (req.method === 'GET') {
      let n = 0;
      try { n = Object.keys(JSON.parse(env.GITA_KHOA_KHO || '{}')).length; } catch (e) {}
      const r = traJson({ok: true, ten: 'GITA 365 — máy chủ cấp phép',
        daNapKhoa: n, ai: !!env.AI, luc: new Date().toISOString()}, 200, env, req);
      r.headers.set('Cache-Control', 'public, max-age=30');
      return r;
    }
    if (req.method !== 'POST') return traJson({ok: false, error: 'Yêu cầu không hợp lệ.'}, 405, env, req);

    /* Trần thân yêu cầu (tầng PV05): gói lớn nhất hợp lệ là tệp cộng đồng
       8 MB base64 — trên 10 MB là phá, cắt TRƯỚC khi đọc/parse để không đốt
       bộ nhớ và CPU của Worker. Kiểm cả content-length (rẻ) lẫn độ dài thật. */
    const khaiCo = Number(req.headers.get('content-length') || 0);
    if (khaiCo > TRAN_THAN_BYTE) return traJson({ok: false, code: 'TOOBIG', error: 'Yêu cầu vượt trần 10 MB.'}, 413, env, req);
    let y;
    try {
      const than = await req.text();
      if (than.length > TRAN_THAN_BYTE) return traJson({ok: false, code: 'TOOBIG', error: 'Yêu cầu vượt trần 10 MB.'}, 413, env, req);
      y = JSON.parse(than);
    } catch (e) { y = {}; }
    if (!y || typeof y !== 'object' || Array.isArray(y)) y = {};
    const fn = String(y.fn || '');

    try {
      /* Vệ chi phí đứng TRƯỚC lam(): bị chặn thì không tốn lượt D1/R2 nào.
         Rồi tới cổng KHOANG: phần bị khoá/đang tự nghỉ trả lời ngay,
         các phần khác vẫn chạy. */
      const chan = await veChiPhi(fn, y, env, req) || await chanKhoang(fn, env, env.CSDL);
      const kq = chan || await lam(fn, y, env, env.CSDL, req);
      if (!chan) ghiTotKhoang(fn);
      /* V50·168: sau mỗi thao tác nhạy cảm thành công, tự soát dấu hiệu chiếm
         tài khoản (đổi mật khẩu + một loạt việc phá trong 15 phút) — chạy nền,
         không làm chậm câu trả lời. */
      if (kq && kq.ok && CUA_NHAY.has(fn) && ctx && ctx.waitUntil) ctx.waitUntil(tuSoatBaoDong(env, env.CSDL));
      /* V50 · CÓ KHÁCH LÀ CHẠY: khách vừa kích hoạt tài khoản → bộ não giao Tư
         vấn và hẹn chạm hôm nay, đúng lời "liên hệ trong 24 giờ" của thư kích hoạt. */
      if (kq && kq.ok && fn === 'kichHoat' && kq.maKhachHang && ctx && ctx.waitUntil)
        ctx.waitUntil(kichHoatKhachMoi(env, env.CSDL, kq.maKhachHang).catch(e =>
          console.error('BO_NAO_KHACH_MOI_HONG', String(e && e.message || e))));
      const r = traJson(kq, 200, env, req);
      r.headers.set('x-gita-ma', ma);
      return r;
    } catch (err) {
      ghiLoiKhoang(fn);
      /* KHÔNG ĐẨY LỜI LỖI CỦA MÁY RA CHO MÁY KHÁCH. Lời lỗi của cơ sở
         dữ liệu hay kể tên bảng, tên cột, có khi cả mảnh câu lệnh —
         đó là bản đồ cho người đi dò. Ghi đủ vào nhật ký máy chủ, trả
         ra một câu — kèm MÃ YÊU CẦU để tra đúng dòng nhật ký ấy. */
      console.error('LOI', ma, fn, err && err.stack || err);
      const r = traJson({ok: false, maYeuCau: ma,
        error: 'Máy chủ gặp trục trặc. Thử lại sau ít phút. (mã ' + ma + ')'}, 500, env, req);
      r.headers.set('x-gita-ma', ma);
      return r;
    }
  }
};
