# Xưởng AI ba cổng (bản thử nghiệm)

Một dòng yêu cầu vào, một bản đề xuất đã được máy kiểm ra. MetaGPT 1.0.0 làm phần viết;
xưởng làm phần chặn và kiểm; **người giữ ba cổng**.

Thư mục này hoàn toàn tách khỏi GITA365: không đọc, không ghi, không nhắc tới mã hay dữ liệu
của GITA365. Không dùng dịch vụ AI trả phí. Bản thiết kế đầy đủ nằm trong tài liệu
"Xưởng AI ba cổng · Bản thiết kế".

## Tệp

| Tệp | Việc |
|---|---|
| `chay_xuong.py` | Chạy một yêu cầu: kiểm → MetaGPT trong thư mục riêng → canh gác → quét → báo cáo |
| `vung_cam.py` | Luật chặn: tệp cấm, bí mật, chỉ mô hình cục bộ. Máy không được tự sửa tệp này |
| `test_vung_cam.py` | Kiểm thử luật chặn (7 bài) |
| `may_gia_lap.py` | Máy giả lập mô hình, chỉ để thử đường ống khi chưa có Ollama |
| `va-terminal-dong-cuoi.patch` | Vá hai lỗi treo trong công cụ dòng lệnh của MetaGPT 1.0.0 |
| `rang-buoc.txt` | Hai ràng buộc thư viện để MetaGPT 1.0.0 cài được |
| `cai-dat.sh` | Cài trên máy anh (không Docker) |
| `Dockerfile`, `docker-compose.yml` | Hộp kín: không Internet, không khoá, chỉ ghi vào `lan-chay/` (**chưa chạy thử**) |
| `cau-hinh/` | Cấu hình mô hình: Ollama trên máy, Ollama trong Docker, máy giả lập |

## Chạy

```bash
bash xuong/cai-dat.sh                       # một lần
ollama pull qwen2.5-coder:14b               # một lần, cần GPU khoảng 12 GB trở lên
cd xuong
PATH=$PWD/../.venv/bin:$PATH ../.venv/bin/python chay_xuong.py \
  "Viết công cụ dòng lệnh đổi số phút thành giờ và phút" --ten doi_gio
```

Mỗi lần chạy tạo `lan-chay/<thời điểm>-<tên>/` gồm `workspace/` (sản phẩm), `nhat-ky.txt`
và `BAO_CAO.md`. Báo cáo kết thúc bằng một trong bốn kết luận: **SẴN SÀNG CHO CỔNG 1**,
**CHƯA ĐẠT**, **KHÔNG ĐẠT**, **BỊ CHẶN**.

## Ba cổng (máy không đánh dấu được)

1. **Ghép mã:** người đọc mã, chạy thử trong máy cách ly, tự tay ghép.
2. **Phát hành:** đủ ba chữ ký trước khi tới tay khách hàng.
3. **Tiền và quyền:** không có chi tiêu, khoá hay quyền nào mới nếu người chưa cấp.

## Điều quan trọng nhất

Tác tử của MetaGPT 1.0 **tự chạy lệnh trên máy và ghi tệp ở bất cứ đâu nó với tới**.
Lớp canh gác của xưởng bắt được việc ghi ra ngoài trong thư mục xưởng, nhưng không bắt được
mọi nơi trên ổ đĩa. Khi dùng mô hình thật, hãy chạy trong hộp kín (`docker-compose.yml`)
hoặc một máy riêng không chứa khoá, không chứa mã GITA365.
