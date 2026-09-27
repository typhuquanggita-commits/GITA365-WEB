#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# GITA 365 — nạp bí mật máy chủ lên Cloudflare Worker
#
#   Chạy trong thư mục may-chu/ (nơi có wrangler.toml):
#       bash nap-bi-mat.sh                 # đọc ../kho/khoa.json
#       bash nap-bi-mat.sh /duong/dan/khoa.json
#
# Việc duy nhất script này tự làm là nạp GITA_KHOA_KHO — bí mật hay bị
# dán sai nhất, và là lý do #1 của "máy chủ từ chối cấp khoá / kho trống".
# Máy chủ tự mở bọc .khoa, nên dán NGUYÊN tệp khoa.json cũng chạy.
#
# BA bí mật còn lại chỉ IN RA lệnh, KHÔNG tự chạy — vì GITA_TIEU (tiêu
# băm mật khẩu) mà đổi thì MỌI mật khẩu hỏng cùng lúc. Nạp một lần, tay.
# ═══════════════════════════════════════════════════════════════
set -e
cd "$(dirname "$0")"
KHOA="${1:-../kho/khoa.json}"

if [ ! -f "$KHOA" ]; then
  echo "✗ Không thấy tệp khoá: $KHOA"
  echo "  Đặt tệp kho/khoa.json cạnh kho, hoặc chỉ đường dẫn:"
  echo "      bash nap-bi-mat.sh /duong/dan/toi/khoa.json"
  exit 1
fi

echo "→ Nạp GITA_KHOA_KHO từ: $KHOA"
cat "$KHOA" | npx wrangler secret put GITA_KHOA_KHO
echo ""
echo "✓ Xong GITA_KHOA_KHO."
echo ""
echo "Ba bí mật còn lại — nạp MỘT LẦN nếu Worker chưa có (tự gõ, script"
echo "KHÔNG tự chạy vì đổi GITA_TIEU là mọi mật khẩu hỏng cùng lúc):"
echo ""
echo "  # Tiêu băm mật khẩu — sinh MỘT LẦN, giữ mãi, đừng đổi:"
echo "  node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\" | npx wrangler secret put GITA_TIEU"
echo "  npx wrangler secret put GITA_KHOA_KY    # gõ một chuỗi ngẫu nhiên bất kỳ"
echo "  npx wrangler secret put GITA_KHOA_THU   # khoá Resend — chỉ cần nếu gửi email"
echo ""
echo "Rồi đưa Worker lên:"
echo "  npx wrangler deploy"
echo ""
echo "Kiểm: mở app → Quản trị trang → Nối máy chủ → Gọi thử → thấy số khoá > 0."
