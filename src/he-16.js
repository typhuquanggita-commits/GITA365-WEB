/* ═══════════════════════════════════════════════════════════════
   GITA 365 — BẢN ĐỒ 16 HỆ THỐNG · KIỆN TOÀN SÂU

   Chủ hệ: kiện toàn 16 hệ (Quản trị · Dữ liệu · Vận hành nội lực ·
   Khách hàng · Tài chính · Marketing · Văn bản–pháp lý–hiến pháp ·
   Agent · Bộ não trung tâm · Main tự chủ · Thuê ngoài · Giải pháp ·
   Nghiên cứu X10 chu kỳ 6 tháng · 1000 chiến lược · Quản trị mã nguồn
   & mã định dạng) — chiều sâu, chất lượng, khác biệt, tối ưu.

   ══ TRỎ, KHÔNG CHÉP — giữ đúng luật 9.99.83 ══
   Mỗi hệ là một danh sách CON TRỎ tới thứ đã chạy thật: màn (v:),
   bảng toàn cục (g:), cửa máy chủ (f:), tài liệu (d:), công cụ (t:).
   Không dựng hiến pháp, hàng rào hay roster thứ hai — hệ Agent đọc
   THẲNG G.DP_TRO_LY / G.DP_MIEN của dieu-phoi.js.

   ══ ĐO, KHÔNG KHAI ══
   Độ "sống" của một hệ = số con trỏ còn trỏ tới thứ có thật, đo lúc
   chạy (v:, g: ở máy khách) và đo ở CI (mọi loại — tools/do-16-he.js).
   Không có ô "năng lực ×10" tự ghi: X10 là HƯỚNG (DP5), đo bằng tỉ số
   chỉ số thật so với mốc nền đã chụp đầu chu kỳ 6 tháng.

   ══ 1000 CHIẾN LƯỢC LÀ KHÔNG GIAN, KHÔNG PHẢI 1000 LỜI ĐÃ CHỨNG MINH ══
   10 mục tiêu × 10 đòn bẩy × 10 phạm vi = 1000 câu hỏi chiến lược có mã.
   Mỗi ô bắt đầu ở trạng thái "đề xuất"; chỉ lên "đã chứng minh" khi có
   bằng chứng do người ghi. Không bịa kết quả.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

/* ══ 16 HỆ — mỗi hệ: con trỏ thật · khoảng trống thật · bước kế ══ */
G.H16_HE = [
  { ma: 'H01', ten: 'Quản trị', ic: 'shield',
    troVao: ['v:phan-quyen', 'v:tang-quyen', 'v:vong-doi-tk', 'v:cap-tai-khoan', 'g:ROLES', 'g:PERM', 'g:TIERS',
      'f:capQuyenXem', 'f:capQuyenTaiChinh', 'd:docs/TAI_KHOAN.md'],
    trong: 'Quyền khai ở nhiều mô-đun; chưa có phép thử "ai làm được gì" chạy tự động ở CI.',
    ke: 'Ma trận vai × quyền xuất thành bảng kiểm CI; mẫu ABAC theo CASL (chỉ học mẫu).' },
  { ma: 'H02', ten: 'Dữ liệu · thông tin', ic: 'grid',
    troVao: ['v:dong-chay', 'v:kho-tong', 'v:an-toan-du-lieu', 'g:DONGBO', 'g:KHO', 'g:KHO_TONG',
      'f:dongBo', 'f:yeuCauXoaDuLieu', 'd:docs/BAO_VE_TAI_SAN.md', 'd:docs/KIEN_TRUC_NOI_LUC.md'],
    trong: 'Tìm kiếm trên dữ liệu đã giải mã còn quét tuyến tính; chưa có chỉ mục phía khách.',
    ke: 'Chỉ mục toàn văn ở máy khách (MiniSearch, ~7 KB gz) dựng sau khi giải mã, không rời máy.' },
  { ma: 'H03', ten: 'Vận hành nội lực', ic: 'pulse',
    troVao: ['v:tu-hoan-thien', 'v:tu-nang-cap', 'v:tu-dong', 'v:tu-van-hanh', 'v:giam-sat', 'v:noi-may-chu',
      'f:sucKhoeHe', 'f:dsKhoang', 'f:datKhoang', 'f:soatCuuHe', 'f:deXuatNangCap',
      'd:docs/KIEN_TRUC_NOI_LUC.md', 't:tools/thu-dong-bo.mjs'],
    trong: 'Phát hành vẫn ghi số phiên bản tay; chưa có nhật ký thay đổi sinh tự động.',
    ke: 'release-please (Google) sinh CHANGELOG + thẻ phiên bản từ commit quy ước.' },
  { ma: 'H04', ten: 'Khách hàng', ic: 'eye',
    troVao: ['v:crm', 'g:TB_TANG', 'g:TB_HANH_TRINH', 'v:coach-kh', 'v:hanh-trinh-5-tang', 'v:dong-hanh-cap', 'v:phim-cau-noi', 'v:hang-vip',
      'v:assessment', 'g:TUYEN', 'g:TUYEN_MOC', 'f:crmTroLy', 'f:traLoiCoach'],
    trong: 'Hành trình 5 tầng × 50 cấp có khung; nội dung cấp phụ thuộc kho cấp phép.',
    ke: 'Mỗi cấp một "thẻ kết quả" đo được (trước/sau) nối với phim cầu nối.' },
  { ma: 'H05', ten: 'Tài chính', ic: 'grid',
    troVao: ['v:phong-tai-chinh', 'v:tai-chinh-ceo', 'v:ke-toan-thue', 'v:thanh-toan', 'v:bang-gia', 'v:chi-phi',
      'f:ghiPhieuThu', 'f:doiChieuNganHang', 'f:bangLuong', 'f:baoCaoKeToan', 'f:soatChot', 'd:docs/CHI_PHI.md'],
    trong: 'Chưa có phép thử tự động "nợ = có" cho bút toán khi đổi mã.',
    ke: 'Bất biến kế toán kép (mẫu Beancount/TigerBeetle) thành phép thử CI trên D1 giả.' },
  { ma: 'H06', ten: 'Marketing', ic: 'spark',
    troVao: ['v:noi-dung-tiep-thi', 'v:bien-soan-noi-dung', 'v:chuoi-wow', 'v:kien-truc-thi-giac', 'v:xuong-phim',
      'v:studio', 'g:CWOW_LUAT', 'f:soatTiepThi', 'f:phimGuiViec'],
    trong: 'Chưa đo được kênh nào đem khách thật (quy kết nguồn) mà không theo dõi cá nhân.',
    ke: 'Đếm theo trang, không cookie (mẫu Plausible/Umami) bằng Workers Analytics Engine.' },
  { ma: 'H07', ten: 'Văn bản · pháp lý · hiến pháp', ic: 'lock',
    troVao: ['v:bo-nao', 'v:bien-nien', 'v:phap-ly', 'v:phap-ly-rui-ro', 'v:ra-soat-phap-ly', 'v:luat-lam-viec',
      'v:hanh-lang', 'v:van-ban', 'v:ky-ket', 'f:soatBoNao', 'f:docTuanThu', 'f:ghiDongY'],
    trong: 'Hiến pháp 13 điều nằm một nơi (đúng) — nhưng chưa có phép thử CI chứng minh mọi cửa ra ngoài đi qua soatAnDanh.',
    ke: 'Luật-thành-mã: bước CI quét may-chu/ tìm fetch ra nhà cung cấp AI không qua cổng (mẫu OPA/Rego, chỉ học mẫu).' },
  { ma: 'H08', ten: 'Agent', ic: 'orbit',
    troVao: ['v:dieu-phoi', 'v:bo-nao-da-tri', 'f:hoiDaTri', 'f:hoiDongDaTri', 'v:quyen-nang-ai', 'v:ai-dieu-phoi', 'v:bo-prompt', 'v:khung-van-hanh',
      'g:DP_TRO_LY', 'g:DP_MIEN', 'g:DP_TRAN', 'g:H16_SOP', 'f:soatHoatDongAgent', 'f:lapKeHoachAgent', 'f:capQuyenAI', 'f:docVongKhoaHoc'],
    trong: 'Roster 100 trợ lý có vai, cổng, khoá sở hữu; trước bản này chưa có quy trình (SOP), KPI và bàn giao chéo theo từng miền.',
    ke: 'Ngăn "Agent 8 năng lực" bên dưới: SOP từng miền trên cửa thật, KPI đọc từ sổ audit, bàn giao giữa miền.' },
  { ma: 'H09', ten: 'Bộ não vận hành trung tâm', ic: 'book',
    troVao: ['v:bo-nao', 'v:he-dieu-hanh', 'v:dieu-hanh', 'v:hom-nay', 'g:DP_BONAO', 'g:TT_KHO', 'd:docs/BO_NAO_DA_TRI.md', 'f:docBangDieuKhien', 'f:banTinSang', 'f:docVongKhoaHoc'],
    trong: 'Lệnh điều phối rải giữa màn, cửa và cron; chưa có một sổ lệnh chung có trạng thái.',
    ke: 'Sổ lệnh có trạng thái theo mẫu Cloudflare Workflows (bước bền, tự thử lại) khi vượt gói miễn phí.' },
  { ma: 'H10', ten: 'Main tự chủ', ic: 'pulse',
    troVao: ['v:tu-dong', 'v:tu-van-hanh', 'f:sucKhoeHe', 'f:soatCuuHe', 'd:docs/KIEN_TRUC_NOI_LUC.md'],
    trong: 'Cron đêm chạy chuỗi cố định; chưa có bảng lịch khai báo được.',
    ke: 'Giữ cron đơn (0đ); thêm việc bằng khai báo trong scheduled(), đo bằng sucKhoeHe.' },
  { ma: 'H11', ten: 'Thuê ngoài · đối tác', ic: 'grid',
    troVao: ['v:ket-noi', 'v:xuong-phim', 'f:phimGuiViec', 'f:soatAnDanh', 'f:guiDeBaiRaNgoai', 'd:docs/MAY_CHU.md'],
    trong: 'Mỗi nhà cung cấp một cửa; chưa có thẻ hợp đồng mức dịch vụ (SLA) và cầu dao riêng từng nhà.',
    ke: 'Cầu dao khoang đã có (khoang.js) — mở rộng mỗi nhà cung cấp một khoang.' },
  { ma: 'H12', ten: 'Giải pháp', ic: 'check',
    troVao: ['v:tinh-huong', 'v:ban-tu-van', 'v:xu-ly-ca', 'v:so-tay-van-hanh', 'v:so-tay-tu-van', 'v:quy-trinh-toan-he',
      'g:CX_TINHHUONG', 'g:H16_GP'],
    trong: 'Thư viện tình huống rải nhiều màn, mỗi nơi một khuôn.',
    ke: 'Một khuôn chung: tình huống → chẩn đoán → giải pháp → kết quả → bài học (ngăn Giải pháp).' },
  { ma: 'H13', ten: 'Nghiên cứu · X10 · chu kỳ 6 tháng', ic: 'spark',
    troVao: ['v:cai-tien', 'v:tien-bo', 'v:tinh-gon', 'v:suc-chua-toc-do', 'g:H16_RD', 'd:docs/SUC_CHUA_TOC_DO.md'],
    trong: 'Có cải tiến nhưng chưa có mốc nền và sổ thí nghiệm để so sau 6 tháng.',
    ke: 'Ngăn R&D: chụp mốc nền, sổ thí nghiệm gắn mã chiến lược, so tỉ số khi hết chu kỳ.' },
  { ma: 'H14', ten: '1000 chiến lược', ic: 'list',
    troVao: ['v:ban-do-chien-luoc', 'v:ma-tran-bang', 'v:the-diem-can-bang', 'g:H16_CL'],
    trong: 'Có bản đồ chiến lược; chưa có không gian chiến lược có mã để chấm và chọn.',
    ke: 'Ngăn 1000 chiến lược: 10×10×10 câu hỏi có mã, chấm ICE, chỉ "chứng minh" khi có bằng chứng.' },
  { ma: 'H15', ten: 'Quản trị mã nguồn · mã định dạng', ic: 'lock',
    troVao: ['v:ra-soat', 'v:soat-day-du', 'g:H16_MA', 't:tools/gop-src.js', 't:tools/ra-soat-day-du.js',
      't:tools/do-16-he.js', 't:.github/workflows/kiem-tra.yml', 't:.github/CODEOWNERS', 'd:docs/HE_16_TRU.md', 'v:la-chan-30', 'g:LC_TANG', 't:tools/soat-bi-mat.js', 'd:docs/LA_CHAN_30_TANG.md'],
    trong: 'Trước bản này chỉ kiểm lúc deploy; PR không có cổng kiểm, chưa quét bảo mật mã.',
    ke: 'Cổng PR (kiem-tra.yml) · CodeQL · OpenSSF Scorecard · Dependabot cho Actions · CODEOWNERS.' },
  { ma: 'H16', ten: 'Chi phí · sức chứa', ic: 'pulse',
    troVao: ['v:chi-phi', 'v:suc-chua-toc-do', 'v:theo-doi-tai-nguyen', 'f:soDaTri', 'd:docs/TOI_UU_CHI_PHI_CHAT_LUONG.md'],
    trong: 'Hai trần thật: D1 100k ghi/ngày và R2 hạng A 1 triệu/tháng.',
    ke: 'Đòn bẩy GITA_SAO_LUU_PHUT / GITA_GIU_SAO_LUU — 0đ tới 300k tài khoản.' }
];

