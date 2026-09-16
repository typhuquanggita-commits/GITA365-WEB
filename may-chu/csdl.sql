-- ═══════════════════════════════════════════════════════════════
--  GITA 365 · NỀN DỮ LIỆU MỚI
--
--  SQLite. Chạy y nguyên trên Cloudflare D1 — D1 CHÍNH LÀ SQLite, nên
--  tệp này không phải bản mô phỏng của lược đồ thật, nó LÀ lược đồ
--  thật. Bộ thử ở tools/thu-csdl-moi.js chạy đúng những câu lệnh này
--  trên node:sqlite, không phải trên một bản dựng lại gần giống.
--
--  ── VÌ SAO PHẢI RỜI SHEETS ──
--
--  Đo được ở tools/do-tai-may-chu.js, không phải phỏng đoán:
--
--    · một sổ Sheets chứa 79.033 tài khoản (trần 10 triệu ô)
--    · MỘT lượt gọi có xác thực đọc 50 ô × số tài khoản, vì Store.doc()
--      đọc CẢ TRANG mỗi lần chạm bảng
--    · ở 500.000 tài khoản, một lượt gọi đòi 25 triệu ô — nhiều hơn
--      sức chứa của cả cuốn sổ
--
--  Chỗ chữa không nằm ở việc đọc nhanh hơn. Nó nằm ở chỗ THÔI ĐỌC CẢ
--  BẢNG: mỗi đường tra cứu có một chỉ mục, và mỗi lượt gọi chạm đúng
--  vài dòng nó cần.
--
--  ── LUẬT CỦA TỆP NÀY ──
--
--  1. MỌI ĐƯỜNG TRA CỨU CÓ THẬT TRONG MÃ ĐỀU PHẢI CÓ CHỈ MỤC.
--     Thiếu một cái là SQLite quét cả bảng, và cả lượt chuyển nền này
--     mất sạch ý nghĩa ở đúng đường ấy. Danh sách đường tra cứu đọc từ
--     server/*.gs, không nghĩ ra.
--
--  2. CHỖ NÀO SO CHỮ THƯỜNG THÌ CHỈ MỤC CŨNG PHẢI THEO CHỮ THƯỜNG.
--     Mã cũ so String(x.email).toLowerCase(). Chỉ mục trên cột gốc
--     KHÔNG dùng được cho phép so ấy — SQLite bỏ qua chỉ mục và quét
--     cả bảng, im lặng, đúng cái hại mà chỉ mục sinh ra để tránh.
--
--  3. HỒ SƠ NGƯỜI DÙNG KHÔNG NẰM TRONG BẢNG NÀY.
--     Xem chú giải ở hosoApp.
-- ═══════════════════════════════════════════════════════════════

PRAGMA foreign_keys = ON;

-- ─────────────────────────────────────────────────────────────
--  NGƯỜI DÙNG
--
--  Không xoá dòng bao giờ: nghỉ việc thì đặt deletedAt. Cùng luật với
--  GITA_KHONG_DON của bộ dọn.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  username      TEXT NOT NULL,
  hoTen         TEXT,
  email         TEXT,
  dienThoai     TEXT,
  role          TEXT NOT NULL,
  portal        TEXT,
  studentId     TEXT,
  pwSalt        TEXT,
  pwHash        TEXT,
  active        INTEGER NOT NULL DEFAULT 1,
  createdAt     TEXT,
  updatedAt     TEXT,
  deletedAt     TEXT,
  maKhachHang   TEXT,
  boTro         TEXT,
  mustChangePw  INTEGER NOT NULL DEFAULT 0,
  pwDoiLuc      TEXT
);

-- Đăng nhập tra bằng tên đăng nhập HOẶC email, cả hai đều hạ chữ
-- thường trước khi so. Chỉ mục phải hạ y hệt — xem luật 2 ở đầu tệp.
CREATE UNIQUE INDEX IF NOT EXISTS ix_users_username ON users (lower(username));
CREATE INDEX        IF NOT EXISTS ix_users_email    ON users (lower(email));

-- Mã khách hàng. MỘT PHẦN, vì phần lớn tài khoản nội bộ không có mã và
-- chỉ mục một phần thì không phải mang theo hàng trăm nghìn dòng trống.
--
-- Và DUY NHẤT, không chỉ để tra cho nhanh. Mã số khách hàng là thứ việc
-- nâng tầng dùng để dò phiếu thanh toán, nên hai nhà chung một mã là
-- tiền nhà này mở tầng cho nhà kia. Bộ đếm ở maKhachHangMoi() đã lo
-- chuyện sinh mã không trùng; chỉ mục này là lớp chặn thứ hai, ở tầng
-- dữ liệu, cho ngày bộ đếm sai vì một lý do chưa ai nghĩ ra.
CREATE UNIQUE INDEX IF NOT EXISTS ix_users_makh ON users (maKhachHang)
  WHERE maKhachHang IS NOT NULL AND maKhachHang <> '';

-- ─────────────────────────────────────────────────────────────
--  HỌC VIÊN
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id          TEXT PRIMARY KEY,
  hoTen       TEXT,
  lop         TEXT,
  tinh        TEXT,
  tier        INTEGER,
  status      TEXT,
  kpi         REAL,
  phuHuynhId  TEXT,
  coach       TEXT,
  createdAt   TEXT,
  deletedAt   TEXT
);

-- Mỗi lượt gọi có xác thực đều tra tầng của học viên gắn với tài khoản.
CREATE INDEX IF NOT EXISTS ix_students_ph   ON students (phuHuynhId);
-- Màn quyền-xem-khách lọc theo tầng và bỏ hồ sơ đã xoá.
CREATE INDEX IF NOT EXISTS ix_students_tier ON students (tier) WHERE deletedAt IS NULL;

-- ─────────────────────────────────────────────────────────────
--  PHIÊN
--
--  Bảng NÓNG NHẤT của cả hệ: mọi yêu cầu có xác thực đều tra nó đúng
--  một lần, theo token. Token là khoá chính nên phép tra ấy là một
--  lượt tìm trên cây, không phụ thuộc số dòng.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,          -- chính là token
  uid        TEXT NOT NULL,
  username   TEXT,
  role       TEXT,
  portal     TEXT,
  studentId  TEXT,
  exp        INTEGER NOT NULL,
  createdAt  TEXT
);

-- Đổi mật khẩu thì ĐÁ mọi phiên khác của cùng người — kẻ giữ token cũ
-- mất quyền ngay. Không có chỉ mục này thì mỗi lần đổi mật khẩu là một
-- lượt quét cả bảng phiên.
CREATE INDEX IF NOT EXISTS ix_sessions_uid ON sessions (uid);
-- Bộ dọn tìm phiên đã quá hạn.
CREATE INDEX IF NOT EXISTS ix_sessions_exp ON sessions (exp);

-- ─────────────────────────────────────────────────────────────
--  ĐĂNG KÝ CHỜ
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dangKyCho (
  id             TEXT PRIMARY KEY,
  email          TEXT,
  hoTen          TEXT,
  dienThoai      TEXT,
  tenCon         TEXT,
  lop            TEXT,
  tinh           TEXT,
  maGioiThieu    TEXT,
  otpSalt        TEXT,
  otpHash        TEXT,
  otpHan         INTEGER,
  otpSai         INTEGER DEFAULT 0,
  tokenKichHoat  TEXT,
  tokenHan       INTEGER,
  trangThai      TEXT,
  createdAt      TEXT
);

CREATE INDEX IF NOT EXISTS ix_dkc_email ON dangKyCho (lower(email), trangThai);
-- CHỈ MỤC ĐẦY ĐỦ, KHÔNG PHẢI CHỈ MỤC MỘT PHẦN.
--
-- Bản đầu tôi viết  ... WHERE tokenKichHoat IS NOT NULL AND tokenKichHoat <> ''
-- cho gọn. SQLite chỉ dùng một chỉ mục một phần khi nó CHỨNG MINH ĐƯỢC
-- câu truy vấn nằm trọn trong điều kiện của chỉ mục. Câu thật hỏi
-- tokenKichHoat = ? — mà tham số ấy có thể là chuỗi rỗng, nên SQLite
-- không chứng minh được vế <> '' và BỎ QUA chỉ mục.
--
-- Nó không báo lỗi. Nó quét cả bảng, im lặng — đúng cái hại mà chỉ mục
-- sinh ra để tránh, ở đúng chỗ vừa dựng ra để tránh. Phép soi EXPLAIN
-- QUERY PLAN ở tools/thu-csdl-moi.js bắt được ngay lần chạy đầu.
--
-- dangKyCho giữ 30 ngày nên bảng nhỏ; một chỉ mục đầy đủ ở đây gần như
-- không tốn gì, còn một chỉ mục "tiết kiệm" mà không ai dùng thì tốn
-- đúng bằng cả bảng.
CREATE INDEX IF NOT EXISTS ix_dkc_token ON dangKyCho (tokenKichHoat, trangThai);
CREATE INDEX IF NOT EXISTS ix_dkc_tao   ON dangKyCho (createdAt);

-- ─────────────────────────────────────────────────────────────
--  NHẬT KÝ
--
--  Chỉ ghi, gần như không đọc — trừ lúc dọn và lúc đi tra một sự cố.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit (
  id        TEXT PRIMARY KEY,
  luc       TEXT,
  uid       TEXT,
  username  TEXT,
  viec      TEXT,
  doiTuong  TEXT,
  chiTiet   TEXT
);

CREATE INDEX IF NOT EXISTS ix_audit_luc ON audit (luc);
CREATE INDEX IF NOT EXISTS ix_audit_uid ON audit (uid, luc);

-- ─────────────────────────────────────────────────────────────
--  HỒ SƠ NGƯỜI DÙNG — CHỈ GIỮ PHẦN TRA CỨU, KHÔNG GIỮ RUỘT
--
--  Ruột hồ sơ (duLieu) là một khối JSON cộng dồn theo thời gian, trần
--  đẩy lên 512 KB mỗi lượt (GITA_TRAN_DONGBO_KB).
--
--  MỘT LỖI CỦA NỀN CŨ, GHI LẠI ĐỂ KHÔNG MANG THEO: Sheets chỉ nhận
--  50.000 KÝ TỰ MỖI Ô, mà nền cũ nhét cả khối JSON ấy vào một ô. Hồ sơ
--  quá 50.000 ký tự là chạm trần của Sheets trong khi mã vẫn tin trần
--  là 512 KB — hai con số lệch nhau hơn mười lần, và chỗ hỏng rơi vào
--  đúng những người dùng LÂU NHẤT.
--
--  Nên ruột đi ra kho tệp (R2), bảng này chỉ giữ chỗ trỏ và kích cỡ.
--  Nửa triệu hồ sơ × 50 KB là 25 GB — quá sức một cơ sở dữ liệu D1
--  (trần 10 GB), vừa vặn với kho tệp (10 GB đầu miễn phí).
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hosoApp (
  id       TEXT PRIMARY KEY,
  uid      TEXT NOT NULL,
  u        TEXT,
  role     TEXT,
  khoaTep  TEXT NOT NULL,      -- chỗ trỏ tới ruột trong kho tệp
  coByte   INTEGER DEFAULT 0,  -- cỡ ruột, để soi người lưu quá nhiều
  moc      TEXT,
  taoLuc   TEXT,
  suaLuc   TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS ix_hosoapp_uid ON hosoApp (uid);

CREATE TABLE IF NOT EXISTS hosoAppSaoLuu (
  id       TEXT PRIMARY KEY,
  uid      TEXT NOT NULL,
  khoaTep  TEXT NOT NULL,
  coByte   INTEGER DEFAULT 0,
  luc      TEXT
);

-- Giữ mười bản gần nhất MỖI NGƯỜI (GITA_HAN). Chỉ mục xếp sẵn theo
-- người rồi theo thời gian giảm dần, nên phép "lấy mười bản mới nhất
-- của người này" đọc đúng mười dòng.
CREATE INDEX IF NOT EXISTS ix_hososlu_uid ON hosoAppSaoLuu (uid, luc DESC);

-- ═════════════════════════════════════════════════════════════
--  TỆP KHÁCH HÀNG CHUẨN
--
--  Tới bản 9.87, dữ liệu một nhà nằm rải ở bốn chỗ: tài khoản phụ
--  huynh ở users, hồ sơ con ở students, ruột hồ sơ ở kho tệp, và lượt
--  đăng ký ở dangKyCho. Không chỗ nào trả lời được câu đơn giản nhất
--  của người làm nghề: "nhà này vào từ bao giờ, ai tư vấn, ai kèm,
--  đang ở tầng mấy, đã đóng tới đâu, còn nợ gì".
--
--  Bảng này là chỗ trả lời. MỘT DÒNG MỘT NHÀ, khoá là mã khách hàng —
--  cùng cái mã mà phiếu thu và hoa hồng đều trỏ vào, nên ba sổ nối
--  được với nhau mà không phải đoán.
--
--  KHÔNG CHÉP LẠI THỨ ĐÃ CÓ. Tên phụ huynh nằm ở users, tên con nằm ở
--  students; ở đây chỉ giữ CHỖ TRỎ. Chép lại là dựng bản thứ hai của
--  một sự thật, và hai bản thì sẽ có ngày lệch nhau.
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS hoSoKhach (
  maKhachHang TEXT PRIMARY KEY,
  uidPhuHuynh TEXT NOT NULL,      -- trỏ users.id
  maHocVien   TEXT,               -- trỏ students.id
  tuyen       TEXT NOT NULL DEFAULT 'GITA365',
  tang        INTEGER NOT NULL DEFAULT 0,
  band        TEXT,               -- XANH · VANG · DO · XAM, theo G.MT_BANG
  coach       TEXT,               -- tên đăng nhập người kèm
  tuVan       TEXT,               -- tên đăng nhập người tư vấn
  boTro       TEXT,               -- mã nhà giới thiệu — gốc của hoa hồng
  trangThai   TEXT NOT NULL DEFAULT 'dangHoc',  -- dangHoc · tamDung · nghi · xong
  vaoLuc      TEXT,
  suaLuc      TEXT,
  ghiChu      TEXT
);

CREATE INDEX IF NOT EXISTS ix_hsk_ph    ON hoSoKhach (uidPhuHuynh);
CREATE INDEX IF NOT EXISTS ix_hsk_coach ON hoSoKhach (coach, tang);
CREATE INDEX IF NOT EXISTS ix_hsk_tuvan ON hoSoKhach (tuVan, trangThai);
-- Hoa hồng đi ngược từ nhà được kèm về nhà bảo trợ, nên đường ấy phải
-- tra được. MỘT PHẦN, vì phần lớn nhà không có ai bảo trợ.
CREATE INDEX IF NOT EXISTS ix_hsk_botro ON hoSoKhach (boTro)
  WHERE boTro IS NOT NULL AND boTro <> '';

-- Mỗi lần đổi tầng một dòng. Không sửa cột tang rồi thôi: câu "nhà này
-- lên tầng ba lúc nào, ai duyệt, KPI bao nhiêu" là câu người làm nghề
-- hỏi hằng tuần, và nó chỉ trả lời được nếu hôm ấy đã ghi.
CREATE TABLE IF NOT EXISTS lichSuTang (
  id          TEXT PRIMARY KEY,
  maKhachHang TEXT NOT NULL,
  tuTang      INTEGER,
  denTang     INTEGER NOT NULL,
  kpi         REAL,
  boi         TEXT,
  luc         TEXT NOT NULL,
  lyDo        TEXT
);

CREATE INDEX IF NOT EXISTS ix_lst_nha ON lichSuTang (maKhachHang, luc DESC);

-- ═════════════════════════════════════════════════════════════
--  TÀI CHÍNH — PHẢI THU TÁCH KHỎI ĐÃ THU
--
--  ĐÂY LÀ CHỖ NỀN CŨ KHÔNG DIỄN TẢ ĐƯỢC.
--
--  Bảng thanhToan cũ có MỘT dòng cho mỗi (nhà × tầng), với trangThai
--  'daXacNhan'. Tức là nó chỉ nói được "tầng này đã trả tiền hay
--  chưa" — một câu đúng/sai.
--
--  Nhưng chính bảng học phí của Học viện khai nhịp thu KHÁC hẳn:
--
--    T1  thu một lần
--    T2  một lần, hoặc HAI kỳ (trước ngày 1, trước ngày 11)
--    T3  BA kỳ — trước ngày 1, ngày 43, ngày 64
--    T4  BỐN kỳ theo quý, "không thu trước cho cả năm"
--    T5  bốn kỳ như T4
--
--  Với một dòng đúng/sai thì một nhà tầng bốn đóng xong kỳ MỘT đã được
--  tính là "đã thanh toán tầng bốn" — và ba kỳ còn lại biến mất khỏi
--  sổ. Không phải sai một con số; là không có chỗ để ghi con số ấy.
--
--  Nên tách hai bảng:
--    kyThu    — PHẢI THU: mỗi kỳ một dòng, sinh ra lúc vào tầng
--    phieuThu — ĐÃ THU: mỗi lần nhận tiền một dòng, trỏ về một kỳ
--
--  Công nợ = kyThu chưa đủ phieuThu. Không tách thì không có phép trừ
--  ấy, và "còn nợ bao nhiêu" là câu không trả lời được bằng dữ liệu.
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS kyThu (
  id          TEXT PRIMARY KEY,
  maKhachHang TEXT NOT NULL,
  tang        INTEGER NOT NULL,
  ky          INTEGER NOT NULL,    -- 1, 2, 3, 4
  soKy        INTEGER NOT NULL,    -- tổng số kỳ của tầng này
  ngayThu     INTEGER NOT NULL,    -- ngày thứ mấy của tầng thì tới kỳ
  phaiThu     REAL NOT NULL,
  hanLuc      TEXT,                -- mốc thật, tính từ ngày vào tầng
  congTruoc   TEXT,                -- kỳ này chỉ thu khi cổng nào đã nghiệm thu
  taoLuc      TEXT NOT NULL
);

-- Một nhà một tầng một kỳ — đúng một dòng. Sinh lịch hai lần là nhân
-- đôi công nợ của một nhà, và không ai nhìn ra cho tới lúc đối chiếu.
CREATE UNIQUE INDEX IF NOT EXISTS ix_kythu_mot ON kyThu (maKhachHang, tang, ky);
CREATE INDEX IF NOT EXISTS ix_kythu_han ON kyThu (hanLuc);

CREATE TABLE IF NOT EXISTS phieuThu (
  id          TEXT PRIMARY KEY,
  maKhachHang TEXT NOT NULL,
  idKy        TEXT,                -- trỏ kyThu.id; để trống là khoản thu ngoài lịch
  soTien      REAL NOT NULL,
  hinhThuc    TEXT NOT NULL,       -- chuyenKhoan · tienMat · the
  maThamChieu TEXT,                -- số giao dịch ngân hàng
  minhChung   TEXT,                -- mã tệp trên Drive
  nguoiGhi    TEXT NOT NULL,
  ghiLuc      TEXT NOT NULL,
  nguoiDuyet  TEXT,                -- NGƯỜI KHÁC người ghi — xem chú giải ở tai-chinh.js
  duyetLuc    TEXT,
  trangThai   TEXT NOT NULL DEFAULT 'choDuyet',  -- choDuyet · daDuyet · tuChoi
  lyDo        TEXT,
  ghiChu      TEXT
);

CREATE INDEX IF NOT EXISTS ix_pt_nha ON phieuThu (maKhachHang, ghiLuc DESC);
CREATE INDEX IF NOT EXISTS ix_pt_ky  ON phieuThu (idKy, trangThai);
CREATE INDEX IF NOT EXISTS ix_pt_tt  ON phieuThu (trangThai, ghiLuc);

-- Hoàn tiền. Mỗi tầng có luật hoàn riêng, khai ở HP_TANG[].hoan; luật
-- ấy là CHỮ, không phải công thức, nên số tiền hoàn do người quyết và
-- bảng này ghi lại AI quyết, THEO LUẬT NÀO. Máy không tự tính hoàn.
CREATE TABLE IF NOT EXISTS hoanTien (
  id          TEXT PRIMARY KEY,
  maKhachHang TEXT NOT NULL,
  idPhieuThu  TEXT,
  soTien      REAL NOT NULL,
  theoLuat    TEXT NOT NULL,       -- nguyên văn luật hoàn của tầng ấy
  lyDo        TEXT NOT NULL,
  nguoiDeXuat TEXT NOT NULL,
  nguoiDuyet  TEXT,
  deXuatLuc   TEXT NOT NULL,
  duyetLuc    TEXT,
  trangThai   TEXT NOT NULL DEFAULT 'choDuyet'
);

CREATE INDEX IF NOT EXISTS ix_ht_nha ON hoanTien (maKhachHang, deXuatLuc DESC);
CREATE INDEX IF NOT EXISTS ix_ht_tt  ON hoanTien (trangThai);

-- Hoa hồng PHẢI TRẢ. Sinh ra khi nhà được kèm vượt tầng và hai KPI đủ
-- điều kiện; trả ra là một lượt chi riêng, có người duyệt.
CREATE TABLE IF NOT EXISTS hoaHongTra (
  id           TEXT PRIMARY KEY,
  nhaKem       TEXT NOT NULL,      -- mã nhà được hưởng
  nhaDuocKem   TEXT NOT NULL,
  tangVuot     INTEGER NOT NULL,
  bac          TEXT NOT NULL,      -- B5 · B10, theo G.HH_BAC
  phanTram     REAL NOT NULL,
  goiCanCu     REAL NOT NULL,      -- giá gói của nhà ĐƯỢC KÈM
  soTien       REAL NOT NULL,
  kpiNhaKem    REAL,
  kpiNhaDuocKem REAL,
  maChungCu    TEXT,               -- trỏ chungCu.ma
  trangThai    TEXT NOT NULL DEFAULT 'phaiTra',  -- phaiTra · daTra · huy
  sinhLuc      TEXT NOT NULL,
  traLuc       TEXT,
  -- Huỷ PHẢI có mốc, không chỉ có trạng thái. Sổ hoa hồng cân theo kỳ
  -- bằng đẳng thức "đầu kỳ + sinh − trả − huỷ = cuối kỳ"; không biết
  -- khoản ấy huỷ NGÀY NÀO thì không xếp được nó vào kỳ nào, và đẳng
  -- thức không bao giờ cân. Ba trạng thái, ba mốc — thiếu một là thiếu
  -- một chiều của sổ.
  huyLuc       TEXT,
  nguoiDuyet   TEXT,
  lyDo         TEXT
);

-- Một lượt vượt tầng của một nhà sinh ĐÚNG MỘT khoản hoa hồng cho nhà
-- kèm. Không có chỉ mục duy nhất này thì bấm hai lần là trả hai lần.
CREATE UNIQUE INDEX IF NOT EXISTS ix_hh_mot
  ON hoaHongTra (nhaKem, nhaDuocKem, tangVuot);
CREATE INDEX IF NOT EXISTS ix_hh_tt ON hoaHongTra (trangThai, sinhLuc);

-- ═════════════════════════════════════════════════════════════
--  SỔ CHI — NỬA CÒN LẠI CỦA CUỐN SỔ
--
--  Tới bản 9.90 hệ này chỉ có tiền VÀO. Bản kê kế toán phải ghi thẳng
--  ra rằng nó không cộng được một dòng lợi nhuận nào, vì chi phí vận
--  hành không nằm ở đâu cả.
--
--  Một cuốn sổ chỉ có một nửa thì mọi câu hỏi thật đều không trả lời
--  được: tháng này lãi hay lỗ, tầng nào nuôi được chính nó, thêm một
--  Coach thì hoà vốn ở bao nhiêu nhà. Ba câu ấy là ba câu quyết định
--  chiến lược, và không câu nào trả lời được bằng doanh thu.
--
--  HOÁ ĐƠN có hay không là một cột RIÊNG, không phải một ghi chú. Khoản
--  chi không có hoá đơn vẫn là tiền đã ra thật — vẫn phải vào sổ chi —
--  nhưng nó đứng khác khi tính thuế. Gộp hai loại vào một con số là
--  buộc kế toán mở lại cơ sở dữ liệu để tách ra, và lúc ấy bản kê vô
--  dụng.
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS chiPhi (
  id          TEXT PRIMARY KEY,
  khoanMuc    TEXT NOT NULL,      -- danh sách trắng, khai ở chi-tieu.js
  soTien      REAL NOT NULL,
  ngayChi     TEXT NOT NULL,      -- mốc TIỀN RA, không phải mốc nhập liệu
  hinhThuc    TEXT NOT NULL,      -- chuyenKhoan · tienMat · the
  nhaCungCap  TEXT,
  coHoaDon    INTEGER NOT NULL DEFAULT 0,
  maHoaDon    TEXT,
  minhChung   TEXT,
  dienGiai    TEXT NOT NULL,
  nguoiDeXuat TEXT NOT NULL,
  deXuatLuc   TEXT NOT NULL,
  nguoiDuyet  TEXT,               -- NGƯỜI KHÁC người đề xuất
  duyetLuc    TEXT,
  -- Nấc trên cùng đòi HAI chữ ký, không phải một chữ ký cao hơn. Tầng
  -- tài chính của Học viện chỉ có ba vai (R01–R03), nên leo cấp bên
  -- trong ba vai ấy không thêm được lớp nào thật; thêm một người thì có.
  nguoiDuyet2 TEXT,
  duyetLuc2   TEXT,
  -- BA ô chữ ký, không phải hai. Hai thang chồng lên nhau: nấc của
  -- KHOẢN đòi tối đa 2 chữ ký, mốc của CHU KỲ đòi thêm 1. Một khoản 60
  -- triệu trong một tuần đã chi 100 triệu cần đủ ba.
  --
  -- Bản đầu tôi chỉ dựng hai ô, và cổng ghi chữ ký thứ hai lại đòi ô
  -- thứ nhất còn trống — nên chữ ký thứ hai của một khoản cần ba ô
  -- không ghi được vào đâu cả, và khoản ấy đứng im mãi. Bộ thử bắt
  -- được ngay ở phép đo "người thứ hai ký thì khoản mới vào sổ".
  nguoiDuyet3 TEXT,
  duyetLuc3   TEXT,
  nac         TEXT,               -- N1…N5, nấc THẬT đã áp (gồm cả gộp 7 ngày)
  baoGia      TEXT,               -- danh sách báo giá, JSON
  soBaoGia    INTEGER NOT NULL DEFAULT 0,
  soHopDong   TEXT,
  trangThai   TEXT NOT NULL DEFAULT 'choDuyet',  -- choDuyet · daDuyet · tuChoi · huy
  -- Khoản đi LỐI TỰ GHI: dưới ngưỡng phải-xin-duyệt, một người ghi
  -- thẳng vào sổ. Phải đánh dấu thành CỘT chứ không lẫn vào ghi chú:
  -- câu đầu tiên người đi kiểm tra hỏi là "khoản nào có hai người ký,
  -- khoản nào chỉ một" — và câu ấy phải trả lời được bằng phép lọc.
  tuGhi       INTEGER NOT NULL DEFAULT 0,
  -- Khoản chi SINH RA TỪ MỘT DÒNG LƯƠNG ĐÃ CHỐT, không do người gõ.
  --
  -- Lương đã chốt là một khoản tiền Học viện nợ một người. Không đưa
  -- nó vào sổ chi thì bản kê kế toán thiếu đúng khoản chi lớn nhất và
  -- đều đặn nhất, và bộ số khai thuế dựng trên một bản kê thiếu.
  --
  -- Nhưng mở một lối cho khoản mục 'luong' đi thẳng vào sổ ở trạng
  -- thái ĐÃ DUYỆT là mở đúng cái cửa mà cả thang nấc sinh ra để đóng.
  -- Nên cột này KHÔNG phải một cái nhãn tin được: nó là một cái MÓC,
  -- và phép đối chiếu lương soi hai phía như đối chiếu ngân hàng —
  -- dòng lương nào chưa có khoản chi, và khoản chi nào móc vào một
  -- dòng lương không có thật hoặc lệch số tiền.
  idBangLuong TEXT,
  huyLuc      TEXT,
  lyDo        TEXT
);

CREATE INDEX IF NOT EXISTS ix_cp_ngay ON chiPhi (ngayChi DESC);
-- Đối chiếu lương soi theo móc, và soi cả chiều "khoản chi móc vào
-- một dòng lương không có thật" — nên chỉ mục một phần trên móc.
CREATE INDEX IF NOT EXISTS ix_cp_luong ON chiPhi (idBangLuong)
  WHERE idBangLuong IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_cp_tt   ON chiPhi (trangThai, ngayChi);
CREATE INDEX IF NOT EXISTS ix_cp_muc  ON chiPhi (khoanMuc, ngayChi);
-- Phép soi chia nhỏ cộng dồn theo (khoản mục × người đề xuất) trong
-- một cửa sổ bảy ngày. Không có chỉ mục này thì mỗi lượt ghi một khoản
-- chi lặt vặt là một lượt quét cả bảng chi phí.
CREATE INDEX IF NOT EXISTS ix_cp_gop  ON chiPhi (khoanMuc, nguoiDeXuat, ngayChi);
-- Trần chu kỳ cộng MỌI khoản mục của MỘT người, nên nó không dùng được
-- ix_cp_gop ở trên: cột dẫn đầu của chỉ mục ấy là khoanMuc, mà câu này
-- không lọc theo khoanMuc. Phép tính này chạy ở MỖI lượt ghi một khoản
-- chi, nên nó đáng có đường riêng.
CREATE INDEX IF NOT EXISTS ix_cp_nguoi ON chiPhi (nguoiDeXuat, ngayChi);

-- ═════════════════════════════════════════════════════════════
--  QUYỀN TÀI CHÍNH — VÌ SAO LÀ QUYỀN ĐƯỢC CẤP, KHÔNG PHẢI MỘT VAI MỚI
--
--  Chủ hệ thống chốt bản 9.97: khoản dưới 1,5 triệu do BỘ PHẬN KẾ TOÁN
--  nhận báo cáo và phê duyệt; và quyền quản lý dòng tiền lớn có thể
--  CHUYỂN CHO KẾ TOÁN TRƯỞNG khi Super Admin hoặc Admin hệ thống cấp
--  quyền.
--
--  Nhưng bảng vai của Học viện (G.ROLES, R01–R15) KHÔNG CÓ vai kế toán
--  nào cả. Quyền tài chính hiện dừng ở R01 Super Admin, R02 Admin hệ
--  thống, R03 Giám đốc.
--
--  Chèn hai vai mới vào giữa bảng ấy là đánh số lại cả thang: mọi cổng
--  trong hệ neo vào lv, từ trần xem hồ sơ khách tới bậc mở kho nghề.
--  Một lượt chèn là một lượt dịch hàng chục chỗ chặn, và chỗ nào quên
--  thì im lặng mở ra.
--
--  Nên kế toán và kế toán trưởng là CHỨC NĂNG ĐƯỢC CẤP, chồng lên vai
--  đang có. Đó cũng đúng chữ chủ hệ dùng: "cấp quyền cho kế toán
--  trưởng" — cấp quyền, không phải đổi vai.
--
--  HẠN MỨC LÀ MỘT MỐC CÓ TÊN, không phải một con số tự do. Cấp bằng số
--  tự do thì sáu tháng sau có bảy hạn mức khác nhau không ai giải thích
--  được; cấp bằng mốc thì mỗi lượt cấp là một câu trả lời cho câu hỏi
--  "người này đứng ở nấc nào".
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS quyenTaiChinh (
  id         TEXT PRIMARY KEY,
  username   TEXT NOT NULL,
  chucNang   TEXT NOT NULL,      -- keToan · keToanTruong
  mocToiDa   TEXT,               -- C1…C6, chỉ có nghĩa với keToanTruong
  lyDo       TEXT NOT NULL,
  boiAi      TEXT NOT NULL,      -- chỉ R01–R02 cấp được
  capLuc     TEXT NOT NULL,
  hetHan     TEXT,               -- vắng nghĩa là không hết hạn
  thuHoiLuc  TEXT,
  thuHoiBoi  TEXT
);

-- Một người một chức năng — đúng một dòng CÒN HIỆU LỰC. Chỉ mục một
-- phần: dòng đã thu hồi không tính, nên cấp lại sau khi thu hồi vẫn
-- được mà không đụng khoá.
CREATE UNIQUE INDEX IF NOT EXISTS ix_qtc_mot ON quyenTaiChinh (username, chucNang)
  WHERE thuHoiLuc IS NULL;
CREATE INDEX IF NOT EXISTS ix_qtc_ten ON quyenTaiChinh (username);

-- ═════════════════════════════════════════════════════════════
--  GIAO DỊCH NGÂN HÀNG — CÁI ĐỨNG NGOÀI LÀM CHỨNG
--
--  Chủ hệ thống chốt bản 9.98: "Liên kết hệ thống kế toán với tài khoản
--  ngân hàng."
--
--  Tới bản 9.97, mọi con số thu đều do NGƯỜI TRONG HỆ nói ra: một người
--  ghi phiếu, một người duyệt. Hai lớp ấy chặn được nhầm lẫn và chặn
--  được một người làm sai một mình — nhưng chúng không chặn được HAI
--  người cùng nói một câu không đúng, vì cả hai đều ở trong hệ.
--
--  Sao kê ngân hàng là thứ DUY NHẤT trong cả kiến trúc này đứng NGOÀI.
--  Ngân hàng không biết Học viện muốn sổ trông thế nào. Đối chiếu với
--  nó là phép kiểm duy nhất mà không ai bên trong sửa được.
--
--  BẢNG NÀY KHÔNG BAO GIỜ SỬA MỘT DÒNG ĐÃ NHẬN. Dòng ngân hàng đưa
--  sang là lời của người ngoài; sửa nó là bỏ mất chính cái làm nó có
--  giá trị. Khớp hay không khớp ghi ở cột riêng.
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS giaoDichNganHang (
  id          TEXT PRIMARY KEY,
  soTaiKhoan  TEXT NOT NULL,
  maGiaoDich  TEXT NOT NULL,      -- mã ngân hàng cấp, duy nhất theo tài khoản
  huong       TEXT NOT NULL,      -- vao · ra
  soTien      REAL NOT NULL,
  noiDung     TEXT,               -- nội dung chuyển khoản, chữ của người gửi
  luc         TEXT NOT NULL,      -- mốc ngân hàng ghi
  nhanLuc     TEXT NOT NULL,      -- mốc hệ nhận được
  nguon       TEXT NOT NULL,      -- webhook · nhapTay
  nguoiNhap   TEXT,               -- chỉ có khi nhapTay
  idPhieuThu  TEXT,               -- khớp với phiếu nào
  idChiPhi    TEXT,               -- hoặc khoản chi nào
  khopLuc     TEXT,
  khopBoi     TEXT
);

-- Ngân hàng gửi lại cùng một giao dịch là chuyện thường (thử lại, nổ
-- hai lần). Khoá duy nhất theo tài khoản × mã giao dịch là chỗ chặn
-- ghi trùng — không có nó thì một lượt gửi lại thành một khoản tiền
-- thứ hai chưa từng có.
CREATE UNIQUE INDEX IF NOT EXISTS ix_gdnh_mot
  ON giaoDichNganHang (soTaiKhoan, maGiaoDich);
CREATE INDEX IF NOT EXISTS ix_gdnh_luc  ON giaoDichNganHang (luc);
CREATE INDEX IF NOT EXISTS ix_gdnh_khop ON giaoDichNganHang (idPhieuThu);

-- ═════════════════════════════════════════════════════════════
--  BẢNG TIN PHÒNG TÀI CHÍNH
--
--  Chủ hệ chốt 9.99.3: kế toán trưởng chủ động cập nhật lên hệ, và có
--  phương án xử lý ngay khi thấy thông tin quan trọng; tin phân cấp
--  bằng MÀU để biết xử lý cái nào trước.
--
--  ══ CHỖ HỎNG CỦA MỌI HỆ PHÂN CẤP MÀU ══
--
--  Mức độ do người đăng tự chọn thì ai cũng chọn ĐỎ. Sau ba tháng cả
--  bảng đỏ, và màu thôi mang nghĩa gì — lúc ấy người ta đọc từ trên
--  xuống như một danh sách thường, đúng cái mà phân cấp sinh ra để
--  tránh.
--
--  Nên ba lớp chặn, và không lớp nào cấm người ta đặt ĐỎ:
--
--    1. Tin do MÁY sinh lấy mức từ LUẬT, không ai chọn được.
--    2. Tin người đặt ĐỎ phải ghi VÌ SAO GẤP — một câu, và câu ấy ở
--       lại trong dòng cho người sau đọc.
--    3. Tỷ lệ tin đỏ hiện ngay trên bảng. Đỏ hết thì con số ấy nói ra,
--       và nó nói với chính người đang đặt màu.
--
--  ══ MỘT TIN CÓ MÀU MÀ KHÔNG CÓ NGƯỜI VÀ KHÔNG CÓ HẠN LÀ MỘT CÁI MÀU ══
--
--  Bảng này đòi hai thứ ấy ở mức ĐỎ và CAM: ai xử lý, và hạn tới bao
--  giờ. Không có chúng thì tin nằm đó, ai đọc cũng nghĩ người khác lo,
--  và cái màu chỉ làm mọi người cùng lo mà không ai làm.
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS tinTaiChinh (
  id         TEXT PRIMARY KEY,
  mucDo      TEXT NOT NULL,      -- do · cam · vang · xanh
  loai       TEXT NOT NULL,      -- máy sinh: mã luật; người đăng: 'nguoiDang'
  tieuDe     TEXT NOT NULL,
  than       TEXT NOT NULL,
  viSaoGap   TEXT,               -- BẮT BUỘC khi người đặt mức 'do'
  doiTuong   TEXT,               -- id chứng từ liên quan
  tuMay      INTEGER NOT NULL DEFAULT 0,
  nguoiDang  TEXT NOT NULL,      -- 'may-chu' khi máy sinh
  luc        TEXT NOT NULL,
  giaoCho    TEXT,               -- ai xử lý
  hanXuLy    TEXT,
  trangThai  TEXT NOT NULL DEFAULT 'moi',   -- moi · dangXuLy · daXuLy · boQua
  cachXuLy   TEXT,               -- BẮT BUỘC khi đóng
  nguoiXuLy  TEXT,
  xuLyLuc    TEXT
);

-- Bảng tin mở ra mỗi sáng, lọc theo trạng thái rồi xếp theo mức độ.
CREATE INDEX IF NOT EXISTS ix_tin_tt  ON tinTaiChinh (trangThai, luc DESC);
CREATE INDEX IF NOT EXISTS ix_tin_han ON tinTaiChinh (hanXuLy) WHERE trangThai IN ('moi','dangXuLy');
CREATE INDEX IF NOT EXISTS ix_tin_giao ON tinTaiChinh (giaoCho, trangThai);

-- ═════════════════════════════════════════════════════════════
--  HỆ SỐ LƯƠNG — CÂU TRẢ LỜI CỦA CHỦ HỆ CHO L-01
--
--  TC_LUONG khai BA TẦNG lương và bốn bậc điểm, nhưng nói thẳng rằng
--  máy đo được ĐIỂM và không quy được điểm ra tiền: quy đổi là quyết
--  định về thị trường lao động và về ngân sách.
--
--  Nên bảng này để TRỐNG khi cài đặt, và bảng lương từ chối tính tiền
--  cho tới khi có người điền. Đặt một con số mặc định ở đây là máy tự
--  quyết một chuyện máy đã tự khai là mình không quyết được — và con
--  số mặc định ấy sẽ thành lương thật của một người thật.
--
--  KHÔNG SỬA MỘT DÒNG ĐÃ ĐẶT. Đổi hệ số là ghi một dòng MỚI có hiệu
--  lực từ một kỳ; dòng cũ ở lại. Sửa đè thì một bảng lương đã chốt ba
--  tháng trước không giải thích được nữa, và đó đúng là lúc người ta
--  cần giải thích nó.
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS heSoLuong (
  id         TEXT PRIMARY KEY,
  viTri      TEXT NOT NULL,      -- keToanThu · keToanChi · keToanTruong
  tuKy       TEXT NOT NULL,      -- có hiệu lực từ kỳ này trở đi (YYYY-MM)
  luongCung  INTEGER NOT NULL,   -- tầng 1
  tranKpi    INTEGER NOT NULL,   -- tầng 2 khi đạt 100 điểm
  lyDo       TEXT NOT NULL,
  boiAi      TEXT NOT NULL,      -- chỉ R01
  datLuc     TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_hsl_vt ON heSoLuong (viTri, tuKy DESC);

-- ═════════════════════════════════════════════════════════════
--  BẢNG LƯƠNG — VÀ VÌ SAO NÓ ĐÔNG CỨNG SỐ ĐO CHỨ KHÔNG ĐÔNG CỨNG SỐ TIỀN
--
--  Luật cứng của TC_LUONG: "Điểm của một kỳ ĐÃ CHỐT thì không tính lại
--  — cùng luật với sổ."
--
--  Nên dòng này giữ SỐ ĐO THÔ của từng thước tại lúc chốt, không phải
--  chỉ giữ con số điểm cuối. Hai lý do, và lý do thứ hai mới là lý do
--  thật:
--
--    · giữ số đo thì ba tháng sau còn dựng lại được vì sao ra điểm ấy
--    · và người bị trừ lương CÃI LẠI ĐƯỢC. Một bảng lương chỉ có một
--      con số điểm là một bản án không có hồ sơ; người ta ký vào vì
--      không có gì để chỉ ra chỗ sai.
--
--  Trạng thái 'nhap' là bản nháp tính lại được mỗi lượt mở. 'daChot'
--  thì đóng cứng và không hàm nào tính lại nó.
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS bangLuong (
  id          TEXT PRIMARY KEY,
  ky          TEXT NOT NULL,      -- YYYY-MM
  username    TEXT NOT NULL,
  viTri       TEXT NOT NULL,
  diem        REAL,               -- null nghĩa là KHÔNG CÓ GÌ ĐỂ ĐO trong kỳ
  bacDiem     TEXT,
  soDo        TEXT NOT NULL,      -- JSON số đo thô của từng thước, đông cứng
  trongBoQua  REAL,               -- phần trọng số rơi vào thước không đo được
  luongCung   INTEGER NOT NULL DEFAULT 0,
  phanKpi     INTEGER NOT NULL DEFAULT 0,
  ghiNhan     INTEGER NOT NULL DEFAULT 0,   -- tầng 3, do Giám đốc quyết
  ghiNhanVi   TEXT,
  duoi60      TEXT,               -- BẮT BUỘC khi điểm < 60: quyết định của người chốt
  idHeSo      TEXT,               -- dòng hệ số đã dùng, để dựng lại được
  trangThai   TEXT NOT NULL DEFAULT 'nhap',  -- nhap · daChot
  nguoiChot   TEXT,
  chotLuc     TEXT
);

-- Một người một kỳ đúng một dòng.
CREATE UNIQUE INDEX IF NOT EXISTS ix_bl_mot ON bangLuong (ky, username);

-- ═════════════════════════════════════════════════════════════
--  KIẾN TRÚC SƯ THỊ GIÁC — ĐỀ XUẤT THIẾT KẾ
--
--  Sáu trạng thái, và KHÔNG BAO GIỜ GHI ĐÈ. Sửa một bản đã duyệt là
--  ghi một BẢN MỚI trỏ về bản cũ qua cột `banTruoc`.
--
--  Vì sao không ghi đè: một tấm hình đã phát hành ra ngoài thì nó đã ở
--  trong tay khách. Ghi đè bản trong kho là làm cho kho nói khác thứ
--  khách đang cầm, và tới lúc có tranh cãi thì không ai dựng lại được
--  hình mà khách nhìn thấy.
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS deXuatThiGiac (
  id          TEXT PRIMARY KEY,
  ban         INTEGER NOT NULL DEFAULT 1,
  banTruoc    TEXT,               -- bản này sửa từ bản nào
  noiDung     TEXT NOT NULL,      -- nội dung cần hình, người đăng mô tả
  tang        TEXT NOT NULL,      -- T1…T5
  nguoiXem    TEXT NOT NULL,      -- JSON danh sách mã người xem
  loaiHinh    TEXT NOT NULL,      -- mã trong TG_LOAI
  nhiemVu     TEXT NOT NULL,      -- MỘT nhiệm vụ, lấy từ TG_LOAI
  -- ĐIỀU NHỎ và THỜI ĐIỂM ĐỜI — bản 9.99.54, cổng Điều Nhỏ.
  -- `nhiemVu` là việc của TẤM; `dieuNho` là việc của NGƯỜI sau khi xem.
  -- Hai thứ khác nhau, và cột cũ chỉ có cái thứ nhất: một tấm làm xong
  -- nhiệm vụ của nó mà người xem không làm gì thì vẫn hỏng, chỉ là hỏng
  -- ở chỗ không phép chấm nào nhìn tới.
  -- DEFAULT '' để hàng cũ đọc lại được; hàng MỚI thì cổng chặn từ trước
  -- khi tới đây, nên không hàng mới nào rỗng.
  dieuNho     TEXT NOT NULL DEFAULT '',
  thoiDiem    TEXT NOT NULL DEFAULT '',
  boCuc       TEXT,
  viTri       TEXT,               -- chỗ đặt trên giao diện
  deBai       TEXT,               -- đề bài thiết kế đầy đủ, máy dựng
  -- Kết quả của Tier Guardian tại lúc đề xuất. Giữ lại chứ không tính
  -- lại: ranh giới Tầng đổi thì đề xuất cũ vẫn phải giải thích được là
  -- nó đã qua cổng nào.
  soatTang    TEXT,
  -- Ý BẮT BUỘC: danh sách các ý nội dung mà tấm hình PHẢI nói được.
  -- Rút một lần lúc đề xuất rồi giữ, cùng lý do đã giữ soatTang: sửa
  -- cách rút thì mọi tấm cũ đổi nghĩa mà không ai biết. Bộ vẽ đối
  -- chiếu chữ đã đặt lên tấm với chính danh sách này, nên tấm thiếu ý
  -- bị bắt bằng phép ĐO chứ không bằng mắt người duyệt.
  yBatBuoc    TEXT,
  -- REAL, không INTEGER. Trọng số là phần trăm nên tổng gần như luôn lẻ:
  -- 89,9 chẳng hạn. Bản đầu để INTEGER và ghi Math.round(tổng), trong khi
  -- BẬC lại tính trên số LẺ — nên sổ hiện "90đ · Sửa lại", mà 90 chính là
  -- ngưỡng của bậc ĐẠT. Người đọc sổ sáu tháng sau thấy hai thứ cãi nhau.
  -- Giữ số thật thì bậc và số luôn cùng một gốc, và không có bài nào bị
  -- làm tròn LÊN qua ngưỡng đạt.
  diem        REAL,
  bacDiem     TEXT,
  chamChiTiet TEXT,               -- JSON điểm từng mục
  trangThai   TEXT NOT NULL DEFAULT 'nhap',
  nguoiDe     TEXT NOT NULL,
  deLuc       TEXT NOT NULL,
  nguoiDuyet  TEXT,
  duyetLuc    TEXT,
  lyDo        TEXT,               -- BẮT BUỘC khi từ chối
  tepHinh     TEXT,               -- đường dẫn ảnh cuối, khi đã có
  -- LỚP NGƯỜI của một tấm ghép hai lớp (AP_PHICH · CHAN_DUNG). Ảnh do
  -- bộ tạo ảnh ngoài sinh, và CHỈ máy chủ ghi vào đây, CHỈ sau khi tấm
  -- đã đi đủ thang duyệt — luật C12. Bộ vẽ trong máy đọc cột này chứ
  -- không nhận đường dẫn tự do từ nội dung: nhận được thì bất kỳ ảnh
  -- nào cũng vào được một ấn phẩm mang dấu GITA.
  anhNguoi    TEXT,
  -- Lượt đi ra đã sinh ra ảnh ấy — luật C15. Không giữ thì sáu tháng
  -- sau không ai dựng lại được tấm này, và cũng không trả lời được câu
  -- "ai bảo nó vẽ thế này". Trỏ sang luotDiRa chứ không chép đề bài:
  -- chép là dựng bản thứ hai của một sự thật.
  idDiRa      TEXT,
  seoTen      TEXT,
  seoAlt      TEXT
);

CREATE INDEX IF NOT EXISTS ix_dxtg_tt  ON deXuatThiGiac (trangThai, deLuc DESC);
CREATE INDEX IF NOT EXISTS ix_dxtg_tang ON deXuatThiGiac (tang, trangThai);
CREATE INDEX IF NOT EXISTS ix_dxtg_ban ON deXuatThiGiac (banTruoc);

-- ═════════════════════════════════════════════════════════════
--  SỔ QUYẾT ĐỊNH THƯƠNG HIỆU — BỘ NHỚ DÀI HẠN
--
--  Đây là chỗ máy HỌC từ chủ hệ. Chủ hệ từ chối một hướng và nói vì
--  sao; câu ấy ở lại, và mọi đề xuất sau đọc nó trước.
--
--  Không có sổ này thì mỗi lượt thiết kế bắt đầu lại từ số không, và
--  chủ hệ phải nói lại cùng một câu tới lần thứ mười thì thôi dùng.
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS luatThuongHieu (
  id        TEXT PRIMARY KEY,
  nhom      TEXT NOT NULL,        -- mau · chu · bocuc · giong · anh · khac
  luat      TEXT NOT NULL,
  vi        TEXT NOT NULL,        -- BẮT BUỘC: một luật không lý do thì bị gỡ
  hieuLuc   TEXT NOT NULL DEFAULT 'vinhVien',  -- vinhVien · tamThoi
  boiAi     TEXT NOT NULL,        -- chỉ Super Admin
  ghiLuc    TEXT NOT NULL,
  goLuc     TEXT,                 -- gỡ chứ không xoá
  goBoi     TEXT,
  goVi      TEXT
);

CREATE INDEX IF NOT EXISTS ix_lth_nhom ON luatThuongHieu (nhom) WHERE goLuc IS NULL;

-- ═════════════════════════════════════════════════════════════
--  SỔ LƯỢT ĐI RA NGOÀI
--
--  Chủ hệ chốt ở 9.99.11: được phép nối một bộ tạo ảnh bên ngoài.
--
--  Nối là chấp nhận một thứ RỜI KHỎI máy chủ Học viện, nên mọi lượt
--  đi ra đều để lại một dòng ở đây: gửi cái gì, cho ai, lúc nào, ai
--  bấm. Không có sổ này thì "được phép" và "không kiểm soát được" là
--  một, và tới lúc có chuyện thì không dựng lại được đã gửi những gì.
--
--  Cột `daGui` giữ ĐÚNG chuỗi đã đi ra — không giữ một bản tóm. Bản
--  tóm thì lúc cần đối chất lại phải tin vào chính cái đang bị nghi.
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS luotDiRa (
  id        TEXT PRIMARY KEY,
  idDeXuat  TEXT NOT NULL,
  cong      TEXT NOT NULL,        -- tên cổng ngoài
  daGui     TEXT NOT NULL,        -- nguyên văn chuỗi đã gửi
  soChu     INTEGER NOT NULL,
  boiAi     TEXT NOT NULL,
  luc       TEXT NOT NULL,
  ketQua    TEXT,                 -- ok · loi
  ghiChu    TEXT
);

CREATE INDEX IF NOT EXISTS ix_ldr_dx ON luotDiRa (idDeXuat, luc DESC);
CREATE INDEX IF NOT EXISTS ix_bl_ky ON bangLuong (ky, trangThai);

-- ═════════════════════════════════════════════════════════════
--  THÔNG BÁO TRONG HỆ
--
--  Chủ hệ chốt 9.98: "có thông báo lên hệ thống giám đốc, Super Admin."
--
--  Thư điện tử đi ra NGOÀI hệ — qua nhà gửi thư, qua Google, nằm lại
--  trong hộp thư. Thông báo trong hệ ở LẠI TRONG hệ, dưới khoá của Học
--  viện, và đọc được ngay trong ứng dụng.
--
--  Hai đường, hai việc: thư để biết khi không mở máy; thông báo trong
--  hệ để làm việc.
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS thongBao (
  id       TEXT PRIMARY KEY,
  denVai   TEXT,                  -- gửi theo VAI: R01, R03…
  denAi    TEXT,                  -- hoặc gửi đích danh một tên đăng nhập
  loai     TEXT NOT NULL,
  mucDo    TEXT NOT NULL,         -- tin · canXem · gap
  tieuDe   TEXT NOT NULL,
  than     TEXT NOT NULL,
  doiTuong TEXT,                  -- id chứng từ liên quan
  luc      TEXT NOT NULL,
  docLuc   TEXT,
  docBoi   TEXT
);

CREATE INDEX IF NOT EXISTS ix_tb_vai ON thongBao (denVai, luc DESC);
CREATE INDEX IF NOT EXISTS ix_tb_ai  ON thongBao (denAi, luc DESC);

-- ═════════════════════════════════════════════════════════════
--  MIỄN GIẢM — VÌ SAO KHÔNG SỬA THẲNG phaiThu
--
--  Học bổng, giảm cho anh chị em cùng học, giảm theo hoàn cảnh: đều là
--  chuyện có thật hằng tháng. Tới 9.90 không có đường nào ghi, nên cách
--  duy nhất là hoặc sửa phaiThu của kỳ, hoặc ghi một phiếu thu giả.
--
--  Cả hai đều hỏng, và hỏng theo hai kiểu khác nhau:
--
--    · sửa phaiThu  — xoá mất cam kết gốc. Sang năm không ai trả lời
--                     được "nhà này đáng lẽ đóng bao nhiêu, được giảm
--                     bao nhiêu, ai duyệt".
--    · phiếu thu giả — thổi phồng TIỀN THỰC THU. Sổ báo đã thu một
--                     khoản chưa từng vào tài khoản nào, và nó lọt
--                     thẳng vào bản đối chiếu sao kê.
--
--  Nên: một dòng riêng. Cam kết gốc ở kyThu giữ nguyên; công nợ trừ đi
--  phần miễn giảm ĐÃ DUYỆT.
--
--  Miễn giảm có hiệu lực từ LÚC DUYỆT, không lùi ngược. Một khoản giảm
--  duyệt hôm nay không được làm đổi bản báo cáo quý trước — cùng một
--  luật với mốc huỷ hoa hồng.
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS mienGiam (
  id          TEXT PRIMARY KEY,
  maKhachHang TEXT NOT NULL,
  idKy        TEXT NOT NULL,      -- trỏ kyThu.id — miễn giảm gắn vào MỘT kỳ
  soTien      REAL NOT NULL,
  loai        TEXT NOT NULL,      -- hocBong · anhChiEm · hoanCanh · khuyenMai · khac
  theoLuat    TEXT NOT NULL,      -- nguyên văn luật hay quyết định cho giảm
  lyDo        TEXT NOT NULL,
  nguoiDeXuat TEXT NOT NULL,
  deXuatLuc   TEXT NOT NULL,
  nguoiDuyet  TEXT,
  duyetLuc    TEXT,
  trangThai   TEXT NOT NULL DEFAULT 'choDuyet'
);

CREATE INDEX IF NOT EXISTS ix_mg_ky  ON mienGiam (idKy, trangThai);
CREATE INDEX IF NOT EXISTS ix_mg_nha ON mienGiam (maKhachHang, deXuatLuc DESC);
CREATE INDEX IF NOT EXISTS ix_mg_tt  ON mienGiam (trangThai, duyetLuc);

-- ═════════════════════════════════════════════════════════════
--  NHẮC THU — DANH SÁCH QUÁ HẠN MÀ KHÔNG AI LÀM ĐƯỢC
--
--  dsQuaHan trả về những nhà đang nợ. Nhưng người đi đòi cần câu tiếp
--  theo, và câu ấy không có chỗ nào trả lời: nhà này đã nhắc mấy lần,
--  lần cuối bao giờ, họ nói gì, có hẹn ngày nào không.
--
--  Không có bảng này thì mỗi người phụ trách giữ câu trả lời trong đầu
--  mình, và ngày họ nghỉ là ngày câu trả lời biến mất.
--
--  VÀ ĐÂY LÀ CHỖ LUẬT "LÀM VIỆC TRÊN HỆ THỐNG" CÓ HIỆU LỰC THẬT.
--  Coach và Tư vấn không được lấy thông tin cá nhân của khách ra làm
--  việc riêng. Một lượt nhắc thu ghi ở đây là một lượt làm việc đúng
--  quy định; không ghi thì không có bằng chứng nào rằng nó đã xảy ra
--  trên hệ thống.
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS nhacThu (
  id          TEXT PRIMARY KEY,
  maKhachHang TEXT NOT NULL,
  idKy        TEXT,
  kenh        TEXT NOT NULL,      -- goiDien · nhanTin · email · gapMat
  noiDung     TEXT NOT NULL,
  ketQua      TEXT NOT NULL,      -- huaTra · khongLienLac · xinKhatNo · tuChoi · daTra
  henLuc      TEXT,               -- nhà hẹn trả ngày nào, nếu có hẹn
  boi         TEXT NOT NULL,
  luc         TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_nt_nha ON nhacThu (maKhachHang, luc DESC);
CREATE INDEX IF NOT EXISTS ix_nt_hen ON nhacThu (henLuc);

-- ═════════════════════════════════════════════════════════════
--  CHỐT KÉT — TIỀN MẶT LÀ CHỖ DUY NHẤT MẤT MÀ KHÔNG DÒNG NÀO BIẾT
--
--  Chuyển khoản có sao kê ngân hàng đứng ngoài làm chứng: sổ nói thu
--  mười triệu mà ngân hàng nói tám thì lệch lộ ra. Tiền mặt không có
--  ai đứng ngoài cả — sổ nói bao nhiêu thì chỉ có sổ nói.
--
--  Nên phải ĐẾM. Mỗi ngày một dòng: sổ nói bao nhiêu, đếm thật được
--  bao nhiêu, lệch bao nhiêu. Lệch khác 0 thì bắt buộc có lý do.
--
--  Một két không bao giờ lệch là một két chưa bao giờ được đếm.
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS chotKet (
  ngay     TEXT PRIMARY KEY,       -- ngày giờ Việt Nam
  theoSo   REAL NOT NULL,
  demThuc  REAL NOT NULL,
  chenh    REAL NOT NULL,
  lyDo     TEXT,
  boi      TEXT NOT NULL,
  luc      TEXT NOT NULL
);

-- ═════════════════════════════════════════════════════════════
--  SỔ CHỐT — VÌ SAO MỘT BÁO CÁO CẦN ĐƯỢC ĐÓNG LẠI
--
--  Mọi con số ở trên đều tính bằng phép cộng chạy trên sổ SỐNG. Chạy
--  hôm nay ra một số, chạy lại tháng sau ra số khác — không phải vì
--  phép cộng sai, mà vì dưới nó có dòng đã đổi: một phiếu bị huỷ, một
--  khoản hoàn được duyệt, một phiếu ghi lùi ngày.
--
--  Nghĩa là bản báo cáo tuần trước KHÔNG DỰNG LẠI ĐƯỢC. Người ta in
--  ra, mang đi họp, rồi tháng sau mở lại thì số đã khác, và không ai
--  nói được vì sao. Đó không phải một bất tiện; đó là một sổ sách
--  không dùng được để đối chất.
--
--  Nên: CHỐT. Mỗi tuần đóng lại một dòng ở đây, ghi số như nó đứng
--  lúc ấy. Dòng đã chốt không tính lại nữa.
--
--  VÂN TAY là chỗ làm cho việc chốt có nghĩa. Nó là dấu của TẬP DÒNG
--  đã đếm, không phải của con số tổng. Chốt xong mà sau này có dòng
--  nào trong khoảng ấy đổi đi, tính lại vân tay sẽ ra khác — và
--  soatChot nêu tên kỳ ấy ra. Không có vân tay thì "đã chốt" chỉ là
--  một con số được chép lại, và một con số chép lại không chứng minh
--  được gì cả.
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS soChot (
  ky          TEXT PRIMARY KEY,   -- '2026-W36' · '2026-09' · '2026-Q3' · '2026'
  loai        TEXT NOT NULL,      -- tuan · thang · quy · nam
  tuNgay      TEXT NOT NULL,      -- ngày đầu kỳ, giờ Việt Nam
  denNgay     TEXT NOT NULL,
  tuLuc       TEXT NOT NULL,      -- cùng mốc ấy quy về UTC — xem chú giải múi giờ
  denLuc      TEXT NOT NULL,
  thu         REAL NOT NULL DEFAULT 0,   -- tiền thực thu
  soPhieu     INTEGER NOT NULL DEFAULT 0,
  hoan        REAL NOT NULL DEFAULT 0,
  soHoan      INTEGER NOT NULL DEFAULT 0,
  ghiNhan     REAL NOT NULL DEFAULT 0,   -- doanh thu ghi nhận: kỳ thu TỚI HẠN trong kỳ
  soKyToiHan  INTEGER NOT NULL DEFAULT 0,
  hhSinh      REAL NOT NULL DEFAULT 0,
  hhTra       REAL NOT NULL DEFAULT 0,
  chi         REAL NOT NULL DEFAULT 0,   -- chi phí vận hành đã duyệt trong tuần
  soChungTuChi INTEGER NOT NULL DEFAULT 0,
  mienGiam    REAL NOT NULL DEFAULT 0,
  conNoCuoiKy REAL NOT NULL DEFAULT 0,   -- luỹ kế tới cuối kỳ, không phải riêng kỳ
  nhaMoi      INTEGER NOT NULL DEFAULT 0,
  luotVuotTang INTEGER NOT NULL DEFAULT 0,
  vanTay      TEXT NOT NULL,
  chotLuc     TEXT NOT NULL,
  boiAi       TEXT NOT NULL,
  moLaiLuc    TEXT,               -- có mặt nghĩa là kỳ này đã bị mở lại
  moLaiBoi    TEXT,
  moLaiLyDo   TEXT
);

CREATE INDEX IF NOT EXISTS ix_chot_loai ON soChot (loai, tuNgay DESC);

-- Bút toán điều chỉnh. Một khoản tiền động vào kỳ ĐÃ CHỐT thì không
-- được sửa dòng đã chốt — sổ đã đóng là đã đóng. Nó ghi ở đây, và rơi
-- vào kỳ đang mở, có trỏ ngược về kỳ bị ảnh hưởng.
--
-- Đây là cách sổ sách thật xử lý chuyện ấy, và cũng là cách duy nhất
-- để câu "tháng trước báo đủ, sao giờ thiếu" có câu trả lời bằng dòng
-- chứ bằng trí nhớ.
CREATE TABLE IF NOT EXISTS dieuChinh (
  id           TEXT PRIMARY KEY,
  kyBiAnhHuong TEXT NOT NULL,     -- kỳ đã chốt mà khoản này thuộc về
  loai         TEXT NOT NULL,     -- huyPhieu · duyetHoan · ganPhieu · duyetMuon
  idChungTu    TEXT NOT NULL,     -- phiếu thu hoặc khoản hoàn
  maKhachHang  TEXT,
  soTien       REAL NOT NULL,     -- ÂM là giảm thu của kỳ đã chốt
  luc          TEXT NOT NULL,     -- lúc ghi bút toán, tức thuộc kỳ đang mở
  lucGoc       TEXT NOT NULL,     -- mốc của chứng từ gốc, nằm trong kỳ đã chốt
  boi          TEXT NOT NULL,
  dienGiai     TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_dc_ky  ON dieuChinh (kyBiAnhHuong);
CREATE INDEX IF NOT EXISTS ix_dc_luc ON dieuChinh (luc);

-- ─────────────────────────────────────────────────────────────
--  CHỨNG TỪ THANH TOÁN — KHÔNG XOÁ, KHÔNG BAO GIỜ
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS thanhToan (
  id             TEXT PRIMARY KEY,
  maKhachHang    TEXT,
  tier           INTEGER,
  soTien         REAL,
  trangThai      TEXT,
  nguoiDuyet     TEXT,
  luc            TEXT,
  ghiChu         TEXT,
  daDung         INTEGER DEFAULT 0,
  dungChoHocVien TEXT,
  dungLuc        TEXT
);

-- Nâng tầng tra đúng bộ ba mã khách × tầng × trạng thái.
CREATE INDEX IF NOT EXISTS ix_tt_makh ON thanhToan (maKhachHang, tier, trangThai);

-- ─────────────────────────────────────────────────────────────
--  SỔ TÀI LIỆU
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tailieu (
  id         TEXT PRIMARY KEY,
  ten        TEXT,
  loai       TEXT,
  tang       TEXT,
  moTa       TEXT,
  driveId    TEXT,
  tenTep     TEXT,
  nguoiGui   TEXT,
  vaiGui     TEXT,
  luc        TEXT,
  trangThai  TEXT,
  nguoiDuyet TEXT,
  lucDuyet   TEXT,
  lyDo       TEXT
);

CREATE INDEX IF NOT EXISTS ix_tailieu_tt ON tailieu (trangThai, luc);

-- ─────────────────────────────────────────────────────────────
--  ĐẾM CỘNG ĐỒNG
--
--  Bốn sổ đếm của bảng tin. Nền cũ để chúng trong Script Properties.
--  Ở đây là một bảng khoá–giá trị, vì con số cộng đồng phải cộng được
--  bằng một câu lệnh chứ không phải đọc–sửa–ghi ba lượt.
-- ─────────────────────────────────────────────────────────────
-- ─────────────────────────────────────────────────────────────
--  CÀI ĐẶT CỦA CHỦ HỆ — BỐ CỤC, CHỮ HIỂN THỊ, PHÂN QUYỀN, HỒ SƠ CA
--
--  Bảy cụm dùng chung cho cả hệ, đồng bộ theo CẢ CỤM: ai sửa sau thì
--  bản đó thắng. Không gộp theo từng trường như hồ sơ cá nhân, vì đây
--  là bố cục và luật — nửa bố cục cũ ghép nửa bố cục mới thì ra một bố
--  cục chưa ai từng thiết kế.
--
--  MỘT TRẦN CỦA NỀN CŨ BỎ ĐƯỢC Ở ĐÂY: Script Properties chỉ nhận 9 KB
--  MỖI GIÁ TRỊ, nên cụm hồ sơ ca — thứ cộng dồn theo thời gian — chắc
--  chắn vượt sớm, và nền cũ phải tách mỗi cụm một khoá riêng rồi vẫn
--  phải từ chối cụm quá lớn. SQLite không có trần ấy.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS caiDat (
  cum  TEXT PRIMARY KEY,      -- sapxep · noidung · phanquyen · khothem · xinthem · ca · tainguyen
  du   TEXT NOT NULL,         -- khối JSON của cụm
  luc  INTEGER NOT NULL,      -- mốc mili-giây của bản đang giữ
  boi  TEXT                   -- ai ghi bản này
);

-- ─────────────────────────────────────────────────────────────
--  CHỨNG CỨ HOA HỒNG — BẢNG DUY NHẤT RA TIỀN THẬT
--
--  Mọi thứ khác sai thì sửa; chỗ này sai thì kết thúc ở toà chứ không
--  kết thúc ở một bản vá. Nên bảng này khắt khe hơn mọi bảng còn lại.
--
--  CHỈ THÊM DÒNG, KHÔNG SỬA DÒNG CŨ. Hai cột xacNhanBoi/xacNhanLuc là
--  ngoại lệ DUY NHẤT, và chúng chỉ ghi được một lần — xem chú giải ở
--  xacNhanChungCu trong may-chu/chung-cu.js.
--
--  SAI THÌ GHI BẢN ĐÍNH CHÍNH TRỎ VỀ BẢN CŨ, cả hai cùng ở lại. Xoá
--  bản sai là xoá luôn bằng chứng rằng đã từng có bản sai — đúng thứ
--  bên đối tụng sẽ hỏi.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chungCu (
  ma           TEXT PRIMARY KEY,
  nhiemVu      TEXT NOT NULL,
  ngayLam      TEXT NOT NULL,
  loai         TEXT NOT NULL,
  noiDung      TEXT NOT NULL,
  nguoiGhi     TEXT NOT NULL,     -- lấy từ PHIÊN, không lấy từ thân yêu cầu
  gioMayChu    TEXT NOT NULL,     -- giờ MÁY CHỦ; giờ máy khách không phải bằng chứng
  chuKy        TEXT NOT NULL,     -- HMAC-SHA256; khoá nằm ở secret, không ở đây
  xacNhanBoi   TEXT,
  xacNhanLuc   TEXT,
  dinhChinhCho TEXT,
  uidGhi       TEXT
);

-- Sổ chứng cứ của một người, và chuỗi đính chính của một bản.
CREATE INDEX IF NOT EXISTS ix_cc_nguoi ON chungCu (nguoiGhi, gioMayChu DESC);
CREATE INDEX IF NOT EXISTS ix_cc_dinhchinh ON chungCu (dinhChinhCho)
  WHERE dinhChinhCho IS NOT NULL;

-- ─────────────────────────────────────────────────────────────
--  GIẤY PHÉP XEM HỒ SƠ KHÁCH HÀNG
--
--  Hồ sơ khách tầng 4-5 KHÔNG nằm trong gói nào gửi về máy. Một gói đã
--  cấp thì không gọi ngược về được — gỡ giấy phép hôm nay không xoá
--  được bản sao nằm trong máy người ta từ hôm qua. Nên hồ sơ thật đi
--  qua MỘT cửa hỏi máy chủ, và cửa ấy đọc bảng này mỗi lượt.
--
--  THU HỒI LÀ ĐÁNH DẤU, KHÔNG XOÁ DÒNG. Xoá là xoá luôn bằng chứng đã
--  từng cấp — đúng thứ cần trả lời khi có chuyện.
--
--  HẾT HẠN THÌ TỰ TẮT. Một quyền chỉ mất khi có người chủ động gỡ là
--  một quyền sẽ ở lại mãi.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quyenXem (
  id            TEXT PRIMARY KEY,
  nguoiDuocCap  TEXT NOT NULL,      -- tên đăng nhập, đã hạ chữ thường
  vai           TEXT NOT NULL,      -- vai lúc cấp; lúc DÙNG vẫn đọc lại vai thật
  tangDuocXem   TEXT NOT NULL,      -- 'T4,T5'
  nguoiCap      TEXT,
  capLuc        TEXT,
  hetHan        TEXT,               -- ISO; bắt buộc, không có giấy phép vô hạn
  thuHoiLuc     TEXT,
  thuHoiBoi     TEXT,
  lyDo          TEXT
);

-- Tra giấy phép CÒN HIỆU LỰC của một người: lọc theo tên, rồi bỏ dòng
-- đã thu hồi và dòng đã hết hạn. Chỉ mục theo tên là đủ — một người có
-- rất ít dòng, kể cả sau nhiều năm cấp rồi thu hồi.
CREATE INDEX IF NOT EXISTS ix_qx_nguoi ON quyenXem (nguoiDuocCap, capLuc DESC);

-- ─────────────────────────────────────────────────────────────
--  MÃ LẤY LẠI MẬT KHẨU
--
--  Nền cũ giữ mã này trong CacheService của Apps Script. Worker không
--  có thứ ấy, và đây cũng không phải chỗ nên giữ trong bộ nhớ tạm: mã
--  lấy lại mật khẩu là thứ mở được một tài khoản, nên nó cần đúng cùng
--  một sổ với mọi thứ khác — kể cả để đếm số lần nhập sai cho đúng khi
--  Worker chạy ở hàng trăm nơi cùng lúc.
--
--  MỘT TÀI KHOẢN CHỈ CÓ MỘT MÃ SỐNG. Khoá chính là uid, nên xin mã mới
--  là mã cũ chết ngay — không để lại một chuỗi mã cùng sống mà chỉ cần
--  đoán trúng một cái là đủ.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS maLayLai (
  uid    TEXT PRIMARY KEY,
  muoi   TEXT NOT NULL,
  bam    TEXT NOT NULL,
  hetHan INTEGER NOT NULL,
  sai    INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS ix_malaylai_han ON maLayLai (hetHan);

-- ─────────────────────────────────────────────────────────────
--  CHẶN NHỊP — ĐẾM SỐ LẦN THỬ TRONG MỘT KHOẢNG THỜI GIAN
--
--  Nền cũ đếm bằng CacheService của Apps Script. Worker không có thứ
--  ấy, và đây KHÔNG phải chỗ được phép bỏ bớt khi chuyển nền: ba chỗ
--  chặn nhịp đang có đều là chặn thật, mất cái nào cũng là mở đúng một
--  cánh cửa —
--
--    · đoán mật khẩu liên tiếp thì khoá 15 phút
--    · một email không nhận quá ba thư đăng ký mỗi giờ
--    · một tài khoản không rút khoá kho quá N lượt mỗi giờ
--
--  Đếm trong cơ sở dữ liệu thì con số ĐÚNG cho mọi lượt chạy cùng lúc.
--  Bộ nhớ tạm của từng máy chủ thì mỗi máy đếm một kiểu, và kẻ đoán mật
--  khẩu chỉ cần rải đều các lượt thử là không máy nào thấy đủ số.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chanNhip (
  khoa   TEXT PRIMARY KEY,          -- loại · đối tượng, ví dụ 'dangNhapSai·admin@gita365'
  dem    INTEGER NOT NULL DEFAULT 0,
  hetHan INTEGER NOT NULL           -- mốc mili-giây; qua mốc thì đếm lại từ đầu
);

CREATE INDEX IF NOT EXISTS ix_chan_han ON chanNhip (hetHan);

CREATE TABLE IF NOT EXISTS soDem (
  khoa   TEXT PRIMARY KEY,
  gia    INTEGER NOT NULL DEFAULT 0,
  suaLuc TEXT
);

-- ═════════════════════════════════════════════════════════════
--  BÀI NỘI DUNG — THANG NĂM CỔNG (bản 9.99.42)
--
--  Chốt của chủ hệ: "không gì lên sóng mà không qua 5 cổng kiểm duyệt
--  có người ký."
--
--  ── VÌ SAO CHỮ KÝ PHẢI NEO VÀO VÂN TAY NỘI DUNG ──
--
--  Thang duyệt thị giác (deXuatThiGiac) KHÔNG có cột này, và đó là một
--  chỗ thủng thật: sửa nội dung sau khi đã duyệt thì bản ghi vẫn ghi
--  "đã duyệt", và không ai đọc ra được là thứ đã duyệt khác thứ đang
--  nằm đó. Ở đây mỗi chữ ký mang theo vân tay của bài LÚC KÝ, và khi
--  bài đổi thì mọi chữ ký cũ hết hiệu lực — bài về lại bản nháp.
--
--  Không phải để bắt lỗi ai. Một chữ ký đứng dưới một bài đã đổi là
--  một chữ ký nói dối, và người đọc sổ sáu tháng sau không có cách nào
--  biết là nó đang nói dối.
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS baiNoiDung (
  id         TEXT PRIMARY KEY,
  tieuDe     TEXT NOT NULL,
  chu        TEXT NOT NULL,       -- toàn văn, dạng khối K01 | …
  tang       TEXT NOT NULL,       -- T1…T5
  -- Khuôn nào: BAIHOC · QUYTRINH · CAMNANG · CHUYENSAU (bản 9.99.45).
  -- Mặc định BAIHOC để mọi bài ghi trước bản này giữ nguyên nghĩa —
  -- chúng đều là bài học, vì lúc ấy hệ chỉ có một khuôn.
  khuon      TEXT NOT NULL DEFAULT 'BAIHOC',
  -- Bài viết CHO AI: noiBo · khach (bản 9.99.48). Từ điển KL08 dò theo
  -- cột này: lớp `khach` chỉ áp khi bài nói với khách. Mặc định noiBo,
  -- vì đoán nhầm sang KHÁCH thì bắt hàng loạt câu kỹ thuật đúng, còn
  -- đoán nhầm sang NỘI BỘ chỉ bỏ sót — và bỏ sót thì người viết còn
  -- thấy, báo nhầm thì họ thôi đọc cả báo cáo.
  doiTuong   TEXT NOT NULL DEFAULT 'noiBo',
  vanTay     TEXT NOT NULL,       -- SHA-256 rút gọn của `chu` lúc ghi
  trangThai  TEXT NOT NULL DEFAULT 'nhap',
  nguoiViet  TEXT NOT NULL,       -- uid; luật L2 đọc cột này
  vietLuc    TEXT NOT NULL,
  -- Mốc vào cổng hiện tại. Đồng hồ treo (G.KN_SLA) đo từ đây, không đo
  -- từ `vietLuc` — một bài nằm ba ngày ở cổng 2 rồi qua nhanh bốn cổng
  -- sau thì chỗ tắc là cổng 2, và đo từ lúc viết thì không thấy.
  vaoCongLuc TEXT,
  -- Kết quả cổng 1, giữ lại chứ không tính lại: sửa cách đo thì mọi bài
  -- cũ đổi nghĩa mà không ai biết. Cùng lý do đã buộc soatTang được giữ.
  soatMay    TEXT,
  lyDo       TEXT                 -- BẮT BUỘC khi từ chối
);

CREATE INDEX IF NOT EXISTS ix_bnd_tt   ON baiNoiDung (trangThai, vaoCongLuc);
CREATE INDEX IF NOT EXISTS ix_bnd_viet ON baiNoiDung (nguoiViet, vietLuc DESC);

-- ─────────────────────────────────────────────────────────────
--  SỔ KÝ — CHỈ THÊM, KHÔNG SỬA, KHÔNG XOÁ
--
--  Mỗi dòng là một quyết định: ai, cổng nào, ký hay từ chối, vì sao, và
--  vân tay bài lúc ấy. Luật L3 (một người ký nhiều nhất một cổng trên
--  một bài) đọc thẳng bảng này chứ không đọc một ô tóm tắt — ô tóm tắt
--  thì sửa được, còn sổ chỉ-thêm thì không.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kyNoiDung (
  id      TEXT PRIMARY KEY,
  baiId   TEXT NOT NULL,
  cong    TEXT NOT NULL,          -- C1…C5
  viec    TEXT NOT NULL,          -- ky · tuChoi
  boiAi   TEXT NOT NULL,          -- uid; 'may' cho cổng 1
  vaiLuc  TEXT NOT NULL,          -- vai lúc ký — vai đổi thì sổ vẫn kể đúng
  vanTay  TEXT NOT NULL,          -- vân tay bài LÚC KÝ
  ghiChu  TEXT,
  kyLuc   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_knd_bai ON kyNoiDung (baiId, kyLuc);
CREATE INDEX IF NOT EXISTS ix_knd_ai  ON kyNoiDung (baiId, boiAi);

-- ─────────────────────────────────────────────────────────────
--  QUYỀN KÝ NỘI DUNG — MỘT TRỤC RIÊNG, VUÔNG GÓC VỚI THANG VAI
--
--  Cùng cách làm với quyenTaiChinh ở bản 9.97, và vì cùng một lý do:
--  bản đặc tả của chủ hệ đề nghị năm VAI mới (author · editor · expert
--  · keeper · super_admin), mà Học viện đã có thang R01–R15 đang chạy.
--  Dựng thang thứ hai là dựng hai sự thật về ai được làm gì — rồi một
--  người là R09 ở thang này và "expert" ở thang kia, và không ai trả
--  lời được câu "người ấy được ký cái gì".
--
--  Chỉ R01–R02 cấp được, và không ai tự cấp cho mình.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quyenNoiDung (
  id        TEXT PRIMARY KEY,
  username  TEXT NOT NULL,
  chucNang  TEXT NOT NULL,        -- bienTap · chuyenMon · giuChuan
  lyDo      TEXT NOT NULL,
  boiAi     TEXT NOT NULL,
  capLuc    TEXT NOT NULL,
  thuHoiLuc TEXT,
  thuHoiBoi TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS ix_qnd_mot ON quyenNoiDung (username, chucNang)
  WHERE thuHoiLuc IS NULL;
CREATE INDEX IF NOT EXISTS ix_qnd_ten ON quyenNoiDung (username);

-- ─────────────────────────────────────────────────────────────
--  ND-04 · SỔ CHỐT TRÍCH CHUẨN NGHỀ — bản 9.99.49
--
--  Tới 9.99.48 cửa xuất chuẩn nghề CHẶN đúng, nhưng nó đọc hai ô
--  `trichDuoc` và `nguon` từ CHÍNH LƯỢT GỌI của máy khách. Nghĩa là
--  hai chuyện:
--
--    · Chủ hệ không có chỗ nào để chốt. Muốn chốt thì phải sửa kho
--      gốc rồi phát hành lại — nên suốt ba bản không ai chốt mục nào.
--    · Và cửa chặn ấy tin lời máy khách. Máy khách gửi trichDuoc:true
--      là qua cửa. Đúng lớp lỗi "lọc trên màn hình không phải bảo vệ
--      dữ liệu" đã hỏng ba lần trong kho này.
--
--  Sổ này đóng cả hai: quyết định nằm ở máy chủ, chỉ R01 ghi được, và
--  cửa xuất đọc SỔ chứ không đọc lượt gọi.
--
--  Chỉ-thêm như kyNoiDung: đổi ý thì ghi dòng mới, không sửa dòng cũ.
--  Một lời khai về nguồn gốc câu chữ mà sửa được thì nó không còn là
--  lời khai.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chotTrichNghe (
  id        TEXT PRIMARY KEY,
  ma        TEXT NOT NULL,          -- mã mục trong G.KN_CHUAN_NGHE
  trichDuoc INTEGER NOT NULL,       -- 1 được trích · 0 không được
  nguon     TEXT NOT NULL,          -- dẫn theo nguồn nào; rỗng khi trichDuoc = 0
  lyDo      TEXT NOT NULL,
  boiAi     TEXT NOT NULL,
  vaiLuc    TEXT NOT NULL,
  chotLuc   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_ctn_ma ON chotTrichNghe (ma, chotLuc);

-- ═════════════════════════════════════════════════════════════
--  ĐĂNG TẤM LÊN KÊNH — bản 9.99.58, phần 9 của bản đặc tả
--
--  Bảng này CHỈ THÊM, không sửa nội dung cũ. Một lượt đăng là một
--  sự việc đã xảy ra: tấm đã ra khỏi hệ, người ngoài đã nhìn thấy.
--  Sửa lại dòng ấy sau là sửa lại lịch sử.
--
--  ══ HAI Ô GỠ, VÀ VÌ SAO PHẢI LÀ HAI ══
--
--  goTrongSo   Học viện đã QUYẾT gỡ. Máy làm được, ghi ngay.
--  daGoNgoai   Người thật đã vào kênh ấy gỡ xuống. NGƯỜI khai.
--
--  Gộp làm một là dựng đúng cái nút làm người bấm yên tâm nhầm: gỡ
--  trong sổ KHÔNG gỡ được ở ngoài. Tấm đã đăng thì nằm ở máy chủ của
--  nền tảng; ai đã lưu về hoặc chụp màn hình thì vẫn giữ. Sổ của Học
--  viện chỉ ghi được rằng Học viện đã quyết gỡ.
--
--  Máy KHÔNG tự đánh dấu daGoNgoai vì máy không nhìn thấy kênh ngoài
--  — một ô máy tự đánh dấu mà không đo được là một lời nói dối mang
--  dấu của hệ thống.
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS dangTamThiGiac (
  id          TEXT PRIMARY KEY,
  idDeXuat    TEXT NOT NULL,
  kenh        TEXT NOT NULL,      -- mã trong TG_KENH
  kho         TEXT NOT NULL,      -- DOC · DUNG · NGANG
  duongDan    TEXT,               -- chỗ tấm đang nằm ở kênh ngoài
  trongGioVang TEXT,              -- mã khung giờ, hoặc '' nếu ngoài khung
  lyDoNgoaiGio TEXT,              -- bắt buộc khi đăng ngoài khung giờ
  boiAi       TEXT NOT NULL,
  luc         TEXT NOT NULL,
  -- Hai ô gỡ, tách hẳn nhau. Xem chú giải ở đầu bảng.
  goTrongSo   TEXT,               -- lúc Học viện quyết gỡ
  goLyDo      TEXT,               -- mã trong TG_GO_LY_DO
  goCau       TEXT,               -- một câu người gỡ viết, bắt buộc
  goBoiAi     TEXT,
  daGoNgoai   TEXT,               -- lúc người thật báo đã gỡ ở kênh
  goNgoaiBoiAi TEXT
);

CREATE INDEX IF NOT EXISTS ix_dtg_dx ON dangTamThiGiac (idDeXuat, luc DESC);
CREATE INDEX IF NOT EXISTS ix_dtg_go ON dangTamThiGiac (goTrongSo, daGoNgoai);

-- ═════════════════════════════════════════════════════════════
--  SỐ LIỆU KÊNH NGOÀI — bản 9.99.60, nửa LỜI KHAI của phễu
--
--  Bản 9.99.59 khai ba bậc XEM · BAM · NHAN_VE là LỜI KHAI, rồi
--  KHÔNG dựng chỗ nào để ghi chúng. Theo đúng luật của kho thì mục ấy
--  không phải một việc chờ — nó là một lời than.
--
--  Bảng này là chỗ ghi. Ba luật của nó:
--
--  1. Một dòng là một LƯỢT ĐỌC BẢNG của nền tảng, không phải một con
--     số cộng dồn. Người ta đọc bảng ngày 3 và ngày 10; giữ cả hai thì
--     về sau còn biết con số lớn lên thế nào. Ghi đè một ô "tổng" thì
--     mất hẳn phần ấy, và không ai biết là đã mất.
--
--  2. Ô boiAi và luc BẮT BUỘC. Đây là con số gõ tay — không biết ai gõ
--     và gõ lúc nào thì nó không kiểm lại được, và một con số không
--     kiểm lại được thì tệ hơn không có.
--
--  3. Nối vào LƯỢT ĐĂNG, không nối vào đề xuất. Cùng một tấm đăng ở ba
--     kênh thì ba kênh có ba con số khác nhau, và gộp chúng lại là mất
--     đúng câu hỏi đáng hỏi nhất: kênh nào đang chạy.
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS khaiSoNgoai (
  id        TEXT PRIMARY KEY,
  idDang    TEXT NOT NULL,       -- trỏ vào dangTamThiGiac.id
  ngayDoc   TEXT NOT NULL,       -- ngày người ta đọc bảng của nền tảng
  xem       INTEGER,
  bam       INTEGER,
  nhanVe    INTEGER,
  boiAi     TEXT NOT NULL,
  luc       TEXT NOT NULL,
  ghiChu    TEXT
);

CREATE INDEX IF NOT EXISTS ix_ksn_dang ON khaiSoNgoai (idDang, ngayDoc DESC);

-- ═════════════════════════════════════════════════════════════
--  THẺ VÙNG MẠNH — bản 9.99.63, Phân hệ 1 của Bộ não
--
--  Đây là bảng NHẠY NHẤT trong cả cơ sở dữ liệu. Cột `d4` giữ NỖI SỢ
--  của một đứa trẻ, ghi nguyên văn lời nó nói. Không cột nào khác
--  trong hệ này chạm tới một chỗ riêng tư như thế.
--
--  ══ BA LẰN RANH CẮM THẲNG VÀO HÌNH BẢNG ══
--
--  LR1 — Không xếp hạng trẻ với nhau.
--    Bảng KHÔNG có cột điểm, cột hạng, cột "mạnh cỡ nào". Thêm một cột
--    như thế là mở đường cho một câu ORDER BY, và một câu ORDER BY
--    trên trẻ em là một bảng xếp hạng dù không ai gọi nó là bảng xếp
--    hạng.
--
--  LR2 — Không kết luận sớm: hạn 90 ngày.
--    Giữ `lapLuc` và TÍNH hạn lúc đọc, không giữ một cột `conHan`.
--    Một cột `conHan` phải có ai đó chạy cập nhật, và ngày không ai
--    chạy thì nó nói dối — nói dối theo hướng nguy hiểm nhất, là thẻ
--    quá hạn vẫn khai còn hạn.
--
--  LR3 — Không dùng Thẻ để bán hàng.
--    Không cột giá, không cột gói, không cột tầng bán. Thẻ đi tới tay
--    gia đình; có một ô giá trong đó là mời mua ngay trên tờ giấy nói
--    về nỗi sợ của con họ.
--
--  ══ VÀ BẢN CŨ Ở LẠI ══
--  Lập thẻ mới KHÔNG ghi đè thẻ cũ. Chuỗi thẻ theo thời gian chính là
--  thứ cho thấy đứa trẻ đã đổi — mà "trẻ đổi rất nhanh" là lý do cả
--  lằn ranh thứ hai tồn tại. Ghi đè là xoá đúng bằng chứng ấy.
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS theVungManh (
  id        TEXT PRIMARY KEY,
  maNha     TEXT NOT NULL,       -- mã gia đình trong hệ
  tuoiCon   INTEGER,             -- tuổi, KHÔNG ngày sinh: ngày sinh nhận dạng được
  lan       INTEGER NOT NULL DEFAULT 1,   -- thẻ thứ mấy của nhà này
  theTruoc  TEXT,                -- thẻ này lập lại từ thẻ nào
  -- Năm dòng của tờ A4. Chữ tự do, không ô chọn: ép ô chọn là ép một
  -- đứa trẻ vào một trong mấy cái hộc có sẵn, và đó là dán nhãn.
  d1        TEXT NOT NULL,       -- Con sáng nhất khi
  d2        TEXT NOT NULL,       -- Con vào nhanh nhất qua cửa
  d3        TEXT NOT NULL,       -- Con chịu được cái khó này
  d4        TEXT NOT NULL,       -- Điều làm con rụt lại  ← NHẠY NHẤT
  d5        TEXT NOT NULL,       -- Việc nhà mình sẽ làm 90 ngày tới
  -- Bảy trường quan sát thô, giữ lại để lập thẻ sau còn đối chiếu.
  quanSat   TEXT,                -- JSON bảy trường
  lapBoiAi  TEXT NOT NULL,
  lapLuc    TEXT NOT NULL,
  duyetBoiAi TEXT,               -- Vùng Vàng: coach duyệt trước khi giao nhà
  duyetLuc  TEXT,
  giaoNhaLuc TEXT                -- lúc thật sự trao cho gia đình
);

CREATE INDEX IF NOT EXISTS ix_tvm_nha ON theVungManh (maNha, lapLuc DESC);

-- ═════════════════════════════════════════════════════════════
--  PHÂN HỆ 4 · VẬN HÀNH & CHĂM SÓC  (9.99.66)
--
--  ══ HAI BẢNG, VÀ CHỖ ĐÁNG NÓI LÀ NHỮNG CỘT KHÔNG CÓ ══
--
--  hoSoSongSinh giữ ĐÚNG những trường người khai. Không có cột nào
--  cho bốn trường máy tính (ngày chạm gần nhất · số ngày im lặng ·
--  đèn · số WOW) và không có cột nào cho năm trường đã sống ở hệ
--  khác (tầng · phần học · tỷ lệ 21 ngày · KPI · mã Thẻ Vùng Mạnh).
--
--  Vì sao gắt đến thế: một cột `den` mà có người gõ được thì sớm
--  muộn có người gõ, và lúc ấy một phép đo biến thành một lời khai
--  — mà nhìn thì vẫn y hệt. Tệ hơn nữa là cột không ai gõ: nó cũ đi
--  lặng lẽ, khai XANH cho một nhà đã im lặng hai mươi ngày, và cả
--  quy trình gọi điện trong hai mươi tư giờ đi theo nó.
--
--  Cùng luật với cột `conHan` KHÔNG có trong theVungManh (9.99.63).
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS hoSoSongSinh (
  maNha       TEXT PRIMARY KEY,   -- trỏ hoSoKhach.maKhachHang
  -- 12 trường cố định, trừ hai trường trỏ sang hệ khác
  tenChaMe    TEXT,
  tenCon      TEXT,
  tuoiCon     INTEGER,            -- TUỔI. Ngày sinh nằm riêng ở ngaySinhCon.
  tinhCach    TEXT,
  noiLo       TEXT,               -- ô nhạy nhất: câu gia đình nói lúc yếu nhất
  tuHao       TEXT,
  daThuThatBai TEXT,              -- biết chỗ họ đã hỏng thì đừng đề nghị lại
  khungGioRanh TEXT,
  xungHo      TEXT,
  ngaySinhCon TEXT,               -- chỉ dùng để nhắc sinh nhật
  -- 1 trường động người ghi
  ghiChu      TEXT,
  -- 2 trường mới v3.0 người khai
  mua         INTEGER,            -- 1–4
  tangGiaTri  INTEGER,            -- 1–5
  -- mốc để sinh nhịp 365 ngày
  ngayThamGia TEXT NOT NULL,
  lapBoiAi    TEXT NOT NULL,
  lapLuc      TEXT NOT NULL,
  suaBoiAi    TEXT,
  suaLuc      TEXT
);

-- ═════════════════════════════════════════════════════════════
--  SỔ DẤU VẾT — năm cột của Điều 9
--
--  Ở D1, KHÔNG ở Google Sheets như bản đặc tả đề nghị. Mỗi dòng mang
--  tên gia đình, tên con, và nội dung một cuộc trò chuyện riêng; đẩy
--  nó lên một dịch vụ đặt ngoài lãnh thổ là xử lý dữ liệu xuyên biên
--  giới theo Luật số 91/2025/QH15, và phạm thẳng Điều 13 của Hiến
--  pháp Bộ não.
--
--  MỘT LƯỢT CHẠM LÀ MỘT DÒNG MỚI. Ghi đè thì mất phần lịch sử, và
--  chính phần lịch sử chứng minh được rằng Học viện chạm ĐỀU chứ
--  không chạm dồn một hôm.
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS soCham (
  id        TEXT PRIMARY KEY,
  maNha     TEXT NOT NULL,
  ngay      TEXT NOT NULL,
  kieu      TEXT NOT NULL,        -- nhan · goi · wow
  denLuc    TEXT,                 -- đèn của nhà ấy LÚC CHẠM: XANH · VANG · DO
  noiDung   TEXT NOT NULL,
  -- Hai cột làm cho cả sổ có nghĩa. Máy điền được ba cột trên; hai
  -- cột này thì không — không có căn cứ thì đây là một tin nhắn, và
  -- một tin nhắn không chứng minh được gì lúc có tranh chấp.
  canCu     TEXT NOT NULL,
  aiDuyet   TEXT NOT NULL,
  boiAi     TEXT NOT NULL,        -- người thật sự chạm
  ghiLuc    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_cham_nha ON soCham (maNha, ngay DESC);

-- Nhịp 365 ngày hỏi câu "hôm nay nhà nào đang ở ngày 8–12", và đó là
-- một phép lọc KHOẢNG trên ngày tham gia — đường tra thật, không phải
-- một chỉ mục thêm cho bộ thử xanh. Chặng tử thần là chặng phải quét
-- mỗi ngày, nên nó là đường nóng nhất của cả bảng.
CREATE INDEX IF NOT EXISTS ix_ss_thamgia ON hoSoSongSinh (ngayThamGia);

-- ═════════════════════════════════════════════════════════════
--  BA CỬA CỦA MỘT NGƯỜI — Phân hệ 6
--
--  MỘT CỬA LÀ MỘT DÒNG. Không có cột "đã đủ ba cửa", và cũng không
--  có cột "được chạm khách": một cột tóm tắt thì HOẶC bị gõ đè — và
--  lúc ấy một phép đo biến thành một lời khai mà nhìn vẫn y hệt —
--  HOẶC không ai gõ và nó cũ đi lặng lẽ, khai rằng một người đã đủ
--  ba cửa trong khi cửa thứ ba của họ chưa từng mở. Đủ hay chưa thì
--  TÍNH LÚC ĐỌC, từ chính ba dòng này. Cùng luật với cột `conHan`
--  không có trong theVungManh và cột `den` không có trong
--  hoSoSongSinh.
--
--  Cột `nguon` là cột quan trọng nhất của bảng:
--    quaCua  — bài làm và bài chấm nằm trong sổ, xem lại được
--    khaiCu  — R01–R02 khai hộ cho người đã làm nghề trước khi có
--              cổng. Nó mở được cổng, nhưng nó là LỜI KHAI, và sổ
--              phải đọc ra được điều ấy mãi mãi.
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS baCuaConNguoi (
  id        TEXT PRIMARY KEY,
  maNguoi   TEXT NOT NULL,
  cua       TEXT NOT NULL,        -- C1 · C2 · C3
  nguon     TEXT NOT NULL,        -- quaCua · khaiCu
  ngayQua   TEXT NOT NULL,
  boiAi     TEXT NOT NULL,        -- người chấm, hoặc người khai hộ
  ghiChu    TEXT,                 -- căn cứ — bắt buộc với dòng khaiCu
  ghiLuc    TEXT NOT NULL
);

-- Đường tra thật của cả bảng: mỗi lượt ghiCham hỏi đúng câu "người
-- này đã có dòng nào chưa". Không phải một chỉ mục thêm cho bộ thử
-- xanh — nó nằm trên đường nóng nhất trong hệ.
CREATE INDEX IF NOT EXISTS ix_bacua_nguoi ON baCuaConNguoi (maNguoi, cua);

-- ═════════════════════════════════════════════════════════════
--  BA Ô ĐỒNG Ý DỮ LIỆU — Luật số 91/2025/QH15, việc số 2 và 3
--
--  MỘT LƯỢT ĐỒNG Ý HOẶC RÚT LÀ MỘT DÒNG MỚI. Không có cột trạng
--  thái, và không sửa đè dòng cũ: sửa đè thì mất hẳn phần lịch sử —
--  mà chính phần lịch sử trả lời được câu "hôm ấy nhà này đã đồng ý
--  chưa", và đó đúng là câu người ta hỏi lúc có tranh chấp.
--
--  Trạng thái hiện tại của một ô = dòng MỚI NHẤT của ô ấy, tính lúc
--  đọc. Cùng luật với cột `conHan` không có trong theVungManh và cột
--  `den` không có trong hoSoSongSinh.
--
--  Cột `vaiBoiAi` là cột làm cho cả bảng có nghĩa: ô `duLieuCon` chỉ
--  CHA MẸ ký được, và không giữ vai của người ký thì sáu tháng sau
--  không ai truy được ai đã tích ô ấy.
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS dongYDuLieu (
  id        TEXT PRIMARY KEY,
  maNha     TEXT NOT NULL,
  o         TEXT NOT NULL,        -- dieuKhoan · duLieuGiaDinh · duLieuCon
  viec      TEXT NOT NULL,        -- dongY · rut
  boiAi     TEXT NOT NULL,
  vaiBoiAi  TEXT NOT NULL,
  ghiLuc    TEXT NOT NULL
);

-- Đường tra thật: mọi cửa tạo hồ sơ về con hỏi đúng câu "nhà này đã
-- đồng ý ô duLieuCon chưa", mỗi lượt lập hồ sơ một lần.
CREATE INDEX IF NOT EXISTS ix_dongy_nha ON dongYDuLieu (maNha, o, ghiLuc DESC);

-- ═════════════════════════════════════════════════════════════
--  YÊU CẦU XOÁ DỮ LIỆU — Luật số 91/2025/QH15, việc số 4
--
--  HAI PHÍA, VÀ CHÚNG KHÔNG GỘP ĐƯỢC:
--
--    xoaTrongSo  máy đếm được dòng còn lại  →  PHÉP ĐO
--    xoaNgoaiSo  bản sao lưu, tệp đã tải về máy cá nhân, bản in
--                →  LỜI KHAI, kèm tên người khai và căn cứ
--
--  Máy KHÔNG tự đánh dấu xoaNgoaiSo vì máy không nhìn thấy chỗ ấy —
--  một ô máy tự đánh dấu mà không đo được là một lời nói dối mang
--  dấu của hệ thống. Cùng luật với goTrongSo / daGoNgoai của trợ lý
--  hình ảnh.
--
--  `hanXuLy` có mặt vì không có hạn thì việc này trôi cùng nhịp việc
--  thường, và nhịp việc thường là nhịp của thứ không ai giục.
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS yeuCauXoa (
  id            TEXT PRIMARY KEY,
  maNha         TEXT NOT NULL,
  boiAi         TEXT NOT NULL,
  ghiLuc        TEXT NOT NULL,
  hanXuLy       TEXT NOT NULL,
  xoaTrongSo    TEXT,
  trongSoBoiAi  TEXT,
  trongSoCanCu  TEXT,
  xoaNgoaiSo    TEXT,
  ngoaiSoBoiAi  TEXT,
  ngoaiSoCanCu  TEXT
);

-- Câu hỏi nóng của sổ là "cái nào QUÁ HẠN mà chưa xoá", và đó là một
-- phép lọc khoảng trên hạn xử lý.
CREATE INDEX IF NOT EXISTS ix_xoa_han ON yeuCauXoa (hanXuLy);

-- ═════════════════════════════════════════════════════════════
--  SỔ QUYẾT ĐỊNH LỚN — năm bước của GITA-CEO-OS
--
--  HAI MỐC THỜI GIAN, và đó là lý do bảng này tồn tại:
--
--    hoiNguocLuc  lúc viết câu "nếu một năm nữa việc này thất bại…"
--    quyetLuc     lúc chốt
--
--  Máy SO HAI MỐC chứ không đọc một ô tự khai "đã hỏi ngược rồi".
--  Viết câu hỏi ngược SAU khi quyết thì nó không còn là phép dự phòng
--  — nó là một lời biện minh, và nó luôn nghe rất hợp lý. Một ô tự
--  khai không phân biệt được hai chuyện ấy; hai mốc thì phân biệt được.
--
--  Cột `giaDinh` là cột quan trọng nhất của bảng. Giả định sai thì
--  đổi quyết định, không cố chấp — mà muốn biết nó đã sai thì phải có
--  ai đó viết nó ra từ đầu, trước khi biết kết quả.
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS quyetDinhLon (
  id           TEXT PRIMARY KEY,
  hoiDat       TEXT NOT NULL,
  soPhuongAn   INTEGER NOT NULL,
  hoiNguoc     TEXT NOT NULL,
  hoiNguocLuc  TEXT NOT NULL,
  coG5         TEXT NOT NULL,        -- DO · VANG · XANH
  coG7         TEXT NOT NULL,
  quyetGi      TEXT NOT NULL,
  viSao        TEXT NOT NULL,
  giaDinh      TEXT NOT NULL,
  xemLaiKhi    TEXT NOT NULL,
  quyetLuc     TEXT NOT NULL,
  boiAi        TEXT NOT NULL,
  ghiLuc       TEXT NOT NULL
);

-- Câu hỏi nóng của sổ là "quyết định nào tới hạn xem lại", và đó là
-- một phép lọc khoảng trên ngày xem lại.
CREATE INDEX IF NOT EXISTS ix_qd_xemlai ON quyetDinhLon (xemLaiKhi);

-- ═════════════════════════════════════════════════════════════
--  VÒNG CHẠY CỦA MỘT NỘI DUNG CÔNG KHAI
--
--  A soạn → C phản biện → A sửa → D soi luật → người duyệt → đăng.
--
--  MỘT LƯỢT LÀ MỘT DÒNG MỚI. Không có cột "đã qua vòng": ghi đè một
--  ô như thế thì mất hẳn phần lịch sử, mà chính phần lịch sử chứng
--  minh được rằng bài đã đi ĐỦ vòng chứ không phải có người bấm cho
--  xong.
--
--  Và bảng này KHÔNG giữ một chữ nào của prompt. Prompt dựng lúc
--  chạy ở trình duyệt, nơi kho đang mở; giữ một bản ở đây là dựng
--  bản thứ hai của mười ba sự thật cùng một lúc — và bản thứ hai ấy
--  nguy hơn mọi bản trước, vì prompt CHÍNH LÀ thứ nói chuyện với
--  khách.
--
--  Cột `nhaCungCap` là cột làm cho cả bảng có nghĩa. Bước 2 phải ở
--  nhà cung cấp KHÁC bước 1 — cùng một mô hình làm cả soạn lẫn duyệt
--  thì phần duyệt chỉ là phần soạn nói lại lần nữa, và nó sẽ đồng ý
--  với chính nó. Không giữ cột này thì luật ấy không kiểm được, và
--  sổ vẫn đủ sáu dòng nên không ai đọc ra.
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS luotPrompt (
  id          TEXT PRIMARY KEY,
  maBai       TEXT NOT NULL,
  buoc        TEXT NOT NULL,        -- V1…V6
  vai         TEXT,                 -- A · B · C · D, rỗng ở hai bước người
  nhaCungCap  TEXT,                 -- bắt buộc ở bốn bước máy
  boiAi       TEXT NOT NULL,
  ghiChu      TEXT,
  ghiLuc      TEXT NOT NULL
);

-- Đường tra thật: mỗi lượt ghi hỏi đúng câu "bài này đã qua bước nào".
CREATE INDEX IF NOT EXISTS ix_luot_bai ON luotPrompt (maBai, ghiLuc);

-- ═════════════════════════════════════════════════════════════
--  BẢNG GIÁ — SỐ SỬA ĐƯỢC, KHUNG Ở KHO
--
--  Tới 9.99.72 giá gói là HẰNG SỐ trong mã: muốn đổi một con số thì
--  phải sửa kho gốc, mã hoá lại, gộp mã, dựng lại, đẩy. Chủ hệ nói
--  giá hiện tại là TẠM để xây dựng, còn bộ khung mới là cố định — mà
--  một con số tạm chỉ đổi được bằng một lượt phát hành thì trên thực
--  tế nó cứng, và cái cứng nhầm chỗ làm người ta đi đường vòng: gõ
--  tay số khác vào hợp đồng, rồi sổ và hợp đồng nói hai giá.
--
--  MỘT LẦN ĐỔI LÀ MỘT DÒNG MỚI. Không có cột "giá hiện tại": giá
--  đang chạy là dòng MỚI NHẤT của bậc ấy, tính lúc đọc. Một cột tóm
--  tắt thì phải có ai đó cập nhật, và ngày không ai cập nhật thì nó
--  nói dối trong im lặng.
--
--  Vì sao không ghi đè: câu người ta hỏi lúc có tranh chấp không phải
--  "giá bây giờ là bao nhiêu" — nó là "hôm ấy nhà này ký ở giá nào".
--  Ghi đè thì câu ấy không còn chỗ nào trả lời được.
--
--  Năm cột khung chỉ điền với bậc MỚI THÊM. Bậc có sẵn thì khung nằm
--  ở G.HP_TANG trong kho — khung là LỜI HỨA, và lời hứa đổi thì phải
--  qua một lượt phát hành để còn đọc lại được.
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS bangGia (
  id        TEXT PRIMARY KEY,
  tang      TEXT NOT NULL,
  gia       INTEGER NOT NULL,
  lyDo      TEXT NOT NULL,
  boiAi     TEXT NOT NULL,
  vaiBoiAi  TEXT NOT NULL,
  ghiLuc    TEXT NOT NULL,
  dong      INTEGER NOT NULL DEFAULT 0,   -- đóng bậc, KHÔNG xoá
  ten       TEXT,
  gom       TEXT,
  khong     TEXT,
  nhip      TEXT,
  hoan      TEXT
);

-- Đường tra thật: mỗi lượt dựng lịch thu và mỗi lượt tính hoa hồng đều
-- hỏi đúng câu "bậc này giá bao nhiêu, dòng mới nhất".
CREATE INDEX IF NOT EXISTS ix_banggia_tang ON bangGia (tang, ghiLuc DESC);

-- ═════════════════════════════════════════════════════════════
--  MÀN HÔM NAY · NHÀ MÌNH  (9.99.75)
--
--  Chủ hệ chốt LGD-01: bốn tab của MỤC C là mấy màn THÊM vào cổng phụ
--  huynh đã có. Chốt ấy gỡ năm luật giao diện khỏi chỗ treo.
--
--  Bốn bảng dưới đây KHÔNG có cột tóm tắt nào — không "dangBao", không
--  "daDongY", không "daXong". Trạng thái = dòng MỚI NHẤT, tính lúc đọc.
--  Một cột tóm tắt thì hoặc bị gõ đè (và một phép đo biến thành một lời
--  khai, mà nhìn vẫn y hệt), hoặc không ai gõ và nó cũ đi lặng lẽ. Cùng
--  luật với cột conHan không có trong theVungManh và cột den không có
--  trong hoSoSongSinh.
-- ═════════════════════════════════════════════════════════════

--  Nhịp của một nhà. `nangNe` đánh dấu nội dung nặng — màn nào dựng nó
--  cũng phải có nút "Để hôm khác" CÙNG KÍCH CỠ với nút tiếp tục (L12).
CREATE TABLE IF NOT EXISTS nhipNha (
  id        TEXT PRIMARY KEY,
  maNha     TEXT NOT NULL,
  ten       TEXT NOT NULL,
  thuTu     INTEGER NOT NULL DEFAULT 0,
  nangNe    INTEGER NOT NULL DEFAULT 0,
  dong      INTEGER NOT NULL DEFAULT 0,   -- đóng nhịp, KHÔNG xoá
  ghiLuc    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_nhip_nha ON nhipNha (maNha, dong, thuTu);

--  Một nhịp đã tick hoặc đã BỎ trong một ngày. `lyDo` cho phép NULL, và
--  cửa boViecHomNay KHÔNG BAO GIỜ đòi nó — khác nhau ở chỗ MỜI hay ÉP,
--  và chỗ ấy là cả luật L11. Một ô lý do bắt buộc sau khi bỏ việc là
--  một cái cửa quay: lần sau người ta không bỏ việc, họ bỏ app.
CREATE TABLE IF NOT EXISTS nhipXong (
  id        TEXT PRIMARY KEY,
  maNha     TEXT NOT NULL,
  maNhip    TEXT NOT NULL,
  ngay      TEXT NOT NULL,
  bo        INTEGER NOT NULL DEFAULT 0,
  lyDo      TEXT,
  boiAi     TEXT NOT NULL,
  ghiLuc    TEXT NOT NULL,
  UNIQUE (maNha, maNhip, ngay)
);
CREATE INDEX IF NOT EXISTS ix_nhipxong_ngay ON nhipXong (maNha, ngay);

--  Chế độ Bão (L03). KHÔNG có cột lý do và KHÔNG có cột xác nhận — một
--  cột nhận vào là một cột màn hình hỏi được, và cổng thành lời chú
--  giải. Người bật đang ở giữa một chuyện khó; hỏi họ vì sao là bắt họ
--  kể lại nó cho một cái máy đúng lúc họ ít sức nhất.
CREATE TABLE IF NOT EXISTS cheDoBao (
  id        TEXT PRIMARY KEY,
  maNha     TEXT NOT NULL,
  bat       INTEGER NOT NULL,
  boiAi     TEXT NOT NULL,
  ghiLuc    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_chedobao_nha ON cheDoBao (maNha, ghiLuc DESC);

--  Ghim trên bản đồ riêng của một em (L06). Chỉ chính em ấy ghi được —
--  cổng hỏi users.studentId của TÀI KHOẢN ĐANG ĐĂNG NHẬP, không đọc một ô
--  `laCon` do người gọi truyền vào — ô ấy là lời khai của chính người đi qua.
CREATE TABLE IF NOT EXISTS ghimCon (
  id        TEXT PRIMARY KEY,
  maCon     TEXT NOT NULL,
  o         TEXT NOT NULL,
  ghiChu    TEXT,
  ghiLuc    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_ghimcon ON ghimCon (maCon, ghiLuc);

--  Đồng ý đăng ảnh, do CHÍNH ĐỨA TRẺ ký (L07). Một DÒNG MỚI mỗi lần,
--  không ghi đè: đổi ý được cả hai chiều, và một lời đồng ý không rút
--  được thì nó không phải lời đồng ý. Không có cột trạng thái — chưa
--  hỏi và đã từ chối là HAI chuyện, và chúng phải phân biệt được.
CREATE TABLE IF NOT EXISTS dongYAnhCon (
  id        TEXT PRIMARY KEY,
  maCon     TEXT NOT NULL,
  dongY     INTEGER NOT NULL,
  ghiLuc    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_dongyanh ON dongYAnhCon (maCon, ghiLuc DESC);

-- ═════════════════════════════════════════════════════════════
--  GITA-VIP · TRẦN PHẠM VI GIÁM SÁT  (9.99.76)
--
--  Hai bảng, và cả hai đều KHÔNG có cột tóm tắt. Lệnh còn hiệu lực hay
--  không thì TÍNH LÚC ĐỌC từ ô hanDen — một cột "dangHieuLuc" phải có
--  ai đó chạy cập nhật, và ngày không ai chạy thì nó khai một quyền đã
--  hết hạn là CÒN. Cùng luật với cột conHan không có trong theVungManh
--  và cột den không có trong hoSoSongSinh.
-- ═════════════════════════════════════════════════════════════

--  Lệnh uỷ quyền giám sát. Chỉ R01 cấp; phải có hạn, phải có lý do,
--  không tự cấp cho mình, không nhìn vai ngang hoặc trên.
CREATE TABLE IF NOT EXISTS lenhGiamSat (
  id        TEXT PRIMARY KEY,
  phamVi    TEXT NOT NULL,
  ngan      TEXT NOT NULL,          -- NHANSU · KHACH · TRE
  choAi     TEXT NOT NULL,
  lyDo      TEXT NOT NULL,
  aiKy      TEXT NOT NULL,
  hanDen    TEXT NOT NULL,          -- KHÔNG cho NULL: không có quyền vĩnh viễn
  ghiLuc    TEXT NOT NULL,
  thuLuc    TEXT                    -- thu tay trước hạn; NULL là chưa thu
);
CREATE INDEX IF NOT EXISTS ix_lenhgs_han ON lenhGiamSat (hanDen, thuLuc);
CREATE INDEX IF NOT EXISTS ix_lenhgs_ai  ON lenhGiamSat (choAi, ghiLuc DESC);

--  Sổ nối băm. Mỗi dòng mang băm của dòng trước; sửa một dòng giữa sổ
--  là vỡ mọi dòng sau nó, và soatSoDen nói ra vỡ ở ĐÂU.
--
--  Nói rõ giới hạn để người đọc sau không tin quá: cách này KHÔNG chống
--  được người xoá cả sổ hay dựng lại sổ từ đầu. Nó chống được người sửa
--  MỘT dòng rồi để nguyên phần còn lại — và đó mới là thứ hay xảy ra,
--  vì xoá cả sổ thì ai cũng thấy.
CREATE TABLE IF NOT EXISTS soDen (
  stt       INTEGER PRIMARY KEY AUTOINCREMENT,
  luc       TEXT NOT NULL,
  aiLam     TEXT NOT NULL,
  viec      TEXT NOT NULL,
  doiTuong  TEXT,
  chiTiet   TEXT,
  bamTruoc  TEXT NOT NULL,
  bamTu     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_soden_luc ON soDen (luc);

-- ═══════════════════════════════════════════════════════════════
--  CỨU HỆ — PHÁ KÍNH KHI SUPER ADMIN BỊ CHIẾM (9.99.95)
-- ═══════════════════════════════════════════════════════════════
--  KHÔNG có cột "đang băng". Trạng thái = dòng mới nhất loại BANG/MO,
--  tính lúc đọc (cùng luật cột conHan KHÔNG có, 9.99.63). Khoá cứu hệ
--  và địa chỉ email cứu hệ KHÔNG nằm ở đây — chúng là secret của Worker.
CREATE TABLE IF NOT EXISTS cuuHe (
  stt       INTEGER PRIMARY KEY AUTOINCREMENT,
  loai      TEXT NOT NULL,       -- BAODONG · BANG · MO
  luc       TEXT NOT NULL,
  token     TEXT,                -- token một lần, chỉ đi qua email cứu hệ
  hanToken  INTEGER,             -- mốc hết hạn token (ms)
  daDung    INTEGER NOT NULL DEFAULT 0,
  boiAi     TEXT,
  chiTiet   TEXT
);
CREATE INDEX IF NOT EXISTS ix_cuuhe_token ON cuuHe (token);

-- ═══════════════════════════════════════════════════════════════
--  VÒNG TỰ HOÀN THIỆN — LẤP KHO CÓ CẤP PHÉP  (9.99.96)
-- ═══════════════════════════════════════════════════════════════
--
--  banNhapKho KHÔNG có cột "đãDuyệt". Đủ ba cấp hay chưa TÍNH LÚC ĐỌC
--  từ sổ chữ ký duyetNhap — cùng luật cột conHan KHÔNG có trong
--  theVungManh (9.99.63), cột den KHÔNG có trong hoSoSongSinh (9.99.66),
--  cột đã-qua-mấy-cửa KHÔNG có trong luotNangCap (9.99.77).
--
--  trangThai chỉ hai giá trị: 'nhap' (nháp, KHÔNG phục vụ khách) và
--  'daNhap' (đã 入库 sau đủ ba chữ ký). Ranh giới phục vụ khách nằm ở
--  CÂU TRUY VẤN traBoSung (WHERE trangThai='daNhap'), không ở màn hình.
CREATE TABLE IF NOT EXISTS phatSinh (
  id       TEXT PRIMARY KEY,
  loai     TEXT NOT NULL,        -- khoRong · phanHoiXau · hoiNgoaiKichBan · duLieuGia
  kho      TEXT,                 -- kho nào rỗng, nếu là loại khoRong
  cauHoi   TEXT,                 -- câu hỏi khách đặt lúc gặp lỗ
  chiTiet  TEXT NOT NULL,
  aiGhi    TEXT NOT NULL,
  luc      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_phatsinh_loai ON phatSinh (loai);

CREATE TABLE IF NOT EXISTS banNhapKho (
  id          TEXT PRIMARY KEY,
  phatSinhId  TEXT NOT NULL,     -- trỏ vào lỗ nó lấp
  tenKho      TEXT NOT NULL,
  tieuDe      TEXT NOT NULL,
  noiDung     TEXT NOT NULL,
  nguon       TEXT NOT NULL,     -- DẪN NGUỒN từ dữ liệu đã có — không bịa
  loaiDuyet   TEXT NOT NULL DEFAULT 'kho',  -- chọn CHUỖI cấp phép: 'kho' · 'camNang'
  aiSoan      TEXT NOT NULL,
  soanLuc     TEXT NOT NULL,
  trangThai   TEXT NOT NULL,     -- 'nhap' hoặc 'daNhap' (KHÔNG có 'đãDuyệt')
  aiNhap      TEXT,              -- Super Admin 入库
  nhapLuc     TEXT
);
CREATE INDEX IF NOT EXISTS ix_bannhap_tt ON banNhapKho (trangThai);

-- Sổ chữ ký NỐI THÊM, không cột tóm tắt. Đủ ba cấp hay chưa đọc từ đây.
CREATE TABLE IF NOT EXISTS duyetNhap (
  id        TEXT PRIMARY KEY,
  napId     TEXT NOT NULL,
  cap       TEXT NOT NULL,       -- sanPham · giamDoc · superAdmin
  aiDuyet   TEXT NOT NULL,
  duyetLuc  TEXT NOT NULL,
  ghiChu    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_duyetnhap_nap ON duyetNhap (napId);

-- ═══════════════════════════════════════════════════════════════
--  QUYỀN NĂNG AI — SUPER ADMIN CẤP  (9.99.100)
-- ═══════════════════════════════════════════════════════════════
--
--  KHÔNG có cột "đang bật". Bật hay chưa TÍNH LÚC ĐỌC từ dòng mới nhất
--  của (quyen, pham) — thu hồi là một dòng bat=0, không xoá dòng cũ, để
--  giữ lịch sử "hôm ấy quyền này đã bật chưa". Cùng luật dongYDuLieu
--  (9.99.70). Mặc định TẮT: chưa có dòng thì aiCoQuyen trả về false.
CREATE TABLE IF NOT EXISTS quyenAI (
  stt     INTEGER PRIMARY KEY AUTOINCREMENT,
  quyen   TEXT NOT NULL,        -- AI01..AI10
  pham    TEXT NOT NULL,        -- 'he' (toàn hệ) hoặc một vai/gói
  bat     INTEGER NOT NULL,     -- 1 cấp · 0 thu hồi
  boiAi   TEXT NOT NULL,        -- chỉ Super Admin
  luc     TEXT NOT NULL,
  ghiChu  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_quyenai ON quyenAI (quyen, pham);

-- ═══════════════════════════════════════════════════════════════
--  VÒNG TỰ NÂNG CẤP  (9.99.77)
-- ═══════════════════════════════════════════════════════════════
--
--  KHÔNG có cột "đã qua mấy cửa" và KHÔNG có cột "đang ở cửa nào".
--  Đang ở đâu thì TÍNH LÚC ĐỌC từ năm mốc thời gian. Một cột tóm tắt
--  thì hoặc bị gõ đè — và một phép đo biến thành một lời khai mà nhìn
--  vẫn y hệt — hoặc không ai gõ và nó cũ đi lặng lẽ. Cùng luật với cột
--  conHan KHÔNG có trong theVungManh (9.99.63), cột den KHÔNG có trong
--  hoSoSongSinh (9.99.66), cột dangHieuLuc KHÔNG có trong lenhGiamSat
--  (9.99.76).
--
--  Và KHÔNG có cột `daChayThu` kiểu ô tích. Cửa 4 giữ HAI MỐC THẬT —
--  thuBatDau và thuKetThuc — rồi máy trừ. Một ô tích "đã chạy thử đủ"
--  bật được trong một giây, và con số giờ vẫn đủ trong sổ.
CREATE TABLE IF NOT EXISTS luotNangCap (
  id          TEXT PRIMARY KEY,
  viec        TEXT NOT NULL,
  vung        TEXT NOT NULL,
  luiLai      TEXT NOT NULL,        -- đường lùi, VIẾT ở cửa 1
  cap         INTEGER NOT NULL,     -- MÁY xếp, người đề xuất không tự chọn
  capViSao    TEXT NOT NULL,        -- vì sao máy xếp cấp ấy
  aiDeXuat    TEXT NOT NULL,
  deXuatLuc   TEXT NOT NULL,
  nguoiSoi    TEXT,                 -- C2 · tên NGƯỜI, máy không thay được
  soiKetLuan  TEXT,
  soiLuc      TEXT,
  aiKy        TEXT,                 -- C3 · phải khác aiDeXuat
  kyLuc       TEXT,
  thuBatDau   TEXT,                 -- C4 · mốc thật thứ nhất
  thuKetThuc  TEXT,                 -- C4 · mốc thật thứ hai
  thuKetQua   TEXT,
  luiLaiDaThu INTEGER DEFAULT 0,    -- đường lùi ĐÃ ĐI THỬ, không phải đã viết
  aiBat       TEXT,                 -- C5 · cửa cuối phải có một cái tên
  batLuc      TEXT
);
CREATE INDEX IF NOT EXISTS ix_nangcap_luc ON luotNangCap (deXuatLuc DESC);
CREATE INDEX IF NOT EXISTS ix_nangcap_bat ON luotNangCap (batLuc);

-- ═══════════════ NHÂN VẬT KHÁCH (CD-04, 9.99.109) ═══════════════
--  Đồng bộ nhân vật theo tài khoản. CHỈ mấy chỉ mục vào phần dựng sẵn —
--  KHÔNG cột ảnh, KHÔNG cột tên: một dump CSDL lộ không mang theo khuôn
--  mặt hay tên ai (Điều 13). Khoá theo uid; ghi đè (cosmetic, không giữ
--  lịch sử như đồng ý/giá).
CREATE TABLE IF NOT EXISTS nhanVatKH (
  uid     TEXT PRIMARY KEY,
  da      INTEGER NOT NULL DEFAULT 0,
  tocMau  INTEGER NOT NULL DEFAULT 0,
  toc     INTEGER NOT NULL DEFAULT 0,
  ao      INTEGER NOT NULL DEFAULT 0,
  kinh    INTEGER NOT NULL DEFAULT 0,
  ghiLuc  TEXT NOT NULL
);
