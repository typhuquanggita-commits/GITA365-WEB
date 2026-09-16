/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v7.1 — KHO KHOÁ
   Nội dung chuyên môn của GITA 365 là tài sản có bản quyền. Nó không
   nằm trong ứng dụng dưới dạng đọc được: mỗi gói được mã hoá AES-256-GCM
   và chỉ mở ra khi máy chủ cấp khoá cho đúng vai, đúng tầng, đúng phiên.

   Ba tầng bảo vệ:
     1. Tệp .enc không đọc được nếu không có khoá.
     2. Khoá do máy chủ cấp sau khi đăng nhập, theo phạm vi được cấp phép,
        có hạn dùng. Khoá không bao giờ nằm trong mã nguồn.
     3. Nội dung sau khi giải mã chỉ tồn tại trong bộ nhớ phiên làm việc —
        không ghi ra đĩa, không vào localStorage.

   Nói thẳng: ba tầng này chặn được việc sao chép kho khi chưa đăng nhập,
   chặn máy quét, và chặn phát tán tệp. Chúng KHÔNG chặn được một người
   đã được cấp phép cố tình chép lại phần mình đang xem — không hệ thống
   nào trên đời làm được điều đó. Phần còn lại thuộc về hợp đồng, nhật ký
   truy cập và đóng dấu chìm theo người xem.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

/* Địa chỉ máy chủ cấp phép. Để trống thì ứng dụng chạy ở chế độ mẫu. */
G.API_CAP_PHEP = G.API_CAP_PHEP || '';

G.KHO = { daNap: [], dangNap: [], cheDoMau: false, hanKhoa: null, lyDoTuChoi: '', maTuChoi: '' };

/* Mọi thuộc tính do kho cấp phép nạp vào. Đổi vai là xoá sạch rồi nạp lại
   theo đúng phạm vi của vai mới — không để sót nội dung của vai trước. */