/* ══ AGENT 8 NĂNG LỰC — SOP trên CỬA THẬT của mỗi miền ══
   `buoc` chỉ được chứa cửa thuộc đúng miền ấy trong DP_SPEC (CI đối
   chiếu). `trao` = miền nhận bàn giao (teamwork). `kpi` = phép đo đọc
   được từ sổ audit, không phải con số tự khai. */
G.H16_SOP = [
  { mien: 'TC_THU', buoc: ['ghiPhieuThu', 'duyetPhieuThu', 'doiSoat', 'congNo'], trao: 'TC_NH', kpi: 'Phiếu duyệt trong 24h · số dòng lệch đối soát' },
  { mien: 'TC_CHI', buoc: ['xemThangDuyetChi', 'ghiChi', 'duyetChi', 'soChi'], trao: 'TC_THUE', kpi: 'Khoản chi đúng thang duyệt · chi vượt trần = 0' },
  { mien: 'TC_NH', buoc: ['nhapGiaoDichTay', 'khopGiaoDich', 'doiChieuNganHang'], trao: 'TC_THU', kpi: 'Tỉ lệ giao dịch khớp tự động' },
  { mien: 'TC_LUONG', buoc: ['datHeSoLuong', 'bangLuong', 'chotLuong'], trao: 'TC_CHI', kpi: 'Chốt lương đúng hạn · sửa sau chốt = 0' },
  { mien: 'TC_HOAN', buoc: ['deXuatHoan', 'duyetHoan', 'traHoaHong'], trao: 'TC_CHI', kpi: 'Thời gian đề xuất → duyệt' },
  { mien: 'TC_THUE', buoc: ['soatChot', 'chotTuan', 'baoCaoKeToan', 'boSoKhaiThue'], trao: 'P5', kpi: 'Tuần chốt sổ không lỗi' },
  { mien: 'TC_QUYEN', buoc: ['dsQuyenTaiChinh', 'capQuyenTaiChinh'], trao: 'GS', kpi: 'Quyền cấp có lý do · quyền thừa = 0' },
  { mien: 'KH_XEM', buoc: ['soiQuyenXem', 'capQuyenXem', 'xemKhachCao'], trao: 'GS', kpi: 'Lượt xem khách có quyền hợp lệ = 100%' },
  { mien: 'KH_CC', buoc: ['kyChungCu', 'xacNhanChungCu', 'soiChungCu'], trao: 'KH_HS', kpi: 'Chứng cứ có hai bên xác nhận' },
  { mien: 'KH_HS', buoc: ['dsTepKhach', 'xemTepKhach', 'suaTepKhach', 'nangTang'], trao: 'P4', kpi: 'Hồ sơ nâng tầng có chứng cứ' },
  { mien: 'TG', buoc: ['deXuatThiGiac', 'banMoiThiGiac', 'chamThiGiac', 'khoThiGiac', 'xuatTamThiGiac', 'dangTamThiGiac', 'doPheuThiGiac', 'docGopY'], trao: 'P3', kpi: 'Điểm chấm thị giác · tấm gỡ lại (goTamThiGiac)' },
  { mien: 'BN', buoc: ['soatBoNao', 'soatAnDanh', 'guiDeBaiRaNgoai'], trao: 'GS', kpi: 'Lượt ra ngoài bị chặn vì lộ danh tính (phải giảm dần)' },
  { mien: 'P1', buoc: ['lapTheVungManh', 'docTheVungManh', 'loTrinhTuThe', 'soatVungManh'], trao: 'P4', kpi: 'Thẻ vùng mạnh có lộ trình' },
  { mien: 'P2', buoc: ['traLoiCoach', 'soatBanTra'], trao: 'KH_HS', kpi: 'Bản trả qua soát ba chữ ký' },
  { mien: 'P3', buoc: ['soatTiepThi', 'soatBayNhanh'], trao: 'TG', kpi: 'Bài bị trả về vì sai luật thương hiệu' },
  { mien: 'P4', buoc: ['lapSongSinh', 'docSongSinh', 'ghiCham', 'doSoCham'], trao: 'P2', kpi: 'Lượt chạm đúng nhịp' },
  { mien: 'P5', buoc: ['bayConSoCEO', 'soatLuatTaiChinh', 'chamKpiTaiChinh'], trao: 'CEO', kpi: 'Bảy con số CEO cập nhật hằng tuần' },
  { mien: 'P6', buoc: ['lapBaCua', 'docBaCua', 'ghiCua', 'soatBaiTuan'], trao: 'KH_XEM', kpi: 'Người mới qua đủ ba cửa trước khi chạm khách' },
  { mien: 'P7', buoc: ['docTuanThu', 'ghiDongY', 'docDongY', 'yeuCauXoaDuLieu', 'docVungLuatSu'], trao: 'KH_HS', kpi: 'Yêu cầu xoá xử lý đúng hạn luật' },
  { mien: 'CEO', buoc: ['banTinSang', 'docBangDieuKhien', 'soiQuyetDinh', 'ghiQuyetDinh', 'chuanBiVang'], trao: 'P5', kpi: 'Quyết định có ghi lý do và hạn soi lại' },
  { mien: 'PR', buoc: ['ghiLuotPrompt', 'docVongChay'], trao: 'THT', kpi: 'Lượt prompt có ghi kết quả' },
  { mien: 'GIA', buoc: ['docBangGia', 'doiGia', 'soDoiGia'], trao: 'TC_THU', kpi: 'Mọi đổi giá có sổ' },
  { mien: 'NHA', buoc: ['docLuatGiaoDien', 'docHomNay', 'batCheDoBao', 'ghiGhimCon', 'chiaSeCoAnhCon'], trao: 'P4', kpi: 'Chia sẻ ảnh con có đồng ý' },
  { mien: 'GS', buoc: ['capLenhGiamSat', 'docLenhGiamSat', 'soatSoDen', 'docTranGiamSat', 'thuLenhGiamSat'], trao: 'CEO', kpi: 'Lệnh giám sát có hạn và được thu hồi' },
  { mien: 'CH', buoc: ['soatCuuHe'], trao: 'NC', kpi: 'Lỗi cứu hệ phát hiện → đề xuất sửa' },
  { mien: 'THT', buoc: ['ghiPhatSinh', 'soanBanNhap', 'duyetCap', 'nhapKho'], trao: 'NC', kpi: 'Phát sinh → bản nhập kho' },
  { mien: 'NC', buoc: ['deXuatNangCap'], trao: 'GS', kpi: 'Đề xuất qua đủ năm cửa' },
  { mien: 'ND', buoc: ['soatNoiDung', 'xuatChuanNghe'], trao: 'THT', kpi: 'Nội dung nghề đạt chuẩn khi xuất' },
  { mien: 'ST', buoc: ['ghiHoChieuVideo'], trao: 'TG', kpi: 'Video có hộ chiếu nguồn' }
];

