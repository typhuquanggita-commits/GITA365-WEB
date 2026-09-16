# -*- coding: utf-8 -*-
"""Cắt các bảng phân cách bằng tab ra khỏi tài liệu Word đã rút chữ.
   Mỗi bảng giữ riêng tiêu đề cột của chính nó."""
import re, sys, json, glob, os

def cac_bang(txt):
    ra = []
    for dong in txt.split('\n'):
        if dong.count('\t') < 4: continue
        o = dong.split('\t')
        if not o[0].strip(): continue
        # tiêu đề = chuỗi ô liên tiếp không rỗng ở đầu dòng
        tieu = []
        for x in o:
            if x.strip() == '': break
            tieu.append(x.strip())
        n = len(tieu)
        if n < 5 or n > 14: continue
        if re.match(r'^\d+$', tieu[0]): continue      # dòng đầu là số → không phải tiêu đề
        con = [x.strip() for x in o[n:] if x.strip() != '']
        hang = []
        for i in range(0, len(con) - n + 1, n):
            m = con[i:i+n]
            if not re.match(r'^\d+$', m[0]): continue
            hang.append(m)
        if len(hang) >= 3:
            ra.append({'cot': tieu, 'hang': hang})
    return ra

def gonNhom(txt):
    """Bắt tên nhóm (I. NHÓM …) để gán cho bảng đứng ngay sau."""
    nhom, hien = [], ''
    for dong in txt.split('\n'):
        m = re.match(r'^([IVX]+)\.\s*(NHÓM.*|.*NHÓM.*)$', dong.strip())
        if m: hien = dong.strip()
        nhom.append(hien)
    return nhom

if __name__ == '__main__':
    for f in sorted(glob.glob(sys.argv[1])):
        t = open(f, encoding='utf-8').read()
        bs = cac_bang(t)
        tong = sum(len(b['hang']) for b in bs)
        print('%-50s %2d bảng · %4d hàng' % (os.path.basename(f)[:50], len(bs), tong))
        for b in bs[:3]:
            print('     [%2d hàng] %s' % (len(b['hang']), ' | '.join(b['cot'])[:110]))
