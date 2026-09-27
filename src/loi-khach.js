/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v7.9 — HAI HỆ NGÔN NGỮ
   Cùng một màn hình, hai cách gọi tên:

     · Phụ huynh, học viên, cộng tác viên (bậc 13–15) đọc LỜI NHÀ MÌNH —
       tiếng thường ngày, nói việc cần làm, không có thuật ngữ hệ thống.
     · Tư vấn trở lên (bậc 1–12) đọc LỜI NGHỀ — giữ nguyên thuật ngữ
       chuyên môn và thuật ngữ hệ thống đang dựng.

   Không dịch máy, không thay chữ tự động. Mỗi câu dành cho khách hàng
   đều viết tay ở đây, để không bao giờ ra một câu ngô nghê.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

/* Bậc 13 trở xuống là khách hàng. Ranh giới nằm đúng ở Tư vấn. */
G.LA_KHACH = function(){
  var r = G.S && G.S.roleObj;
  return !!(r && r.lv >= 13);
};

/* Khoá giống hệt khoá của bộ sửa nội dung, nên Super Admin sửa được cả hai hệ. */
G.NOI_KHACH = {

  /* ── Tên và mô tả từng mục ──
     Viết như một người ngồi cạnh nói với gia đình, không như nhãn dán
     lên một chức năng. Câu ngắn dài khác nhau, có câu hỏi, có câu kể —
     vì người thật nói chuyện không đều tăm tắp. ── */
  'nav.bat-dau.t':'Bắt đầu từ đâu',
  'nav.bat-dau.h':'Năm việc đầu. Làm xong việc một rồi hãy mở việc hai.',
  'nav.pham-vi.t':'Nhà mình mở được gì',
  'nav.pham-vi.h':'Đang xem được tới đâu, và cái gì còn ở phía trước',
  'nav.ban-do.t':'Bản đồ nhà mình',
  'nav.ban-do.h':'Nhà mình đang đứng ở khoang nào',
  'nav.chan-dung-nha.t':'Nhà mình có những ai',
  'nav.chan-dung-nha.h':'Mỗi người một tính, biết rõ rồi mới nói chuyện được với nhau',
  'nav.dinh-vi.t':'Hôm nay nhà mình ra sao',
  'nav.dinh-vi.h':'Nhìn bằng con số đã ghi, không nhìn bằng cảm giác',
  'nav.tam-nhin.t':'Nhà mình muốn thành nhà thế nào',
  'nav.tam-nhin.h':'Cả nhà ngồi viết. Không ai viết hộ ai.',
  'nav.chuyen-hoa.t':'Từ chỗ đang khổ đến chỗ mong muốn',
  'nav.chuyen-hoa.h':'Bảy chuyện đổi được, và đổi theo thứ tự nào',
  'nav.hanh-trinh-con.t':'Chặng đường của con',
  'nav.hanh-trinh-con.h':'Con đã đi được tới đâu, và đang mắc ở chỗ nào',
  'nav.diem-cham.t':'Lúc con cần mình nhất',
  'nav.diem-cham.h':'Chín khoảnh khắc bỏ lỡ là khó lấy lại',
  'nav.dong-hanh.t':'Người đi cùng nhà mình',
  'nav.dong-hanh.h':'Hỏi lúc nào cũng có người đọc và trả lời',
  'nav.wow.t':'Những lần cả nhà nhớ mãi',
  'nav.wow.h':'Bảy khoảnh khắc làm nên một năm đáng nhớ',
  'nav.lo-trinh.t':'Năm chặng đường',
  'nav.lo-trinh.h':'Bảy ngày, hai mươi mốt ngày, chín mươi ngày, rồi cả năm',
  'nav.gita-map.t':'Bốn điều cần nhìn',
  'nav.gita-map.h':'Con thiếu mục tiêu, thiếu động lực, thiếu kỹ năng, hay chỉ thiếu bắt tay vào làm',
  'nav.chu-ky.t':'Nhịp hai mươi mốt ngày',
  'nav.chu-ky.h':'Làm từng đợt ngắn. Xong đợt nào ngồi lại xem đợt đó.',
  'nav.nhiem-vu.t':'Việc hôm nay',
  'nav.nhiem-vu.h':'Hôm nay làm gì, và ghi lại một dòng cho mình',
  'nav.tien-bo.t':'Nhà mình đã đổi gì',
  'nav.tien-bo.h':'Tuần này so với tuần trước, xem nhà mình nhích được chỗ nào',
  'nav.kpi-toi.t':'Nhịp của nhà mình',
  'nav.kpi-toi.h':'Hôm nay nhà mình giữ được mấy nhịp, và đã đủ để xét lên tầng chưa',
  'nav.bang-viec.t':'Việc nhà mình đang giữ',
  'nav.bang-viec.h':'Việc nào đang trễ, việc nào đang làm dở, việc nào xong rồi',
  'nav.danh-muc-viec.t':'Các việc nhà mình có thể nhận',
  'nav.danh-muc-viec.h':'Chọn việc và biết trước làm xong thì cần gì để chứng minh',
  'nav.bo-test.t':'Bài để hiểu mình',
  'nav.bo-test.h':'Làm xong sẽ biết nhà mình mạnh chỗ nào, hụt chỗ nào',
  'nav.kpi-100.t':'Mười cột mốc về đích',
  'nav.kpi-100.h':'Qua đủ mười mốc là trọn một năm',
  'nav.thu-vien.t':'Kho tài liệu chung',
  'nav.thu-vien.h':'Có tài liệu hay thì gửi lên, nhà khác dùng lại được',
  'nav.minh-chung.t':'Gửi ảnh việc đã làm',
  'nav.minh-chung.h':'Chụp lại rồi gửi. Thầy cô xem và xác nhận cho nhà mình.',
  'nav.nhan-dien.t':'Logo và màu GITA',
  'nav.nhan-dien.h':'Để nhận ra đâu là tài liệu thật của Học viện',
  'nav.chin-vai.t':'Chín việc trong nhà',
  'nav.chin-vai.h':'Ai đang gánh việc gì, và ai đang đứng ngoài',
  'nav.thoi-quen.t':'Nếp nhà',
  'nav.thoi-quen.h':'Bốn nếp giữ cho cả năm không đứt quãng',
  'nav.cu-hich.t':'Việc lớn tạo bước nhảy',
  'nav.cu-hich.h':'Có lúc phải làm một đợt mạnh, không nhích từng chút được',
  'nav.bang-so.t':'Bảng số nhà mình',
  'nav.bang-so.h':'Bảy con số nói thật nhà mình đang tiến hay đang lùi',
  'nav.phan-thuong.t':'Ghi công và phần thưởng',
  'nav.phan-thuong.h':'Làm được thì phải có người thấy, và có phần thưởng',
  'nav.kho-qua.t':'Tài liệu tặng nhà mình',
  'nav.kho-qua.h':'Mắc ở đâu thì mở đúng tài liệu ở đó',
  'nav.vinh-danh.t':'Chuyện vui trong năm',
  'nav.vinh-danh.h':'Việc tốt trong nhà cần được kể ra, không để trôi qua',
  'nav.ranh-gioi.t':'Sáu điều không bao giờ làm',
  'nav.ranh-gioi.h':'Kể cả khi anh chị yêu cầu, ở đây cũng không làm sáu điều này',
  'nav.ve-tinh.t':'Người quanh nhà mình',
  'nav.ve-tinh.h':'Ai đang đi cùng nhà mình chặng này',
  'nav.su-kien.t':'Sự kiện và lửa trại',
  'nav.su-kien.h':'Chỗ các gia đình gặp nhau ngoài đời',
  'nav.ket-noi.t':'Kết nối với GITA',
  'nav.ket-noi.h':'Nhận tin, vào nhóm, hỏi khi cần',
  'nav.dai-su.t':'Kể chuyện nhà mình',
  'nav.dai-su.h':'Chuyện thật của nhà mình mở được cánh cửa cho nhà khác',
  'nav.hoa-hong.t':'Giới thiệu và phần thưởng',
  'nav.hoa-hong.h':'Bốn mức. Cao nhất mười phần trăm, không có ngoại lệ.',

  /* ── Tên nhóm trong thanh trái ── */
  'nhom.g1.t':'BẢN ĐỒ NHÀ MÌNH',
  'nhom.g1.s':'Nhà mình đang ở đâu, và muốn đi tới đâu?',
  'nhom.g2.t':'NĂM CHẶNG ĐƯỜNG',
  'nhom.g2.s':'Đi theo thứ tự nào để không hụt hơi giữa chừng?',
  'nhom.g3.t':'TÀI LIỆU CỦA NHÀ MÌNH',
  'nhom.g3.s':'Mắc chỗ nào, mở đúng tài liệu chỗ đó',
  'nhom.g4.t':'VIỆC HÔM NAY VÀ NẾP NHÀ',
  'nhom.g4.s':'Làm gì hôm nay để tháng sau nhà mình khác đi?',
  'nhom.g5.t':'NGƯỜI QUANH NHÀ MÌNH',
  'nhom.g5.s':'Ai đang đi cùng, và mình kể chuyện này với ai?',

  'nhom.g1.e':'Trước khi sửa bất cứ điều gì, nhìn cho đúng đã. Bảy ngày đầu chưa sửa gì cả.',
  'nhom.g2.e':'Bảy ngày để nhìn. Hai mươi mốt ngày để hiểu vì sao. Chín mươi ngày để dựng nếp. Rồi cả năm để nếp ấy tự chạy.',
  'nhom.g3.e':'Nhà mình mắc ở đâu thì có tài liệu ở đó. Không phải đọc hết, chỉ đọc đúng chỗ đang cần.',
  'nhom.g4.e':'Việc nhỏ làm mỗi ngày, nếp giữ mỗi tuần, và vài lần một năm làm một đợt mạnh.',
  'nhom.g5.e':'Coach đi cùng nhà mình, các gia đình khác đi cùng nhau, và chuyện của nhà mình mở đường cho nhà tiếp theo.',

  /* ── Chữ giao diện ── */
  'chu.fiveGroups':'CÁC PHẦN CHÍNH',
  'chu.myAccount':'Tài khoản của tôi',
  'chu.logout':'Đăng xuất',
  'chu.changePw':'Đổi mật khẩu',
  'chu.sync':'Cập nhật với GITA',
  'chu.compass':'Điều nhà mình tin',
  'chu.search':'Tìm việc, tài liệu, mục cần xem…'
};

