#!/usr/bin/env bash
# Dựng thư mục trang công khai (_site) cho Cloudflare Pages.
#
#   bash tools/dung-site.sh [thư-mục-ra]     (mặc định: _site)
#
# Đây là DANH SÁCH TRẮNG: chỉ những gì ghi ở đây mới lên trang công khai.
# Mã máy chủ, công cụ, tài liệu nội bộ, tệp zip… không bao giờ được chép.
#
# Vì sao tách ra một tệp: deploy.yml và bộ kiểm tools/thu-trang-cong-khai.mjs
# phải dùng CHUNG một danh sách. Trước 9/10/2026 danh sách nằm trong
# deploy.yml, và năm trang giới thiệu nạp src/i18n-marketing.js mà danh sách
# không chép → trang thật trả 404, nút đổi tiếng Anh chết, không bộ kiểm nào
# thấy vì không bộ nào dựng lại đúng cái thư mục được đưa lên.
set -eu
cd "$(dirname "$0")/.."
RA="${1:-_site}"

rm -rf "$RA"
mkdir -p "$RA"
find . -maxdepth 1 -type f -name '*.html' -exec cp {} "$RA"/ \;
cp gita-app.js gita-nghe.js cau-hinh.js sw.js manifest.webmanifest \
  _headers _redirects robots.txt sitemap.xml "$RA"/
cp -R assets kho "$RA"/
# Gói nội dung MÃ HOÁ mà màn hình tải bằng fetch (kho vấn đề, kho cấp cao,
# kho nhà, sách nội bộ). Trước 10/10/2026 các thư mục này không có trong
# danh sách, nên trên trang thật nút "Mở gói và nạp" nhận 404 — mọi bộ kiểm
# chạy trên máy chủ tĩnh của kho mã nên đều xanh. Chỉ chép tệp .enc: nguồn
# trần không bao giờ đi theo, kể cả khi ai đó lỡ để nó trong thư mục.
for d in kho-van-de kho-cao kho-nha kho-sach; do
  if [ -d "$d" ]; then mkdir -p "$RA/$d"; find "$d" -maxdepth 1 -type f -name '*.enc' -exec cp {} "$RA/$d/" \; ; fi
done
# Tệp lẻ trong src/ mà trang HTML nạp trực tiếp (không đi qua gita-app.js)
mkdir -p "$RA/src"
cp src/i18n-marketing.js "$RA/src/"
touch "$RA/.nojekyll"

test -s "$RA/index.html"
test -s "$RA/gita-app.js"
test -s "$RA/gita-nghe.js"
test -d "$RA/kho"
test ! -e "$RA/may-chu"
test ! -e "$RA/tools"
test ! -e "$RA/server"
test ! -e "$RA/desktop"
# Khoá chủ của kho nội dung KHÔNG BAO GIỜ được lên trang công khai
rm -f "$RA/kho/khoa.json"
test ! -e "$RA/kho/khoa.json"
test -z "$(find "$RA"/kho-* -type f ! -name '*.enc' 2>/dev/null)"
test -z "$(find "$RA" -name '*.gita' -o -name '*.bien-nhan.txt' -o -name 'PHIEU-QUYET.md' \
  -o -name '*.zip' -o -name '.dev.vars' -o -name '.env' -o -name '*.pem' -o -name '*.key')"
printf 'Prepared Cloudflare Pages artifact: %s files\n' "$(find "$RA" -type f | wc -l)"