/* Tám năng lực chủ hệ đòi ở một Agent — mỗi năng lực TRỎ vào cơ chế thật. */
G.H16_NANG_LUC = [
  { ma: 'VT', ten: 'Vai trò chuyên sâu', co: 'Miền + khoá sở hữu duy nhất (DP_MIEN)' },
  { ma: 'NV', ten: 'Nghiệp vụ chuyên gia', co: 'Cổng riêng theo hồ sơ: tiền · con · ngoài · ba chữ ký' },
  { ma: 'QT', ten: 'Quy trình (SOP)', co: 'H16_SOP — chuỗi cửa thật theo thứ tự' },
  { ma: 'KPI', ten: 'KPI', co: 'Phép đo đọc từ sổ audit (soatHoatDongAgent)' },
  { ma: 'TW', ten: 'Teamwork', co: 'Bàn giao sang miền khác (trao) + agent-team workflow' },
  { ma: 'NC', ten: 'Tự nâng cấp', co: 'Đi qua deXuatNangCap — vòng năm cửa' },
  { ma: 'BV', ten: 'Tự bảo vệ', co: 'Cấp quyền AI + cầu dao khoang + cổng Điều 13' },
  { ma: 'HP', ten: 'Thực thi theo hiến pháp', co: 'Cổng Bộ não trước mọi việc (boNao)' }
];

/* ══ 1000 CHIẾN LƯỢC — 10 mục tiêu × 10 đòn bẩy × 10 phạm vi ══ */
G.H16_CL = {
  mucTieu: [
    { ma: 'M0', ten: 'Chi phí', do: 'USD/tháng · lượt ghi D1/ngày' },
    { ma: 'M1', ten: 'Chất lượng', do: 'lỗi/tuần · điểm chấm' },
    { ma: 'M2', ten: 'Tốc độ', do: 'thời gian phản hồi · thời gian xử lý ca' },
    { ma: 'M3', ten: 'Khác biệt', do: 'năng lực đối thủ không có (đếm được)' },
    { ma: 'M4', ten: 'Giữ chân', do: 'tỉ lệ khách ở lại sau 90 ngày' },
    { ma: 'M5', ten: 'Tăng trưởng', do: 'khách mới/tháng · giới thiệu' },
    { ma: 'M6', ten: 'An toàn', do: 'sự cố lộ dữ liệu = 0 · lượt chặn' },
    { ma: 'M7', ten: 'Tự chủ', do: 'việc tự chạy không cần người · tự chữa thành công' },
    { ma: 'M8', ten: 'Con người', do: 'người qua ba cửa · thời gian đào tạo' },
    { ma: 'M9', ten: 'Tri thức', do: 'tình huống có lời giải · bài học ghi lại' }
  ],
  donBay: [
    { ma: 'L0', ten: 'Loại bỏ', hoi: 'Bước hay khối nào trong {S} có thể bỏ hẳn mà {M} không giảm?' },
    { ma: 'L1', ten: 'Gộp · tinh gọn', hoi: 'Hai việc nào trong {S} đang làm trùng — gộp thì {M} được gì?' },
    { ma: 'L2', ten: 'Tự động hoá', hoi: 'Việc lặp nào trong {S} máy làm được mà vẫn giữ cổng — {M} đổi bao nhiêu?' },
    { ma: 'L3', ten: 'Đo lường', hoi: 'Trong {S}, chỉ số nào cho {M} đang KHÔNG được đo?' },
    { ma: 'L4', ten: 'Chuẩn hoá', hoi: 'Trong {S}, chỗ nào mỗi người làm một kiểu — một khuôn chung nâng {M} ra sao?' },
    { ma: 'L5', ten: 'Cá nhân hoá', hoi: 'Trong {S}, nhóm người dùng nào cần cách riêng để {M} tăng?' },
    { ma: 'L6', ten: 'Tái dùng', hoi: 'Thứ gì đã làm ở hệ khác dùng lại được cho {S} để nâng {M}?' },
    { ma: 'L7', ten: 'Đệm · phân tầng', hoi: 'Trong {S}, phần nào nên đệm, chạy nền hoặc chia tầng thiết bị để nâng {M}?' },
    { ma: 'L8', ten: 'Thử nghiệm', hoi: 'Giả thuyết nào về {M} trong {S} thử nhỏ được trong 2 tuần?' },
    { ma: 'L9', ten: 'Uỷ quyền đúng tầng', hoi: 'Quyết định nào trong {S} đang nằm sai tầng, làm chậm {M}?' }
  ],
  phamVi: [
    { ma: 'S0', ten: 'Quản trị', he: 'H01' }, { ma: 'S1', ten: 'Dữ liệu', he: 'H02' },
    { ma: 'S2', ten: 'Vận hành nội lực', he: 'H03' }, { ma: 'S3', ten: 'Khách hàng', he: 'H04' },
    { ma: 'S4', ten: 'Tài chính', he: 'H05' }, { ma: 'S5', ten: 'Marketing', he: 'H06' },
    { ma: 'S6', ten: 'Pháp lý · hiến pháp', he: 'H07' }, { ma: 'S7', ten: 'Agent', he: 'H08' },
    { ma: 'S8', ten: 'Bộ não · Main tự chủ', he: 'H09' }, { ma: 'S9', ten: 'Mã nguồn · thuê ngoài', he: 'H15' }
  ]
};

