/* ═══════════════════════════════════════════════════════════════
   GITA 365 · NHÂN VẬT CHUẨN ĐƯỢC KHÓA (xưởng phim AI)

   Đây là NGUỒN CHUẨN DUY NHẤT cho danh tính nhân vật điện ảnh của
   GITA365: trainer, MC, giảng viên, diễn viên. Mỗi nhân vật có:
     - promptEn: mô tả ngoại hình/trang phục/thần thái ĐÃ KHÓA bằng
       tiếng Anh — mọi cảnh quay đều ghép đoạn này vào prompt để
       nhân vật giữ nguyên danh tính qua từng shot.
     - giong: giọng đọc TTS (edge-tts vi-VN, 0đ) gắn cố định với vai.
     - moTaVe: mô tả tiếng Việt để người vận hành đối chiếu.

   ẢNH THAM CHIẾU (gương mặt khóa) KHÔNG nằm trong kho mã: chúng là
   hạt R2/D1 loại 'nvchuan-<id>', đặt bằng tools/dat-nhan-vat-chuan.mjs
   từ ảnh do chủ hệ duyệt. Máy vẽ (Workers AI klein) nhận tối đa 4 ảnh
   tham chiếu/nhân vật; máy quay Kaggle tải bộ ảnh này qua
   GET /quay/nvchuan để làm ảnh khởi tạo image-to-video.

   NGUYÊN TẮC: không dùng hình/giọng người thật làm mẫu public mặc
   định. Mọi nhân vật do AI tạo; ảnh chuẩn do chủ hệ duyệt bằng mắt
   trước khi khóa. Muốn đổi chuẩn: chạy lại dat-nhan-vat-chuan.mjs
   với bộ ảnh mới (hệ thống tự dùng bộ mới cho cảnh quay sau).
   ═══════════════════════════════════════════════════════════════ */
'use strict';

