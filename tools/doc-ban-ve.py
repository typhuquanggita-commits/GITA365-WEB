#!/usr/bin/env python3
"""
GITA 365 — ĐỌC BỘ 13 TỜ A0 THÀNH KHO

    python3 tools/doc-ban-ve.py <đường-dẫn>/GITA365_bo_13_to_A0.pdf

Bộ bản vẽ là ĐẶC TẢ HỆ THỐNG, không phải nội dung. Nó khai 5 tầng × 10
cấp độ = 50 ô, và mỗi ô là một tag mà toàn bộ tự động hoá treo vào. Chép
tay 50 ô ấy là chép tay một cái xương sống — sai một ô thì hệ đếm sai
một chỗ mà không ai biết.

Nên có công cụ này: chủ hệ sửa tờ nào thì chạy lại một lệnh, kho dựng
lại theo, và chỗ lệch lộ ra ngay ở lần chạy sau.

CẦN GÌ
    poppler-utils (lệnh pdftotext). Trên Ubuntu: apt-get install poppler-utils

CÁCH ĐỌC — VÌ SAO CẮT THEO TOẠ ĐỘ CỘT

Tờ A0 in bảng nhiều cột, và ô nào dài thì chữ xuống dòng. Nếu tách theo
khoảng trắng thì phần xuống dòng rơi mất, hoặc dính sang cột bên cạnh —
và "Không đủ người: bắt đầu với 2" đọc khác hẳn "Không đủ người: bắt đầu
với 2 người, mở rộng dần, không hoãn vô hạn".

Nên công cụ đọc VỊ TRÍ ký tự của từng tiêu đề cột trên dòng tiêu đề, rồi
cắt mọi dòng dưới theo đúng các vị trí ấy. Dòng nào không mở đầu bằng mã
hàng thì là phần xuống dòng — nối vào ĐÚNG cột nó nằm dưới.

ĐIỀU CÔNG CỤ NÀY KHÔNG LÀM

Không lấy cột GIÁ. Giá sống ở HP_TANG, và bộ bản vẽ ghi giá tầng 4 khác
kho. Rút giá vào đây là dựng bản thứ hai của bảng giá bằng đường máy —
khó thấy hơn chép tay, nên nguy hơn. Chỗ lệch ghi ở BV_LECH để chủ hệ
quyết, và máy vẫn đọc HP_TANG.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

GOC = Path(__file__).resolve().parent.parent


def doc_pdf(duong_dan: Path) -> list[str]:
    try:
        ra = subprocess.run(
            ['pdftotext', '-layout', str(duong_dan), '-'],
            capture_output=True, check=True)
    except FileNotFoundError:
        sys.exit('  ✗ Thiếu lệnh pdftotext. Cài: apt-get install poppler-utils')
    except subprocess.CalledProcessError as e:
        sys.exit(f'  ✗ pdftotext không đọc được tệp: {e}')
    return ra.stdout.decode('utf-8').split('\n')


def cat_bang(dong: list[str], mau_tieu_de: str, mau_khoa: str, tran: int = 90):
    """Cắt một bảng theo TOẠ ĐỘ cột của dòng tiêu đề. Trả (tên cột, các hàng)."""
    vt = [i for i, l in enumerate(dong) if re.search(mau_tieu_de, l)]
    if not vt:
        return None
    i = vt[0]
    td = dong[i]
    moc = [m.start() for m in re.finditer(r'\S(?:[^\s]|\s(?!\s))*', td)]
    moc.append(10 ** 6)
    ten = [td[moc[j]:moc[j + 1]].strip() for j in range(len(moc) - 1)]

    hang, cur = [], None
    for l in dong[i + 1:i + tran]:
        if re.match(r'^\s*[A-Z] · ', l):      # sang mục kế của tờ
            break
        # Hết tờ. Không bắt được chỗ này thì hàng CUỐI của bảng nuốt cả
        # chân trang và tiêu đề tờ sau — và nó nuốt im lặng, vì hàng
        # cuối vẫn có đủ cột nên mọi phép đếm vẫn xanh. Bản đầu tôi mắc
        # đúng lỗi ấy: trần công suất của Tầng 5 mọc thêm một dòng
        # "khổ A0 · bản v1.0 · 03/09/2026".
        if ('\f' in l or 'Đọc cùng tờ T01' in l or 'BỘ BẢN THIẾT KẾ' in l
                or 'tài liệu nội bộ' in l):
            break
        o = [l[moc[j]:moc[j + 1]].strip() for j in range(len(moc) - 1)]
        if re.match(mau_khoa, o[0]):
            if cur:
                hang.append(cur)
            cur = o[:]
        elif cur and any(o):                   # phần xuống dòng
            for j, c in enumerate(o):
                if c:
                    cur[j] = (cur[j] + ' ' + c).strip()
    if cur:
        hang.append(cur)
    return ten, hang


BANG = [
    ('capdo',   r'^\s*Cấp\s{2,}Mốc trạng thái',        r'^(0[1-9]|10)$', True),
    ('cong',    r'^\s*Cổng\s{2,}Chuyển tầng',          r'^C[1-4]$',      False),
    ('tutcap',  r'^\s*Mức hụt\s{2,}Dấu hiệu',          r'^\S.*',         False),
    ('nhip',    r'^\s*Nhịp\s{2,}Tên\s{2,}Mục đích thật', r'^(0[1-9]|10)$', False),
    ('cau',     r'^\s*Nhịp\s{2,}Tên\s{2,}Câu chuẩn',   r'^(0[1-9]|10)$', False),
    ('do',      r'^\s*Mức\s{2,}#\s{2,}Tín hiệu',       r'^Đỏ \d$',       False),
    ('trigger', r'^\s*Điều kiện kích hoạt\s{2,}',      r'^\S.*',         False),
    ('module',  r'^\s*#\s{2,}Module\s{2,}',            r'^M[1-8]$',      False),
    ('bang',    r'^\s*Bảng\s{2,}Khoá chính',           r'^[a-z_]+$',     False),
    ('vai',     r'^\s*#\s{2,}Vai trò\s{2,}Nhiệm vụ',   r'^(0[1-9]|10)$', False),
    ('cauhinh', r'^\s*Tầng\s{2,}Thời lượng\s{2,}Giá',  r'^Tầng \d$',     False),
    ('bangiao', r'^\s*Chặng bàn giao\s{2,}',           r'^\S.*→.*$',     False),
]

MA_TANG = ['T1', 'T2', 'T3', 'T4', 'T5']


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit(__doc__.strip().split('\n')[2].strip())
    pdf = Path(sys.argv[1])
    if not pdf.exists():
        sys.exit(f'  ✗ Không thấy tệp: {pdf}')

    dong = doc_pdf(pdf)
    ra: dict = {}
    for ten, td, khoa, nhieu in BANG:
        if nhieu:
            # bảng 10 cấp độ lặp lại một lần cho mỗi tầng
            vt = [i for i, l in enumerate(dong) if re.search(td, l)]
            gom = {}
            for k, i in enumerate(vt[:5]):
                r = cat_bang(dong[i:], td, khoa)
                if r:
                    gom[MA_TANG[k]] = r[1]
            ra[ten] = gom
            print(f'  · {ten:9} {sum(len(v) for v in gom.values()):3} hàng '
                  f'({len(gom)} tầng)')
        else:
            r = cat_bang(dong, td, khoa)
            if not r:
                print(f'  ⚠ {ten:9} KHÔNG THẤY BẢNG — tờ có thể đã đổi tiêu đề cột')
                continue
            ra[ten] = {'cot': r[0], 'dong': r[1]}
            print(f'  · {ten:9} {len(r[1]):3} hàng · {len(r[0])} cột')

    # Soi ngay: đủ 50 ô chưa, và ô nào thiếu bằng chứng.
    loi = []
    cap = ra.get('capdo', {})
    tong = sum(len(v) for v in cap.values())
    if tong != 50:
        loi.append(f'bảng cấp độ có {tong} ô, phải 50')
    for t, ds in cap.items():
        so = sorted(int(x[0]) for x in ds)
        if so != list(range(1, 11)):
            loi.append(f'{t} thiếu hoặc trùng cấp: {so}')
        for x in ds:
            if len(x) < 7 or not x[2]:
                loi.append(f'{t} cấp {x[0]} thiếu cột bằng chứng')
            if len(x) >= 7 and not x[6]:
                loi.append(f'{t} cấp {x[0]} thiếu cột nếu tụt nhịp')
    if loi:
        print('\n  ✗ Bộ bản vẽ đọc ra có chỗ hụt:')
        for l in loi:
            print('     ' + l)
        sys.exit(1)

    dich = GOC / 'tools' / 'ban-ve.json'
    dich.write_text(json.dumps(ra, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'\n  ✓ 50 ô cấp độ đủ · mỗi ô có bằng chứng và có đường tụt')
    print(f'  ✓ tools/ban-ve.json — chạy tiếp: node tools/dung-ban-ve.js')


if __name__ == '__main__':
    main()
