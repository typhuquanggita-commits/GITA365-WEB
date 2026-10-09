# -*- coding: utf-8 -*-
"""Biên soạn tài liệu lấy từ Google Drive vào kho GITA 365.

Tài liệu Drive về dưới dạng chữ có bảng kiểu markdown (dấu |), khác
với năm tệp Word gốc (bảng phân cách bằng tab), nên có bộ đọc riêng."""
import re, os, json, glob, sys

TEN = {
 '1787936654008': ('DR-01','Mô thức huấn luyện GITA',      'Bộ mô thức gốc của Học viện'),
 '1787936661672': ('DR-02','Nôi nuôi dưỡng nhân tài',      'Triết lý và khung nuôi dưỡng tài năng'),
 '1787936325898': ('DR-03','Giáo án coaching phụ huynh',   '5 buổi · 10 giờ coaching trực tiếp'),
 '1787900775873': ('DR-04','50 tình huống tầng 1',         'Thư viện ca nhận diện'),
 '1787936670467': ('DR-05','Quyển 1 · chương 1–2–3',       'Bộ sách nền của Học viện'),
 '1787936679680': ('DR-06','Quyển 3 · chương 6–7',         'Bộ sách nền của Học viện'),
 '1787936693584': ('DR-07','Quyển 2 · chương 4–5',         'Bộ sách nền của Học viện'),
 '1787936706009': ('DR-08','Quyển 4 · chương 8',           'Bộ sách nền của Học viện'),
 '1787936715693': ('DR-09','Quyển 5 · chương 9',           'Bộ sách nền của Học viện'),
 '1787936727619': ('DR-10','Quyển 6 · chương 10',          'Bộ sách nền của Học viện'),
}

def sach(t):
    """Bảng kiểu markdown: | ô | ô | — bỏ dòng kẻ :-: và dòng rỗng."""
    ra, hien = [], None
    for d in t.split('\n'):
        d = d.strip()
        if d.startswith('|') and d.count('|') >= 3:
            o = [x.strip() for x in d.strip('|').split('|')]
            if all(re.fullmatch(r':?-{1,}:?', x or '-') for x in o):
                continue                       # dòng kẻ
            if not any(o):
                continue                       # dòng rỗng
            if hien is None: hien = {'cot': o, 'hang': []}
            elif len(o) == len(hien['cot']): hien['hang'].append(o)
            else:
                if len(hien['hang']) >= 2: ra.append(hien)
                hien = {'cot': o, 'hang': []}
        else:
            if hien and len(hien['hang']) >= 2: ra.append(hien)
            hien = None
    if hien and len(hien['hang']) >= 2: ra.append(hien)
    return ra

def danY(t):
    ra = []
    for d in t.split('\n'):
        d = d.strip()
        if not d or len(d) > 130 or d.startswith('|'): continue
        if re.match(r'^(PHẦN|CHƯƠNG|MỤC|BÀI|BUỔI|PHỤ LỤC)\s+[IVX0-9]', d, re.I):
            ra.append({'c': 1, 't': d})
        elif re.match(r'^[IVX]{1,5}\.\s+\S', d) or re.match(r'^\d{1,2}\.\s+[A-ZĐÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯ]', d):
            ra.append({'c': 2, 't': d})
    return ra

if __name__ == '__main__':
    SP = os.environ.get('GITA_DRIVE',
        '/tmp/claude-0/-home-user-Quang-GITA/0c18496f-dc69-5c66-b565-ec9d18e49341/scratchpad/drive')
    RA = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..',
                      'kho-goc', 'data.tailieu-drive.js')
    kho = []
    for p in sorted(glob.glob(os.path.join(SP, '*.txt'))):
        ma = os.path.basename(p).replace('.txt', '')
        if ma not in TEN: continue
        mã, ten, mo = TEN[ma]
        t = open(p, encoding='utf-8').read()
        bs, dy = sach(t), danY(t)
        # đoạn văn dài: giữ để trợ lý tra được
        doan = [d.strip() for d in t.split('\n')
                if 120 <= len(d.strip()) <= 1200 and not d.strip().startswith('|')]
        # ── Bốn chỗ chặn cứng đã gỡ ──
        # Bản đầu cắt dàn ý ở 100 mục, bảng ở 40 bảng, mỗi bảng 80 hàng,
        # và đoạn văn ở 400. Đo lại thì ba tài liệu bị cắt đúng ở 400 —
        # "Nôi nuôi dưỡng nhân tài", "Quyển 1", "Quyển 3" — nghĩa là
        # phần sau của chúng chưa bao giờ vào kho. Riêng đoạn văn, gỡ
        # chặn lấy lại 702 đoạn và 243.565 ký tự.
        #
        # Chặn để tệp kho khỏi phình là đúng ý định, nhưng nó cắt im
        # lặng: không dòng cảnh báo nào, và con số "chữ gốc" trên màn
        # hình vẫn đếm theo tệp nguồn chứ không theo phần đã vào kho.
        # Người đọc thấy 510.788 chữ và tin là mình đọc được chừng ấy.
        kho.append({'ma': mã, 'ten': ten, 'mo': mo,
                    'soChu': len(t.split()),
                    'soChuKho': sum(len(d) for d in doan),   # ký tự THẬT đã vào kho
                    'danY': dy,
                    'bang': [{'cot': b['cot'], 'hang': b['hang']} for b in bs],
                    'doan': doan})
    with open(RA, 'w', encoding='utf-8') as o:
        o.write('/* ═══════════════════════════════════════════════════════════════\n')
        o.write('   GITA 365 — TÀI LIỆU HỌC VIỆN LẤY TỪ GOOGLE DRIVE\n')
        o.write('   Sinh tự động bằng tools/bien-soan/tao-kho-drive.py.\n')
        o.write('   KHÔNG sửa tay — sửa tài liệu trên Drive rồi biên soạn lại.\n')
        o.write('   ═══════════════════════════════════════════════════════════════ */\n')
        o.write("'use strict';\nvar G = window.G || {}; window.G = G;\n\n")
        o.write('G.TAILIEU_DRIVE = ' + json.dumps(kho, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print('đã ghi', RA, '· %.1f MB' % (os.path.getsize(RA)/1024/1024))
    for k in kho:
        print('  %-6s %-30s %6d chữ · %3d mục · %2d bảng · %3d đoạn' % (
            k['ma'], k['ten'][:30], k['soChu'], len(k['danY']), len(k['bang']), len(k['doan'])))