G.THUOC_CAP_PHEP = [
  /* v9.99 — quy chế phòng tài chính, gói NGHỀ */
  'TC_MA_VB','TC_DIEULE','TC_QUYCHE','TC_QUYTRINH','TC_BIEUMAU','TC_RUIRO',
  'TC_KPI','TC_LUONG',
  'TG_MA_VB','TG_TANG','TG_NGUOI','TG_LOAIHINH','TG_CAM','TG_DIEM',
  'TG_BAC','TG_TRANGTHAI','TG_LENH','TG_CHOCHU','TG_LUAT_GOC',
  /* v9.99.41 — hiến pháp nội dung, gói NGHỀ */
  'KN_MA_VB','KN_KHOI','KN_XONG','KN_DIEM','KN_BAC','KN_CAM',
  'KN_SAU','KN_NGUON','KN_LOI_THAY','KN_RONG','KN_CHE','KN_NGUOIDOC',
  'KN_CONGTHUC','KN_VONG','KN_LUAT_GOC','KN_CHOCHU',
  /* v9.99.42 — thang năm cổng */
  'KN_CONG','KN_LUAT_THANG','KN_SLA','KN_QUYEN','KN_TRANGTHAI',
  /* v9.99.44 — tiêu chuẩn nghề */
  'KN_CHUAN_NGHE','KN_CAM_CHUYENGIA','KN_KHUNG_CAU',
  /* v9.99.45 — bốn khuôn và bộ đọc buổi */
  'KN_KHUON','KN_NHIP','KN_HOITHOAI_LUAT',
  /* v9.99.46 — thang điểm riêng cho ba khuôn */
  'KN_DIEM_KHUON',
  /* v9.99.47 — bộ miễn dịch */
  'MD_MA_VB','MD_NHOM','MD_CHAN','MD_VIRUS','MD_CHOCHU',
  /* v9.99.48 — từ điển KL08 */
  'KL_MA_VB','KL_LOP','KL_THAY','KL_NGANKHO','KL_NHOM','KL_CHOCHU',
  /* v9.99.49 — khung cho những mục còn chờ chủ hệ */
  'KL_BIEUTUONG','MD_MAU_MA','MD_THUHANHVI','TG_IN_CHOT',
  /* v9.99.54 — cổng Điều Nhỏ của trợ lý hình ảnh */
  'TG_DIEUNHO','TG_KHUON4','TG_KHUON4_LUAT',
  /* v9.99.55 — hiểu yêu cầu · phác ý · dựng đề bài năm lớp */
  'TG_YDINH','TG_QUYET_KHO','TG_SACKHI','TG_QUYET','TG_QUYET_LUAT',
  'TG_CHU_TRAN','TG_GOCNHIN','TG_ANDU','TG_BATINHTU','TG_BATINHTU_LUAT',
  'TG_LOP5','TG_LOP5_LUAT',
  /* v9.99.56 — góp ý vá vào đúng lớp, và năm thứ không được động tới */
  'TG_SUA_DAU','TG_SUA_LUAT','TG_ADN',
  /* v9.99.57 — dòng truy nguồn trên tấm */
  'TG_TRUY',
  /* v9.99.58 — kênh phát · giờ vàng · gỡ bài */
  'TG_KENH','TG_GIO_VANG','TG_GIO_LUAT','TG_GO_LY_DO','TG_GO_LUAT',
  /* v9.99.61 — khung điền cho sổ chờ, và sổ đã chốt gỡ ra từ sổ chờ */
  'BC_BIKIP','CS_MOC_NAM','CS_MOC_KHUON','PL_TEN_BAOHO','PL_TEN_KHUON',
  'SG_BIA_CHOT','SG_BIA_KHUON',
  'BLV_DACHOT','BV_DACHOT','TV_DACHOT',
  /* v9.99.59 — đo phễu · sổ truy vết · mười quy trình ứng phó */
  'TG_UNGPHO','TG_UNGPHO_LUAT','TG_PHEU','TG_PHEU_LUAT',
  /* v9.99.62 — BỘ NÃO phần 1 */
  'BN_HIENPHAP','BN_HIENPHAP_LUAT','BN_VUNG','BN_DO10','BN_VUNG_LUAT',
  'BN_RAO10','BN_ANDANH','BN_ANDANH_LUAT','BN_GHE','BN_GHE_LUAT','BN_CHOCHU',
  /* v9.99.63 — Phân hệ 1 */
  'VM_BA','VM_BA_LUAT','VM_TRUONG','VM_TUAN','VM_THE','VM_DOI','VM_MUA',
  'VM_BAC','VM_BAC_LUAT','VM_LANRANH','VM_CAM_NOI','VM_CAM_LUAT','VM_CHOCHU',
  'CK_VONG9','CK_VONG9_LUAT','CK_LUONG12','CK_LUONG_LUAT','CK_GHE5','CK_GHE_LUAT',
  'CK_BTB','CK_BTB_TRAN','CK_MUC5','CK_TRU4','CK_CUA3','CK_SO3','CK_NOI_LUAT','CK_CHOCHU',
  'NT_TANG7','NT_NHOM4','NT_TANG_LUAT','NT_NHANH7','NT_NHANH_LUAT','NT_LOC7','NT_LOC_LUAT','NT_CHOCHU',
  'VH_TRUONG23','VH_TRUONG_LUAT','VH_DEN3','VH_DEN_LUAT','VH_NHIP','VH_NHIP_LUAT','VH_SO5','VH_SO_LUAT','VH_CHOCHU',
  'TC_BAY7','TC_BAY_LUAT','TC_LUAT4','TC_KICHBAN','TC_KICHBAN_LUAT','TC_CHOCHU',
  'TU_MUCTIEU','TU_MUCTIEU_LUAT','TU_QUYDOI','TU_RANGBUOC','TU_CHIPHI_KHUNG','TU_CHIPHI_O','TU_DA_VA','TU_KIEUGIA','TU_CHOCHU',
  /* v9.99.69 — Phân hệ 6 */
  'CN_CUA','CN_CUA_LUAT','CN_NGUON','CN_DONGCHUAN','CN_C1_TH','CN_C2_KHUNG',
  'CN_TUAN','CN_TUAN_LUAT','CN_CHAN','CN_CHOCHU',
  /* v9.99.70 — Phân hệ 7 */
  'PLR_CANHBAO','PLR_LUAT','PLR_HAUKIEM','PLR_VIEC7','PLR_VIEC_LUAT',
  'PLR_DONGY','PLR_DONGY_LUAT','PLR_XOA','PLR_XOA_LUAT','PLR_VUNG4',
  'PLR_VUNG_LUAT','PLR_CHOCHU',
  /* v9.99.71 — GITA-CEO-OS v3.0 */
  'HDH_NHIP','HDH_NHIP_LUAT','HDH_CHISO12','HDH_CHISO_LUAT','HDH_QUYET5',
  'HDH_QUYET_LUAT','HDH_CHANG','HDH_CHANG_LUAT','HDH_LENH4','HDH_LENH_LUAT',
  'HDH_THUOC_TUAN','HDH_THUOC_LUAT','HDH_HATANG','HDH_CHOCHU',
  /* v9.99.72 — bộ prompt bốn vai */
  'BP_VAI4','BP_VAI_LUAT','BP_KHOI','BP_KHOI_LUAT','BP_VONG','BP_VONG_LUAT',
  'BP_NOI','BP_NOI_LUAT','BP_OFFLINE','BP_CHOCHU',
  /* v9.99.73 — bảng giá sửa được */
  'BG_CAT','BG_CAT_LUAT','BG_RANG','BG_SO_LUAT','BG_BAC_MOI','BG_CHOCHU',
  'SUP_THANG','SUP_THANG_LUAT','SUP_VA','SUP_VA_CU','SUP_MAUTHUAN','SUP_OAN','SUP_OAN_LUAT','SUP_CUM','SUP_LOP','SUP_KHOI','SUP_KHONGKHOI','SUP_DEM','SUP_TUOI','SUP_WOW','SUP_WOW_LUAT','SUP_BACHIEU','SUP_BACHIEU_LUAT','SUP_FAN','SUP_FAN_LUAT','TAILIEU_SPEC','TAILIEU_SPEC_LUAT','HC_TANG','HC_MA_TRUNG','HC_LUAT','HC_CHOCHU','CUU_YEUTO','CUU_LUAT','CUU_BUOC','CUU_KHONG_LAM','CUU_CHOCHU','XU_DEM','XU_LOI','XU_HOP','XU_NGANKHO','XU_KHUON','XU_KHO_HINH','XU_DEN','XU_LUAT','XU_CHOCHU','LT_THANG','LT_THANG_LUAT','LT_GIAIDOAN','LT_GATE','LT_RM','LT_MOC','LT_NO','LT_NO_LUAT','LT_AM','LT_PL','LT_VA','LT_HOP','LT_MOI','LT_LUAT','LT_CHOCHU','ST_DEM','ST_VA','ST_OAN','ST_OAN_LUAT','ST_PHAN','ST_LUAT','ST_CHOCHU','HP9_BATKHASUA','HP9_LUAT','HP9_CHOCHU','HP9_DACHOT','SUP_CHO','SUP_CHOCHU','SUP_DACHOT',
  'THT_CAP','THT_CAMNANG','THT_UNGPHO','THT_RB','THT_GIAMSAT','THT_GIAMSAT_LUAT','THT_PHATSINH_LOAI','THT_LUAT','THT_KHONG_LAM','THT_CHOCHU',
  'AI_QUYEN','AI_QUYEN_LUAT','AI_QUYEN_CHOCHU',
  'VIP_CAM','VIP_CAM_LUAT','VIP_NGAN','VIP_LENH','VIP_SA_KHONG','VIP_60',
  'VIP_SUA_CHU','VIP_CHOCHU',
  /* v9.99.77 — vòng tự nâng cấp */
  'TNC_KHONG_CHAM','TNC_KHONG_CHAM_LUAT','TNC_CAP8','TNC_XEP_CAP',
  'TNC_CUA5','TNC_CUA_LUAT','TNC_NHAY10','TNC_NHAY_LUAT','TNC_CHOCHU',
  'NM_MOT_VIEC','NM_BAO','NM_BO_VIEC','NM_GHIM','NM_ANH_CON','NM_NANG_NE',
  'NM_TRONG','NM_CHOCHU','NM_DACHOT',
  'LGD_LUAT','LGD_VONG_DO','LGD_VONG_DO_LUAT','LGD_NGUOI_GIU','LGD_NGUOI_GIU_LUAT',
  'LGD_GIU_CHAN','LGD_NGUYEN_TAC','LGD_TRONG','LGD_HAI_TRUC','LGD_CHOCHU',
  /* v9.74 — bốn kho định tuyến độ khó, gói NGHỀ */
  'DOKHO_TUYEN','DOKHO_THEM','DOKHO_KHOA','DOKHO_CAM','DOKHO_LUAT',
  'VANHANH','CHUYENDICH','CHANDUNG','LOTRINH','FAMILIES','NHA_TOI','TEAM','CUHICH','NGHILE','SUKIEN',
  'HEALTH','DUYET','AUDIT','TODAY','LEVELS','DIEM','HUYHIEU','QUA','HOAHONG','DANDAT','BRAND',
  'RASOAT','TAMNHIN100','TANG100','WOW','NHATBAN','CHIPHI','NGONTU_RANH','DAISU','BAIHOC',
  'MOTHUC','SACH','BANDO_A3','POSTER','SODO','PHACDO','DIEMCHAM','NGONTU','NGONTU_TANG',
  'THAYVI','MAUTHOAI','PERSONA','CHUAN1000','QA_CHOCHU','QA_DACHOT','HAILONG','TAILIEU','AIPOLICY','KPI','DINHTUYEN',
  'AINANGCAP','LACHAN','BENCH','BENCH_AI','KICHBAN',
  /* Kho nghề thêm từ v8.9. Thiếu tên ở đây thì donKho() không xoá, và
     một máy vừa đăng nhập Coach rồi đăng nhập lại bằng phụ huynh sẽ để
     phụ huynh giữ nguyên chiều sâu nghề trong bộ nhớ — khoá màn hình mà
     dữ liệu vẫn nằm đó. Bộ kiểm phát hành soi danh sách này đối chiếu
     với nội dung thật của bảy gói, nên quên một tên là đỏ. */
  'PD_SAU','TH_SAU','NOI_KET','QT_NHOM','TL_GIADINH',
  'MT_RANH','MT_RANH_LUAT','PD_RUOT_SOAT','TH_RUOT_SOAT',
  /* Ba kho này từ bản 9.8 mang NỬA NGHỀ: chuyện của cấp Coach/Tư vấn/
     Admin, câu sát hạch của đội ngũ, bài khoá đào tạo nghề. Thiếu tên ở
     đây thì máy vừa đăng nhập Coach rồi đăng nhập lại bằng phụ huynh sẽ
     để phụ huynh giữ nguyên nửa ấy. */
  'CHUYEN','SH_HOI','KH_BAI',
  /* Tháp chiến lược và bản đồ bốn tầng — bản thiết kế cách Học viện tự lái mình. */
  'CL_THAP','CL_TANG','CL_MUC','CL_KETQUA','CL_NHIP','CL_NHAT','CL_LUAT',
  'TG_LANG','TG_GON','TG_GIAIDOAN','TG_LOP','TG_GON_LUAT',
  'CT_TRANG','CT_LOAI','CT_DIEM','CT_LUAT',
  'BD_LON','BD_CAP','BD_CHON','BD_LUAT','BD_DAN',
  'TT_CAMXUC','TT_MUA','TT_MUA_LUAT','TT_CHIAKHOA','TT_BANGCHUNG','TT_VET','TT_LUAT','TT_CONGTHUC',
  'TT_MAN','TT_DONGHANH','TT_DONGHANH_LUAT','TT_NHIEMKY',
  'HM_NGAY1','HM_HOI3','HM_NGONTU','HM_VUNG','HM_VUNG_LUAT',
  'HM_NGUY','HM_NGUY_SAU','HM_LEU','HM_HEO','HM_LUAT','HM_SAU',
  'DD_HUA','DD_CAP','DD_TRAN_LUAT','DD_9010','DD_HOI','DD_HATLAI',
  'DD_TINHHUONG','DD_THAY','DD_KPI','DD_LUAT',
  'GL_XONG','GL_XONG_LUAT','GL_BAN','GL_BAN_CAM','GL_MUC1','GL_MUC1_LUAT',
  'GL_ANDON','GL_ANDON_LUAT','GL_KPI','GL_KPI_LUAT','GL_SUCO','GL_SUCO_LUAT',
  'GL_LS','GL_LS_LUAT','GL_HOPDEN','GL_LUAT',
  'ND_LUAT','ND_QUYMO','ND_NGAY0','ND_THANG','ND_TUAN','ND_TUAN_LUAT',
  'ND_MOC','ND_MOC_LUAT','ND_SUCO','ND_CAM',
  'TR_DEN','TR_DEN_LUAT','TR_LUAT','TR_NGUON','TR_CHI','TR_CAT_LUAT','TR_TUCHU',
  'TR_QUY','TR_QUY_LUAT','TR_LUONG','TR_BAO','TR_KIEMTOAN','TR_CHUA','TR_CHUA_LUAT',
  'DT_LUAT','DT_VAO','DT_BUOI','DT_VAI','DT_VAI_LUAT','DT_THUCTAP',
  'DT_RUBRIC','DT_TUYETDOI','DT_THI','DT_PHAO','DT_TAICHUNGCHI','DT_RUTLUI',
  'MP_BAY','MP_LUAT','MP_QUAI','MP_BAO','MP_CHONG','MP_CHONG_LUAT',
  'MP_DO','MP_GAY','MP_LICH','MP_CHUA','MP_CHUA_LUAT',
  'BN_TRUC5','BN_TRUC5_LUAT','BN_THAPKY','BN_THAPKY_LUAT','BN_DOTDONG',
  'BN_MORUNG','BN_MORUNG_LUAT','BN_GIEOLAI','BN_CHUYENGIAO','BN_BONG',
  'BN_HANSEI_TC','BN_HANSEI_TC_LUAT','BN_LE50','BN_CHAMTHU','BN_NENTANG',
  'BN_LIENMINH','BN_NAM100','BN_DICHUC','BN_CHET','BN_LUAT',
  'PL_QUYEN','PL_QUYEN_LUAT','PL_CO','PL_CO_LUAT','PL_CHUYENNGU','PL_KHO','PL_KHO_LUAT','PL_CAMKET',
  'PL_DIEU','PL_PHAPNHAN','PL_HOPDONG','PL_XUNGDOT','PL_BAC4','PL_BAC4_LUAT',
  'PL_TRANHCHAP','PL_KIEM90','PL_DINHKY','PL_CHOCHU','PL_CHOCHU_LUAT','PL_LUAT',
  'TV_LANRANH','TV_LANRANH_LUAT','TV_LUAT','TV_TRAN','TV_PHANKHUC','TV_SANGLOC',
  'TV_HOI','TV_NGHE','TV_OHOSO','TV_KYLUAT','TV_NHIP5','TV_TUCHOI','TV_TUCHOI_LUAT',
  'TV_TINHIEU','TV_TINHIEU_LUAT','TV_CHOT','TV_SUP','TV_HOAN','TV_306090','TV_VO',
  'TV_GIOITHIEU','TV_SO15','TV_SO15_LUAT','TV_NGAY','TV_12THANG','TV_TOTNGHIEP',
  'TV_CHOCHU','TV_CHOCHU_LUAT',
  'SG_DONGDAU','SG_TRANG24','SG_MUCLUC','SG_LUAT','SG_KHAN','SG_KHAN_LUAT',
  'SG_CAM5','SG_CAM5_LUAT','SG_KHONGVAY','SG_QUYEN7','SG_QUYEN7_LUAT','SG_HOI',
  'SG_TRONGSACH','SG_CHUONG','SG_CHUONG_LUAT','SG_DAOTAO','SG_SO','SG_SO_LUAT',
  'SG_INAN','SG_INLAI','SG_KIEM3','SG_PHULUC','SG_DOCHU','SG_CHOCHU','SG_CHOCHU_LUAT',
  'HN_NGO','HN_NGO_LUAT',
  'VZ_LOI','VZ_VUNG','VZ_VUNG_LUAT','VZ_ROI','VZ_ROI_LUAT','VZ_LUAT',
  'CS_LOI','CS_TANG','CS_TANG_LUAT','CS_NEN','CS_LUAT',
  'KA_LOAI','KA_TY','KA_CHO','KA_LUAT','KA_ANTOAN',
  'BC_LOI','BC_TRONGSO','BC_TRONGSO_LUAT','BC_MUNG','BC_MUNG_LUAT','BC_LUAT',
  'BC_VAI','BC_VAI_LUAT','BC_VONG_LUAT','BC_NHIP_LUAT','BC_NEP_LUAT','BC_KEM_LUAT','BC_CHOCHU',
  'HP_NGAY',
  'TIN_LOAI','TIN_NGUON','TIN_NGUON_LUAT','TIN_SO_LUAT','TIN_TIEUCHI','TIN_TIEUCHI_LUAT',
  'TIN_THUONG','TIN_CAM','TIN_LUAT','TIN_LOAI_LUAT','TIN_MAU','TIN_TANG_LUAT',
  'TIN_KEM_THUONG','BK_LUAT','BK_DANHMUC','BK_DANHMUC_LUAT','TG_MUC','TG_VIEC',
  'KBTV_CHUONG','KBTV_KB','KBTV_CONG_PHI','KBTV_VANPHONG','KBTV_DAODUC','KBTV_BA_KHONG','KBTV_BA_LUON','KBTV_LECH','KBTV_LUAT',
  'KB_MU','KB_MU_LUAT','KB_GIONG','KB_PHATSINH','KB_PHATSINH_LUAT',
  'KB_DA_CHOT','KB_TRAN_NHA','KB_VONG','KB_KEY_NGUON','KB_LUAT','KB_MOI_TANG','KB_CHOCHU','KB_NGHIEPVU','KB_NGHIEPVU_LUAT',
  'TL_TANG_TRUONG','TL_TANG_LUAT','TL_VIEC_NHIP','TL_VIEC_LUAT','TL_VIEC_DAU',
  'XK_TRAN','XK_MUC','XK_VAI_MUC','XK_VAI_MUC_LUAT','XK_DA_CHOT','XK_CAM','XK_LUAT','XK_GIAYPHEP','XK_CHOCHU',
  'HH_KEM','HH_BAC','HH_BAC_LUAT','HH_KHONG_TIEN','HH_CHUNGCU','HH_LOAI_CC','HH_CC_LUAT','HH_CHOCHU','HH_DA_CHOT',
  'CS_VONG','CS_VONG_LUAT','CS_DULIEU','CS_DULIEU_LUAT',
  'CS_QUYMO','CS_LECH','CS_CHOCHU',
  /* Sổ tay vận hành phần kết (SV_*) và hai tầng 3-4 (T34_*). Sách nghề
     của người đi cùng: mức trần vận hành, chỗ hệ có thể gãy, lời phải
     nói khi hệ sập, ranh giới vai Trợ lý với Coach, mười bốn dạng khó
     và câu nói nguyên văn của từng dạng. Ở gói NGHỀ vì nhà mình đọc thì
     thấy trước kịch bản của chính buổi gặp mình sắp dự. */
  'SV_LOI','SV_THUTU','SV_THUTU_LUAT','SV_DIEULE','SV_DIEULE_LUAT',
  'SV_CAM_QUYMO','SV_RUIRO','SV_NGANSACH_COACH','SV_NGOAI','SV_LECH',
  'SV_CHOCHU','SV_HAI_NGUOI','SV_LUAT',
  'T34_LOI','T34_VAI','T34_VAI_LUAT','T34_GITSA','T34_GITSA_LUAT',
  'T34_BATRU','T34_BATRU_LUAT','T34_T3_CHANG','T34_NHANH','T34_NHANH_LUAT',
  'T34_BUONG','T34_BUONG_LUAT','T34_BUONG_BAY','T34_T4_MUA','T34_T4_NHIP',
  'T34_CHUQUYEN_CON','T34_THATBAI','T34_DENNHAY','T34_KHO','T34_HOSO',
  'T34_DOI_HAUTHUAN','T34_CUARA','T34_CUARA_LUAT','T34_KPI','T34_KPI_LUAT',
  'T34_AUDIT','T34_LECH','T34_LUAT',
  /* Dòng T5-PRO (T5P_*): sách nghề của một dòng có khách riêng —
     cửa vào, kịch bản từ chối, bốn loại phiên, bảy nghi thức, mười
     hai điều đạo đức. Ở gói NGHỀ, và màn của nó còn khoá chặt hơn
     mọi màn nghề khác: dừng ở Senior Coach. */
  'T5P_LOI','T5P_BATRU','T5P_KHAC_T5','T5P_KHAC_LUAT','T5P_KHONGLA',
  'T5P_GIAIDOAN','T5P_TRINHTU','T5P_DOI','T5P_PHOI_DOI','T5P_DAODUC',
  'T5P_DAODUC_LUAT','T5P_NANGLUC','T5P_CUM','T5P_MUC','T5P_NANGLUC_LUAT',
  'T5P_SANGLOC','T5P_SANGLOC_LUAT','T5P_TUCHOI_LUAT','T5P_TUCHOI','T5P_SAUTUCHOI',
  'T5P_PHIEN','T5P_NGHITHUC','T5P_NGHITHUC_LUAT','T5P_KHUNGHOANG','T5P_KHUNGHOANG_LUAT',
  'T5P_DICH','T5P_GIA','T5P_LECH','T5P_CHOCHU','T5P_LUAT',
  /* Bộ bản vẽ 13 tờ (BV_*): đặc tả vận hành — ma trận 50 ô có tag,
     bốn cổng, mười nhịp, hai mươi tín hiệu đỏ, trần công suất từng
     vai, và bản đồ nâng cấp Web App. Ở gói NGHỀ: nhà mình đọc bảng
     điều phối thì thấy mình là một dòng trong đó. */
  'BV_LOI','BV_NGUYENTAC','BV_TANG','BV_CAPDO','BV_CAPDO_LUAT',
  'BV_CONG','BV_CONG_LUAT','BV_TUTCAP','BV_NHIP','BV_NHIP_LUAT',
  'BV_DO','BV_LOC','BV_LOC_LUAT','BV_RAO','BV_TRIGGER',
  'BV_MODULE','BV_MODULE_NOI','BV_MODULE_LUAT','BV_BANG','BV_VAI',
  'BV_VAI_LUAT','BV_BANGIAO','BV_LECH','BV_CHOCHU','BV_LUAT',
  'BV_DO_NOI','BV_DO_NOI_LUAT',
  /* Bàn làm việc của Coach (BLV_*): năm ngăn vét cạn, gói tài nguyên
     tám ô, bảy loại nhắc việc có hạn giờ, bốn lượt rà soát. Ở gói
     NGHỀ — nhà mình đọc hàng đợi thì thấy mình là một dòng trong đó. */
  'BLV_LOI','BLV_NGAN','BLV_NGAN_LUAT','BLV_GOI','BLV_GOI_LUAT',
  'BLV_NHAC','BLV_NHAC_LUAT','BLV_RASOAT','BLV_LUAT',
  'BLV_DUYET','BLV_DUYET_DIEU','BLV_DUYET_LUAT','BLV_CHOCHU',
  'BLV_MOC','BLV_MOC_LUAT',
  /* Bàn làm việc của Tư vấn (TVB_*) và bảng đăng ký hoạt động (HD_*).
     Ở gói NGHỀ: bàn Tư vấn cho thấy nhà nào đang bị treo và vì sao chưa
     chốt, còn bảng hoạt động cho thấy toàn bộ quy trình nội bộ. */
  'TVB_LOI','TVB_NGAN','TVB_NGAN_LUAT','TVB_GOI','TVB_GOI_LUAT','TVB_LUAT',
  'DKH_LOI','DKH_MUC','DKH_CAM_MAY','DKH_VIEC','DKH_LUAT',
  /* Diễn thử hai buổi khó nhất — ở gói NGHỀ vì mỗi lượt phơi ra
     đúng câu người tư vấn ĐÁNG LẼ đã nói, tức là bộ đề của chính
     kỳ sát hạch đội ngũ. */
  'DTH_LOI','DTH_BAI','DTH_LUAT',
  /* Chuẩn ngôn ngữ sáu vai và phễu chốt — ở gói NGHỀ vì bảng cấm
     phơi ra đúng câu người bán DỄ nói nhất, và phễu phơi ra ai bị
     loại ở tầng nào. */
  'NN_LOI','NN_VAI','NN_VAI_LUAT','NN_CAM','NN_CAM_LUAT',
  'PH_LOI','PH_TANG','PH_CHOT',
  /* 1000 điểm chạm WOW + 1000 điểm khoá (máy sinh) và mười hai điều
     tay nghề (viết tay). Ở gói NGHỀ: bảng này phơi ra đúng chỗ hệ
     định chạm vào cảm xúc nào, lúc nào. */
  'DC1K_WOW','DC1K_KHOA',
  'TN_LOI','TN_DIEU','TN_LUAT','TN_GHIDE','TN_GHIDE_LUAT',
  /* Hành lang thành công và bản rà soát lỗi hệ thống. Hai kho này soi
     chính hệ đang chạy — chúng nêu tên hàm, tên kho và chỗ còn hở, nên
     ai đọc được là đọc luôn bản đồ chỗ yếu. Khoá ở gói NGHỀ. */
  'HL_LOI','HL_LUAT12','HL_LUAT12_LUAT','HL_VIRUS','HL_VIRUS_LUAT',
  'HL_QUYTRINH','HL_KHOA9','HL_KHOA9_LUAT','HL_SAUNHIP','HL_SAUNHIP_LUAT',
  'HL_CHISO','HL_LECH',
  'RS_LOI','RS_NHOM','RS_CHAN','RS_GOC','RS_HOI','RS_DOT','RS_LUAT',
  /* Rà soát pháp lý, chuẩn bằng chứng và bộ hồ sơ hợp đồng. Ba kho
     này nêu tên hàm, chỗ hệ còn hở trước pháp luật, và cả khung hợp
     đồng nội bộ — đọc được là đọc luôn chỗ yếu và điều khoản của Học
     viện. Khoá ở gói NGHỀ.

     Tiền tố RSP_ chứ không phải PL_: PL_ đã thuộc về kho pháp lý nội
     bộ (bảy quyền của gia đình). Hai kho khác nhau, hai tiền tố. */
  'RSP_LOI','RSP_LUATMOI','RSP_LUATMOI_LUAT','RSP_NHOM','RSP_CHAN','RSP_CHAN_LUAT',
  'RSP_GOC','RSP_VB','RSP_DKMOI','RSP_DOT','RSP_LUATSU','RSP_LECH','RSP_LECH_LUAT','RSP_LUAT',
  'BCD_LOI','BCD_TINHCHAT','BCD_TINHCHAT_LUAT','BCD_THAOTAC','BCD_THAOTAC_LUAT',
  'BCD_MATGIA','BCD_MATGIA_LUAT','BCD_VIECGAN','BCD_LUAT',
  'HSH_LOI','HSH_DK6','HSH_DK6_LUAT','HSH_DK','HSH_HD','HSH_BAC','HSH_LUONG_LUAT',
  'HSH_PHONG','HSH_VO','HSH_HOP','HSH_HOP_LUAT','HSH_KY','HSH_KY_LUAT',
  'HSH_LOTRINH','HSH_LOTRINH_LUAT','HSH_BAOMAT','HSH_LUAT',
  /* Hướng dẫn ký kết theo ba luồng phát sinh. Kho này nêu ai ký, ký
     cấp mấy và chỗ dễ sai — đọc được là đọc luôn quy trình nội bộ
     của Học viện. Khoá ở gói NGHỀ. */
  'KK_LOI','KK_CUA','KK_CUA_LUAT','KK_A','KK_B','KK_C','KK_LUONG_LUAT',
  'KK_CHON','KK_CHON_LUAT','KK_CAM','KK_LUAT',
  /* Sổ tay Super Admin — phần NGƯỜI VIẾT. Phần danh sách màn thì máy
     sinh từ G.NAV lúc chạy, không nằm trong kho. Kho này nêu nút nào
     nguy và cái sai đã từng xảy ra, nên khoá ở gói NGHỀ. */
  'STA_LOI','STA_NHOM','STA_NHIP','STA_NHIP_LUAT','STA_XUONGSONG','STA_XUONGSONG_LUAT',
  'STA_BAYNGAY','STA_BAYNGAY_LUAT','STA_CAM','STA_LUAT',
  /* Bảng tin NỘI BỘ của đội ngũ — khác hẳn TIN_ là bảng tin cộng đồng
     cho gia đình. Kho này mang việc nội bộ, hồ sơ ca và số toàn hệ, nên
     khách hàng và cộng tác viên KHÔNG được nhận. Ở gói NGHỀ. */
  'BTN_LOI','BTN_NGAN','BTN_NGAN_LUAT','BTN_VINHDANH','BTN_VINHDANH_LUAT',
  'BTN_TRAN','BTN_CAM','BTN_LUAT',
  /* Tự động hoá ở tầng hệ thống — nối vào DKH_ của bản 9.61. Kho nêu
     tên công cụ, tên hàm và năm chỗ máy không được nhận; đó là bản đồ
     ruột của hệ, nên khoá ở gói NGHỀ. */
  'TDH_LOI','TDH_HE','TDH_HE_LUAT','TDH_CHAN','TDH_CHAN_LUAT',
  'TDH_DUONG','TDH_DUONG_LUAT','TDH_LUAT',
  'HT_DICH','HT_TANG','HT_TANG_LUAT','HT_SAUT5','HT_KC','HT_NOI',
  'HT_NOI_LUAT','HT_LECH','HT_LUAT','HN_QUYET','HN_QUYET_LUAT','HN_DONGY','HN_SLA',
  'HN_MAUTHUAN','HN_CAY','HN_TUPHAT','HN_YEU','HN_LUAT','HN_TUCAM_THEM',
  'HN_CHOCHU','HN_CHOCHU_LUAT',
  /* Lớp băng của ma trận: từ 9.8 nó về gói nghề cùng MATRAN, vì mọi
     màn đọc nó đều khoá ở quyền nghề. */
  'MT_BANG','MT_BANG_MA','MT_BANG_TANG','MT_BANG_NHOM','MT_BANG_LUAT','MT_DO',
  'CV_TRANG','CV_MUC','CV_MUC_DS','CV_LUAT','CV_HANG','CV_KH_NGAY','CV_KH_TANG','CV_KPI_CAP','CV_KPI_CAP_LUAT','DEHIEU_LUAT','DEHIEU_THAY','DEHIEU_TRANG','DEHIEU_NGUONG',
  /* ── Bốn mươi bảy kho nghề tích lại qua nhiều bản ──
     Bộ kiểm phát hành v8.9 đối chiếu nội dung thật của gói NGHỀ và gói
     TẦNG với danh sách này, và tìm ra 47 kho chưa bao giờ được khai.
     Mỗi cái là một chỗ dữ liệu nghề nằm lại trong bộ nhớ máy khách sau
     khi đổi vai: máy vừa đăng nhập Coach, đăng nhập lại bằng phụ huynh,
     thì phụ huynh vẫn còn học phí, hợp đồng tuyến, mô thức NLP, chiều
     sâu nghề trong tay.

     Không kho nào trong đây do bản này thêm vào — chúng có sẵn. Cái mới
     là phép đo tìm ra chúng, và phép đo ấy nay chạy mỗi lần phát hành
     nên danh sách không tụt lại phía sau kho được nữa. */
  'MT_SAU','SAU_BOICANH','SAU_TRUONG_CAP','SAU_TRUONG_CHUNG','SAU_LUAT',
  'HD_CHUAN','HD_RIENG','HD_LUAT','QT_LUONG','QT_RIENG',
  'QT_LUAT','TD_MUC','TD_CANH','TD_TRITHUC','TD_MAYCHU',
  'TD_KHONG','TD_THAT','NLP_GOC','NLP_MUC','NLP_CAITIEN',
  'NLP_LUAT','HP_PHAM_VI','TAILIEU_GOC','TAILIEU_DRIVE','HP_TANG',
  'HP_LUAT','HP_KICHBAN','HP_SOAT','REF_30S','REF_GAINS_GITA',
  'REF_121','REF_CHAM','REF_CHAM_MUC','REF_TRANGTHAI','REF_BANGIAO',
  'REF_CAMON','REF_KHONG','REF_HOI','REF_KPI','REF_LOI',
  'CD_BO','CD_LUAT','TL_KE','TL_DUONG','TL_LUAT',
  'TL_TRICH','TL_BAOQUAN',
  'LUAT_TK','TAIKHOAN_KPI','YEUCAU_MO','HANG_TL','DAU_MAT','QUYTRINH',
  'QUA1000','QUA_DANG','KETNOI','LIENKET','VANBAN','TAICHINH_QT','THANHTRA','RASOAT_KH',
  'BANDO_TUVAN','BANDO_COACH','XUAT','TINHHUONG','KHUNG_T5','THANHTOAN','TEST750','KPI100',
  'MATRAN','MATRAN_T1','MATRAN_T2','MATRAN_T3','MATRAN_T4','MATRAN_T5',
  'REFERRAL','CHANDUNG_KH','DOLUONG_KH','PHANHANG','CHUAN_VIP','NHANSU_TT','CAYTIEN',
  'HOSO_VIP','CHUYENDOI','XUONG_SONG','NGUON_VAITRO','SACH_THAMKHAO','PHUONGPHAP','VANTAY','AICHAM','SOTAY_NHANDIEN','CAPDO_VANDUNG','VANDUNG','QUYTRINH_XL','RANG_BUOC',
  'TRU_GITA','HANHTRINH12','LOI_HUA_GITA','TN7','LOI5','REF_CHUAN','TRUYENTHONG3',
  'BANG_GAINS','BANG_REF','REF16','REF_GIAIDOAN','REF_LOI5','CHUOI10','BANDAP',
  'KHACHLON_NGUON','KHACH_TANG','NAM_TANG_PHUCVU','TAM_NAM_TANG','NAC_QUANHE',
  'NAC_TRUNGTHANH','TAM_MATXICH','HOSO68','MUOIHAI_NGUYENTAC','NHANTANG',
  'NAM_BUOC_KHIEUNAI','GIU124','VISAO_ROIDI','KHACHLON_CAU','LUAT_LAMVIEC'
];
function donKho(){
  G.THUOC_CAP_PHEP.forEach(function(k){ try{ delete G[k]; }catch(e){ G[k] = undefined; } });
  /* Kho trải ra nhiều gói được NỐI chứ không gán, nên quên dọn là nối
     chồng: mở kho lần thứ hai trong cùng một trang thì 600 chuyện thành
     1200, và không có gì báo. Phép đo bắt được đúng lỗi này ngay lần
     chạy đầu sau khi chia kho. */
  G.KHO_TRAI_RA.forEach(function(k){ try{ delete G[k]; }catch(e){ G[k] = undefined; } });
  G.KHO.daNap = []; G.KHO.dangNap = []; G.KHO.cheDoMau = false; G.KHO.hanKhoa = null;
  /* Bảng thứ hạng của trần 30% tính từ chính kho đang mở. Đổi vai là kho
     đổi, nên bảng cũ phải bỏ đi — không thì nhà mình được tính theo kho
     của vai trước. */
  if (G.quenBangHang) G.quenBangHang();
}
G.donKho = donKho;

