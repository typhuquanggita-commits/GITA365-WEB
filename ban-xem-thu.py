#!/usr/bin/env python3
"""GITA 365 — dựng BẢN XEM THỬ để chủ hệ thống mở bằng đường dẫn web.

Vào: GITA365-v<số bản>-gioi-thieu.html (bản giới thiệu một tệp, chế độ mẫu —
không kèm kho tri thức, không kèm khoá; đúng bản mà trang-web.yml vẫn
đưa lên GitHub Pages).

Ra: ban-xem-thu.html — cùng nội dung ấy nhưng bỏ vỏ <!DOCTYPE>/<html>/
<head>/<body>, vì nơi nhận sẽ tự bọc lại vỏ ấy. Thẻ <style> và <script>
đứng trong thân trang vẫn chạy đúng, nên không mất gì.

    python3 tools/ban-xem-thu.py
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

_ban = re.search(r"version:\s*'([^']+)'",
                 open('src/data.core.js', encoding='utf-8').read())
if not _ban:
    sys.exit('Không đọc được G.META.version trong src/data.core.js')
VAO = 'GITA365-v%s-gioi-thieu.html' % _ban.group(1)
if not os.path.exists(VAO):
    sys.exit('Thiếu %s — chạy python3 tools/dong-goi.py trước.' % VAO)

html = open(VAO, encoding='utf-8').read()

m = re.search(r'<head[^>]*>(.*?)</head>', html, re.S)
if not m:
    sys.exit('Không tìm thấy phần <head> — bản một tệp đã đổi hình dạng.')
dau = m.group(1)

m2 = re.search(r'<body[^>]*>(.*?)</body>', html, re.S)
if not m2:
    sys.exit('Không tìm thấy phần <body>.')
than = m2.group(1)

# Giữ lại từ phần đầu: tiêu đề và mọi thẻ <style>. Bỏ <meta>/<link> vì
# nơi nhận tự đặt charset·viewport, còn CSP dạng thẻ meta chỉ có tác dụng
# khi nằm trong <head> — đặt ở thân trang trình duyệt sẽ bỏ qua.
# Tên trang là TÊN, không phải câu mô tả: nơi nhận xếp nó cạnh hàng chục
# trang khác nên phải nhận ra ngay bằng tên riêng.
tieu = 'GITA 365 · Gia Đình Thịnh Vượng'
kieu = re.findall(r'<style>.*?</style>', dau, re.S)

# Nền trang: nơi nhận sơn nền của nó phía sau, nên phải tự sơn nền lại,
# nếu không trang sẽ mượn nền sáng/tối của chỗ đặt và chữ chìm mất.
nen = ('<style>\n'
       ':root{color-scheme:dark}\n'
       'html,body{background:#070510;color:#F2F0FA;margin:0}\n'
       '</style>')

ra = ('<title>%s</title>\n' % tieu) + nen + '\n' + '\n'.join(kieu) + '\n' + than

out = 'ban-xem-thu.html'
open(out, 'w', encoding='utf-8').write(ra)
print('%s · %d KB · %d thẻ kiểu dáng' % (out, os.path.getsize(out) // 1024, len(kieu)))
