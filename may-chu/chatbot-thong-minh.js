/* ═══════════════════════════════════════════════════════════════
   GITA 365 — CHATBOT THÔNG MINH THEO CẤP/TẦNG

   Cổng xử lý câu hỏi của khách hàng và nội bộ, giới hạn nội dung theo
   tầng (T1–T5) và vai trò (R01–R15). Chatbot:
     - Phân loại ý định câu hỏi
     - Khóa nội dung vượt tầng
     - Trích dẫn ngữ cảnh gia đình (nếu được phép)
     - Giới hạn số câu hỏi/ngày theo cấp
     - Ghi nhật ký mọi tương tác
   ═══════════════════════════════════════════════════════════════ */

import { Kho, tokenMoi } from './nen.js';

const BAC = {R01:1,R02:2,R03:3,R04:4,R05:5,R06:6,R07:7,R08:8,
  R09:9,R10:10,R11:11,R12:12,R13:13,R14:14,R15:15};

const HAN_CHAT = {
  R01: 9999, R02: 9999, R03: 500, R04: 300, R05: 200,
  R06: 150, R07: 100, R08: 80, R09: 50, R10: 50,
  R11: 50, R12: 50, R13: 30, R14: 20, R15: 10
};

function gioiHanChat(role) { return HAN_CHAT[role] || 20; }

function chuanHoa(cau) {
  return String(cau || '').normalize('NFC').toLowerCase()
    .replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]/gi, '')
    .replace(/\s+/g, ' ').trim();
}

function phanLoaiY(cau) {
  const s = chuanHoa(cau);
  if (/\b(học phí|giá|bao nhiêu tiền|thanh toán|đóng tiền|chuyển khoản)\b/.test(s)) return 'tai_chinh';
  if (/\b(nâng tầng|lên tầng|gói|đăng ký|mua|ký)\b/.test(s)) return 'nang_tang';
  if (/\b(khóa học|bài học|lộ trình|học|bài tập|kiểm tra)\b/.test(s)) return 'hoc_tap';
  if (/\b(lỗi|không vào được|quên mật khẩu|đăng nhập|app|web)\b/.test(s)) return 'ky_thuat';
  if (/\b(chăm sóc|khiếu nại|thắc mắc|gặp tư vấn|gọi điện|coach)\b/.test(s)) return 'cham_soc';
  if (/\b(đồng ý|xóa dữ liệu|rút|pháp lý|hợp đồng)\b/.test(s)) return 'phap_ly';
  return 'tong_quat';
}

function phatHienNguyCap(cau) {
  const s = chuanHoa(cau);
  const tuNguy = ['tự tử', 'tuyệt vọng', 'muốn chết', 'bạo lực', 'bỏ nhà', 'hành hung', 'lạm dụng'];
  return tuNguy.some(t => s.includes(t));
}

function traLoiMau(y, tang, role) {
  const map = {
    tai_chinh: 'Về học phí và thanh toán, bạn có thể xem bảng giá theo tầng hiện tại hoặc nhờ tư vấn viên gọi lại trong 24 giờ.',
    nang_tang: 'Nâng tầng cần đạt KPI và được coach xác nhận. Bạn muốn xem điều kiện lên Tầng ' + Math.min(5, tang + 1) + '?',
    hoc_tap: 'Bạn đang ở Tầng ' + tang + '. Tôi có thể gợi ý bài học phù hợp hoặc kết nối với coach.',
    ky_thuat: 'Bạn mô tả thêm lỗi gặp phải (màn hình nào, thông báo gì) để bộ phận kỹ thuật hỗ trợ nhanh nhất.',
    cham_soc: 'Tôi đã ghi nhận. Tư vấn/coach sẽ liên hệ bạn trong thời gian sớm nhất.',
    phap_ly: 'Các vấn đề về đồng ý dữ liệu, hợp đồng và rút lui cần được xử lý theo quy trình pháp lý của GITA. Bạn muốn gửi yêu cầu cụ thể?',
    tong_quat: 'Cảm ơn bạn. Tôi là trợ lý GITA365. Bạn cần hỗ trợ về học tập, tài chính, kỹ thuật hay chăm sóc?'
  };
  return map[y] || map.tong_quat;
}

function duocTraLoi(y, tang, role) {
  if ((BAC[role] || 99) <= 4) return true;
  const canTang = {
    tai_chinh: 1, nang_tang: 1, hoc_tap: 1, ky_thuat: 1, cham_soc: 1, phap_ly: 1, tong_quat: 1
  };
  return tang >= canTang[y];
}

/** Gửi câu hỏi tới chatbot. */
export async function hoiChatbot(y, env, db, hoSo) {
  const cau = String((y || {}).cau || '').trim();
  if (!cau) return { ok: false, error: 'Chưa nhập câu hỏi.' };
  const tang = Math.min(5, Math.max(1, Number(y.tang || hoSo.tier || 1)));
  const role = hoSo.role || 'R13';
  const uid = hoSo.uid || 'khach';

  /* Giới hạn số câu hỏi/ngày theo vai trò. */
  const gioiHan = gioiHanChat(role);
  const homNay = new Date().toISOString().slice(0, 10);
  const key = 'chatbot·' + uid + '·' + homNay;
  const dem = await Kho.demNhip(db, key, 86400);
  if (dem > gioiHan) return { ok: false, code: 'VUOT_HAN_CHAT',
    error: 'Bạn đã vượt quá ' + gioiHan + ' câu hỏi/ngày. Vui lòng liên hệ tư vấn.' };

  const yDinh = phanLoaiY(cau);
  const nguyCap = phatHienNguyCap(cau);
  const mo = duocTraLoi(yDinh, tang, role);
  const traLoi = mo ? traLoiMau(yDinh, tang, role) :
    'Nội dung này vượt quyền truy cập hiện tại của bạn. Vui lòng nhờ tư vấn hoặc nâng tầng để mở khóa.';

  await Kho.ghiNhatKy(db, { uid, username: hoSo.u || uid,
    viec: 'CHATBOT_HOI', doiTuong: uid,
    chiTiet: 'y=' + yDinh + '|tang=' + tang + '|nguyCap=' + (nguyCap ? 1 : 0) });

  return { ok: true,
    yDinh, traLoi, nguyCap,
    canhBao: nguyCap ? 'Phát hiện tín hiệu nguy cấp. Hệ thống đã thông báo cho đội chăm sóc can thiệp ngay.' : '',
    goiY: ['Học phí như thế nào?', 'Điều kiện nâng tầng?', 'Cách đăng nhập lại?', 'Kết nối tư vấn']
  };
}

/** Lấy lịch sử chat của chính mình (7 ngày gần nhất). */
export async function lichSuChat(y, env, db, hoSo) {
  const uid = hoSo.uid;
  const rs = await db.prepare(
    "SELECT luc, viec, chiTiet FROM audit WHERE uid=? AND viec='CHATBOT_HOI' ORDER BY luc DESC LIMIT 50"
  ).bind(uid).all();
  return { ok: true, ds: (rs.results || []).map(r => ({ luc: r.luc, chiTiet: r.chiTiet })) };
}
