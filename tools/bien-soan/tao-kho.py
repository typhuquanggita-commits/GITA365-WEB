# -*- coding: utf-8 -*-
"""Biên soạn năm tài liệu gốc thành tệp dữ liệu cho kho GITA 365."""
import re, os, sys, json, glob
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from soan import cac_bang

DOC = os.environ.get('GITA_DOC', 'tai-lieu-goc')
RA  = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'kho-goc', 'data.taileu-goc.js')

TEN = {
 'c921171e': ('TG-01','50 trường hợp tầng 1',        'Thư viện ca tầng 1 — nhận diện', 1),
 'adc76922': ('TG-02','550 tình huống năm tầng',      'Thư viện ca đủ năm tầng',        0),
 'f78bf61f': ('TG-03','Hệ thống giải pháp GITA 365',  'Khung 8×8, quy trình 12 bước, RACI, quality gate', 0),
 'f9824ea4': ('TG-04','Hệ thống Coach PH 365 ngày',   'Hai mươi mốt phần vận hành huấn luyện cả năm', 0),
 '6161ce52': ('TG-05','Phát triển học viên 5 tầng',   'Kiến trúc hành trình, hồ sơ chuẩn, 25 bài đánh giá', 0),
}

def dan_de(txt):
    """Lấy dàn ý: PHẦN / CHƯƠNG / mục La Mã."""
    ra = []
    for i, d in enumerate(txt.split('\n')):
        d = d.strip()
        if not d or len(d) > 150 or '\t' in d: continue
        if re.match(r'^(PHẦN|CHƯƠNG|PHỤ LỤC)\s', d):
            ra.append({'c': 1, 't': d, 'i': i})
        elif re.match(r'^[IVX]{1,5}\.\s+\S', d) and d.upper() == d:
            ra.append({'c': 2, 't': d, 'i': i})
    return ra

kho = []
for f in sorted(glob.glob(os.path.join(DOC, '*.txt'))):
    ma = os.path.basename(f)[:8]
    if ma not in TEN: continue
    mã, ten, mo, tang = TEN[ma]
    t = open(f, encoding='utf-8').read()
    dong = t.split('\n')
    dan = dan_de(t)
    bs = cac_bang(t)

    # gán mỗi bảng vào mục gần nhất phía trên
    viTri = {}
    for i, d in enumerate(dong):
        if d.count('\t') >= 4: viTri.setdefault(d[:60], i)
    for b in bs:
        khoa = ('\t'.join(b['cot']))[:60]
        vt = viTri.get(khoa, 0)
        muc = ''
        for m in dan:
            if m['i'] <= vt: muc = m['t']
            else: break
        b['muc'] = muc

    kho.append({
        'ma': mã, 'ten': ten, 'mo': mo, 'tang': tang,
        'soChu': len(t.split()), 'soTrang': None,
        'danY': [{'c': m['c'], 't': m['t']} for m in dan][:120],
        'bang': [{'muc': b['muc'], 'cot': b['cot'], 'hang': b['hang']} for b in bs]
    })

with open(RA, 'w', encoding='utf-8') as o:
    o.write('/* ═══════════════════════════════════════════════════════════════\n')
    o.write('   GITA 365 — TÀI LIỆU GỐC CỦA HỌC VIỆN, ĐÃ BIÊN SOẠN VÀO KHO\n')
    o.write('   Sinh tự động từ năm tệp Word gốc bằng tools/bien-soan.js.\n')
    o.write('   KHÔNG sửa tay tệp này — sửa tài liệu gốc rồi biên soạn lại.\n')
    o.write('   ═══════════════════════════════════════════════════════════════ */\n')
    o.write("'use strict';\nvar G = window.G || {}; window.G = G;\n\n")
    o.write('G.TAILIEU_GOC = ' + json.dumps(kho, ensure_ascii=False, separators=(',', ':')) + ';\n')

print('đã ghi', RA)
print('%d tài liệu · %d bảng · %d hàng · %.1f MB' % (
    len(kho), sum(len(k['bang']) for k in kho),
    sum(len(b['hang']) for k in kho for b in k['bang']),
    os.path.getsize(RA)/1024/1024))
for k in kho:
    print('  %-6s %-32s %3d mục dàn ý · %3d bảng · %4d hàng' % (
        k['ma'], k['ten'][:32], len(k['danY']), len(k['bang']),
        sum(len(b['hang']) for b in k['bang'])))
