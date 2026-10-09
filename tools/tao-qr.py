#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GITA 365 — DỰNG MÃ QR CHUYỂN KHOẢN THEO CHUẨN VietQR

    python3 tools/tao-qr.py

Ra: assets/brand/qr-thanh-toan.svg  và  assets/brand/qr-thanh-toan.txt

Vì sao dựng tại chỗ thay vì gọi ảnh từ img.vietqr.io:
  · Bản máy tính chạy ngoại tuyến — gọi ra mạng là ảnh hỏng
  · Không để bên thứ ba biết ai đang mở màn hình thanh toán
  · Chính sách bảo mật của trang chỉ cho tải ảnh từ chính nó

Chuỗi mã theo EMVCo Merchant-Presented Mode, đúng cấu trúc Napas VietQR.
Tệp .txt kèm theo là chuỗi gốc để đối chiếu được bằng mắt.

⚠ QUÉT THỬ MỘT LẦN bằng ứng dụng ngân hàng trước khi đưa cho khách.
"""
import os

CHU_TK = 'TRUONG VAN QUANG'
SO_TK  = '8878719979'
BIN    = '970418'          # BIDV
DICH   = 'QRIBFTTA'        # chuyển tới tài khoản

def tlv(ma, gt):
    """Một trường EMVCo: mã hai số + độ dài hai số + giá trị."""
    gt = str(gt)
    if len(gt) > 99:
        raise ValueError('Trường %s dài quá 99 ký tự' % ma)
    return '%s%02d%s' % (ma, len(gt), gt)

def crc16(s):
    """CRC-16/CCITT-FALSE: đa thức 0x1021, khởi tạo 0xFFFF, không đảo bit."""
    crc = 0xFFFF
    for b in s.encode('utf-8'):
        crc ^= b << 8
        for _ in range(8):
            crc = ((crc << 1) ^ 0x1021) & 0xFFFF if crc & 0x8000 else (crc << 1) & 0xFFFF
    return '%04X' % crc

def chuoi_vietqr():
    # 38 — thông tin đơn vị thụ hưởng
    ben = tlv('00', BIN) + tlv('01', SO_TK)
    tt38 = tlv('00', 'A000000727') + tlv('01', ben) + tlv('02', DICH)

    than = (
        tlv('00', '01') +      # phiên bản chuẩn
        tlv('01', '11') +      # QR tĩnh, dùng lại nhiều lần
        tlv('38', tt38) +
        tlv('53', '704') +     # VND
        tlv('58', 'VN')
    )
    than += '6304'             # mã và độ dài của trường CRC, tính CRC gồm cả bốn ký tự này
    return than + crc16(than)

def doc_lai(s):
    """Đọc ngược chuỗi để tự kiểm — bản dựng phải đọc lại ra đúng số tài khoản."""
    ra, i = {}, 0
    while i < len(s):
        ma = s[i:i+2]; n = int(s[i+2:i+4]); gt = s[i+4:i+4+n]
        ra[ma] = gt; i += 4 + n
    return ra

if __name__ == '__main__':
    import qrcode
    goc = os.path.join(os.path.dirname(__file__), '..')
    ra = os.path.join(goc, 'assets', 'brand')
    os.makedirs(ra, exist_ok=True)

    s = chuoi_vietqr()

    # Tự kiểm trước khi ghi ra
    t = doc_lai(s)
    assert t['00'] == '01', 'sai phiên bản chuẩn'
    assert t['53'] == '704', 'sai mã tiền tệ'
    assert t['58'] == 'VN', 'sai mã quốc gia'
    b = doc_lai(t['38'])
    assert b['00'] == 'A000000727', 'sai mã định danh Napas'
    assert b['02'] == DICH, 'sai mã dịch vụ'
    c = doc_lai(b['01'])
    assert c['00'] == BIN, 'sai mã ngân hàng'
    assert c['01'] == SO_TK, 'sai số tài khoản'
    assert crc16(s[:-4]) == s[-4:], 'sai CRC'

    q = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_M, border=3)
    q.add_data(s)
    q.make(fit=True)
    o = q.get_matrix()
    n = len(o)
    # Vẽ tay ra SVG: sắc nét ở mọi cỡ, nhẹ, và không cần thư viện ảnh nào
    v = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" '
         'shape-rendering="crispEdges" role="img" aria-label="Mã QR chuyển khoản GITA 365">' % (n, n),
         '<rect width="%d" height="%d" fill="#ffffff"/>' % (n, n)]
    for y in range(n):
        x = 0
        while x < n:
            if o[y][x]:
                d = x
                while d < n and o[y][d]:
                    d += 1
                v.append('<rect x="%d" y="%d" width="%d" height="1" fill="#070510"/>' % (x, y, d - x))
                x = d
            else:
                x += 1
    v.append('</svg>')
    tep = os.path.join(ra, 'qr-thanh-toan.svg')
    with open(tep, 'w', encoding='utf-8') as f:
        f.write(''.join(v))

    with open(os.path.join(ra, 'qr-thanh-toan.txt'), 'w', encoding='utf-8') as f:
        f.write(s + '\n')

    print('  Chủ tài khoản : ' + CHU_TK)
    print('  Số tài khoản  : ' + SO_TK + '  ·  BIDV (' + BIN + ')')
    print('  Chuỗi VietQR  : ' + s)
    print('  CRC           : ' + s[-4:] + '  (đã tự kiểm lại, khớp)')
    print('  Ảnh           : assets/brand/qr-thanh-toan.svg  ·  %d ô · %.1f KB'
          % (n, os.path.getsize(tep) / 1024))
    print('\n  ⚠ QUÉT THỬ MỘT LẦN bằng ứng dụng ngân hàng trước khi đưa cho khách.')