/** Sinh chiến lược theo mã CL-mls (m,l,s ∈ 0..9). Tất định — cùng mã, cùng câu. */
G.h16ChienLuoc = function (so) {
  var n = Math.max(0, Math.min(999, Number(so) || 0));
  var m = Math.floor(n / 100), l = Math.floor(n / 10) % 10, s = n % 10;
  var C = G.H16_CL, M = C.mucTieu[m], L = C.donBay[l], S = C.phamVi[s];
  return {
    ma: 'CL-' + m + l + s, so: n, mucTieu: M, donBay: L, phamVi: S,
    cau: L.hoi.replace('{S}', S.ten.toLowerCase()).replace('{M}', M.ten.toLowerCase()),
    do: M.do
  };
};

/* ══ CHU KỲ NGHIÊN CỨU 6 THÁNG ══ */
G.H16_RD = {
  thang: [
    { t: 1, ten: 'Chụp mốc nền', vi: 'Bấm "Chụp mốc" — mọi chỉ số đo được lưu kèm ngày.' },
    { t: 2, ten: 'Chọn 10 giả thuyết', vi: 'Lấy 10 chiến lược ICE cao nhất làm giả thuyết.' },
    { t: 3, ten: 'Thử nhỏ (1)', vi: 'Mỗi giả thuyết một thử nghiệm ≤ 2 tuần, có cờ tắt được.' },
    { t: 4, ten: 'Thử nhỏ (2)', vi: 'Giữ cái thắng, bỏ cái thua — ghi cả hai vào sổ.' },
    { t: 5, ten: 'Đóng gói', vi: 'Cái thắng thành mã, qua cổng PR + deXuatNangCap.' },
    { t: 6, ten: 'So với mốc', vi: 'Tỉ số hiện tại / mốc nền cho từng chỉ số. X10 là hướng, không phải chỉ tiêu.' }
  ]
};

/* ══ CHUẨN GIẢI PHÁP — một khuôn cho năm nhóm, trỏ về thư viện có sẵn ══ */
G.H16_GP = {
  khuon: ['Tình huống', 'Chẩn đoán', 'Giải pháp', 'Kết quả đo được', 'Bài học'],
  nhom: [
    { ma: 'GP-HT', ten: 'Hệ thống', troVao: ['v:soat-day-du', 'v:ra-soat-loi', 'v:noi-may-chu'] },
    { ma: 'GP-KH', ten: 'Khách hàng', troVao: ['v:tinh-huong', 'v:xu-ly-ca', 'v:coach-kh'] },
    { ma: 'GP-NS', ten: 'Nhân sự', troVao: ['v:con-nguoi', 'v:so-tay-van-hanh', 'v:luat-lam-viec'] },
    { ma: 'GP-CG', ten: 'Chuyên gia', troVao: ['v:ban-tu-van', 'v:so-tay-tu-van', 'v:phuong-phap'] },
    { ma: 'GP-DT', ten: 'Đối tác · thuê ngoài', troVao: ['v:ket-noi', 'v:xuong-phim'] }
  ]
};

/* ══ MÃ ĐỊNH DẠNG — mỗi lược đồ một biểu thức, đo trên dữ liệu thật ══ */
G.H16_MA = [
  { ma: 'Vai', mau: '^R\\d{2}$', vd: 'R01', nguon: 'ROLES', lay: function () { return Object.keys(G.ROLES || {}); } },
  { ma: 'Trợ lý', mau: '^TL\\d{3}$', vd: 'TL001', nguon: 'DP_TRO_LY', lay: function () { return (G.DP_TRO_LY || []).map(function (t) { return t.ma; }); } },
  { ma: 'Luật điều phối', mau: '^DP\\d$', vd: 'DP1', nguon: 'DP_TRAN', lay: function () { return (G.DP_TRAN || []).map(function (t) { return t.ma; }); } },
  { ma: 'Hệ', mau: '^H\\d{2}$', vd: 'H01', nguon: 'H16_HE', lay: function () { return G.H16_HE.map(function (t) { return t.ma; }); } },
  { ma: 'Chiến lược', mau: '^CL-\\d{3}$', vd: 'CL-027', nguon: 'h16ChienLuoc', lay: function () { return [0, 499, 999].map(function (n) { return G.h16ChienLuoc(n).ma; }); } },
  { ma: 'Phim cầu nối', mau: '^PCN-', vd: 'PCN-1.10', nguon: 'phim-cau-noi', lay: null },
  { ma: 'Phiên bản', mau: '^\\d+\\.\\d+\\.\\d+$', vd: '9.99.171', nguon: 'sw.js · entete', lay: null },
  { ma: 'Commit', mau: '^(feat|fix|docs|refactor|perf|test|chore|ci)(\\(.+\\))?!?: ', vd: 'feat(agent): SOP miền TC_THU', nguon: 'docs/HE_16_TRU.md', lay: null }
];

/* ══ THANG TỰ CHỦ — "100% tự vận hành bằng AI" đo bằng trần hiến pháp ══
   Một hệ AI chạm vào gia đình và trẻ mà tự quyết 100% là hệ không ai
   dám giao con mình. Khác biệt của GITA không nằm ở chỗ AI làm hết — mà
   ở chỗ máy CHỨNG MINH được AI làm tới đâu và người ký ở đâu. Trần mỗi
   miền do hồ sơ cổng quyết (DP_GATE), không do tham vọng; con số "tỉ lệ
   tự vận hành" là phép đếm trên roster thật. */
G.H16_TU_CHU = {
  bac: [
    { ma: 'TC0', ten: 'Người làm', vi: 'Máy chỉ ghi sổ.' },
    { ma: 'TC1', ten: 'AI gợi ý', vi: 'AI đưa phương án, người chọn và làm.' },
    { ma: 'TC2', ten: 'AI soạn · người duyệt', vi: 'AI làm bản đủ; một người có thẩm quyền duyệt từng việc.' },
    { ma: 'TC3', ten: 'AI làm · máy soát · người ký', vi: 'AI làm, bộ soát máy chặn lỗi, người ký trước khi ra khách/ra ngoài.' },
    { ma: 'TC4', ten: 'AI tự vận hành · người soát mẫu', vi: 'AI tự chạy trọn; người soát ngẫu nhiên, cầu dao tự ngắt khi lệch.' },
    { ma: 'TC5', ten: 'Tự chủ hoàn toàn', vi: 'Không người. GITA KHÔNG mở bậc này cho việc chạm tiền, trẻ hay khách — Điều 13.' }
  ],
  tran: { chung: 'TC4', duyet3: 'TC3', ngoai: 'TC3', tien: 'TC2', con: 'TC2' },
  vi: { chung: 'Việc nội bộ, không chạm tiền/trẻ/ra ngoài', duyet3: 'Nội dung ra khách — ba chữ ký', ngoai: 'Dữ liệu rời hệ — ẩn danh trước',
    tien: 'Tiền — thang duyệt chi R01–R03', con: 'Dữ liệu gia đình/trẻ — Điều 13 + nhật ký đọc' }
};
/** Đếm trên roster thật: bao nhiêu cửa ở mỗi bậc trần, và tỉ lệ AI tự chạy trọn (TC4). */
G.h16TuChu = function () {
  var dem = {}, tong = 0, mien = {};
  (G.DP_MIEN || []).forEach(function (m) { mien[m.ma] = m.profile; });
  (G.DP_TRO_LY || []).forEach(function (t) {
    var b = G.H16_TU_CHU.tran[mien[t.mien]] || 'TC1';
    dem[b] = (dem[b] || 0) + 1; tong++;
  });
  var aiLam = (dem.TC4 || 0) + (dem.TC3 || 0) + (dem.TC2 || 0);
  return { dem: dem, tong: tong,
    tuChayTron: tong ? Math.round(100 * (dem.TC4 || 0) / tong) : 0,
    aiLamPhan: tong ? Math.round(100 * aiLam / tong) : 0 };
};

/* ══ KHO REPO GITHUB — đã nghiên cứu, mỗi repo một phán quyết ══
   cach: goc = dịch vụ gốc Cloudflare/GitHub bật được ngay (0đ) ·
         ci = chỉ chạy ở CI · ph = phụ thuộc nhỏ, giấy phép thoáng (đợt kế) ·
         mau = chỉ học mẫu · may = tuỳ chọn tự chạy trên máy Windows ·
         cam = không tích hợp (giấy phép/kiến trúc). */
