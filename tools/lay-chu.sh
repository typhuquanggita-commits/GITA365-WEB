#!/usr/bin/env bash
# Tải lại bộ chữ từ Google Fonts về assets/fonts/ để dùng ngoại tuyến.
# Chỉ chạy khi cần đổi bộ chữ — bình thường không phải chạy.
set -euo pipefail
cd "$(dirname "$0")/.."
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
URL="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,600;0,700;0,800;1,400&family=Playfair+Display:ital,wght@0,600;1,500&display=swap"
curl -sS -A "$UA" "$URL" -o /tmp/gita-gf.css
python3 - <<'PY'
import re, os, subprocess
css = open('/tmp/gita-gf.css', encoding='utf-8').read()
blocks = re.split(r'/\* ([a-z-]+) \*/', css)
os.makedirs('assets/fonts', exist_ok=True)
out, seen = [], {}
for i in range(1, len(blocks), 2):
    subset, body = blocks[i], blocks[i+1]
    if subset not in ('vietnamese', 'latin'): continue
    m = re.search(r"url\((https://fonts\.gstatic\.com/[^)]+)\)", body)
    if not m: continue
    u = m.group(1)
    fam = re.search(r"font-family: '([^']+)'", body).group(1)
    sty = re.search(r"font-style: (\w+)", body).group(1)
    wt  = re.search(r"font-weight: (\d+)", body).group(1)
    name = '%s-%s-%s-%s.woff2' % (fam.replace(' ','').lower(), wt, sty, subset)
    if u not in seen:
        subprocess.run(['curl','-sS','-o','assets/fonts/'+name,u], check=True)
        seen[u] = name
    out.append(body.replace(u, 'fonts/'+seen[u]).strip())
open('assets/fonts.css','w',encoding='utf-8').write(
  "/* GITA 365 — bộ chữ nhúng sẵn, không phụ thuộc mạng ngoài.\n"
  "   Tập con: tiếng Việt + Latin. Dựng lại bằng tools/lay-chu.sh */\n\n"
  + "\n\n".join(out) + "\n")
print('đã tải', len(seen), 'tệp chữ')
PY