/* ── Phạm vi cấp phép: vai nào, tầng nào, TUYẾN nào, được mở gói nào ── */
G.goiDuocCap = function () {
  /* Đây chỉ là DANH SÁCH XIN. Quyết định cấp hay không là của máy chủ:
     máy chủ đọc hồ sơ tài khoản, biết vai, tầng và tuyến thật, rồi chỉ trả
     khoá của những gói tài khoản đó được cấp phép. Client không tự phong
     quyền — nên chỗ này xin rộng cũng không mở thêm được gì.

     Từ v7.8 phạm vi có ba chiều thay vì hai: VAI × TẦNG × TUYẾN. Tài khoản
     không khai tuyến thì G.tuyenCuaTK trả về đúng GITA365, nên mọi tài
     khoản và mọi giấy phép có trước v7.8 xin y hệt như cũ. */
  var r = G.S.roleObj, ds = ['nen'];
  if (!r) return ds;

  /* Chỉ xin gói của tuyến ĐANG CHẠY. Tuyến còn đang dựng chuẩn thì chưa
     có tệp .enc nào mang tên gói của nó; xin một tên không tồn tại làm
     máy chủ ghi một dòng từ chối mỗi lần đăng nhập, và người đọc nhật ký
     sẽ tưởng có ai đang dò khoá. */
  var tuyen = (G.tuyenCuaTK ? G.tuyenCuaTK(G.S.acc) : ['GITA365'])
    .filter(function (mt) { var t = G.tuyen && G.tuyen(mt); return t && t.trangThai === 'chay'; });
  var moTang = (r.lv <= 12 || r.portal === 'ph' || r.portal === 'hs');

  /* ── TẦNG CAO NHẤT ĐƯỢC CẤP PHÉP ──
     Đội ngũ (bậc ≤ 12) phải mở được mọi tầng: họ phục vụ nhà ở mọi tầng,
     và một Coach không đọc được tầng của nhà mình đang theo thì không làm
     được việc. Khách hàng thì KHÔNG: họ chỉ mở tới tầng đã mua.

     Trước 9.9 chỗ này xin cả năm tầng cho mọi khách hàng, và vì bảng cấp
     phát của máy chủ dựng bằng chính hàm này, máy chủ CẤP THẬT cả năm.
     Hai cái giá cùng lúc: một nhà Tầng 1 giữ trong máy tư liệu Tầng 5 mà
     họ chưa mua, và 6,6 MB đường truyền cho phần không được dùng. */
  var tangToiDa = (r.lv <= 12) ? G.TUYEN_SO_TANG
    : Math.max(1, Math.min(G.TUYEN_SO_TANG, Number(G.S.acc && G.S.acc.tang) || 1));

  tuyen.forEach(function (mt) {
    /* Bậc 12 chứ không phải 11. Ba bảng khác đều nói kho nghề mở tới R12
       (G.PERM.nghe_chung = 12, G.TANG_HIENTHI, và bảng tỉ lệ hiển thị),
       nhưng chỗ này từng dừng ở 11 — nên Chuyên viên phân tích thấy mục
       "Kho báu vật" và "Sách gốc" trong trình đơn mà bấm vào chỉ ra màn
       xin cấp phép. */
    if (r.lv <= 12) ds.push(G.goiNghe(mt));
    /* Gói NGHỀ CAO dừng ở bậc của Coach, không dừng ở 12. Con số ấy đọc
       từ chính G.ROLES chứ không gõ ở đây — đổi bậc của Coach trong bảng
       vai thì chỗ này đổi theo, và không có bản thứ hai để lệch. */
    if (G.xkBacCoach && r.lv <= G.xkBacCoach()) ds.push(G.goiNgheCao(mt));
    if (moTang)
      for (var i = 1; i <= tangToiDa; i++) ds.push(G.goiTang(mt, i));
  });

  return ds.filter(function (g, i) { return g && ds.indexOf(g) === i; });
};