G.H16_REPO = [
  { he: 'H15', repo: 'github/codeql-action', lic: 'MIT', cach: 'ci', vi: 'Quét lỗ hổng JS — ĐÃ BẬT (codeql.yml).' },
  { he: 'H15', repo: 'ossf/scorecard', lic: 'Apache-2.0', cach: 'ci', vi: 'Chấm an toàn chuỗi cung ứng — ĐÃ BẬT (scorecard.yml).' },
  { he: 'H15', repo: 'dependabot (GitHub)', lic: '—', cach: 'ci', vi: 'Cập nhật Actions hằng tuần — ĐÃ BẬT.' },
  { he: 'H15', repo: 'googleapis/release-please', lic: 'Apache-2.0', cach: 'ci', vi: 'CHANGELOG + thẻ phiên bản từ commit quy ước — bật sau khi đội quen quy ước commit.' },
  { he: 'H02', repo: 'lucaong/minisearch', lic: 'MIT', cach: 'ph', vi: 'Tìm toàn văn trên dữ liệu đã giải mã, ~6 KB; cần thử tách từ tiếng Việt (bỏ dấu) trước.' },
  { he: 'H02', repo: 'yjs/yjs', lic: 'MIT', cach: 'mau', vi: 'CRDT — học mẫu hợp nhất ngoại tuyến; đồng bộ hiện dùng etag + tự chữa là đủ ở 0đ.' },
  { he: 'H02', repo: 'D1 Time Travel', lic: 'Cloudflare', cach: 'goc', vi: 'Khôi phục D1 về bất kỳ phút nào trong 30 ngày — có sẵn, 0đ.' },
  { he: 'H01', repo: 'stalniy/casl', lic: 'MIT', cach: 'mau', vi: 'Mẫu luật can/cannot có điều kiện cho ABAC.' },
  { he: 'H07', repo: 'open-policy-agent/opa', lic: 'Apache-2.0', cach: 'mau', vi: 'Luật-thành-mã: tách quyết định khỏi thực thi.' },
  { he: 'H07', repo: 'CacheControl/json-rules-engine', lic: 'ISC', cach: 'ph', vi: 'Luật JSON chạy được ở trình duyệt và Worker — cho chọn giải pháp/chiến lược.' },
  { he: 'H08', repo: 'cloudflare/agents', lic: 'MIT', cach: 'ph', vi: 'Agent bền trên Durable Objects (trạng thái, lịch, MCP) — khi cần agent chạy nền.' },
  { he: 'H08', repo: 'openai/openai-agents-js', lic: 'MIT', cach: 'mau', vi: 'Mẫu handoff + guardrail vào/ra; đã ánh xạ vào SOP + trao + cổng.' },
  { he: 'H08', repo: 'crewAIInc/crewAI', lic: 'MIT', cach: 'mau', vi: 'Vai–mục tiêu–đội (Python) — học mẫu vai/KPI/teamwork.' },
  { he: 'H08', repo: 'guardrails-ai/guardrails', lic: 'Apache-2.0', cach: 'mau', vi: 'Chuỗi kiểm vào/ra — GITA đã có soatAnDanh + soatBoNao.' },
  { he: 'H08', repo: 'Workers AI', lic: 'Cloudflare', cach: 'goc', vi: 'Suy luận trong vùng Cloudflare, 10.000 neuron/ngày miễn phí.' },
  { he: 'H09', repo: 'Cloudflare Workflows', lic: 'Cloudflare', cach: 'goc', vi: 'Bước bền, tự thử lại — sổ lệnh Bộ não khi vượt cron.' },
  { he: 'H09', repo: 'statelyai/xstate', lic: 'MIT', cach: 'mau', vi: 'Máy trạng thái cho vòng đời lệnh.' },
  { he: 'H03', repo: 'connor4312/cockatiel', lic: 'MIT', cach: 'mau', vi: 'Thử lại/cầu dao/vách ngăn — đã hiện thực trong khoang.js + goiMayChu.' },
  { he: 'H03', repo: 'restic/restic', lic: 'BSD-2', cach: 'may', vi: 'Sao lưu mã hoá R2 → máy Windows (Task Scheduler), 0đ.' },
  { he: 'H06', repo: 'Cloudflare Web Analytics', lic: 'Cloudflare', cach: 'goc', vi: 'Đếm truy cập không cookie, 0đ, không tốn lượt Worker.' },
  { he: 'H11', repo: 'open-circle/valibot', lic: 'MIT', cach: 'ph', vi: 'Kiểm dữ liệu webhook đối tác, tree-shake < 2 KB.' },
  { he: 'H11', repo: 'standard-webhooks', lic: 'MIT', cach: 'mau', vi: 'Ký HMAC webhook theo chuẩn chung.' },
  { he: 'H12', repo: 'Cloudflare Vectorize', lic: 'Cloudflare', cach: 'goc', vi: 'Tìm "ca tương tự" theo nghĩa — chỉ trên ca đã ẩn danh.' },
  { he: 'H13', repo: 'open-feature/js-sdk', lic: 'Apache-2.0', cach: 'mau', vi: 'Hình dạng API cờ tính năng cho thử nghiệm R&D.' },
  { he: 'H14', repo: 'graphology/graphology', lic: 'MIT', cach: 'ph', vi: 'Đồ thị chiến lược ↔ hệ ↔ chỉ số khi cần liên kết chéo.' },
  { he: 'H04', repo: 'twentyhq/twenty', lic: 'AGPL-3.0', cach: 'cam', vi: 'AGPL — chỉ tham khảo mô hình dữ liệu, không chép mã.' },
  { he: 'H05', repo: 'bigcapitalhq/bigcapital', lic: 'AGPL-3.0', cach: 'cam', vi: 'AGPL — kế toán kép tự viết trên D1.' },
  { he: 'H13', repo: 'Unleash/unleash', lic: 'AGPL-3.0 (v8+)', cach: 'cam', vi: 'AGPL từ v8 — không fork.' },
  { he: 'H06', repo: 'nodemailer/nodemailer', lic: 'MIT-0', cach: 'cam', vi: 'Cần socket TCP — không chạy trên Workers.' }
];
G.H16_CACH = { goc: 'Gốc Cloudflare/GitHub · bật 0đ', ci: 'CI', ph: 'Phụ thuộc nhỏ (đợt kế)', mau: 'Học mẫu', may: 'Tự chạy trên Windows', cam: 'Không tích hợp' };

/* ══ ĐO SỐNG — con trỏ v:/g: kiểm ở máy khách; f:/d:/t: kiểm ở CI ══ */
G.h16DoTro = function (tro) {
  var k = tro.slice(0, 2), ten = tro.slice(2);
  if (k === 'v:') return { tro: tro, song: !!(G.VIEWS && G.VIEWS[ten]), noi: 'may' };
  if (k === 'g:') return { tro: tro, song: typeof G[ten] !== 'undefined', noi: 'may' };
  return { tro: tro, song: null, noi: 'ci' };
};
G.h16DoHe = function (he) {
  var kq = he.troVao.map(G.h16DoTro);
  var may = kq.filter(function (x) { return x.noi === 'may'; });
  var song = may.filter(function (x) { return x.song; }).length;
  return { ma: he.ma, kq: kq, may: may.length, song: song, ci: kq.length - may.length,
    gay: may.filter(function (x) { return !x.song; }).map(function (x) { return x.tro; }) };
};

/** Ma trận 8 năng lực cho từng miền — tính từ roster thật + SOP + sổ audit nếu đã nạp. */
G.h16MaTranAgent = function (soAudit) {
  var tl = G.DP_TRO_LY || [], sop = {}, demCua = {};
  G.H16_SOP.forEach(function (s) { sop[s.mien] = s; });
  ((soAudit && soAudit.theoCua) || []).forEach(function (r) { demCua[r.cua] = r.n; });
  return (G.DP_MIEN || []).map(function (m) {
    var cua = tl.filter(function (t) { return t.mien === m.ma; });
    var s = sop[m.ma], qua = {};
    cua.forEach(function (t) { (t.qua || []).forEach(function (g) { qua[g] = 1; }); });
    var luot = null;
    if (soAudit && soAudit.ok) luot = cua.reduce(function (a, t) { return a + (demCua[t.phucVu] || 0); }, 0);
    return {
      mien: m.ma, ten: m.ten, so: cua.length, sop: s || null, luot: luot,
      VT: cua.length > 0,
      NV: m.profile !== 'chung',
      QT: !!(s && s.buoc.length),
      KPI: !!(s && s.kpi),
      TW: !!(s && s.trao),
      NC: cua.length > 0 && cua.every(function (t) { return t.tuHoanThien; }),
      BV: !!qua.aiCoQuyen,
      HP: !!qua.boNao
    };
  });
};