/* Chữ trên dải phạm vi ở thanh trái — hai hệ nói hai kiểu */
/* Tham số thứ ba là số mục CHỜ TẦNG: quyền vai đã đủ, chỉ thiếu gói nội
   dung của tầng chưa mở. Khách hàng chỉ được nghe con số ấy.

   Con số thứ hai (tổng số mục ngoài tầm) gộp cả kho nghề, tài chính và
   quản trị — những thứ một phụ huynh sẽ không bao giờ tới lượt. Nói
   "86 mục chưa tới lượt" với họ là hứa một thứ không bao giờ tới, và là
   đếm to danh mục nội bộ ngay trên thanh điều hướng của khách. */
G.LOI_PHAM_VI = function(mo, khoa, choTang){
  if(G.LA_KHACH())
    return {
      nhan: (G.S.roleObj && G.S.roleObj.n) || '',
      phu:  '',
      so:   '<b>' + mo + '</b> mục đang mở' +
            (choTang ? ' · <span class="pv-khoa">' + choTang + ' mục mở ở tầng sau</span>' : '')
    };
  return {
    nhan: (G.S.roleObj && G.S.roleObj.n) || '',
    phu:  'bậc ' + ((G.S.roleObj && G.S.roleObj.lv) || '—'),
    so:   '<b>' + mo + '</b> màn hình mở' +
          (khoa ? ' · <span class="pv-khoa">' + khoa + ' màn ngoài phạm vi</span>' : ' · toàn quyền')
  };
};

/* Câu chào sau khi đăng nhập — khách hàng không cần nghe chuyện "mở gói" */
G.LOI_CHAO = function(ten){
  if(G.LA_HOC_VIEN && G.LA_HOC_VIEN() && G.LOI_CHAO_HV) return G.LOI_CHAO_HV(ten);
  if(G.LA_KHACH()) return 'Chào ' + ten + ' — mọi thứ đã sẵn sàng.';
  var K = G.KHO || {};
  return 'Chào ' + ten + ' · ' + ((G.S.roleObj && G.S.roleObj.n) || '') +
    (K.cheDoMau ? ' · chế độ mẫu' : ' · đã mở ' + (K.daNap || []).length + ' gói');
};
