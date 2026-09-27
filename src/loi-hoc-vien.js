/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v8.6 — BA HỆ NGÔN NGỮ

   Trước đây có hai: lời nhà mình và lời nghề. Nhưng "nhà mình" gộp chung
   phụ huynh với học viên, mà hai người ấy không đọc giống nhau.

   Bố mẹ đọc "nhà mình" thì thấy đúng — đó là nhà của họ. Một em lớp chín
   đọc "nhà mình đang mắc chuyện gì" thì thấy người ta đang nói VỀ mình
   với bố mẹ mình, chứ không nói VỚI mình. Em đóng lại.

   Nên nay có ba:

     · HỌC VIÊN (R14)              — xưng "em", nói thẳng với em, việc của em
     · PHỤ HUYNH + CỘNG TÁC VIÊN   — xưng "anh chị", nói "nhà mình"
                                      (hai vai này đọc giống nhau, anh Quang đã xác nhận)
     · ĐỘI NGŨ GITA365 (R01–R12)   — giữ nguyên thuật ngữ nghề

   Đường tra: chữ Super Admin sửa → lời học viên → lời nhà mình → chữ gốc.
   Thiếu câu nào ở lời học viên thì rơi xuống lời nhà mình, không bao giờ
   rơi thẳng ra thuật ngữ nghề.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

/* Ba nhóm. Ranh giới: R14 là học viên, R13 và R15 là nhóm phụ huynh. */
G.NHOM_NGONNGU = function(){
  var r = G.S && G.S.roleObj;
  if(!r) return 'nghe';
  if(r.id === 'R14') return 'hocvien';
  if(r.lv >= 13) return 'phuhuynh';
  return 'nghe';
};
G.LA_HOC_VIEN = function(){ return G.NHOM_NGONNGU() === 'hocvien'; };