/* ── Bảng cấp phát cho MÁY CHỦ đọc ──
   Khi máy của chủ hệ thống phục vụ máy khác (desktop/may-chu.js), máy chủ
   phải tự quyết định mỗi tài khoản được mở gói nào. Nó KHÔNG được tin cái
   vai mà máy khách khai — máy khách nào cũng khai được "R01".

   Nên máy chủ tra bảng này theo TÊN ĐĂNG NHẬP. Bảng dựng bằng chính
   G.goiDuocCap() ở trên, không chép lại luật lần thứ hai: sửa phạm vi cấp
   phép một chỗ là cả hai đường đi theo. */
G.bangCapPhat = function () {
  var ra = {};
  var ds = (G.ACCOUNTS || []).concat(G.AUDITORS || []);
  var giuAcc = G.S.acc, giuRole = G.S.role, giuRo = G.S.roleObj;
  try {
    for (var i = 0; i < ds.length; i++) {
      var a = ds[i];
      if (!a || !a.u) continue;
      G.S.acc = a; G.S.role = a.role; G.S.roleObj = G.roleById(a.role);
      ra[String(a.u).toLowerCase()] = { vai: a.role, ten: a.ten || '', goi: G.goiDuocCap() };
    }
  } finally {
    /* Phải trả trạng thái về đúng như cũ. Bảng này dựng ngay trong phiên
       của chủ hệ thống đang mở màn hình — để sót là chủ hệ thống bị đổi
       vai thành người cuối danh sách mà không hiểu vì sao. */
    G.S.acc = giuAcc; G.S.role = giuRole; G.S.roleObj = giuRo;
  }
  return ra;
};

