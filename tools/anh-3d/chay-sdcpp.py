"""Tạo ảnh 3D cho web app bằng FLUX.1-schnell (Apache-2.0) chạy CPU qua
stable-diffusion.cpp — đường KHÔNG cần khoá dịch vụ nào.

Vì sao có đường này: khoá Cloudflare ở GitHub Secrets không có quyền Workers
AI (HTTP 401, 10/10/2026). Máy GitHub Actions tải được mô hình từ Hugging
Face, nên chạy luôn tại máy ấy. Mỗi máy chạy một nhóm ảnh (ma trận), máy gộp
nén WebP rồi đẩy sang nhánh anh-3d.

Lời nhắc chỉ ASCII, không tên người (Điều 13) — bộ soát chặn trước khi chạy.
Dùng: python3 -I tools/anh-3d/chay-sdcpp.py <sd> <thư-mục-mô-hình> <ra> <nhóm> <số-nhóm> [mã,…]"""
import json, os, subprocess, sys, time

sd, md, ra, nhom, so_nhom = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4]), int(sys.argv[5])
chon = [x for x in (sys.argv[6] if len(sys.argv) > 6 else '').split(',') if x]
goc = os.path.dirname(os.path.abspath(__file__))
de = json.load(open(os.path.join(goc, 'de-bai.json'), encoding='utf-8'))
ds = [a for a in de['anh'] if not chon or a['ma'] in chon]
ds = [a for i, a in enumerate(ds) if i % so_nhom == nhom]
os.makedirs(ra, exist_ok=True)
loi = 0
for a in ds:
    p = a['p'] + ', ' + de['phongCach']
    if not all(32 <= ord(c) < 127 for c in p):
        print(a['ma'], ': lời nhắc có ký tự ngoài ASCII — không chạy'); sys.exit(1)
    seed = 365 + de['anh'].index(a)
    ra_tep = os.path.join(ra, a['ma'] + '.png')
    lenh = [sd, '--diffusion-model', os.path.join(md, 'flux1-schnell-Q4_0.gguf'),
            '--vae', os.path.join(md, 'ae.safetensors'),
            '--clip_l', os.path.join(md, 'clip_l.safetensors'),
            '--t5xxl', os.path.join(md, 't5xxl.gguf'),
            '-p', p, '--cfg-scale', '1.0', '--sampling-method', 'euler', '--steps', '4',
            '-W', '1152', '-H', '768', '--seed', str(seed), '-t', str(os.cpu_count() or 4), '-o', ra_tep]
    t0 = time.time()
    r = subprocess.run(lenh, capture_output=True, text=True)
    if r.returncode != 0 or not os.path.exists(ra_tep):
        loi += 1
        print('✗', a['ma'], 'mã thoát', r.returncode); print((r.stdout + r.stderr)[-3000:])
        continue
    print('✓', a['ma'], round(time.time() - t0), 'giây', os.path.getsize(ra_tep) // 1024, 'KB', flush=True)
sys.exit(1 if loi else 0)