G.NOI_HOCVIEN = {

  /* ── Tên và mô tả từng mục ── */
  'nav.bat-dau.t':'Bắt đầu từ đây',
  'nav.bat-dau.h':'Năm việc đầu tiên. Làm xong việc một rồi mới mở việc hai.',
  'nav.pham-vi.t':'Em đang mở được gì',
  'nav.pham-vi.h':'Phần em xem được bây giờ, và phần còn ở phía trước',
  'nav.ban-do.t':'Bản đồ của em',
  'nav.ban-do.h':'Em đang đứng ở đâu trên đường',
  'nav.chuyen-hoa.t':'Từ chỗ đang khó đến chỗ em muốn tới',
  'nav.chuyen-hoa.h':'Bảy chuyện đổi được, và đổi theo thứ tự nào',
  'nav.hanh-trinh-con.t':'Chặng đường của em',
  'nav.hanh-trinh-con.h':'Em đã đi tới đâu, và đang mắc ở chỗ nào',
  'nav.dong-hanh.t':'Người đi cùng em',
  'nav.dong-hanh.h':'Hỏi lúc nào cũng có người đọc và trả lời',
  'nav.wow.t':'Những lần em sẽ nhớ mãi',
  'nav.wow.h':'Bảy khoảnh khắc làm nên một năm đáng nhớ',
  'nav.lo-trinh.t':'Năm chặng của em',
  'nav.lo-trinh.h':'Bảy ngày, hai mươi mốt ngày, chín mươi ngày, rồi cả năm',
  'nav.gita-map.t':'Bốn điều em cần nhìn',
  'nav.gita-map.h':'Hiểu mình · Rèn mình · Bứt phá · Trưởng thành',
  'nav.chu-ky.t':'Bao lâu thì đổi được một thói quen',
  'nav.chu-ky.h':'Hai mươi mốt ngày để bắt đầu, chín mươi ngày để giữ',
  'nav.nhiem-vu.t':'Việc của em hôm nay',
  'nav.nhiem-vu.h':'Làm xong thì ghi lại. Ghi lại mới tính.',
  'nav.tien-bo.t':'Em đã đổi gì',
  'nav.tien-bo.h':'Tuần này so với tuần trước, xem em nhích được chỗ nào',
  'nav.kpi-toi.t':'Nhịp của em',
  'nav.kpi-toi.h':'Hôm nay em giữ được mấy nhịp, và đã đủ để lên chặng sau chưa',
  'nav.bang-viec.t':'Việc em đang giữ',
  'nav.bang-viec.h':'Việc nào đang trễ, việc nào đang làm dở, việc nào xong rồi',
  'nav.danh-muc-viec.t':'Các việc em có thể nhận',
  'nav.danh-muc-viec.h':'Chọn việc và biết trước làm xong thì cần gì để chứng minh',
  'nav.bo-test.t':'Bài kiểm tra để hiểu mình',
  'nav.bo-test.h':'Không chấm điểm giỏi kém — chỉ để biết em đang mạnh ở đâu',
  'nav.kpi-100.t':'Mười điểm về đích',
  'nav.kpi-100.h':'Mười thứ đo được, để em biết mình đã đi được bao xa',
  'nav.hanh-trinh-12.t':'Mười hai chặng em sẽ đi qua',
  'nav.hanh-trinh-12.h':'Từ buổi đầu tới lúc em sẵn sàng bước ra',
  'nav.kho-tong.t':'Kho của Học viện có gì',
  'nav.kho-tong.h':'Toàn cảnh những thứ em mở được, và những thứ Coach sẽ gửi thêm',
  'nav.thu-vien.t':'Gửi bài của em lên',
  'nav.thu-vien.h':'Ảnh, bài viết, sản phẩm em làm ra',
  'nav.minh-chung.t':'Chứng minh em đã làm',
  'nav.minh-chung.h':'Chụp lại việc em vừa làm xong. Coach xem và xác nhận.',
  'nav.tro-ly.t':'Hỏi trợ lý',
  'nav.tro-ly.h':'Có gì khó thì hỏi. Không ai chấm điểm câu hỏi của em.',
  'nav.phan-thuong.t':'Ghi nhận và phần thưởng',
  'nav.phan-thuong.h':'Em làm được gì thì được ghi nhận đúng thứ đó',
  'nav.kho-qua.t':'Kho quà của em',
  'nav.kho-qua.h':'Mở dần theo chặng em đã đi qua',
  'nav.vinh-danh.t':'Bảng vinh danh',
  'nav.vinh-danh.h':'Những việc thật các bạn đã làm được',
  'nav.ranh-gioi.t':'Sáu điều Học viện không làm',
  'nav.ranh-gioi.h':'Để em biết chỗ nào là chỗ phải gọi người lớn',
  'nav.nhan-dien.t':'Logo và màu của GITA',
  'nav.nhan-dien.h':'Ba màu, một dấu, và những điều không được làm với chúng',
  'nav.su-kien.t':'Trại và sự kiện',
  'nav.su-kien.h':'Nơi em gặp các bạn cùng đi một đường',
  'nav.ket-noi.t':'Kết nối với Học viện',
  'nav.ket-noi.h':'Nhóm chung và đường nhắn nhanh',
  'nav.ve-tinh.t':'Bạn em đã giới thiệu',
  'nav.ve-tinh.h':'Những bạn em rủ cùng đi',
  'nav.dai-su.t':'Làm đại sứ GITA',
  'nav.dai-su.h':'Kể chuyện thật của em cho bạn khác nghe',
  'nav.hoa-hong.t':'Phần thưởng khi giới thiệu',
  'nav.hoa-hong.h':'Cách tính, rõ ràng từ đầu',

  /* ── Tên thư mục ── */
  'grp.g1.t':'ĐƯỜNG CỦA EM',
  'grp.g1.s':'Em đang ở đâu, và đi tiếp hướng nào?',
  'grp.g2.t':'NĂM CHẶNG',
  'grp.g2.s':'Mỗi chặng một việc phải làm xong.',
  'grp.g3.t':'KHO CỦA EM',
  'grp.g3.s':'Thứ em mở được, và thứ Coach sẽ gửi thêm.',
  'grp.g4.t':'VIỆC MỖI NGÀY',
  'grp.g4.s':'Làm gì hôm nay để ngày mai khác đi?',
  'grp.g5.t':'CỘNG ĐỒNG',
  'grp.g5.s':'Bạn bè, trại, và những người đi cùng.',

  /* ── Câu ở cổng vào và các chỗ hay đọc nhất ── */
  'gate.orLogin':'Hoặc đăng nhập nếu em đã có tài khoản',
  'gate.loginHint':'Em đăng nhập bằng tài khoản Học viện cấp. Quên mật khẩu thì bấm dòng dưới cùng.',
  'ui.myAccount':'Tài khoản của em',
  'ui.search':'Tìm nhanh',
  'ui.compass':'La bàn'
};

/* ═══════════ CÂU CHÀO VÀ CÂU NHẮC RIÊNG ═══════════ */
G.LOI_CHAO_HV = function(ten){
  var gio = new Date().getHours();
  var buoi = gio < 11 ? 'Chào buổi sáng' : gio < 14 ? 'Chào buổi trưa'
           : gio < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
  return buoi + ', ' + ten + '. Hôm nay em làm được gì rồi?';
};

/* Sáu câu nhắc dành riêng cho học viên — không dùng chữ "nhà mình" */
G.NHAC_HOCVIEN = [
  'Việc hôm nay em đã làm chưa? Làm xong thì ghi lại, ghi lại mới tính.',
  'Ba tối liên tiếp em tự bắt đầu rồi. Tối nay nữa là thành một chuỗi.',
  'Có chỗ nào khó thì hỏi trợ lý. Không ai chấm điểm câu hỏi của em.',
  'Chụp lại việc em vừa làm xong. Coach xem và xác nhận trong một ngày.',
  'Em đang ở gần cuối chặng. Nhìn lại bảng em viết hôm đầu xem có gì khác.',
  'Hôm nay chưa làm được cũng không sao. Mai bắt đầu lại, đừng bỏ cả tuần.'
];
