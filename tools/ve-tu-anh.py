#!/usr/bin/env python3
# ═══════════════════════════════════════════════════════════════
#  GITA 365 — DỰNG TRANH MÀU TỪ MỘT TẤM ẢNH THẬT
#
#  Chủ hệ chốt 9.99.27: "tạo ảnh vẽ màu sắc nét và tạo dựng từ hình
#  người thật để có 90% nét tương đồng."
#
#  ══ VÌ SAO VIỆC NÀY LÀM ĐƯỢC, TRONG KHI SINH ẢNH THÌ KHÔNG ══
#
#  Sinh ra một người chưa từng có là ĐOÁN — phải có một bộ tạo ảnh, và
#  cửa đi ra ấy còn chờ hai bí mật của chủ hệ.
#
#  Còn chuyện này là ĐỌC: mỗi điểm ảnh đã có sẵn màu của nó, việc của
#  công cụ chỉ là gộp các màu gần nhau thành mảng và kẻ lại đường biên.
#  Không đoán một điểm ảnh nào, nên không cần bộ tạo ảnh nào, và nét
#  tương đồng giữ được cao — hình vẫn là hình ấy, chỉ đổi CHẤT.
#
#  ══ BA LƯỢT, VÀ THỨ TỰ LÀ QUAN TRỌNG ══
#
#  1. LÀM PHẲNG trước khi gộp màu. Da người có hạt; gộp màu thẳng trên
#     hạt thì ra những đốm loang, không ra mảng. Lọc trung vị xoá hạt
#     mà GIỮ biên — khác hẳn làm mờ, vốn xoá cả biên.
#
#  2. GỘP MÀU. Đây là lượt biến ảnh chụp thành tranh: một khuôn mặt vài
#     nghìn sắc độ còn lại mươi mảng màu phẳng. Ít màu quá thì mặt vỡ
#     thành từng mảng loang lổ; nhiều màu quá thì vẫn là ảnh chụp hơi
#     mờ. Mười bốn là chỗ mặt còn đọc ra người mà mảng đã ra mảng.
#
#  3. KẺ BIÊN từ ảnh GỐC, không từ ảnh đã gộp. Ảnh đã gộp có biên giả
#     ở chỗ hai mảng gặp nhau — kẻ theo đó thì ra một mạng lưới ô, chứ
#     không ra nét vẽ. Biên thật nằm trong ảnh gốc.
#
#  Chạy:  python3 tools/ve-tu-anh.py <ảnh vào> <ảnh ra> [số màu]
# ═══════════════════════════════════════════════════════════════
import sys, os
from PIL import Image, ImageFilter, ImageEnhance, ImageOps, ImageChops

SO_MAU = 22          # số mảng màu, xem chú giải lượt 2
NGUONG_BIEN = 36     # dưới ngưỡng này thì không phải nét, chỉ là nhiễu


