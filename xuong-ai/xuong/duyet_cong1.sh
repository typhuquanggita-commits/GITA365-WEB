#!/usr/bin/env bash
# Cổng 1 của xưởng bằng human-gate: người duyệt BAO_CAO.md của một lần chạy.
#
#   bash duyet_cong1.sh mo         lan-chay/<lần chạy>   # dựng trang duyệt BAO_CAO.review.html
#   bash duyet_cong1.sh tinh-trang lan-chay/<lần chạy>   # 0 xong · 2 còn chặn · 3 chờ thu · 4 chưa ai xem
#   bash duyet_cong1.sh thu        lan-chay/<lần chạy>   # đọc ý kiến người duyệt
#   bash duyet_cong1.sh dong       lan-chay/<lần chạy>   # đóng cổng; thoát 2 là CHƯA xong
#
# Ý kiến do NGƯỜI viết vào BAO_CAO.review.md (dòng "reviewer: <tên>", rồi BLOCKER / MAJOR /
# APPROVE...). Máy không viết tệp ấy. Cổng chỉ đóng khi có người duyệt có tên và không còn BLOCKER.
# human-gate có tuỳ chọn --waive (bỏ qua cổng kèm lý do): chỉ người được dùng, máy không bao giờ.
set -euo pipefail
GOC_KHO="$(cd "$(dirname "$0")/../.." && pwd)"
HG="${HUMAN_GATE:-$GOC_KHO/.claude/skills/human-gate/scripts/human_gate.py}"
[ -f "$HG" ] || { echo "Không thấy human-gate ở $HG (đặt biến HUMAN_GATE nếu xưởng nằm ở kho khác)."; exit 1; }
[ $# -eq 2 ] || { sed -n 4,7p "$0"; exit 1; }
BC="$2/BAO_CAO.md"
[ -f "$BC" ] || { echo "Không thấy $BC"; exit 1; }
case "$1" in
  mo)         python3 -I "$HG" open "$BC" ;;
  tinh-trang) python3 -I "$HG" status "$BC" ;;
  thu)        python3 -I "$HG" collect "$BC" ;;
  dong)       python3 -I "$HG" close "$BC" ;;
  *)          sed -n 4,7p "$0"; exit 1 ;;
esac
