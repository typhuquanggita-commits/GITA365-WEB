#!/usr/bin/env bash
# GITA 365 — chuẩn bị phiên làm việc
# Bộ kiểm phát hành cần một máy chủ tĩnh ở cổng 8099. Bật sẵn để không
# phải nhớ, và để lần chạy kiểm đầu tiên không hỏng vì thiếu máy chủ.
set -u
cd "$(dirname "$0")/.." || exit 0

if curl -sf --noproxy '*' -o /dev/null http://127.0.0.1:8099/index.html 2>/dev/null; then
  echo "Máy chủ thử đã sẵn ở http://127.0.0.1:8099"
else
  nohup npx --yes http-server -p 8099 -s . >/dev/null 2>&1 &
  for _ in $(seq 1 20); do
    curl -sf --noproxy '*' -o /dev/null http://127.0.0.1:8099/index.html 2>/dev/null && break
    sleep 1
  done
  curl -sf --noproxy '*' -o /dev/null http://127.0.0.1:8099/index.html 2>/dev/null \
    && echo "Đã bật máy chủ thử ở http://127.0.0.1:8099" \
    || echo "Chưa bật được máy chủ thử — chạy tay: npx http-server -p 8099 -s ."
fi

[ -d kho-goc ] || echo "⚠ Thiếu kho-goc/ — nội dung gốc chưa mã hoá không nằm trong kho mã."
[ -f kho/khoa.json ] || echo "⚠ Thiếu kho/khoa.json — chạy: node tools/ma-hoa-kho.js"
echo "Một lệnh làm hết: node tools/phat-hanh.js   ·   xem docs/CACH_LAM.md"