def dung_tranh(vao, ra, so_mau=SO_MAU):
    goc = Image.open(vao).convert('RGBA')
    alpha = goc.getchannel('A')
    rgb = goc.convert('RGB')

    # ── 1 · LÀM PHẲNG ────────────────────────────────────────────
    # Trung vị hai lượt: một lượt nhỏ xoá hạt, một lượt to gộp mảng.
    # Một lượt to duy nhất thì mắt và miệng bị nuốt mất — đó là chỗ
    # nét tương đồng sống hay chết.
    phang = rgb.filter(ImageFilter.MedianFilter(size=3))
    phang = phang.filter(ImageFilter.MedianFilter(size=5))
    # Một lượt mờ RẤT nhẹ sau trung vị: trung vị để lại mép bậc thang ở
    # chỗ hai mảng gặp nhau, và bậc thang ấy sau khi gộp màu thành viền
    # răng cưa. Mờ 0,8 đủ xoá bậc mà chưa chạm tới nét thật.
    phang = phang.filter(ImageFilter.GaussianBlur(radius=0.8))
    # Nâng bão hoà TRƯỚC khi gộp màu: gộp xong mới nâng thì mấy mảng
    # đã dính vào nhau rồi, nâng chỉ làm chúng chói lên cùng một lượt.
    phang = ImageEnhance.Color(phang).enhance(1.20)

    # ── 2 · GỘP MÀU ──────────────────────────────────────────────
    # MAXCOVERAGE chọn màu trải đều cả dải, không dồn vào vùng đông
    # điểm ảnh nhất. Với chân dung, vùng đông nhất luôn là NỀN — để
    # phương pháp mặc định chọn thì gần hết bảng màu đi vào cái nền.
    manh = phang.quantize(colors=so_mau, method=Image.MAXCOVERAGE)
    manh = manh.convert('RGB')
    # Bào nốt mấy mảng một-hai điểm ảnh mà phép gộp để lại. Không bào
    # thì mặt và áo rỗ đốm, và đốm đọc ra là ảnh hỏng chứ không đọc ra
    # là chất liệu.
    manh = manh.filter(ImageFilter.MedianFilter(size=3))

    # ── 3 · KẺ BIÊN TỪ ẢNH GỐC ───────────────────────────────────
    # LÀM MỜ TRƯỚC KHI DÒ. Dò biên trên ảnh sắc thì mỗi hạt da thành
    # một nét, và tấm phủ đầy đốm — đúng chỗ bản đầu hỏng. Mờ 1,2 xoá
    # hạt mà giữ nguyên biên thật, vì biên thật rộng hơn hạt nhiều lần.
    xam = rgb.convert('L').filter(ImageFilter.GaussianBlur(radius=1.7))
    bien = xam.filter(ImageFilter.FIND_EDGES)
    # Cắt ngưỡng: giữ nét, bỏ nhiễu. Không cắt thì cả tấm phủ một lớp
    # bụi xám và tranh trông bẩn chứ không trông có nét.
    bien = bien.point(lambda v: 255 if v >= NGUONG_BIEN else 0)
    # ── ĐÃ THỬ BÀO ĐỐM BẰNG PHÉP CO-NỞ, VÀ ĐÓ LÀ MỘT LÝ LẼ SAI ──
    # Tôi viết: "co một lượt rồi nở lại; đốm nhỏ thì chết, nét thật sống
    # vì nó DÀI." Câu ấy sai. Phép co ăn theo bề RỘNG, không theo chiều
    # dài — một nét rộng một điểm ảnh chết sạch dù nó dài bao nhiêu, rồi
    # lượt nở chỉ dựng lại được mấy chỗ giao nhau dày hơn.
    # Kết quả: cả tấm viền thành NÉT ĐỨT, từng ô vuông rời. Đúng thứ
    # trông tệ hơn hẳn cái nhiễu mà nó sinh ra để chữa.
    # Chỗ chữa nhiễu thật nằm ở lượt MỜ TRƯỚC KHI DÒ ngay bên trên: hạt
    # da nhỏ hơn bán kính mờ nên tan trước khi tới phép dò, còn biên
    # thật rộng hơn nhiều lần nên đi qua nguyên vẹn. Một chỗ chữa là đủ.
    # Dày nét lên một chút — nét một điểm ảnh biến mất khi thu nhỏ,
    # mà tấm này gần như luôn được đặt nhỏ hơn khổ gốc.
    bien = bien.filter(ImageFilter.MaxFilter(size=3))
    # Làm mềm đầu nét: nét cắt ngưỡng có răng cưa, và răng cưa đọc ra
    # là ảnh hỏng chứ không đọc ra là nét bút.
    bien = bien.filter(ImageFilter.GaussianBlur(radius=0.7))

    # Nét màu nâu chì, không đen tuyệt đối: đen tuyệt đối cạnh mảng
    # màu đọc ra là viền dán vào, không đọc ra là nét vẽ.
    net = Image.new('RGB', goc.size, (44, 36, 24))
    # Nhân xuống: chỗ nào có nét thì tối đi, chỗ không có thì giữ nguyên.
    mo_net = ImageOps.invert(bien)
    tranh = Image.composite(manh, ImageChops.multiply(manh, net), mo_net)

    tranh = tranh.convert('RGBA')
    tranh.putalpha(alpha)
    os.makedirs(os.path.dirname(ra) or '.', exist_ok=True)
    tranh.save(ra, optimize=True)
    return tranh.size


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print('Dùng: python3 tools/ve-tu-anh.py <ảnh vào> <ảnh ra> [số màu]')
        sys.exit(2)
    n = int(sys.argv[3]) if len(sys.argv) > 3 else SO_MAU
    w, h = dung_tranh(sys.argv[1], sys.argv[2], n)
    kb = os.path.getsize(sys.argv[2]) // 1024
    print('✓ %s · %d×%d · %d KB · %d mảng màu' % (sys.argv[2], w, h, kb, n))
