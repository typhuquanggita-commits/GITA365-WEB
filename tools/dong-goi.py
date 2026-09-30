#!/usr/bin/env python3
"""
GITA 365 — ĐÓNG GÓI BẢN MỘT TỆP (giới thiệu / xem thử)

Dùng:
  python3 tools/dong-goi.py
  python3 tools/dong-goi.py --ten "GITA365-<phiên-bản>-gioi-thieu.html"

Sinh một tệp HTML duy nhất chứa:
  · vỏ ứng dụng từ index.html
  · gita-app.js (không kèm gita-nghe.js — bản giới thiệu)
  · cau-hinh.js
  · kho/mau.json nhúng dưới dạng G.MAU_NHUNG

Bản một tệp này DÙNG ĐỂ GỬI XEM THỬ, không phải bản chính thức.
Không kèm kho tri thức đã mã hóa. Không cần máy chủ.
"""
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def _read_version() -> str:
    core = (ROOT / 'src' / 'data.core.js').read_text(encoding='utf-8')
    m = re.search(r"version\s*:\s*['\"]([^'\"]+)['\"]", core)
    return m.group(1) if m else 'unknown'


OUT_DEFAULT = ROOT / f"GITA365-{_read_version()}-gioi-thieu.html"


def read_text(rel: str) -> str:
    return (ROOT / rel).read_text(encoding='utf-8')


def read_json(rel: str) -> dict:
    return json.loads((ROOT / rel).read_text(encoding='utf-8'))


def inline_js(html: str, src: str) -> str:
    """Thay <script src="X.js"></script> bằng <script>...nội dung...</script>."""
    code = read_text(src)
    marker = f'<script src="{src}"></script>'
    if marker in html:
        return html.replace(marker, f'<script>\n{code}\n</script>', 1)
    return re.sub(
        rf'<script[^>]+src="{re.escape(src)}"[^>]*>\s*</script>',
        f'<script>\n{code}\n</script>',
        html,
        count=1,
    )


def inject_mau(html: str) -> str:
    """Nhúng kho mẫu vào đầu phần <script> thứ ba (inline app)."""
    mau = read_json('kho/mau.json')
    injection = f"""
<script>
window.GITA_KHO_NHUNG = {{"mau": {json.dumps(mau, ensure_ascii=False)}}};
window.G = window.G || {{}}; window.G.MAU_NHUNG = window.GITA_KHO_NHUNG["mau"];
</script>
"""
    # Chèn ngay trước </body>
    if '</body>' in html:
        return html.replace('</body>', injection + '</body>', 1)
    return html + injection


def build(out_path: Path) -> None:
    html = read_text('index.html')

    # Inline các tệp JS chính
    for src in ['gita-app.js', 'cau-hinh.js']:
        html = inline_js(html, src)

    # Xoá đăng ký service worker — bản một tệp không cần SW.
    # Vì mã nguồn chứa chuỗi <script trong regex sanitizer, dùng tìm kiếm vị trí cứng.
    boot_marker = 'G.boot();\n'
    boot_idx = html.find(boot_marker)
    if boot_idx != -1:
        close_script_after = html.find('</script>', boot_idx)
        if close_script_after != -1:
            html = html[:boot_idx + len(boot_marker)] + html[close_script_after:]
    # Xoá dòng if serviceWorker còn sót (nếu regex bên trong mã nguồn có chuỗi tương tự)
    sw_start = html.find("if ('serviceWorker' in navigator")
    if sw_start != -1:
        before = html.rfind('<script>', 0, sw_start)
        after = html.find('</script>', sw_start)
        if before != -1 and after != -1:
            html = html[:before] + f'<script>\n{boot_marker}</script>' + html[after + 9:]

    # Thêm ghi chú bản giới thiệu
    html = html.replace(
        '</head>',
        '  <meta name="description" content="GITA 365 — bản xem thử, không kèm kho tri thức đầy đủ.">\n</head>',
        1,
    )

    html = inject_mau(html)

    out_path.write_text(html, encoding='utf-8')
    size_kb = out_path.stat().st_size / 1024
    print(f"✓ {out_path.name} · {size_kb:.1f} KB")
    print("  Bản giới thiệu: có vỏ + gói mẫu, không cần máy chủ, không kèm kho nghề/tầng.")


def main() -> None:
    out = Path(sys.argv[2]) if len(sys.argv) >= 3 and sys.argv[1] == '--ten' else OUT_DEFAULT
    if out.is_absolute():
        out_path = out
    else:
        out_path = ROOT / out
    build(out_path)


if __name__ == '__main__':
    main()