/** Chỉ số đo được cho mốc nền R&D — mỗi chỉ số đếm từ thứ có thật. */
G.h16ChiSo = function () {
  var song = 0, may = 0;
  G.H16_HE.forEach(function (he) { var d = G.h16DoHe(he); song += d.song; may += d.may; });
  var mt = G.h16MaTranAgent(null), du8 = mt.filter(function (r) {
    return G.H16_NANG_LUC.every(function (n) { return r[n.ma]; });
  }).length;
  var ice = G.h16DocIce(), cham = 0, chung = 0;
  Object.keys(ice).forEach(function (k) { if (ice[k].i) cham++; if (ice[k].bc) chung++; });
  return {
    manSong: Object.keys(G.VIEWS || {}).length,
    troSong: song, troTong: may,
    troLy: (G.DP_TRO_LY || []).length,
    mienDu8: du8, mienTong: mt.length,
    sop: G.H16_SOP.length,
    clCham: cham, clChung: chung,
    gpCa: G.h16DocCa().length,
    tuChayTron: G.h16TuChu().tuChayTron
  };
};
G.H16_CHI_SO_TEN = {
  manSong: 'Màn đang chạy', troSong: 'Con trỏ hệ còn sống', troLy: 'Trợ lý trong roster',
  mienDu8: 'Miền đủ 8 năng lực', sop: 'Quy trình SOP', clCham: 'Chiến lược đã chấm ICE',
  clChung: 'Chiến lược có bằng chứng', gpCa: 'Ca giải pháp đã ghi', tuChayTron: '% cửa AI tự chạy trọn (TC4)'
};

/* ══ Lưu cục bộ (không đi máy chủ — không tốn lượt ghi D1) ══ */
function h16Doc(k, mac) {
  try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : mac; } catch (e) { return mac; }
}
function h16Ghi(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* đầy bộ nhớ */ } }
G.h16DocIce = function () { return h16Doc('gita_h16_ice', {}); };
G.h16DocCa = function () { return h16Doc('gita_h16_ca', []); };
G.h16DocMoc = function () { return h16Doc('gita_h16_moc', null); };