/* ── Xin khoá ── */
function xinKhoa(danhSach) {
  /* Giấy phép cục bộ: bản máy tính đã kích hoạt nạp khoá qua đường này,
     sau khi tiến trình chính đọc và kiểm tệp giấy phép trong thư mục dữ liệu.
     Bản web không bao giờ có sẵn khoá — luôn phải hỏi máy chủ. */
  if (window.GITA_KHOA) return Promise.resolve(window.GITA_KHOA);
  if (!G.API_CAP_PHEP) return Promise.resolve(null);
  return fetch(G.API_CAP_PHEP, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      fn: 'capKhoa',
      u: G.S.acc && G.S.acc.u,
      /* MÃ PHIÊN, KHÔNG ĐƯỢC QUÊN. Máy chủ cũ (Apps Script) nhận diện
         theo tên tài khoản nên đường này chạy suốt mà không gửi token.
         Máy chủ mới đòi phiên cho capKhoa, nên thiếu trường này là MỌI
         lượt xin khoá của bản web trả về AUTH và kho mã hoá không bao
         giờ mở — im lặng, vì ứng dụng vẫn chạy ở chế độ mẫu.
         Gửi kèm thì máy chủ cũ bỏ qua, máy chủ mới dùng. */
      token: G.PHIEN_TOKEN || '',
      vai: G.S.role,
      goi: danhSach,
      may: navigator.userAgent.slice(0, 120)
    })
  }).then(function (r) { return r.json(); })
    .then(function (d) {
      if (!d || !d.ok) {
        /* Máy chủ từ chối có lý do, và lý do ấy phải tới được người dùng.
           Rơi thẳng về chế độ mẫu mà không nói gì là cách chắc chắn nhất
           để một người ngồi hàng giờ tưởng ứng dụng hỏng. */
        G.KHO.lyDoTuChoi = (d && d.error) || 'Máy chủ chưa cấp khoá';
        G.KHO.maTuChoi   = (d && d.code) || '';
        if (d && d.code === 'MUSTCHANGE' && G.U && G.U.toast)
          setTimeout(function () {
            G.U.toast('Kho chưa mở vì tài khoản còn dùng mật khẩu tạm. ' +
              'Đổi mật khẩu rồi đăng nhập lại.', 'err');
            if (G.moDoiMatKhau) G.moDoiMatKhau();
          }, 400);
        throw new Error(G.KHO.lyDoTuChoi);
      }
      G.KHO.lyDoTuChoi = ''; G.KHO.maTuChoi = '';
      G.KHO.hanKhoa = d.hetHan || null;
      /* Máy chủ của chủ hệ thống (desktop/may-chu.js) trả kèm mã phiên.
         Gói của phiên nào chỉ lấy được bằng mã phiên ấy, nên phải giữ lại
         và gửi kèm ở layGoi. Máy chủ Apps Script không trả trường này —
         khi ấy chuỗi rỗng, và layGoi gọi y như cũ. */
      G.KHO.maPhien = d.phien || '';
      return d.khoa;
    });
}

/* ── Lấy một gói đã mã hoá ──
   Hai đường, tuỳ bản web nằm ở đâu:
     · bản tĩnh (GitHub Pages, tên miền, bản cài trên máy) → đọc tệp cạnh ứng dụng
     · bản do Apps Script phục vụ → xin qua máy chủ, nhận base64
   Gói nào cũng đã mã hoá sẵn, nên đường nào cũng không lộ gì. */
function layGoi(ten) {
  var nguon = window.GITA_NGUON_KHO;
  if (nguon)
    return fetch(nguon + encodeURIComponent(ten) +
        (G.KHO.maPhien ? '?p=' + encodeURIComponent(G.KHO.maPhien) : ''))
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || !d.ok) {
          /* Chủ hệ thống cắt quyền máy này giữa chừng thì đường này là chỗ
             đầu tiên biết. Không nói ra thì người dùng chỉ thấy màn trắng. */
          if (G.MAY_KHACH_BI_CAT) G.MAY_KHACH_BI_CAT(d && d.error);
          throw new Error((d && d.error) || 'Máy chủ không trả gói ' + ten);
        }
        return Uint8Array.from(atob(d.du), function (c) { return c.charCodeAt(0); });
      });

  return fetch('kho/' + ten + '.enc')
    .then(function (r) { if (!r.ok) throw new Error('Không tìm thấy gói ' + ten); return r.arrayBuffer(); })
    .then(function (buf) { return new Uint8Array(buf); });
}