export const NHAN_VAT_CHUAN = {
  /* ── TRAINER — nhân vật chính phim huấn luyện GITA ── */
  trainer: {
    ten: 'Trainer Trương Nhật Quang',
    vai: 'Huấn luyện viên trưởng — dẫn dắt các lớp huấn luyện, coaching gia đình và doanh nhân',
    giong: 'vi-VN-NamMinhNeural',
    moTaVe: 'Nam diễn giả Việt Nam trung niên (45-50), đeo kính gọng mảnh, tóc đen ngắn gọn điểm bạc thái dương, gương mặt quả cảm, mắt ấm kiên định, vest xanh navy áo sơ mi trắng không cà vạt, thắt lưng khóa vàng, dáng đứng vững tự tin',
    promptEn: 'A charismatic Vietnamese male professional trainer in his late forties, short neat black hair with subtle silver at the temples, thin rectangular glasses, warm determined dark brown eyes, confident warm smile, wearing an elegant navy blue suit with white dress shirt without tie and a gold-buckle leather belt, upright powerful posture, photorealistic, professional corporate photography'
  },
  /* ── MC — dẫn chương trình, giới thiệu khóa học ── */
  mc: {
    ten: 'MC Minh Anh',
    vai: 'MC giáo dục — dẫn dắt video giới thiệu, phỏng vấn, chuyển đoạn sự kiện',
    giong: 'vi-VN-HoaiMyNeural',
    moTaVe: 'Nữ MC Việt Nam thanh lịch (28-32), tóc đen dài gọn gàng, gương mặt sáng, nụ cười tỏa nắng, trang phục áo dài/vest nữ tông trang nhã, đứng bên màn hình trình chiếu',
    promptEn: 'An elegant Vietnamese female television host in her early thirties, long neat black hair, bright radiant face with warm welcoming smile, wearing a refined cream-colored ao dai or pastel blazer, graceful standing posture beside a presentation screen, photorealistic, professional broadcast photography'
  },
  /* ── GIẢNG VIÊN — bài giảng kiến thức, lớp học ── */
  'giang-vien': {
    ten: 'Giảng viên Thu Hà',
    vai: 'Giảng viên nữ — trình bày bài giảng, hướng dẫn từng bước trên bảng/màn hình',
    giong: 'vi-VN-HoaiMyNeural',
    moTaVe: 'Nữ giảng viên Việt Nam (35-40), tóc buộc thấp gọn gàng, áo sơ mi trắng lịch sự, đứng bên bảng trắng/màn hình trong studio giảng dạy, ánh mắt thân thiện sâu sắc',
    promptEn: 'A warm knowledgeable Vietnamese female lecturer in her late thirties, neatly tied-back black hair, white blouse, standing beside a whiteboard in a bright teaching studio, thoughtful friendly eyes, natural teaching hand gesture, photorealistic, professional educational photography'
  },
  /* ── GIA ĐÌNH MẪU (phim coaching gia đình) — chưa khóa ảnh,
        chủ hệ đặt ảnh chuẩn sau bằng dat-nhan-vat-chuan.mjs ── */
  bo: {
    ten: 'Bố (gia đình mẫu)',
    vai: 'Người bố trong các cảnh coaching gia đình',
    giong: 'vi-VN-NamMinhNeural',
    moTaVe: 'Người bố Việt Nam hiền hậu (40-49), tóc ngắn, áo polo xám, quần tây',
    promptEn: 'A kind gentle Vietnamese father in his forties, short hair, grey polo shirt and dress trousers, warm caring expression, photorealistic, family documentary photography'
  },
  me: {
    ten: 'Mẹ (gia đình mẫu)',
    vai: 'Người mẹ trong các cảnh coaching gia đình',
    giong: 'vi-VN-HoaiMyNeural',
    moTaVe: 'Người mẹ Việt Nam dịu dàng (35-44), tóc dài buộc thấp, áo blouse kem',
    promptEn: 'A gentle caring Vietnamese mother in her late thirties, long hair in a low ponytail, cream blouse, soft loving expression, photorealistic, family documentary photography'
  },
  'con-gai': {
    ten: 'Con gái lớp 9 (gia đình mẫu)',
    vai: 'Nữ sinh trong các cảnh coaching gia đình',
    giong: 'vi-VN-HoaiMyNeural',
    moTaVe: 'Nữ sinh Việt Nam lớp 9 (14-15), tóc đuôi ngựa, áo thun trắng đồng phục, ba lô',
    promptEn: 'A Vietnamese schoolgirl around 14 years old, ponytail hair, white school t-shirt uniform with a backpack, bright curious expression, photorealistic, family documentary photography'
  },
  'con-trai': {
    ten: 'Con trai lớp 6 (gia đình mẫu)',
    vai: 'Nam sinh trong các cảnh coaching gia đình',
    giong: 'vi-VN-NamMinhNeural',
    moTaVe: 'Nam sinh Việt Nam lớp 6 (11-12), tóc cắt gọn, áo thun xanh đồng phục',
    promptEn: 'A Vietnamese schoolboy around 11 years old, neat short haircut, blue school t-shirt uniform, playful sincere expression, photorealistic, family documentary photography'
  }
};

export const ID_NHAN_VAT = Object.keys(NHAN_VAT_CHUAN);

export function nhanVatHopLe(id) {
  return Object.prototype.hasOwnProperty.call(NHAN_VAT_CHUAN, String(id || ''));
}

/* Loại hạt R2/D1 chứa ảnh tham chiếu đã khóa của nhân vật. */
export function loaiHatNV(id) { return 'nvchuan-' + String(id || ''); }

/* Giọng TTS của nhân vật (mặc định giọng trainer nếu id lạ). */
export function giongNV(id) {
  const nv = NHAN_VAT_CHUAN[id];
  return nv && nv.giong ? nv.giong : NHAN_VAT_CHUAN.trainer.giong;
}
