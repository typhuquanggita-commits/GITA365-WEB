/* ═══════════════════════════════════════════════════════════════
   GITA 365 · MARKETING I18N (EN/VI)
   Bản dịch cho các trang marketing tĩnh. Thêm ngôn ngữ: chép khối 'en'
   và dịch, sau đó đăng ký vào G.MK_LANGS.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

G.MK_LANGS = [
  {k:'vi', n:'Tiếng Việt', flag:'VI'},
  {k:'en', n:'English',    flag:'EN'}
];
G.MK_LANG = 'vi';

try{
  var saved = localStorage.getItem('gita365.mk.lang');
  if(saved && G.MK_LANGS.some(function(l){return l.k===saved;})) G.MK_LANG = saved;
}catch(e){}

G.MK = {
  vi:{
    // Shared
    navHome:'Trang chủ',
    navAbout:'Về chúng tôi',
    navServices:'Dịch vụ',
    navPricing:'Bảng giá',
    navContact:'Liên hệ',
    navApp:'Mở ứng dụng',
    ctaPrimary:'Bắt đầu bảy ngày nhìn lại',
    ctaSecondary:'Xem cách GITA hoạt động',
    ctaApp:'Vào ứng dụng GITA 365',
    hotline:'Hotline',

    // Hero
    heroEyebrow:'HỆ SINH THÁI GIA ĐÌNH THỊNH VƯỢNG',
    heroH1a:'Sau 365 ngày,',
    heroH1b:'nhà bạn tự chạy',
    heroH1c:'— không cần ai đứng canh.',
    heroLead:'GITA 365 là một hệ thống đồng hành giúp gia đình Việt dựng lại nếp, giảm nhắc nhở và truyền động lực học tập cho con — bằng bản đồ có thứ tự, số liệu thật và người đồng hành đúng việc.',
    heroStat1v:'1,000+',
    heroStat1k:'kịch bản chuyên môn',
    heroStat2v:'5 tầng',
    heroStat2k:'đồng hành rõ mốc',
    heroStat3v:'365 ngày',
    heroStat3k:'để nhà tự vận hành',
    heroCardTitle:'Bảy ngày đầu, bạn không cần tin gì cả',
    heroCardLi1:'Chỉ nhìn lại nhà mình bằng số liệu thật',
    heroCardLi2:'Làm test năng lực học tập & môi trường gia đình',
    heroCardLi3:'Đọc bản đồ 5 khoang — 9 vai — 12 chặng',
    heroCardLi4:'Quyết định tiếp hay dừng, không ai thuyết phục',

    // Pain
    painEyebrow:'NỖI ĐAU PHỤ HUYNH THƯỜNG GẶP',
    painH2:'Bạn không thiếu tình thương. Bạn thiếu một bản đồ.',
    painLead:'Phần lớn cha mẹ đều cố gắng. Nhưng cố gắng không có hệ thống sẽ dẫn đến ba chỗ mắc kẹt:',
    pain1h:'Một trăm lời khuyên, không lời nào làm được',
    pain1p:'Mỗi người cho một ý. Tối đến bạn mệt mỏi vì không biết nên bắt đầu từ đâu.',
    pain2h:'Đo bằng cảm giác, nên tháng sau quên mình đã đi xa bao nhiêu',
    pain2p:'"Con ngoan hơn" là cảm giác. Số lần phải nhắc, giờ vào bàn, giờ đi ngủ mới là số liệu.',
    pain3h:'Người dẫn tốt thì nhà đổi, người dẫn nghỉ thì nhà trôi về chỗ cũ',
    pain3p:'Vì cách làm nằm trong đầu một người, không nằm trong hệ thống của chính nhà bạn.',

    // Solution
    solEyebrow:'CÁCH GITA 365 GIẢI QUYẾT',
    solH2:'Một bản đồ. Một nhịp. Một người đồng hành đúng việc.',
    solLead:'GITA 365 không phải khoá học. Đó là hệ sinh thái giúp nhà bạn tự vận hành.',
    sol1h:'Bản đồ có thứ tự',
    sol1p:'5 khoang, 9 vai, 12 chặng. Biết rõ ai làm gì, khi nào xong, xong thì trông như thế nào.',
    sol2h:'Mọi thứ đo được',
    sol2p:'Số lần nhắc, giờ ngủ, giờ học, bữa cơm chung. Con số không nói dối — và cho bạn lại quyền kiểm soát.',
    sol3h:'Người đồng hành thật',
    sol3p:'Tư vấn mở cửa, Coach đi từng chặng, Giáo viên dạy đúng chỗ cần. Mọi việc để lại dấu trên hệ thống.',
    sol4h:'Đích là nhà tự chạy',
    sol4p:'Ngày Học viện thôi nhắc mà nhà vẫn giữ nếp — đó mới là ngày xong.',

    // Benefits
    benEyebrow:'LỢI ÍCH SAU 90 NGÀY',
    benH2:'Không phải con thay đổi ngay. Là nhà bạn bắt đầu nhìn rõ.',
    ben1h:'Giảm ít nhất 1/3 số lần phải nhắc con',
    ben1p:'Việc học chuyển từ "người lớn đẩy" sang "con tự bước".',
    ben2h:'Cả nhà cùng nhìn một bảng số',
    ben2p:'Không còn tranh cãi dựa trên ký ức khác nhau của mỗi người.',
    ben3h:'Nếp giữ được trong tuần biến cố',
    ben3p:'Vì mỗi nếp đều có mức tối thiểu cho ngày mệt nhất.',
    ben4h:'Con nói được cách mình học',
    ben4p:'Không còn học thuộc. Con biết mình học bằng cách nào và tại sao.',

    // Social proof
    proofEyebrow:'PHỤ HUYNH NÓI GÌ',
    proofH2:'Những gia đình đã đi qua 90 ngày đầu',
    proofPlaceholder:'Dữ liệu testimonial sẽ được cập nhật từ hệ thống sau khi có sự đồng ý của gia đình.',

    // CTA
    ctaH2:'Bắt đầu bằng bảy ngày nhìn lại',
    ctaP:'Không mất phí, không bắt buộc đi tiếp. Chỉ cần mười phút mỗi tối để ghi lại ba dòng về nhà bạn.',

    // FAQ
    faqEyebrow:'CÂU HỎI THƯỜNG GẶP',
    faqH2:'Trả lời thẳng, kể cả những câu không có lợi khi trả lời thật',
    faq1q:'Nhà tôi bận lắm, có theo nổi không?',
    faq1a:'Mức tối thiểu là mười phút mỗi tối, đặt sao cho hôm mệt nhất vẫn làm được. Coach sẽ xếp việc theo dạng vụn thời gian của nhà bạn.',
    faq2q:'Con tôi không hợp tác thì sao?',
    faq2a:'Chặng đầu không nhắm vào con. Nhắm vào người lớn trước — vì người lớn đổi trước, con đổi sau, và luôn chậm hơn một nhịp.',
    faq3q:'Bao lâu thì thấy kết quả?',
    faq3a:'Số lần phải nhắc thường giảm rõ ở tuần 3–5. Điểm số thì muộn hơn, thường tuần 9–12. Ai hứa kết quả trong hai tuần thì đang bán hàng.',
    faq4q:'Vợ chồng tôi không cùng quan điểm?',
    faq4a:'Được, và rất nhiều nhà bắt đầu như vậy. Một người làm và ghi bảng để trên bàn ăn, không thuyết phục bằng lời. Phần lớn người còn lại nhập cuộc trong khoảng tuần thứ năm.',
    faq5q:'Dữ liệu nhà tôi có an toàn không?',
    faq5a:'Hồ sơ mỗi nhà khoá theo tài khoản. Coach của nhà nào chỉ đọc được nhà đó. Không bán, không chia sẻ, không dùng để huấn luyện AI bên ngoài.',

    // Footer
    footerBrand:'GITA 365',
    footerDesc:'Hệ sinh thái Gia đình Thịnh vượng — giúp một gia đình tự vận hành sau 365 ngày.',
    footerLinks:'Liên kết',
    footerSupport:'Hỗ trợ',
    footerLegal:'Pháp lý',
    footerCopy:'© 2026 Học viện GITA. Mọi quyền được bảo lưu.',

    // About
    aboutEyebrow:'VỀ CHÚNG TÔI',
    aboutH1:'Học viện GITA được xây cho những gia đình muốn tự chạy',
    aboutLead:'Chúng tôi không bán khóa học. Chúng tôi dựng một hệ thống để nhà bạn tự vận hành — với bản đồ, người đồng hành và dữ liệu thật.',
    founderEyebrow:'NGƯỜI SÁNG LẬP',
    founderH2:'Trương Nhật Quang',
    founderRole:'Người sáng lập & biên soạn mô thức GITA',
    founderP1:'Tôi bắt đầu GITA không phải vì biết cách cứu mọi gia đình. Tôi bắt đầu vì thấy quá nhiều nhà đang cố gắng một cách cô đơn — có tình thương, có nguồn lực, nhưng không có bản đồ.',
    founderP2:'GITA là viết tắt của Goal · Inspirits · Talent · Action. Bốn trụ này không chỉ dạy con học giỏi; chúng dạy một gia đình cách cùng nhau đi đúng hướng.',
    founderP3:'Đích cuối không phải là con lên điểm. Đích là nhà bạn tự chạy khi không còn ai đứng sau lưng nhắc.',
    timelineEyebrow:'HÀNH TRÌNH',
    timelineH2:'Từ một câu hỏi đến một hệ sinh thái',
    timeline1y:'2019',
    timeline1t:'Câu hỏi đầu tiên',
    timeline1d:'Tại sao nhiều gia đình cố gắng mà vẫn mắc kẹt ở cùng một mô thức?',
    timeline2y:'2021',
    timeline2t:'Mô thức GITA ra đời',
    timeline2d:'Bốn trụ Goal · Inspirits · Talent · Action được thử nghiệm trên hàng trăm gia đình.',
    timeline3y:'2023',
    timeline3t:'Hệ sinh thái 365 ngày',
    timeline3d:'Chuẩn hóa 5 tầng, 12 chặng, 1.000 kịch bản và nguyên tắc "nhà tự chạy".',
    timeline4y:'2026',
    timeline4t:'GITA 365 v7',
    timeline4d:'PWA đa ngôn ngữ, kho tri thức mã hóa và 15 vai vận hành trên một nền tảng.',

    // Services
    servicesEyebrow:'DỊCH VỤ',
    servicesH1:'Năm tầng đồng hành — từ nhìn rõ đến tự chạy',
    servicesLead:'Mỗi tầng có một việc riêng, một mốc hoàn thành riêng, và một cái giá nếu bỏ qua. Bạn không cần đi hết; bạn cần bắt đầu đúng tầng.',
    t1name:'Tầng 1 · Nền',
    t1desc:'Dựng lại nếp cơ bản: giờ ngủ, bữa ăn, cách nói với nhau.',
    t1out:'Bảy tối liền có nhật ký đủ ba dòng, cả nhà cùng đọc lại.',
    t2name:'Tầng 2 · Nhịp',
    t2desc:'Giữ được nhịp qua tuần bận và tuần có biến cố.',
    t2out:'Nói được một câu có số về chỗ nhà hay hỏng.',
    t3name:'Tầng 3 · Hệ thống',
    t3desc:'Nhà tự vận hành phần lớn, Coach chỉ vào ở điểm nghẽn.',
    t3out:'Nếp còn giữ được trong tuần có biến cố ở mức tối thiểu.',
    t4name:'Tầng 4 · Chiều sâu',
    t4desc:'Đi vào động lực bên trong, quan hệ, định hướng.',
    t4out:'Con tự chọn và tự bảo vệ được một mục tiêu của mình.',
    t5name:'Tầng 5 · Trao quyền',
    t5desc:'Nhà trở thành nơi nhà khác học được.',
    t5out:'Trình bày hành trình nhà mình cho một nhà mới, có bằng chứng.',

    // Pricing
    pricingEyebrow:'BẢNG GIÁ',
    pricingH1:'Chọn cửa vào phù hợp với nhà bạn',
    pricingLead:'Không bán gói trước khi hiểu nhà. Bảy ngày đầu chỉ để nhìn — chưa thu phí. Sau đó, chúng tôi mới đề xuất tầng và lộ trình.',
    p1name:'Bảy ngày nhìn lại',
    p1desc:'Dành cho gia đình muốn thử trước khi quyết định.',
    p1price:'Miễn phí',
    p1period:'',
    p1feature1:'Làm bài test năng lực học tập',
    p1feature2:'Ghi nhật ký 7 ngày',
    p1feature3:'Đọc bản đồ gia đình thịnh vượng',
    p1feature4:'Buổi đọc hồ sơ 45 phút',
    p2name:'Lộ trình 90 ngày',
    p2desc:'Dựng nếp, giảm nhắc, tạo nhịp chung cho nhà.',
    p2price:'Liên hệ',
    p2period:'theo tầng đã chọn',
    p2feature1:'Coach đồng hành 1-1',
    p2feature2:'Kho phác đồ 220+ tình huống',
    p2feature3:'Bảng số gia đình hàng tuần',
    p2feature4:'Cổng nghiệm thu mỗi chặng',
    p3name:'Lộ trình 365 ngày',
    p3desc:'Hệ thống hoàn chỉnh: từ nền đến trao quyền.',
    p3price:'Liên hệ',
    p3period:'toàn hành trình',
    p3feature1:'Tất cả lợi ích 90 ngày',
    p3feature2:'Truy cập 1.000 kịch bản chuyên môn',
    p3feature3:'Tầng 4–5: chiều sâu & trao quyền',
    p3feature4:'Mục tiêu: nhà tự chạy khi Học viện lùi lại',
    pricingNote:'Giá cuối chỉ được bàn sau bước đọc hồ sơ, khi đã biết nhà bạn cần tầng nào. Không có gói chung cho mọi nhà.',

    // Contact
    contactEyebrow:'LIÊN HỆ',
    contactH1:'Nói chuyện với một tư vấn',
    contactLead:'Bạn không cần chuẩn bị gì. Chỉ cần kể một câu về điều lo nhất trong nhà — và chúng tôi sẽ cho bạn biết GITA có phù hợp hay không.',
    contactFormName:'Họ tên',
    contactFormPhone:'Số điện thoại',
    contactFormEmail:'Email',
    contactFormTopic:'Bạn quan tâm đến',
    contactFormMessage:'Điều lo nhất trong nhà hiện tại',
    contactFormSend:'Gửi yêu cầu tư vấn',
    contactPhone:'Hotline',
    contactEmail:'Email',
    contactAddress:'Địa chỉ',
    contactHours:'Giờ làm việc',
    contactAddressVal:'TP. Hồ Chí Minh, Việt Nam',
    contactHoursVal:'Thứ Hai – Thứ Bảy · 8:00 – 18:00',

    // 404
    notFoundH1:'Trang không tìm thấy',
    notFoundP:'Có vẻ bạn đã đi lạc trong hệ sinh thái. Hãy quay về trang chủ.',
    notFoundBtn:'Về trang chủ'
  },

  en:{
    // Shared
    navHome:'Home',
    navAbout:'About',
    navServices:'Services',
    navPricing:'Pricing',
    navContact:'Contact',
    navApp:'Open app',
    ctaPrimary:'Start the 7-day review',
    ctaSecondary:'See how GITA works',
    ctaApp:'Enter GITA 365 app',
    hotline:'Hotline',

    // Hero
    heroEyebrow:'FAMILY PROSPERITY ECOSYSTEM',
    heroH1a:'After 365 days,',
    heroH1b:'your household runs itself',
    heroH1c:'— with no one standing guard.',
    heroLead:'GITA 365 is a family operating system that helps Vietnamese households rebuild rhythm, reduce reminders, and ignite their child\'s learning drive — with a sequenced map, real data, and the right companion for each stage.',
    heroStat1v:'1,000+',
    heroStat1k:'professional playbooks',
    heroStat2v:'5 tiers',
    heroStat2k:'with clear milestones',
    heroStat3v:'365 days',
    heroStat3k:'to self-operation',
    heroCardTitle:'In the first seven days, you do not have to believe anything',
    heroCardLi1:'Just look at your household with real data',
    heroCardLi2:'Take the learning-ability & family-environment assessments',
    heroCardLi3:'Read the 5-chamber · 9-role · 12-stage map',
    heroCardLi4:'Decide to continue or stop — no one persuades you',

    // Pain
    painEyebrow:'PARENT PAIN POINTS',
    painH2:'You do not lack love. You lack a map.',
    painLead:'Most parents try hard. But effort without a system leads to three traps:',
    pain1h:'A hundred pieces of advice, none actionable',
    pain1p:'Everyone has an opinion. By evening you are exhausted, not knowing where to start.',
    pain2h:'Measuring by feelings, so progress disappears',
    pain2p:'"My child behaves better" is a feeling. Reminder counts, desk time, and bedtime are data.',
    pain3h:'The family changes while the coach is there, then drifts back',
    pain3p:'Because the method lives in one person\'s head, not in your household\'s own system.',

    // Solution
    solEyebrow:'HOW GITA 365 WORKS',
    solH2:'One map. One rhythm. One right companion.',
    solLead:'GITA 365 is not a course. It is an ecosystem that makes your household self-running.',
    sol1h:'A sequenced map',
    sol1p:'5 chambers, 9 roles, 12 stages. Clear on who does what, when it is done, and what "done" looks like.',
    sol2h:'Everything measured',
    sol2p:'Reminder counts, sleep time, study time, family meals. Numbers do not lie — and they return control to you.',
    sol3h:'A real human companion',
    sol3p:'An opener, a coach for each stage, and a teacher for exactly what is needed. Everything is logged in the system.',
    sol4h:'The goal is self-operation',
    sol4p:'The finish line is the day the household keeps its rhythm after the academy steps back.',

    // Benefits
    benEyebrow:'BENEFITS AFTER 90 DAYS',
    benH2:'It is not that your child changes overnight. It is that you finally see clearly.',
    ben1h:'Reduce reminders by at least one-third',
    ben1p:'Learning shifts from "adults pushing" to "child stepping forward".',
    ben2h:'The whole family reads one scoreboard',
    ben2p:'No more arguments based on different memories of last week.',
    ben3h:'Rhythm survives a crisis week',
    ben3p:'Every habit has a minimum version for the hardest day.',
    ben4h:'Your child can explain how they learn',
    ben4p:'No more rote learning. They know their own method and why it works.',

    // Social proof
    proofEyebrow:'PARENT VOICES',
    proofH2:'Families who finished their first 90 days',
    proofPlaceholder:'Testimonials will be added from the system once families give their consent.',

    // CTA
    ctaH2:'Start with the 7-day review',
    ctaP:'Free, no obligation to continue. Just ten minutes each evening to write three lines about your household.',

    // FAQ
    faqEyebrow:'FAQ',
    faqH2:'Straight answers, including the ones that do not help us sell',
    faq1q:'We are very busy. Can we keep up?',
    faq1a:'The minimum is ten minutes each evening, set so that the hardest day is still doable. Your coach will arrange tasks around the fragments of time you actually have.',
    faq2q:'What if my child refuses to cooperate?',
    faq2a:'The first stage is not aimed at the child. It is aimed at the adults — because in a household, adults change first, children change after, always one beat slower.',
    faq3q:'How soon will we see results?',
    faq3a:'Reminder counts usually drop clearly in weeks 3–5. Grades come later, usually weeks 9–12. Anyone promising results in two weeks is selling.',
    faq4q:'My spouse and I disagree. Can this still work?',
    faq4a:'Yes, many households start this way. One person starts and posts a chart on the dining table, without trying to convince with words. Most partners join around week five.',
    faq5q:'Is our family data safe?',
    faq5a:'Each household file is locked to its account. Your coach only sees your household. We do not sell, share, or use data to train external AI.',

    // Footer
    footerBrand:'GITA 365',
    footerDesc:'The Family Prosperity Ecosystem — helping a household run itself after 365 days.',
    footerLinks:'Links',
    footerSupport:'Support',
    footerLegal:'Legal',
    footerCopy:'© 2026 GITA Academy. All rights reserved.',

    // About
    aboutEyebrow:'ABOUT US',
    aboutH1:'GITA Academy is built for families that want to run themselves',
    aboutLead:'We do not sell courses. We build a system so your household can self-operate — with a map, a companion, and real data.',
    founderEyebrow:'FOUNDER',
    founderH2:'Truong Nhat Quang',
    founderRole:'Founder & author of the GITA framework',
    founderP1:'I started GITA not because I knew how to save every family. I started because I saw too many families trying alone — with love, with resources, but without a map.',
    founderP2:'GITA stands for Goal · Inspirits · Talent · Action. These four pillars do not just teach a child to study better; they teach a family how to move in the same direction.',
    founderP3:'The finish line is not higher grades. It is the day your household keeps running after no one is standing behind it reminding you.',
    timelineEyebrow:'JOURNEY',
    timelineH2:'From one question to one ecosystem',
    timeline1y:'2019',
    timeline1t:'The first question',
    timeline1d:'Why do so many families try hard yet stay stuck in the same loop?',
    timeline2y:'2021',
    timeline2t:'The GITA framework',
    timeline2d:'The four pillars were tested with hundreds of families.',
    timeline3y:'2023',
    timeline3t:'The 365-day ecosystem',
    timeline3d:'5 tiers, 12 stages, 1,000 playbooks, and the "household self-runs" principle standardized.',
    timeline4y:'2026',
    timeline4t:'GITA 365 v7',
    timeline4d:'Multilingual PWA, encrypted knowledge vault, and 15 operating roles on one platform.',

    // Services
    servicesEyebrow:'SERVICES',
    servicesH1:'Five companion tiers — from seeing clearly to self-running',
    servicesLead:'Each tier has its own job, its own completion mark, and its own cost if skipped. You do not need to finish all of them; you need to start at the right one.',
    t1name:'Tier 1 · Foundation',
    t1desc:'Rebuild basic rhythms: sleep, meals, how family members talk to each other.',
    t1out:'Seven evenings of three-line journals, read back together.',
    t2name:'Tier 2 · Rhythm',
    t2desc:'Keep the rhythm through busy weeks and weeks with disruptions.',
    t2out:'Say one sentence with numbers about where your household usually breaks.',
    t3name:'Tier 3 · System',
    t3desc:'The household self-runs most of the time; coach only enters at bottlenecks.',
    t3out:'Rhythm survives a disruption week at the minimum-day level.',
    t4name:'Tier 4 · Depth',
    t4desc:'Go into inner drive, relationships, and direction.',
    t4out:'The child chooses and defends one of their own goals in front of the family.',
    t5name:'Tier 5 · Empowerment',
    t5desc:'The household becomes a place other households can learn from.',
    t5out:'Present your household journey to a new family, with evidence, without exaggeration.',

    // Pricing
    pricingEyebrow:'PRICING',
    pricingH1:'Choose the right door for your household',
    pricingLead:'We do not sell packages before understanding your household. The first seven days are only for seeing — no charge. Then we recommend the tier and path.',
    p1name:'7-day review',
    p1desc:'For families who want to try before deciding.',
    p1price:'Free',
    p1period:'',
    p1feature1:'Learning-ability assessment',
    p1feature2:'7-day journal',
    p1feature3:'Prosperity map reading',
    p1feature4:'45-minute profile review',
    p2name:'90-day path',
    p2desc:'Build rhythm, reduce reminders, create a shared family beat.',
    p2price:'Contact us',
    p2period:'per chosen tier',
    p2feature1:'1-1 coach companion',
    p2feature2:'220+ situation protocols',
    p2feature3:'Weekly family scoreboard',
    p2feature4:'Stage acceptance gate',
    p3name:'365-day path',
    p3desc:'The complete system: from foundation to empowerment.',
    p3price:'Contact us',
    p3period:'full journey',
    p3feature1:'All 90-day benefits',
    p3feature2:'Access to 1,000 professional playbooks',
    p3feature3:'Tiers 4–5: depth & empowerment',
    p3feature4:'Goal: household self-runs as academy steps back',
    pricingNote:'Final pricing is only discussed after the profile review, once we know which tier your household needs. There is no one-size-fits-all package.',

    // Contact
    contactEyebrow:'CONTACT',
    contactH1:'Talk to a consultant',
    contactLead:'You do not need to prepare anything. Just share one sentence about what worries you most at home — and we will tell you whether GITA is a fit.',
    contactFormName:'Full name',
    contactFormPhone:'Phone number',
    contactFormEmail:'Email',
    contactFormTopic:'You are interested in',
    contactFormMessage:'What worries you most at home right now',
    contactFormSend:'Request a consultation',
    contactPhone:'Hotline',
    contactEmail:'Email',
    contactAddress:'Address',
    contactHours:'Working hours',
    contactAddressVal:'Ho Chi Minh City, Vietnam',
    contactHoursVal:'Mon – Sat · 8:00 – 18:00',

    // 404
    notFoundH1:'Page not found',
    notFoundP:'Looks like you wandered off the map. Let\'s head back home.',
    notFoundBtn:'Back to home'
  }
};

/* Lấy chuỗi marketing theo ngôn ngữ */
G.M = function(k){
  var d = G.MK[G.MK_LANG] || G.MK.vi;
  return d[k] !== undefined ? d[k] : (G.MK.vi[k] !== undefined ? G.MK.vi[k] : k);
};

G.setMkLang = function(k){
  G.MK_LANG = k;
  try{ localStorage.setItem('gita365.mk.lang', k); }catch(e){}
  document.documentElement.lang = k === 'en' ? 'en' : 'vi';
  if(window.MK_RENDER) window.MK_RENDER();
};