/* ── Giải mã một gói ── */
function moGoi(ten, khoaB64) {
  return layGoi(ten)
    .then(function (b) {
      var iv = b.slice(0, 12), tag = b.slice(12, 28), ma = b.slice(28);
      var kem = new Uint8Array(ma.length + tag.length);
      kem.set(ma); kem.set(tag, ma.length);       // WebCrypto chờ tag ở cuối
      var raw = Uint8Array.from(atob(khoaB64), function (c) { return c.charCodeAt(0); });
      return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt'])
        .then(function (k) { return crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, k, kem); });
    })
    .then(function (ro) { return giaiNen(ro); })
    .then(function (chu) { return JSON.parse(chu); });
}

/* ── Giải nén sau khi giải mã ──
   Từ bản 9.9, ruột của gói được NÉN trước rồi mới mã hoá. Vì sao theo thứ
   tự ấy: nén trước thì nén được thật (JSON lặp rất nhiều), còn nén sau
   thì không — bản đã mã hoá là chuỗi ngẫu nhiên, nén vào không giảm nổi
   một phần trăm. Đo trên kho thật: 13,6 MB xuống 2,07 MB, riêng các gói
   tầng giảm 14 đến 31 lần.

   Không cần thêm cờ hay đổi định dạng phong bì: JSON luôn bắt đầu bằng
   '{' (0x7B), còn gzip luôn bắt đầu bằng 0x1F 0x8B. Hai giá trị ấy không
   bao giờ trùng, nên chỉ cần nhìn hai byte đầu là biết. Nhờ vậy gói cũ
   chưa nén vẫn mở được bình thường — không có ngày nào người dùng phải
   tải lại toàn bộ kho vì đổi định dạng. */
function giaiNen(buf) {
  var u8 = new Uint8Array(buf);
  if (!(u8[0] === 0x1f && u8[1] === 0x8b)) return Promise.resolve(new TextDecoder().decode(buf));
  if (typeof DecompressionStream !== 'function')
    return Promise.reject(new Error('Trình duyệt này chưa giải nén được gzip. Cần bản mới hơn.'));
  var ds = new DecompressionStream('gzip');
  var w = ds.writable.getWriter(); w.write(u8); w.close();
  return new Response(ds.readable).text();
}

/* ── Gộp nội dung đã mở vào G, chỉ trong bộ nhớ ── */
/* ── KHO TRẢI RA NHIỀU GÓI ──
   Hầu hết kho nằm gọn trong một gói: mở gói ra, gán vào G, xong. Nhưng
   vài kho phải trải ra nhiều gói vì người đọc chúng thuộc nhiều phạm vi
   cấp phép khác nhau — bộ test chia theo tầng, danh mục quà chia theo
   tầng, kho chuyện và bộ sát hạch chia theo VAI (phần của gia đình đi
   gói nền, phần của đội ngũ đi gói nghề).

   Với những kho ấy, gộp là NỐI chứ không phải GÁN. Gán thì gói mở sau
   đè mất gói mở trước, và cái mất đi im lặng: màn hình vẫn chạy, chỉ là
   thiếu một nửa nội dung. Đúng lỗi đã xảy ra thật khi dựng lại kho ở
   9.6 — TEST750 tụt từ 25 bộ xuống 5 vì một lượt Object.assign.

   Danh sách này phải khớp ĐÚNG với thực tế bảy gói: bộ kiểm phát hành
   đối chiếu hai chiều — kho nào nằm ở nhiều gói mà không khai ở đây là
   đỏ, và kho nào khai ở đây mà chỉ nằm một gói cũng đỏ. Nhờ vậy nó
   không tụt lại phía sau kho như một danh sách viết tay thường thấy. */
/* KICHBAN từng nằm ở đây khi kịch bản còn đi theo gói tầng. Từ 8.9 nó
   về gói nghề, nằm gọn một gói, nên nó KHÔNG còn thuộc danh sách này —
   khai thừa cũng đỏ, và đỏ ở đây là đúng: một cái tên khai thừa hôm nay
   là một cái tên không ai dám xoá ngày mai. */
/* Kho trải ra nhiều gói: lúc mở thì NỐI, không GÁN ĐÈ. FAMILIES vào
   danh sách này từ 9.47 — tầng 1-3 ở gói NGHỀ, tầng 4-5 ở gói NGHỀ CAO.
   Quên khai tên ở đây thì gói mở sau đè mất gói mở trước, và tuỳ thứ tự
   nạp mà Coach mất tầng thấp hoặc mất tầng cao — im lặng, không lỗi. */
G.KHO_TRAI_RA = ['TEST750', 'QUA1000', 'CHUYEN', 'SH_HOI', 'KH_BAI', 'FAMILIES'];
/* LƯU Ý MỘT NGOẠI LỆ CỦA LUẬT "VẮNG MẶT KHÁC RỖNG": kho trong danh sách
   này được dựng sẵn thành [] trước khi nạp, để .concat có chỗ nối. Nên
   với chúng, [] nghĩa là KHÔNG CÓ BẢN GHI NÀO ĐƯỢC CẤP — không phải
   "đáng lẽ phải có giá trị". Hỏi `.length`, đừng hỏi kho có tồn tại hay
   không: từ 9.47 một máy phụ huynh cũng có G.FAMILIES, và nó rỗng. */

function gop(du) {
  Object.keys(du).forEach(function (k) {
    if (G.KHO_TRAI_RA.indexOf(k) >= 0) G[k] = (G[k] || []).concat(du[k]);
    else G[k] = du[k];
  });
}

/* ── Chế độ mẫu: đủ để xem giao diện, không lộ kho ── */
function napMau() {
  /* Bản do Apps Script phục vụ không có thư mục kho/ cạnh trang, nên dữ liệu
     mẫu cũng xin qua máy chủ như các gói khác. */
  var duong = window.GITA_NGUON_KHO ? (window.GITA_NGUON_KHO + 'mau') : 'kho/mau.json';
  return fetch(duong).then(function (r) { return r.json(); })
    .then(function (m) {
      G.KHO.cheDoMau = true;
      Object.keys(m).forEach(function(k){ G[k] = m[k]; });
      G.KICHBAN = m.KICHBAN || []; G.PHACDO = m.PHACDO || [];
      G.MOTHUC = m.MOTHUC || []; G.TEST750 = m.TEST750 || [];
      if (G.quenBangHang) G.quenBangHang();
    })
    .catch(function () {
      G.KHO.cheDoMau = true; G.KICHBAN = []; G.PHACDO = []; G.MOTHUC = []; G.TEST750 = [];
      if (G.quenBangHang) G.quenBangHang();
    });
}

/* ── Nạp mã của gói nghề ──
   Chỉ chạy một lần trong đời trang: mã đã nạp thì đổi vai không nạp lại,
   và cũng KHÔNG gỡ ra được — một thẻ script đã chạy thì không rút lại
   được. Đó là lý do mã nghề chỉ được chứa MÀN, không chứa dữ liệu: dữ
   liệu thì donKho() xoá sạch khi đổi vai, còn mã thì ở lại. */
function napMaNghe() {
  if (G.KHO.maNgheXong || G.KHO.maNgheDangNap) return;
  /* Bản một tệp — bản giới thiệu và vỏ Apps Script — đã nhúng sẵn mã
     nghề bên trong, vì một tệp thì không tải được tệp anh em nào cả.
     Nhận ra bằng chính thứ cần: màn đầu của gói nghề đã có mặt chưa.

     Chốt ở đây chứ không chốt bằng một cờ do bộ đóng gói cắm vào: cờ
     thì có ba bản dựng phải nhớ cắm, còn câu hỏi "màn ấy có chưa" thì
     đúng ở mọi bản, kể cả bản chưa ai nghĩ ra. */
  var m = G.MAN_NGHE || [];
  if (m.length && G.VIEWS && G.VIEWS[m[0]]) { G.KHO.maNgheXong = true; return; }
  G.KHO.maNgheDangNap = true;
  var xong = function (ok) {
    G.KHO.maNgheDangNap = false;
    G.KHO.maNgheXong = ok;
    var i = G.KHO.dangNap.indexOf('ma-nghe');
    if (i >= 0) G.KHO.dangNap.splice(i, 1);
    if (!ok) console.warn('[GITA] không nạp được ' + G.MA_NGHE_TEP);
    /* Mã mới về thì những lớp BỌC màn phải chạy lại trên phần vừa về.
       Bọc một lần lúc tải trang là đúng khi mọi màn cùng một gói; từ khi
       mã nghề tách ra, bọc một lần nghĩa là màn nghề mất lớp bọc — và
       mất trong im lặng, không lỗi nào. */
    /* Gọi cả SỔ lớp bọc, không gọi từng tên: thêm một lớp bọc mới ở bản
       sau thì nó tự đăng ký, không ai phải nhớ sửa thêm chỗ này. Nhớ là
       thứ hỏng đầu tiên. */
    if (ok) (G.BOC_LAI || []).forEach(function (ten) {
      try { if (typeof G[ten] === 'function') G[ten](); }
      catch (e) { console.warn('[GITA] bọc lại ' + ten + ': ' + e.message); }
    });
    if (!G.S.acc) return;
    if (G.veLaiCot) G.veLaiCot();
    /* Chỉ dựng lại khi màn đang mở CHÍNH LÀ màn vừa có mã — dựng lại
       lung tung là cướp chỗ cuộn của người đang đọc. */
    if (G.render && (G.MAN_NGHE || []).indexOf(G.S.view) >= 0) G.render();
  };
  var t = document.createElement('script');
  t.src = G.MA_NGHE_TEP;
  t.async = true;
  t.onload = function () { xong(true); };
  t.onerror = function () { xong(false); };
  document.head.appendChild(t);
}

