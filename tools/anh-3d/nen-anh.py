"""Cắt ảnh 1024x1024 về khổ 3:2 và nén WebP cho web app.
Dùng: python3 -I tools/anh-3d/nen-anh.py <thư-mục-vào> <thư-mục-ra>"""
import sys, os, glob
from PIL import Image
vao, ra = sys.argv[1], sys.argv[2]
os.makedirs(ra, exist_ok=True)
for f in sorted(glob.glob(os.path.join(vao, '*.jpg')) + glob.glob(os.path.join(vao, '*.png'))):
    im = Image.open(f).convert('RGB')
    w, h = im.size
    if abs(w / h - 1.5) > 0.01:          # ảnh vuông (Workers AI) → cắt giữa về 3:2
        nh = int(w * 2 / 3)
        top = max(0, (h - nh) // 2)
        im = im.crop((0, top, w, top + nh))
    im = im.resize((1152, 768), Image.LANCZOS)
    ma = os.path.splitext(os.path.basename(f))[0]
    im.save(os.path.join(ra, ma + '.webp'), 'WEBP', quality=80, method=6)
    print(ma, os.path.getsize(os.path.join(ra, ma + '.webp')) // 1024, 'KB')