(function () {
  var U = G.U, h = U.h, ic = U.ic;
  var NGAN = [
    { ma: 'he', ten: '16 hệ', ic: 'grid' },
    { ma: 'tuchu', ten: 'Thang tự chủ AI', ic: 'pulse' },
    { ma: 'agent', ten: 'Agent 8 năng lực', ic: 'orbit' },
    { ma: 'cl', ten: '1000 chiến lược', ic: 'list' },
    { ma: 'rd', ten: 'R&D 6 tháng', ic: 'spark' },
    { ma: 'gp', ten: 'Giải pháp', ic: 'check' },
    { ma: 'ma', ten: 'Mã nguồn · mã định dạng', ic: 'lock' },
    { ma: 'repo', ten: 'Repo GitHub', ic: 'list' }
  ];

  function veTuChu() {
    var T = G.H16_TU_CHU, d = G.h16TuChu(), o = '';
    if (U.bdSoHang) o += U.bdSoHang([
      { k: 'Cửa có trợ lý', v: String(d.tong), c: 'var(--gita)' },
      { k: 'AI làm (TC2–TC4)', v: d.aiLamPhan + '%', c: 'var(--ok)', d: 'AI làm phần việc chính' },
      { k: 'AI tự chạy trọn (TC4)', v: d.tuChayTron + '%', c: 'var(--gold-2)', d: 'người chỉ soát mẫu' },
      { k: 'Bậc TC5 mở cho tiền/trẻ/khách', v: 'KHÔNG', c: 'var(--gita-do)', d: 'Điều 13' }
    ]);
    o += '<div class="card mt"><b>Vì sao không phải "100% AI tự quyết"</b><div class="sm mt">Một hệ AI chạm vào gia đình và trẻ mà tự quyết hết là hệ không ai dám giao con mình. ' +
      'Khác biệt của GITA: <b>máy chứng minh AI làm tới đâu và người ký ở đâu</b> — mỗi cửa có trần tự chủ theo hiến pháp, đếm được, kiểm được. ' +
      'Đối thủ nói "AI làm hết"; GITA đưa ra được bảng này.</div></div>';
    o += '<div class="card mt"><table class="tbl sm"><tr><th>Bậc</th><th>Ý nghĩa</th><th>Số cửa</th></tr>';
    T.bac.forEach(function (b) {
      o += '<tr><td class="mono"><b>' + b.ma + '</b> ' + h(b.ten) + '</td><td>' + h(b.vi) + '</td><td>' + (d.dem[b.ma] || 0) + '</td></tr>';
    });
    o += '</table></div><div class="card mt"><b>Trần theo hồ sơ cổng</b><div class="sm mt">' + Object.keys(T.tran).map(function (k) {
      return '<span class="mono">' + h(k) + '</span> → <b>' + T.tran[k] + '</b> — ' + h(T.vi[k]);
    }).join('<br>') + '</div><div class="tiny muted mt">Nâng trần một miền = đổi hồ sơ cổng trong dieu-phoi.js — đi qua deXuatNangCap, không đổi ở màn này.</div></div>';
    return o;
  }

  function veRepo() {
    var o = '<div class="card mt"><b>' + G.H16_REPO.length + ' repo/dịch vụ đã nghiên cứu</b> <span class="tiny muted">— mỗi cái một phán quyết theo giấy phép, chi phí 0đ và giới hạn 10ms CPU của Worker.</span></div>';
    Object.keys(G.H16_CACH).forEach(function (c) {
      var ds = G.H16_REPO.filter(function (r) { return r.cach === c; });
      if (!ds.length) return;
      o += '<div class="card mt" style="border-left:3px solid ' + (c === 'cam' ? 'var(--gita-do)' : 'var(--gita)') + '"><b>' + h(G.H16_CACH[c]) + '</b> <span class="chip">' + ds.length + '</span>' +
        ds.map(function (r) {
          return '<div class="sm mt"><span class="mono">' + h(r.he) + '</span> <b>' + h(r.repo) + '</b> <span class="tiny muted">' + h(r.lic) + '</span> — ' + h(r.vi) + '</div>';
        }).join('') + '</div>';
    });
    return o;
  }
  G.h16Ngan = G.h16Ngan || 'he';
  G.h16Loc = G.h16Loc || { m: '', l: '', s: '', trang: 0 };
  G.h16Audit = G.h16Audit || null;

  function veLai() { if (G.S && G.S.view === 'he-16' && G.render) G.render(); }
  G.h16MoNgan = function (ma) { G.h16Ngan = ma; veLai(); };
  G.h16DatLoc = function (k, v) { G.h16Loc[k] = v; if (k !== 'trang') G.h16Loc.trang = 0; veLai(); };

  G.h16TaiKpi = function () {
    if (!G.goiMayChu) { U.toast('Chưa nối máy chủ.', 'err'); return; }
    G.goiMayChu('soatHoatDongAgent', { coMoi: 10 }).then(function (x) {
      G.h16Audit = x; if (!(x && x.ok)) U.toast((x && x.error) || 'Không đọc được sổ.', 'err'); veLai();
    });
  };

  G.h16Cham = function (so) {
    var c = G.h16ChienLuoc(so), ice = G.h16DocIce(), cu = ice[c.ma] || {};
    if (typeof prompt !== 'function') return;
    var s = prompt(c.ma + ' — chấm I,C,E (1–10), cách nhau dấu phẩy:', [cu.i || '', cu.c || '', cu.e || ''].join(','));
    if (s === null) return;
    var p = s.split(',').map(function (x) { return Math.max(1, Math.min(10, parseInt(x, 10) || 0)); });
    if (p.length < 3 || p.some(isNaN)) { U.toast('Cần ba số 1–10.', 'err'); return; }
    ice[c.ma] = { i: p[0], c: p[1], e: p[2], bc: cu.bc || '' };
    h16Ghi('gita_h16_ice', ice); veLai();
  };
  G.h16BangChung = function (so) {
    var c = G.h16ChienLuoc(so), ice = G.h16DocIce(), cu = ice[c.ma] || {};
    if (typeof prompt !== 'function') return;
    var s = prompt(c.ma + ' — bằng chứng đo được (để trống = gỡ):', cu.bc || '');
    if (s === null) return;
    cu.bc = String(s).trim().slice(0, 300); ice[c.ma] = cu;
    h16Ghi('gita_h16_ice', ice); veLai();
  };
  G.h16ChupMoc = function () {
    if (G.h16DocMoc() && typeof confirm === 'function' && !confirm('Ghi đè mốc nền cũ?')) return;
    h16Ghi('gita_h16_moc', { luc: new Date().toISOString(), so: G.h16ChiSo() });
    U.toast('Đã chụp mốc nền.', 'ok'); veLai();
  };
  G.h16GhiCa = function () {
    if (typeof prompt !== 'function') return;
    var nhom = prompt('Nhóm (GP-HT, GP-KH, GP-NS, GP-CG, GP-DT):', 'GP-KH');
    if (!nhom) return;
    var ca = { nhom: nhom.trim().toUpperCase(), luc: new Date().toISOString() };
    for (var i = 0; i < G.H16_GP.khuon.length; i++) {
      var v = prompt(G.H16_GP.khuon[i] + ' (không ghi tên khách/tên trẻ):', '');
      if (v === null) return;
      ca['k' + i] = String(v).slice(0, 400);
    }
    var ds = G.h16DocCa(); ds.unshift(ca); h16Ghi('gita_h16_ca', ds.slice(0, 500)); veLai();
  };
  G.h16Xuat = function () {
    var goi = { phienBan: 1, luc: new Date().toISOString(), ice: G.h16DocIce(), ca: G.h16DocCa(), moc: G.h16DocMoc(), chiSo: G.h16ChiSo() };
    var s = JSON.stringify(goi, null, 1);
    if (navigator.clipboard) navigator.clipboard.writeText(s).then(function () { U.toast('Đã chép gói JSON.', 'ok'); });
  };

  function nut(ma, nhan, cls) {
    return '<button class="btn ' + (cls || 'ghost') + '" onclick="' + ma + '">' + nhan + '</button>';
  }

  function veHe() {
    var o = '', tongSong = 0, tongMay = 0, tongCi = 0;
    var ds = G.H16_HE.map(function (he) { var d = G.h16DoHe(he); tongSong += d.song; tongMay += d.may; tongCi += d.ci; return [he, d]; });
    if (U.bdSoHang) o += U.bdSoHang([
      { k: 'Hệ', v: String(G.H16_HE.length), c: 'var(--gita)' },
      { k: 'Con trỏ sống (máy)', v: tongSong + '/' + tongMay, c: tongSong === tongMay ? 'var(--ok)' : 'var(--gita-do)' },
      { k: 'Con trỏ CI kiểm', v: String(tongCi), c: 'var(--gita-sau)', d: 'cửa · tài liệu · công cụ' },
      { k: 'Màn đang chạy', v: String(Object.keys(G.VIEWS || {}).length), c: 'var(--gold-2)' }
    ]);
    ds.forEach(function (p) {
      var he = p[0], d = p[1], tot = d.gay.length === 0;
      o += '<div class="card mt" style="border-left:3px solid ' + (tot ? 'var(--ok)' : 'var(--gita-do)') + '">' +
        '<div class="row" style="gap:8px;align-items:center;flex-wrap:wrap">' + ic(he.ic, 'w-4 h-4') +
        '<b>' + h(he.ma + ' · ' + he.ten) + '</b><span class="chip">' + d.song + '/' + d.may + ' sống</span>' +
        (d.ci ? '<span class="chip">' + d.ci + ' CI kiểm</span>' : '') + '</div>' +
        '<div class="tiny mt">' + d.kq.map(function (x) {
          var mau = x.song === null ? 'var(--line)' : (x.song ? 'var(--ok)' : 'var(--gita-do)');
          var go = x.tro.slice(0, 2) === 'v:' && x.song ? ' onclick="G.go(\'' + x.tro.slice(2) + '\')" style="cursor:pointer;border:1px solid ' + mau + '"' : ' style="border:1px solid ' + mau + '"';
          return '<span class="chip mono"' + go + '>' + h(x.tro) + '</span>';
        }).join(' ') + '</div>' +
        '<div class="sm mt"><b>Khoảng trống thật:</b> ' + h(he.trong) + '</div>' +
        '<div class="sm muted"><b>Bước kế:</b> ' + h(he.ke) + '</div></div>';
    });
    return o;
  }

  function veAgent() {
    var mt = G.h16MaTranAgent(G.h16Audit), nl = G.H16_NANG_LUC;
    var du = mt.filter(function (r) { return nl.every(function (n) { return r[n.ma]; }); }).length;
    var o = '<div class="card mt"><b>Tám năng lực — mỗi ô tính từ cơ chế thật, không tự khai</b><div class="tiny muted mt">' +
      nl.map(function (n) { return '<b>' + n.ma + '</b> ' + h(n.ten) + ' — ' + h(n.co); }).join('<br>') + '</div>' +
      '<div class="row mt" style="gap:8px;flex-wrap:wrap">' +
      nut('G.h16TaiKpi()', ic('pulse', 'w-4 h-4') + 'Nạp KPI từ sổ audit', 'pri') +
      '<span class="chip">' + du + '/' + mt.length + ' miền đủ 8</span>' +
      (G.h16Audit && G.h16Audit.ok ? '<span class="chip">Sổ: ' + G.h16Audit.tong + ' lượt (top 20 cửa)</span>' : '') +
      '</div></div>';
    o += '<div class="card mt" style="overflow-x:auto"><table class="tbl sm"><tr><th>Miền</th><th>Trợ lý</th>' +
      nl.map(function (n) { return '<th title="' + h(n.ten) + '">' + n.ma + '</th>'; }).join('') + '<th>Lượt</th></tr>';
    mt.forEach(function (r) {
      o += '<tr><td><b class="mono">' + h(r.mien) + '</b> ' + h(r.ten) + '</td><td>' + r.so + '</td>' +
        nl.map(function (n) { return '<td style="color:' + (r[n.ma] ? 'var(--ok)' : 'var(--gita-do)') + '">' + (r[n.ma] ? '✓' : '·') + '</td>'; }).join('') +
        '<td>' + (r.luot === null ? '—' : r.luot) + '</td></tr>';
    });
    o += '</table><div class="tiny muted mt">NV "·" = miền chỉ qua cổng chung (Bộ não + cấp quyền AI) — đúng thiết kế, không phải lỗi.</div></div>';
    G.H16_SOP.forEach(function (s) {
      o += '<div class="card mt"><b class="mono">' + h(s.mien) + '</b> <span class="tiny muted">→ bàn giao ' + h(s.trao) + '</span>' +
        '<div class="sm mt">' + s.buoc.map(function (b, i) { return (i + 1) + '. <span class="mono">' + h(b) + '</span>'; }).join(' → ') + '</div>' +
        '<div class="tiny muted">KPI: ' + h(s.kpi) + '</div></div>';
    });
    return o;
  }

  function veCl() {
    var C = G.H16_CL, L = G.h16Loc, ice = G.h16DocIce(), o = '';
    function chon(k, ds) {
      return '<select onchange="G.h16DatLoc(\'' + k + '\',this.value)"><option value="">— tất cả —</option>' +
        ds.map(function (x, i) { return '<option value="' + i + '"' + (String(L[k]) === String(i) ? ' selected' : '') + '>' + h(x.ma + ' ' + x.ten) + '</option>'; }).join('') + '</select>';
    }
    o += '<div class="card mt"><b>Không gian 1000 chiến lược</b> <span class="tiny muted">— 1000 câu hỏi có mã. Đề xuất cho tới khi có bằng chứng.</span>' +
      '<div class="row mt" style="gap:8px;flex-wrap:wrap">' + chon('m', C.mucTieu) + chon('l', C.donBay) + chon('s', C.phamVi) +
      nut('G.h16DatLoc(\'m\',\'top\')', 'Xếp theo ICE') + nut('G.h16Xuat()', 'Chép gói JSON') + '</div></div>';
    var ds = [];
    if (L.m === 'top') {
      Object.keys(ice).forEach(function (k) {
        var n = parseInt(k.slice(3), 10), x = ice[k];
        if (x.i) ds.push({ so: n, d: x.i * x.c * x.e });
      });
      ds.sort(function (a, b) { return b.d - a.d; });
      ds = ds.map(function (x) { return x.so; });
    } else {
      for (var n = 0; n < 1000; n++) {
        var m = Math.floor(n / 100), l = Math.floor(n / 10) % 10, s = n % 10;
        if (L.m !== '' && +L.m !== m) continue;
        if (L.l !== '' && +L.l !== l) continue;
        if (L.s !== '' && +L.s !== s) continue;
        ds.push(n);
      }
    }
    var trang = L.trang || 0, co = 25, tong = ds.length;
    o += '<div class="tiny muted mt">' + tong + ' chiến lược khớp · trang ' + (trang + 1) + '/' + Math.max(1, Math.ceil(tong / co)) + '</div>';
    ds.slice(trang * co, trang * co + co).forEach(function (n) {
      var c = G.h16ChienLuoc(n), x = ice[c.ma] || {};
      var diem = x.i ? x.i * x.c * x.e : null;
      o += '<div class="card mt" style="border-left:3px solid ' + (x.bc ? 'var(--ok)' : (diem ? 'var(--gold-2)' : 'var(--line)')) + '">' +
        '<div class="row" style="gap:8px;flex-wrap:wrap;align-items:center"><b class="mono">' + c.ma + '</b>' +
        '<span class="chip">' + h(c.mucTieu.ten) + '</span><span class="chip">' + h(c.donBay.ten) + '</span><span class="chip">' + h(c.phamVi.ten) + '</span>' +
        '<span class="chip">' + (x.bc ? 'đã chứng minh' : 'đề xuất') + '</span>' + (diem ? '<span class="chip">ICE ' + diem + '</span>' : '') + '</div>' +
        '<div class="sm mt">' + h(c.cau) + '</div><div class="tiny muted">Đo bằng: ' + h(c.do) + (x.bc ? ' · Bằng chứng: ' + h(x.bc) : '') + '</div>' +
        '<div class="row mt" style="gap:6px">' + nut('G.h16Cham(' + n + ')', 'Chấm ICE') + nut('G.h16BangChung(' + n + ')', 'Bằng chứng') +
        nut('G.go(\'he-16\');G.h16Ngan=\'he\'', 'Xem hệ ' + c.phamVi.he) + '</div></div>';
    });
    o += '<div class="row mt" style="gap:8px">' +
      (trang > 0 ? nut('G.h16DatLoc(\'trang\',' + (trang - 1) + ')', '‹ Trước') : '') +
      ((trang + 1) * co < tong ? nut('G.h16DatLoc(\'trang\',' + (trang + 1) + ')', 'Sau ›') : '') + '</div>';
    return o;
  }

  function veRd() {
    var moc = G.h16DocMoc(), nay = G.h16ChiSo(), T = G.H16_CHI_SO_TEN, o = '';
    o += '<div class="card mt"><b>Chu kỳ 6 tháng</b><div class="sm mt">' + G.H16_RD.thang.map(function (t) {
      return '<b>Tháng ' + t.t + ' · ' + h(t.ten) + '</b> — ' + h(t.vi);
    }).join('<br>') + '</div><div class="row mt" style="gap:8px">' + nut('G.h16ChupMoc()', ic('check', 'w-4 h-4') + 'Chụp mốc nền', 'pri') +
      nut('G.h16Xuat()', 'Chép gói JSON') + '</div></div>';
    o += '<div class="card mt"><b>So với mốc</b> <span class="tiny muted">' + (moc ? 'mốc ' + h(moc.luc.slice(0, 10)) : 'chưa chụp mốc') +
      ' · X10 là HƯỚNG (DP5), không phải chỉ tiêu</span><table class="tbl sm mt"><tr><th>Chỉ số</th><th>Mốc</th><th>Nay</th><th>Tỉ số</th></tr>';
    Object.keys(T).forEach(function (k) {
      var a = moc ? moc.so[k] : null, b = nay[k];
      var ts = a ? (b / a).toFixed(2) + '×' : '—';
      o += '<tr><td>' + h(T[k]) + '</td><td>' + (a === null || a === undefined ? '—' : a) + '</td><td>' + b + '</td><td>' + ts + '</td></tr>';
    });
    return o + '</table></div>';
  }

  function veGp() {
    var ds = G.h16DocCa(), o = '<div class="card mt"><b>Một khuôn cho mọi giải pháp</b><div class="sm mt">' +
      G.H16_GP.khuon.map(function (k, i) { return (i + 1) + '. ' + h(k); }).join(' → ') + '</div>' +
      '<div class="row mt" style="gap:8px">' + nut('G.h16GhiCa()', ic('check', 'w-4 h-4') + 'Ghi một ca', 'pri') +
      '<span class="chip">' + ds.length + ' ca (lưu trên máy này)</span></div></div>';
    G.H16_GP.nhom.forEach(function (n) {
      var cua = ds.filter(function (c) { return c.nhom === n.ma; }).length;
      o += '<div class="card mt"><b class="mono">' + h(n.ma) + '</b> ' + h(n.ten) + ' <span class="chip">' + cua + ' ca</span><div class="tiny mt">Thư viện có sẵn: ' +
        n.troVao.map(function (t) { var d = G.h16DoTro(t); return d.song ? '<a href="#" onclick="G.go(\'' + t.slice(2) + '\');return false">' + h(t.slice(2)) + '</a>' : h(t.slice(2)) + ' (thiếu)'; }).join(' · ') + '</div></div>';
    });
    ds.slice(0, 20).forEach(function (c) {
      o += '<div class="card mt"><b class="mono">' + h(c.nhom) + '</b> <span class="tiny muted">' + h((c.luc || '').slice(0, 10)) + '</span><div class="sm mt">' +
        G.H16_GP.khuon.map(function (k, i) { return '<b>' + h(k) + ':</b> ' + h(c['k' + i] || ''); }).join('<br>') + '</div></div>';
    });
    return o;
  }

  function veMa() {
    var o = '<div class="card mt"><b>Lược đồ mã — đo trên dữ liệu thật đang chạy</b><table class="tbl sm mt"><tr><th>Loại</th><th>Mẫu</th><th>Ví dụ</th><th>Nguồn</th><th>Đo</th></tr>';
    G.H16_MA.forEach(function (x) {
      var kq = '—';
      if (x.lay) {
        var ds = x.lay(), re = new RegExp(x.mau), sai = ds.filter(function (v) { return !re.test(v); });
        kq = sai.length ? '<span style="color:var(--gita-do)">' + sai.length + '/' + ds.length + ' sai: ' + h(sai.slice(0, 3).join(', ')) + '</span>' :
          '<span style="color:var(--ok)">' + ds.length + ' đúng</span>';
      }
      o += '<tr><td>' + h(x.ma) + '</td><td class="mono">' + h(x.mau) + '</td><td class="mono">' + h(x.vd) + '</td><td>' + h(x.nguon) + '</td><td>' + kq + '</td></tr>';
    });
    o += '</table></div><div class="card mt"><b>Cổng mã nguồn</b><div class="sm mt">' +
      '· <b>kiem-tra.yml</b> — mỗi PR: ghép bundle khớp nguồn, cú pháp Worker, rà soát đầy đủ, thử CORS, thử đồng bộ/tự chữa, đo 16 hệ.<br>' +
      '· <b>codeql.yml</b> — quét lỗ hổng JavaScript (miễn phí cho repo công khai).<br>' +
      '· <b>scorecard.yml</b> — OpenSSF Scorecard chấm độ an toàn chuỗi cung ứng.<br>' +
      '· <b>dependabot.yml</b> — cập nhật GitHub Actions hằng tuần.<br>' +
      '· <b>CODEOWNERS</b> — may-chu/, .github/, tools/ phải chủ hệ duyệt.</div></div>';
    return o;
  }

  G.VIEWS['he-16'] = function () {
    var o = '<div class="hd"><h2>' + ic('grid') + ' 16 hệ thống GITA365</h2><p class="sub">Mỗi hệ <b>trỏ</b> vào thứ đang chạy thật, ' +
      'được <b>đo</b> chứ không tự khai. Agent đọc thẳng roster 100 trợ lý; chiến lược có mã; X10 so với mốc nền sau mỗi 6 tháng.</p></div>';
    o += '<div class="row" style="gap:6px;flex-wrap:wrap">' + NGAN.map(function (n) {
      return '<button class="btn ' + (G.h16Ngan === n.ma ? 'pri' : 'ghost') + '" onclick="G.h16MoNgan(\'' + n.ma + '\')">' + ic(n.ic, 'w-4 h-4') + h(n.ten) + '</button>';
    }).join('') + '</div>';
    var f = { he: veHe, tuchu: veTuChu, agent: veAgent, cl: veCl, rd: veRd, gp: veGp, ma: veMa, repo: veRepo }[G.h16Ngan] || veHe;
    return o + f();
  };
})();