/* ── Nạp kho cho phiên làm việc hiện tại ── */
G.napKho = function () {
  donKho();
  var ds = G.goiDuocCap();
  G.KICHBAN = [];
  G.KHO_TRAI_RA.forEach(function(k){ G[k] = []; });
  return xinKhoa(ds)
    .then(function (khoa) {
      if (!khoa) return napMau();
      var co = ds.filter(function (t) { return khoa[t]; });
      /* CHỈ gói nền mở trước. Có nó là cột trái dựng được, màn đầu dựng
         được, người ta bắt đầu làm việc được.

         Gói nghề từng nằm ở đây cùng gói nền, và cái giá đo được: một
         Coach phải chờ 6,6 MB giải mã xong mới thấy màn hình đầu tiên —
         1.196 ms đứng nhìn màn chờ. Nhưng màn đầu của Coach không đọc
         một chữ nào của gói nghề.

         Nay gói nghề mở ở nền như gói tầng. Màn nào cần nó mà nó chưa
         xong thì render() đã có sẵn thẻ "Đang mở kho" và tự dựng lại khi
         gói tới — cơ chế ấy có từ 7.x cho gói tầng, chỉ là chưa ai dùng
         cho gói nghề. */
      var truoc = co.filter(function (t) { return t === 'nen'; });
      var sau   = co.filter(function (t) { return truoc.indexOf(t) < 0; });

      function mo(t) {
        return moGoi(t, khoa[t])
          .then(function (du) {
            gop(du); G.KHO.daNap.push(t);
            /* Kho vừa lớn thêm một gói — tính lại thứ hạng cho trần 30% */
            if (G.quenBangHang) G.quenBangHang();
            /* ── TÌNH HUỐNG CỦA GIA ĐÌNH ĐI QUA MÁY CHỦ, KHÔNG ĐI QUA GÓI ──
               Nạp NGAY SAU gói nền, vì lúc ấy đã biết vai và tầng. Đặt tên
               vào chính G.KHO.dangNap là chỗ đắt nhất của cách này: mọi chỗ
               trong app đã chờ "dangNap rỗng", nên chúng chờ luôn cả lượt
               nạp này mà không cần một đường chờ thứ hai. */
            if (t === 'nen' && G.LA_KHACH && G.LA_KHACH() && G.thKhachNap) {
              G.KHO.dangNap.push('th-khach');
              G.thKhachNap()['catch'](function () { /* mất mạng thì thôi */ })
                .then(function () {
                  var j = G.KHO.dangNap.indexOf('th-khach');
                  if (j >= 0) G.KHO.dangNap.splice(j, 1);
                  /* Lượt nạp này chạy ở NỀN, nên nó về lúc nào không đoán
                     được — có thể đúng lúc màn đang dựng lại và khung chưa
                     có. Một việc chạy nền KHÔNG được phép ném lỗi ra trang:
                     nó làm hỏng đúng cái nó vừa nạp xong cho. */
                  try { if (G.render) G.render(); } catch (e) {
                    console.warn('[GITA] vẽ lại sau khi nạp tình huống: ' + e.message);
                  }
                });
            }
          })
          .catch(function (e) { console.warn('[GITA] gói ' + t + ': ' + e.message); })
          .then(function () {
            var i = G.KHO.dangNap.indexOf(t);
            if (i >= 0) G.KHO.dangNap.splice(i, 1);
          });
      }

      /* ─── MÃ CỦA GÓI NGHỀ ĐI CÙNG KHO CỦA GÓI NGHỀ ───
         Từ bản 9.23, mã dựng màn nghề nằm riêng ở gita-nghe.js. Điều
         kiện nạp nó GIỐNG HỆT điều kiện nạp kho nghề, nên nạp cùng lúc.

         Đặt tên nó vào chính G.KHO.dangNap là chỗ đắt nhất của cách này:
         mọi chỗ trong app đã chờ "dangNap rỗng" — cột trái, màn đang mở,
         và cả 60 mục của bộ kiểm — tự khắc chờ luôn cả mã, không cần
         thêm một đường chờ thứ hai. Hai đường chờ rồi sẽ có ngày lệch. */
      if (co.indexOf('nghe') >= 0 && G.MA_NGHE_TEP && !G.KHO.maNgheXong) {
        co = co.concat(['ma-nghe']);
        napMaNghe();
      }
      G.KHO.dangNap = co.slice();
      return Promise.all(truoc.map(mo)).then(function () {
        if (!G.KHO.daNap.length && !sau.length) return napMau();
        G.KHO.cheDoMau = false;
        if (G.secLog) G.secLog('Mở kho', 'Đã mở ' + G.KHO.daNap.length + ' gói theo phạm vi cấp phép: ' +
          G.KHO.daNap.join(', '), 'Ghi nhận');
        /* Không chờ phần này — để nó chạy ở nền */
        sau.forEach(function (t) {
          mo(t).then(function () {
            if (!G.S.acc) return;
            /* Cột trái dựng lại mỗi lần một gói về. Vài mục chỉ hiện khi
               CÓ dữ liệu trong kho, nên gói về muộn mà cột không dựng lại
               thì mục ấy ẩn luôn tới lần chuyển màn kế tiếp. */
            if (G.veLaiCot) G.veLaiCot();
            if (G.render && !G.coGoi(G.goiCanCho(G.S.view))) return;
            if (G.render && G.goiCanCho(G.S.view) === t) G.render();
          });
        });
      });
    })
    .catch(function (e) {
      console.warn('[GITA] cấp phép: ' + e.message);
      return napMau();
    });
};

/* ── Màn hình khi nội dung chưa được cấp phép ──
   Không chỉ nói "bị khoá". Nói rõ ba điều khách hàng cần biết ngay:
   khoá cái gì, vì sao, và mở nó bằng cách nào — kèm những thứ đang
   dùng được ngay bây giờ để không ai bị bỏ lại ở một trang cụt. */
var TEN_GOI = {
  nen:  'Gói nền — mô hình, lộ trình, nhịp sống nhà mình',
  nghe: 'Gói nghề — kịch bản, phác đồ, mô thức, hệ VIP',
  tang1:'Gói tầng 1 — NHẬN DIỆN', tang2:'Gói tầng 2 — GIẢI MÃ',
  tang3:'Gói tầng 3 — KIẾN TẠO',  tang4:'Gói tầng 4 — CHUYỂN HOÁ',
  tang5:'Gói tầng 5 — BỨT PHÁ'
};

/* Gói của tuyến mới không viết tay vào bảng trên — tên gọi suy ra từ
   G.TUYEN, nên thêm một tuyến là có ngay tên đọc được, không phải nhớ
   sửa thêm chỗ này. */
function tenGoi_(g){
  if(TEN_GOI[g]) return TEN_GOI[g];
  var d = G.doiGoi && G.doiGoi(g);
  if(!d || !d.tuyen) return g;
  var t = G.tuyen(d.tuyen); if(!t) return g;
  if(d.loai === 'nghe') return 'Gói nghề ' + t.ten + ' — kịch bản và phác đồ của tuyến';
  var bac = (G.TIERS || []).filter(function(x){ return x.id === d.tang; })[0];
  return 'Gói tầng ' + d.tang + ' ' + t.ten + (bac ? ' — ' + bac.name : '');
}

