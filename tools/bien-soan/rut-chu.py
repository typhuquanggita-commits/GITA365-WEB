# -*- coding: utf-8 -*-
"""Rút chữ từ tệp Word 97-2003 (.doc) theo đúng bảng mảnh (piece table)."""
import sys, struct, olefile

def rut(duong):
    o = olefile.OleFileIO(duong)
    wd = o.openstream('WordDocument').read()
    # FIB: cờ ở 0x000A, bit 0x0200 chọn bảng 1Table hay 0Table
    co = struct.unpack_from('<H', wd, 0x000A)[0]
    ten = '1Table' if (co & 0x0200) else '0Table'
    if not o.exists(ten):
        ten = '0Table' if ten == '1Table' else '1Table'
    tb = o.openstream(ten).read()
    fcClx, lcbClx = struct.unpack_from('<II', wd, 0x01A2)
    clx = tb[fcClx:fcClx+lcbClx]

    # Bỏ qua các Prc (0x01) để tới Pcdt (0x02)
    i = 0
    while i < len(clx) and clx[i] == 0x01:
        cb = struct.unpack_from('<H', clx, i+1)[0]
        i += 3 + cb
    if i >= len(clx) or clx[i] != 0x02:
        raise RuntimeError('không thấy bảng mảnh')
    lcbPcdt = struct.unpack_from('<I', clx, i+1)[0]
    pcdt = clx[i+5:i+5+lcbPcdt]

    n = (lcbPcdt - 4) // 12          # mỗi mảnh: 4 byte CP + 8 byte PCD
    cps = list(struct.unpack_from('<%dI' % (n+1), pcdt, 0))
    ra = []
    for k in range(n):
        pcd = pcdt[4*(n+1) + 8*k : 4*(n+1) + 8*k + 8]
        fc = struct.unpack_from('<I', pcd, 2)[0]
        nen = bool(fc & 0x40000000)                 # nén = cp1252 một byte
        fc = fc & 0x3FFFFFFF
        soKy = cps[k+1] - cps[k]
        if nen:
            tho = wd[fc//2 : fc//2 + soKy]
            ra.append(tho.decode('cp1252', 'replace'))
        else:
            tho = wd[fc : fc + soKy*2]
            ra.append(tho.decode('utf-16-le', 'replace'))
    o.close()
    t = ''.join(ra)
    # Ký tự điều khiển của Word → xuống dòng / bỏ
    t = t.replace('\r', '\n').replace('\x07', '\t').replace('\x0b', '\n').replace('\x0c', '\n')
    t = ''.join(c for c in t if c == '\n' or c == '\t' or ord(c) >= 32)
    return t

if __name__ == '__main__':
    print(rut(sys.argv[1]))
