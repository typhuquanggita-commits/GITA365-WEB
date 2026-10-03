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

import { Kho } from './nen.js';
import { bacVai } from './vai-tro.js';

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
    tai_chinh: 'Để hỗ trợ đúng việc, bạn đang cần hỏi về thanh toán, hóa đơn hay hoàn tiền?',
    nang_tang: 'Bạn muốn làm rõ điều kiện nào trước khi cân nhắc chặng tiếp theo?',
    hoc_tap: 'Bạn đang vướng ở bài học cụ thể nào hoặc ở phần nào của lộ trình hiện tại?',
    ky_thuat: 'Lỗi xuất hiện ở màn hình nào và thông báo chính xác là gì?',
    cham_soc: 'Bạn cần đội ngũ chăm sóc hỗ trợ việc gì cụ thể?',
    phap_ly: 'Câu hỏi của bạn liên quan đến hợp đồng, điều khoản hay quyền riêng tư?',
    tong_quat: 'Điều gì đang làm bạn cần hỗ trợ nhất lúc này?'
  };
  return map[y] || map.tong_quat;
}

async function layTangKhach(db, uid, maKH) {
  if (maKH) {
    return await db.prepare(
      'SELECT tang FROM hoSoKhach WHERE uidPhuHuynh=? AND maKhachHang=?'
    ).bind(uid, maKH).first();
  }
  const rs = await db.prepare(
    'SELECT maKhachHang, tang FROM hoSoKhach WHERE uidPhuHuynh=? ORDER BY vaoLuc DESC LIMIT 2'
  ).bind(uid).all();
  const ds = rs.results || [];
  return ds.length === 1 ? ds[0] : null;
}

/** Gửi câu hỏi tới chatbot. */
export async function hoiChatbot(y, env, db, hoSo) {
  y = y || {};
  const cau = String(y.cau || '').trim();
  if (!cau) return { ok: false, error: 'Chưa nhập câu hỏi.' };
  if (cau.length > 2000) return { ok: false, error: 'Câu hỏi tối đa 2.000 ký tự.' };
  const role = String((hoSo || {}).role || '');
  const uid = String((hoSo || {}).uid || '');
  const bac = bacVai(hoSo);
  if (!uid || bac > 15) return { ok: false, code: 'NOPERM', error: 'Phiên đăng nhập không hợp lệ.' };
  let tang = 5;
  if (bac > 12) {
    const khach = await layTangKhach(db, uid, String(y.maKH || '').trim());
    if (!khach) return { ok: false, code: 'NOPERM',
      error: 'Không có hồ sơ khách hàng thuộc phiên này hoặc cần chọn mã khách hàng.' };
    tang = Math.min(5, Math.max(1, Number(khach.tang || 1)));
  }

  /* Giới hạn số câu hỏi/ngày theo vai trò. */
  const gioiHan = gioiHanChat(role);
  const homNay = new Date().toISOString().slice(0, 10);
  const key = 'chatbot·' + uid + '·' + homNay;
  const dem = await Kho.demNhip(db, key, 86400);
  if (dem > gioiHan) return { ok: false, code: 'VUOT_HAN_CHAT',
    error: 'Bạn đã vượt quá ' + gioiHan + ' câu hỏi/ngày. Vui lòng liên hệ tư vấn.' };

  const yDinh = phanLoaiY(cau);
  const nguyCap = phatHienNguyCap(cau);
  const traLoi = nguyCap
    ? 'Điều bạn vừa chia sẻ cần một người thật hỗ trợ ngay. Bạn có đang ở nơi an toàn lúc này không?'
    : traLoiMau(yDinh, tang, role);

  await Kho.ghiNhatKy(db, { uid, username: hoSo.u || uid,
    viec: 'CHATBOT_HOI', doiTuong: uid,
    chiTiet: 'y=' + yDinh + '|tang=' + tang + '|nguyCap=' + (nguyCap ? 1 : 0) });

  return { ok: true,
    yDinh, traLoi, nguyCap, phamVi: 'huong_dan_chung_khong_co_noi_dung_khoa_hoc',
    canhBao: nguyCap ? 'Tin nhắn có thể cho thấy nguy cơ cần được người thật hỗ trợ. Chatbot chưa gửi cảnh báo cho nhân viên. ' +
      'Nếu có nguy hiểm tức thời, hãy liên hệ dịch vụ khẩn cấp tại địa phương hoặc người đáng tin cậy ngay.' : '',
    canChuyenNguoiThat: nguyCap || yDinh === 'cham_soc',
    goiY: []
  };
}

/** Lấy lịch sử chat của chính mình (7 ngày gần nhất). */
export async function lichSuChat(y, env, db, hoSo) {
  const uid = (hoSo || {}).uid;
  if (!uid) return { ok: false, code: 'NOPERM' };
  const tuLuc = new Date(Date.now() - 7 * 864e5).toISOString();
  const rs = await db.prepare(
    "SELECT luc, viec, chiTiet FROM audit WHERE uid=? AND viec='CHATBOT_HOI' AND luc>=? ORDER BY luc DESC LIMIT 50"
  ).bind(uid, tuLuc).all();
  return { ok: true, ds: (rs.results || []).map(r => ({ luc: r.luc, chiTiet: r.chiTiet })) };
}
