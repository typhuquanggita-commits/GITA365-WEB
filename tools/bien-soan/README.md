# BIÊN SOẠN TÀI LIỆU GỐC VÀO KHO

Ba bước, chạy lại được bất cứ lúc nào khi tài liệu gốc thay đổi.

```
python3 tools/bien-soan/rut-chu.py  <tệp.doc>   > <tệp.txt>   # rút chữ khỏi Word 97-2003
python3 tools/bien-soan/cat-bang.py '<thư mục>/*.txt'          # xem có những bảng nào
python3 tools/bien-soan/tao-kho.py                             # sinh kho-goc/data.taileu-goc.js
```

## Vì sao tự viết bộ rút chữ

LibreOffice trong môi trường dựng không mở được năm tệp `.doc` này. Bộ rút chữ
ở đây đọc thẳng cấu trúc Word 97-2003: đọc FIB trong luồng `WordDocument`, tìm
bảng mảnh (piece table) trong `1Table`, rồi ghép từng mảnh — mảnh nén đọc theo
cp1252, mảnh thường đọc theo UTF-16LE. Cách này không phụ thuộc phần mềm ngoài
và cho ra đúng chữ, kể cả tiếng Việt có dấu.

## Nguyên tắc

- **Không sửa tay** `kho-goc/data.taileu-goc.js`. Sửa tài liệu Word gốc rồi
  biên soạn lại, để kho và tài liệu không bao giờ lệch nhau.
- Bảng nào có dưới ba hàng thì bỏ qua — đó là bảng trình bày, không phải dữ liệu.
- Mỗi bảng được gắn vào mục dàn ý gần nhất phía trên nó, để đọc trong ứng
  dụng vẫn biết bảng thuộc phần nào.
