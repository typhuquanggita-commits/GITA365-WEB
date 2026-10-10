/* TỆP DỰNG RA — đừng sửa tay. Nguồn: may-chu/csdl.sql + tools/dung-khung-du-lieu.js
   Khung bảng CRM · Tài chính cho màn "Khung dữ liệu & ma trận quyền" (chỉ cấu trúc, không dữ liệu). */
'use strict';
var G = window.G || {}; window.G = G;
G.KHUNG_DL = {
 "crm": [
  {
   "ten": "hoSoKhach",
   "mo": "Tệp khách hàng — gốc của mọi khối",
   "doc": "Coach / Tư vấn: nhà mình phụ trách · R01–R04: toàn hệ",
   "ghi": "Giao người phụ trách: R01–R04 · Coach / Tư vấn sửa tệp nhà mình · đổi tầng: R01–R03 (cổng KPI + thanh toán)",
   "cot": [
    [
     "maKhachHang",
     "TEXT",
     "PRIMARY KEY",
     ""
    ],
    [
     "uidPhuHuynh",
     "TEXT",
     "NOT NULL",
     "trỏ users.id"
    ],
    [
     "maHocVien",
     "TEXT",
     "",
     "trỏ students.id"
    ],
    [
     "tuyen",
     "TEXT",
     "NOT NULL DEFAULT 'GITA365'",
     ""
    ],
    [
     "tang",
     "INTEGER",
     "NOT NULL DEFAULT 0",
     ""
    ],
    [
     "band",
     "TEXT",
     "",
     "XANH · VANG · DO · XAM, theo G.MT_BANG"
    ],
    [
     "coach",
     "TEXT",
     "",
     "tên đăng nhập người kèm"
    ],
    [
     "tuVan",
     "TEXT",
     "",
     "tên đăng nhập người tư vấn"
    ],
    [
     "boTro",
     "TEXT",
     "",
     "mã nhà giới thiệu — gốc của hoa hồng"
    ],
    [
     "trangThai",
     "TEXT",
     "NOT NULL DEFAULT 'dangHoc'",
     "dangHoc · tamDung · nghi · xong"
    ],
    [
     "vaoLuc",
     "TEXT",
     "",
     ""
    ],
    [
     "suaLuc",
     "TEXT",
     "",
     ""
    ],
    [
     "ghiChu",
     "TEXT",
     "",
     ""
    ]
   ]
  },
  {
   "ten": "crmKhach",
   "mo": "Trạng thái CRM của một nhà: giai đoạn, người phụ trách, hẹn tiếp",
   "doc": "Theo quyền CRM Super Admin cấp; dưới mức quản lý chỉ khách mình",
   "ghi": "Mức \"sửa\" trở lên; giao người phụ trách cần mức \"quản lý\"",
   "cot": [
    [
     "maKH",
     "TEXT",
     "PRIMARY KEY",
     "trỏ hoSoKhach.maKhachHang"
    ],
    [
     "phuTrach",
     "TEXT",
     "",
     "tên đăng nhập nhân sự phụ trách quan hệ"
    ],
    [
     "giaiDoan",
     "TEXT",
     "",
     "moi · tuvan · chotky · onboarding · donghanh · rui · roi"
    ],
    [
     "henTiep",
     "TEXT",
     "",
     "ngày hẹn chạm tiếp (YYYY-MM-DD)"
    ],
    [
     "ghiChu",
     "TEXT",
     "",
     ""
    ],
    [
     "capNhatLuc",
     "TEXT",
     "",
     ""
    ],
    [
     "boiAi",
     "TEXT",
     "",
     ""
    ]
   ]
  },
  {
   "ten": "crmCoHoi",
   "mo": "Cơ hội bán: giá trị, giai đoạn, người phụ trách",
   "doc": "Theo quyền CRM; lọc theo người phụ trách",
   "ghi": "Mức \"sửa\" trở lên",
   "cot": [
    [
     "id",
     "TEXT",
     "PRIMARY KEY",
     ""
    ],
    [
     "maKH",
     "TEXT",
     "NOT NULL",
     "nhà nào (hoSoKhach.maKhachHang)"
    ],
    [
     "ten",
     "TEXT",
     "NOT NULL",
     "tên cơ hội: \"Nâng Tầng 4\", \"Gia hạn 365\""
    ],
    [
     "giaTri",
     "INTEGER",
     "NOT NULL",
     "giá trị dự kiến (đồng), > 0"
    ],
    [
     "giaiDoan",
     "TEXT",
     "NOT NULL",
     "moi · tuvan · baogia · damphan · chotky"
    ],
    [
     "trangThai",
     "TEXT",
     "NOT NULL DEFAULT 'mo'",
     "mo · thang · thua"
    ],
    [
     "lyDoThua",
     "TEXT",
     "",
     "bắt buộc khi trangThai='thua'"
    ],
    [
     "duKienChot",
     "TEXT",
     "",
     "ngày dự kiến chốt (YYYY-MM-DD)"
    ],
    [
     "nguoiPhuTrach",
     "TEXT",
     "",
     "ai đang đẩy cơ hội (lọc quyền)"
    ],
    [
     "taoLuc",
     "TEXT",
     "",
     ""
    ],
    [
     "capNhatLuc",
     "TEXT",
     "",
     ""
    ],
    [
     "boiAi",
     "TEXT",
     "",
     ""
    ]
   ]
  },
  {
   "ten": "quyenCRM",
   "mo": "Sổ cấp quyền CRM theo từng người (xem · sửa · quản lý, có hạn)",
   "doc": "R01–R02",
   "ghi": "CHỈ Super Admin cấp / thu hồi",
   "cot": [
    [
     "id",
     "TEXT",
     "PRIMARY KEY",
     ""
    ],
    [
     "username",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "muc",
     "TEXT",
     "NOT NULL",
     "xem · sua · quanly"
    ],
    [
     "lyDo",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "boiAi",
     "TEXT",
     "NOT NULL",
     "chỉ R01 cấp được (V50·168)"
    ],
    [
     "capLuc",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "hetHan",
     "TEXT",
     "",
     ""
    ],
    [
     "thuHoiLuc",
     "TEXT",
     "",
     ""
    ],
    [
     "thuHoiBoi",
     "TEXT",
     "",
     ""
    ]
   ]
  },
  {
   "ten": "soCham",
   "mo": "Sổ chạm — tiến trình chăm sóc: nhắn · gọi · WOW · buổi coach",
   "doc": "CRM (dòng thời gian, chạm cuối, KPI) · Coach (đèn xanh / vàng / đỏ)",
   "ghi": "Coach / Tư vấn: nhà mình phụ trách · R01–R04: mọi nhà · tự ghi khi Coach ghi buổi",
   "cot": [
    [
     "id",
     "TEXT",
     "PRIMARY KEY",
     ""
    ],
    [
     "maNha",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "ngay",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "kieu",
     "TEXT",
     "NOT NULL",
     "nhan · goi · wow"
    ],
    [
     "denLuc",
     "TEXT",
     "",
     "đèn của nhà ấy LÚC CHẠM: XANH · VANG · DO"
    ],
    [
     "noiDung",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "canCu",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "aiDuyet",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "boiAi",
     "TEXT",
     "NOT NULL",
     "người thật sự chạm"
    ],
    [
     "ghiLuc",
     "TEXT",
     "NOT NULL",
     ""
    ]
   ]
  },
  {
   "ten": "suKienKH",
   "mo": "Sự kiện của khách (sổ đo, hoạt động) — chống trùng bằng khoá duy nhất",
   "doc": "Đo lường toàn diện khách hàng · Trung tâm đo lường",
   "ghi": "Gia đình gửi từ màn của mình",
   "cot": [
    [
     "id",
     "TEXT",
     "PRIMARY KEY",
     ""
    ],
    [
     "maNha",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "uid",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "loai",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "giaTri",
     "REAL",
     "",
     ""
    ],
    [
     "ngay",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "khoaDuy",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "ghiChu",
     "TEXT",
     "",
     ""
    ],
    [
     "luc",
     "TEXT",
     "NOT NULL",
     ""
    ]
   ]
  },
  {
   "ten": "danhGiaKH",
   "mo": "NPS · CSAT theo tháng của từng người trong nhà",
   "doc": "Đo lường toàn diện khách hàng · Trung tâm đo lường (kh3, kh4)",
   "ghi": "Gia đình chấm",
   "cot": [
    [
     "maNha",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "uid",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "thang",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "nps",
     "INTEGER",
     "",
     ""
    ],
    [
     "csat",
     "INTEGER",
     "",
     ""
    ],
    [
     "ghiChu",
     "TEXT",
     "",
     ""
    ],
    [
     "luc",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "tieuChi",
     "TEXT",
     "",
     ""
    ],
    [
     "coach",
     "TEXT",
     "",
     ""
    ],
    [
     "tuVan",
     "TEXT",
     "",
     ""
    ],
    [
     "(ràng buộc)",
     "",
     "PRIMARY KEY (maNha, uid, thang)",
     ""
    ]
   ]
  },
  {
   "ten": "hoSoThang",
   "mo": "Báo cáo tháng đã chốt của một nhà",
   "doc": "Gia đình (nhà mình) · đội ngũ theo quyền đo lường",
   "ghi": "Chốt theo tháng ở máy chủ",
   "cot": [
    [
     "maNha",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "thang",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "duLieu",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "tiemNang",
     "INTEGER",
     "",
     ""
    ],
    [
     "tangCS",
     "TEXT",
     "",
     ""
    ],
    [
     "chot",
     "INTEGER",
     "NOT NULL DEFAULT 0",
     ""
    ],
    [
     "boiAi",
     "TEXT",
     "",
     ""
    ],
    [
     "luc",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "(ràng buộc)",
     "",
     "PRIMARY KEY (maNha, thang)",
     ""
    ]
   ]
  }
 ],
 "taiChinh": [
  {
   "ten": "kyThu",
   "mo": "Kỳ thu học phí — dựng tự động khi đổi tầng",
   "doc": "Công nợ: gia đình xem nhà mình · ban tài chính / R01–R03 mọi nhà · nhân sự khác nhà mình phụ trách",
   "ghi": "Máy dựng khi đổi tầng",
   "cot": [
    [
     "id",
     "TEXT",
     "PRIMARY KEY",
     ""
    ],
    [
     "maKhachHang",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "tang",
     "INTEGER",
     "NOT NULL",
     ""
    ],
    [
     "ky",
     "INTEGER",
     "NOT NULL",
     "1, 2, 3, 4"
    ],
    [
     "soKy",
     "INTEGER",
     "NOT NULL",
     "tổng số kỳ của tầng này"
    ],
    [
     "ngayThu",
     "INTEGER",
     "NOT NULL",
     "ngày thứ mấy của tầng thì tới kỳ"
    ],
    [
     "phaiThu",
     "REAL",
     "NOT NULL",
     ""
    ],
    [
     "hanLuc",
     "TEXT",
     "",
     "mốc thật, tính từ ngày vào tầng"
    ],
    [
     "congTruoc",
     "TEXT",
     "",
     "kỳ này chỉ thu khi cổng nào đã nghiệm thu"
    ],
    [
     "taoLuc",
     "TEXT",
     "NOT NULL",
     ""
    ]
   ]
  },
  {
   "ten": "phieuThu",
   "mo": "Phiếu thu tiền",
   "doc": "R01–R03 · ban tài chính",
   "ghi": "Ghi: Tư vấn trở lên · duyệt: R01–R03 hoặc kế toán thu · huỷ: R01–R03",
   "cot": [
    [
     "id",
     "TEXT",
     "PRIMARY KEY",
     ""
    ],
    [
     "maKhachHang",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "idKy",
     "TEXT",
     "",
     "trỏ kyThu.id; để trống là khoản thu ngoài lịch"
    ],
    [
     "soTien",
     "REAL",
     "NOT NULL",
     ""
    ],
    [
     "hinhThuc",
     "TEXT",
     "NOT NULL",
     "chuyenKhoan · tienMat · the"
    ],
    [
     "maThamChieu",
     "TEXT",
     "",
     "số giao dịch ngân hàng"
    ],
    [
     "minhChung",
     "TEXT",
     "",
     "mã tệp trên Drive"
    ],
    [
     "nguoiGhi",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "ghiLuc",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "nguoiDuyet",
     "TEXT",
     "",
     "NGƯỜI KHÁC người ghi — xem chú giải ở tai-chinh.js"
    ],
    [
     "duyetLuc",
     "TEXT",
     "",
     ""
    ],
    [
     "trangThai",
     "TEXT",
     "NOT NULL DEFAULT 'choDuyet'",
     "choDuyet · daDuyet · tuChoi"
    ],
    [
     "lyDo",
     "TEXT",
     "",
     ""
    ],
    [
     "ghiChu",
     "TEXT",
     "",
     ""
    ]
   ]
  },
  {
   "ten": "mienGiam",
   "mo": "Miễn giảm học phí",
   "doc": "R01–R03",
   "ghi": "Đề xuất: Coach trở lên · duyệt: R01–R03",
   "cot": [
    [
     "id",
     "TEXT",
     "PRIMARY KEY",
     ""
    ],
    [
     "maKhachHang",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "idKy",
     "TEXT",
     "NOT NULL",
     "trỏ kyThu.id — miễn giảm gắn vào MỘT kỳ"
    ],
    [
     "soTien",
     "REAL",
     "NOT NULL",
     ""
    ],
    [
     "loai",
     "TEXT",
     "NOT NULL",
     "hocBong · anhChiEm · hoanCanh · khuyenMai · khac"
    ],
    [
     "theoLuat",
     "TEXT",
     "NOT NULL",
     "nguyên văn luật hay quyết định cho giảm"
    ],
    [
     "lyDo",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "nguoiDeXuat",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "deXuatLuc",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "nguoiDuyet",
     "TEXT",
     "",
     ""
    ],
    [
     "duyetLuc",
     "TEXT",
     "",
     ""
    ],
    [
     "trangThai",
     "TEXT",
     "NOT NULL DEFAULT 'choDuyet'",
     ""
    ]
   ]
  },
  {
   "ten": "hoanTien",
   "mo": "Hoàn tiền",
   "doc": "R01–R03",
   "ghi": "Đề xuất: Coach trở lên · duyệt: R01–R03",
   "cot": [
    [
     "id",
     "TEXT",
     "PRIMARY KEY",
     ""
    ],
    [
     "maKhachHang",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "idPhieuThu",
     "TEXT",
     "",
     ""
    ],
    [
     "soTien",
     "REAL",
     "NOT NULL",
     ""
    ],
    [
     "theoLuat",
     "TEXT",
     "NOT NULL",
     "nguyên văn luật hoàn của tầng ấy"
    ],
    [
     "lyDo",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "nguoiDeXuat",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "nguoiDuyet",
     "TEXT",
     "",
     ""
    ],
    [
     "deXuatLuc",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "duyetLuc",
     "TEXT",
     "",
     ""
    ],
    [
     "trangThai",
     "TEXT",
     "NOT NULL DEFAULT 'choDuyet'",
     ""
    ]
   ]
  },
  {
   "ten": "hoaHongTra",
   "mo": "Hoa hồng đã trả cho đại sứ",
   "doc": "R01–R03",
   "ghi": "Trả: R01–R03",
   "cot": [
    [
     "id",
     "TEXT",
     "PRIMARY KEY",
     ""
    ],
    [
     "nhaKem",
     "TEXT",
     "NOT NULL",
     "mã nhà được hưởng"
    ],
    [
     "nhaDuocKem",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "tangVuot",
     "INTEGER",
     "NOT NULL",
     ""
    ],
    [
     "bac",
     "TEXT",
     "NOT NULL",
     "B5 · B10, theo G.HH_BAC"
    ],
    [
     "phanTram",
     "REAL",
     "NOT NULL",
     ""
    ],
    [
     "goiCanCu",
     "REAL",
     "NOT NULL",
     "giá gói của nhà ĐƯỢC KÈM"
    ],
    [
     "soTien",
     "REAL",
     "NOT NULL",
     ""
    ],
    [
     "kpiNhaKem",
     "REAL",
     "",
     ""
    ],
    [
     "kpiNhaDuocKem",
     "REAL",
     "",
     ""
    ],
    [
     "maChungCu",
     "TEXT",
     "",
     "trỏ chungCu.ma"
    ],
    [
     "trangThai",
     "TEXT",
     "NOT NULL DEFAULT 'phaiTra'",
     "phaiTra · daTra · huy"
    ],
    [
     "sinhLuc",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "traLuc",
     "TEXT",
     "",
     ""
    ],
    [
     "huyLuc",
     "TEXT",
     "",
     ""
    ],
    [
     "nguoiDuyet",
     "TEXT",
     "",
     ""
    ],
    [
     "lyDo",
     "TEXT",
     "",
     ""
    ]
   ]
  },
  {
   "ten": "chiPhi",
   "mo": "Đề xuất chi và duyệt chi theo mốc tiền",
   "doc": "R01–R03 · ban tài chính",
   "ghi": "Ghi: Trưởng nhóm Coach trở lên · duyệt theo mốc C0–C6 (kế toán chi / kế toán trưởng) · huỷ: R01–R03",
   "cot": [
    [
     "id",
     "TEXT",
     "PRIMARY KEY",
     ""
    ],
    [
     "khoanMuc",
     "TEXT",
     "NOT NULL",
     "danh sách trắng, khai ở chi-tieu.js"
    ],
    [
     "soTien",
     "REAL",
     "NOT NULL",
     ""
    ],
    [
     "ngayChi",
     "TEXT",
     "NOT NULL",
     "mốc TIỀN RA, không phải mốc nhập liệu"
    ],
    [
     "hinhThuc",
     "TEXT",
     "NOT NULL",
     "chuyenKhoan · tienMat · the"
    ],
    [
     "nhaCungCap",
     "TEXT",
     "",
     ""
    ],
    [
     "coHoaDon",
     "INTEGER",
     "NOT NULL DEFAULT 0",
     ""
    ],
    [
     "maHoaDon",
     "TEXT",
     "",
     ""
    ],
    [
     "minhChung",
     "TEXT",
     "",
     ""
    ],
    [
     "dienGiai",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "nguoiDeXuat",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "deXuatLuc",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "nguoiDuyet",
     "TEXT",
     "",
     "NGƯỜI KHÁC người đề xuất"
    ],
    [
     "duyetLuc",
     "TEXT",
     "",
     ""
    ],
    [
     "nguoiDuyet2",
     "TEXT",
     "",
     ""
    ],
    [
     "duyetLuc2",
     "TEXT",
     "",
     ""
    ],
    [
     "nguoiDuyet3",
     "TEXT",
     "",
     ""
    ],
    [
     "duyetLuc3",
     "TEXT",
     "",
     ""
    ],
    [
     "nac",
     "TEXT",
     "",
     "N1…N5, nấc THẬT đã áp (gồm cả gộp 7 ngày)"
    ],
    [
     "baoGia",
     "TEXT",
     "",
     "danh sách báo giá, JSON"
    ],
    [
     "soBaoGia",
     "INTEGER",
     "NOT NULL DEFAULT 0",
     ""
    ],
    [
     "soHopDong",
     "TEXT",
     "",
     ""
    ],
    [
     "trangThai",
     "TEXT",
     "NOT NULL DEFAULT 'choDuyet'",
     "choDuyet · daDuyet · tuChoi · huy"
    ],
    [
     "tuGhi",
     "INTEGER",
     "NOT NULL DEFAULT 0",
     ""
    ],
    [
     "idBangLuong",
     "TEXT",
     "",
     ""
    ],
    [
     "huyLuc",
     "TEXT",
     "",
     ""
    ],
    [
     "lyDo",
     "TEXT",
     "",
     ""
    ]
   ]
  },
  {
   "ten": "quyenTaiChinh",
   "mo": "Vị trí ban tài chính theo từng người (kế toán thu / chi / trưởng · quản lý phòng)",
   "doc": "R01–R03",
   "ghi": "CHỈ Super Admin cấp / thu hồi",
   "cot": [
    [
     "id",
     "TEXT",
     "PRIMARY KEY",
     ""
    ],
    [
     "username",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "chucNang",
     "TEXT",
     "NOT NULL",
     "keToan · keToanTruong"
    ],
    [
     "mocToiDa",
     "TEXT",
     "",
     "C1…C6, chỉ có nghĩa với keToanTruong"
    ],
    [
     "lyDo",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "boiAi",
     "TEXT",
     "NOT NULL",
     "chỉ R01 cấp được (V50·168)"
    ],
    [
     "capLuc",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "hetHan",
     "TEXT",
     "",
     "vắng nghĩa là không hết hạn"
    ],
    [
     "thuHoiLuc",
     "TEXT",
     "",
     ""
    ],
    [
     "thuHoiBoi",
     "TEXT",
     "",
     ""
    ]
   ]
  },
  {
   "ten": "giaoDichNganHang",
   "mo": "Giao dịch ngân hàng để đối chiếu thu",
   "doc": "R01–R03 · kế toán thu",
   "ghi": "Nhập tay / đối chiếu: R01–R03 hoặc kế toán thu · cửa ngân hàng dùng khoá riêng",
   "cot": [
    [
     "id",
     "TEXT",
     "PRIMARY KEY",
     ""
    ],
    [
     "soTaiKhoan",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "maGiaoDich",
     "TEXT",
     "NOT NULL",
     "mã ngân hàng cấp, duy nhất theo tài khoản"
    ],
    [
     "huong",
     "TEXT",
     "NOT NULL",
     "vao · ra"
    ],
    [
     "soTien",
     "REAL",
     "NOT NULL",
     ""
    ],
    [
     "noiDung",
     "TEXT",
     "",
     "nội dung chuyển khoản, chữ của người gửi"
    ],
    [
     "luc",
     "TEXT",
     "NOT NULL",
     "mốc ngân hàng ghi"
    ],
    [
     "nhanLuc",
     "TEXT",
     "NOT NULL",
     "mốc hệ nhận được"
    ],
    [
     "nguon",
     "TEXT",
     "NOT NULL",
     "webhook · nhapTay"
    ],
    [
     "nguoiNhap",
     "TEXT",
     "",
     "chỉ có khi nhapTay"
    ],
    [
     "idPhieuThu",
     "TEXT",
     "",
     "khớp với phiếu nào"
    ],
    [
     "idChiPhi",
     "TEXT",
     "",
     "hoặc khoản chi nào"
    ],
    [
     "khopLuc",
     "TEXT",
     "",
     ""
    ],
    [
     "khopBoi",
     "TEXT",
     "",
     ""
    ]
   ]
  },
  {
   "ten": "ketToanButToan",
   "mo": "Bút toán kế toán",
   "doc": "R01–R03",
   "ghi": "R01–R03",
   "cot": [
    [
     "id",
     "INTEGER",
     "PRIMARY KEY AUTOINCREMENT",
     ""
    ],
    [
     "ngay",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "dienGiai",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "tkNo",
     "TEXT",
     "NOT NULL",
     "ghi Nợ tài khoản nào"
    ],
    [
     "tkCo",
     "TEXT",
     "NOT NULL",
     "ghi Có tài khoản nào (khác tkNo)"
    ],
    [
     "soTien",
     "INTEGER",
     "NOT NULL",
     "đồng, > 0"
    ],
    [
     "chungTu",
     "TEXT",
     "",
     ""
    ],
    [
     "nguoiGhi",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "ghiLuc",
     "TEXT",
     "NOT NULL",
     ""
    ]
   ]
  },
  {
   "ten": "ketToanHoaDon",
   "mo": "Hoá đơn",
   "doc": "R01–R03",
   "ghi": "R01–R03",
   "cot": [
    [
     "id",
     "INTEGER",
     "PRIMARY KEY AUTOINCREMENT",
     ""
    ],
    [
     "soHD",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "loai",
     "TEXT",
     "NOT NULL",
     "ra · vao"
    ],
    [
     "doiTuong",
     "TEXT",
     "",
     ""
    ],
    [
     "tienHang",
     "INTEGER",
     "NOT NULL",
     ""
    ],
    [
     "thueSuat",
     "REAL",
     "NOT NULL DEFAULT 0",
     ""
    ],
    [
     "tienThue",
     "INTEGER",
     "NOT NULL DEFAULT 0",
     ""
    ],
    [
     "ngay",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "daGhiSo",
     "INTEGER",
     "NOT NULL DEFAULT 0",
     ""
    ],
    [
     "nguoiGhi",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "ghiLuc",
     "TEXT",
     "NOT NULL",
     ""
    ]
   ]
  },
  {
   "ten": "ketToanToKhai",
   "mo": "Tờ khai thuế",
   "doc": "R01–R03",
   "ghi": "R01–R03",
   "cot": [
    [
     "loai",
     "TEXT",
     "NOT NULL",
     "GTGT · TNCN · TNDN · MONBAI"
    ],
    [
     "ky",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "soTien",
     "INTEGER",
     "NOT NULL DEFAULT 0",
     ""
    ],
    [
     "trangThai",
     "TEXT",
     "NOT NULL",
     "chuaKhai · daKhai · daNop"
    ],
    [
     "hanNop",
     "TEXT",
     "",
     ""
    ],
    [
     "nguoiKhai",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "ghiLuc",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "(ràng buộc)",
     "",
     "PRIMARY KEY (loai, ky)",
     ""
    ]
   ]
  },
  {
   "ten": "heSoLuong",
   "mo": "Hệ số lương",
   "doc": "R01–R03",
   "ghi": "CHỈ Super Admin",
   "cot": [
    [
     "id",
     "TEXT",
     "PRIMARY KEY",
     ""
    ],
    [
     "viTri",
     "TEXT",
     "NOT NULL",
     "keToanThu · keToanChi · keToanTruong"
    ],
    [
     "tuKy",
     "TEXT",
     "NOT NULL",
     "có hiệu lực từ kỳ này trở đi (YYYY-MM)"
    ],
    [
     "luongCung",
     "INTEGER",
     "NOT NULL",
     "tầng 1"
    ],
    [
     "tranKpi",
     "INTEGER",
     "NOT NULL",
     "tầng 2 khi đạt 100 điểm"
    ],
    [
     "lyDo",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "boiAi",
     "TEXT",
     "NOT NULL",
     "chỉ R01"
    ],
    [
     "datLuc",
     "TEXT",
     "NOT NULL",
     ""
    ]
   ]
  },
  {
   "ten": "bangLuong",
   "mo": "Bảng lương",
   "doc": "Mỗi người xem dòng của mình · R01–R03 / ban tài chính xem đủ",
   "ghi": "Chốt: R01–R03 / ban tài chính",
   "cot": [
    [
     "id",
     "TEXT",
     "PRIMARY KEY",
     ""
    ],
    [
     "ky",
     "TEXT",
     "NOT NULL",
     "YYYY-MM"
    ],
    [
     "username",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "viTri",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "diem",
     "REAL",
     "",
     "null nghĩa là KHÔNG CÓ GÌ ĐỂ ĐO trong kỳ"
    ],
    [
     "bacDiem",
     "TEXT",
     "",
     ""
    ],
    [
     "soDo",
     "TEXT",
     "NOT NULL",
     "JSON số đo thô của từng thước, đông cứng"
    ],
    [
     "trongBoQua",
     "REAL",
     "",
     "phần trọng số rơi vào thước không đo được"
    ],
    [
     "luongCung",
     "INTEGER",
     "NOT NULL DEFAULT 0",
     ""
    ],
    [
     "phanKpi",
     "INTEGER",
     "NOT NULL DEFAULT 0",
     ""
    ],
    [
     "ghiNhan",
     "INTEGER",
     "NOT NULL DEFAULT 0",
     "tầng 3, do Giám đốc quyết"
    ],
    [
     "ghiNhanVi",
     "TEXT",
     "",
     ""
    ],
    [
     "duoi60",
     "TEXT",
     "",
     "BẮT BUỘC khi điểm < 60: quyết định của người chốt"
    ],
    [
     "idHeSo",
     "TEXT",
     "",
     "dòng hệ số đã dùng, để dựng lại được"
    ],
    [
     "trangThai",
     "TEXT",
     "NOT NULL DEFAULT 'nhap'",
     "nhap · daChot"
    ],
    [
     "nguoiChot",
     "TEXT",
     "",
     ""
    ],
    [
     "chotLuc",
     "TEXT",
     "",
     ""
    ]
   ]
  },
  {
   "ten": "nhacThu",
   "mo": "Lịch sử nhắc thu",
   "doc": "Tư vấn trở lên",
   "ghi": "Tư vấn trở lên",
   "cot": [
    [
     "id",
     "TEXT",
     "PRIMARY KEY",
     ""
    ],
    [
     "maKhachHang",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "idKy",
     "TEXT",
     "",
     ""
    ],
    [
     "kenh",
     "TEXT",
     "NOT NULL",
     "goiDien · nhanTin · email · gapMat"
    ],
    [
     "noiDung",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "ketQua",
     "TEXT",
     "NOT NULL",
     "huaTra · khongLienLac · xinKhatNo · tuChoi · daTra"
    ],
    [
     "henLuc",
     "TEXT",
     "",
     "nhà hẹn trả ngày nào, nếu có hẹn"
    ],
    [
     "boi",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "luc",
     "TEXT",
     "NOT NULL",
     ""
    ]
   ]
  },
  {
   "ten": "soCredit",
   "mo": "Sổ credit (nạp · tiêu · thưởng · hoàn) — chống trùng bằng khoá duy nhất",
   "doc": "Ví của nhà · Credit (tài chính) · Trung tâm đo lường",
   "ghi": "Tiêu: Coach nhà mình / nhà tự phục vụ · nạp từ phiếu thu: R01–R03 hoặc kế toán thu · điều chỉnh: CHỈ Super Admin",
   "cot": [
    [
     "id",
     "TEXT",
     "PRIMARY KEY",
     ""
    ],
    [
     "maNha",
     "TEXT",
     "NOT NULL",
     "mã khách hàng"
    ],
    [
     "loai",
     "TEXT",
     "NOT NULL",
     "tang · thuong · traPhi"
    ],
    [
     "so",
     "INTEGER",
     "NOT NULL",
     "dương = cộng · âm = trừ"
    ],
    [
     "viec",
     "TEXT",
     "NOT NULL",
     "tang-T1 · dang-ky · nap · thuong:<hd> · tieu:<hd> · hoan-tieu · dieu-chinh"
    ],
    [
     "khoaDuy",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "tang",
     "INTEGER",
     "",
     ""
    ],
    [
     "cap",
     "INTEGER",
     "",
     ""
    ],
    [
     "thamChieu",
     "TEXT",
     "",
     ""
    ],
    [
     "ghiChu",
     "TEXT",
     "",
     ""
    ],
    [
     "boiAi",
     "TEXT",
     "",
     ""
    ],
    [
     "luc",
     "TEXT",
     "NOT NULL",
     ""
    ]
   ]
  },
  {
   "ten": "viCredit",
   "mo": "Ví credit của một nhà: cấp, nhóm",
   "doc": "Nhà mình · đội ngũ theo quyền",
   "ghi": "Máy chủ cập nhật theo sổ credit",
   "cot": [
    [
     "maNha",
     "TEXT",
     "PRIMARY KEY",
     ""
    ],
    [
     "cap",
     "INTEGER",
     "NOT NULL DEFAULT 1",
     ""
    ],
    [
     "nhom",
     "TEXT",
     "NOT NULL DEFAULT 'CS'",
     ""
    ],
    [
     "moLuc",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "suaLuc",
     "TEXT",
     "",
     ""
    ],
    [
     "boiAi",
     "TEXT",
     "",
     ""
    ]
   ]
  },
  {
   "ten": "bangGia",
   "mo": "Bảng giá đang áp dụng",
   "doc": "R01–R03",
   "ghi": "Đổi giá: CHỈ Super Admin",
   "cot": [
    [
     "id",
     "TEXT",
     "PRIMARY KEY",
     ""
    ],
    [
     "tang",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "gia",
     "INTEGER",
     "NOT NULL",
     ""
    ],
    [
     "lyDo",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "boiAi",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "vaiBoiAi",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "ghiLuc",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "dong",
     "INTEGER",
     "NOT NULL DEFAULT 0",
     "đóng bậc, KHÔNG xoá"
    ],
    [
     "ten",
     "TEXT",
     "",
     ""
    ],
    [
     "gom",
     "TEXT",
     "",
     ""
    ],
    [
     "khong",
     "TEXT",
     "",
     ""
    ],
    [
     "nhip",
     "TEXT",
     "",
     ""
    ],
    [
     "hoan",
     "TEXT",
     "",
     ""
    ]
   ]
  },
  {
   "ten": "taiKhoanNhan",
   "mo": "Tài khoản ngân hàng / QR nhận tiền",
   "doc": "R01–R04 · phụ huynh, học viên (để chuyển khoản)",
   "ghi": "R01–R02",
   "cot": [
    [
     "id",
     "TEXT",
     "PRIMARY KEY CHECK (id = 'gita365')",
     ""
    ],
    [
     "nganHang",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "chuTk",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "soTk",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "qrDataUrl",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "noiDungCk",
     "TEXT",
     "NOT NULL DEFAULT ''",
     ""
    ],
    [
     "capLuc",
     "TEXT",
     "NOT NULL",
     ""
    ],
    [
     "capBoi",
     "TEXT",
     "NOT NULL",
     ""
    ]
   ]
  }
 ]
};