G.canCapPhep = function (goi) {
  var U = G.U, h = U.h;
  var mau = G.KHO && G.KHO.cheDoMau;
  var laTang = /^tang(\d)$/.test(String(goi));
  var soTang = laTang ? Number(String(goi).slice(4)) : 0;
  var tenGoi = tenGoi_(goi);

  /* Người đọc màn này đang muốn LÀM MỘT VIỆC, không muốn đọc một bài giải
     thích. Nên nút mở đứng trước, giải thích đứng sau — và nút phải hợp với
     đúng vai đang đăng nhập, không đưa ba lựa chọn để họ tự đoán. */
  var laChu = G.can && G.can('qt_trang');          /* Super Admin · Admin hệ thống */
  /* Nạp tệp giấy phép chạy được trên bản web nhiều tệp và bản cài — chỉ
     cần vai được phép. KHÔNG chạy trên bản giới thiệu một tệp: bản ấy
     không mang theo kho .enc nào, nên có khoá cũng không có gì để mở. */
  var napDuoc = !!(G.napDuocGiayPhep && G.napDuocGiayPhep());
  var motTep  = !!(G.laBanMotTep && G.laBanMotTep());

  var o = U.ph({ eyebrow: 'PHẦN NÀY CHƯA MỞ', ic: 'lock',
    t: mau ? 'Bấm một nút là mở' : 'Chưa tới lượt màn hình này',
    lead: mau
      ? 'Ứng dụng đang chạy bản mẫu nên kho chuyên môn chưa mở. Chọn đúng một việc bên dưới.'
      : 'Không phải lỗi, và cũng không phải anh chị làm sai. Dưới đây là đúng ba điều: khoá phần nào, vì sao, và mở bằng cách nào.' });

  /* Bản một tệp: nói thẳng vì sao nạp giấy phép không giúp được gì ở đây.
     Trước đây màn này vẫn mời nạp giấy phép trên bản một tệp — người dùng
     bấm, chọn tệp, và không có gì đổi. Nút chết còn tệ hơn không có nút:
     nó làm người ta tưởng mình thao tác sai, và làm giấy phép bị mang ra
     khỏi nơi an toàn mà chẳng để làm gì. */
  if(mau && motTep)
    o += '<div class="card mb" style="border-color:rgba(251,146,60,.45);background:rgba(251,146,60,.07)">'+
      '<div class="row mb" style="gap:9px"><span style="color:var(--alert)">'+U.ic('bell','w-4 h-4')+'</span>'+
      '<b style="color:var(--alert)">ĐÂY LÀ BẢN GIỚI THIỆU MỘT TỆP — KHÔNG KÈM KHO</b></div>'+
      '<p class="sm" style="line-height:1.75">Bản này gói cả ứng dụng vào một tệp HTML để gửi đi và mở '+
      'được ở mọi nơi. Nó <b>không mang theo kho tri thức đã mã hoá</b>, nên nạp giấy phép vào đây '+
      'cũng không mở thêm được gì — có khoá mà không có hộp để mở.</p>'+
      '<p class="sm mt" style="line-height:1.75">Muốn xem đủ kho thì dùng một trong hai đường: '+
      '<b>bản cài trên máy tính</b> (Trợ giúp → Nạp giấy phép), hoặc <b>bản web nhiều tệp</b> đã nối '+
      'máy chủ cấp phép. Cả hai đều đi kèm bảy tệp <span class="mono">kho/*.enc</span>.</p></div>';

  /* ── Hàng nút, đặt NGAY ĐẦU màn ── */
  if(mau){
    var nut = [];
    if(napDuoc) nut.push({t:'Nạp tệp giấy phép', act:'gp-mo', pri:1,
      y:'Tệp .json Học viện cấp. Chọn tệp là mở kho ngay, không cần mạng, không cần máy chủ. '+
        'Đây là đường nhanh nhất.'});
    if(laChu) nut.push({t:'Nối máy chủ cấp phép', v:'noi-may-chu', pri:!napDuoc,
      y:'Dán địa chỉ máy chủ một lần. Từ đó về sau mọi tài khoản đăng nhập là có khoá.'});
    nut.push({t:'Đăng nhập lại', act:'logout',
      y:'Đã nối máy chủ rồi mà vẫn khoá thì đăng xuất và vào lại — khoá cấp lúc mở phiên.'});
    if(!laChu && !napDuoc) nut.push({t:"Đăng ký tài khoản", act:"mo-dang-ky",
      y:'Chưa có tài khoản thì đăng ký ở Cổng vào, xác nhận email, hệ thống cấp mã số khách hàng.'});

    o += '<div class="card" style="border-color:var(--gita);background:var(--gita-mo-1)">'+
      '<div class="up mb" style="color:var(--gita-ink)">'+U.ic('arrow','w-4 h-4')+' MỞ NGAY BÂY GIỜ</div>'+
      nut.map(function(n, j){
        return '<div class="row" style="gap:12px;align-items:flex-start;'+
          (j ? 'margin-top:12px;padding-top:12px;border-top:1px solid var(--line)' : '')+'">'+
          '<button class="btn '+(n.pri ? 'pri' : 'ghost')+'" style="flex:none;min-width:190px"'+
            (n.v ? ' data-v="'+h(n.v)+'"' : '')+(n.act ? ' data-act="'+h(n.act)+'"' : '')+'>'+
            h(n.t)+'</button>'+
          '<p class="sm dim" style="flex:1;min-width:200px;line-height:1.6;margin-top:9px">'+h(n.y)+'</p>'+
        '</div>';
      }).join('')+
      (laChu ? '<p class="tiny muted mt2">Anh chị đang ở vai quản trị — nối máy chủ một lần là mở cho toàn hệ, '+
               'không phải làm lại trên từng máy.</p>' : '')+
    '</div>';
  }
  else if(!laTang){
    /* Không phải chế độ mẫu: vai không đủ. Chỉ có một việc làm được. */
    o += '<div class="card" style="border-color:var(--gita-vien-1)">'+
      '<div class="row" style="gap:12px;align-items:center;flex-wrap:wrap">'+
        '<button class="btn ghost" data-act="logout">Đăng nhập bằng vai khác</button>'+
        '<p class="sm dim" style="flex:1;min-width:220px;line-height:1.6">Gói này thuộc phạm vi vai khác. '+
        'Cần dùng thật thì nhắn Admin hệ thống cấp thêm quyền cho vai của anh chị.</p></div></div>';
  }

  /* 1 · Khoá phần nào */
  o += '<div class="card" style="border-color:var(--gita-vien-1)">' +
    '<div class="row mb"><span style="color:var(--gold-ink)">' + U.ic('vault', 'w-4 h-4') + '</span>' +
    '<b>1 · Màn hình này nằm trong ' + h(tenGoi) + '</b></div>' +
    '<p class="sm" style="line-height:1.75;color:var(--ink-2)">Nội dung chuyên môn của GITA 365 được mã hoá và chia thành bảy gói. ' +
    'Mỗi tài khoản chỉ nhận khoá của những gói thuộc vai và tầng của mình — không thừa một gói nào.</p></div>';

  /* 2 · Vì sao */
  o += '<div class="card mt2">' +
    '<div class="row mb"><span style="color:var(--ink-3)">' + U.ic('shield', 'w-4 h-4') + '</span>' +
    '<b>2 · Vì sao đang khoá</b></div>' +
    (mau
      ? '<p class="sm" style="line-height:1.75;color:var(--ink-2)">Ứng dụng đang chạy <b>chế độ mẫu</b> — chưa nối với máy chủ cấp phép ' +
        'nên chưa có khoá của gói nào. Đây là trạng thái của bản dùng thử và bản cài chưa kích hoạt.</p>'
      : laTang
        ? '<p class="sm" style="line-height:1.75;color:var(--ink-2)">Nhà mình chưa vào <b>tầng ' + soTang + '</b>. ' +
          'Tầng mở dần theo hành trình, không mở hết một lượt — vì học tầng sau khi chưa xong tầng trước thì hỏng nhịp, ' +
          'không phải vì tiếc nội dung.</p>'
        : '<p class="sm" style="line-height:1.75;color:var(--ink-2)">Gói này thuộc phạm vi của đội ngũ dẫn dắt GITA 365. ' +
          'Vai hiện tại không được cấp — đó là cách giữ cho hồ sơ từng gia đình không rơi sang tay người không phụ trách.</p>') +
    '</div>';

  /* 3 · Mở bằng cách nào */
  o += '<div class="card mt2" style="border-color:rgba(16,185,129,.36)">' +
    '<div class="row mb"><span style="color:var(--ok)">' + U.ic('arrow', 'w-4 h-4') + '</span>' +
    '<b>3 · Mở bằng cách nào</b></div>' +
    (mau
      ? U.list([
          'Nối ứng dụng với máy chủ cấp phép của Học viện, rồi đăng nhập lại.',
          'Bản cài trên máy tính: nạp tệp giấy phép được cấp cho đúng máy đó.',
          'Chưa có tài khoản: đăng ký ở Cổng vào, xác nhận email, rồi hệ thống cấp mã số khách hàng.'
        ])
      : laTang
        ? U.list([
            'Hoàn thành KPI của tầng đang học — hệ thống đếm từ dữ liệu anh chị đã ghi.',
            'Xác nhận thanh toán thành công — kế toán đối chiếu sao kê rồi ghi nhận.',
            'Đủ cả hai thì hệ thống nâng tầng và mở gói này ở lần đăng nhập kế tiếp.'
          ])
        : U.list([
            'Phần này dành cho đội ngũ GITA 365. Nếu anh chị là người của đội ngũ, đề nghị Admin cấp đúng vị trí.',
            'Nếu là gia đình đang học, Coach phụ trách sẽ mang phần cần thiết vào buổi đồng hành.'
          ])) +
    '</div>';

  /* Đang dùng được gì — để không ai đứng ở trang cụt */
  o += '<div class="card mt2"><div class="up mb" style="color:var(--ink-4)">ĐANG DÙNG ĐƯỢC NGAY BÂY GIỜ</div>' +
    '<p class="sm dim" style="line-height:1.7">' +
    (G.KHO.daNap.length
      ? 'Gói đã mở: <b class="mono">' + h(G.KHO.daNap.join(' · ')) + '</b>.'
      : 'Bản mẫu công khai: mô hình năm khoang chín vai, lộ trình năm tầng, mười chân dung thành công, ' +
        'nhịp sống và nghi lễ gia đình, cú hích, cách ghi nhận và trao quà, sáu ranh giới an toàn, ' +
        'chương trình đại sứ, sự kiện, và một bài test rút gọn.') + '</p>' +
    '<div class="row mt" style="gap:9px;flex-wrap:wrap">' +
      (G.napDuocGiayPhep && G.napDuocGiayPhep()
        ? '<button class="btn pri sm" data-act="gp-mo">' + U.ic('vault','w-4 h-4') + 'Nạp giấy phép để mở kho</button>' : '') +
      '<button class="btn ghost sm" data-v="pham-vi">Xem đầy đủ phạm vi của tôi</button>' +
      '<button class="btn ghost sm" data-v="lo-trinh">Lộ trình năm tầng</button></div></div>';

  /* Người của Học viện thì nói thẳng đường mở, đừng để họ mắc ở đây */
  if (G.napDuocGiayPhep && G.napDuocGiayPhep())
    o += '<div class="card mt2" style="border-color:var(--gita-vien-1);background:var(--gita-mo-1)">' +
      '<div class="row mb"><span style="color:var(--gita-ink)">' + U.ic('shield', 'w-4 h-4') + '</span>' +
      '<b>Anh chị là người của Học viện — mở được ngay</b></div>' +
      '<p class="sm" style="line-height:1.75;color:var(--ink-2)">Bấm <b>Nạp giấy phép</b> ở trên và chọn tệp ' +
      '<span class="mono">giay-phep-….json</span> Học viện cấp cho máy này. Kho mở ngay trong phiên làm việc, ' +
      'đủ cả bảy gói nếu giấy phép cấp đủ — không cần chờ nối máy chủ.</p>' +
      '<p class="tiny muted mt">Chưa có tệp giấy phép: chạy <span class="mono">node tools/tao-giay-phep.js "Tên anh chị" 24</span> ' +
      'trên máy dựng, tệp ra ở thư mục <span class="mono">giay-phep/</span>.</p></div>';
  return o;
};

